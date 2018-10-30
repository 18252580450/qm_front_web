/*
 * magictree 
 * @date 2015-09-17
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 根节点模板
	 */
	var rootTpl = [
	    "<div class='magicTree-root'>",
	    	"<h1 name='{name}'>",
	    		"<b>{label}</b>",
	    		"<div class='magicTree-adds'>",
	    			"<p>",
    					"<a class='magicTree-add' name='role'>添加角色</a>",
    					"<a class='magicTree-add' name='prospe'>添加产品规格</a>",
	    			"</p>",
	    		"</div>",
	    	"</h1>",
	    "</div>"
    ].join("");
	
	/*
	 * 角色模板
	 */
	var roleTpl = [
   	    "<div class='magicTree-role'>",
	    	"<h1 name='{name}'>",
	    		"<b>{label}</b>",
	    		"<a class='magicTree-del'></a>",
	    		"<a class='magicTree-add' name='role'></a>",
	    	"</h1>",
	    "</div>"
    ].join("");

	/*
	 * 产品规格模板
	 */
	var proSpeTpl = [
	    "<li name='{name}'>",
	    	"<span>{label}</span>",
	    	"<a class='magicTree-del'></a>",
	    "</li>"
	].join("");
	
	/*
	 * 咋说呢...这名字忒特么中二了...
	 */
	UI.MagicTree = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			handler: {
				role: function() {},
				prospe: function() {}
			}
		},
		
		/*
		 * 类名
		 */
		className: 'UI.MagicTree',
		
		/*
		 * 模板
		 */
		tpl: "<div id='{id}' class='ui-magicTree {className}'></div>",
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf;
			
			this._root = undefined;
			
			this._float = $("<div class='magicTree-float'></div>").appendTo(this.dom);
			
			conf.handler && this.setHandler(conf.handler);
			
			this.initEvent();
			
		},
		
		/*
		 * 初始化事件
		 */
		initEvent: function() {
			
			var _this = this,
				$dom = this.dom,
				$float = this._float;
			
			/*
			 * 展开收起
			 */
			$dom.on("click", "i", function() {
				
				$(this).parent().toggleClass("magicTree-folded");
				
			});
			
			/*
			 * 删除事件
			 */
			$dom.on("click", "a.magicTree-del", function() {
				
				var $this = $(this),
					$parent = $this.parent();
				
				if ($parent.is("li")) {					//删除产品规格
					
					if ($parent.siblings().size()) {
						
						$parent.empty().remove();
						
					} else {							//如果只剩一个产品规格了,就直接删掉这个产品规格列表
						
						$parent.parent().siblings("h1").find("a.magicTree-del").trigger("click");
						
					}
					
				} else {								//删除产品规格列表或者删除角色
					
					var $div = $parent.parent(),
						flag = $div.parent().hasClass("magicTree-groups");
					
					$div.empty().remove();
					
					flag && _this._resize();			//删除角色下的产品规格列表不需要调用_resize方法
					
				}
				
			});
			
			/*
			 * 拖拽事件...嘴贱啊,不应该主动提这样的需求的
			 */
			$dom.on("mousedown", "span", function(event) {
				
				var $parent = $(this).parent();
				
				var offset = _this.dom.offset();
				
				var dx = event.pageX,
					dy = event.pageY,
					ox = offset.left,
					oy = offset.top;
				
				var shadowDom;
				
				if ($parent.is("li")) {
					
					shadowDom = "<li>" + $parent.html() + "</li>";
					
				} else {
					
					shadowDom = $parent.siblings("ul").html();
					
				}
				
				UI.selectstart(true);
				
				var sto = setTimeout(function() {
					
					_this.dom.addClass("dragged");
					
					$float.html(shadowDom).css({left: dx - ox, top: dy - oy}).show();
					
					UI.document.on("mousemove.dragged", function(event) {
						
						var mx = event.pageX,
							my = event.pageY;
						
						$float.css({left: mx - ox + 5, top: my - oy + 5});
						
					});
					
					$dom.on("mouseover.dragged", ".magicTree-groups>div", function() {
						
						$(this).addClass("hover");
						
					});
					
					$dom.on("mouseleave.dragged", ".magicTree-groups>div", function() {
						
						$(this).removeClass("hover");
						
					});
					
					$dom.on("mouseup.dragged", ".magicTree-groups>div", function() {
						
						var $this = $(this);
						
						$this.removeClass("hover");
						
						if ($this.find($parent).size()) return;
						
						var $ul = $this.find("ul");
						
						if (!$ul.size()) {
							
							$ul = $([
							    "<div class='magicTree-prospe'>",
									"<i></i>",
									"<h1>",
										"<span>产品规格列表</span>",
							    		"<a class='magicTree-del'></a>",
							    		"<a class='magicTree-add'></a>",
									"</h1>",
									"<ul></ul>",
								"</div>"
							].join(""))
							  .appendTo($this)
							  .find("ul");
							
						}
						
						$ul.append($float.html());
						
						$parent.find("a.magicTree-del").trigger("click");
						
					});
					
				}, 250);
				
				UI.document.on("mouseup.dragged mouseleave.dragged", function() {
					
					_this.dom.removeClass("dragged");
					
					if ($float.is(":hidden")) {
						
						clearTimeout(sto);
						
					} else {

						$float.empty().hide();
						
					}
					
					UI.selectstart(false);
					
					UI.document.off(".dragged");
					
					$dom.off(".dragged");
					
				});
				
			});
			
			/*
			 * 添加角色或者产品规格
			 */
			$dom.on("click", "a.magicTree-add, a.magicTree-set", function() {
				
				var $this = $(this);
					
				_this._handler[$this.attr("name")]($this);
				
			});
			
		},
		
		/*
		 * 创建根节点
		 */
		createRoot: function(obj) {
			
			if (this._root) return;
			
			this._root = $(rootTpl.format(obj)).appendTo(this.dom);
			
		},
		
		/*
		 * 添加角色
		 */
		addRole: function(obj) {
			
			var $div = this._root.find("div.magicTree-core");
			
			if (!$div.size()) {
				
				$div = $([
				    "<div class='magicTree-core'>",
				    	"<i></i>",
				    	"<div class='magicTree-groups'></div>",
				    "</div>"
				].join("")).appendTo(this._root);
				
			}
			
			var $groups = $div.find("div.magicTree-groups"),
				$proSpe = $groups.find(">div.magicTree-prospe");
			
			if ($proSpe.size()) {
				
				$proSpe.before(roleTpl.format(obj));
				
			} else {
			
				$groups.append(roleTpl.format(obj));
				
			}
			
			this._resize();
			
		},
		
		/*
		 * 设置事件
		 */
		setHandler: function(obj) {
			
			this._handler = obj;
			
		},
		
		/*
		 * 配置角色
		 * 只有未配置角色的产品规格列表可以配置角色,所以使用索引作为标记
		 */
		setRole: function(index, role) {
			
			var $prospe = this.dom.find("div.magicTree-groups>div.magicTree-prospe"),
				$target = $prospe.eq(index);
			
			if ($target.size()) {
				
				$target.html([
				    [
				        "<h1 name='{name}'>",
				        	"<b>{label}</b>",
				    		"<a class='magicTree-del'></a>",
				    		"<a class='magicTree-add'></a>",
				        "</h1>"
				    ].join("").format(role),
					"<div class='magicTree-prospe'>",
						"<i></i>",
						$target.find("h1>a:not(:first)").remove().end().html(),
					"</div>"
				].join(""))
				  .removeClass("magicTree-prospe")
				  .addClass("magicTree-role");
				
				if (index) {
					
					$prospe.eq(0).before($target);
					
					this._resize();
					
				}
				
			}
			
		},
		
		/*
		 * 添加产品规格
		 * target是p标签上的name值
		 */
		addProSpe: function(target, data) {
			
			var $p = this.dom.find("h1[name='" + target + "']");
			
			if (!$p.size() || !data.length) return;
			
			var $parent = $p.parent();
			
			/*
			 * 向根节点下添加产品 
			 */
			if ($parent.hasClass("magicTree-root")) {
				
				var $div = this._root.find("div.magicTree-core");
				
				if (!$div.size()) {						//组件还毛都没有的情况
					
					$div = $([
					    "<div class='magicTree-core'>",
					    	"<i></i>",
					    	"<div class='magicTree-groups'></div>",
					    "</div>"
					].join("")).appendTo(this._root);
					
				}
				
				var $groups = $div.find(">div.magicTree-groups");
				
				var $proSpe = $([						//先添加这个组
				    "<div class='magicTree-prospe'>",
				    	"<h1>",
							"<span>产品规格列表</span>",
				    		"<a class='magicTree-del'></a>",
				    		"<a class='magicTree-add' name='prospe'></a>",
				    		"<a class='magicTree-set' name='role'></a>",
						"</h1>",
						"<ul></ul>",
				    "</div>"
				].join("")).appendTo($groups);
				  
				this._resize();
					
			} else {									//向角色下添加产品规格
				
				var $proSpe = $parent.find("div.magicTree-prospe");
				
				if (!$proSpe.size()) {					//如果还没有规格列表
					
					$proSpe = $([
						"<div class='magicTree-prospe'>",
							"<i></i>",
							"<h1>",
								"<span>产品规格列表</span>",
					    		"<a class='magicTree-del'></a>",
							"</h1>",
							"<ul></ul>",
						"</div>"
					].join("")).appendTo($parent);
					
				}
				
			}
			
			$proSpe.find("ul").append(data.format(proSpeTpl));
			
		},
		
		/*
		 * 回显
		 */
		reShow: function() {
			
			
			
		},
		
		/*
		 * 随着产品的删除与添加,宽度会变化,过该函数控制
		 */
		_resize: function() {
			
			var $groups = this.dom.find("div.magicTree-groups"),
				$div = $groups.find(">div");
			
			var width = $div.size() * 220;
			
			if (width) {
				
				$groups.css({width: width, marginLeft: -width / 2});
				
				$div.removeClass("last-child").last().addClass("last-child");
				
			} else {
				
				$groups.parent().empty().remove();
				
			}
			
		}
		
	});
	
	return UI.MagicTree;
	
});
