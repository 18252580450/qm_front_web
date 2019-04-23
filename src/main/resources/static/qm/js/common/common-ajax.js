/*
 * 保存所有的公共事件
 * @author shiying
 */
define(["jquery", 'util'], function ($, Util) {
    var objClass = function () {
    };
    objClass.prototype = {
        //获取静态数据
        getStaticParams: function (paramsTypeId, callback) {
            var datas = [];
            var reqParams = {
                "tenantId": Util.constants.TENANT_ID,
                "paramsTypeId": paramsTypeId
            };
            var params = {
                "start": 0,
                "pageNum": 0,
                "params": JSON.stringify(reqParams)
            };
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode === "1") {
                    datas = result.RSP.DATA;
                }
                callback(datas);
            });

        },
        //url参数拼接
        createURL: function (url, param) {
            var urlLink = "";
            if (param != null) {
                $.each(param, function (item, value) {
                    urlLink += '&' + item + "=" + encodeURI(value);
                });
                urlLink = url + "?" + urlLink.substr(1);
            }
            return urlLink.replace(' ', '');
        },
        //获取url传递参数
        getUrlParams: function (callback) {
            var url = decodeURI(decodeURI(location.search)); //获取url中"?"符后的字串，使用了两次decodeRUI解码
            var requestObj = {};
            if (url.indexOf("?") > -1) {
                var str = url.substr(1),
                    strArr = str.split("&");
                for (var i = 0; i < strArr.length; i++) {
                    requestObj[strArr[i].split("=")[0]] = unescape(strArr[i].split("=")[1]);
                }
                callback(requestObj);
            }
        },
        //新增标签页
        openMenu: function (url, menuName, menuId) {
            operMenu(url, menuName, menuId);//测试Tab
            // openTab(url, menuName);//本地Tab
        },
        //关闭指定标签页
        closeMenuByNameAndId: function (menuName, menuId) {
            operMenu(null, menuName, menuId);//测试Tab
            // closeTab(menuName);//本地Tab
        },
        //刷新指定标签页
        refreshMenuByUrl: function (url, menuName, menuId) {
            operMenu(url, null, null);//测试Tab
            operMenu(url, menuName, menuId);//测试Tab
            // refreshTab(menuName);//本地Tab
        },
        //dialog弹框
        //url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层
        showDialog: function (url, title, width, height) {
            var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>',
                dialogDiv = '<div id="dialogDiv" title="' + title + '"></div>'; //style="overflow:hidden;"可以去掉滚动条
            $(document.body).append(dialogDiv);
            var win = $('#dialogDiv').dialog({
                content: content,
                width: width,
                height: height,
                modal: true,
                title: title,
                onClose: function () {
                    $(this).dialog('destroy');//后面可以关闭后的事件
                }
            });
            win.dialog('open');
        }
    };

    //操作标签页
    function operMenu(url, menuName, menuId) {
        var operParam = {
            "url": url,
            "menuName": menuName,
            "menuId": menuId
        };
        top.postMessage(operParam, '*');
    }

    //新增标签页dev
    function openTab(url, tabName) {
        var jq = top.jQuery;
        if (!jq('#tabs').tabs('exists', tabName)) {
            jq('#tabs').tabs('add', {
                title: tabName,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: true
            });
        } else {
            jq('#tabs').tabs('select', tabName);
        }
    }

    //关闭标签页dev
    function closeTab(tabName) {
        var jq = top.jQuery;
        //刷新语音质检待办区
        jq('#tabs').tabs('close', tabName);
    }

    //刷新标签页dev
    function refreshTab(tabName) {
        var tab = jq('#tabs').tabs('getTab', tabName),
            iframe = jq(tab.panel('options').content),
            content = '<iframe scrolling="auto" frameborder="0"  src="' + iframe.attr('src') + '" style="width:100%;height:100%;"></iframe>';
        jq('#tabs').tabs('update', {
            tab: tab,
            options: {content: content, closable: true}
        });
    }

    return new objClass();
});
