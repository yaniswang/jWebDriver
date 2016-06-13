var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function(error, browser) {
    browser.url('https://www.baidu.com/')
          .find('#kw')
          .then(function(kw) {
              return kw.val('mp3')
                       .submit();
          })
          .title()
          .then(function(title) {
              console.log(title);
          })
          .close();
});
