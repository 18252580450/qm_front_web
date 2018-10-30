

RESTFul API的接口请求类型规范：
  GET  /books （获取所有书列表）
  GET  /books/1 (获取编号为1的书)
  GET  /books/1/summary (获取编号为1的书目的简介信息)
  POST  /books （增加一本书）
  PUT  /books/1 （修改编号为1的书）
  DELETE  /books/2 （删除编号2的书）

    GET方法: 从服务器取出资源(一项或多项)
    POST方法: 在服务器新建一个资源
    PUT方法: 在服务器更新资源（客户端提供改变后的完整资源）
    PATCH方法: 在服务器更新资源（客户端提供改变的属性）
    DELETE方法: 从服务器删除资源



###前端公共方法
    
    1、ajax 统一请求方法
        Util.ajax.getJson
        Util.ajax.postJson
        Util.ajax.putJson
        Util.ajax.deleteJson
    
    
    2、easyui组件转换数据格式
        Transfer.Combobox.transfer(data)
        Transfer.DataGrid.transfer(result)
        