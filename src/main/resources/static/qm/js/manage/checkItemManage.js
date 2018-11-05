require(["jquery", 'util', "transfer", "easyui"], function ($, Util, Transfer) {
    var qmURI = "/qm/configservice/checkItem";
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
        $("#checkItemList").datagrid({
            columns: [[
                {field: 'checkitemId', title: '考评项ID', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {field: 'checkitemName', title: '考评项名称', align: 'center', width: '25%'},
                {field: 'checkitemType', title: '考评项类别', align: 'center', width: '25%'},
                {field: 'remark', title: '考评项描述', align: 'center', width: '35%'},
                {
                    field: 'action', title: '操作', align: 'center', width: '10%',
                    formatter: function (value, row, index) {
                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id = 'checkItem'" + row.checkItemId + " >修改</a>";
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
                    $("#checkItemList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#checkItemList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var checkItemName = $("#checkItemName").val();
                var tenantId = $("#tenantName").val();
                var checkItemType = $("#checkItemType").val();
                var reqParams = {
                    "parentCheckItemId":Util.constants.PARENT_CHECK_ITEM_ID,
                    "checkItemName":checkItemName,
                    "tenantId":Util.constants.TENANT_ID,
                    "checkItemType": checkItemType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + qmURI + "/queryCheckItem", params, function (result) {
                    debugger;
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
        $("#queryBtn").on("click", function () {
            $("#checkItemList").datagrid("load");
        });

        //新增
        $("#addBtn").on("click", function () {

        });

        //删除
        $("#delBtn").on("click", function () {
            var delRows = $("#checkItemList").datagrid("getSelections");
            if (delRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var delArr = [];
            for (var i = 0; i < delRows.length; i++) {
                var id = delRows[i].checkitemId;
                delArr.push(id);
            }
            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(qmURI).concat("/deleteCheckItem/").concat(delArr), {}, function (result) {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });

                        var rspCode = result.RSP.RSP_CODE;

                        if (rspCode == "1") {
                            $("#checkItemList").datagrid('reload'); //删除成功后，刷新页面
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
