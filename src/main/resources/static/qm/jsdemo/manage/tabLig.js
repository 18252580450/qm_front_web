define(["jquery", 'util', "easyui","js/manage/taglibManagement"], function ($, Util,easyUi,taglibManagement) {

    var $popWindow;

    /**
     * 初始化
     */
    var initialize = function($name, $value, provnce, catlId, flag, knwlgId, dataList, refrshParam){
        initPopWindow();
        initWindowEvent();
    };

    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {
        $("#win_content").empty();
        $popWindow = $("<div style = 'width:100%;height: 100%;border:none'></div>").appendTo($("#win_content"));
        $([
            "<div data-options=\"region:'west',split:true,title:'标签库目录'\" style=\"width: 235px;\">",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-add' title='添加' href='#nogo' id='add-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-edit disabled' title='编辑' href='#nogo' id='edit-catalog'style='cursor:pointer;'></a></li>",
            "<li><a class='clk-del disabled' title='删除' href='#nogo' id='delete-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-up disabled' title='上移' href='#nogo' id='moveUp-catalog' style='cursor:pointer;'></a> </li>",
            "<li><a class='clk-down disabled' title='下移' href='#nogo' id='moveDown-catalog' style='cursor:pointer;'></a></li></ul>",

            "</div>",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",
            "</div>",

            "<div data-options=\"region:'center'\" style=\"overflow: auto;\">",
            "<div id=\"page_content\" data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "<div region = 'south' id = 'usinessbTree' style = 'width:90%;height: 8%;border:none' >",
            "<div class='mt-10 test-c'>",
            "<label class='form-label col-5'></label>",
            "<a href='javascript:void(0)' id='global' class='btn btn-green radius  mt-l-20'  >确定</a>",
            "<a href='javascript:void(0)' id='cancel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>",
            "</div>"
        ].join("")).appendTo($popWindow);

        new taglibManagement();
    }


    function initWindowEvent() {
        /*
       * 取消按钮
       */
        $popWindow.on("click", "#cancel", function () {
            $("#win_content").window("close");
        });
    }

    return {
        initialize: initialize
    };

});
