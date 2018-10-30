define(["jquery", 'util', "catalogTemplateInteractive", "easyui", 'ztree-exedit'], function ($, Util, Interactive) {

    var $search;
    var $templateLayout;
    var currentSelectRow;
    var $upload;
    var catalogTree;

    var initialize = function (options) {
        catalogTree = options.catalogTree;
        $templateLayout = $("#templateLayout");
        addSearchForm();
        initSearchForm();
        bindTempletSearchEvent();
        addTemplateManageGridDom();
        initTempletGrid();
        bindTempletManageEvent();
    };

    function getCurrentSelectCatalog() {
        return catalogTree.getCurrentSelectCatalog();
    }

    function bindTempletManageEvent() {
        //绑定修改事件
        $templateLayout.delegate("a.editBtn", "click", function () {
            window.open("../../html/manage/tmpltDetails.html?tmpltId=" + currentSelectRow.TMPLTID);  //打开新增模板页面
        });

        //绑定隐藏事件
        $templateLayout.delegate("a.hideBtn", "click", function () {
            var setTmpltStsCd;
            if (currentSelectRow.TMPLTSTSCD == "2") {
                setTmpltStsCd = "1";
            }         //
            else {
                setTmpltStsCd = "2";
            }
            Util.ajax.putJson(Util.constants.CONTEXT + "/catalog/templates/tmpltinfo", {
                tmpltId: currentSelectRow.TMPLTID,
                tmpltStsCd: setTmpltStsCd
            }, function (result) {
                if (result.STATUS == "0000") {
                    $("#templateGrid").datagrid("load");
                }
            }, true);
        });
        /**
         * 绑定删除模板事件
         */
        $templateLayout.delegate("a.deleteBtn", "click", function () {
            var options = {
                "tip": "确定要删除该模板吗?",
                "templateIds": "",
                "templateInfos": ""
            };
            batchDeleteTemplate(options);
        });

        /**
         * 批量删除模板
         */
        $templateLayout.on("click", "#batchDeleteTemplet", function () {
            var checkedTemplates = $templateLayout.find("#templateGrid").datagrid("getChecked");
            if (checkedTemplates.length == 0) {
                $.messager.alert("温馨提示", "请至少选择一个要删除的模板");
            }
            var templateIds = "";
            $.each(checkedTemplates, function (index, template) {
                templateIds = templateIds.concat(template.TMPLTID);
                templateIds = templateIds.concat(",");
            });
            templateIds = templateIds.slice(0, templateIds.length - 1);
            var options = {
                "tip": "确定要删除这" + checkedTemplates.length + "条模板吗?",
                "templateIds": templateIds,
                "templateInfos": checkedTemplates
            };
            batchDeleteTemplate(options);
        });

        $templateLayout.on("click", "#createTemplate", function () {
            $("#editTempletWindow").empty();
            initEditTempletWindow();
        });

        function initEditTempletWindow() {
            window.open("../../html/manage/tmpltDetails.html");  //打开新增模板页面
        }

        /**
         * 绑定导入模板事件
         */
        $templateLayout.on("click", "#importTemplate", function () {
            var options = {
                width: 600,
                height: 200,
                title: "导入模板",
                windowId: "channelWindow",
                contentId: "fileUpload"
            };
            showWindow(options);
            $("<div id='" + options.contentId + "' style='height: 100%;text-align:center; margin:0 auto; line-height:100%'></div>").appendTo($("#" + options.windowId));
            addUploadDom(options);
            $upload.find("#onlineFileName").filebox({
                title: "234",
                buttonText: '选择文件',
                prompt: '请选择上传的模板文件',
                buttonAlign: 'right',
                accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
            });
            $upload.find("#onlineFileName").textbox("textbox").attr("title", "仅支持xlsx、xls文件格式");
            $upload.on("click", "#btn-upload", function () {
                var file = $upload.find("#onlineFileName").filebox("getValue");
                var fileType = file.slice(file.lastIndexOf(".") + 1, file.length);
                if (fileType.length == 0) {
                    $.messager.alert("温馨提示", "请选择上传文件");
                    return;
                }
                if (["xlsx", "xls"].indexOf(fileType) == -1) {
                    $.messager.alert("温馨提示", "文件类型有误, 请重新上传文件");
                    return;
                }
                Interactive.uploadFileAction({"$uploadForm": $("#upload-form")}, uploadSuccessAction, existErrorAction);
            });
        });
    }

    function uploadSuccessAction(templetInfoList) {
        $upload.find("#onlineFileName").filebox("clear");
        $templateLayout.find("#templateGrid").datagrid("loadData", templetInfoList);
        $("a.panel-tool-close").click();
    }

    function existErrorAction(errorMessage) {
        var handledErrorMessage;
        $.each(errorMessage.split(";"), function (index, ele) {
            handledErrorMessage.concat(ele);
            handledErrorMessage.concat("<br>");
        });
        $.messager.alert("温馨提示", errorMessage);
    }

    function addUploadDom(options) {
        var downloadUrl = Util.constants.CONTEXT.concat(Util.constants.TEMPLET_DETAIL_DNS).concat("/info/download");
        $upload = $([
            "<form id='upload-form' method='post' enctype='multipart/form-data' style='height: 100%;'>",
            "<div class='panel-search' style='height: 100%;padding-top: 70px;'>",
            "<input id='onlineFileName' name='templateFile' class='easyui-tooltip easyui-filebox ' type='text' style='width:70%' title=''>",
            "<a href='javascript:void(0)' id='btn-upload' class='btn btn-green radius  mt-l-20'>上传</a>",
            "<a href='" + downloadUrl + "' style='margin-left: 5px;'>下载样例文件</a>",
            "</div>",
            "</form>"
        ].join("")).appendTo($("#" + options.contentId));
    }

    function batchDeleteTemplate(options) {
        $.messager.confirm('温馨提示', options.tip, function (option) {
            if (option) {
                Interactive.deleteTemplateInfo(options, deleteNodeSuccess);
            }
        });
    }

    function deleteNodeSuccess(templateInfos) {
        $.each(templateInfos, function (index, template) {
            var index = $templateLayout.find("#templateGrid").datagrid('getRowIndex', template);
            $templateLayout.find("#templateGrid").datagrid('deleteRow', index);
        });
    }

    function initSearchForm() {
        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });
        //Interactive.getSuitableOfDistrictList(getSuiteRegionSuccess);
    }

    function getSuiteRegionSuccess(regionList) {
        var regionNodes = [];
        $.each(regionList, function (index, region) {
            regionNodes.push({
                "id": region.REGNID,
                "text": region.REGNNM
            });
        });
        var regionTree = {
            "id": "0",
            "text": "适用地区",
            "state": "open",
            "children": regionNodes
        };
        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });
        initSuitableRegionComboTree(regionTree);
        initChannelTextBox(
            {
                "$textBox": $search.find("#channel"),
                "windowId": "channelWindow",
                "contentId": "channelTree",
                "footerId": "footer"
            }
        );
    }

    function showWindow(options) {
        $("#" + options.windowId).show().window({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            tools: [
                {
                    iconCls: 'icon-ok',
                    handler: function () {
                    }
                }, {
                    iconCls: 'icon-cancel',
                    handler: function () {
                    }
                }]
        });
    }

    function initChannelTree(options) {
        var channelType = 'NGKM.TEMPLET.CHNL';
        Interactive.getStaticDataByTypeId(channelType, getChannelSuccess);
    }

    function getChannelSuccess(channelList) {
        var channelNodes = [];
        var selectedChannelStr = options.$textBox.textbox("getValue").trim();
        var selectedChannelArr = selectedChannelStr.length == 0 ? [] : selectedChannelStr.split(",");
        $.each(channelList, function (index, channel) {
            var channelChecked = false;
            if (selectedChannelArr.length == 0 || selectedChannelArr.indexOf(channel.CODENAME) != -1) {
                channelChecked = true;
            }
            channelNodes.push({
                "id": channel.CODEVALUE,
                "text": channel.CODENAME,
                "checked": channelChecked,
                "iconCls": "icon-ok"
            });
        });
        $("#" + options.contentId).tree({
            url: "",
            queryParams: {},
            method: "GET",
            animate: true,
            lines: true,
            textField: 'json',
            panelHeight: '110px',
            editable: false,
            checkbox: true,
            onCheck: function (node) {

            },
            loadFilter: function (data, parent) {
                return data;
            },
            loader: function (param, success, error) {
                success(channelNodes);
            }
        });
    }

    function addWindowFooter(options) {
        $("<div id='" + options.contentId + "' style='height: 80%;'></div><div id='" + options.footerId + "'></div>").appendTo($("#" + options.windowId));
        $([
            "<div>",
            "<a href='javascript:void(0)' id='sureChannel' class='btn btn-green radius  mt-l-20'>确定</a>",
            "<a href='javascript:void(0)' id='cancelChannel' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>"
        ].join("")).appendTo($("#" + options.footerId));
    }

    function bindChannelTreeEvent(options) {
        /**
         * 绑定确认选择渠道事件
         */
        $("#" + options.footerId).on("click", "#sureChannel", function () {
            var checkNodes = $("#" + options.contentId).tree("getChecked");
            if (null == checkNodes || checkNodes.length == 0) {
                $.messager.alert("温馨提示", "请至少选择一个渠道");
                return;
            }
            var channelVal = "";
            $.each(checkNodes, function (index, node) {
                channelVal = channelVal.concat(node.text);
                channelVal = channelVal.concat(",");
            });
            channelVal = channelVal.slice(0, channelVal.length - 1);
            options.$textBox.textbox("setValue", channelVal);
            $("a.panel-tool-close").click();
        });

        /**
         * 绑定取消选择渠道事件
         */
        $("#" + options.footerId).on("click", "#cancelChannel", function () {
            $("a.panel-tool-close").click();
        });
    }

    function initChannelWindow(option) {
        var options = $.extend({
            width: 400,
            height: 300,
            title: "渠道"
        }, option);
        showWindow(options);
        addWindowFooter(options);
        initChannelTree(options);
        bindChannelTreeEvent(options);
    }

    var initChannelTextBox = function (option) {
        option.$textBox.textbox({
            buttonText: "选择",
            iconCls: 'icon-man',
            cls: "channelCode",
            onClickButton: function () {
                $("#" + option.windowId).empty();
                initChannelWindow(option);
            }
        });
    };

    function initSuitableRegionComboTree(regionTree) {
        $search.find('#suitableRegion').combotree({
            url: Util.constants.CONTEXT + "district/getSuitableOfDistrictList",
            queryParams: {"regionId": "000"},
            method: "GET",
            animate: true,
            lines: true,
            textField: 'json',
            panelHeight: 120,
            editable: true,
            loadFilter: function (data, parent) {
                return data;
            },
            loader: function (param, success, error) {
                success([regionTree]);
            }
        });
        var panel = $search.find('#suitableRegion').combotree("panel");
        panel.after($("<div class='combo_footer'><a href='javascript:void(0)' id='clearSelectRegion' class='treeButton radius  mt-l-20' >清除</a></div>"));
    }

    function bindTempletSearchEvent() {
        /*
         * 绑定查询事件，并加载查询出的模板数据
        */
        $search.on("click", "a.btn-green", function () {
            if ($(this).linkbutton("options").disabled) {
                return;
            }
            if (!verifyClause()) {
                return;
            }
            var clause = getSearchClause();
            Interactive.getKmTmpltInfoListByClause(clause, refreshTemplateGrid);

        });

        /*
        * 绑定重置模板条件事件
        */
        $search.on("click", "a.btn-default", function () {
            $templateLayout.find("#templateSearch").form('clear');
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

        /*
         * 绑定清除选中适用地区事件
        */
        $(".combo_footer").on("click", "#clearSelectRegion", function () {
            $search.find('#suitableRegion').combotree("clear");
            $search.find('#suitableRegion').combotree("hidePanel");
        });
    }

    function refreshTemplateGrid(array) {
        $templateLayout.find("#templateGrid").datagrid("loadData", array);
    }

    function verifyClause() {
        if (null == getCurrentSelectCatalog()) {
            $.messager.alert("温馨提示", "请先选择模板目录");
            return false;
        }
        var createTime = $("#createTime").datetimebox("getValue");
        var modifyTime = $("#modifyTime").datetimebox("getValue");
        if ((createTime.length != 0 && modifyTime.length != 0) && (new Date(createTime).getTime() > new Date(modifyTime).getTime())) {
            $.messager.alert("温馨提示", "请重新选择修改时间，修改时间不能晚于创建时间");
            return false;
        }
        return true;
    }

    function getSearchClause() {
        return {
            "CATLID": getCurrentSelectCatalog().id,
            "TMPLTNM": $("#templetName").textbox("getValue").trim(),
            /*"REGNID": $("#suitableRegion").combotree("getValue").trim(),
            "CHNLCODE": $("#channel").textbox("getValue").trim(),*/
            "CREATEUSER": $("#editor").textbox("getValue").trim(),
            "CREATETIME": $("#createTime").datetimebox("getValue").trim(),
            "UPDATETIME": $("#modifyTime").datetimebox("getValue").trim()
        };
    }

    function initTempletGrid() {
        $templateLayout.find("#templateGrid").datagrid({
            columns: [[
                {field: 'checkBox', title: '复选框', width: '5%', checkbox: 'true', align: 'center', halign: 'center'},
                {
                    field: 'TMPLTNM', title: '模板名称', width: '15%', align: 'center', halign: 'center',
                    formatter: function (value, row, index) {
                        return generateToolBar(value);
                    }
                },
                {
                    field: 'REMARK', title: '模板介绍', width: '15%', align: 'center', halign: 'center',
                    formatter: function (value) {
                        return generateToolBar(value);
                    }
                },
                {
                    field: 'TMPLTSTSCD',
                    title: '模板状态',
                    sortable: true,
                    width: '15%',
                    align: 'center',
                    halign: 'center',
                    formatter: function (value) {
                        if (value == 1) {
                            return generateToolBar("已审核");
                        }
                        else {
                            return generateToolBar("待审核");
                        }
                    },
                    sorter: function (a, b) {
                        return a < b ? 1 : -1;
                    }
                },
                {
                    field: 'CREATEUSER', title: '模板创建人', width: '15%', align: 'center', halign: 'center',
                    formatter: function (value, row, index) {
                        return generateToolBar(value);
                    }
                },
                {
                    field: 'CREATETIME',
                    title: '按时间排序',
                    sortable: true,
                    width: '20%',
                    align: 'center',
                    halign: 'center',
                    formatter: function (value, row, index) {
                        return generateToolBar(value);
                    },
                    sorter: function (a, b) {
                        return a > b ? 1 : -1;
                    }
                },
                {
                    field: 'action', title: '操作', width: '20%', align: 'center', halign: 'center',
                    formatter: function (value, row, index) {
                        var hideBtn;
                        if (row.TMPLTSTSCD == "2") {
                            hideBtn = "<a href='javascript:void(0);' class='hideBtn' id ='hide" + row.TMPLTID + "'>" + generateToolBar("取消隐藏") + "</a>  "
                        } else {
                            hideBtn = "<a href='javascript:void(0);' class='hideBtn' id ='hide" + row.TMPLTID + "'>" + generateToolBar("隐藏模板") + "</a>  "
                        }
                        return "<a href='javascript:void(0);' class='editBtn' id ='edit" + row.tmpltId + "'>" + generateToolBar("修改") + "</a>  | " +
                            "<a href='javascript:void(0);' class='deleteBtn' id ='del" + row.tmpltId + "'>" + generateToolBar("删除") + "</a>  |  " +
                            hideBtn;
                    }
                }
            ]],
            fitColumns: true,
            toolbar: "#tempalteGrid_Toolbar",
            width: "100%",
            height: parseInt($("#templateManage").css("height")) - 45,
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
            sortName: "CREATETIME",
            idField: "TMPLTID",
            onSortColumn: function (sort, order) {

            },
            onSelect: function (index, row) {
                currentSelectRow = row;
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows + 1;
                var pageNum = param.rows;
                var params = $.extend({
                    "startIndex": start,
                    "pageNum": pageNum,
                    "catalogId": null == getCurrentSelectCatalog() ? 1 : getCurrentSelectCatalog().id,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));
                var catalogId = null == getCurrentSelectCatalog() ? 1 : getCurrentSelectCatalog().id;
                Interactive.getTemplateByCatalogId(catalogId, success);
            }
        });
        addBatchDeleteDom();
    }

    function addBatchDeleteDom() {
        $(["<td><a href='javascript:void(0)' id='batchDeleteTemplet' class='btn btn-green radius  mt-l-20' ",
            "style='height: 24px;line-height: 1.42857;padding: 2px 6px;'>删除</a></td>"].join("")
        ).appendTo($templateLayout.find(".datagrid .datagrid-pager > table > tbody > tr"));
    }

    function generateToolBar(value) {
        return "<span title='" + value + "'>" + value + "</span>";
    }

    function addSearchForm() {
        $search = $([
                "<div id='templateSearch' class='panel-search'>",
                "<form class='form form-horizontal' id='templateSearchForm' style='margin-left: 5%;'>",
                "<div class='row cl rowMargin'>",
                "<label class='form-label col-1 text_omission' title='模板名称'>模板名称</label>",
                "<div class='formControls col-4'>",
                "<input type='text' id='templetName' class='easyui-textbox' data-options=\"prompt: '请输入模板名称'\" name='skillName' style='width:100%;height:30px'>",
                "</div>",
                "<label class='form-label col-2 text_omission' title='模板创建人'>模板创建人</label>",
                "<div class='formControls col-4'>",
                "<input type='text' id='editor' class='easyui-textbox' data-options=\"prompt: '请输入模板创建人'\"  name='skillName'style='width:100%;height:30px' >",
                "</div>",
                "</div>",
                "<div class='row cl rowMargin'>",
                " <label class='form-label col-1 text_omission'  title='创建时间'>创建时间</label>",
                " <div class='formControls col-4'>",
                "  <input id='createTime' class='easyui-datetimebox' label='Start Date:' labelPosition='top'style='width:100%;height:30px' data-options=\"prompt: '请选择'\">",
                "  </div>",
                "  <div class='form-label col-2 text_omission'  title='修改时间'>截止时间</div>",
                "  <div class='formControls col-4'>",
                "   <input id='modifyTime' class='easyui-datetimebox' label='ModifytDate:' labelPosition='top'style='width:100%;height:30px' data-options=\"prompt: '请选择'\">",
                " </div>",
                " </div>",
                "<div class='row cl formControls text-r' style='padding-right: 0%; margin-top: 10px;height:30px;'>",
                "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a>",
                "<a href='javascript:void(0)' class='btn btn-default radius mt-l-20 '><i class='iconfont iconfont-zhongzuo'></i>重置</a>",
                "</div>",
                "</form>",
                "<div id='channelWindow'></div>",
                "</div>"
            ].join("")
        ).appendTo($("#templateSearchLayout"));
        $(document).find("#templateSearchLayout").layout();
    }

    function addTemplateManageGridDom() {
        $([
                "<div class='cl' style = 'height:42px;width:100%'>",
                "<div class='panel-tool-box cl'>",
                "<div class='fr'>",
                "<a href='javascript:void(0)' id='createTemplate' class='btn btn-secondary radius mt-l-20'>",
                "<i class='iconfont iconfont-add'  ></i>新建模板</a>",
                "</div>",
                "<div class='fr'>",
                "<a href='javascript:void(0)' id='importTemplate' class='btn btn-secondary radius mt-l-20'>",
                "<i class='iconfont iconfont-upload'  ></i>导入模板</a>",
                "</div>",
                "</div>",
                "</div>",
                "</div>",
                "<table id='templateGrid' class='easyui-datagrid'  style=' width:100%;'>",
                "</table>",
                "</div>",
                "<div id='editTempletWindow'></div>",
                "</div>"
            ].join("")
        ).appendTo($("#templateManage"));
    }

    return {
        initialize: initialize,
        refreshTemplateGrid: refreshTemplateGrid,
        initChannelTextBox: initChannelTextBox
    }
});