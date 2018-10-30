define(["jquery", 'util', "easyui","transfer",'ztree-exedit','js/manage/formatter'],function($,Util,EasyUI,Transfer,Ztree,Formatter){
    var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';
    var groupsNodes ;       //模板分组节点
    var tmpltId;            //模板Id
    var tmpltFilterInfo;    //筛选条件信息
    var groupsAndKeysMap;   //模板分组与原子关联map
    var currentSelectNode ; //当前选中模板分组节点
    var atomResultArr;      //获取原子类型数组
    var saveCallBack;       //回调函数
    var enabledFilterTypeCd = ["2","3","9","11","12","16"];     //支持筛选
    function initialize(tmpltIdParam,tmpltFilterParam,allChildrenNodes,groupAndKeyMap,CallBack) {
        groupsNodes = allChildrenNodes;
        tmpltId = tmpltIdParam;
        tmpltFilterInfo = tmpltFilterParam;
        groupsAndKeysMap = groupAndKeyMap;
        saveCallBack = CallBack;
        atomResultArr = Formatter.getSysCode(para_type_cd);     //获取原子类型数组
        addLayout();                //增加页面布局结构
        $(document).find("#filterLayout").layout();
        addFilterInfoForm();        //增加模板信息模块内容
        addTreeContent();           //增加工作组模块内容
        addDataGrid();              //增加原子列表模块内容
        addBtnsForm();              //增加底部按钮

        initFilterInfoForm();        //初始化筛选条件表单
        initDataGrid();              //增加原子列表模块内容
        initTreeContent();           //增加工作组模块内容

        initGlobalEvent();          //初始化全局事件
    }

    function addLayout() {
        $([
            "<div class='easyui-layout' id = 'filterLayout' style='width:100%;height:100%;border:none' >",
            "<div region = 'north' id='filterInfoDiv'  style = 'width:100%;height: 13%;' >",
            "</div>",
            "<div region = 'west' id = 'filterTreeDiv' split = 'true' title='模板工作组' style = 'width:25%;height: 65%;' >",
            "</div>",
            "<div  region='center' id = 'filterGridDiv' style='padding:5px;width:100%;height: 65%;'>",
            "</div>",
            "<div  region='south' id = 'buttomBtnsDiv' style='padding:5px;width:100%;height: 10%;'>",
            "</div>",
            "</div>",

        ].join("")).appendTo($("#newFilterWin"));
    }

    function addFilterInfoForm() {
        $([
            "<form class='form form-horizontal' id='filterInfoForm' >",
            // 模板信息
            "<div class='row cl'>",
            "<label class='form-label col-2'>筛选条件名称<span style='color:red;padding-left:2px'>*</span></label>",
            "<div class='formControls col-3'>",
            "<input type='text' class='easyui-textbox' name='screngNm' id ='screngNm' style='width:100%;height:30px' >",
            "</div>",
            "<label class='form-label col-2'>筛选条件类型<span style='color:red;padding-left:2px'>*</span></label>",
            "<div class='formControls col-3'>",
            "<input type='text' class='easyui-combotree' name='screngTypeCd'  id ='screngTypeCd' style='width:100%;height:30px' >",
            "</div>",
            "</div>",
            "</form>",
        ].join("")).appendTo($("#filterInfoDiv"));
    }

    function addTreeContent(){
        $([
            "<div class='ke-panel-content clear-overlap'>",
            "</div>",
            "<div id='filterGroupsTree' style='height:100%;width:100%;' class='ztree'>",
            "</div>",
        ].join("")).appendTo($("#filterTreeDiv"));
    }

    function addDataGrid(){
        $([
            "<div class='easyui-layout' data-options='' style='width: 100%; height: 100%;'>",
            "<div class='fl 'style='width: 100%; height: 8%;'>请选择要关联的原子 已关联原子数量（<span id='relatedKeyCount'>0</span>）</div>",
            "<div id= 'filterKeysManage' data-options=\"region:'cente'\" title='' class='panel-body panel-body-noheader layout-body'style='width: 100%; height: 92%;'>",
            "<table id='filterKeysTable' class='easyui-datagrid'  >" +
            "</table>",
            "</div>",
            "</div>",
        ].join("")).appendTo($("#filterGridDiv"));
    }

    function addBtnsForm(){
        $([
            "<div class='mt-10 test-c'>",
            "<label class='form-label col-5'></label>",
            "<a href='javascript:void(0)' id='saveTmpltFilterBtn' class='btn btn-green radius  mt-l-20'  >保存</a>",
            "<a href='javascript:void(0)' id='cancelFilterBtn' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>",
        ].join("")).appendTo($("#buttomBtnsDiv"));
    }

    function initFilterInfoForm() {
        $("#filterInfoDiv").find("input.easyui-textbox").textbox();
        $("#filterInfoDiv").find("[name='screngTypeCd']").combobox({
            url: Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/getStaticDataByTypeId?typeId=" + para_type_cd,
            valueField: 'DATAVALUE',
            textField: 'DATANAME',
            editable:false,
            panelHeight:'auto',
            loadFilter:function (data) {
                var oldArray = data.RSP.DATA;
                var newArray = [];
                for(var i =0;i<oldArray.length;i++){
                    if(enabledFilterTypeCd.indexOf(oldArray[i].DATAVALUE)>-1){
                        newArray.push(oldArray[i]);
                    }
                }
                return newArray;           //通过loadFilter来设置显示数据
            },
            onSelect:function(item){
                $("#filterKeysTable").datagrid("load");
            }
        });
        //如果tmpltFilterInfo不为空，则回显筛选条件内容
        if(tmpltFilterInfo){
            $("#screngNm").textbox("setValue",tmpltFilterInfo.screngNm);
            $("#screngTypeCd").combobox("setValue",tmpltFilterInfo.screngTypeCd);
        }
    }
    function initTreeContent() {
        var setting = {
            callback: {
                onClick: zTreeOnClick
            }
        };
        //添加点击函数
        function zTreeOnClick(event, treeId, treeNode) {
             currentSelectNode = zTreeObj.getSelectedNodes()[0];
            $("#filterKeysTable").datagrid("load");
        };

        var rootNode = {name:"模板分组", grpngId: 0, tmpltId:tmpltId,isParent:true};
        var zTreeObj =  $.fn.zTree.init($("#filterGroupsTree"), setting , rootNode);
        var newRootNode = zTreeObj.getNodesByFilter(function (node) { return node.level == 0 }, true);

        //选中根节点并刷新关联原子列表
        currentSelectNode = newRootNode;
        $("#filterKeysTable").datagrid("load");

        //复制详情页面的分组树
        for(var i = 0;i<groupsNodes.length;i++){
            groupsNodes[i].previousTId = groupsNodes[i].tId;           //记住之前的tId,groupsAndKeysMap的key就是tId值
        }
        zTreeObj.addNodes(newRootNode, groupsNodes);

    }
    function initDataGrid() {
        $("#filterKeysTable").datagrid({
            columns: [[
                {field : 'checkBox',checkbox : true},
                {field: 'ATOMID', title: '原子Id', hidden: true},
                {field: 'PARANM', title: '原子名称', width: '19%'},
                {field: 'PARATYPECD', title: '原子类型', width: '15%',
                    formatter: function (value, row, index) {return atomResultArr[value];}},
                {field:'OPTVAL',title:'选项值',width:'16%'},
                {field:'WKUNIT',title:'单位',width:'10%'},
                {field:'COLMDESC',title:'字段说明',width:'20%'},
                {field:'OPPRSNID',title:'最近采编人',width:'15%'},
            ]],
            idField:'ATOMID',
            fitColumns:true,
            singleSelect: true,
            width: '97%',
            height: '100%',
            pagination: false,
            autoRowHeight: false,
            loader: function (param, success) {
                if(currentSelectNode){
                    var tmpltKeysArray ;
                    //如果选中根节点，则显示所有分组下的原子
                    if(currentSelectNode.grpngId == 0){
                        tmpltKeysArray = [];
                        for(var key in groupsAndKeysMap){
                            tmpltKeysArray = tmpltKeysArray.concat(groupsAndKeysMap[key]);
                        }
                    }else{
                        tmpltKeysArray = groupsAndKeysMap[currentSelectNode.previousTId];
                    }
                    //根据筛选条件类型过滤数据
                    var typeCd = $("input[name ='screngTypeCd']").val();
                    var showTmpltKeysArray = [];
                    if(typeCd != undefined &&typeCd != ""){
                        for(var i=0;i<tmpltKeysArray.length;i++){
                            if(tmpltKeysArray[i].PARATYPECD==typeCd){
                                showTmpltKeysArray.push(tmpltKeysArray[i]);
                            }
                        }
                    }else{
                        showTmpltKeysArray = tmpltKeysArray;
                    }
                    //加载数据
                    success(showTmpltKeysArray);
                }
            }
        });
    }
    function initGlobalEvent() {
        $("#saveTmpltFilterBtn").click(function () {
            var screngTypeCd = $("input[name='screngTypeCd']").val();
            var screngNm = $("input[name='screngNm']").val().trim();
            var selectedRow = $('#filterKeysTable').datagrid('getSelected');
            //判断筛选名称或类型条件是否为空
            if(screngTypeCd==""||screngTypeCd==undefined||screngNm==""||screngNm==undefined){
                $.messager.alert("提示","筛选名称或类型条件不得为空!");
                return false;
            }
            //判断是否选择了原子
            if(selectedRow==null||selectedRow==undefined){
                $.messager.alert("提示","请选择要关联的原子!");
                return false;
            }
            selectedRow.screngNm = screngNm;
            selectedRow.screngTypeCd = screngTypeCd;
            selectedRow.atomIds = selectedRow.ATOMID;                           //TODO 此处atomIds有可能是多个，需要处理
            selectedRow.Names = selectedRow.PARANM;                             //TODO 此处atomIds有可能是多个，需要处理
            if(tmpltFilterInfo!=null||tmpltFilterInfo!=undefined){
                saveCallBack(tmpltFilterInfo,selectedRow,true);
            }else{
                saveCallBack(null,selectedRow,false);
            }


            $("#newFilterWin").empty();                                         //清空弹窗内容
            $("#newFilterWin").window("close");                                 //关闭弹窗
        });
        $("#cancelFilterBtn").click(function(){
            $("#newFilterWin").empty();                                         //清空弹窗内容
            $("#newFilterWin").window("close");                                 //关闭弹窗
        });
    }



    return {
        initialize:initialize
    }
});