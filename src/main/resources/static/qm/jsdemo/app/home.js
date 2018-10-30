require([
    "js/app/city-list",
    "js/app/menu-list",
    "js/app/search-list",
    "js/app/new-list",
    "js/app/appInteractive"
], function (cl, ml, sl, nl, api) {

    //渲染目录
    ml.menu_list('0');

    //渲染地市
    //cl.city_list('000');

    //搜索
    $("#kc_search_btn").click(function () {
        var key_word = $('#key_word').val();
        sl.search_list_key(key_word);
    });

    //渲染最近更新
    //nl.new_list();
    //nl.hot_list();

});
