require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var evaluationType = "NGKM.FDBK.EVALU.TYPE";   //数据字典搜索参数
    /**
     * 根据知识编号查询知识详情
     * @param ids
     */
    var getData = function (ids, verNos) {
        var items = [];
        //debugger
        if (ids.length > 0) {
            for (var i = 0; i < ids.length; i++) {
                if (verNos != undefined) {
                    items[i] = getKmInfo(ids[i], verNos[i]);
                } else {
                    items[i] = getKmInfo(ids[i], '');
                }
            }
        }
        return items;
    };

    /**
     * 查询详情
     * @param id
     * @returns {{}}
     */
    var getKmInfo = function (id, verNo) {
        // var data = {};
        // var params = {knwlgId: id, verNo: verNo, isPublished: 0, isBackStage: 1};
        // Util.ajax.getJson(Util.constants.CONTEXT + "/knowledge/knwlgBusinessDetails", params,
        //
        //     function (result) {
        //         // var data = Transfer.DataGrid.transfer(result);
        //         data = result.RSP.DATA;
        //
        //         if (data == null || data == "") {
        //
        //             $.messager.alert("提示",result.RSP.RSP_DESC);
        //
        //             return false;
        //         }
        //     }, true);
        //
        // return data;

        var result={};
        var data;

        if (id == "1"){
            data = {"returnCode":"0","beans":[],"returnMessage":"查询成功","totalCount":0,"bean":{"total":0},"object":[{"knwlgNM":"测试用的B","knwlgGathrTypeCd":"1","knwlgAls":"","knwlgId":"180910112004000012","opPrsnId":"ddd","businessTreePaths":[[{"chnlCode":"1","name":"基础服务","pId":0,"id":10500771},{"chnlCode":"1","name":"基础业务","pId":10500771,"id":10501771}]],"tabs":[],"knwldgGroupItems":[{"grpngId":"180910112004000031","argeSeqNo":76,"@class":"java.util.HashMap","grpngNm":"分组","grpngTypeCd":"1","knwldgGroupItems2":[],"srcTmpltGrpngId":"180529151448000021","atrrItems":[{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910112004000118","paraNm":"问题","cntt":"凄凄切切","originalCntt":"凄凄切切","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910112005000119","paraNm":"答案","cntt":"呜呜呜呜呜凄凄切切","originalCntt":"呜呜呜呜呜凄凄切切","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910112005000120","paraNm":"描述","cntt":"的都是多多所多所","originalCntt":"的都是多多所多所","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"}]}],"crtTime":"2018-09-10 11:20:05","verNo":"V1","tmpltId":"180529151430000036","editTime":"1","modfTime":"2018-09-10 11:20:07","tmpltNm":"问答知识","regnNm":"南宁","regnId":"0771","respPrsnId":"ddd"}]};

        }else if (id == "2") {
            data = {"returnCode":"0","beans":[],"returnMessage":"查询成功","totalCount":0,"bean":{"total":0},"object":[{"knwlgNM":"测试用的A","knwlgGathrTypeCd":"1","knwlgAls":"","knwlgId":"180910111756000011","opPrsnId":"ddd","businessTreePaths":[[{"chnlCode":"1","name":"基础服务","pId":0,"id":10500771},{"chnlCode":"1","name":"基础业务","pId":10500771,"id":10501771}]],"tabs":[],"knwldgGroupItems":[{"grpngId":"180910111756000030","argeSeqNo":76,"@class":"java.util.HashMap","grpngNm":"分组","grpngTypeCd":"1","knwldgGroupItems2":[],"srcTmpltGrpngId":"180529151448000021","atrrItems":[{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910111756000115","paraNm":"问题","cntt":"凄凄切切","originalCntt":"凄凄切切","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910111757000116","paraNm":"答案","cntt":"呜呜呜呜呜呜呜呜","originalCntt":"呜呜呜呜呜呜呜呜","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910111757000117","paraNm":"描述","cntt":"呃呃呃呃呃呃呃呃呃呃呃呃","originalCntt":"呃呃呃呃呃呃呃呃呃呃呃呃","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"}]}],"crtTime":"2018-09-10 11:17:57","verNo":"V1","tmpltId":"180529151430000036","editTime":"1","modfTime":"2018-09-10 11:17:59","tmpltNm":"问答知识","regnNm":"南宁","regnId":"0771","respPrsnId":"ddd"}]};
        } else {
            data = {"returnCode":"0","beans":[],"returnMessage":"查询成功","totalCount":0,"bean":{"total":0},"object":[{"knwlgNM":"客户化分发任务B","knwlgGathrTypeCd":"1","knwlgAls":"","knwlgId":"180910105726000010","opPrsnId":"ddd","businessTreePaths":[[{"chnlCode":"1","name":"语音业务","pId":0,"id":10200771}]],"tabs":[],"knwldgGroupItems":[{"grpngId":"180910105726000029","argeSeqNo":76,"@class":"java.util.HashMap","grpngNm":"分组","grpngTypeCd":"1","knwldgGroupItems2":[],"srcTmpltGrpngId":"180529151448000021","atrrItems":[{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910105726000112","paraNm":"问题","cntt":"凄凄切切","originalCntt":"凄凄切切","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910105726000113","paraNm":"答案","cntt":"反反复复付付付付付付付付付付付","originalCntt":"反反复复付付付付付付付付付付付","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"},{"@class":"java.util.HashMap","knwlgAttrAtomId":"180910105727000114","paraNm":"描述","cntt":" 少时诵诗书所所所所所所所","originalCntt":" 少时诵诗书所所所所所所所","exceptionMapList":[],"paraTypeCd":"1","isSendMes":"1"}]}],"crtTime":"2018-09-10 10:57:27","verNo":"V1","tmpltId":"180529151430000036","editTime":"1","modfTime":"2018-09-10 10:57:28","tmpltNm":"问答知识","regnNm":"广西","regnId":"771","respPrsnId":"ddd"}]};
        }
        //

        result = data.object;
        return result;
    };


    /**
     *在数组中检查是否存在改对象
     * @param arr 数组
     * @param obj 对象
     * @param key 字段
     * @returns {boolean}
     */
    var isContains = function (arr, obj, key) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] == obj[key]) {
                return true;
            }
        }
        return false;
    };

    /**
     * 获取数组中某属性值为val的对象
     * @param arr
     * @param attr
     * @param val
     * @returns {*}
     */
    var getObjectByAttr = function (arr, attr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][attr] == val) {
                return arr[i];
            }
        }
        return null;
    };


    /**
     * 取公共结构
     * @param datas
     */
    var getAllNode = function (datas) {

        //遍历{一级目录}
        //从[新对象]一级目录中判断{一级目录}是否存在不存在添加
        //遍历{一级目录}下{二级目录}
        //判断[新对象]中[一级目录]中{二级目录}是否存在不存在则添加
        //遍历{一级目录}下{二级目录}下的{原子列表}
        //判断[新对象]中[二级目录]中{原子}是否存在，不存在这添加

        //遍历{一级目录}下{原子}
        //判断[新对象]中[一级目录]中{原子}是否存在不存在则添加

        var newData = {knwldgGroupItems: []};
        for (var i = 0; i < datas.length; i++) {
            var klg = datas[i];
            var knwldgGroupItemss = klg[0].knwldgGroupItems;  //一级分组数组
            //【logic】遍历{一级目录}
            for (var j = 0; j < knwldgGroupItemss.length; j++) {
                var knwldgGroupItem = knwldgGroupItemss[j];//一级分组
                // console.log("第【"+i+"】个知识的第【"+j+"】个一级分组:",knwldgGroupItem);
                var newKnwldgGroupItem = getObjectByAttr(newData.knwldgGroupItems, "srcTmpltGrpngId", knwldgGroupItem.srcTmpltGrpngId);

                //【logic】从[新对象]一级目录中判断{一级目录}是否存在不存在添加
                if (newKnwldgGroupItem == null) {//如果不存在添加一级目录
                    var newKnwldgGroupItemTemp = JSON.parse(JSON.stringify(knwldgGroupItem));//深度复制
                    newKnwldgGroupItemTemp.atrrItems = [];
                    newKnwldgGroupItemTemp.knwldgGroupItems2 = [];
                    newKnwldgGroupItem = newKnwldgGroupItemTemp;
                    newData.knwldgGroupItems.push(newKnwldgGroupItem);
                }

                var knwldgGroupItems2 = knwldgGroupItem.knwldgGroupItems2 || []; //二级分组数组
                //【logic】遍历{一级目录}下{二级目录}
                if (knwldgGroupItems2.length > 0) {//有二级分组
                    for (var k = 0; k < knwldgGroupItems2.length; k++) {
                        var secondGroupItem = knwldgGroupItems2[k];//二级分组对象

                        //【logic】判断[新对象]中[一级目录]中{二级目录}是否存在不存在则添加
                        var newsecondGroupItem = getObjectByAttr(newKnwldgGroupItem.knwldgGroupItems2, "srcTmpltGrpngId", secondGroupItem.srcTmpltGrpngId);
                        if (newsecondGroupItem == null) {//如果不存在
                            var newsecondGroupItemTemp = JSON.parse(JSON.stringify(secondGroupItem));//深度复制
                            newsecondGroupItemTemp.atrrItems = [];
                            newsecondGroupItem = newsecondGroupItemTemp;
                            newKnwldgGroupItem.knwldgGroupItems2.push(newsecondGroupItem);
                        }
                        // console.log("第【"+i+"】个知识的第【"+j+"】个一级分组下的第【"+k+"】个二级分组:",secondGroupItem);
                        //【logic】遍历{一级目录}下{二级目录}下的{原子列表}
                        var secAtrrItems = secondGroupItem.atrrItems || [];
                        for (var m = 0; m < secAtrrItems.length; m++) {
                            var secAttrItem = secAtrrItems[m];
                            var newSecAttr = getObjectByAttr(newsecondGroupItem.atrrItems, "paraNm", secAttrItem.paraNm);
                            //判断[新对象]中[二级目录]中{原子}是否存在，不存在则添加
                            if (newSecAttr == null) {//如果不存在
                                newsecondGroupItem.atrrItems.push(secAttrItem);
                            }
                        }

                    }
                }

                var atrrItems = knwldgGroupItem.atrrItems || []; //一级原子
                if (atrrItems.length > 0) {
                    //从新对象中获取该分组对象
                    var knwldgGroupItemTepm2 = getObjectByAttr(newData.knwldgGroupItems, "srcTmpltGrpngId", knwldgGroupItem.srcTmpltGrpngId);
                    //遍历当前知识的改分组下的原子进行判断添加
                    for (var k = 0; k < atrrItems.length; k++) {
                        var atrrItem = atrrItems[k];
                        if (!isContains(knwldgGroupItemTepm2.atrrItems, atrrItem, "paraNm")) {
                            knwldgGroupItemTepm2.atrrItems.push(atrrItem);
                        }
                    }
                }
            }

        }
        return newData;
    };

    var getTrhtml = function (data, klglist, param) {
        var tdsHtml = '';
        if (param.paraNm == "-1") {
            for (var i = 0; i < klglist.length; i++) {
                tdsHtml = tdsHtml + '<td><div class="con-inner">&nbsp;</div></td>';
            }
        } else {
            var contents = [];
            var flag = true;
            for (var i = 0; i < klglist.length; i++) {
                var content = getContentHtmlByName(klglist[i], param);
                tdsHtml = tdsHtml + '<td><div class="con-inner">' + content + '</div></td>';
                contents.push(content);
                if (i > 0) {
                    flag = flag && (contents[i] == contents[i - 1]);
                }
            }

        }
        return {tdsHtml: tdsHtml, isSame: flag};
    };

    var transAttrContent = function (attrItem) {
        // console.log(attrItem);
        var html = "";
        var cnttContent = "";
        var annoContent = "";
        var excpContent = "";
        if (attrItem.cntt instanceof Array) {
            for (var k in attrItem.cntt) {
                cnttContent += "<p>" + attrItem.cntt[k];
                if ("wkunit" in attrItem) {
                    if (attrItem.wkunit[k] != undefined) {
                        cnttContent += attrItem.wkunit[k];
                    }
                }
                cnttContent += "</p>";
            }
        } else {
            cnttContent += "<p>" + attrItem.cntt;
            if ("wkunit" in attrItem) {
                if (attrItem.wkunit != undefined) {
                    cnttContent += attrItem.wkunit;
                }
            }
            cnttContent += "</p>";
        }

        if ("annotation" in attrItem) {
            if (attrItem.annotation["annotation"] != undefined) {
                annoContent += '<span class="is-zhujie" title="注解"><i class="icon km-zhujie"></i>：' + attrItem.annotation["annotation"] + '</span>';
            }
        }
        if ("exceptionMapList" in attrItem) {
            if (attrItem.exceptionMapList.length > 0) {
                excpContent += "例外："
                for (var i = 0; i < attrItem.exceptionMapList.length; i++) {
                    //例外城市
                    excpContent += attrItem.exceptionMapList[i].regnNm;
                    if (attrItem.exceptionMapList.length - 1 > i > 0) {
                        excpContent += "、";
                    }
                }
            }
        }
        html += cnttContent + "<p>" + annoContent + "</p><p>" + excpContent + '</p>';

        return html;
    };
    /**
     * 获取原子内容
     * @param klg
     * @param param
     * @returns {string}
     */
    var getContentHtmlByName = function (klg, param) {
        var resultHtml = "";
        for (var i = 0; i < klg[0].knwldgGroupItems.length; i++) {
            var knwldgGroupItem = klg[0].knwldgGroupItems[i];
            // console.log(param,knwldgGroupItem,(param.grouplevel1 == knwldgGroupItem.srcTmpltGrpngId));
            if (param.grouplevel1 == knwldgGroupItem.srcTmpltGrpngId) {
                if (param.grouplevel2 == "#") {//无二级分组
                    var attr = knwldgGroupItem.atrrItems || [];
                    for (var j = 0; j < attr.length; j++) {
                        var attrItem = attr[j];
                        if (attrItem.paraNm == param.paraNm) {
                            resultHtml = transAttrContent(attrItem);
                        }
                    }
                } else {//有二级分组
                    var knwldgGroupItems2 = knwldgGroupItem.knwldgGroupItems2 || [];
                    for (var j = 0; j < knwldgGroupItems2.length; j++) {
                        var knwldgGroup2Item = knwldgGroupItems2[j];
                        if (knwldgGroup2Item.srcTmpltGrpngId == param.grouplevel2) {
                            var atrrItems = knwldgGroup2Item.atrrItems || [];
                            for (var k = 0; k < atrrItems.length; k++) {
                                var atrrItem = atrrItems[k];
                                resultHtml = Comm(atrrItem, param);
                                if (resultHtml) {
                                    break;
                                }
                            }
                        }

                    }
                }
            }

        }
        // console.log(resultHtml);
        if (Object.prototype.toString.call(resultHtml) == '[object Array]') {
            resultHtml = resultHtml.join(" ");
        }
        return resultHtml;
    };

    //修复sonar扫描问题
    var Comm = function (atrrItem, param) {
        if (atrrItem.paraNm == param.paraNm) {
            return transAttrContent(atrrItem);
        } else {
            return "";
        }
    }

    /**
     * 创建表格html
     * @param data
     * @param klglist
     */
    var creatTab = function (data, klglist) {
        var title = '<th>' +
            '<label for="same"><input id="same" type="checkbox">隐藏相同项</label>' +
            '<label for="diff"><input id="diff" type="checkbox">高亮不同项</label>' +
            '</th>';
        $("#tableTitleId").append(title);
        for (var i = 0; i < klglist.length; i++) {
            if (verNos != undefined) {
                $("#tableTitleId").append('<td><a href="javascript:;" verNo="' + klglist[i][0].verNo + '" klgId="' + klglist[i][0].knwlgId + '">' + klglist[i][0].knwlgNM + '(' + klglist[i][0].verNo + ')</a></td>');
            } else {
                $("#tableTitleId").append('<td><a href="javascript:;" verNo="" klgId="' + klglist[i][0].knwlgId + '">' + klglist[i][0].knwlgNM + '</a></td>');
            }
        }

        for (var i = 0; i < data.knwldgGroupItems.length; i++) {
            var leve1Group = data.knwldgGroupItems[i];
            var tbodyHtml = '<tr class="level-1"><th><div class="con-inner">' + leve1Group.grpngNm + '</div></th>' + getTrhtml(data, klglist, {attrNm: "-1"}).tdsHtml + '</tr>';
            //二级分组
            var knwldgGroupItems2 = leve1Group.knwldgGroupItems2;
            for (var j = 0; j < knwldgGroupItems2.length; j++) {
                var knwldgGroup2Items = knwldgGroupItems2[j];
                var secTitle = '<tr>' +
                    '<th><div class="con-inner"><a class="level-2 open" href="javascript:;" groupId="' + knwldgGroup2Items.srcTmpltGrpngId + '">' + knwldgGroup2Items.grpngNm + '</a></div></th>' +
                    getTrhtml(data, klglist, {attrNm: "-1"}).tdsHtml +
                    '</tr>';
                $("#tableBodyId").append(secTitle);

                var secAtrrItems = knwldgGroup2Items.atrrItems || [];
                for (var k = 0; k < secAtrrItems.length; k++) {
                    var atrrItem = secAtrrItems[k];
                    var htmlObj = getTrhtml(data, klglist, {
                        grouplevel1: leve1Group.srcTmpltGrpngId,
                        grouplevel2: knwldgGroup2Items.srcTmpltGrpngId,
                        paraNm: atrrItem.paraNm
                    });
                    var atrrItemHtml = '<tr isSame="' + htmlObj.isSame + '" attrGroupId="' + knwldgGroup2Items.srcTmpltGrpngId + '">' +
                        '<th><div class="con-inner"><span class="level-3">' + atrrItem.paraNm + '</span></div></th>' + htmlObj.tdsHtml +
                        '</tr>';
                    $("#tableBodyId").append(atrrItemHtml);
                }

            }
            //一级分组原子
            var atrrItems = leve1Group.atrrItems || [];
            for (var j = 0; j < atrrItems.length; j++) {
                var atrrItem = atrrItems[j];
                var htmlObj = getTrhtml(data, klglist, {
                    grouplevel1: leve1Group.srcTmpltGrpngId,
                    grouplevel2: "#",
                    paraNm: atrrItem.paraNm
                });
                var atrrItemHtml = '<tr isSame="' + htmlObj.isSame + '">' +
                    '<th><div class="con-inner"><span class="level-3">' + atrrItem.paraNm + '</span></div></th>' + htmlObj.tdsHtml +
                    '</tr>';
                $("#tableBodyId").append(atrrItemHtml);
            }
        }

    };

    var initEvent = function () {
        $("#diff").click(function () {
            if (this.checked) {//高亮
                $("tr[isSame=false]").addClass("bg-high");
            } else {//取消高亮
                $("tr[isSame=false]").removeClass("bg-high");
            }
        });

        //隐藏相同项
        $("#same").click(function () {
            if (this.checked) {
                $("tr[isSame=true]").hide();

                //attrgroupid = groupId 并且isSame =  true 则隐藏 二级分组
                $("a[groupId]").each(function () {
                    var me = this;
                    var groupId = $(me).attr("groupid");
                    var arr = new Array();
                    var i = 0
                    $("tr[attrgroupid=" + groupId + "]").each(function () {
                        arr[i] = $(this).attr("issame");
                        i++;
                    })

                    if (($.inArray("false", arr)) == -1) {
                        $(me).removeClass("level-2 open").addClass("level-2 close");
                    }
                });

            } else {
                $("tr[isSame=true]").show();
                $("a[groupId]").each(function () {
                    $(this).removeClass("level-2 close").addClass("level-2 open");
                });
            }
        });

        $("a[groupId]").click(function (e) {
            var me = this;
            if ($(me).hasClass("open")) {
                $(me).removeClass("open").addClass("close");
                $("tr[attrGroupId=" + $(me).attr("groupId") + "]").hide();
            } else {
                $(me).removeClass("close").addClass("open");
                $("tr[attrGroupId=" + $(me).attr("groupId") + "]").show();
            }
        });

        $("a[klgId]").click(function () {
            var me = this;
            var knwlgId = $(me).attr("klgId");
            var verNo = $(me).attr("verNo");
            window.open("../../html/manage/kmKnowledgeHistoryVersionList.html?knwlgId=" + knwlgId + "&verNo=" + verNo );
        });

        //原子内容含有链接处理
        //附件类型下载
        // $("a[linkType = 'download']").click(function () {
        //     // window.location.href = Constants.AJAXURL + "/file/download?key=NGKM_FILE_ATTACH&fileId=" + $(this).attr("fileId") + "&fileName=" + $(this).html();
        //     $(this).attr("href",Constants.AJAXURL + "/file/download?key=NGKM_FILE_ATTACH&fileId=" + $(this).attr("fileId") + "&fileName=" + encodeURIComponent($(this).html()));
        // });
        // //图片类型下载
        // $("img[linkType = 'img']").each(function () {
        //     $(this).attr("src", Constants.AJAXURL + "/file/download?key=NGKM_PICTURE_FILE&fileId=" + $(this).attr("fileId"));
        // });
        //知识类型
        // $("a[linkType = 'relateKm']").click(function () {
        //     var me = this;
        //     kmUtil.openTab($(me).text(),Constants.PREAJAXURL+"/src/modules/knowledgeAppNew/knowledgeDetail.html?knwlgId="+$(me).attr("fileId"),{});
        // });

        //视频类型
        // $("object[linkType = 'video']").each(function () {
        //     //debugger
        //     var width = $(this).attr("width");
        //     var height = $(this).attr("height");
        //     var fileId = $(this).attr("fileId");
        //     var autostart = $(this).attr("autostart");
        //     var _key = "NGKM_MEDIA_FILE";
        //     var link = window.location.protocol + "//" + window.location.host  + Constants.AJAXURL + "/file/downloadMedia/" + _key + "/" + fileId;
        //     var object = '<object id="flv__id__' + fileId + '" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + width + '" height="' + height + '">\n' +
        //         '<param name="wmode" value="transparent">' +
        //         '<param name="movie" value="edit/js/editor/plugin/flvplayer.swf">\n' +
        //         '<param name="flashvars" value="file=' + link + '.mp4&autostart=' + autostart + '&image=&provider=video">\n' +
        //         '<param name="quality" value="high">\n' +
        //         '<param name="allowfullscreen" value="true">' +
        //         '<embed wmode="transparent" type="application/x-shockwave-flash" src="edit/js/editor/plugin/flvplayer.swf" width="' + width + '" height="' + height + '" flashvars="file=' + link + '.mp4&autostart=' + autostart + '&provider=video" quality="high" allowfullscreen="true" pluginspage="http://www.macromedia.com/go/getflashplayer"></embed>' +
        //         '</object><br>';
        //     $(this).replaceWith(object);
        // });


    };

    // 序列化url查询参数
    function serilizeUrl(url) {
        var result = {};
        // url = url.split("?")[1];
        var map = url.split("&");
        for(var i = 0, len = map.length; i < len; i++){
            result[map[i].split("=")[0]] = map[i].split("=")[1];
        }
        return result;
    }


        // 路径查询参数部分
        var searchURL = decodeURI(window.location.search);
        searchURL = searchURL.substring(1, searchURL.length);
        // 参数序列化
        debugger;
        var searchData = serilizeUrl(decodeURI(searchURL));

        var ids = searchData.ids;
        var idsArr = ids.split(",");

        var verNos = searchData.verNos;
        var verNoArr;
        if (verNos != undefined) {
            verNoArr = verNos.split(",");
        }

        var klgDatas = getData(idsArr, verNoArr);
        var allNode = getAllNode(klgDatas);
        creatTab(allNode, klgDatas);
        initEvent();
});