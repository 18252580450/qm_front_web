/**
 * 技能配置样例
 */
define(["jquery", 'util', "transfer","easyui"], function ($, Util, Transfer) {

    var $page, $search, $skill, $popWindow, $skillType;
    var skillId = "0", skillConfig = null;
    var knwlgSts_Name = "NGKM.KNOWLEDGE.STATE";  //知识状态
    var approve_obj_typeCd = "NGKM.APPROVE.EMAPVOBJTYPECD";//知识类型
    var approve_result_type='NGKM.APPROVE.RESULT'; //审核状态
    var chnlCode_Name = "NGKM.TEMPLET.CHNL";  //渠道显示
    var maxLevel = 3;


    var knwlgStsNm;
    var chnlCodeNm;
    var knwlgGathrTypeNm;

    /**
     *
     *
     * 初始化
     */
    var initialize = function () {
        chnlCodeNm = getsysCode(chnlCode_Name);
        knwlgStsNm = getsysCode(knwlgSts_Name);
        knwlgGathrTypeNm = getsysCode(approve_obj_typeCd);

        // 初始化 dom
        $page = $("<div></div>");



        addSearchForm();
        addGridDom();


        $page = $page.appendTo($("#cutOff_tab_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();


        initSearchForm();
        initGrid();
        addLayout();
        initGlobalEvent();

    };
    /**
     *
     */
    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

            /*"<div data-options=\"region:'west',split:false,title:'分类菜单'\" style='width: 200px;height: 100%'>",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",*/

            "<div data-options=\"region:'center'\">",
            "<div id='form_content' data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "<div data-options=\"region:'north'\" id='pop_window' style='display:none'>",
            "<div id='win_content' style='overflow:auto'>",
            "</div>",
            "</div>",

        ].join("")).appendTo($("#cutOff_tab_content"));
    }

    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([
            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",

            // 测试表单
            "<div class='row cl'>",
            "<label class='form-label col-2'>知识ID</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgId' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>文件名称</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgNm'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>地区</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combotree' id = 'regnId' name='regnId'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>采编模板：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='tmpltId'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",



            "<div class='row cl'>",
            "<div class='formControls text-r'>" +
            "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a>",
            "<a href='javascript:void(0)' class='btn btn-default radius mt-l-20 '><i class='iconfont iconfont-zhongzuo'></i>重置</a>",
            "</div>",
            "</div>",

            "</form>",
            "</div>"
        ].join("")).appendTo($page);
    }


    function initSearchForm() {

        // $.parser.parse('form');

        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-textbox").textbox();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });
        /*
         * enter键触发查询  skillName
         */
        $search.find("input.easyui-textbox").textbox({
            inputEvents: $.extend({}, $.fn.textbox.defaults.inputEvents, {
                keyup: function (event) {
                    if (event.keyCode == 13) {
                        $search.find("a.btn-green").click();
                    }
                }
            })
        });

        $search.find('input.easyui-combobox[name="priorityOrder"]').combobox({
            // url: '../../data/skill-priority.json',
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            missingMessage: '请选择优先级',
            loader: function (param, success, error) {

                $.ajax({
                    url: '../../data/skill-priority.json',
                    dataType: 'json',
                    type: "GET",
                    data: param,
                    success: function (data) {
                        var items = $.map(data, function (item, index) {
                            return {
                                codeValue: item["codeValue"],
                                codeName: item["codeName"]
                            };
                        });
                        success(items);
                    },
                    error: function () {
                        error.apply(this, arguments);
                    }
                });
            },
            onLoadSuccess: function (data) {
                data = [
                    {
                        "codeType": "SKILL_PRIORITY@CS_IR",
                        "codeValue": "1",
                        "codeName": "高",
                        "codeDesc": "技能优先级",
                        "sortId": 0,
                        "state": "1"
                    },
                    {
                        "codeType": "SKILL_PRIORITY@CS_IR",
                        "codeValue": "4",
                        "codeName": "很低",
                        "codeDesc": "技能优先级",
                        "sortId": 0,
                        "state": "1"
                    }
                ];
            }
        });

        $search.find('input[name="regnId"]').combotree({
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getRootById?v=" + new Date().getTime(),
            method: "GET",
            //panelHeight: 'auto',
           // panelMaxHeight:"180",
            editable: false,
            loadFilter: function (datas) {
                var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                var treeJson = [];
                if (data && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var json ={};
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
            onBeforeExpand: function (node, param) {    // 下拉树异步
                $('#regnId').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/kc/configservice/kmconfig/getDistrictBySuprRegnId?maxLevel=" + maxLevel + node.id;
            },
            /*onChange:function(newValue, oldValue){
                $("#regnId").find("input[name='cntt']").val(newValue);
            }*/
        });
        $search.find('input[name="emapvObjTypeCd"]').combobox({
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getSysBytypeCd?typeId="+approve_obj_typeCd,
            method: "GET",
            valueField: 'value',
            textField: 'name',
            value:"所有",
            panelHeight: 'auto',
            editable: false,
            loadFilter:function (datas) {
                        return datas.RSP.DATA;
                   }
        });
        $search.find('input[name="tmpltId"]').combobox({
            url: Util.constants.CONTEXT + "/kc/configservice/catalog/templates/tmpltinfos",
            method: "GET",
            // data: CRM.getEnumArr("PLATFORM_ACCOUNT_STATE@CS_IR"),
            valueField: 'TMPLTID',
            textField: 'TMPLTNM',
            panelHeight: 180,
            editable: false,
            loadFilter: function (data) {
                return Transfer.Combobox.transfer(data);
            }
        });

    }
    function addGridDom() {
        $skill = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>技能配置列表</div>",
            "</div>",
            "</div>",
            "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($page);
    }

    function initGrid() {
        $page.find("#skill").datagrid({
            columns: [[
                {field: 'KNWLGID', title: '知识ID', width: '8%'},
                {field: 'TMPLTID', title: '模板名称', width: '8%',formatter: function (value, row, index) {
                        return getTmpltNm(value);
                    }},
                {field: 'KNWLGNM', title: '文件名称', sortable: true, width: '20%'},
                {field: 'REGNID', title: '知识地区', sortable: true, width: '12%',formatter: function (value, row, index) {
                        return getRegnNm(value);
                }},
                {field: 'OPPRSNID', title: '提交人', sortable: true, width: '7%'},
                {field: 'MODFTIME', title: '编辑时间', width: '12%'},
                {field: 'CHNLCODE', title: '知识渠道', sortable: true, width: '15%', formatter: function (value, row, index) {
                        var chnlCodeNms = "";
                        if (value) {
                            var chnlCodes = value.split(",");
                            for (var i = 0; i < chnlCodes.length; i++) {
                                chnlCodeNms += "," + chnlCodeNm[chnlCodes[i]];
                            }
                        }
                        return chnlCodeNms.length > 0 ? chnlCodeNms.substr(1) : "";
                    }},
                {field: 'OPPRSNID', title: '最近采编人', width: '10%'},
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='gjDocEditBtn' id ='gjEdit" + row.KNWLGID +"' tmpltId='"+row.TMPLTID+"' >割接知识操作</a>";
                        return Action;
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 50],
            rownumbers: true,
            singleSelect: true,
            autoRowHeight: false,
            onSelect: function (index, row) {
                // console.log("row: " + row);
                skillConfig = row;
            },

            loader: function (param, success) {
                var start = (param.page - 1) * param.rows ;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,

                }, Util.PageUtil.getParams($search));
                    Util.ajax.getJson(Util.constants.CONTEXT + "/kc/configservice/cuttingKnowledge/getCuttingKnowledgeList", params, function (result) {
                        var data = result.RSP.DATA;
                        var d = [];
                        for (var i = 0; i < data.length; ++i) {
                            d.push($.extend({'KNWLGID': data[i]['KNWLGID']},{'TMPLTID': data[i]['TMPLTID']},{'KNWLGNM': data[i]['KNWLGNM']}, {'REGNID': data[i]['REGNID']}, {'OPPRSNID': data[i]['OPPRSNID']}, {'MODFTIME': data[i]['MODFTIME']}, {'CHNLCODE': data[i]['CHNLCODE']}, {'OPPRSNID': data[i]['OPPRSNID']}, {'KNWLGGATHRTYPECD': data[i]['KNWLGGATHRTYPECD']}, {'KNWLGSTSCD': data[i]['KNWLGSTSCD']}, {'OPSTSCD': data[i]['OPSTSCD']}));
                        }
                        var dd = {"total": result.RSP.ATTACH.TOTAL, "rows": d};
                        success(dd);
                        /*success(data);*/
                        $search.find("a.btn-green").linkbutton({disabled: false});
                    });
                // TODO: 使用统一请求加载数据
                // Util.ajax.postJson(Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs", params, function (result) {
                //     console.log("result: " + JSON.stringify(result));
                //     success(result);
                // });
            }
        });
        $page.find("a.btn").linkbutton();
    }

    /**
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getsysCode(codeTypeCd) {
        var result = {};
        $.ajax({
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            success: function (data) {
                var list  = data.RSP.DATA;
                for (var i = 0; i < list.length; i++) {
                    if (list[i].value !== null && list[i].name !== null) {
                        result[list[i].value] = list[i].name;
                    }
                }
            }
        });
        return result;
    };
    /**
     * 根据地区ID获取地区名字
     * @param codeTypeCd
     * @returns result
     */
    function getRegnNm(codeTypeCd) {
        var regnNm;
        Util.ajax.getJson(Util.constants.CONTEXT + "/kc/configservice/kmconfig/getTKmDistrictConfigByRegnId?regnId=" + codeTypeCd, null, function (result) {
            regnNm = result.REGNNM;
        },true);
        return regnNm;
    };
    /**
     * 根据模板ID获取模板名称
     * @param codeTypeCd
     * @returns result
     */
    function getTmpltNm(codeTypeCd) {
        var tmpltNm;
        Util.ajax.getJson(Util.constants.CONTEXT + "/kc/configservice/catalog/templates/getTmpltNmById?tmpltId=" + codeTypeCd, null, function (result) {
            tmpltNm = result.RSP.DATA[0].TMPLTNM;
        },true);
        return tmpltNm;
    };
    /**
     * 初始化全局事件
     */
    function initGlobalEvent() {
        /*
         * 查询事件
         */
        $search.on("click", "a.btn-green", function () {
            if ($(this).linkbutton("options").disabled) {
                return;
            }
            $(this).linkbutton({disabled: true});
            $page.find("#skill").datagrid("load");
        });

        /*
         * 清除查询条件
         */
        $search.on("click", "a.btn-default", function () {
            $search.find('form.form').form('clear');

        });

        $page.delegate("a.gjDocEditBtn","click",function () {
            var docKnlwgId = $(this).attr("id").substr(6);
            var docTmpltId = $(this).attr("tmpltId");
            window.open("../../html/manage/docCutovermain.html?knwlgId="+docKnlwgId+"&tmpltId="+docTmpltId+"&knwlgGathrTypeCd=1");  //打开版本详情页面
        });


    }


    return {
        initialize: initialize,
    };

});