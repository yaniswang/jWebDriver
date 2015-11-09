var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, chrome){

    yield chrome.url('https://127.0.0.1/drag.html');
    var dragitem = yield chrome.find('#dragitem');
    yield dragitem.dragDropTo('#targetdiv');
    yield chrome.close();

}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
