<div class="km-favorite-add " style="top:0;left:0">
    <div class=" addff-inner favorite-add-inner addff  ">
        <p class="addff-title">添加到收藏夹</p>
        <div class="form-item addff-div">
            <label for="">标题</label>
            <div>
                <input id="favorite-knowledge-name" class="addff-input filter-panel addff-bar" type="text" value="" />
            </div>
        </div>
        <div class="form-item addff-div">
            <label for="">文件夹</label>
            <div class="addff-pos">
                <div class="filter-panel addff-bar " id="default-catalog">
                    <span id="selected-catalog">我的收藏</span>
                    <i class="icon km-shangxiajiantou"></i>
                </div>

                <!--点击默认收藏夹弹出此框-->
                <div class="addff-pos-ads filter-panel addff-pos-ads-display">
                    <div>
                        <div id="first-location-catalog" class="addff-pos-list">
                            <ul class=" ztree leftTree" id="catalog-tree"></ul>
                        </div>
                    </div>
                    <p class="addff-pos-u" id="addff-pos-u">选择其他文件夹</p>
                </div>

                <!--点击选择文件夹弹出此框-->
                <div class="addff-pos-ads filter-panel addff-selsct-filer">
                    <div id="second-location-catalog" class="addff-pos-list">

                    </div>
                    <div class="addff-pos-list-btn">
                        <a href="javascript:void(0)" class="km-btn" id="create-catalog">新建文件夹</a>
                        <span class="addff-pos-btn-right">
                            <a href="javascript:void(0)" class="km-btn km-btn-green submit-favorite">
                                <i class="icon km-zhengque"></i>
                                    确定
                            </a>
                            <a href="javascript:void(0)" class="km-btn cancel-favorite" id="catlConcel">取消</a>
                        </span>
                    </div>
                </div>

            </div>
        </div>
        <span class="addff-btn">
                <a href="javascript:void(0)" class="km-btn km-btn-green submit-favorite" id="submitAll">
                    <i class="icon km-zhengque "></i>
                    确定
                </a>
                <a href="javascript:void(0)" class="km-btn cancel-favorite" id="cancelAll">取消</a>
            </span>
    </div>

</div>