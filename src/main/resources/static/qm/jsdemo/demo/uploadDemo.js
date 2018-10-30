/**
 * 技能配置样例
 */
define(["jquery", 'util', "easyui"], function ($, Util) {

    var $upload;
    var skillId = "0";
    var skillConfig = null;

    /**
     * 初始化方法
     */
    var initialize = function(){
        addUploadContent();
        initUpload();
        initEvent();
    };

    /**
     * 初始化
     */
    function addUploadContent() {
        $upload = $([

            "<form id='upload-form' method='post' enctype='multipart/form-data'>",

            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>上传示例</div>",
            "</div>",
            "<div class='panel-search'>",
            "<input id='onlineFileName' name='onlineFileName' class='easyui-filebox' type='text' style='width:400px'>",
            "<a href='javascript:void(0)' id='btn-upload' class='btn btn-green radius  mt-l-20'>上传</a>",
            "</div>",

            // "<div class='panel-tool-box cl' >",
            // "<div class='fl text-bold'>上传进度</div>",
            // "</div>",
            // "<div class='panel-search'>",
            // "<div id='p' class='easyui-progressbar' data-options='value:60' style='width:400px; height:15px;'></div>",
            // "</div>",

            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>上传结果</div>",
            "</div>",
            "<div class='panel-search'>",
            "<div id='upload_result' class='upload-list'>",
            "</div>",

            "</div>",
            "</form>"

        ].join("")).appendTo($("#yfb_tab_content"));
    }


    /**
     * 初始化组件
     */
    function initUpload(){

        $upload.find("#onlineFileName").filebox({
            buttonText: '选择文件',
            prompt: '请选择上传',
            buttonAlign: 'right'
        });

        // $upload.find("#p").progressbar({
        //     value: 60
        // });

    }


    /**
     * 初始化事件
     */
    function initEvent(){
        $upload.find("#btn-upload").on("click", function () {
            // 判空
            var params = Util.PageUtil.getParams($upload);
            console.log("params: " + params);
            if(!params['onlineFileName']){
                $.messager.alert("提示","请先选择文件");
                return;
            }

            // //$upload.find("#upload-form")
            $("#upload-form").form('submit', {
                url: Util.constants.CONTEXT + "/UploadController/onlineupload",
                method: "POST",
                dataType: "json",
                onSubmit: function(){

                },
                success: function(data){
                    if(data){
                        var result = JSON.parse(data);
                        showResult(result);
                    }else{
                        $.messager.alert("提示","操作失败！");
                    }
                },
                error: function (data) {
                    $.messager.alert("提示","操作异常！");
                }
            });
        });
    }


    /**
     * 上传结果
     */
    function showResult(result){
        var fileName = result.fileName;
        var stateFlag = Math.random() > 0.5 ? 'state-success' : 'state-fail';
        var fileType = 'file-word';
        var fileId = Math.random() > 0.5 ? '10000000001' : '10000000002';

        var $uploadResult = $([
            "<dl id='" + fileId + "'>",
            "<dd>",
            "<p>",
            "<span class='" + fileType + " floatL'>" + fileName + "</span>",
            "<a fileId='" + fileId + "' href='#' class='state " + stateFlag + " floatR'></a>",
            "</p>",
            "</dd>",
            "</dl>"
        ].join("")).appendTo($("#upload_result"));

        $("#upload_result dl dd p").find("a").click(function () {
            var fileId = $(this).attr('fileId');
            console.log("fileId: " + fileId);
            $("#" + fileId).remove();
        });
    }


    return {
        initialize: initialize
    };

});
