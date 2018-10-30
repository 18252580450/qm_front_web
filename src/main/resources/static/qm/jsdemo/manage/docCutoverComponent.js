define([
        "jquery","loading", 'util','hdb','easyui','ztree-exedit','transfer',
        'js/manage/editorDialog',
        'text!html/manage/docCutover.tpl',
        //"js/manage/tabLig",
        'js/manage/typeOptionalGener'],

    function(
        $,Loading, Util, Hdb, easyui,ztree,Transfer,
        EditorDialog,
        docCutover,
        //tabLig,
        TypeOptionGen) {
        var templt_chnl_cd = 'NGKM.TEMPLET.CHNL';   //渠道编码
        var sourceData = null;
        //var groupData = null;
        var tmpltId = null;
        var knwlgInfo = null;
        var fileInfo = null;
        var knwlgAttrsInfo = null;
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
        var knwlgGathrType = null;//知识类型
        var exception = {};
        //用于存放本次修改所修改的例外内容
        var exceptionTemp = {};
        var allAttrs = null;
        var gathCommt = null;
        var annotation = {};
        //用于存放本次修改所修改的注解内容
        var annotationTemp = {};
        var acceptPrePubFlag = false;
        var componentGroup;
        var timePeriodUnit;
        var memUnit;
        var priceTimeUnit;
        var time_wkunit_cd = 'NGKM.ATOM.PARAM.TIMES.WKUNIT';//时间单位
        var ram_wkunit_cd = 'NGKM.ATOM.PARAM.RAMTYPE.WKUNIT';//内存单位
        var priceOrTime_wkunit_cd = 'NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT';//价格/时间单位
        var changeFlag;
        var mediaList ={};
        var maxLevel = 3;

        var getcovData = function(codeTypeCd){  //获取数据字典的数据
            var result = {};
            var covData = {
                url:Util.constants.CONTEXT+'/kc/configservice/kmConfig/getSysBytypeCd?typeId='+codeTypeCd,
                async: false,
                success:function(data){
                    var list  = data.RSP.DATA;
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].value !== null && list[i].name !== null) {
                            result[list[i].value] = list[i].name;
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

        var getCatlNm = function (catlId) {
            var catlNm = "";
            Util.ajax.getJson( Util.constants.CONTEXT + "/kc/configservice/kmTree/querysinglebycatlid?catlId="+catlId, function (result) {
                if(result.RSP.DATA){
                    catlNm = result.RSP.DATA[0].CATLNM;
                }
            },true);
            return catlNm;
        }

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
            url:  Util.constants.CONTEXT+ "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_TYPE + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                atomType = Transfer.Combobox.transfer(data);
            }
        });


        //初始化渠道下拉框
        function initChannel() {
            $("#klgData").find('input[name="knwlgChnlCode"]').combotree({
                url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + templt_chnl_cd,
                multiple: true,         //可多选
                editable: false,
                panelHeight: 'auto',
                loadFilter: function (result) {
                    var chnlCodeArray = [];
                    for (var i = 0; i < result.RSP.DATA.length; i++) {
                        var chnlCode = {};
                        chnlCode.text = (result.RSP.DATA[i]).DATANAME;
                        chnlCode.id = (result.RSP.DATA[i]).DATAVALUE;
                        chnlCodeArray.push(chnlCode);
                    }
                    return chnlCodeArray;           //过滤数据
                }
            });
        }


        //取时间单位
        Util.ajax.ajax({
            type: "GET",
            url:  Util.constants.CONTEXT + "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_TIMES_WKUNIT + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                timePeriodUnit = Transfer.Combobox.transfer(data);
            }
        });

        //内存单位
        Util.ajax.ajax({
            type: "GET",
            url:  Util.constants.CONTEXT + "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_RAMTYPE_WKUNIT + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                memUnit = Transfer.Combobox.transfer(data);
            }
        });

        //价格、时间类型单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + Util.constants.NGKM_ATOM_PARAM_PRICEORTIMETYPE_WKUNIT + '&v=' + new Date().getTime(),
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
                    if(atomType[i].DATAVALUE == typeCd){
                        typeName = atomType[i].DATANAME;
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
                        if($(this).val()==atomType[i].DATAVALUE){
                            //找到对应的字典，展示名称
                            $(this).html(atomType[i].DATANAME);
                            //选中默认的数据类型
                            if($(this).val()==dataTypeValue){
                                $(this).attr("selected","selected");
                            }
                        }
                    }
                });
            })
        }

        var eventInit = function(){


            //调用初始化渠道下拉框方法
            initChannel();

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
                window.open(+'/src/modules/knowledgeManage/selectGis.html','','height=500, width=900, top='+iTop+',left='+iLeft+',resizable=yes,status=no,location=no,toolbar=no,scrollbars=no');
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
                                '/kc/configservice/file/download?key=NGKM_FILE_ATTACH&fileId=' + this.baseName + '" type="audio/mp3" />' +
                                '</audio>';
                        }
                        if (this.baseName.indexOf(".jpg") != -1) {
                            html += '<img src="' + window.location.protocol + '//' + window.location.host + Util.constants.CONTEXT +
                                '/kc/configservice/file/download?key=NGKM_PICTURE_FILE&fileId=' + this.baseName + '" alt="' + this.orgName + '">';
                        } else {
                            html += '<img class="ke-flash" src="' +  + '/src/assets/lib/kindeditor/themes/common/blank.gif" ' +
                                'data-ke-src="' +  + '/src/assets/lib/kindeditor/themes/common/blank.gif" ' +
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

            //富文本框处理
            $(".richTextButton").click(function () {
                var atomId = $(this).attr("atomid");
                var content = $("#inputRich"+atomId).val();
                EditorDialog.showEditor(content,atomId,editorGroup);

            });

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

        };

        //标识, 包括批量和添加相似
        var flag = {batchFlag: false};

        //根据模板ID和割接知识ID初始化页面
        var initByTmpltIdAndKnwlgId = function(el,tmpletId,knwlgeId,knwlgGathrTypeCd,fcallback) {
            if(tmpletId==null||knwlgeId==null)
            {
                alert("知识或模板不存在！");
                return;
            }
            tmpltId = tmpletId;
            knwlgId = knwlgeId;
            getTemplateRequest(el,tmpltId,knwlgGathrTypeCd,fcallback);
            initKnlwgInfo(knwlgId);
            initKnlwgAttrsInfo(knwlgId);
        };
        //获取页面数据
        var getklgData = function () {
            var klgData = {}
            //选择渠道
            klgData["chnlCode"] = $("#knwlgChnlCode").combotree("getValue");
            //获取公共属性
            $(".docPublicData").each(function () {
                klgData[$(this).attr("name")] = $(this).val();
                if ($(this).attr("name") == "respPrsnId") {
                    if ($(this).attr("data")) {
                        klgData[$(this).attr("name")] = $(this).attr("data");
                    }
                }
            });


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
            return JSON.stringify({"klgData": klgData, "atomArray": atomArray});
        }
        //一键复制文本类型值
        var copyStrTypeValue = function () {
            $(".oldDataAttr").find(".cnttTextBox").each(function () {
                if($(this).text()!="")
                    var text = $(this).text();
                    var srcAttrAtomId = $(this).attr("id");
                    $("textarea#cntt"+srcAttrAtomId).val(text);

            })

        }

        var initRigthPanel = function(knwlgId){
            $('#rightPanelFrame').attr('src',Util.constants.CONTEXT + "/kc/configservice/fileClass/getSourceFileByKnwlgId?knwlgId="+knwlgId);
        }


        //获取模板信息铺出页面
        var getTemplateRequest = function (el,tmpltId,knwlgGathrTypeCd,fcallback) {
            Util.ajax.getJson( Util.constants.CONTEXT + "/kc/configservice/knowledgemgmt/template/" + tmpltId, {}, function (result) {
                if (result.RSP && result.RSP.DATA) {
                    if (result.RSP.DATA.length > 0) {
                        var templateData = result.RSP.DATA[0];
                        dataTypeCheckData = templateData["dataTypeCheckData"];

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
                        var template = Hdb.compile(docCutover);
                        templateData.batchFlag = flag.batchFlag;
                        var levelGroup = buildGroupsLevel(templateData.groups);
                        templateData.groups = levelGroup;
                        templateData["timePeriodUnit"] = timePeriodUnit;
                        templateData["memUnit"] = memUnit;
                        templateData["priceTimeUnit"] = priceTimeUnit;

                        var allResult = template(templateData);                                                         //通过tpl拼接的html页面

                        el.append(allResult);
                        initEasyUi();
                        gathCommt = templateData.gathCommt;

                        chnlCodeSelectInit();
                        eventInit();
                        $(".left-content").trigger("scroll");
                        $(".right-content").trigger("scroll");
                        renderDataType();
                        getGroupNm();
                        regnTreeInit();
                        fcallback();
                        initComponents();
                        tableStyleForIE8();
                        knwlgAlsPlho();
                    }
                }
            }, true);
        }
        //获取割接知识信息并回显
        var initKnlwgInfo = function (knwlgId) {
            Util.ajax.getJson( Util.constants.CONTEXT+ "/kc/configservice/kcknlwgcutover/doccutover",{knwlgId:knwlgId},function (data) {
                if(data.RSP.RSP_CODE=="1"){
                    knwlgInfo = data.RSP.DATA[0];
                }else{
                    $.messager.alert(data.RSP.RSP_DESC);
                }
            },true);
            Util.ajax.getJson( Util.constants.CONTEXT+ "/kc/configservice/kcknlwgcutover/doccutoverfile",{knwlgId:knwlgId},function (data) {
                if(data.RSP.RSP_CODE=="1"){
                    fileInfo = data.RSP.DATA[0];
                }else{
                    $.messager.alert(data.RSP.RSP_DESC);
                }
            },true);
            //回显
            //知识名称
            if(knwlgInfo.KNWLGNM != undefined){
                $("input[name='knwlgNm']").val(knwlgInfo.KNWLGNM);
            }
            //知识生效时间
            if(knwlgInfo.KNWLGEFFTIME != undefined){
                $("#knwlgEffTime").datetimebox('setValue', knwlgInfo.KNWLGEFFTIME);
            }
            //知识失效时间
            if(knwlgInfo.KNWLGINVLDTIME != undefined){
                $("#knwlgInvldTime").datetimebox('setValue', knwlgInfo.KNWLGINVLDTIME    );
            }
            //知识渠道
            if(fileInfo.RSRVSTR2 != undefined ){
                var chnlCodes = fileInfo.RSRVSTR2.split(",");
                $("#knwlgChnlCode").combotree("setValues",chnlCodes);
            }
            //知识地区
            if(fileInfo.RSRVSTR3 !=undefined){
                $("input[name='regnId']").val(fileInfo.RSRVSTR3);
                $("#authRegnList").combotree("setValue",fileInfo.RSRVSTR3);
            }
            //知识路径
            if(fileInfo.NOTEPATH !=undefined){
                $("input[name='pathName']").val(getCatlNm(fileInfo.NOTEPATH));
                $("input[name='path']").val(fileInfo.NOTEPATH);
            }


        }
        //获取割接知识的原子信息并回显
        var initKnlwgAttrsInfo = function (knwlgId) {
            Util.ajax.getJson( Util.constants.CONTEXT+ "/kc/configservice/kcknlwgcutover/docattrscutover",{knwlgId:knwlgId},function (data) {
                if(data.RSP.RSP_CODE=="1"){
                    knwlgAttrsInfo = data.RSP.DATA;
                }else{
                    $.messager.alert(data.RSP.RSP_DESC);
                }
            },true);
            for(var i=0;i<knwlgAttrsInfo.length;i++){
                    $(".oldDataAttr").find(".cnttTextBox").each(function () {
                        if($(this).attr("name") == knwlgAttrsInfo[i].PARANM){
                            $(this).text(knwlgAttrsInfo[i].CNTT);
                        }
                    });

            }
            $(".cnttTextBox").attr("disabled",true);
        }
        //根据工作组code 获取工作组名称
        var getGroupNm = function(){
            var groupCodes = $("#brwsPriv").val();
            if (!groupCodes) {
                return;
            }
            Util.ajax.postJson( Util.constants.CONTEXT+ "/kc/configservice/kmGroup/getWorkGroupInfoByCode", {groupCodes: groupCodes}, function (data) {
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


        var initComponents = function () {
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
                $("#cntt" + atomId).append("<input type='text' class='easyui-datetimebox' name='cntt' style='width:100%;height:30px'>");
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({editable:false});
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
                if(atomType[i].DATAVALUE == typeCd){
                    typeName = atomType[i].DATANAME;
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
                        url:Util.constants.CONTEXT +'/kc/configservice/kmConfig/getTKmDistrictConfigByRegnId',
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



        var initEasyUi = function () {
            $("#klgData").find("input.easyui-datetimebox").datetimebox({editable:false});
            $("#klgData").find("input.easyui-textbox").textbox();
        }

        var regnTreeInit = function () {
            $("#authRegnList").combotree({
                url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getRootById?v=" + new Date().getTime(),
                multiple: false,         //不可多选
                editable: false,
                method: "GET",
                // otherParam:{"catalogId":id},
                panelHeight: '200',
                loadFilter: function (datas) {
                    var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                    var treeJson = [];
                    if (data && data.length > 0 > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var json = {};
                            json.id = data[i].id;
                            json.text = data[i].name;
                            if (data[i].isParent) {
                                json.state = 'closed';
                            }
                            treeJson.push(json);
                        }
                    }
                    return treeJson;
                },
                onBeforeExpand: function () {    // 下拉树异步
                    $(this).tree('options').url = Util.constants.CONTEXT + "/kc/configservice/kmconfig/getDistrictBySuprRegnId?maxLevel=" + maxLevel;

                }
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
                            if (chnlIds[i] == allChnlCodes[j].DATAVALUE) {
                                chnlName = chnlName + allChnlCodes[j].DATANAME + ",";
                                chnlId = chnlId + allChnlCodes[j].DATAVALUE + ",";
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


        return {
            initByTmpltIdAndKnwlgId:initByTmpltIdAndKnwlgId,
            getklgData:getklgData,
            copyStrTypeValue:copyStrTypeValue,
            initRigthPanel:initRigthPanel
        }
    })