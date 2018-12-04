require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    initialize();

    function initialize() {
        initPageInfo();
    }

    //页面信息初始化
    function initPageInfo() {
        //工单受理内容
        $("#orderDealContent").textbox(
            {
                multiline: true
            }
        );

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemName', title: '考评项名称', width: '30%'},
                {field: 'score', title: '扣分分值', width: '70%',editor:'numberbox'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 200,
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealProcessList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#appealProcessList").datagrid("selectRow", rowIndex);
                }
            },
            // loader: function (param, success) {
            //
            // },
            onLoadSuccess: function (data) {

            }
        });

        //考评评语
        $("#checkItemRemark").textbox(
            {
                multiline: true
            }
        );

        //申诉原因
        $("#appealReason").textbox(
            {
                multiline: true
            }
        );

        //申诉处理意见
        $("#appealDealSuggestion").textbox(
            {
                multiline: true
            }
        );
    }

    //时间格式化
    function formatDateTime(inputDate) {
        var date = new Date(inputDate);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    return {
        initialize: initialize
    };
});