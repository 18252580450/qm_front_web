/**
 * 框架页面初始化登录人员信息
 * 数据格式：loginUser:{
        userInfo:{},    登录人信息
        menuList:[],    登录人权限菜单
        groupInfo:{}    登入人工作组信息
    }
 dictData            缓存系统中的字典信息，子页面获取字典优先从此获取
 @author zd
 */
define(['hollyLoginHandler'], function (hollyUtil) {
    var hollyData = {
        loginUser: {
            userInfo: {},
            userDetails:{},
            menuList: [],
            groupInfo: {}
        },
        dictData: {
            "isEnable": [{"value": "1", "name": "启用"}, {"value": "0", "name": "停用"}],
            "menuType": [{"value": "1", "name": "子系统"}, {"value": "2", "name": "模块"}, {
                "value": "3",
                "name": "菜单"
            }, {"value": "4", "name": "按钮"},],
            "btnType": [{"value": "1", "name": "工具栏按钮"}, {"value": "2", "name": "行操作按钮"}, {
                "value": "3",
                "name": "自定义权限按钮"
            }],
            "isTrue": [{"value": "1", "name": "是"}, {"value": "0", "name": "否"}]
        },
        paramData:{},
        treeData: {},
        /**
         * 初始化
         */
        init: function () {
            //jwt解析
            hollyUtil.jwtManager.init();
            //获取用户基本信息
            hollyData.loginUser.userInfo = hollyUtil.jwtManager.getUserInfo();
        },
        /**
         * 根据页面KEY获取登录人在此页面下的按钮权限信息
         * @param mk
         * @returns {Array}
         */
        getBtnsByMK: function (mk) {
            var btList = [];
            if (mk && this.loginUser.menuList && this.loginUser.menuList.length > 0) {
                for (var i = 0; i < this.loginUser.menuList.length; i++) {
                    var item = this.loginUser.menuList[i];
                    if (item.menuKey && item.menuKey.indexOf(mk + ":") == 0)
                        btList.push(item);
                }
            }
            return btList;
        },
        /**
         * 根据字典类型或者字典LIST
         * @param dictType
         * @returns {*}
         */
        getDictList: function (dictType) {
            if (dictType)
                return this.dictData[dictType]||[];
        },
        /**
         * 根据字典类型、字典编码获取对应的名称
         * @param dictType
         * @param dictValue
         * @returns {*}
         */
        getDictName: function (dictType, dictValue) {
            dictValue = dictValue + "";
            if (dictType && dictValue) {
                var dictList = this.getDictList(dictType) || [];
                for (var i = 0; i < dictList.length; i++) {
                    if (dictList[i].value == dictValue) {
                        return dictList[i].name;
                    }
                }
            }
            return dictValue ? dictValue : '';
        },
        getTreeList: function(codeType){
            if(hollyData.treeData[codeType])
                return hollyData.treeData[codeType];
            if(!!generalSystemService){
                try {
                    var url = generalSystemService + "/tree/getlist?codeType=" + codeType + "&tenantId=" + hollyData.loginUser.userInfo.tenantId + "&proId=" + hollyData.loginUser.userInfo.proId;
                    holly.get(url, null, function (data) {
                        if (data.RSP.RSP_CODE == "0000") {
                            hollyData.treeData[codeType] = data.RSP.DATA;
                        }
                    },true)
                    return hollyData.treeData[codeType];
                }catch (e) {

                }
            }
        },
        getTreeValueName: function(codeType, value){
            value = value + "";
            if(codeType && value){
                var treeList = this.getTreeList(codeType)||[];
                for(var i =0;i<treeList.length;i++){
                    if(value == treeList[i].id)
                        return treeList[i].name;
                }
            }
            return value||"";
        },
        getTreeNamePath: function(codeType, value){
            value = value + "";
            if(codeType && value){
                var treeList = this.getTreeList(codeType)||[];
                for(var i =0;i<treeList.length;i++){
                    if(value == treeList[i].id)
                        return treeList[i].attributes.treeNamePath;
                }
            }
            return value||"";
        },
        /**
         *根据menuKey获取menu信息
         */
        getMenuByKey:function(menuKey){
            var m='';
        	$.each(hollyData.getMenus(),function(i,menu){
        		if(menu && menu.menuKey && menuKey === menu.menuKey){
        			m = menu;
        			return false;
        		}
        	});
        	return m;
        },
        /**
         * 存储菜单
         */
        storeMenus: function (menus) {
            hollyData.loginUser.menuList = menus;
        },

        getMenus: function () {
            return hollyData.loginUser.menuList;
        },

        clearMenus: function () {
            hollyData.loginUser.menuList = [];
        },
        /**
         * 存储词典
         */
        storeDics: function (dics) {
            hollyData.dictData = dics;
        },
        getDics: function () {
            return hollyData.dictData;
        },
        clearDics: function () {
            hollyData.dictData = {};
        },
        storeParam: function(paramData){
            hollyData.paramData = paramData;
        },
        getParamValue: function(codeType, parameterName){
            return hollyData.paramData[codeType + "_" + parameterName]||null;
        },
        clearParam: function () {
            hollyData.paramData = {};
        }
    };
    return {
        self: hollyData
    }
});