require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    var orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/orderCheckDetail.html";

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
        var selectBeginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        $("#selectBeginTime").datetimebox({
            value: selectBeginDate,
            onChange: function () {
                var beginDate = $("#selectBeginTime").datetimebox("getValue"),
                    endDate = $("#selectEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //抽取结束时间选择框
        var selectEndDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#selectEndTime').datetimebox({
            value: selectEndDate,
            onChange: function () {
                var beginDate = $("#selectBeginTime").datetimebox("getValue"),
                    endDate = $("#selectEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //分配开始时间选择框
        var assignBeginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        $("#assignBeginTime").datetimebox({
            value: assignBeginDate,
            onChange: function () {
                var beginDate = $("#assignBeginTime").datetimebox("getValue"),
                    endDate = $("#assignEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //分配结束时间选择框
        var assignEndDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#assignEndTime').datetimebox({
            value: assignEndDate,
            onChange: function () {
                var beginDate = $("#assignBeginTime").datetimebox("getValue"),
                    endDate = $("#assignEndTime").datetimebox("getValue");
                checkBeginEndTime(beginDate, endDate);
            }
        });

        //待质检语音列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#voiceCheckList").datagrid({
            columns: [[
                {
                    field: 'orderId', title: '语音流水', width: '14%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "voiceFlow' + row.orderId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'checkId', title: '质检流水', width: '14%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "checkFlow' + row.checkId + '">' + value + '</a>';
                    }
                },
                {field: 'selectTime', title: '抽取时间', width: '13%'},
                {field: 'assignMember', title: '分派人员', width: '10%'},
                {field: 'assignTime', title: '分派时间', width: '13%'},
                {field: 'checkedMember', title: '被检人员', width: '10%'},
                {field: 'callingNumber', title: '主叫号码', width: '13%'},
                {field: 'acceptNumber', title: '服务号码', width: '13%'}
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
            // loader: function (param, success) {
            //
            // },
            onLoadSuccess: function (data) {
                //工单详情
                $.each(data.rows, function (i, item) {
                    $("#orderFlow" + item.orderId).on("click", function () {
                        // var url = createURL(processDetailUrl, item);
                        // showDialog(url, "流程详情", 900, 600, false);
                    });
                });
                //工单质检详情
                $.each(data.rows, function (i, item) {
                    $("#checkFlow" + item.checkId).on("click", function () {
                        // var url = createURL(processEditUrl, item);
                        // addTabs("申诉流程-修改", url);
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        $("#showOrderCheckDetail").on("click", function () {
            showOrderCheckDetail();
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