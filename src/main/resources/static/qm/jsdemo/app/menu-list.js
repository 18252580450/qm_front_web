define([
    "js/app/call-service",
    "hdb",
    "util",
    "text!html/app/menu-list.hbs",
    "text!html/app/nav-menu.hbs",
    "js/app/search-list"
], function (cs, hbs, Util, list_tpl, nav_tpl, sl) {
    'use strict';

    var menu_list = function (codeValue) {
        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.DISTRICT_DNS).concat("/queryDocCatalog?codeValue=" + codeValue),
            //"http://192.168.16.3:8080/kc/doc/catalogsvc/msa/queryDocCatalog?codeValue=" + codeValue,
            "get",
            "",
            function (data) {
                var menu_arr = data.RSP;
                _render_menu(menu_arr);
            }
        )
    };

    //渲染侧边栏模板
    var _render_menu = function (menu_arr) {
        var template = hbs.compile(list_tpl);
        var html = template(menu_arr);
        $('#hbs_kc_menu_list').html(html);

        $(".kc-menu-container span").mouseenter(function () {
            $(".kc-menu").show();
            children_menu_list(this.id);
        });

        $(".kc-menu-container span").mouseleave(function () {
            $(".kc-menu").hide();
        });

        $(".kc-menu").mouseenter(function () {
            $(".kc-menu").show();
        });

        $(".kc-menu").mouseleave(function () {
            $(".kc-menu").hide();
        });

    }

    var children_menu_list = function (codeValue) {
        cs.server_api(
            Util.constants.CONTEXT.concat(Util.constants.DISTRICT_DNS).concat("/subCatalogs?superCatalogId=" + codeValue),
            //"http://192.168.16.3:8080/kc/doc/catalogsvc/msa/subCatalogs?superCatalogId=" + codeValue,
            "get",
            "",
            function (data) {
                _render_children_menu(data);
            }
        )
    };

    //渲染导航菜单模板
    var _render_children_menu = function (data) {
        var template = hbs.compile(nav_tpl);
        var html = template(data);
        $('#hbs_kc_nav_menu').html(html);

        //二级
        $(".kc-menu-item strong").click(function () {
            console.log(this.id);
            sl.search_list_catlog(this.id);
        });

        //三级
        $(".kc-menu-title-default span").click(function () {
            console.log(this.id);
            sl.search_list_catlog(this.id);
        });

        //四级
        $(".kc-menu-navs span").click(function () {
            console.log(this.id);
            sl.search_list_catlog(this.id);
        });
    }

    return {
        menu_list: menu_list
    }

});