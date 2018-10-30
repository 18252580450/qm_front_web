/**
 * 技能配置样例
 */
require(["umeditor"], function () {

    var $page, $search;

    /**
     * 初始化
     */
    var initialize = function(){
        $page = $("<div></div>");
        addRating();
        $page = $page.appendTo($("#umeditor_content"));

        initCkeditor();
    };

    /**
     * append search form
     */
    function addRating() {
        $search = $([
            "<h1>UMEDITOR 完整demo</h1>",
            "<script type='text/plain' id='myEditor' style='width:1000px;height:240px;'>",
            "<p>这里我可以写一些输入提示</p>",
            "</script>",


            "<div class='clear'></div>",
            "<div id='btns'>",
            "    <table>",
            "        <tr>",
            "            <td>",
            "                <button class='btn' unselected='on' onclick='getAllHtml()'>获得整个html的内容</button>&nbsp;",
            "                <button class='btn' onclick='getContent()'>获得内容</button>&nbsp;",
            "                <button class='btn' onclick='setContent()'>写入内容</button>&nbsp;",
            "                <button class='btn' onclick='setContent(true)'>追加内容</button>&nbsp;",
            "                <button class='btn' onclick='getContentTxt()'>获得纯文本</button>&nbsp;",
            "                <button class='btn' onclick='getPlainTxt()'>获得带格式的纯文本</button>&nbsp;",
            "                <button class='btn' onclick='hasContent()'>判断是否有内容</button>",
            "            </td>",
            "        </tr>",
            "        <tr>",
            "            <td>",
            "                <button class='btn' onclick='setFocus()'>编辑器获得焦点</button>&nbsp;",
            "                <button class='btn' onmousedown='isFocus();return false;'>编辑器是否获得焦点</button>&nbsp;",
            "                <button class='btn' onclick='doBlur()'>编辑器取消焦点</button>&nbsp;",
            "                <button class='btn' onclick='insertHtml()'>插入给定的内容</button>&nbsp;",
            "                <button class='btn' onclick='getContentTxt()'>获得纯文本</button>&nbsp;",
            "                <button class='btn' id='enable' onclick='setEnabled()'>可以编辑</button>&nbsp;",
            "                <button class='btn' onclick='setDisabled()'>不可编辑</button>",
            "            </td>",
            "        </tr>",
            "        <tr>",
            "            <td>",
            "                <button class='btn' onclick='UM.getEditor('myEditor').setHide()'>隐藏编辑器</button>&nbsp;",
            "                <button class='btn' onclick='UM.getEditor('myEditor').setShow()'>显示编辑器</button>&nbsp;",
            "                <button class='btn' onclick='UM.getEditor('myEditor').setHeight(300)'>设置编辑器的高度为300</button>&nbsp;",
            "                <button class='btn' onclick='UM.getEditor('myEditor').setWidth(1200)'>设置编辑器的宽度为1200</button>",
            "            </td>",
            "        </tr>",
            "    </table>",
            "</div>",
            "<table>",
            "    <tr>",
            "        <td>",
            "            <button class='btn' onclick='createEditor()'/>创建编辑器</button>",
            "            <button class='btn' onclick='deleteEditor()'/>删除编辑器</button>",
            "        </td>",
            "    </tr>",
            "</table>",
            "<div>",
            "    <h3 id='focush2'></h3>",
            "</div>"

        ].join("")).appendTo($page);
    }



    function initCkeditor(){
        //实例化编辑器
        var um = UM.getEditor('myEditor');
        um.addListener('blur',function(){
            $('#focush2').html('编辑器失去焦点了')
        });
        um.addListener('focus',function(){
            $('#focush2').html('')
        });

    }

    initialize();

});
