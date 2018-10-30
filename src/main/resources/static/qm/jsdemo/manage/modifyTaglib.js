define(["jquery", 'util', "easyui"], function ($, Util, easyui) {
    var $popWindow;//弹出框实体
    var $girdpage;//列表页面实体
    var urdfTabsIdTemp;
    var urdfTabsNameTemp;
    //初始化
    var initialize = function (urdfTabsIdParam, urdfTabsNameParam) {
        // console.log(urdfTabsIdParam+","+urdfTabsNameParam);
        urdfTabsIdTemp = urdfTabsIdParam;
        urdfTabsNameTemp = urdfTabsNameParam;
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
            "<input  type='hidden' name='urdfTabsId' id='urdfTabsId' class='easyui-textbox'    />",
            "</div>",
            "<div class='row cl'>",
            "<label class='form-label col-2'>标签名称</label>" +
            "<div class='formControls col-10'><input  type='text' name='urdfTabsNm' id='urdfTabsNm' class='easyui-textbox' style='width:95%;height:30px' /></div>",
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
        //自动将数据填充进去  将标签的id和标签名称展示到input
        $popWindow.find("input.easyui-textbox[id='urdfTabsId']").val(urdfTabsIdTemp);
        // $popWindow.find('input.easyui-textbox[id="urdfTabsId"]').textbox("setValue", urdfTabsIdTemp);
        $popWindow.find("input.easyui-textbox[id='urdfTabsNm']").val(urdfTabsNameTemp);
        // $popWindow.find('input.easyui-textbox[id="urdfTabsNm"]').textbox("setValue", urdfTabsNameTemp);
    }

    //
    function initWindowEvent() {
        // 提交修改之后的标签名称
        $popWindow.on("click", "#global", function () {

            var params = Util.PageUtil.getParams($("#modifyTaglibForm"));
            var urdfTabsId = $popWindow.find("input.easyui-textbox[id='urdfTabsId']").val();
            var urdfTabsNm = $popWindow.find("input.easyui-textbox[id='urdfTabsNm']").val();
            // var urdfTabsId=$popWindow.find("input.easyui-textbox[name='urdfTabsId']").textbox("getValue");
            // var urdfTabsNm =$popWindow.find("input.easyui-textbox[name='urdfTabsNm']").textbox("getValue");
            //分装请求参数
            params['urdfTabsId'] = urdfTabsId;
            params['urdfTabsNm'] = urdfTabsNm;
            //标签ID为空 说明是添加操作
            if (urdfTabsId == undefined || urdfTabsId == null || urdfTabsId == "") {
                //如果标签名称为空 则是添加请求
                if (urdfTabsNm == undefined || urdfTabsNm == null || urdfTabsNm == "") {
                    $.messager.alert('Warning', '标签名称不能为空！');
                    return false;
                }
                //进行添加请求
                $.ajax({
                    type: "POST",
                    data: params,
                    url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/addTagLibInfo",
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
                            $("#page_content").find("#taglibGrid").datagrid("load");
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
                type: "PUT",
                data: params,
                url: Util.constants.CONTEXT + "/kc/manage/tagsvc/msa/taglib/updateTagLibInfo",
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
                        $("#page_content").find("#taglibGrid").datagrid("load");
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
