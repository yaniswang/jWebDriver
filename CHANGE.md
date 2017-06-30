jWebDriver change log
====================

## ver 2.2.4 (2017-6-30)

1. Add: support get element screenshot for mobile

## ver 2.2.3 (2017-6-12)

1. Fix: catch error when get element screen shot failed

## ver 2.2.2 (2017-6-12)

1. Add: support no throw error when wait dom timeout: `driver.wait('#id', {noerror: true});`
2. Add: support get element screen shot(require gm)

## ver 2.2.0 (2017-5-11)

1. support elements filter for sync mode

## ver 2.1.1 (2017-3-3)

1. Del: delete swipe api, because swipe is deprecated by macaca
2. Add: support macaca gestrure api (sendActions)
3. Add: add exec api (equal to eval)

## ver 2.0.7 (2017-1-12)

1. Add: support scroll in element

## ver 2.0.6 (2017-1-9)

1. Fix: support node v7.x

## ver 2.0.5 (2016-12-24)

1. Fix: driver api sendKeys change to sendElementKeys

## ver 2.0.4 (2016-12-20)

1. Fix: fix chai issue when catch error by promise
2. Other: show more message for find api

## ver 2.0.3 (2016-12-19)

1. Other: show more message for wait api

## ver 2.0.2 (2016-12-2)

1. Fix: fix findVisible issue

## ver 2.0.1 (2016-12-1)

1. Fix: skip VirtualBox and Loopback when get local ip

## ver 2.0.0 (2016-10-26)

1. add: Support mix promise with Driver class
2. add: Support promise mode for chai
3. add: new Elements api(get, first, last, slice)
4. add: Support macaca api(contexts, context, native, webview, touchSwipe)
5. add: add mouseMove to Elements class

## ver 1.1.0 (2016-9-12)

1. add: browser.findVisible, find visible elements
2. wait api: support multi elements

## ver 1.0.12 (2016-6-6)

1. find api: throw error when find no elements
2. wait api: throw error when wait timeout

## ver 1.0.10 (2016-5-30)

1. add support to touch api

## ver 1.0.8 (2016-5-11)

1. fix element.val when used with select tag

## ver 1.0.2 (2015-11-13)

1. add elements.select: used for select `<option>`
2. add elements.val api, used for get and set value from element
3. delete elements.setValue api

## ver 1.0.1 (2015-11-9)

1. Update PromiseClass to v0.9.5: support generator callback function
2. Fix examples

## ver 1.0.0 (2015-11-9)

1. All api reconstructed
2. Support promise & generator & es7 async
3. Support hosts mode, different hosts for different job
4. Support for remote file upload
5. Options for change the test speed
6. Drop fiber
