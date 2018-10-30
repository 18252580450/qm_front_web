/*
 * 时间选择
 * @date 2015-09-15
 * @auth AnNing
 */
define(["cmp"], function(cmp) {
	
	/*
	 * 补零
	 */
	function fz(num) {
		
		return +num < 10 ? "0" + num : num;
		
	}
	
	/*
	 * 创建面板
	 * 这里声明一下: 如果手贱,将max的值设置为小于min的值,会在函数内部,将两者交换
	 * flag是否是通过切换年月来创建的面板
	 */
	function _createDate(conf, flag) {
		
		var max = conf.max,
			min = conf.min,
			val = conf.val;
		
		var currentDay = new Date();				//当前时间
		
		/*
		 * 校验最大值最小值是否合法(最大肯定要大于最小么)
		 * 如果不合法将两者交换
		 */
		if (max && min) {
			
			var maxNum = (max == "current") ? +([currentDay.getUTCFullYear(), +currentDay.getMonth() + 1, currentDay.getDate()].join("")) : +max.split("-").join(""),
				minNum = (min == "current") ? +([currentDay.getUTCFullYear(), +currentDay.getMonth() + 1, currentDay.getDate()].join("")) : +min.split("-").join("");
			
			if (maxNum < minNum) {
				
				max = conf.min;
				
				min = conf.max;
				
			}
				
		}
		
		var date, maxY, maxM, maxD, minY, minM, minD;
		
		/*
		 * 如果有最大值
		 */
		if (max) {
			
			var maxDay;
			
			if (max == "current") {
				
				maxDay = currentDay;
				
			} else {
				
				var maxArr = max.split("-");
				
				maxDay = new Date(maxArr[0], +maxArr[1] - 1, maxArr[2]);
				
			}
			
			maxY = maxDay.getUTCFullYear();
			
			maxM = +maxDay.getMonth() + 1;
			
			maxD = maxDay.getDate();
			
		}
		
		/*
		 * 如果有最小值
		 */
		if (min) {
			
			var minDay;
			
			if (min == "current") {
				
				minDay = currentDay;
				
			} else {
				
				var minArr = min.split("-");
				
				minDay = new Date(minArr[0], +minArr[1] - 1, minArr[2]);
				
			}
			
			minY = minDay.getUTCFullYear();
			
			minM = +minDay.getMonth() + 1;
			
			minD = minDay.getDate();
			
		}
		
		/*
		 * 回显用的值,如果有就回显,如果没有就去今天
		 */
		if (val) {
			
			var dArr = val.split(" ")[0].split("-");
			
			/*
			 * 这里有必要提一下,这块是为了防止从10月31号,切换到9月或者11月的情况
			 * 因为9月和11月没有31号,就只能使用30号来回显了
			 */
			if (flag) {
				
				var _date = new Date(dArr[0], +dArr[1], 0);
				
				if (_date.getDate() <= dArr[2]) {
					
					date = _date;
					
				} else {
					
					date = new Date(dArr[0], +dArr[1] - 1, dArr[2]);
					
				}
				
			} else {
				
				date = new Date(dArr[0], +dArr[1] - 1, dArr[2]);
				
			}
			
		} else {									//如果没有需要回显的值,会用今天的日期来回显
			
			date = currentDay;
			
		}
		
		var yyyy = date.getUTCFullYear(),
			mm = +date.getMonth() + 1,
			dd = date.getDate();
		
		/*
		 * 开始构建文档流
		 */
		var dom = [],
			yMax = false,
			yMin = false,
			flagMax = false,
			flagMin = false;
		
		if (maxY && yyyy >= maxY) {
			
			yyyy = maxY;
			
			yMax = true;
			
			if (mm >= maxM) {
				
				mm = maxM;
				
				flagMax = true;
				
			}
			
		}
		
		if (minY && yyyy <= minY) {
			
			yyyy = minY;
			
			yMin = true;
			
			if (mm <= minM) {
				
				mm = minM;
				
				flagMin = true;
				
			}
			
		}
		
		dom.push([
		    "<h1>",
		    	"<i class='date-prev", yMin ? " disabled" : "", "'></i>",
		    	"<span>", yyyy, "</span>",
		    	"<i class='date-next", yMax ? " disabled" : "", "'></i>",
		    "</h1>"
		].join(""));
		
		dom.push([
		    "<h2>",
		    	"<i class='date-prev", flagMin ? " disabled" : "", "'></i>",
		    	"<span>", mm, "</span>",
		    	"<i class='date-next", flagMax ? " disabled" : "", "'></i>",
		    "</h2>"
		].join(""));
		
		dom.push([
		    "<ul>",
		    	"<li>日</li>",
		    	"<li>一</li>",
		    	"<li>二</li>",
		    	"<li>三</li>",
		    	"<li>四</li>",
		    	"<li>五</li>",
		    	"<li>六</li>",
		    "</ul>"
		].join(""));
		
		/*
		 * 输出日期
		 */
		var dateArr = [],
			lastMonthlastDay = new Date(yyyy, +mm - 1, 0),
			lastDay = +lastMonthlastDay.getDay(),
			lastDate = +lastMonthlastDay.getDate(),
			thisMonthlastDay = new Date(yyyy, mm, 0),
			thisDay = +thisMonthlastDay.getDay(),
			thisDate = +thisMonthlastDay.getDate();
		
		for (var i = lastDay + 1; i--;) {						//先输出上个月最后几天
			
			dateArr.push("<b>" + (lastDate - i) + "</b>");
			
		}
		
		if (flagMin) {											//如果当前构造的面板是最小值限定的面板
			
			for (var i = 1; i < minD; i++) {					//最小天以前的日期全都不可用
				
				dateArr.push("<b>" + i + "</b>");
				
			}
			
			for (; i < dd; i++) {								//前面做过max与min的验证.在这里先将回显日期之前的日期输出
				
				dateArr.push("<a>" + i + "</a>");
				
			}
			
			dateArr.push("<a class='active'>" + dd + "</a>");	//输出回显的日期;实际上这是dd等于i
			
			if (flagMax) {										//如果最大值也在这个面板上
				
				for (; i < maxD;) {								//可选日期输出到最大天数
					
					dateArr.push("<a>" + (++i) + "</a>");
					
				}
				
				for (; i < thisDate;) {							//不可选
					
					dateArr.push("<b>" + (++i) + "</b>");
					
				}
				
			} else {
				
				for (; i < thisDate;) {
					
					dateArr.push("<a>" + (++i) + "</a>");
					
				}
				
			}
			
		} else {												//不是最小值的面板
			
			for (var i = 1; i < dd; i++) {
				
				dateArr.push("<a>" + i + "</a>");
				
			}
			
			dateArr.push("<a class='active'>" + dd + "</a>");
			
			if (flagMax) {										//如果最大值也在这个面板上
				
				for (; i < maxD;) {								//可选日期输出到最大天数
					
					dateArr.push("<a>" + (++i) + "</a>");
					
				}
				
				for (; i < thisDate;) {							//不可选
					
					dateArr.push("<b>" + (++i) + "</b>");
					
				}
				
			} else {
				
				for (; i < thisDate;) {
					
					dateArr.push("<a>" + (++i) + "</a>");
					
				}
				
			}
			
		}
		
		for (var i = 1, l = 7 -thisDay; i < l; i++) {			//打印最后几天
			
			dateArr.push("<b>" + i + "</b>");
			
		}
		
		dom.push("<div>" + dateArr.join("") + "</div>");
		
		return dom.join("");
		
	}
	
	/*
	 * 弹出面板
	 */
	UI.document.on("click", ".date-core *", function() {
		
		var $date = $(this).parent().parent(),
			$panel = $date.find(">div.date-panel");
		
		if (!$panel.size()) $panel = $("<div class='date-panel _ng_'></div>").appendTo($date);
		
		UI.showPopWin($panel.html(_createDate({
			//type: $date.attr("data-type"),
			max: $date.attr("data-max"),
			min: $date.attr("data-min"),
			val: $date.find("div.date-text").html()
		})));
		
	});
	
	/*
	 * 切换年月
	 */
	UI.document.on("click", ".date-panel i", function() {
		
		var $this = $(this);
		
		if ($this.hasClass("disabled")) return;
		
		var $panel = $this.parent().parent(),
			$date = $panel.parent(),
			$span = $this.siblings("span"),
			value = +$span.html();
		
		$span.html($this.hasClass("date-prev") ? --value : ++value);
		
		$panel.html(_createDate({
			//type: $date.attr("data-type"),
			max: $date.attr("data-max"),
			min: $date.attr("data-min"),
			val: [$panel.find("h1>span").html(), $panel.find("h2>span").html(), $panel.find("div>a.active").html()].join("-") + " 00:00:00"
		}, true));
		
	});
	
	/*
	 * 选择日期
	 */
	UI.document.on("click", ".date-panel a", function() {
		
		var $this = $(this),
			$panel = $this.parent().parent(),
			$core = $panel.siblings("div.date-core");
		
		var value = [$panel.find("h1>span").html(), fz($panel.find("h2>span").html()), fz($this.html())].join("-") + " 00:00:00";
		
		$core.find("input").val(value);
		
		$core.find("div").html(value);
		
		$panel.empty();
		
		UI.hidePopWin();
		
	});
	
	/*
	 * 时间选择
	 * format yyyy-mm-dd
	 * 想做得简单些...又想做得nb些啊,哎...好纠结
	 */
	UI.DateChooser = $.inherit(UI.Component, {
		
		/*
		 * 默认配置项
		 */
		defConf: {
			type: "day",				//想做成年控件,月控件,日控件...先日吧~木哈哈哈
			min: undefined,
			max: undefined
		},
		
		/*
		 * 类名
		 */
		className: 'UI.DateChooser',
		
		/*
		 * 模板
		 */
		tpl: [
			"<div id='{id}' class='ui-date {className}' data-type='{type}'>",
				"<div class='date-core'>",
					"<input name='{name}' type='hidden' />",
					"<div class='date-text'></div>",
					"<a class='date-btn'></a>",
				"</div>",
			"</div>"
		].join(""),
		
		/*
		 * 初始化
		 */
		init: function() {
			
			var conf = this.conf;

			conf.max && this.max(conf.max);
			
			conf.min && this.min(conf.min);
			
		},
		
		/*
		 * 设置最大值
		 */
		max: function(text) {
			
			text ? this.dom.attr({"data-max": text}) : this.dom.removeAttr("data-max");
			
		},
		
		/*
		 * 设置最小值
		 */
		min: function(text) {
			
			text ? this.dom.attr({"data-min": text}) : this.dom.removeAttr("data-min");
			
		}
		
	});
	
});