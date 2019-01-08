define([
        "text!html/execution/qryQmPeople.tpl","jquery", 'util', "commonAjax","transfer", "easyui","crossAPI","dateUtil","ztree-exedit"],
    function (qryQmPeopleTpl,$, Util, CommonAjax,Transfer,easyui,crossAPI,dateUtil) {

    var planTypes = [];
    var $el;
    var dataNew;
    var flagNew;
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
                name: "name"
            },
            simpleData : {
                enable : true,//是否异步
                idKey:"id",//当前节点id属性
                pIdKey:"pId",//当前节点的父节点id属性
                rootPId:0//用于修正根节点父节点数据，即pIdKey指定的属性值
            }
        },
        callback : {
            onClick: function (e, id, node) {//点击事件

            }
        }
    };

    function showTree(){
        var zNodes = [];
        var reqParams = {
            "tenantId":Util.constants.TENANT_ID,
        };
        var params = {
            "start": "0",
            "pageNum": "10",
            "params": JSON.stringify(reqParams)
        };

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItem", params, function (result) {

            var resultNew = Transfer.DataGrid.transfer(result).rows;
            for(var i=0;i<resultNew.length;i++){
                var nodeMap =
                    {id: resultNew[i].checkItemId, pId: resultNew[i].parentCheckItemId, name: resultNew[i].checkItemName}
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#tree",$el), setting, zNodes);
        });
    }

    //初始化列表
    function initGrid() {
        //质检人员信息
        $("#checkStaffInfo",$el).datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkStaffId', title: '员工编码信息', align: 'center', width: '20%'},
                {field: 'checkStaffCode', title: '员工CODE', align: 'center', width: '20%'},
                {field: 'checkStaffId', title: '组织编码', align: 'center', width: '20%'},
                {field: 'orgs', title: '员工组', align: 'center', width: '20%'},
                {field: 'role', title: '角色', align: 'center', width: '20%'}
            ]],
            fitColumns: true,
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            loader: function (param, success) {
                // var start = (param.page - 1) * param.rows;
                // var pageNum = param.rows;
                // var checkStaffId = $("#checkStaffId").val();
                //
                // var reqParams = {
                //     "checkStaffId": checkStaffId
                // };
                // var params = $.extend({
                //     "start": start,
                //     "pageNum": pageNum,
                //     "params": JSON.stringify(reqParams)
                // }, Util.PageUtil.getParams($("#queryInfo")));
                //
                // Util.ajax.getJson(Util.constants.CONTEXT + qmURI+ "/selectByParams", params, function (result) {
                //     var data = Transfer.DataGrid.transfer(result);
                //     var rspCode = result.RSP.RSP_CODE;
                //     if (rspCode != null && rspCode !== "1") {
                //         $.messager.show({
                //             msg: result.RSP.RSP_DESC,
                //             timeout: 1000,
                //             style: {right: '', bottom: ''},     //居中显示
                //             showType: 'show'
                //         });
                //     }
                //     success(data);
                // });
                var data=[{'checkStaffId':'10001','checkStaffCode':'测试工号22','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10002','checkStaffCode':'测试工号23','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10003','checkStaffCode':'测试工号24','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10004','checkStaffCode':'测试工号25','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10005','checkStaffCode':'测试工号26','checkStaffId':'10000','orgs':'投诉专席工单处理1班'}];
                success(data);
            }
        });
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm",$el).on("click", "#selectBut", function () {
            $("#page",$el).find("#checkStaffInfo",$el).datagrid("load");
        });
        //确定
        $("#confirm",$el).on("click", function () {
            updateCheck(dataNew);
        });
        //关闭窗口
        $("#page",$el).on("click", "#close", function () {
            $("#searchForm",$el).form('clear');
            $("#qry_people_window").window("close");
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
            var checkStaffId = selRows[0].checkStaffId;
            var checkStaffCode = selRows[0].checkStaffCode;
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
