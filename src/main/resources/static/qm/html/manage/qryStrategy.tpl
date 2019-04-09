<div id="page_content" data-options ="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>,
        <div data-options="region:'center'" style='overflow: auto;height: 100%'>
            <div id = "qryStrategy_page">
                <div class='panel-search ' title="">
                    <form class='form form-horizontal' id="qryStrategy_searchForm">
                        <div class='row cl'>
                            <label class='form-label col-2'>策略名称</label>
                            <div class='formControls col-2'>
                                <input id="pName" type="text" style='width:100%;height:30px'>
                            </div>
                            <label class='form-label col-2'>策略类型</label>
                            <div class='formControls col-2'>
                                <input id="paramsType" type="text" style='width:100%;height:30px'>
                            </div>
                        </div>
                        <div class='row cl'>
                            <label class='form-label col-2'>是否有效</label>
                            <div class='formControls col-2' style="width: 26%">
                                <input  type='radio' name = 'isValidate' value = "0" checked />&nbsp;&nbsp;有效&nbsp;&nbsp;
                                <input  type='radio' name = 'isValidate' value = "1" />&nbsp;&nbsp;无效
                            </div>
                            <label class='form-label col-2'></label>
                            <div class='formControls col-3'>
                                <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id = "qryStrategy_selectBut"><i class='iconfont iconfont-search2'></i>查询</a>
                                <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20 ' id="qryStrategy_resetBut"><i class='iconfont iconfont-zhongzuo'></i>重置</a>
                            </div>
                        </div>
                    </form>

                </div>

                <div class='cl'>
                    <div class='panel-tool-box cl' >
                        <div class='fl text-bold'>策略列表<span style="margin-left: 10px;color: #acacac ">[双击数据选中]</span></div>
                        <div class="formControls col-2" style="text-align: right;width: 90%">
                        </div>
                    </div>
                        <table id='qryStrategy_retList' class='easyui-datagrid'  style=' width:100%;'>
                    </table>
                </div>
                <div class='mt-10 test-c'>
                    <label class='form-label col-5'></label>
                    <a href='javascript:void(0)' id='qryStrategy_close' class='btn btn-secondary radius  mt-l-20'>关闭</a>
                </div>
            </div>
        </div>
    </div>
</div>
