'use strict';
function mixPromise(JWebDriver, Browser, Elements){
    var JWebDriverPrototype = JWebDriver.prototype;
    // copy Elements method
    let arrBlackList = ['constructor', 'init', 'log', 'exec', 'sleep', 'toJSON', 'find', 'equal'];
    let objBlackList = {};
    arrBlackList.forEach(function(name){
        objBlackList[name] = true;
    });
    let objMethodMap = {};
    let protoNames = Object.getOwnPropertyNames(Elements.prototype);
    // console.log('============= Elements ==============');
    protoNames.slice(1).forEach(function(name){
        let newName = name !== 'constructor' && objMethodMap[name] || name;
        if(!JWebDriverPrototype[newName] && !objBlackList[newName]){
            // console.log(name);
            JWebDriver.addMethod(newName, function(){
                var lastElements = this.lastElements;
                if(lastElements){
                    return lastElements[name].apply(lastElements, arguments);
                }
            });
        }
    });

    // copy Browser method
    ['find', 'findVisible', 'wait'].forEach(function(name){
        JWebDriver.addMethod(name, function(){
            var self = this;
            var lastBrowser = self.lastBrowser;
            if(lastBrowser){
                return lastBrowser[name].apply(lastBrowser, arguments).then(function(elements){
                    return (self.lastElements = elements);
                });
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
            JWebDriver.addMethod(newName, function(){
                var lastBrowser = this.lastBrowser;
                if(lastBrowser){
                    return lastBrowser[name].apply(lastBrowser, arguments);
                }
            });
        }
    });
}

module.exports = mixPromise;
