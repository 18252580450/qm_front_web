require(["jquery", 'util', "dateUtil", "easyui"], function ($, Util) {

    var checkTypeData = [],    //质检类型静态数据
        subNodeData = [];      //子节点数据

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        var appealProcess = getRequestObj();
        //主流程基本信息
        $("#detailProcessName").val(appealProcess.processName);
        $("#departmentName").val(appealProcess.departmentName);
        //查询质检类型
        var checkType = "";
        if (checkTypeData.length !== 0) {
            for (var i = 0; i < checkTypeData.length; i++) {
                if (checkTypeData[i].paramsCode === appealProcess.checkType) {
                    checkType = checkTypeData[i].paramsName;
                    $("#checkType").val(checkType);
                    break;
                }
            }
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
                        for (var i = 0; i < checkTypeData.length; i++) {
                            if (checkTypeData[i].paramsCode === appealProcess.checkType) {
                                checkType = checkTypeData[i].paramsName;
                                $("#checkType").val(checkType);
                                break;
                            }
                        }
                    }
                }
            });
        }

        //子流程列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#subProcessList").datagrid({
            columns: [[
                {field: 'orderNo', title: '流程顺序', width: '10%'},
                {field: 'processId', title: '流程编码', width: '20%'},
                {field: 'processName', title: '流程名称', width: '20%'},
                {field: 'departmentName', title: '部门', width: '20%'},
                {
                    field: 'createTime', title: '创建时间', width: '20%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if (row.createTime != null) {
                            var createTime = DateUtil.formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
                    }
                },
                {field: 'createStaffId', title: '创建工号', width: '10%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 150,
            pagination: false,
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#subProcessList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#subProcessList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = "0";
                var pageNum = "0";
                var parentProcessId = appealProcess.processId;

                var reqParams = {
                    "mainProcessFlag": "1",
                    "parentProcessId": parentProcessId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

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
                    success(data);
                });
            },
            onClickRow: function (index, data) {
                //刷新子节点列表
                for (var i = 0; i < subNodeData.length; i++) {
                    if (subNodeData[i].processId === data.processId && subNodeData[i].subNodeList != null) {
                        refreshSubNodeList(subNodeData[i].subNodeList);
                        return;
                    }
                }
                //查询子节点列表
                var start = "0";
                var pageNum = "0";
                var processId = data.processId;

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
                    refreshSubNodeList(rspData);

                    //更新子节点数据
                    var data = {};
                    data.processId = processId;
                    data.subNodeList = rspData;
                    subNodeData.push(data);
                });
            }
        });

        //子节点列表
        var IsNodeCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#subNodeList").datagrid({
            columns: [[
                {field: 'orderNo', title: '节点序号', width: '10%'},
                {field: 'processId', title: '流程编码', width: '20%'},
                {field: 'nodeName', title: '节点名称', width: '20%'},
                {field: 'userName', title: '角色', width: '50'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 200,
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
            }
        });
    }

    function initEvent() {
        //取消
        $("#detailCancelBtn").on("click", function () {
            parent.document.getElementById("#processDetailDialog").window('close');
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

    //子节点列表刷新（同一节点合并到同一行）
    function refreshSubNodeList(subNodeList) {
        var subNodeTable = $("#subNodeList");
        //为空时返回
        if (subNodeList.length === 0) {
            subNodeTable.datagrid("loadData", {rows: []});
            return false;
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
            "orderNo": subNodeList[subNodeList.length - 1].orderNo,
            "nodeName": subNodeList[subNodeList.length - 1].nodeName,
            "userName": userNameStr
        };
        subNodeData.push(showData);
        subNodeTable.datagrid("loadData", {rows: subNodeData});
    }

    return {
        initialize: initialize
    };
});