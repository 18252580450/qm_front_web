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
    var initialize = function(planId) {
        $el = $(tpl);
        if(planId){
            Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_PLAN_DNS + "/" + planId, {}, function (result) {
                var rspCode = result.RSP.RSP_CODE;
                if (rspCode == "1" && result.RSP.DATA.length > 0) {
                    planBean = result.RSP.DATA[0];
                    initSearchForm(planBean);
                }
            });
        }else{
            initSearchForm();//初始化表单数据
        }
        initGlobalEvent();
        this.$el = $el;
    };

    function initGlobalEvent(){
        //重置
        $("#resetBut",$el).on("click", function () {
            $("#mainForm",$el).form('clear');

        });

        //保存
        $("#addPlan",$el).on("click", function () {
            //禁用按钮，防止多次提交
            $('#addPlan',$el).linkbutton({disabled: true});

            var planName = $("#planName",$el).val();
            var planType = $("#planType",$el).combobox('getValue');
            var templateId = $("#templateId",$el).val();
            var pId = $("#pId",$el).val();
            var manOrAuto = $("#manOrAuto",$el).combobox('getValue');
            var planRuntype = $("#planRuntype",$el).combobox('getValue');
            var  planRuntime = $('#planRuntime',$el).timespinner('getValue');
            var planStarttime = $('#planStarttime',$el).datetimebox('getValue');
            var planEndtime = $('#planEndtime',$el).datetimebox('getValue');
            var remark = $('#remark',$el).val();

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
                'remark':remark
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
                planBean.planEndtime = planEndtime
                planBean.remark = remark;
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
                }
            }

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
        var qryCheckTemplate = new QryCheckTemplate();
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
                var qryCheckTemplate = new QryCheckTemplate();

                $('#qry_window').show().window({
                    title: '查询考评策略',
                    width: 1000,
                    height: 550,
                    cache: false,
                    content:qryCheckTemplate.$el,
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
            $("#planName",$el).val(planBean.planName);
            $("#templateId",$el).val(planBean.templateName);
            $("#pId",$el).val(planBean.pId);
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
            $('#remark',$el).val(planBean.remark);
        }
    }

    return initialize;
});
