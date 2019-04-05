define([
        "text!html/execution/queryQmPeople.tpl","jquery", 'util', "commonAjax","transfer", "easyui","crossAPI","dateUtil","ztree-exedit"],
    function (qryQmPeopleTpl,$, Util, CommonAjax,Transfer,easyui,crossAPI,dateUtil) {

        var $el;
        function initialize() {
            $el = $(qryQmPeopleTpl);
            initGlobalEvent();
            initGrid();//初始化列表
            this.$el = $el;
        };

        //zTree的配置信息
        var setting = {
            view : {
                selectedMulti : false//是否支持同时选中多个节点
            },
            data : {
                key: {
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
                onDblClick: function (e, id, node) { //双击事件
                    if(node.isParent){
                        $.messager.alert("提示", "请选择子节点!");
                        return false;
                    }
                    $('#groupName',$el).searchbox("setValue",node.GROUP_NAME);
                    $("#groupId",$el).val(node.GROUP_ID);
                    $('#qry_worklist_window').window('destroy');//销毁临时窗口
                }
            }
        };

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
                    {field: 'EMAIL', title: '邮箱', align: 'center', width: '20%'},
                    {field: 'PHONE', title: '电话', align: 'center', width: '20%'},
                    {field: 'ROLE_CODE', title: '角色编码', align: 'center', width: '20%'},
                ]],
                fitColumns: true,
                height: 420,
                pagination: true, //分页显示
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                rownumbers: false,
                loader: function (param, success) {
                    var groupId = $("#groupId",$el).val();
                    var staffName = $("#staffName",$el).val();
                    var staffId = $("#staffId",$el).val();
                    var reqParams = {
                        "groupId": groupId,
                        "staffName":staffName,
                        "staffId": staffId,
                        "start": param.page,
                        "limit": param.rows,
                        "provCode": "",
                        "roleCode": ""
                    };
                    var params = {
                        "params": JSON.stringify(reqParams)
                    };
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
                        var data = {"rows":[],"total":0};;
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: "人员信息无数据",
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        }else{
                            data = {"rows":result.RSP.DATA[0].jsonArray,"total":result.RSP.DATA[0].totalAll};
                        }
                        success(data);
                    });
                }
            });
        }

        //工作组弹窗，默认隐藏
        function getWorkListDiv() {
            return '<div id="qry_worklist_window" style="display:none;"><div class="panel-tool-box cl">'+
                '<div class="fl text-bold">'+'请选择工作组[双击数据选中]'+'</div></div><div id="treeDiv" class="index-west">'+
                '<ul id="tree" class="ztree" style="border:#fff solid 0px;"></ul></div></div>';
        }

        //初始化事件
        function initGlobalEvent() {
            $('#groupName',$el).searchbox({ //工作组查询
                editable:false,//禁止手动输入
                searcher: function(value){
                    var div = $("#content",$el);
                    div.append(getWorkListDiv());
                    $('#qry_worklist_window',$el).show().window({
                        title: '工作组信息',
                        width: 300,
                        height: 500,
                        cache: false,
                        modal: true,
                        onBeforeClose:function(){//弹框关闭前触发事件
                            $('#qry_worklist_window').window('destroy');//销毁临时窗口
                        }
                    });
                    var zNodes = [];
                    var reqParams = {
                        "parentId": "",
                        "groupId": "",
                        "groupName": "",
                        "provCode":""
                    };
                    var param = {"params":JSON.stringify(reqParams)};
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getWorkList", param, function (result) {
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: "工作组"+result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        }
                        var resultNew = result.RSP.DATA;
                        for(var i=0;i<resultNew.length;i++){
                            var nodeMap =
                                {GROUP_ID: resultNew[i].GROUP_ID, PARENT_ID: resultNew[i].PARENT_ID, GROUP_NAME: resultNew[i].GROUP_NAME}
                            zNodes.push(nodeMap);
                        }
                        $.fn.zTree.init($("#tree"), setting, zNodes);
                    });
                }
            });
            //清空
            $("#clearBtn",$el).on("click", function () {
                $("#form input",$el).val("");
            });

            //查询
            $("#form",$el).on("click", "#searchBtn", function () {
                $("#page",$el).find("#checkStaffInfo").datagrid("load");
            });

            //确定
            $("#page",$el).on("click", "#confirm", function () {
                var selRows = $("#checkStaffInfo",$el).datagrid("getSelections");//选中多行
                if(selRows.length == 0){
                    $.messager.alert('警告', '请至少选择一条数据！');
                    return;
                }
                // getVal();
                $('#qry_people_window').window('destroy'); // 成功后，销毁窗口（注意：用close会会对原先已有的dom结构造成影响）
            });

            //关闭窗口
            $("#page",$el).on("click", "#close", function () {
                $("#form").form('clear');
                $("#checkStaffInfo",$el).datagrid('clearChecked');//清除所有勾选状态
                $('#qry_people_window').window('destroy');
            });
        }

        function getVal(){
            var list = [];
            var selRows = $("#checkStaffInfo",$el).datagrid("getSelections");//选中多行
            if (selRows.length != 0) {
                selRows.forEach(function(value,index,array){
                    var map = {};
                    var checkStaffId = selRows[index].STAFF_ID;
                    var checkStaffCode = selRows[index].STAFF_NAME;
                    var orgsId = selRows[index].GROUP_ID;
                    var orgs = selRows[index].GROUP_NAME;
                    map["checkStaffName"]=checkStaffCode;
                    map["checkStaffId"]=checkStaffId;
                    map["orgsId"]=orgsId;
                    map["orgs"]=orgs;
                    list.push(map);
                });
            }
            return list;
        }

        return {
            initialize:initialize,
            getList:getVal
        };
    });
