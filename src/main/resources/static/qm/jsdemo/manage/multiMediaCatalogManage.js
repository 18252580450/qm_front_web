require(["jquery", "loading", "multiMediaInteractive", "catalogTreeManage", "multiMediaInfoManage", "easyui", 'ztree-exedit'], function ($, Loading, Interactive, CatalogTree, MultiMediaManage) {

    initialize();

    function initialize() {
        Loading.showLoading("正在加载，请稍后");
        addGlobalLayout();
        var treeOptions = {
            $treeLayout: $("#multiMediaCatalog"),
            rootNodeId: 0,
            $treeId: $("#multiMediaTree"),
            interactive: Interactive,
            clickNodeAction: MultiMediaManage.refreshGrid
        };
        CatalogTree.initialize(treeOptions);
        MultiMediaManage.initialize({catalogTree: CatalogTree});
        Loading.destroyLoading();
    }

    function addGlobalLayout() {
        $([
            "<div id='treeLayout' data-options=\"region:'west',split:'false'\" title = '多媒体素材目录' class= 'text_omission' style = 'width:20%;height: 100%;' >",
            "<div class='ke-panel-content clear-overlap' style='height: 60px;'>",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-add' title='添加' href='#nogo' id='add-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-edit disabled' title='编辑' href='#nogo' id='edit-catalog'style='cursor:pointer;'></a></li>",
            "<li><a class='clk-del disabled' title='删除' href='#nogo' id='delete-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-up disabled' title='上移' href='#nogo' id='moveUp-catalog' style='cursor:pointer;'></a> </li>",
            "<li><a class='clk-down disabled' title='下移' href='#nogo' id='moveDown-catalog' style='cursor:pointer;'></a></li></ul>",
            "<p style='cursor:pointer;padding-top: 10px ;height:20px;padding-left:22px'>公共属性</p>",
            "</div>",
            "<div id='multiMediaTree' style='height:85%;width:100%;overflow: auto;' class='ztree'>",
            "</div>",
            "</div>",
            "<div data-options=\"region:'center'\" title='多媒体素材管理' class= 'text_omission' style='padding:5px;width:75%;height: 100%;' id='multiMediaLayout'>", ,

            "<div id='multiMediaSearchLayout' data-options=\"region:'north',split:false\" style='width: 100%; height: 25%;'title=''class='panel-body panel-body-noheader layout-body'>",
            "</div>",
            "<div id= 'multiMediaManage' class='easyui-layout' data-options=\"region:'center',fit='true'\" style='width: 100%; height: 75%;margin-top: 10px;'>",
            "</div>",
            "</div>",
            "</div>",
            "</div>"
        ].join("")).appendTo($("#multiMediaCatalog"));
        $(document).find("#multiMediaCatalog").layout();
    }
});
