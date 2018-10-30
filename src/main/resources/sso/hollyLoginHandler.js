define(function () {
    var hollyLoginHandler = {
            /**
             * Storage 管理器
             */
            storageManager: {
                /**
                 * 是否不支持 sessionStorage
                 */
                notSupportSessionStorage: function () {
                    return typeof window.sessionStorage == 'undefined' || window.sessionStorage == null;
                },

                /**
                 * 是否不支持 localStorage
                 */
                notSupportLocalStorage: function () {
                    return typeof window.localStorage == 'undefined' || window.localStorage == null;
                },

                /**
                 * 存储token
                 */
                store: function (key, value) {
                    sessionStorage.setItem(key, value);
                },

                /**
                 * 获取token
                 */
                get: function (key) {
                    return sessionStorage.getItem(key);
                },

                /**
                 * 清除token
                 */
                clear: function (key) {
                    sessionStorage.removeItem(key);
                }
            },

            cookieManager: {
                getItem: function (sKey) {
                    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
                },
                setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
                        return false;
                    }
                    var sExpires = "";
                    if (vEnd) {
                        switch (vEnd.constructor) {
                            case Number:
                                sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                                break;
                            case String:
                                sExpires = "; expires=" + vEnd;
                                break;
                            case Date:
                                sExpires = "; expires=" + vEnd.toUTCString();
                                break;
                        }
                    }
                    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
                    return true;
                },
                removeItem: function (sKey, sPath, sDomain) {
                    if (!sKey || !this.hasItem(sKey)) {
                        return false;
                    }
                    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
                    return true;
                },
                hasItem: function (sKey) {
                    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
                },
                keys: /* optional method: you can safely remove it! */ function () {
                    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
                    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
                        aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
                    }
                    return aKeys;
                }
            },

            /**
             * token 管理器
             */
            tokenManager: {
                tokenKey: 'permissionSecCertSession',
                newTokenHeader: 'new_authorization',
                logoutUriSuffix: 'login.html',

                /**
                 * 存储token
                 */
                storeToken: function (token) {
                    var key = hollyLoginHandler.tokenManager.tokenKey;
                    if (hollyLoginHandler.storageManager.notSupportSessionStorage()) {
                        //不支持sessionStorage，使用cookie
                        return hollyLoginHandler.cookieManager.setItem(key, token, null, '/', holly.getDomain(), null);
                    } else {
                        hollyLoginHandler.storageManager.store(key, token);
                    }
                },

                /**
                 * 获取token
                 */
                getToken: function () {
                    var key = hollyLoginHandler.tokenManager.tokenKey;
                    if (hollyLoginHandler.storageManager.notSupportSessionStorage()) {
                        //不支持sessionStorage，使用cookie
                        return hollyLoginHandler.cookieManager.getItem(key)
                    } else {
                        return hollyLoginHandler.storageManager.get(key);
                    }
                },

                /**
                 * 清除token
                 */
                clearToken: function () {
                    var key = hollyLoginHandler.tokenManager.tokenKey;
                    if (hollyLoginHandler.storageManager.notSupportSessionStorage()) {
                        //不支持sessionStorage，使用cookie
                        hollyLoginHandler.cookieManager.removeItem(key, '/', holly.getDomain())
                    } else {
                        hollyLoginHandler.storageManager.clear(key);
                    }
                },

                /**
                 * 使用 token
                 */
                useToken: function () {
                    var token = hollyLoginHandler.tokenManager.getToken();
                    //校验token
                    if (!hollyLoginHandler.tokenManager.validToken(token)) {
                        hollyLoginHandler.tokenManager.abnormalTokenhandle();
                    }
                    return token;
                },

                /**
                 * 异常token处理
                 */
                abnormalTokenhandle: function () {
                    window.location.href = (top.ctxPath?top.ctxPath:"") + hollyLoginHandler.tokenManager.judgePlatform() + hollyLoginHandler.tokenManager.logoutUriSuffix;
                },

                /**
                 * 检验token
                 */
                validToken: function (token) {
                    if (token == null || token == undefined || token == '') {
                        return false;
                    }
                    return true
                },

                /**
                 * 通过 token 判断使用的平台类型
                 */
                judgePlatform: function () {
                    var platform = hollyLoginHandler.jwtManager.getPlatform();
                    if (platform == 'platform_field') {
                        //平台域
                        return "platform";
                    } else {
                        //租户域（默认为租户域）
                        return "";
                    }
                }
            },

            /**
             * menu 管理器
             */
            menusManager: {
                menusKey: 'permissionSecCertMenus',

                /**
                 * 存储token
                 */
                storeMenus: function (menus) {
                    // storageManager.store(menusManager.menusKey, menus);
                    hollyData.loginUser.menuList = menus;
                },

                /**
                 * 获取token
                 */
                getMenus: function () {
                    // return storageManager.get(menusManager.menusKey);
                    return hollyData.loginUser.menuList;
                },

                /**
                 * 清除token
                 */
                clearMenus: function () {
                    // storageManager.clear(menusManager.menusKey);
                    hollyData.loginUser.menuList = [];
                }
            },

            /**
             * dic 管理器
             */
            dicsManager: {
                dicsKey: 'permissionSecCertDics',

                /**
                 * 存储词典
                 */
                storeDics: function (dics) {
                    hollyData.dictData = dics;
                },

                /**
                 * 获取token
                 */
                getDics: function () {
                    return hollyData.dictData;
                }
                ,

                /**
                 * 清除token
                 */
                clearDics: function () {
                    hollyData.dictData = {};
                }
            }
            ,

            /**
             * jwt 管理器
             */
            jwtManager: {
                header: {}
                ,
                payload: {}
                ,
                isParsed: false,

                /**
                 * 初始化
                 */
                init: function () {
                    var token = hollyLoginHandler.tokenManager.getToken();
                    if (hollyLoginHandler.tokenManager.validToken(token)) {
                        this.parse(token);
                    }
                }

                ,

                /**
                 * 解析
                 */
                parse: function (jwt) {
                    var msgs = jwt.split('.');
                    this.header = JSON.parse(Base64.decode(msgs[0]));
                    this.payload = JSON.parse(Base64.decode(msgs[1]));
                    hollyLoginHandler.jwtManager.isParsed = true;
                }
                ,

                /**
                 * 懒加载
                 */
                lazy: function () {
                    if (!hollyLoginHandler.jwtManager.isParsed) {
                        hollyLoginHandler.jwtManager.init();
                    }
                }
                ,

                /**
                 * 获取 JWT 中的头信息
                 * @returns {*}
                 */
                getHeader: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.header : null;
                }
                ,

                /**
                 * 获取 JWT 中的负载信息
                 * @returns {*}
                 */
                getPayload: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload : null;
                }
                ,

                /**
                 * 获取用户名
                 */
                getUsername: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload['user_name'] : null;
                }
                ,

                /**
                 * 获取登录平台
                 */
                getPlatform: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload['platformType'] : null;
                }
                ,

                /**
                 * 获取登录类型
                 */
                getAuthType: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload['authType'] : null;
                }
                ,

                /**
                 * 获取用户信息
                 */
                getUserInfo: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload['userInfo'] : null;
                }
                ,

                /**
                 * 获取菜单权限
                 */
                getPermissions: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? this.payload['authorities'] : null;
                }
                ,

                /**
                 * 获取数据权限
                 */
                // getDataPermissions: function () {
                //     hollyLoginHandler.jwtManager.lazy();
                //
                //     return hollyLoginHandler.jwtManager.isParsed ? this.payload['dataAuthorizations'] : null;
                // }
                // ,

                /**
                 * 获取菜单的详细信息
                 */
                getMenusDetails: function () {
                    hollyLoginHandler.jwtManager.lazy();

                    return hollyLoginHandler.jwtManager.isParsed ? JSON.parse(hollyLoginHandler.menusManager.getMenus()) : null;
                }
            }
        }
    ;
    return {
        storageManager: hollyLoginHandler.storageManager,
        cookieManager: hollyLoginHandler.cookieManager,
        tokenManager: hollyLoginHandler.tokenManager,
        menusManager: hollyLoginHandler.menusManager,
        dicsManager: hollyLoginHandler.dicsManager,
        jwtManager: hollyLoginHandler.jwtManager
    };
});