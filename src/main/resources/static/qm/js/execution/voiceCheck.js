require(["js/manage/queryQmPlan", "js/manage/voiceQmResultHistory", "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui", "audioplayer"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, CommonAjax) {

    var userInfo,
        voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/voiceCheckDetail.html",
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

        //分配开始时间选择框
        var distributeBeginTime = $("#distributeBeginTime"),
            beginDate = getFirstDayOfMonth();
        distributeBeginTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#distributeBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onSelect: function (beginDate) {
                $('#distributeEndTime').datetimebox().datetimebox('calendar').calendar({
                    validator: function (date) {
                        return beginDate <= date;
                    }
                })
            }
        });
        distributeBeginTime.datetimebox('setValue', beginDate);

        //分配结束时间选择框
        var distributeEndTime = $('#distributeEndTime'),
            endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
        distributeEndTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#distributeEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
            }
        });
        distributeEndTime.datetimebox('setValue', endDate);

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
                    $("#voiceCheckList").datagrid("load");
                }
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
                    field: 'operate', title: '操作', width: '12%',
                    formatter: function (value, row, index) {
                        var play = '<audio id="voicePlay_' + row.touchId + '" src=' + row.recordPath + ' preload="auto"></audio>',
                            audio = '<a href="javascript:void(0);" class="list_operation_color" id = "voicePlay_' + row.touchId + '">播放</a>',
                            download = '<a href="javascript:void(0);" class="list_operation_color" id = "voiceDownload_' + row.touchId + '">下载</a>',
                            check = '<a href="javascript:void(0);" class="list_operation_color" id = "voiceCheck_' + row.touchId + '">质检</a>',
                            checkHistory = '<a href="javascript:void(0);" class="list_operation_color" id = "checkHistory_' + row.touchId + '">质检记录</a>';
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_CHECK) {
                            if (row.recordPath != null && row.recordPath !== "") {
                                return '<div style="display: flex">' + check + "&nbsp;&nbsp;" + play + "&nbsp;&nbsp;" + download + '</div>';
                            } else {
                                return '<div style="display: flex">' + check + "&nbsp;&nbsp;" + audio + "&nbsp;&nbsp;" + download + '</div>';
                            }
                        }
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_RECHECK) {
                            if (row.recordPath != null && row.recordPath !== "") {
                                return '<div style="display: flex">' + checkHistory + "&nbsp;&nbsp;" + check + "&nbsp;&nbsp;" + play + "&nbsp;&nbsp;" + download + '</div>';
                            } else {
                                return '<div style="display: flex">' + checkHistory + "&nbsp;&nbsp;" + check + "&nbsp;&nbsp;" + audio + "&nbsp;&nbsp;" + download + '</div>';
                            }
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
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'checkedStaffName', title: '被检人员', width: '15%'},
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
                    field: 'poolStatus', title: '状态', width: '15%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < poolStatusData.length; i++) {
                            if (parseInt(poolStatusData[i].paramsCode) === value) {
                                return poolStatusData[i].paramsName;
                            }
                        }
                    }
                },
                {
                    field: 'checkedTime', title: '抽取时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.checkedTime != null) {
                            return "<span title='" + DateUtil.formatDateTime(row.checkedTime) + "'>" + DateUtil.formatDateTime(row.checkedTime) + "</span>";
                        }
                    }
                },
                {
                    field: 'operateTime', title: '分派时间', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.operateTime != null) {
                            return "<span title='" + DateUtil.formatDateTime(row.operateTime) + "'>" + DateUtil.formatDateTime(row.operateTime) + "</span>";
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
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;

                var touchId = $("#touchId").val(),
                    planId = $("#planId").val(),
                    distributeBeginTime = $("#distributeBeginTime").datetimebox("getValue"),
                    distributeEndTime = $("#distributeEndTime").datetimebox("getValue"),
                    poolStatus = $("#poolStatus").combobox("getValue");

                if (poolStatus === "" || poolStatus === "-1") {
                    return;
                }

                var reqParams = {
                    "checkStaffId": userInfo.staffId.toString(),
                    "touchId": touchId,
                    "planId": planId,
                    "isOperate": Util.constants.VOICE_DISTRIBUTE,        //已分配
                    "poolStatus": poolStatus,
                    "distributeBeginTime": distributeBeginTime,
                    "distributeEndTime": distributeEndTime,
                    "orderMethod": "1"   //按分配时间降序排序
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS + "/selectByParams", params, function (result) {
                    var data = {rows: [], total: 0};
                    if (result.RSP.RSP_CODE === "1") {
                        data = Transfer.DataGrid.transfer(result);
                        for (var i = 0; i < data.rows.length; i++) {
                            if (data.rows[i].qmPlan != null) {
                                data.rows[i]["planName"] = data.rows[i].qmPlan.planName;
                            }
                        }
                    } else {
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
                    //语言播放
                    var voicePlay = $("#voicePlay_" + item.touchId);
                    if (item.recordPath != null && item.recordPath !== "") {
                        //语言播放初始化
                        voicePlay.audioPlayer(
                            {
                                classPrefix: 'audioplayer',
                                strPlay: '播放',
                                strPause: '暂停',
                                strVolume: '音量'
                            }
                        );
                    } else {
                        voicePlay.on("click", function () {
                            $.messager.alert("提示", "未找到录音地址!");
                        });
                    }
                    //语音下载
                    $("#voiceDownload_" + item.touchId).on("click", function () {
                        if (item.recordPath == null || item.recordPath === "") {
                            $.messager.alert("提示", "未找到录音地址!");
                        } else {
                            window.location.href = Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/recordDownload" + '?ftpPath=' + item.recordPath;
                        }
                    });
                    //语音质检详情
                    $("#voiceCheck_" + item.touchId).on("click", function () {
                        var url = CommonAjax.createURL(voiceCheckDetail, item);
                        CommonAjax.openMenu(url, "语音质检详情", item.touchId);
                    });
                    //质检记录
                    $("#checkHistory_" + item.touchId).on("click", function () {
                        var queryQmHistory = QueryQmHistory;
                        queryQmHistory.initialize(item.touchId);
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
            var distStartTime = $("#distributeBeginTime").datetimebox("getValue"),
                distEndTime = $("#distributeEndTime").datetimebox("getValue");
            if (!checkTime(distStartTime, distEndTime)) {  //查询时间校验
                return;
            }
            $("#voiceCheckList").datagrid('load');
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