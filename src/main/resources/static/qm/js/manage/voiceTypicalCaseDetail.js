require(["jquery", 'util', "transfer", "commonAjax", "dateUtil", "easyui", "audioplayer"], function ($, Util, Transfer, CommonAjax) {

    var caseInfo;  //案例信息

    initialize();

    function initialize() {
        CommonAjax.getUrlParams(function (data) {
            caseInfo = data;
            initPageInfo();
            initEvent();
        });
    }

    //页面信息初始化
    function initPageInfo() {

        //典型案例列表
        var IsCheckFlag = true; //标示是否是勾选复选框选中行的，true - 是 , false - 否
        $("#typicalCaseList").datagrid({
            columns: [[
                {field: 'ck', checkbox: true, align: 'center'},
                {
                    field: 'operate', title: '操作', width: '8%',
                    formatter: function (value, row, index) {
                        var play = '<audio id="voicePlay_' + row.touchId + '" src=' + row.recordPath + ' preload="auto"></audio>',
                            audio = '<a href="javascript:void(0);" class="list_operation_color" id = "voicePlay_' + row.touchId + '">播放</a>',
                            download = '<a href="javascript:void(0);" class="list_operation_color" id = "voiceDownload_' + row.touchId + '">下载</a>';
                        if (row.recordPath != null && row.recordPath !== "") {
                            return '<div style="display: flex">' + play + "&nbsp;&nbsp;" + download + '</div>';
                        } else {
                            return '<div style="display: flex">' + audio + "&nbsp;&nbsp;" + download + '</div>';
                        }
                    }
                },
                {
                    field: 'touchId', title: '语音流水', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'caseTitle', title: '案例标题', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'createReason', title: '添加原因', width: '15%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'staffName', title: '坐席', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'departName', title: '班组', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'staffNumber', title: '坐席号码', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                },
                {
                    field: 'customerNumber', title: '客户号码', width: '10%',
                    formatter: function (value, row, index) {
                        if (value) {
                            return "<span title='" + value + "'>" + value + "</span>";
                        }
                    }
                }
            ]],
            fitColumns: true,
            width: '100%',
            height: 580,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 20, 50],
            rownumbers: false,
            checkOnSelect: false,
            onClickCell: function (rowIndex, field, value) {
                IsCheckFlag = false;
            },
            onSelect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#typicalCaseList").datagrid("unselectRow", rowIndex);
                }
            },
            onUnselect: function (rowIndex, rowData) {
                if (!IsCheckFlag) {
                    IsCheckFlag = true;
                    $("#typicalCaseList").datagrid("selectRow", rowIndex);
                }
            },
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows,
                    pageNum = param.rows;

                var reqParams = {
                    "checkType": caseInfo.checkType,
                    "caseType": caseInfo.caseType
                };
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                    "params": JSON.stringify(reqParams)
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + Util.constants.TYPICAL_CASE_DNS + "/queryTypicalCaseDetail", params, function (result) {
                    var data = {rows: [], total: 0},
                        rspCode = result.RSP.RSP_CODE;
                    if (rspCode === "1") {
                        data = Transfer.DataGrid.transfer(result);
                    } else {
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
            onLoadSuccess: function (data) {
                $.each(data.rows, function (i, item) {
                    //语言播放
                    var voicePlay = $("#voicePlay_" + item.touchId);
                    if (item.recordPath != null && item.recordPath !== "") {
                        //语言播放初始化
                        voicePlay.audioPlayer(
                            {
                                classPrefix: 'audioplayer',
                                strPlay: '播放',
                                strPause: '暂停',
                                strVolume: '音量'
                            }
                        );
                    } else {
                        voicePlay.on("click", function () {
                            $.messager.alert("提示", "未找到录音地址!");
                        });
                    }
                    //语音下载
                    $("#voiceDownload_" + item.touchId).on("click", function () {
                        if (item.recordPath == null || item.recordPath === "") {
                            $.messager.alert("提示", "未找到录音地址!");
                        } else {
                            window.location.href = Util.constants.CONTEXT + Util.constants.WRKFM_DETAIL_DNS + "/recordDownload" + '?ftpPath=' + item.recordPath;
                        }
                    });
                });
            }
        });
    }

    //事件初始化
    function initEvent() {
        //删除
        $("#delBtn").on("click", function () {
            caseDeleteDialog();
        });
    }

    /**
     * 删除确认弹框
     */
    function caseDeleteDialog() {
        var delRows = $("#typicalCaseList").datagrid("getSelections");
        if (delRows.length === 0) {
            $.messager.alert("提示", "请至少选择一行数据!");
            return;
        }
        var delArr = [];
        for (var i = 0; i < delRows.length; i++) {
            var id = delRows[i].caseId;
            delArr.push(id);
        }
        var params = {
            "delType": "1",  //删除具体案例
            "delArr": delArr
        };
        $.messager.confirm('确认删除弹窗', '确定要删除吗？', function (confirm) {
            if (confirm) {
                Util.ajax.deleteJson(Util.constants.CONTEXT.concat(Util.constants.TYPICAL_CASE_DNS).concat("/"), JSON.stringify(params), function (result) {
                    $.messager.show({
                        msg: result.RSP.RSP_DESC,
                        timeout: 1000,
                        style: {right: '', bottom: ''},     //居中显示
                        showType: 'show'
                    });
                    var rspCode = result.RSP.RSP_CODE;
                    if (rspCode != null && rspCode === "1") {
                        $("#typicalCaseList").datagrid("load"); //删除成功后，刷新页面
                    }
                });
            }
        });
    }

    //质检详情弹框
    function showCheckDetail(title, item, url, width, height) {
        var param = {
            "provinceId": item.provinceId,
            "touchId": item.touchId
        };
        var checkUrl = CommonAjax.createURL(url, param);
        CommonAjax.showDialog(checkUrl, title, width, height);
    }

    return {
        initialize: initialize
    };
});