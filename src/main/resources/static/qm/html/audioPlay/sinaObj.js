﻿//sina
var sina = {
    $: function (objName) {
        if (document.getElementById) {
            return document.getElementById(objName);
        } else {
            return eval('document.all.' + objName)
        }
    }, isIE: navigator.appVersion.indexOf("MSIE") != -1 ? true : false, addEvent: function (l, i, I) {
        if (l.attachEvent) {
            l.attachEvent("on" + i, I)
        } else {
            l.addEventListener(i, I, false)
        }
    }, delEvent: function (l, i, I) {
        if (l.detachEvent) {
            l.detachEvent("on" + i, I)
        } else {
            l.removeEventListener(i, I, false)
        }
    }, readCookie: function (O) {
        var o = "", l = O + "=";
        if (document.cookie.length > 0) {
            var i = document.cookie.indexOf(l);
            if (i != -1) {
                i += l.length;
                var I = document.cookie.indexOf(";", i);
                if (I == -1) I = document.cookie.length;
                o = document.cookie.substring(i, I)
            }
        }
        ;
        return o
    }, writeCookie: function (i, l, o, c) {
        var O = "", I = "";
        if (o != null) {
            O = new Date((new Date).getTime() + o * 3600000);
            O = "; expires=" + O.toGMTString()
        }
        ;
        if (c != null) {
            I = ";domain=" + c
        }
        ;document.cookie = i + "=" + escape(l) + O + I
    }, readStyle: function (I, l) {
        if (I.style[l]) {
            return I.style[l]
        } else if (I.currentStyle) {
            return I.currentStyle[l]
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
            var i = document.defaultView.getComputedStyle(I, null);
            return i.getPropertyValue(l)
        } else {
            return null
        }
    }, absPosition: function (o, I) {
        var l = o.offsetLeft, O = o.offsetTop, i = o.offsetParent, c = "";
        try {
            while (i.id != document.body && i.id != document.documentElement && i != I && i != null) {
                c += i.tagName + " , ";
                i = i.offsetParent;
                l += i.offsetLeft;
                O += i.offsetTop
            }
        } catch (e) {
        }
        ;
        return {left: l, top: O}
    }, cutString: function (I, o) {
        if (typeof (I) != "string") {
            return null
        }
        ;
        if (!(/^[0-9]*[1-9][0-9]*$/).test(o)) {
            return I
        }
        ;
        if (o == 0) {
            return I
        }
        ;var l = 0, i = "";
        for (var O = 0; O < I.length; O++) {
            if (I.charCodeAt(O) > 255) {
                l += 2
            } else {
                l++
            }
            ;
            if (l <= o - 2) {
                i += I.charAt(O)
            } else {
                if (O == I.length - 1) {
                    i += I.charAt(O)
                } else {
                    i += ".."
                }
                ;
                break
            }
        }
        ;
        return i
    }
};

//sinaFlash
var sinaFlash = function (V, x, X, Z, v, z, i, c, I, l, o) {
    var w = this;
    if (!document.createElement || !document.getElementById) {
        return
    }
    w.id = x ? x : '';
    var O = function (I, i) {
        for (var l = 0; l < I.length; l++) {
            if (I[l] == i) {
                return l
            }
        }
        return -1
    }, C = '8.0.42.0';
    if (O(['eladies.sina.com.cn', 'ent.sina.com.cn'], document.domain) > -1) {
        w.ver = C
    } else {
        w.ver = v ? v : C
    }
    w.ver = w.ver.replace(/\./g, ',');
    w.__classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
    w.__codebase = "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=" + w.ver;
    w.width = X;
    w.height = Z;
    w.movie = V;
    w.src = w.movie;
    w.bgcolor = z ? z : '';
    w.quality = c ? c : "high";
    w.__pluginspage = "http://www.macromedia.com/go/getflashplayer";
    w.__type = "application/x-shockwave-flash";
    w.useExpressInstall = (typeof (i) == "boolean") ? i : false;
    w.xir = I ? I : window.location;
    w.redirectUrl = l ? l : window.location;
    w.detectKey = (typeof (o) == "boolean") ? o : true;
    w.escapeIs = false;
    w.__objAttrs = {};
    w.__params = {};
    w.__embedAttrs = {};
    w.__flashVars = [];
    w.__flashVarsStr = "";
    w.__forSetAttribute("id", w.id);
    w.__objAttrs["classid"] = w.__classid;
    w.__forSetAttribute("codebase", w.__codebase);
    w.__forSetAttribute("width", w.width);
    w.__forSetAttribute("height", w.height);
    w.__forSetAttribute("movie", w.movie);
    w.__forSetAttribute("quality", w.quality);
    w.__forSetAttribute("pluginspage", w.__pluginspage);
    w.__forSetAttribute("type", w.__type);
    w.__forSetAttribute("bgcolor", w.bgcolor)
}
sinaFlash.prototype = {
    getFlashHtml: function () {
        var I = this, i = '<object ';
        for (var l in I.__objAttrs) {
            i += l + '="' + I.__objAttrs[l] + '"' + ' '
        }
        i += '>\n';
        for (var l in I.__params) {
            i += '	<param name="' + l + '" value="' + I.__params[l] + '" \/>\n'
        }
        if (I.__flashVarsStr != "") {
            i += '	<param name="flashvars" value="' + I.__flashVarsStr + '" \/>\n'
        }
        i += '	<embed ';
        for (var l in I.__embedAttrs) {
            i += l + '="' + I.__embedAttrs[l] + '"' + ' '
        }
        i += '><\/embed>\n<\/object>';
        return i
    }, __forSetAttribute: function (I, i) {
        var l = this;
        if (typeof (I) == "undefined" || I == '' || typeof (i) == "undefined" || i == '') {
            return
        }
        I = I.toLowerCase();
        switch (I) {
            case "classid":
                break;
            case "pluginspage":
                l.__embedAttrs[I] = i;
                break;
            case "onafterupdate":
            case "onbeforeupdate":
            case "onblur":
            case "oncellchange":
            case "onclick":
            case "ondblClick":
            case "ondrag":
            case "ondragend":
            case "ondragenter":
            case "ondragleave":
            case "ondragover":
            case "ondrop":
            case "onfinish":
            case "onfocus":
            case "onhelp":
            case "onmousedown":
            case "onmouseup":
            case "onmouseover":
            case "onmousemove":
            case "onmouseout":
            case "onkeypress":
            case "onkeydown":
            case "onkeyup":
            case "onload":
            case "onlosecapture":
            case "onpropertychange":
            case "onreadystatechange":
            case "onrowsdelete":
            case "onrowenter":
            case "onrowexit":
            case "onrowsinserted":
            case "onstart":
            case "onscroll":
            case "onbeforeeditfocus":
            case "onactivate":
            case "onbeforedeactivate":
            case "ondeactivate":
            case "codebase":
                l.__objAttrs[I] = i;
                break;
            case "src":
            case "movie":
                l.__embedAttrs["src"] = i;
                l.__params["movie"] = i;
                break;
            case "width":
            case "height":
            case "align":
            case "vspace":
            case "hspace":
            case "title":
            case "class":
            case "name":
            case "id":
            case "accesskey":
            case "tabindex":
            case "type":
                l.__objAttrs[I] = l.__embedAttrs[I] = i;
                break;
            default:
                l.__params[I] = l.__embedAttrs[I] = i
        }
    }, __forGetAttribute: function (i) {
        var I = this;
        i = i.toLowerCase();
        if (typeof I.__objAttrs[i] != "undefined") {
            return I.__objAttrs[i]
        } else if (typeof I.__params[i] != "undefined") {
            return I.__params[i]
        } else if (typeof I.__embedAttrs[i] != "undefined") {
            return I.__embedAttrs[i]
        } else {
            return null
        }
    }, setAttribute: function (I, i) {
        this.__forSetAttribute(I, i)
    }, getAttribute: function (i) {
        return this.__forGetAttribute(i)
    }, addVariable: function (I, i) {
        var l = this;
        if (l.escapeIs) {
            I = escape(I);
            i = escape(i)
        }
        if (l.__flashVarsStr == "") {
            l.__flashVarsStr = I + "=" + i
        } else {
            l.__flashVarsStr += "&" + I + "=" + i
        }
        l.__embedAttrs["FlashVars"] = l.__flashVarsStr
    }, getVariable: function (I) {
        var o = this, i = o.__flashVarsStr;
        if (o.escapeIs) {
            I = escape(I)
        }
        var l = new RegExp(I + "=([^\\&]*)(\\&?)", "i").exec(i);
        if (o.escapeIs) {
            return unescape(RegExp.$1)
        }
        return RegExp.$1
    }, addParam: function (I, i) {
        this.__forSetAttribute(I, i)
    }, getParam: function (i) {
        return this.__forGetAttribute(i)
    }, write: function (i) {
        var I = this;
        if (typeof i == "string") {
            document.getElementById(i).innerHTML = I.getFlashHtml()
        } else if (typeof i == "object") {
            i.innerHTML = I.getFlashHtml()
        }
    }
}

/*垂直滚动焦点图构造函数 v1.0 by ChenLiang*/
function FocusVertical(a, b, c, d, e) {
    this.contId = a;
    this.imgHeight = c;
    this.imgWidth = b;
    this.autoTime = e;
    this.eventType = d;
    this.contObj = null;
    this.curId = this.count = 0;
    this.items = [];
    this.ing = false;
    this.autoTimer = null
}

FocusVertical.prototype = {
    constructor: FocusVertical, version: "1.0", author: "ChenLiang", init: function () {
        this.contObj = sina.$(this.contId);
        this.contObj.style.width = this.imgWidth + "px";
        var a = this.contObj.childNodes;
        if (!this.eventType) this.eventType = "mousemove";
        for (var b = this, c = 0; c < a.length; c++) if (a[c].nodeName.toLowerCase() === "li") {
            var d = {};
            d.parent = a[c];
            for (var e = a[c].getElementsByTagName("div"), f = 0; f < e.length; f++) if (e[f].className.indexOf("tit-cl") >= 0) {
                d.tit = e[f];
                if (this.items.length === 0) d.tit.className += " selected";
                (function () {
                    var h = b.items.length;
                    sina.addEvent(d.tit, b.eventType, function () {
                        b.play(h);
                        clearInterval(b.autoTimer)
                    })
                })()
            } else if (e[f].className.indexOf("img-cl") >= 0) {
                d.content = e[f];
                if (this.items.length > 0) {
                    d.content.style.display = "none";
                    d.content.style.height = "0px"
                }
                var g = d.content.getElementsByTagName("img")[0];
                g.style.width = this.imgWidth + "px";
                g.style.height = this.imgHeight + "px"
            }
            this.items.push(d)
        }
        this.autoPlay();
        sina.addEvent(this.contObj, "mouseover", function () {
            clearInterval(b.autoTimer)
        });
        sina.addEvent(this.contObj, "mouseout", function () {
            b.autoPlay()
        })
    }, play: function (a) {
        if (a === this.curId || this.ing === true) return false;
        var b = this, c = this.items[a];
        c.content.style.display = "block";
        this.ing = true;
        var d = setInterval(function () {
            var e = b.items[b.curId].content, f = Math.ceil((e.offsetHeight - 0) / 7);
            e.style.height = e.offsetHeight - f + "px";
            c.content.style.height = c.content.offsetHeight + f + "px";
            if (Math.floor(e.offsetHeight - f) <= 0) {
                b.items[b.curId].content.style.height = "0px";
                c.content.style.height = b.imgHeight + "px";
                e.style.display = "none";
                clearInterval(d);
                b.curId = a;
                b.ing = false
            }
        }, 10);
        this.items[this.curId].tit.className = this.items[this.curId].tit.className.replace(" selected", "");
        c.tit.className += " selected"
    }, _autoPlay: function () {
        var a = this.curId + 1;
        if (a >= this.items.length) a = 0;
        this.play(a)
    }, autoPlay: function () {
        var a = this;
        if (this.autoTime / 1) this.autoTimer = setInterval(function () {
            a._autoPlay()
        }, a.autoTime * 1E3)
    }
};

//焦点图构造函数 071221 mengjia
//edited by liuxiaolong 10.4.28
var focusUtils = {
    hoverNum: function (I) {
        I = window.event ? event : I;
        var i = I.srcElement || I.target;
        if (i) {
            i.className = "NumberHover";
            i.setAttribute("ishovering", "true")
        }
    }, leaveNum: function (I) {
        I = window.event ? event : I;
        var i = I.srcElement || I.target;
        if (i) {
            i.removeAttribute("ishovering");
            if (i.className != "selected") {
                i.className = "NumberLeave"
            }
        }
    }, absPosition: function (o, I) {
        var l = o.offsetLeft, O = o.offsetTop, i = o;
        while (i.id != document.body & i.id != document.documentElement & i != I) {
            i = i.offsetParent;
            l += i.offsetLeft;
            O += i.offsetTop
        }
        ;
        return {left: l, top: O}
    }
};

function Pixviewer(FocusImgID, BigPicID, NumberID, NumberBgID, width, height) {
    this.Data = [];
    this.TimeOut = 5000;
    var isIE = navigator.appVersion.indexOf("MSIE") != -1 ? true : false;
    this.width = width;
    this.height = height;
    this._divtriangle = null;
    this.titleHeight = 0;
    this.TitleID = null;
    this.selectedIndex = 0;
    var TimeOutObj;
    if (!Pixviewer.childs) {
        Pixviewer.childs = []
    }
    ;this.showTime = null;
    this.showSum = 10;
    this.ID = Pixviewer.childs.push(this) - 1;
    this.listCode = '<span style="cursor:pointer; margin:0px; padding:1px 7px 1px 8px; border-left:solid 1px #cccccc; [$rightborder]" src="[$pic]" onclick="Pixviewer.childs[[$thisId]].select([$num])">[$numtoShow]</span>';
    this.Add = function (jsnObj) {
        this.Data.push(jsnObj)
    };
    this.TimeOutBegin = function () {
        clearInterval(TimeOutObj);
        TimeOutObj = setInterval("Pixviewer.childs[" + this.ID + "].next()", this.TimeOut)
    };
    this.TimeOutEnd = function () {
        clearInterval(TimeOutObj)
    };
    this.select = function (num, noAction) {
        if (num > this.Data.length - 1) {
            return
        }
        ;
        if (num == this.selectedIndex) {
            return
        }
        ;this.TimeOutBegin();
        if (BigPicID) {
            if (this.$(BigPicID)) {
                var aObj = this.$(BigPicID).getElementsByTagName("a")[0];
                aObj.href = this.Data[num].url;
                if (this.aImgY) {
                    this.aImgY.style.display = 'none';
                    this.aImg.style.zIndex = 0
                }
                ;this.aImgY = this.$('F' + this.ID + 'BF' + this.selectedIndex);
                this.aImg = this.$('F' + this.ID + 'BF' + num);
                clearTimeout(this.showTime);
                this.showSum = 5;
                if (!noAction) {
                    var appleMobileCheck = /\((iPad|iPhone|iPod)/i;
                    if (appleMobileCheck.test(navigator.userAgent)) {
                        if (this.aImgY) {
                            this.aImgY.style.display = 'none'
                        }
                        ;this.aImg.style.display = 'block';
                        this.aImg.style.zIndex = 0;
                        this.aImg.style.opacity = 1;
                        this.aImgY = null
                    } else {
                        this.showTime = setTimeout("Pixviewer.childs[" + this.ID + "].show()", 30)
                    }
                } else {
                    if (isIE) {
                        this.aImg.style.filter = "alpha(opacity=100)"
                    } else {
                        this.aImg.style.opacity = 1
                    }
                }
            }
        }
        ;
        if (NumberID) {
            if (this.$(NumberID) && FocusImgID && this.$(FocusImgID)) {
                var sImg = this.$(NumberID).getElementsByTagName("span"), i;
                for (i = 0; i < sImg.length; i++) {
                    if (i == num || num == (i - this.Data.length)) {
                        sImg[i].className = "selected"
                    } else {
                        sImg[i].className = "";
                        if (sImg[i].getAttribute("ishovering") != "true") {
                            sImg[i].className = "NumberLeave"
                        }
                    }
                }
                ;
                if (!this._divtriangle) {
                    this._divtriangle = document.createElement("div");
                    this._divtriangle.className = "Triangle";
                    this._divtriangle.style.bottom = this.titleHeight + "px";
                    this.$(FocusImgID).appendChild(this._divtriangle)
                }
                ;
                if (this._divtriangle) {
                    this._divtriangle.style.right = (sImg.length - num - 1) * 21 + (sImg.length - num) + 1 + "px"
                }
            }
        }
        ;
        if (this.TitleID && this.$(this.TitleID)) {
            this.$(this.TitleID).innerHTML = "<a href=\"" + this.Data[num].url + "\" target=\"_blank\">" + this.Data[num].title + "</a>"
        }
        ;this.selectedIndex = num;
        if (this.onchange) {
            this.onchange()
        }
    };
    this.show = function () {
        this.showSum--;
        if (this.aImgY) {
            this.aImgY.style.display = 'block'
        }
        ;this.aImg.style.display = 'block';
        if (isIE) {
            this.aImg.style.filter = "alpha(opacity=0)";
            this.aImg.style.filter = "alpha(opacity=" + (5 - this.showSum) * 20 + ")"
        } else {
            this.aImg.style.opacity = 0;
            this.aImg.style.opacity = (5 - this.showSum) * 0.2
        }
        ;
        if (this.showSum <= 0) {
            if (this.aImgY) {
                this.aImgY.style.display = 'none'
            }
            ;this.aImg.style.zIndex = 0;
            this.aImgY = null
        } else {
            this.aImg.style.zIndex = 2;
            this.showTime = setTimeout("Pixviewer.childs[" + this.ID + "].show()", 30)
        }
    };
    this.next = function () {
        var temp = this.selectedIndex;
        temp++;
        if (temp >= this.Data.length) {
            temp = 0
        }
        ;this.select(temp)
    };
    this.pre = function () {
        var temp = this.selectedIndex;
        temp--;
        if (temp < 0) {
            temp = this.Data.length - 1
        }
        ;this.select(temp)
    };
    this.begin = function () {
        this.selectedIndex = -1;
        var i, temp = "";
        if (FocusImgID) {
            if (this.$(FocusImgID)) {
                var topObj = this.$(FocusImgID);
                topObj.style.width = this.width + "px";
                topObj.style.height = this.height + this.titleHeight + "px";
                var _hb = document.createElement("div");
                _hb.className = "BorderHack1";
                _hb.style.width = this.width + "px";
                topObj.appendChild(_hb);
                _hb = document.createElement("div");
                _hb.className = "BorderHack2";
                _hb.style.height = this.height + "px";
                topObj.appendChild(_hb);
                _hb = document.createElement("div");
                _hb.className = "BorderHack3";
                _hb.style.width = this.width + "px";
                _hb.style.bottom = this.titleHeight + "px";
                topObj.appendChild(_hb);
                _hb = document.createElement("div");
                _hb.className = "BorderHack4";
                _hb.style.height = this.height + "px";
                topObj.appendChild(_hb)
            }
        }
        ;
        if (this.TitleID) {
            if (this.$(this.TitleID)) {
                this.$(this.TitleID).style.width = this.width + "px";
                this.$(this.TitleID).style.height = this.titleHeight + "px";
                this.$(this.TitleID).style.lineHeight = this.titleHeight + "px";
                if (this.titleHeight == 0) {
                    this.$(this.TitleID).style.display = 'none'
                }
            }
        }
        ;
        if (NumberBgID) {
            if (this.$(NumberBgID)) {
                this.$(NumberBgID).style.bottom = this.titleHeight + 1 + "px"
            }
        }
        ;
        if (BigPicID) {
            if (this.$(BigPicID)) {
                var aObj = this.$(BigPicID).getElementsByTagName("a")[0];
                aObj.style.zoom = 1;
                this.$(BigPicID).style.position = "relative";
                this.$(BigPicID).style.zoom = 1;
                this.$(BigPicID).style.overflow = "hidden";
                this.$(BigPicID).style.height = this.height + "px";
                for (i = 0; i < this.Data.length; i++) {
                    temp += '<img src="' + this.Data[i].pic + '" id="F' + this.ID + 'BF' + i + '" style="display:' + (i == 0 ? 'block' : 'none') + '" galleryimg="no"' + (this.width ? ' width="' + this.width + '"' : '') + (this.height ? ' height="' + this.height + '"' : '') + ' alt="' + this.Data[i].title + '" />'
                }
                ;aObj.innerHTML = temp;
                var imgObjs = aObj.getElementsByTagName("img"),
                    XY = focusUtils.absPosition(imgObjs[0], this.$(BigPicID));
                for (i = 0; i < imgObjs.length; i++) {
                    imgObjs[i].style.position = "absolute";
                    imgObjs[i].style.top = XY.top + "px";
                    imgObjs[i].style.left = XY.left + "px";
                    imgObjs[i].style.width = this.width + "px";
                    imgObjs[i].style.height = this.height + "px"
                }
            }
        }
        ;
        if (NumberID) {
            if (this.$(NumberID)) {
                tempHTML = "";
                for (i = 0; i < this.Data.length; i++) {
                    temp = this.listCode;
                    temp = temp.replace(/\[\$thisId\]/ig, this.ID);
                    temp = temp.replace(/\[\$num\]/ig, i);
                    temp = temp.replace(/\[\$numtoShow\]/ig, i + 1);
                    temp = temp.replace(/\[\$title\]/ig, this.Data[i].title);
                    if (i == this.Data.length - 1) {
                        temp = temp.replace(/\[\$rightborder\]/ig, "border-right:solid 1px #cccccc;")
                    }
                    ;tempHTML += temp
                }
                ;this.$(NumberID).innerHTML = tempHTML;
                this.$(NumberID).style.bottom = this.titleHeight + 1 + "px";
                var sImg = this.$(NumberID).getElementsByTagName("span"), i;
                for (i = 0; i < sImg.length; i++) {
                    if (window.attachEvent) {
                        sImg[i].attachEvent("onmouseover", focusUtils.hoverNum);
                        sImg[i].attachEvent("onmouseout", focusUtils.leaveNum)
                    } else {
                        sImg[i].addEventListener("mouseover", focusUtils.hoverNum, false);
                        sImg[i].addEventListener("mouseout", focusUtils.leaveNum, false)
                    }
                }
            }
        }
        ;this.TimeOutBegin();
        this.select(0, true)
    };
    this.$ = function (objName) {
        if (document.getElementById) {
            return eval('document.getElementById("' + objName + '")')
        } else {
            return eval('document.all.' + objName)
        }
    }
};