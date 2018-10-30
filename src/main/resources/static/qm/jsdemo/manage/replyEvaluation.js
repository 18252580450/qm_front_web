define(["jquery", 'util', "easyui"], function ($, Util) {
    var isEvaluationValid = 'NGKM.FDBK.EVALU.ISVALID';
    var $popWindow;
    var fdbkId;
    //初始化
    var initialize = function(fdbkIdParam){
        fdbkId = fdbkIdParam;
        initPopWindow();
        initFormData();
        initWindowEvent();
    };


    // 初始化弹出窗口
    function initPopWindow() {
        $("#win_content").empty();
        $popWindow = $("<div></div>").appendTo($("#win_content"));
        //弹窗内容
        $([
            "<div class='panel-search'>",
            "<form id='replyEvalution' method='POST' class='form form-horizontal'>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>评价标题</label>"+
            "<div class='formControls col-8'><input  type='text' name='FDBKTITLENM' class='easyui-textbox' style='width:95%;height:30px' /></div>",
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>评价分数</label>"+
            "<div class='formControls col-8'><input  name='OPTCNTT'  class='easyui-textbox' style='height:30px;width:95%'/></div>" +
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>评价内容</label>"+
            "<div class='formControls col-8'><input  name='FDBKCNTT'  class='easyui-textbox' style='height:60px;width:95%'/></div>" +
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>是否有效</label>"+
            "<div class='formControls col-8'><input  type='text' class='easyui-combobox' name='dspsRsltCd'  style='width:95%;height:30px' /><span style='color:#ff1323;padding-left:2px'>*</span></div>",
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>回复内容</label>"+
            "<div class='formControls col-8'><input  name='rplCntt'  class='easyui-textbox' style='height:60px;width:95%'/><span style='color:red;padding-left:2px'>*</span></div>" +
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
        //获取评价信息
        Util.ajax.getJson(Util.constants.CONTEXT + "/feedback/feedbackinfo", {fdbkId: fdbkId}, function(result){
            $popWindow.find("a.btn").linkbutton();
            $popWindow.find("input.easyui-textbox[name='FDBKTITLENM']").textbox({disabled: true});
            $popWindow.find("input.easyui-textbox[name='OPTCNTT']").textbox({disabled: true});
            $popWindow.find("input.easyui-textbox[name='FDBKCNTT']").textbox({disabled: true,multiline : true});         //设置textBox不可编辑
           $popWindow.find("#replyEvalution").form("load", (result.RSP.DATA)[0]);                                           //自动将数据填充进去
        });

        //是否有效下拉框
        $popWindow.find("input.easyui-combobox[name='dspsRsltCd']").combobox({
            url:Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId="+isEvaluationValid,
            valueField: 'CODEVALUE',
            textField: 'CODENAME',
            editable:false,
            panelHeight:'auto',
            loadFilter:function (result) {
                return result.RSP.DATA;
            }
        });
        //初始化replyText输入框
        $popWindow.find("input.easyui-textbox[name='rplCntt']").textbox({multiline : true});        //允许换行
    }
    //
    function initWindowEvent() {
        // 提交评价回复
        $popWindow.on("click", "#global", function () {
            var params = Util.PageUtil.getParams($("#replyEvalution"));
            params['fdbkId'] = fdbkId;
            //是否有效和回复内容不得为空
            if(params.dspsRsltCd == undefined||params.dspsRsltCd ==null||params.rplCntt==undefined||params.rplCntt==null){
                $.messager.alert('Warning','标*内容不得为空！');
                return false;
            }
            Util.ajax.postJson(Util.constants.CONTEXT + "/feedback/feedbackreply", params, function (result) {
                $.messager.show({
                    msg:'保存成功',
                    timeout:1000,
                    style:{ right:'',bottom:''},
                    showType:'slide'
                });
                $popWindow.find('form.form').form('clear');
                $("#win_content").window("close");
            },true);           //true：同步，false:异步
        });

        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function() {
            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        });
    }

    return {initialize:initialize};
});
