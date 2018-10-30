define(['hdb', 'js/app/appInteractive', 'text!js/app/knowledgeCatalogTree.tpl', 'text!js/app/kcMenuContainer.tpl'], function (Hdb, Interactive, catalogTreeTpl, menuContainerTpl) {
    //

    var initKnowledgeCatalogTree = function () {
        Interactive.gerSubCatalogsByParentId(triggerKnowledgeCatalogTree);
    };

    var initMenuContainer = function (catalogId) {
        Interactive.getSubCatalogsBySuperId(catalogId, triggerMenuContainer);
    };

    function triggerKnowledgeCatalogTree(data) {
        var template = Hdb.compile(catalogTreeTpl);
        $(".kc-menu-container").html(template({
            nodes: data,
            isNotEmpty: data.length != 0
        }));
    };

    function triggerMenuContainer(data) {
        var template = Hdb.compile(menuContainerTpl);
        $(".kc-menu").html(template({
            subNodes: data,
            isNotEmpty: data.length != 0
        }));
    }

    function triggerAction() {
        /*Interactive.getDistrictByRegionId("771");
        Interactive.getSubCatalogsBySuperId("10100000");
        Interactive.gerSubCatalogsByParentId();
        Interactive.getLatestPubDoc();
        Interactive.getKnowledgeByKeyWords();*/
        Interactive.getKnowledgeByTempletFilter();
    }

    return {
        initKnowledgeCatalogTree: initKnowledgeCatalogTree,
        initMenuContainer: initMenuContainer
    }
});


