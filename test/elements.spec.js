var path = require('path');
var express = require('express');
var JWebDriver = require('../');
require('mocha-generators').install();
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

var chromedriver = require('chromedriver');

var isWin32 = process.platform === 'win32';

runBrowserTest('chrome');
// runBrowserTest('firefox');
// runBrowserTest('ie');

function runBrowserTest(browserName){

    describe('Element - ' + browserName+' : ', function(){

        var browser, server;
        var testPath = 'http://127.0.0.1';

        before(function*(){

            chromedriver.start(['--url-base=/wd/hub', '--port=4444']);

            yield new Promise(function(resolve){
                //init http server
                var app = express();
                app.use(express.static(__dirname + '/public'));
                server = app.listen(0, function(){
                    testPath += ':' + server.address().port+'/elements/';
                    setTimeout(resolve, 1000);
                });
            }).then(function(){
                var driver = new JWebDriver({
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

        it('should filter element', function*(){

            yield browser.url(testPath + 'test1.html');
            yield browser.find('input').then(function(element){
                return element.get(0).val('123');
            });
            yield browser.find('#kw').then(function(element){
                return element.val().should.equal('123');
            });

            yield browser.find('input').then(function(element){
                return element.first().val('234');
            });
            yield browser.find('#kw').then(function(element){
                return element.val().should.equal('234');
            });

            yield browser.find('input').then(function(element){
                return element.last().val('345');
            });
            yield browser.find('#last').then(function(element){
                return element.val().should.equal('345');
            });

            yield browser.find('input').then(function(element){
                return element.slice(0,1).val('456');
            });
            yield browser.find('#kw').then(function(element){
                return element.val().should.equal('456');
            });

            yield browser.find('input').then(function(element){
                return element.slice(6,7).val('456');
            });
            yield browser.find('#last').then(function(element){
                return element.val().should.equal('456');
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
            offset.should.have.property('x', 101);
            offset.should.have.property('y', 102);

        });

        it('should get size', function*(){

            var pp = yield browser.find('#pp');
            var size = yield pp.size();
            size.should.have.property('width', 51);
            size.should.have.property('height', 52);

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
            yield selecttest.select({
                type: 'index',
                value: '1'
            }).attr('value').should.equal('v2');

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

            var file = yield browser.find('input[type=text]');
            yield file.equal('.equaltest').should.be.true;

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
            offset.should.have.property('x', 8);
            offset.should.have.property('y', 8);

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

        it('should scroll in element', function*(){

            yield browser.url(testPath + 'test1.html');
            var elements = yield browser.find('.divscroll');
            yield elements.scrollTo(99, 101);
            var scrollInfo = yield browser.eval(function(elements){
                var element1 = elements[0];
                var element2 = elements[1];
                return {
                    left1:element1.scrollLeft,
                    top1:element1.scrollTop,
                    left2:element2.scrollLeft,
                    top2:element2.scrollTop
                };
            }, elements);
            scrollInfo.left1.should.equal(99);
            scrollInfo.top1.should.equal(101);
            scrollInfo.left2.should.equal(99);
            scrollInfo.top2.should.equal(101);

            var divscroll1 = yield browser.find('#divscroll1');
            yield divscroll1.scrollTo(91, 111);
            scrollInfo = yield browser.eval(function(elements){
                var element1 = elements[0];
                var element2 = elements[1];
                return {
                    left1:element1.scrollLeft,
                    top1:element1.scrollTop,
                    left2:element2.scrollLeft,
                    top2:element2.scrollTop
                };
            }, elements);
            scrollInfo.left1.should.equal(91);
            scrollInfo.top1.should.equal(111);
            scrollInfo.left2.should.equal(99);
            scrollInfo.top2.should.equal(101);

            var divscroll2 = yield browser.find('#divscroll2');
            yield divscroll2.scrollTo(121, 91);
            scrollInfo = yield browser.eval(function(elements){
                var element1 = elements[0];
                var element2 = elements[1];
                return {
                    left1:element1.scrollLeft,
                    top1:element1.scrollTop,
                    left2:element2.scrollLeft,
                    top2:element2.scrollTop
                };
            }, elements);
            scrollInfo.left1.should.equal(91);
            scrollInfo.top1.should.equal(111);
            scrollInfo.left2.should.equal(121);
            scrollInfo.top2.should.equal(91);

        });

        after(function*(){
            server.close();
            yield browser.close();
            chromedriver.stop();
        });
    });

}
