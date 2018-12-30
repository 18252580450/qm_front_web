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
    logger.setTenantId(newLogger._tenant_id);//租户ID
    logger.setCityId(newLogger._city_id);//地市
    logger.setProvinceId(newLogger._province_id);//省份
    logger.setStaffId(newLogger._staff_id);//座席工号
    logger.setDepartId(newLogger._depart_id);//座席班组
    logger.setOpName(newLogger._op_name);//操作员工名
    logger.setUserRole(newLogger._user_role);//用户角色


}
var LoggerParam = function(){
    this._accept_num = "";
    this._tenant_id = "";
    this._city_id = "";
    this._province_id  = "";
    this._staff_id = "";
    this._depart_id = "";
    this._op_name = "";
    this._user_role= "";

}

LoggerParam.prototype ={
    setAcceptNum : function(acceptNum){
        this._accept_num=acceptNum;
    },
    getAcceptNum : function(){
        return this._accept_num;
    },
    setTenantId : function(tenantId){
        this._tenant_id=tenantId;
    },
    getTenantId : function(){
        return this._tenant_id;
    },
    setCityId : function(cityId){
        this._city_id = cityId;
    },
    getCityId : function(){
        return this._city_id;
    },
    setProvinceId : function(provinceId){
        this._province_id = provinceId;
    },
    getProvinceId : function(){
        return this._province_id;
    },
    setStaffId : function(staffId){
        this._staff_id = staffId;
    },
    getStaffId : function(){
        return this._staff_id;
    },
    setDepartId : function(departId){
        this._depart_id = departId;
    },
    getDepartId : function(){
        return this._depart_id;
    },
    setOpName : function(opName){
        this._op_name = opName;
    },
    getOpName : function(){
        return this._op_name;
    },
    setUserRole : function(userRole){
        this._user_role = userRole;
    },
    getUserRole : function(){
        return this._user_role;
    },
    getJsonStr : function(){
        var a = {
            "acceptNum":this._accept_num,
            "tenantId" : this._tenant_id,
            "cityId" : this._city_id,
            "provinceId" : this._province_id,
            "staffId" : this._staff_id,
            "departId" : this._depart_id,
            "opName":this._op_name,
            "userRole" : this._user_role,


        }
        return JSON.stringify(a);
    }
}