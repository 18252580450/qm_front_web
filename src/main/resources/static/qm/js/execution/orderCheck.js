require(["js/manage/queryQmPlan", "js/manage/workQmResultHistory", "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, CommonAjax) {
    var userInfo,
        roleCode,
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/orderCheckDetailNew.html",
        poolStatusData = [];  //质检状态下拉框静态数据（待质检、待复检）

    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            Util.getRoleCode(userInfo,function(dataNew){
                roleCode = dataNew;//用户信息
                initPageInfo();
                initEvent();
            });
        });
    }

    //页面信息初始化
    function initPageInfo() {

        //分配开始时间选择框
        // var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        var beginDate = "2018-10-10 00:00:00";
        $("#assignBeginTime").datetimebox({
            // value: beginDate,
            onShowPanel: function () {
                $("#assignBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //分配结束时间选择框
        var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#assignEndTime').datetimebox({
            // value: endDate,
            onShowPanel: function () {
                $("#assignEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
            },
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //考评环节搜索框
        $("#checkLink").searchbox({
                searcher: function () {
                }
            }
        );

        //计划名称搜索框
        $('#planName').searchbox({//输入框点击查询事件
            searcher: function (value) {
                var queryQmPlan = new QueryQmPlan();

                $('#qry_window').show().window({
                    title: '查询考评计划',
                    width: 1150,
                    height: 600,
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
                }
            },
            onSelect: function () {
                $("#orderCheckList").datagrid("load");
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
                        var check = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "orderCheck_' + row.workFormId + '">质检</a>',
                            checkHistory = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "checkHistory_' + row.workFormId + '">质检记录</a>';
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_CHECK) {
                            return check;
                        }
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_RECHECK) {
                            return check + "&nbsp;&nbsp;" + checkHistory;
                        }
                    }
                },
                {field: 'wrkfmShowSwftno', title: '工单流水', width: '15%'},
                {field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '15%'},
                {
                    field: 'planName', title: '计划名称', width: '15%',
                    formatter: function (value, row, index) {
                        if (row.qmPlan != null) {
                            return row.qmPlan.planName;
                        }
                    }
                },
                {field: 'custEmail', title: '客户账号', align: 'center', width: '10%'},
                {field: 'custName', title: '客户名称', align: 'center', width: '10%'},
                {field: 'custNum', title: '客户号码', align: 'center', width: '10%'},
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
                },
                {
                    field: 'operateTime', title: '分配时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.operateTime != null) {
                            return DateUtil.formatDateTime(row.operateTime);
                        }
                    }
                },
                {
                    field: 'poolStatus', title: '状态', width: '15%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < poolStatusData.length; i++) {
                            if (parseInt(poolStatusData[i].paramsCode) === value) {
                                return poolStatusData[i].paramsName;
                            }
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
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;

                var wrkfmShowSwftno = $("#orderId").val(),
                    distStartTime = $("#assignBeginTime").datetimebox("getValue"),
                    distEndTime = $("#assignEndTime").datetimebox("getValue"),
                    checkLink = $("#checkLink").val(),
                    planId = $("#planId").val(),
                    custNum = $("#customNum").val(),
                    poolStatus = $("#poolStatus").combobox("getValue");

                if (poolStatus === "" || poolStatus === "-1") {
                    return;
                }
                var reqParams = {
                    // "checkStaffId": Util.constants.STAFF_ID,     //暂时不考虑工号
                    "wrkfmShowSwftno": wrkfmShowSwftno,
                    "isOperate": Util.constants.ORDER_DISTRIBUTE,        //已分配
                    "planId": planId,
                    "operateTimeBegin": distStartTime,
                    "operateTimeEnd": distEndTime,
                    "checkLink": checkLink,
                    "poolStatus": poolStatus,
                    "custNum": custNum
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
                //工单质检详情
                $.each(data.rows, function (i, item) {
                    $("#orderCheck_" + item.workFormId).on("click", function () {
                        var url = createURL(orderCheckDetail, item);
                        addTabs("工单质检" + item.wrkfmShowSwftno, url);
                    });
                });
                //质检记录
                $.each(data.rows, function (i, item) {
                    $("#checkHistory_" + item.workFormId).on("click", function () {
                        var queryQmHistory = QueryQmHistory;
                        queryQmHistory.initialize(item.workFormId);
                        $('#qryQmHistoryWindow').show().window({
                            title: '质检历史',
                            width: 900,
                            height: 500,
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
            $("#orderCheckList").datagrid('load');
        });
        $("#resetBtn").on("click", function () {
            $("#searchForm").form('clear');
            $("#poolStatus").combobox('setValue', poolStatusData[0].paramsCode);
        });
    }

    //拼接对象到url
    function createURL(url, param) {
        var urlLink = url;
        if (param != null) {
            $.each(param, function (item, value) {
                urlLink += '&' + item + "=" + encodeURI(value);
            });
            urlLink = url + "?" + urlLink.substr(1);
        }
        return urlLink.replace(' ', '');
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

    //校验开始时间和终止时间
    function checkBeginEndTime() {
        var beginTime = $("#assignBeginTime").datetimebox("getValue");
        var endTime = $("#assignEndTime").datetimebox("getValue");
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

    return {
        initialize: initialize
    };
});