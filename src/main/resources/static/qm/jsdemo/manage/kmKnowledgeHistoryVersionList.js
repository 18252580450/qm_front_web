define(["jquery", "loading", 'util', "transfer", "easyui", 'ztree-exedit', "js/manage/versioncompared"],
    function ($, Loading, Util, Transfer, easyui, ztree, versioncompared) {
    /**
     * 初始化
     */
    var $page;

    //对比栏数据
    var compareData ;

    initialize();

    function initialize() {
        console.log("进入js");
        $page = $("<div></div>").appendTo($("#page_content"));
        //初始化布局
        initlibLayout();
        //初始化列表
        initGrid();
        // //初始化标签目录(树结构)
        // initMenuTree();
        initGlobalEvent();
    };

    function initlibLayout() {
        $search = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>历史版本</div>",
            "</div>",
            "</div>",
            "</div>",
            "<div class='panel-search'>",
            "<input type='text' class='easyui-searchbox' name='searchInput'  placeholder='搜索知识...'  style='width:50%;height:30px' >",
            "<a href='javascript:void(0)' class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a>",
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>历史版本列表</div>",
            "<div></div>",
            "</div>",
            "</div>",
            "<table id='versionHistoryGrid' class='easyui-datagrid'  style=' width:98%;'>",
            "</table>"

        ].join("")).appendTo($page);
    }

    function initGrid() {
        $("#page_content").find("#versionHistoryGrid").datagrid({
            columns: [[
                {field: 'knwlgVerId', title: '版本ID ', hidden: true},//, hidden: true
                {field: 'knwlgId', title: '知识ID ', hidden: true},
                {
                    field: 'knwlgNm', title: '知识标题', width: '50%', id:'knwlgNm',
                    formatter: function (value, row) {
                        var content = '<li title="' + value + '" class="tip">' + value + '</li>';
                        return content;
                    }

                },
                {field: 'verno', title: '版本 ', width: '9%',},
                {field: 'editReason', title: '修改原因', width: '20%'},
                {field: 'modfTime', title: '发布时间', id : 'modfTime',  width: '10%'},//发布时间就是修改的时间
                {
                    field: 'operation', title: '操作', width: '10%',
                    formatter: function (value, row, index) {
                        var mass = {'verId':row.knwlgVerId,'verNo':row.verno,'knwlgNm':row.knwlgNm};
                        var sensStr = JSON.stringify(mass);

                        var Action = "<a href='javascript:void(0);' class='easyui-linkbutton' iconCls='icon-filter'  id =" + sensStr + ">加入对比</a>    ";
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
            //只能单选选项
            singleSelect: true,
            autoRowHeight: false,
            //一行的提示框
            onLoadSuccess: function (data) {
                $(".tip").tooltip({
                    onShow: function () {
                        $(this).tooltip('tip').css({
                            width: '300',
                            boxShadow: '1px 1px 3px #292929'
                        });
                    },
                });
            },
            onClickCell:function(row,index) {

                if (index == "knwlgNm") {  //点击知识标题跳转详情页
                    window.open("../../html/manage/knowledgeCompare.html?ids=180606094235000148,180611114259000190&verNos=V1,V1");
                }
            },

            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var knowledgeName = $search.find("input.easyui-searchbox[name='searchInput']").val();
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum,
                }, {klgId: 123456789, scope: 000});//默认一个假数据
                $.ajax({
                    url: Util.constants.CONTEXT + "/kmKlgHistoryVersion/getKlgHisVersionList",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (result) {
                        var flag = result.RSP.RSP_CODE;//请求返回码
                        var des = result.RSP.RSP_DESC;//请求返回描述
                        var mydata = new Array();
                        var data = result.RSP.DATA;
                        compareData = data;
                        // //继续查询修改原因
                        // for (var i = 0; i < data.length; i++) {
                        //     var itemData = data[i];
                        //     console.log("for:" + data[i]);
                        //     var param = {
                        //         knwlgId: itemData.knwlgId,
                        //         knwlgVerId: itemData.knwlgVerId,
                        //         versionNo: itemData.verno,
                        //         modfTime: itemData.modfTime
                        //     };
                        //     $.ajax({
                        //         type: "POST",
                        //         data: param,
                        //         dataType: "json",
                        //         url: Util.constants.CONTEXT + '/kmDocVersionManage/getKmDocVersionNoMes',
                        //         success: function (datas) {
                        //             var updateReason;//修改原因
                        //             if (datas.editReason == undefined || datas.editReason == null) {
                        //                 updateReason = "";
                        //             } else {
                        //                 updateReason = datas.editReason;
                        //             }
                        //             console.log(updateReason);
                        //             var tep="第" + i + "次";
                        //             itemData['updateReason'] =tep ;
                        //             mydata[i]=itemData;
                        //         }, error: function (datas) {
                        //             return;
                        //         }
                        //     });
                        // }
                        success(data);
                        // success(mydata);
                    },
                    error: function (result) {
                        console.log(result);
                    }
                });
            }
        });
    }

    //初始化按钮点击事件
    function initGlobalEvent() {
        //加入对比按钮事件
        versioncompared.initialize(compareData);
    }

});