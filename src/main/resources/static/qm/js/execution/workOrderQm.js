require(["jquery", 'util', "transfer", "easyui","dateUtil"], function ($, Util, Transfer,easyui,dateUtil) {
    //初始化方法
    initialize();
    var reqParams=null;
    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //是否分配下拉框
        $("#isDis").combobox({
            url: '../../data/isDistribution.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isDis = $("#isDis");
                var data = isDis.combobox('getData');
                if (data.length > 0) {
                    isDis.combobox('select', data[0].codeValue);
                }
            }
        });

        //时间控件初始化
        var planStartTime = $('#planStartTime');
        var beginDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        planStartTime.datetimebox({
            value: beginDate,
            onChange: function () {
                checkTime();
            }
        });

        var planEndTime = $('#planEndTime');
        var endDate = (DateUtil.formatDateTime(new Date())).substr(0,11) + "23:59:59";
        planEndTime.datetimebox({
            value: endDate,
            onChange: function () {
                checkTime();
            }
        });

        var distStartTime = $('#distStartTime');
        var beginDate2 = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + "00:00:00";
        distStartTime.datetimebox({
            value: beginDate2,
            onChange: function () {
                checkTime();
            }
        });

        var distEndTime = $('#distEndTime');
        var endDate2 = (DateUtil.formatDateTime(new Date())).substr(0,11) + "23:59:59";
        distEndTime.datetimebox({
            value: endDate2,
                onChange: function () {
                    checkTime();
            }
        });

        //列表
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'workformId', title: '工单流水', align: 'center', width: '15%',
                    formatter:function(value, row, index){
                        var bean={'workformId':row.workformId};
                        return "<a href='javascript:void(0);' style='color:blue;'class='workformIdBtn' id =" + JSON.stringify(bean) + " >"+value+"</a>";
                    }
                },
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'handleDuration', title: '处理时长', align: 'center', width: '10%'},
                {field: 'planId', title: '计划编码', align: 'center', width: '10%',hidden: true},
                {
                    field: 'crtTime', title: '计划生成时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                            return DateUtil.formatDateTime(value);
                    }
                },
                {field: 'srvReqstTypeNm', title: '服务请求类型', align: 'center', width: '10%'},
                {field: 'checkLink', title: '考评环节', align: 'center', width: '10%'},
                {field: 'poolStatus', title: '是否分配', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'待审核','1':'未分配','2':'已分配','3':'正在质检','4':'质检完成','5':'放弃'}[value];
                    }
                },
                {field: 'reserve1', title: '是否质检', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'待质检','1':'待复检','2':'已质检'}[value];
                    }
                },
                {field: 'checkStaffName', title: '质检员', align: 'center', width: '10%'},
                {field: 'checkedStaffName', title: '被质检员', align: 'center', width: '10%'},
                {
                    field: 'operateTime', title: '分配时间', align: 'center', width: '15%',
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
                var workOrderId = $("#workOrderId").val();
                var planName = $("#planName").val();
                var serviceType = $("#serviceType").val();
                var isDis = $("#isDis").combobox("getValue");
                var planStartTime = $("#planStartTime").datetimebox("getValue");
                var distStartTime = $("#distStartTime").datetimebox("getValue");
                var planEndTime = $("#planEndTime").datetimebox("getValue");
                var distEndTime = $("#distEndTime").datetimebox("getValue");
                var qmLink = $("#qmLink").val();
                var qmPeople = $("#qmPeople").val();

                reqParams = {
                    "workformId": workOrderId,
                    "planId": planName,
                    "srvReqstTypeId": serviceType,
                    "poolStatus": isDis,
                    "planStartTime": planStartTime,
                    "distStartTime": distStartTime,
                    "planEndTime": planEndTime,
                    "distEndTime": distEndTime,
                    "checkLink": qmLink,
                    "checkStaffName":qmPeople
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDER_POOL_DNS+ "/selectByParams", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    var dataNew=[];
                    for(var i=0;i<data.rows.length;i++){
                        var map=data.rows[i];
                        if(map.qmPlan!=null){
                            map["planName"]=map.qmPlan.planName;
                            dataNew.push(map);
                        }
                    }
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    }
                    success(dataNew);
                });
            },
            onLoadSuccess: function (data) {
                $("#page").on("click", "a.workformIdBtn", function () {

                    var rowData = $(this).attr('id'); //获取a标签中传递的值
                    var sensjson = JSON.parse(rowData); //转成json格式
                    var status = sensjson.status;

                    addTabs("工单质检详情", "http://127.0.0.1:8080/qm/html/execution/orderCheckDetail.html");
                });
            }
        });
    }

    /**
     * 删除
     */
    function showCheckItemDeleteDialog() {
        var delRows = $("#queryInfo").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].touchId;
            delArr.push(id);
        }
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_POOL_DNS).concat("/").concat(delArr), {}, function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#queryInfo").datagrid('reload'); //删除成功后，刷新页面
                    }
                });
            }
        });
    }

    // // 前端导出
    // function dao(){
    //     var oXL = new ActiveXObject("Excel.Application");
    //     var oWB = oXL.Workbooks.add();
    //     var oSheet = oWB.ActiveSheet;
    //     var headTable = $(".datagrid-header").find('table')[1];
    //     var dataTable = $(".datagrid-body").find('table')[0];
    //     var headDate = headTable.rows(0);
    //     var hang = dataTable.rows.length;
    //     var lie = dataTable.rows(0).cells.length;
    //     for(var l = 0;l<lie;l++){
    //         oSheet.Cells(1,l + 1).NumberFormatLocal = "@";
    //         oSheet.Cells(1,l + 1).Font.Bold = true;
    //         oSheet.Cells(1,l + 1).Font.Size = 10;
    //         oSheet.Cells(1,l + 1).value = headDate.cells(l).innerText;
    //     }
    //     for(i = 1; i <= hang; i++){
    //         for(j = 0; j < lie; j++){
    //             oSheet.Cells(i + 1,j + 1).NumberFormatLocal = "@";
    //             oSheet.Cells(i + 1,j + 1).Font.Bold = true;
    //             oSheet.Cells(i + 1,j + 1).Font.Size = 10;
    //             oSheet.Cells(i + 1,j + 1).value = dataTable.rows(i-1).cells(j).innerText;
    //         }
    //     }
    //     oXL.Visible = true;
    //     oXL.UserControl = true;
    // }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#queryInfo").datagrid("load");
        });

        //清空
        $("#clearBtn").on("click", function () {
            $("#page input").val("");
        });

        //删除
        $("#delBut").on("click", function () {
            showCheckItemDeleteDialog();
        });

        //导出
        $("#daoBut").on("click", function () {
            dao();
        });

        //认领(质检员自己认领)
        $("#claimBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            for(var i=0;i<selRows.length;i++){
                if (selRows[i].poolStatus == "2"||selRows[i].reserve1=="2") {
                    $.messager.alert("提示", "已分配或已质检后不可操作!");
                    return false;
                }
            }
            $.messager.confirm('确认弹窗', '确定要认领吗？', function (confirm) {
                if (confirm) {
                    var ids = [];
                    for (var i = 0; i < selRows.length; i++) {
                        var id = selRows[i].touchId;
                        ids.push(id);
                    }
                    claim(ids);
                }});
        });

        //分配(管理员分配质检员)
        $("#disBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            for(var i=0;i<selRows.length;i++){
                if (selRows[i].poolStatus == "2"||selRows[i].reserve1=="2") {
                    $.messager.alert("提示", "已分配或已质检后不可操作!");
                    return false;
                }
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].touchId;
                ids.push(id);
            }
            distribute(ids);//分配操作
            //关闭
            $("#cancel").on("click", function () {
                $("#add_window").window('close'); // 关闭窗口
            });
            //查询
            $("#searchBtn").on("click", function () {

            });
        });

        //强制释放
        $("#releaseBut").on("click", function () {
            release();
        });
    }

    /**
     * 认领
     */
    function claim(dataNew){
        var params=[];
        for(var i=0;i<dataNew.length;i++){
            var map = {};
            map["checkStaffName"]="开心";//质检员信息先写死
            map["checkStaffId"]="112233";
            map["touchId"]=dataNew[i];
            params.push(map);
        }

        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_POOL_DNS).concat("/updateCheck"), JSON.stringify(params), function (result) {
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

    /**
     * 分配
     */
    function distribute(ids){
        $('#add_window').show().window({
            title: '质检人员信息',
            width: 1000,
            height: 650,
            cache: false,
            modal: true
        });
        addPageEvent();
        //确定
        $("#confirm").on("click", function () {
            var selRows = $("#checkStaffInfo").datagrid("getSelections");//选中多行
            if (selRows.length == 0||selRows.length>1) {
                $.messager.alert("提示", "请只选择一行数据!");
                return false;
            }
            var params=[];
            for(var i=0;i<ids.length;i++){
                var map = {};
                var checkStaffId = selRows[0].checkStaffId;
                var checkStaffCode = selRows[0].checkStaffCode;
                map["checkStaffName"]=checkStaffCode;
                map["checkStaffId"]=checkStaffId;
                map["touchId"]=ids[i];
                params.push(map);
            }
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_POOL_DNS).concat("/updateCheck"), JSON.stringify(params), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $('#add_window').window('close'); // 成功后，关闭窗口
                    $("#queryInfo").datagrid('reload'); //成功后，刷新页面
                }
            });
        });
    }

    /**
     * 强制释放
     */
    function release(){
        var selRows = $("#queryInfo").datagrid("getSelections");//选中多行
        if (selRows.length == 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        for(var i=0;i<selRows.length;i++){
            if (selRows[i].reserve1=="2") {
                $.messager.alert("提示", "已质检后不可操作!");
                return false;
            }
        }
        var ids = [];
        for (var i = 0; i < selRows.length; i++) {
            var id = selRows[i].touchId;
            ids.push(id);
        }

        $.messager.confirm('确认弹窗', '确定要强制释放吗？', function (confirm) {

            if (confirm) {
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ORDER_POOL_DNS).concat("/update"), JSON.stringify(ids), function (result) {

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
    
    //导出
    function dao(){
        var fields = $('#queryInfo').datagrid('getColumnFields'); //获取datagrid的所有fields
        var titles=[];
        fields.forEach(function(value,index,array){
            var title = $('#queryInfo').datagrid('getColumnOption',value).title;//获取datagrid的title
            title = (title!=null)?title:"";
            titles.push(title);
        });
        var params = {
            "start": 0,
            "pageNum": 0,
            "fields":JSON.stringify(fields),
            "titles":JSON.stringify(titles),
            "params": JSON.stringify(reqParams)
        };
        // 采用encodeURI两次编码,防止乱码
        window.location.href = Util.constants.CONTEXT + Util.constants.ORDER_POOL_DNS+"/export?params="+encodeURI(encodeURI(JSON.stringify(params)));
    }

    //新增页面
    function addPageEvent(){
        //质检人员信息
        $("#checkStaffInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkStaffId', title: '员工编码信息', align: 'center', width: '15%'},
                {field: 'checkStaffCode', title: '员工CODE', align: 'center', width: '10%'},
                {field: 'checkStaffId', title: '组织编码', align: 'center', width: '10%'},
                {field: 'orgs', title: '员工组', align: 'center', width: '10%'}
            ]],
            fitColumns: true,
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            loader: function (param, success) {
                // var start = (param.page - 1) * param.rows;
                // var pageNum = param.rows;
                // var checkStaffId = $("#checkStaffId").val();
                //
                // var reqParams = {
                //     "checkStaffId": checkStaffId
                // };
                // var params = $.extend({
                //     "start": start,
                //     "pageNum": pageNum,
                //     "params": JSON.stringify(reqParams)
                // }, Util.PageUtil.getParams($("#queryInfo")));
                //
                // Util.ajax.getJson(Util.constants.CONTEXT + qmURI+ "/selectByParams", params, function (result) {
                //     var data = Transfer.DataGrid.transfer(result);
                //     var rspCode = result.RSP.RSP_CODE;
                //     if (rspCode != null && rspCode !== "1") {
                //         $.messager.show({
                //             msg: result.RSP.RSP_DESC,
                //             timeout: 1000,
                //             style: {right: '', bottom: ''},     //居中显示
                //             showType: 'show'
                //         });
                //     }
                //     success(data);
                // });
                var data=[{'checkStaffId':'10001','checkStaffCode':'测试工号22','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10002','checkStaffCode':'测试工号23','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10003','checkStaffCode':'测试工号24','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10004','checkStaffCode':'测试工号25','checkStaffId':'10000','orgs':'投诉专席工单处理1班'},
                    {'checkStaffId':'10005','checkStaffCode':'测试工号26','checkStaffId':'10000','orgs':'投诉专席工单处理1班'}];
                success(data);
            }
        });
    }

    //校验开始时间和终止时间
    function checkTime() {
        var planStartTime = $("#planStartTime").datetimebox("getValue");
        var planEndTime = $("#planEndTime").datetimebox("getValue");
        checkBeginEndTime(planStartTime,planEndTime);
        var distStartTime = $("#distStartTime").datetimebox("getValue");
        var distEndTime = $("#distEndTime").datetimebox("getValue");
        checkBeginEndTime(distStartTime,distEndTime);
    }

    function checkBeginEndTime(startTime,endTime){
        var d1 = new Date(startTime.replace(/-/g, "\/"));
        var d2 = new Date(endTime.replace(/-/g, "\/"));

        if (startTime !== "" && endTime !== "" && d1 > d2) {
            $.messager.show({
                msg: "开始时间不能大于结束时间!",
                timeout: 1000,
                showType: 'show',
                style: {
                    right: '',
                    top: document.body.scrollTop + document.documentElement.scrollTop,
                    bottom: ''
                }
            });
        }
    }

    /**
     * 下拉框数据重载
     */
    function reloadSelectData(paramsType, select, showAll) {
        var reqParams = {
            "tenantId": Util.constants.TENANT_ID,
            "paramsTypeId": paramsType
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };
        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.STATIC_PARAMS_DNS + "/selectByParams", params, function (result) {
            var rspCode = result.RSP.RSP_CODE;
            if (rspCode === "1") {
                var selectData = result.RSP.DATA;
                if (showAll) {
                    var data = {
                        "paramsCode": "-1",
                        "paramsName": "全部"
                    };
                    selectData.unshift(data);
                }
                $("#" + select).combobox('loadData', selectData);
            }
        });
    }

    return {
        initialize: initialize
    };
});