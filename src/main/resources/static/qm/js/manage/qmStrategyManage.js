define([
    "js/manage/qmStrategyManageAdd",
    "jquery", 'util', "transfer", "commonAjax","easyui","dateUtil"],
    function (qmStrategyManageAdd,$, Util, Transfer,CommonAjax) {
    //调用初始化方法
    initialize();
    var paramsType;
    function initialize() {
        initSearchForm();//初始化表单数据
        initGrid();//初始化列表
        initGlobalEvent();//初始化按钮事件
    };

    //批量删除
    function batchDelete(){
        $("#batchDelete").on("click", function () {
            var selRows = $("#retList").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].pId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_DNS).concat("/").concat(ids), {}, function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode == "1") {
                            $("#retList").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });
                }
            });
        });
    }

    function addToolsDom() {
        $(["<td><a href='javascript:void(0)' id='batchDelete' class='btn btn-secondary radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>删除</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
    }

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#retList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '15%',
                    formatter: function (value, row, index) {
                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + row.pId + " >编辑</a>";
                            //" | <a href='javascript:void(0);' class='qryDetail' id =" + row.pId + " >查看明细</a>";
                        return Action;
                    }
                },
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
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: true,
            selectOnCheck: true,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#retList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#retList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var paramsTypeId = $("#paramsType").combobox('getValue');
                var pName = $("#pName").val();
                var isValidate = $("input[name='isValidate']:checked").val();

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
                }, Util.PageUtil.getParams($("#searchForm")));

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
        addToolsDom();
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#retList").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "#btn-default", function () {
            $("#searchForm").form('clear');
        });

        //新增
        $("#addBtn").on("click", function() {
            var qmStrategyManageAdda = new qmStrategyManageAdd(paramsType);
            $('#add_window').show().window({
                title: '新建策略',
                width: 1250,
                height: 700,
                cache: false,
                content:qmStrategyManageAdda.$el,
                modal: true
            });
        });

        //修改
        $("#page").on("click", "a.reviseBtn", function () {
            var pId = $(this).attr('id');
            var qmStrategyManageAdda = new qmStrategyManageAdd(paramsType,pId);
            $('#add_window').show().window({
                title: '修改策略',
                width: 1250,
                height: 700,
                cache: false,
                content:qmStrategyManageAdda.$el,
                modal: true
            });
        });
        //批量删除
        batchDelete();

    }

    //初始化搜索表单
    function initSearchForm() {
        $('#paramsType').combobox({
            data: [],
            editable: false
        });
        CommonAjax.getStaticParams("STRATEGY_ELE_TYPE",function(datas){
            if(datas){
                paramsType = datas;
                paramsType.unshift({paramsCode:"",paramsName:"- 请选择 -"});
                $('#paramsType').combobox({
                    data: datas,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });

    }

    return {
        initialize: initialize
    };
});
