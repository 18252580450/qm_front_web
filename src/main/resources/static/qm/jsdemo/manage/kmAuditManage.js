/**
 * 技能配置样例
 */
require(["jquery", "loading", 'util', "easyui", 'ztree-exedit'], function ($, Loading, Util) {

    var $tree, $page, $search, $skill, $popWindow, $skillType, $skill1, $auditPeople;
    var skillId = "0", skillConfig = null;
    var $catalogTree;
    initialize();

    /**
     * 初始化
     */
    function initialize() {
        debugger;
        // 初始化 dom
        $page = $("<div></div>");
        addLayout();
        addSearchForm();
        addGridDom();
        addGridDom1();

        $page = $page.appendTo($("#form_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();

        initMenuTree();

        initSearchForm();
        initGlobalEvent();
        initGrid();
        initGrid1();
    };


    /**
     *
     */
    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

            "<div data-options=\"region:'west',split:false,title:'分类菜单'\" style='width: 200px;height: 100%'>",
            "<div class='ke-panel-content clear-overlap' style='height: 30px;'>",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-add' title='添加' href='#nogo' id='add-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-edit' title='编辑' href='#nogo' id='edit-catalog'style='cursor:pointer;'></a></li>",
            "<li><a class='clk-del' title='删除' href='#nogo' id='delete-catalog' style='cursor:pointer;'></a></li></ul>",
            "</div>",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",
            "<div data-options=\"region:'center'\" style='overflow: hidden;'>",
            "<div id='form_content' data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "<div data-options=\"region:'north'\" id='pop_window' style='display:none'>",
            "<div id='win_content' style='overflow:auto'>",
            "</div>",
            "</div>",

        ].join("")).appendTo($("#kmAuditManage"));
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
            "<label class='form-label col-2'>地区：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='regnId' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>审核流程名：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='seqprcNm'  style='width:100%;height:30px' >",
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

        $search.find("input.easyui-textbox").textbox();

        //加载所有省份
        $search.find('input[name="regionName"]').combobox({
            url: Util.constants.CONTEXT + "/district/query?codeValue=000",
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false
        });

    }


    function addGridDom() {
        $skill = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>审核记录</div>",
            "<div class='fr'>",
            "<a id='createSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>添加</a>",
            "<a id='updateSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-edit'></i>修改</a>",
            "<a id='deleteSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($page);
    }

    function getRowData(options) {
        var rowDataArr;
        $.ajax({
            //Util.constants.CONTEXT + "/district/query?codeValue=000",
            url: Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs",
            //url: "../../data/skill-type.json",
            type: "GET",
            data: options,
            dataType: "json",
            async: false,
            success: function (serviceResponse) {
                if (serviceResponse.RSP.RSP_CODE == "1") {
                    rowDataArr = serviceResponse.RSP.DATA;
                }
            }
        });
        return rowDataArr;
    }

    function loadDataByRow(options) {
        $('#skill1').datagrid('loadData', options);
    }


    //第一张表初始化
    function initGrid() {
        $page.find("#skill").datagrid({
            columns: [[
                {field: 'codeDesc', title: '审核地区', width: '50%'},
                {field: 'codeName', title: '审核流程名', width: '50%'}
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
            onClickRow: function (rowIndex, rowData) {
                var row = $('#skill').datagrid('getSelected');//获取选中行的数据
                if (row) {
                    var rowDataArr = getRowData(rowData["regionName"]);
                    loadDataByRow(rowDataArr);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows + 1;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "skillType": $skillType,//树的传参
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));//查询表单的传参

                Util.ajax.getJson(Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    success(data);

                });


            }
        });
        $page.find("a.btn").linkbutton();
    }

    function addGridDom1() {
        $skill1 = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>审核人</div>",
            "<div class='fr'>",
            "<a id='createAuditPeople'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>添加</a>",
            "<a id='updateAuditPeople'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-edit'></i>修改</a>",
            "<a id='deleteAuditPeople'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='skill1' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($page);
    }

    //第二张table初始化
    function initGrid1() {
        $page.find("#skill1").datagrid({
            columns: [[
                {field: 'skillId', title: '审核顺序', width: '25%'},
                {field: 'skillName', title: '审核类型', width: '25%'},
                {field: 'skillName', title: '审核者', width: '25%'},
                {field: 'skillName', title: '是否发短信', width: '25%'}
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
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows + 1;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "$auditPeople": $auditPeople,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));

                Util.ajax.getJson(Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    success(data);

                });

                // $.ajax({
                //     // url: Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs",
                //     url: "../../data/skill-configs.json",
                //     type: "GET",
                //     data: JSON.stringify(params),
                //     dataType: "json",
                //     success: function (data) {
                //         success(data);
                //     }
                // });

            }
        });
        $page.find("a.btn").linkbutton();
    }


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


        /*
         * 审核记录弹出添加窗口
         */
        $page.on("click", "#createSkill", function () {
            $page.find("#skill").datagrid("clearSelections");
            skillConfig = null;
            $("#win_content").show().window({
                width: 950,
                height: 400,
                modal: true,
                title: "添加审核记录"
            });

            require(["kmAuditManageAdd"], function (kmAuditManageAdd) {
                kmAuditManageAdd.initialize();
            });
        });

        /*
         * 审核记录弹出修改窗口
         */
        $page.on("click", "#updateSkill", function () {
            if (skillConfig != null) {
                $("#win_content").show().window({
                    width: 950,
                    height: 400,
                    modal: true,
                    title: "修改审核记录"
                });

                // TODO： requirejs 模块传参
                require(["configDemoAdd"], function (configDemoAdd) {
                    configDemoAdd.initialize();
                });
            }
            else {
                $.messager.alert('提示', '请选择一项服务！');
            }
        });
        $("#add-catalog").click(function () {

            alert("添加");
        });
        $("#edit-catalog").click(function () {
            //todo
            alert("修改");
        });
        $("#delete-catalog").click(function () {
            //todo
            alert("删除");
        });
        /*
         * 审核记录删除
         */
        $page.on("click", "#deleteSkill", function () {
            //把你选中的 数据查询出来。
            var selectRows = $('#skill').datagrid("getSelections");
            if (selectRows.length < 1) {
                $.messager.alert("提示消息", "请选中要删的数据!");
                return;
            };
            //真删除数据
            //提醒用户是否是真的删除数据
            $.messager.confirm("确认消息", "您确定要删除信息吗？", function (r) {
                if(row){
                    var selectedRow = $('#skill').datagrid('getSelected');  //获取选中行
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs", params, function (result) {
                        alert('删除成功');
                        $page.find("#skill").datagrid('reload');

                    });
                }
            });
        });

        /*
         * 审核人弹出添加窗口
         */
        $page.on("click", "#createAuditPeople", function () {
            $page.find("#skill").datagrid("clearSelections");
            skillConfig = null;
            $("#win_content").show().window({
                width: 950,
                height: 400,
                modal: true,
                title: "添加审核人"
            });

            require(["kmAuditManageAdd"], function (kmAuditManageAdd) {
                kmAuditManageAdd.initialize();
            });
        });


        /*
         * 审核人弹出修改窗口
         */
        $page.on("click", "#updateAuditPeople", function () {
            if (skillConfig != null) {
                $("#win_content").show().window({
                    width: 950,
                    height: 400,
                    modal: true,
                    title: "修改审核人"
                });

                // TODO： requirejs 模块传参
                require(["configDemoAdd"], function (configDemoAdd) {
                    configDemoAdd.initialize();
                });
            }
            else {
                $.messager.alert('提示', '请选择一项服务！');
            }
        });


    }

});
