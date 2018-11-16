require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var qmURI = "/qm/configservice/checkItem";
    //初始化方法
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
                {field: 'checkItemId', title: '考评项ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkItemName', title: '考评项名称', align: 'center', width: '20%'},
                {field: 'checkItemType', title: '考评项类型', align: 'center', width: '20%'},
                {field: 'checkItemVitalType', title: '致命类别', align: 'center', width: '13%'},
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
            rownumbers: true,
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: true,
            selectOnCheck: true,
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
            },
            onLoadSuccess:function(data){
                //绑定考评项修改事件
                $.each(data.rows, function(i, item){
                    $("#checkItem"+item.checkItemId).on("click",function () {
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

            var tenantId = $("#tenantType").combobox("getValue");
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
                "tenantId":tenantId,
                "parentCheckItemId":Util.constants.PARENT_CHECK_ITEM_ID,
                'checkItemName':checkItemName,
                'checkItemType':checkItemType,
                'checkItemVitalType':checkItemVitalType,
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
    function showCheckItemUpdateDialog(item) {
        switch(item.checkItemType)
        {
            case "语音考核项":
                item.checkItemType = "0";
                break;
            case "工单考核项":
                item.checkItemType = "1";
                break;
            case "电商平台考核项":
                item.checkItemType = "2";
                break;
            case "互联网考核项":
                item.checkItemType = "3";
                break;
        }
        switch(item.checkItemVitalType)
        {
            case "非致命性":
                item.checkItemVitalType = "0";
                break;
            case "致命性":
                item.checkItemVitalType = "1";
                break;
        }
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
            url: '../../data/check_item_config_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                //自动填入待修改考评项类型
                $('#checkItemTypeConfig').combobox('setValue',item.checkItemType);
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
                //自动填入待修改考评项致命类别
                $('#checkItemVitalTypeConfig').combobox('setValue',item.checkItemVitalType);
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
            if(checkItemType != null && checkItemType !== ""){
                item.checkItemType = checkItemType;
            }
            if(checkItemVitalType != null && checkItemVitalType !== ""){
                item.checkItemVitalType = checkItemVitalType;
            }

            Util.ajax.putJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(item), function (result) {
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

    return {
        initialize: initialize
    };
});
