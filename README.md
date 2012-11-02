jWebDriver
================

A webdriver client for Node.js


Features
================

1. support all webdriver protocols
2. easy to use
3. sync test code
4. jQuery style test code
5. all test cover api

How to install
================

Download it from github or use npm:

	npm install jwebdriver

How to use
================

1, Download webdriver & selenium server.

[http://code.google.com/p/selenium/downloads/list](http://code.google.com/p/selenium/downloads/list)

Chrome & ie must download chromeDriver & IEDriverServer.

2, Run selenium server

	java -jar selenium-server-standalone-2.26.0.jar

3, Run test code

	var JWebDriver = require('jwebdriver');

	JWebDriver.config({
	    'logMode': 'all',
	    'host': '127.0.0.1',
	    'port': 4444
	});

	var wd = new JWebDriver({'browserName': 'firefox'});

	wd.run(function(browser, $){
	    browser.url('http://www.baidu.com/');
	    browser.waitFor('#kw');
	    $('#kw').val('mp3').submit();
	    browser.sleep(1000);
	    browser.close();
	});

Document
================

to do...

License
================

jWebDriver is released under the MIT license:

> The MIT License
>
> Copyright (c) 2012 Yanis Wang \<yanis.wang@gmail.com\>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

Thanks
================

* Selenium: [http://code.google.com/p/selenium/](http://code.google.com/p/selenium/)
* fibers: [https://npmjs.org/package/fibers](https://npmjs.org/package/fibers)
* xtend: [https://npmjs.org/package/xtend](https://npmjs.org/package/xtend)
* mocha: [https://npmjs.org/package/mocha](https://npmjs.org/package/mocha)
* should: [https://npmjs.org/package/should](https://npmjs.org/package/should)
* GitHub: [https://github.com/](https://github.com/)