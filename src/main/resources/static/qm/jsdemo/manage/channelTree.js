define(["jquery", 'util', "catalogTemplateInteractive", "easyui", 'ztree-exedit'], function ($, Util, Interactive) {

    var initChannelTextBox = function (option) {
        option.$textBox.textbox({
            // buttonText: "选择",
            // iconCls: 'icon-man',
            cls: "channelCode",
            onClickButton: function () {
                $("#" + option.windowId).empty();
                initChannelWindow(option);
            }
        });
    };

    function initChannelWindow(option) {
        var options = $.extend({
            width: 400,
            height: 300,
            title: "渠道"
        }, option);
        showWindow(options);
        addWindowFooter(options);
        initChannelTree(options);
        bindChannelTreeEvent(options);
    }

    function showWindow(options) {
        $("#" + options.windowId).show().window({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            tools: [
                {
                    iconCls: 'icon-ok',
                    handler: function () {
                    }
                }, {
                    iconCls: 'icon-cancel',
                    handler: function () {
                    }
                }]
        });
    }

    function addWindowFooter(options) {
        $("<div id='" + options.contentId + "' style='height: 80%;'></div><div id='" + options.footerId + "'></div>").appendTo($("#" + options.windowId));
        $([
            "<div>",
            "<a href='javascript:void(0)' id='sureChannel' class='btn btn-green radius  mt-l-20'>确定</a>",
            "<a href='javascript:void(0)' id='cancelChannel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>"
        ].join("")).appendTo($("#" + options.footerId));
    }

    function initChannelTree(options) {
        var channelType = 'NGKM.TEMPLET.CHNL';
        var channelList = Interactive.getStaticDataByTypeId(channelType);
        var channelNodes = [];
        var selectedChannelStr = options.$textBox.textbox("getValue").trim();
        var selectedChannelArr = selectedChannelStr.length == 0 ? [] : selectedChannelStr.split(",");
        $.each(channelList, function (index, channel) {
            var channelChecked = false;
            if (selectedChannelArr.length == 0 || selectedChannelArr.indexOf(channel.CODENAME) != -1) {
                channelChecked = true;
            }
            channelNodes.push({
                "id": channel.CODEVALUE,
                "text": channel.CODENAME,
                "checked": channelChecked,
                "iconCls": "icon-ok"
            });
        });
        $("#" + options.contentId).tree({
            url: "",
            queryParams: {},
            method: "GET",
            animate: true,
            lines: true,
            textField: 'json',
            panelHeight: '110px',
            editable: false,
            checkbox: true,
            onCheck: function (node) {

            },
            loadFilter: function (data, parent) {
                return data;
            },
            loader: function (param, success, error) {
                success(channelNodes);
            }
        });
    }

    function bindChannelTreeEvent(options) {
        /**
         * 绑定确认选择渠道事件
         */
        $("#" + options.footerId).on("click", "#sureChannel", function () {
            var checkNodes = $("#" + options.contentId).tree("getChecked");
            if (null == checkNodes || checkNodes.length == 0) {
                $.messager.alert("温馨提示", "请至少选择一个渠道");
                return;
            }
            var channelVal = "";
            $.each(checkNodes, function (index, node) {
                channelVal = channelVal.concat(node.text);
                channelVal = channelVal.concat(",");
            });
            channelVal = channelVal.slice(0, channelVal.length - 1);
            options.$textBox.textbox("setValue", channelVal);
            $("a.panel-tool-close").click();
        });

        /**
         * 绑定取消选择渠道事件
         */
        $("#" + options.footerId).on("click", "#cancelChannel", function () {
            $("a.panel-tool-close").click();
        });
    }

    return {
        initChannelTextBox: initChannelTextBox
    }
});