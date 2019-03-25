define([
    "text!html/execution/qryCheckTemplate.tpl",
    "jquery", 'util', "transfer", "easyui", "dateUtil"], function (tpl, $, Util, Transfer, dateUtil) {

    var $el,
        templateType, //模版类型（工单、语音）
        checkObj,  //质检对象
        orderCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/beyondPlanOrderCheckDetail.html",
        voiceCheckDetail = Util.constants.URL_CONTEXT + "/qm/html/execution/voiceCheckDetail.html";

    function initialize(checkType, obj) {
        $el = $(tpl);
        templateType = checkType;
        checkObj = obj;
        initGrid();
        initGlobalEvent();
        this.$el = $el;
    }

    //初始化列表
    function initGrid() {

        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#qryCheckTemplate_checkTemplateManage", $el).datagrid({
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
                checkObj.templateId = rowData.templateId;
                //工单质检
                if (templateType === Util.constants.CHECK_TYPE_ORDER) {
                    var param = {
                        "provCode": checkObj.provCode,
                        "wrkfmId": checkObj.wrkfmId,
                        "templateId": checkObj.templateId,
                        "acptStaffNum": checkObj.acptStaffNum,
                        "srvReqstTypeNm": checkObj.srvReqstTypeNm,
                        "actualHandleDuration": checkObj.actualHandleDuration
                    };
                    var orderUrl = createURL(orderCheckDetail, param);
                    addTabs("工单质检" + checkObj.wrkfmShowSwftno, orderUrl);
                }
                if (templateType === Util.constants.CHECK_TYPE_VOICE) {
                    var voiceUrl = createURL(voiceCheckDetail, checkObj);
                    addTabs("语音质检" + checkObj.touchId, voiceUrl);
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
                }, Util.PageUtil.getParams($("#qryCheckTemplate_searchForm", $el)));

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
    function initGlobalEvent() {
        //查询
        $("#qryCheckTemplate_searchForm", $el).on("click", "#qryCheckTemplate_selectBut", function () {
            $("#qryCheckTemplate_page").find("#qryCheckTemplate_checkTemplateManage").datagrid("load");
        });
        //重置
        $("#qryCheckTemplate_searchForm", $el).on("click", "#qryCheckTemplate_resetBut", function () {
            $("#qryCheckTemplate_searchForm").form('clear');
        });
        $("#qryCheckTemplate_page", $el).on("click", "#qryCheckTemplate_close", function () {
            $("#qryCheckTemplate_searchForm").form('clear');
            $("#qry_window").window('close');
        });

    }

    //拼接对象到url
    function createURL(url, param) {
        var urlLink = url;
        if (param != null) {
            $.each(param, function (item, value) {
                urlLink += '&' + item + "=" + encodeURI(value);
            });
            urlLink = url + "?" + urlLink.substr(1);
        }
        return urlLink.replace(' ', '');
    }

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;

        if (!jq('#tabs').tabs('exists', title)) {
            jq('#tabs').tabs('add', {
                title: title,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: true
            });
        } else {
            jq('#tabs').tabs('select', title);
        }
    }

    return initialize;
});
