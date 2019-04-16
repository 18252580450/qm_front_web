require([
    "js/manage/appealProcessQryDepart",
    "jquery", 'util', "transfer", "commonAjax", "easyui"], function (QueryDepart, $, Util, Transfer, CommonAjax) {

    var staffInfo,                  //员工信息
        appealProcessData = [],     //新增流程（新增提交入参）
        checkTypeData = [],         //质检类型静态数据
        appealProcessUrl = Util.constants.NGIX_URL_CONTEXT + "/qm/html/manage/appealProcessManage.html";

    initialize();

    function initialize() {
        CommonAjax.getUrlParams(function (data) {
            staffInfo = data;
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {
        $("#processName").validatebox();
        //模板渠道下拉框
        $("#tenantType").combobox({
            url: '../../data/tenant_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
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

        //部门搜索框
        var department = $("#departmentName");
        department.searchbox({
                editable: false,//禁止手动输入
                searcher: function () {
                    var queryDepart = QueryDepart;
                    queryDepart.initialize();
                    $('#processQryDepartWindow').show().window({
                        title: '部门信息',
                        width: 750,
                        height: 500,
                        cache: false,
                        content: queryDepart.$el,
                        modal: true,
                        onClose: function () {//弹框关闭前触发事件
                            var checkDepart = queryDepart.getDepartment();//获取部门信息
                            department.searchbox("setValue", checkDepart.departmentName);
                            $("#departmentId").val(checkDepart.departmentId);
                        }
                    });
                }
            }
        );
        department.validatebox();

        //质检类型下拉框
        $("#checkType").combobox({
            url: '../../data/select_init_data.json',
            method: "GET",
            valueField: 'paramsCode',
            textField: 'paramsName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var tenantType = $("#checkType");
                var data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].paramsCode);
                }
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
            }
        });
        //重载下拉框数据
        reloadSelectData("CHECK_TYPE", "checkType", false);

        //流程顺序下拉框
        $("#orderNo").combobox({
            url: '../../data/select_init_data.json',
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
                $("#processName").val("");
                //新增子流程时，禁用渠道和质检类型下拉框，保证子流程渠道和质检类型和主流程保持一致
                var orderNo = $("#orderNo").combobox("getValue");
                if (orderNo === "00") {
                    $("#departmentName").combotree('enable');
                    $("#tenantType").combobox('enable');
                    $("#checkType").combobox('enable');
                    $("#maxAppealNum").attr("readOnly", false)
                } else {
                    $("#departmentName").combotree('disable');
                    $("#tenantType").combobox('disable');
                    $("#checkType").combobox('disable');
                    $("#maxAppealNum").attr("readOnly", true);
                }
                //切换子流程时同时刷新子节点列表
                if (orderNo === "-1" || orderNo === "00" || parseInt(orderNo) >= appealProcessData.length) {
                    $("#subNodeList").datagrid("loadData", {rows: []});
                } else {
                    var subNodeList = appealProcessData[parseInt(orderNo)].subNodeList;
                    refreshSubNodeList(subNodeList);
                }
            }
        });
        //重载下拉框数据
        reloadSelectData("PROCESS_LEVEL", "orderNo", false);

        //申诉流程添加列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#processList").datagrid({
            columns: [[
                {field: 'orderName', title: '流程顺序', width: '20%'},
                {field: 'orderNo', title: '流程序号', hidden: true},
                {field: 'processName', title: '流程名称', width: '20%'},
                {field: 'departmentName', title: '部门', width: '20%'},
                {field: 'departmentId', title: '部门Id', hidden: true},
                {
                    field: 'checkType', title: '质检类型', width: '20%',
                    formatter: function (value, row, index) {
                        var itemType = "";
                        if (checkTypeData.length !== 0) {
                            for (var i = 0; i < checkTypeData.length; i++) {
                                if (checkTypeData[i].paramsCode === value) {
                                    itemType = checkTypeData[i].paramsName;
                                    break;
                                }
                            }
                        }
                        return itemType;
                    }
                },
                {
                    field: 'operation', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        //只允许删除主流程和最后一个子流程
                        if (parseInt(row.orderNo) === 0 || parseInt(row.orderNo) === appealProcessData.length - 1) {
                            return '<a href="javascript:void(0);" class="list_operation_color" id = "appealProcess' + row.orderNo + '">删除</a>';
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
            onLoadSuccess: function (data) {
                //绑定流程删除事件
                $.each(data.rows, function (i, item) {
                    //删除主流程，子流程将被全部删除
                    if (parseInt(item.orderNo) === 0) {
                        $("#appealProcess" + item.orderNo).on("click", function () {
                            if (appealProcessData.length === 1) {
                                appealProcessData = [];
                                $("#processList").datagrid("loadData", {rows: appealProcessData});
                            } else {
                                $.messager.confirm('确认删除弹窗', '子流程将被全部删除! 确定删除主流程？', function (confirm) {
                                    if (confirm) {
                                        appealProcessData = [];
                                        $("#processList").datagrid("loadData", {rows: appealProcessData});
                                        $("#subNodeList").datagrid("loadData", {rows: []});
                                    }
                                });
                            }
                        });
                    }
                    //末子流程才允许被删除
                    if (parseInt(item.orderNo) === appealProcessData.length - 1) {
                        $("#appealProcess" + item.orderNo).on("click", function () {
                            appealProcessData.splice(appealProcessData.length - 1, 1);
                            //刷新流程列表
                            $("#processList").datagrid("loadData", {rows: appealProcessData});
                            //刷新子节点列表（当前展示的子节点的父流程被删除时）
                            var orderNoSelect = $("#orderNo");
                            if (item.orderNo === orderNoSelect.combobox("getValue")) {
                                if (item.orderNo !== "00") {
                                    orderNoSelect.combobox("setValue", appealProcessData[parseInt(item.orderNo) - 1].orderNo);
                                }
                                var subNodeList = appealProcessData[parseInt(item.orderNo) - 1].subNodeList;
                                refreshSubNodeList(subNodeList);
                            }
                        });
                    }
                });
            },
            onClickRow: function (index, data) {
                //点击子流程行刷新子节点列表
                var subNodeList = data.subNodeList;
                refreshSubNodeList(subNodeList);
                //刷新选择流程下拉框
                $("#orderNo").combobox("setValue", data.orderNo);
            }
        });

        //申诉节点添加列表
        var IsNodeCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#subNodeList").datagrid({
            columns: [[
                {field: 'processId', title: '子流程序号', hidden: true},
                {field: 'processName', title: '子流程', hidden: true},
                {field: 'orderNo', title: '节点序号', width: '15%'},
                {field: 'nodeName', title: '节点名称', width: '25%'},
                {field: 'userName', title: '审批人', width: '50'},
                {
                    field: 'detail', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        //只允许删除末子节点
                        var subNodeList = appealProcessData[parseInt(row.processId)].subNodeList;
                        if (parseInt(row.orderNo) === subNodeList[subNodeList.length - 1].orderNo) {
                            return '<a href="javascript:void(0);" id = "appealNode' + row.orderNo + '" style="color: black;">删除</a>';
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
                //绑定子节点删除事件
                $.each(data.rows, function (i, item) {
                    //末子节点才允许被删除
                    var subNodeList = appealProcessData[parseInt(item.processId)].subNodeList;
                    if (parseInt(item.orderNo) === subNodeList[subNodeList.length - 1].orderNo) {
                        $("#appealNode" + item.orderNo).on("click", function () {
                            //删除末子节点（多条数据）
                            for (var i = 0; i < subNodeList.length; i++) {
                                if (subNodeList[i].orderNo === item.orderNo) {
                                    //删除所有序号为item.orderNo的节点
                                    subNodeList.splice(i, subNodeList.length - i + 1);
                                    break;
                                }
                            }
                            //更新子流程的子节点列表
                            appealProcessData[parseInt(item.processId)].subNodeList = subNodeList;
                            //更新子流程的子节点数
                            appealProcessData[parseInt(item.processId)].subNodeNum--;
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
            var orderNo = $("#orderNo"),
                processOrder = orderNo.combobox("getValue"),
                processOrderName = orderNo.combobox("getText");
            //主流程则返回
            if (processOrder === "00") {
                $.messager.alert("提示", '主流程不允许添加子节点！');
                return;
            }
            //判断子流程是否已添加
            if (parseInt(processOrder) >= appealProcessData.length) {
                $.messager.alert("提示", "请先添加" + processOrderName + "!");
                return;
            }
            addSubNode(appealProcessData[parseInt(processOrder)]);
        });

        //新增提交
        $("#submitBtn").on("click", function () {
            createProcess();
        });

        //新增取消
        $("#cancelBtn").on("click", function () {
            CommonAjax.closeMenuByNameAndId("申诉流程新增", "申诉流程新增");
        });

    }

    //添加流程
    function addProcess() {
        var orderNoSelect = $("#orderNo"),
            orderNo = orderNoSelect.combobox("getValue"),
            orderName = orderNoSelect.combobox("getText"),
            maxAppealNum = $("#maxAppealNum").val();
        //判断主流程是否已添加
        if (appealProcessData.length === 0 && parseInt(orderNo) > 0) {
            $.messager.alert("提示", "请先添加主流程!");
            return;
        }
        //判断子流程是否已添加
        if (parseInt(orderNo) < appealProcessData.length) {
            if (orderNo === "00") {
                $.messager.alert("提示", "主流程已添加!");
            } else {
                $.messager.alert("提示", orderName + "已添加!");
            }
            return;
        }
        //判断前置流程是否已添加
        if (parseInt(orderNo) > appealProcessData.length) {
            orderNoSelect.combobox('select', appealProcessData.length);
            var processOrderName = orderNoSelect.combobox("getText");
            $.messager.alert("提示", "请先添加" + processOrderName + "!");
            return;
        }

        var processName = $("#processName").val(),
            departmentId = $("#departmentId").val(),
            departmentName = $("#departmentName").val(),
            checkType = $("#checkType").combobox("getValue"),
            mainProcessFlag = "0";
        if (parseInt(orderNo) > 0) {
            //更新主流程的子流程数
            appealProcessData[0].subProcessNum = parseInt(orderNo);
            //子流程的主流程标识设为"1"
            mainProcessFlag = "1";
        }

        if (processName == null || processName === "") {
            $.messager.alert("提示", "流程名称不能为空!");
            return;
        }
        if (departmentName == null || departmentName === "") {
            $.messager.alert("提示", "请选择部门!");
            return;
        }
        var data = {
            "processName": processName,
            "tenantId": Util.constants.TENANT_ID,
            "createStaffId": staffInfo.staffId,
            "departmentId": departmentId,
            "departmentName": departmentName,
            "checkType": checkType,
            "mainProcessFlag": mainProcessFlag,
            "maxAppealNum": maxAppealNum,
            "orderNo": orderNo,
            "orderName": orderName,
            "subProcessNum": 0,
            "subNodeNum": 0,
            "subNodeList": []
        };
        appealProcessData.push(data);
        $("#processList").datagrid("loadData", {rows: appealProcessData});
    }

    //新增子节点，subProcessObj父流程对象
    function addSubNode(subProcessObj) {
        var processOrder = subProcessObj.orderNo,
            processOrderName = subProcessObj.orderName;
        //新增节点弹框
        $("#subNodeConfig").form('clear');  //清空表单
        $("#subNodeDialog").show().window({
            width: 600,
            height: 400,
            modal: true,
            title: "添加节点"
        });
        $("#subNodeName").validatebox();
        //显示子流程名称
        $("#subProcessName").val(subProcessObj.processName);
        //审批角色下拉框
        var userNameInput = $("#userName");
        userNameInput.searchbox({
                editable: false,//禁止手动输入
                searcher: function () {
                    require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                        var queryQmPeople = qryQmPeople;
                        queryQmPeople.initialize("", "", "");
                        $('#qry_people_window').show().window({
                            title: '审批人员信息',
                            width: Util.constants.DIALOG_WIDTH,
                            height: Util.constants.DIALOG_HEIGHT,
                            cache: false,
                            content: queryQmPeople.$el,
                            modal: true,
                            onBeforeClose: function () {//弹框关闭前触发事件
                                var checkStaff = queryQmPeople.getMap();//获取审批人员信息
                                userNameInput.searchbox("setValue", checkStaff.staffName);
                                $("#userId").val(checkStaff.staffId);
                            }
                        });
                    });
                }
            }
        );
        userNameInput.validatebox();
        //取消
        var cancelBtn = $("#subNodeCancelBtn");
        cancelBtn.unbind("click");
        cancelBtn.on("click", function () {
            $("#subNodeConfig").form('clear');  //清空表单
            $("#subNodeDialog").window("close");
        });
        //提交
        var submitBtn = $("#subNodeAddBtn");
        submitBtn.unbind("click");
        submitBtn.on("click", function () {
            var subNodeName = $("#subNodeName").val(),
                userName = $("#userName").val(), //审批人员名单
                userId = $("#userId").val(),
                userNameArr = [],
                userIdArr = [];

            if (userName !== "") {
                userNameArr.push(userName);
            }
            if (userId !== "") {
                userIdArr.push(userId);
            }
            if (subNodeName == null || subNodeName === "") {
                $.messager.alert("提示", "节点名称不能为空!");
                return;
            }
            if (userNameArr.length === 0 || userIdArr.length === 0) {
                $.messager.alert("提示", "请选择审批角色!");
                return;
            }
            //子流程已有节点数
            var subNodeNum = subProcessObj.subNodeNum;
            //子流程租户ID
            var tenantId = subProcessObj.tenantId;
            //子流程子节点列表
            var subNodeList = subProcessObj.subNodeList;
            for (var i = 0; i < userIdArr.length; i++) {
                var data = {
                    "tenantId": Util.constants.TENANT_ID,
                    "processId": processOrder,
                    "processName": processOrderName,
                    "nodeId": subNodeNum + 1,
                    "nodeName": subNodeName,
                    "userId": userIdArr[i],
                    "userName": userNameArr[i],
                    "userType": "0",
                    "orderNo": subNodeNum + 1
                };
                subNodeList.push(data);
            }
            subNodeNum++;
            //更新父流程的子节点数
            appealProcessData[parseInt(processOrder)].subNodeNum = subNodeNum;
            //更新父流程的子节点列表
            appealProcessData[parseInt(processOrder)].subNodeList = subNodeList;

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
        if (appealProcessData.length === 0 || appealProcessData[0] == null) {
            $.messager.alert("提示", "请添加主流程!");
            return;
        }
        var maxAppealNum = $("#maxAppealNum").val();
        if (parseInt(maxAppealNum) > 3) {
            $.messager.alert("提示", "最大申诉次数不能超过3!");
            return;
        }

        if (appealProcessData.length < 2 || appealProcessData[1].subNodeList.length === 0) {
            $.messager.alert("提示", "请至少添加一个子流程和一个子节点!");
            return;
        }

        var params = {
            "appealProcess": appealProcessData
        };
        Util.loading.showLoading();
        Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.APPEAL_PROCESS_CONFIG_DNS).concat("/"), JSON.stringify(params), function (result) {
            Util.loading.destroyLoading();
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode != null && rspCode === "1") {   //新增成功
                $.messager.alert("提示", result.RSP.RSP_DESC, null, function () {
                    CommonAjax.closeMenuByNameAndId("申诉流程新增", "申诉流程新增");
                    CommonAjax.refreshMenuByUrl(appealProcessUrl, "申诉流程", "申诉流程");
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
        var subNodeTable = $("#subNodeList");
        //为空时返回
        if (subNodeList.length === 0) {
            subNodeTable.datagrid("loadData", {rows: []});
            return;
        }
        //刷新（页面）子节点列表,将同一节点合并到一行
        var subNodeData = [];
        var nodeOrder = 1;
        var userNameStr = "";
        var showData = {};
        for (var j = 0; j < subNodeList.length; j++) {
            if (subNodeList[j].orderNo === nodeOrder) {
                userNameStr = userNameStr + subNodeList[j].userName + " ";
            } else {
                showData = {
                    "processId": subNodeList[j - 1].processId,
                    "processName": subNodeList[j - 1].processName,
                    "orderNo": subNodeList[j - 1].orderNo,
                    "nodeName": subNodeList[j - 1].nodeName,
                    "userName": userNameStr
                };
                subNodeData.push(showData);
                //重置nodeOrder
                nodeOrder = subNodeList[j].orderNo;
                userNameStr = "";
                j--;
            }
        }
        showData = {
            "processId": subNodeList[j - 1].processId,
            "processName": subNodeList[subNodeList.length - 1].processName,
            "orderNo": subNodeList[subNodeList.length - 1].orderNo,
            "nodeName": subNodeList[subNodeList.length - 1].nodeName,
            "userName": userNameStr
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
                if (paramsType === "CHECK_TYPE") {
                    checkTypeData = selectData;
                }
            }
        });
    }

    return {
        initialize: initialize
    };
});