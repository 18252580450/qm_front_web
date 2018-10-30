/**
 * 技能配置样例
 */
define(["jquery", "loading", 'util',"transfer", "easyui", 'ztree-exedit'], function ($, Loading, Util,Transfer) {

    var  $page, $search, $skill, $skillType,checkedRows ;
    var catlId; //全局变量的节点id
    var selctTreeNode ; //当前选中的节点
    var  skillConfig = null;
    var chnlCodeNm;
    var knwlgStsNm;
    var knwlgGathrTypeNm;
    var knwlgSts_Name = "NGKM.KNOWLEDGE.STATE";  //知识状态
    var chnlCode_Name = "NGKM.TEMPLET.CHNL";  //渠道显示
    var knwlgGathrType_Name = "NGKM.KNOWLEDGE.TYPE";  //知识类型
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
        chnlCodeNm = getsysCode(chnlCode_Name);
        knwlgStsNm =  getsysCode(knwlgSts_Name);
        knwlgGathrTypeNm = getsysCode(knwlgGathrType_Name);
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
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getsysCode(codeTypeCd) {
        var result = {};
        var param ={"typeId" : codeTypeCd};
        Util.ajax.getJson(Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd", param, function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].value !== null && data[i].name !== null) {
                    result[data[i].value] = data[i].name;
                }
            }
        });
        /*$.ajax({
            url: Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== null && data[i].name !== null) {
                        result[data[i].value] = data[i].name;
                    }
                }
            }
        });*/
        console.log(result);
        return result;
    };

    /**
     *
     */
    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='overflow: auto; height:100%;'>",

            "<div data-options=\"region:'west',split:false,title:'知识目录'\" style=' overflow-y:auto;width: 200px;height: 100%'>",
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
            "</div>"
        ].join("")).appendTo($("#docEdit_published"));
    }

    /**
     * 初始化知识目录
     */
    function initMenuTree() {
        var zTreeObj;
        var id =0;
        var params ={ "id":id};

        var setting = {
           /* async: {
                dataType: "json",
                type: "GET",
                enable: true,
                url: Util.constants.CONTEXT + "/docCatalog/getCatalog",
                // url: "../../data/skill-type.json",
                //autoParam: ['id'],
                otherParam: params,
                dataFilter: filter
            },*/
            async: {
                enable: true,
                //是否开启异步加载模式
                //以下配置,async.enable=true时生效
                url: Util.constants.CONTEXT + "/docCatalog/getCatalog",//路径
                //Ajax获取数据的地址
                type: "get",
                //Ajax的http请求模式
                autoParam: ["id"],
                //异步加载时需要自动提交父节点属性的参数
                dataFilter: function(treeId, parentNode, childNodes) {//数据
                    if (!childNodes) {
                        return null
                    };
                    return childNodes.RSP.DATA;
                }
            },
            callback: {
                onClick: zTreeOnClick
            }
        };

        // 点击函数
        function zTreeOnClick(event,treeId, treeNode) {
            /*$skillType = treeNode.tId;
            console.log($skillType);*/
            catlId = treeNode.id;
            selctTreeNode = treeNode; //每次点击重新赋值
            $page.find("#skill").datagrid('load');
        };

       /* function filter(treeId, parentNode, childNodes) {
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
        }*/


       /* $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#menuTree"), setting, newNode);
            // 异步加载树.直接传rootNode异步刷新树，将无法展开rootNode。要通过如下方式获取根节点。false参数展开本节点
            zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);
        });*/
        Util.ajax.getJson(Util.constants.CONTEXT + "/docCatalog/getCatalog", params, function (datas) {
            console.log(datas);
            var treeData = datas.RSP.DATA;//数据
            zTreeObj = $.fn.zTree.init($('#menuTree'), setting, treeData);//初始化
            selctTreeNode = zTreeObj.getNodesByParam("id", "0", null)[0];//获取根节点
            zTreeObj.selectNode(selctTreeNode);//选中
            console.log(selctTreeNode);
            zTreeOnClick;
        });
       /* Util.ajax.ajax({
            type: "GET",//请求方式
            url: Util.constants.CONTEXT + "/docCatalog/getCatalog?id=0" ,//路径
            async: false,//是否异步
            success: function(datas) {//返回消息
                console.log(datas);
                var treeData = datas.RSP.DATA;//数据
                zTreeObj = $.fn.zTree.init($('#menuTree'), setting, treeData);//初始化
                selctTreeNode = zTreeObj.getNodesByParam("id", "0", null)[0];//获取根节点
                zTreeObj.selectNode(selctTreeNode);//选中
                console.log(selctTreeNode);
                zTreeOnClick;
            },
            error: function() {//请求失败
                console.log("==================================加载业务树失败！");
            }
        });*/
    }


    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([
            "<div class='panel-search'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>已发布知识管理</div>",
            "</div>",
            "<form class='form form-horizontal'>",

            // 测试渲染
            "<div class='row cl'>",
            "<label class='form-label col-2'>知识ID</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgId' data-options=\"prompt:'请输入知识ID'\" style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识标题</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgNm'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识地区</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='regnId'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>知识渠道</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='chnlCode' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>最近采编人</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' id='opPrsnId' name='opPrsnId' data-options=\"prompt:'请输入采编人'\"  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>开始时间</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-datetimebox' label='Start Date:' labelPosition='top' name='startDate' style='width:100%;height:30px'>",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>结束时间</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-datetimebox' label='Start Date:' labelPosition='top' name='startDate' style='width:100%;height:30px'>",
            "</div>",
            "<label class='form-label col-2'>采编模板</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='tmpltId'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识类型</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='knwlgGathrTypeCd'  style='width:100%;height:30px' >",
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

        $search.find('input.easyui-combobox[name="tmpltId"]').combobox({
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

        $search.find('input[name="chnlCode"]').combobox({
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + chnlCode_Name,
            method: "GET",
            // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
            valueField: 'CODEVALUE',
            textField: 'CODENAME',
            panelHeight:'auto',
            editable:false,
            loadFilter:	function(data){
                console.log("data: " + JSON.stringify(data));
                return Transfer.Combobox.transfer(data);
            }
        });
        $search.find('input[name="knwlgGathrTypeCd"]').combobox({
            url: '../../data/access-type.json',
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

       /* $search.find('input[name="combotree-async"]').combotree({
            url: '../../data/tree_data1.json',
            method: "GET",
            textField: 'text',
            panelHeight: 'auto',
            editable: false,
            onBeforeExpand: function (node, param) {    // 下拉树异步
                console.log("onBeforeExpand - node: " + node + " param: " + param);
                $('#combotree-async').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            }
        });*/

    }

    function addGridDom() {
        $skill = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fr'>",
            "<a id='batch_edit'  href='javascript:void(0)'  class='btn btn-green radius mt-l-20'>" +
            "<i class='iconfont '></i>批量更新</a>",
            "</div>",
            "</div>",
            "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>",
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fr'>",
            "<span class='checkedCountBox'>已选择（<b class='checkedCount'>0</b>）</span>",
            "<a id='createSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont '></i>更改路径</a>",
            "<a id='updateSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont '></i>批量更新</a>",
            "<a id='deleteSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont '></i>导出表格</a>",
            "<a id='deleteSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont '></i>导出页面</a>",
            "</div>",
            "</div>",
            "</div>",
        ].join("")).appendTo($page);
    }

    function initGrid() {
        $page.find("#skill").datagrid({
            columns: [[
                {field: 'ck',  checkbox:'true'},
                {field: 'operate', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='replyBtn' id ='rep"+row.fdbkId+"'>编辑路径</a>  |  "+
                            "<a href='javascript:void(0);'>更新</a>  |  "+
                            "<a href='javascript:void(0);' class='deleteBtn' id ='del"+row.fdbkId+"'>删除</a>";
                        return Action;
                    }},
                {field: 'KNWLGID', title: '知识ID', width: '10%'},
                {field: 'KNWLGNM', title: '知识标题', width: '10%'},
                {field: 'VERNO', title: '版本号',  width: '5%'},
                {field: 'REGNNM', title: '知识地区',  width: '5%'},
                {field: 'CHNLCODE', title: '知识渠道',  width: '10%',formatter : function(value, row, index) {
                        var chnlCodeNms="";
                        if (value) {
                            var chnlCodes = value.split(",");
                            for (var i=0;i<chnlCodes.length; i++){
                                chnlCodeNms+=","+chnlCodeNm[chnlCodes[i]];
                            }
                        }
                        return chnlCodeNms.length > 0 ? chnlCodeNms.substr(1) : "";
                    }},
                {field: 'OPPRSNID', title: '最近采编人', width: '7%'},
                {field: 'CRTTIME', title: '采编时间', width: '10%'},
                {field: 'MODFTIME', title: '编辑时间', width: '10%'},
                {field: 'tmplNm', title: '采编模板', width: '10%'},
                {field: 'KNWLGGATHRTYPECD', title: '知识类型', width: '8%',formatter : function(value, row, index) {
                        return knwlgGathrTypeNm[value];
                    }},
                {field: 'KNWLGSTSCD', title: '知识状态', width: '8%',formatter : function(value, row, index) {
                        return knwlgStsNm[value];
                    }},
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 50],
            rownumbers: true,
            autoRowHeight: false,
           /* onSelect: function (index, row) {
                console.log("row: " + row);
                skillConfig = row;
            },*/
            onCheck:function(index, row){
                var data = $("#skill").datagrid("getChecked");
                checkedRows = data.length;
                $(".checkedCount").text(checkedRows);
                console.log(data.length);
            },
            onUncheck :function(index, row){
                var data = $("#skill").datagrid("getChecked");
                checkedRows = data.length;
                $(".checkedCount").text(checkedRows);
                console.log(data.length);
            },
            onCheckAll   :function(index, row){
                var data = $("#skill").datagrid("getChecked");
                checkedRows = data.length;
                $(".checkedCount").text(checkedRows);
                console.log(data.length);
            },
            onUncheckAll   :function(index, row){
                var data = $("#skill").datagrid("getChecked");
                checkedRows = data.length;
                $(".checkedCount").text(checkedRows);
                console.log(data.length);
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows + 1;
                var pageNum = param.rows;
                var params = $.extend({
                    "start": start,
                    "limit": pageNum,
                    "id": catlId,
                    "sort": param.sort,
                    "order": param.order,
                    "isAll":true,
                    "isRecomd":true,
                    "v":new Date().getTime()
                }, Util.PageUtil.getParams($search));

                // if(!$.isEmptyObject(getParams($search))){
                /*$.ajax({
                    url: Util.constants.CONTEXT + "/docEditPus/getDocEditPusInfo",
                    // url: "../../data/skill-configs.json",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (result) {
                        console.log(result);
                        var data = Transfer.DataGrid.transfer(result);
                        success(data);
                        //enable查询按钮
                        $search.find("a.btn-green").linkbutton({disabled: false});

                    }
                });*/
                Util.ajax.getJson(Util.constants.CONTEXT + "/docEditPus/getDocEditPusInfo", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result)
                    success(data);
                    //enable查询按钮
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
     * 初始化全局事件
     */
    function initGlobalEvent() {
        /*
         * 查询事件
         */
        $search.on("click", "a.btn-green", function () {
          /*  if ($(this).linkbutton("options").disabled) {
                return;
            }*/
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
         * 批量修改弹出添加窗口
         */
        $page.on("click", "#batch_edit", function () {
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
         * 采编人弹出添加窗口
         */
        $("#opPrsnId").textbox('textbox').bind("click",  function () {
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


    }


    return {
        initialize: initialize
    };

});
