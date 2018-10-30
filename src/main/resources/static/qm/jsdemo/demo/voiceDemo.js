/**
 * 技能配置样例
 */
require(["jquery", 'util', 'jplayer'], function ($, Util) {

    var $voice;

    /**
     * 初始化方法
     */
    var initialize = function(){
        addUploadContent();
        initUpload();
        initEvent();
    };

    /**
     * 初始化
     */
    function addUploadContent() {

    }


    /**
     * 初始化组件
     */
    function initUpload(){
        $("#jquery_jplayer_1").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    title: "Bubble",
                    mp3: "../../data/shiguang.mp3"
                });
            },
            swfPath: "../../assets/lib/jplayer",
            supplied: "mp3",
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: true,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true
        });

        // $("#jquery_jplayer_1").jPlayer({
        //     ready: function () {
        //         $(this).jPlayer("setMedia", {
        //             title: "Bubble",
        //             mp3: "http://jplayer.org/audio/mp3/Miaow-07-Bubble.mp3"
        //         });
        //     },
        //     swfPath: "../../dist/jplayer",
        //     supplied: "mp3",
        //     wmode: "window",
        //     useStateClassSkin: true,
        //     autoBlur: false,
        //     smoothPlayBar: true,
        //     keyEnabled: true,
        //     remainingDuration: true,
        //     toggleDuration: true
        // });

    }


    /**
     * 初始化事件
     */
    function initEvent(){

    }


    initialize();

});
