require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    var dealProcessData = [0, 0],
        orderPool;
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取工单流水、质检流水等信息
        orderPool = getRequestObj();

        debugger;
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
                    "tenantId": orderPool.tenantId,
                    "templateId": orderPool.templateId
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
        //通知类型复选框点击事件
        $("#messageInform").on("click", function () {
            $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click", function () {
            $("#messageInform").attr("checked", false);
        });
    }

    //动态展示处理过程
    function showDealProcess(data) {
        var leftDiv = $("#processLeftDiv"),
            rightDiv = $("#processRightDiv");
        $.each(data, function (i, item) {
            if (i > 0) {
                leftDiv.append(getProcessLine());
            }
            leftDiv.append(getLeftDiv());
            rightDiv.append(getRightDiv());
        });
    }

    //左侧操作区域
    function getLeftDiv() {
        return '<div class="panel-transparent"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-1"><div class="fl text-small">*</div></div>' +
            '<div class="formControls col-6"><div class="fl text-small">操作1</div></div>' +
            '<div class="formControls col-3"><div class="circle"></div></div>' +
            '<div class="formControls col-2"><input type="checkbox"></div>' +
            '</div></form></div>';
    }

    //左侧流程线
    function getProcessLine() {
        return '<form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-7" style="margin-left: 8px"><div class="panel-right cl"></div></div>' +
            '</div> </form>';
    }

    //右侧流程处理过程列表
    function getRightDiv() {
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
            '</div></form> </div>' +
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