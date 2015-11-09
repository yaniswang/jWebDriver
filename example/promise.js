var JWebDriver = require('../');

var driver = new JWebDriver();
driver.session('chrome', function(error, chrome) {
    chrome.url('https://www.baidu.com/')
          .find('#kw')
          .then(function(kw) {
              return kw.setValue('mp3')
                       .submit();
          })
          .title()
          .then(function(title) {
              console.log(title);
          })
          .close();
});
