define([
        "text!html/execution/queryQmPeople.tpl", "jquery", 'util', "commonAjax", "transfer", "easyui", "crossAPI", "dateUtil", "ztree-exedit"],
    function (qryQmPeopleTpl, $, Util, CommonAjax, Transfer, easyui, crossAPI, dateUtil) {
        var $el;
        var dataNew;
        var flagNew;//工单质检(0),语音质检(1)标志

        function initialize(ids, flag) {
            $el = $(qryQmPeopleTpl);
            dataNew = ids;
            flagNew = flag;
            initGlobalEvent();
            initGrid();//初始化列表
            this.$el = $el;
        }

        //zTree的配置信息
        var setting = {
            view: {
                selectedMulti: false//是否支持同时选中多个节点
            },
            data: {
                key: {
                    name: "GROUP_NAME"
                },
                simpleData: {
                    enable: true,//是否异步
                    idKey: "GROUP_ID",//当前节点id属性
                    pIdKey: "PARENT_ID",//当前节点的父节点id属性
                    rootPId: 0//用于修正根节点父节点数据，即pIdKey指定的属性值
                }
            },
            callback: {
                onDblClick: function (e, id, node) { //点击事件
                    if (node.isParent) {
                        $.messager.alert("提示", "请选择子节点!");
                        return false;
                    }
                    $('#groupName', $el).searchbox("setValue", node.GROUP_NAME);
                    $("#groupId", $el).val(node.GROUP_ID);
                    $('#qry_worklist_window2').window('destroy');//销毁临时窗口
                }
            }
        };

        //初始化列表
        function initGrid() {
            //质检人员信息
            $("#page", $el).find("#checkStaffInfo").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true, align: 'center'},
                    {field: 'STAFF_ID', title: '员工工号', align: 'center', width: '20%'},
                    {field: 'STAFF_NAME', title: '员工姓名', align: 'center', width: '20%'},
                    {field: 'GROUP_ID', title: '工作组id', align: 'center', width: '20%'},
                    {field: 'GROUP_NAME', title: '工作组名称', align: 'center', width: '20%'},
                    {field: 'EMAIL', title: '邮箱', align: 'center', width: '20%'},
                    {field: 'PHONE', title: '电话', align: 'center', width: '20%'},
                    {field: 'ROLE_CODE', title: '角色编码', align: 'center', width: '20%'}
                ]],
                fitColumns: true,
                height: 330,
                pagination: true,
                pageSize: 10,
                singleSelect: true,
                pageList: [5, 10, 20, 50],
                rownumbers: false,
                loader: function (param, success) {
                    var groupId = $("#groupId", $el).val();
                    var staffName = $("#staffName", $el).val();
                    var staffId = $("#staffId", $el).val();
                    var reqParams = {
                        "groupId": groupId,
                        "staffName": staffName,
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
                        var data = {"rows": [], "total": 0};
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: "人员信息无数据",
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        } else {
                            data = {"rows": result.RSP.DATA[0].jsonArray, "total": result.RSP.DATA[0].totalAll};
                        }
                        success(data);
                    });
                }
            });
        }

        //工作组弹窗，默认隐藏
        function getWorkListDiv() {
            return '<div id="qry_worklist_window2" style="display:none;"><div class="panel-tool-box cl">' +
                '<div class="fl text-bold">' + '请选择工作组[双击数据选中]' + '</div></div><div id="treeDiv" class="index-west">' +
                '<ul id="tree2" class="ztree" style="border:#fff solid 0px;"></ul></div></div>';
        }

        //初始化事件
        function initGlobalEvent() {

            $('#groupName', $el).searchbox({ //工作组查询
                editable:false,//禁止手动输入
                searcher: function (value) {
                    var div = $("#content", $el);
                    div.append(getWorkListDiv());
                    $('#qry_worklist_window2', $el).show().window({
                        title: '工作组信息',
                        width: 300,
                        height: 500,
                        cache: false,
                        modal: true,
                        onBeforeClose:function(){//弹框关闭前触发事件
                            $('#qry_worklist_window2').window('destroy');//销毁临时窗口
                        }
                    });
                    var zNodes = [];
                    var reqParams = {
                        "parentId": "",
                        "groupId": "",
                        "groupName": "",
                        "provCode": ""
                    };
                    var param = {"params": JSON.stringify(reqParams)};
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getWorkList", param, function (result) {
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: "工作组" + result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        }
                        var resultNew = result.RSP.DATA;
                        for (var i = 0; i < resultNew.length; i++) {
                            var nodeMap =
                                {
                                    GROUP_ID: resultNew[i].GROUP_ID,
                                    PARENT_ID: resultNew[i].PARENT_ID,
                                    GROUP_NAME: resultNew[i].GROUP_NAME
                                };
                            zNodes.push(nodeMap);
                        }
                        $.fn.zTree.init($("#tree2"), setting, zNodes);
                    });
                }
            });

            //查询
            $("#form", $el).on("click", "#searchBtn", function () {
                $("#page", $el).find("#checkStaffInfo").datagrid("load");
            });

            //确定
            $("#confirm", $el).on("click", function () {
                var selRows = $("#checkStaffInfo", $el).datagrid("getSelections");//选中多行
                if (selRows.length == 0 || selRows.length > 1) {
                    $.messager.alert("提示", "请只选择一行数据!");
                    return false;
                }
                if (dataNew != null) {
                    updateCheck(dataNew);
                }
                $("#qry_people_window").window("close");// 关闭窗口
            });

            //关闭窗口
            $("#page", $el).on("click", "#close", function () {
                $("#form", $el).form('clear');
                $("#checkStaffInfo", $el).datagrid('clearChecked');//清除所有勾选状态
                $("#qry_people_window").window("close");// 成功后，关闭窗口
            });
        }

        function updateCheck() {
            var selRows = $("#checkStaffInfo", $el).datagrid("getSelections");//选中多行
            var params = [];
            for (var i = 0; i < dataNew.length; i++) {
                var map = {};
                var checkStaffId = selRows[0].STAFF_ID;
                var checkStaffCode = selRows[0].STAFF_NAME;
                map["checkStaffName"] = checkStaffCode;
                map["checkStaffId"] = checkStaffId;
                if (flagNew == "0") {
                    map["wrkfmShowSwftno"] = dataNew[i];
                } else if (flagNew == "1") {
                    map["touchId"] = dataNew[i];
                }
                params.push(map);
            }
            if (flagNew == "0") {
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
            } else if (flagNew == "1") {
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

        function getVal() {
            var map = {};
            var selRows = $("#checkStaffInfo", $el).datagrid("getSelections");//选中多行
            selRows.forEach(function (value, index, array) {
                var staffId = selRows[index].STAFF_ID;
                var staffName = selRows[index].STAFF_NAME;
                var groupId = selRows[index].GROUP_ID;
                var groupName = selRows[index].GROUP_NAME;
                map["staffId"] = staffId;
                map["staffName"] = staffName;
                map["groupId"] = groupId;
                map["groupName"] = groupName;
            });
            return map;
        }

        return {
            initialize: initialize,
            getMap: getVal
        };
    });
