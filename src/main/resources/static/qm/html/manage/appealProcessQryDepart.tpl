
<div id="page_content" data-options ="region:'center'" style="height:100%;">
    <div id='layout_content' class='easyui-layout' data-options="region:'center'" style='overflow: auto; height:100%;'>
        <div data-options="region:'center'" style='overflow: hidden; height: 100%'>
            <div id = "page">
                <!--左侧区域-->
                <div style="float:left; width:40%; height:300px; overflow-y: auto; overflow-x: hidden;" >
                    <div class='cl'>
                        <div id="treeDiv" title="员工组信息"  class="index-west">
                            <ul id="tree" class="ztree" style="border:#fff solid 0px;">
                            </ul>
                        </div>
                    </div>
                </div>
                <!--右侧区域-->
                <div style="float:right ; width:60%; height:300px;">
                    <div class='panel-search ' title="">
                        <form class='form form-horizontal' id="searchForm">
                            <div class='row cl'>
                                <label class='form-label col-2'>部门</label>
                                <div class='formControls col-7'>
                                    <input id="checkDepartName" type="easyui-textbox" style='width:100%;height:30px' readOnly>
                                    <input id="checkDepartId" type="easyui-textbox"  style="display:none">
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div class='mt-10 test-c' style="margin-top: 10px">
                    <div class='formControls col-4'>
                        </div>
                        <div class='formControls col-2'>
                            <a href='javascript:void(0)' class='btn btn-green radius mt-l-20' id="confirm">确定</a>
                        </div>
                        <div class='formControls col-2'>
                            <a href='javascript:void(0)' class='btn btn-secondary radius mt-l-20'
                               id="close">关闭</a>
                        </div>
                </div>
            </div>
        </div>
    </div>
</div>
