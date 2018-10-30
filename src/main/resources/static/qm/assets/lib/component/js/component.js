/*
 * 组件基类
 * @date 2015-09-08
 * @auth AnNing
 */
define(["prototype"], function() {
	
	var UI = window.UI = {},
		$document = UI.document = $(document),
		$body = UI.body = $("body"),
		$desk = $body.find(">div.desk");
	
	UI._FW_ = null;
	
	/*
	 * 关闭浮窗
	 */
	$desk.on("click", function() {
		
		if (UI._FW_) UI._FW_.pop(0);
			
	});
	
	/*
	 * 页面是否可以托选
	
	UI.selectstart = function(flag) {
		
		flag ? 
		  $body.attr({"onselectstart": "return false"}).addClass("body-dragged")
		    : $body.removeAttr("onselectstart").removeClass("body-dragged");
		
	}; */
	
	/*
	 * ctrl键是否被按下
	
	UI.Ctrl = false;
	
	$document.on("keydown", function(event) {
		
		switch (event.keyCode) {
		
			case 17:
				
				UI.Ctrl = true;
				
				return;
				
			case 9:
				
				if ($body.find(">div.ui-dialog:visible").size())
					return false;
		
		}
		
	});
	
	$document.on("keyup", function(event) {
		
		if (event.keyCode == 17) UI.Ctrl = false;
		
	}); */
	
	/*
	 * 一个点击页面任何地方它都会隐藏的对象
	
	UI.popWin = undefined; */
	
	/*
	 * 隐藏popWin对象
	
	UI.hidePopWin = function() {
		
		var $pw = UI.popWin;
		
		if ($pw) {
			
			$pw.parents().removeClass("topSide");
			
			$pw.hide();
		
			$pw = null;
			
		};
		
	}; */
	
	/*
	 * 展示popWin对象,当然也可以手动写
	
	UI.showPopWin = function($obj) {
		
		UI.popWin = $obj.show();
		
		$obj.parents().addClass("topSide");
		
	}; */
		
	/*
	 * 全局的点击事件,这个很重要,是针对于popWin的隐藏
	 * 被标记_ng_这个类名的元素,不会触发UI.hidePopWin事件
	
	$document.on("click", "*", function(event) {
	
		event.stopPropagation(); 											//禁止事件冒泡
	
		var $this = $(this); 												//保存$(this)对象
	
		if ($this.hasClass("_ng_") || $this.parents("._ng_").size()) return;//非全局节点,或被非全局节点包含 ng 为 not-global
	
		UI.hidePopWin();
	
	}); */
	
	/*
	 * 滚珠
	 * 2015-09-09 需要进一步优化
	 * 这段代码千万别有问题,如果有的话...我是不愿意再看了
	 */
	$document[0].onmousewheel = function(event) {
	
		var e = event || window.event || window.top.event;
		
		var $scroll = $(e.srcElement).parents(".ui-scroll").eq(0);
		
		if (!$scroll.size()) return;
		
		var $core = $scroll.find("div.scroll-core"),
			$bar = $scroll.find("s.scroll-bar");
		
		var h = $core.height(),
			sh = $core[0].scrollHeight,
			s = sh - h,
			sz = h - 50;
		
		if (s <= 0) return;
		
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		
		var st = (-e.wheelDelta / 120 || e.detail / 3) * 100 + $core.scrollTop(),
			bt = (st > s ? sz : sz * (st / s));
		
		if (bt < 0) bt = 0;
		
		$core.scrollTop(st);
		
		$bar.css({top: bt});
		//$core.animate({scrollTop: st}, "fast");
	
	};
	
	$document.on("mouseenter", ".ui-scroll", function() {
		
		var $this = $(this),
			$core = $this.find("div.scroll-core"),
			$bar = $this.find("s.scroll-bar");
			
		var h = $core.height(),
			sh = $core[0].scrollHeight;

		if (sh - h > 0) $bar.show();
		
	});
	
	$document.on("mouseleave", ".ui-scroll", function() {

		$(this).find("s.scroll-bar").hide();
		
	});
	
	/*
	 * 通过组件的style方法可调整的属性
	 */
	var styleObj = {
		'position': 1,
		'float': 1,
		'width': 1,
		'height': 1,
		'top': 1,
		'right': 1,
		'bottom': 1,
		'left': 1,
		'display': 1,
		'z-index': 1
	};
	
	/*
	 * 根据ClassName获取类
	 * @className 类名
	 */
	$.getDefinitionByName = function(className) {
	
		var ps = className.split('.');
	
		var i = 0;
	
		var obj = window[ps[i]];
	
		while (i != ps.length - 1) {
	
			obj = obj[ps[++i]];
	
		};
	
		return obj;
	
	};
	
	/*
	 * 扩展jquery的继承
	 * @param sub 子类
	 * @param sup 父类
	 * @overrides 扩展的方法
	 * @使用方法
	 * UI.xx = $.inherit(UI.Component, {});
	 */
	$.inherit = function(sup, overrides) {
	
		var sub = function() {
	
			sup.apply(this, arguments);
	
		};
	
		var F = function() {};
	
		F.prototype = sup.prototype;
	
		sub.prototype = new F();
	
		sub.sup = new sup();
	
		sub.prototype.constructor = sub;
	
		if (overrides) {
	
			for (var m in overrides) {
	
				sub.prototype[m] = overrides[m];
	
			};
	
		};
	
		return sub;
	
	};
	
	/*
	 * 重写$.fn[append, prepend, after, before]方法
	 */
	$.each(["append", "prepend", "after", "before"], function(i, fn) {
		
		var oldFn = $.fn["old" + fn] = $.fn[fn];
		
		$.fn[fn] = function(elem) {
			
			if (elem instanceof UI.Component) {
	
				oldFn.call(this, elem.create(this));
		
				elem.afterRender();
		
			} else {
		
				oldFn.apply(this, arguments);
		
			}
			
			return this;
			
		};
		
	});
	
	/*
	 * renderTo: $(parent)
	 */
	UI.Component = function(conf) {
		
		this.initConf(conf); 											//配置项处理
		
		if (this.tpl) {
			
			this.dom = this.tpl.format2Object(this.conf); 				//生成dom
			
			this.disabled(this.conf.disabled);							//设置组件是否可用
			
			this.style(this.conf.style);								//设置组件的物理样式
			
		} 
		
		this.init();
		
		var parent = this.conf.renderTo;
		
		parent && $(parent).append(this);
	
	};
	
	UI.Component.prototype = {
		
		/*
		 * 默认配置项
		 */
		defConf: {},
		
		/*
		 * 子类必须重设此项
		 */
		className: 'UI.Component',
		
		/*
		 * 初始化方法
		 */
		init: function(){
		
			this.initEvent();
		
		},
		
		/*
		 * 返回dom,$.fn.append,$.fn.prepend,$.fn.before,$.fn.after使用
		 */
		create: function() {
		
			return this.dom;
		
		},
		
		/*
		 * 注册事件,此方法由子类重写
		 */
		initEvent: function() {},
		
		/*
		 * init conf
		 */
		initConf: function(conf) {
		
			this.conf = conf || {};
		
			var supO = $.getDefinitionByName(this.className) && $.getDefinitionByName(this.className).sup;
		
			while (supO) {
		
				this.conf = $.extend(true, {}, supO.defConf, this.defConf, this.conf);
		
				supO = supO.className? $.getDefinitionByName(supO.className) : undefined;
		
			}
		
		},
		
		/*
		 * 组件被添加到dom树后的回调
		 */
		afterRender: function() {},
		
		/*
		 * 是否禁用
		 */
		disabled: function(b) {
		
			b ? this.dom.addClass("disabled") : this.dom.removeClass("disabled");
			
			return this;
		
		},
		
		/*
		 * 获取组件id
		 */
		getId: function() {
		
			return this.dom[0].id;
		
		},
		
		/*
		 * 销毁
		 */
		destroy: function() {
		
			if (this.dom) {
				
				this.dom.empty().remove();
				
				this.dom = null;
				
			};
			
			return this;
		
		},
		
		/*
		 * 物理属性
		 * width, height, top, right, bottom, left
		 */
		style: function(config) {
			
			var obj = {};
			
			for (var key in config) {
				
				if (styleObj[key]) obj[key] = config[key]; 
				
			};
			
			this.dom.css(obj);
			
			return this;
			
		},
		
		/*
		 * 显示
		 */
		show: function() {
	
			this.dom && this.dom.show();
			
			return this;
	
		},
		
		/*
		 * 隐藏
		 */
		hide: function() {
	
			this.dom && this.dom.hide();
			
			return this;
	
		},
		
		/*
		 * 查找组件内元素
		 */
		find: function(selector) {
			
			return this.dom.find(selector);
			
		},
		
		/*
		 * 绑定事件
		 */
		on: function() {
			
			$.fn.on.apply(this.dom, arguments);
			
			return this;
			
		},
		
		/*
		 * 模拟$.fn.appendTo
		 */
		appendTo: function($jDom) {
			
			$jDom.append(this);
			
			return this;
			
		},
		
		/*
		 * 模拟$.fn.prependTo
		 */
		prependTo: function($jDom) {
			
			$jDom.prepend(this);
			
			return this;
			
		},
		
		/*
		 * 模拟$.fn.after
		 */
		afterTo: function($jDom) {
			
			$jDom.after(this);
			
			return this;
			
		},
		
		/*
		 * 模拟$.fn.before
		 */
		beforeTo: function($jDom) {
			
			$jDom.before(this);
			
			return this;
			
		}
	
	};
	
	return UI.Component;
	
});