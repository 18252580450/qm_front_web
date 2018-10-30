define(["jquery", 'util', "transfer"], function ($, Util, Transfer) {

    /**
     * 通过父节点id获取子节点集合
     * @returns {*}
     */
    var getSubNodesByParentNodeId = function (catalogId, method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/subs/").concat(catalogId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA);
            }
        });
    };

    /**
     * 添加目录
     * @returns {*}
     */
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
            url: Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/"),
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

    /**
     * 修改目录
     * @returns {*}
     */
    var updateCatalogInfo = function (catalogNode, method) {
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/"), JSON.stringify({
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
        Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/").concat(catalogNode.id), {}, function (serviceResponse) {
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
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/").concat(targetNode.id).concat("/").concat(moveNodeId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(targetNode);
            }
        });
    };

    /**
     * 删除模板
     */
    var deleteTemplateInfo = function (options, method) {
        Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/").concat(options.templateIds), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(options.templateInfos);
            }
        });
    };

    /**
     * 目录树
     */
    var getSuitableOfTreeList = function () {
        var regionList;
        $.ajax({
            url: Util.constants.CONTEXT.concat(Util.constants.TEMPLET_CATALOG_DNS).concat("/docCatalog/getCatalog"),
            type: "GET",
            async: false,//是否异步
            contentType: 'application/json;charset=utf-8',
            data: {
                "id": "0"
            },
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    regionList = serviceResponse.RSP.DATA["0"].children;
                }
            },
            error: function (result) {
            }
        });
        return regionList;
    };

    /**
     * 根据条件获取模板列表
     */
    var getKmTmpltInfoListByClause = function (templetInfo, method) {
        if (null == templetInfo) {
            return;
        }
        var templetInfoList;
        $.ajax({
            url: Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/"),
            type: "POST",
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            async: false,//是否异步
            data: JSON.stringify(templetInfo),
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    method(serviceResponse.RSP.DATA);
                }
            },
            error: function (result) {
            }
        });
        return templetInfoList;
    };

    /**
     * 获取渠道
     */
    var getStaticDataByTypeId = function (codeType, method) {
        if (null == codeType) {
            return;
        }
        var templetInfoList;
        $.ajax({
            type: "GET",
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            url: Util.constants.CONTEXT.concat("/kmconfig/getStaticDataByTypeId"),
            async: false,//是否异步
            data: {
                "typeId": codeType
            },
            success: function (serviceResponse) {//返回消息
                if (transferServiceResponse(serviceResponse)) {
                    templetInfoList = serviceResponse.RSP.DATA;
                }
            },
            error: function (result) {
            }
        });
        return templetInfoList;
    };

    /**
     * 根据目录编号获取模板列表
     */
    var getTemplateByCatalogId = function (catalogId, method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/parent/").concat(catalogId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA);
            }
        });
    };

    /**
     * 获取已审核模板列表
     */
    var getTemplateListOfAudited = function (method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/common/audited"), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA);
            }
        });
    };

    /**
     * 获取常用模板列表
     */
    var getComTemplateList = function (method) {
        Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/common/all"), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                $.each(serviceResponse.RSP.DATA, function (index, customTemplet) {
                    method(customTemplet);
                });
            }
        });
    };

    /**
     * 根据模板名称获取常用模板列表
     */
    var getComTemplateListByName = function (template, method) {
        $.ajax({
            url: Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/search"),
            type: "POST",
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(template),
            async: true,
            success: function (serviceResponse) {
                if (transferServiceResponse(serviceResponse)) {
                    method(serviceResponse.RSP.DATA);
                }
            }
        });
    };

    /**
     * 添加常用模板
     */
    var addComTempletInfo = function (templetId, method) {
        Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/common/").concat(templetId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(serviceResponse.RSP.DATA[0]);
            } else {
                $.messager.alert('温馨提示', '该常用模型已经存在');
            }
        });
    };

    /**
     * 删除常用模板
     */
    var deleteComTempletInfo = function (comTempletId, method) {
        Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/common/").concat(comTempletId), {}, function (serviceResponse) {
            if (transferServiceResponse(serviceResponse)) {
                method(comTempletId);
            }
        });
    };

    var transferServiceResponse = function (serviceResponse) {
        return serviceResponse.STATUS == "0000" && serviceResponse.RSP.RSP_CODE == "1";
    };

    var uploadFileAction = function (options, uploadSuccessAction, existErrorAction) {
        options.$uploadForm.form('submit', {
            url: Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/upload"),
            method: "POST",
            dataType: "json",
            onSubmit: function () {

            },
            success: function (serviceResponse) {
                serviceResponse = JSON.parse(serviceResponse);
                if (serviceResponse.RSP.RSP_CODE == "1") {
                    uploadSuccessAction(serviceResponse.RSP.DATA);
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
        deleteTemplateInfo: deleteTemplateInfo,
        getSuitableOfTreeList: getSuitableOfTreeList,
        getKmTmpltInfoListByClause: getKmTmpltInfoListByClause,
        getStaticDataByTypeId: getStaticDataByTypeId,
        getTemplateByCatalogId: getTemplateByCatalogId,
        getTemplateListOfAudited: getTemplateListOfAudited,
        getComTemplateList: getComTemplateList,
        getComTemplateListByName: getComTemplateListByName,
        addComTempletInfo: addComTempletInfo,
        deleteComTempletInfo: deleteComTempletInfo,
        transferServiceResponse: transferServiceResponse,
        uploadFileAction: uploadFileAction
    }
});
