/**
 * 技能配置样例
 */
require(["jquery", 'util', 'transfer', 'catalogTemplateInteractive', 'easyui', ''], function ($, Util, Transfer, Interactive) {

    var $page, $search;

    var knwlgGathrType_Name = "NGKM.KNOWLEDGE.TYPE";  //知识类型

    var maxLevel = 3;//地区默认值3

    var chnlCode_Name = "NGKM.TEMPLET.CHNL";  //渠道显示

    var templt_chnl_cd = 'NGKM.TEMPLET.CHNL';   //模板渠道编码

    var flag = false;

    var i = 0;


    initialize();

    /**
     * 初始化
     */
    function initialize() {

        // 初始化 dom
        $page = $("<div id='upSearch'></div><div id='downResult'></div>");


        $page = $page.appendTo($("#page_content"));//appendTo() 方法在被选元素的结尾插入 HTML 元素。
        // $(document).find("#win_content").layout();


        addSearchForm();
        addSearchResult();
        initSearchForm();
        InitWebUpload();


    };

    function InitWebUpload() {


        var $ = jQuery,
            $list = $('#thelist'),
            $btn = $('#ctlBtn'),
            state = 'pending',
            uploader;

        uploader = WebUploader.create({

            // 不压缩image
            resize: false,

            // swf文件路径
            swf: '../../assets/lib/webuploader/Uploader.swf',

            // 文件接收服务端。
            server: Util.constants.CONTEXT + "/kc/configservice/docGjfiles/upload",

            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            // pick: '#picker'
            pick: {
                id: '#picker',
                multiple: true
            },
            accept:{
                title: '只支持html格式',
                extensions: 'html,htm',
                mimeTypes: '.html,.htm'
            }

        });

        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {
            $list.append('<div id="' + file.id + '" class="item">' +
                '<h4 class="info">' + file.name + '</h4>' +
                '<p class="state">等待上传...</p>' +
                '</div>');
        });

        // 文件上传过程中创建进度条实时显示。
        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress .progress-bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<div class="progress progress-striped active">' +
                    '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                    '</div>' +
                    '</div>').appendTo($li).find('.progress-bar');
            }

            $li.find('p.state').text('上传中');

            $percent.css('width', percentage * 100 + '%');
        });

        uploader.on('uploadSuccess', function (file, response) {
            var stats = response.RSP.RSP_CODE;
            if (stats == "1" || stats == 1) {
                $('#' + file.id).find('p.state').text('已上传');
            } else {
                $('#' + file.id).find('p.state').text('FTP链接超时,请重新上传');
            }
        });

        uploader.on('uploadError', function (file) {
            $('#' + file.id).find('p.state').text('上传出错');
        });

        uploader.on('uploadComplete', function (file) {
            $('#' + file.id).find('.progress').fadeOut();
        });

        uploader.on('all', function (type) {
            if (type === 'startUpload') {
                state = 'uploading';
            } else if (type === 'stopUpload') {
                state = 'paused';
            } else if (type === 'uploadFinished') {
                state = 'done';
            }

            if (state === 'uploading') {
                $btn.text('暂停上传');
            } else {
                $btn.text('开始上传');
            }
        });

        uploader.on('uploadBeforeSend', function (obj, data) {
            //传入表单参数
            data = $.extend(data, {
                "notePath": $("#notePath").combobox('getValue'),  //知识目录
                "tmpltId": $("#tmpltId").combobox('getValue'),   //知识模板 模版id
                "rsrvStr2": $("#rsrvStr2").combotree('getValue'), //知识渠道
                "regnId": $("#regnId").combotree('getValue')//知识地区
            });

        });
        //上传按钮触发事件
        $btn.on('click', function () {
            var notePath = $("#notePath").combobox('getValue');  //知识目录
            var tmpltId = $("#tmpltId").combobox('getValue');   //知识模板 模版id
            var rsrvStr2 = $("#rsrvStr2").combotree('getValue'); //知识渠道
            var regnId = $("#regnId").combotree('getValue');//知识地区
            if (notePath == "" || notePath == null || notePath == undefined) {
                $.messager.alert("温馨提示", "知识目录不能为空,请您选择知识目录");
                return;
            }
            if (tmpltId == "" || tmpltId == null || tmpltId == undefined) {
                $.messager.alert("温馨提示", "知识模板不能为空,请你选择知识模板");
                return;
            }
            if (rsrvStr2 == "" || rsrvStr2 == null || rsrvStr2 == undefined) {
                $.messager.alert("温馨提示", "知识渠道不能为空,请你选择知识渠道");
                return;
            }
            if (regnId == "" || regnId == null || regnId == undefined) {
                $.messager.alert("温馨提示", "知识地区不能为空,请你选择知识地区");
                return;
            }


            if (state === 'uploading') {
                uploader.stop();
            } else {
                uploader.upload();
            }
        });

        //刷新
        $("#resetId").on('click', function () {
            window.location.reload();
        });

        //清空
        $("#clearId").on('click', function () {
            debugger
            // 移除所有缩略图并将上传文件移出上传序列
            for (var i = 0; i < uploader.getFiles().length; i++) {
                // 将图片从上传序列移除
                uploader.removeFile(uploader.getFiles()[i]);

                // 将图片从缩略图容器移除
                var $li = $('#' + uploader.getFiles()[i].id);
                $li.off().remove();
            }

            state='pedding';

            // 重置文件总个数和总大小
            fileCount = 0;
            fileSize = 0;
            // 重置uploader，目前只重置了文件队列
            uploader.reset();

        });




    }


    /**
     * append search form
     */
    function addSearchForm() {
        $search = $([

            "<div class='panel-search'>",
            "<div class='text-bold'>上传数据</div>",

            "<form id='upload-form0' class='form form-horizontal' method='post' enctype='multipart/form-data'>",

            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color: red'>*</span>知识目录：</label>",
            "<div class='formControls col-8'>",
            "<input type='text' id='notePath' class='easyui-combotree' name='notePath' style='width:100%;height:30px' >",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color: red'>*</span>知识模板：</label>",
            "<div class='formControls col-8'>",
            "<input type='text' id='tmpltId' class='easyui-combobox' name='tmpltId' style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color: red'>*</span>知识渠道：</label>",
            "<div class='formControls col-8'>",
            "<input class='easyui-combotree' id='rsrvStr2' name='rsrvStr2' style='width:100%;height:30px'>",
            "</div>",
            "</div>",

            "<div class='row cl'>",
            "<label class='form-label col-2'><span style='color: red'>*</span>知识地区：</label>",
            "<div class='formControls col-8'>",
            "<input type='text' class='easyui-combotree' id='regnId' name='regnId' style='width:100%;height:30px' >",
            "</div>",
            "</div>",


            // "<div class='row cl'>",
            // "<label class='form-label col-2'></label>",
            // "<div id='uploadID' class='formControls col-8'>",
            // "<input id='onlineFileName0' name='docFile' class='easyui-tooltip easyui-filebox ' type='text' style='width:90%;height:30px;title=' >",
            // "<a href='javascript:void(0)' id='btn-add' class='btn btn-green radius mt-l-5'>+</a>",
            // "</div>",
            // "</div>",


            "</form>",
            "</div>"
        ].join("")).appendTo($("#upSearch"));
    }

    function addOneFileBox(i) {
        $([
            "<form id='upload-form" + i + "' class='form form-horizontal' method='post' enctype='multipart/form-data'>",
            "<div class='row cl'>",
            "<label class='form-label col-2'></label>",
            "<div id='uploadID' class='formControls col-8'>",
            "<input id='onlineFileName" + i + "'  name='docFile' class='easyui-tooltip easyui-filebox ' type='text' style='width:100%;height:30px;title=' >",
            "</div>",
            "</div>",
            "</form>",
        ].join("")).appendTo($("#upload-form0"));
    }

    function addSearchResult() {
        $([
            "<div class='panel-body'>",

            "<div class='text-bold'><span style='color: red'>上传结果</span></div>",

            "<div id='uploader' class='wu-example'>",
            <!--待上传的文件列表，用来存放文件信息-->
            "<div id='thelist' class='uploader-list'></div>",
            "<div class='btns'>",
            "<div id='picker'>选择文件</div>",
            "<button id='ctlBtn' class='btn btn-danger'>开始上传</button>",
            "<button id='clearId' class='btn btn-danger' >清空结果</button>",
            "<button id='resetId' class='btn btn-danger' >刷新页面</button>",
            "</div>",
            "</div>",

            "</div>"
        ].join("")).appendTo($("#downResult"));

    }

    function initSearchForm() {

        $search.find("a.btn").linkbutton();
        $search.find("input.easyui-datetimebox").datetimebox();
        $search.find("input.easyui-textbox").textbox();

        /**
         * 知识目录
         */
        $search.find('input[name="notePath"]').combotree({
            url: Util.constants.CONTEXT + "/kc/configservice/docCatalog/getCatalog?id=0&time=" + new Date().getTime(),//Ajax获取数据的地址
            method: "GET",
            textField: 'name',
            panelHeight: '180',
            autoParam: ["id"],
            editable: false,
            loadFilter: function (datas) {
                /*var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                var treeJson = [];
                if (data && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var json ={};
                        json.id = data[i].id;
                        json.text = data[i].name;
                        if (data[i].isParent) {
                            json.state = 'closed';
                        }
                        treeJson.push(json);
                    }
                }
                return treeJson;*/
                var data;
                data = Transfer.Combobox.transfer(datas);
                if (datas.RSP.DATA[0].children) {
                    data = datas.RSP.DATA[0].children;
                } else {
                    data = datas.RSP.DATA;
                }
                for (var i = 0; i < data.length; i++) {
                    data[i].text = data[i].name;
                    data[i].id = data[i].id;
                    if (data[i].isParent) {
                        data[i].state = 'closed';
                    }
                }
                return data;
            },
            onBeforeExpand: function (node, param) {    // 下拉树异步
                // if(node.id!="0"){
                $('#notePath').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/docCatalog/getCatalog?id=" + node.id;
                //  }

                //$(this).tree('options').url = Util.constants.CONTEXT + "/catalogs/subs/"+node.id;
            },
        });


        /**
         * 知识模板
         */

        $search.find('input[name="tmpltId"]').combobox({
            url: Util.constants.CONTEXT + "/kc/configservice/catalog/templates/tmpltinfos",
            method: "GET",
            // data: a: CRM.getEnumArr("Pr("PLATFORM_ACCOUNT_STATE@CS_IR"),
            valueField: 'TMPLTID',
            textField: 'TMPLTNM',
            panelHeight: 180,
            editable: false,
            loadFilter: function (data) {
                return Transfer.Combobox.transfer(data);
            }
        });


        /**
         * 知识渠道
         */
        $search.find('input[name="rsrvStr2"]').combotree({
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getStaticDataByTypeId?typeId=" + templt_chnl_cd,
            multiple: false,         //可多选
            editable: false,
            panelHeight: 'auto',
            loadFilter: function (result) {
                var chnlCodeArray = [];
                for (var i = 0; i < result.RSP.DATA.length; i++) {
                    var chnlCode = {};
                    chnlCode.text = (result.RSP.DATA[i]).DATANAME;
                    chnlCode.id = (result.RSP.DATA[i]).DATAVALUE;
                    chnlCodeArray.push(chnlCode);
                }
                return chnlCodeArray;           //过滤数据
            }
        });

        /**
         * 知识地区
         */
        $search.find('input[name="regnId"]').combotree({
            url: Util.constants.CONTEXT + "/kc/configservice/kmconfig/getRootById?v=" + new Date().getTime(),
            method: "GET",
            panelHeight: '180',
            panelMaxHeight: "180",
            editable: false,
            loadFilter: function (datas) {
                var data = Transfer.Combobox.transfer(datas);          //返回的数据格式不符合要求，通过loadFilter来设置显示数据
                var treeJson = [];
                if (data && data.length > 0 > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var json = {};
                        json.id = data[i].id;
                        json.text = data[i].name;
                        if (data[i].isParent) {
                            json.state = 'closed';
                        }
                        treeJson.push(json);
                    }
                }
                return treeJson;
            },
            onBeforeExpand: function (node, param) {    // 下拉树异步
                $('#regnId').combotree("tree").tree("options").url = Util.constants.CONTEXT + "/kc/configservice/kmconfig/getDistrictBySuprRegnId?maxLevel=" + maxLevel + +node.id;

            },

        });

        //第一次初始化fileBox
        // InitFileBoxFirst();
        //初始化上传
        // InitEventUpload();
        //添加+
        // $search.on('click','#btn-add',function(){
        //     i++;
        //     addOneFileBox(i);
        //     InitFileBox(i);
        // });

    }

    // function InitFileBox(i){
    //
    //     $page.find('#onlineFileName'+i).filebox({
    //         buttonText: '选择文件',
    //         prompt: '请选择上传',
    //         buttonAlign: 'right'
    //     });
    //     $page.find("#onlineFileName"+i).textbox("textbox").attr("title", "仅支持html文件格式");
    //
    // }

    // function InitFileBoxFirst() {
    //
    //     $page.find('#onlineFileName0').filebox({
    //         buttonText: '选择文件',
    //         prompt: '请选择上传',
    //         buttonAlign: 'right',
    //         multiple: true
    //     });
    //
    //     $page.find("#onlineFileName0").textbox("textbox").attr("title", "仅支持html文件格式");
    // }

    // function InitEventUpload(){
    //
    //     $page.on("click", "#btn-upload", function () {
    //
    //         $(".showResultDiv").remove();
    //
    //         for(var j=0;j<=i;j++){
    //             var file = $page.find("#onlineFileName"+j).filebox("getValue");
    //
    //             var fileType = file.slice(file.lastIndexOf(".") + 1, file.length);
    //             // fileName = file.slice(file.lastIndexOf("\\") + 1, file.length);
    //             if (fileType.length == 0) {
    //                 $.messager.alert("温馨提示", "请选择上传文件");
    //                 return;
    //             }
    //             if (["html"].indexOf(fileType) == -1) {
    //                 $.messager.alert("温馨提示", "文件类型有误, 请选择html文件");
    //                 return;
    //             }
    //             // $("#upload-form"+j).form('submit', {
    //             //     url : Util.constants.CONTEXT + "/docGjfiles/upload",
    //             //     method : "POST",
    //             //     dataType : "json",
    //             //     async : false,
    //             //     onSubmit: function () {
    //             //
    //             //     },
    //             //     success: function (result) {
    //             //         result = JSON.parse(result);
    //             //         if (result.RSP.RSP_CODE == "1") {
    //             //
    //             //             $("<div class='showResultDiv'  style='color: green;margin-left:10px'>" + result.RSP.RSP_DESC + "上传成功</div>").appendTo($("#upResult_Id"));
    //             //             var fileName = result.RSP.RSP_DESC;
    //             //             var fileid = result.RSP.ATTACH.TOTAL; // ftp fileId
    //             //             /**
    //             //              * 保存记录到数据库
    //             //              */
    //             //             saveRecondToSql(fileid,fileName);
    //             //         } else if (result.RSP.RSP_CODE == "2") {
    //             //             $.messager.alert("温馨提示", ""+result.RSP.RSP_DESC);
    //             //         }
    //             //     },
    //             //     error: function (data) {
    //             //         $.messager.alert("提示", "操作异常！");
    //             //     }
    //             // });
    //             $page.find("#onlineFileName"+j).filebox("clear");
    //         }
    //
    //     })
    // }

    /**
     * 保存记录到数据库
     */
    // function saveRecondToSql(fileid,fileName) {
    //
    //     var params = {
    //         "notePath": $("#notePath").combobox('getValue'),  //知识目录
    //         "tmpltId": $("#tmpltId").combobox('getValue'),   //知识模板 模版id
    //         "rsrvStr2": $("#rsrvStr2").combotree('getValue'), //知识渠道
    //         "regnId": $("#regnId").combotree('getValue'),//知识地区
    //         "fileId": fileid,    //ftp服务器fileid
    //         "fileName": fileName, //知识点文件名称
    //         "fileState": 0     //文件状态
    //     }
    //
    //     Util.ajax.postJson(Util.constants.CONTEXT + "/docGjfiles/save", params, function (result) {
    //         if (result.RSP.RSP_CODE == "1") {
    //             $.messager.alert('上传提示', '' + result.RSP.RSP_DESC);
    //             for(var z =1;z<=i;z++){
    //                 $("#upload-form"+z).remove();
    //             }
    //             i=0;
    //         } else {
    //             $.messager.alert('上传提示', '' + result.RSP.RSP_DESC);
    //         }
    //     });
    // }

});
