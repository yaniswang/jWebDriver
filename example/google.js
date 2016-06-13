var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function*(error, browser){
    yield browser.url('https://www.google.com/');
    var elemement = yield browser.find('input[name=q]');
    yield elemement.val('mp3').submit();

    console.log(yield browser.title());

    yield browser.close();
}).then(function(){
    console.log('all done');
}).catch(function(error){
    console.log(error);
});
