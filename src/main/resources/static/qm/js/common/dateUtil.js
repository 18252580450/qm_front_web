/**
 * 时间转换
 */
var DateUtil = {
    formatDateTime: function (inputTime, formatStr) {
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
        if (formatStr) {
            formatStr = formatStr.replace("yyyy", y).replace("MM", m).replace("dd", d);
            formatStr = formatStr.replace("hh", h).replace("mm", minute).replace("ss", second);
            return formatStr;
        } else {
            return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
        }
    },

    /**
     * 时间转换 秒转换成xx天xx小时xx分xx秒
     */
    formatDateTime2: function (inputTime) {
        debugger;
        var day = parseInt(inputTime / 24 / 60 / 60),
            hour = parseInt((inputTime - day * 24 * 60 * 60) / 60 / 60),
            minute = parseInt((inputTime - day * 24 * 60 * 60 - hour * 60 * 60) / 60),
            second = parseInt(inputTime - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60);
        if (day > 0) {
            return day + '天' + hour + '时' + minute + '分' + second + '秒';
        }
        if (hour > 0) {
            return hour + '时' + minute + '分' + second + '秒';
        }
        if (minute > 0) {
            return minute + '分' + second + '秒';
        }
        return second + '秒';
    }
};


