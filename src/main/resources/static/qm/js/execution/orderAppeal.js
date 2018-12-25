require(["jquery", 'util', "transfer", "dateUtil", "easyui"], function ($, Util, Transfer) {

    var appealCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/orderAppealDetail.html";

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //申诉开始时间选择框
        var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        $("#appealBeginTime").datetimebox({
            value: beginDate,
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //申诉结束时间选择框
        var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
        // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        $('#appealEndTime').datetimebox({
            value: endDate,
            onChange: function () {
                checkBeginEndTime();
            }
        });

        //申诉人
        $("#appealStaffId").searchbox({
                searcher: function () {
                }
            }
        );

        //申诉处理列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#appealCheckList").datagrid({
            columns: [[
                {
                    field: 'touchId', title: '工单流水', width: '14%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "orderFlow_' + row.touchId + '">' + value + '</a>';
                    }
                },
                {
                    field: 'inspectionId', title: '质检流水', width: '14%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "checkFlow_' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {field: 'appealId', title: '申诉单号', width: '14%'},
                {field: 'appealStaffName', title: '申诉人', width: '14%'},
                {field: 'appealReason', title: '申诉原因', width: '14%'},
                {
                    field: 'appealTime', title: '申诉时间', width: '14%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (value) {
                            return DateUtil.formatDateTime(value);
                        }
                    }
                },
                {field: 'currentNodeName', title: '当前节点', width: '14%'}
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
                    $("#appealCheckList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealCheckList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;

                var inspectionId = $("#inspectionId").val(),
                    appealTimeBegin = $("#appealBeginTime").datetimebox("getValue"),
                    appealTimeEnd = $("#appealEndTime").datetimebox("getValue"),
                    appealStaffId = $("#appealStaffId").val(),
                    appealId = $("#appealId").val();

                var reqParams = {
                    "staffId": Util.constants.STAFF_ID,
                    "checkType": Util.constants.CHECK_TYPE_ORDER,
                    "inspectionId": inspectionId,
                    "appealTimeBegin": appealTimeBegin,
                    "appealTimeEnd": appealTimeEnd,
                    "appealStaffId": appealStaffId,
                    "appealId": appealId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_DEAL_DNS + "/queryAppealDeal", params, function (result) {
                    debugger;
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

    //事件初始化
    function initEvent() {
        $("#queryBtn").on("click", function () {
            $("#appealCheckList").datagrid("reload");
        });
    }

    //申诉处理详情
    function showAppealDetail() {
        var url = createURL(appealCheckDetail, null);
        addTabs("申诉处理详情", url);
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
        var beginTime = $("#appealBeginTime").datetimebox("getValue");
        var endTime = $("#appealEndTime").datetimebox("getValue");
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