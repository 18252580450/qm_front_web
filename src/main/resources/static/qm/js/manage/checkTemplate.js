define(["js/manage/addCheckTemplate","js/manage/modifyCheckTemplate","jquery", 'util', "transfer", "easyui","dateUtil"], function (AddCheckTemplate,ModifyCheckTemplate,$, Util, Transfer,dateUtil) {
    var userInfo;
    //调用初始化方法
    initialize();
    var operStaffId = "";
    var crtStaffId="";

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            operStaffId = userInfo.staffId;
            crtStaffId = userInfo.staffId;
            initGrid();
            initGlobalEvent();
            initReviseEvent();
            copyEvent();
        });
    };

    //初始化列表
    function initGrid() {

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
                    templateStatus.combobox('select', data[0].codeValue);
                }
            }
        });

        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#checkTemplateManage").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'templateId', title: '考评模板编码', width: '20%', hidden: true},
                {
                    field: 'action', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var bean = {
                            'templateId': row.templateId,
                            'templateName': row.templateName,
                            'templateStatus': row.templateStatus,
                            'createTime':row.createTime,
                            'remark':row.remark
                        };
                        var beanRr = JSON.parse(JSON.stringify(bean)); beanRr['status']='release';//深拷贝
                        var beanSt = JSON.parse(JSON.stringify(bean)); beanSt['status']='stop';

                        var action2 = "<a href='javascript:void(0);' class='actionBtn list_operation_color' id =" + JSON.stringify(beanRr) + " >发布</a>";
                        var action3 = "<a href='javascript:void(0);' class='actionBtn list_operation_color' id =" + JSON.stringify(beanSt) + " >暂停</a>";
                        return action2+"&nbsp;&nbsp;"+action3;
                    }
                },
                {field: 'templateName', title: '模板名称', width: '20%',
                    formatter: function (value) {//鼠标悬浮显示全部内容
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                }},
                {field: 'templateStatus', title: '模板状态', width: '15%',
                    formatter:function(value,row,index){
                        return {'0':'未发布','1':'发布','2':'暂停','3':'删除'}[value];
                    }},
                {
                    field: 'templateType', title: '模板类型', width: '15%',
                    formatter: function (value, row, index) {
                        return {'0': '录音考评模板', '1': '工单考评模板'}[value];
                        // return {'0': '录音考评模板', '1': '工单考评模板', '2': '互联网考评模板'}[value];
                    }
                },
                {field: 'remark', title: '备注', width: '20%',
                    formatter: function (value) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                }},
                {field: 'createTime', title: '创建时间', width: '20%',
                    formatter:function(value,row,index){
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                        }
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
                var templateStatus = $("#templateStatus").combobox("getValue");
                if (templateStatus == '-1') {
                    templateStatus = "";
                }
                var reqParams = {
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

        //重置
        $("#searchForm").on("click", "#clearBut", function () {
            $("#page input").val("");
        });

        //新建
        $("#addBut").on("click", function(){
            var addCheckTemplate = new AddCheckTemplate();
            $('#add_window').show().window({
                title: '新建模版',
                width: Util.constants.DIALOG_WIDTH,
                height: Util.constants.DIALOG_HEIGHT,
                cache: false,
                content:addCheckTemplate.$el,
                modal: true
            });
        });

        //修改模版
        $("#modfBut").on("click", function(){
            var selRows = $("#checkTemplateManage").datagrid("getSelections");
            if (selRows.length == 0||selRows.length>1) {
                $.messager.alert("提示", "请只选择一行数据!");
                return false;
            }
            if (selRows[0].templateStatus == "1") {//模版状态是发布状态不可进行修改操作
                $.messager.alert("提示", "模版发布状态不可进行修改操作!");
                return false;
            }
            var modifyCheckTemplate = new ModifyCheckTemplate(selRows);
            $('#modif_window').show().window({
                title: '修改模版',
                width: Util.constants.DIALOG_WIDTH,
                height: Util.constants.DIALOG_HEIGHT,
                cache: false,
                content:modifyCheckTemplate.$el,
                modal: true
            });
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
                var map = {};
                map["templateId"]=selRows[i].templateId;
                map["operateId"]=operStaffId;
                ids.push(map);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.CHECK_TEMPLATE).concat("/deleteByIds"), JSON.stringify(ids), function (result) {
                        var rspCode = result.RSP.RSP_CODE;
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 2000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });

                        if (rspCode == "1") {
                            // 根据templateId删除t_qm_templatedetail对应的数据
                            Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.ADD_CHECK_TEMPLATE).concat("/deleteByIds"),JSON.stringify(ids), function (result) {
                            });
                            $("#checkTemplateManage").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });
                }
            });
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
            sensjson.operateStaffId = operStaffId;//操作工号
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
            selRows[0].createStaffId = crtStaffId;//创建工号
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
