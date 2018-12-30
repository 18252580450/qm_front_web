var logger;
function getLoggerInstance(){
    if(logger){
        logger = logger;
    }else{
        logger = new LoggerParam();
    }
    return logger;
}
function setLogger(newLogger){
    logger = new LoggerParam();
    logger.setAcceptNum(newLogger._accept_num);//受理号码
    logger.setBtnName(newLogger._btn_name);
    logger.setCityCode(newLogger._city_code);
    logger.setContactId(newLogger._contact_id);
    logger.setOldOpId(newLogger._old_op_staff_id);
    logger.setOpId(newLogger._op_staff_id);
    logger.setOpName(newLogger._op_name);
    logger.setOpOrgId(newLogger._op_org_id);
    logger.setOpType(newLogger._op_type);
    logger.setProvCode(newLogger._prov_code);
    logger.setRoot(newLogger._root);
    logger.setProductId(newLogger._product_id);
    logger.setProductName(newLogger._product_name);
    logger.setBizTypeCode(newLogger._biz_type_code);
    logger.setStopBootTel(newLogger._stop_boot_tel);
    logger.setServiceTypeId(newLogger._service_type_id);//系统业务类型ID
    logger.setPaging(newLogger._paging);
    logger.setRowsPerPage(newLogger._rows_per_page);
    logger.setPageNum(newLogger._page_num);
    logger.setProvNm(newLogger._provNm);//号码归属编码
    logger.setProvNm1(newLogger._provNm1);//号码归属汉字
}
var LoggerParam = function(){
    this._contact_id = "1234567890";//接触编号
    this._old_op_staff_id = "";//广西老系统工号
    this._op_staff_id = "";//员工编号
    this._op_staff_name  = "";//员工名称
    this._op_org_id = "";//组织编号
    this._op_org_name = "";//组织名称
    this._accept_num = "";//受理号码
    this._prov_code= "";//省份编码
    this._city_code= "";//地市编码
    this._btn_name= "";//按钮名称
    this._biz_type_code = ""; //操作类型 0查询;1退订;2订购
    this._op_type= "";//操作类型 0查询，1办理
    this._product_id = "";//产品ID
    this._product_name = "";//产品名称
    this._stop_boot_tel = "";//停开机文字
    this._client_ip = ""; //本机ip
    this._ext1 = ""	;		//扩展字段1
    this._root=window.location.protocol+"//"+ window.location.host + '/ngbusi_gs/';
    this._porvice_code="GS_";
    this._service_type_id = "";//系统业务类型ID
    this._paging = "0";
    this._rows_per_page = "";
    this._page_num = "";
    this._provNm ="";
    this._provNm1 ="";
}

LoggerParam.prototype ={
    setRoot : function(root){
        this._root=root;
    },
    getRoot : function(){
        return this._root;
    },
    setProvinceCode : function(provincecode){
        this._porvice_code=provincecode;
    },
    getProvinceCode : function(){
        return this._porvice_code;
    },
    setOldOpId : function(OldOpId){
        this._old_op_staff_id = OldOpId;
    },
    getOldOpId : function(){
        return this._old_op_staff_id;
    },
    setOpId : function(opId){
        this._op_staff_id = opId;
    },
    getOpId : function(){
        return this._op_staff_id;
    },
    setOpOrgId : function(opOrgId){
        this._op_org_id = opOrgId;
    },
    getOpOrgName : function(){
        return this._op_org_Name;
    },
    setOpOrgName : function(opOrgName){
        this._op_org_Name = opOrgName;
    },
    getOpOrgId : function(){
        return this._op_org_id;
    },
    setAcceptNum : function(acceptNum){
        this._accept_num = acceptNum;
    },
    getAcceptNum : function(){
        return this._accept_num;
    },
    setProvCode : function(provCode){
        this._prov_code = provCode;
    },
    getProvCode : function(){
        return this._prov_code;
    },
    setCityCode : function(cityCode){
        this._city_code = cityCode;
    },
    getCityCode : function(){
        return this._city_code;
    },
    setOpName : function(opName){
        this._op_staff_name = opName;
    },
    getOpName : function(){
        return this._op_staff_name;
    },
    setOpType : function(opType){
        this._op_type = opType;
    },
    getOpType : function(){
        return this._op_type;
    },
    setBtnName : function(btnName){
        this._btn_name = btnName;
    },
    getBtnName : function(){
        return this._btn_name;
    },
    setContactId : function(contactId){
        this._contact_id = contactId;
    },
    getContactId : function(){
        return this._contact_id;
    },
    setProductId : function(productId){
        this._product_id = productId;
    },
    getProductId : function(){
        return this._product_id;
    },
    setProductName : function(productName){
        this._product_name = productName;
    },
    getProductName : function(){
        return this._product_name;
    },
    setBizTypeCode : function(bizTypeCode){
        this._biz_type_code = bizTypeCode;
    },
    getBizTypeCode : function(){
        return this._biz_type_code;
    },
    setClientIp : function(ip){
        this._client_ip = ip;
    },
    getClientIp : function(){
        return this._client_ip;
    },
    setStopBootTel : function(stopBootTel){
        this._stop_boot_tel = stopBootTel;
    },
    getStopBootTel : function(){
        return this._stop_boot_tel;
    },
    setExt1 : function(ext1){
        this._ext1 = ext1;
    },
    getExt1 : function(){
        return this._ext1;
    },
    setServiceTypeId : function(serviceTypeId){
        this._service_type_id = serviceTypeId;
    },
    getServiceTypeId : function(){
        return this._service_type_id;
    },
    setPaging : function(paging){
        this._paging = paging;
    },
    getPaging : function(){
        return this._paging;
    },
    setRowsPerPage : function(rowsPerPage){
        this._rowsPerPage = rowsPerPage;
    },
    getRowsPerPage : function(){
        return this._rowsPerPage;
    },
    setPageNum : function(pageNum){
        this._pageNum = pageNum;
    },
    getPageNum : function(){
        return this._pageNum;
    },
    setProvNm : function(provNm){
        this._provNm = provNm;
    },
    getProvNm : function(){
        return this._provNm;
    },
    setProvNm1 : function(provNm1){
        this._provNm1 = provNm1;
    },
    getProvNm1 : function(){
        return this._provNm1;
    },
    getJsonStr : function(){
        var a = {
            "OLD_staff_id":this._old_op_staff_id,
            "opStaffId" : this._op_staff_id,
            "opOrgId" : this._op_org_id,
            "opOrgName" : this._op_org_Name,
            "clientIp" : this._client_ip,
            "acceptNum":this._accept_num,
            "provCode" : this._prov_code,
            "cityCode" : this._city_code,
            "btnName": this._btn_name,
            "opName" : this._op_staff_name,
            "opType" : this._op_type,
            "contactId":this._contact_id,
            "bizTypeCode":this._biz_type_code,
            "productName":this._product_name,
            "productId":this._product_id,
            "ext1":this._ext1,
            "serviceTypeId":this._service_type_id,
            "paging":this._paging,
            "rowsPerPage":this._rowsPerPage,
            "pageNum":this._pageNum,
            "provNm":this._provNm,
            "provNm1":this._provNm1
        }
        return JSON.stringify(a);
    }
}