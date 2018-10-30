/*
 * 下拉框
 * @date 2015-09-14
 * @auth AnNing
 */
define(["cmp", "service/common/common"], function(cmp, common) {
	
	/*
	 * 模板
	 */
	var optnTpl = "<li name='{value}'>{displayValue}</li>";
	
	/*
	 * 构造下拉框选项
	 */
	function _createOptions(data) {
		
		if (!data) return;
		
		var arr = [];
		
		for (var i = 0, l = data.length; i < l; i++) {
			
			arr.push(optnTpl.format(data[i]));
			
		}
		
		return arr.join("");
		
	}
	
	/*
	 * 在这里添加下拉框的事件,是为了可以直接用文本的形式使用这个控件
	 */
	UI.document.on("click", ".select-core *", function() {
		
		UI.hidePopWin();
		
		var $select = $(this).parent().parent(),
			$options = $select.find("ul.select-options");
		
		var DP = $select.attr("data-param");
		
		if (!$options.size()) $options = $("<ul class='select-options'></ul>").appendTo($select);
		
		if (DP) {
			
			$options.html(_createOptions(common.getEnumArr(DP)));
			/*
			var paramArr = DP.split(",");
			
			$.ajax({
				url: "service?action=getParamValues&isconvert=true",
				type: "POST",
				dataType: "json",
				data: {
					code: paramArr[0]
				},
				success: function(data) {
					
					$options.html(_createOptions(data.beans));
					
				}
			});
			*/
			$select.removeAttr("data-param");

		}
		
		UI.showPopWin($options);
		
	});
	
	/*
	 * 下拉框选项点击
	 */
	UI.document.on("click", "ul.select-options li", function() {
		
		var $this = $(this),
			label = $this.html(),
			value = $this.attr("name");
		
		var $core = $this.parent().siblings("div.select-core"),
			$text = $core.find("div"),
			$input = $core.find("input");
		
		$text.html(label);
		
		$input.val(value);
		
		$this.addClass("active").siblings().removeClass("active");
		
	});
	
	/*
	 * 下拉框组件
	 */
	UI.Select = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			/*
			 * [{
			 *     label: "",
			 *     value: ""		//这一项可以没有, 如果没有,值就是label
			 * }]
			 */
			param: null,			//其实这算是一个定制需求啦
			options: null
		},
		
		/*
		 * 类名
		 */
		className: 'UI.Select',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-select {className}'>",
				"<div class='select-core'>",
					"<input name='{name}' type='hidden' />",
					"<div class='select-text'></div>",
					"<a class='select-btn'></a>",
				"</div>",
				"<ul class='select-options'></ul>",
			"</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf;
			
			this._input = this.dom.find("input");
			
			this._text = this.dom.find("div.select-text");
			
			this._options = this.dom.find("ul");
			
			/*
			 * 定制需求
			 */
			if (conf.param) {
				
				this._options.html(_createOptions(common.Arr(conf.param)));
				
			} else if (conf.options) {
				
				this.setOptions(conf.options);
				
			}
			
		},
		
		/*
		 * 构造选项
		 */
		setOptions: function(data) {
		
			this._options.html(_createOptions(data));
		
		},
		
		/*
		 * 添加单个选项
		 */
		addOption: function(obj) {
			
			this._options.append(optnTpl.format(obj));
			
		},
		
		/*
		 * 获取value
		 */
		val: function(v) {
			
			if (v || v == 0) {
				
				var $lis = this._options.find("li");
				
				var $li = $lis.filter("li[name='" + v + "']");
				
				if (!$li.size() && !isNaN(v) && v >= 0) $li = $lis.eq(Math.round(v));
				
				if ($li.size()) $li.trigger("click");
				
			} else {
				
				return this._input.val();
				
			}
			
		},
		
		/*
		 * 获取现在的文本
		 */
		getText: function() {
			
			return this._text.html();
			
		}
	
	});
	
});