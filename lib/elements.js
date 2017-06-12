'use strict';
/**
 * This class is used for control elements.
 * @class Elements
 */

const PromiseClass = require('promiseclass');

const Elements = PromiseClass.create({

    /**
     * init elements instance
     * @method constructor
     * @private
     * @param  {Browser} browser Browser instance
     * @param  {string} [using] find mode: class name|css selector|id|name|link text|partial link text|tag name|xpath
     * @param  {string} value find pattern
     */
    constructor(browser, using, value){
        let self = this;
        self._browser = browser;
        self.using = using;
        self.value = value;
        self.MouseButtons = browser.MouseButtons;
        self.Keys = browser.Keys;
    },

    /**
     * init elements
     * @method init
     * @private
     * @param  {Function} done callback function
     */
    init(done){
        let self = this;
        let browser = self._browser;
        let using = self.using;
        let value = self.value;
        if(value === undefined){
            value = using;
            using = undefined;
        }
        if(using === undefined){
            // get current active element
            if(value === 'active'){
                return browser.execCmd('getActiveElement', function(error, ret){
                    if(error){
                        done(error);
                    }
                    else{
                        self.elementIds = [ret.value.ELEMENT];
                        self.length = 1;
                        done();
                    }
                });
            }
            else{
                using = /^\.?\//.test(value)?'xpath':'css selector';
                self.using = using;
                self.value = value;
            }
        }
        if(using === 'elements'){
            self.elementIds = value;
            self.length = value.length;
            return done();
        }
        else{
            browser.execCmd('findElements', {}, {
                using: using,
                value: value
            }, function(error, ret){
                if(error){
                    done(error);
                }
                else{
                    let arrElements = ret.value;
                    if(arrElements.length > 0){
                        let elementIds = arrElements.map(function(element){
                            return element.ELEMENT;
                        });
                        self.elementIds = elementIds;
                        self.length = elementIds.length;
                        done();
                    }
                    else{
                        let message = 'Find elements failed: ' + using + ', ' + value;
                        self.log('ERROR', message);
                        done(message);
                    }
                }
            });
        }
    },

    /**
     * save log
     * @method log
     * @public
     * @param  {COMMAND|DATA|RESULT|ERROR|WARNING|INFO} type log type
     * @param  {Object} message log message
     */
    log(type, message){
        this._browser.log(type, message);
    },

    /**
     * execute protocal command with this elements
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
        if(self.length > 0){
            let browser = self._browser;
            let elementIds = self.elementIds.concat();
            pathData = pathData || {};
            if(/^!/.test(cmd)){
                cmd = cmd.substr(1);
                function execNext(){
                    let id = elementIds.shift();
                    if(id !== undefined){
                        pathData.id = id;
                        browser.execCmd(cmd, pathData, data, function(error){
                            if(error){
                                done(error);
                            }
                            else{
                                execNext();
                            }
                        });
                    }
                    else{
                        done();
                    }
                }
                execNext();
            }
            else{
                pathData.id = elementIds[0];
                browser.execCmd(cmd, pathData, data, function(error, ret){
                    done(error, ret);
                });
            }
        }
        else{
            done('Elements empty: '+ self.value+' ('+self.using+')');
        }
    },

    /**
     * sleep sync
     * @method sleep
     * @public
     * @param  {Number} ms millisecond
     * @param  {Function} done callback function
     */
    sleep(ms, done){
        this._browser.sleep(ms, done);
    },

    /**
     * get webdriver ELEMENT object
     * @method toJSON
     * @param  {Boolean} first
     * @public
     * @return {Object|Array} [{ELEMENT: 1}] | {ELEMENT: 1}
     */
    toJSON(first){
        var elementIds = this.elementIds;
        if(first && elementIds.length > 0){
            return {ELEMENT: elementIds[0]};
        }
        else{
            var arrJson = [];
            elementIds.forEach(function(id){
                arrJson.push({ELEMENT: id});
            });
            return arrJson;
        }
    },

    /**
     * get new element from start to end
     * @method slice
     * @public
     * @param  {Number} start
     * @param  {Number} end
     * @param  {Boolean} [changeSelf]
     */
    slice(start, end, changeSelf, done){
        let self = this;
        if(typeof changeSelf === 'function'){
            changeSelf = false;
        }
        done = getDone(arguments);
        if(start >= 0 && start < self.length && end > start && end <= self.length){
            let newElementIds = self.elementIds.slice(start, end);
            let newElements = new Elements(self._browser, 'elements', newElementIds);
            newElements.init();
            if(changeSelf){
                self.elementIds = newElementIds;
                self.length = newElementIds.length;
            }
            done(null, newElements);
        }
        else{
            done('Elements slice range error.');
        }
    },

    /**
     * get new element by index
     * @method get
     * @public
     * @param  {Number} index
     * @param  {Boolean} [changeSelf]
     */
    get(index, changeSelf, done){
        done = getDone(arguments);
        this.slice(index, index+1, changeSelf, done);
    },

    /**
     * get new first element
     * @method first
     * @public
     * @param  {Boolean} [changeSelf]
     */
    first(changeSelf, done){
        done = getDone(arguments);
        this.get(0, changeSelf, done);
    },

    /**
     * get new last element
     * @method last
     * @public
     * @param  {Boolean} [changeSelf]
     */
    last(changeSelf, done){
        var self = this;
        done = getDone(arguments);
        self.get(self.length-1, changeSelf, done);
    },

    /**
     * get tagName (first element)
     * @method tagName
     * @public
     * @param  {Function} done callback function
     * @return {String}
     */
    tagName(done){
        this.execCmd('getElementTagName', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get attribute value (first element)
     * @method attr
     * @public
     * @param  {String} name attribute name
     * @param  {Function} done callback function
     * @return {String}
     */
    attr(name, done){
        this.execCmd('getElementAttribute', {
            name: name
        }, function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get property value (first element)
     * @method prop
     * @public
     * @param  {String} name attribute name
     * @param  {Function} done callback function
     * @return {Object} return proerty value
     */
    prop(name, done){
        this.execCmd('getElementProperty', {name: name}, function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get rect(first element)
     * @method prop
     * @public
     * @param  {Function} done callback function
     * @return {Object} return rect info
     */
    rect(done){
        this.execCmd('getElementRect', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get css value (first element)
     * @method css
     * @public
     * @param  {String} name css name
     * @param  {Function} done callback function
     * @return {String}
     */
    css(name, done){
        this.execCmd('getElementCss', {
            propertyName: name
        }, function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * get text (first element)
     * @method text
     * @public
     * @param  {Function} done callback function
     * @return {String}
     */
    text(done){
        this.execCmd('getElementText', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * clear input or textarea
     * @method clear
     * @public
     * @param  {Function} done callback function
     * @return {this}
     */
    clear(done){
        this.execCmd('!setElementClear', done);
    },

    /**
     * get offset of element (first element)
     * @method offset
     * @public
     * @param  {Boolean} [isInview]
     * @param  {Function} done callback function
     * @return {Object} return {x:1,y:1}
     */
    offset(isInview, done){
        let self = this;
        if(typeof isInview === 'function'){
            isInview = undefined;
        }
        done = getDone(arguments);
        if(isInview){
            self.execCmd('getElementOffsetInView', function(error, ret){
                done(error, ret && ret.value);
            });
        }
        else{
            self.execCmd('getElementOffset', function(error, ret){
                done(error, ret && ret.value);
            });
        }
    },

    /**
     * get size of element (first element)
     * @method size
     * @public
     * @param  {Function} done callback function
     * @return {Object} return {width:1, height:1}
     */
    size(done){
        this.execCmd('getElementSize', function(error, ret){
            done(error, ret && ret.value);
        });
    },

    /**
     * check element displayed (first element)
     * @method displayed
     * @public
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    displayed(done){
        this.execCmd('getElementDisplayed', function(error, ret){
            done(null, ret && ret.value);
        });
    },

    /**
     * check element enabled (first element)
     * @method enabled
     * @public
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    enabled(done){
        this.execCmd('getElementEnabled', function(error, ret){
            done(null, ret && ret.value);
        });
    },

    /**
     * check element selected (first element)
     * @method selected
     * @public
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    selected(done){
        this.execCmd('getElementSelected', function(error, ret){
            done(null, ret && ret.value);
        });
    },

    /**
     * select option
     * @method select
     * @public
     * @param  {Number|String|Object} value {type:'index', value:'test'} type:index | value | text
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    select(value, done){
        let type = 'index';
        if(typeof value === 'number'){
            type = 'index';
        }
        else if(typeof value === 'string'){
            type = 'value';
        }
        else{
            type = value.type;
            value = value.value;
        }

        let filter;
        let quote = /"/.test(value) ? "'" : '"';
        switch(type){
            case 'index':
                filter = '';
                value = value && parseInt(value, 10);
                break;
            case 'value':
                filter = '[normalize-space(@value)='+quote+String(value).trim()+quote+']';
                break;
            case 'text':
                filter = '[normalize-space(.)='+quote+String(value).trim()+quote+']';
                break;
        }
        this.find('./option'+filter+' | ./optgroup/option'+filter, function(error, elements){
            if(error){
                done(error);
            }
            else{
                if( elements.length > 0){
                    elements.get( type === 'index' ? value : 0, true).click(done);
                }
                else{
                    done('<option> no found: '+value+' ('+type+')');
                }
            }
        }).catch(done);
    },

    /**
     * send keys to element
     * @method sendKeys
     * @public
     * @param  {String} text
     * @param  {Function} done callback function
     */
    sendKeys(text, done){
        let self = this;
        let Keys = self._browser.Keys;
        text = text.replace(/{(\w+)}/g, function(all, name){
            let key = Keys[name.toUpperCase()];
            return key?key:all;
        });
        self.execCmd('!sendElementKeys', {}, {
            value: text.split('')
        }, done);
    },

    /**
     * get or set value
     * @method val
     * @public
     * @param  {String} [text]
     * @param  {Function} done callback function
     */
    val(text, done){
        let self = this;
        if(typeof text === 'function'){
            text = undefined;
        }
        done = getDone(arguments);
        if(text){
            self.clear().catch(function(){}).sendKeys(text).then(function(){
                done();
            }).catch(done);
        }
        else{
            self.attr('value', done).catch(done);
        }
    },

    /**
     * send mousemove (first element)
     * @method mouseMove
     * @public
     * @param  {Number|Object} [x]
     * @param  {Number} [y]
     * @param  {Function} done callback function
     */
    mouseMove(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        let data = {};
        if(self.length > 0){
            data.element = self.elementIds[0];
        }
        else{
            return done('Elements empty: '+ self.value+' ('+self.using+')');
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
    },

    /**
     * click to element
     * @method click
     * @public
     * @param  {String} [key]
     * @param  {Function} done callback function
     */
    click(key, done){
        if(typeof key === 'function'){
            key = undefined;
        }
        done = getDone(arguments);
        if(key !== undefined){
            this._browser.click(key, done);
        }
        else{
            this.execCmd('setElementClick', done);
        }
    },

    /**
     * double click to element
     * @method dblClick
     * @public
     * @param  {Function} done callback function
     */
    dblClick(done){
        let self = this;
        self._browser.mouseMove(self).dblClick().then(function(){
            done();
        }).catch(done);
    },

    /**
     * double click to element
     * @method doubleClick
     * @public
     * @param  {Function} done callback function
     */
    doubleClick(done){
        let self = this;
        self._browser.mouseMove(self).doubleClick().then(function(){
            done();
        }).catch(done);
    },

    /**
     * drag the element drop to another element
     * @method dragDropTo
     * @public
     * @param  {Elements} selector
     * @param  {Number} [x]
     * @param  {Number} [y]
     * @param  {Function} done callback function
     */
    dragDropTo(selector, x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        done = getDone(arguments);
        let to;
        if(selector.selector){
            to = selector;
        }
        else{
            to = {
                selector: selector,
                x: x,
                y: y
            };
        }
        self._browser.dragDrop(self, to, done);
    },

    /**
     * submit form
     * @method submit
     * @public
     * @param  {Function} done callback function
     */
    submit(done){
        this.execCmd('setElementSubmit', done);
    },

    /**
     * upload file to browser machine, then set to this element
     * @method uploadFile
     * @public
     * @param  {String} localPath
     * @param  {Function} done callback function
     */
    uploadFile(localPath, done){
        let self = this;
        self._browser.uploadFileToServer(localPath).then(function(tmpPath){
            return self.sendKeys(tmpPath);
        }).then(function(){
           done();
        }).catch(done);
    },

    /**
     * scroll element to x, y
     * @method scrollTo
     * @public
     * @param  {Number|Object} [x]
     * @param  {Number} [y]
     * @param  {Function} done callback function
     */
    scrollTo(x, y, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        done = getDone(arguments);
        let data = {};
        if(self.length > 0){
            data.element = self.elementIds[0];
        }
        else{
            return done('Elements empty: '+ self.value+' ('+self.using+')');
        }
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            x = x.x;
        }
        let script = 'function(elements, x, y){\
            var element;\
            for(var i=0,len=elements.length;i<len;i++){\
                element = elements[i];\
                element.scrollLeft = x;\
                element.scrollTop = y;\
            }\
        }';
        self._browser.exec(script, self, x, y, done);
    },

    /**
     * touch click to element
     * @method touchClick
     * @public
     * @param  {Function} done callback function
     */
    touchClick(done){
        let self = this;
        self.execCmd('touchClick', {}, {
            element: self.elementIds[0]
        }, done);
    },

    /**
     * touch double click to element
     * @method touchDblClick
     * @public
     * @param  {Function} done callback function
     */
    touchDblClick(done){
        let self = this;
        self.execCmd('touchDoubleClick', {}, {
            element: self.elementIds[0]
        }, done);
    },

    /**
     * touch double click to element
     * @method touchDoublelClick
     * @public
     * @param  {Function} done callback function
     */
    touchDoublelClick(done){
        return this.touchDblClick(done);
    },

    /**
     * touch long click to element
     * @method touchLongClick
     * @public
     * @param  {Function} done callback function
     */
    touchLongClick(done){
        let self = this;
        self.execCmd('touchLongclick', {}, {
            element: self.elementIds[0]
        }, done);
    },

    /**
     * touch scroll from element
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
            element: self.elementIds[0],
            xoffset: x,
            yoffset: y,
        }, done);
    },

    /**
     * touch flick from element
     * @method touchFlick
     * @public
     * @param  {Number} x
     * @param  {Number} y
     * @param  {Number} speed
     * @param  {Function} done callback function
     */
    touchFlick(x, y, speed, done){
        let self = this;
        if(typeof x === 'function'){
            x = undefined;
            y = undefined;
        }
        else if(typeof y === 'function'){
            y = undefined;
        }
        else if(typeof speed === 'function'){
            speed = undefined;
        }
        done = getDone(arguments);
        if(x !== undefined && x.x !== undefined){
            y = x.y;
            speed = x.speed;
            x = x.x;
        }
        self.execCmd('touchFlick', {}, {
            element: self.elementIds[0],
            xoffset: x,
            yoffset: y,
            speed: speed !== undefined ? speed : 5
        }, done);
    },

    /**
     * send actions from element
     * @method sendActions
     * @public
     * @param  {String} type
     * @param  {Object} params
     * @param  {Function} done callback function
     */
    sendActions(type, params, done){
        let self = this;
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
        actions.map(function(action){
            action.element = self.elementIds[0];
        });
        self.execCmd('setActions', {}, {
            actions: actions
        }, done);
    },

    /**
     * find all child elements
     * @method find
     * @public
     * @param  {String} [using] find mode: class name|css selector|id|name|link text|partial link text|tag name|xpath
     * @param  {String} value find pattern
     * @param  {Function} done callback function
     * @return {Elments}
     */
    find(using, value, done){
        let self = this;
        if(typeof value === 'function'){
            value = undefined;
        }
        done = getDone(arguments);
        if(value === undefined){
            // detect xpath or css selector
            value = using;
            using = /^\.?\//.test(value)?'xpath':'css selector';
        }
        self.execCmd('findChildElements', {}, {
            using: using,
            value: value
        }, function(error, ret){
            if(error){
                done(error);
            }
            else{
                let arrELEMENTS = ret.value;
                let elementIds = arrELEMENTS.map(function(ELEMENT){
                    return ELEMENT.ELEMENT;
                });
                let elements = new Elements(self._browser, 'elements', elementIds);
                elements.init();
                done(null, elements);
            }
        }).catch(done);
    },

    /**
     * test if two elements refer to the same DOM element.
     * @method equal
     * @public
     * @param  {Elements|String} elements
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    equal(otherElements, done){
        let self = this;
        new Promise(function(resolve){
            if(typeof otherElements === 'string'){
                resolve(self._browser.find(otherElements));
            }
            else{
                resolve(otherElements);
            }
        }).then(function(otherElements){
            if(self.length === otherElements.length){
                let otherElementIds = otherElements.elementIds;
                let i = 0;
                function testNext(){
                    if(i < self.length){
                        let elements = new Elements(self._browser, 'elements', [otherElementIds[i]]);
                        elements.init().execCmd('getElementEquals', {
                            other: otherElementIds[i]
                        }, function(error, ret){
                            if(error){
                                done(error);
                            }
                            else if(ret.value === false){
                                done(null, false);
                            }
                            else{
                                testNext();
                            }
                        });
                    }
                    else{
                        done(null, true);
                    }
                    i++;
                }
                testNext();
            }
            else{
                done(null ,false);
            }
        }).catch(done);
    }

});

// get done callback
function getDone(args){
    let done = args[args.length -1];
    return typeof done === 'function' ? done : null;
}

module.exports = Elements;
