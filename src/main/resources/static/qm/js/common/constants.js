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
        VOICE_POOL_DNS:"/qm/configservice/voicePool",//工单质检池

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