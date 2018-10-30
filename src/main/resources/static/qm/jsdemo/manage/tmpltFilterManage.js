define(["jquery", 'util', "easyui","transfer",'ztree-exedit','js/manage/formatter'],function($,Util,EasyUI,Transfer,Ztree,Formatter){

    //根据筛选条件内容拼接div填充到表单中
    function jointFilterInfoToForm(filterInfo){
        var bdboxDiv = "";
        if($("#filterForm").children("div:last").hasClass("bd-boxa")){
            bdboxDiv = "<div class='bd-boxb'>"
        }else{
            bdboxDiv = "<div class='bd-boxa'>"
        }
        //拼接单选类型
        if(filterInfo.screngTypeCd == "2"){
            var optValArray = [];
            if(filterInfo.OPTVAL!=null&&filterInfo.OPTVAL!=undefined){
                optValArray = filterInfo.OPTVAL.split(",");
            }
            var labels = "";
            for(var i =0;i<optValArray.length;i++){
                labels += "<label class='label_radio'><input type='radio' />"+optValArray[i]+"</label>"
            }
            $([
                bdboxDiv ,
                "<div class='bd-dx'><div style='padding-right:20px'>"+filterInfo.screngNm+"</div>  " ,
                " <fieldset class='radios'>" ,
                labels,
                "        </fieldset>" ,
                "</div>" ,
                "<div style='float:right; padding-right:30px; width:100px' class='bd-text1'><a class= 'updateFilterBtn' name='"+filterInfo.screngNm+"'  href='javascript:void(0);'>编辑</a>  |  <a class= 'delFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>删除</a></div>" ,
                "</div>" ,
            ].join("")).appendTo("#filterForm");
        }
        //拼接多选类型
        if(filterInfo.screngTypeCd == "3"){
            var optValArray = filterInfo.OPTVAL.split(",");
            var labels = "";
            for(var i =0;i<optValArray.length;i++){
                labels += "<label class='label_check'><input type='checkbox' />"+optValArray[i]+"</label>"
            }
            $([
                bdboxDiv,
                "<div class='bd-dx'><div style='padding-right:20px'>"+filterInfo.screngNm+"</div>  " ,
                " <fieldset class='checkboxes'>" ,
                labels,
                "</fieldset>" ,
                "</div>" ,
                "<div style='float:right; padding-right:30px; width:100px' class='bd-text1'><a class= 'updateFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>编辑</a>  |  <a class= 'delFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>删除</a></div>" ,
                "</div>" ,
            ].join("")).appendTo("#filterForm");
        }
        //拼接范围类型
        if(filterInfo.screngTypeCd == "9"||filterInfo.screngTypeCd == "11"||filterInfo.screngTypeCd == "12"){
            $([
                bdboxDiv,
                "<div class='bd-dx'><div style='padding-right:20px; float:left'>"+filterInfo.screngNm+"</div>",
                "<div class='formControls col-2'><input type='text' class='easyui-textbox textbox-f' style='width: 100%; height: 30px; display: none;'><span class='textbox easyui-fluid' style='' height: 28px;'><input type='text' class='textbox-text validatebox-text textbox-prompt' autocomplete='off' placeholder=''' style='margin-left: 0px; margin-right: 0px; padding-top: 6px; padding-bottom: 6px; color:#333'></span></div>",
                "<div class='nav' style='margin-left: 80px'>",
                "<p class='set'>"+filterInfo.WKUNIT+"</p>",
                "</div>",
                "</div>",
                "<div style='float:right; padding-right:30px; width:100px' class='bd-text1'><a class= 'updateFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>编辑</a>  |  <a class= 'delFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>删除</a></div>",
                "</div>"
            ].join("")).appendTo("#filterForm");
        }
        //拼接地区类型
        if(filterInfo.screngTypeCd == "16"){
            $([
                bdboxDiv,
                "<div class='bd-dx'><div style='padding-right:20px; float:left'>"+filterInfo.screngNm+"</div>  ",
                "<div class='nav'>",
                "<p class='set'>省份</p>",
                "</div>",
                "<div class='nav'   >",
                "<p class='set'>地市</p>",
                "</div>",
                "<div class='nav'>",
                "<p class='set'>区域</p>",
                "</div>",
                "</div>",
                "<div style='float:right; padding-right:30px; width:100px' class='bd-text1'><a class= 'updateFilterBtn' name='"+filterInfo.screngNm+"' href='javascript:void(0);'>编辑</a>  |  <a class= 'delFilterBtn' name='"+filterInfo.screngNm+"'  href='javascript:void(0);'>删除</a></div>",
                "</div>"
            ].join("")).appendTo("#filterForm");
        }
        addLayoutHeight();
    }

    //展示筛选条件信息
    function initFilterForm(tmpltFilterVoArray) {
        $("#filterForm").empty();
        for (var i = 0; i < tmpltFilterVoArray.length; i++) {
            tmpltFilterVoArray[i].screngNm = tmpltFilterVoArray[i].SCRENGNM;
            tmpltFilterVoArray[i].screngTypeCd = tmpltFilterVoArray[i].SCRENGTYPECD;
            jointFilterInfoToForm(tmpltFilterVoArray[i]);
        }
    }

    //根据筛选条件的增加加高布局高度
    function addLayoutHeight(){
        var filterFormAreaHeight = $("#filterFormArea").height();
        var tmpltDetailLayoutHeight = $("#tmpltDetailLayout").height();
        var tmpltDetailMainLayoutHeight = $("#tmpltDetailMainLayout").height();
        $("#filterFormArea").height(filterFormAreaHeight + 52);
        $("#tmpltDetailLayout").height(tmpltDetailLayoutHeight + 52);
        $("#tmpltDetailMainLayout").height(tmpltDetailMainLayoutHeight + 52);
    }
    //根据筛选条件的增加降低布局高度
    function reduceLayoutHeight(){
        var filterFormAreaHeight = $("#filterFormArea").height();
        var tmpltDetailLayoutHeight = $("#tmpltDetailLayout").height();
        var tmpltDetailMainLayoutHeight = $("#tmpltDetailMainLayout").height();
        $("#filterFormArea").height(filterFormAreaHeight - 52);
        $("#tmpltDetailLayout").height(tmpltDetailLayoutHeight - 52);
        $("#tmpltDetailMainLayout").height(tmpltDetailMainLayoutHeight - 52);
    }
    return {
        jointFilterInfoToForm : jointFilterInfoToForm,
        initFilterForm : initFilterForm,
        addLayoutHeight:addLayoutHeight,
        reduceLayoutHeight:reduceLayoutHeight
    }
});

