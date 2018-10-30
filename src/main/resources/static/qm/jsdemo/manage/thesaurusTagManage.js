/**
 * 技能配置样例
 */
define(["jquery", "loading", 'util', "transfer", "easyui", 'ztree-exedit', "js/manage/thesaurusDataManage"],
    function ($, Loading, Util, Transfer, easyui, ztree, thesaurusDataManage) {

    var $page, $search, $treeObject;//全局树对象
    var rootNode;//根节点
    var currentSelectNode;//当前选择的节点
    var oldName;//节点老名称
    var newName;//节点新名称
    var superNode;//父节点

    var wordType;//词条类型
    var $upload;
    //初始化
    initialize();

    function initialize() {
        console.log("进入js");
        $page = $("<div></div>").appendTo($("#page_content"));
        $(document).find("#layout_content").layout();
        //初始化布局
        initTaglibLayout();
        initSearchForm();
        //通过地区regn_id获取地区名称
        // initRegnNm();
        //初始化列表
        initGrid();
        //初始化标签目录(树结构)
        initMenuTree();
        initGlobalEvent();
    };

    // //通过登录员的账号获取本地城市ID，然后查询获取地区名称
    // function initRegnNm() {
    //     //regnID从当前登录信息中获取
    //     regnId = "210";
    //     var params = {regnId: regnId};
    //     $.ajax({
    //         url: Util.constants.CONTEXT + "/district/getDistrictByRegnId",
    //         type: "POST",//请求方式
    //         async: false,//是否异步
    //         data: params,//请求参数
    //         dataType: "json",
    //         success: function (result) {
    //             // regnNm = result['resultMsg'].REGNNM;
    //             regnNm = result.RSP.DATA[0].REGNNM;
    //         },
    //         error: function (result) {
    //             return;
    //         }
    //     });
    //     //为地区框赋值
    //     $search.find("input.easyui-textbox[name='regnId']").val(regnNm);
    // }

    /**
     * 标签库管理
     */
    function initTaglibLayout() {
        $search = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>词库管理</div>",
            "</div>",
            "</div>",
            "</div>",
            "<div class='panel-search'>",
            "<form class='form form-horizontal' id='searchForm'>",
            "<table>",
            "<tr>",
            "<div class='row cl'>",
            "<div style='display:none'>",
            "<input  type='hidden' name='wordTypeId' id='wordTypeId' class='easyui-textbox'/>",
            "</div>",
            "<label class='form-label col-2' >词条类型：</label>",
            "<div class='formControls col-2'>",
            //readonly='readonly'  input.textbox-value
            "<input type='text' class='easyui-textbox' name='wordType' id='wordType' style='width:100%;height:30px' >",
            "</div>",
            "<div style='display:none'>",
            "<input  type='hidden' name='wordCatlId' id='wordCatlId' class='easyui-textbox' />",
            "</div>",
            "<label class='form-label col-2'>词条业务类型：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='wordCatl' id='wordCatl'  style='width:100%;height:30px' >",
            "</div>",
            "</tr>",
            "<tr>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>词条名称：</label>",
            "<div class='formControls col-2' style='width: 50%'>",
            "<input type='text' class='easyui-textbox' id='wordContent' name = 'wordContent' style='width:100%;height:30px' >",
            "</div>",
            "</div>",
            "</tr>",
            "</table>",

            //查询 重置按钮
            "<div class='row cl'>",
            "<div class='formControls text-r'>",
            "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id = 'selectThesa'><i class='iconfont iconfont-search2'></i>查询</a>",
            " <a href='javascript:void(0)' class='btn btn-default radius mt-l-20 ' id = 'resetThesa'><i class='iconfont iconfont-zhongzuo'></i>重置</a>",
            "</div>",
            "</div>",


            "</form>",
            "<div id='channelWindow'></div>",
            "</div>",
            "</div>",
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>词条列表</div>",
            "<div class='fr'>",
            "<a id='addThesa'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>",
            "<i class='iconfont iconfont-add'></i>新增</a>",
            "<a id='deleteThesa'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>",
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "<a id='importThesa'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>",
            "<i class='iconfont iconfont-daoru'></i>导入</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='thesaWords' name= 'thesaWords' class='easyui-datagrid'  style=' width:100%;'>",
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
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page_content").find("#thesaWords").datagrid({
            columns: [[
                {field: 'WORDID', title: 'Id', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'SUPRCATLNM', title: '词条类型', width: '10%'},
                {field: 'CATLNM', title: '词条业务类型', width: '10%'},
                {field: 'WORDTYPE', title: '词条类型', hidden: true},
                {field: 'WORDCATL', title: '词条业务类型', hidden: true},
                {field: 'WORDCONTENT', title: '词条名称', width: '20%'},
                {field: 'SUBSTITUTECONTENT', title: '替换词', width: '20%'},
                {field: 'ARGESEQNO', title: '排列序号', hidden: true},
                {field: 'GRAYVERSION', title: '灰度版本', hidden: true},
                {field: 'VERSIONNUM', title: '版本号', hidden: true},
                {field: 'TENANTID', title: '租户编码', hidden: true},
                {field: 'CREATEUSER', title: '创建人员', hidden: true},
                {field: 'CREATETIME', title: '创建时间', hidden: true},
                {field: 'UPDATEUSER', title: '修改人员', hidden: true},
                {field: 'UPDATETIME', title: '修改时间', hidden: true},
                {field: 'STARTTIME', title: '生效时间', hidden: true},
                {field: 'ENDTIME', title: '失效时间', hidden: true},
                {field: 'AREACODE', title: '地域编码', hidden: true},

                {field: 'REMARK', title: '备注', width: '20%'},
                {
                    field: 'action', title: '操作', width: '15%',

                    formatter: function (value, row, index) {
                        var sens = {
                            'wordId': row.WORDID, 'thesaWord': row.WORDCONTENT,
                            'substituteWord': row.SUBSTITUTECONTENT, 'rmk': row.REMARK
                        };
                        var sensStr = JSON.stringify(sens);   //转成字符串

                        var actions = "<input type = 'text' class = 'dateInput' id = "+ row.WORDID + " style = 'display:none' >";
                        if(row.FLAG =="0"){
                            actions += ("<a href='javascript:void(0);' class='reviseBtn' id =" + sensStr + " >修改</a> | " +
                                "<a href='javascript:void(0);'class='enableBtn' >启用</a> |" +
                                "<a href='javascript:void(0);' class='disableBtn disabled' >禁用</a>");
                        }else{
                            actions += ("<a href='javascript:void(0);' class='reviseBtn disabled' id =" + sensStr + " >修改</a> | " +
                                "<a href='javascript:void(0);'class='enableBtn disabled'>启用</a> |" +
                                "<a href='javascript:void(0);' class='disableBtn' >禁用</a>");
                        }


                        return actions;
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: true,
            selectOnCheck: true,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#thesaWords").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#thesaWords").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var wordContent = $("#wordContent").val();
                var wordType = $("#wordTypeId").val();
                var wordCatl = $("#wordCatlId").val();
                var params = {
                    "start": start,
                    "pageNum": pageNum,
                    "wordContent": wordContent,
                    "wordType":wordType,
                    "wordCatl":wordCatl
                };

                Util.ajax.getJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/querythesadatalist", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);

                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != "1") {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                    }

                    success(data);
                });
            }
        });
    }
    //初始化easyui-textbox
    function initSearchForm(){
        $("#searchForm").find("input.easyui-textbox").textbox();
    }

        //初始化标签树
    function initMenuTree() {
        var rootId = 1;
        //根目录
        var newNode = {
            URDFTABSCATLNM: "词库根目录",
            SUPRURDFTABSCATLID: "0",
            id: rootId,
            name: "词库根目录",
            isParent: true,
            URDFTABSCATLID: rootId,
            level: 0
        };//根节点的父节点是0  本身ID是1
        constructNodeArr(newNode);
        var zTreeObj;
        var params = {"suprCatlId": newNode.URDFTABSCATLID};
        var setting = {
            hasLine: true,//是否有节点连线;
            // async: {
            //     dataType: "json",
            //     type: "POST",
            //     enable: true,
            //     url: Util.constants.CONTEXT + "/TagLibCat/queryTagLibCatList",
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
            var params = {"suprCatlId": id};

            Util.ajax.getJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/querythesataglist", params, function (result) {
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
                    id: option.CATLID == undefined ? "" : option.CATLID,
                    URDFTABSCATLID: option.CATLID == undefined ? "" : option.CATLID,
                    parentId: option.SUPRCATLID == undefined ? "" : option.SUPRCATLID,
                    SUPRURDFTABSCATLID: option.SUPRCATLID == undefined ? "" : option.SUPRCATLID,
                    level: option.ARGESEQNO == undefined ? "" : option.ARGESEQNO,
                    name: option.CATLNM == undefined ? "" : option.CATLNM,
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


        //添加 点击函数
        function zTreeOnClick(event, treeId, treeNode) {
            //点击节点的时候修改样式
            modifyStatus(treeNode);
            //点击节点时，表格联动
            intoWordType(treeNode);
            currentSelectNode = treeNode;
            var currentNodeId = treeNode.tId;//menu_tree_n
            var currentTaglibId = treeNode.URDFTABSCATLID;
            $skillType = treeNode.tId;
            $page.find("#thesaWords").datagrid('reload');

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
                    content: '请选择需要的目录'
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
            params['catlId'] = taglibId;
            params['catlNm'] = newName;
            params['suprCatlId'] = node[0].parentId;//父节点的ID是当前节点的父节点属性

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
                    url: Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/insertthesatag",
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
                            zTreeObj.reAsyncChildNodes(node[0], "refresh");
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
                //新名字和老名字一样 不请求
                if (newName == oldName) {
                    $.messager.alert('温馨提示', '老名称和新名称一致，修改操作无效！');
                    zTreeObj.reAsyncChildNodes(node[0], "refresh");
                    return;
                }
                Util.ajax.putJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/updatethesatag", params, function (result) {
                    var des = result.RSP.RSP_DESC;//请求返回描述
                    if (result.RSP.RSP_CODE == 1) {
                        $.messager.show({
                            msg: des,
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                        zTreeObj.reAsyncChildNodes(node[0], "refresh");
                    } else {
                        $.messager.show({
                            msg: des,
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                    }
                });
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
                return;
            }
            //当前目录下有节点
            if (treeNode.isParent) {
                alert("当前目录下有节点，无法删除");
                return;
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？',function(confirm){

                if (confirm) {
                    $.ajax({
                        type: "POST",
                        data: {'catlId': currentTaglibId},
                        url: Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/deletethesatag",
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
            });
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
        $("#searchForm").on("click", "#selectThesa", function () {
            $("#page_content").find("#thesaWords").datagrid("load");
        });

        //初始化重置按钮
        $("#searchForm").on("click", "#resetThesa", function () {
            //清空标签输入框的内容thesaNmInput
            $("#wordContent").textbox("setValue", "");
            $("#page_content").find("#thesaWords").datagrid("load");
        });

        //绑定删除按钮事件
        $("#page_content").on("click", "#deleteThesa", function () {
            var selRows = $("#thesaWords").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var wordIds = [];
            for (var i = 0; i < selRows.length; i++) {
                var wordId = selRows[i].WORDID;
                wordIds.push(wordId);
            }

            var params = {'wordIds': wordIds};
            var ps = $.param(params, true); //序列化

            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/deletethesaword", ps, function (result) {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;

                        if (rspCode == "1") {
                            $("#thesaWords").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });

                }
            });

        });

        //绑定修改按钮事件
        $("#page_content").delegate("a.reviseBtn", "click", function () {
            if ($(this).hasClass("disabled")){
                return false;
            }
            $("#win_content").show().window({
                width: 800,
                height: 300,
                modal: true,
                title: "词条修改"
            });

            var thesaStr = $(this).attr('id'); //获取选中行的数据
            var sensjson = JSON.parse(thesaStr); //转成json格式

            thesaurusDataManage.initialize(sensjson);
        });

        //绑定添加按钮事件
        $("#page_content").on("click", "#addThesa", function () {

            var wordType = $("#wordTypeId").val();
            var wordCatl = $("#wordCatlId").val();

            if (wordCatl == null || wordCatl == "" || wordType == null || wordType == "") {

                $.messager.alert("提示", "请选择词条类型和词条业务类型!");

                return false;
            }


            //取消列表的勾选行
            $page.find("#thesaWords").datagrid("clearSelections");
            $("#win_content").show().window({
                width: 800,
                height: 300,
                modal: true,
                title: "添加自定义词条"
            });
            thesaurusDataManage.initialize("");
        });

        //绑定启用按钮事件
        $("#page_content").on("click", "a.enableBtn", function (){
            if ($(this).hasClass("disabled")){
                return false;
            }
            $(this).next("a").removeClass("disabled");
            $(this).prev("a").addClass("disabled");
            $(this).addClass("disabled");
            var wordId = $(this).parent().find(".dateInput").attr("id"); //获取选中行的数据
            // var sensjson = JSON.parse(thesaStr); //转成json格式
            // var wordId = sensjson.wordId;
            var flag = "1";            //启用 “1”， 禁用 “0”
            var params = {"wordId":wordId, "flag":flag};

            Util.ajax.postJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/enableControl", params, function (result) {

                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });

            })
        })

        //绑定禁用按钮事件
        $("#page_content").on("click", "a.disableBtn", function () {

            if ($(this).hasClass("disabled")){
                return false;
            }
            $(this).prev("a").removeClass("disabled");
            $(this).parent().find(".reviseBtn").removeClass("disabled");
            $(this).addClass("disabled");
            var wordId = $(this).parent().find(".dateInput").attr("id");
            var flag = "0";            //启用 “1”， 禁用 “0”
            var params = {"wordId":wordId, "flag":flag};

            Util.ajax.postJson(Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/enableControl", params, function (result) {

                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });

            })
        })

        //绑定导入按钮事件
        $("#page_content").on("click", "#importThesa", function () {

            var options = {
                width: 600,
                height: 200,
                title: "导入词条",
                windowId: "channelWindow",
                contentId: "fileUpload"
            };
            showWindow(options);
            $("<div id='" + options.contentId + "' style='height: 100%;text-align:center; margin:0 auto; line-height:100%'></div>").appendTo($("#" + options.windowId));
            addUploadDom(options);
            $upload.find("#onlineFileName").filebox({
                title: "234",
                buttonText: '选择文件',
                prompt: '请选择文件',
                buttonAlign: 'right',
                height:28,
                accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
            });
            $upload.find("#onlineFileName").textbox("textbox").attr("title", "仅支持xlsx、xls文件格式");
            $upload.on("click", "#btn-upload", function () {
                var file = $("#onlineFileName").filebox("getValue");
                var fileType = file.slice(file.lastIndexOf(".") + 1, file.length);
                if (fileType.length == 0) {
                    $.messager.alert("温馨提示", "请选择上传文件");
                    return;
                }
                if (["xlsx", "xls"].indexOf(fileType) == -1) {
                    $.messager.alert("温馨提示", "文件类型有误, 请重新上传文件");
                }

                uploadFileAction({"$uploadForm": $("#upload-form")});
            });

            $upload.on("click", "#btn-download", function() {
                window.location.href=Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/exportexcelmodel";
            });
        });
    }

    function showWindow(options) {
        $("#" + options.windowId).show().window({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            tools: [
                {
                    iconCls: 'icon-ok',
                    handler: function () {
                    }
                }, {
                    iconCls: 'icon-cancel',
                    handler: function () {
                    }
                }]
        });
    }

    function addUploadDom(options) {
        $upload = $([
            "<form id='upload-form' method='post' enctype='multipart/form-data' style='height: 100%;'>",
            "<div class='panel-search' style='height: 100%;padding-top: 70px;'>",
            "<input id='onlineFileName' name='templateFile' class='easyui-tooltip easyui-filebox ' type='text' style='width:70%' title=''>",
            "<a href='javascript:void(0)' id='btn-upload' class='btn btn-green radius  mt-l-20'>上传</a>",
            "<a href='javascript:void(0)' id='btn-download' class='btn btn-green radius  mt-l-20'>模板下载</a>",
            "</div>",
            "</form>"
        ].join("")).appendTo($("#" + options.contentId));
    }

    function uploadFileAction(options) {
        options.$uploadForm.form('submit', {
            url: Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/importthesaword",
            method: "POST",
            dataType: "json",
            onSubmit: function () {

            },
            success: function (serviceResponse) {
                serviceResponse = JSON.parse(serviceResponse);

                if (serviceResponse.RSP.RSP_CODE == "1") {

                    $("#page_content").find("#thesaWords").datagrid("load");
                    $("a.panel-tool-close").click();
                }

                $upload.find("#onlineFileName").filebox("clear");
                $("#channelWindow").window("close");

                $.messager.alert("提示", serviceResponse.RSP.RSP_DESC);
            },
            error: function (data) {
                $.messager.alert("提示", "操作异常！");
            }
        });
    };

    //点击目录时，目录名带入，表格联动
    function intoWordType(treeNode) {

        var level = treeNode.level;

        if (level != 0) {

            var father = treeNode.getParentNode();
            var wordCatl = treeNode.name;
            var wordCatlId = treeNode.URDFTABSCATLID;
            var wordType = father.name;;
            var wordTypeId = treeNode.SUPRURDFTABSCATLID;

            if (level == 1) {

                $("#wordTypeId").textbox("setValue", wordCatlId);
                $("#wordType").textbox("setValue", wordCatl);
                $("#wordCatlId").textbox("setValue", "");
                $("#wordCatl").textbox("setValue", "");
            }
            else if (level == 2) {

                $("#wordTypeId").textbox("setValue", wordTypeId);
                $("#wordType").textbox("setValue", wordType);
                $("#wordCatlId").textbox("setValue", wordCatlId);
                $("#wordCatl").textbox("setValue", wordCatl);
            }
         }else {

            $("#wordTypeId").textbox("setValue", "");
            $("#wordType").textbox("setValue", "");
            $("#wordCatlId").textbox("setValue", "");
            $("#wordCatl").textbox("setValue", "");
         }
    }
});
