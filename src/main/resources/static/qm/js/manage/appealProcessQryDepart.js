define([
        "text!html/manage/appealProcessQryDepart.tpl", "jquery", 'util', "commonAjax", "transfer", "easyui", "crossAPI", "dateUtil", "ztree-exedit"],
    function (qryDepartTpl, $, Util, CommonAjax, Transfer, easyui, crossAPI, dateUtil) {

        var $el,
            zNodes = [], //工作组信息
            checkDepart = {};

        function initialize() {
            $el = $(qryDepartTpl);
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
                    if (node.isParent) {
                        return;
                    }
                    $("#checkDepartId", $el).val(node.GROUP_ID);
                    $("#checkDepartName", $el).val(node.GROUP_NAME);
                }
            }
        };

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

        //初始化事件
        function initGlobalEvent() {
            //确定
            $("#confirm", $el).on("click", function () {
                var checkDepartName = $("#checkDepartName", $el).val();
                if (checkDepartName === "") {
                    $.messager.alert('警告', '请选择部门！');
                    return;
                }
                checkDepart.departmentId = $("#checkDepartId", $el).val();
                checkDepart.departmentName = $("#checkDepartName", $el).val();
                $('#processQryDepartWindow').window('close');
            });


            //关闭窗口
            $("#page", $el).on("click", "#close", function () {
                $("#processQryDepartWindow").window("close");// 成功后，关闭窗口
            });
        }

        function getDepartment() {
            return checkDepart;
        }

        return {
            initialize: initialize,
            getDepartment: getDepartment
        };
    });
