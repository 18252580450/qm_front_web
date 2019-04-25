require(["jquery", "util", "dateUtil", "transfer", "easyui"], function ($, Util) {

    var voicePool,               //质检数据
        scoreType,               //分值类型（默认扣分）
        startTime,               //页面初始化时间
        checkItemScoreList = []; //考评项评分列表
    initialize();

    function initialize() {
        initPageInfo();

        startTime = new Date();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取y语音流水、质检流水等信息
        voicePool = getRequestObj();

        //基本信息初始化
        initBaseInfo();

        //考评评语
        $("#checkComment").textbox(
            {
                multiline: true,
                editable: false
            }
        );

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
                {field: 'remark', title: '描述', width: '25%'},
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
                        return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="0" readonly>';
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

    //初始化基本信息
    function initBaseInfo() {
        var reqParams = {
            "touchId": voicePool.touchId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        //通过语音流水查询基本信息
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
            } else {
                var data = result.RSP.DATA,
                    createTime = "",
                    callType = "",
                    callDuration = "";
                if (data[0].checkedTime != null) {
                    createTime = DateUtil.formatDateTime(data[0].checkedTime);
                }
                if (data[0].callType === "0") {
                    callType = "呼入";
                } else if (data[0].callType === "1") {
                    callType = "呼出";
                }
                if (data[0].talkDuration != null && data[0].talkDuration !== "") {
                    callDuration = DateUtil.formatDateTime2(data[0].talkDuration);
                }
                $("#checkedStaffName").val(data[0].checkedStaffName);
                $("#checkedDepartName").val(data[0].departName);
                $("#touchId").val(data[0].touchId);
                $("#createTime").val(createTime);
                if (data[0].callType === "0") {
                    $("#staffNumber").val(data[0].customerNumber);
                    $("#customerNumber").val(data[0].staffNumber);
                } else if (data[0].callType === "1") {
                    $("#staffNumber").val(data[0].staffNumber);
                    $("#customerNumber").val(data[0].customerNumber);
                }
                $("#callType").val(callType);
                $("#callDuration").val(callDuration);
            }
        });
    }

    //初始化考评区
    function initCheckArea() {
        //考评项详细信息
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
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
                //分值类型
                scoreType = result.RSP.DATA[0].scoreType;
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
                $("#checkItemList").datagrid("loadData", {rows: result.RSP.DATA});

                //质检结果详情
                var reqParams = {
                    "inspectionId": voicePool.inspectionId
                };
                var params = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_CHECK_DNS + "/queryVoiceCheckResultDetail", params, function (result) {
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
                    } else {
                        $.messager.alert("提示", result.RSP.RSP_DESC);
                    }
                    //刷新评价区数据
                    refreshCheckArea(totalScore);
                });
            }
        });

        //初始化考评评语
        var reqParam = {
            "inspectionId": voicePool.inspectionId
        };
        var param = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParam)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_CHECK_DNS + "/queryVoiceCheckResult", param, function (result) {
            if (result.RSP.RSP_CODE === "1") {
                $("#checkComment").textbox('setValue', result.RSP.DATA[0].checkComment);
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