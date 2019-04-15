require(["jquery", 'util', "transfer", "commonAjax", "easyui", "ztree-exedit"], function ($, Util, Transfer, CommonAjax) {
    var userInfo,
        setting,               //ztree配置
        checkTypeData = [],    //考评项下拉框静态数据
        checkItemListData = [],//所有考评项
        openCheckItem = [],    //记录展开的目录路径（保存节点id）
        checkItemData = [],    //新增考评项下拉框静态数据
        checkLinkData = [],    //工单考评环节静态数据
        vitalTypeData = [],    //新增致命类别下拉框静态数据
        checkNode = {          //左侧考评树选中节点
            id: "",
            parentId: "",
            name: "",
            level: 0,
            isParent: true
        };

    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {
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
            }
        });
        //重载下拉框数据
        getSelectData("CHECK_ITEM_TYPE", true, function (data) {
            var param = {
                "paramsCode": "2",
                "paramsName": "目录"
            };
            data.push(param);
            checkTypeData = data;
            $("#checkItemType").combobox('loadData', data);
        });

        //考评项环节下拉框
        $("#nodeTypeCode").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 288,
            editable: false,
            onLoadSuccess: function () {
                var nodeTypeCode = $('#nodeTypeCode'),
                    data = nodeTypeCode.combobox('getData');
                if (data.length > 0) {
                    nodeTypeCode.combobox('select', data[0].paramsCode);
                }
            }
        });
        //重载下拉框数据
        getSelectData("WRKFM_OPERATE_TYPE", true, function (data) {
            $("#nodeTypeCode").combobox('loadData', data);
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
                    if (node.level > 0) {
                        $("#backBtn").show();   //子目录显示返回键
                    } else {
                        $("#backBtn").hide();   //根目录隐藏返回键
                    }
                    if (node.isParent) {
                        $("#parentCheckItemName").val(node.name);
                        $("#parentCheckItemId").val(node.id);
                        $("#checkItemList").datagrid('load');
                        $("#checkItemListPath").html(getCatalogPath(node.id)); //刷新列表路径
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
                        $("#checkItemListPath").html(getCatalogPath(node.pId)); //刷新列表路径
                    }
                },
                onCollapse: function (e, id, node) {  //目录折叠，保存目录展开路径
                    for (var i = 0; i < openCheckItem.length; i++) {
                        if (openCheckItem[i] === node.id) {
                            openCheckItem.splice(i, 1);
                            break;
                        }
                    }
                },
                onExpand: function (e, id, node) {    //目录展开，保存目录展开路径
                    openCheckItem.push(node.id);
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
                {
                    field: 'action', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" style="color: dimgrey;" id = "checkItem' + row.checkItemId + '">修改</a>';
                    }
                },
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
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 480,
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
                    orderNo = checkNode.level + 1,
                    start = (param.page - 1) * param.rows,
                    pageNum = param.rows,
                    checkItemName = $("#checkItemName").val();
                if (parentCheckItemId === "") {
                    parentCheckItemId = "1";
                }
                var checkItemType = $("#checkItemType").combobox("getValue"),
                    nodeTypeCode = $("#nodeTypeCode").combobox("getValue");
                if (checkItemType === "-1") {
                    checkItemType = "";
                }
                if (nodeTypeCode === "-1") {
                    nodeTypeCode = "";
                }
                if (checkItemName !== "") {  //按考评项名称搜索（子目录全局搜索）
                    orderNo = "";
                }
                var reqParams = {
                    "parentCheckItemId": parentCheckItemId,
                    "orderNo": orderNo,
                    "checkItemName": checkItemName,
                    "tenantId": Util.constants.TENANT_ID,
                    "checkItemType": checkItemType,
                    "nodeTypeCode": nodeTypeCode
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
                        getSelectData("WRKFM_OPERATE_TYPE", false, function (datas) {
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
                        if (item.catalogFlag === Util.constants.CHECK_ITEM_CHILDREN) {
                            showCheckItemUpdateDialog(item);
                        } else {
                            showCatalogUpdateDialog(item);
                        }
                    });
                });
            },
            onDblClickRow: function (index, rowData) {
                if (rowData.catalogFlag !== Util.constants.CHECK_ITEM_PARENT) {  //双击进入子目录
                    return;
                }
                checkNode.id = rowData.checkItemId;
                checkNode.parentId = rowData.parentCheckItemId;
                checkNode.name = rowData.checkItemName;
                checkNode.level = rowData.orderNo;
                checkNode.isParent = true;

                $("#backBtn").show();   //子目录显示返回键
                $("#parentCheckItemName").val(rowData.checkItemName);
                $("#parentCheckItemId").val(rowData.checkItemId);
                $("#checkItemList").datagrid('load');
                $("#checkItemListPath").html(getCatalogPath(rowData.checkItemId)); //刷新列表路径
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            if (checkNode.isParent) {
                $("#checkItemList").datagrid('load');
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

        //重置
        $("#resetBtn").on("click", function () {
            $("#checkItemName").val("");
            $("#checkItemType").combobox("setValue", "-1");
            $("#nodeTypeCode").combobox("setValue", "-1");
        });

        //返回
        $("#backBtn").on("click", function () {
            if (checkNode.level === 0) {
                return;  //根目录返回
            }
            var catalog = getParentCatalog(checkNode.parentId);  //获取父目录
            checkNode.id = catalog.checkItemId;
            checkNode.parentId = catalog.parentCheckItemId;
            checkNode.name = catalog.checkItemName;
            checkNode.level = catalog.orderNo;
            checkNode.isParent = true;

            if (catalog.orderNo === 0) {
                $("#backBtn").hide();   //根目录隐藏返回键
            }
            $("#parentCheckItemName").val(catalog.checkItemName);
            $("#parentCheckItemId").val(catalog.checkItemId);
            $("#checkItemList").datagrid('load');
            $("#checkItemListPath").html(getCatalogPath(catalog.checkItemId)); //刷新列表路径
        });

        //新增类别
        $("#addCatalogBtn").on("click", function () {
            showCatalogCreateDialog();
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
     * 新增目录弹框
     */
    function showCatalogCreateDialog() {
        $("#catalogConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#catalogDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "目录新增"
        });
        var parentCatalogName = $("#parentCheckItemName").val();
        $("#catalogParentNameConfig").val(parentCatalogName);
        $('#catalogNameConfig').validatebox({
            required: true
        });

        //取消
        var cancelBtn = $("#catalogCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#catalogConfig").form('clear');  //清空表单
            $("#catalogDialog").window("close");
        });
        //提交
        var submitBtn = $("#catalogSubmitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var parentCheckItemId = $("#parentCheckItemId").val(),
                checkItemName = $("#catalogNameConfig").val(),
                checkItemDesc = $("#catalogDescConfig").val(),
                orderNo = checkNode.level;
            if (checkNode.isParent) {
                orderNo = checkNode.level + 1;
            }

            if (orderNo > 6) {
                $.messager.alert("提示", "目录层数超过最大值!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "目录名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            var params = {
                "tenantId": Util.constants.TENANT_ID,
                "parentCheckItemId": parentCheckItemId,
                "checkItemName": checkItemName,
                "checkItemType": Util.constants.CHECK_TYPE_CATALOG,
                "remark": checkItemDesc,
                "catalogFlag": Util.constants.CHECK_ITEM_PARENT,
                "orderNo": orderNo,
                "createStaffId": userInfo.staffId
            };
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(params), function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $("#catalogDialog").window("close");  //关闭对话框
                    $("#checkItemList").datagrid('reload'); //插入成功后，刷新页面
                    refreshTree(); //刷新考评树
                    //提示
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    var errMsg = "新增失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
                }
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
            });
        });
    }

    /**
     * 修改目录弹框
     */
    function showCatalogUpdateDialog(item) {
        $("#catalogConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#catalogDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "目录新增"
        });
        var parentCatalogName = $("#parentCheckItemName").val(),
            catalogNameInput = $('#catalogNameConfig');
        $("#catalogParentNameConfig").val(parentCatalogName);
        catalogNameInput.validatebox({
            required: true
        });
        catalogNameInput.val(item.checkItemName);
        $("#catalogDescConfig").val(item.remark);
        //取消
        var cancelBtn = $("#catalogCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#catalogConfig").form('clear');  //清空表单
            $("#catalogDialog").window("close");
        });
        //提交
        var submitBtn = $("#catalogSubmitBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            if (disableSubmit) {
                return;
            }
            disableSubmit = true;   //防止多次提交
            submitBtn.linkbutton({disabled: true});  //禁用提交按钮（样式）

            var checkItemName = $("#catalogNameConfig").val(),
                checkItemDesc = $("#catalogDescConfig").val();

            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "目录名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }

            if (checkItemName === item.checkItemName && checkItemDesc === item.remark) {
                $.messager.alert("提示", "没有作任何修改!", null, function () {
                    $("#catalogConfig").form('clear');    //清空表单
                    $("#catalogDialog").window("close");
                });
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }

            item.checkItemName = checkItemName;
            item.remark = checkItemDesc;
            item.operateStaffId = userInfo.staffId;
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(item), function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $("#catalogDialog").window("close");  //关闭对话框
                    $("#catalogList").datagrid('reload'); //插入成功后，刷新页面
                    refreshTree(); //刷新考评树
                    //提示
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    var errMsg = "修改失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
                }
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
            });
        });
    }

    /**
     * 新增考评项弹框
     */
    function showCheckItemCreateDialog() {
        $("#checkItemConfig").form('clear');  //清空表单
        var disableSubmit = false;  //禁用提交按钮标志
        $("#checkItemDialog").show().window({
            width: 700,
            height: 450,
            modal: true,
            title: "考评项新增"
        });
        $('#checkItemNameConfig').validatebox({
            required: true
        });
        //父目录名称
        $("#parentCatalogNameConfig").val($("#parentCheckItemName").val());
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

            var parentCheckItemId = $("#parentCheckItemId").val(),
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
            if (checkItemName == null || checkItemName === "") {
                $.messager.alert("提示", "考评项名称不能为空!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            if (checkItemType === Util.constants.CHECK_TYPE_ORDER && nodeTypeCode === "") {
                $.messager.alert("提示", "请选择考评环节!");
                disableSubmit = false;
                submitBtn.linkbutton({disabled: false});  //取消提交禁用
                return;
            }
            var params = {
                "tenantId": Util.constants.TENANT_ID,
                "parentCheckItemId": parentCheckItemId,
                "checkItemName": checkItemName,
                "checkItemType": checkItemType,
                "nodeTypeCode": nodeTypeCode,   //工单考评环节
                "checkItemVitalType": checkItemVitalType,
                "remark": checkItemDesc,
                "catalogFlag": Util.constants.CHECK_ITEM_CHILDREN,
                "orderNo": orderNo,
                "createStaffId": userInfo.staffId
            };
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(params), function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $("#checkItemDialog").window("close");  //关闭对话框
                    $("#checkItemList").datagrid('reload'); //插入成功后，刷新页面
                    refreshTree(); //刷新考评树
                    //提示
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    var errMsg = "新增失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
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
            width: 700,
            height: 450,
            modal: true,
            title: "考评项修改"
        });
        var checkItemNameInput = $('#checkItemNameConfig');
        checkItemNameInput.validatebox({
            required: true
        });
        //父目录名称
        $("#parentCatalogNameConfig").val($("#parentCheckItemName").val());
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
            if (checkItemType === Util.constants.CHECK_TYPE_ORDER && nodeTypeCode === "") {
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
            item.operateStaffId = userInfo.staffId;
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_ITEM_DNS).concat("/"), JSON.stringify(item), function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $("#checkItemDialog").window("close");  //关闭对话框
                    $("#checkItemList").datagrid('reload'); //插入成功后，刷新页面
                    refreshTree(); //刷新考评树
                    //提示
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                } else {
                    var errMsg = "修改失败！<br>" + result.RSP.RSP_DESC;
                    $.messager.alert("提示", errMsg);
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
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#checkItemList").datagrid('reload'); //删除成功后，刷新页面
                        refreshTree(); //刷新考评树
                        //提示
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    } else {
                        var errMsg = "删除失败！<br>" + result.RSP.RSP_DESC;
                        $.messager.alert("提示", errMsg);
                    }
                });
            }
        });
    }

    //刷新考评树
    function refreshTree() {
        var zNodes = [];
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID
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
                if (openCheckItem.length === 0) {  //初次加载默认展开一级目录
                    if (data[i].orderNo <= 1) {
                        nodeMap.open = true;
                        openCheckItem.push(nodeMap.id);
                    }
                } else {
                    //展开刷新前的目录路径
                    for (var j = 0; j < openCheckItem.length; j++) {
                        if (nodeMap.id === openCheckItem[j]) {
                            nodeMap.open = true;
                            break;
                        }
                    }
                }
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#checkItemTree"), setting, zNodes);
            fixIcon();  //将空文件夹显示为文件夹图标
            if (checkNode.id === "") { //初始化checkNode
                checkNode.id = data[0].checkItemId;
                checkNode.parentId = data[0].checkItemId;
                checkNode.name = data[0].checkItemName;

                $("#parentCheckItemName").val(data[0].checkItemName);
                $("#parentCheckItemId").val(data[0].checkItemId);
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

    //显示考评环节
    function showCheckLink(item) {
        $("#checkLinkSelect").show();
        //工单环节下拉框
        $("#checkLinkConfig").combobox({
            data: checkLinkData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 120,
            editable: false,
            onLoadSuccess: function () {
                if (item != null && item.nodeTypeCode != null) {
                    $("#checkLinkConfig").combobox('setValue', item.nodeTypeCode);
                }
            }
        });
        //重载下拉框数据
        if (checkLinkData.length === 0) {
            getSelectData("WRKFM_OPERATE_TYPE", false, function (data) {
                checkLinkData = data;
                $("#checkLinkConfig").combobox('loadData', data);
            });
        }
    }

    //获取目录路径
    function getCatalogPath(catalogId) {
        var path = "",
            parentId = catalogId,
            level = -1;
        while (level !== 0) {
            var catalog = getParentCatalog(parentId);
            path = catalog.checkItemName + "/" + path;
            parentId = catalog.parentCheckItemId;
            level = catalog.orderNo;
        }
        path = path.substring(0, path.lastIndexOf("/"));
        return path;
    }

    function getParentCatalog(catalogId) {
        for (var i = 0; i < checkItemListData.length; i++) {
            if (checkItemListData[i].checkItemId === catalogId) {
                return checkItemListData[i];
            }
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