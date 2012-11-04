/**
* This class is used for control element.
* <p>
* 此类用来和页面对象进行交互。
* </p>
* @class Element
*/

var Element = function(){
	var self = this;
	return self._init.apply(self, arguments);
}

Element.prototype = {

	/**
	 * 初始化Element对象
	 * @method _init
	 * @private
	 * @param  {Browser} browser Element所在的Browser对象实例
	 * @param  {String} [using]   对象选择类型，留空默认为：css selector(class name|css selector|id|name|link text|partial link text|tag name|xpath)
	 * @param  {String} value   对象选择值
	 */
	_init: function(browser, using, value){
		var self = this;
		self.browser = browser;
		if(value === undefined){
			//默认css选择器
			value = using;
			using = 'css selector';
		}
		if(value === 'active'){
			self._id = browser.doCommand('getActiveElement').ELEMENT;
		}
		else if(using === 'element'){
			self._id = value;
		}
		else{
			var regCheck = /^(class name|css selector|id|name|link text|partial link text|tag name|xpath)$/i;
			if (regCheck.test(using) === false)
			{
				throw 'Please provide any of the following using strings as the first parameter: class name, css selector, id, name, link text, partial link text, tag name or xpath';
			}
			self._id = browser.doCommand('getElement', {'using': using,'value': value}).ELEMENT;
		}
	},

	/**
	 * 在对应对象上执行Element命令
	 * @method _doElementCommand
	 * @private
	 * @param  {String} cmd  命令
	 * @param  {Object} data 命令需要的数据
	 * @return {Object}      命令执行结果
	 */
	_doElementCommand: function(cmd, data){
		var self = this;
		data = data || {};
		data['pathValues'] = data['pathValues'] || {};
		data.pathValues.id = self._id;
		return self.browser.doCommand(cmd, data);
	},

	/**
	 * 返回官方JSON格式的Element对象
	 * @method toJson
	 * @public
	 * @return {Object} 官方Element对象{ELEMENT}
	 */
	toJson: function(){
		return {ELEMENT: this._id};
	},

	/**
	 * 查找对象下的对象
	 * @method find
	 * @public
	 * @param  {String} [using] 对象选择类型，留空默认为：css selector(class name|css selector|id|name|link text|partial link text|tag name|xpath)
	 * @param  {String} value 对象选择值
	 * @return {Element}       Element的实例对象
	 */
	find: function(using, value){
		var self = this;
		if(value === undefined){
			//默认css选择器
			value = using;
			using = 'css selector';
		}
		var response = self._doElementCommand('findElement', {'using': using,'value': value}),
			id = response.ELEMENT;
		if(id){
			return new Element(self.browser, 'element', id);
		}
		else{
			return false;
		}
	},

	/**
	 * 返回DOM属性值
	 * @method attr
	 * @public
	 * @param  {String} name 属性名称
	 * @return {String}      属性值
	 */
	attr: function(name){
		return this._doElementCommand('getAttr', {'pathValues': {'name': name}});
	},

	/**
	 * 返回DOM的CSS属性值
	 * @method css
	 * @public
	 * @param  {String} name CSS名称
	 * @return {String}      CSS值
	 */
	css: function(name){
		return this._doElementCommand('getCss', {'pathValues': {'propertyName': name}});
	},

	/**
	 * 返回或设置value值
	 * @method val
	 * @public
	 * @param  {String} [str] value值，此值省略时为取value值
	 * @return {String|Element}     返回value值或者当前Element实例
	 */
	val: function(str){
		var self = this;
		if(str){
			self.clear().sendKeys(str);
			return self;
		}
		else{
			return self._doElementCommand('getValue');
		}
	},

	/**
	 * 清空value值
	 * @method clear
	 * @public
	 * @return {Element} 返回当前Element实例
	 */
	clear: function(){
		var self = this;
		self._doElementCommand('setClear');
		return self;
	},

	/**
	 * 返回当前对象可视文本
	 * @method text
	 * @public
	 * @return {String} 返回的可视文本
	 */
	text: function(){
		return this._doElementCommand('getText');
	},

	/**
	 * 当前对象是否可视
	 * @method visible
	 * @public
	 * @return {Boolean} 当前对象的可视状态
	 */
	visible: function(){
		return this._doElementCommand('getDisplayed');
	},

	/**
	 * 当前对象的坐标
	 * @method offset
	 * @public
	 * @param  {Boolean} bInView 是否相对坐标
	 * @return {Object}         返回{x,y}格式的对象
	 */
	offset: function(bInView){
		return this._doElementCommand(bInView?'getLocationInView':'getLocation');
	},

	/**
	 * 当前对象的大小
	 * @method size
	 * @public
	 * @return {Object} 返回{width,height}格式的对象
	 */
	size: function(){
		return this._doElementCommand('getSize');
	},

	/**
	 * 当前对象是否可用状态
	 * @method enabled
	 * @public
	 * @return {Boolean} 当前对象的可用状态
	 */
	enabled: function(){
		return this._doElementCommand('getEnabled');
	},

	/**
	 * 当前对象是否处于被选择状态
	 * 适用于以下对象：option,checkbox,radio
	 * @method selected
	 * @public
	 * @return {Boolean} 当前对象是否被选择
	 */
	selected: function(){
		return this._doElementCommand('getSelected');
	},

	/**
	 * 提前对象所在的表单
	 * @method submit
	 * @public
	 * @return {Element} 返回当前Element实例
	 */
	submit: function(){
		var self = this;
		self._doElementCommand('setSubmit');
		return self;
	},

	/**
	 * 单击当前对象
	 * @method click
	 * @public
	 * @return {Element} 返回当前Element实例
	 */
	click: function(){
		var self = this;
		self._doElementCommand('setClick');
		return self;
	},

	/**
	 * 发送键盘按键序列到当前对象上
	 * @method sendKeys
	 * @public
	 * @param  {String} str 键盘按钮序列
	 * @return {Element}     返回当前Element实例
	 */
	sendKeys: function(str){
		var self = this;
		self._doElementCommand('setValue', {'value': self.browser._getKeyArray(str)});
		return self;
	},

	/**
	 * 比较两个Element是否指向同一个DOM对象
	 * @method equals
	 * @public
	 * @param  {Element} $element 需要比较的Element对象实例
	 * @return {Boolean}          是否指向同一个DOM对象
	 */
	equals: function($element){
		return this._doElementCommand('getElementEquals', {'pathValues': {'other': $element._id}});
	}
}

module.exports = Element;