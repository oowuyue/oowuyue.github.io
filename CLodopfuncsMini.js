(function (win) {
        var CLODOP = {
                strWebPageID: "08AAAAC", strTaskID: "", strHostURI: "http://localhost:8000",
                VERSION: "6.5.7.7", IVERSION: "6577", CVERSION: "6.5.7.7", HTTPS_STATUS: 0, VERSION_EXT: true,
                iBaseTask: 0, timeThreshold: 5, Priority: 0, blIslocal: true,
                Iframes: [], ItemDatas: {}, PageData: {}, defStyleJson: {}, PageDataEx: {}, ItemCNameStyles: {},
                blWorking: false, blNormalItemAdded: false, blTmpSelectedIndex: null, Caption: null, Color: null, CompanyName: null, strBroadcastMS: null,
                Border: null, Inbrowse: null, webskt: null, SocketEnable: false, SocketOpened: false, NoClearAfterPrint: false, On_Return_Remain: false, On_Broadcast_Remain: false,
                On_Return: null, Result: null, OBO_Mode: 1, blOneByone: false, DelimChar: "\f\f", Printers: { "default": "3", "list": [{ "name": "导出为WPS PDF", "DriverName": "Kingsoft Virtual Printer Driver", "PortName": "Kingsoft Virtual Printer Port", "Orientation": "1", "PaperSize": "9", "PaperLength": "2970", "PaperWidth": "2100", "Copies": "1", "DefaultSource": "1", "PrintQuality": "600", "Color": "2", "Duplex": "1", "FormName": "A4", "Comment": "", "DriverVersion": "20481", "DCOrientation": "90", "MaxExtentWidth": "65535", "MaxExtentLength": "65535", "MinExtentWidth": "10", "MinExtentlength": "10", "pagelist": [{ "name": "信纸" }, { "name": "小号信纸" }, { "name": "Tabloid" }, { "name": "Ledger" }, { "name": "法律专用纸" }, { "name": "Statement" }, { "name": "Executive" }, { "name": "A3" }, { "name": "A4" }, { "name": "A4 小号" }, { "name": "A5" }, { "name": "B4 (JIS)" }, { "name": "B5 (JIS)" }, { "name": "Folio" }, { "name": "Quarto" }, { "name": "10x14" }, { "name": "11x17" }, { "name": "便笺" }, { "name": "信封 #9" }, { "name": "信封 #10" }, { "name": "信封 #11" }, { "name": "信封 #12" }, { "name": "信封 #14" }, { "name": "C size sheet" }, { "name": "D size sheet" }, { "name": "E size sheet" }, { "name": "信封 DL" }, { "name": "信封 C5" }, { "name": "信封 C3" }, { "name": "信封 C4" }, { "name": "信封 C6" }, { "name": "信封 C65" }, { "name": "信封 B4" }, { "name": "信封 B5" }, { "name": "信封 B6" }, { "name": "信封" }, { "name": "信封 Monarch" }, { "name": "6 3/4 信封" }, { "name": "美国标准 Fanfold" }, { "name": "德国标准 Fanfold" }, { "name": "德国法律专用纸 Fanfold" }, { "name": "B4 (ISO)" }, { "name": "日式明信片" }, { "name": "9x11" }, { "name": "10x11" }, { "name": "15x11" }, { "name": "信封邀请函" }, { "name": "特大信纸" }, { "name": "特大法律专用纸" }, { "name": "Tabloid 特大" }, { "name": "A4 特大" }, { "name": "信纸横向" }, { "name": "A4 横向" }, { "name": "特大信纸横向" }, { "name": "Super A" }, { "name": "Super B" }, { "name": "信纸加大" }, { "name": "A4 加大" }, { "name": "A5 横向" }, { "name": "B5 (JIS) 横向" }, { "name": "A3 特大" }, { "name": "A5 特大" }, { "name": "B5 (ISO) 特大" }, { "name": "A2" }, { "name": "A3 横向" }, { "name": "A3 特大横向" }, { "name": "日式往返明信片" }, { "name": "A6" }, { "name": "日式信封 Kaku #2" }, { "name": "日式信封 Kaku #3" }, { "name": "日式信封 Chou #3" }, { "name": "日式信封 Chou #4" }, { "name": "信纸旋转" }, { "name": "A3 旋转" }, { "name": "A4 旋转" }, { "name": "A5 旋转" }, { "name": "B4 (JIS) 旋转" }, { "name": "B5 (JIS) 旋转" }, { "name": "日式明信片旋转" }, { "name": "双层日式明信片旋转" }, { "name": "A6 旋转" }, { "name": "日式信封 Kaku #2 旋转" }, { "name": "日式信封 Kaku #3 旋转" }, { "name": "日式信封 Chou #3 旋转" }, { "name": "日式信封 Chou #4 旋转" }, { "name": "B6 (JIS)" }, { "name": "B6 (JIS) 旋转" }, { "name": "12x11" }, { "name": "日式信封 You #4" }, { "name": "日式信封 You #4 旋转" }, { "name": "PRC 16K" }, { "name": "PRC 32K" }, { "name": "PRC 32K(Big)" }, { "name": "PRC 信封 #1" }, { "name": "PRC 信封 #2" }, { "name": "PRC 信封 #3" }, { "name": "PRC 信封 #4" }, { "name": "PRC 信封 #5" }, { "name": "PRC 信封 #6" }, { "name": "PRC 信封 #7" }, { "name": "PRC 信封 #8" }, { "name": "PRC 信封 #9" }, { "name": "PRC 信封 #10" }, { "name": "PRC 16K 旋转" }, { "name": "PRC 32K 旋转" }, { "name": "PRC 32K(大)旋转" }, { "name": "PRC 信封 #1 旋转" }, { "name": "PRC 信封 #2 旋转" }, { "name": "PRC 信封 #3 旋转" }, { "name": "PRC 信封 #4 旋转" }, { "name": "PRC 信封 #5 旋转" }, { "name": "PRC 信封 #6 旋转" }, { "name": "PRC 信封 #7 旋转" }, { "name": "PRC 信封 #8 旋转" }, { "name": "PRC 信封 #9 旋转" }, { "name": "PRC 信封 #10 旋转" }], "subdevlist": [] }, { "name": "Lenovo M7400 Printer", "DriverName": "Lenovo M7400 Printer", "PortName": "LPT1:", "Orientation": "1", "PaperSize": "9", "PaperLength": "2970", "PaperWidth": "2100", "Copies": "1", "DefaultSource": "7", "PrintQuality": "600", "Color": "1", "Duplex": "1", "FormName": "A4", "Comment": "", "DriverVersion": "257", "DCOrientation": "90", "MaxExtentWidth": "2159", "MaxExtentLength": "4064", "MinExtentWidth": "762", "MinExtentlength": "1160", "pagelist": [{ "name": "A4" }, { "name": "Letter" }, { "name": "Legal" }, { "name": "Executive" }, { "name": "A5" }, { "name": "A5 Long Edge" }, { "name": "A6" }, { "name": "B5" }, { "name": "16K（195 x 270 毫米）" }, { "name": "16K（184 x 260 毫米）" }, { "name": "16K（197 x 273 毫米）" }, { "name": "JIS B5" }, { "name": "B6" }, { "name": "Com-10" }, { "name": "DL" }, { "name": "C5" }, { "name": "Monarch" }, { "name": "3 x 5" }, { "name": "Folio" }, { "name": "DL Long Edge" }, { "name": "A3" }, { "name": "JIS B4" }, { "name": "Ledger" }, { "name": "用户定义" }], "subdevlist": [] }, { "name": "HP DJ 4670 series", "DriverName": "HP DJ 4670 series", "PortName": "LPT1:", "Orientation": "1", "PaperSize": "9", "PaperLength": "2970", "PaperWidth": "2100", "Copies": "1", "DefaultSource": "15", "PrintQuality": "600", "Color": "2", "Duplex": "1", "FormName": "A4", "Comment": "", "DriverVersion": "1539", "DCOrientation": "270", "MaxExtentWidth": "2159", "MaxExtentLength": "3556", "MinExtentWidth": "762", "MinExtentlength": "1270", "pagelist": [{ "name": "信纸" }, { "name": "法律专用纸" }, { "name": "Statement" }, { "name": "Executive" }, { "name": "A4" }, { "name": "A5" }, { "name": "B5 (JIS)" }, { "name": "信封 #10" }, { "name": "信封 DL" }, { "name": "信封 C5" }, { "name": "信封 C6" }, { "name": "信封 Monarch" }, { "name": "6 3/4 信封" }, { "name": "日式明信片" }, { "name": "A6" }, { "name": "日式信封 Chou #3" }, { "name": "日式信封 Chou #4" }, { "name": "ANSI A" }, { "name": "4x6 英寸/10x15 厘米" }, { "name": "2L 127x178 毫米" }, { "name": "3x5 英寸" }, { "name": "5x7 英寸/13x18 厘米" }, { "name": "8.5x13 英寸" }, { "name": "8x10英寸" }, { "name": "B5 (ISO) 176x250 毫米" }, { "name": "信封 A2 111x146 毫米" }, { "name": "索引卡 3x5 英寸" }, { "name": "索引卡 4x6 英寸" }, { "name": "索引卡 5x8 英寸" }, { "name": "索引卡 Letter 8.5x11 英寸" }, { "name": "索引卡 A4 8.27x11.69 英寸" }, { "name": "3.5x5 英寸/L 89x127 毫米" }, { "name": "Ofuku hagaki 200x148 毫米" }], "subdevlist": [] }, { "name": "Doro PDF Writer", "DriverName": "Doro PDF Writer", "PortName": "Doro PDF Writer", "Orientation": "1", "PaperSize": "9", "PaperLength": "2970", "PaperWidth": "2100", "Copies": "1", "DefaultSource": "15", "PrintQuality": "600", "Color": "2", "Duplex": "1", "FormName": "A4", "Comment": "visit http://j.mp/the_sz", "DriverVersion": "1539", "DCOrientation": "90", "MaxExtentWidth": "32767", "MaxExtentLength": "32767", "MinExtentWidth": "254", "MinExtentlength": "254", "pagelist": [{ "name": "Tabloid" }, { "name": "Ledger" }, { "name": "A3" }, { "name": "A4" }, { "name": "A5" }, { "name": "A2" }, { "name": "A6" }, { "name": "Legal" }, { "name": "Letter" }, { "name": "ExtraLarge" }, { "name": "LetterSmall" }, { "name": "A4 Small" }, { "name": "A0" }, { "name": "A1" }, { "name": "A7" }, { "name": "A8" }, { "name": "A9" }, { "name": "A10" }, { "name": "ISO B0" }, { "name": "ISO B1" }, { "name": "ISO B2" }, { "name": "ISO B3" }, { "name": "ISO B4" }, { "name": "ISO B5" }, { "name": "ISO B6" }, { "name": "JIS B0" }, { "name": "JIS B1" }, { "name": "JIS B2" }, { "name": "JIS B3" }, { "name": "JIS B4" }, { "name": "JIS B5" }, { "name": "JIS B6" }, { "name": "C0" }, { "name": "C1" }, { "name": "C2" }, { "name": "C3" }, { "name": "C4" }, { "name": "ARCH E" }, { "name": "C5" }, { "name": "ARCH D" }, { "name": "C6" }, { "name": "ARCH C" }, { "name": "ARCH B" }, { "name": "ARCH A" }, { "name": "FLSA" }, { "name": "FLSE" }, { "name": "Oversize A2" }, { "name": "HalfLetter" }, { "name": "Oversize A1" }, { "name": "PA4" }, { "name": "Oversize A0" }, { "name": "92x92" }, { "name": "ARCH E1" }, { "name": "ARCH E2" }, { "name": "ARCH E3" }, { "name": "LodopCustomPage" }, { "name": "ANSI A" }, { "name": "ANSI B" }, { "name": "ANSI C" }, { "name": "ANSI D" }, { "name": "ANSI E" }, { "name": "ANSI F" }, { "name": "PostScript 自定义页面大小" }], "subdevlist": [] }] },
                altMessageWebSocketInvalid: "WebSocket没准备好，请稍后重试!",
                altMessageNoReadWriteFile: "不能远程读写文件!",
                altMessageNoReadFile: "不能远程读文件!",
                altMessageNoWriteFile: "不能远程写文件!",
                altMessageNoPrintDesign: "不能远程打印设计!",
                altMessageNoPrintSetup: "不能远程打印维护!",
                altMessageSomeWindowExist: "有窗口已打开，先关闭它(持续如此时请刷新页面)!",
                altMessageBusy: "上一个请求正忙，请稍后再试！",
                Browser: (function () {
                        var ua = navigator.userAgent;
                        var isOpera = Object.prototype.toString.call(window.opera) == "[object Opera]";
                        return {
                                IE: !!window.attachEvent && !isOpera,
                                Opera: isOpera,
                                WebKit: ua.indexOf("AppleWebKit/") > -1,
                                Gecko: ua.indexOf("Gecko") > -1 && ua.indexOf("KHTML") === -1,
                                MobileSafari: /Apple.*Mobile/.test(ua)
                        }
                })(),

                DoInit:
                        function () {
                                this.strTaskID = "";
                                if (this.NoClearAfterPrint) return;
                                this.ItemDatas = { "count": 0 };
                                this.PageData = {};
                                this.ItemCNameStyles = {};
                                this.defStyleJson = { "beginpage": 0, "beginpagea": 0 };
                                this.blNormalItemAdded = false;
                        },
                OpenWebSocket:
                        function () {
                                if (!window.WebSocket && !window.MozWebSocket) {
                                        if (window.On_CLodop_Opened) {
                                                if (CLODOP.Priority == window.CLODOP_OK_Priority) setTimeout("window.On_CLodop_Opened(CLODOP)", 1);
                                        }
                                        return;
                                }
                                this.SocketEnable = true;
                                try {
                                        if (!this.webskt || this.webskt.readyState == 3) {
                                                if (!window.WebSocket && window.MozWebSocket) window.WebSocket = window.MozWebSocket;
                                                this.webskt = new WebSocket('ws://127.0.0.1:8000/c_webskt/');
                                                this.webskt.onopen = function (e) {
                                                        CLODOP.SocketOpened = true;
                                                        if (window.On_CLodop_Opened) {
                                                                if (CLODOP.Priority == window.CLODOP_OK_Priority) setTimeout("window.On_CLodop_Opened(CLODOP)", 1);
                                                        }
                                                };
                                                this.webskt.onmessage = function (e) {
                                                        CLODOP.blOneByone = false;
                                                        var strResult = e.data;
                                                        CLODOP.Result = strResult;
                                                        try {
                                                                var strFTaskID = null;
                                                                var iPos = strResult.indexOf("=");
                                                                if (iPos >= 0 && iPos < 30) {
                                                                        strFTaskID = strResult.slice(0, iPos);
                                                                        strResult = strResult.slice(iPos + 1);
                                                                }
                                                                if (strFTaskID.indexOf("ErrorMS") > -1) {
                                                                        alert(strResult);
                                                                        return;
                                                                }
                                                                if (strFTaskID.indexOf("BroadcastMS") > -1) {
                                                                        CLODOP.strBroadcastMS = strResult;
                                                                        if (CLODOP.On_Broadcast) {
                                                                                var selfFunc = CLODOP.On_Broadcast;
                                                                                CLODOP.On_Broadcast(strResult);
                                                                                if (!CLODOP.On_Broadcast_Remain && selfFunc === CLODOP.On_Broadcast)
                                                                                        CLODOP.On_Broadcast = null;
                                                                        }
                                                                        return;
                                                                }
                                                                if (CLODOP.On_Return) {
                                                                        var selfFunc = CLODOP.On_Return;
                                                                        if ((strResult.toLowerCase() == "true") || (strResult.toLowerCase() == "false"))
                                                                                CLODOP.On_Return(strFTaskID, strResult.toLowerCase() == "true"); else
                                                                                CLODOP.On_Return(strFTaskID, strResult);
                                                                        if (!CLODOP.On_Return_Remain && selfFunc === CLODOP.On_Return) CLODOP.On_Return = null;
                                                                }
                                                        } catch (err) { };
                                                };
                                                this.webskt.onclose = function (e) {
                                                        if (!CLODOP.SocketOpened) { CLODOP.SocketEnable = false; return; }
                                                        setTimeout("CLODOP.OpenWebSocket()", 2000);
                                                };
                                                this.webskt.onerror = function (e) { };
                                        }
                                } catch (err) {
                                        this.webskt = null;
                                        if (err.message.indexOf("SecurityError") > -1)
                                                this.SocketEnable = false; else
                                                setTimeout("CLODOP.OpenWebSocket()", 2000);
                                }
                        },

                PRINT_INIT:
                        function (strPrintTask) {
                                return this.PRINT_INITA(null, null, null, null, strPrintTask);
                        },
                PRINT_INITA:
                        function (Top, Left, Width, Height, strPrintTask) {
                                if (Top === undefined || Top === null) Top = "";
                                if (Left === undefined || Left === null) Left = "";
                                if (Width === undefined || Width === null) Width = "";
                                if (Height === undefined || Height === null) Height = "";
                                if (strPrintTask === undefined || strPrintTask === null) strPrintTask = "";
                                this.NoClearAfterPrint = false;
                                this.DoInit();
                                this.PageData["top"] = Top;
                                this.PageData["left"] = Left;
                                this.PageData["width"] = Width;
                                this.PageData["height"] = Height;
                                this.PageData["printtask"] = strPrintTask;
                                return true;
                        },
                ADD_PRINT_TEXT:
                        function (top, left, width, height, strText) {
                                return this.AddItemArray(2, top, left, width, height, strText);
                        },
                PREVIEW:
                        function (destView, iWidth, iHigh, iOption) {
                                if (this.blWorking) { alert(this.altMessageBusy); return null; }
                                var tResult = null;
                                if ((!destView) && (this.blIslocal) && (!this.PageData["printersubid"])) {
                                        if (this.DoPostDatas("preview") == true) {
                                                this.Result = null;
                                                this.GetLastResult(true);
                                                tResult = this.GetTaskID();
                                        }
                                } else {
                                        if (this.DoPostDatas("cpreview") == true) {
                                                this.DoCPreview(destView, iWidth, iHigh, iOption);
                                                tResult = this.GetTaskID();
                                        }
                                }
                                this.DoInit();
                                this.blWorking = false;
                                return tResult;
                        },

                SET_PRINT_MODE:
                        function (strModeType, ModeValue) {
                                if (strModeType === undefined || strModeType === null) strModeType = "";
                                if (ModeValue === undefined || ModeValue === null) ModeValue = "";
                                if (strModeType === "") return false;
                                strModeType = strModeType.toLowerCase();
                                this.PageData[strModeType] = ModeValue;
                                if (strModeType == "noclear_after_print") this.NoClearAfterPrint = ModeValue;
                                if (strModeType.indexOf("window_def") > -1 || strModeType.indexOf("control_printer") > -1) {
                                        var tResult = null;
                                        if (this.DoPostDatas("onlysetprint") == true) {
                                                this.GetLastResult(false);
                                                tResult = this.GetTaskID();
                                        }
                                        this.DoInit();
                                        this.blWorking = false;
                                        return tResult;
                                }
                        },

                AddItemArray:
                        function (type, top, left, width, height, strContent, itemname, ShapeType, intPenStyle, intPenWidth, intColor, isLinePosition, BarType, strChartTypess) {
                                if (top === undefined || left === undefined || width === undefined || height === undefined || strContent === undefined) {
                                        return false;
                                }
                                var sCount = this.ItemDatas["count"];
                                sCount++;
                                var oneItem = {};
                                for (var vstyle in this.defStyleJson) {
                                        oneItem[vstyle] = this.defStyleJson[vstyle];
                                }
                                oneItem["type"] = type;
                                oneItem["top"] = top;
                                oneItem["left"] = left;
                                oneItem["width"] = width;
                                oneItem["height"] = height;
                                if (strContent != null) {
                                        if (typeof strContent === "string" && strContent.indexOf(this.DelimChar) > -1)
                                                oneItem["content"] = strContent.replace(new RegExp(this.DelimChar, 'g'), ''); else
                                                oneItem["content"] = strContent;
                                }
                                if ((itemname !== undefined) && (itemname != null)) oneItem["itemname"] = itemname + "";
                                if ((ShapeType !== undefined) && (ShapeType != null)) oneItem["shapetype"] = ShapeType;
                                if ((intPenStyle !== undefined) && (intPenStyle != null)) oneItem["penstyle"] = intPenStyle;
                                if ((intPenWidth !== undefined) && (intPenWidth != null)) oneItem["penwidth"] = intPenWidth;
                                if ((intColor !== undefined) && (intColor != null)) oneItem["fontcolor"] = intColor;
                                if ((isLinePosition !== undefined) && (isLinePosition != null)) oneItem["lineposition"] = "1";
                                if ((BarType !== undefined) && (BarType != null)) oneItem["fontname"] = BarType;
                                if ((strChartTypess !== undefined) && (strChartTypess != null)) oneItem["charttypess"] = strChartTypess;

                                oneItem["beginpage"] = this.defStyleJson["beginpage"];
                                oneItem["beginpagea"] = this.defStyleJson["beginpagea"];
                                this.ItemDatas["count"] = sCount;
                                this.ItemDatas[sCount] = oneItem;
                                this.blNormalItemAdded = true;
                                return true;
                        },


                createPostDataString:
                        function (afterPostAction) {
                                var strData = "act=" + afterPostAction + this.DelimChar;
                                strData = strData + "browseurl=" + window.location.href + this.DelimChar;
                                for (var vMode in this.PageDataEx) {
                                        strData = strData + vMode + "=" + this.PageDataEx[vMode] + this.DelimChar;
                                }
                                var PrintModeNamess = "";
                                for (var vMode in this.PageData) {
                                        strData = strData + vMode + "=" + this.PageData[vMode] + this.DelimChar;
                                        if (vMode != "top" && vMode != "left" && vMode != "width" && vMode != "height" && vMode != "printtask" && vMode != "printerindex" && vMode != "printerindexa" && vMode != "printersubid" && vMode != "orient" && vMode != "pagewidth" && vMode != "pageheight" && vMode != "pagename" && vMode != "printcopies" && vMode != "setup_bkimg")
                                                PrintModeNamess = PrintModeNamess + ";" + vMode;
                                }
                                if (PrintModeNamess !== "")
                                        strData = strData + "printmodenames=" + PrintModeNamess + this.DelimChar;
                                var StyleClassNamess = "";
                                for (var vClassStyle in this.ItemCNameStyles) {
                                        strData = strData + vClassStyle + "=" + this.ItemCNameStyles[vClassStyle] + this.DelimChar;
                                        StyleClassNamess = StyleClassNamess + ";" + vClassStyle;
                                }
                                if (StyleClassNamess !== "")
                                        strData = strData + "printstyleclassnames=" + StyleClassNamess + this.DelimChar;
                                strData = strData + "itemcount=" + this.ItemDatas["count"] + this.DelimChar;
                                for (var vItemNO in this.ItemDatas) {
                                        var ItemStyless = "";
                                        for (var vItemxx in this.ItemDatas[vItemNO]) {
                                                if (vItemxx != "beginpage" && vItemxx != "beginpagea" && vItemxx != "type" && vItemxx != "top" && vItemxx != "left" && vItemxx != "width" && vItemxx != "height")
                                                        ItemStyless = ItemStyless + ";" + vItemxx;
                                        }
                                        strData = strData + vItemNO + "_itemstylenames" + "=" + ItemStyless + this.DelimChar;
                                        for (var vItemxx in this.ItemDatas[vItemNO]) {
                                                strData = strData + vItemNO + "_" + vItemxx + "=" + this.ItemDatas[vItemNO][vItemxx] + this.DelimChar;
                                        }
                                }
                                return strData;
                        },
                wsSend:
                        function (strData, blReTry) {
                                if (!this.SocketEnable) return;
                                if (this.webskt && this.webskt.readyState == 1) {
                                        this.Result = null;
                                        this.webskt.send(strData);
                                        return true;
                                } else {
                                        if (!blReTry)
                                                setTimeout(function () { CLODOP.wsSend(strData, true); }, 600);
                                        else {
                                                alert(this.altMessageWebSocketInvalid);
                                                this.OpenWebSocket();
                                        }
                                }
                        },
                wsDoPostDatas:
                        function (afterPostAction) {
                                var strData = "charset=丂" + this.DelimChar;
                                strData = strData + "tid=" + this.GetTaskID() + this.DelimChar;
                                strData = strData + this.createPostDataString(afterPostAction);
                                return this.wsSend("post:" + strData);
                        },
                DoPostDatas:
                        function (afterPostAction) {
                                if (this.OBO_Mode && this.blOneByone) {
                                        alert(this.altMessageSomeWindowExist);
                                        return false;
                                }
                                this.blWorking = true;
                                if (this.blTmpSelectedIndex !== null)
                                        this.SET_PRINTER_INDEX(this.blTmpSelectedIndex);
                                if (this.SocketEnable) {
                                        return this.wsDoPostDatas(afterPostAction);
                                }
                        },

                GetLastResult:
                        function (blFOneByone) {
                                if (blFOneByone) this.blOneByone = true;
                                if (this.SocketEnable) {
                                        return true;
                                }
                        },
                GetTaskID:
                        function () {
                                if (!this.strTaskID || this.strTaskID == "") {
                                        var dt = new Date();
                                        this.iBaseTask++;
                                        this.strTaskID = "" + dt.getHours() + dt.getMinutes() + dt.getSeconds() + "_" + this.iBaseTask;
                                }
                                return this.strWebPageID + this.strTaskID;
                        },
        };
        if (win.CLODOP2015_7028 && win.CLODOP2015_7028.Priority && win.CLODOP2015_7028.Priority > CLODOP.Priority) {
                CLODOP = win.CLODOP2015_7028;
                win.CLODOP_OK_Priority = win.CLODOP2015_7028.Priority;
                return;
        }
        win.LODOP = CLODOP;
        win.CLODOP = CLODOP;
        win.CLODOP2015_7028 = CLODOP;
        win.CLODOP_OK_Priority = CLODOP.Priority;
        win.CLODOP.DoInit();
        if (navigator.userAgent.indexOf("Lodop") < 0) win.CLODOP.OpenWebSocket();
        win.getCLodop = function () { return window.CLODOP2015_7028; };
})(window);

function getCLodop() {
        return window.CLODOP2015_7028;
}