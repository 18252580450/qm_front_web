//左侧树 
var setting = {
    view: {
        // addHoverDom: addHoverDom,
        removeHoverDom: removeHoverDom,
        selectedMulti: false
    },
    check: {
        enable: true,
        chkStyle: 'radio',
        radioType: "level"
    },
    data: {
        simpleData: {
            enable: true
        }
    },
    edit: {
        enable: false
    },
    callback: {
        onClick: function (e, id, node) {
            var zTree = $.fn.zTree.getZTreeObj("menuTree");
            if (node.isParent) {
                zTree.expandNode();
            } else {
                addTabs(node.name, node.file);
            }
        }
    }
};

var zNodes = [
    {id: 1, pId: 0, name: "质检菜单列表", open: true},
    {id: 10, pId: 1, name: "静态参数管理", file: "http://127.0.0.1:8080/qm/html/manage/staticParamsManage.html"},
    {id: 11, pId: 1, name: "考评项管理", file: "http://127.0.0.1:8080/qm/html/manage/checkItemManage.html"},
    {id: 12, pId: 1, name: "考评评语", file: "http://127.0.0.1:8080/qm/html/manage/ordinaryComment.html"},
];


function setCheck() {
    setting.check.chkStyle = $("#r1").attr("checked") ? "checkbox" : "radio";
    setting.check.enable = (!$("#disablechk").attr("checked"));
    $.fn.zTree.init($("#menuTree"), setting, zNodes);
}

$(document).ready(function () {
    $.fn.zTree.init($("#menuTree"), setting, zNodes);
    setCheck();
    $("#r1").bind("change", setCheck);
    $("#r2").bind("change", setCheck);
    $("#disablechk").bind("change", setCheck);
});

var newCount = 1;

function addHoverDom(treeId, treeNode) {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='新增节点' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var btn = $("#addBtn_" + treeNode.tId);
    if (btn) btn.bind("click", function () {
        var zTree = $.fn.zTree.getZTreeObj("menuTree");
        zTree.addNodes(treeNode, {id: (100 + newCount), pId: treeNode.id, name: "新节点" + (newCount++)});
        return false;
    });
};

function removeHoverDom(treeId, treeNode) {
    $("#addBtn_" + treeNode.tId).unbind().remove();
};

$(function () {
    $.fn.zTree.init($("#menuTree"), setting, zNodes);
    var zTree = $.fn.zTree.getZTreeObj("menuTree");

    //中间部分tab
    $('#tabs').tabs({
        border: false,
        fit: true,
        onSelect: function (title, index) {
            var treeNode = zTree.getNodeByParam("name", title, null);
            zTree.selectNode(treeNode);
        }
    });

    $('.index_panel').panel({
        width: 300,
        height: 200,
        closable: true,
        minimizable: true,
        title: 'My Panel'
    });

});

//添加一个选项卡面板 
function addTabs(title, url, icon) {
    if (!$('#tabs').tabs('exists', title)) {
        $('#tabs').tabs('add', {
            title: title,
            content: '<iframe src="' + url + '" frameBorder="0" border="0" scrolling="auto"  style="width: 100%; height: 100%;"/>',
            closable: true
        });
    } else {
        $('#tabs').tabs('select', title);
    }
}