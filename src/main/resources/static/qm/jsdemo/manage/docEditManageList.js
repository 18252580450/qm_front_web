/**
 * 技能配置样例
 */
define(["jquery", 'util', "transfer", "catalogTemplateInteractive", "easyui"], function ($, Util, Transfer, Interactive) {

        var $page, $search, $knowledge;
        var opSts_name = "NGKM.KNOWLEDGE.OPERTYPE"; //操作类型
        var knwlgSts_Name = "NGKM.KNOWLEDGE.STATE";  //知识状态
        var knwlgGathrType_Name = "NGKM.KNOWLEDGE.TYPE";  //知识类型
        var chnlCode_Name = "NGKM.TEMPLET.CHNL";  //渠道显示
        var opStsNm;
        var knwlgGathrTypeNm;
        var knwlgStsNm;
        var chnlCodeNm;

        var currentSelectRow;
        var customTempletArr;
        var provnce;

        /**
         * 初始化
         */
        var initialize = function () {
            customTempletArr = [];
            opStsNm = getsysCode(opSts_name);
            knwlgGathrTypeNm = getsysCode(knwlgGathrType_Name);
            chnlCodeNm = getsysCode(chnlCode_Name);
            knwlgStsNm = getsysCode(knwlgSts_Name);
            $page = $("<div></div>");
            // getProvnce();
            addSearchForm();
            addGridDom();
            $page = $page.appendTo($("#docEdit_manage"));

            initSearchForm();
            initGrid();
            initGlobalEvent();
        };

    var getProvnce = function(){
        Util.ajax.getJson(Util.constants.CONTEXT + "/user/session",{},function(data){
            if(data.RSP.RSP_CODE == "1"){
                provnce = data.RSP.DATA[0].provnce;
            }else{
                $.messager.alert(data.RSP.RSP_DESC);
            }
        },true);
    };


    function loadSearchData(templetInfoList) {
            $("#addKnWindow").find("#templateGrid").datagrid("loadData", templetInfoList);
        }

        function addNormalKnowledgeAction() {
            var options = {
                windowId: "addKnWindow",
                height: 600,
                width: 750,
                title: "新增知识"
            };
            $("#addKnWindow").empty();
            showWindow(options);
            addSearchTempletForm();
            initTemplateGrid();
            $("#templateContent > .datagrid").css("padding-top", "10px");
            $("#templetName").textbox();
            initCustomTempletList();
        }

        function initCustomTempletList() {
            Interactive.getComTemplateList(addCustomTempletListAction);
        }

        function addCustomTempletListAction(option) {
            if (customTempletArr.indexOf(option.TMPLTID) != -1) {
                $.messager.alert('温馨提示', '该常用模型已经存在');
                return;
            }
            addCustomTemplate(option);
            customTempletArr.push(option.TMPLTID);
        }

        function removeCustomTempletAction(id) {
            $("#" + id + "li").remove();
            customTempletArr.splice(customTempletArr.indexOf(id), 1);
            $.messager.alert('温馨提示', '常用模板删除成功');
        }

        function initTableEvent() {
            /**
             * 绑定按照模板名称模糊查询模板事件
             */
            $("#templateContent").on("click", "#searchTempletButton", function () {
                var text = $("#templetName").textbox("getText");
                var value = $("#templetName").textbox("getValue");
                var options = {
                    "TMPLTNM": value
                };
                Interactive.getComTemplateListByName(options, loadSearchData);
            });

            /**
             * 绑定添加到常用模板事件
             */
            $("#templateContent").on("click", ".addCustomBtn", function () {
                addCustomTempletListAction(currentSelectRow);
                $.messager.alert('温馨提示', '常用模板增加成功');
            });

            /**
             * 绑定移除常用模板事件
             */
            $("#templateContent").on("click", ".formwork-del", function () {
                removeCustomTempletAction(this.id);
            });

            /**
             * 绑定单个采编事件
             */
            $("#templateContent").on("click", ".editBtn", function () {
                var templtId = currentSelectRow.TMPLTID;
                var knwlgGathrTypeCd = 1; //1普通知识，2预采编知识
                window.open("http://localhost:8080/html/manage/docEditMain.html?tmpltId=" + templtId + "&knwlgGathrTypeCd=" + knwlgGathrTypeCd);
            });
        }

        function addCustomTemplate(options) {
            $(["<li id='" + options.TMPLTID + "li'>",
                "<a class='link-blue text_omission' tmpltId = '" + options.TMPLTID + "' href='javascript:void(0)' title = '" + options.TMPLTNM + "' >" + options.TMPLTNM + "</a>",
                "<a class='formwork-del' id = '" + options.TMPLTID + "' href='javascript:void(0)'></a></li>",
                "</li>"].join("")).appendTo("#customTempletList");
        }

        function showWindow(options) {
            $("#" + options.windowId).show().window({
                width: options.width,
                height: options.height,
                title: options.title,
                modal: true
            });
        }
    /**
     * 列表查询方法
     */
    var searchList = function () {
        if(validator.form()){
            var param = {};
            if (trim($("input[name='knwlgId']").val())) {
                param.knwlgId = trim($("input[name='knwlgId']").val());
            }
            if (trim($("input[name='knwlgNm']").val())) {
                param.knwlgNm = trim($("input[name='knwlgNm']").val());
            }
            if (trim($("input[name='regnId']").val())) {
                param.regnId = trim($("input[name='regnId']").val());
            }
            if (trim($("select[name='chnlCode']").val())) {
                param.chnlCode = trim($("select[name='chnlCode']").val());
            }
            if (trim($("input[name='opPrsnId']").val())) {
                if ($("input[name='opPrsnId']").val()==staffName){
                    param.opPrsnId = staffCode;
                }else{
                    param.opPrsnId = trim($("input[name='opPrsnId']").attr("data"));
                }
            }
            if (trim($("input[name='startTime']").val())) {
                param.startTime = trim($("input[name='startTime']").val());
            }
            if (trim($("input[name='endTime']").val())) {
                param.endTime = trim($("input[name='endTime']").val());
            }
            if (trim($("select[name='tmpltId']").val())) {
                param.tmpltId = trim($("select[name='tmpltId']").val());
            }
            if (trim($("select[name='knwlgGathrTypeCd']").val())) {
                param.knwlgGathrTypeCd = trim($("select[name='knwlgGathrTypeCd']").val());
            }
            if (trim($("input[name='catlId']").val())) {
                if(trim($("input[name='catlId']").val()) != "0"){
                    param.catlId = trim($("input[name='catlId']").val());
                }
            }
            list.search(param);
        }

    };
        function addSearchTempletForm() {
            $(["<div id='templateContent' style='height: 100%;overflow-y: auto'>",
                "<form class='form form-horizontal'  id='searchTempletForm'>",
                "<div class='row cl rowMargin' style='border-bottom: 1px solid #EEE;'>",
                "<label class='form-label col-2 text_omission' title='常用模板' style='margin-bottom: 10px;' >常用模板</label>",
                "<ul id='customTempletList' class='formControls col-10'></ul>",
                "</div>",
                "<div class='row cl rowMargin'>",
                "<label class='form-label col-2 text_omission' title='模板名称'>模板名称</label>",
                "<div class='formControls col-8'>",
                "<input  class='easyui-textbox' id='templetName'  placeholder='请输入需要查询的模板名称'  name='priorityOrder' style='width:100%;height:30px'>",
                "</div>",
                "<div> <a href='javascript:void(0)' id='searchTempletButton' class='btn btn-green radius  mt-l-20'>查询</a></div>",
                "</div>",
                "</form>",
                "<div id='templateGrid' style='padding-top: 15px;'>",
                "<div>"
            ].join("")).appendTo($("#addKnWindow"));
        }

        function initTemplateGrid() {
            $("#addKnWindow").find("#templateGrid").datagrid({
                columns: [[
                    {
                        field: 'TMPLTNM', title: '模板名称', width: '30%', align: 'center', halign: 'center',
                        formatter: function (value, row, index) {
                            return generateToolBar(value);
                        },
                        sortable: true,
                        sorter: function (a, b) {
                            return a > b ? 1 : -1;
                        }
                    },
                    {
                        field: 'CHNLNAME', title: '渠道', width: '30%', align: 'center', halign: 'center',
                        formatter: function (value) {
                            return generateToolBar(value);
                        }
                    },
                    {
                        field: 'action', title: '操作', width: '40%', align: 'center', halign: 'center',
                        formatter: function (value, row, index) {
                            return "<a href='javascript:void(0);' class='editBtn' id ='edit" + row.TMPLTID + "'>" + generateToolBar("单个采编") + "</a> " +
                                "<a href='javascript:void(0);' class='addCustomBtn' id ='del" + row.TMPLTID + "'>" + generateToolBar("添加到常用模板") + "</a>"
                        }
                    }
                ]],
                toolbar: "#tempalteGrid_Toolbar",
                fitColumns: true,
                width: parseInt($("#templateContent").css("width")),
                height: parseInt($("#templateContent").css("height")) - parseInt($("#searchTempletForm").css("height")) - 30,
                pagination: true,
                pageSize: 10,
                pageList: [10, 20, 50],
                rownumbers: true,
                singleSelect: false,
                autoRowHeight: false,
                striped: true,
                nowrap: true,
                loadMsg: "正在处理中，请稍候...",
                emptyMsg: "未查询到任何信息！",
                checkOnSelect: true,
                selectOnCheck: true,
                remoteSort: false,
                sortName: "TMPLTNM",
                idField: "TMPLTID",
                onSortColumn: function (sort, order) {

                },
                onSelect: function (index, row) {
                    currentSelectRow = row;
                },
                loader: function (param, success) {
                    var start = (param.page - 1) * param.rows + 1;
                    var pageNum = param.rows;
                    var params = {};
                    Interactive.getComTemplateListByName({"TMPLTNM": ""}, success);
                }
            });
        }

        function generateToolBar(value) {
            return "<span title='" + value + "'>" + value + "</span>";
        }

        /**
         * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
         * @param codeTypeCd
         * @returns result
         */
        function getsysCode(codeTypeCd) {
            var result = {};
            $.ajax({
                url: Util.constants.CONTEXT + "/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
                success: function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].value !== null && data[i].name !== null) {
                            result[data[i].value] = data[i].name;
                        }
                    }
                }
            });
            return result;
        };

        /**
         * append search form
         */
        function addSearchForm() {
            $search = $([
                "<div class='panel-search'>",
                "<form class='form form-horizontal'>",

                // 测试表单
                "<div class='row cl'>",
                "<label class='form-label col-2'>知识ID：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='knwlgId' style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识标题：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='knwlgNm'  style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识地区：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combotree' name='regnId' style='width:100%;height:30px' >",
                "</div>",
                "</div>",


                "<div class='row cl'>",
                "<label class='form-label col-2'>知识渠道：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combobox' name='chnlCode'  style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>最近采编人：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-textbox' name='opPrsnId'  style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>开始时间：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-datetimebox' name='startTime'  style='width:100%;height:30px' >",
                "</div>",
                "</div>",


                "<div class='row cl'>",
                "<label class='form-label col-2'>结束时间：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-datetimebox' name='endTime'  style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>采编模板：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combobox' name='tmpltId'  style='width:100%;height:30px' >",
                "</div>",
                "<label class='form-label col-2'>知识类型：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combobox' name='knwlgGathrTypeCd'  style='width:100%;height:30px' >",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>业务树：</label>",
                "<div class='formControls col-2'>",
                "<input type='text' class='easyui-combotree' name='catlId'  style='width:100%;height:30px' >",
                "</div>",


                "<div class='row cl'>",
                "<div class='formControls text-r'>" +
                "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a>",
                "<a href='javascript:void(0)' class='btn btn-default radius mt-l-20 '><i class='iconfont iconfont-zhongzuo'></i>重置</a>",
                "</div>",
                "</div>",

                "</form>",
                "</div>"
            ].join("")).appendTo($page);
        }

        function initSearchForm() {

            $search.find("a.btn").linkbutton();
            $search.find("input.easyui-datetimebox").datetimebox();
            $search.find("input.easyui-textbox").textbox();
            $search.find("input.easyui-datetimebox").datetimebox({
                editable: false
            });

            /*
             * enter键触发查询  skillName
             */
            $search.find("input.easyui-textbox").textbox({
                inputEvents: $.extend({}, $.fn.textbox.defaults.inputEvents, {
                    keyup: function (event) {
                        if (event.keyCode == 13) {
                            $search.find("a.btn-green").click();
                        }
                    }
                })
            });

            $search.find('input.easyui-combobox[name="knwlgGathrTypeCd"]').combobox({
                url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + knwlgGathrType_Name,
                method: "GET",
                valueField: 'CODEVALUE',
                textField: 'CODENAME',
                panelHeight: 'auto',
                editable: false,
                missingMessage: '请选择优先级',
                loadFilter: function (data) {
                    return Transfer.Combobox.transfer(data);
                }
            });

            $search.find('input[name="tmpltId"]').combobox({
                url: Util.constants.CONTEXT + "/catalog/templates/tmpltinfos",
                method: "GET",
                // data: CRM.getEnumArr("PLATFORM_ACCOUNT_STATE@CS_IR"),
                valueField: 'TMPLTID',
                textField: 'TMPLTNM',
                panelHeight: 'auto',
                editable: false,
                loadFilter: function (data) {
                    return Transfer.Combobox.transfer(data);
                }
            });
            $search.find('input[name="chnlCode"]').combobox({
                url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + chnlCode_Name,
                method: "GET",
                // data: CRM.getEnumArr("ACCESS_TYPE@CS_IR"),
                valueField: 'CODEVALUE',
                textField: 'CODENAME',
                panelHeight: 'auto',
                editable: false,
                loadFilter: function (data) {
                    return Transfer.Combobox.transfer(data);
                }
            });
            $search.find('input[name="regnId"]').combotree({
                url: '../../data/tree_data1.json',
                method: "GET",
                textField: 'text',
                panelHeight: 'auto',
                editable: false,
                onBeforeExpand: function (node, param) {    // 下拉树异步
                    console.log("onBeforeExpand - node: " + node + " param: " + param);
                    var id = node.domId;
                    $('#' + id).combotree('tree').tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
                }
            });
            $search.find('input[name="catlId"]').combotree({
                url: '../../data/tree_data1.json',
                method: "GET",
                textField: 'text',
                panelHeight: 'auto',
                editable: false,
                onBeforeExpand: function (node, param) {    // 下拉树异步
                    console.log("onBeforeExpand - node: " + node + " param: " + param);
                    $('#combotree-test').combotree("tree").tree("options").url = "../../data/tree_data2.json?areaId=" + node.id;
                }
            });
        }

        function addGridDom() {
            $knowledge = $([
                "<div class='cl'>",
                "<div class='panel-tool-box cl' >",
                "<div class='fr'>",
                "<a id='forcedUnlockBtn'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-edit'></i>强制解锁</a>",
                "<a id='addSimpleKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-add'></i>新增普通知识</a>",
                "<a id='addQAKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-add'></i>新增问答知识</a>",
                "<a id='addPreKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-add'></i>新增预采编知识</a>",
                "<a id='batchKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-edit'></i>批量采编</a>",
                "<a id='fileCheckBox'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-edit'></i>知识文件多选</a>",
                "</div>",
                "</div>",
                "</div>",
                "<table id='skill' class='easyui-datagrid'  style=' width:98%;height:245px;'>" +
                "</table>",
                "<div class='cl'>",
                "<div class='panel-tool-box cl' >",
                "<div class='fr'>",
                "<a id='compareKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-edit'></i>对比</a>",
                "<a id='batchDelKnwlg'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
                "<i class='iconfont iconfont-del2'></i>批量删除</a>",
                "</div>",
                "</div>",
                "<div id='addKnWindow'></div>",
                "</div>",
                "</div>",
            ].join("")).appendTo($page);
        }

        function initGrid() {
            //var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
            $page.find("#skill").datagrid({
                columns: [[
                    {field: 'checkBox', checkbox: true, width: '3%'},
                    {
                        field: 'operation', title: '操作', width: '20%', formatter: function (value, row, index) {
                            var Action = ""
                            if (row.KNWLGSTSCD != '3E') {
                                Action += '<a id="edit' + row.KNWLGID + '" knwlgGathrTypeCd="' + row.KNWLGGATHRTYPECD + '" class="editDoc link-blue" href="javascript:;">修改</a> |  ';
                            }
                            if (row.LOCKPRSNID) {
                                Action += '<a id="Lock' + row.KNWLGID + '" class=\'unLock link-blue\' href=\'javascript:;\'>解锁</a> |  ';
                            }
                            if(row.KNWLGGATHRTYPECD == "1"){
                                Action += '<a id="addSim' + row.KNWLGID + '"tmpltId ="'+row.TMPLTID+'" class="addSim link-blue" href="javascript:;">添加相似</a> |  ';
                            }
                            Action+="<a href='javascript:;' class='deleteKnlg link-blue'name ='deleteBtn' id ='del"+ row.KNWLGID +"_"+row.VERNO+"'>删除</a>  |  " +
                                "<a href='javascript:;' class='commitKnlg link-blue' id ='sub" + row.KNWLGID + "'>提交</a>  |  "
                            return Action;

                        }
                    },
                    {field: 'KNWLGID', title: '知识ID', width: '15%'},
                    {field: 'KNWLGNM', title: '知识标题', width: '12%'},
                    {field: 'REGNNM', title: '知识地区', width: '5%'},
                    {
                        field: 'CHNLCODE', title: '知识渠道', width: '10%', formatter: function (value, row, index) {
                            var chnlCodeNms = "";
                            if (value) {
                                var chnlCodes = value.split(",");
                                for (var i = 0; i < chnlCodes.length; i++) {
                                    chnlCodeNms += "," + chnlCodeNm[chnlCodes[i]];
                                }
                            }
                            return chnlCodeNms.length > 0 ? chnlCodeNms.substr(1) : "";
                        }
                    },
                    {field: 'OPPRSNID', title: '最近采编人', width: '6%'},
                    {field: 'MODFTIME', title: '编辑时间', width: '10%'},
                    {field: 'TMPLTNM', title: '采编模板', width: '11%'},
                    {
                        field: 'KNWLGGATHRTYPECD', title: '知识类型', width: '8%', formatter: function (value, row, index) {
                            return knwlgGathrTypeNm[value];
                        }
                    },
                    {
                        field: 'KNWLGSTSCD', title: '知识状态', width: '8%', formatter: function (value, row, index) {
                            return knwlgStsNm[value];
                        }
                    },
                    {
                        field: 'OPSTSCD', title: '操作类型', width: '5%', formatter: function (value, row, index) {
                            return opStsNm[value];
                        }
                    }
                ]],
                fitColumns: true,
                height: 420,
                pagination: true,
                pageSize: 10,
                pageList: [10, 20, 50],
                rownumbers: true,
                singleSelect: false,
                checkOnSelect: false,
                autoRowHeight: false,
                selectOnCheck: true,
                onClickCell: function (rowIndex, field, value) {
                    IsCheckFlag = false;
                },
                onSelect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#evaluManage").datagrid("unselectRow", rowIndex);
                    }
                },
                onUnselect: function (rowIndex, rowData) {
                    if (!IsCheckFlag) {
                        IsCheckFlag = true;
                        $("#evaluManage").datagrid("selectRow", rowIndex);
                    }
                },
                loader: function (param, success) {
                    //var start = (param.page - 1) * param.rows + 1;
                    var start = param.page;
                    var pageNum = param.rows;
                    var params = $.extend({
                        "startIndex": start,
                        "pageNum": pageNum,
                        "sort": param.sort,
                        "order": param.order
                    }, Util.PageUtil.getParams($search));

                    Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocEdit/getKmDocEditList", params, function (result) {
                        var data = Transfer.DataGrid.transfer(result)
                        success(data);
                        //enable查询按钮
                        $search.find("a.btn-green").linkbutton({disabled: false});
                    });
                },
                onLoadSuccess:function(){
                    $(".editDoc").click(function () {
                        editDoc(this.id.substring(4), $(this).attr("knwlgGathrTypeCd"), provnce);
                    });
                }
            });
            $page.find("a.btn").linkbutton();
        }

        /**
         * 初始化全局事件
         */
        function initGlobalEvent() {
            /*
             * 查询事件
             */
            $search.on("click", "a.btn-green", function () {
                if ($(this).linkbutton("options").disabled) {
                    return;
                }
                $(this).linkbutton({disabled: true});
                $page.find("#skill").datagrid("load");
            });

            /*
             * 清除查询条件
             */
            $search.on("click", "a.btn-default", function () {
                $search.find('form.form').form('clear');

            });

            /*
             * 批量删除
             */
            $("#batchDelKnwlg").click(function () {
                var selectKnwlg = $("#skill").datagrid('getSelections');
                if (selectKnwlg && selectKnwlg.length > 0) {
                    var knwlgIds = "";
                    for (var i = 0; i < selectKnwlg.length; i++) {
                        knwlgIds += "," + selectKnwlg[i].knwlgId;
                    }
                    $.messager.confirm("width:900", "提示", "是否确认删除此知识？", function (obj) {

                    });
                } else {
                    $.messager.alert("未选中需要删除的知识");

                }
            });

            /**
             * 绑定新增普通知识事件
             */
            $knowledge.on("click", "#addSimpleKnwlg", function () {
                addNormalKnowledgeAction();
                initTableEvent();
            });

            //绑定删除按钮事件
            $page.on("click", ".deleteKnlg", function () {
                var thisDelBtn = $(this);
                $.messager.confirm('确认删除弹窗', '您确定要删除这条知识记录吗？', function (confirm) {
                    if (confirm) {
                        var param = thisDelBtn.attr('id').substr(3);
                        var separate_param = param.split("_");
                        var paramaster = {"knwlgId": separate_param[0], "verno": separate_param[1]};
                        var params = {
                            "knwlgId":paramaster.knwlgId ,
                            "verno":paramaster.verno,

                        }
                        Util.ajax.deleteJson(Util.constants.CONTEXT + "/kmDocEdit/deleteKnwlgIdByPrimaryKey?knwlgId="+paramaster.knwlgId+"&verno="+paramaster.verno,null, function (result) {
                            //刷新节点
                            $.messager.alert('提示', '删除成功！');
                            $page.find("#skill").datagrid("load");
                            //  alert(result.RSP.RSP_DESC);
                        });
                    }
                });
            });



        }

    /**
     * 知识修改
     *
     * @param knwlgId
     */
    var editDoc = function (knwlgId, knwlgGathrTypeCd, userProvnce) {
        Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocEdit/isCanUpdate", {knwlgId: knwlgId}, function (data) {
            if (data.RSP.RSP_CODE == "1") {
                if (knwlgGathrTypeCd == "1" || userProvnce == "000") {
                    window.open("http://localhost:8080/html/manage/docEditMain.html?klgId=" + knwlgId);
                } else {
                    window.open("http://localhost:8080/html/manage/docEditMain.html?acceptPrePub=true&klgId=" + knwlgId);
                }
            } else {
                $.messager.alert(data.RSP.RSP_DESC);
            }
        }, true);
    };



    return {
            initialize: initialize
        };

    }
);
