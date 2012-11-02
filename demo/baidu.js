var JWebDriver = require('../lib/jwebdriver');

JWebDriver.config({
	'logMode': 'all',
	'host': '127.0.0.1',
	'port': 4444
});

var wd = new JWebDriver({'browserName':'chrome'});

wd.run(function(browser, $){
	browser.url('http://www.baidu.com/');
	browser.waitFor('#kw');
	$('#kw').val('mp3').submit();
	browser.close();
});