define(["jquery", 'util', "transfer"], function ($, Util, Transfer) {


    var getKnowledgeCatalogArr = function (catalogId, func) {
        $.ajax({
            url: "../../data/knowledgeCatalog.json",
            dataType: "json",
            type: "GET",
            async: true,
            contentType: 'application/json;charset=utf-8',
            data: {},
            success: function (data) {
                func(data);
            }
        });
    };

    /**
     * 通过地区编号获取地区信息
     * @param 地区编号
     */
    var getDistrictByRegionId = function (regionId) {
        Util.ajax.getJson("http://localhost:9001".concat(Util.constants.DISTRICT_DNS).concat("/").concat(regionId), null, function (result) {
                console.log(result);
            }
        );
    };

    /**
     *通过一级知识目录编号获取其子节点集合
     * @param 一级知识目录编号
     */
    var getSubCatalogsBySuperId = function (regionId) {
        Util.ajax.getJson("http://localhost:9003".concat(Util.constants.KONOWLEDGE_CATALOOG_DNS).concat("/subCatalogs/").concat(regionId), null, function (result) {
                console.log(result);
            }
        );
    };

    /**
     *
     * @param 通过地区编号获取一级知识目录集合
     */
    var gerSubCatalogsByParentId = function () {
        Util.ajax.getJson("http://localhost:9003".concat(Util.constants.KONOWLEDGE_CATALOOG_DNS).concat("/queryDocCatalog"), {"codeValue": "0"}, function (result) {
                console.log(result);
            }
        );
    };

    return {
        getKnowledgeCatalogArr: getKnowledgeCatalogArr,
        getDistrictByRegionId: getDistrictByRegionId,
        getSubCatalogsBySuperId: getSubCatalogsBySuperId,
        gerSubCatalogsByParentId: gerSubCatalogsByParentId
    }
})
;