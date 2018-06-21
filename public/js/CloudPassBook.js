CloudPB=$.NameSpace.register('CloudPB');
CloudPB.Load=function () {
    CloudPB.ContentArea.innerHTML=CloudPB.Loading;
    CloudMain.Ajax({
        url:"/service/psssbook/GetPass",
        success: function(rs) {
            CloudPB.ContentArea.innerHTML='';
            var pb_id,pb_describe,pb_user=null;
            for(var i=0;i<rs.length;i++){
                pb_id=rs[i].pb_id;
                pb_describe=rs[i].pb_describe;
                pb_user=rs[i].pb_user;
                CloudPB.PrintPassInfo(pb_id,pb_describe,pb_user);
            }
        }
    });
};
CloudPB.PrintPassInfo=function (pb_id,pb_describe,pb_user) {
    var a=$.CreateElement({
        className:'CloudPBList',
        node:CloudPB.ContentArea
    });
    a.data={
        "pb_id":pb_id,
        "pb_describe":pb_describe,
        "pb_user":pb_user,
        "show":false,
        "edit":false,
        "pass":false,
        "elm":a
    };
    $.CreateElement({
        className:'CloudPassBDesp',
        attr:{"PB-list":"PB-list","tooltip":pb_describe},
        html:pb_describe,
        node:a
    });
    $.CreateElement({
        className:'CloudPassBName',
        attr:{"PB-list":"PB-list","tooltip":pb_user},
        html:pb_user,
        node:a
    });
    var p=$.CreateElement({
        className:'CloudPassBName',
        attr:{"PB-list":"PB-list"},
        html:'●●●●●●●●',
        node:a
    });
    var b=$.CreateElement({
        className:'CloudPassBControl',
        node:a
    });
    var c=$.CreateElement({
        tag:"button",
        className:'sf-icon-eye',
        node:b
    });
    c.onclick=function () {
        var data=a.data;
        if(data.edit===true){
            $.Toast('正在编辑，无法切换')
        }else {
            CloudPB.ShowPass(data,this,p);
        }
    };
    var d=$.CreateElement({
        tag:"button",
        className:'sf-icon-pencil',
        node:b
    });
    d.onclick=function () {
        var data=a.data;
        if(this.className==='sf-icon-pencil') {
            if(data.show===true) {
                this.className='sf-icon-check';
                e.className='sf-icon-times';
                CloudPB.Edit(data)
            }else {
                $.Toast('请先查看密码再修改')
            }
        }else {
            this.className='sf-icon-pencil';
            e.className='sf-icon-trash';
            data.edit = false;
            CloudPB.Edit.Post(data)
        }
    };
    var e=$.CreateElement({
        tag:"button",
        className:'sf-icon-trash',
        node:b
    });
    e.onclick=function () {
        var data=a.data;
        if(this.className==='sf-icon-trash'){
            CloudPB.Delete(data)
        }else{
            d.className='sf-icon-pencil';
            this.className='sf-icon-trash';
            CloudPB.Edit(data)
        }
    }
};
CloudPB.VerifyCheck=function () {
    if($.Cookie.get('pb_code')===null){
        var list=$(".CloudPBList");
        Array.prototype.forEach.call(list, function (elm) {
            if(elm.data.show){
                elm.getElementsByTagName('button')[0].click();
            }
        });
    }
};
CloudPB.VerifyCheck.Start=function () {
    setInterval(function () {
        CloudPB.VerifyCheck();
    },5000)
};
CloudPB.ShowPass=function (data,btn,area) {
    var pb_code=$.Cookie.get('pb_code');
    var pass=data.pass;
    if(pass){
        if(pb_code){
            CloudPB.ShowPass.CheckState(data,btn,area)
        }else {
            if(data.show===true) {
                btn.className = 'sf-icon-eye';
                area.innerHTML = '●●●●●●●●';
                data.show = false;
                data.pass=false
            }else {
                CloudPB.ShowPass.CheckUser(data, btn, area)
            }
        }
    }else{
        if(pb_code){
            CloudPB.ShowPass.send(data,pb_code,function () {
                CloudPB.ShowPass.CheckState(data,btn,area)
            });
        }else {
            CloudPB.ShowPass.CheckUser(data,btn,area)
        }
    }
};
CloudPB.ShowPass.CheckState=function (data,btn,area) {
    var state= data.show;
    if(state===true){
        btn.className='sf-icon-eye';
        area.innerHTML='●●●●●●●●';
        data.show=false;
        data.pass=false
    }else {
        btn.className='sf-icon-eye-slash';
        area.innerHTML=data.pass;
        data.show=true;
    }
};
CloudPB.ShowPass.CheckUser=function (data,btn,area) {
    $.Confirm({
        id:"PassBookCheck",
        title:'请输入用户密码',
        notic:'输入'+($.Cookie.get('username')||CloudMain.username)+'用户的密码以继续',
        confirm_input:'PassBookCheckVal',
        submit_func:function (a) {
            var password=$("#PassBookCheckVal")[0].value;
            if(!password){
                $.Toast('请输入密码')
            }else {
                CloudMain.Ajax({
                    url:"/service/psssbook/CheckUser",
                    data:{
                        password:password
                    },
                    success: function(rs) {
                        if(rs.state===1) {
                            CloudPB.ShowPass.send(data,password,function () {
                                CloudPB.ShowPass.CheckState(data,btn,area)
                            });
                            $.Cookie.set('pb_code',password,5*1000*60);
                            $.Window.Close(a)
                        }else {
                            $.Toast('密码错误');
                        }
                    }
                });
            }
        },
        node:CloudPB.Main
    })
};
CloudPB.ShowPass.send=function (data,password,callback) {
    var data=data;
    CloudMain.Ajax({
        url:"/service/psssbook/ShowPass",
        data:{
            id:data.pb_id,
            password:password
        },
        success: function(rs) {
            if(rs.state>0){
                data.pass=rs.pb_pass;
                typeof callback ==='function'&&callback(data);
            }else {
                $.Toast('请求出错');
                $.Cookie.remove('pb_code')
            }
        }
    });
};
CloudPB.Edit=function (data) {
    var node=data.elm;
    var state=data.edit;
    var width=["calc(50% - 110px)","calc(25% - 5px)","calc(25% - 5px)"];
    var value=[data.pb_describe,data.pb_user,data.pass];
    var inputdata=["pb_describe","pb_user","pass"];
    if(state===false){//进入编辑
        data.edit = true;
        Array.prototype.forEach.call(node.querySelectorAll('[pb-list]'), function (elm) {
            elm.style.display='none';
        });
        for(var i=0;i<3;i++){
            var a=$.CreateElement({
                tag:"input",
                style:{"width":width[i]},
                attr:{"type":"text","value":value[i],"ripple":"ripple","data":inputdata[i],"old":value[i]},
                node:node
            });
            a.onchange=function () {
                data[this.getAttribute('data')]=this.value;
            };
            $(a).insertBefore(node.getElementsByTagName('div')[0])
        }
        node.getElementsByTagName('input')[0].focus();
    }else {
        var input=node.querySelectorAll('input');
        var list=node.querySelectorAll('[pb-list]');
        data.edit = false;
        for(var i=0;i<input.length;i++){
            list[i].innerHTML=input[i].getAttribute('old');
            data[input[i].getAttribute('data')]=input[i].getAttribute('old');
        }
        Array.prototype.forEach.call(list, function (elm) {
            elm.removeAttribute('style')
        });
        Array.prototype.forEach.call(input, function (elm) {
            elm.remove();
        });
    }
};
CloudPB.Edit.Post=function (data) {
    var node=data.elm;
    Array.prototype.forEach.call(node.querySelectorAll('[pb-list]'), function (elm) {
        elm.removeAttribute('style')
    });
    Array.prototype.forEach.call(node.querySelectorAll('input'), function (elm) {
        elm.remove();
    });
    if(CloudPB.Posting){
        $.Toast('操作太频繁了，请稍后重试');
        return false;
    }
    CloudPB.Posting=true;
    setTimeout(function () {
        CloudPB.Posting=false;
    },5000);
    CloudMain.Ajax({
        url:"/service/psssbook/UpdatePass",
        data:{
            id:data.pb_id,
            desp:data.pb_describe,
            user:data.pb_user,
            pass:data.pass
        },
        success: function(rs) {
            if(rs.state===1) {
                $.Toast('修改成功');
                var updateData=[rs.desp,rs.user,rs.pass];
                var list=node.querySelectorAll('[pb-list]');
                for(var i=0;i<list.length;i++){
                    list[i].innerHTML=updateData[i];
                }
            }else {
                $.Toast('修改失败');
            }
        }
    });
};
CloudPB.Delete=function (data) {
    var pb_code=$.Cookie.get('pb_code');
    if(pb_code) {
        CloudPB.Delete.Post(data)
    }else {
        $.Confirm({
            id:"PassBookCheck",
            title:'请输入用户密码',
            notic:'输入'+$.Cookie.get('username')+'用户的密码以继续',
            confirm_input:'PassBookCheckVal',
            submit_func:function (a) {
                var password=$("#PassBookCheckVal")[0].value;
                if(!password){
                    $.Toast('请输入密码')
                }else {
                    CloudMain.Ajax({
                        url:"/service/psssbook/CheckUser",
                        data:{
                            password:password
                        },
                        success: function(rs) {
                            if(rs.state===1) {
                                $.Cookie.set('pb_code',password,5*1000*60);
                                CloudPB.Delete.Post(data);
                                $.Window.Close(a)
                            }else {
                                $.Toast('密码错误');
                            }
                        }
                    });
                }
            },
            node:CloudPB.Main
        })
    }
};
CloudPB.Delete.Post=function (data) {
    $.Confirm({
        id: "PassBookDelete",
        title: '确认删除该密码记录',
        notic: '确认删除' + data.pb_describe + '这条记录吗',
        submit_func: function (a) {
            CloudMain.Ajax({
                url:"/service/psssbook/DeletePass",
                data: {
                    id: data.pb_id
                },
                success: function (rs) {
                    if (rs.state === 1) {
						data.elm.remove();
                        $.Window.Close(a)
                    } else {
                        $.Toast('删除失败');
                    }
                }
            });
        },
        node: CloudPB.Main
    })
};
CloudPB.Init=function () {
    CloudPB.Posting=false;
    $(".CloudPassBookHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/pass.png';
    CloudPB.Loading='';
    CloudPB.Main=$(".CloudPassBookMain")[0];
    CloudPB.Loading='<p class="CloudPassBookLoading">正在加载</p>'
    CloudPB.PassShowArea=$(".CloudPassBookContent")[0];
    CloudPB.ContentArea=$(".CloudPassBookCMain")[0];
    CloudPB.PassBookContainer=$(".CloudPassBookContainer")[0];
    CloudPB.PBHead=$(".CloudPassBookShadow")[0];
    CloudPB.PassBookContainer.onmousewheel=function () {
        if(this.scrollTop>30){
            CloudPB.PBHead.style.display='block';
        }else {
            CloudPB.PBHead.removeAttribute('style');
        }
    };
    CloudPB.MenuBtn=$(".CloudPassBookMenu")[0];
    CloudPB.MenuContainer=$(".CloudPassBookBtnContainer")[0];
    CloudPB.MenuButton=$(".CloudPassBookBtnContainer button");
    CloudPB.MenuButton[0].onmousedown=function (e) {
        var placeholder=["描述信息,25字以内","需要存储的用户名","需要存储的密码"];
        var info=["描述:","账号:","密码:"];
        var input=[];
        $.Confirm({
            id:"PassBookNew",
            title:'新增密码项',
            notic:'需要如下信息',
            callback:function (a) {
                for(var i=0;i<3;i++){
                    var aa=$.CreateElement({
                        className:'PassBookNewList',
                        node:a
                    });
                    $.CreateElement({
                        tag:"label",
                        html:info[i],
                        node:aa
                    });
                    input[i]=$.CreateElement({
                        tag:"input",
                        attr:{"type":"text","placeholder":placeholder[i]},
                        node:aa
                    })
                }
            },
            submit_func:function (a) {
                if(!input[0].value||!input[1].value||!input[2].value){
                    $.Toast('请输入完整信息');
                    return false;
                }
                if(input[0].value.length>25){
                    $.Toast('描述字数过多，请修改');
                    return false;
                }
                CloudMain.Ajax({
                    url:"/service/psssbook/NewPass",
                    data:{
                        desp:input[0].value,
                        user:input[1].value,
                        pass:input[2].value
                    },
                    success: function(rs) {
                        if(rs.state===1) {
                            CloudPB.PrintPassInfo(rs.id,rs.desp,rs.user);
                            $.Window.Close(a)
                        }else {
                            $.Toast('新建失败');
                        }
                    }
                });
            },
            node:CloudPB.Main
        })
    };
    CloudPB.MenuButton[1].onmousedown=function (e) {
        $.Cookie.remove('pb_code');
        $.Toast('验证信息已重置');
    };
    CloudPB.Main.onmousedown=function () {
        if(CloudPB.MenuBtn.className!=='CloudPassBookMenu sf-icon-bars'){
            CloudPB.MenuBtn.className = 'CloudPassBookMenu sf-icon-bars';
            CloudPB.MenuContainer.className+=' animated slideOutDown';
            var time=setTimeout(function () {
                CloudPB.MenuContainer.style.display='none';
                CloudPB.MenuContainer.className='CloudPassBookBtnContainer';
                clearTimeout(time)
            },350);
        }
    };
    CloudPB.MenuBtn.onmousedown=function (e) {
        e.stopPropagation();
        if(this.className==='CloudPassBookMenu sf-icon-bars') {
            this.className = 'CloudPassBookMenu sf-icon-times CloudPassBookActive';
            CloudPB.MenuContainer.style.display='block';
        }else {
            this.className = 'CloudPassBookMenu sf-icon-bars';
            CloudPB.MenuContainer.className+=' animated slideOutDown';
            var time=setTimeout(function () {
                CloudPB.MenuContainer.style.display='none';
                CloudPB.MenuContainer.className='CloudPassBookBtnContainer';
                clearTimeout(time)
            },350);
        }
    };
    CloudPB.VerifyCheck.Start();
    CloudPB.Load();
}();