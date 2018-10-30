require([
    "jquery", "loading", 'util','hdb',"easyui",'js/manage/docCutoverComponent'
],function( $, Loading, Util, Hdb, easyui,docCutoverCom){
    var addSim;
    var addSimPub;
    var batchUpdate;
    var staticTime;//页面没有被操作的时间
    var saveFlag = false;//保存记录
    var isUpdate;
    var knwlgId;
    var tmpltId;
    var viewBtnClick = false;//预览按钮是否被点击
    var _root = window.location.protocol + "//" + window.location.host;

    // 序列化url查询参数
    function serilizeUrl(url) {
        var result = {};
        // url = url.split("?")[1];
        var map = url.split("&");
        for(var i = 0, len = map.length; i < len; i++){
            result[map[i].split("=")[0]] = map[i].split("=")[1];
        }
        return result;
    }
    /**
     *  修复ie8下不支持trim()
     */
    String.prototype.trim = function () {
        return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
    /**
     * 用于修剪字符串两端空格
     *
     * @param str
     * @returns {XML|string|void|*}
     */
    var trim = function (str) {
        if (str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };



    var showErrorDialog = function(tip,resultData){
        $.messager.confirm( "提示", tip + '失败！'+result.RSP.RSP_DESC,function (obj) {});
    }

    var showMustDialog = function(tips, resultData){
        var srcTmpltAttrAtomIdNm;
        var srcTmpltAttrAtomId = resultData.object.srcTmpltAttrAtomId;
        Util.ajax.getJson(Util.constants.CONTEXT + "/kc/configservice/tmpltKeys/getByPrimaryKey",{atomId:srcTmpltAttrAtomId},function (data) {
            if(data.returnCode == 0){
                srcTmpltAttrAtomIdNm = data.bean.paraNm;
            }
        },true);
        $.messager.confirm( "提示", tips +'失败，必填原子为空！'+'<br/>分组名称:'+resultData.object.grpngNm +'</br>原子名称:'+ srcTmpltAttrAtomIdNm,function (obj) {
            var top = $("#tdcntt"+ srcTmpltAttrAtomId).offset().top;
            var scrollTop = $(".right-content").scrollTop();
            var critHeight;
            critHeight = 225;
            $(".right-content").scrollTop(scrollTop + top - critHeight);
            $("#tdcntt"+ srcTmpltAttrAtomId).attr('style', "border:2px solid red;");
            setTimeout(function(){
                $("#tdcntt"+ srcTmpltAttrAtomId).attr('style', " ");
            },3000);
        });
    }

    var showMsgDialog = function(resultData){
        $.messager.confirm( "提示",  resultData.RSP.RSP_DESC,function (obj) {});
    }

    var buttonInit = function(){
        var tableBtns = "";
            tableBtns = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm t-btn-blue\" id=\"saveButton\">保存</a>";
            tableBtns  = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm ml-5\" id='cancleBtn'>取消</a>";
        $("#divTableBtns").html(tableBtns);
    }
    var eventInit = function(){
        //一键复制文本值
        $("#copyStrTypeValueBtn").click(function(){
            docCutoverCom.copyStrTypeValue();
        });
        //展示源文件按键
        $("#showSrcFileBtn").click(function () {
            if($(this).hasClass("t-btn-blue")){
                $(this).removeClass("t-btn-blue");
                $(this).html("源文件预览");
                $("#rightDiv").hide();
                $("#allDiv").css("width","100%");
                $("#klgData").find(".easyui-combotree").combotree("resize","290px");
                $("#klgData").find(".easyui-datetimebox").datetimebox("resize","290px");

            }else{
                $(this).addClass("t-btn-blue");
                $(this).html("取消预览");
                $("#allDiv").css("width","70%");
                $("#klgData").find(".easyui-combotree").combotree("resize","200px");
                $("#klgData").find(".easyui-datetimebox").datetimebox("resize","200px");
                $("#rightDiv").show();

            }
        })

        //保存
        var saveBtnFun = function() {
            var jsonString = docCutoverCom.getklgData();
            debugger
            Util.ajax.postJson(Util.constants.CONTEXT + '/kc/configservice/knowledgemgmt/saveknowledge',{jsonObject:jsonString},function(result){
                    if(result.RSP.RSP_CODE=="1")
                    {
                        knwlgId = result.RSP.DATA[0];
                        $("#knwlgId").val(knwlgId);
                        saveFlag = true;
                    }
                    else{
                        $.messager.alert("保存异常",result.RSP.RSP_DESC);
                    }
            })
        };

        $("#saveButton").click(function(){
                saveBtnFun();
        })

        $("#cancleBtn").click(function(){
            var confirmDialog = new Dialog({
                mode: 'confirm',
                title: '取消提醒',
                content: '确认取消编辑吗?'
            });

            confirmDialog.on("confirm", function(){
                if(isUpdate == "update"){
                    if(batchUpdate){
                        batchUnLock();
                        crossAPI.destroyTab('批量修改-编辑');
                        return;
                    }
                    unLock();
                    dealSuccess("updateCancle");
                    crossAPI.destroyTab('知识修改');
                }else if(isUpdate=="add"){
                    dealSuccess("addCancle");
                    crossAPI.destroyTab('新增知识');
                    crossAPI.destroyTab('新增问答知识');
                }else if(isUpdate=="addSim"){
                    dealSuccess("addSimCancle");
                    crossAPI.destroyTab('添加相似');
                }else if(isUpdate == "acceptPrePub"){
                    dealSuccess("updateCancle");
                    crossAPI.destroyTab('知识修改');
                }
            });
        });


        //点击有效字段
        $("#getValidAtom").click(function(){
            if($(this).is(':checked')){
                $(".dataTr").each(function(){
                    //处理单选复选类型
                    var paramType = $(this).find("input[name=paraTypeCd]").val();
                    if(paramType == Util.constants.NGKM_ATOM_DATA_TYPE_RADIO || paramType == Util.constants.NGKM_ATOM_DATA_TYPE_CHECK){
                        if($(this).find(".checked").length == 0){
                            $(this).addClass("hide");
                        }
                    }else if(paramType == Util.constants.NGKM_ATOM_DATA_TYPE_FILE || paramType == Util.constants.NGKM_ATOM_DATA_TYPE_PIC){
                        //处理文件类型
                        if($(this).find(".fileAtom").length == 0 && $(this).find(".picAtom").length == 0){
                            $(this).addClass("hide");
                        }
                    }else if(paramType == Util.constants.NGKM_ATOM_DATA_TYPE_RICH){
                        //处理富文本类型
                        if($(this).find(".f-lk-richtext2").length == 0){
                            $(this).addClass("hide");
                        }
                    }else if(paramType == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG || paramType == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST){
                        if($(this).find(".selectRelSS span").length == 0 && $(this).find(".selectTdSS span").length == 0){
                            $(this).addClass("hide");
                        }
                    }else{
                        var value = trim($(this).find("input[name=cntt]").val());
                        var textValue = trim($(this).find("textarea[name=cntt]").val());
                        if(!value && !textValue){
                            $(this).addClass("hide");
                        }
                    }
                });
            }else{
                $(".dataTr").removeClass("hide");
            }
        });

        //人员选择
        $("#respPrsnId").click(function(){
            //责任人选择
            new docRespPrsn($(this));
        });
        try{
            $("body")[0].addEventListener("click", function(){
                staticTime = 0;
            });
            $("body")[0].addEventListener("keydown", function(){
                staticTime = 0;
            });
            $("body")[0].addEventListener("mousedown", function(){
                staticTime = 0;
            });
            $("body")[0].addEventListener("mousewheel", function(){
                staticTime = 0;
            });
        }catch(e){
            $("body")[0].attachEvent("onkeydown", function(){
                staticTime = 0;
            });
            $("body")[0].attachEvent("onclick", function(){
                staticTime = 0;
            });
            $("body")[0].attachEvent("onmousedown", function(){
                staticTime = 0;
            });
            $("body")[0].attachEvent("onmousewheel", function(){
                staticTime = 0;
            });
        }

    };


    var fcallback = function(){
        buttonInit();
        eventInit();
        // Loading.destroyLoading();
    };

    /**
     * 知识加锁
     *
     * @param knwlgId
     */
    var lockKnwlg = function(knwlgId,funcall,titleType){
        Util.ajax.postJson(Util.constants.CONTEXT + "/kc/configservice/kmDocEdit/lockKnwlg",{knwlgId: knwlgId}, function(data){
            if(data.RSP.RSP_CODE == "1"){
                if(funcall){
                    funcall(knwlgId, titleType);
                }
                dealSuccess("lockSuccess");
            }else{
                $.messager.confirm( "提示",  data.RSP.RSP_DESC,function (obj) {});
            }
        });
    };

    /**
     * 获取加锁信息
     */
    var getLockInfo = function(){
        if(!knwlgId || knwlgId == "null"){
            return;
        }
        var result = false;
        Util.ajax.postJson(Util.constants.CONTEXT + "/kc/configservice/kmDocEdit/getLockInfo", {knwlgId: knwlgId}, function (data) {
            result = data.RSP.DATA[0];
            if (!result) {
                $.messager.alert("操作失败，加锁状态异常")
            }
        }, true);
        return result;
    };

    /**
     * 解锁
     */
    var unLock = function(){
        if(!knwlgId || knwlgId == "null"){
            return;
        }
        Util.ajax.postJson(Util.constants.CONTEXT + "/kc/configservice/kmDocEdit/unLockKnwlg",{knwlgId: knwlgId},function(){},true);
    };

    /**
     * 批量解锁
     */
    var batchUnLock = function(){
        Util.ajax.postJson(Util.constants.CONTEXT+"/kc/configservice/kmBatch/batchDocDeblocking/",{ids:knwlgId},function(data,status){
        },true);
    };
    var loadData = function(knwlgId,titleType){
        docCutoverCom.initByKlgId($("#allDiv"),knwlgId,titleType, fcallback);
    }

    var checkHasMultimedia = function(jsonString){
        return false;
        // todo 先直接返回
        var flag = false;
        Util.ajax.postJson(Util.constants.CONTEXT + "/kc/configservice/knowledgeMgmt/checkHasMultimedia",{jsonObject: jsonString},function(data){
            if(data.returnCode == 0){
                flag = data.object;
                if(data.object){
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'error',
                        content: data.returnMessage
                    });
                }
            }else if(data.returnCode == 1){
                new Dialog({
                    mode: 'tips',
                    tipsType: 'error',
                    content: data.returnMessage
                });
            }
        },true);
        return flag;
    }

    $(document).ready(function(){
        // 路径查询参数部分
        var searchURL = decodeURI(window.location.search);
        searchURL = searchURL.substring(1, searchURL.length);
        // 参数序列化
        var searchData = serilizeUrl(decodeURI(searchURL));
        knwlgId = searchData.knwlgId;
        tmpltId = searchData.tmpltId;
        var knwlgGathrTypeCd = searchData.knwlgGathrTypeCd;

        if(knwlgGathrTypeCd!=null && tmpltId!=null){
            isUpdate="add";
            docCutoverCom.initByTmpltIdAndKnwlgId($("#allDiv"),tmpltId,knwlgId,knwlgGathrTypeCd,fcallback);
            docCutoverCom.initRigthPanel(knwlgId);
        }else{
            $.messager.alert("参数错误！");
            Loading.destroyLoading();
        }
    })

})