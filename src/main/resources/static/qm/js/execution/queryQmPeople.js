define([
        "text!html/execution/qryQmPeople.tpl","jquery", 'util', "commonAjax","transfer", "easyui","crossAPI","dateUtil","ztree-exedit"],
    function (qryQmPeopleTpl,$, Util, CommonAjax,Transfer,easyui,crossAPI,dateUtil) {

    var $el;
    var dataNew;
    var flagNew;//工单质检和语音质检标志
    var listData = [];
    var isCall = false;
    var treeObj;
    function initialize(ids,flag) {
        $el = $(qryQmPeopleTpl);
        dataNew = ids;
        flagNew = flag;
        initGrid();//初始化列表
        initGlobalEvent();
        showTree();
        this.$el = $el;
    };

    //zTree的配置信息
    var setting = {
        view : {
            selectedMulti : false//是否支持同时选中多个节点
        },
        data : {
            key: {
                //将treeNode的checkItemName属性当做节点名称
                name: "GROUP_NAME"
            },
            simpleData : {
                enable : true,//是否异步
                idKey:"GROUP_ID",//当前节点id属性
                pIdKey:"PARENT_ID",//当前节点的父节点id属性
                rootPId:0//用于修正根节点父节点数据，即pIdKey指定的属性值
            }
        },
        callback : {
            onClick: function (e, id, node) {//点击事件
                var newArr = [];
                if(node.isParent==false){//判断是否点击的是父节点
                    newArr = listData.filter(function(item,index){
                        if(item.GROUP_ID==node.GROUP_ID){
                            return item;
                        }
                    });
                }else{
                    var allChildrenNodesIdSet = new Set();
                    allChildrenNodesIdSet.add(node.GROUP_ID);
                    allChildrenNodesIdSet = getAllChildrenNodes(node,allChildrenNodesIdSet);
                    allChildrenNodesIdSet.forEach(function(childrenValue, childrenIndex, childrenArr){
                        listData.forEach(function(listDataValue, listDataIndex, listDataArr){
                            if(childrenValue==listDataValue.GROUP_ID){
                                newArr.push(listDataValue);
                            }
                        });
                    });
                }
                treeObj = $.fn.zTree.getZTreeObj("tree");
                setFirstPage();
                var data = {"total":newArr.length,"rows":newArr};
                $("#page",$el).find("#checkStaffInfo").datagrid("loadData",data);
                pagination(data);
                isCall = false;
            }
        }
    };

    //返回第一页
    function setFirstPage(){
        var opts =  $("#page",$el).find("#checkStaffInfo").datagrid('options');
        var pager = $("#page",$el).find("#checkStaffInfo").datagrid('getPager');
        opts.pageNumber = 1;
        opts.pageSize = opts.pageSize;
        pager.pagination('refresh',{
            pageNumber:1,
            pageSize:opts.pageSize
        });
    }

    //分页控件
    function pagination(data){
        var p = $("#page",$el).find("#checkStaffInfo").datagrid("getPager");
        p.pagination({
            total:data.rows.length,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            onSelectPage:function (pageNo, pageSize) {
                if(isCall){
                    data = {"rows":listData};
                }
                var start = (pageNo - 1) * pageSize;
                var end = start + pageSize;
                $("#page",$el).find("#checkStaffInfo").datagrid("loadData", data.rows.slice(start, end));
                p.pagination({
                    total:data.rows.length,
                    pageNumber:pageNo
                });
            }
        });
    }

    //递归获取该节点下所有的子节点的id
    function getAllChildrenNodes(node,allChildrenNodesIdSet) {
        if(node.isParent){
            var childrenNodes = node.children;
            if(childrenNodes){
                for (var i = 0;i<childrenNodes.length;i++){
                    allChildrenNodesIdSet.add(childrenNodes[i].GROUP_ID);
                    getAllChildrenNodes(childrenNodes[i],allChildrenNodesIdSet);
                }
            }
        }
        return allChildrenNodesIdSet;
    }

    function showTree(){
        var zNodes = [];
        var reqParams = {
            "parentId": "",
            "groupId": "",
            "groupName": "",
            "provCode":""
        };
        var param = {"params":JSON.stringify(reqParams)};
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getWorkList", param, function (result) {
            var resultNew = result.RSP.DATA;
            for(var i=0;i<resultNew.length;i++){
                var nodeMap =
                    {GROUP_ID: resultNew[i].GROUP_ID, PARENT_ID: resultNew[i].PARENT_ID, GROUP_NAME: resultNew[i].GROUP_NAME}
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#tree",$el), setting, zNodes);
        });
    }

    //初始化列表
    function initGrid() {
        //质检人员信息
        $("#page",$el).find("#checkStaffInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'STAFF_ID', title: '员工工号', align: 'center', width: '20%'},
                {field: 'STAFF_NAME', title: '员工姓名', align: 'center', width: '20%'},
                {field: 'GROUP_ID', title: '工作组id', align: 'center', width: '20%'},
                {field: 'GROUP_NAME', title: '工作组名称', align: 'center', width: '20%'},
                {field: 'ORGANIZE_NAME', title: '物理组织id', align: 'center', width: '20%'},
                {field: 'EMAIL', title: '邮箱', align: 'center', width: '20%'},
                {field: 'PHONE', title: '电话', align: 'center', width: '20%'},
                {field: 'ROLE_CODE', title: '角色编码', align: 'center', width: '20%'},
            ]],
            fitColumns: true,
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            loader: function (param, success) {
                //取消树节点选中状态
                if(treeObj){
                    var nodes = treeObj.getSelectedNodes();
                    if (nodes.length>0) {
                        treeObj.cancelSelectedNode(nodes[0]);
                    }
                }
                var addCheckStaffId = $("#addCheckStaffId",$el).val();
                var reqParams = {
                    "groupId": "",
                    "staffName":addCheckStaffId,
                    "staffId": "",
                    "start":param.page,
                    "limit": param.rows,
                    "provCode": "",
                    "roleCode": ""
                };
                var params = {
                    "params": JSON.stringify(reqParams)
                };

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
                    var data = {"rows":result.RSP.DATA[0].jsonArray,"total":result.RSP.DATA[0].totalAll};
                    listData = result.RSP.DATA[0].jsonArrayAll;
                    success(data);
                });
            }
        });
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm",$el).on("click", "#searchBtn", function () {
            isCall = true;
            $("#page",$el).find("#checkStaffInfo").datagrid("load");
        });

        //确定
        $("#confirm",$el).on("click", function () {
            updateCheck(dataNew);
        });


        //关闭窗口
        $("#page",$el).on("click", "#close", function () {
            $("#searchForm",$el).form('clear');
            $("#checkStaffInfo",$el).datagrid('clearChecked');//清除所有勾选状态
            $("#qry_people_window").window("close");// 成功后，关闭窗口
        });
    }

    function updateCheck(ids) {
        var selRows = $("#checkStaffInfo",$el).datagrid("getSelections");//选中多行
        if (selRows.length == 0||selRows.length>1) {
            $.messager.alert("提示", "请只选择一行数据!");
            return false;
        }
        var params=[];
        for(var i=0;i<dataNew.length;i++){
            var map = {};
            var checkStaffId = selRows[0].STAFF_ID;
            var checkStaffCode = selRows[0].STAFF_NAME;
            map["checkStaffName"]=checkStaffCode;
            map["checkStaffId"]=checkStaffId;
            if(flagNew){
                map["wrkfmShowSwftno"]=dataNew[i];
            }else{
                map["touchId"]=dataNew[i];
            }
            params.push(map);
        }
        if(flagNew){
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_POOL_DNS).concat("/updateCheck"), JSON.stringify(params), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $("#queryInfo").datagrid('reload'); //成功后，刷新页面
                    $('#qry_people_window').window('close'); // 成功后，关闭窗口
                }
            });
        }else{
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.VOICE_POOL_DNS).concat("/updateCheck"), JSON.stringify(params), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $("#queryInfo").datagrid('reload'); //成功后，刷新页面
                    $("#qry_people_window").window("close"); // 成功后，关闭窗口
                }
            });
        }
    }

    return initialize;
});
