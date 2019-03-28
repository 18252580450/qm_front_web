require([
    "js/manage/appealProcessAddDialog",
    "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function (AppealProcessAdd, $, Util, Transfer, CommonAjax) {

    var userInfo,
        processStatusData = [],   //流程状态下拉框静态数据
        checkTypeData = [],       //质检类型静态数据
        processDetailUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessDetail.html",
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
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
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
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
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
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
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
        var beginDateBox = $('#createTimeBegin');
        var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        beginDateBox.datetimebox({
            // value: beginDate,
            onShowPanel: function () {
                $("#createTimeBegin").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onChange: function () {
                checkBeginEndTime();
            }
        });

        var endDateBox = $('#createTimeEnd');
        var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        endDateBox.datetimebox({
            // value: endDate,
            onShowPanel: function () {
                $("#createTimeEnd").datetimebox("spinner").timespinner("setValue", "23:59:59");
            },
            onChange: function () {
                checkBeginEndTime();
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
                        var detail = '<a href="javascript:void(0);" id = "processDetail' + row.processId + '">详情</a>';
                        var edit = '<a href="javascript:void(0);" id = "processEdit' + row.processId + '">修改</a>';
                        return detail + "&nbsp;&nbsp;" + edit;
                    }
                },
                {
                    field: 'checkType', title: '质检类型', width: '10%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < checkTypeData.length; i++) {
                            if (checkTypeData[i].paramsCode === value) {
                                return checkTypeData[i].paramsName;
                            }
                        }
                    }
                },
                {field: 'processId', title: '流程编码', width: '15%'},
                {field: 'processName', title: '流程名称', width: '20%'},
                {field: 'departmentName', title: '部门', width: '20%'},
                {
                    field: 'createTime', title: '创建时间', width: '20%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.createTime != null) {
                            var createTime = DateUtil.formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
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
                        return processStatus;
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
                    createStaffId = $("#createStaffName").val(),
                    tenantId = $("#tenantType").combobox("getValue"),
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
                    "createStaffId": createStaffId,
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
                        var url = createURL(processDetailUrl, item);
                        showDialog(url, "流程详情", 1100, 600, false);
                    });
                });
                //修改
                $.each(data.rows, function (i, item) {
                    $("#processEdit" + item.processId).on("click", function () {
                        if (item.processStatus === Util.constants.PROCESS_STATUS_START) {
                            $.messager.alert("提示", "已启动的流程不允许修改!");
                            return;
                        }
                        var url = createURL(processEditUrl, item);
                        addTabs("申诉流程-修改", url);
                    });
                });
            },
            //双击显示详情
            onDblClickRow: function (index, data) {
                var url = createURL(processDetailUrl, data);
                showDialog(url, "流程详情", 1100, 600, false);
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
            var url = createURL(processAddUrl, userInfo);
            addTabs("申诉流程-新增", url);
            // var appealProcessAdd = new AppealProcessAdd(userInfo);
            // $('#process_add_window').show().window({
            //     title: '新增流程',
            //     width: 1200,
            //     height: 600,
            //     cache: false,
            //     content: appealProcessAdd.$el,
            //     modal: true
            // });
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
                    $.messager.alert("提示", "流程已" + status + "!");
                    return;
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

    //dialog弹框
    //url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层
    function showDialog(url, title, width, height, shadow) {
        var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>';
        var dialogDiv = '<div id="processDetailDialog" title="' + title + '"></div>'; //style="overflow:hidden;"可以去掉滚动条
        $(document.body).append(dialogDiv);
        var win = $('#processDetailDialog').dialog({
            content: content,
            width: width,
            height: height,
            modal: shadow,
            title: title,
            onClose: function () {
                $(this).dialog('destroy');//后面可以关闭后的事件
            }
        });
        win.dialog('open');
    }

    //拼接对象到url
    function createURL(url, param) {
        var urlLink = '';
        $.each(param, function (item, value) {
            urlLink += '&' + item + "=" + encodeURI(value);
        });
        urlLink = url + "?" + urlLink.substr(1);
        return urlLink.replace(' ', '');
    }

    return {
        initialize: initialize
    };
});