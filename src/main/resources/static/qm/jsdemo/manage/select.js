/**
 * select 业务组件
 */
define(['Util','select'],
    function(Util,Select){

    var fieldsSetting = {
        //例如
    	'ANOCE.STATUS':{ name:'anoceStatus', label:'状态' }
    }
    var objClass = function(options){
        var prependConfig = {}
        if (options.codeType){
            var field = fieldsSetting[options.codeType] || {
                label:'字段',
                name:'name'
            };				
            prependConfig.url = '/kmConfig/getDataByCode?codeTypeCd=' + options.codeType;
            prependConfig.label = field.label;
            prependConfig.name = field.name;
        }
        var config = $.extend(prependConfig, options);
        return new Select(config);

    };

    return objClass;
});