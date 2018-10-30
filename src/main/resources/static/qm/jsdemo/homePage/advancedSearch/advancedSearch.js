 define(['util','js/homePage/page/page','js/homePage/validator/validator','js/homePage/date/date','js/homePage/dialog/dialog','js/homePage/selectTree/selectTree','js/homePage/groupSearchForm/groupSearchForm','js/homePage/kmUtil','text!js/homePage/advancedSearch/advancedSearch.tpl','js/homePage/constants/constants','js/homePage/select/select'],
 function(Util,Pagination,Validator,MyDate,Dialog,selectTree,GroupSearchForm,KmUtil,advancedSearch,Constants,Select){
      //系统变量-定义该模块的根节点
     var $el = $(advancedSearch);
     this.context=$el;
     var logNm;   //弹出框的名称("新增模板"或"修改模板")
     var id;  //标签id
     var name; //标签名称
     var searchType ="2";//优先全文搜索
     var kw = "";
     var groupSearchForm;
     var doubleDates;
    var initialize = function (data) {
        logNm = "高级搜索";
        var ok = function(){
            var text =  groupSearchForm.getData()["text"].trim();
            var suggestionWords ="";

            //提示词查询
            var url = Constants.AJAXURL+'/srchKeyword/searchSuggestionWords';
            var param = {
                keyword: text
            };
            Util.ajax.postJson(url,param,function(json,status){
                if (status){
                    var oject1 = $.parseJSON(json.object);
                    var flag = oject1.object.hasOwnProperty("suggestionWords");
                    if (flag) {
                        var suggestionWordsObj = oject1.object.suggestionWords;
                        var suggestionWordsArr = [];
                        if(suggestionWordsObj.length > 0) {
                            for (var i = 0; i <= suggestionWordsObj.length - 1; i++) {
                                var keyName = suggestionWordsObj[i].keyword;
                                suggestionWordsArr.push(keyName);
                            }
                            suggestionWords = suggestionWordsArr.join(",");
                        }
                    } else{
                        suggestionWords = '';
                    }
                }else{
                    suggestionWords = '';
                }
                var title =  groupSearchForm.getData()["title"].trim();
                var operName =  groupSearchForm.getData()["operName"].trim();
                var lastOperName =  groupSearchForm.getData()["lastOperName"].trim();
                var startTime = groupSearchForm.getData()["startTime"];
                var endTime = groupSearchForm.getData()["endTime"];

                if((title == null || title =="")&&(text == null ||text == "")&&(operName == null ||operName == "")&&(lastOperName == null ||lastOperName == "")&&(startTime == null ||startTime == "")&&(endTime == null ||endTime == "")){
                    new Dialog({
                        mode: 'tips',
                        tipsType:'error',
                        delayRmove: 3,
                        quickClose: true,
                        content: '搜索条件不能同时为空！'
                    });
                    return false;
                }

                if(title != null&&title !=""){
                    searchType = "1"
                    kw =title;
                }
                if(text != null && text != ""){
                    searchType = "2"
                    kw =text;
                }

                //搜索
                var cname = data.cname;
                var sid = data.sid;
                var cid = data.cid;
                var scope = data.cid;
                var leve = data.leve;
                var url = Constants.PREAJAXURL + "/src/modules/knowledgeAppNew/secKmSearchList.html?" + "kw=" + kw + "&scope=" + scope + "&cname=" + cname + "&sid=" + sid + "&cid=" + cid + "&leve=" + leve + "&suggestionWords="+ suggestionWords +"&searchType=" + searchType
                    + "&startValue=" + startTime +"&lastValue=" + endTime + "&operName=" + operName + "&lastOperName=" + lastOperName + "&advanceFlag=1";
                KmUtil.openTab("知识库-搜索列表", url, {});
            });

        };
        var cancel = function(){};
        var config = {
           mode:'normal',
           title:logNm,
           content:advancedSearch,
           ok:ok,
           okValue: '搜索',
           cancel: cancel,
           cancelValue: '取消',
           cancelDisplay:true,
           width:600,
           height:160,
           skin:'dialogSkin',  //设置对话框额外的className参数
           fixed:false,
           quickClose:false ,
           modal:true
       }

       new Dialog(config);  //初始化对话框
        groupFormCondtion();

       //timeSet("editTime","editTime",null);
    }

    // function timeSet (id,name,defaultTime) {
    //      doubleDates = new MyDate( {
    //         el:'#'+id,
    //         label:'开始结束时间',
    //         double:{    //支持一个字段里显示两个日期选择框
    //             start:{
    //                 name:'startTime',
    //                 inputClassName:'',
    //                 format: 'yyyy-MM-dd HH:mm:ss',
    //                 type:'datetime',
    //                 min: '2017-06-16 23:59:59',
    //                 max: '2099-06-16 23:59:59',
    //                 defaultValue:nowTime(0,'yyyy-MM-dd HH:mm:ss'),
    //                 hmsflag:true,
    //                 inputPlaceholder:"请选择",
    //                 isReadOnly:true,  //项可设置日期输入框是否只读
    //                 done: function(datas,value,endDate){
    //                     doubleDates.options.double.end.min = datas;     //设置结束日期的最小限制
    //                     console.log(datas);
    //                 }
    //             },
    //             end:{
    //                 name:'endTime',
    //                 inputClassName:'',
    //                 format: 'yyyy-MM-dd HH:mm:ss',
    //                 type:'datetime',
    //                 min: '2017-09-11 12:12:02',
    //                 max: '2099-06-16 23:59:59',
    //                 inputPlaceholder:"请选择",
    //                 value:'2017-09-14 02:02:02',
    //                 isReadOnly:true,  //项可设置日期输入框是否只读
    //                 done: function(datas,value){
    //                     doubleDates.options.double.start.max = datas;     //设置开始日期的最大日期
    //                 }
    //             }
    //         }
    //     });
    // }

    function groupFormCondtion() {
        // var buttonGroupConfig = {
        //     items: [ //按钮配置集合
        //         {
        //             className: 'search',
        //             text: '查询',
        //             type: '1',
        //             click: function() {
        //                 param = {
        //                     crowdFundingNm:groupSearchForm.getData()["crowdFundingNm"].trim(),
        //                     opPrsnId:groupSearchForm.getData()["opPrsnId"].trim(),
        //                     crowdFundingNm:groupSearchForm.getData()["crowdFundingNm"].trim(),
        //                     opPrsnId:groupSearchForm.getData()["opPrsnId"].trim(),
        //
        //                     startTime:groupSearchForm.getData()["startTime"],
        //                     endTime:groupSearchForm.getData()["endTime"],
        //                 };
        //                 if(groupSearchForm.getData()["crowdFundingNm"] == ""){
        //                     delete param["crowdFundingNm"];
        //                 }
        //                 if(groupSearchForm.getData()["opPrsnId"] == ""){
        //                     delete param["opPrsnId"];
        //                 }
        //                 if(groupSearchForm.getData()["taskStatus"] == ""){
        //                     delete param["taskStatus"];
        //                 }
        //                 if(param["startTime"] == ""||undefined == param["startTime"]){
        //                     delete param["startTime"];
        //                 }
        //                 if(param["endTime"] == ""||undefined == param["endTime"]){
        //                     delete param["endTime"];
        //                 }
        //                 dataList.search(param)
        //             }
        //         }, {
        //             className: 'reset',
        //             text: '重置',
        //             type: '0',
        //             click: function() {
        //                 groupSearchForm.reset(); //将所有表单元素重置为初始值
        //                 dataList.search();
        //                 groupSearchForm.options.items[2].compt[0].options.max = '2099-01-01 00:00:00';
        //                 groupSearchForm.options.items[2].compt[1].options.min = '2000-01-01 00:00:00';
        //             }
        //         }
        //     ]
        // };

        /**
         * 组合表单
         */
        var groupConfig = {
            el: $('#addForm'),
            className: 'groupSearchForm',
            //title: '众筹任务管理',
            column: 2,//表单列数
            advancedQuery: -1,
            items: [
                {
                    element: 'input',
                    label: '正文',
                    name: 'text',
                    config: { //自定义config,如果element是input，可选值为：className,attr
                        className: '',
                        attr: { //input的属性
                            placeholder: ''
                        }
                    }
                },{
                    element: 'input',
                    label: '标题',
                    name: 'title',
                    config: { //自定义config,如果element是input，可选值为：className,attr
                        className: '',
                        attr: { //input的属性
                            placeholder: ''
                        }
                    }
                },{
                    element: 'doubleDate',
                    label: ['采编开始时间', '采编结束时间'],
                    config: [{
                        type: "datetime",
                        format: 'yyyy-MM-dd HH:mm:ss'
                    }, {
                        type: "datetime",
                        format: 'yyyy-MM-dd HH:mm:ss'
                    }],
                    name: ['startTime', 'endTime']
                },
                {
                    element: 'input',
                    label: '采编人',
                    name: 'operName',
                    config: { //自定义config,如果element是input，可选值为：className,attr
                        className: '',
                        attr: { //input的属性
                            placeholder: ''
                        }
                    }
                },
                {
                    element: 'input',
                    label: '最后更新人',
                    name: 'lastOperName',
                    config: { //自定义config,如果element是input，可选值为：className,attr
                        className: '',
                        attr: { //input的属性
                            placeholder: ''
                        }
                    }
                }
            ],
           /* button: {
                position: 'right',
                config: buttonGroupConfig
            }*/
        };

        groupSearchForm = new GroupSearchForm(groupConfig);

    }
     return initialize;

 });
