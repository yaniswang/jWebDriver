var JWebDriver = require('../');
var expect  = require("expect.js");
require('mocha-generators').install();

describe('jWebDriver test', function(){

    var browser;
    before(function*(){
        var driver = new JWebDriver();
        browser = yield driver.session('chrome');
    });

    it('should search baidu', function*(){
        yield browser.url('https://www.baidu.com/');
        var kw = yield browser.find('#kw');
        expect(kw.length).to.be(1);

        yield kw.setValue('mp3').submit();

        var url = yield browser.url();
        expect(url).to.contain('wd=mp3');
    });

    after(function*(){
        yield browser.close();
    });

});
