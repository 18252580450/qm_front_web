define(["jquery", "loading", 'util', 'hdb', "easyui", "transfer"
    ,'text!html/manage/docEditDynamicDataType.tpl', 'ztree-exedit'],
    function ($, Loading, Util, Hdb, easyui, Transfer,docEditDynaMic) {

        var memUnit = null;
        var timePeriodUnit = null;
        var priceTimeUnit = null;
        var richMapTemp = null;
        var editorGroup = null;
        var allAttrs = null;
        var dateGroup = null;
        var dateTimeGroup = null;
        var dataTypeCheckData = null;
        var radioGroup = null;
        var checkboxGroup = null;
        var atomType = null;
        var acceptPrePubFlag = null;
        var batchFlag = null;

        var setAcceptPrePubFlag = function (flag) {
            acceptPrePubFlag = flag;
        }
        var init = function (componentGroup) {
            richMapTemp = componentGroup["richMapTemp"];
            editorGroup = componentGroup["editorGroup"];
            allAttrs = componentGroup["allAttrs"];
            dateGroup = componentGroup["dateGroup"];
            dateTimeGroup = componentGroup["dateGroup"];
            dataTypeCheckData = componentGroup["dataTypeCheckData"];
            radioGroup = componentGroup["radioGroup"];
            checkboxGroup = componentGroup["checkboxGroup"];
            atomType = componentGroup["atomType"];
            acceptPrePubFlag = componentGroup["acceptPrePubFlag"];
            batchFlag = componentGroup["batchFlag"];

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
        }

        var refresh = function (paraTypeCd, atomId, paramNm, strongFlag) {
            var dynTemplate = Hdb.compile(docEditDynaMic);
            var replaceHtml = dynTemplate({
                paraTypeCd: paraTypeCd,
                atomId: atomId,
                paraNm: paramNm,
                acceptPrePubFlag: acceptPrePubFlag
            });
            $("#tdcntt" + atomId).html(replaceHtml);
            generate(paraTypeCd, atomId, strongFlag);
        }
        var time_wkunit_cd = 'NGKM.ATOM.PARAM.TIMES.WKUNIT';//时间单位
        var ram_wkunit_cd = 'NGKM.ATOM.PARAM.RAMTYPE.WKUNIT';//内存单位
        var priceOrTime_wkunit_cd = 'NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT';//价格/时间单位
        var changeFlag;


        var tmpltChangeFlag = function () {
            return changeFlag;
        }

        var getcovData = function (codeTypeCd) {  //获取数据字典的数据
            var result = {};
            var covData = {
                url: Util.constants.AJAXURL + '/kmConfig/getDataByCode?codeTypeCd=' + codeTypeCd,
                async: false,
                success: function (data) {
                    for (var i = 0; i < data.beans.length; i++) {
                        if (data.beans[i].value != null && data.beans[i].name != null) {
                            result[data.beans[i].value] = data.beans[i].name;
                        }
                    }
                }, error: function (data) {
                    return;
                },
                dataType: 'json', //返回值的数据类型
                timeout: 30000,  //超时时间
                type: 'get'  //请求类型
            };
            Util.ajax.ajax(covData);
            return result;
        };
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

        var showMessage = function () {
            $.messager.alert("提示", "由于您清空了原子内容，该原子的例外和注解最终将不会被保存!");
        };

        var isHasexce = function (atomId) {
            return $("#" + atomId).last().find(".link-red").length === 0 ? false : true;
        };

        var renderDataType = function (typeCd) {
            var typeName = null;
            for (var i in atomType) {
                if (atomType[i].CODEVALUE == typeCd) {
                    typeName = atomType[i].CODENAME;
                }
            }
            if (typeName == null) {
                typeName = "未知原子类型";
            }
            return typeName;
        }

        var fillOldFileByAtomId = function (atomId) {
            if (allAttrs) {
                if (allAttrs[atomId]) {
                    var targetHtml = "<ul>";
                    for (var i in allAttrs[atomId]["cntt"]) {
                        targetHtml += "<li>"
                        targetHtml = targetHtml + allAttrs[atomId]["cntt"][i]["fileName"] +
                            "<a href=\"javascript:void(0)\" class=\"fileToBeMoved\" fileid=\"" +
                            allAttrs[atomId]["cntt"][i]["fileId"] + "\">删除</a>";
                        //再次传送数据会从这里取出
                        var fileForPost = "<input  type=\"hidden\" fileId = \"" + allAttrs[atomId]["cntt"][i]["fileId"] + "\" fileName = \"" + allAttrs[atomId]["cntt"][i]["fileName"] + "\" class=\"fileAtom\"/>";
                        targetHtml += fileForPost;
                        targetHtml += "</li>"
                    }
                    targetHtml += "</ul>"
                    $("#oldFileList" + atomId).html(targetHtml);
                    if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongRed")) {
                        $("#oldFileList" + atomId).find('.fileToBeMoved').attr('style', 'color:gray;');
                    } else {
                        $("#oldFileList" + atomId).find('.fileToBeMoved').attr('style', 'color:red;');
                    }
                    if (!acceptPrePubFlag) {
                        $("#oldFileList" + atomId).find('.fileToBeMoved').click(function () {
                            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                $("#fileUpload" + atomId).show();
                                var content = $(this);
                                content.parent().remove();

                                if ($("#oldFileList" + atomId).parent().find(".fileAtom").length === 0
                                    && isHasexce(atomId)) {
                                    showMessage();
                                }
                            } else {
                                $("#fileUpload" + atomId).hide();
                            }
                        });
                    }
                }
            }
        }

        var fillOldPicByAtomId = function (atomId) {
            if (allAttrs)
                if (allAttrs[atomId]) {
                    var targetHtml = "<ul>";
                    for (var i in allAttrs[atomId]["cntt"]) {
                        targetHtml += "<li>"
                        targetHtml = targetHtml + allAttrs[atomId]["cntt"][i]["fileName"] +
                            "<a href=\"javascript:void(0)\" class=\"fileToBeMoved\" fileid=\"" +
                            allAttrs[atomId]["cntt"][i]["fileId"] + "\">删除</a>";
                        //再次传送数据会从这里取出
                        var fileForPost = "<input  type=\"hidden\" fileId = \"" + allAttrs[atomId]["cntt"][i]["fileId"] + "\" fileName = \"" + allAttrs[atomId]["cntt"][i]["fileName"] + "\" class=\"picAtom\"/>";
                        targetHtml += fileForPost;
                        targetHtml += "</li>"
                    }
                    targetHtml += "</ul>"
                    $("#oldPicList" + atomId).html(targetHtml);
                    if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongRed")) {
                        $("#oldPicList" + atomId).find('.fileToBeMoved').attr('style', 'color:gray;');
                    } else {
                        $("#oldPicList" + atomId).find('.fileToBeMoved').attr('style', 'color:red;');
                    }

                    if (!acceptPrePubFlag) {
                        $("#oldPicList" + atomId).find('.fileToBeMoved').click(function () {
                            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                var content = $(this);
                                content.parent().remove();
                                $("#picUpload" + atomId).show();
                                if ($("#oldPicList" + atomId).parent().find(".picAtom").length === 0
                                    && isHasexce(atomId)) {
                                    showMessage();
                                }
                            }
                        })
                    }
                }
        }

        var fillOldRelationByAtomId = function (atomId) {
            if (!allAttrs)
                return;
            if (!allAttrs[atomId])
                return;

            if (allAttrs[atomId]["paraTypeCd"] != Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG) {
                return;
            }
            if (allAttrs)
                if (allAttrs[atomId]) {
                    var targetHtml = "";
                    for (var i in allAttrs[atomId]["cntt"]) {
                        targetHtml += "<li class='par-tag relate-data-drag'>";
                        var relaId = allAttrs[atomId]["cntt"][i]["relaId"];
                        var relaName = allAttrs[atomId]["cntt"][i]["relaName"];
                        //再次传送数据会从这里取出
                        var htmlMessage = '<span title="' + relaName + '" class="docRelateData" relaId = "' + relaId + '"id="' + relaId + "selectRel" + atomId + '">' + relaName + '</span><a class="knowlgAtomClose" href="#nogo" id="V_' + relaId + atomId + '"></a>';
                        targetHtml += htmlMessage;
                        targetHtml += "</li>";
                    }
                    $("#selectRelList" + atomId).html(targetHtml);

                    if (!acceptPrePubFlag) {
                        $("#selectRelList" + atomId).dragsort("destroy");
                        if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                            $("#selectRelList" + atomId).dragsort({
                                dragSelector: "span"
                            });
                        }
                        $("#selectRelList" + atomId).find('.knowlgAtomClose').click(function (e) {
                            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                $(this).parent().remove();
                                if ($("#selectRelList" + atomId).find(".docRelateData").length === 0
                                    && isHasexce(atomId)) {
                                    showMessage();
                                }
                            }
                        });
                    }
                }
        }

        var fillOldRelationSerialByAtomId = function (atomId) {
            if (!allAttrs)
                return;
            if (!allAttrs[atomId])
                return;

            if (allAttrs[atomId]["paraTypeCd"] != Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST) {
                return;
            }
            if (allAttrs != undefined)
                if (allAttrs[atomId] != undefined) {
                    var targetHtml = "";
                    for (var i in allAttrs[atomId]["cntt"]) {
                        targetHtml += "<li class='par-tag relate-data-drag'>"
                        var relaId = allAttrs[atomId]["cntt"][i]["relaId"];
                        var relaName = allAttrs[atomId]["cntt"][i]["relaName"];
                        //再次传送数据会从这里取出
                        var htmlMessage = '<span class="docRelateData" title="' + relaName + '" relaId = "' + relaId + '"id="' + relaId + "selectTd" + atomId + '">' + relaName + '</span><a class="knowlgAtomClose" href="#nogo" id="V_' + relaId + atomId + '"></a>';
                        targetHtml += htmlMessage;
                        targetHtml += "</li>"
                    }
                    $("#selectTdList" + atomId).html(targetHtml);

                    if (!acceptPrePubFlag) {
                        $("#selectTdList" + atomId).dragsort("destroy");
                        if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                            $("#selectTdList" + atomId).dragsort({
                                dragSelector: "span"
                            });
                        }

                        $("#selectTdList" + atomId).find('.knowlgAtomClose').click(function (e) {
                            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                                $(this).parent().remove();
                                if (isHasexce(atomId)) {
                                    showMessage();
                                }
                            }
                        });
                    }
                }
        }

        var atomRegnInit = function (atomId) {
            if (allAttrs) {
                if (allAttrs[atomId] && Util.constants.NGKM_ATOM_DATA_TYPE_REGN == allAttrs[atomId]["paraTypeCd"]) {
                    var regnId = allAttrs[atomId].cntt;
                    Util.ajax.postJson(Util.constants.AJAXURL + "/kmConfig/getCacheCityByRegnId", {regnId: regnId}, function (data) {
                        if (data.returnCode == "0" && data.bean.regnNm) {
                            $("#" + atomId).find("input[name=sn-cntt-text]").val(data.bean.regnNm);
                            $("#" + atomId).find("input[name=cntt]").val(regnId);
                        } else {
                            $("#" + atomId).find("input[name=sn-cntt-text]").val(regnId);
                            $("#" + atomId).find("input[name=cntt]").val(regnId);
                        }
                    });
                }
            }

            $("#regnIdContiner" + atomId).find('input[class="easyui-combotree"]').combotree({
                url: Util.constants.CONTEXT + "/district/getDistrictListByUser",
                method: "GET",
                panelHeight: '180px',
                editable: false,
                loadFilter: function (datas) {
                    var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                    var treeJson = [];
                    if (data && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var json ={};
                            json.id = data[i].codeValue;
                            json.text = data[i].codeName;
                            if (data[i].isParent) {
                                json.state = 'closed';
                            }
                            treeJson.push(json);
                        }
                    }
                    return treeJson;
                },
                onBeforeExpand: function (node, param) {    // 下拉树异步
                    $('#regnTree'+ atomId).combotree("tree").tree("options").url = Util.constants.CONTEXT + "/district/query?codeValue=" + node.id;
                },
                onChange:function(newValue, oldValue){
                    $("#regnIdContiner" + atomId).find("input[name='cntt']").val(newValue);  
                }
            });
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#regnIdContiner' + atomId + " input[name='cntt']").prev().attr('disabled', false);
            } else {
                $('#regnIdContiner' + atomId + " input[name='cntt']").prev().attr('disabled', true);
            }

            if (acceptPrePubFlag) {
                $('#regnIdContiner' + atomId + " input[name='cntt']").prev().attr('disabled', true);
            }

            // selectTreeRegn.on("clear", function(){
            //     if(isHasexce(atomId)){
            //         showMessage();
            //     }
            // });
        }

        var timePeriodInit = function (atomId) {
            var htmlString = "<option value=''>请选择...</option>"
            var el = '#timePeriodUnit' + atomId;
            var defaultValue = dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_TIME]["wkunit"];
            for (var i = 0; i < timePeriodUnit.length; i++) {
                if (defaultValue == timePeriodUnit[i].value) {
                    htmlString += "<option value=\"" + timePeriodUnit[i].value + "\" selected='selected'>" + timePeriodUnit[i].name + "</option>";
                }
                else {
                    htmlString += "<option value=\"" + timePeriodUnit[i].value + "\">" + timePeriodUnit[i].name + "</option>";
                }
            }
            $(el).html(htmlString);
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $("#cntt" + atomId).attr('disabled', false);
                $("#timePeriodUnit" + atomId).attr('disabled', false);
            } else {
                $("#cntt" + atomId).attr('disabled', true);
                $("#timePeriodUnit" + atomId).attr('disabled', true);
            }
        }

        var memInit = function (atomId) {
            var htmlString = "<option value=''>请选择...</option>"
            var el = '#memUnit' + atomId;
            var defaultValue = dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY]["wkunit"];
            for (var i = 0; i < memUnit.length; i++) {
                if (defaultValue == memUnit[i].value) {
                    htmlString += "<option value=\"" + memUnit[i].value + "\" selected='selected'>" + memUnit[i].name + "</option>";
                }
                else {
                    htmlString += "<option value=\"" + memUnit[i].value + "\">" + memUnit[i].name + "</option>";
                }

            }
            $(el).html(htmlString);
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
                $('#memUnit' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
                $('#memUnit' + atomId).attr('disabled', true);
            }
        }

        var priceTimeInit = function (atomId) {
            var htmlString = "<option value=''>请选择...</option>"
            var el = '#priceTimeUnit' + atomId;
            var defaultValue = dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_PRICE]["wkunit"];
            for (var i = 0; i < priceTimeUnit.length; i++) {
                if (defaultValue == priceTimeUnit[i].value) {
                    htmlString += "<option value=\"" + priceTimeUnit[i].value + "\" selected='selected'>" + priceTimeUnit[i].name + "</option>";
                }
                else {
                    htmlString += "<option value=\"" + priceTimeUnit[i].value + "\">" + priceTimeUnit[i].name + "</option>";
                }

            }
            $(el).html(htmlString);
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
                $('#priceTimeUnit' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', false);
                $('#priceTimeUnit' + atomId).attr('disabled', false);
            }
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

        /**
         * 隐藏例外按钮
         */
        var hideExceBtn = function (atomId) {
            var excepBtn = $("#exce" + atomId);
            if (excepBtn.length > 0) {
                excepBtn.hide();
                excepBtn.prev().hide();
            }
        };

        var charTypeGenerate = function (atomId) {
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_CHAR) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                }
            }
            $('#cntt' + atomId).next().on("click", function () {
                if ($(this).parent().hasClass("textarea-fold")) {
                    $(this).parent().removeClass("textarea-fold");
                    $(this).parent().addClass("textarea-unfold");
                } else {
                    $(this).parent().removeClass("textarea-unfold");
                    $(this).parent().addClass("textarea-fold");
                }
            });
            $('#cntt' + atomId).on("keydown focus", function (e) {
                if ($(this).parent().hasClass("textarea-fold") && ($(this).val().length > 16 || e.keyCode == 13)) {
                    $(this).parent().removeClass("textarea-fold");
                    $(this).parent().addClass("textarea-unfold");
                }
            });
            $("#cntt" + atomId).blur(function () {
                if (!trim($(this).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
            }
        }

        var initRadio = function (atomId) {
            var radioCnttHtml = '';
            var option = dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_RADIO]["optVal"];
            if (option && option.length > 0) {
                radioCnttHtml = '<div class="par-set formControls" id="radios' + atomId + '">';
                for (var i = 0; i < option.length; i++) {
                    radioCnttHtml += '<input type="radio" name="radios' + atomId + '" value ="' + option[i].value + '" id="' + option[i].value + atomId + 'radio"/><label >' + option[i].label + '</label>'
                }
                radioCnttHtml += '</div>';
            }
            $("#cntt" + atomId).append(radioCnttHtml);

            radioGroup[atomId] = "radios" + atomId;


            if (acceptPrePubFlag) {
                $("#radios" + atomId).find("input[type=radio]").each(function () {
                    $(this).attr("disabled", "disabled");
                })
            }
        }

        var radioGenerate = function (atomId) {
            initRadio(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_RADIO) {
                    $("#radios" + atomId).find("input[type=radio]").each(function () {
                        if ($(this).val() == allAttrs[atomId]["cntt"]) {
                            $(this).attr("checked", "checked");
                        }
                    })
                }
            }
            var radioName = radioGroup[atomId];
            $('input[type=radio][name=' + radioName + ']').change(function () {
                if (!$('input[type=radio][name=' + radioName + ']').val() && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
        }

        var checkBoxGenerate = function (atomId) {
            initCheckBox(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_CHECK) {
                    if (checkboxGroup[atomId]) {
                        //checkboxGroup[atomId].set(allAttrs[atomId]["cntt"]);
                        var vals = allAttrs[atomId]["cntt"].split(',');
                        for (var i=0;i<vals.length;i++){
                            $("#"+checkboxGroup[atomId]).find("input[value=]");
                        }

                        // $("#cb1″).prop("checked",true);
                    }
                }
            }

            if (checkboxGroup[atomId]) {
                var checkBoxName = checkboxGroup[atomId]
                $('input[type=checkbox][name=' + checkBoxName + ']').change(function () {
                    if (!$('input[type=radio][name=' + checkBoxName + ']').val() && isHasexce(atomId)) {
                        showMessage();
                    }
                });
            }
            showExceBtn();
        }

        var richGenerate = function (atomId, strongFlag) {
            //富文本框里采编有内容时  改变样式
            if (richMapTemp != null && richMapTemp[atomId]) {
                if (!strongFlag) {
                    richMapTemp[atomId] = null;
                } else {
                    $("#rich" + atomId).addClass("f-lk-richtext2").removeClass("f-lk-richtext");
                }
            }
            //富文本框处理
            $("#richText" + atomId).click(function () {
                var richContiner = $(this).parent();
                var dialogConfig = {
                    title: richContiner.attr("name") + ' 富文本采编', //弹窗标题，
                    content: EditorContiner,
                    ok: function () {
                    },
                    okValue: '保存', //确定按钮的文本 默认是 ‘ok’
                    cancel: function () {
                        return true;
                    },
                    cancelValue: '取消', //取消按钮的文本 默认是 ‘关闭’
                    button: [ //自定义按钮组
                        {
                            value: '清空', //按钮显示文本
                            callback: function () { //自定义按钮回调函数
                                editor.setContent("");
                                return false; //阻止窗口关闭
                            }
                        }],
                    width: 1024,
                    height: 400
                }
                if ($("#strong" + atomId).prev().hasClass("link-strongRed") || acceptPrePubFlag) {
                    dialogConfig = {
                        title: richContiner.attr("name") + ' 富文本采编', //弹窗标题，
                        content: EditorContiner,
                        cancel: function () {
                            return true;
                        },
                        cancelValue: '取消', //取消按钮的文本 默认是 ‘关闭’
                        width: 1024,
                        height: 400
                    }
                }
                var dialog = new Dialog(dialogConfig);
                var defaultContent = "";
                if (richMapTemp != null && richMapTemp[richContiner.attr("atomid")] != null) {
                    defaultContent = richMapTemp[richContiner.attr("atomid")];
                }

                var editor = new Editor(defaultContent);

                dialog.on('confirm', function (e) {
                    //判断内容是否为空，改变控件样式
                    var content = editor.getContent();
                    content = trim(content);
                    if (!content && isHasexce(atomId)) {
                        showMessage();
                    }
                    //将富文本内容放入map中，以便再次弹出dialog时显示本次编辑值
                    richMapTemp[richContiner.attr("atomid")] = content;
                    if (content) {
                        richContiner.addClass("f-lk-richtext2").removeClass("f-lk-richtext");
                    }
                    if (!content) {
                        richContiner.addClass("f-lk-richtext").removeClass("f-lk-richtext2");
                    }
                });
                editorGroup[$(this).parent().attr("atomId")] = editor;
            })

            //刷新后，有内容时显示有内容的样式
            if (allAttrs && allAttrs[atomId] && allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_RICH) {
                if (allAttrs[atomId]["cntt"]) {
                    $("#rich" + atomId).addClass("f-lk-richtext2").removeClass("f-lk-richtext");
                    richMapTemp[atomId] = allAttrs[atomId]["cntt"];
                }
            }

            showExceBtn();
        }

        var timePeriodGenerate = function (atomId) {
            timePeriodInit(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_TIME) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                    $("#timePeriodUnit" + atomId).val(allAttrs[atomId]["wkunit"]);
                }
            }

            $("#cntt" + atomId).blur(function () {
                if (!trim($("#cntt" + atomId).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $("#cntt" + atomId).attr('disabled', false);
                $("#timePeriodUnit" + atomId).attr('disabled', false);
            } else {
                $("#cntt" + atomId).attr('disabled', true);
                $("#timePeriodUnit" + atomId).attr('disabled', true);
            }

            if (acceptPrePubFlag) {
                $("#timePeriodUnit" + atomId).attr('disabled', true);
            }
        }

        var dateGenerate = function (atomId) {
            var defaultValue = null;
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_DATE) {
                    defaultValue = allAttrs[atomId]["cntt"];
                }
            }

            $("#cntt" + atomId).append("<input type='text' class='easyui-datetimebox' name='cntt' style='width:100%;height:30px'>");

            $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox();
            $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                editable: false,
                disabled: false,
                formatter: function (d) {
                    var currentMonth = (d.getMonth()+1);
                    var currentDay = d.getDate();
                    var currentMonthStr = currentMonth < 10 ? ('0' + currentMonth) : (currentMonth + '');
                    var currentDayStry = currentDay < 10 ? ('0' + currentDay) : (currentDay + '');
                    return d.getFullYear() + '-' + currentMonthStr + '-' + currentDayStry;
                }
            });
            $("#cntt" + atomId).find("a").removeClass("textbox-icon-disabled");
            //清空时触发 todo
            // if (isHasexce(atomId)) {
            //     showMessage();
            // }


            if (defaultValue) {
                $("#cntt" + atomId).combo('setText', defaultValue);
            }

            dateGroup[atomId] = defaultValue;

            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: false
                });
            } else {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: true
                });
            }

            if (acceptPrePubFlag) {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: true
                });
            }
        }

        var dateTimeGenerate = function (atomId) {
            var defaultValue = null;
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_DATETIME) {
                    defaultValue = allAttrs[atomId]["cntt"];
                }
            }

            $("#cntt" + atomId).append("<input type='text' class='easyui-datetimebox' name='cntt' style='width:100%;height:30px'>");

            $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox();
            $("#cntt" + atomId).find("input.easyui-textbox").textbox();
            $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                editable: false,
                disabled: false
            });

            //清空时触发 todo
            // if (isHasexce(atomId)) {
            //     showMessage();
            // }

            if (defaultValue) {
                $("#cntt" + atomId).combo('setText', defaultValue);
            }

            dateGroup[atomId] = defaultValue;

            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: false
                });
            } else {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: true
                });
            }

            if (acceptPrePubFlag) {
                $("#cntt" + atomId).find("input.easyui-datetimebox").datetimebox({
                    disabled: true
                });
            }
        }

        var knwlgGenerate = function (atomId) {
            if (!acceptPrePubFlag) {
                $("#selectRel" + atomId).on('click', function () {
                    if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                        new SelectKnowledge('知识关联', atomId, 'selectRelList' + atomId, $(this), null, true);
                    }
                });
            }
            fillOldRelationByAtomId(atomId);
            hideExceBtn(atomId);
        }
        var initCheckBox = function (atomId) {
            var checkBoxCnttHtml = '';
            var option = dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_CHECK]["optVal"];

            if (option && option.length > 0) {
                checkBoxCnttHtml = '<div class="par-set formControls" id="checkboxs' + atomId + '">';
                for (var i = 0; i < option.length; i++) {
                    checkBoxCnttHtml += '<input type="checkbox" name="checkbox' + atomId + '" value ="' + option[i].value + '" id="' + option[i].value + atomId + 'checkbox"/><label >' + option[i].label + '</label>'
                }
                checkBoxCnttHtml += '</div>';
            }
            $("#cntt" + atomId).append(checkBoxCnttHtml);

            checkboxGroup[atomId] = "checkboxs" + atomId;

            if (acceptPrePubFlag) {
                $("#checkboxs" + atomId).find("input[type=checkbox]").each(function () {
                    $(this).attr("disabled", "disabled");
                })
            }
        }

        var fileGenerate = function (atomId) {
            var $fileUpload;
            $fileUpload = $([
                    "<form id='upload-form"+ atomId +"' method='post' enctype='multipart/form-data'>",
                    "<div>",
                    "<input id='onlineFileName"+ atomId +"' name='onlineFileName' class='easyui-filebox' type='text'>",
                    "<a href='javascript:void(0)' id='btn-upload"+ atomId +"' class='btn btn-green radius  mt-l-20'>上传</a>",
                    "</div>",
                    "<div>",
                    "<div id='upload_result"+ atomId +"' class='upload-list'>",
                    "</div>",
                    "</form>"

                ].join("")).appendTo($("#fileUpload"+atomId));
            initUpload($fileUpload,atomId);
            initEvent($fileUpload,atomId);

            // RelevanceAttribute.fileUpload([atomId]);
            // if (allAttrs && allAttrs[atomId]) {
            //     if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_FILE) {
            //         fillOldFileByAtomId(atomId);
            //         if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
            //             $("#fileUpload" + atomId).show();
            //         } else {
            //             $("#fileUpload" + atomId).hide();
            //         }
            //     }
            // }
            // hideExceBtn(atomId);
        }

        /**
         * 初始化组件
         */
        function initUpload($fileUpload,atomId){
            $fileUpload.find("#onlineFileName"+atomId).filebox({
                buttonText: '选择文件',
                prompt: '请选择上传',
                buttonAlign: 'right'
            });

            // $upload.find("#p").progressbar({
            //     value: 60
            // });

        }


        /**
         * 初始化事件
         */
        function initEvent($fileUpload,atomId){
            $fileUpload.find("#btn-upload"+atomId).on("click", function () {
                // 判空
                var params = Util.PageUtil.getParams($fileUpload);
                console.log("params: " + params);
                if(!params['onlineFileName']){
                    $.messager.alert("提示","请先选择文件");
                    return;
                }

                // //$upload.find("#upload-form")
                $("#upload-form"+atomId).form('submit', {
                    url: Util.constants.CONTEXT + "/UploadController/onlineupload",
                    method: "POST",
                    dataType: "json",
                    onSubmit: function(){

                    },
                    success: function(data){
                        if(data){
                            var result = JSON.parse(data);
                            showResult(result);
                        }else{
                            $.messager.alert("提示","操作失败！");
                        }
                    },
                    error: function (data) {
                        $.messager.alert("提示","操作异常！");
                    }
                });
            });
        }

        /**
         * 上传结果
         */
        function showResult(result){
            var fileName = result.fileName;
            var stateFlag = Math.random() > 0.5 ? 'state-success' : 'state-fail';
            var fileType = 'file-word';
            var fileId = Math.random() > 0.5 ? '10000000001' : '10000000002';

            var $uploadResult = $([
                "<dl id='" + fileId + "'>",
                "<dd>",
                "<p>",
                "<span class='" + fileType + " floatL'>" + fileName + "</span>",
                "<a fileId='" + fileId + "' href='#' class='state " + stateFlag + " floatR'></a>",
                "</p>",
                "</dd>",
                "</dl>"
            ].join("")).appendTo($("#upload_result"));

            $("#upload_result dl dd p").find("a").click(function () {
                var fileId = $(this).attr('fileId');
                console.log("fileId: " + fileId);
                $("#" + fileId).remove();
            });
        }

        var dataUnitGenerate = function (atomId) {
            $("#dataUnit" + atomId).val(dataTypeCheckData["typeOptnl"][atomId][Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT]["wkunit"]);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                    $("#dataUnit" + atomId).val(allAttrs[atomId]["wkunit"]);
                }
            }

            $("#cntt" + atomId).blur(function () {
                if (!trim($(this).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
                $('#dataUnit' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
                $('#dataUnit' + atomId).attr('disabled', true);
            }
        }

        var priceTimeGenerate = function (atomId) {
            priceTimeInit(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_PRICE) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                    $("#priceTimeUnit" + atomId).val(allAttrs[atomId]["wkunit"]);
                }
            }

            $("#cntt" + atomId).blur(function () {
                if (!trim($(this).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
                $('#priceTimeUnit' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
                $('#priceTimeUnit' + atomId).attr('disabled', true);
            }

            if (acceptPrePubFlag) {
                $('#priceTimeUnit' + atomId).attr('disabled', true);
            }
        }

        var picGenerate = function (atomId) {
            var $picUpload;
            $picUpload = $([

                "<form id='upload-form"+atomId+"' method='post' enctype='multipart/form-data'>",
                "<div>",
                "<input id='onlineFileName"+atomId+"' name='onlineFileName' class='easyui-filebox' type='text'>",
                "<a href='javascript:void(0)' id='btn-upload"+atomId+"' class='btn btn-green radius  mt-l-20'>上传</a>",
                "</div>",

                "<div>",
                "<div id='upload_result"+atomId+"' class='upload-list'>",
                "</div>",

                "</div>",
                "</form>"

            ].join("")).appendTo($("#picUpload"+atomId));
            initUpload($picUpload,atomId);
            initEvent($picUpload,atomId);




            // RelevanceAttribute.pictureFileUpload([atomId]);
            // if (allAttrs && allAttrs[atomId]) {
            //     if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_PIC) {
            //         fillOldPicByAtomId(atomId);
            //         if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
            //             $("#picUpload" + atomId).show();
            //         } else {
            //             $("#picUpload" + atomId).hide();
            //         }
            //     }
            // }
            // hideExceBtn(atomId);
        }

        var LLTGenerate = function (atomId) {
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_LLT) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                }
            }

            $("#cntt" + atomId).blur(function () {
                if (!trim($(this).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            hideExceBtn(atomId);
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
            }
            //经纬度选择按钮
            $('#cntt' + atomId).attr('class', 'f-ipt fn-fl w150');
            $("#cntt" + atomId).after('<p><a class="t-btn t-btn-xs" href="javascript:void(0)" id ="gisButton">选择</span></a></p>');
            $("#cntt" + atomId).attr('readonly', true);
            $("#gisButton").on('click', function () {
                //获得窗口的垂直位置
                var iTop = (window.screen.availHeight - 30 - 500) / 2;
                //获得窗口的水平位置
                var iLeft = (window.screen.availWidth - 10 - 900) / 2;
                window.open(Util.constants.PREAJAXURL + '/src/modules/knowledgeManage/selectGis.html', '', 'height=600, width=900, top=' + iTop + ',left=' + iLeft + ',toolbar=no,resizable=no,location=no');
            });
        }

        var knwlgListGenerate = function (atomId) {
            fillOldRelationSerialByAtomId(atomId);
            if (!acceptPrePubFlag) {
                $("#selectTd" + atomId).on('click', function () {
                    if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                        new RelCatalog($('#selectTdList' + atomId), atomId);
                    }
                });
            }
            hideExceBtn(atomId);
        }

        var atomRegnGenerate = function (atomId) {
            atomRegnInit(atomId);
            hideExceBtn(atomId);
        }

        var memeoryGenerate = function (atomId) {
            memInit(atomId);
            if (allAttrs && allAttrs[atomId]) {
                if (allAttrs[atomId]["paraTypeCd"] == Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY) {
                    $("#cntt" + atomId).val(allAttrs[atomId]["cntt"]);
                    $("#memUnit" + atomId).val(allAttrs[atomId]["wkunit"]);
                }
            }

            $("#cntt" + atomId).blur(function () {
                if (!trim($(this).val()) && isHasexce(atomId)) {
                    showMessage();
                }
            });
            showExceBtn();
            if ($("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $('#cntt' + atomId).attr('disabled', false);
                $('#memUnit' + atomId).attr('disabled', false);
            } else {
                $('#cntt' + atomId).attr('disabled', true);
                $('#memUnit' + atomId).attr('disabled', true);
            }

            if (acceptPrePubFlag) {
                $('#memUnit' + atomId).attr('disabled', true);
            }
        }


        var generate = function (paraTypeCd, atomId, strongFlag) {

            if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_CHAR) {
                charTypeGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_RADIO) {
                radioGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_CHECK) {
                checkBoxGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_RICH) {
                richGenerate(atomId, strongFlag);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_TIME) {
                timePeriodGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATE) {
                dateGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATETIME) {
                dateTimeGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG) {
                knwlgGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY) {
                memeoryGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_FILE) {
                fileGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT) {
                dataUnitGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_PRICE) {
                priceTimeGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_PIC) {
                picGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_LLT) {
                LLTGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST) {
                knwlgListGenerate(atomId);
            }
            else if (paraTypeCd == Util.constants.NGKM_ATOM_DATA_TYPE_REGN) {
                atomRegnGenerate(atomId);
            }
            else {
                console.log("数据类型错误，无法回退");
            }
            if (batchFlag || $("#strong" + atomId).prev().hasClass("link-strongBlue")) {
                $("#tdcntt" + atomId).removeAttr('style');
            } else {
                $("#tdcntt" + atomId).attr('style', "background-color:#F5F5F5");
            }

            if (allAttrs && allAttrs[atomId] && allAttrs[atomId]["wrongType"]) {
                if ($("#errorWormSpan" + atomId).length < 1) {
                    $("#errorWorm" + atomId).append("<span id='errorWormSpan" + atomId + "'></span>");
                    $("#errorWormSpan" + atomId).click(function () {
                        new Dialog({
                            mode: 'confirm',
                            id: 'error',
                            content: '知识原子内容与模板原子参数类型不符：<br/>知识内容知识原子类型：' + renderDataType(allAttrs[atomId]["paraTypeCd"]) + '<br/>知识模板原子类型：' + renderDataType(paraTypeCd) + '</br>知识原子内容：' + renderAtomCntt(allAttrs[atomId]),
                            cancelDisplay: false
                        })
                    })
                }
            }
            if (acceptPrePubFlag) {
                $("#" + atomId).find("select").attr("disabled", true);
            }
        }

        var renderAtomCntt = function (allAttrs) {
            changeFlag = true;
            var nameArray = [];
            var nameString = "";
            switch (allAttrs["paraTypeCd"]) {
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
                    return allAttrs["cntt"] + "&nbsp&nbsp&nbsp单位：" + getcovData(time_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_MEMORY:
                    return allAttrs["cntt"] + "&nbsp&nbsp&nbsp单位：" + getcovData(ram_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_PRICE:
                    return allAttrs["cntt"] + "&nbsp&nbsp&nbsp单位：" + getcovData(priceOrTime_wkunit_cd)[allAttrs["wkunit"]];
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_DATAUNIT:
                    return allAttrs["cntt"] + "&nbsp&nbsp&nbsp单位：" + allAttrs["wkunit"];
                    break;
                //地区类型
                case Util.constants.NGKM_ATOM_DATA_TYPE_REGN:
                    var provnceNm;
                    Util.ajax.ajax({
                        type: "POST",
                        async: false,
                        data: {regnId: allAttrs["cntt"]},
                        url: Util.constants.AJAXURL + '/kmConfig/getTKmDistrictConfigByRegnId',
                        success: function (datas) {
                            provnceNm = datas.bean.regnNm;
                        }, error: function (datas) {
                            return;
                        }
                    });
                    return provnceNm;
                    break;
                //关联知识
                case Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG:
                    if (allAttrs != undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["relaName"]);
                        }
                    }
                    for (var i = 0; i < nameArray.length; i++) {
                        nameString = nameString + nameArray[i] + (i == nameArray.length - 1 ? '' : "</br>");
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_KNLWG_LIST:
                    if (allAttrs != undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["relaName"]);
                        }
                    }
                    for (var i = 0; i < nameArray.length; i++) {
                        nameString = nameString + nameArray[i] + (i == nameArray.length - 1 ? '' : "</br>");
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_FILE:
                    if (allAttrs != undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["fileName"]);
                        }
                    }
                    for (var i = 0; i < nameArray.length; i++) {
                        nameString = nameString + nameArray[i] + (i == nameArray.length - 1 ? '' : "</br>");
                    }
                    return nameString;
                    break;
                case Util.constants.NGKM_ATOM_DATA_TYPE_PIC:
                    if (allAttrs != undefined) {
                        for (var i in allAttrs["cntt"]) {
                            nameArray.push(allAttrs["cntt"][i]["fileName"]);
                        }
                    }
                    for (var i = 0; i < nameArray.length; i++) {
                        nameString = nameString + nameArray[i] + (i == nameArray.length - 1 ? '' : "</br>");
                    }
                    return nameString;
                    break;
            }
        }


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

        var showMessage = function () {
            new Dialog({
                mode: 'tips',
                content: '由于您清空了原子内容，该原子的例外和注解最终将不会被保存'
            });
        };

        var isHasexce = function (atomId) {
            return $("#" + atomId).last().find(".link-red").length === 0 ? false : true;
        };


        return {
            init: init,
            refresh: refresh,
            radioGenerate: radioGenerate,
            checkBoxGenerate: checkBoxGenerate,
            fileGenerate: fileGenerate,
            picGenerate: picGenerate,
            dateGenerate: dateGenerate,
            dateTimeGenerate: dateTimeGenerate,
            knwlgGenerate: knwlgGenerate,
            knwlgListGenerate: knwlgListGenerate,
            atomRegnGenerate: atomRegnGenerate,
            tmpltChangeFlag: tmpltChangeFlag,
            setAcceptPrePubFlag: setAcceptPrePubFlag
        };
    })