jWebDriver change logs
====================

## ver 0.9.3 (2013-1-6)

fix:

1. fix: waitFor: browser.waitFor('#id', false, 60000)
2. fix: remove proxy from default config
3. fix: can't work with selenium server 2.28
4. fix: close nodejs agent for http


## ver 0.9.2 (2012-11-21)

add:

1. add window & frame api
2. add test for window & frame
3. browser class add 2 functions:isOk, isError
4. add end api for JWebDriver

edit:

1. adjust log function
2. adjust waitFor's return value:if success return Element
3. change toJson(element) to toArray
4. make all api return value with one accord
5. replace init callback to error callback

fix:

1. fix window api when use webdriver node mode


## ver 0.9.1 (2012-11-4)

add:

1. finish all commands
2. add test for all api
3. add js coverage