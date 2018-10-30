require([
    "jquery", "loading", 'util','hdb',"easyui",'js/manage/docEditComponent'
    //,'editor'
],function( $, Loading, Util, Hdb, easyui,docEditCom){
    var addSim;
    var addSimPub;
    var batchUpdate;
    var staticTime;//页面没有被操作的时间
    var saveFlag = false;//保存记录
    var isUpdate;
    var knwlgId;
    var tmpltId;
    var acceptPrePub;
    var viewBtnClick = false;//预览按钮是否被点击
    var _root = window.location.protocol + "//" + window.location.host;
    var dealSuccess = function(message){
        if("addSuccess" == message){
            unLock();
        }
        if("addSimSuccess" == message){
            unLock();
        }
       // crossAPI.trigger(['知识管理'],'submit',{result:message });

    };
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

    //成功后本页不再提示，由父页面进行关闭并提示
    var showNormalDialog = function(tips){
        $.messager.confirm('confirm', '继 续 编 辑？', function (r) {
            if (r) {
                if (isUpdate == "update") {
                    dealSuccess("updateSuccess");
                    // crossAPI.destroyTab('知识修改');
                } else if (isUpdate == "add") {
                    dealSuccess("addSuccess");
                    // crossAPI.destroyTab('新增知识');
                    // crossAPI.destroyTab('新增问答知识');
                } else if (isUpdate == "addSim") {
                    dealSuccess("addSimSuccess");
                    // crossAPI.destroyTab('添加相似');
                }
                else if (isUpdate == "acceptPrePub") {
                    dealSuccess("updateSuccess");
                    // crossAPI.destroyTab('知识修改');
                }
            }
        });
    }

    var showErrorDialog = function(tip,resultData){
        $.messager.confirm( "提示", tip + '失败！'+result.RSP.RSP_DESC,function (obj) {});
    }

    var showMustDialog = function(tips, resultData){
        var srcTmpltAttrAtomIdNm;
        var srcTmpltAttrAtomId = resultData.object.srcTmpltAttrAtomId;
        Util.ajax.getJson(Util.constants.CONTEXT + "/tmpltKeys/getByPrimaryKey",{atomId:srcTmpltAttrAtomId},function (data) {
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
        tableBtns = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm t-btn-blue\" id=\"commitButton\">提交</a>";
        if(!batchUpdate){
            tableBtns = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm ml-5\" id=\"saveButton\">保存</a>";
            tableBtns = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm ml-5\" id=\"viewButton\">预览</a>";
        }
        tableBtns = tableBtns + "<a href=\"#nogo\" class=\"t-btn t-btn-sm ml-5\" id='cancleBtn'>取消</a>";
        $("#divTableBtns").html(tableBtns);
    }
    var eventInit = function(){
        //var nameValidFlag = false;
        /* 屏蔽校验
        var validConfig = {
            el: $("#form"),     //要验证的表单或表单容器
            dialog:true,    //是否弹出验证结果对话框
            pattern: {
                noBrackets: "^[^<>]*$"
            },
            rules:{
                knwlgNm: 'required|max255|noBrackets|repeat',     //设置name=email 的元素为必填项，并且是邮箱格式
                pathName: 'required',
                regnId: 'required',
                knwlgChnlCode: 'required'
            },
            messages:{
                knwlgNm: {
                    required:"知识名称不能为空！",
                    max255: '知识名称不能超过255个字符',
                    noBrackets: "知识名称不能包含<>",
                    repeat: '知识名称重复'
                },
                pathName:{
                    required:'请选择知识路径'
                },
                regnId:{
                    required:'请选择知识地域'
                },
                knwlgChnlCode:{
                    required:'请选择知识渠道'
                }
            }
        };

        var infovalid;
        var baseInfoValid;

        if(!batchUpdate){
            infovalid = new Validator(validConfig);
            infovalid.addMethod("max255", function(){
                var knwlgNm = trim($("#knwlgNm").val());
                if(knwlgNm){
                    if(knwlgNm.length > 255){
                        return false;
                    }else{
                        return true;
                    }
                }else{
                    return false;
                }
            });
            infovalid.addMethod("repeat", function(str) {
                var flag = true;

                if(knwlgId == "null" || isUpdate == "addSim" || isUpdate == "addSimPub"){
                    knwlgId = null;
                }else{
                    knwlgId = $("#knwlgId").val();
                }

                if(viewBtnClick || saveFlag){
                    knwlgId = $("#knwlgId").val();
                }

                var param = {knwlgNm: str.trim(),knwlgId: knwlgId};

                Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocEdit/checkKnwlgNm",param,function (data) {
                    if(data.returnCode != 0){
                        if(data.returnCode == "111139"){
                            new Dialog({
                                mode: 'tips',
                                tipsType: 'error',
                                content: "知识名称重复！"
                            });
                        }
                        flag = false;
                    }
                },true);

                return flag;
            });

            var baseInfoValidConfig = {
                el: $("#publicAttrs"),
                dialog:true,
                pattern: {
                    noBrackets: "^[^<>]*$"
                },
                rules:{
                    knwlgAls: 'max255|noBrackets',
                    knwlgEffTime: 'lessThan',
                    knwlgInvldTime: 'moreThan'
                },
                messages:{
                    knwlgAls:{
                        max255: '知识别名不能超过255个字符',
                        noBrackets: "知识名称不能包含<>"
                    },
                    knwlgEffTime:{
                        lessThan: '失效时间必须小于生效时间'
                    },
                    knwlgInvldTime: {
                        moreThan: '生效时间必须大于失效时间'
                    }
                }
            };

            if(isUpdate == "addSim"){
                $("#knwlgNm").focus();
                infovalid.form();
            }

            //baseInfoValid = new Validator(baseInfoValidConfig); 校验公共属性
            baseInfoValid.addMethod("max255", function(){
                var knwlgAls = trim($("#knwlgAls").val());
                if(knwlgAls){
                    if(knwlgAls.length > 255){
                        return false;
                    }else{
                        return true;
                    }
                }else{
                    return false;
                }
            });
            baseInfoValid.addMethod("lessThan", function(str){
                var knwlgInvldTime = $("input[name=knwlgInvldTime]").val();
                if(!knwlgInvldTime){
                    return true;
                }else{
                    var knwlgEffTime = $("input[name=knwlgEffTime]").val();
                    knwlgEffTime = Date.parse(knwlgEffTime.replace(/-/g, "/"));
                    knwlgInvldTime = Date.parse(knwlgInvldTime.replace(/-/g, "/"))
                    if(knwlgEffTime > knwlgInvldTime){
                        return false;
                    }else{
                        return true;
                    }
                }
            });

            baseInfoValid.addMethod("moreThan", function(str){
                var knwlgEffTime = $("input[name=knwlgEffTime]").val();
                if(!knwlgEffTime){
                    return true;
                }else{
                    var knwlgInvldTime = $("input[name=knwlgInvldTime]").val();
                    knwlgEffTime = Date.parse(knwlgEffTime.replace(/-/g, "/"));
                    knwlgInvldTime = Date.parse(knwlgInvldTime.replace(/-/g, "/"))
                    if(knwlgEffTime > knwlgInvldTime){
                        return false;
                    }else{
                        return true;
                    }
                }
            });
        }
        */

        //保存
        var saveBtnFun = function() {
            //校验
            // if(infovalid){
            //     if(!infovalid.form()){
            //         return false;
            //     }
            // }
            //
            // if(baseInfoValid){
            //     if(!baseInfoValid.form()){
            //         $(".right-content").scrollTop(0);
            //         return false;
            //     }
            // }
            var jsonString = docEditCom.getklgData();
            debugger;
            //检查该知识重复或者矛盾,返回false说明不存在矛盾或重复的知识

            if(checkHasMultimedia(jsonString)){
                return false;
            }else{
                Loading.showLoading("正在加载，请稍后");
                // if(!checkIsRepOrContra(jsonString)){
                //     Loading.showLoading("正在加载，请稍后");;
                // }else{
                //     return false;
                // }
            }

            if((addSim == "true" || addSimPub == "true" || tmpltId != undefined) && !viewBtnClick && !saveFlag){
                knwlgId = "";
                Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgemgmt/saveknowledge',
                    {
                        jsonObject:jsonString
                    },
                    function(result, isOk){
                        if(result.RSP.RSP_CODE=="1")
                        {
                            Loading.destroyLoading();
                            knwlgId = result.RSP.DATA[0];
                            $("#knwlgId").val(knwlgId);
                            saveFlag = true;
                            var config = {
                                mode: 'confirm',
                                content: tips + '成功！',
                                cancelDisplay: false
                            }
                            $.messager.alert("知识保存成功！");
                            // window.close();
                            // lockKnwlg(knwlgId);
                            // showNormalDialog("保存");
                        }
                        else if(result.RSP.RSP_CODE=="errorMsg"){
                            Loading.destroyLoading();
                            showMustDialog("保存", result);
                        } else {
                            Loading.destroyLoading();
                            showErrorDialog("保存" , result);
                        }
                    })
            }
            else{
                if(getLockInfo()){
                    Util.ajax.postJson(Util.constants.CONTEXT+'/knowledgeMgmt/updateKnowledge',
                        {
                            jsonObject:jsonString
                        },
                        function(result, isOk){
                            if(result.RSP.RSP_CODE=="1"){
                                Loading.destroyLoading();
                                // unLock();
                                // showNormalDialog("修改");
                            } else if(result.RSP.RSP_CODE=="errorMsg"){
                                Loading.destroyLoading();
                                showMustDialog("修改", result);
                            } else{
                                Loading.destroyLoading();
                                showErrorDialog("修改", result);
                            }
                        })//endof post json
                }
            }
        }

        $("#saveButton").click(function(){
            var tmpltChangeFlag = docEditCom.tmpltChanges();
            if (tmpltChangeFlag) {
                $.messager.confirm("提示", "点击保存将不会保留与模板参数类型不一致的原子，请确认是否保存？", function (obj) {
                    saveBtnFun();
                });
            } else {
                saveBtnFun();
            }
        })

        //提交
        var commitBtnFun = function(){
            //校验
            if(batchUpdate){
                var jsonString = docEditCom.getklgData();
                var data = {};
                data.ids = knwlgId;
                data.json = jsonString;
                Util.ajax.postJson(Util.constants.CONTEXT + "/kmBatch/batchDocUpdate", data, function(data){
                    if(data.returnCode == 0){
                        batchUnLock();
                        var dialogConfig = {
                            mode: 'confirm',
                            content: data.returnMessage,
                            cancelDisplay: false
                        };
                        var dialog = new Dialog(dialogConfig);
                        dialog.on('confirm', function(){
                            crossAPI.destroyTab('批量修改-编辑');
                        });
                    }else{
                        showErrorDialog("批量更新", result);
                    }
                });
            }
            if(!batchUpdate){
                // if(!infovalid.form()){
                //     return false;
                // }
                //
                // if(!baseInfoValid.form()){
                //     $(".right-content").scrollTop(0);
                //     return false;
                // }

                var jsonString = docEditCom.getklgData();
                //检查该知识重复或者矛盾,返回false说明不存在矛盾或重复的知识
                if(checkHasMultimedia(jsonString)){
                    return false;
                }else{
                    Loading.showLoading("正在加载，请稍后");;
                    // if(!checkIsRepOrContra(jsonString)){
                    //
                    // }else{
                    //     return false;
                    // }
                }

                /*            if(addSim == "true"){
                 knwlgId = ""
                 }  */

                if((addSim == "true" || addSimPub == "true" || tmpltId != undefined) && !viewBtnClick && !saveFlag){
                    knwlgId = "";
                    Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgemgmt/saveandpubknowledge',
                        {
                            jsonObject: jsonString
                        },
                        function (result, isOk) {
                            if (result.returnCode == "success") {
                                Loading.destroyLoading();
                                showNormalDialog("提交");
                            } else if (result.returnCode == "errorMsg") {
                                Loading.destroyLoading();
                                showMustDialog("提交", result);
                            } else {
                                Loading.destroyLoading();
                                showErrorDialog("提交", result);
                            }
                        })//endof post json
                }
                /* else if(acceptPrePub == "true"){
                 var jsonString = docEditCom.getklgData();

                 Util.ajax.ajax({
                 url:Constants.AJAXURL+'/knowledgeMgmt/acceptPrePubKlgSaveDocEditAndPub/'+knwlgId+'?&time='+new Date().getTime(),
                 data:{jsonObject:jsonString},
                 type:'post',
                 async:true,
                 success:function(data){
                 if(data.returnCode == "success"){
                 showNormalDialog("接应预采编知识");
                 }
                 },
                 error:function(){
                 new Dialog({
                 mode: 'tips',
                 tipsType:'error',
                 content: '接应失败！'
                 });
                 return;
                 }
                 });

                 }*/
                else{
                    if(getLockInfo()){
                        Util.ajax.postJson(Util.constants.CONTEXT+'/knowledgeMgmt/updateAndPubKnowledge',
                            {
                                jsonObject:jsonString
                            },
                            function(result, isOk){
                                if(result.returnCode=="success"){
                                    unLock();
                                    Loading.destroyLoading();
                                    showNormalDialog("提交");
                                }else if(result.returnCode=="errorMsg"){
                                    Loading.destroyLoading();
                                    showMustDialog("提交", result);
                                }
                                else{
                                    Loading.destroyLoading();
                                    showMsgDialog(result);
                                }
                            })//endof post json
                    }

                }
            }
        }

        $("#commitButton").click(function(){
            var tmpltChangeFlag = docEditCom.tmpltChanges();
            if (tmpltChangeFlag) {
                $.messager.confirm("提示", "点击提交将不会保留与模板参数类型不一致的原子，请确认是否提交？", function (obj) {
                    commitBtnFun();
                });
            } else {
                commitBtnFun();
            }
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

        //预览
        var viewBtnFun = function() {
            //校验基本信息
            if(infovalid){
                if(!infovalid.form()){
                    return false;
                }
            }

            if(baseInfoValid){
                if(!baseInfoValid.form()){
                    $(".right-content").scrollTop(0);
                    return false;
                }
            }
            Loading.showLoading("正在加载，请稍后");;
            var jsonString = docEditCom.getklgData();
            //执行保存操作
            if((addSim == "true" || addSimPub == "true" || tmpltId != undefined) && !viewBtnClick && !saveFlag){
                Util.ajax.postJson(Constants.AJAXURL+'/knowledgeMgmt/saveKnowledge', {jsonObject:jsonString}, function(data){
                    if(data.returnCode == "success"){
                        //保存成功  执行加锁操作
                        knwlgId = data.object;
                        $("#knwlgId").val(knwlgId);
                        viewBtnClick = true;
                        var callBack = function(id){
                            Loading.destroyLoading();
                            crossAPI.destroyTab("采编预览");
                            crossAPI.createTab('采编预览', _root+Constants.PREAJAXURL+"/src/modules/knowledgeManage/knowledgeDetail.html?knwlgId=" + id +"&isPublished=0");
                        };

                        lockKnwlg(knwlgId, callBack);
                    }else if(data.returnCode == "errorMsg") {
                        Loading.destroyLoading();
                        showMustDialog("保存", data);
                    }
                    else{
                        //保存失败  给出提示
                        Loading.destroyLoading();
                        showErrorDialog("保存" , data);
                    }
                });
            }
            else{
                if(getLockInfo()){
                    Util.ajax.postJson(Constants.AJAXURL+'/knowledgeMgmt/updateKnowledge',
                        {
                            jsonObject:jsonString
                        },
                        function(result, isOk){
                            if(result.returnCode=="success"){
                                Loading.destroyLoading();
                                crossAPI.destroyTab("采编预览");
                                crossAPI.createTab('采编预览', _root+Constants.PREAJAXURL+"/src/modules/knowledgeManage/knowledgeDetail.html?knwlgId=" + knwlgId +"&isPublished=0");
                            }else if (result.returnCode=="errorMsg"){
                                Loading.destroyLoading();
                                showMustDialog("修改", result);
                            }
                            else{
                                Loading.destroyLoading();
                                showErrorDialog("修改", result);
                            }
                        })//endof post json
                }
            }
        }

        //预览按钮点击事件
        $("#viewButton").click(function(){
            var tmpltChangeFlag = docEditCom.tmpltChanges();
            if (tmpltChangeFlag) {
                var config = {
                    mode: 'confirm',
                    content: '点击预览将不会保留与模板参数类型不一致的原子，请确认是否预览？',
                    okValue: '确定', //确定按钮的文本 默认是 ‘确定’
                    cancelValue: '取消', //取消按钮的文本 默认是 ‘取消’
                    cancelDisplay: true, //是否显示取消按钮 默认true显示|false不显示
                    quickClose: false //点击空白处快速关闭 默认false不关闭|true关闭
                }
                var dialog = new Dialog(config);
                dialog.on('confirm',function(){
                    viewBtnFun();
                })
            } else {
                viewBtnFun();
            }
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

        // window.setInterval(function(){
        //     if(staticTime == 600){
        //         saveBtnFun();
        //         staticTime += 10;
        //     }else{
        //         //console.log(staticTime);
        //         staticTime += 10;
        //     }
        // }, 10000);
        if(tmpltId == '180529151430000036'){
            intelligent();
        }
    };

    //智能拆分  上传源文件 业务
    var intelligent = function(){
        $(".ke-panel-title:eq(0)").append("<button id='IAButton' class='t-btn t-btn-blue' style='float:right;margin-top:6px;'>智能拆分</button>")
        $('#IAButton').click(function () {
            new intelligentUpload("智能拆分",1);
        });
        // $(".ke-panel-title:eq(0)").append("<button id='SrcButton' class='t-btn t-btn-blue' style='margin-left:10px;'>上传</button>")
        // $('#SrcButton').click(function () {
        //     new intelligentUpload("上传原文件",2);
        // });
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
        Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/lockKnwlg",{knwlgId: knwlgId}, function(data){
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
        Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/getLockInfo", {knwlgId: knwlgId}, function (data) {
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
        Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/unLockKnwlg",{knwlgId: knwlgId},function(){},true);
    };

    /**
     * 批量解锁
     */
    var batchUnLock = function(){
        Util.ajax.postJson(Util.constants.CONTEXT+"/kmBatch/batchDocDeblocking/",{ids:knwlgId},function(data,status){
        },true);
    };
    var loadData = function(knwlgId,titleType){
        docEditCom.initByKlgId($("#allDiv"),knwlgId,titleType, fcallback);
    }

    var checkIsRepOrContra = function(jsonString){
        var flag = false;
        // Util.ajax.postJson(Util.constants.CONTEXT + "/knowledgeMgmt/checkRepeatOrMutex",{jsonObject: jsonString},function(data){
        //     if(data.returnCode == 0){
        //         flag = data.object;
        //         console.log(data.returnMessage);
        //         if(data.object){
        //             new Dialog({
        //                 mode: 'tips',
        //                 tipsType: 'error',
        //                 content: data.returnMessage
        //             });
        //         }
        //     }else{
        //         new Dialog({
        //             mode: 'tips',
        //             tipsType: 'error',
        //             content: data.returnMessage
        //         });
        //     }
        // },true);
        // console.log(flag);
        return flag;
    }
    var checkHasMultimedia = function(jsonString){
        return false;
        // todo 先直接返回
        var flag = false;
        Util.ajax.postJson(Util.constants.CONTEXT + "/knowledgeMgmt/checkHasMultimedia",{jsonObject: jsonString},function(data){
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
        knwlgId = searchData.klgId;
        tmpltId = searchData.tmpltId;
        addSim = searchData.addSim;
        addSimPub = searchData.addSimPub;
        batchUpdate = searchData.batchUpdate;
        acceptPrePub = searchData.acceptPrePub;
        var knwlgGathrTypeCd = searchData.knwlgGathrTypeCd;
        if(knwlgId != null){
            if(addSimPub){
                isUpdate = "addSim";
                docEditCom.setAddSimPusFlag(true,"添加相似");
                loadData(knwlgId,"添加相似");
            }else if(batchUpdate){
                isUpdate = "update";
                docEditCom.setBatchFlag(true,"知识修改");
                docEditCom.initByTmpltId($("#allDiv"),tmpltId,"知识修改",knwlgGathrTypeCd,fcallback);
            }
            else if(acceptPrePub){
                isUpdate = "acceptPrePub";
                docEditCom.setAcceptPrePubFlag(true,"知识修改");
                lockKnwlg(knwlgId, loadData, "知识修改");
            }
            else{
                if(addSim == "true"){
                    isUpdate = "addSim";
                    docEditCom.setAddSimEditFlag(true,"添加相似");
                    loadData(knwlgId,"添加相似");
                }else{
                    isUpdate = "update";
                    lockKnwlg(knwlgId,loadData,"知识修改");
                }
            }
        }
        else if(knwlgGathrTypeCd!=null && tmpltId!=null)
        {
            isUpdate="add";
            docEditCom.initByTmpltId($("#allDiv"),tmpltId,"新增知识",knwlgGathrTypeCd,fcallback);
        }
        else
        {
            showNormalDialog("参数错误！");
            Loading.destroyLoading();
        }
    })

})