/**
 * 技能配置样例
 */
define(["jquery", 'util', "easyui"], function ($, Util) {
    var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';//参数类型
    var ram_wkunit_cd = 'NGKM.ATOM.PARAM.RAMTYPE.WKUNIT';//内存单位
    var priceOrTime_wkunit_cd = 'NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT';//价格/时间单位
    var time_wkunit_cd = 'NGKM.ATOM.PARAM.TIMES.WKUNIT';//时间单位
    var pri_serch_flag_cd = 'NGKM.ATOM.ISSEARCH.FIELD';//优先搜索项
    var $popWindow;
    var atomId;
    var atomTypeIdArr;
    var initAtomJson;
    var tKmTmpltKeyExtItem;

    /**
     * 初始化
     */
    var initialize = function (option) {
        atomTypeIdArr = [];
        atomId = option;
        initPopWindow();
        initPanelDom({
            "id": "PARATYPECD1",
            "para": para_type_cd
        });
        reloadValidatebox();
        bindAtomTypeEvent();
        initWindowEvent();
        if ( atomId != "") {
            initAtomTypeDefaultValue();
        } else {
            $('#ENDTIME').datebox('setValue', "2099-12-31");
            var currentDate = new Date().format("yyyy-MM-dd");
            $('#STARTTIME').datebox('setValue', currentDate);
        }
    };

    function initAtomTypeDefaultValue() {
        Util.ajax.putJson(Util.constants.CONTEXT + "/kc/tmplt/atomsvc/msa/updlist", {atomId: atomId}, function (data) {
            initAtomJson = data.RSP.DATA[0];

            tKmTmpltKeyExtItem = initAtomJson.kmTmpltKeyExtItemList;
            $("#createSkillConfig").form("load", initAtomJson);
            if(initAtomJson.REQUIREDFLAG==1){
                $("#requiredFlag1").attr('checked','true');
            }
            if(initAtomJson.HIDEFLAG==0){
                $("#hideFlag1").attr('checked','true');
            }
            if(initAtomJson.OUTSIDEFLAG==1){
                $("#outsideFlag").attr('checked','true');
            }
            if(tKmTmpltKeyExtItem.length>0){
                    for (var i = 0; i < tKmTmpltKeyExtItem.length; i++) {
                        tKmTmpltKeyExtItem[i].atomTypeValue = tKmTmpltKeyExtItem[i].PARATYPECD;
                        atomTypeIdArr.push(tKmTmpltKeyExtItem[i].atomTypeValue);
                        addAtomType(tKmTmpltKeyExtItem[i].atomTypeValue);
                        if(tKmTmpltKeyExtItem[i].DEFAULTVAL!= null){
                            $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "answer").val(tKmTmpltKeyExtItem[i].DEFAULTVAL);
                        }
                        if (tKmTmpltKeyExtItem[i].DEFTOPTFLAG == 1) {
                            $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "radio").prop("checked", true);
                         //   $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "radio").attr("checked", true);
                        }
                        if (tKmTmpltKeyExtItem[i].atomTypeValue == 2 || tKmTmpltKeyExtItem[i].atomTypeValue == 3) {
                            if (tKmTmpltKeyExtItem[i].OPTVAL != null) {
                                $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "input").val(tKmTmpltKeyExtItem[i].OPTVAL);
                            }
                        } else if (tKmTmpltKeyExtItem[i].atomTypeValue == 11) {
                            if (tKmTmpltKeyExtItem[i].WKUNIT != null) {
                                $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "input").val(tKmTmpltKeyExtItem[i].WKUNIT);
                            }
                        } else if (tKmTmpltKeyExtItem[i].atomTypeValue == 5 || tKmTmpltKeyExtItem[i].atomTypeValue == 9 || tKmTmpltKeyExtItem[i].atomTypeValue[12]) {
                            if (tKmTmpltKeyExtItem[i].WKUNIT != null) {
                                $("#" + tKmTmpltKeyExtItem[i].atomTypeValue + "pannel").combobox("setValue", tKmTmpltKeyExtItem[i].WKUNIT);
                            }
                        }
                    }
            }

        });


    }

    function reloadValidatebox() {
        (function ($) {
            $.extend($.fn.validatebox.defaults.rules, {
                checkNum: {
                    validator: function (value, param) {
                        return /^([0-9]+)$/.test(value);
                    },
                    message: '请输入整数'
                },
                checkFloat: {
                    validator: function (value, param) {
                        return /^[+|-]?([0-9]+\.[0-9]+)|[0-9]+$/.test(value);
                    },
                    message: '请输入合法数字'
                }
            });
        })(jQuery);
    }

    function triggerAddAtomTypeAction() {
        var atomTypeId = $("#PARATYPECD1").combobox('getValue');
        if (atomTypeId == "" || atomTypeId == "0") {
            $.messager.alert('', '请选择原子类型');
            return;
        }
        if (atomTypeIdArr.indexOf(atomTypeId) != -1) {
            $.messager.alert('温馨提示', '已添加该数据类型');
            return;
        }
        atomTypeIdArr.push(atomTypeId);
        addAtomType(atomTypeId);
    }

    function bindAtomTypeEvent() {
        $("#add").click(function () {
            triggerAddAtomTypeAction();
        });


        $("#parameterItem").on("click", ".par-tag > a", function () {
            var atomTypeId = this.id.replace("Close", "");
            if ($("#" + atomTypeId + "radio").prop("checked")) {
                $.messager.alert('温馨提示', '默认原子类型不能删除');
                return;
            }
            $("#" + atomTypeId + "para-item").remove();
            atomTypeIdArr.splice(atomTypeIdArr.indexOf(atomTypeId), 1);
        });
    }

    function initPanelDom(options) {
        var paraTypeCdUrl = Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + options.para;
        $("#" + options.id).combobox({
            url: paraTypeCdUrl,
            valueField: 'DATAVALUE',
            textField: 'DATANAME',
            loadFilter: function (datas) {
                return datas.RSP.DATA;           //返回的数据格式不符合要求，通过loadFilter来设置显示数据
            }
        });
    }

    function addAtomType(value) {
        $("#PARATYPECD1").combobox('setValue', value);
        var options = {
            "atomTypeName": $("#PARATYPECD1").combobox('getText'),
            "atomTypeValue": value,
            "textboxValue": null != initAtomJson ? initAtomJson : ""
        };
        addAtomTypeDom(options);
        if (atomTypeIdArr.length == 1) {
            $("#" + options.atomTypeValue + "radio").prop("checked", true);
        }
        addAtomTypeUnit(options);
       $("#" + options.atomTypeValue + "input").validatebox();
    }

    function addAtomTypeUnit(options) {
        if (options.atomTypeValue == "2" || options.atomTypeValue == "3") {
            $(['<label class="necessary" for=""><span style="color:red;">*</span>选项值</label>',
                '<input type="text" id="' + options.atomTypeValue + 'input" class="easyui-textbox" name="OPTVAL"  style="width:200px" title="选项值之间请用英文逗号隔开(如：张三,李四)">',
            ].join("")).appendTo("#" + options.atomTypeValue + "par-input");

            $([ '<div class="par-input formControls sn-select" id="' + options.atomTypeValue + 'defaultVal" name="DEFTOPTFLAG">',
                '<label class="necessary" for="">默认值</label>',
                '<input type="text" id="' + options.atomTypeValue + 'answer" class="easyui-textbox" name="defaultVal" style="width:200px">',
                '</div>',
             ].join("")).appendTo("#" + options.atomTypeValue + "para-item");
        } else if (options.atomTypeValue == "11") {
            $(['<label class="necessary" for=""><span style="color:red;">*</span>单位</label>',
                    '<input type="text" id="' + options.atomTypeValue + 'input" class="easyui-textbox easyui-validatebox"  data-options="prompt: \'请输入单位\',required:true,missingMessage: \'请输入单位\',validType:\'checkNum\',tipPosition:\'top\'" style="width:200px" name="' + options.atomTypeValue + 'WKUNIT">'
                ].join("")
            ).appendTo("#" + options.atomTypeValue + "par-input");
            $([ '<div class="par-input formControls sn-select" id="' + options.atomTypeValue + 'defaultVal" name="DEFTOPTFLAG">',
                '<label class="necessary" for="">默认值</label>',
                '<input type="text" id="' + options.atomTypeValue + 'answer" class="easyui-textbox" name="defaultVal" style="width:200px">',
                '</div>',
            ].join("")).appendTo("#" + options.atomTypeValue + "para-item");
        } else if (options.atomTypeValue == "12") {
            $('<label class="necessary" for=""><span style="color:red;">*</span>单位</label><div id="' + options.atomTypeValue + 'pannel" name="WKUNIT"></div>').appendTo("#" + options.atomTypeValue + "par-input");
            initPanelDom({
                "id": options.atomTypeValue + "pannel",
                "para": priceOrTime_wkunit_cd
            });
        } else if (options.atomTypeValue == "5") {
            $('<label class="necessary" for=""><span style="color:red;">*</span>单位</label><div id="' + options.atomTypeValue + 'pannel" name="WKUNIT"></div>').appendTo("#" + options.atomTypeValue + "par-input");
            initPanelDom({
                "id": options.atomTypeValue + "pannel",
                "para": time_wkunit_cd
            });
            $([ '<div class="par-input formControls sn-select" id="' + options.atomTypeValue + 'defaultVal" name="DEFTOPTFLAG">',
                '<label class="necessary" for="">默认值</label>',
                '<input type="text" id="' + options.atomTypeValue + 'answer" class="easyui-textbox" name="defaultVal" style="width:200px">',
                '</div>',
            ].join("")).appendTo("#" + options.atomTypeValue + "para-item");
        } else if (options.atomTypeValue == "9") {
            $('<label class="necessary" for=""><span style="color:red;">*</span>单位</label><div id="' + options.atomTypeValue + 'pannel"></div>').appendTo("#" + options.atomTypeValue + "par-input");
            initPanelDom({
                "id": options.atomTypeValue + "pannel",
                "para": ram_wkunit_cd
            });
        }else  if(options.atomTypeValue == "1"||options.atomTypeValue == "6"||options.atomTypeValue == "7"||options.atomTypeValue == "16"){
            $([ '<div class="par-input formControls sn-select" id="' + options.atomTypeValue + 'defaultVal" name="DEFTOPTFLAG">',
                '<label class="necessary" for="">默认值</label>',
                '<input type="text" id="' + options.atomTypeValue + 'answer" class="easyui-textbox" name="defaultVal" style="width:200px">',
                '</div>',
            ].join("")).appendTo("#" + options.atomTypeValue + "par-input");
        }
    }

    function addAtomTypeDom(options) {
        var optValHtml = $([
                '<div class="parameter-item row cl rowPadding" id="' + options.atomTypeValue + 'para-item">',
                '<div class="form-label col-2" ></div>',
                '<div class="par-tag  formControls col-2">',
                '<span>' + options.atomTypeName + '</span>',
                '<a href="javascript:void(0);" id="' + options.atomTypeValue + 'Close"></a></div>',
                '<div class="par-set formControls">',
                '<input type="radio" id="' + options.atomTypeValue + 'radio" name="optVal1">',
                '<label >默认</label></div>',
                '<div class="par-input formControls sn-select" id="' + options.atomTypeValue + 'par-input" name="DEFTOPTFLAG"></div>',
                '</div>'
               /* '<div class="par-alert text_omission" id="' + options.atomTypeValue + 'par-alert" title=""></div>'*/
            ].join("")
        ).appendTo($("#parameterItem"));
    }

    /**
     * 初始化弹出窗口事件
     */
    function initWindowEvent() {
        // 提交技能配置信息
        $popWindow.on("click", "#global", function () {
            var param = {};
            param = Util.PageUtil.getParams($popWindow);
            if (param.STARTTIME > param.ENDTIME) {
                alert("生效时间不能大于失效时间");
                return;
            }
            if (param.PARANM != null && param.PARANM.length < 1) {
                alert("原子名称不能为空");
                return;
            }

            var constructedParam = constructParam(param);
            if(document.getElementsByName("requiredFlag")[0].checked==true){
                constructedParam.REQUIREDFLAG='1';

            }
            if(document.getElementsByName("hideFlag")[0].checked==true){
                constructedParam.HIDEFLAG='0';

            }
            if(document.getElementsByName("outsideFlag")[0].checked==true){
                constructedParam.OUTSIDEFLAG='1';

            }

            if (constructedParam.kmTmpltKeyExtItemList.length < 1) {
                alert("请添加原子类型");
                return;
            }
            var typecu = "post";
            var urlcu = "/kc/tmplt/atomsvc/msa/createskillconfig";
            if (atomId != "") {
                typecu = "put"
                urlcu = "/kc/tmplt/atomsvc/msa/updateskillconfig";
            }

            $.ajax({
                url: "marathon-lb-kc.skyark.mesos:9010" + urlcu,
                type: typecu,
                data: JSON.stringify(constructedParam),
                dataType: "json",
                contentType: 'application/json;charset=utf-8',
                success: function (data) {
                    //enable按钮
                    $("#global").linkbutton({disabled: false});
                    var rsltVal = data.RSP.RSP_CODE;
                  //  var rsltMsg = data.resultMsg;
                    if (rsltVal == "1") {
                        $.messager.alert('提示', '操作成功！');
                        $("#win_content").window("close");
                        $('#tmpltKeysManage').datagrid('reload');
                    } else if (rsltVal != "1") {
                        $.messager.alert('提示', '操作失敗！');
                    } else {
                        $.messager.alert('提示', '操作成功！');
                        $popWindow.find('form.form').form('clear');
                        $("#win_content").window("close");
                        $('#tmpltKeysManage').datagrid('reload');
                    }
                }
            });
        });

        function constructParam(param) {
            var flag = true;
            var atomType2UnitJsonArr = [];
            $.each(atomTypeIdArr, function (index, atomTypeId) {
                if (atomTypeId == 2 || atomTypeId == 3) {
                    if ($("#" + atomTypeId + "input").length = 0) {
                        alert("选项值不能为空");
                        flag = false;
                    }

                } else if (atomTypeId == 2 || atomTypeId == 3 ||atomTypeId == 12) {
                    if ($("#" + atomTypeId + "pannel").length = 0) {
                        alert("单位不能为空");
                        flag = false;
                    }

                }else if(atomTypeId == 11){
                    if(!$("#11input").validatebox("isValid")) {
                        flag = false;
                    }
                }
                var defalult="input";
                if(atomTypeId==1||atomTypeId==6||atomTypeId==7||atomTypeId==16){
                    defalult="input";
                }
                var inputWkunit;
                if(atomTypeId=="11"){
                    inputWkunit= $("#" + atomTypeId +"input").val();
                }else{
                    inputWkunit=$("#" + atomTypeId + "pannel").length != 0 ? $("#" + atomTypeId + "pannel").combobox('getValue') : "";
                }
                if (atomId != "") {
                         atomType2UnitJsonArr.push({
                        "TMPLTATTRATOMID": atomId,
                        "PARATYPECD": atomTypeId,
                        "WKUNIT": inputWkunit,
                        "DEFTOPTFLAG":  $("#" + atomTypeId + "radio:checked").val() == "on" ? 1 : 0,
                        "OPTVAL": $("#" + atomTypeId + "input").length != 0 ? $("#" + atomTypeId + "input").val() : "",
                        "DEFAULTVAL": $("#" + atomTypeId + "answer").length != 0 ? $("#" + atomTypeId +"answer").val() : ""
                    });
                } else {
                    atomType2UnitJsonArr.push({
                        "PARATYPECD": atomTypeId,
                        "WKUNIT": inputWkunit,
                        "DEFTOPTFLAG":  $("#" + atomTypeId + "radio:checked").val() == "on" ? 1 : 0,
                        "OPTVAL": $("#" + atomTypeId + "input").length != 0 ? $("#" + atomTypeId + "input").val() : "",
                        "DEFAULTVAL": $("#" + atomTypeId + "answer").length != 0 ? $("#" + atomTypeId +"answer").val() : ""
                    });
                }
                  if( $("#" + atomTypeId + "radio:checked").val() == "on"){
                      param.PARATYPECD=atomTypeId;
                }
            });
            if (flag == false) {
                return;
            }
            var constructParam = {
                "PARANM": param.PARANM,
                "PARATYPECD": param.PARATYPECD,
                "GATHRCOMMENT": param.GATHRCOMMENT,
                "kmTmpltKeyExtItemList": atomType2UnitJsonArr,
                "STARTTIME": param.STARTTIME,
                "ENDTIME": param.ENDTIME,

            };
            if (atomId != "") {
                constructParam.ATOMID = atomId;
            }
            return constructParam;
        }

        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function () {
            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        });
    }

    function getDate(strDate) {
        var st = strDate;
        var a = st.split(" ");
        var b = a[0].split("-");
        var c = a[1].split(":");
        var date = new Date(b[0], b[1], b[2], c[0], c[1], c[2]);
        return date;
    }


    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {

        $("#win_content").empty();
        $popWindow = $("<div></div>").appendTo($("#win_content"));

        //技能配置表单
        var $search = $([
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold' title=''>原子基础信息</div>",
            "</div>",
            "<div class='panel-search'>",
            "<form id='createSkillConfig' method='POST' class='form form-horizontal'>",
            "<div class='row cl'>",
            "<input  type='hidden' name='ATOMID'  style='width:80%;height:30px' />",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color:red;'>*</span>原子名称</label>",
            "<div class='formControls col-8'>",
            "<input  type='text' name='PARANM' id='PARANM' class='easyui-textbox' style='width:100%;height:30px' />",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color:red;'>*</span>原子类型</label>",
            "<div class='formControls col-8'>",
            "<input  type='text' class='easyui-combobox' id='PARATYPECD1' name='PARATYPECD'  style='width:70%;height:30px' />",
            "<span><a id='add'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'> </i>添加</a></span>",
            "</div>",
            "</div>",

            "<div id='parameterItem'>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>原子描述</label>",
            "<div class='formControls col-8'>",
            "<input  type='text' class='easyui-textbox'  name='GATHRCOMMENT' id='GATHRCOMMENT'  style='width:100%;height:60px'/>",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>生效时间</label>",
            "<div class='formControls col-3'>",
            "<input  type='text'  class='easyui-datebox'  id ='STARTTIME' name='STARTTIME'  style='width:100%;height:30px'/>",
            "</div>",
            "<label class='form-label col-2'>失效时间</label>",
            "<div class='formControls col-3'>",
            "<input  type='text' id='ENDTIME' name='ENDTIME'  class='easyui-datebox' style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>其他选项</label>" +
            "<div class='formControls col-3'><input  type='checkbox'   id ='requiredFlag1' name='requiredFlag'  style='width:40%;height:30px' />必填项</div>",
            "<div class='formControls col-3'><input  type='checkbox'   id ='hideFlag1' name='hideFlag'  style='width:40%;height:30px' />禁用</div>",
            "<div class='formControls col-3'><input  type='checkbox'   id ='outsideFlag' name='outsideFlag'  style='width:40%;height:30px' />外部可见</div>",
            "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);


        $([
            "<div class='mt-10 test-c'>",
            "<label class='form-label col-5'></label>",
            "<a href='javascript:void(0)' id='global' class='btn btn-green radius  mt-l-20'  >保存</a>",
            "<a href='javascript:void(0)' id='cancel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);

        $popWindow.find("input.easyui-textbox").textbox();
        $popWindow.find("input.easyui-numberbox").numberbox();
        $popWindow.find("input.easyui-datebox").datebox();
        $popWindow.find("input.easyui-combobox").combobox();
    }
    return {initialize: initialize};
});


