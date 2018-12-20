/**
 * 前台界面的常量定义
 */
define(function () {

    return {
        CONTEXT: "http://localhost:9002",
        URL_CONTEXT:"http://127.0.0.1:8080",
        TENANT_ID: "10010000",
        PARENT_CHECK_ITEM_ID:"1",
        PROCESS_STATUS_START:"1", //申诉主流程启动状态
        PROCESS_STATUS_STOP:"2",

        //URI
        STATIC_PARAMS_DNS: "/qm/configservice/staticParams",//静态数据配置
        CHECK_ITEM_DNS:"/qm/configservice/checkItem",//考评项配置
        CHECK_TEMPLATE_DETAIL_DNS: "/qm/configservice/checkTemplateDetail",//考评模版详细信息
        QM_PLAN_DNS: "/qm/configservice/qmPlan",//考评计划
        APPEAL_PROCESS_CONFIG_DNS:"/qm/configservice/appealProcess",//申诉流程（配置）
        QM_STRATEGY_DNS: "/qm/configservice/qmStrategy",//考评策略
        QM_STRATEGY_ELES_DNS: "/qm/configservice/qmStrategyEles",//策略元素
        APPEAL_NODE_CONFIG_DNS:"/qm/configservice/appealNode",//申诉节点（配置）
        ORDER_POOL_DNS:"/qm/configservice/orderPool",//工单质检池
        VOICE_POOL_DNS:"/qm/configservice/voicePool",//语音质检池
        TPL_OP_LOG : "/qm/configservice/tplOpLog/",//考评模板操作表
        ADD_CHECK_TEMPLATE : "/qm/configservice/addCheckTemplate",//考评模板详情表
        CHECK_TEMPLATE : "/qm/configservice/checkTemplate",//考评模板
        ORDINARY_COMMENT:"/qm/configservice/ordinaryComment",//考评评语
        ORDER_CHECK_DNS:"/qm/configservice/orderCheck/",//工单待办区
        VOICE_CHECK_DNS:"/qm/configservice/voiceCheck/",//语音待办区
        WORK_QM_RESULT:"/qm/configservice/workQmResult",//工单质检结果

        //考评模版得分类型
        SCORE_TYPE_COMMON:'0',          //合格
        SCORE_TYPE_SCORE:'1',           //得分
        SCORE_TYPE_DISCOUNT:'2',        //扣分

        //质检类型
        CHECK_TYPE_WITHIN_PLAN:'0',     //计划内质检
        CHECK_TYPE_BEYOND_PLAN:'1',     //计划外质检

        //工单质检分配状态
        VOICE_NO_DISTRIBUTE:"0",  //未分配
        VOICE_DISTRIBUTE:"1",     //已分配

        //工单质检分配状态
        ORDER_NO_DISTRIBUTE:"1",  //未分配
        ORDER_DISTRIBUTE:"2",     //已分配

        //质检池质检状态
        CHECK_STATUS_CHECK:'0',         //待质检
        CHECK_STATUS_RECHECK:'1',       //待复检
        CHECK_STATUS_CHECKED:'2',       //已质检

        //质检结果状态
        CHECK_RESULT_NEW_BUILD:'0',     //质检新生成
        CHECK_RESULT_TEMP_SAVE:'1',     //临时保存
        CHECK_RESULT_ABANDON:'2',       //放弃
        CHECK_RESULT_RECHECK:'3',       //复检
        CHECK_RESULT_DEPART_CHECK:'4',  //分检
        CHECK_RESULT_CHECKED:'5',       //被检人确认
        CHECK_RESULT_SYS_CHECKED:'6',   //系统自确认
        CHECK_RESULT_APPEALING:'7',     //申诉中
        CHECK_RESULT_APPEAL_PASS:'8',   //申诉通过
        CHECK_RESULT_APPEAL_DENY:'9',   //申诉驳回
        CHECK_RESULT_SYS_DENY:'99',     //系统驳回

        STATUS: {
            "-1": "删除",
            "0": "隐藏",
            "1": "待审核",
            "2": "审核驳回",
            "3": "审核通过"
        }
    }
});