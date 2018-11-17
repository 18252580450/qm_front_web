/**
 * 前台界面的常量定义
 */
define(function () {

    return {
       // CONTEXT: "http://marathon-lb-kc.skyark.mesos:9010",
        CONTEXT: "http://localhost:9002",
        URLCONTEXT:"http://127.0.0.1:8080",
        TENANT_ID: "10010000",
        PARENT_CHECK_ITEM_ID:"1",

        STATIC_PARAMS_DNS: "/qm/configservice/staticParams",//静态数据配置
        QM_PLAN_DNS: "/qm/configservice/qmPlan",//考评计划

        NGKM_TEMPLET_CHNL: "NGKM.TEMPLET.CHNL",
        NGKM_ATOM_PARAM_TYPE: "NGKM.ATOM.PARAM.TYPE",//知识原子数据类型数据字典
        NGKM_ATOM_PARAM_PRICEORTIMETYPE_WKUNIT: "NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT",//知识原子数据字典：价格/时间类型单位
        NGKM_ATOM_PARAM_RAMTYPE_WKUNIT: "NGKM.ATOM.PARAM.RAMTYPE.WKUNIT",//知识原子数据字典：内存类型单位
        NGKM_ATOM_PARAM_TIMES_WKUNIT: "NGKM.ATOM.PARAM.TIMES.WKUNIT",//知识原子数据字典：时间类型单位
        NGKM_INDEX_EXTEND_FIELD_STORE: "NGKM.INDEX.EXTEND.FIELD.STORE",//知识索引模板配置字段名称
        NGKM_KNWLG_INDEX_FIELD_TYPE: "NGKM.KNWLG.INDEX.FIELD.TYPE",// 知识索引模板配置字段类型编码


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


        TEMPLET_DETAIL_DNS: "/kc/tmplt/tmpltsvc/msa",
        TEMPLET_CATALOG_DNS: "/kc/tmplt/catalogsvc/msa",
        MULTIMEDIA_DNS: "/kc/doc/multimediasvc/msa",
        DISTRICT_DNS: "/kc/manage/distsvc/msa",
        KNOWLEDGE_CATALOG_DNS: "/kc/doc/catalogsvc/msa",
        SEARCH_APP_DNS: "/kc/search/appsvc/msa",

        STATUS: {
            "-1": "删除",
            "0": "隐藏",
            "1": "待审核",
            "2": "审核驳回",
            "3": "审核通过"
        }
    }
});