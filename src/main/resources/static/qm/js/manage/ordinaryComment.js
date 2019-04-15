require(["jquery", 'util', "transfer", "easyui","dateUtil"], function ($, Util, Transfer,dateUtil) {
    var userInfo;
    //调用初始化方法
    initialize();

    function initialize() {
        Util.getLogInData(function (data) {
            userInfo = data;//用户角色
            initGrid();
            initGlobalEvent();
            initWindowEvent();
            initReviseEvent();
        });
    };

    //初始化列表
    function initGrid() {
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#page").find("#ordinaryComment").datagrid({
            columns: [[
                {field: '', title: '', hidden: true},
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'action', title: '操作', width: '20%',

                    formatter: function (value, row, index) {

                        var bean = {//根据参数进行定位修改
                            'commentName': row.commentName, 'commentId': row.commentId,
                            'remark': row.remark,'crtTime': row.crtTime,'createStaffId': row.createStaffId
                        };
                        var beanStr = JSON.stringify(bean);   //转成字符串

                        var Action =
                            "<a href='javascript:void(0);' class='reviseBtn' id =" + beanStr + " >修改</a>";
                        return Action;
                    }
                },
                {field: 'commentName', title: '评语名称', width: '20%',
                        formatter: function (value) {
                            if(value){
                                return "<span title='" + value + "'>" + value + "</span>";
                            }
                }},
                {field: 'crtTime', title: '创建时间', width: '20%',
                 formatter:function(value,row,index){//格式化时间格式
                     if(value){
                         return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                     }
                }},
                {field: 'createStaffId', title: '创建工号', width: '20%',
                    formatter: function (value) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                }},
                {field: 'modfTime', title: '修改时间', width: '20%',
                    formatter: function (value, row, index) { //格式化时间格式
                        if(value){
                            return "<span title='" + DateUtil.formatDateTime(value) + "'>" + DateUtil.formatDateTime(value) + "</span>";
                        }
                    }},
                {field: 'operateStaffId', title: '修改工号', width: '20%',
                    formatter: function (value) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                }},
                {field: 'remark', title: '描述', width: '20%',
                    formatter: function (value) {
                        if(value){
                            return "<span title='" + value + "'>" + value + "</span>";
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
                    $("#ordinaryComment").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#ordinaryComment").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {//加载器
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var commentName = $("#commentName").val();//评语名称
                var reqParams = {//入参
                    "commentName":commentName
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                //查询
                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.ORDINARY_COMMENT + "/selectByParams", params, function (result) {
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
            $("#page").find("#ordinaryComment").datagrid("load");
        });

        //重置
        $("#searchForm").on("click", "#clearBut", function () {
            $("#page input").val("");
        });

        //绑定删除按钮事件
        $("#page").delegate("#delBut", "click", function () {

            var selRows = $("#ordinaryComment").datagrid("getSelections");//选中多行
            if (selRows.length == 0) {
                $.messager.alert("提示", "请至少选择一行数据!");
                return false;
            }
            var ids = [];
            for (var i = 0; i < selRows.length; i++) {
                var id = selRows[i].commentId;
                ids.push(id);
            }

            // var params = {'ids': ids};//入参
            // var ps = $.param(params, true); //序列化

            $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {

                if (confirm) {
                    Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.ORDINARY_COMMENT).concat("/deleteByIds/").concat(ids), {}, function (result) {

                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        var rspCode = result.RSP.RSP_CODE;

                        if (rspCode == "1") {
                            $("#ordinaryComment").datagrid('reload'); //删除成功后，刷新页面
                        }
                    });

                }
            });
        });
    }

    /**
     * 增加弹出窗口事件
     */
    function initWindowEvent() {
       /*
        * 弹出添加窗口
        */
       $("#page").on("click", "#addBut", function () {
           $("#add_content").find('form.form').form('clear');  //初始化清空
           $('#desc').textbox({});
           $("#add_content").show().window({   //弹框
               width: 750,
               height: 400,
               modal: true,
               title: "新增"
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
               // if ($(this).textbox({disabled : true})) {
               //     return;
               // }
               $('#name').validatebox({required:true});//非空校验
               //禁用按钮，防止多次提交
               $('#global').linkbutton({disabled: true});
               var name = $("#name").val();
               var desc = $("#desc").val();

               var params = {'tenantId': Util.constants.TENANT_ID,
                   'commentName': name, 'remark': desc,
                   "createStaffId":userInfo.staffId};

               if (name == null || name == "") {
                   $.messager.alert('警告', '名称不能为空!');

                   $("#global").linkbutton({disabled: false});  //按钮可用
                   return false;
               }

               Util.ajax.postJson(Util.constants.CONTEXT+ Util.constants.ORDINARY_COMMENT + "/insertComment", JSON.stringify(params), function (result) {

                   $.messager.show({
                       msg: result.RSP.RSP_DESC,
                       timeout: 1000,
                       style: {right: '', bottom: ''},     //居中显示
                       showType: 'slide'
                   });

                   var rspCode = result.RSP.RSP_CODE;

                   if (rspCode == "1") {
                       $('#add_content').window('close'); // 关闭窗口
                       $("#ordinaryComment").datagrid('reload'); //插入成功后，刷新页面
                   }
               });
               //enable按钮
               $("#global").linkbutton({disabled: false}); //按钮可用
           });
       });
    }

    //修改
    function initReviseEvent() {
       /*
        * 弹出修改窗口
        */
       $("#page").on("click", "a.reviseBtn", function () {
           $('#remark').textbox({});
           $("#modf_content").show().window({
               width: 750,
               height: 400,
               modal: true,
               title: "修改"
           });

           var rowData = $(this).attr('id'); //获取a标签中传递的值
           var sensjson = JSON.parse(rowData); //转成json格式

           $('#modfName').val(sensjson.commentName);   //将数据填入弹框中
           $('#remark').val(sensjson.remark);   //将数据填入弹框中
           $("#modf_content").unbind("click");              //解绑事件

           $("#modf_content").on("click", "#no", function () {
               $("#modf_content").find('form.form').form('clear');
               $("#modf_content").window("close");
           });

           $("#modf_content").on("click", "#ok", function () {
               $('#modfName').validatebox({required:true});//非空校验
               var commentId = sensjson.commentId;
               var modfName = $("#modfName").val();
               var remark = $("#remark").val();
               var createStaffId = sensjson.createStaffId;
               var crtTime = sensjson.crtTime;

               var params = {'tenantId': Util.constants.TENANT_ID,'commentId':commentId,
                   'commentName':modfName, 'remark': remark,'createStaffId':createStaffId,'crtTime':crtTime,
                   "operateStaffId":userInfo.staffId};

               if (modfName == null || modfName == "" ) {
                   $.messager.alert('警告', '名称不能为空！');
                   $("#ok").linkbutton({disabled: false});  //按钮可用
                   return false;
               }

               Util.ajax.putJson(Util.constants.CONTEXT + Util.constants.ORDINARY_COMMENT + "/updateComment", JSON.stringify(params), function (result) {

                   $.messager.show({
                       msg: result.RSP.RSP_DESC,
                       timeout: 1000,
                       style: {right: '', bottom: ''},     //居中显示
                       showType: 'slide'
                   });

                   var rspCode = result.RSP.RSP_CODE;

                   if (rspCode == "1") {
                       $('#modf_content').window('close'); // 关闭窗口
                       $("#ordinaryComment").datagrid('reload'); //修改成功后，刷新页面
                   }

               })
           })
       });
    };

    return {
        initialize: initialize
    };
});
