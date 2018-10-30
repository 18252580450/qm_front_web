/**
 * 技能配置样例
 */
define(["jquery", "loading", 'util', "transfer", "easyui", 'ztree-exedit', "js/manage/modifyTaglib"], function ($, Loading, Util, Transfer, easyui, ztree, modifyTaglib) {

    var $page, $search, $treeObject;//全局树对象

    var rootNode;//根节点

    var currentSelectNode;//当前选择的节点

    var oldName;//节点老名称

    var newName;//节点新名称

    var superNode;//父节点

    var regnId;//地区ID

    var regnNm;//地区名称
    //初始化
    initialize();

    function initialize() {
        console.log("进入js");
        $page = $("<div></div>").appendTo($("#page_content"));
        $(document).find("#layout_content").layout();
        //初始化布局
        initTaglibLayout();
        //通过地区regn_id获取地区名称
        initRegnNm();
        //初始化列表
        initGrid();
        //初始化标签目录(树结构)
        initMenuTree();
        initGlobalEvent();
    };

    //通过登录员的账号获取本地城市ID，然后查询获取地区名称
    function initRegnNm(){
        //regnID从当前登录信息中获取
        regnId = "210";
        var params = {regnId: regnId};
        $.ajax({
            url: Util.constants.CONTEXT + "/kc/manage/distsvc/msa/query",
            type: "POST",//请求方式
            async: false,//是否异步
            data: params,//请求参数
            dataType: "json",
            success: function (result) {
                // regnNm = result['resultMsg'].REGNNM;
                if(result.RSP.DATA[0]){
                    regnNm = result.RSP.DATA[0].REGNNM;
                }else{
                    regnNm = "全国";
                }
            },
            error: function (result) {
                return; 
            }
        });
        console.log("当前城市ID：" + regnId + ",当前城市名称：" + regnNm);
        //为地区框赋值
        $search.find("input.easyui-textbox[name='regnId']").val(regnNm);
    }

    /**
     * 标签库管理
     */
    function initTaglibLayout() {
        $search = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>标签库管理</div>",
            "</div>",
            "</div>",
            "</div>",
            "<div class='panel-search'>",
            "<form class='form form-horizontal' id='searchForm'>",

            "<div class='row cl'>",
            "<label class='form-label col-2' >地区编号：</label>",
            "<div class='formControls col-2'>",
            //readonly='readonly'  input.textbox-value
            "<input type='text' class='easyui-textbox' name='regnId'  value='全国' disabled='disabled' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>标签名称：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='urdfTabsNm'   style='width:100%;height:30px' >",
            "</div>",


            //查询 重置按钮
            "<div class='row cl'>",
            "<div class='formControls text-r'>",
            "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a>",
            " <a href='javascript:void(0)' class='btn btn-default radius mt-l-20 '><i class='iconfont iconfont-zhongzuo'></i>重置</a>",
            "</div>",
            "</div>",


            "</form>",
            "</div>",
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>自定义标签列表</div>",
            "<div class='fr'>",
            "<a id='createTaglib'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>",
            "<i class='iconfont iconfont-add'></i>新增标签</a>",
            "<a id='deletePatch'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>",
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='taglibGrid' class='easyui-datagrid'  style=' width:98%;'>",
            "</table>",
            "<!--这里是修改弹窗div，默认隐藏-->",
            "<div  id='pop_window' style='display:none;'>",
            "<div id='win_content' style='overflow:auto'>",
            "</div>",
            "</div>",
            "<!--这里是添加弹窗div，默认隐藏-->",
            "<div  id='pop_window_add' style='display:none;'>",
            "<div id='win_content_add' style='overflow:auto'>",
            "</div>",
            "</div>"
        ].join("")).appendTo($page);
    }

    function initGrid() {
        $("#page_content").find("#taglibGrid").datagrid({
            columns: [[
                {field: 'checkBox', title: '复选框', width: '3.5%', checkbox: 'true', align: 'center', halign: 'center'},
                {field: 'urdfTabsId', title: '自定义页签ID', hidden: true},
                {field: 'URDFTABSNM', title: '标签名称', width: '48%'},
                {
                    field: 'operation', title: '操作', width: '48.5%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='modifyBtn' name ='modfiy" + row.URDFTABSNM + "' id ='modfiy" + row.urdfTabsId + "' >修改</a>  |  " +
                            "<a href='javascript:void(0);'class='deleteBtn' id='del" + row.urdfTabsId + "'>删除</a>  |  " +
                            "<a href='javascript:void(0);' class='detailBtn' id ='detail" + row.urdfTabsId + "'>查看相关知识</a>";
                        return Action;
                    }
                }
            ]],
            fitColumns: true,
            width: '99%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            //只能单选选项
            // singleSelect: true,
            autoRowHeight: false,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var id = $search.find("input.easyui-textbox[name='regnId']").val();
                var name = $search.find("input.easyui-textbox[name='urdfTabsNm']").val();
                var aa = Util.PageUtil.getParams($("#searchForm"));
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                }, {regnId: aa.regnId==undefined?id:aa.regnId, urdfTabsNm: aa.urdfTabsNm==undefined?name:aa.urdfTabsNm});
                //Util.PageUtil.getParams($("#searchForm"))

                Util.ajax.getJson(Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/getTaglibInfoList", params, function (result) {
                    if (result.RSP.RSP_CODE == 1) {
                        var data = Transfer.DataGrid.transfer(result);
                        success(data);
                    } else {
                        console.log(result);
                    }
                });

                // $.ajax({
                //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/getTaglibInfoList",
                //     type: "GET",
                //     data: params,
                //     dataType: "json",
                //     success: function (result) {
                //         // var flag = result.RSP.RSP_CODE;//请求返回码
                //         // var des = result.RSP.RSP_DESC;//请求返回描述
                //         var data = Transfer.DataGrid.transfer(result);
                //         success(data);
                //     },
                //     error: function (result) {
                //         console.log(result);
                //     }
                // });
            }
        });
    }

    //初始化标签树
    function initMenuTree() {
        var rootId = 1;
        //根目录
        var newNode = {
            URDFTABSCATLNM: "标签库根目录",
            SUPRURDFTABSCATLID: "0",
            id: rootId,
            name: "标签库根目录",
            isParent: true,
            URDFTABSCATLID: rootId,
            level: 0
        };//根节点的父节点是0  本身ID是1
        constructNodeArr(newNode);
        var zTreeObj;
        var params = {"suprUrdfTabsCatlId": newNode.URDFTABSCATLID, "regnId": "000"};
        var setting = {
            hasLine: true,//是否有节点连线;
            // async: {
            //     dataType: "json",
            //     type: "POST",
            //     enable: true,
            //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/queryTagLibCatList",
            //     // autoParam: ["id=urdfSuperTabsCatlId"],//将id的值作为urdfSuperTabsCatlId传到后台
            //     otherParam: params,//设置省份
            //     dataFilter: filter
            // },
            edit: {
                drag: {
                    autoExpandTiggger: true,
                    isCopy: true,
                    isMove: true,
                    prev: true,
                    next: true,
                    inner: true,
                    borderMax: 10,
                    borderMin: -5,
                    minMoveSize: 5,
                    maxShowNodeNum: 5,
                    autoOpenTime: 500
                },
                editNameSelectAll: true,
                enable: false,
                removeTitle: "删除节点",
                renameTitle: "编辑节点名称",
                showRemoveBtn: true,
                showRenameBtn: true
            },
            check: {
                enable: true,
                chkStyle: "checkbox"
            },
            callback: {
                onClick: zTreeOnClick,//节点点击事件
                beforeRename: zTreeBeforeRename,//修改节点名称之前的判断
                onRename: zTreeOnRename,//节点重命名
                onRemove: zTreeOnRemove, //删除节点
                onExpand: zTreeOnExpand //节点展开
            }
        };

        //添加 点击函数
        function zTreeOnClick(event, treeId, treeNode) {
            $("#searchForm").find("input.easyui-textbox[id='regnId']").val(regnNm);
            //点击节点的时候修改样式
            modifyStatus(treeNode);
            currentSelectNode = treeNode;
            var currentNodeId = treeNode.tId;//menu_tree_n
            var currentTaglibId = treeNode.URDFTABSCATLID;
            $skillType = treeNode.tId;
            $page.find("#taglibGrid").datagrid('reload');

        };

        // 重命名之前的操作
        function zTreeBeforeRename(treeId, treeNode, newName, isCancel) {
            if (newName.length == 0) {
                alert("目录名称不能为空.");
                return;
            }
            return;
        }

        // 重命名函数
        function zTreeOnRename(event, treeId, treeNode) {
            var node = zTreeObj.getSelectedNodes();
            node[0].URDFTABSCATLNM = node[0].name;
            if (node[0] == undefined) {
                new Dialog({
                    mode: 'tips',
                    content: '请选择需要标签目录'
                });
                return;
            }
            var currentNodeId = node[0].tId;
            //根目录的不给更改名称
            if (currentNodeId == "menuTree_1") {
                $.messager.show({
                    msg: '根目录不能修改！',
                    showType: 'slide'
                });
                return;
            }
            //节点数据库的主键
            var taglibId = node[0].URDFTABSCATLID;
            //新名称
            newName = node[0].name;
            var params = {};
            params['urdfTabsCatlId'] = taglibId;
            params['urdfTabsCatlNm'] = newName;
            params['suprUrdfTabsCatlId'] = node[0].parentId;//父节点的ID是当前节点的父节点属性
            //新名字和老名字一样 不请求
            if (newName == oldName) {
                $.messager.alert('温馨提示', '老名称和新名称一致，修改操作无效！');
                $treeObject.removeNode(node[0], false);
                return;
            }
            if (newName == null || newName == undefined || newName == "") {
                $.messager.alert('温馨提示', '标签目录名称不能为空！');
                $treeObject.removeNode(node[0], false);
                return;
            }
            //判断当前是修改还是新增
            if (oldName == null || oldName == undefined || oldName == "") {//新增
                $.ajax({
                    type: "POST",//请求方式
                    async: false,//是否异步
                    data: params,
                    url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/TagLibCat/addTagLibCat",
                    success: function (result) {//返回消息
                        var flag = result.RSP.RSP_CODE;//请求返回码
                        var des = result.RSP.RSP_DESC;//请求返回描述
                        if (flag == 1) {
                            $.messager.show({
                                msg: des,
                                timeout: 1000,
                                style: {right: '', bottom: ''},
                                showType: 'slide'
                            });
                        } else {
                            //添加失败的时候去掉节点
                            $.messager.show({
                                msg: des,
                                timeout: 1000,
                                style: {right: '', bottom: ''},
                                showType: 'slide'
                            });
                            $treeObject.removeNode(node[0], false);
                        }

                    },
                    error: function (datas) {//请求失败时执行
                        $.messager.show({
                            msg: "添加标签目录失败！",
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                    }
                });
            } else {//修改

                Util.ajax.putJson(Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/TagLibCat/updateTagLibCat", params, function (result) {
                    var des = result.RSP.RSP_DESC;//请求返回描述
                    if (result.RSP.RSP_CODE == 1) {
                        $.messager.show({
                            msg: des,
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                    } else {
                        $.messager.show({
                            msg: des,
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                    }
                });

                // $.ajax({
                //     type: "POST",
                //     data: params,
                //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/updateTagLibCat",
                //     async: false,
                //     success: function (result) {
                //         var flag = result.RSP.RSP_CODE;//请求返回码
                //         var des = result.RSP.RSP_DESC;//请求返回描述
                //
                //         if (flag == 1) {//修改成功
                //             $.messager.show({
                //                 msg: des,
                //                 timeout: 1000,
                //                 style: {right: '', bottom: ''},
                //                 showType: 'slide'
                //             });
                //             //老名字重新赋值到当前节点的属性中
                //             // currentSelectNode.name = oldName;
                //             // currentSelectNode.URDFTABSCATLNM = oldName;
                //             // node[0].name=oldName;
                //             // node[0].urdfTabsCatlNm = oldName;
                //             //更新节点
                //             // $treeObject.updateNode(node[0]);
                //         } else {//修改失败
                //             $.messager.show({
                //                 msg: des,
                //                 timeout: 1000,
                //                 style: {right: '', bottom: ''},
                //                 showType: 'slide'
                //             });
                //         }
                //
                //     },
                //     error: function (result) {
                //         var des = result.RSP.RSP_DESC;//请求返回描述
                //         $.messager.show({
                //             msg: "修改标签目录失败！",
                //             timeout: 3000,
                //             showType: 'slide'
                //         });
                //     }
                // });
            }

        };

        // 删除数节点事件
        function zTreeOnRemove(event, treeId, treeNode) {
            var node = zTreeObj.getSelectedNodes();
            var currentTaglibId = treeNode.URDFTABSCATLID;
            //根目录的不给删除
            if (currentTaglibId == 1) {
                $.messager.show({
                    msg: '根目录不能删除！',
                    showType: 'slide'
                });
                zTreeObj.refresh();//刷新整个树
                return;
            }
            //当前目录下有节点
            if (treeNode.isParent) {
                alert("当前目录下有节点，无法删除");
                return;
            }
            /*var params  ={urdfTabsCatlId: currentTaglibId}
            Util.ajax.deleteJson(Util.constants.CONTEXT + "kc/TagLibCat/deleteTagLibCat",params, function (result) {
                var des = result.RSP.RSP_DESC;//请求返回描述
                var flag = result.RSP.RSP_CODE;//请求返回码
                var des = result.RSP.RSP_DESC;//请求返回描述
                if (flag != 1) {
                    $.messager.show({
                        msg: des,
                        timeout: 3000,
                        showType: 'slide'
                    });
                    return;
                }
                $.messager.show({
                    msg: "删除节点失败",
                    timeout: 1000,
                    style: {right: '', bottom: ''},
                    showType: 'slide'
                });
            })*/
            $.ajax({
                type: "POST",
                data: {urdfTabsCatlId: currentTaglibId},
                url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/TagLibCat/deleteTagLibCat",
                async: false,
                success: function (result) {
                    var flag = result.RSP.RSP_CODE;//请求返回码
                    var des = result.RSP.RSP_DESC;//请求返回描述
                    if (flag != 1) {
                        $.messager.show({
                            msg: des,
                            timeout: 3000,
                            showType: 'slide'
                        });
                        return;
                    }
                    $.messager.show({
                        msg: des,
                        timeout: 1000,
                        style: {right: '', bottom: ''},
                        showType: 'slide'
                    });
                    // zTreeObj.reAsyncChildNodes(node[0], "refresh");//刷新单个节点
                    // zTreeObj.refresh();//刷新整个树
                },
                error: function (result) {
                    console.log(result);
                    $.messager.show({
                        msg: "删除节点失败",
                        timeout: 3000,
                        showType: 'slide'
                    });
                }
            });
        }

        // 节点展开事件
        function zTreeOnExpand(event, treeId, treeNode) {
            // treeNode.children==null;//清空子节点
            // treeNode.children=getchildrenNodeByParentId(treeNode.URDFTABSCATLID);//赋值子节点
            var currentNodeId = treeNode.tId;//menu_tree_n
            var currentTaglibId = treeNode.URDFTABSCATLID;
            currentSelectNode = treeNode;//设置当前节点
            if (treeNode.isParent && (treeNode.children == undefined || treeNode.children.length == 0)) {
                var subNodes = getchildrenNodeByParentId(currentSelectNode.URDFTABSCATLID);
                //处理一下子节点数据
                initLoadRootNodeSubNodes(subNodes);
            }
        }

        //根据父节点ID查询子节点数据
        function getchildrenNodeByParentId(id) {
            var nodes;
            var params = {"suprUrdfTabsCatlId": id, "regnId": "000"};

            Util.ajax.getJson(Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/TagLibCat/queryTagLibCatList", params, function (result) {
                var des = result.RSP.RSP_DESC;//请求返回描述
                if (result.RSP.RSP_CODE == 1) {
                    nodes = result.RSP.DATA;
                    console.log(nodes);
                    $.messager.show({
                        msg: des,
                        timeout: 3000,
                        showType: 'slide'
                    });
                } else {
                    $.messager.show({
                        msg: "刷新树节点失败",
                        timeout: 3000,
                        showType: 'slide'
                    });
                }
            },true);

            // $.ajax({
            //     type: "POST",
            //     data: params,
            //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/queryTagLibCatList",
            //     async: false,
            //     success: function (result) {
            //         var flag = result.RSP.RSP_CODE;//请求返回码
            //         var des = result.RSP.RSP_DESC;//请求返回描述
            //         if (flag == 1) {
            //             nodes = result.RSP.DATA;
            //         }
            //         $.messager.show({
            //             msg: des,
            //             timeout: 3000,
            //             showType: 'slide'
            //         });
            //     },
            //     error: function (result) {
            //         $.messager.show({
            //             msg: "刷新树节点失败",
            //             timeout: 3000,
            //             showType: 'slide'
            //         });
            //     }
            // });
            return nodes;
        }

        //添加子节点数据
        function initLoadRootNodeSubNodes(options) {
            var object = getSubNodeLevel(options);
            if (null == object) {
                return;
            }
            if (object.isInitialLoad) {
                zTreeObj.addNodes(rootNode, -1, object.transformedNodeArr, false);
            } else {
                zTreeObj.addNodes(currentSelectNode, -1, object.transformedNodeArr, false);
            }
            $(".ztree li span.button.switch.level" + object.subNodeLevel).css("margin-left", object.subNodeLevel * 15 + "px");
        }

        //组装节点数据
        function constructNodeArr(options) {
            var needAddNodeArr = [];
            $.each(options, function (index, option) {
                needAddNodeArr.push({
                    id: option.URDFTABSCATLID == undefined ? "" : option.URDFTABSCATLID,
                    URDFTABSCATLID: option.URDFTABSCATLID == undefined ? "" : option.URDFTABSCATLID,
                    parentId: option.SUPRURDFTABSCATLID == undefined ? "" : option.SUPRURDFTABSCATLID,
                    SUPRURDFTABSCATLID: option.SUPRURDFTABSCATLID == undefined ? "" : option.SUPRURDFTABSCATLID,
                    level: option.level == undefined ? "" : option.level,
                    name: option.URDFTABSCATLNM == undefined ? "" : option.URDFTABSCATLNM,
                    isParent: option.isParent == undefined ? "" : option.isParent
                });
            });
            return needAddNodeArr;
        }

        //获取根节点等级
        function getSubNodeLevel(options) {
            var isInitialLoad = null == currentSelectNode;
            var transformedNodeArr = constructNodeArr(options);
            if (transformedNodeArr.length == 0) {
                return;
            }
            return {
                "subNodeLevel": isInitialLoad ? 1 : currentSelectNode.level + 1,
                "isInitialLoad": isInitialLoad,
                "transformedNodeArr": transformedNodeArr
            }
        }

        //处理请求的树 数据
        function filter(treeId, parentNode, childNodes) {
            if (!childNodes) {
                return null;
            }

            childNodes = childNodes['resultMsg'];
            if (childNodes) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    childNodes[i].name = childNodes[i].URDFTABSCATLNM.replace(/\.n/g, '.');
                    // childNodes[i].isParent=true;
                    // childNodes[i].level = childNodes[i].atrr;
                }
            }
            return childNodes;
        }


        //修改树结构上面按钮的显示状态
        function modifyStatus(treeNode) {
            if (treeNode.level == 0) {
                if (!$("#edit-catalog").hasClass("disabled")) {
                    $("#edit-catalog").addClass("disabled");
                }
                if (!$("#delete-catalog").hasClass("disabled")) {
                    $("#delete-catalog").addClass("disabled");
                }
            } else {
                if ($("#edit-catalog").hasClass("disabled")) {
                    $("#edit-catalog").removeClass("disabled");
                }
                if ($("#delete-catalog").hasClass("disabled")) {
                    $("#delete-catalog").removeClass("disabled");
                }
            }
        }

        //修改拖拽时候的上面按钮的显示
        function updateMoveStatus(treeNode) {
            if (treeNode.getPreNode() != null) {
                if ($("#moveUp-catalog").hasClass("disabled")) {
                    $("#moveUp-catalog").removeClass("disabled");
                }
            } else {
                if (!$("#moveUp-catalog").hasClass("disabled")) {
                    $("#moveUp-catalog").addClass("disabled");
                }
            }
            if (treeNode.getNextNode() != null) {
                if ($("#moveDown-catalog").hasClass("disabled")) {
                    $("#moveDown-catalog").removeClass("disabled");
                }
            } else {
                if (!$("#moveDown-catalog").hasClass("disabled")) {
                    $("#moveDown-catalog").addClass("disabled");
                }
            }
        }

        //获取根节点
        function filterRootNode(node) {
            return node.level == 0;
        }

        $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#menuTree"), setting, newNode);
            $treeObject = zTreeObj;
            rootNode = zTreeObj.getNodesByFilter(filterRootNode, true); // 查找根节点
            // zTreeObj.expandNode(rootNode, true, false, true, true);//初始化页面的时候直接打开根节点 当前不需要
        });

    }

    //组装节点数据
    function constructNodeArr2(options) {
        var needAddNodeArr = [];
        $.each(options, function (index, option) {
            needAddNodeArr.push({
                id: option.URDFTABSCATLID,
                URDFTABSCATLID: option.URDFTABSCATLID,
                parentId: option.SUPRURDFTABSCATLID,
                level: option.level,
                name: option.URDFTABSCATLNM,
                isParent: option.isParent
            });
        });
        return needAddNodeArr;
    }

    //获取根节点等级
    function getSubNodeLevel2(options) {
        var isInitialLoad = null == currentSelectNode;
        var transformedNodeArr = constructNodeArr2(options);
        if (transformedNodeArr.length == 0) {
            return;
        }
        return {
            "subNodeLevel": isInitialLoad ? 1 : currentSelectNode.level + 1,
            "isInitialLoad": isInitialLoad,
            "transformedNodeArr": transformedNodeArr
        }
    }

    //初始化按钮点击事件
    function initGlobalEvent() {
        //点击新增目录按钮
        $("#layout_content").on("click", "#add-catalog", function () {
            var params = {
                URDFTABSCATLNM: "新建标签目录",
                level: currentSelectNode.level + 1,
                isParent: false,
                SUPRURDFTABSCATLID: currentSelectNode.URDFTABSCATLID,
                parentId: currentSelectNode.URDFTABSCATLID
            };
            superNode = currentSelectNode;
            var object = getSubNodeLevel2(params);
            if (null == object) {
                return;
            }
            $treeObject.addNodes(currentSelectNode, -1, params, false);
            $(".ztree li span.button.switch.level" + object.subNodeLevel).css("margin-left", object.subNodeLevel * 15 + "px");
            var newAddNode = $treeObject.getNodesByFilter(filter, true); // 查找新增节点
            $treeObject.editName(newAddNode);

            function filter(node) {
                return node.id == object.transformedNodeArr[0].id;
            }


        });

        //修改目录名称
        $("#layout_content").on("click", "#edit-catalog", function () {
            if (currentSelectNode.level == 0) {
                $.messager.alert('温馨提示', '该目录为根目录  无法修改！');
                return;
            }
            oldName = currentSelectNode.name;
            $treeObject.editName(currentSelectNode);
        });

        //删除目录
        $("#layout_content").on("click", "#delete-catalog", function () {
            if (currentSelectNode.isParent) {
                $.messager.alert('温馨提示', '该目录为父级目录，无法直接删除！');
                return;
            }
            $treeObject.removeNode(currentSelectNode, true);
        });

        //初始化查询按钮
        $("#searchForm").on("click", "a.btn-green", function () {
            $("#page_content").find("#taglibGrid").datagrid("load");
        });

        //初始化重置按钮
        $("#searchForm").on("click", "a.btn-default", function () {
            //清空标签输入框的内容urdfTabsNmInput
            $search.find('form.form').form('clear');
        });

        //绑定删除按钮事件
        $("#page_content").delegate("a.deleteBtn", "click", function () {
            var thisDelBtn = $(this);
            $.messager.confirm('确认删除弹窗', '您确定要删除这条标签吗？', function (confirm) {
                if (confirm) {

                    var temp = thisDelBtn.attr('id');
                    //标签ID
                    var urdfTabsId = thisDelBtn.attr('id').substr(3);
                    var params = {urdfTabsId: urdfTabsId};
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/deleteTaglib?urdfTabsId=" + urdfTabsId, params, function (result) {
                        var des = result.RSP.RSP_DESC;//请求返回描述
                        if (result.RSP.RSP_CODE == 1) {
                            $.messager.show({
                                msg: result.RSP.RSP_DESC,
                                timeout: 3000,
                                showType: 'slide'
                            });
                            $("#page_content").find("#taglibGrid").datagrid("load");

                        } else {
                            $.messager.show({
                                msg: result.RSP.RSP_DESC,
                                timeout: 3000,
                                showType: 'slide'
                            });
                        }
                    })


                    //var urdfTabsId = thisDelBtn.attr('id').substr(3);
                    // $.ajax({
                    //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/deleteTaglib",
                    //     type: "GET",
                    //     data: {urdfTabsId: urdfTabsId},
                    //     //返回码是200的时候(XMLHttpRequest.status为200的时候)
                    //     success: function (result) {
                    //         //请求返回码
                    //         var flag = result.RSP.RSP_CODE;
                    //         if (flag == 1) {
                    //             $.messager.show({
                    //                 msg: result.RSP.RSP_DESC,
                    //                 timeout: 3000,
                    //                 showType: 'slide'
                    //             });
                    //             $("#page_content").find("#taglibGrid").datagrid("load");
                    //         } else {
                    //             $.messager.show({
                    //                 msg: result.RSP.RSP_DESC,
                    //                 timeout: 3000,
                    //                 showType: 'slide'
                    //             });
                    //         }
                    //     },
                    //     //返回码非200的时候
                    //     error: function (result) {
                    //         $.messager.show({
                    //             msg: result,
                    //             timeout: 3000,
                    //             showType: 'slide'
                    //         });
                    //     }
                    // });

                }
            });
        });

        //绑定修改按钮事件
        $("#page_content").delegate("a.modifyBtn", "click", function () {
            var thisRepBtn = $(this);
            $("#win_content").show().window({
                width: 500,
                height: 200,
                modal: true,
                title: "修改自定义标签"
            });
            //标签ID
            var urdfTabsId = thisRepBtn.attr('id').substr(6);
            //标签名称
            var urdfTabsName = thisRepBtn.attr('name').substr(6);
            modifyTaglib.initialize(urdfTabsId, urdfTabsName);
        });

        //绑定添加标签按钮事件
        $("#page_content").on("click", "#createTaglib", function () {
            //取消列表的勾选行
            $page.find("#taglibGrid").datagrid("clearSelections");
            $("#win_content").show().window({
                width: 500,
                height: 200,
                modal: true,
                title: "添加自定义标签"
            });
            modifyTaglib.initialize("", "");
        });

        //绑定批量删除按钮事件
        $("#page_content").on("click", "#deletePatch", function () {
            //获取选中行的数据
            var selectRows = $("#taglibGrid").datagrid("getSelections");
            //如果没有选中行的话，提示信息
            if (selectRows.length < 1) {
                $.messager.alert("提示消息", "请选择要删除的记录！", 'info');
                return;
            }
            //如果选中行了，则要进行判断
            $.messager.confirm("确认消息", "确定要删除所选记录吗？", function (isDelete) {
                //如果为真的话
                if (isDelete) {
                    var strIds = "";
                    var totalNum = selectRows.length;
                    //拼接字符串，这里也可以使用数组，作用一样
                    for (var i = 0; i < selectRows.length; i++) {
                        strIds += selectRows[i].urdfTabsId + ",";
                    }
                    //循环切割  去除最后的,
                    strIds = strIds.substr(0, strIds.length - 1);
                    var params = {taglibArray: strIds};
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/deletePatchTagLibInfo?taglibArray=" + strIds, params, function (result) {
                        var des = result.RSP.RSP_DESC;//请求返回描述
                        if (result.RSP.RSP_CODE == 1) {
                            $.messager.show({
                                msg: '删除成功' + result.RSP.ATTACH.TOTAL + '条数据，删除失败' + (totalNum - result.RSP.ATTACH.TOTAL) + "条数据！",
                                timeout: 3000,
                                showType: 'slide'
                            });
                            $("#page_content").find("#taglibGrid").datagrid("load");

                        } else {
                            $.messager.show({
                                msg: result,
                                timeout: 3000,
                                showType: 'slide'
                            });
                        }
                    })

                    // $.ajax({
                    //     url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/deletePatchTagLibInfo",
                    //     type: "POST",
                    //     data: {taglibArray: strIds},
                    //     //返回码是200的时候(XMLHttpRequest.status为200的时候)
                    //     success: function (result) {
                    //         $.messager.show({
                    //             msg: '删除成功' + result['successNum'] + '条数据，删除失败' + result['failedNum'] + "条数据！",
                    //             timeout: 3000,
                    //             showType: 'slide'
                    //         });
                    //         $("#page_content").find("#taglibGrid").datagrid("load");
                    //     },
                    //     //返回码非200的时候
                    //     error: function (result) {
                    //         $.messager.show({
                    //             msg: result,
                    //             timeout: 3000,
                    //             showType: 'slide'
                    //         });
                    //     }
                    // });
                }
            });

        });
    }

    return initialize;
});
