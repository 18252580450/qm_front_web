require([
        "js/execution/beyondPlanChooseTemplate",
        "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"],
    function (QryCheckTemplate, $, Util, Transfer, CommonAjax) {

        var userInfo,
            roleCode,
            voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanVoiceCheckDetail.html";

        initialize();

        function initialize() {
            Util.getLogInData(function (data) {
                userInfo = data;//用户角色
                Util.getRoleCode(userInfo, function (dataNew) {
                    roleCode = dataNew;//用户权限
                    //管理员则显示分配
                    if (roleCode === "manager") {
                        $("#allocateBtn").show();
                    }
                    initPageInfo();
                    initEvent();
                });
            });
        }

        //页面信息初始化
        function initPageInfo() {

            //接触开始时间选择框
            var beginTime = $("#beginTime"),
                beginDate = getFirstDayOfMonth();
            beginTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#beginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                },
                onSelect: function (beginDate) {
                    $('#endTime').datetimebox().datetimebox('calendar').calendar({
                        validator: function (date) {
                            return beginDate <= date;
                        }
                    })
                }
            });
            beginTime.datetimebox('setValue', beginDate);

            //接触结束时间选择框
            var endTime = $('#endTime'),
                endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
            endTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#endTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                }
            });
            endTime.datetimebox('setValue', endDate);

            //立单人搜索框
            var staffNameInput = $('#staffName');
            staffNameInput.searchbox({//输入框点击查询事件
                editable: false,//禁止手动输入
                searcher: function (value) {
                    require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                        var queryQmPeople = qryQmPeople;
                        queryQmPeople.initialize("", "", "");
                        $('#qry_people_window').show().window({
                            title: '立单人搜索',
                            width: Util.constants.DIALOG_WIDTH,
                            height: Util.constants.DIALOG_HEIGHT_SMALL,
                            cache: false,
                            content: queryQmPeople.$el,
                            modal: true,
                            onClose: function () {//弹框关闭前触发事件
                                var acptStaff = queryQmPeople.getMap();//获取人员信息
                                staffNameInput.searchbox("setValue", acptStaff.staffName);
                                $("#staffId").val(acptStaff.staffId);
                            }
                        });
                    });
                }
            });

            //待质检语音列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#voiceCheckList").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true},
                    {
                        field: 'operate', title: '操作', width: '5%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" class="list_operation_color" id = "voiceCheck_' + row.touchId + '">质检</a>';
                        }
                    },
                    {
                        field: 'templateId', title: '考评模版', width: '10%',
                        formatter: function (value, row, index) {
                            if (value == null) {
                                return "未绑定";
                            } else {
                                return row.templateId;
                            }
                        }
                    },
                    {
                        field: 'touchId', title: '语音流水', width: '15%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {field: 'staffName', title: '坐席', width: '10%'},
                    {field: 'departName', title: '部门', width: '15%'},
                    {
                        field: 'staffNumber', title: '坐席号码', width: '15%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'customerNumber', title: '客户号码', width: '15%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'callType', title: '呼叫类型', width: '10%',
                        formatter: function (value, row, index) {
                            return {'0': '呼入', '1': '呼出'}[value];
                        }
                    },
                    {
                        field: 'talkDuration', title: '接触时长', width: '10%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value != null) {
                                return "<span title='" + DateUtil.formatDateTime2(value) + "'>" + DateUtil.formatDateTime2(value) + "</span>";
                            }
                        }
                    },
                    {
                        field: 'beginTime', title: '接触时间', width: '15%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value != null) {
                                return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
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
                checkOnSelect: false,
                onClickCell: function (rowIndex, field, value) {
                    IsCheckFlag = false;
                },
                onSelect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#voiceCheckList").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#voiceCheckList").datagrid("selectRow", rowIndex);
                    }
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows;
                    var pageNum = param.rows;

                    var touchId = $("#touchId").val(),
                        calledNumber = $("#calledNumber").val(),
                        staffId = $("#staffId").val(),
                        beginTime = $("#beginTime").datetimebox("getValue"),
                        endTime = $("#endTime").datetimebox("getValue");

                    var reqParams = {
                        "touchId": touchId,
                        "customerNumber": calledNumber,
                        "staffId": staffId,
                        "beginTime": beginTime,
                        "endTime": endTime
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.BEYOND_PLAN_VOICE_POOL_DNS + "/queryQmVoice", params, function (result) {
                        var data = Transfer.DataGrid.transfer(result),
                            rspCode = result.RSP.RSP_CODE;
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
                    //语音质检详情
                    $.each(data.rows, function (i, item) {
                        $("#voiceCheck_" + item.touchId).on("click", function () {
                            if (item.templateId == null) {
                                var qryCheckTemplate = QryCheckTemplate;
                                item.checkStaffId = userInfo.staffId;
                                item.checkStaffName = userInfo.staffName;
                                qryCheckTemplate.initialize(Util.constants.CHECK_TYPE_VOICE, "0", item);
                                $('#qry_window').show().window({
                                    title: '选择考评模版',
                                    width: Util.constants.DIALOG_WIDTH,
                                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                                    cache: false,
                                    content: qryCheckTemplate.$el,
                                    modal: true
                                });
                            } else {
                                item.checkStaffId = userInfo.staffId;
                                item.checkStaffName = userInfo.staffName;
                                var url = CommonAjax.createURL(voiceCheckDetail, item);
                                CommonAjax.openMenu(url, "语音质检详情", item.touchId);  //todo
                            }
                        });
                    });
                }
            });
        }

        //事件初始化
        function initEvent() {
            $("#queryBtn").on("click", function () {
                var beginTime = $("#beginTime").datetimebox("getValue"),
                    endTime = $("#endTime").datetimebox("getValue");
                if (!checkTime(beginTime, endTime)) {  //查询时间校验
                    return;
                }
                $("#voiceCheckList").datagrid('reload');
            });
            $("#resetBtn").on("click", function () {
                $("#searchForm").form('clear');
            });
            $("#allocateBtn").on("click", function () {
                var allocateData = $("#voiceCheckList").datagrid("getSelections");
                if (allocateData.length === 0) {
                    $.messager.alert("提示", "请至少选择一行数据!");
                    return;
                }
                for (var i = 0; i < allocateData.length; i++) {
                    if (allocateData[i].templateId != null) {
                        $.messager.alert("提示", "已绑定模版的工单不能分配!");
                        return;
                    }
                }
                showAllocateDialog(Util.constants.CHECK_TYPE_VOICE, allocateData);
            });
        }

        //分配
        function showAllocateDialog(checkType, allocateData) {
            require(["js/execution/beyondPlanAllocate"], function (QmVoiceAllocate) {
                var qmVoiceAllocate = new QmVoiceAllocate(checkType, allocateData);
                $('#qry_people_window').show().window({
                    title: '语音质检分配',
                    width: 1000,
                    height: 600,
                    cache: false,
                    content: qmVoiceAllocate.$el,
                    modal: true,
                    onBeforeClose: function () {//弹框关闭前触发事件
                    }
                });
            });
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
                $.messager.alert("提示", "请选择归档结束时间");
                return false;
            }
            if (beginTime === "" && endTime !== "") {
                $.messager.alert("提示", "请选择归档开始时间!");
                return false;
            }
            if (beginTime !== "" && endTime !== "" && beginTime.substring(0, 7) !== endTime.substring(0, 7)) {
                $.messager.alert("提示", "不能跨月查询!");
                return false;
            }
            if (beginTime !== "" && endTime !== "" && d1 > d2) {
                $.messager.alert("提示", "开始时间不能大于结束时间!");
                return false;
            }
            return true;
        }

        return {
            initialize: initialize
        };
    });