/*
 * grid
 * @date 2015-09-09
 * @auth AnNing
 */
define(["cmp", "pagination"], function(cmp, pagination) {

	/*
	 * 表格组件
	 */
	UI.Grid = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			/*
			 * 元数据中每一项都可以设置width,但是因为table为100%填充所以width不一定会完全正确
			 * 当flex设为false时,width会正确显示,如果width不设置,默认为100px
			 */
			flex: true,
			/*
			 * 是否有分页,如果有,请传入一个pagination的config
			 * 在grid控件中,就不向外暴露操作pagination的方法了,而是直接将pagination暴露出去,可以通过grid.pagination获取到
			 */
			paged: false,			
			height: 210,				//默认高度210?以后可以再调
			ordinal: false,				//是否有序号
			assist: null,				//[null, "multi"]
			dataSource: null,			//元数据
			data: null,					//数据
			/*
			 * 枚举值
			 * item = {
			 * 	   key: "str",			//描述需要做枚举值的项
			 * 	   map: {
			 * 	       "key": "value"	//转换的map对象
			 * 	   }
			 * }
			 */
			enumerations: []
		},
		
		/*
		 * 类名
		 */
		className: 'UI.Grid',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-grid {className}'>",
				"<div class='grid-core'>",
					"<div class='grid-header'>",
						"<table cellpadding='0' cellspacing='0'>",
							"<thead></thead>",
						"</table>",
					"</div>",
					"<div class='grid-body'>",
						"<div>",
							"<table cellpadding='0' cellspacing='0'>",
								"<colgroup></colgroup>",
								"<tbody></tbody>",
							"</table>",
						"</div>",
					"</div>",
				"</div>",
			"</div>",
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf,
				$dom = this.dom;
			
			this._body = $dom.find(".grid-body");
			
			this._table = $dom.find("table");
			
			this._thead = $dom.find("thead");
			
			this._tbody = $dom.find("tbody");
			
			this._colGroup = $dom.find("colgroup");
			
			this._DS = [];				//元数据池
			
			this._D = [];				//数据池
			
			this._ES = [];				//枚举
			
			this._E = {};				//枚举池
			
			this._FLEX = conf.flex;
			
			!this._FLEX && this.dom.addClass("fixed");
			
			this.setHeight(conf.height);
			
			this.setOrdinal(conf.ordinal);
			
			this.setAssist(conf.assist);
			
			this.setPagination(conf.paged);
			
			conf.enumerations && this.setEnumerations(conf.enumerations);
			
			conf.dataSource && this.setDataSource(conf.dataSource);
			
			conf.data && this.setData(conf.data);
			
			this.initEvent();
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var _this = this,
				$dom = this.dom;
			
			/*
			 * 多选
			 */
			$dom.on("click", "i.checkbox", function(event) {
				
				event.stopPropagation();
				
				var $this = $(this);
				
				var type = $this.toggleClass("active").hasClass("active") ? "addClass" : "removeClass";
				
				if (_this._thead.find($this).size()) {
					
					_this._tbody.find("i.checkbox")[type]("active");
					
				} else {
					
					var $ti = _this._thead.find("i.checkbox");
					
					if (type == "removeClass") {
							
						$ti.removeClass("active");
						 
					} else if (!_this._tbody.find("i.checkbox").not(".active").size()) {
						 
						$ti.addClass("active");
						 
					}
					
				}
				
			});
			
			/*
			 * 点击行,选中多选按钮
			 */
			$dom.on("click", "tr", function() {
				
				var $c = $(this).find("i.checkbox");
				
				$c.size() && $c.trigger("click");
				
			});
			
		},
		
		/*
		 * 编辑
		 * index为被编辑行的索引
		
		edit: function(index, p1, p2) {
			
			var _this = this,
				flag = false,
				fn;
			
			if (arguments.length > 1) {
				
				if (typeof p1 === "function") {
					
					fn = p1;
				
				} else if (p1 === true) {
					
					flag = true;
					
					if (typeof p2 === "function") fn = p2;
					
				}
				
			}
			
			var $tr = this._tbody.find("tr").eq(index);
			
			if (!$tr.size()) return;
			
			var data = this._D[index],
				pre = 0;
			
			if (this._ordinalTd) pre++;
			
			if (this._assistTd) pre++;
			
			if (flag) {
				
				var $editeds = $tr.find(".grid-edited");
				
				$editeds.each(function() {
					
					var $edited = $(this),
						$item = $edited.find(".grid-form-item"),
						attrName = _this._DS[$edited.parent().index() - pre].name;
					
					if ($item.hasClass("ui-textinput")) {
						
						var text = $item.find("input").val();
						
						$edited.html(text);
						
						data[attrName] = text;
						
					} else if ($item.hasClass("ui-select")) {
						
						var text = $item.find(".select-text").html(),
							val = $item.find("input").val();
						
						$edited.html(text);
						
						data[attrName] = val;
						
						data["_" + attrName] = text;
						
					}
					
				});
				
			} else {
				
				var $tds = $tr.find("td");
				
				this._DS.each(function(i, item) {
					
					if (item.edited) {
						
						var $div = $tds.eq(i + pre).find("div").addClass("grid-edited"),
							text = $div.text(),
							type = $div.attr("data-type"),
							val = $div.attr("data-value");
						
						if (type == "enum") {
							
							var ul = ["<ul class='select-options'>"],
								map = _this._E[val];
							
							for (var key in map) {
								
								if (map.hasOwnProperty(key)) ul.push(["<li name='", key, "'>", map[key], "</li>"].join(""));
								
							}
							
							ul.push("</ul>");
							
							$div.html([
							    "<div class='ui-select grid-form-item'>",
								    "<div class='select-core'>",
										"<input type='hidden' value='", data[val], "' />",
										"<div class='select-text'>", text, "</div>",
										"<a class='select-btn _ng_'></a>",
									"</div>",
									ul.join(""),
							    "</div>"
							].join(""));
							
						} else {
							
							$div.html([
							    "<div class='ui-textinput grid-form-item'>",
							    	"<input value='", text, "'/>",
							    "</div>"
							].join(""));
							
						}
						
					}
					
				});
				
			}
			
			fn && fn();
			
		},
		 */
		
		/*
		 * 设置某一列是否隐藏
		 * flag为true是可见,false时隐藏
		 */
		setVisibleCols: function(flag, names) {
			
			var ns = [].concat(names),
				ds = this._DS,
				f = !flag;
			
			var item;
			
			for (var i = 0, l = ds.length; i < l; i++) {
				
				item = ds[i];
				
				if (ns.indexOf(item.name) >= 0) {
					
					item.hidden = f;
					
				}
				
			}
			
			index = null;
			
			this.setDataSource(ds);
			
		},
		
		/*
		 * 获取显示列的元数据
		 */
		getVisibleDataSource: function() {
			
			var arr = [];
			
			this._DS.each(function(i, item) {
				
				if (!item.hidden) arr.push(item);
				
			});
			
			return arr;
			
		},
		
		/*
		 * 设置枚举值
		 */
		setEnumerations: function(param) {
			
			var _this = this;
			
			this._ES = this._ES.concat(param).each(function(i, item) {
				
				_this._E[item.key] = item.map;
				
			});
				
		},
		
		/*
		 * 获取一个枚举值
		 */
		getEnumeration: function(keyName) {
			
			return this._E[keyName];
			
		},
		
		/*
		 * 删除一个枚举值
		 */
		removeEnumeration: function(keyName) {
			
			this._ES.each(function(i, item) {
				
				if (item.key == keyName) this.removeItemByIndex(i);
				
			});
			
			delete this._E[keyName];
			
			this.setDataSource(this._DS);
			
		},
		
		/*
		 * 设置元数据
		 * data = [{
		 * 	   label: 	//表头的字符串,
		 * 	   name: 	//标记这一列的字段!!!必须!!!
		 * 	   width: 	//列宽
		 * }]
		 */
		setDataSource: function(data) {
			
			this._DS = data;
			
			var hArr = ["<tr>"],
				cArr = [],
				trTpl = this._trTpl = ["<tr>"],
				flex = this._FLEX,
				width = 0;
			
			if (this._assistTd) {
				
				hArr.push(this._assistTd);
				
				cArr.push("<col width='30'></col>");
				
				trTpl.push("<td><div><i class='checkbox'></i></div></td>");
				
				width += 30;
				
			}
			
			if (this._ordinalTd) {
				
				hArr.push(this._ordinalTd);
				
				cArr.push("<col width='30'></col>");
				
				trTpl.push("<td><div>{NUM}</div></td>");
				
				width += 30;
				
			}
			
			var item, w, key;
			
			for (var i = 0, l = data.length; i < l; i++) {
				
				item = data[i];
				
				if (!item.hidden) {
					
					w = item.width || (flex ? "auto" : 150);
					
					key = (this._E[item.name] ? "_" : "") + item.name;
					
					hArr.push("<td width='" + w + "'><div>" + item.label + "</div></td>");
					
					cArr.push("<col width='" + w + "'></col>");
					
					trTpl.push("<td><div" + (item.title ? " title='{" + key + "}'" : "") + (this._E[item.name] ? " data-type='enum' data-value='" + item.name + "'" : "") +">{" + key + "}</div></td>");
					
					width += w;
					
				}
				
			}
			
			item = null;
			
			w = null;
			
			key = null;
			
			hArr.push("</tr>");
			
			trTpl.push("</tr>");
			
			this._thead.html(hArr.join(""));
			
			this._colGroup.html(cArr.join(""));
			
			this._tbody.empty();
			
			!flex && this.dom.width(width);
			
			this.setData(this._D);
			
		},
		
		/*
		 * 向表格塞入数据
		 * data = [{}]	//只渲染在元数据中描述过字段的列名,所以元数据中的name是必须的
		 */
		setData: function(data) {
			
			this._D = data;
			
			this._tbody.empty();
			
			var arr = [],
				tpl = this._trTpl.join("");
			
			var item;	
			
			for (var i = 0, l = data.length; i < l; i++) {
				
				item = data[i];
				
				item.NUM = i + 1;
				
				this._ES.each(function(i, it) {
					
					if (item[it.key] != undefined) item["_" + it.key] = it.map[item[it.key]];
					
				});
				
				arr.push(tpl.format(item)); 
				
			}
			
			item = null;
				
			this._tbody.html(arr.join(""));
			
			this._tbody.find("tr:odd").addClass("odd");
			
			this._thead.find("i.checkbox").removeClass("active");
			
		},
		
		/*
		 * 设置分页
		 * 在这里我就不做config的校验了...大家认为控制下
		 */
		setPagination: function(config) {
			
			if (config) {
				
				this._body.removeClass("ui-scroll")
					.find(">.ui-scroll-bar").remove()
				.end().find(">div").removeClass("ui-scroll-core");
				
				this.pagination = new UI.Pagination(config);
				
				this.dom.append(this.pagination).addClass("paged");
				
			} else {

				this._body.addClass("ui-scroll")
					.find(">div").addClass("ui-scroll-core")
				.end().append("<div class='ui-scroll-bar'></div>");
				
				this.dom.removeClass("paged");
				
				this.pagination && this.pagination.destroy();
				
				this.pagination = null;
				
			}
			
		},
		
		/*
		 * 设置是否有序号列
		 */
		setOrdinal: function(flag) {
			
			this._ordinalTd = (flag ? "<td width='30'><div>&nbsp;</div></td>" : "");
			
		},
		
		/*
		 * 设置辅助列的功能
		 */
		setAssist: function(type) {
			
			this._assistTd = ((type == "multi") ? "<td width='30'><div><i class='checkbox'></i></div></td>" : "");
			
		},
		
		/*
		 * 设置高度
		 */
		setHeight: function(h) {
			
			this.dom.height(h);
			
		},
		
		/*
		 * 获取表格数据
		 */
		getData: function() {
			
			return this._D;
			
		},
		
		/*
		 * 获取选中的节点
		 */
		getCheckedDatas: function() {
			
			var arr = [],
				$item;
			
			var $trs = this._tbody.find("i.checkbox.active").parent().parent().parent();
			
			for (var i = 0, l = $trs.size(); i < l; i++) {
				
				$item = $trs.eq(i);
				
				arr.push(this._D[$item.index()]);
				
			}
			
			return arr;
			
		},
		
		/*
		 * 添加一组数据
		 * 注意这里方法名多了个s,添加一组数据,直接向集合尾部堆栈
		 */
		addDatas: function(datas) {
			
			this._D = this._D.concat(datas);
			
			this.setData(this._D);
			
		},
		
		/*
		 * 向现有的数据中推入一条数据
		 * 如果设置index,添加到index位置上,默认直接添加在最后
		 */
		addData: function(data, index) {
			
			if (!isNaN(index) && (+index >= 0) && !((+index).toString().indexOf(".") >=0)) {
				
				this._D.splice(index, 0, data);
				
			} else {
				
				this._D.push(data);
				
			}
			
			this.setData(this._D);
			
		},
		
		/*
		 * 从现有数据中删除
		 * flag	//使用索引进行删除
		 */
		removeData: function(arr, flag) {
			
			if (!arr.length) return;
			
			var d = this._D,
				i = 0,
				l = arr.length;
			
			if (flag) {
				
				for (; i < l; i++) {
					
					d.splice(data[i], 1);
					
				}
				
			} else {
				
				var index;
				
				for (; i < l; i++) {
					
					index = d.indexOf(arr[i]);
					
					d.splice(index, 1);
					
				}
				
			}
			
			this.setData(d);
			
		},
		
		/*
		 * 清空表格数据
		 */
		empty: function() {
			
			this._D = [];
			
			this._tbody.empty();
			
		},
		
		/*
		 * 必须有表格...才能请求
		 */
		onRequest: function(flag) {
			
			this.pagination && this.pagination.onRequest(flag);
			
		}
	
	});
	
	return UI.Grid;
	
});