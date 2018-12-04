require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
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
                {field: 'checkItemName', title: '考评项名称', width: '15%'},
                {field: 'checkItemVitalType', title: '类别', width: '15%'},
                {field: 'remark', title: '描述', width: '40%'},
                {field: 'scoreScope', title: '扣分区间', width: '15%',editor:'numberbox'},
                {field: 'score', title: '扣分分值', width: '15%',editor:'numberbox'}
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
    }

    //事件初始化
    function initEvent() {
        //通知类型复选框点击事件
        $("#messageInform").on("click",function () {
           $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click",function () {
            $("#messageInform").attr("checked", false);
        });
    }

    return {
        initialize: initialize
    };
});