define(["jquery"], function($) {
  "use strict";

  var server_api = function (url,type,data,s_fun) {
    
    $.ajax({
      url: url,
      type: type,
      timeout: 40000,
      data: JSON.stringify(data),
      //data: data,
      dataType: "json",
      cache: false,
      async: true,
      contentType: "application/json;charset=UTF-8",
      success: resp => {
        if (s_fun) {
          s_fun(resp);
        } else {
          console.log("接口请求成功----未做处理");
        }
      },
      error: resp => {
        console.log("接口请求失败");
      }
    });
  }

  var timestamp_time = function (timestamp) {
    var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes() + ':';
    var s = date.getSeconds();
    return Y + M + D + h + m + s;
  }

  return { server_api: server_api, timestamp_time: timestamp_time };
});
