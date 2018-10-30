require(["jquery", "loading", 'util', "easyui", 'ztree-exedit', "transfer"], function ($, Loading, Util, Transfer) {

    var $page, $search, $layout, selectTreeNode, zTreeObj, operType;
    var $treeObject;//全局树对象
    /**
     * 初始化
     */
    initialize();

    /**
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getsysCode(codeTypeCd) {
        var result = {};
        $.ajax({
            url: Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== null && data[i].name !== null) {
                        result[data[i].value] = data[i].name;
                    }
                }
            }
        });
        return result;
    };

    /**
     * 目录配置
     */
    function districtManage() {
        $search = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl'>",
            "<div class='fl text-bold'>目录配置</div>",
            "</div>",
            "</div>",
            "</div>",

            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",
            "<div class='row cl' >",
            "<label class='form-label col-2'>目录名称：</label>",
            "<div class='formControls col-2'>",
            "<input id='directoryName' type='text' class='easyui-textbox' name='regnNm' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>接入渠道：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='channel'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",
            "<div class='row cl'>",
            "<div class='formControls text-c'>" +
            "<a id='btnAdd'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>新增</a>",
            "<a id='btnEdit'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-edit'></i>修改</a>",
            "<a id='btnDelete'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "<a id='btnSave'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-save'></i>保存</a>",
            "</div>",
            "</div>",
            "</form>",
            "</div>"
        ].join("")).appendTo($page);
    }

    /**
     * 初始化方法
     */
    function initialize() {
        $page = $("<div></div>");
        addLayout();

        $page = $page.appendTo($("#form_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();

        initMenuTree();
        districtManage();
        initGlobalEvent();
        initSearchForm();
    };

    function addLayout() {
        $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

            "<div data-options=\"region:'west',split:false,title:'知识目录'\" style='width: 200px;height: 100%;overflow:auto'>",
            "<div class='ke-panel-content clear-overlap'>",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-up disabled' title='上移' href='#nogo' id='moveUp-catalog' style='cursor:pointer;'></a> </li>",
            "<li><a class='clk-down disabled' title='下移' href='#nogo' id='moveDown-catalog' style='cursor:pointer;'></a></li>",
            "</ul></div>",

            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",

            "<div data-options=\"region:'center'\" style='overflow: hidden;'>",
            "<div id='form_content' data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "<div data-options=\"region:'north'\" id='pop_window' style='display:none'>",
            "<div id='win_content' style='overflow:auto'>",
            "</div>",
            "</div>"
        ].join("")).appendTo($("#page_content"));
    }

    /**
     * 更新移动状态
     */
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

    /**
     * 初始化业务树
     */
    function initMenuTree() {

        var setting = {
            async: {
                dataType: "json",
                type: "GET",
                enable: true,
                url: Util.constants.CONTEXT + "/kmTree/query",
                autoParam: ["codeValue"],
                dataFilter: filter
            },
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
                showRemoveBtn: true,
                showRenameBtn: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                onClick: zTreeOnClick,
            }
        };

        //添加 点击函数
        function zTreeOnClick(event, treeId, treeNode) {
            selectTreeNode = treeNode;
            updateMoveStatus(treeNode);
            $("#directoryName").val(treeNode.codeName);
            $("#channel").val(treeNode.codeType);
            $("#directoryName").attr("nodeId", selectTreeNode.tId);
        };

        function filter(treeId, parentNode, childNodes) {
            if (!childNodes) {
                return null;
            }

            childNodes = childNodes.RSP.DATA;
            if (childNodes) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    childNodes[i].name = childNodes[i].codeName.replace(/\.n/g, '.');
                }
            }
            return childNodes;
        }

        var newNode = {name: "业务树", isParent: true, codeValue: 0};

        $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#menuTree"), setting, newNode);
            $treeObject = zTreeObj;
            // 异步加载树.直接传rootNode异步刷新树，将无法展开rootNode。要通过如下方式获取根节点。false参数展开本节点
            zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);
        });

    }

    /**
     * 初始化事件
     */
    function initGlobalEvent() {

        /*
         * 新增事件
         */
        $search.on("click", "#btnAdd", function () {
            var codeName = $("#directoryName").val();
            if (codeName == null || codeName == "") {
                $.messager.alert('Warning', '请先选择左侧树节点');
                return false;
            }
            operType = 1;
            $("#directoryName").removeAttr("readonly");
        });

        /*
        * 修改
        */
        $search.on("click", "#btnEdit", function () {
            var codeName = $("#directoryName").val();
            if (codeName == null || codeName == "") {
                $.messager.alert('Warning', '请先选择左侧树节点');
                return false;
            }
            operType = 2;
            $("#directoryName").removeAttr("readonly");
        });

        /*
         * 删除
         */
        $search.on("click", "#btnDelete", function () {
            $.messager.confirm('Confirm', '你确定要删除吗?', function (r) {
                if (r) {
                    console.log("r: " + r);
                    saveNode(3);
                }
            });
        });

        /**
         *  保存
         */
        $("#btnSave").click(function () {
            saveNode(operType);
        })

        /*
         * 同层级移动请求
         */
        function moveSameLevelNode(targetNodeId, moveNodeId) {
            params = {
                targetCatlId: targetNodeId,
                moveCatlId: moveNodeId
            };

            Util.ajax.putJson(Util.constants.CONTEXT + "/kmTree/moveCatalog", params, function (result) {

            });
        }

        /*
         * 上移
         */
        $layout.on("click", "#moveUp-catalog", function () {
            var previousNode = selectTreeNode.getPreNode();
            if (null == previousNode) {
                return;
            }
            zTreeObj.moveNode(previousNode, selectTreeNode, "prev");
            moveSameLevelNode(previousNode.codeValue, selectTreeNode.codeValue);
            updateMoveStatus(selectTreeNode);
        });

        /*
         * 下移
         */
        $layout.on("click", "#moveDown-catalog", function () {
            var nextNode = selectTreeNode.getNextNode();
            if (null == nextNode) {
                return;
            }
            zTreeObj.moveNode(nextNode, selectTreeNode, "next");
            moveSameLevelNode(nextNode.codeValue, selectTreeNode.codeValue);
            updateMoveStatus(selectTreeNode);
        });
    }

    /**
     *  保存并刷新节点数据
     */
    function saveNode(type) {
        var type;
        var codeName = $("#directoryName").val();
        var channelCode = $search.find('input[name="channel"]').val();
        codeName = codeName.replace(/\s*/g, "");

        if (codeName == null || codeName == "") {
            $.messager.alert('', '请先选择左侧树节点！');
            return false;
        }

        if (type == '1') {//新增

            params = {
                suprLogicTreeCatlId: selectTreeNode.codeValue,
                logicTreeCatlNm: codeName,
                chnlCode: channelCode,
            };

            Util.ajax.postJson(Util.constants.CONTEXT + "/kmTree/add", params, function (result) {
                //刷新节点
                if (selectTreeNode.isParent = true) {//新增时选中节点为父节点
                    zTreeObj.reAsyncChildNodes(selectTreeNode, "refresh");
                } else {//新增前选中节点为子节点
                    selectTreeNode.isParent = true;
                    zTreeObj.reAsyncChildNodes(selectTreeNode, "refresh");
                }
                alert(result.RSP.RSP_DESC);
            });

        } else if (type == '2') {//修改

            var codeName = $("#directoryName").val();
            var treeNodeName = zTreeObj.getSelectedNodes()[0].codeName;

            if (codeName == treeNodeName) {
                $.messager.alert('Warning', '不能与原名称相同');
                return false;
            }

            params = {
                suprLogicTreeCatlId: selectTreeNode.getParentNode().codeValue,
                logicTreeCatlId: selectTreeNode.codeValue,
                logicTreeCatlNm: codeName,
                chnlCode: channelCode
            };

            Util.ajax.putJson(Util.constants.CONTEXT + "/kmTree/modify", params, function (result) {
                //刷新节点
                zTreeObj.reAsyncChildNodes(selectTreeNode.getParentNode(), "refresh");
                alert(result.RSP.RSP_DESC);
            });


        } else if (type == '3') {//删除

            if (selectTreeNode.isParent) {
                $.messager.alert('温馨提示', '该目录为父级目录，无法直接删除！');
                return;
            }

            var logicTreeCatlId = selectTreeNode.codeValue;

            Util.ajax.deleteJson(Util.constants.CONTEXT + "/kmTree/delete?logicTreeCatlId=" + logicTreeCatlId, "", function (result) {
                //刷新节点
                if (selectTreeNode.getParentNode().children.length == 1) {//删除唯一子节点
                    selectTreeNode.getParentNode.isParent = false;
                    zTreeObj.reAsyncChildNodes(selectTreeNode.getParentNode().getParentNode(), "refresh");
                } else {
                    zTreeObj.reAsyncChildNodes(selectTreeNode.getParentNode(), "refresh");
                }
                alert(result.RSP.RSP_DESC);
            });
        }
    }

    /**
     * 从数据字典取下拉框的值
     */
    function initSearchForm() {
        var channelCode = "NGKM.TEMPLET.CHNL";   //数据字典搜索参数
        $search.find('input[name="channel"]').combobox({
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + channelCode,
            method: "GET",
            valueField: 'CODEVALUE',
            textField: 'CODENAME',
            value: "1",
            panelHeight: 'auto',
            editable: false,
            loadFilter: function (datas) {
                return datas.RSP.DATA;           //返回的数据格式不符合要求，通过loadFilter来设置显示数据
            }
        });
    }
});