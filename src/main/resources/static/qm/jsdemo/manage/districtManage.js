require(["jquery", "loading", "transfer", 'util', "easyui", 'ztree-exedit'], function ($, Loading, Transfer, Util) {
    var $page, $search;
    var zTreeObj;
    var selectTreeNode;
    var regnId, regnNm, suprRegnId, hrcySeqno;
    var flag;
    // var suprRegnId = 000;
    /**
     * 初始化
     */
    initialize();

    function initialize() {
        $page = $("<div></div>");
        addLayout();
        $page = $page.appendTo($("#form_content"));
        $(document).find("#layout_content").layout();
        $(document).find("#win_content").layout();
        initMenuTree();
        districtManage();
        initSearchForm();
        searchDelete();
        searchUpdate();
        searchSave();
        searchAdd();
    };

    /**
     * 地区管理表单
     */
    function districtManage() {
        $search = $([
            "<div class='cl'>",
            "<div class='panel-tool-box cl' >",
            "<div class='fl text-bold'>地区管理</div>",
            "</div>",
            "</div>",
            "</div>",
            "<div class='panel-search'>",
            "<form class='form form-horizontal' id='dist'>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>地区编号：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='regnId' id='regnId' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>地区名称：</label>",
            "<div class='formControls col-2'>",
            "<input type='text'  name='regnNm' id='regnNm' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>映射字段：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='mapField' id='mapField' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>", "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>上级地区：</label>",
            "<div class='formControls col-2'>",
            "<input type='text'  name='suprRegnId' id='suprRegnId' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>排列序号：</label>",
            "<div class='formControls col-2'>",
            "<input type='text'  name='argeSeqno' id='argeSeqno' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>标记：</label>",
            "<div class='formControls col-2'>",
            "<input type='text'  name='flag' id='flag' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>", "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>层级序号：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='hrcySeqno' id='hrcySeqno' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>字母简写编码：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='alphShtnCode' id='alphShtnCode' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>备注：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='remark' id='remark' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>", "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'>地区类型：</label>",
            "<div class='formControls col-2'>",
            "<input type='text' name='areaType' id='areaType' class='easyui-combobox' readonly='readonly'  style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>", "</div>",

            "<div class='row cl'>",
            "<div class='formControls text-c'>" +
            "<a id='btnAdd'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>新增</a>",
            "<a id='btnEdit'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-edit'></i>修改</a>",
            "<a id='btnDelete'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-del2'></i>删除</a>",
            "<a id='btnSave' href='javascript:void(0)' class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-upload'></i>保存</a>",
            "</div>",
            "</div>",

            "</form>",
            "</div>"
        ].join("")).appendTo($page);
    }

    /**
     * 地区树
     */
    function addLayout() {
        var $layout = $([
            "<div id='layout_content' class='easyui-layout' data-options=\"region:'center'\" style='height:100%;'>",
            "<div data-options=\"region:'west',split:false,title:'地区列表'\" style='width: 256px;height: 100%;overflow:auto;'>",
            "<ul id='menuTree' class='ztree'></ul>",
            "</div>",

            "<div data-options=\"region:'center'\" style='overflow: hidden;'>",
            "<div id='form_content' data-options=\"region:'center'\">",
            "</div>",
            "</div>",

            "</div>",

        ].join("")).appendTo($("#page_content"));
    }

    /**
     * 样式
     */
    function initSearchForm() {
        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox();
        $search.find("input.easyui-textbox").textbox();
        $search.find("input.easyui-datetimebox").datetimebox({
            editable: false
        });
    }

    /**
     * 初始化树
     */
    function initMenuTree() {

        var setting = {
            async: {
                dataType: "json",
                type: "GET",
                enable: true,
                url: Util.constants.CONTEXT + "/kc/manage/distsvc/msa/query/",
                autoParam: ["codeValue"],
                dataFilter: filter
            },
            callback: {
                onClick: zTreeOnClick,

            }
        };

        /**
         * 树的点击函数
         */
        function zTreeOnClick(event, treeId, treeNode) {
            $("#dist :input").attr("disabled", true);
            $("#btnAdd").prop("disabled", false);
            $("#btnEdit").prop("disabled", false);
            $("#btnDelete").prop("disabled", false);
            selectTreeNode = treeNode;
            if (zTreeObj && treeNode.isParent) {
                zTreeObj.expandNode(treeNode, null, false, false);
            }
            regnId = treeNode.codeValue;
            Util.ajax.getJson(Util.constants.CONTEXT + "/kc/manage/distsvc/msa/".concat(regnId), null, function (result) {
                var data = Transfer.Combobox.transfer(result);
                //$search.find("#dist").form("load",dist);
                regnNm = data[0].REGNNM;
                regnId = data[0].REGNID;
                suprRegnId = data[0].SUPRREGNID;
                hrcySeqno = data[0].HRCYSEQNO;

                $("#regnNm").val(regnNm);
                $("#regnId").val(regnId);
                $("#suprRegnId").val(suprRegnId);
                $("#hrcySeqno").val(hrcySeqno);

                $("#mapField").val(data[0].MAPFIELD);
                $("#flag").val(data[0].FLAG);
                $("#argeSeqno").val(data[0].ARGESEQNO);
                $("#alphShtnCode").val(data[0].ALPHSHTNCODE);
                $("#remark").val(data[0].REMARK);
                $("#areaCode2").val(data[0].AREACODE2);
                $("#provCode").val(data[0].PROVCODE);
                $("#cityCode").val(data[0].CITYCODE);
                $("#createUser").val(data[0].CREATEUSER);
                $("#updateUser").val(data[0].UPDATEUSER);
                $("#versionNum").val(data[0].VERSIONNUM);
                $("#startTime").val(data[0].STARTTIME);
                $("#endTime").val(data[0].ENDTIME);
                $("#grayVersion").val(data[0].GRAYVERSION);
                $("#areaType").val(data[0].AREATYPE);
            });
        };


        function filter(treeId, parentNode, childNodes) {
            if (!childNodes) {
                return null;
            }

            // childNodes = childNodes['dataList'];
            childNodes = childNodes.RSP.DATA;
            if (childNodes) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    childNodes[i].name = childNodes[i].codeName.replace(/\.n/g, '.');
                    // childNodes[i].isParent=true;
                    // childNodes[i].level = childNodes[i].atrr;
                }
            }
            return childNodes;
        }


        var newNode = {name: "全国", isParent: true, codeValue: '000'};

        $(document).ready(function () {
            zTreeObj = $.fn.zTree.init($("#menuTree"), setting, newNode);
            // 异步加载树.直接传rootNode异步刷新树，将无法展开rootNode。要通过如下方式获取根节点。false参数展开本节点
            zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);
            // newNode.addNodes(null, newNodes);

        });
    }

    /**
     *删除当前页面的地区数据
     */
    function searchDelete() {
        $search.on("click", "#btnDelete", function (treeNode) {
            $.messager.confirm('Confirm', '你确定要删除吗?', function (r) {
                if (r) {
                    console.log("r: " + r);
                    if (selectTreeNode.isParent) {
                        $.messager.alert('温馨提示', '无法直接删除父节点！');
                        return;
                    }
                    if (regnId == undefined) {
                        $.messager.alert('Warning', '请先选择地区!');
                        return false;
                    }
                    if (zTreeObj && treeNode.isParent) {
                        zTreeObj.expandNode(treeNode, null, false, false);
                    }
                    var regnIdDelete = regnId;
                    Util.ajax.deleteJson(Util.constants.CONTEXT + "/kc/manage/distsvc/msa/deleteDistrict?regnId=" + regnIdDelete, "", function (result) {
                        alert(result["RSP"]["RSP_DESC"]);
                        $("#dist").form('clear');
                        regnId = undefined;
                        isClick = false;
                        initMenuTree();
                    });
                }
            });

        });
    }

    /**
     *保存当前页面的地区数据
     */
    function searchSave() {
        $search.on("click", "#btnSave", function () {
            if ($("#mapField").val() == "") {
                $.messager.alert('Warning', '请输入映射字段');
                return;
            }
            if ($("#regnId").val() == "") {
                $.messager.alert('Warning', '请输入地区编号');
                return;
            }
            if (escape($("#regnId").val()).indexOf("%u") >= 0) {
                $.messager.alert('Warning', '地区编号不能包含中文');
                return;
            }
            if ($("#suprRegnId").val() == "") {
                $.messager.alert('Warning', '请输入上级区号');
                return;
            }
            if ($("#createUser").val() == "") {
                $.messager.alert('Warning', '请输入创建员工编号');
                return;
            }
            if ($("#updateUser").val() == "") {
                $.messager.alert('Warning', '请输入修改员工编号');
                return;
            }
            if ($("#regnNm").val() == "") {
                $.messager.alert('Warning', '请输入地区名称');
                return;
            }
            if ($("input[name='argeSeqno']").val() == "") {
                $.messager.alert('Warning', '请输入排列序号');
                return;
            }
            if (isNaN($("input[name='argeSeqno']").val())) {
                $.messager.alert('Warning', '排列序号必须为数字');
                return;
            }
            if ($("#hrcySeqno").val() == "") {
                $.messager.alert('Warning', '层级序号不能为空');
                return;
            }
            if (isNaN($("#hrcySeqno").val())) {
                $.messager.alert('Warning', '层级序号必须为数字');
                return;
            }
            if ($("#alphShtnCode").val() == "") {
                $.messager.alert('Warning', '字母简写编码不能为空');
                return;
            }
            if (flag == 1) {
                $("#dist :input").removeAttr("disabled");
                $("#btnAdd").prop("disabled", false);
                $("#btnEdit").prop("disabled", false);
                $("#btnDelete").prop("disabled", false);

                var param = {};
                var t = $('form').serializeArray();
                $.each(t, function () {
                    param[this.name] = this.value;
                });
                Util.ajax.putJson(Util.constants.CONTEXT + "/kc/manage/distsvc/msa/updateDistrict", param, function (result) {
                    alert(result.RSP.RSP_DESC);
                    $("#dist :input").attr("disabled", true);
                    initMenuTree();
                });
            }
            if (flag == 0) {
                $("#dist :input").removeAttr("disabled");
                $("#btnAdd").prop("disabled", false);
                $("#btnEdit").prop("disabled", false);
                $("#btnDelete").prop("disabled", false);

                var param = {};
                var t = $('form').serializeArray();
                $.each(t, function () {
                    param[this.name] = this.value;
                });
                Util.ajax.postJson(Util.constants.CONTEXT + "/kc/manage/distsvc/msa/addDistrict", param, function (result) {
                    alert(result.RSP.RSP_DESC);
                    $("#dist :input").attr("disabled", true);
                    initMenuTree();
                });
            }
        });
    }

    /**
     *更新当前页面的地区数据
     */
    function searchUpdate() {
        $search.on("click", "#btnEdit", function () {
            if (regnId == undefined) {
                $.messager.alert('Warning', '请先选择地区!');
                return false;
            }
            $("#btnAdd").prop("disabled", true);
            $("#btnEdit").prop("disabled", true);
            $("#btnDelete").prop("disabled", true);
            $("#dist :input").removeAttr("disabled");
            $("#dist :input").removeAttr("readonly");
            $("#regnId").attr("disabled", "disabled");
            $("#suprRegnId").attr("disabled", "disabled");
            $("#hrcySeqno").attr("disabled", "disabled");
            flag = 1;
        });
    }

    /**
     *新增当前页面的地区数据
     */
    function searchAdd() {
        $search.on("click", "#btnAdd", function () {
            if (regnId == undefined) {
                $.messager.alert('Warning', '请先选择地区!');
                return false;
            }
            $("#btnAdd").prop("disabled", true);
            $("#btnEdit").prop("disabled", true);
            $("#btnDelete").prop("disabled", true);
            $("#dist :input").removeAttr("disabled");
            $("#dist :input").removeAttr("readonly").val("");
            $("#suprRegnId").attr("disabled", "disabled").val(regnId);
            $("#hrcySeqno").attr("disabled", "disabled").val(hrcySeqno + 1);
            flag = 0;
        });
    }
});