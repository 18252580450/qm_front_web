/**
 * 技能配置样例
 */
define(["jquery", 'util',"transfer", "easyui"], function ($, Util,Transfer) {

    var $popWindow, $tree, $page, $search, $skill;
    var skillId = null;
    var skillConfig = null;
    var approve_node_stscd = "NGKM.KNOWLEDGE.OPERTYPE";


    /**
     * 初始化
     */
    var initialize = function(obj_paramaster){

        $("#win_content").empty();

        addGridDom();
        initGrid(obj_paramaster);
        initWindowEvent();
        getEmapvRsltCd = getsysCode(approve_node_stscd);


    };

    function addGridDom() {
        $([
            "<div id ='selectKeysDialog'>" ,
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>审核轨迹</div>",
            "</div>",
            "</div>",
            "<table id='showLocus' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
            "</table>",
            "</div>",

        ].join("")).appendTo($("#win_content"));

    }


    /**
     * 初始化弹出窗口
     */
    function initGrid(obj_paramaster) {
        //$("#win_content").empty();

        $("#showLocus").datagrid({
            columns: [[
                {field: 'crtTime', title: '操作时间', width: '15%'},
                {field: 'opPrsnId', title: '操作者', width: '25%'},
                {field: 'opTypeCd', title: '操作后状态', sortable: true, width: '20%',formatter: function (value, row, index) {
                        return getEmapvRsltCd[value];
                    }},
                {field: 'opRsnCntt', title: '原因', width: '20%'},
                {field: 'atachNm', title: '附件', width: '20%'},
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [10, 20, 50],
            rownumbers: true,
            singleSelect: true,
            autoRowHeight: false,
            onSelect: function (index, row) {
                // console.log("row: " + row);
                skillConfig = row;
            },

            loader: function (param, success) {
                var start = param.page;
                var pageNum = param.rows;
                var params = {
                    "startIndex": start,
                    "pageNum": pageNum,
                    "knwlgId": obj_paramaster.knwlgId,
                    "tskId": obj_paramaster.tskId,
                    "verno": obj_paramaster.verno,
                    "crtTime": obj_paramaster.crtTime,
                    //"obj_paramaster":obj_paramaster,
                    "sort": param.sort,
                    "order": param.order
                };
                Util.ajax.getJson(Util.constants.CONTEXT + "/approveTask/getApprovedLocus", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    success(data);
                });
            }
        });
    }


    /**
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getsysCode(codeTypeCd) {
        var result = {};
        $.ajax({
            url: Util.constants.CONTEXT + "/kmconfig/getDataByCode?typeId=" + codeTypeCd,
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].value !== null && data[i].name !== null) {
                        result[data[i].value] = data[i].name;
                    }
                }
            }
        });
        return result;
    };

    /**
     * 初始化弹出窗口事件
     */
    function initWindowEvent() {

    }

    return {
        initialize: initialize
    };

});
