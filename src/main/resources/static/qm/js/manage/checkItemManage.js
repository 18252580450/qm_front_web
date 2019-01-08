require(["jquery", 'util', "transfer", "commonAjax", "easyui", "ztree-exedit"], function ($, Util, Transfer, CommonAjax) {

    var setting,               //ztree配置
        checkTypeData = [],    //考评项下拉框静态数据
        checkItemListData = [],//所有考评项
        checkItemData = [],    //新增考评项下拉框静态数据
        checkLinkData = [],    //工单考评环节静态数据
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
                var tenantType = $("#tenantType"),
                    data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#checkItemList").datagrid('reload');
                refreshTree();  //刷新左侧考评树
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
                var checkItemType = $('#checkItemType'),
                    data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].paramsCode);
                }
            },
            onSelect: function () {
                $("#checkItemList").datagrid('reload');
            }
        });
        //重载下拉框数据
        getSelectData("CHECK_ITEM_TYPE", true, function (data) {
            checkTypeData = data;
            $("#checkItemType").combobox('loadData', data);
        });

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
                        $("#parentCheckItemId").val(node.id);
                        $("#checkItemList").datagrid('reload');
                    } else {
                        var data = [];
                        $.each(checkItemListData, function (i, item) {
                            if (node.id === item.checkItemId) {
                                data.push(item);
                            }
                            if (node.pId === item.checkItemId) {
                                $("#parentCheckItemName").val(item.checkItemName);
                                $("#parentCheckItemId").val(item.checkItemId);
                            }
                        });
                        $("#checkItemList").datagrid('loadData', data);
                    }
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
                    field: 'checkItemType', title: '考评项类型', width: '15%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < checkTypeData.length; i++) {
                            if (checkTypeData[i].paramsCode === value) {
                                return checkTypeData[i].paramsName;
                            }
                        }
                    }
                },
                {
                    field: 'checkItemVitalType', title: '致命类别', width: '15%',
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
                {field: 'remark', title: '考评项描述', width: '25%'},
                {
                    field: 'nodeTypeCode', title: '考评环节', width: '15%',
                    formatter: function (value, row, index) {
                        for (var i = 0; i < checkLinkData.length; i++) {
                            if (checkLinkData[i].paramsCode === value) {
                                return checkLinkData[i].paramsName;
                            }
                        }
                    }
                },
                {
                    field: 'action', title: '操作', width: '10%',
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
                var parentCheckItemId = checkNode.id,
                    start = (param.page - 1) * param.rows,
                    pageNum = param.rows,
                    checkItemName = $("#checkItemName").val(),
                    tenantId = $("#tenantType").combobox("getValue");
                if (tenantId === "") {
                    tenantId = Util.constants.TENANT_ID;
                }
                if (parentCheckItemId === "") {
                    parentCheckItemId = "1";
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
                    var data = Transfer.DataGrid.transfer(result),
                        rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    }
                    if (checkLinkData.length > 0) {
                        success(data);
                    } else {
                        getSelectData("WRKFM_NODE_TYPE", false, function (datas) {
                            checkLinkData = datas;
                            success(data);
                        });
                    }
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
            if (checkNode.isParent) {
                $("#checkItemList").datagrid('reload');
            } else {
                var data = [];
                $.each(checkItemListData, function (i, item) {
                    if (checkNode.id === item.checkItemId) {
                        data.push(item);
                    }
                });
                $("#checkItemList").datagrid('loadData', data);
            }
        });

        //新增类别
        $("#addCatalogBtn").on("click", function () {
            showCheckItemCreateDialog(Util.constants.CHECK_ITEM_PARENT);
        });

        //新增
        $("#addBtn").on("click", function () {
            showCheckItemCreateDialog(Util.constants.CHECK_ITEM_CHILDREN);
        });

        //删除
        $("#delBtn").on("click", function () {
            showCheckItemDeleteDialog();
        });
    }

    /**
     * 新增考评项弹框
     */
    function showCheckItemCreateDialog(catalogFlag) {
        $("#checkItemConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#checkItemDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "考评项新增"
        });
        $('#checkItemNameConfig').validatebox({
            required: true
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
                var checkItemType = $('#checkItemTypeConfig'),
                    data = checkItemType.combobox('getData');
                if (data.length > 0) {
                    checkItemType.combobox('select', data[0].paramsCode);
                }
            },
            onSelect: function () {
                var checkType = $("#checkItemTypeConfig").combobox("getValue");
                if (checkType === Util.constants.CHECK_TYPE_ORDER) {
                    showCheckLink();
                } else {
                    $("#checkLinkSelect").hide();
                }
            }
        });
        //重载下拉框数据
        if (checkItemData.length === 0) {
            getSelectData("CHECK_ITEM_TYPE", false, function (data) {
                checkItemData = data;
                $("#checkItemTypeConfig").combobox('loadData', data);
            });
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
                var checkItemVitalType = $('#checkItemVitalTypeConfig'),
                    data = checkItemVitalType.combobox('getData');
                if (data.length > 0) {
                    checkItemVitalType.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        if (vitalTypeData.length === 0) {
            getSelectData("CHECK_VITAL_TYPE", false, function (data) {
                vitalTypeData = data;
                $("#checkItemVitalTypeConfig").combobox('loadData', data);
            });
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
                return;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var tenantId = $("#tenantType").combobox("getValue"),
                parentCheckItemId = $("#parentCheckItemId").val(),
                checkItemName = $("#checkItemNameConfig").val(),
                checkItemType = $("#checkItemTypeConfig").combobox("getValue"),
                checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue"),
                checkItemDesc = $("#checkItemDescConfig").val(),
                nodeTypeCode = "",
                orderNo = checkNode.level;
            if (checkNode.isParent) {
                orderNo = checkNode.level + 1;
            }
            if (checkItemType === Util.constants.CHECK_TYPE_ORDER) {
                nodeTypeCode = $("#checkLinkConfig").combobox("getValue");
            }
            if (catalogFlag === Util.constants.CHECK_ITEM_PARENT && orderNo > 6) {
                $.messager.alert("提示", "目录层数超过最大值!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            var params = {
                "tenantId": tenantId,
                "parentCheckItemId": parentCheckItemId,
                "checkItemName": checkItemName,
                "checkItemType": checkItemType,
                "nodeTypeCode": nodeTypeCode,   //工单考评环节
                "checkItemVitalType": checkItemVitalType,
                "remark": checkItemDesc,
                "catalogFlag": catalogFlag,
                "orderNo": orderNo
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
            height: 400,
            modal: true,
            title: "考评项修改"
        });
        var checkItemNameInput = $('#checkItemNameConfig');
        checkItemNameInput.validatebox({
            required: true
        });
        if (item.checkItemType === Util.constants.CHECK_TYPE_ORDER) {
            showCheckLink(item);
        } else {
            $("#checkLinkSelect").hide();
        }
        //自动填入待修改考评项名称
        checkItemNameInput.val(item.checkItemName);
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
            },
            onSelect: function () {
                var checkType = $("#checkItemTypeConfig").combobox("getValue");
                if (checkType === Util.constants.CHECK_TYPE_ORDER) {
                    showCheckLink(item);
                } else {
                    $("#checkLinkSelect").hide();
                }
            }
        });
        //重载下拉框数据
        if (checkItemData.length === 0) {
            getSelectData("CHECK_ITEM_TYPE", false, function (data) {
                checkItemData = data;
                $("#checkItemTypeConfig").combobox('loadData', data);
            });
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
            getSelectData("CHECK_VITAL_TYPE", false, function (data) {
                vitalTypeData = data;
                $("#checkItemVitalTypeConfig").combobox('loadData', data);
            });
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
                return;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var checkItemName = $("#checkItemNameConfig").val(),
                checkItemType = $("#checkItemTypeConfig").combobox("getValue"),
                nodeTypeCode = "",
                checkItemVitalType = $("#checkItemVitalTypeConfig").combobox("getValue"),
                checkItemDesc = $("#checkItemDescConfig").val();

            if (checkItemType === Util.constants.CHECK_TYPE_ORDER) {
                nodeTypeCode = $("#checkLinkConfig").combobox("getValue");
            }
            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            if (nodeTypeCode == null || nodeTypeCode === "") {
                $.messager.alert("提示", "请选择考评环节!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            if (checkItemName === item.checkItemName && checkItemType === item.checkItemType && nodeTypeCode === item.nodeTypeCode && checkItemVitalType === item.checkItemVitalType && checkItemDesc === item.remark) {
                $.messager.alert("提示", "没有作任何修改!", null, function () {
                    $("#checkItemConfig").form('clear');    //清空表单
                    $("#checkItemDialog").window("close");
                });
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }

            item.checkItemName = checkItemName;
            item.remark = checkItemDesc;
            if (checkItemType != null && checkItemType !== "") {
                item.checkItemType = checkItemType;
            }
            if (nodeTypeCode != null && nodeTypeCode !== "") {
                item.nodeTypeCode = nodeTypeCode;
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
            return;
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
        var zNodes = [],
            tenantId = $("#tenantType").combobox("getValue");
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
                    {
                        id: data[i].checkItemId,
                        pId: data[i].parentCheckItemId,
                        name: data[i].checkItemName,
                        catalogFlag: data[i].catalogFlag
                    };
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#checkItemTree"), setting, zNodes);
            fixIcon();  //将空文件夹显示为文件夹图标

            if (data.length > 0) {
                //父节点名称
                checkNode.id = data[0].checkItemId;
                checkNode.parentId = data[0].parentCheckItemId;
                checkNode.name = data[0].checkItemName;
                checkNode.level = 0;
                checkNode.isParent = true;
                $("#parentCheckItemName").val(checkNode.name);
                $("#parentCheckItemId").val(checkNode.id);
            }
        });
    }

    function fixIcon() {
        var treeObj = $.fn.zTree.getZTreeObj("checkItemTree");
        //通过catalogFlag字段筛选出目录节点
        var folderNode = treeObj.getNodesByFilter(function (node) {
            return node.catalogFlag === Util.constants.CHECK_ITEM_PARENT;
        });
        for (var i = 0; i < folderNode.length; i++) {  //遍历目录节点，设置isParent属性为true;
            folderNode[i].isParent = true;
        }
        treeObj.refresh();
    }

    //显示考评环
    function showCheckLink(item) {
        $("#checkLinkSelect").show();
        //工单环节下拉框
        $("#checkLinkConfig").combobox({
            data: checkLinkData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                if (item != null && item.nodeTypeCode != null) {
                    $("#checkLinkConfig").combobox('setValue', item.nodeTypeCode);
                }
            }
        });
        //重载下拉框数据
        if (checkLinkData.length === 0) {
            getSelectData("WRKFM_NODE_TYPE", false, function (data) {
                checkLinkData = data;
                $("#checkLinkConfig").combobox('loadData', data);
            });
        }
    }

    //获取下拉框数据
    function getSelectData(paramsType, showAll, callback) {
        CommonAjax.getStaticParams(paramsType, function (datas) {
            if (datas) {
                if (showAll) {
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    datas.unshift(data);
                }
                callback(datas);
            }
        });
    }

    return {
        initialize: initialize
    };
});