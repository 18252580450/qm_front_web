<div id="page_content" data-options="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div data-options="region:'center'" style='overflow: auto;height: 100%'>
            <div id = "page">
                <div class='panel-search ' title="考评模板">
                    <div class='fl text-bold'>基本信息</div>
                    <form class='form form-horizontal'>
                        <div class='row cl'>
                            <label class='form-label col-2'>模板名称</label>
                            <div class='formControls col-2'>
                                <input id="templateName" type='text' class='easyui-textbox easyui-validatebox' style='width:100%;height:30px' data-options="required:true">
                            </div>
                            <label class='form-label col-2'>模板类型</label>
                            <div class='formControls col-2' >
                                <input id="templateType" type='text' class='easyui-textbox' style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-2'>模板状态</label>
                            <div class='formControls col-2' >
                                <input id="templateStatus" type='text' class='easyui-textbox' style='width:100%;height:30px' >
                            </div>
                        </div>
                    </form>
                    <form class='form form-horizontal'>
                        <div class='row cl'>
                            <label class='form-label col-2'>评分规则</label>
                            <div class='formControls col-2'>
                                <input id="rule" type='text' class='easyui-textbox' style='width:100%;height:30px' value="扣分制" readonly="readonly">
                            </div>
                            <label class='form-label col-2'>描述</label>
                            <div class='formControls col-2'>
                                <input  id='templateDesc' name = 'desc' class='easyui-textbox' data-options='multiline:true' style='height:30px;width:100%'/>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <!--左侧区域-->
                    <div id="treeDiv" style="float:left;overflow-y: auto; overflow-x: auto;width:20%;height: 400px;">
                        <div class='cl'>
                            <div class='panel-tool-box cl' >
                                <div class='fl text-bold'>考评树</div>
                            </div>
                            <div id="treeDiv" title="考评项管理"  class="index-west">
                                <ul id="tree" class="ztree" style="border:#fff solid 0px;">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!--右侧区域-->
                    <div style="float:right ; width:80%; height:100%;">
                        <form class='form form-horizontal'>
                            <div class='row cl'>
                                <div class='formControls col-10'>
                                    <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id = "addTemplate"><i class='iconfont iconfont-add'></i>新增</a>
                                    <span style="margin-left: 10px;color: #acacac ">[请先点击考评树节点,再点击新增操作]</span>
                                    <a href='javascript:void(0)' class='btn btn-secondary radius  mt-l-20' id="saveBut">保存</a>
                                </div>
                            </div>
                        </form>
                        <!--<div class='cl'>-->
                            <!--<div class='panel-tool-box cl' >-->
                                <!--<div class='fl text-bold'>自动考评项</div>-->
                            <!--</div>-->
                            <!--<table id='autoManage' name = 'autoManage' class='easyui-datagrid'  style=' width:100%;'>-->
                            <!--</table>-->
                        <!--</div>-->
                        <div class='cl'>
                            <div class='panel-tool-box cl' >
                                <div class='fl text-bold'>人工考评项<span style="margin-left: 10px;color: #acacac ">[点击行进行修改分数后,请点击行保存操作]</span></div>
                            </div>
                            <table id='peopleManage' name = 'peopleManage' class='easyui-datagrid'  style=' width:100%;'>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>