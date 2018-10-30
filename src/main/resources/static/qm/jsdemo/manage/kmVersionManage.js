/**
 *qiuxiang3
 */
require(["jquery", "loading", 'util', "easyui"], function ($, Loading, Util) {
    var $page, $search;
    var hideState = 0;
    var showState = 1;
    var curVersionId;
    var knwlgId = "180512175213000080";
    /**
     * 初始化
     */
    initialize();

    function initialize() {
        $page = $("<div></div>").appendTo($("#page_content"));
        initSearchGrid();
        initVersionGrid();
        initGlobalEvent();
    }

    /**
     * 初始化版本管理
     */
    function initSearchGrid() {
        $search = $([
            "<div class='panel-search'>",
            "<form class='form form-horizontal'>",
            "<div class='row cl'>",
            "<div class='title'>",
            "    版本管理",
            "</div>",
            "<div class='ke-panel-content no-border-top'>",
            "<div id='kngNm' style='font-size: 14px;padding:10px 20px 10px 20px;height: 20px' class='items'>",
            "协同知识",
            "</div>",
            "</div>",
            "</div>",
            "</form>",
            "</div>"
        ].join("")).appendTo($page);
    }

    /**
     * 初始化表单
     */
    function initVersionGrid() {
        $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fr'>",
            "<a id='versionCompare' href='javascript:void(0)' class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-upload'></i>比较</a>",
            "</div>",
            "</div>",
            "</div>",
            "<table id='version' class='easyui-datagrid'  style=' width:100%;height:245px;'></table>"
        ].join("")).appendTo($page);
        $page.find("#version").datagrid({
            columns: [[
                {field: 'ck', checkbox: 'true', width: '5%'},
                {field: 'knwlgId', title: '知识id', hidden: true},
                {field: 'knwlgVerId', title: '版本id', hidden: true},
                {field: 'verno', title: '版本号', width: '10%',
                    formatter: function (value, column) {
                        var content = '<li title="' + value + '" class="tip">' + value + '</li>';
                        return content;
                    }
                },
                {field: 'respPrsnId', title: '修改人', width: '10%'},
                {field: 'modfTime', title: '编辑时间', width: '20%'},
                {field: 'editReason', title: '修改原因', width: '25%'},
                {
                    field: 'knwlgStsCd', title: '状态', width: '15%',
                    formatter: function (knwlgStsCd) {
                        if (knwlgStsCd == hideState) {
                            return "已隐藏";
                        } else {
                            return "未隐藏";
                        }
                    }
                },
                {
                    field: 'operate', title: '操作', width: '15%',
                    formatter: function (knwlgStsCd, column) {
                        if (column.knwlgStsCd == hideState) {
                            return "<a state='" + hideState + "' id='hide" + column.knwlgVerId + "' class='hideVersion' href='javascript:;'>取消隐藏</a>  |  " +
                                "<a id='back" + column.knwlgVerId + "' class='backVersion' href='javascript:;'>回退</a>";
                        } else {
                            return "<a state='" + showState + "' id='hide" + column.knwlgVerId + "' class='hideVersion' href='javascript:;'>隐藏</a>  |  " +
                                "<a id='back" + column.knwlgVerId + "' class='backVersion' href='javascript:;'>回退</a>";
                        }
                    }
                }
            ]],
            fitColumns: true,
            rownumbers: true,
            pagination: true,
            singleSelect: false,
            height: 420,
            pageSize: 10,
            pageList: [5, 10, 15, 20],
            onClickCell: function (column, index) {
                if (index == "verno") {  //点击版本号跳转详情页
                    var knwlgId=column.knwlgId;
                    var verNo=column.verno;
                    window.open("../../html/manage/knowledgeDetail.html?knwlgId="+knwlgId+"&verNo="+verNo+"&isPublished=1");  //打开版本详情页面
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                //var params = $.extend({"start": start, "pageNum": pageNum}, getParams($search));

                Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocVersionManage/getKmDocVersionList?knwlgId="+knwlgId, null, function (result) {
                    var data = result.RSP.DATA;
                    curVersionId = result.RSP.DATA[0].knwlgVerId;

                    var d = [];
                    for (var i = 0; i < data.length; ++i) {
                        d.push($.extend({'knwlgId': data[i]['knwlgId']},{'knwlgVerId': data[i]['knwlgVerId']}, {'verno': data[i]['verno']}, {'respPrsnId': data[i]['respPrsnId']}, {'modfTime': data[i]['modfTime']}, {'srcCode': data[i]['srcCode']}, {'editReason': data[i]['editReason']}, {'knwlgStsCd': data[i]['knwlgStsCd']}));
                    }
                    var dd = {"total": result.RSP.ATTACH.TOTAL, "rows": d};
                    success(dd);
                });
            }
        });
        $page.find("a.btn").linkbutton();
    }

    /**
     * 全局事件
     */
    function initGlobalEvent() {
        //绑定隐藏按钮事件
        $("#page_content").delegate("a.hideVersion", "click", function () {
            var thishideVersion = $(this);
            $.messager.confirm('Confirm', '您确定要隐藏此版本吗?', function (r) {
                if (r) {
                    var param = {};
                    param.knwlgVerId = thishideVersion.attr('id').substr(4);//版本id
                    param.knwlgStsCd = thishideVersion.attr('state');//版本状态
                    Util.ajax.putJson(Util.constants.CONTEXT + "/kmDocVersionManage/hideDocVersion", param, function (result) {
                        alert(result.RSP.RSP_DESC);
                        $page.find("#version").datagrid("reload");
                    });
                }
            })
        });

        //绑定回退按钮事件
        $("#page_content").on("click", "a.backVersion", function () {
            var thisbackVersion = $(this);
            $.messager.confirm('Confirm', '您确定要回退此版本吗？', function (r) {
                if (r) {
                    var param = {};
                    param.knwlgId = knwlgId;//知识id
                    param.knwlgVerId = thisbackVersion.attr('id').substr(4);//版本id
                    Util.ajax.getJson(Util.constants.CONTEXT + "/kmDocVersionManage/isCanBack", param, function (data) {
                        if (data.returnCode == 0) {
                            if (data.RSP.RSP_CODE == 1) {
                                alert("版本回退成功，请到草稿箱查看！");
                            } else {
                                alert("草稿箱或待审核中已存在当前知识草稿，不能回退");
                            }
                            // loading.destroy();
                        } else {
                            //loading.destroy();
                            alert("error" + data.returnMessage);
                        }
                    });
                }
            })
        });
        //绑定比较按钮事件
        $page.on("click", "#versionCompare", function () {
            var selections = $page.find("#version").datagrid('getSelections');
            if (selections.length == 2) {
                var param = {};
                param.leftKnwlgVerId = selections[0]['knwlgVerId'];
                param.rightKnwlgVerId = selections[1]['knwlgVerId'];
                window.open("../../html/manage/kmVersionCompare.html?leftKnwlgVerId=" + param.leftKnwlgVerId + "&rightKnwlgVerId=" + param.rightKnwlgVerId);  //打开版本对比页面

            } else {
                $.messager.alert('提示', '只能选择两个版本做比较！');
                return;
            }
        });
    }
});

