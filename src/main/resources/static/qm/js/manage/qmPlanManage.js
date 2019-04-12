define([
    "js/manage/qmPlanManageAdd","commonAjax",
    "jquery", 'util', "transfer", "easyui","crossAPI","dateUtil"],
    function (qmPlanManageAdd,CommonAjax,$, Util, Transfer,crossAPI) {
    var userInfo;
    //调用初始化方法
    initialize();
    var planTypes = [];

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initSearchForm();//初始化表单数据
            initGrid();//初始化列表
            initGlobalEvent();//初始化按钮事件
        });
    };

    //批量更新计划  发布和暂停
    function batchUpdate(targetBut){
        var currId = targetBut.currentTarget.id;
        var title = "";
        var msg = "";
        var halfFlag = "";
        if(currId == "batchStart"){
            halfFlag = "1";
            title = "确认发布弹窗";
            msg = "确定发布吗？";
        }else if(currId == "batchStop"){
            halfFlag = "0";
            title = "确认暂停弹窗";
            msg = "确定暂停吗？";
        }
        var selRows = $("#planList").datagrid("getSelections");
        if (selRows.length == 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return false;
        }
        var ids = [];
        for (var i = 0; i < selRows.length; i++) {
            var planId = selRows[i].planId;
            ids.push(planId);
        }
        var params = {
            ids : ids,
            halfFlag : halfFlag
        }
        $.messager.confirm(title, msg, function (confirm) {
            if (confirm) {
                Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/batchUpdate"),JSON.stringify(params), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'slide'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $("#planList").datagrid('reload'); //更新成功后，刷新页面
                    }
                });
            }
        });
    }

    //批量删除计划
    function batchDelete(){
        $("#batchDelete").on("click", function () {
            var selRows = $("#planList").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].planId;
                ids.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.QM_PLAN_DNS).concat("/").concat(ids), {}, function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;
                        if (rspCode == "1") {
                            $("#planList").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });
                }
            });
        });
    }

    function addToolsDom() {
        $(["<td><a href='javascript:void(0)' id='batchStart' class='btn btn-secondary radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>发布</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
        $(["<td><a href='javascript:void(0)' id='batchStop' class='btn btn-secondary radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>暂停</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
        $(["<td><a href='javascript:void(0)' id='batchDelete' class='btn btn-secondary radius  mt-l-20'"+
            " style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>删除</a></td>"].join("")
        ).appendTo($(".datagrid .datagrid-pager > table > tbody > tr"));
    }

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#planList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'planId', title: '计划编码', width: '8%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {
                    field: 'action', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + row.planId + " >编辑</a>";
                            //" | <a href='javascript:void(0);' class='qryDetailBtn' id =" + row.planId + " >详情</a>";
                        return Action;
                    }
                },
                {field: 'planName', title: '计划名称', width: '8%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'planType', title: '计划类型', width: '8%',
                    formatter: function (value, row, index) {
                        var str = "";
                        if(planTypes){
                            $.each(planTypes,function(index, item){
                                if(item.paramsCode == value){
                                    str = item.paramsName;
                                    return;
                                }
                            });
                        }
                        return "<span title='" + str + "'>" + str + "</span>";
                    }
                },
                {field: 'templateName', title: '考评模板', width: '8%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'pName', title: '抽取策略', width: '8%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
                    }},
                {field: 'planCount', title: '抽取数量', width: '8%'},
                {field: 'manOrAuto', title: '任务分派方式', width: '8%',
                    formatter: function (value, row, index) {
                        if (0 == value) {
                            return "<span title='自动分派'>自动分派</span>";
                        } else if (1 == value) {
                            return "<span title='人工分派'>人工分派</span>";
                        }
                    }
                },
                {field: 'planRuntype', title: '执行方式', width: '8%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "<span title='每天自动执行'>每天自动执行</span>";
                        }else if(1 == value){
                            return "<span title='执行一次'>执行一次</span>";
                        }else if(2 == value){
                            return "<span title='手动执行'>手动执行</span>";
                        }
                    }},
                {field: 'planRuntime', title: '执行时间', width: '8%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value,"hh:mm:ss") + "'>" + DateUtil.formatDateTime(value,"hh:mm:ss") + "</span>";
                        }
                    }},
                {field: 'haltFlag', title: '发布状态', width: '5%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "<span title='暂停'>暂停</span>";
                        }else if(1 == value){
                            return "<span title='发布'>发布</span>";
                        }
                    }
                },

                {field: 'planStarttime', title: '计划开始时间', width: '12%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value,"hh:mm:ss") + "'>" + DateUtil.formatDateTime(value,"hh:mm:ss") + "</span>";
                        }
                    }
                },
                {field: 'planEndtime', title: '计划结束时间', width: '12%',
                    formatter: function (value, row, index) {
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value,"hh:mm:ss") + "'>" + DateUtil.formatDateTime(value,"hh:mm:ss") + "</span>";
                        }
                    }},
                {field: 'remark', title: '描述', width: '10%',
                    formatter: function (value) {
                        return "<span title='" + value + "'>" + value + "</span>";
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
                    $("#planList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#planList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var planName = $("#planNameq").val();
                var haltFlag = $("#haltFlagq").combobox('getValue');
                var planType = $("#planTypeq").combobox('getValue');
                var createTimeStart;
                if($("#createTimeStart").datetimebox('getValue')){
                    createTimeStart = $("#createTimeStart").datetimebox('getValue');
                }
                var createTimeEnd;
                if($("#createTimeEnd").datetimebox('getValue')) {
                    createTimeEnd = $("#createTimeEnd").datetimebox('getValue');
                }
                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "planName": planName,
                    "haltFlag": haltFlag,
                    "planType":planType,
                    "createTimeStart": createTimeStart,
                    "createTimeEnd": createTimeEnd
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/selectByParams", params, function (result) {
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
        // addToolsDom();
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm").on("click", "#selectBut", function () {
            $("#page").find("#planList").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "#btn-default", function () {
            $("#searchForm").form('clear');
        });

        //新增
        $("#addBtn").on("click", function(){
            var qmPlanManageAdda = new qmPlanManageAdd();

            $('#add_window').show().window({
                title: '新建计划',
                width: Util.constants.DIALOG_WIDTH,
                height: Util.constants.DIALOG_HEIGHT,
                cache: false,
                content:qmPlanManageAdda.$el,
                modal: true
            });
        });

        //修改
        $("#page").on("click", "a.reviseBtn", function () {
            var planId = $(this).attr('id');
            var qmPlanManageAdda = new qmPlanManageAdd(planId);

            $('#add_window').show().window({
                title: '修改计划',
                width: Util.constants.DIALOG_WIDTH,
                height: Util.constants.DIALOG_HEIGHT,
                cache: false,
                content:qmPlanManageAdda.$el,
                modal: true
            });
        });
        //批量删除
        batchDelete();
        //批量启动
        $("#batchStart").on("click",batchUpdate);
        //批量暂停
        $("#batchStop").on("click",batchUpdate);
    }

    //初始化搜索表单
    function initSearchForm() {
        $('#createTimeStart').datetimebox({
            required: false,
            showSeconds: true,
            panelHeight:'auto',
            onShowPanel:function(){
                $("#createTimeStart").datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onSelect:function(beginDate){
                $('#createTimeEnd').datetimebox().datetimebox('calendar').calendar({
                    validator: function(date){
                        return beginDate <= date;
                    }
                })
            }
        });
        $('#createTimeEnd').datetimebox({
            required: false,
            showSeconds: true,
            onShowPanel:function(){
                 $("#createTimeEnd").datetimebox("spinner").timespinner("setValue","23:59:59");
            }
        });
        $('#haltFlagq').combobox({
            valueField: 'value',
            textField: 'label',
            editable: false,
            data:[
                {
                    label: '全部',
                    value: ''
                },
                {
                    label: '暂停',
                    value: '0'
                },
                {
                    label: '发布',
                    value: '1'
                }
            ]
        });

        CommonAjax.getStaticParams("PLAN_TYPE",function(datas){
            if(datas){
                planTypes = datas;
                planTypes.unshift({paramsCode:"",paramsName:"全部"});
                $('#planTypeq').combobox({
                    data: planTypes,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });
        $('#planTypeq').combobox({
            data: planTypes,
            editable: false
        });
    }

    return {
        initialize: initialize
    };
});
