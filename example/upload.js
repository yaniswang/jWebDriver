var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, browser){

    yield browser.url('https://127.0.0.1/upload.html');
    var file = yield browser.find('#fileinput');
    yield file.uploadFile('c:/test.jpg');
    yield browser.close();

}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
