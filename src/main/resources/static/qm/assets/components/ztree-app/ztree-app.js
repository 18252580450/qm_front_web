/*
 * @Author: wanggaun 
 * @Date: 2018-09-13 19:32:35 
 * @Last Modified by: wangguan
 * @Last Modified time: 2018-09-28 09:58:27
 */

define(["jquery", "ztree-core", "bootstrap", "util"], function ($, ztr, bs, Util) {
  "use strict";

  //zta组件开始logo
  _logo();

  var baseUrl;

  /**
   * 实例化zta
   * @param {后台查询接口} baseUrl
   * @param {请求入参} otherParam
   * @param {请求类型} type
   * @param {节点名称对应的key} name
   * @param {节点唯一标识对应的key]} idKey
   * @param {节点的父节点唯一标识对应的key} pIdKey
   */
  function init(baseUrl, otherParam, type, name, idKey, pIdKey) {
    baseUrl = baseUrl;
    _panelZtree();
    _panelAddModal();
    _panelEditModal();
    _panelDelModal();
    _bindEvent();
    _initZtree(otherParam, type, name, idKey, pIdKey);
  }

  /**
   * 实例化ztree
   */
  function _initZtree(otherParam, type, name, idKey, pIdKey) {
    var setting = {
      view: {
        selectedMulti: false,
        showIcon: false
      },
      async: {
        enable: true,
        //url: "../assets/components/ztree-app/ztree-data.json", //Ajax 获取数据的 URL 地址 （test）
        url: searchUrl, //Ajax 获取数据的 URL 地址 (dev)
        otherParam: otherParam,
        contentType: "application/json",
        type: "GET"
      },
      callback: {
        onClick: zTreeOnClick
      },
      data: {
        key: {
          name: name
        },
        simpleData: {
          enable: true,
          idKey: idKey,
          pIdKey: pIdKey,
          rootPId: 0
        }
      }
    };

    /**
     * ztree节点的点击回调
     * @param {*} event
     * @param {*} treeId
     * @param {*} treeNode
     */
    function zTreeOnClick(event, treeId, treeNode) {
      console.log(treeNode);
      $("#z_add_pname").text(treeNode.name); //用于新增时的父级结点的名称
      $("#z_add_pid").val(treeNode.id); //唯一标识--用于新增时的父级结点的唯一标识

      $("#z_edit_id").val(treeNode.id); //唯一标识--用于编辑
      $("#z_edit_name").val(treeNode.name); //菜单名称
      $("#z_edit_content").val(treeNode.content); //菜单路径

      $("#z_del_id").val(treeNode.id); //唯一标识--用于删除
      $("#z_del_name").text(treeNode.name); //唯一标识--用于删除
    }

    $.fn.zTree.init($("#menu_tree"), setting);
  }

  /**
   * 绑定元素的点击事件
   */
  function _bindEvent() {
    //新增
    $('.ztree-app').on("click", "#_catalogAdd", function () {
      $("#z_add_modal").modal({ keyboard: false });
    });

    $("body").on("click", "#z_add_btn", function () {
      var pid = $("#z_add_pid").val();
      var name = $("#z_add_name").val();
      var content = $("#z_add_content").val();
      //type POST
      Util.ajax.postJson(baseUrl, { pid: pid, name: name, content: content }, function (data) {
        var treeObj = $.fn.zTree.getZTreeObj("menu_tree");
        treeObj.reAsyncChildNodes(null, "refresh");
        $("#z_add_modal").modal("hide");
      });
    });


    //修改
    $('.ztree-app').on("click", "#_catalogEdit", function () {
      $("#z_edit_modal").modal({ keyboard: false });
    });

    //type PUT
    $("body").on("click", "#z_edit_btn", function () {
      var id = $("#z_edit_pid").val();
      var name = $("#z_edit_name").val();
      var content = $("#z_edit_content").val();
      Util.ajax.putJson(baseUrl, { id: id, name: name, content: content }, function (data) {
        var treeObj = $.fn.zTree.getZTreeObj("menu_tree");
        treeObj.reAsyncChildNodes(null, "refresh");
        $("#z_edit_modal").modal("hide");
      });
    });


    //删除
    $(".ztree-app").on("click", "#_catalogDel", function () {
      $("#z_del_modal").modal({ keyboard: false });
    });

    //type DELETE
    $("body").on("click", "#z_del_btn", function () {
      var id = $("#z_del_id").val();
      Util.ajax.deleteJson(baseUrl, { id: id }, function (data) {
        var treeObj = $.fn.zTree.getZTreeObj("menu_tree");
        treeObj.reAsyncChildNodes(null, "refresh");
        $("#z_del_modal").modal("hide");
      });
    });
  }

  /**
   * zta启动logo
   */
  function _logo() {
    console.log("%c------------------------------\n", "color:green");
    console.log("%c      ztree-app 已就绪         \n", "color:green");
    console.log("%c------------------------------  ", "color:green");
  }

  /**
 * 渲染ztree
 */
  function _panelZtree() {
    var panel = `<ul class="ke-act-btns">
                  <li><a class="clk-add" title="添加" href="javascript:void(0);" id="_catalogAdd"></a></li>
                  <li><a class="clk-edit" title="编辑" href="javascript:void(0);" id="_catalogEdit"></a></li>
                  <li><a class="clk-del" title="删除" href="javascript:void(0);" id="_catalogDel"></a></li>
                </ul>
                <ul id="menu_tree" class="ztree">`;

    $(".ztree-app").append(panel);
  }

  /**
   * 渲染新建弹出框
   */
  function _panelAddModal() {
    var panel = `<div class="modal fade" id="z_add_modal">
                  <div class="modal-content" style="width: 50%;margin: 0 auto;">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                      <h4 class="modal-title">新建1</h4>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        你正在<strong id="z_add_pname"></strong>层级下创建目录
                      </div>
                      <div class="form-group">
                        <label>名称</label>
                        <input class="form-control" id="z_add_pid" type="hidden" />
                        <input class="form-control" id="z_add_name" />
                      </div>
                      <div class="form-group">
                        <label>内容</label>
                        <input class="form-control" id="z_add_content" />
                      </div>
                      <button class="btn btn-block btn-info btn-flat" id="z_add_btn">确定</button>
                    </div>
                  </div>
                </div>`;

    $("body").append(panel);
  }

  /**
   * 渲染修改弹出框
   */
  function _panelEditModal() {
    var panel = `<div class="modal fade" id="z_edit_modal">
                  <div class="modal-content" style="width: 50%;margin: 0 auto;">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                      <h4 class="modal-title">修改</h4>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        <label>名称</label>
                        <input class="form-control" id="z_edit_pid" type="hidden" />
                        <input class="form-control" id="z_edit_name" />
                      </div>
                      <div class="form-group">
                        <label>内容</label>
                        <input class="form-control" id="z_edit_content" />
                      </div>
                      <button class="btn btn-block btn-info btn-flat" id="z_edit_btn">确定</button>
                    </div>
                  </div>
                </div>`;

    $("body").append(panel);
  }

  /**
   * 渲染删除弹出框
   */
  function _panelDelModal() {
    var panel = `<div class="modal fade" id="z_del_modal">
                  <div class="modal-content" style="width: 50%;margin: 0 auto;">
                    <div class="modal-header">
                      <button type="button" class="close" data-dismiss="modal">&times;</button>
                      <h4 class="modal-title">警告</h4>
                    </div>
                    <div class="modal-body">
                      <div class="form-group">
                        你正要删除<strong id="z_del_name"></strong>
                        <input class="form-control" id="z_del_id" type="hidden" />
                      </div>                      
                      <button class="btn btn-block btn-info btn-flat" id="z_del_btn">确定</button>
                    </div>
                  </div>
                </div>`;

    $("body").append(panel);
  }

  return {
    init: init
  };

});


