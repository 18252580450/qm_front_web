define([
    'hdb',
    'text!js/homePage/page/page.tpl',
    'style!js/homePage/page/page.css'
], function (Hdb, tpl) {
    var VERSION = '${{version}}';
    var objClass = function (options) {
        //判断el的异常值：el不存在、为空string、dom原生对象
        if (options.el) {
            if (options.el instanceof jQuery && options.el.length > 0) {
                this.$el = options.el;
            } else if (isDOM(options.el)) {
                this.$el = $(options.el);
            } else if (typeof (options.el) == 'string' && $(options.el).length > 0) {
                this.$el = $(options.el);
            }
        } else {
            this.$el = $("<div></div>")
        }
        this.options = $.extend({
            items_per_page: 10,//每页显示条数
            current_page: 1,
            limited_width: 0,
            prev_text: "<span class='icon arrow-left'></span>",
            next_text: "<span class='icon arrow-right'></span>",
            param: {},
            callback: function () { }
        }, options);
        eventInit.call(this);
        renderPageByIndex.call(this, this.options.current_page);
    };
    var eventInit = function () {
        this.$el.on('click', '.sn-pagination-page a', $.proxy(
            function (e) {
                var $target = $(e.target || e.currentTarget);
                var index = this.$el.find(".sn-pagination-page a").index($target);
                renderPageByIndex.call(this, this.pageShowArr[index]);
            }, this));
        this.$el.on("click", ".prev", $.proxy(function (e) {
            renderPageByIndex.call(this, this.options.current_page - 1);
        }, this));
        this.$el.on("click", ".next", $.proxy(function (e) {
            renderPageByIndex.call(this, this.options.current_page + 1);
        }, this));
    }
    var renderPageByIndex = function (index, param) {
        var _this = this;
        index = parseInt(index);
        if (index > this.totalPage) {
            index = this.totalPage;
        }
        if (index < 1) {
            index = 1;
        }
        this.options.current_page = index;
        this.options.callback({
            param: param ? param : this.options.param,
            page: index,
            start: this.options.items_per_page * (index - 1),
            end: this.options.items_per_page * index
        }, function (opt) {
            done.call(_this, opt)
        });
    }
    var done = function (opt) {
        this.totalNum = opt.totalNum;
        this.totalPage = Math.ceil(opt.totalNum / this.options.items_per_page);
        if (this.options.current_page != 1 || (opt.beans && opt.beans.length)) {
            render.call(this);
        }
    }
    var render = function () {
        if (this.totalPage == 1 || this.totalPage == 0) {
            this.$el.empty();
            return;
        }
        var template = Hdb.compile(tpl);
        this.$el.html(template({
            prevName: this.options.prev_text,
            nextName: this.options.next_text,
            current: this.options.current_page,
            totalPage: this.totalPage,
            totalNum: this.totalNum,
            page: getPageArr.call(this)
        }));
        if (this.options.current_page == 1) {
            this.$el.find('.prev').addClass('hide');
        } else if (this.options.current_page == this.totalPage) {
            this.$el.find('.next').addClass('hide');
        }
    }
    var getPageArr = function () {
        var arr = [];
        this.pageShowArr = [];
        if (this.options.limited_width) {
            var count = 2;
            if (this.options.current_page <= 2 || this.totalPage - this.options.current_page < 2) {
                count = 3;
            }
            if (this.options.current_page <= 1 || this.totalPage - this.options.current_page < 1) {
                count = 4;
            }
            for (var i = 1; i <= this.totalPage; i++) {
                var dif = Math.abs(this.options.current_page - i);
                if (dif <= count) {
                    arr.push({ num: i, isCurrent: (i == this.options.current_page) });
                    this.pageShowArr.push(i);
                }
            }
        } else {
            for (var i = 1; i <= this.totalPage; i++) {
                var dif = Math.abs(this.options.current_page - i)
                if (dif > 2 && (i - 1 > 2) && this.totalPage - i > 2) {
                    if (arr[arr.length - 1] != '') {
                        arr.push("");
                    }
                } else {
                    arr.push({ num: i, isCurrent: (i == this.options.current_page) });
                    this.pageShowArr.push(i);
                }
            }
        }
        return arr;
    }
    $.extend(objClass.prototype, {
        reset: function (param, index) {
            index = index ? index : 1;
            renderPageByIndex.call(this, index, param);
        }
    })
    //解决ie下console.log()报错问题
    window.console = window.console || (function () {
        var c = {};
        c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function () { };
        return c;
    })();
    // 判断是否为原生DOM
    var isDOM = function (obj) {
        return obj.tagName ? true : false
    }
    return objClass;
})