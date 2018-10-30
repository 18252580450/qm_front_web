define(["jquery", "easyui"], function ($, Util) {
    var $popWindow;//弹出框实体
    var compareHtml
    var compareData = [];
    //初始化
    var initialize = function (data) {
        // //初始化弹框
        initPopWindow();
        // //初始化数据
        // initFormData();
        // //初始化事件
        initWindowEvent();
        //
        assemble();

        this.init = function () {
            //初始化时隐藏对比栏
            $("#compareCol").hide();
        };
        this.initEvent = function (data) {
            initRowEvent(data);
        }
    };

    function initPopWindow() {
        $("#compareCol").empty();
        compareHtml = '<ul>';
        var length = compareData.length;
        for (var s = 0; s < length; s++) {
            compareHtml +=
                '<li class="vs-item">' +
                '<div class="word-break" >' + compareData[s][1] + '<a verno="' + compareData[s][2] + '" href="javascript:void(0);" class="delete-link" id="delCompa">删除</a></div>' +
                '</li>';
        }
        for (var ss = 0; ss < 4 - length; ss++) {
            var num = length + ss + 1;
            compareHtml +=
                '<li class="vs-item"><p>' +
                '<span class="vs-nomber">' + num + '</span>&nbsp;&nbsp;' +
                '您还可以添加' +
                '</p></li>';
        }
        compareHtml +=
            '</ul>' +
            '<div class="bth-status">' +
            '<p id="hideCompare" ><a>隐藏对比栏</a></p>' +
            '<a class="km-btn km-btn-xs" href="javascript:;" id="clearCompare">清空</a>&nbsp;&nbsp;' +
            '<a class="km-btn km-btn-xs km-btn-green" href="javascript:void(0);" id="startCompare">对比</a>' +
            '</div>';

        $("#compareCol").append(compareHtml);

    };

    function initRowEvent(data) {
        for (var i = 0; i < data.length; i++) {
            var verId = data[i].knwlgVerId;
            //注册对比按钮点击事件
            assemble(verId, data);
        }
    };

    function assemble(data) {
        $("#page_content").delegate("a.easyui-linkbutton", "click", function () {
            var mass = $(this).attr("id");
            var compa = JSON.parse(mass);

            var verId = compa.verId;
            var verNo = compa.verNo;
            var knwlgNm = compa.knwlgNm;

            $("#compareCol").show();
            if (compareData.length == 0) {
                compareData[0] = [verId, knwlgNm, verNo];
            }else if (compareData.length > 0 && compareData.length < 4) {
                for (var m = 0; m < compareData.length; m++) {
                    if (compareData[m][2] == verNo) {
                        $.messager.alert("敬告", "请勿重复添加！");
                        return false;
                    }
                }
                compareData[compareData.length] = [verId, knwlgNm, verNo];
            }else {
                $.messager.alert("敬告", "最多只能同时对比4条！");
            }

            initPopWindow(compareData);
        });
    }

    function initWindowEvent() {
        //删除对比
        $("#compareCol").on("click", "#delCompa", function () {
            var verNo = $(this).attr("verno");
            var newArr = [];
            for (var m = 0; m < compareData.length; m++) {
                if (verNo != compareData[m][2]) {
                    newArr[newArr.length] = compareData[m];
                }
            }
            compareData = [];
            compareData = newArr;
            initPopWindow(compareData);
            initWindowEvent();
        });

        //隐藏对比栏事件
        $("#compareCol").on("click", "#hideCompare", function () {
            $("#compareCol").hide();
        });

        //清除对比栏
        $("#compareCol").on("click", "#clearCompare", function () {
            compareData = [];
            initPopWindow(compareData);
            initWindowEvent();
        });

        //开始对比栏
        $("#compareCol").on("click", "#startCompare", function () {
            var arr1 = []
            var arr2 = []
            for (var i = 0; i < compareData.length; i++) {
                arr1 [i] = compareData[i][0];//将Id放在数组中
                arr2 [i] = compareData[i][2];//将verNo放在数组中
            }
            if (arr1.length > 1) {
                startCompare(arr1, arr2);
            } else {
                $.messager.alert("敬告", "条件不足，不能对比！");
            }
        });
    }

    function startCompare(ids, verNos) {
        // window.open("../../html/manage/knowledgeCompare.html?ids=" + ids + "&verNos=" + verNos);
        //测试数据
        window.open("../../html/manage/knowledgeCompare.html?ids=180606094235000148,180611114259000190&verNos=V1,V1");
    }

    return {initialize: initialize};
})
;
