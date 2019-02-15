require(["jquery", 'util', "dateUtil", "transfer", "easyui"], function ($, Util) {

    var orderPool,
        scoreType,                  //分值类型（默认扣分）
        startTime,                  //页面初始化时间
        checkItemListData = [],     //考评项列表数据（所有环节考评项）
        currentCheckItemData = [],  //当前考评项列表数据
        currentNode = {},           //当前选中环节
        checkLinkData = [],         //环节考评数据（提交数据）
        totalScore = 0,             //总得分
        replyData = {},             //内外部回复数据
        processData = [             //轨迹测试数据
            {
                "rmk": "工单立单提交",
                "opStaffNm": "员工10001",
                "lgId": "1901020950440000046",
                "opStaffId": "YN0003",
                "nodeTypeCd": "start",
                "handIngTime": "2小时10分",
                "crtTime": "2019-01-02 09:50:44",
                "opWorkGroupNm": "北京1班",
                "opTypeNm": "填单",
                "opTypeCd": "1",
                "opWorkGroupId": ""
            },
            {
                "rmk": "工单立单复检",
                "opStaffNm": "员工10001",
                "lgId": "1901021009500000047",
                "opStaffId": "YN0003",
                "nodeTypeCd": "review",
                "handIngTime": "53分20秒",
                "crtTime": "2019-01-02 10:09:50",
                "opWorkGroupNm": "北京1班",
                "opTypeNm": "立单",
                "opTypeCd": "4",
                "opWorkGroupId": ""
            },
            {
                "rmk": "工单详情修改",
                "opStaffNm": "员工10001",
                "lgId": "1901021046340000048",
                "opStaffId": "YN00010",
                "nodeTypeCd": "handle",
                "handIngTime": "1天4小时",
                "crtTime": "2019-01-02 10:46:34",
                "opWorkGroupNm": "北京1班",
                "opTypeNm": "返单",
                "opTypeCd": "1",
                "opWorkGroupId": ""
            }
        ];
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();

        startTime = new Date();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取工单流水、质检流水等信息
        orderPool = getRequestObj();

        //工单受理内容
        $("#orderDealContent").textbox(
            {
                multiline: true
            }
        );

        //获取工单基本信息
        initWrkfmDetail();

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
                        if (row.hasOwnProperty("score") && row.score != null) {
                            return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="' + row.score + '">';
                        }
                        return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="0">';
                    }
                }
            ]],
            fitColumns: true,
            width: '80%',
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
                        var total = 0, //当前环节考评项总分
                            discount = 0, //扣分总值
                            maxScore = item.maxScore,
                            scoreDiv = $("#score" + item.nodeId),
                            score = scoreDiv.val();
                        if (parseInt(score) > parseInt(maxScore)) {
                            scoreDiv.val(score.substring(0, score.length - 1));
                            $.messager.alert("提示", "扣分值超过扣分上限!");
                            return;
                        }
                        $.each(data.rows, function (i, item) {
                            total += item.nodeScore;
                            var inputScore = $("#score" + item.nodeId);
                            if (inputScore.val() !== "") {
                                discount = discount + parseInt(inputScore.val());
                            }
                        });
                        $("#checkScore_" + currentNode.lgId).html(String(total - discount));
                        checkLinkSave();
                        $("#totalScore").val(totalScore);
                    });
                    input.on("blur", function () {
                        var scoreDiv = $("#score" + item.nodeId),
                            score = scoreDiv.val();
                        if (score === "") {
                            scoreDiv.val("0");
                        }
                        checkLinkSave();
                        $("#totalScore").val(totalScore);
                        //刷新考评环节合格状态
                        refreshCheckResult();
                    });
                });
            }
        });

        //获取工单轨迹、初始化考评项列表、环节考评数据
        initProcProceLocus();
    }

    //初始化工单基本信息
    function initWrkfmDetail() {
        var reqParams = {
            "provCode": orderPool.provinceId,
            "wrkfmId": "1901020950440000088"
        };
        var params = $.extend({
            "params": JSON.stringify(reqParams)
        }, {});

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/queryWrkfmDetail", params, function (result) {
            var data = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            } else {
                $("#workFormId").val(orderPool.workFormId);
                $("#custNum").val(data.userInfo.custNum);
                $("#srvReqstTypeFullNm").val(data.acceptInfo.srvReqstTypeFullNm);
                $("#custBelgCityNm").val(data.userInfo.custBelgCityNm);
                $("#isVipNm").val(data.userInfo.isVipNm);
                $("#acptChnlNm").val(data.acceptInfo.acptChnlNm);
                $("#dplctCmplntsFlagNm").val(data.acceptInfo.dplctCmplntsFlagNm);
                $("#isMajorCmplntsNm").val(data.acceptInfo.isMajorCmplntsNm);
                $("#faultLvlNm").val(data.acceptInfo.faultLvlNm);
                $("#urgntExtentNm").val(data.acceptInfo.urgntExtentNm);
                $("#custMoodTypeNm").val(data.acceptInfo.custMoodTypeNm);
                $("#bizCntt").val(data.acceptInfo.bizCntt);
            }
        });
    }

    //初始化工单轨迹、考评项列表
    function initProcProceLocus() {
        var reqParams = {
            "provCode": orderPool.provinceId,
            "wrkfmId": "1901020950440000088"
        };
        var params = $.extend({
            "params": JSON.stringify(reqParams)
        }, {});

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getProcProceLocus", params, function (result) {
            var data = result.RSP.DATAS,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            } else {
                // processData = data;
                showDealProcess(processData);  //初始化工单轨迹
                //初始化考评项列表
                var reqParams = {
                    "tenantId": orderPool.tenantId,
                    "templateId": orderPool.templateId
                };
                var params = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItemDetail", params, function (result) {
                    checkItemListData = result.RSP.DATA;
                    //分值类型
                    scoreType = checkItemListData[0].scoreType;
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    } else {
                        //初始化考评项列表
                        var checkLink = processData[0].opTypeCd;
                        $.each(checkItemListData, function (i, item) {
                            if (item.nodeTypeCode === checkLink) {
                                currentCheckItemData.push(item)
                            }
                        });
                        $("#checkItemList").datagrid("loadData", {rows: currentCheckItemData});

                        //查询暂存数据
                        var reqParams = {
                            "tenantId": orderPool.tenantId,
                            "touchId": orderPool.workFormId
                        };
                        var params = $.extend({
                            "start": 0,
                            "pageNum": 0,
                            "params": JSON.stringify(reqParams)
                        }, Util.PageUtil.getParams($("#searchForm")));

                        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_CHECK_DNS + "/querySavedResult", params, function (result) {
                            var savedData = result.RSP.DATA,
                                rspCode = result.RSP.RSP_CODE;
                            if (rspCode != null && rspCode === "1") {
                                //初始化环节考评数据（暂存数据）
                                $.each(processData, function (i, processItem) {
                                    var checkItemScoreList = [],
                                        checkLinkScore = 0;
                                    $.each(savedData, function (index, data) {
                                        if (processItem.lgId === data.checkLink) {
                                            var checkItemData = {};
                                            checkItemData.nodeType = data.nodeType;
                                            checkItemData.nodeId = data.nodeId;
                                            checkItemData.nodeName = data.nodeName;
                                            checkItemData.scoreScope = data.scoreScope;
                                            checkItemData.minScore = data.minScore;
                                            checkItemData.maxScore = data.maxScore;
                                            checkItemData.realScore = data.realScore;
                                            checkItemScoreList.push(checkItemData);

                                            checkLinkScore += data.realScore;
                                        }
                                    });
                                    var checkLink = {
                                        "checkLink": processItem.lgId,
                                        "checkLinkScore": checkLinkScore,
                                        "checkItemScoreList": checkItemScoreList
                                    };
                                    checkLinkData.push(checkLink);
                                    totalScore += checkLinkScore;
                                    $("#checkScore_" + processItem.lgId).html(checkLinkScore);
                                });
                            } else {  //无暂存数据则默认满分
                                $.each(processData, function (i, processItem) {
                                    var checkItemScoreList = [],
                                        checkLinkScore = 0;
                                    $.each(checkItemListData, function (index, checkItem) {
                                        if (processItem.opTypeCd === checkItem.nodeTypeCode) {
                                            var checkItemData = {};
                                            checkItemData.nodeType = checkItem.nodeType;
                                            checkItemData.nodeId = checkItem.nodeId;
                                            checkItemData.nodeName = checkItem.nodeName;
                                            checkItemData.scoreScope = checkItem.nodeScore;
                                            checkItemData.minScore = checkItem.minScore;
                                            checkItemData.maxScore = checkItem.maxScore;
                                            checkItemData.realScore = checkItem.nodeScore;
                                            checkItemScoreList.push(checkItemData);

                                            checkLinkScore += checkItem.nodeScore;
                                        }
                                    });
                                    var checkLink = {
                                        "checkLink": processItem.lgId,
                                        "checkLinkScore": checkLinkScore,
                                        "checkItemScoreList": checkItemScoreList
                                    };
                                    checkLinkData.push(checkLink);
                                    totalScore += checkLinkScore;
                                    $("#checkScore_" + processItem.lgId).html(checkLinkScore);
                                });
                            }
                            //考评环节合格状态
                            initCheckResult();
                            //刷新考评项列表数据
                            refreshCheckArea();
                            //初始化总得分
                            $("#totalScore").val(totalScore);
                        });
                    }
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //基本信息btn
        $("#baseInfoBtn").on("click", function () {
            changeInfoArea(true);
        });
        //内外部回复btn
        $("#handlingLogBtn").on("click", function () {
            changeInfoArea(false);
            initHandlingLog();
        });
        //外部回复tab
        $("#externalReplyTab").on("click", function () {
            changeReplyArea(true);
            if (replyData.hasOwnProperty("externalReply")) {
                showHandlingLog(replyData.externalReply, true);
            }
        });
        //内部回复tab
        $("#insideReplyTab").on("click", function () {
            changeReplyArea(false);
            if (replyData.hasOwnProperty("insideReply")) {
                showHandlingLog(replyData.insideReply, false);
            }
        });
        //通知类型复选框点击事件
        $("#messageInform").on("click", function () {
            $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click", function () {
            $("#messageInform").attr("checked", false);
        });
        //保存
        $("#saveBtn").on("click", function () {
            if (orderPool.poolStatus === Util.constants.CHECK_STATUS_RECHECK) {
                checkSubmit(Util.constants.CHECK_FLAG_RECHECK_SAVE);  //复检保存
            } else {
                checkSubmit(Util.constants.CHECK_FLAG_CHECK_SAVE);  //质检保存
            }
        });
        //提交
        $("#submitBtn").on("click", function () {
            if (orderPool.poolStatus === Util.constants.CHECK_STATUS_RECHECK) {
                checkSubmit(Util.constants.CHECK_FLAG_RECHECK);  //复检
            } else {
                checkSubmit(Util.constants.CHECK_FLAG_NEW_BUILD);
            }
        });
        //取消
        $("#cancelBtn").on("click", function () {
            var jq = top.jQuery;
            //关闭语音质检详情
            jq('#tabs').tabs('close', "工单质检详情");
        });
        //案例收集
        $("#caseCollectBtn").on("click", function () {
            $.messager.alert("提示", "该功能暂未开放!");
        });
    }

    //初始化内外部回复
    function initHandlingLog() {
        if (JSON.stringify(replyData) === "{}") {
            var reqParams = {
                "provCode": orderPool.provinceId,
                "wrkfmId": "1901020950440000088"
            };
            var params = $.extend({
                "params": JSON.stringify(reqParams)
            }, {});

            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getHandingLog", params, function (result) {
                var data = result.RSP.DATA,
                    rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode !== "1") {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    replyData = data;
                    showHandlingLog(replyData.externalReply, true); //展示外回复信息
                }
            });
        }
    }

    //动态显示内外部回复
    function showHandlingLog(data, showExternalReply) {
        if (showExternalReply) {
            $("#externalReply").empty();
            $.each(data, function (i, item) {
                $("#externalReply").append(getReplyDiv(item));
            });
        } else {
            $("#insideReply").empty();
            $.each(data, function (i, item) {
                $("#insideReply").append(getReplyDiv(item));
            });
        }
    }

    //初始化处理过程
    function showDealProcess(data) {
        var processDiv = $("#processDealDiv");
        $.each(data, function (i, item) {
            if (i < data.length - 1) {
                processDiv.append(getProcessDiv(item, false));
            } else {
                processDiv.append(getProcessDiv(item, true));
            }

            var checkBox = $("#checkBox_" + item.lgId);
            //默认选中第一处理环节
            if (i < 1) {
                currentNode = item;
                checkBox.attr("checked", true);
                $("#leftSpan_" + item.lgId).attr("class", "left-span-1");
                $("#spot_" + item.lgId).attr("class", "spot-1");
                $("#checkLinkTitle").html(item.opTypeNm);
            }
            //绑定checkBox点击事件
            checkBox.on("click", function () {
                //禁止取消勾选
                if (item.lgId === currentNode.lgId) {
                    checkBox.prop("checked", true);
                    return;
                }
                //取消勾选其他checkBox
                $.each(data, function (index, data) {
                    if (data.lgId !== item.lgId) {
                        $("#checkBox_" + data.lgId).attr("checked", false);
                        $("#leftSpan_" + data.lgId).attr("class", "left-span-2");
                        $("#spot_" + data.lgId).attr("class", "spot-2");
                    } else {
                        $("#leftSpan_" + data.lgId).attr("class", "left-span-1");
                        $("#spot_" + data.lgId).attr("class", "spot-1");
                        $("#checkLinkTitle").html(data.opTypeNm);
                    }
                });

                //切换环节时更新考评信息
                checkLinkSave();

                //当前选中环节
                currentNode = item;
                //当前考评项列表
                currentCheckItemData = [];
                $.each(checkItemListData, function (i, item) {
                    if (item.nodeTypeCode === currentNode.opTypeCd) {
                        currentCheckItemData.push(item);
                    }
                });
                $("#checkItemList").datagrid("loadData", {rows: currentCheckItemData}); //刷新考评项列表
                refreshCheckArea(); //刷新评价区数据
            });
        });
    }

    //考评环节保存
    function checkLinkSave() {
        var checkItemScoreList = [],
            checkLinkScore = 0,
            scoreStr = $("#checkScore_" + currentNode.lgId).html();
        if (scoreStr !== "") {
            checkLinkScore = parseInt(scoreStr);
        }
        for (var i = 0; i < checkLinkData.length; i++) {
            if (checkLinkData[i].checkLink === currentNode.lgId) {
                //更新总得分
                totalScore -= checkLinkData[i].checkLinkScore;
                checkLinkData.splice(i, 1);
                break;
            }
        }

        $.each(currentCheckItemData, function (i, item) {
            var checkItem = {};
            checkItem.nodeType = item.nodeType;
            checkItem.nodeId = item.nodeId;
            checkItem.nodeName = item.nodeName;
            checkItem.scoreScope = item.nodeScore;
            checkItem.minScore = item.minScore;
            checkItem.maxScore = item.maxScore;
            checkItem.realScore = item.nodeScore - parseInt($("#score" + item.nodeId).val());
            checkItemScoreList.push(checkItem);
        });

        var checkLink = {
            "checkLink": currentNode.lgId,
            "checkLinkScore": checkLinkScore,
            "checkItemScoreList": checkItemScoreList
        };
        checkLinkData.push(checkLink);

        //更新总得分
        totalScore += checkLinkScore;
    }

    //初始化考评环节合格状态
    function initCheckResult() {
        $.each(processData, function (i, processItem) {
            var totalScore = 0, //当前考评环节所有考评项总分
                gainScore = 0;  //当前考评环节所有考评项得分
            $.each(checkItemListData, function (i, checkItem) {
                if (checkItem.nodeTypeCode === processItem.opTypeCd) {
                    totalScore += checkItem.nodeScore;
                }
            });
            $.each(checkLinkData, function (i, linkItem) {
                if (linkItem.checkLink === processItem.lgId) {
                    gainScore = linkItem.checkLinkScore;
                }
            });
            var checkResult = $("#checkResult_" + processItem.lgId);
            if (totalScore !== 0 && gainScore / totalScore > 0.6) {
                checkResult.html("合格");
                checkResult.css("color", "#4A4A4A");
            } else {
                checkResult.html("不合格");
                checkResult.css("color", "#F5A623");
            }
        });
    }

    //刷新当前考评环节合格状态
    function refreshCheckResult() {
        var totalScore = 0, //当前考评环节所有考评项总分
            gainScore = 0;  //当前考评环节所有考评项得分
        $.each(checkItemListData, function (i, item) {
            if (item.nodeTypeCode === currentNode.opTypeCd) {
                totalScore += item.nodeScore;
            }
        });
        $.each(checkLinkData, function (i, item) {
            if (item.checkLink === currentNode.lgId) {
                gainScore = item.checkLinkScore;
            }
        });
        var checkResult = $("#checkResult_" + currentNode.lgId);
        if (totalScore !== 0 && gainScore / totalScore > 0.6) {
            checkResult.html("合格");
            checkResult.css("color", "#4A4A4A");
        } else {
            checkResult.html("不合格");
            checkResult.css("color", "#F5A623");
        }
    }

    //质检提交or保存
    function checkSubmit(checkStatus) {
        //未考评则返回
        if (checkLinkData.length === 0) {
            $.messager.alert("提示", "未对任何环节进行考评!");
            return;
        }

        //针对提交，提交时需要对所有（必检）环节进行考评，现在默认需要对所有环节进行考评
        if (checkStatus === Util.constants.CHECK_FLAG_NEW_BUILD || checkStatus === Util.constants.CHECK_FLAG_RECHECK) {
            if (checkLinkData.length < processData.length) {
                $.messager.alert("提示", "有未考评环节!考评后才能提交");
                return;
            }
        }

        var currentTime = new Date(),
            checkTime = currentTime - startTime,
            checkStartTime = DateUtil.formatDateTime(parseInt(orderPool.operateTime)),
            finalScore = totalScore / checkLinkData.length,  //最终得分，暂时按各个环节的平局分统计
            checkComment = $("#checkComment").val(),
            unqualifiedNum = 0;  //不合格环节数

        //统计不合格环节数
        $.each(processData, function (i, item) {
            if ($("#checkResult_" + item.lgId).html() === "不合格") {
                unqualifiedNum++;
            }
        });
        //工单质检基本信息
        var orderCheckInfo = {
            "tenantId": orderPool.tenantId,                          //租户id
            "provinceId": orderPool.provinceId,                      //省份id
            "callingNumber": orderPool.acptStaffNum,                 //主叫号码
            "acceptNumber": orderPool.custNum,                       //受理号码
            "touchId": orderPool.workFormId,                         //工单流水
            "planId": orderPool.planId,                              //考评计划
            "templateId": orderPool.templateId,                      //考评模版ID
            "checkModel": Util.constants.CHECK_TYPE_WITHIN_PLAN,     //质检模式、计划内质检
            "checkedStaffId": orderPool.checkedStaffId,              //被质检员id
            "checkedStaffName": orderPool.checkedStaffName,          //被质检员名
            "checkedDepartId": Util.constants.CHECKED_DEPART_ID,     //被质检部门id 暂时
            "checkedDepartName": "",                                 //被质检部门名称
            "checkStaffId": orderPool.checkStaffId,                  //质检员id
            "checkStaffName": orderPool.checkStaffName,              //质检员名
            "checkDepartId": "",                                     //质检部门id
            "checkDepartName": "",                                   //质检部门名称
            "checkStartTime": checkStartTime,                        //质检开始时间（质检分配时间）
            "checkTime": checkTime,                                  //质检时长
            "scoreType": scoreType,                                  //分值类型
            "finalScore": finalScore,                                //总得分
            "checkComment": checkComment,                            //考评评语
            "unqualifiedNum": unqualifiedNum,                         //不合格环节数
            "resultStatus": checkStatus                              //质检结果状态（暂存、质检、复检）
        };

        var params = {
            "orderCheckInfo": orderCheckInfo,
            "checkLinkData": checkLinkData
        };

        Util.loading.showLoading();
        Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_CHECK_DNS).concat("/"), JSON.stringify(params), function (result) {

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
                    jq('#tabs').tabs('close', "工单质检详情");
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

    //内外部回复div
    function getReplyDiv(data) {
        return '<div class="reply-1">' +
            '<div class="reply-2">' +
            '<span style="margin-right:24px;">' + data.crtTime + '</span><span>' + data.opStaffId + '</span><span>|客服</span>' +
            '</div>' +
            '<div class="reply-3"><span>' + data.rmk + '</span></div>' +
            '</div>';
    }

    //处理过程div
    function getProcessDiv(data, isFinal) {
        var divClass = "content4-2";
        if (isFinal) {
            divClass = "content4-3";
        }
        return '<div class="' + divClass + '">' +
            '<div class="process-right">' +
            '<div class="processRight-1">' +
            '<span>部门：</span><span class="processRight-11">' + data.opWorkGroupNm + '</span><span>工号</span><span class="processRight-12">' + data.opStaffId + '</span>' +
            '<span>操作环节：</span><span class="processRight-13">' + data.opTypeNm +
            '</div>' +
            '<div class="processRight-2">' +
            '<div class="leftTop-border"></div>' +
            '<div class="processRight-21">' +
            '<span>建单时间：</span><span class="processRight-211">' + data.crtTime + '</span>' +
            '<span>处理时长：</span><span class="processRight-212">' + data.handIngTime + '</span><span>当前环节评价：</span><span id="checkResult_' + data.lgId + '">合格</span>' +
            '</div>' +
            '<div class="processRight-22"><span>处理意见：</span><span>' + data.rmk + '</span></div>' +
            '</div>' +
            '</div>' +
            '<div class="process-left">' +
            '<span class="left-span-2" style="margin-right: 5px" id="leftSpan_' + data.lgId + '">' + data.opTypeNm + '</span>' +
            '<input class="left-check-1" type="checkbox" id="checkBox_' + data.lgId + '"/>' +
            '</div>' +
            '<div class="process-spot">' +
            '<div class="spot-2" id="spot_' + data.lgId + '"></div>' +
            '</div>' +
            '<div class="check-right">' +
            '<span class="content4-1-1" style="display: block" id="checkScore_' + data.lgId + '"></span>' +
            '</div>' +
            '</div>';
    }

    //更新评价区数据
    function refreshCheckArea() {
        //工作质量评价区数据更新
        $("#totalScore").val(totalScore);  //总得分
        for (var i = 0; i < checkLinkData.length; i++) {
            if (checkLinkData[i].checkLink === currentNode.lgId) {
                //考评项列表
                $.each(currentCheckItemData, function (index, item) {
                    $.each(checkLinkData[i].checkItemScoreList, function (scoreIndex, scoreItem) {
                        if (item.nodeId === scoreItem.nodeId) {
                            var score = (scoreItem.scoreScope - scoreItem.realScore).toString();
                            $("#score" + item.nodeId).val(score);
                        }
                    });
                });
                return;
            }
        }
        //没有保存结果的情况
        $.each(currentCheckItemData, function (i, item) {
            $("#score" + item.nodeId).val("0");
        });
    }

    //基本信息、内外部回复切换
    function changeInfoArea(showBaseInfo) {
        var baseInfoBtn = $("#baseInfoBtn"),
            handlingLogBtn = $("#handlingLogBtn");
        if (showBaseInfo) {
            baseInfoBtn.removeClass();
            handlingLogBtn.removeClass();
            baseInfoBtn.addClass("button-1");
            handlingLogBtn.addClass("button-2");
            $("#baseInfo").show();
            $("#handlingLog").hide();
        } else {
            baseInfoBtn.removeClass();
            handlingLogBtn.removeClass();
            baseInfoBtn.addClass("button-2");
            handlingLogBtn.addClass("button-1");
            $("#baseInfo").hide();
            $("#handlingLog").show();
        }
    }

    //内部回复、外部回复切换
    function changeReplyArea(showExternalReply) {
        var externalReplyTab = $("#externalReplyTab"),
            insideReplyTab = $("#insideReplyTab");
        if (showExternalReply) {
            externalReplyTab.removeClass();
            insideReplyTab.removeClass();
            externalReplyTab.addClass("tab-1");
            insideReplyTab.addClass("tab-2");
            $("#externalReplySpan").css("color", "#4A90E2");
            $("#insideReplySpan").css("color", "#CDD6E0");
            $("#externalReply").show();
            $("#insideReply").hide();
        } else {
            externalReplyTab.removeClass();
            insideReplyTab.removeClass();
            externalReplyTab.addClass("tab-2");
            insideReplyTab.addClass("tab-1");
            $("#externalReplySpan").css("color", "#CDD6E0");
            $("#insideReplySpan").css("color", "#4A90E2");
            $("#externalReply").hide();
            $("#insideReply").show();
        }
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