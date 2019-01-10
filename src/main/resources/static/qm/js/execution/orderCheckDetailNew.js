require(["jquery", 'util', "dateUtil", "transfer", "easyui"], function ($, Util) {

    var dealProcessData = [{"nodeId": 1001}, {"nodeId": 1002}];
    var orderPool,
        scoreType,             //分值类型（默认扣分）
        startTime,             //页面初始化时间
        checkItemListData,     //考评项列表数据
        currentNode,           //当前选中环节
        checkLinkData = [];    //环节考评数据
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

        //动态展示处理过程
        showDealProcess(dealProcessData);

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
                //查询分值类型
                var templateReqParams = {
                    "tenantId": orderPool.tenantId,
                    "templateId": orderPool.templateId
                };
                var templateParams = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(templateReqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                debugger;
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
                    "tenantId": orderPool.tenantId,
                    "templateId": orderPool.templateId
                };
                var params = $.extend({
                    "start": 0,
                    "pageNum": 0,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE_DETAIL_DNS + "/queryCheckTemplateDetail", params, function (result) {
                    debugger;
                    checkItemListData = result.RSP.DATA;
                    var data = {
                        rows: result.RSP.DATA
                    };
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
                            return;
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
                        var scoreDiv = $("#score" + item.nodeId),
                            score = scoreDiv.val();
                        if (score === "") {
                            scoreDiv.val("0");
                        }
                    });
                });
            }
        });

        //考评评语
        // $("#checkComment").textbox(
        //     {
        //         multiline: true
        //     }
        // );
    }

    //事件初始化
    function initEvent() {
        //通知类型复选框点击事件
        $("#messageInform").on("click", function () {
            $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click", function () {
            $("#messageInform").attr("checked", false);
        });
        //考评环节保存
        $("#checkLinkSave").on("click", function () {
            checkLinkSave();
        });
        //保存
        $("#saveBtn").on("click", function () {
            checkSubmit(Util.constants.CHECK_RESULT_TEMP_SAVE);
        });
        //提交
        $("#submitBtn").on("click", function () {
            if (orderPool.poolStatus === Util.constants.CHECK_STATUS_RECHECK) {
                checkSubmit(Util.constants.CHECK_RESULT_RECHECK);  //复检
            } else {
                checkSubmit(Util.constants.CHECK_RESULT_NEW_BUILD);
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

    //动态展示处理过程
    function showDealProcess(data) {
        var leftDiv = $("#processLeftDiv"),
            rightDiv = $("#processDiv"),
            checkFlagDiv = $("#checkFlagDiv");
        $.each(data, function (i, item) {
            if (i > 0) {
                leftDiv.append(getProcessLine());
            }
            leftDiv.append(getLeftDiv(item));
            rightDiv.append(getRightDiv(item));
            checkFlagDiv.append(getCheckFlagDiv(item));

            var checkBox = $("#checkBox_" + item.nodeId);
            //默认选中第一处理环节
            if (i < 1) {
                currentNode = item.nodeId;
                checkBox.attr("checked", true);
                $("#checkLink").val("环节" + currentNode);
            }
            //绑定checkBox点击事件
            checkBox.on("click", function () {
                //当前选中环节
                currentNode = item.nodeId;
                $("#checkLink").val("环节" + currentNode);

                //取消勾选其他checkBox
                $.each(data, function (index, data) {
                    if (data.nodeId !== item.nodeId) {
                        $("#checkBox_" + data.nodeId).attr("checked", false);
                    }
                });

                //工作质量评价区数据更新
                var checkScore = $("#checkScore"),
                    checkComment = $("#checkComment");
                for (var i = 0; i < checkLinkData.length; i++) {
                    if (checkLinkData[i].checkLink === currentNode) {
                        checkScore.val(checkLinkData[i].finalScore);
                        checkComment.val(checkLinkData[i].checkComment);
                        //考评项列表
                        $.each(checkItemListData, function (index, item) {
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
                checkScore.val("100");
                checkComment.val("");
                $.each(checkItemListData, function (i, item) {
                    $("#score" + item.nodeId).val("0");
                });
            });
        });
    }

    //考评环节保存
    function checkLinkSave() {
        var checkItemScoreList = [],
            finalScore = parseInt($("#checkScore").val()),
            checkComment = $("#checkComment").val();

        $.each(checkLinkData, function (i, item) {
            if (item.checkLink === currentNode) {
                checkLinkData.splice(i, 1);
            }
        });

        $.each(checkItemListData, function (i, item) {
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
            "checkLink": currentNode,
            "finalScore": finalScore,
            "checkComment": checkComment,
            "checkItemScoreList": checkItemScoreList
        };
        checkLinkData.push(checkLink);

        //显示已评价标识
        $("#checkFlag_" + currentNode).html("已评价");
    }

    //质检提交or保存
    function checkSubmit(checkStatus) {
        //未考评则返回
        if (checkLinkData.length === 0) {
            $.messager.alert("提示", "未对任何环节进行考评!");
            return;
        }

        //针对提交，提交时需要对所有（必检）环节进行考评，现在默认需要对所有环节进行考评
        if (checkStatus === Util.constants.CHECK_RESULT_NEW_BUILD || checkStatus === Util.constants.CHECK_RESULT_RECHECK) {
            var allCheck = false;
            for (var i = 0; i < dealProcessData.length; i++) {
                allCheck = false;
                for (var j = 0; j < checkLinkData.length; j++) {
                    if (checkLinkData[j].checkLink === dealProcessData[i].nodeId) {
                        allCheck = true;
                        break;
                    }
                }
            }
            if (!allCheck) {
                $.messager.alert("提示", "有未考评环节!考评后才能提交");
                return;
            }
        }

        var currentTime = new Date(),
            checkTime = currentTime - startTime,
            checkStartTime = DateUtil.formatDateTime(parseInt(orderPool.operateTime));

        //工单质检基本信息
        var orderCheckInfo = {
            "tenantId": orderPool.tenantId,                          //租户id
            "callingNumber": orderPool.acptStaffNum,                 //主叫号码
            "acceptNumber": orderPool.custNum,                       //受理号码
            "touchId": orderPool.wrkfmId,                            //工单流水
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
            if (checkStatus === Util.constants.CHECK_RESULT_TEMP_SAVE) {
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

    //左侧操作区域
    function getLeftDiv(data) {
        return '<div class="panel-transparent"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-1"><div class="fl text-small"></div></div>' +
            '<div class="formControls col-6"><div class="fl text-small">操作1</div></div>' +
            '<div class="formControls col-3"><div class="circle"></div></div>' +
            '<div class="formControls col-2"><input id="checkBox_' + data.nodeId + '" type="checkbox"></div>' +
            '</div></form></div>';
    }

    //左侧流程线
    function getProcessLine() {
        return '<form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-7" style="margin-left: 8px"><div class="panel-right cl"></div></div>' +
            '</div></form>';
    }

    //右侧流程处理过程列表
    function getRightDiv(data) {
        return '<div style="margin-bottom: 10px;">' +
            '<div class="panel-top cl"><form class="form form-horizontal"><div class="cl" style="background: #f5f5f5">' +
            '<div class="formControls col-3"><div class="fl text-small">部门：天津1班</div></div>' +
            '<div class="formControls col-3"><div class="fl text-small">工号：AEY01358</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">操作：操作一</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">环节：环节一</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">派发局向：投诉1班</div></div>' +
            '</div></form></div>' +
            '<div class="panel-top cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-3"><div class="fl text-small">建单时间：2017-10-15 18:37:58</div></div>' +
            '<div class="formControls col-3"><div class="fl text-small">提交时间：2017-10-15 18:37:58</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">上一环节评价：合格</div></div>' +
            '</div></form></div>' +
            '<div class="panel-normal cl"><form class="form form-horizontal"><div class="cl" style="background: #eee">' +
            '<div class="formControls col-12"><div class="fl text-small">处理意见：客户反馈XX地点信号不好造成使用不方便，请处理</div></div>' +
            '</div></form></div>' +
            '</div>';
    }

    //右侧已质检标识区域
    function getCheckFlagDiv(data) {
        return '<div style="margin-bottom: 94px;">' +
            '<div class="panel-transparent-box cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="fl text-small" style="margin-top: 12px;" id="checkFlag_' + data.nodeId + '">待评价</div>' +
            '</div></form></div>' +
            '</div>';
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