var JWebDriver = require('../');
var co = require('co');

co(function*(){

    var driver = new JWebDriver();

    var browser = yield driver.session('chrome');

    yield browser.url('https://www.baidu.com/');
    var elemement = yield browser.find('#kw');
    yield elemement.val('前端').submit();

    console.log(yield browser.title());

    yield browser.close();

}).then(function(){
    console.log('All done!');
}).catch(function(error){
    console.log('Catched error:', error);
});
