var JWebDriver = require('../');
var co = require('co');

co(function*(){

    var driver = new JWebDriver();

    var chrome = yield driver.session('chrome');

    yield chrome.url('https://www.baidu.com/');
    var elemement = yield chrome.find('#kw');
    yield elemement.val('前端').submit();

    console.log(yield chrome.title());

    yield chrome.close();

}).then(function(){
    console.log('All done!');
}).catch(function(error){
    console.log('Catched error:', error);
});
