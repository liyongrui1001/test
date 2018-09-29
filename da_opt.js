/**
 * 采集js 合并
 * add by 16081267
 * */


// 支持旧采集方式逻辑
var sa = window.sa || {}; // 1.0版本
var _saPageViewInit = window._saPageViewInit || null, // 手动发送访问日志
    _analyseExpoTags = window._analyseExpoTags || null, // 推荐曝光采集方法
    _sendOrderDatas = window._sendOrderDatas || null, // 订单采集方法
    _sendOrderInfo = window._sendOrderInfo || null, // 云购物车追加发送订单信息的接口
    _sendRegisterDatas = window._sendRegisterDatas || null, // 注册采集方法
    _sendStorageDatas = window._sendStorageDatas || null, // 库存采集方法
    _dapush = window._dapush || null, // 库存采集接口
    _dapushbook = window._dapushbook || null, //功能：ga和sa图书四级页面库存数据采集调用：图书四级页面异步调用此方法
    saCustomDataUtil = window.saCustomDataUtil || null, // 自定义采集接口
    _searchDataSaPush = window._searchDataSaPush || null, // 搜索日志采集接口
    _ssaSendPvData = window._ssaSendPvData || null, // 采集PV信息的接口
    _sendExpoDatas = window._sendExpoDatas || null,
    pageViewUtil = window.pageViewUtil || null; //自定义页面PV发送接口工具
// 开放的工具方法
var pageSaleCookieUtil = window.pageSaleCookieUtil || null; //页面销售数据cookie操作工具类
var SAUP = {}, // 2.0版本
    _JSLOADFLAG = window._JSLOADFLAG || false; // 处理js重复引入问题
//第三方cookie工具类　@88382010  20180522
window._sa_utils = {
    getSnvd: function (isCheck) {
        sa.check = "";
        sa.snvd = "";
        sa.cAndl = 0;
        var c = "";
        var l = "";
        if (window.localStorage) {
            l = window.localStorage.getItem("_snvd");
        } else {
            sa.cAndl = sa.cAndl + 2;
        }
        if (l) {
            sa.check = l;
            sa.snvd = l;
            sa.cAndl = sa.cAndl + 2;
        }
        var arrStr = document.cookie.split("; ");
        for (var i = 0; i < arrStr.length; i++) {
            var temp = arrStr[i].split("=");
            if (temp[0] == "_snvd") {
                c = temp[1];
            }
        }
        if (c) {
            sa.check = c;
            sa.snvd = c;
            if (!l || c == l) {
                sa.cAndl = sa.cAndl + 1;
            }
        }
        if (isCheck) {
            this.loadSnvdScript();
        } else {
            if (sa.cAndl != 3) this.loadSnvdScript();
        }
    },
    fillCAndL: function (newEtag) {
        sa.cAndl = sa.cAndl || 0;
        sa.check = sa.check || "";
        sa.snvd = sa.snvd || "";
        var dm = this.getTopDomain();
        if (newEtag) {
            if (sa.cAndl == 0 && sa.check.length <= 24) {
                document.cookie = "_snvd=" + sa.check + ";expires=Sun, 23-Jan-28 06:56:38 GMT; path=/ ;domain=" + dm;
                if (window.localStorage) {
                    window.localStorage.setItem("_snvd", sa.check);
                }
                sa.snvd = sa.check;
            } else {
                this.loadSnvdScript(sa.snvd);
            }
        } else {
            if (sa.check.length <= 24) {
                document.cookie = "_snvd=" + sa.check + ";expires=Sun, 23-Jan-28 06:56:38 GMT; path=/ ;domain=" + dm;
                if (window.localStorage) {
                    window.localStorage.setItem("_snvd", sa.check);
                }
            }
        }
    },
    loadSnvdScript: function (isCheck) {
        var sc = document.createElement("script");
        sc.async = true;
        sc.type = "text/javascript";
        sc.src = "//sa.suning.cn/cc.js";
        if (isCheck) {
            sc.src = sc.src + "?check=" + isCheck;
        }
        document.getElementsByTagName("head")[0].appendChild(sc);
    },
    getTopDomain: function (webUrl) {
        var d = webUrl || document.domain;
        var c = d.split('.');
        if (c instanceof Array) {
            var a = 0;
            var b = c.length;
            var num = 2; // 根域名
            var s = '';
            var e = c.splice(b - num, b); // 处理 三级四级域名
            if (d.indexOf('.com.cn') != -1) { // 处理 .com.cn的域名
                e = d.split('.').splice(b - num - 1, b);
            }
            for (var i = 0; i < e.length; i++) {
                s += '.' + e[i];
            }
            return s;
        }
    }
};


/**
 * 以下对采集js进行合并 包括:
 * da_opt.js,sa_click.js
 * *
 */
(function (window) {
    // 全局配置信息
    var __conf = {
        isSaPrd: (function () {
            // js执行环境判断 自动获取
            function getJsUrl(jsName) {
                var jsObjs = document.scripts;
                var jsPath = "";
                for (var i = 0; i < jsObjs.length; i++) {
                    jsPath = jsObjs[i] ? jsObjs[i].src : "";
                    if (jsPath.indexOf(jsName) > -1) {
                        return jsPath;
                    }
                }
                return "";
            }
            var _url = getJsUrl('da_opt.js') ? getJsUrl('da_opt.js') : getJsUrl('sa_simple.js');
            if (!_url) {
                // 本地测试时使用
                return false;
            }
            if (_url && (_url.indexOf('//sitres.suning') > -1 ||
                    _url.indexOf('//preres.suning') > -1 ||
                    _url.indexOf('//sitsslres.suning') > -1 ||
                    _url.indexOf('//presslres.suning') > -1 ||
                    _url.indexOf('//resprexg.suning') > -1 ||
                    _url.indexOf('loc/static')) > -1) {
                return false;
            }
            return true;
        })()
    };
    var _searchInner = null; //解决复制搜索js引用导致，此js里的全局变量失效
    /**
     * 全局 公用工具类 88388897 2018-03-15 开始
     * @private
     */
    var __ut = {
        _deleteKey: function (obj, keyArr) {
            /**
             * 返回去除指定key的对象
             */
            for (var i = 0; i < keyArr.length; i++) {
                delete obj[keyArr[i]]
            }
            return obj;
        },
        _assign: function (d, e) {
            var obj = d;
            if (e && e instanceof Object) {
                for (var i in e) {
                    if (e.hasOwnProperty(i)) {
                        obj[i] = e[i]
                    }
                }
            }
            return obj;
        },
        getUrlKv: function () {
            // 根据传入的对象解析成 url
            if (!obj || typeof obj != 'object') {
                return
            }
            var _url = '';
            for (key in obj) {
                _url += key + '=' + obj[key] + '&'
            }
            return _url ? _url.substr(0, _url.length - 1) : 0;
        },
        isObjArgument: function (e) {
            /**
             * 判断参数是否为 object
             */
            if (e &&
                e instanceof Object) {
                return true
            }
            return false
        },
        isEmptyObj: function (e) {
            for (var _key in e) {
                return false;
            }
            return true;
        },
        saBase64: function () {
            var oThis = this;
            // code table
            var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

            oThis.encode = function (input) {
                var output = '';
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                }
                return output;
            };

            oThis.decode = function (input) {
                var output = '';
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            };

            var _utf8_encode = function (string) {
                string = string.replace(/\r\n/g, '\n');
                var utftext = '';
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }
                return utftext;
            };

            var _utf8_decode = function (utftext) {
                var string = '';
                var i = 0;
                var c = c1 = c2 = 0;
                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            };
        },
        getJsResName: (function () {
            function __getJsUrl(jsName) {
                var jsObjs = document.scripts;
                var jsPath = "";
                for (var i = 0; i < jsObjs.length; i++) {
                    jsPath = jsObjs[i] ? jsObjs[i].src : "";
                    if (jsPath.indexOf(jsName) > -1) {
                        return jsPath;
                    }
                }
                return "";
            }
            if (__getJsUrl('da_opt.js')) {
                return "da_opt.js";
            }
            if (__getJsUrl("sa_simple.js")) {
                return "sa_simple.js";
            }
        })(),
        getInitUrl: function (jsName, isNewSa) {
            // 统一日志接口地址生成方法
            if (!jsName) {
                jsName = this.getJsResName
            }
            var _snProtocol = "//";
            var _saServer = this.getSaServer(jsName, isNewSa);
            var url = _snProtocol + _saServer + '/salog.gif?'
            return url
        },
        getSaServer: function (jsName, isNewSa) {
            if (!jsName) {
                jsName = this.getJsResName;
            }
            var url = this.getJsUrl(jsName);
            isNewSa = !!isNewSa;
            if (__conf.isSaPrd) {
                if (isNewSa) {
                    return "sa.suning.cn";
                } else {
                    return "click.suning.cn/sa";
                }
            } else {
                if (url && url.indexOf("pre") > -1) {
                    if (isNewSa) {
                        return "saprexg.cnsuning.com";
                    } else {
                        if (url && url.indexOf('xg') > -1) {
                            return "clickxgpre.suning.cn/sa";
                        }
                        return "clickpre.suning.cn/sa";
                    }
                } else {
                    if (isNewSa) {
                        return "sasit.suning.cn";
                    } else {
                        return "clicksit.suning.cn/sa";
                    }
                }
            }
        },
        getJsUrl: function (jsName) {

            var jsObjs = document.scripts;
            var jsPath = "";
            for (var i = 0; i < jsObjs.length; i++) {
                jsPath = jsObjs[i] ? jsObjs[i].src : "";
                if (jsPath.indexOf(jsName) > -1) {
                    return jsPath;
                }
            }
            return "";
        },
        // 事件绑定, capture: 捕获事件
        addEvent: function (element, type, callback, capture) {
            if (!element) {
                return
            }
            if (element.addEventListener) {
                if(capture){
                    element.addEventListener(type, callback, true)
                }else{
                    element.addEventListener(type, callback, false)
                }
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, callback)
            } else {
                element['on' + type] = callback
            }
        },
        removeEvent: function (element, type, callback) {
            if (element.removeEventListener) {
                element.removeEventListener(type, callback, false)
            } else if (element.detachEvent) {
                element.detachEvent('on' + type, callback)
            } else {
                element['on' + type] = null
            }
        },
        isArray: function (obj) {
            return Object.prototype.toString.call(obj).toLowerCase() == '[object array]';
        },
        readXPath: function (element, type) {
            /**
             * xPath 获取
             * type 2 获取纯路径不带id class 名称
             */
            try {
                var sapModid = element.getAttribute("sap-modid");
                if (sapModid != undefined && type !== 2) {
                    return '@//*[@sap-modid=\"' + sapModid + '\"]';
                }
                if (element == document.body) {
                    return '/html/' + element.tagName.toLowerCase();
                }
                var ix = 1, // 在nodelist中的位置，且每次点击初始化
                    siblings = element.parentNode.childNodes; // 同级的子元素

                for (var i = 0, l = siblings.length; i < l; i++) {
                    var sibling = siblings[i];
                    // 如果这个元素是siblings数组中的元素，则执行递归操作
                    if (sibling == element) {
                        /*
                         * add by 88391756
                         * 对有class的元素使用class格式的Xpath
                         */
                        var Xpath = "";
                        if (element && element.id) {
                            Xpath = element.tagName.toLowerCase() + '[@id=\"' + element.id + '\"]';
                        } else {
                            Xpath = element.tagName.toLowerCase() + '[' + (ix) + ']';
                        }
                        return arguments.callee(element.parentNode, type) + '/' + Xpath;
                        // 如果不符合，判断是否是element元素，并且是否是相同元素，如果是相同的就开始累加
                    } else if (sibling.nodeType == 1 && sibling.tagName == element.tagName) {
                        ix++;
                    }
                }
            } catch (e) {}
        },
        readInfor: function (element) {
            /**
             * 节点信息获取
             */
            return {
                targeturl: element.getAttribute('href') || '',
                tpath: __ut._encode(__ut.readXPath(element))
            }
        },
        // 通用字段拼接  88388897   2018-01-19
        getCurrencyUrl: function (logType) {
            //log_type--(t)
            var log_type = "";
            if (logType != null && logType != undefined) {
                try {
                    log_type = logType;
                } catch (e) {}
            }
            //date_id--(id)
            var date_id = "";
            if (logType == 1) {
                date_id = this._createPageViewId();
            } else {
                date_id = this._getOnlyId();
            }
            //webID--(i)
            var webID = "";
            var siteid = document.getElementsByTagName("meta")["siteid"];
            if(siteid && siteid.getAttribute("content") != ""){
                webID = siteid.getAttribute("content");
            }
            //platform_type--(type)
            var platform_type = "web";
            var platformType = document.getElementById("resourceType");
            if (platformType != undefined && platformType != null) {
                try {
                    platform_type = platformType.value ? platformType.value : "web";
                } catch (e) {}
            }
            //内嵌H5页面，如果ua包含SNEBUY，则为inapp
            if(platform_type == "wap" && navigator.sakey){
                var ua = navigator.userAgent,
                    uaReg = /(SNEBUY)/i;
                if(uaReg.test(ua)){
                    platform_type = "inapp";
                }
            }
            //js_version--(v)
            var js_version = 'SA-2.0.0';
            //client_time--(ct)
            var client_time = new Date().getTime();
            //visitor_id--(vid)
            var visitor_id = "";
            var cookie_snma = this._getCookie("_snma");
            if (cookie_snma != undefined && cookie_snma != null && cookie_snma.indexOf("|") >= 0) {
                try {
                    visitor_id = cookie_snma.split("|")[1];
                } catch (e) {}
            }
            //session_id--(sid)
            var session_id = "";
            var cookie_snmb = this._getCookie("_snmb");
            if (cookie_snmb != undefined && cookie_snmb != null && cookie_snmb.indexOf("|") >= 0) {
                try {
                    session_id = cookie_snmb.split("|")[0];
                } catch (e) {}
            }
            //member_id--(uid)
            var member_id = "";
            var cookie_custno = this._getCookie("custno");
            if (cookie_custno != undefined && cookie_custno != null) {
                member_id = cookie_custno;
            }
            //e_member_id--(euid)
            var e_member_id = "";
            var cookie_idsEppLastLogin = this._getCookie("idsEppLastLogin");
            if (cookie_idsEppLastLogin != undefined && cookie_idsEppLastLogin != null) {
                e_member_id = cookie_idsEppLastLogin;
            }
            //loginUserName--(ln)
            var loginUserName = "";
            var cookie_idsLoginUserIdLastTime = __ut._getCookie("idsLoginUserIdLastTime");
            if (cookie_idsLoginUserIdLastTime != undefined && cookie_idsLoginUserIdLastTime != null) {
                loginUserName = cookie_idsLoginUserIdLastTime;
            } else {
                var login_UserName = document.getElementById("idsLoginUserIdLastTime");
                loginUserName = login_UserName ? login_UserName.value : "";
            }
            //login_type--(lt)
            var login_type = loginUserName ? "R" : "G";
            //login_status--(ls)
            var login_status = "";
            var cookie_logonStatus = this._getCookie("logonStatus");
            if (cookie_logonStatus != undefined && cookie_logonStatus != null) {
                login_status = cookie_logonStatus;
            }
            //curl--(curl)
            var curl = this._getToUrl();
            curl = this._encode(curl);
            //from_url--(furl)
            var from_url = this._getFromUrl();
            from_url = this._encode(from_url);
            //user_agent--(ua)
            var user_agent = navigator.userAgent ? this._encode(this._encode(navigator.userAgent)) : "";
            //pagename--(pn)
            var pagename = document.getElementById("pagename");
            pagename = pagename ? this._encode(pagename.value) : "";
            //utm--(utm)
            var utm = "";
            var cookie_snsr = this._getCookie("_snsr");
            if (cookie_snsr != undefined && cookie_snsr != null) {
                try {
                    utm = this._encode(cookie_snsr);
                } catch (e) {}
            }
            //ids
            var keyArr = ["vid", "sid", "uid", "euid", "ln", "lt", "ls"];
            var valueArr = [visitor_id, session_id, member_id, e_member_id, loginUserName, login_type, login_status];
            var ids = this.getConnect(keyArr, valueArr, {
                type: 2
            });
            ids = this._encode(ids);

            var currencyUrl = "t=" + log_type + "&id=" + date_id + "&i=" + webID + "&type=" + platform_type + "&v=" + js_version +
                "&ct=" + client_time + "&ids=" + ids + "&curl=" + curl + "&furl=" + from_url + "&ua=" + user_agent +
                "&pn=" + pagename + "&utm=" + utm;
            return currencyUrl;
        },
        _getOSAndTer: function () {
            var ua = navigator.userAgent,
                pf = navigator.platform,
                p = "push",
                m = "match",
                i = "indexOf",
                npo = "unknow but like Phone",
                npa = "unknow but like Tablet",
                n = "unknown",
                r;
            try {
                var os = []; // 操作系统，终端类型
                // 判断是否为移动设备，IOS，安卓手机 || 安卓平板，windows 平板，wp 手机
                if (/AppleWebKit.*Mobile/i.test(ua) || (/Android|SymbianOS|Windows Phone|Tablet PC|NOKIA|Nokia|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|SonyEricsson|SIE-|Amoi|ZTE/i.test(ua))) {
                    // 若是移动终端
                    // 若是iPhone OS
                    if (r = ua[m](/(iPhone|iPod touch|iPad).*(OS [\d_]+)/i)) { // IOS 终端
                        os[p](r[2]);
                        os[p](r[1]);
                    }
                    // 若是windows终端
                    else if (r = ua[m](/(Windows Phone( | OS )[\d\.]+).*; ([^;]+)\)$/i)) { // windows
                        // phone
                        os[p](r[1]);
                        os[p](r[3]);
                    } else if (r = ua[m](/(Windows NT [\d\.]+).*(Tablet PC [\d\.]+)/i)) { // Windows
                        // pad
                        os[p](r[1]);
                        os[p](r[2]);
                    } else if (ua[i]("Windows Phone") > -1) {
                        os[p]("Windows Phone");
                        os[p](npo);
                    } else if (ua[i]("Windows NT") > -1) {
                        os[p]("windows NT");
                        os[p](npa);
                    }
                    // 若是安卓终端
                    else if (r = ua[m](/(Android [\d\.]+);.*? ([^;]*?);? Build\//i)) { // Android
                        os[p](r[1]);
                        os[p](r[2]);
                    }
                    // 若是安卓终端
                    else if (r = ua[m](/(Android [\d\.]+);[^;]*; ([^\)]*?)\)/i)) { // Android
                        os[p](r[1]);
                        os[p](r[2]);
                    } else if (ua[i]("Android") > -1 && ua[i]("Mobile") > -1) {
                        os[p]("Android");
                        if (ua[i]("Xiaomi") > -1)
                            os[p]("Xiaomi");
                        else
                            os[p](npo);
                    } else if (ua[i]("Android") > -1) {
                        os[p]("Android");
                        os[p](npa);
                    } else { // 若是移动设备中未知终端和OS
                        os[p](n)[p](n);
                    }
                } else { // PC
                    var isWin = (pf == "Win32") || (pf == "Win64") || (pf == "Windows");
                    var isMac = (pf == "Mac68K") || (pf == "MacPPC") || (pf == "Macintosh") || (pf == "MacIntel");
                    if (isMac) os[p]("Mac");
                    var isUnix = (pf == "X11") && !isWin && !isMac;
                    if (isUnix) os[p]("Unix");
                    var isLinux = (pf[i]("Linux") > -1);
                    if (isLinux) os[p]("Linux");
                    if (isWin) { // windows 区分到具体的版本
                        var isWin2K = ua[i]("Windows NT 5.0") > -1 || ua[i]("Windows 2000") > -1;
                        if (isWin2K) os[p]("Win2000");
                        var isWinXP = ua[i]("Windows NT 5.1") > -1 || ua[i]("Windows XP") > -1;
                        if (isWinXP) os[p]("WinXP");
                        var isWin2003 = ua[i]("Windows NT 5.2") > -1 || ua[i]("Windows 2003") > -1;
                        if (isWin2003) os[p]("Win2003");
                        var isWinVista = ua[i]("Windows NT 6.0") > -1 || ua[i]("Windows Vista") > -1;
                        if (isWinVista) os[p]("WinVista");
                        var isWin7 = ua[i]("Windows NT 6.1") > -1 || ua[i]("Windows 7") > -1;
                        if (isWin7) os[p]("Win7");
                        var isWin8 = ua[i]("Windows NT 6.2") > -1;
                        if (isWin8) os[p]("Windows 8");
                        var isWin8_1 = ua[i]("Windows NT 6.3") > -1;
                        if (isWin8_1) os[p]("Windows 8.1");
                    }
                    if (os.length == 0) {
                        os[p](n);
                    }
                    os[p]("PC");
                }
                os.length > 2 ? os = os.slice(0, 2) : os.length == 1 ? os[p](n) : os.length == 0 ? os[p](n)[p](n) : os;
                return os;
            } catch (e) {}
            return ["unknown", "unknown"];
        },
        _getToUrl: function () {
            return document.location.href || "-";
        },
        _getFromUrl: function () {
            var fromUrl = document.referrer;
            var toUrl = document.location.href; // 不能使用全局变量，因为此处可能需要根据锚点的值获取来自页面
            var _protocol = location.protocol;
            var httpsUrl = this._getCookie("_snml");
            if ((_protocol == "https:" && fromUrl != "" && httpsUrl && httpsUrl.substring(0, 6) == "https:" && httpsUrl != fromUrl) || // https
                (_protocol == "http:" && fromUrl == "" && httpsUrl && httpsUrl.substring(0, 6) == "https:") ||
                (_protocol == "https:" && fromUrl == "" && httpsUrl && httpsUrl.substring(0, 6) == "https:") ||
                (fromUrl != "" && httpsUrl && httpsUrl != fromUrl) // 页面使用iframe
            ) {
                fromUrl = httpsUrl;
            }
            if (httpsUrl) {
                this._delCookie("_snml");
            }
            if (toUrl != "" && (toUrl.indexOf("sourceUrl4Sa") != -1)) {
                var sourceUrl4Sa = this.SaPick(toUrl, "sourceUrl4Sa", "&");
                fromUrl = decodeURIComponent(sourceUrl4Sa);
            } else if ((!fromUrl || fromUrl == null || fromUrl == "") && toUrl != "" && (toUrl.indexOf("returnUrl") != -1)) {
                var parms = toUrl.substring(toUrl.indexOf("?") + 1, toUrl.length);
                var parmsArr = parms.split("&");
                for (var i = 0; i < parmsArr.length; i++) {
                    var parmArr = parmsArr[i].split("=");
                    if (parmArr[0] == "returnUrl") {
                        fromUrl = parmArr[1];
                    }
                }
            }
            return fromUrl;
        },
        //生成页面访问唯一标识pvId
        _createPageViewId: function () {
            if (!sa.pvId) {
                sa.pvId = this._getOnlyId();
            }
            return sa.pvId;
        },
        _getOnlyId: function () {
            var now = new Date();
            var m = Math.round(100000 * Math.random());
            var onlyId = now.getTime().toString().concat(m);
            return onlyId;
        },
        // 获取cookie
        _getCookie: function (name) {
            try {
                var arrStr = document.cookie.split("; ");
                for (var i = 0; i < arrStr.length; i++) {
                    var temp = arrStr[i].split("=");
                    if (temp[0] == name) return decodeURIComponent(temp[1] ? temp[1] : "-");
                }
            } catch (e) {
                return '';
            }
        },
        // 删除cookie
        _delCookie: function (name) {
            this._addCookie(name, "", '/', -10000, "");
        },
        // 添加cookie，name=value，expire为过期毫秒数
        _addCookie: function (name, value, path, expires, domain) {
            var str = name + "=" + escape(value);
            if (expires != "") {
                var date = new Date();
                date.setTime(date.getTime() + expires);
                str += ";expires=" + date.toGMTString();
            }
            if (path != "") {
                str += ";path=" + path; // 指定可访问cookie的目录
            }
            var dm = this.getTopDomain();
            // 本地测试用，不要发到测试或线上
            dm = location.hostname;
            str += ";domain=" + dm;
            document.cookie = str;
        },
        //截取一级域名
        getTopDomain: function (webUrl) {
            var d = webUrl || location.hostname;
            var c = d.split('.');
            if (d.indexOf('localhost') > -1) {
                return 'localhost';
            }
            if (c instanceof Array) {
                var b = c.length,
                    num = 2, // 根域名
                    s = '',
                    e = c.splice(b - num, b); // 处理 三级四级域名
                if (d.indexOf('.com.cn') != -1) { // 处理 .com.cn的域名
                    e = d.split('.').splice(b - num - 1, b);
                }
                for (var i = 0; i < e.length; i++) {
                    s += '.' + e[i];
                }
                return s;
            }
        },
        _encode: function (s) {
            return null != s ? encodeURIComponent(s) : "";
        },
        SaPick: function (map, key, separator) {
            var result = "-",
                idx;
            if (!this.IsEmpty(map) && !this.IsEmpty(key) && !this.IsEmpty(separator)) {
                idx = map.indexOf(key);
                if (idx > -1) {
                    var endIdx = map.indexOf(separator, idx);
                    if (endIdx < 0) {
                        endIdx = map.length;
                    }
                    result = map.substring(idx + key.length + 1, endIdx);
                }
            }
            return result;
        },
        IsEmpty: function (o) {
            return (undefined == o || '' == o || '-' == o);
        },
        getConnect: function (a, b, obj) {
            /**
             * a为key的数组，b为value的数组，obj为拼接方式的对象
             * {tag:"*",type:2,ext:{key1:value1,key2:value2}}，tag如果不传，默认为"&"，
             * type如果不传或者传2以外的其他值，则默认拼接（&拼接）
             * 如果传2，则拼接为对象 {key1:value1}
             * ext为扩展参数对象
             * 注意：传入的两个数组长度要相等，如没有值，传 "" ;
             **/
            if (a.length != b.length) {
                return
            }
            var c, text = "",
                obj1 = {},
                extObj = {},
                flag = true;
            if (obj) {
                c = obj.tag || "&";
                extObj = obj.ext ? obj.ext : {};
                if (obj.type == 2) {
                    flag = false;
                }
            } else {
                c = "&";
            }
            if (this.stringify(extObj) != "{}") {
                for (var i in extObj) {
                    a.push(i);
                    b.push(extObj[i]);
                }
            }
            if (flag) {
                for (var i = 0; i < a.length; i++) {
                    if (typeof b[i] == 'object') {
                        b[i] = this._encode(this.stringify(b[i]));
                    }
                    if (i == 0) {
                        text += a[i] + "=" + b[i];
                    } else {
                        text += c + a[i] + "=" + b[i];
                    }
                }
                return text;
            } else {
                for (var i = 0; i < a.length; i++) {
                    if (typeof b[i] == 'object') {
                        b[i] = this._encode(this.stringify(b[i]));
                    }
                    obj1[a[i]] = b[i];
                }
                return this.stringify(obj1);
            }
        },
        // JSON.stringify() 兼容ie7
        stringify: function (jsonObj) {
            if (window.JSON) {
                return JSON.stringify(jsonObj);
            }
            var result = '',
                curVal;
            if (jsonObj === null) {
                return String(jsonObj);
            }
            switch (typeof jsonObj) {
                case 'number':
                case 'boolean':
                    return String(jsonObj);
                case 'string':
                    return '"' + jsonObj + '"';
                case 'undefined':
                case 'function':
                    return undefined;
            }
            switch (Object.prototype.toString.call(jsonObj)) {
                case '[object Array]':
                    result += '[';
                    for (var i = 0, len = jsonObj.length; i < len; i++) {
                        curVal = this.stringify(jsonObj[i]);
                        result += (curVal === undefined ? null : curVal) + ",";
                    }
                    if (result !== '[') {
                        result = result.slice(0, -1);
                    }
                    result += ']';
                    return result;
                case '[object Date]':
                    return '"' + (jsonObj.toJSON ? jsonObj.toJSON() : jsonObj.toString()) + '"';
                case '[object RegExp]':
                    return "{}";
                case '[object Object]':
                    result += '{';
                    for (i in jsonObj) {
                        if (jsonObj.hasOwnProperty(i)) {
                            curVal = this.stringify(jsonObj[i]);
                            if (curVal !== undefined) {
                                result += '"' + i + '":' + curVal + ',';
                            }
                        }
                    }
                    if (result !== '{') {
                        result = result.slice(0, -1);
                    }
                    result += '}';
                    return result;
                case '[object String]':
                    return '"' + jsonObj.toString() + '"';
                case '[object Number]':
                case '[object Boolean]':
                    return jsonObj.toString();
            }
        },
        jsonParse: function (jsonStr) {
            if (!window.JSON) {
                return eval('(' + jsonStr + ')');
            }
            return JSON.parse(jsonStr)
        },
        /**
         * 从传入的url中获取指定参数的值
         */
        getUrlParam: function (url, param) {
            var par = "",
                paramsArr = [];
            if (!this.IsEmpty(url) && !this.IsEmpty(param)) {
                if (url.indexOf("?") > -1) {
                    if (url.indexOf("#") > -1) {
                        paramsArr = url.split("?")[1].split("#")[0].split("&");
                    } else {
                        paramsArr = url.split("?")[1].split("&");
                    }
                    for (var i = 0; i < paramsArr.length; i++) {
                        var key = paramsArr[i].split("=")[0];
                        if (key == param) {
                            par = paramsArr[i].split("=")[1];
                            break;
                        }
                    }
                }
            }
            return par;
        },
        //日志上报
        _httpGifSend: function (strURL) {
            var n = "log_" + (new Date()).getTime();
            var i = window[n] = new Image(); // 把new Image()赋给一个全局变量长期持有
            i.onload = (i.onerror = function () {
                window[n] = null;
            }); // 清除全局引用
            //全产业App与H5用户行为打通需求  88388897  2018-01-26
            var _url = strURL + "&_snvd=" + __ut._encode(sa.snvd ? sa.snvd : "") + "&iId=" + n;
            var logType = this.getUrlParam(_url, "t");
            var _params = _url.split("?")[1];
            i.src = _url;
            try {
                if (logType == "2" || logType == "11") {
                    if (navigator.sakey == 1 || navigator.sakey == 1001) { // ios
                        sareport(_params, logType);
                    } else if (navigator.sakey == 3 || navigator.sakey == 3001) { // ios
                        window.webkit.messageHandlers.sareport.postMessage({
                            "params": _params,
                            "logType": logType
                        });
                    } else if (navigator.sakey == 2 || navigator.sakey == 2001) { // android
                        window.prompt(_params, logType);
                    }
                } else {
                    if (navigator.sakey) {
                        if (navigator.sakey == 1001) { // ios
                            sareport(_params, logType);
                        } else if (navigator.sakey == 3001) { // ios
                            window.webkit.messageHandlers.sareport.postMessage({
                                "params": _params,
                                "logType": logType
                            });
                        } else if (navigator.sakey == 2001) { // android
                            window.prompt(_params, logType);
                        }
                    } else {
                        setTimeout(function () {
                            if (navigator.sakey == 1001) { // ios
                                sareport(_params, logType);
                            }
                        }, 300);
                    }
                }
            } catch (e) {}
            try {
                if (window.__wxjs_environment) {
                    wx.miniProgram.postMessage({
                        data: {
                            _type: "sa",
                            logType: logType,
                            url: _url
                        }
                    })
                }
            } catch (e) {}
            i = null; // 释放局部变量c
        },
        _httpGifSendPassH5: function (strURL) {
            var n = "log_" + (new Date()).getTime();
            var i = window[n] = new Image(); // 把new Image()赋给一个全局变量长期持有
            i.onload = (i.onerror = function () {
                window[n] = null;
            }); // 清除全局引用
            i.src = strURL + "&_snvd=" + __ut._encode(sa.snvd ? sa.snvd : "") + "&iId=" + n;
            i = null; // 释放局部变量c
        },
        _getString: function (n, a) {
            try {
                if (n.nodeType == 3) {
                    a.push(n.nodeValue)
                } else if (n.nodeType == 1) {
                    for (var m = n.firstChild; m != null; m = m.nextSibling) {
                        this._getString(m, a)
                    }
                }
            } catch (e) {}
        },
        getClickDetailUrl: function (a, _params) {
            var clickDetailUrl = "";
            try {
                //id--(tid)
                var id = a.id ? this._encode(a.id) : "id undefined";
                //_text--(text)
                var _strings = new Array();
                var _text = (this._getString(a, _strings), _strings) ? this._encode(_strings.join("").replace(/\s|\|/ig, "")) : "text undefined";
                //_errorCode--(err)
                var _errorCode = (_errorCode = document.getElementById("errorCode")) ? _errorCode.value : "";
                //_cityId--(cityId)
                var _cityId = typeof sn == "object" ? (sn.cityId ? sn.cityId : "can not get cityId") : "can not get cityId";
                //urlPattern
                var urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern");
                urlPattern = urlPattern ? urlPattern.value : "";
                //abtest
                var abtest = document.getElementById("ssa-abtest");
                abtest = abtest ? abtest.value : "";
                //ad_id
                var aHref = a.href ? a.href : "";
                var ad_id = this.SaPick(aHref, 'tid', "&");
                //sa_data
                var sa_data = a.getAttribute("sa-data");
                sa_data = sa_data ? __ut._encode(sa_data.replace(/'/g, '"')) : __ut._encode("{}");
                //pvid
                var pvId = this._createPageViewId();

                var keyArr = ["pvid", "err", "cityId", "tid", "text", "ab_test", "urlPattern", "ad_id", "sa_data"];
                var valueArr = [pvId, _errorCode, _cityId, id, _text, abtest, urlPattern, ad_id, sa_data];
                clickDetailUrl = this.getConnect(keyArr, valueArr, {
                    type: 2,
                    ext: _params
                });
            } catch (e) {}
            return clickDetailUrl;
        },
        checkIn: function (arr, obj) {
            // arr 数值 节点列表，obj 节点名称
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        },
        getTrg: function (e) {
            // 获取点击目标元素
            var targ
            var e = e || window.event || event // firefox没有window.event对象
            var obj = e.srcElement ? e.srcElement : e.target
            targ = obj
            if (targ.nodeType == 3) {
                // Safari bug
                targ = targ.parentNode
            };
            return targ
        },
        //无埋点需要采集的标签类型
        tags: ['a', 'button', 'input', 'area'], // 需采集的标签
        tagsHasName: ['div', 'li', 'span'],//需采集的标签(必须有name属性)
        //获取标签是否符合无埋点采集所支持的标签类型
        checkTags: function(tagsArr, tag){
            if(__ut.checkIn(tagsArr, tag.tagName ? tag.tagName.toLocaleLowerCase() : "")){
                return true;
            }
        },
        //获取标签是否有href属性
        checkHref: function(tag){
            if(tag.getAttribute('href') != null){
                return true;
            }
        },
        //获取标签是否符合无埋点采集所支持的必须包含name属性的标签类型
        checkTagsHasName: function(tagsArr, tag){
            if(__ut.checkIn(tagsArr, tag.tagName ? tag.tagName.toLocaleLowerCase() : "") && tag.getAttribute('name') != null){
                return true;
            }
        },
        //获取标签是否符合无埋点所支持的采集标签类型和属性
        checkLabel: function(tag){
            if(__ut.checkTags(__ut.tags,tag) || __ut.checkHref(tag) || __ut.checkTagsHasName(__ut.tagsHasName,tag)){
                return true;
            }
        },
        //如果href中存在#，将参数拼在#之前
        checkHrefHash: function(href, param){
            var newHref = "",
                i = href.indexOf("#")
                tmp=href.substring(0, i),
                estr=href.substring(i, href.length);
                newHref += tmp + param + estr;
            return newHref;
        },
        saSet: function () {
            this.isNullAdded = false;
            var map = {};
            this.contains = function (key) {

                if (key === null)
                    return this.isNullAdded;
                else if (key === undefined)
                    return false;
                else
                    return map[key] ? true : false;
            };

            //  adds the element to the set
            this.add = function (val) {

                if (val === null)
                    this.isNullAdded = true;
                else if (val !== undefined)
                    map[val] = true;
                return this;
            };

            //  adds all the elements of the array to the set
            this.addAll = function (val) {

                if (val !== null && val !== undefined && val instanceof Array) {
                    for (var idx = 0; idx < val.length; idx++) {
                        this.add(val[idx]);
                    }
                }
                return this;
            };

            //  removes the specified element from the set
            this.remove = function (val) {
                if (val === null)
                    this.isNullAdded = false;
                else if (val !== undefined)
                    delete map[val];
                return this;
            };

            //  removes all the element in the array from the set
            this.removeAll = function (val) {

                if (val !== null && val !== undefined && val instanceof Array) {
                    for (var idx = 0; idx < val.length; idx++) {
                        this.remove(val[idx]);
                    }
                }
                return this;
            };

            //  empties the set of all values
            this.clear = function () {

                this.isNullAdded = false;
                map = {};
                return this;
            };

            //  returns the number of elements in the set
            this.size = function () {

                return this.list().length;
            };

            //  returns true if the set is empty, false otherwise
            this.isEmpty = function () {

                return this.list().length > 0 ? false : true;
            };

            //  returns the elements of the set as a list
            this.list = function () {
                var arr = [];

                if (this.isNullAdded)
                    arr.push(null);

                for (o in map) {
                    // protect from inherited properties such as
                    //  Object.prototype.test = 'inherited property';
                    if (map.hasOwnProperty(o))
                        arr.push(o);
                }
                return arr;
            };
        },
        saHashMap: function () {
            this.keys = new Array();
            this.data = new Object();
            this.put = function (key, value) {
                if (this.data[key] == null) {
                    this.keys.push(key);
                }
                this.data[key] = value;
            };
            this.get = function (key) {
                return this.data[key];
            };
            /** 删除 **/
            this.remove = function (key) {
                if (this.get(key) != null) {
                    delete this.data[key];
                }
            };
        },
        selectorModid: function (attribute, value) {
            var all = document.getElementsByTagName('*'),
                mod = [];
            for (var i = 0; i < all.length; i++) {
                if (all[i].getAttribute(attribute) == value) {
                    mod.push(all[i]);
                }
            }
            return mod;
        }
    };
    // 校验_snvd
    var cookie_snvd = __ut._getCookie("_snvd");
    if (cookie_snvd && cookie_snvd.length > 24) {
        __ut._delCookie("_snvd");
        if (window.localStorage) {
            localStorage.removeItem("_snvd");
        }
    }
    if (window.localStorage) {
        var storage_snvd = localStorage.getItem("_snvd");
        if (storage_snvd && storage_snvd.length > 24) {
            localStorage.removeItem("_snvd");
            __ut._delCookie("_snvd");
        }
    }
    //全产业访客唯一标识别赋值
    window._sa_utils.getSnvd();
    // sa业务处理层与sa数据处理层之间的异步容器
    var _samap = window._samap || new __ut.saHashMap();
    var __extMap = window.__extMap || new __ut.saHashMap(); // 存储每种日志透传的扩展字段
    /**
     * 全局暴露方法
     * isArray 见1496 _saSet 见1502
     */

    window.isArray = __ut.isArray;
    window._saSet = __ut.saSet;



    /**
     * 开始
     * 采集js上报方法整合逻辑
     * @param logType 日志类型
     * @param params 日志主体内容
     */
    SAUP.sendLogData = function (logType, params) {

        if (logType === 'store' && params === undefined) {
            params = {}
        }
        if (!logType || !params) {
            return;
        }

        switch (logType) {
            case "click": //点击
                sa.click.sendDatasIndex(params);
                break;
            case "store": //库存
                _dapush(params);
                break;
            case "siteExpos": // 站内曝光
                break;
            case "recExpos": //推荐曝光
                _analyseExpoTags(params); // {tag,prefix} 参数
                break;
            case "order": // 订单 {orderId,orderInfo}
                _sendOrderInfo(params);
                break;
            case "custom": // 自定义日志
                if(typeof params !== "object") return;
                saCustomDataUtil.sendData(params)
                break;
            case "search":
                _searchInner(params); //2.0 搜索日志入场改成k-v形式，// 对应k名称：totalRows, searchKeyWord, kuozhanKeyWord, searchCategory, searchType
                break;
            default:
                break;
        }
    };
    /**
     * 结束
     * 采集js上报方法整合逻辑
     */
    /**
     * 开始
     * 访问日志，搜索日志...原da_opt.js
     */
    (function () {
        /**
         * 新增Js逻辑全部放在闭包内
         */
        (function (window) {

            var document = window.document;
            /**
             * 获取当前的js文件的url路径
             * @param jsName
             * @returns {string}
             */
            var curJsUrl = __ut.getJsUrl(__ut.getJsResName);
            var ready = (function () {
                var readyList = [],
                    readyFired = false,
                    readyEventHandlersInstalled = false;

                function ready() {
                    if (!readyFired) {
                        // this must be set to true before we start calling callbacks
                        readyFired = true;
                        for (var i = 0; i < readyList.length; i++) {
                            // processing the function list
                            readyList[i].fn.call(window, readyList[i].ctx);
                        }
                        // release function list
                        readyList = [];
                    }
                }

                function readyStateChange() {
                    if (document.readyState === "complete") {
                        ready();
                    }
                }

                // public function (like Jquery's document ready function)
                function docReady(callback, context) {
                    if (typeof callback !== "function") {
                        throw new TypeError("callback for sa.ready(fn) must be a function");
                    }
                    // if ready has already fired, then just schedule the callback
                    if (readyFired) {
                        setTimeout(function () {
                            callback(context);
                        }, 1);
                        return;
                    } else {
                        // add the function and context to the list
                        readyList.push({
                            fn: callback,
                            ctx: context
                        });
                    }
                    // if document already ready to go, schedule the ready function to run
                    if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
                        // IE only safe when readyState is "complete", others safe when readyState is "interactive"
                        setTimeout(ready, 1);
                    } else if (!readyEventHandlersInstalled) {
                        if (document.addEventListener) {
                            document.addEventListener("DOMContentLoaded", ready, false);
                            window.addEventListener("load", ready, false);
                        } else {
                            document.attachEvent("onreadystatechange", readyStateChange);
                            window.attachEvent("onload", ready);
                        }
                        readyEventHandlersInstalled = true;
                    }
                }
                return docReady;
            })();

            sa.curJsUrl = curJsUrl;
            sa.ready = ready;
        })(window);

        var _hostName = document.location.hostname; //当前页面域名
        var _thisUrl = document.location.href; //当前页面的url
        var _base64 = new __ut.saBase64();
        /**
         * 获取页面hidden标签提供的一些变量
         * 备注：登录注册系统提供的均为wcsa_开头的变量
         */
        var sa_userId = document.getElementById("wcsa_userId") || document.getElementById("userId"),
            sa_userId = sa_userId ? sa_userId.value : "", // 注册用户标识，发送注册日志页面需要此变量
            sa_userType = document.getElementById("wcsa_userType") || document.getElementById("userType"),
            sa_userType = sa_userType ? sa_userType.value : "", // userType，部分页面会在页面提供此变量
            sa_orderId = document.getElementById("orderId") || document.getElementById("wcsa_orderId"),
            sa_orderId = sa_orderId ? sa_orderId.value : "", // orderId，在发送订单数据页面需要此变量
            sa_isNew = document.getElementById("gaga"),
            sa_isNew = sa_isNew ? sa_isNew.value : "", // 判断页面是否为快速注册
            sa_quickRegister = document.getElementById("gagaId"),
            sa_quickRegister = sa_quickRegister ? document.getElementById("gagaId").value : "", // 获取用户注册帐号，此种情况只会存在于使用了快速注册的页面
            sa_resourceType = document.getElementById("resourceType"),
            _resourceType = sa_resourceType ? sa_resourceType.value : "web",
            sa_errorCode = document.getElementById("errorCode"),
            _saErrorCode = sa_errorCode ? sa_errorCode.value : "",
            urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern"),
            urlPattern = urlPattern ? urlPattern.value : "",
            sa_orderInfo = document.getElementById("orderInfo"),
            sa_orderInfo = sa_orderInfo ? sa_orderInfo.value : "";


        /**
         2016/04/11日发布需求，以下域名及其测试域名去掉GA的采集脚本的引入和cookieMapping的处理
         cart.suning.com
         shopping.suning.com
         reg.suning.com
         passport.suning.com
         member.suning.com
         my.suning.com
         favorite.suning.com
         review.suning.com
         vip.suning.com
         assess.suning.com
         payment.suning.com
         mpay.suning.com
         wpay.suning.com
         stpay.suning.com
         **/
        var __ssaIsGaPage = true;
        if (_hostName.indexOf("cart.suning.com") != -1 ||
            _hostName.indexOf("shopping.suning.com") != -1 ||
            _hostName.indexOf("reg.suning.com") != -1 ||
            _hostName.indexOf("passport.suning.com") != -1 ||
            _hostName.indexOf("member.suning.com") != -1 ||
            _hostName.indexOf("my.suning.com") != -1 ||
            _hostName.indexOf("favorite.suning.com") != -1 ||
            _hostName.indexOf("review.suning.com") != -1 ||
            _hostName.indexOf("vip.suning.com") != -1 ||
            _hostName.indexOf("assss.suning.com") != -1 ||
            _hostName.indexOf("payment.suning.com") != -1 ||
            _hostName.indexOf("wpay.suning.com") != -1 ||
            _hostName.indexOf("stpay.suning.com") != -1 ||
            _hostName.indexOf("cartsit.cnsuning.com") != -1 ||
            _hostName.indexOf("shoppingsit.cnsuning.com") != -1 ||
            _hostName.indexOf("regsit.cnsuning.com") != -1 ||
            _hostName.indexOf("passportsit.cnsuning.com") != -1 ||
            _hostName.indexOf("membersit.cnsuning.com") != -1 ||
            _hostName.indexOf("mysit.cnsuning.com") != -1 ||
            _hostName.indexOf("favoritesit.cnsuning.com") != -1 ||
            _hostName.indexOf("reviewsit.cnsuning.com") != -1 ||
            _hostName.indexOf("vipsit.cnsuning.com") != -1 ||
            _hostName.indexOf("asssssit.cnsuning.com") != -1 ||
            _hostName.indexOf("paymentsit.cnsuning.com") != -1 ||
            _hostName.indexOf("wpaysit.cnsuning.com") != -1 ||
            _hostName.indexOf("stpaysit.cnsuning.com") != -1 ||
            _hostName.indexOf("cartpre.cnsuning.com") != -1 ||
            _hostName.indexOf("shoppingpre.cnsuning.com") != -1 ||
            _hostName.indexOf("regpre.cnsuning.com") != -1 ||
            _hostName.indexOf("passportpre.cnsuning.com") != -1 ||
            _hostName.indexOf("memberpre.cnsuning.com") != -1 ||
            _hostName.indexOf("mypre.cnsuning.com") != -1 ||
            _hostName.indexOf("favoritepre.cnsuning.com") != -1 ||
            _hostName.indexOf("reviewpre.cnsuning.com") != -1 ||
            _hostName.indexOf("vippre.cnsuning.com") != -1 ||
            _hostName.indexOf("asssspre.cnsuning.com") != -1 ||
            _hostName.indexOf("paymentpre.cnsuning.com") != -1 ||
            _hostName.indexOf("wpaypre.cnsuning.com") != -1 ||
            _hostName.indexOf("stpaypre.cnsuning.com") != -1 ||
            _hostName.indexOf("order.suning.com") != -1 ||
            _hostName.indexOf("orderpre.cnsuning.com") != -1 ||
            _hostName.indexOf("ordersit.cnsuning.com") != -1) {
            __ssaIsGaPage = false;
        }
        var _dasaMap = _dasaMap || new __ut.saHashMap();
        var _dagaMap = _dagaMap || new __ut.saHashMap();
        /**
         * 功能：ga和sa电器四级页面库存数据采集
         * 调用：电器四级页面异步调用此方法
         */
        _dapush = function (e) {
            // 库存日志透传字段
            if (e) {
                __extMap.put("storeExtData", e)
            }
            _dasaMap.put("_sapush", "");
            _dagaMap.put("_gapush", "");
        }

        /**
         * 功能：ga和sa图书四级页面库存数据采集
         * 调用：图书四级页面异步调用此方法
         */
        _dapushbook = function () {
            _dasaMap.put("_sapushbook", "");
            _dagaMap.put("_gapushbook", "");
        }

        /**
         * 监听_dasaMap中的异步信息，收到信息后发送相关数据
         */
        _saAsynLoad();
        /**
         * 1、sa初始化数据发送（每个页面）
         */

        var _initData = [];
        _samap.put("_saPvDatas", _initData);

        /**
         *  2、订单数据发送页面
         *  2.1、 购物车2页面
         *  2.2、 购物车2.5页面
         *  2.3、 收银台页面
         *　2.4、 wap站点购物车2页面
         *  2.5、 wap站点购物车2.5页面
         *  2.6、 web支付成功页面
         *  2.7、 wap支付成功页面
         *  2.8、 wap货到付款支付成功
         */
        var fUrl = document.referrer;
        if (_thisUrl.indexOf("/SNCart2ManageCmd?") != -1 ||
            _thisUrl.indexOf("/SNPayBeforeComfirmView?") != -1 ||
            _thisUrl.indexOf("/payGateWay/show.htm?") != -1 ||
            _thisUrl.indexOf("/payment.suning.com/epps-ppps") != -1 ||
            _thisUrl.indexOf("/payment.suning.com/epps-pppm") != -1 ||
            _thisUrl.indexOf("/payment.suning.com/epps-ppms") != -1 ||
            _thisUrl.indexOf("/paytestpre.suning.com/epps-ppps") != -1 ||
            _thisUrl.indexOf("/paytestpre.suning.com/epps-pppm") != -1 ||
            _thisUrl.indexOf("/paytestpre.suning.com/epps-ppms") != -1 ||
            _thisUrl.indexOf("/paymentsit.cnsuning.com/epps-ppps") != -1 ||
            _thisUrl.indexOf("/paymentsit.cnsuning.com/epps-pppm") != -1 ||
            _thisUrl.indexOf("/paymentsit.cnsuning.com/epps-ppms") != -1 ||
            _thisUrl.indexOf("/cart2/private/cart2Show.do") != -1 ||
            _thisUrl.indexOf("/cart2/private/cartSplitOrdersView.do") != -1 ||
            _thisUrl.indexOf("/SNOrderPaySuccessView") != -1 ||
            _thisUrl.indexOf("/SNMWPaySubmitView") != -1 ||
            _thisUrl.indexOf("/cartFourOrdersView") != -1 ||
            _thisUrl.indexOf("/project/cart/cart2") != -1 ||
            _thisUrl.indexOf("/project/cart/cartSplitOrders") != -1 ||
            _thisUrl.indexOf("/project/cart/cartFourOrdersView") != -1 ||
            _thisUrl.indexOf("/project/cart/weixinPaySuccess") != -1 ||
            _thisUrl.indexOf("//wpay.suning.com/epps-pwg/showDefault.htm") != -1 ||
            _thisUrl.indexOf("//wpaypre.cnsuning.com/epps-pwg/showDefault.htm") != -1 ||
            _thisUrl.indexOf("//wpaysit.cnsuning.com/epps-pwg/showDefault.htm") != -1) {
            var data1 = sa_orderId;
            var data2 = sa_isNew ? sa_isNew : ""; // 购物车2页面可能成为快速注册到达页面，所以需要判断是否需要发送注册日志
            var orderDatas = [data1];
            _samap.put("_saOrderDatas", orderDatas);
            if (data2.indexOf("true") != -1) { // 如果用户经过的是由购物车1通过快速注册到达购物车2页面，那么在购物车2页面也要采集注册注册信息
                var data3 = sa_quickRegister;
                var registerDatas = [data3];
                _samap.put("_saRegisterDatas", registerDatas);
            }
            /**
             * 3、sa注册数据发送（注册成功页）
             *    (/SNUserRegisterComfirmView) ：邮箱注册成功页
             *    (/SNMobileRegisterConfirmView) ：手机注册成功页
             *    (/SNMWUserRegisterSuccessView)：wap端注册成功页面
             */
        } else if (_thisUrl.indexOf("/SNUserRegisterComfirmView") != -1 ||
            _thisUrl.indexOf("/SNMobileRegisterConfirmView") != -1 ||
            _thisUrl.indexOf("/SNMWUserRegisterSuccessView") != -1 ||
            _thisUrl.indexOf("/reg.suning.com/b2cregsucc") != -1 ||
            _thisUrl.indexOf("/reg.suning.com/compregsucc") != -1 ||
            _thisUrl.indexOf("/reg.suning.com/b2bcardregsucc") != -1 ||
            _thisUrl.indexOf("/reg.suning.com/wap/succjump") != -1 ||
            _thisUrl.indexOf("/wap/register/getRegisterSuccess") != -1 ||
            _thisUrl.indexOf("/regpre.cnsuning.com/b2cregsucc") != -1 ||
            _thisUrl.indexOf("/regpre.cnsuning.com/compregsucc") != -1 ||
            _thisUrl.indexOf("/regpre.cnsuning.com/b2bcardregsucc") != -1 ||
            _thisUrl.indexOf("/regpre.cnsuning.com/wap/succjump") != -1) {
            var data1 = sa_userId; // 新注册的用户唯一标识
            var registerDatas = [data1];
            _samap.put("_saRegisterDatas", registerDatas);
        }

        /**
         * 功能：电器四级页面库存数据准备和发送
         * 调用：电器四级页面异步调用此方法
         */
        function _sapush() {
            var productIdForStore;
            try {
                var hidGA_itemDataBean_itemID = document.getElementById('ga_itemDataBean_itemID');
                if (hidGA_itemDataBean_itemID) {
                    productIdForStore = hidGA_itemDataBean_itemID.value;
                }
                /*var cityid = sn.cityId;                     // 城市id （原页面js中已有全局变量）
                var productStatus = snga.productStatus ? snga.productStatus : "";
                var productShipOffset = "";
                if (productStatus.indexOf("1") != -1) {        // 1-N日到货
                    productShipOffset = snga.shipOffset;
                } else if (productStatus.indexOf("2") != -1) { // 无货
                    productShipOffset = "-1";
                } else if (productStatus.indexOf("3") != -1 || productStatus.indexOf("-99") != -1) { // 暂不销售
                    productShipOffset = "-2";
                } else {                                      // 其他情况
                    productShipOffset = "-99";
                }*/

                var cityid = '';
                var hidCityIdObj = document.getElementById('mdmCityId');
                if (hidCityIdObj) {
                    cityid = hidCityIdObj.value;
                }
                var shipOffset = '';
                var hidShipOffsetObj = document.getElementById('shipOffset');
                if (hidShipOffsetObj) {
                    shipOffset = hidShipOffsetObj.value;
                }
                var storageData = [productIdForStore, cityid, shipOffset];
                _samap.put("_saStorageDatas", storageData);
            } catch (error) {}
        }

        /**
         * 功能：图书四级页面库存数据准备和发送
         * 调用：图书四级页面异步调用此方法
         */
        function _sapushbook() {
            var productIdForStore;
            try {
                var hidGA_itemDataBean_itemID = document.getElementById('ga_itemDataBean_itemID');
                if (hidGA_itemDataBean_itemID) {
                    productIdForStore = hidGA_itemDataBean_itemID.value;
                }
                var cityid = '';
                var hidCityIdObj = document.getElementById('mdmCityId');
                if (hidCityIdObj) {
                    cityid = hidCityIdObj.value;
                }
                var shipOffset = '';
                var hidShipOffsetObj = document.getElementById('shipOffset');
                if (hidShipOffsetObj) {
                    shipOffset = hidShipOffsetObj.value;
                }
                var storageData = [productIdForStore, cityid, shipOffset];
                _samap.put("_saStorageDatas", storageData);
            } catch (error) {}
        }

        /**
         * 功能：搜索数据准备和发送
         * 调用：1、图书搜索在da_sa.jsp文件中图书搜索数据采集模块同步调用该方法
         *       2、电器搜索在搜索结果页面异步调用此方法
         *  	 3、搜索无结果页在页面底部同步调用此方法
         * 注：此方法放在搜索结果页和搜索导航二三级结果页的jsp文件中
         */
        function _searchPush(totalRows) {
            var thisUrl = document.location.href;
            var str = thisUrl.substring(thisUrl.indexOf("?") + 1, thisUrl.length);
            var parmsArr = str.split("&");
            var map = new __ut.saHashMap();
            for (var ii = 0; ii < parmsArr.length; ii++) {
                var parmArr = parmsArr[ii].split("=");
                for (var i = 0; i < parmArr.length; i++) {
                    map.put(parmArr[i], parmArr[++i]);
                }
            }
            var searchKeywords = map.get("searchKeywords");
            var data1 = (!searchKeywords || searchKeywords == null || searchKeywords == "undefined") ? "" : searchKeywords;
            var data2 = totalRows;
            var data3 = "0";
            var groupName = map.get("groupName");
            var data4 = (!groupName || groupName == null || groupName == "undefined") ? "" : groupName;
            var groupNameValue = map.get("groupNameValue");
            var data5 = (!groupNameValue || groupNameValue == null || groupNameValue == "undefined") ? "" : groupNameValue;
            var catalogId = map.get("catalogId");
            var data6 = (!catalogId || catalogId == null || catalogId == "undefined") ? "" : catalogId;
            var searchData = [data1, data2, data3, data4, data5, data6];
            _samap.put("_saSearchDatas", searchData);
        }

        /**
         * 功能：监听_dasaMap中的异步信息，并进行后续处理
         *
         * _dasaMap ：sa集成层与sa业务处理层之间的异步容器
         */
        function _saAsynLoad() {
            _dasaMap.put = function (key, value) {
                if (_dasaMap.data[key] == null) {
                    _dasaMap.keys.push(key);
                }
                _dasaMap.data[key] = value;
                _saAsynCheck();
            };
            _saAsynCheck();
        }

        function _saAsynCheck() {
            if (_dasaMap.get("_sapush") != null) {
                _sapush();
                _dasaMap.remove("_sapush");
            }
            if (_dasaMap.get("_sapushbook") != null) {
                _sapushbook();
                _dasaMap.remove("_sapushbook");
            }
            if (_dasaMap.get("_searchPush") != null) {
                _searchPush(_dasaMap.get("_searchPush"));
                _dasaMap.remove("_searchPush");
            }
        }

        //####################################################################################


        //####################################################################################
        //【sa.js文件】
        //2015.05.19 SA bug修正，追加新定义的页面级访问变量
        //页面的pvId
        var _saPageViewId = __ut._createPageViewId();
        //该变量用来避免同一页面PV重复采集的问题
        _initSaPvHasSendFlg();

        //保存当前页面的点击坐标
        sa.hotClickObj = {
            count: 0, //统计点击次数，每5次清次0
            pointSet: "" //保存每次点击的坐标
        };

        /**
         * 保存2年 常量“1”、访问者唯一标识、第一次访问时间、上次访问时间、本次访问时间、历史访问次数、历史会话次数 注：_snma相对‘去向页面’的
         */
        var _snma = "_snma";
        var _snmaKeysArr = ["constant", "visitorid", "firstViewTime", "lastViewTime", "thisViewTime", "totalPvs", "totalVisits"];

        /**
         * 生命周期：会话 值域：会话唯一标识、进入时间、离开时间、访问页面数
         * 1.进入时间：记录的是当前页面的进入时间，在发送完当前页面的pv数据之后立刻更新，此时间作为当前页面的进入时间。
         * 2.离开时间：离开时间记录的是上个页面的离开时间，在发送当前页面的PV信息的时候更新，默认规则是当前页面的进入时间即等于上个页面的离开时间。
         * 注意：当前页面的PV中传给后台页面进入时间和离开时间均是指上个页面的进入时间和离开时间。
         */
        var _snmb = "_snmb";
        var _snmbKeysArr = ["visitid", "inTime", "outTime", "views"];

        /**
         * 保存30分钟 常量"1" 注：_snmc是用来将超过30分钟无任何操作的会话的_snmb删除，此cookie不向后台传
         */
        var _snmc = "_snmc";

        /**
         * 浏览器关闭清除 发送数据唯一标识(访问数据唯一标识) 注：临时存放_snmz中的发送数据唯一标识，给订制js取，此cookie不向后台传。
         */
        var _snmp = "_snmp";

        /**
         * 浏览器关闭清除 来源、媒介、内容、活动、主题 注：为某次活动订制的js，统计此次活动各个广告带来的效益
         */
        var _snsr = "_snsr";
        var _snsrKeysArr = ["source", "medium", "content", "campaign", "theme"];


        /**
         * 活动各个广告带来的投放点
         */
        var ad_sp;


        /**
         * 向后台传送数据后删除 发送数据唯一标识(pvid)、点击坐标集合(clickDots) 注：_snmz相对‘来自页面’的
         */
        var _snmz = "_snmz";
        var _snmzKeysArr = ["pvid", "clickDots"];

        /**
         * 页面初始化结束删除 点击数据唯一标识 注：临时存放_snmk中的点击数据唯一标识
         */
        var _snck = "_snck";

        /**
         * 浏览器关闭清除 搜索数据唯一标识 注：_snms Cookie存入搜索唯一标识，供后面获取,此cookie不向后台传
         */
        var _snms = "_snms";

        /**
         * 浏览器关闭清除 记录https页面url 在cookie被读取过一次后删除
         */
        var _snml = "_snml";

        var _snmx = "_snmx";
        var _snmk = "_snmk";
        var _snsd = "_snsd";
        var _snmo = "_snmo";
        var _snmt = "_snmt";
        var _snmg = "_snmg";
        var _snme = "_snme";

        var _tag = "|";
        var _no_data_tag = "";
        var _splited = "*:*";
        var expires_ms_2years = 365 * 2 * 24 * 60 * 60 * 1000;
        var expires_ms_30mins = 30 * 60 * 1000;
        var expires_ms_24hours = 864E5;
        var _snProtocol = "//";
        var _saServer = __ut.getSaServer();
        var _toTitle = document.title;
        var _toUrl = __ut._getToUrl();
        var _fromUrl = __ut._getFromUrl();
        var _fromTitle = _no_data_tag;
        var _searchersArr = new Array(".google.com", ".baidu.com", ".soso.com", ".bing.com", ".yahoo.com", ".sogou.com", ".360.cn", ".so.com", ".youdao.com", ".haosou.com");
        var _sourceMediumArr = new Array("direct", "referral", "organic");
        var _inTime = _no_data_tag;
        var _pvFlag = 0;
        var _crossDayFlag = 0;
        var memberID = __ut._getCookie("custno") ? __ut._getCookie("custno") : "-"; // Get the member ID.
        var loginUserName = ""; // Get the logined user name.
        var cookie_idsLoginUserIdLastTime = __ut._getCookie("idsLoginUserIdLastTime");
        if (cookie_idsLoginUserIdLastTime != undefined && cookie_idsLoginUserIdLastTime != null) {
            loginUserName = cookie_idsLoginUserIdLastTime;
        } else {
            var login_UserName = document.getElementById("idsLoginUserIdLastTime");
            loginUserName = login_UserName ? login_UserName.value : "";
        }
        var loginStatus = __ut._getCookie("logonStatus") ? __ut._getCookie("logonStatus") : ""; // Get the the login status, the possible value is "0", "1", "2" or ""; "" meaning not login.
        var idsEppLastLogin = __ut._getCookie("idsEppLastLogin") ? __ut._getCookie("idsEppLastLogin") : "";

        //访问日志延迟发送时间
        var sadelay = document.getElementsByTagName("meta")["sadelay"];
        sadelay = sadelay ? sadelay.getAttribute("content") : "";
        sadelay = sadelay ? Number(sadelay) : 0;
        sadelay = sadelay >= 500 ? 500 : sadelay <= 0 ? 0 : sadelay;

        var ua = navigator.userAgent,
            m = "match",
            os = __ut._getOSAndTer(),
            Bro = _getExplore(),
            OS, Ter;
        os.length == 2 ? (OS = os[0], Ter = os[1]) : !1;

        var IE = document.all ? true : false;

        //客户端自定义发送数据接口
        saCustomDataUtil = new SaCustomDataUtil();

        //页面销售数据cookie操作工具类
        pageSaleCookieUtil = new PageSaleCookieUtil();

        //自定义页面PV发送接口工具
        pageViewUtil = new PageViewUtil();

        //香港苏宁和苏宁基金兼容
        delhkjijinCookie();

        // 等sa.ready函数稳定后，将_saStart函数全部迁移到上边的闭包中实现
        sa.ready(_saStart);

        // load ssa2 js
        //_loadJs(getJsFilePath("4a800e24-7b53-40a4-8113-cbc9a1305f4b/ssa.js"));

        _samap.put = function (key, value) {

            if (_samap.data[key] == null) {
                _samap.keys.push(key);
            }
            _samap.data[key] = value;
            _saStart();
        };

        var uvId, sessionId, basicIds, trafficSource;

        (function () {
            var _length = frames.length;
            if (_length > 0) {
                for (var x = 0; x < _length; x++) {
                    try {
                        frames[x].document.onclick = _updateSnml; // 只有在不跨域的情况下才能执行成功
                    } catch (e) {}
                }
            }
        })();

        //热力图触发事件
        AddListener(document, 'click', function (event) {
            _globalClick(event)
        });
        AddListener(window, 'unload', function (event) {
            _sendClickPoint(true)
        });

        function _globalClick(event) {
            try {
                var evt = event || window.event || arguments[0];
                _putMouseXY(evt);
                // _protocol == "https:" ? _updateSnml() : !1; // 在https页面点击产生一个记录当前页面url的cookie
            } catch (e) {}
        }

        /**
         * 保存点击坐标到全局变量中
         */
        function _putMouseXY(event) {
            try {
                var xPos = 0,
                    yPos = 0;
                var evt = event || window.event;
                if (evt.pageX) {
                    xPos = evt.pageX;
                    yPos = evt.pageY;
                } else {
                    xPos = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
                    yPos = evt.clientY + document.body.scrollTop - document.body.clientTop;
                }

                xPos = ((xPos + '').indexOf('.') != -1) ? xPos.toFixed(2) : xPos;
                yPos = ((yPos + '').indexOf('.') != -1) ? yPos.toFixed(2) : yPos;

                var str = "(" + xPos + "," + yPos + ")";
                //_putSnmz(str);
                if (sa.hotClickObj.pointSet == "") {
                    sa.hotClickObj.pointSet = str;
                } else {
                    sa.hotClickObj.pointSet = sa.hotClickObj.pointSet + ";" + str;
                }

                sa.hotClickObj.count = sa.hotClickObj.count + 1;
                _sendClickPoint();

            } catch (e) {}
        }

        /**发送热力图坐标
         *@isFourceSend true:强制发送坐标,false:不发送
         **/
        function _sendClickPoint(isFourceSend) {
            try {
                if (isFourceSend == undefined || isFourceSend == null) {
                    isFourceSend = false;
                }

                if (sa.hotClickObj.count == 0) {
                    return false;
                }

                if (!isFourceSend && sa.hotClickObj.count < 10) {
                    return false;
                }

                //采集唯一标识
                var _oId = __ut._getOnlyId();

                //坐标集合
                var _clickPoints = __ut._encode(sa.hotClickObj.pointSet);

                //分辨率
                var _sense = _getSense();
                //屏幕颜色
                var _pointColor = _getPrinColor();

                //访问者唯一标识
                //从cookie[_snma]中获取
                var _snmaMap = _getSnmaMapFromCookie();
                var _visitorId = _snmaMap.get('visitorid');

                //发送坐标等信息()
                // 曝光日志格式为统一
                var _url = _snProtocol + __ut.getSaServer('', true) + "/hotClick.gif";
                _url = _url + "?oId=" + _oId + "&pvId=" + _saPageViewId + "&ponits=" + _clickPoints +
                    "&url=" + __ut._encode(_toUrl) + "&pageType=" + _resourceType + "&bro=" + Bro + "&sense=" + _sense +
                    "&color=" + _pointColor + "&visId=" + _visitorId + "&memId=" + memberID + "&hidUrlPattern=" + urlPattern;
                __ut._httpGifSendPassH5(_url);

                //发送完清空
                sa.hotClickObj.pointSet = "";
                sa.hotClickObj.count = 0;
            } catch (e) {}
        }

        function _saStart() {
            // PV Datas init.
            if (_samap.get("_saPvDatas") != null) {
                var userBaseProperty = [loginUserName];
                loginUserName ? userBaseProperty.push("R") : userBaseProperty.push("G");
                //访问日志延迟发送
                if (sadelay) {
                    var pvTimer = setTimeout(function () {
                        _saInit(_arrayToString(userBaseProperty));
                        _samap.remove("_saPvDatas");
                        clearTimeout(pvTimer);
                        pvTimer = null;
                    }, sadelay)
                } else {
                    _saInit(_arrayToString(userBaseProperty));
                    _samap.remove("_saPvDatas");
                }
            }

            if (_samap.get("_saSearchDatas") != null) {
                var searchDatasArr = _samap.get("_saSearchDatas");
                var searchDatas = _arrayToString(searchDatasArr);

                _sendSearchDatas(searchDatas);
                _samap.remove("_saSearchDatas");
            }
            if (_samap.get("_saOrderDatas") != null) {
                var orderDatasArr = _samap.get("_saOrderDatas");
                var orderDatas = _arrayToString(orderDatasArr);
                _sendOrderDatas(orderDatas);
                _samap.remove("_saOrderDatas");
            }
            if (_samap.get("_saRegisterDatas") != null) {
                var registerDatasArr = _samap.get("_saRegisterDatas");
                var registerDatas = _arrayToString(registerDatasArr);
                _sendRegisterDatas(registerDatas);
                _samap.remove("_saRegisterDatas");
            }
            if (_samap.get("_saStorageDatas") != null) {
                var storageDatasArr = _samap.get("_saStorageDatas");
                var storageDatas = _arrayToString(storageDatasArr);

                _sendStorageDatas(storageDatas);
                _samap.remove("_saStorageDatas");
            }
        }
        /**
         *
         * 自定义采集页面PV的接口
         * 调用接口前，需要设置sa.pvHasSend=true,防止页面PV重复采集
         * 使用方法：
         *    1、在<body>之后，da_opt.js引入之前加上开关，避免pv重复采集
         *   var sa = sa || {};
         *    sa.pvHasSend = true;
         *    2、在调用采集PV的发送接口
         *    try {
         *        if (_saPageViewInit && (typeof (_saPageViewInit)).toLowerCase() == 'function') {
         *            _saPageViewInit();
         *        }
         *    } catch (e) {
         *    }
         **/
        _saPageViewInit = function () {
            try {
                // 手动触发时，为避免同一页面pvid重复，重新生成pvid  88388897  2018-03-29
                sa.pvId = _saPageViewId = __ut._getOnlyId();
                var userBaseProperty = [loginUserName];
                loginUserName ? userBaseProperty.push("R") : userBaseProperty.push("G");

                //初始化，要求重新采集PV信息
                sa.pvHasSend = false;

                urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern"),
                    urlPattern = urlPattern ? urlPattern.value : "";
                _saInit(_arrayToString(userBaseProperty));
            } catch (e) {

            }
        }

        function _saInit(pvDatas) {
            if (sa.pvHasSend && sa.pvHasSend == true) {
                return false;
            }

            _putSnmaTimesAndViews();
            _checkSnmc();
            _putSnsr();
            _putSnmb();
            _putSnadtp();

            var snmaStr = __ut._getCookie(_snma);
            var snmbAndParamStr = _getSnmbAndParam(pvDatas);
            var snmxStr = _getSnmx();
            var snsrStr = __ut._getCookie(_snsr);
            /* 这里不能直接用__ut._getCookie(_snmz)是因为snmz若在上个页面没有任何click snmz cookie就不存在 */
            var snmzMap = _getSnmzMapFromCookie(); // 获取上个页面的点击
            /* 将_snmz中的唯一标识临时存在此cookie中，以便页面的订制js取 */
            var snmz = _getStrFromKeysArrAndValuesStr(_snmzKeysArr, snmzMap);
            var snmeStr = _saErrorCode;

            if ((typeof snmaStr == "undefined") && (typeof snsrStr == "undefined")) {
                var now = new Date();
                var pcOnly = __ut._getOnlyId();
                var snmaArr = ["1", pcOnly, now.getTime(), now.getTime(), now.getTime(), 1, 1];
                snmaStr = _arrayToString(snmaArr);
                snmbAndParamStr = snmbAndParamStr.substring(0, snmbAndParamStr.lastIndexOf(_tag) + 1) + "1";
                var snsrMap = _getSnsrMapFromCookie();
                snsrMap = _checkSource(snsrMap);
                snsrMap = _checkSnsr(snsrMap);
                snsrStr = _getStrFromKeysArrAndValuesStr(_snsrKeysArr, snsrMap);
            }

            try {
                _sendInitData(snmaStr, snmbAndParamStr, snmxStr, snsrStr, snmz, snmeStr);
                sa.pvHasSend = true;
            } catch (e) {
                sa.pvHasSend = false;
            }


            //TODO 等回收完点击代码后删除！！
            __ut._addCookie(_snmp, _saPageViewId, '/', "", "");
            __ut._delCookie(_snmz);
            __ut._delCookie(_snck);
            _refreshSnmbInTime();
        }

        /**
         * 获取主商品ID 在四级页面和购物车一页面
         */
        var GetMainProId = function () {
            var proId = '-',
                proValue;
            // ga_itemDataBean_itemID 为四级页面存放商品编码hidden标签
            // justAddPartNumber 为购物车一页面存放商品编码hidden标签
            var proObj = document.getElementById('ga_itemDataBean_itemID') || document.getElementById('justAddPartNumber');
            if (proObj) {
                proValue = proObj.value;
                proValue = (proValue.length == 18 ? proValue.substring(9) : proValue);
            }
            if (proValue) proId = proValue;

            return proId;
        }

        /**
         * 抓取需要采集的曝光标签元素，并获取标签集字符串
         */

        _sendExpoDatas = function (expoDatas, _capType, _param) {
            var proId = (_capType === 1 ? GetMainProId() : "-");
            var _expo_url = __ut.getInitUrl(),
                currencyUrl = __ut.getCurrencyUrl(9),
                _cityId = typeof sn == "object" ? (sn.cityId ? sn.cityId : "can not get cityId") : "can not get cityId";
            var _pvid = _saPageViewId;
            var keyArr = ["pvid", "expoinfo", "cityId", "item_Id"];
            var valueArr = [_pvid, expoDatas, _cityId, proId];
            // 透传参数新增逻辑
            var detailUrl = _param ?
                __ut.getConnect(keyArr, valueArr, {
                    type: 2,
                    ext: _param
                }) :
                __ut.getConnect(keyArr, valueArr, {
                    type: 2
                });
            detailUrl = __ut._encode(detailUrl);
            _expo_url = _expo_url + currencyUrl + "&evdl=" + detailUrl;
            __ut._httpGifSendPassH5(_expo_url);
        }

        _analyseExpoTags = function (e, d) {
            var tag = e,
                prefix = d,
                _param = null;
            if (__ut.isObjArgument(e)) {
                // 取自定义字段
                tag = e.tag;
                prefix = e.prefix;
                e = __ut._deleteKey(e, ['tag', 'prefix'])
                if (!__ut.isEmptyObj(e)) {
                    _param = e;
                }
            }

            var _eles = document.getElementsByTagName(tag),
                _expoIds = "",
                prefixID = "baoguang_",
                _regExp = new RegExp("^" + prefixID),
                _capType = 1;
            if (arguments.length == 2) {
                prefixID = prefix;
                _regExp = new RegExp("^" + prefixID);
                _capType = 2;
            }
            for (var x = 0, y = _eles.length; x < y; x++) {
                var _ele_id = _eles[x].id;
                _regExp.test(_ele_id) ? (_ele_id = _ele_id.substring(9), _expoIds += _ele_id + "#@#", _expoIds = _expoIds.replace(/\|/g, " ")) : !1;
            }
            if (_expoIds !== "") {
                _expoIds = _expoIds.substring(0, _expoIds.length - 3), _sendExpoDatas(_expoIds, _capType, _param)
            } else {
                _sendExpoDatas("-", _capType, _param)
            };
        }
        /**
         * 异步发送请求的对象
         */
        function SaAjax() {

            var oThis = this;
            /**
             * 在IFrame中构造图片发送异步请求
             *
             * @param {}
             *            src
             */
            oThis.sendByInnerImage = function (url) {
                if (document.body) {
                    var ifr = document.createElement('iframe');
                    ifr.height = '0';
                    ifr.width = '0';
                    ifr.style.display = 'none';
                    ifr.style.visibility = 'hidden';

                    var freeIfr = function () {
                        ifr && ifr.parentNode && ifr.parentNode.removeChild(ifr) && (ifr = null);
                    }
                    AddListener(window, 'beforeunload', freeIfr);
                    var sucess = false;
                    var ifrLoad = function () {
                        if (!sucess) {
                            try {
                                sucess = true; // iframe 的onload事件只触发一次
                                var iDoc = ifr.contentWindow.document;
                                var iImg = iDoc.createElement('img');
                                iImg.onload = iImg.onerror = function () {
                                    iImg.onload = iImg.onerror = null;
                                    iImg = null;
                                    freeIfr();
                                    if (window.removeEventListener) {
                                        window.removeEventListener('beforeunload', freeIfr, false)
                                    } else {
                                        window.detachEvent && window.detachEvent('onbeforeunload', freeIfr)
                                    };
                                };
                                iImg.src = url;
                            } catch (e) {}
                        }
                    }
                    AddListener(ifr, 'load', ifrLoad);
                    document.body.appendChild(ifr);
                } else {
                    setTimeout(function () {
                        oThis.sendByInnerImage(url)
                    }, 100);
                }
            }

            oThis.sendByIframe = function (url) {
                if (document.body) {
                    var ifr = document.getElementById('_iframe_sa_sendByIframe');
                    if (ifr) {
                        return false;
                    }
                    ifr = document.createElement('iframe');
                    ifr.id = '_iframe_sa_sendByIframe';
                    ifr.src = url;
                    ifr.height = '0';
                    ifr.width = '0';
                    ifr.style.display = 'none';
                    ifr.style.visibility = 'hidden';
                    document.body.appendChild(ifr);
                } else {
                    setTimeout(function () {
                        oThis.sendByIframe(url)
                    }, 100);
                }
            }
        }

        /**
         * 添加监听器
         *
         * @param {}
         *            element
         * @param {}
         *            type
         * @param {}
         *            listener
         * @param {}
         *            useCapture
         */
        function AddListener(element, type, listener, useCapture) {
            if (element.addEventListener) {
                element.addEventListener(type, listener, !!useCapture);
            } else {
                element.attachEvent && element.attachEvent('on' + type, listener);
            }
        }

        function _getSnmx() {
            var snck = __ut._getCookie(_snck); // cookie中零时保存的点击数据id
            if (!snck || snck == null || snck == "") {
                snck = _no_data_tag;
            }
            var snmx = OS + _tag + Bro + _tag + _getSense() + _tag + _getPrinColor() + _tag + _getFlash() + _tag + _getJava() + _tag + snck;
            return snmx;
        }

        //判断浏览器以及版本号
        function _getExplore() {
            try {
                if(window.__wxjs_environment === "miniprogram") return "wxmp";
                var explore = {
                    'uc': ' ubrowser|ucbrowser|ucweb',
                    'baidu': 'bidubrowser|baiduhd|baidubrowser',
                    'weixin': 'micromessenger',
                    'qqclient': ' qq\/',
                    'qq': 'qqbrowser|mqqbrowser',
                    '2345': '2345explorer|Mb2345Browser',
                    'liebao': 'lbbrowser|liebaofast',
                    '360': '360se|360ee|QHBrowser|360Browser|QIHOOBROWSER|QIHOO NEWSSDK',
                    'firefox': 'firefox|FxiOS',
                    'maxthon': 'maxthon|mxbrowser|MXiOS',
                    'theworld': 'theworld',
                    'sougou': 'metasr|sogoumobilebrowser',
                    'edge': ' edge',
                    'kwe': ' kwe',
                    'sleipnir': 'sleipnir',
                    'xiaomiBrowser': 'miuiBrowser',
                    'oppoBrowser': 'OPPOBROWSER',
                    'vivoBrowser': 'VIVOBROWSER',
                    'baiduboxapp': 'baiduboxapp',
                    'opera': 'opr|opios',
                    'snStorePlus': 'StorePlus',
                    'snUnion': 'SNUNION-APP',
                    'snPos': '苏宁\\+POS|;pos;',
                    'snMall': '苏宁\\+商城|;mall;',
                    'snStore': 'SNSTORE',
                    'snMaster': '苏宁\\+金掌柜|;master;',
                    'snSposs': 'SNSPOSS-APP',
                    'snNearby': 'NEARBY-APP',
                    'snEbook': 'EBOOK-APP',
                    'snPPSports': 'PPTVSports',
                    'snPPTV': 'PPTV',
                    'snYifubao': 'SNYifubao',
                    'snclient-wap': 'SNCLIENT-WAP'
                };
                var browser = "unknown";
                for (var k in explore) {
                    var pa = new RegExp("(?:" + explore[k] + ") ?\\/?(\\d+\\.*\\d*)?", "i");
                    if (pa.test(ua)) {
                        if (k.indexOf('sn') === 0) {
                            browser = k
                        } else {
                            browser = k + " " + (RegExp.$1 ? RegExp.$1 : "");
                        }
                        break;
                    }
                }
                if (browser == "unknown") {
                    var s;
                    if (s = ua[m](/(msie|ie) ([\d.]+)/i)) { //ie
                        browser = 'msie ' + s[2];
                    }
                    if ((s = ua[m](/(chrome|CriOS)\/([\d.]+)/i))) { //chrome
                        browser = 'chrome ' + s[2];
                    }
                    if (s = ua[m](/opera.([\d.]+)/i)) { //opera
                        browser = 'opera ' + s[1];
                    }
                    if (!/(Android)/i.test(ua)) { //如果是安卓平台，则不去判断safari
                        if (s = ua[m](/version\/([\d.]+).*safari/i)) { //safari
                            browser = 'safari ' + s[1];
                        }
                    }
                }
                return browser;

            } catch (e) {
                return "unknown";
            }

        }


        /**
         * 获取客户端分辨率
         */
        function _getSense() {
            return window.screen.width + "x" + window.screen.height;
        }

        /**
         * 获取客户端分色彩位数
         */
        function _getPrinColor() {
            return window.screen.colorDepth + "bit";
        }

        /**
         * 获取客户端是否支持flash
         */
        function _getFlash() {
            try {
                var f = "";
                var n = navigator;
                if (n.plugins && n.plugins.length) {
                    for (var ii = 0; ii < n.plugins.length; ii++) {
                        if (n.plugins[ii].name.indexOf('Shockwave Flash') != -1) {
                            f = n.plugins[ii].description.split('Shockwave Flash ')[1].split(' ')[0];
                            break;
                        }
                    }
                } else if (window.ActiveXObject) {
                    for (var ii = 10; ii >= 2; ii--) {
                        try {
                            var fl = eval("new ActiveXObject('ShockwaveFlash.ShockwaveFlash." + ii + "');");
                            if (fl) {
                                f = ii + '.0';
                                break;
                            }
                        } catch (e) {}
                    }
                }
                if (f != "") {
                    return 1;
                }
            } catch (e) {

            }

            return 0;
        }

        /**
         * 获取客户端是否支持java
         */
        function _getJava() {
            try {
                if (navigator.javaEnabled()) {
                    return 1;
                }
            } catch (e) {

            }

            return 0;
        }

        function _putSnmaTimesAndViews() {
            // cookie增加校验机制  88388897  2018-03-27
            _inspectSnma();
            var date = new Date();
            var snmaMap = _getSnmaMapFromCookie();
            snmaMap.put("lastViewTime", snmaMap.get("thisViewTime"));
            snmaMap.put("thisViewTime", date.getTime());
            snmaMap.put("totalPvs", Number(snmaMap.get("totalPvs")) + 1);
            _setSnmaMapToCookie(snmaMap);

            uvId = snmaMap.get("visitorid");
        }
        // 判断_snma的值是否正常（符合正则），如不符合，则删除cookie
        function _inspectSnma() {
            try {
                var cookie_snma = __ut._getCookie(_snma);
                var snmaReg = /^[1][|]\d{14,19}[|]\d{13}[|]\d{13}[|]\d{13}[|]\d+[|]\d+$|^[|]\d{14,19}\|{5}$/;
                if (cookie_snma && !snmaReg.test(cookie_snma)) {
                    __ut._delCookie(_snma);
                }
            } catch (e) {}
        }

        function _putSnsr() {
            // cookie增加校验机制  88388897  2018-03-27
            _inspectSnsr();
            var snsrMap = _getSnsrMapFromCookie();
            snsrMap = _checkSource(snsrMap);
            snsrMap = _checkSnsr(snsrMap);
            /** 检查结束 */
            _setSnsrMapToCookie(snsrMap);

            trafficSource = __ut._getCookie(_snsr);
        }
        // 判断_snsr的值是否正常（不为空且包含4个|），如不符合，则删除cookie
        function _inspectSnsr() {
            try {
                var cookie_snsr = __ut._getCookie(_snsr);
                var strCount = cookie_snsr ? cookie_snsr.match(new RegExp("[|]", "g")) : [];
                strCount = strCount ? strCount.length : 0;
                if (cookie_snsr && cookie_snsr == "-" || cookie_snsr && strCount != 4) {
                    __ut._delCookie(_snsr);
                }
            } catch (e) {}
        }
        /** 会话首次访问的时候检查来源是不是搜索引擎或者引荐 */
        function _checkSource(snsrMap) {
            try {
                var keyArr = new Array("wd", "q", "w", "query", "p", "word", "keyword");
                var int_i = 0;
                var int_j = 0;
                if (_fromUrl != "") {
                    for (var i = 0; i < _searchersArr.length; i++) {
                        var _searchers = _searchersArr[i];
                        if (_fromUrl.indexOf(_searchers) != -1) { // 来自搜索引擎
                            snsrMap.put("source", _searchers.substring(1, _searchers.length));
                            snsrMap.put("medium", _sourceMediumArr[1]); // referral 引荐流量
                            snsrMap.put("content", _no_data_tag);
                            snsrMap.put("campaign", _no_data_tag);
                            snsrMap.put("theme", _no_data_tag);
                            var parms = _fromUrl.substring(_fromUrl.indexOf("?") + 1, _fromUrl.length);

                            var parmsArr = parms.split("&");
                            for (var ii = 0; ii < parmsArr.length; ii++) {
                                var parmArr = parmsArr[ii].split("=");
                                for (var j = 0; j < keyArr.length; j++) { // 通过搜索wd、q等
                                    if (keyArr[j] == parmArr[0]) {
                                        snsrMap.put("medium", _sourceMediumArr[2]); // organic
                                        //添加的判断条件，当对应时添加搜索关键字
                                        if ((_fromUrl.indexOf(".haosou.com") > 0 && parmArr[0] == "q") ||
                                            (_fromUrl.indexOf(".google.com") > 0 && parmArr[0] == "p") ||
                                            (_fromUrl.indexOf(".sogou.com") > 0 && (parmArr[0] == "query" || parmArr[0] == "keyword")) ||
                                            (_fromUrl.indexOf(".bing.com") > 0 && parmArr[0] == "q") ||
                                            (_fromUrl.indexOf(".yahoo.com") > 0 && parmArr[0] == "p") ||
                                            (_fromUrl.indexOf(".youdao.com") > 0 && parmArr[0] == "q") ||
                                            (_fromUrl.indexOf(".so.com") > 0 && parmArr[0] == "q") ||
                                            (_fromUrl.indexOf(".baidu.com") > 0 && (parmArr[0] == "wd" || parmArr[0] == "w" || parmArr[0] == "word"))
                                        ) {
                                            snsrMap.put("theme", parmArr[1] + _splited); // 搜索关键字
                                            break;
                                        }

                                    }
                                }
                                int_j = j;
                                if (int_j < keyArr.length) {
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    int_i = i;
                    if (int_i == _searchersArr.length || (int_i < _searchersArr.length && int_j == keyArr.length)) {
                        var toDomain = _getDomainByUrl(location.href);
                        var fromDomain = _getDomainByUrl(_fromUrl);
                        // sa的referral来源中判断：来自页面域名是.suning.com和.suningpay.com结尾的不归为referral，但union.suning.com归为referral
                        if ((fromDomain.indexOf(".suning.com") == -1 &&
                                fromDomain.indexOf(".cnsuning.com") == -1 &&
                                fromDomain.indexOf(".hksuning.com") == -1 &&
                                fromDomain.indexOf(".snjijin.com") == -1 &&
                                fromDomain.indexOf(".suningssc.com") == -1 &&
                                fromDomain.indexOf(".suningpay.com") == -1) ||
                            fromDomain.indexOf("union.suning.com") != -1) { // 站外流量
                            snsrMap.put("source", _getDomainByUrl(_fromUrl));
                            snsrMap.put("medium", _sourceMediumArr[1]); // referrer
                            snsrMap.put("content", _no_data_tag);
                            snsrMap.put("campaign", _no_data_tag);
                            snsrMap.put("theme", _no_data_tag);
                            for (var i = 0; i < _searchersArr.length; i++) {
                                var _searchers = _searchersArr[i];
                                if (_fromUrl.indexOf(_searchers) != -1) { // 几大搜索引擎
                                    snsrMap.put("source", _searchers.substring(1, _searchers.length));
                                    break;
                                }
                            }
                        }
                    }
                }
                /*
                 * else{// 修改为直接流量 var snsrArr = [_sourceMediumArr[0],
                 * _sourceMediumArr[0],_no_data_tag,_no_data_tag,_no_data_tag]; // direct
                 * snsrMap = _getMapFromKeyValueArrs(_snsrKeysArr, snsrArr); }
                 */
            } catch (e) {

            }
            return snsrMap;
        }

        /** 会话首次访问的时候判断是否更新cookie _snsr的值 */
        function _checkSnsr(snsrMap) {
            try {
                if (_toUrl != "" && (_toUrl.indexOf("utm_source") > 0 ||
                        _toUrl.indexOf("utm_medium") > 0 ||
                        _toUrl.indexOf("utm_content") > 0 ||
                        _toUrl.indexOf("utm_campaign") > 0 ||
                        _toUrl.indexOf("utm_term") > 0)) {
                    var parms = _toUrl.substring(_toUrl.indexOf("?") + 1, _toUrl.length);
                    var parmsArr = parms.split("&");
                    for (var i = 0; i < parmsArr.length; i++) {
                        var parmArr = parmsArr[i].split("=");
                        if (parmArr[0] == "utm_source") {
                            snsrMap.put("source", parmArr[1]);
                        } else if (parmArr[0] == "utm_medium") {
                            snsrMap.put("medium", parmArr[1]);
                        } else if (parmArr[0] == "utm_content") {
                            snsrMap.put("content", parmArr[1]);
                        } else if (parmArr[0] == "utm_campaign") {
                            snsrMap.put("campaign", parmArr[1]);
                        } else if (parmArr[0] == "utm_term") {
                            var tmpVar = snsrMap.get("theme");
                            fromUrl_utm_term = tmpVar ? cutWord(tmpVar, _splited) : (_no_data_tag + _splited); // �����ؼ���*:*Ͷ�Ŵ�
                            snsrMap.put("theme", fromUrl_utm_term + parmArr[1]);
                        }
                    }
                }
            } catch (e) {

            }

            return snsrMap;
        }


        function cutWord(word, flag) {
            return word ? word.substring(0, word.indexOf(flag) + flag.length) : word;
        }

        /**
         * 若超过30分钟没有对页面做任何操作，则删除_snmb cookie、_snsr cookie（_snsr已过期）
         */
        function _checkSnmc() {
            var snmc = __ut._getCookie(_snmc);
            if (!snmc || snmc == null || snmc == "") { // 不存在snmc
                var snmb = __ut._getCookie(_snmb);
                if (!snmb || snmb == null || snmb == "") { // snmb也不存在，证明用户是第一次登录
                    _inTime = _no_data_tag;
                } else { // 会话超时（30min）
                    var snmbMap = _getSnmbMapFromCookie();
                    _inTime = snmbMap.get("inTime");
                    __ut._delCookie(_snmb);
                }
                /*
                 * var snsr = _getCookie(_snsr); if(snsr && snsr != "" && snsr != null){
                 * _delCookie(_snsr); }
                 */
            }
            _putSnmc();
        }

        function _getSnmbAndParam(pvDatas) {
            var snmbMap = _getSnmbMapFromCookie();
            var snmbStr = _getStrFromKeysArrAndValuesStr(_snmbKeysArr, snmbMap);
            var fromUrl = _cutUrlToShort(_fromUrl);
            var fromTitle = _cutUrlToShort(_fromTitle);
            var toUrl = _cutUrlToShort(_toUrl);
            var toTitle = _base64.encode(_cutUrlToShort(_toTitle)); // 对title进行base64编码

            var snmbAndParamStr = pvDatas + _tag + fromUrl + _tag + fromTitle + _tag + toUrl + _tag + toTitle + _tag + snmbStr;
            return snmbAndParamStr;
        }

        function _putSnmb() {
            // cookie增加校验机制  88388897  2018-03-27
            _inspectSnmb();
            var snmbMap = _getSnmbMapFromCookie();
            var date = new Date(); // 当前时间
            snmbMap.put("outTime", date.getTime()); // 更新上个页面的离开时间
            snmbMap.put("views", Number(snmbMap.get("views")) + 1); // 同一个session view +
            // 1
            _setSnmbMapToCookie(snmbMap);

            sessionId = snmbMap.get("visitid");
        }
        // 判断_snmb的值是否正常（符合正则），如不符合，则删除cookie
        function _inspectSnmb() {
            try {
                var cookie_snmb = __ut._getCookie(_snmb);
                var snmbReg = /^\d{14,19}[|]\d{13}[|]\d{13}[|]\d+$/;
                if (cookie_snmb && !snmbReg.test(cookie_snmb)) {
                    __ut._delCookie(_snmb);
                }
            } catch (e) {}
        }

        function _putSnadtp() {
            var url = __ut._getToUrl();
            var adtype = __ut.SaPick(url, "adtype", "&");
            if (adtype && adtype != "-") {
                __ut._addCookie("_snadtp", adtype, '/', "", "");
            }
        }

        function _refreshSnmbInTime() {
            var snmbMap = _getSnmbMapFromCookie();
            snmbMap.put("inTime", new Date().getTime());
            _setSnmbMapToCookie(snmbMap);
        }

        /** 写snmc cookie * */
        function _putSnmc() {
            __ut._addCookie(_snmc, "1", '/', expires_ms_30mins, "");
        }

        /**
         * cookie更新逻辑： 当cookie存在且等于当前URL的情况下不更新，其余情况都需要更新
         */
        function _updateSnml() {
            var httpsUrl = __ut._getCookie(_snml);
            if (!httpsUrl || httpsUrl != _toUrl) {
                __ut._addCookie(_snml, _toUrl, "/", "", "");
            }
        }

        /** _snma的cookie 映射到 map * */
        function _getSnmaMapFromCookie() {
            var snmaMap,
                snmaReg = /^[|]\d{14,19}\|{5}$/,
                snmaStr = __ut._getCookie(_snma);
            if (snmaStr && snmaStr != null && snmaStr != "") {
                if (snmaReg.test(snmaStr)) {
                    var now = new Date(),
                        visitor_id = snmaStr.split("|")[1],
                        snmaArr = ["1", visitor_id, now.getTime(), now.getTime(), now.getTime(), 0, 0];
                    snmaMap = _getMapFromKeyValueArrs(_snmaKeysArr, snmaArr);
                    return snmaMap;
                } else {
                    var snmaArr = snmaStr.split(_tag);
                    snmaMap = _getMapFromKeyValueArrs(_snmaKeysArr, snmaArr);
                    return snmaMap;
                }
            } else {
                var now = new Date(),
                    pcOnly = __ut._getOnlyId(),
                    snmaArr = ["1", pcOnly, now.getTime(), now.getTime(), now.getTime(), 0, 0];
                snmaMap = _getMapFromKeyValueArrs(_snmaKeysArr, snmaArr);
                return snmaMap;
            }
        }

        /** _snma的map 映射到 cookie * */
        function _setSnmaMapToCookie(map) {
            var snmaStr = _getStrFromKeysArrAndValuesStr(_snmaKeysArr, map);
            __ut._addCookie(_snma, snmaStr, '/', expires_ms_2years, "");
        }

        /** _snmb的cookie 映射到 map * */
        function _getSnmbMapFromCookie() {
            var snmbMap;
            var snmbStr = __ut._getCookie(_snmb);
            if (snmbStr) {
                var snmbArr = snmbStr.split(_tag);
                snmbMap = _getMapFromKeyValueArrs(_snmbKeysArr, snmbArr);

                /** 判断visit是否跨天超时 */
                if (_crossDayFlag === 0) {
                    var __inTime = snmbMap.get('inTime');
                    if (__inTime && /\d/.test(__inTime)) {
                        var _inDate = new Date(Number(__inTime)).getDate();
                        if (new Date().getDate() == _inDate + 1) { // ��Ȼ�쳬ʱ
                            _inTime = __inTime;
                            _crossDayFlag++;
                            return newSession();
                        }
                    }
                }

                /** 判断visit是否跨天超时结束 */
                return snmbMap;
            } else { // 刚开启一个新的visit或者30分钟超时
                return newSession();
            }
        }
        /** 创建一个新的会话 */
        function newSession() {
            window._sa_utils.getSnvd('checksnvd');
            // 更新snmaMap cookie
            if (_pvFlag === 0) { // 一个new session只能有一次totalpv的累计
                var snmaMap = _getSnmaMapFromCookie();
                snmaMap.put('totalVisits', Number(snmaMap.get('totalVisits')) + 1);
                _setSnmaMapToCookie(snmaMap); // 立刻更新snma cookie
                _pvFlag++;
            }
            var sessionId = __ut._getOnlyId(),
                snmbArr = [sessionId, _inTime, _no_data_tag, 0], // snmb 值域[sessionId,'', '', 0]，若超时，则[sessionId, _inTime, '', 0]
                snmbMap = _getMapFromKeyValueArrs(_snmbKeysArr, snmbArr);
            return snmbMap;
        }

        function _setSnmbMapToCookie(map) {
            var snmbStr = _getStrFromKeysArrAndValuesStr(_snmbKeysArr, map);
            __ut._addCookie(_snmb, snmbStr, '/', "", "");
        }

        function _getSnmzMapFromCookie() {

            var snmzMap;
            var snmzStr = __ut._getCookie(_snmz);
            if (snmzStr && snmzStr != null && snmzStr != "") { // 上个页面已经产生了点击
                var snmzArr = snmzStr.split(_tag);
                snmzMap = _getMapFromKeyValueArrs(_snmzKeysArr, snmzArr);
            } else { // 若上个页面没有点击
                var pvid = _saPageViewId;
                var snmzArr = [pvid, _no_data_tag];
                snmzMap = _getMapFromKeyValueArrs(_snmzKeysArr, snmzArr);
            }
            snmzMap.put("pvid", _saPageViewId);
            return snmzMap;
        }

        function _getSnsrMapFromCookie() {
            var snsrMap;
            var snsrStr = __ut._getCookie(_snsr);
            if (snsrStr && snsrStr != null && snsrStr != "") {
                var snsrArr = snsrStr.split(_tag);
                snsrMap = _getMapFromKeyValueArrs(_snsrKeysArr, snsrArr);
                return snsrMap;
            } else { // 第一次来访
                var snsrArr = [_sourceMediumArr[0], _sourceMediumArr[0], _no_data_tag, _no_data_tag, _no_data_tag];
                snsrMap = _getMapFromKeyValueArrs(_snsrKeysArr, snsrArr);
                return snsrMap;
            }
        }

        /**
         * <功能描述> 将来源信息写入COOKIE <详细功能描述> 来源COOKIE写入原则：
         * 1.在获取不到SNSR的COOKIE的情况下（如第一次访问、用户手动删除COOKIE、COOKIE过期）根据来源判断逻辑，将当前页面判断的来源细节写入COOKIE中（包括直接来源）
         * 2 在能够获取COOKIE值的情况下，分为如下两种情况： 2.1
         * COOKIE中记录之前的值为直接流量，当前页面的流量为非直接流量，则将当前流量的信息更新到COOKIE中； 2.2
         * COOKIE中记录的为非直接流量，而当前流量被判断为直接流量，则COOKIE不更新（实际中此种情况不存在，因为来源判断逻辑中已经保证了只要COOKIE中有记录非来源，则无法将流量拨回到直接流量）；
         *
         * 会话COOKIE删除动作： 若当前页面的流量被判断为另一个非直接流量，则需要产生一个新的会话，所以当前SNMB COOKIE需要被删除
         *
         */
        function _setSnsrMapToCookie(map) {
            var _tempMap = _getSnsrMapFromCookie();
            var _tempMapArr = _getStrFromKeysArrAndValuesStr(_snsrKeysArr, _tempMap),
                _mapArr = _getStrFromKeysArrAndValuesStr(_snsrKeysArr, map);
            // 第一次进入(浏览器中不存在snsr的cookie，值可能是直接或者非直接) || COOKIE中记录的来源(直接和非直接)和当前判断的来源不相同
            if (!__ut._getCookie(_snsr) || _tempMapArr != _mapArr) {
                var snsrStr = _getStrFromKeysArrAndValuesStr(_snsrKeysArr, map);
                __ut._addCookie(_snsr, snsrStr, '/', expires_ms_24hours, "");
                // 如果要更改的流量不是直接流量则重新开启一个会话
                // 当满足更新流量COOKIE的规则的时候，必须重新开启一个会话，所以如下判断不需要
                // 因为在SNSR COOKIE 不存在（第一次访问，手动删除，COOKIE24 小时超时）的时候才会出现
                // MAP中的来源为直接来源，按照需求，此种情况也必须重新开启一个会话
                /* if (map.get(_snsrKeysArr[0]) != _sourceMediumArr[0]) {} */
                var _snmbMap = _getSnmbMapFromCookie();
                _inTime = _snmbMap.get('inTime');
                __ut._delCookie(_snmb); // 更换来源cookie，则重新开启一个会话
            }
        }

        //删除hksuning.com　和jijin.com下的二级域名的对应cookie
        function delhkjijinCookie() {
            var dm = document.domain;
            if ((dm.indexOf(".hksuning.com") > -1) || (dm.indexOf(".snjijin.com") > -1)) {
                var date = new Date();
                date.setTime(date.getTime() - 10000);
                var str = ";expires=" + date.toGMTString() + ";path=/";
                document.cookie = "_snma=" + str + ";domain=." + dm;
                document.cookie = "_snmc=" + str + ";domain=." + dm;
                document.cookie = "_snsr=" + str + ";domain=." + dm;
                document.cookie = "_snvd=" + str + ";domain=." + dm;
            }
        }


        function _getDomainByUrl(url) {
            var tmpdomain = url.substring(url.indexOf("/", url.indexOf("/") + 1) + 1);
            var domain = tmpdomain.substring(0, tmpdomain.indexOf("/"));
            return domain;
        }

        function _initSaPvHasSendFlg() {
            if (sa.pvHasSend == undefined || sa.pvHasSend == null) {
                sa.pvHasSend = false;
            }
        }

        function _getMapFromKeyValueArrs(keysArr, valuesArr) {
            var map = new __ut.saHashMap();
            for (var i = 0; i < keysArr.length; i++) {
                map.put(keysArr[i], valuesArr[i]);
            }
            return map;
        }

        function _getStrFromKeysArrAndValuesStr(keysArr, valuesMap) {
            var valuesStr = "";
            for (var i = 0; i < keysArr.length; i++) {
                valuesStr = valuesStr + valuesMap.get(keysArr[i]) + _tag;
            }
            return valuesStr.substring(0, valuesStr.length - 1);
        }

        function _arrayToString(arr) {
            if (!arr || arr == "") {
                return "";
            }
            var resultStr = "";
            for (var i = 0; i < arr.length; i++) {
                resultStr = resultStr + arr[i] + _tag;
            }
            return resultStr.substring(0, resultStr.length - 1);
        }

        function _cutUrlToShort(urlOrTitle) {
            if (urlOrTitle.length > 301) {
                urlOrTitle = urlOrTitle.substring(0, 300);
            }
            while (urlOrTitle.indexOf(_tag) != -1) {
                urlOrTitle = urlOrTitle.replace(_tag, "--");
            }
            return urlOrTitle;
        }

        /**
         *采集PV信息的接口
         *@fromUrl：来自页面url，不要encode
         *@currentUrl当前页面URL。不要encode
         *@currentPageTitle:当前页面title，不要encode
         */
        _ssaSendPvData = function (fromUrl, currentUrl, currentPageTitle) {

            try {
                _toTitle = currentPageTitle;
                _toUrl = currentUrl;
                _fromUrl = fromUrl;
                _fromTitle = _no_data_tag;

                var userBaseProperty = [loginUserName];
                loginUserName ? userBaseProperty.push("R") : userBaseProperty.push("G");

                //初始化，要求重新采集PV信息
                sa.pvHasSend = false;

                urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern"),
                    urlPattern = urlPattern ? urlPattern.value : "";
                _saInit(_arrayToString(userBaseProperty));
            } catch (e) {

            }
        }

        function _sendInitData(data1, data2, data3, data4, data5, data6) {
            var initUrl = __ut.getInitUrl();
            var currencyUrl = __ut.getCurrencyUrl(1);
            //snma
            var snma = "";
            var cookie_snma = __ut._getCookie("_snma");
            if (cookie_snma != undefined && cookie_snma != null && cookie_snma.indexOf("|") >= 0) {
                try {
                    snma = __ut._encode(cookie_snma);
                } catch (e) {}
            }
            //from_page_title
            var from_page_title = _fromTitle;
            //page_title
            var page_title = "";
            page_title = document.title ? _base64.encode(_cutUrlToShort(document.title)) : "";
            //frompage_start_time,frompage_end_time,session_pv
            var frompage_start_time = "",
                frompage_end_time = "",
                session_pv = "";
            var cookie_snmb = __ut._getCookie("_snmb");
            if (cookie_snmb != undefined && cookie_snmb != null && cookie_snmb.indexOf("|") >= 0) {
                try {
                    frompage_start_time = cookie_snmb.split("|")[1];
                    frompage_end_time = cookie_snmb.split("|")[2];
                    session_pv = cookie_snmb.split("|")[3];
                } catch (e) {}
            }
            //error_code
            var error_code = document.getElementById("errorCode");
            error_code = error_code ? error_code.value : "";
            //from_click_id
            var from_click_id = "";
            var cookie_snck = __ut._getCookie("_snck");
            if (cookie_snck != undefined && cookie_snck != null) {
                try {
                    from_click_id = cookie_snck;
                } catch (e) {}
            }
            //clickDots
            var clickDots = "";
            var cookie_snmz = __ut._getCookie("_snmz");
            if (cookie_snmz != undefined && cookie_snmz != null && cookie_snmz.indexOf("|") >= 0) {
                try {
                    clickDots = cookie_snmz.split("|")[1];
                } catch (e) {}
            }
            // abtest
            var abtest = document.getElementById("ssa-abtest");
            abtest = abtest ? abtest.value : "";
            // ad_sp
            var ad_sp = __ut.SaPick(_toUrl, "ad_sp", "&");
            //子码
            var proObject = document.getElementById("ga_itemDataBean_itemID");
            proObject = proObject ? proObject.value : "";
            // urlPattern
            var urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern");
            urlPattern = urlPattern ? urlPattern.value : "";
            //易购版采集JS采集站内付费流量来源需求   88388897   2018/2/24
            // adtype--(_snadtp)
            var adtype = "";
            var cookie_snadtp = __ut._getCookie("_snadtp");
            if (cookie_snadtp != undefined && cookie_snadtp != null) {
                try {
                    adtype = cookie_snadtp;
                } catch (e) {}
            }
            //operate_system--(os) terminal_type--(ter)
            var operate_system = "",
                terminal_type = "";
            var _os = __ut._getOSAndTer();
            if (_os) {
                try {
                    operate_system = _os[0];
                    terminal_type = _os[1];
                } catch (e) {}
            }
            //browser
            var browser = _getExplore();
            //screen_resolution--(sr)
            var screen_resolution = _getSense();
            //screen_color--(col)
            var screen_color = _getPrinColor();
            //is_falsh--(flash)
            var is_falsh = _getFlash();
            //is_java--(java)
            var is_java = _getJava();

            //title
            var titleKeyArr = ["ftitle", "ctitle"];
            var titleValueArr = [from_page_title, page_title];
            var _title = __ut.getConnect(titleKeyArr, titleValueArr, {
                type: 2
            });
            _title = __ut._encode(_title);
            //ft
            var ftKeyArr = ["fit", "fot"];
            var ftValueArr = [frompage_start_time, frompage_end_time];
            var _ft = __ut.getConnect(ftKeyArr, ftValueArr, {
                type: 2
            });
            _ft = __ut._encode(_ft);
            //ext
            var extKeyArr = ["err", "clid", "clickDots", "ab_test", "ad_sp", "item_Id", "urlPattern", "_snadtp"];
            var extValueArr = [error_code, from_click_id, clickDots, abtest, ad_sp, proObject, urlPattern, adtype];
            var _ext = __ut.getConnect(extKeyArr, extValueArr, {
                type: 2
            });
            _ext = __ut._encode(_ext);
            //clnt_info
            var keyArr = ["ter", "os", "br", "sr", "col", "flash", "java"];
            var valueArr = [terminal_type, operate_system, browser, screen_resolution, screen_color, is_falsh, is_java];
            var clnt_info = __ut.getConnect(keyArr, valueArr, {
                type: 2
            });
            clnt_info = __ut._encode(clnt_info);

            var url = initUrl + currencyUrl + "&snma=" + snma + "&title=" + _title + "&ft=" + _ft + "&ext=" + _ext +
                "&sec=" + session_pv + "&clnt_info=" + clnt_info;
            __ut._httpGifSend(url);

            basicIds = loginUserName + _tag + memberID + _tag + uvId + _tag + sessionId;

            //每个页面都做CookieMapping
            if (__ut.getJsResName == 'da_opt.js') {
                _saSendCookieMapping();
            }
        }
        /**
         * 搜索格式更改
         * 20180528
         */

        function _sendSearchDatas(searchDatas) {
            try {
                var searchTitle = _cutUrlToShort(_fromTitle);

                var resultSearchWord = "",
                    searchCount = "",
                    recNumValue = "",
                    splitedKeywordValue = "",
                    ciValue = "",
                    catalogIdValue = "",
                    userSearchkeyWord = "",
                    kuozhanKeyWod = "",
                    searchCategory = "",
                    searchTypeValue = "";
                if (searchDatas != undefined && searchDatas != null) {
                    var searchDatasArr = searchDatas.split(_tag);
                    resultSearchWord = searchDatasArr[0] !== undefined ? searchDatasArr[0] : "";
                    searchCount = searchDatasArr[1] !== undefined ? searchDatasArr[1] : "";
                    recNumValue = searchDatasArr[2] !== undefined ? searchDatasArr[2] : "";
                    splitedKeywordValue = searchDatasArr[3] !== undefined ? searchDatasArr[3] : "";
                    ciValue = searchDatasArr[4] !== undefined ? searchDatasArr[4] : "";
                    catalogIdValue = searchDatasArr[5] !== undefined ? searchDatasArr[5] : "";
                    userSearchkeyWord = searchDatasArr[6] !== undefined ? searchDatasArr[6] : "";
                    kuozhanKeyWod = searchDatasArr[7] !== undefined ? searchDatasArr[7] : "";
                    searchCategory = searchDatasArr[8] !== undefined ? searchDatasArr[8] : "";
                    searchTypeValue = searchDatasArr[9] !== undefined ? searchDatasArr[9] : "";
                }

                // Add send city.
                var matched = _toUrl.match(/cityId=([\d]+)/),
                    sendCityId = (matched && (matched.length > 0) ? matched[1] : "-");

                //搜索分类
                if (!searchCategory || searchCategory == "" || searchCategory == "undefined") {
                    var hiddenSearchCategory = document.getElementById('searchCategory');
                    searchCategory = hiddenSearchCategory ? hiddenSearchCategory.value : "";
                }

                if (kuozhanKeyWod && kuozhanKeyWod == "kzkeyword undefined") {
                    kuozhanKeyWod = "";
                }

                // abtest
                var abtest = document.getElementById("ssa-abtest");
                abtest = abtest ? abtest.value : "";

                //urlPattern
                var urlPattern = document.getElementById("URLPattern") || document.getElementById("CUrlPattern");
                urlPattern = urlPattern ? urlPattern.value : "";
                //sescs
                var sescs = document.getElementById("sescs");
                sescs = sescs ? sescs.value : "";

                var keyArr = ['pvid', 'ci', "searchType", 'catalogId', 'title', 'keyword', 'resultnum', 'recNum', 'splitedKeyword', 'ab_test', 'kzWord', 'scId', 'searchID', 'uerWord', 'urlPattern', 'sescs'];

                var pvId = _saPageViewId;
                var valueArr = [pvId, ciValue, searchTypeValue, catalogIdValue, searchTitle, resultSearchWord, searchCount, recNumValue, splitedKeywordValue, abtest, kuozhanKeyWod, sendCityId, searchCategory, userSearchkeyWord, urlPattern, sescs];
                var searchDetailUrl = __ut.getConnect(keyArr, valueArr, {
                    type: 2,
                    ext: __extMap.get('searchExtDatas')
                });

                var detailUrl = __ut._encode(searchDetailUrl);
                var initUrl = __ut.getInitUrl();
                var currencyUrl = __ut.getCurrencyUrl(3);
                var url = initUrl + currencyUrl + "&evdl=" + detailUrl;
                // 将本次搜索日志id存入cookie
                var oId = __ut.getUrlParam(url, "id");
                __ut._addCookie("_snms", oId, "/", "", "");
                __ut._httpGifSend(url);
            } catch (e) {

            }
        }

        _sendOrderDatas = function (orderDatas) {
            //没有订单编号就不发送
            if (!orderDatas || orderDatas == "") {
                return false;
            }

            var order_url = __ut.getInitUrl();
            var currencyUrl = __ut.getCurrencyUrl(11);
            var orderInfo = sa_orderInfo;
            var pvId = _saPageViewId;
            var searchId = __ut._getCookie(_snms);
            if (!searchId && searchId == null || searchId == "") {
                searchId = _no_data_tag;
            }

            var keyArr = ["pvid", "order_id", "search_id", "item_id"];
            var valueArr = [pvId, orderDatas, searchId, orderInfo];
            var detailUrl = __ut.getConnect(keyArr, valueArr, {
                type: 2
            });
            detailUrl = __ut._encode(detailUrl);
            var url = order_url + currencyUrl + "&evdl=" + detailUrl;
            __ut._httpGifSend(url);
        }


        //为云购物车追加发送订单信息的接口
        _sendOrderInfo = function (e, d) {
            var orderId = e,
                orderInfo = d,
                _param = null;
            if (__ut.isObjArgument(e)) {
                orderId = e.orderId;
                orderInfo = e.orderInfo;
                /**
                 * 取 自定义字段
                 */
                e = __ut._deleteKey(e, ['orderId', 'orderInfo'])
                if (!__ut.isEmptyObj(e)) {
                    _param = e;
                }
            }

            if (!orderId) {
                return false;
            }
            if (!orderInfo) {
                orderInfo = orderId;
            }
            try {
                var order_url = __ut.getInitUrl();
                var currencyUrl = __ut.getCurrencyUrl(11);
                var pvId = _saPageViewId;
                var searchId = __ut._getCookie(_snms);
                if (!searchId && searchId == null || searchId == "") {
                    searchId = _no_data_tag;
                }
                var keyArr = ["pvid", "order_id", "search_id", "item_id"];
                var valueArr = [pvId, orderId, searchId, orderInfo];
                /**
                 *  自动拼接 用户自定义字段
                 */

                var detailUrl = _param ?
                    __ut.getConnect(keyArr, valueArr, {
                        type: 2,
                        ext: _param
                    }) :
                    __ut.getConnect(keyArr, valueArr, {
                        type: 2
                    });
                detailUrl = __ut._encode(detailUrl);
                var url = order_url + currencyUrl + "&evdl=" + detailUrl;
                __ut._httpGifSend(url);
            } catch (e) {}
        }

        _sendRegisterDatas = function (registerDatas) {
            var register_url = __ut.getInitUrl(),
                currencyUrl = __ut.getCurrencyUrl(4),
                pvId = _saPageViewId;
            var keyArr = ["pvid", "registerId"];
            var valueArr = [pvId, registerDatas];
            var detailUrl = __ut.getConnect(keyArr, valueArr, {
                type: 2
            });

            detailUrl = __ut._encode(detailUrl);
            var url = register_url + currencyUrl + "&evdl=" + detailUrl;
            __ut._httpGifSendPassH5(url);
        }
        /**
         * 库存日志
         * 格式更改
         * 20180528
         */
        function getStoragekDetailUrl(storageDatas) {
            var storageDetailUrl = "";
            try {
                var keyArr = ['pvid', 'productid', "city", 'shipOffset', 'supplierID', 'deliverytype', 'districtId', 'manageInvFlag', 'operatetype', 'productStatus', 'productStatusDesc', 'provinceId', 'storeid', 'shname', 'suppliernewID', 'vendorType', 'os', 'ter', 'delivery'];
                //2015-07-02追加需求
                var provinceId = '',
                    districtId = '',
                    vendorType = '',
                    manageInvFlag = '',
                    productStatus = '',
                    hid_operatetype = '',
                    hid_deliverytype = "",
                    productStatusDesc = '',
                    deliverTime = '';
                // if (!basicIds || basicIds == "") {
                //     basicIds = loginUserName + _tag + memberID + _tag + "" + _tag + "";
                // }

                var paramsArr = storageDatas.split("|")
                //商品编码
                var itemIdValue = paramsArr[0];
                //送货城市(改名称)
                var CityIdValue = paramsArr[1];
                //预计到货天数
                var shipOffsetValue = paramsArr[2];
                //物流送达时间 改成6月底上线
                // var deliveryValue = '';
                // var delivery = document.getElementById('delivery');
                // if (delivery) {
                //     deliveryValue = delivery.value;
                // }
                //供应商编码
                var _iSupplierId = document.getElementById("supplierID"),
                    _supplierId = _iSupplierId ? _iSupplierId.value.replace(/\|/g, " ") : "can not get supplierId";
                // 配送方式
                var hid_deliverytype = document.getElementById('deliverytype');
                if (hid_deliverytype) {
                    hid_deliverytype = hid_deliverytype.value;
                }
                //区县
                var hid_mdmDistrictId = document.getElementById('mdmDistrictId');
                if (hid_mdmDistrictId) {
                    districtId = hid_mdmDistrictId.value;
                }
                //是否先采后销
                var hid_manageInvFlag = document.getElementById('manageInvFlag');
                if (hid_manageInvFlag) {
                    manageInvFlag = hid_manageInvFlag.value;
                }
                // 销售模式
                var hid_operateInvtype = document.getElementById('operatetype');
                if (hid_operateInvtype) {
                    hid_operatetype = hid_operateInvtype.value;
                }
                //销售状态
                var hid_productStatus = document.getElementById('productStatus');
                if (hid_productStatus) {
                    productStatus = hid_productStatus.value;
                }
                //暂不销售原因
                var hid_productStatusDesc = document.getElementById('productStatusDesc');
                if (hid_productStatusDesc) {
                    productStatusDesc = hid_productStatusDesc.value;
                }
                //省份
                var hid_mdmProvinceId = document.getElementById('mdmProvinceId');
                if (hid_mdmProvinceId) {
                    provinceId = hid_mdmProvinceId.value;
                }

                //物流送达时间
                var hid_deliveryTime = document.getElementById('delivery');
                if (hid_deliveryTime) {
                    deliverTime = hid_deliveryTime.value;
                }
                //*********************************************************
                /**【添加时间】2015.05.18发布需求追加
                 /**【功能概述】开放平台需将自营商品再细分到自营旗舰店和非旗舰；
                 /**            需在库存日志新增自营店铺编码、自营店铺名称字段采集
                 **/
                //自营店铺编码
                var shop_code = "";
                //自营店铺名称
                var shop_name = "";
                var hidShopCode = document.getElementById('shop_code');
                var hidShopName = document.getElementById('shop_name');
                if (hidShopCode) {
                    shop_code = hidShopCode.value;
                }

                if (hidShopName) {
                    shop_name = hidShopName.value;
                    shop_name = __ut._encode(shop_name);
                }
                //*********************************************************
                //2015-12-14追加需求 suxin  3.4.8
                var supplierNewId = "";

                //供应商字段
                var hid_supplierNewId = document.getElementById('suppliernewID');
                if (hid_supplierNewId) {
                    supplierNewId = hid_supplierNewId.value;
                }
                var hid_vendorType = document.getElementById('vendorType');
                if (hid_vendorType) {
                    vendorType = hid_vendorType.value;
                }

                var pvId = _saPageViewId;
                var valueArr = [pvId, itemIdValue, CityIdValue, shipOffsetValue, _supplierId, hid_deliverytype, districtId, manageInvFlag, hid_operatetype, productStatus, productStatusDesc, provinceId, shop_code, shop_name, supplierNewId, vendorType, OS, Ter, deliverTime];

                storageDetailUrl = __ut.getConnect(keyArr, valueArr, {
                    type: 2,
                    ext: __extMap.get('storeExtData')
                });
            } catch (e) {}
            return storageDetailUrl;
        };
        _sendStorageDatas = function (storageDatas) {

            var initUrl = __ut.getInitUrl();
            var currencyUrl = __ut.getCurrencyUrl(8);
            var detailUrl = getStoragekDetailUrl(storageDatas);
            detailUrl = __ut._encode(detailUrl);
            var url = initUrl + currencyUrl + "&evdl=" + detailUrl;;
            __ut._httpGifSend(url);
        }

        function _saSendCookieMapping() {
            if (!__ssaIsGaPage) {
                return false;
            }
            var _snmaMap = _getSnmaMapFromCookie();
            var cookieID = _snmaMap.get('visitorid');
            var ajax = new SaAjax;
            var jzDspUrl = '//cms.gtags.net/p?a=20&xid=' + cookieID;
            //2016/04/11需求
            var pyDspUrl = '//cm.ipinyou.com/suning/cms.gif?sid=' + cookieID;
            var mediaVUrl = '//ckmap.mediav.com/m?tid=613&tck=' + cookieID;
            //sina new cookie mapping
            var sinaUrl = '//r.dmp.sina.com.cn/cm/write?cid=19922&platform=pc&sid=' + cookieID;

            ajax.sendByInnerImage(jzDspUrl);
            //2016/04/11需求
            ajax.sendByInnerImage(pyDspUrl);
            ajax.sendByInnerImage(mediaVUrl);
            ajax.sendByInnerImage(sinaUrl);
        }


        //###########################################################
        //客户端自定义发送数据接口
        function SaCustomDataUtil() {
            var oThis = this;

            /**
             * 发送数据接口
             *  event: 事件名
             *  keys: key集合,多个使用逗号分隔
             *  values: value结合,多个使用逗号分隔
             *  key的格式和value的格式必须保持一致，否则不予采集发送
             *  数据格式： key01$@$key02$@$key03|value01$@$value02$@$value03
             */
            oThis.sendData = function (e, d, f) {
                var event = e,
                    keys = d,
                    values = f,
                    _param = null,
                    keysArr = [],
                    valuesArr = [];

                if (__ut.isObjArgument(e)) {
                    event = e.eventType,
                        keys = e.keys ? e.keys : "",
                        values = e.values ? e.values : "";
                    e = __ut._deleteKey(e, ['eventType', 'keys', 'values'])
                    if (!__ut.isEmptyObj(e)) {
                        _param = e;
                    }
                }
                if (event == undefined || event == null || event == "") {
                    return false;
                }
                //用户不传keys和values字段也可以上报
                if (keys && values) {
                    keysArr = keys.split(",");
                    valuesArr = values.split(",");
                    if (keysArr.length != valuesArr.length) {
                        return false;
                    }
                }
                //如果keys，values都没有值，并且扩展参数也没有值，则不发日志
                if(keysArr.length == 0 && _param == null){
                    return;
                }
                var customeventDetailUrl = __ut.getConnect(keysArr, valuesArr, {
                    type: 2,
                    ext: _param // 透传字段
                });
                //pvId(访问数据唯一标识)
                var pvId = _saPageViewId;

                var detailUrl = __ut._encode(customeventDetailUrl);
                var initUrl = __ut.getInitUrl();
                var currencyUrl = __ut.getCurrencyUrl(13);
                var url = initUrl + currencyUrl + "&event_type=" + event + "&evdl=" + detailUrl + "&pvid=" + pvId;
                __ut._httpGifSend(url);
            }
        }

        //###########################################################

        //###########################################################
        //页面销售数据cookie操作--开始
        /*
         * 页面销售数据的cookie信息保存的数据格式：
         * 会员编号01:商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位;
         * 会员编号02:商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位;
         * 会员编号03:商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位,商品编码_供应商编码|pvId|点击坑位;
         */
        function PageSaleCookieUtil() {
            var oThis = this;

            //页面销售数据的cookie名称
            var pageSaleCookieName = "_saPageSaleInfo";
            //页面销售数据的cookie信息的最大长度(2048个字符)
            var pageSaleCookieMaxLength = 2048;
            //Cookie中保存商品的总个数不超过30个
            var goodsMaxCount = 30;
            //页面销售数据的cookie信息的过期时间(单位毫秒),默认保存1个月
            var pageSaleCookieMaxExpiresTimeMill = 1 * 30 * 24 * 60 * 60 * 1000;

            //空值
            var _temp = "-";
            //每个参数之间的分隔符
            var eachParamSplit = "|";
            //会员编号与商品信息之间的分隔符
            var custNoGoodsSplit = ":";
            //多组商品之间的分隔符
            var goodsSplit = ",";
            //每个"会员商品信息组"之间的分隔符
            var custNoSplit = ";";

            var HashMap = function () {
                var size = 0;

                var entry = new Object();

                this.getThis = function () {
                    return entry;
                }

                //add
                this.put = function (key, value) {
                    if (!this.containsKey(key)) {
                        size++;
                    }
                    entry[key] = value;
                }

                //get
                this.get = function (key) {
                    if (this.containsKey(key)) {
                        return entry[key];
                    } else {
                        return null;
                    }
                }

                //delete
                this.remove = function (key) {
                    if (delete entry[key]) {
                        size--;
                    }
                }

                //containsKey
                this.containsKey = function (key) {
                    return (key in entry);
                }

                //containsValue
                this.containsValue = function (value) {
                    for (var prop in entry) {
                        if (entry[prop] == value) {
                            return true;
                        }
                    }
                    return false;
                }

                //get all values
                this.values = function () {
                    var values = new Array(size);
                    for (var prop in entry) {
                        values.push(entry[prop]);
                    }
                    return values;
                }

                //get all keys
                this.keys = function () {
                    var keys = new Array(size);
                    for (var prop in entry) {
                        keys.push(prop);
                    }
                    return keys;
                }

                //size
                this.size = function () {
                    return size;
                }
            }

            /**
             * 保存到cookie操作，包括添加和更新操作
             * 内部会自动采集"会员编号"，根据"会员编号"和"goodsId"进行操作
             * @param goodsId: 商品编码_供应商编码
             * @param fromPoint: 来自页面的点击坑位信息
             */
            oThis.saveCookie = function (goodsId, fromPoint) {
                try {
                    if (goodsId == undefined || goodsId == null) {
                        goodsId = _temp;
                    }
                    if (fromPoint == undefined || fromPoint == null) {
                        fromPoint = _temp;
                    }

                    //pvId(访问数据唯一标识)
                    var pvId = _saPageViewId;

                    //会员编号(会员唯一标识)
                    var custNo = memberID;

                    //从cookie中获取会员登录状态，判断会员是否登录
                    //如果有值,则认为是登录，无值认为没有登录
                    if (loginStatus == undefined || loginStatus == null || loginStatus == "" || loginStatus == _temp) {
                        custNo = _temp;
                    }
                    //页面销售数据的cookie信息中是否已经存在了当前登录的会员编号？
                    var isCustNoExistInPageSaleCookie = false;

                    //页面销售数据的cookie信息
                    var pageSaleCookieInfo = __ut._getCookie(pageSaleCookieName);

                    //如果cookie信息为空
                    if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                        var goodsInfoArr = goodsId + eachParamSplit + pvId + eachParamSplit + fromPoint;
                        pageSaleCookieInfo = custNo + custNoGoodsSplit + goodsInfoArr;
                    } else {
                        //取得cookie中的所有会员编号
                        //所有会员编号
                        var custNoArr = new Array();
                        var custGoodsInfoArr = pageSaleCookieInfo.split(custNoSplit);
                        for (var x = 0; x < custGoodsInfoArr.length; x++) {
                            var custGoodsInfo = custGoodsInfoArr[x];
                            if (!custGoodsInfo) {
                                continue;
                            }
                            //会员编号
                            var _custNo = custGoodsInfo.substring(0, custGoodsInfo.indexOf(custNoGoodsSplit));
                            if (_custNo != _temp) {
                                if (custNo == _custNo) {
                                    isCustNoExistInPageSaleCookie = true;
                                }
                            }
                            custNoArr.push(_custNo);
                        }

                        //页面销售数据的cookie信息中不经存在当前登录的会员编号
                        if (!isCustNoExistInPageSaleCookie) {
                            if (custNo && custNo != "" && custNo != _temp) {
                                custNoArr.push(custNo);
                            }

                        }

                        //【第1步】用HashMap保存购买的商品信息
                        //key:会员编号:商品编码_供应商编码
                        //value:pvId|点击坑位
                        var custGoodsInfoMap = _cookieInfo2HashMap(pageSaleCookieInfo);
                        var goodsCount = getGoodsCount();
                        if (goodsCount >= goodsMaxCount) {
                            //删除最早购买的商品信息，保证最新的商品信息添加到cookie中
                            var _keys = custGoodsInfoMap.keys();
                            var _firstKey = "";
                            for (var x = 0; x < _keys.length; x++) {
                                _firstKey = _keys[x];
                                if (_firstKey && _firstKey != null && _firstKey != "") {
                                    break;
                                }
                            }
                            custGoodsInfoMap.remove(_firstKey);
                        }

                        //----------------------------------------------------------------
                        //【第2步】存放新的商品信息 和 点击坑位信息
                        //key=会员编号:商品编码_供应商编码
                        var _newGoodsKey = custNo + custNoGoodsSplit + goodsId;
                        //value = pvId|点击坑位
                        var _newGoodsValue = pvId + eachParamSplit + fromPoint;
                        custGoodsInfoMap.put(_newGoodsKey, _newGoodsValue);

                        //----------------------------------------------------------------
                        //【第3步】把HashMap转换为String
                        pageSaleCookieInfo = _hashMap2CookieStr(custNoArr, custGoodsInfoMap);
                    }


                } catch (e) {

                }
            }

            /**
             * 从cookie中删除某个商品的相关信息
             * 内部会自动采集"会员编号"，根据"会员编号"和"goodsId"进行操作
             * @param goodsIds 商品编码_供应商编码,
             *                 商品多个的时候，每个商品之间用竖线"|"分隔,例如：
             *                 125522947_123456|125522948_234567|125522949_45678
             */
            oThis.deleteCookie = function (goodsIds) {
                try {
                    if (goodsIds == undefined || goodsIds == null || goodsIds == "" || goodsIds == _temp) {
                        return false;
                    }

                    //pvId(访问数据唯一标识)
                    var pvId = _saPageViewId;

                    //会员编号(会员唯一标识)
                    var custNo = memberID;

                    //从cookie中获取会员登录状态，判断会员是否登录
                    //如果有值,则认为是登录，无值认为没有登录
                    if (loginStatus == undefined || loginStatus == null || loginStatus == "" || loginStatus == _temp) {
                        custNo = _temp;
                    }

                    //页面销售数据的cookie信息
                    var pageSaleCookieInfo = __ut._getCookie(pageSaleCookieName);

                    //如果cookie信息为空
                    if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                        return true;
                    }

                    //页面销售数据的cookie信息中是否已经存在了当前登录的会员编号？
                    var isCustNoExistInPageSaleCookie = false;

                    //取得cookie中的所有会员编号
                    //所有会员编号
                    var custNoArr = new Array();
                    var custGoodsInfoArr = pageSaleCookieInfo.split(custNoSplit);
                    for (var x = 0; x < custGoodsInfoArr.length; x++) {
                        var custGoodsInfo = custGoodsInfoArr[x];
                        //会员编号
                        var _custNo = custGoodsInfo.substring(0, custGoodsInfo.indexOf(custNoGoodsSplit));
                        if (_custNo != _temp) {
                            if (custNo == _custNo) {
                                isCustNoExistInPageSaleCookie = true;
                            }
                        }
                        custNoArr.push(_custNo);
                    }
                    //页面销售数据的cookie信息中不经存在当前登录的会员编号
                    if (!isCustNoExistInPageSaleCookie) {
                        if (custNo && custNo != "" && custNo != _temp) {
                            custNoArr.push(custNo);
                        }
                    }

                    //【第1步】用HashMap保存购买的商品信息
                    //key:会员编号:商品编码_供应商编码
                    //value:pvId|点击坑位
                    var custGoodsInfoMap = _cookieInfo2HashMap(pageSaleCookieInfo);

                    //----------------------------------------------------------------
                    //【第2步】删除指定的商品信息
                    var goodIdsArr = goodsIds.split(eachParamSplit);
                    for (var x = 0; x < goodIdsArr.length; x++) {
                        var goodsId = goodIdsArr[x];
                        if (goodsId == "" || goodsId == _temp) {
                            continue;
                        }

                        //key=会员编号:商品编码_供应商编码
                        var _goodsKey = custNo + custNoGoodsSplit + goodsId;
                        custGoodsInfoMap.remove(_goodsKey);
                    }

                    //----------------------------------------------------------------
                    //【第3步】把HashMap转换为String
                    pageSaleCookieInfo = _hashMap2CookieStr(custNoArr, custGoodsInfoMap);


                } catch (e) {
                    return false;
                }
                return true;
            }

            /**
             * 删除某个会员的所有商品相关信息
             * 内部会自动采集"会员编号"，根据"会员编号"进行操作
             */
            oThis.deleteCustCookie = function () {
                try {
                    //会员编号(会员唯一标识)
                    var custNo = memberID;

                    //从cookie中获取会员登录状态，判断会员是否登录
                    //如果有值,则认为是登录，无值认为没有登录
                    if (loginStatus == undefined || loginStatus == null || loginStatus == "" || loginStatus == _temp) {
                        custNo = _temp;
                    }

                    if (custNo == _temp) {
                        return false;
                    }

                    //页面销售数据的cookie信息
                    var pageSaleCookieInfo = __ut._getCookie(pageSaleCookieName);

                    //如果cookie信息为空
                    if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                        return false;
                    }

                    //key: 会员编号
                    //value:商品编码_供应商编码|pvId|点击坑位....
                    var custNo_GoodsInfoMap = cookieInfo2HashMap(pageSaleCookieInfo);
                    if (!custNo_GoodsInfoMap || custNo_GoodsInfoMap == null) {
                        return false;
                    }

                    //删除当前会员的所有商品信息
                    custNo_GoodsInfoMap.remove(custNo);

                    //将"custNo_GoodsInfoMap"转化为String
                    pageSaleCookieInfo = hashMap2CookieStr(custNo_GoodsInfoMap);


                } catch (e) {
                    return false;
                }
                return true;
            }

            /**
             * 清除页面销售数据的cookie信息
             */
            oThis.clearCookie = function () {
                try {
                    __ut._delCookie(pageSaleCookieName);
                } catch (e) {}
            }

            /**
             *将当前的会员账号替换原来的"-"
             *该接口在会员登陆后调用
             */
            oThis.updateCustNo = function () {
                try {
                    //会员编号(会员唯一标识)
                    var custNo = memberID;

                    //从cookie中获取会员登录状态，判断会员是否登录
                    //如果有值,则认为是登录，无值认为没有登录
                    if (loginStatus == undefined || loginStatus == null || loginStatus == "" || loginStatus == _temp) {
                        custNo = _temp;
                    }

                    if (custNo == _temp) {
                        return false;
                    }

                    //页面销售数据的cookie信息
                    var pageSaleCookieInfo = __ut._getCookie(pageSaleCookieName);

                    //如果cookie信息为空
                    if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                        return false;
                    }

                    //key: 会员编号
                    //value:商品编码_供应商编码|pvId|点击坑位....
                    var custNo_GoodsInfoMap = cookieInfo2HashMap(pageSaleCookieInfo);
                    if (custNo_GoodsInfoMap == null || custNo_GoodsInfoMap.size() == 0) {
                        return false;
                    }
                    var newCustNo_GoodsInfoMap = new HashMap();

                    //将当前登录的会员信息写入到cookie中
                    //写入原理：替换所有key为"-"的信息
                    var _keys = custNo_GoodsInfoMap.keys();
                    for (var x = 0; x < _keys.length; x++) {
                        var key = _keys[x];
                        if (!key) {
                            continue;
                        }
                        if (key == _temp) {
                            var _oriInfo = custNo_GoodsInfoMap.get(custNo);
                            if (_oriInfo && _oriInfo != null && _oriInfo != "") {
                                newCustNo_GoodsInfoMap.put(custNo, _oriInfo + goodsSplit + custNo_GoodsInfoMap.get(key));
                            } else {
                                newCustNo_GoodsInfoMap.put(custNo, custNo_GoodsInfoMap.get(key));
                            }
                        } else {
                            var _oriInfo = newCustNo_GoodsInfoMap.get(key);
                            if (_oriInfo && _oriInfo != null && _oriInfo != "") {
                                newCustNo_GoodsInfoMap.put(key, _oriInfo + goodsSplit + custNo_GoodsInfoMap.get(key));
                            } else {
                                newCustNo_GoodsInfoMap.put(key, custNo_GoodsInfoMap.get(key));
                            }
                        }
                    }

                    //将"custNo_GoodsInfoMap"转化为String
                    pageSaleCookieInfo = hashMap2CookieStr(newCustNo_GoodsInfoMap);


                } catch (e) {
                    return false;
                }
                return true;
            }

            /**
             * 将订单中的商品信息发送到SA日志服务器
             * @param orderId  订单编号
             * @param goodsIds 订单里的"商品编码_供应商编码",
             *                 商品多个的时候，每个商品之间用竖线"|"分隔,例如：
             *                 125522947_123456|125522948_234567|125522949_45678
             */
            oThis.sendCookie = function (orderId, goodsIds) {
                if (!orderId || orderId == null || orderId == "") {
                    return false;
                }

                if (!goodsIds || goodsIds == null || goodsIds == "") {
                    return false;
                }

                /**flg的各种取值含义：
                 *  1：匹配上
                 *  2：用户没有登录，无法匹配
                 *  3：cookie信息为空
                 *  4：cookie信息不为空，但是没有匹配登录用户选购的商品信息
                 *  5：cookie信息不为空，但是没有匹配到用户选择付款的商品信息
                 *  6: 接口调用异常信息
                 **/
                try {
                    //页面销售数据的cookie信息
                    var pageSaleCookieInfo = __ut._getCookie(pageSaleCookieName);

                    //---------------------------------------------------
                    //直接往后端发送相关数据
                    try {
                        var _goodIds = "",
                            _psCookieInfo = "";
                        if (goodsIds) {
                            _goodIds = encodeURIComponent(goodsIds);
                        }

                        if (pageSaleCookieInfo) {
                            _psCookieInfo = encodeURIComponent(pageSaleCookieInfo);
                        }

                        var _testUrl = _snProtocol + _saServer + "/ajaxPageSale.gif";
                        _testUrl = _testUrl + "?" + "pvId=" + _saPageViewId + "&loginUserName=" + loginUserName + "&memberId=" + memberID +
                            "&loginStatus=" + loginStatus + "&orderId=" + orderId + "&goodIds=" + _goodIds +
                            "&ck=" + _psCookieInfo;
                        __ut._httpGifSendPassH5(_testUrl);
                    } catch (err) {

                    }

                    //如果会员没有登录
                    if (memberID == _temp) {
                        return false;
                    }

                    //如果cookie信息为空
                    if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                        return false;
                    }

                    //key: 会员编号
                    //value:商品编码_供应商编码|pvId|点击坑位....
                    var custNo_GoodsInfoMap = cookieInfo2HashMap(pageSaleCookieInfo);
                    if (!custNo_GoodsInfoMap || custNo_GoodsInfoMap == null || custNo_GoodsInfoMap.size() == 0) {
                        return false;
                    }

                    //取得当前会员的所有商品信息
                    var custNo_GoodsInfo = custNo_GoodsInfoMap.get(memberID);
                    if (custNo_GoodsInfo == undefined || custNo_GoodsInfo == null ||
                        custNo_GoodsInfo == _temp || custNo_GoodsInfo == "") {
                        return false;
                    }

                    //cookie中属于订单中的商品信息
                    var orderGoodsInfo = "";
                    var orderGoodsInfoArr = new Array();

                    //商品详细信息(数组)
                    var goodsInfoArr = custNo_GoodsInfo.split(goodsSplit);
                    //商品编码_供应商编码(数组)
                    var goodsIdsArr = goodsIds.split(eachParamSplit);
                    for (var x = 0; x < goodsIdsArr.length; x++) {
                        var goodsId = goodsIdsArr[x];
                        if (!goodsId || goodsId == "" || goodsId == _temp) {
                            continue;
                        }

                        for (var y = 0; y < goodsInfoArr.length; y++) {
                            var goodsIdPvIdFromPoint = goodsInfoArr[y];
                            if (!goodsIdPvIdFromPoint || goodsIdPvIdFromPoint == "" || goodsIdPvIdFromPoint == _temp) {
                                continue;
                            }

                            if (goodsIdPvIdFromPoint.indexOf(goodsId) == -1) {
                                continue;
                            }

                            orderGoodsInfoArr.push(goodsIdPvIdFromPoint);

                            if (orderGoodsInfo == "") {
                                orderGoodsInfo = goodsIdPvIdFromPoint;
                            } else {
                                orderGoodsInfo = orderGoodsInfo + goodsSplit + goodsIdPvIdFromPoint;
                            }
                            break;
                        }
                    }

                    if (orderGoodsInfo == "" || orderGoodsInfo == _temp) {
                        return false;
                    }


                    //-----------------------------------------------------------------
                    //发送完后，删除该条信息
                    for (var x = 0; x < orderGoodsInfoArr.length; x++) {
                        var _orderGoodsInfo = orderGoodsInfoArr[x];
                        if (!_orderGoodsInfo || _orderGoodsInfo == "") {
                            continue;
                        }

                        //前面几个是商品信息末尾有","的，而如果是最后一个的商品信息末尾是没有","的
                        if (custNo_GoodsInfo.indexOf(_orderGoodsInfo + goodsSplit) != -1) {
                            custNo_GoodsInfo = custNo_GoodsInfo.replace(_orderGoodsInfo + goodsSplit, "");
                        } else {
                            custNo_GoodsInfo = custNo_GoodsInfo.replace(_orderGoodsInfo, "");
                        }
                    }

                    //去掉末尾的","
                    if (custNo_GoodsInfo != "" && custNo_GoodsInfo != _temp) {
                        if (custNo_GoodsInfo.lastIndexOf(goodsSplit) != -1) {
                            custNo_GoodsInfo = custNo_GoodsInfo.substring(0, custNo_GoodsInfo.length - 1);
                        }
                    }
                    //更新当前会员的剩下的商品信息
                    custNo_GoodsInfoMap.put(memberID, custNo_GoodsInfo);

                    //将"custNo_GoodsInfoMap"转化为String
                    pageSaleCookieInfo = hashMap2CookieStr(custNo_GoodsInfoMap);


                } catch (e) {

                }
                return true;
            }

            //取得cookie中的商品个数
            function getGoodsCount() {
                //页面销售数据的cookie信息
                var pageSaleCookieInfo = _sa_util._getCookie(pageSaleCookieName);

                //如果cookie信息为空
                if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                    return 0;
                }

                var memberGoodsInfoArr = pageSaleCookieInfo.split(custNoSplit);
                if (memberGoodsInfoArr == null || memberGoodsInfoArr.length == 0) {
                    return 0;
                }
                var goodsCount = 0;
                var memberGoodsInfo = "";
                try {
                    for (var i = 0; i < memberGoodsInfoArr.length; i++) {
                        memberGoodsInfo = memberGoodsInfoArr[i];
                        if (memberGoodsInfo == null || memberGoodsInfo == "") {
                            continue;
                        }

                        var memberGoodsArr = memberGoodsInfo.split(custNoGoodsSplit);
                        if (memberGoodsArr == null || memberGoodsArr.length < 2) {
                            continue;
                        }
                        var goodsInfo = memberGoodsArr[1];
                        var goodsArr = goodsInfo.split(goodsSplit);
                        goodsCount = goodsCount + goodsArr.length;
                    }
                } catch (e) {

                }

                return goodsCount;
            }

            /**
             * cookie信息转化成HashMap
             * key:会员编号
             * value:商品编码_供应商编码|pvId|点击坑位,...
             */
            function cookieInfo2HashMap(pageSaleCookieInfo) {
                //如果cookie信息为空
                if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                    return null;
                }

                //key: 会员编号
                //value:商品编码_供应商编码|pvId|点击坑位....
                var custNo_GoodsInfoMap = new HashMap();
                var custGoodsInfoArr = pageSaleCookieInfo.split(custNoSplit);
                for (var x = 0; x < custGoodsInfoArr.length; x++) {
                    var custGoodsInfo = custGoodsInfoArr[x];
                    if (!custGoodsInfo || custGoodsInfo == "") {
                        continue;
                    }
                    //会员编号
                    var _custNo = custGoodsInfo.substring(0, custGoodsInfo.indexOf(custNoGoodsSplit));

                    //该会员对应的所有商品信息
                    var _allGoodsInfo = custGoodsInfo.substring(custGoodsInfo.indexOf(custNoGoodsSplit) + 1);

                    custNo_GoodsInfoMap.put(_custNo, _allGoodsInfo);
                }

                return custNo_GoodsInfoMap;
            }

            /**
             * HashMap转Cookie字符串信息
             * @param custNo_GoodsInfoMap
             *           key=  会员编号
             *           value=商品编码_供应商编码|pvId|点击坑位信息,...
             */
            function hashMap2CookieStr(custNo_GoodsInfoMap) {
                //将"custNo_GoodsInfoMap"转化为String
                var _newCookieInfo = "";
                if (!custNo_GoodsInfoMap || custNo_GoodsInfoMap == null || custNo_GoodsInfoMap.size() == 0) {
                    return _newCookieInfo;
                }

                try {
                    if (custNo_GoodsInfoMap.size() == 1) {
                        var _keys = custNo_GoodsInfoMap.keys();
                        if (!custNo_GoodsInfoMap.get(_keys[0]) && !custNo_GoodsInfoMap.get(_keys[1])) {
                            return _newCookieInfo;
                        }
                        if ((custNo_GoodsInfoMap.get(_keys[0]) == "" || custNo_GoodsInfoMap.get(_keys[0]) == _temp) &&
                            (custNo_GoodsInfoMap.get(_keys[1]) == "" || custNo_GoodsInfoMap.get(_keys[1]) == _temp)) {
                            return _newCookieInfo;
                        }
                    }
                } catch (err) {}


                var _keys = custNo_GoodsInfoMap.keys();
                for (var x = 0; x < _keys.length; x++) {
                    //会员编号
                    var _custNo = _keys[x];
                    if (!_custNo) {
                        continue;
                    }
                    //商品编码_供应商编码|pvId|点击坑位...
                    var _goodsId_PvId_FromPonit = custNo_GoodsInfoMap.get(_custNo);
                    if (!_goodsId_PvId_FromPonit || _goodsId_PvId_FromPonit == "" || _goodsId_PvId_FromPonit == _temp) {
                        continue;
                    }
                    if (_newCookieInfo == "" || _newCookieInfo == _temp) {
                        _newCookieInfo = _custNo + custNoGoodsSplit + _goodsId_PvId_FromPonit;
                    } else {
                        _newCookieInfo = _newCookieInfo + custNoSplit + (_custNo + custNoGoodsSplit + _goodsId_PvId_FromPonit);
                    }
                }

                return _newCookieInfo;
            }

            /**
             * cookie信息转化成HashMap
             * key:会员编号:商品编码_供应商编码
             * value:pvId|点击坑位
             */
            function _cookieInfo2HashMap(pageSaleCookieInfo) {
                if (!pageSaleCookieInfo || pageSaleCookieInfo == _temp || pageSaleCookieInfo == "") {
                    return new HashMap();
                }

                //key:会员编号:商品编码_供应商编码
                //value:pvId|点击坑位
                var custGoodsInfoMap = new HashMap();
                var custGoodsInfoArr = pageSaleCookieInfo.split(custNoSplit);
                for (var x = 0; x < custGoodsInfoArr.length; x++) {
                    var custGoodsInfo = custGoodsInfoArr[x];
                    if (!custGoodsInfo || custGoodsInfo == "" || custGoodsInfo == _temp) {
                        continue;
                    }

                    //会员编号
                    var _custNo = custGoodsInfo.substring(0, custGoodsInfo.indexOf(custNoGoodsSplit));

                    //该会员对应的所有商品信息
                    var _allGoodsInfo = custGoodsInfo.substring(custGoodsInfo.indexOf(custNoGoodsSplit) + 1);
                    var _allGoodsInfoArr = _allGoodsInfo.split(goodsSplit);
                    for (var y = 0; y < _allGoodsInfoArr.length; y++) {
                        var _goodsInfo = _allGoodsInfoArr[y];
                        if (!_goodsInfo || _goodsInfo == "" || _goodsInfo == _temp) {
                            continue;
                        }
                        var _goodsId = _goodsInfo.substring(0, _goodsInfo.indexOf(eachParamSplit));

                        //key=会员编号:商品编码_供应商编码
                        var _key = _custNo + custNoGoodsSplit + _goodsId;
                        //value = pvId|点击坑位
                        var _value = _goodsInfo.substring(_goodsInfo.indexOf(eachParamSplit) + 1);

                        custGoodsInfoMap.put(_key, _value);
                    }
                }

                return custGoodsInfoMap;
            }

            /**
             * HashMap转Cookie字符串信息
             * @param custNoArr 所有会员编号
             * @param custGoodsInfoMap
             *           key=  会员编号:商品编码_供应商编码
             *           value=pvId|点击坑位信息
             */
            function _hashMap2CookieStr(custNoArr, custGoodsInfoMap) {
                var _newCookieInfo = "";
                if (!custGoodsInfoMap || custGoodsInfoMap == null || custGoodsInfoMap.size() == 0) {
                    return _newCookieInfo;
                }

                try {
                    if (custGoodsInfoMap.size() == 1) {
                        var _keys = custGoodsInfoMap.keys();
                        if (!custGoodsInfoMap.get(_keys[0]) && !custGoodsInfoMap.get(_keys[1])) {
                            return _newCookieInfo;
                        }
                        if ((custGoodsInfoMap.get(_keys[0]) == "" || custGoodsInfoMap.get(_keys[0]) == _temp) &&
                            (custGoodsInfoMap.get(_keys[1]) == "" || custGoodsInfoMap.get(_keys[1]) == _temp)) {
                            return _newCookieInfo;
                        }
                    }
                } catch (err) {}


                //key: 会员编号
                //value:商品编码_供应商编码|pvId|点击坑位....
                var custNo_GoodsInfoMap = new __ut.saHashMap();
                for (var x = 0; x < custNoArr.length; x++) {
                    var _custNo = custNoArr[x];
                    if (!_custNo) {
                        continue;
                    }
                    var _keys = custGoodsInfoMap.keys();
                    for (var y = 0; y < _keys.length; y++) {
                        //会员编号：商品编码_供应商编码
                        var _custNo_GoodsId = _keys[y];
                        if (!_custNo_GoodsId) {
                            continue;
                        }
                        //pvID|点击坑位信息
                        var _pvId_FromPoint = custGoodsInfoMap.get(_custNo_GoodsId);
                        if (!_pvId_FromPoint || _pvId_FromPoint == null || _pvId_FromPoint == "") {
                            continue;
                        }
                        //同一个会员的商品信息归类
                        if (_custNo_GoodsId.substring(0, (_custNo + custNoGoodsSplit).length) == (_custNo + custNoGoodsSplit)) {
                            //商品编码_供应商编码
                            var _goodsId = _custNo_GoodsId.substring(_custNo_GoodsId.indexOf(custNoGoodsSplit) + 1);

                            //商品编码_供应商编码|pvId|点击坑位
                            var _goodsId_PvId_FromPonit = custNo_GoodsInfoMap.get(_custNo);

                            //如果已存在，拼接新的商品信息,用逗号分隔
                            if (_goodsId_PvId_FromPonit && _goodsId_PvId_FromPonit != _temp && _goodsId_PvId_FromPonit != "") {
                                _goodsId_PvId_FromPonit = _goodsId_PvId_FromPonit + goodsSplit + (_goodsId + eachParamSplit + _pvId_FromPoint);
                            } else {
                                _goodsId_PvId_FromPonit = _goodsId + eachParamSplit + _pvId_FromPoint;
                            }

                            custNo_GoodsInfoMap.put(_custNo, _goodsId_PvId_FromPonit);
                        }
                    }
                }

                //将"custNo_GoodsInfoMap"转化为String
                _newCookieInfo = hashMap2CookieStr(custNo_GoodsInfoMap);
                return _newCookieInfo;
            }
        }
        //页面销售数据cookie操作--结束
        //###########################################################


        //###########################################################
        //追加供用户调用的发送[访问信息PV]的接口
        function PageViewUtil() {

            var oThis = this;
            /**
             * 针对弹出框的PV采集数据接口
             * @from：从哪里弹出，比如按钮、图片、链接等的id,name等
             * @dialog：弹出框的标识，比如弹出框的id,name或者title等
             */
            oThis.sendData = function (from, dialog) {
                //现在时间
                var now = new Date();

                //1-pvId
                var _pvId = _saPageViewId;

                //2-访问者唯一标识
                //从cookie[_snma]中获取
                var _snmaMap = _getSnmaMapFromCookie();
                var _visitorId = _snmaMap.get('visitorid');

                //3-会话唯一标识
                //该值已经在字段12中获取了
                var _sessionId = sessionId;

                //4-会员编码
                var _memberID = memberID;

                //5-登录账号
                var _loginUserName = __ut._encode(loginUserName);

                //6-登陆用户类型：G=访客，R=注册用户。
                var _loginUserType = _loginUserName ? "R" : "G";

                //7-本次页面查看时间
                var _pageViewDateTime = now.getTime();

                //8-来自页面url
                var __fromUrl = _cutUrlToShort(_fromUrl);

                //9-来自页面title
                //js取不到，这里通常设置为空
                var __fromTitle = _cutUrlToShort(_fromTitle);

                //10-去向页面url
                var __toUrl = _cutUrlToShort(_toUrl);

                //11-去向页面title 对title进行base64编码
                var __toTitle = _base64.encode(_cutUrlToShort(_toTitle));

                //12-会话唯一标识、进入时间、离开时间、访问页面数
                //cookie[_snmb]中保存的是：会话唯一标识、进入时间、离开时间、访问页面数
                var snmbMap = _getSnmbMapFromCookie();
                var snmbStr = _getStrFromKeysArrAndValuesStr(_snmbKeysArr, snmbMap);

                //13-页面状态码
                //该字段在da_opt.js中已经定义和获取
                var _errCode = __ut._encode(_saErrorCode);

                //14-操作系统,浏览器,分辨率,屏幕颜色,是否支持flash,是否支持java
                var _browserInfo = __ut._encode(_getSnmx());

                //15-点击数据唯一标识
                //TODO 弹出页面采集数据时，临时cookie[_snmz]已经被主页面删除，这里取得为空
                var _snmzMap = _getSnmzMapFromCookie();
                var _snmz = _getStrFromKeysArrAndValuesStr(_snmzKeysArr, snmzMap);
                _snmz = __ut._encode(_snmz);

                //16-流量来源,媒介,内容,活动,主题
                //从cookie[_snsr]中获取
                var _trafficSource = trafficSource;

                //17-采集页面类型（wap/web）
                //该字段在da_opt.js中已经定义和获取
                var _pageType = _resourceType;

                //18-设备类型 PC/MI 2A等
                var _ter = Ter;

                //19-投放点ID，用于给市场SDM系统传数据
                var _ad_sp = __ut.SaPick(_toUrl, "ad_sp", "&");

                //20-子码编码:访问四级页面时,采集子码信息，,如通码进入,则采集随机传子码
                var _itemId = "";
                var proObject = document.getElementById("ga_itemDataBean_itemID");
                if (proObject) {
                    _itemId = proObject.value;
                }

                //21- 是否登陆标识	0代表是邮箱未认证的、1代表手机未认证、2代表的是邮箱和手机号都认证（PC或WAP）
                //从cookie[logonStatus]获取
                var _loginStatus = loginStatus;

                var _url = _snProtocol + _saServer + "/ajaxDialog.gif";
                _url = _url + "?" + "from=" + from + "&dialog=" + dialog + "&c1=" + _pvId + "&c2=" + _visitorId +
                    "&c3=" + _sessionId + "&c4=" + _memberID + "&c5=" + _loginUserName + "&c6=" + _loginUserType +
                    "&c7=" + _pageViewDateTime + "&c8=" + __fromUrl + "&c9=" + __fromTitle + "&c10=" + __toUrl +
                    "&c11=" + __toTitle + "&c12=" + snmbStr + "&c13=" + _errCode +
                    "&c14=" + _browserInfo + "&c15=" + _snmz + "&c16=" + _trafficSource + "&c17=" + _pageType +
                    "&c18=" + _ter + "&c19=" + _ad_sp + "&c20=" + _itemId + "&c21=" + _loginStatus;

                var extParams = "";
                //该字段在da_opt.js中已经定义和获取
                if (urlPattern) {
                    extParams = extParams + "&urlPattern=" + urlPattern;
                }

                if (urlPattern) {
                    extParams = extParams + "&urlPattern=" + urlPattern;
                }
                // SupplierId.
                var supplierID = document.getElementById("CSupplierID");
                supplierID = supplierID ? supplierID.value : "";
                if (supplierID) {
                    extParams = extParams + "&sperId=" + supplierID;
                }
                _url = _url + extParams;
                __ut._httpGifSendPassH5(_url);
            }
        }

    })();
    /**
     * 结束
     * 访问日志，搜索日志...原da_opt.js
     */
    /**
     * 开始
     * 原sa_click.js
     */
    (function () {
        if (!sa.click) sa.click = {};
        /**
         *采集点击信息的接口
         *@a ：当前的被点击对象
         *@currentUrl当前页面URL。不要encode。如果不传，请传null
         */
        function sendClickData(a, currentUrl) {
            sendDatasIndex(a, null, null, currentUrl);
        }
        /**
         *采集点击信息的接口
         *@a ：当前的被点击对象
         *@_saName：当前的被点击对象的非name属性的其他属性名称，如果不传，请传null
         *@_saTitle：当前的被点击对象的title他属性名称，如果不传，请传null
         *@currentUrl当前页面URL。不要encode。如果不传，请传null
         */
        function sendDatasIndex(e, _saName, _saTitle, currentUrl) {
            var a = e,
                _param = null;
            if (__ut.isObjArgument(e) && e.tag) {
                a = e.tag;
                e = __ut._deleteKey(e, ['tag'])
                if (!__ut.isEmptyObj(e)) {
                    _param = e;
                }
            }
            if (sa._spmSwitch && __ut.checkLabel(a)) {
                // 公共搜索框点击调用方法时，不是直接将标签传过来，而是伪装成一个a标签传过来，该标签不存在于页面上
                // 判断如果标签不在页面上，则走手动方法，无埋点不会监听到，不做处理
                // 判断如果标签在页面上，则走无埋点，手动方法return
                if(document.body.contains(a)){
                    return
                }
            }
            var _title = a.title ? __ut._encode(a.title) : "";
            if (_title == "") {
                var _titleAttr = a.attributes["title"];
                if (_titleAttr != undefined && _titleAttr != null) {
                    _title = _titleAttr.value ? __ut._encode(_titleAttr.value) : "";
                }
            }
            if (_saTitle != undefined && _saTitle != null && _saTitle != "") {
                var _saTitleAttr = a.attributes[_saTitle];
                if (_saTitleAttr != undefined && _saTitleAttr != null) {
                    _title = _saTitleAttr.value ? __ut._encode(_saTitleAttr.value) : "";
                }
            }

            var b = a.name ? __ut._encode(a.name) : "name undefined";
            if (b == "name undefined") {
                var _nameAttr = a.attributes["name"];
                if (_nameAttr != undefined && _nameAttr != null) {
                    b = _nameAttr.value ? __ut._encode(_nameAttr.value) : "name undefined";
                }
            }
            if (_saName != undefined && _saName != null && _saName != "") {
                var _saNameAttr = a.attributes[_saName];
                if (_saNameAttr != undefined && _saNameAttr != null) {
                    b = _saNameAttr.value ? __ut._encode(_saNameAttr.value) : _saName + " undefined";
                }
            }

            var clickUrl = __ut.getInitUrl(),
                currencyUrl = __ut.getCurrencyUrl(2);
            var obj = _param ? __ut._assign({
                tname: b,
                title: _title
            }, _param) : {
                tname: b,
                title: _title
            };
            var detailUrl = __ut.getClickDetailUrl(a, obj);
            detailUrl = __ut._encode(detailUrl);
            var url = clickUrl + currencyUrl + "&evdl=" + detailUrl;
            // 将本次点击日志id存入cookie
            var oId = __ut.getUrlParam(url, "id");
            __ut._addCookie("_snck", oId, "/", "", "");
            __ut._httpGifSend(url);
        }
        var k = sa.click;
        k.sendDatasIndex = sendDatasIndex;
        k.sendClickData = sendClickData;
    })();
    /**
     * 结束
     * 点击日志逻辑
     */
    /**
     * 开始
     * 无埋点功能-精细埋点逻辑
     * @type {boolean}
     * @private
     */
    (function () {
        /**
         * add by 16081267
         * 无埋点功能新增-全页面埋点功能
         */
        if (_JSLOADFLAG) {
            return;
        }
        window._JSLOADFLAG = true;
        var uT = {
            // 模块公用方法
            saBase64: new __ut.saBase64(),
            getFinalTarget: function (label) {
                // 搜索符合采集的父节点
                if (label.tagName.toLocaleLowerCase() == 'body') {
                    // 如果冒泡到body直接返回空
                    return ''
                }
                if (__ut.checkLabel(label)) {
                    return label
                }
                return arguments.callee(label.parentNode)
            },
            getModObj: function (label, target) {
                /**
                 * 返回采集元素第一个带sap-modid属性的父标签sap-modid
                 * 返回采集元素
                 */
                try {
                    if (label.tagName.toLocaleLowerCase() == 'body') {
                        return {
                            id: 0,
                            ele: target
                        }
                    }
                    // 如果存在sap-modid
                    if (label.getAttribute('sap-modid')) {
                        return {
                            id: label.getAttribute('sap-modid'),
                            ele: target
                        }
                    }
                    return arguments.callee(label.parentNode, target)
                } catch (e) {}
            },
            getEleId: function (obj, attr) {
                // 处理最后一段
                if (obj.id === 0) {
                    return md5(attr.tpath).substr(0, 10) // 第一位开始 取10个
                }
                // 如果当前标签有 sap-modid ，eleid = 0
                if (obj.ele.getAttribute('sap-modid')) {
                    return 0;
                }
                var parent = __ut.selectorModid("sap-modid", obj.id); // 绑有sap-modid属性的父节点
                for(var j = 0; j < parent.length; j++){
                    childs = parent[j].getElementsByTagName(obj.ele.tagName.toLocaleLowerCase()); //该modid下所有采集元素的列表
                    for (var i = 0; i < childs.length; i++) {
                        if (childs[i] == obj.ele) {
                            if(j == 0){
                                return i + 1;
                            }else{
                                return md5(attr.tpath).substr(0, 10);
                            }
                        }
                    }
                }
            },
            getSap: function (target, infor) {
                // 生成sap串
                // target 采集元素，infor采集元素对应的属性
                var _this = this;
                try {
                    var siteId = null,
                        pageId = null,
                        modId = null,
                        eleId = null;
                    siteId = uT.getLabel('meta', 'siteid');
                    pageId = uT.getLabel('meta', 'pageid');
                    var modObj = '',
                        sap = '',
                        modObj = uT.getModObj(target, target) // mod节点及modid信息 不包含自身元素所以取parentNode
                    modId = modObj.id;
                    eleId = uT.getEleId(modObj, infor); // 传入父节点信息采集元素tag,及tag属性
                    sap = 'siteid=' + siteId + '&pageid=' + pageId + '&modid=' + modId + '&eleid=' + eleId;
                    safp = siteId + "_" + pageId + "_" + modId + "_" + eleId;
                    // 暴露saSap值
                    window.saSap = {
                        xPath: infor.tpath,
                        code64: _this.saBase64.encode(sap)
                    }
                    return {
                        sap: _this.saBase64.encode(sap),
                        safp: safp
                    }
                } catch (e) {}
            },
            getLabel: function (ele, name) {
                return document.getElementsByTagName(ele)[name] ? document.getElementsByTagName(ele)[name]['content'] : '';
            }
        }
        sa._spmSwitch = false;
        sa.ready(function () {
            var _autoclick = null;
            var _pageid = null;
            var metaTag = document.getElementsByTagName("meta");
            // 解决页面埋多个autoclick，pageid，导致ie浏览器报错的问题
            for (var i = 0; i < metaTag.length; i++) {
                if (metaTag[i].name == "autoclick") {
                    _autoclick = metaTag[i];
                    break;
                }
            }
            for (var i = 0; i < metaTag.length; i++) {
                if (metaTag[i].name == "pageid") {
                    _pageid = metaTag[i];
                    break;
                }
            }
            if (_autoclick && _pageid && _autoclick.getAttribute("content") == "true" && _pageid.getAttribute("content") != "") {
                sa._spmSwitch = true;
            }
        });
        sa.ready(function () {
            if (sa._spmSwitch) {
                function saLastStep(saTarget) {
                    try {
                        // 上报采集日志
                        var infor = __ut.readInfor(saTarget); // 获取采集日志所需href 和 tpath
                        // _name--(tname)
                        var _name = saTarget.name ? __ut._encode(saTarget.name) : "name undefined";
                        if (_name == "name undefined") {
                            var _nameAttr = saTarget.attributes["name"];
                            if (_nameAttr != undefined && _nameAttr != null) {
                                _name = _nameAttr.value ? __ut._encode(_nameAttr.value) : "name undefined";
                            }
                        }
                        infor.tname = _name;
                        //_title--(title)
                        var _title = saTarget.title ? __ut._encode(saTarget.title) : "";
                        if (_title == "") {
                            var _titleAttr = saTarget.attributes["title"];
                            if (_titleAttr != undefined && _titleAttr != null) {
                                _title = _titleAttr.value ? __ut._encode(_titleAttr.value) : "";
                            }
                        }
                        if (saTarget.getAttribute('title') == null) { // 如果title属性不存在 取元素alt 属性值
                            var _altAttr = saTarget.attributes["alt"];
                            if (_altAttr != undefined && _altAttr != null) {
                                _title = _altAttr.value ? __ut._encode(_altAttr.value) : "";
                            }
                        }
                        infor.title = _title;
                        var sapObj = uT.getSap(saTarget, infor),
                            sap = sapObj.sap,
                            safp = sapObj.safp,
                            dt = null;
                        if (sap == undefined || safp == undefined) {
                            return
                        }
                        infor.sap = sap; // 将sap 值加入infor中
                        infor.safp = safp; // 将safp 值加入infor中

                        var href = saTarget.getAttribute('href'),
                            hrefDomain = href ? href.split("?")[0] : "",
                            hrefReg = /^(javascript|#)/i,
                            safpReg = /(\?|&)safp=/,
                            domainReg = /(product\.suning\.com)|(m\.suning\.com\/product\/)/;
                        // 当且a标签课调整 动态改变 a标签 href属性
                        if(href && !hrefReg.test(href) && !safpReg.test(href) && domainReg.test(hrefDomain)) {
                            if(href.indexOf("#") > -1){
                                if(href.indexOf("?") == -1){
                                    var safpStr = '?safp=' + infor.safp;
                                    href = __ut.checkHrefHash(href, safpStr);
                                }else if(href.indexOf("?") > href.indexOf("#")){
                                    if(!href[href.indexOf("?") + 1]){
                                        href = href + 'safp=' + infor.safp;
                                    }else{
                                        href = href + '&safp=' + infor.safp;
                                    }
                                }else{
                                    var safpStr = '&safp=' + infor.safp;
                                    href = __ut.checkHrefHash(href, safpStr);
                                }
                            }else{
                                if(href.indexOf("?") == -1){
                                    href = href + '?safp=' + infor.safp;
                                }else if(!href[href.indexOf("?") + 1]){
                                    href = href + 'safp=' + infor.safp;
                                }else{
                                    href = href + '&safp=' + infor.safp;
                                }
                            }
                            saTarget.setAttribute('href', href);
                            infor.targeturl = href; // 采集改变以后的href信息
                        }
                        dt = __ut.getClickDetailUrl(saTarget, infor); // 组合采集信息
                        __ut._httpGifSend(__ut.getInitUrl() + __ut.getCurrencyUrl(2) + '&evdl=' + __ut._encode(dt))

                    } catch (e) {}
                }
                __ut.addEvent(document.body, 'click', function (e) {
                    var collectDom = null, //最终采集的目标元素
                        saTarget = __ut.getTrg(e); // 被点击元素
                    /**
                     * 如果被点击的元素为 采集类型元素或带href标签的元素直接采集当前元素属性上报
                     */
                    if (__ut.checkLabel(saTarget)) {
                        saLastStep(saTarget)
                        return
                    }
                    /**
                     * 搜索被点击元素父节点如果满足采集条件，采集父节点并上报日志
                     */
                    collectDom = uT.getFinalTarget(saTarget); // 获取所有目标元素
                    if (collectDom) {
                        // 如果被点击元素的父节点是采集类型元素 选择父节点采集
                        saLastStep(collectDom)
                    }
                    return true;
                });
            }
        })
    })();
    /**
     * 结束
     * 无埋点功能-精细埋点逻辑
     */

    /**
     * 开始
     * 搜索日志js合并
     */
    _searchDataSaPush = _searchInner = function (d, e, f, h, s) {
        //判断是否是通过 2.0 方法上报
        var totalRows = d,
            searchKeyWord = e,
            kuozhanKeyWord = f,
            searchCategory = h ? h : "",
            searchType = s ? s : "",
            _param = null;
        if (__ut.isObjArgument(d)) {
            totalRows = d.totalRows;
            searchKeyWord = d.searchKeyWord;
            kuozhanKeyWord = d.kuozhanKeyWord;
            searchCategory = d.searchCategory;
            searchType = d.searchType;
            d = __ut._deleteKey(d, ['totalRows', 'searchKeyWord', 'kuozhanKeyWord', 'searchCategory', 'searchType']);
            _param = !__ut.isEmptyObj(d) ? d : null;

        }
        // 透传搜索字段
        if (_param) {
            __extMap.put('searchExtDatas', _param)
        }
        try {
            if (!totalRows) {
                totalRows = 0;
            }
            var thisUrl = document.location.href,
                ci = __ut.getUrlParam(thisUrl, "ci"),
                ci = ci ? ci : "",
                catalogId = __ut.getUrlParam(thisUrl, "catalogId"),
                catalogId = catalogId ? catalogId : "";

            var keyword = "";
            if (searchKeyWord) {
                keyword = searchKeyWord.replace(/%7C/g, "");
            } else {
                var hidKeyword = document.getElementById("keyword");
                keyword = hidKeyword ? hidKeyword.value.replace(/%7C/g, "") : "keyword undefined";
            }
            var kzKeyWod = "";
            if (kuozhanKeyWord) {
                kzKeyWod = kuozhanKeyWord.replace(/%7C/g, "");
            } else {
                var hidKuozhanKeyword = document.getElementById("kuozhan_key_words");
                kzKeyWod = hidKuozhanKeyword ? hidKuozhanKeyword.value.replace(/%7C/g, "") : "";
            }

            var splitStr = '*:*',
                replaceword = "";
            var replace_key_words = document.getElementById("replace_key_words");
            if (replace_key_words != undefined) {
                var replace_key_words_val = replace_key_words.value;
                if (replace_key_words_val != undefined && replace_key_words_val != null && replace_key_words_val != "") {
                    var replace_key_words_valArr = replace_key_words_val.split(splitStr);
                    if (replace_key_words_valArr.length >= 2) {
                        replaceword = replace_key_words_valArr[0];
                        keyword = replace_key_words_valArr[1];
                        keyword = keyword ? keyword.replace(/%7C/g, "") : "replaceword undefined";
                        replaceword = replaceword ? replaceword.replace(/%7C/g, "") : "keyword undefined";
                    }
                }
            }
            var splitedKeyword = "",
                hidSplitedKeyword = document.getElementById("sa_splited_key_words"),
                splitedKeyword = hidSplitedKeyword ? hidSplitedKeyword.value : "splitedKeyword undefined",
                searchData = [keyword, totalRows, "0", splitedKeyword, ci, catalogId, replaceword, kzKeyWod, searchCategory, searchType];

            _samap.put("_saSearchDatas", searchData);
        } catch (e) {

        }
    }
    /**
     * 结束
     * 搜索日志js合并
     */
    /**
     * 开始
     * 精细化埋点项目，前后台页面建立通信逻辑
     * add by 88391756
     * @method init() 入口方法 建立与父页面的通信，等待接收父页面的消息
     * @param
     * @returns
     */
    window._spmPageBridge = window._spmPageBridge || {};
    window._spmPageBridge.validList = ['.suning.com', '.cnsuning.com', 'localhost'] //监测安全数组
    window._spmPageBridge.MSG_TYPE_SEND = {
        'init': 'init', // 初始化
        'changeSelect': 'changeSelect', // 更新区块或者坑位
        'selectBlock': 'selectBlock', // 高亮区块
        'selectPit': 'selectPit', // 高亮坑位
        'getCodeInfo': 'getCodeInfo',
        'getPageList': 'getPageList',
        'messageInfo': 'messageInfo'
    }
    window._spmPageBridge.MSG_TYPE_RECEIVE = {
        'init': 'initResponse', // 初始化
        'changeSelect': 'changeSelectResponse', // 更新区块或者坑位
        'selectBlock': 'selectBlockResponse', // 高亮区块
        'selectPit': 'selectPitResponse', // 高亮坑位
        'getCodeInfoResponse': 'getCodeInfoResponse',
        'getPageListResponse': 'getPageListResponse',
        'messageInfoResponse': 'messageInfoResponse'
    }
    window._spmPageBridge.MSG_RESULT = {
        'success': 'success',
        'error': 'error'
    }
    window._spmPageBridge.init = (function () {
        var This = this;

        function Init(e) {
            try {
                var data = JSON.parse(e.data);
                var arr = This._spmPageBridge.validList.filter(function (item) {
                    return e.origin.indexOf(item) > -1
                })
                if (arr.length > 0) {
                    switch (data.type) {
                        case This._spmPageBridge.MSG_TYPE_SEND.init:
                            if (document) {
                                //TODO 生产配置true，测试环境配置为false

                                var script = document.createElement("script");
                                script.type = "text/javascript";
                                var jsUrl = __ut.getJsUrl('sa_click.js');
                                if (__conf.isSaPrd) {
                                    script.src = "//res.suning.cn/javascript/sn_da/spm_front.js";
                                } else {
                                    if (jsUrl && jsUrl.indexOf("pre") > -1) {
                                        if (jsUrl && jsUrl.indexOf("xg") > -1) {
                                            script.src = "//resprexg.suning.cn/javascript/sn_da/spm_front.js";
                                        } else {
                                            script.src = "//preres.suning.cn/javascript/sn_da/spm_front.js";
                                        }
                                    } else {
                                        script.src = "//sitres.suning.cn/javascript/sn_da/spm_front.js";
                                    }
                                }
                                document.body.appendChild(script);
                                script.onload = function () {
                                    This._spmPageBridge.currentOrigin = e.origin;
                                    var totaltime = 0;
                                    var timer = function () {
                                        setTimeout(function () {
                                            if (sa._spmSwitch) {
                                                This._spmPageBridge.ready(e)
                                            } else if (totaltime > 4000) {
                                                This._spmPageBridge.dispatchMessage();
                                            } else {
                                                totaltime = totaltime + 200
                                                timer()
                                            }
                                        }, 200)
                                    }
                                    timer();
                                }
                            }
                            break;
                        case This._spmPageBridge.MSG_TYPE_SEND.changeSelect:
                            This._spmPageBridge.changeSelect(data)
                            break;
                        case This._spmPageBridge.MSG_TYPE_SEND.selectBlock:
                            This._spmPageBridge.selectBlock(data);
                            break;
                        case This._spmPageBridge.MSG_TYPE_SEND.selectPit:
                            This._spmPageBridge.selectPit(data);
                            break;
                        case This._spmPageBridge.MSG_TYPE_SEND.getCodeInfo:
                            This._spmPageBridge.getCodeInfo(data);
                            break;
                        case This._spmPageBridge.MSG_TYPE_SEND.getPageList:
                            This._spmPageBridge.getPageList(data);
                            break;
                        default:
                            break;
                    }
                }
            } catch (e) {}
        }
        __ut.removeEvent(window, 'message', Init);
        __ut.addEvent(window, 'message', Init);
    })();
    /**
     * 结束
     * 精细化埋点项目，前后台页面建立通信逻辑
     */
    // 通用类库 md5 库
    ! function () {
        function t(t) {
            if (t) d[0] = d[16] = d[1] = d[2] = d[3] = d[4] = d[5] = d[6] = d[7] = d[8] = d[9] = d[10] = d[11] = d[12] = d[13] = d[14] = d[15] = 0, this.blocks = d, this.buffer8 = l;
            else if (a) {
                var r = new ArrayBuffer(68);
                this.buffer8 = new Uint8Array(r), this.blocks = new Uint32Array(r)
            } else this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0, this.finalized = this.hashed = !1, this.first = !0
        }
        var r = "input is invalid type",
            e = "object" == typeof window,
            i = e ? window : {};
        i.JS_MD5_NO_WINDOW && (e = !1);
        var s = !e && "object" == typeof self,
            h = !i.JS_MD5_NO_NODE_JS && "object" == typeof process && process.versions && process.versions.node;
        h ? i = global : s && (i = self);
        var f = !i.JS_MD5_NO_COMMON_JS && "object" == typeof module && module.exports,
            o = "function" == typeof _define && _define.amd,
            a = !i.JS_MD5_NO_ARRAY_BUFFER && "undefined" != typeof ArrayBuffer,
            n = "0123456789abcdef".split(""),
            u = [128, 32768, 8388608, -2147483648],
            y = [0, 8, 16, 24],
            c = ["hex", "array", "digest", "buffer", "arrayBuffer", "base64"],
            p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
            d = [],
            l;
        if (a) {
            var A = new ArrayBuffer(68);
            l = new Uint8Array(A), d = new Uint32Array(A)
        }!i.JS_MD5_NO_NODE_JS && Array.isArray || (Array.isArray = function (t) {
            return "[object Array]" === Object.prototype.toString.call(t)
        }), !a || !i.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW && ArrayBuffer.isView || (ArrayBuffer.isView = function (t) {
            return "object" == typeof t && t.buffer && t.buffer.constructor === ArrayBuffer
        });
        var b = function (r) {
                return function (e) {
                    return new t(!0).update(e)[r]()
                }
            },
            v = function () {
                var r = b("hex");
                h && (r = w(r)), r.create = function () {
                    return new t
                }, r.update = function (t) {
                    return r.create().update(t)
                };
                for (var e = 0; e < c.length; ++e) {
                    var i = c[e];
                    r[i] = b(i)
                }
                return r
            },
            w = function (t) {
                var e = eval("require('crypto')"),
                    i = eval("require('buffer').Buffer"),
                    s = function (s) {
                        if ("string" == typeof s) return e.createHash("md5").update(s, "utf8").digest("hex");
                        if (null === s || void 0 === s) throw r;
                        return s.constructor === ArrayBuffer && (s = new Uint8Array(s)), Array.isArray(s) || ArrayBuffer.isView(s) || s.constructor === i ? e.createHash("md5").update(new i(s)).digest("hex") : t(s)
                    };
                return s
            };
        t.prototype.update = function (t) {
            if (!this.finalized) {
                var e, i = typeof t;
                if ("string" !== i) {
                    if ("object" !== i) throw r;
                    if (null === t) throw r;
                    if (a && t.constructor === ArrayBuffer) t = new Uint8Array(t);
                    else if (!(Array.isArray(t) || a && ArrayBuffer.isView(t))) throw r;
                    e = !0
                }
                for (var s, h, f = 0, o = t.length, n = this.blocks, u = this.buffer8; f < o;) {
                    if (this.hashed && (this.hashed = !1, n[0] = n[16], n[16] = n[1] = n[2] = n[3] = n[4] = n[5] = n[6] = n[7] = n[8] = n[9] = n[10] = n[11] = n[12] = n[13] = n[14] = n[15] = 0), e)
                        if (a)
                            for (h = this.start; f < o && h < 64; ++f) u[h++] = t[f];
                        else
                            for (h = this.start; f < o && h < 64; ++f) n[h >> 2] |= t[f] << y[3 & h++];
                    else if (a)
                        for (h = this.start; f < o && h < 64; ++f)(s = t.charCodeAt(f)) < 128 ? u[h++] = s : s < 2048 ? (u[h++] = 192 | s >> 6, u[h++] = 128 | 63 & s) : s < 55296 || s >= 57344 ? (u[h++] = 224 | s >> 12, u[h++] = 128 | s >> 6 & 63, u[h++] = 128 | 63 & s) : (s = 65536 + ((1023 & s) << 10 | 1023 & t.charCodeAt(++f)), u[h++] = 240 | s >> 18, u[h++] = 128 | s >> 12 & 63, u[h++] = 128 | s >> 6 & 63, u[h++] = 128 | 63 & s);
                    else
                        for (h = this.start; f < o && h < 64; ++f)(s = t.charCodeAt(f)) < 128 ? n[h >> 2] |= s << y[3 & h++] : s < 2048 ? (n[h >> 2] |= (192 | s >> 6) << y[3 & h++], n[h >> 2] |= (128 | 63 & s) << y[3 & h++]) : s < 55296 || s >= 57344 ? (n[h >> 2] |= (224 | s >> 12) << y[3 & h++], n[h >> 2] |= (128 | s >> 6 & 63) << y[3 & h++], n[h >> 2] |= (128 | 63 & s) << y[3 & h++]) : (s = 65536 + ((1023 & s) << 10 | 1023 & t.charCodeAt(++f)), n[h >> 2] |= (240 | s >> 18) << y[3 & h++], n[h >> 2] |= (128 | s >> 12 & 63) << y[3 & h++], n[h >> 2] |= (128 | s >> 6 & 63) << y[3 & h++], n[h >> 2] |= (128 | 63 & s) << y[3 & h++]);
                    this.lastByteIndex = h, this.bytes += h - this.start, h >= 64 ? (this.start = h - 64, this.hash(), this.hashed = !0) : this.start = h
                }
                return this.bytes > 4294967295 && (this.hBytes += this.bytes / 4294967296 << 0, this.bytes = this.bytes % 4294967296), this
            }
        }, t.prototype.finalize = function () {
            if (!this.finalized) {
                this.finalized = !0;
                var t = this.blocks,
                    r = this.lastByteIndex;
                t[r >> 2] |= u[3 & r], r >= 56 && (this.hashed || this.hash(), t[0] = t[16], t[16] = t[1] = t[2] = t[3] = t[4] = t[5] = t[6] = t[7] = t[8] = t[9] = t[10] = t[11] = t[12] = t[13] = t[14] = t[15] = 0), t[14] = this.bytes << 3, t[15] = this.hBytes << 3 | this.bytes >>> 29, this.hash()
            }
        }, t.prototype.hash = function () {
            var t, r, e, i, s, h, f = this.blocks;
            this.first ? r = ((r = ((t = ((t = f[0] - 680876937) << 7 | t >>> 25) - 271733879 << 0) ^ (e = ((e = (-271733879 ^ (i = ((i = (-1732584194 ^ 2004318071 & t) + f[1] - 117830708) << 12 | i >>> 20) + t << 0) & (-271733879 ^ t)) + f[2] - 1126478375) << 17 | e >>> 15) + i << 0) & (i ^ t)) + f[3] - 1316259209) << 22 | r >>> 10) + e << 0 : (t = this.h0, r = this.h1, e = this.h2, r = ((r += ((t = ((t += ((i = this.h3) ^ r & (e ^ i)) + f[0] - 680876936) << 7 | t >>> 25) + r << 0) ^ (e = ((e += (r ^ (i = ((i += (e ^ t & (r ^ e)) + f[1] - 389564586) << 12 | i >>> 20) + t << 0) & (t ^ r)) + f[2] + 606105819) << 17 | e >>> 15) + i << 0) & (i ^ t)) + f[3] - 1044525330) << 22 | r >>> 10) + e << 0), r = ((r += ((t = ((t += (i ^ r & (e ^ i)) + f[4] - 176418897) << 7 | t >>> 25) + r << 0) ^ (e = ((e += (r ^ (i = ((i += (e ^ t & (r ^ e)) + f[5] + 1200080426) << 12 | i >>> 20) + t << 0) & (t ^ r)) + f[6] - 1473231341) << 17 | e >>> 15) + i << 0) & (i ^ t)) + f[7] - 45705983) << 22 | r >>> 10) + e << 0, r = ((r += ((t = ((t += (i ^ r & (e ^ i)) + f[8] + 1770035416) << 7 | t >>> 25) + r << 0) ^ (e = ((e += (r ^ (i = ((i += (e ^ t & (r ^ e)) + f[9] - 1958414417) << 12 | i >>> 20) + t << 0) & (t ^ r)) + f[10] - 42063) << 17 | e >>> 15) + i << 0) & (i ^ t)) + f[11] - 1990404162) << 22 | r >>> 10) + e << 0, r = ((r += ((t = ((t += (i ^ r & (e ^ i)) + f[12] + 1804603682) << 7 | t >>> 25) + r << 0) ^ (e = ((e += (r ^ (i = ((i += (e ^ t & (r ^ e)) + f[13] - 40341101) << 12 | i >>> 20) + t << 0) & (t ^ r)) + f[14] - 1502002290) << 17 | e >>> 15) + i << 0) & (i ^ t)) + f[15] + 1236535329) << 22 | r >>> 10) + e << 0, r = ((r += ((i = ((i += (r ^ e & ((t = ((t += (e ^ i & (r ^ e)) + f[1] - 165796510) << 5 | t >>> 27) + r << 0) ^ r)) + f[6] - 1069501632) << 9 | i >>> 23) + t << 0) ^ t & ((e = ((e += (t ^ r & (i ^ t)) + f[11] + 643717713) << 14 | e >>> 18) + i << 0) ^ i)) + f[0] - 373897302) << 20 | r >>> 12) + e << 0, r = ((r += ((i = ((i += (r ^ e & ((t = ((t += (e ^ i & (r ^ e)) + f[5] - 701558691) << 5 | t >>> 27) + r << 0) ^ r)) + f[10] + 38016083) << 9 | i >>> 23) + t << 0) ^ t & ((e = ((e += (t ^ r & (i ^ t)) + f[15] - 660478335) << 14 | e >>> 18) + i << 0) ^ i)) + f[4] - 405537848) << 20 | r >>> 12) + e << 0, r = ((r += ((i = ((i += (r ^ e & ((t = ((t += (e ^ i & (r ^ e)) + f[9] + 568446438) << 5 | t >>> 27) + r << 0) ^ r)) + f[14] - 1019803690) << 9 | i >>> 23) + t << 0) ^ t & ((e = ((e += (t ^ r & (i ^ t)) + f[3] - 187363961) << 14 | e >>> 18) + i << 0) ^ i)) + f[8] + 1163531501) << 20 | r >>> 12) + e << 0, r = ((r += ((i = ((i += (r ^ e & ((t = ((t += (e ^ i & (r ^ e)) + f[13] - 1444681467) << 5 | t >>> 27) + r << 0) ^ r)) + f[2] - 51403784) << 9 | i >>> 23) + t << 0) ^ t & ((e = ((e += (t ^ r & (i ^ t)) + f[7] + 1735328473) << 14 | e >>> 18) + i << 0) ^ i)) + f[12] - 1926607734) << 20 | r >>> 12) + e << 0, r = ((r += ((h = (i = ((i += ((s = r ^ e) ^ (t = ((t += (s ^ i) + f[5] - 378558) << 4 | t >>> 28) + r << 0)) + f[8] - 2022574463) << 11 | i >>> 21) + t << 0) ^ t) ^ (e = ((e += (h ^ r) + f[11] + 1839030562) << 16 | e >>> 16) + i << 0)) + f[14] - 35309556) << 23 | r >>> 9) + e << 0, r = ((r += ((h = (i = ((i += ((s = r ^ e) ^ (t = ((t += (s ^ i) + f[1] - 1530992060) << 4 | t >>> 28) + r << 0)) + f[4] + 1272893353) << 11 | i >>> 21) + t << 0) ^ t) ^ (e = ((e += (h ^ r) + f[7] - 155497632) << 16 | e >>> 16) + i << 0)) + f[10] - 1094730640) << 23 | r >>> 9) + e << 0, r = ((r += ((h = (i = ((i += ((s = r ^ e) ^ (t = ((t += (s ^ i) + f[13] + 681279174) << 4 | t >>> 28) + r << 0)) + f[0] - 358537222) << 11 | i >>> 21) + t << 0) ^ t) ^ (e = ((e += (h ^ r) + f[3] - 722521979) << 16 | e >>> 16) + i << 0)) + f[6] + 76029189) << 23 | r >>> 9) + e << 0, r = ((r += ((h = (i = ((i += ((s = r ^ e) ^ (t = ((t += (s ^ i) + f[9] - 640364487) << 4 | t >>> 28) + r << 0)) + f[12] - 421815835) << 11 | i >>> 21) + t << 0) ^ t) ^ (e = ((e += (h ^ r) + f[15] + 530742520) << 16 | e >>> 16) + i << 0)) + f[2] - 995338651) << 23 | r >>> 9) + e << 0, r = ((r += ((i = ((i += (r ^ ((t = ((t += (e ^ (r | ~i)) + f[0] - 198630844) << 6 | t >>> 26) + r << 0) | ~e)) + f[7] + 1126891415) << 10 | i >>> 22) + t << 0) ^ ((e = ((e += (t ^ (i | ~r)) + f[14] - 1416354905) << 15 | e >>> 17) + i << 0) | ~t)) + f[5] - 57434055) << 21 | r >>> 11) + e << 0, r = ((r += ((i = ((i += (r ^ ((t = ((t += (e ^ (r | ~i)) + f[12] + 1700485571) << 6 | t >>> 26) + r << 0) | ~e)) + f[3] - 1894986606) << 10 | i >>> 22) + t << 0) ^ ((e = ((e += (t ^ (i | ~r)) + f[10] - 1051523) << 15 | e >>> 17) + i << 0) | ~t)) + f[1] - 2054922799) << 21 | r >>> 11) + e << 0, r = ((r += ((i = ((i += (r ^ ((t = ((t += (e ^ (r | ~i)) + f[8] + 1873313359) << 6 | t >>> 26) + r << 0) | ~e)) + f[15] - 30611744) << 10 | i >>> 22) + t << 0) ^ ((e = ((e += (t ^ (i | ~r)) + f[6] - 1560198380) << 15 | e >>> 17) + i << 0) | ~t)) + f[13] + 1309151649) << 21 | r >>> 11) + e << 0, r = ((r += ((i = ((i += (r ^ ((t = ((t += (e ^ (r | ~i)) + f[4] - 145523070) << 6 | t >>> 26) + r << 0) | ~e)) + f[11] - 1120210379) << 10 | i >>> 22) + t << 0) ^ ((e = ((e += (t ^ (i | ~r)) + f[2] + 718787259) << 15 | e >>> 17) + i << 0) | ~t)) + f[9] - 343485551) << 21 | r >>> 11) + e << 0, this.first ? (this.h0 = t + 1732584193 << 0, this.h1 = r - 271733879 << 0, this.h2 = e - 1732584194 << 0, this.h3 = i + 271733878 << 0, this.first = !1) : (this.h0 = this.h0 + t << 0, this.h1 = this.h1 + r << 0, this.h2 = this.h2 + e << 0, this.h3 = this.h3 + i << 0)
        }, t.prototype.hex = function () {
            this.finalize();
            var t = this.h0,
                r = this.h1,
                e = this.h2,
                i = this.h3;
            return n[t >> 4 & 15] + n[15 & t] + n[t >> 12 & 15] + n[t >> 8 & 15] + n[t >> 20 & 15] + n[t >> 16 & 15] + n[t >> 28 & 15] + n[t >> 24 & 15] + n[r >> 4 & 15] + n[15 & r] + n[r >> 12 & 15] + n[r >> 8 & 15] + n[r >> 20 & 15] + n[r >> 16 & 15] + n[r >> 28 & 15] + n[r >> 24 & 15] + n[e >> 4 & 15] + n[15 & e] + n[e >> 12 & 15] + n[e >> 8 & 15] + n[e >> 20 & 15] + n[e >> 16 & 15] + n[e >> 28 & 15] + n[e >> 24 & 15] + n[i >> 4 & 15] + n[15 & i] + n[i >> 12 & 15] + n[i >> 8 & 15] + n[i >> 20 & 15] + n[i >> 16 & 15] + n[i >> 28 & 15] + n[i >> 24 & 15]
        }, t.prototype.toString = t.prototype.hex, t.prototype.digest = function () {
            this.finalize();
            var t = this.h0,
                r = this.h1,
                e = this.h2,
                i = this.h3;
            return [255 & t, t >> 8 & 255, t >> 16 & 255, t >> 24 & 255, 255 & r, r >> 8 & 255, r >> 16 & 255, r >> 24 & 255, 255 & e, e >> 8 & 255, e >> 16 & 255, e >> 24 & 255, 255 & i, i >> 8 & 255, i >> 16 & 255, i >> 24 & 255]
        }, t.prototype.array = t.prototype.digest, t.prototype.arrayBuffer = function () {
            this.finalize();
            var t = new ArrayBuffer(16),
                r = new Uint32Array(t);
            return r[0] = this.h0, r[1] = this.h1, r[2] = this.h2, r[3] = this.h3, t
        }, t.prototype.buffer = t.prototype.arrayBuffer, t.prototype.base64 = function () {
            for (var t, r, e, i = "", s = this.array(), h = 0; h < 15;) t = s[h++], r = s[h++], e = s[h++], i += p[t >>> 2] + p[63 & (t << 4 | r >>> 4)] + p[63 & (r << 2 | e >>> 6)] + p[63 & e];
            return t = s[h], i += p[t >>> 2] + p[t << 4 & 63] + "=="
        };
        var _ = v();
        f ? module.exports = _ : (i.md5 = _, o && _define(function () {
            return _
        }))
    }();
    
    /**
     * 图片采集曝光事件
     */
    (function(){
        var _util = {
            // 缓存的数据
            data: [],
            timer: null,
            siteid: document.getElementsByTagName("meta")["siteid"] ? document.getElementsByTagName("meta")["siteid"]['content'] : '',
            pageid: document.getElementsByTagName("meta")["pageid"] ? document.getElementsByTagName("meta")["pageid"]['content'] : '',
            getModInfo: function (label, target) {
                // 定义往上遍历的次数，超过10次认为该次曝光无效
                var count = 0,
                    _MAX_COUNT = 10;
                /**
                 * 返回采集元素第一个带sap-modid属性的父标签sap-modid
                 * 返回采集元素
                 */
                function findMod(label, target) {
                    try {
                        if (label.tagName.toLocaleLowerCase() == 'body' || count > _MAX_COUNT) {
                            return {
                                id: 0,
                                autoexpo: 'false',
                                ele: target
                            }
                        }
                        // 如果存在sap-modid
                        if (label.getAttribute('sap-modid')) {
                            return {
                                id: label.getAttribute('sap-modid'),
                                autoexpo: label.getAttribute('autoexpo'),
                                ele: target
                            }
                        }
                        // 遍历次数加一
                        count++;

                        return findMod(label.parentNode, target);
                    } catch (e) {}
                }

                return findMod(label, target);
            },
            getAEleid: function (obj) {
                // 如果当前 a 标签有 sap-modid ，eleid = 0
                if (obj.ele.parentNode.getAttribute('sap-modid')) {
                    return 0;
                }
                // 绑有sap-modid属性的父节点
                var parent = __ut.selectorModid("sap-modid", obj.id);

                for(var j = 0; j < parent.length; j++){
                    childs = parent[j].getElementsByTagName(obj.ele.tagName.toLocaleLowerCase()); //该modid下所有采集元素的列表
                    for (var i = 0; i < childs.length; i++) {
                        if (childs[i] == obj.ele) {
                            if(j == 0){
                                return i + 1;
                            }
                        }
                    }
                }
            },
            // 判断报告开关是否合法
            isLegal: function (parentTagName, modid, autoexpo, src) {
                // blank.gif 默认图片，不参与曝光
                return parentTagName === "a" && modid && autoexpo === "true" && src.indexOf("blank.gif") === -1;
            },
            formatData: function(data) {
                data = data || "";
                return __ut._encode(__ut.stringify(data));
            },
            // sa_data 要格式化单引号为双引号
            formateSaData: function (data) {
                return data ? __ut._encode(data.replace(/'/g, '"')) : __ut._encode("{}");
            },
            // 缓存数据
            cacheData: function (param) {
                param = param instanceof Object ? param : {};
                this.data.push(param);
                this.start();
            },
            //每隔100毫秒将之前存的曝光数据发出去
            start: function (interval) {
                var _this = this;
                if (!_this.timer && _this.data.length) {
                    _this.timer = setInterval(function () {
                        _this.sendLog();
                    }, 100)
                }
            },
            //发送曝光日志
            sendLog: function () {
                if (this.data.length) {
                    // 每100ms最多发送10条，每条数据单独发送
                    var _pvid =  __ut._createPageViewId();
                    var sendData = this.data.splice(0, 10);
                    for (var j = 0; j < sendData.length; j++) {
                        var _detail = this.formatData(sendData[j]);
                        var url = __ut.getInitUrl() + __ut.getCurrencyUrl(100) +"&pvid="+ _pvid +"&evdl=" + _detail;
                        __ut._httpGifSendPassH5(url);
                    }
                } else {
                    this.stop();
                }
            },
            stop: function () {
                var that = this;
                if (that.timer) {
                    clearInterval(that.timer);
                    that.timer = null;
                }
            }
        }

        /**
         * 捕获区块图片onlad事件
         */
        function exposure() {
            // 带有sap-modid的自动曝光
            var _doms = document.querySelectorAll('div[sap-modid]');
            if (!_doms || _doms.length == 0){
                return;
            }
            for (var i = 0; i < _doms.length; i++) {
                var _item = _doms[i];
                __ut.removeEvent(_item, 'load', startExposure);                    
                __ut.addEvent(_item, 'load', startExposure, true)
            }
        }

        /**
         * 图片 load 后，获取对应参数， 然后开始曝光流程
         * @params {ImgDom} e onload的图片 
         */
        function startExposure (e) {
            // 获取img对象，以及区块 modid， autoexpo
            var _el = __ut.getTrg(e),
            _parent = _el.parentNode,
            _modObj = _util.getModInfo(_el, _el),
            _params = null;
            
            // 判断是否符合曝光要求，1、父元素为a标签；2、10层父元素内存在 sap-modid； 3、autoexpo = true; 4、不是默认图片
            var _legal = _util.isLegal(_parent.tagName.toLowerCase(), _modObj.id, _modObj.autoexpo, _el.src);

            if (_legal) {
                var saData = _parent.getAttribute("sa-data") || "{}";
                _params = {
                    name: _parent.getAttribute("name") || "",
                    id: _parent.getAttribute("id") || "",
                    saData: _util.formateSaData(saData),
                    safp: _util.siteid + '_' + _util.pageid + '_' + _modObj.id + '_' + _util.getAEleid(_modObj)
                };
                _util.cacheData(_params);
            }
        }

        sa.ready(exposure);
    })()
    //反作弊自定义日志发送
    function _heimdallr() {
        //防止多次引用js文件导致多次发送反作弊日志
        if(sa.heimdallrSend === true){
            return;
        }
        function getCanvas() {
            try {
                var canvas = window.document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                var txt = "Suning Fingerprints/Canvas 1.0";
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.textBaseline = "alphabetic";
                ctx.fillStyle = "#f60";
                ctx.fillRect(125, 1, 62, 20);
                ctx.fillStyle = "#069";
                ctx.fillText(txt, 2, 15);
                ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
                ctx.fillText(txt, 4, 17);
                return canvas;
            } catch (e) {
                if (window.console) {
                    console.log("unsupported canvas", e);
                }
                return null;
            }
        };
        function getCanvasFingerprints(canvas) {
            try {
                return md5(canvas.toDataURL());
            } catch (e) {
                return "undefined";
            }
        }
        function getHiddenProp() {
            var prefixes = ["webkit", "moz", "ms", "o"];
            // if 'hidden' is natively supported just return it
            if ("hidden" in window.document) return window.document.hidden;
            // otherwise loop over all the known prefixes until we find one
            for (var i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + "Hidden") in window.document)
                    return window.document[prefixes[i] + "Hidden"];
            }
            // otherwise it's not supported
            return null;
        };
        function getVisibilityState() {
            var prefixes = ["webkit", "moz", "ms", "o"];
            if ("visibilityState" in window.document)
                return window.document.visibilityState;
            for (var i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + "VisibilityState") in window.document)
                    return window.document[prefixes[i] + "VisibilityState"];
            }
            // otherwise it's not supported
            return null;
        };
        //屏幕分辨率的宽高
        function getResolution(){
            return [window.screen.width, window.screen.height];
        };
        //网页可见区域宽高
        function getVisibleSize() {
            try {
                return [
                    window.document.body.clientWidth,
                    window.document.body.clientHeight
                ];
            } catch (e) {
                return ["undefined", "undefined"];
            }
        };
        //网页正文全文宽高
        function getContextSize() {
            try {
                return [
                    window.document.body.scrollWidth,
                    window.document.body.scrollHeight
                ];
            } catch (e) {
                return ["undefined", "undefined"];
            }
        };
        //屏幕可用工作区宽高
        function getAvailSize(){
            return [window.screen.availWidth, window.screen.availHeight];
        };
        function getSize() {
            // {网页可见区域宽}x{网页可见区域高},{网页正文全文宽}x{网页正文全文高},{屏幕分辨率的宽}x{屏幕分辨率的高},{屏幕可用工作区宽度}x{屏幕可用工作区高度}
            return [
                getVisibleSize().join("x"),
                getContextSize().join("x"),
                getResolution().join("x"),
                getAvailSize().join("x")
            ].join(",");
        };
        var _platform = window.navigator.platform;
        var _timezoneOffset = new window.Date().getTimezoneOffset();
        _timezoneOffset = _timezoneOffset !== undefined ? _timezoneOffset : "undefined";
        var _vendor = window.navigator.vendor;
        _vendor = typeof _vendor === "string" ? _vendor : "undefined";
        var _activeXObject = window.ActiveXObject;
        _activeXObject = typeof _activeXObject === "undefined" ? "undefined" : true;
        var _cpuClass = window.navigator.cpuClass;
        _cpuClass = _cpuClass === undefined ? "undefined" : _cpuClass;
        var _oscpu = window.navigator.oscpu;
        _oscpu = _oscpu === undefined ? "undefined" : _oscpu;
        var _safari = window.safari;
        _safari = _safari === undefined ? "undefined" : true;
        var _canvasFingerprints = getCanvasFingerprints(getCanvas());
        var _docHidden = getHiddenProp();
        _docHidden = _docHidden === null ? "undefined" : _docHidden;
        var _docVisibleState = getVisibilityState();
        _docVisibleState = _docVisibleState ? _docVisibleState : "undefined";
        var _size = getSize();
        var _product = window.navigator.product;
        _product = _product === undefined ? "undefined" : _product;
        var _productSub = window.navigator.productSub;
        _productSub = _productSub === undefined ? "undefined" : _productSub;
        var _buildID = window.navigator.buildID;
        _buildID = _buildID === undefined ? "undefined" : _buildID;
        var _mt = _platform + "|" + _timezoneOffset + "|" + _vendor + "|" + _activeXObject + "|" + _cpuClass + "|" + _oscpu + "|" + _safari + "|" + _canvasFingerprints + "|" + _docHidden + "|" + _docVisibleState + "|" + _size + "|" + _product + "|" + _productSub + "|" + _buildID;
        var _base64 = new __ut.saBase64();
        SAUP.sendLogData("custom", {
            eventType: "heimdallr",
            mt: _base64.encode(_mt)
        })
        sa.heimdallrSend = true;
    };
    sa.ready(_heimdallr);
})(window);
