require(["jquery", 'util', "transfer", "easyui"], function ($, Util) {

    var orderCheckUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessAdd.html",
        appealCheckUrl = Util.constants.URL_CONTEXT + "/qm/html/manage/appealProcessEdit.html";

    initialize();

    function initialize() {
        initPageInfo();
    }

    //页面信息初始化
    function initPageInfo() {
        showTaps("工单质检执行", orderCheckUrl);
        showTaps("申诉处理", appealCheckUrl);
        $('#pendingAssignmentArea').tabs({selected: 1});
    }

    function showTaps(title, url) {
        var tabContainer = $("#pendingAssignmentArea");
        if (!tabContainer.tabs('exists', title)) {
            tabContainer.tabs('add', {
                title: title,
                content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
                closable: false
            });
        } else {
            tabContainer.tabs('select', title);
        }
    }

    return {
        initialize: initialize
    };
});