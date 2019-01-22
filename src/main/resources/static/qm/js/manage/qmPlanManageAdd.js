define([
       "text!html/manage/qmPlanManageAdd.tpl",
        "js/manage/qryCheckTemplate",
        "js/manage/qryStrategy",
        "jquery", 'commonAjax','util', "transfer", "easyui","crossAPI","dateUtil",'ztree-exedit'],
    function (tpl,QryCheckTemplate,QryStrategy,$,CommonAjax, Util, Transfer,crossAPI,dateUtil) {
    //调用初始化方法
    var planTypes = [];
    var $el;
    var planBean;
    var qmBindRlnList=[];
    var list;
    var listTable;
    var isClicked = false;//是否点击
    var checkStaffName="";
    var checkStaffId="";
    var planIdNew;
    var initialize = function(planId) {
        $el = $(tpl);
        if(planId){
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/" + planId, {}, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1" && result.RSP.DATA.length > 0) {
                    planBean = result.RSP.DATA[0];
                    initSearchForm(planBean);
                    initDatas(planBean);
                }
            });
        }else{
            $('#deleteBtn',$el)[0].style.display="none";//新增时，删除按钮隐藏
            initSearchForm();//初始化表单数据
            initDatas();
        }
        planIdNew = planId;
        initGlobalEvent();
        this.$el = $el;
    };

    function initGlobalEvent(){
        // 新增质检员
        $("#addQmStaffBtn",$el).on("click", function () {
            require(["js/manage/qryQmPeople"], function (qryQmPeople) {
                var queryQmPeople = qryQmPeople;
                queryQmPeople.initialize();
                $('#qry_people_window').show().window({
                    title: '查询质检人员信息',
                    width: 1150,
                    height: 600,
                    cache: false,
                    content:queryQmPeople.$el,
                    modal: true,
                    onBeforeClose:function(){//弹框关闭前触发事件
                        list = queryQmPeople.getList();//获取值
                        //为zTree添加节点
                        addNodes(list);
                    }
                });
            });
        });

        // 新增被质检员
        $("#addCheckedStaffBtn",$el).on("click", function () {
            require(["js/manage/qryQmPeople"], function (qryQmPeople) {
                var queryQmPeople = qryQmPeople;
                queryQmPeople.initialize();
                $('#qry_people_window').show().window({
                    title: '查询质检人员信息',
                    width: 1150,
                    height: 600,
                    cache: false,
                    content:queryQmPeople.$el,
                    modal: true,
                    onBeforeClose:function(){//弹框关闭前触发事件
                        listTable = queryQmPeople.getList();//获取值
                        //为list表添加数据
                        addListData(listTable);
                    }
                });
            });
        });

        //删除
        $('#deleteBtn',$el).on('click',function(){
            var delRows = $("#checkedStaffList",$el).datagrid("getSelections");
            if (delRows.length === 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return;
            }
            var delArr = [];
            for (var i = 0; i < delRows.length; i++) {
                var map={};
                map["checkStaffId"] = delRows[i].checkStaffId;
                map["checkedObjectId"] = delRows[i].checkedObjectId;
                map["planId"] = planIdnew;
                delArr.push(map);
            }
            var params =  {"params":delArr};
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.QM_BIND_RLN_DNS).concat("/"),JSON.stringify(params), function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        if (result.RSP.RSP_CODE == "1") {
                            $("#checkedStaffList",$el).datagrid('reload'); //删除成功后，刷新页面
                        }
                    });
                }
            });
        });

        //关闭
        $("#close",$el).on("click", function () {
            $("#mainForm",$el).form('clear');
            $("#add_window").window("close");
        });

        //保存
        $("#addPlan",$el).on("click", function () {
            //禁用按钮，防止多次提交
            $('#addPlan',$el).linkbutton({disabled: true});
            $('#planRuntime',$el).validatebox({required:true});//非空校验
            var planName = $("#planName",$el).val();
            var planType = $("#planType",$el).combobox('getValue');
            var templateId = $("#templateId",$el).val();
            var pId = $("#pId",$el).val();
            var manOrAuto = $("#manOrAuto",$el).combobox('getValue');
            var planRuntype = $("#planRuntype",$el).combobox('getValue');
            var planRuntime = $('#planRuntime',$el).timespinner('getValue');
            var planStarttime = $('#planStarttime',$el).datetimebox('getValue');
            var planEndtime = $('#planEndtime',$el).datetimebox('getValue');
            var remark = $('#remark',$el).val();

            if(planRuntime==""||planRuntime==null){
                $.messager.alert('警告', '必填项不可为空!');
                return false;
            }
            //质检关系
            var qmBindRlnListNew = [];
            var treeObj = $.fn.zTree.getZTreeObj("qmStaffsTree");
            var nodes = treeObj.getNodes();
            var checkedStaff = $("#checkedStaffList").datagrid("getRows");
            var staffIds = [];
            if(checkedStaff && checkedStaff.length > 0){
                qmBindRlnListNew.push(checkedStaff);
                $.each(checkedStaff,function(j,c){
                    if(staffIds.indexOf(c.checkStaffId) < 0){
                        staffIds.push(c.checkStaffId);
                    }
                });
            }
            if(nodes.length > 1){
                for(var i = 1;i<nodes.length;i++){
                    if(staffIds.indexOf(nodes[i].checkStaffId) < 0){
                        var qmBindRln = {
                            checkStaffId:nodes[i].checkStaffId,
                            userType:"0"
                        };
                        qmBindRlnListNew.push(qmBindRln);
                    }
                }
            }

            var params = {
                'tenantId': Util.constants.TENANT_ID,
                'planName': planName,
                'planType': planType,
                'templateId':templateId,
                'pId': pId,
                'manOrAuto': manOrAuto,
                'planRuntype':planRuntype,
                'planRuntime':"2018-01-01 " + planRuntime,
                'planStarttime': planStarttime,
                'planEndtime': planEndtime,
                'remark':remark,
                'qmBindRlnList':qmBindRlnList
            };

            if (planName == null || planName == "" || planType == null || planType == "" || templateId == null || templateId == ""
                || pId == null || pId == "" || manOrAuto == null || manOrAuto == "" || planRuntype == null || planRuntype == "") {
                $.messager.alert('警告', '必填项不能为空。');

                $("#addPlan",$el).linkbutton({disabled: false});  //按钮可用
                return false;
            }
            var rspCode;
            if(planBean){
                planBean.planName = planName;
                planBean.planType = planType;
                planBean.templateId = templateId;
                planBean.pId = pId;
                planBean.manOrAuto = manOrAuto;
                planBean.planRuntype = planRuntype;
                planBean.planRuntime = "2018-01-01 " + planRuntime;
                planBean.planStarttime = planStarttime;
                planBean.planEndtime = planEndtime;
                planBean.remark = remark;
                planBean.qmBindRlnList = qmBindRlnList;
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/"), JSON.stringify(planBean), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $("#planList").datagrid('reload'); //修改成功后，刷新页面
                    }
                });
            }else{
                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/"), JSON.stringify(params), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                });
                rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $("#planList").datagrid('reload'); //新增成功后，刷新页面
                    $("#add_window").window("close"); // 关闭窗口
                }
            }

            // //添加绑定关系
            // //获取datagrid中的所有数据，将其拼接成json格式字符串数组
            // var json = [];
            // var rowsData = $('#checkedStaffList',$el).datagrid('getRows');
            // $.each(rowsData, function (i){
            //    var loc = {
            //         "planId":planIdNew,
            //         "checkStaffId":rowsData[i].checkStaffId,
            //         "checkedObjectId":rowsData[i].checkedObjectId,
            //         // "checkStaffName":rowsData[i].checkStaffName,
            //         // "checkedObjectName":rowsData[i].checkedObjectName,
            //         // "checkedDepartName":rowsData[i].checkedDepartName,
            //         "userType": "0",//对象类型先写死成话务员
            //     };
            //     json.push(loc);
            // });
            // var param =  {"params":json};
            // Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.QM_BIND_RLN_DNS).concat("/insertQmBindRln"),JSON.stringify(param), function (result) {
            //
            //     $.messager.show({
            //         msg: result.RSP.RSP_DESC,
            //         timeout: 1000,
            //         style: {right: '', bottom: ''},     //居中显示
            //         showType: 'slide'
            //     });
            //     if (result.RSP.RSP_CODE == "1") {
            //         $("#mainForm",$el).form('clear');
            //         $("#add_window").window("close"); // 关闭窗口
            //         $("#planList").datagrid('reload'); //插入成功后，刷新页面
            //     }
            // });

            //enable按钮
            $("#addPlan",$el).linkbutton({disabled: false}); //按钮可用
        });
    }

    //初始化搜索表单
    function initSearchForm(planBean) {
        $('#planStarttime',$el).datetimebox({
            required: false,
            showSeconds: true,
            panelHeight:'auto',
            onShowPanel:function(){
                $("#planStarttime",$el).datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onSelect:function(beginDate){
                $('#planEndtime',$el).datetimebox().datetimebox('calendar').calendar({
                    validator: function(date){
                        return beginDate <= date;
                    }
                })
            }
        });

        $('#planEndtime',$el).datetimebox({
            required: false,
            showSeconds: true,
            onShowPanel:function(){
                $("#planEndtime",$el).datetimebox("spinner").timespinner("setValue","23:59:59");
            }
        });
        $('#planRuntime',$el).timespinner({
            required: false,
            showSeconds: true,
            panelHeight:'auto'
        });
        $('#manOrAuto',$el).combobox({
            data: [
                {
                    value:"0",
                    text:"自动分派"
                },
                {
                    value:"1",
                    text:"人工分派"
                }
            ],
            editable: false
        });
        $('#manOrAuto',$el).combobox("setValue","0");
        $('#planRuntype',$el).combobox({
            data: [
                {
                    value:"0",
                    text:"每天自动执行"
                },
                {
                    value:"1",
                    text:"执行一次"
                },
                {
                    value:"2",
                    text:"手动执行"
                }
            ],
            editable: false
        });
        $('#planRuntype',$el).combobox("setValue","0");
        $('#template',$el).searchbox({
            searcher: function(value){
                var qryCheckTemplate = new QryCheckTemplate();

                $('#qry_window').show().window({
                    title: '查询模板',
                    width: 1000,
                    height: 550,
                    cache: false,
                    content:qryCheckTemplate.$el,
                    modal: true
                });
            }
        });
        $('#strategy',$el).searchbox({
            searcher: function(value){
                var qryStrategy = new QryStrategy();

                $('#qry_window').show().window({
                    title: '查询考评策略',
                    width: 1000,
                    height: 550,
                    cache: false,
                    content:qryStrategy.$el,
                    modal: true
                });
            }
        });

        CommonAjax.getStaticParams("PLAN_TYPE",function(datas){
            if(datas){
                planTypes = datas;
                planTypes.unshift({paramsCode:"",paramsName:"全部"});
                $('#planType',$el).combobox({
                    data: planTypes,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
                if(planBean){
                    $("#planType",$el).combobox('setValue',planBean.planType);
                }
            }
        });
        $('#planType',$el).combobox({
            data: planTypes,
            editable: false
        });
        //修改
        if(planBean){
            $('#planName',$el).textbox('setValue',planBean.planName);
            $("#templateId",$el).val(planBean.templateId);
            //$("#template",$el).val(planBean.templateName);
            $('#template').searchbox("setValue",planBean.templateName);
            $("#pId",$el).val(planBean.pId);
            $('#strategy').searchbox("setValue",planBean.pName);
            $("#manOrAuto",$el).combobox('setValue',planBean.manOrAuto);
            $("#planRuntype",$el).combobox('setValue',planBean.planRuntype);
            if(planBean.planRuntime){
                $('#planRuntime',$el).timespinner('setValue',DateUtil.formatDateTime(planBean.planRuntime,"hh:mm:ss"));
            }
            if(planBean.planStarttime){
                $('#planStarttime',$el).datetimebox('setValue',DateUtil.formatDateTime(planBean.planStarttime,"yyyy-MM-dd hh:mm:ss"));
            }
            if(planBean.planEndtime){
                $('#planEndtime',$el).datetimebox('setValue',DateUtil.formatDateTime(planBean.planEndtime,"yyyy-MM-dd hh:mm:ss"));
            }
            $('#remark',$el).textbox('setValue',planBean.remark);
        }
    }

    //初始化树
    function initTree(checkStaffs){
        var setting = {
            view: {
                selectedMulti: false//是否支持同时选中多个节点
            },
            data: {
                key: {
                    name: "checkStaffName"
                },
                simpleData: {
                    enable: true,   //是否异步
                    idKey: "checkStaffId",    //当前节点id属性
                    pIdKey: "pId",  //当前节点的父节点id属性
                    rootPId: 0      //用于修正根节点父节点数据，即pIdKey指定的属性值
                }
            },
            callback:{
                onClick:function(e, id, node){
                    isClicked = true;
                    if(node.checkStaffId != 0){ //判断是否点击的是父节点
                        checkStaffName = node.checkStaffName;
                        checkStaffId = node.checkStaffId;
                        var checkedStaffsOfCheckStaff = [];
                        if(qmBindRlnList.length > 0) {//判断考评计划是否绑定了人员关系
                            $.each(qmBindRlnList, function (i, qmBindRln) {
                                if (qmBindRln.checkStaffId == node.checkStaffId && qmBindRln.checkedObjectId != "") {
                                    checkedStaffsOfCheckStaff.push(qmBindRln);
                                }
                            });
                        }
                        $("#checkedStaffList",$el).datagrid("loadData",checkedStaffsOfCheckStaff);
                    }else{
                        var checkedStaffs = [];
                        checkStaffName = "";
                        checkStaffId = "";
                        if(qmBindRlnList.length > 0) {
                            $.each(qmBindRlnList, function (i, qmBindRln) {
                                if (qmBindRln.userType == 0 && qmBindRln.checkedObjectId) {
                                    checkedStaffs.push(qmBindRln);
                                }
                            });
                        }
                        $("#checkedStaffList",$el).datagrid("loadData",checkedStaffs);
                    }
                }
            }
        };
        if(checkStaffs){
            checkStaffs.unshift({
                checkStaffId:"0",
                checkStaffName:"质检员列表"
            });
        }else{
            checkStaffs = [{
                checkStaffId:"0",
                checkStaffName:"质检员列表"
            }];
        }

        var treeObj = $.fn.zTree.init($("#qmStaffsTree",$el), setting, checkStaffs);
        var nodes = treeObj.getNodes();
        treeObj.expandNode(nodes[0], true, false, false);
    }

    //初始化被质检对象列表
    function initTable(checkedStaffs,checkedDeparts){
        if(checkedStaffs && checkedStaffs.length > 0){
            $("#checkedStaffList",$el).datagrid({
                columns:[
                    [
                        {field: 'ck', checkbox: true, align: 'center'},
                        {field:'checkedObjectId',title:'被质检人ID',width:'15%'},
                        {field:'checkedObjectName',title:'被质检人姓名',width:'20%'},
                        {field:'checkedDepartName',title:'所属部门',width:'20%'},
                        {field:'checkStaffId',title:'质检人ID',width:'15%'},
                        {field:'checkStaffName',title:'质检人',width:'18%'},
                        {
                            field: 'action', title: '操作', width: '10%',
                            formatter: function (value, row, index) {
                                var Action =
                                    "<a href='javascript:void(0);' class='delBtn' id =" + row.checkedObjectId + " >删除</a>";
                                return Action;
                            }
                        }
                    ]
                ],
                data:checkedStaffs,
                idField:"checkedObjectId",
                checkOnSelect: false,
                height : "300px"
            });
        }else if(checkedDeparts && checkedDeparts.length > 0){
            $("#checkedStaffList",$el).datagrid({
                columns : [
                    [
                        {field: 'ck', checkbox: true, align: 'center'},
                        {field:'checkedObjectId',title:'被质检部门ID',width:'30%'},
                        {field:'checkedObjectName',title:'被质检部门姓名',width:'30%'},
                        {
                            field: 'action', title: '操作', width: '40%',
                            formatter: function (value, row, index) {
                                var Action =
                                    "<a href='javascript:void(0);' class='delBtn' id =" + row.checkedObjectId + " >删除</a>";
                                return Action;
                            }
                        }
                    ]
                ],
                data:checkedDeparts,
                checkOnSelect: false,
                height : "300px"
            });
        }else{
            $("#checkedStaffList",$el).datagrid({
                columns:[
                    [
                        {field: 'ck', checkbox: true, align: 'center'},
                        {field:'checkedObjectId',title:'被质检人ID',width:'15%'},
                        {field:'checkedObjectName',title:'被质检人姓名',width:'20%'},
                        {field:'checkedDepartName',title:'所属部门',width:'20%'},
                        {field:'checkStaffId',title:'质检人ID',width:'15%'},
                        {field:'checkStaffName',title:'质检人',width:'18%'},
                        {
                            field: 'action', title: '操作', width: '10%',
                            formatter: function (value, row, index) {
                                var Action =
                                    "<a href='javascript:void(0);' class='delBtn' id =" + row.checkedObjectId + " >删除</a>";
                                return Action;
                            }
                        }
                    ]
                ],
                idField:"checkedObjectId",
                checkOnSelect: false,
                height : "300px"
            });
        }
    }

    //行数据删除
    function initDelBut(){
        $("#page",$el).on("click", "a.delBtn", function () {
            var checkedObjectId = $(this).attr('id');
            $("#checkedStaffList",$el).datagrid("deleteRow",$("#checkedStaffList",$el).datagrid("getRowIndex",checkedObjectId));
            if(qmBindRlnList && qmBindRlnList.length > 0){
                $.each(qmBindRlnList,function(i,qmBindRln){
                    if(qmBindRln.checkedObjectId == checkedObjectId){
                        //delete qmBindRlnList[i];
                        qmBindRlnList.splice(i,1);
                        return;
                    }
                });
            }
        });
    }

    //为zTree添加节点
    function addNodes(list){
        if(list.length!=0){
            //1、获取zTree对象
            var treeObj = $.fn.zTree.getZTreeObj("qmStaffsTree");
            list.forEach(function(value,index,array){
                //2、给定一个要添加的新节点
                var newNode = { pId:"0",checkStaffId: value.checkStaffId,checkStaffName:value.checkStaffName};
                //3、把这个新节点添加到当前的节点下，作为它的子节点
                //返回根节点集合
                var nodes = treeObj.getNodesByFilter(function (node) { return node.level == 0 });
                treeObj.addNodes(nodes[0], newNode);
            });
        }
    }

    //list表添加数据
    function addListData(listTable){
        if(listTable.length!=0){
            if(isClicked==true){
                //动态插入数据行
                listTable.forEach(function(value,index,array){
                    var map={
                        checkedObjectId: value.checkStaffId,
                        checkedObjectName: value.checkStaffName,
                        checkedDepartName: value.orgs,
                        checkStaffId: checkStaffId,
                        checkStaffName: checkStaffName,
                        pId:"0",
                        userType:"0",
                        planId:planIdNew

                    };
                    $("#checkedStaffList",$el).datagrid('insertRow',{
                        row: map
                    });
                    qmBindRlnList.push(map);
                });
            }else{
                listTable.forEach(function(value,index,array){
                    var map= {
                        checkedObjectId: value.checkStaffId,
                        checkedObjectName: value.checkStaffName,
                        checkedDepartName: value.orgs,
                        checkStaffId: "",
                        checkStaffName: "",
                        pId:"0",
                        userType:"0",
                        planId:planIdNew
                    };
                    $("#checkedStaffList",$el).datagrid('insertRow',{
                        row: map
                    });
                    qmBindRlnList.push(map);
                });
            }
        }
    }

    //初始化质检员树和被质检员信息
    function initDatas(planBean){
        if(planBean){
            qmBindRlnList = planBean.qmBindRlnList;
            if(qmBindRlnList && qmBindRlnList.length > 0){
                var checkStaffs = [];
                var checkedStaffs = [];
                var checkedDeparts = [];
                $.each(qmBindRlnList, function(index, qmBindRln){
                    qmBindRln.pId = "0";
                    if(qmBindRln.checkStaffId != ""){
                        checkStaffs.push(qmBindRln);
                    }
                    if(qmBindRln.userType == 0 && qmBindRln.checkedObjectId){
                        checkedStaffs.push(qmBindRln);
                    }else{
                        checkedDeparts.push(qmBindRln);
                    }
                });
                initTree(checkStaffs);
                initTable(checkedStaffs,checkedDeparts);
            }else{
                initTree();
                initTable();
            }
        }else{
            initTree();
            initTable();
        }
        initDelBut();
    }
    return initialize;
});
