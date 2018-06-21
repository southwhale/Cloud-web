CloudChat=$.NameSpace.register('CloudChat');
CloudChat.Main=$(".CloudChatMain")[0];
CloudChat.MsgLIst=$(".CloudChatMessageList")[0];
CloudChat.SortMenu=$("#CloudChatSortMenu")[0];
CloudChat.ContactMenu=$("#CloudChatContactMenu")[0];
CloudChat.GroupMenu=$("#CloudChatGroupMenu")[0];
CloudChat.DiscussMenu=$("#CloudChatDisucssMenu")[0];
CloudChat.MsgLMenu=$("#CloudChatMsgListMMenu")[0];
CloudChat.Cmenu=$("#CloudChatCMenu")[0];
CloudChat.FriendSort=[];
CloudChat.Friends=[];
CloudChat.FriendListData=[];
CloudChat.InfoPanel=$("#CloudChatUserInfo")[0];
CloudChat.InfoPanel.List=$(".CloudChatInfoPanel div");
CloudChat.InfoPanel.Head=CloudChat.InfoPanel.getElementsByTagName("img")[0];
CloudChat.InfoPanel.This=CloudChat.InfoPanel.List[0];
CloudChat.InfoPanel.Head1=$("#CCUIHead")[0];
CloudChat.UserHead=$(".CloudChatUser img")[0];
CloudChat.UserName=$(".CloudChatUser p")[0];
CloudChat.UserRCount=$(".CloudChatUser span")[0];
CloudChat.ToggleW=0;
CloudChat.time=1;
CloudChat.LoadFlag=false;
CloudChat.SocketLink=false;
CloudChat.RequestList=[];
CloudChat.Socketflag=true;
CloudChat.AllMsgCount=0;
CloudChat.AllMsgCountContainer=$("#CloudChatMsgCount")[0];
/*聊天窗口*/
CloudChat.ChatWindow=$("#CloudChatM")[0];
CloudChat.ChatWindowHead=$(".CloudChatHead p")[0];
CloudChat.ChatArea=$(".CCInputAreaHead span");
CloudChat.ToastArea=$("#CloudChatToast p")[0];
CloudChat.Toast=function (msg,flag) {//聊天专用toast信息弹框
    CloudChat.ToastArea.className='animated slideInDown';
    CloudChat.ToastArea.innerHTML=msg;
    if ($.String.exist(msg, '警告,Waring,waring,Waring,为空,空的,输入,填写,未,空,修复,无,重新,尝试,已')) {
        CloudChat.ToastArea.style.background='#ffee83';
        CloudChat.ToastArea.style.color='#7c6045';
    }
    else if ($.String.exist(msg, '成功,success,完成,ok,OK,SUCCESS,完毕')) {
        CloudChat.ToastArea.style.background='#f4f7ed';
        CloudChat.ToastArea.style.color='#84a099';
    }
    else if ($.String.exist(msg, '断开,失败,出错,无法,不')) {
        CloudChat.ToastArea.style.background='#ec8787';
        CloudChat.ToastArea.style.color='#551313';
    }
    else{
        CloudChat.ToastArea.style.background='#f4f7ed';
        CloudChat.ToastArea.style.color='#84a099';
    }
    function ToastClose() {
        setTimeout(function () {
            CloudChat.ToastArea.className = 'animated slideOutUp';
            setTimeout(function () {
                CloudChat.ToastArea.innerHTML = '';
            }, 300);
        }, 1500);
    }
    if(!flag) {
        ToastClose();
    }else{
        if(typeof flag==='function') {
            setTimeout(function () {
                flag(function () {
                    ToastClose;
                });
            },1500);
        }
    }
};
CloudChat.Socket=function () {
    var socket=CloudChat.serve=null;
    CloudChat.serve=socket = new WebSocket(CloudMain.socketUrl);
    socket.onerror=function () {
        CloudChat.time++;
        CloudChat.SocketLink=false;
        CloudChat.UserHead.style.webkitFilter = 'grayscale(1)';
        CloudChat.UserHead.style.filter = 'grayscale(1)';
        CloudChat.UserHead.style.filter = 'gray(1)';
    };
    socket.onopen = function() {
        var Login = '{"type":"authroize","uuid":"'+CloudChat.Sender.uid+'"}';
        socket.send(Login);
        CloudChat.time!==1?CloudChat.Toast('服务器连接成功'):"";
        CloudChat.time=2;
        CloudChat.SocketLink=true;
        CloudChat.UserHead.removeAttribute('style');
    };
    socket.onmessage = function(e) {
        var aa=CloudChat.Main.getElementsByClassName('CloudCMsgList');
        var bb=CloudChat.Main.getElementsByClassName('CloudChatList');
        var data = JSON.parse(e.data);
        if(/^online:/.test(data)) {
            onlineUser=data.replace('online:','');
            onlineUser=eval('('+onlineUser+')');
            for (var i = 0; i < CloudChat.Friends.length; i++) {
                CloudChat.Friends[i].getElementsByTagName("img")[0].style.webkitFilter = 'grayscale(1)';
                CloudChat.Friends[i].getElementsByTagName("img")[0].style.filter = 'grayscale(1)';
                CloudChat.Friends[i].getElementsByTagName("img")[0].style.filter = 'gray(1)';
            }
            for (var key in onlineUser) {
                for (var i = 0; i < CloudChat.Friends.length; i++) {
                    if (CloudChat.Friends[i].data.userid=== onlineUser[key]) {
                        CloudChat.Friends[i].getElementsByTagName("img")[0].style.webkitFilter = 'none';
                        CloudChat.Friends[i].getElementsByTagName("img")[0].style.filter = 'none';
                        CloudChat.Friends[i].getElementsByTagName("img")[0].style.filter = 'none';
                    }
                }
            }
        }
        else if(data.type==='newMessage'){
            function create(area) {
                for(var j=0;j<bb.length;j++) {
                    if (bb[j].data.userid === data.form&&bb[j].data.type===data.mtype) {
                        bb[j].ondblclick();
                        var t_b = setTimeout(function () {
                            CloudChat.PrintMsg(data.senderName, data.senderHead, data.content, area);
                            clearTimeout(t_b);
                        }, 200)
                    }
                }
            }
            for(var k = 0; k <aa.length; k++){
                if(aa[k].data.uid===data.form&&aa[k].data.type===data.mtype){
                    CloudChat.PrintMsg(data.senderName,data.senderHead,data.content,data.mtype+'_'+data.form);
                    return;
                }
            }
            create(data.mtype+'_'+data.form);
        }
        else if(data.type==='newRequest'||data.type==='requestSuccess'){
            CloudChat.GetFriendRequest();
        }
    };
    socket.onclose = function(){
        CloudChat.SocketLink=false;
        CloudChat.Toast('服务器连接失败',function () {
            CloudChat.UserHead.style.webkitFilter = 'grayscale(1)';
            CloudChat.UserHead.style.filter = 'grayscale(1)';
            CloudChat.UserHead.style.filter = 'gray(1)';
            var count=4*CloudChat.time;
            if (CloudChat.time < 11) {
                var b = setInterval(function () {
                    count !== 1 ? count-- : "";
                    if (count === 1) {
                        CloudChat.Toast('正在尝试重新连接', true);
                        clearInterval(b);
                        $(".CloudChatMain")[0]?CloudChat.Socket():CloudChat.serve.close();
                    }
                    CloudChat.Toast('服务器连接已断开，' + count + '秒后尝试重新连接', true);
                }, 1000);
            }else {
                CloudChat.Toast('服务器重连多次仍然失败，请尝试重新打开本应用', true);
                CloudChat.SwitchBtn[0].click();
                CloudChat.UserName.innerHTML = CloudChat.ChatWindow.innerHTML=CloudChat.MsgLIst.innerHTML=CloudChat.FriendList[0].innerHTML=CloudChat.FriendList[1].innerHTML=CloudChat.FriendList[2].innerHTML='';
                CloudChat.Main.innerHTML+=this.innerHTML;
                return false
            }
        });
    };
};
CloudChat.SwitchBind=function () {
    CloudChat.SwitchBtn=$("#CloudChatSwitch li");
    CloudChat.SwitchContent=$(".CloudChatContainer");
    CloudChat.FriendSwitchBtn=$("#ContartSwitch li");
    CloudChat.FriendList=$(".CloudChatFriendList");
    CloudChat.Triangle=$('.CloudChatTriangle')[0];
    CloudChat.AddBtn=$(".CloudChatAddBtn")[0];
    CloudChat.MenuName=$("#CloudChatUmenuName")[0];
    CloudChat.UserMenuList=$(".CloudUserMenu div");
    CloudChat.UserMenu=$(".CloudUserMenu")[0];
    CloudChat.MenuName.onclick=function () {
        $.Window.NewWindow({
            id: 'CustomFunc11',
            width: '720px',
            height: '445px',
            mini: false,
            biggest: false,
            resize: false,
            title: '个人信息',
            mission: false,
            callback:function (a) {
                $.Request.load(a, 'public/module/CloudUser');
            }
        });
    };
    CloudChat.AddBtn.onclick=function (e) {
        e.stopPropagation();
        if(CloudChatCMenu.offsetWidth){
            CloudChat.AddBtn.className='sf-icon-plus CloudChatAddBtn';
            CloudChat.Cmenu.className='CloudChatCMenu animated slideOutLeft';
            var b=setTimeout(function () {
                CloudChat.Cmenu.style.display='none';
                clearTimeout(b)
            },300);
        }else {
            CloudChat.AddBtn.className='sf-icon-times CloudChatAddBtn';
            CloudChatCMenu.className='CloudChatCMenu animated slideInLeft';
            CloudChatCMenu.style.display='block';
        }
    };
    CloudChat.UserHead.onclick=function (e) {
        e.stopPropagation();
        if(CloudChat.UserMenu.offsetWidth){
            CloudChat.UserMenu.className='CloudUserMenu animated slideOutLeft';
            var b=setTimeout(function () {
                CloudChat.UserMenu.style.display='none';
                clearTimeout(b)
            },300);
        }else {
            CloudChat.UserMenu.className='CloudUserMenu animated slideInLeft';
            CloudChat.UserMenu.style.display='block';
        }
    };
    CloudChat.NetDisk=document.getElementsByClassName('CustonFunc')[6];
    for(var i=0;i<CloudChat.SwitchBtn.length;i++){
        (function (i) {
            CloudChat.SwitchBtn[i].onclick=function () {
                CloudChat.MainSwitch(i);
                CloudChat.ToggleW=null;
            };
        })(i)
    }
    CloudChat.MainSwitch=function (a) {
        for(var i=0;i<CloudChat.SwitchBtn.length;i++){
            CloudChat.SwitchBtn[i].style.opacity='.7';
            CloudChat.SwitchContent[i].style.display='none';
        }
        CloudChat.SwitchContent[a].style.display='block';
        CloudChat.SwitchBtn[a].removeAttribute('style');
        a===0?CloudChat.Triangle.style.left='57px':CloudChat.Triangle.style.left='125px';
    };
    for(var j=0;j<CloudChat.FriendSwitchBtn.length;j++){
        (function (j) {
            CloudChat.FriendSwitchBtn[j].onclick=function () {
                CloudChat.FriendSwitch(j);
            };
        })(j);
    }
    CloudChat.FriendSwitch=function (a) {
        a!==0?CloudChat.AddBtn.style.display='block':CloudChat.AddBtn.style.display='none';
        for(var j=0;j<CloudChat.FriendSwitchBtn.length;j++){
            CloudChat.FriendSwitchBtn[j].removeAttribute('style');
            CloudChat.FriendSwitchBtn[j].getElementsByTagName('div')[0].style.width='0';
            CloudChat.FriendList[j].style.display='none';
        }
        CloudChat.FriendSwitchBtn[a].style.color='#000';
        CloudChat.FriendSwitchBtn[a].getElementsByTagName('div')[0].style.width='100%';
        CloudChat.FriendList[a].style.display='block';
    };
    CloudChat.UserMenuList[0].onclick=function () {
        CloudChat.NetDisk?CloudChat.NetDisk.getElementsByTagName("img")[0].click():CloudChat.Toast('网盘服务不可用');
    };
    CloudChat.UserMenuList[1].onclick=function () {
        this.getElementsByTagName('span')[0].innerHTML=CloudChat.UserRCount.innerHTML='';
        CloudChat.RequestMange();
    };
    CloudChat.UserMenuList[2].onclick=function () {
        this.getElementsByTagName('span')[0].innerHTML='';
        CloudChat.Mange();
    };
    CloudChat.UserMenuList[3].onclick=function () {
        this.getElementsByTagName('span')[0].innerHTML='';
        $.Toast('敬请期待')
    };
    CloudChat.UserMenuList[4].onclick=function () {
        $.Confirm({
            id: 'CloudChatExit',
            title: '退出微聊',
            notic: '确认退出当前账号<br>退出后将收不到任何消息',
            submit_func:function (a) {
                $.Window.Close(a);
                $.Window.Close($("#CustomFunc8")[0]);
                CloudChat.serve.close();
            }
        });
    };
    CloudChat.Main.addEventListener('click',function (e) {
        e.stopPropagation();
        CloudChat.UserMenu.className='CloudUserMenu animated slideOutLeft';
        CloudChat.AddBtn.className='sf-icon-plus CloudChatAddBtn';
        CloudChat.Cmenu.className='CloudChatCMenu animated slideOutLeft';
        var ChatemojiAreas=CloudChat.Main.getElementsByClassName('ChatemojiArea');
        for(var i=0;i<ChatemojiAreas.length;i++){
            ChatemojiAreas[i].onblur();
        }
        var b=setTimeout(function () {
            CloudChat.UserMenu.style.display='none';
            CloudChat.Cmenu.style.display='none';
            clearTimeout(b)
        },300);
    });
    CloudMain.Ajax({
        url: "/service/user/UserInfo",
        success: function(rs) {
            CloudChat.UserHead.src=CloudMain.ServerUrl+'/'+rs[0].userhead;
            CloudChat.UserHead.style.webkitFilter = 'grayscale(1)';
            CloudChat.UserHead.style.filter = 'grayscale(1)';
            CloudChat.UserHead.style.filter = 'gray(1)';
            CloudChat.MenuName.innerHTML=CloudChat.UserName.innerHTML = rs[0].username;
            CloudChat.Sender={
                uid:rs[0].userid,
                uname:rs[0].username,
                uhead:CloudMain.ServerUrl+'/'+rs[0].userhead
            };
        }
    });
};
CloudChat.GetfriendList=function () {
    CloudMain.Ajax({
        url:"/service/chat/GetfriendList",
        success: function (rs) {
            CloudChat.FriendSort=[];
            CloudChat.FriendListData=[];
            CloudChat.FriendList[0].innerHTML=CloudChat.FriendList[1].innerHTML=CloudChat.FriendList[2].innerHTML='';
            var NormalSort=CloudChat.NormalSort=[
                {"list_name":'未分组','list_id':'1'},
                {"list_name":'黑名单','list_id':'0'}
            ];
            for(var k=0;k<NormalSort.length;k++){
                CloudChat.FriendListData.push(NormalSort[k]);
                CloudChat.PrintFriendList(NormalSort[k].list_id,NormalSort[k].list_name)
            }
            var list_id,list_name;
            for(var i=0;i<rs.length;i++){
                list_name=rs[i].list_name;
                list_id=rs[i].list_id;
                CloudChat.PrintFriendList(list_id,list_name);
                CloudChat.FriendListData.push(rs[i]);
            }
            CloudChat.Getfriends(true);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
    });
};
CloudChat.Getfriends=function (flag) {
    CloudMain.Ajax({
        url:"/service/chat/Getfriends",
        success: function (rs) {
            CloudChat.Friends=[];
            for(var a=0;a<CloudChat.FriendSort.length;a++){
                CloudChat.FriendSort[a].data.list.innerHTML='';
            }
            var userid,list_id,username,nickname,userhead,type,info,friend_id;
            for(var i=0;i<rs.length;i++){
                type=rs[i].type;
                userid=rs[i].userid;
                list_id=rs[i].list_id;
                username=rs[i].username;
                userhead=rs[i].userhead;
                nickname=rs[i].nickname;
                info=rs[i].info;
                friend_id=rs[i].friend_id;
                CloudChat.PrintFriends(type,userid,list_id,username,nickname,userhead,info,friend_id);
            }
            if(flag&&CloudChat.Socketflag) {
                CloudChat.Socket();
                CloudChat.Socketflag=false;
            }
            CloudChat.LoadFlag=true;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
    });
};
CloudChat.PrintFriendList=function (id,name,node) {
    var a=$.CreateElement({
        className:'CloudChatSort',
        node:node?node:CloudChat.FriendList[0]
    });
    var aa=$.CreateElement({
        node:a
    });
    var state=$.CreateElement({
        tag:"span",
        className:'sf-icon-angle-right',
        node:aa
    });
    $.CreateElement({
        tag:"p",
        html:name,
        node:aa
    });
    var b=$.CreateElement({
        tag:"ul",
        attr:{"hidden":"hidden"},
        node:a
    });
    a.data={
        "id":id,
        "name":name,
        "list":b
    };
    a.onclick=function () {
        if(state.className==='sf-icon-angle-right'){
            state.className='sf-icon-angle-down';
            b.removeAttribute("hidden");
        }else{
            state.className='sf-icon-angle-right';
            b.setAttribute("hidden","hidden");
        }
    };
    a.onmousedown=function (e) {
        $.MouseMenu(CloudChat.SortMenu,this,CloudChat.SortMenuFunc,e)
    };
    if(!node) {
        CloudChat.FriendSort.push(a);
    }
};
CloudChat.PrintFriends=function (type,userid,list_id,username,nickname,userhead,info,friend_id) {
    var node;
    if(type==='friend'){
        node=CloudChat.FriendList[0];
        for(var i=0;i<CloudChat.FriendSort.length;i++){
            if(CloudChat.FriendSort[i].data.id===list_id){
                node=CloudChat.FriendSort[i].data.list;
            }
        }
    }else if(type=='group'){
        node=CloudChat.FriendList[1];
    }else if(type=='discuss'){
        node=CloudChat.FriendList[2];
    }
    var a=$.CreateElement({
        tag:"li",
        attr:{"ripple":""},
        className:'CloudChatList',
        node:node
    });
    a.data={
        "friend_id":friend_id,
        "list_id":list_id,
        "type":type,
        "userid":userid,
        "username":username,
        "userhead":userhead,
        "nickname":nickname,
        "info":info
    };
    if(type!='discuss') {
        $.CreateElement({
            tag: "img",
            attr: {"src": CloudMain.ServerUrl+'/'+userhead},
            node: a
        });
    }else{
        var c=$.CreateElement({
            tag: "div",
            className:'discussHead',
            node: a
        });
        for(var j=0;j<userhead.length;j++){
            $.CreateElement({
                tag: "div",
                style:{"background":"url("+CloudMain.ServerUrl+'/'+userhead[j].image+")"},
                node: c
            });
        }
        var d=c.getElementsByTagName('div');
        switch(userhead.length){
            case 1:
                d[0].className='discussHead0';
                break;
            case 2:
                d[0].className='discussHead1';
                d[1].className='discussHead1';
                break;
            case 3:
                d[0].className='discussHead1';
                d[1].className='discussHead3';
                d[2].className='discussHead3';
                break;
            case 4:
                d[0].className='discussHead3';
                d[1].className='discussHead3';
                d[2].className='discussHead3';
                d[3].className='discussHead3';
        }
    }
    var b=$.CreateElement({
        tag:"span",
        html:username,
        node:a
    });
    if(nickname!=' '){
        b.innerHTML=nickname+'('+username+')'
    }
    $.CreateElement({
        tag:"p",
        html:info,
        node:a
    });
    a.onclick=function (e) {
        e.stopPropagation();
        CloudChat.ShowInfo(this);
        CloudChat.InfoPanel.getElementsByTagName('button')[0].onclick=function () {
            CloudChat.PreChat(a.data.userid,a.data.type,a.data)
        };
    };
    a.ondblclick=function () {
        CloudChat.InfoPanel.data=a.data.userid;
        CloudChat.InfoPanel.type=a.data.type;
        CloudChat.PreChat(a.data.userid,a.data.type,a.data);
    };
    if(type=='friend') {
        CloudChat.Friends.push(a);
        a.onmousedown = function (e) {
            $.MouseMenu(CloudChat.ContactMenu, this, CloudChat.ContactMenuFunc, e)
        };
    }else if(type=='group'){
        a.onmousedown = function (e) {
            $.MouseMenu(CloudChat.GroupMenu, this, CloudChat.GroupMenuFunc, e)
        };
    }else if(type=='discuss'){
        a.onmousedown = function (e) {
            $.MouseMenu(CloudChat.DiscussMenu, this, CloudChat.DiscussMenuFunc, e)
        };
    }
};
CloudChat.ShowInfo=function (a) {
    CloudChat.InfoPanel.style.display='block';
    if(CloudChat.InfoPanel.data===a.data.userid&&CloudChat.InfoPanel.type===a.data.type){
        return false;
    }
    for(var i=0;i<CloudChat.InfoPanel.List.length;i++){
        CloudChat.InfoPanel.List[i].style.display='none';
    }
    CloudMain.Ajax({
        url:"/service/chat/ContactInfo",
        data: {
            ContactType:a.data.type,
            id:a.data.userid
        },
        success: function (rs) {
            var list=null;
            if(a.data.type!=='discuss'){
                CloudChat.InfoPanel.Head.style.display='block';
                CloudChat.InfoPanel.Head1.style.display='none';
            }else {
                CloudChat.InfoPanel.Head.style.display='none';
                CloudChat.InfoPanel.Head1.style.display='block';
            }
            if(a.data.type==='friend'){
                CloudChat.InfoPanel.Head.src=CloudMain.ServerUrl+'/'+rs.userhead;
                CloudChat.InfoPanel.List[0].style.display='block';
                list=CloudChat.InfoPanel.List[0].getElementsByTagName('p');
                list[0].innerHTML=rs.username;
                list[1].innerHTML='账号：'+rs.usernum;
                list[2].innerHTML='备注：'+rs.nickname;
                list[3].innerHTML='分组：'+rs.usersort;
                list[4].innerHTML='生日：'+rs.birthday;
                list[5].innerHTML='信息：'+rs.info.split('/')[1]+' '+$.Time.age(rs.info.split('/')[0])+'岁';
                list[6].innerHTML='个人签名：'+rs.underwrite;
            }else if(a.data.type==='group'){
                CloudChat.InfoPanel.Head.src=CloudMain.ServerUrl+'/'+rs.group_head;
                CloudChat.InfoPanel.List[1].style.display='block';
                list=CloudChat.InfoPanel.List[1].getElementsByTagName('p');
                list[0].innerHTML=rs.groupname;
                list[1].innerHTML='群号码：'+rs.groupnum;
                list[2].innerHTML='群简介：'+rs.group_depict;
                list[3].innerHTML='成立时间：'+rs.group_time;
                list[4].innerHTML='群人数：'+rs.people;
                list=CloudChat.InfoPanel.List[1].getElementsByTagName('ul')[0];
                list.innerHTML='';
                for(var k=0;k<rs.member.length;k++){
                    var li=$.CreateElement({
                        tag: "li",
                        node: list
                    });
                    $.CreateElement({
                        tag: "img",
                        attr:{"src":CloudMain.ServerUrl+'/'+rs.member[k].userhead},
                        node: li
                    });
                    $.CreateElement({
                        tag: "p",
                        html:rs.member[k].username,
                        node: li
                    });
                }
            }else if(a.data.type==='discuss'){
                for(var j=0;j<rs.userhead.length;j++){
                    $.CreateElement({
                        tag: "div",
                        style:{"background":"url("+CloudMain.ServerUrl+'/'+rs.userhead[j].image+")"},
                        node: CloudChat.InfoPanel.Head1
                    });
                }
                var d=CloudChat.InfoPanel.Head1.getElementsByTagName('div');
                switch(rs.userhead.length){
                    case 1:
                        d[0].className='discussHead0';
                        break;
                    case 2:
                        d[0].className='discussHead1';
                        d[1].className='discussHead1';
                        break;
                    case 3:
                        d[0].className='discussHead1';
                        d[1].className='discussHead3';
                        d[2].className='discussHead3';
                        break;
                    case 4:
                        d[0].className='discussHead3';
                        d[1].className='discussHead3';
                        d[2].className='discussHead3';
                        d[3].className='discussHead3';
                }
                CloudChat.InfoPanel.List[2].style.display='block';
                list=CloudChat.InfoPanel.List[2].getElementsByTagName('p');
                list[0].innerHTML=rs.discussname;
                list[1].innerHTML='创建于：'+rs.createtime+' ('+rs.people+'人)';
                list=CloudChat.InfoPanel.List[2].getElementsByTagName('ul')[0];
                list.innerHTML='';
                for(var k=0;k<rs.member.length;k++){
                    var li=$.CreateElement({
                        tag: "li",
                        node: list
                    });
                    $.CreateElement({
                        tag: "img",
                        attr:{"src":CloudMain.ServerUrl+'/'+rs.member[k].userhead},
                        node: li
                    });
                    $.CreateElement({
                        tag: "p",
                        html:rs.member[k].username,
                        node: li
                    });
                }
            }
            CloudChat.InfoPanel.data=a.data.userid;
            CloudChat.InfoPanel.type=a.data.type;
        }
    });

};//联系人信息卡
CloudChat.Mange=function () {//好友管理使用的函数
    $.Window.NewWindow({
        id: 'CloudChatW',
        width: '700px',
        height: '500px',
        biggest:false,
        mini:false,
        title:'',
        state:'restore',
        bg:'url("./public/img/chat/CloudChat.png")',
        color:'#e6e6e6',
        callback:function (a) {
            var b=$.CreateElement({
                className:"CloudCMangeHead",
                node:a
            });
            $.CreateElement({
                className:"CloudCMangeHinfo",
                html:'好友管理',
                node:b
            });
            var search=$.CreateElement({
                tag:"input",
                attr:{"placeholder":"搜索好友"},
                node:b
            });
            search.onkeyup=function () {
                var key=this.value;
                if(key.length===0){
                    key='|*|'
                }
                RightList.innerHTML='';
                for(var i=0;i<CloudChat.Mange.Friend.length;i++){
                    if($.String.exist(CloudChat.Mange.Friend[i].Cloudid,key)||$.String.exist(CloudChat.Mange.Friend[i].username,key||$.String.exist(CloudChat.Mange.Friend[i].nickname,key))){
                        var rs=CloudChat.Mange.Friend[i];
                        CloudChat.Mange.PrintRlist(rs.username,rs.Cloudid,rs.friend_id,rs.nickname?rs.nickname:rs.username,rs.friend_list_name,rs.loginTime);
                    }
                }
                $.Time.friendly($(".CCRLInfoTime"));
            };
            $.CreateElement({
                tag:"ul",
                className:'CloudCMangeLeft',
                node:a
            });
            $.CreateElement({
                className:'CloudCMangeRHead',
                html:'<span><input id="CCMCheackAll" type="checkbox"></span><div class="CCMHFunc">昵称</div><div class="CCMHFunc">账号</div><div class="CCMHFunc">备注</div><div class="CCMHFunc">分组</div><div class="CCMHFunc" style="border: none">最后登录时间</div>',
                node:a
            });
            $.CreateElement({
                tag:"ul",
                className:'CloudCMangeRight',
                node:a
            });
            var LeftList=$(".CloudCMangeLeft")[0];
            var RightList=$(".CloudCMangeRight")[0];
            var CheckAll=$("#CCMCheackAll")[0];
            var CCMHFunc=$(".CCMHFunc");
            for(var i=0;i<CCMHFunc.length;i++){
                CCMHFunc[i].state='>';
                (function (i) {
                    CCMHFunc[i].onclick=function () {
                        switch (i){
                            case 0:
                                CloudChat.Mange.Sort('username',CCMHFunc[i]);
                                break;
                            case 1:
                                CloudChat.Mange.Sort('Cloudid',CCMHFunc[i]);
                                break;
                            case 2:
                                CloudChat.Mange.Sort('nickname',CCMHFunc[i]);
                                break;
                            case 3:
                                CloudChat.Mange.Sort('friend_list_name',CCMHFunc[i]);
                                break;
                            case 4:
                                CloudChat.Mange.Sort('loginTime',CCMHFunc[i]);
                                break;
                        }
                    }
                })(i)
            }
            CloudChat.Mange.Sort=function (key,btn) {
                if(CloudChat.Mange.Friend.length<2){
                    return false;
                }
                CheckAll.checked?CheckAll.click():"";
                var rs=SlimfArray.sort(CloudChat.Mange.Friend,key,btn.state);
                if(btn.state==='>'){
                    btn.state='<';
                }else{
                    btn.state='>';
                }
                RightList.innerHTML='';
                CloudChat.Mange.Friend=[];
                var username,Cloudid,friend_id,nickname,usersort,logintime;
                for(var i=0;i<rs.length;i++){
                    username=rs[i].username;
                    Cloudid=rs[i].Cloudid;
                    friend_id=rs[i].friend_id;//好友唯一id
                    nickname=rs[i].nickname;
                    usersort=rs[i].friend_list_name;
                    logintime=rs[i].loginTime;
                    CloudChat.Mange.Friend.push(rs[i]);
                    CloudChat.Mange.PrintRlist(username,Cloudid,friend_id,nickname,usersort,logintime);
                }
                $.Time.friendly($(".CCRLInfoTime"));
                if(search.value.length){
                    search.onkeyup();
                }
            };
            CheckAll.onclick=function () {
                var check=document.getElementsByClassName('CCMCheck');
                for(var i=0;i<check.length;i++){
                    if(CheckAll.checked && !check[i].checked){
                        check[i].click();
                    }else if(!CheckAll.checked  && check[i].checked){
                        check[i].click();
                    }
                }
            };
            CloudChat.Mange.Friend=[];
            CloudChat.Mange.start=function () {
                CloudMain.Ajax({
                    url: "/service/chat/GetfriendList",
                    success: function (rs) {
                        var list_id,list_name,all_count=CloudChat.FriendSort[0].data.list.children.length+CloudChat.FriendSort[1].data.list.children.length;
                        var a=CloudChat.Mange.PrintList(-1,'全部好友'+' ('+all_count+')');
                        a.className='';
                        for(var k=0;k<CloudChat.NormalSort.length;k++){
                            CloudChat.Mange.PrintList(CloudChat.NormalSort[k].list_id,CloudChat.NormalSort[k].list_name)
                        }
                        for(var i=0;i<rs.length;i++){
                            list_name=rs[i].list_name+' ('+rs[i].count+')';
                            list_id=rs[i].list_id;
                            all_count=all_count+rs[i].count;
                            CloudChat.Mange.PrintList(list_id,list_name);
                        }
                        a.innerHTML='<div class="CCMLActive">全部好友'+' ('+all_count+')</div>';
                        CloudChat.Mange.GetRList(-1);
                    }
                });
            };
            CloudChat.Mange.GetRList=function (id) {
                CloudChat.Mange.Friend=[];
                RightList.innerHTML='<span class="CloudChatLoading">Loading</span>';
                CloudMain.Ajax({
                    url: "/service/chat/GetListSubFriend",
                    data: {
                        id:id
                    },
                    success: function (rs) {
                        RightList.innerHTML='';
                        if(rs.length===0){
                            RightList.innerHTML='<p style="margin: 30px auto; color: #6b6b6b;text-align: center">没有可显示的数据</p>'
                            return false;
                        }
                        var username,Cloudid,friend_id,nickname,usersort,logintime;
                        for(var i=0;i<rs.length;i++){
                            rs[i].username=username='<img src='+rs[i].userhead+'><span>'+rs[i].username+'</span>';
                            Cloudid=rs[i].Cloudid;
                            friend_id=rs[i].friend_id;//好友唯一id
                            nickname=rs[i].nickname?rs[i].nickname:rs[i].username;
                            usersort=rs[i].friend_list_name;
                            logintime=rs[i].loginTime;
                            CloudChat.Mange.Friend.push(rs[i]);
                            CloudChat.Mange.PrintRlist(username,Cloudid,friend_id,nickname,usersort,logintime);
                        }
                        $.Time.friendly($(".CCRLInfoTime"));
                        if(search.value.length){
                            search.onkeyup();
                        }
                    }
                });
            };
            CloudChat.Mange.PrintList=function (list_id,list_name) {
                if(list_id===1){
                    list_name=list_name+' ('+CloudChat.FriendSort[0].data.list.children.length+')';
                }
                if(list_id===0){
                    list_name=list_name+' ('+CloudChat.FriendSort[1].data.list.children.length+')';
                }
                var a=$.CreateElement({
                    tag:"li",
                    className:'p15',
                    node:LeftList
                });
                a.data=list_id;
                a.onclick=function () {
                    var b=LeftList.getElementsByTagName('li');
                    for(var i=0;i<b.length;i++){
                        b[i].getElementsByTagName('div')[0].className='';
                    }
                    a.getElementsByTagName('div')[0].className='CCMLActive';
                    CloudChat.Mange.GetRList(a.data);
                    CheckAll.checked?CheckAll.click():"";
                };
                $.CreateElement({
                    html:list_name,
                    node:a
                });
                return a;
            };
            CloudChat.Mange.PrintRlist=function (username,Cloudid,friend_id,nickname,usersort,logintime) {
                var a=$.CreateElement({
                    tag:"li",
                    node:RightList
                });
                var b=$.CreateElement({
                    tag:"input",
                    className:'CCMCheck',
                    attr:{"type":"checkbox"},
                    node:a
                });
                b.onclick=function () {
                    if(this.checked){

                    }
                };
                $.CreateElement({
                    className:'CCRLInfo',
                    html:username,
                    node:a
                });
                $.CreateElement({
                    className:'CCRLInfo',
                    html:Cloudid,
                    node:a
                });
                $.CreateElement({
                    className:'CCRLInfo',
                    html:nickname,
                    node:a
                });
                $.CreateElement({
                    className:'CCRLInfo',
                    html:usersort,
                    node:a
                });
                $.CreateElement({
                    className:'CCRLInfo CCRLInfoTime',
                    attr:{"timeago":logintime},
                    html:logintime,
                    node:a
                })
            };
            CloudChat.Mange.start();
        }
    });
};
CloudChat.RequestMange=function () {
    $.Window.NewWindow({
        id: 'CloudChatRW',
        width: '600px',
        height: '450px',
        biggest:false,
        mini:false,
        resize:false,
        title:'',
        bg:'url("./public/img/chat/CloudChat.png")',
        color:'#e6e6e6',
        callback:function (a) {
            var b=$.CreateElement({
                className:"CloudCMangeHead",
                node:a
            });
            $.CreateElement({
                className:"CloudCMangeHinfo",
                html:'验证消息管理',
                node:b
            });
            var c=$.CreateElement({
                tag:"ul",
                className:'CloudChatRWUl',
                node:a
            });
            for(var i=0;i<CloudChat.RequestList.length;i++){
                (function (i) {
                    var aa=$.CreateElement({
                        tag:"li",
                        node:c
                    });
                    $.CreateElement({
                        tag:"img",
                        attr:{"src":CloudChat.RequestList[i].userhead},
                        node:aa
                    });
                    $.CreateElement({
                        tag:"span",
                        html:CloudChat.RequestList[i].username,
                        node:aa
                    });
                    var bb=$.CreateElement({
                        tag: "span",
                        className: 'CloudChatRWInfo',
                        html: '请求添加您为好友',
                        node: aa
                    });
                    $.CreateElement({
                        tag:"button",
                        html:'同意',
                        node:aa
                    }).onclick=function () {
                        CloudChat.RequestMange.post(CloudChat.RequestList[i].infoid,CloudChat.RequestList[i].userid,CloudChat.RequestList[i].type,1,aa)
                    };
                    $.CreateElement({
                        tag:"button",
                        html:'拒绝',
                        node:aa
                    }).onclick=function () {
                        CloudChat.RequestMange.post(CloudChat.RequestList[i].infoid,CloudChat.RequestList[i].userid,CloudChat.RequestList[i].type,-1,aa)
                    };
                    if(CloudChat.RequestList[i].type==='group') {
                        bb.innerHTML='请求加入 '+CloudChat.RequestList[i].to
                    }
                    $.CreateElement({
                        tag: "p",
                        html: '验证消息：'+CloudChat.RequestList[i].description,
                        node: aa
                    });
                }(i))
            }
        }
    });
    CloudChat.RequestMange.post=function (infoid,uid,ftype,agree,a) {
        var request=null;
        CloudMain.Ajax({
            url:"/service/chat/ReplyContactRequest",
            data: {
                uid:uid,
                ftype:ftype,
                agree:agree,
                infoid:infoid
            },
            success: function(rs) {
                rs=rs[0].state;
                if(rs===1||rs===2){
                    CloudChat.Toast('操作成功');
                    if(rs===1){
                        request = '{"type":"requestSuccess","uuid":"'+uid+'"}';
                        CloudChat.serve.send(request);//发送消息
                        CloudChat.GetfriendList()
                    }else{
                        request = '{"type":"newRequest","uuid":"'+uid+'","NewType":"'+'no'+'"}';
                        CloudChat.serve.send(request);//发送消息
                    }
                    for(var i=0;i<CloudChat.RequestList.length;i++){
                        if(CloudChat.RequestList[i].userid===uid){
                            var count=i;
                            CloudChat.RequestList.splice(count, 1);
                        }
                    }
					a.remove();
                    if(!CloudChat.RequestList.length){
                        $.Window.Close($("#CloudChatRW")[0]);
                    }
                }else{
                    CloudChat.Toast('操作失败');
                }
            }
        });
    };
};
CloudChat.GetFriendRequest=function () {
    CloudMain.Ajax({
        url:"/service/chat/GetContactRequest",
        success: function (rs) {
            CloudChat.RequestList=[];
            CloudChat.UserMenuList[1].getElementsByTagName('span')[0].innerHTML=CloudChat.UserRCount.innerHTML=rs.length?rs.length:'';
            for(var i=0;i<rs.length;i++){
                CloudChat.RequestList.push(rs[i]);
            }
        }
    });
};
CloudChat.GetOldMsg=function () {
    if(CloudChat.LoadFlag){
        CloudMain.Ajax({
            url:"/service/chat/GetHistoryMessages",
            success: function(rs) {
                CloudChat.MsgLIst.innerHTML='';
                var bb=CloudChat.Main.getElementsByClassName('CloudChatList');
                if(!rs===[]){
                    CloudChat.SwitchBtn[1].click();
                }
                for(var i in rs){
                    a=rs[i];
                    for (var k = 0; k < bb.length; k++) {
                        if(a.geter===CloudChat.Sender.uid){
                            a.geter=a.sender;
                        }
                        if (bb[k].data.userid === a.geter && bb[k].data.type === a.mtype) {
                            bb[k].ondblclick();
                            CloudChat.InfoPanel.data=null;
                            CloudChat.PrintMsg(a.username, CloudMain.ServerUrl+'/'+a.userhead, a.content, a.mtype + '_' + a.geter,true);
                        }
                    }
                }
            }
        });
        CloudChat.LoadFlag=false;
    }
};
/*右键菜单方法*/
CloudChat.SortMenuFunc=function (this_sort) {//好友分组右键菜单。传入该分组
    if(this_sort.data.id=='1'||this_sort.data.id=='0'){
        $("#CCDelete")[0].className=$("#CCRename")[0].className='CloudChatDisabld';
    }else{
        $("#CCDelete")[0].className=$("#CCRename")[0].className='';
    }
    CloudChat.SortMenuFunc.Refuse=function () {
        CloudChat.GetfriendList();
    };
    CloudChat.SortMenuFunc.Add=function () {
        CloudChat.SortMenuFunc.Add.Sub=function (a) {
            var CCNSortName=$("#CCNSortName")[0];
            if(!CCNSortName.value.length){
                CloudChat.Toast('请输入分组名');
                return false
            }
            CloudMain.Ajax({
                url:"/service/chat/AddContactList",
                data: {
                    name:CCNSortName.value
                },
                success: function (rs) {
                    if(rs.state){
                        CloudChat.Toast('分组已存在');
                        CCNSortName.value='';
                    }else{
                        CloudChat.PrintFriendList(rs.list_id,rs.list_name);
                        $.Window.Close(a);
                    }
                }
            });
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '添加分组',
            notic: '请给分组取一个名字',
            submit_func: CloudChat.SortMenuFunc.Add.Sub,
            confirm_input: 'CCNSortName'
        });
    };
    CloudChat.SortMenuFunc.Rename=function () {
        CloudChat.SortMenuFunc.Rename.flag=true;
        if(this_sort.data.id===1||this_sort.data.id===0){
            return false;
        }
        CloudChat.SortMenuFunc.Rename.Sub=function (a) {
            var CCSortName=$("#CCSortName")[0];
            if(!CCSortName.value.length){
                CloudChat.Toast('请输入分组名');
                return false
            }
            CloudChat.SortMenuFunc.Rename.flag=true;
            for(var i=0;i<CloudChat.FriendSort.length;i++){
                if(CloudChat.FriendSort[i].data.name===CCSortName.value){
                    CloudChat.Toast('分组名已存在');
                    CloudChat.SortMenuFunc.Rename.flag=false;
                    return false;
                }
            }
            if(CloudChat.SortMenuFunc.Rename.flag) {
                CloudMain.Ajax({
                    url: "/service/chat/RenameContactList",
                    data: {
                        id: this_sort.data.id,
                        name: CCSortName.value
                    },
                    success: function (rs) {
                        if (rs.state === 1) {
                            this_sort.data.name = CCSortName.value;
                            this_sort.getElementsByTagName('p')[0].innerHTML = CCSortName.value;
                            $.Window.Close(a);
                        } else {
                            CloudChat.Toast('修改失败');
                            $.Window.Close(a);
                        }
                    }
                });
            }
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '分组重命名',
            notic: '分组新命名',
            submit_func: CloudChat.SortMenuFunc.Rename.Sub,
            confirm_input: 'CCSortName',
            confirm_input_val:this_sort.data.name
        });
    };
    CloudChat.SortMenuFunc.Delete=function () {
        if(this_sort.data.id===1||this_sort.data.id===0){
            return false;
        }
        CloudChat.SortMenuFunc.Delete.Sub=function (a) {
            CloudMain.Ajax({
                url:"/service/chat/DeleteContactList",
                data: {
                    id: this_sort.data.id
                },
                success: function (rs) {
                    if (rs.state === 1) {
						this_sort.remove();
                    }else{
                        CloudChat.Toast('删除失败');
                    }
                }
            });
            $.Window.Close(a)
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '删除分组',
            notic: '确认删除 '+this_sort.data.name+' 这个分组，该分组内的所有好友将移动到未分组',
            submit_func: CloudChat.SortMenuFunc.Delete.Sub
        });
    };
    CloudChat.SortMenuFunc.Mange=function () {
        CloudChat.Mange();
    }
};
CloudChat.ContactMenuFunc=function (thisContact) {//联系人右键菜单
    CloudChat.ContactMenuFunc.SetNick=function () {
        CloudChat.ContactMenuFunc.SetNick.Sub=function (a) {
            var name=$("#CCNNickName")[0];
            if(name.value==''){
                name.value=thisContact.data.username;
            }
            CloudMain.Ajax({
                url: "/service/chat/UpdateContactNickName",
                data: {
                    id:thisContact.data.friend_id,
                    name:name.value
                },
                success: function (rs) {
                    if(rs.state){
                        thisContact.data.nickname=name.value;
                        thisContact.getElementsByTagName('span')[0].innerHTML=thisContact.data.nickname+' ('+thisContact.data.username+')';
                    }else{
                        CloudChat.Toast('修改失败')
                    }
                    $.Window.Close(a);
                }
            });
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '修改备注',
            notic: '请输入备注名,输入空值将取消备注',
            submit_func: CloudChat.ContactMenuFunc.SetNick.Sub,
            confirm_input: 'CCNNickName',
            confirm_input_val:thisContact.data.nickname
        });
    };
    CloudChat.ContactMenuFunc.ChangeSort=function () {
        CloudChat.ContactMenuFunc.ChangeSort.data=null;
        CloudChat.ContactMenuFunc.ChangeSort.Sub=function (a) {
            if(CloudChat.ContactMenuFunc.ChangeSort.data===thisContact.data.list_id||CloudChat.ContactMenuFunc.ChangeSort.data===null){
                $.Window.Close(a);
                return false;
            }
            CloudMain.Ajax({
                url:"/service/chat/UpdateContactList",
                data: {
                    fid:thisContact.data.friend_id,
                    id:CloudChat.ContactMenuFunc.ChangeSort.data
                },
                success: function (rs) {
                    CloudChat.PrintFriends('friend',thisContact.data.userid,CloudChat.ContactMenuFunc.ChangeSort.data,thisContact.data.username,thisContact.data.nickname,thisContact.data.userhead,thisContact.data.info,thisContact.data.friend_id);
					thisContact.remove();
                    $.Window.Close(a);
                }
            });
        };
        CloudChat.ContactMenuFunc.ChangeSort.print=function (node,id,name) {
            var a=$.CreateElement({
                tag:"li",
                className:'ChangeSort',
                html:name,
                node:node
            });
            a.data=id;
            a.onmousedown=function () {
                var b=$(".ChangeSort");
                for(var i=0;i<b.length;i++){
                    b[i].className='ChangeSort';
                }
                CloudChat.ContactMenuFunc.ChangeSort.data=this.data;
                this.className='ChangeSort CCRMouseSelect';
            };
        };
        CloudChat.ContactMenuFunc.ChangeSort.load=function (a) {
            CloudMain.Ajax({
                url: "/service/chat/GetfriendList",
                success: function (rs) {
                    a=$.CreateElement({
                        tag:"ul",
                        style:{"margin-top":"5px"},
                        node:a
                    });
                    var list_id,list_name;
                    for(var k=0;k<CloudChat.NormalSort.length;k++){
                        CloudChat.ContactMenuFunc.ChangeSort.print(a,CloudChat.NormalSort[k].list_id,CloudChat.NormalSort[k].list_name)
                    }
                    for(var i=0;i<rs.length;i++){
                        list_name=rs[i].list_name;
                        list_id=rs[i].list_id;
                        CloudChat.ContactMenuFunc.ChangeSort.print(a,list_id,list_name);
                    }
                }
            });
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '修改分组',
            notic: '选择一个分组',
            submit_func: CloudChat.ContactMenuFunc.ChangeSort.Sub,
            callback:CloudChat.ContactMenuFunc.ChangeSort.load
        });
    };
    CloudChat.ContactMenuFunc.Delete=function () {
        var notic='';
        if(thisContact.data.type==='friend'){
            notic='确认将 '+thisContact.data.username+' 从联系人列表删除';
        }else if(thisContact.data.type==='group'){
            notic='确认退出 '+thisContact.data.username+' 这个群？<br>如果您是群主，退出后该群将解散';
        }else if(thisContact.data.type==='discuss'){
            notic='确认离开 '+thisContact.data.username+' 这个多人聊天？';
        }
        CloudChat.ContactMenuFunc.Delete.Sub=function (a) {
            CloudMain.Ajax({
                url: "/service/chat/DeleteContact",
                data: {
                    ftype:thisContact.data.type,
                    fid:thisContact.data.friend_id,
                    uid:thisContact.data.userid
                },
                success: function (rs) {
                    if(rs.state){
						thisContact.remove();
                    }else{
                        CloudChat.Toast('操作失败');
                    }
                }
            });
            $.Window.Close(a);
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '删除联系人',
            notic: notic,
            submit_func: CloudChat.ContactMenuFunc.Delete.Sub
        });
    }
};
CloudChat.GroupMenuFunc=function (thisGroup) {//群右键菜单
    CloudChat.GroupMenuFunc.SetNick=function () {
        CloudChat.ContactMenuFunc(thisGroup);
        CloudChat.ContactMenuFunc.SetNick();
    };
    CloudChat.GroupMenuFunc.Exit=function () {
        CloudChat.ContactMenuFunc(thisGroup);
        CloudChat.ContactMenuFunc.Delete();
    }
};
CloudChat.DiscussMenuFunc=function (thisDiscuss) {//多人聊天右键菜单
    CloudChat.DiscussMenuFunc.ReTitle=function () {
        CloudChat.DiscussMenuFunc.ReTitle.Sub=function (a) {
            var name=$("#CCNDNickName")[0];
            if(name.value===''){
                name.value=thisDiscuss.data.username;
            }
            CloudMain.Ajax({
                url: "/service/chat/UpdateDiscussTopic",
                data: {
                    id:thisDiscuss.data.userid,
                    name:name.value
                },
                success: function (rs) {
                    if(rs.state){
                        thisDiscuss.data.username=name.value;
                        thisDiscuss.getElementsByTagName('span')[0].innerHTML=thisDiscuss.data.username;
                    }else{
                        CloudChat.Toast('修改失败')
                    }
                    $.Window.Close(a);
                }
            });
        };
        $.Confirm({
            id: 'CloudChatConfirm',
            node: CloudChat.Main,
            title: '多人讨论主题',
            notic: '请输入讨论组主题',
            submit_func: CloudChat.DiscussMenuFunc.ReTitle.Sub,
            confirm_input: 'CCNDNickName',
            confirm_input_val:thisDiscuss.data.username
        });
    };
    CloudChat.DiscussMenuFunc.Exit=function () {
        CloudChat.ContactMenuFunc(thisDiscuss);
        CloudChat.ContactMenuFunc.Delete();
    };
};
CloudChat.MsgLMenuFunc=function (thisList) {
    CloudChat.MsgLMenuFunc.Close=function () {
        thisList.getElementsByTagName('button')[0].click()
    };
    CloudChat.MsgLMenuFunc.CloseAll=function () {
        CloudChat.ChatWindowHead.innerHTML=CloudChat.MsgLIst.innerHTML='';
        Array.prototype.forEach.call($('.CloudChatChangeArea'), function (elm) {
			elm.remove();
        });
    };
};
CloudChat.Emoji=function (node,area) {
    var m=$.CreateElement({
        className:'ChatemojiArea',
        attr:{"tabindex":-1},
        node:node
    });
    m.focus();
    m.onblur=function () {
        m.className='ChatemojiArea animated fadeOutDown';
        var b=setTimeout(function () {
            m.style.display='none';
            clearTimeout(b)
        },300);
    };
    for(var i = 0; i < 7; i++) {
        for(var jj= 0; jj < 27; jj++) {
            var aa=$.CreateElement({
                tag:'a',
                attr:{"href":"javascript:;"},
                node:m
            });
            aa.onclick=function () {
                area.innerHTML+=this.innerHTML.replace(/\"/g,"'");
                m.onblur();
            };
            $.CreateElement({
                tag:'img',
                className:'chatEmoji',
                attr:{'src':'./public/img/chat/blank.gif'},
                style:{'background-position-X':25 * jj + 'px','background-position-y':-25 * i + 'px'},
                node:aa
            });
        }
    }
    return m;
};
/*聊天开始处理*/
CloudChat.SendMeg=function (geter,sender,mtype,content) {
    contents=content.innerHTML;
    if(!CloudChat.SocketLink){
        CloudChat.Toast('服务器未连接,消息服务不可用',true);
        return false;
    }
    if(!contents.length){
        CloudChat.Toast('请输入消息内容');
        return false;
    }
    var msg = '{"type":"messages","uuid":"'+sender.uid+'","touuid":"'+geter.uid+'","content":"'+contents+'","senderHead":"'+sender.uhead+'","senderName":"'+sender.uname+'","mtype":"'+mtype+'"}';
    CloudChat.serve.send(msg);//发送消息
    content.innerHTML='';
    CloudChat.PrintMsg(sender.uname,sender.uhead,contents,mtype+'_'+geter.uid);
    $.Request.post(CloudMain.ServerUrl+"/service/chat/SendMessages",{'send':sender.uid,"get":geter.uid,"content":contents,"mtype":mtype});
};
CloudChat.PrintMsg=function (sendername,senderhead,content,area,flag) {
    var aa=CloudChat.Main.getElementsByClassName('CloudCMsgList');
    var node=$("#area"+area)[0], ptype = 'send';
    var nodes=node.parentNode.getElementsByClassName('CCInputArea')[0];
    var mlisttype=area.split('_')[0];
    var mlistid=area.split('_')[1];
    var v=sendername+':'+content;
    if(mlisttype!=='friend'){
        for(var i=0;i<aa.length;i++){
            if(aa[i].data.uid===mlistid){
                aa[i].data.message.innerHTML=v;
            }
        }
    }else{
        for(var i=0;i<aa.length;i++){
            if(aa[i].data.uid===mlistid){
                aa[i].data.message.innerHTML=content;
            }
        }
    }
    if (sendername!== CloudChat.Sender.uname) {
        ptype = 'get';
    } else {
        ptype = 'send';
    }
    var a = $.CreateElement({
        className: 'CMcontainer',
        node: node
    });
    var b = $.CreateElement({
        className: 'CMessageShow'+ ptype,
        node: a
    });
    $.CreateElement({
        tag: "img",
        className: 'CMessageShowHead'+ ptype,
        attr: {"src": senderhead,"draggable":"false"},
        node: b
    });
    $.CreateElement({
        className: 'CMessageShowContentRandom'+ ptype,
        node: b
    });
    $.CreateElement({
        className: 'CMessageShowContent'+ ptype,
        html:content,
        node: b
    });
    if(CloudChat.ToggleW!==area&&!flag){
        for(var i=0;i<aa.length;i++){
            if(aa[i].data.uid===mlistid){
                aa[i].data.count++;
                CloudChat.AllMsgCount++;
                CloudChat.AllMsgCountContainer.innerHTML=CloudChat.AllMsgCount===0?"":CloudChat.AllMsgCount;
                aa[i].data.msg_count.innerHTML=aa[i].data.count;
            }
        }
        if(nodes.getElementsByClassName('CCCTips')[0]){
        }else {
            var a_tips=$.CreateElement({
                className: "CCCTips",
                html: "<img src='" + senderhead + "'>" +sendername+":"+content,
                node: nodes
            });
            a_tips.onclick=function () {
				a_tips.remove();
                node.scrollTop=node.scrollHeight;
            }
        }
    }else{
        node.scrollTop=node.scrollHeight;
    }
};
CloudChat.PreChat=function (uid,utype,rs) {
    CloudChat.SwitchBtn[0].click();
    if(utype==='friend') {
        rs.nickname !== ' ' ? rs.username = rs.nickname : "";
    }
    CloudChat.ChatWindowHead.innerHTML=rs.username;
    var aa=CloudChat.MsgLIst.getElementsByTagName('li');
    if(aa.length){
        for(var i = 0; i <aa.length; i++){
            if(aa[i].data.uid===uid&&aa[i].data.type===utype){
                aa[i].onclick();
                return;
            }
        }
        CloudChat.CreateNewCwindow(uid, utype, rs.username, rs.info, rs.userhead);
    }
    else{
        CloudChat.CreateNewCwindow(uid, utype, rs.username, rs.info, rs.userhead);
    }
};
CloudChat.CreateNewCwindow=function (uid,utype,uname,uinfo,uhead) {
    var geter={
        uid:uid,
        utype:utype,
        uname:uname,
        uhead:uhead
    };
    var func=[
        {"name":"sf-icon-smile"},
        {"name":"sf-icon-image"},
        {"name":"sf-icon-folder"}
    ];
    var button=[];
    var a=$.CreateElement({
        tag:"li",
        attr:{"ripple":""},
        className:'CloudCMsgList',
        node:CloudChat.MsgLIst
    });
    if(utype!=='discuss') {
        var u_head=$.CreateElement({
            tag: "img",
            attr: {"src": uhead, "draggable": false},
            node: a
        });
    }
    else{
        var u_head=$.CreateElement({
            className:'discussHead',
            node: a
        });
        for(var j=0;j<uhead.length;j++){
            $.CreateElement({
                tag: "div",
                style:{"background":"url("+uhead[j].image+")"},
                node: u_head
            });
        }
        var d=u_head.getElementsByTagName('div');
        switch(uhead.length){
            case 1:
                d[0].className='discussHead0';
                break;
            case 2:
                d[0].className='discussHead1';
                d[1].className='discussHead1';
                break;
            case 3:
                d[0].className='discussHead1';
                d[1].className='discussHead3';
                d[2].className='discussHead3';
                break;
            case 4:
                d[0].className='discussHead3';
                d[1].className='discussHead3';
                d[2].className='discussHead3';
                d[3].className='discussHead3';
        }
    }
    $.CreateElement({
        tag:"p",
        html:uname,
        node:a
    });
    var a_message=$.CreateElement({
        tag:"p",
        className:'CloudCMsgListM',
        node:a
    });
    var msg_count=$.CreateElement({
        tag:"span",
        node:a
    });
    var a_close=$.CreateElement({
        tag:"button",
        style:{"display":"none"},
        className:'sf-icon-times',
        node:a
    });
    var b=$.CreateElement({
        className:'CloudChatChangeArea',
        node:CloudChat.ChatWindow
    });
    b=$.CreateElement({
        className:'CCCA',
        node:b
    });
    var msg_area=$.CreateElement({
        id:'area'+utype+'_'+uid,
        className:'CCMessageArea',
        node:b
    });
    var text_area=$.CreateElement({
        className:'CCInputArea',
        node:b
    });
    var c=$.CreateElement({
        className:'CCInputAreaHead',
        node:text_area
    });
    for(var i=0;i<func.length;i++){
        var d=$.CreateElement({
            tag:"span",
            className:func[i].name,
            node:c
        });
        button.push(d)
    }
    var e=$.CreateElement({
        tag:"button",
        html:'消息记录<i class="sf-icon-chevron-down"></i>',
        node:c
    });
    e.data= {
        "page":1,
        "count":0,
        "AllCount":0
    };
    if(utype!=='friend'){
        msg_area.style.width=text_area.style.width='499px';
        var g_area=$.CreateElement({
            className:'CCGroupInfo',
            node:b
        });
        var g_button=$.CreateElement({
            tag:"button",
            html:">",
            attr:{"tooltip":"收起/显示侧边"},
            node:g_area
        });
        var g_banner=$.CreateElement({
            className:'CCGroupBanner',
            node:g_area
        });
        g_area=$.CreateElement({
            tag:"ul",
            html:"<p>成员</p>",
            node:g_area
        });
        g_button.onclick=function () {
            if(g_area.parentNode.offsetWidth!==1) {
                this.innerHTML='<';
                this.className='CCGroupInfoButton';
                msg_area.style.width=text_area.style.width = '100%';
                g_area.parentNode.style.width = '0';
            }else{
                this.innerHTML='>';
                this.className='';
                msg_area.style.width=text_area.style.width = '499px';
                g_area.parentNode.removeAttribute('style');
            }
        };
        CloudMain.Ajax({
            url: "/service/chat/ContactInfo",
            data: {
                id:uid,
                ContactType:utype
            },
            success: function (rs) {
                for(var k=0;k<rs.member.length;k++){
                    var li=$.CreateElement({
                        tag: "li",
                        node: g_area
                    });
                    $.CreateElement({
                        tag: "img",
                        attr:{"src":CloudMain.ServerUrl+'/'+rs.member[k].userhead},
                        node: li
                    });
                    $.CreateElement({
                        tag: "p",
                        html:rs.member[k].username,
                        node: li
                    });
                }
            }
        });
    }
    var e_a=$.CreateElement({
        className:'CCMessageHistory',
        node:b.parentNode
    });
    var e_a_h=$.CreateElement({
        className:"CCMessageHistoryHead",
        node:e_a
    });
    $.CreateElement({
        tag:"input",
        attr:{"type":"text","placeholder":"搜索"},
        node:e_a_h
    });
    var e_a_m=$.CreateElement({
        className:"CCMessageHistoryMain",
        node:e_a
    });
    e.area=e_a_m;
    var f=$.CreateElement({
        className:'CCInputAreaEditor',
        attr:{"contenteditable":true},
        node:c.parentNode
    });
    var g=$.CreateElement({
        tag:"button",
        className:'CCInputSend',
        html:'发送',
        node:c.parentNode
    });
    var h=CloudChat.Emoji(b,f);
    a.data={
        "uid":uid,
        "uname":uname,
        "type":utype,
        "uhead":u_head,
        "count":0,
        "message":a_message,
        "msg_count":msg_count,
        "area":b.parentNode,
        "emoji":h
    };
    b.data={
        "uid":uid,
        "width":b.offsetWidth
    };
    button[0].onclick=function (ev) {
        ev.stopPropagation();
        if(a.data.emoji.offsetWidth){
            a.data.emoji.onblur();
        }else{
            a.data.emoji.className='ChatemojiArea animated fadeInUp';
            a.data.emoji.style.display='block';
        }
    };
    button[1].onclick=function (ev) {
        ev.stopPropagation();
        CloudChat.Toast('敬请期待')
    };
    button[2].onclick=function (ev) {
        ev.stopPropagation();
        CloudChat.Toast('敬请期待')
    };
    a.onclick=function () {
        CloudChat.ToggleW=utype+'_'+uid;
        var aa=CloudChat.Main.getElementsByClassName('CloudChatChangeArea');
        var bb=CloudChat.Main.getElementsByClassName('CloudCMsgList');
        for(var i=0;i<aa.length;i++){
            aa[i].style.display='none';
            bb[i].className='CloudCMsgList';
        }
        CloudChat.ChatWindowHead.innerHTML=this.data.uname;
        this.className='CloudCMsgList CloudCMAct';
        this.data.area.style.display='block';
        CloudChat.AllMsgCount=CloudChat.AllMsgCount-this.data.count;
        CloudChat.AllMsgCountContainer.innerHTML=CloudChat.AllMsgCount===0?"":CloudChat.AllMsgCount;
        this.data.count=0;
        this.data.msg_count.innerHTML='';
    };
    a.onmouseover=function () {
        a_close.style.display='block';
    };
    a.onmouseout=function () {
        a_close.style.display='none';
    };
    a.onmousedown = function (e) {
        $.MouseMenu(CloudChat.MsgLMenu, this, CloudChat.MsgLMenuFunc, e)
    };
    a_close.onclick=function (e) {
        e.stopPropagation();
        CloudChat.ChatWindowHead.innerHTML='';
        this.parentNode.nextSibling?this.parentNode.nextSibling.click():"";
		a_close.parentNode.data.area.remove();
		a_close.parentNode.remove();
    };
    e.onclick=function () {
        var area=CloudChat.Main.parentNode.parentNode;
        if(e_a.offsetWidth){
            b.removeAttribute('style');
            e_a.style.display='none';
            area.style.width='870px'
        }else{
            if(g_area){g_area.parentNode.offsetWidth!==1?g_button.onclick():""};
            b.style.width=b.data.width+'px';
            e_a.style.display='block';
            area.style.width='1245px';
            e_a_m.innerHTML="<span class='CloudChatLoading'></span>";
            CloudChat.LoadHistory(uid,utype,this.data.page,this);
        }
    };
    g.onclick=function () {
        CloudChat.SendMeg(geter, CloudChat.Sender, utype, f)
    };
    f.onkeydown=function (e) {
        e = window.event||arguments[0];
        if(e.keyCode===13){
            window.event.returnValue = false;
            g.onclick();
        }
    };
    a.onclick();
};
/*查看聊天记录*/
CloudChat.LoadHistory=function(uid,utype,page,Chat){
    CloudMain.Ajax({
        url: "/service/chat/HistoryMessages",
        data: {
            uid:uid,
            utype:utype,
            page:page
        },
        success: function(rs) {
            if(rs.length){

            }
            var username,time,content;
            for(var i=0;i<rs.length;i++){
                Chat.data.count++;
                username=rs[i].username;
                time=rs[i].time;
                content=rs[i].content;
                CloudChat.PrintHistory(Chat.area,username,time,content);
            }
            Chat.data.AllCount=rs[0].count;
            console.log(rs);
        }
    });
};
CloudChat.PrintHistory=function (area,username,time,content) {
    $.CreateElement({
        node:area
    })
};
/*搜索好友*/
CloudChat.Search=function () {
    CloudChat.Search.Count=0;
    CloudChat.Search.AllCount=0;
    CloudChat.Search.PageNum=1;
    CloudChat.Search.LoadFlag=false;
    CloudChat.Search.SaveInfo=[];
    $.Window.NewWindow({
        id: 'CloudChatS',
        width: '680px',
        height: '155px',
        biggest:false,
        mini:false,
        resize:false,
        title:'',
        bg:'url("./public/img/chat/CloudChat.png")',
        color:'#e6e6e6',
        callback:function (a) {
            var b=$.CreateElement({
                className:"CloudChatSHead",
                node:a
            });
            var c=$.CreateElement({
                tag:"ul",
                node:b
            });
            var d=$.CreateElement({
                tag:"li",
                html:'找好友',
                style:{"color":"#2682fc"},
                attr:{"data":"输入CloudID/昵称","type":'friend'},
                node:c
            });
            var e=$.CreateElement({
                tag:"li",
                html:'找群',
                attr:{"data":"输入群号码/群名称","type":'group'},
                node:c
            });
            CloudChat.Search.stype='friend';
            d.onclick=e.onclick=function () {
                f.setAttribute("placeholder",this.getAttribute('data'));
                this===d? e.removeAttribute('style'): d.removeAttribute('style');
                this.style.color="#2682fc";
                CloudChat.Search.stype=this.getAttribute('type');
                CloudChat.Search.Count=0;
                CloudChat.Search.AllCount=0;
                CloudChat.Search.PageNum=1;
                CloudChat.Search.LoadFlag=false;
                if(f.value.length){
                    CloudChat.Search.start();
                }else{
                    h.innerHTML='';
                    a.parentNode.style.height='155px';
                }
            };
            $.CreateElement({
                tag:"span",
                className:'sf-icon-search',
                node:b
            });
            var f=$.CreateElement({
                tag:"input",
                attr:{"type":"text","placeholder":"输入CloudID/昵称","maxLength":50},
                node:b
            });
            var i=$.CreateElement({
                tag:"span",
                className:'sf-icon-times',
                node:b
            });
            i.onclick=function () {
                f.value='';
                this.style.display='none';
            };
            f.onkeyup=function () {
                if(this.value.length){
                    i.style.display='block';
                }else {
                    i.style.display='none';
                }
            };
            var g=$.CreateElement({
                tag:"button",
                html:"查找",
                node:b
            });
            var h=$.CreateElement({
                className:"CloudChatSMain",
                node:a
            });
            h.onmousewheel=function () {
                if (this.scrollTop + this.offsetHeight >= this.scrollHeight-32 && CloudChat.Search.Count < CloudChat.Search.AllCount) {
                    if(CloudChat.Search.LoadFlag) {
                        CloudChat.Search.PageNum++;
                        CloudChat.Search.start();
                    }
                }
            };
            g.onclick=function () {
                CloudChat.Search.Count=0;
                CloudChat.Search.AllCount=0;
                CloudChat.Search.PageNum=1;
                CloudChat.Search.LoadFlag=false;
                CloudChat.Search.start();
            };
            CloudChat.Search.SendCheck=function (a) {
                var info=document.getElementById('CloudChatCheckA').innerHTML;
                CloudMain.Ajax({
                    url: "/service/chat/SendFriendRequest",
                    data: {
                        info:info,
                        ftype:CloudChat.Search.stype,
                        id:CloudChat.Search.SaveInfo.id
                    },
                    success: function(rs) {
                        rs=rs[0].state;
                        switch (rs){
                            case -2:
                                CloudChat.Toast('不能添加自己为好友');
                                break;
                            case -1:
                                CloudChat.Toast('该联系人已经是您的好友，或好友申请已经发出');
                                break;
                            case 0:
                                CloudChat.Toast('好友申请发送失败');
                                break;
                            case 1:
                                CloudChat.Toast('好友申请已发出');
                                var request = '{"type":"newRequest","uuid":"'+CloudChat.Search.SaveInfo.id+'","NewType":"'+CloudChat.Search.stype+'"}';
                                CloudChat.serve.send(request);//发送消息
                                break;
                        }
                        $.Window.Close(a);
                    }
                });
            };
            CloudChat.Search.start=function () {
                CloudChat.Search.LoadFlag=false;
                if(!f.value.length){
                    CloudChat.Toast('请输入关键词');
                    return false
                }
                if(CloudChat.Search.PageNum===1){
                    a.parentNode.style.height='500px';
                    h.innerHTML='<span class="CloudChatLoading"></span>';
                }
                CloudMain.Ajax({
                    url: "/service/chat/SearchContact",
                    data: {
                        key:f.value,
                        search:CloudChat.Search.stype,
                        pageNum:CloudChat.Search.PageNum
                    },
                    success: function(rs) {
                        CloudChat.Search.LoadFlag=true;
                        if(CloudChat.Search.PageNum===1) {
                            h.innerHTML = '';
                            if(!rs.length){
                                h.innerHTML='<P style="text-align: center;margin-top: 50px;color: #8f8f8f;font-size: 16px;">没有找到符合搜索条件的信息</P>';
                                return false;
                            }
                        }
                        var id,name,head,info;
                        for(var i=0;i<rs.length;i++){
                            id=rs[i].userid;
                            name=rs[i].name;
                            head=CloudMain.ServerUrl+'/'+rs[i].userhead;
                            info=rs[i].info;
                            CloudChat.Search.Count++;
                            CloudChat.Search.print(id,name,head,info)
                        }
                        CloudChat.Search.AllCount=rs[0].count;
                    }
                });
                CloudChat.Search.LoadFlag=false;
            };
            CloudChat.Search.print=function (id,name,head,info) {
                if(CloudChat.Search.stype==='friend') {
                    var a = $.CreateElement({
                        className: 'CCSearchList',
                        node: h
                    });
                }else{
                    a = $.CreateElement({
                        className: 'CCSearchListGroup',
                        node: h
                    });
                }
                info=info.split('$');
                $.CreateElement({
                    tag:"img",
                    attr:{"src":head},
                    node:a
                });
                $.CreateElement({
                    tag:"p",
                    html:name+'('+info[2]+')',
                    node:a
                });
                if(CloudChat.Search.stype!=='friend') {
                    $.CreateElement({
                        tag:"span",
                        className:'sf-icon-users',
                        html:'&nbsp&nbsp'+info[3],
                        node:a
                    });
                    $.CreateElement({
                        tag:"span",
                        style:{"color":"#000"},
                        html:info[1],
                        node:a
                    });
                    $.CreateElement({
                        html:info[0],
                        node:a
                    });
                }
                else {
                    $.CreateElement({
                        tag:"span",
                        html:info[0]+' '+$.Time.age(info[1])+'岁',
                        node:a
                    });
                }
                var b=$.CreateElement({
                    tag:"button",
                    attr:{"data":CloudChat.Search.stype},
                    html:CloudChat.Search.stype==='friend'?'加好友':'加入群',
                    node:a
                });
                b.onclick=function () {
                    CloudChat.Search.SaveInfo={
                        "id":id,
                        "type":CloudChat.Search.stype
                    };
                    var type=this.getAttribute('data');
                    var a=$.Confirm({
                        id: 'CloudChatNewFriend',
                        width:'450px',
                        height:'350px',
                        node: document.body,
                        title: '添加联系人',
                        submit_func: CloudChat.Search.SendCheck
                    });
                    a=a.getElementsByClassName('SlimfConfirmNote')[0];
                    a.style.padding=0;
                    var b=$.CreateElement({
                        className:'CloudChatSearchCLeft',
                        node:a
                    });
                    var c=$.CreateElement({
                        className:'CloudChatSearchCRight',
                        node:a
                    });
                    $.CreateElement({
                        tag:"img",
                        attr:{"src":head,"draggable":"false"},
                        node:b
                    });
                    $.CreateElement({
                        tag:"p",
                        html:name,
                        style:{"font-weight":"bold"},
                        node:b
                    });
                    $.CreateElement({
                        tag:"p",
                        html:info[2],
                        node:b
                    });
                    if(type==='friend'){
                        $.CreateElement({
                            tag:"p",
                            html:'性别:'+info[0],
                            node:b
                        });
                        $.CreateElement({
                            tag:"p",
                            html:'年龄:'+$.Time.age(info[1])+'岁',
                            node:b
                        });
                        $.CreateElement({
                            tag:"p",
                            html:'签名:'+info[3],
                            node:b
                        });
                    }
                    else{
                        $.CreateElement({
                            tag:"p",
                            html:'成员:'+info[2]+'人',
                            node:b
                        });
                        $.CreateElement({
                            tag:"p",
                            html:'简介:'+info[1],
                            node:b
                        });
                    }
                    $.CreateElement({
                        tag:"p",
                        html:'请输入验证信息：',
                        node:c
                    });
                    $.CreateElement({
                        tag:"textarea",
                        id:"CloudChatCheckA",
                        html:"我是"+CloudChat.Sender.uname,
                        attr:{"maxLength":40},
                        node:c
                    });
                }
            }
        }
    });
};
/*创建群*/
CloudChat.CreateGroup=function () {
    var ClassifyArr=[
        {"name":"<span class='sf-icon-user'></span>同事.同学","height":"20%","left":"10px","top":"10px","info":"学校/单位,你们在哪工作/上学"},
        {"name":"<span class='sf-icon-users'></span>粉丝","height":"20%","left":"180px","top":"10px","info":"人物,赵丽颖.胡歌,你们是谁的粉丝"},
        {"name":"<span class='sf-icon-camera-alt'></span>生活休闲","height":"27%","left":"350px","top":"10px","info":"生活休闲,你们的休闲方式?"},
        {"name":"<span class='sf-icon-graduation-cap'></span>家校.师生","height":"20%","left":"10px","top":"80px","info":"家校/师生,在读学校"},
        {"name":"<span class='sf-icon-gamepad'></span>游戏","height":"45%","left":"180px","top":"80px","info":"游戏,GTA?酷飙车神？"},
        {"name":"<span class='sf-icon-smile'></span>兴趣爱好","height":"27%","left":"350px","top":"104px","info":"兴趣爱好,你们的共同兴趣是?"},
        {"name":"<span class='sf-icon-home'></span>置业安家","height":"20%","left":"10px","top":"152px","info":"小区,你们在哪个小区"},
        {"name":"<span class='sf-icon-tag'></span>品牌产品","height":"20%","left":"180px","top":"223px","info":"品牌产品,华为,苹果,三星,你们喜欢?"},
        {"name":"<span class='sf-icon-pencil'></span>学习.考试","height":"27%","left":"350px","top":"203px","info":"学习.考试,你们在准备学什么"},
        {"name":"<span class='sf-icon-comment'></span>行业交流","height":"20%","left":"10px","top":"223px","info":"行业交流,术业有专攻同行皆朋友"}
    ];
    var SwitchArr=[
        {"name":"<span>1</span>选择群类别"},
        {"name":"<span>2</span>填写群信息"},
        {"name":"<span>3</span>邀请群成员"}
    ];
    var SwitchBanner=[];
    $.Window.NewWindow({
        id: 'CloudChatCG',
        width: '530px',
        height: '350px',
        biggest:false,
        mini:false,
        resize:false,
        title:'创建群',
        bg:'url("./public/img/chat/CloudChat.png")',
        color:'#e6e6e6',
        callback:function (a) {
            for(var i=0;i<SwitchArr.length;i++){
                SwitchArr[i]=$.CreateElement({
                    className:"CCCGSwitch",
                    html:SwitchArr[i].name,
                    node:a
                });
            }
            for(i=0;i<3;i++){
                SwitchBanner[i]=$.CreateElement({
                    className:"CCCGSwitchBanner",
                    node:a
                });
            }
            for(var j=0;j<ClassifyArr.length;j++){
                (function (j) {
                    $.CreateElement({
                        className:'CCGClassify',
                        html:ClassifyArr[j].name,
                        style:{"height":ClassifyArr[j].height,"left":ClassifyArr[j].left,"top":ClassifyArr[j].top},
                        node:SwitchBanner[0]
                    }).onclick=function () {
                        Check(1);
                        a.parentNode.Title.innerHTML='创建群-'+ClassifyArr[j].info.split(',')[0];
                        InputCreate(ClassifyArr[j].info.split(',')[0],ClassifyArr[j].info.split(',')[1])
                    };
                }(j));

            }
            var group_containers=$.CreateElement({
                className:"CCCGSwitchBannerContainer",
                node:SwitchBanner[1]
            });
            var group_Btncontainers=$.CreateElement({
                className:"CCCGSwitchBannerBtnC",
                node:SwitchBanner[1]
            });
            $.CreateElement({
                tag:"button",
                html:'下一步',
                node:group_Btncontainers
            }).onclick=function () {
                InputCheck();
            };
            $.CreateElement({
                tag:"button",
                html:'上一步',
                node:group_Btncontainers
            }).onclick=function () {
                a.parentNode.Title.innerHTML='创建群';
                Check(0);
            };
            $.CreateElement({
                className:'CCCGInviteContainer',
                node:SwitchBanner[2]
            });
            var aa=$.CreateElement({
                className:"CCCGSwitchBannerBtnC",
                node:SwitchBanner[2]
            });
            $.CreateElement({
                tag:"button",
                html:'完成',
                node:aa
            }).onclick=function () {
                CloudMain.Ajax({
                    url: "/service/chat/CreateGroup",
                    data:{
                        name:CloudChat.CreateGroup.names,
                        tag:CloudChat.CreateGroup.tag
                    },
                    success: function (rs) {
                        rs=rs[0];
                        if(rs.userid){
                            CloudChat.Toast('新的群聊已经成功创建');
                            CloudChat.FriendSwitchBtn[1].click();
                            CloudChat.PrintFriends(rs.type,rs.userid,rs.list_id,rs.username,' ',rs.userhead,rs.info,rs.friend_id);
                            if(CloudChat.SortFriends.Data.length) {
                                CloudChat.CreateGroup.Invite(rs.userid,'group',CloudChat.CreateGroup.names);
                            }
                            $.Window.Close(a.parentNode);
                        }else {
                            CloudChat.Toast('无法创建群聊')
                        }
                    }
                });
            };
            $.CreateElement({
                tag:"button",
                html:'上一步',
                node:aa
            }).onclick=function () {
                Check(1);
            };
            function InputCreate(name,holder) {
                group_containers.innerHTML='';
                var aa=group_containers;
                var a=$.CreateElement({
                    tag:"p",
                    node:aa
                });
                $.CreateElement({
                    tag:"span",
                    html:name+':',
                    node:a
                });
                CloudChat.CreateGroup.tag=$.CreateElement({
                    tag:"input",
                    attr:{"type":"text","placeholder":holder,"maxLength":30},
                    node:a
                });
                a=$.CreateElement({
                    tag:"p",
                    node:aa
                });
                $.CreateElement({
                    tag:"span",
                    html:'群名称:',
                    node:a
                });
                CloudChat.CreateGroup.names=$.CreateElement({
                    tag:"input",
                    attr:{"type":"text","placeholder":'为你们的群取一个响亮的名字吧',"maxLength":20},
                    node:a
                });
                $.CreateElement({
                    tag:"p",
                    html:"群规模:200人",
                    node:aa
                });
                $.CreateElement({
                    tag:"p",
                    html:"加群验证:需身份验证",
                    node:aa
                });
            }
            function InputCheck() {
                if(!CloudChat.CreateGroup.tag.value.length){
                    CloudChat.Toast("请输入群标签");
                    return false;
                }
                if(!CloudChat.CreateGroup.names.value.length){
                    CloudChat.Toast("请输入群名称");
                    return false;
                }
                CloudChat.CreateGroup.tag=CloudChat.CreateGroup.tag.value;
                CloudChat.CreateGroup.names=CloudChat.CreateGroup.names.value;
                Check(2);
            }
            function Check(n) {
                for(var i=0;i<SwitchBanner.length;i++){
                    SwitchBanner[i].removeAttribute('style');
                    SwitchArr[i].removeAttribute('style');
                }
                SwitchBanner[n].style.display='block';
                SwitchArr[n].style.opacity=1;
            }
            SwitchArr[0].style.opacity=1;
            SwitchBanner[0].style.display='block';
            CloudChat.SortFriends(SwitchBanner[2].getElementsByTagName('div')[0]);
        }
    });
    CloudChat.CreateGroup.Invite=function (to,ftype,name) {
        var tag='';
        if(ftype==='group'){
            tag="群聊";
        }else{
            tag='多人聊天';
        }
        CloudMain.Ajax({
            url: "/service/chat/InviteFriend",
            data:{
                username:CloudChat.Sender.uname,
                ftype:ftype,
                tag:tag,
                name:name,
                userlist:CloudChat.SortFriends.format(),
                to:to
            },
            success: function (rs) {
                for (var i = 0; i < CloudChat.SortFriends.Data.length; i++) {
                    var request = '{"type":"newRequest","uuid":"' + CloudChat.SortFriends.Data[i] + '","NewType":"friend"}';//实际是群类型，为了让邀请人收到消息写friend
                    CloudChat.serve.send(request);//发送消息
                }
                if (rs[0].state) {
                    CloudChat.Toast('好友邀请完成');
                    CloudChat.SortFriends.Data = [];
                }
            }
        });
    }
};
/*创建多人聊天*/
CloudChat.CreatDiscuss=function () {
    $.Window.NewWindow({
        id: 'CloudChatCD',
        width: '530px',
        height: '300px',
        biggest:false,
        mini:false,
        resize:false,
        title:'发起多人聊天',
        bg:'url("./public/img/chat/CloudChat.png")',
        color:'#e6e6e6',
        callback:function (a) {
            var a1=$.CreateElement({
                className:'CCCGInviteContainer',
                node:a
            });
            CloudChat.SortFriends(a1);
            var aa=$.CreateElement({
                className:'CCCGSwitchBannerBtnC',
                node:a
            });
            $.CreateElement({
                tag:"button",
                html:'完成',
                node:aa
            }).onclick=function () {
                CloudMain.Ajax({
                    url: "/service/chat/CreatDiscuss",
                    data:{
                        userlist:CloudChat.SortFriends.format()
                    },
                    success: function (rs) {
                        if(rs.userid){
                            CloudChat.Toast('多人聊天已经成功创建');
                            CloudChat.FriendSwitchBtn[2].click();
                            CloudChat.PrintFriends(rs.type,rs.userid,rs.list_id,rs.username,' ',rs.userhead,rs.info,rs.friend_id);
                            $.Window.Close(a.parentNode);
                        }else {
                            CloudChat.Toast('无法创建多人聊天')
                        }
                    }
                });
            };
        }
    });
};
/*通用分组好友获取方法*/
CloudChat.SortFriends=function (node) {
    CloudChat.SortFriends.Data=[];
    var a=$.CreateElement({
        className:'SortFriendsContainer',
        node:node
    });
    CloudChat.SortFriends.Ul=$.CreateElement({
        className:'SFConUl',
        tag:"ul",
        html:"<p class='SFConUlTopic'>选择好友</p>",
        node:a
    });
    $.CreateElement({
        className:'SFConUl',
        html:"<div class='SFConUlTips'><i class='sf-icon-info-circle'></i>左侧单击选择添加到右侧选择列表，选择列表单击移除所选项</div>",
        node:a
    });
    CloudChat.SortFriends.SelectList=$.CreateElement({
        className:'SFConUl',
        style:{"float":"right"},
        html:"<p class='SFConUlTopic'>已选择</p>",
        tag:"ul",
        node:a
    });
    for(var i=0;i<CloudChat.FriendListData.length;i++){
        CloudChat.PrintFriendList(CloudChat.FriendListData[i].list_id,CloudChat.FriendListData[i].list_name,CloudChat.SortFriends.Ul)
    }
    CloudChat.SortFriends.Print=function (type,userid,list_id,username,nickname,userhead,info,friend_id) {
        var node;
        if(type==='friend'){
            for(var i=0;i<CloudChat.SortFriends.Ul.getElementsByClassName('CloudChatSort').length;i++){
                if(CloudChat.SortFriends.Ul.getElementsByClassName('CloudChatSort')[i].data.id===list_id){
                    node=CloudChat.SortFriends.Ul.getElementsByClassName('CloudChatSort')[i].data.list;
                }
            }
            var a=$.CreateElement({
                tag:"li",
                className:'CloudChatList',
                node:node
            });
            a.data={
                "friend_id":friend_id,
                "list_id":list_id,
                "type":type,
                "userid":userid,
                "username":username,
                "userhead":userhead,
                "nickname":nickname,
                "info":info
            };
            $.CreateElement({
                tag: "img",
                attr: {"src": userhead},
                node: a
            });
            $.CreateElement({
                tag:"span",
                html:nickname!==' '?nickname:username,
                node:a
            });
            a.onclick=function (e) {
                e.stopPropagation();
                CloudChat.SortFriends.Select(this.data)
            };
        }
    };
    CloudChat.SortFriends.Select=function (data) {
        for(var i=0;i<CloudChat.SortFriends.Data.length;i++){
            if(CloudChat.SortFriends.Data[i]===data.userid){
                return false
            }
        }
        CloudChat.SortFriends.Data.push(data.userid)
        var a=$.CreateElement({
            tag:"li",
            className:'CloudChatList',
            node:CloudChat.SortFriends.SelectList
        });
        a.data={
            "userid":data.userid,
        };
        $.CreateElement({
            tag: "img",
            attr: {"src": data.userhead},
            node: a
        });
        $.CreateElement({
            tag:"span",
            html:data.nickname!==' '?data.nickname:data.username,
            node:a
        });
        a.onclick=function () {
            for(var i=0;i<CloudChat.SortFriends.Data.length;i++){
                if(CloudChat.SortFriends.Data[i]===this.data.userid){
                    var count=i;
					this.remove();
                    CloudChat.SortFriends.Data.splice(count, 1);
                }
            }
        }
    };
    CloudChat.SortFriends.format=function () {
        var data = '';
        for (var j = 0; j < CloudChat.SortFriends.Data.length; j++) {
            data = data + CloudChat.SortFriends.Data[j] + ',';
        }
        return data.substring(0, data.length - 1);
    };
    CloudMain.Ajax({
        url: "/service/chat/Getfriends",
        success: function (rs) {
            var userid,list_id,username,nickname,userhead,type,info,friend_id;
            for(var i=0;i<rs.length;i++){
                type=rs[i].type;
                userid=rs[i].userid;
                list_id=rs[i].list_id;
                username=rs[i].username;
                userhead=CloudMain.ServerUrl+'/'+rs[i].userhead;
                nickname=rs[i].nickname;
                info=rs[i].info;
                friend_id=rs[i].friend_id;
                CloudChat.SortFriends.Print(type,userid,list_id,username,nickname,userhead,info,friend_id);
            }
        }
    });
};
/*初始化*/
CloudChat.Init=function () {
    CloudChat.GetFriendRequest();
    CloudChat.SwitchBind();
    CloudChat.GetfriendList();
    var tt_=setInterval(function () {
        CloudChat.GetOldMsg();
        clearInterval(tt_);
    },500);
};
CloudChat.Init();