require(["jquery", "bootstrap"], function ($) {
    $('.kc-nav-tabs span').click(function () {
        $('.kc-nav-tabs span').removeClass('active');
        $(this).addClass('active');
        $(".kc-detail").hide();
        _show_kc_detail_list(this.id);
    });

    var _show_kc_detail_list = function (params) {
        if (params == 'kc_knl_type_1') {
            $("#kc_structuring").show();
        } else if (params == 'kc_knl_type_2') {
            $("#kc_qa").show();
        } else if (params == 'kc_knl_type_3') {
            $("#kc_media").show();
        }
    }
});