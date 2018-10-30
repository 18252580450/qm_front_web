define(["jquery", 'util', "easyui"], function ($, Util,EasyUI) {
    //格式化时间方法
    function formatDateTime(inputTime) {
        var date = new Date(inputTime);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    /**
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getSysCode(codeTypeCd) {
        var result = {};
        $.ajax({
            url: Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            async:false,
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== null && data[i].name !== null) {
                        result[data[i].value] = data[i].name;
                    }
                }
            }
        });
        return result;
    };

    return {
        formatDateTime:formatDateTime,
        getSysCode:getSysCode
    }
});