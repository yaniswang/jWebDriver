var path = require('path');
var JWebDriver = require('../');
var chai = require("chai");
chai.should();
chai.use(JWebDriver.chaiSupportChainPromise);

var isTravis = process.env['isTravis'] == 1;
var driverPort = 3456;

var platformName = 'android';
var isIos = platformName === 'ios';
var infoBoardId = isIos ? 'info' : 'com.github.android_app_bootstrap:id/info';

var androidDesired = {
    'platformName': 'android',
    'deviceName': 'Android Emulator',
    'app': path.resolve(__dirname, 'resource/android.zip')
};

var iosDesired = {
    'platformName': 'iOS',
    'deviceName': 'iPhone 6',
    'app': path.resolve(__dirname, 'resource/ios.zip')
};

if(!isTravis){
    JWebDriver.addMethod('customBack', function(){
        if(isIos){
            return this.wait('name', 'Back').click().sleep(500);
        }
        else{
            return this.back();
        }
    });

    describe('Mobile app', function(){

        this.timeout(120000);

        var driver;

        before(function(){

            driver = new JWebDriver({
                port: driverPort,
                logLevel: 0,
                speed: 0
            });
            driver = driver.session(isIos?iosDesired:androidDesired);
            return driver;

        });

        it('should get window size', function(){

            return driver.windowSize()
                .should.have.property('width')
                .should.have.property('height');

        });

        it('should login', function(){

            return driver.wait(isIos?'//XCUIElementTypeTextField[1]':'//*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"]')
                .should.have.length(1)
                .sendElementKeys('中文+Test+12345678')
                .text()
                .should.equal('中文+Test+12345678')
                .wait(isIos?'//XCUIElementTypeSecureTextField[1]':'//*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"]')
                .should.have.length(1)
                .sendElementKeys('22222\n')
                .wait('name', 'Login')
                .should.have.length(1)
                .click()
                .wait('name', 'list')
                .should.have.length(1);

        });

        if(!isIos){
            it('should get property', function(){

                return driver.wait('name', 'list')
                    .prop('text')
                    .should.have.property('text');

            });
        }

        it('should get rect', function(){

            return driver.wait('name', 'list')
                .rect()
                .should.have.property('x')
                .should.have.property('y')
                .should.have.property('width')
                .should.have.property('height');

        });

        it('should cover gestrure', function(){

            return driver.wait('name', 'list')
                .click()
                .sleep(500)
                .sendActions('drag', {
                    fromX: 200,
                    fromY: 400,
                    toX: 200,
                    toY: 100,
                    duration: 0.5
                })
                .sendActions('drag', {
                    fromX: 100,
                    fromY: 100,
                    toX: 100,
                    toY: 400,
                    duration: 0.5
                })
                .wait('name', 'Alert')
                .click()
                .acceptAlert()
                .customBack()
                .wait('name', 'Gesture')
                .click()
                .sendActions('tap', {
                    x: 100,
                    y: 100
                  })
                .sendActions('tap', {
                    x: 100,
                    y: 100
                })
                .sleep(500)
                .wait('id', infoBoardId)
                .text()
                .should.contain('singleTap')
                .sendActions('press', {
                    x: 100,
                    y: 100,
                    duration: 2
                })
                .wait('id', infoBoardId)
                .sendElementActions('pinch', {
                    scale: 2,      // only for iOS
                    velocity: 1,   // only for iOS
                    percent: 200,  // only for Android
                    steps: 200     // only for Android
                })
                .sendActions('drag', {
                    fromX: 100,
                    fromY: 100,
                    toX: 100,
                    toY: 600,
                    duration: 1
                });

        });

        it('should back to home', function(){

            return driver.customBack()
                .customBack()
                .wait('name', 'list')
                .should.have.length(1);

        });

        it('should switch to webview', function(){

            return driver.wait('name', 'Baidu')
                .click()
                .sleep(3000)
                .webview()
                .title()
                .should.contain('百度');

        });

        it('should search baidu', function(){

            return driver.wait('#index-kw')
                .sendElementKeys('mp3')
                .wait('#index-bn')
                .click()
                .sleep(1000)
                .url()
                .should.contain('mp3')
                .title()
                .should.contain('mp3');

        });

        it('should switch to native', function(){

            return driver.native()
                .wait('name', 'PERSONAL')
                .should.have.length(1)
                .click()
                .wait('name', 'Logout')
                .click()
                .wait('name', 'Login')
                .should.have.length(1);

        });

        after(function(){
            return driver.close();
        });
    });
}
