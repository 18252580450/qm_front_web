/**
 * 技能配置样例
 */
define(["jquery", "loading", 'util', "easyui"], function ($, Loading, Util) {

        var $dialog;
        var catalogId;
        var tagIdArr = [];
        var isCreate;
        var checkedMultiMedia;
        var attachId;
        var interactive;

        var showMultiMediaDialog = function (options) {
            catalogId = options.catalogId;
            isCreate = options.isCreate;
            checkedMultiMedia = options.checkedMultiMedia;
            interactive = options.interactive;
            $dialog = $("#".concat(options.windowId));
            $("#".concat(options.windowId)).empty();
            var content = $.extend({
                width: 700,
                height: 570,
                contentId: "windowContent",
                footerId: "windowFooter"
            }, options);
            showWindow(content);
            addWindowLayout(content);
            reloadValidatebox();
            addWindowContentDom(content);
            initWindowContent();
            bindWindowEvent();
        };

        function bindWindowEvent() {
            /**
             * 添加标签
             */
            $dialog.on("click", "#add", function () {
                var tagId = $("#MEDIATAG").combobox("getValue");
                if (!tagId) {
                    $.messager.alert('温馨提示', '请选择要添加的标签');
                    return;
                }
                addTagListAction({
                    "tagId": tagId,
                    "tagName": $("#MEDIATAG").combobox("getText")
                });
            });

            /**
             * 删除标签
             */
            $dialog.on("click", ".formwork-del", function () {
                removeTagAction(this.id);
            });

            /**
             * 上传多媒体素材文件
             */
            $dialog.on("click", "#btn-upload", function () {
                uploadMultiMediaAction();
            });

            /**
             * 关闭窗口
             */
            $dialog.on("click", "#closeWindow", function () {
                $("a.panel-tool-close").click();
                $dialog.find("#updateMultiMedia").form('clear');
            });

            /**
             * 保存
             */
            $dialog.on("click", "#submitMultiMedia", function () {
                if (verifyMultiMediaOfInput()) {
                    return;
                }
                var multiMedia = {
                    MEDIABUSITYPE: parseInt(catalogId),
                    MEDIANM: $("#MEDIANM").textbox("getValue"),
                    MEDIATYPE: $("#MEDIATYPE").textbox("getValue"),
                    MEDIAKEYS: $("#MEDIAKEYS").textbox("getValue"),
                    MEDIATAG: tagIdArr.join(","),
                    MEDIADESC: $("#MEDIADESC").textbox("getValue"),
                    MEDIADURATION: parseInt($("#MEDIADURATION").textbox("getValue")),
                    MEDIASIZE: $("#MEDIASIZE").textbox("getValue"),
                    MEDIADPI: $("#MEDIADPI").textbox("getValue"),
                    FLAG: 1,
                    ATTACHID: attachId
                };
                interactive.insertMultiMediaInfo(multiMedia, saveSuccessAction, saveFailureAction);
                $("a.panel-tool-close").click();
            });
        }

        function uploadMultiMediaAction() {
            Loading.showLoading("正在上传多媒体素材，请稍后");
            attachId = "";
            //$dialog.find("#onlineFileName").textbox("textbox").attr("title", "仅支持jpg、mp3、mp4文件格式");
            interactive.uploadMultiMedia({"$uploadForm": $("#updateMultiMedia")}, setAlreadyUpload, existErrorAction);
        }

        function saveSuccessAction() {
            $('#multiMediaGrid').datagrid('reload');
        }

        function saveFailureAction() {
            $.messager.alert("温馨提示", "保存失败!");
        }

        function verifyMultiMediaOfInput() {
            if (!$dialog.find("#MEDIANM").validatebox("isValid")) {
                return true;
            }
            if (!$dialog.find("#MEDIADURATION").validatebox("isValid")) {
                return true;
            }
            if (!$dialog.find("#MEDIASIZE").validatebox("isValid")) {
                return true;
            }
            if (!$dialog.find("#MEDIADPI").validatebox("isValid")) {
                return true;
            }
            if (!attachId) {
                return true;
            }
            return false;
        }

        function existErrorAction() {
            $.messager.alert("温馨提示", "上传失败, 请重新上传!");
            Loading.destroyLoading();
        }

        function addTagListAction(option) {
            if (tagIdArr.indexOf(option.tagId) != -1) {
                $.messager.alert('温馨提示', '该标签已经存在');
                return;
            }
            addTag(option);
            tagIdArr.push(option.tagId);
            $.messager.alert('温馨提示', '标签增加成功');
        }

        function removeTagAction(id) {
            $("#" + id + "li").remove();
            tagIdArr.splice(tagIdArr.indexOf(id), 1);
            $.messager.alert('温馨提示', '标签删除成功');
        }

        function addTag(options) {
            $(["<li id='" + options.tagId + "li'>",
                "<a class='link-blue text_omission' tmpltId = '" + options.tagId + "' href='javascript:void(0)' title = '" + options.tagName + "' >" + options.tagName + "</a>",
                "<a class='formwork-del' id = '" + options.tagId + "' href='javascript:void(0)'></a></li>",
                "</li>"].join("")).appendTo("#".concat("tagList"));
        }

        function initWindowContent() {
            //var paraTypeCdUrl = Util.constants.CONTEXT + "/TagLibInfo/getTaglibInfoList" + options.para;

            $dialog.find(".easyui-textbox").textbox();
            $dialog.find(".easyui-textbox").validatebox();
            $dialog.find(".easyui-combobox").validatebox();
            $dialog.find("#uploadMultiMedia").validatebox();
            //素材类型
            $("#MEDIATYPE").combobox({
                url: '../../data/multiMediaType.json',
                method: "GET",
                valueField: 'id',
                textField: 'text',
                panelHeight: 'auto',
                editable: false
            });
            //素材标签
            $("#MEDIATAG").combobox({
                url: '../../data/multiMediaType.json',
                method: "GET",
                valueField: 'id',
                textField: 'text',
                panelHeight: 'auto',
                editable: false
            });
            //上传多媒体素材
            $dialog.find("#uploadMultiMedia").filebox({
                buttonText: '选择文件',
                prompt: '请选择上传多媒体素材',
                buttonAlign: 'right'
            });
            if (!isCreate) {
                setEchoValue();
            }
        }

        function setEchoValue() {
            $("#MEDIANM").textbox("setValue", checkedMultiMedia.MEDIANM);
            $("#MEDIATYPE").textbox("setValue", checkedMultiMedia.MEDIATYPE);
            $("#MEDIAKEYS").textbox("setValue", checkedMultiMedia.MEDIAKEYS);
            initMediaTag();
            $("#MEDIADESC").textbox("setValue", checkedMultiMedia.MEDIADESC);
            $("#MEDIADURATION").textbox("setValue", checkedMultiMedia.MEDIADURATION);
            $("#MEDIASIZE").textbox("setValue", checkedMultiMedia.MEDIASIZE);
            $("#MEDIADPI").textbox("setValue", checkedMultiMedia.MEDIADPI);
        }

        function initMediaTag() {
            $.each(checkedMultiMedia.MEDIATAG.split(","), function (index, e) {
                addTagListAction({
                    "tagId": $("#MEDIATAG").combobox("getValue"),
                    "tagName": $("#MEDIATAG").combobox("getText")
                });
            });
        }

        function reloadValidatebox() {
            (function ($) {
                $.extend($.fn.validatebox.defaults.rules, {
                    checkNum: {
                        validator: function (value, param) {
                            return /^([0-9]+)$/.test(value);
                        },
                        message: '请输入整数'
                    },
                    checkNotEmpty: {
                        validator: function (value, param) {
                            return !!value.trim();
                        },
                        message: '请输入'
                    },
                    checkFloat: {
                        validator: function (value, param) {
                            return /^[+|-]?([0-9]+\.[0-9]+)|[0-9]+$/.test(value);
                        },
                        message: '请输入合法数字'
                    },
                    checkMultiMediaFile: {
                        validator: function (value, param) {
                            var fileType = value.slice(value.lastIndexOf(".") + 1, value.length);
                            return !!fileType.trim() && !(["jpg", "mp3", "mp4"].indexOf(fileType) == -1);
                        },
                        message: '请上传多媒体素材'
                    },
                    checkDPI: {
                        validator: function (value, param) {
                            var array = value.split("*");
                            return array.length == 2 && /^([0-9]+)$/.test(array[0]) && /^([0-9]+)$/.test(array[1]);
                        },
                        message: '请按照正确的格式输入分辨率'
                    }
                });
            })(jQuery);
        }

        function showWindow(options) {
            $("#".concat(options.windowId)).show().window({
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

        function addWindowLayout(options) {
            $("<div id='" + options.contentId + "' style='height: 90%;'></div><div id='" + options.footerId + "' class='combo_footer'></div>").appendTo($("#" + options.windowId));
            $([
                "<a href='javascript:void(0)' id='submitMultiMedia' class='btn btn-green radius  mt-l-20'>确定</a>",
                "<a href='javascript:void(0)' id='closeWindow' class='btn btn-secondary radius  mt-l-20' >取消</a>",
            ].join("")).appendTo($("#" + options.footerId));
        }

        function setAlreadyUpload(value) {
            attachId = value
            Loading.destroyLoading();
        }

        function addWindowContentDom(options) {
            $([
                "<div style='height: 100%;text-align:center; margin:0 auto; line-height:100%'>",

                "<form id='updateMultiMedia' class='form form-horizontal' method='post' enctype='multipart/form-data'>",

                "<div class='row cl'>",
                "<input  type='hidden' name='MEDIAID'  style='width:80%;height:30px' />",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'><span style='color: red'>*</span>素材名称</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' name='MEDIANM' id='MEDIANM' class='easyui-textbox easyui-validatebox' data-options='prompt: \"请输入素材名称\",required:true,missingMessage: \"素材名称不能为空，请重新输入\",invalidMessage: \"素材名称输入有误，请重新输入\",validType:\"checkNotEmpty\",tipPosition:\"top\"' style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材类型</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' class='easyui-combobox easyui-validatebox' id='MEDIATYPE' name='MEDIATYPE' data-options='prompt: \"请选择素材类型\",required:true,missingMessage: \"素材类型不能为空，请重新选择\",invalidMessage: \"素材类型不能为空，请重新选择\",validType:\"checkNotEmpty\",tipPosition:\"top\"'  style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材关键字</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' name='MEDIAKEYS' id='MEDIAKEYS' class='easyui-textbox' data-options=\"prompt: '请输入模板素材关键字，多个以逗号分割'\" style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材标签</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' class='easyui-combobox' id='MEDIATAG' name='MEDIATAG'  data-options=\"prompt: '请选择素材标签'\"  style='width:68%;height:30px' />",
                "<span><a id='add'  href='javascript:void(0)'  class='btn btn-secondary radius mt-l-20'> </i>添加</a></span>",
                "</div>",
                "</div>",

                "<div class='row cl' style='margin-bottom: -10px;'>",
                "<label class='form-label col-2'></label>",
                "<div class='formControls col-10' style='margin-left: 25%;padding-right: 10%;'>",
                "<ul id='tagList'></ul>",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材简介</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' class='easyui-textbox'  name='MEDIADESC' id='MEDIADESC' data-options=\"prompt:'不超过100字'\"  style='width:80%;height:60px'/>",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材时长</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' name='MEDIADURATION' id='MEDIADURATION' class='easyui-textbox easyui-validatebox'  data-options='prompt: \"请输入素材时长\",required:false,missingMessage: \"请输入素材时长\",missingMessage: \"素材大小不能为空，请重新输入\",invalidMessage: \"素材大小输入有误，请输入数字\",validType:\"checkNum\",tipPosition:\"top\"'  style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>素材大小</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' name='MEDIASIZE' id='MEDIASIZE' class='easyui-textbox easyui-validatebox' data-options='prompt: \"请输入素材大小\",required:false,missingMessage: \"请输入素材大小\",missingMessage: \"素材大小不能为空，请重新输入\",invalidMessage: \"素材大小输入有误，请输入数字\",validType:\"checkNum\",tipPosition:\"top\"' style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>视频分辨率</label>",
                "<div class='formControls col-10'>",
                "<input  type='text' name='MEDIADPI' id='MEDIADPI' class='easyui-textbox easyui-validatebox'  data-options='prompt: \"请按照1280*800的格式输入视频分辨率\",required:false,invalidMessage: \"请按照1280*800的格式输入视频分辨率\",validType:\"checkDPI\",tipPosition:\"top\"'  style='width:80%;height:30px' />",
                "</div>",
                "</div>",

                "<div class='row cl'>",
                "<label class='form-label col-2'>上传素材</label>",
                "<div class='formControls col-10'>",
                "<input id='uploadMultiMedia' name='multiMediaFile' class='easyui-filebox easyui-validatebox'  data-options='required:true,missingMessage: \"请选择上传多媒体素材\",invalidMessage: \"仅支持jpg、mp3、mp4文件格式\",validType:\"checkMultiMediaFile\",tipPosition:\"bottom\"'  type='text' style='width:68%;height:30px;title=\"\"' >",
                "<a href='javascript:void(0)' id='btn-upload' class='btn btn-green radius mt-l-20'>上传</a>",
                "</div>",
                "</div>",

                "</form>",
                "</div>"
            ].join("")).appendTo($("#".concat(options.contentId)));
        }

        return {
            showMultiMediaDialog: showMultiMediaDialog
        };
    }
);


