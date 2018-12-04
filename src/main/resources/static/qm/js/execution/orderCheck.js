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
        //分配开始时间选择框
        var beginDate = (formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        $("#assignBeginTime").datetimebox({
            value: beginDate,
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //分配结束时间选择框
        var endDate = (formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#assignEndTime').datetimebox({
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

        //待质检工单列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#orderCheckList").datagrid({
            columns: [[
                {
                    field: 'orderId', title: '工单流水', width: '15%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "orderFlow' + row.orderId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'checkId', title: '质检流水', width: '15%',
                    formatter: function (value, row, index) {
                        var detail = '<a href="javascript:void(0);" id = "checkFlow' + row.checkId + '">' + value + '</a>';
                    }
                },
                {field: 'requireType', title: '服务请求类型', width: '15%'},
                {field: 'planName', title: '计划名称', width: '15%'},
                {field: 'planTime', title: '计划生成时间', width: '15%'},
                {field: 'assignTime', title: '分配时间', width: '15%'},
                {field: 'checkLink', title: '考评环节', width: '10%'}
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
        $("#showOrderCheckDetail").on("click",function () {
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
        if(param != null){
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