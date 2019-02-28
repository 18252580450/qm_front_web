require(["js/manage/queryQmPlan", "js/manage/workQmResultHistory", "jquery", 'util', "transfer", "easyui", "dateUtil"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, easyui, dateUtil) {
    //初始化方法
    initialize();
    var reqParams = null,
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/workQmResultDetail.html";

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

        //差错类型
        $("#errorType").combobox({
            url: '../../data/errorType.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isDis = $("#errorType");
                var data = isDis.combobox('getData');
                if (data.length > 0) {
                    isDis.combobox('select', data[0].codeValue);
                }
            }
        });
        //申诉结果
        $("#qmResult").combobox({
            url: '../../data/releaseResult.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isDis = $("#qmResult");
                var data = isDis.combobox('getData');
                if (data.length > 0) {
                    isDis.combobox('select', data[0].codeValue);
                }
            }
        });

        //时间控件初始化
        var qmStartTime = $('#qmStartTime');
        qmStartTime.datetimebox({
            onShowPanel: function () {
                $(this).datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onChange: function () {
                checkTime();
            }
        });

        var qmEndTime = $('#qmEndTime');
        qmEndTime.datetimebox({
            onShowPanel: function () {
                $(this).datetimebox("spinner").timespinner("setValue", "23:59:59");
            },
            onChange: function () {
                checkTime();
            }
        });

        //申诉流程列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var checkHistory = "<a href='javascript:void(0);' style='color: deepskyblue;' id ='resultHistory_" + row.inspectionId + "'>质检记录</a>",
                            appeal = "<a href='javascript:void(0);' style='color: deepskyblue;' id ='resultAppeal_" + row.inspectionId + "'>申诉</a>";
                        return appeal + "&nbsp;&nbsp;" + checkHistory;
                    }
                },
                {field: 'touchId', title: '工单流水号', align: 'center', width: '15%'},
                {
                    field: 'inspectionId', title: '质检流水号', align: 'center', width: '15%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" style="color: deepskyblue;" id = "resultDetail_' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {field: 'acceptNumber', title: '客户号码', align: 'center', width: '10%', hidden: true},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'checkedStaffId', title: '被质检人工号', align: 'center', width: '10%'},
                {field: 'checkedDepartId', title: '被质检人班组', align: 'center', width: '10%'},
                {
                    field: 'errorRank', title: '差错类型', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {'0': '无错误', '1': '绝对错误'}[value];
                    }
                },
                {field: 'finalScore', title: '质检得分', align: 'center', width: '10%'},
                {field: 'unqualifiedNum', title: '不合格环节数', align: 'center', width: '10%'},
                {field: 'checkStaffId', title: '质检人工号', align: 'center', width: '10%'},
                {
                    field: 'resultStatus', title: '质检状态', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {
                            '0': '质检新生成', '1': '临时保存', '2': '放弃', '3': '复检', '4': '分检', '5': '被检人确认'
                            , '6': '系统自确认', '7': '申诉中', '8': '申诉通过', '9': '申诉驳回', '99': '系统驳回'
                        }[value];
                    }
                },
                {
                    field: 'checkEndTime', title: '质检时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        return DateUtil.formatDateTime(value);
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
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var workOrderId = $("#workOrderId").val();
                var cusNumber = $("#cusNumber").val();
                var qmStartTime = $("#qmStartTime").datetimebox("getValue");
                var qmEndTime = $("#qmEndTime").datetimebox("getValue");
                var qmDepart = $("#qmDepart").val();
                var qmStaffId = $("#qmStaffId").val();
                var qmedStaffId = $("#qmedStaffId").val();
                var qmedTeam = $("#qmedTeam").val();
                var reqTypeEndNode = $("#reqTypeEndNode").val();
                var checkLink = $("#checkLink").val();
                var minScore = $("#minScore").val();
                var maxScore = $("#maxScore").val();
                if (parseInt(maxScore) < parseInt(minScore)) {
                    $.messager.alert("提示", "质检评分最小值不能高于最大值！");
                    return false;
                }
                var qmResult = $("#qmResult").combobox("getValue");
                var errorType = $("#errorType").combobox("getValue");
                var planId = $("#planId").val();

                reqParams = {
                    "touchId": workOrderId,
                    "acceptNumber": cusNumber,
                    "checkDepartName": qmDepart,
                    "checkStaffId": qmStaffId,
                    "qmStartTime": qmStartTime,
                    "qmEndTime": qmEndTime,
                    "checkedStaffId": qmedStaffId,
                    "checkedDepartName": qmedTeam,
                    "checkLink": checkLink,
                    "minScore": minScore,
                    "maxScore": maxScore,
                    "resultStatus": qmResult,
                    "errorRank": errorType,
                    "planId": planId,
                    "reqTypeEndNode": reqTypeEndNode,
                    "lastResultFlag": "1"
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WORK_QM_RESULT + "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    var dataNew = [];
                    for (var i = 0; i < data.rows.length; i++) {
                        var map = data.rows[i];
                        if (map.qmPlan != null) {
                            map["planName"] = map.qmPlan.planName;
                        }
                        dataNew.push(map);
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
                    success(dataNew);
                });
            },
            onLoadSuccess: function (data) {
                //详情
                $.each(data.rows, function (i, item) {
                    $("#resultDetail_" + item.inspectionId).on("click", function () {
                        var url = createURL(orderCheckDetail, item);
                        showDialog(url, "质检详情", 1200, 600);
                    });
                });
                //质检历史
                $.each(data.rows, function (i, item) {
                    $("#resultHistory_" + item.inspectionId).on("click", function () {
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
                //申诉
                $.each(data.rows, function (i, item) {
                    $("#resultAppeal_" + item.inspectionId).on("click", function () {
                        //判断是否已有申诉流程
                        // if (item.appealId != null && item.resultStatus === Util.constants.CHECK_RESULT_APPEALING) {
                        //     $.messager.alert("提示", "申诉中！申诉单号：" + item.appealId + "!");
                        //     return;
                        // }
                        showAppealDialog(item);
                    });
                });
            }
        });
    }

    //申诉
    function showAppealDialog(data) {
        $("#appealConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#appealDialog").show().window({
            width: 600,
            height: 350,
            modal: true,
            title: "质检结果申诉"
        });

        //申诉原因
        $("#appealReason").textbox(
            {
                multiline: true
            }
        );

        //取消
        var cancelBtn = $("#cancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#appealConfig").form('clear');  //清空表单
            $("#appealDialog").window("close");
        });
        //提交
        var submitBtn = $("#submitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return false;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var appealReason = $("#appealReason").val();

            if (appealReason == null || appealReason === "") {
                $.messager.alert("提示", "申诉原因不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            var params = {
                "departmentId": data.checkedDepartId,
                "tenantId": data.tenantId,
                "provinceId": data.provinceId,
                "checkType": Util.constants.CHECK_TYPE_ORDER,
                "touchId": data.touchId,
                "inspectionId": data.inspectionId,
                "planId": data.planId,
                "templateId": data.templateId,
                "appealStaffId": data.checkedStaffId,
                "appealStaffName": data.checkedStaffName,
                "appealReason": appealReason
            };
            Util.loading.showLoading();
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.APPEAL_DEAL_DNS).concat("/submit"), JSON.stringify(params), function (result) {
                Util.loading.destroyLoading();
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    $("#appealDialog").window("close");  //关闭对话框
                    $("#queryInfo").datagrid("reload"); //刷新列表
                } else {
                    var errMsg = "申诉失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
                }
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
            });
        });
    }

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;//顶层的window对象.取得整个父页面对象
        //重写jndex.js中的方法
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

    //后端导出
    function dao() {
        var fields = $('#queryInfo').datagrid('getColumnFields'); //获取datagrid的所有fields
        var titles = [];
        fields.forEach(function (value, index, array) {
            var title = $('#queryInfo').datagrid('getColumnOption', value).title;//获取datagrid的title
            title = (title != null) ? title : "";
            titles.push(title);
        });
        if (reqParams == null) {
            reqParams = {
                "touchId": "",
                "acceptNumber": "",
                "checkDepartName": "",
                "checkStaffId": "",
                "qmStartTime": "",
                "qmEndTime": "",
                "checkedStaffId": "",
                "checkedDepartName": "",
                "checkLink": "",
                "minScore": "",
                "maxScore": "",
                "resultStatus": "0",
                "errorRank": "0",
                "planId": "",
                "reqTypeEndNode": "",
                "lastResultFlag": "1"
            };
        }
        var params = {
            "start": 0,
            "pageNum": 0,
            "fields": JSON.stringify(fields),
            "titles": JSON.stringify(titles),
            "params": JSON.stringify(reqParams)
        };
        // 采用encodeURI两次编码,防止乱码
        window.location.href = Util.constants.CONTEXT + Util.constants.WORK_QM_RESULT + "/export?params=" + encodeURI(encodeURI(JSON.stringify(params)));
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#queryInfo").datagrid("load");
        });

        //清空
        $("#clearBtn").on("click", function () {
            $("#page input").val("");
        });

        //导出
        $("#daoBut").on("click", function () {
            dao();
        });

    }

    //校验开始时间和终止时间
    function checkTime() {
        var qmStartTime = $("#qmStartTime").datetimebox("getValue");
        var qmEndTime = $("#qmEndTime").datetimebox("getValue");
        var d1 = new Date(qmStartTime.replace(/-/g, "\/"));
        var d2 = new Date(qmEndTime.replace(/-/g, "\/"));

        if (qmStartTime !== "" && qmEndTime !== "" && d1 > d2) {
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

    //dialog弹框
    //url：窗口调用地址，title：窗口标题，width：宽度，height：高度，shadow：是否显示背景阴影罩层
    function showDialog(url, title, width, height) {
        var content = '<iframe src="' + url + '" width="100%" height="100%" frameborder="0" scrolling="auto"></iframe>',
            dialogDiv = '<div id="resultDialog" title="' + title + '"></div>'; //style="overflow:hidden;"可以去掉滚动条
        $(document.body).append(dialogDiv);
        var win = $('#resultDialog').dialog({
            content: content,
            width: width,
            height: height,
            modal: true,
            title: title,
            onClose: function () {
                $(this).dialog('destroy');//后面可以关闭后的事件
            }
        });
        win.dialog('open');
    }

    //点击后添加页面
    $("#page").on("click", "a.processIdBtn", function () {

        addTabs("工单质检详情", "");
    });

    return {
        initialize: initialize
    };
});