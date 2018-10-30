<!-- 左侧 @author hufei-->
<div class="detail-left-inner">
    <div class="detail-title">
        <h1  title="{{knwlgNM}}">
            <span id="knwlgNm">知识标题：{{knwlgNM}}</span>
            {{#equal knwlgState "0"}}
            <span class="status ready" title="未上线">未上线</span>
            {{/equal}}
            {{#equal knwlgState "1"}}
            <span class="status dated" title="已下线">已下线</span>
            {{/equal}}
            <span class="location" title="{{regnNm}}">{{regnNm}}</span>
        </h1>
        <h2>{{knwlgAls}}</h2>
    </div>

    <div class="left-content-wrap">
     <h2 style="margin-left:8px;">知识内容:</h2>
        {{#each knwldgGroupItems}}
        <div class="left-content" id="{{grpngId}}">
            <div class="left-title title-text">
                <h2 title="{{grpngNm}}">{{grpngNm}}</h2>
                <a  kid="chkall" class="chkall" href="javascript:void(0)" id="{{grpngId}}chked">
                    所有原子
                </a>
                <a class="chkall zhj chked" href="javascript:void(0)">
                    注解
                </a>
                <a class="closed" href="javascript:void(0)" id="{{grpngId}}closed">
                    <i class="icon km-shanglajiantou"></i>闭合
                </a>
            </div>
            {{#each knwldgGroupItems2}}
            <div class="left-content-subtitle">
                <div class="anchor-list">
                    <a id="{{grpngId}}" class="para-title"></a>
                </div>
                <h3 class="title-text">{{grpngNm}}</h3>
                <!-- 内容 -->
                <div class="left-content-inner">
                    {{#each atrrItems}}
                    <div class="atoms" atomId="{{knwlgAttrAtomId}}">
                        {{#blank exceptionMapList}}
                        <div class="left-words" paraTypeCd="{{paraTypeCd}}">
                            {{#equal isSendMes "1"}}
                            {{#equal paraTypeCd "4"}}
                            <a class="message rich-text attrData moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{else}}
                            <a class="message normal-text attrData moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            {{else}}
                            <a class="message notSendMessage moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            {{#each exceptionMapList}}
                            {{#equal isSendMes "1"}}
                            {{#equal ../paraTypeCd "4"}}
                            <a class="message rich-text attrData hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                            {{else}}
                            <a class="message normal-text attrData hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            {{else}}
                            <a class="message  hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            {{/each}}
                            <span>{{paraNm}}：</span>
                            <ul class="inline-tab">
                                <li class="active">
                                    <a href="javascript:void(0);" class="exception" regnId="moren" isSendMes="{{isSendMes}}">默认</a>
                                </li>
                                {{#each exceptionMapList}}
                                <li>
                                    <a href="javascript:void(0);" class="exception" regnId="{{regnId}}" isSendMes="{{isSendMes}}">{{regnNm}}</a>
                                </li>
                                {{/each}}
                            </ul>
                        </div>
                        <div class="left-explain moren {{knwlgAttrAtomId}}">
                            {{#normal paraTypeCd}}
                            <div class="yuanzi-con">
                                {{#equal paraTypeCd "4"}}
                                {{{cntt}}}
                                {{else}}
                                {{cntt}}
                                {{#if wkunit}}
                                {{wkunit}}
                                {{/if}}
                                {{/equal}}
                            </div>
                            {{else}}
                                {{#equal paraTypeCd "8"}}
                                {{#each cntt}}
                                <div class="yuanzi-title">
                                    {{{this}}}
                                </div>
                                {{/each}}
                                {{else}}
                                <div class="yuanzi-con fujian-con">
                                    {{#each cntt}}
                                    {{{this}}}
                                    {{/each}}
                                </div>
                                {{/equal}}
                            {{/normal}}
                        </div>
                        {{else}}
                        <div class="left-words" paraTypeCd="{{paraTypeCd}}">
                            {{#equal isSendMes "1"}}
                            {{#equal paraTypeCd "4"}}
                            <a class="rich-text attrData" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{else}}
                            <a class="normal-text attrData" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            {{else}}
                            <a class="notSendMessage" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                            {{/equal}}
                            <span>{{paraNm}}：</span>
                            {{#normal paraTypeCd}}
                            <div class="yuanzi-con">
                                {{#equal paraTypeCd "4"}}
                                {{{cntt}}}
                                {{else}}
                                {{cntt}}
                                {{#if wkunit}}
                                {{wkunit}}
                                {{/if}}
                                {{/equal}}
                            </div>
                            {{else}}
                                {{#equal paraTypeCd "8"}}
                                {{#each cntt}}
                                <div class="yuanzi-title">
                                    {{{this}}}
                                </div>
                                {{/each}}
                                {{else}}
                                <div class="yuanzi-con fujian-con">
                                    {{#each cntt}}
                                    {{{this}}}
                                    {{/each}}
                                </div>
                                {{/equal}}
                            {{/normal}}
                        </div>
                        {{/blank}}
                        {{#if annotation}}
                        {{#with annotation}}
                        {{#if annotation}}
                        <div class="left-words moren {{../knwlgAttrAtomId}}">
                            <a class="" href="javascript:void(0);"></a>
                            {{#equal isImport "1"}}
                            <span class="is-zhujie zhujie1" title="重点注解">：</span>
                            {{else}}
                            <span class="is-zhujie zhujie" title="注解">：</span>
                            {{/equal}}
                            <div class="zhujie-con">
                                {{{annotation}}}
                            </div>
                        </div>
                        {{/if}}
                        {{/with}}
                        {{/if}}
                        {{#if excp}}
                        {{#blank exceptionMapList}}
                        {{#each exceptionMapList}}
                        <div class="left-explain hide {{regnId}} {{../knwlgAttrAtomId}}">
                            <div class="yuanzi-con">
                                {{#equal ../paraTypeCd "4"}}
                                {{{excepValue}}}
                                {{else}}
                                {{#unit ../paraTypeCd}}
                                {{excepValue}}{{wkunit}}
                                {{else}}
                                {{excepValue}}
                                {{/unit}}
                                {{/equal}}
                            </div>
                        </div>
                        {{#if annotation}}
                        {{#notEqual annotation ""}}
                        <div class="left-words hide {{regnId}} {{../knwlgAttrAtomId}}">
                            <a class="" href="javascript:void(0);"></a>
                            <span class="is-zhujie zhujie" title="注解">：</span>
                            <div class="zhujie-con">
                                {{{annotation}}}
                            </div>
                        </div>
                        {{/notEqual}}
                        {{/if}}
                        {{/each}}
                        {{/blank}}
                        {{/if}}
                    </div>
                    {{/each}}
                </div>
            </div>
            {{else}}
            <div class="left-content-inner">
                {{#each atrrItems}}
                <div class="atoms" atomId="{{knwlgAttrAtomId}}">
                    {{#blank exceptionMapList}}
                    <div class="left-words" paraTypeCd="{{paraTypeCd}}">
                        {{#equal isSendMes "1"}}
                        {{#equal paraTypeCd "4"}}
                        <a class="message rich-text attrData moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{else}}
                        <a class="message normal-text attrData moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        {{else}}
                        <a class="message notSendMessage moren" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        {{#each exceptionMapList}}
                        {{#equal isSendMes "1"}}
                        {{#equal ../paraTypeCd "4"}}
                        <a class="message rich-text attrData hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                        {{else}}
                        <a class="message normal-text attrData hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        {{else}}
                        <a class="message  hide {{regnId}}" href="javascript:void(0);" id="{{../knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        {{/each}}
                        <span>{{paraNm}}：</span>
                        <ul class="inline-tab">
                            <li class="active">
                                <a href="javascript:void(0);" class="exception" regnId="moren" isSendMes="{{isSendMes}}">默认</a>
                            </li>
                            {{#each exceptionMapList}}
                            <li>
                                <a href="javascript:void(0);" class="exception" regnId="{{regnId}}" isSendMes="{{isSendMes}}">{{regnNm}}</a>
                            </li>
                            {{/each}}
                        </ul>
                    </div>
                    <div class="left-explain moren {{knwlgAttrAtomId}}">
                        {{#normal paraTypeCd}}
                        <div class="yuanzi-con">
                            <div class="yuanzi-con fujian-con">
                                {{#equal paraTypeCd "4"}}
                                {{{cntt}}}
                                {{else}}
                                {{cntt}}
                                {{#if wkunit}}
                                {{wkunit}}
                                {{/if}}
                                {{/equal}}
                            </div>
                        </div>
                        {{else}}
                            {{#equal paraTypeCd "8"}}
                            {{#each cntt}}
                            <div class="yuanzi-title">
                                {{{this}}}
                            </div>
                            {{/each}}
                            {{else}}
                            <div class="yuanzi-con fujian-con">
                                {{#each cntt}}
                                {{{this}}}
                                {{/each}}
                            </div>
                            {{/equal}}
                        {{/normal}}
                    </div>
                    {{else}}
                    <div class="left-words" paraTypeCd="{{paraTypeCd}}">
                        {{#equal isSendMes "1"}}
                        {{#equal paraTypeCd "4"}}
                        <a class="message rich-text attrData" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{else}}
                        <a class="message normal-text attrData" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        {{else}}
                        <a class="message" href="javascript:void(0);" id="{{knwlgAttrAtomId}}"></a>
                        {{/equal}}
                        <span>{{paraNm}}：</span>
                        {{#normal paraTypeCd}}
                        <div class="yuanzi-con">
                            {{#equal paraTypeCd "4"}}
                            {{{cntt}}}
                            {{else}}
                            {{cntt}}
                            {{#if wkunit}}
                            {{wkunit}}
                            {{/if}}
                            {{/equal}}
                        </div>
                        {{else}}
                            {{#equal paraTypeCd "8"}}
                            {{#each cntt}}
                            <div class="yuanzi-title">
                                {{{this}}}
                            </div>
                            {{/each}}
                            {{else}}
                            <div class="yuanzi-con fujian-con">
                                {{#each cntt}}
                                <span>{{{this}}}</span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span id="viewContentSpan"><a href="javascript:void(0);">查看</a></span><br>
                                {{/each}}
                            </div>
                            {{/equal}}
                        {{/normal}}
                    </div>
                    {{/blank}}
                    {{#if annotation}}
                    {{#with annotation}}
                    {{#if annotation}}
                    <div class="left-words moren {{../knwlgAttrAtomId}}">
                        <a class="" href="javascript:void(0);"></a>
                        {{#equal isImport "1"}}
                        <span class="is-zhujie zhujie1" title="重点注解">：</span>
                        {{else}}
                        <span class="is-zhujie zhujie" title="注解">：</span>
                        {{/equal}}
                        <div class="zhujie-con">
                            {{{annotation}}}
                        </div>
                    </div>
                    {{/if}}
                    {{/with}}
                    {{/if}}
                    {{#if excp}}
                    {{#blank exceptionMapList}}
                    {{#each exceptionMapList}}
                    <div class="left-explain hide {{regnId}} {{../knwlgAttrAtomId}}">
                        <div class="yuanzi-con">
                            {{#equal ../paraTypeCd "4"}}
                            {{{excepValue}}}
                            {{else}}
                            {{#unit ../paraTypeCd}}
                            {{excepValue}}
                            {{#if wkunit}}
                            {{wkunit}}
                            {{/if}}
                            {{else}}
                            {{excepValue}}
                            {{/unit}}
                            {{/equal}}
                        </div>
                    </div>
                    {{#if annotation}}
                    <div class="left-words hide {{regnId}} {{../knwlgAttrAtomId}}">
                        <a class="" href="javascript:void(0);"></a>
                        <span class="is-zhujie zhujie" title="注解">：</span>
                        <div class="zhujie-con">
                            {{{annotation}}}
                        </div>
                    </div>
                    {{/if}}
                    {{/each}}
                    {{/blank}}
                    {{/if}}
                </div>
                {{/each}}
            </div>
            {{/each}}
        </div>
        {{/each}}
        {{#if tabs}}
        {{#blank tabs}}
        <div class="left-content" id="biaoqiang">
            <div class="left-title title-text">
                <h2 title="自定义标签">自定义标签</h2>
                <a class="closed" href="#nogo">
                    <i class="icon km-shanglajiantou"></i>闭合
                </a>
            </div>
            {{#each tabs}}
            <div class="left-content-subtitle">
                <div class="atoms">
                    <div class="anchor-list">
                        <a  id="tabs{{id}}" class="para-title"></a>
                    </div>
                    <h3 class="title-text">{{name}}</h3>
                    <div class="left-content-inner">
                        <div class="left-words">
                            {{#each value}}
                            <div class="yuanzi-title">
                                <a href="javascript:void(0);" class="tabs" title="{{knwlgNm}}" knwlgId="{{knwlgId}}">{{knwlgNm}}</a>
                                {{#equal status "0"}}
                                <span class="status ready" title="未上线">未上线</span>
                                {{/equal}}
                                {{#equal status "1"}}
                                <span class="status dated" title="已下线">已下线</span>
                                {{/equal}}
                                <span class="location" title="{{locationName}}">{{locationName}}</span>
                                <br/>
                            </div>
                            {{/each}}
                        </div>
                    </div>
                </div>
            </div>
            {{/each}}
        </div>
        {{/blank}}
        {{/if}}
    </div>
    <!-- 目录区域 -->
    <div class="left-catelog-wrap"style="display:none;">
        <div class="side-catelog">
            <div class="side-bar">
                <em class="circle start"></em>
                <em class="circle end"></em>
            </div>
            <!-- 目录 -->
            <div class="catalog-scroller">
                <dl class="catalog-list">
                    {{#each knwldgGroupItems}}
                    <dt class="catalog-title level1">
                        <em class="pointer"></em>
                        <a href="#{{grpngId}}" class="title-link">
                            <span class="title-link" title="{{grpngNm}}">{{grpngNm}}</span>
                        </a>
                    </dt>
                    {{#each knwldgGroupItems2}}
                    <dd class="catalog-title level2">
                        <a href="#{{grpngId}}" class="title-link">
                            <span class="title-link"  title="{{grpngNm}}">{{grpngNm}}</span>
                        </a>
                    </dd>
                    {{/each}}
                    {{/each}}
                    {{#if tabs}}
                    {{#blank tabs}}
                    <dt class="catalog-title level1">
                        <em class="pointer"></em>
                        <a href="#biaoqiang" class="title-link">
                            <span class="title-link" title="自定义标签">自定义标签</span>
                        </a>
                    </dt>
                    {{#each tabs}}
                    <dd class="catalog-title level2">
                        <a href="#tabs{{id}}" class="title-link">
                            <span class="title-link"  title="{{name}}">{{name}}</span>
                        </a>
                    </dd>
                    {{/each}}
                    {{/blank}}
                    {{/if}}
                    <!-- 当前位置，需JS动态处理 -->
                    <a class="arrow" href="javascript:void(0);" style="top: 4px;"></a>
                </dl>
            </div>
            <!-- 右侧上下按钮 -->
            <div class="right-wrap">
                <a class="go-up disable" href="javascript:void(0);"></a>
                <a class="go-down" href="javascript:void(0);"></a>
            </div>

        </div>
        <!-- 布局切换 -->
        <ul class="layout-switch-wrap">
            <li>
                <a href="javascript:void(0);" id="closeRight">
                    <span>闭合右侧</span>
                    <i class="icon km-arrow_r"></i>
                </a>
            </li>
            <li>
                <a href="javascript:void(0);" id="hideNotSendMes">
                    <span>隐藏不可发送项</span>
                    <i class="icon km-yanjing1"></i>
                </a>
            </li>
        </ul>

        <div class="knowd-button-wrap" style="bottom:80px">
            <a class="knowd-gotop" title="回到顶部" href="javascript:void(0);" id="gotop">
                <i class="icon km-arrow-top"></i>
            </a>
        </div>

    </div>

</div>

