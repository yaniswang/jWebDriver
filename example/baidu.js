var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, chrome){
    yield chrome.url('https://www.baidu.com/');
    var elemement = yield chrome.find('#kw');
    yield elemement.setValue('mp3').submit();

    console.log(yield chrome.title());

    yield chrome.close();
}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
