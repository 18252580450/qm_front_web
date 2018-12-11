require(["jquery", 'util', "transfer", "easyui", "ztree-exedit"], function ($, Util, Transfer) {

    var setting,               //ztree配置
        checkTypeData = [],    //考评项下拉框静态数据
        checkItemListData = [],//所有考评项
        checkItemData = [],    //新增考评项下拉框静态数据
        vitalTypeData = [],    //新增致命类别下拉框静态数据
        checkNode = {          //左侧考评树选中节点
            id: "",
            parentId: "",
            name: "",
            level: "",
            isParent: ""
        };

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
                $("#checkItemList").datagrid('reload');
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
                $("#checkItemList").datagrid('reload');
            }
        });
        //重载下拉框数据
        reloadSelectData("CHECK_ITEM_TYPE", "checkItemType", true);

        //初始化考评树
        setting = {
            view: {
                selectedMulti: false//是否支持同时选中多个节点
            },
            data: {
                key: {
                    //将treeNode的checkItemName属性当做节点名称
                    name: "name"
                },
                simpleData: {
                    enable: true,   //是否异步
                    idKey: "id",    //当前节点id属性
                    pIdKey: "pId",  //当前节点的父节点id属性
                    rootPId: 0      //用于修正根节点父节点数据，即pIdKey指定的属性值
                }
            },
            callback: {
                onClick: function (e, id, node) {   //点击事件
                    checkNode.id = node.id;
                    checkNode.parentId = node.pId;
                    checkNode.name = node.name;
                    checkNode.level = node.level;
                    checkNode.isParent = node.isParent;
                    if (node.isParent) {
                        $("#parentCheckItemName").val(node.name);
                        $("#checkItemList").datagrid('reload');
                    } else {
                        var data = [];
                        $.each(checkItemListData, function (i, item) {
                            if (node.id === item.checkItemId) {
                                data.push(item);
                            }
                            if (node.pId === item.checkItemId) {
                                $("#parentCheckItemName").val(item.checkItemName);
                            }
                        });
                        $("#checkItemList").datagrid('loadData', data);
                    }

                    // if (node.isParent) {//父节点
                    //     $("#page").off("click", "#addTemplate");//解决点击多次ztree之后再点击按钮后，被多次调用
                    //     $("#page").on("click", "#addTemplate", function () {//点击父节点,然后跳出弹出框，右侧新增
                    //         addWindowEvent(node, true);
                    //     });
                    //
                    // } else {//点击子节点，右侧直接新增
                    //     $("#page").off("click", "#addTemplate");
                    //     $("#page").on("click", "#addTemplate", function () {//点击子节点,然后右侧新增
                    //         addWindowEvent(node, false);
                    //     });
                    // }
                }
            }
        };
        refreshTree();

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemId', title: '考评项ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkItemName', title: '考评项名称', width: '20%'},
                {
                    field: 'checkItemType', title: '考评项类型', width: '20%',
                    formatter: function (value, row, index) {
                        var itemType = "";
                        if (checkTypeData.length !== 0) {
                            for (var i = 0; i < checkTypeData.length; i++) {
                                if (checkTypeData[i].paramsCode === value) {
                                    itemType = checkTypeData[i].paramsName;
                                    break;
                                }
                            }
                        }
                        return itemType;
                    }
                },
                {
                    field: 'checkItemVitalType', title: '致命类别', width: '13%',
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
                {field: 'remark', title: '考评项描述', width: '30%'},
                {
                    field: 'action', title: '操作', width: '13%',
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
                var parentCheckItemId = checkNode.id;
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var checkItemName = $("#checkItemName").val();
                var tenantId = $("#tenantType").combobox("getValue");
                if (tenantId === "") {
                    tenantId = Util.constants.TENANT_ID;
                }
                if (parentCheckItemId === undefined || parentCheckItemId == null) {
                    parentCheckItemId = "";
                }
                var checkItemType = $("#checkItemType").combobox("getValue");
                if (checkItemType === "-1") {
                    checkItemType = "";
                }
                var reqParams = {
                    "parentCheckItemId": parentCheckItemId,
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
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    } else {
                        var data = Transfer.DataGrid.transfer(result);
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
            if (node.isParent) {
                $("#checkItemList").datagrid('reload');
            } else {
                var data = [];
                $.each(checkItemListData, function (i, item) {
                    if (node.id === item.checkItemId) {
                        data.push(item);
                    }
                });
                $("#checkItemList").datagrid('loadData', data);
            }
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
        if (!checkNode.isParent) {
            $.messager.alert("提示", "请选择目录!");
            return false;
        }
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

            var tenantId = $("#tenantType").combobox("getValue"),
                checkItemName = $("#checkItemNameConfig").val(),
                checkItemType = $("#checkItemTypeConfig").combobox("getValue"),
                checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue"),
                checkItemDesc = $("#checkItemDescConfig").val();

            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return false;
            }
            var params = {
                "tenantId": tenantId,
                "parentCheckItemId": checkNode.id,
                "checkItemName": checkItemName,
                "checkItemType": checkItemType,
                "checkItemVitalType": checkItemVitalType,
                "remark": checkItemDesc,
                "catalogFlag": 1,
                "orderNo": checkNode.level + 1
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
                    refreshTree(); //刷新考评树
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
                if (checkItemData.length !== 0) {
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
                if (vitalTypeData.length !== 0) {
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
                    refreshTree(); //刷新考评树
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
                        refreshTree(); //刷新考评树
                    }
                });
            }
        });
    }

    //刷新考评树
    function refreshTree() {
        var zNodes = [];
        var tenantId = $("#tenantType").combobox("getValue");
        if (tenantId === "") {
            tenantId = Util.constants.TENANT_ID;
        }
        var reqParams = {
            "tenantId": tenantId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItem", params, function (result) {
            var data = result.RSP.DATA;
            checkItemListData = data;
            for (var i = 0; i < data.length; i++) {
                var nodeMap =
                    {id: data[i].checkItemId, pId: data[i].parentCheckItemId, name: data[i].checkItemName};
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#checkItemTree"), setting, zNodes);
            if (data.length > 0) {
                //父节点名称
                checkNode.id = data[0].checkItemId;
                checkNode.parentId = data[0].parentCheckItemId;
                checkNode.name = data[0].checkItemName;
                checkNode.level = 0;
                checkNode.isParent = true;
                $("#parentCheckItemName").val(checkNode.name)
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