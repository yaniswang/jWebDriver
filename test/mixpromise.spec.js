var express = require('express');
var JWebDriver = require('../');
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

var isWin32 = process.platform === 'win32';
var phantomjs = process.env['phantomjs'] || !isWin32;

var driverPort = 4444;
if(phantomjs){
    driverPort = 4445;
    runBrowserTest('phantomjs');
}
else{
    runBrowserTest('chrome');
    // runBrowserTest('firefox');
    // runBrowserTest('ie');
}

function runBrowserTest(browserName){

    describe('MixPromise - ' + browserName+' : ', function(){

        var browser, server;
        var testPath = 'http://127.0.0.1';

        before(function(){

            return new Promise(function(resolve){
                //init http server
                var app = express();
                app.use(express.static(__dirname + '/public'));
                server = app.listen(0, function(){
                    testPath += ':' + server.address().port+'/elements/';
                    resolve();
                });
            }).then(function(){
                var driver = new JWebDriver({
                    port: driverPort,
                    logLevel: 0,
                    speed: 0
                });
                browser = driver.sessions().then(function(arrSessions){
                    var arrPromise = arrSessions.map(function(session){
                        return session.close();
                    });
                    return Promise.all(arrPromise);
                }).session({
                    browserName: browserName
                });
                return browser;
            });

        });

        it('should goto url', function(){

            return browser.url(testPath + 'test1.html')
            .url()
            .should.include('test1.html')
            .title()
            .should.equal('testtitle');

        });

        it('should eval javascript', function(){

            return browser.eval('return location.href')
            .should.include('test1.html');

        });

        it('should find element', function(){

            return browser.find('#kw')
            .should.have.length(1)
            .val('find123')
            .val()
            .should.equal('find123');

        });

        it('should filter element', function(){

            return browser.find('input')
            .get(0).val('123')
            .find('#kw')
            .val().should.equal('123')
            .find('input')
            .last().val('234')
            .find('#last')
            .val().should.equal('234');

        });

        it('should click the element', function(){

            return browser.url(testPath + 'test1.html')
            .find('#kw')
            .click().sleep(300)
            .attr('value').should.equal('onclick');

        });

        it('should click mouse by key', function(){

            return browser.url(testPath + 'test1.html')
            .find('#reset')
            .mouseMove()
            .find('#kw')
            .click(0).sleep(300)
            .attr('value').should.equal('')
            .mouseMove()
            .click(0).sleep(300)
            .attr('value').should.equal('onclick');

        });

        after(function(){
            var closeServer = new Promise(function(resolve){
                server.close(resolve);
            });
            return Promise.all([closeServer, browser.close()]);
        });
    });

}
