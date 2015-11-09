var path = require('path');
var express = require('express');
var co = require('co');
var JWebDriver = require('../');
var expect  = require("expect.js");
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

        before(function(done){

            new Promise(function(resolve){
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
                driver.sessions().then(function(arrSessions){
                    var arrPromise = arrSessions.map(function(session){
                        return session.close();
                    });
                    return Promise.all(arrPromise);
                }).session({
                    browserName: browserName
                }, function(error, ret){
                    browser = ret;
                    done();
                }).catch(done);
            }).catch(done);

        });

        it('should find sub element', function(done){

            co(function*(){
                yield browser.url(testPath + 'test1.html');
                var formdiv = yield browser.find('#formdiv');
                expect(formdiv.length).to.be(1);
                var kw = yield formdiv.find('#kw');
                expect(kw.length).to.be(1);
                done();
            }).catch(done);

        });

        it('should get tagName', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                expect(yield kw.tagName()).to.be('input');
                done();
            }).catch(done);

        });

        it('should get attr', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                // read
                var test = yield kw.attr('data-test');
                expect(test).to.be('attrok');
                done();
            }).catch(done);

        });

        it('should get css', function(done){

            co(function*(){
                var form = yield browser.find('#form');
                // read
                var test = yield form.css('border-width');
                expect(test).to.be('5px');
                done();
            }).catch(done);

        });

        it('should setValue', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                var value = yield kw.setValue('testval').attr('value');
                expect(value).to.be('testval');
                done();
            }).catch(done);

        });

        it('should clear value', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                yield kw.setValue('test872');
                var value = yield kw.clear().attr('value');
                expect(value).to.be('');
                done();
            }).catch(done);

        });

        it('should get text', function(done){

            co(function*(){
                var pp = yield browser.find('#pp');
                var value = yield pp.text();
                expect(value).to.be('abc');
                done();
            }).catch(done);

        });

        it('should get displayed', function(done){

            co(function*(){
                var pp = yield browser.find('#pp');
                expect(yield pp.displayed()).to.be(true);
                var hidediv1 = yield browser.find('#hidediv1');
                expect(yield hidediv1.displayed()).to.be(false);
                var hidediv2 = yield browser.find('#hidediv2');
                expect(yield hidediv2.displayed()).to.be(false);
                done();
            }).catch(done);

        });

        it('should get offset', function(done){

            co(function*(){
                var pp = yield browser.find('#pp');
                var offset = yield pp.offset();
                expect(offset.x).to.be(101);
                expect(offset.y).to.be(102);
                done();
            }).catch(done);

        });

        it('should get size', function(done){

            co(function*(){
                var pp = yield browser.find('#pp');
                var size = yield pp.size();
                expect(size.width).to.be(51);
                expect(size.height).to.be(52);
                done();
            }).catch(done);

        });

        it('should get enabled', function(done){

            co(function*(){
                var submit = yield browser.find('#submit');
                expect(yield submit.enabled()).to.be(true);
                var reset = yield browser.find('#reset');
                expect(yield reset.enabled()).to.be(false);
                done();
            }).catch(done);

        });

        it('should get selected', function(done){

            co(function*(){
                var check1 = yield browser.find('#check1');
                expect(yield check1.selected()).to.be(true);
                var check2 = yield browser.find('#check2');
                expect(yield check2.selected()).to.be(false);
                done();
            }).catch(done);

        });

        it('should click the element', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                yield kw.click().sleep(300);
                var value = yield kw.attr('value');
                expect(value).to.be('onclick');
                done();
            }).catch(done);

        });

        it('should double click the element', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                yield kw.dblClick().sleep(300);
                var value = yield kw.attr('value');
                expect(value).to.be('ondblclick');
                done();
            }).catch(done);

        });

        it('should sendkeys to the element', function(done){

            co(function*(){
                var kw = yield browser.find('#kw');
                yield kw.clear().sendKeys('a{SHIFT}aaa{SHIFT}a').sleep(300);
                var value = yield kw.attr('value');
                expect(value).to.be('aAAAa');
                done();
            }).catch(done);

        });

        it('should sendkeys to the file element', function(done){

            co(function*(){
                var hostsPath = isWin32 ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts';
                var file = yield browser.find('#file');
                yield file.sendKeys(hostsPath);
                var value = yield file.attr('value');
                expect(value).to.contain('hosts');
                done();
            }).catch(done);

        });

        it('should test equals from 2 elements', function(done){

            co(function*(){
                var file = yield browser.find('#file');
                var isEqual = yield file.equal('input[type=file]');
                expect(isEqual).to.be(true);
                done();
            }).catch(done);

        });

        it('should submit the form', function(done){

            co(function*(){
                var form = yield browser.find('#form');
                yield form.submit();
                expect(yield browser.url()).to.contain('test2.html');
                done();
            }).catch(done);

        });

        it('should dragdrop element', function(done){

            co(function*(){
                yield browser.url(testPath+'dragdrop.html');
                var draggable = yield browser.find('#draggable');
                var offset = yield draggable.offset();
                expect(offset.x).to.be(8);
                expect(offset.y).to.be(8);
                yield draggable.dragDropTo('body', 501, 502);
                offset = yield draggable.offset();
                expect(offset.x).to.greaterThan(400);
                expect(offset.y).to.greaterThan(400);
                done();
            }).catch(done);

        });

        it('should uploadFile to file element', function(done){

            co(function*(){
                if(browser.browserName !== 'phantomjs'){
                    yield browser.url(testPath + 'test1.html');
                    var file = yield browser.find('#file');
                    yield file.uploadFile(path.resolve(__dirname, 'resource/upload.jpg'));
                    var value = yield file.attr('value');
                    expect(value).to.contain('upload.jpg');
                }
                done();
            }).catch(done);

        });

        after(function(done){
            server.close();
            browser.close().then(function(){
                done();
            });
        });
    });

}
