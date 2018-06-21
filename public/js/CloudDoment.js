CloudDoment=$.NameSpace.register('CloudDoment');
CloudDoment.Pending=false;
CloudDoment.IsSave=false;
CloudDoment.SelectList=[];
CloudDoment.Load=function (url,loadType) {
    if(CloudDoment.Pending){
        $.Toast('正在处理上个操作，请稍等');
        return false;
    }
    CloudDoment.Pending=true;
    CloudDoment.Container.innerHTML=CloudDoment.Loading;
    CloudMain.Ajax({
        url: url?url:"/service/doment/GetDomentByTime",
        success: function (rs) {
            CloudDoment.Pending=false;
            var doment_id,doment_name,doment_secret,create_time,modify_time,share,type;
            if(url===CloudMain.ServerUrl+'/service/api/disk/GetDoment'){
                loadType='disk'
            }else{
                loadType='doment'
            }
            if(rs.length){
                CloudDoment.Container.innerHTML='';
                for(var i=0;i<rs.length;i++){
                    doment_id=rs[i].doment_id;
                    doment_name=rs[i].doment_name;
                    doment_secret=rs[i].doment_secret;
                    create_time=rs[i].create_time;
                    modify_time=rs[i].modify_time;
                    share=rs[i].share;
                    type=rs[i].doment_type;
                    CloudDoment.PrintDoment(doment_id,doment_name,doment_secret,create_time,modify_time,share,type,loadType)
                }
            }else{
                CloudDoment.Container.innerHTML=CloudDoment.NoTips;
            }
        }
    });
};
CloudDoment.PrintDoment=function (doment_id,doment_name,doment_secret,create_time,modify_time,share,type,loadType) {
    var a=$.CreateElement({
        className:CloudDoment.ViewModes,
        node:CloudDoment.Container
    });
    a.data={
        elm:a,
        doment_id:doment_id,
        doment_name:doment_name,
        doment_secret:doment_secret,
        create_time:create_time,
        modify_time:modify_time,
        share:share,
        loadType:loadType
    };
    $.CreateElement({
        tag:"img",
        attr:{"draggable":"false","src":"./public/img/disk/middle/DocType.png"},
        node:a
    });
    $.CreateElement({
        tag:"p",
        html:doment_name,
        node:a
    });
    $.CreateElement({
        tag:"span",
        html:create_time,
        node:a
    });
    $.CreateElement({
        tag:"span",
        html:modify_time,
        node:a
    });
    a.onclick=function (event) {
        this.onfocus = function () {
            this.blur()
        };
        (event || window.event).cancelBubble = true;
        CloudDoment.CheckDpment(doment_id,loadType)
    };
    if(type!=='trash'&&loadType!=='disk'){
        a.onmousedown = function (e) {
            $.MouseMenu(CloudDoment.MouseMenu, this, CloudDoment.MouseFunc, e)
        }
    }
    if(type==='trash'){
        a.onmousedown = function (e) {
            $.MouseMenu(CloudDoment.TrashMenu, this, CloudDoment.MouseFunc, e)
        }
    }
};
CloudDoment.Unlock=function (confirm,id,pass) {
    if(CloudDoment.Pending){
        $.Toast('正在处理上个操作，请稍等');
        return false;
    }
    CloudDoment.Pending=true;
    if(!pass.length){
        $.Toast('请输入密码');
        return false;
    }
    CloudMain.Ajax({
        url:"/service/doment/UnlockDoment",
        data:{
            id:id,
            pass:pass
        },
        success: function (rs) {
            CloudDoment.Pending=false;
            if(rs.state==='error'){
                $.Toast('密码错误');
            }else {
                CloudDoment.OpenDoment(rs.doment_name,rs.doment_content,id);
                $.Window.Close(confirm);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
        }
    });
};
CloudDoment.CheckDpment=function (doment_id,loadType) {
    if(CloudDoment.Pending){
        $.Toast('正在处理上个操作，请稍等');
        return false;
    }
    $.Toast('正在打开文档');
    CloudDoment.Pending=true;
    var url='/service/doment/LoadDoment';
    if(loadType==='doment'){
        url='/service/doment/LoadDoment';
    }else{
        url='/service/api/disk/OpenDoment';
    }
    CloudMain.Ajax({
        url: url,
        data:{
            id:doment_id
        },
        success: function (rs) {
            CloudDoment.Pending=false;
            if(loadType==='doment') {
                if (rs.secret === 1) {
                    $.Confirm({
                        id: 'CloudDomentpass',
                        node: CloudDoment.Main,
                        title: '请输入密码',
                        notic: '文档' + rs.doment_name + '打开需要密码<br>请输入密码',
                        confirm_input: 'CloudDomentPassword',
                        submit_func: function (a) {
                            CloudDoment.Unlock(a, doment_id, $("#CloudDomentPassword")[0].value)
                        }
                    });
                } else {
                    CloudDoment.OpenDoment(rs.doment_name, rs.doment_content, rs.doment_id);
                }
            }else {
                CloudDoment.OpenDoment(rs.doment_name, rs.doment_content, rs.doment_id);
            }
        }
    });
};
CloudDoment.OpenDoment=function (name,content,id) {
    $.Toast(name+'已加载');
    CloudDoment.DomentName=name;
    CloudDoment.OpenId=id;
    CloudDomentEditor.Config.uploadImgParams.doment_id=id;
    CloudDoment.EditorHead[2].innerHTML=name;
    CloudDoment.Editor.style.display='block';
    CloudDomentEditor.EditorContent.innerHTML=content;
    for(var j=0;j<CloudDoment.Switch.length;j++){
        CloudDoment.SwitchMain[j].style.display='none';
    }
    CloudDoment.AddButton.style.display='none';
};
CloudDoment.NewDoment=function (a) {
    var DomentName=$("#CloudDomentNewName")[0];
    if(!DomentName.value.length){
        $.Toast('请填写文档名');
        return false;
    }
    CloudMain.Ajax({
        url: "/service/doment/NewDoment",
        data:{
            name:DomentName.value,
            pass:$("#CloudDomentNewPass")[0].value
        },
        success: function (rs) {
            if(parseInt(rs.state)===1) {
                $.Toast('新建成功');
                $(".CloudDocumentLeftNavActive")[0].click();
                CloudDoment.OpenDoment(DomentName.value, '', rs.doment_id);
            }else {
                $.Toast('无法新建文档');
            }
        }
    });
    $.Window.Close(a);
};
CloudDoment.MouseFunc=function (this_doment) {
    CloudDoment.MouseFunc.open=function () {
        CloudDoment.CheckDpment(this_doment.data.doment_id,this_doment.data.loadType)
    };
    CloudDoment.MouseFunc.Rename=function () {
        $.Confirm({
            id: 'CloudDoment-Confirm',
            title: '重命名',
            notic: '请输入新的命名',
            submit_func: function (a) {
                if(CloudDoment.Pending){
                    $.Toast('正在处理上个操作，请稍等');
                    return false;
                }
                CloudDoment.Pending=true;
                var new_name=$("#CloudDomentNewName")[0].value;
                if(!new_name.length){
                    $.Toast('命名不能为空')
                }
                CloudMain.Ajax({
                    url:"/service/doment/RenameDoment",
                    data:{
                        id:this_doment.data.doment_id,
                        name:new_name
                    },
                    success: function (rs) {
                        CloudDoment.Pending=false;
                        if(parseInt(rs.state)>0){
                            this_doment.data.doment_name=new_name;
                            this_doment.getElementsByTagName('p')[0].innerHTML=new_name;
                        }else{
                            $.Toast('命名失败')
                        }
                        $.Window.Close(a)
                    }
                });
            },
            confirm_input: 'CloudDomentNewName',
            confirm_input_val: this_doment.data.doment_name,
            node:CloudDoment.Main
        });
    };
    CloudDoment.MouseFunc.Trash=function () {
        $.Confirm({
            id: 'CloudDoment-Confirm',
            title: '确认移至回收站',
            notic: '确认将'+this_doment.data.doment_name+'移入回收站吗',
            submit_func: function (a) {
                if(CloudDoment.Pending){
                    $.Toast('正在处理上个操作，请稍等');
                    return false;
                }
                CloudDoment.Pending=true;
                if(this_doment.data.loadType!=='disk'){
                    var url="/service/doment/TrashDoment"
                }else{
                    var url="/service/api/disk/TrashDoment"
                }
                CloudMain.Ajax({
                    url:  url,
                    data:{
                        id:this_doment.data.doment_id
                    },
                    success: function (rs) {
                        CloudDoment.Pending=false;
                        if(parseInt(rs.state)>0){
                            if(this_doment.parentNode.childNodes.length===1){
                                CloudDoment.Container.innerHTML=CloudDoment.NoTips
                            }else{
								this_doment.remove();
                            }
                        }else{
                            $.Toast('删除失败')
                        }
                        $.Window.Close(a)
                    }
                });
            },
            node:CloudDoment.Main
        });
    };
    CloudDoment.MouseFunc.Restore=function () {
        CloudMain.Ajax({
            url: "/service/doment/RestoreDoment",
            data:{
                id:this_doment.data.doment_id
            },
            success: function (rs) {
                if(CloudDoment.Pending){
                    $.Toast('正在处理上个操作，请稍等');
                    return false;
                }
                CloudDoment.Pending=true;
                if(parseInt(rs.state)>0){
                    CloudDoment.Pending=false;
                    if(this_doment.parentNode.childNodes.length===1){
                        CloudDoment.Container.innerHTML=CloudDoment.NoTips
                    }else{
                        this_doment.remove();
                    }
                    $.Toast('还原成功');
                }else{
                    $.Toast('还原失败')
                }
                $.Window.Close(a)
            }
        });
    };
    CloudDoment.MouseFunc.Delete=function () {
        $.Confirm({
            id: 'CloudDoment-Confirm',
            title: '彻底删除',
            notic: '确认将'+this_doment.data.doment_name+'彻底删除吗',
            submit_func: function (a) {
                CloudDoment.Pending=true;
                CloudMain.Ajax({
                    url:"/service/doment/DeleteDoment",
                    data:{
                        id:this_doment.data.doment_id
                    },
                    success: function (rs) {

                        CloudDoment.Pending=false;
                        if(parseInt(rs.state)>0){

                            if(this_doment.parentNode.childNodes.length===1){
                                CloudDoment.Container.innerHTML=CloudDoment.NoTips
                            }else{
                                this_doment.remove();
                            }
                            $.Toast('删除成功');
                        }else{
                            $.Toast('删除失败')
                        }
                        $.Window.Close(a)
                    }
                });
            },
            node:CloudDoment.Main
        });
        if(CloudDoment.Pending){
            $.Toast('正在处理上个操作，请稍等');
            return false;
        }
    }
};
CloudDoment.MakeSelectData = function () {
    var data = '';
    for (var j = 0; j < CloudDoment.SelectList.length; j++) {
        data = data + CloudDoment.SelectList[j].data.doment_id + ',';
    }
    return data.substring(0, data.length - 1);
};
CloudDoment.Init=function () {
    $(".CloudDocumentHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/doment.png';
    CloudDoment.Main=$(".CloudDocumentMain")[0];
    CloudDoment.DomentName=null;
    CloudDoment.OpenId=null;
    CloudDoment.ViewModes='CloudDomentBlock';
    CloudDoment.Loading='<span class="CloudDocumentLoading"><span class="sf-icon-file-text"></span><p>正在加载数据...</p></span>';
    CloudDoment.NoTips='<div class="CloudDocumentNoTips"><span class="sf-icon-file-text"></span><p>这里什么都没有</p></div>';
    CloudDoment.Container=$(".CloudDomentControlMain")[0];
    CloudDoment.Switch=$(".CloudDocumentHead li");
    CloudDoment.Nav=$(".CloudDocumentLeftNav li");
    CloudDoment.SwitchMain=$(".CloudDocumentMainContainer");
    CloudDoment.AddButton=$(".CloudDomentAdd")[0];
    CloudDoment.AddButton.onclick=function () {
        $.Confirm({
            id: 'CloudDomentAdd',
            node: CloudDoment.Main,
            title: '新建文档',
            notic: '输入文档名',
            confirm_input:'CloudDomentNewName',
            submit_func: CloudDoment.NewDoment,
            callback:function (a) {
                $("#CloudDomentNewName")[0].placeholder='文档名称';
                $.CreateElement({
                    tag:"input",
                    id:"CloudDomentNewPass",
                    attr:{"type":"text","placeholder":"密码（选填）"},
                    node:a
                })
            }
        });
    };
    CloudDoment.TrashButton=$(".CloudDomentAdd")[1];
    CloudDoment.TrashButton.onclick=function () {
        if(CloudDoment.Container.getElementsByClassName('CloudDomentBlock').length===0){
            return false;
        }
        $.Confirm({
            id: 'CloudDomentUnSave',
            node: CloudDoment.Main,
            title: '清空回收站',
            notic: '确认清空回收站吗',
            submit_func: function (a) {
                var data=CloudDoment.Container.getElementsByClassName('CloudDomentBlock');
                for(var i=0;i<data.length;i++){
                    CloudDoment.SelectList.push(data[i])
                }
                data=CloudDoment.MakeSelectData();
                CloudMain.Ajax({
                    url:'/service/doment/DeleteDoment',
                    data:{
                        id:data
                    },
                    success: function (rs) {
                        if(parseInt(rs.state)>0){
                            CloudDoment.Container.innerHTML=CloudDoment.NoTips
                        }else{
                            $.Toast('删除失败');
                        }
                        $.Window.Close(a)
                    }
                });
            }
        });
    };
    CloudDoment.Editor=$(".CloudDomentEditorContainer")[0];
    CloudDoment.EditorHead=$(".CloudDomentEditorHead *");
    CloudDoment.EditorHead[0].onclick=function () {
        if(!CloudDoment.IsSave){
            $.Confirm({
                id: 'CloudDomentTrash',
                node: CloudDoment.Main,
                title: '未保存的修改',
                notic: '确认返回前保存修改内容吗',
                submit_func: function (a) {
                    CloudDomentEditor.Config.SaveFunc(CloudDomentEditor.EditorContent.innerHTML);
                    $.Window.Close(a);
                    CloudDoment.Switch[0].click();
                }
            });
            return false
        }
        CloudDoment.Switch[0].click();
    };
    for(var i=0;i<CloudDoment.Switch.length;i++){
        (function (i) {
            CloudDoment.Switch[i].onclick=function () {
                for(var j=0;j<CloudDoment.Switch.length;j++){
                    CloudDoment.Switch[j].getElementsByTagName('div')[0].style.width='0%';
                    CloudDoment.SwitchMain[j].style.display='none';
                }
                CloudDoment.Switch[i].getElementsByTagName('div')[0].style.width='100%';
                CloudDoment.SwitchMain[i].style.display='block';
                if(i===0){
                    CloudDoment.AddButton.style.display='block';
                }else {
                    CloudDoment.AddButton.style.display='none';
                }
                CloudDoment.Editor.style.display='none';
            }
        })(i)
    }
    for(var i=0;i<CloudDoment.Nav.length;i++){
        (function (i) {
            CloudDoment.Nav[i].onclick=function () {
                for(var j=0;j<CloudDoment.Nav.length;j++){
                    CloudDoment.Nav[j].className='';
                }
                CloudDoment.Nav[i].className='CloudDocumentLeftNavActive';
                var url=null;
                switch(i){
                    case 0:
                        url='/service/doment/GetDomentByTime';
                        break;
                    case 1:
                        url='/service/doment/GetDoment';
                        break;
                    case 2:
                        url='/service/api/disk/GetDoment';
                        break;
                    case 3:
                        url='/service/doment/GetDomentByTrash';
                        break;
                }
                CloudDoment.Load(url);
                if(i!==3){
                    CloudDoment.AddButton.style.display='block';
                    CloudDoment.TrashButton.style.display='none';
                }else {
                    CloudDoment.AddButton.style.display='none';
                    CloudDoment.TrashButton.style.display='block';
                }
            }
        })(i)
    }
    CloudDoment.MouseMenu=$("#CloudDomentMouseMenu")[0];
    CloudDoment.TrashMenu=$("#CloudDomentTrashMenu")[0];
    CloudDomentEditor = new SlimfEditor('.CloudDomentEditor');
    CloudDomentEditor.Config={
        SaveFunc:function (a) {
            CloudMain.Ajax({
                url:"/service/doment/SaveDoment",
                data:{
                    id:CloudDoment.OpenId,
                    content:a
                },
                success: function (rs) {
                    if(parseInt(rs.state)===1) {
                        CloudDoment.IsSave=true;
                        $.Toast('保存成功')
                    }else {
                        $.Toast('保存失败');
                    }
                }
            });
        },
        uploadImgServer: '/service/doment/UploadImage',
        uploadImgParams:{
            doment_id: CloudDoment.OpenId
        }
    };
    CloudDomentEditor.create();
    CloudDomentEditor.EditorContent=$("#"+CloudDomentEditor.textElemId)[0];
    CloudDomentEditor.EditorContent.onkeydown=onkeyup=function (ev) {
        CloudDoment.IsSave=false;
    };
    CloudDoment.Load();
}();