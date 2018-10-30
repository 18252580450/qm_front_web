/**
 * 全局公用模块
 */
define(['constants', 'page-util', 'ajax'], function(constants, PageUtil, ajax) {
    return {
        constants: constants,
        ajax: ajax,
        PageUtil: PageUtil
    }
});