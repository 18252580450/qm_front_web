## 安装

#### 加载依赖的CSS

````
<head>
	<!-- Bootstrap 核心 CSS 文件 -->
	<link rel="stylesheet" href="...metroStyle.css">
	
	<!-- ztree 核心 CSS 文件 -->
	<link rel="stylesheet" href="...bootstrap.min.css">
	
	<!-- ztree-app 核心 CSS 文件 -->
	<link rel="stylesheet" href="...ztree-app.css">
</head>
````

#### 修改`requirejs-main.js`文件 为`Bootstrap`添加`jQuery`依赖

````
shim: {
    bootstrap: {
        deps: ["jquery"],
        exports: "bootstrap"
    },
    ...
}
````
#### 在`html`中增加DOM节点用来挂载`ztree-app`

````
<div class="ztree-app"></div>
````

## 包含的内容

````
ztree-app
	|----README.MD	//说明文件
	|----treeOperate.png	//按钮雪碧图
	|----ztree-app.css	//样式表
	|----ztree-app.js	//主程序
	|----ztree-data.json	//测试数据	
````

## 实例化ztree-app

#### 入参

````
   * @param {后台查询接口} searchUrl
   * @param {请求入参} otherParam
   * @param {请求类型} type
   * @param {节点名称对应的key} name
   * @param {节点唯一标识对应的key]} idKey
   * @param {节点的父节点唯一标识对应的key} pIdKey
   * @param {后台新增接口} addUrl
   * @param {后台修改接口} editUrl
   * @param {后台删除接口} delUrl

````

## 一个例子

####  test.js

````
requirejs([".../ztree-app"], function (zta) {
    zta.init("../books", {bookid:'1'}, "name", "id", "pId");
});
````