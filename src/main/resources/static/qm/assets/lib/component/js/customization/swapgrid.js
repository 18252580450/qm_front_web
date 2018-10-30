/*
 * grid
 * @date 2015-09-09
 * @auth AnNing
 */
define(["cmp", "grid"], function(cmp) {
	
	/*
	 * 左右互换的表格
	 */
	UI.SwapGrid = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			/*
			 * 元数据中每一项都可以设置width,但是因为table为100%填充所以width不一定会完全正确
			 * 当flex设为false时,width会正确显示,如果width不设置,默认为100px
			 */
			flex: true,
			ordinal: false,				//是否有序号
			dataSource: null,			//元数据
			data: null,					//数据
			linage: 5,					//左侧表格默认的行数
			enumerations: []
		},
		
		/*
		 * 类名
		 */
		className: 'UI.SwapGrid',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-swap-grid {className}'>",
				"<table width='100%' cellpadding='0' cellspacing='0'>",
					"<tr>",
						"<td></td>",
						"<td width='80' class='swap-grid-btn'>",
							"<a name='left-right'>>></a>",
							"<br />",
							"<a name='right-left'><<</a>",
						"</td>",
						"<td></td>",
					"</tr>",
				"</table>",
			"</div>",
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var _this = this,
				conf = this.conf,
				$dom = this.dom;
			
			this._leftGrid = new UI.Grid({
				paged: {
					linage: conf.linage,
					successFn: function(data) {
						
						_this._leftGrid.setData(data);
						
					}
				},
				assist: "multi",
				ordinal: conf.ordinal
			}).appendTo($dom.find("td:first"));
			
			this._rightGrid = new UI.Grid({
				assist: "multi",
				ordinal: conf.ordinal
			}).appendTo($dom.find("td:last"));
			
			conf.enumerations && this.setEnumerations(conf.enumerations);
			
			conf.dataSource && this.setDataSource(conf.dataSource);
			
			conf.data && this.setData(conf.data);
			
			this.setSwapFn(conf.swapFn);
			
			this.initEvent();
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var _this = this;
			
			/*
			 * 左添加,右添加
			 * @date 2015-09-29
			 * @auth 张世宇
			 */
			this.dom.on("click", ".swap-grid-btn a", function() {
				
				var name = $(this).attr("name").split("-");
				
				var $provider = _this["_" + name[0] + "Grid"];
					
				var data = $provider.getCheckedDatas();
				
				if (data.length) {
					
					var $receiver = _this["_" + name[1] + "Grid"];
					
					var pData = _this._leftGrid.pagination._D.beans;
					
					if (name[1] == "right") {
						
						data.each(function(i, item) {
							
							pData.removeItem(item);
							
						});
						
					} else {
						
						pData = pData.concat(data);
						
					}
					
					$provider.removeData(data);
					
					data = _this._SF(name[1], data) || data;
					
					$receiver.addDatas(data);
					
					_this._leftGrid.pagination.setData(pData);
					
				}
				
			});
			
		},
		
		/*
		 * 切换时执行的回调函数
		 */
		setSwapFn: function(fn) {
			
			this._SF = fn || function() {};
			
		},
		
		/*
		 * 设置枚举值
		 * @date 2015-09-29
		 * @auth 张世宇
		 */
		setEnumerations: function(p1, p2) {
			
			this._leftGrid.setEnumerations(p1);
			
			this._rightGrid.setEnumerations(p2 || p1);
			
		},
		
		/*
		 * 设置元数据
		 * @date 2015-09-29
		 * @auth 张世宇
		 */
		setDataSource: function(d1, d2) {
			
			this._leftGrid.setDataSource(d1);
			
			this._rightGrid.setDataSource(d2 || d1);
			
		},
		
		/*
		 * 向表格塞入数据
		 * data = [{}]	//只渲染在元数据中描述过字段的列名,所以元数据中的name是必须的
		 */
		setData: function(data) {
			
			this._D = data;
			
			this._leftGrid.pagination.setData(data);
			
			this._rightGrid.empty();
			
		},
		
		/*
		 * 获取数据,默认取右侧
		 * flag为true取左侧
		 */
		getData: function(flag) {
			
			return flag ? this._leftGrid.getData() : this._rightGrid.getData();
			
		}
		
	});
	
	return UI.SwapGrid;
	
});