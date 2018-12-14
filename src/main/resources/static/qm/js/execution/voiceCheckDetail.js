require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    var voicePool;
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取y语音流水、质检流水等信息
        voicePool = getRequestObj();

        debugger;

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
                        if(row.minScore != null){
                            min = '<input id="minScore' + row.nodeId + '" type="text" style="width: 80px;" class="easyui-textbox" value="' + row.minScore + '" readonly>';
                        }
                        if(row.maxScore != null){
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
                var reqParams = {
                    "tenantId": voicePool.tenantId,
                    "templateId": "2"
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
        $("#checkItemRemark").textbox(
            {
                multiline: true
            }
        );
    }

    //事件初始化
    function initEvent() {

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