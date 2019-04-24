﻿if (typeof (sina) != "object") {
    var sina = {}
}
sina.isIE = navigator.appName == "Microsoft Internet Explorer";
sina.isNS = navigator.appName == "Netscape";
sina.isOP = navigator.appName == "Opera";
sina.$ = function (objId) {
    if (!objId) {
        throw new Error("sina.$(String objId)参数必须")
    }
    if (document.getElementById) {
        return document.getElementById(objId)
    } else if (document.layers) {
        return eval("document.layers['" + objId + "']")
    } else {
        return eval('document.all.' + objId)
    }
};
sina.GetOLeft = function (I) {
    curObj = I;
    var i = curObj.offsetLeft;
    while (curObj != curObj.offsetParent && curObj.offsetParent) {
        curObj = curObj.offsetParent;
        if (curObj.tagName == "DIV" || curObj.tagName == "TABLE" || curObj.tagName == "TR" || curObj.tagName == "TD") {
            i += curObj.offsetLeft
        }
    }
    return i
};
sina.GetClassName = function (i) {
    if (!i) {
        throw new Error("GetClassName(obj)参数:必须")
    }
    return i.className
};
sina.SetClassName = function (I, i) {
    if (!I || i == undefined) {
        throw new Error("SetClassName(obj,classNameTmp)参数:必须")
    }
    I.className = i
};
sina.SetCookie = function (l, I) {
    if (!l || !I) {
        throw new Error("sina.SetCookie(name,value) 参数必须")
    }
    var O = arguments, o = arguments.length;
    var i = new Date;
    i.setFullYear(i.getFullYear() + 1);
    var c = l + "=" + I + ";" + "expires=" + i.toGMTString();
    document.cookie = c
};
sina.GetCookie = function (o) {
    var l = o + "=", I = l.length, i = document.cookie.length, c = 0;
    while (c < i) {
        var O = c + I;
        if (document.cookie.substring(c, O) == l) {
            return getCookieVal(O)
        }
        c = document.cookie.indexOf("", c) + 1;
        if (c == 0) {
            break
        }
    }
    return null
};

function getWH(elem, name) {
    if (elem == window) {
        return document.compatMode == "CSS1Compat" && document.documentElement["client" + name] || document.body["client" + name]
    } else if (elem == document) {
        return Math.max(document.documentElement["client" + name], document.body["scroll" + name], document.documentElement["scroll" + name], document.body["offset" + name], document.documentElement["offset" + name])
    } else {
        var _target = typeof (elem) == "string" ? sina.$(elem) : elem;
        var val = name === "width" ? _target.offsetWidth : _target.offsetHeight;
        return val
    }
}

function style(elem, name, value) {
    var rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
    if (typeof value === "number" && !rexclude.test(name)) {
        value += "px"
    }
    if (!elem || elem.nodeType === 3 || elem.nodeType === 8) {
        return undefined
    }
    if ((name === "width" || name === "height") && parseFloat(value) < 0) {
        value = undefined
    }
    var style = elem.style || elem, set = value !== undefined;
    if (set) {
        style[name] = value
    }
    return style[name]
}

function positionCenter(options) {
    var _width = getWH(window, "Width");
    var _height = getWH(window, "Height");
    var target = typeof options.of == 'object' ? options.of : sina.$(options.of),
        collision = (options.collision || "flip").split(" "),
        offset = options.offset ? options.offset.split(" ") : [0, 0], targetWidth, targetHeight, basePosition;
    targetWidth = _width;
    targetHeight = _height;
    basePosition = {"top": -100, "left": 0};
    basePosition.left += targetWidth / 2;
    basePosition.top += targetHeight / 2;
    var elem = typeof (options.elem) == "string" ? sina.$(options.elem) : options.elem, elemWidth = 290,
        elemHeight = 140, position = basePosition;
    position.left -= elemWidth / 2;
    position.top -= elemHeight / 2;
    if (position.top <= 0) {
        position.top = 50
    }
    position.left = parseInt(position.left);
    position.top = parseInt(position.top);
    style(sina.$(options.elem), 'left', position.left);
    style(sina.$(options.elem), 'top', position.top)
}

function noServer(noticemsg) {
    var arrHtml = [];
    arrHtml.push('<div style="z-index: 9999; width:290px; right: auto; bottom: auto; display: none;position:absolute;" class="win" id="noFlashPlayer">');
    arrHtml.push('<div class="win_i" style="border:1px solid #385F75;height:100%;padding:0;">');
    arrHtml.push('<div class="win_head" style="background:none repeat scroll 0 0 #1D242C;height:17px;overflow:hidden;padding:3px 0;width:auto;">');
    arrHtml.push('<div class="win_title" style="color:#AFD3FE;float:left;font-size:14px;font-weight:blod;height:14px;padding-left:5px;width:auto;">提示</div>');
    arrHtml.push('<div style="color: rgb(175, 211, 254);cursor:pointer; float: right; font-size: 14px; height: 14px; padding-right: 5px; width: auto;" onclick="hideNotice();">关闭</div>');
    arrHtml.push('</div>');
    arrHtml.push('<div class="win_con" style="padding:10px;background-color:#232E3A;">');
    arrHtml.push('<div style="padding: 20px 10px; font-size: 14px;color:white;" id="noticemsg">' + noticemsg + '</div>');
    arrHtml.push('<div class="warn_handle" style="clear:both;margin:10px 0 5px;text-align:center;">');
    arrHtml.push('</div>');
    arrHtml.push('</div>');
    arrHtml.push('</div>');
    arrHtml.push('</div>');
    var noServerContainer = document.createElement('div');
    document.body.appendChild(noServerContainer);
    noServerContainer.innerHTML = arrHtml.join("");
    positionCenter({elem: 'noFlashPlayer', of: window, position: "center center"});
    var _width = getWH(window, "Width"), _height = getWH(window, "Hidth");
    sina.$('noFlashPlayer').style.display = 'block'
}

function hideNotice() {
    sina.$('noFlashPlayer').style.display = 'none'
}

function getCookieVal(I) {
    var i = document.cookie.indexOf(";", I);
    if (i == -1) {
        i = document.cookie.length
    }
    return unescape(document.cookie.substring(I, i))
}

sina.GetOffsetPos = function (i) {
    var l = 0, I = 0;
    do {
        l += i.offsetTop || 0;
        I += i.offsetLeft || 0;
        i = i.offsetParent
    } while (i);
    return [I, l]
};
sina.Player = function (i) {
    var I = this;
    I.instance = i;
    I.id = "";
    I.skinPath = "";
    I.wWidth = 320;
    I.wHeight = 350;
    I.wSize = [];
    I.bFile = "";
    I.nFile = "";
    I.ctrHeight = 65;
    I.playerNodeId = "";
    I.videoNodeId = "";
    I.pZoneId = "";
    I.pBoxId = "";
    I.vZoneId = "";
    I.vBoxId = "";
    I.playBtnId = "";
    I.stopBtnId = "";
    I.muteBtnId = "";
    I.fullScreenBtnId = "";
    I.bOrNBtnId = "";
    I.ctrZoneId = "";
    I.playerAdId = "";
    I.adPath = "";
    I.autoStart = true;
    I.stateShow = true;
    I.netModel = 1;
    I.pFlag = false;
    I.vFlag = false;
    I.isPorV = 0;
    I.version = 9;
    I.wObject = document.createElement("object");
    I.wEmbed = document.createElement("embed");
    I.setIntervalId = null;
    I.pos = null;
    I.diffX = 0
};
sina.Player.prototype = {
    Init: function () {
        var objTmp = this;
        this.InitAll();
        if (!this.ValidateVer()) {
            return false
        }
        if (sina.isIE) {
            this.Draw()
        } else {
            this.DrawToNS()
        }
        this.SetVolume(50);
        this.setIntervalId = setInterval(this.instance + ".FixPos()", 1000)
    }, getMousePos: function (e) {
        var e = window.event || e;
        if (e.pageX || e.pageY) {
            return {x: e.pageX, y: e.pageY}
        }
        return {
            x: e.clientX + document.body.scrollLeft - document.body.clientLeft,
            y: e.clientY + document.body.scrollTop - document.body.clientTop
        }
    }, InitAll: function () {
        var l = this;
        l.wWidth = parseInt(l.wSize[0].split("|")[0]);
        l.wHeight = parseInt(l.wSize[0].split("|")[1]) + l.ctrHeight;
        l.videoNode = sina.$(l.videoNodeId);
        l.playerNode = sina.$(l.playerNodeId);
        l.ctrZone = sina.$(l.ctrZoneId);
        l.vZone = sina.$(l.vZoneId);
        l.vBox = sina.$(l.vBoxId);
        l.vBoxWidth = l.vBox.clientWidth;
        l.playBtn = sina.$(l.playBtnId);
        l.stopBtn = sina.$(l.stopBtnId);
        l.muteBtn = sina.$(l.muteBtnId);
        l.fullScreenBtn = sina.$(l.fullScreenBtnId);
        l.playerNodeWidth = parseInt(l.playerNode.style.width);
        l.playerNodeHeight = parseInt(l.playerNode.style.height);
        l.zoomBtn1 = sina.$(l.wSize[1].split("|")[2]);
        l.zoomBtn2 = sina.$(l.wSize[2].split("|")[2]);
        if (l.zoomBtn1) {
            l.w1Width = parseInt(l.wSize[1].split("|")[0]);
            l.w1Height = parseInt(l.wSize[1].split("|")[1]) + l.ctrHeight
        }
        if (l.zoomBtn2) {
            l.w2Width = parseInt(l.wSize[2].split("|")[0]);
            l.w2Height = parseInt(l.wSize[2].split("|")[1]) + l.ctrHeight
        }
        l.bOrNBtn = sina.$(l.bOrNBtnId);
        l.playerAd = sina.$(l.playerAdId);
        /^.+\/$/.test(l.skinPath) ? l.skinPath = l.skinPath : l.skinPath = l.skinPath + "/";
        l.playBtnDisPath = l.skinPath + "play1.gif";
        l.playBtnPath = l.skinPath + "play1.gif";
        l.playBtnOverPath = l.skinPath + "play2.gif";
        l.playBtnAlt = "播放";
        l.pauseBtnDisPath = l.skinPath + "stop2.gif";
        l.pauseBtnPath = l.skinPath + "play1.gif";
        l.pauseBtnOverPath = l.skinPath + "play1.gif";
        l.pauseBtnAlt = "暂停";
        l.stopBtnDisPath = l.skinPath + "stop2.gif";
        l.stopBtnPath = l.skinPath + "stop1.gif";
        l.stopBtnOverPath = l.skinPath + "stop2.gif";
        l.stopBtnAlt = "停止";
        l.muteBtnDisPath = l.skinPath + "sound1.gif";
        l.muteBtnPath = l.skinPath + "sound1.gif";
        l.muteBtnOverPath = l.skinPath + "sound1.gif";
        l.muteBtnAlt = "声音";
        l.muteBtnOffPath = l.skinPath + "sound2.gif";
        l.muteBtnOffOverPath = l.skinPath + "sound1.gif";
        l.muteBtnOffAlt = "静音";
        l.fullScreenBtnDisPath = l.skinPath + "fullScreen_disable.gif";
        l.fullScreenBtnPath = l.skinPath + "fullScreen.gif";
        l.fullScreenBtnOverPath = l.skinPath + "fullScreen_over.gif";
        l.fullScreenBtnAlt = "双击鼠标或按Esc键退出全屏";
        if (l.zoomBtn1) {
            l.zoomBtn1DisPath = l.skinPath + "zoom1_disable.gif";
            l.zoomBtn1Path = l.skinPath + "zoom1.gif";
            l.zoomBtn1OverPath = l.skinPath + "zoom1_over.gif";
            l.zoomBtn1Alt = "";
            l.reZoomBtn1DisPath = l.skinPath + "zoom1re_disable.gif";
            l.rezoomBtn1Path = l.skinPath + "zoom1re.gif";
            l.reZoomBtn1OverPath = l.skinPath + "zoom1re_over.gif";
            l.reZoomBtn1Alt = ""
        }
        if (l.zoomBtn2) {
            l.zoomBtn2DisPath = l.skinPath + "zoom2_disable.gif";
            l.zoomBtn2Path = l.skinPath + "zoom2.gif";
            l.zoomBtn2OverPath = l.skinPath + "zoom2_over.gif";
            l.zoomBtn2Alt = "";
            l.reZoomBtn2DisPath = l.skinPath + "zoom2re_disable.gif";
            l.rezoomBtn2Path = l.skinPath + "zoom2re.gif";
            l.reZoomBtn2OverPath = l.skinPath + "zoom2re_over.gif";
            l.reZoomBtn2Alt = ""
        }
        l.pBox = sina.$(l.pBoxId);
        l.pBoxWidth = parseInt(l.pBox.style.width);
        l.pZone = sina.$(l.pZoneId);
        l.pZoneWidth = parseInt(l.pZone.style.width);
        l.pBoxPath = l.skinPath + "pBox.gif";
        l.pBoxOverPath = l.skinPath + "pBox_over.gif";
        l.vBox = sina.$(l.vBoxId);
        l.vBoxWidth = parseInt(l.vBox.style.width);
        l.vZone = sina.$(l.vZoneId);
        l.vZoneWidth = parseInt(l.vZone.style.width);
        l.vBoxPath = l.skinPath + "sound3.gif";
        l.vBoxOverPath = l.skinPath + "sound3.gif";
        l.bOrNBtnDisPath = l.skinPath + "playMode_disable.gif";
        l.broadBtnPath = l.skinPath + "broad.gif";
        l.broadBtnOverPath = l.skinPath + "broad_over.gif";
        l.broadBtnAlt = "";
        l.narrowBtnPath = l.skinPath + "narrow.gif";
        l.narrowBtnOverPath = l.skinPath + "narrow_over.gif";
        l.narrowBtnAlt = "";
        l.playBtn.style.cursor = "hand";
        l.SetCurState("muteNo");
        l.muteBtn.style.cursor = "hand";
        l.vBox.style.cursor = "hand";
        l.vBox.setAttribute("title", "移动滑块控制音量");
        l.pBox.style.cursor = "hand";
        l.pBox.setAttribute("title", "移动滑块控制播放进度");
        if (l.autoStart) {
            l.SetCurState("play")
        } else {
            l.SetCurState("stop")
        }
        var i = parseInt(sina.GetCookie("bnTxtNetModel"));
        if (i == 0 || i == 1) {
            l.netModel = i
        }
        if (l.netModel == 0) {
            l.SetCurState("narrow")
        } else if (l.netModel == 1) {
            l.SetCurState("broad")
        } else {
            throw new Error("网络模式：this.netModel 的值应为0或1")
        }
        var I = l;
        l.playBtn.onclick = function () {
            I.PlayOrPauseHandler.call(I)
        };
        l.playBtn.onmouseover = function () {
            var i = this;
            if (i.src == I.playBtnPath) {
                i.src = I.playBtnOverPath
            } else if (i.src == I.pauseBtnPath) {
                i.src = I.pauseBtnOverPath
            }
        };
        l.playBtn.onmouseout = function () {
            var i = this;
            if (i.src == I.playBtnOverPath) {
                i.src = I.playBtnPath
            } else if (i.src == I.pauseBtnOverPath) {
                i.src = I.pauseBtnPath
            }
        };
        l.pBox.onmouseover = function () {
            this.style.backgroundImage = "url(" + I.pBoxOverPath + ")"
        };
        l.pBox.onmouseout = function () {
            this.style.backgroundImage = "url(" + I.pBoxPath + ")"
        };
        I = l;
        l.muteBtn.onclick = function () {
            I.Mute.call(I)
        };
        l.stopBtn.onclick = function () {
            I.Stop.call(I)
        };
        l.stopBtn.onmouseover = function () {
            var i = this;
            if (i.src == I.stopBtnPath) {
                i.src = I.stopBtnOverPath
            }
        };
        l.stopBtn.onmouseout = function () {
            var i = this;
            if (i.src == I.stopBtnOverPath) {
                i.src = I.stopBtnPath
            }
        };
        l.bOrNBtn.onclick = function () {
            I.SelectNetModel.call(I)
        };
        l.bOrNBtn.onmouseover = function () {
            var i = this;
            if (i.src == I.broadBtnPath) {
                i.src = I.broadBtnOverPath
            } else if (i.src == I.narrowBtnPath) {
                i.src = I.narrowBtnOverPath
            }
        };
        l.bOrNBtn.onmouseout = function () {
            var i = this;
            if (i.src == I.broadBtnOverPath) {
                i.src = I.broadBtnPath
            } else if (i.src == I.narrowBtnOverPath) {
                i.src = I.narrowBtnPath
            }
        };
        l.fullScreenBtn.onclick = function () {
            I.FullScreen.call(I)
        };
        l.fullScreenBtn.onmouseover = function () {
            var i = this;
            if (i.src == I.fullScreenBtnPath) {
                i.src = I.fullScreenBtnOverPath
            }
        };
        l.fullScreenBtn.onmouseout = function () {
            var i = this;
            if (i.src == I.fullScreenBtnOverPath) {
                i.src = I.fullScreenBtnPath
            }
        };
        if (l.zoomBtn1) {
            l.zoomBtn1.onclick = function () {
                I.Zoom.call(I, I.w1Width, I.w1Height, 1)
            };
            l.zoomBtn1.onmouseover = function () {
                var i = this;
                if (i.src == I.zoomBtn1Path) {
                    i.src = I.zoomBtn1OverPath
                } else if (i.src == I.rezoomBtn1Path) {
                    i.src = I.reZoomBtn1OverPath
                }
            };
            l.zoomBtn1.onmouseout = function () {
                var i = this;
                if (i.src == I.zoomBtn1OverPath) {
                    i.src = I.zoomBtn1Path
                } else if (i.src == I.reZoomBtn1OverPath) {
                    i.src = I.rezoomBtn1Path
                }
            }
        }
        if (l.zoomBtn2) {
            l.zoomBtn2.onclick = function () {
                I.Zoom.call(I, I.w2Width, I.w2Height, 2)
            };
            l.zoomBtn2.onmouseover = function () {
                var i = this;
                if (i.src == I.zoomBtn2Path) {
                    i.src = I.zoomBtn2OverPath
                } else if (i.src == I.rezoomBtn2Path) {
                    i.src = I.reZoomBtn2OverPath
                }
            };
            l.zoomBtn2.onmouseout = function () {
                var i = this;
                if (i.src == I.zoomBtn2OverPath) {
                    i.src = I.zoomBtn2Path
                } else if (i.src == I.reZoomBtn2OverPath) {
                    i.src = I.rezoomBtn2Path
                }
            }
        }
        l.pZone.onmousedown = function (event) {
            I.MouseDown.call(I, event, 0)
        };
        l.vZone.onmousedown = function (event) {
            I.MouseDown.call(I, event, 1)
        };
        l.vBox.onmouseover = function () {
            this.style.backgroundImage = "url(" + I.vBoxOverPath + ")"
        };
        l.vBox.onmouseout = function () {
            this.style.backgroundImage = "url(" + I.vBoxPath + ")"
        };
        l.vBox.onselectstart = function () {
            return false
        };
        document.onmousemove = function (event) {
            I.MouseMove.call(I, event)
        };
        document.ondragstart = function (event) {
            return false
        };
        document.onmouseup = function (event) {
            I.MouseUp.call(I, event)
        };
        document.onstop = function (event) {
            I.Stop.call(I, event)
        };
        window.onunload = function (event) {
            I.Clear.call(I, event)
        }
    }, Draw: function () {
        var i = this;
        i.wObject.classid = "clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6";
        i.wObject.id = i.id;
        i.wObject.width = i.wWidth;
        i.wObject.height = i.wHeight;
        i.wObject.settings.autoStart = i.autoStart;
        i.wObject.URL = i.netModel == 1 ? i.bFile : i.nFile;
        i.wObject.standby = "Loading Microsoft Windows Media Player components...";
        i.wObject.stretchToFit = true;
        i.wObject.enableContextMenu = false;
        i.wObject.uiMode = "full";
        i.videoNode.appendChild(i.wObject)
    }, Clear: function () {
        var i = this;
        i.wObject = null;
        i.wEmbed = null
    }, DrawToNS: function () {
        var i = this;
        document.getElementById('videoDisplay').style.display = "block";
        document.getElementById('videoDisplay').parentNode.style.display = "block";
        var _url = i.netModel == 1 ? i.bFile : i.nFile;
        var b = '<object width="' + i.wWidth + '" height="' + i.wHeight + '" classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6">';
        b += '<param value="mms://03vl.sina.com.cn/radio_rbc_fm1039" name="URL">';
        b += '<param value="True" name="AutoStart">';
        b += '<param value="full" name="uiMode">';
        b += '<param value="9999" name="PlayCount">';
        b += '<embed width="1" id="videoembed" height="1" type="application/x-mplayer2" pluginspage="http://microsoft.com/windows/mediaplayer/en/download/" src="' + _url + '">';
        b += '</object>';
        i.videoNode.innerHTML = b;
        i.wObject = document.getElementById('videoembed')
    }, ValidateVer: function () {
        var k = navigator.plugins && navigator.plugins.length, e = false;
        if (k) {
            for (var i = 0; i < k; i++) {
                if (navigator.plugins[i].name.toLowerCase().indexOf('windows media player firefox plugin') != -1) {
                    e = true;
                    break
                }
            }
            if (!e) {
                noServer('检测到您没有安装Windows Media Player插件，无法正常使用播放器按钮<br><a target="_blank" onclick="hideNotice();" style="line-height: 30px; color: rgb(255, 203, 73); font-size: 16px;" href="http://rm.sina.com.cn/live/p2p/wmpfirefoxplugin.exe">点击此处安装最新的播放器插件</a>');
                return false
            }
            return true
        } else if (window.ActiveXObject) {
            var i, I = navigator.userAgent.indexOf("NT 5.0") > -1, o = this,
                l = navigator.userAgent.indexOf("Windows NT 5.1") > -1;
            try {
                i = new ActiveXObject("WMPlayer.OCX.7")
            } catch (err) {
                i = false
            }
            if (I) {
                if (!i || i.versionInfo.split(".")[0] < 9) {
                    noServer('您的Windows Media Player 版本过低,可能无法正常观看视频<br><a target="_blank" onclick="hideNotice();" style="line-height: 30px; color: rgb(255, 203, 73); font-size: 16px;" href="http://down1.tech.sina.com.cn/download/downContent/2006-05-15/17833.shtml">点击此处安装最新的播放器插件</a>');
                    return false
                }
            } else if (l) {
                if (!i || i.versionInfo.split(".")[0] < o.version) {
                    if (o.version == 9) {
                        noServer('您的Windows Media Player 版本过低,可能无法正常观看视频<br><a target="_blank" onclick="hideNotice();" style="line-height: 30px; color: rgb(255, 203, 73); font-size: 16px;" href="http://down1.tech.sina.com.cn/download/downContent/2006-05-15/17835.shtml">点击此处安装最新的播放器插件</a>');
                        return false
                    } else if (o.version >= 10) {
                        noServer('您的Windows Media Player 版本过低,可能无法正常观看视频<br><a target="_blank" onclick="hideNotice();" style="line-height: 30px; color: rgb(255, 203, 73); font-size: 16px;" href="http://down1.tech.sina.com.cn/download/downContent/2004-03-16/642.shtml">点击此处安装最新的播放器插件</a>');
                        return false
                    }
                }
            }
            return true
        }
    }, Mute: function (i) {
        var I = this;
        if (i == true) {
            I.SetCurState("mute");
            I.wObject.settings.mute = true
        } else if (i == false) {
            I.SetCurState("muteNo");
            I.wObject.settings.mute = false
        } else if (I.wObject.settings.mute == false) {
            I.SetCurState("mute");
            I.wObject.settings.mute = true
        } else if (I.wObject.settings.mute == true) {
            I.SetCurState("muteNo");
            I.wObject.settings.mute = false
        }
    }, SetVolume: function (i) {
        var I = this;
        if (typeof (i) != "number") {
            throw new Error("SetVolume(volNum)参数为number类型")
        }
        if (i > 100) {
            I.SetVolume(100)
        } else if (i < 0) {
            I.SetVolume(0)
        } else {
            I.wObject.settings.volume = i;
            I.vBox.style.left = Math.round(I.vZoneWidth / 100 * i) + "px"
        }
    }, PlayOrPauseHandler: function () {
        var i = this;
        if (i.wObject.playState != 3) {
            i.wObject.controls.play();
            return
        }
        if (i.wObject.playState != 2) {
            i.wObject.controls.pause();
            return
        }
    }, Play: function (I, l, i) {
        var o = this;
        if (!I || !l) {
            o.wObject.controls.play();
            return
        }
        o.bFile = I;
        o.nFile = l;
        if (i) {
            o.adPath = i
        }
        if (!sina.isIE) {
            if (o.netModel == 0) o.wEmbed.src = o.nFile;
            if (o.netModel == 1) o.wEmbed.src = o.bFile;
            return
        }
        if (o.netModel == 0) {
            o.wObject.URL = o.nFile
        }
        if (o.netModel == 1) {
            o.wObject.URL = o.bFile
        }
        if (!o.autoStart) {
            o.wObject.controls.play()
        }
    }, Pause: function () {
        this.wObject.controls.pause()
    }, Stop: function () {
        this.wObject.controls.stop()
    }, FullScreen: function () {
        var i = this;
        if (i.wObject.playState == 3 || i.wObject.playState == 2) {
            i.wObject.fullScreen = true
        }
    }, SelectNetModel: function () {
        var i = this;
        if (i.netModel == 0) {
            i.wObject.URL = i.bFile;
            i.SetCurState("broad");
            i.netModel = 1;
            sina.SetCookie("bnTxtNetModel", "1")
        } else if (i.netModel == 1) {
            i.wObject.URL = i.nFile;
            i.SetCurState("narrow");
            i.netModel = 0;
            sina.SetCookie("bnTxtNetModel", "0")
        } else {
            throw new Error("当前this.netModel状态不正确")
        }
        if (!i.autoStart) {
            i.wObject.controls.play()
        }
    }, FixPos: function () {
        var i = this
    }, MouseDown: function (event, l) {
        var o = this, event = window.event || event, obj = event.srcElement ? event.srcElement : event.target;
        o.isPorV = l;
        if (o.isPorV == 0) {
            if (o.wObject.currentMedia.duration > 0) {
                o.pFlag = true;
                if (obj.id != o.pZone.id) {
                } else {
                    var I = Math.floor(event.clientX - sina.GetOLeft(o.pZone) - o.pBoxWidth / 2);
                    if (I > o.pZoneWidth - o.pBoxWidth) {
                        I = o.pZoneWidth - o.pBoxWidth
                    } else if (I < 0) {
                        I = 0
                    }
                    o.pBox.style.left = I + "px"
                }
            }
        } else if (o.isPorV == 1) {
            o.vFlag = true;
            if (obj.id != o.vZone.id) {
            } else {
                var i = Math.floor(event.clientX - sina.GetOLeft(o.vZone) - o.vBoxWidth / 2);
                if (i > o.vZoneWidth - o.vBoxWidth) {
                    i = o.vZoneWidth - o.vBoxWidth
                } else if (i < 0) {
                    i = 0
                }
                o.vBox.style.left = i + "px"
            }
        }
    }, MouseMove: function (event) {
        var I = this, i, event = window.event || event;
        try {
            if (I.isPorV == 0) {
                if (I.wObject.currentMedia.duration && I.wObject.currentMedia.duration > 0) {
                    if (I.pFlag) {
                        I.pBox.style.left = Math.floor(event.clientX - sina.GetOLeft(I.pZone) - I.pBoxWidth / 2) + "px"
                    }
                    if (parseInt(I.pBox.style.left.replace("px", "")) > (I.pZoneWidth - I.pBoxWidth)) {
                        I.pBox.style.left = I.pZoneWidth - I.pBoxWidth + "px"
                    }
                    if (parseInt(I.pBox.style.left.replace("px", "")) < 0) {
                        I.pBox.style.left = 0 + "px"
                    }
                }
            } else if (I.isPorV == 1) {
                if (I.vFlag) {
                    I.vBox.style.left = event.clientX - sina.GetOLeft(I.vZone) - I.vBoxWidth / 2 + "px"
                }
                if (parseInt(I.vBox.style.left.replace("px", "")) > (I.vZoneWidth - I.vBoxWidth)) {
                    I.vBox.style.left = (I.vZoneWidth - I.vBoxWidth) + "px"
                }
                if (parseInt(I.vBox.style.left.replace("px", "")) < 0) {
                    I.vBox.style.left = 0 + "px"
                }
            }
        } catch (e) {
        }
    }, MouseUp: function (event) {
        var I = this, event = window.event || event;
        if (!I.wObject || !I.wObject.currentMedia) {
            return false
        }
        if (I.isPorV == 0) {
            if (I.wObject.currentMedia.duration > 0) {
                if (I.pFlag) {
                    I.wObject.controls.currentPosition = I.wObject.currentMedia.duration * (parseInt(I.pBox.style.left.replace("px", "")) / (I.pZoneWidth - I.pBoxWidth))
                }
                I.pFlag = false
            }
        } else if (I.isPorV == 1) {
            if (I.vFlag) {
                var i = Math.floor((parseInt(I.vBox.style.left) / (I.vZoneWidth - I.vBoxWidth)) * (100));
                if (i <= 0) {
                } else {
                    I.wObject.settings.mute = false;
                    I.SetCurState("muteNo")
                }
                I.wObject.settings.volume = Math.round(i)
            }
            I.vFlag = false
        }
    }, MouseEnd: function (event) {
        var _event = window.event || event;
        if (this.wObject.currentMedia.duration > 0) {
            _event.returnValue = false;
            _event.preventDefault()
        }
    }, SetCurFile: function (l, I, i) {
        this.Play(l, I, i)
    }, Zoom: function (o, l, I) {
        var O = this;
        if (arguments.length == 1 && arguments[0] == 0) {
            if (O.wObject && O.wObject.width != O.wWidth) {
                O.wObject.width = O.wWidth;
                O.wObject.height = O.wHeight;
                O.playerNode.style.width = O.playerNodeWidth + "px";
                O.playerNode.style.height = O.playerNodeHeight + "px";
                O.videoNode.style.width = O.wWidth + "px";
                O.videoNode.style.height = O.wHeight + "px";
                O.SetCurState("zoom1");
                O.SetCurState("zoom2")
            }
            return
        }
        if (O.wObject.playState == 1 || O.wObject.playState == 10) {
            return
        }
        var i = sina.GetOffsetPos(O.wObject)[1] - 20;
        window.scrollTo(0, i);
        if (O.wObject.width != o) {
            O.wObject.width = o;
            O.wObject.height = l;
            O.playerNode.style.width = O.playerNodeWidth - O.wWidth + o + "px";
            O.playerNode.style.height = O.playerNodeHeight - O.wHeight + l + "px";
            O.videoNode.style.width = o + "px";
            O.videoNode.style.height = l + 15 + "px";
            if (I == 1) {
                O.SetCurState("reZoom1");
                O.SetCurState("zoom2")
            } else if (I == 2) {
                O.SetCurState("reZoom2");
                O.SetCurState("zoom1")
            }
        } else {
            O.Zoom(0)
        }
    }, SetCurState: function (i) {
        var I = this;
        switch (i) {
            case"play":
                try {
                    I.playBtn.setAttribute("src", I.pauseBtnPath);
                    I.playBtn.setAttribute("alt", I.pauseBtnAlt);
                    I.stopBtn.setAttribute("src", I.stopBtnPath);
                    I.stopBtn.setAttribute("alt", I.stopBtnAlt);
                    I.stopBtn.style.cursor = "hand";
                    I.fullScreenBtn.setAttribute("src", I.fullScreenBtnPath);
                    I.fullScreenBtn.style.cursor = "hand";
                    I.fullScreenBtn.setAttribute("alt", I.fullScreenBtnAlt);
                    I.videoNode.style.display = "block";
                    I.playerAd.style.display = "none";
                    I.SetCurState("zoom1");
                    I.SetCurState("zoom2")
                } catch (e) {
                }
                break;
            case"pause":
                I.playBtn.setAttribute("src", I.playBtnPath);
                I.playBtn.setAttribute("alt", I.playBtnAlt);
                I.stopBtn.setAttribute("src", I.stopBtnPath);
                I.stopBtn.setAttribute("alt", I.stopBtnAlt);
                I.stopBtn.style.cursor = "hand";
                I.SetCurState("zoom1");
                I.SetCurState("zoom2");
                break;
            case"stop":
                I.stopBtn.setAttribute("src", I.stopBtnDisPath);
                I.stopBtn.setAttribute("alt", "");
                I.stopBtn.style.cursor = "default";
                I.playBtn.setAttribute("src", I.playBtnPath);
                I.playBtn.setAttribute("alt", I.playBtnAlt);
                I.pBox.style.left = "0px";
                I.fullScreenBtn.setAttribute("src", I.fullScreenBtnDisPath);
                I.fullScreenBtn.style.cursor = "default";
                I.fullScreenBtn.setAttribute("alt", "");
                I.videoNode.style.display = "none";
                I.playerAd.style.display = "block";
                I.Zoom(0);
                I.SetCurState("noZoom");
                break;
            case"muteNo":
                I.muteBtn.setAttribute("src", I.muteBtnOffPath);
                I.muteBtn.setAttribute("alt", I.muteBtnOffAlt);
                break;
            case"mute":
                I.muteBtn.setAttribute("src", I.muteBtnPath);
                I.muteBtn.setAttribute("alt", I.muteBtnAlt);
                break;
            case"narrow":
                I.bOrNBtn.setAttribute("src", I.broadBtnPath);
                I.bOrNBtn.style.cursor = "hand";
                I.bOrNBtn.setAttribute("alt", I.broadBtnAlt);
                break;
            case"broad":
                I.bOrNBtn.setAttribute("src", I.narrowBtnPath);
                I.bOrNBtn.style.cursor = "hand";
                I.bOrNBtn.setAttribute("alt", I.narrowBtnAlt);
                break;
            case"zoom1":
                if (I.zoomBtn1) {
                    I.zoomBtn1.setAttribute("src", I.zoomBtn1Path);
                    I.zoomBtn1.setAttribute("alt", I.zoomBtn1Alt);
                    I.zoomBtn1.style.cursor = "hand"
                }
                break;
            case"reZoom1":
                if (I.zoomBtn1) {
                    I.zoomBtn1.setAttribute("src", I.rezoomBtn1Path);
                    I.zoomBtn1.setAttribute("alt", I.reZoomBtn1Alt);
                    I.zoomBtn1.style.cursor = "hand"
                }
                break;
            case"zoom2":
                if (I.zoomBtn2) {
                    I.zoomBtn2.setAttribute("src", I.zoomBtn2Path);
                    I.zoomBtn2.setAttribute("alt", I.zoomBtn2Alt);
                    I.zoomBtn2.style.cursor = "hand"
                }
                break;
            case"reZoom2":
                if (I.zoomBtn2) {
                    I.zoomBtn2.setAttribute("src", I.rezoomBtn2Path);
                    I.zoomBtn2.setAttribute("alt", I.reZoomBtn2Alt);
                    I.zoomBtn2.style.cursor = "hand"
                }
                break;
            case"noZoom":
                I.zoomBtn1.setAttribute("src", I.zoomBtn1DisPath);
                I.zoomBtn1.style.cursor = "default";
                I.zoomBtn1.setAttribute("alt", "");
                I.zoomBtn2.setAttribute("src", I.zoomBtn2DisPath);
                I.zoomBtn2.style.cursor = "default";
                I.zoomBtn2.setAttribute("alt", "");
                break;
            default:
                throw new Error("SetCurState(String state) 参数不正确")
        }
    }, PlayStateChange: function (i) {
        var I = this;
        switch (i) {
            case 0:
                I.SetCurState("play");
                break;
            case 1:
                I.SetCurState("stop");
                break;
            case 2:
                I.SetCurState("pause");
                break;
            case 3:
                I.SetCurState("play");
                break;
            case 4:
                break;
            case 5:
                break;
            case 6:
                break;
            case 7:
                break;
            case 8:
                break;
            case 9:
                I.SetCurState("play");
                break;
            case 10:
                break;
            case 11:
                break;
            default:
        }
    }, PositionChange: function (i, I) {
    }, OpenStateChange: function (i) {
    }
};