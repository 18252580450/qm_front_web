define([
    "js/app/call-service",
    "hdb",
    "util",
    "text!html/app/new-list.hbs"
], function (cs, hbs, Util, nl_tpl) {
    'use strict';

    //最近更新
    var param_1 = {
        "params": {
            "indexType": "search_knowledges",
            "indexName": "search_knowledges_771_1",
            "page": "1",
            "size": "10"
        },
        "beans": [
            {
                "column": "klgStatus",
                "type": "any",
                "value": "1P" //最新发布状态
            },
            /*{
                "column": "klgStatus",
                "type": "any",
                "value": "2P"           //最近更新状态
            }*/
        ]
    };

    //最近更新/最近发布
    var new_list = function () {
        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.SEARCH_APP_DNS).concat("/getLatestPubDoc"),
            //"http://192.168.16.3:9001/kc/search/appsvc/msa/busisearch/getLatestPubDoc",
            "post",
            param_1,
            function (data) {
                var new_arr = data.RSP.DATA;
                let new_obj = {};
                new_arr = JSON.parse(new_arr);
                new_obj.data = new_arr;
                _render_new(new_obj.data);
            }
        )
    };


    //最近热门
    var currentHot = {
        "params": {
            "indexType": "search_knowledges",
            "indexName": "search_knowledges_771_1",
            "page": "1",
            "size": "10",
            "sortField": "click_today=DESC"
        },
        "beans": []
    };

    //最近热门
    var hot_list = function () {
        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.SEARCH_APP_DNS).concat("/hotKnowledge"),
            //"http://192.168.16.3:9001/kc/search/appsvc/msa/busisearch/hotKnowledge",
            "post",
            currentHot,
            function (data) {
                var new_arr = data.RSP.DATA;
                new_arr = JSON.parse(new_arr);
                _render_hot(new_arr);
            }
        )
    }

    //渲染最近更新/最新发布模板
    var _render_new = function (new_arr) {
        var template = hbs.compile(nl_tpl);
        var html = template(new_arr);
        $('#hbs_kc_new').html(html);
        $('#hbs_kc_issue').html(html);
    }

    //渲染今日热门模板
    var _render_hot = function (new_arr) {
        var template = hbs.compile(nl_tpl);
        var html = template(new_arr);
        $('#hbs_kc_hot').html(html);
    }

    return {
        new_list: new_list,
        hot_list: hot_list
    }

});

// var k = {"querySplit":["独孤求败"],"document":[{"klgAliasName":"","knowledgePath":"10300000,","resPersonId":"","suggestWord":"独孤求败","knowledgeName":"<span class=keywords>独孤求败<\/span>","invildTime":"2018-10-16 00:00:00","knwlgType":"0","templateId":"2","versionNumber":"V1","nowTime":"2018-10-16 11:45:37","knowledgeId":"1810161052150000053","rangeId":"771","operPersonId":"test","catalogId":"10300000,","klgStatus":"2P","createTime":"2018-10-16 10:52:27","modTime":"2018-10-16 10:52:27","contents":"请输入来电显示功能请输入套餐内短/彩信请输入来电显示费用请输入套餐外短彩信费用请输入套餐内通话请输入套餐外通话费用请输入套餐外流量费用请输入套餐接听范围请输入产品特权请输入套餐外其他费用请输入必选业务请输入套餐内流量请输入套餐月费请输入SP业务规则请输入短彩包叠加规则请输入短信网龄升级计划请输入流量包叠加规则请输入主副卡叠加规则请输入激活方式请输入激活渠道请","efftTime":"2018-10-16 00:00:00","startTime":"2018-10-16 10:59:29","endTime":"2018-10-16 10:59:29","_id":"1810161052150000053","channelCode":"1"},{"klgAliasName":"","knowledgePath":"10301000,10101000,10100000,10300000,","resPersonId":"","suggestWord":"独孤九剑","knowledgeName":"独孤九剑","invildTime":"2018-10-16 00:00:00","knwlgType":"0","templateId":"2","versionNumber":"V1","nowTime":"2018-10-16 11:45:37","knowledgeId":"1810161101030000055","rangeId":"771","operPersonId":"test","catalogId":"10301000,10101000,10100000,10300000,","klgStatus":"1P","createTime":"2018-10-16 11:01:06","modTime":"2018-10-16 11:01:06","contents":"0.59014832903718980.117872523743671960.63778139617452510.76853099639026450.4837868658801110.72041892804721040.148513424096684550.99590044636375330.71615126678464410.668407433958491","efftTime":"2018-10-16 00:00:00","startTime":"2018-10-16 11:01:26","endTime":"2018-10-16 11:01:26","_id":"1810161101030000055","channelCode":"1"}],"aggrs":[],"total":2};

// console.log(JSON.parse(k));