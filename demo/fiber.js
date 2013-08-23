var JWebDriver = require('../');

var Fiber = require('fibers');

Fiber(function(){

    JWebDriver.config({
        'logMode': 'all',
        'host': '127.0.0.1',
        'port': 4444
    });

    var wd = new JWebDriver({'browserName':'chrome', 'Fiber': Fiber});
    console.log(1);
    wd.run(function(browser, $){
        browser.url('http://www.baidu.com/');
        browser.sleep(1000);
        browser.end();
        var ret = test();
        console.log(2,ret);
    });
    console.log(3);
    var ret = test();
    console.log(4,ret);

}).run();

function test(){
    var fiber = Fiber.current;
    var ret;
    setTimeout(function(){
       ret = 'abc'; 
       fiber.run();
    }, 1000);
    Fiber.yield();
    return ret;
}