define(["jquery", "loading", "transfer", 'util',"hdb",'text!html/manage/versionCompare.tpl', "easyui"],
    function ($, Loading, Transfer, Util,Hdb,versionCompareTpl) {
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
            leftKnwlgVerId = searchData.leftKnwlgVerId;
            rightKnwlgVerId = searchData.rightKnwlgVerId;

            getKnwlgIds();
            getKnwlgDetail();
        });
        /**
         * 判断参数获取成功
         */
        function getKnwlgIds() {
            if (!leftKnwlgVerId || !rightKnwlgVerId) {
                alert("error:链接参数错误");
                return;
            }
            getKnwlgDetail();
        };
        /**
         * 请求后台获取数据
         */
        function getKnwlgDetail() {
            var searchParam = {};
            searchParam.leftKnwlgVerId = leftKnwlgVerId;
            searchParam.rightKnwlgVerId = rightKnwlgVerId;
            Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocVersionManage/docVersionCompare", searchParam, function (data) {
                if (data.STATUS == 0000) {
                    var details = data.RSP.DATA;
                    var leftDetail = Hdb.compile(versionCompareTpl);
                    var rightDetail = Hdb.compile(versionCompareTpl);
                    //时间戳转化为时间
                    for(var i=0;i<2;i++){
                        var date1=new Date(details[i].versionMessage.modfTime);
                        details[i].versionMessage.modfTime=date1.toLocaleDateString().replace(/\//g, "-") + " " + date1.toTimeString().substr(0, 8);
                        var date2=new Date(details[i].logMessage.modfTime);
                        details[i].logMessage.modfTime=date2.toLocaleDateString().replace(/\//g, "-") + " " + date2.toTimeString().substr(0, 8);
                    }
                    var left = leftDetail(details[0]);
                    var right = rightDetail(details[1]);
                    $(".left-wrap").html(left);
                    $(".right-wrap").html(right);
                    buildDownLoadLink();
                    mkSameHeight();
                    makeReasonSame();
                    showDetail(details[0].versionMessage);
                    showDetail(details[1].versionMessage);
                } else {
                    alert("error" + data);
                }
            });
        };
        /**
         * 查看历史版本详情
         */
        var showDetail = function(versionMessage){
            $("#" + versionMessage.knwlgVerId).click(function(){
                //页面跳转url
                window.open("../../html/manage/knowledgeDetail.html?knwlgId="+versionMessage.knwlgId+"&verNo="+versionMessage.verNo+"&isPublished=1");  //打开版本详情页面
            });
        };
        /**
         * 构造下载链接
         */
        var buildDownLoadLink = function(){
            $(".filedownload").each(function(){
                var fileNm = trim($(this).html());
                var fileId = this.id;

                $(this).attr("href", Util.constants.CONTEXT + "/file/download?fileId=" + fileId + "&fileName=" + fileNm + "&key=" + _key);
            });
        };
        /**
         * 将左右两侧的table高度设置成一致
         */
        var mkSameHeight = function(){
            var leftTd = $(".left-wrap td.td-content");
            var rightTd = $(".right-wrap td.td-content");
            for(var i = 0, n = leftTd.length;i < n;i ++){
                if($(leftTd[i]).height() < $(rightTd[i]).height()){
                    $(leftTd[i]).css("height", $(rightTd[i]).height() + "px");
                }else if($(leftTd[i]).height() > $(rightTd[i]).height()){
                    $(rightTd[i]).css("height", $(leftTd[i]).height() + "px");
                }
                if($(leftTd[i]).html() != $(rightTd[i]).html()){
                    $(leftTd[i]).html("<span class='color-red'>" + $(leftTd[i]).html() + "</span>");
                    $(rightTd[i]).html("<span class='color-red'>" + $(rightTd[i]).html() + "</span>");

                }
            }
        };
        var makeReasonSame = function(){
            var leftReason = $(".reason")[0];
            var rightReason = $(".reason")[1];
            var leftTitle = $(".reasonTitlt")[0];
            var rightTitle = $(".reasonTitlt")[1];

            if($(leftReason).height() > $(rightReason).height()){
                $(rightReason).css("height", $(leftReason).height() + "px");
                $(rightTitle).css("height", $(leftTitle).height() + "px");
            }else{
                $(leftReason).css("height", $(rightReason).height() + "px");
                $(leftTitle).css("height", $(rightTitle).height() + "px");
            }
        };
    });