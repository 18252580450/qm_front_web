require(["js/manage/queryQmPlan", "js/manage/workQmResultHistory", "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, CommonAjax) {
    var userInfo,
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/orderCheckDetail.html",
        poolStatusData = [];  //质检状态下拉框静态数据（待质检、待复检）

    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;    //用户信息
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {

        //分配开始时间选择框
        var assignBeginTime = $("#assignBeginTime"),
            beginDate = getFirstDayOfMonth();
        assignBeginTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#assignBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onSelect: function (beginDate) {
                $('#assignEndTime').datetimebox().datetimebox('calendar').calendar({
                    validator: function (date) {
                        return beginDate <= date;
                    }
                })
            }
        });
        assignBeginTime.datetimebox('setValue', beginDate);

        //分配结束时间选择框
        var assignEndTime = $('#assignEndTime'),
            endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
        assignEndTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#assignEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
            }
        });
        assignEndTime.datetimebox('setValue', endDate);

        //计划名称搜索框
        $('#planName').searchbox({//输入框点击查询事件
            editable: false,//禁止手动输入
            searcher: function (value) {
                var queryQmPlan = new QueryQmPlan();

                $('#qry_window').show().window({
                    title: '查询考评计划',
                    width: Util.constants.DIALOG_WIDTH,
                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                    cache: false,
                    content: queryQmPlan.$el,
                    modal: true
                });
            }
        });

        //质检状态下拉框
        $("#poolStatus").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var poolStatus = $("#poolStatus"),
                    data = poolStatus.combobox('getData');
                if (data.length > 0) {
                    poolStatus.combobox('select', data[0].paramsCode);
                    $("#orderCheckList").datagrid("load");
                }
            }
        });
        CommonAjax.getStaticParams("POOL_STATUS", function (datas) {
            if (datas) {
                poolStatusData = datas;
                $("#poolStatus").combobox('loadData', datas);
            }
        });

        //待质检工单列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#orderCheckList").datagrid({
            columns: [[
                {
                    field: 'operate', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var check = '<a href="javascript:void(0);" class="list_operation_color" id = "orderCheck_' + row.workFormId + '">质检</a>',
                            checkHistory = '<a href="javascript:void(0);" class="list_operation_color" id = "checkHistory_' + row.workFormId + '">质检记录</a>';
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_CHECK) {
                            return check;
                        }
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_RECHECK) {
                            return check + "&nbsp;&nbsp;" + checkHistory;
                        }
                    }
                },
                {
                    field: 'wrkfmShowSwftno', title: '工单流水', width: '18%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'bizTitle', title: '工单标题', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'planName', title: '计划名称', width: '15%',
                    formatter: function (value, row, index) {
                        if (row.qmPlan != null) {
                            return row.qmPlan.planName;
                        }
                    }
                },
                {
                    field: 'srvReqstTypeFullNm', title: '问题分类', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'custName', title: '客户名称', width: '12%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'custEmail', title: '客户账号', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'custNum', title: '客户号码', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'poolStatus', title: '状态', width: '8%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < poolStatusData.length; i++) {
                            if (parseInt(poolStatusData[i].paramsCode) === value) {
                                return poolStatusData[i].paramsName;
                            }
                        }
                    }
                },
                {
                    field: 'operateTime', title: '分配时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.operateTime) {
                            return "<span title='" + DateUtil.formatDateTime(row.operateTime) + "'>" + DateUtil.formatDateTime(row.operateTime) + "</span>";
                        }
                    }
                },
                {
                    field: 'crtTime', title: '立单时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (value) {
                            return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                        }
                    }
                },
                {
                    field: 'arcTime', title: '归档时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (value) {
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
                    $("#orderCheckList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#orderCheckList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;

                var wrkfmShowSwftno = $("#orderId").val(),
                    distStartTime = $("#assignBeginTime").datetimebox("getValue"),
                    distEndTime = $("#assignEndTime").datetimebox("getValue"),
                    planId = $("#planId").val(),
                    poolStatus = $("#poolStatus").combobox("getValue");

                if (poolStatus === "" || poolStatus === "-1") {
                    return;
                }
                var reqParams = {
                    "checkStaffId": userInfo.staffId.toString(),
                    "wrkfmShowSwftno": wrkfmShowSwftno,
                    "isOperate": Util.constants.ORDER_DISTRIBUTE,        //已分配
                    "planId": planId,
                    "operateTimeBegin": distStartTime,
                    "operateTimeEnd": distEndTime,
                    "poolStatus": poolStatus,
                    "orderMethod": "1"   //按分配时间降序排序
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_POOL_DNS + "/selectByParams", params, function (result) {
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
                    if (poolStatusData.length > 0) {
                        success(data);
                    } else {
                        CommonAjax.getStaticParams("POOL_STATUS", function (datas) {
                            if (datas) {
                                poolStatusData = datas;
                                success(data);
                            }
                        });
                    }
                });
            },
            onLoadSuccess: function (data) {
                $.each(data.rows, function (i, item) {
                    //工单质检详情
                    $("#orderCheck_" + item.workFormId).on("click", function () {
                        var templateId = "",
                            planId = "";
                        if (item.planId != null && item.planId !== "") {
                            planId = item.planId;   //计划内质检
                        } else {
                            templateId = item.templateId;  //计划外质检
                        }
                        var param = {
                            "provinceId": item.provinceId,
                            "wrkfmId": item.workFormId,
                            "wrkfmShowSwftno": item.wrkfmShowSwftno,
                            "planId": planId,
                            "templateId": templateId,
                            "custNum": item.custNum,
                            "operateTime": item.operateTime,
                            "acptStaffNum": item.acptStaffNum,
                            "checkStaffId": item.checkStaffId,
                            "checkStaffName": item.checkStaffName
                        };
                        var url = CommonAjax.createURL(orderCheckDetail, param);
                        CommonAjax.openMenu(url, "工单质检详情", item.workFormId);
                    });
                    //质检记录
                    $("#checkHistory_" + item.workFormId).on("click", function () {
                        var queryQmHistory = QueryQmHistory;
                        queryQmHistory.initialize(item.workFormId);
                        $('#qryQmHistoryWindow').show().window({
                            title: '质检历史',
                            width: Util.constants.DIALOG_WIDTH,
                            height: Util.constants.DIALOG_HEIGHT_SMALL,
                            cache: false,
                            content: queryQmHistory.$el,
                            modal: true,
                            onClose: function () {//弹框关闭前触发事件
                            }
                        });
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        $("#queryBtn").on("click", function () {
            var distStartTime = $("#assignBeginTime").datetimebox("getValue"),
                distEndTime = $("#assignEndTime").datetimebox("getValue");
            if (!checkTime(distStartTime, distEndTime)) {  //查询时间校验
                return;
            }
            $("#orderCheckList").datagrid('load');
        });
        $("#resetBtn").on("click", function () {
            $("#searchForm").form('clear');
            $("#poolStatus").combobox('setValue', poolStatusData[0].paramsCode);
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
            $.messager.alert("提示", "请选择分配结束时间");
            return false;
        }
        if (beginTime === "" && endTime !== "") {
            $.messager.alert("提示", "请选择分配开始时间!");
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