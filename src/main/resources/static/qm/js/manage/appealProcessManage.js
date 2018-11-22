require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var processStatusData = [],   //流程状态下拉框静态数据
        processDetailUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessDetail.html",
        processAddUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessAdd.html";

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
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
        reloadSelectData("PROCESS_STATUS", "processStatus", true);

        //时间控件初始化
        var beginDateBox = $('#createTimeBegin');
        var beginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        beginDateBox.datetimebox({
            value: beginDate,
            onChange: function () {
                checkBeginEndTime();
            }
        });

        var endDateBox = $('#createTimeEnd');
        var endDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        endDateBox.datetimebox({
            value: endDate,
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
                    field: 'detail', title: '操作', align: 'center', width: '5%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "processDetail' + row.processId + '">详情</a>';
                    }
                },
                {field: 'processId', title: '流程编码', align: 'center', width: '15%'},
                {field: 'processName', title: '流程名称', align: 'center', width: '10%'},
                {
                    field: 'createTime', title: '创建时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.createTime != null) {
                            var createTime = formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
                    }
                },
                {field: 'createStaffId', title: '创建工号', align: 'center', width: '10%'},
                {field: 'tenantId', title: '渠道', align: 'center', width: '10%'},
                {
                    field: 'modifyTime', title: '修改时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.modifyTime != null) {
                            var modifyTime = formatDateTime(row.modifyTime);
                            return '<span title=' + modifyTime + '>' + modifyTime + '</span>';
                        }
                    }
                },
                {field: 'modifyStaffId', title: '修改工号', align: 'center', width: '10%'},
                {
                    field: 'processStatus', title: '流程状态', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        var processStatus = "";
                        if (processStatusData.length !== 0) {
                            $.each(processStatusData, function (index, item) {
                                if (item.paramsCode === value) {
                                    processStatus = item.paramsName;
                                }
                            });
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
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var processId = $("#processId").val();
                var processName = $("#processName").val();
                var createStaffId = $("#createStaffName").val();
                var tenantId = $("#tenantType").combobox("getValue");
                var processStatus = $("#processStatus").combobox("getValue");
                var createTimeBegin = $("#createTimeBegin").datetimebox("getValue");
                var createTimeEnd = $("#createTimeEnd").datetimebox("getValue");
                if (processStatus === "-1") {
                    processStatus = null;
                }

                var reqParams = {
                    "mainProcessFlag": "0",
                    "processId": processId,
                    "processName": processName,
                    "createStaffId": createStaffId,
                    "tenantId": tenantId,
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
                        showDialog(url, "流程详情", 900, 600, false);
                    });
                });
            },
            //双击显示详情
            onDblClickRow: function (index, data) {
                var url = createURL(processDetailUrl, data);
                showDialog(url, "流程详情", 900, 600, false);
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
            addTabs("申诉流程-新增", processAddUrl);
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
        });
    }

    //时间格式化
    function formatDateTime(inputDate) {
        var date = new Date(inputDate);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
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

    //下拉框数据重载
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
                if (paramsType === "PROCESS_STATUS") {
                    processStatusData = selectData;
                }
                $("#" + select).combobox('loadData', selectData);
            }
        });
    }

    return {
        initialize: initialize
    };
});