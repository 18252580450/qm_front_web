require(["jquery", "loading", 'util', "easyui", 'ztree-exedit','js/manage/formatter','js/manage/selectAtom','js/manage/createNewGroup','js/manage/createNewFilter','js/manage/tmpltFilterManage'],
    function ($, Loading, Util,easyui,ztree,Formatter,SelectAtom,CreateNewGroup,CreateNewFilter,TmpltFilterManage) {
    var para_type_cd = 'NGKM.ATOM.PARAM.TYPE';  //原子类型数据字典编码
    var templt_chnl_cd = 'NGKM.TEMPLET.CHNL';   //模板渠道编码


    var zTreeObj;                               //工作组树
    var oldGroupNodeName;                       //记录节点修改前的名称
    var currentSelectNode;                      //当前选中工作组

    var isUpdateFlag = true;                    //模板修改状态位
    var tmpltId;                                //待修改模板ID
    var  isShowFlag;                              //是否审核微服务调用标志
    var atomResultArr;                          //16种原子类型数组
    var groupsAndKeysMap = {};                  //工作组与原子关联map
    var tmpltFilterVoArray = [];                  //模板筛选条件数组

    $(document).ready(function() {
        // 路径查询参数部分
        var searchURL = decodeURI(window.location.search);
        searchURL = searchURL.substring(1, searchURL.length);
        // 参数序列化
        var searchData = serilizeUrl(decodeURI(searchURL));
        tmpltId = searchData.tmpltId;           //获取tmpltId参数

        if(tmpltId!=undefined&&tmpltId!=""){
            isUpdateFlag = true;
        }else{
            isUpdateFlag = false;
        }


        initialize();

        //查看模板信息时isShowFlag为true
        isShowFlag = searchData.isShowFlag;
        if(isShowFlag == "true"){               //根据isShowFlag判断是否隐藏或禁用操作按钮
            $("#add-catalog").removeClass("disabled");
            $("#edit-catalog").removeClass("disabled");
            $("#add-catalog").removeClass("disabled");
            $("#add-catalog").removeClass("disabled");
            $("#tmpltInfoForm").find("input.easyui-textbox").textbox({disabled:true});
            $('#choiceAtom').hide();
            $('#catlId').combotree("disable");
            $("#bottomBtnsForm").html("");
            $('#perform').hide();
            $(".deleteRelBtn").hide();
            $('#screenCondition').hide();
        }
    });

    // 序列化url查询参数
    function serilizeUrl(url) {
        var result = {};
        var map = url.split("&");
        for(var i = 0, len = map.length; i < len; i++){
            result[map[i].split("=")[0]] = map[i].split("=")[1];
        }
        return result;
    }


    function initialize() {
        addLayout();                //增加页面布局结构
        $(document).find("#tmpltDetailLayout").layout();
        addTempltInfoForm();        //增加模板信息模块内容
        addTreeContent();           //增加工作组模块内容
        addDataGrid();              //增加原子列表模块内容
        addFilterForm();            //增加筛选表单内容
        addBtnsForm();              //增加底部操作模块内容
        initTempltInfoForm();       //初始化模板信息模块组件
        initGrid();                 //初始化原子列表
        initMenuTree();             //初始化工作组树
       initFilterForm();           //初始化筛选条件模块内容
        initGlobalEvent();          //初始化全局事件
    }

    function addLayout() {
        $([
            "<div region = 'north' title = '新增模板'  id='tmpltInfo' style = 'width:100%;height: 17%;border:none' >",
            "</div>",
            "<div region = 'west' id = 'treeContent' title = '模板要素' style = 'width:20%;height: 65%;' >",
            "</div>",
            "<div  region='center' id = 'dataGridArea'  style='padding-left:5px;width:75%;height: 65%;'>",
            "</div>",
            "<div region = 'south' id = 'filterFormArea'style = 'width:99%;height:50px;' >",
            "</div>",

        ].join("")).appendTo($("#tmpltDetailLayout"));
    }

    function addTempltInfoForm() {
        $([
            "<div class='panel-search'>",
                "<form class='form form-horizontal' id='tmpltInfoForm' >",
                // 模板信息
                "<div class='row cl'>",
                    "<label class='form-label col-2'>模板路径<span style='color:red;padding-left:2px'>*</span></label>",
                    "<div class='formControls col-2'>",
                        "<input type='text' class='easyui-combotree' name='catlId' id='catlId' style='width:100%;height:30px' >",
                    "</div>",
                    "<label class='form-label col-2'>模板名称<span style='color:red;padding-left:2px'>*</span></label>",
                    "<div class='formControls col-2'>",
                        "<input type='text' class='easyui-textbox' name='tmpltNm' id ='tmpltNm' style='width:100%;height:30px' >",
                    "</div>",
                    "<label class='form-label col-2'>模板介绍</label>",
                    "<div class='formControls col-2'>",
                    "<input type='text' class='easyui-textbox' name='remark' id='remark' style='width:100%;height:30px' >",
                    "</div>",
                "</div>",
                "</form>",
            "</div>",
            ].join("")).appendTo($("#tmpltInfo"));
    }

    function addTreeContent(){
        $([
            "<div class='ke-panel-content clear-overlap' id='perform' style='height: 60px;'>",
            "<ul class='ke-act-btns'>",
            "<li><a class='clk-add' title='添加' href='#nogo' id='add-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-edit disabled' title='编辑' href='#nogo' id='edit-catalog'style='cursor:pointer;'></a></li>",
            "<li><a class='clk-del disabled' title='删除' href='#nogo' id='delete-catalog' style='cursor:pointer;'></a></li>",
            "<li><a class='clk-up disabled' title='上移' href='#nogo' id='moveUp-catalog' style='cursor:pointer;'></a> </li>",
            "<li><a class='clk-down disabled' title='下移' href='#nogo' id='moveDown-catalog' style='cursor:pointer;'></a></li></ul>",
            "<p style='cursor:pointer;padding-top: 10px ;height:20px;padding-left:22px'>公共属性</p>",
            "</div>",
            "<div id='groupsTree' style='height:80%;width:90%;' class='ztree'>",
            "</div>",
        ].join("")).appendTo($("#treeContent"));
    }

    function addDataGrid(){
        $([
            "<div class='panel-tool-box cl'>",
            "<div class='fl text-bold'>模板原子列表</div>",
            "<div class='fr' id='choiceAtom'>",
            "<a id='selectTmpltKeys'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
            "<i class='iconfont iconfont-add'></i>选择已有原子</a>",
            "</div>",
            "</div>",
            "<table id='tmpltKeysTable' class='easyui-datagrid'  >" ,
            "</table>",
        ].join("")).appendTo($("#dataGridArea"));
    }

    function addFilterForm(){
        $([
        "<div class='panel-tool-box cl' >",
        "<div class='fl text-bold'>筛选条件 </div>",
        "<div class='fr' id='screenCondition'>",
        "<a id='createNewFilter'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'>" +
        "<i class='iconfont iconfont-add'></i>新建筛选条件</a>",
        "</div>",
        "</div>",
        "<div class='bd-list' id ='filterForm'>" ,
        "</div>",
        ].join("")).appendTo($("#filterFormArea"));
    }

    function addBtnsForm(){
        $([
        "<div class='mt-10 test-c'>",
            '<br>',
            "<label class='form-label col-5'></label>",
            "<a href='javascript:void(0)' id='saveTmpltDetailBtn' class='btn btn-green radius  mt-l-20'  >保存</a>",
            "<a href='javascript:void(0)' id='cancelBtn' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            "</div>",
        ].join("")).appendTo($("#bottomBtnsForm"));
    }


    function initTempltInfoForm() {
        //初始化渠道
        /*$('#chnlCode').combotree({
            url: Util.constants.CONTEXT + "/kmconfig/getStaticDataByTypeId?typeId=" + templt_chnl_cd,
            multiple: true,         //可多选
            editable: false,
            panelHeight: 'auto',
            loadFilter: function (result) {
                var chnlCodeArray = [];
                for(var i = 0;i<(result.RSP.DATA).length;i++){
                    var chnlCode = {};
                    chnlCode.text = (result.RSP.DATA)[i].CODENAME;
                    chnlCode.id = (result.RSP.DATA)[i].CODEVALUE;
                    chnlCodeArray.push(chnlCode);
                }
                return chnlCodeArray;           //过滤数据
            }
        });*/

        //初始化适用地区
       /* $('#authRegnList').combotree({
            url: Util.constants.CONTEXT + "/district/getSuitableOfDistrictList?firstRegionId=-2&secondRegionId=000",
            method: "GET",
            multiple: true,         //可多选
            editable: false,
            panelHeight: '120',
            loadFilter:function (result) {
                var regnArray = result.RSP.DATA;
                for(var i =0 ;i<regnArray.length;i++ ){
                    regnArray[i].text = regnArray[i].REGNNM;
                    regnArray[i].id = regnArray[i].REGNID;
                }
                return regnArray;
            }
        });*/

        //初始化路径树
        $('#catlId').combotree({
            url: Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/catalogs/subs/1",
            multiple: false,         //不可多选
            editable: false,
            method: "GET",
           // otherParam:{"catalogId":id},
            panelHeight: 'auto',
            onBeforeExpand:function(node){
                $(this).tree('options').url = Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/catalogs/subs/"+node.id;
            },
            loadFilter : function(result){
                var catlArray = [];
                for(var i = 0;i<(result.RSP.DATA).length;i++){
                    var catl = {};
                    catl.text = (result.RSP.DATA)[i].CATLNM;
                    catl.id = (result.RSP.DATA)[i].CATLID;
                    if((result.RSP.DATA)[i].parent){
                        catl.state = 'closed';              //closed状态表示有子节点
                    }
                    catlArray.push(catl);
                }
                return catlArray;           //过滤数据
            }
        });
        $("#tmpltInfoForm").find("input.easyui-textbox").textbox();

        //判断是否需要回显模板基本信息
        if(isUpdateFlag){
            Util.ajax.getJson( Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/info/"+tmpltId, function (result) {
                //回显模板信息
                var tmpltInfo = result.RSP.DATA[0];
               /* $('#chnlCode').combotree('setValues', tmpltInfo.CHNLCODE.split(','));
                $('#authRegnList').combotree('setValues',tmpltInfo.AUTHREGNLIST.split(','));*/
                $('#catlId').combotree('setValue',tmpltInfo.CATLID);
                $('#tmpltNm').textbox('setValue',tmpltInfo.TMPLTNM);
                $('#remark').textbox('setValue',tmpltInfo.REMARK);
            });
        }
    }

    function initMenuTree(){
        var setting = {
            async: {
                dataType: "json",
                type: "GET",
                enable: true,
                url:   Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/tmpltgroups/tmpltgroups",
                autoParam: ["grpngId","tmpltId"],                       //传递的参数
                dataFilter: filter
            },
            callback: {
                onClick: zTreeOnClick,
                onAsyncSuccess:getGroupsRelatedKeys,
                onRename:onRenameFunction
            }
        };
        //添加点击函数
        function zTreeOnClick(event, treeId, treeNode) {
            currentSelectNode = zTreeObj.getSelectedNodes()[0];
            updateOperateStatus(treeNode);
            $("#tmpltKeysTable").datagrid("load");
        };

        //对数据进行筛选处理显示
        function filter(treeId, parentNode, childNodes) {
            if (!(childNodes.RSP)) {
                return null;
            }
            childNodes = childNodes.RSP.DATA;
            if (childNodes) {
                for (var i = 0, l = childNodes.length; i < l; i++) {
                    childNodes[i].name = childNodes[i].GRPNGNM;

                }
            }
            return childNodes;
        }

        var newNode = {name:"模板要素", grpngId: 0, tmpltId:tmpltId,isParent:true};
        zTreeObj =  $.fn.zTree.init($("#groupsTree"), setting , newNode);
        zTreeObj.reAsyncChildNodes(zTreeObj.getNodes()[0], "refresh", false);

    }

    function initGrid(){
        atomResultArr = Formatter.getSysCode(para_type_cd);     //获取原子类型数组
        $("#tmpltKeysTable").datagrid({
            columns: [[
                {field: 'ATOMID', title: '原子Id', hidden: true},
                {field: 'PARANM', title: '原子名称', width: '20%'},
                {field: 'PARATYPECD', title: '原子类型', width: '20%',
                    formatter: function (value, row, index) {return atomResultArr[value];}},
                {field: 'APRVLEXCPFLAG', title: '是否允许例外', sortable: true, width: '12%',
                    formatter: function (value, rowData, rowIndex) {
                        if(value=="1"){
                            return "<input type='checkbox'  class = 'aprvlExcpFlagCheckBox' id='cb_"+rowData.ATOMID+"' checked ='checked'/>";
                        }else {
                            return "<input type='checkbox'  class = 'aprvlExcpFlagCheckBox' id='cb_"+rowData.ATOMID+"'/>";
                        }
                    }
                },
                {field: 'OUTSIDEFLAG', title: '是否外部可见', sortable: true, width: '12%',
                    formatter: function (value, rowData, rowIndex) {
                        if(value=="1"){
                            return "<input type='checkbox'  class = 'outsideFlagCheckBox' id='cb_"+rowData.ATOMID+"' checked ='checked'/>";
                        }else {
                            return "<input type='checkbox'  class = 'outsideFlagCheckBox' id='cb_"+rowData.ATOMID+"'/>";
                        }
                    }
                },
                {field: 'REQUIREDFLAG', title: '是否为必填项', sortable: true, width: '12%',
                    formatter: function (value, rowData, rowIndex) {
                        if(value=="1"){
                            return "<input type='checkbox'  class = 'requiredFlagCheckBox' id='cb_"+rowData.ATOMID+"' checked ='checked'/>";
                        }else {
                            return "<input type='checkbox'  class = 'requiredFlagCheckBox' id='cb_"+rowData.ATOMID+"'/>";
                        }
                    }
                },
                {field: 'action', title: '操作', width: '15%',
                    formatter: function (value, row, index) {
                        var Action = "<a href='javascript:void(0);' class='deleteRelBtn' id ='del"+row.ATOMID+"'>删除</a>";
                        return Action;
                    }
                }
            ]],
            fitColumns:true,
            width: '100%',
            height: '100%',
            pagination: false,
            rownumbers: true,
            singleSelect: true,
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
                        tmpltKeysArray = groupsAndKeysMap[currentSelectNode.tId];
                    }
                    success(tmpltKeysArray);
                }
            }
        });
    }

    function initFilterForm() {
        getFiltersAndRelatedKeys();                                                         //获取筛选条件和关联原子
        TmpltFilterManage.initFilterForm(tmpltFilterVoArray);                               //调用initFilterForm填充筛选条件表单
    }

    function initGlobalEvent() {
        //新增已有原子
        $("#dataGridArea").on("click", "#selectTmpltKeys", function () {
            var selectedTreeNode = zTreeObj.getSelectedNodes()[0];
            if(selectedTreeNode == undefined){
                $.messager.show({
                    msg:'请选择分组',
                    timeout:1000,
                    style:{ right:'',bottom:''},     //居中显示
                    showType:'slide'
                });
                return false;
            }
            if(selectedTreeNode.grpngId == 0){
                $.messager.show({
                    msg:'根目录不允许创建原子.',
                    timeout:1000,
                    style:{ right:'',bottom:''},     //居中显示
                    showType:'slide'
                });
                return false;
            }
            $("#win_content").empty();                          //清空上次弹窗生成的内容
            $("#win_content").show().dialog({
                width:700,
                height:550,
                modal:true,
                title:"新建已有原子"
            });
            SelectAtom.initialize(selectedTreeNode,selectKeysCallback);
        });

        //删除关联原子
        $("#dataGridArea").delegate("a.deleteRelBtn", "click", function (){
           if(isShowFlag=="true")
               return;
               var ATOMID = $(this).attr("id").substr(3);
                for(var key in groupsAndKeysMap){
                    for(var i = 0; i<groupsAndKeysMap[key].length;i++){
                        if(groupsAndKeysMap[key][i].ATOMID ==ATOMID){
                            groupsAndKeysMap[key].splice(i,1);
                            $("#tmpltKeysTable").datagrid("load");
                            return false;
                        }
                    }
                }

        });
        //设置原子是否允许例外
        $("#dataGridArea").delegate(".aprvlExcpFlagCheckBox", "change", function (){
            var ATOMID = $(this).attr("id").substr(3);
            for(var key in groupsAndKeysMap){
                for(var i = 0; i<groupsAndKeysMap[key].length;i++){
                    if(groupsAndKeysMap[key][i].ATOMID ==ATOMID){
                        if($(this).is(':checked')){
                            groupsAndKeysMap[key][i].APRVLEXCPFLAG = '1';
                        }else{
                            groupsAndKeysMap[key][i].APRVLEXCPFLAG = '0';
                        }
                        return;
                    }
                }
            }
        });
        //设置原子是否外部可见
        $("#dataGridArea").delegate(".outsideFlagCheckBox", "change", function (){
            var ATOMID = $(this).attr("id").substr(3);
            for(var key in groupsAndKeysMap){
                for(var i = 0; i<groupsAndKeysMap[key].length;i++){
                    if(groupsAndKeysMap[key][i].ATOMID ==ATOMID){
                        if($(this).is(':checked')){
                            groupsAndKeysMap[key][i].OUTSIDEFLAG = '1';
                        }else{
                            groupsAndKeysMap[key][i].OUTSIDEFLAG = '0';
                        }
                        return;
                    }
                }
            }
        });
        //设置原子是否为必选项
        $("#dataGridArea").delegate(".requiredFlagCheckBox", "click", function (){
            var ATOMID = $(this).attr("id").substr(3);
            for(var key in groupsAndKeysMap){
                for(var i = 0; i<groupsAndKeysMap[key].length;i++){
                    if(groupsAndKeysMap[key][i].ATOMID ==ATOMID){
                        if($(this).is(':checked')){
                            groupsAndKeysMap[key][i].REQUIREDFLAG = '1';
                        }else{
                            groupsAndKeysMap[key][i].REQUIREDFLAG = '0';
                        }
                        return;
                    }
                }
            }
        });
        //新增模板工作组
        $("#treeContent").on("click", "#add-catalog", function () {
            $("#createGroupWin").empty();                       //清空之前弹窗生成的内容
            $("#createGroupWin").show().dialog({
                width:500,
                height:200,
                modal:true,
                title:"新建要素"
            });
            CreateNewGroup.initialize(currentSelectNode,createGroupCallBack);
        });
        //修改工作组
        $("#treeContent").on("click", "#edit-catalog", function () {
            if (currentSelectNode.level == 0) {
                return;
            }
            oldGroupNodeName = currentSelectNode.name;
            zTreeObj.editName(currentSelectNode);
        });
        //删除工作组
        $("#treeContent").on("click", "#delete-catalog", function () {
            delete groupsAndKeysMap[currentSelectNode.tId]
            zTreeObj.removeNode(currentSelectNode);
        });
        //上移
        $("#treeContent").on("click", "#moveUp-catalog", function () {
            var previousNode = currentSelectNode.getPreNode();
            if (null == previousNode) {
                return;
            }
            zTreeObj.moveNode(previousNode, currentSelectNode, "prev");
            updateMoveStatus(currentSelectNode);
        });
        //下移
        $("#treeContent").on("click", "#moveDown-catalog", function () {
            var nextNode = currentSelectNode.getNextNode();
            if (null == nextNode) {
                return;
            }
            zTreeObj.moveNode(nextNode, currentSelectNode, "next");
            updateMoveStatus(currentSelectNode);
        });
        //新建筛选条件
        $("#filterFormArea").on("click", "#createNewFilter", function () {
            $("#newFilterWin").empty();                         //清空之前弹窗生成的内容
            $("#newFilterWin").show().dialog({
                width:800,
                height:600,
                modal:true,
                title:"新建筛选条件"
            });
            var allGroupsNodes = zTreeObj.getNodes()[0].children;
            CreateNewFilter.initialize(tmpltId,null,allGroupsNodes,groupsAndKeysMap,createFilterCallBack);
        });
        //编辑筛选条件
        $("#filterFormArea").delegate("a.updateFilterBtn","click",function(){
            var screngNm = $(this).attr("name");
            var filterInfo = {};
            for(var i = 0;i<tmpltFilterVoArray.length;i++){
                if(tmpltFilterVoArray[i].screngNm == screngNm){
                    filterInfo = tmpltFilterVoArray[i];
                    break;
                }
            }
            $("#newFilterWin").empty();                         //清空之前弹窗生成的内容
            $("#newFilterWin").show().dialog({
                width:800,
                height:600,
                modal:true,
                title:"编辑筛选条件"
            });
            var allGroupsNodes = zTreeObj.getNodes()[0].children;

            CreateNewFilter.initialize(tmpltId,filterInfo,allGroupsNodes,groupsAndKeysMap,createFilterCallBack);
        });
        //删除筛选条件
        $("#filterFormArea").delegate("a.delFilterBtn","click",function(){
            var $thisBtn = $(this);
           var screngNm = $(this).attr("name");
            for(var i = 0;i<tmpltFilterVoArray.length;i++){
                if(tmpltFilterVoArray[i].screngNm == screngNm){
                    tmpltFilterVoArray.splice(i,1);
                    break;
                }
            }
            $thisBtn.parent().parent().remove();
            TmpltFilterManage.reduceLayoutHeight();
        });
        //保存模板详情
        $("#bottomBtnsForm").on("click", "#saveTmpltDetailBtn", function () {
            //获取属性值
            var catlId = $('input[name="catlId"]').val();
            var tmpltNm = $("#tmpltNm").val();
            /*var chnlCode = $("#chnlCode").combotree("getValues").join(",");
            var authRegnList = $("#authRegnList").combotree("getValues").join(",");*/
            var remark = $("#remark").val();

            if(catlId==null||catlId==""||tmpltNm==null||tmpltNm==""){
                $.messager.alert('Warning','标*属性不得为空！');
                return false;
            }
            var templtInfo = {
                catlId:catlId,
                tmpltNm:tmpltNm,
              /*  chnlCode:chnlCode,
                authRegnList:authRegnList,*/
                remark:remark
            }
            var groupTreeNodes = zTreeObj.getNodes()[0].children;
            var newGroupAndKeyArrayMap = {};
            for(var key in groupsAndKeysMap){
                var atomIdArray = [];
                for(var i = 0;i<groupsAndKeysMap[key].length;i++){
                    var tkmAtomKey = {};
                    tkmAtomKey.atomId = groupsAndKeysMap[key][i].ATOMID;
                    tkmAtomKey.aprvlExcpFlag = groupsAndKeysMap[key][i].APRVLEXCPFLAG;
                    tkmAtomKey.outsideFlag = groupsAndKeysMap[key][i].OUTSIDEFLAG;
                    tkmAtomKey.requiredFlag = groupsAndKeysMap[key][i].REQUIREDFLAG;
                    atomIdArray.push(tkmAtomKey);
                }
                newGroupAndKeyArrayMap[key] = atomIdArray;
            }
            //根据isUpdateFlag发送不同请求
            if(isUpdateFlag){
                templtInfo['tmpltId'] = tmpltId;
                var params = {
                    tmpltInfoJson: JSON.stringify(templtInfo),//模板基本信息（模板名称，模板路径，模板介绍）
                    groupsListJson: JSON.stringify(groupTreeNodes),//模板要素分组
                    groupAndKeysJson:JSON.stringify(newGroupAndKeyArrayMap),//
                    tmpltFilters:JSON.stringify(tmpltFilterVoArray)
                };
                Util.ajax.putJson(Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/tmpltdetail/updatetmpltdetails", params, function (result) {
                    if(result.RSP.RSP_CODE=="1"){
                        $.messager.show({
                            msg:'修改成功',
                            timeout:1000,
                            style:{ right:'',bottom:''},
                            showType:'slide'
                        });
                    }else{
                        $.messager.alert('Warning',result.RSP.RSP_DESC);
                    }
                });
            }else{
                var params = {
                    tmpltInfoJson: JSON.stringify(templtInfo),
                    groupsListJson: JSON.stringify(groupTreeNodes),
                    groupAndKeysJson:JSON.stringify(newGroupAndKeyArrayMap),
                    tmpltFilters:JSON.stringify(tmpltFilterVoArray)
                };
                Util.ajax.postJson(Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/tmpltdetail/savetmpltdetails", params, function (result) {
                    if(result.RSP.RSP_CODE=="1"){
                        $.messager.show({
                            msg:'保存成功',
                            timeout:1000,
                            style:{ right:'',bottom:''},
                            showType:'slide'
                        });
                    }else{
                        $.messager.alert('Warning',result.RSP.RSP_DESC);
                    }
                });
            }

        });
    }

    //选择原子后回调的函数
    function selectKeysCallback(selectKey){
        var hasRelatedKeysArray = groupsAndKeysMap[currentSelectNode.tId];
        for(var i = 0 ;i<hasRelatedKeysArray.length;i++){
            //判断原子是否已存在
            if(hasRelatedKeysArray[i].ATOMID == selectKey.ATOMID ){
                $.messager.show({
                    msg:'该原子已存在',
                    timeout:1000,
                    style:{ right:'',bottom:''},     //居中显示
                    showType:'slide'
                });
                return false;
            }
        }
        groupsAndKeysMap[currentSelectNode.tId] .push(selectKey);
        $("#tmpltKeysTable").datagrid("load");
    }
    //新建分组后回调函数
    function createGroupCallBack(newGroupNode){
        var newAddedNode = zTreeObj.addNodes(currentSelectNode, newGroupNode);          //新增的节点
        var sameNameNodes = zTreeObj.getNodesByParam("name",newAddedNode[0].name,null );
        if(sameNameNodes.length >1){                                                    //有重名则删除该新增节点
            $.messager.show({
                msg:'工作组名称重复.',
                timeout:1000,
                style:{ right:'',bottom:''},     //居中显示
                showType:'slide'
            });
            zTreeObj.removeNode(newAddedNode[0]);
        }else{
            groupsAndKeysMap[newAddedNode[0].tId] = new Array();                        //无重名则增加map键值对
        }
    }
    //新建/修改筛选条件后回调函数
    function createFilterCallBack(oldTmpltFilter,newTmpltFilter,isUpdateFlag){
        var newTmpltFilterInfo = {};
        for(var key in newTmpltFilter ){                                            //复制对象属性，否则指向newTmpltFilter，会对tmpltFilterVoArray造成影响
            newTmpltFilterInfo[key] = newTmpltFilter[key];
        }
        for(var i = 0;i<tmpltFilterVoArray.length;i++){
            if(tmpltFilterVoArray[i].screngNm == newTmpltFilter.screngNm){
                $.messager.show({
                    msg:'筛选条件名称重复.',
                    timeout:1000,
                    style:{ right:'',bottom:''},     //居中显示
                    showType:'slide'
                });
                return false;
            }
        }
         if(isUpdateFlag){                                   //如果是修改筛选条件，则覆盖之前存在的信息
             for(var i =0;i<tmpltFilterVoArray.length;i++){
                 if(tmpltFilterVoArray[i].screngNm == oldTmpltFilter.screngNm){
                     tmpltFilterVoArray[i] = newTmpltFilterInfo;
                     break;
                 }
             }
             $(".updateFilterBtn[name ='"+oldTmpltFilter.screngNm+"']").parent().parent().remove();
             TmpltFilterManage.reduceLayoutHeight();
             TmpltFilterManage.jointFilterInfoToForm(newTmpltFilterInfo);
         }else{                                              //否则直接新增
             tmpltFilterVoArray.push(newTmpltFilterInfo);
             TmpltFilterManage.jointFilterInfoToForm(newTmpltFilterInfo);
         }

        // $("#filterForm").datagrid("load");
    }
    //更改目录操作状态
    function updateOperateStatus(treeNode) {
        if (treeNode.level == 0) {
            if (!$("#edit-catalog").hasClass("disabled")) {
                $("#edit-catalog").addClass("disabled");
            }
            if (!$("#delete-catalog").hasClass("disabled")) {
                $("#delete-catalog").addClass("disabled");
            }
            if ($("#add-catalog").hasClass("disabled")) {
                $("#add-catalog").removeClass("disabled");
            }
        } else {
            if ($("#edit-catalog").hasClass("disabled")) {
                $("#edit-catalog").removeClass("disabled");
            }
            if ($("#delete-catalog").hasClass("disabled")) {
                $("#delete-catalog").removeClass("disabled");
            }
            if (!$("#add-catalog").hasClass("disabled")) {
                $("#add-catalog").addClass("disabled");
            }
        }
        //上移下移图标
        updateMoveStatus(treeNode);
    }
    //更改上移下移操作状态
    function updateMoveStatus(treeNode) {
        if (treeNode.getPreNode() != null) {
            if ($("#moveUp-catalog").hasClass("disabled")) {
                $("#moveUp-catalog").removeClass("disabled");
            }
        } else {
            if (!$("#moveUp-catalog").hasClass("disabled")) {
                $("#moveUp-catalog").addClass("disabled");
                $("#moveUp-catalog").attr("disabled", "true");
            }
        }
        if (treeNode.getNextNode() != null) {
            if ($("#moveDown-catalog").hasClass("disabled")) {
                $("#moveDown-catalog").removeClass("disabled");
            }
        } else {
            if (!$("#moveDown-catalog").hasClass("disabled")) {
                $("#moveDown-catalog").addClass("disabled");
                $("#moveUp-catalog").css("disabled", "true");
            }
        }
    }
    //节点修改名称后调用方法
    function onRenameFunction(){

        var treeNode = zTreeObj.getNodeByParam("tId",currentSelectNode.tId );
        var sameNameNodes = zTreeObj.getNodesByParam("name",zTreeObj.getSelectedNodes()[0].name,null );
        if(sameNameNodes.length >1){
            $.messager.show({
                msg:'工作组名称重复.',
                timeout:1000,
                style:{ right:'',bottom:''},     //居中显示
                showType:'slide'
            });
            treeNode.name = oldGroupNodeName;
            zTreeObj.updateNode(treeNode);
        }else{
            treeNode.name = treeNode.name.trim();
            treeNode.GRPNGNM = treeNode.name;
            zTreeObj.updateNode(treeNode);
        }
    }
    //获取每个工作组关联的原子信息
    function getGroupsRelatedKeys() {
        currentSelectNode = zTreeObj.getNodes()[0];
        var groupTreeNodes = zTreeObj.getNodes()[0].children;
        for(var i= 0;i<groupTreeNodes.length;i++){
            Util.ajax.getJson(Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/tmpltgroups/relatedkeysbygroupid", {grpngId:groupTreeNodes[i].GRPNGID}, function (result) {
                var groupsTid = groupTreeNodes[i].tId;
                groupsAndKeysMap[groupsTid] = result.RSP.DATA;
            },true);
        }
        $("#tmpltKeysTable").datagrid("load");
    }
    //获取每个工作组关联的原子信息
    function getFiltersAndRelatedKeys() {
        tmpltFilterVoArray = [];
        if(isUpdateFlag){
            Util.ajax.getJson(Util.constants.CONTEXT + "/kc/tmplt/tmpltsvc/msa/tmpltfilter/filtersandkeys", {tmpltId:tmpltId}, function (result) {
                tmpltFilterVoArray = result.RSP.DATA;
            },true);

        }
    }


});