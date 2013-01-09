
var JWebDriver = require('../');

JWebDriver.config({
	'logMode': 'silent',
	'host': '127.0.0.1',
	'port': 4444
});

runBrowserTest('chrome');
runBrowserTest('firefox');
// runBrowserTest('ie');

function runBrowserTest(browserName){

	describe('Element : ' + browserName, function(){

		var wd, server;
		var testHost = 'http://127.0.0.1'

		before(function(done){
			var readyCount = 0;

			//init webdriver
			wd = new JWebDriver({'browserName': browserName});

			wd.run(function(browser){
				browser.url(testHost + '/test1.html');
				readyCount++;
				if(readyCount === 2){
					done();
				}
			});

			var http = require('http');

			//init http server
			server = http.createServer(function (req, res) {
				res.writeHead(200, {'Content-Type': 'text/html'});
				var content = '<!DOCTYPE HTML><html><head><meta charset="UTF-8"><title>test</title><style>html,body{margin:0;padding:0;}</style></head>';
				switch(req.url){
					case '/test1.html':
						content += '<div id="formdiv"><form action="test2.html" id="form" style="border:5px solid #000;"><input type="text" id="kw" data-test="attrok" onclick="this.value=\'onclick\'"><input type="file" id="file"><input type="submit" id="submit"><input type="checkbox" id="check1" checked="checked"><input type="checkbox" id="check2"><input type="reset" id="reset" disabled="disabled"></form></div><div id="pp" style="position:absolute;left:101px;top:102px;width:51px;height:52px;">a<a href="test2.html">b</a>c</div><div id="hidediv1" style="display:none">hidediv1</div><div id="hidediv2" style="visibility:hidden">hidediv2</div>';
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

		it('should find sub element', function(done){

			wd.run(function(browser, $){
				$('#formdiv').find('#kw')._id.should.be.a('string');
				done();
			});

		});

		it('should read attr fine', function(done){

			wd.run(function(browser, $){
				$('#kw').attr('data-test').should.equal('attrok');
				done();
			});

		});

		it('should read css fine', function(done){

			wd.run(function(browser, $){
				$('#form').css('border-width').should.equal('5px');
				done();
			});

		});

		it('should write value fine', function(done){

			wd.run(function(browser, $){
				var kw = $('#kw').val('testval');
				kw.attr('value').should.equal('testval');
				done();
			});

		});

		it('should read value fine', function(done){

			wd.run(function(browser, $){
				var kw = $('#kw').val('test872')
				kw.val().should.equal(kw.attr('value'));
				done();
			});

		});

		it('should clear value fine', function(done){

			wd.run(function(browser, $){
				var kw = $('#kw').val('test872')
				kw.clear().attr('value').should.equal('');
				done();
			});

		});

		it('should read text fine', function(done){

			wd.run(function(browser, $){
				$('#pp').text().should.equal('abc');
				done();
			});

		});

		it('should read visible fine', function(done){

			wd.run(function(browser, $){
				$('#pp').visible().should.true;
				$('#hidediv1').visible().should.false;
				$('#hidediv2').visible().should.false;
				done();
			});

		});

		it('should read offset fine', function(done){

			wd.run(function(browser, $){
				var offset = $('#pp').offset();
				offset.x.should.equal(101);
				offset.y.should.equal(102);
				done();
			});

		});

		it('should read size fine', function(done){

			wd.run(function(browser, $){
				var size = $('#pp').size();
				size.width.should.equal(51);
				size.height.should.equal(52);
				done();
			});

		});

		it('should read enabled fine', function(done){

			wd.run(function(browser, $){
				$('#submit').enabled().should.true;
				$('#reset').enabled().should.false;
				done();
			});

		});

		it('should read selected fine', function(done){

			wd.run(function(browser, $){
				$('#check1').selected().should.true;
				$('#check2').selected().should.false;
				done();
			});

		});

		it('should click the element', function(done){

			wd.run(function(browser, $){
				var kw = $('#kw');
				kw.click();
				browser.sleep(300);
				kw.val().should.equal('onclick')
				done();
			});

		});

		it('should sendkeys to the file element', function(done){

			wd.run(function(browser, $){
				var file = $('#file');
				file.sendKeys('C:\\Windows\\System32\\drivers\\etc\\hosts');
				file.val().should.include('hosts')
				done();
			});

		});

		it('should test equals from 2 elements', function(done){

			wd.run(function(browser, $){
				var file1 = $('#file'), file2 = $('input[type=file]');
				file1.equals(file2).should.true;
				done();
			});

		});

		it('should submit the form', function(done){

			wd.run(function(browser, $){
				$('#form').submit();
				browser.url().should.include('test2.html')
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