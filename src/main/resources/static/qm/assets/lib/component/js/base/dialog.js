/*
 * 弹出窗
 * @date 2015-09-08
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	var btnTpl = "<a class='ui-btn-fill' name='{name}'>{label}</a>";
	
	/*
	 * 弹出窗组件
	 */
	UI.Dialog = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			width: 600,					//默认宽
			height: 400,				//默认高
			title: "",					//标题
			autoDestroy: true,			//是否在关闭的时候就销毁
			draggable: false,			//是否可以拖拽
			afterShow: function() {},	//弹出后执行的回调函数
			afterHide: function() {},	//关闭后执行的回调函数
			/*
			 * 弹窗底部的按钮组
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
		className: 'UI.Dialog',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-dialog {className}'>",
				"<div class='dialog-win'>",
					"<h1 class='dialog-header'>",
						"<p class='{titleCls}'><span>{title}</span></p>",
						"<a class='dialog-close'></a>",
					"</h1>",
					"<div class='dialog-core'>",
						"<div class='dialog-content'></div>",
					"</div>",
				"</div>",
				"<div class='dialog-mask'></div>",
			"</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf;
			
			var $win = this._win = this.dom.find("div.dialog-win"),
				$core = this._core = $win.find("div.dialog-core");
			
			this._header = $win.find("h1");
			
			this._content = $core.find("div");
			
			this._AD = conf.autoDestroy;
			
			this.draggable(conf.draggable);
			
			this.show(conf.afterShow);
			
			this.hide(conf.afterHide);
			
			this.setBtns(conf.btns);
			
			this.resize(conf.width, conf.height, true);
			
			this.initEvent();
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var _this = this,
				$win = this._win,
				$core = this._core;
			
			/*
			 * 关闭dialog
			 */
			this._header.on("click", "a", function() {
				
				_this.pop(0);
				
			});
			
			/*
			 * 按钮组事件
			 */
			$win.on("click", "div.dialog-btns a", function() {
				
				var fns = _this._btnsFn;
				
				if (fns) {
					
					var name = $(this).attr("name");
					
					fns[name] && fns[name].call(_this);
					
				}
				
			});
			
			/*
			 * 拖拽
			 */
			$win.on("mousedown", "h1.dialog-header", function(event) {
				
				/*
				 * 这里做一下双重验证,防止有人恶意篡改
				 */
				if ($(this).hasClass("draggable") && _this._DA) {
						
					var dx = event.pageX,
						dy = event.pageY,
						mt = parseInt($win.css("margin-top")),
						ml = parseInt($win.css("margin-left"));
					
					$core.hide();
					
					$win.css({opacity: .75});
					
					UI.document.on("mousemove.drag", function(event) {
						
						var mx = event.pageX,
							my = event.pageY;
						
						$win.css({margin: [my - dy + mt, "px", " 0 0 ", mx - dx + ml, "px"].join("")});
						
					});
					
					UI.document.on("mouseup.drag", function() {
						
						$core.show();
						
						$win.css({opacity: 1});
						
						UI.document.off(".drag");
						
					});
					
				}
				
			});
			
		},
		
		/*
		 * 弹出或隐藏
		 */
		pop: function(type) {
			
			var $dom = this.dom;
			
			if (!$dom) return;
			
			if (type) {
				
				$dom.parent().size() ? $dom.show() : $dom.appendTo(UI.body);
				
				this._afterShow.call(this);
				
			} else {
				
				this._AD ? this.destroy() : $dom.hide();
				
				this._afterHide.call(this);
				
			}
			
		},
		
		/*
		 * 重新设定窗口大小
		 * w: width,
		 * h: height,
		 * flag: 是否重新居中
		 * 前两个参数传入的如果为false,就取当前值
		 */
		resize: function(w, h, flag) {
			
			var $win = this._win;
			
			var style = {
				width: w || $win.width(),
				height: h || $win.height()
			};
			
			if (flag) style.margin = [-style.height / 2, "px", " 0 0 ", -style.width / 2, "px"].join("");
			
			$win.css(style);
			
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
			
				this._btns = $("<div class='dialog-btns'>" + arr.join("") + "</div>").appendTo(this._core);
				
				this._core.addClass("hasBtns");
				
			} else {
				
				this._btns && this._btns.empty().remove();
				
				this._btns = null;
				
				this._btnsFn = null;
				
				this._core.removeClass("hasBtns");
				
			}
			
		},
		
		/*
		 * 设置是否可以拖拽
		 */
		draggable: function(flag) {
			
			this._header[flag ? "addClass" : "removeClass"]("draggable");
			
			this._DA = flag;
			
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
			
			this._header.find("span").html(text);
			
			cls && this._header.find("p").attr({"class": cls});
			
		}
		
	});
	
	return UI.Dialog;
	
});