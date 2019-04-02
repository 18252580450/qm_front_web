define([
        "text!html/execution/beyondPlanAllocate.tpl",
        "js/execution/beyondPlanChooseTemplate",
        "jquery", 'util', "commonAjax", "transfer", "easyui", "dateUtil", "ztree-exedit"],
    function (tpl, QryCheckTemplate, $, Util, CommonAjax, Transfer, easyui, dateUtil) {
        var $el,
            checkType,          //质检类型（1工单、0语音）
            allocateData = [];  //待分配工单or语音列表

        function initialize(type, allocateList) {
            $el = $(tpl);
            checkType = type;
            allocateData = allocateList;
            initGrid();
            initEvent();
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
                    $('#qryWorkGroup').window('destroy');
                }
            }
        };

        //初始化列表
        function initGrid() {
            //质检人员信息
            $("#page", $el).find("#staffList").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true},
                    {field: 'STAFF_ID', title: '员工工号', width: '15%'},
                    {field: 'STAFF_NAME', title: '员工姓名', width: '15%'},
                    {field: 'ROLE_CODE', title: '角色', width: '15%'},
                    {field: 'GROUP_NAME', title: '工作组', width: '15%'},
                    {field: 'ORGANIZE_NAME', title: '物理组织', width: '15%'},
                    {field: 'EMAIL', title: '邮箱', width: '20%'},
                    {field: 'PHONE', title: '电话', width: '20%'}
                ]],
                fitColumns: true,
                height: 350,
                pagination: true,
                singleSelect: true,
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                rownumbers: false,
                loader: function (param, success) {
                    var groupId = $("#groupId", $el).val(),
                        staffName = $("#staffName", $el).val(),
                        staffId = $("#staffId", $el).val(),
                        reqParams = {
                            "groupId": groupId,
                            "staffName": staffName,
                            "staffId": staffId,
                            "start": param.page,
                            "limit": param.rows,
                            "provCode": "",
                            "roleCode": ""
                        },
                        params = {
                            "params": JSON.stringify(reqParams)
                        };

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
                        var data = {"rows": [], "total": 0},
                            rspCode = result.RSP.RSP_CODE;
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

        //初始化事件
        function initEvent() {
            //工作组搜索框
            $('#groupName', $el).searchbox({
                searcher: function (value) {
                    $("#content", $el).append(getWorkListDiv());
                    $('#qryWorkGroup', $el).show().window({
                        title: '工作组信息',
                        width: 300,
                        height: 500,
                        cache: false,
                        modal: true,
                        onBeforeClose: function () {//弹框关闭前触发事件
                            $("#qryWorkGroup", $el).window("destroy");
                        }
                    });
                    var zNodes = [],
                        reqParams = {
                            "parentId": "",
                            "groupId": "",
                            "groupName": "",
                            "provCode": ""
                        },
                        param = {"params": JSON.stringify(reqParams)};
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getWorkList", param, function (result) {
                        var rspCode = result.RSP.RSP_CODE,
                            data = result.RSP.DATA;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: "工作组" + result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        } else {
                            for (var i = 0; i < data.length; i++) {
                                var nodeMap =
                                    {
                                        GROUP_ID: data[i].GROUP_ID,
                                        PARENT_ID: data[i].PARENT_ID,
                                        GROUP_NAME: data[i].GROUP_NAME
                                    };
                                zNodes.push(nodeMap);
                            }
                            $.fn.zTree.init($("#workGroupTree"), setting, zNodes);
                        }
                    });
                }
            });

            //考评模版搜索框
            $('#templateName', $el).searchbox({
                searcher: function (value) {
                    var qryCheckTemplate = QryCheckTemplate;
                    qryCheckTemplate.initialize(checkType, "1");
                    $('#qry_window').show().window({
                        title: '选择考评模版',
                        width: 950,
                        height: 550,
                        cache: false,
                        content: qryCheckTemplate.$el,
                        modal: true,
                        onClose: function () {//弹框关闭前触发事件
                            var checkTemplate = qryCheckTemplate.getCheckTemplate();//获取模版信息
                            if (checkTemplate != null) {
                                $('#templateName', $el).searchbox("setValue", checkTemplate.templateName);
                                $("#templateId", $el).val(checkTemplate.templateId);
                            }
                        }
                    });
                }
            });

            //查询
            $("#queryBtn", $el).on("click", function () {
                $("#staffList", $el).datagrid("load");
            });

            //重置
            $("#resetBtn", $el).on("click", function () {
                $("#form", $el).form('clear');
                $("#staffList", $el).datagrid('clearChecked');//清除所有勾选状态
            });

            //确定
            $("#confirm", $el).on("click", function () {
                if (checkType === Util.constants.CHECK_TYPE_ORDER) {
                    workFormAllocate();
                } else if (checkType === Util.constants.CHECK_TYPE_VOICE) {
                    voiceAllocate();
                }
            });

            //关闭窗口
            $("#close", $el).on("click", function () {
                $("#form", $el).form('clear');
                $("#staffList", $el).datagrid('clearChecked');//清除所有勾选状态
                $("#qry_people_window").window("close");
            });
        }

        //分配工单
        function workFormAllocate() {
            var templateId = $("#templateId").val(),
                checkStaffInfo = $("#staffList").datagrid("getSelected");
            if (templateId == null || templateId === "") {
                $.messager.alert("提示", "请选择考评模版!");
                return;
            }
            if (checkStaffInfo == null || checkStaffInfo === "") {
                $.messager.alert("提示", "请选择质检员!");
                return;
            }
            var params = {
                "templateId": templateId,                    //模版id
                "checkStaffId": checkStaffInfo.STAFF_ID,     //质检人id
                "checkStaffName": checkStaffInfo.STAFF_NAME, //质检人姓名
                "workFormList": allocateData                 //待分配工单列表
            };

            Util.loading.showLoading();
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.BEYOND_PLAN_ORDER_POOL_DNS).concat("/"), JSON.stringify(params), function (result) {

                Util.loading.destroyLoading();
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                        $("#workFormList").datagrid('load');  //刷新工单列表
                        $("#qry_people_window").window("close");    // 成功后，关闭窗口
                    });
                } else {
                    $.messager.alert("提示", result.RSP.RSP_DESC);
                }
            });
        }

        //分配语音
        function voiceAllocate() {
            var templateId = $("#templateId").val(),
                checkStaffInfo = $("#staffList").datagrid("getSelected");
            if (templateId == null || templateId === "") {
                $.messager.alert("提示", "请选择考评模版!");
                return;
            }
            if (checkStaffInfo == null || checkStaffInfo === "") {
                $.messager.alert("提示", "请选择质检员!");
                return;
            }
            var params = {
                "templateId": templateId,                    //模版id
                "checkStaffId": checkStaffInfo.STAFF_ID,     //质检人id
                "checkStaffName": checkStaffInfo.STAFF_NAME, //质检人姓名
                "voiceList": allocateData                 //待分配工单列表
            };

            Util.loading.showLoading();
            Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.BEYOND_PLAN_VOICE_POOL_DNS).concat("/"), JSON.stringify(params), function (result) {

                Util.loading.destroyLoading();
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode != null && rspCode === "1") {
                    $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                        $("#voiceCheckList").datagrid('load');  //刷新工单列表
                        $("#qry_people_window").window("close");    // 成功后，关闭窗口
                    });
                } else {
                    $.messager.alert("提示", result.RSP.RSP_DESC);
                }
            });
        }

        //工作组弹窗，默认隐藏
        function getWorkListDiv() {
            return '<div id="qryWorkGroup" style="display:none;"><div class="panel-tool-box cl">' +
                '<div class="fl text-bold">' + '请选择工作组[双击数据选中]' + '</div></div><div class="index-west">' +
                '<ul id="workGroupTree" class="ztree" style="border:#fff solid 0px;"></ul></div></div>';
        }

        return initialize;
    });
