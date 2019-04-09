<div id="page_content" data-options="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>,
        <div id="content" data-options="region:'center'" style='overflow: auto;height: 100%'>
            <div id = "page">
                <div class='panel-search ' title="">
                    <form class='form form-horizontal' id="mainForm">
                        <div class='row cl'>
                            <label class='form-label col-2'>策略名称</label>
                            <div class='formControls col-3'>
                                <input id="pName" type="text" style='width:90%;height:30px'>
                                <span style='color:red;padding-left:2px'>*</span>
                            </div>
                            <label class='form-label col-2'>策略类型</label>
                            <div class='formControls col-3'>
                                <input id="paramsTypeId" type="text" class='easyui-textbox' style='width:90%;height:30px'>
                                <span style='color:red;padding-left:2px'>*</span>
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-2'>是否有效</label>
                            <div class='formControls col-3' style="width: 26%">
                                <input  type='radio' name = 'isValidate' value = "0" checked />&nbsp;&nbsp;有效&nbsp;&nbsp;
                                <input  type='radio' name = 'isValidate' value = "1" />&nbsp;&nbsp;无效
                            </div>
                        </div>
                    </form>

                </div>

                <div class='cl'>
                    <div class='panel-tool-box cl' >
                        <div class='fl text-bold'>策略元素</div>
                        <div class="formControls col-2" style="text-align: right;width: 90%">
                            <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="addElesBtn"><i class='iconfont iconfont-add'></i>新增</a>
                            <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20' id="delElesBut"><i class='iconfont iconfont-del2'></i>删除</a>
                        </div>
                    </div>
                    <table id='newElesList' class='easyui-datagrid'  style=' width:100%;'>
                    </table>
                </div>
                <div class='mt-10 test-c'>
                    <label class='form-label col-5'></label>
                    <a href='javascript:void(0)' id='subBut' class='btn btn-green radius  mt-l-20'>提交</a>
                    <a href='javascript:void(0)' id='cancel' class='btn btn-secondary radius  mt-l-20'>取消</a>
                </div>

            </div>
        </div>
        <!--删除弹窗，默认隐藏-->
        <div  id='pop_window' style='display:none;'>
            <div id='win_content' style='overflow:auto'>
            </div>
        </div>
        <!--新增弹窗，默认隐藏-->

    </div>
</div>
