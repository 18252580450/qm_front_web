require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    initialize();

    function initialize() {
        initPageInfo();
    }

    //页面信息初始化
    function initPageInfo() {
        //申诉开始时间选择框
        var beginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        $("#appealBeginTime").datetimebox({
            value: beginDate,
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //分配结束时间选择框
        var endDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#appealEndTime').datetimebox({
            value: endDate,
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

        //申诉处理列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#appealCheckList").datagrid({
            columns: [[
                {
                    field: 'orderId', title: '工单流水', width: '20%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "orderFlow' + row.orderId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'checkId', title: '质检流水', width: '20%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "checkFlow' + row.checkId + '">' + value + '</a>';
                    }
                },
                {field: 'planName', title: '计划名称', width: '20%'},
                {field: 'checkLink', title: '考评环节', width: '15%'},
                {field: 'appealTime', title: '申诉时间', width: '20%'}
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
                    $("#appealProcessList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealProcessList").datagrid("selectRow", rowIndex);
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
                //申诉处理详情
                $.each(data.rows, function (i, item) {
                    $("#checkFlow" + item.checkId).on("click", function () {
                        // var url = createURL(processEditUrl, item);
                        // addTabs("申诉流程-修改", url);
                    });
                });
            }
        });
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
    function checkBeginEndTime() {
        var beginTime = $("#createTimeBegin").datetimebox("getValue");
        var endTime = $("#createTimeEnd").datetimebox("getValue");
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