/**
 * 技能配置样例
 */
define(["jquery", 'util', "transfer","easyui"], function ($, Util, Transfer) {

    var $page, $search, $skill, $popWindow, $skillType;
    var skillId = "0", skillConfig = null;
    var knwlgSts_Name = "NGKM.KNOWLEDGE.STATE";  //知识状态
    var approve_obj_typeCd = "NGKM.APPROVE.EMAPVOBJTYPECD";//知识类型
    var approve_result_type='NGKM.APPROVE.RESULT'; //审核状态
    var maxLevel = 3;


    var knwlgStsNm;

    /**
     * 初始化
     */
    var initialize = function () {


        // 初始化 dom
        $page = $("<div></div>");



        addSearchForm();
        addGridDom();

        $page = $page.appendTo($("#hasApprove_tab_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();

        initSearchForm();
        initGrid();
        initGlobalEvent();
        knwlgStsNm = getsysCode(knwlgSts_Name);
        addLayout();

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

        ].join("")).appendTo($("#hasApprove_tab_content"));
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
            "<label class='form-label col-2'>知识标题</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgNm'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识路径</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-combotree' id='catlId' name='catlId' style='width:100%;height:30px'>",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>地区</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combotree' id = 'regnId' name='regnId'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>提交人</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' id ='opPrsnId' name='opPrsnId'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>提交时间始</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='startTime'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>提交时间终</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='endTime'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识类型</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='emapvObjTypeCd' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>审核人</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='emapvPrsn'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>审核状态</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combotree' name='tskRsltCd'  style='width:100%;height:30px' >",
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
        $search.find('input[name="emapvPrsn"]').combotree({
            render: function (item, val, $src) {
                var userName = val;
                if(!userName){
                    return "";
                }
                Util.ajax.getJson(Constants.AJAXURL + '/kmGroup/getTramsName', {emapvPrsnId: userName}, function (data) {
                    if (data.returnCode == 0) {
                        if (data.bean && data.bean != "null") {
                            userName = data.bean;
                            $src.html('<span title="' + userName + '">' + userName + '</span>');
                        }else{
                            $src.html('<span title="' + userName + '">' + userName + '</span>');
                        }
                    }
                });
            }
        });

        $search.find('input[name="regnId"]').combotree({
            url: Util.constants.CONTEXT + "/kmconfig/getRootById?v=" + new Date().getTime(),
            method: "GET",
            panelHeight: 'auto',
            panelMaxHeight:"180",
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
                $('#regnId').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/kmconfig/getDistrictBySuprRegnId?maxLevel=" + maxLevel + node.id;
            },
            /*onChange:function(newValue, oldValue){
                $("#regnId").find("input[name='cntt']").val(newValue);
            }*/
        });
        $search.find('input[name="tskRsltCd"]').combobox({
            url: Util.constants.CONTEXT + "/kmconfig/getDataByCode?typeId="+approve_result_type,
            method: "GET",
            valueField: 'data_value',
            textField: 'data_name',
            value:"1",
            panelHeight: 'auto',
            editable: false,
            loadFilter:function (data) {
                return data;
            }
        });
        $search.find('input[name="emapvObjTypeCd"]').combobox({
            url: Util.constants.CONTEXT + "/kmconfig/getDataByCode?typeId="+approve_obj_typeCd,
            method: "GET",
            valueField: 'data_value',
            textField: 'data_name',
            value:"1",
            panelHeight: 'auto',
            editable: false,
            loadFilter:function (datas) {
                        return datas;          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                   }
        });

        $search.find('input[name="catlId"]').combotree({
            url: Util.constants.CONTEXT + "/docCatalog/getCatalog?id=0&time=" + new Date().getTime(),//Ajax获取数据的地址
            method: "GET",
            textField: 'name',
            panelHeight: '180',
            autoParam:["id"],
            editable: false,
            loadFilter: function (datas) {
                /*var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
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
                return treeJson;*/
                var data;
                data = Transfer.Combobox.transfer(datas);
                if(datas.RSP.DATA[0].children){
                    data = datas.RSP.DATA[0].children;
                }else{
                    data = datas.RSP.DATA;
                }
                for(var i =0 ;i<data.length;i++ ){
                    data[i].text = data[i].name;
                    data[i].id = data[i].id;
                    if (data[i].isParent) {
                        data[i].state = 'closed';
                    }
                }
                return data;
            },
            onBeforeExpand: function (node, param) {    // 下拉树异步
               // if(node.id!="0"){
                    $('#catlId').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/docCatalog/getCatalog?id=" + node.id;
              //  }

                //$(this).tree('options').url = Util.constants.CONTEXT + "/catalogs/subs/"+node.id;
            },
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
                {field: 'knwlgId', title: '知识ID', width: '8%'},
                {field: 'tskId', title: '流水号', width: '15%'},
                {field: 'knwlgNm', title: '知识标题', sortable: true, width: '8%'},
                {field: 'catlNm', title: '知识路径', sortable: true, width: '15%'},
                {field: 'opPrsnId', title: '提交人', sortable: true, width: '8%'},
                {field: 'crtTime', title: '提交时间', width: '10%'},
                {field: 'regnNm', title: '提交城市', width: '10%'},
                {field: 'emapvPrsn', title: '审核人', width: '8%'},
                {
                    field: 'knwlgStsCd', title: '知识状态', width: '8%', formatter: function (value, row, index) {
                        return knwlgStsNm[value];
                    }
                },
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        /*var param ={
                            tskId:row.object.tskId,
                            verno:row.object.verno,
                            knwlgId:row.object.knwlgId,
                            timestamp:row.object.crtTime
                        };
                        console.log(param);*/
                        var Action = "<a  href='javascript:void(0);' class='replyBtn' id ='rep" + row.knwlgId +"_"+row.verno +"_"+row.tskId +"_"+row.crtTime + "'>查看轨迹</a>";
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
                var start = (param.page - 1) * param.rows + 1;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "skillType": $skillType,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));
                    Util.ajax.getJson(Util.constants.CONTEXT + "/approveTask/getApprovedList", params, function (result) {
                        var data = Transfer.DataGrid.transfer(result)
                        success(data);
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
            url: Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== null && data[i].name !== null) {
                        result[data[i].value] = data[i].name;
                    }
                }
            }
        });
        return result;
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

        //绑定查询轨迹按钮事件
        $page.on("click", ".replyBtn", function () {
            var thisDelBtn = $(this);
            var param = thisDelBtn.attr('id').substr(3);
            var paramaster = param.split("_");

            //var obj_paramaster = JSON.parse(paramaster);
            var obj_paramaster = {"knwlgId": paramaster[0], "verno": paramaster[1], "tskId": paramaster[2], "crtTime": paramaster[3]};

            $page.find("#skill").datagrid("clearSelections");
            skillConfig = null;
            $("#win_content").show().window({
                width: 950,
                height: 500,
                modal: true,
                title: "查询轨迹"
            });
                require(["getApprovedLocus"], function (getApprovedLocus) {

                    getApprovedLocus.initialize(obj_paramaster);
                 });
        });

    }


    return {
        initialize: initialize,
    };

});