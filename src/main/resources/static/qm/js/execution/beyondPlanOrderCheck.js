require([
        "js/execution/beyondPlanChooseTemplate",
        "js/execution/beyondPlanOrderCheckDetail",
        "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"],
    function (QryCheckTemplate, OrderCheckDetail, $, Util, Transfer, CommonAjax) {

        var userInfo,
            roleCode,
            orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanOrderCheckDetail.html";

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

            //归档开始时间选择框
            var arcBeginTime = $("#arcBeginTime"),
                beginDate = getFirstDayOfMonth();
            arcBeginTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#arcBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                }
            });
            arcBeginTime.datetimebox('setValue', beginDate);

            //归档结束时间选择框
            var arcEndTime = $('#arcEndTime'),
                endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
            arcEndTime.datetimebox({
                editable: false,
                onShowPanel: function () {
                    $("#arcEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                }
            });
            arcEndTime.datetimebox('setValue', endDate);

            //立单人搜索框
            var acptStaffInput = $('#acptStaffName');
            acptStaffInput.searchbox({//输入框点击查询事件
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
                                acptStaffInput.searchbox("setValue", acptStaff.staffName);
                                $("#acptStaffId").val(acptStaff.staffId);
                            }
                        });
                    });
                }
            });

            //待质检工单列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#workFormList").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true},
                    {
                        field: 'operate', title: '操作', width: '5%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" class="list_operation_color" id = "orderCheck_' + row.wrkfmId + '">质检</a>';
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
                        field: 'wrkfmShowSwftno', title: '工单流水', width: '15%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'bizTitle', title: '工单标题', width: '10%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '15%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'custEmail', title: '客户账号', width: '10%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {
                        field: 'custName', title: '客户名称', width: '10%',
                        formatter: function (value, row, index) {
                            if (value) {
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                        }
                    },
                    {field: 'custNum', title: '客户号码', width: '10%'},
                    {field: 'handleDuration', title: '处理时长', width: '10%'},
                    {
                        field: 'crtTime', title: '立单时间', width: '15%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value != null) {
                                return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                            }
                        }
                    },
                    {
                        field: 'arcTime', title: '归档时间', width: '15%',
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
                        $("#workFormList").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#workFormList").datagrid("selectRow", rowIndex);
                    }
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows,
                        pageNum = param.rows,
                        wrkfmShowSwftno = $("#orderId").val(),
                        acptStaffId = $("#acptStaffId").val(),
                        arcBeginTime = $("#arcBeginTime").datetimebox("getValue"),
                        arcEndTime = $("#arcEndTime").datetimebox("getValue"),
                        custNum = $("#custNum").val();

                    var reqParams = {
                        "wrkfmShowSwftno": wrkfmShowSwftno,
                        "acptStaffId": acptStaffId,
                        "arcBeginTime": arcBeginTime,
                        "arcEndTime": arcEndTime,
                        "custNum": custNum
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.BEYOND_PLAN_ORDER_POOL_DNS + "/queryQmWorkform", params, function (result) {
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
                    //质检
                    $.each(data.rows, function (i, item) {
                        $("#orderCheck_" + item.wrkfmId).on("click", function () {
                            if (item.templateId == null) {
                                item.checkStaffId = userInfo.staffId;
                                item.checkStaffName = userInfo.staffName;
                                var qryCheckTemplate = QryCheckTemplate;
                                qryCheckTemplate.initialize(Util.constants.CHECK_TYPE_ORDER, "0", item);
                                $('#qry_window').show().window({
                                    title: '选择考评模版',
                                    width: Util.constants.DIALOG_WIDTH,
                                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                                    cache: false,
                                    content: qryCheckTemplate.$el,
                                    modal: true
                                });
                            } else {
                                var param = {
                                    "provCode": item.provCode,
                                    "wrkfmId": item.wrkfmId,
                                    "wrkfmShowSwftno": item.wrkfmShowSwftno,
                                    "templateId": item.templateId,
                                    "acptStaffNum": item.acptStaffNum,
                                    "checkStaffId": userInfo.staffId,
                                    "checkStaffName": userInfo.staffName,
                                    "srvReqstTypeNm": item.srvReqstTypeNm,
                                    "actualHandleDuration": item.actualHandleDuration
                                };
                                var url = CommonAjax.createURL(orderCheckDetail, param);
                                CommonAjax.openMenu2(url, "工单质检详情", item.wrkfmId); //todo
                            }
                        });
                    });
                }
            });
        }

        //事件初始化
        function initEvent() {
            $("#queryBtn").on("click", function () {
                var arcBeginTime = $("#arcBeginTime").datetimebox("getValue"),
                    arcEndTime = $("#arcEndTime").datetimebox("getValue");
                if (!checkTime(arcBeginTime, arcEndTime)) {  //查询时间校验
                    return;
                }
                $("#workFormList").datagrid('load');
            });
            $("#resetBtn").on("click", function () {
                $("#searchForm").form('clear');
            });
            $("#allocateBtn").on("click", function () {
                var allocateData = $("#workFormList").datagrid("getSelections");
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
                showAllocateDialog(Util.constants.CHECK_TYPE_ORDER, allocateData);
            });
        }

        //分配
        function showAllocateDialog(checkType, allocateData) {
            require(["js/execution/beyondPlanAllocate"], function (WorkFormAllocate) {
                var workFormAllocate = new WorkFormAllocate(checkType, allocateData);
                $('#qry_people_window').show().window({
                    title: '工单质检分配',
                    width: Util.constants.DIALOG_WIDTH,
                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                    cache: false,
                    content: workFormAllocate.$el,
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