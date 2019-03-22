define(["text!html/manage/workQmResultHistory.tpl", "jquery", 'util', "transfer", "easyui", "dateUtil"], function (qryQmHistoryTpl, $, Util, Transfer, easyui, dateUtil) {
    var $el,
        touchId,    //工单流水
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/workQmResultDetail.html";

    function initialize(workFormId) {
        $el = $(qryQmHistoryTpl);
        touchId = workFormId;
        initPageInfo();

        this.$el = $el;
    }

    //页面信息初始化
    function initPageInfo() {
        //质检历史列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#queryInfo", $el).datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'inspectionId', title: '质检流水号', width: '20%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "resultDetail_' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'checkedStaffId', title: '被质检人工号', width: '15%'},
                {field: 'checkedDepartId', title: '被质检人班组', width: '15%'},
                {
                    field: 'checkEndTime', title: '质检时间', width: '20%',
                    formatter: function (value, row, index) { //格式化时间格式
                        return DateUtil.formatDateTime(value);
                    }
                },
                {
                    field: 'errorRank', title: '差错类型', width: '10%',
                    formatter: function (value, row, index) {
                        return {'0': '无错误', '1': '绝对错误'}[value];
                    }
                },
                {field: 'finalScore', title: '质检得分', width: '10%'},
                {field: 'unqualifiedNum', title: '不合格环节数', width: '10%'},
                {field: 'checkStaffId', title: '质检人工号', width: '15%'},
                {
                    field: 'resultStatus', title: '质检状态', width: '10%',
                    formatter: function (value, row, index) {
                        return {
                            '0': '质检新生成', '1': '临时保存', '2': '放弃', '3': '复检', '4': '分检', '5': '被检人确认'
                            , '6': '系统自确认', '7': '申诉中', '8': '申诉通过', '9': '申诉驳回', '99': '系统驳回'
                        }[value];
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 440,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo", $el).datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo", $el).datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;
                var reqParams = {
                    "touchId": touchId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo", $el)));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WORK_QM_RESULT + "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    for (var i = 0; i < data.rows.length; i++) {
                        if (data.rows[i].qmPlan != null) {
                            data.rows[i]["planName"] = data.rows[i].qmPlan.planName;
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
                    success(data);
                });
            },
            onLoadSuccess: function (data) {
                //详情
                $.each(data.rows, function (i, item) {
                    $("#resultDetail_" + item.inspectionId, $el).on("click", function () {
                        var url = createURL(orderCheckDetail, item);
                        showDialog(url, "质检详情", 1000, 580);
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

    return {
        initialize: initialize
    };
});