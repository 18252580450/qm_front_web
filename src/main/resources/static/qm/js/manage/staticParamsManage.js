require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var userInfo;
    //调用初始化方法
    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initGrid();
            initGlobalEvent();
            initTypeWindowEvent();
            initWindowEvent();
            initReviseEvent();
        });
    };

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#staticParamsManage").datagrid({
            columns: [[
                {field: 'paramsPurposeId', title: '参数用途ID', hidden: true},
                {field: 'paramsTypeId', title: '参数类型ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'tenantId', title: '渠道', width: '15%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'paramsTypeName', title: '参数用途名称', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'paramsCode', title: '参数编码', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'paramsName', title: '参数名称', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        var bean = {
                            'tenantId': row.tenantId,
                            'paramsPurposeId': row.paramsPurposeId, 'paramsTypeId': row.paramsTypeId,
                            'paramsCode': row.paramsCode,'paramsName': row.paramsName,
                            'paramsTypeName': row.paramsTypeName
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串
                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + beanStr + " >修改</a>";
                        return Action;
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
                    $("#staticParamsManage").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#staticParamsManage").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var paramsTypeId = $("#paramsNameq").val();
                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "paramsTypeName": paramsTypeId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));
                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
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
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#staticParamsManage").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "#btn-default", function () {
            $("#searchForm").form('clear');
        });

        //绑定删除按钮事件
        $("#page").delegate("#delBut", "click", function () {

            var selRows = $("#staticParamsManage").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].paramsPurposeId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.STATIC_PARAMS_DNS).concat("/").concat(ids), {}, function (result) {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 100,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;

                        if (rspCode == "1") {
                            $("#staticParamsManage").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });

                }
            });
        });
    }

    /**
     * 增加弹出窗口事件
     */
    function initWindowEvent() {
        $("#paramsCode").validatebox({required: true});
        $("#paramsName").validatebox({required: true});
        /*
         * 弹出添加窗口
         */
        $("#page").on("click", "#addBut", function () {
            $("#add_content").find('form.form').form('clear');  //初始化清空

            $("#add_content").show().window({   //弹框
                width: 950,
                height: 400,
                modal: true,
                title: "新增参数"
            });
            $("#paramsCode").attr("readonly",false);
            var params = {
                "tenantId":Util.constants.TENANT_ID
            };
            var reqparams = {
                "params":JSON.stringify(params)
            };

            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectAllTypes", reqparams, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    var data = result.RSP.DATA;
                    data.unshift({paramsTypeId:"",paramsTypeName:"- 请选择 -"});
                    $("#typeList").combobox({
                        data : data,
                        required: true,
                        valueField:'paramsTypeId',
                        textField:'paramsTypeName'
                    });
                }
            });

            $("#add_content").unbind("click");

            /*
             * 清除表单信息
             */
            $("#add_content").on("click", "#cancel", function () {
                $("#add_content").find('form.form').form('clear');
                $("#add_content").window("close");
            });

            $("#add_content").on("click", "#subBut", function () {
                //禁用按钮，防止多次提交
                //$('#subBut').linkbutton({disabled: true});

                var paramsCode = $("#paramsCode").val();
                var paramsName = $("#paramsName").val();
                var paramsTypeId = $("#typeList").combobox('getValue');
                var paramsTypeName = $("#typeList").combobox('getText');

                var params = {
                    'tenantId': Util.constants.TENANT_ID,
                    'paramsCode': paramsCode,
                    'paramsName': paramsName,
                    'paramsTypeId':paramsTypeId,
                    'paramsTypeName':paramsTypeName
                };

                if (paramsCode == null || paramsCode == "" || paramsName == null || paramsName == "" || paramsTypeId == null
                    || paramsTypeId == "" ) {
                    $.messager.alert('警告', '必填项不能为空。');

                    //$("#subTypeBut").linkbutton({disabled: false});  //按钮可用
                    return false;
                }

                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.STATIC_PARAMS_DNS).concat("/"), JSON.stringify(params), function (result) {

                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });

                    var rspCode = result.RSP.RSP_CODE;

                    if (rspCode == "1") {
                        $("#staticParamsManage").datagrid('reload'); //插入成功后，刷新页面
                    }
                });
                //enable按钮
                //$("#subBut").linkbutton({disabled: false}); //按钮可用
            });
        });
    }

    /**
     * 增加类型弹出窗口事件
     */
    function initTypeWindowEvent() {
        $("#paramsCodet").validatebox({required: true});
        $("#paramsNamet").validatebox({required: true});
        $("#paramsTypeIdt").validatebox({required: true});
        $("#paramsTypeNamet").validatebox({required: true});
        /*
         * 弹出添加窗口
         */
        $("#page").on("click", "#addTypeBut", function () {
            $("#addtype_content").find('form.form').form('clear');  //初始化清空

            $("#addtype_content").show().window({   //弹框
                width: 950,
                height: 400,
                modal: true,
                title: "新增类别"
            });

            $("#addtype_content").unbind("click");
            /*
             * 清除表单信息
             */
            $("#addtype_content").on("click", "#cancelType", function () {
                $("#addtype_content").find('form.form').form('clear');
                $("#addtype_content").window("close");
            });

            $("#addtype_content").on("click", "#subTypeBut", function () {
                //禁用按钮，防止多次提交
                //$('#subTypeBut').linkbutton({disabled: true});

                var paramsCode = $("#paramsCodet").val();
                var paramsName = $("#paramsNamet").val();
                var paramsTypeId = $("#paramsTypeIdt").val();
                var paramsTypeName = $("#paramsTypeNamet").val();

                var params = {
                    'tenantId': Util.constants.TENANT_ID,
                    'paramsCode': paramsCode,
                    'paramsName': paramsName,
                    'paramsTypeId':paramsTypeId,
                    'paramsTypeName':paramsTypeName
                };

                if (paramsCode == null || paramsCode == "" || paramsName == null || paramsName == "" || paramsTypeId == null
                    || paramsTypeId == "" || paramsTypeName == null || paramsTypeName == "") {
                    $.messager.alert('警告', '必填项不能为空。');

                    //$("#subTypeBut").linkbutton({disabled: false});  //按钮可用
                    return false;
                }

                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.STATIC_PARAMS_DNS).concat("/"), JSON.stringify(params), function (result) {

                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 100,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });

                    var rspCode = result.RSP.RSP_CODE;

                    if (rspCode == "1") {
                        $("#staticParamsManage").datagrid('reload'); //插入成功后，刷新页面
                        $("#add_window").window("close");
                    }
                });
                //enable按钮
                //$("#subTypeBut").linkbutton({disabled: false}); //按钮可用
            });
        });
    }

    //修改
    function initReviseEvent() {
        /*
         * 弹出修改窗口
         */
        $("#page").on("click", "a.reviseBtn", function () {
            $("#add_content").show().window({
                width: 950,
                height: 400,
                modal: true,
                title: "修改参数"
            });
            $("#paramsCode").attr("readonly",true);
            var beanStr = $(this).attr('id'); //获取选中行的数据
            var beanjson = JSON.parse(beanStr); //转成json格式
            var arr = new Array(beanjson);
            $('#createType').form('load', beanjson);   //将数据填入弹框中
            $("#typeList").combobox({
                data : arr,
                valueField:'paramsTypeId',
                textField:'paramsTypeName'
            });
            $("#typeList").combobox("setValue",beanjson['paramsTypeId']);

            $("#add_content").unbind("click");              //解绑事件

            $("#add_content").on("click", "#cancel", function () {
                $("#add_content").find('form.form').form('clear');
                $("#add_content").window("close");
            });

            $("#add_content").on("click", "#subBut", function () {

                var paramsName = $("#paramsName").val();
                beanjson['paramsName'] = paramsName;
                if (paramsName == null || paramsName == "") {
                    $.messager.alert('警告', '参数名称不能为空。');

                    //$("#subBut").linkbutton({disabled: false});  //按钮可用

                    return false;
                }

                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.STATIC_PARAMS_DNS).concat("/"), JSON.stringify(beanjson), function (result) {

                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });

                    var rspCode = result.RSP.RSP_CODE;

                    if (rspCode == "1") {
                        $("#staticParamsManage").datagrid('reload'); //修改成功后，刷新页面
                        $("#add_window").window("close");
                    }

                })
            })
        });
    };

    return {
        initialize: initialize
    };
});
