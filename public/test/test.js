CloudTest=$.NameSpace.register('CloudTest');
CloudMain.version=$("#CloudVersion")[0].innerHTML;
CloudMain.Main=$("#Cloud")[0];
CloudMain.FuncStart = function() {
    $(".CloudTestModelContainer")[0].innerHTML='';
    var userthemes=$.Cookie.get('themes');
    var themes=userthemes?userthemes:'themes1';
    $.Cookie.set('themes',themes,315360000000);
    var icons = [{
        'img': './public/img/bar/'+themes+'/weather.png',
        'name': '天气',
        'src': './public/module/CloudWeather',
        'bg':'#1f8cda',
        'color':'#fff',
        'width': '1100px',
        'height': '600px',
        'size': false,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/video.png',
        'name': '视频',
        'src': './public/module/CloudVideo',
        'bg':'#3c3c3c',
        'color':'#fff',
        'width': '1008px',
        'height': '600px',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/music.png',
        'name': '音乐',
        'src': './public/module/CloudMusic',
        'width': '980px',
        'height': '580px',
        'bg':'#e73c3c',
        'color':'#fff',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/gallery.png',
        'name': '图库',
        'src': './public/module/CloudGallery',
        'width': '1000px',
        'height': '570px',
        'bg':'#3488fc',
        'color':'#fff',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/setting.png',
        'name': '设置',
        'src': './public/module/CloudSetting',
        'width': '870px',
        'height': '560px',
        'bg':'#00acc2',
        'color':'#fff',
        'size': false,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/doment.png',
        'name': '文档',
        'src': './public/module/CloudDoment',
        'width': '890px',
        'height': '600px',
        'bg':'#4d97ff',
        'color':'#fff',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/disk.png',
        'name': '网盘',
        'src': './public/module/CloudDisk',
        'width': '900px',
        'height': '550px',
        'bg':'#2682fc',
        'color':'#fff',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/note.png',
        'name': '备忘录',
        'src': './public/module/CloudNote',
        'width': '950px',
        'height': '672px',
        'bg':'#43495A',
        'color':'#fff',
        'size': false,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/chat.png',
        'name': '微聊',
        'src': './public/module/CloudChat',
        'width': '870px',
        'height': '600px',
        'bg':'url("./public/img/chat/CloudChat.png")',
        'color':'#e6e6e6',
        'size': false,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/pass.png',
        'name': '密保柜',
        'src': './public/module/CloudPassBook',
        'width': '870px',
        'height': '600px',
        'bg':'#00aec3',
        'color':'#fff',
        'size': true,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/dict.png',
        'name': '词典',
        'src': './public/module/CloudDict',
        'width': '820px',
        'height': '590px',
        'bg':'#fff',
        'color':'#4f4f4',
        'size': false,
        'mini':true
    }, {
        'img': './public/img/bar/'+themes+'/couple.png',
        'name': '问题反馈',
        'src': './public/module/CloudCouple',
        'width': '550px',
        'height': '400px',
        'bg':'#fff',
        'color':'#000',
        'size': false,
        'mini':true
    }];
    for (var i = 0; i < icons.length; i++) {
        var a=$.CreateElement({
            tag:"li",
            className: 'CloudTestModel',
            attr:{"ripple":""},
            style:{"animation-delay":'.3'+i+'s'},
            node: $(".CloudTestModelContainer")[0]
        });
        $.CreateElement({
            tag: 'img',
            attr: {
                "src": icons[i].img
            },
            node: a
        });
        $.CreateElement({
            tag: 'p',
            html: icons[i].name,
            node: a
        });
    }
    var TestModel = $(".CloudTestModel");
    for(var j=0; j < TestModel.length; j++) {
        (function (j) {
            TestModel[j].onclick=function () {
                $.Window.NewWindow({
                    id: 'CustomFunc' + j,
                    width: icons[j].width,
                    height: icons[j].height,
                    mini: icons[j].mini,
                    biggest: icons[j].size,
                    resize: icons[j].size,
                    title: icons[j].name,
                    state:'restore',
                    bg: icons[j].bg,
                    color: icons[j].color,
                    missionPic:icons[j].img,
                    callback:function (a) {
                        a.innerHTML='<span class="$.WindowLoading"></span>';
                        $.Request.load(a, icons[j].src)
                    }
                });
            };
        })(j);
    }
};
CloudTest.Init=function () {
    $.Request.post("./service/user/login",{'username':"ZJINH","password":"123"},function (rs) {
        rs=eval(rs);
        CloudTest.TestPanel[1].innerHTML='已登录：'+rs[0].user;
        $.Toast('测试用户:'+rs[0].user+'已登录')
    });
    CloudTest.TestPanel=$(".CloudTestPanel *");
    CloudTest.TestPanel[2].innerHTML+=' '+Slimf.version;
    CloudTest.TestPanel[3].innerHTML+=' '+SlimfEditor.version;
    CloudTest.TestPanel[4].onclick=function () {
        $.Window.NewWindow({
            id: "MailTemp",
            mini: false,
            biggest: true,
            width: '670px',
            height: '440px',
            resize: true,
            title: '邮件模板',
            state: 'restore',
            callback:function (a) {
                $.Request.load(a, "public/module/mail.php");
                a.parentNode.style.top = a.parentNode.style.left = '20px';
            }
        });
    };
    CloudTest.CodeTest=$(".CloudTestCode *");
    CloudTest.CodeTest[1].onclick=function () {
        var a=$.CreateElement({
            tag:"script",
            html:CloudTest.CodeTest[0].value
        });
        a.remove()
    };
    CloudTest.Console=$(".CloudTestConsole *");
    CloudTest.Console[0].onclick=function () {
        CloudTest.Console[1].innerHTML='';
    };
    window.onerror = function(a, b, c, d, e) {
        $.CreateElement({
            tag:"p",
            html:'错误:'+e.message+' 在'+ $.String.before(b,'/') +'的 '+c + ' 行 ' + d + ' 列',
            node:CloudTest.Console[1]
        });
        return true
    };
    CloudMain.FuncStart();
    if($.Cookie.get('module')) {
        var modules = $.Cookie.get('module').split(',');
        for (var i = 0; i < modules.length; i++) {
            $(".CloudTestModel")[modules[i]].click()
        }
    }
    console.log('愿每个人都被时光温柔以待');

}();