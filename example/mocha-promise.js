var JWebDriver = require('../');
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

describe('jWebDriver test', function(){

    this.timeout(30000);

    var browser;
    before(function(){
        var driver = new JWebDriver();
        return (browser = driver.session('chrome'));
    });

    it('should search baidu', function(){
        return browser.url('https://www.baidu.com/')
            .find('#kw')
            .should.have.length(1)
            .val('mp3').submit()
            .url()
            .should.contain('wd=mp3');
    });

    after(function(){
        return browser.close();
    });

});
