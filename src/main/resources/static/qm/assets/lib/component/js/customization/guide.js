/*
 * Guide
 * @date 2015-10-17
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	var tpl = [
	    "<div class='guide-item'>",
	    	"<h1>",
	    		"<b>{n}</b>",
	    		"<span>/{len}</span>",
	    	"</h1>",
	    	"<p>{text}</p>",
	    	"<div><img src='{src}' /></div>",
	    "</div>"
	].join("");
	
	/*
	 * 类似百度经验
	 */
	UI.Guide = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			data: []
		},
		
		/*
		 * 类名
		 */
		className: 'UI.Guide',
		
		/*
		 * 模板
		 */
		tpl: [
		    "<div id='{id}' class='ui-guide {className}'>",
		    	"<div class='guide-container'></div>",
		    	"<ul class='guide-pagination'></ul>",
		    	"<div class='guide-btns'>",
		    		"<a name='prev'></a>",
		    		"<a name='next'></a>",
		    	"</div>",
		    "</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			this._container = this.dom.find("div.guide-container");

			this._pagination = this.dom.find("ul");
			
			this._btns = this.dom.find("div.guide-btns");
			
			this.setData(this.conf.data);
			
			this.initEvent();
			
		},
		
		/*
		 * 初始化事件
		 */
		initEvent: function() {
			
			var _this = this;
			
			this._btns.on("click", "a", function() {
				
				var $this = $(this);
				
				if ($this.hasClass("disabled")) return;
				
				var index = _this._pagination.find("li.active").index();
				
				($this.attr("name") == "prev") ? index-- : index++;
				
				_this.jumpTo(index);
				
			});
			
			this._pagination.on("click", "li", function() {
				
				_this.jumpTo($(this).index());
				
			});
			
		},
		
		/*
		 * 塞入数据,会清空原有的所有数据
		 */
		setData: function(data) {
			
			var d = this._D = data,
				len = d.length;
			
			if (!len) return;
			
			var pArr = [],
				cArr = [];
			
			d.each(function(i, item) {
				
				item.n = ++i;
				
				item.len = len;
				
				pArr.push("<li>" + i + "</li>");
				
				cArr.push(tpl.format(item));
				
			});
			
			this._container.html(cArr.join(""));

			this._pagination.html(pArr.join(""));
			
			this.jumpTo(0);
			
		},
		
		/*
		 * 插入一条数据
		 * 如果传入索引,向目标位置插入该数据
		 */
		addData: function(data, index) {
			
			if (isNaN(index) || index < 0) {
				
				this._D.push(data);
				
			} else {
				
				this._D.splice(Math.round(index), 0, data);
				
			}
			
			this.setData(this._D);
			
		},
		
		/*
		 * 跳转
		 */
		jumpTo: function(index) {
			
			var $items = this._container.find(".guide-item"),
				len = $items.size();
			
			$items.eq(index).show().siblings().hide();
			
			this._pagination.find("li").eq(index).addClass("active").siblings().removeClass("active");
			
			this._btns.find("a").removeClass("disabled");
			
			if (index == 0) this._btns.find("a:first").addClass("disabled");
			
			if (index == len - 1) this._btns.find("a:last").addClass("disabled");
			
		}
		
	});
	
	return UI.Guide;
	
});