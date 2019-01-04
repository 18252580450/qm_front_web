
<div id="page_content" data-options ="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>,
        <div data-options="region:'center'" style='overflow: hidden;height: 100%'>
            <div id = "page">
                <div class='panel-search ' title="">
                    <form class='form form-horizontal' id="searchForm">
                        <div class='row cl'>
                            <label class='form-label col-1'>计划名称</label>
                            <div class='formControls col-2'>
                                <input id="planNameq" type='text' class='easyui-textbox' style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-1'>发布状态</label>
                            <div class='formControls col-2'>
                                <input id="haltFlagq" type='text' type="text" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-1'>计划类型</label>
                            <div class='formControls col-2'>
                                <input id="planTypeq" type='text' class='easyui-textbox' style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-1'>创建时间始</label>
                            <div class='formControls col-2'>
                                <input id="createTimeStart" type="text" style='width:100%;height:30px'>
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-1'>创建时间止</label>
                            <div class='formControls col-2'>
                                <input id='createTimeEnd' type="text" style='width:100%;height:30px'>
                            </div>
                            <label class='form-label col-1'></label>
                            <div class='formControls col-2'>
                                <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id = "selectBut"><i class='iconfont iconfont-search2'></i>查询</a>
                            </div>
                            <label class='form-label col-1'></label>
                            <div class='formControls col-2'>
                                <a href='javascript:void(0)' class='btn btn-secondary radius  mt-l-20' id="clear"><i class='iconfont iconfont-zhongzuo'></i>重置</a>
                            </div>
                        </div>
                    </form>
                </div>

                <div class='cl'>
                    <div class='panel-tool-box cl' >
                        <div class='fl text-bold'>考评计划列表<span style="margin-left: 10px;color: #acacac ">[双击数据选中]</span></div>
                    </div>
                        <table id='planList' class='easyui-datagrid'  style=' width:100%;'>
                    </table>
                </div>
                <div class='mt-10 test-c'>
                    <label class='form-label col-5'></label>
                    <a href='javascript:void(0)' id='close' class='btn btn-secondary radius  mt-l-20'>关闭</a>
                </div>
            </div>
        </div>
    </div>
</div>
