require(["jquery", 'util' ,"js/manage/replyEvaluation",'js/manage/formatter', "transfer"], function($, Util,replyEvaluation,Formatter,Transfer) {
    var evaluationType = "NGKM.FDBK.EVALU.TYPE";   //数据字典搜索参数

    //调用初始化方法
    initialize();

    function initialize(){
        initSearchForm();
        initGrid();
        initGlobalEvent();
    };


    //初始化搜索框
    function initSearchForm() {
        $("#searchForm").find("a.btn").linkbutton();
        $("#searchForm").find("input.easyui-textbox").textbox();

        //初始化评价类型下拉框
        $("#searchForm").find("input.easyui-combobox[name='fdbkType']").combobox({
            url:Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId="+evaluationType,
            valueField: 'CODEVALUE',
            textField: 'CODENAME',
            editable:false,
            panelHeight:'auto',
            loadFilter:function (data) {
                return Transfer.Combobox.transfer(data);           //通过loadFilter来设置显示数据
            }
        });
    }

    //初始化数据列表
    function initGrid(){
        $("#page").find("#evaluManage").datagrid({
            columns: [[
                {field: 'FDBKID', title: '评价Id',hidden:true},
                {field: 'FDBKTITLENM', title: '评价标题', width: '15%'},
                {field: 'KNWLGID', title: '知识Id', width: '15%'},
                {field: 'FDBKTYPE', title: '评价类型', width: '10%',formatter:function(value) {
                        if (value == 1) {return "知识评价";}
                        else if(value == 2){return "搜索评价";}}
                },
                {field: 'OPTCNTT', title: '评价分数',sortable:true, width: '10%'},
                {field: 'FDBKPRSNID', title: '评价人工号',sortable:true, width: '10%'},
                {field: 'CRTTIME', title: '评价时间',sortable:true, width: '15%',
                    formatter:function(value) {return Formatter.formatDateTime(value)}
                },
                {field: 'MODFTIME', title: '修改时间', width: '10%',
                    formatter:function(value) {return Formatter.formatDateTime(value)}
                },
                {field: 'action', title: '操作', width: '14%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='replyBtn' id ='rep"+row.FDBKID+"'>回复</a>  |  "+
                            "<a href='javascript:void(0);'>生成采编</a>  |  "+
                            "<a href='javascript:void(0);' class='deleteBtn' id ='del"+row.FDBKID+"'>删除</a>";
                        return Action;
                    }
                }
            ]],
            fitColumns:true,
            width: '100%',
            height: 420,
            pagination: true,
            pageSize: 10,
            pageList: [5,10, 20, 50],
            rownumbers:true,
            singleSelect: true,
            autoRowHeight: true,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows  ;
                var pageNum = param.rows;
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + "/feedback/feedbackinfos", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result)
                    success(data);
                });
            }
        });
    }

    //初始化事件
    function initGlobalEvent(){
        //查询
        $("#searchForm").on("click", "a.btn-green", function() {
                $("#page").find("#evaluManage").datagrid("load");
            });
        //重置
        $("#searchForm").on("click", "a.btn-default", function() {
                $("#searchForm").form('clear');
        });

        //绑定删除按钮事件
        $("#page").delegate("a.deleteBtn", "click", function (){
            var thisDelBtn = $(this);
            $.messager.confirm('确认删除弹窗', '您确定要删除这条评价吗？', function(confirm) {
                if (confirm) {
                    var fdbkId = thisDelBtn.attr('id').substr(3);
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/feedback/feedbackinfo?fdbkId="+fdbkId, function (result) {
                        $.messager.show({
                            msg:'删除成功.',
                            timeout:1000,
                            style:{ right:'',bottom:''},     //居中显示
                            showType:'slide'
                        });
                        $("#page").find("#evaluManage").datagrid("load");
                    });
                }
            });
        });
        //绑定回复按钮事件
        $("#page").delegate("a.replyBtn", "click", function (){
                var thisRepBtn = $(this);
                $("#win_content").show().window({
                    width:550,
                    height:380,
                    modal:true,
                    title:"评价回复"
                });
                var fdbkId = thisRepBtn.attr('id').substr(3);
                replyEvaluation.initialize(fdbkId);
        });
    }
});
