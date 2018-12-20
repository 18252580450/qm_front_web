require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/voiceCheckDetail.html";

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //计划名称搜索框
        $("#qmPlanName").searchbox({
                searcher: function () {
                }
            }
        );
        //抽取开始时间选择框
        // var extractBeginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        var extractBeginDate = "2018-10-10 00:00:00";
        $("#extractBeginTime").datetimebox({
            value: extractBeginDate,
            onChange: function () {
                var beginDate = $("#extractBeginTime").datetimebox("getValue"),
                    endDate = $("#extractEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //抽取结束时间选择框
        var extractEndDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#extractEndTime').datetimebox({
            value: extractEndDate,
            onChange: function () {
                var beginDate = $("#extractBeginTime").datetimebox("getValue"),
                    endDate = $("#extractEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //分配开始时间选择框
        // var distributeBeginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        var distributeBeginDate = "2018-10-10 00:00:00";
        $("#distributeBeginTime").datetimebox({
            value: distributeBeginDate,
            onChange: function () {
                var beginDate = $("#distributeBeginTime").datetimebox("getValue"),
                    endDate = $("#distributeEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //分配结束时间选择框
        var distributeEndDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#distributeEndTime').datetimebox({
            value: distributeEndDate,
            onChange: function () {
                var beginDate = $("#distributeBeginTime").datetimebox("getValue"),
                    endDate = $("#distributeEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //待质检语音列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#voiceCheckList").datagrid({
            columns: [[
                {
                    field: 'touchId', title: '语音流水', width: '14%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "voiceFlow' + row.touchId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'inspectionId', title: '质检流水', width: '14%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "checkFlow' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'checkedTime', title: '抽取时间', width: '13%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.checkedTime != null) {
                            return formatDateTime(row.operateTime);
                        }
                    }
                },
                {field: 'distributeStaff', title: '分派人员', width: '10%'},
                {
                    field: 'operateTime', title: '分派时间', width: '13%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.operateTime != null) {
                            return formatDateTime(row.operateTime);
                        }
                    }
                },
                {field: 'checkedStaffName', title: '被检人员', width: '10%'},
                {field: 'callingNumber', title: '主叫号码', width: '13%'},
                {field: 'calledNumber', title: '服务号码', width: '13%'}
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
                    planId = $("#qmPlanName").val(),
                    callingNumber = $("#callingNumber").val(),
                    calledNumber = $("#calledNumber").val(),
                    extractBeginTime = $("#extractBeginTime").datetimebox("getValue"),
                    extractEndTime = $("#extractEndTime").datetimebox("getValue"),
                    distributeBeginTime = $("#distributeBeginTime").datetimebox("getValue"),
                    distributeEndTime = $("#distributeEndTime").datetimebox("getValue"),
                    minRecordTime = $("#minRecordTime").val(),
                    maxRecordTime = $("#maxRecordTime").val();

                var reqParams = {
                    "tenantId": Util.constants.TENANT_ID,
                    "touchId": touchId,
                    "planId": planId,
                    "poolStatus": Util.constants.VOICE_DISTRIBUTE,        //已分配
                    "checkStatus": Util.constants.CHECK_STATUS_CHECK,     //待质检
                    "callingNumber": callingNumber,
                    "calledNumber": calledNumber,
                    "extractBeginTime": extractBeginTime,
                    "extractEndTime": extractEndTime,
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
                //语音详情
                $.each(data.rows, function (i, item) {
                    $("#voiceFlow" + item.touchId).on("click", function () {
                        // var url = createURL(processDetailUrl, item);
                        // showDialog(url, "流程详情", 900, 600, false);
                    });
                });
                //语音质检详情
                $.each(data.rows, function (i, item) {
                    $("#checkFlow" + item.inspectionId).on("click", function () {
                        var url = createURL(voiceCheckDetail, item);
                        addTabs("语音质检详情", url);
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        $("#queryBtn").on("click", function () {
            $("#voiceCheckList").datagrid('reload');
        })
    }

    //工单质检详情
    function showOrderCheckDetail() {
        var url = createURL(orderCheckDetail, null);
        addTabs("工单质检详情", url);
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