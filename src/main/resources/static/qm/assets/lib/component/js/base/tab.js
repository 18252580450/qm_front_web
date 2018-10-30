/*
 * 页签切换
 * @date 2015-09-24
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 页签模板
	 */
	var liTpl = "<li name='{name}' title='{title}'>{label}</li>";
	
	/*
	 * 底部标签的模板
	 */
	var btnTpl = "<a class='ui-btn' name='{name}'>{label}</a>";
	
	/*
	 * tab,页签控件
	 * 这个页签和别的页签不是很一样.不是单纯的切换,实现了异步的加载
	 * 每一个页签对应的页面都通过一个方法返回一段字符串或者jquery对象
	 */
	UI.Tab = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			items: null,	//会以addItems(items, true)的方式渲染
			/*
			 * tab底部的按钮组
			 * 这个其实是个订制需求,但是什么需求又不是订制需求咧?
			 * item = {
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
		className: 'UI.Tab',
		
		/*
		 * 模板
		 */
		tpl: [
		    "<div id='{id}' class='ui-tab {className}'>",
		    	"<div class='tab-header'>",
		    		"<ul></ul>",
		    	"</div>",
		    	"<div class='tab-content'></div>",
		    "</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf,
				$dom = this.dom;
			
			this._header = $dom.find("div.tab-header ul");
			
			this._content = $dom.find("div.tab-content");
			
			this._P = {};			//page,子页面的集合
			
			this._CH = {};			//createHandler
			
			this._RH = {};			//refreshHandler
			
			this.initEvent();
			
			this.setBtns(conf.btns);
			
			conf.items && this.addItems(conf.items, true);
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var _this = this;
			
			/*
			 * 页签切换
			 */
			this._header.on("click", "li", function() {
				
				var $this = $(this),
					name = $this.attr("name");
				
				$this.addClass("active").siblings().removeClass("active");
				
				var $page = _this._P[name];
				
				if (!$page) {
					
					$page = _this._P[name] = $("<div class='tab-content-item'></div>").append(_this._CH[name]()).appendTo(_this._content);
					
				} else {
					
					_this._RH[name]();
					
				}
				
				$page.addClass("active").siblings().removeClass("active");
				
			});
			
		},
		
		/*
		 * 订制需求,添加底部按钮
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
			
				this._btns = $("<div class='tab-btns'>" + arr.join("") + "</div>").appendTo(this.dom);
				
			} else {
				
				this._btns && this._btns.empty().remove();
				
				this._btns = null;
				
				this._btnsFn = null;
				
			}
			
		},
		
		/*
		 * 添加页签
		 * data = [{
		 *     name: "",					//必须唯一
		 *     label: "",					//页签上面的名字
		 *     title: "",					//如果不设置的话,就直接用label
		 *     handler: {
		 *     	   create: function() {
		 *     
		 *     	       return "html dom" || $jquery	   
		 *     
		 *         },
		 *         refresh: function() {}
		 *     }
		 * }]
		 * flag								//是否清空原先的所有数据
		 */
		addItems: function(data, flag) {
			
			if (flag) {
				
				this._header.empty();
				
				this._content.empty();
				
			}
			
			var _this = this;
				arr = [],
				d = [].concat(data);		//如果只添加一个节点,可以只传一个对象
			
			var name, handler;
				
			d.each(function(i, item) {
				
				name = item.name;
				
				handler = item.handler;
				
				item.title = item.title || item.label;
				
				arr.push(liTpl.format(item));

				_this._CH[name] = handler.create || function() {return "";};

				_this._RH[name] = handler.refresh || function() {};
				
			});
			
			this._header.append(arr.join(""));
			
			this._header.find("li:" + (flag ? "first" : "last")).trigger("click");
			
		},
		
		/*
		 * 获取某个页签对应的tab-item对象
		 * 如果不存在name相对应的item自然就返回undefined
		 * 但是如果name相对应的item存在,且未被渲染,那么会强行渲染
		 */
		getItem: function(name) {
			
			var $item = this._P[name];
			
			if (!$item && this._CH[name]) {
				
				$item = this._P[name] = $("<div class='tab-content-item'></div>").append(this._CH[name]()).appendTo(this._content);
				
			}
			
			return $item;
			
		},
		
		/*
		 * 通过索引获取tab-item,特别说明,这个索引实际上是页签的索引
		 */
		getItemByIndex: function(index) {
			
			var name = this._header.find("li").eq(index).attr("name");
			
			return name ? this.getItem(name) : undefined;
			
		},
		
		/*
		 * 获取所有的item
		 */
		getAllItem: function() {
			
			var arr = [],
				$lis = this._header.find("li");
			
			
			for (var i = 0, l = $lis.size(); i < l; i++) {
				
				arr.push(this.getItem($lis.eq(i).attr("name")));
				
			}
			
			return arr;
			
		}
		
	});
	
	return UI.Tab;
	
});