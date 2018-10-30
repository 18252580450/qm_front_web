/**
 * 技能配置样例
 */
define(["jquery", 'util',"transfer" , "easyui"], function ($, Util,Transfer) {

    var $page, $search, $skill,  $popWindow, $skillType;
    var skillId = "0", skillConfig = null;


    /**
     * 初始化
     */
    var initialize = function(){
        $page = $("<div></div>");
        addLayout();
        addSearchForm();
        addGridDom();
        $page = $page.appendTo($("#form_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();

        initSearchForm();
        initGrid();
        initGlobalEvent();
    };

    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

           /* "<div data-options=\"region:'west',split:false,title:'分类菜单'\" style='width: 200px;height: 100%'>",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",*/

            "<div data-options=\"region:'center'\" style='overflow: hidden;'>",
            "<div id='form_content' data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "<div data-options=\"region:'north'\" id='pop_window' style='display:none'>",
            "<div id='win_content' style='overflow:auto'>",
            "</div>",
            "</div>",

        ].join("")).appendTo($("#tab_content"));
    }




    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([
            "<div class='panel-search'>",
            "<form  class='form form-horizontal'>",

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
            "<input type='text' class='easyui-combotree' name='regnId' style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>地区</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='chnlCode'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>提交人</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='opPrsnId'  style='width:100%;height:30px' >",
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
            "<input type='text' class='easyui-combobox' name='ACCESS_TYPE@CS_IR'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>采编模板</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='SEAT_AUDIO_STATE'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>知识状态</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combotree' name='PLATFORM_ACCOUNT_STATE@CS_IR'  style='width:100%;height:30px' >",
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
            "<div class='fl text-bold'></div>",
            "<div class='fr'>",
            "<a id='fileCheckBox'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "强制解锁</a>",
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
                {field: 'knwlgId', title: '知识ID', width: '10%'},
                {field: 'tskId', title: '流水号', width: '15%'},
                {field: 'knwlgNm', title: '知识标题', width: '10%'},
                {field: 'catlNm', title: '知识路径', width: '10%'},
                {field: 'opPrsnId', title: '提交人', width: '10%'},
                {field: 'crtTime', title: '提交时间', width: '15%'},
                {field:'regnId', title:'提交城市', width: '10%'},
                {field: 'knwlgStsCd', title: '知识状态', width: '10%'},
                {field: 'setDeftFlag', title: '操作', width: '10%'},
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
                var start = (param.page - 1) * param.rows ;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "skillType": $skillType,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));

               /* $.ajax({
                    url: Util.constants.CONTEXT + "/approveTask/getNoApprovedList",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (result) {
                        var data = Transfer.DataGrid.transfer(result);
                        success(data);
                        //enable查询按钮
                        $search.find("a.btn-green").linkbutton({disabled:false});
                    }
                });*/
                Util.ajax.getJson(Util.constants.CONTEXT + "/approveTask/getNoApprovedList", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result)
                    success(data);
                    $search.find("a.btn-green").linkbutton({disabled: false});
                });

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
