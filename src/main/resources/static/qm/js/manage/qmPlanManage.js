require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    //调用初始化方法
    initialize();

    function initialize() {
        initSearchForm();
        initGrid();
        initGlobalEvent();
        //initReviseEvent();
    };

    function batchUpdate(targetBut){
        var currId = targetBut.currentTarget.id;
        var title = "";
        var msg = "";
        var halfFlag = "";
        if(currId == "batchStart"){
            halfFlag = "1";
            title = "确认启动弹窗";
            msg = "确定启动吗？";
        }else if(currId == "batchStop"){
            halfFlag = "0";
            title = "确认暂停弹窗";
            msg = "确定暂停吗？";
        }
        var selRows = $("#planList").datagrid("getSelections");
        if (selRows.length == 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var ids = [];
        for (var i = 0; i < selRows.length; i++) {
            var planId = selRows[i].planId;
            ids.push(planId);
        }
        var params = {
            ids : ids,
            halfFlag : halfFlag
        }
        $.messager.confirm(title, msg, function (confirm) {
            if (confirm) {
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/batchUpdate"),JSON.stringify(params), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $("#planList").datagrid('reload'); //更新成功后，刷新页面
                    }
                });
            }
        });
    }

    function batchDelete(){
        //绑定删除按钮事件
        $("#batchDelete").on("click", function () {
            var selRows = $("#planList").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].planId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/").concat(ids), {}, function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode == "1") {
                            $("#planList").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });
                }
            });
        });
    }

    function addToolsDom() {
        $(["<td><a href='javascript:void(0)' id='updateQmPlan' class='btn btn-green radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>修改</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
        $(["<td><a href='javascript:void(0)' id='batchStart' class='btn btn-green radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>启动</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
        $(["<td><a href='javascript:void(0)' id='batchStop' class='btn btn-green radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>暂停</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
        $(["<td><a href='javascript:void(0)' id='batchDelete' class='btn btn-green radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>删除</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
    }

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#planList").datagrid({
            columns: [[
                {field: 'planId', title: '计划编码', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '10%',

                    formatter: function (value, row, index) {
                        var bean = {
                            'planId': row.planId,
                            'planName': row.planName, 'planStarttime': row.planStarttime,
                            'planEndtime': row.planEndtime,'templateName': row.templateName,
                            'haltFlag': row.haltFlag,'remark' : row.remark
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串

                        var Action =
                            "<a href='javascript:void(0);' class='copyBtn' id =" + beanStr + " >复制</a>"+
                            " | <a href='javascript:void(0);' class='reviseBtn' id =" + beanStr + " >编辑</a>"+
                            " | <a href='javascript:void(0);' class='qryDetailBtn' id =" + beanStr + " >详情</a>";
                        return Action;
                    }
                },
                {field: 'planName', title: '计划名称', width: '8%'},
                {field: 'planStarttime', title: '计划开始时间', width: '13%'},
                {field: 'planEndtime', title: '计划结束时间', width: '13%'},
                {field: 'templateName', title: '考评模板', width: '13%'},
                {field: 'haltFlag', title: '发布状态', width: '5%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "暂停";
                        }else if(1 == value){
                            return "发布";
                        }
                    }
                },
                {field: 'createTime', title: '创建时间', width: '13%'},
                {field: 'modifiedTime', title: '修改时间', width: '13%'},
                {field: 'remark', title: '描述', width: '10%'}
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
                    $("#planList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#planList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var planName = $("#planNameq").val();
                var haltFlag = $("#haltFlagq").combobox('getValue');
                var planType = $("#planTypeq").combobox('getValue');
                var createTimeStart;
                if($("#createTimeStart").datetimebox('getValue')){
                    createTimeStart = $("#createTimeStart").datetimebox('getValue');
                }
                var createTimeEnd;
                if($("#createTimeEnd").datetimebox('getValue')) {
                    createTimeEnd = $("#createTimeEnd").datetimebox('getValue');
                }
                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "planName": planName,
                    "haltFlag": haltFlag,
                    "planType":planType,
                    "createTimeStart": createTimeStart,
                    "createTimeEnd": createTimeEnd
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/selectByParams", params, function (result) {
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
            $("#page").find("#planList").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "a.btn-default", function () {
            $("#searchForm").form('clear');
        });

        //批量删除
        batchDelete();
        //批量启动
        $("#batchStart").on("click",batchUpdate);
        //批量暂停
        $("#batchStop").on("click",batchUpdate);
    }

    function initSearchForm() {
        $('#createTimeStart').datetimebox({
            required: false,
            showSeconds: true,
            panelHeight:'auto',
            onShowPanel:function(){
                $("#createTimeStart").datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onSelect:function(beginDate){
                $('#createTimeEnd').datetimebox().datetimebox('calendar').calendar({
                    validator: function(date){
                        return beginDate <= date;
                    }
                })
            }
        });
        $('#createTimeEnd').datetimebox({
            required: false,
            showSeconds: true,
            onShowPanel:function(){
                 $("#createTimeEnd").datetimebox("spinner").timespinner("setValue","23:59:59");
            }
        });
        $('#haltFlagq').combobox({
            valueField: 'value',
            textField: 'label',
            editable: false,
            data:[
                {
                    label: '暂停',
                    value: '0'
                },
                {
                    label: '发布',
                    value: '1'
                }
            ]
        });
        var reqParams = {
            "tenantId":Util.constants.TENANT_ID,
            "paramsTypeId": "PLAN_TYPE"
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        var data = [];
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode == "1") {
                data = result.RSP.DATA;
                $('#planTypeq').combobox({
                    data: data,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });
        $('#planTypeq').combobox({
            data: data,
            editable: false
        });
    }

    /**
     * 增加弹出窗口事件
     */
    //function initWindowEvent() {
    //    /*
    //     * 弹出添加窗口
    //     */
    //    $("#page").on("click", "#addBut", function () {
    //        $("#add_content").find('form.form').form('clear');  //初始化清空
    //
    //        $("#add_content").show().window({   //弹框
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "新增参数"
    //        });
    //
    //        var params = {
    //            "tenantId":Util.constants.TENANT_ID
    //        };
    //        var reqparams = {
    //            "params":JSON.stringify(params)
    //        };
    //
    //        Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/selectAllTypes", reqparams, function (result) {
    //            var rspCode = result.RSP.RSP_CODE;
    //            if (rspCode == "1") {
    //                $("#typeList").combobox({
    //                    data : result.RSP.DATA,
    //                    valueField:'paramsTypeId',
    //                    textField:'paramsTypeName'
    //                });
    //            }
    //        });
    //
    //        $("#add_content").unbind("click");
    //
    //        /*
    //         * 清除表单信息
    //         */
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#subBut", function () {
    //            //禁用按钮，防止多次提交
    //            $('#subBut').linkbutton({disabled: true});
    //
    //            var paramsCode = $("#paramsCode").val();
    //            var paramsName = $("#paramsName").val();
    //            var paramsTypeId = $("#typeList").combobox('getValue');
    //            var paramsTypeName = $("#typeList").combobox('getText');
    //
    //            var params = {
    //                'tenantId': Util.constants.TENANT_ID,
    //                'paramsCode': paramsCode,
    //                'paramsName': paramsName,
    //                'paramsTypeId':paramsTypeId,
    //                'paramsTypeName':paramsTypeName
    //            };
    //
    //            if (paramsCode == null || paramsCode == "" || paramsName == null || paramsName == "" || paramsTypeId == null
    //                || paramsTypeId == "") {
    //                $.messager.alert('警告', '必填项不能为空。');
    //
    //                $("#subTypeBut").linkbutton({disabled: false});  //按钮可用
    //                return false;
    //            }
    //
    //            Util.ajax.postJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(params), function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'slide'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#staticParamsManage").datagrid('reload'); //插入成功后，刷新页面
    //                }
    //            });
    //            //enable按钮
    //            $("#subBut").linkbutton({disabled: false}); //按钮可用
    //        });
    //    });
    //}

    /**
     * 增加类型弹出窗口事件
     */
    //function initTypeWindowEvent() {
    //    /*
    //     * 弹出添加窗口
    //     */
    //    $("#page").on("click", "#addTypeBut", function () {
    //        $("#addtype_content").find('form.form').form('clear');  //初始化清空
    //
    //        $("#addtype_content").show().window({   //弹框
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "新增类别"
    //        });
    //
    //        $("#addtype_content").unbind("click");
    //        /*
    //         * 清除表单信息
    //         */
    //        $("#addtype_content").on("click", "#cancelType", function () {
    //            $("#addtype_content").find('form.form').form('clear');
    //            $("#addtype_content").window("close");
    //        });
    //
    //        $("#addtype_content").on("click", "#subTypeBut", function () {
    //            //禁用按钮，防止多次提交
    //            $('#subTypeBut').linkbutton({disabled: true});
    //
    //            var paramsCode = $("#paramsCodet").val();
    //            var paramsName = $("#paramsNamet").val();
    //            var paramsTypeId = $("#paramsTypeIdt").val();
    //            var paramsTypeName = $("#paramsTypeNamet").val();
    //
    //            var params = {
    //                'tenantId': Util.constants.TENANT_ID,
    //                'paramsCode': paramsCode,
    //                'paramsName': paramsName,
    //                'paramsTypeId':paramsTypeId,
    //                'paramsTypeName':paramsTypeName
    //            };
    //
    //            if (paramsCode == null || paramsCode == "" || paramsName == null || paramsName == "" || paramsTypeId == null
    //                || paramsTypeId == "" || paramsTypeName == null || paramsTypeName == "") {
    //                $.messager.alert('警告', '必填项不能为空。');
    //
    //                $("#subTypeBut").linkbutton({disabled: false});  //按钮可用
    //                return false;
    //            }
    //
    //            Util.ajax.postJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(params), function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'slide'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#staticParamsManage").datagrid('reload'); //插入成功后，刷新页面
    //                }
    //            });
    //            //enable按钮
    //            $("#subTypeBut").linkbutton({disabled: false}); //按钮可用
    //        });
    //    });
    //}

    //修改
    //function initReviseEvent() {
    //    /*
    //     * 弹出修改窗口
    //     */
    //    $("#page").on("click", "a.reviseBtn", function () {
    //        $("#add_content").show().window({
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "修改参数"
    //        });
    //
    //        var beanStr = $(this).attr('id'); //获取选中行的数据
    //        var beanjson = JSON.parse(beanStr); //转成json格式
    //        var arr = new Array(beanjson);
    //        $('#createType').form('load', beanjson);   //将数据填入弹框中
    //        $("#typeList").combobox({
    //            data : arr,
    //            valueField:'paramsTypeId',
    //            textField:'paramsTypeName'
    //        });
    //        $("#typeList").combobox("setValue",beanjson['paramsTypeId']);
    //
    //        $("#add_content").unbind("click");              //解绑事件
    //
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#subBut", function () {
    //
    //            var paramsName = $("#paramsName").val();
    //            beanjson['paramsName'] = paramsName;
    //            if (paramsName == null || paramsName == "") {
    //                $.messager.alert('警告', '参数名称不能为空。');
    //
    //                $("#subBut").linkbutton({disabled: false});  //按钮可用
    //
    //                return false;
    //            }
    //
    //            Util.ajax.putJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(beanjson), function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'slide'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#staticParamsManage").datagrid('reload'); //修改成功后，刷新页面
    //                }
    //
    //            })
    //        })
    //    });
    //};

    return {
        initialize: initialize
    };
});
