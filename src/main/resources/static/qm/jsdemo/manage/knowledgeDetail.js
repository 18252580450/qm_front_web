/**
 *qiuxiang3
 */
require(["jquery", "loading", 'js/homePage/kmUtil', 'util', 'text!html/manage/knowledgeInfoGroup.tpl', 'text!html/manage/knowledgeInfoAttr.tpl', 'text!html/manage/knowledgeInfoRelate.tpl', "text!html/manage/knowledgeInfoGroupPreGathr.tpl", "easyui", 'js/homePage/constants/constants'],
    function ($, Loading, kmUtil, Util, klgInfoGroup, klgInfoAttr, klgInfoRelate, klgInfoGroupPreGathr, Constants) {
        var knwlgNM;
        var verNo = null;
        /**
         * 序列化url查询参数
         */
        function serilizeUrl(url) {
            var result = {};
            var map = url.split("&");
            for (var i = 0, len = map.length; i < len; i++) {
                result[map[i].split("=")[0]] = map[i].split("=")[1];
            }
            return result;
        }
        /**
         * 初始化同时获取参数
         */
        $(document).ready(function () {
            // 路径查询参数部分
            var searchURL = decodeURI(window.location.search);
            searchURL = searchURL.substring(1, searchURL.length);
            // 参数序列化
            var searchData = serilizeUrl(decodeURI(searchURL));
            knwlgId = searchData.knwlgId;
            verNo = searchData.verNo;
            isPublished=searchData.isPublished;

            new initialize();
        });
        /*String.prototype.trim = function () {
            return this.replace(/^\s\s*!/, '').replace(/\s\s*$/, '');
        };
        var knwlgId = kmUtil.getUrlParamter("knwlgId");
        var isPublished = kmUtil.getUrlParamter("isPublished");
        var isBackStage = kmUtil.getUrlParamter("isBackStage");*/

        var grpngEvent = function () {
            //点击短信图标
            $(".attrData").click(function () {
                if ($(this).hasClass("selected")) {
                    $(this).removeClass("selected");
                } else {
                    $(this).addClass("selected");
                }
                if ($(this).parents(".left-content").find(".attrData").length === $(this).parents(".left-content").find(".selected").length) {
                    $(this).parents(".left-content").find("a[kid='chkall']").addClass("chked");
                } else {
                    if ($(this).parents(".left-content").find("a[kid='chkall']").hasClass("chked")) {
                        $(this).parents(".left-content").find("a[kid='chkall']").removeClass("chked");
                    }
                }
            });

            //选中分组下所有可发短信的原子
            $("a[kid='chkall']").click(function () {
                if ($(this).hasClass("chked")) {
                    $(this).removeClass("chked");
                    $(this).parent().parent().find(".attrData").addClass("selected");
                } else {
                    $(this).addClass("chked");
                    $(this).parent().parent().find(".attrData").removeClass("selected");
                }
                $(this).parents(".left-content").find(".attrData").trigger("click");
            });
            //闭合/显示注解
            $(".zhj").click(function () {
                if ($(this).parent().next().find(".zhujie-con").css("display") == "none") {
                    $(this).parent().next().find(".zhujie-con").show();
                    $(this).addClass("chked");
                } else {
                    $(this).parent().next().find(".zhujie-con").hide();
                    $(this).removeClass("chked")
                }
            });
            //鼠标悬浮注解
            $(".is-zhujie").mouseover(function () {
                $(this).parent().find(".zhujie-con").show();
            });
            $(".is-zhujie").mouseout(function () {
                if (!$(this).parent().parent().parent().prev().find(".zhj").hasClass("chked")) {
                    $(this).parent().find(".zhujie-con").hide();
                }
            });
            //隐藏所有二级分组和原子
            $(".closed").click(function () {
                if ($(this).find("i").hasClass("km-shanglajiantou")) {
                    $(this).html('<i class="icon km-xialajiantou"></i>展开');
                    $(this).parent().nextAll().hide();
                } else {
                    $(this).html('<i class="icon km-shanglajiantou"></i>闭合');
                    $(this).parent().nextAll().show();
                }
            });
            //隐藏不可发送短信项
            $("#hideNotSendMes").click(function () {
                var notSendMessage = $(".notSendMessage").parent();
                if ($(this).find("i").hasClass("km-yanjing1")) {
                    $(this).find("i").removeClass("km-yanjing1");
                    $(this).find("i").addClass("km-yanjing");
                    $(this).find("span").html("显示不可发送项");
                    notSendMessage.parent().hide();
                } else {
                    $(this).find("i").removeClass("km-yanjing");
                    $(this).find("i").addClass("km-yanjing1");
                    $(this).find("span").html("隐藏不可发送项");
                    notSendMessage.parent().show();
                }
            });
            //闭合或展开右侧
            $("#closeRight").click(function () {
                var i = $(this).find("i");
                var span = $(this).find("span");
                if (i.hasClass("km-arrow_l")) {
                    $("#layout").removeClass("close-view");
                    span.html("闭合右侧");
                    i.removeClass("km-arrow_l");
                    i.addClass("km-arrow_r");
                } else {
                    $("#layout").addClass("close-view");
                    span.html("展开右侧");
                    i.addClass("km-arrow_l");
                    i.removeClass("km-arrow_r");
                }
            });
            //知识属性隐藏
            $("#knwlgAtrr").click(function () {
                var i = $("#knwlgAtrr").find("i");
                if (i.hasClass("km-xialajiantou")) {
                    i.removeClass("km-xialajiantou");
                    i.addClass("km-shanglajiantou");
                    $(this).parent().next().next().removeClass("hide");
                } else {
                    i.removeClass("km-shanglajiantou");
                    i.addClass("km-xialajiantou");
                    $(this).parent().next().next().addClass("hide");
                }
            });
            //例外
            $(".exception").click(function () {
                if ($(this).parent().hasClass("active")) {
                    return false;
                }
                $(this).parent().siblings().removeClass("active");
                $(this).parent().addClass("active");
                var sel = $(this).parents("div.atoms");
                var atomId = sel.attr("atomId");
                sel.children('.' + atomId).addClass("hide");
                sel.children("." + $(this).attr("regnId")).removeClass("hide");
                //debugger
                if ($(this).attr("isSendMes") === "1") {
                    $(this).parents("div.left-words").find("a.message").addClass("hide").removeClass("notSendMessage");
                    $(this).parents("div.left-words").find("a." + $(this).attr("regnId")).removeClass("hide");
                } else {
                    $(this).parents("div.left-words").find("a.message").addClass("hide");
                    $(this).parents("div.left-words").find("a." + $(this).attr("regnId")).removeClass("hide").addClass("notSendMessage");
                }
            });
            //回头顶部
            $('#gotop').click(function () {
                $('body,html').animate({scrollTop: 0}, "500");
                return false;
            });
            //附件类型下载
            $("a[linkType = 'download']").click(function () {
                $(this).attr("href", Constants.AJAXURL + "/file/download?key=NGKM_FILE_ATTACH&fileId=" + $(this).attr("fileId") + "&fileName=" + encodeURIComponent($(this).html()));
            });
            //图片类型下载
            $("img[linkType = 'img']").each(function () {
                $(this).attr("src", Constants.AJAXURL + "/file/download?key=NGKM_PICTURE_FILE&fileId=" + $(this).attr("fileId"));
            });

            //视频类型
            $("object[linkType = 'video']").each(function () {
                var width = $(this).attr("width");
                var height = $(this).attr("height");
                var fileId = $(this).attr("fileId");
                var autostart = $(this).attr("autostart");
                var _key = "NGKM_MEDIA_FILE";
                var link = window.location.protocol + "//" + window.location.host + Constants.AJAXURL + "/file/downloadMedia/" + _key + "/" + fileId;
                var object = '<object id="flv__id__' + fileId + '" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + width + '" height="' + height + '">\n' +
                    '<param name="wmode" value="transparent">' +
                    '<param name="movie" value="edit/js/editor/plugin/flvplayer.swf">\n' +
                    '<param name="flashvars" value="file=' + link + '.mp4&autostart=' + autostart + '&image=&provider=video">\n' +
                    '<param name="quality" value="high">\n' +
                    '<param name="allowfullscreen" value="true">' +
                    '<embed wmode="transparent" type="application/x-shockwave-flash" src="edit/js/editor/plugin/flvplayer.swf" width="' + width + '" height="' + height + '" flashvars="file=' + link + '.mp4&autostart=' + autostart + '&provider=video" quality="high" allowfullscreen="true" pluginspage="http://www.macromedia.com/go/getflashplayer"></embed>' +
                    '</object><br>';
                $(this).replaceWith(object);
            });

            $("#viewContentSpan").click(function () {
                crossAPI.destroyTab('文件查看');
                crossAPI.createTab({
                    title: "文件查看",
                    url: window.location.protocol + "//" + window.location.host + Constants.PREAJAXURL + "/src/modules/knowledgeManage/fileview.mht"
                });
                $(".ke-inline-alert").removeClass("show");
            });
        }; //grpngEvent结束
        //处理知识路径
        var businessPaths = function (businessPathData) {
            var businessTree = $("#businessTree");
            var path = $("#path");
            for (var i = 0; i < businessPathData.length; i++) {
                var businessTreeData = businessPathData[i];
                var html;
                if (i === 0) {
                    var length = businessTreeData.length - 1;
                    html = '<li>';
                    var pathTop = '<p>'; //<p>套餐属性 > 4G套餐 > 4G飞享套餐 4G套餐 > 4G飞享套餐</p>
                    for (var j = 0; j < businessTreeData.length; j++) {
                        html += '<a href="javascript:void(0) " class="businessTreeClass" pId="' + businessTreeData[j].pId + '" id="' + businessTreeData[j].id + '">' + businessTreeData[j].name + '</a>';
                        if (j !== length) {
                            pathTop += businessTreeData[j].name + ">";
                        } else {
                            pathTop += businessTreeData[length].name + '</p>';
                        }
                    }
                    html += '</li>';
                    businessTree.children("a").prepend(pathTop);
                    path.append(html);
                } else {
                    html = '<li>';
                    for (var k = 0; k < businessTreeData.length; k++) {
                        html += '<a href="javascript:void(0)" class="businessTreeClass" pId="' + businessTreeData[k].pId + '" id="' + businessTreeData[k].id + '">' + businessTreeData[k].name + '</a>';
                    }
                    html += '</li>';
                    path.append(html);
                }
            }

            //hover 事件
            businessTree.hover(function () {
                $(this).addClass("active");
            }, function () {
                $(this).removeClass("active");
            });
        };  //businessPaths结束
            //目录的滚到条
        var navigation = function () {
            var outObj = $('.catalog-scroller');
            var menuObj = $('.catalog-list');
            var titleObj = $('.title-text');
            var goUp = $('.go-up');
            var goDown = $('.go-down');

            //控制上下键按钮状态
            function gobtn($name, small, big) {
                if (small <= big) {
                    $name.removeClass('disable');
                } else {
                    $name.addClass('disable');
                }
            }

            //页面滚动事件
            window.onscroll = function () {
                var t = $(document).scrollTop();
                if (t > 100) {
                    $('#gotop').fadeIn('fast');
                } else {
                    $('#gotop').fadeOut('fast');
                }
                if (titleObj.length < 1) {
                    return;
                }
                var ht = document.documentElement.scrollTop || document.body.scrollTop;
                var topnum;
                if (titleObj.last().offset().top === ht) {
                    return;
                }
                if (titleObj.last().offset().top < ht + 50) {
                    topnum = 26 * (titleObj.length - 1) + 4;
                    $('a.arrow').css("top", topnum);
                    return;
                }
                for (var i = 0; i < titleObj.length; i++) {
                    if (titleObj.eq(i).offset().top < ht + 50 && titleObj.eq(i + 1).offset().top > ht + 50) {
                        topnum = 26 * i + 4;
                        var cha = outObj.height() - menuObj.height() - 18;
                        $('a.arrow').css("top", topnum);
                        // $('a.arrow').animate({ top: 26 * i + 4 }, "fast");
                        //如果高度未撑满，menu位置无变化
                        if (cha > 18) {
                            return;
                        }
                        if (-topnum + 20 < cha) {
                            menuObj.css("top", cha);
                            goDown.addClass('disable');
                        } else if (topnum > 36) {
                            menuObj.css("top", -topnum + 20);
                            goUp.removeClass('disable');
                            goDown.removeClass('disable');
                        } else {
                            menuObj.css("top", 0);
                            goUp.addClass('disable');
                        }
                        return;
                    }
                }
            };
            //导航栏内部上下箭头点击事件-上箭头
            goUp.on('click', function () {
                if ($('.go-up.disable').length > 0) {
                    return
                }
                var y = parseInt(menuObj.css("top"));
                var cha = outObj.height() - menuObj.height() - 18;
                if (y <= -36) {
                    menuObj.css("top", y + 36);
                } else {
                    menuObj.css("top", 0);
                    goUp.addClass('disable');
                }
                gobtn(goDown, cha, y);
            });
            //导航栏内部上下箭头点击事件-下箭头
            goDown.on('click', function () {
                if ($('.go-down.disable').length > 0) {
                    return
                }
                var y = parseInt(menuObj.css("top"));
                var cha = outObj.height() - menuObj.height() + 18;
                if (y > cha) {
                    menuObj.css("top", y - 36);
                } else {
                    menuObj.css("top", cha - 36);
                    goDown.addClass('disable');
                }
                gobtn(goUp, y, 0);
            });
            //如果高度未撑满，按钮失效
            var outh = outObj.height();
            var inh = menuObj.height();
            if (outh > inh) {
                goUp.addClass('disable').unbind();
                goDown.addClass('disable').unbind();
            }
        }; //navigation end
        //处理tpl加载知识详情数据
        var hdb = function (knowledgeInfo) {
            //注册一个判断相等的Helper,判断v1是否等于v2
            Util.hdb.registerHelper("equal", function (v1, v2, options) {
                if (v1 === v2) {
                    //满足添加继续执行
                    return options.fn(this);
                } else {
                    //不满足条件执行{{else}}部分
                    return options.inverse(this);
                }
            });
            //注册一个判断相等的Helper,判断v1是否不等于v2
            Util.hdb.registerHelper("notEqual", function (v1, v2, options) {
                if (v1 !== v2) {
                    //满足添加继续执行
                    return options.fn(this);
                } else {
                    //不满足条件执行{{else}}部分
                    return options.inverse(this);
                }
            });
            //注册一个判断是否直接显示value值的Helper,是否直接显示value
            Util.hdb.registerHelper("normal", function (v1, options) {
                if (v1 === '1' || v1 === '2' || v1 === '3' || v1 === '4' || v1 === '5' || v1 === '6' || v1 === '7' || v1 === '9' ||
                    v1 === '11' || v1 === '12' || v1 === '14' || v1 === '16') {
                    //满足添加继续执行
                    return options.fn(this);
                } else {
                    //不满足条件执行{{else}}部分
                    return options.inverse(this);
                }
            });
            //注册一个判断是否有单位
            Util.hdb.registerHelper("unit", function (v1, options) {
                if (v1 === '5' || v1 === '9' || v1 === '11' || v1 === '12') {
                    //满足添加继续执行
                    return options.fn(this);
                } else {
                    //不满足条件执行{{else}}部分
                    return options.inverse(this);
                }
            });
            //注册一个判断数组为空的的Helper,判断item是否为空
            Util.hdb.registerHelper("blank", function (items, options) {
                if (items.length !== 0) {
                    //满足添加继续执行
                    return options.fn(this);
                } else {
                    //不满足条件执行{{else}}部分
                    return options.inverse(this);
                }
            });
            //编译左侧，分组及原子
            var templateLeft;
            if (knowledgeInfo.knwlgGathrTypeCd === "2") {
                templateLeft = Util.hdb.compile(klgInfoGroupPreGathr);
            } else {
                templateLeft = Util.hdb.compile(klgInfoGroup);
            }
            var klgLeft = templateLeft(knowledgeInfo);
            $(".detail-left").html(klgLeft);
            if (knwlgNM.length > 105) {
                var knwlgNm = knwlgNM.substring(0, 105) + "...";
                $('#knwlgNm').text(knwlgNm);
            }
            $('#gotop').hide();
            $(".left-content-subtitle").each(function () {
                if ($(this).find("div.atoms").length === 0) {
                    $(this).remove();
                    $("a[href='#" + $(this).find("a.para-title").attr('id') + "']").parent().remove();
                }
            });
            $(".left-content").each(function () {
                if ($(this).find("div.atoms").length === 0) {
                    $(this).remove();
                    $("a[href='#" + $(this).attr('id') + "']").parent().remove();
                }
            });
            var templateAttr = Util.hdb.compile(klgInfoAttr);
            $("#KnowledgeAttributes").html(templateAttr(knowledgeInfo));
            businessPaths(knowledgeInfo.businessTreePaths);
            $(".exception").each(function () {
                if ($(this).attr("regnId") === knowledgeInfo.userScope) {
                    $(this).parent("li").siblings().removeClass("active");
                    $(this).parent("li").addClass("active");
                    var sel = $(this).parents("div.atoms");
                    var atomId = sel.attr("atomId");
                    sel.children('.' + atomId).addClass("hide");
                    sel.children("." + $(this).attr("regnId")).removeClass("hide");
                    if ($(this).attr("isSendMes") === "1") {
                        $(this).parents("div.left-words").find("a.message").addClass("hide").removeClass("notSendMessage");
                        $(this).parents("div.left-words").find("a." + $(this).attr("regnId")).removeClass("hide");
                    } else {
                        $(this).parents("div.left-words").find("a.message").addClass("hide");
                        $(this).parents("div.left-words").find("a." + $(this).attr("regnId")).removeClass("hide").addClass("notSendMessage");
                    }
                }
            });
            grpngEvent();
            navigation();
        }; //hdb结束

        //右侧关联知识事件
        var relateEvent = function () {
            //知识关联类型闭合事件
            $("#mutexRltKnwlg, #rltKnwlg, #seriesRltKnwlg").click(function () {
                var i = $(this).find("i");
                if (i.hasClass("km-shanglajiantou")) {
                    i.removeClass("km-shanglajiantou");
                    i.addClass("km-xialajiantou");
                    $(this).parent().next().hide();
                } else {
                    i.removeClass("km-xialajiantou");
                    i.addClass("km-shanglajiantou");
                    $(this).parent().next().show();
                }
            });

        };
        //知识关联
        var relateKnwlg = function () {
            var config1 = {
                type: 'post',  //请求类型 '../../../relate.json'
                url:Util.constants.CONTEXT+ '/knowledge/knwlgBusinessRelate', //Constants.AJAXURL + '/knowledge/getKmDetatil',    //接受请求的地址
                data: {knwlgId: knwlgId, verNo: "", isPublished: isPublished},  //要传递给url的数据
                dataType: 'json', //返回值的数据类型
                success: function (result, isOk) {
                    if (isOk === false) {
                        console.log("获取最近浏览知识error");
                        return false;
                    }
                    var relateKmInfo = result.object;
                    var templateRelate = Util.hdb.compile(klgInfoRelate);
                    var relateklgRight = templateRelate(relateKmInfo);
                    var verNo = kmUtil.getUrlParamter("verNo");//版本号
                    $("#ralateKnowledge").html(relateklgRight);
                    relateEvent();
                    var arryItems = relateKmInfo.rltKnwlgItems;
                    if (arryItems) {
                        $(arryItems).each(function (index, ele) {
                            var rltObjectId = ele.rltObjId;
                            $("#" + rltObjectId).click(function () {
                                crossAPI.destroyTab("关联知识");
                                crossAPI.createTab({
                                    title: "关联知识",
                                    url: window.location.protocol + "//" + window.location.host + Constants.PREAJAXURL + "/src/modules/knowledgeManage/knowledgeDetail.html?knwlgId=" + rltObjectId + "&verNos=" + verNo
                                });
                                $(".ke-inline-alert").removeClass("show");
                            });
                        });
                    }
                },  //url调用成功后执行的回调函数
                error: function (jqXHR, textStatus, errorThrown) {
                    $.messager.alert('error', errorThrown);
                }  //url调用失败后执行的回调函数
            };
            Util.ajax.ajax(config1);
        }; //relateKnwlg end
        //查询知识详情
        var getKnowledgeInfo = function () {
            verNo = kmUtil.getUrlParamter("verNo");//版本号
            var config = {
                type: 'get',  //请求类型 '../../../data.json'
                url: Util.constants.CONTEXT+ '/knowledge/knwlgBusinessDetails', //Constants.AJAXURL + '/knowledge/getKmDetatil',    //接受请求的地址
                data: {knwlgId: knwlgId, verNo: verNo, isPublished: isPublished, isBackStage: isBackStage},  //要传递给url的数据 "knwldgeId": "201712232219151092"
                dataType: 'json', //返回值的数据类型
                success: function (data, textStatus) {
                    if (textStatus !== "success") {
                        console.log("获取知识信息error");
                        return false;
                    }
                    if (data.returnCode !== '0') {
                        $.messager.alert('confirm', data.returnMessage);
                        //new myAlert({'type': 'confirm', 'text': data.returnMessage, falseShow: false});
                        return false;
                    }
                    if (data.object === null || data.object === undefined) {
                        $.messager.alert('confirm', data.returnMessage);
                        //new myAlert({'type': 'confirm', 'text': data.returnMessage, falseShow: false});
                        return false;
                    }
                    var knowledgeInfo = data.object;
                    knwlgNM = knowledgeInfo.knwlgNM;
                    document.title = knwlgNM;
                    hdb(knowledgeInfo);
                },  //url调用成功后执行的回调函数
                error: function (jqXHR, textStatus, errorThrown) {
                    $.messager.alert('error', errorThrown);
                    // new myAlert({'type': 'error', 'text': errorThrown});
                }  //url调用失败后执行的回调函数
            };
            Util.ajax.ajax(config);
        }; //getKnowledgeInfo end

        var initialize = function () {
            //知识详细信息
            getKnowledgeInfo();
            //关联知识
            relateKnwlg();
        };

    });