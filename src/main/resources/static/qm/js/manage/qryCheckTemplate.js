define([
    "text!html/manage/qryCheckTemplate.tpl",
    "jquery", 'util', "transfer", "easyui","dateUtil"], function (tpl,$, Util, Transfer,dateUtil) {

    var $el;
    function initialize() {
        $el = $(tpl);
        initGrid();
        initGlobalEvent();
        this.$el = $el;
    };

    //初始化列表
    function initGrid() {

        //模板渠道下拉框
        $("#templatChannel",$el).combobox({
            url: '../../data/checkTemp_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示第一个数据
                var templatChannel = $("#templatChannel");
                var data = templatChannel.combobox('getData');
                if (data.length > 0) {
                    templatChannel.combobox('select', data[0].codeValue);
                }
            }
        });

        //模板状态下拉框
        $("#templateStatus",$el).combobox({
            url: '../../data/checkStatus_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示最后一个数据
                var templateStatus = $("#templateStatus");
                var data = templateStatus.combobox('getData');
                if (data.length > 0) {
                    templateStatus.combobox('select', data[4].codeValue);
                }
            }
        });

        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#qryCheckTemplate_checkTemplateManage",$el).datagrid({
            columns: [[
                {field: 'templateId', title: '考评模板编码', width: '20%', hidden: true},
                {field: 'templateName', title: '模板名称', width: '20%'},
                {field: 'tenantId', title: '渠道名称', width: '20%'},
                {field: 'templateStatus', title: '模板状态', width: '15%',
                    formatter:function(value,row,index){
                        return {'0':'未发布','1':'发布','2':'暂停','3':'删除'}[value];
                    }},
                {field: 'remark', title: '备注', width: '20%'},
                {field: 'createTime', title: '创建时间', width: '20%',
                    formatter:function(value,row,index){
                        return DateUtil.formatDateTime(value);
                }},
            ]],
            fitColumns: true,
            width: '100%',
            height: 300,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            singleSelect: true,
            autoRowHeight: true,
            onDblClickRow:function(rowIndex, rowData){
                //var template = {
                //    templateId : rowData.templateId,
                //    templateName:rowData.templateName
                //}
                //var str = JSON.stringify(template);
                $('#template').searchbox("setValue",rowData.templateName);
                $('#templateId').val(rowData.templateId);
                $("#qry_window").window("close");
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var templateName = $("#templateName",$el).val();
                var tenantId = $("#templatChannel",$el).combobox("getValue");
                var templateStatus = $("#templateStatus",$el).combobox("getValue");
                if(templateStatus == '4'){
                    templateStatus = null;
                }
                var reqParams = {
                    "tenantId":tenantId,
                    "templateName": templateName,
                    "templateStatus": templateStatus
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#qryCheckTemplate_searchForm",$el)));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE + "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);

                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != "1") {

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
        $("#qryCheckTemplate_searchForm",$el).on("click", "#qryCheckTemplate_selectBut", function () {
            $("#qryCheckTemplate_page").find("#qryCheckTemplate_checkTemplateManage").datagrid("load");
        });
        //重置
        $("#qryCheckTemplate_searchForm",$el).on("click", "a.btn-default", function () {
            $("#qryCheckTemplate_searchForm").form('clear');
        });
        $("#qryCheckTemplate_page",$el).on("click", "#close", function () {
            $("#qryCheckTemplate_searchForm").form('clear');
            $("#qry_window").window("close");
        });

    }
    return initialize;
});
