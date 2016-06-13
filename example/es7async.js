'use strict';
var JWebDriver = require('../');

var openGoogle = async function(){

    var driver = new JWebDriver();

    var browser = await driver.session('chrome');

    await browser.url('https://www.google.com/');
    var elemement = await browser.find('input[name=q]');
    await elemement.val('mp3').submit();

    console.log(await browser.title());

    await browser.close();

};
openGoogle().then(function(){
    console.log('All done')
}).catch(function(error){
    console.log('Catched error: ', error);
});
