(function ($) {
    window['hollyDataUtil'] = {};

    hollyDataUtil.hollyData = null;
    hollyDataUtil.init = function (hollyData) {
        hollyDataUtil.hollyData = hollyData;
    }

    hollyDataUtil.getLoginUser = function () {
        return hollyDataUtil.hollyData.loginUser;
    }

    hollyDataUtil.getUserInfo = function () {
        return hollyDataUtil.hollyData.loginUser.userInfo;
    }

    hollyDataUtil.getUserDetails = function () {
        var userDetails = hollyDataUtil.hollyData.loginUser.userDetails;
        if ($.isEmptyObject(userDetails)) {
            holly.get(permissionCertService + "/oauth/infosupplement/userdetails", null, function (result) {
                if (result.RSP.DATA) {
                    userDetails = result.RSP.DATA;
                    hollyDataUtil.hollyData.loginUser.userDetails = userDetails;
                }
            }, true);
        }
        return userDetails;
    }

    /**
     * 根据页面KEY获取登录人在此页面下的按钮权限信息
     * @param mk
     * @returns {Array}
     */
    hollyDataUtil.getBtnsByMK = function (mk) {
        return hollyDataUtil.hollyData.getBtnsByMK(mk);
    }

    /**
     * 根据字典类型或者字典LIST
     * @param dictType
     * @returns {*}
     */
    hollyDataUtil.getDictList = function (dictType) {
        return hollyDataUtil.hollyData.getDictList(dictType);
    }

    /**
     * 根据字典类型、字典编码获取对应的名称
     * @param dictType
     * @param dictValue
     * @returns {*}
     */
    hollyDataUtil.getDictName = function (dictType, dictValue) {
        return hollyDataUtil.hollyData.getDictName(dictType, dictValue);
    }

    /**
     * 根据树类型获取所有节点
     * @param codeType
     * @returns {*}
     */
    hollyDataUtil.getTreeList = function (codeType) {
        return hollyDataUtil.hollyData.getTreeList(codeType);
    }

    /**
     * 根据树类型、节点ID获取对应的名称
     * @param codeType
     * @param value
     * @returns {*}
     */
    hollyDataUtil.getTreeValueName = function (codeType, value) {
        return hollyDataUtil.hollyData.getTreeValueName(codeType, value);
    }

    /**
     * 根据树类型、节点ID获取全路径名称
     * @param codeType
     * @param value
     * @returns {*}
     */
    hollyDataUtil.getTreeNamePath = function(codeType, value){
        return hollyDataUtil.hollyData.getTreeNamePath(codeType, value);
    }

    /**
     * 获取系统参数
     * @param codeType
     * @param parameterName
     * @returns {*}
     */
    hollyDataUtil.getParamValue = function (codeType, parameterName) {
        return hollyDataUtil.hollyData.getParamValue(codeType, parameterName);
    }
})(jQuery);