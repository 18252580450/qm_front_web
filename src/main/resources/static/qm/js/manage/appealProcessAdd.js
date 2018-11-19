require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var qmURI = "/qm/configservice/appealProcess";
    var appealProcessDatas = [];    //新增流程（新增提交入参）
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
                $("#appealProcessList").datagrid("load");
            }
        });

        //质检类型下拉框
        $("#checkType").combobox({
            url: '../../data/check_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var tenantType = $("#checkType");
                var data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
            }
        });

        //流程顺序下拉框
        $("#orderNo").combobox({
            url: '../../data/process_order.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var orderNo = $("#orderNo");
                var data = orderNo.combobox('getData');
                if (data.length > 0) {
                    orderNo.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                //重置流程名称
                $("#processName").val("");
                //新增子流程时，禁用渠道和质检类型下拉框，保证子流程渠道和质检类型和主流程保持一致
                var orderNo = $("#orderNo").combobox("getValue");
                if(orderNo === "0"){
                    $("#tenantType").combobox('enable');
                    $("#checkType").combobox('enable');
                }else{
                    $("#tenantType").combobox('disable');
                    $("#checkType").combobox('disable');
                }
                //切换子流程时同时刷新子节点列表
                if(orderNo === "0" || parseInt(orderNo) >= appealProcessDatas.length){
                    $("#subNodeList").datagrid("loadData",{ rows:[]});
                }else{
                    var subNodeList = appealProcessDatas[parseInt(orderNo)].subNodeList;
                    refreshSubNodeList(subNodeList);
                }
            }
        });

        //申诉流程添加列表
        $("#processList").datagrid({
            fitColumns: true,
            width: '100%',
            height: 250,
            pagination: false,
            rownumbers: false,
            columns: [[
                {
                    field: 'mainProcessFlag', title: '主流程标识', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if(row.mainProcessFlag === "0"){
                            return "主流程";
                        }else {
                            return "";
                        }
                    }
                },
                {field: 'orderNo', title: '流程序号', align: 'center', width: '10%'},
                {field: 'processName', title: '流程名称', align: 'center', width: '20%'},
                {field: 'tenantName', title: '模板渠道', align: 'center', width: '15%'},
                {field: 'tenantId', title: '模板渠道Id', align: 'center', hidden:true},
                {field: 'departmentName', title: '部门', align: 'center', width: '20%'},
                {field: 'departmentId', title: '部门Id', align: 'center', hidden:true},
                {
                    field: 'checkType', title: '质检类型', align: 'center', width: '15%',
                    formatter: function (value, row, index) {
                        if(row.checkType === "0"){
                            return "语言质检";
                        }
                        if(row.checkType === "1"){
                            return "工单质检";
                        }
                        if(row.checkType === "2"){
                            return "电商平台质检";
                        }
                        if(row.checkType === "3"){
                            return "互联网质检";
                        }
                    }
                },
                {
                    field: 'operation', title: '操作', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        //只允许删除主流程和最后一个子流程
                        if(parseInt(row.orderNo) === 0 || parseInt(row.orderNo) === appealProcessDatas.length - 1){
                            return '<a href="javascript:void(0);" id = "appealProcess' + row.orderNo + '">删除</a>';
                        }
                    }
                }
            ]],
            onLoadSuccess:function(data){
                //绑定流程删除事件
                $.each(data.rows, function(i, item){
                    //删除主流程，子流程将被全部删除
                    if(parseInt(item.orderNo) === 0){
                        $("#appealProcess"+item.orderNo).on("click",function () {
                            if(appealProcessDatas.length === 1){
                                appealProcessDatas = [];
                                $("#processList").datagrid("loadData",{ rows:appealProcessDatas});
                            }else{
                                $.messager.confirm('确认删除弹窗', '子流程将被全部删除! 确定删除主流程？', function (confirm) {
                                    if(confirm){
                                        appealProcessDatas = [];
                                        $("#processList").datagrid("loadData",{ rows:appealProcessDatas});
                                        $("#subNodeList").datagrid("loadData",{rows:[]});
                                    }
                                });
                            }
                        });
                    }
                    //末子流程才允许被删除
                    if(parseInt(item.orderNo) === appealProcessDatas.length - 1){
                        $("#appealProcess"+item.orderNo).on("click",function () {
                            appealProcessDatas.splice(appealProcessDatas.length - 1,1);
                            //刷新流程列表
                            $("#processList").datagrid("loadData",{ rows:appealProcessDatas});
                            //刷新子节点列表（当前展示的子节点的父流程被删除时）
                            var orderNoSelect = $("#orderNo");
                            if(item.orderNo === orderNoSelect.combobox("getValue")){
                                if(item.orderNo !== "0"){
                                    orderNoSelect.combobox("setValue",String(parseInt(item.orderNo)-1));
                                }
                                var subNodeList = appealProcessDatas[parseInt(item.orderNo)-1].subNodeList;
                                refreshSubNodeList(subNodeList);
                            }
                        });
                    }
                });
            },
            onClickRow:function (index,data) {
                //点击子流程行刷新子节点列表
                var subNodeList = data.subNodeList;
                refreshSubNodeList(subNodeList);
                //刷新选择流程下拉框
                $("#orderNo").combobox("setValue",index);
            }
        });

        //申诉节点添加列表
        $("#subNodeList").datagrid({
            fitColumns: true,
            width: '100%',
            height: 250,
            pagination: false,
            rownumbers: false,
            columns: [[
                {field: 'processId', title: '子流程', align: 'center', width: '10%'},
                {field: 'orderNo', title: '节点序号', align: 'center', width: '10%'},
                {field: 'nodeName', title: '节点名称', align: 'center', width: '20%'},
                {field: 'userName', title: '角色', align: 'center',width:'50'},
                {
                    field: 'detail', title: '操作', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        //只允许删除末子节点
                        var subNodeList = appealProcessDatas[row.processId].subNodeList;
                        if(parseInt(row.orderNo) === subNodeList[subNodeList.length - 1].orderNo){
                            return '<a href="javascript:void(0);" id = "appealNode' + row.orderNo + '">删除</a>';
                        }
                    }
                }
            ]],
            onLoadSuccess:function(data){
                //绑定子节点删除事件
                $.each(data.rows, function(i, item){
                    //末子节点才允许被删除
                    var subNodeList = appealProcessDatas[item.processId].subNodeList;
                    if(parseInt(item.orderNo) === subNodeList[subNodeList.length - 1].orderNo){
                        $("#appealNode"+item.orderNo).on("click",function () {
                            //删除末子节点（多条数据）
                            for(var i = 0; i < subNodeList.length; i++){
                                if(subNodeList[i].orderNo === item.orderNo){
                                    //删除所有序号为item.orderNo的节点
                                    subNodeList.splice(i,subNodeList.length-i+1);
                                    break;
                                }
                            }
                            //更新子流程的子节点列表
                            appealProcessDatas[item.processId].subNodeList = subNodeList;
                            //更新子流程的子节点数
                            appealProcessDatas[item.processId].subNodeNum --;
                            //刷新（页面）子节点列表
                            refreshSubNodeList(subNodeList);
                        });
                    }
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //新增流程
        $("#addAppealProcess").on("click", function () {
            addProcess();
        });

        //新增子节点
        $("#addSubNode").on("click", function () {
            var processOrder = $("#orderNo").combobox("getValue");
            //主流程则返回
            if(processOrder === "0"){
                $.messager.alert("提示", '主流程不允许添加子节点！');
                return false;
            }
            //判断子流程是否已添加
            if(parseInt(processOrder) >= appealProcessDatas.length){
                $.messager.alert("提示", "请先添加子流程" + processOrder + "!");
                return false;
            }
            addSubNode(appealProcessDatas[parseInt(processOrder)]);
        });

        //新增提交
        $("#submitBtn").on("click",function () {
            createProcess();
        });

        //新增取消
        $("#cancelBtn").on("click",function () {
            var jq = top.jQuery;
            if (jq('#tabs').tabs('exists', "申诉流程-新增")) {
                jq('#tabs').tabs('close', "申诉流程-新增");
            }
        });
    }

    //添加流程
    function addProcess() {
        var orderNo = $("#orderNo").combobox("getValue");
        //判断主流程是否已添加
        if(appealProcessDatas.length === 0 && parseInt(orderNo) > 0){
            $.messager.alert("提示", "请先添加主流程!");
            return false;
        }
        //判断子流程是否已添加
        if(parseInt(orderNo) < appealProcessDatas.length){
            if(orderNo === "0"){
                $.messager.alert("提示", "主流程已添加!");
            }else{
                $.messager.alert("提示", "子流程" + orderNo + "已添加!");
            }
            return false;
        }
        //判断前置流程是否已添加
        if(parseInt(orderNo) > appealProcessDatas.length){
            $.messager.alert("提示", "请先添加子流程" + appealProcessDatas.length + "!");
            return false;
        }

        var processName = $("#processName").val();
        var tenantType = $("#tenantType");
        var tenantId = tenantType.combobox("getValue");
        var tenantName = tenantType.combobox("getText");
        var departmentId = $("#departmentId").val();
        var departmentName = $("#departmentName").val();
        var checkType = $("#checkType").combobox("getValue");
        var mainProcessFlag = "0";
        if(parseInt(orderNo) > 0){
            //更新主流程的子流程数
            appealProcessDatas[0].subProcessNum = parseInt(orderNo);
            //子流程的主流程标识设为"1"
            mainProcessFlag = "1";
        }

        if(processName == null || processName === ""){
            $.messager.alert("提示", "流程名称不能为空!");
            return false;
        }
        if(departmentName == null || departmentName === ""){
            $.messager.alert("提示", "请选择部门!");
            return false;
        }
        var data = {
            "processName":processName,
            "tenantId":tenantId,
            "tenantName":tenantName,
            "departmentId":departmentId,
            "departmentName":departmentName,
            "checkType":checkType,
            "mainProcessFlag":mainProcessFlag,
            "orderNo":orderNo,
            "subProcessNum":0,
            "subNodeNum":0,
            "subNodeList":[]
        };
        appealProcessDatas.push(data);
        $("#processList").datagrid("loadData",{ rows:appealProcessDatas});
    }

    //新增子节点，subProcessObj父流程对象
    function addSubNode(subProcessObj) {
        var processOrder = subProcessObj.orderNo;
        //新增节点弹框
        $("#subNodeConfig").form('clear');  //清空表单
        $("#subNodeDialog").show().window({
            width: 720,
            height: 520,
            modal: true,
            title: "添加节点"
        });
        //显示子流程名称
        $("#subProcessName").val(subProcessObj.processName);
        //审批角色下拉框
        $("#userName").combotree({
            url: '../../data/process_user.json',
            method: "GET",
            textField: "text",
            panelHeight: "250",
            multiple: true,
            editable: false,
            onBeforeExpand: function (node, param) {    // 下拉树异步
                // console.log("onBeforeExpand - node: " + node + " param: " + param);
                // $('#userName').combotree("tree").tree("options").url = "../../data/process_user.json";
            }
        });
        //取消
        var cancelBtn = $("#subNodeCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click",function () {
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });
        //提交
        var submitBtn = $("#subNodeAddBtn");
        submitBtn.unbind("click");
        submitBtn.on("click",function () {
            var subNodeName = $("#subNodeName").val();
            var userNameComboTree = $("#userName");
            //审批人员名单
            var userNameArr = userNameComboTree.combotree("getText").split(",");
            var userIdArr = userNameComboTree.combotree("getValues");

            if(subNodeName == null || subNodeName === ""){
                $.messager.alert("提示", "节点名称不能为空!");
                return false;
            }
            if(userIdArr.length === 0){
                $.messager.alert("提示", "请选审批角色!");
                return false;
            }
            //子流程已有节点数
            var subNodeNum = subProcessObj.subNodeNum;
            //子流程租户ID
            var tenantId = subProcessObj.tenantId;
            //子流程子节点列表
            var subNodeList = subProcessObj.subNodeList;
            for(var i = 0; i < userIdArr.length; i++){
                var data = {
                    "tenantId":tenantId,
                    "processId":processOrder,
                    "nodeId":subNodeNum + 1,
                    "nodeName":subNodeName,
                    "userId":userIdArr[i],
                    "userName":userNameArr[i],
                    "userType":"0",
                    "orderNo":subNodeNum + 1
                };
                subNodeList.push(data);
            }
            subNodeNum ++;
            //更新父流程的子节点数
            appealProcessDatas[processOrder].subNodeNum = subNodeNum;
            //更新父流程的子节点列表
            appealProcessDatas[processOrder].subNodeList = subNodeList;

            //刷新子节点列表
            refreshSubNodeList(subNodeList);

            //关闭弹窗
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });
    }

    //申诉流程新增-提交
    function createProcess() {
        //判断主流程是否添加
        if(appealProcessDatas.length === 0 || appealProcessDatas[0] == null){
            $.messager.alert("提示", "请添加主流程!");
            return false;
        }

        var params = {
            "appealProcess":appealProcessDatas
        };
        Util.ajax.postJson(Util.constants.CONTEXT.concat(qmURI).concat("/"), JSON.stringify(params), function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {   //新增成功
                $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                    var jq = top.jQuery;
                    if (jq('#tabs').tabs('exists', "申诉流程-新增")) {
                        jq('#tabs').tabs('close', "申诉流程-新增");
                    }
                });
            } else {  //新增失败
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            }
        });
    }

    //子节点列表刷新（同一节点合并到同一行）
    function refreshSubNodeList(subNodeList) {
        var subNodeTable =  $("#subNodeList");
        //为空时返回
        if(subNodeList.length === 0){
            subNodeTable.datagrid("loadData",{rows:[]});
            return false;
        }
        //刷新（页面）子节点列表,将同一节点合并到一行
        var subNodeData = [];
        var nodeOrder = 1;
        var userNameStr = "";
        var showData = {};
        for(var j = 0; j < subNodeList.length; j++){
            if(subNodeList[j].orderNo === nodeOrder){
                userNameStr = userNameStr + subNodeList[j].userName + " ";
            }else{
                showData = {
                    "processId":subNodeList[j-1].processId,
                    "orderNo":subNodeList[j-1].orderNo,
                    "nodeName":subNodeList[j-1].nodeName,
                    "userName":userNameStr
                };
                subNodeData.push(showData);
                //重置nodeOrder
                nodeOrder = subNodeList[j].orderNo;
                userNameStr = "";
                j--;
            }
        }
        showData = {
            "processId":subNodeList[subNodeList.length - 1].processId,
            "orderNo":subNodeList[subNodeList.length - 1].orderNo,
            "nodeName":subNodeList[subNodeList.length - 1].nodeName,
            "userName":userNameStr
        };
        subNodeData.push(showData);
        subNodeTable.datagrid("loadData",{ rows:subNodeData});
    }

    return {
        initialize: initialize
    };
});