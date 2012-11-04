
var JWebDriver = require('../');

JWebDriver.config({
	'logMode': 'silent',
	'host': '127.0.0.1',
	'port': 4444
});

runBrowserTest('chrome');
runBrowserTest('firefox');
runBrowserTest('ie');

function runBrowserTest(browserName){

	describe('Browser : ' + browserName, function(){

		var wd, server;
		var testHost = 'http://127.0.0.1'

		before(function(done){
			var readyCount = 0;

			//init webdriver
			wd = new JWebDriver({'browserName': browserName}, function(){
				readyCount++;
				if(readyCount === 2){
					done();
				}
			});

			var http = require('http');

			//init http server
			server = http.createServer(function (req, res) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				var content = '<!DOCTYPE HTML><html><head><meta charset="UTF-8"><title>testtitle</title></head>';
				switch(req.url){
					case '/test1.html':
						content += '<p style="padding:20px;"><input type="text" id="kw" onclick="this.value=1" ondblclick="this.value=2"><input type="text" id="testmouse" onmousedown="this.value=3" onmouseup="this.value=4"><input type="button" id="alert" onclick="alert(123)" value="alert"></p>';
						break;
					case '/test2.html':
						content += 'test2.html';
						break;
				}
				content += '<body></body></html>';
				res.write(content);
				res.end();
			}).listen(function(){
				testHost += ':' + server.address().port;
				readyCount++;
				if(readyCount === 2){
					done();
				}
			});

		});

		it('should sleep 234 ms', function(done){

			wd.run(function(browser, $){
				var startTime = (new Date()).getTime();
				browser.sleep(234);
				var endTime = (new Date).getTime() - startTime;
				endTime.should.within(184, 284);
				done();
			});

		});

		it('should control url', function(done){

			wd.run(function(browser, $){
				browser.url(testHost + '/test1.html');
				browser.url().should.equal(testHost + '/test1.html');
				browser.url(testHost + '/test2.html');
				browser.url().should.equal(testHost + '/test2.html');
				browser.back();
				browser.url().should.equal(testHost + '/test1.html');
				browser.forward();
				browser.url().should.equal(testHost + '/test2.html');
				done();
			});

		});

		it('should read title', function(done){

			wd.run(function(browser, $){
				browser.url(testHost + '/test1.html');
				browser.title().should.equal('testtitle');
				done();
			});

		});

		it('should read source', function(done){

			wd.run(function(browser, $){
				browser.source().should.match(/<\/head>\s*<body>/i);
				done();
			});

		});

		it('should control cookie', function(done){

			wd.run(function(browser, $){
				browser.getCookies().should.length(0);
				browser.addCookie({name:'test1',value:'123'})
				browser.getCookies().should.length(1);
				browser.addCookie({name:'test2',value:'321'})
				browser.getCookies().should.length(2);
				browser.delCookies('test1');
				browser.getCookies().should.length(1);
				browser.delCookies();
				browser.getCookies().should.length(0);
				done();
			});

		});

		it('should exec javascript', function(done){

			wd.run(function(browser, $){
				browser.exec('return document.title;').should.equal('testtitle');
				browser.exec('return arguments[0];','123').should.equal('123');
				browser.exec('return arguments[0].tagName;',$('#kw')).should.equal('INPUT');
				browser.exec('return arguments[1];',['123','321']).should.equal('321');
				browser.setTimeout('ascript', 50);
				browser.exec('var callback = arguments[arguments.length-1];setTimeout(function(){callback(document.title);},10);', true).should.equal('testtitle');
				browser.exec('var callback = arguments[arguments.length-1];var temp = arguments[0];setTimeout(function(){callback(temp)},10);','123', true).should.equal('123');
				browser.exec('var callback = arguments[arguments.length-1];var temp = arguments[1];setTimeout(function(){callback(temp)},10);',['123','321'], true).should.equal('321');
				browser.setTimeout('ascript', 10);
				browser.exec('var callback = arguments[arguments.length-1];setTimeout(function(){callback(document.title);},50);', true).status.should.not.equal(0);
				done();
			});

		});

		it('should control alert', function(done){

			wd.run(function(browser, $){
				$('#alert').click();
				browser.sleep(500);
				browser.getAlert().should.equal('123');
				browser.closeAlert();
				done();
			});

		});

		it('should get screenshot', function(done){

			wd.run(function(browser, $){
				var fs =require('fs');
				var tempPath = 'c:/jwebdriver.png';
				if(fs.existsSync(tempPath)){
					fs.unlinkSync(tempPath);
				}
				browser.getScreenshot(tempPath).should.be.a('string');
				fs.existsSync(tempPath).should.true;
				if(fs.existsSync(tempPath)){
					fs.unlinkSync(tempPath);
				}
				done();
			});

		});

		it('should sendkeys to element', function(done){

			wd.run(function(browser, $){
				browser.exec('document.getElementById("kw").focus()');
				browser.sendKeys('ab{shift}c{shift}');
				$('#kw').val().should.equal('abC');
				done();
			});

		});

		it('should control mouse', function(done){

			wd.run(function(browser, $){
				var kw = $('#kw');
				browser.mousemove(kw);
				browser.click().sleep(200);
				kw.val().should.equal('1');
				browser.dblclick().sleep(200);
				kw.val().should.equal('2');
				var testmouse = $('#testmouse');
				browser.mousemove(testmouse).sleep(100);
				browser.mousedown().sleep(200);
				testmouse.val().should.equal('3');
				browser.mouseup().sleep(200);
				testmouse.val().should.equal('4');
				done();
			});

		});

		it('should waitFor element', function(done){

			wd.run(function(browser, $){
				($('#wait')._id === undefined).should.true;
				browser.exec('setTimeout(function(){document.body.innerHTML=\'<input type="text" id="wait">\';},500);return 1;');
				browser.waitFor('#wait');
				$('#wait')._id.should.be.a('string');
				done();
			});

		});

		after(function(done){
			server.close();
			wd.run(function(browser){
				browser.close();
				done();
			});
		});
	})

}