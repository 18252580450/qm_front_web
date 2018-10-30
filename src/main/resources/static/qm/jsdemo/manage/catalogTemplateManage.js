require(["jquery", "loading", 'util', "catalogTreeManage", "templateManage", "catalogTemplateInteractive"], function ($, Loading, Util, CatalogTree, TemplateManage, Interactive) {

    initialize();

    function initialize() {
        Loading.showLoading("正在加载，请稍后");
        addGlobalLayout();
        var treeOptions = {
            $treeLayout: $("#kmTemplateCatalog"),
            rootNodeId: 0,
            $treeId: $("#catalogTree"),
            interactive: Interactive,
            clickNodeAction: TemplateManage.refreshTemplateGrid
        };
        CatalogTree.initialize(treeOptions);
        TemplateManage.initialize({catalogTree: CatalogTree});
        Loading.destroyLoading();
    }

    function addGlobalLayout() {
        $([
            "<div id='treeLayout' data-options=\"region:'west',split:'false'\" title = '知识模板目录' class= 'text_omission' style = 'width:20%;height: 100%;' >",
            "<div class='ke-panel-content clear-overlap' style='height: 60px;'>",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-add' title='添加' href='#nogo' id='add-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-edit disabled' title='编辑' href='#nogo' id='edit-catalog'style='cursor:pointer;'></a></li>",
            "<li><a class='clk-del disabled' title='删除' href='#nogo' id='delete-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-up disabled' title='上移' href='#nogo' id='moveUp-catalog' style='cursor:pointer;'></a> </li>",
            "<li><a class='clk-down disabled' title='下移' href='#nogo' id='moveDown-catalog' style='cursor:pointer;'></a></li></ul>",
            "<p style='cursor:pointer;padding-top: 10px ;height:20px;padding-left:22px'>公共属性</p>",
            "</div>",
            "<div id='catalogTree' style='height:85%;width:100%;overflow: auto;' class='ztree'>",
            "</div>",
            "</div>",
            "<div   data-options=\"region:'center'\" title='模板管理' class= 'text_omission' style='padding:5px;width:75%;height: 100%;' id='templateLayout'>",
            //"<div data-options=\"region:'center',iconCls:'icon-ok'\" title='Center' style='padding:5px;width: 100%; height: 100%;'>",

            "<div id='templateSearchLayout' data-options=\"region:'north',split:false\" style='width: 100%; height: 25%;'title=''class='panel-body panel-body-noheader layout-body'>",
            "</div>",
            "<div id= 'templateManage' class='easyui-layout' data-options=\"region:'center',fit='true'\" style='width: 100%; height: 75%;margin-top: 10px;'>",
            "</div>",
            "</div>",
            "</div>",
            "</div>",
            "</div>"
        ].join("")).appendTo($("#kmTemplateCatalog"));
        $(document).find("#kmTemplateCatalog").layout();
    }
});
