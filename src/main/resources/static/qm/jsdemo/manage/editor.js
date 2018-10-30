/**
 * 富文本编辑器
 */
define(["jquery","easyui","umeditor"], function ($,easyUi) {

    var $page, $search;

    /**
     * 初始化
     */
    var initialize = function (content,atomId,editorGroup) {
        $page = $("<div></div>");
        addRating();
        $page = $page.appendTo($("#win_content"));
        initCkeditor(content,atomId,editorGroup);
    };

    /**
     * append search form
     */
    function addRating() {
        $search = $([
            // "<h1>UMEDITOR 完整demo</h1>",
            "<script type='text/plain' id='myEditor' style='width:1000px;height:350px;'>",
            "</script>",

            "<div id='btns' style='text-align:center;padding-top:20px'>",
                "<a href='#nogo' class='t-btn t-btn-sm t-btn-blue' id='editorSaveButton'>保存</a>",
                "<a href='#nogo' class='t-btn t-btn-sm ml-5' id='editorClearButton'>清空</a>",
                "<a href='#nogo' class='t-btn t-btn-sm ml-5' id='editorCancleButton'>取消</a>",
            "</div>",
        ].join("")).appendTo($page);
    }


    function initCkeditor(content,atomId,editorGroup) {
        //实例化编辑器
        var um = UM.getEditor('myEditor');
        if (content){
            um.setContent(content);
        }
        $("#win_content").dialog({
            onClose: function () {
               um.destroy();
            }
        });
        $("#editorSaveButton").click(function () {
            var newContent = um.getContent();
            $("#inputRich"+atomId).val(newContent);
            if(newContent){
                $("#rich"+ atomId).addClass("f-lk-richtext2").removeClass("f-lk-richtext");
            }
            if(!newContent){
                $("#rich"+ atomId).addClass("f-lk-richtext").removeClass("f-lk-richtext2");
            }
            editorGroup[atomId] = newContent;
            $("#win_content").dialog("close");
        });

        $("#editorClearButton").click(function () {
            um.setContent("");
        });

        $("#editorCancleButton").click(function () {
            $("#win_content").dialog("close");
        });
    }

    return {initialize: initialize}

});
