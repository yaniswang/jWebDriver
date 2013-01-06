var JWebDriver = require('../');

JWebDriver.config({
	'logMode': 'all',
	'host': '127.0.0.1',
	'port': 4444
});

var wd = new JWebDriver({'browserName':'firefox'});

wd.run(function(browser, $){
	browser.url('http://www.baidu.com/');
	var kw = browser.waitFor('#kw',2000);
	if(browser.isOk(kw)){
		kw.val('mp3').submit();
	}
	browser.sleep(1000);
	browser.end();
});