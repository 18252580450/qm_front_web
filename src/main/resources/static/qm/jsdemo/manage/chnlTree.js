define(['util','ztree-exedit','text!html/manage/chnlTree.tpl'],
    function(Util,ZTree,Tpl){
       var checkId=[];//选择数组
       var ztree;//角色树
       var chnlCode = "";
       var nodeData;
          var roleTree = function(){
              if(nodeData != undefined && nodeData.length>0 && chnlCode != ""){
                  var chnlCodes = chnlCode.split(",");
                  for(var i = 0; i<nodeData.length; i++){
                        nodeData[i].checked = false;
                  }

                  for(var i = 0; i<chnlCodes.length; i++){
                      var oneChnlCode = chnlCodes[i];
                      for(var j = 0; j<nodeData.length; j++){
                          var oneNodeData = nodeData[j];
                          if(oneChnlCode == oneNodeData.value){
                              oneNodeData.checked = true;
                          }
                      }
                  }
              }else{
                for(var i = 0; i<nodeData.length; i++){
                    nodeData[i].checked = true;
                }
              }
              var config = {
                 check:{
                     enable:true, //设置节点上是否显示 checkbox或radio
                     chkDisabledInherit: true //为true时继承父节点的chkDisabled属性，为false时不继承,不设置默认为false
                 }
              }
              ztree = $.fn.zTree.init($('#chnlTreeData'), config, nodeData);
         };

         // var roleGroup = function(e1,chnlTreeData, AcceptPrePusFlag) {
         //     nodeData = chnlTreeData;
         //     chnlCode=$(e1).val();
             // var dialogConfig = {
             //     title: '渠道',
             //     content: Tpl,
             //     modal: true,
             //     cancelValue: '取消',
             //     width: 600,
             //     height: 400,
             //     cancel: function (){
             //         return true;
             //     }
             // };

             $("#chnlTreeData").show().window({
                                 width:600,
                                 height:400,
                                 modal:true,
                                 title:"渠道"

                             });


             // $.messager.window('渠道', ' ', function(confirm) {
             //              if (confirm) {
             //                  alert("confirm");
             //              }
             // }

             // if(!AcceptPrePusFlag){
                 // dialogConfig.ok = function () {
                 //     checkId=ztree.getCheckedNodes(true);
                 //     var chnlCodes="";
                 //     var chnlCodeNm="";
                 //     for(var i =0; i <checkId.length; i++){
                 //         chnlCodes+=checkId[i].value+",";
                 //         chnlCodeNm+=checkId[i].name+",";
                 //     }
                 //     chnlCodes=chnlCodes.substr(0,chnlCodes.length-1);
                 //     chnlCodeNm=chnlCodeNm.substr(0,chnlCodeNm.length-1);
                 //
                 //     if(!chnlCodes){
                 //         $.messager.alert('温馨提示', '请至少选择一个渠道');
                 //         return;
                 //         // new Dialog({
                 //         //     mode: 'tips',
                 //         //     tipsType: 'error',
                 //         //     content: '请至少选择一个渠道'
                 //         // });
                 //         // return false;
                 //     }
                 //
                 //     $(e1).val(chnlCodes);
                 //     if($(e1).selector == "#chnlCode"){
                 //         $("#knwlgChnlCode").val(chnlCodeNm);
                 //     }
                 //
                 //     return true;
                 // };

                 // dialogConfig.okValue = "确定";
             // }

             // new Dialog(dialogConfig);
             // roleTree();
         // };
          // return roleGroup;
        });
