define(["jquery", "util", "multiMediaInteractive", "multiMediaConfigAdd", "easyui", 'ztree-exedit'], function ($, Util, Interactive, Add) {

    var $search;
    var $multiMediaLayout;
    var currentSelectRow;
    var $upload;
    var catalogTree;

    var initialize = function (options) {
        catalogTree = options.catalogTree;
        $multiMediaLayout = $("#multiMediaLayout");
        addSearchForm();
        initSearchForm();
        bindSearchEvent();
        addGridDom();
        initGrid();
        bindGridEvent();
    };

    function getCurrentSelectCatalog() {
        return catalogTree.getCurrentSelectCatalog();
    }

    function bindGridEvent() {
        /**
         * 新建素材
         */
        $multiMediaLayout.on('click', '#createMultiMedia', function () {
            showMultilMediaDialog(true);
        });

        /**
         * 绑定编辑多媒体素材事件
         */
        $multiMediaLayout.delegate("a.editBtn", "click", function () {
            showMultilMediaDialog(false);
        });

        /**
         * 绑定删除多媒体素材事件
         */
        $multiMediaLayout.delegate("a.deleteBtn", "click", function () {
            var options = {
                "tip": "确定要删除该模板吗?",
                "multiMediaIds": currentSelectRow.MEDIAID,
                "multiMediaInfos": [currentSelectRow]
            };
            batchDeleteMultiMedia(options);
        });
    }

    function batchDeleteMultiMedia(options) {
        $.messager.confirm('温馨提示', options.tip, function (option) {
            if (option) {
                Interactive.deleteMultiMediaInfo(options, deleteNodeSuccess);
            }
        });
    }

    function deleteNodeSuccess(multiMediaInfos) {
        $.each(multiMediaInfos, function (index, template) {
            var index = $multiMediaLayout.find("#multiMediaGrid").datagrid('getRowIndex', template);
            $multiMediaLayout.find("#multiMediaGrid").datagrid('deleteRow', index);
        });
    }

    function initSearchForm() {
        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });
    }

    function bindSearchEvent() {
        /*
         * 绑定查询事件
        */
        $search.on("click", "a.btn-green", function () {
            if ($(this).linkbutton("options").disabled) {
                return;
            }
            if (!verifyClause()) {
                return;
            }
            var clause = getSearchClause();
            Interactive.getMultiMediaInfosByClause(clause, refreshGrid);

        });

        /*
        * 绑定重置事件
        */
        $search.on("click", "a.btn-default", function () {
            $multiMediaLayout.find("#multiMediaSearch").form('clear');
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
    }

    function refreshGrid(array) {
        $multiMediaLayout.find("#multiMediaGrid").datagrid("loadData", array);
    }

    function verifyClause() {
        if (null == getCurrentSelectCatalog()) {
            $.messager.alert("温馨提示", "请先选择多媒体素材目录");
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
            "MEDIABUSITYPE": (getCurrentSelectCatalog()).id,
            "MEDIANM": $("#multiMediaName").textbox("getValue").trim(),
            "CREATEUSER": $("#editor").textbox("getValue").trim(),
            "CREATETIME": $("#createTime").datetimebox("getValue").trim(),
            "UPDATETIME": $("#modifyTime").datetimebox("getValue").trim()
        };
    }

    function initGrid() {
        $multiMediaLayout.find("#multiMediaGrid").datagrid({
            columns: [[
                {field: 'checkBox', title: '复选框', width: '5%', checkbox: 'true', align: 'center', halign: 'center'},
                {
                    field: 'MEDIANM', title: '素材名称', width: '15%', align: 'center', halign: 'center',
                    formatter: function (value, row, index) {
                        return generateToolBar(value);
                    }
                },
                {
                    field: 'MEDIATYPE', title: '素材类型', width: '15%', align: 'center', halign: 'center',
                    formatter: function (value) {
                        return generateToolBar(value);
                    }
                },
                {
                    field: 'FLAG',
                    title: '素材状态',
                    sortable: true,
                    width: '15%',
                    align: 'center',
                    halign: 'center',
                    formatter: function (value) {
                        return generateToolBar(Util.constants.STATUS[value]);
                    },
                    sorter: function (a, b) {
                        return a < b ? 1 : -1;
                    }
                },
                {
                    field: 'CREATEUSER', title: '素材创建人', width: '15%', align: 'center', halign: 'center',
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
            height: parseInt($("#multiMediaManage").css("height")) - 45,
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
            idField: "MEDIAID",
            onSortColumn: function (sort, order) {

            },
            onSelect: function (index, row) {
                currentSelectRow = row;
            },
            loader: function (param, success) {
                /*var params = $.extend({
                    "startIndex": (param.page - 1) * param.rows + 1
                    "pageNum": param.rows,
                    "catalogId": null == getCurrentSelectCatalog() ? 1 : getCurrentSelectCatalog().id,
                    "sort": param.sort,
                    "order": param.order
                }, Util.PageUtil.getParams($search));*/
                var catalogId = null == getCurrentSelectCatalog() ? 1 : getCurrentSelectCatalog().id;
                Interactive.getTemplateByCatalogId(catalogId, success);
            }
        });
    }

    function generateToolBar(value) {
        return "<span title='" + value + "'>" + value + "</span>";
    }

    function addSearchForm() {
        $search = $([
                "<div id='multiMediaSearch' class='panel-search'>",
                "<form class='form form-horizontal' style='margin-left: 5%;'>",
                "<div class='row cl rowMargin'>",
                "<label class='form-label col-1 text_omission' title='素材名称'>素材名称</label>",
                "<div class='formControls col-4'>",
                "<input type='text' id='multiMediaName' class='easyui-textbox' data-options=\"prompt: '请输入素材名称'\" name='skillName' style='width:100%;height:30px'>",
                "</div>",
                "<label class='form-label col-2 text_omission' title='素材创建人'>素材创建人</label>",
                "<div class='formControls col-4'>",
                "<input type='text' id='editor' class='easyui-textbox' data-options=\"prompt: '请输入素材创建人'\"  name='skillName'style='width:100%;height:30px' >",
                "</div>",
                "</div>",
                "<div class='row cl rowMargin'>",
                " <label class='form-label col-1 text_omission'  title='创建时间'>创建时间</label>",
                " <div class='formControls col-4'>",
                "  <input id='createTime' class='easyui-datetimebox' label='Start Date:' labelPosition='top'style='width:100%;height:30px' data-options=\"prompt: '请选择'\">",
                "  </div>",
                "  <div class='form-label col-2 text_omission'  title='截止时间'>截止时间</div>",
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
        ).appendTo($("#multiMediaSearchLayout"));
        $(document).find($("#multiMediaSearchLayout")).layout();
    }

    function addGridDom() {
        $([
                "<div class='cl' style = 'height:42px;width:100%'>",
                "<div class='panel-tool-box cl'>",
                "<div class='fr'>",
                "<a href='javascript:void(0)' id='createMultiMedia' class='btn btn-secondary radius mt-l-20'>",
                "<i class='iconfont iconfont-add'  ></i>新建素材</a>",
                "</div>",
                "</div>",
                "</div>",
                "</div>",
                "<table id='multiMediaGrid' class='easyui-datagrid'  style=' width:100%;'>",
                "</table>",
                "</div>",
                "<div id='window'></div>",
                "</div>"
            ].join("")
        ).appendTo($("#multiMediaManage"));
    }

    function showMultilMediaDialog(isCreate) {
        var catalog = getCurrentSelectCatalog();
        if (null == catalog) {
            $.messager.alert('温馨提示', '请先选择多媒体素材目录');
            return;
        }
        if (!isCreate && null == currentSelectRow) {
            $.messager.alert('温馨提示', '请先选择要编辑的多媒体素材');
            return;
        }
        var options = {
            interactive: Interactive,
            windowId: "window",
            catalogId: catalog.id,
            title: isCreate ? "新建多媒体素材" : "编辑多媒体素材",
            isCreate: isCreate,
            checkedMultiMedia: currentSelectRow
        };
        Add.showMultiMediaDialog(options);
    }

    return {
        initialize: initialize,
        refreshGrid: refreshGrid
    }
});