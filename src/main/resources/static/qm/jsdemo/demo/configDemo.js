/**
 * 技能配置样例
 */
define(["jquery", "loading", 'util', "easyui", 'ztree-exedit'], function ($, Loading, Util) {

    var $tree, $page, $search, $skill, $popWindow, $skillType;
    var skillId = null, skillConfig = null;

    /**
     * 初始化
     */
    var initialize = function () {

        // Loading.showLoading("正在加载，请稍后");
        //
        // setTimeout(function () {
        //     Loading.destroyLoading();
        // },2000);

        // 初始化 dom
        $page = $("<div></div>");

        addLayout();
        addSearchForm();
        addGridDom();

        $page = $page.appendTo($("#form_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();

        initMenuTree();
        initSearchForm();
        initGrid();
        initGlobalEvent();
    };


    /**
     *
     */
    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

            "<div data-options=\"region:'west',split:false,title:'分类菜单'\" style='width: 200px;height: 100%'>",
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

        ].join("")).appendTo($("#cgx_tab_content"));
    }

    /**
     * 初始化分类菜单
     */
    function initMenuTree() {
        var zTreeObj;
        var setting = {

            async: {
                dataType: "json",
                type: "GET",
                enable: true,
                // url: Util.constants.CONTEXT + "/StaticValueConfig/queryStaticValue",
                url: "../../data/skill-type.json",
                autoParam: ["id", "name=n", "level=lv"],
                otherParam: {"codeType": 'SKILL_TYPE@CS_IR'},
                dataFilter: filter
            },
            callback: {
                onClick: zTreeOnClick
            }
        };

        //添加 点击函数
        function zTreeOnClick(event, treeId, treeNode) {
            $skillType = treeNode.tId;
            $page.find("#skill").datagrid('reload');
        };

        function filter(treeId, parentNode, childNodes) {
            if (!childNodes) {
                return null;
            }
            childNodes = childNodes['resultMsg'];
            if (childNodes) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    childNodes[i].name = childNodes[i].codeName.replace(/\.n/g, '.');
                    //  childNodes[i].isParent=false;
                }
            }
            return childNodes;
        }

        var newNode = {name: "技能分类", isParent: true};

        $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#menuTree"), setting, newNode);
            // 异步加载树.直接传rootNode异步刷新树，将无法展开rootNode。要通过如下方式获取根节点。false参数展开本节点
            zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);
        });
    }


    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([
            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",

            // 测试渲染
            "<div class='row cl'>",
            "<label class='form-label col-2'>技能名称：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='skillName' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>优先级别：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='priorityOrder'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>开始时间：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-datetimebox' label='Start Date:' labelPosition='top' style='width:100%;height:30px'>",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>技能名称：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='skillName' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>优先级别：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='priorityOrder'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>开始时间：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-datetimebox' label='Start Date:' labelPosition='top' style='width:100%;height:30px'>",
            "</div>",
            "</div>",

            "<br />",

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
            "<label class='form-label col-2'>组合树-异步：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-combotree' id='combotree-async' name='combotree-async' style='width:100%;height:30px'>",
            "</div>",
            "<label class='form-label col-2'>组合树-同步：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-combotree' id='combotree-sync' name='combotree-sync' style='width:100%;height:30px'>",
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

        $search.find('input[name="PLATFORM_ACCOUNT_STATE@CS_IR"]').combobox({
            url: '../../data/account-state.json',
            // data: CRM.getEnumArr("PLATFORM_ACCOUNT_STATE@CS_IR"),
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false
        });
        $search.find('input[name="ACCESS_TYPE@CS_IR"]').combobox({
            url: '../../data/access-type.json',
            // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false
        });
        $search.find('input[name="SEAT_AUDIO_STATE"]').combobox({
            url: '../../data/seat-audio-state.json',
            // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false
        });
        $search.find('input[name="combotree-sync"]').combotree({
            url: '../../data/tree_data.json',
            method: "GET",
            textField: 'text',
            panelHeight: 'auto',
            editable: false,
            loadFilter: function (data) {
                return [{
                    "id": 1,
                    "text": "My Documents",
                    "children": [{
                        "id": 11,
                        "text": "Photos",
                        "state": "closed",
                        "children": [{
                            "id": 111,
                            "text": "Friend"
                        }]
                    }, {
                        "id": 12,
                        "text": "Program Files",
                        "children": [{
                            "id": 121,
                            "text": "Intel"
                        }, {
                            "id": 122,
                            "text": "Java",
                            "attributes": {
                                "p1": "Custom Attribute1",
                                "p2": "Custom Attribute2"
                            }
                        }, {
                            "id": 123,
                            "text": "Microsoft Office"
                        }, {
                            "id": 124,
                            "text": "Games",
                            "checked": true
                        }]
                    }]
                }]

            }
        });

        $search.find('input[name="combotree-async"]').combotree({
            url: '../../data/tree_data1.json',
            method: "GET",
            textField: 'text',
            panelHeight: 'auto',
            editable: false,
            onBeforeExpand: function (node, param) {    // 下拉树异步
                console.log("onBeforeExpand - node: " + node + " param: " + param);
                $('#combotree-async').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            }
        });

    }

    function addGridDom() {
        $skill = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>技能配置列表</div>",
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

    function initGrid() {
        $page.find("#skill").datagrid({
            columns: [[
                {field: 'skillId', title: '技能编码', width: '15%'},
                {field: 'skillName', title: '技能名称', width: '15%'},
                {field: 'priorityOrder', title: '优先级', sortable: true, width: '10%'},
                {field: 'queueMaxSize', title: '队列大小', sortable: true, width: '10%'},
                {field: 'queueTimeout', title: '队列超时', sortable: true, width: '10%'},
                {field: 'overflowSkill', title: '溢出队列', width: '15%', hidden: true},
                {field: 'overflowSkillName', title: '溢出队列', width: '15%'},
                {field: 'skillDesc', title: '技能描述', width: '23%'}
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
                console.log("row: " + row);
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

                // if(!$.isEmptyObject(getParams($search))){
                $.ajax({
                    // url: Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs",
                    url: "../../data/skill-configs.json",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (data) {
                        success(data);
                        //enable查询按钮
                        $search.find("a.btn-green").linkbutton({disabled: false});
                    }
                });
                // } else {
                //     success({total:0,rows:[]});
                // }

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
         * 弹出添加窗口
         */
        $page.on("click", "#createSkill", function () {
            $page.find("#skill").datagrid("clearSelections");
            skillConfig = null;
            $("#win_content").show().window({
                width: 950,
                height: 400,
                modal: true,
                title: "添加技能配置"
            });

            require(["configDemoAdd"], function (configDemoAdd) {
                configDemoAdd.initialize({
                    "operateType": "add"
                });
            });
        });

        /*
         * 弹出修改窗口
         */
        $page.on("click", "#updateSkill", function () {
            if (skillConfig != null) {
                $("#win_content").show().window({
                    width: 950,
                    height: 400,
                    modal: true,
                    title: "修改技能配置"
                });

                // TODO： requirejs 模块传参
                require(["configDemoAdd"], function (configDemoAdd) {
                    configDemoAdd.initialize({
                        "skillId": skillConfig["skillId"],
                        "operateType": "update"
                    });
                });
            }
            else {
                $.messager.alert('提示', '请选择一项服务！');
            }
        });

    }


    return {
        initialize: initialize
    };

});
