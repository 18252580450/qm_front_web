<div id="page_content" data-options="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div data-options="region:'center'" style='overflow: auto;height: 100%'>
            <div id = "qryCheckTemplate_page">
                <div class='panel-search'>
                    <form class='form form-horizontal' id = "qryCheckTemplate_searchForm">
                        <div class='row cl'>
                            <label class='form-label col-2'>模板名称</label>
                            <div class='formControls col-3'>
                                <input id="templateName" type='text' class='easyui-textbox' style='width:100%;height:30px' >
                            </div>
                            <!--<label class='form-label col-2'>模板渠道</label>-->
                            <!--<div class='formControls col-3'>-->
                                <!--<input id="templatChannel" type='text' class='easyui-textbox' style='width:100%;height:30px' >-->
                            <!--</div>-->
                        <!--</div>-->
                        <!--<div class='row cl'>-->
                            <!--<label class='form-label col-2'>模板状态</label>-->
                            <!--<div class='formControls col-3'>-->
                                <!--<input id="templateStatus" type='text' class='easyui-textbox' style='width:100%;height:30px' >-->
                            <!--</div>-->
                            <div class='formControls col-3' style="text-align: right">
                                <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id = "qryCheckTemplate_selectBut"><i class='iconfont iconfont-search2'></i>查询</a>
                                <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20 ' id="qryCheckTemplate_resetBut"><i class='iconfont iconfont-zhongzuo'></i>重置</a>
                            </div>
                        </div>
                    </form>
                </div>
                <div class='cl'>
                    <div class='panel-tool-box cl' >
                        <div class='fl text-bold'>考评模板列表<span style="margin-left: 10px;color: #acacac ">[双击数据选中]</span></div>
                    </div>
                    <table id='qryCheckTemplate_checkTemplateManage' name = 'checkTemplateManage' class='easyui-datagrid'  style=' width:100%;'>
                    </table>
                </div>
                <div class='mt-10 test-c'>
                    <label class='form-label col-5'></label>
                    <a href='javascript:void(0)' id='qryCheckTemplate_close' class='btn btn-secondary radius  mt-l-20'>关闭</a>
                </div>
            </div>
        </div>
    </div>
</div>
