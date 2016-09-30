var JWebDriver = require('../');

var driver = new JWebDriver();

driver.session("chrome").url('https://www.google.com/')
.find('input[name=q]')
.val('mp3')
.submit()
.title()
.then(function(title){
    console.log(title);
})
.close();
