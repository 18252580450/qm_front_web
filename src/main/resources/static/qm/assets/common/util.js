/**
 * 全局公用模块
 */
define(['constants', 'page-util', 'ajax', 'loading', 'underscore', "jquery"], function (constants, PageUtil, ajax, loading, underscore, $) {
    function getLogInData(callback) {
        var userInfo = {};
        // jQuery.ajax({
        //     async: false,
        //     url: constants.CQKBMANAGE_URL + constants.IS_LOG_IN,
        //     type: "GET",
        //     cache: false,//不设置ajax缓存
        //     dataType: "json",
        //     success: function (data) {
        //         var result = JSON.stringify(data);
        //         if (result.indexOf("<html>") !== -1) {
        //             jumpToLogin();
        //         }
        //         if (data.retVal !== '1') {
        //             jumpToLogin();
        //         }
        //         userInfo = {
        //             staffId: data.staffId,
        //             bssGroupId: data.bssGroupId,
        //             bssId: data.bssOpId,
        //             staffName: data.uname,
        //             OrgName: data.OrgName,
        //             orgId: data.orgId
        //         };
        //         callback(userInfo);
        //     },
        //     error: function (error) {
        //         jumpToLogin();
        //         callback(userInfo);
        //     }
        // });
        // $.ajax({
        //     url: constants.CQKBMANAGE_URL + constants.IS_LOG_IN + "?time=" + new Date().getTime(),
        //     dataType: "json",
        //     async: false,
        //     type: "GET",
        //     cache: false,
        //     data: {},
        //     success: function (data) {
        //         var result = JSON.stringify(data);
        //         if (result.indexOf("<html>") !== -1) {
        //             jumpToLogin();
        //         }
        //         if (data.retVal !== '1') {
        //             jumpToLogin();
        //         }
        //         userInfo = {
        //             staffId: data.staffId,
        //             bssGroupId: data.bssGroupId,
        //             bssId: data.bssOpId,
        //             provCode: _.isEmpty(data.provCode) ? "00030000" : data.provCode,
        //             orgId: _.isEmpty(data.orgId) ? "00030000" : data.orgId,
        //             staffName: data.uname,
        //             OrgName: data.OrgName
        //         };
        //         callback(userInfo);
        //     },
        //     error: function (XMLHttpRequest, textStatus, errorThrown) {
        //         // alert(XMLHttpRequest.status);
        //         // alert(XMLHttpRequest.readyState);
        //         // alert(textStatus);
        //         jumpToLogin();
        //         callback(userInfo);
        //     }
        // });
        userInfo = {
            staffId: "10000",
            bssGroupId: "",
            bssId: "",
            staffName: "系统管理员",
            OrgName:"TEST2",
            orgId: "1000002"
        };
        callback(userInfo);
    }

    function getRoleCode(data, callback) {
        var roleCode = "";
        var reqParams = {
            "groupId": "",
            "staffName": data.staffName,
            "staffId": data.staffId,
            "start": "",
            "limit": "",
            "provCode": "",
            "roleCode": ""
        };
        var params = {
            "params": JSON.stringify(reqParams)
        };
        ajax.getJson(constants.CONTEXT + constants.QM_PLAN_DNS + "/getQmPeople", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            var userPermission = "";
            if (rspCode === "1") {
                roleCode = result.RSP.DATA[0].jsonArray[0].ROLE_CODE;//角色编码
                var arr = roleCode.split(',');
                var params = {
                    "params": JSON.stringify(arr)
                };
                ajax.getJson(constants.CONTEXT + constants.USER_PERMISSION + "/qryUserPermission", params, function (resultNew) {
                    if (resultNew.RSP_CODE === "1") {
                        userPermission = resultNew.DATA[0].permissionCode;
                    }
                    callback(userPermission);
                });
            } else {
                jQuery.messager.show({
                    msg: "虚拟组人员信息查询失败！",
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'show'
                });
                callback(userPermission);
            }
        });
    }

    function jumpToLogin() {
        top.location.href = constants.CQKBMANAGE_URL + constants.PAGE_LOGIN;
        throw "用户未登录";
    }

    return {
        getLogInData: getLogInData,
        getRoleCode: getRoleCode,
        constants: constants,
        ajax: ajax,
        PageUtil: PageUtil,
        loading: loading
    }
});