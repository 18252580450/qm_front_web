require(["jquery", 'util', "dateUtil", "transfer", "easyui"], function ($, Util) {

    var workForm,
        playingRecord,              //当前正在播放的录音id
        showingInfo = 0,            //当前显示的基本信息（0工单基本信息、1内外部回复、2接触记录、3工单历史）
        replyData = {},             //内外部回复数据
        processData = [],           //轨迹数据
        recordData = [],            //接触记录数据
        historyData = [],           //工单历史数据
        phoneNum;                   //受理号码

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
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
    }

    //初始化工单基本信息
    function initWrkfmDetail() {
        var reqParams = {
            "provCode": workForm.provinceId,
            "wrkfmId": workForm.touchId
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
                $("#workFormId").attr('title', data.acceptInfo.wrkfmShowSwftno);
                $("#custNum").val(data.userInfo.custNum);
                $("#custNum").attr('title', data.userInfo.custNum);
                $("#srvReqstTypeFullNm").val(data.acceptInfo.srvReqstTypeFullNm);
                $("#srvReqstTypeFullNm").attr('title', data.acceptInfo.srvReqstTypeFullNm);
                $("#custBelgCityNm").val(data.userInfo.custBelgCityNm);
                $("#custBelgCityNm").attr('title', data.userInfo.custBelgCityNm);
                $("#isVipNm").val(data.userInfo.isVipNm);
                $("#isVipNm").attr('title', data.userInfo.isVipNm);
                $("#acptChnlNm").val(data.acceptInfo.acptChnlNm);
                $("#acptChnlNm").attr('title', data.acceptInfo.acptChnlNm);
                $("#dplctCmplntsFlagNm").val(data.acceptInfo.dplctCmplntsFlagNm);
                $("#dplctCmplntsFlagNm").attr('title', data.acceptInfo.dplctCmplntsFlagNm);
                $("#isMajorCmplntsNm").val(data.acceptInfo.isMajorCmplntsNm);
                $("#isMajorCmplntsNm").attr('title', data.acceptInfo.isMajorCmplntsNm);
                $("#faultLvlNm").val(data.acceptInfo.faultLvlNm);
                $("#faultLvlNm").attr('title', data.acceptInfo.faultLvlNm);
                $("#urgntExtentNm").val(data.acceptInfo.urgntExtentNm);
                $("#urgntExtentNm").attr('title', data.acceptInfo.urgntExtentNm);
                $("#custMoodTypeNm").val(data.acceptInfo.custMoodTypeNm);
                $("#custMoodTypeNm").attr('title', data.acceptInfo.custMoodTypeNm);
                $("#bizCntt").val(data.acceptInfo.bizCntt);
            }
        });
    }

    //初始化工单轨迹
    function initProcProceLocus() {
        var reqParams = {
            "provCode": workForm.provinceId,
            "wrkfmId": workForm.touchId
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
                "wrkfmId": workForm.touchId
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
                {
                    field: 'staffNumber', title: '坐席号码', width: '15%',
                    formatter: function (value, row, index) {
                        if(row.callTypeCd === "1"){
                            return row.callingNumber;
                        }else {
                            return row.calledNumber;
                        }
                    }
                },
                {
                    field: 'customNumber', title: '客户号码', width: '15%',
                    formatter: function (value, row, index) {
                        if(row.callTypeCd === "0"){
                            return row.callingNumber;
                        }else {
                            return row.calledNumber;
                        }
                    }
                },
                {field: 'callTypeNm', title: '呼叫类型', width: '10%'},
                {
                    field: 'operate', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var play = '<a href="javascript:void(0);" class="list_operation_color" id = "recordPlay_' + row.cntmngSwftno + '">播放</a>',
                            download = '<a href="javascript:void(0);" class="list_operation_color" id = "recordDownload_' + row.cntmngSwftno + '">下载</a>';
                        return download; //todo
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 292,
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
                    "provCode": workForm.provinceId,
                    "wrkfmId": workForm.touchId
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
                {field: 'dspsComplteStaffNm', title: '立单人', width: '15%'},
                {field: 'srvReqstTypeFullNm', title: '服务请求类型', width: '25%'},
                {field: 'wrkfmStsNm', title: '工单状态', width: '20%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 292,
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
            // '<span>考评结果：</span><span id="checkResult_' + data.lgId + '">合格</span>' +
            '</div>' +
            '<div class="processRight-22"><span>处理意见：</span><span>' + data.rmk + '</span></div>' +
            '</div>' +
            '</div>' +
            '<div class="process-left">' +
            '<span class="left-span-2" style="margin-right: 5px" id="leftSpan_' + data.lgId + '"></span>' +
            // '<input class="left-check-1" type="checkbox" id="checkBox_' + data.lgId + '"/>' +
            '</div>' +
            '<div class="process-spot">' +
            '<div class="spot-2" id="spot_' + data.lgId + '"></div>' +
            '</div>' +
            '<div class="check-right">' +
            '<span class="content4-1-1" style="display: block" id="checkScore_' + data.lgId + '"></span>' +
            '</div>' +
            '</div>';
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