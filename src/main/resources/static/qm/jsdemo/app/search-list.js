define([
    "js/app/call-service",
    "hdb",
    "util",
    "text!html/app/search-list.hbs",
    "bootstrap",
], function (cs, hbs, Util, sl_tpl) {
    'use strict';

    //搜索热词
    $("#kc_search_hot_word span").click(function () {
        $("#key_word").val($(this).text());
    });

    //点击过滤按钮
    $(".kc-filter-btns span").click(function () {
        $(".kc-filter-btns span").removeClass("active");
        $(this).addClass("active");
    });

    //点击过滤标签
    $(".kc-filter-bages span").click(function () {
        $(".kc-filter-bages span").removeClass("active");
        $(this).addClass("active");
    });

    //点击过滤标签
    $(".kc-tab-bages span").click(function () {
        $(".kc-tab-bages span").removeClass("active");
        $(this).addClass("active");
        search_list_type(this.id);
    });

    //切换全文 标题 关键字
    var key_word_type = 0;
    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
        key_word_type = this.id;
        console.log(key_word_type);
    });


    // $('#kc_search_btn').click(function () {
    //   var key_word = $('#key_word').val();
    //   search_list(key_word);
    //   $("#kc_search_group").show();
    //   $("#kc_new_group").hide();
    // })


    //关键字查询
    var search_list_key = function (key_word) {

        var param = {
            "params": {
                "page": 1,
                "keyWord": key_word,
                "size": 10,
                "analysisType": "max",
                "indexName": "search_knowledges_771_1",
                "indexType": "search_knowledges",
                "searchInfo": "knowledgeName=5,klgAliasName=5,contents=1,bossCode=10,bossName=8",
                "highlightField": "knowledgeName,contents"
            },
            "beans": [{
                "column": "channelCode",
                "value": "1",
                "type": "any"
            }]
        };

        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.SEARCH_APP_DNS).concat("/keyWordsSearch"),
            //"http://192.168.16.3:9001/kc/search/appsvc/msa/keyWordsSearch",
            "post",
            param,
            function (data) {
                var search_arr = data.RSP.DATA;
                search_arr = JSON.parse(search_arr);
                _render_search(search_arr);
            }
        )
    };

    //知识目录查询
    var search_list_catlog = function (catlog_id) {

        var param = {
            "params": {
                "indexType": "search_knowledges",
                "indexName": "search_knowledges_771_1",
                "page": "1",
                "size": "10"
            },
            "beans": [{
                "column": "catalogId",
                "type": "any",
                "value": catlog_id
            }
            ]
        };

        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.SEARCH_APP_DNS).concat("/searchKMByKonwledgeCatlog"),
            //"http://192.168.16.3:9001/kc/search/appsvc/msa/searchKMByKonwledgeCatlog",
            "post",
            param,
            function (data) {
                var search_arr = data.RSP.DATA;
                search_arr = JSON.parse(search_arr);
                _render_search(search_arr);
            }
        )
    };


    //知识类型查询
    var search_list_type = function (type) {

        var param = {
            "params": {
                "indexType": "search_knowledges",
                "indexName": "search_knowledges_771_1",
                "page": "1",
                "size": "10"
            },
            "beans": [{
                "column": "knwlgType",
                "type": "array",
                "value": type
            }
            ]
        };

        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.SEARCH_APP_DNS).concat("/TemplateFilterCondition"),
            //"http://192.168.16.3:9001/kc/search/appsvc/msa/TemplateFilterCondition",
            "post",
            param,
            function (data) {
                var search_arr = data.RSP.DATA;
                search_arr = JSON.parse(search_arr);
                _render_search(search_arr);
            }
        )
    };

    //渲染模板
    var _render_search = function (search_obj) {

        hbs.registerHelper("checkType", function (knlwType) {
            switch (knlwType) {
                case 2:
                    return new hbs.SafeString('<span class="kc-search-tags tags-red">结</span>');
                    break;
                case 1:
                    return new hbs.SafeString('<span class="kc-search-tags tags-yellow">问</span>');
                    break;
                case 0:
                    return new hbs.SafeString('<span class="kc-search-tags tags-green">多</span>');
                    break;
            }
        })
        var template = hbs.compile(sl_tpl);
        var html = template(search_obj);
        $('#kc_search_result').html(html);
        $("#kc_search_group").show();
        $("#kc_new_group").hide();
    };


    return {
        search_list_key: search_list_key,
        search_list_catlog: search_list_catlog
    }

});