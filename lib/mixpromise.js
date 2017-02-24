/*jshint unused:false*/
'use strict';
function mixPromise(JWebDriver, Browser, Elements){
    var JWebDriverPrototype = JWebDriver.prototype;
    // copy Elements method
    let arrBlackList = ['constructor', 'init', 'log', 'exec', 'sleep', 'toJSON', 'find', 'equal'];
    let objBlackList = {};
    arrBlackList.forEach(function(name){
        objBlackList[name] = true;
    });
    let objMethodMap = {
        'sendKeys': 'sendElementKeys',
        'scrollTo': 'scrollElementTo',
        'sendActions': 'sendElementActions'
    };
    let protoNames = Object.getOwnPropertyNames(Elements.prototype);
    // console.log('============= Elements ==============');
    protoNames.slice(1).forEach(function(name){
        let newName = name !== 'constructor' && objMethodMap[name] || name;
        if(!JWebDriverPrototype[newName] && !objBlackList[newName]){
            // console.log(name);
            JWebDriver.addMethod(newName, function(done){
                var args = Array.prototype.slice.call(arguments, 0);
                var callback = args.pop();
                var lastElements = this.lastElements;
                if(lastElements){
                    lastElements[name].apply(lastElements, args).then(function(ret){
                        callback(null, ret);
                    }, callback);
                }
            });
        }
    });

    // copy Browser method
    ['find', 'findVisible', 'wait'].forEach(function(name){
        JWebDriver.addMethod(name, function(done){
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0);
            var callback = args.pop();
            var lastBrowser = self.lastBrowser;
            if(lastBrowser){
                lastBrowser[name].apply(lastBrowser, args).then(function(ret){
                    self.lastElements = ret;
                    callback(null, ret);
                }, callback);
            }
        });
    });
    arrBlackList = ['constructor', 'MouseButtons', 'Keys', 'init', 'log', 'exec', 'isStickyKey'];
    objBlackList = {};
    arrBlackList.forEach(function(name){
        objBlackList[name] = true;
    });
    objMethodMap = {
        'size': 'windowSize',
        'position': 'windowPosition'
    };
    // console.log('============= Browser ==============');
    protoNames = Object.getOwnPropertyNames(Browser.prototype);
    protoNames.forEach(function(name){
        let newName = name !== 'constructor' && objMethodMap[name] || name;
        if(!JWebDriverPrototype[newName] && !objBlackList[newName]){
            // console.log(name);
            JWebDriver.addMethod(newName, function(done){
                var args = Array.prototype.slice.call(arguments, 0);
                var callback = args.pop();
                var lastBrowser = this.lastBrowser;
                if(lastBrowser){
                    lastBrowser[name].apply(lastBrowser, args).then(function(ret){
                        callback(null, ret);
                    }, callback);
                }
            });
        }
    });
}

module.exports = mixPromise;
