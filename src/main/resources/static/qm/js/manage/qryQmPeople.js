define([
        "text!html/execution/qryQmPeople.tpl","jquery", 'util', "commonAjax","transfer", "easyui","crossAPI","dateUtil","ztree-exedit"],
    function (qryQmPeopleTpl,$, Util, CommonAjax,Transfer,easyui,crossAPI,dateUtil) {

        var $el;
        var listNew=[];
        var flag;
        function initialize() {
            $el = $(qryQmPeopleTpl);
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
                "pageNum": "0",
                "params": JSON.stringify(reqParams)
            };

            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItem", params, function (result) {

                var resultNew = result.RSP.DATA;
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
            $("#page",$el).find("#checkStaffInfo").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true, align: 'center'},
                    {field: 'checkStaffId', title: '员工编码信息', align: 'center', width: '20%'},
                    {field: 'checkStaffCode', title: '员工CODE', align: 'center', width: '20%'},
                    {field: 'orgsId', title: '组织编码', align: 'center', width: '20%'},
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
                    var data=[{'checkStaffId':'10001','checkStaffCode':'测试工号22','orgsId':'10000','orgs':'投诉专席工单处理1班','role':'质检员'},
                        {'checkStaffId':'10002','checkStaffCode':'测试工号23','orgsId':'10000','orgs':'投诉专席工单处理1班','role':'质检员'},
                        {'checkStaffId':'10003','checkStaffCode':'测试工号24','orgsId':'10000','orgs':'投诉专席工单处理1班','role':'质检员'},
                        {'checkStaffId':'10004','checkStaffCode':'测试工号25','orgsId':'10000','orgs':'投诉专席工单处理1班','role':'质检员'},
                        {'checkStaffId':'10005','checkStaffCode':'测试工号26','orgsId':'10000','orgs':'投诉专席工单处理1班','role':'质检员'}];
                    success(data);
                }
            });
        }

        //初始化事件
        function initGlobalEvent() {
            //查询
            $("#searchForm",$el).on("click", "#selectBut", function () {
                $("#page",$el).find("#checkStaffInfo").datagrid("load");
            });

            //确定
            $("#confirm",$el).on("click", function () {
                flag = true;
                getVal();
                $('#qry_people_window').window('close'); // 成功后，关闭窗口
            });

            //关闭窗口
            $("#page",$el).on("click", "#close", function () {
                $("#searchForm").form('clear');
                $('#qry_people_window').window('close'); // 成功后，关闭窗口
            });
        }

        function getVal(){
            var list = [];
            var selRows = $("#checkStaffInfo",$el).datagrid("getSelections");//选中多行
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            selRows.forEach(function(value,index,array){
                var map = {};
                var checkStaffId = selRows[index].checkStaffId;
                var checkStaffCode = selRows[index].checkStaffCode;
                var orgsId = selRows[index].orgsId;
                var orgs = selRows[index].orgs;
                map["checkStaffName"]=checkStaffCode;
                map["checkStaffId"]=checkStaffId;
                map["orgsId"]=orgsId;
                map["orgs"]=orgs;
                list.push(map);
            });
            return list;
        }

        function getList(){
            if(flag){
                listNew = getVal();
            }
            return listNew;
        }

        return {
            initialize:initialize,
            getList:getList
        };
    });
