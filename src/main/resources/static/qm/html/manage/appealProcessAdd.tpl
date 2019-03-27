<div id="appealProcessAddContent" data-options="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div data-options="region:'center'" style='overflow: hidden;height: 100%'>
            <div id="page">
                <div class='panel-search'>
                    <form class='form form-horizontal'>
                        <div class='row cl'>
                            <label class='form-label col-1' data-options="required:'true'">流程名称</label>
                            <div class='formControls col-2'>
                                <input id="addProcessName" type='text' class='easyui-textbox easyui-validatebox'
                                       style='width:100%;height:30px' data-options="required:true">
                            </div>
                            <label class='form-label col-1'>部门</label>
                            <div class='formControls col-2'>
                                <input id="addDepartmentId" hidden="hidden" >
                                <input id="addDepartmentName" type='text' class='easyui-searchbox easyui-validatebox'
                                       style='width:100%;height:30px' data-options="required:true">
                            </div>
                            <label class='form-label col-1'>选择流程</label>
                            <div class='formControls col-2'>
                                <input id="orderNo" type='text' class='easyui-textbox' style='width:100%;height:30px'>
                            </div>
                            <label class='form-label col-1'>质检类型</label>
                            <div class='formControls col-2'>
                                <input id="addCheckType" type='text' class='easyui-textbox' style='width:100%;height:30px'>
                            </div>
                        </div>
                    </form>
                    <form class='form form-horizontal'>
                        <div class='row cl'>
                            <label class='form-label col-1'>最大节点数</label>
                            <div class='formControls col-2'>
                                <input id="maxNodeNum" type='text' class='easyui-textbox' style='width:100%;height:30px'
                                       value="10" readonly>
                            </div>
                            <label class='form-label col-1'>最大申诉次数</label>
                            <div class='formControls col-2'>
                                <input id="maxAppealNum" type='text' class='easyui-textbox'
                                       style='width:100%;height:30px' value="3">
                            </div>
                        </div>
                    </form>
                </div>

                <div class='cl' style="margin-bottom: 10px">
                    <div class='panel-tool-box cl'>
                        <div class='fl text-bold'>申诉流程</div>
                        <div class="formControls col-4" style="text-align: right;width: 90%">
                            <a href='javascript:void(0)' class='btn btn-orange radius mt-l-20' id="addAppealProcess"><i
                                    class='iconfont iconfont-add'></i>新增流程</a>
                        </div>
                    </div>
                    <table id='addProcessList' class='easyui-datagrid' style=' width:100%;'>
                    </table>
                </div>

                <div class='cl'>
                    <div class='panel-tool-box cl'>
                        <div class='fl text-bold'>申诉节点</div>
                        <div class="formControls col-2" style="text-align: right;width: 90%">
                            <a href='javascript:void(0)' class='btn btn-orange radius mt-l-20' id="addSubNode"><i
                                    class='iconfont iconfont-add'></i>新增节点</a>
                        </div>
                    </div>
                    <table id='addSubNodeList' class='easyui-datagrid' style=' width:100%;'>
                    </table>
                </div>

                <div class="cl">
                    <div class='mt-10 test-c' style="height: 60px">
                        <div class='formControls col-5'>
                        </div>
                        <div class='formControls col-1' style="margin-top: 15px">
                            <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="submitBtn">新增</a>
                        </div>
                        <div class='formControls col-1' style="margin-top: 15px">
                            <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20' id="cancelBtn">取消</a>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- 子节点新增弹框，默认隐藏  -->
        <div id='subNodeDialog' style='display:none;'>
            <div class='panel-search'>
                <form id='subNodeConfig' method='POST' class='form form-horizontal'>
                    <div class='row cl' style="margin-top: 10px">
                        <div class='formControls col-1'>
                        </div>
                        <label class='form-label col-2'>流程名称：</label>
                        <div class='formControls col-8'>
                            <input id='subProcessName' type='text' class='easyui-textbox' style='width:100%;height:30px'
                                   readonly/>
                        </div>
                    </div>

                    <div class='row cl' style="margin-top: 0px">
                        <div class='formControls col-1'>
                        </div>
                        <label class='form-label col-2'>节点名称：</label>
                        <div class='formControls col-8'>
                            <input id='subNodeName' type='text' class='easyui-textbox easyui-validatebox'
                                   style='width:100%;height:30px' data-options="required:true"/>
                        </div>
                    </div>

                    <div class='row cl' style="margin-top: 0px">
                        <div class='formControls col-1'>
                        </div>
                        <label class='form-label col-2'>审批角色：</label>
                        <div class='formControls col-8'>
                            <input id="userName" class='easyui-combotree easyui-validatebox'
                                   style='width:100%;height:30px' data-options="required:true">
                            <input id="userId" type='text' class='easyui-textbox' style="display:none">
                        </div>
                    </div>
                </form>

                <div class='mt-10 test-c' style="margin-top: 130px">
                    <div class='formControls col-4'>
                    </div>
                    <div class='formControls col-2'>
                        <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="subNodeAddBtn">保存</a>
                    </div>
                    <div class='formControls col-2'>
                        <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20'
                           id="subNodeCancelBtn">取消</a>
                    </div>
                </div>
            </div>
        </div>

        <!--查询工作组弹窗，默认隐藏-->
        <div  id='processQryDepartWindow' style='display:none;'></div>

        <!--查询员工组弹窗，默认隐藏-->
        <div  id='processQryStaffWindow' style='display:none;'></div>
    </div>
</div>