require(["jquery", 'util', "transfer", "easyui", "dateUtil"], function ($, Util, Transfer, easyui, dateUtil) {
    //初始化方法
    initialize();
    var reqParams = null,
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/workQmResultDetail.html";

    function initialize() {
        initPageInfo();
    }

    //页面信息初始化
    function initPageInfo() {

        var checkResult = getRequestObj();

        //质检历史列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '5%',
                    formatter: function (value, row, index) {
                        return "<a href='javascript:void(0);' id ='resultDetail_" + row.inspectionId + "'>详情</a>";
                    }
                },
                {field: 'touchId', title: '工单流水号', align: 'center', width: '15%'},
                {field: 'inspectionId', title: '质检流水号', align: 'center', width: '15%'},
                {field: 'originInspectionId', title: '原质检流水号', align: 'center', width: '15%'},
                {field: 'acceptNumber', title: '客户号码', align: 'center', width: '10%', hidden: true},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'checkedStaffId', title: '被质检人工号', align: 'center', width: '10%'},
                {field: 'checkedDepartId', title: '被质检人班组', align: 'center', width: '10%'},
                {
                    field: 'errorRank', title: '差错类型', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {'0': '无错误', '1': '绝对错误'}[value];
                    }
                },
                {field: 'finalScore', title: '质检得分', align: 'center', width: '10%'},
                {field: 'unqualifiedNum', title: '不合格环节数', align: 'center', width: '10%'},
                {field: 'checkStaffId', title: '质检人工号', align: 'center', width: '10%'},
                {
                    field: 'resultStatus', title: '申诉结果', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {
                            '0': '质检新生成', '1': '临时保存', '2': '放弃', '3': '复检', '4': '分检', '5': '被检人确认'
                            , '6': '系统自确认', '7': '申诉中', '8': '申诉通过', '9': '申诉驳回', '99': '系统驳回'
                        }[value];
                    }
                },
                {
                    field: 'checkEndTime', title: '质检时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        return DateUtil.formatDateTime(value);
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 500,
            pagination: false,
            rownumbers: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                reqParams = {
                    "originInspectionId": checkResult.originInspectionId
                };
                var params = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WORK_QM_RESULT + "/selectByParams", params, function (result) {
                    var data = {
                        rows: result.RSP.DATA
                    };
                    var dataNew = [];
                    for (var i = 0; i < data.rows.length; i++) {
                        var map = data.rows[i];
                        if (map.qmPlan != null) {
                            map["planName"] = map.qmPlan.planName;
                            dataNew.push(map);
                        }
                    }
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    }
                    success(dataNew);
                });
            },
            onLoadSuccess: function (data) {
                //详情
                $.each(data.rows, function (i, item) {
                    $("#resultDetail_" + item.inspectionId).on("click", function () {
                        var url = createURL(orderCheckDetail, item);
                        showDialog(url, "质检详情", 1200, 540);
                    });
                });
            }
        });
    }

    //拼接对象到url
    function createURL(url, param) {
        var urlLink = url;
        if (param != null) {
            $.each(param, function (item, value) {
                urlLink += '&' + item + "=" + encodeURI(value);
            });
            urlLink = url + "?" + urlLink.substr(1);
        }
        return urlLink.replace(' ', '');
    }

    //dialog弹框
    //url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层
    function showDialog(url, title, width, height) {
        var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>',
            dialogDiv = '<div id="orderCheckDetailDialog" title="' + title + '"></div>'; //style="overflow:hidden;"可以去掉滚动条
        $(document.body).append(dialogDiv);
        var win = $('#orderCheckDetailDialog').dialog({
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

    //获取url对象
    function getRequestObj() {
        var url = decodeURI(decodeURI(location.search)); //获取url中"?"符后的字串，使用了两次decodeRUI解码
        var requestObj = {};
        if (url.indexOf("?") > -1) {
            var str = url.substr(1),
                strArr = str.split("&");
            for (var i = 0; i < strArr.length; i++) {
                requestObj[strArr[i].split("=")[0]] = unescape(strArr[i].split("=")[1]);
            }
            return requestObj;
        }
    }

    return {
        initialize: initialize
    };
});