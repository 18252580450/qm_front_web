/**
 * web 端日志采集
 * @version 1.0.3
 */
define(['ajax'], function (ajax) {
    // localStorage 不可用的情况下，不处理日志
    var storage = window.localStorage || {
        getItem: function () { },
        setItem: function () { }
    };
    var logObj = {};
    var LEVEL = {
        log: 1,
        info: 2,
        warn: 3,
        error: 4
    };
    //36_address:http://192.168.100.105:20000/frontlogger/errorlog
    //cs_address: http://172.20.118.15:10010/frontlogger/errorlog
    //cmos_address: http://frontlog.cmos/frontlogger/errorlog
    var default_options = {
        level: LEVEL.log, //日志级别
        //server: 'http://frontlog.cmos/frontlogger/errorlog', // 日志中心server地址-生产地址
        //server: 'http://172.20.118.15:10010/frontlogger/errorlog', // 日志中心server地址-洛阳测试地址
        server: 'http://192.168.100.105:20000/frontlogger/errorlog', // 日志中心server地址-郑州测试地址
        time: 1000 * 15, // 发送间隔时间
        len: 40, // 一次发送日志条数
        systemCode: 'null', // 系统编码
        appName: 'null', // 工程编码
        instanceName: 'null', // 实例标识
        hostIp: 'null', // 主机Ip
        traceId: 'null', // 唯一标识
        errorTime: 'null', // 错误时间
        errorCode: 'null', // 错误编码
        errorMsg: 'null', // 错误信息
        exceptionStack: 'null', // 异常堆栈
        userId: 'null', // 用户id
        province: '000' // 省份编码
    };

    /**
     * 默认获取项目标志
     * eg: ngcs.he.com ==> ngcs
     */
    function getProjectCode() {
        var re = window.location.hostname.match(/([^\.]*)?\./);
        return re ? re[1] : 'localhost';
    }

    //localStorage存储的key值
    function getStorageKey() {
        return '__log__' + getProjectCode();
    }

    function getBrowserInfo() {
        var userAgent = navigator.userAgent.toLowerCase();
       // var matched = userAgent.match(/.+(it|chrome|trident)[\/: ]([\d.]+)/);
        var matched = userAgent.match(/.+(it|chrome|firefox|trident)[\/: ]([\d.]+)/);
        //ie11 7.0
        //ie10 6.0
        //ie9  5.0
        //ie8  4.0
        //根据trident判断ie浏览器版本信息
        if(matched[1] == 'trident'){
            switch (matched[2]) {
                case '7.0':
                    matched[2] = '11';
                    break;
                case '6.0':
                    matched[2] = '10';
                    break;
                case '5.0':
                    matched[2] = '9';
                    break;
                case '4.0':
                    matched[2] = '8';
                    break;
                default:
                    break;
            }
            matched[1] = 'ie';
        }
        return matched ? (matched[1] + matched[2]) : 'b-';
    }
    /**
     * 日志模块构造函数
     * @param {any} options
     */
    function Logger(options) {
        this.options = $.extend({}, options || {}, default_options);
        this.key = getStorageKey();
        this.b_info = getBrowserInfo().replace(LOG_SEPC_MSG_REG, ";");
        // this.max_length = 300;// 单条日志信息最大长度
    }

    function toArray(args) {
        return Array.prototype.slice.call(args);
    }

    function getTime() {
        var d = new Date();
        var format = 'YYYY-MM-DD-hh-mm-ss';
        var time_str = format.replace(/[A-Za-z]+/g, function (key) {
            var value = '';
            switch (key) {
                case 'YYYY':
                    value = d.getFullYear();
                    break;
                case 'MM':
                    value = ('00' + (d.getMonth() + 1)).slice(-key.length);
                    break;
                case 'DD':
                    value = ('00' + d.getDate()).slice(-key.length);
                    break;
                case 'hh':
                    value = ('00' + d.getHours()).slice(-key.length);
                    break;
                case 'mm':
                    value = ('00' + d.getMinutes()).slice(-key.length);
                    break;
                case 'ss':
                    value = ('00' + d.getSeconds()).slice(-key.length);
                    break;
                case 'ms':
                    value = d.getMilliseconds();
                    break;
                default:
                    break;
            }
            return value;
        });
        var reg = new RegExp("-", "g");
        return time_str.replace(reg, '');
    }
    var LOG_SPLIT_FLAG = '@@';//每条日志分隔符（仅内部使用）
    var LOG_SPLIT_REGEX = new RegExp((/([\S\s]*?)/).source + LOG_SPLIT_FLAG);
    var LOG_SEPC_CHART_REG = new RegExp((/\||/).source + LOG_SPLIT_FLAG, 'g');// 日志中特殊字符处理
    var LOG_SEPC_MSG_REG = new RegExp(",", "g");
    var iswaiting = false;
    var LOG_CACHE = '';// 缓存中的日志信息，减少对localstorage的频繁操作
    /**
     * 将LOG_CACHE缓存中的日志信息，批量增加到localstorage中
     * @param {string} log_info 日志内容
     */
    function addLog(log_info) {
        LOG_CACHE += (LOG_CACHE ? LOG_SPLIT_FLAG : '') + log_info;
        if (!iswaiting) {
            iswaiting = true;
            setTimeout(function () {
                iswaiting = false;
                var storage_data = storage.getItem(logObj.key);
                storage_data = (storage_data ? storage_data + LOG_SPLIT_FLAG : '') + LOG_CACHE;
                LOG_CACHE = '';
                storage.setItem(logObj.key, storage_data);
            }, 0);
        }
    }
    // IE8 使用JSON.stringify 时，中文会转成unicode编码
    var need_translate = (function () {
        return JSON.stringify("中").length !== 3;
    })();
    /**
     * 反编码unicode字符串
     * @param {string} str_char
     * @returns 反unicode编码后的字符串
     */
    function translateCharte(str_char) {
        if (need_translate) {
            return str_char.replace(/\\u([0-9a-fA-F]{4})/g, function (string, matched) {
                return String.fromCharCode(parseInt(matched, 16));
            });
        }
        return str_char;
    }
    /**
     * 写入日志信息到LOG_CACHE缓存中
     * @param {number} level 写入日志级别信息
     * @param {array} args 1：日志信息
     */
    function setData(level, args/*参数*/) {
        var opts = logObj.options;
        if (level < opts.level) {
            //日志级别达不到指定级别
            return;
        }
        if (args.length != 2) {
            return;
        }
        //args 参数转换成string类型，使用replace方法
        opts.errorCode = ('' + args[0]).replace(LOG_SEPC_CHART_REG, '');
        opts.errorMsg = ('' + args[1]).replace(LOG_SEPC_CHART_REG, '');
        var errorMessage = opts.errorMsg.replace(LOG_SEPC_MSG_REG, ';');
        //系统编码|工程编码|实例标识|主机IP|唯一标识|错误时间|错误编码|错误信息|异常堆栈|浏览器类型|坐席id|省份信息
        var default_str = opts.systemCode + '|' + opts.appName + '|' + opts.instanceName + '|' + opts.hostIp + '|' + opts.traceId + '|' + getTime() + '|' + opts.errorCode + '|' + errorMessage + '|' + opts.exceptionStack + '|' + logObj.b_info + '|' + opts.userId + '|' + opts.province;
        opts.traceId = 'null';
        addLog(translateCharte(default_str));
    }

    /**
     * 获取指定条数的日志信息
     * @param {string} key localstorage日志存储key值
     * @param {number} len 获取条数
     */
    function getData(key, len) {
        var orgin_item = storage.getItem(key);
        var data = [];
        while (orgin_item && data.length < len) {
            var matched = orgin_item.match(LOG_SPLIT_REGEX);
            if (matched) {
                data.push(matched[1]);
                orgin_item = orgin_item.substring(matched[0].length);
            } else {
                data.push(orgin_item);
                orgin_item = '';
            }
        }
        storage.setItem(key, orgin_item);
        return data;
    }
    /**
     * 通过cros发送日志到日志中心
     */
    function sendLog() {
        var data = getData(logObj.key, logObj.options.len);
        if (data.length === 0) {
            //没有日志数据不处理
            var d = $.Deferred();
            return d.resolve();
        }
        var sendMessage = function () {
            return ajax.cors({ url: logObj.options.server, data: translateCharte(JSON.stringify({ data: data })) });
        }
        //发送失败重发一次
        return sendMessage().fail(sendMessage);
    }

    $.extend(Logger.prototype, {
        log: function () {
            setData(LEVEL.log, arguments);
        },
        info: function () {
            setData(LEVEL.info, arguments);
        },
        warn: function () {
            setData(LEVEL.warn, arguments);
        },
        error: function () {
            setData(LEVEL.error, arguments);
        },
        setConfig: function (options) {
            $.extend(this.options, options || {});
            if (options && options.level && LEVEL[options.level]) {
                //level 转换
                this.options.level = LEVEL[options.level];
            }
        },

        ajaxError: function () {
            // TODO: 临时注释
            // var _this = this;
            // $(document).ajaxComplete(function (event, jqxhr, settings) {
            //
            //     //ajax异常
            //     if (settings.url && settings.url != logObj.options.server) {
            //         if (jqxhr.status != 200) {
            //
            //             //添加traceID
            //             if (settings.headers && settings.headers._log4xContextKey && settings.headers._log4xContextKey != "") {
            //                 logObj.options.traceId = settings.headers._log4xContextKey;
            //             } else {
            //                 logObj.options.traceId = "null";
            //             }
            //             //请求失败
            //             _this.log("550103", JSON.stringify({ status: jqxhr.status, url: settings.url }));
            //
            //         } else if (jqxhr.status == 200) {
            //             if (jqxhr.responseJSON && jqxhr.responseJSON.returnCode != 0) {
            //
            //                 //添加traceID
            //                 if (settings.headers && settings.headers._log4xContextKey && settings.headers._log4xContextKey != "") {
            //                     logObj.options.traceId = settings.headers._log4xContextKey;
            //                 } else {
            //                     logObj.options.traceId = "null";
            //                 }
            //                 //请求成功，但请求参数异常等，返回数据returnCode不为0
            //                 if (jqxhr.responseText && settings.url) {
            //                     _this.log("550102", JSON.stringify({ responseText: jqxhr.responseText, url: settings.url }));
            //                 }
            //             } else if (!jqxhr.responseJSON) {
            //
            //                 // //添加traceID
            //                 // if (settings.headers && settings.headers._log4xContextKey && settings.headers._log4xContextKey != "") {
            //                 //     logObj.options.traceId = settings.headers._log4xContextKey;
            //                 // } else {
            //                 //     logObj.options.traceId = "null";
            //                 // }
            //                 // //请求成功，但是没有数据返回
            //                 // _this.log("550101", JSON.stringify({ responseText: "", url: settings.url }));
            //             }
            //         }
            //     }
            //
            // })
        }

    });

    logObj = new Logger();

    function startUp() {
        setTimeout(function () {
            sendLog().always(startUp);
        }, logObj.options.time);
    }
    // TODO: 临时注释
    // //启动记录ajax异常日志
    // logObj.ajaxError();
    // //启动日志服务
    // startUp();
    //将logObj赋给window对象，保证在crossApi中可以调用日志采集方法
    window.logObj = logObj;
    return logObj;
});
