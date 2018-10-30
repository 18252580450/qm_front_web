define(["jquery", 'util', "easyui"], function ($, Util, easyui) {
    var $popWindow;//弹出框实体
    var $girdpage;//列表页面实体
    var wordId; //词条id
    var thesaWord; //词条内容
    var substituteWord; //替换词
    var rmk;  //备注
    //初始化
    var initialize = function (sensjson) {
        // console.log(urdfTabsIdParam+","+urdfTabsNameParam);
        wordId = sensjson.wordId;
        thesaWord = sensjson.thesaWord;
        substituteWord = sensjson.substituteWord;
        rmk = sensjson.rmk;
        //初始化弹框
        initPopWindow();
        //初始化数据
        initFormData();
        //初始化事件
        initWindowEvent();
    };
    ;

    // 初始化弹出窗口
    function initPopWindow() {
        $("#win_content").empty();
        $popWindow = $("<div></div>").appendTo($("#win_content"));
        //弹窗内容
        $([
            "<div class='panel-search ' >",
            "<form id='modifyTaglibForm' method='POST' class='form form-horizontal'>",
            "<div style='display:none'>",
            "<input  type='hidden' name='thesaWordId' id='thesaWordId' class='easyui-textbox'    />",
            "</div>",
            "<div class='row cl' style='width: 100%'>",
            "<label class='form-label col-2'>词条名称</label>",
            "<div class='formControls col-10' style='width: 26%'>" ,
            "<input  type='text' name='thesaWordNm' id='thesaWordNm' class='easyui-textbox' style='width:95%;height:30px' />" +
            "</div>",
            "<label class='form-label col-2'>替换词</label>",
            "<div class='formControls col-2' style='width: 26%'>",
            "<input  type='text' class='easyui-textbox'  id='substituteWord' name = 'substituteWord' style='width:90%;height:30px'/>",
            "</div>",
            "</div>",
            "<div class='row cl' style='width: 100%'>",
            "<label class='form-label col-2'>备&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注</label>",
            "<div class='formControls col-8'>",
            "<input  id='rmk' name = 'rmk' class='easyui-textbox' style='height:60px;width:99%'/>",
            "</div>",
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

    function initFormData() {
        //自动将数据填充进去
        $popWindow.find("input.easyui-textbox[id='thesaWordId']").val(wordId);
        $popWindow.find("input.easyui-textbox[id='thesaWordNm']").val(thesaWord);
        $popWindow.find("input.easyui-textbox[id='substituteWord']").val(substituteWord);
        $popWindow.find("input.easyui-textbox[id='rmk']").val(rmk);
    }

    //
    function initWindowEvent() {
        // 提交修改之后的标签名称
        $popWindow.on("click", "#global", function () {

            var params = Util.PageUtil.getParams($("#modifyTaglibForm"));
            var thesaWordId = $popWindow.find("input.easyui-textbox[id='thesaWordId']").val();
            var thesaWordNm = $popWindow.find("input.easyui-textbox[id='thesaWordNm']").val();
            var substituteWord = $popWindow.find("input.easyui-textbox[id='substituteWord']").val();
            var rmk = $popWindow.find("input.easyui-textbox[id='rmk']").val();
            var wordType = $("#wordTypeId").val();
            var wordCatl = $("#wordCatlId").val();
            //分装请求参数
            params['wordType'] = wordType;
            params['wordCatl'] = wordCatl;
            params['wordId'] = thesaWordId;
            params['wordContent'] = thesaWordNm;
            params['substituteContent'] = substituteWord;
            params['remark'] = rmk;
            //标签ID为空 说明是添加操作
            if (thesaWordId == undefined || thesaWordId == null || thesaWordId == "") {
                //如果标签名称为空 则是添加请求
                if (thesaWordNm == undefined || thesaWordNm == null || thesaWordNm == "") {
                    $.messager.alert('Warning', '标签名称不能为空！');
                    return false;
                }
                //进行添加请求
                $.ajax({
                    type: "POST",
                    data: params,
                    url: Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/insertthesaword",
                    async: false,
                    success: function (result) {
                        var flag = result.RSP.RSP_CODE;//请求返回码
                        var des = result.RSP.RSP_DESC;//请求返回描述
                        if (flag == 1) {
                            $.messager.show({
                                msg: des,
                                timeout: 1000,
                                style: {right: '', bottom: ''},
                                showType: 'slide'
                            });
                            $popWindow.find('form.form').form('clear');
                            $("#win_content").window("close");
                            $("#page_content").find("#thesaWords").datagrid("load");

                            return;
                        }
                        $.messager.alert('温馨提示', des);
                    },
                    error: function (result) {
                        console.log(result);
                        $.messager.show({
                            msg: "添加标签失败！",
                            timeout: 3000,
                            showType: 'slide'
                        });
                    }
                });

                return;
            }

            $.ajax({
                type: "POST",
                data: params,
                url: Util.constants.CONTEXT + "/kc/manage/wordsvc/msa/updatethesaword",
                async: false,
                success: function (result) {
                    //请求返回码
                    var flag = result.RSP.RSP_CODE;
                    var des = result.RSP.RSP_DESC;
                    if (flag == 1) {
                        $.messager.show({
                            msg: des,
                            timeout: 1000,
                            style: {right: '', bottom: ''},
                            showType: 'slide'
                        });
                        $popWindow.find('form.form').form('clear');
                        $("#win_content").window("close");
                        $("#page_content").find("#thesaWords").datagrid("load");
                        
                        
                        return;
                    }
                    $.messager.alert('温馨提示', des);
                },
                error: function (result) {
                    console.log(result);
                    $.messager.show({
                        msg: "修改失败",
                        timeout: 3000,
                        showType: 'slide'
                    });
                }
            });

        });

        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function () {
            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        });
    }

    return {initialize: initialize};
});
