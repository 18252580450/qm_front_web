require(["js/manage/queryQmPlan", "js/manage/voiceQmResultHistory", "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, CommonAjax) {

    var voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/voiceCheckDetail.html",
        poolStatusData = [];  //质检状态下拉框静态数据（待质检、待复检）

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
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

        //计划名称搜索框
        $("#qmPlanName").searchbox({
                searcher: function () {
                }
            }
        );

        //分配开始时间选择框
        // var distributeBeginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        var distributeBeginDate = "2018-10-10 00:00:00";
        $("#distributeBeginTime").datetimebox({
            // value: distributeBeginDate,
            onShowPanel: function () {
                $("#distributeBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onChange: function () {
                var beginDate = $("#distributeBeginTime").datetimebox("getValue"),
                    endDate = $("#distributeEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //分配结束时间选择框
        var distributeEndDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#distributeEndTime').datetimebox({
            // value: distributeEndDate,
            onShowPanel: function () {
                $("#distributeEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
            },
            onChange: function () {
                var beginDate = $("#distributeBeginTime").datetimebox("getValue"),
                    endDate = $("#distributeEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
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
                $("#voiceCheckList").datagrid("load");
            }
        });
        CommonAjax.getStaticParams("POOL_STATUS", function (datas) {
            if (datas) {
                poolStatusData = datas;
                $("#poolStatus").combobox('loadData', datas);
            }
        });

        //待质检语音列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#voiceCheckList").datagrid({
            columns: [[
                {
                    field: 'operate', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var check = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "voiceCheck_' + row.touchId + '">质检</a>',
                            checkHistory = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "checkHistory_' + row.touchId + '">质检记录</a>';
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_CHECK) {
                            return check;
                        }
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_RECHECK) {
                            return check + "&nbsp;&nbsp;" + checkHistory;
                        }
                    }
                },
                {field: 'touchId', title: '语音流水', width: '15%'},
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'staffNumber', title: '坐席号码', width: '15%'},
                {field: 'customerNumber', title: '客户号码', width: '15%'},
                {
                    field: 'checkedTime', title: '抽取时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.checkedTime != null) {
                            return DateUtil.formatDateTime(row.checkedTime);
                        }
                    }
                },
                {
                    field: 'operateTime', title: '分派时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.operateTime != null) {
                            return DateUtil.formatDateTime(row.operateTime);
                        }
                    }
                },
                {field: 'checkedStaffName', title: '被检人员', width: '15%'},
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
                    planId = $("#planId").val(),
                    callingNumber = $("#callingNumber").val(),
                    calledNumber = $("#calledNumber").val(),
                    distributeBeginTime = $("#distributeBeginTime").datetimebox("getValue"),
                    distributeEndTime = $("#distributeEndTime").datetimebox("getValue"),
                    minRecordTime = $("#minRecordTime").val(),
                    maxRecordTime = $("#maxRecordTime").val(),
                    poolStatus = $("#poolStatus").combobox("getValue");

                if (poolStatus === "" || poolStatus === "-1") {
                    return;
                }

                var reqParams = {
                    "tenantId": Util.constants.TENANT_ID,
                    "touchId": touchId,
                    "planId": planId,
                    "isOperate": Util.constants.VOICE_DISTRIBUTE,        //已分配
                    "poolStatus": poolStatus,
                    "staffNumber": callingNumber,
                    "customerNumber": calledNumber,
                    "distributeBeginTime": distributeBeginTime,
                    "distributeEndTime": distributeEndTime,
                    "minRecordTime": minRecordTime,
                    "maxRecordTime": maxRecordTime
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS + "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    for (var i = 0; i < data.rows.length; i++) {
                        if (data.rows[i].qmPlan != null) {
                            data.rows[i]["planName"] = data.rows[i].qmPlan.planName;
                        }
                    }
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
                //语音质检详情
                $.each(data.rows, function (i, item) {
                    $("#voiceCheck_" + item.touchId).on("click", function () {
                        var url = createURL(voiceCheckDetail, item);
                        addTabs("语音质检详情", url);
                    });
                });
                //质检记录
                $.each(data.rows, function (i, item) {
                    $("#checkHistory_" + item.touchId).on("click", function () {
                        var queryQmHistory = QueryQmHistory;
                        queryQmHistory.initialize(item.touchId);
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
            $("#voiceCheckList").datagrid('reload');
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
                if (value !== null) {
                    urlLink += '&' + item + "=" + encodeURI(value);
                } else {
                    urlLink += '&' + item + "=" + encodeURI("");
                }
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
    function checkBeginEndTime(beginTime, endTime) {
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