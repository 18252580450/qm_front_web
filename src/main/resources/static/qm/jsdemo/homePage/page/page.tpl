<div class="sn-pagination">
    <!-- <span class="sn-sum-page">
        共{{totalNum}}条
    </span> -->
    <div class="sn-pagebox-right">
        {{#if prevName}}
        <a href="javascript:;" class="prev">{{{prevName}}}</a>{{/if}}
        <span class="sn-pagination-page">
            {{#each page}} {{#if this}}
            <a href="javascript:;" class="{{#if isCurrent}}current{{/if}}">{{num}}</a>
            {{else}}
            <span>...</span> {{/if}} {{/each}}
        </span>
        {{#if nextName}}
        <a href="javascript:;" class="next">{{{nextName}}}</a>{{/if}}
        <!--  <span class="get-page">
        跳转到第
            <input type="text" class="sn-pagination-input" value="{{current}}">
        页
        </span> -->
        <!-- <a href="javascript:;" class="sn-pagination-submit">确定</a> -->
    </div>
</div>