require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function ($, Util, Transfer, CommonAjax) {

    var caseInfo,  //案例信息
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/workCaseDetail.html";

    initialize();

    function initialize() {
        CommonAjax.getUrlParams(function (data) {
            caseInfo = data;
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {

        //典型案例列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#typicalCaseList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'touchId', title: '接触流水', width: '25%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" class="list_operation_color" id = "checkDetail_' + row.touchId + '">' + value + '</a>';
                    }
                },
                {field: 'caseTitle', title: '案例标题', width: '25%'},
                {field: 'checkStaffId', title: '质检员工号', width: '25%'},
                {field: 'createReason', title: '添加原因', width: '25%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 580,
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
                    $("#typicalCaseList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#typicalCaseList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;

                var reqParams = {
                    "checkType": caseInfo.checkType,
                    "caseType": caseInfo.caseType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.TYPICAL_CASE_DNS + "/queryTypicalCaseDetail", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
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
                //质检详情
                $.each(data.rows, function (i, item) {
                    $("#checkDetail_" + item.touchId).on("click", function () {
                        showCheckDetail("工单详情", item, orderCheckDetail, 1000, Util.constants.DIALOG_HEIGHT);
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //删除
        $("#delBtn").on("click", function () {
            caseDeleteDialog();
        });
    }

    /**
     * 删除确认弹框
     */
    function caseDeleteDialog() {
        var delRows = $("#typicalCaseList").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].caseId;
            delArr.push(id);
        }
        var params = {
            "delType": "1",  //删除具体案例
            "delArr": delArr
        };
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.TYPICAL_CASE_DNS).concat("/"), JSON.stringify(params), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#typicalCaseList").datagrid("load"); //删除成功后，刷新页面
                    }
                });
            }
        });
    }

    //质检详情弹框
    function showCheckDetail(title, item, url, width, height) {
        var param = {
            "provinceId": item.provinceId,
            "touchId": item.touchId
        };
        var checkUrl = CommonAjax.createURL(url, param);
        CommonAjax.showDialog(checkUrl, title, width, height);
    }

    return {
        initialize: initialize
    };
});