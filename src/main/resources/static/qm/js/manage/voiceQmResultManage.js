require(["js/manage/queryQmPlan", "js/manage/voiceQmResultHistory", "jquery", 'util', "transfer", "easyui", "dateUtil", "commonAjax"], function (QueryQmPlan, QueryQmHistory, $, Util, Transfer, easyui, dateUtil, CommonAjax) {
    //初始化方法
    initialize();
    var userInfo,
        userPermission,
        departmentId,  //虚拟组id
        caseTypeData,  //典型案例类型下拉框静态数据
        reqParams = null,
        voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/manage/voiceQmResultDetail.html";

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            Util.getRoleCode(userInfo, function (dataNew) {
                userPermission = dataNew;//用户权限
                initPageInfo();
                initEvent();
            });
            getStaffDepart();
        });
    }

    //页面信息初始化
    function initPageInfo() {

        $('#checkStaffName').searchbox({ //质检人员查询
            editable: false,//禁止手动输入
            searcher: function (value) {
                require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                    var queryQmPeople = qryQmPeople;
                    queryQmPeople.initialize("", "2");
                    $('#qry_people_window').show().window({
                        title: '查询质检人员信息',
                        width: Util.constants.DIALOG_WIDTH,
                        height: Util.constants.DIALOG_HEIGHT_SMALL,
                        cache: false,
                        content: queryQmPeople.$el,
                        modal: true,
                        onBeforeClose: function () {//弹框关闭前触发事件
                            var map = queryQmPeople.getMap();//获取值
                            $('#checkStaffId').val(map.staffId);
                            $('#checkStaffName').searchbox("setValue", map.staffName);
                        }
                    });
                });
            }
        });

        $('#checkedStaffName').searchbox({ //质检人员查询
            editable: false,//禁止手动输入
            searcher: function (value) {
                require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                    var queryQmPeople = qryQmPeople;
                    queryQmPeople.initialize("", "2");
                    $('#qry_people_window').show().window({
                        title: '查询质检人员信息',
                        width: Util.constants.DIALOG_WIDTH,
                        height: Util.constants.DIALOG_HEIGHT_SMALL,
                        cache: false,
                        content: queryQmPeople.$el,
                        modal: true,
                        onBeforeClose: function () {//弹框关闭前触发事件
                            var map = queryQmPeople.getMap();//获取值
                            $('#checkedStaffId').val(map.staffId);
                            $('#checkedStaffName').searchbox("setValue", map.staffName);
                        }
                    });
                });
            }
        });

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

        //质检状态
        $("#resultStatus").combobox({
            url: '../../data/releaseResult.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var resultStatus = $("#resultStatus");
                var data = resultStatus.combobox('getData');
                if (data.length > 0) {
                    resultStatus.combobox('select', data[11].codeValue);
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
                    isDis.combobox('select', data[11].codeValue);
                }
            }
        });

        //时间控件初始化
        var startTime = $('#startTime');
        startTime.datetimebox({
            onShowPanel: function () {
                $(this).datetimebox("spinner").timespinner("setValue", "00:00:00");
            },
            onChange: function () {
                checkTime();
            }
        });

        var endTime = $('#endTime');
        endTime.datetimebox({
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
                    field: 'action', title: '操作', align: 'center', width: '15%',
                    formatter: function (value, row, index) {
                        var checkHistory = "<a href='javascript:void(0);' id='resultHistory_" + row.inspectionId + "'>质检记录</a>",
                            appeal = "<a href='javascript:void(0);' id='resultAppeal_" + row.inspectionId + "'>申诉</a>",
                            typicalCase = "<a href='javascript:void(0);' id ='typicalCase_" + row.inspectionId + "'>案例收集</a>";
                        return appeal + "&nbsp;&nbsp;" + checkHistory + "&nbsp;&nbsp;" + typicalCase;
                    }
                },
                {field: 'touchId', title: '语音流水', align: 'center', width: '15%'},
                {
                    field: 'inspectionId', title: '质检流水', align: 'center', width: '15%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "resultDetail_' + row.inspectionId + '">' + value + '</a>';
                    }
                },
                {field: 'callingNumber', title: '主叫号码', align: 'center', width: '10%'},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'acceptNumber', title: '服务号码', align: 'center', width: '10%', hidden: true},
                {field: 'checkStaffName', title: '质检人', align: 'center', width: '10%'},
                {field: 'checkedStaffName', title: '被质检人', align: 'center', width: '10%'},
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
                    field: 'errorRank', title: '差错类型', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {'0': '无错误', '1': '绝对错误'}[value];
                    }
                },
                {field: 'finalScore', title: '质检得分', align: 'center', width: '10%'},
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
                var checkedStaffId = "";
                var checkStaffId = "";
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var touchId = $("#touchId").val();
                if (userPermission == "checker") {
                    checkStaffId = userInfo.staffId + "";
                } else {
                    checkStaffId = $("#checkStaffId").val();
                }
                var startTime = $("#startTime").datetimebox("getValue");
                var endTime = $("#endTime").datetimebox("getValue");
                if (userPermission == "staffer") {
                    checkedStaffId = userInfo.staffId + "";
                } else {
                    checkedStaffId = $("#checkedStaffId").val();
                }
                var inspectionId = $("#inspectionId").val();
                var resultStatus = $("#resultStatus").combobox("getValue");
                if (resultStatus == "10") {
                    resultStatus = "";
                }
                var planId = $("#planId").val();

                reqParams = {
                    "touchId": touchId,
                    "checkStaffId": checkStaffId,
                    "checkedStaffId": checkedStaffId,
                    "startTime": startTime,
                    "endTime": endTime,
                    "inspectionId": inspectionId,
                    "resultStatus": resultStatus,
                    "planId": planId,
                    "lastResultFlag": "1"
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_QM_RESULT + "/selectByParams", params, function (result) {
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
                    var json = {"rows": dataNew, "total": result.RSP.ATTACH.TOTAL};
                    success(json);
                });
            },
            onLoadSuccess: function (data) {
                $.each(data.rows, function (i, item) {
                    //申诉
                    $("#resultAppeal_" + item.inspectionId).on("click", function () {
                        //临时保存的结果禁止申诉
                        if ( item.resultStatus === Util.constants.CHECK_RESULT_TEMP_SAVE) {
                            $.messager.alert("提示", "暂存结果不能申诉!");
                            return;
                        }
                        //判断是否已有申诉流程
                        // if (item.appealId != null && item.resultStatus === Util.constants.CHECK_RESULT_APPEALING) {
                        //     $.messager.alert("提示", "申诉中！申诉单号：" + item.appealId + "!");
                        //     return;
                        // }
                        showAppealDialog(item);
                    });
                    //质检历史
                    $("#resultHistory_" + item.inspectionId).on("click", function () {
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
                    //典型案例收集
                    $("#typicalCase_" + item.inspectionId).on("click", function () {
                        typicalCaseAddDialog(item);
                    });
                    //详情
                    $("#resultDetail_" + item.inspectionId).on("click", function () {
                        var url = CommonAjax.createURL(voiceCheckDetail, item);
                        CommonAjax.showDialog(url, "质检详情", Util.constants.DIALOG_WIDTH, Util.constants.DIALOG_HEIGHT_SMALL);
                    });
                });
            }
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

    //后端导出
    function dao() {
        var fields = $('#queryInfo').datagrid('getColumnFields'); //获取datagrid的所有fields
        var titles = [];
        var checkStaffId = "";
        var checkedStaffId = "";
        fields.forEach(function (value, index, array) {
            var title = $('#queryInfo').datagrid('getColumnOption', value).title;//获取datagrid的title
            title = (title != null) ? title : "";
            titles.push(title);
        });
        if (userPermission == "checker") {
            checkStaffId = userInfo.staffId + "";
        } else {
            checkStaffId = $("#checkStaffId").val();
        }
        if (userPermission == "staffer") {
            checkedStaffId = userInfo.staffId + "";
        } else {
            checkedStaffId = $("#checkedStaffId").val();
        }
        if (reqParams == null) {
            reqParams = {
                "touchId": "",
                "checkStaffId": checkStaffId,
                "checkedStaffId": checkedStaffId,
                "startTime": "",
                "endTime": "",
                "inspectionId": "",
                "resultStatus": "",
                "planId": "",
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
        window.location.href = Util.constants.CONTEXT + Util.constants.VOICE_QM_RESULT + "/export?params=" + encodeURI(encodeURI(JSON.stringify(params)));
    }

    //事件初始化
    function initEvent() {
        if (userPermission == "staffer") {//话务员（没有任何功能权限）
            //话务员只能查询被质检员是自己的数据
            $("#checkedStaffId").val(userInfo.staffId + "");
            $('#checkedStaffName').searchbox("setValue", userInfo.staffName);
            //清除搜索框图标
            var icon = $('#checkedStaffName').searchbox("getIcon", 0);
            icon.css("visibility", "hidden");
        } else if (userPermission == "checker") {
            //质检员只能查询质检员是自己的数据
            $("#checkStaffId").val(userInfo.staffId + "");
            $('#checkStaffName').searchbox("setValue", userInfo.staffName);
            //清除搜索框图标
            var icon = $('#checkStaffName').searchbox("getIcon", 0);
            icon.css("visibility", "hidden");
        }

        //查询
        $("#queryBtn").on("click", function () {
            $("#queryInfo").datagrid("load");
        });

        //修改
        $("#modifyBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");//选中多行
            if (selRows.length == 0 || selRows.length > 1) {
                $.messager.alert("提示", "请只选择一行数据!");
                return false;
            }
            var map = {};
            for (var i = 0; i < selRows.length; i++) {
                map["touchId"] = selRows[i].touchId;
                map["inspectionId"] = selRows[i].inspectionId;
                map["checkedStaffId"] = selRows[i].checkedStaffId;
                map["acceptNumber"] = selRows[i].acceptNumber;
            }
            addTabs("修改语音质检详情", "http://127.0.0.1:8080/qm/html/manage/modiVoiceQmResultManage.html?touchId=" + map["touchId"] +
                "&inspectionId=" + map["inspectionId"] + "&checkedStaffId=" + map["checkedStaffId"] + "&acceptNumber=" + map["acceptNumber"]);
        });

        //导出
        $("#daoBut").on("click", function () {
            dao();
        });

        //重置
        $("#clearBtn").on("click", function () {
            $("#page input").val("");
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
                "departmentId": departmentId,
                "tenantId": data.tenantId,
                "provinceId": data.provinceId,
                "checkType": Util.constants.CHECK_TYPE_VOICE,
                "touchId": data.touchId,
                "inspectionId": data.inspectionId,
                "planId": data.planId,
                "templateId": data.templateId,
                "appealStaffId": userInfo.staffId + "",
                "appealStaffName": userInfo.staffName,
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

    //典型案例收集
    function typicalCaseAddDialog(data) {
        $("#typicalCaseConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#typicalCaseAddDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "质检结果申诉"
        });

        //典型案例下拉框
        $("#caseType").combobox({
            data: caseTypeData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var caseType = $("#caseType");
                var data = caseType.combobox('getData');
                if (data.length > 0) {
                    caseType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //初始下拉框数据
        if (caseTypeData == null) {
            CommonAjax.getStaticParams("TYPICAL_CASE_TYPE", function (datas) {
                if (datas) {
                    caseTypeData = datas;
                    $("#caseType").combobox('loadData', datas);
                }
            });
        }

        //申诉原因
        $("#addReason").textbox(
            {
                multiline: true
            }
        );

        //取消
        var cancelBtn = $("#typicalCaseCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#typicalCaseConfig").form('clear');  //清空表单
            $("#typicalCaseAddDialog").window("close");
        });
        //提交
        var submitBtn = $("#typicalCaseSubmitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return false;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var caseTitle = $("#caseTitle").val(),
                caseType = $("#caseType").combobox("getValue"),
                addReason = $("#addReason").val();

            if (caseTitle == null || caseTitle === "") {
                $.messager.alert("提示", "案例标题不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            if (caseType == null || caseType === "") {
                $.messager.alert("提示", "案例类型不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            if (addReason == null || addReason === "") {
                $.messager.alert("提示", "添加案例原因不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            var params = {
                "caseTitle": caseTitle,
                "caseType": caseType,
                "checkType": Util.constants.CHECK_TYPE_VOICE,
                "inspectionId": data.inspectionId,
                "createStaffId": userInfo.staffId + "",
                "createStaffName": userInfo.staffName,
                "createReason": addReason
            };
            Util.loading.showLoading();
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.TYPICAL_CASE_DNS).concat("/"), JSON.stringify(params), function (result) {
                Util.loading.destroyLoading();
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    $("#typicalCaseAddDialog").window("close");  //关闭对话框
                } else {
                    var errMsg = "添加失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
                }
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
            });
        });
    }

    //校验开始时间和终止时间
    function checkTime() {
        var startTime = $("#startTime").datetimebox("getValue");
        var endTime = $("#endTime").datetimebox("getValue");
        var d1 = new Date(startTime.replace(/-/g, "\/"));
        var d2 = new Date(endTime.replace(/-/g, "\/"));

        if (startTime !== "" && startTime !== "" && d1 > d2) {
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

    //点击后添加页面
    $("#page").on("click", "a.processIdBtn", function () {

        addTabs("工单质检详情", "");
    });

    //获取虚拟组信息
    function getStaffDepart() {
        var reqParams = {
            "groupId": "",
            "staffName": "",
            "staffId": userInfo.staffId + "",
            "start": 0,
            "limit": 0,
            "provCode": "",
            "roleCode": ""
        };
        var params = {
            "params": JSON.stringify(reqParams)
        };

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {
                departmentId = result.RSP.DATA[0].jsonArray[0].GROUP_ID;
            }
        });
    }

    return {
        initialize: initialize
    };
});