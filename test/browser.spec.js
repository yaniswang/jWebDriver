var path = require('path');
var os = require('os');
var express = require('express');
var JWebDriver = require('../');
var co  = require("co");
require('mocha-generators').install();
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

var chromedriver = require('chromedriver');

runBrowserTest('chrome');
// runBrowserTest('firefox');
// runBrowserTest('ie');

function runBrowserTest(browserName){

	describe('Browser - ' + browserName + ' : ', function(){

		var browser, server;
		var testPath = 'http://127.0.0.1';

		before(function*(){

            chromedriver.start(['--url-base=/wd/hub', '--port=4444']);

            yield new Promise(function(resolve){
                //init http server
                var app = express();
                app.use(express.static(__dirname + '/public'));
                server = app.listen(0, function(){
                    testPath += ':' + server.address().port+'/browsers/';
                    setTimeout(resolve, 3000);
                });
            }).then(function(){
                var driver = new JWebDriver({
                    logLevel: 0,
                    speed: 0
                });
                return driver.session(browserName).sessions().then(function(arrSessions){
                    var arrPromise = arrSessions.map(function(session){
                        return session.close();
                    });
                    return Promise.all(arrPromise);
                }).session({
                    browserName: browserName,
                    hosts: '127.0.0.1 www.alibaba.com'
                }, function(error, ret){
                    browser = ret;
                });
            });

		});

		it('should sleep 234 ms', function*(){

            var startTime = Date.now();
            yield browser.sleep(200);
            var time = Date.now() - startTime;
            time.should.be.within(150, 250);

		});

		it('should goto and read url', function*(){

            yield browser.url(testPath + 'test1.html');
            yield browser.url().should.equal(testPath + 'test1.html');
            yield browser.title().should.equal('testtitle');
            yield browser.url(testPath + 'test2.html');
            yield browser.url().should.equal(testPath + 'test2.html');
            yield browser.title().should.equal('testtitle');
            yield browser.back().url().should.equal(testPath + 'test1.html');
            yield browser.forward().url().should.equal(testPath + 'test2.html');
            // test https
            yield browser.url('https://www.baidu.com/');
            yield browser.title().should.contain('百度');

		});

        it('hosts mode should work', function*(){

            var tmpTestPath = testPath.replace('127.0.0.1', 'www.alibaba.com');
            yield browser.url(tmpTestPath + 'test1.html').title().should.equal('testtitle');

        });

		it('should refresh page', function*(){

            yield browser.url(testPath + 'test1.html');
            var element = yield browser.find('#kw');
            yield element.val('refresh').attr('value').should.equal('refresh');
            yield browser.refresh();
            element = yield browser.find('#kw');
            yield element.attr('value').should.equal('');

		});

		it('should get title', function*(){

            yield browser.url(testPath + 'test1.html').title().should.equal('testtitle');

		});

		it('should get html', function*(){

            yield browser.html().should.match(/<\/head>\s*<body>/i);

		});

		it('should write and get cookie', function*(){

            yield browser.cookies(true).should.have.length(0);
            yield browser.cookie('test1', '111');
            yield browser.cookie('test2','222', {
                expiry: '7 day'
            });
            yield browser.cookies(true).should.have.length(2);
            yield browser.cookie('test3', '321').cookie('test3').should.equal('321');
            yield browser.removeCookie('test3').cookie('test3').should.equal(undefined);
            yield browser.clearCookies();
            yield browser.cookies(true).should.have.length(0);

		});

        it('should write and get localStorage', function*(){

            if(yield browser.support('storage')){
                yield browser.localStorageKeys().should.have.length(0);
                yield browser.localStorage('test1', '111');
                yield browser.localStorage('test2', '222');
                yield browser.localStorageKeys().should.have.length(2);
                yield browser.localStorage('test1').should.equal('111');
                yield browser.removeLocalStorage('test1').localStorageKeys().should.have.length(1);
                yield browser.clearLocalStorages().localStorageKeys().should.length(0);
            }

        });

        it('should write and get sessionStorage', function*(){

            if(yield browser.support('storage')){
                yield browser.sessionStorageKeys().should.have.length(0);
                yield browser.sessionStorage('test1', '111');
                yield browser.sessionStorage('test2', '222');
                yield browser.sessionStorageKeys().should.have.length(2);
                yield browser.sessionStorage('test1').should.equal('111');
                yield browser.removeSessionStorage('test1').sessionStorageKeys().should.have.length(1);
                yield browser.clearSessionStorages().sessionStorageKeys().should.have.length(0);
            }

        });

		it('should eval javascript', function(done){

            co(function*(){
                yield browser.eval('return document.title;').should.equal('testtitle');

                yield browser.eval(function(){
                    return document.title;
                }).should.equal('testtitle');

                yield browser.eval(function(arg1, arg2){
                    return arg2;
                }, 123, 321).should.equal(321);

                yield browser.eval(function(arg1, arg2){
                    return arg2;
                }, [123, 321]).should.equal(321);

                var element = yield browser.find('#kw');
                yield browser.eval(function(elements){
                    return elements[0].tagName;
                }, element).should.equal('INPUT');

                yield browser.config({
                    asyncScriptTimeout: 50
                });

                yield browser.eval(function(done){
                    setTimeout(function(){
                        done(document.title);
                    }, 10);
                }).should.equal('testtitle');

                yield browser.eval(function(args1, arg2, done){
                    setTimeout(function(){
                        done(arg2);
                    }, 10);
                }, 123, 321).should.equal(321);

                yield browser.config({
                    asyncScriptTimeout: 10
                });

                yield browser.eval(function(done){
                    setTimeout(done, 50);
                }).catch(function(error){
                    error.should.equal('eval timeout');
                }).should.equal(undefined);

                yield browser.eval(function(done){
                    false && done();
                }).catch(function(error){
                    error.should.equal('eval timeout');
                }).should.equal(undefined);
            }).then(done).catch(function(error){
                if(error === 'eval timeout'){
                    done();
                }
                else{
                    done(error);
                }
            });

		});

		it('should get screenshot', function*(){

            var fs =require('fs');
            var tempPath = path.resolve(os.tmpdir(),'jwebdriver.png');
            if(fs.existsSync(tempPath)){
                fs.unlinkSync(tempPath);
            }
            var base64Png = yield browser.getScreenshot().should.to.be.an('string');
            fs.writeFileSync(tempPath, base64Png, 'base64');
            fs.existsSync(tempPath).should.to.true;
            if(fs.existsSync(tempPath)){
                fs.unlinkSync(tempPath);
            }

		});

		it('should find element', function*(){

            var activeElement = yield browser.find('active').should.have.length(1);
            yield activeElement.attr('id').should.equal('kw');
            yield browser.find('#testmouse').should.have.length(1);
            try{
                yield browser.find('#abcaaa');
            }
            catch(e){
                e.should.equal('Find elements failed: css selector, #abcaaa');
            }

		});

        it('should find visible element', function*(){

            var visibleTest = yield browser.findVisible('#visibleTest1').should.have.length(1);
            yield visibleTest.attr('id').should.equal('visibleTest1');

            yield browser.findVisible('.visibletest').should.have.length(1);

            try{
                yield browser.findVisible('#visibleTest2');
            }
            catch(e){
                e.should.equal('Find visible elements failed');
            }

            try{
                yield browser.findVisible('#visibleTest3');
            }
            catch(e){
                e.should.equal('Find visible elements failed');
            }
        });

		it('should sendkeys to element', function*(){

            yield browser.eval(function(){
                document.getElementById("kw").focus();
            }).sendKeys('ab{shift}c{shift}');
            yield browser.find('#kw').then(function(element){
                return element.attr('value').should.equal('abC').clear();
            });
            // keyDown & keyUp
            yield browser.keyDown('SHIFT').sendKeys('abc').keyUp('SHIFT');
            yield browser.find('#kw').then(function(element){
                return element.attr('value').should.equal('ABC');
            });

		});

		it('should send mouse keys', function*(){

            yield browser.url(testPath + 'test1.html');
            var kw = yield browser.find('#kw');
            //mouseMove: element
            yield kw.val('test').attr('value').should.equal('test');
            yield browser.mouseMove(kw).click().sleep(200);
            yield kw.attr('value').should.equal('1');
            //dbclick
            yield browser.dblClick().sleep(200);
            yield kw.attr('value').should.equal('2');
            var testmouse = yield browser.find('#testmouse');
            yield browser.mouseMove(testmouse).sleep(100);
            //mousedown
            yield browser.mouseDown().sleep(200);
            yield testmouse.attr('value').should.equal('3');
            //mouseup
            yield browser.mouseUp().sleep(200);
            yield testmouse.attr('value').should.equal('4');

		});

		it('should wait element', function*(){

            yield browser.url(testPath + 'test1.html');
            // wait displayed
            try{
                yield browser.find('#wait1');
            }
            catch(e){
                e.should.equal('Find elements failed: css selector, #wait1');
            }
            yield browser.eval(function(){
                setTimeout(function(){
                    document.body.innerHTML='<input type="text" id="wait1">';
                }, 100);
                return;
            });
            yield browser.wait('#wait1').should.have.length(1);

            yield browser.eval(function(){
                setTimeout(function(){
                    document.body.innerHTML='<input type="text" id="wait2" style="display:none">';
                }, 100);
            });
            try{
                yield browser.wait('#wait2', 300);
            }
            catch(e){
                e.should.contain('Wait elelment displayed timeout');
            }

            // wait dom
            yield browser.eval(function(){
                setTimeout(function(){
                    document.body.innerHTML='<input type="text" id="wait3" style="display:none">';
                }, 100);
            });
            yield browser.wait('#wait3', {
                displayed: false
            }).should.have.length(1);

            // wait removed
            yield browser.eval(function(){
                setTimeout(function(){
                    document.body.innerHTML='all removed';
                }, 100);
            });
            try{
                yield browser.wait('#wait3', {
                    removed: true
                });
            }
            catch(e){
                e.should.contain('Wait elelment removed timeout');
            }
		});

        it('should dragdrop element', function*(){

            yield browser.url(testPath+'dragdrop.html');
            var draggable = yield browser.find('#draggable');
            var offset = yield draggable.offset();
            offset.x.should.below(10);
            offset.y.should.below(10);
            yield browser.dragDrop(draggable, {
                selector: 'body',
                x: 501,
                y: 502
            });
            offset = yield draggable.offset();
            offset.x.should.above(400);
            offset.y.should.above(400);

        });

        it('should scrollTo', function*(){

            yield browser.size(1024, 768);
            var draggable = yield browser.find('#draggable');
            var offset = yield draggable.offset(true);
            offset.y.should.above(300);
            yield browser.scrollTo(draggable);
            offset = yield draggable.offset(true);
            offset.y.should.below(200);
            yield browser.scrollTo(0, 0);
            offset = yield draggable.offset(true);
            offset.y.should.above(400);

        });

        it('should get and set alert', function*(){

            if(yield browser.support('alert')){
                yield browser.url(testPath + 'test1.html');
                var alert = yield browser.find('#alert');
                yield alert.click().sleep(500);
                yield browser.getAlert().should.equal('111');
                yield browser.acceptAlert();
                // confirm
                var confirm = yield browser.find('#confirm');
                yield confirm.click().sleep(500);
                yield browser.getAlert().should.equal('222');
                yield browser.dismissAlert();
                yield confirm.attr('value').should.equal('false');
                // prompt
                var prompt = yield browser.find('#prompt');
                yield prompt.click().sleep(500);
                yield browser.getAlert().should.equal('333');
                yield browser.setAlert('444').acceptAlert();
                yield prompt.attr('value').should.equal('444');
            }

        });

        it('should switchTo window', function*(){

            yield browser.url(testPath + 'test1.html');
            var testwindow = yield browser.find('#testwindow').should.have.length(1);
            yield testwindow.click().sleep(200);
            var curWindowHandle = yield browser.windowHandle();
            yield browser.windowHandles().should.have.length(2);
            yield browser.switchWindow(1);
            //no element
            try{
                yield browser.find('#testwindow');
            }
            catch(e){
                e.should.equal('Find elements failed: css selector, #testwindow');
            }
            yield browser.closeWindow().windowHandles().should.have.length(1);
            yield browser.switchWindow(0);
            yield browser.find('#testwindow').should.have.length(1);
            yield browser.windowHandle().should.equal(curWindowHandle);
            // new window
            var newWindowHandle = yield browser.newWindow(testPath + 'test2.html');
            yield browser.switchWindow(newWindowHandle);
            yield browser.find('#test2input').should.have.length(1);
            yield browser.closeWindow().switchWindow(curWindowHandle);
            yield browser.find('#testwindow').should.have.length(1);

        });

        it('should switchTo frame', function*(){

            yield browser.url(testPath + 'test1.html');
            yield browser.frames().should.have.length(1);
            yield browser.find('#testwindow').should.have.length(1);
            // switch to frame
            yield browser.switchFrame('#testiframe');
            try{
                yield browser.find('#testwindow');
            }
            catch(e){
                e.should.equal('Find elements failed: css selector, #testwindow');
            }
            // switch to main page
            yield browser.switchFrame(null);
            yield browser.find('#testwindow').should.have.length(1);
            // switch to frame
            yield browser.switchFrame('#testiframe');
            try{
                yield browser.find('#testwindow');
            }
            catch(e){
                e.should.equal('Find elements failed: css selector, #testwindow');
            }
            if(browser.browserName !== 'phantomjs'){
                // switch to parent
                yield browser.switchFrameParent();
                yield browser.find('#testwindow').should.have.length(1);
            }

        });

        it('should set and get size of window', function*(){

            yield browser.size(501,502);
            yield browser.size().should.deep.equal({width:501,height:502});
            yield browser.size({'width': 603,'height': 604});
            yield browser.size().should.deep.equal({width:603,height:604});

        });

        it('should set and get position of window', function*(){

            if(browser.browserName !== 'phantomjs'){
                yield browser.position(101,102);
                yield browser.position().should.deep.equal({x:101,y:102});
                yield browser.position({'x': 203,'y': 204});
                yield browser.position().should.deep.equal({x:203,y:204});
            }

        });

        it('should maximize window', function*(){

            var screen = yield browser.eval(function(){
                return screen.width + ',' + screen.height;
            });
            console.log(screen);
            yield browser.size(501,502);
            yield browser.size().should.deep.equal({width:501,height:502});
            yield browser.maximize();
            var newSize = yield browser.size();
            newSize.width.should.above(501);
            newSize.height.should.above(502);

        });

		after(function*(){
			server.close();
            yield browser.close();
            chromedriver.stop();
		});
	});

}
