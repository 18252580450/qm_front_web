require(["jquery", 'util', "transfer", "easyui","dateUtil","js/manage/queryQmPlan","ztree-exedit"], function ($, Util, Transfer,easyui,dateUtil,QueryQmPlan) {
    //初始化方法
    initialize();
    var userInfo;
    var userPermission;
    var reqParams = null;
    var isCheckParent=false;//设置父节点是否可被选 true 可选 false不可选 默认可选
    var isChoice=false; //节点是否区分可选标志 true区分 false不区分 默认不区分(节点是否可被选)
    var isVisual=true; // 节点是否区分可见性标志 true区分 false不区分 默认不区分
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

    /**
     * 过滤数据
     */
    function filterData(datas) {
        if (isEmpty(datas)) {
            return;
        }
        for (var index in datas) {
            datas[index].isParent = datas[index].parent;
            datas[index].children = [];
            if (!isCheckParent && datas[index].isParent) {
                //父节点不可选
                datas[index].chkDisabled = true;
            }
            if (isChoice && datas[index].optnlFlag == "0") {
                //表示节点不可选
                datas[index].chkDisabled = true;
            }
            if (isVisual && datas[index].vsblFlag == "0") {
                //隐藏节点
                datas[index].isHidden = true;
            }
        }
    }

    function initTree(data) {
        var url = Util.constants.SRV_REQTYPE_REDIS_TREE;
        var setting = {
            async: {
                dataType: "json",
                type: "POST",
                enable: true,
                url: url,
                autoParam: ["srvReqstTypeId=suprSrvReqstTypeId"],
                otherParam: {
                    "provCode": Util.constants.PROVCODE
                },
                dataFilter : filter
            },
            data: {
                key: {
                    name: "srvReqstTypeNm"
                },
                simpleData: {
                    enable: true,
                    idKey: "srvReqstTypeId",
                    pIdKey: "suprSrvReqstTypeId",
                    rootPId: 1
                }
            },
            callback : {
                onClick: function (e, id, node) {//点击事件
                    if(node.isParent){
                        $.messager.alert("提示", "请点击子节点!");
                        return false;
                    }
                    $('#serviceTypeName').searchbox("setValue",node.srvReqstTypeNm);
                    $('#serviceTypeId').val(node.srvReqstTypeId);
                    $("#qry_service_window").window('close'); // 关闭窗口
                }
            }
        };
        function filter(treeId, parentNode, json) {
            var childNodes = json.rsp.datas;
            if (!childNodes) {
                return;
            }
            filterData(childNodes);
            return childNodes;
        }

        var newNode = data.rsp.datas;
        filterData(newNode);
        $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#tree"), setting, newNode);
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

        $('#serviceTypeName').searchbox({ //服务请求类型输入框点击查询事件
            editable:false,//禁止手动输入
            searcher: function(value){
                $('#qry_service_window').show().window({
                    title: '查询服务请求类型',
                    width: 300,
                    height: 500,
                    cache: false,
                    modal: true
                });
                $.ajax({
                    url:Util.constants.SRV_REQTYPE_REDIS_TREE,
                    dataType:'json',
                    type:"POST",
                    data:{
                        suprSrvReqstTypeId:0,
                        provCode: Util.constants.PROVCODE
                    },
                    success:function(data){
                        initTree(data);
                    },
                    error:function(){
                        $.messager.show({
                            title: "Error",
                            msg: "获取服务请求树失败!",
                            timeout: 2000,
                            style: {}
                        });
                    }
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
                    callType.combobox('select', data[2].codeValue);
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
                    isOperate.combobox('select', data[2].codeValue);
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
                    poolStatus.combobox('select', data[3].codeValue);
                }
            }
        });

        //时间控件初始化
        var startTime = $('#startTime');
        startTime.datetimebox({
            onShowPanel:function(){
                $(this).datetimebox("spinner").timespinner("setV    alue","00:00:00");
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
                {
                    field: 'action', title: '操作', width: '5%',
                    formatter: function (value, row, index) {
                        var bean = {//根据参数进行定位修改
                            'index':index,
                            'touchId': row.touchId,
                            'recordPath':row.recordPath
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串
                        var action = "<a href='javascript:void(0);' class='playBtn' id =" + beanStr + " >语音播放</a>";
                        return action;
                    }
                },
                {field: 'touchId', title: '语音流水', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }},
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
                {field: 'checkStaffName', title: '质检人员', align: 'center', width: '10%'},
                {field: 'operateTime', title: '指派时间', align: 'center', width: '10%',
                    formatter: function (value, row, index) { //格式化时间格式
                    if(value){
                        return "<span title='" + DateUtil.formatDateTime(value) + "'>" +  DateUtil.formatDateTime(value) + "</span>";
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
            loader: function (param, success) {
                var checkedStaffId = "";
                var checkStaffId = "";
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var touchId = $("#touchId").val();
                var planId = $("#planId").val();
                var isOperate = $("#isOperate").combobox("getValue");
                if(isOperate=="2"){
                    isOperate = "";
                }
                var callType = $("#callType").combobox("getValue");
                if(callType=="2"){
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
                var hungupType = $("#hungupType").val();
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
                var serviceTypeId = $("#serviceTypeId").val();
                var poolStatus = $("#poolStatus").combobox("getValue");
                if(poolStatus=="3"){
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
                    "hungupType":hungupType,
                    "callType":callType,
                    "recordTimeMin":recordTimeMin,
                    "recordTimeMax":recordTimeMax,
                    "staffNumber":staffNumber,
                    "customerNumber":customerNumber,
                    "satisfyExtentType":satisfyExtentType,
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
        $("#page").on('click','a.playBtn',function(){
            var rowData = $(this).attr('id'); //获取a标签中传递的值
            var sensjson = JSON.parse(rowData); //转成json格式
            var index = sensjson.index;
            voice.src=voicePath;
            // voice.src=sensjson.recordPath;
            voice.load();//重新加载音频，用于更改src之后使用

            if(i++%2==0){
                $("a.playBtn")[index].innerHTML='语音停止';
                voice.play(); //播放
            }else{
                $("a.playBtn")[index].innerHTML='语音播放';
                voice.pause();//暂停
            }
        });
        
        //语音下载
        $("#downloadBut").on('click',function () {
            var selRows = $("#queryInfo").datagrid("getSelections");//选中多行

            window.open("https://codeload.github.com/douban/douban-client/legacy.zip/master",'_blank');

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
                "hungupType":"",
                "callType":"",
                "recordTimeMin":"",
                "recordTimeMax":"",
                "staffNumber":"",
                "customerNumber":"",
                "satisfyExtentType":"",
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

    return {
        initialize: initialize
    };
});