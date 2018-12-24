require(["jquery", 'util', "transfer", "easyui","dateUtil"], function ($, Util, Transfer,easyui,dateUtil) {
    //初始化方法
    initialize();
    var acceptNumber = null;
    var inspectionId = null;
    var touchId = null;
    var checkedStaffId = null;
    function initialize() {
        //获取templateId传值
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if(url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for(var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        acceptNumber=theRequest["acceptNumber"];
        inspectionId=theRequest["inspectionId"];
        touchId=theRequest["touchId"];
        checkedStaffId=theRequest["checkedStaffId"];
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //差错类型
        $("#errorType").combobox({
            url: '../../data/errorType.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isDis = $("#errorType");
                var data = isDis.combobox('getData');
                if (data.length > 0) {
                    isDis.combobox('select', data[0].codeValue);
                }
            }
        });
        //申诉流程列表
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'touchId', title: '语音质检流水', align: 'center', width: '15%'},
                {field: 'callingNumber', title: '主叫号码', align: 'center', width: '10%'},
                {field: 'acceptNumber', title: '服务号码', align: 'center', width: '10%',hidden: true},
                {field: 'checkStaffName', title: '质检人', align: 'center', width: '10%'},
                {field: 'checkedStaffName', title: '被质检人', align: 'center', width: '10%'},
                {field: 'resultStatus', title: '状态', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'质检新生成','1':'临时保存','2':'放弃','3':'复检','4':'分检','5':'被检人确认'
                            ,'6':'系统自确认','7':'申诉中','8':'申诉通过','9':'申诉驳回','99':'系统驳回'}[value];
                    }},
                {field: 'errorRank', title: '差错类型', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'无错误','1':'绝对错误'}[value];
                    }},
                {field: 'errorRank', title: '质检得分', align: 'center', width: '10%'},
                {
                    field: 'checkEndTime', title: '质检时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        return DateUtil.formatDateTime(value);
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var touchId = $("#touchId").val();
                var checkStaffId = $("#checkStaffId").val();
                var startTime = $("#startTime").datetimebox("getValue");
                var endTime = $("#endTime").datetimebox("getValue");
                var checkedStaffId = $("#checkedStaffId").val();
                var inspectionId = $("#inspectionId").val();
                var resultStatus = $("#resultStatus").val();

                var reqParams = {
                    "touchId": touchId,
                    "checkStaffId": checkStaffId,
                    "checkedStaffId": checkedStaffId,
                    "startTime": startTime,
                    "endTime": endTime,
                    "inspectionId": inspectionId,
                    "resultStatus": resultStatus,
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_QM_RESULT+ "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    }
                    success(data);
                });
            }
        });
    }

    // 导出
    function dao(){
        var oXL = new ActiveXObject("Excel.Application");
        var oWB = oXL.Workbooks.add();
        var oSheet = oWB.ActiveSheet;
        var headTable = $(".datagrid-header").find('table')[1];
        var dataTable = $(".datagrid-body").find('table')[0];
        var headDate = headTable.rows(0);
        var hang = dataTable.rows.length;
        var lie = dataTable.rows(0).cells.length;
        for(var l = 0;l<lie;l++){
            oSheet.Cells(1,l + 1).NumberFormatLocal = "@";
            oSheet.Cells(1,l + 1).Font.Bold = true;
            oSheet.Cells(1,l + 1).Font.Size = 10;
            oSheet.Cells(1,l + 1).value = headDate.cells(l).innerText;
        }
        for(i = 1; i <= hang; i++){
            for(j = 0; j < lie; j++){
                oSheet.Cells(i + 1,j + 1).NumberFormatLocal = "@";
                oSheet.Cells(i + 1,j + 1).Font.Bold = true;
                oSheet.Cells(i + 1,j + 1).Font.Size = 10;
                oSheet.Cells(i + 1,j + 1).value = dataTable.rows(i-1).cells(j).innerText;
            }
        }
        oXL.Visible = true;
        oXL.UserControl = true;
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#queryInfo").datagrid("load");
        });

        //修改
        $("#modifyBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");//选中多行
            if (selRows.length == 0||selRows.length>1) {
                $.messager.alert("提示", "请只选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].touchId;
                ids.push(id);
            }
            addTabs("修改语音质检详情","http://127.0.0.1:8080/qm/html/manage/modiVoiceQmResultManage.html?touchId="+ids[0]);
        });

        //申诉
        $("#releaseBut").on("click", function () {
            $("#add_content").show().window({   //弹框
                width: 950,
                height: 400,
                modal: true,
                title: "申诉"
            });
            appeal();
        });

        //导出
        $("#daoBut").on("click", function () {
            dao();
        });

        //重置
        $("#clearBtn").on("click", function () {
            $("#page input").val("");
        });
    }

    /**
     * 申诉
     */
    function appeal(){
        var selRows = $("#queryInfo").datagrid("getSelections");//选中多行
        if (selRows.length == 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var ids = [];
        for (var i = 0; i < selRows.length; i++) {
            var id = selRows[i].touchId;
            ids.push(id);
        }

        $.messager.confirm('确认弹窗', '确定要强制释放吗？', function (confirm) {

            if (confirm) {
                Util.ajax.putJson(Util.constants.CONTEXT.concat(qmURI).concat("/update"), JSON.stringify(ids), function (result) {

                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    var rspCode = result.RSP.RSP_CODE;

                    if (rspCode == "1") {
                        $("#queryInfo").datagrid('reload'); //成功后，刷新页面
                    }
                });

            }
        });
    }


    return {
        initialize: initialize
    };
});