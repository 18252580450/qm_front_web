define([
        "text!html/manage/qryQmPlan.tpl","jquery", 'util', "commonAjax","transfer", "easyui","crossAPI","dateUtil"],
    function (qryQmPlanTpl,$, Util, CommonAjax,Transfer,easyui,crossAPI,dateUtil) {

    var planTypes = [];
    var $el;
    function initialize() {
        $el = $(qryQmPlanTpl);
        initSearchForm();
        initGrid();//初始化列表
        initGlobalEvent();//初始化按钮事件
        this.$el = $el;
    };

    //初始化列表
    function initGrid() {
        $("#planList",$el).datagrid({
            columns: [[
                {field: 'planId', title: '计划编码', hidden: true},
                {field: 'planName', title: '计划名称', width: '8%'},
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
                        return str;
                    }
                },
                {field: 'templateName', title: '考评模板', width: '8%'},
                {field: 'pName', title: '抽取策略', width: '8%'},
                {field: 'manOrAuto', title: '任务分派方式', width: '8%',
                    formatter: function (value, row, index) {
                        if (0 == value) {
                            return "自动分派";
                        } else if (1 == value) {
                            return "人工分派";
                        }
                    }
                },
                {field: 'planRuntype', title: '执行方式', width: '8%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "每天自动执行";
                        }else if(1 == value){
                            return "执行一次";
                        }else if(2 == value){
                            return  "手动执行";
                        }
                    }},
                {field: 'planRuntime', title: '执行时间', width: '8%',
                    formatter: function (value, row, index) {
                        if(value){
                            return DateUtil.formatDateTime(value,"hh:mm:ss");
                        }
                    }},
                {field: 'haltFlag', title: '发布状态', width: '5%',
                    formatter: function (value, row, index) {
                        if(0 == value){
                            return "暂停";
                        }else if(1 == value){
                            return "发布";
                        }
                    }
                },

                {field: 'planStarttime', title: '计划开始时间', width: '12%',
                    formatter: function (value, row, index) {
                        if(value){
                            return DateUtil.formatDateTime(value);
                        }
                    }
                },
                {field: 'planEndtime', title: '计划结束时间', width: '12%',
                    formatter: function (value, row, index) {
                        if(value){
                            return DateUtil.formatDateTime(value);
                        }
                    }},
                {field: 'remark', title: '描述', width: '10%'}
            ]],
            fitColumns: true,
            width: '100%',
            height: 300,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: true,
            singleSelect: false,
            autoRowHeight: true,
            onDblClickRow:function(rowIndex, rowData){
                $('#planName').searchbox("setValue",rowData.planName);
                $('#planId').val(rowData.planId);
                $("#qry_window").window("close");
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var planName = $("#planNameq",$el).val();
                var haltFlag = $("#haltFlagq",$el).combobox('getValue');
                var planType = $("#planTypeq",$el).combobox('getValue');
                var createTimeStart;
                if($("#createTimeStart",$el).datetimebox('getValue')){
                    createTimeStart = $("#createTimeStart",$el).datetimebox('getValue');
                }
                var createTimeEnd;
                if($("#createTimeEnd",$el).datetimebox('getValue')) {
                    createTimeEnd = $("#createTimeEnd",$el).datetimebox('getValue');
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
                }, Util.PageUtil.getParams($("#searchForm",$el)));

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
    }

    //初始化事件
    function initGlobalEvent() {
        //查询
        $("#searchForm",$el).on("click", "#selectBut", function () {
            $("#page",$el).find("#planList",$el).datagrid("load");
        });
        //重置
        $("#searchForm",$el).on("click", "#clear", function () {
            $("#searchForm",$el).form('clear');
        });
        $("#page",$el).on("click", "#close", function () {
            $("#searchForm",$el).form('clear');
            $("#qry_window").window("close");
        });
    }

    //初始化搜索表单
    function initSearchForm() {
        $('#createTimeStart',$el).datetimebox({
            required: false,
            showSeconds: true,
            panelHeight:'auto',
            onShowPanel:function(){
                $("#createTimeStart",$el).datetimebox("spinner").timespinner("setValue","00:00:00");
            },
            onSelect:function(beginDate){
                $('#createTimeEnd',$el).datetimebox().datetimebox('calendar').calendar({
                    validator: function(date){
                        return beginDate <= date;
                    }
                })
            }
        });
        $('#createTimeEnd',$el).datetimebox({
            required: false,
            showSeconds: true,
            onShowPanel:function(){
                $("#createTimeEnd",$el).datetimebox("spinner").timespinner("setValue","23:59:59");
            }
        });
        $('#haltFlagq',$el).combobox({
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
                $('#planTypeq',$el).combobox({
                    data: planTypes,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }
        });

        $('#planTypeq',$el).combobox({
            data: planTypes,
            editable: false
        });
    }

    return initialize;
});
