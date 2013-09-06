/**
 * A webdriver client for Node.js
 * <p>
 * 此对象是jwebdriver组件的入口，主要用来初始化及同步运行测试代码。
 * </p>
 * <pre>
 * var JWebDriver = require('jwebdriver');
 * JWebDriver.config({
 * 	'logMode': 'all',
 * 	'host': 'localhost',
 * 	'port': 4444
 * });
 * var wd = new JWebDriver({'browserName':'chrome'});
 * wd.run(function(browser, $){
 * 	browser.url("http://www.baidu.com/");
 * 	var kw = $('#kw');
 * 	kw.val('mp3').submit();
 * 	browser.end();
 * });
 * </pre>
 * @class JWebDriver
 */

var extend = require('xtend'),
	Fiber = require('fibers');

var Browser = require('./browser');

//全局配置
var wdConfig, defConfig = {
	'logMode': 'all',	//slient|error|all
	'host': 'localhost',
	'port': 4444
};
wdConfig = defConfig;

var JWebDriver = function(){
	var self = this;
	return self._init.apply(self, arguments);
}

/**
 * 设置全局配置
 * <p>
 * 设置JWebDriver全局配置，后续所有实例共享此配置
 * </p>
 * <pre>
 * JWebDriver.config({
 * 	'logMode': 'all',
 * 	'host': 'localhost',
 * 	'port': 4444
 * });
 * </pre>
 * @method config
 * @static
 * @public
 * @param  {Object} options 选项参数
 */
JWebDriver.config = function(options){
	wdConfig = extend({}, defConfig, options);
}

JWebDriver.prototype = {

	/**
	 * 初始化函数
	 * @method _init
	 * @private
	 * @param  {Object}   options  初始化选项
	 * @param  {Function} onError 失败回调函数
	 */
	_init: function(options, onError){
		var self = this;
		self._Fiber = options.Fiber;
		self._arrTasks = [];//任务队列数组
		self._bRun = true;//运行状态
		self._browser = new Browser(wdConfig, options, function(result){
			if(result && result.status !== 0){
				if(onError){
					onError(result);
				}
			}
			else{
				//Session初始化成功，执行任务队列
				self._bRun = false;
				self._run();
			}
		});
	},

	/**
	 * 加入任务队列
	 * <p>
	 * 若当前队列为空，则直接运行
	 * </p>
	 * @method run
	 * @public
	 * @param  {Function} func 需要运行的函数
	 * @return {JWebDriver} 当前JWebDriver对象实例
	 */
	run: function(func){
		var self = this;
		//插入运行队列
		self._arrTasks.push(func);
		if(!self._bRun){
			self._run();
		}
		return self;
	},

	/**
	 * 运行队列中的任务
	 * @private
	 * @method _run
	 */
	_run: function(){
		var self = this ,
			browser = self._browser, 
			func = self._arrTasks.shift();
		if(func && browser !== null){
			var taskFunc = function(){
				self._bRun = true;
				func(browser, function(){
					return browser.element.apply(browser, arguments);
				});
				self._bRun = false;
				//继续运行下个任务
				self._run();
			};
			if(self._Fiber){
				taskFunc();
			}
			else{
				Fiber(taskFunc).run();
			}
		}
	},

	/**
	 * 结束WebDriver会话
	 * <p>
	 * 本接口仅能取消后续未执行的任务队列，已经在执行中的无法中断，并且会在当前任务执行完毕后才中断。
	 * </p>
	 * @method end
	 * @public
	 */
	end: function(){
		var self = this;
		if(self._browser !== null){
			self._arrTasks = [];
			self.run(function(browser){
				browser.end();
				self._browser = null;
			});
		}
	}
}

module.exports = JWebDriver;