define(["jquery", "loading", 'util','hdb','ztree-exedit', 'text!html/manage/KnowledgePath.tpl'],
    function ($, Loading, Util, Hdb, easyui,ztree, Dragsort) {
        var zTreeObjPath;
        var tempAddObj = [];
        var tempAllObj = [];
        var tempOneObj = [];
        var statusFlag;
        var htmlArr = [];
        var flag;
        var dialogConfig;
        var addDialog;
        var oneDialog;
        //var _provnce;
        var catIdTemp;
        var allDialog;
        var _refrshParam;


        var checkPath = function (catlId) {
            var flag = "true";
            var param = {
                id: catlId,
                type: "1"
            }
            Util.ajax.ajax({
                type: "GET",
                url: Util.constants.CONTEXT + "/permissionManage/getPermByCatlId",
                data: param,
                async: false,
                dataType: "json",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                success: function (data) {
                    var permData = [];
                    if (data.returnCode == '0') {
                        permData = data.beans;
                    }
                    if (permData.length < 1) {
                        flag = "false";
                    } else {
                        flag = "true";
                    }
                },
                error: function (data) {
                    if (data.returnMessage != undefined && "" != data.returnMessage) {
                        new Dialog({
                            mode: 'tips',
                            delayRmove: 3,
                            tipsType: 'error',
                            content: data.returnMessage,
                            quickClose: true,
                            height: 20
                        });
                    } else {
                        new Dialog({
                            mode: 'tips',
                            delayRmove: 3,
                            tipsType: 'error',
                            content: '操作失败',
                            quickClose: true,
                            height: 20
                        });
                    }

                }
            })
            return flag;

        }

        var addPath = function (pArr, tempAddObj) {
            var itemHtml = '';
            var minId = pArr[pArr.length - 1].id;
            if (checkPath(minId) == "true") {
                for (var i = 0; i < pArr.length; i++) {
                    var item = pArr[i];
                    itemHtml += item.name + ((i == (pArr.length - 1)) ? '' : '/');
                }
                htmlArr.push(itemHtml);
                $("#knowledgePathList").append('<li><span class="link-blue" catlId="' + minId + '" title="' + itemHtml + '">' + itemHtml + '</span><a class="jf-reclicksa formwork-del"  style="cursor:pointer;"></a></li>');
                tempAddObj.push(minId);
                manyPathRemove(htmlArr, tempAddObj);
                if (statusFlag != "all") {
                    $("#knowledgePathList").dragsort("destroy");
                    $("#knowledgePathList").dragsort({
                        dragSelector: "span",
                        scrollContainer: $(".ui-dialog-content"),
                        scrollSpeed: 0
                    });
                }
            } else {
                var confirmConfig = {
                    mode: 'confirm',
                    id: 'confirmId',
                    content: '该目录没有配置任何浏览权限，确认添加吗？'
                };
                var delConfirm = new Dialog(confirmConfig);
                delConfirm.on('confirm', function () {
                    for (var i = 0; i < pArr.length; i++) {
                        var item = pArr[i];
                        itemHtml += item.name + ((i == (pArr.length - 1)) ? '' : '/');
                    }
                    htmlArr.push(itemHtml);
                    $("#knowledgePathList").append('<li ><span class="link-blue" catlId="' + minId + '" title="' + itemHtml + '">' + itemHtml + '</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                    tempAddObj.push(minId);
                    manyPathRemove(htmlArr, tempAddObj);
                    if (statusFlag != "all") {
                        $("#knowledgePathList").dragsort("destroy");
                        $("#knowledgePathList").dragsort({
                            dragSelector: "span",
                            scrollContainer: $(".ui-dialog-content"),
                            scrollSpeed: 0
                        });
                    }
                })
            }


        };

        var addAddPath = function (pArr, tempAddObj, htmlArr) {
            var itemHtml = '';
            var minId = pArr[pArr.length - 1].id;
            if (checkPath(minId) == "true") {
                for (var i = 0; i < pArr.length; i++) {
                    var item = pArr[i];
                    itemHtml += item.name + ((i == (pArr.length - 1)) ? '' : '/');
                }
                htmlArr.push(itemHtml);
                $("#knowledgePathList").append('<li><span class="link-blue" catlId="' + minId + '" title="' + itemHtml + '">' + itemHtml + '</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                tempAddObj.push(minId);
                $("#knowledgePathList").dragsort("destroy");
                $("#knowledgePathList").dragsort({
                    dragSelector: "span",
                    scrollSpeed: 0
                });
            } else {
                var confirmConfig = {
                    mode: 'confirm',
                    id: 'confirmId',
                    content: '该目录没有配置任何浏览权限，确认添加吗？'
                };
                var delConfirm = new Dialog(confirmConfig);
                delConfirm.on('confirm', function () {
                    for (var i = 0; i < pArr.length; i++) {
                        var item = pArr[i];
                        itemHtml += item.name + ((i == (pArr.length - 1)) ? '' : '/');
                    }
                    htmlArr.push(itemHtml);
                    $("#knowledgePathList").append('<li ><span class="link-blue" catlId="' + minId + '" title="' + itemHtml + '">' + itemHtml + '</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                    tempAddObj.push(minId);
                    manyPathRemove(htmlArr, tempAddObj);
                    $("#knowledgePathList").dragsort("destroy");
                    $("#knowledgePathList").dragsort({
                        dragSelector: "span"
                    });
                })
            }
        };

        var addNamePath = function (tempAddObj, htmlArr, name, value) {
            var valueArray = [];
            valueArray = value.split(",");
            var nameArray = [];
            nameArray = name.split(",");
            for (var i = 0; i < nameArray.length; i++) {
                if (valueArray[i]) {
                    $("#knowledgePathList").append('<li ><span class="link-blue" catlid="' + valueArray[i] + '" title="' + nameArray[i] + '">' + nameArray[i] + '</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                } else {
                    $("#knowledgePathList").append('<li ><span class="link-blue" title="' + nameArray[i] + '">' + nameArray[i] + '</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                }
                htmlArr.push(nameArray[i]);
            }
            for (var i = 0; i < valueArray.length; i++) {
                tempAddObj.push(valueArray[i]);
            }
        };

        var addKnowledgePath = function (length, tempAddObj, pArr) {
            if (length > 2) {
                new Dialog({
                    mode: 'tips',
                    content: '知识路径最多为3条，无法再次添加！'
                });
                return false;
            }
            for (var i = 0; i < tempAddObj.length; i++) {
                if (pArr[pArr.length - 1].id == tempAddObj[i]) {
                    new Dialog({
                        mode: 'tips',
                        content: '该知识路径已存在，不能重复添加！'
                    });
                    return false;
                }
            }
            addAddPath(pArr, tempAddObj, htmlArr);
//             manyPathRemove(htmlArr, tempAddObj);
        }

        var addOnePath = function (length, tempOneObj, pArr) {
            if (length > 2) {
                new Dialog({
                    mode: 'tips',
                    content: '知识路径最多为3条，无法再次添加！'
                });
                return false;
            }
            for (var i = 0; i < tempOneObj.length; i++) {
                if (pArr[pArr.length - 1].id == tempOneObj[i]) {
                    new Dialog({
                        mode: 'tips',
                        content: '该知识路径已存在，不能重复添加！'
                    });
                    return false;
                }
            }
            addPath(pArr, tempOneObj);
        }

        var manyPathRemove = function (htmlArr, tempOneObj) {
            $('.jf-reclicksa').off('click');
            $('.jf-reclicksa').on('click', function () {
                var name = $(this).prev().html();
                for (var i = 0; i < htmlArr.length; i++) {
                    if (name == htmlArr[i]) {
                        htmlArr.splice(i, 1);
                        tempOneObj.splice(i, 1);
                        $(this).parent().remove();
                    }
                }
            });
        }

        //点击树选择取消路径
        function zTreeOnClickKnow(event, treeId, treeNode) {
            if (treeNode == "undefined" || treeNode == null) {
                new Dialog({
                    mode: 'tips',
                    tipsType: 'error',
                    content: '请先选中知识路径！'
                });
                return false;
            }
            if (typeof(treeNode) == 'object') {
                catlId = treeNode.id;
            }
            if (catlId == '0') {
                new Dialog({
                    mode: 'tips',
                    tipsType: 'error',
                    content: '禁止在根目录下添加知识！'
                });
                return false;
            }
            var nodePath = treeNode.getPath();
            var pArr = [];
            $(nodePath).each(function () {
                pArr.push({
                    'id': this.id,
                    'name': this.name,
                    'pId': this.pId,
                    'isParent': this.isParent
                });
            });
            var length = $("#knowledgePathList").children("li").length;
            if (statusFlag == "one") {
                addOnePath(length, tempOneObj, pArr);

            } else if (statusFlag == "all") {
                if (length > 0) {
                    new Dialog({
                        mode: 'tips',
                        content: '请先删除路径！'
                    });
                    return;
                } else {
                    addPath(pArr, tempAllObj);
                    $('.jf-reclicksa').off('click');
                    $('.jf-reclicksa').on('click', function () {
                        var name = $(this).prev().html();
                        for (var i = 0; i < htmlArr.length; i++) {
                            if (name == htmlArr[i]) {
                                htmlArr.splice(i, 1);
                                tempAllObj.splice(i, 1);
                                $(this).parent().remove();
                            }
                        }
                    });
                }

            } else if (statusFlag == undefined) {
                addKnowledgePath(length, tempAddObj, pArr);
//                manyPathRemove(htmlArr, tempAddObj);

                $('.jf-reclicksa').off('click');
                $('.jf-reclicksa').on('click', function () {
                    var name = $(this).prev().html();
                    for (var i = 0; i < htmlArr.length; i++) {
                        if (name == htmlArr[i]) {
                            htmlArr.splice(i, 1);
                            tempAddObj.splice(i, 1);
                            $(this).parent().remove();
                        }
                    }
                });
            }
        }

        var treeConfigPath = {
            hasLine: false,//是否有节点连线
            callback: {
                onClick: zTreeOnClickKnow
            },
            async: {
                enable: true,//是否开启异步加载模式
                //以下配置,async.enable=true时生效
                url: Util.constants.CONTEXT + "/docCatalog/getCatalog?time=" + new Date().getTime(),//Ajax获取数据的地址
                type: "get",//Ajax的http请求模式
                autoParam: ["id"],//异步加载时需要自动提交父节点属性的参数
                dataFilter: function (treeId, parentNode, childNodes) {
                    if (!childNodes) {
                        return null
                    }
                    ;
                    var tempArr = [];
                    $(childNodes.beans).each(function () {
                        var temp = {};
                        temp.id = this.id;
                        temp.name = this.name;
                        temp.isParent = this.isParent;
                        tempArr.push(temp);
                    });
                    return tempArr;
                }
            },
            data: {
                simpleData: {
                    enable: true
                }
            }
        };

        var zTreeInit11 = function () {
            Util.ajax.ajax({
                type: "GET",
                url: Util.constants.CONTEXT + "/catalogs?id=0&time=" + new Date().getTime(),
                success: function (datas) {
                    var treeData = datas.beans;
                    zTreeObjPath = $.fn.zTree.init($('#treeDemo'), treeConfigPath, treeData);
                    var node = zTreeObjPath.getNodesByParam("id", "0", null)[0];
                    zTreeObjPath.selectNode(node);
                },
                error: function () {
                    console.log("==================================加载业务树失败！");
                }
            });

        }

        var onePathOk = function (knwlgId, tempOneObj, htmlArr) {
            //支持路径拖拽,需要从界面获取最新顺序
            var html = $("#knowledgePathList").find(".link-blue");
            var catArray = [];
            for (var i = 0; i < html.length; i++) {
                catArray.push($(html[i]).attr("catlId"));
            }
//           var catlId1 = tempOneObj;
            catlId1 = catArray.join(",");
            var condition = {
                knwlgId: knwlgId,
                catlId1: catlId1
            };
            Util.ajax.postJson(Util.constants.CONTEXT + '/docCatalog/updateKnowledgeCatalog', condition, function (json, status) {
                if (status) {
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'success',
                        content: '保存成功！'
                    });
                } else {
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'error',
                        delayRmove: 3,
                        maxWidth: '500px', //设置tips弹窗的最大宽度,默认为226px；
                        maxHeight: 'auto',
                        content: json.returnMessage
                    });
                    return false;
                }
            }, true);
        }

        var allPathOk = function (catlId, knwlgId) {
            console.log(tempAllObj);
            var catlupId = tempAllObj[tempAllObj.length - 1];
            if (catIdTemp == catlupId) {
                new Dialog({
                    mode: 'tips',
                    content: '路径未改变，请点击取消或重新选择路径！'
                });
                return false;
            }
            var condition = {
                catlId: catlId,
                catlupId: catlupId,
                knlwlist: knwlgId
            };
            Util.ajax.getJson(Util.constants.CONTEXT + '/docCatalog/updatecatlIdByAllRlId', condition, function (json, status) {
                if (json.returnCode == '0') {
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'success',
                        content: json.returnMessage
                    });
                    _dataList.search(_refrshParam);
                    allDialog.on('onclose', function () {
                        tempAllObj = [];
                        htmlArr = [];
                    });
                } else {
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'error',
                        delayRmove: 3,
                        maxWidth: '500px', //设置tips弹窗的最大宽度,默认为226px；
                        maxHeight: 'auto',
                        content: json.returnMessage
                    });
                    return false;
                }
            }, true);
        }

        var knowledgePathOk = function ($name, $value, tempAddObj, htmlArr) {
            var html = $("#knowledgePathList").find(".link-blue");
            var catArray = [];
            for (var i = 0; i < html.length; i++) {
                if ($(html[i]).attr("catlId")) {
                    catArray.push($(html[i]).attr("catlId"));
                }
            }
            var nameArray = [];
            for (var i = 0; i < html.length; i++) {
                if ($(html[i]).attr("title")) {
                    nameArray.push($(html[i]).attr("title"));
                }
            }
//            var name = htmlArr.join(",");
            var name = nameArray.join(",");
            $name.val(name);
//            $value.val(tempAddObj);
            $value.val(catArray);
            $name.attr('title', name);
            addDialog.on('onclose', function () {
                tempAddObj = [];
                htmlArr = [];
            });
        }

        var onePathEnter = function (knwlgId, htmlArr, tempOneObj) {
            dialogConfig.title = "更改路径";
            oneDialog = new Dialog(dialogConfig);
            zTreeInit11();
            if (tempOneObj.length != 0) {
                tempOneObj = [];
            }
            var condition = {
                knwlgId: knwlgId
            };
            Util.ajax.getJson(Util.constants.CONTEXT + '/docCatalog/getAllcatName', condition, function (json, status) {
                if (status) {
                    var array = json.beans;
                    for (var i = 0; i < array.length; i++) {
                        var pArr = [];
                        for (var j = 0; j < array[i].length; j++) {
                            pArr.push({
                                'id': array[i][j].catlId,
                                'name': array[i][j].catlNm
                            });
                        }
                        pArr.reverse();
                        addPath(pArr, tempOneObj);
                    }
                }
            }, true);
        }

        var allPathEnter = function (catlId, tempAllObj) {
            catIdTemp = catlId;
            dialogConfig.title = "批量更改路径";
            allDialog = new Dialog(dialogConfig);
            if (tempAllObj.length != 0) {
                tempAllObj = [];
                htmlArr = [];
            }
            zTreeInit11();
            Util.ajax.getJson(Util.constants.CONTEXT + '/docCatalog/getCataList', {catlId: catlId}, function (json, status) {
                if (status) {
                    if (json.beans[0].rmk == -9999) {
                        htmlArr.push(json.beans[0].catlNm);
                        $("#knowledgePathList").append('<li ><span class="link-blue" title="' + json.beans[0].catlNm + '">' + json.beans[0].catlNm + '</span><a class="jf-reclicksa formwork-del"style="cursor:pointer;"></a></li>');
                        tempAllObj.push(json.beans[0].catlId);
                    } else {
                        var pArr = [];
                        $(json.beans).each(function () {
                            pArr.push({
                                'id': this.catlId,
                                'name': this.catlNm
                            });
                        });
                        pArr.reverse();
                        addPath(pArr, tempAllObj);
                    }
                }
            }, true);
        }

        var initialize = function ($name, $value, provnce, catlId, flag, knwlgId, dataList, refrshParam) {
            statusFlag = flag;
            _dataList = dataList;
            _refrshParam = refrshParam;
            //_provnce = provnce;
            var ok = function () {
                if (flag == "one") {
                    if (tempOneObj.length == 0) {
                        new Dialog({
                            mode: 'tips',
                            content: '请至少选择一个路径！'
                        });
                        return false;
                    }
                    onePathOk(knwlgId, tempOneObj, htmlArr);
                    _dataList.search(_refrshParam);
                } else if (flag == "all") {
                    if (tempAllObj.length == 0) {
                        new Dialog({
                            mode: 'tips',
                            content: '请选择一个路径！'
                        });
                        return false;
                    }
                    if (allPathOk(catlId, knwlgId) == false) {
                        return false;
                    }
                } else if (flag == undefined) {
                    if (tempAddObj.length == 0) {
                        new Dialog({
                            mode: 'tips',
                            content: '请至少选择一个路径！'
                        });
                        return false;
                    }
                    knowledgePathOk($name, $value, tempAddObj, htmlArr);
                }
            }
            var cancel = function () {

            };
            dialogConfig = {
                mode: 'normal',
                title: '知识路径选择', //弹窗标题；
                content: KnowledgePathTpl,
                ok: ok,
                name: 'conrdss',
                okValue: '确定',
                cancel: cancel,
                cancelValue: '取消',
                cancelDisplay: true,
                width: 560,
                height: 450,
                skin: 'dialogSkin',  //设置对话框额外的className参数
                fixed: false,
                backdropOpacity: 0.6,
                quickClose: false,
                modal: true
            };

            if (flag == "one") {
                onePathEnter(knwlgId, htmlArr, tempOneObj);
                oneDialog.on('onclose', function () {
                    tempOneObj = [];
                    htmlArr = [];
                });
                $(".ke-inline-alert").removeClass("show");
                $("#knowledgePathList").dragsort("destroy");
                $("#knowledgePathList").dragsort({
                    dragSelector: "span"
                });
            } else if (flag == "all") {
                allPathEnter(catlId, tempAllObj);
                $('.jf-reclicksa').off('click');
                $('.jf-reclicksa').on('click', function () {
                    var name = $(this).prev().html();
                    for (var i = 0; i < htmlArr.length; i++) {
                        if (name == htmlArr[i]) {
                            htmlArr.splice(i, 1);
                            tempAllObj.splice(i, 1);
                            $(this).parent().remove();
                        }
                    }
                });
                $(".ke-inline-alert").removeClass("show");
                if (allDialog) {
                    allDialog.on('onclose', function () {
                        tempAllObj = [];
                        htmlArr = [];
                    });
                }
            } else if (flag == undefined) {
                addDialog = new Dialog(dialogConfig);
                zTreeInit11();
                if (tempAddObj.length != 0) {
                    tempAddObj = [];
                    htmlArr = [];
                }
                var name = $name.val();
                var value = $value.val();
                if (name != '' && name != undefined) {
                    addNamePath(tempAddObj, htmlArr, name, value);
                }
                manyPathRemove(htmlArr, tempAddObj);
                $("#knowledgePathList").dragsort("destroy");
                $("#knowledgePathList").dragsort({
                    dragSelector: "span"
                });
            }
        };
        return initialize;
    }
);