var path = require('path');
var JWebDriver = require('../');

var driver = new JWebDriver();

var appPath = '../test/resource/macaca.apk';

driver.session({
        'platformName': 'Android',
        'app': path.resolve(appPath)
    })
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/mobileNoEditText"]')
    .sendKeys('111')
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/codeEditText"]')
    .sendKeys('222')
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/login_button"]')
    .click()
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/list_button"]')
    .prop('size')
    .then(function(size){
        console.log(size)
    })
    .prop('origin')
    .then(function(origin){
        console.log(origin)
    })
    .click()
    .touchSwipe(245, 780, 258, 611, 20)
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView[4]')
    .click()
    .touchSwipe(174, 407, 169, 802, 20)
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/listview"]/android.widget.TextView')
    .click()
    .wait('//*[@resource-id="com.github.android_app_bootstrap:id/toast_button"]')
    .click()
    .back()
    .back()
    .wait('name', 'Baidu')
    .click()
    .webview()
    .wait('#index-kw')
    .sendKeys('mp3')
    .wait('#index-bn')
    .touchClick()
    .url()
    .then(function(url){
        console.log(url);
    })
    .title()
    .then(function(title){
        console.log(title);
    })
    .native()
    .find('name', 'PERSONAL')
    .click();
