(function ($) {
    window['hollyLoginHandlerUtil'] = {};

    //登录对象
    hollyLoginHandlerUtil.hollyLoginHandler = null;
    hollyLoginHandlerUtil.init = function (hollyLoginHandler) {
        hollyLoginHandlerUtil.hollyLoginHandler = hollyLoginHandler;
    };

    /**
     * 获取登录处理器
     */
    hollyLoginHandlerUtil.getHollyLoginHandler = function () {
        return hollyLoginHandlerUtil.hollyLoginHandler;
    };

    /**
     * 附加 ajax 成功业务
     */
    hollyLoginHandlerUtil.additionalAjaxSuccessBusiness = function (success, statusText, jqXHR) {
        //异常判断
        if (success.STATUS && '4000' == success.STATUS) {
            //权限异常
            hollyLoginHandlerUtil.hollyLoginHandler.tokenManager.clearToken();//清理
            hollyLoginHandlerUtil.hollyLoginHandler.tokenManager.abnormalTokenhandle();//跳转
        }

        //续签
        //获取返回头方法是否存在
        var newToken = jqXHR.getResponseHeader(hollyLoginHandlerUtil.hollyLoginHandler.tokenManager.newTokenHeader);
        if (newToken && newToken.indexOf("Bearer") != -1) {
            hollyLoginHandlerUtil.hollyLoginHandler.tokenManager.storeToken(newToken.replace("Bearer ", ""));
        }
    };
})(jQuery);