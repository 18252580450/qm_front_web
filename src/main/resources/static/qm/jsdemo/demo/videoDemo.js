/**
 * 技能配置样例
 */
require(["jquery", 'util', 'videojs', 'jplayer'], function ($, Util) {

    var $video;

    /**
     * 初始化方法
     */
    var initialize = function(){
        addVideoContent();
        initVideo();
        initEvent();
    };

    /**
     * 初始化
     */
    function addVideoContent() {
        $video = $([
            "<video id='example_video_1' class='video-js vjs-default-skin' controls preload='none'",
            "width='640' height='264' data-setup='{}'>",
            "<source src='../../data/oceans.mp4' type='video/mp4'>",
            "<p class='vjs-no-js'>To view this video please enable JavaScript, and consider upgrading to a web browser that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a></p>",
            "</video>",

            "<hr />",

            "<video id='example_video_2' class='video-js vjs-default-skin' controls preload='none'",
            "width='640' height='264' data-setup='{}'>",
            "<source src='../../data/shiguang.mp3' type='video/mp3'>",
            "<p class='vjs-no-js'>To view this video please enable JavaScript, and consider upgrading to a web browser that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a></p>",
            "</video>"
        ].join("")).appendTo($("#page_content"));
    }


    /**
     * 初始化组件
     */
    function initVideo(){

    }


    /**
     * 初始化事件
     */
    function initEvent(){
        // var player = videojs('example_video_1');
        // player.ready(function() {
        //     var myPlayer = this;
        //     // myPlayer.src(url);
        //     // myPlayer.load(url);
        //     myPlayer.play();
        // });


        $("#jquery_jplayer_1").jPlayer({
            ready: function () {
                $(this).jPlayer("setMedia", {
                    title: "Bubble",
                    m4v: "http://localhost:63342/frame-awesome/data/oceans.mp4"
                });
            },
            swfPath: "../../assets/lib/jplayer",
            supplied: "m4v",
            wmode: "window",
            useStateClassSkin: true,
            autoBlur: false,
            smoothPlayBar: true,
            keyEnabled: true,
            remainingDuration: true,
            toggleDuration: true
        });

    }


    $(document).ready(function() {
        initialize();
    });

});
