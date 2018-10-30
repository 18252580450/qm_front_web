require(["jquery", "loading", 'util','hdb', "easyui", 'ztree-exedit',
        'js/manage/formatter', "templateManage", 'text!html/manage/docEdit.tpl'],
    function ($, Loading, Util, Hdb, easyui, ztree, Formatter, TemplateManage,docEdit) {
        var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';  //原子类型数据字典编码
        var templt_chnl_cd = 'NGKM.TEMPLET.CHNL';   //模板渠道编码
        var currentSelectNode;                  //当前选中工作组
        var zTreeObj;                           //工作组树
        var atomResultArr;
        var groupsAndKeysMap = {};
        var $knowledgeFrom;
        var knwlgGathrTypeCd; //知识类型： 1普通知识，2预采编知识
        var tmpltId; //模板id
        var timePeriodUnit;
        var memUnit;
        var priceTimeUnit;
        var time_wkunit_cd = 'NGKM.ATOM.PARAM.TIMES.WKUNIT';//时间单位
        var ram_wkunit_cd = 'NGKM.ATOM.PARAM.RAMTYPE.WKUNIT';//内存单位
        var priceOrTime_wkunit_cd = 'NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT';//价格/时间单位
        var allAttrs;
        var templateInfo;
        var dataTypeCheckData;
        var acceptPrePubFlag;

        var radioGroup;
        var checkboxGroup;
        var tmpltChangeFlag = false;
        var batchUpdate;
        var knwlgId;
        var addSim;
        var addSimPub;
        var viewBtnClick = false;//预览按钮是否被点击
        var saveFlag = false;//保存记录
        var richMap;
        var editorGroup;
        var regnTreeData = null;
        var annotationTemp = {};
        var strongAssosationTemp = {};
        var exceptionTemp = {};

        //取时间单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + time_wkunit_cd + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                timePeriodUnit = data.RSP.DATA;
            }
        });

        //内存单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + ram_wkunit_cd + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                memUnit = data.RSP.DATA;
            }
        });

        //价格、时间类型单位
        Util.ajax.ajax({
            type: "GET",
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + priceOrTime_wkunit_cd + '&v=' + new Date().getTime(),
            async: false,
            success: function (data) {
                priceTimeUnit = data.RSP.DATA;
            }
        });

        //初始化
        initialize();
//knwlgGathrTypeCd,tmpltId
        function initialize() {
            tmpltId = "1507";
            templateInfo = getTemplateInfo(tmpltId);
            var levelGroup;
            if (templateInfo){
                if (templateInfo.groups) {
                    levelGroup = buildGroupsLevel(templateInfo.groups);
                }
                templateInfo["timePeriodUnit"] = timePeriodUnit;
                templateInfo["memUnit"] = memUnit;
                templateInfo["priceTimeUnit"] = priceTimeUnit;
                dataTypeCheckData = templateInfo.dataTypeCheckData;
                acceptPrePubFlag = templateInfo.acceptPrePubFlag;
            }

            // regnTreeInit();
            // pathTreeInit();
            // urdfTabsInit();
            addLayout();       //页面布局
            $(document).find("#addKnowledgeLayout").layout();
            addknowledgeForm();
            addTree();
            addDataGrid(levelGroup);
            addBtnsForm();
            initTempltInfoForm();
            initMenuTree();             //初始化工作组树
            initGrid(levelGroup); //初始化原子列表
            renderDataType();
            initknowledgeForm();
            initGlobalEvent();          //初始化全局事件
        }

        function renderDataType() {
            $(".paraTypeCdSpan").each(function () {
                var typeCd = $(this).siblings("input[name='paraTypeCd']").val();
                var typeName = null;
                for (var i in atomResultArr) {
                    if (atomResultArr[i].value == typeCd) {
                        typeName = atomType[i].name;
                    }
                }
                if (typeName == null) {
                    typeName = "未知原子类型";
                }
                $(this).html("<span class=\"f-text\">" + typeName + "</span>");
            })
            $(".typeOptnlSelect").each(function () {
                var dataTypeValue = $(this).attr("value");
                $(this).children("option").each(function () {
                    for (var i in atomResultArr) {
                        if ($(this).val() == atomType[i].value) {
                            //找到对应的字典，展示名称
                            $(this).html(atomType[i].name);
                            //选中默认的数据类型
                            if ($(this).val() == dataTypeValue) {
                                $(this).attr("selected", "selected");
                            }
                        }
                    }
                });
            })
            // $(".radioContiner").each(function () {
            //     var atomId = $(this).attr("atomid");
            //     radioGenerate(atomId);
            // })
            //
            // $(".checkBoxContiner").each(function () {
            //     var atomId = $(this).attr("atomid");
            //     checkBoxGenerate(atomId);
            // });
        }

        var radioGenerate = function (atomId) {
            initRadio(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Constants.NGKM_ATOM_DATA_TYPE_RADIO) {
                    radioGroup[atomId].set(allAttrs[atomId]["cntt"]);
                }
            }

            radioGroup[atomId].on("change", function () {
                if (!radioGroup[atomId].get() && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
        }

        var checkBoxGenerate = function (atomId) {
            initCheckBox(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Constants.NGKM_ATOM_DATA_TYPE_CHECK) {
                    if (checkboxGroup[atomId]) {
                        checkboxGroup[atomId].set(allAttrs[atomId]["cntt"]);
                    }
                }
            }

            if (checkboxGroup[atomId]) {
                checkboxGroup[atomId].on("change", function () {
                    if (!checkboxGroup[atomId].get() && isHasexce(atomId)) {
                        showMessage();
                    }
                });
            }
            showExceBtn();
        }

        /**
         * 显示例外按钮
         */
        var showExceBtn = function (atomId) {
            var excepBtn = $("#exce" + atomId);
            if (excepBtn.length > 0) {
                excepBtn.show();
                excepBtn.prev().show();
            }
        };

        var showMessage = function () {
            $.messager.tips("由于您清空了原子内容，该原子的例外和注解最终将不会被保存");
        };

        var isHasexce = function (atomId) {
            return $("#" + atomId).last().find(".link-red").length === 0 ? false : true;
        };

        var initCheckBox = function (atomId) {
            var checkBoxCnttHtml = '';
            var option = dataTypeCheckData["typeOptnl"][atomId][Constants.NGKM_ATOM_DATA_TYPE_CHECK]["optVal"];
            if (option && option.length > 0) {
                for (var i = 0; i < option.length; i++) {
                    checkBoxCnttHtml += '<div class="formControls col-3">' +
                        '<input  type="checkbox"   id ="' + atomId + option[i].value + "checkBox" + '"/>必填项</div>';
                }
            }
            $("#cntt" + atomId).append(checkboxGroup);


            checkboxGroup[atomId] = checkboxGroup;
            if (acceptPrePubFlag) {
                //checkboxes.disabled();
            }
        }

        var initRadio = function (atomId) {
            var radioCnttHtml = '';
            var option = dataTypeCheckData["typeOptnl"][atomId][Constants.NGKM_ATOM_DATA_TYPE_RADIO]["optVal"];
            if (option && option.length > 0) {
                for (var i = 0; i < option.length; i++) {
                    radioCnttHtml += '<div class="par-set formControls">' +
                        '<input type="radio" id="' + option[i].value + atomId + 'radio"><label >' + option[i].name + '</label>' +
                        '</div>';
                }
            }
            $("#cntt" + atomId).append(radioCnttHtml);


            radioGroup[atomId] = radioCnttHtml;
            if (acceptPrePubFlag) {
                //radios.disabled();
            }
        }

        function getTemplateInfo(tmpltId) {
            var templateInfo;
            Util.ajax.getJson(Util.constants.CONTEXT + "/knowledgemgmt/template/" + tmpltId, {}, function (result) {
                if (result.RSP && result.RSP.DATA) {
                    if (result.RSP.DATA.length > 0) {
                        templateInfo = result.RSP.DATA[0];
                    }
                }
            }, true);
            return templateInfo;
        }

        //构造分组层级序列
        function buildGroupsLevel(groups) {
            var secLevel = [];
            var baseLevel = [];
            $(groups).each(function (index) {
                if (this.suprGrpngId != "0" && this.suprGrpngId) {
                    secLevel.push(this);
                } else {
                    baseLevel.push(this);
                }
            });

            //遍历二级分组 加到对应的一级分组下
            for (var i = 0; i < secLevel.length; i++) {
                for (var j = 0; j < baseLevel.length; j++) {
                    if (baseLevel[j].grpngId == secLevel[i].suprGrpngId) {
                        if (!baseLevel[j].childGroup) {
                            baseLevel[j].childGroup = [];
                        }
                        baseLevel[j].childGroup.push(secLevel[i]);
                        break;
                    }
                }
            }

            //将构造好的层级结构分别展示出来
            secLevel = [];
            for (var i = 0; i < baseLevel.length; i++) {
                secLevel.push(baseLevel[i]);
                if (baseLevel[i].childGroup) {
                    for (var j = 0; j < baseLevel[i].childGroup.length; j++) {
                        secLevel.push(baseLevel[i].childGroup[j]);
                    }
                }
            }

            return secLevel;
        };

        function addLayout() {
            $([
                "<div region = 'north' title = '模板：A模板审核测试模板'  id='knowledgeFrom' style = 'width:100%;height: 35%;border:none' >",
                "</div>",
                "<div region = 'west' id = 'templtTree'  split = 'true'  style = 'width:20%;height: 70%;' >",
                "</div>",
                "<div  region='center' id = 'knowlDataGridArea'style='padding:5px;width:100%;height: 70%'>",
                "</div>",
                "<div region = 'south' id = 'bottomBtnsForm'  split = 'true' style = 'width:100%;height: 8%;border:none' >",
                "</div>",
            ].join("")).appendTo($("#addKnowledgeLayout"));
        }

        function addknowledgeForm() {
            $knowledgeFrom = $([
                "<div class='panel-search'>",
                "<form class='form form-horizontal' id='knowledgeForm' >",
                "<div class='row cl'>",
                "<label class='form-label col-2'>知识标题<span style='color:#ff1323;padding-left:2px'>*</span></label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='knwlgNm' id='knwlgNm' style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识地区</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combotree' name='regnIdContiner' id='regnIdContiner' style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>责任编辑</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='respPrsnId' id='respPrsnId' style='width:100%;height:30px' >",
                "</div>",
                "</div>",
                "<div class='row cl'>",
                "<label class='form-label col-2'>知识路径<span style='color:#ff1323;padding-left:2px'>*</span></label>",
                "<div class='formControls col-2' id='pathContiner'>",
                "<input type='text' class='easyui-combotree' name='pathName' id='pathName' style='width:70%;height:30px' >",
                "<input class='docPublicData'  name='path' type='hidden' disabled='disabled' id='path'>",
                <!-- 右侧有链接操作 -->
                "<a class='t-btn t-btn-sm' href='javascript:void(0)' id='knowledgePathBtn'>选择</a>",
                "</div>",
                "<label class='form-label col-2'>公告接受群组</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combotree' name='anoceRcvGrpShow' id ='anoceRcvGrpShow' style='width:70%;height:30px' >",
                "<input class='docPublicData'  name='anoceRcvGrp' type='hidden' disabled='disabled' id='anoceRcvGrp'>",
                <!-- 右侧有链接操作 -->
                "<a class='t-btn t-btn-sm' href='javascript:void(0)' id='anoceRcvGrpBtn'>选择</a>",
                "</div>",
                "<label class='form-label col-2'>知识渠道</label>",
                "<div class='formControls col-2' id='chnlContiner'>",
                "<input type='text' class='easyui-combotree' name='knwlgChnlCode' id='knwlgChnlCode' data-options=\"prompt: '请选择模板渠道'\" style='width:100%;height:30px' >",
                "<input class='docPublicData'  name='knwlgChnl' type='hidden' disabled='disabled' id='chnlCode'>",
                "</div>",
                "</div>",
                "<div class='row cl'>",
                "<label class='form-label col-2'>知识生效时间</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-datetimebox' name='knwlgEffTimeDiv' id='knwlgEffTimeDiv' style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识失效时间</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-datetimebox' name='knwlgInvldTimeDiv' id ='knwlgInvldTimeDiv' style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识别名</span></label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='knwlgAls'  id ='knwlgAls' style='width:100%;height:30px' >",
                "</div>",
                "</div>",
                "<div class='row cl'>",
                "<label class='form-label col-2'>自定义页签</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='urdfTabsHidden' id='urdfTabsHidden' style='width:100%;height:30px' >",
                "</div>",
                "</div>",
                "</form>",
                "<div id='channelWindow'></div>",
                "</div>",
                "</div>",
            ].join("")).appendTo($("#knowledgeFrom"));
        }

        function initknowledgeForm() {
            $knowledgeFrom.find("input.easyui-datetimebox").datetimebox();
            $knowledgeFrom.find("input.easyui-textbox").textbox();
            $knowledgeFrom.find("input.easyui-datetimebox").datetimebox({
                editable: false
            });

            // $knowledgeFrom.find('input.easyui-combobox[name="knwlgGathrTypeCd"]').combobox({
            //     url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + knwlgGathrType_Name,
            //     method: "GET",
            //     valueField: 'CODEVALUE',
            //     textField: 'CODENAME',
            //     panelHeight:'auto',
            //     editable:false,
            //     missingMessage: '请选择优先级',
            //     loadFilter:	function(data){
            //         return Transfer.Combobox.transfer(data);
            //     }
            // });
            //
            // $knowledgeFrom.find('input[name="tmpltId"]').combobox({
            //     url: Util.constants.CONTEXT + "/templetInfo/getAllTmpltInfo",
            //     method: "GET",
            //     // data: CRM.getEnumArr("PLATFORM_ACCOUNT_STATE@CS_IR"),
            //     valueField: 'TMPLTID',
            //     textField: 'TMPLTNM',
            //     panelHeight:'auto',
            //     editable:false,
            //     loadFilter:	function(data){
            //         return Transfer.Combobox.transfer(data);
            //     }
            // });
            // $knowledgeFrom.find('input[name="chnlCode"]').combobox({
            //     url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + chnlCode_Name,
            //     method: "GET",
            //     // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            //     valueField: 'CODEVALUE',
            //     textField: 'CODENAME',
            //     panelHeight:'auto',
            //     editable:false,
            //     loadFilter:	function(data){
            //         return Transfer.Combobox.transfer(data);
            //     }
            // });
            // $knowledgeFrom.find('input[name="regnId"]').combotree({
            //     url: '../../data/tree_data1.json',
            //     method: "GET",
            //     textField: 'text',
            //     panelHeight:'auto',
            //     editable:false,
            //     onBeforeExpand: function (node, param) {    // 下拉树异步
            //         console.log("onBeforeExpand - node: " + node + " param: " + param);
            //         var id = node.domId;
            //         $('#' + id).combotree('tree').tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            //     }
            // });
            // $knowledgeFrom.find('input[name="catlId"]').combotree({
            //     url: '../../data/tree_data1.json',
            //     method: "GET",
            //     textField: 'text',
            //     panelHeight:'auto',
            //     editable:false,
            //     onBeforeExpand: function (node, param) {    // 下拉树异步
            //         console.log("onBeforeExpand - node: " + node + " param: " + param);
            //         $('#combotree-test').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            //     }
            // });
        }

        function addTree() {
            $([
                "<div class='ke-panel-content clear-overlap'>",
                "<div style='padding-left:22px;padding-top:20px;height:15px;' id='publicAttribute'>",
                "<p style='cursor:pointer;'>公共属性</p>",
                "</div>",
                "</div>",

                "<div id='groupsTree' style='height:100%;width:100%;overflow: auto;' class='ztree'>",
                "</div>",
            ].join("")).appendTo($("#templtTree"));
        }

        function addDataGrid(levelGroup) {
            $([
                "<div class='easyui-layout' data-options='' style='width: 100%; height: 100%;'>",
                "<div class='panel-tool-box cl' id='atomTables'>",
                "</div>",
                "</div>",
            ].join("")).appendTo($("#knowlDataGridArea"));

            if (levelGroup && levelGroup.length > 0) {
                for (var i = 0; i < levelGroup.length; i++) {
                    var height = 36 + levelGroup[i].attr.length * 35;
                    $([
                        "<div class='fl text-bold'>" + levelGroup[i].grpngNm + "</div>",
                        "<div id= 'atomManage' data-options=\"region:'cente'\" title='' class='panel-body panel-body-noheader layout-body'style='width: 100%; height: " + height + "px;'>",
                        "<table id='atomTable" + levelGroup[i].grpngId + "' class='easyui-datagrid' >" +
                        "</table>",
                        "</div>",
                    ].join("")).appendTo($("#atomTables"));
                }
            }
        }

        function addBtnsForm() {
            $([
                "<div class='mt-10 test-c'>",
                "<label class='form-label col-5'></label>",
                "<a href='javascript:void(0)' id='commitButton' class='btn btn-green radius  mt-l-20'  >提交</a>",
                "<a href='javascript:void(0)' id='saveButton' class='btn btn-green radius  mt-l-20'  >保存</a>",
                "<a href='javascript:void(0)' id='viewButton' class='btn btn-green radius  mt-l-20'  >预览</a>",
                "<a href='javascript:void(0)' id='cancleBtn' class='btn btn-secondary radius  mt-l-20' >取消</a>",
                "</div>",
            ].join("")).appendTo($("#bottomBtnsForm"));
        }

        function initTempltInfoForm() {
            //初始化渠道
            $('#chnlCode').combotree({
                url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + templt_chnl_cd,
                multiple: true,         //可多选
                editable: false,
                panelHeight: 'auto',
                loadFilter: function (result) {
                    var chnlCodeArray = [];
                    for (var i = 0; i < (result.RSP.DATA).length; i++) {
                        var chnlCode = {};
                        chnlCode.text = (result.RSP.DATA)[i].CODENAME;
                        chnlCode.id = (result.RSP.DATA)[i].CODEVALUE;
                        chnlCodeArray.push(chnlCode);
                    }
                    return chnlCodeArray;           //过滤数据
                }
            });

            //初始化适用地区
            $('#authRegnList').combotree({
                url: '../../data/tree_regn.json',
                value: "适用地区",
                method: "GET",
                multiple: true,         //可多选
                editable: false,
                panelHeight: 'auto'
            });

            //初始化路径树
            $('#catlId').combotree({
                url: Util.constants.CONTEXT + "/templetCatalog/getAllTemplateCatalogs?catalogId=" + 1,
                multiple: false,         //不可多选
                editable: false,
                method: "GET",
                // otherParam:{"catalogId":id},
                panelHeight: 'auto',
                loadFilter: function (result) {
                    var catlArray = [];
                    for (var i = 0; i < (result.RSP.DATA).length; i++) {
                        var catl = {};
                        catl.text = (result.RSP.DATA)[i].CATLNM;
                        catl.id = (result.RSP.DATA)[i].CATLID;
                        catl.isParent = (result.RSP.DATA)[i].parent;
                        catlArray.push(catl);
                    }
                    return catlArray;           //过滤数据
                }
            });
        }

        function initMenuTree() {
            var setting = {
                async: {
                    dataType: "json",
                    type: "GET",
                    enable: true,
                    url: Util.constants.CONTEXT + "/tmpltDetail/queryTmpltGroups",
                    autoParam: ["grpngId", "tmpltId"],                       //传递的参数
                    dataFilter: filter
                },
                callback: {
                    onClick: zTreeOnClick,
                    onRename: nameValidator
                }
            };

            //添加点击函数
            function zTreeOnClick(event, treeId, treeNode) {
                currentSelectNode = zTreeObj.getSelectedNodes()[0];
                updateOperateStatus(treeNode);
                $("#atomTable").datagrid("load");
            };

            //对数据进行筛选处理显示
            function filter(treeId, parentNode, childNodes) {
                if (!childNodes) {
                    return null;
                }
                childNodes = childNodes['rows'];
                if (childNodes) {
                    for (var i = 0, l = childNodes.length; i < l; i++) {
                        childNodes[i].name = childNodes[i].grpngNm.replace(/\.n/g, '.');
                        childNodes[i].isParent = childNodes[i].hasChildren;
                    }
                }
                return childNodes;
            }

            var newNode = {name: "模板分组", grpngId: 0, tmpltId: '8196'};

            $(document).ready(function () {
                zTreeObj = $.fn.zTree.init($("#groupsTree"), setting, newNode);
                zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);
            });
        }

        function initGrid(levelGroup) {
            atomResultArr = Formatter.getSysCode(para_type_cd);     //获取原子类型数组
            if (levelGroup && levelGroup.length > 0) {
                for (var i = 0; i < levelGroup.length; i++) {
                    var height = levelGroup[i].attr.length * 35 + 36;
                    $("#atomTable" + levelGroup[i].grpngId).datagrid({
                        columns: [[
                            {
                                field: 'atomId', title: '原子Id', hidden: true,
                                formatter: function (value, row, index) {
                                    var value = "<input type='hidden' value='" + row.paraNm + "' name='paraNm'/>" +
                                        "<input type='hidden' value='" + levelGroup[i].grpngId + "' name='srcTmpltGrpngId'/>" +
                                        "<input type='hidden' value='" + row.atomId + "' name='srcTmpltAttrAtomId'/>" +
                                        "<input type='hidden' value='" + levelGroup[i].suprGrpngId + "' name='srcSuprGrpngId'/>" +
                                        "<input type='hidden' value='" + levelGroup[i].grpngNm + "' name='grpngNm'/>" +
                                        "<input type='hidden' value='" + levelGroup[i].grpngTypeCd + "' name='srcGrpngTypeCd'/>" +
                                        "<input type='hidden' name='requiredFlag' value='" + row.requiredFlag + "'/>";
                                    var docKeyAtomId;
                                    var docKeyGrpngId;
                                    var docKeySuprGrpngId;
                                    if (templateInfo.addSimPusFlag || templateInfo.addSimEditFlag) {
                                        docKeyAtomId = "";
                                        docKeyGrpngId = "";
                                        docKeySuprGrpngId = "";
                                    } else {
                                        if (templateInfo.docKey) {
                                            docKeyAtomId = templateInfo.docKey.knwlgAttrAtomId;
                                            docKeyGrpngId = templateInfo.docKey.grpngId;
                                            docKeySuprGrpngId = templateInfo.docKey.suprGrpngId;
                                        }
                                    }
                                    value += "<input type='hidden' name='knwlgAttrAtomId' value='" + docKeyAtomId + "'/>" +
                                        "<input type='hidden' name='grpngId' value='" + docKeyGrpngId + "'/>" +
                                        "<input type='hidden' name='suprGrpngId' value='" + docKeySuprGrpngId + "'/>" +
                                        "<input type='hidden' name = 'rmk' value='" + row.rmk + "'/>" +
                                        "<input type='hidden' name = 'srcCode' value='" + row.srcCode + "'/>" +
                                        "<input type='hidden' name = 'groupRmk' value='" + row.groupRmk + "'/>" +
                                        "<input type='hidden' name = 'groupSrcCode' value='" + row.groupSrcCode + "'/>" +
                                        "<input type='hidden' name = 'sendSmsFlag' value='" + row.sendSmsFlag + "'/>";
                                    return value;
                                }
                            },
                            {
                                field: 'paraNm', title: '原子名称', width: '15%',
                                formatter: function (value, row, index) {
                                    if (row.requiredFlag == '1') {
                                        return value + "<font color='red'>*</font>";
                                    }
                                    return value;
                                }
                            },
                            {
                                field: 'paraTypeCd', title: '原子类型', width: '15%',
                                formatter: function (value, row, index) {
                                    var value;
                                    if (row.typeOptnlFlag == false) {
                                        value = "<span class='paraTypeCdSpan'></span>" +
                                            "<select style='display:none' class='f-ipt w100 fn-fl typeOptnlSelect' value='" + row.paraTypeCd + "' atomid='" + row.atomId + "' atomnm='" + row.paraNm + "'>" +
                                            "<option value='" + row.paraTypeCd + "'></option>" +
                                            "</select>" +
                                            "<a class='f-refresh' href='javascript:void(0)' id='ref" + row.atomId + "' atomid='" + row.atomId + "' attrtype='" + row.paraTypeCd + "'></a>" +
                                            "</div>";
                                    } else {
                                        value = "<div class='field-error' id='errorWorm" + row.atomId + "'>" +
                                            "<select class='f-ipt w100 fn-fl typeOptnlSelect' name='typeOptnlSelect' value='" + row.paraTypeCd + "' atomid='" + row.atomId + "' atomnm='" + row.paraNm + "'>";
                                        for (var i = 0; i < row.typeOptnl.length; i++) {
                                            value += "<option value='" + row.typeOptnl[i].paraTypeCd + "'></option>";
                                        }
                                        value = value + "</select>" +
                                            "<a class='f-refresh' href='javascript:void(0)' id='ref" + row.atomId + "' atomid='" + row.atomId + "' attrtype='" + row.paraTypeCd + "'></a>"
                                            + "</div>";

                                    }
                                    if (row.wkunit) {
                                        value += "<input type='hidden' value='" + row.wkunit + "' name='basewkunit'>"
                                    }
                                    return value;
                                }
                            },
                            {
                                field: 'cntt', title: '内容', width: '40%',
                                formatter: function (value, row, index) {
                                    var value;
                                    if (row.paraTypeCd == 1) {//this.paraNm确认
                                        value = "<div class='textarea-fold'>" +
                                            "<textarea class='f-ipt w280 txtContiner' style='overflow-x:hidden' placeholder='请输入" + row.paraNm + "' atomid='" + row.atomId + "'name='cntt' id='cntt" + row.atomId + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += ">";
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            value += templateInfo.docKey.cntt;
                                        }
                                        value += "</textarea>";
                                    } else if (row.paraTypeCd == 2) {
                                        value = "<div id='cntt" + row.atomId + "' atomid='" + row.atomId + "' class='radioContiner'></div>";
                                    } else if (row.paraTypeCd == 3) {
                                        value = "<div id='cntt" + row.atomId + "' atomid='" + row.atomId + "' class='checkBoxContiner'></div>";
                                    } else if (row.paraTypeCd == 4) { //this.paraNm确认
                                        value = "<a class='f-lk-richtext' id='rich" + row.atomId + "' atomid='" + row.atomId + "' href='javascript:void(0)'" +
                                            "name='" + row.paraNm + "' id='cntt" + row.atomId + "'>" +
                                            "<span class='richTextButton' atomid='" + row.atomId + "'></span>" +
                                            "</a>" +
                                            "<input type='hidden' name='cntt'/>";
                                    } else if (row.paraTypeCd == 5) {//this.paraNm确认  this.docKey.cntt带确认
                                        var docKey;
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            docKey = templateInfo.docKey.cntt;
                                        }
                                        value = "<input class='f-ipt w100' type='text' placeholder='请输入" + row.atomId + "'" +
                                            "name='cntt' id='cntt" + row.atomId + "' value='" + docKey + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += "><select class='f-ipt w100' name='wkunit' id='timePeriodUnit" + row.atomId + "'";
                                        if (templateInfo.docKey) {
                                            value += "value='" + templateInfo.docKey.wkunit + "'";
                                        } else {
                                            value += "value='" + row.wkunit + "'";
                                        }
                                        value += ">";
                                        for (var i = 0; i < templateInfo.timePeriodUnit; i++) {
                                            value += "<option value='" + templateInfo.timePeriodUnit[i].value + "'>" + templateInfo.timePeriodUnit[i].name + "</option>";
                                        }
                                        value += "</select>";
                                    } else if (row.paraTypeCd == 6) {
                                        value = "<div class='dateEl' id='cntt" + row.atomId + "' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 7) {
                                        value = "<div class='dateTimeEl' id='cntt" + row.atomId + "' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 8) {
                                        value = "<div><a class='t-btn t-btn-sm' id='selectRel" + row.atomId + "'>选择</a></div>" +
                                            "<div id='selectRelList" + row.atomId + "' class='selectRelSS parameter-item'" +
                                            "paratypecd='" + row.paraTypeCd + "' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 9) {//待确认this.paraNm
                                        var docKey;
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            docKey = templateInfo.docKey.cntt;
                                        }
                                        value = "<input class='f-ipt w100' type='text' placeholder='请输入" + row.paraNm + "'" +
                                            "name='cntt' id='cntt" + row.atomId + "' value='" + docKey + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += "><select class='f-ipt w70' name='wkunit' id='memUnit" + row.atomId + "'";
                                        if (templateInfo.docKey) {
                                            value += "value='" + templateInfo.docKey.wkunit + "'";
                                        } else {
                                            value += "value='" + row.wkunit + "'";
                                        }
                                        value += ">";
                                        for (var i = 0; i < templateInfo.memUnit; i++) {
                                            value += "<option value='" + templateInfo.memUnit[i].value;
                                            if (templateInfo.docKey && templateInfo.docKey.wkunit == templateInfo.memUnit[i].value) {
                                                value += "selected='selected'";
                                            }
                                            +"'>" + templateInfo.memUnit[i].name + "</option>";
                                        }
                                        value += "</select>";
                                    } else if (row.paraTypeCd == 10) {
                                        value = "<div id='oldFileList" + row.atomId + "'></div>" +
                                            "<div class='w400 h30 fileContiner' id='fileUpload" + row.atomId + "' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 11) {//待确认this.paraNm
                                        var docKey;
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            docKey = templateInfo.docKey.cntt;
                                        }
                                        value = "数值：<input class='f-ipt w100' type='text' name='cntt' placeholder='请输入" + row.paraNm + "' name='cntt' id='cntt" + row.atomId + "'";
                                        "value='" + docKey + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += ">";
                                        value += "单位：<input class='f-ipt w70' type='text' name='wkunit' id='dataUnit" + row.atomId + "'";
                                        if (templateInfo.docKey) {
                                            value += "value='" + templateInfo.docKey.wkunit + "'";
                                        } else {
                                            value += "value='" + row.wkunit + "'";
                                        }
                                        value += "placeholder='单位'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += ">";
                                    } else if (row.paraTypeCd == 12) {
                                        var docKey;
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            docKey = templateInfo.docKey.cntt;
                                        }
                                        value = "<input class='f-ipt w100' type='text' placeholder='请输入" + row.paraNm + "'name='cntt' id='cntt" + row.atomId + "' value='" + docKey + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += ">";
                                        value +="<select class='f-ipt w70' name='wkunit' id='priceTimeUnit"+ row.atomId +"'";
                                        if (templateInfo.docKey){
                                            value +="value='"+templateInfo.docKey.wkunit+"'";
                                        }else{
                                            value +="value='"+ row.wkunit+"'";
                                        }
                                        for (var i = 0; i < templateInfo.priceTimeUnit; i++) {
                                            value += "<option value='" + templateInfo.priceTimeUnit[i].value + "'>" + templateInfo.priceTimeUnit[i].name + "</option>";
                                        }
                                        value += "</select>";
                                    } else if (row.paraTypeCd == 13) {
                                        value = "<div id='oldPicList" + row.atomId + "'></div>" +
                                            "<div class='w400 h30 picContiner' id='picUpload" + row.atomId + "'atomid='" + row.atomId + "'></div>"
                                    } else if (row.paraTypeCd == 14) {
                                        var docKey;
                                        if (templateInfo.docKey && templateInfo.docKey.cntt) {
                                            docKey = templateInfo.docKey.cntt;
                                        }
                                        value = "<input readonly class='f-ipt fn-fl w150' type='text' placeholder='请输入" + row.paraNm + "'name='cntt' id='cntt" + row.atomId + "' value='" + docKey + "'";
                                        if (templateInfo.acceptPrePubFlag) {
                                            value += "readonly='readonly' disabled='disabled'";
                                        }
                                        value += ">";
                                        value += "<p><a class='t-btn t-btn-xs' href='javascript:void(0)' id ='gisButton'>选择</a></p>";
                                    } else if (row.paraTypeCd == 15) {
                                        value = "<div><a class='t-btn t-btn-sm' id='selectTd" + row.atomId + "'>选择</a></div>" +
                                            "<div id='selectTdList" + row.atomId + "' class='selectTdSS parameter-item' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 16) {
                                        value = "<div id='regnIdContiner" + row.atomId + "' class='regnContiner' atomid='" + row.atomId + "'></div>";
                                    } else if (row.paraTypeCd == 17) {
                                        value = "<div><a class='t-btn t-btn-sm' id='media' kid='" + row.atomId + "'>关联多媒体知识</a></div>" +
                                            "<div id='selectMeList" + row.atomId + "' class='selectMeSS parameter-item' atomid='" + row.atomId + "'></div>";
                                    }
                                    return value;
                                }
                            },
                            {
                                field: 'isSendMes', title: '短信发送', width: '10%',
                                formatter: function (value, row, index) {
                                    var select = "<select class=\"f-ipt w50\" name=\"isSendMes\">\n" +
                                        "<option value=\"1\" selected=\"selected\">是</option>\n" +
                                        "<option value=\"2\">否</option>\n" +
                                        "</select>"
                                    return select;
                                }
                            },
                            {
                                field: 'action', title: '操作', width: '15%',
                                formatter: function (value, row, index) {
                                    var Action = "<a href='javascript:void(0);' class='annotationButton' id ='anno" + row.atomId + "' title='注解'>注解</a>" +
                                        //"<a href='javascript:void(0);' class='brwsPrivAtomBtn' id ='brws"+row.atomId+"'>原子浏览权限</a>"+
                                        // "<a href='javascript:void(0);' class='sourceStrong' id ='source"+row.atomId+"'>知识强关联</a>"+
                                        "|" +
                                        "<a href='javascript:void(0);' class='chnlBtn' id ='chnl" + row.atomId + "' title='渠道'>渠道</a>";
                                    return Action;
                                }
                            }
                        ]],
                        fitColumns: true,
                        width: '100%',
                        height: height,
                        pagination: false,
                        rownumbers: true,
                        singleSelect: true,
                        autoRowHeight: true,
                        loader: function (param, success) {
                            // var data = {rows: levelGroup[i].attr};
                            success(levelGroup[i].attr);
                        }
                    });
                }
            }
        }

        function generateToolBar(value) {
            return "<span title='" + value + "'>" + value + "</span>";
        }

        function initGlobalEvent() {
            //绑定注解按钮事件
            // $("#knowlDataGridArea").delegate("a.annotationButton", "click", function (){
            //     var thisAnBtn = $(this);
            //     $.messager.confirm('提示', '如果您不采编原子内容，该原子的注解和例外最终不会被保存，是否继续？', function(confirm) {
            //         if (confirm) {
            //             $("#win_content1").show().dialog({
            //                 width:550,
            //                 height:220,
            //                 modal:true,
            //                 title:"添加注解"
            //             });
            //             var atomId = thisAnBtn.attr('id').substr(4);//获取原子id
            //             addAnnotation.initialize(atomId);
            //         }
            //     });
            // });

            //调用初始化渠道下拉框方法
            initChannel();

            //选择路径弹框
            $("#knowledgePathBtn").click(function () {
                $("#win_content").show().window({
                    width: 500,
                    height: 600,
                    modal: true,
                    title: "选择知识路径"
                });

                require(["knowledgePath"], function (knowledgePath) {
                    knowledgePath.initialize($('input[name="pathName"]'), $('input[name="path"]'), $('input[name="regnId"]').val());
                });
            })


            //提交新增知识
            $("#bottomBtnsForm").on("click", "#commitButton", function () {
                if (tmpltChangeFlag) {
                    $.messager.confirm("width:900", "提示", "点击提交将不会保留与模板参数类型不一致的原子，请确认是否提交？", function (obj) {
                        commitBtnFun();
                    });
                } else {
                    commitBtnFun();
                }
            });
            //保存新增知识
            $("#bottomBtnsForm").on("click", "#saveButton", function () {
                if (tmpltChangeFlag) {
                    $.messager.confirm("width:900", "提示", "点击保存将不会保留与模板参数类型不一致的原子，请确认是否保存？", function (obj) {
                        saveBtnFun();
                    });
                } else {
                    saveBtnFun();
                }
            });
            //预览新增知识
            $("#bottomBtnsForm").on("click", "#viewButton", function () {

            });
            //取消新增知识
            $("#bottomBtnsForm").on("click", "#cancleBtn", function () {

            });
        }

        //初始化渠道下拉框
        function initChannel() {
            var options = {
                "$textBox": $("#addKnowledgeLayout").find("#knwlgChnlCode"),//传入div知识渠道Text的id=knwlgChnlCode
                "windowId": "channelWindow",//div渠道窗口id
                "contentId": "channelTree",
                "footerId": "footer"
            };
            TemplateManage.initChannelTextBox(options);
        }

//保存
        var saveBtnFun = function () {
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
            var jsonString = getklgData();

            //检查该知识重复或者矛盾,返回false说明不存在矛盾或重复的知识

            if (checkHasMultimedia(jsonString)) {
                return false;
            } else {
                Loading.showLoading("正在加载，请稍后");
            }

            //var knwlgId = $("#knwlgId").val();
            if ((addSim == "true" || addSimPub == "true" || tmpltId != undefined) && !viewBtnClick && !saveFlag) {
                knwlgId = "";
                Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgemgmt/saveknowledge',
                    {
                        jsonObject: jsonString
                    },
                    function (result, isOk) {
                        if (result.returnCode == "success") {
                            Loading.destroyLoading();
                            knwlgId = result.object;
                            $("#knwlgId").val(knwlgId);
                            saveFlag = true;
                            lockKnwlg(knwlgId);
                            $.messager.alert('温馨提示', '保存成功！');
                        }
                        else if (result.returnCode == "errorMsg") {
                            Loading.destroyLoading();
                            $.messager.alert('温馨提示', '保存失败！');
                        } else {
                            Loading.destroyLoading();
                            $.messager.alert('温馨提示', '保存失败！');
                        }
                    })
            }
            else {
                if (getLockInfo()) {
                    Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgemgmt/updateKnowledge',
                        {
                            jsonObject: jsonString
                        },
                        function (result, isOk) {
                            if (result.returnCode == "success") {
                                Loading.destroyLoading();
                                unLock();
                                $.messager.alert('温馨提示', '修改成功！');
                            } else if (result.returnCode == "errorMsg") {
                                Loading.destroyLoading();
                                $.messager.alert('温馨提示', '修改失败！');
                            } else {
                                Loading.destroyLoading();
                                showErrorDialog("修改", result);
                            }
                        });//endof post json
                }
            }
        }


        //提交
        function commitBtnFun() {
            //校验
            if (batchUpdate) {
                var jsonString = getklgData();
                var data = {};
                data.ids = knwlgId;
                data.json = jsonString;
                Util.ajax.postJson(Util.constants.CONTEXT + "/kmBatch/batchDocUpdate", data, function (data) {
                    if (data.returnCode == 0) {
                        batchUnLock();
                        $.messager.confirm("width:900", "提示", data.returnMessage, function (obj) {
                            //crossAPI.destroyTab('批量修改-编辑');
                            //提交成功后关掉页面
                        });
                    } else {
                        showErrorDialog("批量更新", result);
                    }
                });
            }
            if (!batchUpdate) {
                //校验表单
                // if(!infovalid.form()){
                //     return false;
                // }
                //
                // if(!baseInfoValid.form()){
                //     $(".right-content").scrollTop(0);
                //     return false;
                // }

                var jsonString = getklgData();
                //检查该知识重复或者矛盾,返回false说明不存在矛盾或重复的知识
                if (checkHasMultimedia(jsonString)) {
                    return false;
                } else {
                    Loading.showLoading("正在加载，请稍后");
                }

                if ((addSim == "true" || addSimPub == "true" || tmpltId != undefined) && !viewBtnClick && !saveFlag) {
                    knwlgId = "";
                    Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgeMgmt/saveAndPubKnowledge',
                        {
                            jsonObject: jsonString
                        },
                        function (result, isOk) {
                            if (result.returnCode == "success") {
                                Loading.destroyLoading();
                                //showNormalDialog("提交");
                                $.messager.alert('温馨提示', '提交成功！');
                            } else if (result.returnCode == "errorMsg") {
                                Loading.destroyLoading();
                                // showMustDialog("提交", result);
                                $.messager.alert('温馨提示', '提交失败！');
                            } else {
                                Loading.destroyLoading();
                                // showErrorDialog("提交", result);
                                $.messager.alert('温馨提示', '提交失败！');
                            }
                        })//endof post json
                }
                else {
                    if (getLockInfo()) {
                        Util.ajax.postJson(Util.constants.CONTEXT + '/knowledgeMgmt/updateAndPubKnowledge',
                            {
                                jsonObject: jsonString
                            },
                            function (result, isOk) {
                                if (result.returnCode == "success") {
                                    unLock();
                                    Loading.destroyLoading();
                                    // showNormalDialog("提交");
                                    $.messager.alert('温馨提示', '提交成功！');
                                } else if (result.returnCode == "errorMsg") {
                                    Loading.destroyLoading();
                                    // showMustDialog("提交", result);
                                    $.messager.alert('温馨提示', '提交失败！');
                                }
                                else {
                                    Loading.destroyLoading();
                                    // showMsgDialog(result);
                                    $.messager.alert('温馨提示', '提交失败！');
                                }
                            })//endof post json
                    }
                }
            }
        }

        /**
         * 知识加锁
         *
         * @param knwlgId
         */
        var lockKnwlg = function (knwlgId, funcall, titleType) {
            Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/lockKnwlg", {knwlgId: knwlgId}, function (data) {
                if (data.returnCode == 0) {
                    if (funcall) {
                        funcall(knwlgId, titleType);
                    }
                    dealSuccess("lockSuccess");
                } else {
                    $.messager.alert('温馨提示', data.returnMessage);
                }
            });
        };

        /**
         * 获取加锁信息
         */
        var getLockInfo = function () {
            if (!knwlgId || knwlgId == "null") {
                return;
            }
            var result = false;
            Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/getLockInfo", {knwlgId: knwlgId}, function (data) {
                if (data.returnCode == 0) {
                    result = data.object;
                    if (!result) {
                        $.messager.alert('温馨提示', "操作失败，加锁状态异常");
                    }
                } else {
                    $.messager.alert('温馨提示', data.returnMessage);
                }
            }, true);
            return result;
        };

        /**
         * 解锁
         */
        var unLock = function () {
            if (!knwlgId || knwlgId == "null") {
                return;
            }
            Util.ajax.postJson(Util.constants.CONTEXT + "/kmDocEdit/unLockKnwlg", {knwlgId: knwlgId}, function () {
            }, true);
        };

        /**
         * 批量解锁
         */
        function batchUnLock() {
            Util.ajax.postJson(Util.constants.CONTEXT + "/kmBatch/batchDocDeblocking/", {ids: knwlgId}, function (data, status) {
            }, true);
        };

        function showErrorDialog(tip, resultData) {
            $.messager.alert('温馨提示', tip + '失败！' + resultData.returnMessage);
        }

        var checkHasMultimedia = function (jsonString) {
            return false;
            var flag = false;
            Util.ajax.postJson(Util.constants.CONTEXT + "/knowledgeMgmt/checkHasMultimedia", {jsonObject: jsonString}, function (data) {
                if (data.returnCode == 0) {
                    flag = data.object;
                    if (data.object) {
                        $.messager.alert('温馨提示', resultData.returnMessage);
                    }
                } else if (data.returnCode == 1) {
                    $.messager.alert('温馨提示', resultData.returnMessage);
                }
            }, true);
            return flag;
        }

        function getklgData() {
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

            // //浏览权限
            // klgData["brwsPriv"] = $("#brwsPriv").val();


            klgData["docRelate"] = {};
            var relaArray = new Array();
            $("#knowledgeRelation").find("span.docRelateData").each(function () {
                var rmk = "";
                var srcCode = "";
                if ($(this).attr("rmk")) {
                    rmk = $(this).attr("rmk");
                }
                if ($(this).attr("srccode")) {
                    srcCode = $(this).attr("srccode");
                }
                //短信
                if ($(this).attr("relatype") == '6') {
                    relaArray.push({
                        relaId: $(this).attr("relaid"),
                        relaType: $(this).attr("relatype"),
                        rmk: rmk,
                        srcCode: srcCode,
                        smsName: $(this).attr("title")
                    });
                } else {
                    relaArray.push({
                        relaId: $(this).attr("relaid"),
                        relaType: $(this).attr("relatype"),
                        rmk: rmk,
                        srcCode: srcCode
                    });
                }
            })
            klgData["docRelate"] = relaArray;

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
            $("tr.datagrid-row").each(function () {
                var jsonO = {};
                var fileArray = new Array();
                var relSerialArray = new Array();
                var relaArray = new Array();
                $(this).find("input").each(function () {
                    //原子中普通类型选择
                    if ($(this).val()) {
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
                if (!$.isEmptyObject(jsonO)) {
                    atomArray.push(jsonO);
                }
            });
            var component = {};
            component["radio"] = {};
            component["checkbox"] = {};
            component["editor"] = {};
            for (var i in radioGroup) {
                var value = radioGroup[i].get();
                if (value != "") {
                    component["radio"][i] = radioGroup[i].get();
                }
            }
            for (var i in checkboxGroup) {
                var value = checkboxGroup[i].get();
                if (value != "") {
                    component["checkbox"][i] = checkboxGroup[i].get();
                }
            }
            //增加初始化的richMap内容
            for (var i in richMap) {
                component["editor"][i] = richMap[i];
            }

            for (var i in editorGroup) {
                var edContent = editorGroup[i].getContent();
                if ($('#rich' + i).hasClass('f-lk-richtext2')) {
                    component["editor"][i] = edContent;
                } else {
                    component["editor"][i] = "";
                }
            }

            klgData["component"] = component;
            var regnId;
            if (regnTreeData && regnTreeData.value) {
                regnId = regnTreeData.value;
            }
            if ($("#regnIdContiner").find("input[name=regnId]").val() == regnId) {
                klgData["exception"] = exceptionTemp;
            }
            klgData["annotation"] = annotationTemp;
            klgData["sourceFileData"] = strongAssosationTemp;
            return JSON.stringify({"klgData": klgData, "atomArray": atomArray});
        }

        //更改目录操作状态
        function updateOperateStatus(treeNode) {
            if (treeNode.level == 0) {
                if (!$("#edit-catalog").hasClass("disabled")) {
                    $("#edit-catalog").addClass("disabled");
                }
                if (!$("#delete-catalog").hasClass("disabled")) {
                    $("#delete-catalog").addClass("disabled");
                }
                if ($("#add-catalog").hasClass("disabled")) {
                    $("#add-catalog").removeClass("disabled");
                }
            } else {
                if ($("#edit-catalog").hasClass("disabled")) {
                    $("#edit-catalog").removeClass("disabled");
                }
                if ($("#delete-catalog").hasClass("disabled")) {
                    $("#delete-catalog").removeClass("disabled");
                }
                if (!$("#add-catalog").hasClass("disabled")) {
                    $("#add-catalog").addClass("disabled");
                }
            }
            //上移下移图标
            updateMoveStatus(treeNode);
        }

        //更改上移下移操作状态
        function updateMoveStatus(treeNode) {
            if (treeNode.getPreNode() != null) {
                if ($("#moveUp-catalog").hasClass("disabled")) {
                    $("#moveUp-catalog").removeClass("disabled");
                }
            } else {
                if (!$("#moveUp-catalog").hasClass("disabled")) {
                    $("#moveUp-catalog").addClass("disabled");
                    $("#moveUp-catalog").attr("disabled", "true");
                }
            }
            if (treeNode.getNextNode() != null) {
                if ($("#moveDown-catalog").hasClass("disabled")) {
                    $("#moveDown-catalog").removeClass("disabled");
                }
            } else {
                if (!$("#moveDown-catalog").hasClass("disabled")) {
                    $("#moveDown-catalog").addClass("disabled");
                    $("#moveUp-catalog").css("disabled", "true");
                }
            }
        }

        //校验工作组名称是否重复
        function nameValidator() {
            var sameNameNodes = zTreeObj.getNodesByParam("name", zTreeObj.getSelectedNodes()[0].name, null);
            if (sameNameNodes.length > 1) {
                $.messager.show({
                    msg: '工作组名称重复.',
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                zTreeObj.editName(zTreeObj.getSelectedNodes()[0]);
            }
        }

        function dealSuccess(message) {
            if ("addSuccess" == message) {
                unLock();
            }
            if ("addSimSuccess" == message) {
                unLock();
            }
            //crossAPI.trigger(['知识管理'],'submit',{result:message });
        };
    });