define(["jquery", 'util', "transfer"], function ($, Util, Transfer) {

    var getSubNodesByParentNodeId = function (catalogId, method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/catalog/subs/").concat(catalogId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA);
            }
        });
    };

    var insertCatalogInfo = function (treeNode, success, failure) {
        if (null == treeNode) {
            return;
        }
        var result;
        $.ajax({
            type: "POST",//请求方式
            async: false,//是否异步,
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify({
                CATLNM: treeNode.name,
                LEVEL: treeNode.level,
                ISPARENT: treeNode.isParent,
                SUPRCATLID: treeNode.parentId
            }),
            url: Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/catalog/"),
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    success(treeNode, serviceResponse.RSP.DATA[0].CATLID);
                } else {
                    failure(treeNode);
                }
            },
            error: function (serviceResponse) {//请求失败时执行
                $.messager.alert('温馨提示', '添加目录失败');
            }
        });
        return result;
    };

    var updateCatalogInfo = function (catalogNode, method) {
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/catalog/"), JSON.stringify({
            "CATLID": catalogNode.id,
            "CATLNM": catalogNode.name,
            "SUPRCATLID": catalogNode.parentId
        }, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method();
            }
        }));
    };

    /**
     * 删除目录
     * @returns {*}
     */
    var deleteCatalogInfo = function (catalogNode, method) {
        Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/catalog/").concat(catalogNode.id), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method();
            }
        });
    };

    /**
     * 上下移动目录，注意只能同层移动
     * @returns {*}
     */
    var moveCatalogNode = function (targetNode, moveNodeId, method) {
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/catalog/").concat(targetNode.id).concat("/").concat(moveNodeId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(targetNode);
            }
        });
    };

    /**
     * 新增多媒体素材信息
     */
    var insertMultiMediaInfo = function (multiMediaInfo, success, failure) {
        if (null == multiMediaInfo) {
            return;
        }
        var result;
        $.ajax({
            type: "POST",//请求方式
            async: true,//是否异步,
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(multiMediaInfo),
            url: Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/"),
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    success();
                } else {
                    failure();
                }
            },
            error: function (serviceResponse) {//请求失败时执行
                $.messager.alert('温馨提示', '添加]多媒体素材失败');
            }
        });
        return result;
    };

    /**
     * 删除多媒体素材信息
     */
    var deleteMultiMediaInfo = function (options, method) {
        Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/").concat(options.multiMediaIds), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(options.multiMediaInfos);
            }
        });
    };

    /**
     * 更新多媒体素材信息
     */
    var updateMultiMediaInfo = function (multiMediaInfo, method) {
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/"), JSON.stringify(multiMediaInfo), function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method();
            }
        });
    };

    /**
     * 根据目录编号获取多媒体素材信息
     */
    var getTemplateByCatalogId = function (catalogId, method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/parent/").concat(catalogId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA);
            }
        });
    };

    /**
     * 根据条件获取多媒体素材信息
     */
    var getMultiMediaInfosByClause = function (multiMediaInfo, method) {
        if (null == multiMediaInfo) {
            return;
        }
        $.ajax({
            url: Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/search"),
            type: "POST",
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            async: false,//是否异步
            data: JSON.stringify(multiMediaInfo),
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    method(serviceResponse.RSP.DATA);
                }
            },
            error: function (result) {
            }
        });
    };

    var transferServiceResponse = function (serviceResponse) {
        return serviceResponse.STATUS == "0000" && serviceResponse.RSP.RSP_CODE == "1";
    };

    var uploadMultiMedia = function (options, uploadSuccessAction, existErrorAction) {
        options.$uploadForm.form('submit', {
            url: Util.constants.CONTEXT.concat(Util.constants.MULTIMEDIA_DNS).concat("/info/upload"),
            method: "POST",
            dataType: "json",
            async: false,
            onSubmit: function (serviceResponse) {
                serviceResponse;
            },
            success: function (serviceResponse) {
                serviceResponse = JSON.parse(serviceResponse);
                if (serviceResponse.RSP.RSP_CODE == "1") {
                    uploadSuccessAction(serviceResponse.RSP.DATA[0]["ATTACHID"]);
                } else if (serviceResponse.RSP.RSP_CODE == "2") {
                    existErrorAction(serviceResponse.RSP.RSP_DESC);
                }
            },
            error: function (data) {
                $.messager.alert("提示", "操作异常！");
            }
        });
    };

    return {
        getSubNodesByParentNodeId: getSubNodesByParentNodeId,
        insertCatalogInfo: insertCatalogInfo,
        updateCatalogInfo: updateCatalogInfo,
        deleteCatalogInfo: deleteCatalogInfo,
        moveCatalogNode: moveCatalogNode,
        insertMultiMediaInfo: insertMultiMediaInfo,
        deleteMultiMediaInfo: deleteMultiMediaInfo,
        updateMultiMediaInfo: updateMultiMediaInfo,
        getMultiMediaInfosByClause: getMultiMediaInfosByClause,
        getTemplateByCatalogId: getTemplateByCatalogId,
        transferServiceResponse: transferServiceResponse,
        uploadMultiMedia: uploadMultiMedia
    }
});
