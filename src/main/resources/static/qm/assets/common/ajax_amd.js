/**
 * 通过 HTTP 请求加载远程数据，底层依赖jQuery的AJAX实现。
 * 当前接口实现了对jQuery AJAX接口的进一步封装。
 */
define(['jquery', 'encrypt'], function (JQuery, EncryptJS) {
	// ajax 请求参数配置
	var config = {
		/**
		 * 请求状态码
		 * @type {Object}
		 */
		reqCode: {
			/**
			 * 成功返回码 0
			 * @type {Number} 1
			 * @property SUCC
			 */
			SUCC: 0
		},
		/**
		 * 请求的数据类型
		 * @type {Object}
		 * @class reqDataType
		 */
		dataType: {
			/**
			 * 返回html类型
			 * @type {String}
			 * @property HTML
			 */
			HTML: "html",
			/**
			 * 返回json类型
			 * @type {Object}
			 * @property JSON
			 */
			JSON: "json",
			/**
			 * 返回text字符串类型
			 * @type {String}
			 * @property TEXT
			 */
			TEXT: "text"
		},
		/**
		 * 超时,默认超时30000ms
		 * @type {Number} 10000ms
		 * @property TIME_OUT
		 */
		TIME_OUT: 60000,
		/**
		 * 显示请求成功信息
		 * 
		 * @type {Boolean} false
		 * @property SHOW_SUCC_INFO
		 */
		SHOW_SUCC_INFO: false,
		/**
		 * 显示请求失败信息
		 * 
		 * @type {Boolean} false
		 * @property SHOW_ERROR_INFO
		 */
		SHOW_ERROR_INFO: false
	}
	/**
	 * 指定长度和进制的UUID
	 * @param len       长度
	 * @param radix     进制
	 * @returns {string}
	 */
	var uuidFast = function (len, radix) {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = [], i;
		radix = radix || chars.length;
		if (len) {
			for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
		} else {
			var r;
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	};
	//是否支持withCredentials参数
	var supportCredentials =  window.XMLHttpRequest && ("withCredentials" in new XMLHttpRequest());
	//老版Ajax梳理入参
	var initBaseParam = function (cmd, callback, sync, encrypt) {
		if (typeof (cmd) == 'function') {
			encrypt = sync;
			sync = callback;
			callback = cmd;
			cmd = '';
		}

		return {
			"cmd": cmd,
			"callback": callback,
			"sync": !!sync,
			"encrypt": !!encrypt
		}
	};
	/**
	 * 合并ajax请求参数
	 * @param {*} userOptions 用户自定义参数
	 * @param {*} extenOptions 系统追加参数
	 */
	var initParam = function (userOptions, extenOptions) {
		return $.extend(
			{
				encrypt: false, //是否需要加密，默认false
				timeout: config.TIME_OUT,
				dataType: config.dataType.JSON,
				beforeSend: function (xhr) {
					xhr.overrideMimeType("text/plain; charset=utf-8");
				},
				//请求头中添加日志uuid
				headers: {
					"_log4xContextKey": uuidFast(22, 16),
				}
			},
			userOptions || {},
			{
				async: true //强制为true
			}, extenOptions || {});
	}

	/**
	 * 补齐指定位数
	 * @param bits 格式化位数
	 * @param identifier 补全字符
	 * @param value 值
	 */
	var dataLeftCompleting = function (bits, identifier, value) {
		value = Array(bits + 1).join(identifier) + value;
		return value.slice(-bits);
	}
	/**
	 * 数据加密算法
	 */
	var encryptAlg = function (data, key) {
		key = EncryptJS.enc.Latin1.parse(dataLeftCompleting(16, " ", key));
		return EncryptJS.AES.encrypt(data, key, {
			iv: key,
			mode: EncryptJS.mode.CBC,
			padding: EncryptJS.pad.ZeroPadding
		}).toString();
	}
	/** 
	 * 对数据进行加密计算
	*/
	var encryptData = function (data, url_key) {
		if (typeof url_key === 'string' && typeof data === 'object') {
			var match = url_key.match(/[?|&]uid=([^&]+)/);
			if (match) {
				var key = match[1];
				for (var i in data) {
					var value = data[i] + '';
					data[i] = encryptAlg(value, key);
				}
			} else {
				console.error("如需加密，请在请求url中添加秘钥uid标识！");
			}
		}
		return data;
	}
	/**
	 * ajax请求成功通用处理函数
	 */
	var successFormat = function (data, textStatus, xhr, errorThrown, callback) {
		var xmlParam = {
			"XMLHttpRequest": xhr,
			"textStatus": textStatus,
			"errorThrown": errorThrown
		};
		//超时重定向至登陆页
		if (data.returnCode == 'BUSIOPER=RELOGIN') {
			//判断是否存在iframe
			window.location.href = '../../login.html';
			return;
		}

		var isSuc = (data.returnCode == config.reqCode.SUCC ? true : false);
		if (callback) {
			callback(data, isSuc, xmlParam);
		} else {
			var d = $.Deferred();
			return isSuc ? d.resolve(data, xmlParam) : d.reject(data, xmlParam);
		}
	}
	/**
	 * ajax请求支持原生成功模式处理函数
	 */
	var successFormatNative = function (data, textStatus, xhr, errorThrown, callback) {
		var xmlParam = {
			"XMLHttpRequest": xhr,
			"textStatus": textStatus,
			"errorThrown": errorThrown
		};
		//超时重定向至登陆页
		if (data.returnCode == 'BUSIOPER=RELOGIN') {
			//判断是否存在iframe
			window.location.href = '../../login.html';
			return;
		}

		if (callback) {
			callback(data, isSuc, xmlParam);
		} else {
			var d = $.Deferred();
			return d.resolve(data, xmlParam);
		}
	}
	/**
	 * ajax请求失败通用处理函数
	 */
	var errFormat = function (xhr, textStatus, errorThrown, callback) {
		var retErr = {};
		retErr['returnCode'] = "404";
		retErr['returnMessage'] = "网络异常或超时，请稍候再试！";
		var errorParam = {
			"XMLHttpRequest": xhr,
			"textStatus": textStatus,
			"errorThrown": errorThrown
		};
		if (callback) {
			callback(retErr, false, errorParam);
		} else {
			var d = $.Deferred();
			return d.reject(retErr, errorParam);
		}
	}
	/**
	* defrred封装的ajax请求
	*/
	var _ajaxInit = function (url, data, options) {
		var cache = (options.dataType == "html") ? true : false;
		if (options.encrypt && data) {
			data = encryptData(data, url);
		}
		var ajaxConfig = $.extend({
			url: url,
			data: data,
			cache: cache
		}, options);

		return $.ajax(ajaxConfig).then(
			function (data, textStatus, xhr) {
				if (!data) {
					return;
				}
				if(options.nativeAjax){
					return successFormatNative(data, textStatus, xhr);
				}else{
					return successFormat(data, textStatus, xhr);
				}	
			}, function (xhr, textStatus, errorThrown) {
				return errFormat(xhr, textStatus, errorThrown);
			});
	}
	/**
	 * 老版ajax请求基础方法
	 * @param {*} url 请求url地址
	 * @param {*} type 请求类型
	 * @param {*} cmd 数据
	 * @param {*} dataType 数据类型
	 * @param {*} callback 回调函数
	 * @param {*} sync 是否同步
	 * @param {*} needEncrypt 是否需要加密
	 */
	var _ajaxBase = function (url, type, cmd, dataType, callback, sync, needEncrypt) {
		var cache = (dataType == "html") ? true : false;
		if (needEncrypt) {
			cmd = encryptData(cmd, url);
		}

        var key = "permissionSecCertSession", kv = "",value = "";
        if (typeof window.sessionStorage == 'undefined' || window.sessionStorage == null) {
            kv = decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        } else {
            kv = window.sessionStorage.getItem(key);
        }
        if (kv != null && kv != "") {
            value = "Bearer " + kv;
        }

		return $.ajax({
			url: url,
			type: type,
			data: cmd,
			//请求头中添加日志uuid
			headers: {
				"Authorization" : value,
				"_log4xContextKey": uuidFast(22, 16)
			},
			cache: cache,
			dataType: dataType,
			async: !sync,
			timeout: config.TIME_OUT,
			beforeSend: function (xhr) {
				xhr.overrideMimeType("text/plain; charset=utf-8");
			},
			success: function (data, textStatus, xhr) {
				if (!data) {
					return;
				}
				if (dataType == "html" && callback) {
					callback(data, true);
					return;
				}
				successFormat(data, textStatus, xhr, null, callback);
			},
			error: function (xhr, textStatus, errorThrown) {
				errFormat(xhr, textStatus, errorThrown, callback);
			}
		});
	}
	var _ajaxJsonp = function (url, type, cmd, callback, sync) {
		if (!url || url === '') {
			console.log('the url of param cann\'t equals null or empty of string');
			return false;
		}
		if (!callback || callback === '') {
			console.log('you missed callback, it must be a function');
			return false;
		}
		if (!cmd || cmd === '') {
			console.log('warn! your passed null or empty to cmd param, are you suer?');
		}
		$.ajax({
			url: url,
			type: type,
			data: cmd,
			jsonpCallback: 'jsonCallback',
			contentType: "application/json",
			dataType: 'jsonp',
			async: sync ? false : true,
			timeout: config.TIME_OUT,
			beforeSend: function (xhr) {
				xhr.overrideMimeType("text/plain; charset=utf-8");
			},
			success: function (data, textStatus, xhr) {
				if (!data) {
					return;
				}
				successFormat(data, textStatus, xhr, null, callback);
			},
			error: function (xhr, textStatus, errorThrown) {
				errFormat(xhr, textStatus, errorThrown, callback);
			}
		})
	}

	var ajax = {
		/**
		 * GetJson是对ajax的封装,为创建 "GET" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String}
		 *            url HTTP(GET)请求地址
		 * @param {Object}
		 *            cmd json对象参数
		 * @param {Function}
		 *            callback [optional,default=undefined] GET请求成功回调函数
		 */
		getJson: function (url, cmd, callback, sync, encrypt) {
			var param = initBaseParam(cmd, callback, sync, encrypt);
			_ajaxBase(url, 'GET', param.cmd, config.dataType.JSON, param.callback, param.sync, param.encrypt);
		},
		/**
		 * PostJson是对ajax的封装,为创建 "POST" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String}
		 *            url HTTP(POST)请求地址
		 * @param {Object}
		 *            cmd json对象参数
		 * @param {Function}
		 *            callback [optional,default=undefined] POST请求成功回调函数
		 */
		postJson: function (url, cmd, callback, sync, encrypt) {
			var param = initBaseParam(cmd, callback, sync, encrypt);
			_ajaxBase(url, 'POST', param.cmd, config.dataType.JSON, param.callback, param.sync, param.encrypt);
		},
		/**
		 * putJson是对ajax的封装,为创建 "PUT" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String}
		 *            url HTTP(PUT)请求地址
		 * @param {Object}
		 *            cmd json对象参数
		 * @param {Function}
		 *            callback [optional,default=undefined] PUT请求成功回调函数
		 */
		putJson: function (url, cmd, callback, sync, encrypt) {
			var param = initBaseParam(cmd, callback, sync, encrypt);
			_ajaxBase(url, 'PUT', param.cmd, config.dataType.JSON, param.callback, param.sync, param.encrypt);
		},
		/**
		 * deleteJson是对ajax的封装,为创建 "DELETE" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String}
		 *            url HTTP(DELETE)请求地址
		 * @param {Object}
		 *            cmd json对象参数
		 * @param {Function}
		 *            callback [optional,default=undefined] DELETE请求成功回调函数
		 */
		deleteJson: function (url, cmd, callback, sync, encrypt) {
			var param = initBaseParam(cmd, callback, sync, encrypt);
			_ajaxBase(url, 'DELETE', param.cmd, config.dataType.JSON, param.callback, param.sync, param.encrypt);
		},

		getJsonp: function (url, cmd, callback, sync) {
			_ajaxJsonp(url, 'GET', cmd, callback, sync);
		},
		/**
		 * 跨域请求json数据
		 * 
		 * @method ajax
		 * @param {String}
		 *            url HTTP(POST/GET)请求地址
		 * @param {String}
		 *            type POST/GET
		 * @param {Object}
		 *            cmd json参数命令和数据
		 * @param {Function}
		 *            callback [optional,default=undefined] 请求成功回调函数,返回数据data和isSuc
		 */
		ajax: function (options) {
			var config = $.extend({
				type: 'post',
				dataType: 'json',
				timeout: 30000,
				beforeSend: function (xhr) {
					xhr.overrideMimeType("text/plain; charset=utf-8");
				}
			}, options);
			return $.ajax(config);
		},
		/**
		 * getJsonAsync,为创建 "GET" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String} url HTTP(GET)请求地址
		 * @param {Object} cmd json对象参数,可为空
		 * @param {Object} options json对象，ajax参数 可为空，如下是默认参数
		 *              options = {
		 *                timeout: number, //超时时间，默认60000
		 *                encrypt: boolean, //是否需要加密，默认false
		 *                async: boolean //强制为true
		 *              }
		 */
		getJsonAsync: function (url, data, options) {
			var param = initParam(options, { type: 'GET' });
			return _ajaxInit(url, data, param);
		},
		/**
		 * postJsonAsync,为创建 "POST" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String} url HTTP(POST)请求地址
		 * @param {Object} cmd json对象参数,可为空
		 * @param {Object} options json对象，ajax参数 可为空，如下是默认参数
		 *              options = {
		 *                timeout: number, //超时时间，默认60000
		 *                encrypt: boolean, //是否需要加密，默认false
		 *                async: boolean //强制为true
		 *              }
		 */
		postJsonAsync: function (url, data, options) {
			var param = initParam(options, { type: 'POST' });
			return _ajaxInit(url, data, param);
		},
		/**
		 * putJsonAsync,为创建 "PUT" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String} url HTTP(PUT)请求地址
		 * @param {Object} cmd json对象参数,可为空
		 * @param {Object} options json对象，ajax参数 可为空，如下是默认参数
		 *              options = {
		 *                timeout: number, //超时时间，默认60000
		 *                encrypt: boolean, //是否需要加密，默认false
		 *                async: boolean //强制为true
		 *              }
		 */
		putJsonAsync: function (url, data, options) {
			var param = initParam(options, { type: 'PUT' });
			return _ajaxInit(url, data, param);
		},
		/**
		 * deleteJsonAsync,为创建 "DELETE" 请求方式返回 "JSON"(text) 数据类型
		 * @param {String} url HTTP(DELETE)请求地址
		 * @param {Object} cmd json对象参数,可为空
		 * @param {Object} options json对象，ajax参数 可为空，如下是默认参数
		 *              options = {
		 *                timeout: number, //超时时间，默认60000
		 *                encrypt: boolean, //是否需要加密，默认false
		 *                async: boolean //强制为true
		 *              }
		 */
		deleteJsonAsync: function (url, data, options) {
			var param = initParam(options, { type: 'DELETE' });
			return _ajaxInit(url, data, param);
		},
		corsAsync: this.cors,
		corsNative: function (url, data, options) {
			if (typeof url === 'object') {
				options = url;
				url = options.url;
				data = options.data;
			}
			options = $.extend({
				url: url,
				data: data
			}, options);
			//IE8兼容cors
			$.support && ($.support.cors = true);
			//是否支持withCredentials
			if ( supportCredentials) {
				//为支持withCredentials的浏览器增加xhrFields配置
				options["xhrFields"] = { withCredentials: true };
			}
			//设置jquery 支持跨域
			var param = initParam(options, {
				crossDomain: true,
				headers: (options && options.headers) || {},
				contentType: "application/json; charset=utf-8"
			});
			param.type || (param.type = 'post');
			param.nativeAjax = true;
			return _ajaxInit(url, data, param);
		},
		cors: function (url, data, options) {
			if (typeof url === 'object') {
				options = url;
				url = options.url;
				data = options.data;
			}
			//IE8兼容cors
			$.support && ($.support.cors = true);
			//设置jquery 支持跨域
			var param = initParam(options, {
				crossDomain: true,
				headers: (options && options.headers) || {},
				contentType: "application/json; charset=utf-8"
			});
			param.type || (param.type = 'post');

			return _ajaxInit(url, data, param);
		}
	};

	return ajax;
});