require(["jquery", 'util', "transfer", "easyui","dateUtil","js/manage/queryQmPlan","ztree-exedit"], function ($, Util, Transfer,easyui,dateUtil,QueryQmPlan) {
    //初始化方法
    initialize();
    var userInfo;
    var userPermission;
    var reqParams = null;
    var i = 0;//播放按钮点击次数
    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            Util.getRoleCode(userInfo,function(dataNew){
                userPermission = dataNew;//用户权限
                initPageInfo();
                initEvent();
            });
        });
    }

    //页面信息初始化
    function initPageInfo() {

        $('#checkStaffName').searchbox({ //质检人员查询
            editable:false,//禁止手动输入
            searcher: function(value){
                require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                    var queryQmPeople = qryQmPeople;
                    queryQmPeople.initialize("","","checker");
                    $('#qry_people_window').show().window({
                        title: '查询质检人员信息',
                        width: Util.constants.DIALOG_WIDTH,
                        height: Util.constants.DIALOG_HEIGHT_SMALL,
                        cache: false,
                        content:queryQmPeople.$el,
                        modal: true,
                        onBeforeClose:function(){//弹框关闭前触发事件
                            var map = queryQmPeople.getMap();//获取值
                            $('#checkStaffId').val(map.staffId);
                            $('#checkStaffName').searchbox("setValue",map.staffName);
                        }
                    });
                });
            }
        });

        $('#checkedStaffName').searchbox({ //被质检人员查询
            editable:false,//禁止手动输入
            searcher: function(value){
                require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                    var queryQmPeople = qryQmPeople;
                    queryQmPeople.initialize("","2","staffer");
                    $('#qry_people_window').show().window({
                        title: '查询被质检人员信息',
                        width: Util.constants.DIALOG_WIDTH,
                        height: Util.constants.DIALOG_HEIGHT_SMALL,
                        cache: false,
                        content:queryQmPeople.$el,
                        modal: true,
                        onBeforeClose:function(){//弹框关闭前触发事件
                            var map = queryQmPeople.getMap();//获取值
                            $('#checkedStaffId').val(map.staffId);
                            $('#checkedStaffName').searchbox("setValue",map.staffName);
                        }
                    });
                });
            }
        });

        $('#planName').searchbox({//输入框点击查询事件
            editable:false,//禁止手动输入
            searcher: function(value){
                var queryQmPlan = new QueryQmPlan();
                $('#qry_window').show().window({
                    title: '查询考评计划',
                    width: Util.constants.DIALOG_WIDTH,
                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                    cache: false,
                    content:queryQmPlan.$el,
                    modal: true
                });
            }
        });

        //呼叫类型下拉框
        $("#callType").combobox({
            url: '../../data/callType.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight: 'auto',
            editable: false,
            onLoadSuccess: function () {
                var callType = $("#callType");
                var data = callType.combobox('getData');
                if (data.length > 0) {
                    callType.combobox('select', data[0].codeValue);
                }
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

        //抽取开始时间选择框
        var startTime = $("#startTime"),
            beginDate = getFirstDayOfMonth();
        startTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#startTime").datetimebox("spinner").timespinner("setValue", "00:00:00");
            }
        });
        startTime.datetimebox('setValue', beginDate);

        //抽取结束时间选择框
        var endTime = $('#endTime'),
            endDate = (DateUtil.formatDateTime(new Date() - 24 * 60 * 60 * 1000)).substr(0, 11) + " 23:59:59";
        endTime.datetimebox({
            editable: false,
            onShowPanel: function () {
                $("#endTime").datetimebox("spinner").timespinner("setValue", "23:59:59");
            }
        });
        endTime.datetimebox('setValue', endDate);

        //质检信息
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '5%',
                    formatter: function (value, row, index) {
                        var bean = {//根据参数进行定位修改
                            'index':index,
                            'touchId': row.touchId,
                            'recordPath':row.recordPath
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串
                        var action = "<img href='javascript:void(0);' class='playBtn' src='../../image/record.png' style='height: 12px;width: 12px;' title='播放' alt='播放' id =" + beanStr + " >",
                            download = "<img href='javascript:void(0);' class='downloadBtn' src='../../image/download.png' style='height: 12px;width: 12px;' title='下载' alt='下载' id =" + beanStr + " >";
                        return action + "&nbsp;&nbsp;" + download;
                    }
                },
                {field: 'touchId', title: '语音流水', align: 'center', width: '15%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
                {
                    field: 'checkStaffName', title: '质检人员', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + row.checkStaffName + "[" + row.checkStaffId + "]" + "'>" + row.checkStaffName + "[" + row.checkStaffId + "]" + "</span>";
                        }
                    }
                },
                {
                    field: 'checkedStaffName', title: '被检人员', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + row.checkedStaffName + "[" + row.checkedStaffId + "]" + "'>" + row.checkedStaffName + "[" + row.checkedStaffId + "]" + "</span>";
                        }
                    }
                },
                {field: 'staffNumber', title: '坐席号码', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
                {field: 'customerNumber', title: '客户号码', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'callType', title: '呼叫类型', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        return {'0':'呼入','1':'呼出'}[value];
                }},
                {
                    field: 'checkedTime', title: '抽取时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value) + "'>" +  DateUtil.formatDateTime(value) + "</span>";
                        }
                    }
                },
                {field: 'operateTime', title: '指派时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                    if(value){
                        return "<span title='" + DateUtil.formatDateTime(value) + "'>" +  DateUtil.formatDateTime(value) + "</span>";
                    }
                  }
                },
                {field: 'poolStatus', title: '是否质检', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'待质检','1':'待复检','2':'已质检'}[value];
                    }
                },
                {
                    field: 'isOperate', title: '是否分配', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0': '未分配', '1': '已分配'}[value];
                    }
                },
                {field: 'recordPath', title: '录音地址', align: 'center', width: '10%',hidden: true},
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#queryInfo").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var checkedStaffId = "";
                var checkStaffId = "";
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var touchId = $("#touchId").val();
                var planId = $("#planId").val();
                var isOperate = $("#isOperate").combobox("getValue");
                if (isOperate == "-1") {
                    isOperate = "";
                }
                var callType = $("#callType").combobox("getValue");
                if (callType == "-1") {
                    callType = "";
                }
                var startTime = $("#startTime").datetimebox("getValue");
                var endTime = $("#endTime").datetimebox("getValue");
                if(userPermission=="staffer"){
                    checkedStaffId = userInfo.staffId+"";
                }else{
                    checkedStaffId = $("#checkedStaffId").val();
                }
                if(userPermission=="checker"){
                    checkStaffId = userInfo.staffId+"";
                }else{
                    checkStaffId = $("#checkStaffId").val();
                }
                var mediaType = $("#mediaType").val();
                var serviceTypeId = $("#serviceTypeId").val();
                var poolStatus = $("#poolStatus").combobox("getValue");
                if (poolStatus == "-1") {
                    poolStatus = "";
                }
                reqParams = {
                    "touchId": touchId,
                    "planId": planId,
                    "isOperate": isOperate,
                    "extractBeginTime": startTime,
                    "extractEndTime": endTime,
                    "checkStaffId": checkStaffId,
                    "checkedStaffId":checkedStaffId,
                    "callType":callType,
                    "mediaType":mediaType,
                    "srvReqstTypeId":serviceTypeId,
                    "poolStatus": poolStatus,
                    "userPermission":userPermission
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
                        }
                        dataNew.push(map);
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
                    var json = {"rows":dataNew,"total":result.RSP.ATTACH.TOTAL};
                    success(json);
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        if(userPermission=="checker"){//质检员
            $("#detailBut").attr("style","display:none;"); //不可以分配
            $("#releaseBut").attr("style","display:none;");
            //质检员只能查询质检员是自己的数据或者是没有质检员的数据
            $("#checkStaffId").val(userInfo.staffId+"");
            $('#checkStaffName').searchbox("setValue",userInfo.staffName);
            //清除搜索框图标
            var icon = $('#checkStaffName').searchbox("getIcon", 0);
            icon.css("visibility", "hidden");
        }else if(userPermission=="staffer"){//话务员（没有任何功能权限）
            $("#detailBut").attr("style","display:none;");
            $("#claimBut").attr("style","display:none;");
            $("#releaseBut").attr("style","display:none;");
            //话务员只能查询被质检员是自己的数据
            $("#checkedStaffId").val(userInfo.staffId);
            $('#checkedStaffName').searchbox("setValue",userInfo.staffName);
            //清除搜索框图标
            var icon = $('#checkedStaffName').searchbox("getIcon", 0);
            icon.css("visibility", "hidden");
        }

        //查询
        $("#queryBtn").on("click", function () {
            var startTime = $("#startTime").datetimebox("getValue"),
                endTime = $("#endTime").datetimebox("getValue");
            if (!checkTime(startTime, endTime)) {  //查询时间校验
                return;
            }
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

        //强制释放
        $("#releaseBut").on("click", function () {
            release();
        });

        //分配
        $("#detailBut").on("click", function () {
            var flag = "1";//语音分配标志
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
            require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                var queryQmPeople = qryQmPeople;
                queryQmPeople.initialize(ids,flag,"manager");
                $('#qry_people_window').show().window({
                    title: '查询质检人员信息',
                    width: Util.constants.DIALOG_WIDTH,
                    height: Util.constants.DIALOG_HEIGHT_SMALL,
                    cache: false,
                    content:queryQmPeople.$el,
                    modal: true
                });
            });
        });

        //认领(质检员自己认领)
        $("#claimBut").on("click", function () {
            var selRows = $("#queryInfo").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            for(var i=0;i<selRows.length;i++){
                if (selRows[i].poolStatus == "2"||selRows[i].isOperate=="1") {
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

        // var voicePath = "../../data/voice.mp3";
        var voicePath = "../../data/voice2.wav";
        var voice  = new Audio(voicePath);
        //语音播放
        $("#page").on('click','img.playBtn',function(){
            var rowData = $(this).attr('id'); //获取a标签中传递的值
            var sensjson = JSON.parse(rowData); //转成json格式
            voice.src=voicePath;
            // voice.src=sensjson.recordPath;
            // voice.load();//重新加载音频，用于更改src之后使用 //todo

        });
        //语音下载
        $("#page").on('click', 'img.downloadBtn', function () {
            var rowData = $(this).attr('id'); //获取a标签中传递的值
            var sensjson = JSON.parse(rowData); //转成json格式
            var recordPath = sensjson.recordPath;
            if (recordPath == null || recordPath === "") {
                $.messager.alert("提示", "未找到录音地址!");
            } else {
                window.location.href = Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/recordDownload" + '?ftpPath=' + recordPath;
            }
        });
    }

    /**
     * 认领
     */
    function claim(dataNew){
        var params=[];
        for(var i=0;i<dataNew.length;i++){
            var map = {};
            map["checkStaffName"]=userInfo.staffName;
            map["checkStaffId"]=userInfo.staffId+"";
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
                $("#queryInfo").datagrid('reload'); //成功后，刷新页面
            }
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

    /**
     * 后台导出
     */
    function dao(){
        var fields = $('#queryInfo').datagrid('getColumnFields'); //获取datagrid的所有fields
        var titles=[];
        var checkStaffId = "";
        fields.forEach(function(value,index,array){
            var title = $('#queryInfo').datagrid('getColumnOption',value).title;//获取datagrid的title
            title = (title!=null)?title:"";
            titles.push(title);
        });
        if(userPermission=="checker"){
            checkStaffId = userInfo.staffId+"";
        }
        if(reqParams == null){
             reqParams= {
                "touchId": "",
                "planId": "",
                "isOperate": "",
                "extractBeginTime": "",
                "extractEndTime": "",
                "checkStaffId": checkStaffId,
                "checkedStaffId":"",
                "callType":"",
                "mediaType":"",
                "srvReqstTypeId":"",
                "poolStatus": "",
                 "userPermission":userPermission
            };
        }
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

    //判断字符是否为空的方法
    function isEmpty(obj){
        if(typeof obj == "undefined" || obj == null || obj == ""){
            return true;
        }else{
            return false;
        }
    }

    //获取当前月1号
    function getFirstDayOfMonth() {
        var date = new Date,
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            mon = (month < 10 ? "0" + month : month);
        return year + "-" + mon + "-01 00:00:00";
    }

    //校验开始时间和终止时间
    function checkTime(beginTime, endTime) {
        var d1 = new Date(beginTime.replace(/-/g, "\/")),
            d2 = new Date(endTime.replace(/-/g, "\/"));

        if (beginTime !== "" && endTime === "") {
            $.messager.alert("提示", "请选择结束时间");
            return false;
        }
        if (beginTime === "" && endTime !== "") {
            $.messager.alert("提示", "请选择开始时间!");
            return false;
        }
        if (beginTime !== "" && endTime !== "" && beginTime.substring(0, 7) !== endTime.substring(0, 7)) {
            $.messager.alert("提示", "不能跨月查询!");
            return false;
        }
        if (beginTime !== "" && endTime !== "" && d1 > d2) {
            $.messager.alert("提示", "开始时间不能大于结束时间!");
            return false;
        }
        return true;
    }

    return {
        initialize: initialize
    };
});