'use strict';
/**
 * A webdriver client for Node.js
 * <p>
 * You can use JWebDriver connect to local webdriver or webdriver grid.
 * </p>
 * @class JWebDriver
 */

const extend = require('xtend');
const request = require('request');
const PromiseClass = require('promiseclass');

const mapCommands = require('./commands.js');
const Browser = require('./browser');
const Elements = require('./elements');
const mixPromise = require('./mixpromise');

// color list
const colors = {
    black: '\x1b[0;30m',
    dkgray: '\x1b[1;30m',
    brick: '\x1b[0;31m',
    red: '\x1b[1;31m',
    green: '\x1b[0;32m',
    lime: '\x1b[1;32m',
    brown: '\x1b[0;33m',
    yellow: '\x1b[1;33m',
    navy: '\x1b[0;34m',
    blue: '\x1b[1;34m',
    violet: '\x1b[0;35m',
    magenta: '\x1b[1;35m',
    teal: '\x1b[0;36m',
    cyan: '\x1b[1;36m',
    ltgray: '\x1b[0;37m',
    white: '\x1b[1;37m',
    reset: '\x1b[0m'
};

// default config
const defConfig = {
	'host': '127.0.0.1',
	'port': 4444,
    'logLevel': 0, // 0: no log, 1: warning & error, 2: all log
    'nocolor': false,
    'speed': 0
};

const JWebDriver = PromiseClass.create({

    /**
     * init driver
     * @method constructor
     * @private
     * @param  {String|Object} [host] webdriver server ip or options
     * @param  {String} [port] webdriver server port
     */
    constructor(host, port) {
        let self = this;
        let options;
        if(port !== undefined){
            options = {
                host: host,
                port: port
            };
        }
        else{
            options = host;
        }
        let config = extend({}, defConfig, options);
        self.config = config;
    },

    /**
     * get webdriver server info
     * @method info
     * @public
     * @param  {Function} done callback function
     */
    info(done){
        this.execCmd('getStatus', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * save log
     * @method log
     * @public
     * @param  {COMMAND|DATA|RESULT|ERROR|WARNING|INFO} type log type
     * @param  {Object} message log message
     */
    log(type, message){
        let self = this;
        let config = self.config;
        let logLevel = config.logLevel;
        let nocolor = config.nocolor;
        if(logLevel === 2 || (logLevel === 1 && (type === 'ERROR' || type === 'WARNING'))){
            let dateString = (new Date()).toString().match(/\d\d:\d\d:\d\d/)[0];
            let mapColors = {
                'COMMAND': colors.violet,
                'DATA': colors.brown,
                'RESPONSE': colors.teal,
                'ERROR': colors.red,
                'WARNING': colors.yellow,
                'INFO': colors.white
            };
            if(nocolor === true){
                console.log('[ ' + dateString + ' ]: ', type, '\t', message);
            }
            else{
                console.log(colors.dkgray +'[ ' + dateString + ' ]: ' + colors.reset, mapColors[type] + type + colors.reset, '\t', message);
            }
        }
    },

    /**
     * sleep sync
     * @method sleep
     * @public
     * @param  {Number} ms
     * @param  {Function} done callback function
     */
    sleep(ms, done){
        this.log('COMMAND', 'SLEEP\t'+ms);
        setTimeout(done, ms);
    },

    /**
     * request sync
     * @method requestSync
     * @public
     * @param  {object} options
     * @param  {Function} done callback function
     * @return {Object} error, {response:{}, body:{}}
     */
    request(options, done){
        request(options, function(error, response, body){
            done(error, {
                response: response,
                body: body
            });
        });
    },

    /**
     * execute protocal command
     * @method execCmd
     * @public
     * @param  {String} cmd protocal command, defined in command.js
     * @param  {Object} [pathData] replace the path parameters
     * @param  {Object} [data] send data to protocal api
     * @param  {Function} done callback function
     * @return {Object} the return object from webdriver server
     */
    execCmd(cmd, pathData, data, done){
        let self = this;
        let config = self.config;
        let cmdInfo = mapCommands[cmd];
        if(typeof pathData === 'function'){
            pathData = undefined;
            data = undefined;
        }
        else if(typeof data === 'function'){
            data = undefined;
        }
        done = getDone(arguments);
        if(cmdInfo !== undefined){
            let host = config.host;
            let port = config.port;
            let method = cmdInfo[0];
            let apiPath = cmdInfo[1];
            pathData = pathData || {};
            for(let name in pathData){
                apiPath = apiPath.replace(':'+name, encodeURIComponent(pathData[name]));
            }
            self.log('COMMAND', method + '\t' + apiPath);
            if(data){
                data = JSON.stringify(data);
                // encode Unicode
                data = data.replace(/[^\x00-\xff]/g, function(a){
                    return '\\'+escape(a).substr(1);
                });
                if(data !== '{}'){
                    self.log('DATA', data);
                }
            }
            else{
                data = '';
            }
            let url = 'http://'+host+':'+port+'/wd/hub'+apiPath;
            let headers = {
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json;charset=UTF-8',
                'Content-Length': data.length
            };
            self.request({
                method: method,
                url: url,
                headers: headers,
                body: data,
                followAllRedirects: true,
                timeout: 600000
            }, function(error, response){
                if(error){
                    done(error);
                }
                else{
                    let body = response.body;
                    response = response.response;
                    if(response.statusCode === 204){
                        // no content
                        self.log('RESPONSE', null);
                        done(null, null);
                    }
                    else{
                        try{
                            body = body.replace(/\x00/g,'');
                            body = JSON.parse(body);
                        }
                        catch(e){}
                        let wdStatus = body.status;
                        let value = body.value;
                        if(response.statusCode !== 200 || wdStatus !== 0){
                            let errorInfo = value ? (value.message ? value.message : value) : body;
                            self.log('ERROR', errorInfo);
                            return done(errorInfo);
                        }
                        else{
                            if(value && value.hCode !== undefined){
                                delete value['hCode'];
                                delete value['class'];
                            }
                            self.log('RESPONSE', value);
                        }
                        if(config.speed > 0){
                            self.sleep(config.speed, function(){
                                done(null, body);
                            });
                        }
                        else{
                            done(null, body);
                        }
                    }
                }
            });
        }
        else{
            done('Invalid cmd');
        }
    },

    /**
     * get all sessions
     * @method sessions
     * @public
     * @param  {Function} done callback function
     * @return {Array} sessions array
     */
    sessions(done){
        let self = this;
        self.execCmd('getSessions', function(error, ret){
            if(error){
                done(error);
            }
            else{
                let arrSessionsInfos = ret.value;
                let arrSessions = [];
                let arrPromise = [];
                function getSession(sessionInfo){
                   arrPromise.push(new Promise(function(resolve){
                        self.session({
                            sessionId: sessionInfo.id
                        }, function(error, ret){
                            arrSessions.push(ret);
                            resolve();
                        });
                    }));
                }
                for(let i=0,len=arrSessionsInfos.length;i<len;i++){
                    getSession(arrSessionsInfos[i]);
                }
                Promise.all(arrPromise).then(function(){
                    done(null, arrSessions);
                }).catch(done);
            }
        }).catch(done);
    },

    /**
     * init new session or attach to a session id
     * @method session
     * @public
     * @param  {String|Object} browserName or capabilitie object
     * @param  {String} version
     * @param  {String} platform
     * @param  {Function} done callback function
     * @return {Browser} Browser object
     */
    session(browserName, version, platform, done){
        var self = this;
        if(typeof version === 'function'){
            version = undefined;
            platform = undefined;
        }
        else if(typeof platform === 'function'){
            platform = undefined;
        }
        done = getDone(arguments);
        let browser = new Browser(self, browserName, version, platform);
        browser.init(function(error){
            self.lastBrowser = browser;
            done(error, browser);
        }).catch(done);
    }

});

// get done callback
function getDone(args){
    let done = args[args.length -1];
    return typeof done === 'function' ? done : null;
}

// expose Browser & Elements & chaiSupportChainPromise
JWebDriver.Browser = Browser;
JWebDriver.Elements = Elements;
JWebDriver.chaiSupportChainPromise = PromiseClass.chaiSupportChainPromise;

// mix Browser Elements to JWebDriver
mixPromise(JWebDriver, Browser, Elements);

module.exports = JWebDriver;
