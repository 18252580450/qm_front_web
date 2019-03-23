/**
 * 全局公用模块
 */
define(['constants', 'page-util', 'ajax', 'loading'], function (constants, PageUtil, ajax, loading) {
    function getLogInData(callback) {
        var userInfo = {};
        jQuery.ajax({
            async:false,
            url:constants.IS_LOG_IN,
            type:"GET",
            dataType:"json",
            success: function(data) {
                var result = JSON.stringify(data);
                if(result.indexOf("<html>") != -1){
                    jumpToLogin();
                }
                if(data.retVal != '1'){
                    jumpToLogin();
                }
                userInfo = {
                    staffId: data.staffId,
                    bssGroupId: data.bssGroupId,
                    bssId: data.bssOpId,
                    staffName:data.uname
                };
                callback(userInfo);
            },
            error:function(error){
                top.location.href = constants.PAGE_LOGIN;
                throw "用户未登录";
            }
        });
    }

    function getRoleCode(data,callback){
        var roleCode = "";
        var reqParams = {
            "groupId": "",
            "staffName":data.staffName,
            "staffId": data.staffId,
            "start":"",
            "limit": "",
            "provCode": "",
            "roleCode": ""
        };
        var params = {
            "params": JSON.stringify(reqParams)
        };
        ajax.getJson(constants.CONTEXT + constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if(rspCode=="1"){
                roleCode =  result.RSP.DATA[0].jsonArray[0].ROLE_CODE;//角色编码
                callback(roleCode);
            }
        });
    }

    return {
        getLogInData:getLogInData,
        getRoleCode:getRoleCode,
        constants: constants,
        ajax: ajax,
        PageUtil: PageUtil,
        loading: loading
    }
});