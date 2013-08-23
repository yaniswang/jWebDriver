/**
* This class is used for control browser.
* <p>
* Browser类用来实例化一个对象，以绑定目标浏览器并调用接口进行控制。
* </p>
* @class Browser
*/

var http = require('http'),
	fs = require('fs'),
	Fiber = require('fibers'),
	extend = require('xtend');

var Element = require('./element');

var arrCommands = require('./commands.js');

//颜色列表
var colors = {
	black: '\x1b[0;30m',
	dkgray: '\x1b[1;30m',
	brick: '\x1b[0;31m',
	red: '\x1b[1;31m',
	green: '\x1b[0;32m',
	lime: '\x1b[1;32m',
	brown: '\x1b[0;33m',
	yellow: '\x1b[1;33m',
	navy: '\x1b[0;34m',
	blue: '\x1b[1;34m',
	violet: '\x1b[0;35m',
	magenta: '\x1b[1;35m',
	teal: '\x1b[0;36m',
	cyan: '\x1b[1;36m',
	ltgray: '\x1b[0;37m',
	white: '\x1b[1;37m',
	reset: '\x1b[0m'
};

//响应代码
var responseCodes = {
	'0': {type: 'Success', message:	'The command executed successfully.'},
	'7': {type: 'NoSuchElement', message: 'An element could not be located on the page using the given search parameters.'},
	'8': {type: 'NoSuchFrame', message: 'A request to switch to a frame could not be satisfied because the frame could not be found.'},
	'9': {type: 'UnknownCommand', message: 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.'},
	'10': {type: 'StaleElementReference', message: 'An element command failed because the referenced element is no longer attached to the DOM.'},
	'11': {type: 'ElementNotVisible', message: 'An element command could not be completed because the element is not visible on the page.'},
	'12': {type: 'InvalidElementState', message: 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).'},
	'13': {type: 'UnknownError', message: 'An unknown server-side error occurred while processing the command.'},
	'15': {type: 'ElementIsNotSelectable', message: 'An attempt was made to select an element that cannot be selected.'},
	'17': {type: 'JavaScriptError', message: 'An error occurred while executing user supplied JavaScript.'},
	'19': {type: 'XPathLookupError', message: 'An error occurred while searching for an element by XPath.'},
	'23': {type: 'NoSuchWindow', message: 'A request to switch to a different window could not be satisfied because the window could not be found.'},
	'24': {type: 'InvalidCookieDomain', message: 'An illegal attempt was made to set a cookie under a different domain than the current page.'},
	'25': {type: 'UnableToSetCookie', message: 'A request to set a cookie\'s value could not be satisfied.'},
    '26': {type: 'UnexpectedAlertOpen', message: 'A modal dia` was open, blocking this operation'},
    '27': {type: 'NoAlertOpenError', message: 'An attempt was made to operate on a modal dialog when one was not open.'},
	'28': {type: 'ScriptTimeout', message: 'A script did not complete before its timeout expired.'},
    '29': {type: 'InvalidElementCoordinates', message: 'The coordinates provided to an interactions operation are invalid.'},
    '30': {type: 'IMENotAvailable', message: 'IME was not available.'},
    '31': {type : 'IMEEngineActivationFailed', message: 'An IME engine could not be started.'},
    '32': {type: 'InvalidSelector', message: 'Argument was an invalid selector (e.g. XPath/CSS).'}
};

//默认浏览器参数
var defaultOptions = {
	'browserName': 'firefox',
	'version': '',
	'platform': 'ANY'
}

//浏览器昵称
var arrBrowserNickName = {
	'ie': 'internet explorer',
	'ff': 'firefox'
}

//鼠标按钮映射表
var arrMouseButton = {
	'left': 0,
	'middle': 1,
	'right': 2
}

//键盘特殊按键映射表
var arrSpecKeys = {
	'null': '\uE000',
	'cancel': '\uE001',
	'help': '\uE002',
	'back': '\uE003',
	'tab': '\uE004',
	'clear': '\uE005',
	'return': '\uE006',
	'enter': '\uE007',
	'shift': '\uE008',
	'ctrl': '\uE009',
	'alt': '\uE00A',
	'pause': '\uE00B',
	'esc': '\uE00C',
	'space': '\uE00D',
	'pageup': '\uE00E',
	'pagedown': '\uE00F',
	'end': '\uE010',
	'home': '\uE011',
	'left': '\uE012',
	'up': '\uE013',
	'right': '\uE014',
	'down': '\uE015',
	'insert': '\uE016',
	'delete': '\uE017',
	'semicolon': '\uE018',
	'equals': '\uE019',
	'num0': '\uE01A',
	'num1': '\uE01B',
	'num2': '\uE01C',
	'num3': '\uE01D',
	'num4': '\uE01E',
	'num5': '\uE01F',
	'num6': '\uE020',
	'num7': '\uE021',
	'num8': '\uE022',
	'num9': '\uE023',
	'multiply': '\uE024',
	'add': '\uE025',
	'separator': '\uE026',
	'subtract': '\uE027',
	'decimal': '\uE028',
	'divide': '\uE029',
	'f1': '\uE031',
	'f2': '\uE032',
	'f3': '\uE033',
	'f4': '\uE034',
	'f5': '\uE035',
	'f6': '\uE036',
	'f7': '\uE037',
	'f8': '\uE038',
	'f9': '\uE039',
	'f10': '\uE03A',
	'f11': '\uE03B',
	'f12': '\uE03C',
	'command': '\uE03D',
	'meta': '\uE03D'
}

var Browser = function(){
	var self = this;
	return self._init.apply(self, arguments);
}

Browser.prototype = {

	/**
	 * 初始化浏览器对象
	 * @method _init
	 * @private
	 * @param  {Object} config jWebDriver config
	 * @param  {Object}   options  浏览器初始化参数
	 * @param  {Function} callback 回调函数
	 */
	_init: function(config, options, callback){
		var self = this;
		self.sessionId = null;
		self.logMode = config.logMode;
		self.host = config.host;
		self.port = config.port;
		var browserName = options.browserName;
		if(browserName && (browserName = arrBrowserNickName[browserName])){
			options.browserName = browserName;
		}
		var sessionOptions = {
			'desiredCapabilities': extend({}, defaultOptions, options)
		};
		if(options.Fiber){
			Fiber = options.Fiber;
			var result = self.doCommand('setSession', sessionOptions);
			callback(result);
		}
		else{
			self.doCommand('setSession', sessionOptions, callback);
		}
		self.windowHandle = 'current';
	},

	/**
	 * 输出日志
	 * @method log
	 * @public
	 * @param  {String} type 日志类型
	 * @param  {String} message 日志内容
	 * @return {Browser}	当前Browser对象实例
	 */
	log: function(type, message){
		var self = this;
		if(message === undefined){
			message = type;
			type = 'INFO';
		}
		if(self.logMode === 'all' || (self.logMode === 'error' && type === 'ERROR')){
			var dateString = (new Date()).toString().match(/\d\d:\d\d:\d\d/)[0];
			var mapColors = {
				'COMMAND': colors.violet,
				'DATA': colors.brown,
				'RESULT': colors.teal,
				'ERROR': colors.red,
				'WARNING': colors.yellow,
				'INFO': colors.white
			}
			if(message){
				console.log(colors.dkgray +'[' + dateString + ']: ' + colors.reset, mapColors[type] + type + colors.reset, '\t', message);
			}
			else{
				console.log(colors.dkgray +'[' + dateString + ']: ' + colors.reset, mapColors[type] + type + colors.reset);
			}
		}
		return self;
	},

	/**
	 * 检查返回值是否有错误，适用于所有WebDriver API的返回值
	 * @method isError
	 * @public
	 * @param  {Object}  result 所有WebDriver API的返回值
	 * @return {Boolean}        如果有错误返回true
	 */
	isError: function(result){
		var status = result && result.status;
		return status !== undefined && status !== 0;
	},

	/**
	 * 检查返回值是否正确，适用于所有WebDriver API的返回值
	 * @method isOk
	 * @public
	 * @param  {Object}  result 所有WebDriver API的返回值
	 * @return {Boolean}        如果正确返回true
	 */
	isOk: function(result){
		return !this.isError(result);
	},

	/**
	 * 执行webdriver命令
	 * @method doCommand
	 * @public
	 * @param  {String}   cmd      命令名称
	 * @param  {Object}   data     命令数据
	 * @param  {Function} [callback] 回调函数，如果省略此参数，则为同步模式，直接返回结果
	 * @return {Object}            webdriver返回的JSON对象
	 */
	doCommand: function(cmd, data, callback){
		var self = this, cmdInfo = arrCommands[cmd];
		if(cmdInfo){
			var method = cmdInfo[0], path = cmdInfo[1];
			path = path.replace(':sessionId', self.sessionId);
			var pathValues;
			if(data && (pathValues = data.pathValues)){
				//填充PATH中除sessionId以外的参数
				for(var name in pathValues){
					path = path.replace(':'+name, encodeURIComponent(pathValues[name]));
				}
				delete data.pathValues;
			}
			var requestOptions = {
				'method': method,
				'host': self.host,
				'port': self.port,
				'path': '/wd/hub'+path
		    };

			function getResult(result){
				if(result){
					result = result.replace(/\x00/g,'')
					try{
						result = JSON.parse(result);
					}
					catch(err){
		                if (result !== '') {
		                	self.log('ERROR', err + '\n' + result + '\n')
		                }
		                result = {status: -1, errorType: 'jsonError', errorMessage: 'JSON.parse error.'};
		                return callback?callback(result):result;
					}

					if (result.status === 0) {//操作成功
						self.log('RESULT', result.value);
						result = result.value;
					}
		            else {
			   			var responseInfo = responseCodes[result.status],
							responseType = responseInfo.type,
							responseMessage = responseInfo.message;

						result.errorType = responseType;
						result.errorMessage = responseMessage;

						self.log('ERROR', responseType);
		            }
				}
				if(callback){
					callback(result);
				}
				else{
					return result;
				}
			}
			if(callback){
				self._doRequest(requestOptions, data, getResult);
			}
			else{
				var response = self._doRequest(requestOptions, data);
				return getResult(response);
			}
		}
	},

	/**
	 * 发起HTTP请求到webdriver的接口
	 * @method _doRequest
	 * @private
	 * @param  {Object}   requestOptions HTTP请求参数
	 * @param  {Object}   data           HTTP BODY
	 * @param  {Function} [callback]       回调函数，活力回调函数则为同步返回模式
	 * @return {String}                  HTTP响应字符串
	 */
	_doRequest: function(requestOptions, data, callback){
		var self = this, fiber = Fiber.current;

		self.log('COMMAND', requestOptions.method + '\t' + requestOptions.path);

		var responseStr = '';

		if(data){
			data = JSON.stringify(data);
			//转义Unicode字符
			data = data.replace(/[^\x00-\xff]/g, function(a){
				return '\\'+escape(a).substr(1);
			});
			if(data !== '{}'){
				self.log('DATA', data);
			}
		}
		else{
			data = '';
		}
		requestOptions.headers = {
			'Accept': 'application/json; charset=utf-8',
			'Content-Type': 'application/json;charset=UTF-8',
			'Content-Length': data.length
		}
		requestOptions.agent = false;

		var req = http.request(requestOptions, function(res){
			if ( /^302|303$/.test(res.statusCode) && self.sessionId === null) {
	        	try{
	        		var match = res.headers.location.match(/wd\/hub\/session\/(.+)$/i);
	        		if(match !== null){
	        			self.sessionId = match[1];
	        			self.log('RESULT', self.sessionId);
	        		}
	        	}
	        	catch(e){
	        	}
	        	return doCallback('');
			}
			var arrResBuffers = [], resBufferSize = 0;
		    res.on('data', function (data) {
		        arrResBuffers.push(data);
		        resBufferSize += data.length;
		    });
		    res.on('end', function () {
		        var resBuffer = new Buffer(resBufferSize), pos = 0;
		        for(var i = 0, c = arrResBuffers.length; i < c; i++) {
		            arrResBuffers[i].copy(resBuffer, pos);
		            pos += arrResBuffers[i].length;
		        }
		        responseStr = resBuffer.toString('utf-8');
		        doCallback(responseStr);
		     });
		});

		req.on('error', function(err)
		{
			self.log('ERROR', 'ERROR ON REQUEST');
		});

		if(data){
			req.write(data);
		}
		req.end();

		function doCallback(data){
	        if(callback){//异步模式
	        	callback(data);
	        }
	        else if(fiber){//同步模式
	        	fiber.run();
	        }
		}

		if(callback === undefined && fiber){
			Fiber.yield();
			return responseStr;
		}
	},

	/**
	 * 延迟一定时间
	 * @method sleep
	 * @public
	 * @param  {Number} ms 需要延迟的时间，单位毫秒
	 * @return {Browser}	当前Browser对象实例
	 */
	sleep: function(ms){
		var fiber = Fiber.current;
		setTimeout(function(){
			fiber.run();
		},ms);
		Fiber.yield();
		return this;
	},

	/**
	 * 返回窗口句柄
	 * @method window
	 * @public
	 * @param  {Boolean} [bAll] 是否返回所有窗口，设置为true返回所有窗口
	 * @return {String|Array}       单个或数组形式的窗口句柄
	 */
	window: function(bAll){
		return this.doCommand(bAll === true?'getWindows':'getWindow');
	},

	/**
	 * 切换到另一个Window或Frame
	 * @method switchTo
	 * @public
	 * @param  {String|Element|Number} [target] 要切换的目标窗口句柄、Frame对象(Element)、Frame在页面中的序号(Number)，如果省略此参数则切换到主窗口
	 * @return {Browser}	当前Browser对象实例
	 */
	switchTo: function(target){
		var self = this;
		if(typeof target === 'string'){
			self.windowHandle = target;
			self.doCommand('switchWindow',{name: target});
		}
		else if(target instanceof Element){
			self.doCommand('switchFrame',{id: target.toArray()});
		}
		else if(target === undefined){
			self.doCommand('switchFrame',{id: null});
		}
		return self;
	},

	/**
	 * 返回或者设置当前窗口的大小
	 * @method size
	 * @public
	 * @param  {Number|Object} [width]  宽度或者大小对象({width,height})
	 * @param  {Number} [height] 高度
	 * @return {Object|Browser}        如果无宽度和高度参数，则返回当前大小对象，否则返回当前Browser实例
	 */
	size: function(width, height){
		var self = this,
			windowHandle = self.windowHandle;
		if(width === undefined){
			//返回首个窗口的大小
			return self.doCommand('getWindowSize', {'pathValues': {'windowHandle': windowHandle}});
		}
		else if(width.width !== undefined){
			height = width.height;
			width = width.width;
		}
		self.doCommand('setWindowSize', {
			'pathValues': {'windowHandle': windowHandle},
			'width': width,
			'height': height
		});
		return self;
	},

	/**
	 * 最大化当前窗口
	 * @method maximize
	 * @public
	 * @return {Browser}	当前Browser对象实例
	 */
	maximize: function(){
		var self = this;
		self.doCommand('maximizeWindow', {'pathValues': {'windowHandle': self.windowHandle}});
		return self;
	},

	/**
	 * 返回或者设置当前窗口的坐标
	 * @method offset
	 * @public
	 * @param  {Number|Object} [x]  x坐标或者坐标对象({x,y})
	 * @param  {Number} [y] y坐标
	 * @return {Object|Browser}        如果无x坐标和y坐标参数，则返回当前坐标对象，否则返回当前Browser实例
	 */
	offset: function(x, y){
		var self = this,
			windowHandle = self.windowHandle;
		if(x === undefined){
			//返回首个窗口的大小
			return self.doCommand('getWindowOffset', {'pathValues': {'windowHandle': windowHandle}});
		}
		else if(x.x !== undefined){
			y = x.y;
			x = x.x;
		}
		self.doCommand('setWindowOffset', {
			'pathValues': {'windowHandle': windowHandle},
			'x': x,
			'y': y
		});
		return self;
	},

	/**
	 * 关闭当前窗口
	 * @method close
	 * @public
	 * @return {Browser}	当前Browser对象实例
	 */
	close: function(){
		var self = this;
		self.doCommand('closeWindow');
		return self;
	},

	/**
	 * 结束浏览器会话
	 * @method end
	 * @public
	 * @return {Browser}	当前Browser对象实例
	 */
	end: function(){
		var self = this;
		self.doCommand('delSession');
		return self;
	},

	/**
	 * 设置操作超时时间
	 * <p>
	 * 注：script包括同步和异步两种代码
	 * </p>
	 * @method setTimeout
	 * @public
	 * @param  {String} type 操作类型(script|ascript|implicit|page load)
	 * @param  {Number} ms   超时时间
	 * @return {Browser}	当前Browser对象实例
	 */
	setTimeout: function(type, ms){
		var self = this;
		if(type === 'ascript'){
			self.doCommand('setAscriptTimeout', {'ms': ms});
		}
		else{
			self.doCommand('setTimeouts', {'type': type, 'ms': ms});
		}
		return self;
	},

	/**
	 * 打开或者返回当前URL
	 * @method url
	 * @public
	 * @param  {String} [url] 需要打开的URL网址，若省略此参数则返回当前浏览器URL
	 * @return {String|Browser}     若打开URL则返回当前Browser对象实例，否则返回URL地址
	 */
	url: function(url){
		var self = this;
		if(url){
			self.doCommand('setUrl', {'url': url});
			return self;
		}
		else {
			return self.doCommand('getUrl');
		}
	},

	/**
	 * 控制浏览器回到后一个URL
	 * @method forward
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	forward: function(){
		var self = this;
		self.doCommand('setForward');
		return self;
	},

	/**
	 * 控制浏览器回到前一个URL
	 * @method back
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	back: function(){
		var self = this;
		self.doCommand('setBack');
		return self;
	},

	/**
	 * 刷新当前页面
	 * @method refresh
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	refresh: function(){
		var self = this;
		self.doCommand('setRefresh');
		return self;
	},

	/**
	 * 返回当前页面title
	 * @method title
	 * @public
	 * @return {String} 页面title
	 */
	title: function(){
		return this.doCommand('getTitle');
	},

	/**
	 * 返回当前页面源代码
	 * @method source
	 * @public
	 * @return {String} 页面源代码
	 */
	source: function(){
		return this.doCommand('getSource');
	},

	/**
	 * 返回当前页面下所有cookie
	 * @method getCookies
	 * @public
	 * @return {Array} cookie对象数组
	 */
	getCookies: function(){
		return this.doCommand('getAllCookie');
	},

	/**
	 * 添加cookie到当前页面
	 * <p>
	 * 这里可以查看WebDriver官方定义的<a href="http://code.google.com/p/selenium/wiki/JsonWireProtocol#Cookie_JSON_Object" target="_blank">cookie对象</a>
	 * </p>
	 * @method addCookie
	 * @public
	 * @param {Object} cookie cookie对象
	 * @return {Browser} 当前Browser对象实例
	 */
	addCookie: function(cookie){
		var self = this;
		self.doCommand('setCookie', {'cookie': cookie});
		return self;
	},

	/**
	 * 删除cookie
	 * @method delCookies
	 * @public
	 * @param  {String} name cookie name
	 * @return {Browser} 当前Browser对象实例
	 */
	delCookies: function(name){
		var self = this;
		if(name !== undefined){
			self.doCommand('delCookie', {'pathValues': {'name': name}});
		}
		else{
			self.doCommand('delAllCookies');
		}
		return self;
	},

	/**
	 * 执行Javascript脚本
	 * @method exec
	 * @public
	 * @param  {String} script Javascript代码
	 * @param  {Array|Object} [args]   传递给脚本的参数，此参数可省略
	 * @param  {Boolean} bAsync 是否异步，如果是异步必需要调用callback返回，否则一直阻塞
	 * @return {Object}        Javascript脚本的返回值
	 */
	exec: function(script, args, bAsync){
		if(typeof args === 'boolean'){
			bAsync = args;
			args = [];
		}
		args = args?args:[];
		if(Object.prototype.toString.apply(args) !== '[object Array]'){
			//单参数模式
			args = [args];
		}
		var arg;
		for(var i in args){
			arg = args[i];
			if(arg instanceof Element){
				//转换为原生Element对象
				args[i] = arg.toArray();
			}
		}
		var data = {'script': script, args: args};
		return this.doCommand(bAsync === true?'executeAsync':'execute', data);
	},

	/**
	 * 获取弹出窗口的文本(alert, confirm, prompt)
	 * @method getAlert
	 * @public
	 * @return {String} 弹出窗口的文本
	 */
	getAlert: function(){
		return this.doCommand('getAlert');
	},

	/**
	 * 输入prompt中的值
	 * @method setAlert
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	setAlert: function(str){
		var self = this;
		self.doCommand('setAlert', {'text': str});
		return self;
	},

	/**
	 * 关闭弹出窗口
	 * @method closeAlert
	 * @public
	 * @param  {String} [btn] 点击哪个按钮关闭窗口：ok|cancel,默认cancel
	 * @return {Browser} 当前Browser对象实例
	 */
	closeAlert: function(btn){
		var self = this;
		self.doCommand(/^ok$/i.test(btn)?'acceptAlert':'dismissAlert');
		return self;
	},

	/**
	 * 获取或保存当前网页截图
	 * <p>
	 * filePath为可选项，若有则保存到文件
	 * </p>
	 * @method getScreenshot
	 * @public
	 * @param  {String} [filePath] 保存截图的文件路径
	 * @return {String}          Base64格式的网页截图
	 */
	getScreenshot: function(filePath){
		var data = this.doCommand('getScreenshot');
		if(filePath){
			fs.writeFileSync(filePath, data, "base64");
		}
		return data;
	},

	/**
	 * 获取按键映射后的字符数组
	 * @method _getKeyArray
	 * @private
	 * @param  {String} str 原始字符串
	 * @return {Array}     经过映射后的字符数组
	 */
	_getKeyArray: function(str){
		str = str.replace(/{(\w+)}/g, function(all, name){
			var key = arrSpecKeys[name.toLowerCase()];
			return key?key:all;
		});
		return str.split('');
	},

	/**
	 * 发送按键序列到当前焦点对象上
	 * @method sendKeys
	 * @public
	 * @param  {String} str 原始字符串
	 * @return {Browser} 当前Browser对象实例
	 */
	sendKeys: function(str){
		var self = this;
		self.doCommand('sendKeys', {'value': self._getKeyArray(str)});
		return self;
	},

	/**
	 * 在当前光标处触发单击事件
	 * @method click
	 * @public
	 * @param  {String} mouseBtn 鼠标按钮类型：left|middle|right
	 * @return {Browser} 当前Browser对象实例
	 */
	click: function(mouseBtn){
		var self = this, data = {};
		if(mouseBtn){
			var button = arrMouseButton[mouseBtn.toLowerCase()];
			if(button){
				data.button = button;
			}
		}
		self.doCommand('click', data);
		return self;
	},

	/**
	 * 在当前光标处触发双击事件
	 * @method dblclick
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	dblclick: function(){
		var self = this;
		self.doCommand('dblclick');
		return self;
	},

	/**
	 * 在当前光标处触发鼠标左键按下
	 * @method mousedown
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	mousedown: function(){
		var self = this;
		self.doCommand('mousedown');
		return self;
	},

	/**
	 * 移动到指定对象中间或坐标点
	 * @method mousemove
	 * @public
	 * @param  {Number|Element|Object} x X坐标或Element对象或{x,y}
	 * @param  {Number} y y坐标
	 * @return {Browser} 当前Browser对象实例
	 */
	mousemove: function(x, y){
		var self = this, data = {};
		if(x instanceof Element){
			data.element = x.toArray().ELEMENT;
		}
		else if(x.x && x.y){
			data.xoffset = x.x;
			data.yoffset = x.y;
		}
		else{
			data.xoffset = x;
			data.yoffset = y;
		}
		if(data.element === undefined){
			data.xoffset = Math.round(data.xoffset);
			data.yoffset = Math.round(data.yoffset);
		}
		self.doCommand('mousemove', data);
		return self;
	},

	/**
	 * 在当前光标处触发鼠标左键按起
	 * @method mouseup
	 * @public
	 * @return {Browser} 当前Browser对象实例
	 */
	mouseup: function(){
		var self = this;
		self.doCommand('mouseup');
		return self;
	},

	/**
	 * 拖放
	 * @method dragDrop
	 * @public
	 * @param  {Element|Object} from 源对象或源坐标({x,y})
	 * @param  {Element|Object} to   目标对象或目标坐标({x,y})
	 * @return {Browser} 当前Browser对象实例
	 */
	dragDrop: function(from, to){
		var self = this;
		self.mousemove(from).mousedown().mousemove(to).mouseup();
		return self;
	},

	/**
	 * 等待对象出现或消失
	 * @method waitFor
	 * @public
	 * @param  {String} [using]  对象选择类型，留空默认为：css selector(class name|css selector|id|name|link text|partial link text|tag name|xpath)
	 * @param  {String} value  对象选择值
	 * @param  {Boolean} [targetExist] 测试目标是对象存在或不存在
	 * @param  {Number} [timeout] 等待超时时间，单位毫秒，默认30000毫秒
	 * @return {Element|Object} 等待的目标如果存在，则返回Element对象，如果不存在或者超时则返回错误对象
	 */
	waitFor: function(using, value, targetExist, timeout){
		var self = this,
			fiber = Fiber.current,
			ret, bExist, bTimeout = false;
		if(typeof value !== 'string'){
			//默认css选择器
			timeout = targetExist;
			targetExist = value;
			value = using;
			using = 'css selector';
		}
		if(typeof targetExist === 'number'){
			timeout = targetExist;
			targetExist = true;
		}
		if(targetExist === undefined){
			targetExist = true;
		}
		if(timeout === undefined){
			timeout = 30000;
		}
		var _timer1, _timer2;
		function waitElement(){
			self.doCommand('getElement', {'using': using,'value': value}, function(result){
				bExist  = self.isOk(result);
				ret = result;
				if(bExist === targetExist){
					clearTimeout(_timer2);
					fiber.run();
				}
				else if(bTimeout === true){
					fiber.run();
				}
				else if(_timer1 !== null){
					//每隔500毫秒确认目标是否存在
					_timer1 = setTimeout(waitElement, 500);
				}
			});
		}
		_timer1 = setTimeout(waitElement, 1);
		_timer2 = setTimeout(function(){
			self.log('ERROR', 'waitFor timeout: ' + using + ' , ' + value);
			//标记超时，getElement返回时结束当前等待请求
			bTimeout = true;
		}, timeout);
		Fiber.yield();
		return bExist === true ? self.element('element', ret.ELEMENT) : ret;
	},

	/**
	 * 返回Element对象实例
	 * <p>
	 * 此方法不建议直接调用，建议使用run函数的第二个参数$符，例如:
	 * <pre>
	 * wd.run(function(browser, $){
	 * 	$('#id').val('test');
	 * })
	 * </pre>
	 * </p>
	 * @method element
	 * @public
	 * @param  {String} [using] 对象选择类型，留空默认为：css selector(class name|css selector|id|name|link text|partial link text|tag name|xpath)
	 * @param  {String} [value] 对象选择值，留空返回当前焦点所在对象
	 * @return {Element}       Element的实例对象，如果对象不存在，返回原始消息
	 */
	element: function(using, value){
		var self = this;
		var element = new Element(self, using, value);
		return self.isError(element._id) ? element._id : element;
	}

}

module.exports = Browser;