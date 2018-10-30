/**
 * loading component
 */
define(["jquery"], function ($) {

    var $loadingLayer, $loadingMsg;

    var defaultMsg = '正在处理，请稍待。。。';

    /**
     * loading initialize
     */
    function initialize() {
        if (!$loadingLayer) {
            $loadingLayer = $("<div class=\"datagrid-mask mymask\"></div>").appendTo("body");
        }
        if (!$loadingMsg) {
            $loadingMsg = $("<div class=\"datagrid-mask-msg mymask\">" + defaultMsg + "</div>").appendTo("body").css({'font-size': '12px'});
        }

        $loadingLayer.css({width: "100%", height: $(document).height()});

        $loadingMsg.css({
            left: ($(document.body).outerWidth(true) - 190) / 2, top: ($(window).height() - 45) / 2,
        });
    }

    return {
        showLoading: function (msg) {
            initialize();
            $loadingLayer.show();
            $loadingMsg.html(msg || defaultMsg).show();
        },
        destroyLoading: function () {
            $loadingLayer.hide();
            $loadingMsg.hide();
        }
    }

});


/**
 * 组件样式
 */
(function (c) {
    var d = document, a = 'appendChild', i = 'styleSheet', s = d.createElement('style');
    s.type = 'text/css';
    d.getElementsByTagName('head')[0][a](s);
    s[i] ? s[i].cssText = c : s[a](d.createTextNode(c));
})(
    '@charset \"UTF-8\";' +
    '\r\n.datagrid-mask\r\n{position: absolute;left: 0;top: 0;width: 100 %;height: 100 %;opacity: 0.3;filter: alpha(opacity = 30);display: none;}\r\n' +
    '\r\n.datagrid-mask-msg {position: absolute; top: 50%; margin-top: -20px; padding: 12px 5px 10px 30px; width: auto; height: 16px; border-width: 2px; border-style: solid; display: none;\r\n'
);
