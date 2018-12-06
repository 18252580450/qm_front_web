require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    var dealProcessData = [0, 0];
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

        //动态展示处理过程
        showDealProcess(dealProcessData);

        //考评项列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkItemName', title: '考评项名称', width: '15%'},
                {field: 'checkItemVitalType', title: '类别', width: '15%'},
                {field: 'remark', title: '描述', width: '40%'},
                {field: 'scoreScope', title: '扣分区间', width: '15%', editor: 'numberbox'},
                {field: 'score', title: '扣分分值', width: '15%', editor: 'numberbox'}
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
        $("#messageInform").on("click", function () {
            $("#emailInform").attr("checked", false);
        });
        $("#emailInform").on("click", function () {
            $("#messageInform").attr("checked", false);
        });
    }

    //动态展示处理过程
    function showDealProcess(data) {
        var leftDiv = $("#processLeftDiv"),
            rightDiv = $("#processRightDiv");
        $.each(data, function (i, item) {
            if (i > 0) {
                leftDiv.append(getProcessLine());
            }
            leftDiv.append(getLeftDiv());
            rightDiv.append(getRightDiv());
        });
    }

    //左侧操作区域
    function getLeftDiv() {
        return '<div class="panel-transparent"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-1"><div class="fl text-small">*</div></div>' +
            '<div class="formControls col-6"><div class="fl text-small">操作1</div></div>' +
            '<div class="formControls col-3"><div class="circle"></div></div>' +
            '<div class="formControls col-2"><input type="checkbox"></div>' +
            '</div></form></div>';
    }

    //左侧流程线
    function getProcessLine() {
        return '<form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-7" style="margin-left: 8px"><div class="panel-right cl"></div></div>' +
            '</div> </form>';
    }

    //右侧流程处理过程列表
    function getRightDiv() {
        return '<div style="margin-bottom: 10px;">' +
            '<div class="panel-top cl"><form class="form form-horizontal"><div class="cl" style="background: #f5f5f5">' +
            '<div class="formControls col-3"><div class="fl text-small">部门：天津1班</div></div>' +
            '<div class="formControls col-3"><div class="fl text-small">工号：AEY01358</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">操作：操作一</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">环节：环节一</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">派发局向：投诉1班</div></div>' +
            '</div></form></div>' +
            '<div class="panel-top cl"><form class="form form-horizontal"><div class="cl">' +
            '<div class="formControls col-3"><div class="fl text-small">建单时间：2017-10-15 18:37:58</div></div>' +
            '<div class="formControls col-3"><div class="fl text-small">提交时间：2017-10-15 18:37:58</div></div>' +
            '<div class="formControls col-2"><div class="fl text-small">上一环节评价：合格</div></div>' +
            '</div></form></div>' +
            '<div class="panel-normal cl"><form class="form form-horizontal"><div class="cl" style="background: #eee">' +
            '<div class="formControls col-12"><div class="fl text-small">处理意见：客户反馈XX地点信号不好造成使用不方便，请处理</div></div>' +
            '</div></form> </div>' +
            '</div>';
    }

    return {
        initialize: initialize
    };
});