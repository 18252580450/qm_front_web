
require(["jquery", 'util', "transfer", "easyui","dateUtil"], function ($, Util, Transfer,dateUtil) {
    //调用初始化方法
    initialize();

    function initialize() {
        initGrid();
        initGlobalEvent();
        addWindowEvent();
        modifyWindowEvent();
        initReviseEvent();
        copyEvent();
    };

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

        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#checkTemplateManage").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'templateId', title: '考评模板编码', width: '20%', hidden: true},
                {
                    field: 'action', title: '操作', width: '20%',
                    formatter: function (value, row, index) {
                        var bean = {
                            'tenantId': row.tenantId,
                            'templateId': row.templateId,
                            'templateName': row.templateName,
                            'templateStatus': row.templateStatus,
                            'createTime':row.createTime,
                            'remark':row.remark
                        };
                        var beanRr = JSON.parse(JSON.stringify(bean)); beanRr['status']='release';//深拷贝
                        var beanSt = JSON.parse(JSON.stringify(bean)); beanSt['status']='stop';

                        var action1 = "<a href='javascript:void(0);' class='previewBtn' id =" + JSON.stringify(bean) + " >预览</a>";
                        var action2="<a href='javascript:void(0);' class='actionBtn' id =" + JSON.stringify(beanRr) + " >发布</a>";
                        var action3="<a href='javascript:void(0);' class='actionBtn' id =" + JSON.stringify(beanSt) + " >暂停</a>";
                        return action2+"&nbsp;&nbsp;"+action3;
                      }
                },
                {field: 'templateName', title: '模板名称', width: '20%',
                    formatter: function (value) {//鼠标悬浮显示全部内容
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'tenantId', title: '渠道名称', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'templateStatus', title: '模板状态', width: '15%',
                    formatter:function(value,row,index){
                        return {'0':'未发布','1':'发布','2':'暂停','3':'删除'}[value];
                    }},
                {field: 'remark', title: '备注', width: '20%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'createTime', title: '创建时间', width: '20%',
                    formatter:function(value,row,index){
                        return DateUtil.formatDateTime(value);
                }}
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
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#checkTemplateManage").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#checkTemplateManage").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var templateName = $("#templateName").val();
                var tenantId = $("#templatChannel").combobox("getValue");
                var templateStatus = $("#templateStatus").combobox("getValue");
                if(templateStatus == '4'){
                    templateStatus = null;
                }
                var reqParams = {
                    "tenantId":tenantId,
                    "templateName": templateName,
                    "templateStatus": templateStatus,
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.CHECK_TEMPLATE + "/selectByParams", params, function (result) {
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
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#checkTemplateManage").datagrid("load");
        });

        //绑定删除按钮事件。只有暂停或未发布的考评模板允许删除，已发布的考评模板不允许被删除
        //注意：删除时，应根据templateId(考评模板编码)同时删除t_qm_templatedetail和t_qm_checktemplate表中的数据，并在t_qm_tpl_op_log表中记录操作
        $("#page").delegate("#delBut", "click", function () {

            var selRows = $("#checkTemplateManage").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            for(var i=0;i<selRows.length;i++){
                if(selRows[i].templateStatus=="1"){
                    $.messager.alert("提示", "已发布的考评模板不允许被删除!");
                    return false;
                }
            }


            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].templateId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_TEMPLATE).concat("/deleteByIds/").concat(ids), {}, function (result) {
                        var rspCode = result.RSP.RSP_CODE;
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 2000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });

                        if (rspCode == "1") {
                            $("#checkTemplateManage").datagrid('reload'); //删除成功后，刷新页面
                        }

                        if(rspCode!="2"){
                            // 根据templateId删除t_qm_templatedetail对应的数据
                            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ADD_CHECK_TEMPLATE).concat("/deleteByIds/").concat(ids), {}, function (result) {

                                $.messager.show({
                                    msg: result.RSP.RSP_DESC,
                                    timeout: 1000,
                                    style: {right: '', bottom: ''},     //居中显示
                                    showType: 'slide'
                                });
                            })

                            //将操作信息保存到考评模板操作日志表中
                            var params = {'operateType': '2',"templateId":JSON.stringify(ids)};
                            Util.ajax.postJson(Util.constants.CONTEXT+ Util.constants.TPL_OP_LOG + "/insertTplOpLog ", JSON.stringify(params), function (result) {
                            });
                        }
                    });
                }
            });
        });
    }

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;//顶层的window对象.取得整个父页面对象
        //重写jndex.js中的方法
        if (!jq('#tabs').tabs('exists', title)) {
            jq('#tabs').tabs('add', {
                title: title,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: true
            });
        } else {
            jq('#tabs').tabs('select', title);
        }
    }

    function addWindowEvent() {
        $("#page").on("click", "#addBut", function(){
            addTabs('新增考评模板', "http://127.0.0.1:8080/qm/html/manage/addCheckTemplate.html");
        });
    }

    function modifyWindowEvent() {
        $("#page").on("click", "#modfBut", function(){
            var selRows = $("#checkTemplateManage").datagrid("getSelections");//选中多行
            if (selRows.length == 0||selRows.length>1) {
                $.messager.alert("提示", "请只选择一行数据!");
                return false;
            }
            //页面传值
            var templateId = selRows[0].templateId;
            var templateName = selRows[0].templateName;
            var createTime = selRows[0].createTime;
            var jq = top.jQuery;
            //编码，解决中文乱码问题
            var url = encodeURI("http://127.0.0.1:8080/qm/html/manage/modifyCheckTemplate.html?templateId="+templateId+"&templateName="+templateName+"&createTime="+createTime);
            if (!jq('#tabs').tabs('exists', '修改考评模板')) {
                jq('#tabs').tabs('add', {
                    title: '修改考评模板',
                    content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                    closable: true
                });
            }else {//刷新tab页
                jq('#tabs').tabs('select', '修改考评模板');
                var tab = jq('#tabs').tabs('getSelected');
                jq('#tabs').tabs('update', {
                    tab : tab,
                    options : {
                        content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                    }
                });
            }
        });
    }

    //修改模板状态
    function initReviseEvent() {
        $("#page").on("click", "a.actionBtn", function () {
            var params=[];
            var rowData = $(this).attr('id'); //获取a标签中传递的值
            var sensjson = JSON.parse(rowData); //转成json格式
            var status = sensjson.status;
            var templateStatus = {'release':'1','stop':'2'}[status];
            sensjson.templateStatus=templateStatus;
            params.push(sensjson);
            $.messager.confirm('确认', '确定更改模板状态吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_TEMPLATE).concat("/action"), JSON.stringify(params), function (result) {

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
                    })
                }
        });
      });
    }

    /**
     * 复制考评模板，将复制后的信息插入到模板表中，并且将与其绑定的考评项插入到考评模板详细信息表中
     */
    function copyEvent() {
        $("#page").on("click", "#copyBut", function () {
                var selRows = $("#checkTemplateManage").datagrid("getSelections");//选中一行
                if (selRows.length == 0||selRows.length>1) {
                    $.messager.alert("提示", "请选择一行且只能选择一行数据!");
                    return false;
                }
                if((selRows[0].templateName).indexOf("复制")!= -1){
                    $.messager.alert("提示", "复制的考评模板不可再次复制!");
                    return false;
                }

                selRows[0].templateStatus = "0";//未发布
                Util.ajax.postJson(Util.constants.CONTEXT+ Util.constants.CHECK_TEMPLATE + "/copyTemplate", JSON.stringify(selRows[0]), function (result) {
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
                //enable按钮
                $("#global").linkbutton({disabled: false}); //按钮可用
            });
    }

    return {
        initialize: initialize
    };
});
