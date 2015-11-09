var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, chrome){

    yield chrome.url('https://127.0.0.1/upload.html');
    var file = yield chrome.find('#fileinput');
    yield file.uploadFile('c:/test.jpg');
    yield chrome.close();

}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
