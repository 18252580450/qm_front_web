
require(["jquery", 'util', "transfer", "easyui","ztree-exedit","dateUtil"], function ($, Util, Transfer,dateUtil) {
    var qmURI = "/qm/configservice/addCheckTemplate";//详情表
    var qmURI2 = "/qm/configservice/checkTemplate";//基本信息表
    var qmURI3 = "/qm/configservice/tplOpLog/";//操作表
    var data = [];
    var i = 0;
    //调用初始化方法
    initialize();

    function initialize() {
        showTree();
        initGrid();
        initGlobalEvent();
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
                    $("#page").off("click","#addTemplate");//解决点击多次ztree之后再点击按钮后，被多次调用
                    $("#page").on("click", "#addTemplate", function () {//点击父节点,然后跳出弹出框，右侧新增
                        addWindowEvent(node,true);
                    });

                } else {//点击子节点，右侧直接新增
                    $("#page").off("click","#addTemplate");
                    $("#page").on("click", "#addTemplate", function () {//点击子节点,然后右侧新增
                        addWindowEvent(node,false);
                    });
                }
            }
        }
    };

    function showTree(){
        var zNodes = [];
        var reqParams = {
            "tenantId":Util.constants.TENANT_ID,
        };
        var params = {
            "params": JSON.stringify(reqParams)
        };

        Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/queryCheckItem", params, function (result) {

            for(var i=0;i<result.length;i++){
                var nodeMap =
                    {id: result[i].checkItemId, pId: result[i].parentCheckItemId, name: result[i].checkItemName}
                zNodes.push(nodeMap);

                var map = {};
                map['id'] = result[i].checkItemId;
                map['text'] = result[i].checkItemName;
                map['type'] = result[i].checkItemVitalType;
                map['pId'] = result[i].parentCheckItemId;
                data.push(map);
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
                        nodeName: treeMap.text,
                        nodeId: treeMap.id,
                        pNodeId:treeMap.pId,
                        errorType: treeMap.type,
                        nodeScore: '0',
                        maxScore: '0'
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
                    nodeName: node.name,
                    nodeId: node.id,
                    pNodeId: node.pId,
                    errorType: checkItemVitalType,
                    nodeScore: '0',
                    maxScore: '0'
                }
            });
            i++;
        }
    }

    //删除操作。点击删除，删除树子节点和表中对应的行数据
    function delEvent() {
        $("#page").on("click", "a.delBtn", function () {
            //删除表中对应行
            var row = $('#peopleManage').datagrid('getSelected');
            var rowIndex = $('#peopleManage').datagrid('getRowIndex', row);
            $('#peopleManage').datagrid('deleteRow', rowIndex);

            //删除表中的数据
            var ids = [];
            var id= row.templateId
            ids.push(id);

            Util.ajax.putJson(Util.constants.CONTEXT.concat(qmURI).concat("/deleteByIds/").concat(ids), {}, function (result) {

                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });

                var rspCode = result.RSP.RSP_CODE;

                if (rspCode == "1") {
                    $("#peopleManage").datagrid('reload'); //修改成功后，刷新页面
                }

            })
        });
    }

    //保存操作。将表中的数据保存到数据库中
    function saveEvent(){
        $("#page").on("click", "#saveBut", function () {
            //将表中数据保存到详情信息表中
            //获取datagrid中的所有数据，将其拼接成json格式字符串数组
            var rowsData = $('#peopleManage').datagrid('getRows');
            var json = [];
            var maxAll = [];//所占分值
            var nAll = [];//扣分范围
            var loc;
            $.each(rowsData, function (i)
            {
                var maxScore =  parseInt(rowsData[i].maxScore);
                maxAll.push(maxScore);
                var nodeScore = parseInt(rowsData[i].nodeScore);
                nAll.push(nodeScore);
                loc = {
                    "tenantId":Util.constants.TENANT_ID,
                    "templateId":i.toString(),
                    "nodeId":rowsData[i].nodeId,
                    "nodeName": rowsData[i].nodeName,
                    "maxScore": maxScore,
                    "nodeScore": nodeScore,
                    "errorType": rowsData[i].errorType,
                    "nodeType": '3',
                    "pNodeId":rowsData[i].pNodeId
                };
                json.push(loc);
            });

            //判断分值总和是否为100
            var maxAllScore = null;
            maxAll.forEach(function(i,index){
                maxAllScore = maxAllScore+i;
            });
            var nAllScore = null;
            nAll.forEach(function(i,index){
                nAllScore = nAllScore+i;
            });
            if(maxAllScore!=100||nAllScore!=100){
                $.messager.alert("提示", "所占分值总和以及扣分范围总和必须为100!");
                return false;
            }

            var param =  {"params":json};
            Util.ajax.postJson(Util.constants.CONTEXT.concat(qmURI).concat("/insertTempDetail"),JSON.stringify(param), function (result) {

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

            //将基本信息保存到基本信息表中
            var templateName = $("#templateName").val();
            var templatChannel = $("#templatChannel").combobox("getValue");//模板渠道
            var templateType = $("#templateType").combobox("getValue");
            var templateStatus = $("#templateStatus").combobox("getValue");
            var templateDesc = $("#templateDesc").val();

            var params = {'tenantId': Util.constants.TENANT_ID,'templateName': templateName,
                'templateStatus': templateStatus, 'operateType': '0','remark':templateDesc,'templateType':templateType,"templateId":i.toString()};
            Util.ajax.postJson(Util.constants.CONTEXT+ qmURI2 + "/insertCheckTemplate ", JSON.stringify(params), function (result) {

                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });

                var rspCode = result.RSP.RSP_CODE;

                if (rspCode == "1") {
                    $("#checkTemplateManage").datagrid('reload'); //插入成功后，刷新页面
                }
            });

            //将操作信息保存到考评模板操作日志表中
            var params = {'operateType': '1',"templateId":i.toString()};
            Util.ajax.postJson(Util.constants.CONTEXT+ qmURI3 + "/insertTplOpLog ", JSON.stringify(params), function (result) {

                $.messager.show({
                    msg: result.RSP.RSP_DESC,
                    timeout: 1000,
                    style: {right: '', bottom: ''},     //居中显示
                    showType: 'slide'
                });
            });
        });
    }

    //初始化列表
    function initGrid() {

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
            url: '../../data/checkStatus_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){//当数据加载成功时，默认显示最后一个数据
                var templateStatus = $("#templateStatus");
                var data = templateStatus.combobox('getData');
                if (data.length > 0) {
                    templateStatus.combobox('select', data[4].codeValue);
                }
            }
        });

        $("#page").find("#peopleManage").datagrid({
            columns: [[
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        var bean = {//根据参数进行定位修改
                            'templateId': row.templateId
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串
                        var action = "<a href='javascript:void(0);' class='delBtn' id =" + beanStr + " >删除</a>";
                        var action2 = "<a href='javascript:void(0);' class='saveBtn' id =" + beanStr + " >保存</a>";
                        return action+"&nbsp;&nbsp;"+action2;
                    }
                },
                {field: 'nodeName', title: '考评项名称', width: '20%'},
                {field: 'templateId', title: '考评模板编码', width: '20%', hidden: true},
                {field: 'pNodeId', title: '父节点编码', width: '20%', hidden: true},
                {field: 'nodeId', title: '考评项编码', width: '20%', hidden: true},
                {field: 'errorType', title: '考评项类别', width: '20%',
                    formatter: function (value, row, index) {
                        return {'0':'非致命性','1':'致命性'}[value];
                    }},
                {field: 'nodeScore', title: '所占分值', width: '15%', editor:'numberbox'},
                {field: 'maxScore', title: '扣分范围', width: '15%', editor:'numberbox'}
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
                    "tenantId":Util.constants.TENANT_ID
                };
                var param = {
                    "start": start,
                    "pageNum": pageNum,
                    "params":JSON.stringify(reqParams)
                };

                Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/selectByParams", param, function (result) {
                    var data = Transfer.DataGrid.transfer(result);

                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != "1") {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                    }
                    success(data);
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

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#checkTemplateManage").datagrid("load");
        });

    }

    return {
        initialize: initialize
    };
});
