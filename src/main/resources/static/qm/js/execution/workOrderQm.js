require(["jquery", 'util', "transfer", "easyui","dateUtil"], function ($, Util, Transfer,easyui,dateUtil) {

    //初始化方法
    initialize();

    function initialize() {
        initPageInfo();
        // initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //是否分配下拉框
        $("#isDis").combobox({
            url: '../../data/isDistribution.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isDis = $("#isDis");
                var data = isDis.combobox('getData');
                if (data.length > 0) {
                    isDis.combobox('select', data[0].codeValue);
                }
            }
        });

        //时间控件初始化
        var planStartTime = $('#planStartTime');
        var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        planStartTime.datetimebox({
            value: beginDate,
            onChange: function () {
                checkTime();
            }
        });

        var planEndTime = $('#planEndTime');
        var endDate = (DateUtil.formatDateTime(new Date())).substr(0,11) + "23:59:59";
        planEndTime.datetimebox({
            value: endDate,
            onChange: function () {
                checkTime();
            }
        });

        var distStartTime = $('#distStartTime');
        var beginDate2 = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        distStartTime.datetimebox({
            value: beginDate2,
            onChange: function () {
                checkTime();
            }
        });

        var distEndTime = $('#distEndTime');
        var endDate2 = (DateUtil.formatDateTime(new Date())).substr(0,11) + "23:59:59";
        distEndTime.datetimebox({
            value: endDate2,
                onChange: function () {
                    checkTime();
            }
        });

        //申诉流程列表
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'workFormId', title: '工单流水', align: 'center', width: '15%',
                formater:function(value, row, index){
                    var bean={};
                    return "<a href='javascript:void(0);' class='processIdBtn' id =" + JSON.stringify(bean) + " >"+value+"</a>";
                }},
                {field: 'processName', title: '计划名称', align: 'center', width: '10%'},
                {
                    field: 'createTime', title: '计划生成时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.createTime != null) {
                            var createTime = DateUtil.formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
                    }
                },
                {field: 'createStaffId', title: '服务请求类型', align: 'center', width: '10%'},
                {field: 'tenantId', title: '考评环节', align: 'center', width: '10%'},
                {field: 'poolStatus', title: '是否分配', align: 'center', width: '10%'},
                {field: 'operateStaffId', title: '质检员', align: 'center', width: '10%'},
                {
                    field: 'operateTime', title: '分配时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.modifyTime != null) {
                            var modifyTime = DateUtil.formatDateTime(row.modifyTime)
                            return '<span title=' + modifyTime + '>' + modifyTime + '</span>';
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
            rownumbers: false,
            // loader: function (param, success) {
            //     var start = (param.page - 1) * param.rows;
            //     var pageNum = param.rows;
            //     var processId = $("#processId").val();
            //     var processName = $("#processName").val();
            //     var createStaffId = $("#createStaffName").val();
            //     var tenantId = $("#tenantType").combobox("getValue");
            //     var processStatus = $("#processStatus").combobox("getValue");
            //     var createTimeBegin = $("#createTimeBegin").datetimebox("getValue");
            //     var createTimeEnd = $("#createTimeEnd").datetimebox("getValue");
            //     if (processStatus === "-1") {
            //         processStatus = null;
            //     }
            //
            //     var reqParams = {
            //         "processId": processId,
            //         "processName": processName,
            //         "createStaffId": createStaffId,
            //         "tenantId": tenantId,
            //         "processStatus": processStatus,
            //         "createTimeBegin": createTimeBegin,
            //         "createTimeEnd": createTimeEnd
            //     };
            //     var params = $.extend({
            //         "start": start,
            //         "pageNum": pageNum,
            //         "params": JSON.stringify(reqParams)
            //     }, Util.PageUtil.getParams($("#searchForm")));
            //
            //     Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcess", params, function (result) {
            //         var data = Transfer.DataGrid.transfer(result);
            //
            //         var rspCode = result.RSP.RSP_CODE;
            //         if (rspCode != null && rspCode !== "1") {
            //             $.messager.show({
            //                 msg: result.RSP.RSP_DESC,
            //                 timeout: 1000,
            //                 style: {right: '', bottom: ''},     //居中显示
            //                 showType: 'show'
            //             });
            //         }
            //         success(data);
            //     });
            // },
            onLoadSuccess: function (data) {
                //详情
                $.each(data.rows, function (i, item) {

                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#appealProcessList").datagrid("load");
        });

        //新增
        $("#addBtn").on("click", function () {
            addTabs("申诉流程-新增", Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessAdd.html")
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
            changeProcessStatus(Util.constants.PROCESS_STATUS_STOP);
        });
    }

    /**
     * 删除申诉流程确认弹框
     */
    function showAppealProcessDeleteDialog() {
        var delRows = $("#appealProcessList").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].processId;
            delArr.push(id);
            if (delRows[i].processStatus === "1") {
                $.messager.alert("提示", "删除失败！已启动的流程不能删除!");
                return false;
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
            return false;
        }

        //剔除状态不需要更改的流程
        for (var i = 0; i < updateRows.length; i++) {
            if (updateRows[i].processStatus != null && updateRows[i].processStatus === processStatus) {
                updateRows.splice(i, 1);
                i--;
            } else {
                updateRows[i].processStatus = processStatus;
            }
        }

        if (updateRows.length === 0) {
            if (processStatus === "1") {
                $.messager.alert("提示", "流程已启动!");
            } else {
                $.messager.alert("提示", "流程已暂停!");
            }
            return false;
        }

        Util.ajax.putJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/changeProcessStatus", JSON.stringify(updateRows), function (result) {
            $.messager.show({
                msg: result.RSP.RSP_DESC,
                timeout: 1000,
                style: {right: '', bottom: ''},     //居中显示
                showType: 'show'
            });
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {
                $("#appealProcessList").datagrid('load'); //流程状态更新成功后，刷新页面
            }
        });
    }

    //校验开始时间和终止时间
    function checkTime() {
        var planStartTime = $("#planStartTime").datetimebox("getValue");
        var planEndTime = $("#planEndTime").datetimebox("getValue");
        checkBeginEndTime(planStartTime,planEndTime);
        var distStartTime = $("#distStartTime").datetimebox("getValue");
        var distEndTime = $("#distEndTime").datetimebox("getValue");
        checkBeginEndTime(distStartTime,distEndTime);
    }

    function checkBeginEndTime(startTime,endTime){
        var d1 = new Date(startTime.replace(/-/g, "\/"));
        var d2 = new Date(endTime.replace(/-/g, "\/"));

        if (startTime !== "" && endTime !== "" && d1 > d2) {
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

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;

        if (!jq('#tabs').tabs('exists', title)) {
            jq('#tabs').tabs('add', {
                title: title,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: true
            });
        } else {
            jq('#tabs').tabs('select', title);
        }
    }

    /**
     * 下拉框数据重载
     */
    function reloadSelectData(paramsType, select, showAll) {
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "paramsTypeId": paramsType
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode === "1") {
                var selectData = result.RSP.DATA;
                if (showAll) {
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    selectData.unshift(data);
                }
                $("#" + select).combobox('loadData', selectData);
            }
        });
    }

    //点击后添加页面
    $("#page").on("click", "a.processIdBtn", function () {

        addTabs("工单质检详情","");
    });

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;//顶层的window对象.取得整个父页面对象
        //重写jndex.js中的方法
        if (!jq('#tabs').tabs('exists', title)) {
            jq('#tabs').tabs('add', {
                title: title,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: true
            });
        } else {
            jq('#tabs').tabs('select', title);
        }
    }

    return {
        initialize: initialize
    };
});