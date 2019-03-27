require(["jquery", "util", "commonAjax", "dateUtil", "transfer", "easyui"], function ($, Util, CommonUtil) {

    var voicePool,               //质检数据
        templateId,              //考评模版Id
        scoreType,               //分值类型（默认扣分）
        startTime,               //页面初始化时间
        checkItemScoreList = []; //考评项评分列表
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();

        startTime = new Date();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取y语音流水、质检流水等信息
        voicePool = CommonUtil.getUrlParams();

        var createTime = "";

        if (voicePool.checkedTime !== "") {
            createTime = DateUtil.formatDateTime(parseInt(voicePool.checkedTime));
        }

        //基本信息初始化
        $("#checkedStaffName").val(voicePool.checkedStaffName);
        $("#checkedDepartName").val(voicePool.departName);
        $("#touchId").val(voicePool.touchId);
        $("#createTime").val(createTime);
        $("#callingNumber").val(voicePool.staffNumber);
        $("#calledNumber").val(voicePool.customerNumber);
        $("#callType").val(voicePool.callType);
        $("#hungupType").val(voicePool.hungupType);

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemName', title: '考评项名称', width: '15%'},
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
                {field: 'remark', title: '描述', width: '20%'},
                {field: 'nodeScore', title: '所占分值', width: '15%'},
                {
                    field: 'scoreScope', title: '扣分区间', width: '20%',
                    formatter: function (value, row, index) {
                        var min = '<input id="minScore' + row.nodeId + '" type="text" style="width: 80px;" class="easyui-textbox" value="0" readonly>',
                            max = '<input id="minScore' + row.nodeId + '" type="text" style="width: 80px;" class="easyui-textbox" value="0" readonly>';
                        if (row.minScore != null) {
                            min = '<input id="minScore' + row.nodeId + '" type="text" style="width: 80px;" class="easyui-textbox" value="' + row.minScore + '" readonly>';
                        }
                        if (row.maxScore != null) {
                            max = '<input id="maxScore' + row.nodeId + '" type="text" style="width: 80px;" class="easyui-textbox" value="' + row.maxScore + '" readonly>';
                        }
                        return min + "&nbsp;&nbsp;" + "-" + "&nbsp;&nbsp;" + max;
                    }
                },
                {
                    field: 'score', title: '扣分分值', width: '15%',
                    formatter: function (value, row, index) {
                        return '<input id="score' + row.nodeId + '" type="text" class="easyui-textbox" value="0">';
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

        //考评评语
        $("#checkItemRemark").textbox(
            {
                multiline: true
            }
        );
    }

    //初始化考评项列表
    function initCheckArea() {
        //考评项详细信息
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "planId": voicePool.planId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItemDetail", params, function (result) {
            var checkItemData = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            } else {
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
                    var savedData = result.RSP.DATA,
                        rspCode = result.RSP.RSP_CODE,
                        totalScore = 0;    //考评项总得分
                    if (rspCode != null && rspCode === "1") {
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
            var data = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {
                $("#checkComment").val(data[0].checkComment);
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
            var jq = top.jQuery;
            //关闭语音质检详情
            jq('#tabs').tabs('close', "语音质检详情");
        });
        //案例收集
        $("#caseCollectBtn").on("click", function () {
            $.messager.alert("提示", "该功能暂未开放!");
        });
    }

    function checkSubmit(checkStatus) {
        var currentTime = new Date(),
            checkTime = currentTime - startTime,
            finalScore = $("#checkScore").val(),
            checkStartTime = DateUtil.formatDateTime(parseInt(voicePool.operateTime)),
            checkComment = $("#checkComment").val();
        var voiceCheckResult = {
            "tenantId": Util.constants.TENANT_ID,                          //租户id
            "provinceId": voicePool.provinceId,                      //省份id
            "callingNumber": voicePool.staffNumber,                  //主叫号码
            "acceptNumber": voicePool.customerNumber,                //受理号码
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
                    var jq = top.jQuery;
                    //刷新语音质检待办区
                    jq('#tabs').tabs('close', "语音质检" + voicePool.touchId);
                    var tab = jq('#tabs').tabs('getTab', "质检待办区"),
                        iframe = jq(tab.panel('options').content),
                        content = '<iframe scrolling="auto" frameborder="0"  src="' + iframe.attr('src') + '" style="width:100%;height:100%;"></iframe>';
                    jq('#tabs').tabs('update', {
                        tab: tab,
                        options: {content: content, closable: true}
                    });
                });
            } else {
                $.messager.alert("提示", errMsg + result.RSP.RSP_DESC);
            }
        });
    }

    return {
        initialize: initialize
    };
});