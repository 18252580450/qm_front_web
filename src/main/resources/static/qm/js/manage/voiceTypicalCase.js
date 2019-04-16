require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function ($, Util, Transfer, CommonAjax) {

    var userInfo,
        caseTypeData = [],    //案例类型静态数据
        caseDetailUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/typicalCaseDetail.html";

    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {
        //典型案例下拉框
        $("#caseType").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var caseType = $("#caseType");
                var data = caseType.combobox('getData');
                if (data.length > 0) {
                    caseType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        CommonAjax.getStaticParams("TYPICAL_CASE_TYPE", function (datas) {
            if (datas) {
                caseTypeData = datas;
                var data = {
                    "paramsCode": "-1",
                    "paramsName": "全部"
                };
                datas.unshift(data);
                $("#caseType").combobox('loadData', datas);
            }
        });

        //典型案例列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#typicalCaseList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'detail', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "caseDetail_' + row.caseType + '" class="list_operation_color">详情</a>';
                    }
                },
                {
                    field: 'caseType', title: '案例类型', width: '45%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < caseTypeData.length; i++) {
                            if (caseTypeData[i].paramsCode === value) {
                                return caseTypeData[i].paramsName;
                            }
                        }
                    }
                },
                {field: 'caseNum', title: '条数', width: '45%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 480,
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
                    pageNum = param.rows,
                    caseType = $("#caseType").combobox("getValue");
                if (caseType === "-1") {
                    caseType = "";
                }
                var reqParams = {
                    "checkType": Util.constants.CHECK_TYPE_VOICE,
                    "caseType": caseType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.TYPICAL_CASE_DNS + "/queryTypicalCase", params, function (result) {
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
                //详情
                $.each(data.rows, function (i, item) {
                    $("#caseDetail_" + item.caseType).on("click", function () {
                        var url = caseDetailUrl + "?checkType=" + Util.constants.CHECK_TYPE_VOICE + "&caseType=" + item.caseType;
                        CommonAjax.closeMenuByNameAndId("典型案例_详情", "典型案例_详情");
                        CommonAjax.openMenu(url, "典型案例_详情", "典型案例_详情");
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#typicalCaseList").datagrid("load");
        });

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
            var id = delRows[i].caseType;
            delArr.push(id);
        }
        var params = {
            "delType": "0",  //删除指定类型
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

    return {
        initialize: initialize
    };
});