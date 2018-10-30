define([
    "js/app/call-service",
    "hdb",
    "util",
    "text!html/app/city-list.hbs"
], function (cs, hbs, tpl, Util) {
    'use strict';

    //查询地市
    var city_list = function (codeValue) {
        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.DISTRICT_DNS).concat("/query?codeValue=" + codeValue),
            //"http://10.125.128.48:5529/kc/manage/distsvc/msa/,
            "get",
            "",
            function (data) {
                var cities_arr = data.RSP;
                _render_cities(cities_arr);
            }
        )
    };

    //渲染模板
    var _render_cities = function (cities_arr) {
        var template = hbs.compile(tpl);
        var html = template(cities_arr);
        $('#hbs_kc_city').html(html);

        $(".kc-cities a").click(function () {
            $('#kc_city').text(this.innerText);
            city_list(this.id);
        });
    }

    //地市显示与隐藏开关
    var toggle = false;
    $('#kc_city').click(function () {
        if (toggle == false) {
            $('.kc-cities').show();
            toggle = true;
        } else {
            $('.kc-cities').hide();
            toggle = false;
        }
    });

    return {
        city_list: city_list
    }

});