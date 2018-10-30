define(["jquery", 'util', "easyui"], function ($, Util) {
    var tmpltGroupsType = 'NGKM.TMPLT.GROUP.TYPE';
    var $popWindow;
    var saveCallBack;
    var parentNode;
    //初始化
    var initialize = function(pNode,callBack){
        saveCallBack = callBack;
        parentNode = pNode;
        initPopWindow();
        initFormData();
        initWindowEvent();
    };


    // 初始化弹出窗口
    function initPopWindow() {
        $("#createGroupWin").empty();
        $popWindow = $("<div></div>").appendTo($("#createGroupWin"));
        //弹窗内容
        $([
            "<div class='panel-search'>",
            "<form id='newGroupInfoForm' method='POST' class='form form-horizontal'>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>分组名称</label>"+
            "<div class='formControls col-10'><input  type='text' name='grpngNm' class='easyui-textbox' style='width:95%;height:30px' /></div>",
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>分组属性</label>"+
            "<div class='formControls col-10'><input  type='text' class='easyui-combobox' name='grpngTypeCd'  style='width:95%;height:30px' /><span style='color:#ff1323;padding-left:2px'>*</span></div>",
            "</div>",
            "</form>",
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

    }

    function initFormData(){
        //初始化分组名称textbox
        $popWindow.find("input.easyui-textbox[name='grpngNm']").textbox();        //允许换行

        //分组类型下拉框
        $popWindow.find("input.easyui-combobox[name='grpngTypeCd']").combobox({
            url:Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/getStaticDataByTypeId?typeId="+tmpltGroupsType,
            valueField: 'DATAVALUE',
            textField: 'DATANAME',
            editable:false,
            panelHeight:'auto',
            loadFilter:function (data) {
                return data.RSP.DATA;           //通过loadFilter来设置显示数据
            }
        });
    }
    //
    function initWindowEvent() {
        // 保存
        $popWindow.on("click", "#global", function () {
            var newGroupInfo = {};
            newGroupInfo.grpngNm = $("input[name='grpngNm']").val().trim();
            newGroupInfo.grpngTypeCd = $("input[name='grpngTypeCd']").val();
            //分组名称和属性不得为空
            if(newGroupInfo.grpngNm == undefined||newGroupInfo.grpngNm ==null||newGroupInfo.grpngTypeCd==undefined||newGroupInfo.grpngTypeCd==null){
                $.messager.alert('Warning','分组名称或属性不得为空！');
                return false;
            }
            //保存分组
            newGroupInfo.name = newGroupInfo.grpngNm;
            newGroupInfo.suprGrpngId = parentNode.grpngId
            saveCallBack(newGroupInfo);

            //关闭窗口
            $("#createGroupWin").html("");
            $("#createGroupWin").window("close");
        });

        //清楚表单信息
        $popWindow.on("click", "#cancel", function() {
            $("#createGroupWin").html("");
            $("#createGroupWin").window("close");
        });
    }

    return {initialize:initialize};
});
