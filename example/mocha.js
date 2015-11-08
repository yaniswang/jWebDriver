var JWebDriver = require('../');
var co = require('co');
var expect  = require("expect.js");

describe('jWebDriver test', function(){

    var browser;
    before(function(done){
        var driver = new JWebDriver({
            port: driverPort,
            logLevel: 2,
            speed: 0
        });
        driver.session('chrome', function(error, ret){
            browser = ret;
            done();
        });
    });

    it('should open url', function(done){
        co(function*(){
            yield browser.url('https://www.baidu.com/');
            var kw = yield browser.find('#kw');
            expect(kw.length).to.be(1);

            yield kw.setValue('mp3').submit();

            var url = yield browser.url();
            expect(url).to.contain('wd=mp3');
            done();
        }).catch(done);
    });

    after(function(done){
        browser.close(done);
    });

});
