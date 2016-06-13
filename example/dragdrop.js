var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, browser){

    yield browser.url('https://127.0.0.1/drag.html');
    var dragitem = yield browser.find('#dragitem');
    yield dragitem.dragDropTo('#targetdiv');
    yield browser.close();

}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
