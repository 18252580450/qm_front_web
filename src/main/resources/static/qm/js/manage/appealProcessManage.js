require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function ($, Util, Transfer, CommonAjax) {

    var userInfo,
        processStatusData = [],   //流程状态下拉框静态数据
        checkTypeData = [],       //质检类型静态数据
        processAddUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessAdd.html",
        processEditUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessEdit.html";

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
        //模板渠道下拉框
        $("#tenantType").combobox({
            url: '../../data/tenant_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var tenantType = $("#tenantType");
                var data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].codeValue);
                }
            }
        });

        //质检类型下拉框
        $("#checkType").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var checkType = $("#checkType");
                var data = checkType.combobox('getData');
                if (data.length > 0) {
                    checkType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        CommonAjax.getStaticParams("CHECK_TYPE", function (datas) {
            if (datas) {
                checkTypeData = datas;
                var data = {
                    "paramsCode": "-1",
                    "paramsName": "全部"
                };
                datas.unshift(data);
                $("#checkType").combobox('loadData', datas);
            }
        });

        //流程状态下拉框
        $("#processStatus").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var processStatus = $("#processStatus");
                var data = processStatus.combobox('getData');
                if (data.length > 0) {
                    processStatus.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        CommonAjax.getStaticParams("PROCESS_STATUS", function (datas) {
            if (datas) {
                processStatusData = datas;
                var data = {
                    "paramsCode": "-1",
                    "paramsName": "全部"
                };
                datas.unshift(data);
                $("#processStatus").combobox('loadData', datas);
            }
        });

        //时间控件初始化
        $('#createTimeBegin').datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#createTimeBegin").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onSelect: function (beginDate) {
                $('#createTimeEnd').datetimebox().datetimebox('calendar').calendar({
                    validator: function (date) {
                        return beginDate <= date;
                    }
                })
            }
        });

        $('#createTimeEnd').datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#createTimeEnd").datetimebox("spinner").timespinner("setValue", "23:59:59");
            }
        });

        //申诉主流程列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#appealProcessList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'detail', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "processDetail' + row.processId + '" class="list_operation_color">详情</a>';
                        var edit = '<a href="javascript:void(0);" id = "processEdit' + row.processId + '" class="list_operation_color">修改</a>';
                        return detail + "&nbsp;&nbsp;" + edit;
                    }
                },
                {
                    field: 'checkType', title: '质检类型', width: '10%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < checkTypeData.length; i++) {
                            if (checkTypeData[i].paramsCode === value) {
                                return '<span title=' + checkTypeData[i].paramsName + '>' + checkTypeData[i].paramsName + '</span>';
                            }
                        }
                    }
                },
                {
                    field: 'processId', title: '流程编码', width: '15%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }
                },
                {
                    field: 'processName', title: '流程名称', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }
                },
                {
                    field: 'departmentName', title: '部门', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }
                },
                {
                    field: 'processStatus', title: '流程状态', width: '7%',
                    formatter: function (value, row, index) {
                        var processStatus = "";
                        if (processStatusData.length !== 0) {
                            for (var i = 0; i < processStatusData.length; i++) {
                                if (processStatusData[i].paramsCode === value) {
                                    processStatus = processStatusData[i].paramsName;
                                    break;
                                }
                            }
                        }
                        return '<span title=' + processStatus + '>' + processStatus + '</span>';
                    }
                },
                {
                    field: 'createTime', title: '创建时间', width: '20%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.createTime != null) {
                            var createTime = DateUtil.formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealProcessList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealProcessList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows,
                    processId = $("#processId").val(),
                    processName = $("#processName").val(),
                    checkType = $("#checkType").combobox("getValue"),
                    processStatus = $("#processStatus").combobox("getValue"),
                    createTimeBegin = $("#createTimeBegin").datetimebox("getValue"),
                    createTimeEnd = $("#createTimeEnd").datetimebox("getValue");
                if (checkType === "-1") {
                    checkType = "";
                }
                if (processStatus === "-1") {
                    processStatus = "";
                }

                var reqParams = {
                    "mainProcessFlag": "0",
                    "processId": processId,
                    "processName": processName,
                    "tenantId": Util.constants.TENANT_ID,
                    "checkType": checkType,
                    "processStatus": processStatus,
                    "createTimeBegin": createTimeBegin,
                    "createTimeEnd": createTimeEnd
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcess", params, function (result) {
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
                    $("#processDetail" + item.processId).on("click", function () {
                        showAppealProcessDetail(item);
                    });
                });
                //修改
                $.each(data.rows, function (i, item) {
                    $("#processEdit" + item.processId).on("click", function () {
                        if (item.processStatus === Util.constants.PROCESS_STATUS_START) {
                            $.messager.alert("提示", "已启动的流程不允许修改!");
                            return;
                        }
                        var url = CommonAjax.createURL(processEditUrl, item);
                        CommonAjax.openMenu(url, "申诉流程修改", item.processId);
                    });
                });
            },
            //双击显示详情
            onDblClickRow: function (index, data) {
                showAppealProcessDetail(data);
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#appealProcessList").datagrid("load");
        });

        //重置
        $("#resetBtn").on("click", function () {
            $("#searchForm").form('clear');
            $("#checkType").combobox("setValue", checkTypeData[0].paramsCode);
            $("#processStatus").combobox("setValue", processStatusData[0].paramsCode);
        });

        //新增
        $("#addBtn").on("click", function () {
            var url = CommonAjax.createURL(processAddUrl, userInfo);
            // addTabs("申诉流程-新增", url);
            CommonAjax.openMenu(url, "申诉流程新增", "申诉流程新增");
        });

        //删除
        $("#delBtn").on("click", function () {
            showAppealProcessDeleteDialog();
        });

        //启动
        $("#startBtn").on("click", function () {
            changeProcessStatus(Util.constants.PROCESS_STATUS_START);
        });

        //暂停
        $("#stopBtn").on("click", function () {
            changeProcessStatus(Util.constants.PROCESS_STATUS_PAUSE);
        });
    }

    //审批流程详情
    function showAppealProcessDetail(data) {
        $("#appealLeftDiv").empty();
        $("#appealRightDiv").empty();
        $("#appealRecordDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "流程详情"
        });

        //查询审批流程
        var reqParams = {
            "processId": data.processId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.loading.showLoading();
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcessDetail", params, function (result) {
            Util.loading.destroyLoading();
            var processData = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            } else {
                showAppealProcess(processData);
            }
        });
    }

    /**
     * 删除申诉流程确认弹框
     */
    function showAppealProcessDeleteDialog() {
        var delRows = $("#appealProcessList").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].processId;
            delArr.push(id);
            if (delRows[i].processStatus === "1") {
                $.messager.alert("提示", "删除失败！已启动的流程不能删除!");
                return;
            }
        }
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.APPEAL_PROCESS_CONFIG_DNS).concat("/").concat(delArr), {}, function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#appealProcessList").datagrid("load"); //删除成功后，刷新页面
                    }
                });
            }
        });
    }

    //启动流程or暂停流程（针对主流程）
    function changeProcessStatus(processStatus) {
        var updateRows = $("#appealProcessList").datagrid("getSelections");
        if (updateRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return;
        }

        var status = "";
        if (processStatus === "1") {
            status = "启动";
        } else {
            status = "暂停";
        }
        $.messager.confirm('提示', '确定要' + status + '流程？', function (confirm) {
            if (confirm) {
                var processList = [];
                //筛选出状态需要改变的流程
                for (var i = 0; i < updateRows.length; i++) {
                    if (updateRows[i].processStatus != null && updateRows[i].processStatus !== processStatus) {
                        processList.push(updateRows[i]);
                    }
                }
                if (processList.length === 0) {
                    $.messager.alert("提示", "流程已" + status + "!");
                    return;
                }
                var params = {
                    "processStatus": processStatus,
                    "processList": processList
                };

                Util.ajax.putJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/changeProcessStatus", JSON.stringify(params), function (result) {
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                        $("#appealProcessList").datagrid('load'); //流程状态更新成功后，刷新页面
                    } else {
                        $.messager.alert("提示", result.RSP.RSP_DESC);
                    }
                });
            }
        });
    }

    //校验开始时间和终止时间
    function checkBeginEndTime() {
        var beginTime = $("#createTimeBegin").datetimebox("getValue");
        var endTime = $("#createTimeEnd").datetimebox("getValue");
        var d1 = new Date(beginTime.replace(/-/g, "\/"));
        var d2 = new Date(endTime.replace(/-/g, "\/"));

        if (beginTime !== "" && endTime !== "" && d1 > d2) {
            $.messager.show({
                msg: "开始时间不能大于结束时间!",
                timeout: 1000,
                showType: 'show',
                style: {
                    right: '',
                    top: document.body.scrollTop + document.documentElement.scrollTop,
                    bottom: ''
                }
            });
        }
    }

    //显示审批记录
    function showAppealProcess(data) {
        var leftDiv = $("#appealLeftDiv"),
            rightDiv = $("#appealRightDiv");
        $.each(data, function (i, item) {
            if (i > 0) {
                leftDiv.append(getProcessLine());
            }
            leftDiv.append(getLeftDiv());
            rightDiv.append(getRightDiv(item));
        });
    }

    //左侧操作区域
    function getLeftDiv() {
        return '<div class="panel-transparent"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-8"><div class="fl text-small"></div></div>' +
            '<div class="formControls col-4"><div class="circle"></div></div>' +
            '</div></form></div>';
    }

    //左侧流程线
    function getProcessLine() {
        return '<form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-8" style="margin-left: 8px"><div class="process-line cl"></div></div>' +
            '</div></form>';
    }

    //右侧流程处理过程列表
    function getRightDiv(item) {
        return '<div style="margin-bottom:30px;">' +
            '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-12"><div class="fl text-small">子节点：' + item.nodeName + '</div></div>' +
            '</div></form></div>' +
            '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-12"><div class="fl text-small">审批人：' + item.userName + '</div></div>' +
            '</div></form></div>' +
            '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-12"><div class="fl text-small">部门：' + item.departmentName + '</div></div>' +
            '</div></form></div>' +
            '</div>';
    }

    return {
        initialize: initialize
    };
});