/**
 * 全局共用模块
 */
define(["jquery"], function ($) {

    var PageUtil = {};

    /**
     * 获取表单内容
     * @param $document
     * @returns {{}}
     */
    PageUtil.getParams = function ($document) {
        var param = {};

        $document && $document.find("input.textbox-value").each(function() {
            var $item  = $(this);
            if($item.val()){
                param[$item.attr("name")] = $item.val();
            }
        });
        return param;
    }

    return PageUtil;

});
