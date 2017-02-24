var path = require('path');
var JWebDriver = require('../');

var driver = new JWebDriver({
    port: 3456
});

var appPath = '../test/resource/android.zip';

driver.session({
        'platformName': 'android',
        'app': path.resolve(appPath)
    })
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"]')
    .sendElementKeys('中文+Test+12345678')
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"]')
    .sendElementKeys('22222\n')
    .wait('name', 'Login')
    .click()
    .wait('name', 'list')
    .prop('text')
    .then(function(text){
        console.log(text)
    })
    .rect()
    .then(function(rect){
        console.log(rect)
    })
    .click()
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
    .wait('name', 'Gesture')
    .click()
    .back()
    .back()
    .wait('name', 'Baidu')
    .click()
    .webview()
    .wait('#index-kw')
    .sendKeys('mp3')
    .wait('#index-bn')
    .click()
    .url()
    .then(function(url){
        console.log(url);
    })
    .title()
    .then(function(title){
        console.log(title);
    })
    .native()
    .wait('name', 'PERSONAL')
    .click();
