/*
 * 这是一个静态模块,没有返回的对象
 * 保存所有的公共事件
 */
define(["crm"], function(CRM) {
	
	var $document = $(document);
	
	var EM = CRM.EM = {
		"number": "<div class='error-message'>该项必须为数字</div>",
		"require": "<div class='error-message'>该项为必填项</div>"
	};
	
	/*
	 * 输入框校验
	 */
	$document.on("click", ".ui-form-item>div", function() {
		
		var $p = $(this).parent();
		
		$p.removeClass("error");

	});
	
	$document.on("blur", ".ui-form-item.ui-require input.textbox-text", function() {
		
		var $this = $(this),
			$item = $this.parent().parent().parent();
		
		/*
		 * 因为easyui-combo的问题,这里必须使用setTimeout方法,将一下动作放入下一个事件队列里
		 */
		setTimeout(function() {
			
			var val = $this.val().trim();
			
			if (val.length) {
				
				$item.removeClass("error");
				
			} else if (!$item.hasClass("error")){
				
				$item.addClass("error");
				
			}
				
		}, 150);
		
	});
	
	/*
	 * 表格按钮点击事件
	 * 因为删除按钮可能会在规定的缓存池中删除,所以不在这里写了
	 * 因为操蛋的体验设计,这里的行内编辑要改为弹出编辑
	 */
//	$document.on("click", "a.ui-grid-btn", function() {
//		
//		var $this = $(this),
//			$grid = $this.parents(".datagrid").eq(0).find("table.-easyui-original"),
//			index = $this.parents("tr").eq(0).index();
//		
//		switch ($this.attr("name")) {
//		
//			/*
//			 * 编辑
//			 */
//			case "edit":
//				
//				$grid.datagrid("beginEdit", index);
//				
//				$this.parent().html([
//					"<a class='ui-grid-btn' name='confirm'>确定</a>",
//					"<a class='ui-grid-btn' name='cancel'>取消</a>",
//					"<a class='ui-grid-btn' name='remove'>删除</a>"
//				].join(""));
//				
//				return;
//			
//			/*
//			 * 确认编辑
//			 */
//			case "confirm":
//				
//				$grid.datagrid("endEdit", index);
//				
//				$this.parent().html([
//         			"<a class='ui-grid-btn' name='edit'>编辑</a>",
//         			"<a class='ui-grid-btn' name='remove'>删除</a>"
//         		].join(""));
//				
//				break;
//			
//			/*
//			 * 取消编辑
//			 */
//			case "cancel":
//				
//				$grid.datagrid("cancelEdit", index);
//				
//				$this.parent().html([
//         			"<a class='ui-grid-btn' name='edit'>编辑</a>",
//         			"<a class='ui-grid-btn' name='remove'>删除</a>"
//         		].join(""));
//				
//				break;
//		
//		}
//		
//	});
	
});
