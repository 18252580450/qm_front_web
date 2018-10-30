/*
 * 原型扩展类，主要是扩展jquery/JS原生方法
 * @date 2015-09-07
 * @auth AnNing
 */
define(["jquery"], function($) {
	
	/*
	 * 拓展String原型
	 */
	$.extend(String.prototype, {
		/*
		 * 格式化
		 */
		format: function(params) {
			
			params = Array.prototype.slice.call(arguments, 0);
			
			params.splice(0, 0, this);
			
			return $.format.apply(null, params);
			
		},
		
		/*
		 * 格式化之后生成jQuery对象
		 */
		format2Object: function(params) {
			
			return $(this.format.apply(this, arguments));
			
		},
		
		/*
		 * 清空两边空格
		 */
		trim: function() {
			
			return this.replace(/(^\s*)|(\s*$)/g, "");
		
		}
		
	});
	
	/*
	 * 拓展Array原型
	 */
	$.extend(Array.prototype, {
		
		last: function() {
			
			return this[this.length - 1];
			
		},
		
		/*
		 * 避免了大量的将集合中的对象字符串化
		 */
		format: function(tpl) {
			
			var dom = [];
			
			for (var i = 0, l = this.length; i < l; i++) {
				
				dom.push(tpl.format(this[i]));
				
			}
			
			return dom.join("");
			
		},
		
		/*
		 * 通过索引删除集合中的一个元素
		 */
		removeItemByIndex: function(index) {
			
			this.splice(index, 1);
			
			return this;
			
		},
		
		/*
		 * 删除集合中的一个元素
		 */
		removeItem: function(item) {
			
			var index = this.indexOf(item);
			
			if (index > -1) {
				
				this.splice(index, 1);
				
			}
			
			return this;
			
		},
		
		/*
		 * 迭代
		 */
		each: function(fn, reverse) {
			
			if (fn && typeof fn == "function") {
				
				if (reverse) {
					
					for (var i = this.length; i--;) {
						
						if (fn.call(this, i, this[i])) break;
						
					}
					
				} else {
					
					for (var i = 0, l = this.length; i < l; i++) {
						
						if (fn.call(this, i, this[i])) break;
						
					}
					
				}
				
			}
			
			return this;
			
		},
		
		/*
		 * 张世宇
		 * 2015-11-21
		 * 批量替换集合对象中的的属性
		 */
		_replace: function(params) {
			
			for (var i = params.length; i--;) {
				
				var param = params[i],
					key = param[0],
					value = param[1];
				
				for (var j = this.length; j--;) {
					
					var item = this[j];
					
					if (item[key]) item[key] = $.isFunction(value) ? value(item[key]) : value;
					
				}
				
			}
			
		}
		
	});
	
	/*
	 * 垫片Array原型下的indexOf方法
	 */
	if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item) {
		
		for (var i = 0, l = this.length; i < l; i++) {
			
			if (item === this[i]) return i;
			
		}
		
		if (i == l) return -1;
		
	};
	
	/*
	 * 生成guid
	 */
	$.GUID = function() {

		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			
	        var r = Math.random() * 16 | 0,
	        	v = c == "x" ? r : (r&0x3|0x8);
	        
	        return v.toString(16);
	        
	    }).toUpperCase();
		
	};
	
	/*
	 * 格式化模板
	 * @auth
	 * @param tpl 模板字符串
	 * <p>
	 * "哇{0}, 哦{1}", ["啊", "一"] 转换成 "哇啊, 哦一"
	 * </p>
	 */
	$.format = function(tpl, params) {
		
		var args = Array.prototype.slice.call(arguments, 1);
		
		return tpl.replace(/\{([^\}]+)\}/img, function($0, $1) {
			
			//复杂对象里的属性
			if ($1.indexOf('.') != -1 && typeof(params) != 'string') {
				
				var objStrs = $1.split('.');
				
				var value = '';
				
				var obj = null;
				
				for (var i = 0, l = objStrs.length; i < l; i++) {
					
					var item = objStrs[i];
					
					try {
						
						obj = obj ? obj[item] : params[item];
						
						value = obj.toString();
						
					} catch (e) {
						
						value = '';
						
					};
					
				};
				
				return value;
			
			} else if (params.hasOwnProperty($1) && typeof(params) != 'string') {
				
				return params[$1];
				
			} else {
				
				return args[$1 * 1] || '';
			
			};
		
		});
	
	};
	
	/*
	 * 获取location.href中的参数
	 */
	$.getParam = function(key) {
		
		var map = {};
		
		window.location.search.substr(1).split("&").each(function(i, item) {
			
			var arr = item.split("=");
			
			map[arr[0]] = arr[1];
			
		});
		
		return (typeof key == "string") ? map[key] : map;
		
	};
	
});