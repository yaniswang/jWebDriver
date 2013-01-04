
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
			wd = new JWebDriver({'browserName': browserName});

			wd.run(function(){
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
						content += '<p style="padding:20px;"><input type="text" id="kw" onclick="this.value=1" ondblclick="this.value=2"><script>document.getElementById("kw").focus();</script><input type="text" id="testmouse" onmousedown="this.value=3" onmouseup="this.value=4"><input type="button" id="alert" onclick="alert(123)" value="alert"></p><a href="test2.html" target="_blank" id="testwindow">test2</a><iframe src="test2.html" id="testiframe"></iframe>';
						break;
					case '/test2.html':
						content += 'test2.html<input type="text" id="test2input">';
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

		it('should refresh page', function(done){

			wd.run(function(browser, $){
				browser.url(testHost + '/test1.html');
				$('#kw').val('refresh');
				browser.refresh();
				$('#kw').val().should.equal('');
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
				browser.addCookie({name:'test1',value:'123'});
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

		it('should get element', function(done){

			wd.run(function(browser, $){
				$().attr('id').should.equal('kw');
				browser.isOk($('#testmouse')).should.true;
				browser.isError($('#abcaaa')).should.true;
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
				browser.url(testHost + '/test1.html');
				var kw = $('#kw'),
					kwoffset = kw.offset(),
					kwsize = kw.size();
				kwoffset.x += kwsize.width/2;
				kwoffset.y += kwsize.height/2;
				// //mousemove:x,y
				kw.val('test');
				browser.mousemove(kwoffset.x, kwoffset.y);
				browser.click().sleep(200);
				kw.val().should.equal('1');
				//mousemove:element
				browser.mousemove(kw);
				browser.click().sleep(200);
				kw.val().should.equal('1');
				//dbclick
				browser.dblclick().sleep(200);
				kw.val().should.equal('2');
				var testmouse = $('#testmouse');
				browser.mousemove(testmouse).sleep(100);
				//mousedown
				browser.mousedown().sleep(200);
				testmouse.val().should.equal('3');
				//mouseup
				browser.mouseup().sleep(200);
				testmouse.val().should.equal('4');
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

		it('should waitFor element', function(done){

			wd.run(function(browser, $){
				browser.isError($('#wait1')).should.true;
				browser.exec('setTimeout(function(){document.body.innerHTML=\'<input type="text" id="wait1">\';},500);return 1;');
				var wait1 = browser.waitFor('#wait1');
				browser.isOk(wait1).should.true;
				browser.exec('setTimeout(function(){document.body.innerHTML=\'<input type="text" id="wait2">\';},100);return 1;');
				var wait2 = browser.waitFor('#wait2',50);
				browser.isError(wait2).should.true;
				wait2 = $('#wait2');
				browser.isOk(wait2).should.true;
				browser.exec('setTimeout(function(){document.body.innerHTML=\'<input type="text" id="wait3">\';},100);return 1;');
				wait2 = browser.waitFor('#wait2', false);
				browser.isError(wait2).should.true;
				done();
			});

		});

		it('should switchTo window', function(done){

			wd.run(function(browser, $){
				browser.url(testHost + '/test1.html');
				$('#testwindow').click();
				browser.sleep(200);
				var mainWin = browser.window(),
					allWin = browser.window(true);
				allWin.length.should.equal(2);
				browser.switchTo(allWin[1]);
				//no element
				browser.isError($('#testwindow')).should.true;
				browser.close();
				allWin = browser.window(true);
				allWin.length.should.equal(1);
				browser.switchTo(mainWin);
				browser.isOk($('#testwindow')).should.true;
				done();
			});

		});

		it('should switchTo frame', function(done){

			wd.run(function(browser, $){
				browser.isOk($('#testwindow')).should.true;
				browser.switchTo($('#testiframe'));
				browser.isOk($('#test2input')).should.true;
				browser.switchTo();
				browser.isOk($('#testwindow')).should.true;
				done();
			});

		});

		it('should change size of window', function(done){

			wd.run(function(browser, $){
				browser.size(501,502);
				var newSize = browser.size();
				newSize.width.should.equal(501);
				newSize.height.should.equal(502);
				browser.size({'width': 603,'height': 604});
				newSize = browser.size();
				newSize.width.should.equal(603);
				newSize.height.should.equal(604);
				done();
			});

		});

		it('should change offset of window', function(done){

			wd.run(function(browser, $){
				browser.offset(101,102);
				var newOffset = browser.offset();
				newOffset.x.should.equal(101);
				newOffset.y.should.equal(102);
				browser.offset({'x': 203,'y': 204});
				newOffset = browser.offset();
				newOffset.x.should.equal(203);
				newOffset.y.should.equal(204);
				done();
			});

		});

		it('should maximize window', function(done){

			wd.run(function(browser, $){
				browser.size(501,502);
				var newSize = browser.size();
				newSize.width.should.equal(501);
				newSize.height.should.equal(502);
				browser.maximize();
				var newSize = browser.size();
				newSize.width.should.above(501);
				newSize.height.should.above(502);
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