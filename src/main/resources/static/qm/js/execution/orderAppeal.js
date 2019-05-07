require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function ($, Util, Transfer, CommonAjax) {
        var userInfo,
            orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/workQmResultDetail.html";

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
            //申诉人搜索框
            var staffNameInput = $("#appealStaffName");
            staffNameInput.searchbox({
                    editable: false,//禁止手动输入
                    searcher: function () {
                        require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                            var queryQmPeople = qryQmPeople;
                            queryQmPeople.initialize("", "", "");
                            $('#qry_people_window').show().window({
                                title: '查询申诉人',
                                width: Util.constants.DIALOG_WIDTH,
                                height: Util.constants.DIALOG_HEIGHT_SMALL,
                                cache: false,
                                content: queryQmPeople.$el,
                                modal: true,
                                onClose: function () {//弹框关闭前触发事件
                                    var appealStaff = queryQmPeople.getMap();//获取审批人员信息
                                    staffNameInput.searchbox("setValue", appealStaff.staffName);
                                    $("#appealStaffId").val(appealStaff.staffId);
                                }
                            });
                        });
                    }
                }
            );

            //申诉开始时间选择框
            var appealBeginTime = $("#appealBeginTime"),
                beginDate = getFirstDayOfMonth();
            appealBeginTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#appealBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                },
                onSelect: function (beginDate) {
                    $('#appealEndTime').datetimebox().datetimebox('calendar').calendar({
                        validator: function (date) {
                            return beginDate <= date;
                        }
                    })
                }
            });
            appealBeginTime.datetimebox('setValue', beginDate);

            //申诉结束时间选择框
            var appealEndTime = $('#appealEndTime'),
                endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
            appealEndTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#appealEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                }
            });
            appealEndTime.datetimebox('setValue', endDate);

            //申诉处理列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#appealCheckList").datagrid({
                columns: [[
                    {
                        field: 'operate', title: '操作', width: '10%',
                        formatter: function (value, row, index) {
                            var detail = '<a href="javascript:void(0);" class="list_operation_color" id = "appealRecord_' + row.appealId + '">审批记录</a>';
                            var deal = '<a href="javascript:void(0);" class="list_operation_color" id = "appealDeal_' + row.appealId + '">审批</a>';
                            return detail + "&nbsp;&nbsp;" + deal;
                        }
                    },
                    {
                        field: 'wrkfmShowSwftno', title: '工单流水', width: '14%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'inspectionId', title: '质检流水', width: '14%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" class="list_operation_color" id = "checkFlow_' + row.appealId + '">' + value + '</a>';
                        }
                    },
                    {
                        field: 'appealId', title: '申诉单号', width: '14%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'appealStaffName', title: '申诉人', width: '8%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + row.appealStaffName + "[" + row.appealStaffId + "]" + "'>" + row.appealStaffName + "[" + row.appealStaffId + "]" + "</span>";
                            }
                        }
                    },
                    {
                        field: 'appealReason', title: '申诉原因', width: '14%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'appealTime', title: '申诉时间', width: '14%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value) {
                                return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                            }
                        }
                    },
                    {field: 'currentNodeName', title: '当前节点', width: '14%'}
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
                        $("#appealCheckList").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#appealCheckList").datagrid("selectRow", rowIndex);
                    }
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows;
                    var pageNum = param.rows;

                    var inspectionId = $("#inspectionId").val(),
                        appealTimeBegin = $("#appealBeginTime").datetimebox("getValue"),
                        appealTimeEnd = $("#appealEndTime").datetimebox("getValue"),
                        appealStaffId = $("#appealStaffId").val(),
                        appealId = $("#appealId").val();

                    var reqParams = {
                        "staffId": userInfo.staffId.toString(),
                        "checkType": Util.constants.CHECK_TYPE_ORDER,
                        "inspectionId": inspectionId,
                        "appealTimeBegin": appealTimeBegin,
                        "appealTimeEnd": appealTimeEnd,
                        "appealStaffId": appealStaffId,
                        "appealId": appealId,
                        "appealStatus": "0"  //申诉中
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_DEAL_DNS + "/queryAppealDeal", params, function (result) {
                        var data = {rows: [], total: 0};
                        if (result.RSP.RSP_CODE === "1") {
                            data = Transfer.DataGrid.transfer(result);
                        } else {
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
                    $.each(data.rows, function (i, item) {
                        //审批记录
                        $("#appealRecord_" + item.appealId).on("click", function () {
                            showAppealRecordDialog(item);
                        });
                        //申诉审批
                        $("#appealDeal_" + item.appealId).on("click", function () {
                            showAppealDealDialog(item);
                        });
                        //质检详情
                        $("#checkFlow_" + item.appealId).on("click", function () {
                            showCheckDetail(item, orderCheckDetail);
                        });
                    });
                }
            });
        }

        //事件初始化
        function initEvent() {
            $("#queryBtn").on("click", function () {
                var appealBeginTime = $("#appealBeginTime").datetimebox("getValue"),
                    appealEndTime = $("#appealEndTime").datetimebox("getValue");
                if (!checkTime(appealBeginTime, appealEndTime)) {  //查询时间校验
                    return;
                }
                $("#appealCheckList").datagrid("load");
            });
            $("#resetBtn").on("click", function () {
                $("#searchForm").form('clear');
            });
        }

        //审批记录弹框
        function showAppealRecordDialog(data) {
            $("#appealLeftDiv").empty();
            $("#appealRightDiv").empty();
            $("#appealRecordDialog").show().window({
                width: 720,
                height: 480,
                modal: true,
                title: "审批记录"
            });

            //取消
            var cancelBtn = $("#recordCloseBtn");
            cancelBtn.unbind("click");
            cancelBtn.on("click", function () {
                cancelBtn.hide();
                $("#appealRecordDialog").window("close");
            });

            //查询审批流程
            var reqParams = {
                "tenantId": Util.constants.TENANT_ID,
                "processId": data.mainProcessId
            };
            var params = $.extend({
                "start": 0,
                "pageNum": 0,
                "params": JSON.stringify(reqParams)
            }, Util.PageUtil.getParams($("#searchForm")));

            Util.loading.showLoading();
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcessDetail", params, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode !== "1") {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    var processData = result.RSP.DATA;
                    //查询审批记录
                    var reqParams = {
                        "appealId": data.appealId
                    };
                    var params = $.extend({
                        "start": 0,
                        "pageNum": 0,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_DEAL_DNS + "/queryDealRecord", params, function (result) {
                        Util.loading.destroyLoading();

                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        } else {
                            var record = result.RSP.DATA;
                            for (var i = 0; i < processData.length; i++) {
                                for (var j = 0; j < record.length; j++) {
                                    if (record[j].processId === processData[i].processId && record[j].nodeId === parseInt(processData[i].nodeId)) {
                                        processData.splice(i, 1);
                                        i--;
                                        break;
                                    }
                                }
                            }
                            $.each(processData, function (i, item) {
                                var map = {};
                                map.approveStaffName = item.userName;
                                map.approveStatus = "待审批";
                                map.approveSuggestion = "";
                                map.approveTime = "";
                                record.push(map);
                            });
                            $("#recordCloseBtn").show();   //显示关闭按钮
                            showAppealDealProcess(data, record);
                        }
                    });
                }
            });
        }

        //申诉审批弹框
        function showAppealDealDialog(data) {
            $("#appealDealConfig").form('clear');  //清空表单
            var disableSubmit = false;  //禁用提交按钮标志
            $("#appealDealDialog").show().window({
                width: 600,
                height: 350,
                modal: true,
                title: "审批"
            });

            //审批意见
            $("#appealDealComment").textbox(
                {
                    multiline: true
                }
            );

            //取消
            var cancelBtn = $("#cancelBtn");
            cancelBtn.unbind("click");
            cancelBtn.on("click", function () {
                $("#appealDealConfig").form('clear');  //清空表单
                $("#appealDealDialog").window("close");
            });
            //提交
            var submitBtn = $("#submitBtn");
            submitBtn.unbind("click");
            submitBtn.on("click", function () {
                if (disableSubmit) {
                    return false;
                }
                disableSubmit = true;   //防止多次提交
                submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

                var approveSuggestion = $("#appealDealComment").val(),
                    approveStatus = $('input[name="appealResult"]:checked').val();

                if (approveStatus === Util.constants.APPROVE_STATUS_DENY && approveSuggestion === "") {
                    $.messager.alert("提示", "请填写审批意见!");
                    disableSubmit = false;
                    submitBtn.linkbutton({disabled: false});  //取消提交禁用
                    return false;
                }
                var params = {
                    "checkType": data.checkType,
                    "touchId": data.touchId,
                    "inspectionId": data.inspectionId,
                    "appealId": data.appealId,
                    "mainProcessId": data.mainProcessId,
                    "currentProcessId": data.currentProcessId,
                    "currentNodeId": data.currentNodeId,
                    "currentNodeName": data.currentNodeName,
                    "nextProcessId": data.nextProcessId,
                    "nextNodeId": data.nextNodeId,
                    "approveStatus": approveStatus,
                    "approveSuggestion": approveSuggestion,
                    "staffId": data.userId,
                    "staffName": data.userName
                };
                Util.loading.showLoading();
                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.APPEAL_DEAL_DNS).concat("/"), JSON.stringify(params), function (result) {
                    Util.loading.destroyLoading();
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                        $("#appealDealDialog").window("close");  //关闭对话框
                        $("#appealCheckList").datagrid("reload"); //刷新列表
                    } else {
                        var errMsg = "审批失败！<br>" + result.RSP.RSP_DESC;
                        $.messager.alert("提示", errMsg);
                    }
                    disableSubmit = false;
                    submitBtn.linkbutton({disabled: false});  //取消提交禁用
                });
            });
        }

        //质检详情弹框
        function showCheckDetail(item, url) {
            var param = {
                "provinceId": item.provinceId,
                "touchId": item.touchId,
                "inspectionId": item.inspectionId,
                "templateId": item.templateId
            };
            var checkUrl = CommonAjax.createURL(url, param);
            CommonAjax.showDialog(checkUrl, "质检详情", 1000, Util.constants.DIALOG_HEIGHT_SMALL);
        }

        //获取当前月1号
        function getFirstDayOfMonth() {
            var date = new Date,
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                mon = (month < 10 ? "0" + month : month);
            return year + "-" + mon + "-01 00:00:00";
        }

        //校验开始时间和终止时间
        function checkTime(beginTime, endTime) {
            var d1 = new Date(beginTime.replace(/-/g, "\/")),
                d2 = new Date(endTime.replace(/-/g, "\/"));

            if (beginTime !== "" && endTime === "") {
                $.messager.alert("提示", "请选择申诉结束时间");
                return false;
            }
            if (beginTime === "" && endTime !== "") {
                $.messager.alert("提示", "请选择申诉开始时间!");
                return false;
            }
            // if (beginTime !== "" && endTime !== "" && beginTime.substring(0, 7) !== endTime.substring(0, 7)) {
            //     $.messager.alert("提示", "不能跨月查询!");
            //     return false;
            // }
            if (beginTime !== "" && endTime !== "" && d1 > d2) {
                $.messager.alert("提示", "开始时间不能大于结束时间!");
                return false;
            }
            return true;
        }

        //显示审批记录
        function showAppealDealProcess(processData, record) {
            var leftDiv = $("#appealLeftDiv"),
                rightDiv = $("#appealRightDiv");
            //申诉提起人
            leftDiv.append(getLeftDiv());
            leftDiv.append(getFirstProcessLine());
            rightDiv.append(getAppealStaffDiv(processData));
            $.each(record, function (i, item) {
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
                '<div class="formControls col-8" style="margin-left: 8px"><div class="appeal-process-line cl"></div></div>' +
                '</div></form>';
        }

        //左侧流程线
        function getFirstProcessLine() {
            return '<form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-8" style="margin-left: 8px"><div class="process-line-2 cl"></div></div>' +
                '</div></form>';
        }

        //右侧流程处理过程列表
        function getRightDiv(item) {
            var approveStatus = item.approveStatus;
            if (item.approveStatus === Util.constants.APPROVE_STATUS_PASS) {
                approveStatus = "通过";
            }
            if (item.approveStatus === Util.constants.APPROVE_STATUS_DENY) {
                approveStatus = "驳回";
            }
            var approveTime = "";
            if (item.approveTime !== "") {
                approveTime = DateUtil.formatDateTime(item.approveTime)
            }
            return '<div style="margin-bottom:30px;">' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批人：' + item.approveStaffName + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批结果：' + approveStatus + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批意见：' + item.approveSuggestion + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批时间：' + approveTime + '</div></div>' +
                '</div></form> </div>' +
                '</div>';
        }

        //右侧流程处理过程列表
        function getAppealStaffDiv(item) {
            var appealTime = "";
            if (item.approveTime !== "") {
                appealTime = DateUtil.formatDateTime(item.appealTime);
            }
            return '<div style="margin-bottom:30px;">' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">申诉提起人：' + item.appealStaffName + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">申诉时间：' + appealTime + '</div></div>' +
                '</div></form> </div>' +
                '</div>';
        }

        return {
            initialize: initialize
        };
    }
);