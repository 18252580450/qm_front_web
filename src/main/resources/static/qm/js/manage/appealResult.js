require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"], function ($, Util, Transfer, CommonAjax) {

        var voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/voiceAppealDetail.html",
            orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/orderAppealDetail.html",
            checkTypeData = [],      //质检类型静态数据
            appealStatusData = [];   //申诉状态静态数据

        initialize();

        function initialize() {
            initPageInfo();
            initEvent();
        }

        //页面信息初始化
        function initPageInfo() {
            //申诉开始时间选择框
            // var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
            var beginDate = "2018-10-10 00:00:00";
            $("#appealBeginTime").datetimebox({
                // value: beginDate,
                onShowPanel: function () {
                    $("#appealBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                },
                onChange: function () {
                    checkBeginEndTime();
                }
            });

            //申诉结束时间选择框
            var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
            // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
            $('#appealEndTime').datetimebox({
                // value: endDate,
                onShowPanel: function () {
                    $("#appealEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                },
                onChange: function () {
                    checkBeginEndTime();
                }
            });

            //申诉发起人
            $("#appealStaffId").searchbox({
                    searcher: function () {
                    }
                }
            );

            //申诉处理人
            $("#appealDealStaffId").searchbox({
                    searcher: function () {
                    }
                }
            );
            //申诉状态下拉框
            $("#appealStatus").combobox({
                url: '../../data/select_init_data.json',
                method: "GET",
                valueField: 'paramsCode',
                textField: 'paramsName',
                panelHeight: 'auto',
                editable: false,
                onLoadSuccess: function () {
                    var appealStatusSelect = $("#appealStatus"),
                        data = appealStatusSelect.combobox('getData');
                    if (data.length > 0) {
                        appealStatusSelect.combobox('select', data[0].paramsCode);
                    }
                },
                onSelect: function () {
                    $("#appealCheckList").datagrid("load");
                }
            });
            CommonAjax.getStaticParams("APPEAL_STATUS", function (datas) {
                if (datas) {
                    appealStatusData = datas;
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    datas.unshift(data);
                    $("#appealStatus").combobox('loadData', datas);
                }
            });

            //申诉处理列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#appealCheckList").datagrid({
                columns: [[
                    {
                        field: 'operate', title: '操作', width: '8%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "appealRecord_' + row.appealId + '">审批记录</a>';
                        }
                    },
                    {
                        field: 'checkType', title: '质检类型', width: '10%',
                        formatter: function (value, row, index) {
                            for (var i = 0; i < checkTypeData.length; i++) {
                                if (checkTypeData[i].paramsCode === value) {
                                    return checkTypeData[i].paramsName;
                                }
                            }
                        }
                    },
                    {field: 'touchId', title: '接触流水', width: '14%'},
                    {
                        field: 'inspectionId', title: '质检流水', width: '14%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "checkFlow_' + row.appealId + '">' + value + '</a>';
                        }
                    },
                    {field: 'appealId', title: '申诉单号', width: '14%'},
                    {field: 'appealStaffName', title: '申诉人', width: '10%'},
                    {field: 'appealReason', title: '申诉原因', width: '14%'},
                    {
                        field: 'appealTime', title: '申诉时间', width: '14%',
                        formatter: function (value, row, index) { //格式化时间格式
                            if (value) {
                                return DateUtil.formatDateTime(value);
                            }
                        }
                    },
                    {field: 'currentNodeName', title: '当前节点', width: '14%'},
                    {
                        field: 'appealStatus', title: '申诉状态', width: '10%',
                        formatter: function (value, row, index) {
                            for (var i = 0; i < appealStatusData.length; i++) {
                                if (appealStatusData[i].paramsCode === value) {
                                    return appealStatusData[i].paramsName;
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
                        appealId = $("#appealId").val(),
                        appealStatus = $("#appealStatus").combobox("getValue");
                    if (appealStatus === "-1") {
                        appealStatus = "";
                    }

                    var reqParams = {
                        "staffId": Util.constants.STAFF_ID,
                        "inspectionId": inspectionId,
                        "appealTimeBegin": appealTimeBegin,
                        "appealTimeEnd": appealTimeEnd,
                        "appealStaffId": appealStaffId,
                        "appealId": appealId,
                        "appealStatus": appealStatus
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_DEAL_DNS + "/queryAppealDeal", params, function (result) {
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
                        if (checkTypeData.length > 0) {
                            success(data);
                        } else {
                            CommonAjax.getStaticParams("CHECK_TYPE", function (datas) {
                                if (datas) {
                                    checkTypeData = datas;
                                    success(data);
                                }
                            });
                        }

                    });
                },
                onLoadSuccess: function (data) {
                    //审批记录
                    $.each(data.rows, function (i, item) {
                        $("#appealRecord_" + item.appealId).on("click", function () {
                            showAppealRecordDialog(item);
                        });
                    });
                    //质检详情
                    $.each(data.rows, function (i, item) {
                        $("#checkFlow_" + item.appealId).on("click", function () {
                            if (item.checkType === Util.constants.CHECK_TYPE_VOICE) {
                                var voiceUrl = createURL(voiceCheckDetail, item);
                                // addTabs(item.inspectionId, voiceUrl);
                                showDialog(voiceUrl, "质检详情", 1200, 650, false);
                            }
                            if (item.checkType === Util.constants.CHECK_TYPE_ORDER) {
                                var orderUrl = createURL(orderCheckDetail, item);
                                // addTabs(item.inspectionId, orderUrl);
                                showDialog(orderUrl, "质检详情", 1200, 650, false);
                            }
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
            $("#resetBtn").on("click", function () {
                $("#searchForm").form('clear');
                $("#appealStatus").combobox('setValue', appealStatusData[0].paramsCode);
            });
        }

        //审批记录弹框
        function showAppealRecordDialog(data) {
            $("#appealLeftDiv").empty();
            $("#appealRightDiv").empty();
            $("#appealRecordDialog").show().window({
                width: 600,
                height: 400,
                modal: true,
                title: "审批记录"
            });
            var reqParams = {
                "appealId": data.appealId
            };
            var params = $.extend({
                "start": 0,
                "pageNum": 0,
                "params": JSON.stringify(reqParams)
            }, Util.PageUtil.getParams($("#searchForm")));

            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_DEAL_DNS + "/queryDealRecord", params, function (result) {
                var record = result.RSP.DATA,
                    rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode !== "1") {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                }
                if (record != null && record.length > 0) {
                    showAppealDealProcess(record);
                }
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
            var beginTime = $("#appealBeginTime").datetimebox("getValue"),
                endTime = $("#appealEndTime").datetimebox("getValue"),
                d1 = new Date(beginTime.replace(/-/g, "\/")),
                d2 = new Date(endTime.replace(/-/g, "\/"));

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

        //显示审批记录
        function showAppealDealProcess(data) {
            var leftDiv = $("#appealLeftDiv"),
                rightDiv = $("#appealRightDiv");
            $.each(data, function (i, item) {
                if (i > 0) {
                    leftDiv.append(getProcessLine());
                }
                leftDiv.append(getLeftDiv(item));
                rightDiv.append(getRightDiv(item));
            });
        }

        //左侧操作区域
        function getLeftDiv(item) {
            return '<div class="panel-transparent"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-8"><div class="fl text-small"></div></div>' +
                '<div class="formControls col-4"><div class="circle"></div></div>' +
                '</div></form></div>';
        }

        //左侧流程线
        function getProcessLine() {
            return '<form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-8" style="margin-left: 8px"><div class="appeal-process-line cl"></div></div>' +
                '</div></form>';
        }

        //右侧流程处理过程列表
        function getRightDiv(item) {
            var approveStatus = "";
            if (item.approveStatus === Util.constants.APPROVE_STATUS_PASS) {
                approveStatus = "通过";
            } else {
                approveStatus = "驳回";
            }
            return '<div style="margin-bottom:30px;">' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批人：' + item.approveStaffName + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批结果：' + approveStatus + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批意见：' + item.approveSuggestion + '</div></div>' +
                '</div></form></div>' +
                '<div class="panel-transparent-20 cl"><form class="form form-horizontal"><div class="cl">' +
                '<div class="formControls col-12"><div class="fl text-small">审批时间：' + DateUtil.formatDateTime(item.approveTime) + '</div></div>' +
                '</div></form> </div>' +
                '</div>';
        }

        //dialog弹框
        //url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层
        function showDialog(url, title, width, height, shadow) {
            var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>';
            var dialogDiv = '<div id="processDetailDialog" title="' + title + '"></div>'; //style="overflow:hidden;"可以去掉滚动条
            $(document.body).append(dialogDiv);
            var win = $('#processDetailDialog').dialog({
                content: content,
                width: width,
                height: height,
                modal: shadow,
                title: title,
                onClose: function () {
                    $(this).dialog('destroy');//后面可以关闭后的事件
                }
            });
            win.dialog('open');
        }

        return {
            initialize: initialize
        };
    }
);