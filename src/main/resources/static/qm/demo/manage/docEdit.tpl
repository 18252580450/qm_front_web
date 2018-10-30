<div class="t-list">
    {{#equal batchFlag false}}
    <div class="ke-panel-title search-form-title">
        模板：{{tmpltNm}}
    </div>
    <div class="t-list-search t-columns-4" id="klgData">
        <form id="form">
        <input class="docPublicData"  type="hidden" id = "tmpltId" name = "tmpltId" value="{{tmpltId}}"/>
        <input class="docPublicData"  type="hidden" id = "knwlgGathrTypeCd" name = "knwlgGathrTypeCd" value="{{knwlgGathrTypeCd}}"/>
        <input class="docPublicData"  type="hidden" id = "preGathrKnwlgId" name = "preGathrKnwlgId" value="{{preGathrKnwlgId}}"/>
            <input class="docPublicData" type="hidden" id="knwlgId" name="knwlgId" value="{{knwlgId}}"/>
            <input class="docPublicData" type="hidden" id="crtTime" name="crtTime" value="{{crtTime}}"/>
            <input class="docPublicData" type="hidden" id="rmk" name="rmk" value="rmk"/>
            <input class="docPublicData" type="hidden" id="srcCode" name="srcCode" value="srcCode"/>

        <ul class="t-columns-group">
            <li class="width-half">
                <!-- 必填项为label追加样式: necessary -->
                <label for="knwlgNm">
                    知识标题
                </label>
                <div>
                    <input class="docPublicData" type="text" id="knwlgNm" name="knwlgNm" placeholder="请输入知识标题"
                           value="{{knwlgNm}}"/>
                </div>
            </li>
            <!-- 去除公告和浏览权限 -->

            <li class="width-half form-has-link">
                <label for="pathContiner">
                    知识路径
                </label>
                <div id="pathContiner">
                <input class="docPublicData"  name="pathName" type="text" disabled="disabled" placeholder="请选择知识路径" id="pathName">
                <input class="docPublicData"  name="path" type="hidden" disabled="disabled" id="path">
                    <!-- 右侧有链接操作 -->
                    <p>
                        <a class="t-btn t-btn-sm" href="javascript:void(0)" id="knowledgePathBtn">选择</a>
                    </p>
                </div>
            </li>
            <li class="width-half">
                <label for="regnIdContiner">
                    知识地区
                </label>
                <div id="regnIdContiner" style='margin-left: 8px'>
                    <input class="texts docPublicData" type="hidden" name="sn-regnId-text" readonly="" >
                    <input class="values" type="hidden" name="regnId">
                    <input type='text' class='easyui-combotree' name='authRegnList' id='authRegnList' style='width:100%;height:33px'>
                </div>
            </li>
            <li class="width-half form-has-link">
                <label for="chnlContiner">
                    知识渠道
                </label>
                <div id="chnlContiner" >
                    <input class="easyui-textbox" data-options="iconWidth: 88,buttonText:'选择'"  id="knwlgChnlCode" name="knwlgChnlCode"  type="text"   placeholder="请选择知识渠道" style="height: 32px;">

                    <!-- <input class="docPublicData" name="knwlgChnl" type="hidden" disabled="disabled" id="chnlCode"-->
                    <!--   {{#isNotNull chnlCode}} value="{{chnlCode}}" {{/isNotNull}}>-->
                    <!-- 右侧有链接操作 -->
                    <!--  <p>
                        <a class="t-btn t-btn-sm" href="javascript:void(0)" id="knwlgChnlCodeBtn">选择</a>
                    </p>-->
                </div>
            </li>
            <li class="width-half">
                 <label for="knwlgEffTimeDiv">
                     知识生效时间
                 </label>
                 <div>
                 <input type='text' class='easyui-datetimebox' name='knwlgEffTimeDiv' id='knwlgEffTimeDiv' style='width:100%;height:33px'>
                 </div>
             </li>
             <li class="width-half">
                 <label for="knwlgInvldTimeDiv">
                     知识失效时间
                 </label>
                  <div>
                 <input type='text' class='easyui-datetimebox' name='knwlgInvldTimeDiv' id ='knwlgInvldTimeDiv'style='width:100%;height:33px'>
                 </div>
             </li>
             <li class="width-half form-has-link">
               <label for="knwlgAls">
                   知识别名
               </label>
                 <div>
                     <input class="docPublicData" id="knwlgAls" name="knwlgAls"
                            placeholder="多个别名请用逗号分隔" value="{{knwlgAls}}">
                 </div>
             </li>
             <li class="width-half form-has-link">
              <label for="urdfTabs">
                  自定义页签
              </label>
                 <div>
                     <input class="docPublicData" disabled="disabled" id="urdfTabsHidden" name="urdfTabs" type="text" placeholder="请选择自定义页签">
                     <input class="docPublicDdata" id="urdfTabs" name="urdfTabsHidden" type="hidden">
                     <!-- 右侧有链接操作 -->
                     <p>
                         <a class="t-btn t-btn-sm" href="javascript:void(0)" id ="taglibButton">选择</a>
                     </p>
                 </div>
           </li>

           <li class="width-half">
               <label for="respPrsnId">
                   责任编辑
               </label>
               <div>
                   <input readonly class="docPublicData" id="respPrsnId" name="respPrsnId" type="text" placeholder="请输入责任编辑">
               </div>
           </li>
      </ul>
          <div id='channelWindow'></div>
      </form>
  </div>
  {{/equal}}
</div>

<div class="edit-sides-lock" {{#if batchFlag}}style="top: 10px"{{/if}}>
  <!-- 知识模板目录 -->
    <div class="left-tree ztree" id="tree">
        <!-- 树组件容器，根据左右容器哪个高度最大设置为哪个，最好JS动态控制，以下值为静态页面中的示例 -->
    </div>
    <div class="right-content">
        <div class="ke-panel">

            <!-- 右侧表格列表信息 -->
            <div id="detailPanel" style="margin-top: -10px;">
                <!-- 公共属性 表单移位 -->

                <!-- 知识关联刪除 -->

                {{#each this.groups}}
                <div class="ke-panel mt-10 title-text" id="groupTable{{grpngId}}" style="display:block">
                    <div class="ke-panel-title search-form-title group-name-div" title="{{grpngNm}}">
                        {{grpngNm}}
                    </div>
                    <div class="ke-panel-content no-border">

                        <div class="t-list-result ke-combo-table">
                            <table class="t-table t-table-striped dataTable">
                                <input type="hidden" value="{{grpngId}}" name="srcTmpltGrpngId"/>
                                <thead>
                                <tr class="tableTitle">
                                    <th class="w120">原子名称</th>
                                    <th class="w150">参数类型</th>
                                    <th class="w300">内容</th>
                                    {{#equal ../batchFlag false}}
                                    <th class="w80">短信发送</th>
                                    <th class="w200">操作</th>
                                    {{/equal}}
                                </tr>
                                </thead>
                                <tbody>
                                {{#each this.attr}}
                                <tr class="dataTr vertical-top" id="{{atomId}}" requiredflag="{{requiredFlag}}"
                                    paratype="{{paraTypeCd}}">
                                    <!-- <input type="hidden" value="{{keyId}}" name="srcTmpltAttrAtomId"/>-->
                                    <input type="hidden" value="{{paraNm}}" name="paraNm"/>
                                    <input type="hidden" value="{{../grpngId}}" name="srcTmpltGrpngId"/><!--模板groupId-->
                                    <input type="hidden" value="{{atomId}}" name="srcTmpltAttrAtomId"/><!--模板原子Id-->
                                    <input type="hidden" value="{{../suprGrpngId}}" name="srcSuprGrpngId"/><!--源模板分组父id-->
                                    <input type="hidden" value="{{../grpngNm}}" name="grpngNm"/>
                                    <input type="hidden" value="{{../grpngTypeCd}}" name="srcGrpngTypeCd"/>
                                    <!--<input type="hidden" value="0" name="isSendMes"/>-->
                                    <input type="hidden" name="requiredFlag" value="{{requiredFlag}}"/>
                                    <input type="hidden" name="knwlgAttrAtomId"
                                           {{#or ../../addSimPusFlag ../../addSimEditFlag}}{{else}}value="{{this.docKey.knwlgAttrAtomId}}"{{/or}} />
                                    <input type="hidden" name="grpngId"
                                           {{#or ../../addSimPusFlag ../../addSimEditFlag}}{{else}}value="{{this.docKey.grpngId}}"{{/or}} />
                                    <input type="hidden" name="suprGrpngId"
                                           {{#or ../../addSimPusFlag ../../addSimEditFlag}}{{else}}value="{{this.docKey.suprGrpngId}}"{{/or}} />
                                    <input type="hidden" name = "rmk" value="{{rmk}}"/>
                                    <input type="hidden" name = "srcCode" value="{{srcCode}}"/>
                                    <input type="hidden" name = "groupRmk" value="{{groupRmk}}"/>
                                    <input type="hidden" name = "groupSrcCode" value="{{groupSrcCode}}"/>
                                    <input type="hidden" name = "sendSmsFlag" value="{{sendSmsFlag}}"/>
                                    <td class="tdParaNm" atomid="{{atomId}}">
                                        {{paraNm}}{{#equal requiredFlag 1}}<font color="red">*</font>{{/equal}}
                                    </td>
                                    <td>
                                        <input type="hidden" name="paraTypeCd" value="{{paraTypeCd}}"/>
                                        <input type="hidden" name="paraTypeCdOld" value="{{paraTypeCd}}"/>
                                        {{#equal typeOptnlFlag false}}
                                        <span class="paraTypeCdSpan">
                                        </span>
                                        <div class="field-error" id="errorWorm{{atomId}}">
                                            <select style="display:none" class="f-ipt w100 fn-fl typeOptnlSelect" value="{{paraTypeCd}}" atomid="{{atomId}}" atomnm="{{paraNm}}">
                                                <option value="{{paraTypeCd}}"></option>
                                            </select>
                                            <a class="f-refresh" href="javascript:void(0)" id="ref{{atomId}}" atomid="{{atomId}}" attrtype="{{paraTypeCd}}"></a>
                                        </div>
                                        {{/equal}}
                                        {{#equal typeOptnlFlag true}}
                                        <div class="field-error" id="errorWorm{{atomId}}">
                                            <select class="f-ipt w100 fn-fl typeOptnlSelect" name="typeOptnlSelect" value="{{paraTypeCd}}" atomid="{{atomId}}" atomnm="{{paraNm}}">
                                                {{#each typeOptnl}}
                                                <option value="{{this.paraTypeCd}}"></option>
                                                {{/each}}
                                            </select>
                                            <a class="f-refresh" href="javascript:void(0)" id="ref{{atomId}}" atomid="{{atomId}}" attrtype="{{paraTypeCd}}"></a>
                                        </div>
                                        {{/equal}}
                                        {{#if wkunit}}
                                        <input type="hidden" value="{{wkunit}}" name="basewkunit">
                                        {{/if}}
                                    </td>
                                    <td id="tdcntt{{atomId}}" class="tdcntt" atomid="{{atomId}}" >
                                        {{#equal paraTypeCd 1}}
                                        <div class="textarea-fold">
                                        <textarea class="f-ipt w280 txtContiner" style="overflow-x:hidden" placeholder="请输入{{this.paraNm}}" atomid="{{atomId}}"
                                                  name="cntt" id="cntt{{atomId}}" {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>{{this.docKey.cntt}}</textarea>
                                        <a href="javascript:void(0)"></a>
                                        </div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 2}}
                                        <div id="cntt{{atomId}}" atomid="{{atomId}}" class="radioContiner"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 3}}
                                        <div id="cntt{{atomId}}" atomid="{{atomId}}" class="checkBoxContiner"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 4}}
                                        <a class="f-lk-richtext" id="rich{{atomId}}" atomid="{{atomId}}" href="javascript:void(0)"
                                           name="{{this.paraNm}}" id="cntt{{atomId}}">
                                            <span class="richTextButton" id="richText{{atomId}}" atomid="{{atomId}}"></span>
                                        </a>
                                        <input type="hidden" name="cntt" id= "inputRich{{atomId}}"/>
                                        {{/equal}}
                                        {{#equal paraTypeCd 5}}
                                        <input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}"
                                               name="cntt" id="cntt{{atomId}}" value="{{this.docKey.cntt}}" {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>
                                        <select class="f-ipt w100" name="wkunit" id="timePeriodUnit{{atomId}}"
                                                {{#isNotNull
                                                this.docKey}}value="{{this.docKey.wkunit}}" {{else}}value="{{wkunit}}"
                                                {{/isNotNull}}>
                                            {{#each ../../timePeriodUnit}}
                                                <option value="{{this.CODEVALUE}}">{{this.CODENAME}}
                                                </option>
                                            {{/each}}
                                        </select>
                                        {{/equal}}
                                        {{#equal paraTypeCd 6}}
                                        <div class="dateEl" id="cntt{{atomId}}" atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 7}}
                                        <div class="dateTimeEl" id="cntt{{atomId}}" atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 8}}
                                        <div><a class="t-btn t-btn-sm" id="selectRel{{atomId}}">选择</a></div>
                                        <div id="selectRelList{{atomId}}" class="selectRelSS parameter-item"
                                             paratypecd="{{paraTypeCd}}" atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 9}}
                                        <input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}"
                                               name="cntt" id="cntt{{atomId}}" value="{{this.docKey.cntt}}" {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>
                                        <select class="f-ipt w70" name="wkunit" id="memUnit{{atomId}}"
                                                {{#isNotNull this.docKey}}value="{{this.docKey.wkunit}}" {{else}}value="{{wkunit}}"{{/isNotNull}}>
                                            {{#each ../../memUnit}}
                                        <option value="{{this.CODEVALUE}}" {{#equal ../docKey.wkunit this.CODEVALUE}} selected="selected"{{/equal}}>{{this.CODENAME}}</option>
                                            {{/each}}
                                        </select>
                                        {{/equal}}
                                        {{#equal paraTypeCd 10}}
                                        <div id="oldFileList{{atomId}}"></div>
                                        <div class="w400 h30 fileContiner" id="fileUpload{{atomId}}"
                                             atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 11}}
                                        数值：<input class="f-ipt w100" type="text" name="cntt"
                                                  placeholder="请输入{{this.paraNm}}" name="cntt" id="cntt{{atomId}}"
                                                  value="{{this.docKey.cntt}}"
                                                  {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>
                                        单位：<input class="f-ipt w70" type="text" name="wkunit" id="dataUnit{{atomId}}"
                                                  {{#isNotNull this.docKey}}value="{{this.docKey.wkunit}}"
                                                  {{else}}value="{{wkunit}}" {{/isNotNull}} placeholder="单位"
                                                    {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}} >
                                        {{/equal}}
                                        {{#equal paraTypeCd 12}}
                                        <input class="f-ipt w100" type="text" placeholder="请输入{{this.paraNm}}"
                                               name="cntt" id="cntt{{atomId}}" value="{{this.docKey.cntt}}" {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>
                                        <select class="f-ipt w70" name="wkunit" id="priceTimeUnit{{atomId}}"
                                                {{#isNotNull
                                                this.docKey}}value="{{this.docKey.wkunit}}" {{else}}value="{{wkunit}}"
                                                {{/isNotNull}}>
                                            {{#each ../../priceTimeUnit}}
                                        <option value="{{this.CODEVALUE}}" {{#equal ../docKey.wkunit this.CODEVALUE}} selected="selected"{{/equal}}>{{this.CODENAME}}</option>
                                            {{/each}}
                                        </select>
                                        {{/equal}}
                                        {{#equal paraTypeCd 13}}
                                        <div id="oldPicList{{atomId}}"></div>
                                        <div class="w400 h30 picContiner" id="picUpload{{atomId}}"
                                             atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 14}}
                                        <input readonly class="f-ipt fn-fl w150" type="text" placeholder="请输入{{this.paraNm}}"
                                               name="cntt" id="cntt{{atomId}}" value="{{this.docKey.cntt}}" {{#equal ../../acceptPrePubFlag true}} readonly disabled="disabled" {{/equal}}>
                                           <p>
                                            <a class="t-btn t-btn-xs" href="javascript:void(0)" id ="gisButton">选择</a>
                                           </p>
                                        {{/equal}}
                                        {{#equal paraTypeCd 15}}
                                        <div><a class="t-btn t-btn-sm" id="selectTd{{atomId}}">选择</a></div>
                                        <div id="selectTdList{{atomId}}" class="selectTdSS parameter-item"
                                             atomid="{{atomId}}"></div>
                                        {{/equal}}
                                        {{#equal paraTypeCd 16}}
                                        <div id="regnIdContiner{{atomId}}" class="regnContiner" atomid="{{atomId}}">
                                           <input class="texts bg-tree" type="hidden" name="sn-cntt-text" value="" readonly="" >
                                           <input class="values" type="hidden" name="cntt" value="">
                                           <input type='text' class='easyui-combotree' style='width:100%;height:25px' id="regnTree{{atomId}}">
                                        </div>
                                        {{/equal}}
                                         {{#equal paraTypeCd 17}}
                                           <div><a class="t-btn t-btn-sm" id="media" kid="{{atomId}}">关联多媒体知识</a></div>
                                           <div id="selectMeList{{atomId}}" class="selectMeSS parameter-item"
                                                 atomid="{{atomId}}"></div>
                                        {{/equal}}
                                    </td>
                                    {{#equal ../../batchFlag false}}
                                    <td >
                                        {{#equal sendSmsFlag 2}}

                                        {{/equal}}
                                        {{#equal sendSmsFlag 1}}
                                        {{#isNotNull this.docKey}}
                                        <select class="f-ipt w50" name="isSendMes">
                                            <option value="1" {{#equal this.docKey.isSendMes 1}}
                                                    selected="selected"
                                                    {{/equal}}>是</option>
                                            <option value="2" {{#equal this.docKey.isSendMes 1}}
                                                    {{else}}selected="selected"
                                                    {{/equal}}>否</option>
                                        </select>
                                        {{else}}
                                        <select class="f-ipt w50" name="isSendMes">
                                            <option value="1" selected="selected">是</option>
                                            <option value="2">否</option>
                                        </select>
                                        {{/isNotNull}}
                                        {{else}}
                                        <select class="f-ipt w50 disab" name="isSendMes" disabled>
                                            <option value="1">是</option>
                                            <option value="2" selected="selected">否</option>
                                        </select>
                                        {{/equal}}
                                    </td>
                                    <td>
                                        <a class="link-blue annotationButton" href="javascript:void(0)" id="anno{{atomId}}" atomId="{{atomId}}">注解</a>
                                        <input type="hidden" id="annoV{{atomId}}"/>
                                        {{#equal aprvlExcpFlag 1}}
                                        <span class="color-ccc">|</span>
                                        <a class="link-blue exceptionButton" href="javascript:void(0)" id="exce{{atomId}}">例外</a>
                                        <input type="hidden" id="exceV{{atomId}}"/>
                                        {{/equal}}
                                        <span class="color-ccc">|</span>
                                        <a class="link-blue brwsPrivAtomBtn" href="javascript:void(0)" >原子浏览权限</a>
                                        <input name="brwsPriv" type="hidden" class="atomBrwsPriv" {{#isNotNull
                                               this.docKey}} value="{{this.docKey.brwsPriv}}"{{else}}value="{{../../defaultPriv}}"{{/isNotNull}}/>
                                        <span class="color-ccc">|</span>
                                        <a class="link-blue chnlBtn" href="javascript:void(0)" >渠道</a>
                                        <input name="chnlCode" id="chnlCode" type="hidden" {{#isNotNull this.docKey}}
                                               value="{{this.docKey.chnlCode}}"{{else}}value="{{../../chnlCode}}" {{/isNotNull}}/>
                                        <span class="color-ccc">|</span>
                                        <a class="link-strongBlue sourceStrong" atomid = "strong{{atomId}}" href="javascript:void(0)" >知识强关联</a>
                                        <input name="sourceStrong" id="strong{{atomId}}" type="hidden"/>
                                    </td>
                                    {{/equal}}
                                </tr>
                                {{/each}}
                                </tbody>
                            </table>

                        </div>

                    </div>
                </div>
                {{/each}}
            </div>

            <div class="table-btm-box pl-10 pt-10">
                <label>
                    <input id="getValidAtom" type="checkbox"> 有效字段
                </label>
            </div>
            <div class="table-btm-btns" id="divTableBtns">
            </div>
        </div>
    </div>

</div>