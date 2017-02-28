'use strict';
// http://code.google.com/p/selenium/wiki/JsonWireProtocol#Command_Reference

let mapCommands = {
    // /status
	'getStatus' : ['GET', '/status'],

    // session
    'getSessions' : ['GET', '/sessions'],
    'getSessionInfo' : ['GET', '/session/:sessionId'],
	'newSession' : ['POST', '/session'],
    'getSession' : ['GET', '/session/:sessionId'],
	'delSession' : ['DELETE', '/session/:sessionId'],

	// window & frame
	'getCurrentWindowHandle' : ['GET', '/session/:sessionId/window_handle'],
	'getAllWindowHandles' : ['GET', '/session/:sessionId/window_handles'],
	'switchWindow' : ['POST', '/session/:sessionId/window'],
	'closeWindow' : ['DELETE', '/session/:sessionId/window'],
	'getWindowSize' : ['GET', '/session/:sessionId/window/:windowHandle/size'],
	'setWindowSize' : ['POST', '/session/:sessionId/window/:windowHandle/size'],
	'maximizeWindow' : ['POST', '/session/:sessionId/window/:windowHandle/maximize'],
	'getWindowPosition' : ['GET', '/session/:sessionId/window/:windowHandle/position'],
	'setWindowPosition' : ['POST', '/session/:sessionId/window/:windowHandle/position'],
	'switchFrame' : ['POST', '/session/:sessionId/frame'],
    'switchFrameParent' : ['POST', '/session/:sessionId/frame/parent'],

	// cookie
	'getAllCookies' : ['GET', '/session/:sessionId/cookie'],
	'clearAllCookies' : ['DELETE', '/session/:sessionId/cookie'],
	'setCookie' : ['POST', '/session/:sessionId/cookie'],
	'delCookie' : ['DELETE', '/session/:sessionId/cookie/:name'],

	// local storage
	'getAllLocalStorageKeys' : ['GET', '/session/:sessionId/local_storage'],
	'clearAllLocalStorages' : ['DELETE', '/session/:sessionId/local_storage'],
	'getLocalStorage' : ['GET', '/session/:sessionId/local_storage/key/:key'],
	'setLocalStorage' : ['POST', '/session/:sessionId/local_storage'],
	'deleteLocalStorage' : ['DELETE', '/session/:sessionId/local_storage/key/:key'],

	// session storage
	'getAllSessionStorageKeys' : ['GET', '/session/:sessionId/session_storage'],
	'clearAllSessionStorages' : ['DELETE', '/session/:sessionId/session_storage'],
	'getSessionStorage' : ['GET', '/session/:sessionId/session_storage/key/:key'],
	'setSessionStorage' : ['POST', '/session/:sessionId/session_storage'],
	'deleteSessionStorage' : ['DELETE', '/session/:sessionId/session_storage/key/:key'],

	// timeout
	'configTimeouts' : ['POST', '/session/:sessionId/timeouts'],
	'configAsyncScriptTimeout' : ['POST', '/session/:sessionId/timeouts/async_script'],
    'configImplicitTimeout' : ['POST', '/session/:sessionId/timeouts/implicit_wait'],

	// browser
	'getScreenshot' : ['GET', '/session/:sessionId/screenshot'],
	'setUrl' : ['POST', '/session/:sessionId/url'],
	'getUrl' : ['GET', '/session/:sessionId/url'],
	'setForward' : ['POST', '/session/:sessionId/forward'],
	'setBack' : ['POST', '/session/:sessionId/back'],
	'setRefresh' : ['POST', '/session/:sessionId/refresh'],

	'getTitle' : ['GET', '/session/:sessionId/title'],
	'getSource' : ['GET', '/session/:sessionId/source'],

	'exec' : ['POST', '/session/:sessionId/execute'],
	'execASync' : ['POST', '/session/:sessionId/execute_async'],

	// alert
	'getAlert' : ['GET', '/session/:sessionId/alert_text'],
	'setAlert' : ['POST', '/session/:sessionId/alert_text'],
	'acceptAlert' : ['POST', '/session/:sessionId/accept_alert'],
	'dismissAlert' : ['POST', '/session/:sessionId/dismiss_alert'],

	// key & mouse
	'sendKeys' : ['POST', '/session/:sessionId/keys'],
	'click' : ['POST', '/session/:sessionId/click'],
	'doubleClick' : ['POST', '/session/:sessionId/doubleclick'],
	'mouseDown' : ['POST', '/session/:sessionId/buttondown'],
	'mouseMove' : ['POST', '/session/:sessionId/moveto'],
	'mouseUp' : ['POST', '/session/:sessionId/buttonup'],

	// element
	'getActiveElement': ['POST', '/session/:sessionId/element/active'],
	'findElements': ['POST', '/session/:sessionId/elements'],
	'findChildElements': ['POST', '/session/:sessionId/element/:id/elements'],

    'getElementTagName': ['GET', '/session/:sessionId/element/:id/name'],
	'getElementAttribute': ['GET', '/session/:sessionId/element/:id/attribute/:name'],
    'getElementProperty': ['GET', '/session/:sessionId/element/:id/property/:name'],
    'getElementRect': ['GET', '/session/:sessionId/element/:id/rect'],
	'getElementCss': ['GET', '/session/:sessionId/element/:id/css/:propertyName'],
	'sendElementKeys': ['POST', '/session/:sessionId/element/:id/value'],
	'setElementClear': ['POST', '/session/:sessionId/element/:id/clear'],
	'getElementText': ['GET', '/session/:sessionId/element/:id/text'],

	'getElementDisplayed': ['GET', '/session/:sessionId/element/:id/displayed'],
    'getElementEnabled': ['GET', '/session/:sessionId/element/:id/enabled'],
    'getElementSelected': ['GET', '/session/:sessionId/element/:id/selected'],
	'getElementOffset': ['GET', '/session/:sessionId/element/:id/location'],
	'getElementOffsetInView': ['GET', '/session/:sessionId/element/:id/location_in_view'],
	'getElementSize': ['GET', '/session/:sessionId/element/:id/size'],

	'setElementClick': ['POST', '/session/:sessionId/element/:id/click'],
    'setElementSubmit': ['POST', '/session/:sessionId/element/:id/submit'],

	'getElementEquals': ['GET', '/session/:sessionId/element/:id/equals/:other'],

    // mobile
    'touchDown': ['POST', '/session/:sessionId/touch/down'],
    'touchMove': ['POST', '/session/:sessionId/touch/move'],
    'touchUp': ['POST', '/session/:sessionId/touch/up'],

    'touchClick': ['POST', '/session/:sessionId/touch/click'],
    'touchDoubleClick': ['POST', '/session/:sessionId/touch/doubleclick'],
    'touchLongclick': ['POST', '/session/:sessionId/touch/longclick'],

    'touchScroll': ['POST', '/session/:sessionId/touch/scroll'],
    'touchFlick': ['POST', '/session/:sessionId/touch/flick'],

    'getOrientation': ['GET', '/session/:sessionId/orientation'],
    'setOrientation': ['POST', '/session/:sessionId/orientation'],

    // geo location
    'getLocation': ['GET', '/session/:sessionId/location'],
    'setLocation': ['POST', '/session/:sessionId/location'],

    // file upload
    'uploadFile': ['POST', '/session/:sessionId/file'],

    // macaca api
    'getContexts': ['GET', '/session/:sessionId/contexts'],
    'getContext': ['GET', '/session/:sessionId/context'],
    'setContext': ['POST', '/session/:sessionId/context'],
    'setActions': ['POST', '/session/:sessionId/actions']
};

module.exports = mapCommands;
