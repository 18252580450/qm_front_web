/**
 * 前台界面的常量定义
 */
define(function(){
    return{
        // "proxy": "http://192.168.100.133:20110/ngkm/"
        // "proxy": "http://localhost:18080/ngkm/"
        //ccacs的url常量
        PREAJAXURL:"/ngcs/knowledgeweb",
        //二期再修改为ngkmcontrol
        AJAXURL : "/ngcs/knowledgeweb",
        EMPTY_HTML:'<div class="km-norecord"><img src="../../assets/img/km-norecord@2x.png" alt=""><p>暂无数据</p></div>',
        BADREQ_HTML:'<div class="km-norecord"><img src="../../assets/img/km-norecord@2x.png" alt=""><p>获取数据失败</p></div>',
        PAGE_SIZE:10,
        MESSAGE_TYPE:1006,//短信发送的smsTypeCd
        COUNTRY_CODE:"000",//全国地域编号
        NGKM_TEMPLET_CHNL:"NGKM.TEMPLET.CHNL",
        NGKM_ATOM_PARAM_TYPE:"NGKM.ATOM.PARAM.TYPE",//知识原子数据类型数据字典
        NGKM_ATOM_PARAM_PRICEORTIMETYPE_WKUNIT:"NGKM.ATOM.PARAM.PRICEORTIMETYPE.WKUNIT",//知识原子数据字典：价格/时间类型单位
        NGKM_ATOM_PARAM_RAMTYPE_WKUNIT:"NGKM.ATOM.PARAM.RAMTYPE.WKUNIT",//知识原子数据字典：内存类型单位
        NGKM_ATOM_PARAM_TIMES_WKUNIT:"NGKM.ATOM.PARAM.TIMES.WKUNIT",//知识原子数据字典：时间类型单位
        NGKM_INDEX_EXTEND_FIELD_STORE:"NGKM.INDEX.EXTEND.FIELD.STORE",//知识索引模板配置字段名称
        NGKM_KNWLG_INDEX_FIELD_TYPE:"NGKM.KNWLG.INDEX.FIELD.TYPE",// 知识索引模板配置字段类型编码
        //二阶段知识库用到的数据类型
        NGKM_ATOM_DATA_TYPE_CHAR:"1",//字符串
        NGKM_ATOM_DATA_TYPE_RADIO:"2",//单选
        NGKM_ATOM_DATA_TYPE_CHECK:"3",//多选
        NGKM_ATOM_DATA_TYPE_RICH:"4",//富文本
        NGKM_ATOM_DATA_TYPE_TIME:"5",//时间
        NGKM_ATOM_DATA_TYPE_DATE:"6",//日期
        NGKM_ATOM_DATA_TYPE_DATETIME:"7",//日期时间
        NGKM_ATOM_DATA_TYPE_KNLWG:"8",//关联知识
        NGKM_ATOM_DATA_TYPE_MEMORY:"9",//内存
        NGKM_ATOM_DATA_TYPE_FILE:"10",//附件
        NGKM_ATOM_DATA_TYPE_DATAUNIT:"11",//数据单元
        NGKM_ATOM_DATA_TYPE_PRICE:"12",//价格/时间类型
        NGKM_ATOM_DATA_TYPE_PIC:"13",//图片
        NGKM_ATOM_DATA_TYPE_LLT:"14",//经纬度
        NGKM_ATOM_DATA_TYPE_KNLWG_LIST:"15",//关系系列
        NGKM_ATOM_DATA_TYPE_REGN:"16",//地区
        NGKM_ATOM_DATA_TYPE_MEDIA:"17",//多媒体素材
        senceList:[{name:'营业厅',value:'1',id:'kmBusinessHall',url:'/src/modules/knowledgeAppNew/kmBusinessHallNEW.html'},
            {name:'套餐',value:'2',id:'KmScenario',url:'/src/modules/knowledgeAppNew/KmScenario.html'},
            {name:'国家或地区',value:'3',id:'kmGoabroad',url:'/src/modules/knowledgeAppNew/kmGoabroad.html'},
            {name:'优惠活动',value:'4',id:'activitis',url:'/src/modules/knowledgeAppNew/KmActivitis.html'}],
        kmEncodeURl:function(url){
            var tempUrl="" ;
            tempUrl = url.replace("%","$314159261$");
            tempUrl = tempUrl.replace("&","$314159262$");
            return tempUrl;
        },
        kmDecodeURl:function(url){
            var tempUrl="" ;
            tempUrl = url.replace("$314159261$","%");
            tempUrl = tempUrl.replace("$314159262$","&");
            return tempUrl;
        }
	}
});