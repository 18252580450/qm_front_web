require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {

    var qmURI = "/qm/configservice/appealProcess";
    //初始化方法
    initialize();

    function initialize() {
        initPageInfo();
        initEvent();
    }

    //页面信息初始化
    function initPageInfo() {
        //模板渠道下拉框
        $("#tenantType").combobox({
            url: '../../data/tenant_type.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var tenantType = $("#tenantType");
                var data = tenantType.combobox('getData');
                if (data.length > 0) {
                    tenantType.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
            }
        });

        //流程状态下拉框
        $("#processStatus").combobox({
            url: '../../data/process_status.json',
            method: "GET",
            valueField: 'codeValue',
            textField: 'codeName',
            panelHeight:'auto',
            editable:false,
            onLoadSuccess : function(){
                var processStatus = $("#processStatus");
                var data = processStatus.combobox('getData');
                if (data.length > 0) {
                    processStatus.combobox('select', data[0].codeValue);
                }
            },
            onSelect: function () {
                $("#appealProcessList").datagrid("load");
            }
        });

        //时间控件初始化
        var beginDateBox = $('#createTimeBegin');
        var beginDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11)+ "00:00:00";
        beginDateBox.datetimebox({
            value: beginDate,
            onChange:function () {
                checkBeginEndTime();
            }
        });

        var endDateBox = $('#createTimeEnd');
        var endDate = (formatDateTime(new Date()-24*60*60*1000)).substr(0,11) + "23:59:59";
        endDateBox.datetimebox({
            value:endDate,
            onChange:function () {
                checkBeginEndTime();
            }
        });

        //申诉流程列表
        $("#appealProcessList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'detail', title: '操作', align: 'center', width: '5%',
                    formatter: function (value, row, index) {
                        return '<a href="javascript:void(0);" id = "appealProcess' + row.processId + '">详情</a>';
                    }
                },
                {field: 'processId', title: '流程编码', align: 'center', width: '15%'},
                {field: 'processName', title: '流程名称', align: 'center', width: '10%'},
                {field: 'createTime', title: '创建时间', align: 'center', width: '15%',
                    formatter:function(value,row,index) { //格式化时间格式
                        if(row.createTime != null) {
                            var createTime = formatDateTime(row.createTime);
                            return '<span title=' + createTime + '>' + createTime + '</span>';
                        }
                    }
                },
                {field: 'createStaffId', title: '创建工号', align: 'center', width: '10%'},
                {field: 'tenantId', title: '渠道', align: 'center', width: '10%'},
                {field: 'modifyTime', title: '修改时间', align: 'center', width: '15%',
                    formatter:function(value,row,index) { //格式化时间格式
                        if(row.modifyTime != null){
                            var modifyTime = formatDateTime(row.modifyTime)
                            return '<span title=' + modifyTime + '>' + modifyTime + '</span>';
                        }
                    }
                },
                {field: 'modifyStaffId', title: '修改工号', align: 'center', width: '10%'},
                {field: 'processStatus', title: '流程状态', align: 'center', width: '10%',
                    formatter:function(value,row,index) {
                        var status = null;
                        var processStatus = row.processStatus;
                        if( processStatus != null && processStatus === "0"){
                            status = "未启动";
                        }
                        if( processStatus != null && processStatus === "1"){
                            status = "启动";
                        }
                        if( processStatus != null && processStatus === "2"){
                            status = "暂停";
                        }
                        return status;
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
            singleSelect: false,
            checkOnSelect: false,
            autoRowHeight: true,
            selectOnCheck: true,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var processId = $("#processId").val();
                var processName = $("#processName").val();
                var createStaffId = $("#createStaffName").val();
                var tenantId = $("#tenantType").combobox("getValue");
                var processStatus = $("#processStatus").combobox("getValue");
                var createTimeBegin = $("#createTimeBegin").datetimebox("getValue");
                var createTimeEnd = $("#createTimeEnd").datetimebox("getValue");
                if(processStatus === "4"){
                    processStatus = null;
                }

                var reqParams = {
                    "processId":processId,
                    "processName":processName,
                    "createStaffId": createStaffId,
                    "tenantId":tenantId,
                    "processStatus": processStatus,
                    "createTimeBegin":createTimeBegin,
                    "createTimeEnd":createTimeEnd
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/queryAppealProcess", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);

                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode !== "1") {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'show'
                        });
                    }
                    success(data);
                });
            },
            onLoadSuccess:function(data){
                //详情
                $.each(data.rows, function(i, item){

                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //查询
        $("#queryBtn").on("click", function () {
            $("#appealProcessList").datagrid("load");
        });

        //新增
        $("#addBtn").on("click", function () {
            addTabs("申诉流程-新增",Util.constants.URLCONTEXT+"/qm/html/manage/appealProcessAdd.html")
        });

        //删除
        $("#delBtn").on("click", function () {

        });
    }

    function formatDateTime(inputDate) {
        var date = new Date(inputDate);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    function checkBeginEndTime() {
        var beginTime = $("#createTimeBegin").datetimebox("getValue");
        var endTime = $("#createTimeEnd").datetimebox("getValue");
        var d1 = new Date(beginTime.replace(/-/g, "\/"));
        var d2 = new Date(endTime.replace(/-/g, "\/"));

        if(beginTime !== "" && endTime !== "" && d1 > d2)
        {
            $.messager.show({
                msg: "开始时间不能大于结束时间!",
                timeout: 1000,
                showType: 'show',
                style:{
                    right:'',
                    top:document.body.scrollTop+document.documentElement.scrollTop,
                    bottom:''
                }
            });
        }
    }

    //添加一个选项卡面板
    function addTabs(title, url) {
        var jq = top.jQuery;

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

    return {
        initialize: initialize
    };
});