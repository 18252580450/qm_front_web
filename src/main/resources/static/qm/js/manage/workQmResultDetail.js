require(["jquery", 'util', "dateUtil", "transfer", "easyui"], function ($, Util) {

    var orderResult,
        scoreType,                  //分值类型（默认扣分）
        startTime,                  //页面初始化时间
        checkItemListData = [],     //考评项列表数据（所有环节考评项）
        currentCheckItemData = [],  //当前考评项列表数据
        currentNode = {},           //当前选中环节
        checkLinkData = [],         //环节考评数据（提交数据）
        totalScore = 0,             //总得分
        replyData = {},             //内外部回复数据
        processData = [],           //轨迹数据
        phoneNum,                   //受理号码
        wrkfmId;                    //工单id

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();

        startTime = new Date();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取工单流水、质检流水等信息
        orderResult = getRequestObj();

        wrkfmId = orderResult.touchId;
        // wrkfmId = "1901020950440000088";

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
                            return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="' + row.score + '" readonly>';
                        }
                        return '<input id="score' + row.nodeId + '" type="text" class="input-type" value="0" readonly>';
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
            }
        });

        //获取工单轨迹、初始化考评项列表、环节考评数据
        initProcProceLocus();
        //初始化考评评语
        $("#checkComment").html(orderResult.checkComment);
    }

    //初始化工单基本信息
    function initWrkfmDetail() {
        var reqParams = {
            "provCode": orderResult.provinceId,
            "wrkfmId": wrkfmId
        };
        var params = $.extend({
            "params": JSON.stringify(reqParams)
        }, {});

        Util.loading.showLoading();
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/queryWrkfmDetail", params, function (result) {

            Util.loading.destroyLoading();
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
                phoneNum = data.userInfo.custNum;
                $("#workFormId").val(data.acceptInfo.wrkfmShowSwftno);
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
            "provCode": orderResult.provinceId,
            "wrkfmId": wrkfmId
        };
        var params = $.extend({
            "params": JSON.stringify(reqParams)
        }, {});

        Util.loading.showLoading();
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getProcProceLocus", params, function (result) {

            Util.loading.destroyLoading();
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
                processData = data;
                showDealProcess(processData);  //初始化工单轨迹
                //初始化考评项列表
                var reqParams = {
                    "tenantId": orderResult.tenantId,
                    "planId": orderResult.planId
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

                        //查询质检结果详情
                        var reqParams = {
                            "inspectionId": orderResult.inspectionId
                        };
                        var params = $.extend({
                            "start": 0,
                            "pageNum": 0,
                            "params": JSON.stringify(reqParams)
                        }, Util.PageUtil.getParams($("#searchForm")));

                        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_CHECK_DNS + "/queryOrderCheckResultDetail", params, function (result) {
                            var savedData = result.RSP.DATA,
                                rspCode = result.RSP.RSP_CODE;
                            if (rspCode != null && rspCode === "1") {
                                //初始化环节考评数据
                                $.each(processData, function (i, processItem) {
                                    var checkItemScoreList = [],
                                        checkLinkScore = 0,
                                        flag = false;  //判断环节是否有考评项
                                    $.each(savedData, function (index, data) {
                                        if (processItem.lgId === data.checkLink) {
                                            flag = true;
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
                                    if (flag) {  //存在考评项的环节
                                        var checkLink = {
                                            "checkLink": processItem.lgId,
                                            "checkLinkScore": checkLinkScore,
                                            "checkItemScoreList": checkItemScoreList
                                        };
                                        checkLinkData.push(checkLink);
                                        totalScore += checkLinkScore;
                                        $("#checkScore_" + processItem.lgId).html(checkLinkScore);
                                    }
                                });
                                //考评环节合格状态
                                initCheckResult();
                                //刷新考评项列表数据
                                refreshCheckArea();
                                //初始化总得分
                                $("#totalScore").val(totalScore);
                            } else {
                                $.messager.alert("提示", result.RSP.RSP_DESC);
                            }
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
    }

    //初始化内外部回复
    function initHandlingLog() {
        if (JSON.stringify(replyData) === "{}") {
            var reqParams = {
                "provCode": orderResult.provinceId,
                "wrkfmId": wrkfmId
            };
            var params = $.extend({
                "params": JSON.stringify(reqParams)
            }, {});

            Util.loading.showLoading();
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getHandingLog", params, function (result) {

                Util.loading.destroyLoading();
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
                // $("#checkLinkTitle").html(item.opTypeNm);
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
                        // $("#checkLinkTitle").html(data.opTypeNm);
                    }
                });

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
            if (totalScore === 0) { //无考评项的情况
                checkResult.html("不考评");
                checkResult.css("color", "#4A4A4A");
                return;
            }
            if (totalScore !== 0 && gainScore / totalScore > 0.6) {
                checkResult.html("合格");
                checkResult.css("color", "#4A4A4A");
            } else {
                checkResult.html("不合格");
                checkResult.css("color", "#F5A623");
            }
        });
    }

    //内外部回复div
    function getReplyDiv(data) {
        return '<div class="reply-1">' +
            '<div class="reply-2">' +
            '<span style="margin-right:24px;">' + data.crtTime + '</span><span>' + data.opStaffNm + '</span><span>|' + data.opWorkGroupNm + '</span>' +
            '</div>' +
            '<div class="reply-3"><span>' + data.rmk + '</span></div>' +
            '</div>';
    }

    //处理过程div
    function getProcessDiv(data, isFinal) {
        var handIngTime = DateUtil.formatDateTime2(data.handIngTime),
            divClass = "content4-2",
            color = "#4A4A4A";
        if (isFinal) {
            divClass = "content4-3";
        }
        if (data.handIngTime > 7200) {
            color = "#F5A623";
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
            '<span>处理时长：</span><span class="processRight-212" style="color:' + color + '">' + handIngTime + '</span>' +
            '<span>考评结果：</span><span id="checkResult_' + data.lgId + '">合格</span>' +
            '</div>' +
            '<div class="processRight-22"><span>处理意见：</span><span>' + data.rmk + '</span></div>' +
            '</div>' +
            '</div>' +
            '<div class="process-left">' +
            '<span class="left-span-2" style="margin-right: 5px" id="leftSpan_' + data.lgId + '"></span>' +
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