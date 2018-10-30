{{#equal paraTypeCd 1}}
<div class="textarea-fold">
        <textarea class="f-ipt w280 txtContiner" style="overflow-x:hidden" placeholder="请输入{{this.paraNm}}" atomid="{{atomId}}"
        name="cntt" id="cntt{{atomId}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}></textarea>
        <a href="javascript:void(0)"></a>
</div>
{{/equal}}
{{#equal paraTypeCd 2}}
<div id="cntt{{atomId}}" atomid="{{atomId}}"  class="radioContiner"></div>
{{/equal}}
{{#equal paraTypeCd 3}}
<div id="cntt{{atomId}}" atomId="{{atomId}}" class="checkBoxContiner"></div>
{{/equal}}
{{#equal paraTypeCd 4}}
<a class="f-lk-richtext" id="rich{{atomId}}" atomid="{{atomId}}" href="javascript:void(0)" name="{{this.paraNm}}">
        <!--<input type="hidden" name = "cntt" class="richCntt"/>-->
        <span class="richTextButton" id="richText{{atomId}}" id="richText{{atomId}}></span>
</a>
<input type="hidden" name="cntt" id= "inputRich{{atomId}}/>
{{/equal}}
{{#equal paraTypeCd 5}}
<input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}"
name="cntt" id="cntt{{atomId}}"  {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
{{#if wkunit}}
<input type="hidden" value="{{wkunit}}" name="basewkunit">
{{/if}}
<select class="f-ipt w100" name="wkunit" id="timePeriodUnit{{atomId}}" value="{{wkunit}}"  {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
</select>
{{/equal}}
{{#equal paraTypeCd 6}}
<div class="dateEl" id="cntt{{atomId}}" atomid="{{atomId}}"></div>
{{/equal}}
{{#equal paraTypeCd 7}}
<div class="dateTimeEl" id="cntt{{atomId}}"></div>
{{/equal}}
{{#equal paraTypeCd 8}}
<div><a class="t-btn t-btn-sm" id="selectRel{{atomId}}" {{#equal acceptPrePubFlag true}} disabled="disabled"{{/equal}} >选择</a></div>
<div id="selectRelList{{atomId}}" class="selectRelSS parameter-item" paratypecd="{{paraTypeCd}}"></div>
{{/equal}}
{{#equal paraTypeCd 9}}
<input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}" name="cntt" id="cntt{{atomId}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
{{#if wkunit}}
<input type="hidden" value="{{wkunit}}" name="basewkunit">
{{/if}}
<select class="f-ipt w70" name="wkunit" id="memUnit{{atomId}}" value="{{wkunit}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
</select>
{{/equal}}
{{#equal paraTypeCd 10}}
<div id="oldFileList{{atomId}}"></div>
<div class="w400 h30" id="fileUpload{{atomId}}"></div>
{{/equal}}
{{#equal paraTypeCd 11}}
数值：<input class="f-ipt w100" type="text" name="cntt" placeholder="请输入{{this.paraNm}}" name="cntt" id="cntt{{atomId}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
单位：<input class="f-ipt w70" type="text" name="wkunit" id="dataUnit{{atomId}}" placeholder="单位" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
{{/equal}}
{{#equal paraTypeCd 12}}
<input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}" name="cntt" id="cntt{{atomId}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
{{#if wkunit}}
<input type="hidden" value="{{wkunit}}" name="basewkunit">
{{/if}}
<select class="f-ipt w70" name="wkunit" id="priceTimeUnit{{atomId}}" value="{{wkunit}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
</select>
{{/equal}}
{{#equal paraTypeCd 13}}
<div id="oldPicList{{atomId}}"></div>
<div class="w400 h30" id="picUpload{{atomId}}"></div>
{{/equal}}
{{#equal paraTypeCd 14}}
<input class="f-ipt w200" type="text" placeholder="请输入{{this.paraNm}}" name="cntt" id="cntt{{atomId}}" {{#equal acceptPrePubFlag true}} readonly disabled="disabled"{{/equal}}>
{{/equal}}
{{#equal paraTypeCd 15}}
<div><a class="t-btn t-btn-sm" id="selectTd{{atomId}}">选择</a></div>
<div id="selectTdList{{atomId}}" class="selectTdSS parameter-item"></div>
{{/equal}}
{{#equal paraTypeCd 16}}
<div id="regnIdContiner{{atomId}}" class = "atomRegnId">
<input class="texts bg-tree" type="hidden" name="sn-cntt-text" value="" readonly="" >
<input class="values" type="hidden" name="cntt" value="">
<input type='text' class='easyui-combotree' style='width:100%;height:25px' id="regnTree{{atomId}}">
</div>
{{/equal}}