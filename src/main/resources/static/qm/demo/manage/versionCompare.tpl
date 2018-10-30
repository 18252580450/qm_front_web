<style>
 .color-red .link-blue {
    color:red !important;
}
</style>

<table class="t-table">
    <caption><span></span>{{versionMessage.verNo}}</caption>
    <thead>
    <th>编辑时间</th>
    <th>修改人</th>
    <th class="reasonTitlt">修改原因</th>
    <th>操作</th>
    </thead>
    <tbody>
    <tr class="reason">
        <td>{{logMessage.modfTime}}</td>
        <td>{{logMessage.opPrsnId}}</td>
        <td>
            {{logMessage.editReason}}
            {{#if logMessage.atachNm}}
            <a class="filedownload" id="{{logMessage.atachId}}">{{logMessage.atachNm}}</a>
            {{/if}}
        </td>
        <td>
            <a href="#nogo"  id="{{logMessage.knwlgVerId}}" class="link-blue">查看详情</a>
        </td>
    </tr>
    </tbody>
</table>

<table class="t-table t-table-info">
    <caption>属性</caption>
    <tbody>
    <tr>
        <td class="td-label">最近更新</td>
        <td class="td-content">{{versionMessage.modfTime}}</td>
        <td class="td-label">更新人员</td>
        <td class="td-content">{{versionMessage.opPrsnId}}</td>
    </tr>
    <tr>
        <td class="td-label">责任编辑</td>
        <td class="td-content">{{versionMessage.respPrsnId}}</td>
        <td class="td-label">&nbsp;</td>
        <td class="td-content">&nbsp;</td>
    </tr>
    </tbody>
</table>

{{#each groups}}
<!-- 二级 -->
<div class="contr-lev2">

    <!-- title -->
    <div class="contr-lev2-title group-name-div" title="{{grpngNm}}">
        <span>分组名称:</span>
        {{grpngNm}}
    </div>
    {{#if kmDocKeysVersions}}
    <div class="contr-lev2-inner">
        <table class="t-table t-table-info">
            <tbody>
            {{#each kmDocKeysVersions}}
            <tr>
                <td class="td-label">{{paraNm}}</td>
                <td class="td-content">
                    {{{cntt}}}
                </td>
            </tr>
            {{#if annotation}}
            <tr>
                <td class="td-label">注解</td>
                <td class="td-content">
                    {{{annotation}}}
                </td>
            </tr>
            {{/if}}
            {{#if excp}}
            <tr>
                <td class="td-label">例外</td>
                <td class="td-content">
                    {{#each exceptionList}}
                    {{{scopeName}}}-例外:
                    {{{excepValue}}}
                    <br>
                    {{{scopeName}}}-注解:
                    {{{annotation}}}
                    <br>
                    {{/each}}
                </td>
            </tr>
            {{/if}}
            {{/each}}
            </tbody>
        </table>
    </div>
    {{/if}}
    {{#if kmDocGroupsVersions}}
    <!-- content -->
    <div class="contr-lev2-inner">
        {{#each kmDocGroupsVersions}}
            <table class="t-table t-table-info">
                <caption>{{grpngNm}}</caption>
                <tbody>
                {{#each kmDocKeysVersions}}
                    <tr>
                        <td class="td-label">{{paraNm}}</td>
                        <td class="td-content">
                            {{{cntt}}}
                        </td>
                    </tr>
                    {{#if annotation}}
                        <tr>
                            <td class="td-label">注解</td>
                            <td class="td-content">
                                {{{annotation}}}
                            </td>
                        </tr>
                    {{/if}}
                    {{#if excp}}
                        <tr>
                            <td class="td-label">例外</td>
                            <td class="td-content">
                                {{#each exceptionList}}
                                {{{scopeName}}}-例外:
                                {{{excepValue}}}
                                <br>
                                {{{scopeName}}}-注解:
                                {{{annotation}}}
                                <br>
                                {{/each}}
                            </td>
                        </tr>
                    {{/if}}
                {{/each}}
                </tbody>
            </table>
        {{/each}}
    </div>
    {{/if}}
</div>
{{/each}}
{{#if relateData}}
{{#if relateData.doubleConnect}}
<table class="t-table t-table-info">
    <caption>知识双向关联</caption>
    <tbody>
    {{#each relateData.doubleConnect}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{#if relateData.singleConnect}}
<table class="t-table t-table-info">
    <caption>知识单向关联</caption>
    <tbody>
    {{#each relateData.singleConnect}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{#if relateData.doubleGroup}}
<table class="t-table t-table-info">
    <caption>双向关联系列</caption>
    <tbody>
    {{#each relateData.doubleGroup}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{#if relateData.singleGroup}}
<table class="t-table t-table-info">
    <caption>单向关联系列</caption>
    <tbody>
    {{#each relateData.singleGroup}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{#if relateData.confilictConnect}}
<table class="t-table t-table-info">
    <caption>互斥关系</caption>
    <tbody>
    {{#each relateData.confilictConnect}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{#if relateData.urdfTabs}}
<table class="t-table t-table-info">
    <caption>自定义页签</caption>
    <tbody>
    {{#each relateData.urdfTabs}}
    <tr>
        <td class="td-content">
            <a href="#nogo" class="link-blue">{{rltObjNm}}</a>
        </td>
    </tr>
    {{/each}}
    </tbody>
</table>
{{/if}}
{{/if}}