/**
 * Created by zhanghuan on 2018/5/16.
 * update by fanjun
 */
require(['util', 'js/homePage/constants/constants', 'js/homePage/kmUtil', 'js/homePage/dialog/dialog', 'js/homePage/favKlgAdd/favKlgAdd', 'js/homePage/MyAlert/MyAlert', 'loading', 'js/homePage/advancedSearch/advancedSearch'], function (Util, Constants, KmUtil, Dialog, FavKlgAdd, MyAlert, Loading, advancedSearch) {
    var openMode = KmUtil.getUrlParamter("openMode") || "2";
    KmUtil.setOpenMode(openMode);
    var loadingConfig = {
        // el:'',                  //组件要绑定的容器，默认为body（此项可不配置或留空）
        //className:'ke-screen-loading',           //组件外围的className*/
        position: 'center',      //提示信息位置，顶部top|默认center中央
        width: '300',      //loading的宽度,非必须，默认300
        height: 'auto',      //loading的宽度,非必须，默认auto
        mask: 0,                 //是否显示遮罩， 0不显示|默认1显示
        animate: 0,              //是否显示动画效果， 0不显示|默认1显示
        mode: 'layer',     //展示方式 loadingLine线条方式|默认layer弹层方式
        icon: 'dotCycle'  //文字前面的gif动画， 默认dotCycle有点组成的圈|cmcc移动图标|cmccLarge大的移动图标
    }
    var pageSize0 = 5;
    var pageSize1 = 5;
    var pageSize2 = 5;
    var pageSize3 = 5;
    var scope = KmUtil.getSession().provnce;
    var loading;
    var suggestionWords;
    KmUtil.setLogConfig();
    //获取高度
    window.onresize = function () {
        var screenHeight = document.documentElement.clientHeight;
        $("#boxCon").css({minHeight: screenHeight + "px"});
        getHeight();
    };
    getHeight();

    //获取浏览器高度
    function getHeight() {
        var screenHeight = document.documentElement.clientHeight;
        var scrh = screenHeight - 57;
        screenHeight = screenHeight - 182;
        if (screenHeight >= 340) {
            $("#conLcent").css({height: screenHeight + "px"});
            $("#conLRb").css({height: screenHeight + "px"});
            $("#treeCon").css({height: scrh + "px"});
        }

    }

//划过搜索框图标变红
    $(".sechP1").hover(function () {
        $(this).find('img').attr('src', '../image/homePage/search1.png');
    }, function () {
        $(this).find('img').attr('src', '../image/homePage/search1.png');
    });
    $(".sechP2").hover(function () {
        $(this).find('img').attr('src', '../image/homePage/yuyin1.png');
    }, function () {
        $(this).find('img').attr('src', '../image/homePage/symbols-2.png');
    });
    $(".sechP3").hover(function () {
        $(this).find('img').attr('src', '../image/homePage/paizhao1.png');
    }, function () {
        $(this).find('img').attr('src', '../image/homePage/symbols-3.png');
    });
    //sechInp获取焦点时sechTo变红
    $(".sechInp").focus(function () {
        $(".sechTo").addClass('sechToTo')
    }).blur(function () {
        $(".sechTo").removeClass('sechToTo')
    });
//点击图片出现弹框
    $(".sechP3").click(function () {
        oppen("modl1");
        $(".sechBp").eq(1).toggleClass("acretp").siblings().removeClass("acretp");
    });
    var oppen = function (thi) {
        $("#" + thi).show();
    }
    var cle1 = function (thi) {
        $("#" + thi).hide();
    }
//点击语音
    $(".sechP2").click(function () {
        oppen("modl2");
        $('.sechTdv').hide();
        $('.sechTdv1').html('');
        $(".sechBp").eq(2).toggleClass("acretp").siblings().removeClass("acretp");
    });
//点击全文 图片 语音 标题
    $("#sechBot").on('click', 'p', function () {
        $(this).toggleClass("acretp").siblings().removeClass("acretp");
    });
//获取菜单树
    var url1 = Constants.PREAJAXURL + "/KmBusTree/getNodes";
    var url2 = "../../assets/data/tree.json";
    $.ajax({
        type: "post",
        url: url1,
        dataType: "json",
        beforeSend: function () {
            // loading=new Loading(loadingConfig);
            Loading.showLoading("正在加载，请稍后");
        },
        success: function (data) {
            Loading.destroyLoading();
            var dat = data.beans;
            if (dat) {
                addTreData(dat);
            } else {
                //后台获取数据失败时取静态json数据
                $.ajax({
                    type: "post",
                    url: url2,
                    dataType: "json",
                    success: function (data) {
                        var dat = data.beans;
                        if (dat) {
                            addTreData(dat);
                        }
                    },
                    error: function () {
                        console.log("无数据");
                    }
                });
            }
        },
        error: function () {
            Loading.destroyLoading();
            console.log("无数据");
        }
    });
//加载菜单数据
    var addTreData = function (dat) {
        var len = dat.length;
        var str = "";
        var treName = "";
        var dat1;
        var num;
        var datLen = 0;
        var dat1Name;
        var dat2;
        var dat2Name;
        var pid;
        var rid;
        for (var i = 0; i < len; i++) {
            num = i;
            rid = dat[i].id;
            treName = dat[i].name;
            str += '<li class="treeLi"><span>' + treName + '</span> <div class="trebox"></div>'
            dat1 = dat[i].children;
            datLen = dat1.length;
            str += '<div class="trelidv"><ul class="trelidvul">'
            for (var j = 0; j < datLen; j++) {
                dat1Name = dat1[j].name;
                pid = dat1[j].id;
                str += '<li class="treliulli fn-clear">'
                    + '<span class="trelidvsp" aid="' + pid + '" pid="' + dat[i].id + '">' + dat1Name + '</span>';
                dat2 = dat1[j].children;
                str += '<div class="li2dv">'
                    + '<ul class="li2dvul">'
                for (var k = 0; k < dat2.length; k++) {
                    dat2Name = dat2[k].name;
                    str += '<li class="li2dvulli" aid="' + dat2[k].id + '" pid="' + pid + '">' + dat2Name + '</li>'
                }
                str += '</ul>'
                    + '</div>'
            }
            str += '</li>'
                + '</ul>'
                + '</div>'
            str += '</li>';
        }
        $("#treeUl").html(str);
        //点击左侧菜单二级菜单
        $("#treeUl").on('mouseenter', 'li', function () {
            var aa = $(this).index();
            $(this).siblings().find('.trelidv').hide();
            $(this).find('.trelidv').show();
        });
        $("#treeUl").on('mouseleave', 'li', function () {
            $(this).find('.trelidv').hide();
        });
        blinkOpenPage(".trelidvsp");
        blinkOpenPage(".li2dvulli");
        $("#recentknow").click();
        $("#todayfouse").click();
    }
    //叶子节点菜单点击事件
    var blinkOpenPage = function (classes) {
        $(classes).unbind().click(function (e) {
            var nid = $(e.target).attr("aid");
            var pid = $(e.target).attr("pid");
            KmUtil.openTab("知识列表", Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/kmKnowledgeSecondListNew.html",
                {nodeId: nid, parentId: pid});
        });
    }
    $(".modlBotbtdv").click(function () {
        cle1('modl1');
    });
    $(".modl2Botbtdv").click(function () {
        cle1('modl2');
    });
    //语音搜索
    $("#soundImg").bind('click', function () {
        if (this.src.search("yuyu.png") != -1) {
            this.src = "../image/homePage/end.gif";
        } else {
            this.src = "../image/homePage/yuyu.png";
            cle1('modl2');
            alterClassses("fullPage");
            $("#kw").val("语音搜索");
        }
    });
    $("#fileupload").change(function () {
        var upload_file = $("#fileupload").val();    //获取上传文件
        $('#modlFinp').val(upload_file);     //赋值给自定义input框
        var srcs = getObjectURL(this.files[0]);
        $(".sechTdv").show();
        var htm = '<img src="' + srcs + '" />'
        $(".sechTdv1").html(htm);
        $(".sechInp").show();
        uploadImg();
    });
//点击关闭图片
    $('.sechGuan').click(function () {
        $(".sechTdv").hide();
        $(".sechTdv1").html('');
    });
    var uploading = false;
    var uploadImg = function () {
        var formData = new FormData();
        formData.append('fileupload', $('#fileupload')[0].files[0]);
        formData.append('key', 'NGKM_PICTURE_FILE');
        $.ajax({
            url: Constants.PREAJAXURL + "/file/customUpload",
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false,
            dataType: "json",
            beforeSend: function () {
                //loading.show();
                Loading.showLoading("正在加载，请稍后");
            },
            success: function (data) {
                $('#modlFinp').val(data.object[0].fileName);
                $("#sechTim").attr('src', Constants.PREAJAXURL + "/file/download?key=NGKM_PICTURE_FILE&fileId=" + data.object[0].fileId);
                cle1('modl1');
                alterClassses("fullPage");
                $("#kw").val("图片搜索");
                //loading.hide();
                Loading.destory();
            },
            error: function () {
                Loading.destory();
            }
        });
    }
    var getObjectURL = function (file) {
        var url = null;
        if (window.createObjectURL != undefined) {
            url = window.createObjectURL(file)
        } else if (window.URL != undefined) {
            url = window.URL.createObjectURL(file)
        } else if (window.webkitURL != undefined) {
            url = window.webkitURL.createObjectURL(file)
        }
        return url
    };

    //点击变色conLlTop
    $(".conLlTop").on('click', 'p', function () {
        var le = $(this).index();
        var url3 = Constants.AJAXURL + "/kmSecondSet/newestAndlatestKnlgs?tm=" + new Date().getTime();
        var url7 = Constants.AJAXURL + "/kmSecondSet/recoBusiness?tm=" + new Date().getTime();
        if (le == 0) {
            recenRleased(url3);
        } else if (le == 1) {
            recenUpdated(url3);
        } else if (le == 2) {
            recommendedBusiness(url7);
        } else if (le == 3) {
            recommendedActivities(url7);
        }
        $(this).addClass("conLTpact").siblings().removeClass("conLTpact");
    });
    //点击变色conLRtop
    $(".conLRtop").on('click', 'p', function () {
        var lee = $(this).index();

        var url5 = Constants.AJAXURL + "/kmSecondSet/hotDaysKnlgs?tm=" + new Date().getTime();
        if (lee == 0) {
            todayPopular(url5, '1');
        } else {
            todayPopular(url5, '7');
        }
        $(this).addClass("conRpact").siblings().removeClass("conRpact");
    });

    //加载最近发布数据
    function recenRleased(url3) {
        var url4 = url3 || Constants.AJAXURL + "/kmSecondSet/newestAndlatestKnlgs?tm=" + new Date().getTime();
        loading.show();
        $.ajax({
            type: "GET",
            url: url4,
            data: {type: 2, page: 1, size: pageSize0, timeFrame: '7', scope: scope, leve: scope, sid: scope},
            dataType: "json",
            success: function (data) {
                var dat = data.object;
                if (dat) {
                    addrecenRleased(dat);
                }
                //loading.hide();
                Loading.destory();
            },
            error: function () {
                console.log('系统问题');
                //loading.hide();
                Loading.destory();
            }
        })
    }

    //加载最近更新数据
    function recenUpdated(url3) {
        var url4 = url3 || Constants.AJAXURL + "/kmSecondSet/newestAndlatestKnlgs?tm=" + new Date().getTime();
        loading.show();
        $.ajax({
            type: "GET",
            url: url4,
            data: {type: 1, page: 1, size: pageSize1, timeFrame: '7', scope: scope, leve: scope, sid: scope},
            dataType: "json",
            success: function (data) {
                var dat = data.object;
                if (dat) {
                    addrecenRleased(dat);
                }
                //loading.hide();
                Loading.destory();
            },
            error: function () {
                console.log('系统问题');
                loading.hide();
            }
        })
    }

    //加载推荐业务数据
    function recommendedBusiness(url7) {
        var url8 = url7 || Constants.AJAXURL + "/kmSecondSet/recoBusiness?tm=" + new Date().getTime();
        loading.show();
        $.ajax({
            type: "GET",
            url: url8,
            data: {type: 1, page: 1, size: pageSize2, scope: scope},
            dataType: "json",
            success: function (data) {
                var dat = data.object;
                if (dat) {
                    addrecenRleased(dat);
                }
                loading.hide();
            },
            error: function () {
                console.log('系统问题');
                loading.hide();
            }
        })
    }

    //加载推荐活动数据
    function recommendedActivities(url7) {
        var url8 = url7 || Constants.AJAXURL + "/kmSecondSet/recoBusiness?tm=" + new Date().getTime();
        loading.show();
        $.ajax({
            type: "GET",
            url: url8,
            data: {type: 2, page: 1, size: pageSize3, scope: scope},
            dataType: "json",
            success: function (data) {
                var dat = data.object;
                if (dat) {
                    addrecenRleased(dat);
                }
                loading.hide();
            },
            error: function () {
                console.log('系统问题');
                loading.hide();
            }
        })
    }

    //最近知识列表数据页面展示,并绑定详看,收藏功能
    function addrecenRleased(dat) {
        $('.conLent1').html("");
        //console.log(dat)
        var arr1 = dat.klgs;
        var len = arr1.length;
        var str = "";
        var titl = "";
        var cont = "";
        var tim = "";
        var num1;
        var scFlag;
        var favoritetit;
        var favoriimg;
        str += '<ul id="conLul">'
        for (var i = 0; i < len; i++) {
            tim = arr1[i].createTime;
            cont = arr1[i].knlgDetail;
            titl = arr1[i].knwlgNm;
            num1 = arr1[i].pageView;
            if (arr1[i].favorite) {
                scFlag = '1';
                favoritetit = '已收藏';
                favoriimg = '../../assets/img/soulist/shou1.png';
            } else {
                scFlag = '0';
                favoritetit = '收藏';
                favoriimg = '../image/homePage/xing.png';
            }
            str += '<li class="conLulli">'
                + '<div class="conLenl fn-left">'
                + '<img src="../image/homePage/liantong.png" />'
                + '</div>'
                + '<div class="conLenr fn-right">'
                + '<h4 class="conLeh4" hid="' + arr1[i].knwlgId + '">' + titl + '</h4>'
                + '<div class="conLenrc ">' + cont + '</div>'
                + '<div class="conLenrb">'
                + '<p class="conLenrbp fn-left">'
                + '<span>创建时间：</span>'
                + '<span>' + tim + '</span>'
                + '</p>'
                + '<p class="conLenrbp1 fn-left">'
                + '<img  src="../image/homePage/chakan.png" />'
                + '<span>' + num1 + '</span>'
                + '</p>'
                + '<p class="conLenrbp2 fn-left">'
                + '<img src="../image/homePage/xin.png" />'
                + '<span>11</span>'
                + '</p>'
                + '<p class="conLenrbp3 fn-left" style="cursor: pointer" scFlag="' + scFlag + '" sid="' + arr1[i].knwlgId + '" tid="' + titl + '" >'
                + '<img src="' + favoriimg + '" />'
                + '<span>' + favoritetit + '</span>'
                + '</p>'
                + '</div>'
                + '</div>'
                + '</li>'
        }
        ;
        str += '</ul>'
        $('.conLent1').html(str);
        $('.conLeh4').bind('click', function () {
            var hid = $(this).attr("hid");
            var tname = $(this).html();
            KmUtil.openTab(tname, Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/knowledgeDetail.html", {knwlgId: hid});
        });
        //注册收藏按钮点击事件
        $(".conLenrbp3").click(function (e) {
            var me = this;
            var fixId = $(me).attr("sid");
            var klgTitle = $(me).attr("tid");
            if ($(me).attr("scFlag") == "0") {
                //收藏
                $(".favorite-add-inner").empty();
                new FavKlgAdd(klgTitle, fixId, $(me));
                $(this).on("favrtResult", function (event, result) {
                    if (result == 0 || result == "123119") {
                        $(me).attr("scFlag", "1");
                        $(me).empty();
                        $(me).append('<img src="../../assets/img/soulist/shou1.png" />');
                        $(me).append('<span>已收藏</span>');
                    }
                });
            } else {
                //调用取消收藏接口
                Util.ajax.postJson(Constants.AJAXURL + '/klgFavrtInfo/delete' + '/' + fixId, {}, function (data, state) {
                    if (state) {
                        new MyAlert({'type': 'success', 'text': data.returnMessage});
                        $(me).attr("scFlag", "0");
                        $(me).empty();
                        $(me).append('<img src="../image/homePage/xing.png" />');
                        $(me).append('<span>收藏</span>');
                    } else {
                        if (data.returnCode == "-1") {
                            new MyAlert({
                                type: 'error',
                                text: data.returnMessage,
                                falseShow: false,
                                trueName: '确定'
                            });
                            $(me).attr("scFlag", "0");
                            $(me).empty();
                            $(me).append('<img src="../image/homePage/xing.png" />');
                            $(me).append('<span>收藏</span>');
                        } else {
                            new MyAlert({'type': 'success', 'text': data.returnMessage});
                        }
                    }
                });
            }
        });
    }

    //加载今日热点数据
    function todayPopular(url5, timeFrame) {
        var url6 = url5 || Constants.AJAXURL + "/kmSecondSet/hotDaysKnlgs?tm=" + new Date().getTime();
        loading.show();
        $.ajax({
            type: "GET",
            url: url6,
            data: {type: 2, page: 1, size: 5, timeFrame: timeFrame, scope: scope},
            dataType: "json",
            success: function (data) {
                var dat = data.object;
                if (dat) {
                    addHotAndRecommended(dat);
                }
                loading.hide();
            },
            error: function () {
                console.log('系统问题');
                loading.hide();
            }
        })
    };

//热点页面展示拼装,并绑定详看
    function addHotAndRecommended(dat) {
        $('#conLRb1').html("");
        var arr1 = dat.klgs;
        var len = arr1.length;
        var str1 = "";
        var til = '';
        var con1 = "";
        var tim1 = "";
        str1 += '<ul id="conLRbul">'
        for (var i = 0; i < len; i++) {
            til = arr1[i].knwlgNm;
            con1 = arr1[i].knlgDetail;
            tim1 = arr1[i].createTime;
            str1 += '<li class="conLRbulli">'
                + '<h4 class="conLRbulh4 fn-text-overflow" hid="' + arr1[i].knwlgId + '">' + til + '</h4>'
                + '<div class="conLRlidv1">' + con1 + '</div>'
                + '<p class="conLRlip1">'
                + '<span>创建时间</span>'
                + '<span>' + tim1 + '</span>'
                + '</p>'
                + '</li>'
        }
        ;
        str1 += '</ul>'
        $('#conLRb1').html(str1);
        $('.conLRbulh4').bind('click', function () {
            var hid = $(this).attr("hid");
            var tname = $(this).html();
            KmUtil.openTab(tname, Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/knowledgeDetail.html", {knwlgId: hid});
        });
    };
    var clickSearch = function () {
        //初始化搜索框
        var kw = $("#kw").val() || '';
        var cname = '';
        var sid = scope;
        var cid = scope;
        var leve = 1;
        var searchType = $("#sechBot .acretp").attr("vid") || '1';
        if (searchType == '1' || searchType == '2') {
            if (kw == '') {
                new Dialog({
                    mode: 'tips',
                    tipsType: 'success',
                    content: '请输入关键字搜索!'
                });
                return false;
            }
        }
        var url = Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/secKmSearchList.html?" + "kw=" + kw + "&scope=" + scope + "&cname=" + cname + "&sid=" + sid + "&cid=" + cid + "&leve=" + leve + "&suggestionWords=" + suggestionWords + "&searchType=" + searchType;
        KmUtil.openTab("知识库-搜索列表", url, {});
    }

    var clickAdvancedSearch = function () {
        var cname = '';
        var sid = scope;
        var cid = scope;
        var leve = 1;
        var param = {
            cname: cname,
            sid: scope,
            cid: scope,
            leve: leve
        };
        new advancedSearch(param);
    }

    //点击查询按钮触发事件
    $("#searchImg").bind('click', function () {
        clickSearch();
    });
    //点击高级搜索触发事件
    $("#advancedSearch").bind('click', function () {
        clickAdvancedSearch();
    });
    //点击全文tab过滤搜索结果
    $("#fullPage").bind('click', function () {
        //clickSearch();
    });
    //点击图片tab过滤搜索结果
    $("#picSearch").bind('click', function () {
        //clickSearch();
    });
    //点击语音tab过滤搜索结果
    $("#soundSearch").bind('click', function () {
        // clickSearch();
    });
    //点击标题tab过滤搜索结果
    $("#titleSearch").bind('click', function () {
        // clickSearch();
    });
    var alterClassses = function (pid) {
        $("#sechBot").contents().removeClass("acretp");
        $("#" + pid).addClass("acretp");
    }
    var nScrollHight = 0; //滚动距离总长(注意不是滚动条的长度)
    var nScrollTop = 0;   //滚动到的当前位置
    var nDivHight = $("#conLcent").height();
    //知识列表滚动条触发事件
    $("#conLcent").scroll(function () {
        nScrollHight = $(this)[0].scrollHeight;
        nScrollTop = $(this)[0].scrollTop;
        if (nScrollTop + nDivHight + 27 >= nScrollHight) {
            if (loading) {
                loading.hide();
            }
            var title = $(".conLTpact").html();
            if (title == '最近发布') {
                pageSize0 = pageSize0 + 5;
            }
            if (title == '最近更新') {
                pageSize1 = pageSize1 + 5;
            }
            if (title == '推荐业务') {
                pageSize2 = pageSize2 + 5;
            }
            if (title == '推荐活动') {
                pageSize3 = pageSize3 + 5;
            }
            $(".conLTpact").click();
        } else {
            if (loading) {
                loading.hide();
            }
        }
    });

    //注册收藏按钮点击事件
    function favrt(clickClassId) {
        var me = clickClassId;
        var fixId = $(me).attr("sid");
        var klgTitle = $(me).attr("tid");
        if ($(me).attr("scFlag") == "0") {
            //收藏
            $(".favorite-add-inner").empty();
            new FavKlgAdd(klgTitle, fixId, $(me));
            $(this).on("favrtResult", function (event, result) {
                if (result == 0 || result == "123119") {
                    $(me).attr("scFlag", "1");
                    $(me).empty();
                    $(me).append('<i class="icon km-duduyinleappicon2201"></i>');
                    $(me).append('已收藏');
                }
            });
        } else {
            //调用取消收藏接口
            Util.ajax.postJson(Constants.AJAXURL + '/klgFavrtInfo/delete' + '/' + fixId, {}, function (data, state) {
                if (state) {
                    new MyAlert({'type': 'success', 'text': data.returnMessage});
                    $(me).attr("scFlag", "0");
                    $(me).empty();
                    $(me).append('<i class="icon km-shoucang"></i>');
                    $(me).append('添加收藏');
                } else {
                    if (data.returnCode == "-1") {
                        new MyAlert({
                            type: 'error',
                            text: data.returnMessage,
                            falseShow: false,
                            trueName: '确定'
                        });
                        $(me).attr("scFlag", "0");
                        $(me).empty();
                        $(me).append('<i class="icon km-shoucang"></i>');
                        $(me).append('添加收藏');
                    } else {
                        new MyAlert({'type': 'success', 'text': data.returnMessage});
                    }
                }
            });
        }
    }

//提示词搜索
    var searchSuggestionWords = function (e, kw) {
        console.log("searchSuggestionWords kw-->" + kw);
        var startTime = new Date().getTime();
        console.log("searchSuggestionWords startTime-->" + startTime);
        var html = "";
        //提示词查询
        var url = Constants.AJAXURL + '/srchKeyword/searchSuggestionWords';
        var param = {
            keyword: kw
        };
        Util.ajax.postJson(url, param, function (json, status) {
            if (status) {
                var oject1 = $.parseJSON(json.object);
                var flag = oject1.object.hasOwnProperty("suggestionWords");
                if (flag) {
                    var suggestionWordsObj = oject1.object.suggestionWords;
                    var suggestionWordsArr = [];
                    if (suggestionWordsObj.length > 0) {
                        $('#hotKeys').html("");
                        for (var i = 0; i <= suggestionWordsObj.length - 1; i++) {
                            var keyName = suggestionWordsObj[i].keyword;
                            html = html + "<li class='item'><a href='javascript:void(0);'>" + keyName + "</a></li>";
                            suggestionWordsArr.push(keyName);
                        }
                        suggestionWords = suggestionWordsArr.join(",");
                        $('#hotKeys').html(html);
                    }
                    var endTime = new Date().getTime();
                    console.log("searchSuggestionWords Time-->" + (endTime - startTime));
                } else {
                    $('#hotKeys').html("");
                    suggestionWords = '';
                    $('.search-hotwords p').show().text("无匹配结果");
                }
            } else {
                console.log('查询提示词失败！');
                suggestionWords = '';
            }
        });
    }

    var getParams = function () {
        var params = new Object();
        params.page = "1";
        params.size = "10";
        params.scope = scope;
        params.timeFrame = "4";
        return params;
    }
    //热门词搜索
    var searchHotKeywords = function (e, kw) {
        var html = "";
        var url = Constants.AJAXURL + '/searchKnowledge/searchHotKeywords';
        var param = {
            param: JSON.stringify(getParams())
        };
        Util.ajax.postJson(url, param, function (json, status) {
            if (status) {
                $('.search-hotwords p').show().text("热门搜索：");
                $('#hotKeys').html("");
                // var cityHtml = Util.hdb.compile(cityTpl)(json);
                var keywordsObj = $.parseJSON(json.object.object);
                var json = keywordsObj[0].keywords;
                if (json.length > 0) {
                    for (var i = 0; i <= json.length - 1; i++) {
                        var keyName = json[i].keyword;
                        html = html + "<li class='item'><a href='#nogo'>" + keyName + "</a></li>";
                    }
                    $('#hotKeys').html(html);
                } else {
                    $('#hotKeys').html("");
                    $('.search-hotwords p').text("无匹配结果");
                }
            } else {
                $('.search-hotwords p').text("请输入搜索");
                console.log('查询热门搜索词失败！');
            }
        });
    }
//搜索框键盘触发事件
    var num = 0;
    $(document).on('keyup', '#kw', function (e) {
        var keycode = e.which ? e.which : e.keyCode;
        if (keycode != "13") {
            var e = e || window.event;
            $('.search-hotwords').show();
            var tChangeMenu;
            $(this).css("color", "black");
            clearTimeout(tChangeMenu);
            var tChangeMenu = setTimeout(function () {
                var kw = $.trim($(e.currentTarget).val());
                kw = kw.replace(/</g, "&lt;");
                kw = kw.replace(/>/g, "&gt;");
                if (kw != "") {
                    $('.kwCol').css("visibility", "visible");
                    searchSuggestionWords(e, kw);
                } else {
                    $('.kwCol').css("visibility", "hidden");
                    searchHotKeywords(e, kw);
                }
                num = 0;
                $("#hotKeys").scrollTop(num);
                clearTimeout(tChangeMenu);
                tChangeMenu = null;
            }, 0);
            var e = e || window.event;
            e.stopPropagation();
        }
    });
    // 搜索关键字 click
    $(document).on('mousedown', '.search-hotwords li a', $.proxy(function (e) {
        $(".search-hotwords").hide();
        var $item = $(e.currentTarget);
        var text = $.trim($item.text());
        $("#kw").val(text);
        var cname = '';
        var sid = scope;
        var cid = scope;
        var leve = 1;
        var url = Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/secKmSearchList.html?" + "kw=" + text + "&scope=" + scope + "&cname=" + cname + "&sid=" + sid + "&cid=" + cid + "&leve=" + leve + "&suggestionWords=" + suggestionWords + "&searchType=" + 1;
        KmUtil.openTab("知识库-搜索列表", url, {});
        var e = e || window.event;
        e.stopPropagation();
    }, this));

    //搜索框回车事件
    $(document).on("keypress", '#kw', $.proxy(function (e) {
        var e = e || window.event;
        var keycode = e.which ? e.which : e.keyCode;
        if (keycode == "13") {
            var kw = $.trim($(e.currentTarget).val());
            if (kw != "") {
                $(".search-hotwords").hide();
                var cname = '';
                var sid = scope;
                var cid = scope;
                var leve = 1;
                var url = Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/secKmSearchList.html?" + "kw=" + kw + "&scope=" + scope + "&cname=" + cname + "&sid=" + sid + "&cid=" + cid + "&leve=" + leve + "&suggestionWords=" + suggestionWords + "&searchType=" + 1;
                KmUtil.openTab("知识库-搜索列表", url, {});
            } else {
                new MyAlert({
                    type: 'error',
                    text: "请输入关键字！",
                    falseShow: false,
                    trueName: "知道了"
                });
                return;
            }
        }
    }, this));
    //键盘按下事件
    $(document).on('keydown', $.proxy(function (e) {
        var e = e || window.event;
        var keycode = e.which ? e.which : e.keyCode;
        if (keycode == 38) {
            e.preventDefault();
            if ($.trim($("#hotKeys").html()) == "") {
                return;
            }
            setTimeout(function () {
                movePrev();
            }, 1);
        } else if (keycode == 40) {
            e.preventDefault();
            if ($.trim($("#hotKeys").html()) == "") {
                return;
            }
            $("#kw").blur();
            $(".search-hotwords").show();
            if ($(".item").hasClass("addbg")) {
                setTimeout(function () {
                    moveNext();
                }, 1);
            } else {
                $(".item").removeClass('addbg').eq(0).addClass('addbg');
            }
        } else if (keycode == 13) {
            var text = $(".addbg").text();
            if (text != "") {
                $('.kwCol').css("visibility", "visible");
                $("#kw").val(text);
                $(".search-hotwords").hide();
                var cname = '';
                var sid = scope;
                var cid = scope;
                var leve = 1;
                var url = Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/secKmSearchList.html?" + "kw=" + text + "&scope=" + scope + "&cname=" + cname + "&sid=" + sid + "&cid=" + cid + "&leve=" + leve + "&suggestionWords=" + suggestionWords + "&searchType=" + 1;
                KmUtil.openTab("知识库-搜索列表", url, {});
            }
        }
    }, this));
    //键盘向上键触发事件
    var movePrev = function () {
        $("#kw").blur();
        $(".search-hotwords").show();
        var index = $(".addbg").prevAll().length;
        if (index == 0) {
        } else {
            $(".item").removeClass('addbg');
            $(".item").eq(index - 1).addClass('addbg');
            num -= 27;
            $("#hotKeys").scrollTop(num);
        }
    }

    //键盘向下键触发事件
    var moveNext = function () {
        var index = $(".addbg").prevAll().length;
        if (index == $(".item").length - 1) {
            $(".item").removeClass('addbg');
            $(".item").eq(0).addClass('addbg');
            $("#hotKeys").scrollTop(0);
            num = 0;
        } else {
            $(".item").removeClass('addbg');
            $(".item").eq(index + 1).addClass('addbg');
            num += 26;
            $("#hotKeys").scrollTop(num);
        }
    }

    $(document).on('mouseleave', '.search-hotwords', function (e) {
        $('.search-hotwords').hide();
        if ($("#kw").val() == '') {
            $('.kwCol').css("visibility", "hidden");
        }
    });
    // 清除录入框事件
    $(document).on("click", ".kwCol", function (e) {
        var e = e || window.event;
        e.stopPropagation();
        $("#kw").val('');
        $('.kwCol').css("visibility", "hidden");
    });


    $(document).on("focus", "#kw", function (e) {
        $('.search-hotwords').show();
        var kw = $("#kw").val();
        if (kw == '') {
            searchHotKeywords(e, kw);
        } else {
            $('.kwCol').css("visibility", "visible");
            kw = kw.replace(/</g, "&lt;");
            kw = kw.replace(/>/g, "&gt;");
            searchSuggestionWords(e, kw);
        }
    });
    $("#kw").blur(function () {
        $('.search-hotwords').hide();
    });
});