var path = require('path');
var express = require('express');
var JWebDriver = require('../');
require('mocha-generators').install();
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

    describe('Element - ' + browserName+' : ', function(){

        var browser, server;
        var testPath = 'http://127.0.0.1';

        before(function*(){

            yield new Promise(function(resolve){
                //init http server
                var app = express();
                app.use(express.static(__dirname + '/public'));
                server = app.listen(5555, function(){
                    testPath += ':' + server.address().port+'/elements/';
                    resolve();
                });
            }).then(function(){
                var driver = new JWebDriver({
                    port: driverPort,
                    logLevel: 0,
                    speed: 0
                });
                return driver.sessions().then(function(arrSessions){
                    var arrPromise = arrSessions.map(function(session){
                        return session.close();
                    });
                    return Promise.all(arrPromise);
                }).session({
                    browserName: browserName
                }, function(error, ret){
                    browser = ret;
                });
            });

        });

        it('should find sub element', function*(){

            yield browser.url(testPath + 'test1.html');
            var formdiv = yield browser.find('#formdiv').should.have.length(1);
            yield formdiv.find('#kw').should.have.length(1);

        });

        it('should get tagName', function*(){

            var kw = yield browser.find('#kw');
            yield kw.tagName().should.equal('input');

        });

        it('should get attr', function*(){

            var kw = yield browser.find('#kw');
            // read
            yield kw.attr('data-test').should.equal('attrok');

        });

        it('should get css', function*(){

            var form = yield browser.find('#form');
            // read
            yield form.css('border-width').should.equal('5px');

        });

        it('should get or set value', function*(){

            var kw = yield browser.find('#kw');
            yield kw.val('testval123').val().should.equal('testval123');

        });

        it('should clear value', function*(){

            var kw = yield browser.find('#kw');
            yield kw.val('test872').clear().attr('value').should.equal('');

        });

        it('should get text', function*(){

            var pp = yield browser.find('#pp');
            yield pp.text().should.equal('abc');

        });

        it('should get displayed', function*(){

            var pp = yield browser.find('#pp');
            pp.displayed().should.be.true;
            var hidediv1 = yield browser.find('#hidediv1');
            yield hidediv1.displayed().should.be.false;
            var hidediv2 = yield browser.find('#hidediv2');
            yield hidediv2.displayed().should.be.false;

        });

        it('should get offset', function*(){

            var pp = yield browser.find('#pp');
            var offset = yield pp.offset();
            delete offset['toString'];
            offset.should.deep.equal({x:101,y:102});

        });

        it('should get size', function*(){

            var pp = yield browser.find('#pp');
            yield pp.size().should.deep.equal({width:51, height:52});

        });

        it('should get enabled', function*(){

            var submit = yield browser.find('#submit');
            yield submit.enabled().should.be.true;
            var reset = yield browser.find('#reset');
            yield reset.enabled().should.be.false;

        });

        it('should get selected', function*(){

            var check1 = yield browser.find('#check1');
            yield check1.selected().should.be.true;
            var check2 = yield browser.find('#check2');
            yield check2.selected().should.be.false;

        });


        it('should select option', function*(){

            var selecttest = yield browser.find('#selecttest');
            // index test
            yield selecttest.select(0).attr('value').should.equal('v1');
            yield selecttest.select(1).attr('value').should.equal('v2');
            yield selecttest.select(2).attr('value').should.equal('v3');
            // value test
            yield selecttest.select('v2').attr('value').should.equal('v2');
            yield selecttest.select('v4').attr('value').should.equal('v4');
            // text test
            yield selecttest.select({
                type: 'text',
                value: 'test1'
            }).attr('value').should.equal('v1');
            yield selecttest.select({
                type: 'text',
                value: 'test3'
            }).attr('value').should.equal('v3');

        });

        it('should click the element', function*(){

            var kw = yield browser.find('#kw');
            yield kw.click().sleep(300).attr('value').should.equal('onclick');

        });

        it('should double click the element', function*(){

            var kw = yield browser.find('#kw');
            yield kw.dblClick().sleep(300).attr('value').should.equal('ondblclick');

        });

        it('should sendkeys to the element', function*(){

            var kw = yield browser.find('#kw');
            yield kw.clear().sendKeys('a{SHIFT}aaa{SHIFT}a').sleep(300).attr('value').should.equal('aAAAa');

        });

        it('should sendkeys to the file element', function*(){

            var hostsPath = isWin32 ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts';
            var file = yield browser.find('#file');
            yield file.sendKeys(hostsPath).attr('value').should.contain('hosts');

        });

        it('should test equals from 2 elements', function*(){

            var file = yield browser.find('#file');
            yield file.equal('input[type=file]').should.be.true;

        });

        it('should submit the form', function*(){

            var form = yield browser.find('#form');
            yield form.submit();
            yield browser.url().should.contain('test2.html');

        });

        it('should dragdrop element', function*(){

            yield browser.url(testPath+'dragdrop.html');
            var draggable = yield browser.find('#draggable');
            var offset = yield draggable.offset();
            delete offset['toString'];
            offset.should.deep.equal({x:8,y:8});

            yield draggable.dragDropTo('body', 501, 502);
            offset = yield draggable.offset();
            offset.x.should.above(400);
            offset.y.should.above(400);

        });

        it('should uploadFile to file element', function*(){

            if(browser.browserName !== 'phantomjs'){
                yield browser.url(testPath + 'test1.html');
                var file = yield browser.find('#file');
                yield file.uploadFile(path.resolve(__dirname, 'resource/upload.jpg')).attr('value').should.contain('upload.jpg');
            }

        });

        after(function*(){
            server.close();
            yield browser.close();
        });
    });

}
