//==本JS是加载Lodop插件或Web打印服务CLodop/Lodop7的综合示例，可直接使用，建议理解后融入自己程序==

//用双端口加载主JS文件Lodop.js(或CLodopfuncs.js兼容老版本)以防其中某端口被占:
const MainJS ="CLodopfuncs.js";
      URL_WS1   = "ws://localhost:8000/"+MainJS,                //ws用8000/18000
      URL_WS2   = "ws://localhost:18000/"+MainJS,
      URL_HTTP1 = "http://localhost:8000/"+MainJS,              //http用8000/18000
      URL_HTTP2 = "http://localhost:18000/"+MainJS,
      URL_HTTP3 = "https://localhost.lodop.net:8443/"+MainJS;   //https用8000/8443
var CreatedOKLodopObject, CLodopIsLocal, LoadJsState;

//==判断是否需要CLodop(那些不支持插件的浏览器):==
function needCLodop() {
    try {
        var ua = navigator.userAgent;
        if (ua.match(/Windows\sPhone/i) ||
            ua.match(/iPhone|iPod|iPad/i) ||
            ua.match(/Android/i) ||
            ua.match(/Edge\D?\d+/i))
            return true;
        var verTrident = ua.match(/Trident\D?\d+/i);
        var verIE = ua.match(/MSIE\D?\d+/i);
        var verOPR = ua.match(/OPR\D?\d+/i);
        var verFF = ua.match(/Firefox\D?\d+/i);
        var x64 = ua.match(/x64/i);
        if ((!verTrident) && (!verIE) && (x64)) return true;
        else if (verFF) {
            verFF = verFF[0].match(/\d+/);
            if ((verFF[0] >= 41) || (x64)) return true;
        } else if (verOPR) {
            verOPR = verOPR[0].match(/\d+/);
            if (verOPR[0] >= 32) return true;
        } else if ((!verTrident) && (!verIE)) {
            var verChrome = ua.match(/Chrome\D?\d+/i);
            if (verChrome) {
                verChrome = verChrome[0].match(/\d+/);
                if (verChrome[0] >= 41) return true;
            }
        }
        return false;
    } catch (err) {
        return true;
    }
}

//==检查加载成功与否，如没成功则用http(s)再试==
//==低版本CLODOP6.561/Lodop7.043及前)用本方法==
function checkOrTryHttp() {
  if (window.CLODOP2015_7028) {
     LoadJsState = "complete";
     return true;
  }
  if (LoadJsState == "loadingB" || LoadJsState == "complete") return;
  LoadJsState = "loadingB";
  var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
  var JS1 = document.createElement("script")
     ,JS2 = document.createElement("script")
     ,JS3 = document.createElement("script");
  JS1.src = URL_HTTP1;
  JS2.src = URL_HTTP2;
  JS3.src = URL_HTTP3;
  JS1.onload = JS2.onload = JS3.onload = JS2.onerror = JS3.onerror=function(){LoadJsState = "complete";}
  JS1.onerror = function(e) {
      if (window.location.protocol !== 'https:')
          head.insertBefore(JS2, head.firstChild); else
          head.insertBefore(JS3, head.firstChild);
  }
  head.insertBefore(JS1,head.firstChild);
}

//==加载Lodop对象的主过程:==
(function loadCLodop(){
  if (!needCLodop()) return;
  CLodopIsLocal = !!((URL_WS1 + URL_WS2).match(/\/\/localho|\/\/127.0.0./i));

  LoadJsState = "loadingA";
  if (!window.WebSocket && window.MozWebSocket) window.WebSocket=window.MozWebSocket;
  if (!window.WebSocket) return(checkOrTryHttp());
  //ws方式速度快(小于200ms)且可避免CORS错误,但要求Lodop版本足够新:
  try { var WSK1=new WebSocket(URL_WS1);}
  catch (err) {console.log(err) ;setTimeout("checkOrTryHttp();",200); }
 
  WSK1.onopen = function(e) { setTimeout("checkOrTryHttp();",200); }
  WSK1.onmessage = function(e) {if (!window.CLODOP2015_7028) eval(e.data);}
  WSK1.onerror = function(e) {
       var WSK2=new WebSocket(URL_WS2);
       WSK2.onopen = function(e) {setTimeout("checkOrTryHttp();",200);}
       WSK2.onmessage = function(e) {if (!window.CLODOP2015_7028) eval(e.data);}
       WSK2.onerror= function(e) {checkOrTryHttp();}
  }
})();

//==获取LODOP对象主过程,判断是否安装、需否升级:==
function getLodop(oOBJECT, oEMBED) {
    var strFontTag = "<br><font color='#FF00FF'>打印控件";
    var strLodopInstall = strFontTag + "未安装!点击这里<a href='install_lodop32.exe' target='_self'>执行安装</a>";
    var strLodopUpdate = strFontTag + "需要升级!点击这里<a href='install_lodop32.exe' target='_self'>执行升级</a>";
    var strLodop64Install = strFontTag + "未安装!点击这里<a href='install_lodop64.exe' target='_self'>执行安装</a>";
    var strLodop64Update = strFontTag + "需要升级!点击这里<a href='install_lodop64.exe' target='_self'>执行升级</a>";
    var strCLodopInstallA = "<br><font color='#FF00FF'>Web打印服务CLodop未安装启动，点击这里<a href='CLodop_Setup_for_Win32NT.exe' target='_self'>下载执行安装</a>";
    var strCLodopInstallB = "<br>（若此前已安装过，可<a href='CLodop.protocol:setup' target='_self'>点这里直接再次启动</a>）";
    var strCLodopUpdate = "<br><font color='#FF00FF'>Web打印服务CLodop需升级!点击这里<a href='CLodop_Setup_for_Win32NT.exe' target='_self'>执行升级</a>";
    var strLodop7FontTag = "<br><font color='#FF00FF'>Web打印服务Lodop7";
    var strLodop7HrefX86 = "点击这里<a href='Lodop7_Linux_X86_64.tar.gz' target='_self'>下载安装</a>(下载后解压，点击lodop文件开始执行)";
    var strLodop7HrefARM = "点击这里<a href='Lodop7_Linux_ARM64.tar.gz'  target='_self'>下载安装</a>(下载后解压，点击lodop文件开始执行)";
    var strLodop7Install_X86 = strLodop7FontTag + "未安装启动，" + strLodop7HrefX86;
    var strLodop7Install_ARM = strLodop7FontTag + "未安装启动，" + strLodop7HrefARM;
    var strLodop7Update_X86 = strLodop7FontTag + "需升级，" + strLodop7HrefX86;
    var strLodop7Update_ARM = strLodop7FontTag + "需升级，" + strLodop7HrefARM;
    var strInstallOK = "，成功后请刷新本页面或重启浏览器。</font>";
    var LODOP;
    try {
        var isWinIE = (/MSIE/i.test(navigator.userAgent)) || (/Trident/i.test(navigator.userAgent));
        var isWinIE64 = isWinIE && (/x64/i.test(navigator.userAgent));
        var isLinuxX86 = (/Linux/i.test(navigator.platform)) && (/x86/i.test(navigator.platform));
        var isLinuxARM = (/Linux/i.test(navigator.platform)) && (/aarch/i.test(navigator.platform));

        if (needCLodop() || isLinuxX86 || isLinuxARM) {
            try {
                LODOP = window.CLODOP2015_7028;
            } catch (err) {}
            if (!LODOP && LoadJsState !== "complete") {
                if (LoadJsState == "loading")
                    alert("网页还没下载完毕，请稍等一下再操作."); else
                    alert("未曾加载Lodop主JS文件，请先调用loadCLodop过程.");
                return;
            }
            var strAlertMessage;
            if (!LODOP) {
                if (isLinuxX86)
                    strAlertMessage = strLodop7Install_X86;
                else if (isLinuxARM)
                    strAlertMessage = strLodop7Install_ARM;
                else
                    strAlertMessage = strCLodopInstallA + (CLodopIsLocal ? strCLodopInstallB : "");
                document.body.innerHTML = strAlertMessage + strInstallOK + document.body.innerHTML;
                return;
            } else {
                if (isLinuxX86 && LODOP.CVERSION < "7.0.4.3")
                    strAlertMessage = strLodop7Update_X86;
                else if (isLinuxARM && LODOP.CVERSION < "7.0.4.3")
                    strAlertMessage = strLodop7Update_ARM;
                else if (CLODOP.CVERSION < "6.5.6.4")
                    strAlertMessage = strCLodopUpdate;

                if (strAlertMessage)
                    document.body.innerHTML = strAlertMessage + strInstallOK + document.body.innerHTML;
            }
        } else {
            //==如果页面有Lodop插件就直接使用,否则新建:==
            if (oOBJECT || oEMBED) {
                if (isWinIE)
                    LODOP = oOBJECT;
                else
                    LODOP = oEMBED;
            } else if (!CreatedOKLodopObject) {
                LODOP = document.createElement("object");
                LODOP.setAttribute("width", 0);
                LODOP.setAttribute("height", 0);
                LODOP.setAttribute("style", "position:absolute;left:0px;top:-100px;width:0px;height:0px;");
                if (isWinIE)
                    LODOP.setAttribute("classid", "clsid:2105C259-1E0C-4534-8141-A753534CB4CA");
                else
                    LODOP.setAttribute("type", "application/x-print-lodop");
                document.documentElement.appendChild(LODOP);
                CreatedOKLodopObject = LODOP;
            } else
                LODOP = CreatedOKLodopObject;
            //==Lodop插件未安装时提示下载地址:==
            if ((!LODOP) || (!LODOP.VERSION)) {
                document.body.innerHTML = (isWinIE64 ? strLodop64Install : strLodopInstall) + strInstallOK + document.body.innerHTML;
                return LODOP;
            }
            if (LODOP.VERSION < "6.2.2.6") {
                document.body.innerHTML = (isWinIE64 ? strLodop64Update : strLodopUpdate) + strInstallOK + document.body.innerHTML;
            }
        }
        //===如下空白位置适合调用统一功能(如注册语句、语言选择等):=======================


        //===============================================================================
        return LODOP;
    } catch (err) {
        alert("getLodop出错:" + err);
    }
}


/*


                           http                                                     https



                                                 Mixed Content错误

                    http://localhost:8000/                                  https://localhost:8443/               
                                                                                                               Chrome 84 不支持 TLS 1. 1                
                                                                            https://localhost.lodop.net:8443/            



                    Chrome94版阻断http页面访问localhost服务
                    Block insecure private network requests错误  
                    解决方法  1 改chrome设置block  2 网站改成https
                             3 clodop通过webcosk加载js  
-------------------------------------------------------------------------------------------------------------------------------------------------
                      
                    网站是http                                                网站是https
    
            测试网址1 http://hkb818ae00.youhui112.com/index.html            测试网址1 https://oowuyue.github.io/index.html
                加载http8000                                                     加载http8000

            测试网址2 http://hkb818ae00.youhui112.com/index2.html           测试网址2 https://oowuyue.github.io/index2.html
                加载https8443                                                    加载https8443
        

       chrome105                                                                    
       Edge103      都无法访问 报Block insecure private 错误                     都可以访问
       QQ 94内核


   360急速86内核     都可以访问                                                  都可以访问

                                                                                                                                                                        
        火狐102      都可以访问                                                  都可以访问
 

    火狐52(麒麟)     都可以访问                                                  http8000无法访问 报Mixed Content错误   直接ws8000 报The operation is insecure.
                                                                                https8443可以访问                     直接wss8443不报错但返回0字节
                                                                               

                                                                               https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content             
                                                                               https://support.mozilla.org/zh-CN/kb/%E5%A6%82%E4%BD%95%E9%92%88%E5%AF%B9%E5%AE%89%E5%85%A8%E7%BD%91%E7%AB%99%E7%9A%84%E9%94%99%E8%AF%AF%E7%A0%81%E8%BF%9B%E8%A1%8C%E6%95%85%E9%9A%9C%E6%8E%92%E9%99%A4

                                                                               
               
                                                                                
         

                   
                 
                  
 */  
