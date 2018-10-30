/**
 * 技能配置样例
 */
require(["jquery", 'util', 'transfer', 'recycledRestore','js/homePage/validator/validator'], function ($, Util, Transfer, RecycledRestoreTpl,Validator) {

    var $page, $search, $skill, $skillType;
    var skillId = "0", skillConfig = null;
    var knwlgGathrType_Name = "NGKM.KNOWLEDGE.TYPE";  //知识类型

    initialize();

    /**
     * 初始化
     */
    function initialize() {

        // 初始化 dom
        $page = $("<div></div>");

        addLayout();
        addSearchForm();
        addGridDom();

        $page = $page.appendTo($("#recycled_manage"));//appendTo() 方法在被选元素的结尾插入 HTML 元素。
        $(document).find("#win_content").layout();
        initSearchForm();
        initGrid();
        initGlobalEvent();
    };


    function addLayout() {
        var $layout = $([

            "<div id='win_content' style='overflow:auto'>"


        ].join("")).appendTo($("#recycled_manage"));
    }

    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([

            "<div class='panel-search'>",
            "<div class='text-bold'>回收站知识信息查询</div>",
            "<form class='form form-horizontal'>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>知识ID：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgId' data-options=\"prompt:'请输入知识ID'\"  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识标题：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' name='knwlgNm'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>删除人：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-textbox' id='opPrsnId' name='opPrsnId'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            // 测试表单
            "<div class='row cl'>",
            "<label class='form-label col-2'>开始时间：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='timeStart' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>结束时间：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-datetimebox' name='timeEnd'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>知识类型：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' class='easyui-combobox' name='knwlgGathrTypeCd' style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>目录树：</label>",
            "<div class='formControls col-2'>",
            "<input class='easyui-combotree' id='combotree-async' name='catlId' style='width:100%;height:30px'>",
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
        $search.find("input.easyui-datetimebox").datetimebox();
        $search.find("input.easyui-textbox").textbox();


        /**
         *知识类型 下拉框
         */
        $search.find('input[name="knwlgGathrTypeCd"]').combobox({
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + knwlgGathrType_Name,
            method: "GET",
            valueField: 'CODEVALUE',
            textField: 'CODENAME',
            panelHeight: 'auto',
            editable: false,
            loadFilter: function (datas) {
                return Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
            }
        });


        /**
         *目录树  组合树
         */

        $search.find('input[name="catlId"]').combotree({
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
            "<div class='fr'>",
            "<a id='restorSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>还原</a>",
            /*"<a id='updateSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-edit'></i>修改</a>",*/
            "<a id='deleteSkill'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='skillTable' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($page);
    }

    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $page.find("#skillTable").datagrid({
            columns: [[
                {field: 'checkBox', title: '复选框', width: '5%', checkbox: 'true', align: 'center', halign: 'center'},
                {field: 'knwlgId', title: '知识ID', width: '15%'},
                {field: 'knwlgNm', title: '知识标题', width: '15%'},
                {field: 'typeNm', title: '知识类型', width: '15%'},
                {field: 'crtTime', title: '编辑时间', width: '15%'},
                {field: 'opPrsnId', title: '删除人', width: '15%'},
                {field: 'opRsnCntt', title: '删除原因', width: '10%'},
                {
                    field: 'action', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='showBtn' name='editor' knwlgId=" + row.knwlgId + " verno=" + row.verno + "'>查看</a>  |  " +
                            "<a href='javascript:void(0);' class='cd_deleteBtn' id ='del" + row.knwlgId + "'>彻底删除</a>";
                        return Action;
                    }

                }
            ]],
            fitColumns: true,//设置为 true，则会自动扩大或缩小列的尺寸以适应网格的宽度并且防止水平滚动。
            width: '100%',
            height: 420,
            pagination: true,//设置为 true，则在数据网格（datagrid）底部显示分页工具栏。
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,//设置为 true，则显示带有行号的列。
            autoRowHeight: false,//定义是否设置基于该行内容的行高度。设置为 false，则可以提高加载性能。
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: false,
            selectOnCheck: true,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#evaluManage").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#evaluManage").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "skillType": $skillType,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));

                Util.ajax.getJson(Util.constants.CONTEXT + "/recycled/getRecycledKnwlgList", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result)
                    console.error(data);
                    success(data);
                    //enable查询按钮
                    $search.find("a.btn-green").linkbutton({disabled: false});
                });


            }
        });
        $page.find("a.btn").linkbutton();
    }

    /**
     * 还原
     * @param knwlgNm
     */
    function restore(knwlgNm, knwlgId) {


        $('#skillTable').datagrid("clearSelections");

        $("#win_content").show().window({
            width: 950,
            height: 400,
            modal: true,
            title: "知识还原"
        });
        // var validConfig = {
        //     dialog:true,
        //     rules: {
        //         knwlgNm: 'required|repeat'
        //     },
        //     messages: {
        //         knwlgNm: {
        //             repeat: '知识名称重复',
        //             required: '请输入知识标题'
        //         }
        //     }
        // };

        // var validator;
        //
        // validConfig.el = $("#restoreRecycle");
        // // validator =Validator.a1(validConfig);
        // window.vv=validator;
        // validator.addMethod("repeat", function(str){
        //     var flag = true;
        //     var params = {
        //         "knwlgId":knwlgId,
        //         "knwlgNm":knwlgNm
        //     }
        //     Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocEdit/checkKnwlgNm", params, function (result) {
        //             var f = result.RSP.RSP_DESC;
        //             if(f != 0){
        //                 flag = false;
        //             }
        //
        //     });
        //     return flag;

        //
        //     // Util.ajax.getJson(Constants.AJAXURL + "/kmDocEdit/checkKnwlgNm",{knwlgNm: str},function (data) {
        //     //     if(data.returnCode != 0){
        //     //         flag = false;
        //     //     }
        //     // },true);
        //     // return flag;
        // });

        RecycledRestoreTpl.initialize(knwlgNm, knwlgId);

    }

    /**
     * 查看
     * @param items
     */
    function openArticeDetail(items) {
        $("#win_content").empty();
        $("#win_content").show().window({
            width: 950,
            height: 400,
            modal: true,
            title: "查看知识"
        });

    }

    /**
     * 是否达到失效时间
     * @param modfTime
     * @param knwlgInvldTime
     */
    function attainInvldTime(modfTime, knwlgInvldTime) {
        //modfTime 知识进入回收站时间
        //knwlgInvldTime 知识失效时间
        if (knwlgInvldTime == null || knwlgInvldTime == '' || knwlgInvldTime == undefined) {//如果失效时间为空，则标识知识不会失效
            $("#chooseTime").hide();
            $("#chooseTime").attr("InvldTimeFlag", "1");
        } else {
            if (modfTime > knwlgInvldTime) {//知识是由于达到时间时间进入回收站的

                $("#chooseTime").show();
                $("#chooseTime").attr("InvldTimeFlag", "0");

            } else {
                $("#chooseTime").hide();
                $("#chooseTime").attr("InvldTimeFlag", "1");
            }
        }
    }

    /**
     * 判断知识原路径是否存在
     * @param e
     * @param item
     */
    function checkCatExist(knwlgId) {
        var params = {
            knwlgId: knwlgId
        }
        Util.ajax.getJson(Util.constants.CONTEXT + "/recycled/checkCatExist", params, function (result) {
            if (result.RSP.ATTACH.TOTAL > 0) {//表示原路径存在
                $("input[name=restoreCatl]").eq(1).attr("disabled", "disabled");
                // $("#restoreCatlId").attr("display","none");
            } else {//表示原路径不存在
                $("#knwlg_tip_info").show();
                // $("#restoreRecycle #chooseUrl ul li:first-child").css("color","#CCC");
                $("input[name=restoreCatl]").eq(0).attr("disabled", "disabled");
                $("input[name=restoreCatl]").removeAttr("checked");
                $("input[name=restoreCatl]").eq(1).prop("checked", "checked");
            }
        });

    }


    /**
     * 初始化全局事件
     */
    function initGlobalEvent() {
        /*
         * 查询事件
         */
        $search.on("click", "a.btn-green", function () {
            /* if($(this).linkbutton("options").disabled){
                 return;
             }
             $(this).linkbutton({disabled:true});*/
            $page.find("#skillTable").datagrid("load");
        });

        /*
         * 清除查询条件
         */
        $search.on("click", "a.btn-default", function () {
            $search.find('form.form').form('clear');

        });
        //查看
        $page.on('click', 'a.showBtn', function () {
            var knwlgId = $(this).attr('knwlgId');
            var verno = $(this).attr('verno');
            var items = {
                knwlgId: knwlgId,
                verno: verno
            }
            openArticeDetail(items);

        });

        //绑定彻底删除按钮事件
        $page.on("click", "a.cd_deleteBtn", function () {
            var thisDelBtn = $(this);
            $.messager.confirm('确认彻底删除弹框', '知识删除后将无法还原，确定彻底删除这条知识吗', function (r) {
                if (r) {
                    var atomId = thisDelBtn.attr('id').substr(3);


                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/recycled/deleteRecycledById?atomId=" + atomId, " ", function (result) {
                        $.messager.alert('删除提示', '' + result.RSP.RSP_DESC);
                        $page.find("#skillTable").datagrid("load");
                    });


                } else {
                    $.messager.show({
                        title: '删除提示',
                        msg: '删除失败',
                        timeout: 5000,
                        showType: 'slide'
                    });
                }
            });
        });

        //批量删除原子
        $page.on("click", "#deleteSkill", function () {
            var ids = [];
            var rows = $('#skillTable').datagrid('getSelections');
            if (rows.length == 0) {
                $.messager.alert('批量删除提示', '请选择您要删除的回收站信息！');
                return false;
            }
            for (var i = 0; i < rows.length; i++) {
                ids += rows[i].knwlgId + ",";
            }

            $.messager.confirm('批量删除提示', "知识删除后将无法还原，确定彻底删除这" + rows.length + "条知识吗", function (r) {
                if (r) {

                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/recycled/deleteRecycledByIds?atomIds=" + ids, function (result) {
                        $.messager.alert('删除提示', '' + result.RSP.RSP_DESC);
                        $page.find("#skillTable").datagrid("load");
                    });


                } else {
                    $.messager.show({
                        title: '删除提示',
                        msg: '删除失败',
                        timeout: 5000,
                        showType: 'slide'
                    });
                }
            });

        });

        //还原
        $page.on('click', '#restorSkill', function () {
            var rows = $('#skillTable').datagrid('getSelections');
            if (0 == rows.length) {
                $.messager.alert('还原提示', "请选择您要还原的知识信息！");
                return;
            }
            if (rows.length > 1) {
                $.messager.alert('还原提示', "每次只能还原一条知识信息！");
                return;
            }
            var knwlgId = rows[0].knwlgId;
            var modfTime = rows[0].crtTime;
            var knwlgInvldTime = rows[0].knwlgInvldTime;
            var knwlgNm = rows[0].knwlgNm;
            //调用还原函数
            restore(knwlgNm, knwlgId);
            attainInvldTime(modfTime, knwlgInvldTime);//是否达到失效时间
            checkCatExist(knwlgId);//判断知识原路径是否存在
        });





        /*
         * 删除人 弹出添加窗口
         */
        $("#opPrsnId").textbox('textbox').bind("click", function () {

            $page.find("#skillTable").datagrid("clearSelections");
            skillConfig = null;
            $("#win_content").show().window({
                width: 950,
                height: 400,
                modal: true,
                title: "添加技能配置"
            });

            require([ConfigDemoAdd], function (configDemoAdd) {
                configDemoAdd.initialize();
            });

        });


    }

});
