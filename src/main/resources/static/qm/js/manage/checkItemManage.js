require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var qmURI = "/qm/configservice/checkItem";
    //初始化方法
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
        //initWindowEvent();
        //initReviseEvent();
    };

    //页面信息初始化
    function initPageInfo() {
        //模板渠道下拉框
        $("#tenantType").combobox({
            url: '../../data/tenant_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var tenantType = $("#tenantType");
                var data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#checkItemList").datagrid("load");
            }
        });
        //考评项类型下拉框
        $("#checkItemType").combobox({
            url: '../../data/check_item_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var checkItemType = $('#checkItemType');
                var data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#checkItemList").datagrid("load");
            }
        });

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkitemId', title: '考评项ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkitemName', title: '考评项名称', align: 'center', width: '20%'},
                {field: 'checkitemType', title: '考评项类型', align: 'center', width: '20%'},
                {field: 'checkitemVitalType', title: '致命类别', align: 'center', width: '13%'},
                {field: 'remark', title: '考评项描述', align: 'center', width: '30%'},
                {
                    field: 'action', title: '操作', align: 'center', width: '13%',
                    formatter: function (value, row, index) {
                            return "<a href='javascript:void(0);' class='reviseBtn' id = 'checkItem'" + row.checkItemId + " >修改</a>";
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
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var checkItemName = $("#checkItemName").val();
                var tenantId = $("#tenantType").combobox("getValue");
                var checkItemType = $("#checkItemType").combobox("getValue");
                if(checkItemType === "4"){
                    checkItemType = null;
                }
                var reqParams = {
                    "parentCheckItemId":Util.constants.PARENT_CHECK_ITEM_ID,
                    "checkItemName":checkItemName,
                    "tenantId":tenantId,
                    "checkItemType": checkItemType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/queryCheckItem", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);

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
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#checkItemList").datagrid("load");
        });

        //新增
        $("#addBtn").on("click", function () {
            showCheckItemCreateDialog();
        });

        //修改


        //删除
        $("#delBtn").on("click", function () {
            showCheckItemDeleteDialog();
        });
    }

    /**
     * 新增考评项弹框
     */
    function showCheckItemCreateDialog() {
        $("#checkItemConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#checkItemDialog").show().window({
            width: 600,
            height: 350,
            modal: true,
            title: "新增考评项"
        });
        //考评项类型下拉框
        $("#checkItemTypeConfig").combobox({
            url: '../../data/check_item_config_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var checkItemType = $('#checkItemTypeConfig');
                var data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].codeValue);
                }
            }
        });
        //考评项致命类别下拉框
        $("#checkItemVitalTypeConfig").combobox({
            url: '../../data/check_item_vital_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var checkItemVitalType = $('#checkItemVitalTypeConfig');
                var data = checkItemVitalType.combobox('getData');
                if (data.length > 0) {
                    checkItemVitalType.combobox('select', data[0].codeValue);
                }
            }
        });
        //取消
        var cancelBtn = $("#cancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click",function () {
            $("#checkItemConfig").form('clear');  //清空表单
            $("#checkItemDialog").window("close");
        });
        //提交
        var submitBtn = $("#submitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click",function () {
            if(disableSubmit){
                return false;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var checkItemName = $("#checkItemNameConfig").val();
            var checkItemType = $("#checkItemTypeConfig").combobox("getValue");
            var checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue");
            var checkItemDesc = $("#checkItemDescConfig").val();

            if(checkItemName == null || checkItemName ===""){
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            var params = {
                "tenantId":Util.constants.TENANT_ID,
                "parentCheckitemId":Util.constants.PARENT_CHECK_ITEM_ID,
                'checkitemName':checkItemName,
                'checkitemType':checkItemType,
                'checkitemVitalType':checkItemVitalType,
                'remark':checkItemDesc
            };
            Util.ajax.postJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(params), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $("#checkItemDialog").window("close");  //关闭对话框
                    $("#checkItemList").datagrid('reload'); //插入成功后，刷新页面
                }
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
            });
        });
    }

    /**
     * 修改考评项弹框
     */
    function showCheckItemUpdateDialog() {
        $("#checkItemConfig").form('clear');  //清空表单
        $("#checkItemDialog").show().window({
            width: 600,
            height: 350,
            modal: true,
            title: "修改考评项"
        });
        //考评项类型下拉框
        $("#checkItemTypeConfig").combobox({
            url: '../../data/check_item_config_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var checkItemType = $('#checkItemTypeConfig');
                var data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].codeValue);
                }
            }
        });
        //考评项致命类别下拉框
        $("#checkItemVitalTypeConfig").combobox({
            url: '../../data/check_item_vital_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var checkItemVitalType = $('#checkItemVitalTypeConfig');
                var data = checkItemVitalType.combobox('getData');
                if (data.length > 0) {
                    checkItemVitalType.combobox('select', data[0].codeValue);
                }
            }
        });
        //取消
        var cancelBtn = $("#cancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click",function () {
            $("#checkItemConfig").form('clear');  //清空表单
            $("#checkItemDialog").window("close");
        });
        //提交
        var submitBtn = $("#submitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click",function () {
            submitBtn.linkbutton({disabled: true});  //防止多次提交
        });
    }

    /**
     * 删除考评项弹框
     */
    function showCheckItemDeleteDialog() {
        var delRows = $("#checkItemList").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].checkitemId;
            delArr.push(id);
        }
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(qmURI).concat("/").concat(delArr), {}, function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#checkItemList").datagrid('reload'); //删除成功后，刷新页面
                    }
                });
            }
        });
    }

    /**
     * 增加弹出窗口事件
     */
    //function initWindowEvent() {
    //    /*
    //     * 弹出添加窗口
    //     */
    //    $("#page").on("click", "#addSens", function () {
    //        $("#add_content").find('form.form').form('clear');  //初始化清空
    //
    //        $("#add_content").show().window({   //弹框
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "添加静态参数配置"
    //        });
    //
    //        $("#add_content").unbind("click");
    //        /*
    //         * 清除表单信息
    //         */
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#global", function () {
    //            // if ($(this).textbox({disabled : true})) {
    //            //     return;
    //            // }
    //            //禁用按钮，防止多次提交
    //            $('#global').linkbutton({disabled: true});
    //
    //            var sensitiveWord = $("#sensitiveWord").val();
    //            var substituteWord = $("#substituteWord").val();
    //            var rmk = $("#rmk").val();
    //
    //            var params = {'sensitiveWord': sensitiveWord, 'substituteWord': substituteWord, 'rmk': rmk};
    //
    //            if (sensitiveWord == null || sensitiveWord == "" || substituteWord == null
    //                || substituteWord == "") {
    //                $.messager.alert('警告', '敏感词和替换词不能为空。');
    //
    //                $("#global").linkbutton({disabled: false});  //按钮可用
    //                return false;
    //            }
    //
    //            Util.ajax.postJson(Util.constants.CONTEXT + "/sensword/insertsensword", params, function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'show'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#evaluManage").datagrid('reload'); //插入成功后，刷新页面
    //                }
    //            });
    //            //enable按钮
    //            $("#global").linkbutton({disabled: false}); //按钮可用
    //        });
    //    });
    //}
    //
    ////敏感词修改
    //function initReviseEvent() {
    //    /*
    //     * 弹出修改窗口
    //     */
    //    $("#page").on("click", "a.reviseBtn", function () {
    //        $("#add_content").show().window({
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "修改敏感词配置"
    //        });
    //
    //        var sensStr = $(this).attr('id'); //获取选中行的数据
    //        var sensjson = JSON.parse(sensStr); //转成json格式
    //
    //        $('#createSkillConfig').form('load', sensjson);   //将数据填入弹框中
    //
    //        $("#add_content").unbind("click");              //解绑事件
    //
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#global", function () {
    //
    //            var wordId = $("#wordId").val();
    //            var sensitiveWord = $("#sensitiveWord").val();
    //            var substituteWord = $("#substituteWord").val();
    //            var rmk = $("#rmk").val();
    //
    //            var params = {'wordId':wordId, 'sensitiveWord': sensitiveWord, 'substituteWord': substituteWord, 'rmk': rmk};
    //
    //            if (sensitiveWord == null || sensitiveWord == "" || substituteWord == null
    //                || substituteWord == "") {
    //                $.messager.alert('警告', '敏感词和替换词不能为空。');
    //
    //                $("#global").linkbutton({disabled: false});  //按钮可用
    //
    //                return false;
    //            }
    //
    //            Util.ajax.putJson(Util.constants.CONTEXT + "/sensword/updatesensword", params, function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'show'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#evaluManage").datagrid('reload'); //修改成功后，刷新页面
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
