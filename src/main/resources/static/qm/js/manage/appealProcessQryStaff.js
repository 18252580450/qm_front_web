define([
        "text!html/manage/appealProcessQryStaff.tpl", "jquery", 'util', "commonAjax", "transfer", "easyui", "crossAPI", "dateUtil", "ztree-exedit"],
    function (qryQmPeopleTpl, $, Util, CommonAjax, Transfer, easyui, crossAPI, dateUtil) {

        var $el,
            zNodes = [], //工作组信息
            staffListData = [], //人员信息
            listData = [],
            checkStaff = {},
            isCall = false,
            treeObj;

        function initialize() {
            $el = $(qryQmPeopleTpl);
            initGrid();//初始化列表
            initGlobalEvent();
            showTree();
            this.$el = $el;
        }

        //zTree的配置信息
        var setting = {
            view: {
                selectedMulti: false//是否支持同时选中多个节点
            },
            data: {
                key: {
                    //将treeNode的checkItemName属性当做节点名称
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
                onClick: function (e, id, node) {//点击事件
                    var newArr = [];
                    if (node.isParent === false) {//判断是否点击的是父节点
                        newArr = listData.filter(function (item, index) {
                            if (item.GROUP_ID === node.GROUP_ID) {
                                return item;
                            }
                        });
                    } else {
                        var allChildrenNodesIdSet = new Set();
                        allChildrenNodesIdSet.add(node.GROUP_ID);
                        allChildrenNodesIdSet = getAllChildrenNodes(node, allChildrenNodesIdSet);
                        allChildrenNodesIdSet.forEach(function (childrenValue, childrenIndex, childrenArr) {
                            listData.forEach(function (listDataValue, listDataIndex, listDataArr) {
                                if (childrenValue === listDataValue.GROUP_ID) {
                                    newArr.push(listDataValue);
                                }
                            });
                        });
                    }
                    treeObj = $.fn.zTree.getZTreeObj("tree");
                    setFirstPage();
                    var data = {"total": newArr.length, "rows": newArr};
                    $("#page", $el).find("#checkStaffInfo").datagrid("loadData", data);
                    pagination(data);
                    isCall = false;
                }
            }
        };

        //返回第一页
        function setFirstPage() {
            var opts = $("#page", $el).find("#checkStaffInfo").datagrid('options');
            var pager = $("#page", $el).find("#checkStaffInfo").datagrid('getPager');
            opts.pageNumber = 1;
            pager.pagination('refresh', {
                pageNumber: 1,
                pageSize: opts.pageSize
            });
        }

        //分页控件
        function pagination(data) {
            var p = $("#page", $el).find("#checkStaffInfo").datagrid("getPager");
            p.pagination({
                total: data.rows.length,
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                onSelectPage: function (pageNo, pageSize) {
                    if (isCall) {
                        data = {"rows": listData};
                    }
                    var start = (pageNo - 1) * pageSize;
                    var end = start + pageSize;
                    $("#page", $el).find("#checkStaffInfo").datagrid("loadData", data.rows.slice(start, end));
                    p.pagination({
                        total: data.rows.length,
                        pageNumber: pageNo
                    });
                }
            });
        }

        //递归获取该节点下所有的子节点的id
        function getAllChildrenNodes(node, allChildrenNodesIdSet) {
            if (node.isParent) {
                var childrenNodes = node.children;
                if (childrenNodes) {
                    for (var i = 0; i < childrenNodes.length; i++) {
                        allChildrenNodesIdSet.add(childrenNodes[i].GROUP_ID);
                        getAllChildrenNodes(childrenNodes[i], allChildrenNodesIdSet);
                    }
                }
            }
            return allChildrenNodesIdSet;
        }

        function showTree() {
            if (zNodes.length > 0) {
                $.fn.zTree.init($("#tree", $el), setting, zNodes);
                return;
            }
            var reqParams = {
                "parentId": "",
                "groupId": "",
                "groupName": "",
                "provCode": ""
            };
            var param = {"params": JSON.stringify(reqParams)};
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getWorkList", param, function (result) {
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
                $.fn.zTree.init($("#tree", $el), setting, zNodes);
            });
        }

        //初始化列表
        function initGrid() {
            //质检人员信息
            $("#page", $el).find("#checkStaffInfo").datagrid({
                columns: [[
                    {field: 'ck', checkbox: true , align: 'center'},
                    {field: 'STAFF_ID', title: '工号', width: '15%'},
                    {field: 'STAFF_NAME', title: '姓名', width: '15%'},
                    {field: 'GROUP_NAME', title: '工作组', width: '15%'},
                    {field: 'EMAIL', title: '邮箱', width: '20%'},
                    {field: 'PHONE', title: '电话', width: '20%'},
                    {field: 'ROLE_CODE', title: '角色', width: '15%'}
                ]],
                fitColumns: true,
                height: 400,
                pagination: true,
                singleSelect: true,
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                rownumbers: false,
                loader: function (param, success) {
                    //取消树节点选中状态
                    if (treeObj) {
                        var nodes = treeObj.getSelectedNodes();
                        if (nodes.length > 0) {
                            treeObj.cancelSelectedNode(nodes[0]);
                        }
                    }
                    if (staffListData.length > 0) {
                        var data = {"rows": staffListData[0].jsonArray, "total": staffListData[0].totalAll};
                        success(data);
                        return;
                    }
                    var addCheckStaffId = $("#addCheckStaffId", $el).val();
                    var reqParams = {
                        "groupId": "",
                        "staffName": addCheckStaffId,
                        "staffId": "",
                        "start": param.page,
                        "limit": param.rows,
                        "provCode": "",
                        "roleCode": ""
                    };
                    var params = {
                        "params": JSON.stringify(reqParams)
                    };

                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
                        var data = {"rows": result.RSP.DATA[0].jsonArray, "total": result.RSP.DATA[0].totalAll};
                        staffListData = result.RSP.DATA;
                        listData = result.RSP.DATA[0].jsonArrayAll;
                        success(data);
                    });
                }
            });
        }

        //初始化事件
        function initGlobalEvent() {
            //查询
            $("#searchForm", $el).on("click", "#searchBtn", function () {
                isCall = true;
                $("#page", $el).find("#checkStaffInfo").datagrid("load");
            });

            //确定
            $("#confirm", $el).on("click", function () {
                var selectedData = $("#checkStaffInfo", $el).datagrid("getSelected");
                if (selectedData === null) {
                    $.messager.alert('警告', '请选择审批人！');
                    return;
                }
                checkStaff = selectedData;

                $('#processQryStaffWindow').window('close'); // 成功后，销毁窗口（注意：用close会会对原先已有的dom结构造成影响）
            });


            //关闭窗口
            $("#close", $el).on("click", function () {
                $("#searchForm", $el).form('clear');
                $("#checkStaffInfo", $el).datagrid('clearChecked');//清除所有勾选状态
                $("#processQryStaffWindow").window("close");// 成功后，关闭窗口
            });
        }

        function getCheckStaff() {
            return checkStaff;
        }

        return {
            initialize: initialize,
            getCheckStaff: getCheckStaff
        };
    });
