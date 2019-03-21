require(["js/manage/queryQmPlan","jquery", 'util', "transfer", "easyui","dateUtil","ztree-exedit"], function (QueryQmPlan,$, Util, Transfer,easyui,dateUtil) {
    //初始化方法
    initialize();
    var reqParams = null;
    var isCheckParent=false;//设置父节点是否可被选 true 可选 false不可选 默认可选
    var isChoice=false; //节点是否区分可选标志 true区分 false不区分 默认不区分(节点是否可被选)
    var isVisual=true; // 节点是否区分可见性标志 true区分 false不区分 默认不区分
    function initialize() {
        initPageInfo();
        initEvent();
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
        var url = "http://203.57.227.53:8082/tcwf/servReqTypeManage/srvReqTypeRedisTree";
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
            searcher: function(value){
                require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                var queryQmPeople = qryQmPeople;
                queryQmPeople.initialize("","");
                $('#qry_people_window').show().window({
                    title: '查询质检人员信息',
                    width: 1150,
                    height: 650,
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

        $('#planName').searchbox({//输入框点击查询事件
            searcher: function(value){
                var queryQmPlan = new QueryQmPlan();

                $('#qry_window').show().window({
                    title: '查询考评计划',
                    width: 1150,
                    height: 650,
                    cache: false,
                    content:queryQmPlan.$el,
                    modal: true
                });
            }
        });

        $('#serviceTypeName').searchbox({//服务请求类型输入框点击查询事件
            searcher: function(value){
                $('#qry_service_window').show().window({
                    title: '查询服务请求类型',
                    width: 300,
                    height: 500,
                    cache: false,
                    modal: true
                });
                var zNodes = [];
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
                    isDis.combobox('select', data[2].codeValue);
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
        var planStartTime = $('#planStartTime');
        planStartTime.datetimebox({
            onShowPanel:function(){
                $(this).datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onChange: function () {
                checkTime();
            }
        });

        var planEndTime = $('#planEndTime');
        planEndTime.datetimebox({
            onShowPanel:function(){
                $(this).datetimebox("spinner").timespinner("setValue","23:59:59");
            },
            onChange: function () {
                checkTime();
            }
        });

        //列表
        $("#queryInfo").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'wrkfmShowSwftno', title: '工单流水', align: 'center', width: '15%'},
                {field: 'bizTitle', title: '工单标题', align: 'center', width: '10%'},
                {field: 'planName', title: '计划名称', align: 'center', width: '10%'},
                {field: 'srvReqstTypeFullNm', title: '问题分类', align: 'center', width: '10%'},
                {field: 'custEmail', title: '客户账号', align: 'center', width: '10%'},
                {field: 'custName', title: '客户名称', align: 'center', width: '10%'},
                {field: 'custNum', title: '客户号码', align: 'center', width: '10%'},
                {field: 'crtTime', title: '提交时间', align: 'center', width: '10%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value!=null){
                            return DateUtil.formatDateTime(value);
                        }else{
                            return null;
                        }
                    }},
                {field: 'arcTime', title: '完成时间', align: 'center', width: '10%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value!=null){
                            return DateUtil.formatDateTime(value);
                        }else{
                            return null;
                        }
                    }},
                {field: 'acptStaffId', title: '立单人', align: 'center', width: '10%'},
                {field: 'dspsComplteStaffId', title: '领取人', align: 'center', width: '10%'},

                {field: 'handleDuration', title: '处理时长', align: 'center', width: '10%'},
                {field: 'planId', title: '计划编码', align: 'center', width: '10%',hidden: true},
                {field: 'isOperate', title: '是否分配', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'未分配','1':'已分配'}[value];
                    }
                },
                {field: 'poolStatus', title: '是否质检', align: 'center', width: '10%',
                    formatter:function(value, row, index){
                        return {'0':'待质检','1':'待复检','2':'已质检'}[value];
                    }
                },
                {field: 'checkStaffName', title: '质检员', align: 'center', width: '10%'},
                {field: 'checkedStaffName', title: '被质检员', align: 'center', width: '10%'},
                {
                    field: 'operateTime', title: '分配时间', align: 'center', width: '15%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value!=null){
                            return DateUtil.formatDateTime(value);
                        }else{
                            return null;
                        }
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
                var checkStaffId = $("#checkStaffId").val();
                var wrkfmShowSwftno = $("#workOrderId").val();
                var planId = $("#planId").val();
                var serviceTypeId = $("#serviceTypeId").val();
                var isOperate = $("#isDis").combobox("getValue");
                if(isOperate=="2"){
                    isOperate = "";
                }
                var poolStatus = $("#poolStatus").combobox("getValue");
                if(poolStatus=="3"){
                    poolStatus = "";
                }
                var planStartTime = $("#planStartTime").datetimebox("getValue");
                var planEndTime = $("#planEndTime").datetimebox("getValue");
                var qmLink = $("#qmLink").val();

                reqParams = {
                    "wrkfmShowSwftno": wrkfmShowSwftno,
                    "planId": planId,
                    "srvReqstTypeId": serviceTypeId,
                    "poolStatus": poolStatus,
                    "isOperate":isOperate,
                    "planStartTime": planStartTime,
                    "planEndTime": planEndTime,
                    "checkLink": qmLink,
                    "checkStaffId":checkStaffId
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
                    var json = {"rows":dataNew,"total":result.RSP.ATTACH.TOTAL};
                    success(json);
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
                if (selRows[i].poolStatus == "2"||selRows[i].isOperate=="1") {
                    $.messager.alert("提示", "已分配或已质检后不可操作!");
                    return false;
                }
            }
            $.messager.confirm('确认弹窗', '确定要认领吗？', function (confirm) {
                if (confirm) {
                    var ids = [];
                    for (var i = 0; i < selRows.length; i++) {
                        var id = selRows[i].wrkfmShowSwftno;
                        ids.push(id);
                    }
                    claim(ids);
                }});
        });

        //分配(管理员分配质检员)
        $("#disBut").on("click", function () {
            var flag = "0";//工单分配标志
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
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].wrkfmShowSwftno;
                ids.push(id);
            }
            require(["js/execution/queryQmPeople"], function (qryQmPeople) {
                var queryQmPeople = qryQmPeople;
                queryQmPeople.initialize(ids,flag);
                $('#qry_people_window').show().window({
                    title: '查询质检人员信息',
                    width: 1150,
                    height: 650,
                    cache: false,
                    content:queryQmPeople.$el,
                    modal: true
                });
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
            map["wrkfmShowSwftno"]=dataNew[i];
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
            var id = selRows[i].wrkfmShowSwftno;
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
        if(reqParams==null){
            reqParams = {
                "wrkfmShowSwftno": "",
                "planId": "",
                "srvReqstTypeId": "",
                "poolStatus": "",
                "isOperate":"",
                "planStartTime": "",
                "planEndTime": "",
                "checkLink": "",
                "checkStaffName":""
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
        window.location.href = Util.constants.CONTEXT + Util.constants.ORDER_POOL_DNS+"/export?params="+encodeURI(encodeURI(JSON.stringify(params)));
    }

    //校验开始时间和终止时间
    function checkTime() {
        var planStartTime = $("#planStartTime").datetimebox("getValue");
        var planEndTime = $("#planEndTime").datetimebox("getValue");
        checkBeginEndTime(planStartTime,planEndTime);
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