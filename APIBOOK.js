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
    var browser = yield driver.session('browser', '40.0', 'windows');
    var browser = yield driver.session({
        'browserName':'browser',
        'version': 'ANY',
        'platform': 'ANY'
    });
    // attach session
    var browser = yield driver.session({
        sessionId: 'xxxxxxxxxx'
    });
    // set manual proxy
    var browser = yield driver.session({
        'browserName':'browser',
        'proxy': {
            'proxyType': 'manual',
            'httpProxy': '192.168.1.1:1080',
            'sslProxy': '192.168.1.1:1080'
        }
    });
    // set pac proxy
    var browser = yield driver.session({
        'browserName':'browser',
        'proxy': {
            'proxyType': 'pac',
            'proxyAutoconfigUrl': 'http://x.x.x.x/test.pac'
        }
    });
    // set hosts
    var browser = yield driver.session({
        'browserName':'browser',
        'hosts': '192.168.1.1 www.alibaba.com\r\n192.168.1.1 www.google.com'
    });
    // attach session
    var browser = yield driver.session('xxxxxxxxxx'); // session id

    // get session info
    var capabilities = yield browser.info(); // get capabilities
    var isSupported = yield browser.support('javascript'); // get capability supported: javascript, cssselector, screenshot, storage, alert, database, rotatable
    yield browser.config({
        pageloadTimeout: 5000, // page onload timeout
    	scriptTimeout: 1000, // sync script timeout
    	asyncScriptTimeout: 1000, // async script timeout
    	implicitTimeout: 1000 // implicit timeout
    });
    yield browser.close(); // close session
    yield browser.sleep(1000); // sleep

    // ========================== window ==========================

    var curWindowHandle = yield browser.windowHandle(); // get current window handle
    var arrWindowHandles = yield browser.windowHandles(); // get all windows
    yield browser.switchWindow('handleid'); // focus to window
    yield browser.switchWindow(0); // focus to first window
    yield browser.switchWindow(1); // focus to second window
    var newWindowHandle = yield browser.newWindow('http://www.alibaba.com/', 'testwindow', 'width=200,height=200'); // open new window and return windowHandle
    yield browser.closeWindow(); // close current window

    // ========================== frame ==========================

    var elements = yield browser.frames(); // get all frames
    yield browser.switchFrame(0); // focus to frame 0
    yield browser.switchFrame(1); // focus to frame 1
    yield browser.switchFrame('#iframe_id'); // focus to frame #iframe_id
    yield browser.switchFrame(null); // focus to main page
    yield browser.switchFrameParent(); // focus to parent context

    // ========================== position & size & maximize & screenshot ==========================

    var position = yield browser.position(); // return {x: 1, y: 1}
    yield browser.position(10, 10); // set position
    yield browser.position({
    	x: 10,
    	y: 10
    });
    var info = yield browser.size(); // return {width: 100, height: 100}
    yield browser.size(100, 100); // set size
    yield browser.size({
    	width: 100,
    	height: 100
    });
    yield browser.maximize();
    var png_base64  = yield browser.getScreenshot();// get the screen shot, base64 type
    var png_base64  = yield browser.getScreenshot('d:/test.png');// get the screen shot, and save to file
    var png_base64 = yield browser.getScreenshot({
        elem: '#id'
    }); // get the element shot, (require install gm)
    var png_base64 = yield browser.getScreenshot({
        elem: '#id',
        filename: 'test.png'
    }); // get the element shot, and save to file

    // ========================== url & title & source ==========================

    yield browser.url('http://www.alibaba.com/'); // goto url
    var url = yield browser.url(); // get url
    var title = yield browser.title(); // get title
    var source = yield browser.source(); // get source code
    var html = yield browser.html(); // get html code, nick name of source

    // ========================== navigator ==========================

    yield browser.refresh(); // refresh page
    yield browser.back(); // back to previous page
    yield browser.forward(); // forward to next page

    yield browser.scrollTo('#id'); // scroll to element (first element)
    yield browser.scrollTo('#id', 10, 10); // scroll to element (first element)
    yield browser.scrollTo('#id', { // scroll to element (first element)
        x: 10,
        y: 10
    });
    yield browser.scrollTo(10, 10);
    yield browser.scrollTo({
        x: 10,
        y: 10
    });
    var elements = yield browser.find('#divtest');
    elements.scrollTo(0, 100); // scroll all elements to x, y

    // ========================== cookie ==========================

    var value = yield browser.cookie('test'); // get cookie
    yield browser.cookie('test', '123'); // set cookie
    yield browser.cookie('test', '123', { // https://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object
        path: '',
        domain: '',
        secure: '',
        httpOnly: '',
        expiry: ''
    });
    yield browser.cookie('test',123, {
        expiry: '7 day' // second|minute|hour|day|month|year
    });
    yield browser.removeCookie('test'); // delete cookie
    var mapCookies = yield browser.cookies(); // get all cookie
    yield browser.clearCookies(); // delete all cookies

    // ========================== local storage && session storage ==========================

    var arrKeys = yield browser.localStorageKeys(); // get all local storage keys
    var value = yield browser.localStorage('test'); // get local storage value
    yield browser.localStorage('test', '1'); // set local storage value
    yield browser.removeLocalStorage('test'); // delete local storage
    yield browser.clearLocalStorages(); // clear all local sotrage

    var arrKeys = yield browser.sessionStorageKeys(); // get all session storage keys
    var value = yield browser.sessionStorage('test'); // get session storage value
    yield browser.sessionStorage('test', '1'); // set session storage value
    yield browser.removeSessionStorage('test'); // delete session storage
    yield browser.clearSessionStorages(); // clear all session sotrage

    // ========================== alert, confirm, prompt ==========================

    var msg = yield browser.getAlert();// get alert text
    if(msg !== null){
        yield browser.setAlert('test');// set msg to prompt
        yield browser.acceptAlert(); // accept alert
        yield browser.dismissAlert(); // dismiss alert
    }

    // ========================== mouse ==========================

    var MouseButtons = browser.MouseButtons;
    yield browser.mouseMove(element); // move to center of element
    yield browser.mouseMove('#id'); // move to center of element
    yield browser.mouseMove('#id', 10, 10); // move to offset of the element
    yield browser.mouseMove('#id', {x: 10, y: 10}); // move to offset of the element
    yield browser.mouseDown(); // left mouse button down
    yield browser.mouseDown(MouseButtons.RIGHT); // right mouse button down
    yield browser.mouseDown('RIGHT'); // right mouse button down
    yield browser.mouseUp(); // left mouse button up
    yield browser.mouseUp(MouseButtons.RIGHT); // right mouse button up
    yield browser.mouseUp('RIGHT'); // right mouse button up
    yield browser.click();
    yield browser.click(MouseButtons.RIGHT);
    yield browser.click('RIGHT');
    yield browser.dblClick();
    yield browser.dragDrop('#a', '#b'); // drag a drop to b
    yield browser.dragDrop({
    	selector: '#a',
    	x: 1,
    	y: 1
    }, {
    	selector: '#b',
    	x: 2,
    	y: 2
    });

    // ========================== keyboard ==========================

    yield browser.sendKeys('abc');
    var Keys = browser.Keys;
    yield browser.keyDown(Keys.CTRL);
    yield browser.keyDown('CTRL');
    yield browser.sendKeys('a'+Keys.LEFT);
    yield browser.keyUp(Keys.CTRL);
    yield browser.keyUp('CTRL');
    yield browser.sendKeys('{CTRL}a{CTRL}');

    // ========================== eval ==========================

    // sync eval
    var title = yield browser.eval(function(){
        return document.title;
    });
    var value = yield browser.eval(function(arg1, arg2){
        return arg1;
    }, 1, 2);
    var value = yield browser.eval(function(arg1, arg2){
        return arg1;
    }, [1, 2]);
    // async eval
    var value = yield browser.eval(function(arg1, arg2, done){
        setTimeout(function(){
            done(arg2);
        }, 2000);
    }, 1, 2);
    // pass element to eval
    var tagName = yield browser.eval(function(elements){
        return elements[0].tagName;
    }, yield browser.find('#id'));

    // ========================== element ==========================

    var elements = yield browser.wait('#id');// wait for element
    if(elements.length === 1){
        console.log('#id displayed');
    }
    yield elements.sleep(300); // sleep ms
    var elements = yield browser.wait('#id', 5000);// wait for element, 5000 ms timeout
    var elements = yield browser.wait('#id', {
    	timeout: 10000, // set timeout, default: 10000
    	displayed: true, // wait for element displayed, default: true
    	removed: false // wait for element removed, default: false
    });
    var elements = yield browser.wait('name', 'aaa', 5000); // support type: class name|css selector|id|name|link text|partial link text|tag name|xpath

    var elements = yield browser.find('#id'); // find element
    var elements = yield browser.findVisible('span'); // find visible element
    var elements = yield browser.find('active');// get active element
    var elements = yield browser.find('#id');// get element by css selector
    var elements = yield browser.find('//html/body');// get element by xpath
    var elements = yield browser.find('name', 'aaa'); // support type: class name|css selector|id|name|link text|partial link text|tag name|xpath
    var elements = yield elements.find('.class'); // find all child element
    var isEqual = yield elements.equal('#bbb a'); // test if two elements refer to the same DOM element.

    // elements filter with sync mode
    var elements = yield elements.get(0); // get element by index
    var elements = yield elements.first(); // get first element
    var elements = yield elements.last(); // get last element
    var elements = yield elements.slice(1, 2); // get element from start to end

    // elements filter for chain promise
    elements.get(0, true).click(); // get element by index
    elements.first(0, true).click(); // get first element
    elements.last(0, true).click(); // get last element
    elements.slice(1, 2, true).click(); // get element from start to end

    // traversal the elements
    for(var i=0;i<elements.length;i++){
        var element = yield elements.get(i);
        console.log(yield element.text());
    }

    var tagName = yield element.tagName(); // get tagname (first element)
    var value = element.val(); // equal to element.attr('value');
    yield element.val('mp3'); // equal to: element.clear().sendKeys('mp3');
    var value = yield element.attr('id'); // get attribute value (first element)
    var value = yield element.prop('id'); // get property value (first element)
    var info = yield element.rect(); // get rect info (first element)
    var value = yield element.css('border'); // get css value (first element)
    yield element.clear(); // clear input & textarea value
    var text = yield element.text(); // get displayed text (first element)

    var offset = yield element.offset(); // get offset from left top corner of the page (first element)
    var offset = yield element.offset(true); // get offset from left top corner of the screen (first element)
    var size = yield element.size(); // return {width: 100, height: 100} (first element)
    var isDisplayed = yield element.displayed(); // determine if an element is currently displayed (first element)
    var isEnabled = yield element.enabled(); //is element enabled (first element)
    var isSelected = yield element.selected(); // is element selected (first element)

    // select option
    yield element.select(0); // select index
    yield element.select('book'); // select value
    yield element.select({
        type: 'value', // index | value | text
        value: 'book'
    });

    yield element.sendKeys('abc'); // send keys to element
    var Keys = browser.Keys;
    yield element.sendKeys('a'+Keys.LEFT);
    yield element.sendKeys('{CTRL}a{CTRL}');

    yield element.click(); // click element
    yield element.dblClick(); // dblClick element
    yield element.dragDropTo('#id'); // dragDrop to element (first element)
    yield element.dragDropTo('#id', 10, 10); // dragDrop to element (first element)
    yield element.dragDropTo({
        selector: '#id',
        x: 10,
        y: 10
    }); // dragDrop to element (first element)

    var fileElement = browser.wait('#file');
    yield fileElement.uploadFile('c:/test.jpg');// upload file to browser machine and set temp path to <input type="file">
    yield element.submit();// submit form

    // ========================== mobile api ==========================
    // touch down, touch move, touch up
    yield browser.touchDown(10, 10);
    yield browser.touchDown({
        x: 10, // X coordinate on the screen.
        y: 10  // Y coordinate on the screen.
    });
    yield browser.touchMove(10, 10);
    yield browser.touchMove({
        x: 10, // X coordinate on the screen.
        y: 10  // Y coordinate on the screen.
    });
    yield browser.touchUp(10, 10);
    yield browser.touchUp({
        x: 10, // X coordinate on the screen.
        y: 10  // Y coordinate on the screen.
    });
    // scroll
    yield browser.touchScroll(10, 10); // Use this command if you don't care where the scroll starts on the screen
    yield browser.touchScroll({
        x: 10, // The x offset in pixels to scrollby.
        y: 10  // The y offset in pixels to scrollby.
    });
    // flick
    yield browser.touchFlick({ // Use this flick command if you don't care where the flick starts on the screen.
        xspeed: 5, // The x speed in pixels per second.
        yspeed: 0  // The y speed in pixels per second.
    });

    // element api
    var element = yield browser.find('#id');
    yield element.touchClick();
    yield element.touchDblClick();
    yield element.touchLongClick();
    yield element.touchScroll(10, 10);
    yield element.touchScroll({
        x: 10, // The x offset in pixels to scroll by.
        y: 10  // The y offset in pixels to scroll by.
    });
    yield element.touchFlick(10, 10, 5); // flick to x: 10, y: 10 with speed 5
    yield element.touchFlick({
        x: 10, // The x offset in pixels to flick by.
        y: 10, // The y offset in pixels to flick by.
        speed: 5 // The speed in pixels per seconds
    });

    var orientation = yield browser.orientation(); // return LANDSCAPE|PORTRAIT
    yield browser.orientation('LANDSCAPE'); // set orientation: LANDSCAPE|PORTRAIT

    // ========================== geo location ==========================

    var loc = yield browser.geolocation(); // return {latitude: number, longitude: number, altitude: number}
    yield browser.geolocation(1, 1, 1); // set location
    yield browser.geolocation({
        latitude: 1,
        longitude: 1,
        altitude: 1
    });

    // ========================== macaca api ==========================

    var arrContexts = yield browser.contexts(); // get all contexts
    var contextId = yield browser.context(); // get context id
    yield browser.context('NATIVE_APP'); // set context id
    yield browser.native(); // set context to native
    yield browser.webview(); // set context to webview

    // tap
    yield browser.sendActions('tap', { x: 100, y: 100});
    yield element.sendActions('tap');

    // doubleTap
    yield browser.sendActions('doubleTap', { x: 100, y: 100});
    yield element.sendActions('doubleTap');

    // press
    yield browser.sendActions('press', { x: 100, y: 100});
    yield element.sendActions('press', { duration: 2 });

    // pinch
    yield element.sendActions('pinch', { scale: 2 }); // ios
    yield element.sendActions('pinch', { direction: "in", percent: 50 }); // android

    // rotate
    yield element.sendActions('rotate', { rotation: 6, velocity: 1 });

    // drag
    yield driver.sendActions('drag', { fromX: 100, fromY: 100, toX: 200, toY: 200 });
    yield element.sendActions('drag', { toX: 200, toY: 200 })

}).then(function(){
    console.log('All done!')
}).catch(function(error){
    console.log(error);
});
