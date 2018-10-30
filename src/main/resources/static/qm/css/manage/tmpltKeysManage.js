/**
 * 技能配置样例
 */
/**
 * 技能配置样例
 */
require(["jquery", "transfer", "loading", 'util', "easyui", 'ztree-exedit', 'js/manage/configAtomAdd'], function ($, Transfer, Loading, Util, EasyUI, Ztree, ConfigAtomAdd) {
    var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';
    var newRow = {};
    var typeNm;
    var $upload;
    //初始化
    initialize();
    //initUpload();
    //initEvent();

    /**
     * 根据编码获取数据字典的内容，涉及渠道和分组属性类型
     * @param codeTypeCd
     * @returns result
     */
    function getsysCode(codeTypeCd) {
        var result = {};
        $.ajax({
            url: "marathon-lb-kc.skyark.mesos:9010/kmconfig/getSysBytypeCd?typeId=" + codeTypeCd,
            success: function (data) {

                for (var i = 0; i < data.RSP.DATA.length; i++) {
                    if (data.RSP.DATA[i].DATAVALUE !== null && data.RSP.DATA[i].DATANAME !== null) {
                        result[data.RSP.DATA[i].DATAVALUE] = data.RSP.DATA[i].DATANAME;
                    }
                }
            }
        });
        return result;
    };


    function initialize() {
        typeNm = getsysCode(para_type_cd);
        initSearchForm();
        initGrid();
        initGlobalEvent();
    };


    function initSearchForm() {
        $("#searchForm").find("a.btn").linkbutton();
        $("#searchForm").find("input.easyui-textbox").textbox();
        $("#searchForm").find("input.easyui-datetimebox").datetimebox();
        $("#searchForm").find("input.easyui-datetimebox").datetimebox({
            editable: false
        });

        //初始化评价类型下拉框
        /* var paraTypeCdUrl = Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId="+para_type_cd;
         $.ajax({
             url: paraTypeCdUrl,
             success: function (result) {
                 $("#searchForm").find("[name='paraTypeCd']").combobox({
                     //url:evaluTypeUrl,                             //返回的数据格式不符合要求，所以通过data来设置数据源
                     data:result.rows,
                     valueField: 'codeValue',
                     textField: 'codeName',
                     editable:false,
                     panelHeight:'auto'
                 });
             }
         });*/
        var paraTypeCdUrl = "marathon-lb-kc.skyark.mesos:9010/kmconfig/getSysBytypeCd?typeId=" + para_type_cd;
        $("#searchForm").find("[name='paraTypeCd']").combobox({
            url: paraTypeCdUrl,
            valueField: 'DATAVALUE',
            textField: 'DATANAME',
             loadFilter: function (datas) {
                return datas.RSP.DATA;           //返回的数据格式不符合要求，通过loadFilter来设置显示数据
            }
        });
    }


    function initGrid() {
        //  var typeNm = getsysCode(para_type_cd);
        $("#page").find("#tmpltKeysManage").datagrid({
            columns: [[
                {field: 'ATOMID', title: '原子Id', hidden: true},
                {field: 'PARANM', title: '原子名称', width: '15%'},
                {
                    field: 'PARATYPECD', title: '原子类型', width: '10%', formatter: function (value, row, index) {
                        return typeNm[value];
                    }
                },
                {field: 'GATHRCOMMENT', title: '原子描述', sortable: true, width: '8%'},
                {field: 'APRVLEXCPFLAG', title: '是否允许例外', sortable: true, width: '10%'},
                {field: 'ATOMSTSCD', title: '状态', sortable: true, width: '10%',
                    formatter: function (value) {
                        if (value == 1) {
                            return generateToolBar("已审核");
                        }
                        else {
                            return generateToolBar("未审核");
                        }
                    }
                },
                {field: 'STARTTIME', title: '生效时间', width: '16%', formatter: formatDatebox},
                {field: 'ENDTIME', title: '失效时间', width: '16%', formatter: formatDatebox},
                {
                    field: 'action', title: '操作', width: '14%',
                    formatter: function (value, row, index) {
                        //    newRow =row;

                        var Action = "<a href='javascript:void(0);'  class='updateSkill' name='" + row.ATOMID + "' id ='del" + row.ATOMID + "'>修改</a>  |  " +
                            "<a href='javascript:void(0);' class='deleteBtn' id ='del" + row.ATOMID + "'>删除</a>";

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
            singleSelect: true,
            autoRowHeight: false,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum
                }, Util.PageUtil.getParams($("#searchForm")));

                Util.ajax.getJson(Util.constants.CONTEXT + "/kc/tmplt/atomsvc/msa/queryfblist", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    success(data);
                });

                /*                $.ajax({
                    url: Util.constants.CONTEXT + "/automanage/queryfblist",
                    type: "GET",
                    data: params,
                    dataType: "json",
                    success: function (result) {
                        var data = {
                            rows: result.RSP.DATA,
                            total: result.RSP.ATTACH.TOTAL
                        }
                        success(data);
                        //enable查询按钮
                        $("#searchForm").find("a.btn-green").linkbutton({disabled: false});
                    },
                    error: function (result) {
                        console.log(result);
                    }
                });*/
            }
        });
    }

    /*
     * 弹出添加窗口
     */
    $("#page").on("click", "#createSkill", function () {
        $("#page").find("#skill").datagrid("clearSelections");
        //skillConfig = null;
        $("#win_content").show().window({
            width: 700,
            height: 520,
            modal: true,
            title: "添加原子配置"
        });
        var sum = "";
        ConfigAtomAdd.initialize(sum);
    });


    /**
     * 初始化全局事件
     */
    function initGlobalEvent() {

        $("#searchForm").on("click", "a.btn-green", function () {
            $("#page").find("#tmpltKeysManage").datagrid("load");
        });
        $("#searchForm").on("click", "a.btn-default", function () {
            $("#searchForm").form('clear');
        });

        //绑定删除按钮事件
        $("#page").delegate("a.deleteBtn", "click", function () {
            var thisDelBtn = $(this);
            $.messager.confirm('确认删除弹窗', '您确定要删除这条原子记录吗？', function (confirm) {
                if (confirm) {
                    var atomId = thisDelBtn.attr('id').substr(3);
                    //marathon-lb-kc.skyark.mesos+:port
                    Util.ajax.getJson("marathon-lb-kc.skyark.mesos:9010/tmpltkeyobjrel/isatomused?atomId=" + atomId, null, function (result) {
                        //刷新节点
                        if(result.RSP.RSP_CODE=="1"){
                            $.messager.alert('提示', '被引用不能删除');
                            return;
                            $("#page").find("#tmpltKeysManage").datagrid("load");
                           }else{
                                var atomId = thisDelBtn.attr('id').substr(3);
                                Util.ajax.deleteJson("marathon-lb-kc.skyark.mesos:9010"+ "/kc/tmplt/atomsvc/msa/deleteevaluation?atomId=" + atomId, " ", function (result) {
                                    //刷新节点
                                    $.messager.alert('提示', '删除成功！');
                                    $("#page").find("#tmpltKeysManage").datagrid("load");
                                    //  alert(result.RSP.RSP_DESC);
                                });
                         }
                        //  alert(result.RSP.RSP_DESC);
                    });



                }
            });
        });

        //绑定修改按钮事件
        $("#page").delegate(".updateSkill", "click", function () {
            //调用原子是否被模板引用，如果引用了不能修改直接返回
            var thisRepBtn = $(this);
            var atomId = thisRepBtn.attr('name');
            Util.ajax.getJson("marathon-lb-kc.skyark.mesos:9010/tmpltkeyobjrel/isatomused?atomId=" + atomId, null, function (result) {
                //刷新节点
                if(result.RSP.RSP_CODE=="2"){
                    $.messager.alert('提示', '被引用不能修改');
                    return;
                 }else{
                    $("#win_content").show().window({
                        width: 700,
                        height: 520,
                        modal: true,
                        title: "修改"
                    });
                    ConfigAtomAdd.initialize(atomId);
                    $("#page").find("#tmpltKeysManage").datagrid("load");

                }
            });

        });
    }

    $("#page").on("click", "#importTemplate", function () {
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
        initUpload();
        initEvent();
    });

    function addUploadDom(options) {
        $upload = $([
            "<form class='form form-horizontal' method='post' enctype='multipart/form-data' id='upload_form' name='upload-form'>",
            "<div class='panel-search' style='height: 100%;padding-top: 70px;'>",
            "<input id='onlineFileName' name='fileName'  type='text' style='width:70%' title=''>",
            "<a href='javascript:void(0)' id='btn-upload' class='btn btn-green radius  mt-l-20'>上传</a>",
            "<a href='/kc/tmplt/atomsvc/msa/download' style='margin-left: 5px;'>下载样例文件</a>",
            "</div>",
            "</form>"
        ].join("")).appendTo($("#" + options.contentId));
    }

    var uploadFileAction = function (options) {
        options.$uploadForm.form('submit', {
            url: Util.constants.CONTEXT + "/kc/tmplt/atomsvc/msa/onlineupload",
            method: "POST",
            dataType: "json",
            data: $('#upload-form').serialize(),
            onSubmit: function () {

            },
            success: function (data) {
                if (data) {
                    var result = JSON.parse(data);
                } else {
                    $.messager.alert("提示", "操作失败！");
                }
            },
            error: function (data) {
                $.messager.alert("提示", "操作异常！");
            }
        });
    };

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

    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, // month
            "d+": this.getDate(), // day
            "h+": this.getHours(), // hour
            "m+": this.getMinutes(), // minute
            "s+": this.getSeconds(), // second
            "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
            "S": this.getMilliseconds()
            // millisecond
        }
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (this.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    }


    function formatDatebox(value) {

        if (value == null || value == '') {
            return '';
        }
        var dt;
        if (value instanceof Date) {
            dt = value;
        } else {
            dt = new Date(value);
        }
        return dt.format("yyyy-MM-dd hh-mm-ss");
    }

    function generateToolBar(value) {
        return "<span title='" + value + "'>" + value + "</span>";
    }

    function initUpload() {

        $upload.find("#onlineFileName").filebox({
            buttonText: '选择文件',
            prompt: '请选择上传',
            buttonAlign: 'right'
        });

        // $upload.find("#p").progressbar({
        //     value: 60
        // });

    }

    function initEvent() {
        $upload.find("#btn-upload").on("click", function () {
            // 判空
            // var params = Util.PageUtil.getParams($("#upload_form")));
            // var params = Util.PageUtil.getParams($upload.find("#upload_form"));
            //   console.log("params: " + params);
           // var params = $upload.find("#onlineFileName").filebox("getValue");
            var uploadFile = $("input[name='fileName']")[0].files[0];
            if (typeof (uploadFile) == "undefined") {
                $.messager.alert("提示", "请先选择文件");
                return;
            }

            // //$upload.find("#upload-form")
            $("#upload_form").form('submit', {
                url: Util.constants.CONTEXT + "/kc/tmplt/atomsvc/msa/onlineupload",
                method: "POST",
                onSubmit: function () {

                },
                success: function (data) {
                  //  $("#onlineFileName").filebox("clear");
                    $upload.find("#onlineFileName").filebox("clear");
                    var result = JSON.parse(data);
                    var rsltVal = result.RSP.RSP_CODE;
                    if (rsltVal == "1") {
                        //    var result = JSON.parse(data);
                        //  showResult(result);
                        $.messager.alert("提示", "操作成功！");
                         $("#channelWindow").window("close")
                        $("#page").find("#tmpltKeysManage").datagrid("load");
                    } else {
                        $("#page").find("#tmpltKeysManage").datagrid("load");

                    //    $.messager.alert("提示", result.RSP.RSP_DESC);
                        var handledErrorMessage = "";
                        $.each(result.RSP.RSP_DESC.split(";"), function (index, ele) {
                            handledErrorMessage = handledErrorMessage.concat(ele);
                            handledErrorMessage = handledErrorMessage.concat("<br>");
                        });
                        $.messager.alert("温馨提示", handledErrorMessage);
                    }
                },
                error: function (data) {
                    $.messager.alert("提示", "操作异常！");
                }
            });
        });
    }
});
