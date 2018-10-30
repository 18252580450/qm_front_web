/**
 * 技能配置样例
 */
define(["jquery", 'util', "easyui"], function ($, Util) {

    var $page, $search, $skill,  $popWindow, $skillType;
    var skillId = "0", skillConfig = null;


    /**
     * 初始化
     */
    var initialize = function(){
        $page = $("<div></div>");
        addSearchForm();
        addGridDom();
        $page = $page.appendTo($("#dfb_tab_content"));

        initSearchForm();
        initGrid();
        initGlobalEvent();
    };


    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([
            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",

            // 测试表单
            "<div class='row cl'>",
            "<label class='form-label col-2'>开始时间：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='startTime' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>结束时间：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='endTime'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>技能名称：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='skillName' style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>账号状态：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='PLATFORM_ACCOUNT_STATE@CS_IR'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>接入渠道：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='ACCESS_TYPE@CS_IR'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>语音状态：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='SEAT_AUDIO_STATE'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>组合树：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-combotree' id='combotree-test' name='combotree' style='width:100%;height:30px'>",
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

        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox();
        $search.find("input.easyui-textbox").textbox();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });

        /*
         * enter键触发查询  skillName
         */
        $search.find("input.easyui-textbox").textbox({
            inputEvents: $.extend({},$.fn.textbox.defaults.inputEvents,{
                keyup: function(event){
                    if(event.keyCode == 13) {
                        $search.find("a.btn-green").click();
                    }
                }
            })
        });

        $search.find('input.easyui-combobox[name="priorityOrder"]').combobox({
            url: '../../data/skill-priority.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            missingMessage: '请选择优先级'
        });

        $search.find('input[name="PLATFORM_ACCOUNT_STATE@CS_IR"]').combobox({
            url: '../../data/account-state.json',
            method: "GET",
            // data: CRM.getEnumArr("PLATFORM_ACCOUNT_STATE@CS_IR"),
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false
        });
        $search.find('input[name="ACCESS_TYPE@CS_IR"]').combobox({
            url: '../../data/access-type.json',
            method: "GET",
            // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false
        });
        $search.find('input[name="SEAT_AUDIO_STATE"]').combobox({
            url: '../../data/seat-audio-state.json',
            method: "GET",
            // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false
        });
        $search.find('input[name="combotree"]').combotree({
            url: '../../data/tree_data1.json',
            method: "GET",
            textField: 'text',
            panelHeight:'auto',
            editable:false,
            onBeforeExpand: function (node, param) {    // 下拉树异步
                console.log("onBeforeExpand - node: " + node + " param: " + param);
                $('#combotree-test').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            }
        });
    }

    function addGridDom(){
        $skill = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>技能配置列表</div>",
            "<div class='fr'>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($page);
    }

    function initGrid(){
        $page.find("#skill").datagrid({
            columns: [[
                {field: 'skillId', title: '技能编码', width: '15%'},
                {field: 'skillName', title: '技能名称', width: '15%'},
                {field: 'priorityOrder', title: '优先级',sortable:true, width: '10%'},
                {field: 'queueMaxSize', title: '队列大小',sortable:true, width: '10%'},
                {field: 'queueTimeout', title: '队列超时',sortable:true, width: '10%'},
                {field: 'overflowSkill', title: '溢出队列', width: '15%',hidden:true},
                {field:'overflowSkillName', title:'溢出队列', width: '15%'},
                {field: 'skillDesc', title: '技能描述', width: '24%'}
            ]],
            fitColumns:true,
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 50],
            rownumbers: true,
            singleSelect: true,
            autoRowHeight: false,
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

                // if(!$.isEmptyObject(getParams($search))){
                $.ajax({
                    // url: parent.Request.get("config/query_skill_list"),
                    // url: Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs",
                    url: "../../data/skill-configs.json",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (data) {
                        success(data);
                        //enable查询按钮
                        $search.find("a.btn-green").linkbutton({disabled:false});
                    }
                });
                // } else {
                //     success({total:0,rows:[]});
                // }

            }
        });
        $page.find("a.btn").linkbutton();
    }



    /**
     * 初始化全局事件
     */
    function initGlobalEvent(){
        /*
         * 查询事件
         */
        $search.on("click", "a.btn-green", function() {
            if($(this).linkbutton("options").disabled){
                return;
            }
            $(this).linkbutton({disabled:true});
            $page.find("#skill").datagrid("load");
        });

        /*
         * 清除查询条件
         */
        $search.on("click", "a.btn-default", function() {
            $search.find('form.form').form('clear');

        });

    }


    return {
        initialize: initialize
    };

});
