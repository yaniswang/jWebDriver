jWebDriver
================

![jWebDriver logo](https://raw.github.com/yaniswang/jWebDriver/master/logo.png)

A webdriver client for Node.js

[![Build Status](https://img.shields.io/travis/yaniswang/jWebDriver.svg)](https://travis-ci.org/yaniswang/jWebDriver)
[![NPM version](https://img.shields.io/npm/v/jwebdriver.svg?style=flat)](https://www.npmjs.com/package/jwebdriver)
[![License](https://img.shields.io/npm/l/jwebdriver.svg?style=flat)](https://www.npmjs.com/package/jwebdriver)
[![NPM count](https://img.shields.io/npm/dm/jwebdriver.svg?style=flat)](https://www.npmjs.com/package/jwebdriver)
[![NPM count](https://img.shields.io/npm/dt/jwebdriver.svg?style=flat)](https://www.npmjs.com/package/jwebdriver)

Official Site: [http://jwebdriver.com/](http://jwebdriver.com/)

Coverage: [86.76%](http://jwebdriver.com/coverage/)

Features
================

1. Support all webdriver protocols: [https://code.google.com/p/selenium/wiki/JsonWireProtocol](https://code.google.com/p/selenium/wiki/JsonWireProtocol)
2. Easy to use
3. Support promise chain & generator & es7 await
4. jQuery style test code, easy use for front engineer
5. All test cover api
6. Support hosts mode, different hosts for different job
7. Support for remote file upload

Quick start
================

1.  Download Selenium server & browser driver.

    > Selenium server & IEDriverServer & SafariDriver: [http://selenium-release.storage.googleapis.com/index.html](http://selenium-release.storage.googleapis.com/index.html)

    > ChromeDriver: [http://chromedriver.storage.googleapis.com/index.html](http://chromedriver.storage.googleapis.com/index.html)

2. Run selenium server

	> java -jar selenium-server-standalone-2.26.0.jar

3. Insall jWebDriver

    > npm install jwebdriver

4. Run test code

    > node baidu.js

        var JWebDriver = require('jwebdriver');

        var driver = new JWebDriver();
        driver.session('chrome', function*(error, chrome){
            yield chrome.url('https://www.baidu.com/');
            var elemement = yield chrome.find('#kw');
            yield elemement.setValue('mp3').submit();

            console.log(yield chrome.title());

            yield chrome.close();
        }).then(function(){
            console.log('all done');
        }).catch(function(error){
            console.log(error);
        });

    > node mocha.js

        var JWebDriver = require('jwebdriver');
        var expect  = require("expect.js");
        require('mocha-generators').install();

        describe('jWebDriver test', function(){

            var browser;
            before(function*(){
                var driver = new JWebDriver();
                browser = yield driver.session('chrome');
            });

            it('should open url', function*(){
                yield browser.url('https://www.baidu.com/');
                var kw = yield browser.find('#kw');
                expect(kw.length).to.be(1);

                yield kw.setValue('mp3').submit();

                var url = yield browser.url();
                expect(url).to.contain('wd=mp3');
            });

            after(function*(){
                yield browser.close();
            });

        });

    > node promise.js

        var JWebDriver = require('jwebdriver');

        var driver = new JWebDriver();
        driver.session('chrome', function(error, chrome) {
            chrome.url('https://www.baidu.com/')
                  .find('#kw')
                  .then(function(kw) {
                      return kw.setValue('mp3')
                               .submit();
                  })
                  .title()
                  .then(function(title) {
                      console.log(title);
                  })
                  .close();
        });


More examples
================

1. [Baidu test](https://github.com/yaniswang/jWebDriver/blob/master/example/baidu.js)
2. [Gooogle test](https://github.com/yaniswang/jWebDriver/blob/master/example/google.js)
3. [Mocha test](https://github.com/yaniswang/jWebDriver/blob/master/example/mocha.js)
4. [Promise test](https://github.com/yaniswang/jWebDriver/blob/master/example/promise.js)
5. [Upload test](https://github.com/yaniswang/jWebDriver/blob/master/example/upload.js)
6. [Drag Drop test](https://github.com/yaniswang/jWebDriver/blob/master/example/dragdrop.js)
7. [Co test](https://github.com/yaniswang/jWebDriver/blob/master/example/co.js)
8. [ES7 async](https://github.com/yaniswang/jWebDriver/blob/master/example/es7async.js)

API Book
================

jWebDriver have 3 Class: Driver, Broswer, Elemenets

All api can used with chain promise and support generator & es7 async:

    browser.find('#kw').then(function(elements){
        return elements.setValue('test')
                       .submit();
    })
    .title()
    .then(function(title){
        console.log(title);
    });


You can search all api here, include all mode of api:

    var co = require('co');

    co(function*(){

        // ========================== driver api ==========================

        var JWebDriver = require('jwebdriver');

        var driver = new JWebDriver(); // connect to http://127.0.0.1:4444
        var driver = new JWebDriver('127.0.0.1', '4444'); // connect to http://127.0.0.1:4444
        var driver = new JWebDriver({
            'host': '127.0.0.1',
            'port': 4444,
            'logLevel': 0, // 0: no log, 1: warning & error, 2: all log
            'nocolor': false,
            'speed': 100 // default: 0 ms
        });
        var wdInfo = yield driver.info(); // get webdriver server info

        // ========================== session api ==========================

        var arrSessions = yield driver.sessions(); // get all sessions
        for(var i=0;i<arrSessions.length;i++){
            yield arrSessions[i].close();
        }
        // new session
        var chrome = yield driver.session('chrome', '40.0', 'windows');
        var chrome = yield driver.session({
            'browserName':'chrome'
        });
        // set proxy
        var chrome = yield driver.session({
            'browserName':'chrome',
            'proxy': {
                'proxyType': 'manual',
                'httpProxy': '192.168.1.1:1080',
                'sslProxy': '192.168.1.1:1080'
            }
        });
        // set hosts
        var chrome = yield driver.session({
            'browserName':'chrome',
            'hosts': '192.168.1.1 www.alibaba.com\r\n192.168.1.1 www.google.com'
        });
        // attach session
        var chrome = yield driver.session('xxxxxxxxxx'); // session id

        // get session info
        var capabilities = yield chrome.info(); // get capabilities
        var isSupported = yield chrome.support('javascript'); // get capability supported: javascript, cssselector, screenshot, storage, alert, database, rotatable
        yield chrome.config({
            pageloadTimeout: 5000, // page onload timeout
            scriptTimeout: 1000, // sync script timeout
            asyncScriptTimeout: 1000, // async script timeout
            implicitTimeout: 1000 // implicit timeout
        });
        yield chrome.close(); // close session
        yield chrome.sleep(1000); // sleep

        // ========================== window ==========================

        var curWindowHandle = yield chrome.windowHandle(); // get current window handle
        var arrWindowHandles = yield chrome.windowHandles(); // get all windows
        yield chrome.switchWindow('handleid'); // focus to window
        yield chrome.switchWindow(0); // focus to first window
        yield chrome.switchWindow(1); // focus to second window
        var newWindowHandle = yield chrome.newWindow('http://www.alibaba.com/', 'testwindow', 'width=200,height=200'); // open new window and return windowHandle
        yield chrome.closeWindow(); // close current window

        // ========================== frame ==========================

        var elements = yield chrome.frames(); // get all frames
        yield chrome.switchFrame(0); // focus to frame 0
        yield chrome.switchFrame(1); // focus to frame 1
        yield chrome.switchFrame('#iframe_id'); // focus to frame #iframe_id
        yield chrome.switchFrame(null); // focus to main page
        yield chrome.switchFrameParent(); // focus to parent context

        // ========================== position & size & maximize & screenshot ==========================

        var offset = yield chrome.offset(); // return {x: 1, y: 1}
        yield chrome.offset(10, 10); // set offset
        yield chrome.offset({
            x: 10,
            y: 10
        });
        var info = yield chrome.size(); // return {width: 100, height: 100}
        yield chrome.size(100, 100); // set size
        yield chrome.size({
            width: 100,
            height: 100
        });
        yield chrome.maximize();
        var png_base64  = yield chrome.getScreenshot();// get the screen shot, base64 type

        // ========================== url & title & html ==========================

        yield chrome.url('http://www.alibaba.com/'); // goto url
        var url = yield chrome.url(); // get url
        var title = yield chrome.title(); // get title
        var html = yield chrome.html(); // get html code

        // ========================== navigator ==========================

        yield chrome.refresh(); // refresh page
        yield chrome.back(); // back to previous page
        yield chrome.forward(); // forward to next page

        yield chrome.scrollTo('#id'); // scroll to element (first element)
        yield chrome.scrollTo('#id', 10, 10); // scroll to element (first element)
        yield chrome.scrollTo('#id', { // scroll to element (first element)
            x: 10,
            y: 10
        });
        yield chrome.scrollTo(10, 10);
        yield chrome.scrollTo({
            x: 10,
            y: 10
        });

        // ========================== cookie ==========================

        var value = yield chrome.cookie('test'); // get cookie
        yield chrome.cookie('test', '123'); // set cookie
        yield chrome.cookie('test', '123', { // https://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object
            path: '',
            domain: '',
            secure: '',
            httpOnly: '',
            expiry: ''
        });
        yield chrome.cookie('test',123, {
            expiry: '7 day' // second|minute|hour|day|month|year
        });
        yield chrome.removeCookie('test'); // delete cookie
        var mapCookies = yield chrome.cookies(); // get all cookie
        yield chrome.clearCookies(); // delete all cookies

        // ========================== local storage && session storage ==========================

        var arrKeys = yield chrome.localStorageKeys(); // get all local storage keys
        var value = yield chrome.localStorage('test'); // get local storage value
        yield chrome.localStorage('test', '1'); // set local storage value
        yield chrome.removeLocalStorage('test'); // delete local storage
        yield chrome.clearLocalStorages(); // clear all local sotrage

        var arrKeys = yield chrome.sessionStorageKeys(); // get all session storage keys
        var value = yield chrome.sessionStorage('test'); // get session storage value
        yield chrome.sessionStorage('test', '1'); // set session storage value
        yield chrome.removeSessionStorage('test'); // delete session storage
        yield chrome.clearSessionStorages(); // clear all session sotrage

        // ========================== alert, confirm, prompt ==========================

        var msg = yield chrome.getAlert();// get alert text
        if(msg !== null){
            yield chrome.setAlert('test');// set msg to prompt
            yield chrome.acceptAlert(); // accept alert
            yield chrome.dismissAlert(); // dismiss alert
        }

        // ========================== mouse ==========================

        var MouseButtons = chrome.MouseButtons;
        yield chrome.mouseMove(element); // move to center of element
        yield chrome.mouseMove('#id'); // move to center of element
        yield chrome.mouseMove('#id', 10, 10); // move to offset of the element
        yield chrome.mouseMove('#id', {x: 10, y: 10}); // move to offset of the element
        yield chrome.mouseDown(); // left mouse button down
        yield chrome.mouseDown(MouseButtons.RIGHT); // right mouse button down
        yield chrome.mouseDown('RIGHT'); // right mouse button down
        yield chrome.mouseUp(); // left mouse button up
        yield chrome.mouseUp(MouseButtons.RIGHT); // right mouse button up
        yield chrome.mouseUp('RIGHT'); // right mouse button up
        yield chrome.click();
        yield chrome.click(MouseButtons.RIGHT);
        yield chrome.click('RIGHT');
        yield chrome.dblClick();
        yield chrome.dragDrop('#a', '#b'); // drag a drop to b
        yield chrome.dragDrop({
            selector: '#a',
            x: 1,
            y: 1
        }, {
            selector: '#b',
            x: 2,
            y: 2
        });

        // ========================== keyboard ==========================

        yield chrome.sendKeys('abc');
        var Keys = chrome.Keys;
        yield chrome.keyDown(Keys.CTRL);
        yield chrome.keyDown('CTRL');
        yield chrome.sendKeys('a'+Keys.LEFT);
        yield chrome.keyUp(Keys.CTRL);
        yield chrome.keyUp('CTRL');
        yield chrome.sendKeys('{CTRL}a{CTRL}');

        // ========================== eval ==========================

        // sync eval
        var title = yield chrome.eval(function(){
            return document.title;
        });
        var value = yield chrome.eval(function(arg1, arg2){
            return arg1;
        }, 1, 2);
        var value = yield chrome.eval(function(arg1, arg2){
            return arg1;
        }, [1, 2]);
        // async eval
        var value = yield chrome.eval(function(arg1, arg2, done){
            setTimeout(function(){
                done(arg2);
            }, 2000);
        }, 1, 2);
        // pass element to eval
        var tagName = yield chrome.eval(function(element){
            return element.tagName;
        }, yield chrome.find('#id'));

        // ========================== element ==========================

        var elements = yield chrome.wait('#id');// wait for element
        if(elements.length === 1){
            console.log('#id displayed');
        }
        yield elements.sleep(300); // sleep ms
        var elements = yield chrome.wait('#id', 5000);// wait for element, 5000 ms timeout
        var elements = yield chrome.wait('#id', {
            timeout: 10000, // set timeout, default: 10000
            displayed: true, // wait for element displayed, default: true
            removed: false // wait for element removed, default: false
        });

        var elements = yield chrome.find('#id'); // find element
        var elements = yield chrome.find('active');// get active element
        var elements = yield chrome.find('#id');// get element by css selector
        var elements = yield chrome.find('//html/body');// get element by xpath
        var elements = yield elements.find('.class'); // find all child element
        var isEqual = yield elements.equal('#bbb a'); // test if two elements refer to the same DOM element.

        var len = elements.length;
        for(var i=0;i<len;i++){
            element = elements.get(i);
        }

        var tagName = yield element.tagName(); // get tagname (first element)
        var value = yield element.attr('id'); // get attr value (first element)
        var value = yield element.css('border'); // get css value (first element)
        yield element.clear(); // clear input & textarea value
        var text = yield element.text(); // get displayed text (first element)

        var offset = yield element.offset(); // get offset from left top corner of the page (first element)
        var offset = yield element.offset(true); // get offset from left top corner of the screen (first element)
        var size = yield element.size(); // return {width: 100, height: 100} (first element)
        var isDisplayed = yield element.displayed(); // determine if an element is currently displayed (first element)
        var isEnabled = yield element.enabled(); //is element enabled (first element)
        var isSelected = yield element.selected(); // is element selected (first element)

        yield element.sendKeys('abc'); // send keys to element
        var Keys = chrome.Keys;
        yield element.sendKeys('a'+Keys.LEFT);
        yield element.sendKeys('{CTRL}a{CTRL}');
        yield element.setValue('mp3'); // equal to: element.clear().sendKeys('mp3');

        yield element.click(); // click element
        yield element.dblClick(); // dblClick element
        yield element.dragDropTo('#id'); // dragDrop to element (first element)
        yield element.dragDropTo('#id', 10, 10); // dragDrop to element (first element)
        yield element.dragDropTo({
            selector: '#id',
            x: 10,
            y: 10
        }); // dragDrop to element (first element)

        yield fileElement.uploadFile('c:/test.jpg');// upload file to browser machine and set temp path to <input type="file">
        yield element.submit();// submit form

        // ========================== mobile ==========================

        yield chrome.touchClick('#id');
        yield chrome.touchDblClick('#id');
        yield chrome.touchLongClick('#id');
        yield chrome.touchDown(10, 10);
        yield chrome.touchDown({
            x: 10,
            y: 10
        });
        yield chrome.touchUp(10, 10);
        yield chrome.touchUp({
            x: 10,
            y: 10
        });
        yield chrome.touchMove(10, 10);
        yield chrome.touchMove({
            x: 10,
            y: 10
        });
        yield chrome.touchScroll('#id');
        yield chrome.touchScroll('#id', 10, 10);
        yield chrome.touchScroll('#id', {
            x: 10,
            y: 10
        });
        yield chrome.touchScroll(10, 10);
        yield chrome.touchScroll({
            x: 10,
            y: 10
        });
        yield chrome.touchFlick('#id', {
            x: 10,
            y: 10,
            speed: 5
        });
        yield chrome.touchFlick({
            xspeed: 5,
            yspeed: 0
        });
        var orientation = yield chrome.orientation(); // return LANDSCAPE|PORTRAIT
        yield chrome.orientation('LANDSCAPE'); // set orientation: LANDSCAPE|PORTRAIT

        // ========================== geo location ==========================

        var loc = yield chrome.geolocation(); // return {latitude: number, longitude: number, altitude: number}
        yield chrome.geolocation({// set location
            latitude: 1,
            longitude: 1,
            altitude: 1
        });

    }).then(function(){
        console.log('All done!')
    }).catch(function(error){
        console.log(error);
    });

API Doc: [http://jwebdriver.com/api/](http://jwebdriver.com/api/)

License
================

jWebDriver is released under the MIT license:

> The MIT License
>
> Copyright (c) 2014-2015 Yanis Wang \<yanis.wang@gmail.com\>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* Selenium: [http://code.google.com/p/selenium/](http://code.google.com/p/selenium/)
* xtend: [https://npmjs.org/package/xtend](https://npmjs.org/package/xtend)
* mocha: [https://npmjs.org/package/mocha](https://npmjs.org/package/mocha)
* expect.js: [https://github.com/LearnBoost/expect.js](https://github.com/LearnBoost/expect.js)
* istanbul: [https://github.com/gotwarlost/istanbul](https://github.com/gotwarlost/istanbul)
* Grunt: [http://gruntjs.com/](http://gruntjs.com/)
* JSHint: [https://github.com/jshint/jshint](https://github.com/jshint/jshint)
* node-zip: [https://github.com/daraosn/node-zip](https://github.com/daraosn/node-zip)
* Express: [https://github.com/strongloop/express](https://github.com/strongloop/express)
* request: [https://github.com/request/request](https://github.com/request/request)
* co: [https://github.com/tj/co](https://github.com/tj/co)
* PhantomJs: [https://github.com/Medium/phantomjs](https://github.com/Medium/phantomjs)
* GitHub: [https://github.com/](https://github.com/)
