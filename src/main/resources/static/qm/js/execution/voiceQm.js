require(["jquery", 'util', "transfer", "easyui","dateUtil","js/manage/queryQmPlan","js/execution/queryQmPeople"], function ($, Util, Transfer,easyui,dateUtil,QueryQmPlan,QueryQmPeople) {
    //初始化方法
    initialize();
    var reqParams=null;
    var i = 0;//播放按钮点击次数
    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {

        $('#planName').searchbox({//输入框点击查询事件
            searcher: function(value){
                var queryQmPlan = new QueryQmPlan();

                $('#qry_window').show().window({
                    title: '查询考评计划',
                    width: 1150,
                    height: 600,
                    cache: false,
                    content:queryQmPlan.$el,
                    modal: true
                });
            }
        });

        //是否分配下拉框
        $("#isOperate").combobox({
            url: '../../data/isOperate.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var isOperate = $("#isOperate");
                var data = isOperate.combobox('getData');
                if (data.length > 0) {
                    isOperate.combobox('select', data[0].codeValue);
                }
            }
        });

        //是否质检下拉框
        $("#poolStatus").combobox({
            url: '../../data/poolStatus.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var poolStatus = $("#poolStatus");
                var data = poolStatus.combobox('getData');
                if (data.length > 0) {
                    poolStatus.combobox('select', data[0].codeValue);
                }
            }
        });

        //时间控件初始化
        var startTime = $('#startTime');
        startTime.datetimebox({
            onShowPanel:function(){
                $(this).datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onChange: function () {
                check();
            }
        });

        var endTime = $('#endTime');
        endTime.datetimebox({
            onShowPanel:function(){
                $(this).datetimebox("spinner").timespinner("setValue","23:59:59");
            },
            onChange: function () {
                check();
            }
        });

        //质检信息
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'touchId', title: '语音流水', align: 'center', width: '10%'},
                {field: 'staffNumber', title: '坐席号码', align: 'center', width: '10%'},
                {field: 'customerNumber', title: '客户号码', align: 'center', width: '10%'},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'callType', title: '呼叫类型', align: 'center', width: '10%'},
                {
                    field: 'checkedTime', title: '抽取时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value!=null){
                            return DateUtil.formatDateTime(value);
                        }else{
                            return null;
                        }
                    }
                },
                {field: 'checkStaffName', title: '质检人员', align: 'center', width: '10%'},
                {field: 'operateTime', title: '指派时间', align: 'center', width: '10%',
                    formatter: function (value, row, index) { //格式化时间格式
                    if(value!=null){
                        return DateUtil.formatDateTime(value);
                    }else{
                        return null;
                    }
                  }
                },
                {field: 'checkedStaffName', title: '被检人员', align: 'center', width: '10%'},
                {field: 'poolStatus', title: '是否质检', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'待质检','1':'待复检','2':'已质检'}[value];
                    }
                },
                {field: 'isOperate', title: '是否分派', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'未分派','1':'已分派'}[value];
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
                var planId = $("#planId").val();
                var isOperate = $("#isOperate").combobox("getValue");
                var startTime = $("#startTime").datetimebox("getValue");
                var endTime = $("#endTime").datetimebox("getValue");
                var checkStaffId = $("#checkStaffId").val();
                var checkedStaffId = $("#checkedStaffId").val();
                var hungupType = $("#hungupType").val();
                var callType = $("#callType").val();
                var recordTimeMin = $("#recordTimeMin").val();
                var recordTimeMax = $("#recordTimeMax").val();
                if(parseInt(recordTimeMin)>parseInt(recordTimeMax)){
                    $.messager.alert("提示", "最小值不可大于最大值!");
                    return false;
                }
                var staffNumber = $("#staffNumber").val();
                var customerNumber = $("#customerNumber").val();
                var satisfyExtentType = $("#satisfyExtentType").val();
                var mediaType = $("#mediaType").val();
                var srvReqstTypeId = $("#srvReqstTypeId").val();
                var poolStatus = $("#poolStatus").combobox("getValue");

                reqParams = {
                    "touchId": touchId,
                    "planId": planId,
                    "isOperate": isOperate,
                    "extractBeginTime": startTime,
                    "extractEndTime": endTime,
                    "checkStaffId": checkStaffId,
                    "checkedStaffId":checkedStaffId,
                    "hungupType":hungupType,
                    "callType":callType,
                    "recordTimeMin":recordTimeMin,
                    "recordTimeMax":recordTimeMax,
                    "staffNumber":staffNumber,
                    "customerNumber":customerNumber,
                    "satisfyExtentType":satisfyExtentType,
                    "mediaType":mediaType,
                    "srvReqstTypeId":srvReqstTypeId,
                    "poolStatus": poolStatus,
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#queryInfo")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS + "/selectByParams", params, function (result) {
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
            }
        });
    }

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

        //后台导出
        $("#daoBut").on("click", function () {
            dao();
        });

        //删除
        $("#delBut").on("click", function () {
            deleteCheck();
        });

        // var voicePath = "../../data/voice.mp3";
        var voicePath = "../../data/voice2.wav";
        var voice = new Audio(voicePath);
        //播放
        $("#playBut").on("click", function () {
            if(i++%2==0){
                document.getElementById('playBut').text='语音播放';
                voice.play(); //播放
            }else{
                document.getElementById('playBut').text='语音暂停';
                //暂停
                voice.pause();
            }
        });

        //强制释放
        $("#releaseBut").on("click", function () {
            release();
        });

        //分配
        $("#detailBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            for(var i=0;i<selRows.length;i++){
                if (selRows[i].isOperate=="1"||selRows[i].poolStatus=="2") {
                    $.messager.alert("提示", "已分派或已质检后不可操作!");
                    return false;
                }
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].touchId;
                ids.push(id);
            }
            var queryQmPeople = new QueryQmPeople(ids);

            $('#qry_people_window').show().window({
                title: '查询质检人员信息',
                width: 1150,
                height: 600,
                cache: false,
                content:queryQmPeople.$el,
                modal: true
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
            if (selRows[i].poolStatus=="2") {
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
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.VOICE_POOL_DNS).concat("/").concat(ids), {}, function (result) {

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

    //校验开始时间和终止时间
    function check() {
        var startTime = $("#startTime").datetimebox("getValue");
        var endTime = $("#endTime").datetimebox("getValue");
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

    function updateCheck(dataNew) {
        var selRows = $("#checkStaffInfo").datagrid("getSelections");//选中多行
        if (selRows.length == 0||selRows.length>1) {
            $.messager.alert("提示", "请只选择一行数据!");
            return false;
        }
        var params=[];
        for(var i=0;i<dataNew.length;i++){
            var map = {};
            var checkStaffId = selRows[0].checkStaffId;
            var checkStaffCode = selRows[0].checkStaffCode;
            map["checkStaffName"]=checkStaffCode;
            map["checkStaffId"]=checkStaffId;
            map["touchId"]=dataNew[i];
            params.push(map);
        }
        Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.VOICE_POOL_DNS).concat("/updateCheck"), JSON.stringify(params), function (result) {
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
    }

    //删除
    function deleteCheck(){
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
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.VOICE_POOL_DNS).concat("/").concat(delArr), {}, function (result) {
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

    /**
     * 后台导出
     */
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
        window.location.href = Util.constants.CONTEXT + Util.constants.VOICE_POOL_DNS+"/export?params="+encodeURI(encodeURI(JSON.stringify(params)));
    }
    return {
        initialize: initialize
    };
});