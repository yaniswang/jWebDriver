'use strict';
const net = require('net');
const http = require('http');
const url = require('url');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const extend = require('xtend');

const defaultConfig = {
    hosts: ''
};

const HostsProxyServer = function(){
    let self = this;
    return self._init.apply(self, arguments);
};
util.inherits(HostsProxyServer, EventEmitter);

const HostsProxyServerPrototype = HostsProxyServer.prototype;

HostsProxyServerPrototype._init = function(config){
    let self = this;
    config = extend({}, defaultConfig, config);

    self.port = null;
    self.workPort = null;
    self.httpPort = null;

    self._portSever = null;
    self._httpServer = null;

    if(config.mode === 'forward'){
        self.setForward(config.forwardHost, config.forwardPort);
    }
    else{
        self.setHosts(config.hosts);
    }
};

// set hosts
HostsProxyServerPrototype.setHosts = function(strHosts){
    let self = this;
    self.forwardHost = null;
    self.forwardPort = null;
    let mapHosts = {};
    let arrLines = strHosts.split(/\r?\n/);
    arrLines.forEach(function(line){
        let match = line.match(/^\s*([\da-z\-\.]{3,})\s+([^#]+)/i);
        if(match){
            match[2].trim().split(/\s+/).forEach(function(domain){
                domain = domain.toLowerCase();
                if(mapHosts[domain] === undefined){
                    mapHosts[domain] = match[1];
                }
            });
        }
    });
    self._mapHosts = mapHosts;
};

// set forward proxy
HostsProxyServerPrototype.setForward = function(forwardHost, forwardPort){
    let self = this;
    self.forwardHost = forwardHost;
    self.forwardPort = forwardPort;
};

// get new hostname
HostsProxyServerPrototype._getNewHostname = function(hostname){
    let self = this;
    let mapHosts = self._mapHosts;
    for(let domain in mapHosts){
        if(shExpMatch(hostname, domain)){
            return mapHosts[domain];
        }
    }
    return hostname;
};

// start proxy server
HostsProxyServerPrototype.listen = function(port, callback){
    let self = this;
    self.port = port;

    if(callback !== undefined){
        self.on('ready', callback);
    }
    // create port proxy
    let portSever = self._portSever = net.createServer(function(client) {
        let forwardPort = self.forwardPort || self.httpPort;
        let forwardHost = self.forwardHost || '127.0.0.1';
        let forwardServer = net.connect(forwardPort, forwardHost, function() {
            forwardServer.pipe(client);
        });
        client.pipe(forwardServer);
        forwardServer.on('error', function(err){
            client.end();
            self.emit('error', err);
        });
        client.on('error', function(err){
            forwardServer.end();
            self.emit('error', err);
        });
    });
    let mapConnection1 = self._mapConnection1 = {};
    portSever.on('connection', function(conn){
        let key = conn.remoteAddress + ':' + conn.remotePort;
        mapConnection1[key] = conn;
        conn.on('close', function() {
            delete mapConnection1[key];
        });
    });
    portSever.listen(port, '0.0.0.0', function() {
        let workPort = self.workPort =portSever.address().port;
        self.emit('ready', {
            port: workPort
        });
    });
    portSever.on('error', function(err){
        self.emit('error', err);
    });
    // create http proxy
    let httpServer = self._httpServer = http.createServer(function (clientRequest, clientResponse) {
        let urlInfo = url.parse(clientRequest.url);
        let userIp = clientRequest.connection.remoteAddress ||
            clientRequest.socket.remoteAddress ||
            clientRequest.connection.socket.remoteAddress;
        clientRequest.headers['X-Forwarded-For'] = userIp;
        let reqOptions = {
            hostname: self._getNewHostname(urlInfo.hostname),
            port: urlInfo.port || 80,
            method: clientRequest.method,
            path: urlInfo.path,
            headers: clientRequest.headers,
            agent: false
        };
        let remoteServer = http.request(reqOptions, function (remoteResponse) {
            clientResponse.writeHead(remoteResponse.statusCode, remoteResponse.headers);
            remoteResponse.pipe(clientResponse);
        });
        remoteServer.on('error', function (err) {
            clientResponse.end();
            self.emit('error', err);
        });
        clientRequest.pipe(remoteServer);
    });
    // create https proxy
    httpServer.on('connect', function (httpRequest, reqSocket) {
        let urlInfo = url.parse('http://' + httpRequest.url);
        let remoteSocket = net.connect(urlInfo.port, self._getNewHostname(urlInfo.hostname), function () {
            reqSocket.write("HTTP/1.1 200 Connection established\r\n\r\n");
            remoteSocket.pipe(reqSocket).pipe(remoteSocket);
        });
        remoteSocket.on('error', function (err) {
            reqSocket.end();
            self.emit('error', err);
        });
    });
    httpServer.on('error', function(err){
        self.emit('error', err);
    });
    let mapConnection2 = self._mapConnection2 = {};
    httpServer.on('connection', function(conn){
        let key = conn.remoteAddress + ':' + conn.remotePort;
        mapConnection2[key] = conn;
        conn.on('close', function() {
            delete mapConnection2[key];
        });
    });
    httpServer.listen(0, '0.0.0.0', function() {
        let httpPort = self.httpPort = httpServer.address().port;
        self.emit('httpReady', {
            port: httpPort
        });
    });
};

// close proxy
HostsProxyServerPrototype.close = function(callback){
    let self = this;
    let httpServer = self._httpServer;
    let portSever = self._portSever;
    if(httpServer !== null){
        let closeCount = 0;
        httpServer.close(checkAllClose);
        portSever.close(checkAllClose);
        // destroy all connection
        let mapConnection1 = self._mapConnection1;
        for (let key in mapConnection1){
            mapConnection1[key].destroy();
        }
        let mapConnection2 = self._mapConnection2;
        for (let key in mapConnection2){
            mapConnection2[key].destroy();
        }
        function checkAllClose(){
            closeCount ++;
            if(closeCount == 2){
                callback && callback();
                self._httpServer = null;
                self._portSever = null;
                self.emit('close');
            }
        }
    }
};

const hostsproxy = {
    Server: HostsProxyServer,
    createServer: function(config){
        return new HostsProxyServer(config);
    }
};

// check shExp match
function shExpMatch(text, exp){
    exp = exp.replace(/\.|\*|\?/g, function(c){
        return { '.': '\\.', '*': '.*?', '?': '.' }[c];
    });
    try{
        return new RegExp('^'+exp+'$').test(text);
    }
    catch(e){
        return false;
    }
}

module.exports = hostsproxy;
