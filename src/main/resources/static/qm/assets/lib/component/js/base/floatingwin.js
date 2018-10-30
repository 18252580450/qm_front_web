/*
 * 浮窗
 * $auth AnNing
 * $date 2016-01-07
 */
define(["cmp"], function() {
	
	/*
	 * 浮窗,从页面右侧弹出
	 */
	UI.FloatingWin = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			title: "",
			width: 63,
			autoDestroy: true,
			afterShow: function() {},	//弹出后执行的回调函数
			afterHide: function() {},	//关闭后执行的回调函数
			/*
			 * 浮窗底部的按钮组,和弹窗是一样样的
			 * {
			 *     label: 按钮上的文字,
			 *     name: 随便个什么都行,但是唯一,
			 *     handler: 回调函数,这里特别要说明的是,函数中的this对象指向实例本身
			 * }
			 */
			btns: []
		},
		
		/*
		 * 类名
		 */
		className: 'UI.FloatingWin',
		
		/*
		 * 模板
		 */
		tpl: [
		    "<div class='ui-floatingWin'>",
		    	"<div class='floatingWin-core'>",
		    		"<h1 class='floatingWin-header'>{title}</h1>",
		    		"<div class='ui-scroll'>",
		    			"<div class='floatingWin-win scroll-core'></div>",
		    			"<s class='scroll-bar'></s>",
		    		"</div>",
		    	"</div>",
		    "</div>"
		].join(""),
		
		/*
		 * 初始化方法
		 */
		init: function() {
			
			var conf = this.conf,
				dom = this.dom;
			
			this._AD = conf.autoDestroy;
			
			this._header = dom.find("h1");
			
			this._core = dom.find("div.floatingWin-core");
			
			this._content = dom.find("div.floatingWin-win");
			
			this._btns = dom.find("div.floatingWin-btns");
			
			this.show(conf.afterShow);
			
			this.hide(conf.afterHide);
			
			this.setBtns(conf.btns);
			
			this.width(conf.width);
			
			this.initEvent();
			
		},
		
		/*
		 * 初始化事件
		 */
		initEvent: function() {
			
			
			
		},
		
		/*
		 * 弹出或隐藏
		 */
		pop: function(type) {
			
			var _this = this,
				$dom = this.dom;
			
			if (!$dom) return;
			
			if (type) {
				
				if (!$dom.parent().size()) $dom.appendTo(UI.body);
				
				UI._FW_ = this;
				
				$dom.css({right: -this.dom.width(), opacity: 1});
				
				$dom.stop().animate({right: 0, opacity: 1}, "fast", function() {
					
					_this._afterShow.call(_this);
					
				});
				
			} else {
				
				$dom.stop().fadeOut("fast", function() {
					
					if (_this._AD) _this.destroy();
					
					_this._afterHide.call(_this);
					
				});
				
			}
			
			return this;
			
		},
		
		/*
		 * 重设afterShow回调函数
		 * 注意,这里的show方法是故意这么做的,专门重写基类的show方法
		 */
		show: function(fn) {
			
			this._afterShow = fn;
			
		},
		
		/*
		 * 重设afterHide回调函数
		 * 注意,这里的hide方法是故意这么做的,专门重写基类的hide方法
		 */
		hide: function(fn) {
			
			this._afterHide = fn;
			
		},
		
		/*
		 * 重设浮窗的宽度
		 */
		width: function(w) {
			
			var width = (isNaN(w) || w < 50) ? 63 : w;
			
			//this._core.width(w + "%");
			
			this.dom.width(w + "%");
			
		},
		
		/*
		 * 重设底部按钮组
		 */
		setBtns: function(btns) {
			
			var num = btns ? btns.length : 0;
			
			if (num) {
				
				var bfn = this._btnsFn = {};
				
				var arr = [],
					item;
				
				for (var i = 0; i < num; i++) {
					
					item = btns[i];
					
					arr.push(btnTpl.format(item));
					
					bfn[item.name] = item.handler;
					
				}
			
				this._btns = $("<div class='floatingWin-btns'>" + arr.join("") + "</div>").appendTo(this._core);
				
				this._core.addClass("hasBtns");
				
			} else {
				
				this._btns && this._btns.empty().remove();
				
				this._btns = null;
				
				this._btnsFn = null;
				
				this._core.removeClass("hasBtns");
				
			}
			
		},
		
		/*
		 * 模仿$.fn.append
		 */
		append: function(param) {
			
			this._content.append(param);
			
			return this;
			
		},
		
		/*
		 * 模仿$.fn.prepend
		 */
		prepend: function(param) {
			
			this._content.prepend(param);
			
			return this;
			
		},
		
		/*
		 * 模仿$.fn.html
		 */
		html: function(text) {
			
			this._content.html(text);
			
			return this;
			
		},
		
		/*
		 * 设置标题
		 */
		setTitle: function(text, cls) {
			
			this._header.html(text);
			
			cls && this._header.attr({"class": cls});
			
		}
		
	});
	
	return UI.FloatingWin;
	
});
