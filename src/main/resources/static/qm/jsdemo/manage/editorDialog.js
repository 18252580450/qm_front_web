/**
 * 富文本编辑器
 */
define(['js/manage/editor', "jquery", "easyui"], function (Editor, $) {

    var showEditor = function (content,atomId,editorGroup) {
        $("#win_content").empty();
        $("#win_content").show().dialog({
            width: 1020,
            height: 530,
            modal: true,
            title: "文本编辑器"
        });
        Editor.initialize(content,atomId,editorGroup);
    };
    return {showEditor: showEditor}
});
