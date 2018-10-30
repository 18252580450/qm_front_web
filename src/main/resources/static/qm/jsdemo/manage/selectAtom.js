define(["jquery", 'util', "easyui",'js/manage/formatter','loading','transfer'], function ($, Util,EasyUI,Formatter,Loading,Transfer) {
    var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';  //原子类型数据字典编码
    var tmpltGroup;
    var initialize = function(groupObject,okCallBack){
        $("#win_content").empty();
        tmpltGroup = groupObject;
        addWinContent();
        initSearchForm();
        initTempltKeyTable();
        initGlobalEvent(okCallBack);
    }
    function addWinContent(){
        $([
            "<div id ='selectKeysDialog'>" ,
                    "<form class='form form-horizontal' id='searchKeysForm'>",
                        "<div class='row cl'>",
                            "<div class='formControls col-2'></div>",
                            "<div class='formControls col-6'><input type='text' class='easyui-textbox' name='paraNm'  style='width:100%;height:30px' ></div>",
                            "<div class=' text-r'><a href='javascript:void(0)' id = \"searchBtn\" class='btn btn-green radius mt-l-20'><i class='iconfont iconfont-search2'></i>查询</a></div>",
                        "</div>",
                    "</form>",
                "<div class='panel-tool-box cl' >" ,
                "<div class='fl text-bold'>原子管理</div>" ,
                "</div>",
                "<table id='tmpltKeysList' class='easyui-datagrid'  style=' width:98%;height:200px;'>" +
                "</table>",
                "<div class='mt-10 test-c'>",
                "<label class='form-label col-5'></label>",
                "<a href='javascript:void(0)' id='saveBtn' class='btn btn-green radius  mt-l-20'  >保存</a>",
                "<a href='javascript:void(0)' id='cancelBtn' class='btn btn-secondary radius  mt-l-20' >取消</a>",
                "</div>",
            "</div>",

        ].join("")).appendTo($("#win_content"));
    }


    function initSearchForm(){
        $("#searchKeysForm").find("input.easyui-textbox").textbox();
    }

    function initTempltKeyTable(){
        var atomTypeArr = Formatter.getSysCode(para_type_cd);
        $("#selectKeysDialog").find("#tmpltKeysList").datagrid({
            columns: [[
                {field: 'ATOMID', title: '原子Id', hidden: true},
                {field: 'PARANM', title: '原子名称', width: '15%'},
                {field: 'PARATYPECD', title: '原子类型', width: '10%', formatter: function (value, row, index) {
                        return atomTypeArr[value];}},
                {field: 'GATHRCOMMENT', title: '原子描述',width: '10%'},
                {field: 'APRVLEXCPFLAG', title: '允许例外',width: '10%'},
                {field: 'OUTSIDEFLAG', title: '是否外部可见', hidden: true},
                {field: 'REQUIREDFLAG', title: '是否为必填项',hidden: true},
                {field: 'ATOMSTSCD', title: '是否已审核', sortable: true, width: '15%',
                    formatter: function (value) {
                        if (value == 1) {
                            return "已审核";
                        }
                        else {
                            return "未审核";
                        }
                    }
                },
                {field: 'STARTTIME', title: '生效时间', width: '19%'},
                {field: 'ENDTIME', title: '失效时间', width: '19%'},
             /*   {field: 'OPTVAL', title: '选项值', hidden: true},
                {field: 'WKUNIT', title: '单位', hidden: true},
                {field: 'OPPRSNID', title: '操作人员', hidden: true},
                {field: 'COLMDESC', title: '字段描述', hidden: true}*/
            ]],
            width: '100%',
            fit: false,
            height: 380,
            pagination: true,
            pageSize: 10,
            pageList: [5,10, 20, 50],
            singleSelect: true,
            autoRowHeight: false,
            loader: function (param, success) {
                var start = (param.page - 1) * param.rows;
                var pageNum = param.rows;
                var params = $.extend({
                    "start": start,
                    "pageNum": pageNum
                }, Util.PageUtil.getParams($("#searchKeysForm")));
                param.paraNm=$("#paraNm").val();
               // http://126.12.32.23:8080;马拉松域名+kc_tmplt_tmpltsvc_msa+"/automanage/queryatomlist"
                Util.ajax.getJson( Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/automanage/queryfblist", params, function (result) {
                    var data = Transfer.DataGrid.transfer(result);
                    success(data);
                });
            }
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

    function initGlobalEvent(okCallBack) {
        //保存
        $("#selectKeysDialog").on("click", "#saveBtn", function (){
            var selectedRow = $('#tmpltKeysList').datagrid('getSelected');
            //判断是否选择原子
            if(selectedRow.ATOMID == undefined||selectedRow.ATOMID == null){
                $.messager.alert('Warning','请选择原子！');
                return false;
            }
            okCallBack(selectedRow);
            $("#win_content").empty();
            $("#win_content").window("close");
        });
        //取消
        $("#selectKeysDialog").on("click", "#cancelBtn", function (){
            $("#win_content").empty();
            $("#win_content").window("close");
        });

        //查询
        $("#selectKeysDialog").on("click", "#searchBtn", function (){
            $("#selectKeysDialog").find("#tmpltKeysList").datagrid("load");
        });
    }

    return {
        initialize:initialize
    }
});