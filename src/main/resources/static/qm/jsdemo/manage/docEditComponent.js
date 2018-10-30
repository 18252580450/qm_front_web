define([
        "jquery","loading", 'util','hdb','easyui','ztree-exedit','transfer',
        'js/manage/editorDialog',
        'channelTree',
        'text!html/manage/docEdit.tpl',
        "js/manage/tabLig",
        'js/manage/typeOptionalGener'],

    function(
        $,Loading, Util, Hdb, easyui,ztree,Transfer,
        EditorDialog,
        ChannelTree,
        docEdit,
        tabLig,
        TypeOptionGen) {

        var sourceData = null;
        //var groupData = null;
        var tmpltId = null;
        var atomType = null;//原子类型数据字典
        var allChnlCodes = null;//全部渠道
        //模板中各种带选项的控件的原子id，用来初始化单选框或者下拉菜单
        var dataTypeCheckData = {};
        //控件组
        var radioGroup = {};
        var checkboxGroup = {};
        var editorGroup = {};
        var dateGroup = {};
        var dateTimeGroup = {};
        var richMap = {};//入参值，用来回退到本次修改之前的数据
        var richMapTemp = {};//本次修改页面富文本编辑器的值，仅仅用来展示本页面富文本弹框
        var regnTreeData = null;
        var regnChildTreeData = null;
        var defaultRegnTreeData = null;
        var knwlgGathrType = null;//知识类型
        var exception = {};
        //用于存放本次修改所修改的例外内容
        var exceptionTemp = {};
        var allAttrs = null;
        var allDataType = null;
        var relationKlgs = null;
        var gathCommt = null;
        var annotation = {};
        //用于存放本次修改所修改的注解内容
        var annotationTemp = {};
        var chnlCode;
        //var isUpdate;
        //ztree的节点点击事件之后 设置在滚动回调中不改变选中节点
        var ztreeClickFlag = false;
        var addSimPusFlag = false;
        var acceptPrePubFlag = false;
        var addSimEditFlag = false;
        var componentGroup;
        var strongAssosationTemp = {};
        var strongAssosation = {};
        var editor;
        var timePeriodUnit;
        var memUnit;
        var priceTimeUnit;
        var titleTypeCode;//页面名称
        var time_wkunit_cd = 'NGKM.ATOM.PARAM.TIMES.WKUNIT';//时间单位
        var ram_wkunit_cd = 'NGKM.ATOM.PARAM.RAMTYPE.WKUNIT';//内存单位
        var priceOrTime_wkunit_cd = 'NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT';//价格/时间单位
        var changeFlag;
        var mediaList ={};
        var regnData ={};

        var getcovData = function(codeTypeCd){  //获取数据字典的数据
            var result = {};
            var covData = {
                url:Util.constants.CONTEXT+'/kmConfig/getDataByCode?codeTypeCd='+codeTypeCd,
                async: false,
                success:function(data){
                    for(var i=0;i<data.beans.length;i++){
                        if(data.beans[i].value != null && data.beans[i].name != null){
                            result[data.beans[i].value] = data.beans[i].name;
                        }
                    }
                },error:function(data){ return;},
                dataType:'json', //返回值的数据类型
                timeout:30000,  //超时时间4
                type:'get'  //请求类型
            };
            Util.ajax.ajax(covData);
            return result;
        };

        //注册一个判断相等的Helper,判断v1是否等于v2
        Hdb.registerHelper("equal",function(v1,v2,options){
            if(v1==v2){
                //满足添加继续执行
                return options.fn(this);
            }else{
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        });
        //注册一个判断相等的Helper,判断v1是否为真
        Hdb.registerHelper("isNotNull", function (v1, options) {
            if (v1) {
                //满足添加继续执行
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        });

        //注册一个判断相等的Helper,判断v1 || v2结果
        Hdb.registerHelper("or", function (v1,v2, options) {
            if (v1 || v2) {
                //满足添加继续执行
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        });

        /**
         * 修剪字符串
         *
         * @param str
         * @returns {XML|string|void|*}
         */
        var trim = function (str) {
            if (str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
            }
        };

        //取原子数据类型
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_TYPE + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                atomType = Transfer.Combobox.transfer(data);
            }
        });

        //渠道
        // Util.ajax.ajax({
        //     type: "GET",
        //     url:Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_TEMPLET_CHNL + '&v=' + new Date().getTime(),
        //     async: false,
        //     success: function (data) {
        //         allChnlCodes = Transfer.Combobox.transfer(data);
        //     }
        // });

        //渠道
        // Util.ajax.getJson(Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId="+ Util.constants.NGKM_TEMPLET_CHNL, null, function (result) {
        //     var data=result.RSP.DATA;
        //     allChnlCodes = data;
        // });

        //初始化渠道下拉框
        function initChannel() {
            debugger;
            var options = {
                "$textBox": $("#klgData").find("#knwlgChnlCode"),//传入div知识渠道Text的id=knwlgChnlCode
                "windowId": "channelWindow",//div渠道窗口id
                "contentId": "channelTree",
                "footerId": "footer"
            };
            ChannelTree.initChannelTextBox(options);
        }


        //取时间单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_TIMES_WKUNIT + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                timePeriodUnit = Transfer.Combobox.transfer(data);
            }
        });

        //内存单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_RAMTYPE_WKUNIT + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                memUnit = Transfer.Combobox.transfer(data);
            }
        });

        //价格、时间类型单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_PRICEORTIMETYPE_WKUNIT + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                priceTimeUnit = Transfer.Combobox.transfer(data);
            }
        });

        var renderDataType = function () {
            $(".paraTypeCdSpan").each(function () {
                var typeCd = $(this).siblings("input[name='paraTypeCd']").val();
                var typeName = null;
                for(var i in atomType){
                    if(atomType[i].CODEVALUE == typeCd){
                        typeName = atomType[i].CODENAME;
                    }
                }
                if(typeName == null){
                    typeName = "未知原子类型";
                }
                $(this).html("<span class=\"f-text\">" + typeName + "</span>");
            })
            $(".typeOptnlSelect").each(function () {
                var dataTypeValue = $(this).attr("value");
                $(this).children("option").each(function () {
                    for(var i in atomType){
                        if($(this).val()==atomType[i].CODEVALUE){
                            //找到对应的字典，展示名称
                            $(this).html(atomType[i].CODENAME);
                            //选中默认的数据类型
                            if($(this).val()==dataTypeValue){
                                $(this).attr("selected","selected");
                            }
                        }
                    }
                });
            })
        }

        var eventInit = function(tmpGroupData){


            //调用初始化渠道下拉框方法
            initChannel();

            //例外、注解、强关联内容回显设置
            if (!allAttrs) {
                exceptionTemp[atomId] = null;
                annotationTemp[atomId] = null;
                strongAssosationTemp[atomId] = null;
            } else {
                for (var atomId in exception) {
                    exceptionTemp[atomId] = exception[atomId];
                    $("#exce" + atomId).removeClass("link-blue").addClass("link-red");
                }
                for (var atomId in annotationTemp) {
                    annotationTemp[atomId] = annotation[atomId];
                    $("#anno" + atomId).removeClass("link-blue").addClass("link-red");
                }
                for (var atomId in strongAssosation) {
                    strongAssosationTemp[atomId] = strongAssosation[atomId];
                    $("#anno" + atomId).removeClass("link-red").addClass("link-blue");
                    $("#strong" + atomId).prev().removeClass("link-strongBlue").addClass("link-strongRed");
                    $("#strong" + atomId).prev().text("取消强关联");
                    $('#ref' + atomId).prev().attr('disabled', true);
                }
            }

            $(".typeOptnlSelect").change(function () {
                var atomId = $(this).attr("atomid");
                var atomNm = $(this).attr("atomnm");
                var paraTypeCd = $(this).val();
                $(this).attr("value", paraTypeCd);
                $(this).parent().siblings("input[name='paraTypeCd']").val(paraTypeCd);


                if (TypeOptionGen) {
                    TypeOptionGen.refresh(paraTypeCd, atomId, atomNm, false);
                }
            });

            $(".t-btn-blue").on('click', function () {
                var id = $(this).attr("id");
                if(id.substring(0,9)=="selectRel"){
                    var listId = id.substring(9);
                    new SelectKnowledge('知识关联',id,'selectRelList'+listId,$(this));
                }else if(id.substring(0,8)=="selectTd"){
                    var listId = id.substring(8);
                    new RelCatalog($('#selectTdList'+listId), id);
                }
            });

            //TODO 增加知识链接跳转
            //知识路径
            $('#knowledgePathBtn').on('click',function(){
                $("#win_content").show().window({
                    width: 650,
                    height: 500,
                    modal: true,
                    title: "选择知识路径"
                });

                require(["knowledgePath"], function (knowledgePath) {
                    knowledgePath.initialize($('input[name="pathName"]'), $('input[name="path"]'), $('input[name="regnId"]').val());
                });
            });

            //自定义页签
            $('#taglibButton').on('click',function(){
                // new taglibManagementTpl(null, $('#urdfTabsHidden'),$('#urdfTabs'));
                $("#win_content").show().window({
                    width: 850,
                    height: 600,
                    modal: true,
                    title: "自定义页签"
                });
                tabLig.initialize();
            });


            //经纬度
            $("#gisButton").on('click',function () {
                //获得窗口的垂直位置
                var iTop = (window.screen.availHeight - 30 - 500) / 2;
                //获得窗口的水平位置
                var iLeft = (window.screen.availWidth - 10 - 900) / 2;
                window.open(Util.constants.CONTEXT+'/src/modules/knowledgeManage/selectGis.html','','height=500, width=900, top='+iTop+',left='+iLeft+',resizable=yes,status=no,location=no,toolbar=no,scrollbars=no');
            });

            //多媒体素材
            $("#media").on('click',function () {
                var atomId = $(this).attr("kid");
                var callBack = function(data){
                    mediaList = data;
                    var html ="";
                    $(data).each(function () {
                        if (this.baseName.indexOf(".mp3") != -1) {
                            html += '<audio controls autoplay>' +
                                '<source src="' + window.location.protocol + '//' + window.location.host + Util.constants.CONTEXT +
                                '/file/download?key=NGKM_FILE_ATTACH&fileId=' + this.baseName + '" type="audio/mp3" />' +
                                '</audio>';
                        }
                        if (this.baseName.indexOf(".jpg") != -1) {
                            html += '<img src="' + window.location.protocol + '//' + window.location.host + Util.constants.CONTEXT +
                                '/file/download?key=NGKM_PICTURE_FILE&fileId=' + this.baseName + '" alt="' + this.orgName + '">';
                        } else {
                            html += '<img class="ke-flash" src="' + Util.constants.CONTEXT + '/src/assets/lib/kindeditor/themes/common/blank.gif" ' +
                                'data-ke-src="' + Util.constants.CONTEXT + '/src/assets/lib/kindeditor/themes/common/blank.gif" ' +
                                'style="width:550px;height:400px;" ' +
                                'data-ke-tag="%3Cobject%20linktype%20%3D%20%22video%22%20src%3D%22' + this.baseName +
                                '%22%20fileId%20%3D%22' + this.baseName +
                                '%22%20type%3D%22application/x-shockwave-flash%22%20width%3D%22550%22%20height%3D%22400%22%20autostart%3D%22false%22%20loop%3D%22true%22%20/%3E" alt=""><br/>';
                        }
                    });
                    getOldMediaList(data,atomId);
                };
                new SelectMedia("多媒体素材", "richMidea", "richMidea", null, callBack);
            });

            $(".f-refresh").click(function () {
                var atomId = $(this).attr("atomid");
                if(flag.batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                    exceptionTemp[atomId] = exception[atomId];
                    annotationTemp[atomId] = annotation[atomId];
                    if(exceptionTemp[atomId]){
                        $("#exce" + atomId).removeClass("link-blue").addClass("link-red");
                    }else{
                        $("#exce" + atomId).removeClass("link-red").addClass("link-blue");
                    }

                    if(annotationTemp[atomId]){
                        $("#anno" + atomId).removeClass("link-blue").addClass("link-red");
                    }else{
                        $("#anno" + atomId).removeClass("link-red").addClass("link-blue");
                    }

                    if(allAttrs){
                        if(allAttrs[atomId] && !allAttrs[atomId]["wrongType"]){
                            $(this).siblings(".typeOptnlSelect").val(allAttrs[atomId]["paraTypeCd"]);
                        }
                        else{
                            $(this).siblings(".typeOptnlSelect").val($(this).parent().siblings("input[name='paraTypeCdOld']").val());
                        }
                    }
                    else{
                        $(this).siblings(".typeOptnlSelect").val($(this).parent().siblings("input[name='paraTypeCdOld']").val());
                    }
                    richMapTemp = {};
                    $.extend(richMapTemp,richMap);
                    $(this).siblings(".typeOptnlSelect").change();
                }
            });

            var dialogConfig = {
                mode: 'confirm',
                title: '提示',
                content: '如果您不采编原子内容，该原子的注解和例外最终不会被保存，是否继续？',
                okValue: '确定',
                cancelValue: '取消'
            };

            //采编例外
            var editException = function(paraType, paraNm, atomId,exeCntt){
                //回调函数
                var callBackFun = function(data){
                    if(data){
                        exceptionTemp[atomId] = data;
                        $("#exce" + atomId).removeClass("link-blue").addClass("link-red");
                    }else{
                        exceptionTemp[atomId] = null;
                        $("#exce" + atomId).removeClass("link-red").addClass("link-blue");
                    }
                };
                //原始例外信息
                var exceptions = exceptionTemp[atomId];
                if(!exceptions){
                    exceptions = null;
                }
                var dataJson;
                if(paraType == Util.constants.NGKM_ATOM_DATA_TYPE_RADIO || paraType == Util.constants.NGKM_ATOM_DATA_TYPE_CHECK){
                    dataJson = dataTypeCheckData.typeOptnl[atomId][paraType].optVal;
                }
                if(knwlgGathrType == null){
                    knwlgGathrType = $("#knwlgGathrTypeCd").val();
                }
                var basewkunit;
                if(paraType == Util.constants.NGKM_ATOM_DATA_TYPE_PRICE || paraType == Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY
                    || paraType == Util.constants.NGKM_ATOM_DATA_TYPE_TIME || paraType == Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT){
                    basewkunit = dataTypeCheckData["typeOptnl"][atomId][paraType]["wkunit"];
                }
                var expAnno = "";
                if(annotationTemp[atomId]!=undefined){
                    expAnno = annotationTemp[atomId];
                }

                var sendSmsFlag = $("#"+atomId).find("input[name=sendSmsFlag]").val();

                Exception.initExcep(paraType, knwlgGathrType, paraNm, callBackFun, exceptions, dataJson, basewkunit, sendSmsFlag, acceptPrePubFlag,exeCntt,expAnno);
            };

            //采编注解
            var editAnnotation = function(id, paraType){
                var annoPage = annotationTemp[id];
                var callBackFun = function(data){
                    if(data && data.annotation){
                        var dataStr = JSON.stringify(data);
                        annotationTemp[id] = dataStr;
                        $("#anno" + id).removeClass("link-blue").addClass("link-red")
                    }else{
                        annotationTemp[id] = null;
                        $("#anno" + id).removeClass("link-red").addClass("link-blue");
                    }
                };
                Annotation.initAnno(annoPage,callBackFun,acceptPrePubFlag);
            };

            $(".exceptionButton").click(function () {
                //参数类型
                var paraType = $(this).parent().parent().find("input[name=paraTypeCd]").val();
                //参数名称
                var paraNm = $(this).parent().parent().find("input[name=paraNm]").val();
                //原子id
                var atomId = $(this).parent().parent().attr("id");
                var exeCntt;
                if(!KnowledgeCnttCheck.saveExecCheck(paraType, atomId, componentGroup)){
                    var dialog = new Dialog(dialogConfig);
                    dialog.on("confirm", function(){
                        editException(paraType, paraNm, atomId,exeCntt);
                    });
                }else{
                    exeCntt = KnowledgeCnttCheck.getCntt(paraType, atomId, componentGroup);
                    editException(paraType, paraNm, atomId,exeCntt);
                }
            });

            $(".annotationButton").click(function () {
                var id = $(this).attr("atomid");
                var paraType = $(this).parent().parent().find("input[name=paraTypeCd]").val();

                if(!KnowledgeCnttCheck.saveExecCheck(paraType, id, componentGroup)){
                    var dialog = new Dialog(dialogConfig);
                    dialog.on("confirm", function(){
                        editAnnotation(id, paraType);
                    });
                }else{
                    editAnnotation(id, paraType);
                }
            });



            //富文本框处理
            $(".richTextButton").click(function () {
                var atomId = $(this).attr("atomid");
                var content = $("#inputRich"+atomId).val();
                EditorDialog.showEditor(content,atomId,editorGroup);
                // editorGroup[$(this).parent().attr("atomId")] = $("#inputRich"+atomId).val();

                // var defaultContent = "";
                // var atomId = $(this).attr("atomid");
                // var richContiner = $(this).parent();
                // var dialogConfig = {
                //     title: richContiner.attr("name")+' 富文本采编', //弹窗标题，
                //     content: EditorContiner,
                //     ok: function() {},
                //     okValue: '保存', //确定按钮的文本 默认是 ‘ok’
                //     cancel: function() {
                //         return true;
                //     },
                //     cancelValue: '取消', //取消按钮的文本 默认是 ‘关闭’
                //     button: [ //自定义按钮组
                //         {
                //             value: '清空', //按钮显示文本
                //             callback: function() { //自定义按钮回调函数
                //                 editor.setContent("");
                //                 return false; //阻止窗口关闭
                //             }
                //         }],
                //     modal:true,
                //     width: 1024,
                //     height: 400
                // }
                //
                // if ($("#strong" + atomId).prev().hasClass("link-strongRed") || acceptPrePubFlag) {
                //     dialogConfig = {
                //         title: richContiner.attr("name") + ' 富文本采编', //弹窗标题，
                //         content: EditorContiner,
                //         cancel: function () {
                //             return true;
                //         },
                //         cancelValue: '取消', //取消按钮的文本 默认是 ‘关闭’
                //         width: 1024,
                //         height: 400
                //     }
                // }
                // var dialog = new Dialog(dialogConfig);
                //
                // if(richMapTemp!=null && richMapTemp[richContiner.attr("atomid")]!=null){
                //     defaultContent = richMapTemp[richContiner.attr("atomid")];
                // }
                //
                // editor = new Editor(defaultContent);
                //
                // dialog.on('confirm',function(e){
                //     //判断内容是否为空，改变控件样式
                //     var content = editor.getContent();
                //     content = trim(content);
                //     //将富文本内容放入map中，以便再次弹出dialog时显示本次编辑值
                //     richMapTemp[richContiner.attr("atomid")] = content;
                //     if(content){
                //         richContiner.addClass("f-lk-richtext2").removeClass("f-lk-richtext");
                //     }
                //     if(!content){
                //         richContiner.addClass("f-lk-richtext").removeClass("f-lk-richtext2");
                //     }
                // });
                // editorGroup[$(this).parent().attr("atomId")] = editor;
            })

            $(".tdParaNm").hover(function () {
                var top = $(this).offset().top;
                var left = $(this).offset().left;
                $(".ke-inline-alert").css("top", (top + 45) + "px");
                $(".ke-inline-alert").css("left", (left - 210) + "px");
                var content = gathCommt[$(this).attr("atomid")];
                if(content!=""){
                    $(".inline-alert-inner").html(content);
                    $(".ke-inline-alert").addClass("show");
                }
            },function () {
                $(".ke-inline-alert").removeClass("show");
            })

            $(".ke-inline-alert").mouseover(function () {
                $(this).addClass("show");
            })
            $(".ke-inline-alert").mouseleave(function () {
                $(this).removeClass("show");
            })

            $(".close").click(function () {
                $(this).parent().removeClass("show");
            });

            $("#anoceRcvGrpBtn").click(function(){
                new AcceptGroup($("#anoceRcvGrpShow"));
            })
            // $("#brwsPrivBtn").click(function(){
            //     new NewRollTree($("#brwsPriv"), acceptPrePubFlag,'知识浏览权限');
            // })
            // //原子浏览权限
            // $(".brwsPrivAtomBtn").click(function () {
            //     new NewRollTree($(this).siblings("input[name=brwsPriv]"), acceptPrePubFlag,'原子浏览权限');
            // })
            //知识渠道
            // $("#knwlgChnlCodeBtn").click(function () {
            //     new chnlTree($("#chnlCode"),allChnlCodes, acceptPrePubFlag);
            // });
            //原子渠道
            $(".chnlBtn").click(function () {
                new chnlTree($(this).siblings("input[name=chnlCode]"),allChnlCodes, acceptPrePubFlag);
            });

            //回显图片
            var fillOldPicByAtomId = function (cntt, atomId) {
                $("#oldPicList" + atomId).next().find('.files').empty();
                $("#oldPicList" + atomId).next().find('.picAtom').remove();
                var oNestPictureArray = [];
                if (cntt) {
                    cntt = JSON.parse(cntt);
                    var targetHtml = "<ul>";
                    for (var i=0; i < cntt.length; i++) {
                        targetHtml += "<li>"
                        targetHtml = targetHtml + cntt[i]["fileName"] +
                            "<a href=\"javascript:void(0)\" style=\"color:gray;\" class=\"fileToBeMoved\" fileid=\"" +
                            cntt[i]["fileId"] + "\">删除</a>";
                        //再次传送数据会从这里取出
                        var fileForPost = "<input  type=\"hidden\" fileId = \"" + cntt[i]["fileId"] + "\" fileName = \"" + cntt[i]["fileName"] + "\" class=\"fileAtom\"/>";
                        targetHtml += fileForPost;
                        targetHtml += "</li>"
                        var param = {};
                        param.fileId = cntt[i]["fileId"];
                        param.fileName = cntt[i]["fileName"];
                        oNestPictureArray.push(param);
                    }
                    targetHtml += "</ul>"
                    $("#oldPicList" + atomId).html(targetHtml);
                    $('.fileToBeMoved').click(function () {
                        if ($("#strong" + atomId).prev().hasClass("link-strongBlue") ) {
                            $(this).parent().remove();
                        }
                    })
                }
            }

            //回显文件
            var fillOldFileByAtomId = function (cntt, atomId) {
                $("#oldFileList" + atomId).next().find('.files').empty();
                $("#oldFileList" + atomId).next().find('.fileAtom').remove();
                var oNestFileArray = [];
                if (cntt) {
                    cntt = JSON.parse(cntt);
                    var targetHtml = "<ul>";
                    for (var i=0; i < cntt.length; i++) {
                        targetHtml += "<li>"
                        targetHtml = targetHtml + cntt[i]["fileName"] +
                            "<a href=\"javascript:void(0)\" class=\"fileToBeMoved\" style=\"color:gray;\" fileid=\"" +
                            cntt[i]["fileId"] + "\"> 删除</a>";
                        //再次传送数据会从这里取出
                        var fileForPost = "<input  type=\"hidden\" fileId = \"" + cntt[i]["fileId"] + "\" fileName = \"" + cntt[i]["fileName"] + "\" class=\"fileAtom\"/>";
                        targetHtml += fileForPost;
                        targetHtml += "</li>"
                        var param = {};
                        param.fileId = cntt[i]["fileId"];
                        param.fileName = cntt[i]["fileName"];
                        oNestFileArray.push(param);
                    }
                    targetHtml += "</ul>"
                    $("#oldFileList" + atomId).html(targetHtml);
                    $('.fileToBeMoved').click(function () {
                        if ($("#strong" + atomId).prev().hasClass("link-strongBlue") ) {
                            $(this).parent().remove();
                        }
                    })
                }
            }
            // 回显多媒体素材
            var getOldMediaList = function (cntt, atomId) {
                $("#selectMeList" + atomId).next().find('.files').empty();
                $("#selectMeList" + atomId).next().find('.fileAtom').remove();
                var oNestFileArray = [];
                if (cntt) {
                    var targetHtml = "<ul>";
                    for (var i=0; i < cntt.length; i++) {
                        targetHtml += "<li>"
                        targetHtml = targetHtml + cntt[i]["orgName"] +
                            "<a href=\"javascript:void(0)\" class=\"fileToBeMoved\" style=\"color:gray;\" fileid=\"" +
                            cntt[i]["fileId"] + "\"> 删除</a>";
                        //再次传送数据会从这里取出
                        var fileForPost = "<input  type=\"hidden\" fileId = \"" + cntt[i]["baseName"] + "\" fileName = \"" + cntt[i]["orgName"] + "\" class=\"fileAtom\"/>";
                        targetHtml += fileForPost;
                        targetHtml += "</li>"
                        var param = {};

                        param.fileId = cntt[i]["baseName"];
                        param.fileName = cntt[i]["orgName"];
                        oNestFileArray.push(param);
                    }
                    targetHtml += "</ul>"
                    $("#selectMeList" + atomId).html(targetHtml);
                    $('.fileToBeMoved').click(function () {
                        if ($("#strong" + atomId).prev().hasClass("link-strongBlue") ) {
                            $(this).parent().remove();
                        }
                    })
                }
            }


            //回显知识关联
            var getOldRelationList = function (block, cntt, atomId) {
                block.empty();
                Util.ajax.getJson(Util.constants.CONTEXT + '/kmAssociate/getEditPusInfo', {kwlgList: cntt}, function (json, status) {
                    if (status) {
                        var oldData = json.beans;
                        if (!oldData) {
                            return;
                        }
                        for (var i = 0; i < oldData.length; i++) {
                            if (oldData[i] != null) {
                                var knowName = oldData[i].knwlgNm;
                                var knowId = oldData[i].knwlgId;
                                var htmlMessage = '<li class="par-tag relate-data-drag"><span title="' + knowName + '" class="docRelateData"  relaId = "' + knowId + '" aid = "' + knowId + '" >&nbsp;&nbsp;&nbsp;&nbsp;' + knowName + '</span><a class="knowlgAtomClose" href="#nogo" id="V_' + knowId + '"></a>';
                                block.append(htmlMessage);
                            }
                        }
                        block.dragsort("destroy");
                        $('.knowlgAtomClose').click(function (e) {
                            if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                $(this).parent().remove();
                            }
                        });
                    }
                });
            }

            //回显系列关联
            var getOldRelativePattern = function (cntt, atomId, paraDesc) {
                var targetHtml = "";
                if (cntt!=null && cntt!= "") {
                    var cnttArray = cntt.split(",");
                    var cataName;
                    if (paraDesc && paraDesc!= null&& paraDesc!= "") {
                        cataName = paraDesc.split(",");
                    }
                    for (var i = 0; i < cnttArray.length; i++) {
                        targetHtml += "<li class='par-tag relate-data-drag'>";
                        var relaName = cataName[i];
                        var relaNameArray = relaName.split("/");
                        var relaNameShow = relaNameArray[relaNameArray.length - 2];
                        var relaId = cnttArray[i];
                        var htmlMessage ='<span class="docRelateData" title="' + relaName + '" relaId = "'+relaId+'"id="'+relaId+'">'+relaNameShow+'</span><a class="knowlgAtomClose" href="#nogo" id="V_'+relaId+'"></a>';
                        targetHtml += htmlMessage;
                        targetHtml += "</li>"
                    }
                    $("#selectTdList" + atomId).empty();
                    $("#selectTdList" + atomId).html(targetHtml);
                    $("#selectTdList" + atomId).dragsort("destroy");
                    $("#selectTdList" + atomId).find(".knowlgAtomClose").on("click", function () {
                        if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                            $(this).parent().remove();
                        }
                    });
                } else {
                    $("#selectTdList" + atomId).html(targetHtml);
                    new Dialog({
                        mode: 'tips',
                        tipsType: 'error',
                        content: '源文件内容为空!'
                    });
                    return false;
                }
            }

            var okCallback = function(data, $this) {
                if(data){
                    var atomId = $this.attr("atomid").substring(6);
                    strongAssosationTemp[atomId] = data.srcAttrId;
                    var paraType = $this.parent().parent().find("input[name=paraTypeCd]").val();
                    var paraVal = data.paraVal;
                    var paraDesc;
                    if (paraType == "15") {
                        Util.ajax.getJson(Util.constants.CONTEXT + '/kmAssociate/getTKmSourceKeysInfo', {srcAttrId: data.srcAttrId}, function (json, status) {
                            if (status) {
                                if (json.bean) {
                                    paraDesc = json.bean.paraDesc;
                                    paraVal = json.bean.paraVal;
                                }
                            }
                        }, true);
                    }
                    var wkunit = "";
                    if (data.wkunit) {
                        wkunit = data.wkunit;
                    }
                    var oldCatalogFlag;
                    switch (paraType){
                        case "1" :
                            $("#cntt"+ atomId).val(paraVal);
                            $("#cntt"+ atomId).attr('disabled', true);
                            break;
                        case "4" :
                            richMap[atomId] = paraVal;
                            richMapTemp[atomId] = paraVal;
                            componentGroup.richMapTemp = richMapTemp;
                            var atomParaNm = $("#ref" + atomId).prev().attr("atomnm");
                            TypeOptionGen.refresh("4", atomId, atomParaNm, true);
                            if(paraVal){
                                $("#richText" + atomId).parent().addClass("f-lk-richtext2").removeClass("f-lk-richtext");
                            }
                            if(!paraVal){
                                $("#richText" + atomId).parent().addClass("f-lk-richtext").removeClass("f-lk-richtext2");
                            }
                            break;
                        case "5" :
                            $("#cntt"+ atomId).val(paraVal);
                            $("#cntt"+ atomId).attr('disabled', true);
                            $("#timePeriodUnit"+ atomId).val(wkunit);
                            $("#timePeriodUnit"+ atomId).attr('disabled', true);
                            break;
                        case "6" :
                            $('#cntt'+ atomId +" input[name='cntt']").val(paraVal);
                            $('#cntt'+ atomId +" input[name='cntt']").attr('disabled', true);
                            break;
                        case "7" :
                            $('#cntt'+ atomId +" input[name='cntt']").val(paraVal);
                            $('#cntt'+ atomId +" input[name='cntt']").attr('disabled', true);
                            break;
                        case "8" :
                            getOldRelationList($("#selectRelList" + atomId), paraVal, atomId);
                            break;
                        case "9" :
                            $('#cntt'+ atomId ).val(paraVal);
                            $('#cntt'+ atomId ).attr('disabled', true);
                            $('#memUnit'+ atomId).val(wkunit);
                            $('#memUnit'+ atomId).attr('disabled', true);
                            break;
                        case "10" :
                            fillOldFileByAtomId(paraVal, atomId);
                            $("#fileUpload" + atomId).hide();
                            break;
                        case "11" :
                            $('#cntt'+ atomId ).val(paraVal);
                            $('#cntt'+ atomId ).attr('disabled', true);
                            $('#dataUnit'+ atomId).val(wkunit);
                            $('#dataUnit'+ atomId).attr('disabled', true);
                            break;
                        case "12" :
                            $('#cntt'+ atomId ).val(paraVal);
                            $('#cntt'+ atomId ).attr('disabled', true);
                            $('#priceTimeUnit'+ atomId).val(wkunit);
                            $('#priceTimeUnit'+ atomId).attr('disabled', true);
                            break;
                        case "13" :
                            fillOldPicByAtomId(paraVal, atomId);
                            $("#picUpload" + atomId).hide();
                            break;
                        case "14" :
                            $('#cntt'+ atomId ).val(paraVal);
                            $('#cntt'+ atomId ).attr('disabled', true);
                            break;
                        case "15" :
                            oldCatalogFlag = getOldRelativePattern(paraVal, atomId, paraDesc);
                            $("#selectTdList" + atomId).dragsort("destroy");
                            $("#relativeItem").find("a").off('click');
                            break;
                        case "16" :
                            var provnceNm = '';
                            Util.ajax.ajax({
                                type: "POST",
                                async: false,
                                data: {regnId: paraVal},
                                url: Util.constants.CONTEXT + '/kmConfig/getTKmDistrictConfigByRegnId',
                                success: function (datas) {
                                    provnceNm = datas.bean.regnNm;
                                }, error: function (datas) {
                                    return;
                                }
                            });
                            $('#regnIdContiner'+ atomId +" input[name='cntt']").prev().val(provnceNm);
                            $('#regnIdContiner'+ atomId +" input[name='cntt']").prev().attr('disabled', true);
                            $('#regnIdContiner'+ atomId +" input[name='cntt']").val(paraVal);
                            break;
                        case "17" :
                            getOldMediaList(paraVal,atomId);
                            break;
                    }
                    if(oldCatalogFlag != false) {
                        $("#tdcntt"+ atomId).attr('style', "background-color:#F5F5F5");
                        $this.removeClass("link-strongBlue").addClass("link-strongRed");
                        $('#ref' + atomId).prev().attr('disabled', true);
                        $this.text('取消强关联');
                    }
                }else{
                    strongAssosationTemp[atomId] = null;
//                 $("#cntt"+ atomId).parent().attr('style', "display:none;");
                    $this.removeClass("link-strongRed").addClass("link-strongBlue");
                    $this.text('知识强关联');
                }
            };

            //知识强关联
            $(".sourceStrong").click(function () {
                var $this = $(this);
                var atomId = $this.attr("atomid").substring(6);
                if ($(this).hasClass("link-strongRed")) {
                    var confirmConfig = {
                        mode: 'confirm',
                        id: 'confirmId',
                        content: '您确定要取消强关联吗？'
                    }
                    var dialogc = new Dialog(confirmConfig);
                    dialogc.on('confirm',function(){
                        if ( $("#fileUpload" + atomId).length > 0) {
                            $("#fileUpload" + atomId).show();
                        }
                        if ( $("#picUpload" + atomId).length > 0) {
                            $("#picUpload" + atomId).show();
                        }
                        $this.removeClass("link-strongRed").addClass("link-strongBlue");
                        $("#tdcntt"+ atomId).removeAttr("style");
                        $("#cntt"+ atomId).attr("disabled", false);
                        if (strongAssosationTemp[atomId] != null) {
                            strongAssosationTemp[atomId] = null;
                        }
                        $this.text('知识强关联');
                        //取消强关联取消系列关联拖拽
                        if ($("#selectTdList" + atomId)) {
                            $("#selectTdList" + atomId).dragsort("destroy");
                            $("#selectTdList" + atomId).dragsort({
                                dragSelector: "span"
                            });
                        }
                        $("#oldFileList" +atomId ).find('.fileToBeMoved').attr('style','color:red;');
                        $("#oldPicList" +atomId ).find('.fileToBeMoved').attr('style','color:red;');
                        //取消强关联取消知识关联拖拽
                        if ($("#selectRelList" +atomId)) {
                            $("#selectRelList" +atomId).dragsort("destroy");
                            $("#selectRelList" +atomId).dragsort({
                                dragSelector: "span"
                            });
                        }
                        $('#ref' +atomId).prev().attr('disabled', false);
                        //时间单位可选择
                        if ($("#timePeriodUnit"+ atomId)) {
                            $("#timePeriodUnit"+ atomId).attr('disabled', false);
                        }
                        //内存单位可选择
                        if ($('#memUnit'+ atomId)) {
                            $('#memUnit'+ atomId).attr('disabled', false);
                        }
                        //数据单元单位可选择
                        if ($("#dataUnit" + atomId)) {
                            $("#dataUnit" + atomId).attr('disabled', false);
                        }
                        //价格时间单位可选择
                        if ($("#priceTimeUnit" + atomId)) {
                            $("#priceTimeUnit" + atomId).attr('disabled', false);
                        }
                        //日期类型及日期时间类型可选择
                        if($('#cntt'+ atomId +" input[name='cntt']")) {
                            $('#cntt'+ atomId +" input[name='cntt']").attr('disabled', false);
                        }
                        //地区类型可选择
                        if($('#regnIdContiner'+ atomId +" input[name='cntt']").prev()) {
                            $('#regnIdContiner'+ atomId +" input[name='cntt']").prev().attr('disabled', false);
                        }

                    })
                } else {
                    var param = {};
                    var paraType = $(this).parent().parent().find("input[name=paraTypeCd]").val();
                    if (paraType == "2" || paraType == "3") {
                        new Dialog({
                            mode: 'tips',
                            content: '单选及多选类型不允许强关联操作！'
                        });
                        return ;
                    } else {
                        param.paraTypeCd = paraType;
                        var regnId = $('input[name="regnId"]').val();
//                    Util.ajax.getJson(Util.constants.CONTEXT+'/kmAssociate/getSuperRegnId',{regnId : regnId}, function(json, status){
//                        if(status){
//                            param.regnId = json.bean;
//                        }
//                    }, true);
                        param.regnId = regnId;
                        if (allAttrs && allAttrs[atomId] && allAttrs[atomId].forceRltAtomId){
                            param.srcAttrId = allAttrs[atomId].forceRltAtomId;
                        }
                        new SelectSourceFile(param, okCallback,$(this));
                    }
                }

            });

            $(".right-content").scroll(function(){
                if(ztreeClickFlag){
                    ztreeClickFlag = false;
                    return;
                }
                var critHeight = 310;
                // if(flag.batchFlag){
                //     critHeight = 10;
                // }else{
                //     critHeight = 215;
                // }
                var titles = $(".title-text");
                for(var i = 0;i < titles.length;i ++){
                    if(titles.eq(i).offset().top - critHeight > 0){
                        var index;
                        if(i == 0){
                            index = 0;
                        }else{
                            index = i - 1;
                        }
                        //获取当前最顶部位置的table的id
                        var id;
                        if (tmpGroupData && tmpGroupData.length > 0) {
                            id = tmpGroupData[0].grpngId;
                        }
                        if (!id){
                            id = titles.eq(index).attr("id").substring(10);
                        }
                        var treeObj = $.fn.zTree.getZTreeObj("tree");
                        var node = treeObj.getNodeByParam("grpngId", id, null);
                        treeObj.selectNode(node);

                        var path = node.getPath();
                        $(path).each(function(){
                            treeObj.expandNode(this, true, false, true);
                        });

                        return;
                    }
                }
                //执行结束  说明未找到当前最上面的tab
                var treeObj = $.fn.zTree.getZTreeObj("tree");
                var id = $(".title-text:last").attr("id").substring(10);
                var node = treeObj.getNodeByParam("grpngId", id, null);

                var path = node.getPath();
                $(path).each(function(){
                    treeObj.expandNode(this, true, false, true);
                });

                treeObj.selectNode(node);
            });

            if(acceptPrePubFlag){
                $(".sourceStrong").unbind("click").addClass("t-btn-disabled");
            }

        };

        //标识, 包括批量和添加相似
        var flag = {batchFlag: false};

        var setAddSimPusFlag = function (flag,titleType) {
            titleTypeCode=titleType;
            addSimPusFlag = flag;
        }
        var setAcceptPrePubFlag = function (flag,titleType) {
            titleTypeCode=titleType;
            acceptPrePubFlag = flag;
        }
        var setbatchFlag = function(batchFlag,titleType){
            titleTypeCode=titleType;
            flag.batchFlag = batchFlag;
        };

        var tmpltChanges = function() {
            if (changeFlag) {
                return changeFlag;
            }
            return TypeOptionGen.tmpltChangeFlag();
        }

        var initByKlgId = function(el,klgId,titleType,fcallback){
            titleTypeCode=titleType;
            //isUpdate = true;
            if(klgId!=null){
                dataLoad(klgId,function () {
                    if (sourceData) {
                        if (sourceData["allDataType"]) {
                            allDataType = sourceData["allDataType"];
                        }
                        if (sourceData["allAttrs"]) {
                            allAttrs = sourceData["allAttrs"];
                        }

                        /**
                         if (sourceData["groups"]) {
                        groupData = sourceData["groups"];
                    }*/

                        if (sourceData["tmpltId"]) {
                            tmpltId = sourceData["tmpltId"];
                        }
                        if (sourceData["richMap"]) {
                            richMap = sourceData["richMap"];
                            $.extend(richMapTemp,richMap);
                        }
                        if (sourceData["allExcp"]) {
                            exception = sourceData["allExcp"];
                        }
                        if (sourceData["allAnnotation"]) {
                            annotation = sourceData["allAnnotation"];
                        }
                        /**
                         * if (sourceData["chnlCode"]) {
                        chnlCode = sourceData["chnlCode"];
                    }*/
                        if (sourceData["allStrongRelation"]) {
                            strongAssosation = sourceData["allStrongRelation"];
                        }
                        if (sourceData["relationKlgs"]) {
                            relationKlgs = sourceData["relationKlgs"];
                        }else{
                            relationKlgs = [];
                        }
                    }
                });
            }
            if(tmpltId==null){
                return getTemplateRequest;
            }
            //getTemplateRequest(el,tmpltId,null,fcallback);
            beforeLoad(el, fcallback);

        }

        var initByTmpltId = function(el,tmpltId,titleType,knwlgGathrTypeCd,fcallback) {
            if(tmpltId==null)
            {
                alert("模板id不存在");
                return;
            }
            titleTypeCode=titleType;
            getTemplateRequest(el,tmpltId,knwlgGathrTypeCd,fcallback);
        };

        /**
         * 设置 注解和例外按钮的样式
         */
        var setLinkStyle = function(){
            for (var key in exception) {
                $("#exce" + key).removeClass("link-blue").addClass("link-red");
            }
            for (var key in annotation) {
                var anno = JSON.parse(annotation[key]).annotation;
                if(anno){
                    $("#anno" + key).removeClass("link-blue").addClass("link-red");
                }
            }
            for (var key in strongAssosation) {
                $("#strong" + key).removeClass("link-strongBlue").addClass("link-strongRed");
            }
        };

        var beforeLoad = function (el, fcallback) {
            dataTypeCheckData = sourceData["dataTypeCheckData"];
            var groups = sourceData["groups"];
            sourceData["timePeriodUnit"] = timePeriodUnit;
            sourceData["memUnit"] = memUnit;
            sourceData["priceTimeUnit"] = priceTimeUnit;
            //循环模板分组，替换采编时被改变的参数类型
            if (allDataType != null) {
                for (var i in groups) {
                    for (var j in groups[i].attr) {
                        var eachAttr = groups[i].attr[j];
                        var eachAttrKey = eachAttr["docKey"];
                        if (eachAttrKey && allDataType[eachAttr["atomId"]]) {
                            //当原子类型在可选范围内时进行类型更换，否则不进行更换
                            if (eachAttr["typeOptnl"][allDataType[eachAttr["atomId"]]]) {
                                //修改初始化类型
                                eachAttr["paraTypeCd"] = allDataType[eachAttr["atomId"]];
                                //价格、时间价格、内存类型读取知识中保存的单位
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_TIME == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["timePeriodUnit"][eachAttr["atomId"]] = eachAttrKey["wkunit"];
                                }
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["memUnit"][eachAttr["atomId"]] = eachAttrKey["wkunit"];
                                }
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_PRICE == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["priceTimeUnit"][eachAttr["atomId"]] = eachAttrKey["wkunit"];
                                }
                                //修改初始化类型变量dataTypeCheckData
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["relate"][eachAttr["atomId"]] = eachAttr["atomId"];
                                }
                                //修改初始化类型变量dataTypeCheckData
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["relateSerials"][eachAttr["atomId"]] = eachAttr["atomId"];
                                }
                                //修改初始化类型变量dataTypeCheckData
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_FILE == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["file"][eachAttr["atomId"]] = eachAttr["atomId"];
                                }
                                //修改初始化类型变量dataTypeCheckData
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_PIC == eachAttr["paraTypeCd"]) {
                                    dataTypeCheckData["pic"][eachAttr["atomId"]] = eachAttr["atomId"];
                                }
                                //修改初始化类型变量dataTypeCheckData
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_RADIO == eachAttr["paraTypeCd"]) {
                                    if (dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["2"]) {
                                        dataTypeCheckData["radio"][eachAttr["atomId"]] = dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["2"]["optVal"];
                                    }
                                }
                                if (Util.constants.NGKM_ATOM_DATA_TYPE_CHECK == eachAttr["paraTypeCd"]) {
                                    if (dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["3"]) {
                                        dataTypeCheckData["checkbox"][eachAttr["atomId"]] = dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["3"]["optVal"];
                                    }
                                }
                            } else {
                                allAttrs[eachAttr["atomId"]]["wrongType"] = true;
                            }
                        }
                    }
                }
            }

            componentGroup = {
                allAttrs: allAttrs,
                radioGroup: radioGroup,
                checkboxGroup: checkboxGroup,
                editorGroup: editorGroup,
                dateGroup: dateGroup,
                dateTimeGroup: dateTimeGroup,
                richMapTemp: richMapTemp,
                dataTypeCheckData: dataTypeCheckData,
                acceptPrePubFlag: acceptPrePubFlag,
                atomType: atomType
            };
            TypeOptionGen.init(componentGroup);


            var template = Hdb.compile(docEdit);
            var levelGroup = buildGroupsLevel(groups);
            groups = levelGroup;
            sourceData.batchFlag = flag.batchFlag;
            sourceData.addSimPusFlag = addSimPusFlag;
            sourceData.addSimEditFlag = addSimEditFlag;
            sourceData.acceptPrePubFlag = acceptPrePubFlag;
            var allResult = template(sourceData);

            el.append(allResult);
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].grpngTypeCd == '1' && groups[i].suprGrpngId == 0) {
                    groups[i].iconSkin = "gong"
                }
                if (groups[i].grpngTypeCd == '2' && groups[i].suprGrpngId == 0) {
                    groups[i].iconSkin = "ying"
                }
            }
            if (!flag.batchFlag) {
                groups.push({grpngNm: "公共属性", grpngId: "-1", suprGrpngId: ""});
            }
            groups.push({grpngNm: "模板分组", grpngId: "0", suprGrpngId: "", open: true});
            tmpTreeInit(groups);
            gathCommt = sourceData["gathCommt"];

            //设置默认工作组合默认渠道:修改知识不需要
            //setAllWorkGroups();
            chnlCodeSelectInit();
            eventInit();
            $(".right-content").trigger("scroll");
            renderDataType();
            fillRespPrsn();
            fillRichIcon();
            getGroupNm();
            treeInit();
            fcallback();
            setLinkStyle();
            initComponents();
            initStrongRelation();
            tableStyleForIE8();
            //将回显的例外信息 放到对象中
            $.extend(exceptionTemp, exception);
            //将回显的注解信息 放到对象中
            $.extend(annotationTemp, annotation);
            //将回显的强关联信息 放到对象中
            $.extend(strongAssosationTemp, strongAssosation);
            if (!flag.batchFlag) {
                RelevanceAttribute.selectKnowledge(titleTypeCode,getOldRelation);
            }

            $("#bothwayValue").dragsort({
                dragSelector: "span"
            });
            $("#onewayValue").dragsort({
                dragSelector: "span"
            });
            $("#seriesBothwayValue").dragsort({
                dragSelector: "span"
            });
            $("#mutualExclusionValue").dragsort({
                dragSelector: "span"
            });

            if (acceptPrePubFlag) {
                $("#detailPanel").find("select").attr("disabled", true);
            }

            knwlgAlsPlho();
        }
        var getTemplateRequest = function (el,tmpltId,knwlgGathrTypeCd,fcallback) {
            Util.ajax.getJson(Util.constants.CONTEXT + "/knowledgemgmt/template/" + tmpltId, {}, function (result) {
                if (result.RSP && result.RSP.DATA) {
                    if (result.RSP.DATA.length > 0) {
                        var templateData = result.RSP.DATA[0];
                        dataTypeCheckData = templateData["dataTypeCheckData"];
                        /*               //循环模板分组，替换采编时被改变的参数类型
                                       if(allDataType!=null){
                                           for(var i in templateData.groups){
                                               for(var j in templateData.groups[i].attr){
                                                   var eachAttr = templateData.groups[i].attr[j];
                                                   if(allDataType[eachAttr["atomId"]]){
                                                       //当原子类型在可选范围内时进行类型更换，否则不进行更换
                                                       if(eachAttr["typeOptnl"][allDataType[eachAttr["atomId"]]]){
                                                           eachAttr["paraTypeCd"] = allDataType[eachAttr["atomId"]];
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_TIME == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["timePeriodUnit"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["memUnit"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_PRICE == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["priceTimeUnit"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["relate"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["relateSerials"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_FILE == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["file"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_PIC == eachAttr["paraTypeCd"]){
                                                               dataTypeCheckData["pic"][eachAttr["atomId"]] = eachAttr["atomId"];
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_RADIO == eachAttr["paraTypeCd"]){
                                                               if(dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["2"]){
                                                                   dataTypeCheckData["radio"][eachAttr["atomId"]] = dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["2"]["optVal"];
                                                               }
                                                           }
                                                           if(Util.constants.NGKM_ATOM_DATA_TYPE_CHECK == eachAttr["paraTypeCd"]){
                                                               if(dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["3"]){
                                                                   dataTypeCheckData["checkbox"][eachAttr["atomId"]] = dataTypeCheckData["typeOptnl"][eachAttr["atomId"]]["3"]["optVal"];
                                                               }
                                                           }
                                                       }else{
                                                           allAttrs[eachAttr["atomId"]]["wrongType"] = true;
                                                       }
                                                   }
                                               }
                                           }
                                       }*/
                        componentGroup = {
                            allAttrs: allAttrs,
                            radioGroup: radioGroup,
                            checkboxGroup: checkboxGroup,
                            editorGroup: editorGroup,
                            dateGroup: dateGroup,
                            dateTimeGroup: dateTimeGroup,
                            richMapTemp: richMapTemp,
                            dataTypeCheckData: dataTypeCheckData,
                            acceptPrePubFlag: acceptPrePubFlag,
                            atomType: atomType,
                            batchFlag: flag.batchFlag
                        };
                        TypeOptionGen.init(componentGroup);


                        if(knwlgGathrTypeCd != null){
                            knwlgGathrType = knwlgGathrTypeCd;//获取知识类型
                            templateData["knwlgGathrTypeCd"] = knwlgGathrTypeCd;
                        }
                        var template = Hdb.compile(docEdit);
                        templateData.batchFlag = flag.batchFlag;
                        var tmpGroupData = templateData.groups;
                        var levelGroup = buildGroupsLevel(templateData.groups);
                        templateData.groups = levelGroup;
                        templateData["timePeriodUnit"] = timePeriodUnit;
                        templateData["memUnit"] = memUnit;
                        templateData["priceTimeUnit"] = priceTimeUnit;

                        var allResult = template(templateData);

                        el.append(allResult);
                        initEasyUi();
                        for (var i = 0; i < tmpGroupData.length; i++) {
                            if (tmpGroupData[i].grpngTypeCd == '1' && tmpGroupData[i].suprGrpngId == 0){
                                tmpGroupData[i].iconSkin = "gong"
                            }
                            if (tmpGroupData[i].grpngTypeCd == '2' && tmpGroupData[i].suprGrpngId == 0){
                                tmpGroupData[i].iconSkin = "ying"
                            }
                        }
                        // if(!flag.batchFlag){
                        //     tmpGroupData.push({grpngNm: "公共属性", grpngId: "-1", suprGrpngId: ""});
                        // }
                        tmpGroupData.push({grpngNm: "模板分组", grpngId: "0", suprGrpngId: "", open:true });
                        tmpTreeInit(tmpGroupData);
                        gathCommt = templateData.gathCommt;

                        //设置默认工作组:
                        // setAllWorkGroups();
                        chnlCodeSelectInit();
                        eventInit(tmpGroupData);
                        $(".right-content").trigger("scroll");
                        renderDataType();
                        fillRespPrsn();
                        getGroupNm();
                        treeInit();
                        fcallback();
                        initComponents();
                        initStrongRelation();
                        tableStyleForIE8();
                        if (!flag.batchFlag) {
                            // RelevanceAttribute.selectKnowledge(titleTypeCode, getOldRelation);
                        }

                        // $("#bothwayValue").dragsort({
                        //     dragSelector: "span"
                        // });
                        // $("#onewayValue").dragsort({
                        //     dragSelector: "span"
                        // });
                        // $("#seriesBothwayValue").dragsort({
                        //     dragSelector: "span"
                        // });
                        // $("#mutualExclusionValue").dragsort({
                        //     dragSelector: "span"
                        // });

                        if(acceptPrePubFlag){
                            $("#detailPanel").find("select").attr("disabled", true);
                        }

                        knwlgAlsPlho();
                    }
                }
            }, true);
        }

        //根据工作组code 获取工作组名称
        var getGroupNm = function(){
            var groupCodes = $("#brwsPriv").val();
            if (!groupCodes) {
                return;
            }
            Util.ajax.postJson(Util.constants.CONTEXT + "/kmGroup/getWorkGroupInfoByCode", {groupCodes: groupCodes}, function (data) {
                //正常返回时  去调整页面展示内容
                if(data.returnCode == 0){
                    var groupNms = [];
                    $(data.beans).each(function(){
                        groupNms.push(this.groupName);
                    });

                    $("#brwsPrivShow").val(groupNms.join(","));
                    $("#brwsPrivShow").attr('title', groupNms.join(","));
                }
            });

        };

        //构造分组层级序列
        var buildGroupsLevel = function(groups){
            var secLevel = [];
            var baseLevel = [];
            $(groups).each(function(index){
                if(this.suprGrpngId != "0" && this.suprGrpngId){
                    secLevel.push(this);
                }else{
                    baseLevel.push(this);
                }
            });

            //遍历二级分组 加到对应的一级分组下
            for(var i = 0;i < secLevel.length;i ++){
                for(var j = 0;j < baseLevel.length; j ++){
                    if(baseLevel[j].grpngId == secLevel[i].suprGrpngId){
                        if(!baseLevel[j].childGroup){
                            baseLevel[j].childGroup = [];
                        }
                        baseLevel[j].childGroup .push(secLevel[i]);
                        break;
                    }
                }
            }

            //将构造好的层级结构分别展示出来
            secLevel = [];
            for(var i = 0; i< baseLevel.length;i ++){
                secLevel.push(baseLevel[i]);
                if(baseLevel[i].childGroup){
                    for(var j = 0;j < baseLevel[i].childGroup.length;j++){
                        secLevel.push(baseLevel[i].childGroup[j]);
                    }
                }
            }

            return secLevel;
        };
        var isHasexce = function (atomId) {
            return $("#" + atomId).last().find(".link-red").length === 0 ? false : true;
        };

        var showMessage = function () {
            new Dialog({
                mode: 'tips',
                content: '由于您清空了原子内容，该原子的例外和注解最终将不会被保存'
            });
        };

        var tableStyleForIE8 = function(){
            // 表格隔行换色FOR IE8
            var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
            if(isIE){
                var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
                reIE.test(userAgent);
                var fIEVersion = parseFloat(RegExp["$1"]);
                if(fIEVersion == 8){
                    //$('.t-table-striped body tr:odd').addClass('t-table-even-bg');
                    $('.t-table-striped > tbody tr:even').addClass('t-table-even-bg');
                }
            }

        }

        var initStrongRelation = function () {
            for (var atomId in strongAssosation) {
                if (!allAttrs || !allAttrs[atomId] || !allAttrs[atomId]["paraTypeCd"]) {
                    continue;
                }
                var paraTypeCd = allAttrs[atomId]["paraTypeCd"];
                if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_CHAR) {
                    $('#cntt' + atomId).attr('disabled', 'disabled');
                }
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_TIME) {
                    $("#cntt" + atomId).attr('disabled', 'disabled');
                    $("#timePeriodUnit" + atomId).attr('disabled', 'disabled');
                }
                /*               else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATE){
                                   $('#cntt' + atomId + " input[name='cntt']").attr('disabled', true);
                               }
                               else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATETIME){
                                   $('#cntt' + atomId + " input[name='cntt']").attr('disabled', true);
                               }*/
                /*                else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG){
                                    if(!acceptPrePubFlag){
                                        $("#selectRelList"+atomId).dragsort("destroy");
                                        if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                            $("#selectRelList"+atomId).dragsort({
                                                dragSelector: "span"
                                            });
                                        }
                                        $("#selectRelList"+atomId).find('.knowlgAtomClose').click(function(e){
                                            if ($("#strong" + atomId).prev().hasClass("link-strongBlue") ) {
                                                $(this).parent().remove();
                                                if($("#selectRelList"+atomId).find(".docRelateData").length === 0
                                                    && isHasexce(atomId)){
                                                    showMessage();
                                                }
                                            }
                                        });
                                    }
                                }*/
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY) {
                    $('#cntt' + atomId).attr('disabled', true);
                    $('#memUnit' + atomId).attr('disabled', true);
                }
                /*                else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_FILE){
                                    $("#fileUpload" + atomId).hide();
                                }*/
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT) {
                    $('#cntt' + atomId).attr('disabled', true);
                    $('#dataUnit' + atomId).attr('disabled', true);
                }
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_PRICE) {
                    $('#cntt' + atomId).attr('disabled', true);
                    $('#priceTimeUnit' + atomId).attr('disabled', true);
                }
                /*           else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_PIC){
                               $("#picUpload" + atomId).hide();
                           }*/
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_LLT) {
                    $('#cntt' + atomId).attr('disabled', true);
                }
                /*      else if(paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST){
                          if (!acceptPrePubFlag) {
                              $("#selectTd" + atomId).on('click', function () {
                                  if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                      new RelCatalog($('#selectTdList' + atomId), atomId);
                                  }
                              });
                          }
                      }*/
                else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_REGN) {
                    $('#regnIdContiner' + atomId + " input[name='cntt']").prev().attr('disabled', true);
                }

            }
        }

        var initComponents = function () {

            if(acceptPrePubFlag){
                TypeOptionGen.setAcceptPrePubFlag(acceptPrePubFlag);
            }
            if(!flag.batchFlag){
                //生效日期
                // var effTimeConfig = {
                //     el: $("#knwlgEffTimeDiv"),
                //     inputClassName: 'docPublicData',
                //     name: 'knwlgEffTime',    //开始日期文本框name
                //     isReadOnly: true,  //项可设置日期输入框是否只读
                //     type: "date",
                //     done: function (dates, value, endDate) {
                //     } //用户选中日期时执行的回调函数
                // }
                // if (sourceData && sourceData["knwlgEffTime"]) {
                //     effTimeConfig.defaultValue = sourceData["knwlgEffTime"];
                // }
                // new myDate(effTimeConfig);

                //失效日期
                // var invlidTimeConfig = {
                //     el: $("#knwlgInvldTimeDiv"),
                //     inputClassName: 'docPublicData',
                //     name: 'knwlgInvldTime',    //开始日期文本框name
                //     isReadOnly: true,  //项可设置日期输入框是否只读
                //     type: "date",
                //     done: function (dates, value, endDate) {
                //     } //用户选中日期时执行的回调函数
                // }
                // if (sourceData && sourceData["knwlgInvldTime"]) {
                //     invlidTimeConfig.defaultValue = sourceData["knwlgInvldTime"];
                // }
                // new myDate(invlidTimeConfig);
            }


            $(".radioContiner").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.radioGenerate(atomId);
            })

            $(".checkBoxContiner").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.checkBoxGenerate(atomId);
            });

            $(".fileContiner").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.fileGenerate(atomId);
                if(acceptPrePubFlag){
                    $("#tdcntt" + atomId).find("input").attr("disabled", true);
                }
            })

            $(".picContiner").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.picGenerate(atomId);
                if(acceptPrePubFlag){
                    $("#tdcntt" + atomId).find("input").attr("disabled", true);
                }
            })

            $(".dateEl").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.dateGenerate(atomId);
            })

            $(".dateTimeEl").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.dateTimeGenerate(atomId);
            })
            $(".selectRelSS").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.knwlgGenerate(atomId);
            })

            $(".selectTdSS").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.knwlgListGenerate(atomId);
            })

            $(".regnContiner").each(function () {
                var atomId = $(this).attr("atomid");
                TypeOptionGen.atomRegnGenerate(atomId);
            })

            $(".txtContiner").each(function () {
                var atomId = $(this).attr("atomid");
                $(this).next().on("click", function () {
                    if ($(this).parent().hasClass("textarea-fold")) {
                        $(this).parent().removeClass("textarea-fold");
                        $(this).parent().addClass("textarea-unfold");
                    } else {
                        $(this).parent().removeClass("textarea-unfold");
                        $(this).parent().addClass("textarea-fold");
                    }
                });
                $(this).on("keydown focus", function (e) {
                    if ($(this).parent().hasClass("textarea-fold") && ($(this).val().length > 16 || e.keyCode == 13)) {
                        $(this).parent().removeClass("textarea-fold");
                        $(this).parent().addClass("textarea-unfold");
                    }
                });
                $(this).blur(function () {
                    if (!trim($(this).val()) && isHasexce(atomId)) {
                        showMessage();
                    }
                });

            })

            //校验类型异常提示
            if(allAttrs){
                for(var atomId in allAttrs){
                    if(allAttrs[atomId] && allAttrs[atomId]["wrongType"]){
                        if($("#errorWormSpan"+atomId).length == 0){
                            $("#errorWorm"+atomId).append("<span id='errorWormSpan"+ atomId+ "'></span>");
                            changeFlag = true;
                            $("#errorWormSpan"+atomId).click(function () {
                                var id = this.id;
                                var paraTypeCd_exam = $('#ref'+id.substring(13)).attr('attrtype');
                                new Dialog({mode:'confirm',
                                    id:'error',
                                    content:'知识原子内容与模板原子参数类型不符：<br/>知识内容知识原子类型：'+renderKeyDataType(allAttrs[id.substring(13)]["paraTypeCd"])+'<br/>知识模板原子类型：'+renderKeyDataType(paraTypeCd_exam)+'</br>知识原子内容：'+renderAtomCntt(allAttrs[id.substring(13)]),
                                    cancelDisplay: false
                                })
                            })
                        }
                    }
                }
            }

            for(var atomId in dataTypeCheckData["timePeriodUnit"]){
                $("#timePeriodUnit"+atomId).val(dataTypeCheckData["timePeriodUnit"][atomId]);
            }
            for(var atomId in dataTypeCheckData["priceTimeUnit"]){
                $("#priceTimeUnit"+atomId).val(dataTypeCheckData["priceTimeUnit"][atomId]);
            }
            for(var atomId in dataTypeCheckData["memUnit"]){
                $("#memUnit"+atomId).val(dataTypeCheckData["memUnit"][atomId]);
            }
        }

        var renderKeyDataType = function (typeCd) {
            var typeName = null;
            for(var i in atomType){
                if(atomType[i].CODEVALUE == typeCd){
                    typeName = atomType[i].CODENAME;
                }
            }
            if(typeName == null){
                typeName = "未知原子类型";
            }
            return typeName;
        }

        var renderAtomCntt = function (allAttrs) {
            var nameArray = [];
            var nameString = "";
            switch (allAttrs["paraTypeCd"]){
                case Util.constants.NGKM_ATOM_DATA_TYPE_CHAR:
                case Util.constants.NGKM_ATOM_DATA_TYPE_RADIO:
                case Util.constants.NGKM_ATOM_DATA_TYPE_CHECK:
                case Util.constants.NGKM_ATOM_DATA_TYPE_RICH:
                case Util.constants.NGKM_ATOM_DATA_TYPE_DATE:
                case Util.constants.NGKM_ATOM_DATA_TYPE_DATETIME:
                case Util.constants.NGKM_ATOM_DATA_TYPE_LLT:
                    return allAttrs["cntt"];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_TIME:
                    return allAttrs["cntt"] +"&nbsp&nbsp&nbsp单位："+ getcovData(time_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY:
                    return allAttrs["cntt"] +"&nbsp&nbsp&nbsp单位："+ getcovData(ram_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_PRICE:
                    return allAttrs["cntt"] +"&nbsp&nbsp&nbsp单位："+ getcovData(priceOrTime_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT:
                    return allAttrs["cntt"] +"&nbsp&nbsp&nbsp单位："+ allAttrs["wkunit"];
                    break;
                //地区类型
                case Util.constants.NGKM_ATOM_DATA_TYPE_REGN:
                    var provnceNm;
                    Util.ajax.ajax({
                        type:"POST",
                        async:false,
                        data:{regnId:allAttrs["cntt"]},
                        url:Util.constants.CONTEXT+'/kmConfig/getTKmDistrictConfigByRegnId',
                        success:function(datas){
                            provnceNm = datas.bean.regnNm;
                        },error:function(datas){  return;
                        }
                    });
                    return provnceNm;
                    break;
                //关联知识
                case Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG:
                    if(allAttrs!=undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["relaName"]);
                        }
                    }
                    for (var i=0; i <nameArray.length; i++ ) {
                        nameString = nameString +nameArray[i]+(i == nameArray.length -1 ? '' : "</br>") ;
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST:
                    if(allAttrs!=undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["relaName"]);
                        }
                    }
                    for (var i=0; i <nameArray.length; i++ ) {
                        nameString = nameString +nameArray[i]+(i == nameArray.length -1 ? '' : "</br>") ;
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_FILE:
                    if(allAttrs!=undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["fileName"]);
                        }
                    }
                    for (var i=0; i <nameArray.length; i++ ) {
                        nameString = nameString +nameArray[i]+(i == nameArray.length -1 ? '' : "</br>") ;
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_PIC:
                    if(allAttrs!=undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["fileName"]);
                        }
                    }
                    for (var i=0; i <nameArray.length; i++ ) {
                        nameString = nameString +nameArray[i]+(i == nameArray.length -1 ? '' : "</br>") ;
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_MEDIA:
                    if(allAttrs!=undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["fileName"]);
                        }
                    }
                    for (var i=0; i <nameArray.length; i++ ) {
                        nameString = nameString +nameArray[i]+(i == nameArray.length -1 ? '' : "</br>") ;
                    }
                    return nameString;
                    break;
            }
        }

        var setAllWorkGroups = function(){
            //取当前所有浏览工作组
            Util.ajax.ajax({
                type: "GET",
                url: Util.constants.CONTEXT + "/kmGroup/getGroupsAllBySuper/000" + '?v=' + new Date().getTime(),
                async: false,
                success: function (data) {
                    if(data.object!=null){
                        $(".atomBrwsPriv").val(data.object);
                        $("#brwsPriv").val(data.object);
                        $("#brwsPrivShow").val(data.object);
                        $("#brwsPrivShow").attr("title",data.object);
                        //$("#brwsPrivShow").attr("brwsPrivShow",data.object);
                    }
                }
            });
        }

        var initEasyUi = function () {
            $("#klgData").find("input.easyui-datetimebox").datetimebox();
            $("#klgData").find("input.easyui-textbox").textbox();
            $("#klgData").find("input.easyui-datetimebox").datetimebox({
                editable: false,
                disabled: false
            });
        }

        var chnlCodeSelectInit = function() {
            var chnlName = "";
            var chnlId = "";
            var chnlIds = [];
            if (sourceData != null) {
                if (sourceData.chnlCode && allChnlCodes) {
                    chnlIds = sourceData.chnlCode.split(",");
                    for (var i = 0; i < chnlIds.length; i++) {
                        for (var j = 0; j < allChnlCodes.length; j++) {
                            if (chnlIds[i] == allChnlCodes[j].CODEVALUE) {
                                chnlName = chnlName + allChnlCodes[j].CODENAME + ",";
                                chnlId = chnlId + allChnlCodes[j].CODEVALUE + ",";
                            }
                        }
                    }
                    if (chnlName != "") {
                        chnlName = chnlName.substring(0, chnlName.length - 1);
                        chnlId = chnlId.substring(0, chnlId.length - 1);
                    }
                    $("#knwlgChnlCode").val(chnlName);
                    $("#chnlCode").val(chnlId);
                }
            }else{
                if (allChnlCodes) {
                    for (var j = 0; j < allChnlCodes.length; j++) {
                        chnlName = chnlName + allChnlCodes[j].CODENAME + ",";
                        chnlId = chnlId + allChnlCodes[j].CODEVALUE + ",";
                    }
                    if (chnlName != "") {
                        chnlName = chnlName.substring(0, chnlName.length - 1);
                        chnlId = chnlId.substring(0, chnlId.length - 1);
                    }
                    $("#knwlgChnlCode").val(chnlName);
                    $("#chnlCode").val(chnlId);
                    $("input[name='chnlCode']").each(function(){
                        $(this).val(chnlId);
                    });
                }
            }
        }
        /**
         * 获取历史关联知识
         */
        var getOldRelation = function () {
            if(relationKlgs == null){
                return;
            }

            for(var i in relationKlgs){
                var relaName = relationKlgs[i].knowName;
                var knowId = relationKlgs[i].rltObjId;
                var relaType = relationKlgs[i].rltTypeCd;
                var rmk = relationKlgs[i].rmk;
                var srcCode = relationKlgs[i].srcCode;
                var htmlMessage ='<li class="par-tag relate-data-drag"><span title="' + relaName + '" id="'+knowId+relaType+'" relaid="'+ knowId+'" class="docRelateData" relatype="' +relaType+ '" rmk = "'+rmk + '" srcCode = "'+srcCode +'">'+relaName+'</span><a class="knowlgAtomClose" href="#nogo" id="V_'+knowId+relaType+'"></a></li>';
                //var klgHtml ='<input class="docRelateData" type="hidden" relaId = "'+knowId+'"  relaname = "'+knowName+'"  relatype="'+relaType+'"/>';
                //$('#form').append(klgHtml);

                if(relaType == "1"){
                    $('#bothwayValue').append(htmlMessage);
                }
                else if(relaType == "2"){
                    $('#onewayValue').append(htmlMessage);
                }
                else if(relaType == "3"){
                    $("#seriesBothwayValue").append(htmlMessage);
                }
                else if(relaType == "4"){
                    $("#seriesOnewayValue").append(htmlMessage);
                }
                else if(relaType == "5"){
                    $("#mutualExclusionValue").append(htmlMessage);
                }
                else if(relaType == "6"){
                    $("#commonSmsValue").append(htmlMessage);
                }
                //关闭事件添加
                if(!acceptPrePubFlag){
                    $('#V_'+knowId+relaType).click(function(e){
                        $(this).parent().remove();
                    });
                }
            }

        }

        var tmpTreeInit = function (templateData) {

            var setting = {
                treeId: "groupTree",      //zTree 的唯一标识,初始化后,等于 用户定义的容器的 id 属性值
                async:{
                    enable: true,        //是否开启异步加载模式
                    //以下配置,async.enable=true时生效
                    url: "",      //Ajax获取数据的地址
                    type: "post",      //Ajax的http请求模式
                    autoParam: []       //异步加载时需要自动提交父节点属性的参数
                },
                callback:{
                    onClick:zTreeOnClick
                },
                view:{
                    showIcon: true,     //是否显示节点图标,默认值为true
                    showLine: true,     //是否显示节点之间的连线,默认值为true
                    showTitle: true,    //是否显示节点的 title 提示信息(即节点DOM的title属性),与 setting.data.key.title 同时使用
                    fontCss: {},        //自定义字体
                    nameIsHTML: false  // name 属性是否支持HTML脚本,默认值为false
                },
                data:{
                    keep:{
                        leaf: false,
                        parent: false
                    },
                    key:{
                        checked: "checked",
                        children: "children",
                        name: "grpngNm",
                        title: "", //若节点配置有title属性,设置title:"title"则显示配置的title值；否则显示节点的name值
                        url: "url"
                    },
                    simpleData:{
                        enable: true,
                        idKey: "grpngId",
                        pIdKey: "suprGrpngId",
                        rootPId: "0"
                    }
                }
            }

            function zTreeOnClick(event, treeId, treeNode){
                if(treeNode.grpngId == 0){
                    return;//非叶子节点不进行响应
                }
                ztreeClickFlag = true;
                var nodeId = treeNode.grpngId;
                if(nodeId == "-1"){
                    nodeId = "#publicAttrs";
                }else{
                    nodeId = "#groupTable"+treeNode.grpngId;
                }
                var top = $(nodeId).offset().top;
                var scrollTop = $(".right-content").scrollTop();
                var critHeight = 310;
                // if(flag.batchFlag){
                //     critHeight = 10;
                // }else{
                //     critHeight = 215;
                // }
                $(".right-content").scrollTop(scrollTop + top - critHeight);
            }

            var zTreeObj = $.fn.zTree.init($("#tree"), setting, templateData);
            // zTreeObj.setEditable(false);
            // zTreeObj.selectNode(node);
            //zTreeObj.expandNode(node, true, false, true);
        };

        var dataLoad = function(klgId,callbak){
            //查询发布表作为添加相似数据
            if (addSimPusFlag == true) {
                Util.ajax.ajax({
                    type: "GET",
                    url: Util.constants.CONTEXT+'/knowledgeMgmt/getPubedWithTmpltAddSim/' + klgId +"?"+ new Date().getTime(),
                    async: false,
                    success: function (data) {
                        if(data.returnCode != "0"){
                            alert(data.returnMessage);
                            return;
                        }
                        if(data.object!=null){
                            //知识基础属性
                            sourceData = data.object;
                            callbak();
                        }
                        else{
                            alert("草稿不存在");
                        }
                    },
                    error: function () {
                        return false;
                    }
                });
            }else if(!flag.batchFlag){
                Util.ajax.getJson(Util.constants.CONTEXT + '/knowledgemgmt/getknowledgewithtmplt/' + klgId + "?" + new Date().getTime(), {}, function (result) {
                    if (result.RSP.RSP_CODE == '1'){
                        sourceData = result.RSP.DATA[0];
                        callbak();
                    } else{
                        $.messager.alert(data.RSP.RSP_DESC);
                    }
                },true)
            }
        }

        var fillRespPrsn = function(){
            if(sourceData == null || addSimEditFlag == true|| addSimPusFlag == true){
                var nowrespPrsnId;
                Util.ajax.ajax({
                    type:"GET",//请求方法
                    async:false,//同步
                    url:Util.constants.CONTEXT+'/user/session?v='+new Date().getTime(),//路径
                    success:function(datas){
                        nowrespPrsnId = datas.bean.staffCode;//员工编号
                    },error:function(datas){     return;
                    }
                });
                $(".docPublicData").each(function(){
                    var id = $(this).attr("id");
                    //特殊处理责任人
                    if(id == 'respPrsnId'){
                        if(nowrespPrsnId){
                            $(this).attr("data", nowrespPrsnId);
                            Util.ajax.getJson(Util.constants.CONTEXT + '/kmGroup/getTramsName', {emapvPrsnId: nowrespPrsnId}, function (data) {
                                if (data.returnCode == 0) {
                                    if (data.bean && data.bean != "null") {
                                        $("#respPrsnId").val(data.bean);
                                    }else{
                                        $("#respPrsnId").val($("#respPrsnId").attr("data"));
                                    }
                                }
                            });
                        }
                    }
                });
            }

            if (sourceData && sourceData["respPrsnId"] && addSimEditFlag == false && addSimPusFlag == false ) {
                $("#respPrsnId").attr("data",sourceData["respPrsnId"]);
                Util.ajax.getJson(Util.constants.CONTEXT + '/kmGroup/getTramsName', {emapvPrsnId: sourceData["respPrsnId"]}, function (data) {
                    if (data.returnCode == 0) {
                        if (data.bean && data.bean != "null") {
                            $("#respPrsnId").val(data.bean);
                        } else {
                            $("#respPrsnId").val($("#respPrsnId").attr("data"));
                        }
                    }
                });
            }
        }
        var treeInit = function () {
            regnTreeInit();
            pathTreeInit();
            urdfTabsInit();
        }

        var  addPath = function(pArr, htmlArr) {
            var itemHtml = '';
            for(var i=0; i<pArr.length;i++){
                var item =pArr[i];
                itemHtml += item.name+((i == (pArr.length-1))? '':'/');
            }
            htmlArr.push(itemHtml);
        };

        function topSearchInputIn(){
            if($("#knwlgAls")[0].value == "多个别名请用逗号分隔"){
                $("#knwlgAls")[0].value ="";
            }
            $("#knwlgAls")[0].style.color="#000";
        }

        function topSearchInputOut(){
            if ($("#knwlgAls").val() == "") {
                var text = $("#knwlgAls").attr("placeholder");
                $("#knwlgAls")[0].value = text;
                $("#knwlgAls")[0].style.color = "#999";
            }
        }
        //ie8不支持placeholder的替代方案
        function knwlgAlsPlho() {
            //判断浏览器是否支持placeholder属性
            var supportPlaceholder = 'placeholder' in document.createElement('input');
            if (!supportPlaceholder) {
                //var text = document.getElementById("topSearchInput").placeholder;
                var text = $("#knwlgAls").attr("placeholder");
                if(!$("#knwlgAls").val() || $("#knwlgAls").length > 0){
                    $("#knwlgAls")[0].value = text;
                    $("#knwlgAls")[0].style.color = "#999";
                }
                $("#knwlgAls")[0].attachEvent("onfocus", topSearchInputIn);
                $("#knwlgAls")[0].attachEvent("onblur", topSearchInputOut);
            }
        }

        //自定义页签回显
        var urdfTabsInit = function() {
            var tabsIdArray = [];
            var tabsNameArray = [];
            if(sourceData!=null){
                var urdfTabsList = [];
                if(acceptPrePubFlag == false) {
                    if(relationKlgs == null){
                        return;
                    }else{
                        for(var i=0;i<relationKlgs.length;i++){
                            if(relationKlgs[i]["rltTypeCd"]=="9"){
                                urdfTabsList.push(relationKlgs[i])
                            }
                        }

                    }
                }

                if(urdfTabsList.length>0){
                    for(var i=0; i<urdfTabsList.length;i++){
                        tabsIdArray.push(urdfTabsList[i]["rltObjId"]);
                        tabsNameArray.push(urdfTabsList[i]["URDF_TABS_NM"]);
                    }
                    tabsNameArray = tabsNameArray.join(",");
                    $('#urdfTabsHidden').val(tabsNameArray);
                    $('#urdfTabs').val(tabsIdArray);
                    $('#urdfTabsHidden').attr('title', tabsNameArray);
                }
            }
        }

        var pathTreeInit = function(){
            //路径
            var pathTreeData = null;
            var defaultPathTreeData = null;
            var pathArray = [];
            var pathList = [];
            if(sourceData!=null){
                pathList = sourceData["pathList"];
                if(pathList.length>0){
                    var pathIdArray = pathList[0].catlId;
                    var pathNameArray = [];
                    pathArray.push(pathIdArray);
                    for(var i=1;i<pathList.length;i++){
                        pathIdArray = pathIdArray + "," + pathList[i].catlId;
                        pathArray.push(pathList[i].catlId);
                    }
                    for (var i = 0; i < pathArray.length; i++) {
                        Util.ajax.getJson(Util.constants.CONTEXT+'/docCatalog/getCataList',{catlId : pathArray[i]}, function(json, status){
                            if(status){
                                var pArr = [];
                                $(json.beans).each(function(){
                                    pArr.push({
                                        'id':  this.catlId,
                                        'name': this.catlNm
                                    });
                                });
                                pArr = pArr.reverse();
                                addPath(pArr, pathNameArray);
                            }
                        }, true);
                    }
                    pathNameArray = pathNameArray.join(",");
                    defaultPathTreeData = {};
                    defaultPathTreeData["id"] = pathIdArray;
                    defaultPathTreeData["name"] = pathNameArray;
                    $("#path").val(pathIdArray);
                    $("#pathName").val(pathNameArray);
                    $("#pathName").attr("title", pathNameArray);
                }
            }
        }
        var regnTreeInit = function () {
            //加载地区树
            if(sourceData!=null) {
                if(acceptPrePubFlag == false){
                    defaultRegnTreeData = {};
                    defaultRegnTreeData.regnId = sourceData.regnId;
                }
            }

            $("#regnIdContiner").find("input.easyui-combotree").combotree({
                url: Util.constants.CONTEXT + "/district/getDistrictListByUser",
                method: "GET",
                multiple: false,    //不可多选
                editable: false,
                loadFilter: function (result) {
                    regnData = {};
                    var regnArray = result.RSP.DATA;
                    var isParent = result.RSP.RSP_DESC == "isParent" ? true : false;
                    for (var i = 0; i < regnArray.length; i++) {
                        regnArray[i].text = regnArray[i].codeName;
                        regnArray[i].id = regnArray[i].codeValue;
                        if (regnArray[i].isParent) {
                            regnArray[i].state = 'closed';
                        }
                        regnData[regnArray[i].codeValue] = regnArray[i].codeName;
                    }
                    if (isParent){
                        regnTreeData = regnArray[0];
                    }else{
                        regnChildTreeData = regnArray;
                    }
                    if(defaultRegnTreeData == null) {
                        defaultRegnTreeData = {};
                        defaultRegnTreeData.regnNm = regnTreeData.REGNNM;
                        defaultRegnTreeData.regnId = regnTreeData.REGNID;
                    }else{
                        if(regnTreeData.REGNID == defaultRegnTreeData.regnId){
                            defaultRegnTreeData.regnNm = regnTreeData.REGNNM;
                        }else{
                            if (regnChildTreeData.length > 0) {
                                for (var i = 0;i< regnChildTreeData.length;i++) {
                                    if(regnChildTreeData[i].REGNID == defaultRegnTreeData.regnId){
                                        defaultRegnTreeData.regnNm = regnChildTreeData[i].REGNNM;
                                    }
                                }
                            }
                        }
                    }
                    if(regnTreeData!=null){

                        if(defaultRegnTreeData["regnId"] != regnTreeData.REGNID){
                            $(".exceptionButton").addClass("hide");
                            $(".exceptionButton").prev("span").addClass("hide");
                        }

                        $("#regnIdContiner").find("input[name=regnId]").change(function(){
                            if($(this).val() != regnTreeData.REGNID){
                                $(".exceptionButton").addClass("hide");
                                $(".exceptionButton").prev("span").addClass("hide");
                            }else{
                                $(".exceptionButton").removeClass("hide");
                                $(".exceptionButton").prev("span").removeClass("hide");
                            }
                        });

                        //全国管理员不能选知识地域
                        if(defaultRegnTreeData.regnId == '000'){
                            //禁用；
                        }

                        /*if (isUpdate && !addSimEditFlag && !addSimPusFlag) {
                            $("#regnIdContiner").find("input:first").attr("disabled", true);
                        }*/

                        if($("#regnIdContiner").find("input[name=regnId]").val() != regnTreeData.REGNID){
                            $(".exceptionButton").addClass("hide");
                            $(".exceptionButton").prev("span").addClass("hide");
                        }

                    }
                    return regnArray;
                },
                onBeforeExpand: function (node, param) {    // 下拉树异步
                    $('#authRegnList').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/district/getDistrictAndChildListByUser?codeValue=" + node.id;
                },
                onChange:function(newValue, oldValue){
                    $("#regnIdContiner").find("input.values").val(newValue);    //赋值
                    $("#regnIdContiner").find("input.docPublicData").val(regnData[newValue]);
                }
            });
        }

        var fillRichIcon = function () {
            for(var atomId in richMap){
                $("#rich"+atomId).addClass("f-lk-richtext2").removeClass("f-lk-richtext");
            }
        }

        var getklgData = function () {
            var klgData = {}
            //选择渠道
            klgData["chnlCode"] = $("#chnlCode").val();
            $(".docPublicData").each(function () {
                klgData[$(this).attr("name")] = $(this).val();
                if ($(this).attr("name") == "respPrsnId") {
                    if ($(this).attr("data")) {
                        klgData[$(this).attr("name")] = $(this).attr("data");
                    }
                }
            });
            //公告接收群组
            klgData["anoceRcvGrp"] = $("#anoceRcvGrpShow").val();
            //浏览权限
            klgData["brwsPriv"] = $("#brwsPriv").val();


            //补充一些无法设置className的数据
            klgData["path"] = $("#path").attr("pathidarray");

            $("#regnIdContiner").find("input[name='regnId']").each(function () {
                klgData["regnId"] = $(this).val();
            })

            $("#pathContiner").find("input[name='path']").each(function () {
                klgData["path"] = $(this).val();
            })

            $("#urdfTabs").each(function () {
                klgData["urdfTabs"] = $(this).val();
            })

            var atomArray = new Array();
            $("tr.dataTr").each(function () {
                if (!$(this).hasClass("tableTitle")) {
                    var jsonO = {};
                    var fileArray = new Array();
                    var relSerialArray = new Array();
                    var relaArray = new Array();
                    $(this).find("input").each(function () {
                        //原子中普通类型选择
                        if ($(this).val() && $(this).attr("name")) {
                            jsonO[$(this).attr("name")] = $(this).val();
                        }

                        //原子中文件类型查找获取
                        if ($(this).hasClass("fileAtom")) {
                            var fileObject = new Object();
                            fileObject.fileName = $(this).attr("filename");
                            fileObject.fileId = $(this).attr("fileid");
                            fileArray.push(fileObject);
                            jsonO["cntt"] = JSON.stringify(fileArray);
                        }

                        //原子中图片类型查找获取
                        if ($(this).hasClass("picAtom")) {
                            var fileObject = new Object();
                            fileObject.fileName = $(this).attr("filename");
                            fileObject.fileId = $(this).attr("fileid");
                            fileArray.push(fileObject);
                            jsonO["cntt"] = JSON.stringify(fileArray);
                        }
                    })
                    $(this).find("textarea").each(function () {
                        //原子中普通类型选择
                        if ($(this).val()) {
                            jsonO[$(this).attr("name")] = $(this).val();
                        }
                    })
                    //获取关系知识类型
                    $(this).find(".selectRelSS").find("span").each(function () {
                        relaArray.push($(this).attr("relaid"));
                    })
                    if (relaArray.length != 0) {
                        jsonO["cntt"] = relaArray.join(',');
                    }
                    //获取多媒体知识类型
                    $(this).find(".selectMeSS").find("span").each(function () {
                        relaArray.push($(this).attr("relaid"));
                    })
                    if (relaArray.length != 0) {
                        jsonO["cntt"] = relaArray.join(',');
                    }

                    //获取关系系列类型
                    $(this).find(".selectTdSS").find("span").each(function () {
                        relSerialArray.push($(this).attr("relaid"));
                    })
                    //此处是否需要改下获取数据的属性 cntt？
                    if (relSerialArray.length != 0) {
                        jsonO["cntt"] = relSerialArray.join(',');
                    }

                    $(this).find("select").each(function () {
                        if ($(this).val()) {
                            jsonO[$(this).attr("name")] = $(this).val();
                        }
                    })
                    //原子中附件选择
                    atomArray.push(jsonO);
                }
            });
            var component = {};
            component["radio"] = {};
            component["checkbox"] = {};
            component["editor"] = {};
            for (var i in radioGroup) {
                var value = $("#"+radioGroup[i]).find("input[type=radio]:checked").val();
                if (value != "") {
                    component["radio"][i] = value;
                }
            }
            for (var i in checkboxGroup) {
                var value ='';
                $("#"+checkboxGroup[i]).find("input[type=checkbox]:checked").each(function () {
                    value += "," + $(this).val();
                })

                if (value != "") {
                    component["checkbox"][i] = value.substring(1);
                }
            }
            //增加初始化的richMap内容
            for (var i in richMap) {
                component["editor"][i] = richMap[i];
            }

            for (var i in editorGroup) {
                var edContent = editorGroup[i];
                if ($('#rich' + i).hasClass('f-lk-richtext2')) {
                    component["editor"][i] = edContent;
                } else {
                    component["editor"][i] = "";
                }
            }

            klgData["component"] = component;
            if ($("#regnIdContiner").find("input[name=regnId]").val() == regnTreeData.value) {
                klgData["exception"] = exceptionTemp;
            }
            klgData["annotation"] = annotationTemp;
            klgData["sourceFileData"] = strongAssosationTemp;
            return JSON.stringify({"klgData": klgData, "atomArray": atomArray});
        }

        var setAddSimEditFlag = function (flag, titleType) {
            titleTypeCode = titleType;
            addSimEditFlag = flag;
        };

        return {
            initByKlgId:initByKlgId,
            initByTmpltId:initByTmpltId,
            getklgData:getklgData,
            setAddSimPusFlag: setAddSimPusFlag,
            setBatchFlag: setbatchFlag,
            setAcceptPrePubFlag:setAcceptPrePubFlag,
            setAddSimEditFlag: setAddSimEditFlag,
            tmpltChanges: tmpltChanges
        }
    })