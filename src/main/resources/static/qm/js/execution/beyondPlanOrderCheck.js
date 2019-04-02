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
                    initPageInfo();
                    initEvent();
                });
            });
        }

        //页面信息初始化
        function initPageInfo() {

            //归档开始时间选择框
            // var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
            var beginDate = "2018-10-10 00:00:00";
            $("#arcBeginTime").datetimebox({
                // value: beginDate,
                onShowPanel: function () {
                    $("#arcBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                },
                onChange: function () {
                }
            });

            //归档结束时间选择框
            var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
            // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
            $('#arcEndTime').datetimebox({
                // value: endDate,
                onShowPanel: function () {
                    $("#arcEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                },
                onChange: function () {
                }
            });

            //立单人搜索框
            $('#acptStaffName').searchbox({//输入框点击查询事件
                searcher: function (value) {
                }
            });

            //待质检工单列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#workFormList").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true},
                    {
                        field: 'operate', title: '操作', width: '8%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "orderCheck_' + row.wrkfmId + '">质检</a>';
                        }
                    },
                    {field: 'wrkfmShowSwftno', title: '工单流水', width: '15%'},
                    {field: 'bizTitle', title: '工单标题', width: '10%'},
                    {field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '15%'},
                    {field: 'custEmail', title: '客户账号', width: '10%'},
                    {field: 'custName', title: '客户名称', width: '10%'},
                    {field: 'custNum', title: '客户号码', width: '10%'},
                    {field: 'handleDuration', title: '处理时长', width: '10%'},
                    {
                        field: 'crtTime', title: '立单时间', width: '15%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value != null) {
                                return DateUtil.formatDateTime(value);
                            }
                        }
                    },
                    {
                        field: 'arcTime', title: '归档时间', width: '15%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value != null) {
                                return DateUtil.formatDateTime(value);
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
                        custName = $("#custName").val(),
                        custNum = $("#custNum").val();

                    var reqParams = {
                        "wrkfmShowSwftno": wrkfmShowSwftno,
                        "acptStaffId": acptStaffId,
                        "arcBeginTime": arcBeginTime,
                        "arcEndTime": arcEndTime,
                        "custName": custName,
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
                                var qryCheckTemplate = QryCheckTemplate;
                                qryCheckTemplate.initialize(Util.constants.CHECK_TYPE_ORDER, "0", item);
                                $('#qry_window').show().window({
                                    title: '选择考评模版',
                                    width: 950,
                                    height: 550,
                                    cache: false,
                                    content: qryCheckTemplate.$el,
                                    modal: true
                                });
                            } else {
                                item.checkStaffId = userInfo.staffId;
                                item.checkStaffName = userInfo.staffName;
                                var url = CommonAjax.createURL(orderCheckDetail, item);
                                CommonAjax.openMenu(url, "工单质检详情", item.wrkfmId);
                            }
                        });
                    });
                }
            });
        }

        //事件初始化
        function initEvent() {
            $("#queryBtn").on("click", function () {
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
                showAllocateDialog(Util.constants.CHECK_TYPE_ORDER, allocateData);
            });
        }

        //分配
        function showAllocateDialog(checkType, allocateData) {
            require(["js/execution/beyondPlanAllocate"], function (WorkFormAllocate) {
                var workFormAllocate = new WorkFormAllocate(checkType, allocateData);
                $('#qry_people_window').show().window({
                    title: '工单质检分配',
                    width: 1000,
                    height: 600,
                    cache: false,
                    content: workFormAllocate.$el,
                    modal: true,
                    onBeforeClose: function () {//弹框关闭前触发事件
                    }
                });
            });
        }

        return {
            initialize: initialize
        };
    });