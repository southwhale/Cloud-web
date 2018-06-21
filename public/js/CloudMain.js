CloudMain.User={
    elm:function () {
      this.elm=$(".CloudMainLogined *");
      this.dropList();
      this.dropmenu();
    },
    dropmenu:function () {
      this.dropmenu=$(".CloudUserDropMenu")[0];
    },
    dropList:function () {
        this.dropList=$(".CloudUserDropMenu li");
    },
    theme:$.Cookie.get('themes')||'themes1',
    get:function (flag) {
        CloudMain.Ajax({
            url: "/service/user/UserInfo",
            success: function(rs) {
                if(flag){
                    $(".CloudUserInfoS .CloudUserName")[0].innerHTML = rs[0].username;
                    $(".CloudUserInfoS .CloudUserAge")[0].innerHTML = rs[0].sex+' '+$.Time.age(rs[0].birthday)+'岁';
                    $(".CloudUserInfoS .CloudUserAge")[1].innerHTML = "注册时间:" + rs[0].time.split(" ")[0];
                    $(".CloudUserLeftDown img")[0].setAttribute("src",CloudMain.ServerUrl+'/'+rs[0].userhead);
                    $("#username")[0].innerHTML=rs[0].username;
                    $("#email")[0].innerHTML = rs[0].email;
                    $("#birth")[0].value = rs[0].birthday;
                    $("#phone")[0].value = rs[0].phone;
                    $("#underwrite")[0].value = rs[0].underwrite;
                    $("#CloudUserQrCode")[0].onclick=function () {
                        $.Confirm({
                            id:"CloudUserQrCodeS",
                            title: '扫描二维码',
                            width:'160px',
                            node:$(".CloudUserMain")[0],
                            callback:function (a) {
                                $.QRCode({
                                    id:null,
                                    modulesize: 5,
                                    data:CloudMain.ServerUrl,
                                    node:a
                                });
                                a.innerHTML+='扫描添加为好友';
                                a.parentNode.parentNode.style.top='40px';
                                a.parentNode.parentNode.style.left='317px';
                            }
                        })
                    };
                    var sex = $("#sex option");
                    if (rs[0].sex === "男") {
                        sex[0].click()
                    } else {
                        sex[1].click()
                    }
                }
                CloudMain.User.elm[0].src=CloudMain.ServerUrl+'/'+rs[0].userhead;
                CloudMain.User.elm[1].innerHTML=rs[0].username;
                CloudMain.username=rs[0].username;
                CloudMain.userhead=CloudMain.ServerUrl+'/'+rs[0].userhead;
                CloudMain.Main.style.background= "url(" + CloudMain.ServerUrl+'/'+rs[0].user_bg + ")";
                document.title='Cloud-'+CloudMain.username;
                $.Cookie.set('userhead',CloudMain.userhead);
                $.Cookie.set('username',CloudMain.username);
                $.Cookie.set('userid',rs[0].userid);
                CloudMain.loadCompulte=true;
            }
        })
    },
    Update:function (form) {
        var user_pic = $("#user_picc")[0].value;
        if (user_pic.length > 1 && user_pic) {
            var type =  $.String.before(user_pic,'.');
            if (!$.String.exist(type,'png,jpg,jpeg,bmp,gif,PNG,JPG,JPEG,BMP,GIF')) {
                $.Toast('所选格式为' + type + ' 请重新选择上传的文件');
                return false
            }
        }
        var formdata = new FormData(form);
        CloudMain.Ajax({
            url: '/service/user/UpdateUserInfo',
            data: formdata,
            contentType: false,
            processData: false,
            success: function(r) {
                if (r[0].state===1) {
                    $.Toast('信息已更新');
                    CloudMain.User.get();
                }else{
                    $.Toast('信息更新失败');
                }
                $("#user_picc")[0].value = ''
            }
        });
        return false
    },
    exit:function(flag){
        if(typeof flag==='object'){
            flag=false;
        }
        if(!flag) {
            var check = $("#PowerCheck")[0].checked;
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (check) {
                var list = $(".SlimfWindow");
                var data = [];
                for (var i = 0; i < list.length; i++) {
                    if ($.String.exist(list[i].id, 'CustomFunc')) {
                        data.push(list[i].id.split('CustomFunc')[1])
                    }
                }
                data = data.toString();
                $.Cookie.set('module', data, (1440 * 60 * 1000));
            } else {
                $.Cookie.remove('module')
            }
            if(keys) {
                for (var j = 0; j < keys.length; j++) {
                    if (keys[j] !== 'user' && keys[j] !== 'psw' && keys[j] !== 'module') {
                        $.Cookie.remove(keys[j])
                    }
                }
            }
        }
        if($.String.exist(location.origin,'http:')) {
            window.location.href=CloudMain.ServerUrl+'/service/logout';
        }else{
            window.location.href='index.html';
        }
    },
    couple:function(a){
        a.disabled = true;
        var report_title = $("#report_title")[0].value;
        var report_content = $("#report_content")[0].value;
        if (report_title === "") {
            $.Toast('问题类型未填');
            a.disabled = false;
            return false
        }
        if (report_content === "") {
            $.Toast('反馈内容是空的');
            a.disabled = false;
            return false
        }
        if (report_content.length > 200) {
            $.Toast('反馈内容大于200字');
            a.disabled = false;
            return false
        }
        CloudMain.Ajax({
            url:"/service/user/SendCouple",
            data: {
                report_title: report_title,
                report_content: report_content
            },
            success: function(rs) {
                var result = rs[0].report_state;
                if (result === "ok") {
                    $.Toast('反馈信息已提交');
                    setTimeout(function() {
                        $.Toast('感谢您的反馈')
                    }, 1500)
                } else {
                    $.Toast('提交失败');
                }
                $.Window.Close($("#CustomFunc8")[0]);
            }
        });
        return false
    },
    NotifyPanel:function(){
        this.NotifyPanel=$(".UserNotifyPanel div");
    },
    init:function () {
        this.elm();
        this.get();
        this.NotifyPanel();
        var _this=this;
        this.dropList[0].onmousedown=function () {
            CloudMain.Func.elm[4].getElementsByTagName("img")[0].click()
        };
        this.dropList[1].onmousedown=function () {
            $.Window.NewWindow({
                id: 'CustomFunc999',
                width: '670px',
                height: '420px',
                mini: false,
                biggest: false,
                resize: false,
                title: '个人信息',
                mission: false,
                callback:function (a) {
                    a.innerHTML='<span class="SlimfWindowLoading"></span>';
                    $.Request.load(a, 'public/module/CloudUser.html');
                }
            });
        };
        this.dropList[2].onmousedown=function () {
            CloudMain.Func.elm[CloudMain.Func.elm.length-1].getElementsByTagName("img")[0].click()
        };
        this.dropList[3].onmousedown=function () {
            $.Toast('敬请期待')
        };
        this.dropList[4].onmousedown=function () {
            $.Confirm({
                id: 'CloudExit',
                node: document.body,
                title: '退出',
                callback:function (a) {
                    $.CreateElement({
                        tag:"span",
                        className:'PowerLogo sf-icon-power-off',
                        node:a
                    });
                    $.CreateElement({
                        tag:"span",
                        className:'PowerTipsBold',
                        html:'您确认退出当前登录的账号吗？',
                        node:a
                    });
                    $.CreateElement({
                        tag:"span",
                        className:'PowerTips',
                        html:'账号将在60秒后自动退出？',
                        node:a
                    });
                    var b=$.CreateElement({
                        tag:"span",
                        className:'PowerTips',
                        style:{"margin-left":"45px"},
                        node:a
                    });
                    var c=$.CreateElement({
                        tag:"input",
                        id:"PowerCheck",
                        attr:{"type":"checkbox"},
                        node:$.CreateElement({
                            tag:"label",
                            html:'下次登录打开未关闭的应用',
                            node:b
                        })
                    });
                    $.FormControl(c);
                    var node=$(".PowerTips")[0];
                    var time=60;
                    CloudMain.Timer=setInterval(function () {
                        if(time!==0){
                            time--;
                            node.innerHTML='账号将在'+time+'秒后自动退出';
                        }else {
                            clearInterval(CloudMain.Timer);
                            CloudMain.User.exit();
                        }
                    },1000)
                },
                submit_func: CloudMain.User.exit,
                cancel_func:function (a) {
                    clearInterval(CloudMain.Timer);
                    $.Window.Close(a)
                }
            });
        };
        this.elm[0].parentNode.onmousedown=function (e) {
            $.DropMenu.init(this,_this.dropmenu);
        };
    }
};
CloudMain.Time={
    week:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
    show:function () {
        var tag='凌晨';
        var dObject = new Date();
        var hHour = dObject.getHours();
        var mMinute = dObject.getMinutes();
        var Ssecond=dObject.getSeconds();
        var iSec = dObject.getSeconds();
        var iMin = dObject.getMinutes()+iSec/60;
        var iHour = (dObject.getHours()%12)+iMin/60;
        //获取存储当前日期
        if(hHour>=1&&hHour<=4){
            tag='凌晨';
        }
        else if(hHour>4&&hHour<=6){
            tag='清晨'
        }
        else if(hHour>6&&hHour<=8){
            tag='早上'
        }
        else if(hHour>8&&hHour<=10){
            tag='上午'
        }
        else if(hHour>10&&hHour<=12){
            tag='中午'
        }
        else if(hHour>10&&hHour<=16){
            tag='下午'
        }
        else if(hHour>16&&hHour<=18){
            tag='傍晚'
        }
        else if(hHour>18&&hHour<=22){
            tag='晚上'
        }
        else if(hHour>22&&hHour<=24){
            tag='半夜'
        }
        if(hHour>12){
            hHour=hHour-12;
        }
        this.elm[1].innerHTML =tag+' '+hHour + ":" + $.String.zeroize(mMinute)+':'+$.String.zeroize(Ssecond);
        if (!CloudMain.username&&CloudMain.loadCompulte) {
            CloudMain.User.exit(true);
        }
    },
    init:function () {
        var _this=this;
        this.elm=$(".CloudHeadTime p");
        this.show();
        this.elm[0].innerHTML=$.Time.now('Y年m月d日')+' '+CloudMain.Time.week[new Date().getDay()];
        setInterval(function() {
            _this.show();
        },1000);
    }
};
CloudMain.Func={
    elm:[],
    panel:function () {
        this.panel=$(".CustomFuncPanel")[0];
    },
    modern:function () {
        return [{
            'img': './public/img/bar/'+CloudMain.User.theme+'/weather.png',
            'name': '天气',
            'src': './public/module/CloudWeather',
            'bg':'#1f8cda',
            'color':'#fff',
            'width': '1100px',
            'height': '600px',
            'size': false,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/video.png',
            'name': '视频',
            'src': './public/module/CloudVideo',
            'bg':'#3c3c3c',
            'color':'#fff',
            'width': '1008px',
            'height': '600px',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/music.png',
            'name': '音乐',
            'src': './public/module/CloudMusic',
            'width': '980px',
            'height': '580px',
            'bg':'#e73c3c',
            'color':'#fff',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/gallery.png',
            'name': '图库',
            'src': './public/module/CloudGallery',
            'width': '1000px',
            'height': '570px',
            'bg':'#3488fc',
            'color':'#fff',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/setting.png',
            'name': '设置',
            'src': './public/module/CloudSetting',
            'width': '870px',
            'height': '560px',
            'bg':'#00acc2',
            'color':'#fff',
            'size': false,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/doment.png',
            'name': '文档',
            'src': './public/module/CloudDoment',
            'width': '890px',
            'height': '600px',
            'bg':'#4d97ff',
            'color':'#fff',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/disk.png',
            'name': '网盘',
            'src': './public/module/CloudDisk',
            'width': '900px',
            'height': '550px',
            'bg':'#2682fc',
            'color':'#fff',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/note.png',
            'name': '备忘录',
            'src': './public/module/CloudNote',
            'width': '950px',
            'height': '672px',
            'bg':'#43495A',
            'color':'#fff',
            'size': false,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/chat.png',
            'name': '微聊',
            'src': './public/module/CloudChat',
            'width': '870px',
            'height': '600px',
            'bg':'url("./public/img/chat/CloudChat.png")',
            'color':'#e6e6e6',
            'size': false,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/pass.png',
            'name': '密保柜',
            'src': './public/module/CloudPassBook',
            'width': '870px',
            'height': '600px',
            'bg':'#00aec3',
            'color':'#fff',
            'size': true,
            'mini':true
        }, {
            'img': './public/img/bar/'+CloudMain.User.theme+'/dict.png',
            'name': '词典',
            'src': './public/module/CloudDict',
            'width': '820px',
            'height': '590px',
            'bg':'#fff',
            'color':'#4f4f4',
            'size': false,
            'mini':true
        }, {
            'img': './public/img/bar/themes1/couple.png',
            'name': '问题反馈',
            'src': './public/module/CloudCouple',
            'width': '450px',
            'height': '320px',
            'bg':'#fff',
            'color':'#000',
            'size': false,
            'mini':true
        }];
    },
    create:function(){
        this.elm=[];
        var _this=this;
        _this.panel.innerHTML='';
        for (var i = 0; i < this.modern().length; i++) {
            (function (i) {
                var a=$.CreateElement({
                    className: 'CustonFunc',
                    attr:{"ripple":""},
                    node: _this.panel
                });
                _this.elm.push(a);
                $.CreateElement({
                    tag: 'img',
                    attr: {
                        "src": _this.modern()[i].img,
                        "draggable":"false"
                    },
                    node: a
                });
                $.CreateElement({
                    tag: 'p',
                    html: _this.modern()[i].name,
                    node: a
                });
                a.onmouseover=function(){
                    a.style.background=a.background;
                };
                a.onmouseleave=function(){
                    a.style.background='rgba(255, 255, 255, 0.2)'
                };
                $.RGBaster.colors(_this.modern()[i].img, {
                    paletteSize:_this.modern().length,
                    exclude: [ 'rgb(255,255,255),rgb(231, 250, 253),rgb(238, 238, 238),rgb(236, 236, 236),rgb(237, 241, 248)'],
                    success: function(payload) {
                        a.background=payload.dominant;
                    }
                });
            })(i)
        }
    },
    position:function () {
        var _this=this;
        var l = parseInt(this.panel.offsetWidth/(this.elm[0].offsetLeft+this.elm[0].offsetWidth));
        for(var j=0; j < _this.elm.length; j++) {
            (function (j) {
                _this.elm[j].getElementsByTagName("img")[0].onclick =_this.elm[j].getElementsByTagName("p")[0].onclick = function () {
                    $.Window.NewWindow({
                        id: 'CustomFunc' + j,
                        className: 'SlimfWindow',
                        width: _this.modern()[j].width,
                        height: _this.modern()[j].height,
                        mini: _this.modern()[j].mini,
                        biggest: _this.modern()[j].size,
                        resize: _this.modern()[j].size,
                        title: _this.modern()[j].name,
                        bg: _this.modern()[j].bg,
                        color: _this.modern()[j].color,
                        ico: _this.modern()[j].img,
                        callback: function (a) {
                            a.innerHTML = '<span class="SlimfWindowLoading"></span>';
                            $.Request.load(a, _this.modern()[j].src + '.html')
                        }
                    });
                };
                _this.elm[j].onmousedown = function (e) {
                    this.style.zIndex = 1;
                    e.stopPropagation();
                    var a = $.CreateElement({
                        node: _this.elm[j]
                    });
                    var o_countx = _this.elm[j].offsetLeft, o_county = _this.elm[j].offsetTop;
                    var StartX = e.pageX, StartY = e.pageY;
                    document.onmousemove = function (e) {
                        if (e.pageX + _this.elm[j].offsetWidth > _this.panel.offsetWidth || e.pageY + _this.elm[j].offsetHeight > _this.panel.offsetHeight) {
                            return false
                        }
                        _this.elm[j].style.left = e.pageX - (StartX - o_countx) + 'px';
                        _this.elm[j].style.top = e.pageY - (StartY - o_county) + 'px';
                    };
                    document.onmouseup = function (e) {
                        _this.elm[j].style.zIndex = 0;
                        a.remove();
                        if (StartX === e.pageX && StartY === e.pageY) {
                            $(".CustonFunc img")[j].click();
                        }
                        var x_count = parseInt(_this.elm[j].offsetLeft / (_this.elm[j].offsetWidth + 10));
                        var y_count = parseInt(_this.elm[j].offsetTop / (_this.elm[j].offsetHeight + 10));
                        _this.elm[j].style.left = (_this.elm[j].offsetWidth) * x_count + 10 * (x_count + 1) + 'px';
                        _this.elm[j].style.top = (_this.elm[j].offsetHeight) * y_count + 10 * (y_count + 1) + 'px';
                        for (var i = 0; i < _this.elm.length; i++) {
                            if (_this.elm[j] !== _this.elm[i] && _this.elm[j].offsetLeft === _this.elm[i].offsetLeft && _this.elm[j].offsetTop === _this.elm[i].offsetTop) {
                                _this.elm[i].style.left = o_countx + 'px';
                                _this.elm[i].style.top = o_county + 'px';
                                this.onmousemove = null;
                                return;
                            }
                        }
                        this.onmousemove = null;
                    }
                }
            })(j);
            _this.elm [j].style.left = (j - l * Math.floor(j / l)) * (_this.elm [j].offsetWidth + 10) + 10 + 'px';
            _this.elm [j].style.top = (Math.ceil((j + 1) / l) - 1) * (_this.elm [j].offsetHeight + 10) + 10 + 'px';
        }
    },
    init:function () {
        var _this=this;
        this.panel();
        this.modern();
        this.create();
        this.position();
        if($.Cookie.get('module')) {
            var modules = $.Cookie.get('module').split(',');
            for (var i = 0; i < modules.length; i++) {
                _this.elm[modules[i]].getElementsByTagName('img')[0].click()
            }
        }
    }
};
CloudMain.NoteModern={
    Count:0,
    list:function(){
        this.list=$(".CloudMainNoteMain")[0];
    },
    head:function(){
      this.head=$(".CloudMainNoteHead p")[0];
    },
    button:function(){
      this.button=$(".CloudMainNoteHead span")[1];
    },
    start:function () {
        this.button.disabled=true;
        this.Count=0;
        var _this=this;
        CloudMain.Ajax({
            url: "/service/note/GetNoteList",
            data: {
                NoteType:'null'
            },
            success: function(rs) {
                _this.printList(rs);
                _this.button.className='sf-icon-redo';
                _this.button.disabled=false;
            }
        });
    },
    printList:function (rs) {
        var _this=this;
        this.list.innerHTML='';
        var note_id,create_time,note_content,note_left,note_top,pined,note_type;
        for(var time in rs){
            for(var i=0;i<rs[time].length;i++){
                note_id=rs[time][i].note_id;
                create_time=rs[time][i].create_time;
                note_content=rs[time][i].note_content;
                note_left=rs[time][i].note_left;
                note_top=rs[time][i].note_top;
                pined=rs[time][i].note_pined;
                note_type=rs[time][i].note_type;
                if(note_type==='Dealt') {
                    _this.Count++;
                    var a = $.CreateElement({
                        tag: "li",
                        className: 'animated slideInRight ',
                        style: {"animation-delay": '0.' + i + 1 + 's', "-webkit-animation-delay": '0.' + i + 1 + 's'},
                        node:this.list
                    });
                    a.onclick = function () {
                        _this.CreateThingShow(note_id, create_time, note_content, note_left, note_top, pined)
                    };
                    $.CreateElement({
                        tag: "p",
                        html: note_content,
                        node: a
                    });
                    $.CreateElement({
                        tag: "span",
                        className: 'CloudMainNoteTime',
                        attr: {"timeago": create_time},
                        html: create_time,
                        node: a
                    });
                }
                if(pined==='yes'){
                    _this.CreateThingShow(note_id,create_time,note_content,note_left,note_top,pined)
                }
            }
        }
        if($(".CloudMainNoteTime")[0]) {
            $.Time.friendly($(".CloudMainNoteTime"));
        }
        if(this.Count===0){
            this.head.innerHTML='当前没有代办事件';
        }else{
            this.head.innerHTML='您有'+this.Count+'件代办事件'
        }
    },
    CreateThingShow:function (note_id,create_time,note_content,note_left,note_top,pined) {
        var _this=this;
        $.Window.NewWindow({
            id: 'ThingWindow' + note_id,
            width: '300px',
            height: '400px',
            mini: false,
            biggest: false,
            resize: false,
            title: '',
            mission: false,
            bg: '#fbf3dd',
            callback:function (a) {
                note_left=parseInt(note_left);
                note_top=parseInt(note_top);
                if(note_top>window.innerHeight){
                    note_top=window.innerWidth-20;
                }
                if(note_left+a.offsetWidth>window.innerWidth){
                    note_left=window.innerWidth-(a.offsetWidth+40);
                }
                a.parentNode.style.top = note_top + 'px';
                a.parentNode.style.left = note_left + 'px';
                var b = $.CreateElement({
                    tag: 'div',
                    className: 'ThingShowMain',
                    node: a
                });
                var c = $.CreateElement({
                    tag: 'p',
                    className: 'ThingShowTime',
                    html:create_time,
                    node: b
                });
                var d=$.CreateElement({
                    tag:'div',
                    className:'ThingShowContainer',
                    html:note_content,
                    attr:{"spellcheck":"false","contenteditable":"true"},
                    node:b
                });
                var e=$.CreateElement({
                    tag:'button',
                    className:'sf-icon-save',
                    node:c
                });
                var e1=$.CreateElement({
                    tag:'button',
                    className:'sf-icon-map-pin',
                    node:c
                });
                e.onclick=function () {
                    CloudMain.Ajax({
                        url: "/service/note/UpdateNote",
                        data: {
                            thing_more:d.innerHTML,
                            thing_id:note_id
                        },
                        success: function (rs) {
                            if(rs[0].edit_thing==="ok"){
                                $.Toast('更改已保存');
                            }
                            if(rs[0].edit_thing==="error"){
                                $.Toast('事项修改失败');
                            }
                        }
                    });
                };
                e1.onclick=function () {
                    _this.PinScreen(a.parentNode.offsetLeft,a.parentNode.offsetTop,note_id,a.parentNode,this);
                };
                if(pined==='yes'){
                    a.parentNode.setAttribute("windowstate", "maximize");
                    e1.className+=' ThingPin';
                }
            }
        });
    },
    PinScreen:function (left,top,id,this_thing,btn) {
        btn.disabled=true;
        CloudMain.Ajax({
            url: "/service/note/FixedNote",
            data: {
                thing_id: id,
                left: left,
                top: top
            },
            success: function(rs) {
                btn.disabled=false;
                var r = rs[0].pin_thing;
                if (r === "ok") {
                    $.Toast('图钉已启用');
                    btn.className='sf-icon-map-pin ThingPin';
                    this_thing.setAttribute("windowstate", "maximize");
                }
                else if (r === "cancel") {
                    $.Toast('图钉已取消');
                    btn.className='sf-icon-map-pin';
                    this_thing.setAttribute("windowstate", "restore");
                }
                else if (r === "error") {
                    $.Toast('ERROR');
                    this_thing.setAttribute("windowstate", "restore");
                }
            }
        })
    },
    init:function () {
        var _this=this;
        this.list();
        this.head();
        this.button();
        this.start();
        this.button.onclick=function(){
            if(!this.disabled) {
                this.className = 'sf-icon-redo sf-spin';
                _this.start();
            }
        };
    }
};
CloudMain.Weather={
    get:function(){

    },
    load:function(city){
        var _this=this;
        if(!city) {
            var CookieCity = $.Cookie.get('city');
            if (CookieCity) {
                city = CookieCity;
            } else {
                city = '深圳';
            }
        }
        CloudMain.Ajax({
            url: "/service/WeatherInfo",
            data: {
                city:city
            },
            success: function(rs) {
                if(!rs){
                    _this.Fail();
                    return;
                }
                rs = eval(rs);
                if(rs.status==='No result available'){
                    $.Toast('未找到该城市，切换到深圳');
                    $.Cookie.set('city','深圳',(1440 * 60 * 1000));
                    _this.load();
                }else if(rs.status==='success') {
                    _this.Container.innerHTML='';
                    var _weather_data=rs.results[0].weather_data;
                    var _degString=_weather_data[0].date.split('(实时：')[1];
                    var _deg=_degString.substring(0,_degString.length-1);
                    var _img= _this.getImg(_weather_data[0].nightPictureUrl);
                    var _city=rs.results[0].currentCity;
                    var _temperature=_weather_data[0].temperature;
                    var _weather=_weather_data[0].weather;
                    _this.img.src=_img;
                    _this.deg.innerHTML=_deg;
                    _this.cityElm.innerHTML=_city;
                    _this.degs.innerHTML=_temperature;
                    _this.weaday.innerHTML=_weather;
                    $.Cookie.set('city',_city, (1440 * 60 * 1000));
                    for(var i=0;i<_weather_data.length;i++){
                        var a=$.CreateElement({
                            tag:"li",
                            className:'animated fadeIn',
                            style:{
                                "animation-delay":'.'+i+'5s',
                                "-webkit-animation-delay":'.'+i+'5s'
                            },
                            node:_this.Container
                        });
                        $.CreateElement({
                            tag:"p",
                            html:_weather_data[i].date.length>2?_weather_data[i].date.split(' ')[0]:_weather_data[i].date,
                            node:a
                        });
                        $.CreateElement({
                            tag:"img",
                            attr:{"src":_this.getImg(_weather_data[i].nightPictureUrl),"draggable":"false"},
                            node:a
                        });
                        $.CreateElement({
                            tag:"p",
                            html:_weather_data[i].temperature.split('~')[1],
                            node:a
                        });
                    }
                }else{
                    _this.Fail();
                }
            },
            error: function() {
                _this.Fail();
            }
        })
    },
    getImg:function(url){
        var SrcState = '/day/';
        if (new Date().getHours() > 18) {
            SrcState = '/night/'
        }
        return './public/img/weather' + SrcState+$.String.before(url,'\/').split('.')[0] + '.png'
    },
    bind:function(){
        var _this=this;
        this.input.onkeydown=function (e) {
            e = window.event||arguments[0];
            if(e.keyCode===13){
                window.event.returnValue = false;
                if(!_this.input.value.length){
                    $.Toast('请输入城市');
                    return false;
                }
                _this.load(_this.input.value);
                _this.input.value='';
            }
        }
    },
    init:function () {
        this.main=$(".CloudWeatherPanel *");
        this.img=this.main[1];
        this.deg=this.main[2];
        this.weaday=this.main[3];
        this.degs=this.main[4];
        this.cityElm=this.main[6];
        this.Container=this.main[9];
        this.input=this.main[7];
        this.bind();
        this.load()
    }
};
CloudMain.Resource={
    list:[
        {"name":"CloudChat.css"},
        {"name":"CloudDisk.css"},
        {"name":"CloudDict.css"},
        {"name":"CloudDoment.css"},
        {"name":"CloudGallery.css"},
        {"name":"CloudMainWindow.css"},
        {"name":"CloudMusic.css"},
        {"name":"CloudNote.css"},
        {"name":"CloudPassBook.css"},
        {"name":"CloudSetting.css"},
        {"name":"CloudVideo.css"},
        {"name":"CloudWeather.css"},
        {"name":"SlimfEditor.css"}
    ],
    load:function () {
        for (var i=0;i<this.list.length;i++){
            $.CreateElement({
                tag:"link",
                attr:{"href":'public/css/'+this.list[i].name,"rel":"stylesheet","type":"text/css"},
                node:document.head
            })
        }
    }
};
CloudMain.Notify={
    dropmenu:function () {
        this.dropmenu=$(".CloudSystemN")[0];
    },
    refresh:function(){
        //刷新
    },
    init:function () {
        var _this=this;
        this.dropmenu();
        CloudMain.User.NotifyPanel[0].onmousedown=function () {
            $.DropMenu.init(this,_this.dropmenu);
        };
    }
};
CloudMain.Message={
    dropmenu:function () {
        this.dropmenu=$(".CloudUserMainMessage")[0];
    },
    init:function () {
        var _this=this;
        this.dropmenu();
        CloudMain.User.NotifyPanel[1].onmousedown=function () {
            $.DropMenu.init(this,_this.dropmenu);
        };
    }
};
!function () {
    if($.String.exist(location.origin,'http:')) {
    }else{
        CloudMain.ServerUrl=$.String.query(window.location.href).url;
    }
    CloudMain.Main=$("#Cloud")[0];
    CloudMain.Loading=$("#CloudLoading")[0];
    CloudMain.loadCompulte=false;
    CloudMain.version=$("#CloudVersion")[0].innerHTML;
    CloudMain.CloudStyle=$("#CloudStyle")[0];
    CloudMain.User.init();
    CloudMain.Time.init();
    CloudMain.Notify.init();
    CloudMain.Message.init();
    CloudMain.NoteModern.init();
    CloudMain.Weather.init();
    document.onreadystatechange =function() {
        if (document.readyState === "complete") {
            CloudMain.Loading.className+=' animated fadeOut';
            var a=setTimeout(function () {
                CloudMain.Loading.remove();
                clearTimeout(a)
            },1000);
            console.log('Cloud ver ' +CloudMain.version);
            console.log('愿每个人都被时光温柔以待');
            CloudMain.Resource.load();
        }
    };
    document.body.onresize=function () {
        CloudMain.Func.position()
    };
    CloudMain.Func.init();
}();