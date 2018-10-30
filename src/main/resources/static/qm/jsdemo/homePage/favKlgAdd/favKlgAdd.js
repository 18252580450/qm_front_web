define(['util', 'js/homePage/knowledgeTree/knowledgeTree', 'text!js/homePage/favKlgAdd/favKlgAdd.tpl', 'js/homePage/MyAlert/MyAlert', 'js/homePage/constants/constants'
], function (Util, KnowledgeTree, tpl, MyAlert, Constants) {

    var $el = null;
    var selectCatl = function (title, favrtKnwlgId, targetObj) {
        $el = $("body");
        var zTreeObj;
        var target;
        var selectedCatlId = "0";
        var isCreate = true;

        //修复ie8下不支持trim()
        String.prototype.trim = function () {
            return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }

        //设置下拉框的显示位置
        var setTreePortion = function (p) {
            target = p;
            //下拉框的高度
            var selectHeight = target.height();
            //我的收藏夹距浏览器底部距离
            var buttom = $(window).height() - ($("#default-catalog").offset().top - $(document).scrollTop());
            if (buttom > selectHeight) {
                $(".addff-pos-ads").each(function () {
                    $(this).removeClass("facing-up");
                });
            } else {
                $(".addff-pos-ads").each(function () {
                    $(this).addClass("facing-up");
                });
            }
        }

        //设置收藏夹显示位置(不考虑左右位置)
        function setFarPortion() {
            //获取收藏夹弹框的高度
            var farHeight = $('.km-favorite-add').height();
            //点击元素距浏览器底部距离
            var buttom = $(window).height() - (targetObj.offset().top + targetObj.height() - $(document).scrollTop());
            if (buttom > farHeight) {
                //底部高度可以可以放下收藏夹
                $(".km-favorite-add").css("top", targetObj.offset().top + targetObj.height() - $(document).scrollTop());
                $(".km-favorite-add").css("left", targetObj.offset().left + targetObj.width() / 2 - $(".km-favorite-add").width() + 26 - $(document).scrollLeft());
            } else {
                $(".km-favorite-add").addClass("arrow-bottom");
                $(".km-favorite-add").css("top", targetObj.offset().top - $(".km-favorite-add").height() - $(document).scrollTop());
                $(".km-favorite-add").css("left", targetObj.offset().left + targetObj.width() / 2 - $(".km-favorite-add").width() + 26 - $(document).scrollLeft());
            }
        }

        //关闭滚动条
        function closeScroll() {
            var top = $(document).scrollTop();
            $(document).on('scroll.unable', function () {
                $(document).scrollTop(top);
            });
        }

        //开启滚动条
        function openScroll() {
            $(document).unbind("scroll.unable");
        }

        //用于监听收藏夹
        var listenCatl = function (event) {
            if ($(event.target).parents(".addff-pos-ads").length > 0
                || $(event.target).hasClass("addff-pos-ads")
                || $(event.target).parents("#default-catalog").length > 0
                || $(event.target).attr("id") == "default-catalog") {
                return;
            }
            $("#first-location-catalog").append($("#catalog-tree").detach());
            $(".addff-selsct-filer").hide();
            $(".addff-pos-ads-display").hide();
        }

        //选择目录
        function select_catalog(event, treeId, treeNode) {
            selectedCatlId = treeNode.catlId;
            $("#selected-catalog").html(treeNode.catlNm);
            $(".addff-pos-ads-display").hide();
        }

        //收藏夹上取消按钮
        $(".addff-btn .cancel-favorite").click(function () {
            if (zTreeObj != null) {
                zTreeObj.destroy();
            }
            //$el.unbind("click",addFavorites);
            $(".km-favorite-add").unbind("click", listenCatl);
            $(".km-favorite-add").remove();
            openScroll($el);
        });

        //新增目录
        function save_catalog(event, treeId, treeNode) {
            var name = treeNode.catlNm.trim();
            if (name.length >= 255) {
                zTreeObj.removeNode(treeNode);
                zTreeObj.selectNode(treeNode.getParentNode());
                new MyAlert({
                    type: 'error',
                    text: '保存失败，目录名称过长',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            if (name.indexOf("<") >= 0 || name.indexOf(">") >= 0) {
                zTreeObj.removeNode(treeNode);
                zTreeObj.selectNode(treeNode.getParentNode());
                new MyAlert({
                    type: 'error',
                    text: '目录名字不能包含"<"、">"',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            if (name.length == 0) {
                zTreeObj.removeNode(treeNode);
                zTreeObj.selectNode(treeNode.getParentNode());
                new MyAlert({
                    type: 'error',
                    text: '目录名字不能为空',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            var pId = treeNode.getParentNode().catlId;
            var params = {'catlNm': name, 'suprCatlId': pId};
            var requestUrl = Constants.AJAXURL + "/klgFavrtCatal/saveCatalog?v=" + new Date().getTime();
            Util.ajax.ajax({
                url: requestUrl, type: "GET", data: params, async: false, success: function (json) {
                    $(".submitting-box").remove();
                    if (json.returnCode == "0") {
                        treeNode.catlId = json.bean;
                        treeNode.catlNm = name;
                        $("#" + treeNode.tId + "_a").attr("title", name);
                        $("#" + treeNode.tId + "_span").html(name);
                    } else {
                        selectedCatlId = treeNode.getParentNode().catlId;
                        zTreeObj.selectNode(treeNode.getParentNode());
                        zTreeObj.removeNode(treeNode);
                        setTreePortion(target);
                        new MyAlert({
                            type: 'error',
                            text: json.returnMessage,
                            falseShow: false,
                            trueName: '确定'
                        });
                    }
                }
            });
        }

        //将模板注入页面中并隐藏
        $el.append(tpl);
        setFarPortion();
        $("#favorite-knowledge-name").attr("readonly", true);
        $("#favorite-knowledge-name").val(title);
        //点击展开收藏目录
        $("#default-catalog").click(function () {
            if (!isCreate) {
                $(".addff-pos-ads-display").show();
                $(".addff-selsct-filer").hide();
                return;
            }
            var treeConfig = {
                hasLine: true,//是否有节点连线
                view: {
                    showTitle: true
                },
                callback: {
                    onClick: select_catalog,
                    onRename: save_catalog
                },
                data: {
                    key: {
                        name: "catlNm",
                        id: "catlId",
                        pId: "suprCatlId"
                    },
                    simpleData: {
                        enable: true,
                        idKey: "catlId",
                        pIdKey: "suprCatlId",
                        rootPId: "0"
                    }
                }
            };
            Util.ajax.ajax({
                type: "GET",
                url: Constants.AJAXURL + "/klgFavrtCatal/getAllFavorites?v=" + new Date().getTime(),
                async: false,
                success: function (data) {
                    var treeData = data.beans;
                    treeData.push({catlNm: "我的收藏", catlId: "0", "open": true, suprCatlId: ""});
                    zTreeObj = $.fn.zTree.init($('#catalog-tree'), treeConfig, treeData);
                    var node = zTreeObj.getNodesByParam("catlId", "0", null)[0];
                    zTreeObj.selectNode(node);
                    isCreate = false;
                },
                error: function () {
                    return false;
                }
            });
            setTreePortion($(".addff-pos-ads-display"));
            $(".addff-pos-ads-display").show();
            $(".addff-selsct-filer").hide();
        });

        //新建文件夹
        function createCatalog() {
            var node = [{catlNm: "新建文件夹"}];
            var treeNode = zTreeObj.getSelectedNodes()[0];
            if (treeNode != null && treeNode.level >= 4) {
                zTreeObj.selectNode(treeNode);
                setTreePortion(target);
                new MyAlert({
                    type: 'error',
                    text: '不能再建更深层级的目录了',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            if (treeNode.catlId == 1) {
                new MyAlert({
                    type: 'error',
                    text: '“前台展示下不能新建目录”',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            if (treeNode.isParent) {
                zTreeObj.expandNode(treeNode, true, false, true, true);
            }
            var lz = zTreeObj.addNodes(treeNode, node);
            zTreeObj.editName(lz[0]);
            setTreePortion(target);
        }

        //点击“选择其他文件夹”
        $("#addff-pos-u").click(function () {
            $("#second-location-catalog").append($("#catalog-tree").detach());
            setTreePortion($(".addff-selsct-filer"));
            $(".addff-selsct-filer").show();
            $(".addff-pos-ads-display").hide();
        });
        //新建文件夹按钮点击事件
        $("#create-catalog").bind("click", createCatalog);
        //设置监听事件
        $(".km-favorite-add").bind("click", listenCatl);

        //新建目录div上取消
        $("#catlConcel").click(function () {
            var treeNode = zTreeObj.getSelectedNodes()[0];
            zTreeObj.removeNode(treeNode);
            zTreeObj.selectNode(treeNode.getParentNode());
            $("#first-location-catalog").append($("#catalog-tree").detach());
            $(".addff-selsct-filer").hide();
            $(".addff-pos-ads-display").hide();
            isCreate = true;
        });

        //取消焦点事件
        $("#catlConcel").mouseover(function () {
            $(".rename").off("blur");
        });

        //收藏夹上取消按钮
        $(".addff-btn .cancel-favorite").click(function () {
            if (zTreeObj != null) {
                zTreeObj.destroy();
            }
            $(".km-favorite-add").unbind("click", listenCatl);
            $(".km-favorite-add").remove();
            openScroll($el);
        });
        //选完目录后确定
        $(".submit-favorite").click(function () {
            var fkname = $("#favorite-knowledge-name").val().trim();
            if (fkname.length == 0) {
                new MyAlert({
                    type: 'error',
                    text: '收藏标题不能为空',
                    falseShow: false,
                    trueName: '确定'
                });
                return;
            }
            $(".km-favorite-add").hide();
            if (zTreeObj != undefined) {
                selectedCatlId = zTreeObj.getSelectedNodes()[0].catlId;
            }
            var data = {'favrtKnwlgNm': fkname, 'favrtKnwlgId': favrtKnwlgId, 'catlId': selectedCatlId};
            Util.ajax.postJson(Constants.AJAXURL + "/klgFavrtInfo/saveKlg", data, function (json) {
                if (json.returnCode == 0) {
                    new MyAlert({
                        type: 'success',
                        text: '收藏成功'
                    });
                } else {
                    new MyAlert({
                        type: 'error',
                        text: json.returnMessage,
                        falseShow: false,
                        trueName: '确定'
                    });
                }
                targetObj.trigger("favrtResult", json.returnCode);
            });
            if (zTreeObj != null) {
                zTreeObj.destroy();
            }
            $(".km-favorite-add").remove();
            openScroll($el);
        });

    }

    return selectCatl;
});