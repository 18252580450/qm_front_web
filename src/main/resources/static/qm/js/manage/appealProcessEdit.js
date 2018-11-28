require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var mainProcess = null,         //主流程对象
        showProcessName = true,     //防止初始化的时候主流程名被清除
        processAddData = [],        //流程新增数据
        processDelData = [],        //流程删除数据
        processUpdateData = [],     //流程修改数据（已有子流程的修改列表）
        nodeAddData = [],           //节点新增数据（已有子流程的新增节点）
        nodeDelData = [],           //节点删除数据（已有子流程的已有节点删除数据）
        nodeUpdateData = [],        //节点修改数据（已有子流程的已有节点修改数据）
        processListData = [],       //列表展示数据（包括子流程和子节点列表数据）
        checkTypeData = [],         //质检类型静态数据
        orderData = [];             //流程顺序静态数据

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取主流程基本信息
        mainProcess = getRequestObj();

        //主流程基本信息
        $("#processName").val(mainProcess.processName);
        $("#tenantType").val(mainProcess.tenantId);
        $("#departmentName").val(mainProcess.departmentName);

        //查询质检类型
        var checkType = "";
        if (checkTypeData.length !== 0) {
            $.each(checkTypeData, function (index, item) {
                if (item.paramsCode === mainProcess.checkType) {
                    checkType = item.paramsName;
                    $("#checkType").val(checkType);
                }
            });
        } else {
            var reqParams = {
                "tenantId": Util.constants.TENANT_ID,
                "paramsTypeId": "CHECK_TYPE"
            };
            var params = {
                "start": 0,
                "pageNum": 0,
                "params": JSON.stringify(reqParams)
            };
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode === "1") {
                    var data = result.RSP.DATA;
                    if (data.length > 0) {
                        checkTypeData = data;
                        $.each(data, function (index, item) {
                            if (item.paramsCode === mainProcess.checkType) {
                                checkType = item.paramsName;
                            }
                        });
                        $("#checkType").val(checkType);
                    }
                }
            });
        }

        //流程顺序下拉框
        $("#orderNo").combobox({
            data: orderData,
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var orderNo = $("#orderNo");
                var data = orderNo.combobox('getData');
                if (data.length > 0) {
                    orderNo.combobox('select', data[0].paramsCode);
                }
            },
            onSelect: function () {
                //重置流程名称
                if (!showProcessName) {
                    $("#processName").val("");
                }
                showProcessName = false;
                var orderNo = parseInt($("#orderNo").combobox("getValue"));
                //切换子流程时同时刷新子节点列表
                if (orderNo === 0 || orderNo >= processListData.length) {
                    $("#subNodeList").datagrid("loadData", {rows: []});
                } else {
                    queryNodeList(processListData[orderNo]);
                }
            }
        });
        //重载下拉框数据
        if (orderData.length === 0) {
            reloadSelectData("PROCESS_LEVEL", "orderNo", false);
        }

        //流程列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#processList").datagrid({
            columns: [[
                {
                    field: 'orderNo', title: '流程顺序', width: '15%',
                    formatter: function (value, row, index) {
                        var order = "";
                        if (orderData.length !== 0) {
                            for (var i = 0; i < orderData.length; i++) {
                                if (parseInt(orderData[i].paramsCode) === value) {
                                    order = orderData[i].paramsName;
                                    return order;
                                }
                            }
                        }
                    }
                },
                {field: 'processName', title: '流程名称', width: '20%'},
                {field: 'tenantName', title: '模板渠道', hidden: true},
                {field: 'tenantId', title: '模板渠道', width: '15%'},
                {field: 'departmentName', title: '部门', width: '20%'},
                {field: 'departmentId', title: '部门Id', hidden: true},
                {
                    field: 'checkType', title: '质检类型', width: '20%',
                    formatter: function (value, row, index) {
                        var itemType = "";
                        if (checkTypeData.length !== 0) {
                            $.each(checkTypeData, function (index, item) {
                                if (item.paramsCode === value) {
                                    itemType = item.paramsName;
                                }
                            });
                        }
                        return itemType;
                    }
                },
                {
                    field: 'operation', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var edit = '<a href="javascript:void(0);" id = "processEdit' + row.orderNo + '">修改</a>';
                        //只允许删除最后一个子流程
                        if (row.orderNo === processListData.length - 1) {
                            return edit + "&nbsp;&nbsp;" + '<a href="javascript:void(0);" id = "processDel' + row.orderNo + '">删除</a>';
                        }
                        return edit;
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 250,
            pagination: false,
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#processList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#processList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = "0";
                var pageNum = "0";
                var parentProcessId = mainProcess.processId;

                var reqParams = {
                    "parentProcessId": parentProcessId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                //流程列表加载之前先查询流程顺序
                if (orderData.length !== 0) {
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcess", params, function (result) {
                        var data = {
                            rows: result.RSP.DATA
                        };

                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode != null && rspCode !== "1") {
                            $.messager.show({
                                msg: result.RSP.RSP_DESC,
                                timeout: 1000,
                                style: {right: '', bottom: ''},     //居中显示
                                showType: 'show'
                            });
                        }
                        processListData = result.RSP.DATA;
                        success(data);
                    });
                } else {
                    var orderReqParams = {
                        "tenantId": Util.constants.TENANT_ID,
                        "paramsTypeId": "PROCESS_LEVEL"
                    };
                    var orderParams = {
                        "start": 0,
                        "pageNum": 0,
                        "params": JSON.stringify(orderReqParams)
                    };
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", orderParams, function (result) {
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode === "1") {
                            orderData = result.RSP.DATA;
                            //流程顺序数据查询成功后再加载子流程列表
                            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_PROCESS_CONFIG_DNS + "/queryAppealProcess", params, function (result) {
                                var data = {
                                    rows: result.RSP.DATA
                                };

                                var rspCode = result.RSP.RSP_CODE;
                                if (rspCode != null && rspCode !== "1") {
                                    $.messager.show({
                                        msg: result.RSP.RSP_DESC,
                                        timeout: 1000,
                                        style: {right: '', bottom: ''},     //居中显示
                                        showType: 'show'
                                    });
                                }
                                processListData = result.RSP.DATA;
                                success(data);
                            });
                        }
                    });
                }
            },
            onLoadSuccess: function (data) {
                $.each(data.rows, function (index, item) {
                    var orderNo = item.orderNo;
                    //绑定流程修改事件
                    $("#processEdit" + orderNo).on("click", function () {
                        showProcessEditDialog(item);
                    });
                    //绑定流程删除事件、末子流程才允许被删除
                    if (orderNo === processListData.length - 1) {
                        $("#processDel" + orderNo).on("click", function () {
                            $.messager.confirm('确认删除弹窗', '确定要删除' + item.processName + '吗？', function (confirm) {
                                if (confirm) {
                                    //更新主流程的子流程数
                                    mainProcess.subProcessNum--;
                                    //删除已有子流程
                                    if (item.hasOwnProperty("createTime")) {   //根据有无创建时间字段判断
                                        processDelData.push(item);
                                        //删除已有子流程修改列表
                                        for (var i = 0; i < processUpdateData.length; i++) {
                                            if (processUpdateData[i].processId === item.processId) {
                                                processUpdateData.splice(i, 1);
                                                break;
                                            }
                                        }
                                        //删除该子流程的子节点新增数据
                                        for (var j = 0; j < nodeAddData.length; j++) {
                                            if (nodeAddData[j].processOrder === item.orderNo) {
                                                nodeAddData.splice(j, 1);
                                                j--;
                                            }
                                        }
                                        //删除该子流程的子节点删除数据
                                        for (var k = 0; k < nodeDelData.length; k++) {
                                            if (nodeDelData[k].processId === item.processId) {
                                                nodeDelData.splice(k, 1);
                                                k--;
                                            }
                                        }
                                        //删除该子流程的子节点修改数据
                                        for (var l = 0; l < nodeUpdateData.length; l++) {
                                            if (nodeUpdateData[l].processId === item.processId) {
                                                nodeUpdateData.splice(l, 1);
                                                l--;
                                            }
                                        }
                                    } else {  //删除新增子流程
                                        processAddData.splice(processAddData.length - 1, 1);
                                    }
                                    //刷新流程列表
                                    processListData.splice(processListData.length - 1, 1);
                                    $("#processList").datagrid("loadData", {rows: processListData});
                                    //刷新子节点列表（当前展示的子节点的父流程被删除时）
                                    var orderNoSelect = $("#orderNo");
                                    if (orderNo === parseInt(orderNoSelect.combobox("getValue"))) {
                                        orderNoSelect.combobox("setValue", orderToParamsCode(processListData[orderNo - 1].orderNo));
                                        if (processListData[orderNo - 1].hasOwnProperty("subNodeList")) {
                                            refreshSubNodeList(processListData[orderNo - 1].subNodeList);
                                            return;
                                        }
                                        //查询已有子节点列表
                                        queryNodeList(processListData[orderNo - 1]);
                                    }
                                }
                            });
                        });
                    }
                });
            },
            //子流程列表行点击事件
            onClickRow: function (index, data) {
                debugger;
                //子节点列表上方显示流程名
                $("#subProcess").val(data.orderNo);
                //刷新选择流程下拉框
                $("#orderNo").combobox("setValue", orderToParamsCode(data.orderNo));
                //主流程则返回
                if (data.orderNo === 0) {
                    $("#subNodeList").datagrid("loadData", {rows: []});
                    return;
                }
                //刷新子节点列表
                if (processListData[data.orderNo].hasOwnProperty("subNodeList")) {
                    refreshSubNodeList(processListData[data.orderNo].subNodeList);
                    return;
                }
                //未添加子节点的新增子流程
                if (!processListData[data.orderNo].hasOwnProperty("createTime")) {
                    $("#subNodeList").datagrid("loadData", {rows: []});
                    return;
                }

                //查询已有子节点列表
                queryNodeList(data);
            }
        });

        //节点列表
        var IsNodeCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#subNodeList").datagrid({
            columns: [[
                {
                    field: 'processOrder', title: '子流程', width: '15%',
                    formatter: function (value, row, index) {
                        var order = "";
                        if (orderData.length !== 0) {
                            for (var i = 0; i < orderData.length; i++) {
                                if (parseInt(orderData[i].paramsCode) === value) {
                                    order = orderData[i].paramsName;
                                    return order;
                                }
                            }
                        }
                    }
                },
                {field: 'processName', title: '子流程', hidden: true},
                {field: 'orderNo', title: '节点序号', width: '15%'},
                {field: 'nodeName', title: '节点名称', width: '20%'},
                {field: 'userName', title: '角色', width: '40'},
                {field: 'userId', title: '角色Id', hidden: true},
                {
                    field: 'detail', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        if (processListData[row.processOrder].hasOwnProperty("subNodeList")) {
                            var edit = '<a href="javascript:void(0);" id = "nodeEdit' + row.orderNo + '">修改</a>';
                            //只允许删除末子节点
                            var subNodeList = processListData[row.processOrder].subNodeList;
                            if (row.orderNo === subNodeList[subNodeList.length - 1].orderNo) {
                                return edit + "&nbsp;&nbsp;" + '<a href="javascript:void(0);" id = "nodeDel' + row.orderNo + '">删除</a>';
                            }
                            return edit;
                        }
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 250,
            pagination: false,
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsNodeCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsNodeCheckFlag) {
                    IsNodeCheckFlag = true;
                    $("#subNodeList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsNodeCheckFlag) {
                    IsNodeCheckFlag = true;
                    $("#subNodeList").datagrid("selectRow", rowIndex);
                }
            },
            onLoadSuccess: function (data) {
                $.each(data.rows, function (index, item) {
                    var orderNo = item.orderNo;
                    //绑定子节点修改事件
                    $("#nodeEdit" + orderNo).on("click", function () {
                        showNodeEditDialog(item);
                    });
                    //绑定子节点删除事件、末子节点才允许被删除
                    var subNodeList = processListData[item.processOrder].subNodeList;
                    if (orderNo === subNodeList[subNodeList.length - 1].orderNo) {
                        $("#nodeDel" + orderNo).on("click", function () {
                            $.messager.confirm('确认删除弹窗', '确定要删除该子节点吗？', function (confirm) {
                                if (confirm) {
                                    for (var i = 0; i < subNodeList.length; i++) {
                                        //删除末子节点（多条数据）
                                        if (subNodeList[i].orderNo === orderNo) {
                                            for (var j = i; j < subNodeList.length; j++) {
                                                //删除已有节点（已有子流程的已有节点）
                                                if (subNodeList[j].hasOwnProperty("createTime")) {
                                                    nodeDelData.push(subNodeList[j]);
                                                    //删除节点修改数据（已有子流程的已有子节点）
                                                    for (var l = 0; l < nodeUpdateData.length; l++) {
                                                        if (nodeUpdateData[l].processId === subNodeList[j].processId && nodeUpdateData[l].orderNo === orderNo && nodeUpdateData[l].userId === subNodeList[j].userId) {
                                                            nodeUpdateData.splice(l, 1);
                                                            l--;
                                                        }
                                                    }
                                                } else {
                                                    //删除新增节点（已有子流程的新增节点）
                                                    if (processListData[item.processOrder].hasOwnProperty("createTime")) {
                                                        for (var k = 0; k < nodeAddData.length; k++) {
                                                            if (nodeAddData[k].processOrder === subNodeList[j].processOrder && nodeAddData[k].orderNo === orderNo && nodeAddData[k].userId === subNodeList[j].userId) {
                                                                nodeAddData.splice(k, 1);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            //删除所有序号为orderNo的节点
                                            subNodeList.splice(i, subNodeList.length - i + 1);
                                            break;
                                        }
                                    }
                                    //更新子节点列表
                                    processListData[item.processOrder].subNodeList = subNodeList;
                                    //更新子流程的子节点数
                                    processListData[item.processOrder].subNodeNum--;

                                    //更新子流程修改数据（更新子流程子节点数）
                                    if (processListData[item.processOrder].hasOwnProperty("createTime")) {
                                        for (var m = 0; m < processUpdateData.length; m++) {
                                            if (processUpdateData[m].orderNo === processListData[item.processOrder].orderNo) {
                                                processUpdateData.splice(m, 1);
                                                break;
                                            }
                                        }
                                        processUpdateData.push(processListData[item.processOrder]);
                                    }

                                    //刷新（页面）子节点列表
                                    refreshSubNodeList(subNodeList);
                                }
                            });
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
            var orderNo = $("#orderNo"),
                processOrder = parseInt(orderNo.combobox("getValue")),
                processOrderName = orderNo.combobox("getText");
            //主流程则返回
            if (processOrder === 0) {
                $.messager.alert("提示", '主流程不允许添加子节点！');
                return false;
            }
            //判断子流程是否已添加
            if (processOrder >= processListData.length) {
                $.messager.alert("提示", "请先添加" + processOrderName + "!");
                return false;
            }
            addSubNode(processListData[processOrder]);
        });

        //新增提交
        $("#submitBtn").on("click", function () {
            submitBtn();
        });

        //新增取消
        $("#cancelBtn").on("click", function () {
            var jq = top.jQuery;
            if (jq('#tabs').tabs('exists', "申诉流程-新增")) {
                jq('#tabs').tabs('close', "申诉流程-新增");
            }
        });
    }

    //添加流程
    function addProcess() {
        var orderNoSelect = $("#orderNo"),
            orderNo = parseInt(orderNoSelect.combobox("getValue")),
            orderName = orderNoSelect.combobox("getText");
        //判断主流程是否已添加
        if (processListData.length === 0 && orderNo > 0) {
            $.messager.alert("提示", "请先添加主流程!");
            return false;
        }
        //判断子流程是否已添加
        if (orderNo < processListData.length) {
            if (orderNo === 0) {
                $.messager.alert("提示", "主流程已添加!");
            } else {
                $.messager.alert("提示", orderName + "已添加!");
            }
            return false;
        }
        //判断前置流程是否已添加
        if (orderNo > processListData.length) {
            orderNoSelect.combobox('select', processListData.length);
            var processOrderName = orderNoSelect.combobox("getText");
            $.messager.alert("提示", "请先添加" + processOrderName + "!");
            return false;
        }
        var processName = $("#processName").val();
        var departmentId = $("#departmentId").val();
        var departmentName = $("#departmentName").val();

        if (processName == null || processName === "") {
            $.messager.alert("提示", "流程名称不能为空!");
            return false;
        }
        if (departmentName == null || departmentName === "") {
            $.messager.alert("提示", "请选择部门!");
            return false;
        }
        var data = {
            "processName": processName,
            "tenantId": mainProcess.tenantId,
            "departmentId": departmentId,
            "departmentName": departmentName,
            "checkType": mainProcess.checkType,
            "mainProcessFlag": "1",
            "orderNo": orderNo,
            "orderName": orderName,
            "subProcessNum": 0,
            "subNodeNum": 0
        };
        //新增子流程
        processAddData.push(data);
        //刷新子流程列表
        processListData.push(data);
        $("#processList").datagrid("loadData", {rows: processListData});

        //更新主流程的子流程数
        mainProcess.subProcessNum++;
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
        cancelBtn.on("click", function () {
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });

        //提交
        var submitBtn = $("#subNodeSaveBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            var subNodeName = $("#subNodeName").val();
            var userNameComboTree = $("#userName");
            //审批人员名单
            var userNameArr = userNameComboTree.combotree("getText").split(",");
            var userIdArr = userNameComboTree.combotree("getValues");

            if (subNodeName == null || subNodeName === "") {
                $.messager.alert("提示", "节点名称不能为空!");
                return false;
            }
            if (userIdArr.length === 0) {
                $.messager.alert("提示", "请选审批角色!");
                return false;
            }
            //子流程已有节点数
            var subNodeNum = subProcessObj.subNodeNum;
            //子流程租户ID
            var tenantId = subProcessObj.tenantId;
            //子流程子节点列表
            var subNodeList = [];
            if (subProcessObj.hasOwnProperty("subNodeList")) {
                subNodeList = subProcessObj.subNodeList;
            }

            for (var i = 0; i < userIdArr.length; i++) {
                var data = {
                    "tenantId": tenantId,
                    "processOrder": processOrder,
                    "nodeId": subNodeNum + 1,
                    "nodeName": subNodeName,
                    "userId": userIdArr[i],
                    "userName": userNameArr[i],
                    "userType": "0",
                    "orderNo": subNodeNum + 1
                };
                //新增子节点（已有子流程的新增子节点）
                if (subProcessObj.hasOwnProperty("createTime")) {
                    data.processId = subProcessObj.processId;
                    nodeAddData.push(data);
                }
                subNodeList.push(data);
            }
            subNodeNum++;
            //更新流程列表的子节点数
            processListData[processOrder].subNodeNum = subNodeNum;
            //更新流程列表的子节点列表
            processListData[processOrder].subNodeList = subNodeList;

            //更新新增子流程
            if (!subProcessObj.hasOwnProperty("createTime")) {
                $.each(processAddData, function (index, item) {
                    if (subProcessObj.orderNo === item.orderNo) {
                        //更新新增子流程的子节点数
                        item.subNodeNum = subNodeNum;
                        //更新新增子流程的子节点列表
                        item.subNodeList = subNodeList;
                    }
                });
            }
            //更新子流程修改数据（更新子流程子节点数）
            if (subProcessObj.hasOwnProperty("createTime")) {
                for (var j = 0; j < processUpdateData.length; j++) {
                    if (processUpdateData[j].orderNo === subProcessObj.orderNo) {
                        processUpdateData.splice(j, 1);
                        break;
                    }
                }
                processUpdateData.push(processListData[processOrder]);
            }
            //刷新子节点列表
            refreshSubNodeList(subNodeList);

            //关闭弹窗
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });
    }

    //流程修改弹框
    function showProcessEditDialog(subProcessObj) {
        $("#editProcessConfig").form('clear');  //清空表单
        $("#editProcessDialog").show().window({
            width: 600,
            height: 350,
            modal: true,
            title: "流程修改"
        });
        //原流程名称
        $("#editProcessName").val(subProcessObj.processName);
        //原流程部门
        $("#editDepartName").val(subProcessObj.departmentName);
        $("#editDepartId").val(subProcessObj.departmentId);
        //取消
        var cancelBtn = $("#editProcessCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#editProcessConfig").form('clear');  //清空表单
            $("#editProcessDialog").window("close");
        });
        //提交
        var submitBtn = $("#editProcessSaveBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            var processName = $("#editProcessName").val(),
                departmentName = $("#editDepartName").val(),
                departmentId = $("#editDepartId").val();

            if (processName == null || processName === "") {
                $.messager.alert("提示", "流程名称不能为空!");
                return false;
            }
            if (departmentName == null || departmentName === "") {
                $.messager.alert("提示", "请选择部门!");
                return false;
            }
            if (processName === subProcessObj.processName && departmentId === subProcessObj.departmentId) {
                $.messager.alert("提示", "未作任何修改!");
                return false;
            }

            subProcessObj.processName = processName;
            subProcessObj.departmentName = departmentName;
            subProcessObj.departmentId = departmentId;
            //修改已有子流程
            if (subProcessObj.hasOwnProperty("createTime")) {
                for (var i = 0; i < processUpdateData.length; i++) {
                    if (processUpdateData[i].processId === subProcessObj.processId) {
                        processUpdateData.splice(i, 1);
                        break;
                    }
                }
                processUpdateData.push(subProcessObj);
            } else { //修改新增子流程
                for (var j = 0; j < processAddData.length; j++) {
                    if (processAddData[j].processId === subProcessObj.processId) {
                        processAddData[j].processName = processName;
                        processAddData[j].departmentName = departmentName;
                        processAddData[j].departmentId = departmentId;
                        break;
                    }
                }
            }
            //更新流程列表
            processListData[subProcessObj.orderNo] = subProcessObj;
            $("#processList").datagrid("loadData", {rows: processListData});
            //关闭弹窗
            $("#editProcessConfig").form('clear');  //清空表单
            $("#editProcessDialog").window("close");
        });
    }

    //子节点修改弹框
    function showNodeEditDialog(subNodeObj) {
        var nodeOrder = subNodeObj.orderNo,
            processOrder = subNodeObj.processOrder,
            nodeName = subNodeObj.nodeName,
            oldUserIdArr = subNodeObj.userId.replace(/^\s*|\s*$/g, "").split(" "),
            subProcessObj = processListData[processOrder],
            subNodeList = subProcessObj.subNodeList;
        $("#subNodeConfig").form('clear');  //清空表单
        $("#subNodeDialog").show().window({
            width: 720,
            height: 520,
            modal: true,
            title: "修改节点"
        });
        //显示子流程名称
        $("#subProcessName").val(subProcessObj.processName);
        //显示子节点名称
        $("#subNodeName").val(nodeName);
        //审批角色下拉框
        var userNameTree = $("#userName");
        userNameTree.combotree({
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
        userNameTree.combotree("setValues", oldUserIdArr);

        //取消
        var cancelBtn = $("#subNodeCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });

        //提交
        var submitBtn = $("#subNodeSaveBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            var newNodeName = $("#subNodeName").val();
            var userNameComboTree = $("#userName");
            //审批人员名单
            var newUserNameArr = userNameComboTree.combotree("getText").split(",");
            var newUserIdArr = userNameComboTree.combotree("getValues");

            if (newNodeName == null || newNodeName === "") {
                $.messager.alert("提示", "节点名称不能为空!");
                return false;
            }
            if (newUserIdArr.length === 0) {
                $.messager.alert("提示", "请选审批角色!");
                return false;
            }

            var noChangeUserIdArr = [];   //未改变的质检员

            for (var i = 0; i < oldUserIdArr.length; i++) {
                for (var j = 0; j < newUserIdArr.length; j++) {
                    if (newUserIdArr[j] === oldUserIdArr[i]) { //未改变的质检员
                        noChangeUserIdArr.push(newUserIdArr[j]);
                        oldUserIdArr.splice(i, 1);
                        newUserIdArr.splice(j, 1);
                        newUserNameArr.splice(j, 1);
                        i--;
                        j--;
                    }
                }
            }

            for (var k = 0; k < subNodeList.length; k++) {  //该子流程下所有子节点
                //排除非该子节点数据
                if (subNodeList[k].orderNo !== nodeOrder) {  //该子流程下该子节点下所有数据
                    continue;
                }
                //子节点新增
                for (var n = 0; n < newUserIdArr.length; n++) {
                    var data = {
                        "tenantId": subProcessObj.tenantId,
                        "processId": subProcessObj.processId,
                        "processOrder": processOrder,
                        "nodeId": subNodeObj.orderNo,
                        "nodeName": newNodeName,
                        "userId": newUserIdArr[n],
                        "userName": newUserNameArr[n],
                        "userType": "0",
                        "orderNo": subNodeObj.orderNo
                    };
                    //新增子节点（已有子流程的新增子节点）
                    if (subProcessObj.hasOwnProperty("createTime")) {
                        data.processId = subProcessObj.processId;
                        nodeAddData.push(data);
                    }
                    subNodeList.splice(k, 0, data);
                    newUserIdArr.splice(n, 1);
                    k++;
                    n--;
                }
                //子节点修改
                for (var l = 0; l < noChangeUserIdArr.length; l++) {
                    if (nodeName !== newNodeName) {
                        if (noChangeUserIdArr[l] === subNodeList[k].userId) {
                            subNodeList[k].nodeName = newNodeName;
                            //更新子节点（已有子流程的已有子节点）
                            if (subNodeList[k].hasOwnProperty("createTime")) {
                                for (var z = 0; z < nodeUpdateData.length; z++) {
                                    if (nodeUpdateData[z].processId === subNodeList[k].processId && nodeUpdateData[z].orderNo === subNodeList[k].orderNo && nodeUpdateData[z].userId === subNodeList[k].userId) { //防止重复修改，添加多条数据
                                        nodeUpdateData.splice(z, 1);
                                        break;
                                    }
                                }
                                nodeUpdateData.push(subNodeList[k]);
                            } else {
                                //更新子节点（已有子流程的新增子节点）
                                if (subProcessObj.hasOwnProperty("createTime")) {
                                    for (var x = 0; x < nodeAddData.length; x++) {
                                        if (nodeAddData[x].processOrder === processOrder && nodeAddData[x].orderNo === subNodeList[k].orderNo && nodeAddData[x].userId === subNodeList[k].userId) {
                                            nodeAddData.splice(x, 1);
                                            break;
                                        }
                                    }
                                    nodeAddData.push(subNodeList[k]);
                                }
                            }
                            break;
                        }
                    }
                }
                //子节点删除
                for (var m = 0; m < oldUserIdArr.length; m++) {
                    if (oldUserIdArr[m] === subNodeList[k].userId) {
                        //删除子节点（已有子流程的已有子节点）
                        if (subNodeList[k].hasOwnProperty("createTime")) {
                            nodeDelData.push(subNodeList[k]);
                        } else {
                            //删除子节点（已有子流程的新增子节点）
                            if (subProcessObj.hasOwnProperty("createTime")) {
                                for (var y = 0; y < nodeAddData.length; y++) {
                                    if (nodeAddData[y].processOrder === processOrder && nodeAddData[y].orderNo === subNodeList[k].orderNo && nodeAddData[y].userId === subNodeList[k].userId) {
                                        nodeAddData.splice(y, 1);
                                        break;
                                    }
                                }
                            }
                        }
                        subNodeList.splice(k, 1);
                        oldUserIdArr.splice(m, 1);
                        k--;
                        break;
                    }
                }
            }
            //更新新增子流程的子节点
            $.each(processAddData, function (index, item) {
                if (subProcessObj.orderNo === item.orderNo) {
                    item.subNodeList = subNodeList;
                }
            });
            //更新流程列表的子节点列表
            processListData[processOrder].subNodeList = subNodeList;

            //刷新子节点列表
            refreshSubNodeList(subNodeList);

            //关闭弹窗
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });
    }

    //申诉流程修改-提交
    function submitBtn() {
        if (processAddData.length === 0 && processDelData.length === 0 && processUpdateData.length === 0 && nodeAddData.length === 0 && nodeDelData.length === 0 && nodeUpdateData.length === 0) {
            $.messager.alert("提示", "未作任何修改!");
            return false;
        }
        //更新主流程信息
        for (var i = 0; i < processUpdateData.length; i++) {
            if (processUpdateData[i].orderNo === 0) {
                mainProcess.processName = processUpdateData[i].processName;
                mainProcess.departmentId = processUpdateData[i].departmentId;
                mainProcess.departmentName = processUpdateData[i].departmentName;

                processUpdateData.splice(i, 1);
            }
        }
        processUpdateData.push(mainProcess);

        var params = {
            "mainProcessId": mainProcess.processId,
            "processAddData": processAddData,
            "processDelData": processDelData,
            "processUpdateData": processUpdateData,
            "nodeAddData": nodeAddData,
            "nodeDelData": nodeDelData,
            "nodeUpdateData": nodeUpdateData
        };
        debugger;
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.APPEAL_PROCESS_CONFIG_DNS).concat("/"), JSON.stringify(params), function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {   //修改成功
                $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                    var jq = top.jQuery;
                    //刷新申诉流程tab页
                    jq('#tabs').tabs('close', "申诉流程-修改");
                    var tab = jq('#tabs').tabs('getTab', "申诉流程"),
                        iframe = jq(tab.panel('options').content),
                        content = '<iframe scrolling="auto" frameborder="0"  src="' + iframe.attr('src') + '" style="width:100%;height:100%;"></iframe>';
                    jq('#tabs').tabs('update', {
                        tab: tab,
                        options: {content: content, closable: true}
                    });
                });
            } else {  //修改失败
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            }
        });
    }

    //查询子节点列表（subProcessObj子流程对象）
    function queryNodeList(subProcessObj) {
        //查询已有子节点列表
        if (!subProcessObj.hasOwnProperty("createTime")) {   //新增子流程则返回
            return;
        }
        var start = "0";
        var pageNum = "0";
        var processId = subProcessObj.processId;

        var reqParams = {
            "processId": processId
        };
        var params = $.extend({
            "start": start,
            "pageNum": pageNum,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.APPEAL_NODE_CONFIG_DNS + "/queryAppealNode", params, function (result) {
            var rspCode = result.RSP.RSP_CODE,
                rspData = result.RSP.DATA;
            if (rspCode != null && rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
            }
            //更新processListData的子节点列表
            $.each(rspData, function (index, item) {
                item.processOrder = subProcessObj.orderNo;
            });
            processListData[subProcessObj.orderNo].subNodeList = rspData;
            //刷新子节点列表
            refreshSubNodeList(rspData);
        });
    }

    //子节点列表刷新（同一节点合并到同一行）
    function refreshSubNodeList(subNodeList) {
        debugger;
        var subNodeTable = $("#subNodeList");
        //为空时返回
        if (subNodeList.length === 0) {
            subNodeTable.datagrid("loadData", {rows: []});
            return false;
        }
        //刷新（页面）子节点列表,将同一节点合并到一行
        var subNodeData = [],
            nodeOrder = 1,
            userNameStr = "",
            userIdStr = "",
            showData = {};
        for (var j = 0; j < subNodeList.length; j++) {
            if (subNodeList[j].orderNo === nodeOrder) {
                userNameStr = userNameStr + subNodeList[j].userName + " ";
                userIdStr = userIdStr + subNodeList[j].userId + " ";
            } else {
                showData = {
                    "processOrder": subNodeList[j - 1].processOrder,
                    "processName": subNodeList[j - 1].processName,
                    "orderNo": subNodeList[j - 1].orderNo,
                    "nodeName": subNodeList[j - 1].nodeName,
                    "userName": userNameStr,
                    "userId": userIdStr
                };
                subNodeData.push(showData);
                //重置nodeOrder
                nodeOrder = subNodeList[j].orderNo;
                userNameStr = "";
                userIdStr = "";
                j--;
            }
        }
        showData = {
            "processOrder": subNodeList[j - 1].processOrder,
            "processName": subNodeList[subNodeList.length - 1].processName,
            "orderNo": subNodeList[subNodeList.length - 1].orderNo,
            "nodeName": subNodeList[subNodeList.length - 1].nodeName,
            "userName": userNameStr,
            "userId": userIdStr
        };
        subNodeData.push(showData);
        subNodeTable.datagrid("loadData", {rows: subNodeData});
    }

    //下拉框数据重载
    function reloadSelectData(paramsType, select, showAll) {
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "paramsTypeId": paramsType
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode === "1") {
                var selectData = result.RSP.DATA;
                if (showAll) {
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    selectData.unshift(data);
                }
                $("#" + select).combobox('loadData', selectData);
                if (paramsType === "PROCESS_LEVEL") {
                    orderData = selectData;
                }
            }
        });
    }

    //获取url对象
    function getRequestObj() {
        var url = decodeURI(decodeURI(location.search)); //获取url中"?"符后的字串，使用了两次decodeRUI解码
        var requestObj = {};
        if (url.indexOf("?") > -1) {
            var str = url.substr(1),
                strArr = str.split("&");
            for (var i = 0; i < strArr.length; i++) {
                requestObj[strArr[i].split("=")[0]] = unescape(strArr[i].split("=")[1]);
            }
            return requestObj;
        }
    }

    //流程序号转流程顺序下拉框对应paramsCode（0转"00"）
    function orderToParamsCode(order) {
        if (order === 10) {
            return '10';
        } else {
            return '0' + order;
        }
    }

    return {
        initialize: initialize
    };
});