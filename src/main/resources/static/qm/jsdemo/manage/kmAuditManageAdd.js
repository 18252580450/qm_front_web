/**
 * 技能配置样例
 */
define(["jquery", 'util', "easyui"], function ($, Util) {

    var $popWindow, $tree, $page, $search, $skill,  $popWindow, $skillType;
    var skillId = null;
    var skillConfig = null;
    var operateType = "add";


    /**
     * 初始化
     */
    var initialize = function(json){
        if(json){
            skillId = json["skillId"];
            operateType = json["operateType"];
            console.log("skillId: " + skillId);
        }

        initPopWindow();
        initWindowEvent();
    };


    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {
        $("#win_content").empty();
        $popWindow = $("<div></div>").appendTo($("#win_content"));

        //技能配置表单
        $([
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>审核记录</div>",
            "</div>",

            "<div class='panel-search'>",
            "<form id='createSkillConfig' method='POST' class='form form-horizontal'>",

            "<div style='display:none'>",
            "<input type='hidden' name='skillId' class='easyui-textbox' value='0'   />",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'>审核地区</label>",
            "<div class='formControls col-8'><input  name='skillDesc'  class='easyui-textbox' style='height:60px;width:99%'/></div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>审核流程名</label>",
            "<div class='formControls col-8'><input  name='skillDesc'  class='easyui-textbox' style='height:60px;width:99%'/></div>",
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

        if(skillConfig != null){
            delete skillConfig["overflowSkill"];
            $popWindow.find("#createSkillConfig").form("load", skillConfig);
        }

        skillConfig=null;
        $popWindow.find("input.easyui-textbox").textbox();
        $popWindow.find("input.easyui-numberbox").numberbox();
        // $popWindow.find("input.easyui-combobox").combobox();


        $popWindow.find('input.easyui-combobox[name="priorityOrder"]').combobox({
            url: '../../data/skill-priority.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            missingMessage: '请选择优先级'
        });

        $popWindow.find("a.btn").linkbutton();

        if(operateType == "update"){
            $popWindow.find("form").form("load", "../../data/skill.json");
        }else{
            // 测试代码
            $popWindow.find('input.easyui-textbox[id="skillName"]').textbox("setValue", "567");
        }
    }


    /**
     * 初始化弹出窗口事件
     */
    function initWindowEvent() {
        // 提交技能配置信息
        $popWindow.on("click", "#global", function () {
            if ($(this).linkbutton("options").disabled) {
                return;
            }

            //禁用按钮，防止多次提交
            $(this).linkbutton({disabled: true});

            var param = {};
            var a = PageUtil.getParams($popWindow);
            if ("" == a['overflowSkill']) {
                a.overflowSkill = "0";
            }
            a.skillName = a.skillName.trim();

            param.skillConfig = JSON.stringify(a);

            Util.ajax.postJson(Util.constants.CONTEXT + "/ServiceConfig/qrySkillConfigs", params, function (result) {
                $("#global").linkbutton({disabled: false});

                    var rsltVal = data.resultVal;
                    var rsltMsg = data.resultMsg;
                    if (rsltVal == "1") {
                        $.messager.alert('提示', '操作成功！');
                        $popWindow.find('form.form').form('clear');
                        $("#win_content").window("close");
                        $page.find("#skill").datagrid("load");
                    } else if (rsltMsg == "skillIdRepeat") {
                        $.messager.alert('提示', '技能编码已存在！');
                    } else {
                        $.messager.alert('提示', '操作失敗！');
                    }            });

            // $.ajax({
            //     url: Util.constants.CONTEXT + "/ServiceConfig/createSkillConfig",
            //     type: "GET",
            //     data: param,
            //     dataType: "json",
            //     success: function (data) {
            //
            //         //enable按钮
            //         $("#global").linkbutton({disabled: false});
            //
            //         var rsltVal = data.resultVal;
            //         var rsltMsg = data.resultMsg;
            //         if (rsltVal == "1") {
            //             $.messager.alert('提示', '操作成功！');
            //             $popWindow.find('form.form').form('clear');
            //             $("#win_content").window("close");
            //             $page.find("#skill").datagrid("load");
            //         } else if (rsltMsg == "skillIdRepeat") {
            //             $.messager.alert('提示', '技能编码已存在！');
            //         } else {
            //             $.messager.alert('提示', '操作失敗！');
            //         }
            //     }
            // });
        });

        /*
         * 清除表单信息
         */
        $popWindow.on("click", "#cancel", function() {
            $popWindow.find('form.form').form('clear');
            $("#win_content").window("close");
        });
    }

    return {
        initialize: initialize
    };

});
