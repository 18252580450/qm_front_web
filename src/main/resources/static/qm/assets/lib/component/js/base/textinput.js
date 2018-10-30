/*
 * 输入框
 * @date 2015-09-14
 * @auth AnNing
 * @desc 建议直接放到dom里使用,这里主要绑定一些事件,做做校验啊什么的
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 这个属性相当于进行校验的类
	 */
	var FnMap = {
		notNull: function(val) {
			
			return val.length ? false : "该值不能为空";
			
		},
		isNum: function(val) {
			
			return isNaN(val) ? "该值必须是数字" : false;
			
		},
		notSep: function(val) {
			
		}
	};
	
	/*
	 * 验证
	 */
	function validate(val, optn) {
		
		var options = optn.split(",");
		
		for (var i = 0, l = options.length; i < l; i++) {
			
			var fn = FnMap[options[i]];
			
			if (fn) {
				
				var result = fn(val);
				
				if (result) return result;
				
			} 
			
		}
		
	}

	/*
	 * 输入框失焦时验证
	 */
	UI.document.on("focus", ".ui-textinput input", function() {
		
		var $parent = $(this).parent();

		$parent.removeClass("error");
		
		$parent.find("span.textinput-tip").remove();
		
	});
	
	/*
	 * 输入框失焦时验证
	 */
	UI.document.on("blur", ".ui-textinput input", function() {
		
		var $this = $(this),
			$parent = $this.parent();
		
		var optn = $this.attr("data-validate");
		
		if (!optn) return;
		
		var result = validate($this.val(), optn);
		
		if (result) {
			
			$parent.addClass("error");
			
			$parent.append("<span class='textinput-tip'>" + result + "</span>");
			
		}
		
	});
	
	/*
	 * 输入框组件
	 */
	UI.TextInput = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			validate: ""		//验证"isNum, notNull, notSep"//必须是数字, 非空, 非特殊字符
		},
		
		/*
		 * 类名
		 */
		className: 'UI.TextInput',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-textinput {className}'>",
				"<input data-validate='{validate}' />",
			"</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			this._input = this.dom.find("input");
			
		},
		
		/*
		 * 取值设值
		 */
		val: function(v) {
			
			if (v) {
				
				this._input.val(v);
				
			} else {
				
				return this._input.val();
				
			}
			
		}
		
	});
	
	return UI.TextInput;
	
});