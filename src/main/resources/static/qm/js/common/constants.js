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
        QM_PLAN_DNS: "/qm/configservice/qmPlan",//考评计划
        APPEAL_PROCESS_CONFIG_DNS:"/qm/configservice/appealProcess",//申诉流程（配置）
        QM_STRATEGY_DNS: "/qm/configservice/qmStrategy",//考评策略
        QM_STRATEGY_ELES_DNS: "/qm/configservice/qmStrategyEles",//策略元素

        NGKM_ATOM_DATA_TYPE_CHAR: "1",//字符串
        NGKM_ATOM_DATA_TYPE_RADIO: "2",//单选
        NGKM_ATOM_DATA_TYPE_CHECK: "3",//多选
        NGKM_ATOM_DATA_TYPE_RICH: "4",//富文本
        NGKM_ATOM_DATA_TYPE_TIME: "5",//时间
        NGKM_ATOM_DATA_TYPE_DATE: "6",//日期
        NGKM_ATOM_DATA_TYPE_DATETIME: "7",//日期时间
        NGKM_ATOM_DATA_TYPE_KNLWG: "8",//关联知识
        NGKM_ATOM_DATA_TYPE_MEMORY: "9",//内存
        NGKM_ATOM_DATA_TYPE_FILE: "10",//附件
        NGKM_ATOM_DATA_TYPE_DATAUNIT: "11",//数据单元
        NGKM_ATOM_DATA_TYPE_PRICE: "12",//价格/时间类型
        NGKM_ATOM_DATA_TYPE_PIC: "13",//图片
        NGKM_ATOM_DATA_TYPE_LLT: "14",//经纬度
        NGKM_ATOM_DATA_TYPE_KNLWG_LIST: "15",//关系系列
        NGKM_ATOM_DATA_TYPE_REGN: "16",//地区
        NGKM_ATOM_DATA_TYPE_MEDIA: "17",//多媒体素材


        STATUS: {
            "-1": "删除",
            "0": "隐藏",
            "1": "待审核",
            "2": "审核驳回",
            "3": "审核通过"
        }
    }
});