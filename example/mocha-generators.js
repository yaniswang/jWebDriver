var JWebDriver = require('../');
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

require('mocha-generators').install();

describe('jWebDriver test', function(){

    var browser;
    before(function*(){
        var driver = new JWebDriver();
        browser = yield driver.session('chrome');
    });

    it('should search baidu', function*(){
        yield browser.url('https://www.baidu.com/');
        var kw = yield browser.find('#kw').should.have.length(1);
        yield kw.val('mp3').submit();
        yield browser.url().should.contain('wd=mp3');
    });

    after(function*(){
        yield browser.close();
    });

});
