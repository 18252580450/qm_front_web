/**
 * @Description: 错误提示弹出框
 * @Date:2017/8/2
 * @Author: chenan
 */
define(['util','text!js/homePage/tpl/error.tpl','text!js/homePage/tpl/confirm.tpl'],function(Util,errorTpl,confirmTpl){
	var $el = null;
	var MyAlert = function(data){
	    $("#myAlert-box").each(function(){
	        $(this).remove();
	    });
		if(data['type'] == null){
			$el = $(confirmTpl);
		}else if(data['type'] == 'error'){
			$el = $(errorTpl);
		}else if(data['type'] == 'confirm'){
			$el = $(confirmTpl);
		}else if(data['type'] == 'success'){
			$el = $('<div class="success-alert" id="myAlert-box"><div class="bg"></div><div class="txt"><i class="icon km-zhengque"></i><span>操作成功</span></div></div>');
			$("body").append($el);
			if(data['text'] != null) $("#myAlert-box span").html(data['text']);
			setTimeout('$("#myAlert-box.success-alert").hide(\'slow\',function(){$("#myAlert-box.success-alert").remove()})',2000);
			return;
		}
		else if(data['type'] == 'intervel'){
            $el = $('<div class="intervel-alert" id="myAlert-box"><div class="bg"></div><div class="txt"><i class="icon km-shibai"></i><span>操作成功</span></div></div>');
            $("body").append($el);
            if(data['text'] != null) $("#myAlert-box span").html(data['text']);
            setTimeout('$("#myAlert-box.intervel-alert").hide(\'slow\',function(){$("#myAlert-box.success-alert").remove()})',2000);
            return;
        }


        $("body").append($el);
		if(data['text'] != null) $("#myAlert-box .popup-content p").html(data['text']);
		if(data['trueName'] != null) $("#myAlert-box .popup-btns .km-btn-green").html(data['trueName']);
		if(data['falseName'] != null) $("#myAlert-box #myAlert-box-cancel").html(data['falseName']);
		if(data['trueShow'] != null && data['trueShow'] == false) $("#myAlert-box .popup-btns .km-btn-green").remove();
		if(data['falseShow'] != null && data['falseShow'] == false) $("#myAlert-box #myAlert-box-cancel").remove();
		$("#myAlert-box").show();
		$("#myAlert-box .popup-btns .km-btn-green").on('click',function(){
			$("#myAlert-box").hide("fast",function(){
				$("#myAlert-box").remove();
				if(data['ok'] != null){
					data['ok']();
				} 
			});
		});
		$("#myAlert-box #myAlert-box-cancel").on('click',function(){
			$("#myAlert-box").hide("fast",function(){
				$("#myAlert-box").remove();
				if(data['cancel'] != null){
					data['cancel']();
				} 
			});
		});
	};
	return MyAlert;
});