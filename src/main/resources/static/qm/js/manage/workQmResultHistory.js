define(["text!html/manage/workQmResultHistory.tpl", "jquery", 'util', "transfer", "commonAjax", "easyui", "dateUtil"], function (qryQmHistoryTpl, $, Util, Transfer, CommonAjax) {
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
                        return '<a href="javascript:void(0);" class="list_operation_color" id = "resultDetail_' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'checkStaffName', title: '质检人', width: '15%'},
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
                        var param = {
                            "provinceId": item.provinceId,
                            "touchId": item.touchId,
                            "inspectionId": item.inspectionId,
                            "templateId": item.templateId
                        };
                        var url = CommonAjax.createURL(orderCheckDetail, param);
                        CommonAjax.showDialog(url, "质检详情", 1000, Util.constants.DIALOG_HEIGHT_SMALL);
                    });
                });
            }
        });
    }

    return {
        initialize: initialize
    };
});