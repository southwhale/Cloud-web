(function (ROOT) {
    var editorId = 1;//id，累加
    var flag={
        version: '0.5.5'
    };
    var Editor=function(toolbarSelector, textSelector) {
        if (toolbarSelector == null) {
            throw new Error('错误：初始化编辑器时候未传入任何参数');
        }
        this.id = 'SlimfEditor-' + editorId++;//id，用以区分单个页面不同的编辑器对象
        this.toolbarSelector = toolbarSelector;
        this.textSelector = textSelector;
        this.customConfig = {}; //自定义配置
    };
    Editor.version=flag.version;
    Editor.author=Slimf.author;
    Editor.prototype = {
        constructor: Editor,
        //初始化配置
        _initConfig: function _initConfig() {
            this.config = $.OptionsInit(this.customConfig,config);
        },
        //初始化 DOM
        _initDom: function _initDom() {
            var _this = this;
            var toolbarSelector = this.toolbarSelector;
            var $toolbarSelector = $(toolbarSelector);
            var textSelector = this.textSelector;
            var config$$1 = this.config;
            var zIndex = config$$1.zIndex;
            //定义变量
            var $toolbarElem = void 0,
                $textContainerElem = void 0,
                $textElem = void 0,
                $children = void 0;
            if (textSelector == null) {
                //只传入一个参数，即是容器的选择器或元素，toolbar 和 text 的元素自行创建
                $toolbarElem = $('<div></div>');
                $textContainerElem = $('<div></div>');
                //将编辑器区域原有的内容，暂存起来
                $children = $toolbarSelector.children();
                //添加到 DOM 结构中
                $toolbarSelector.append($toolbarElem).append($textContainerElem);
                //自行创建的，需要配置默认的样式
                $textContainerElem.css('height', 'calc(100% - 40px)');
            } else {
                //toolbar 和 text 的选择器都有值，记录属性
                $toolbarElem = $toolbarSelector;
                $textContainerElem = $(textSelector);
                //将编辑器区域原有的内容，暂存起来
                $children = $textContainerElem.children();
            }
            //编辑区域
            $textElem = $('<div></div>');
            $textElem.attr('contenteditable', 'true').css('width', '100%').css('height', '100%');
            //初始化编辑区域内容
            if ($children && $children.length) {
                $textElem.append($children);
            } else {
                $textElem.append($('<p><br></p>'));
            }
            //编辑区域加入DOM
            $textContainerElem.append($textElem);
            //设置通用的 class
            $toolbarElem.addClass('SlimfEditortoolbar');
            $textContainerElem.addClass('SlimfEditorTextContainer');
            $textElem.addClass('SlimfEditorText');
            //添加 ID
            var toolbarElemId = getRandom('toolbar-elem');
            $toolbarElem.attr('id', toolbarElemId);
            var textElemId = getRandom('text-elem');
            $textElem.attr('id', textElemId);
            //记录属性
            this.$toolbarElem = $toolbarElem;
            this.$textContainerElem = $textContainerElem;
            this.$textElem = $textElem;
            this.toolbarElemId = toolbarElemId;
            this.textElemId = textElemId;
            //绑定 onchange
            $textContainerElem.on('click keyup', function () {
                _this.change && _this.change();
            });
            $toolbarElem.on('click', function () {
                this.change && this.change();
            });
            //绑定 onfocus 与 onblur 事件
            if (config$$1.onfocus || config$$1.onblur) {
                //当前编辑器是否是焦点状态
                this.isFocus = false;
                $(document).on('click', function (e) {
                    //判断当前点击元素是否在编辑器内
                    var isChild = $toolbarSelector.isContain($(e.target));
                    if (!isChild) {
                        if (_this.isFocus) {
                            _this.onblur && _this.onblur();
                        }
                        _this.isFocus = false;
                    } else {
                        if (!_this.isFocus) {
                            _this.onfocus && _this.onfocus();
                        }
                        _this.isFocus = true;
                    }
                });
            }
        },
        //封装 command
        _initCommand: function _initCommand() {
            this.cmd = new Command(this);
        },
        //封装 selection range API
        _initSelectionAPI: function _initSelectionAPI() {
            this.selection = new API(this);
        },
        //添加图片上传
        _initUploadImg: function _initUploadImg() {
            this.uploadImg = new UploadImg(this);
        },
        //初始化菜单
        _initMenus: function _initMenus() {
            this.menus = new Menus(this);
            this.menus.init();
        },
        //添加 text 区域
        _initText: function _initText() {
            this.txt = new Text(this);
            this.txt.init();
        },
        //初始化选区，将光标定位到内容尾部
        initSelection: function initSelection(newLine) {
            var $textElem = this.$textElem;
            var $children = $textElem.children();
            if (!$children.length) {
                //如果编辑器区域无内容，添加一个空行，重新设置选区
                $textElem.append($('<p><br></p>'));
                this.initSelection();
                return;
            }

            var $last = $children.last();

            if (newLine) {
                //新增一个空行
                var html = $last.html().toLowerCase();
                var nodeName = $last.getNodeName();
                if (html !== '<br>' && html !== '<br\/>' || nodeName !== 'P') {
                    //最后一个元素不是 <p><br></p>，添加一个空行，重新设置选区
                    $textElem.append($('<p><br></p>'));
                    this.initSelection();
                    return;
                }
            }

            this.selection.createRangeByElem($last, false, true);
            this.selection.restoreSelection();
        },
        //绑定事件
        _bindEvent: function _bindEvent() {
            //-------- 绑定 onchange 事件 --------
            var onChangeTimeoutId = 0;
            var beforeChangeHtml = this.txt.html();
            var config$$1 = this.config;
            //onchange 触发延迟时间
            var onchangeTimeout = config$$1.onchangeTimeout;
            onchangeTimeout = parseInt(onchangeTimeout, 10);
            if (!onchangeTimeout || onchangeTimeout <= 0) {
                onchangeTimeout = 200;
            }
            var onchange = config$$1.onchange;
            if (onchange && typeof onchange === 'function') {
                //触发 change 的有三个场景：
                //1. $textContainerElem.on('click keyup')
                //2. $toolbarElem.on('click')
                //3. editor.cmd.do()
                this.change = function () {
                    //判断是否有变化
                    var currentHtml = this.txt.html();

                    if (currentHtml.length === beforeChangeHtml.length) {
                        //需要比较每一个字符
                        if (currentHtml === beforeChangeHtml) {
                            return;
                        }
                    }

                    //执行，使用节流
                    if (onChangeTimeoutId) {
                        clearTimeout(onChangeTimeoutId);
                    }
                    onChangeTimeoutId = setTimeout(function () {
                        //触发配置的 onchange 函数
                        onchange(currentHtml);
                        beforeChangeHtml = currentHtml;
                    }, onchangeTimeout);
                };
            }
            //-------- 绑定 onblur 事件 --------
            var onblur = config$$1.onblur;
            if (onblur && typeof onblur === 'function') {
                this.onblur = function () {
                    var currentHtml = this.txt.html();
                    onblur(currentHtml);
                };
            }
            //-------- 绑定 onfocus 事件 --------
            var onfocus = config$$1.onfocus;
            if (onfocus && typeof onfocus === 'function') {
                this.onfocus = function () {
                    onfocus();
                };
            }
        },
        //创建编辑器
        create: function create() {
            this._initConfig();//初始化配置信息
            this._initDom(); //初始化 DOM
            this._initCommand();//封装 command API
            this._initSelectionAPI(); //封装 selection range API
            this._initText();//添加 text
            this._initMenus(); //初始化菜单
            this._initUploadImg();//添加 图片上传
            this.initSelection(true);//初始化选区，将光标定位到内容尾部
            this._bindEvent();//绑定事件
        }
    };
    var config = {
        //默认菜单配置
        menus: ['Head','Bold','Italic','Underline','StrikeThrough','fontFamily','fontSize','ForeColor','BackColor','Save','Download','Link','List','Justify','Quote','Emoticon','Image','Table','Video','Code','Redo','Undo'],
        colors: ['#000000', '#f00', '#00f', '#0df900', '#1c487f', '#38f', '#4d80bf', '#c24f4a', '#8baa4a', '#7b5ba1', '#46acc8', '#f9963b', '#ffffff'],
        fontFamily:['黑体','幼圆','楷体','隶书','宋体','新宋体','等线','华文彩云','华文仿宋','华文行楷','华文细黑','微软雅黑','方正舒体','方正兰亭'],
        fontSize:['8px','10px','12px','14px','16px','18px','20px','22px','24px','26px','28px','30px'],
        SaveFunc:function (content) {
            console.log(content)
        },
        DownLoad:function (textElem) {
            SlimfToast('开始生成下载')
            wordExport(textElem)
        },
        emotions: [{
            //tab 的标题
            title: '默认',
            //type -> 'emoji' / 'image'
            type: 'image',
            //content -> 数组
            content: [{
                alt: '[坏笑]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/50/pcmoren_huaixiao_org.png'
            }, {
                alt: '[舔屏]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/pcmoren_tian_org.png'
            }, {
                alt: '[污]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3c/pcmoren_wu_org.png'
            }, {
                alt: '[允悲]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/2c/moren_yunbei_org.png'
            }, {
                alt: '[笑而不语]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3a/moren_xiaoerbuyu_org.png'
            }, {
                alt: '[费解]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3c/moren_feijie_org.png'
            }, {
                alt: '[憧憬]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/37/moren_chongjing_org.png'
            }, {
                alt: '[并不简单]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/fc/moren_bbjdnew_org.png'
            }, {
                alt: '[微笑]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/huanglianwx_org.gif'
            }, {
                alt: '[酷]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/8a/pcmoren_cool2017_org.png'
            }, {
                alt: '[嘻嘻]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/tootha_org.gif'
            }, {
                alt: '[哈哈]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6a/laugh.gif'
            }, {
                alt: '[可爱]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/14/tza_org.gif'
            }, {
                alt: '[可怜]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/kl_org.gif'
            }, {
                alt: '[挖鼻]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/wabi_org.gif'
            }, {
                alt: '[吃惊]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/cj_org.gif'
            }, {
                alt: '[害羞]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/shamea_org.gif'
            }, {
                alt: '[挤眼]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c3/zy_org.gif'
            }, {
                alt: '[闭嘴]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/29/bz_org.gif'
            }, {
                alt: '[鄙视]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/71/bs2_org.gif'
            }, {
                alt: '[爱你]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/lovea_org.gif'
            }, {
                alt: '[泪]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9d/sada_org.gif'
            }, {
                alt: '[偷笑]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/19/heia_org.gif'
            }, {
                alt: '[亲亲]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/8f/qq_org.gif'
            }, {
                alt: '[生病]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/sb_org.gif'
            }, {
                alt: '[太开心]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/mb_org.gif'
            }, {
                alt: '[白眼]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/landeln_org.gif'
            }, {
                alt: '[右哼哼]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/98/yhh_org.gif'
            }, {
                alt: '[左哼哼]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/zhh_org.gif'
            }, {
                alt: '[嘘]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a6/x_org.gif'
            }, {
                alt: '[衰]',
                src: 'http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/cry.gif'
            }]
        }, {
            //tab 的标题
            title: '新浪',
            //type -> 'emoji' / 'image'
            type: 'image',
            //content -> 数组
            content: [{
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/7a/shenshou_thumb.gif',
                alt: '[草泥马]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/60/horse2_thumb.gif',
                alt: '[神马]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/fuyun_thumb.gif',
                alt: '[浮云]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/c9/geili_thumb.gif',
                alt: '[给力]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/f2/wg_thumb.gif',
                alt: '[围观]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/70/vw_thumb.gif',
                alt: '[威武]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/6e/panda_thumb.gif',
                alt: '[熊猫]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/81/rabbit_thumb.gif',
                alt: '[兔子]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/bc/otm_thumb.gif',
                alt: '[奥特曼]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/15/j_thumb.gif',
                alt: '[囧]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/89/hufen_thumb.gif',
                alt: '[互粉]'
            }, {
                src: 'http://img.t.sinajs.cn/t35/style/images/common/face/ext/normal/c4/liwu_thumb.gif',
                alt: '[礼物]'
            }]
        }, {
            //tab 的标题
            title: 'emoji',
            //type -> 'emoji' / 'image'
            type: 'emoji',
            //content -> 数组
            content: '😀 😃 😄 😁 😆 😅 😂 😊 😇 🙂 🙃 😉 😌 😍 😘 😗 😙 😚 😋 😜 😝 😛 🤑 🤗 🤓 😎 😏 😒 😞 😔 😟 😕 🙁  😣 😖 😫 😩 😤 😠 😡 😶 😐 😑 😯 😦 😧 😮 😲 😵 😳 😱 😨 😰 😢 😥 😭 😓 😪 😴 🙄 🤔 😬 🤐'.split(/\s/)
        }],
        zIndex: 1,
        //粘贴过滤样式，默认开启
        pasteFilterStyle: true,
        //对粘贴的文字进行自定义处理，返回处理后的结果。编辑器会将处理后的结果粘贴到编辑区域中。
        //IE 暂时不支持
        pasteTextHandle: function pasteTextHandle(content) {
            //content 即粘贴过来的内容（html 或 纯文本），可进行自定义处理然后返回
            return content;
        },
        //onchange 事件
        //onchange: function (html) {
        //    //html 即变化之后的内容
        //    console.log(html)
        //},
        //插入网络图片的回调
        linkImgCallback: function linkImgCallback(url) {
            //console.log(url)  //url 即插入图片的地址
        },
        //默认上传图片 max size: 5M
        uploadImgMaxSize: 5 * 1024 * 1024,
        //配置一次最多上传几个图片
        uploadImgMaxLength: 5,
        //上传图片，是否显示 base64 格式
        uploadImgShowBase64: false,
        //上传图片，server 地址（如果有值，则 base64 格式的配置则失效）
        uploadImgServer: '/upload',
        //上传图片的自定义参数
        uploadImgParams: {
            //token: 'abcdef12345'
        },
        //上传图片的自定义header
        uploadImgHeaders: {
            //'Accept': 'text/x-json'
        }
    };/*配置信息*/
    var MenuConstructors = {};//菜单的汇总
    var CreatedPanel = []; //记录已经显示的panel
    function API(editor) {
        this._currentRange = null;
        this.constructor=API;
        //获取 range 对象
        this.getRange=function getRange() {
            return this._currentRange;
        };
        //保存选区
        this.saveRange=function(_range) {
            if (_range) {
                //保存已有选区
                this._currentRange = _range;
                return;
            }
            //获取当前的选区
            var selection = window.getSelection();
            if (selection.rangeCount === 0) {
                return;
            }
            var range = selection.getRangeAt(0);
            //判断选区内容是否在编辑内容之内
            var $containerElem = this.getSelectionContainerElem(range);
            if (!$containerElem) {
                return;
            }
            var $textElem = editor.$textElem;
            if ($textElem.isContain($containerElem)) {
                //是编辑内容之内的
                this._currentRange = range;
            }
        };
        //折叠选区
        this.collapseRange=function(toStart) {
            if (toStart == null) {
                toStart = false;
            }
            var range = this._currentRange;
            if (range) {
                range.collapse(toStart);
            }
        };
        //选中区域的文字
        this.getSelectionText=function() {
            var range = this._currentRange;
            if (range) {
                return this._currentRange.toString();
            } else {
                return '';
            }
        };
        //选区的 $Elem
        this.getSelectionContainerElem=function(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.commonAncestorContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        };
        this.getSelectionStartElem=function(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.startContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        };
        this.getSelectionEndElem=function(range) {
            range = range || this._currentRange;
            var elem = void 0;
            if (range) {
                elem = range.endContainer;
                return $(elem.nodeType === 1 ? elem : elem.parentNode);
            }
        };
        //选区是否为空
        this.isSelectionEmpty=function() {
            var range = this._currentRange;
            if (range && range.startContainer) {
                if (range.startContainer === range.endContainer) {
                    if (range.startOffset === range.endOffset) {
                        return true;
                    }
                }
            }
            return false;
        };
        //恢复选区
        this.restoreSelection=function() {
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this._currentRange);
        };
        //创建一个空白（即 &#8203 字符）选区
        this.createEmptyRange=function() {
            var range = this.getRange();
            var $elem = void 0;
            if (!range) {
                //当前无 range
                return;
            }
            if (!this.isSelectionEmpty()) {
                //当前选区必须没有内容才可以
                return;
            }
            try {
                if (UA.isWebkit()) {
                    editor.cmd.do('insertHTML', '&#8203;'); //插入 &#8203
                    range.setEnd(range.endContainer, range.endOffset + 1);
                    this.saveRange(range);
                } else {
                    $elem = $('<strong>&#8203;</strong>');
                    editor.cmd.do('insertElem', $elem);
                    this.createRangeByElem($elem, true);
                }
            } catch (ex) {
            }
        };
        //根据 $Elem 设置选区
        this.createRangeByElem=function($elem, toStart, isContent) {
            //$elem - 经过封装的 elem
            //toStart - true 开始位置，false 结束位置
            //isContent - 是否选中Elem的内容
            if (!$elem.length) {
                return;
            }
            var elem = $elem[0];
            var range = document.createRange();
            if (isContent) {
                range.selectNodeContents(elem);
            } else {
                range.selectNode(elem);
            }
            if (typeof toStart === 'boolean') {
                range.collapse(toStart);
            }
            this.saveRange(range);   //存储 range
        }
    }
    function Command(editor) {
        this.constructor = Command;
        //执行命令
        this.do = function (name, value) {
            //如果无选区，忽略
            if (!editor.selection.getRange()) {
                return;
            }
            //恢复选取
            editor.selection.restoreSelection();
            //执行
            var _name = '_' + name;
            if (this[_name]) {
                //有自定义事件
                this[_name](value);
            } else {
                //默认 command
                this._execCommand(name, value);
            }
            //修改菜单状态
            editor.menus.changeActive();
            //最后，恢复选取保证光标在原来的位置闪烁
            editor.selection.saveRange();
            editor.selection.restoreSelection();
            //触发 onchange
            editor.change && editor.change();
        };
        //自定义 insertHTML 事件
        this.insertHTML = function _insertHTML(html) {
            var range = editor.selection.getRange();
            if (this.queryCommandSupported('insertHTML')) {
                //W3C
                this._execCommand('insertHTML', html);
            } else if (range.insertNode) {
                //IE
                range.deleteContents();
                range.insertNode($(html)[0]);
            } else if (range.pasteHTML) {
                //IE <= 10
                range.pasteHTML(html);
            }
        };
        //插入 elem
        this._insertElem = function ($elem) {
            var range = editor.selection.getRange();
            if (range.insertNode) {
                range.deleteContents();
                range.insertNode($elem[0]);
            }
        };
        //封装 execCommand
        this._execCommand = function (name, value) {
            document.execCommand(name, false, value);
            Array.prototype.forEach.call($("font"), function (elm) {
                var face = elm.getAttribute('face');
                var size = elm.getAttribute('size');
                if (face) {
                    elm.style.fontFamily = value;
                }
                if (size) {
                    elm.style.fontSize = value;
                }
            });
        };
        //封装 document.queryCommandValue
        this.queryCommandValue = function (name) {
            return document.queryCommandValue(name);
        };
        //封装 document.queryCommandState
        this.queryCommandState = function (name) {
            return document.queryCommandState(name);
        };
        //封装 document.queryCommandSupported
        this.queryCommandSupported = function (name) {
            return document.queryCommandSupported(name);
            ;
        }//命令，封装 document.execCommand
    }//操作命令
    function Menus(editor) {
        var _this=this;
        this.menus = {};
        this.constructor=Menus;
        this.init=function() {
            this.extend({
                //头部菜单
                Head:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-heading"></div>');
                    this.type = 'droplist'; //当前是否 active 状态
                    this._active = false;//初始化 droplist
                    this.droplist = new DropList(this, {
                        width: 100,
                        $title: $('<p>设置标题</p>'),
                        type: 'list', //droplist 以列表形式展示
                        list: [{ $elem: $('<h1>H1</h1>'), value: '<h1>' }, { $elem: $('<h2>H2</h2>'), value: '<h2>' }, { $elem: $('<h3>H3</h3>'), value: '<h3>' }, { $elem: $('<h4>H4</h4>'), value: '<h4>' }, { $elem: $('<h5>H5</h5>'), value: '<h5>' }, { $elem: $('<p>正文</p>'), value: '<p>' }],
                        onClick: function onClick(value) {
                            _this._command(value);//注意 this 是指向当前的 Head 对象
                        }
                    });
                    this._command=function(value) {
                        var $selectionElem = editor.selection.getSelectionContainerElem();
                        if (editor.$textElem.equal($selectionElem)) {//不可选择多行
                            return;
                        }
                        editor.cmd.do('formatBlock', value);
                    };//执行命令
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        var reg = /^h/i;
                        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
                        if (reg.test(cmdValue)) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive');
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive');
                        }
                    }//试图改变 active 状态
                },
                //粗体菜单
                Bold:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-bold"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        //点击菜单将触发这里
                        var isSeleEmpty = editor.selection.isSelectionEmpty();
                        if (isSeleEmpty) {
                            //选区是空的，插入并选中一个“空白”
                            editor.selection.createEmptyRange();
                        }
                        //执行 bold 命令
                        editor.cmd.do('bold');
                        if (isSeleEmpty) {
                            //需要将选取折叠起来
                            editor.selection.collapseRange();
                            editor.selection.restoreSelection();
                        }
                    };//点击事件
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor.cmd.queryCommandState('bold')) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive');
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive');
                        }
                    };
                },
                //斜体菜单
                Italic:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-italic"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        var isSeleEmpty = editor.selection.isSelectionEmpty();
                        if (isSeleEmpty) {
                            editor.selection.createEmptyRange()
                        }
                        editor.cmd.do('italic');
                        if (isSeleEmpty) {
                            editor.selection.collapseRange();
                            editor.selection.restoreSelection()
                        }
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor.cmd.queryCommandState('italic')) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //下划线菜单
                Underline:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-underline"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        var isSeleEmpty = editor.selection.isSelectionEmpty();
                        if (isSeleEmpty) {
                            editor.selection.createEmptyRange()
                        }
                        editor.cmd.do('underline');
                        if (isSeleEmpty) {
                            editor.selection.collapseRange();
                            editor.selection.restoreSelection()
                        }
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor.cmd.queryCommandState('underline')) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    }
                },
                //划线菜单
                StrikeThrough:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-strikethrough"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        var isSeleEmpty = editor.selection.isSelectionEmpty();
                        if (isSeleEmpty) {
                            editor.selection.createEmptyRange()
                        }
                        editor.cmd.do('strikeThrough');
                        if (isSeleEmpty) {
                            editor.selection.collapseRange();
                            editor.selection.restoreSelection()
                        }
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor.cmd.queryCommandState('strikeThrough')) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    }
                },
                //字体菜单
                fontFamily:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-font"></div>');
                    this.type = 'droplist';
                    var config = editor.config;
                    var family = config.fontFamily || [];
                    this._active = false;
                    this.droplist = new DropList(this, {
                        width: 120,
                        $title: $('<p>文字字体</p>'),
                        type: 'list',
                        list: family.map(function(family) {
                            return {
                                $elem: $('<p style="font-family:' + family + ';">' + family + '</p>'),
                                value: family
                            }
                        }),
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this._command=function(value) {
                        editor.cmd.do('FontName', value)
                    };
                },
                //字体大小菜单
                fontSize:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-text-height"></div>');
                    this.type = 'droplist';
                    var config = editor.config;
                    var size = config.fontSize || [];
                    this.droplist = new DropList(this, {
                        width: 120,
                        $title: $('<p>字体大小</p>'),
                        type: 'list',
                        list: size.map(function(size) {
                            return {
                                $elem: $('<p style="font-size:' + size + ';">' + size + '</p>'),
                                value: size
                            }
                        }),
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this._command=function(value) {
                        editor.cmd.do('FontSize', value)
                    };
                },
                //字体颜色菜单
                ForeColor:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-pencil"></div>');
                    this.type = 'droplist';
                    var config = editor.config;
                    var colors = config.colors || [];
                    this._active = false;
                    this.droplist = new DropList(this, {
                        width: 200,
                        $title: $('<p>文字颜色</p>'),
                        type: 'inline-block',
                        list: colors.map(function(color) {
                            return {
                                $elem: $('<div class="SlimfEditorBGC" style="background:' + color + ';"></div>'),
                                value: color
                            }
                        }),
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this._command=function(value) {
                        editor.cmd.do('foreColor', value)
                    };
                },
                //背景颜色菜单
                BackColor:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-paint-brush"></div>');
                    this.type = 'droplist';
                    var config = editor.config;
                    var colors = config.colors || [];
                    this._active = false;
                    this.droplist = new DropList(this, {
                        width: 200,
                        $title: $('<p>背景色</p>'),
                        type: 'block',
                        list: colors.map(function(color) {
                            return {
                                $elem: $('<div class="SlimfEditorBGC" style="background:' + color + ';"></div>'),
                                value: color
                            }
                        }),
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this._command=function(value) {
                        editor.cmd.do('backColor', value)
                    };
                },
                //保存菜单
                Save:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-save"></div>');
                    this.type = 'click';
                    this._active = false;
                    var config = editor.config;
                    this.onClick=function onClick() {
                        config.SaveFunc(editor.$textElem[0].innerHTML)
                    };
                },
                //下载菜单
                Download:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-download"></div>');
                    this.type = 'click';
                    this._active = false;
                    var config = editor.config;
                    this.onClick=function() {
                        config.DownLoad(editor.$textElem)
                    };
                },
                //超链接菜单
                Link:function(editor) {
                    this.editor=editor;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-link"></div>');
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function(e) {
                        var $linkelem = void 0;
                        if (this._active) {
                            $linkelem = editor.selection.getSelectionContainerElem();
                            if (!$linkelem) {
                                return
                            }
                            editor.selection.createRangeByElem($linkelem);
                            editor.selection.restoreSelection();
                            this._createPanel($linkelem.text(), $linkelem.attr('href'))
                        } else {
                            if (editor.selection.isSelectionEmpty()) {
                                this._createPanel('', '')
                            } else {
                                this._createPanel(editor.selection.getSelectionText(), '')
                            }
                        }
                    };
                    this._createPanel=function(text, link) {
                        var _this = this;
                        var inputLinkId = getRandom('input-link');
                        var inputTextId = getRandom('input-text');
                        var btnOkId = getRandom('btn-ok');
                        var btnDelId = getRandom('btn-del');
                        var delBtnDisplay = this._active ? 'inline-block' : 'none';
                        var panel = new Panel(this, {
                            width: 300,
                            tabs: [{
                                title: '链接',
                                tpl: '<div>                <input id="' + inputTextId + '" type="text" class="block" value="' + text + '" placeholder="\u94FE\u63A5\u6587\u5B57"/></td>                <input id="' + inputLinkId + '" type="text" class="block" value="' + link + '" placeholder="http://..."/></td>                <div class="SlimfEditorPanelBtnC">                    <button id="' + btnOkId + '" class="right">\u63D2\u5165</button>                    <button id="' + btnDelId + '" class="gray right" style="display:' + delBtnDisplay + '">\u5220\u9664\u94FE\u63A5</button>                </div>            </div>',
                                events: [{
                                    selector: '#' + btnOkId,
                                    type: 'click',
                                    fn: function fn() {
                                        var $link = $('#' + inputLinkId);
                                        var $text = $('#' + inputTextId);
                                        var link = $link.val();
                                        var text = $text.val();
                                        _this._insertLink(text, link);
                                        return true
                                    }
                                }, {
                                    selector: '#' + btnDelId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this._delLink();
                                        return true
                                    }
                                }]
                            }]
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._delLink=function() {
                        if (!this._active) {
                            return
                        }
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        var selectionText = editor.selection.getSelectionText();
                        editor.cmd.do('insertHTML', '<span>' + selectionText + '</span>')
                    };
                    this._insertLink=function(text, link){
                        if (!text || !link) {
                            SlimfToast('请填写完整链接信息');
                            return
                        }
                        editor.cmd.do('insertHTML', '<a href="' + link + '" target="_blank">' + text + '</a>')
                    };
                    this.tryChangeActive=function tryChangeActive(e) {
                        var $elem = this.$elem;
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        if ($selectionELem.getNodeName() === 'A') {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //列表菜单
                List:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-list-ul"></div>');
                    this.type = 'droplist';
                    this._active = false;
                    this.droplist = new DropList(this, {
                        width: 120,
                        $title: $('<p>设置列表</p>'),
                        type: 'list',
                        list: [{
                            $elem: $('<span><i class="sf-icon-list-ul"></i> 有序列表</span>'),
                            value: 'insertOrderedList'
                        }, {
                            $elem: $('<span><i class="sf-icon-list-ol"></i> 无序列表</span>'),
                            value: 'insertUnorderedList'
                        }],
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this._command=function(value) {
                        var $textElem = editor.$textElem;
                        editor.selection.restoreSelection();
                        if (editor.cmd.queryCommandState(value)) {
                            return
                        }
                        editor.cmd.do(value);
                        var $selectionElem = editor.selection.getSelectionContainerElem();
                        if ($selectionElem.getNodeName() === 'LI') {
                            $selectionElem = $selectionElem.parent()
                        }
                        if (/^ol|ul$/i.test($selectionElem.getNodeName()) === false) {
                            return
                        }
                        if ($selectionElem.equal($textElem)) {
                            return
                        }
                        var $parent = $selectionElem.parent();
                        if ($parent.equal($textElem)) {
                            return
                        }
                        $selectionElem.insertAfter($parent);
                        $parent.remove()
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor.cmd.queryCommandState('insertUnOrderedList') || editor.cmd.queryCommandState('insertOrderedList')) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //对齐菜单
                Justify:function(editor) {
                    var _this = this;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-align-justify"></div>');
                    this.type = 'droplist';
                    this._active = false;
                    this.droplist = new DropList(this, {
                        width: 100,
                        $title: $('<p>对齐方式</p>'),
                        type: 'list',
                        list: [{
                            $elem: $('<span><i class="sf-icon-align-left"></i> 靠左</span>'),
                            value: 'justifyLeft'
                        }, {
                            $elem: $('<span><i class="sf-icon-align-center"></i> 居中</span>'),
                            value: 'justifyCenter'
                        }, {
                            $elem: $('<span><i class="sf-icon-align-right"></i> 靠右</span>'),
                            value: 'justifyRight'
                        }],
                        onClick: function onClick(value) {
                            _this._command(value)
                        }
                    });
                    this. _command=function _command(value) {
                        editor.cmd.do(value)
                    };
                },
                //引用菜单
                Quote:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-quote-left"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        var $selectionElem = editor.selection.getSelectionContainerElem();
                        var nodeName = $selectionElem.getNodeName();
                        if (!UA.isIE()) {
                            if (nodeName === 'BLOCKQUOTE') {
                                editor.cmd.do('formatBlock', '<P>')
                            } else {
                                editor.cmd.do('formatBlock', '<BLOCKQUOTE>')
                            }
                            return
                        }
                        var content = void 0,
                            $targetELem = void 0;
                        if (nodeName === 'P') {
                            content = $selectionElem.text();
                            $targetELem = $('<blockquote>' + content + '</blockquote>');
                            $targetELem.insertAfter($selectionElem);
                            $selectionElem.remove();
                            return
                        }
                        if (nodeName === 'BLOCKQUOTE') {
                            content = $selectionElem.text();
                            $targetELem = $('<p>' + content + '</p>');
                            $targetELem.insertAfter($selectionElem);
                            $selectionElem.remove()
                        }
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        var reg = /^BLOCKQUOTE$/i;
                        var cmdValue = editor.cmd.queryCommandValue('formatBlock');
                        if (reg.test(cmdValue)) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    }
                },
                //表情菜单
                Emoticon:function(editor) {
                    var _this=this;
                    this.editor=editor;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-smile"></div>');
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function() {
                        this._createPanel()
                    };
                    this._createPanel=function() {
                        var config = editor.config;
                        var emotions = config.emotions || [];
                        var tabConfig = [];
                        emotions.forEach(function(emotData) {
                            var emotType = emotData.type;
                            var content = emotData.content || [];
                            var faceHtml = '';
                            if (emotType === 'emoji') {
                                content.forEach(function(item) {
                                    if (item) {
                                        faceHtml += '<span class="SlimfEditorItem">' + item + '</span>'
                                    }
                                })
                            }
                            if (emotType === 'image') {
                                content.forEach(function(item) {
                                    var src = item.src;
                                    var alt = item.alt;
                                    if (src) {
                                        faceHtml += '<span class="SlimfEditorItem"><img src="' + src + '" alt="' + alt + '" data-w-e="1"/></span>'
                                    }
                                })
                            }
                            tabConfig.push({
                                title: emotData.title,
                                tpl: '<div class="SEEmoticoncontainer">' + faceHtml + '</div>',
                                events: [{
                                    selector: 'span.SlimfEditorItem',
                                    type: 'click',
                                    fn: function fn(e) {
                                        var target = e.target;
                                        var $target = $(target);
                                        var nodeName = $target.getNodeName();
                                        var insertHtml = void 0;
                                        if (nodeName === 'IMG') {
                                            insertHtml = $target.parent().html()
                                        } else {
                                            insertHtml = '<span>' + $target.html() + '</span>'
                                        }
                                        _this._insert(insertHtml);
                                        return true
                                    }
                                }]
                            })
                        });
                        var panel = new Panel(this, {
                            width: 300,
                            height: 200,
                            tabs: tabConfig
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._insert=function(emotHtml) {
                        editor.cmd.do('insertHTML', emotHtml)
                    };
                },
                //图像菜单
                Image:function(editor) {
                    this.editor=editor;
                    var imgMenuId = getRandom('w-e-img');
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-image" id="' + imgMenuId + '"></div>');
                    editor.imgMenuId = imgMenuId;
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function () {
                        if (this._active) {
                            this._createEditPanel()
                        } else {
                            this._createInsertPanel()
                        }
                    };
                    this._createEditPanel=function() {
                        var width30 = getRandom('width-30');
                        var width50 = getRandom('width-50');
                        var width100 = getRandom('width-100');
                        var delBtn = getRandom('del-btn');
                        var tabsConfig = [{
                            title: '编辑图片',
                            tpl: '<div>        <div class="SlimfEditorPanelBtnC" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">            <span style="float:left;font-size:14px;margin:4px 5px 0 5px;color:#333;">\u6700\u5927\u5BBD\u5EA6\uFF1A</span>            <button id="' + width30 + '" class="left">30%</button>            <button id="' + width50 + '" class="left">50%</button>            <button id="' + width100 + '" class="left">100%</button>        </div>        <div class="SlimfEditorPanelBtnC">            <button id="' + delBtn + '" class="gray left">\u5220\u9664\u56FE\u7247</button>        </dv>    </div>',
                            events: [{
                                selector: '#' + width30,
                                type: 'click',
                                fn: function fn() {
                                    var $img = editor._selectedImg;
                                    if ($img) {
                                        $img.css('max-width', '30%')
                                    }
                                    return true
                                }
                            }, {
                                selector: '#' + width50,
                                type: 'click',
                                fn: function fn() {
                                    var $img = editor._selectedImg;
                                    if ($img) {
                                        $img.css('max-width', '50%')
                                    }
                                    return true
                                }
                            }, {
                                selector: '#' + width100,
                                type: 'click',
                                fn: function fn() {
                                    var $img = editor._selectedImg;
                                    if ($img) {
                                        $img.css('max-width', '100%')
                                    }
                                    return true
                                }
                            }, {
                                selector: '#' + delBtn,
                                type: 'click',
                                fn: function fn() {
                                    var $img = editor._selectedImg;
                                    if ($img) {
                                        $img.remove()
                                    }
                                    return true
                                }
                            }]
                        }];
                        var panel = new Panel(this, {
                            width: 300,
                            tabs: tabsConfig
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._createInsertPanel=function() {
                        var uploadImg = editor.uploadImg;
                        var config = editor.config;
                        var upTriggerId = getRandom('up-trigger');
                        var upFileId = getRandom('up-file');
                        var linkUrlId = getRandom('link-url');
                        var linkBtnId = getRandom('link-btn');
                        var tabsConfig = [{
                            title: '上传图片',
                            tpl: '<div><div id="' + upTriggerId + '" class="sf-icon-upload"></div> <input id="' + upFileId + '" style="display: none" type="file" multiple="multiple" accept="image/jpg,image/jpeg,image/png,image/gif,image/bmp"/> </div>',
                            events: [{
                                selector: '#' + upTriggerId,
                                type: 'click',
                                fn: function fn() {
                                    var $file = $('#' + upFileId);
                                    var fileElem = $file[0];
                                    if (fileElem) {
                                        fileElem.click()
                                    } else {
                                        return true
                                    }
                                }
                            }, {
                                selector: '#' + upFileId,
                                type: 'change',
                                fn: function fn() {
                                    var $file = $('#' + upFileId);
                                    var fileElem = $file[0];
                                    if (!fileElem) {
                                        return true
                                    }
                                    var fileList = fileElem.files;
                                    if (fileList.length) {
                                        uploadImg.uploadImg(fileList)
                                    }
                                    return true
                                }
                            }]
                        }, {
                            title: '网络图片',
                            tpl: '<div>        <input id="' + linkUrlId + '" type="text" class="block" placeholder="\u56FE\u7247\u94FE\u63A5"/></td>        <div class="SlimfEditorPanelBtnC">            <button id="' + linkBtnId + '" class="right">\u63D2\u5165</button>        </div>    </div>',
                            events: [{
                                selector: '#' + linkBtnId,
                                type: 'click',
                                fn: function fn() {
                                    var $linkUrl = $('#' + linkUrlId);
                                    var url = $linkUrl.val().trim();
                                    if (url) {
                                        uploadImg.insertLinkImg(url)
                                    }
                                    return true
                                }
                            }]
                        }];
                        var tabsConfigResult = [];
                        if ((config.uploadImgShowBase64 || config.uploadImgServer) && window.FileReader) {
                            tabsConfigResult.push(tabsConfig[0])
                        }
                        tabsConfigResult.push(tabsConfig[1]);
                        var panel = new Panel(this, {
                            width: 300,
                            tabs: tabsConfigResult
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        if (editor._selectedImg) {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //表格菜单
                Table:function(editor) {
                    this.editor=editor;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-table"></div>');
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function() {
                        if (this._active) {
                            this._createEditPanel()
                        } else {
                            this._createInsertPanel()
                        }
                    };
                    this._createInsertPanel=function() {
                        var _this = this;
                        var btnInsertId = getRandom('btn');
                        var textRowNum = getRandom('row');
                        var textColNum = getRandom('col');
                        var panel = new Panel(this, {
                            width: 250,
                            tabs: [{
                                title: '插入表格',
                                tpl: '<div>            <p style="text-align:left; padding:5px 0;">                \u521B\u5EFA                <input id="' + textRowNum + '" type="text" value="5" style="width:40px;text-align:center;"/>                \u884C                <input id="' + textColNum + '" type="text" value="5" style="width:40px;text-align:center;"/>                \u5217\u7684\u8868\u683C            </p>            <div class="SlimfEditorPanelBtnC">                <button id="' + btnInsertId + '" class="right">\u63D2\u5165</button>            </div>        </div>',
                                events: [{
                                    selector: '#' + btnInsertId,
                                    type: 'click',
                                    fn: function fn() {
                                        var rowNum = parseInt($('#' + textRowNum).val());
                                        var colNum = parseInt($('#' + textColNum).val());
                                        if (rowNum && colNum && rowNum > 0 && colNum > 0) {
                                            _this._insert(rowNum, colNum)
                                        }
                                        return true
                                    }
                                }]
                            }]
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._insert=function(rowNum, colNum) {
                        var r = void 0,
                            c = void 0;
                        var html = '<table border="0" width="100%" cellpadding="0" cellspacing="0">';
                        for (r = 0; r < rowNum; r++) {
                            html += '<tr>';
                            if (r === 0) {
                                for (c = 0; c < colNum; c++) {
                                    html += '<th>&nbsp;</th>'
                                }
                            } else {
                                for (c = 0; c < colNum; c++) {
                                    html += '<td>&nbsp;</td>'
                                }
                            }
                            html += '</tr>'
                        }
                        html += '</table><p><br></p>';
                        editor.cmd.do('insertHTML', html);
                        editor.cmd.do('enableObjectResizing', false);
                        editor.cmd.do('enableInlineTableEditing', false)
                    };
                    this._createEditPanel=function() {
                        var _this2 = this;
                        var addRowBtnId = getRandom('add-row');
                        var addColBtnId = getRandom('add-col');
                        var delRowBtnId = getRandom('del-row');
                        var delColBtnId = getRandom('del-col');
                        var delTableBtnId = getRandom('del-table');
                        var panel = new Panel(this, {
                            width: 320,
                            tabs: [{
                                title: '编辑表格',
                                tpl: '<div>            <div class="SlimfEditorPanelBtnC" style="border-bottom:1px solid #f1f1f1;padding-bottom:5px;margin-bottom:5px;">                <button id="' + addRowBtnId + '" class="left">\u589E\u52A0\u884C</button>                <button id="' + delRowBtnId + '" class="red left">\u5220\u9664\u884C</button>                <button id="' + addColBtnId + '" class="left">\u589E\u52A0\u5217</button>                <button id="' + delColBtnId + '" class="red left">\u5220\u9664\u5217</button>            </div>            <div class="SlimfEditorPanelBtnC">                <button id="' + delTableBtnId + '" class="gray left">\u5220\u9664\u8868\u683C</button>            </dv>        </div>',
                                events: [{
                                    selector: '#' + addRowBtnId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this2._addRow();
                                        return true
                                    }
                                }, {
                                    selector: '#' + addColBtnId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this2._addCol();
                                        return true
                                    }
                                }, {
                                    selector: '#' + delRowBtnId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this2._delRow();
                                        return true
                                    }
                                }, {
                                    selector: '#' + delColBtnId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this2._delCol();
                                        return true
                                    }
                                }, {
                                    selector: '#' + delTableBtnId,
                                    type: 'click',
                                    fn: function fn() {
                                        _this2._delTable();
                                        return true
                                    }
                                }]
                            }]
                        });
                        panel.show()
                    };
                    this._getLocationData=function() {
                        var result = {};
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        var nodeName = $selectionELem.getNodeName();
                        if (nodeName !== 'TD' && nodeName !== 'TH') {
                            return
                        }
                        var $tr = $selectionELem.parent();
                        var $tds = $tr.children();
                        var tdLength = $tds.length;
                        $tds.forEach(function(td, index) {
                            if (td === $selectionELem[0]) {
                                result.td = {
                                    index: index,
                                    elem: td,
                                    length: tdLength
                                };
                                return false
                            }
                        });
                        var $tbody = $tr.parent();
                        var $trs = $tbody.children();
                        var trLength = $trs.length;
                        $trs.forEach(function(tr, index) {
                            if (tr === $tr[0]) {
                                result.tr = {
                                    index: index,
                                    elem: tr,
                                    length: trLength
                                };
                                return false
                            }
                        });
                        return result
                    };
                    this._addRow=function() {
                        var locationData = this._getLocationData();
                        if (!locationData) {
                            return
                        }
                        var trData = locationData.tr;
                        var $currentTr = $(trData.elem);
                        var tdData = locationData.td;
                        var tdLength = tdData.length;
                        var newTr = document.createElement('tr');
                        var tpl = '',
                            i = void 0;
                        for (i = 0; i < tdLength; i++) {
                            tpl += '<td>&nbsp;</td>'
                        }
                        newTr.innerHTML = tpl;
                        $(newTr).insertAfter($currentTr)
                    };
                    this._addCol=function() {
                        var locationData = this._getLocationData();
                        if (!locationData) {
                            return
                        }
                        var trData = locationData.tr;
                        var tdData = locationData.td;
                        var tdIndex = tdData.index;
                        var $currentTr = $(trData.elem);
                        var $trParent = $currentTr.parent();
                        var $trs = $trParent.children();
                        $trs.forEach(function(tr) {
                            var $tr = $(tr);
                            var $tds = $tr.children();
                            var $currentTd = $tds.get(tdIndex);
                            var name = $currentTd.getNodeName().toLowerCase();
                            var newTd = document.createElement(name);
                            $(newTd).insertAfter($currentTd)
                        })
                    };
                    this._delRow=function() {
                        var locationData = this._getLocationData();
                        if (!locationData) {
                            return
                        }
                        var trData = locationData.tr;
                        var $currentTr = $(trData.elem);
                        $currentTr.remove()
                    };
                    this._delCol=function() {
                        var locationData = this._getLocationData();
                        if (!locationData) {
                            return
                        }
                        var trData = locationData.tr;
                        var tdData = locationData.td;
                        var tdIndex = tdData.index;
                        var $currentTr = $(trData.elem);
                        var $trParent = $currentTr.parent();
                        var $trs = $trParent.children();
                        $trs.forEach(function(tr) {
                            var $tr = $(tr);
                            var $tds = $tr.children();
                            var $currentTd = $tds.get(tdIndex);
                            $currentTd.remove()
                        })
                    };
                    this._delTable=function() {
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        var $table = $selectionELem.parentUntil('table');
                        if (!$table) {
                            return
                        }
                        $table.remove()
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        var nodeName = $selectionELem.getNodeName();
                        if (nodeName === 'TD' || nodeName === 'TH') {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //视频菜单
                Video:function(editor) {
                    this.editor=editor;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-video"></div>');
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function() {
                        this._createPanel()
                    };
                    this._createPanel=function() {
                        var _this = this;
                        var textValId = getRandom('text-val');
                        var btnId = getRandom('btn');
                        var panel = new Panel(this, {
                            width: 350,
                            tabs: [{
                                title: '插入视频',
                                tpl: '<div><input id="' + textValId + '" type="text" class="block" placeholder="\u683C\u5F0F\u5982\uFF1A<iframe src=... ></iframe>"/>            <div class="SlimfEditorPanelBtnC">                <button id="' + btnId + '" class="right">\u63D2\u5165</button>            </div>        </div>',
                                events: [{
                                    selector: '#' + btnId,
                                    type: 'click',
                                    fn: function fn() {
                                        var $text = $('#' + textValId);
                                        var val = $text.val().trim();
                                        if (val) {
                                            _this._insert(val)
                                        }
                                        return true
                                    }
                                }]
                            }]
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._insert=function(val) {
                        editor.cmd.do('insertHTML', val + '<p><br></p>')
                    }
                },
                //代码菜单
                Code:function(editor) {
                    this.editor=editor;
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-terminal"></div>');
                    this.type = 'panel';
                    this._active = false;
                    this.onClick=function(e) {
                        var $startElem = editor.selection.getSelectionStartElem();
                        var $endElem = editor.selection.getSelectionEndElem();
                        var isSeleEmpty = editor.selection.isSelectionEmpty();
                        var selectionText = editor.selection.getSelectionText();
                        var $code = void 0;
                        if (!$startElem.equal($endElem)) {
                            editor.selection.restoreSelection();
                            return
                        }
                        if (!isSeleEmpty) {
                            $code = $('<code>' + selectionText + '</code>');
                            editor.cmd.do('insertElem', $code);
                            editor.selection.createRangeByElem($code, false);
                            editor.selection.restoreSelection();
                            return
                        }
                        if (this._active) {
                            this._createPanel($startElem.html())
                        } else {
                            this._createPanel()
                        }
                    };
                    this._createPanel=function(value) {
                        var _this = this;
                        value = value || '';
                        var type = !value ? 'new' : 'edit';
                        var textId = getRandom('texxt');
                        var btnId = getRandom('btn');
                        var panel = new Panel(this, {
                            width: 500,
                            tabs: [{
                                title: '插入代码',
                                tpl: '<div>            <textarea id="' + textId + '" style="height:145px;;">' + value + '</textarea>            <div class="SlimfEditorPanelBtnC">                <button id="' + btnId + '" class="right">\u63D2\u5165</button>            </div>        <div>',
                                events: [{
                                    selector: '#' + btnId,
                                    type: 'click',
                                    fn: function fn() {
                                        var $text = $('#' + textId);
                                        var text = $text.val() || $text.html();
                                        text = replaceHtmlSymbol(text);
                                        if (type === 'new') {
                                            _this._insertCode(text)
                                        } else {
                                            _this._updateCode(text)
                                        }
                                        return true
                                    }
                                }]
                            }]
                        });
                        panel.show();
                        this.panel = panel
                    };
                    this._insertCode=function(value) {
                        editor.cmd.do('insertHTML', '<pre><code>' + value + '</code></pre><p><br></p>')
                    };
                    this._updateCode=function(value) {
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        $selectionELem.html(value);
                        editor.selection.restoreSelection()
                    };
                    this.tryChangeActive=function(e) {
                        var $elem = this.$elem;
                        var $selectionELem = editor.selection.getSelectionContainerElem();
                        if (!$selectionELem) {
                            return
                        }
                        var $parentElem = $selectionELem.parent();
                        if ($selectionELem.getNodeName() === 'CODE' && $parentElem.getNodeName() === 'PRE') {
                            this._active = true;
                            $elem.addClass('SlimfEditorMenuActive')
                        } else {
                            this._active = false;
                            $elem.removeClass('SlimfEditorMenuActive')
                        }
                    };
                },
                //撤销菜单
                Redo:function(editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-redo"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e) {
                        editor.cmd.do('redo')
                    };
                },
                //撤回菜单
                Undo:function (editor) {
                    this.$elem = $('<div class="SlimfEditorMenu sf-icon-undo"></div>');
                    this.type = 'click';
                    this._active = false;
                    this.onClick=function(e){
                        editor.cmd.do('undo')
                    };
                }
            });
            var config = editor.config || {};
            var configMenus = config.menus || []; //获取配置中的菜单
            //根据配置信息，创建菜单
            configMenus.forEach(function (menuKey) {
                var MenuConstructor = MenuConstructors[menuKey];
                if (MenuConstructor && typeof MenuConstructor === 'function') {
                    //创建单个菜单
                    _this.menus[menuKey] = new MenuConstructor(editor);
                }
            });
            //添加到菜单栏
            this._addToToolbar();
            //绑定事件
            this._bindEvent();
        };
        //添加到菜单栏
        this._addToToolbar=function() {
            var $toolbarElem = editor.$toolbarElem;
            var menus = this.menus;
            var config = editor.config;
            var zIndex = config.zIndex + 1;
            objForEach(menus, function (key, menu) {
                var $elem = menu.$elem;
                if ($elem) {
                    //设置 z-index
                    $elem.css('z-index', zIndex);
                    $toolbarElem.append($elem);
                }
            });
        };
        //绑定菜单 click mouseenter 事件
        this._bindEvent=function() {
            var menus = this.menus;
            objForEach(menus, function (key, menu) {
                var type = menu.type;
                if (!type) {
                    return;
                }
                var $elem = menu.$elem;
                var droplist = menu.droplist;
                var panel = menu.panel;
                //点击类型，例如 bold
                if (type === 'click' && menu.onClick) {
                    $elem.on('click', function (e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        menu.onClick(e);
                    });
                }
                //下拉框，例如 head
                if (type === 'droplist' && droplist) {
                    $elem.on('mouseenter', function (e) {
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        //显示
                        droplist.showTimeoutId = setTimeout(function () {
                            droplist.show();
                        }, 200);
                    }).on('mouseleave', function (e) {
                        //隐藏
                        droplist.hideTimeoutId = setTimeout(function () {
                            droplist.hide();
                        }, 0);
                    });
                }
                //弹框类型，例如 link
                if (type === 'panel' && menu.onClick) {
                    $elem.on('click', function (e) {
                        e.stopPropagation();
                        if (editor.selection.getRange() == null) {
                            return;
                        }
                        //在自定义事件中显示 panel
                        menu.onClick(e);
                    });
                }
            });
        };
        //尝试修改菜单状态
        this.changeActive=function() {
            var menus = this.menus;
            objForEach(menus, function (key, menu) {
                if (menu.tryChangeActive) {
                    setTimeout(function () {
                        menu.tryChangeActive();
                    }, 100);
                }
            });
        };
        this.extend=function (options) {
            for(name in options) {
                MenuConstructors[name]= options[name];
            }
        }
    }//菜单
    function Text(editor) {
        this.constructor=Text;
        this.init=function() {
            this._bindEvent();
        };
        //清空内容
        this.clear=function() {
            this.html('<p><br></p>');
        };
        //获取 设置 html
        this.html=function(val) {
            var $textElem = editor.$textElem;
            if (val == null) {
                return $textElem.html();
            } else {
                $textElem.html(val);
                //初始化选取，将光标定位到内容尾部
                editor.initSelection();
            }
        };
        //获取 JSON
        this.getJSON=function() {
            var $textElem = editor.$textElem;
            return getChildrenJSON($textElem);
        };
        //获取 设置 text
        this.text=function(val) {
            var $textElem = editor.$textElem;
            if (val == null) {
                return $textElem.text();
            } else {
                $textElem.text('<p>' + val + '</p>');
                //初始化选取，将光标定位到内容尾部
                editor.initSelection();
            }
        };
        //追加内容
        this.append=function(html) {
            var $textElem = editor.$textElem;
            $textElem.append($(html));
            //初始化选取，将光标定位到内容尾部
            editor.initSelection();
        };
        //绑定事件
        this._bindEvent=function() {
            //实时保存选取
            this._saveRangeRealTime();
            //按回车建时的特殊处理
            this._enterKeyHandle();
            //清空时保留 <p><br></p>
            this._clearHandle();
            //粘贴事件（粘贴文字，粘贴图片）
            this._pasteHandle();
            //tab 特殊处理
            this._tabHandle();
            //img 点击
            this._imgHandle();
            //拖拽事件
            this._dragHandle();
        };
        //实时保存选取
        this._saveRangeRealTime=function() {
            var $textElem = editor.$textElem;
            //保存当前的选区
            function saveRange(e) {
                //随时保存选区
                editor.selection.saveRange();
                //更新按钮 ative 状态
                editor.menus.changeActive();
            }
            //按键后保存
            $textElem.on('keyup', saveRange);
            $textElem.on('mousedown', function (e) {
                //mousedown 状态下，鼠标滑动到编辑区域外面，也需要保存选区
                $textElem.on('mouseleave', saveRange);
            });
            $textElem.on('mouseup', function (e) {
                saveRange();
                //在编辑器区域之内完成点击，取消鼠标滑动到编辑区外面的事件
                $textElem.off('mouseleave', saveRange);
            });
        };
        //按回车键时的特殊处理
        this._enterKeyHandle=function() {
            var $textElem = editor.$textElem;
            function insertEmptyP($selectionElem) {
                var $p = $('<p><br></p>');
                $p.insertBefore($selectionElem);
                editor.selection.createRangeByElem($p, true);
                editor.selection.restoreSelection();
                $selectionElem.remove();
            }
            //将回车之后生成的非 <p> 的顶级标签，改为 <p>
            function pHandle(e) {
                var $selectionElem = editor.selection.getSelectionContainerElem();
                var $parentElem = $selectionElem.parent();

                if ($parentElem.html() === '<code><br></code>') {
                    //回车之前光标所在一个 <p><code>.....</code></p> ，忽然回车生成一个空的 <p><code><br></code></p>
                    //而且继续回车跳不出去，因此只能特殊处理
                    insertEmptyP($selectionElem);
                    return;
                }

                if (!$parentElem.equal($textElem)) {
                    //不是顶级标签
                    return;
                }

                var nodeName = $selectionElem.getNodeName();
                if (nodeName === 'P') {
                    //当前的标签是 P ，不用做处理
                    return;
                }

                if ($selectionElem.text()) {
                    //有内容，不做处理
                    return;
                }

                //插入 <p> ，并将选取定位到 <p>，删除当前标签
                insertEmptyP($selectionElem);
            }
            $textElem.on('keyup', function (e) {
                if (e.keyCode !== 13) {
                    //不是回车键
                    return;
                }
                //将回车之后生成的非 <p> 的顶级标签，改为 <p>
                pHandle(e);
            });
            //<pre><code></code></pre> 回车时 特殊处理
            function codeHandle(e) {
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var $parentElem = $selectionElem.parent();
                var selectionNodeName = $selectionElem.getNodeName();
                var parentNodeName = $parentElem.getNodeName();

                if (selectionNodeName !== 'CODE' || parentNodeName !== 'PRE') {
                    //不符合要求 忽略
                    return;
                }

                if (!editor.cmd.queryCommandSupported('insertHTML')) {
                    //必须原生支持 insertHTML 命令
                    return;
                }

                //处理：光标定位到代码末尾，联系点击两次回车，即跳出代码块
                if (editor._willBreakCode === true) {
                    //此时可以跳出代码块
                    //插入 <p> ，并将选取定位到 <p>
                    var $p = $('<p><br></p>');
                    $p.insertAfter($parentElem);
                    editor.selection.createRangeByElem($p, true);
                    editor.selection.restoreSelection();

                    //修改状态
                    editor._willBreakCode = false;

                    e.preventDefault();
                    return;
                }

                var _startOffset = editor.selection.getRange().startOffset;

                //处理：回车时，不能插入 <br> 而是插入 \n ，因为是在 pre 标签里面
                editor.cmd.do('insertHTML', '\n');
                editor.selection.saveRange();
                if (editor.selection.getRange().startOffset === _startOffset) {
                    //没起作用，再来一遍
                    editor.cmd.do('insertHTML', '\n');
                }

                var codeLength = $selectionElem.html().length;
                if (editor.selection.getRange().startOffset + 1 === codeLength) {
                    //说明光标在代码最后的位置，执行了回车操作
                    //记录下来，以便下次回车时候跳出 code
                    editor._willBreakCode = true;
                }

                //阻止默认行为
                e.preventDefault();
            }
            $textElem.on('keydown', function (e) {
                if (e.keyCode !== 13) {
                    //不是回车键
                    //取消即将跳转代码块的记录
                    editor._willBreakCode = false;
                    return;
                }
                //<pre><code></code></pre> 回车时 特殊处理
                codeHandle(e);
            });
        };
        //清空时保留 <p><br></p>
        this._clearHandle=function() {
            var $textElem = editor.$textElem;
            $textElem.on('keydown', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var txtHtml = $textElem.html().toLowerCase().trim();
                if (txtHtml === '<p><br></p>') {
                    //最后剩下一个空行，就不再删除了
                    e.preventDefault();
                    return;
                }
            });
            $textElem.on('keyup', function (e) {
                if (e.keyCode !== 8) {
                    return;
                }
                var $p = void 0;
                var txtHtml = $textElem.html().toLowerCase().trim();
                //firefox 时用 txtHtml === '<br>' 判断，其他用 !txtHtml 判断
                if (!txtHtml || txtHtml === '<br>') {
                    //内容空了
                    $p = $('<p><br/></p>');
                    $textElem.html(''); //一定要先清空，否则在 firefox 下有问题
                    $textElem.append($p);
                    editor.selection.createRangeByElem($p, false, true);
                    editor.selection.restoreSelection();
                }
            });
        };
        //粘贴事件（粘贴文字 粘贴图片）
        this._pasteHandle=function() {
            var config = editor.config;
            var pasteFilterStyle = config.pasteFilterStyle;
            var pasteTextHandle = config.pasteTextHandle;
            var $textElem = editor.$textElem;
            //粘贴图片、文本的事件，每次只能执行一个
            //判断该次粘贴事件是否可以执行
            var pasteTime = 0;
            function canDo() {
                var now = Date.now();
                var flag = false;
                if (now - pasteTime >= 500) {
                    //间隔大于 500 ms ，可以执行
                    flag = true;
                }
                pasteTime = now;
                return flag;
            }
            //粘贴文字
            $textElem.on('paste', function (e) {
                if (UA.isIE()) {
                    return;
                } else {
                    //阻止默认行为，使用 execCommand 的粘贴命令
                    e.preventDefault();
                }
                //粘贴图片和文本，只能同时使用一个
                if (!canDo()) {
                    return;
                }
                //获取粘贴的文字
                var pasteHtml = getPasteHtml(e, pasteFilterStyle);
                var pasteText = getPasteText(e);
                pasteText = pasteText.replace(/\n/gm, '<br>');
                //自定义处理粘贴的内容
                if (pasteTextHandle && typeof pasteTextHandle === 'function') {
                    pasteHtml = '' + (pasteTextHandle(pasteHtml) || '');
                    pasteText = '' + (pasteTextHandle(pasteText) || '');
                }
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var nodeName = $selectionElem.getNodeName();
                //code 中只能粘贴纯文本
                if (nodeName === 'CODE' || nodeName === 'PRE') {
                    editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                    return;
                }
                //先放开注释，有问题再追查 ————
                ////表格中忽略，可能会出现异常问题
                //if (nodeName === 'TD' || nodeName === 'TH') {
                //    return
                //}
                if (!pasteHtml) {
                    return;
                }
                try {
                    //firefox 中，获取的 pasteHtml 可能是没有 <ul> 包裹的 <li>
                    //因此执行 insertHTML 会报错
                    editor.cmd.do('insertHTML', pasteHtml);
                } catch (ex) {
                    //此时使用 pasteText 来兼容一下
                    editor.cmd.do('insertHTML', '<p>' + pasteText + '</p>');
                }
            });
            //粘贴图片
            $textElem.on('paste', function (e) {
                if (UA.isIE()) {
                    return;
                } else {
                    e.preventDefault();
                }
                //粘贴图片和文本，只能同时使用一个
                if (!canDo()) {
                    return;
                }
                //获取粘贴的图片
                var pasteFiles = getPasteImgs(e);
                if (!pasteFiles || !pasteFiles.length) {
                    return;
                }
                //获取当前的元素
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var nodeName = $selectionElem.getNodeName();
                //code 中粘贴忽略
                if (nodeName === 'CODE' || nodeName === 'PRE') {
                    return;
                }
                //上传图片
                var uploadImg = editor.uploadImg;
                uploadImg.uploadImg(pasteFiles);
            });
        };
        //tab 特殊处理
        this._tabHandle=function() {
            var $textElem = editor.$textElem;
            $textElem.on('keydown', function (e) {
                if (e.keyCode !== 9) {
                    return;
                }
                if (!editor.cmd.queryCommandSupported('insertHTML')) {
                    //必须原生支持 insertHTML 命令
                    return;
                }
                var $selectionElem = editor.selection.getSelectionContainerElem();
                if (!$selectionElem) {
                    return;
                }
                var $parentElem = $selectionElem.parent();
                var selectionNodeName = $selectionElem.getNodeName();
                var parentNodeName = $parentElem.getNodeName();
                if (selectionNodeName === 'CODE' && parentNodeName === 'PRE') {
                    //<pre><code> 里面
                    editor.cmd.do('insertHTML', '    ');
                } else {
                    //普通文字
                    editor.cmd.do('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
                }
                e.preventDefault();
            });
        };
        //img 点击
        this._imgHandle=function() {
            var $textElem = editor.$textElem;
            //为图片增加 selected 样式
            $textElem.on('click', 'img', function (e) {
                var img = this;
                var $img = $(img);
                if ($img.attr('data-w-e') === '1') {
                    //是表情图片，忽略
                    return;
                }
                //记录当前点击过的图片
                editor._selectedImg = $img;
                //修改选区并 restore ，防止用户此时点击退格键，会删除其他内容
                editor.selection.createRangeByElem($img);
                editor.selection.restoreSelection();
            });
            //去掉图片的 selected 样式
            $textElem.on('click  keyup', function (e) {
                if (e.target.matches('img')) {
                    //点击的是图片，忽略
                    return;
                }
                //删除记录
                editor._selectedImg = null;
            });
        };
        //拖拽事件
        this._dragHandle=function() {
            //禁用 document 拖拽事件
            var $document = $(document);
            $document.on('dragleave drop dragenter dragover', function (e) {
                e.preventDefault();
            });
            //添加编辑区域拖拽事件
            var $textElem = editor.$textElem;
            $textElem.on('drop', function (e) {
                e.preventDefault();
                var files = e.dataTransfer && e.dataTransfer.files;
                if (!files || !files.length) {
                    return;
                }
                //上传图片
                var uploadImg = editor.uploadImg;
                uploadImg.uploadImg(files);
            });
        };
    }//文本
    function DropList(menu, opt) {
        var _this = this;
        this.menu = menu;
        this.opt = opt;
        var $container = $('<div class="SlimfEditorDropList"></div>');
        var $title = opt.$title;
        var titleHtml = void 0;
        if ($title) {
            titleHtml = $title.html();
            $title.html(titleHtml);
            $title.addClass('SlimfEditorDropTitle');
            $container.append($title);
        }
        var list = opt.list || [];
        var type = opt.type || 'list'; //'list' 列表形式（如“标题”菜单） / 'inline-block' 块状形式（如“颜色”菜单）
        var onClick = opt.onClick || emptyFn;
        var $list = $('<ul class="' + (type === 'list' ? 'SlimfEditorDropListul' : 'SlimfEditorBlockUl') + '"></ul>');
        $container.append($list);
        list.forEach(function (item) {
            var $elem = item.$elem;
            var elemHtml = $elem.html();
            $elem.html(elemHtml);
            var value = item.value;
            var $li = $('<li class="SlimfEditorItem"></li>');
            if ($elem) {
                $li.append($elem);
                $list.append($li);
                $elem.on('click', function (e) {
                    onClick(value);
                    //隐藏
                    _this.hideTimeoutId = setTimeout(function () {
                        _this.hide();
                    }, 0);
                });
            }
        });
        $container.on('mouseleave', function (e) {
            _this.hideTimeoutId = setTimeout(function () {
                _this.hide();
            }, 0);
        });
        this.$container = $container;
        this._rendered = false;
        this._show = false;
        this.constructor=DropList;
        this.show=function() {
            if (this.hideTimeoutId) {
                clearTimeout(this.hideTimeoutId);
            }
            var $menuELem = menu.$elem;
            var $container = this.$container;
            if (this._show) {
                return;
            }
            if (this._rendered) {
                $container.show();
            } else {
                var menuHeight = $menuELem.getSizeData().height || 0;
                var width = this.opt.width || 100; //默认为 100
                $container.css('margin-top', menuHeight + 'px').css('width', width + 'px');
                $menuELem.append($container);
                this._rendered = true;
            }
            this._show = true;//修改属性
        };
        this.hide=function() {
            if (this.showTimeoutId) {
                clearTimeout(this.showTimeoutId);
            }
            var $container = this.$container;
            if (!this._show) {
                return;
            }
            $container.hide();
            this._show = false;
        };
    }//下拉菜单
    function Panel(menu, opt) {
        this.menu = menu;
        this.opt = opt;
        this.constructor=Panel;
        this.show=function() {
            var _this = this;
            if (CreatedPanel.indexOf(menu) >= 0) {
                //该菜单已经创建了 panel 不能再创建
                return;
            }
            var editor = menu.editor;
            var $body = $('body');
            var $textContainerElem = editor.$textContainerElem;
            var opt = this.opt;
            var $container = $('<div class="SlimfEditorPanel"></div>');//panel 的容器
            var width = opt.width || 300; //默认 300px
            $container.css('width', width + 'px').css('margin-left', (0 - width) / 2 + 'px');
            var $closeBtn = $('<i class="sf-icon-times SlimfEditorPanelClose"></i>');//添加关闭按钮
            $container.append($closeBtn);
            $closeBtn.on('click', function () {
                _this.hide();
            });
            var $tabTitleContainer = $('<ul class="SlimfEditorPanelTitle"></ul>'); //准备 tabs 容器
            var $tabContentContainer = $('<div class="SlimfEditorPanelContent"></div>');
            $container.append($tabTitleContainer).append($tabContentContainer);
            var height = opt.height;//设置高度
            if (height) {
                $tabContentContainer.css('height', height + 'px').css('overflow-y', 'auto');
            }
            var tabs = opt.tabs || [];
            var tabTitleArr = [];
            var tabContentArr = [];
            tabs.forEach(function (tab, tabIndex) {
                if (!tab) {
                    return;
                }
                var title = tab.title || '';
                var tpl = tab.tpl || '';
                var $title = $('<li class="SlimfEditorItem">' + title + '</li>');
                $tabTitleContainer.append($title);
                var $content = $(tpl);
                $tabContentContainer.append($content);
                //记录到内存
                $title._index = tabIndex;
                tabTitleArr.push($title);
                tabContentArr.push($content);
                //设置 active 项
                if (tabIndex === 0) {
                    $title._active = true;
                    $title.addClass('SlimfEditorMenuActive');
                } else {
                    $content.hide();
                }
                //绑定 tab 的事件
                $title.on('click', function (e) {
                    if ($title._active) {
                        return;
                    }
                    //隐藏所有的 tab
                    tabTitleArr.forEach(function ($title) {
                        $title._active = false;
                        $title.removeClass('SlimfEditorMenuActive');
                    });
                    tabContentArr.forEach(function ($content) {
                        $content.hide();
                    });

                    //显示当前的 tab
                    $title._active = true;
                    $title.addClass('SlimfEditorMenuActive');
                    $content.show();
                });
            });
            $container.on('click', function (e) {
                e.stopPropagation();
            });//绑定关闭事件
            $body.on('click', function (e) {
                _this.hide();
            });
            $textContainerElem.append($container);//添加到 DOM
            tabs.forEach(function (tab, index) {
                if (!tab) {
                    return;
                }
                var events = tab.events || [];
                events.forEach(function (event) {
                    var selector = event.selector;
                    var type = event.type;
                    var fn = event.fn || emptyFn;
                    var $content = tabContentArr[index];
                    $content.find(selector).on(type, function (e) {
                        e.stopPropagation();
                        var needToHide = fn(e);
                        //执行完事件之后，是否要关闭 panel
                        if (needToHide) {
                            _this.hide();
                        }
                    });
                });
            }); //绑定 opt 的事件，只有添加到 DOM 之后才能绑定成功
            var $inputs = $container.find('input[type=text],textarea');
            if ($inputs.length) {
                $inputs.get(0).focus();
            }
            this.$container = $container; //添加到属性
            this._hideOtherPanels();//隐藏其他 panel
            CreatedPanel.push(menu);//记录该 menu 已经创建了 panel
        };
        this.hide=function(){
            var $container = this.$container;
            if ($container) {
                $container.remove();
            }
            //将该 menu 记录中移除
            CreatedPanel = CreatedPanel.filter(function (item) {
                if (item === menu) {
                    return false;
                } else {
                    return true;
                }
            });
        };
        this._hideOtherPanels=function(){
            if (!CreatedPanel.length) {
                return;
            }
            CreatedPanel.forEach(function (menu) {
                var panel = menu.panel || {};
                if (panel.hide) {
                    panel.hide();
                }
            });
        }//一个 panel 展示时，隐藏其他 panel
    }//操作窗口
    function Progress(editor) {
        this._time = 0;
        this._isShow = false;
        this._isRender = false;
        this._timeoutId = 0;
        this.$textContainer = editor.$textContainerElem;
        this.$bar = $('<div class="SlimfEditorProgress"></div>');
        this.constructor=Progress;
        this.show=function(progress) {
            var _this = this;
            if (this._isShow) {
                return;
            }
            this._isShow = true;
            var $bar = this.$bar;
            if (!this._isRender) {
                var $textContainer = this.$textContainer;
                $textContainer.append($bar);
            } else {
                this._isRender = true;
            }
            if (Date.now() - this._time > 100) {
                if (progress <= 1) {
                    $bar.css('width', progress * 100 + '%');
                    this._time = Date.now();
                }
            }
            //隐藏
            var timeoutId = this._timeoutId;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(function () {
                _this._hide();
            }, 500);
        };
        this._hide=function() {
            var $bar = this.$bar;
            $bar.remove();
            this._time = 0;
            this._isShow = false;
            this._isRender = false;
        }
    } //上传进度条
    function UploadImg(editor) {
        this.constructor=UploadImg;
        //根据链接插入图片
        this.insertLinkImg=function(link) {
            if (!link) {
                return;
            }
            var config = editor.config;
            editor.cmd.do('insertHTML', '<img src="' + link + '" style="max-width:100%;"/>');
            //验证图片 url 是否有效，无效的话给出提示
            var img = document.createElement('img');
            img.onload = function () {
                var callback = config.linkImgCallback;
                if (callback && typeof callback === 'function') {
                    callback(link);
                }
                img = null;
            };
            img.onerror = function () {
                img = null;
                SlimfToast('插入图片错误'+link+'不可用');
                return;
            };
            img.onabort = function () {
                img = null;
            };
            img.src = link;
        };
        //上传图片
        this.uploadImg=function(files) {
            var _this3 = this;
            if (!files || !files.length) {
                return;
            }
            //------------------------------ 获取配置信息 ------------------------------
            var config = editor.config;
            var uploadImgServer = config.uploadImgServer;
            var uploadImgShowBase64 = config.uploadImgShowBase64;
            var maxSize = config.uploadImgMaxSize;
            var maxSizeM = maxSize / 1000 / 1000;
            var maxLength = config.uploadImgMaxLength || 10000;
            var uploadImgParams = config.uploadImgParams || null;
            var uploadImgHeaders = config.uploadImgHeaders || null;
            //------------------------------ 验证文件信息 ------------------------------
            var resultFiles = [];
            var errInfo = [];
            arrForEach(files, function (file) {
                var name = file.name;
                var size = file.size;
                if (!name || !size) {
                    return;
                }
                if (/\.(jpg|jpeg|png|bmp|gif)$/i.test(name) === false) {
                    //后缀名不合法，不是图片
                    errInfo.push('\u3010' + name + '\u3011\u4E0D\u662F\u56FE\u7247');
                    return;
                }
                if (maxSize < size) {
                    //上传图片过大
                    errInfo.push('\u3010' + name + '\u3011\u5927\u4E8E ' + maxSizeM + 'M');
                    return;
                }
                //验证通过的加入结果列表
                resultFiles.push(file);
            });
            //抛出验证信息
            if (errInfo.length) {
                SlimfToast('图片验证未通过: \n' + errInfo.join('\n'));
                return;
            }
            if (resultFiles.length > maxLength) {
                SlimfToast('一次最多上传' + maxLength + '张图片');
                return;
            }
            if (uploadImgServer && typeof uploadImgServer === 'string') {
                var formdata = new FormData();
                arrForEach(resultFiles, function (file) {
                    formdata.append(file.name, file);
                });
                SlimfAjax({
                    url: uploadImgServer,
                    data:formdata,
                    contentType: false,
                    processData: false,
                    progress:function (e) {
                        var percent = void 0;
                        //进度条
                        var progressBar = new Progress(editor);
                        if (e.lengthComputable) {
                            percent = e.loaded / e.total;
                            progressBar.show(percent);
                        }
                    },
                    param:uploadImgParams,
                    header:uploadImgHeaders,
                    success: function (rs) {
                        //将图片插入编辑器
                        var data = result.data || [];
                        data.forEach(function (link) {
                            _this3.insertLinkImg(link);
                        });
                    },
                    error:function () {
                        SlimfToast('图片上传失败')
                    }
                });
                return;
            }
            //------------------------------ 显示 base64 格式 ------------------------------
            if (uploadImgShowBase64) {
                arrForEach(files, function (file) {
                    var _this = _this3;
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        _this.insertLinkImg(this.result);
                    };
                });
            }
        };
    }
    function wordExport(elment,fileName) {
        fileName = typeof fileName !== 'undefined' ? fileName : "SlimfEditor-导出";
        var static = {
            mhtml: {
                top: "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>",
                head: "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n</style>\n</head>\n",
                body: "<body>_body_</body>"
            }
        };
        var options = {
            maxWidth: 624
        };
        var markup = elment;
        var images = Array();
        var img = markup.find('img');
        for (var i = 0; i < img.length; i++) {
            var w = Math.min(img[i].width, options.maxWidth);
            var h = img[i].height * (w / img[i].width);
            var canvas = document.createElement("CANVAS");
            canvas.width = w;
            canvas.height = h;
            var context = canvas.getContext('2d');
            context.drawImage(img[i], 0, 0, w, h);
            var uri = canvas.toDataURL("image/png");
            $(img[i]).attr("src", img[i].src);
            img[i].width = w;
            img[i].height = h;
            images[i] = {
                type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
                encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
                location: $(img[i]).attr("src"),
                data: uri.substring(uri.indexOf(",") + 1)
            };
        }
        var mhtmlBottom = "\n";
        for (var i = 0; i < images.length; i++) {
            mhtmlBottom += "--NEXT.ITEM-BOUNDARY\n";
            mhtmlBottom += "Content-Location: " + images[i].location + "\n";
            mhtmlBottom += "Content-Type: " + images[i].type + "\n";
            mhtmlBottom += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
            mhtmlBottom += images[i].data + "\n\n";
        }
        mhtmlBottom += "--NEXT.ITEM-BOUNDARY--";
        var styles = "";
        var fileContent = static.mhtml.top.replace("_html_", static.mhtml.head.replace("_styles_", styles) + static.mhtml.body.replace("_body_", markup.html())) + mhtmlBottom;
        var blob = new Blob([fileContent], {
            type: "application/msword;charset=utf-8"
        });
        SaveAs(blob, fileName + ".doc");
    }
    var SaveAs=(function(view) {
        "use strict";
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var get_URL = function() {
                return view.URL || view.webkitURL || view;
            }
            , save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
            , can_use_save_link = "download" in save_link
            , click = function(node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            }
            , is_safari = /constructor/i.test(view.HTMLElement)
            , is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
            , throw_outside = function(ex) {
                (view.setImmediate || view.setTimeout)(function() {
                    throw ex;
                }, 0);
            }
            , force_saveable_type = "application/octet-stream"
            , arbitrary_revoke_timeout = 1000 * 40 // in ms
            , revoke = function(file) {
                var revoker = function() {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                setTimeout(revoker, arbitrary_revoke_timeout);
            }
            , dispatch = function(filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            }
            , auto_bom = function(blob) {
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
                }
                return blob;
            }
            , FileSaver = function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                var
                    filesaver = this
                    , type = blob.type
                    , force = type === force_saveable_type
                    , object_url
                    , dispatch_all = function() {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                    , fs_error = function() {
                        if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                            var reader = new FileReader();
                            reader.onloadend = function() {
                                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                                var popup = view.open(url, '_blank');
                                if(!popup) view.location.href = url;
                                url=undefined; // release reference before dispatching
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        if (!object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (force) {
                            view.location.href = object_url;
                        } else {
                            var opened = view.open(object_url, "_blank");
                            if (!opened) {
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    }
                ;
                filesaver.readyState = filesaver.INIT;

                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setTimeout(function() {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    });
                    return;
                }

                fs_error();
            }
            , FS_proto = FileSaver.prototype
            , saveAs = function(blob, name, no_auto_bom) {
                return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
            }
        ;
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function(blob, name, no_auto_bom) {
                name = name || blob.name || "download";
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name);
            };
        }
        FS_proto.abort = function(){};
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;
        FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress =FS_proto.onwrite = FS_proto.onabort =FS_proto.onerror = FS_proto.onwriteend = null;
        return saveAs;
    }(
        typeof self !== "undefined" && self
        || typeof window !== "undefined" && window
        || this.content
    ));
    /*粘贴信息的处理*/
    function getPasteText(e) {
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
        var pasteText = void 0;
        if (clipboardData == null) {
            pasteText = window.clipboardData && window.clipboardData.getData('text');
        } else {
            pasteText = clipboardData.getData('text/plain');
        }
        return replaceHtmlSymbol(pasteText);
    }//获取粘贴的纯文本
    function getPasteHtml(e, filterStyle) {
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData;
        var pasteText = void 0,
            pasteHtml = void 0;
        if (clipboardData == null) {
            pasteText = window.clipboardData && window.clipboardData.getData('text');
        } else {
            pasteText = clipboardData.getData('text/plain');
            pasteHtml = clipboardData.getData('text/html');
        }
        if (!pasteHtml && pasteText) {
            pasteHtml = '<p>' + replaceHtmlSymbol(pasteText) + '</p>';
        }
        if (!pasteHtml) {
            return;
        }
        //过滤word中状态过来的无用字符
        var docSplitHtml = pasteHtml.split('</html>');
        if (docSplitHtml.length === 2) {
            pasteHtml = docSplitHtml[0];
        }
        //过滤无用标签
        pasteHtml = pasteHtml.replace(/<(meta|script|link).+?>/igm, '');
        //去掉注释
        pasteHtml = pasteHtml.replace(/<!--.*?-->/mg, '');
        if (filterStyle) {
            //过滤样式
            pasteHtml = pasteHtml.replace(/\s?(class|style)=('|").+?('|")/igm, '');
        } else {
            //保留样式
            pasteHtml = pasteHtml.replace(/\s?class=('|").+?('|")/igm, '');
        }
        return pasteHtml;
    }//获取粘贴的html
    function getPasteImgs(e) {
        var result = [];
        var txt = getPasteText(e);
        if (txt) {
            //有文字，就忽略图片
            return result;
        }
        var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
        var items = clipboardData.items;
        if (!items) {
            return result;
        }
        objForEach(items, function (key, value) {
            var type = value.type;
            if (/image/i.test(type)) {
                result.push(value.getAsFile());
            }
        });
        return result;
    }//获取粘贴的图片文件
    /*工具*/
    var UA = {
        _ua: navigator.userAgent,
        isWebkit: function isWebkit() {
            var reg = /webkit/i;
            return reg.test(this._ua);
        },
        isIE: function isIE() {
            return 'ActiveXObject' in window;
        }
    };//和 UA 相关的属性
    function objForEach(obj, fn) {
        var key = void 0,
            result = void 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                result = fn.call(obj, key, obj[key]);
                if (result === false) {
                    break;
                }
            }
        }
    }//遍历对象
    function arrForEach(fakeArr, fn) {
        var i = void 0,
            item = void 0,
            result = void 0;
        var length = fakeArr.length || 0;
        for (i = 0; i < length; i++) {
            item = fakeArr[i];
            result = fn.call(fakeArr, item, i);
            if (result === false) {
                break;
            }
        }
    }//遍历类数组
    function getRandom(prefix) {
        return prefix + Math.random().toString().slice(2);
    }//获取随机数
    function replaceHtmlSymbol(html) {
        if (html == null) {
            return '';
        }
        return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;').replace(/"/gm, '&quot;');
    }//替换 html 特殊字符
    function getChildrenJSON($elem) {
        var result = [];
        var $children = $elem.childNodes() || []; //注意 childNodes() 可以获取文本节点
        $children.forEach(function (curElem) {
            var elemResult = void 0;
            var nodeType = curElem.nodeType;
            //文本节点
            if (nodeType === 3) {
                elemResult = curElem.textContent;
            }
            //普通 DOM 节点
            if (nodeType === 1) {
                elemResult = {};
                //tag
                elemResult.tag = curElem.nodeName.toLowerCase();
                //attr
                var attrData = [];
                var attrList = curElem.attributes || {};
                var attrListLength = attrList.length || 0;
                for (var i = 0; i < attrListLength; i++) {
                    var attr = attrList[i];
                    attrData.push({
                        name: attr.name,
                        value: attr.value
                    });
                }
                elemResult.attrs = attrData;
                //children（递归）
                elemResult.children = getChildrenJSON($(curElem));
            }
            result.push(elemResult);
        });
        return result;
    }//获取一个 elem.childNodes 的 JSON 数据
    ROOT.SlimfEditor = Editor;
})(window);