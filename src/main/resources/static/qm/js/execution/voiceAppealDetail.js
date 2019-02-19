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

    //初始化考评区
    function initCheckArea() {
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
            var data = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
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

                //考评项详细信息
                var reqParams = {
                    "tenantId": voicePool.tenantId,
                    "templateId": templateId
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
                        //分值类型
                        scoreType = result.RSP.DATA[0].scoreType;
                        //初始化考评项列表
                        $("#checkItemList").datagrid("loadData", {rows: checkItemData});

                        //查询暂存数据
                        var reqParams = {
                            "tenantId": voicePool.tenantId,
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
            }
        });

        //初始化考评评语
        var reqParam = {
            "tenantId": voicePool.tenantId,
            "inspectionId": voicePool.inspectionId
        };
        var param = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParam)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_CHECK_DNS + "/queryVoiceCheckResult", param, function (result) {
            debugger;
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
        //申诉
        $("#appealBtn").on("click", function () {

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