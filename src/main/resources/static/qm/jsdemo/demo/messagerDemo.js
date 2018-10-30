/**
 * 技能配置样例
 */
define(["jquery", "easyui"], function ($) {

    var $btns;

    /**
     * 初始化
     */
    var initialize = function(){
        initPopWindow();
        initWindowEvent();
    };


    /**
     * 初始化弹出窗口
     */
    function initPopWindow() {
        $btns = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>messager button</div>",
            "<div class='fl'>",
            "<a name='btn-confirm' href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>confirm</a>",
            "<a name='btn-alert' href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>alert</a>",
            "<a name='btn-show' href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>show</a>",

            "<a name='btn-prompt' href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>prompt</a>",
            "<a name='btn-progress' href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>progress</a>",

            "</div>",
            "</div>",
            "</div>",
            "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>"
        ].join("")).appendTo($("#hsz_tab_content"));

    }


    function initWindowEvent(){

        $btns.on("click", "a[name='btn-confirm']", function() {
            $.messager.confirm('Confirm','Are you sure you want to delete record?',function(r){
                if (r){
                    console.log("r: " + r);
                }
            });
        });

        $btns.on("click", "a[name='btn-alert']", function() {
            $.messager.alert('Warning','The warning message');
        });

        $btns.on("click", "a[name='btn-show']", function() {
            $.messager.show({
                title:'My Title',
                msg:'Message will be closed after 5 seconds.',
                timeout:5000,
                showType:'slide'
            });
        });

        $btns.on("click", "a[name='btn-prompt']", function() {
            $.messager.prompt('Prompt', 'Please enter your name:', function(r){
                if (r){
                    alert('Your name is:' + r);
                }
            });
        });


        $btns.on("click", "a[name='btn-progress']", function() {
            $.messager.progress();

            setTimeout(function(){
                $.messager.progress('close');
            }, 2000);
        });

    }



    return {
        initialize: initialize
    };

});
