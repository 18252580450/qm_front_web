/**
 * EASYUI 组件数据格式转换
 */
define(["jquery"], function ($) {

    var EASYUI = {};

    /**
     * Combobox 处理返回结果
     */
    EASYUI.Combobox = {
        transfer: function(data){
            if(data && data.RSP){
                return data.RSP.DATA;
            }

        }
    };

    /**
     * DataGrid 处理查询结果
     */
    EASYUI.DataGrid = {
        transfer: function (result){
            var data = {
                rows: result.RSP.DATA,
                total: result.RSP.ATTACH.TOTAL
            }
            return data;
        }
    };

    return {
        Combobox: EASYUI.Combobox,
        DataGrid: EASYUI.DataGrid
    };

});
