require(["js/manage/queryQmPlan", "js/manage/voiceQmResultHistory", "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, CommonAjax) {

    var userInfo,
        playingRecord,  //当前正在播放的录音id
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
                        var play = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "voicePlay_' + row.touchId + '">播放</a>',
                            check = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "voiceCheck_' + row.touchId + '">质检</a>',
                            checkHistory = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "checkHistory_' + row.touchId + '">质检记录</a>';
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_CHECK) {
                            // return play + "&nbsp;&nbsp;" + check; //todo
                            return check;
                        }
                        if (row.poolStatus.toString() === Util.constants.CHECK_STATUS_RECHECK) {
                            // return play + "&nbsp;&nbsp;" + check + "&nbsp;&nbsp;" + checkHistory; //todo
                            return check + "&nbsp;&nbsp;" + checkHistory;
                        }
                    }
                },
                {field: 'touchId', title: '语音流水', width: '15%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'staffNumber', title: '坐席号码', width: '15%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
                {field: 'customerNumber', title: '客户号码', width: '15%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
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
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;

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
                    "checkStaffId": userInfo.staffId.toString(),
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
                    var data = Transfer.DataGrid.transfer(result),
                        rspCode = result.RSP.RSP_CODE;
                    for (var i = 0; i < data.rows.length; i++) {
                        if (data.rows[i].qmPlan != null) {
                            data.rows[i]["planName"] = data.rows[i].qmPlan.planName;
                        }
                    }
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
                var audio = new Audio();
                $.each(data.rows, function (i, item) {
                    //语音播放
                    $("#voicePlay_" + item.touchId).on("click", function () {
                        if (playingRecord !== null && playingRecord !== "") {  //有正在播放录音的情况
                            audio.pause();
                            if (playingRecord === item.touchId) {  //暂停播放
                                $("#voicePlay_" + item.touchId).html("播放");
                                playingRecord = "";
                            } else { //播放其他录音
                                $("#voicePlay_" + playingRecord).html("播放");
                                $("#voicePlay_" + item.touchId).html("暂停");
                                audio.src = "../../data/voice2.wav";
                                // audio.src = item.recordPath;  //todo
                                audio.load();
                                audio.play();
                                playingRecord = item.touchId;
                            }
                        } else {
                            $("#voicePlay_" + item.touchId).html("暂停");
                            audio.src = "../../data/voice2.wav";
                            // audio.src = item.recordPath;  //todo
                            audio.load();
                            audio.play();
                            playingRecord = item.touchId;
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
            $("#voiceCheckList").datagrid('load');
        });
        $("#resetBtn").on("click", function () {
            $("#searchForm").form('clear');
            $("#poolStatus").combobox('setValue', poolStatusData[0].paramsCode);
        });
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