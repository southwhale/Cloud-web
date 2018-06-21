;(function(ROOT) {
    var Slimf = function(selector) {
        return new Slimf.fn.init(selector)
    };
    var flag={
        version: '0.7.5',
        author:'ZJINH',
        SlimfLoadFlag:true
    };
    Slimf.author=flag.author;
    Slimf.version=flag.version;
    Slimf.fn = Slimf.prototype = {
        eventList:[],
        init: function(selector) {
            if (!selector) {
                return;
            }//selector 本来就是 DomElement 对象，直接返回
            if (selector instanceof $) {
                return selector;
            }
            this.selector = selector;
            var nodeType = selector.nodeType;
            var selectorResult = [];  //根据 selector 得出的结果（如 DOM，DOM List）
            if (nodeType === 9) {
                //document 节点
                selectorResult = [selector];
            } else if (nodeType === 1) {
                //单个 DOM 节点
                selectorResult = [selector];
            } else if ($.isDOMList(selector) || selector instanceof Array) {
                //DOM List 或者数组
                selectorResult = selector;
            } else if (typeof selector === 'string') {
                //字符串
                selector = selector.replace('/\n/mg', '').trim();
                if (selector.indexOf('<') === 0) {
                    //如 <div>
                    var div = document.createElement('div');
                    div.innerHTML = selector;
                    selectorResult=div.children;
                } else {
                    //如 #id .class
                    var result = document.querySelectorAll(selector);
                    if ($.isDOMList(result)) {
                        selectorResult=result;
                    } else {
                        selectorResult=[result];
                    }
                }
            }
            var length = selectorResult.length;
            if (!length) {
                //空数组
                return this;
            } //加入 DOM 节点
            for (var i = 0; i < length; i++) {
                this[i] = selectorResult[i];
            }
            this.length = length;
        },
        forEach: function forEach(fn) {
            for (var i = 0; i < this.length; i++) {
                var elem = this[i];
                var result = fn.call(elem, elem, i);
                if (result === false) {
                    break;
                }
            }
            return this;
        },
        clone: function clone(deep) {
            var cloneList = [];
            this.forEach(function (elem) {
                cloneList.push(elem.cloneNode(!!deep));
            });
            return $(cloneList);
        }, //克隆
        get: function get(index) {
            var length = this.length;
            if (index >= length) {
                index = index % length;
            }
            return $(this[index]);
        },
        first: function first() {
            return this.get(0);
        },
        last: function last() {
            return this.get(this.length - 1);
        },
        on: function on(type, selector, fn) {
            if (!fn) {
                fn = selector;
                selector = null;
            }
            var types = [];
            types = type.split(/\s+/);
            var _this=this;
            return this.forEach(function (elem) {
                types.forEach(function (type) {
                    if (!type) {
                        return;
                    }
                    _this.eventList.push({
                        elem: elem,
                        type: type,
                        fn: fn
                    });
                    if (!selector) {
                        elem.addEventListener(type, fn);
                        return;
                    }
                    elem.addEventListener(type, function (e) {
                        var target = e.target;
                        if (target.matches(selector)) {
                            fn.call(target, e);
                        }
                    });
                });
            });
        },
        off: function off(type, fn) {
            return this.forEach(function (elem) {
                elem.removeEventListener(type, fn);
            });
        },
        offAll:function () {
            this.eventList.forEach(function (item) {
                var elem = item.elem;
                var type = item.type;
                var fn = item.fn;
                elem.removeEventListener(type, fn);
            });
        },
        attr: function attr(key, val) {
            if (val === null) {
                return this[0].getAttribute(key);
            } else {
                return this.forEach(function (elem) {
                    elem.setAttribute(key, val);
                });
            }
        },
        addClass: function addClass(className) {
            if (!className) {
                return this;
            }
            return this.forEach(function (elem) {
                var arr = void 0;
                if (elem.className) {
                    //解析当前 className 转换为数组
                    arr = elem.className.split(/\s/);
                    arr = arr.filter(function (item) {
                        return !!item.trim();
                    });
                    //添加 class
                    if (arr.indexOf(className) < 0) {
                        arr.push(className);
                    }
                    //修改 elem.class
                    elem.className = arr.join(' ');
                } else {
                    elem.className = className;
                }
            });
        },
        removeClass: function removeClass(className) {
            if (!className) {
                return this;
            }
            return this.forEach(function (elem) {
                var arr = void 0;
                if (elem.className) {
                    //解析当前 className 转换为数组
                    arr = elem.className.split(/\s/);
                    arr = arr.filter(function (item) {
                        item = item.trim();
                        //删除 class
                        return !(!item || item === className)
                    });
                    elem.className = arr.join(' ');
                }
            });
        },
        css: function css(key, val) {
            var currentStyle = key + ':' + val + ';';
            return this.forEach(function (elem) {
                var style = (elem.getAttribute('style') || '').trim();
                var styleArr = void 0,
                    resultArr = [];
                if (style) {
                    //将 style 按照 ; 拆分为数组
                    styleArr = style.split(';');
                    styleArr.forEach(function (item) {
                        //对每项样式，按照 : 拆分为 key 和 value
                        var arr = item.split(':').map(function (i) {
                            return i.trim();
                        });
                        if (arr.length === 2) {
                            resultArr.push(arr[0] + ':' + arr[1]);
                        }
                    });
                    //替换或者新增
                    resultArr = resultArr.map(function (item) {
                        if (item.indexOf(key) === 0) {
                            return currentStyle;
                        } else {
                            return item;
                        }
                    });
                    if (resultArr.indexOf(currentStyle) < 0) {
                        resultArr.push(currentStyle);
                    }
                    //结果
                    elem.setAttribute('style', resultArr.join('; '));
                } else {
                    //style 无值
                    elem.setAttribute('style', currentStyle);
                }
            });
        },
        show: function show() {
            return this.css('display', 'block');
        },
        hide: function hide() {
            return this.css('display', 'none');
        },
        children: function children() {
            var elem = this[0];
            if (!elem) {
                return null;
            }
            return $(elem.children);
        },
        childNodes: function childNodes() {
            var elem = this[0];
            if (!elem) {
                return null;
            }
            return $(elem.childNodes);
        },
        append: function append($children) {
            return this.forEach(function (elem) {
                $children.forEach(function (child) {
                    elem.appendChild(child);
                });
            });
        },
        remove: function remove() {
            if(!this){
                return false;
            }
            return this.forEach(function (elem) {
                if (elem.remove){
                    elem.remove();
                } else {
                    var parent = elem.parentElement;
                    parent && parent.removeChild(elem);
                }
            });
        },
        isContain: function isContain($child) {
            return this[0].contains($child[0]);
        },//是否包含某个子节点
        getSizeData: function getSizeData() {
            return this[0].getBoundingClientRect(); //可得到 bottom height left right top width 的数据
        },
        getNodeName: function getNodeName() {
            return this[0].nodeName;
        },
        find: function find(selector) {
            return $(this[0].querySelectorAll(selector));
        },//从当前元素查找
        text: function text(val) {
            if (!val) {
                return this[0].innerHTML.replace(/<.*?>/g, function () {
                    return '';
                });
            } else {
                return this.forEach(function (elem) {
                    elem.innerHTML = val;
                });
            }
        },
        html: function html(value) {
            if (typeof value==='undefined') {
                return this[0].innerHTML;
            } else {
                this[0].innerHTML = value;
                return this;
            }
        },
        val: function val() {
            return this[0].value.trim();
        },
        focus: function focus() {
            return this.forEach(function (elem) {
                elem.focus();
            });
        },
        parent: function parent() {
            return $(this[0].parentElement);
        },
        parentUntil: function parentUntil(selector, _currentElem) {
            var results = document.querySelectorAll(selector);
            var length = results.length;
            if (!length) {
                return null;
            }
            var elem = _currentElem || this[0];
            if (elem.nodeName === 'BODY') {
                return null;
            }
            var parent = elem.parentElement;
            for (var i = 0; i < length; i++) {
                if (parent === results[i]) { //找到，并返回
                    return $(parent);
                }
            }
            return this.parentUntil(selector, parent);//继续查找
        },//找到符合 selector 的父节点
        equal: function equal($elem) {
            if ($elem.nodeType === 1) {
                return this[0] === $elem;
            } else {
                return this[0] === $elem[0];
            }
        },
        insertBefore: function insertBefore(selector) {
            var $referenceNode = $(selector);
            var referenceNode = $referenceNode[0];
            if (!referenceNode) {
                return this;
            }
            return this.forEach(function (elem) {
                var parent = referenceNode.parentNode;
                parent.insertBefore(elem, referenceNode);
            });
        },
        insertAfter: function insertAfter(selector) {
            var $referenceNode = $(selector);
            var referenceNode = $referenceNode[0];
            if (!referenceNode) {
                return this;
            }
            return this.forEach(function (elem) {
                var parent = referenceNode.parentNode;
                if (parent.lastChild === referenceNode) {
                    parent.appendChild(elem); //最后一个元素
                } else {
                    parent.insertBefore(elem, referenceNode.nextSibling); //不是最后一个元素
                }
            });
        }
    };
    Slimf.fn.init.prototype = Slimf.fn;
    Slimf.extend=function (options) {
        for(var name in options) {
            this[name]= options[name];
        }
        return this;
    };
    Slimf.fn.extend=function(options)  {
        for(var name in options) {
            this[name]= options[name];
        }
        return this;
    };
    Slimf.extend({
        UA:{
            _ua: navigator.userAgent,
            isWebkit: function isWebkit() {
                return /webkit/i.test(this._ua);
            },
            isIE: function isIE() {
                return 'ActiveXObject' in window;
            }
        },
        Array:{
            is:function (a) {
                return a instanceof Array;
            },
            in:function (stringToSearch, arrayToSearch) {
                var s,thisEntry;
                for (s = 0; s < arrayToSearch.length; s++) {
                    thisEntry = arrayToSearch[s].toString();
                    if (thisEntry === stringToSearch) {
                        return true;
                    }
                }
                return false;
            },
            sort:function (array,key,type) {
                var temp,unfix;
                for (unfix = array.length - 1; unfix > 0; unfix--) {
                    for (var i = 0; i < unfix; i++) {
                        if (array[i][key] < array[i + 1][key] && type === '<') {
                            temp = array[i];
                            array.splice(i, 1, array[i + 1]);
                            array.splice(i + 1, 1, temp);
                        }
                        else if (array[i][key] > array[i + 1][key] && type !== '<') {
                            temp = array[i];
                            array.splice(i, 1, array[i + 1]);
                            array.splice(i + 1, 1, temp);
                        }
                    }
                }
                return array;
            }
        },
        Cookie:{
            get:function(name) {
                var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
                if(arr=document.cookie.match(reg))
                    return decodeURI(arr[2]);
                else
                    return null;
            },
            set:function(name,value,time) {
                var exp = new Date();
                exp.setTime(exp.getTime() +time );
                document.cookie = name + "=" + encodeURI(value) + ";expires=" + exp.toGMTString();
            },
            remove:function(name) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                if(this.get(name)!=null)
                    document.cookie= name + "="+this.get(name)+";expires="+exp.toGMTString();
            }
        },
        String:{
            length:function (str,zh) {
                zh=(zh===false)?zh:true;
                var realLength = 0, charCode = -1;
                for (var i = 0; i < str.length; i++) {
                    charCode = str.charCodeAt(i);
                    zh?((charCode >= 0 && charCode <= 128)?realLength += 1:realLength += 2):realLength += 1;
                }
                return realLength;
            },
            exist:function (str, substr) {
                if(typeof str !== "string"){ return; }
                if(substr==='|*|'){return true}
                for(var i=0;i<substr.split(',').length;i++){
                    if(str.indexOf(substr.split(',')[i]) >= 0 === true ){ return true; }
                }
                return false;
            },
            before:function (str,substr) {
                return str.substring(str.lastIndexOf(substr) + 1, str.length);
            },
            zeroize:function (num) {
                if(num<10&&this.length(num)<2){
                    return '0'+num;
                }
                return num;
            },
            query:function (url) {
                url=url?url:location.search; //获取url中"?"符后的字串
                var param = {},strs;
                if (url.split("?").length>1) {
                    strs = url.split("?")[1].split("&");
                    for(var i = 0; i < strs.length; i ++) {
                        param[strs[i].split("=")[0]]=decodeURIComponent(strs[i].split("=")[1]);
                    }
                }
                return param;
            },
            Random:function (prefix) {
                return (prefix||1)+ Math.random().toString().slice(2,16);
            }
        },
        Time:{
            now: function (format) {
                format = format || 'Y-m-d H:i:s';//默认格式
                var currentDate = new Date();
                (/Y/.test(format))?format = format.replace('Y', currentDate.getFullYear()):"";
                (/m/.test(format))?format = format.replace('m', currentDate.getMonth() +1):"";
                (/d/.test(format))?format = format.replace('d', currentDate.getDate()):"";
                (/H/.test(format))?format = format.replace('H', currentDate.getHours()):"";
                (/i/.test(format))?format = format.replace('i', currentDate.getMinutes()):"";
                (/s/.test(format))?format = format.replace('s', $.String.zeroize(currentDate.getSeconds())):"";
                return format;
            },
            age:function(birth){
                birth = Date.parse(birth?birth:"".replace('/-/g', "/"));
                return parseInt((new Date() - new Date(birth)) / (1000 * 60 * 60 * 24 * 365));
            },
            msDeal:function(msd) {
                var time = parseFloat(msd) /1000;
                if (null!== time &&""!== time) {
                    if (time >60&& time <60*60) {
                        time = parseInt(time /60.0) +":"+ parseInt((parseFloat(time /60.0) -
                            parseInt(time /60.0)) *60);
                    }else if (time >=60*60&& time <60*60*24) {
                        time = parseInt(time /3600.0) +":"+ parseInt((parseFloat(time /3600.0) -
                            parseInt(time /3600.0)) *60) +":"+
                            parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -
                                parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60);
                    }else {
                        time = '00:'+parseInt(time);
                    }
                }else{
                    time = "00:00:00";
                }
                time=$.String.zeroize(time.split(':')[0])+':'+$.String.zeroize(time.split(':')[1]);
                return time;
            },
            sDeal:function (time) {
                var m = parseInt(time / 60) < 10 ? "0" + parseInt(time / 60) : parseInt(time / 60);
                var s = parseInt(time % 60) < 10 ? "0" + parseInt(time % 60) : parseInt(time % 60);
                return m + ":" + s;
            },
            msToDate:function (ms) {
                var unixTimestamp = new Date(ms) ;
                return unixTimestamp.toLocaleString();
            },
            friendly:function (nodes) {
                var timers = {},cnt = 0,SEC_ARRAY = [60, 60, 24, 7, 365/7/12, 12],SEC_ARRAY_LEN = 6,indexMapZh = ['秒', '分钟', '小时', '天', '周', '月', '年'];
                var locales =function(number, index) {
                    if (index === 0) return ['刚刚', '片刻后'];
                    else {
                        var unit = indexMapZh[parseInt(index / 2)];
                        return [number + unit + '前', number + unit + '后'];
                    }
                };
                var diff_sec = function(date) {
                    var now = new Date();
                    nowDate= toDate(date);
                    return (now.getTime() - toDate(date).getTime()) / 1000;
                };
                var format_diff = function(diff) {
                    var agoin = 0, i = 0;
                    if (diff < 0) agoin = 1;
                    diff = Math.abs(diff);
                    for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                        diff /= SEC_ARRAY[i];
                    }
                    diff = parseInt(diff);
                    i *= 2;
                    if (diff > (i === 0 ? 9 : 1)) i += 1;
                    return locales(diff, i)[agoin].replace('%s', diff);
                };
                var toDate = function(input) {
                    if (input instanceof Date) {
                        return input;
                    } else if (!isNaN(input)) {
                        return new Date(parseInt(input));
                    } else if (/^\d+$/.test(input)) {
                        return new Date(parseInt(input, 10));
                    } else {
                        var s = (input || '').trim();
                        s = s.replace(/\.\d+/, '') // remove milliseconds
                            .replace(/-/, '/').replace(/-/, '/')
                            .replace(/T/, ' ').replace(/Z/, ' UTC')
                            .replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
                        return new Date(s);
                    }
                };
                var left_sec = function(diff, unit) {
                    diff = diff % unit;
                    diff = diff ? unit - diff : unit;
                    return Math.ceil(diff);
                };
                var next_interval = function(diff) {
                    var rst = 1, i = 0, d = diff;
                    for (; diff >= SEC_ARRAY[i] && i < SEC_ARRAY_LEN; i++) {
                        diff /= SEC_ARRAY[i];
                        rst *= SEC_ARRAY[i];
                    }
                    return left_sec(d, rst);
                };
                var do_render = function(node, date, cnt) {
                    var diff = diff_sec(date);
                    node.innerHTML = format_diff(diff);
                    timers['k' + cnt] = setTimeout(function() {
                        do_render(node, date, cnt);
                    }, next_interval(diff) * 1000);
                };
                if (nodes.length === undefined) nodes = [nodes];
                for (var i = 0; i < nodes.length; i++) {
                    cnt ++;
                    do_render(nodes[i], nodes[i].getAttribute('timeago'), cnt);
                }
            }
        },
        Json:{
            parse:function(data){
                if (typeof data !== 'string' || !data) {
                    return null
                }
                return eval('(' + data.replace(/^\s+/, '').replace(/\s+$/, '') + ')')
            },
            stringify:function (jsObj) {
                return JSON.stringify(jsObj);
            }
        },
        Math:{
            FileSize:function (bytes) {
                bytes=parseFloat(bytes);
                if (bytes === 0) return '0B';
                var k = 1024,
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
                    i = Math.floor(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i];
            },
        },
        Request:{
            call:function (url, type, data, success) {
                return $.Ajax({
                    url: url,
                    type: type,
                    data: data,
                    success: success
                })
            },
            Get:function (url, data, success) {
                return this.call(url, 'GET', data, success);
            },
            post:function (url, data, success) {
                return this.call(url, 'POST', data, success);
            },
            load:function (el, url, data, complete) {
                el=(typeof el === 'string')?document.querySelectorAll(el)[0]:el;
                return $.Ajax({
                    url: url,
                    type: data ? 'POST' : 'GET',
                    data: data || null,
                    dataType:"text",
                    complete: complete || function () {},
                    success: function (html) {
                        flag.SlimfLoadFlag=false;
                        el.innerHTML = html;
                        var scriptArr=el.getElementsByTagName('script');
                        var length=scriptArr.length;
                        for (var i = 0; i <length; i++) {
                            var a=$.CreateElement({
                                tag: 'script',
                                attr:{"type":"text/javascript","defer":"defer"},
                                node: el
                            });
                            scriptArr[i].src?a.setAttribute('src',scriptArr[i].src):"";
                            a.innerHTML=scriptArr[i].innerHTML;
                        }
                        flag.SlimfLoadFlag=true;
                    },
                    error:function () {
                        el.innerHTML='<p style="text-align: center;margin-top:25%;font-size: 18px">加载失败</p>';
                    }
                })
            },
            upload:function (fileType,Udata,uploadUrl,callback) {
                var filesList = [], tfl = [],UploadSize = 0,maxSize=209715200,allowType;
                if(fileType==='disk'){
                    allowType='|*|';
                }
                if(fileType==='video'){
                    allowType='mp4,rmvb,mkv,MP4,RMVB,MKV';
                }
                if(fileType==='picture'){
                    allowType='apng,png,jpg,jpeg,bmp,gif,APNG,PNG,JPG,JPEG,BMP,GIF';
                }
                if(fileType==='music'){
                    allowType='mp3,ogg,m4a,ape,flac,wav,MP3.OGG,M4A,APE,FLAC,WAV';
                }
                var _this=this;
                $.Window.NewWindow({
                    id: 'SlimfUpload',
                    width: '550px',
                    height: '400px',
                    mini: false,
                    biggest: false,
                    resize: false,
                    title: '上传文件',
                    callback:function (a) {
                        var b=$.CreateElement({
                            tag:'ul',
                            className:'SlimfUploadFile',
                            node:a
                        });
                        var tips=$.CreateElement({
                            className:'SlimfUploadTips',
                            node:a
                        });
                        var tips_p=$.CreateElement({
                            tag:"p",
                            html:'你可以选择或拖拽多个文件',
                            node:tips
                        });
                        var button=$.CreateElement({
                            tag:'label',
                            className:'SlimfUpload-select-button',
                            node:tips
                        });
                        var poss=$.CreateElement({
                            tag:'span',
                            html:"请选择或拖拽文件",
                            node:button
                        });
                        var input=$.CreateElement({
                            tag:'input',
                            attr:{"type":"file","multiple":"multiple","hidden":"hidden"},
                            node:button
                        });
                        $(b).on("dragenter ,dragover,dragleave",function (e) {
                            e.preventDefault();
                        });
                        b.addEventListener( "drop", function (e) {
                            e.preventDefault();
                            _this.upload.GetFile(e.dataTransfer);
                        }, false );
                        input.onchange=function(){
                            _this.upload.GetFile(this)
                        };
                        var c1=$.CreateElement({
                            style:{"display":"none"},
                            node:a
                        });
                        var c=$.CreateElement({
                            tag:'p',
                            className:'SlimfUpload-size-tips',
                            node:c1
                        });
                        c.onclick=function () {
                            button.click()
                        };
                        var uploadButton=$.CreateElement({
                            tag:'button',
                            html:"上传选择的文件",
                            className:'SlimfUpload-start-button',
                            node:c1
                        });
                        uploadButton.onclick=function(){
                            if(UploadSize>maxSize){
                                $.Toast('无法上传！文件总大小超过'+$.Math.FileSize(maxSize));
                                return false
                            }
                            var finish_count=0,error_count=0;
                            var formData = new FormData();
                            for(var i=0;i<tfl.length;i++) {
                                formData.append("files[" + i + "]", tfl[i]);
                                if(Udata!=null||Udata!==''){
                                    formData.append("udata[" + i + "]",Udata);
                                }
                            }
                            tips.style.display='block';
                            tips_p.innerHTML='正在上传请稍后...';
                            poss.style.background='#38f';
                            poss.style.color='#fff';
                            input.remove();
                            c1.remove();
                            b.remove();
                            $.Ajax({
                                url: uploadUrl,
                                data:formData,
                                contentType: false,
                                processData: false,
                                progress:function (evt) {
                                    var per = Math.floor(100*evt.loaded/evt.total)+"%";
                                    poss.innerHTML=poss.style.width=per;
                                },
                                success: function (rs) {
                                    rs = eval(rs);
                                    for(var i=0;i<rs.length;i++) {
                                        rs[i].upload_state === 'yes'?finish_count++:error_count++;
                                    }
                                    if(finish_count){
                                        $.Toast('共选择 '+tfl.length+' 个文件<br>'+finish_count+' 个文件上传成功');
                                        error_count?$.Toast(error_count+' 个文件上传失败'):"";
                                    }
                                    $.Window.Close(a.parentNode);
                                    callback&&callback(rs);
                                },
                                error:function () {
                                    poss.innerHTML='Error!';
                                    button.style.borderColor=poss.style.background='rgb(231, 60, 60)';
                                }
                            });
                        };
                        _this.upload.GetFile=function(data){
                            filesList = [];
                            Array.prototype.push.apply(filesList, data.files);
                            for(var i = 0; i < filesList.length ; i++){
                                if($.String.exist($.String.before(filesList[i].name,'.'),allowType)){
                                    tfl.push(filesList[i]);
                                    _this.upload.PrintFile(filesList[i].name, filesList[i].size,i);
                                    UploadSize=UploadSize+filesList[i].size;
                                }
                            }
                            if(UploadSize>0){
                                tips.style.display='none';
                                c1.style.display='block';
                                _this.upload.CheckSize(UploadSize);
                            }
                        };
                        _this.upload.PrintFile=function(filename,size,i){
                            var a=$.CreateElement({
                                tag:'li',
                                attr:{"filename":filename,"size":size},
                                style: {"animation-delay": '0.' + i + 1 + 's', "-webkit-animation-delay": '0.' + i + 1 + 's'},
                                html:'<span>'+filename+'</span><div>大小:'+$.Math.FileSize(size)+'</div>',
                                node:b
                            });
                            $.CreateElement({
                                tag:'button',
                                className:"sf-icon-trash",
                                html:' 删除',
                                node:a
                            }).onclick=function () {
                                _this.upload.RemoveFile(a)
                            };
                        };
                        _this.upload.RemoveFile=function (a) {
                            var aa=a.parentNode;
                            for(var i=0;i<aa.childNodes.length;i++){
                                if(a.getAttribute("filename")===aa.childNodes[i].getAttribute("filename")){
                                    tfl.splice(i,1);
                                    UploadSize=UploadSize-a.getAttribute("size");
                                }
                            }
                            _this.upload.CheckSize(UploadSize);
                            a.remove();
                            if(UploadSize<=0){
                                tips.style.display='block';
                                c1.style.display='none';
                            }
                        };
                        _this.upload.CheckSize=function (size) {
                            (maxSize-size>=0)?(c.innerHTML = '点我选择文件 还可选择上传' + $.Math.FileSize(maxSize -size)):c.innerHTML = '超出最大范围，无法上传！请删除部分已选文件';
                        }
                    }
                });
            },
            download:function(sUrl,filename) {
                this.download.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;
                if (/(iP)/g.test(navigator.userAgent)) {
                    $.Toast('您的设备不支持下载文件，请尝试桌面端浏览器');
                    return;
                }
                if ($.UA.isWebkit() || this.download.isSafari) {
                    var link = document.createElement('a');
                    link.href = sUrl;
                    if (link.download !== undefined) {
                        link.download =filename?filename:$.String.before(sUrl,'/');
                    }
                    if (document.createEvent) {
                        var e = document.createEvent('MouseEvents');
                        e.initEvent('click', true, true);
                        link.dispatchEvent(e);
                    }
                }
                (sUrl.indexOf('?') === -1)?sUrl += '?download':"";
                //window.open(sUrl, '_self');
            }
        },
        NameSpace:{
            register:function(fullNS) {
                var a=arguments, o=null, i, j, d;
                for (i=0; i<a.length; i=i+1) {
                    d=a[i].split(".");
                    o=window;
                    for (j=0; j<d.length; j=j+1) {
                        o[d[j]]=o[d[j]] || {};
                        o=o[d[j]];
                    }
                }
                return o;
            }
        },
        Toolip:{
            create: function(tooltip, elm) {
                tooltip.innerText=elm.getAttribute('tooltip');
                if (elm.getBoundingClientRect().left > (window.innerWidth - 100)) {
                    tooltip.className = 'SlimfToolTip tooltip-left';
                    tooltip.style.left = elm.getBoundingClientRect().left- (elm.offsetWidth/1.5) -(tooltip.offsetWidth/1.5)+ 'px';
                    tooltip.style.top = elm.getBoundingClientRect().top+ (elm.offsetHeight/2) -(tooltip.offsetHeight/2)+'px';
                } else if ((elm.getBoundingClientRect().left + (elm.getBoundingClientRect().width / 2)) < 100) {
                    tooltip.className = 'SlimfToolTip tooltip-right';
                    tooltip.style.left = elm.getBoundingClientRect().left + (elm.offsetWidth) + 'px' ;
                    tooltip.style.top = elm.getBoundingClientRect().top + (elm.offsetHeight/2) -(tooltip.offsetHeight/2)+'px';
                } else {
                    tooltip.className = 'SlimfToolTip tooltip-center';
                    tooltip.style.left = elm.getBoundingClientRect().left + (elm.offsetWidth/2) - (tooltip.offsetWidth/2) +'px' ;
                    tooltip.style.top = elm.getBoundingClientRect().top + elm.offsetHeight+5+'px';
                    if(tooltip.offsetTop>document.body.offsetHeight){
                        tooltip.className = 'SlimfToolTip tooltip-top';
                        tooltip.style.top=elm.getBoundingClientRect().top-elm.offsetHeight+8+'px'
                    }
                }
            },
            show:function(evt) {
                $.Toolip.create($.Toolip.tooltip, evt.currentTarget);
            },
            hide:function() {
                $.Toolip.tooltip.className = 'SlimfToolTip no-display';
                $.Toolip.tooltip.removeAttribute('style');
            }
        },
        Window:{
            dragMinWidth : 600,dragMinHeight: 400,window_left:0, window_top:0,w_n_width:0, w_n_height:0,windowMC:[],
            Top:function (s) {
                var index = $(".windowTitle");
                var bar=$("#"+s.id+'_bar')[0];
                for (var i = 0; i < index.length; i++) {
                    index[i].parentNode.style.zIndex = 10;
                }
                s=s.className==='SlimfConfirm'&&s.parentNode.parentNode.parentNode!==document?s.parentNode.parentNode.parentNode:s;
                s.style.zIndex = 21;
                s.style.display='block';
                for(i=0;i<this.windowMC.length;i++){
                    this.windowMC[i].className='WindowMission'
                }
                if(bar){
                    bar.className+=' WindowMissionActive';
                }
            },
            Move:function (handle, oDrag){
                var disX = dixY = 0;
                handle = handle || oDrag;
                handle.onmousedown = function (event) {
                    event = event || window.event;
                    disX = event.clientX - oDrag.offsetLeft;
                    disY = event.clientY - oDrag.offsetTop;
                    document.onmousemove = function (event) {
                        event = event || window.event;
                        var node = oDrag.parentNode;
                        var iL = event.clientX - disX;
                        var iT = event.clientY - disY;
                        if(oDrag.getAttribute("windowState")==='restore'){
                            $("#SlimfCandler")[0]&&$("#SlimfCandler")[0].blur();
                            if (iL > node.clientWidth - oDrag.offsetWidth / 4) {
                                iL = node.clientWidth - oDrag.offsetWidth / 4;
                            } else if (iL < 0 - oDrag.offsetWidth / 4 * 3) {
                                iL = 0 - oDrag.offsetWidth / 4 * 3;
                            }
                            if (iT < 0) {
                                iT = 0;
                            } else if (iT > node.clientHeight - handle.offsetHeight) {
                                iT = node.clientHeight - handle.offsetHeight;
                            }
                            oDrag.style.left = iL + "px";
                            oDrag.style.top = iT + "px";
                            return false
                        }
                    };
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        document.onmouseup = null;
                        this.releaseCapture && this.releaseCapture()
                    };
                    this.setCapture && this.setCapture();
                    return false
                };
            },
            Biggest:function (thisWindow,btn) {
                var self=this;
                var state=btn.className.split('window-')[1],show='none';
                if (btn.className==='sf-icon-window-maximize') {
                    self.window_left = thisWindow.offsetLeft;
                    self.window_top = thisWindow.offsetTop;
                    self.w_n_width = thisWindow.offsetWidth;
                    self.w_n_height = thisWindow.offsetHeight;
                    thisWindow.style.cssText="width:100%;height:100%;left:0px;top:0px;-webkit-transition:all .35s;-moz-transition:all .35s;-o-transition:all .35s;";
                    btn.className='sf-icon-window-restore';
                }
                else {
                    thisWindow.style.cssText="-webkit-transition:all .35s;-moz-transition:all .35s;-o-transition:all .35s;width:"+self.w_n_width+'px;height:'+self.w_n_height + 'px;top:'+self.window_top + "px;left:"+self.window_left + "px;";
                    var a=setTimeout(function () {
                        clearTimeout(a);
                        thisWindow.style.cssText="width:"+self.w_n_width+'px;height:'+self.w_n_height + 'px;top:'+self.window_top + "px;left:"+self.window_left + "px;";
                    },350);
                    btn.className='sf-icon-window-maximize';
                    show='block';
                }
                thisWindow.setAttribute("windowState",state);
                for (var i = 0; i <thisWindow.getElementsByClassName("w_line").length; i++) {
                    thisWindow.getElementsByClassName("w_line")[i].style.display =show;
                }
            },
            Resize:function (oParent, handle, isLeft, isTop, lockX, lockY) {
                var self=this;
                handle.onmousedown = function (event) {
                    event = event || window.event;
                    var disX = event.clientX - handle.offsetLeft;
                    var disY = event.clientY - handle.offsetTop;
                    var iParentTop = oParent.offsetTop;
                    var iParentLeft = oParent.offsetLeft;
                    var iParentWidth = oParent.offsetWidth;
                    var iParentHeight = oParent.offsetHeight;
                    document.onmousemove = function (event) {
                        event = event || window.event;
                        var iL = event.clientX - disX;
                        var iT = event.clientY - disY;
                        var maxW = document.documentElement.clientWidth - oParent.offsetLeft - 4;
                        var maxH = document.documentElement.clientHeight - oParent.offsetTop - 4;
                        var iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL;
                        var iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT;
                        isLeft && (oParent.style.left = iParentLeft + iL + "px");
                        isTop && (oParent.style.top = iParentTop + iT + "px");
                        iW < self.dragMinWidth && (iW = self.dragMinWidth);
                        iW > maxW && (iW = maxW);
                        lockX || (oParent.style.width = iW + "px");
                        iH < self.dragMinHeight && (iH = self.dragMinHeight);
                        iH > maxH && (iH = maxH);
                        lockY || (oParent.style.height = iH + "px");
                        if ((isLeft && iW === self.dragMinWidth) || (isTop && iH === self.dragMinHeight)) document.onmouseup();
                        $("#SlimfCandler")[0]&&$("#SlimfCandler")[0].blur();
                        return false;
                    };
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                    return false;
                }
            },
            Close:function (thisWindow) {
                $("#" + thisWindow.id + '_bar').remove();
                thisWindow.className+=' SlimfClose';
                var a=setTimeout(function () {
                    thisWindow.remove();
                    a&&clearTimeout(a);
                },200);
                thisWindow.onmouseup=function () {
                    window.onmousemove = null;
                    window.onmouseup = null;
                };
            },
            WindowMission:function (title,sw, pic_url){
                var self=this;
                var a=$.CreateElement({
                    id:sw.id+'_bar',
                    className:'WindowMission',
                    attr:{"tooltip":title,"ripple":""},
                    node:self.Bar
                });
                $.CreateElement({
                    tag: "img",
                    attr: {"src": pic_url,"draggable":false},
                    node: a
                });
                a.onclick=function () {
                    (sw.style.zIndex<21)?self.Top(sw):(sw.offsetWidth)?sw.style.display = "none":self.Top(sw);
                };
                this.windowMC.push(a);
            },
            NewWindow:function (options) {
                flag.SlimfLoadFlag=false;
                options = options || {};
                var id=options.id?options.id:'SlimfWindow'+Math.round(Math.random()*9999+1);
                var aa=$("#"+id)[0];
                if(aa){
                    $.Window.Top(aa);
                    return
                }
                var a=$.CreateElement({
                    id:id,
                    className:options.className?options.className:'SlimfWindow',
                    attr:{"windowState":options.state?options.state:"restore"},
                    style:{"width":options.width?options.width:window.innerWidth*0.78+'px',"height":options.height?options.height:window.innerHeight*0.75+'px'},
                    node:options.node=options.node?options.node:document.body
                });
                var b=$.CreateElement({
                    className:'windowTitle',
                    html:'<p>'+(options.title?options.title:'')+'</p>',
                    style:{"background":options.bg?options.bg:'#fff',"color":options.color?options.color:'#2D2D2D'},
                    node:a
                });
                a.onmousedown=b.onclick=function () {
                    $.Window.Top(a);
                };
                (options.TitlePic?options.TitlePic:null)?$.CreateElement({tag:'img', attr:{"src":options.TitlePic}, node:b}):"";
                var c=$.CreateElement({
                    tag:'span',
                    className:'sf-icon-times',
                    node:b
                });
                c.onclick=function(){
                    $.Window.Close(a);
                };
                c.onmousedown = function (event) {
                    this.onfocus = function () {
                        this.blur()
                    };
                    (event || window.event).cancelBubble = true
                };
                if(options.biggest === undefined ? true : options.biggest){
                    var g=$.CreateElement({
                        tag:'span',
                        className : "sf-icon-window-maximize",
                        node:b
                    });
                    g.onclick =b.ondblclick=function () {
                        $.Window.Biggest(a,g);
                    };
                    g.onmousedown = c.onmousedown;
                }
                if(options.mini=== undefined?true:options.mini){
                    var f=$.CreateElement({
                        tag:'span',
                        className : "sf-icon-window-minimize",
                        node:b
                    });
                    f.onclick = function () {
                        var old = a.className;
                        a.className+=' zoomOut';
                        var aa=setTimeout(function () {
                            a.style.display = "none";
                            clearTimeout(aa);
                            a.className=old;
                        },200);
                    };
                    f.onmousedown=c.onmousedown;
                }
                if(options.resize=== undefined?true:options.resize){
                    var Resize=[
                        {"n":"SWLline","fx1":true,"fx2":false,"fx3":false,"fx4":true},
                        {"n":"SWRline","fx1":false,"fx2":false,"fx3":false,"fx4":true},
                        {"n":"SWTline","fx1":false,"fx2":true,"fx3":true,"fx4":false},
                        {"n":"SWBline","fx1":false,"fx2":false,"fx3":true,"fx4":false},
                        {"n":"SWLTblock","fx1":true,"fx2":true,"fx3":false,"fx4":false},
                        {"n":"SWRTblock","fx1":false,"fx2":true,"fx3":false,"fx4":false},
                        {"n":"SWRBblock","fx1":false,"fx2":false,"fx3":false,"fx4":false},
                        {"n":"SWLBblock","fx1":true,"fx2":false,"fx3":false,"fx4":false}
                    ];
                    for(var i=0;i<Resize.length;i++){
                        var w=$.CreateElement({
                            className:Resize[i].n+' w_line',
                            node:a
                        });
                        this.Resize(a, w,Resize[i].fx1,Resize[i].fx2,Resize[i].fx3,Resize[i].fx4);
                    }
                }
                (options.mini&&options.ico?options.ico:null)?this.WindowMission(options.title,a,options.ico):"";
                a.style.left=(options.node.offsetWidth-a.offsetWidth)/2+'px';
                a.style.top=((options.node.offsetHeight-a.offsetHeight)/2>=0?(options.node.offsetHeight-a.offsetHeight)/2:'0')+'px';
                a.Title=b.getElementsByTagName('p')[0];
                this.Move(b,a);
                this.Top(a);
                var z=$.CreateElement({
                    className:'SlimfWindowContainer',
                    html:'<span class="SlimfWindowLoading">Loading…</span>',
                    node:a
                });
                if(options.callback){
                    z.innerHTML='';
                    options.callback(z)
                }
                flag.SlimfLoadFlag=true;
                return z;
            }
        },
        RGBaster:{
            getContext :function(width, height){
                var canvas = document.createElement("canvas");
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                return canvas.getContext('2d');
            },
            getImageData :function(img, loaded){
                var imgObj = new Image();
                var imgSrc = img.src || img;
                if ( imgSrc.substring(0,5) !== 'data:' )
                    imgObj.crossOrigin = "Anonymous";
                imgObj.onload = function(){
                    var context = $.RGBaster.getContext(imgObj.width, imgObj.height);
                    context.drawImage(imgObj, 0, 0);
                    var imageData = context.getImageData(0, 0, imgObj.width, imgObj.height);
                    loaded && loaded(imageData.data);
                };
                imgObj.src = imgSrc;
            },
            makeRGB : function(name){
                return ['rgb(', name, ')'].join('');
            },
            mapPalette : function(palette){
                var arr = [];
                for (var prop in palette) { arr.push( this.frmtPobj(prop, palette[prop]) ) }
                arr.sort(function(a, b) { return (b.count - a.count) });
                return arr;
            },
            fitPalette : function(arr, fitSize) {
                if (arr.length > fitSize ) {
                    return arr.slice(0,fitSize);
                } else {
                    for (var i = arr.length-1 ; i < fitSize-1; i++) { arr.push( this.frmtPobj('0,0,0', 0) ) }
                    return arr;
                }
            },
            frmtPobj :function(a,b){
                return {name: this.makeRGB(a), count: b};
            },
            colors :function(img, opts){
                opts = opts || {};
                var exclude = opts.exclude || [ ],
                paletteSize = opts.paletteSize || 10;
                this.getImageData(img, function(data){
                    var colorCounts   = {},
                        rgbString     = '',
                        rgb           = [],
                        colors        = {
                            dominant: { name: '', count: 0 },
                            palette:  []
                        };
                    var i = 0;
                    for (; i < data.length; i += 4) {
                        rgb[0] = data[i];
                        rgb[1] = data[i+1];
                        rgb[2] = data[i+2];
                        rgbString = rgb.join(",");
                        if (rgb.indexOf(undefined) !== -1  || data[i + 3] === 0) {
                            continue;
                        }
                        if (exclude.indexOf( $.RGBaster.makeRGB(rgbString) ) === -1 ) {
                            if ( rgbString in colorCounts ) {
                                colorCounts[rgbString] = colorCounts[rgbString] + 1;
                            }
                            else{
                                colorCounts[rgbString] = 1;
                            }
                        }
                    }
                    if ( opts.success ) {
                        var palette = $.RGBaster.fitPalette($.RGBaster.mapPalette(colorCounts), paletteSize+1 );
                        opts.success({
                            dominant: palette[0].name,//主色
                            secondary: palette[1].name,//次色
                            palette:  palette.map(function(c){ return c.name; }).slice(1)//主色渐变色
                        });
                    }
                });
            }
        },
        DropMenu:{
            init:function (elm,dropmenu,callback) {
                event.stopPropagation();
                if(dropmenu.offsetWidth) {
                    this.hide(dropmenu)
                }else{
                    this.show(dropmenu);
                    this.position(elm,dropmenu);
                }
                this.bind();
            },
            menu:function(){
                return $(".SlimfDropMenu");
            },
            position:function(elm,dropmenu){
                var left=elm.getBoundingClientRect().left;
                if(left+dropmenu.offsetWidth>window.innerWidth){
                    left=window.innerWidth-dropmenu.offsetWidth
                }
                dropmenu.style.left=left+'px';
                dropmenu.style.top=elm.getBoundingClientRect().top+elm.offsetHeight+'px';
            },
            show:function (dropmenu) {
                var menus=this.menu();
                for(var i=0;i<menus.length;i++){
                    menus[i].style.display='none';
                }
                dropmenu.style.display='block';
            },
            hide:function(dropmenu){
                dropmenu.style.display='none';
            },
            bind:function () {
                var _this=this;
                window.onmousedown=function (ev) {
                    event.stopPropagation();
                    var menus=_this.menu();
                    for(var i=0;i<menus.length;i++){
                        menus[i].style.display='none';
                    }
                }
            }
        },
        OptionsInit:function (options,defaultOptions) {
            var opts = {};
            var key;
            for (key in defaultOptions) {
                if (typeof options[key] === 'undefined') {
                    opts[key] = defaultOptions[key]
                } else {
                    opts[key] = options[key]
                }
            }
            return opts
        },
        isDOMList:function(selector) {
            return ((selector instanceof HTMLCollection || selector instanceof NodeList)&&selector);
        },//是否是 DOM List
        CreateElement:function (options) {
            options = options || {};
            var a=document.createElement(options.tag ? options.tag :'div');
            a.innerHTML=options.html ? options.html :'';
            (options.id ? options.id :null)?a.id = options.id:"";
            (options.className ? options.className :null)?a.className=(options.className).toString().replace(/(^\s*)|(\s*$)/g, ""):"";
            for (var tmp in options.style) {
                a.style.cssText += tmp +":"+ options.style[tmp];
            }
            for (var att_name in options.attr) {
                a.setAttribute(att_name,options.attr[att_name]);
            }
            return (options.node?options.node:document.body).appendChild(a);
        },
        FormControl:function (elm) {
            var forms_state=elm.getAttribute("SlimfForms");
            flag.SlimfLoadFlag=false;
            if(!forms_state) {
                var a = $.CreateElement({
                    tag:"label",
                    node: elm.parentNode
                });
                var b=null;
                a.tabIndex=1;
                if (elm.tagName === 'INPUT') {
                    a.appendChild(elm);
                    a.className='SlimfCheck';
                    b = $.CreateElement({
                        tag: "span",
                        node: a
                    });
                    elm.checked?b.className = 'sf-icon-check':"";
                    elm.addEventListener('change',function() {
                        (elm.checked?b.className = 'sf-icon-check':b.className = '')?elm.checked = true:elm.checked = false;
                    });
                } else {
                    a.className='SlimfSelect '+elm.className;
                    var list=elm.querySelectorAll("option");
                    a.style.width=elm.clientWidth+'px';
                    a.style.height=elm.offsetHeight+'px';
                    b=$.CreateElement({
                        tag:"p",
                        className:'SlimfSelectV',
                        node:a
                    });
                    var b1=$.CreateElement({
                        tag:"span",
                        className:'SlimfSelectS sf-icon-angle-down',
                        node:a
                    });
                    var c=$.CreateElement({
                        tag:"ul",
                        className:"animated fadeIn",
                        node:a
                    });
                    c.style.width=a.offsetWidth+'px';
                    for(var i=0;i<list.length;i++){
                        list[i].selected?b.innerHTML=list[i].innerHTML:elm.value;
                        var d=c.appendChild(list[i].cloneNode(true));
                        list[i].onclick=d.onclick=function () {
                            elm.value=b.innerHTML=this.innerHTML;
                        };
                    }
                    a.addEventListener("click", function () {
                        if(!c.offsetWidth){
                            c.style.top=a.offsetTop+a.offsetHeight+'px';
                            c.style.left=a.offsetLeft+'px';
                            c.style.display='block';
                            b1.className='SlimfSelectS sf-icon-angle-up';
                            for(var k=0;k<c.children.length;k++){
                                c.children[k].className='';
                                c.children[k].innerHTML===b.innerHTML?c.children[k].className='SlimfSelectT':"";
                            }
                        }else{
                            c.style.display='none';
                            b1.className='SlimfSelectS sf-icon-angle-down';
                        }
                        elm.click();
                    }, false);
                    a.onblur=function () {
                        c.style.display='none';
                        b1.className='SlimfSelectS sf-icon-angle-down';
                    };
                }
                elm.setAttribute("SlimfForms",true);
                elm.style.display='none';
            }
            flag.SlimfLoadFlag=true;
        },
        Confirm:function (options) {
            options = options || {};
            var id=options.id?options.id:'SlimfConfirm';
            $('#'+id).remove();
            var aa=$.Window.NewWindow({
                id: id,
                className: 'SlimfConfirm',
                width:options.width?options.width:' ',
                height:options.height?options.height:' ',
                mini: false,
                biggest: false,
                resize: false,
                title: options.title?options.title:'',
                node:  options.node?options.node:document.body,
                callback:function (a) {
                    var b=$.CreateElement({
                        attr:{"tabIndex":'1'},
                        html:  options.notic=options.notic?options.notic:'',
                        className:'SlimfConfirmNote',
                        node:a
                    });
                    if(options.confirm_input=options.confirm_input?options.confirm_input:null){
                        var c=$.CreateElement({
                            tag:'input',
                            id:options.confirm_input,
                            html:  options.notic,
                            className:'note',
                            node:b,
                            attr:{"type":"text","value":options.confirm_input_val?options.confirm_input_val:'',"spellcheck":"false"}
                        });
                        c.focus();
                        c.selectionStart =c.selectionEnd =(options.confirm_input_val)?options.confirm_input_val.length:0;
                    }
                    var d=$.CreateElement({
                        tag:'button',
                        className:'SlimfConfirmCancel',
                        html:'取消',
                        node:a
                    });
                    var e=$.CreateElement({
                        tag:'button',
                        html:'确认',
                        node:a
                    });
                    e.onclick=function(){
                        options.submit_func?options.submit_func(a.parentNode):$.Window.Close(a.parentNode);
                    };
                    a.parentNode.Title.nextElementSibling.onclick=d.onclick=function () {
                        options.cancel_func?options.cancel_func(a.parentNode):$.Window.Close(a.parentNode);
                    };
                    b.onkeydown=function (ev) {
                        ev.keyCode===13?e.click():"";
                    };
                    typeof options.callback ==='function'&&options.callback(b);
                }
            });
            return aa.parentNode;
        },
        Ajax:function(options) {
            var ajaxSettings = {
                url: '',
                type: 'POST',
                dataType: 'json',
                async: true,
                cache: true,
                data: null,
                contentType: 'application/x-www-form-urlencoded',
                success: null,
                error: null,
                complete: null,
                processData:true,
                progress:false,
                accepts: {
                    text: 'text/plain',
                    html: 'text/html',
                    xml: 'application/xml, text/xml',
                    json: 'application/json, text/javascript'
                },
                header:null,
                param:null,
                withCredentials: false
            };
            var opts = $.OptionsInit(options,ajaxSettings);
            var param = function (obj) {
                var s = [];
                for (var key in obj) {
                    s.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
                }
                return s.join('&');
            };
            var addToQueryString = function (url, params) {
                return url + (url.indexOf('?') > -1 ? '&' : '?') + param(params);
            };
            var xhr = new XMLHttpRequest();
            var url = opts.url;
            var sendData = opts.data;
            var readyStateChange = function () {
                var status = xhr.status;
                var data;
                if (xhr.readyState !== 4) {
                    return
                }
                if (status >= 200 && status < 300 || status === 304) {
                    if (opts.dataType === 'xml') {
                        data = xhr.responseXML
                    } else {
                        data = xhr.responseText;
                        if (opts.dataType === 'json') {
                            data = $.Json.parse(data);
                        }
                    }
                    if ($.isFunction(opts.success)) {
                        opts.success.call(opts, data, status, xhr);
                    }
                }
                else {
                    if ($.isFunction(opts.error)) {
                        opts.error.call(opts, xhr, status)
                    }
                }
                if ($.isFunction(opts.complete)) {
                    opts.complete.call(opts, xhr, status)
                }
            };
            if(opts.param) {
                url = addToQueryString(url, opts.param);
            }
            if (!opts.cache) {
                url = addToQueryString(url, {noAjaxCache: (new Date()).getTime()})
            }
            if ((opts.type === 'GET'||opts.type === 'get')&&sendData&&opts.processData) {
                url = addToQueryString(url, sendData);
                sendData = null
            }
            xhr.open(opts.type, url, opts.async);
            if ((opts.type === 'POST'||opts.type === 'post')&&sendData&&opts.processData) {
                sendData = param(sendData);
                xhr.setRequestHeader('Content-type', opts.contentType);
            }
            for(var i in opts.header){
                xhr.setRequestHeader(i, opts.header[i]);
            }
            if(opts.progress) {
                xhr.upload.addEventListener("progress", opts.progress, false);
            }
            if (opts.dataType && opts.accepts[opts.dataType]) {
                xhr.setRequestHeader('Accept', opts.accepts[opts.dataType])
            }
            xhr.withCredentials = opts.withCredentials;
            if (opts.async) {
                xhr.onreadystatechange = readyStateChange;
                xhr.send(sendData)
            }else {
                console.warn(opts.url+' 使用了同步请求，该请求将影响性能，不建议使用');
                xhr.send(sendData);
                readyStateChange()
            }
            return xhr
        },
        Toast:function (template){
            var type='info';
            var toast = function(template) {
                this.opt = {
                    msg  : template.msg?template.msg:null,
                    onOpen    : template.onOpen?template.onOpen:false,
                    onClose   : template.onClose?template.onClose:false,
                };
                if ( typeof template === 'string') {
                    this.opt = { msg: template};
                }
                else if (typeof template === 'object') {
                    this.opt = template;
                }else {
                    return false;
                }
                this.create(this.opt.msg);
                if (this.opt.onOpen) { this.opt.onOpen();}
                this.close();
            };
            toast.prototype.create = function(msg) {
                if ($.String.exist(msg, '警告,Waring,waring,Waring,为空,空的,输入,填写,未,空,修复,无')) {
                    type='warning';
                }else if ($.String.exist(msg, '成功,success,完成,ok,OK,SUCCESS,完毕,欢迎，welcome')) {
                    type='success';
                }else if ($.String.exist(msg, '非法,错误,失败,Error,出错,error,无法,Failed,不,no')) {
                    type='error';
                }
                this.pop=$.CreateElement({
                    className:"SlimfToast spop--out spop--in SlimfToast-"+type,
                    html:'<i class="SlimfToastIcon SlimfToastIcon--'+type+'"></i><div class="SlimfToastContent">'+msg+'</div>',
                    node:Slimf.ToastWrap
                });
            };
            toast.prototype.close = function () {
                var _this=this;
                this.autocloseTimer = setTimeout( function (){_this.remove(_this.pop)}, 2500);
                this.pop.onclick=function () {
                    clearTimeout(_this.autocloseTimer);
                    _this.remove(this);
                }
            };
            toast.prototype.remove = function(elm) {
                if (this.opt.onClose) { this.opt.onClose();}
                $(elm).removeClass('spop--in');
                setTimeout( function () {
                    elm.remove();
                }, 300);
            };
            return new toast(template);
        },
        Media:function (media,container,slider) {
            container.innerHTML = $.Time.sDeal(media.currentTime) + '/' + $.Time.sDeal(media.duration);
            slider.style.width = Math.round(media.currentTime) / Math.round(media.duration) * 100 + "%";
            if(media.ended) {
                media.currentTime = '0';
                container.innerHTML = '00:00/00:00';
            }
        },
        MediaControl:function (media,type,fx,slider,e) {
            e.stopPropagation();
            if(type!=='play') {
                function analfx(e){
                    fx==='y'?Volumn(Math.abs(((e.pageY - slider.getBoundingClientRect().top) / slider.offsetHeight) - 1), fx):Volumn((e.pageX - slider.getBoundingClientRect().left) / slider.offsetWidth, fx);
                }
                function Volumn(arm,fx) {
                    arm>1?arm=1:"";
                    arm<0?arm=0:"";
                    media.volume = arm;
                    if (parseFloat(arm)*100 <101) {
                        if(fx==='x'){
                            slider.childNodes[0].style.width=parseFloat(arm)*100 + '%';
                        }else{
                            slider.childNodes[0].style.height = parseFloat(arm)*100 + '%';
                            slider.childNodes[0].style.top = parseFloat(1-arm)*100 + '%';
                        }
                    }
                }
                document.onmousemove = function (e) {
                    analfx(e);
                };
                analfx(e);
            }else{
                document.onmousemove = function (e) {
                    media.currentTime = media.duration * (e.pageX - slider.getBoundingClientRect().left) / slider.offsetWidth;
                };
                media.currentTime = media.duration * (e.pageX - slider.getBoundingClientRect().left) / slider.offsetWidth;
            }
            document.onmouseup = new Function('this.onmousemove=null');
        },
        ImageShow:function (img_cont) {
            var a=$("#SlimfImageShow")[0];
            var angle = 0, this_count=0, img=[],imgs = img_cont.parentNode.childNodes,time_p,time_p1,ratio=1,imgW;
            for (var k = 0; k < imgs.length; k++) {
                imgs[k].photo_url?img.push(imgs[k]):"";
            }
            for(var j=0;j<img.length;j++){
                img[j].photo_url === img_cont.photo_url?this_count = j:"";
            }
            if(a){
                $("#SlimfImgShow")[0].src=img_cont.photo_url;
                $(".SlimfImgControl p")[0].innerHTML=String(this_count+1)+'/'+String(img.length);
            }
            var li_func = [
                {"icon": 'sf-icon-search-plus', "tag": "放大", "fun": 'SlimfImageShow.zoom(1)', "text": ''},
                {"icon": 'sf-icon-search-minus', "tag": "缩小", "fun": 'SlimfImageShow.zoom(-1)', "text": ''},
                {"icon": '', "tag": "实际尺寸", "fun": 'SlimfImageShow.cut(0)', "text": '1:1'},
                {"icon": 'sf-icon-angle-left', "tag": "上一张", "fun": 'SlimfImageShow.cut(-1)', "text": ''},
                {"icon": 'sf-icon-angle-right', "tag": "下一张", "fun": 'SlimfImageShow.cut(+1)', "text": ''},
                {"icon": 'sf-icon-undo', "tag": "向左旋转90°", "fun": 'SlimfImageShow.roate(-90)', "text": ''},
                {"icon": 'sf-icon-redo', "tag": "向右旋转90°", "fun": 'SlimfImageShow.roate(90)', "text": ''},
                {"icon": 'sf-icon-download', "tag": "下载", "fun": 'SlimfImageShow.doown()', "text": ''}
            ];
            $.Window.NewWindow({
                id: 'SlimfImageShow',
                width: '800px',
                height: '600px',
                mini: false,
                title: '图片查看',
                callback:function (a) {
                    var b = $.CreateElement({
                        className: 'SlimfImageShowContainer',
                        node: a
                    });
                    var img_show = $.CreateElement({
                        tag: 'img',
                        className: 'SlimfImgShow',
                        id: 'SlimfImgShow',
                        attr: {"src": img_cont.photo_url},
                        node: b
                    });
                    var zoom_show = $.CreateElement({
                        className: 'SlimfImageShowZoom',
                        html: '0%',
                        node: b
                    });
                    var c = $.CreateElement({
                        className: 'SlimfImgControl',
                        node: b
                    });
                    var d=$.CreateElement({
                        tag: 'p',
                        node: c
                    });
                    var ul = $.CreateElement({
                        tag: 'ul',
                        node: c
                    });
                    for (var i = 0; i < li_func.length; i++) {
                        $.CreateElement({
                            tag: 'li',
                            className: li_func[i].icon,
                            html: li_func[i].text,
                            attr: {"tooltip": li_func[i].tag, "onclick": li_func[i].fun},
                            node: ul
                        });
                    }
                    img_show.onload=function () {
                        d.innerHTML=String(this_count+1)+'/'+String(img.length);
                        img_show.removeAttribute("style");
                        angle=0;
                        time_p1=setInterval(function () {
                            imgW=img_show.offsetWidth;
                            if(img_show.complete){
                                if(img_show.offsetHeight>b.offsetHeight||imgW>b.offsetWidth){
                                    ratio = (b.offsetWidth / imgW);
                                    img_show.style.width=(imgW * ratio)+'px';
                                }
                                SlimfImageShow.center_img();
                                img_show.style.opacity=1;
                            }
                            time_p1&&clearInterval(time_p1);
                        },500);
                    };
                    b.onmousewheel = function (evet) {
                        SlimfImageShow.zoom(evet.wheelDelta);
                    };
                    img_show.onmousedown = function (e) {
                        e.preventDefault();
                        startX = e.pageX;
                        startY = e.pageY;
                        document.onmousemove = function (e) {
                            var center_x = img_show.offsetLeft;
                            var center_y = img_show.offsetTop;
                            var isl = e.pageX - startX + center_x,
                                ist = e.pageY - startY + center_y;
                            if (isl < (-img_show.offsetWidth + 10) || isl > (b.offsetWidth - 10)||ist < (-img_show.offsetHeight + 10) || ist > (b.offsetHeight - 10)) {
                                document.onmousemove = null;
                                SlimfImageShow.center_img();
                                return;
                            }
                            img_show.style.left = isl + 'px';
                            img_show.style.top = ist + 'px';
                            startX = e.pageX;
                            startY = e.pageY;
                            document.onmouseup = new Function('this.onmousemove=null');
                        };
                        document.onmouseup = new Function('this.onmousemove=null');
                    };
                    SlimfImageShow.center_img = function () {
                        img_show.style.left = (b.offsetWidth - img_show.offsetWidth) / 2 + "px";
                        img_show.style.top = (b.offsetHeight - img_show.offsetHeight) / 2 + "px";
                    };
                    SlimfImageShow.zoom = function (a) {
                        if (a>0&&ratio<9.9) {
                            ratio +=0.2;
                        }else if(a<0&&ratio>0.3){
                            ratio -=0.2;
                        }
                        img_show.style.width =(imgW * ratio)+'px';
                        SlimfImageShow.center_img();
                        zoom_show.style.opacity = '1';
                        zoom_show.innerHTML = (ratio*100).toFixed(0) + '%';
                        time_p = setTimeout(function () {
                            zoom_show.style.opacity = '0';
                            time_p && clearTimeout(time_p);
                        }, 1500);
                    };
                    SlimfImageShow.roate = function (a) {
                        angle=angle+a;
                        img_show.style.webkitTransform = 'rotate(' + angle + 'deg)';
                    };
                    SlimfImageShow.doown = function () {
                        window.open(img_show.src);
                    };
                    SlimfImageShow.cut = function (a) {
                        if(a!==0) {
                            this_count = this_count + a;
                            this_count<0?this_count=img.length-1:"";
                            this_count>img.length-1?this_count=0:"";
                            img_show.src = img[this_count].photo_url;
                        }else{
                            img_show.style.width = 'auto';
                            img_show.style.height = 'auto';
                            ratio = 1;
                            SlimfImageShow.center_img();
                        }
                    };
                }
            });
        },
        AudioPlayer:function (music_cont) {
            var btnArr=[
                {"name":"","size":'midue'},
                {"name":"sf-icon-step-backward","size":'small'},
                {"name":"sf-icon-circle-notch sf-spin","size":'big'},
                {"name":"sf-icon-step-forward","size":'small'},
                {"name":"sf-icon-volume-up","size":'midue'}
            ],playList=[],Nowplay,contLength=music_cont.parentNode.childNodes;
            $("#SlimfAudio").remove();
            for (var k = 0; k < contLength.length; k++) {
                contLength[k].audio_url?playList.push(contLength[k]):"";
            }
            $.Window.NewWindow({
                id: 'SlimfAudio',
                width: '350px',
                height: '500px',
                biggest: false,
                resize:false,
                mini:false,
                callback:function (a) {
                    var b=$.CreateElement({
                        className:'SlimfAudioContainer',
                        node:a
                    });
                    var c=$.CreateElement({
                        className:'SlimfAudioPlayerContainer',
                        node:b
                    });
                    var b1=$.CreateElement({
                        tag:'ul',
                        className:'SlimfAudioListContainer',
                        node:b
                    });
                    var d=$.CreateElement({
                        className:'SlimfAudioPlayerTitle',
                        html:music_cont.audio_name,
                        node:c
                    });
                    var e=$.CreateElement({
                        tag:'ul',
                        node:c
                    });
                    for(var i=0;i<btnArr.length;i++){
                        btnArr[i]=$.CreateElement({
                            tag:"li",
                            className:btnArr[i].name+' SlimfABtn'+btnArr[i].size,
                            node:e
                        });
                    }
                    var k1=$.CreateElement({
                        className:'SlimfAudioVolumn',
                        node:c
                    });
                    var l=$.CreateElement({
                        className:'SlimfVideoVolumnSlider',
                        node:k1
                    });
                    $.CreateElement({
                        className:'SlimfVideoVolumnSliderBar',
                        html:'<span></span>',
                        node:l
                    });
                    var t=$.CreateElement({
                        tag:"p",
                        className:'SlimfAudioTime',
                        html:'00:00/00:00',
                        node:c
                    });
                    var g=$.CreateElement({
                        className:'SlimfAudioSliderContainer',
                        node:c
                    });
                    var h=$.CreateElement({
                        className:'SlimfAudioSlider',
                        html:'<span></span>',
                        node:g
                    });
                    var ii=$.CreateElement({
                        tag:"audio",
                        attr:{"src":music_cont.audio_url},
                        node:a
                    });
                    b.onmousedown=function () {
                        k1.style.display='none';
                    };
                    g.onmousedown=function (evt) {
                        $.MediaControl(ii,'play','x',g,evt);
                    };
                    l.onmousedown=function (evt) {
                        $.MediaControl(ii,'volunmn','y',l,evt);
                    };
                    for(var j=0;j<playList.length;j++){
                        playList[j].audio_url === music_cont.audio_url?Nowplay = j:"";
                        (function (j) {
                            var audio=$.CreateElement({
                                tag:"li",
                                html:$.String.zeroize(j+1)+'&nbsp '+playList[j].audio_name,
                                node:b1
                            });
                            audio.audio_url=$.String.exist(playList[j].audio_url,'http')?playList[j].audio_url:'http://'+window.location.host+'/'+playList[j].audio_url;
                            audio.audio_name=playList[j].audio_name;
                            audio.onclick=function () {
                                for(var j=0;j<b1.childNodes.length;j++){
                                    if(this=== b1.childNodes[j]){
                                        Nowplay=j;
                                    }
                                    b1.childNodes[j].className='';
                                }
                                this.className='SlimfAudioPlayThis';
                                ii.src = this.audio_url;
                                d.innerHTML = this.audio_name;
                                btnArr[2].onclick();
                            }
                        })(j);
                    }
                    btnArr[1].onclick=function () {
                        Nowplay!==0?b1.childNodes[Nowplay-1].click():"";
                    };
                    btnArr[2].onclick=function () {
                        if(ii.paused){
                            ii.play();
                            this.className='sf-icon-pause SlimfABtnbig'
                        }else{
                            ii.pause();
                            this.className='sf-icon-play SlimfABtnbig'
                        }
                    };
                    btnArr[3].onclick=function () {
                        Nowplay !== b1.childNodes.length - 1 ? b1.childNodes[Nowplay + 1].click() : btnArr[2].className='sf-icon-play SlimfABtnbig';
                    };
                    btnArr[4].onclick=function () {
                        k1.offsetHeight?k1.style.display='none':k1.style.display='block';
                    };
                    ii.addEventListener("timeupdate", function () {
                        $.Media(ii,t,h);
                    });
                    ii.addEventListener("ended",function () {
                        btnArr[3].onclick();
                    });
                    ii.addEventListener("durationchange",function () {
                        btnArr[2].className='SlimfABtnbig sf-icon-pause';
                    });
                    ii.addEventListener("seeking",function () {
                        btnArr[2].className='SlimfABtnbig sf-icon-circle-notch sf-spin';
                    });
                    ii.addEventListener("canplay",function () {
                        if(ii.paused){
                            btnArr[2].className='SlimfABtnbig sf-icon-play';
                        }else{
                            btnArr[2].className='SlimfABtnbig sf-icon-pause';
                        }
                    });
                    b1.childNodes[Nowplay].click();
                }
            });
        },
        VideoPlayer:function (video_title,video_href){
            if(!video_href){
                $.Toast('无可播放的文件');
                return;
            }
            var SlimfFullFlag=false,time_a;
            var aa=$("#SlimfVideo")[0];
            if(aa){
                aa.Title.innerHTML=video_title;
                aa.video.src=video_href;
                aa.video.play();
            }
            $.Window.NewWindow({
                id: 'SlimfVideo',
                width: '750px',
                height: '500px',
                mini: false,
                title: video_title,
                callback:function (a) {
                    var b=$.CreateElement({
                        className:'SlimfVideoContainer',
                        node:a
                    });
                    var c=a.video=$.CreateElement({
                        tag:'video',
                        attr:{"crossOrigin":"*","src":video_href},
                        node:b
                    });
                    var d=$.CreateElement({
                        className:'SlimfVideoControl',
                        node:b
                    });
                    var e=$.CreateElement({
                        className:'SlimfVideoPlay sf-icon-circle-notch sf-spin',
                        node:d
                    });
                    var f=$.CreateElement({
                        className:'SlimfVideoSlider',
                        node:d
                    });
                    var g=$.CreateElement({
                        html:'<span></span>',
                        className:'SlimfVideoSliderBar',
                        node:f
                    });
                    var g1=$.CreateElement({
                        className:'SlimfVideoTempBar',
                        node:f
                    });
                    var h=$.CreateElement({
                        className:'SlimfVideoTime',
                        html:'00:00/00:00',
                        node:d
                    });
                    var i=$.CreateElement({
                        className:'sf-icon-volume-up',
                        node:d
                    });
                    var j=$.CreateElement({
                        className:'sf-icon-expand',
                        node:d
                    });
                    var k=$.CreateElement({
                        className:'SlimfVideoVolumn',
                        node:b
                    });
                    var l=$.CreateElement({
                        className:'SlimfVideoVolumnSlider',
                        node:k
                    });
                    $.CreateElement({
                        className:'SlimfVideoVolumnSliderBar',
                        html:'<span></span>',
                        node:l
                    });
                    f.onmousedown= function (e){
                        $.MediaControl(c,'play','x',f,e);
                    };
                    l.onmousedown = function (e) {
                        $.MediaControl(c,'volunmn','y',l,e);
                    };
                    function isFull() {
                        if(b.offsetHeight!==window.innerHeight) {
                            SlimfFullFlag=false;
                            d.onmouseover=null;
                            d.onmouseout=null;
                            d.style.opacity='1';
                            c.style.height='calc(100% - 40px)';
                            j.className='sf-icon-expand';
                            clearTimeout(time_a);
                        }else{
                            SlimfFullFlag=true;
                            j.className='sf-icon-compress';
                            time_a=setTimeout(function () {
                                d.style.opacity='0';
                                c.style.height='100%';
                                clearTimeout(time_a);
                            },5000);
                            d.onmouseover=function () {
                                d.style.opacity='1';
                                c.style.height='calc(100% - 40px)';
                                clearTimeout(time_a);
                            };
                            d.onmouseout=function (){
                                time_a = setTimeout(function () {
                                    if (SlimfFullFlag) {
                                        d.style.opacity = '0';
                                        c.style.height = '100%';
                                    }
                                }, 4000);
                            };
                        }
                    }
                    c.onclick=e.onclick=function () {
                        if(c.paused){
                            c.play();
                            e.className='SlimfVideoPlay sf-icon-pause';
                        }else{
                            c.pause();
                            e.className='SlimfVideoPlay sf-icon-play';
                        }
                    };
                    j.onclick=c.ondblclick=function() {
                        if ((b.requestFullscreen||b.mozRequestFullScreen||b.webkitRequestFullScreen||b.msRequestFullscreen)&&b.offsetHeight!==window.innerHeight) {
                            b.requestFullscreen?b.requestFullscreen():b.mozRequestFullScreen?b.mozRequestFullScreen():b.webkitRequestFullScreen?b.webkitRequestFullScreen():b.msRequestFullscreen?b.msRequestFullscreen():"";
                        }else if(document.exitFullscreen||document.mozCancelFullScreen||document.webkitCancelFullScreen||document.msExitFullscreen) {
                            document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.msExitFullscreen?document.msExitFullscreen():"";
                        }
                    };
                    b.addEventListener("fullscreenchange", function(e) {
                        isFull(e);
                    });
                    b.addEventListener("mozfullscreenchange", function(e) {
                        isFull(e);
                    });
                    b.addEventListener("webkitfullscreenchange", function(e) {
                        isFull(e);
                    });
                    b.addEventListener("msfullscreenchange", function(e) {
                        isFull(e);
                    });
                    k.onmouseout=i.onmouseout=function () {
                        k.style.display='none';
                    };
                    k.onmouseover=i.onmouseover=function () {
                        k.style.display='block';
                    };
                    c.addEventListener("durationchange",function () {
                        e.className='SlimfVideoPlay sf-icon-play';
                    });
                    c.addEventListener("seeking",function () {
                        e.className='SlimfVideoPlay sf-icon-circle-notch sf-spin';
                    });
                    c.addEventListener("error",function () {
                        $.Toast('文件不可用');
                        $.Window.Close($("#SlimfVideo")[0]);
                    });
                    c.addEventListener("timeupdate", function () {
                        $.Media(c,h,g);
                    });
                    c.addEventListener("progress", function () {
                        g1.style.width = (c.buffered.end(c.buffered.length - 1) / c.duration).toFixed(2) * 100 + '%';
                    });
                    c.addEventListener("canplay",function () {
                        if(c.paused){
                            e.className='SlimfVideoPlay sf-icon-play';
                        }else{
                            e.className='SlimfVideoPlay sf-icon-pause';
                        }
                    });
                    c.addEventListener("ended",function () {
                        c.pause();
                        e.className='SlimfVideoPlay sf-icon-play';
                    });
                }
            });
        },
        QRCode:function (options) {
            var VERSIONS = [null, [[10, 7, 17, 13], [1, 1, 1, 1], []], [[16, 10, 28, 22], [1, 1, 1, 1], [4, 16]], [[26, 15, 22, 18], [1, 1, 2, 2], [4, 20]], [[18, 20, 16, 26], [2, 1, 4, 2], [4, 24]], [[24, 26, 22, 18], [2, 1, 4, 4], [4, 28]], [[16, 18, 28, 24], [4, 2, 4, 4], [4, 32]], [[18, 20, 26, 18], [4, 2, 5, 6], [4, 20, 36]], [[22, 24, 26, 22], [4, 2, 6, 6], [4, 22, 40]], [[22, 30, 24, 20], [5, 2, 8, 8], [4, 24, 44]], [[26, 18, 28, 24], [5, 4, 8, 8], [4, 26, 48]], [[30, 20, 24, 28], [5, 4, 11, 8], [4, 28, 52]], [[22, 24, 28, 26], [8, 4, 11, 10], [4, 30, 56]], [[22, 26, 22, 24], [9, 4, 16, 12], [4, 32, 60]], [[24, 30, 24, 20], [9, 4, 16, 16], [4, 24, 44, 64]], [[24, 22, 24, 30], [10, 6, 18, 12], [4, 24, 46, 68]], [[28, 24, 30, 24], [10, 6, 16, 17], [4, 24, 48, 72]], [[28, 28, 28, 28], [11, 6, 19, 16], [4, 28, 52, 76]], [[26, 30, 28, 28], [13, 6, 21, 18], [4, 28, 54, 80]], [[26, 28, 26, 26], [14, 7, 25, 21], [4, 28, 56, 84]], [[26, 28, 28, 30], [16, 8, 25, 20], [4, 32, 60, 88]], [[26, 28, 30, 28], [17, 8, 25, 23], [4, 26, 48, 70, 92]], [[28, 28, 24, 30], [17, 9, 34, 23], [4, 24, 48, 72, 96]], [[28, 30, 30, 30], [18, 9, 30, 25], [4, 28, 52, 76, 100]], [[28, 30, 30, 30], [20, 10, 32, 27], [4, 26, 52, 78, 104]], [[28, 26, 30, 30], [21, 12, 35, 29], [4, 30, 56, 82, 108]], [[28, 28, 30, 28], [23, 12, 37, 34], [4, 28, 56, 84, 112]], [[28, 30, 30, 30], [25, 12, 40, 34], [4, 32, 60, 88, 116]], [[28, 30, 30, 30], [26, 13, 42, 35], [4, 24, 48, 72, 96, 120]], [[28, 30, 30, 30], [28, 14, 45, 38], [4, 28, 52, 76, 100, 124]], [[28, 30, 30, 30], [29, 15, 48, 40], [4, 24, 50, 76, 102, 128]], [[28, 30, 30, 30], [31, 16, 51, 43], [4, 28, 54, 80, 106, 132]], [[28, 30, 30, 30], [33, 17, 54, 45], [4, 32, 58, 84, 110, 136]], [[28, 30, 30, 30], [35, 18, 57, 48], [4, 28, 56, 84, 112, 140]], [[28, 30, 30, 30], [37, 19, 60, 51], [4, 32, 60, 88, 116, 144]], [[28, 30, 30, 30], [38, 19, 63, 53], [4, 28, 52, 76, 100, 124, 148]], [[28, 30, 30, 30], [40, 20, 66, 56], [4, 22, 48, 74, 100, 126, 152]], [[28, 30, 30, 30], [43, 21, 70, 59], [4, 26, 52, 78, 104, 130, 156]], [[28, 30, 30, 30], [45, 22, 74, 62], [4, 30, 56, 82, 108, 134, 160]], [[28, 30, 30, 30], [47, 24, 77, 65], [4, 24, 52, 80, 108, 136, 164]], [[28, 30, 30, 30], [49, 25, 81, 68], [4, 28, 56, 84, 112, 140, 168]]];
            var MODE_TERMINATOR = 0;
            var MODE_NUMERIC = 1,
                MODE_ALPHANUMERIC = 2,
                MODE_OCTET = 4,
                MODE_KANJI = 8;
            var NUMERIC_REGEXP = /^\d*$/;
            var ALPHANUMERIC_REGEXP = /^[A-Za-z0-9 $%*+\-./:] * $ / ;
            var ALPHANUMERIC_OUT_REGEXP = /^[A-Z0-9 $%*+\-./:] * $ / ;
            var ECCLEVEL_L = 1,
                ECCLEVEL_M = 0,
                ECCLEVEL_Q = 3,
                ECCLEVEL_H = 2;
            var GF256_MAP = [],
                GF256_INVMAP = [-1];
            for (var i = 0, v = 1; i < 255; ++i) {
                GF256_MAP.push(v);
                GF256_INVMAP[v] = i;
                v = (v * 2) ^ (v >= 128 ? 0x11d : 0);
            }
            var GF256_GENPOLY = [[]];
            for (var i = 0; i < 30; ++i) {
                var prevpoly = GF256_GENPOLY[i],
                    poly = [];
                for (var j = 0; j <= i; ++j) {
                    var a = (j < i ? GF256_MAP[prevpoly[j]] : 0);
                    var b = GF256_MAP[(i + (prevpoly[j - 1] || 0)) % 255];
                    poly.push(GF256_INVMAP[a ^ b]);
                }
                GF256_GENPOLY.push(poly);
            }
            var ALPHANUMERIC_MAP = {};
            for (var i = 0; i < 45; ++i) {
                ALPHANUMERIC_MAP['0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.charAt(i)] = i;
            }
            var MASKFUNCS = [function (i, j) {
                return (i + j) % 2 === 0;
            }, function (i, j) {
                return i % 2 === 0;
            }, function (i, j) {
                return j % 3 === 0;
            }, function (i, j) {
                return (i + j) % 3 === 0;
            }, function (i, j) {
                return (((i / 2) | 0) + ((j / 3) | 0)) % 2 === 0;
            }, function (i, j) {
                return (i * j) % 2 + (i * j) % 3 === 0;
            }, function (i, j) {
                return ((i * j) % 2 + (i * j) % 3) % 2 === 0;
            }, function (i, j) {
                return ((i + j) % 2 + (i * j) % 3) % 2 === 0;
            }
            ];
            var needsverinfo = function (ver) {
                return ver > 6;
            };
            var getsizebyver = function (ver) {
                return 4 * ver + 17;
            };
            var nfullbits = function (ver) {
                var v = VERSIONS[ver];
                var nbits = 16 * ver * ver + 128 * ver + 64;
                if (needsverinfo(ver))
                    nbits -= 36;
                if (v[2].length) {
                    nbits -= 25 * v[2].length * v[2].length - 10 * v[2].length - 55;
                }
                return nbits;
            };
            var ndatabits = function (ver, ecclevel) {
                var nbits = nfullbits(ver) & ~7;
                var v = VERSIONS[ver];
                nbits -= 8 * v[0][ecclevel] * v[1][ecclevel];
                return nbits;
            };
            var ndatalenbits = function (ver, mode) {
                switch (mode) {
                    case MODE_NUMERIC:
                        return (ver < 10 ? 10 : ver < 27 ? 12 : 14);
                    case MODE_ALPHANUMERIC:
                        return (ver < 10 ? 9 : ver < 27 ? 11 : 13);
                    case MODE_OCTET:
                        return (ver < 10 ? 8 : 16);
                    case MODE_KANJI:
                        return (ver < 10 ? 8 : ver < 27 ? 10 : 12);
                }
            };
            var getmaxdatalen = function (ver, mode, ecclevel) {
                var nbits = ndatabits(ver, ecclevel) - 4 - ndatalenbits(ver, mode);
                switch (mode) {
                    case MODE_NUMERIC:
                        return ((nbits / 10) | 0) * 3 + (nbits % 10 < 4 ? 0 : nbits % 10 < 7 ? 1 : 2);
                    case MODE_ALPHANUMERIC:
                        return ((nbits / 11) | 0) * 2 + (nbits % 11 < 6 ? 0 : 1);
                    case MODE_OCTET:
                        return (nbits / 8) | 0;
                    case MODE_KANJI:
                        return (nbits / 13) | 0;
                }
            };
            var validatedata = function (mode, data) {
                switch (mode) {
                    case MODE_NUMERIC:
                        if (!data.match(NUMERIC_REGEXP))
                            return null;
                        return data;
                    case MODE_ALPHANUMERIC:
                        if (!data.match(ALPHANUMERIC_REGEXP))
                            return null;
                        return data.toUpperCase();
                    case MODE_OCTET:
                        if (typeof data === 'string') {
                            var newdata = [];
                            for (var i = 0; i < data.length; ++i) {
                                var ch = data.charCodeAt(i);
                                if (ch < 0x80) {
                                    newdata.push(ch);
                                } else if (ch < 0x800) {
                                    newdata.push(0xc0 | (ch >> 6), 0x80 | (ch & 0x3f));
                                } else if (ch < 0x10000) {
                                    newdata.push(0xe0 | (ch >> 12), 0x80 | ((ch >> 6) & 0x3f), 0x80 | (ch & 0x3f));
                                } else {
                                    newdata.push(0xf0 | (ch >> 18), 0x80 | ((ch >> 12) & 0x3f), 0x80 | ((ch >> 6) & 0x3f), 0x80 | (ch & 0x3f));
                                }
                            }
                            return newdata;
                        } else {
                            return data;
                        }
                }
            };
            var encode = function (ver, mode, data, maxbuflen) {
                var buf = [];
                var bits = 0,
                    remaining = 8;
                var datalen = data.length;
                var pack = function (x, n) {
                    if (n >= remaining) {
                        buf.push(bits | (x >> (n -= remaining)));
                        while (n >= 8)
                            buf.push((x >> (n -= 8)) & 255);
                        bits = 0;
                        remaining = 8;
                    }
                    if (n > 0)
                        bits |= (x & ((1 << n) - 1)) << (remaining -= n);
                };
                var nlenbits = ndatalenbits(ver, mode);
                pack(mode, 4);
                pack(datalen, nlenbits);
                switch (mode) {
                    case MODE_NUMERIC:
                        for (var i = 2; i < datalen; i += 3) {
                            pack(parseInt(data.substring(i - 2, i + 1), 10), 10);
                        }
                        pack(parseInt(data.substring(i - 2), 10), [0, 4, 7][datalen % 3]);
                        break;
                    case MODE_ALPHANUMERIC:
                        for (var i = 1; i < datalen; i += 2) {
                            pack(ALPHANUMERIC_MAP[data.charAt(i - 1)] * 45 +
                                ALPHANUMERIC_MAP[data.charAt(i)], 11);
                        }
                        if (datalen % 2 === 1) {
                            pack(ALPHANUMERIC_MAP[data.charAt(i - 1)], 6);
                        }
                        break;
                    case MODE_OCTET:
                        for (var i = 0; i < datalen; ++i) {
                            pack(data[i], 8);
                        }
                        break;
                }
                pack(MODE_TERMINATOR, 4);
                if (remaining < 8)
                    buf.push(bits);
                while (buf.length + 1 < maxbuflen)
                    buf.push(0xec, 0x11);
                if (buf.length < maxbuflen)
                    buf.push(0xec);
                return buf;
            };
            var calculateecc = function (poly, genpoly) {
                var modulus = poly.slice(0);
                var polylen = poly.length,
                    genpolylen = genpoly.length;
                for (var i = 0; i < genpolylen; ++i)
                    modulus.push(0);
                for (var i = 0; i < polylen; ) {
                    var quotient = GF256_INVMAP[modulus[i++]];
                    if (quotient >= 0) {
                        for (var j = 0; j < genpolylen; ++j) {
                            modulus[i + j] ^= GF256_MAP[(quotient + genpoly[j]) % 255];
                        }
                    }
                }
                return modulus.slice(polylen);
            };
            var augumenteccs = function (poly, nblocks, genpoly) {
                var subsizes = [];
                var subsize = (poly.length / nblocks) | 0,
                    subsize0 = 0;
                var pivot = nblocks - poly.length % nblocks;
                for (var i = 0; i < pivot; ++i) {
                    subsizes.push(subsize0);
                    subsize0 += subsize;
                }
                for (var i = pivot; i < nblocks; ++i) {
                    subsizes.push(subsize0);
                    subsize0 += subsize + 1;
                }
                subsizes.push(subsize0);
                var eccs = [];
                for (var i = 0; i < nblocks; ++i) {
                    eccs.push(calculateecc(poly.slice(subsizes[i], subsizes[i + 1]), genpoly));
                }
                var result = [];
                var nitemsperblock = (poly.length / nblocks) | 0;
                for (var i = 0; i < nitemsperblock; ++i) {
                    for (var j = 0; j < nblocks; ++j) {
                        result.push(poly[subsizes[j] + i]);
                    }
                }
                for (var j = pivot; j < nblocks; ++j) {
                    result.push(poly[subsizes[j + 1] - 1]);
                }
                for (var i = 0; i < genpoly.length; ++i) {
                    for (var j = 0; j < nblocks; ++j) {
                        result.push(eccs[j][i]);
                    }
                }
                return result;
            };
            var augumentbch = function (poly, p, genpoly, q) {
                var modulus = poly << q;
                for (var i = p - 1; i >= 0; --i) {
                    if ((modulus >> (q + i)) & 1)
                        modulus ^= genpoly << i;
                }
                return (poly << q) | modulus;
            };
            var makebasematrix = function (ver) {
                var v = VERSIONS[ver],
                    n = getsizebyver(ver);
                var matrix = [],
                    reserved = [];
                for (var i = 0; i < n; ++i) {
                    matrix.push([]);
                    reserved.push([]);
                }
                var blit = function (y, x, h, w, bits) {
                    for (var i = 0; i < h; ++i) {
                        for (var j = 0; j < w; ++j) {
                            matrix[y + i][x + j] = (bits[i] >> j) & 1;
                            reserved[y + i][x + j] = 1;
                        }
                    }
                };
                blit(0, 0, 9, 9, [0x7f, 0x41, 0x5d, 0x5d, 0x5d, 0x41, 0x17f, 0x00, 0x40]);
                blit(n - 8, 0, 8, 9, [0x100, 0x7f, 0x41, 0x5d, 0x5d, 0x5d, 0x41, 0x7f]);
                blit(0, n - 8, 9, 8, [0xfe, 0x82, 0xba, 0xba, 0xba, 0x82, 0xfe, 0x00, 0x00]);
                for (var i = 9; i < n - 8; ++i) {
                    matrix[6][i] = matrix[i][6] = ~i & 1;
                    reserved[6][i] = reserved[i][6] = 1;
                }
                var aligns = v[2],
                    m = aligns.length;
                for (var i = 0; i < m; ++i) {
                    var minj = (i === 0 || i === m - 1 ? 1 : 0),
                        maxj = (i === 0 ? m - 1 : m);
                    for (var j = minj; j < maxj; ++j) {
                        blit(aligns[i], aligns[j], 5, 5, [0x1f, 0x11, 0x15, 0x11, 0x1f]);
                    }
                }
                if (needsverinfo(ver)) {
                    var code = augumentbch(ver, 6, 0x1f25, 12);
                    var k = 0;
                    for (var i = 0; i < 6; ++i) {
                        for (var j = 0; j < 3; ++j) {
                            matrix[i][(n - 11) + j] = matrix[(n - 11) + j][i] = (code >> k++) & 1;
                            reserved[i][(n - 11) + j] = reserved[(n - 11) + j][i] = 1;
                        }
                    }
                }
                return {
                    matrix: matrix,
                    reserved: reserved
                };
            };
            var putdata = function (matrix, reserved, buf) {
                var n = matrix.length;
                var k = 0,
                    dir = -1;
                for (var i = n - 1; i >= 0; i -= 2) {
                    if (i === 6)
                        --i;
                    var jj = (dir < 0 ? n - 1 : 0);
                    for (var j = 0; j < n; ++j) {
                        for (var ii = i; ii > i - 2; --ii) {
                            if (!reserved[jj][ii]) {
                                matrix[jj][ii] = (buf[k >> 3] >> (~k & 7)) & 1;
                                ++k;
                            }
                        }
                        jj += dir;
                    }
                    dir = -dir;
                }
                return matrix;
            };
            var maskdata = function (matrix, reserved, mask) {
                var maskf = MASKFUNCS[mask];
                var n = matrix.length;
                for (var i = 0; i < n; ++i) {
                    for (var j = 0; j < n; ++j) {
                        if (!reserved[i][j])
                            matrix[i][j] ^= maskf(i, j);
                    }
                }
                return matrix;
            };
            var putformatinfo = function (matrix, reserved, ecclevel, mask) {
                var n = matrix.length;
                var code = augumentbch((ecclevel << 3) | mask, 5, 0x537, 10) ^ 0x5412;
                for (var i = 0; i < 15; ++i) {
                    var r = [0, 1, 2, 3, 4, 5, 7, 8, n - 7, n - 6, n - 5, n - 4, n - 3, n - 2, n - 1][i];
                    var c = [n - 1, n - 2, n - 3, n - 4, n - 5, n - 6, n - 7, n - 8, 7, 5, 4, 3, 2, 1, 0][i];
                    matrix[r][8] = matrix[8][c] = (code >> i) & 1;
                }
                return matrix;
            };
            var evaluatematrix = function (matrix) {
                var PENALTY_CONSECUTIVE = 3;
                var PENALTY_TWOBYTWO = 3;
                var PENALTY_FINDERLIKE = 40;
                var PENALTY_DENSITY = 10;
                var evaluategroup = function (groups) {
                    var score = 0;
                    for (var i = 0; i < groups.length; ++i) {
                        if (groups[i] >= 5)
                            score += PENALTY_CONSECUTIVE + (groups[i] - 5);
                    }
                    for (var i = 5; i < groups.length; i += 2) {
                        var p = groups[i];
                        if (groups[i - 1] === p && groups[i - 2] === 3 * p && groups[i - 3] === p && groups[i - 4] === p && (groups[i - 5] >= 4 * p || groups[i + 1] >= 4 * p)) {
                            score += PENALTY_FINDERLIKE;
                        }
                    }
                    return score;
                };
                var n = matrix.length;
                var score = 0,
                    nblacks = 0;
                for (var i = 0; i < n; ++i) {
                    var row = matrix[i];
                    var groups;
                    groups = [0];
                    for (var j = 0; j < n; ) {
                        var k;
                        for (k = 0; j < n && row[j]; ++k)
                            ++j;
                        groups.push(k);
                        for (k = 0; j < n && !row[j]; ++k)
                            ++j;
                        groups.push(k);
                    }
                    score += evaluategroup(groups);
                    groups = [0];
                    for (var j = 0; j < n; ) {
                        var k;
                        for (k = 0; j < n && matrix[j][i]; ++k)
                            ++j;
                        groups.push(k);
                        for (k = 0; j < n && !matrix[j][i]; ++k)
                            ++j;
                        groups.push(k);
                    }
                    score += evaluategroup(groups);
                    var nextrow = matrix[i + 1] || [];
                    nblacks += row[0];
                    for (var j = 1; j < n; ++j) {
                        var p = row[j];
                        nblacks += p;
                        if (row[j - 1] === p && nextrow[j] === p && nextrow[j - 1] === p) {
                            score += PENALTY_TWOBYTWO;
                        }
                    }
                }
                score += PENALTY_DENSITY * ((Math.abs(nblacks / n / n - 0.5) / 0.05) | 0);
                return score;
            };
            var generate = function (data, ver, mode, ecclevel, mask) {
                var v = VERSIONS[ver];
                var buf = encode(ver, mode, data, ndatabits(ver, ecclevel) >> 3);
                buf = augumenteccs(buf, v[1][ecclevel], GF256_GENPOLY[v[0][ecclevel]]);
                var result = makebasematrix(ver);
                var matrix = result.matrix,
                    reserved = result.reserved;
                putdata(matrix, reserved, buf);
                if (mask < 0) {
                    maskdata(matrix, reserved, 0);
                    putformatinfo(matrix, reserved, ecclevel, 0);
                    var bestmask = 0,
                        bestscore = evaluatematrix(matrix);
                    maskdata(matrix, reserved, 0);
                    for (mask = 1; mask < 8; ++mask) {
                        maskdata(matrix, reserved, mask);
                        putformatinfo(matrix, reserved, ecclevel, mask);
                        var score = evaluatematrix(matrix);
                        if (bestscore > score) {
                            bestscore = score;
                            bestmask = mask;
                        }
                        maskdata(matrix, reserved, mask);
                    }
                    mask = bestmask;
                }
                maskdata(matrix, reserved, mask);
                putformatinfo(matrix, reserved, ecclevel, mask);
                return matrix;
            };
            var judge = function (data, options) {
                var MODES = {
                    'numeric': MODE_NUMERIC,
                    'alphanumeric': MODE_ALPHANUMERIC,
                    'octet': MODE_OCTET
                };
                var ECCLEVELS = {
                    'L': ECCLEVEL_L,
                    'M': ECCLEVEL_M,
                    'Q': ECCLEVEL_Q,
                    'H': ECCLEVEL_H
                };
                options = options || {};
                var ver = options.version || -1;
                var ecclevel = ECCLEVELS[(options.ecclevel || 'L').toUpperCase()];
                var mode = options.mode ? MODES[options.mode.toLowerCase()] : -1;
                var mask = 'mask' in options ? options.mask : -1;
                if (mode < 0) {
                    if (typeof data === 'string') {
                        if (data.match(NUMERIC_REGEXP)) {
                            mode = MODE_NUMERIC;
                        } else if (data.match(ALPHANUMERIC_OUT_REGEXP)) {
                            mode = MODE_ALPHANUMERIC;
                        } else {
                            mode = MODE_OCTET;
                        }
                    } else {
                        mode = MODE_OCTET;
                    }
                } else if (!(mode === MODE_NUMERIC || mode === MODE_ALPHANUMERIC || mode === MODE_OCTET)) {
                    throw 'invalid or unsupported mode';
                }
                data = validatedata(mode, data);
                if (data === null)
                    throw 'invalid data format';
                if (ecclevel < 0 || ecclevel > 3)
                    throw 'invalid ECC level';
                if (ver < 0) {
                    for (ver = 1; ver <= 40; ++ver) {
                        if (data.length <= getmaxdatalen(ver, mode, ecclevel))
                            break;
                    }
                    if (ver > 40)
                        throw 'too large data';
                } else if (ver < 1 || ver > 40) {
                    throw 'invalid version';
                }
                if (mask !== -1 && (mask < 0 || mask > 8))
                    throw 'invalid mask';
                return generate(data, ver, mode, ecclevel, mask);
            };
            options = options || {};
            var matrix = judge(options.data, options);
            var modsize = Math.max(options.modulesize || 5, 0.5);
            var size = modsize *matrix.length;
            var canvas = document.createElement('canvas'),context;
            canvas.width = canvas.height = size;
            context = canvas.getContext('2d');
            context.fillStyle =  options.fillcolor ? options.fillcolor : "#FFFFFF";
            context.fillRect(0, 0, size, size);
            context.fillStyle = options.textcolor ? options.textcolor : "#000000";
            for (var i = 0; i < matrix.length; ++i) {
                for (var j = 0; j < matrix.length; ++j) {
                    if (matrix[i][j]) {
                        context.fillRect(modsize *j, modsize *i, modsize, modsize);
                    }
                }
            }
            $.CreateElement({
                tag:'img',
                id:options.id ? options.id :'SlimfQRCode',
                attr:{"src":canvas.toDataURL(),"draggable":false},
                node:options.node ? options.node :document.body
            });
        },
        Calendar:function (show,area) {
            var CandlerType=[],CandlerArea=[],CandlerHead,CandlerInfoArr=[],CandlerUp=[],CandlerDown=[],Now=[],CandlerData=[],MonthInfo=[],Candler,CandlerIntver;
            var Data = new Date();
            CandlerData.year=Now.year = Data.getFullYear();
            CandlerData.month=Now.month = Data.getMonth() + 1;
            Now.day = Data.getDate();
            Now.hour=$.String.zeroize(Data.getHours());
            Now.min=$.String.zeroize(Data.getMinutes());
            Now.sec=$.String.zeroize(Data.getSeconds());
            $.Calendar.Refues = function (a)/*获取今天时间*/ {
                Data=new Date();
                Now.hour=$.String.zeroize(Data.getHours());
                Now.min=$.String.zeroize(Data.getMinutes());
                Now.sec=$.String.zeroize(Data.getSeconds());
                if (Now.sec >= 60) {
                    Now.min++;
                    Now.sec = 0;
                    if (Now.min >= 60) {
                        cloud_hHour++;
                        Now.min = 0;
                    }
                }
                a?a.innerHTML = '<p class="SlimfcandlerTime">'+Now.hour+':'+Now.min+':'+Now.sec+'</p><p class="SlimfcandlerData">'+Now.year+'年'+Now.month+'月'+Now.day+'日</p>':"";
            };
            $.Calendar.CandlerSwitch=function (node,Btn,Area,data) {
                for (var i = 0; i < CandlerType.length; i++) {
                    CandlerType[i].style.display = 'none';
                }
                CandlerType[node].style.display = 'block';
                node===1&&node!==0?$.Calendar.ShowInfo('month',Btn,Area,data):$.Calendar.ShowInfo('year',Btn,Area,data);
            };
            $.Calendar.CandlerControl=function (type,Btn,Area,data,count) {
                if(typeof data!=='object'){
                    data=data+count;
                }else{
                    data.month=data.month+count;
                    if(data.month===0){
                        data.month=12;
                        data.year--;
                    }if(data.month===13){
                        data.month=1;
                        data.year++;
                    }
                }
                $.Calendar.ShowInfo(type,Btn,Area,data);
            };
            $.Calendar.MonthInfo=function (y,m) {
                var a=new Date(y, m-1, 1).getDay();
                if(a===0){
                    a=7;
                }
                MonthInfo.week=a;
                MonthInfo.days=new Date(y, parseInt(m, 10), 0).getDate();
                MonthInfo.prevDay=(new Date(new Date(y,m-1,1).getTime()-1000*60*60*24)).getDate()-MonthInfo.week+1;
                MonthInfo.nextDay=42-MonthInfo.days-MonthInfo.week+1;
            };
            $.Calendar.ShowInfo=function (type,Btn,Area,data) {
                Area.innerHTML = '';
                if(typeof data!=='object'){
                    Btn.year = data;
                    CandlerData.year=data;
                }
                var b=null;
                if(type==='year'){
                    var start_year = data - 15;
                    Btn.innerHTML = start_year + '-' + data;
                    for (var i = 0; i <= 15; i++) {
                        b = $.CreateElement({
                            html: start_year+ i,
                            node: Area
                        });
                        b.year=start_year+i;
                        b.onclick = function () {
                            Btn.year=this.year;
                            Btn.click();
                        };
                        if (b.year === Now.year) {
                            b.className='toyear';
                        }
                    }
                }else if(type==='month'){
                    Btn.innerHTML=data+'年';
                    for (i = 1; i <= 12; i++) {
                        var a = $.CreateElement({
                            html: i + '月',
                            node: Area
                        });
                        a.data= {
                            month: i,
                            year: data
                        };
                        a.onclick = function () {
                            CandlerData.month=this.data.month;
                            CandlerData.year=this.data.year;
                            $.Calendar.ShowInfo('day',CandlerInfoArr[0],CandlerArea[0],CandlerData);
                        };
                        if (a.data.year === Now.year&&a.data.month===Now.month) {
                            a.className='tomonth';
                        }
                    }
                }else if(type==='day'){
                    CandlerInfoArr[0].year=CandlerData.year;
                    CandlerType[1].style.display='none';
                    CandlerType[0].style.display='block';
                    Btn.innerHTML=CandlerData.year+'年'+CandlerData.month+'月';
                    $.Calendar.MonthInfo(CandlerData.year,CandlerData.month);
                    for (i = 1; i < MonthInfo.week; i++) {
                        MonthInfo.prevDay++;
                        $.CreateElement({
                            html:  MonthInfo.prevDay,
                            className: 'SlimfCandlerNo',
                            node: Area
                        });
                    }
                    for (var j = 1; j <= MonthInfo.days; j++) {
                        b = $.CreateElement({
                            html: j,
                            node: Area
                        });
                        b.data=CandlerData.year+'-'+CandlerData.month+'-'+j;
                        b.onclick = function () {
                            if (area) {
                                (area.tagName === 'input' || area.tagName === 'INPUT')?area.value = this.data:area.innerHTML = this.data;
                            }
                            Candler.blur();
                        };
                        if (b.data === Now.year + '-' + Now.month + '-' + Now.day) {
                            b.className='today';
                        }
                    }
                    for(var k=1;k<=MonthInfo.nextDay; k++){
                        $.CreateElement({
                            html: k,
                            className: 'SlimfCandlerNo',
                            node: Area
                        });
                    }
                }
            };
            var a=Candler= $.CreateElement({
                id: 'SlimfCandler',
                style:{"left":area.getBoundingClientRect().left + 1 + 'px',"top":area.getBoundingClientRect().top + area.offsetHeight + 'px'},
                attr:{"tabIndex":-1},
                className: 'SlimfCandler'
            });
            a.focus();
            a.onblur = function () {
                this.style.opacity=0;
                var aaa=setTimeout(function () {
                    Candler.remove();
                    aaa&&clearTimeout(aaa);
                    CandlerIntver&&clearInterval(CandlerIntver);
                },250);
            };
            if (show) {
                var b = $.CreateElement({
                    className: 'SlimfCandlerHead',
                    html: '<p class="SlimfcandlerTime">'+Now.hour+':'+Now.min+':'+Now.sec+'</p><p class="SlimfcandlerData">'+Now.year+'年'+Now.month+'月'+Now.day+'日</p>',
                    node: a
                });
                CandlerIntver=setInterval(function () {
                    $.Calendar.Refues(b);
                }, 1000);
            }
            var c = $.CreateElement({
                className: 'SlimfCandlerContainer',
                node: a
            });
            for(var i=0;i<3;i++){
                CandlerType[i]=$.CreateElement({
                    style:{"display":"none"},
                    node: c
                });
                CandlerHead=$.CreateElement({
                    className: 'SlimfCandlerset',
                    node: CandlerType[i]
                });
                if(show){
                    CandlerHead.className+=' SlimfCandlerShow';
                }
                CandlerInfoArr[i]=$.CreateElement({
                    node: CandlerHead
                });
                CandlerDown[i] = $.CreateElement({
                    tag: 'span',
                    attr:{"ripple":""},
                    className: 'sf-icon-angle-down',
                    node: CandlerHead
                });
                CandlerUp[i] = $.CreateElement({
                    tag: 'span',
                    attr:{"ripple":""},
                    className: 'sf-icon-angle-up',
                    node: CandlerHead
                });
                CandlerDown[i].count=1;
                CandlerUp[i].count=-1;
                if(i===0){
                    $.CreateElement({
                        className: 'SlimfCandlerSW',
                        html:'<div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div>',
                        node: CandlerType[0]
                    });
                }
                CandlerArea[i]=$.CreateElement({
                    node: CandlerType[i]
                });
                CandlerArea[i].count=i;
                CandlerArea[i].onmousewheel=function (e) {
                    if (e.wheelDelta < 0) {
                        CandlerDown[this.count].click();
                    } else {
                        CandlerUp[this.count].click();
                    }
                };
                CandlerInfoArr[i].year=Now.year;
                if(i===0){
                    CandlerArea[i].className='SlimfCandlerSD';
                    CandlerInfoArr[i].innerHTML= Now.year+'年'+ Now.month+'月';
                    CandlerInfoArr[i].onclick=function () {
                        $.Calendar.CandlerSwitch(1,CandlerInfoArr[1],CandlerArea[1],this.year);
                    };
                    CandlerDown[i].onclick=CandlerUp[i].onclick=function () {
                        $.Calendar.CandlerControl('day',CandlerInfoArr[0],CandlerArea[0],CandlerData,this.count)
                    };
                }else if(i===1){
                    CandlerArea[i].className='SlimfCandlerSM';
                    CandlerInfoArr[i].onclick=function () {
                        $.Calendar.CandlerSwitch(2,CandlerInfoArr[2],CandlerArea[2],this.year);
                    };
                    CandlerDown[i].onclick=CandlerUp[i].onclick=function () {
                        $.Calendar.CandlerControl('month',CandlerInfoArr[1],CandlerArea[1],CandlerInfoArr[1].year,this.count)
                    };
                }else if(i===2){
                    CandlerUp[2].count=-15;
                    CandlerDown[2].count=15;
                    CandlerArea[i].className='SlimfCandlerSY';
                    CandlerInfoArr[i].onclick=function () {
                        $.Calendar.CandlerSwitch(1,CandlerInfoArr[1],CandlerArea[1],this.year);
                    };
                    CandlerDown[i].onclick=CandlerUp[i].onclick=function () {
                        $.Calendar.CandlerControl('year',CandlerInfoArr[2],CandlerArea[2],CandlerInfoArr[2].year,this.count)
                    };
                }
            }
            $.Calendar.CandlerControl('day',CandlerInfoArr[0],CandlerArea[0],CandlerData,0);
            return a;
        },
        MouseMenu:function (menu_main,data,callback,e) /*右键菜单，参数,返回函数,回调,event*/{
            e.preventDefault();
            e.stopPropagation();
            $("#SlimfMouseSelect").remove();
            var createNode=menu_main.parentNode;
            var a=$('.SlimfMouseMenu');
            for(var i=0;i<a.length;i++){
                a[i].style.display='none';
            }
            document.onmouseup=function () {
                if (e.button === 2) {
                    menu_main.style.left = e.pageX + -parseFloat(createNode.getBoundingClientRect().left)+createNode.offsetLeft+ 'px';
                    menu_main.style.top = e.pageY + -parseFloat(createNode.getBoundingClientRect().top)+createNode.offsetTop+ 'px';
                    menu_main.style.display = 'block';
                    if(menu_main.getBoundingClientRect().left+menu_main.offsetHeight-createNode.getBoundingClientRect().left>createNode.offsetWidth){
                        menu_main.style.left=menu_main.style.left.split('px')[0]-menu_main.offsetWidth+'px';
                    }
                    if(menu_main.getBoundingClientRect().top+menu_main.offsetHeight-createNode.getBoundingClientRect().top>createNode.offsetHeight){
                        menu_main.style.top=menu_main.style.top.split('px')[0]-menu_main.offsetHeight+'px';
                    }
                    callback(data);
                    document.onmouseup = null;
                }
            };
            createNode.onclick=createNode.onmousewheel=function () {
                for(var i=0;i<a.length;i++){
                    a[i].style.display='none';
                }
            };
        },
        MouseSelect:function (select,selected,callback,area,e)/*选择的元素，选中的class，回调,应用位置，event*/{
            e.preventDefault();
            e.stopPropagation();
            area.style.position = 'relative';
            area.style.overflowX='hidden';
            if(e.button===0) {
                var selList = document.getElementsByClassName(select);
                for (var i = 0; i < selList.length; i++) {
                    selList[i].className = select;
                }
                typeof callback ==='function'&&callback();
                var start={
                    x:e.clientX-area.getBoundingClientRect().left+area.scrollLeft,
                    y:e.clientY-area.getBoundingClientRect().top+area.scrollTop,
                    maxy:area.scrollHeight
                };
                var div = $.CreateElement({
                    id: 'SlimfMouseSelect',
                    className: 'SlimfMouseSelect',
                    style: {
                        "left": start.x  + "px",
                        "top": start.y+ "px"
                    },
                    node: area
                });
                document.onmouseup = function() {
                    div.remove();
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
                document.onmousemove = function (ev) {
                    var end={
                        x:ev.clientX-area.getBoundingClientRect().left+area.scrollLeft,
                        y:ev.clientY-area.getBoundingClientRect().top+area.scrollTop,
                        scrolldown:Math.min(ev.clientY - area.getBoundingClientRect().top, e.clientY - area.getBoundingClientRect().top)+10+div.offsetHeight,
                        scrollup:Math.min(ev.clientY - area.getBoundingClientRect().top, e.clientY - area.getBoundingClientRect().top)
                    };
                    div.style.left = Math.min(start.x,end.x) + "px";
                    div.style.top = Math.min(start.y,end.y) + "px";
                    div.style.width = Math.abs(end.x-start.x) + "px";
                    div.style.height = Math.abs(end.y-start.y) + "px";
                    if (end.scrolldown >= area.offsetHeight && (end.y-start.y > 0)) {
                        area.scrollTop = area.scrollTop + (selList[0].offsetHeight/8);
                    } else if (end.scrollup<=10&&area.scrollTop) {
                        area.scrollTop = area.scrollTop - (selList[0].offsetHeight/8);
                    }
                    for (var i = 0; i < selList.length; i++) {
                        var sl = selList[i].offsetWidth + selList[i].offsetLeft,st = selList[i].offsetHeight + selList[i].offsetTop;
                        if (sl > div.offsetLeft && st > div.offsetTop && selList[i].offsetLeft < div.offsetLeft + div.offsetWidth && selList[i].offsetTop < div.offsetTop + div.offsetHeight) {
                            if (!$.String.exist(selList[i].className,selected)) {
                                selList[i].className = selList[i].className += ' ' + selected;
                            }
                        } else {
                            if ($.String.exist(selList[i].className,selected)) {
                                selList[i].className = select;
                            }
                        }
                    }
                    typeof callback ==='function'&&callback();
                    div.offsetHeight+div.offsetTop>=start.maxy&&document.onmouseup();
                };
            }
        },
        UploadPreview:function (file,area){
            file.files&&file.files[0]?area.src = window.URL.createObjectURL(file.files[0]):"";
        },
        isFunction:function (obj) {
            return Object.prototype.toString.call(obj) === '[object Function]'
        }
    });
    Slimf.start=function(){
        function check(){
            if(!flag.SlimfLoadFlag){
                return false
            }
            Array.prototype.forEach.call($('[tooltip]'), function (elm) {
                elm.addEventListener('mouseover', $.Toolip.show, false);
                elm.addEventListener('mouseout', $.Toolip.hide, false);
            });
            Array.prototype.forEach.call($("input[type=checkbox]"), function (elm) {
                $.FormControl(elm);

            });
            Array.prototype.forEach.call($("select"), function (elm) {
                $.FormControl(elm);
            });
        }
        Slimf.Window.Bar = Slimf.CreateElement({
            id: "SlimfBar"
        });
        Slimf.Toolip.tooltip = Slimf.CreateElement({
            className: "SlimfToolTip no-display"
        });
        Slimf.ToastWrap=Slimf.CreateElement({
            className: "SlimfToastWrap"
        });
        Slimf.CreateElement({
            tag: "slimf",
            attr: {"ver": flag.version},
            node: document.body.parentNode
        });
        window.onerror = function(a, b, c, d, e) {
            (b === '' || b === undefined)?b=window.location:"";
            //if (/^((?!Slimf\.js).)+$/.test(b)) {
                console.error('错误信息:' + e.message + '\n错误地址:' + b + ':' + c + '\n错误坐标:' + c + ' 行 ' + d + ' 列');
            //}
            return true
        };
        window.addEventListener('load',check);
        document.body.addEventListener('DOMNodeInserted',check);
        document.onkeydown = function() {
            var e = window.event||arguments[0];
            if(e.keyCode===123){
                //return false;
            }else if((e.ctrlKey)&&(e.shiftKey)&&(e.keyCode===73)){
                return false;
            }else if((e.ctrlKey)&&(e.keyCode===85)){
                return false;
            }else if((e.ctrlKey)&&(e.keyCode===83)){
                return false;
            }
        };
        if (!Element.prototype.matches) {
            Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector ||
                function(s) {
                    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                        i = matches.length;
                    while (--i >= 0 && matches.item(i) !== this) {}
                    return i > -1
                }
        }
    }();
    ROOT.Slimf = ROOT.$ = Slimf;
})(window);