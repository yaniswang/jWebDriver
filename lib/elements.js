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
            // detect xpath or css selector
            value = using;
            // get current active element
            if(value === 'active'){
                return browser.exec('getActiveElement', function(error, ret){
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
            using = /^\.?\//.test(value)?'xpath':'css selector';
            self.using = using;
            self.value = value;
        }
        if(using === 'elements'){
            self.elementIds = value;
            self.length = value.length;
            return done();
        }
        else{
            browser.exec('findElements', {}, {
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
                        let message = 'Find elements failed';
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
     * @method exec
     * @public
     * @param  {String} cmd protocal command, defined in command.js
     * @param  {Object} [pathData] replace the path parameters, no need to add sessionId
     * @param  {Object} [data] send data to protocal api
     * @param  {Function} done callback function
     * @return {Object} the return object from webdriver server
     */
    exec(cmd, pathData, data, done){
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
                        browser.exec(cmd, pathData, data, function(error){
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
                browser.exec(cmd, pathData, data, function(error, ret){
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
     * get element by index
     * @method get
     * @public
     * @param  {Number} index
     * @return {Elments}
     */
    get(index){
        let self = this;
        if(index >= 0 && index < self.length){
            let elements = new Elements(self._browser, 'elements', [self.elementIds[index]]);
            elements.init();
            return elements;
        }
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
     * get tagName (first element)
     * @method tagName
     * @public
     * @param  {Function} done callback function
     * @return {String}
     */
    tagName(done){
        this.exec('getElementTagName', function(error, ret){
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
        this.exec('getElementAttr', {
            name: name
        }, function(error, ret){
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
        this.exec('getElementCss', {
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
        this.exec('getElementText', function(error, ret){
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
        this.exec('!setElementClear', done);
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
            self.exec('getElementOffsetInView', function(error, ret){
                done(error, ret && ret.value);
            });
        }
        else{
            self.exec('getElementOffset', function(error, ret){
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
        this.exec('getElementSize', function(error, ret){
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
        this.exec('getElementDisplayed', function(error, ret){
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
        this.exec('getElementEnabled', function(error, ret){
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
        this.exec('getElementSelected', function(error, ret){
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
                    elements.get( type === 'index' ? value : 0, function(error, option){
                        if(option){
                            option.click(done);
                        }
                        else{
                            done('Index overflow');
                        }
                    });
                }
                else{
                    done('<option> no found: '+value+' ('+type+')');
                }
            }
        });
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
        self.exec('!sendElementKeys', {}, {
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
     * click to element
     * @method click
     * @public
     * @param  {Function} done callback function
     */
    click(done){
        this.exec('setElementClick', done);
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
        this.exec('setElementSubmit', done);
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
     * touch click to element
     * @method touchClick
     * @public
     * @param  {Function} done callback function
     */
    touchClick(done){
        let self = this;
        self.exec('touchClick', {}, {
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
        self.exec('touchDoubleClick', {}, {
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
        self.exec('touchLongclick', {}, {
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
        self.exec('touchScroll', {}, {
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
        self.exec('touchFlick', {}, {
            element: self.elementIds[0],
            xoffset: x,
            yoffset: y,
            speed: speed !== undefined ? speed : 5
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
        self.exec('findChildElements', {}, {
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
        });
    },

    /**
     * test if two elements refer to the same DOM element.
     * @method equal
     * @public
     * @param  {Elements|String} elements
     * @param  {Function} done callback function
     * @return {Boolean}
     */
    equal(elements, done){
        let self = this;
        new Promise(function(resolve){
            if(typeof elements === 'string'){
                resolve(self._browser.find(elements));
            }
            else{
                resolve(elements);
            }
        }).then(function(elements){
            if(self.length === elements.length){
                let elementIds = elements.elementIds;
                let i = 0;
                function testNext(){
                    if(i < self.length){
                        self.get(i).exec('getElementEquals', {
                            other: elementIds[i]
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
