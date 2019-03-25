require(["jquery", 'util', "dateUtil", "transfer", "easyui"], function ($, Util) {
    var workForm,
        showingInfo = 0,            //当前显示的基本信息（0工单基本信息、1内外部回复、2接触记录、3工单历史）
        scoreType,                  //分值类型（默认扣分）
        startTime,                  //页面初始化时间
        checkItemListData = [],     //考评项列表数据（所有环节考评项）
        currentCheckItemData = [],  //当前考评项列表数据
        currentNode = {},           //当前选中环节
        checkLinkData = [],         //环节考评数据（提交数据）
        totalScore = 0,             //总得分
        replyData = {},             //内外部回复数据
        processData = [],           //轨迹数据
        recordData = [],            //接触记录数据
        historyData = [],           //工单历史数据
        phoneNum;                   //受理号码

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();

        startTime = new Date();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取工单流水、质检流水等信息
        workForm = getRequestObj();

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
            width: 820,
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
        $("#checkComment").html(workForm.checkComment);
    }

    //初始化工单基本信息
    function initWrkfmDetail() {
        var reqParams = {
            "provCode": workForm.provinceId,
            "wrkfmId": workForm.wrkfmId
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
            "provCode": workForm.provinceId,
            "wrkfmId": workForm.wrkfmId
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
                    "tenantId": Util.constants.TENANT_ID,
                    "templateId": workForm.templateId
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
                            "inspectionId": workForm.inspectionId
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
            changeInfoArea(0);
        });
        //内外部回复btn
        $("#handlingLogBtn").on("click", function () {
            changeInfoArea(1);
            initHandlingLog();
        });
        //接触记录btn
        $("#recordingBtn").on("click", function () {
            changeInfoArea(2);
            if (recordData.length === 0) {
                initRecord();
            }
        });
        //工单历史btn
        $("#historyBtn").on("click", function () {
            changeInfoArea(3);
            if (historyData.length === 0) {
                initHistory();
            }
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
                "provCode": workForm.provinceId,
                "wrkfmId": workForm.wrkfmId
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

    //初始化接触记录
    function initRecord() {
        var IsCheckFlag = true, //标示是否是勾选复选框选中行的，true - 是 , false - 否
            recordList = $("#recordList");
        recordList.datagrid({
            columns: [[
                {field: 'cntmngSwftno', title: '接触流水', width: '20%'},
                {field: 'startTime', title: '接触时间', width: '20%'},
                {
                    field: 'cntmngDuration', title: '接触时长', width: '10%',
                    formatter: function (value, row, index) {
                        return DateUtil.formatDateTime2(value);
                    }
                },
                {field: 'callingNumber', title: '主叫号码', width: '15%'},
                {field: 'calledNumber', title: '被叫号码', width: '15%'},
                {
                    field: 'callTypeNm', title: '呼叫类型', width: '10%',
                    formatter: function (value, row, index) {
                        if (value === "0") {
                            return "呼入";
                        }
                        if (value === "1") {
                            return "呼出";
                        }
                    }
                },
                {
                    field: 'operate', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var play = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "recordPlay_' + row.cntmngSwftno + '">播放</a>',
                            download = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "recordDownload_' + row.cntmngSwftno + '">下载</a>';
                        return play + "&nbsp;&nbsp;" + download;
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 298,
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
                    recordList.datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    recordList.datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;
                var reqParams = {
                    "start": start,
                    "limit": pageNum,
                    "provCode": workForm.provinceId,
                    "wrkfmId": workForm.wrkfmId
                };
                var params = $.extend({
                    "params": JSON.stringify(reqParams)
                }, {});

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getRecordList", params, function (result) {
                    if (result.RSP.RSP_CODE === "1") {
                        var data = {
                            rows: result.RSP.DATAS,
                            total: result.RSP.ATTACH.TOTAL
                        };
                        recordData = result.RSP.DATAS;
                        success(data);
                    } else {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                        var emptyData = {
                            rows: [],
                            total: 0
                        };
                        success(emptyData);
                    }
                });
            }
        });
    }

    //初始化工单历史
    function initHistory() {
        var IsCheckFlag = true, //标示是否是勾选复选框选中行的，true - 是 , false - 否
            historyList = $("#historyList");
        historyList.datagrid({
            columns: [[
                {field: 'wrkfmShowSwftno', title: '工单编号', width: '20%'},
                {field: 'crtTime', title: '受理时间', width: '20%'},
                {field: 'dspsComplteStaffNm', title: '工单责任人', width: '15%'},
                {field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '25%'},
                {field: 'wrkfmStsNm', title: '工单状态', width: '20%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 298,
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
                    historyList.datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    historyList.datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;
                var reqParams = {
                    "start": start,
                    "limit": pageNum,
                    "provCode": workForm.provinceId,
                    "phoneNum": phoneNum
                };
                var params = $.extend({
                    "params": JSON.stringify(reqParams)
                }, {});

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getHistoryProProce", params, function (result) {
                    var data = {
                            rows: result.RSP.DATAS,
                            total: result.RSP.ATTACH.TOTAL
                        },
                        rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    } else {
                        historyData = result.RSP.DATAS;
                        success(data);
                    }
                });
            }
        });
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
            '<div class="processRight-3">' +
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
    function changeInfoArea(curShowingInfo) {
        var baseInfoBtn = $("#baseInfoBtn"),
            handlingLogBtn = $("#handlingLogBtn"),
            recordingBtn = $("#recordingBtn"),
            historyBtn = $("#historyBtn"),
            baseInfo = $("#baseInfo"),
            handlingLog = $("#handlingLog"),
            recording = $("#recording"),
            history = $("#history");
        switch (showingInfo) {
            case 0:
                baseInfoBtn.removeClass();
                baseInfoBtn.addClass("button-2");
                baseInfo.hide();
                break;
            case 1:
                handlingLogBtn.removeClass();
                handlingLogBtn.addClass("button-2");
                handlingLog.hide();
                break;
            case 2:
                recordingBtn.removeClass();
                recordingBtn.addClass("button-2");
                recording.hide();
                break;
            case 3:
                historyBtn.removeClass();
                historyBtn.addClass("button-2");
                history.hide();
                break;
        }
        switch (curShowingInfo) {
            case 0:
                baseInfoBtn.removeClass();
                baseInfoBtn.addClass("button-1");
                baseInfo.show();
                break;
            case 1:
                handlingLogBtn.removeClass();
                handlingLogBtn.addClass("button-1");
                handlingLog.show();
                break;
            case 2:
                recordingBtn.removeClass();
                recordingBtn.addClass("button-1");
                recording.show();
                break;
            case 3:
                historyBtn.removeClass();
                historyBtn.addClass("button-1");
                history.show();
                break;
        }
        showingInfo = curShowingInfo;
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