/*
 * 保存所有的公共事件
 * @author shiying
 */
define(["jquery",'util'], function($,Util) {
    var objClass = function(){};
    objClass.prototype = {
        //获取静态数据
        getStaticParams : function(paramsTypeId,callback){
            var datas = [];
            var reqParams = {
                "tenantId":Util.constants.TENANT_ID,
                "paramsTypeId": paramsTypeId
            };
            var params = {
                "start": 0,
                "pageNum": 0,
                "params": JSON.stringify(reqParams)
            };
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    datas = result.RSP.DATA;
                }
                callback(datas);
            });

        }
    };
    return new objClass();
});
