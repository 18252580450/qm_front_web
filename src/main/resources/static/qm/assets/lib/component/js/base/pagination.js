/*
 * pagination
 * @date 2015-09-11
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 更新分页信息
	 * n: num,	//pageNum
	 * c: num, //count
	 * l: num	//linage
	 */
	function _updateCore(pn, c, l) {
		
		var pc = Math.ceil(c / l);
		
		if (pc == 0) pn = 0;
		
		return [
		    "<b>共", c,"条数据</b>",
		    (pn == 1 || pn == 0) ?
		    	"<a class='pagination-first disabled'></a><a class='pagination-prev disabled'></a>"
		    		: "<a class='pagination-first'></a><a class='pagination-prev'></a>",
		    "<span class='pagination-pagNum'>", pn, "</span>",
		    "<span>/", pc, "</span>",
		    pn == pc ?
		    	"<a class='pagination-next disabled'></a><a class='pagination-last disabled'></a>"
		    		: "<a class='pagination-next'></a><a class='pagination-last'></a>"
		].join("");
		
	}
	
	/*
	 * 分页组件
	 */
	UI.Pagination = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			url: "",
			successFn: null,
			extraParamFn: null,
			linage: 10				//每页n行~默认10行
		},
		
		/*
		 * 类名
		 */
		className: 'UI.Pagination',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-pagination {className}'>",
				"<div class='pagination-core'>",
					"<a class='pagination-first disabled'></a>",
					"<a class='pagination-prev disabled'></a>",
					"<span class='pagination-pagNum'>0</span>",
				    "<span>/0</span>",
					"<a class='pagination-next disabled'></a>",
					"<a class='pagination-last disabled'></a>",
				"</div>",
				"<div class='pagination-jump'>",
					"<input class='pagination-text' value='0' />",
					"<a class='pagination-go'>go</a>",
				"</div>",
			"</div>",
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf,
				$dom = this.dom;
			
			this._core = $dom.find("div.pagination-core");
			
			this._text = $dom.find("input");
			
			this._go = $dom.find("a");
			
			this._PN = 1;
			
			this.setUrl(conf.url);
			
			this.setLinage(conf.linage);

			this.setSuccessFn(conf.successFn);
			
			this.setExtraParamFn(conf.extraParamFn);
			
			this.initEvent();
			
		},
		
		/*
		 * 注册事件
		 */
		initEvent: function() {
			
			var _this = this,
				$core = this._core;
		
			/*
			 * 切换页
			 */
			$core.on("click", "a", function() {
				
				var $this = $(this);
				
				if ($this.hasClass("disabled")) return;
				
				var dir = $this.attr("class").split(" ")[0].split("-")[1],
					pn = $this.siblings("span:first").html(),
					pc = $this.siblings("span:last").html().slice(1);
				
				switch (dir) {
				
					case "first":
						
						pn = 1;
						
						break;
					
					case "prev":
						
						pn--;
						
						break;
					
					case "next":
						
						pn++;
						
						break;
					
					case "last":
						
						pn = pc;
						
						break;
				
				}
				
				_this._PN = pn;
				
				_this.onRequest();
				
			});
			
			/*
			 * 输入框
			 */
			this._text.on("focus", function() {
				
				var $this = $(this);
				
				var val = $this.val(),
					pn = $core.find("span:first").html(),
					pc = $core.find("span:last").html().slice(1);
				
				$this.on("blur.validate", function() {
					
					var _val = parseInt($this.val());
					
					if (isNaN(_val) || _val == val) {
						
						$this.val(val);
						
					} else if (_val > pc) {
						
						$this.val(pc);
						
					}
					
					_this._PN = $this.val();
					
					$this.off(".validate");
					
				});
				
			});
			
			/*
			 * 跳转
			 */
			this._go.on("click", function() {
				
				_this._PN = _this._text.val();
				
				_this.onRequest();
				
			});
			
		},
		
		/*
		 * 设置每页多少行
		 */
		setLinage: function(num) {
			
			this._L = (isNaN(num) || num <= 0) ? 10 : Math.ceil(num); 
			
		},
		
		/*
		 * 设置请求的url
		 */
		setUrl: function(url) {
			
			this._URL = url;
			
		},
		
		/*
		 * 设置一个函数,请求成功后的毁掉函数
		 */
		setSuccessFn: function(fn) {
			
			this._SF = fn || function() {};
			
		},
		
		/*
		 * 设置一个函数,这个函数会在请求时添加额外的参数
		 */
		setExtraParamFn: function(fn) {
			
			this._EPF = fn || function() {return {};};
			
		},
		
		/*
		 * 设置前台分页的数据
		 */
		setData: function(data) {
			
			this._D = {
				beans: data,
				totalCount: data.length
			};
			
			this.onRequest(true);
			
		},
		
		/*
		 * 删除条数据
		 */
		removeItem: function(index) {
			
			if ((this._PN > 1) && (this._PN == Math.ceil(this._D.totalCount / this._L)) && (this._D.totalCount % this._L == 1)) {
				
				this._PN = this._PN - 1;
				
				this._D.beans.splice(-1, 1);
				
			} else {
				
				this._D.beans.splice(index, 1);
				
			}
			
			this._D.totalCount = this._D.beans.length;
			
			this.onRequest();
			
		},
		
		/*
		 * 请求
		 * flag如果为true,将页码设为1
		 */
		onRequest: function(flag) {
			
			var pn = flag ? 1 : this._PN;
			
			if (!pn) return;

			var _this = this,
				l = this._L;
			
			if (this._URL) {
				
				$.ajax({
					url: this._URL,
					type: "post",
					data: $.extend({start: (l * (pn - 1)) + 1, end: pn * l}, this._EPF()),
					dataType: "json",
					success: function(data) {
						
						_this._SF(data);
						
						_this._text.val(pn);
						
						_this._core.html(_updateCore(pn, data.totalCount, l));
						
					}
				});
				
			} else if (this._D) {
				
				_this._SF(this._D.beans.slice((pn - 1) * l, pn * l));
				
				_this._text.val(pn);
				
				_this._core.html(_updateCore(pn, this._D.totalCount, l));
				
			}
			
		}
		
	});
	
});