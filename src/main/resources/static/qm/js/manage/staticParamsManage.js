require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var qmURI = "/qm/configservice/staticParams";
    //调用初始化方法
    initialize();

    function initialize() {
        initGrid();
        initGlobalEvent();
        //initWindowEvent();
        //initReviseEvent();
    };

    //格式化时间方法
    function formatDateTime(inputTime) {
        var date = new Date(inputTime);
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

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#staticParamsManage").datagrid({
            columns: [[
                {field: 'paramsPurposeId', title: '参数用途ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'tenantId', title: '渠道', width: '15%'},
                {field: 'paramsTypeId', title: '参数用途名称', width: '20%'},
                {field: 'paramsCode', title: '参数编码', width: '20%'},
                {field: 'paramsName', title: '参数名称', width: '20%'},
                {
                    field: 'action', title: '操作', width: '20%',

                    formatter: function (value, row, index) {
                        var bean = {
                            'paramsPurposeId': row.paramsPurposeId, 'tenantId': row.tenantId,
                            'paramsTypeId': row.paramsTypeId
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串

                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + beanStr + " >修改</a>";
                        return Action;
                    }
                }
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
                    $("#staticParamsManage").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#staticParamsManage").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var paramsTypeId = $("#paramsName").val();
                var reqParams = {
                    "tenantId":Util.constants.TENANT_ID,
                    "paramsTypeId": paramsTypeId
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/selectByParams", params, function (result) {
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
            $("#page").find("#staticParamsManage").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "a.btn-default", function () {
            $("#searchForm").form('clear');
        });

        //绑定删除按钮事件
        $("#page").delegate("#delBut", "click", function () {

            var selRows = $("#staticParamsManage").datagrid("getSelections");
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var wordId = selRows[i].WORDID;
                ids.push(wordId);
            }

            var params = {'ids': ids};
            var ps = $.param(params, true); //序列化

            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT + qmURI + "/deleteByIds", ps, function (result) {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;

                        if (rspCode == "1") {
                            $("#staticParamsManage").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });

                }
            });
        });
    }

    /**
     * 增加弹出窗口事件
     */
    //function initWindowEvent() {
    //    /*
    //     * 弹出添加窗口
    //     */
    //    $("#page").on("click", "#addSens", function () {
    //        $("#add_content").find('form.form').form('clear');  //初始化清空
    //
    //        $("#add_content").show().window({   //弹框
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "添加静态参数配置"
    //        });
    //
    //        $("#add_content").unbind("click");
    //        /*
    //         * 清除表单信息
    //         */
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#global", function () {
    //            // if ($(this).textbox({disabled : true})) {
    //            //     return;
    //            // }
    //            //禁用按钮，防止多次提交
    //            $('#global').linkbutton({disabled: true});
    //
    //            var sensitiveWord = $("#sensitiveWord").val();
    //            var substituteWord = $("#substituteWord").val();
    //            var rmk = $("#rmk").val();
    //
    //            var params = {'sensitiveWord': sensitiveWord, 'substituteWord': substituteWord, 'rmk': rmk};
    //
    //            if (sensitiveWord == null || sensitiveWord == "" || substituteWord == null
    //                || substituteWord == "") {
    //                $.messager.alert('警告', '敏感词和替换词不能为空。');
    //
    //                $("#global").linkbutton({disabled: false});  //按钮可用
    //                return false;
    //            }
    //
    //            Util.ajax.postJson(Util.constants.CONTEXT + "/sensword/insertsensword", params, function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'slide'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#evaluManage").datagrid('reload'); //插入成功后，刷新页面
    //                }
    //            });
    //            //enable按钮
    //            $("#global").linkbutton({disabled: false}); //按钮可用
    //        });
    //    });
    //}
    //
    ////敏感词修改
    //function initReviseEvent() {
    //    /*
    //     * 弹出修改窗口
    //     */
    //    $("#page").on("click", "a.reviseBtn", function () {
    //        $("#add_content").show().window({
    //            width: 950,
    //            height: 400,
    //            modal: true,
    //            title: "修改敏感词配置"
    //        });
    //
    //        var sensStr = $(this).attr('id'); //获取选中行的数据
    //        var sensjson = JSON.parse(sensStr); //转成json格式
    //
    //        $('#createSkillConfig').form('load', sensjson);   //将数据填入弹框中
    //
    //        $("#add_content").unbind("click");              //解绑事件
    //
    //        $("#add_content").on("click", "#cancel", function () {
    //            $("#add_content").find('form.form').form('clear');
    //            $("#add_content").window("close");
    //        });
    //
    //        $("#add_content").on("click", "#global", function () {
    //
    //            var wordId = $("#wordId").val();
    //            var sensitiveWord = $("#sensitiveWord").val();
    //            var substituteWord = $("#substituteWord").val();
    //            var rmk = $("#rmk").val();
    //
    //            var params = {'wordId':wordId, 'sensitiveWord': sensitiveWord, 'substituteWord': substituteWord, 'rmk': rmk};
    //
    //            if (sensitiveWord == null || sensitiveWord == "" || substituteWord == null
    //                || substituteWord == "") {
    //                $.messager.alert('警告', '敏感词和替换词不能为空。');
    //
    //                $("#global").linkbutton({disabled: false});  //按钮可用
    //
    //                return false;
    //            }
    //
    //            Util.ajax.putJson(Util.constants.CONTEXT + "/sensword/updatesensword", params, function (result) {
    //
    //                $.messager.show({
    //                    msg: result.RSP.RSP_DESC,
    //                    timeout: 1000,
    //                    style: {right: '', bottom: ''},     //居中显示
    //                    showType: 'slide'
    //                });
    //
    //                var rspCode = result.RSP.RSP_CODE;
    //
    //                if (rspCode == "1") {
    //                    $("#evaluManage").datagrid('reload'); //修改成功后，刷新页面
    //                }
    //
    //            })
    //        })
    //    });
    //};

    return {
        initialize: initialize
    };
});
