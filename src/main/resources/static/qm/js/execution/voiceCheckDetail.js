require(["jquery", "util", "dateUtil", "transfer", "easyui"], function ($, Util) {

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
        voicePool = getRequestObj();

        //基本信息初始化
        $("#checkedStaffName").val(voicePool.checkedStaffName);
        $("#touchId").val(voicePool.touchId);
        $("#callingNumber").val(voicePool.callingNumber);
        $("#calledNumber").val(voicePool.calledNumber);
        $("#callType").val(voicePool.callType);
        $("#hungupType").val(voicePool.hungupType);

        //考评评语
        $("#checkComment").textbox(
            {
                multiline: true
            }
        );

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'nodeName', title: '考评项名称', width: '15%'},
                {
                    field: 'errorType', title: '类别', width: '15%',
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
            loader: function (param, success) {
                var planReqParams = {
                    "tenantId": voicePool.tenantId,
                    "planId": voicePool.planId
                };
                var planParams = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(planReqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                //通过考评计划id查询模版id
                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/selectByParams", planParams, function (result) {
                    var data = result.RSP.DATA;

                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode !== "1") {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                    }
                    if (data.length !== 0) {
                        templateId = data[0].templateId;

                        //查询分值类型
                        var templateReqParams = {
                            "tenantId": voicePool.tenantId,
                            "templateId": templateId
                        };
                        var templateParams = $.extend({
                            "start": 0,
                            "pageNum": 0,
                            "params": JSON.stringify(templateReqParams)
                        }, Util.PageUtil.getParams($("#searchForm")));

                        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE + "/selectByParams", templateParams, function (result) {
                            var data = result.RSP.DATA;
                            var rspCode = result.RSP.RSP_CODE;
                            if (rspCode != null && rspCode !== "1") {
                                $.messager.show({
                                    msg: result.RSP.RSP_DESC,
                                    timeout: 1000,
                                    style: {right: '', bottom: ''},     //居中显示
                                    showType: 'show'
                                });
                            }
                            if (data.length !== 0) {
                                if (data[0].scoreType != null) {
                                    scoreType = data[0].scoreType;
                                } else {
                                    scoreType = Util.constants.SCORE_TYPE_DISCOUNT;
                                }
                            }
                        });

                        //考评模版详细信息
                        var reqParams = {
                            "tenantId": voicePool.tenantId,
                            "templateId": templateId
                        };
                        var params = $.extend({
                            "start": 0,
                            "pageNum": 0,
                            "params": JSON.stringify(reqParams)
                        }, Util.PageUtil.getParams($("#searchForm")));

                        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE_DETAIL_DNS + "/queryCheckTemplateDetail", params, function (result) {
                            var data = {
                                rows: result.RSP.DATA
                            };
                            $.each(result.RSP.DATA, function (i, item) {
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
                            });
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
                    }

                });
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

        //考评评语
        $("#checkItemRemark").textbox(
            {
                multiline: true
            }
        );
    }

    //事件初始化
    function initEvent() {
        //保存
        $("#saveBtn").on("click", function () {
            checkSubmit(Util.constants.CHECK_RESULT_TEMP_SAVE);
        });
        //提交
        $("#submitBtn").on("click", function () {
            checkSubmit(Util.constants.CHECK_RESULT_NEW_BUILD);
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
            "tenantId": voicePool.tenantId,                          //租户id
            "callingNumber": voicePool.staffNumber,                  //主叫号码
            "acceptNumber": voicePool.customerNumber,                //受理号码
            "originInspectionId": "",                                //原质检流水
            "touchId": voicePool.touchId,                            //语音流水
            "planId": voicePool.planId,                              //考评计划
            "templateId": templateId,                                //考评模版ID
            "checkModel": Util.constants.CHECK_TYPE_WITHIN_PLAN,     //质检模式、计划内质检
            "checkedStaffId": voicePool.checkedStaffId,              //被质检员id
            "checkedStaffName": voicePool.checkedStaffName,          //被质检员名
            "checkedDepartId": "",                                   //被质检部门id
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
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {
                $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                    var jq = top.jQuery;
                    //刷新语音质检待办区
                    jq('#tabs').tabs('close', "语音质检详情");
                    var tab = jq('#tabs').tabs('getTab', "质检待办区"),
                        iframe = jq(tab.panel('options').content),
                        content = '<iframe scrolling="auto" frameborder="0"  src="' + iframe.attr('src') + '" style="width:100%;height:100%;"></iframe>';
                    jq('#tabs').tabs('update', {
                        tab: tab,
                        options: {content: content, closable: true}
                    });
                });
            } else {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            }
        });
    }

    //获取url对象
    function getRequestObj() {
        var url = decodeURI(decodeURI(location.search)); //获取url中"?"符后的字串，使用了两次decodeRUI解码
        var requestObj = {};
        if (url.indexOf("?") > -1) {
            var str = url.substr(1),
                strArr = str.split("&");
            for (var i = 0; i < strArr.length; i++) {
                requestObj[strArr[i].split("=")[0]] = unescape(strArr[i].split("=")[1]);
            }
            return requestObj;
        }
    }

    return {
        initialize: initialize
    };
});