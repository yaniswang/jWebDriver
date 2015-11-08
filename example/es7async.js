'use strict';
var JWebDriver = require('../');

var openGoogle = async function(){

    var driver = new JWebDriver();

    var chrome = await driver.session('chrome');

    await chrome.url('https://www.google.com/');
    var elemement = await chrome.find('input[name=q]');
    await elemement.setValue('mp3').submit();

    console.log(await chrome.title());

    await chrome.close();

};
openGoogle().then(function(){
    console.log('All done')
}).catch(function(error){
    console.log('Catched error: ', error);
});
