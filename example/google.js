var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, chrome){
    yield chrome.url('https://www.google.com/');
    var elemement = yield chrome.find('input[name=q]');
    yield elemement.val('mp3').submit();

    console.log(yield chrome.title());

    yield chrome.close();
}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
