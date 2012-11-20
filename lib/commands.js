
// http://code.google.com/p/selenium/wiki/JsonWireProtocol#Command_Reference

var arrCommands = {
	//session
	'setSession' : ['POST', '/session'],
	'delSession' : ['DELETE', '/session/:sessionId'],

	//window & frame
	'getWindow' : ['GET', '/session/:sessionId/window_handle'],
	'getWindows' : ['GET', '/session/:sessionId/window_handles'],
	'switchWindow' : ['POST', '/session/:sessionId/window'],
	'closeWindow' : ['DELETE', '/session/:sessionId/window'],
	'getWindowSize' : ['GET', '/session/:sessionId/window/:windowHandle/size'],
	'setWindowSize' : ['POST', '/session/:sessionId/window/:windowHandle/size'],
	'maximizeWindow' : ['POST', '/session/:sessionId/window/:windowHandle/maximize'],
	'getWindowOffset' : ['GET', '/session/:sessionId/window/:windowHandle/position'],
	'setWindowOffset' : ['POST', '/session/:sessionId/window/:windowHandle/position'],
	'switchFrame' : ['POST', '/session/:sessionId/frame'],

	//browser
	'setTimeouts' : ['POST', '/session/:sessionId/timeouts'],
	'setAscriptTimeout' : ['POST', '/session/:sessionId/timeouts/async_script'],

	'setUrl' : ['POST', '/session/:sessionId/url'],
	'getUrl' : ['GET', '/session/:sessionId/url'],
	'setForward' : ['POST', '/session/:sessionId/forward'],
	'setBack' : ['POST', '/session/:sessionId/back'],
	'setRefresh' : ['POST', '/session/:sessionId/refresh'],

	'getTitle' : ['GET', '/session/:sessionId/title'],
	'getSource' : ['GET', '/session/:sessionId/source'],

	'getAllCookie' : ['GET', '/session/:sessionId/cookie'],
	'setCookie' : ['POST', '/session/:sessionId/cookie'],
	'delAllCookies' : ['DELETE', '/session/:sessionId/cookie'],
	'delCookie' : ['DELETE', '/session/:sessionId/cookie/:name'],

	'execute' : ['POST', '/session/:sessionId/execute'],
	'executeAsync' : ['POST', '/session/:sessionId/execute_async'],

	'getAlert' : ['GET', '/session/:sessionId/alert_text'],
	'setAlert' : ['POST', '/session/:sessionId/alert_text'],
	'acceptAlert' : ['POST', '/session/:sessionId/accept_alert'],
	'dismissAlert' : ['POST', '/session/:sessionId/dismiss_alert'],

	'getScreenshot' : ['GET', '/session/:sessionId/screenshot'],

	//key & mouse
	'sendKeys' : ['POST', '/session/:sessionId/keys'],
	'click' : ['POST', '/session/:sessionId/click'],
	'dblclick' : ['POST', '/session/:sessionId/doubleclick'],
	'mousedown' : ['POST', '/session/:sessionId/buttondown'],
	'mousemove' : ['POST', '/session/:sessionId/moveto'],
	'mouseup' : ['POST', '/session/:sessionId/buttonup'],

	//element
	'getActiveElement': ['POST', '/session/:sessionId/element/active'],
	'getElement': ['POST', '/session/:sessionId/element'],
	'getElements': ['POST', '/session/:sessionId/elements'],
	'findElement': ['POST', '/session/:sessionId/element/:id/element'],

	'getAttr': ['GET', '/session/:sessionId/element/:id/attribute/:name'],
	'getCss': ['GET', '/session/:sessionId/element/:id/css/:propertyName'],
	'getValue': ['GET', '/session/:sessionId/element/:id/value'],
	'setValue': ['POST', '/session/:sessionId/element/:id/value'],
	'setClear': ['POST', '/session/:sessionId/element/:id/clear'],
	'getText': ['GET', '/session/:sessionId/element/:id/text'],

	'getDisplayed': ['GET', '/session/:sessionId/element/:id/displayed'],
	'getLocation': ['GET', '/session/:sessionId/element/:id/location'],
	'getLocationInView': ['GET', '/session/:sessionId/element/:id/location_in_view'],
	'getSize': ['GET', '/session/:sessionId/element/:id/size'],

	'getEnabled': ['GET', '/session/:sessionId/element/:id/enabled'],
	'getSelected': ['GET', '/session/:sessionId/element/:id/selected'],

	'setSubmit': ['POST', '/session/:sessionId/element/:id/submit'],
	'setClick': ['POST', '/session/:sessionId/element/:id/click'],

	'getElementEquals': ['GET', '/session/:sessionId/element/:id/equals/:other']
}

module.exports = arrCommands;