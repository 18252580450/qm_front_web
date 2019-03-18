
<div id="page_content" data-options ="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div id="content" data-options="region:'center'" style='overflow: hidden;height: 100%'>
            <div id = "page">
                <div class='panel-search ' title="">
                    <form id="form" class='form form-horizontal' id="searchForm">
                        <div class='row cl'>
                            <label class='form-label col-3'>工作组</label>
                            <div class='formControls col-3'>
                                <input id="groupId" hidden="hidden" >
                                <input id="groupName" type='text' class="easyui-searchbox" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-3'>员工姓名</label>
                            <div class='formControls col-3'>
                                <input id="staffName" type="easyui-textbox" style='width:100%;height:30px' >
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-3'>员工工号</label>
                            <div class='formControls col-3'>
                                <input id="staffId" type="easyui-textbox" style='width:100%;height:30px' >
                            </div>
                            <div class='formControls col-5' style="text-align: right">
                                <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="searchBtn"><i
                                        class='iconfont iconfont-search2'></i>查询</a>
                                <a href='javascript:void(0)' class='btn btn-secondary radius  mt-l-20' id="clearBtn"><i
                                        class='iconfont iconfont-zhongzuo'></i>重置</a>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <div class='cl'>
                        <div class='panel-tool-box cl'>
                            <div class='fl text-bold'>质检人员信息</div>
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
