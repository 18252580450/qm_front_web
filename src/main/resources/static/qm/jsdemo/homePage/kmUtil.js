//知识前台打开页面方式,1:open,2:tab
/**
 * 知识库工具类
 */
define(["util","js/homePage/components/crossAPI","js/homePage/constants/constants","js/homePage/components/log"],function(Util,crossAPI,Constants,log){
    var _root =  window.location.protocol+"//"+ window.location.host;
    if($("#tagOpenWin").length<1){
        $("body").append('<a id="tagOpenWin" target="_blank" ></a>');
    }
    return{
        /**
         * 打开方式常量
         **/
        openMode : {open:"1",tab:"2"},
        /**
         * 获取URL参数
         **/
        getUrlParamter : function(key){
            var searchURL = decodeURI(window.location.href);
            var begin = searchURL.indexOf("?");
            searchURL = searchURL.substr(begin+1);
            var query = decodeURI(searchURL);
            // var query = location.search.substring(1); //获取查询串
            var pairs = query.split("&"); //在逗号处断开
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('='); //查找name=value
                if (pos == -1) continue; //如果没有找到就跳过
                var argname = pairs[i].substring(0, pos); //提取name
                if(argname == key){
                    return pairs[i].substring(pos + 1);
                }
            }
            return null;
        },
        /**
         * 设置前台页面打开方式
         **/
        setOpenMode:function(openMode){
            var storage = window.localStorage;
            storage.setItem('openMode', openMode);
            window.openMode = openMode;
        },
        /**
         * 获取页面打开方式
         **/
        getOpenMode:function(){
            var storage = window.localStorage;
            return storage.getItem('openMode');
        },
        /**
         *知识前台打开另一页面方法
         * @param name 名称
         * @param url 路径
         * @param name param 参数，示例:{ businessID:15 }
         */
        openTab : function(name,url,param,openType){
            var storage = window.localStorage;
            var openMode = storage.getItem('openMode');
            //2采用crossAPI打开页面
            if(openMode == this.openMode.tab){
                var count = 0;
                if(null != param){
                    var paramStr = "";
                    for(var key in param){
                        if(count != 0){
                            paramStr = paramStr + "&";
                        }
                        paramStr = paramStr + key+"="+param[key];
                        count++;
                    }
                    if(null != paramStr && paramStr != ""){
                        url = url + "?"+paramStr;
                    }
                }
                crossAPI.destroyTab(name);
                crossAPI.createTab(name, _root +url, param);
                if(openType && openType.tabName){
                    crossAPI.destroyTab(openType.tabName);
                }
            }
            else{
                var fulls = "left=0,screenX=0,top=0,screenY=0,scrollbars=1";
                if (window.screen) {
                    var ah = screen.availHeight - 30;
                    var aw = screen.availWidth - 10;
                    fulls += ",height=" + ah;
                    fulls += ",innerHeight=" + ah;
                    fulls += ",width=" + aw;
                    fulls += ",innerWidth=" + aw;
                    fulls += ",resizable"
                } else {
                    fulls += ",resizable"; // 对于不支持screen属性的浏览器，可以手工进行最大化。 manually
                }
                var count = 0;
                if(null != param){
                    var paramStr = "";
                    for(var key in param){
                        if(count != 0){
                            paramStr = paramStr + "&";
                        }
                        paramStr = paramStr + key+"="+param[key];
                        count++;
                    }
                    if(null != paramStr && paramStr != ""){
                        url = url + "?"+paramStr;
                    }
                }
//                window.location.href = url;
	            $("#tagOpenWin").attr("href",url);
                if(openType && openType.target){
                    $("#tagOpenWin").attr("target",openType.target);
                }
                document.getElementById("tagOpenWin").click();
            }
        },
		getSession : function(){
            var result = {};
            Util.ajax.getJson(Constants.AJAXURL+'/user/session',{}, function(data, status){
                if (status){
                    result = data.bean;
                }else{
                    console.log("获取session信息失败！");
                }
            },true);
            return result;
        },
        setLogConfig:function(){
            var userInfo = {};
            Util.ajax.getJson(Constants.AJAXURL+'/user/session',{}, function(data, status){
                if (status){
                    userInfo = data.bean;
                }else{
                    console.log("获取session信息失败！");
                }
            },true);
            log.setConfig({userId:userInfo.staffCode,systemCode:"ngkm",appName:"ngkm",province:userInfo.provnce});
        }
        
    }
});