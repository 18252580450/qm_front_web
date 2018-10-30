<!--  @author hufei-->
<div class="right-content">
    <div class="right-title bold">
        关联知识
        <a href="javascript:void(0);" id="rltKnwlg"><i class="icon km-shanglajiantou"></i></a>
    </div>
    <ul class="right-words">
        {{#each this.rltKnwlgItems}}
        <li>
            <a href="javascript:void(0);" id="{{rltObjId}}" title="{{rltObjNm}}" class="rltKnwlg">{{rltObjNm}}</a>
        </li>
        {{else}}
        <li>暂无...</li>
        {{/each}}
    </ul>
</div>

<div class="right-content">
    <div class="right-title bold">
        系列关联知识
        <a href="javascript:void(0);" id="seriesRltKnwlg"><i class="icon km-shanglajiantou"></i></a>
    </div>
    <ul class="right-words">
        {{#each this.seriesRltKnwlgItems}}
        <li>
            <a href="javascript:void(0);" id="{{rltObjId}}" title="{{rltObjNm}}" class="seriesRltKnwlg">{{rltObjNm}}</a>
        </li>
        {{else}}
        <li>暂无...</li>
        {{/each}}
    </ul>
</div>

<div class="right-content">
    <div class="right-title bold">
        互斥知识
        <a href="javascript:void(0);" id="mutexRltKnwlg"><i class="icon km-shanglajiantou"></i></a>
    </div>
    <ul class="right-words">
        {{#each this.mutexRltKnwlgItems}}
        <li>
            <a href="javascript:void(0);" id="{{rltObjId}}" title="{{rltObjNm}}" class="rltKnwlg">{{rltObjNm}}</a>
        </li>
        {{else}}
        <li>暂无...</li>
        {{/each}}
    </ul>
</div>
<div class="right-content">
    <div class="right-title bold">
        协同知识
        <a href="javascript:void(0);" id="coordinationKnwlg"><i class="icon km-shanglajiantou"></i></a>
    </div>
    <ul class="right-words">
        {{#each this.coordinationKnwlgItems}}
        <li>
            <a href="javascript:void(0);" id="{{rltObjId}}" title="{{rltObjNm}}" class="rltKnwlg">{{rltObjNm}}</a>
        </li>
        {{else}}
        <li>暂无...</li>
        {{/each}}
    </ul>
</div>