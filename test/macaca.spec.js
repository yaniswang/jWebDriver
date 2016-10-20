var path = require('path');
var JWebDriver = require('../');
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

var isWin32 = process.platform === 'win32';
var phantomjs = process.env['phantomjs'] || !isWin32;
var driverPort = 3456;
var appPath = 'resource/macaca.apk';

if(!phantomjs){
    describe('Macaca', function(){

        var driver;

        before(function(){

            driver = new JWebDriver({
                port: driverPort,
                logLevel: 0,
                speed: 0
            });
            driver = driver.session({
                'platformName': 'Android',
                'app': path.resolve(__dirname, appPath)
            });
            return driver;

        });

        it('should login', function(){

            return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"]')
                .should.have.length(1)
                .sendKeys('111')
                .text()
                .should.equal('111')
                .find('//*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"]')
                .sendKeys('222')
                .text()
                .should.equal('222')
                .find('//*[@resource-id="com.github.android_app_bootstrap:id/login_button"]')
                .click()
                .wait('//*[@resource-id="com.github.android_app_bootstrap:id/list_button"]')
                .should.have.length(1);

        });

        it('should get property', function(){

            return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/list_button"]')
                .prop('origin')
                .should.have.property('x')
                .should.have.property('y')
                .prop('size')
                .should.have.property('width')
                .should.have.property('height')
                .should.have.property('centerX')
                .should.have.property('centerY');

        });

        it('should swipe list', function(){

            return driver.wait('//*[@resource-id="com.github.android_app_bootstrap:id/list_button"]')
                .click()
                .touchSwipe(245, 780, 258, 611, 20)
                .wait('//*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView[4]')
                .click()
                .touchSwipe(174, 407, 169, 802, 20)
                .wait('//*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView')
                .click()
                .wait('//*[@resource-id="com.github.android_app_bootstrap:id/toast_button"]')
                .click();

        });

        it('should back to home', function(){

            return driver.back()
                .back()
                .wait('name', 'Baidu')
                .should.have.length(1);

        });

        it('should switch to webview', function(){

            return driver.wait('name', 'Baidu')
                .click()
                .webview()
                .title()
                .should.contain('百度');

        });

        it('should search baidu', function(){

            return driver.wait('#index-kw')
                .sendKeys('mp3')
                .wait('#index-bn')
                .touchClick()
                .url()
                .should.contain('mp3')
                .title()
                .should.contain('mp3');

        });

        it('should switch to native', function(){

            return driver.native()
                .find('name', 'PERSONAL')
                .should.have.length(1)
                .click();

        });

        after(function(){
            return driver.close();
        });
    });
}
