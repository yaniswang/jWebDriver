var JWebDriver = require('../');

var driver = new JWebDriver();

JWebDriver.addMethod('searchMp3', function(){
    return this.find('#kw').val('mp3').submit();
});

driver.session("chrome")
    .url('https://www.baidu.com/')
    .searchMp3()
    .title()
    .then(function(title){
        console.log(title);
    })
    .close();
