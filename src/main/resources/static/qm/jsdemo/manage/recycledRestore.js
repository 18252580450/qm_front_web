/**
 * 技能配置样例
 */
define(["jquery", 'util',"catalogTemplateInteractive", "easyui"], function ($, Util,Interactive) {
    var $popWindow;
    //	知识标题
    var knwlgNm;
    var knwlgId;

    /**
     * 初始化
     */
    var initialize = function (Nm,Id) {

        knwlgNm = Nm;
        knwlgId = Id;
        initPopWindow();
        initWindowEvent();

    };



    var trim = function(str){
        if(str){
            return str.replace(/(^\s*)|(\s*$)/g, "");
        }
    };

    /**
     * 初始化弹出窗口事件
     */
    function initWindowEvent() {

        // 提交
        $popWindow.on("click", "#submit", function () {

                var knwlgNm = $("#knwlgNmRestore").val();

                // if(!validator.form()){
                //     // $("#knwlgNmRestore").find("input[name=knwlgNm]").focus().blur();
                //     return false;
                // }
                //失效时间的标志
                var InvldTimeFlag = $("#chooseTime").attr("InvldTimeFlag");
                //获取单选按钮的val
                var restoreCatl = $("input[name=restoreCatl]:checked").val();
                //获取失效时间
                var knwlgInvldTime = $("input[name=knwlgInvldTime]").val();
                //获取下拉框的值
                var restoreCatlId = $("input[name=restoreCatlId]").val();
                var paramdata;
                if(InvldTimeFlag == "0"){//达到失效进入回收站
                    if(knwlgInvldTime == null ||knwlgInvldTime == ''||knwlgInvldTime == undefined){
                        $.messager.alert('失效时间提示','请选择失效时间！');

                        return false;
                    }
                }
                if(restoreCatl != "0"){//还原到新路径
                    if(restoreCatlId == null ||restoreCatlId == ''||restoreCatlId == undefined){
                        $.messager.alert('新路径提示','请选择新路径！');
                        return false;
                    }
                }
                if(knwlgInvldTime == null ||knwlgInvldTime == ''||knwlgInvldTime == undefined){
                    paramdata ={knwlgId:knwlgId, restoreCatl:restoreCatl, catlId:restoreCatlId, knwlgNm: knwlgNm};
                }else if(restoreCatlId == null ||restoreCatlId == ''||restoreCatlId == undefined){
                    paramdata ={knwlgId:knwlgId, knwlgInvldTime:knwlgInvldTime, restoreCatl:restoreCatl,  knwlgNm: knwlgNm};
                }else{
                    paramdata ={knwlgId:knwlgId, knwlgInvldTime:knwlgInvldTime, restoreCatl:restoreCatl, catlId:restoreCatlId,  knwlgNm: knwlgNm};
                }

            Util.ajax.putJson(Util.constants.CONTEXT + "/recycled/restoreRecycledById", paramdata, function (result) {
                if(result.RSP.RSP_CODE == "1"){
                    $.messager.alert('还原提示',''+result.RSP.RSP_DESC);
                    $popWindow.find("#restoreRecycle").form("clear");
                    $("#win_content").window("close");
                    $("#skillTable").datagrid("load");
                }


            });


        });
        $popWindow.find('input[name="restoreCatlId"]').combotree({
            //
            // url: '../../data/tree_data1.json',
            // method: "GET",
            // textField: 'text',
            // panelHeight: 'auto',
            // editable: false,
            // onBeforeExpand: function (node, param) {    // 下拉树异步
            //     console.log("onBeforeExpand - node: " + node + " param: " + param);
            //     $('#restoreCatlId').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            // }

            // url: Util.constants.CONTEXT + '/docCatalog/getCatalog?id='+0,
            // method: "GET",
            // textField: 'text',
            // panelHeight:'auto',
            // editable:false,
            // onBeforeExpand: function (node, param) {    // 下拉树异步
            //     $('#restoreCatlId').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/docCatalog/getCatalog?id=" + node.id;
            // }
        });

        var regionList = Interactive.getSuitableOfTreeList();
        var regionNodes = [];
        $.each(regionList, function (index, region) {
            regionNodes.push({
                "id": region.id,
                "text": region.name
            });
        });
        var regionTree = {
            "id": "0",
            "text": "业务树",
            "state": "open",
            "children": regionNodes
        };

        initSuitableRegionComboTree(regionTree);
        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function () {
            $popWindow.find("#restoreRecycle").form("clear");
            $("#win_content").window("close");
            $("#skillTable").datagrid("load");
        });

        /*
        * 绑定清除选择还原路径事件
       */
        $(".combo_footer").on("click", "#clearSelectRegion", function () {
            $popWindow.find('#restoreCatlId').combotree("clear");
            $popWindow.find('#restoreCatlId').combotree("hidePanel");
        });
    }

    function initSuitableRegionComboTree(regionTree) {
        $popWindow.find("input.easyui-combotree").combotree({
            // url: Util.constants.CONTEXT + "district/getSuitableOfDistrictList",
            // queryParams: {"id":0},
            method: "GET",
            animate: true,
            lines: true,
            textField: 'json',
            panelHeight: 120,
            editable: true,
            // loadFilter: function (data, parent) {
            //     return data;
            // },
            loader: function (param, success, error) {
                success([regionTree]);
            }
        });
        var panel = $popWindow.find('#restoreCatlId').combotree("panel");
        panel.after($("<div class='combo_footer' align='center'><a href='javascript:void(0)' id='clearSelectRegion' class='treeButton radius  mt-l-20' >清除</a></div>"));
    }

    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {

        $("#win_content").empty();
        $popWindow = $("<div></div>").appendTo($("#win_content"));

        //技能配置表单
        var $search = $([
            "<div class='panel-search'>",
            "<form id='restoreRecycle' method='POST' class='form form-horizontal'>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>知识标题</label>",
            "<div class='formControls col-8'>",
            "<input  type='text' name='knwlgNm' id='knwlgNmRestore' class='easyui-textbox' value='"+knwlgNm+"' style='width:80%;height:30px' />",
            "</div>",
            "</div>",

            "<div class='row cl' id='chooseTime' <!--style='display: none'-->>",
            "<label class='form-label col-2'>选择失效时间</label>",
            "<div class='formControls col-8'>",
            "<input  type='text'  class='easyui-datetimebox'  id ='knwlgInvldTime' name='knwlgInvldTime' value='${notices.release_time}'   style='width:80%;height:30px'/>",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>选择还原路径</label>" +
            "<div class='formControls col-8'><input   type='radio'   id ='restoreCatl1' name='restoreCatl' value='0' checked='checked'  style='width:10%;height:30px' />&nbsp;&nbsp;还原到原路径&nbsp;&nbsp;" +
            "<span id='knwlg_tip_info'  style='display:none;width:51%;height:30px;'>（知识原路径已被删除，请重新选择新路径）</span></div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'></label>" +
            "<div class='formControls col-8'><input   type='radio'   id ='restoreCatl2' name='restoreCatl' value='1'  style='width:10%;height:30px' />重新选择新路径&nbsp;&nbsp;" +
            "<input type='text' id='restoreCatlId' class='easyui-combotree' name='restoreCatlId' style='width:51%;height:30px' >" +
            "</div>",

            "</form>",
            "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);


        $([
            "<div class='mt-10 test-c'>",
            "<label class='form-label col-5'></label>",
            "<a href='javascript:void(0)' id='submit' class='btn btn-green radius  mt-l-20'  >提交</a>",
            "<a href='javascript:void(0)' id='cancel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);

        $popWindow.find("input.easyui-textbox").textbox();
        $popWindow.find("input.easyui-datetimebox").datetimebox();
        $popWindow.find("input.easyui-combotree").combotree(/*{
            url: '../../data/tree_data1.json',
            method: "GET",
            textField: 'text',
            panelHeight: 'auto',
            editable: false,
            onBeforeExpand: function (node, param) {    // 下拉树异步
                console.log("onBeforeExpand - node: " + node + " param: " + param);
                $('#restoreCatlId').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
            }
        }*/);



    }
    return {initialize: initialize};
});


