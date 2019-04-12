require(["jquery", 'util', "commonAjax", "transfer", "dateUtil", "easyui"], function ($, Util, CommonAjax, Transfer) {

    var workForm,
        workFormDetail,             //工单基本信息
        showingInfo = 0,            //当前显示的基本信息（0工单基本信息、1内外部回复、2接触记录、3工单历史）
        scoreType,                  //分值类型（默认扣分）
        startTime,                  //页面初始化时间
        checkItemListData = [],     //考评项列表数据（所有环节考评项）
        currentCheckItemData = [],  //当前考评项列表数据
        currentNode = {},           //当前选中环节
        checkLinkData = [],         //环节考评数据（提交数据）
        totalScore = 0,             //总得分
        replyData = {},             //内外部回复数据
        recordData = [],            //接触记录数据
        historyData = [],           //工单历史数据
        processData = [],           //轨迹数据
        playingRecord,              //当前正在播放的录音id
        qmCheckUrl = Util.constants.NGIX_URL_CONTEXT + "/qm/html/execution/beyondPlanCheck.html";

    initialize();

    function initialize() {
        //获取工单流水、质检流水等信息
        CommonAjax.getUrlParams(function (data) {
            workForm = data;
            initPageInfo();
            initEvent();
            getCheckComment();
            startTime = new Date();
        });
    }

    //页面信息初始化
    function initPageInfo() {

        //获取工单基本信息
        initWrkfmDetail();
        //获取工单轨迹、初始化考评项列表、环节考评数据
        initProcProceLocus();

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemName', title: '考评项名称', width: '20%'},
                {
                    field: 'checkItemVitalType', title: '类别', width: '10%',
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
                {field: 'remark', title: '描述', width: '28%'},
                {field: 'nodeScore', title: '所占分值', width: '10%'},
                {
                    field: 'scoreScope', title: '扣分区间', width: '15%',
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
            width: 845,
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
    }

    //初始化工单基本信息
    function initWrkfmDetail() {
        var reqParams = {
            "provCode": workForm.provCode,
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
                workFormDetail = data;
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

    //初始化工单轨迹、考评项列表、考评评语
    function initProcProceLocus() {
        var reqParams = {
            "provCode": workForm.provCode,
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

                        //查询暂存数据
                        var reqParams = {
                            "tenantId": Util.constants.TENANT_ID,
                            "touchId": workForm.wrkfmId
                        };
                        var params = $.extend({
                            "start": 0,
                            "pageNum": 0,
                            "params": JSON.stringify(reqParams)
                        }, Util.PageUtil.getParams($("#searchForm")));

                        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_CHECK_DNS + "/querySavedResult", params, function (result) {
                            if (result.RSP.RSP_CODE === "1") {
                                var savedData = result.RSP.DATA;
                                //初始化环节考评数据（暂存数据）
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
                                            if (data.minScore != null) {
                                                checkItemData.minScore = data.minScore;
                                            } else {
                                                checkItemData.minScore = 0;
                                            }
                                            checkItemData.maxScore = data.maxScore;
                                            checkItemData.realScore = data.realScore;
                                            checkItemScoreList.push(checkItemData);

                                            checkLinkScore += data.realScore;
                                        }
                                    });
                                    if (flag) {  //存在考评项的环节
                                        var checkLink = {
                                            "checkLink": processItem.lgId,
                                            "checkedStaffId": processItem.opStaffId,
                                            "checkedStaffNm": processItem.opStaffNm,
                                            "checkedDepartId": processItem.opWorkGroupId,
                                            "checkedDepartNm": processItem.opWorkGroupNm,
                                            "checkLinkScore": checkLinkScore,
                                            "checkItemScoreList": checkItemScoreList
                                        };
                                        checkLinkData.push(checkLink);
                                        totalScore += checkLinkScore;
                                        $("#checkScore_" + processItem.lgId).html(checkLinkScore);
                                    }
                                });
                            } else {  //无暂存数据则默认满分
                                $.each(processData, function (i, processItem) {
                                    var checkItemScoreList = [],
                                        checkLinkScore = 0,
                                        flag = false;  //判断环节是否有考评项
                                    $.each(checkItemListData, function (index, checkItem) {
                                        if (processItem.opTypeCd === checkItem.nodeTypeCode) {
                                            flag = true;
                                            var checkItemData = {};
                                            checkItemData.nodeType = checkItem.nodeType;
                                            checkItemData.nodeId = checkItem.nodeId;
                                            checkItemData.nodeName = checkItem.nodeName;
                                            checkItemData.scoreScope = checkItem.nodeScore;
                                            if (checkItem.minScore != null) {
                                                checkItemData.minScore = checkItem.minScore;
                                            } else {
                                                checkItemData.minScore = 0;
                                            }
                                            checkItemData.maxScore = checkItem.maxScore;
                                            checkItemData.realScore = checkItem.nodeScore;
                                            checkItemScoreList.push(checkItemData);

                                            checkLinkScore += checkItem.nodeScore;
                                        }
                                    });
                                    if (flag) {  //存在考评项的环节
                                        var checkLink = {
                                            "checkLink": processItem.lgId,
                                            "checkedStaffId": processItem.opStaffId,
                                            "checkedStaffNm": processItem.opStaffNm,
                                            "checkedDepartId": processItem.opWorkGroupId,
                                            "checkedDepartNm": processItem.opWorkGroupNm,
                                            "checkLinkScore": checkLinkScore,
                                            "checkItemScoreList": checkItemScoreList
                                        };
                                        checkLinkData.push(checkLink);
                                        totalScore += checkLinkScore;
                                        $("#checkScore_" + processItem.lgId).html(checkLinkScore);
                                    }
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

        //初始化考评评语
        var reqParam = {
            "tenantId": Util.constants.TENANT_ID,
            "touchId": workForm.wrkfmId,
            "resultStatus": Util.constants.CHECK_RESULT_TEMP_SAVE
        };
        var param = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParam)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_CHECK_DNS + "/queryOrderCheckResult", param, function (result) {
            if (result.RSP.RSP_CODE === "1") {
                $("#checkComment").html(result.RSP.DATA[0].checkComment);
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
        //通知类型复选框点击事件
        $("#messageInform").on("click", function () {
            $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click", function () {
            $("#messageInform").attr("checked", false);
        });
        //保存
        $("#saveBtn").on("click", function () {
            checkSubmit(Util.constants.CHECK_FLAG_CHECK_SAVE);  //质检保存
        });
        //提交
        $("#submitBtn").on("click", function () {
            checkSubmit(Util.constants.CHECK_FLAG_NEW_BUILD);  //质检提交
        });
        //取消
        $("#cancelBtn").on("click", function () {
            //关闭工单质检详情
            CommonAjax.closeMenuByNameAndId("工单质检详情", workForm.wrkfmId);
        });
        //案例收集
        $("#caseCollectBtn").on("click", function () {
            $.messager.alert("提示", "该功能暂未开放!");
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
            var rspCode = result.RSP.RSP_CODE,
                data = result.RSP.DATA;
            if (rspCode != null && rspCode === "1") {
                var map = {
                    "commentId": "-1",
                    "commentName": "其他"
                };
                data.unshift(map);
                $("#checkCommentSearch").combobox('loadData', data);
            }
        });
    }

    //初始化内外部回复
    function initHandlingLog() {
        if (JSON.stringify(replyData) === "{}") {
            var reqParams = {
                "provCode": workForm.provCode,
                "wrkfmId": workForm.wrkfmId
            };
            var params = $.extend({
                "params": JSON.stringify(reqParams)
            }, {});

            Util.loading.showLoading();
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/getHandingLog", params, function (result) {

                Util.loading.destroyLoading();
                if (result.RSP.RSP_CODE === "1") {
                    replyData = result.RSP.DATA;
                    showHandlingLog(replyData.externalReply, true); //展示外回复信息
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
                {
                    field: 'staffNumber', title: '坐席号码', width: '15%',
                    formatter: function (value, row, index) {
                        if (row.callTypeCd === "1") {
                            return row.callingNumber;
                        } else {
                            return row.calledNumber;
                        }
                    }
                },
                {
                    field: 'customNumber', title: '客户号码', width: '15%',
                    formatter: function (value, row, index) {
                        if (row.callTypeCd === "0") {
                            return row.callingNumber;
                        } else {
                            return row.calledNumber;
                        }
                    }
                },
                {field: 'callTypeNm', title: '呼叫类型', width: '10%'},
                {
                    field: 'operate', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var play = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "recordPlay_' + row.cntmngSwftno + '">播放</a>',
                            download = '<a href="javascript:void(0);" style="color: deepskyblue;" id = "recordDownload_' + row.cntmngSwftno + '">下载</a>';
                        return download; //todo
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 251,
            pagination: false,
            // pageSize: 10,
            // pageList: [5, 10, 20, 50],
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
                // var start = (param.page - 1) * param.rows,
                //     pageNum = param.rows;
                var reqParams = {
                    "start": 0,
                    "limit": 0,
                    "provCode": workForm.provCode,
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
            },
            onLoadSuccess: function (data) {
                var audio = new Audio();
                $.each(data.rows, function (i, item) {
                    //语音播放
                    $("#recordPlay_" + item.cntmngSwftno).on("click", function () {
                        if (playingRecord !== null && playingRecord !== "") {  //有正在播放录音的情况
                            audio.pause();
                            if (playingRecord === item.cntmngSwftno) {  //暂停播放
                                $("#recordPlay_" + item.cntmngSwftno).html("播放");
                                playingRecord = "";
                            } else { //播放其他录音
                                $("#recordPlay_" + playingRecord).html("播放");
                                $("#recordPlay_" + item.cntmngSwftno).html("暂停");
                                audio.src = item.recordFilePath;  //todo
                                audio.load();
                                audio.play();
                                playingRecord = item.cntmngSwftno;
                            }
                        } else {
                            $("#recordPlay_" + item.cntmngSwftno).html("暂停");
                            audio.src = item.recordFilePath;  //todo
                            audio.load();
                            audio.play();
                            playingRecord = item.cntmngSwftno;
                        }
                    });
                    //录音下载
                    $("#recordDownload_" + item.cntmngSwftno).on("click", function () {
                        window.location.href = Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/recordDownload" + '?ftpPath=' + item.recordFilePath;
                    });
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
            height: 251,
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
                    "provCode": workForm.provCode,
                    "phoneNum": workFormDetail.userInfo.custNum
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

    //显示内外部回复
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
                // $("#checkLinkTitle).html(item.opTypeNm);
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
                        // $("#checkLinkTitle).html(data.opTypeNm);
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
            scoreStr = $("#checkScore_" + currentNode.lgId).html(),
            flag = false; //判断环节是否有考评项
        if (scoreStr !== "") {
            checkLinkScore = parseInt(scoreStr);
        }
        for (var i = 0; i < checkLinkData.length; i++) {
            if (checkLinkData[i].checkLink === currentNode.lgId) {
                flag = true;
                //更新总得分
                totalScore -= checkLinkData[i].checkLinkScore;
                checkLinkData.splice(i, 1);
                break;
            }
        }

        if (!flag) {  //不存在考评项则返回
            return;
        }

        $.each(currentCheckItemData, function (i, item) {
            var checkItem = {};
            checkItem.nodeType = item.nodeType;
            checkItem.nodeId = item.nodeId;
            checkItem.nodeName = item.nodeName;
            checkItem.scoreScope = item.nodeScore;
            if (item.minScore != null) {
                checkItem.minScore = item.minScore;
            } else {
                checkItem.minScore = 0;
            }
            checkItem.maxScore = item.maxScore;
            checkItem.realScore = item.nodeScore - parseInt($("#score" + item.nodeId).val());
            checkItemScoreList.push(checkItem);
        });

        var checkLink = {
            "checkLink": currentNode.lgId,
            "checkedStaffId": currentNode.opStaffId,
            "checkedStaffNm": currentNode.opStaffNm,
            "checkedDepartId": currentNode.opWorkGroupId,
            "checkedDepartNm": currentNode.opWorkGroupNm,
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
            var checkResult = $("#checkResult_" + processItem.lgId);
            if (totalScore === 0) { //无考评项的情况
                checkResult.html("不考评");
                checkResult.css("color", "#4A4A4A");
                return;
            }
            $.each(checkLinkData, function (i, linkItem) {
                if (linkItem.checkLink === processItem.lgId) {
                    gainScore = linkItem.checkLinkScore;
                }
            });
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

        var currentTime = new Date(),
            checkTime = currentTime - startTime,
            checkStartTime = DateUtil.formatDateTime(currentTime),
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
            "tenantId": Util.constants.TENANT_ID,                               //租户id
            "provinceId": workForm.provCode,                                    //省份id
            "callingNumber": workForm.acptStaffNum,                             //主叫号码
            "acceptNumber": workFormDetail.userInfo.custNum,                    //受理号码
            "touchId": workForm.wrkfmId,                                        //工单流水
            "wrkfmShowSwftno": workFormDetail.acceptInfo.wrkfmShowSwftno,       //工单显示流水
            "planId": "",                                                       //考评计划（计划外质检不绑定计划）
            "templateId": workForm.templateId,                                  //考评模版ID
            "checkModel": Util.constants.CHECK_TYPE_BEYOND_PLAN,                //计划外质检
            "checkStaffId": workForm.checkStaffId,                              //质检员id
            "checkStaffName": workForm.checkStaffName,                          //质检员名
            "checkStartTime": checkStartTime,                                   //质检开始时间（质检分配时间）
            "checkTime": checkTime,                                             //质检时长
            "scoreType": scoreType,                                             //分值类型
            "finalScore": finalScore,                                           //总得分
            "checkComment": checkComment,                                       //考评评语
            "unqualifiedNum": unqualifiedNum,                                   //不合格环节数
            "resultStatus": checkStatus                                         //质检结果状态（暂存、质检、复检）
        };

        //工单基本信息
        var workFormInfo = {
            "srvReqstTypeId": workFormDetail.acceptInfo.srvReqstTypeId,         //服务请求类型id
            "srvReqstTypeNm": workForm.srvReqstTypeNm,                          //服务请求类型名称
            "srvReqstTypeFullNm": workFormDetail.acceptInfo.srvReqstTypeFullNm, //服务请求类型全称
            "bizCntt": workFormDetail.acceptInfo.bizCntt,                       //工单内容
            "bizTitle": workFormDetail.acceptInfo.bizTitle,                     //工单标题
            "handleDuration": workFormDetail.acceptInfo.handleDuration,         //处理时长
            "actualHandleDuration": workForm.actualHandleDuration,              //实际处理时长
            "custEmail": workFormDetail.userInfo.custEmail,                     //客户邮箱
            "custName": workFormDetail.userInfo.custName,                       //客户姓名
            "custNum": workFormDetail.userInfo.custNum,                         //客户号码
            "acptStaffId": workFormDetail.acceptInfo.acptStaffId,               //立单人工号
            "acptStaffNum": workForm.acptStaffNum,                              //立单人号码
            "crtTime": workFormDetail.acceptInfo.acptTime,                      //受理时间/立单时间
            "arcTime": workFormDetail.acceptInfo.arcTime,                       //归档时间
            "modfTime": workFormDetail.acceptInfo.modfTime,                     //修改时间
            "checkedStaffId": workFormDetail.acceptInfo.dspsComplteStaffId      //工单责任人（待定）
        };

        var params = {
            "workFormInfo": workFormInfo,       //工单基本信息
            "orderCheckInfo": orderCheckInfo,   //质检基本信息
            "checkLinkData": checkLinkData      //质检环节详情
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
                    CommonAjax.closeMenuByNameAndId("工单质检详情", workForm.wrkfmId);
                    CommonAjax.refreshMenuByUrl(qmCheckUrl, "计划外质检池", "计划外质检池");
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

    return initialize;
});