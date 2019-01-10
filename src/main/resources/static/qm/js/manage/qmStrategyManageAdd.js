define([
        "text!html/manage/qmStrategyManageAdd.tpl",
        "jquery", "commonAjax",'util', "transfer", "easyui","crossAPI","dateUtil",'ztree-exedit'],
    function (tpl,$, CommonAjax,Util, Transfer,crossAPI,dateUtil) {
        //调用初始化方法
        var $el,
            bean,
            elementTypes;

        var initialize = function(paramsType,pId) {
            $el = $(tpl);
            initGrid();
            if(pId){
                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_STRATEGY_DNS + "/" + pId, {}, function (result) {
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1" && result.RSP.DATA.length > 0) {
                        bean = result.RSP.DATA[0];
                        initSearchForm(paramsType,bean);
                    }
                });
            }else{
                bean = null;
                initSearchForm(paramsType);//初始化表单数据
            }
            initGlobalEvent();
            this.$el = $el;
        };

        function initGrid(){
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#newElesList",$el).datagrid({
                columns: [[
                    {field: 'elementId', title: '元素ID', hidden: true},
                    {field: 'pId', title: '策略ID', hidden: true},
                    {field: 'ck', checkbox: true, align: 'center'},
                    {field: 'elementCode', title: '元素编码', width: '13%'},
                    {field: 'elementName', title: '元素名称', width: '12%'},
                    {field: 'paramsTypeName', title: '元素来源', width: '12%'},
                    {field: 'elementType', title: '字段类型', width: '12%',
                        formatter: function (value, row, index) {
                            var str = "";
                            if(elementTypes){
                                $.each(elementTypes,function(index, item){
                                    if(item.paramsCode == value){
                                        str = item.paramsName;
                                        return;
                                    }
                                });
                            }
                            return str;
                        }
                    },
                    {field: 'isRegion', title: '是否区间值', width: '8%',hidden:true,
                        formatter: function (value, row, index) {
                            if (0 == value) {
                                return "否";
                            } else if (1 == value) {
                                return "是";
                            }
                        }
                    },
                    {
                        field: 'rtype', title: '集合', width: '12%',editor: {
                            type: 'combobox',
                            options: {
                                url: '../../data/rtypeData.json',
                                method: "GET",
                                valueField: "paramsCode",
                                textField: "paramsName",
                                editable: false,
                                panelHeight: "auto",
                                required: true
                            }
                        }
                    },
                    {
                        field: 'operator', title: '运算符', width: '12%',editor:{
                            type: 'combobox',
                            options: {
                                url: '../../data/operatorData.json',
                                method: "GET",
                                valueField: "paramsCode",
                                textField: "paramsName",
                                editable: false,
                                panelHeight: "auto",
                                required: true
                            }
                        }
                    },
                    {field: 'elementValue1', title: '区间值1', width: '12%',editor:"text"},
                    {field: 'elementValue2', title: '区间值2', width: '12%',editor:"text"
                        //formatter: function (value, row, index) {
                        //    var str = "";
                        //    if(row.isRegion == 1){
                        //        str = "<input type='text' style='width: 80%' />";
                        //        if(value){
                        //            str = "<input type='text' value='"+value+"' style='width: 80%' />";
                        //        }
                        //    }else{
                        //        str = "<input type='text' disabled='disabled' style='width: 80%' />";
                        //    }
                        //    return str;
                        //}
                    }
                ]],
                fitColumns: true,
                width: '100%',
                height: 400,
                singleSelect: false,
                checkOnSelect: false,
                autoRowHeight: true,
                selectOnCheck: true,
                onClickCell: function (rowIndex, field, value) {
                    IsCheckFlag = false;
                    $("#newElesList").datagrid("beginEdit", rowIndex);
                },
                onSelect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#newElesList").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#newElesList").datagrid("selectRow", rowIndex);
                    }
                }
            });
        }

        function initElesWindows(){
            $('#add_eles_window').show().window({
                title: '添加元素',
                width: 950,
                height: 600,
                cache: false,
                modal: true
            });
            qryElesList();
            //查询
            $("#add_eles_content").unbind("click");
            $("#searchEles").on("click", "#selectElesBut", function () {
                $("#elesList").datagrid("load");
            });
            $("#add_eles_content").on("click", "#close", function () {
                $("#add_eles_content").find('form.form').form('clear');
                $("#add_eles_window").window("close");
            });
            $("#add_eles_content").on("click", "#okBut", clickOk);
        }

        function clickOk(){
            var checkedRows = $("#elesList").datagrid('getChecked');
            if(checkedRows.length <= 0){
                $.messager.alert('警告', '至少选择一项元素。');
                return;
            }
            $("#add_eles_content").find('form.form').form('clear');
            $("#add_eles_window").window("close");

            $.each(checkedRows, function(index, row){
                var newRow = {
                    elementId:row.elementId,
                    elementCode:row.elementCode,
                    elementName:row.elementName,
                    elementType:row.elementType,
                    isNeed:row.isNeed,
                    isRegion:row.isRegion,
                    paramsTypeName:row.paramsTypeName
                };
                var currentRows = $("#newElesList",$el).datagrid('getRows');
                var flag = false;
                if(currentRows.length > 0){
                    $.each(currentRows,function(i,crow){
                        if(crow.elementId == row.elementId){
                            flag = true;
                            return false;
                        }
                    });
                }
                if(!flag){
                    $("#newElesList",$el).datagrid('appendRow',newRow);
                }
            });
        }

        function qryElesList(){
            var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $("#elesList").datagrid("uncheckAll");
            $("#elesList").datagrid({
                columns: [[
                    {field: 'elementId', title: '元素ID', hidden: true},
                    {field: 'ck', checkbox: true, align: 'center'},
                    {field: 'elementCode', title: '元素编码', width: '15%'},
                    {field: 'elementName', title: '元素名称', width: '15%'},
                    {field: 'paramsTypeName', title: '元素类型', width: '13%'},
                    {field: 'elementType', title: '字段类型', width: '8%',
                        formatter: function (value, row, index) {
                            var str = "";
                            if(elementTypes){
                                $.each(elementTypes,function(index, item){
                                    if(item.paramsCode == value){
                                        str = item.paramsName;
                                        return;
                                    }
                                });
                            }
                            return str;
                        }},
                    {field: 'isRegion', title: '区间值', width: '8%',
                        formatter: function (value, row, index) {
                            if (0 == value) {
                                return "否";
                            } else if (1 == value) {
                                return "是";
                            }
                        }
                    },
                    {field: 'isNeed', title: '必须字段', width: '8%',
                        formatter: function (value, row, index) {
                            if(0 == value){
                                return "否";
                            }else if(1 == value){
                                return "是";
                            }
                        }},
                    {field: 'remark', title: '备注', width: '8%'}
                ]],
                fitColumns: true,
                width: '100%',
                height: 400,
                pagination: true,
                pageSize: 10,
                pageList: [5, 10, 20, 50],
                rownumbers: true,
                idField:"elementId",
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
                        $("#elesList").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#elesList").datagrid("selectRow", rowIndex);
                    }
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows;
                    var pageNum = param.rows;
                    var paramsTypeId = $("#paramsTypeq").combobox('getValue');

                    var reqParams = {
                        "tenantId":Util.constants.TENANT_ID,
                        "paramsTypeId": paramsTypeId,
                        "isValidate": "0"
                    };
                    var params = $.extend({
                        "start": start,
                        "pageNum": pageNum,
                        "params": JSON.stringify(reqParams)
                    }, Util.PageUtil.getParams($("#searchEles")));
                    var rets;
                    Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.QM_STRATEGY_ELES_DNS + "/selectByParams", params, function (result) {
                        var data = Transfer.DataGrid.transfer(result);
                        var rspCode = result.RSP.RSP_CODE;
                        rets = data;
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

        function initGlobalEvent(){
            //取消
            $("#cancel",$el).on("click",function () {
                $("#mainForm").form('clear');
                $("#add_window").window("close");
            });

            $("#addElesBtn",$el).on("click", initElesWindows);

            $("#delElesBut",$el).on("click", function(){
                var checkedRows = $("#newElesList",$el).datagrid('getChecked');
                if(checkedRows.length <= 0){
                    $.messager.alert('警告', '至少选择一项元素。');
                    return;
                }
                $.each(checkedRows,function(index,row){
                    $("#newElesList",$el).datagrid('deleteRow',$("#newElesList",$el).datagrid('getRowIndex',row));
                });
            });

            //保存
            $("#subBut",$el).on("click", function () {
                //禁用按钮，防止多次提交
                $('#subBut',$el).linkbutton({disabled: true});

                var pName = $("#pName",$el).val();
                var paramsTypeId = $("#paramsTypeId").combobox('getValue');
                var isValidate = $("input[name='isValidate']:checked").val();
                var rows = $("#newElesList",$el).datagrid('getRows');
                var elements = [];
                var str = "";
                if(rows.length > 0){
                    $.each(rows, function(index, row){
                        var rowIndex = $("#newElesList",$el).datagrid('getRowIndex',row);
                        var rtypeEd = $("#newElesList",$el).datagrid('getEditor',{index:rowIndex,field:'rtype'});
                        var rtype;
                        if(rtypeEd){
                            rtype = $(rtypeEd.target).combobox("getValue");
                        }else {
                            rtype = row.rtype;
                        }
                        var operatorEd = $("#newElesList",$el).datagrid('getEditor',{index:rowIndex,field:'operator'});
                        var operator;
                        if(rtypeEd){
                            operator = $(operatorEd.target).combobox("getValue");
                        }else {
                            operator = row.operator;
                        }
                        var elementValue1Ed = $("#newElesList",$el).datagrid('getEditor',{index:rowIndex,field:'elementValue1'});
                        var elementValue1;
                        if(elementValue1Ed){
                            elementValue1 = $(elementValue1Ed.target).val();
                        }else{
                            elementValue1 = row.elementValue1;
                        }
                        if(elementValue1 == '' || elementValue1 == null){
                            str = '元素“'+row.elementName+'”区间值1不能为空。';
                            return false;
                        }
                        var elementValue2Ed = $("#newElesList",$el).datagrid('getEditor',{index:rowIndex,field:'elementValue2'});
                        var elementValue2;
                        if(elementValue2Ed){
                            elementValue2 = $(elementValue2Ed.target).val();
                        }else{
                            elementValue2 = row.elementValue2;
                        }
                        if(operator === "between" &&(elementValue2 == ''|| elementValue2 == null)){
                            str = '元素“'+row.elementName+'”区间值2不能为空。';
                            return false;
                        }
                        var ele = {
                            tenantId:Util.constants.TENANT_ID,
                            elementId:row.elementId,
                            pId:row.pId,
                            rtype:rtype,
                            operator:operator,
                            elementValue1:elementValue1,
                            elementValue2:elementValue2
                        };
                        elements.push(ele);
                    });
                }
                var params = {
                    'tenantId': Util.constants.TENANT_ID,
                    'pName': pName,
                    'paramsTypeId': paramsTypeId,
                    'isValidate':isValidate,
                    'elements':elements
                };

                if (pName == null || pName == "" || paramsTypeId == null || paramsTypeId == "" ) {
                    $.messager.alert('警告', '必填项不能为空。');

                    $("#subBut",$el).linkbutton({disabled: false});  //按钮可用
                    return false;
                }else if(str != ""){
                    $.messager.alert('警告', str);

                    $("#subBut",$el).linkbutton({disabled: false});  //按钮可用
                    return false;
                }
                var rspCode;
                if(bean){
                    bean.pName = params.pName;
                    bean.paramsTypeId = params.paramsTypeId;
                    bean.isValidate = params.isValidate;
                    bean.elements = params.elements;
                    Util.ajax.putJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_DNS).concat("/"), JSON.stringify(bean), function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                        rspCode = result.RSP.RSP_CODE;
                        if (rspCode == "1") {
                            $("#retList").datagrid('reload'); //修改成功后，刷新页面
                        }
                    });
                }else{
                    Util.ajax.postJson(Util.constants.CONTEXT.concat(Util.constants.QM_STRATEGY_DNS).concat("/"), JSON.stringify(params), function (result) {
                        $.messager.show({
                            msg: result.RSP.RSP_DESC,
                            timeout: 1000,
                            style: {right: '', bottom: ''},     //居中显示
                            showType: 'slide'
                        });
                    });
                    rspCode = result.RSP.RSP_CODE;
                    if (rspCode == "1") {
                        $("#retList").datagrid('reload'); //新增成功后，刷新页面
                    }
                }

                //enable按钮
                $("#subBut",$el).linkbutton({disabled: false}); //按钮可用
            });
        }

        //初始化搜索表单
        function initSearchForm(paramsType,bean) {
            $("#pName",$el).validatebox({required: true});
            if(paramsType){
                $('#paramsTypeId',$el).combobox({
                    data: paramsType,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
                $('#paramsTypeq',$el).combobox({
                    data: paramsType,
                    valueField: 'paramsCode',
                    textField: 'paramsName',
                    editable: false
                });
            }else{
                CommonAjax.getStaticParams("STRATEGY_ELE_TYPE",function(datas){
                    if(datas){
                        paramsType = datas;
                        $('#paramsTypeId',$el).combobox({
                            data: datas,
                            valueField: 'paramsCode',
                            textField: 'paramsName',
                            editable: false
                        });
                        $('#paramsTypeq').combobox({
                            data: datas,
                            valueField: 'paramsCode',
                            textField: 'paramsName',
                            editable: false
                        });
                    }
                });
            }
            if(bean){
                $("#pName",$el).val(bean.pName);
                $("#paramsTypeId").combobox('setValue',bean.paramsTypeId);
                $("input[name='isValidate'][value='"+bean.isValidate+"']").attr("checked","checked");
                if(bean.elements && bean.elements.length > 0){
                    $("#newElesList",$el).datagrid("loadData", bean.elements);
                }
            }
            CommonAjax.getStaticParams("ELEMENT_TYPE",function(datas){
                if(datas){
                    elementTypes = datas;
                }
            });
        }
        return initialize;
    });
