<div id="page_content" data-options ="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div data-options="region:'center'" style='overflow: hidden;height: 100%'>
            <div id = "page">
                <div class='panel-search ' title="">
                    <form class='form form-horizontal' id="searchForm">
                        <div class='row cl'>
                            <label class='form-label col-2'>审批人姓名</label>
                            <div class='formControls col-3'>
                                <input id="addCheckStaffId" type="easyui-textbox" style='width:100%;height:30px' >
                            </div>
                            <div class='formControls col-4' style="text-align: right">
                                <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="searchBtn"><i
                                        class='iconfont iconfont-search2'></i>查询</a>
                            </div>
                        </div>
                    </form>
                </div>

                <div>
                    <!--左侧区域-->
                    <div style="float:left ; width:20%; height:100%;">
                        <div class='cl'>
                            <div class='panel-tool-box cl' >
                                <div class='fl text-bold'>工作组列表</div>
                            </div>
                            <div id="treeDiv" title="员工组信息"  class="index-west">
                                <ul id="tree" class="ztree" style="border:#fff solid 0px;">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!--右侧区域-->
                    <div style="float:right ; width:80%; height:100%;">
                        <div class='cl'>
                            <div class='panel-tool-box cl'>
                                <div class='fl text-bold'>审批人员信息</div>
                            </div>
                            <table id='checkStaffInfo' class='easyui-datagrid' style='width:100%;'>
                            </table>
                            <label class='form-label col-5'></label>
                            <a href='javascript:void(0)' id='confirm' class='btn btn-green radius  mt-l-20'>确定</a>
                            <a href='javascript:void(0)' id='close' class='btn btn-secondary radius  mt-l-20'>关闭</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
