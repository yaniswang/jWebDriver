/**
 * A webdriver client for Node.js
 * <p>
 * 此对象是jwebdriver组件的入口，主要用来初始化及同步运行测试代码。
 * </p>
 * <pre>
 * var JWebDriver = require('jwebdriver');
 * JWebDriver.config({
 * 	'host': 'localhost',
 * 	'port': 4444
 * });
 * var wd = new JWebDriver({'browserName':'chrome'});
 * wd.run(function(browser, $){
 * 	browser.url("http://www.baidu.com/");
 * 	var kw = $('#kw');
 * 	kw.val('mp3').submit();
 * 	browser.close();
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
	 * @param  {Function} callback 回调函数
	 */
	_init: function(options, callback){
		var self = this;
		self._Fiber = Fiber;
		self._arrTask = [];//任务队列数组
		self._bRun = true;//运行状态
		self.browser = new Browser(wdConfig, options, function(){
			//Session初始化结束，执行任务队列
			self._bRun = false;
			self._run();
		});
		if(callback){
			self.run(callback);
		}
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
		self._arrTask.push(func);
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
		var self = this , arrTask = self._arrTask;
		if(arrTask.length>0){
			var func = arrTask.shift();
			self._Fiber(function(){
				self._bRun = true;
				var browser = self.browser;
				func(browser, function(){
					return browser.$.apply(browser, arguments);
				});
				self._bRun = false;
				//继续运行下个任务
				self._run();
			}).run();
		}
	}
}

module.exports = JWebDriver;