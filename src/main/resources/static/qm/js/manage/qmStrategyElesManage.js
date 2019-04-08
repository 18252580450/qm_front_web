define([
    "jquery", 'util', "transfer", "commonAjax","easyui","dateUtil"],
    function ($, Util, Transfer,CommonAjax) {
    var userInfo;
    //调用初始化方法
    initialize();
    var elementTypyes;
    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initSearchForm();//初始化表单数据
            initGrid();//初始化列表
            initGlobalEvent();//初始化按钮事件
            initWindowEvent();
            initUpdateWindow();
        });
    };

    //批量删除
    function batchDelete(){
        $("#batchDelete").unbind("click");
        $("#batchDelete").on("click", function () {
            var selRows = $("#elesList").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].elementId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_ELES_DNS).concat("/").concat(ids), {}, function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode == "1") {
                            $("#elesList").datagrid('reload'); //删除成功后，刷新页面
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
        $("#page").find("#elesList").datagrid({
            columns: [[
                {field: 'elementId', title: '元素ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + row.elementId + " >编辑</a>";
                        return Action;
                    }
                },
                {field: 'elementCode', title: '元素编码', width: '15%'},
                {field: 'elementName', title: '元素名称', width: '15%'},
                {field: 'paramsTypeName', title: '元素类型', width: '13%'},
                {field: 'isValidate', title: '有效标识', width: '8%',
                    formatter: function (value, row, index) {
                        if (0 == value) {
                            return "有效";
                        } else if (1 == value) {
                            return "无效";
                        }
                    }
                },
                {field: 'elementType', title: '字段类型', width: '8%',
                    formatter: function (value, row, index) {
                        var str = "";
                        if(elementTypyes){
                            $.each(elementTypyes,function(index, item){
                                if(item.paramsCode == value){
                                    str = item.paramsName;
                                    return;
                                }
                            });
                        }
                        return str;
                    }},
                {field: 'isRegion', title: '区间值', width: '8%',
                    formatter: function (value, row, index) {
                        if (0 == value) {
                            return "否";
                        } else if (1 == value) {
                            return "是";
                        }
                    }
                },
                {field: 'isNeed', title: '必须字段', width: '8%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "否";
                        }else if(1 == value){
                            return "是";
                        }
                    }},
                {field: 'remark', title: '备注', width: '8%'}
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
                    $("#elesList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#elesList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var paramsTypeId = $("#paramsType").combobox('getValue');

                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "paramsTypeId": paramsTypeId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_STRATEGY_ELES_DNS + "/selectByParams", params, function (result) {
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
        // addToolsDom();
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#elesList").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "#clearBut", function () {
            $("#searchForm").form('clear');
        });

        //批量删除
        batchDelete();

    }

    function initWindowEvent(){
        $("#elementCode").validatebox({required: true});
        $("#elementName").validatebox({required: true});

        //新增
        $("#addBtn").on("click", function(){
            $('#add_window').show().window({
                title: '新建元素',
                width: 950,
                height: 400,
                cache: false,
                modal: true
            });
            $("#add_content").find('form.form').form('clear');  //初始化清空
            $("#isRegion1").prop("checked", true);
            $("#isNeed1").prop("checked", true);
            $("#isValidate1").prop("checked", true);
            $("#add_content").unbind("click");
            /*
             * 清除表单信息
             */
            $("#add_content").on("click", "#cancel", function () {
                $("#add_content").find('form.form').form('clear');
                $("#add_window").window("close");
            });

            $("#add_content").on("click", "#subBut", function () {
                //禁用按钮，防止多次提交
                //$('#subBut').linkbutton({disabled: true});

                var paramsTypeId = $("#paramsTypeId").combobox('getValue');
                var elementType = $("#elementType").combobox('getValue');
                var elementCode = $("#elementCode").val();
                var elementName = $("#elementName").val();
                var isRegion = $("input[name='isRegion']:checked").val();
                var isNeed = $("input[name='isNeed']:checked").val();
                var isValidate = $("input[name='isValidate']:checked").val();
                var remark = $("#remark").val();

                var params = {
                    'tenantId': Util.constants.TENANT_ID,
                    'paramsTypeId': paramsTypeId,
                    'elementType': elementType,
                    'elementCode':elementCode,
                    'elementName':elementName,
                    'isRegion':isRegion,
                    'isNeed':isNeed,
                    'isValidate':isValidate,
                    "remark":remark
                };

                if (paramsTypeId == null || paramsTypeId == "" || elementType == null || elementType == "" || elementCode == null
                    || elementCode == "" ||elementName == null || elementName == "") {
                    $.messager.alert('警告', '必填项不能为空。');

                    //$("#subBut").linkbutton({disabled: false});  //按钮可用
                    return false;
                }

                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_ELES_DNS).concat("/"), JSON.stringify(params), function (result) {

                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });

                    var rspCode = result.RSP.RSP_CODE;

                    if (rspCode == "1") {
                        $("#add_window").window("close");
                        $("#elesList").datagrid('reload'); //插入成功后，刷新页面
                    }
                });
                //enable按钮
                //$("#subBut").linkbutton({disabled: false}); //按钮可用
            });
        });

    }

    function initUpdateWindow(){
        //修改
        $("#page").on("click", "a.reviseBtn", function () {
            $('#add_window').show().window({
                title: '修改元素',
                width: 950,
                height: 400,
                cache: false,
                modal: true
            });
            var id = $(this).attr('id'); //获取选中行的数据
            var bean;
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_STRATEGY_ELES_DNS + "/" + id, {}, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1" && result.RSP.DATA.length > 0) {
                    bean = result.RSP.DATA[0];
                    $("#paramsTypeId").combobox('setValue',bean.paramsTypeId);
                    $("#elementType").combobox('setValue',bean.elementType);
                    $("#elementCode").val(bean.elementCode);
                    $("#elementName").val(bean.elementName);
                    $("input[name='isRegion'][value='"+bean.isRegion+"']").prop("checked", true);
                    $("input[name='isNeed'][value='"+bean.isNeed+"']").prop("checked", true);
                    $("input[name='isValidate'][value='"+bean.isValidate+"']").prop("checked", true);
                    $("#remark").val(bean.remark);
                }
            });

            $("#add_content").unbind("click");              //解绑事件

            $("#add_content").on("click", "#cancel", function () {
                $("#add_content").find('form.form').form('clear');
                $("#add_window").window("close");
            });

            $("#add_content").on("click", "#subBut", function () {
                var paramsTypeId = $("#paramsTypeId").combobox('getValue');
                var elementType = $("#elementType").combobox('getValue');
                var elementCode = $("#elementCode").val();
                var elementName = $("#elementName").val();
                var isRegion = $("input[name='isRegion']:checked").val();
                var isNeed = $("input[name='isNeed']:checked").val();
                var isValidate = $("input[name='isValidate']:checked").val();
                var remark = $("#remark").val();
                if (paramsTypeId == null || paramsTypeId == "" || elementType == null || elementType == "" || elementCode == null
                    || elementCode == "" ||elementName == null || elementName == "") {
                    $.messager.alert('警告', '必填项不能为空。');
                    //$("#subBut").linkbutton({disabled: false});  //按钮可用
                    return false;
                }
                bean['paramsTypeId'] = paramsTypeId;
                bean['elementType'] = elementType;
                bean['elementCode'] = elementCode;
                bean['elementName'] = elementName;
                bean['isRegion'] = isRegion;
                bean['isValidate'] = isValidate;
                bean['isNeed'] = isNeed;
                bean['remark'] = remark;
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_ELES_DNS).concat("/"), JSON.stringify(bean), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $("#add_window").window("close");
                        $("#elesList").datagrid('reload'); //修改成功后，刷新页面
                    }
                })
            })
        });
    }

    //初始化搜索表单
    function initSearchForm() {
        $('#paramsType').combobox({
            data: [],
            editable: false,
            // required: true
        });
        CommonAjax.getStaticParams("STRATEGY_ELE_TYPE",function(datas){
            if(datas){
                datas.unshift({paramsCode:"",paramsName:"- 请选择 -"});
                $('#paramsType').combobox({
                    data: datas,
                    // required: true,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
                $('#paramsTypeId').combobox({
                    data: datas,
                    // required: true,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });

        CommonAjax.getStaticParams("ELEMENT_TYPE",function(datas){
            if(datas){
                elementTypyes = datas;
                elementTypyes.unshift({paramsCode:"",paramsName:"- 请选择 -"});
                $('#elementType').combobox({
                    data: elementTypyes,
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
