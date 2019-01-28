<div id="page_content" data-options="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>,
        <div id="content" data-options="region:'center'" style='overflow: hidden;height: 100%'>
            <div id = "page">
                <div class='panel-search' title="基本信息">
                    <div class='title'>基本信息</div>
                    <form class='form form-horizontal' id="qryCheckTemplate_mainForm">
                        <div class='row cl'>
                            <label class='form-label col-3'>计划名称</label>
                            <div class='formControls col-3'>
                                <input id="planName" type='text' class="easyui-textbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-3'>计划类型</label>
                            <div class='formControls col-3'>
                                <input id="planType" type='text' class='easyui-textbox easyui-validatebox' data-options="required:true" style='width:100%;height:30px' >
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-3'>考评模板</label>
                            <div class='formControls col-3'>
                                <input id="templateId" hidden="hidden" >
                                <input id="template" type='text' class="easyui-searchbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-3'>考评策略</label>
                            <div class='formControls col-3'>
                                <input id="pId" hidden="hidden" >
                                <input id="strategy" type='text' class="easyui-searchbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-3'>任务分派方式</label>
                            <div class='formControls col-3'>
                                <input id="manOrAuto" type='text' class="easyui-textbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-3'>任务执行方式</label>
                            <div class='formControls col-3'>
                                <input id="planRuntype" type='text' class="easyui-textbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-3'>任务执行时间</label>
                            <div class='formControls col-3'>
                                <input id="planRuntime" type='text' class="easyui-textbox easyui-validatebox" data-options="required:true" style='width:100%;height:30px' >
                            </div>
                            <label class='form-label col-3'>计划开始时间</label>
                            <div class='formControls col-3'>
                                <input id="planStarttime" type="text" style='width:100%;height:30px'>
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-3'>计划结束时间</label>
                            <div class='formControls col-3'>
                                <input id='planEndtime' type="text" style='width:100%;height:30px'>
                            </div>
                            <label class='form-label col-3'>计划描述</label>
                            <div class='formControls col-3'>
                                <input id="remark" type='text' class="easyui-textbox" style='width:100%;height:30px'>
                            </div>
                        </div>
                    </form>
                    <div style="width: 95%; height: 365px; overflow-y: auto; overflow-x: hidden;margin-top: 10px">
                        <!--左侧区域-->
                        <div style="float: left; width: 18%; height: 365px; overflow-y: auto; overflow-x: hidden;">
                            <div class='panel-tool-box cl'>
                                <div class='fl text-bold'>质检人</div>
                            </div>
                            <div id="treeDiv" class="index-west">
                                <ul id="qmStaffsTree" class="ztree" style="border:#fff;">
                                </ul>
                            </div>
                        </div>

                        <!--右侧区域-->
                        <div style="float:right ; width:82%; height:100%;">
                            <div class='cl'>
                                <div class='panel-tool-box cl'>
                                    <div class='fl text-bold'>被质检人</div>
                                    <div class="formControls col-2" style="text-align: right;width: 90%">
                                        <a href='javascript:void(0)' style="width: auto;" class='btn btn-green radius mt-l-20' id="addQmStaffBtn"><i
                                                class='iconfont'></i>新增质检员</a>
                                        <a href='javascript:void(0)' style="width: auto;" class='btn btn-green radius mt-l-20' id="addCheckedStaffBtn"><i
                                                class='iconfont'></i>新增被质检员</a>
                                        <a href='javascript:void(0)' style="width: auto;" class='btn btn-secondary radius mt-l-20' id="deleteBtn"><i
                                                class='iconfont iconfont-del2'></i>删除质检员</a>
                                    </div>
                                </div>
                                <table id='checkedStaffList' class='easyui-datagrid' style='width:100%;height:100%;'>
                                </table>
                            </div>
                        </div>
                </div>
                    <div class='mt-10 test-c'>
                        <label class='form-label col-5'></label>
                        <a href='javascript:void(0)' id='addPlan' class='btn btn-green radius  mt-l-20'>确定</a>
                        <a href='javascript:void(0)' id='close' class='btn btn-secondary radius  mt-l-20'>关闭</a>
                    </div>
            </div>
        </div>
        <!--删除弹窗，默认隐藏-->
        <div  id='pop_window' style='display:none;'>
            <div id='win_content' style='overflow:auto'>
            </div>
        </div>
</div>
