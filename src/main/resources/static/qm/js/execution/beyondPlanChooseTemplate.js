define([
        "text!html/execution/beyondPlanChooseTemplate.tpl",
        "js/execution/beyondPlanOrderCheckDetail",
        "jquery", 'util', "commonAjax", "transfer", "easyui", "dateUtil"],
    function (tpl, OrderCheckDetail, $, Util, CommonAjax, Transfer, dateUtil) {

        var $el,
            templateType,   //模版类型（0语音、1工单）
            operateType,    //操作类型（0质检，1分派）
            checkObj,       //质检对象
            checkTemplate,  //选中的模版
            voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanVoiceCheckDetail.html",
            orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanOrderCheckDetail.html";

        function initialize(checkType, operate, obj) {
            $el = $(tpl);
            templateType = checkType;
            operateType = operate;
            checkObj = obj;
            checkTemplate = null;
            initGrid();
            initEvent();
            this.$el = $el;
        }

        //初始化列表
        function initGrid() {
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#checkTemplateList", $el).datagrid({
                columns: [[
                    {field: 'templateId', title: '模板编码', width: '15%'},
                    {field: 'templateName', title: '模板名称', width: '20%'},
                    {field: 'remark', title: '备注', width: '25%'},
                    {
                        field: 'scoreType', title: '分值类型', width: '15%',
                        formatter: function (value, row, index) {
                            return {'0': '合格', '1': '得分制', '2': '扣分制'}[value];
                        }
                    },
                    {
                        field: 'createTime', title: '创建时间', width: '20%',
                        formatter: function (value, row, index) {
                            return DateUtil.formatDateTime(value);
                        }
                    }
                ]],
                fitColumns: true,
                width: '100%',
                height: 350,
                pagination: true,
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                rownumbers: false,
                singleSelect: true,
                autoRowHeight: true,
                onDblClickRow: function (rowIndex, rowData) {
                    if (operateType === "0") {  //质检
                        checkObj.templateId = rowData.templateId;
                        //工单质检
                        if (templateType === Util.constants.CHECK_TYPE_ORDER) {
                            var orderCheckUrl = CommonAjax.createURL(orderCheckDetail, checkObj);
                            CommonAjax.openMenu(orderCheckUrl, "工单质检详情", checkObj.wrkfmId);
                        }
                        //语音质检
                        if (templateType === Util.constants.CHECK_TYPE_VOICE) {
                            var voiceCheckUrl = CommonAjax.createURL(voiceCheckDetail, checkObj);
                            CommonAjax.openMenu(voiceCheckUrl, "语音质检详情", checkObj.touchId);
                        }
                    }
                    if (operateType === "1") {  //分派
                        checkTemplate = rowData;
                    }
                    $("#qry_window").window('close');
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows,
                        pageNum = param.rows,
                        templateName = $("#templateName", $el).val(),
                        templateStatus = "1";  //已发布的模版

                    var reqParams = {
                        "tenantId": Util.constants.TENANT_ID,
                        "templateName": templateName,
                        "templateStatus": templateStatus,
                        "templateType": templateType
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchForm", $el)));

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE + "/selectByParams", params, function (result) {
                        var data = Transfer.DataGrid.transfer(result),
                            rspCode = result.RSP.RSP_CODE;
                        if (rspCode !== "1") {
                            $.messager.show({
                                msg: result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'slide'
                            });
                        }
                        success(data);
                    });
                }
            });
        }

        //初始化事件
        function initEvent() {
            //查询
            $("#queryBtn", $el).on("click", function () {
                $("#checkTemplateList").datagrid("load");
            });
            //重置
            $("#resetBtn", $el).on("click", function () {
                $("#searchForm").form('clear');
            });
            $("#closeBtn", $el).on("click", function () {
                $("#searchForm").form('clear');
                $("#qry_window").window('close');
            });
        }

        //动态添加质检详情弹框
        function getCheckDialog() {
            return "<div  id='check_window' style='display:none;'></div>";
        }

        function getCheckTemplate() {
            return checkTemplate;
        }

        return {
            initialize: initialize,
            getCheckTemplate: getCheckTemplate
        };
    });
