/**
 * 全局公用模块
 */
define(['constants', 'page-util', 'ajax', 'loading'], function (constants, PageUtil, ajax, loading) {
    return {
        constants: constants,
        ajax: ajax,
        PageUtil: PageUtil,
        loading: loading
    }
});