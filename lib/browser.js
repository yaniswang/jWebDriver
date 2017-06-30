'use strict';
/**
 * This class is used for control browser.
 * @class Browser
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const PromiseClass = require('promiseclass');
const extend = require('xtend');
const Zip = require('node-zip');
const gm = require('gm');
const HostsProxy = require('./hostsproxy');

const Elements = require('./elements');

// default options for browser
const defaultBrowserOptions = {
    'browserName': 'chrome',
    'version': 'ANY',
    'platform': 'ANY'
};

// nick name for browser
const mapBrowserNickName = {
    'ie': 'internet explorer',
    'ff': 'firefox',
    'edge': 'MicrosoftEdge'
};

// https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/click
const MouseButtons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};

// https://code.google.com/p/selenium/wiki/JsonWireProtocol#/session/:sessionId/element/:id/value
const Keys = {
    NULL: '\uE000',
    CANCEL: '\uE001',
    HELP: '\uE002',
    BACK_SPACE: '\uE003',
    TAB: '\uE004',
    CLEAR: '\uE005',
    RETURN: '\uE006',
    ENTER: '\uE007',
    SHIFT: '\uE008',
    CONTROL: '\uE009',
    CTRL: '\uE009',
    ALT: '\uE00A',
    PAUSE: '\uE00B',
    ESCAPE: '\uE00C',
    SPACE: '\uE00D',
    PAGE_UP: '\uE00E',
    PAGE_DOWN: '\uE00F',
    END: '\uE010',
    HOME: '\uE011',
    ARROW_LEFT: '\uE012',
    LEFT: '\uE012',
    ARROW_UP: '\uE013',
    UP: '\uE013',
    ARROW_RIGHT: '\uE014',
    RIGHT: '\uE014',
    ARROW_DOWN: '\uE015',
    DOWN: '\uE015',
    INSERT: '\uE016',
    DELETE: '\uE017',
    SEMICOLON: '\uE018',
    EQUALS: '\uE019',

    NUMPAD0: '\uE01A',
    NUMPAD1: '\uE01B',
    NUMPAD2: '\uE01C',
    NUMPAD3: '\uE01D',
    NUMPAD4: '\uE01E',
    NUMPAD5: '\uE01F',
    NUMPAD6: '\uE020',
    NUMPAD7: '\uE021',
    NUMPAD8: '\uE022',
    NUMPAD9: '\uE023',
    MULTIPLY: '\uE024',
    ADD: '\uE025',
    SEPARATOR: '\uE026',
    SUBTRACT: '\uE027',
    DECIMAL: '\uE028',
    DIVIDE: '\uE029',

    F1: '\uE031',
    F2: '\uE032',
    F3: '\uE033',
    F4: '\uE034',
    F5: '\uE035',
    F6: '\uE036',
    F7: '\uE037',
    F8: '\uE038',
    F9: '\uE039',
    F10: '\uE03A',
    F11: '\uE03B',
    F12: '\uE03C',

    COMMAND: '\uE03D',
    META: '\uE03D'
};

const mapCapabilities = {
    javascript: 'javascriptEnabled',
    cssselector: 'cssSelectorsEnabled',
    screenshot: 'takesScreenshot',
    storage: 'webStorageEnabled',
    alert: 'handlesAlerts',
    database: 'databaseEnabled',
    rotatable : 'rotatable'
};

const Browser = PromiseClass.create({

    /**
     * mouse buttons
     * @property MouseButtons
     * @public
     */
    MouseButtons: MouseButtons,

    /**
     * keyboard buttons
     * @property Keys
     * @public
     */
    Keys: Keys,

    /**
     * init browser instance
     * @method constructor
     * @private
     * @param  {JWebDriver} driver JWebDriver instance
     * @param  {String|Object} browserName or capabilitie object
     * @param  {String} version
     * @param  {String} platform
     * @param  {Function} done callback function
     */
    constructor(driver, browserName, version, platform){
        let self = this;
        self._driver = driver;
        self.browserName = browserName;
        self.version = version;
        self.platform = platform;
    },

    /**
     * init browser
     * @method init
     * @private
     * @param  {Function} done callback function
     */
    init(done){
        let self = this;
        let driver = self._driver;
        let browserName = self.browserName;
        let version = self.version;
        let platform = self.platform;
        let sessionInfo = {};
        if(typeof browserName === 'object'){
            if(browserName.sessionId){
                self.sessionId = browserName.sessionId;
                return done();
            }
            sessionInfo = browserName;
        }
        else{
            sessionInfo.browserName = browserName;
            if(version){
                sessionInfo.version = version;
            }
            if(platform){
                sessionInfo.platform = platform;
            }
        }
        browserName = sessionInfo.browserName;
        if(browserName && (browserName = mapBrowserNickName[browserName])){
            sessionInfo.browserName = browserName;
        }
        if(sessionInfo.browserName){
            sessionInfo = extend({}, defaultBrowserOptions, sessionInfo);
        }
        new Promise(function(resolve){
            let hosts = sessionInfo.hosts;
            if(hosts){
                // support hosts
                delete sessionInfo['hosts'];
                let config = {
                    mode: 'hosts',
                    hosts: hosts
                };
                let hostsProxy = HostsProxy.createServer(config);
                hostsProxy.on('error', function(){});
                hostsProxy.listen(0, function(msg){
                    let localIp = getLocalIP();
                    let proxyHost = localIp+':'+msg.port;
                    sessionInfo.proxy = {
                        'proxyType': 'manual',
                        'httpProxy': proxyHost,
                        'sslProxy': proxyHost
                    };
                    self._hostsProxy = hostsProxy;
                    resolve(sessionInfo);
                });
            }
            else{
                resolve(sessionInfo);
            }
        }).then(function(sessionInfo){
            let sessionOptions = {
                'desiredCapabilities': sessionInfo
            };
            driver.execCmd('newSession', {}, sessionOptions, function(error, ret){
                if(error){
                    done(error);
                }
                else{
                    self.sessionId = ret.sessionId;
                    let capabilities = ret.value;
                    self.capabilities = capabilities;
                    self.browserMode = capabilities['browserName'] ? true : false;
                    self.mobileMode = !self.browserMode;
                    if(self.browserMode){
                        self.browserName = capabilities['browserName'] || self.browserName;
                        self.version = capabilities['version'] || self.version;
                        self.platform = capabilities['platform'] || self.platform;
                    }
                    done();
                }
            }).catch(done);
        }).catch(done);
    },

    /**
     * save log
     * @method log
     * @public
     * @param  {COMMAND|DATA|RESULT|ERROR|WARNING|INFO} type log type
     * @param  {Object} message log message
     */
    log(type, message){
        this._driver.log(type, message);
    },

    /**
     * execute protocal command with this session
     * @method execCmd
     * @public
     * @param  {String} cmd protocal command, defined in command.js
     * @param  {Object} [pathData] replace the path parameters, no need to add sessionId
     * @param  {Object} [data] send data to protocal api
     * @param  {Function} done callback function
     * @return {Object} the return object from webdriver server
     */
    execCmd(cmd, pathData, data, done){
        let self = this;
        if(typeof pathData === 'function'){
            pathData = undefined;
            data = undefined;
        }
        else if(typeof data === 'function'){
            data = undefined;
        }
        done = getDone(arguments);
        pathData = pathData || {};
        pathData.sessionId = self.sessionId;
        self._driver.execCmd(cmd, pathData, data, done);
    },

    /**
     * get browser info
     * @method info
     * @public
     * @return {Object} info object
     */
    info(){
        return this.capabilities;
    },

    /**
     * get capability support
     * @method support
     * @public
     * @param  {String} capability
     * @return {Object} info object
     */
    support(capability){
        let capabilities = this.capabilities;
        let rawCapability = mapCapabilities[capability.toLowerCase()];
        return rawCapability && capabilities[rawCapability] || false;
    },

    /**
     * sleep sync
     * @method sleep
     * @public
     * @param  {Number} ms millisecond
     * @param  {Function} done callback function
     */
    sleep(ms, done){
        this._driver.sleep(ms, done);
    },

    /**
     * config webdriver options
     * @method config
     * @public
     * @param  {String} options options for webdriver config
     * @param  {Function} done callback function
     */
    config(options, done){
        let self = this;
        // timeout
        let pageloadTimeout = options.pageloadTimeout;
        let scriptTimeout = options.scriptTimeout;
        let asyncScriptTimeout = options.asyncScriptTimeout;
        let implicitTimeout = options.implicitTimeout;
        Promise.resolve().then(function(){
            if(pageloadTimeout){
                return self.execCmd('configTimeouts', {}, {
                    'type': 'page load',
                    'ms': pageloadTimeout
                });
            }
        }).then(function(){
            if(scriptTimeout){
                return self.execCmd('configTimeouts', {}, {
                    'type': 'script',
                    'ms': scriptTimeout
                });
            }
        }).then(function(){
            if(asyncScriptTimeout){
                return self.execCmd('configAsyncScriptTimeout', {}, {
                    'ms': asyncScriptTimeout
                });
            }
        }).then(function(){
            if(implicitTimeout){
                return self.execCmd('configImplicitTimeout', {}, {
                    'ms': implicitTimeout
                });
            }
        }).then(function(){
            done();
        }).catch(done);
    },

    /**
     * goto url or get url
     * @method url
     * @public
     * @param  {String} [url] url for goto
     * @param  {Function} done callback function
     * @return {url|this} return this or url
     */
    url(url, done){
        let self = this;
        if(typeof url === 'function'){
            url = undefined;
        }
        done = getDone(arguments);
        // goto url
        if(url){
            self.execCmd('setUrl', {}, {
                'url': url
            }, done);
        }
        // get url
        else{
            self.execCmd('getUrl', function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * execute script in browser
     * @method exec
     * @public
     * @param  {String|Function} script function to exec
     * @param  {Array} [args] arguments send to script
     * @param  {Function} done callback function
     * @return {any} js function returned value
     */
    exec(script, args, done){
        let self = this;
        if(typeof args === 'function'){
            args = undefined;
        }
        done = getDone(arguments);
        args = args !== undefined ? args : [];
        if(args instanceof Array === false){
            args = Array.prototype.slice.call(arguments);
            script = args.shift();
            args.pop();
        }
        if(typeof script === 'string' || typeof script === 'function'){
            let isAsync = /(\(|,)\s*(done|callback|cb)\)/i.test(script);
            script = String(script);
            // support for: return document.title;
            if(/^\s*function\s*\(/.test(script) === false){
                script = 'function(){'+script+'}';
            }
            script = 'return (' + script + ').apply(null, arguments);';
            script = script.replace(/\n/g, '');
            args = args.map(function(arg){
                if(arg instanceof Elements){
                    arg.toJSON(function(error, json){
                        arg = json;
                    });
                }
                return arg;
            });
            self.execCmd(isAsync?'execASync':'exec', {}, {
                script: script,
                args: args
            }, function(error, ret){
                done(error?'exec timeout':null, ret && ret.value);
            });
        }
        else{
            done('First param must be string or function');
        }
    },

    /**
     * execute script in browser
     * @method eval
     * @public
     * @param  {String|Function} script function to eval
     * @param  {Array} [args] arguments send to script
     * @param  {Function} done callback function
     * @return {any} js function returned value
     */
    eval(script, args, done){
        //jshint unused:false
        this.exec.apply(this, arguments);
    },

    /**
     * get current window handle
     * @method windowHandle
     * @public
     * @param  {Boolean} useCache
     * @param  {Function} done callback function
     * @return {String} window handle
     */
    windowHandle(useCache, done){
        let self = this;
        if(typeof useCache === 'function'){
            useCache = undefined;
        }
        done = getDone(arguments);
        let windowHandle = self._windowHandle;
        if(useCache && windowHandle){
            done(null, windowHandle);
        }
        else if(self.browserMode){
            self.execCmd('getCurrentWindowHandle', function(error, ret){
                if(ret){
                    self._windowHandle = ret.value;
                }
                done(error, ret && ret.value);
            });
        }
        else{
            self._windowHandle = 'current';
            done(null, self._windowHandle);
        }
    },

    /**
     * get all window handles
     * @method windowHandles
     * @public
     * @param  {Function} done callback function
     * @return {Array} window handle
     */
    windowHandles(done){
        this.execCmd('getAllWindowHandles', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * switch to window
     * @method switchWindow
     * @public
     * @param  {String} windowHandle window handle
     * @param  {Function} done callback function
     */
    switchWindow(windowHandle, done){
        let self = this;
        new Promise(function(resolve){
            if(typeof windowHandle === 'number'){
                self.windowHandles(function(error, ret){
                    windowHandle = ret[windowHandle];
                    if(windowHandle === undefined){
                        done('Window index overflow');
                    }
                    else{
                        resolve(windowHandle);
                    }
                });
            }
            else{
                resolve(windowHandle);
            }
        }).then(function(windowHandle){
            self.execCmd('switchWindow', {}, {
                name: windowHandle
            }, function(error, ret){
                self._windowHandle = windowHandle;
                done(error, ret);
            });
        });
    },

    /**
     * open new window
     * @method newWindow
     * @public
     * @param  {String} windowHandle window handle
     * @param  {Function} done callback function
     * @return {String} return window handle
     */
    newWindow(url, name, features, done){
        let self = this;
        if(typeof name === 'function'){
            name = undefined;
            features = undefined;
        }
        else if(typeof features === 'function'){
            features = undefined;
        }
        done = getDone(arguments);
        let script = 'function(url, name, features){window.open(url, name, features);}';
        self.exec(script, url, name, features).then(function(){
            return self.windowHandles();
        }).then(function(arrWindowHandles){
            done(null, arrWindowHandles[arrWindowHandles.length-1]);
        }).catch(done);
    },

    /**
     * get all frame elements
     * @method frames
     * @public
     * @param  {Function} done callback function
     * @return {Element}
     */
    frames(done){
        this.find('//iframe', done);
    },

    /**
     * switch to frame or main page
     * @method switchFrame
     * @public
     * @param  {Elements|String} frame
     * @param  {Function} done callback function
     */
    switchFrame(frame, done){
        let self = this;
        new Promise(function(resolve){
            if(typeof frame === 'string'){
                resolve(self.find(frame));
            }
            else{
                resolve(frame);
            }
        }).then(function(frame){
            if(frame instanceof Elements){
                return frame.toJSON(true);
            }
            else{
                return frame;
            }
        }).then(function(frame){
            self.execCmd('switchFrame', {}, {
                id : frame
            }, done);
        });
    },

    /**
     * switch to parent frame
     * @method switchFrameParent
     * @public
     * @param  {Function} done callback function
     */
    switchFrameParent(done){
        this.execCmd('switchFrameParent', done);
    },

    /**
     * close current window
     * @method closeWindow
     * @public
     * @param  {Function} done callback function
     */
    closeWindow(done){
        this.execCmd('closeWindow', done);
    },

    /**
     * get or set position of window
     * @method position
     * @public
     * @param  {Number|Object} [x] x position
     * @param  {Number|Object} [x] x position
     * @param  {Function} done callback function
     * @return {Object|this} return {x:1,y:1} or this
     */
    position(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        Promise.resolve(self.windowHandle(true)).then(function(windowHandle){
            if(x === undefined){
                return self.execCmd('getWindowPosition', {
                    windowHandle: windowHandle
                }, function(error, ret){
                    done(error, ret && ret.value);
                });
            }
            else if(x.x !== undefined){
                y = x.y;
                x = x.x;
            }
            self.execCmd('setWindowPosition', {
                windowHandle: windowHandle
            }, {
                x: x,
                y: y
            }, done);
        }).catch(done);
    },

    /**
     * get or set size of window
     * @method size
     * @public
     * @param  {Number|Object} [width]
     * @param  {Number|Object} [height]
     * @param  {Function} done callback function
     * @return {Object|this} return {width:1,height:1} or this
     */
    size(width, height, done){
        let self = this;
        if(typeof width === 'function'){
            width = undefined;
            height = undefined;
        }
        else if(typeof height === 'function'){
            height = undefined;
        }
        done = getDone(arguments);
        Promise.resolve(self.windowHandle(true)).then(function(windowHandle){
            if(width === undefined){
                return self.execCmd('getWindowSize', {
                    windowHandle: windowHandle
                }, function(error, ret){
                    done(error, ret && ret.value);
                });
            }
            else if(width.width !== undefined){
                height = width.height;
                width = width.width;
            }
            self.execCmd('setWindowSize', {
                windowHandle: windowHandle
            }, {
                width: width,
                height: height
            }, done);
        }).catch(done);
    },

    /**
     * maximize the window
     * @method maximize
     * @public
     * @param  {Function} done callback function
     */
    maximize(done){
        let self = this;
        Promise.resolve(self.windowHandle(true)).then(function(windowHandle){
            self.execCmd('maximizeWindow', {
                windowHandle : windowHandle
            }, done);
        }).catch(done);

    },

    /**
     * get screenshot
     * @method getScreenshot
     * @public
     * @param  {Object} [options] options for screenshot
     * @param  {Function} done callback function
     * @return {String} return screenshot by base64 format
     */
    getScreenshot(options, done){
        let self = this;
        if(typeof options === 'function'){
            options = {};
        }
        else{
            if(typeof options === 'string'){
                options = {
                    filename: options
                };
            }
        }
        done = getDone(arguments);
        let filename = options.filename;
        let elem = options.elem;
        self.execCmd('getScreenshot', function*(error, ret){
            let png64 = ret && ret.value;
            if(png64){
                if(elem){
                    let elems = yield self.wait(elem, 1000);
                    if(elems.length === 1){
                        let gmShot = gm(new Buffer(png64, 'base64')).quality(100);
                        let rect, x, y, width, height;
                        if(self.browserMode){
                            rect = yield self.eval(function(elems){
                                var rect = elems[0].getBoundingClientRect();
                                rect.devicePixelRatio = window.devicePixelRatio;
                                return rect;
                            }, elems);
                            let devicePixelRatio = rect.devicePixelRatio || 1;
                            x = rect.left * devicePixelRatio;
                            y = rect.top * devicePixelRatio;
                            width = rect.width * devicePixelRatio;
                            height = rect.height * devicePixelRatio;
                        }
                        else{
                            rect = yield elems.rect();
                            x = rect.x;
                            y = rect.y;
                            width = rect.width;
                            height = rect.height;
                        }
                        gmShot.crop(width, height, x, y);
                        png64 = yield new Promise((resolve) => gmShot.toBuffer('PNG', (error, buffer) => resolve(buffer)));
                        png64 =png64.toString('base64');
                    }
                }
                if(filename){
                    fs.writeFileSync(filename, png64, 'base64');
                }
            }
            done(error, png64);
        }).catch(done);
    },

    /**
     * get title
     * @method title
     * @public
     * @param  {Function} done callback function
     * @return {String} return document title
     */
    title(done){
        this.execCmd('getTitle', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get source
     * @method source
     * @public
     * @param  {Function} done callback function
     * @return {String} return source
     */
    source(done){
        this.execCmd('getSource', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * nick name of source
     * @method html
     * @public
     * @param  {Function} done callback function
     * @return {String} return document html
     */
    html(done){
        this.execCmd('getSource', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * refresh the window
     * @method refresh
     * @public
     * @param  {Function} done callback function
     */
    refresh(done){
        this.execCmd('setRefresh', done);
    },

    /**
     * back the window
     * @method back
     * @public
     * @param  {Function} done callback function
     */
    back(done){
        this.execCmd('setBack', done);
    },

    /**
     * forward the window
     * @method forward
     * @public
     * @param  {Function} done callback function
     */
    forward(done){
        this.execCmd('setForward', done);
    },

    /**
     * get all cookies
     * @method cookies
     * @public
     * @param  {Boolean} isArray
     * @param  {Function} done callback function
     * @return {Array} return all cookies
     */
    cookies(isArray, done){
        if(typeof isArray === 'function'){
            isArray = undefined;
        }
        done = getDone(arguments);
        this.execCmd('getAllCookies', function(error, ret){
            if(error){
                done(error);
            }
            else{
                let arrCookies = ret.value;
                if(isArray){
                    done(null, arrCookies);
                }
                else{
                    let mapCookies = {};
                    arrCookies.forEach(function(cookie){
                        mapCookies[cookie.name] = cookie;
                    });
                    done(null, mapCookies);
                }
            }
        });

    },

    /**
     * get or set cookie
     * @method cookie
     * @public
     * @param  {String} name cookie name
     * @param  {String} [value] cookie value
     * @param  {Object} [options] options for cookie
     * @param  {Function} done callback function
     * @return {String} return cookie value or this
     */
    cookie(name, value, options, done){
        let self = this;
        if(typeof value === 'function'){
            value = undefined;
            options = undefined;
        }
        else if(typeof options === 'function'){
            options = undefined;
        }
        done = getDone(arguments);
        let cookieInfo;
        if(value === undefined){
            self.cookies(function(error, ret){
                if(error){
                    done(error);
                }
                else{
                    cookieInfo = ret[name];
                    done(null, cookieInfo && cookieInfo.value);
                }
            });
        }
        else{
            cookieInfo = options || {};
            cookieInfo.name = String(name);
            cookieInfo.value = String(value);
            let expiry = cookieInfo.expiry;
            if(expiry && typeof expiry === 'string'){
                let match = expiry.match(/^(\d+)\s*(second|minute|hour|day|month|year)s?$/);
                if(match !== null){
                    let number = parseInt(match[1], 10);
                    let unit = match[2];
                    let date = new Date();
                    switch(unit){
                        case 'second':
                            date.setSeconds(date.getSeconds() + number);
                            break;
                        case 'minute':
                            date.setMinutes(date.getMinutes() + number);
                            break;
                        case 'hour':
                            date.setHours(date.getHours() + number);
                            break;
                        case 'day':
                            date.setDate(date.getDate() + number);
                            break;
                        case 'month':
                            date.setMonth(date.getMonth() + number);
                            break;
                        case 'year':
                            date.setFullYear(date.getFullYear() + number);
                            break;
                    }
                    cookieInfo.expiry = date.getTime() / 1000;
                }
                else{
                    done('Bad format for expiry: ' + expiry);
                }
            }
            self.execCmd('setCookie', {}, {
                cookie: cookieInfo
            }, done);
        }
    },

    /**
     * remove cookie
     * @method removeCookie
     * @public
     * @param  {String} name cookie name
     * @param  {Function} done callback function
     */
    removeCookie(name, done){
        this.execCmd('delCookie', {
            name: name
        }, done);
    },

    /**
     * clear all cookies
     * @method clearCookies
     * @public
     * @param  {Function} done callback function
     */
    clearCookies(done){
        this.execCmd('clearAllCookies', done);
    },

    /**
     * get all local storage keys
     * @method localStorageKeys
     * @public
     * @param  {Function} done callback function
     * @return {Array} return all local storage keys
     */
    localStorageKeys(done){
        this.execCmd('getAllLocalStorageKeys', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get or set local storage
     * @method localStorage
     * @public
     * @param  {String} name local storage name
     * @param  {String} [value] local storage value
     * @param  {Function} done callback function
     * @return {String} return local storage value or this
     */
    localStorage(name, value, done){
        let self = this;
        if(typeof value === 'function'){
            value = undefined;
        }
        done = getDone(arguments);
        if(value !== undefined){
            self.execCmd('setLocalStorage', {}, {
                key: String(name),
                value: String(value)
            }, done);
        }
        else{
            self.execCmd('getLocalStorage', {
                key: String(name)
            }, function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * remove local storage
     * @method removeLocalStorage
     * @public
     * @param  {String} name local storage name
     * @param  {Function} done callback function
     */
    removeLocalStorage(name, done){
        this.execCmd('deleteLocalStorage', {
            key: name
        }, done);
    },

    /**
     * clear all local storage
     * @method clearLocalStorages
     * @public
     * @param  {Function} done callback function
     */
    clearLocalStorages(done){
        this.execCmd('clearAllLocalStorages', done);
    },

    /**
     * get all session storage keys
     * @method sessionStorageKeys
     * @public
     * @param  {Function} done callback function
     * @return {Array} return all session storage keys
     */
    sessionStorageKeys(done){
        this.execCmd('getAllSessionStorageKeys', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get or set session storage
     * @method sessionStorage
     * @public
     * @param  {String} name session storage name
     * @param  {String} [value] session storage value
     * @param  {Function} done callback function
     * @return {String} return session storage value or this
     */
    sessionStorage(name, value, done){
        let self = this;
        if(typeof value === 'function'){
            value = undefined;
        }
        done = getDone(arguments);
        if(value !== undefined){
            self.execCmd('setSessionStorage', {}, {
                key: String(name),
                value: String(value)
            }, done);
        }
        else{
            self.execCmd('getSessionStorage', {
                key: String(name)
            }, function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * remove session storage
     * @method removeSessionStorage
     * @public
     * @param  {String} name session storage name
     * @param  {Function} done callback function
     */
    removeSessionStorage(name, done){
        this.execCmd('deleteSessionStorage', {
            key: name
        }, done);
    },

    /**
     * clear all session storage
     * @method clearSessionStorages
     * @public
     * @param  {Function} done callback function
     */
    clearSessionStorages(done){
        this.execCmd('clearAllSessionStorages', done);
    },

    /**
     * get alert text
     * @method getAlert
     * @public
     * @param  {Function} done callback function
     * @return {String}
     */
    getAlert(done){
        this.execCmd('getAlert', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * accept alert or confirm
     * @method acceptAlert
     * @public
     * @param  {Function} done callback function
     */
    acceptAlert(done){
        this.execCmd('acceptAlert', done);
    },

    /**
     * dismiss confirm
     * @method dismissAlert
     * @public
     * @param  {Function} done callback function
     */
    dismissAlert(done){
        this.execCmd('dismissAlert', done);
    },

    /**
     * set text to prompt
     * @method setAlert
     * @public
     * @param  {String} text
     * @param  {Function} done callback function
     */
    setAlert(text, done){
        this.execCmd('setAlert', {}, {
            text: text
        }, done);
    },

    /**
     * send keys to browser
     * @method sendKeys
     * @public
     * @param  {String} text
     * @param  {Function} done callback function
     */
    sendKeys(text, done){
        let self = this;
        let Keys = self.Keys;
        text = text.replace(/{(\w+)}/g, function(all, name){
            let key = Keys[name.toUpperCase()];
            return key?key:all;
        });
        self.execCmd('sendKeys', {}, {
            value: text.split('')
        }, done);
    },

    /**
     * check sticky key
     * @method isStickyKey
     * @public
     * @param  {String} key
     * @return {Boolean}
     */
    isStickyKey(key){
        let Keys = this.Keys;
        return key === Keys.CTRL || key === Keys.SHIFT || key === Keys.ALT || key === Keys.META;
    },

    /**
     * send keydown
     * @method keyDown
     * @public
     * @param  {String} key
     * @param  {Function} done callback function
     */
    keyDown(key, done){
        let self = this;
        let Keys = self.Keys;
        key = Keys[key.toUpperCase()] || key;
        if(self.isStickyKey(key)){
            self.sendKeys(key, done);
        }
        else{
            done('keyDown or keyUp only support: CTRL|SHIFT|ALT|COMMAND|META');
        }
    },

    /**
     * send keyup
     * @method keyUp
     * @public
     * @param  {String} key
     * @param  {Function} done callback function
     */
    keyUp(key, done){
        let self = this;
        let Keys = self.Keys;
        key = Keys[key.toUpperCase()] || key;
        if(self.isStickyKey(key)){
            self.sendKeys(key, done);
        }
        else{
            done('keyDown or keyUp only support: CTRL|SHIFT|ALT|COMMAND|META');
        }
    },

    /**
     * send mousemove (first element)
     * @method mouseMove
     * @public
     * @param  {Elements|String} elements
     * @param  {Number|Object} [x]
     * @param  {Number} [y]
     * @param  {Function} done callback function
     */
    mouseMove(elements, x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        new Promise(function(resolve){
            if(typeof elements === 'string'){
                resolve(self.find(elements));
            }
            else{
                resolve(elements);
            }
        }).then(function(elements){
            let data = {};
            if(elements.length > 0){
                data.element = elements.elementIds[0];
            }
            else{
                return done('Elements empty: '+ elements.value+' ('+elements.using+')');
            }
            if(x !== undefined && x.x !== undefined){
                y = x.y;
                x = x.x;
            }
            if(x !== undefined && y !== undefined){
                data.xoffset = x;
                data.yoffset = y;
            }
            self.execCmd('mouseMove', {}, data, done);
        }).catch(done);
    },

    /**
     * send mousedown
     * @method mouseDown
     * @public
     * @param  {String} [key]
     * @param  {Function} done callback function
     */
    mouseDown(key, done){
        let self = this;
        if(typeof key === 'function'){
            key = undefined;
        }
        done = getDone(arguments);
        if(typeof key === 'string'){
            let MouseButtons = self.MouseButtons;
            key = key.toUpperCase();
            key = MouseButtons[key] || 0;
        }
        self.execCmd('mouseDown', {}, {
            button: key || 0
        }, done);
    },

    /**
     * send mouseup
     * @method mouseUp
     * @public
     * @param  {String} [key]
     * @param  {Function} done callback function
     */
    mouseUp(key, done){
        let self = this;
        if(typeof key === 'function'){
            key = undefined;
        }
        done = getDone(arguments);
        if(typeof key === 'string'){
            let MouseButtons = self.MouseButtons;
            key = key.toUpperCase();
            key = MouseButtons[key] || 0;
        }
        self.execCmd('mouseUp', {}, {
            button: key || 0
        }, done);
    },

    /**
     * send click
     * @method click
     * @public
     * @param  {String} [key]
     * @param  {Function} done callback function
     */
    click(key, done){
        let self = this;
        if(typeof key === 'function'){
            key = undefined;
        }
        done = getDone(arguments);
        if(typeof key === 'string'){
            let MouseButtons = self.MouseButtons;
            key = key.toUpperCase();
            key = MouseButtons[key] || 0;
        }
        self.execCmd('click', {}, {
            button: key || 0
        }, done);
    },

    /**
     * send double Click
     * @method dblClick
     * @public
     * @param  {Function} done callback function
     */
    dblClick(done){
        this.execCmd('doubleClick', done);
    },

    /**
     * send double Click
     * @method doubleClick
     * @public
     * @param  {Function} done callback function
     */
    doubleClick(done){
        this.execCmd('doubleClick', done);
    },

    /**
     * drag one element to another
     * @method dragDrop
     * @public
     * @param  {Elements} from
     * @param  {Elements} to
     * @param  {Function} done callback function
     */
    dragDrop(from, to, done){
        let self = this;
        let fromOffset;
        if(from.selector){
            fromOffset = {
                x: from.x,
                y: from.y
            };
            from = from.selector;
        }
        let toOffset;
        if(to.selector){
            toOffset = {
                x: to.x,
                y: to.y
            };
            to = to.selector;
        }
        self.mouseMove(from, fromOffset).mouseDown().mouseMove(to, toOffset).mouseUp().then(function(){
            done();
        }).catch(done);
    },

    /**
     * find element
     * @method find
     * @public
     * @param  {String} [using] find mode: class name|css selector|id|name|link text|partial link text|tag name|xpath
     * @param  {String} value find pattern
     * @param  {Function} done callback function
     * @return {Elments}
     */
    find(using, value, done){
        if(typeof value === 'function'){
            value = undefined;
        }
        done = getDone(arguments);
        let elements = new Elements(this, using, value);
        elements.init(function(error){
            done(error, elements);
        }).catch(done);
    },

    /**
     * find visible element
     * @method findVisible
     * @public
     * @param  {String} [using] find mode: class name|css selector|id|name|link text|partial link text|tag name|xpath
     * @param  {String} value find pattern
     * @param  {Function} done callback function
     * @return {Elments}
     */
    findVisible(using, value, done){
        let self = this;
        if(typeof value === 'function'){
            value = undefined;
        }
        done = getDone(arguments);
        self.find(using, value, function*(error, elements){
            if(elements.length > 0){
                let json = yield elements.toJSON();
                // filter visible element
                let newJson = [];
                try{
                    newJson = yield self.exec('function(arg1){\
                        function curCSS(elem, name){\
                            var curStyle = elem.currentStyle;\
                            var style = elem.style;\
                            return (curStyle && curStyle[name]) || (style && style[name]);\
                        }\
                        function isHidden(elem){\
                            return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (curCSS( elem, "display" ) === "none");\
                        }\
                        var elements = arg1.elements;\
                        var newElements = [], element;\
                        for(var i in elements){\
                            element = elements[i];\
                            if(!isHidden(element)){\
                                newElements.push(element);\
                            }\
                        }\
                        return newElements;\
                    }', {elements: json});
                }
                catch(e){}
                if(newJson.length === 0){
                    let message = 'Find visible elements failed';
                    self.log('ERROR', message);
                    done(message);
                }
                else{
                    let elementIds = [];
                    newJson.forEach(function(element){
                        elementIds.push(element.ELEMENT);
                    });
                    elements.elementIds = elementIds;
                    elements.length = elementIds.length;
                    done(null, elements);
                }
            }
            else{
                done(error);
            }
        }).catch(done);
    },

    /**
     * wait for element displayed or removed
     * @method wait
     * @public
     * @param  {String} [using] find mode: class name|css selector|id|name|link text|partial link text|tag name|xpath
     * @param  {String} value find pattern
     * @param  {String} [options]
     * @param  {Function} done callback function
     * @return {Elments}
     */
    wait(using, value, options, done){
        let self = this;
        if(typeof options === 'function'){
            if(typeof value === 'string'){
                // using, value, done
                options = undefined;
            }
            else{
                // value, options, done
                options = value;
                value = using;
                using = undefined;
            }
        }
        else if(typeof value === 'function'){
            // value, done
            value = using;
            using = undefined;
            options = undefined;
        }
        done = getDone(arguments);
        if(typeof options === 'number'){
            options = {
                timeout: options
            };
        }
        options = extend({}, {
            timeout: 10000,
            displayed: true,
            removed: false
        }, options);
        let timeout = options.timeout;
        let removed = options.removed;
        let displayed = removed ? false : options.displayed;
        let noerror = options.noerror;
        let startTime = new Date().getTime();
        let _timer = null;
        waitElement();
        function endWait(error, result){
            clearInterval(_timer);
            done(error, result);
        }
        function waitElement(){
            self[(!self.mobileMode && displayed)?'findVisible':'find'](using, value, function(error, elements){
                if(elements){
                    if(removed === true && elements.length === 0){
                        // removed
                        return endWait(null, elements);
                    }
                    else if(removed === false && elements.length > 0){
                        if(displayed){
                            // displayed
                            return endWait(null, elements);
                        }
                        else{
                            // wait dom
                            return endWait(null, elements);
                        }
                    }
                }
                // timeout
                if(new Date().getTime() - startTime > timeout){
                    let message = 'Wait element '+(removed?'removed':'displayed')+' timeout: '+(using?(using+' ,'):'')+value+' ,' + timeout + 'ms';
                    self.log('ERROR', message);
                    if(noerror){
                        endWait(null, []);
                    }
                    else{
                        endWait(message);
                    }
                }
                else{
                    _timer = setTimeout(waitElement, 500);
                }
            });
        }
    },

    /**
     * scroll to
     * @method scrollTo
     * @public
     * @param  {Elements|String} [elements]
     * @param  {Number} [x]
     * @param  {Number} [y]
     * @param  {Function} done callback function
     */
    scrollTo(elements, x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        new Promise(function(resolve){
            if(typeof elements === 'string'){
                resolve(self.find(elements));
            }
            else{
                resolve(elements);
            }
        }).then(function(elements){
            if(elements instanceof Elements){
                return new Promise(function(resolve){
                    elements.offset(function(error, offset){
                        if(x !== undefined && x.x !== undefined){
                            y = x.y;
                            x = x.x;
                        }
                        offset.x += x || 0;
                        offset.y += y || 0;
                        x = offset.x;
                        y = offset.y;
                        resolve({
                            x: x,
                            y: y
                        });
                    });
                });
            }
            else{
                // no elements
                y = x;
                x = elements;
                if(x !== undefined && x.x !== undefined){
                    y = x.y;
                    x = x.x;
                }
                return {
                    x: x,
                    y: y
                };
            }

        }).then(function(offset){
            let script = 'function(x, y){window.scrollTo(x, y);}';
            self.exec(script, offset.x, offset.y, done);
        }).catch(done);
    },

    /**
     * upload file to browser machine
     * @method uploadFileToServer
     * @public
     * @param  {String} localPath
     * @param  {Function} done callback function
     * @return {String} webdriver server filepath
     */
    uploadFileToServer(localPath, done){
        let self = this;
        if(fs.existsSync(localPath)){
            let filedata = fs.readFileSync(localPath);
            let zip = new Zip();
            zip.file(path.basename(localPath), filedata);
            let base64zip = zip.generate({base64:true, compression:'DEFLATE'});
            self.execCmd('uploadFile', {}, {
                file: base64zip
            }, function(error, ret){
                done(error, ret && ret.value);
            });
        }
        else{
            done('localPath doesn\'t exist');
        }
    },

    /**
     * touch down
     * @method touchDown
     * @public
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Function} done callback function
     */
    touchDown(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            x = x.x;
        }
        self.execCmd('touchDown', {}, {
            x: x,
            y: y
        }, done);
    },

    /**
     * touch move
     * @method touchMove
     * @public
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Function} done callback function
     */
    touchMove(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            x = x.x;
        }
        self.execCmd('touchMove', {}, {
            x: x,
            y: y
        }, done);
    },

    /**
     * touch up
     * @method touchUp
     * @public
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Function} done callback function
     */
    touchUp(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            x = x.x;
        }
        self.execCmd('touchUp', {}, {
            x: x,
            y: y
        }, done);
    },

    /**
     * touch scroll
     * @method touchScroll
     * @public
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Function} done callback function
     */
    touchScroll(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            x = x.x;
        }
        self.execCmd('touchScroll', {}, {
            xoffset: x,
            yoffset: y,
        }, done);
    },

    /**
     * touch flick
     * @method touchFlick
     * @public
     * @param  {Number} xspeed
     * @param  {Number} yspeed
     * @param  {Function} done callback function
     */
    touchFlick(xspeed , yspeed, done){
        let self = this;
        if(typeof xspeed === 'function'){
            xspeed = undefined;
            yspeed = undefined;
        }
        else if(typeof yspeed === 'function'){
            yspeed = undefined;
        }
        done = getDone(arguments);
        if(xspeed !== undefined && xspeed.xspeed !== undefined){
            yspeed = xspeed.yspeed;
            xspeed = xspeed.xspeed;
        }
        self.execCmd('touchFlick', {}, {
            xspeed: xspeed,
            yspeed: yspeed,
        }, done);
    },

    /**
     * get or set orientation
     * @method orientation
     * @public
     * @param  {String} [orientation] orientation
     * @param  {Function} done callback function
     * @return {Object|this} return {x:1,y:1} or this
     */
    orientation(orientation, done){
        let self = this;
        if(typeof orientation === 'function'){
            orientation = undefined;
        }
        done = getDone(arguments);
        if(orientation){
            self.execCmd('setOrientation', {}, {
                orientation: orientation
            }, function(error, ret){
                done(error, ret && ret.value);
            });
        }
        else{
            self.execCmd('getOrientation', function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * get or set geolocation
     * @method geolocation
     * @public
     * @param  {Number|Object} [latitude] latitude
     * @param  {Number} [longitude] longitude
     * @param  {Number} [altitude] altitude
     * @param  {Function} done callback function
     * @return {Object} return {latitude:1, longitude:1, altitude:1}
     */
    geolocation(latitude, longitude, altitude, done){
        let self = this;
        if(typeof latitude === 'function'){
            latitude = undefined;
        }
        done = getDone(arguments);
        if(latitude !== undefined && latitude.latitude !== undefined){
            longitude = latitude.longitude;
            altitude = latitude.altitude;
            latitude = latitude.latitude;
        }
        if(latitude !== undefined){
            self.execCmd('setLocation', {}, {
                location: {
                    latitude: latitude,
                    longitude: longitude,
                    altitude: altitude
                }
            }, function(error, ret){
                done(error, ret && ret.value);
            });
        }
        else{
            self.execCmd('getLocation', function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * close session
     * @method close
     * @public
     * @param  {Function} done callback function
     */
    close(done){
        let self = this;
        self.execCmd('delSession', function(error){
            let hostsProxy = self._hostsProxy;
            if(hostsProxy){
                hostsProxy.close(function(){
                    done(error);
                });
            }
            else{
                done(error);
            }
        });
    },

    /**
     * get contexts
     * @method contexts
     * @param  {Function} done callback function
     */
    contexts(done){
        this.execCmd('getContexts', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get or set context
     * @method context
     * @public
     * @param  {String} [contextId] context id
     * @param  {Function} done callback function
     */
    context(contextId, done){
        let self = this;
        if(typeof contextId === 'function'){
            contextId = undefined;
        }
        done = getDone(arguments);
        if(contextId){
            self.browserMode = contextId !== 'NATIVE_APP';
        }
        self.execCmd(contextId ? 'setContext' : 'getContext', {}, {
            name: contextId
        }, function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * set context to native
     * @method native
     * @param  {Function} done callback function
     */
    native(){
        return this.contexts(function(error, arrContexts){
            return this.context(arrContexts[0]);
        });
    },

    /**
     * set context to webview
     * @method webview
     * @param  {Function} done callback function
     */
    webview(){
        return this.contexts(function(error, arrContexts){
            return this.context(arrContexts[arrContexts.length - 1]);
        });
    },

    /**
     * send actions
     * @method sendActions
     * @public
     * @param  {String} type
     * @param  {Object} params
     * @param  {Function} done callback function
     */
    sendActions(type, params, done){
        let actions = [];
        if(done === undefined){
            actions = Array.isArray(type) ? type : [{
                type: type
            }];
        }
        else{
            params.type = type;
            actions.push(params);
        }
        done = getDone(arguments);
        this.execCmd('setActions', {}, {
            actions: actions
        }, done);
    }

});


// get done callback
function getDone(args){
    let done = args[args.length -1];
    return typeof done === 'function' ? done : null;
}

// get local ip
function getLocalIP() {
    let ifaces = os.networkInterfaces();
    for (let dev in ifaces) {
        if(/(VirtualBox|Loopback)/i.test(dev) === false){
            let iface = ifaces[dev];
            for (let i = 0; i < iface.length; i++) {
                let alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                    return alias.address;
                }
            }
        }
    }
}

module.exports = Browser;
