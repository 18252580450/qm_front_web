require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var checkTypeData = [],    //考评项下拉框静态数据
        checkItemData = [],    //新增考评项下拉框静态数据
        vitalTypeData = [];    //新增致命类别下拉框静态数据

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //模板渠道下拉框
        $("#tenantType").combobox({
            url: '../../data/tenant_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
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
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var checkItemType = $('#checkItemType');
                var data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].paramsCode);
                }
            },
            onSelect: function () {
                $("#checkItemList").datagrid("load");
            }
        });
        //重载下拉框数据
        reloadSelectData("CHECK_ITEM_TYPE", "checkItemType", true)

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemId', title: '考评项ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkItemName', title: '考评项名称', align: 'center', width: '20%'},
                {
                    field: 'checkItemType', title: '考评项类型', align: 'center', width: '20%',
                    formatter: function (value, row, index) {
                        var itemType = "";
                        if(checkTypeData.length !== 0){
                            $.each(checkTypeData,function(index, item){
                                if(item.paramsCode === value){
                                    itemType = item.paramsName;
                                }
                            });
                        }
                        return itemType;
                    }
                },
                {
                    field: 'checkItemVitalType', title: '致命类别', align: 'center', width: '13%',
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
                {field: 'remark', title: '考评项描述', align: 'center', width: '30%'},
                {
                    field: 'action', title: '操作', align: 'center', width: '13%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "checkItem' + row.checkItemId + '">修改</a>';
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
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
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var checkItemName = $("#checkItemName").val();
                var tenantId = $("#tenantType").combobox("getValue");
                var checkItemType = $("#checkItemType").combobox("getValue");
                if (checkItemType === "-1") {
                    checkItemType = null;
                }
                var reqParams = {
                    "parentCheckItemId": Util.constants.PARENT_CHECK_ITEM_ID,
                    "checkItemName": checkItemName,
                    "tenantId": tenantId,
                    "checkItemType": checkItemType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItem", params, function (result) {
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
            },
            onLoadSuccess: function (data) {
                //绑定考评项修改事件
                $.each(data.rows, function (i, item) {
                    $("#checkItem" + item.checkItemId).on("click", function () {
                        showCheckItemUpdateDialog(item);
                    });
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
            title: "考评项新增"
        });
        //考评项类型下拉框
        $("#checkItemTypeConfig").combobox({
            data: checkItemData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var checkItemType = $('#checkItemTypeConfig');
                var data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        if (checkItemData.length === 0) {
            reloadSelectData("CHECK_ITEM_TYPE", "checkItemTypeConfig", false);
        }

        //考评项致命类别下拉框
        $("#checkItemVitalTypeConfig").combobox({
            data: vitalTypeData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var checkItemVitalType = $('#checkItemVitalTypeConfig');
                var data = checkItemVitalType.combobox('getData');
                if (data.length > 0) {
                    checkItemVitalType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        if (vitalTypeData.length === 0) {
            reloadSelectData("CHECK_VITAL_TYPE", "checkItemVitalTypeConfig", false);
        }

        //取消
        var cancelBtn = $("#cancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#checkItemConfig").form('clear');  //清空表单
            $("#checkItemDialog").window("close");
        });
        //提交
        var submitBtn = $("#submitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return false;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var tenantId = $("#tenantType").combobox("getValue");
            var checkItemName = $("#checkItemNameConfig").val();
            var checkItemType = $("#checkItemTypeConfig").combobox("getValue");
            var checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue");
            var checkItemDesc = $("#checkItemDescConfig").val();

            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            var params = {
                "tenantId": tenantId,
                "parentCheckItemId": Util.constants.PARENT_CHECK_ITEM_ID,
                "checkItemName": checkItemName,
                "checkItemType": checkItemType,
                "checkItemVitalType": checkItemVitalType,
                "remark": checkItemDesc
            };
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(params), function (result) {
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
    function showCheckItemUpdateDialog(item) {
        $("#checkItemConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#checkItemDialog").show().window({
            width: 600,
            height: 350,
            modal: true,
            title: "考评项修改"
        });
        //自动填入待修改考评项名称
        $("#checkItemNameConfig").val(item.checkItemName);
        //自动填入待修改考评项描述
        $("#checkItemDescConfig").val(item.remark);
        //考评项类型下拉框
        $("#checkItemTypeConfig").combobox({
            data: checkItemData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                //自动填入待修改考评项类型
                if(checkItemData.length !== 0){
                    $('#checkItemTypeConfig').combobox('setValue', item.checkItemType);
                }
            }
        });
        //重载下拉框数据
        if (checkItemData.length === 0) {
            reloadSelectData("CHECK_ITEM_TYPE", "checkItemTypeConfig", false);
        }

        //考评项致命类别下拉框
        $("#checkItemVitalTypeConfig").combobox({
            data: vitalTypeData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                //自动填入待修改考评项致命类别
                if(vitalTypeData.length !== 0){
                    $('#checkItemVitalTypeConfig').combobox('setValue', item.checkItemVitalType);
                }
            }
        });
        //重载下拉框数据
        if (vitalTypeData.length === 0) {
            reloadSelectData("CHECK_VITAL_TYPE", "checkItemVitalTypeConfig", false);
        }

        //取消
        var cancelBtn = $("#cancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#checkItemConfig").form('clear');  //清空表单
            $("#checkItemDialog").window("close");
        });
        //提交
        var submitBtn = $("#submitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return false;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var checkItemName = $("#checkItemNameConfig").val();
            var checkItemType = $("#checkItemTypeConfig").combobox("getValue");
            var checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue");
            var checkItemDesc = $("#checkItemDescConfig").val();

            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            if (checkItemName === item.checkItemName && checkItemType === item.checkItemType && checkItemVitalType === item.checkItemVitalType && checkItemDesc === item.remark) {
                $.messager.alert("提示", "没有作任何修改!", null, function () {
                    $("#checkItemConfig").form('clear');    //清空表单
                    $("#checkItemDialog").window("close");
                });
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }

            item.checkItemName = checkItemName;
            item.remark = checkItemDesc;
            if (checkItemType != null && checkItemType !== "") {
                item.checkItemType = checkItemType;
            }
            if (checkItemVitalType != null && checkItemVitalType !== "") {
                item.checkItemVitalType = checkItemVitalType;
            }

            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(item), function (result) {
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
            var id = delRows[i].checkItemId;
            delArr.push(id);
        }
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/").concat(delArr), {}, function (result) {
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

    //下拉框数据重载
    function reloadSelectData(paramsType, select, showAll) {
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "paramsTypeId": paramsType
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode === "1") {
                var selectData = result.RSP.DATA;
                if (showAll) {
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    selectData.unshift(data);
                }
                //下拉框静态数据更新
                if (paramsType === "CHECK_ITEM_TYPE" && showAll) {
                    checkTypeData = selectData;
                }
                if (paramsType === "CHECK_ITEM_TYPE" && !showAll) {
                    checkItemData = selectData;
                }
                if (paramsType === "CHECK_VITAL_TYPE") {
                    vitalTypeData = selectData;
                }
                //重载下拉框数据
                $("#" + select).combobox('loadData', selectData);
            }
        });
    }

    return {
        initialize: initialize
    };
});