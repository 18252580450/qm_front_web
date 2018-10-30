define(["jquery", "easyui", 'ztree-exedit'], function ($) {

    var $layout;
    var $catalogTree;
    var originalNodeName;
    var rootNode;
    var currentSelectCatalog;
    var Interactive;
    var clickNodeAction;
    var $treeId;

    var initialize = function (options) {
        $layout = options.$treeLayout;
        $treeId = options.$treeId;
        Interactive = options.interactive;
        clickNodeAction = options.clickNodeAction;
        Interactive.getSubNodesByParentNodeId(options.rootNodeId, initCatalogTree);
        bindTreeOperateEvent();
    };

    /**
     * 初始化目录树
     */
    function initCatalogTree(rootCatalog) {
        var catalogsNodes = constructNodeArr(rootCatalog);
        var setting = {
            async: { // 是否异步加载 相当于ajax
                dataFilter: null,
                dataType: "json",
                enable: false
            },
            callback: {
                onClick: onClickAction,
                onRename: onRenameAction,
                onExpand: onExpandAction
            }
        };
        $catalogTree = $.fn.zTree.init($treeId, setting, catalogsNodes);
        rootNode = getRootNode();
        $catalogTree.expandNode(rootNode, true, false, true, true); //初始化根节点下的子节点集合
    }

    function bindTreeOperateEvent() {
        /*
         * 绑定新增目录事件
         */
        $layout.on("click", "#add-catalog", function () {
            if (null == currentSelectCatalog) {
                $.messager.alert('温馨提示', '请先选择目录！');
                return;
            }
            var subNodeLevel = currentSelectCatalog.level + 1;
            if (6 == subNodeLevel) {
                $.messager.alert('温馨提示', '不能再建更深层级的目录了！');
                return;
            }
            addNodeView(subNodeLevel);
        });

        /*
         * 绑定编辑目录名称事件
         */
        $layout.on("click", "#edit-catalog", function () {
            if (currentSelectCatalog.level == 0) {
                return;
            }
            originalNodeName = currentSelectCatalog.name;
            $catalogTree.editName(currentSelectCatalog);
        });

        /*
         * 绑定删除目录事件
         */
        $layout.on("click", "#delete-catalog", function () {
            if (currentSelectCatalog.isParent) {
                $.messager.alert('温馨提示', '该目录为父级目录，无法直接删除！');
                return;
            }
            deleteNode();
        });

        /*
         * 绑定上移目录节点事件
         */
        $layout.on("click", "#moveUp-catalog", function () {
            var previousNode = currentSelectCatalog.getPreNode();
            if (null == previousNode) {
                return;
            }
            Interactive.moveCatalogNode(previousNode, currentSelectCatalog.id, moveUpSuccess);
        });

        function moveUpSuccess(previousNode) {
            $catalogTree.moveNode(previousNode, currentSelectCatalog, "prev");
            updateMoveStatusOfTree(currentSelectCatalog);
        }

        /*
         * 绑定下移目录节点事件
         */
        $layout.on("click", "#moveDown-catalog", function () {
            var nextNode = currentSelectCatalog.getNextNode();
            if (null == nextNode) {
                return;
            }
            Interactive.moveCatalogNode(nextNode, currentSelectCatalog.id, moveDownSuccess);
        });

        function moveDownSuccess(nextNode) {
            $catalogTree.moveNode(nextNode, currentSelectCatalog, "next");
            updateMoveStatusOfTree(currentSelectCatalog);
        }
    }

    /**
     * zTree树内置方法，当点击节点时触发
     */
    function onClickAction(event, treeId, treeNode) {
        selectSpecialNode(treeNode);
    }

    /**
     * 选中特定节点
     */
    function selectSpecialNode(treeNode) {
        currentSelectCatalog = treeNode;
        updateOperateStatusOfTree(treeNode);
        Interactive.getTemplateByCatalogId(treeNode.id, clickNodeAction);
    }

    /**
     * zTree树内置方法，当展开节点时触发
     */
    function onExpandAction(event, treeId, treeNode) {
        if (treeNode.level != 0) {
            currentSelectCatalog = treeNode;
        }
        //初始化加载选中节点的子节点集合
        if (treeNode.isParent && (treeNode.children == undefined || treeNode.children.length == 0)) {
            Interactive.getSubNodesByParentNodeId(treeNode.id, initLoadRootNodeSubNodes);
        }
    }

    /**
     * zTree树内置方法，当编辑节点名称完成后触发
     */
    function onRenameAction(event, treeId, treeNode, isCancel) {
        if (existIllegalCharterOfCatalogName(treeNode)) {
            $.messager.alert('温馨提示', '目录名称存在非法字符，请重新操作！');
            return;
        }
        //原来的节点名称存在时，说明当前为更新节点名称操作,否则为新增节点操作
        if (null != originalNodeName) {
            updateNode(treeNode);
            return;
        }
        Interactive.insertCatalogInfo(treeNode, addNodeSuccess, addNodeFailure);
    }

    /**
     * 更新目录节点数据，并校验目录名称是否重复；
     * 如果名称重复，则将节点名称恢复成原来的名称，并给出提示
     * @param treeNode
     */
    function updateNode(treeNode) {
        Interactive.updateCatalogInfo(treeNode, updateNodeSuccess);
        treeNode.name = originalNodeName;
        $catalogTree.updateNode(treeNode);
        originalNodeName = null;
        $.messager.alert('温馨提示', '目录名称不能重复！');
    }

    function updateNodeSuccess() {
        $.messager.alert('温馨提示', '保存成功');
    }

    /**
     * 新增目录节点数据，并校验目录名称是否重复；
     * 如果名称重复，则删除新增的目录节点，并给出提示
     * @param treeNode
     */
    function addNodeSuccess(treeNode, templateId) {
        treeNode.id = templateId;
        $catalogTree.updateNode(treeNode);
        selectSpecialNode(treeNode);
        $.messager.alert('温馨提示', '保存成功');
    }

    function addNodeFailure(treeNode) {
        $catalogTree.removeNode(treeNode);
        $.messager.alert('温馨提示', '目录名称不能重复!');
    }

    /**
     * 获取zTree树结构的根节点
     */
    function getRootNode() {
        return $catalogTree.getNodesByFilter(filter, true);

        function filter(node) {
            return node.level == 0;
        }
    }

    /**
     * 构造zTree树节点数据集合
     */
    function constructNodeArr(options) {
        var needAddNodeArr = [];
        $.each(options, function (index, option) {
            needAddNodeArr.push({
                id: option.CATLID,
                parentId: option.SUPRCATLID,
                level: option.LEVEL,
                name: option.CATLNM,
                isParent: option.ISPARENT
            });
        });
        return needAddNodeArr;
    }

    /**
     * 更新树操作菜单上移下移状态
     */
    function updateMoveStatusOfTree(treeNode) {
        if (treeNode.getPreNode() != null) {
            if ($("#moveUp-catalog").hasClass("disabled")) {
                $("#moveUp-catalog").removeClass("disabled");
                $("#moveUp-catalog").attr("disabled", false);
                $("#moveUp-catalog").css("pointer-events", "auto");
            }
        } else {
            if (!$("#moveUp-catalog").hasClass("disabled")) {
                $("#moveUp-catalog").addClass("disabled");
                $("#moveUp-catalog").attr("disabled", true);
                $("#moveUp-catalog").css("pointer-events", "none");
            }
        }
        if (treeNode.getNextNode() != null) {
            if ($("#moveDown-catalog").hasClass("disabled")) {
                $("#moveDown-catalog").removeClass("disabled");
                $("#moveDown-catalog").attr("disabled", false);
                $("#moveDown-catalog").css("pointer-events", "auto");
            }
        } else {
            if (!$("#moveDown-catalog").hasClass("disabled")) {
                $("#moveDown-catalog").addClass("disabled");
                $("#moveDown-catalog").attr("disabled", true);
                $("#moveDown-catalog").css("pointer-events", "none");
            }
        }
    }

    /**
     * 更新树操作菜单增删改状态
     */
    function updateOperateStatusOfTree(treeNode) {
        if (treeNode.level == 0) {
            if (!$("#edit-catalog").hasClass("disabled")) {
                $("#edit-catalog").addClass("disabled");
                $("#edit-catalog").attr("disabled", true); //IE下起作用
                $("#edit-catalog").css("pointer-events", "none");
            }
            if (!$("#delete-catalog").hasClass("disabled")) {
                $("#delete-catalog").addClass("disabled");
                $("#delete-catalog").attr("disabled", true);
                $("#delete-catalog").css("pointer-events", "none");
            }
        } else {
            if ($("#edit-catalog").hasClass("disabled")) {
                $("#edit-catalog").removeClass("disabled");
                $("#edit-catalog").attr("disabled", false);
                $("#edit-catalog").css("pointer-events", "auto");
            }
            if ($("#delete-catalog").hasClass("disabled")) {
                $("#delete-catalog").removeClass("disabled");
                $("#delete-catalog").attr("disabled", false);
                $("#delete-catalog").css("pointer-events", "auto");
            }
        }
        updateMoveStatusOfTree(treeNode);
    }

    /**
     * 异步加载当前选中节点的子节点集合
     * @param options
     */
    function initLoadRootNodeSubNodes(options) {
        var isInitialTreeLoad = null == currentSelectCatalog;
        var subNodeLevel = isInitialTreeLoad ? 1 : currentSelectCatalog.level + 1;
        var transformedNodeArr = constructNodeArr(options);
        if (transformedNodeArr.length == 0) {
            return;
        }
        if (isInitialTreeLoad) { // 初始化树时加载数据,则当前选中节点默认为根节点
            $catalogTree.addNodes(rootNode, -1, transformedNodeArr, false);
        } else {
            $catalogTree.addNodes(currentSelectCatalog, -1, transformedNodeArr, false);
        }
        //按照节点的层级，使b不同层级的节点往左偏离15px
        $(".ztree li span.button.switch.level" + subNodeLevel).css("margin-left", subNodeLevel * 15 + "px");
    }

    /**
     *  删除目录数据及页面view
     */
    function deleteNode() {
        $.messager.confirm('温馨提示', '确定要删除该模板目录吗？', function (option) {
            if (option) {
                Interactive.deleteCatalogInfo(currentSelectCatalog, deleteNodeSuccess);
            }
        });
    }

    function deleteNodeSuccess(serviceResponse) {
        $catalogTree.removeNode(currentSelectCatalog);
        var selectNode = currentSelectCatalog.getParentNode();
        $catalogTree.selectNode(selectNode, false, true); //选中被删除节点的父节点
        selectSpecialNode(selectNode);
        $.messager.alert('温馨提示', '删除目录成功');
    }

    /**
     *校验是否存在空字符串或者或者非法字符或者字符过长
     * @param treeNode
     * @returns {boolean}
     */
    function existIllegalCharterOfCatalogName(treeNode) {
        var nodeName = treeNode.name.trim();
        return nodeName.length == 0 || nodeName.indexOf("\"") != -1 || nodeName.indexOf("\'") != -1 || nodeName.indexOf("“") != -1 || nodeName.indexOf("‘") != -1 || nodeName.length > 30; //|| /[~!@#$%^&*()/\|,.<>?();:_+-=\[\]{}]/.test(nodeName)

    }

    /**
     *校验是否存在重复名称
     * @param treeNode
     * @returns {boolean}
     */
    function existRenameOfCatalogName(treeNode) {
        var renameNode = $catalogTree.getNodesByFilter(filter, true);
        return null != renameNode;

        function filter(node) {
            return node.id != treeNode.id && node.level == treeNode.level && node.name == treeNode.name;
        }
    }

    /**
     * 增加目录节点，并使其进入名称可编辑状态
     */
    function addNodeView(subNodeLevel) {
        var needAddNodeArr = [{
            name: "新建目录",
            level: subNodeLevel,
            isParent: false,
            parentId: currentSelectCatalog.id,
            id: "unique"
        }];
        $catalogTree.addNodes(currentSelectCatalog, -1, needAddNodeArr, false);
        $(".ztree li span.button.switch.level" + subNodeLevel).css("margin-left", subNodeLevel * 15 + "px");
        var newAddNode = $catalogTree.getNodesByFilter(filter, true); // 查找新增节点
        $catalogTree.editName(newAddNode);

        function filter(node) {
            return node.id == needAddNodeArr[0].id;
        }
    }

    function getCurrentSelectCatalog() {
        return currentSelectCatalog;
    }

    return {
        initialize: initialize,
        getCurrentSelectCatalog: getCurrentSelectCatalog
    }
});