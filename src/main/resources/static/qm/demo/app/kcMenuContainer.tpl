{{#if isNotEmpty}}
    {{#each subNodes}}
    <div class="kc-nav-menu" id="kc_nav_menu_{{index}}">
        <div class="kc-menu-item">
            <p><strong>{{name}}</strong></p>
            {{#each children}}
            <div class="kc-menu-title-default">
                <span>{{name}}</span>
            </div>
            {{#each children}}
            <div class="kc-menu-navs">
                <span>{{name}}</span>
            </div>
            {{/each}}
            {{/each}}
        </div>
    </div>
    {{/each}}
{{/if}}