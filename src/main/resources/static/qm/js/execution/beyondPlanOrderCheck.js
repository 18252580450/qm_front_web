require([
        "js/execution/qryCheckTemplate",
        "jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui"],
    function (QryCheckTemplate, $, Util, Transfer, CommonAjax) {

        var orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanOrderCheckDetail.html";

        initialize();

        function initialize() {
            initPageInfo();
            initEvent();
        }

        //页面信息初始化
        function initPageInfo() {

            //归档开始时间选择框
            // var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
            var beginDate = "2018-10-10 00:00:00";
            $("#arcBeginTime").datetimebox({
                // value: beginDate,
                onShowPanel: function () {
                    $("#arcBeginTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
                },
                onChange: function () {
                }
            });

            //归档结束时间选择框
            var endDate = (DateUtil.formatDateTime(new Date())).substr(0, 11) + "00:00:00";
            // var endDate = (DateUtil.formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
            $('#arcEndTime').datetimebox({
                // value: endDate,
                onShowPanel: function () {
                    $("#arcEndTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
                },
                onChange: function () {
                }
            });

            //立单人搜索框
            $('#acptStaffName').searchbox({//输入框点击查询事件
                searcher: function (value) {

                }
            });

            //待质检工单列表
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#orderCheckList").datagrid({
                columns: [[
                    {
                        field: 'operate', title: '操作', width: '8%',
                        formatter: function (value, row, index) {
                            return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "orderCheck_' + row.wrkfmId + '">质检</a>';
                        }
                    },
                    {field: 'wrkfmShowSwftno', title: '工单流水', width: '15%'},
                    {field: 'bizTitle', title: '工单标题', align: 'center', width: '10%'},
                    {field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '15%'},
                    {field: 'custEmail', title: '客户账号', align: 'center', width: '10%'},
                    {field: 'custName', title: '客户名称', align: 'center', width: '10%'},
                    {field: 'custNum', title: '客户号码', align: 'center', width: '10%'},
                    {field: 'handleDuration', title: '处理时长', align: 'center', width: '10%'},
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
                    var start = (param.page - 1) * param.rows,
                        pageNum = param.rows,
                        wrkfmShowSwftno = $("#orderId").val(),
                        acptStaffId = $("#acptStaffId").val(),
                        arcBeginTime = $("#arcBeginTime").datetimebox("getValue"),
                        arcEndTime = $("#arcEndTime").datetimebox("getValue"),
                        custName = $("#custName").val(),
                        custNum = $("#custNum").val();

                    var reqParams = {
                        "wrkfmShowSwftno": wrkfmShowSwftno,
                        "acptStaffId": acptStaffId,
                        "arcBeginTime": arcBeginTime,
                        "arcEndTime": arcEndTime,
                        "custName": custName,
                        "custNum": custNum
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm")));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.BEYOND_PLAN_ORDER_POOL_DNS + "/queryQmWorkform", params, function (result) {
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
                    //质检
                    $.each(data.rows, function (i, item) {
                        $("#orderCheck_" + item.wrkfmId).on("click", function () {
                            if (item.templateId == null) {
                                var qryCheckTemplate = new QryCheckTemplate(Util.constants.CHECK_TYPE_ORDER, item);
                                $('#qry_window').show().window({
                                    title: '选择考评模版',
                                    width: 950,
                                    height: 550,
                                    cache: false,
                                    content: qryCheckTemplate.$el,
                                    modal: true
                                });
                            } else {
                                var param = {
                                    "provCode": item.provCode,
                                    "wrkfmId": item.wrkfmId,
                                    "templateId": item.templateId,
                                    "acptStaffNum": item.acptStaffNum,
                                    "srvReqstTypeNm": item.srvReqstTypeNm,
                                    "actualHandleDuration": item.actualHandleDuration
                                };
                                var url = createURL(orderCheckDetail, param);
                                addTabs("工单质检" + item.wrkfmShowSwftno, url);
                            }
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

        return {
            initialize: initialize
        };
    });