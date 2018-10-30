define(["jquery", 'util', "easyui"], function ($, Util,easyUi) {

    var $popWindow;
    var zTreeObjPath;
    var tempAddObj = [];
    var tempAllObj = [];
    var tempOneObj = [];
    var statusFlag ;
    var htmlArr = [];
    var catIdTemp;
    var _refrshParam;
    var _dataList;
    var _knwlgId;
    var _catlId;

    /**
     * 初始化
     */
    var initialize = function($name, $value, provnce, catlId, flag, knwlgId, dataList, refrshParam){
        initPopWindow();
        statusFlag = flag;
        _dataList = dataList;
        _refrshParam = refrshParam;
        _knwlgId = knwlgId;
        _catlId = catlId;

        if (flag == "one") {
            onePathEnter(knwlgId, htmlArr, tempOneObj);

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
        } else if (flag == undefined) {
            initMenuTree();
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
        }
        initWindowEvent($name, $value);
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

    var allPathEnter = function (catlId, tempAllObj) {
        catIdTemp = catlId;
        if (tempAllObj.length != 0) {
            tempAllObj = [];
            htmlArr = [];
        }
        initMenuTree();
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

    var onePathEnter = function(knwlgId, htmlArr, tempOneObj) {
        initMenuTree();
        if (tempOneObj.length != 0) {
            tempOneObj = [];
        }
        var condition = {
            knwlgId : knwlgId
        };
        Util.ajax.getJson(Constants.AJAXURL+'/docCatalog/getAllcatName',condition, function(json, status){
            if (status) {
                var array = json.beans;
                for (var i =0; i < array.length; i++) {
                    var pArr = [];
                    for (var j=0; j <array[i].length ; j++) {
                        pArr.push({
                            'id':  array[i][j].catlId,
                            'name': array[i][j].catlNm
                        });
                    }
                    pArr.reverse();
                    addPath(pArr, tempOneObj);
                }
            }
        }, true);
    }

    function initMenuTree() {
        var zTreeObj;
        var id ="0";
        var params ={ "id":id};

        var setting = {
            async: {
                enable: true,
                //是否开启异步加载模式
                //以下配置,async.enable=true时生效
                url: Util.constants.CONTEXT + "/docCatalog/getCatalog",//路径
                //Ajax获取数据的地址
                type: "get",
                //Ajax的http请求模式
                autoParam: ["id"],
                //异步加载时需要自动提交父节点属性的参数
                dataFilter: function(treeId, parentNode, childNodes) {//数据
                    if (!childNodes) {
                        return null
                    };
                    return childNodes.RSP.DATA;
                }
            },
            callback: {
                onClick: zTreeOnClickKnow
            }
        };

        Util.ajax.ajax({
            type: "GET",//请求方式
            url: Util.constants.CONTEXT + "/docCatalog/getCatalog?id=0" ,//路径
            async: false,//是否异步
            success: function(datas) {//返回消息
                console.log(datas);
                var treeData = datas.RSP.DATA;//数据
                zTreeObj = $.fn.zTree.init($('#menuTree'), setting, treeData);//初始化
                selctTreeNode = zTreeObj.getNodesByParam("id", "0", null)[0];//获取根节点
                zTreeObj.selectNode(selctTreeNode);//选中
                console.log(selctTreeNode);
                zTreeOnClickKnow;
            },
            error: function() {//请求失败
                console.log("==================================加载业务树失败！");
            }
        });
    }


    //点击树选择取消路径
    function zTreeOnClickKnow(event, treeId, treeNode) {
        if(treeNode == "undefined" || treeNode == null){
            $.messager.alert("提示","请先选中知识路径！");
            return false;
        }
        var catlId;
        if(typeof(treeNode) == 'object'){
            catlId = treeNode.id;
        }
        if (catlId == '0') {
            $.messager.alert("提示","禁止在根目录下添加知识！");
            return false;
        }
        var nodePath = treeNode.getPath();
        var pArr = [];
        $(nodePath).each(function(){
            pArr.push({
                'id':  this.id,
                'name': this.name,
                'pId' : this.pId,
                'isParent':this.isParent
            });
        });
        var length = $("#knowledgePathList").children("li").length;
        if (statusFlag == "one") {
            addOnePath(length, tempOneObj, pArr);

        } else if (statusFlag =="all") {
            if (length > 0) {
                $.messager.alert("提示","请先删除路径！");
                return ;
            }else {
                addPath(pArr, tempAllObj);
                $('.jf-reclicksa').off('click');
                $('.jf-reclicksa').on('click', function(){
                    var name = $(this).prev().html();
                    for (var i = 0 ; i <htmlArr.length; i++ ) {
                        if (name == htmlArr[i]) {
                            htmlArr.splice(i, 1);
                            tempAllObj.splice(i, 1);
                            $(this).parent().remove();
                        }
                    }
                });
            }

        }else if(statusFlag == undefined){
            addKnowledgePath(length, tempAddObj, pArr);
//                manyPathRemove(htmlArr, tempAddObj);

            $('.jf-reclicksa').off('click');
            $('.jf-reclicksa').on('click', function(){
                var name = $(this).prev().html();
                for (var i = 0 ; i <htmlArr.length; i++ ) {
                    if (name == htmlArr[i]) {
                        htmlArr.splice(i, 1);
                        tempAddObj.splice(i, 1);
                        $(this).parent().remove();
                    }
                }
            });
        }
    }

    var addKnowledgePath = function(length, tempAddObj, pArr) {
        if (length > 2) {
            $.messager.alert("提示","知识路径最多为3条，无法再次添加！");
            return false;
        }
        for (var i=0; i < tempAddObj.length; i++ ) {
            if (pArr[pArr.length-1].id == tempAddObj[i]) {
                $.messager.alert("提示","该知识路径已存在，不能重复添加！");
                return false;
            }
        }
        addAddPath(pArr, tempAddObj, htmlArr);
    }

    var  addAddPath = function(pArr, tempAddObj, htmlArr) {
        var itemHtml = '';
        var minId = pArr[pArr.length-1].id;
        if(checkPath(minId) == "true"){
            for(var i=0; i<pArr.length;i++){
                var item =pArr[i];
                itemHtml += item.name+((i == (pArr.length-1))? '':'/');
            }
            htmlArr.push(itemHtml);
            $("#knowledgePathList").append('<li><span class="link-blue" catlId="'+ minId+'" title="'+itemHtml+'">'+itemHtml +'</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
            tempAddObj.push(minId);
            // $("#knowledgePathList").dragsort("destroy");
            // $("#knowledgePathList").dragsort({
            //     dragSelector: "span",
            //     scrollSpeed:0
            // });
        }else{
            var confirmConfig = {
                mode: 'confirm',
                id: 'confirmId',
                content: '该目录没有配置任何浏览权限，确认添加吗？'
            };
            var delConfirm = new Dialog(confirmConfig);
            delConfirm.on('confirm',function(){
                for(var i=0; i<pArr.length;i++){
                    var item =pArr[i];
                    itemHtml += item.name+((i == (pArr.length-1))? '':'/');
                }
                htmlArr.push(itemHtml);
                $("#knowledgePathList").append('<li ><span class="link-blue" catlId="'+ minId+'" title="'+itemHtml+'">'+itemHtml +'</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                tempAddObj.push(minId);
                manyPathRemove(htmlArr, tempAddObj);
                // $("#knowledgePathList").dragsort("destroy");
                // $("#knowledgePathList").dragsort({
                //     dragSelector: "span"
                // });
            })
        }
    };

    var addOnePath = function(length, tempOneObj, pArr) {
        if (length > 2) {
            $.messager.alert("提示","知识路径最多为3条，无法再次添加！");
            return false;
        }
        for (var i=0; i < tempOneObj.length; i++ ) {
            if (pArr[pArr.length-1].id == tempOneObj[i]) {
                $.messager.alert("提示","该知识路径已存在，不能重复添加！");
                return false;
            }
        }
        addPath(pArr, tempOneObj);
    }

    var  addPath = function(pArr, tempAddObj) {
        var itemHtml = '';
        var minId = pArr[pArr.length-1].id;
        if(checkPath(minId) == "true"){
            for(var i=0; i<pArr.length;i++){
                var item =pArr[i];
                itemHtml += item.name+((i == (pArr.length-1))? '':'/');
            }
            htmlArr.push(itemHtml);
            $("#knowledgePathList").append('<li><span class="link-blue" catlId="'+ minId+'" title="'+itemHtml+'">'+itemHtml +'</span><a class="jf-reclicksa formwork-del"  style="cursor:pointer;"></a></li>');
            tempAddObj.push(minId);
            manyPathRemove(htmlArr, tempAddObj);
            if (statusFlag !="all") {

                // $("#knowledgePathList").dragsort("destroy");
                // $("#knowledgePathList").dragsort({
                //     dragSelector: "span",
                //     scrollContainer :$("#win_content"),
                //     scrollSpeed:0
                // });

            }
        }else{
            $.messager.confirm("width:900","提示","该目录没有配置任何浏览权限，确认添加吗？",function(obj){
                for(var i=0; i<pArr.length;i++){
                    var item =pArr[i];
                    itemHtml += item.name+((i == (pArr.length-1))? '':'/');
                }
                htmlArr.push(itemHtml);
                $("#knowledgePathList").append('<li ><span class="link-blue" catlId="'+ minId+'" title="'+itemHtml+'">'+itemHtml +'</span><a class="jf-reclicksa formwork-del" style="cursor:pointer;"></a></li>');
                tempAddObj.push(minId);
                manyPathRemove(htmlArr, tempAddObj);
                if (statusFlag !="all") {
                    // $("#knowledgePathList").dragsort("destroy");
                    // $("#knowledgePathList").dragsort({
                    //     dragSelector: "span",
                    //     scrollContainer :$("#win_content"),
                    //     scrollSpeed:0
                    // });
                }
            });

        }
    };

    var manyPathRemove = function(htmlArr, tempOneObj) {
        $('.jf-reclicksa').off('click');
        $('.jf-reclicksa').on('click', function(){
            var name = $(this).prev().html();
            for (var i = 0 ; i <htmlArr.length; i++ ) {
                if (name == htmlArr[i]) {
                    htmlArr.splice(i, 1);
                    tempOneObj.splice(i, 1);
                    $(this).parent().remove();
                }
            }
        });
    }

    var checkPath = function(catlId){
        var flag = "true";
        var param = {
            id:catlId,
            type:"1"
        }
        Util.ajax.getJson(Util.constants.CONTEXT + "/permissionmanage/permcatlid", param, function (result) {
            if (result && result.RSP) {
                var permData = result.RSP.DATA;
                if (permData.length < 1) {
                    flag = "false";
                } else {
                    flag = "true";
                }
            }
        });
        return flag;
    }

    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {
        $("#win_content").empty();
        $popWindow = $("<div style = 'width:100%;height: 100%;border:none'></div>").appendTo($("#win_content"));
        $([
            "<div region = 'north'  id='selectedist' style = 'width:80%;height: 30%;border:none;margin-top:20px' class ='selected-list'>",
                "<label title='已选路径'>已选路径 </label>",
                "<ul id ='knowledgePathList'>",
                "</ul>",
            "</div>",
            "<div region = 'center' id = 'usinessbTree'  split = 'true' style = 'overflow-y:auto;overflow-x:hidden;width:90%;height: 55%;border:1px' >",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",
            "<div region = 'south' id = 'usinessbTree' style = 'width:90%;height: 8%;border:none' >",
                "<div class='mt-10 test-c'>",
                    "<label class='form-label col-5'></label>",
                    "<a href='javascript:void(0)' id='global' class='btn btn-green radius  mt-l-20'  >保存</a>",
                    "<a href='javascript:void(0)' id='cancel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
                "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);
    }


    /**
     * 初始化弹出窗口事件
     */
    function initWindowEvent($name, $value) {

        $popWindow.on("click", "#global", function () {
            //禁用按钮，防止多次提交
            $(this).linkbutton({disabled: true});

            if (statusFlag == "one") {
                if (tempOneObj.length == 0) {
                    $.messager.alert("提示","请至少选择一个路径！");
                    return false;
                }
                onePathOk(_knwlgId, tempOneObj, htmlArr);
                _dataList.search(_refrshParam);
            } else if (statusFlag == "all") {
                if (tempAllObj.length == 0) {
                    $.messager.alert("提示","请选择一个路径！");
                    return false;
                }
                if (allPathOk(_catlId, _knwlgId) == false) {
                    return false;
                }
            } else if (statusFlag == undefined) {
                if (tempAddObj.length == 0) {
                    $.messager.alert("提示","请至少选择一个路径！");
                    return false;
                }
                knowledgePathOk($name, $value, tempAddObj, htmlArr);
            }

        });

        var onePathOk = function(knwlgId, tempOneObj, htmlArr) {
            //支持路径拖拽,需要从界面获取最新顺序
            var html =  $("#knowledgePathList").find(".link-blue");
            var catArray = [];
            for (var i = 0; i < html.length; i++) {
                catArray.push($(html[i]).attr("catlId"));
            }
            var catlId1= catArray.join(",");
            var condition = {
                knwlgId : knwlgId,
                catlId1 : catlId1
            };
            Util.ajax.postJson(Constants.AJAXURL+'/docCatalog/updateKnowledgeCatalog',condition, function(json, status){
                if(status){
                    $.messager.alert("提示","保存成功！");
                }else {
                    $.messager.alert("提示","保存失败");
                    return false;
                }
            }, true);
        }

        var allPathOk = function (catlId, knwlgId) {

            var catlupId = tempAllObj[tempAllObj.length - 1];
            if (catIdTemp == catlupId) {
                $.messager.alert("提示", "路径未改变，请点击取消或重新选择路径！");
                return false;
            }
            var condition = {
                catlId: catlId,
                catlupId: catlupId,
                knlwlist: knwlgId
            };
            Util.ajax.getJson(Constants.AJAXURL + '/docCatalog/updatecatlIdByAllRlId', condition, function (json, status) {
                if (json.returnCode == '0') {
                    // _dataList.search(_refrshParam);
                    // allDialog.on('onclose', function () {
                    //     tempAllObj = [];
                    //     htmlArr = [];
                    // });
                } else {
                    $.messager.alert("提示");
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
            var name = nameArray.join(",");
            $name.val(name);
            $value.val(catArray);
            $name.attr('title', name);

            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        }

        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function() {
            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        });

    }

    return {
        initialize: initialize
    };

});
