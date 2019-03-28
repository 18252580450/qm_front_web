/*
* 引用路径
*/
var requirePath = {

    // Lib
    "jquery": "assets/lib/jquery/jquery-1.11.3.min",
    "easyui-core": "assets/lib/easyui/jquery.easyui.min",
    "easyui": "assets/lib/easyui/locale/easyui-lang-zh_CN",
    "bootstrap": "assets/lib/bootstrap/bootstrap.min",
    "bootstrap-select": "assets/lib/bootstrap-select/bootstrap-select.min",
    "bootstrap-select-zh-CN": "assets/lib/bootstrap-select/defaults-zh_CN.min",
    "bootstrap-table": "assets/lib/bootstrap-table/bootstrap-table.min",
    "bootstrap-table-zh-CN": "assets/lib/bootstrap-table/locale/bootstrap-table-zh-CN.min",
    "lay-date": "assets/lib/laydate/laydate",
    "metisMenu": "assets/lib/metisMenu/jquery.metisMenu",
    "slimscroll": "assets/lib/slimscroll/jquery.slimscroll.min",
    "contabs": "assets/lib/contabs/contabs.min",
    'text': 'assets/lib/require/text',

    "jplayer": "assets/components/jplayer/jquery.jplayer.min",

    "videojs": "assets/components/videojs/video.min",
    "videojs-ie8": "assets/components/videojs/ie8/videojs-ie8.min",

    "rating": "assets/components/rating/jquery.barrating",
    "ckeditor": "assets/components/ckeditor/ckeditor",

    "umeditor": "assets/components/umeditor/lang/zh-cn/zh-cn",
    "umeditor-core": "assets/components/umeditor/umeditor",

    'ajax': 'assets/common/ajax_amd',
    'encrypt': 'assets/common/encrypt',
    "page-util": "assets/common/page-util",
    "util": "assets/common/util",
    "transfer": "assets/common/common-transfer",

    // "json": "../../js/lib/json2/1.0.0/json2",

    /* component */
    "loading": "assets/components/loading/loading",

    "dialog": "assets/lib/component/js/base/dialog",
    "tab": "assets/lib/component/js/base/tab",
    "tree": "assets/lib/component/js/base/tree",
    "grid": "assets/lib/component/js/base/grid",
    "select": "assets/lib/component/js/base/select",
    "date": "assets/lib/component/js/base/datechooser",
    "textinput": "assets/lib/component/js/base/textinput",
    "pagination": "assets/lib/component/js/base/pagination",
    "swapgrid": "assets/lib/component/js/customization/swapgrid",
    "magictree": "assets/lib/component/js/customization/magictree",
    "paradeground": "assets/lib/component/js/customization/paradeground",
    /* handlebar */
    'hdb': 'assets/lib/handlebars/handlebars',
    'hdbr': 'assets/lib/handlebars/handlebars.runtime',
    /* component */
    /*zTree*/
    "ztree-core": "assets/lib/ztree/js/jquery.ztree.core",
    "ztree-exedit": "assets/lib/ztree/js/jquery.ztree.exedit",
    "ztree-excheck": "assets/lib/ztree/js/jquery.ztree.excheck.min",
    "ztree-exhide": "assets/lib/ztree/js/jquery.ztree.exhide.min",
    /*zTree*/
    /*easyui*/
    "tabs": "assets/lib/easyui/src/jquery.tabs",
    /*easyui*/
    /*echarts*/
    "echarts": "assets/lib/echarts/echarts.min",
    /*echarts*/
    /* highcharts */
    "highcharts": "assets/lib/highcharts/highcharts",
    "exporting": "assets/lib/highcharts/modules/exporting",
    /* highcharts */
    "ZeroClipboard": "assets/components/uedit/third-party/zeroclipboard/ZeroClipboard.min",
    /*"js/homePage/components/crossAPI"*/
    "ZeroClipboard": "assets/components/uedit/third-party/zeroclipboard/ZeroClipboard.min",

    // 业务模块 开始
    "constants": "js/common/constants",
    "dateUtil": "js/common/dateUtil",
    "commonAjax": "js/common/common-ajax",
    /* crossAPI */
    "crossAPI": "js/common/crossAPI"
};

window.addEventListener("mousewheel", function (e) {
    if (e.deltaY === 1) {
        e.preventDefault();
    }
});

window._Config_ = {
    date: new Date()
};


/**
 * 避免data-main指定的js来自缓存
 */
var require = {
    urlArgs: "bust=" + new Date().getDate(),
    baseUrl: "../../",
    paths: requirePath,
    waitSeconds: 0,
    map: {
        "*": {style: "assets/lib/require/css"}
    },
    shim: {
        bootstrap: {
            deps: ["jquery"],
            exports: "bootstrap"
        },
        "bootstrap-table": {
            deps: ["jquery"],
            exports: "bootstrap-table"
        },
        "bootstrap-table-zh-CN": {
            deps: ["jquery"],
            exports: "bootstrap-table-zh-CN"
        },
        "bootstrap-select": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrap-select"
        },
        "bootstrap-select-zh-CN": {
            deps: ["jquery", "bootstrap"],
            exports: "bootstrap-select-zh-CN"
        },
        "lay-date": {
            deps: ["jquery"],
            exports: "lay-date"
        },
        "easyui-core": {
            deps: ["jquery"],
            exports: "easyui-core"
        },
        "easyui": {
            deps: ["easyui-core"],
            exports: "easyui"
        },
        "ztree-core": {
            deps: ["jquery"],
            exports: "ztree-core"
        },
        "ztree-exedit": {
            deps: ["ztree-core"],
            exports: "ztree"
        },
        "videojs": {
            deps: ["jquery"],
            exports: "videojs-ie8"
        },
        "rating": {
            deps: ["jquery"],
            exports: "rating"
        },
        "umeditor-core": {
            deps: [
                "assets/components/umeditor/third-party/jquery.min"
            ],
            exports: "umeditor-core"
        },

        "umeditor": {
            deps: [
                "assets/components/umeditor/third-party/jquery.min",
                "assets/components/umeditor/umeditor.config",
                "umeditor-core"

            ],
            exports: "umeditor"
        },

        "hdb": {exports: ["Handlebars"]},
        "hdbHelper": {deps: ["hdb"]}

    }
};