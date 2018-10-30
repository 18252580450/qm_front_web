/**
 * 技能配置样例
 */
define(["jquery", 'util', "rating", "ckeditor"], function ($, Util) {

    var $page, $search;

    /**
     * 初始化
     */
    var initialize = function(){
        $page = $("<div></div>");
        addRating();
        $page = $page.appendTo($("#other_tab_content"));

        initRating();
        initCkeditor();
    };


    /**
     * append search form
     */
    function addRating() {
        $search = $([
            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",

            "<div class='row cl'>",
            "<div class='formControls text-l'>" +
                "<select id='example'>",
                "<option value='1'>1</option>",
                "<option value='2'>2</option>",
                "<option value='3'>3</option>",
                "<option value='4'>4</option>",
                "<option value='5'>5</option>",
                "</select>",
            "</div>",
            "</div>",

            "</form>",
            "</div>",

            "<textarea name='content' id='editor' />"

        ].join("")).appendTo($page);
    }


    function initRating() {
        $('#example').barrating({
            theme: 'fontawesome-stars',
            onSelect: function(value, text, event) {
                console.log("value: " + value + " - text:" + text);
            }
        });

        // $('#example').barrating('show');
        // $('#example').barrating('destroy');
        // $('#example').barrating('readonly', false);
        // $('#example').barrating('set', 2);
    }


    function initCkeditor(){
        // ClassicEditor.create(document.getElementById("editor"));
        ClassicEditor.create(document.querySelector('#editor'));

        // ClassicEditor
        //     .create( document.querySelector( '#editor' )
        //     )
        //     // .catch( error => {
        //     // console.error( error );
        //     // }
        // );
    }


    return {
        initialize: initialize
    };

});
