require(["jquery", "util", "dateUtil", "transfer", "easyui"], function ($, Util) {

    var voicePool;               //质检数据

    initialize();

    function initialize() {
        initPageInfo();
    }

    //页面信息初始化
    function initPageInfo() {
        //获取y语音流水、质检流水等信息
        voicePool = getRequestObj();

        //基本信息初始化
        initBaseInfo();
    }

    //初始化基本信息
    function initBaseInfo() {
        var reqParams = {
            "touchId": voicePool.touchId
        };
        var params = $.extend({
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        }, Util.PageUtil.getParams($("#searchForm")));

        //通过语音流水查询基本信息
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS + "/selectByParams", params, function (result) {
            var data = result.RSP.DATA,
                rspCode = result.RSP.RSP_CODE;
            if (rspCode !== "1") {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
            } else {
                var createTime = "",
                    callType = "",
                    callDuration = "";
                if (data[0].checkedTime != null) {
                    createTime = DateUtil.formatDateTime(data[0].checkedTime);
                }
                if (data[0].callType === "0") {
                    callType = "呼入";
                } else if (data[0].callType === "1") {
                    callType = "呼出";
                }
                if (data[0].talkDuration != null && data[0].talkDuration !== "") {
                    callDuration = DateUtil.formatDateTime2(data[0].talkDuration);
                }
                $("#checkedStaffName").val(data[0].checkedStaffName);
                $("#checkedDepartName").val(data[0].departName);
                $("#touchId").val(data[0].touchId);
                $("#createTime").val(createTime);
                if (data[0].callType === "0") {
                    $("#staffNumber").val(data[0].customerNumber);
                    $("#customerNumber").val(data[0].staffNumber);
                } else if (data[0].callType === "1") {
                    $("#staffNumber").val(data[0].staffNumber);
                    $("#customerNumber").val(data[0].customerNumber);
                }
                $("#callType").val(callType);
                $("#callDuration").val(callDuration);
            }
        });
    }

    //获取url对象
    function getRequestObj() {
        var url = decodeURI(decodeURI(location.search)); //获取url中"?"符后的字串，使用了两次decodeRUI解码
        var requestObj = {};
        if (url.indexOf("?") > -1) {
            var str = url.substr(1),
                strArr = str.split("&");
            for (var i = 0; i < strArr.length; i++) {
                requestObj[strArr[i].split("=")[0]] = unescape(strArr[i].split("=")[1]);
            }
            return requestObj;
        }
    }

    return {
        initialize: initialize
    };
});