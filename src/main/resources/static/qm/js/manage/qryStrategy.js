define([
    "text!html/manage/qryStrategy.tpl",
    "jquery", 'util', "transfer", "commonAjax","easyui","dateUtil"],
    function (tpl,$, Util, Transfer,CommonAjax) {
    var $el;
    function initialize() {
        $el = $(tpl);
        initSearchForm();//初始化表单数据
        initGrid();//初始化列表
        initGlobalEvent();//初始化按钮事件
        this.$el = $el;
    };

    //初始化列表
    function initGrid() {
        $("#qryStrategy_page",$el).find("#qryStrategy_retList").datagrid({
            columns: [[
                {field: 'pId', title: '策略编码', width: '15%'},
                {field: 'pName', title: '策略名称', width: '15%'},
                {field: 'paramsTypeName', title: '策略类型', width: '15%'},
                {field: 'isValidate', title: '有效标识', width: '10%',
                    formatter: function (value, row, index) {
                        if (0 == value) {
                            return "有效";
                        } else if (1 == value) {
                            return "无效";
                        }
                    }
                },
                {field: 'createDate', title: '创建时间', width: '10%',
                    formatter: function (value, row, index) {
                        if(value){
                            return DateUtil.formatDateTime(value);
                        }
                    }
                },
                {field: 'updateDate', title: '更新时间', width: '10%',
                    formatter: function (value, row, index) {
                        if(value){
                            return DateUtil.formatDateTime(value);
                        }
                    }
                }
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
                $('#strategy').searchbox("setValue",rowData.pName);
                $('#pId').val(rowData.pId);
                $("#qry_window").window('destroy');
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var paramsTypeId = $("#paramsType",$el).combobox('getValue');
                var pName = $("#pName",$el).val();
                var isValidate = $("input[name='isValidate']:checked",$el).val();

                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "pName": pName,
                    "isValidate": isValidate,
                    "paramsTypeId": paramsTypeId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#qryStrategy_searchForm"),$el));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_STRATEGY_DNS + "/selectByParams", params, function (result) {
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
        $("#qryStrategy_searchForm",$el).on("click", "#qryStrategy_selectBut", function () {
            $("#qryStrategy_page").find("#qryStrategy_retList").datagrid("load");
        });

        //重置
        $("#qryStrategy_searchForm",$el).on("click", "#qryStrategy_resetBut", function () {
            $("#qryStrategy_searchForm").form('clear');
        });

        $("#qryStrategy_page",$el).on("click", "#qryStrategy_close", function () {
            $("#qryStrategy_searchForm").form('clear');
            $("#qry_window").window('destroy');
        });
    }

    //初始化搜索表单
    function initSearchForm() {
        $('#paramsType',$el).combobox({
            data: [],
            editable: false
        });
        CommonAjax.getStaticParams("STRATEGY_ELE_TYPE",function(datas){
            if(datas){
                $('#paramsType',$el).combobox({
                    data: datas,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });

    }

    return  initialize;
});
