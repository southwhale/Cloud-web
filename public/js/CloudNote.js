CloudNote=$.NameSpace.register('CloudNote');
CloudNote.Load=function (type,node) {
    node.innerHTML=CloudNote.Loading;
    var loadtype=type;
    CloudMain.Ajax({
        url:"/service/note/GetNoteList",
        data: {
            NoteType:type
        },
        success: function(rs) {
            if(rs.length===0){
                node.innerHTML=CloudNote.NoTips;
            }else {
                node.innerHTML='';
            }
            if(loadtype===null){
                CloudNote.Data=[];
            }
            var type,content,id,time;
            for(var tmp in rs){
                var a=$.CreateElement({
                    className:'CNoteTimeCon',
                    node:node
                });
                $.CreateElement({
                    tag:"div",
                    className:'CNoteTimeLine',
                    html:'<div class="CNoteTime">'+tmp+'</div>',
                    node:a
                });
                var b=$.CreateElement({
                    tag:"ul",
                    id:'CNoteUl'+tmp,
                    className:"CNoteUl",
                    node:a
                });
                for (var j = 0; j < rs[tmp].length; j++) {
                    type=rs[tmp][j].note_type;
                    content=rs[tmp][j].note_content;
                    id=rs[tmp][j].note_id;
                    time=rs[tmp][j].create_time;
                    CloudNote.Print(type,content,id,time,b)
                    if(loadtype===null){
                        rs[tmp][j].create_time=tmp.replace('-','').replace('-','')-100;
                        CloudNote.Data.push(rs[tmp][j])
                    }
                }
            }
        }
    });
};
CloudNote.Print=function (type,content,id,time,where) {
    var name='sf-icon-book';
    if(type==='Dealt'){
        name='sf-icon-clock';
    }else if(type==='Finish') {
        name = 'sf-icon-calendar-check';
    }
    var a=$.CreateElement({
        tag:"li",
        className:"CNoteShow",
        node:where
    });
    var icon=$.CreateElement({
        tag:"span",
        className:'CNoteShowType '+name,
        node:a
    });
    $.CreateElement({
        tag:"p",
        html:content,
        node:a
    });
    a.data={
        "note_id":id,
        "type":type,
        "icon":icon
    };
    a.onclick=function () {
        CloudNote.OpenNote(this);
    };
    $.CreateElement({
        tag:"span",
        className:'CNoteShowTime',
        html:time.substring(10,16),
        node:a
    });
    var b=$.CreateElement({
        className:'CNoteShow-Control',
        node:a
    });
    if(type==='Dealt'){
        a.data.button=$.CreateElement({
            tag:"button",
            className:'sf-icon-check',
            attr:{"tooltip":"设置为已完成"},
            node:b
        });
        a.data.button.onclick=function () {
            event.stopPropagation();
            CloudNote.ChangeType(a,true)
        };
    }else if(type==='Finish'){
        a.data.button=$.CreateElement({
            tag:"button",
            className:'sf-icon-times',
            attr:{"tooltip":"设置为待办状态"},
            node:b
        });
        a.data.button.onclick=function () {
            event.stopPropagation();
            CloudNote.ChangeType(a,false)
        };
    }else{
        $.CreateElement({
            tag:"input",
            attr:{"type":"button"},
            node:b
        });
    }
    var del=$.CreateElement({
        tag:"button",
        className:'sf-icon-trash',
        attr:{"tooltip":"删除该备忘录"},
        node:b
    });
    del.onclick=function () {
        event.stopPropagation();
        CloudNote.RemoveNote(a);
    }
};
CloudNote.ChangeType=function (list,state) {
    var id=list.data.note_id;
    var type=null;
    if(state){
        type='Finish'
    }else {
        type='Dealt'
    }
    CloudMain.Ajax({
        url:"/service/note/ChangeType",
        data: {
            id:id,
            state:type
        },
        success: function(rs) {
            if(rs[0].state>0) {
                if(CloudNote.NowType===CloudNote.AllType){
                    if(list.data.type==='Finish'){
                        list.data.type='Dealt';
                        list.data.icon.className='CNoteShowType sf-icon-clock';
                        list.data.button.className='sf-icon-check';
                        list.data.button.onclick=function () {
                            event.stopPropagation();
                            CloudNote.ChangeType(list,true)
                        }
                    }else{
                        list.data.type='Finish';
                        list.data.icon.className='CNoteShowType sf-icon-calendar-check';
                        list.data.button.className='sf-icon-times';
                        list.data.button.onclick=function () {
                            event.stopPropagation();
                            CloudNote.ChangeType(list,false)
                        }
                    }
                }else {
                    if (list.parentNode.childNodes.length === 1) {
						list.parentNode.parentNode.remove();
                        if (CloudNote.NowType.childNodes.length === 0) {
                            CloudNote.NowType.innerHTML = CloudNote.NoTips;
                        }
                    } else {
						list.remove();
                    }
                }
            }else {
                $.Toast('操作失败');
            }
        }
    });
};
CloudNote.OpenNote=function (a) {
    CloudMain.Ajax({
        url:"/service/note/GetNoteInfo",
        data: {
            id:a.data.note_id
        },
        success: function(rs) {
            var note_id,note_time,note_content,note_left,note_top,pined;
            for(var i=0;i<rs.length;i++){
                note_id=rs[i].note_id;
                note_time=rs[i].note_time;
                note_content=rs[i].note_content;
                note_left=rs[i].note_left;
                note_top=rs[i].note_top;
                pined=rs[i].note_pined;
                CloudMain.NoteModern.CreateThingShow(note_id,note_time,note_content,note_left,note_top,pined)
            }
        }
    });
};
CloudNote.RemoveNote=function (a) {
    CloudNote.DelNote=function (aa) {
        CloudMain.Ajax({
            url:"/service/note/RemoveNote",
            data: {
                note_id: a.data.note_id
            },
            success: function(rs) {
                if (rs[0].del) {
                    $.Window.Close(a);
                    var aaa = $("#ThingWindow" + a.data.note_id)[0];
                    if(aaa){
                        $.Window.Close(aaa);
                    }
                    if(a.parentNode.childNodes.length===1){
						a.parentNode.parentNode.remove();
                    }
                    if(CloudNote.NowType.childNodes.length===0){
                        CloudNote.NowType.innerHTML= CloudNote.NoTips;
                        CloudNote.Data=[];
                    }
                    $.Window.Close(aa);
                }
            }
        });
    };
    $.Confirm({
        id: 'DelNote',
        node: document.body,
        title: '删除确认',
        notic: '确认删除所选择的备忘录吗',
        submit_func: CloudNote.DelNote,
        confirm_input: null,
        confirm_input_val: null,
        node:CloudNote.Main
    });
};
CloudNote.ShowInCalendar=function () {
    Array.prototype.forEach.call($("#renderMonth .day li"), function (elm) {
        for(var i=0;i<CloudNote.Data.length;i++){
            if(parseInt(elm.getAttribute('data-time'))===CloudNote.Data[i].create_time){
                if(elm.getElementsByClassName('term-b')){
					$(elm.getElementsByClassName('term-b')[elm.getElementsByClassName('term-b').length-1]).remove();
                }
                var a=$.CreateElement({
                    tag:"p",
                    className:'term-b show',
                    html:CloudNote.Data[i].note_content,
                    node:elm
                });
                a.data={
                    "note_id":CloudNote.Data[i].note_id
                };
                a.onclick=function () {
                    CloudNote.OpenNote(this)
                }
            }
        }
    });
};
CloudNote.Init=function () {
    CloudNote.Main=$(".CloudNoteMain")[0];
    CloudNote.Data=[];
    $(".CloudNoteHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/note.png';
    CloudNote.Loading='<div class="CloudNoteLoading"></div><p class="CloudNoteLoadingTips">正在加载</p>';
    CloudNote.NoTips='<div class="CloudNoteNoTips sf-icon-clock"></div><p class="CloudNoteLoadingTips">没有备忘录可以显示</p>';
    CloudNote.TypeList=$(".CloudNoteLeftNav li");
    CloudNote.CloudNoteContent=$(".CloudNoteContent");
    CloudNote.AllType=CloudNote.CloudNoteContent[0];
    CloudNote.BackUpType=CloudNote.CloudNoteContent[1];
    CloudNote.DealtType=CloudNote.CloudNoteContent[2];
    CloudNote.FinishType=CloudNote.CloudNoteContent[3];
    CloudNote.NowType=CloudNote.AllType;
    CloudNote.MenuBtn=$(".CloudNoteAddBtn")[0];
    CloudNote.AddButton=$(".CloudNoteBtnContainer button");
    for(var i=0;i<CloudNote.TypeList.length;i++){
        (function (i) {
            CloudNote.TypeList[i].onclick=function () {
                for(var j=0;j<CloudNote.TypeList.length;j++){
                    CloudNote.TypeList[j].className='';
                    CloudNote.CloudNoteContent[j].style.display='none';
                }
                CloudNote.TypeList[i].className='CloudNoteLeftNavActive';
                CloudNote.CloudNoteContent[i].style.display='block';
                if(i!==4) {
                    CloudNote.Load(this.getAttribute('data'),CloudNote.CloudNoteContent[i]);
                    CloudNote.NowType=CloudNote.CloudNoteContent[i];
                }else{
                    CloudNote.ShowInCalendar();
                }
            }
        })(i)
    }
    CloudNote.AddButton[0].onmousedown=CloudNote.AddButton[1].onmousedown = function(e) {
        var title=this.getAttribute('tooltip');
        var type=this.getAttribute('data');
        $.Window.NewWindow({
            id: 'CloudNoteAdd',
            className: 'SlimfWindow',
            width: '550px',
            height: '385px',
            mini: false,
            biggest: false,
            resize: false,
            title: '',
            state:'restore',
            mission: false,
            bg: '#43495A',
            color:'#fff',
            callback:function (a) {
                var b=$.CreateElement({
                    tag:"div",
                    className:'NoteAddTitle',
                    node:a
                });
                $.CreateElement({
                    tag:"img",
                    attr:{"src":$(".CloudNoteHead img")[0].src,"draggable":"false"},
                    node:b
                });
                $.CreateElement({
                    tag:"p",
                    html:title,
                    node:b
                });
                var c=$.CreateElement({
                    tag:"textarea",
                    className:'NoteAddArea',
                    html:$.Time.now('Y年m月d日'),
                    node:a
                });
                disabled=false;
                var d=$.CreateElement({
                    tag:"button",
                    className:'NoteSubBtn',
                    html:"<span class='sf-icon-check'></span>",
                    node:a
                });
                c.onkeydown=function () {
                    if(($.String.length(c.value)-c.value.split('\n').length-1)>0){
                        d.style.right='0px';
                    }else{
                        d.style.right='-60px';
                    }
                };
                d.onclick=function () {
                    this.disabled = true;
                    this.innerHTML="<span class='sf-spin  sf-icon-circle-notch'></span>";
                    d.style.right='-60px';
                    if(c.value&&b.innerHTML.length&&c.value.length>1){
                        CloudMain.Ajax({
                            url:"/service/note/NewNote",
                            data: {
                                noteContent: c.value,
                                noteType:type
                            },
                            success: function(rs) {
                                if(rs[0].note_id) {
                                    if(CloudNote.NowType===CloudNote.AllType){
                                        type=null;
                                    }
                                    CloudNote.Load(type,CloudNote.NowType);
                                    $.Window.Close(a.parentNode);
                                }
                            }
                        });
                    }else{
                        $.Toast('不能创建空的便签');
                    }
                }
            },
            node:CloudNote.Main
        });
    };
    CloudNote.MenuContainer=$(".CloudNoteBtnContainer")[0];
    CloudNote.Main.onmousedown=function () {
        if(CloudNote.MenuBtn.className!=='sf-icon-plus CloudNoteAddBtn'){
            CloudNote.MenuBtn.className = 'sf-icon-plus CloudNoteAddBtn';
            CloudNote.MenuContainer.className+=' animated slideOutDown';
            var time=setTimeout(function () {
                CloudNote.MenuContainer.style.display='none';
                CloudNote.MenuContainer.className='CloudNoteBtnContainer';
                clearTimeout(time)
            },350);
        }
    };
    CloudNote.MenuBtn.onmousedown=function (e) {
        e.stopPropagation();
        if(this.className==='sf-icon-plus CloudNoteAddBtn') {
            this.className = 'sf-icon-plus CloudNoteAddBtn CloudNoteAddBtnActive';
            CloudNote.MenuContainer.style.display='block';
        }else {
            this.className = 'sf-icon-plus CloudNoteAddBtn';
            CloudNote.MenuContainer.className+=' animated slideOutDown';
            var time=setTimeout(function () {
                CloudNote.MenuContainer.style.display='none';
                CloudNote.MenuContainer.className='CloudNoteBtnContainer';
                clearTimeout(time)
            },350);
        }
    };
    CloudNote.Load(null,CloudNote.AllType);
}();