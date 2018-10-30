/**
 * 技能配置样例
 */
require(["jquery", "easyui"], function ($) {

    var $tab;

    var tabConfig = {
        el: this.tabs,
        tabs: {
            // "其他样例": {
            //     id: "other_tab_content",
            //     template: "otherDemo"
            // },
            "未审核知识": {
                id: "tab_content",
                template: "js/manage/noApprovedList"
            },
             "已审核知识": {
                id: "hasApprove_tab_content",
                template: "js/manage/hasApprovedList"
             },
           /* "上传样例": {
                id: "yfb_tab_content",
                template: "uploadDemo"
            },
            "查询页面样例": {
                id: "dfb_tab_content",
                template: "queryDemo"
            }*/

        }
    };


    // 初始化 dom
    addTabsContent();
    initializeTabs();


    /**
     * 添加Tab内容
     */
    function addTabsContent(){
        var tabs = tabConfig.tabs;
        var tabArray = ["<div id='t1ab1' class='easyui-tabs' style='width:100%; height:100%;'>"];
        for(var tabTitle in tabs){
            var tabItem = tabs[tabTitle];
            var tabId = tabItem["id"];
            tabArray.push("<div title='" + tabTitle + "'><div id='" + tabId + "' style='height:100%;'></div></div>");
        }

        tabArray.push("</div>");
        $tab = $(tabArray.join("")).appendTo("#page_content");
    }


    /**
     * 初始化Tab组件
     */
    function initializeTabs() {
        // $tab.find("div.easyui-tabs").tabs({
        $("#t1ab1").tabs({
            border: false,
            tabPosition: 'top',
            selected: 0,
            onSelect: function (title) {
                console.log(title + ' is selected');

                var currentTab = tabConfig.tabs[title];
                if (currentTab && $("#" + currentTab["id"]).children().length == 0) {
                    require([currentTab["template"]], function (tabModule) {
                        tabModule.initialize();
                    });
                }
            }
        });
    }

});
