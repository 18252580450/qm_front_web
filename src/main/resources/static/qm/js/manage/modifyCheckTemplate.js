
require(["jquery", 'util', "transfer", "easyui","ztree-exedit","dateUtil"], function ($, Util, Transfer,dateUtil) {
    var data = [];
    var allChildrenNodes = [];
    var i = 0;
    var templateId=null;
    var templateName=null;
    var createTime = null;
    var templateStatus = null;
    var operateStaffId = "1234";//操作员工
    var crtStaffId = "9527";//创建员工
    //调用初始化方法
    initialize();

    function initialize() {
        //获取templateId传值
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if(url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = decodeURI(str.split("&"));//解码
            var data = strs.split(",")
            for(var i = 0; i < data.length; i++) {
                theRequest[data[i].split("=")[0]] = unescape(data[i].split("=")[1]);
            }
        }
        templateId=theRequest["templateId"];
        templateName=theRequest["templateName"];
        createTime = theRequest["createTime"];
        templateStatus = theRequest["templateStatus"];

        showTree();
        initGrid();
        // initGlobalEvent();
        delEvent();
        saveEvent();
    };
    //zTree的配置信息
    var setting = {
        view : {
            selectedMulti : false//是否支持同时选中多个节点
        },
        data : {
            key: {
                //将treeNode的checkItemName属性当做节点名称
                name: "name"
            },
            simpleData : {
                enable : true,//是否异步
                idKey:"id",//当前节点id属性
                pIdKey:"pId",//当前节点的父节点id属性
                rootPId:0//用于修正根节点父节点数据，即pIdKey指定的属性值
            }
        },
        callback : {
            onClick: function (e, id, node) {//点击事件
                if (node.isParent) {//父节点
                    data = [];
                    allChildrenNodes = [];//清空原数组中的数据
                    allChildrenNodes = getAllChildrenNodes(node,allChildrenNodes);
                    for(var i=0;i<allChildrenNodes.length;i++){
                        var map = {};
                        map['id'] = allChildrenNodes[i].id;
                        map['text'] = allChildrenNodes[i].name;
                        map['type'] = allChildrenNodes[i].type;
                        map['pId'] = allChildrenNodes[i].pId;
                        data.push(map);
                    }
                    $("#page").off("click","#addTemplate");//解决点击多次ztree之后再点击按钮后，被多次调用
                    $("#page").on("click", "#addTemplate", function () {//点击父节点,然后跳出弹出框，右侧新增
                        addWindowEvent(node,true);
                    });

                } else {//点击子节点，右侧直接新增
                    data = [];
                    allChildrenNodes = [];//清空原数组中的数据
                    $("#page").off("click","#addTemplate");
                    $("#page").on("click", "#addTemplate", function () {//点击子节点,然后右侧新增
                        addWindowEvent(node,false);
                    });
                }
            }
        }
    };

    //递归获取该节点下所有的子节点
    function getAllChildrenNodes(node,allChildrenNodes) {
        if(node.isParent){
            var childrenNodes = node.children;
            if(childrenNodes){
                for (var i = 0;i<childrenNodes.length;i++){
                    if(!childrenNodes[i].children){
                        allChildrenNodes.push(childrenNodes[i]);
                    }
                    getAllChildrenNodes(childrenNodes[i],allChildrenNodes);
                }
            }
        }
        return allChildrenNodes;
    }


    function showTree(){
        var zNodes = [];
        var reqParams = {
            "tenantId":Util.constants.TENANT_ID,
        };
        var params = {
            "start": 0,
            "pageNum": 0,
            "params": JSON.stringify(reqParams)
        };

        Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_ITEM_DNS + "/queryCheckItem", params, function (result) {
            var resultNew = result.RSP.DATA;
            for(var i=0;i<resultNew.length;i++){
                var nodeMap =
                    {id: resultNew[i].checkItemId, pId: resultNew[i].parentCheckItemId, name: resultNew[i].checkItemName,type:resultNew[i].checkItemVitalType}
                zNodes.push(nodeMap);
            }
            $.fn.zTree.init($("#tree"), setting, zNodes);
        });
    }

    // function showTree(){
    //     $('#tree').tree({
    //         checkbox: false,
    //         url: '../../data/checkTempTree.json',
    //         method: "GET",
    //         onBeforeExpand:function(node,param){//节点展开前触发，返回 false 则取消展开动作。点开查询数据库中的节点名称
    //             $('#tree').tree('options').url = "/category/getCategorys.java?Id=" + node.id;
    //         },
    //         onClick:function(node){//当用户点击一个节点时触发
    //                 $("#page").on("click", "#addTemplate", function () {//点击树,然后新增
    //                     addWindowEvent(node.text);
    //             });
    //         }
    //     });
    // }

    function addWindowEvent(node,target) {

        if (target) {
            var treeMap = {};//要添加的树的数据
            $("#add_content").find('form.form').form('clear');  //初始化清空

            $("#add_content").show().window({   //弹框
                width: 950,
                height: 400,
                modal: true,
                title: "新增"
            });

            $("#parentName").val(node.name);

            //考评项下拉框
            $("#name").combobox({
                method: "GET",
                valueField: 'id',
                textField: 'text',
                panelHeight: 'auto',
                editable: false,
                data: data,
                onSelect: function (record) {//下拉框选中时触发
                    //获取下拉中的数据
                    treeMap["id"] = record.id;
                    treeMap["text"] = record.text;
                    treeMap["type"] = record.type;
                    treeMap["pId"] = record.pId;
                }
            });

            $("#add_content").unbind("click");
            /*
             * 清除表单信息
             */
            $("#add_content").on("click", "#cancel", function () {
                $("#add_content").find('form.form').form('clear');
                $("#add_content").window("close");
            });

            $("#add_content").on("click", "#global", function () {
                //禁用按钮，防止多次提交
                $('#global').linkbutton({disabled: true});

                //动态插入数据行
                $('#peopleManage').datagrid('insertRow', {
                    index: i,  // 索引从0开始
                    row: {
                        checkItemName: treeMap.text,
                        nodeId: treeMap.id,
                        pNodeId:treeMap.pId,
                        errorType: treeMap.type,
                        nodeScore: '0',
                        maxScore: '0',
                        flag:'0'//新增
                    }
                });
                i++;
                $('#add_content').window('close'); // 关闭窗口
                $("#global").linkbutton({disabled: false}); //按钮可用
            });
        }else{
            var checkItemVitalType = null;
            for (var index in data ){//根据下拉框考评项名称定位到该考评项的类型
                if (data[index].text == node.name) {
                    checkItemVitalType = data[index].type;
                }
            }
            //动态插入数据行
            $('#peopleManage').datagrid('insertRow',{
                index:i ,  // 索引从0开始
                row: {
                    checkItemName: node.name,
                    nodeId: node.id,
                    pNodeId: node.pId,
                    errorType: checkItemVitalType,
                    nodeScore: '0',
                    maxScore: '0',
                    flag:'0'//新增
                }
            });
            i++;
        }
    }

    //删除操作
    function delEvent() {
        $("#page").on("click", "a.delBtn", function () {

            //先查询数据库中有没有该条数据，有的话就删除数据库中的，没有的话则删除页面上的
            var rowData = $(this).attr('id');
            var sensjson = JSON.parse(rowData); //转成json格式
            var index = sensjson.index;
            var map = {
                "templateId":sensjson.templateId,
                "nodeId":sensjson.nodeId,
                "nodeType":sensjson.nodeType,
                "reserve1":operateStaffId
            };
            var param =  {"params":JSON.stringify(map)};
            Util.ajax.getJson(Util.constants.CONTEXT.concat(Util.constants.ADD_CHECK_TEMPLATE).concat("/selectByPrimaryKey"),param, function (result) {
                if (result.RSP.RSP_CODE == "1") {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat( Util.constants.ADD_CHECK_TEMPLATE).concat("/deleteByPrimaryKey/"), JSON.stringify(map), function (result) {
                        if (result.RSP.RSP_CODE == "1") {
                            $('#peopleManage').datagrid('deleteRow', index);
                        }
                    });
                }else{
                    $('#peopleManage').datagrid('deleteRow', index);
                    var rows = $('#peopleManage').datagrid("getRows");    //重新获取数据生成行号
                    $('#peopleManage').datagrid("loadData", rows);
                }
            });

        });
    }

    //保存操作。将表中的数据保存到数据库中（更新）
    function saveEvent(){
        $("#page").on("click", "#saveBut", function () {
            $('#templateName').validatebox({required:true});//非空校验
            $('#templateDesc').validatebox({required:true});//非空校验
            if($("#templateName").val()==""||$("#templateDesc").val()==""){
                $.messager.alert('警告', '必填项不可为空!');
                return false;
            }
            //将表中数据保存到详情信息表中
            //获取datagrid中的所有数据，将其拼接成json格式字符串数组
            var rowsData = $('#peopleManage').datagrid('getRows');
            var json = [];//更新数据
            var jsonInsert = [];//需要插入的数据
            var maxAll = [];//扣分范围
            var nAll = [];//所占分值
            var loc;//更新
            var locInsert;//插入
            //随机生成数字
            var num = Math.random()*15000 + 800;
            num = parseInt(num, 10);
            $.each(rowsData, function (i)
            {
                var maxScore =  parseInt(rowsData[i].maxScore);
                var nodeScore = parseInt(rowsData[i].nodeScore);
                if(nodeScore<maxScore){
                    return false;
                }
                maxAll.push(maxScore);
                nAll.push(nodeScore);
                if(rowsData[i].flag=='0'){//区分是新增操作还是更新操作
                    locInsert = {
                        "tenantId":Util.constants.TENANT_ID,
                        "templateId":templateId,
                        "nodeId":rowsData[i].nodeId,
                        "nodeName": rowsData[i].checkItemName,
                        "maxScore": maxScore,
                        "nodeScore": nodeScore,
                        "errorType": rowsData[i].errorType,
                        "nodeType": '3',
                        "pNodeId":rowsData[i].pNodeId,
                        "createStaffId":crtStaffId//创建工号
                    };
                    jsonInsert.push(locInsert);
                }else{//更新
                    loc = {
                        "templateId":templateId,
                        "nodeId":rowsData[i].nodeId,
                        "maxScore": maxScore,
                        "nodeScore": nodeScore,
                        "reserve1":operateStaffId//操作工号
                    };
                    json.push(loc);
                }
            });
            if(maxAll.length!=rowsData.length||nAll.length!=rowsData.length){
                $.messager.alert("提示", "扣分范围不能高于所占分值！");
                return false;
            }
            //判断分值总和是否为100
            var maxAllScore = null;
            maxAll.forEach(function(i,index){
                maxAllScore = maxAllScore+i;
            });
            var nAllScore = null;
            nAll.forEach(function(i,index){
                nAllScore = nAllScore+i;
            });
            if(nAll.indexOf(0)!=-1){
                $.messager.alert("提示", "点击行填写分数,然后请点击行保存操作并且每行所占分值不可为0!");
                return false;
            }
            if(nAllScore!=100||maxAllScore>100){
                $.messager.alert("提示", "所占分值总和必须为100以及扣分范围总和不得高于100!");
                return false;
            }

            //更新
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ADD_CHECK_TEMPLATE).concat("/update"),JSON.stringify(json), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $('#add_content').window('close'); // 关闭窗口
                    $("#peopleManage").datagrid('reload'); //插入成功后，刷新页面
                }
            });

            //插入
            if(jsonInsert.length!=0){
                var param =  {"params":jsonInsert};
                Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.ADD_CHECK_TEMPLATE).concat("/insertTempDetail"),JSON.stringify(param), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $('#add_content').window('close'); // 关闭窗口
                        $("#peopleManage").datagrid('reload'); //插入成功后，刷新页面
                    }
                });
            }

            //将修改的基本信息更新到基本信息表中
            var templateName = $("#templateName").val();
            var templatChannel = $("#templatChannel").combobox("getValue");//模板渠道
            var templateType = $("#templateType").combobox("getValue");
            var templateStatus = $("#templateStatus").combobox("getValue");
            var templateDesc = $("#templateDesc").val();

            var map = {'templateName': templateName,'templateStatus': templateStatus,
                'operateType': '1','remark':templateDesc,
                'templateType':templateType,"templateId":templateId,"operateStaffId":operateStaffId};
            var params = [];
            params.push(map);
            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_TEMPLATE).concat("/updateTemplate"), JSON.stringify(params), function (result) {
                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1") {
                    $("#checkTemplateManage").datagrid('reload'); //修改成功后，刷新页面
                }
            });
            setTimeout(function () {
                //插入成功后，刷新页面
                var url = "http://127.0.0.1:8080/qm/html/manage/checkTemplate.html";
                var jq = top.jQuery;
                jq('#tabs').tabs('select', '考评模板');
                var tab = jq('#tabs').tabs('getSelected');
                jq('#tabs').tabs('update', {
                    tab : tab,
                    options : {
                        content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                    }
                });
                top.jQuery('#tabs').tabs('close', "修改考评模板");
            },2000);
        });
    }

    //初始化列表
    function initGrid() {

        //模板名称输入框塞入传递过来的值
        $("#templateName").val(templateName);

        //模板渠道下拉框
        $("#templatChannel").combobox({
            url: '../../data/checkTemp_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示第一个数据
                var templatChannel = $("#templatChannel");
                var data = templatChannel.combobox('getData');
                if (data.length > 0) {
                    templatChannel.combobox('select', data[0].codeValue);
                }
            }
        });

        //模板类型下拉框
        $("#templateType").combobox({
            url: '../../data/tempDetail_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示第一个数据
                var templatChannel = $("#templateType");
                var data = templatChannel.combobox('getData');
                if (data.length > 0) {
                    templatChannel.combobox('select', data[0].codeValue);
                }
            }
        });

        //模板状态下拉框
        $("#templateStatus").combobox({
            url: '../../data/checkStatus.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示最后一个数据
                var status = $("#templateStatus");
                status.combobox('select', templateStatus);
            }
        });

        $("#page").find("#peopleManage").datagrid({
            columns: [[
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        var bean = {//根据参数进行定位修改
                            "templateId":row.templateId,
                            "nodeId":row.nodeId,
                            "nodeType":"3",
                            "index":index,
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串
                        var action = "<a href='javascript:void(0);' class='delBtn' id =" + beanStr + " >删除</a>";
                        var action2 = "<a href='javascript:void(0);' class='saveBtn' id =" + beanStr + " >保存</a>";
                        return action+"&nbsp;&nbsp;"+action2;
                    }
                },
                {field: 'checkItemName', title: '考评项名称', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'templateId', title: '考评模板编码', width: '20%', hidden: true},
                {field: 'pNodeId', title: '父节点编码', width: '20%', hidden: true},
                {field: 'nodeId', title: '考评项编码', width: '20%', hidden: true},
                {field: 'errorType', title: '考评项类别', width: '20%',
                    formatter: function (value, row, index) {
                        return {'0':'非致命性','1':'致命性'}[value];
                    }},
                {field: 'nodeScore', title: '所占分值', width: '15%', editor:'numberbox'},
                {field: 'maxScore', title: '扣分范围', width: '15%', editor:'numberbox'},
                {field: 'flag', title: '新增(0)标识', width: '15%', hidden: true}
            ]],
            fitColumns: true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: true,
            selectOnCheck: true,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "templateId":templateId
                };
                var param = {
                    "start": start,
                    "pageNum": pageNum,
                    "params":JSON.stringify(reqParams)
                };

                Util.ajax.getJson(Util.constants.CONTEXT +  Util.constants.ADD_CHECK_TEMPLATE + "/selectByParams", param, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    var dataNew=[];
                    for(var i=0;i<data.rows.length;i++){
                        var map=data.rows[i];
                        if(map.checkItem!=null){
                            map["checkItemName"]=map.checkItem.checkItemName;
                            map["errorType"]=map.checkItem.checkItemVitalType;
                            dataNew.push(map);
                        }
                    }
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != "1") {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                    }
                    success(dataNew);
                });
            }
        });

        var tempIndex = null;
        $("#peopleManage").datagrid({//行点击事件
            onClickRow: function (index, row) {
                tempIndex = index;
                $("#peopleManage").datagrid('beginEdit', index);//编辑行
            }
        });

        $("#page").on("click", "a.saveBtn", function () {
            $('#peopleManage').datagrid('endEdit', tempIndex);//保存行
        });


    }

    // //初始化事件
    // function initGlobalEvent() {
    //     //查询
    //     $("#searchForm").on("click", "#selectBut", function () {
    //         $("#page").find("#checkTemplateManage").datagrid("load");
    //     });
    //
    // }

    return {
        initialize: initialize
    };
});
