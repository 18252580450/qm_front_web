/*
 * tree
 * @date 2015-09-08
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 节点对象
	 */
	function Node(node, n) {
		
		this.id = node.id;
		
		this.pid = node.pid;
		
		this.label = node.label;
		
		this.icon = node.icon;
		
		this.n = n;
		
		this._p;
		
		this._c;
		
	}
	
	var TYPE = {
		"normal": "normal",
		"multi": "multi",
		"radio": "radio"
	};
	
	/*
	 * 树组件
	 */
	UI.Tree = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			type: "normal"				//["normal", "multi", "radio"]
		},
		
		/*
		 * 类名
		 */
		className: 'UI.Tree',
		
		/*
		 * 模板
		 */
		tpl: "<ul id='{id}' class='ui-tree {className}'></ul>",
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf;
			
			this._id = conf.id || $.UID();
			
			this._aNodes = [];					//保存该树的所有节点
			
			this._pNull = {};					//没找到父节点的节点,先放这里
			
			this._rootNode = new Node({id: "-1"});
			
			this.changeType(conf.type);
			
			this.initEvent();
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var $dom = this.dom;
			
			/*
			 * 展开收起
			 */
			$dom.on("click", "i.cross", function() {
				
				var $this = $(this),
					type = $this.toggleClass("active").hasClass("active") ? "slideDown" : "slideUp";
				
				$this.siblings("ul").stop()[type]("fast");
				
			});
			
			/*
			 * 多选
			 */
			$dom.on("click", "span.multi", function() {
				
				$(this).toggleClass("active");
				
			});
			
			/*
			 * 单选
			 */
			$dom.on("click", "span.radio", function() {
				
				$dom.find("span.active").removeClass("active");
				
				$(this).addClass("active");
				
			});
			
			/*
			 * 选中或取消
			 */
			$dom.on("click", "a", function() {
				
				var $li = $(this).parent();
				
				if (UI.Ctrl) {
					
					$li.toggleClass("active");
					
				} else {
					
					var ha = $li.hasClass("active"),
						$ls = $dom.find("li.active");
					
					$ls.removeClass("active");
					
					if (!ha || ($ls.size() > 1)) $li.addClass("active");
					
				}
				
			});
			
		},
		
		/*
		 * 切换状态
		 */
		changeType: function(type) {
			
			var t = this._type = TYPE[type] || "normal";
			
			var $spans = this.dom.find("span");
			
			$spans.attr({"class": t});
			
		},
		
		/*
		 * 添加节点
		 */
		addNodes: function(data) {
			
			 
		},
		
		/*
		 * 通过索引获取node
		 */
		getNodeByIndex: function(n) {
			
			return this._aNodes[n];
			
		},
		
		/*
		 * 获取通过点击a标签选中的节点
		 */
		getSelectedNodes: function() {
			
			var arr = [],
				aNodes = this._aNodes,
				$ls = this.dom.find("li.active");
				
			for (var i = 0, l = $ls.size(); i < l; i++) {
				
				arr.push(aNodes[$ls.eq(i).attr("data-n")]);
				
			}
			
			return arr;
			
		},
		
		/*
		 * 获取选中的节点,checkbox或radio
		 */
		getCheckedNodes: function() {
			
			var aNodes = this._aNodes;
			
			switch (this._type) {
				
				case "normal":
				
					return null;
					
				case "multi":
				
					var arr = [],
						$as = this.dom.find("span.active");
					
					for (var i = 0, l = $as.size(); i < l; i++) {
						
						arr.push(aNodes[$as.eq(i).parent().attr("data-n")]);
						
					}
				
					return arr;
					
				case "radio":
				
					return aNodes[this.dom.find("span.active").parent().attr("data-n")];
				
			}
			
		},
		
		/*
		 * 初始化数据
		 * flag: 初始化后渲染整个树
		 */
		initData: function(data, flag) {
			
			var aNodes = this._aNodes,
				pNull = this._pNull;
				
			var anl = aNodes.length;								//记录当前aNodes集合中节点的数量
			
			/*
			 * 现将data中的节点对象化,并推入aNodes集合中
			 */
			for (var i = 0, il = data.length; i < il; i++) {
				
				aNodes.push(new Node(data[i], aNodes.length));
				
			}
			
			var node, pNode, children;
			
			for (var n = anl, nl = aNodes.length; n < nl; n++) {	//这里相当于格式化节点,查找到该节点的父节点,子节点
				
				pNode = null;
				
				node = aNodes[n];
				
				children = pNull[node.id];							//查看该节点是否已经有子节点呗格式化过
				
				if (children) {										//若该节点的子节点先进行了格式化
					
					for (var i = 0, il = children.length; i < il; i++) {
						
						children[i]._p = node;
						
					}
					
					node._c = children;
					
					delete children;
					
				}
				
				/*
				 * 开始找父节点
				 */
				if (node.pid == this._rootNode.id) {				//找出父节点
					
					pNode = this._rootNode;
				
				} else {
					
					for (var m = n; m--;) {							//从当前位置往前找
						
						if (aNodes[m].id == node.pid) {
							
							pNode = aNodes[m];
							
							break;
						
						} else if (aNodes[m].pid == node.pid) {
							
							pNode = aNodes[m]._p;
							
							break;
							
						}
					}
					
					if (!pNode) {									//往后找
						
						for (var k = n + 1; k < nl; k++) {
							
							if (aNodes[k].id == node.pid) {
								
								pNode = aNodes[k];
								
								break;
							}
						}
					}
					
				}
				
				/*
				 * 如果找到了父节点
				 */
				if (pNode) {
					
					node._p = pNode;
					
					pNode._c ? pNode._c.push(node): (pNode._c = [node]);
					
				} else {
					
					if (pNull[node.pid]) {
						
						pNull[node.pid].push(node);
						
					} else {
						
						pNull[node.pid] = [node];
						
					}
					
				}
				
			}
			
			if (flag) {
				
				this.dom.html(this._createDom(this._rootNode));
				
			}
			
		},
		
		/*
		 * 构造文档流
		 * node: 构造该节点下包含的所有子孙节点
		 */
		_createDom: function(node) {
			
			var c = node._c;							//获取node的子节点集合
			
			if (!c) return "";							//如果没有子节点,直接返回空字符 
			
			var arr = [],
				t = this._type,
				cNode,
				cc;
			
			for (var i = 0, cl = c.length; i < cl; i++) {
				
				cNode = c[i];							//子节点
				
				cc = cNode._c;							//子节点的子节点集合
				
				arr.push([								//构造节点文档
					"<li class='tree-node", ((i == cl - 1) ? " last-child" : "") , "' data-id='", cNode.id, "' data-pid='", cNode.pid, "' data-n='", cNode.n, "'>",
						"<i class='", (cc ? "cross" : "line"), "'></i>",
						"<span class='", t, "'></span>",
						"<i class='", (cNode.icon || (cc ? "folder" : "file")), "'></i>",
						"<a>", cNode.label, "</a>",
						(cc ? "<ul>" + this._createDom(cNode) + "</ul>" : ""),
					"</li>"
				].join(""));
				
			}
			
			return arr.join("");
			
		}
		
	});
	
	return UI.Tree;
	
});
