require(["jquery", "util", "commonAjax", "dateUtil", "transfer", "easyui"], function ($, Util, CommonAjax) {

    var voicePool,               //质检数据
        templateId,              //考评模版Id
        scoreType,               //分值类型（默认扣分）
        startTime,               //页面初始化时间
        checkItemScoreList = [], //考评项评分列表
        caseTypeData,            //典型类型静态数据
        qmCheckUrl = Util.constants.URL_CONTEXT + "/qm/html/execution/qmCheck.html";

    initialize();

    function initialize() {
        //获取y语音流水、质检流水等信息
        CommonAjax.getUrlParams(function (data) {
            voicePool = data;
            initPageInfo();
            initEvent();
            getCheckComment();
            startTime = new Date();
        });
    }

    //页面信息初始化
    function initPageInfo() {
        //加载录音
        var voicePlayer = $("#voicePlayer");
        voicePlayer.attr('src', "../../data/voice2.wav");
        // voicePlayer.attr('src', voicePool.recordPath); //todo
        voicePlayer.get('0').load();

        var touchBeginTime = "",
            callType = "",
            callDuration = "";

        if (voicePool.beginTime !== "null" && voicePool.beginTime !== "") {
            touchBeginTime = DateUtil.formatDateTime(parseInt(voicePool.beginTime));
        }
        if (voicePool.callType === "0") {
            callType = "呼入";
        } else if (voicePool.callType === "1") {
            callType = "呼出";
        }
        if (voicePool.talkDuration !== "null" && voicePool.talkDuration !== "") {
            callDuration = DateUtil.formatDateTime2(parseInt(voicePool.talkDuration));
        }

        //基本信息初始化
        $("#checkedStaffName").val(voicePool.checkedStaffName);
        $("#checkedDepartName").val(voicePool.departName);
        $("#touchId").val(voicePool.touchId);
        $("#touchBeginTime").val(touchBeginTime);
        if (voicePool.callType === "0") {
            $("#staffNumber").val(voicePool.customerNumber);
            $("#customerNumer").val(voicePool.staffNumber);
        } else if (voicePool.callType === "1") {
            $("#staffNumber").val(voicePool.staffNumber);
            $("#customerNumber").val(voicePool.customerNumber);
        }
        $("#callType").val(callType);
        $("#callDuration").val(callDuration);

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemName', title: '考评项名称', width: '18%'},
                {
                    field: 'checkItemVitalType', title: '类别', width: '15%',
                    formatter: function (value, row, index) {
                        var vitalType = null;
                        if (value != null && value === "0") {
                            vitalType = "非致命性";
                        }
                        if (value != null && value === "1") {
                            vitalType = "致命性";
                        }
                        return vitalType;
                    }
                },
                {field: 'remark', title: '描述', width: '23%'},
                {field: 'nodeScore', title: '所占分值', width: '15%'},
                {
                    field: 'scoreScope', title: '扣分区间', width: '10%',
                    formatter: function (value, row, index) {
                        var min = "0",
                            max = "0";
                        if (row.minScore != null) {
                            min = row.minScore;
                        }
                        if (row.maxScore != null) {
                            max = row.maxScore;
                        }
                        return min + "-" + max;
                    }
                },
                {
                    field: 'score', title: '扣分分值', width: '20%',
                    formatter: function (value, row, index) {
                        return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="0">';
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 200,
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#checkItemList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#checkItemList").datagrid("selectRow", rowIndex);
                }
            },
            onLoadSuccess: function (data) {
                //扣分分值输入框
                $.each(data.rows, function (i, item) {
                    var input = $("#score" + item.nodeId);
                    input.on("keyup", function () {
                        var totalScore = 0,
                            maxScore = $("#maxScore" + item.nodeId).val(),
                            scoreDiv = $("#score" + item.nodeId),
                            score = scoreDiv.val();
                        if (parseInt(score) > parseInt(maxScore)) {
                            scoreDiv.val(score.substring(0, score.length - 1));
                            $.messager.alert("提示", "扣分值超过扣分上限!");
                            return false;
                        }
                        $.each(data.rows, function (i, item) {
                            var inputScore = $("#score" + item.nodeId);
                            if (inputScore.val() !== "") {
                                totalScore = totalScore + parseInt(inputScore.val());
                            }
                        });
                        $("#checkScore").val(String(100 - totalScore));
                    });
                    input.on("blur", function () {
                        var score = input.val();
                        if (score === "") {
                            input.val("0");
                        }
                        //更新考评项评分列表
                        $.each(checkItemScoreList, function (i, data) {
                            if (item.nodeId === data.nodeId) {
                                data.realScore = parseInt(item.nodeScore) - parseInt(score);
                            }
                        });
                    });
                });
            }
        });

        initCheckArea();
    }

    //事件初始化
    function initEvent() {
        //保存
        $("#saveBtn").on("click", function () {
            if (voicePool.poolStatus === Util.constants.CHECK_STATUS_RECHECK) {
                checkSubmit(Util.constants.CHECK_FLAG_RECHECK_SAVE);  //复检保存
            } else {
                checkSubmit(Util.constants.CHECK_FLAG_CHECK_SAVE);  //质检保存
            }
        });
        //提交
        $("#submitBtn").on("click", function () {
            if (voicePool.poolStatus === Util.constants.CHECK_STATUS_RECHECK) {
                checkSubmit(Util.constants.CHECK_FLAG_RECHECK);  //复检
            } else {
                checkSubmit(Util.constants.CHECK_FLAG_NEW_BUILD); //质检
            }
        });
        //取消
        $("#cancelBtn").on("click", function () {
            //关闭语音质检详情
            CommonAjax.closeMenuByNameAndId("语音质检详情", voicePool.touchId);
        });
        //案例收集
        $("#caseCollectBtn").on("click", function () {
            typicalCaseAddDialog();
        });
    }

    function getCheckComment() {
        //考评评语下拉框
        $("#checkCommentSearch").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'commentId',
            textField: 'commentName',
            panelHeight: 300,
            editable: false,
            onSelect: function (record) {//下拉框选中时触发
                var checkComment = $("#checkComment");
                if (record.commentId === "-1") {
                    checkComment.show();
                    checkComment.val("");
                } else {
                    checkComment.hide();
                    checkComment.val(record.commentName);
                }
            }
        });

        var reqParams = {//入参
            "parentCommentId": "",
            "commentName": ""
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        //查询
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDINARY_COMMENT + "/selectByParams", params, function (result) {
            if (result.RSP.RSP_CODE === "1") {
                var data = result.RSP.DATA,
                    map = {
                        "commentId": "-1",
                        "commentName": "其他"
                    };
                data.unshift(map);
                $("#checkCommentSearch").combobox('loadData', data);
            }
        });
    }

    //初始化考评项列表
    function initCheckArea() {
        //考评项详细信息
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "planId": voicePool.planId,
            "templateId": voicePool.templateId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItemDetail", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            } else {
                var checkItemData = result.RSP.DATA;
                //模版id
                templateId = checkItemData[0].templateId;
                //分值类型
                scoreType = checkItemData[0].scoreType;
                if (scoreType === "0") {
                    $("#scoreType").val("合格");
                }
                if (scoreType === "1") {
                    $("#scoreType").val("得分");
                }
                if (scoreType === "2") {
                    $("#scoreType").val("扣分");
                }
                //初始化考评项列表
                $("#checkItemList").datagrid("loadData", {rows: checkItemData});

                //查询暂存数据
                var reqParams = {
                    "tenantId": Util.constants.TENANT_ID,
                    "touchId": voicePool.touchId
                };
                var params = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_CHECK_DNS + "/querySavedResult", params, function (result) {
                    var totalScore = 0;    //考评项总得分
                    if (result.RSP.RSP_CODE === "1") {
                        var savedData = result.RSP.DATA;
                        $.each(savedData, function (i, item) {
                            var checkItem = {};
                            checkItem.nodeType = item.nodeType;
                            checkItem.nodeId = item.nodeId;
                            checkItem.nodeName = item.nodeName;
                            checkItem.scoreScope = item.scoreScope;
                            checkItem.realScore = item.realScore;
                            checkItem.minScore = item.minScore;
                            checkItem.maxScore = item.maxScore;
                            checkItemScoreList.push(checkItem);
                            //考评项总得分
                            totalScore += item.realScore;
                        });
                    } else {  //无暂存数据则默认满分
                        $.each(checkItemData, function (i, item) {
                            var checkItem = {};
                            checkItem.nodeType = item.nodeType;
                            checkItem.nodeId = item.nodeId;
                            checkItem.nodeName = item.nodeName;
                            checkItem.scoreScope = item.nodeScore;
                            checkItem.realScore = item.nodeScore;
                            if (item.minScore != null) {
                                checkItem.minScore = item.minScore;
                            } else {
                                checkItem.minScore = 0;
                            }
                            if (item.maxScore != null) {
                                checkItem.maxScore = item.maxScore;
                            } else {
                                checkItem.maxScore = item.nodeScore;
                            }
                            checkItemScoreList.push(checkItem);
                            //考评项总得分
                            totalScore += item.nodeScore;
                        });
                    }
                    //刷新评价区数据
                    refreshCheckArea(totalScore);
                });
            }
        });

        //初始化考评评语
        var reqParam = {
            "tenantId": Util.constants.TENANT_ID,
            "touchId": voicePool.touchId,
            "resultStatus": Util.constants.CHECK_RESULT_TEMP_SAVE
        };
        var param = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParam)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_CHECK_DNS + "/queryVoiceCheckResult", param, function (result) {
            if (result.RSP.RSP_CODE === "1") {
                var checkComment = $("#checkComment");
                checkComment.html(result.RSP.DATA[0].checkComment);
                checkComment.show();
            }
        });
    }

    //更新评价区数据
    function refreshCheckArea(totalScore) {
        $("#checkScore").val(totalScore);  //总得分
        //考评项列表
        $.each(checkItemScoreList, function (index, item) {
            $.each(checkItemScoreList, function (scoreIndex, scoreItem) {
                if (item.nodeId === scoreItem.nodeId) {
                    var score = (scoreItem.scoreScope - scoreItem.realScore).toString();
                    $("#score" + item.nodeId).val(score);
                }
            });
        });
    }

    function checkSubmit(checkStatus) {
        //未绑定考评项的情况
        if (checkItemScoreList.length === 0) {
            $.messager.alert("提示", "未指定考评项!");
            return;
        }

        var currentTime = new Date(),
            checkTime = currentTime - startTime,
            finalScore = $("#checkScore").val(),
            checkStartTime = DateUtil.formatDateTime(parseInt(voicePool.operateTime)),
            checkComment = $("#checkComment").val();
        var voiceCheckResult = {
            "tenantId": Util.constants.TENANT_ID,                    //租户id
            "provinceId": voicePool.provinceId,                      //省份id
            "callingNumber": voicePool.staffNumber,                  //主叫号码
            "acceptNumber": voicePool.customerNumber,                //被叫号码
            "touchId": voicePool.touchId,                            //语音流水
            "planId": voicePool.planId,                              //考评计划
            "templateId": templateId,                                //考评模版ID
            "checkModel": Util.constants.CHECK_TYPE_WITHIN_PLAN,     //质检模式、计划内质检
            "checkedStaffId": voicePool.checkedStaffId,              //被质检员id
            "checkedStaffName": voicePool.checkedStaffName,          //被质检员名
            "checkedDepartId": Util.constants.CHECKED_DEPART_ID,     //被质检部门id 暂时
            "checkedDepartName": "",                                 //被质检部门名称
            "checkStaffId": voicePool.checkStaffId,                  //质检员id
            "checkStaffName": voicePool.checkStaffName,              //质检员名
            "checkDepartId": "",                                     //质检部门id
            "checkDepartName": "",                                   //质检部门名称
            "checkStartTime": checkStartTime,                        //质检开始时间（质检分配时间）
            "checkTime": checkTime,                                  //质检时长
            "scoreType": scoreType,                                  //分值类型
            "resultStatus": checkStatus,                             //质检结果状态（保存or提交）
            "finalScore": finalScore,                                //最终得分
            "checkComment": checkComment                             //考评评语
        };

        var params = {
            "voiceCheckResult": voiceCheckResult,
            "checkItemList": checkItemScoreList
        };
        Util.loading.showLoading();
        Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.VOICE_CHECK_DNS).concat("/"), JSON.stringify(params), function (result) {

            Util.loading.destroyLoading();
            var errMsg = "提交失败！<br>";
            if (checkStatus === Util.constants.CHECK_FLAG_CHECK_SAVE || checkStatus === Util.constants.CHECK_FLAG_RECHECK_SAVE) {
                errMsg = "保存失败！<br>";
            }
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {
                $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                    CommonAjax.closeMenuByNameAndId("语音质检详情", voicePool.touchId);
                    CommonAjax.refreshMenuByUrl(qmCheckUrl, "质检待办区", "质检待办区");
                });
            } else {
                $.messager.alert("提示", errMsg + result.RSP.RSP_DESC);
            }
        });
    }

    //典型案例收集
    function typicalCaseAddDialog() {
        $("#typicalCaseConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#typicalCaseAddDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "典型案例收集"
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

        //添加原因
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
                "touchId": voicePool.touchId,
                "createStaffId": voicePool.checkStaffId,
                "createStaffName": voicePool.checkStaffName,
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

    return {
        initialize: initialize
    };
});