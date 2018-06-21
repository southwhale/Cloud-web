CloudMusic=$.NameSpace.register('CloudMusic');
/*今日推荐*/
CloudMusic.Recommend=function () {
    CloudMusic.NormalList[0].innerHTML=CloudMusic.Loading+'<p style="text-align: center;margin-top: 10px;">正在生成今日推荐</p>';
    CloudMain.Ajax({
        
        url:"/service/music/Recommend",
        
        success: function(rs) {
            CloudMusic.NormalList[0].innerHTML='';
            var count=0;
            var music_name, singername,music_cover,music_time,music_album,song_id, mv_id;
            for (var i = 0; i < rs.length; i++) {
                music_name = rs[i].name;
                singername=rs[i].ar[0].name;
                music_cover = rs[i].al.picUrl;
                song_id = rs[i].id;
                mv_id = rs[i].mv;
                music_time=rs[i].dt;
                music_album=rs[i].al.name;
                count++;
                CloudMusic.Search.PrintResult(count,music_name,singername, music_cover,song_id,mv_id,music_time,music_album,CloudMusic.NormalList[0]);
            }
            if(rs.length===0){
                CloudMusic.NormalList[0].innerHTML='<li class="CloudMusicNoTips">您还没有听过任何歌曲，无法生成推荐</li>';
            }
        }
    });
};
/*加载用户歌单*/
CloudMusic.LoadCustomList=function () {
    CloudMusic.CustomSwitchContainer=$(".CloudMusicCustomLeft")[0];
    var music_list_id,music_list_name,music_list_time,music_list_cover;
    CloudMain.Ajax({
        url:"/service/music/GetMusicList",
        success: function(rs) {
           if(rs.length){
                for (var i = 0; i < rs.length; i++) {
                    music_list_id = rs[i].music_list_id;
                    music_list_name = rs[i].music_list_name;
                    music_list_time = rs[i].music_list_time;
                    music_list_cover = rs[i].music_list_cover;
                    CloudMusic.PrintCustomList(music_list_id,music_list_name,music_list_time,music_list_cover);
                }
            }
            if(CloudMusic.CustomListBind()){
                CloudMusic.LoadMusic()
            }
        }
    });
};
CloudMusic.CustomListBind=function () {
    CloudMusic.CustomSwitch=$(".CloudMusicCustomLeft li");
    CloudMusic.CustomHead=$(".CloudMusicCustomListHead *");
    CloudMusic.CustomList=$(".CloudMusicCustomList ul");
    for(var j=0;j<CloudMusic.CustomSwitch.length;j++){
        (function (j) {
            CloudMusic.CustomSwitch[j].onclick=function () {
                CloudMusic.MainSwitch[0].click();
                CloudMusic.CustomListContainer.style.display='block';
                CloudMusic.NormalListContainer.style.display='none';
                for (var i = 0; i < CloudMusic.CustomSwitch.length; i++) {
                    CloudMusic.CustomSwitch[i].className='';
                    CloudMusic.CustomList[i].style.display='none';
                }
                for(i=0;i<CloudMusic.NormalSwitch.length;i++){
                    CloudMusic.NormalSwitch[i].className='';
                    CloudMusic.NormalList[i].style.display='none';
                }
                CloudMusic.CustomHead[0].src=CloudMusic.CustomSwitch[j].data.music_list_cover;
                CloudMusic.CustomHead[1].innerHTML=CloudMusic.CustomSwitch[j].data.music_list_name;
                CloudMusic.CustomHead[2].innerHTML='创建于:'+CloudMusic.CustomSwitch[j].data.music_list_time.slice(0,11);
                CloudMusic.CustomSwitch[j].className='CloudMusicLeftActive';
                CloudMusic.CustomList[j].style.display='block';
            }
        })(j)
    }
    return true;
};
CloudMusic.PrintCustomList=function (id,name,time,cover) {
    var a=$.CreateElement({
        tag:"li",
        html:name,
        attr:{"ripple":""},
        node:CloudMusic.CustomSwitchContainer
    });
    a.data={
        "music_list_id":id,
        "music_list_time":time,
        "music_list_name":name,
        "music_list_cover":cover?cover:'public/img/music/cover.png'
    };
   a.onmousedown=function (e) {
        $.MouseMenu(CloudMusic.MusicListMenu,this,CloudMusic.CustomListRightMenu,e);
   };
   if(!$("#CloudMusicCl_"+id)[0]){
        $.CreateElement({
            tag: "ul",
            id: 'CloudMusicCl_' + id,
            node: CloudMusic.CustomListContainer
        });
    }
};
/*加载用户歌曲*/
CloudMusic.LoadMusic=function () {
    var music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id;
    CloudMusic.SongArr=[];
    CloudMain.Ajax({
        url:"/service/music/GetMusic",
        success: function(rs) {
            if (rs.length === 0) {
                CloudMusic.NormalList[1].innerHTML=CloudMusic.NoTips;
                CloudMusic.NormalList[2].innerHTML=CloudMusic.NoTips;
            } else {
                CloudMusic.NormalList[2].innerHTML='';
                var like=0, list={},count=0,locale=0;
                for (var i = 0; i < rs.length; i++) {
                    music_id = rs[i].music_id;
                    music_name = rs[i].music_name;
                    music_cover = rs[i].music_cover;
                    music_like=rs[i].music_like;
                    music_list=rs[i].music_list;
                    music_time=rs[i].music_time;
                    music_album=rs[i].music_album;
                    music_url = rs[i].music_url;
                    song_id = rs[i].song_id;
                    mv_id = rs[i].mv_id;
                    CloudMusic.SongArr.push(rs[i]);
                    count++;
                    CloudMusic.PrintMusic(count,music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id,CloudMusic.NormalList[2],music_url);
                    if(music_like>0) {
                        like++;
                        CloudMusic.PrintMusic(like, music_id, music_name, music_cover, music_like, music_list, music_time, music_album, song_id, mv_id, CloudMusic.CustomList[0],music_url);
                    }
                    if(music_list!=='0'){
                        !list[music_list] ? (list[music_list] = 1):  list[music_list]++;
                        CloudMusic.PrintMusic(list[music_list], music_id, music_name, music_cover, music_like, music_list, music_time, music_album, song_id, mv_id, $("#CloudMusicCl_"+music_list)[0],music_url);
                    }
                    if(music_url){
                        locale++;
                        CloudMusic.PrintMusic(locale,music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id,CloudMusic.NormalList[1],music_url);
                    }
                }
                if(locale===0){
                    CloudMusic.NormalList[1].innerHTML=CloudMusic.NoTips;
                }
                if(like===0){
                    CloudMusic.CustomList[0].innerHTML=CloudMusic.NoTips;
                }
                for(var j in list){
                    if(list[j]===0){
                        $("#CloudMusicCl_"+music_list)[0].innerHTML=CloudMusic.NoTips;
                    }
                }
            }
            CloudMusic.CustomSwitch[0].data= {
                "music_list_id": 0,
                "music_list_time": $.Time.now('Y-m-d'),
                "music_list_name": '我喜欢的音乐',
                "music_list_cover":  CloudMusic.CustomList[0].childNodes[1]?CloudMusic.CustomList[0].childNodes[CloudMusic.CustomList[0].childNodes.length-1].data.music_cover:'public/img/music/cover.png'
            };
        }
    });
};
CloudMusic.PrintMusic=function (i, music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id,where,locale) {
    if(music_album===''||music_album===null){
        music_album='暂无专辑'
    }
    if(music_time===''||music_time===null){
        music_time='00:00'
    }
    var a=$.CreateElement({
        tag:'li',
        attr:{"ripple":""},
        className:'CloudMusicLi',
        node:where
    });
    a.data={
        "music_id":music_id,
        "music_name":music_name,
        "music_cover":music_cover,
        "mv_id":mv_id,
        "song_id":song_id,
        "music_like":music_like,
        "music_list":music_list,
        "music_time":music_time,
        "music_album":music_album,
        "music_url":locale
    };
    var b=$.CreateElement({
        tag:'span',
        html:$.String.zeroize(i),
        node:a
    });
    var c=$.CreateElement({
        tag:'span',
        className:'CloudMusicLiTitle',
        html:music_name.split("-")[1],
        node:a
    });
    var d=$.CreateElement({
        tag:'span',
        className:'CloudMusicLiSinger',
        html:music_name.split("-")[0],
        node:a
    });
    var e=$.CreateElement({
        tag:'span',
        className:'CloudMusicLiSinger',
        html:music_album,
        node:a
    });
    var f=$.CreateElement({
        tag:'span',
        className:'CloudMusicLiTime',
        html:$.Time.msDeal(music_time),
        node:a
    });
    var g=$.CreateElement({
        tag:'span',
        node:a
    });
    var h=$.CreateElement({
        className:"sf-icon-heart-o",
        attr:{"state":'nolove'},
        node:g
    });
    a.data.like=h;
    var j=$.CreateElement({
        className:"sf-icon-download",
        attr:{"tooltip":"下载到本地","download":""},
        node:g
    });
    j.onmousedown=function () {
        CloudMusic.DownloadMusic(a);
    };
    var k=$.CreateElement({
        className:"sf-icon-trash",
        attr:{"tooltip":"删除"},
        node:g
    });
    var l=$.CreateElement({
        className:"sf-icon-share",
        attr:{"tooltip":"分享"},
        node:g
    });
    if(mv_id!=='0'&&mv_id!==0){
        var m=$.CreateElement({
            className:'sf-icon-youtube-play',
            attr:{"tooltip":"播放MV"},
            node:g
        });
        m.onmousedown = function() {
            CloudMusic.GetMusicMv(a);
        };
        m.onclick=function (event) {
            this.onfocus = function() {
                this.blur()
            };
            (event || window.event).cancelBubble = true
        }
    }
    if(music_like>0){
        h.className='sf-icon-heart';
        h.setAttribute("state",'love');
    }
    h.onclick = j.onclick = k.onclick = l.onclick= function(event) {
        this.onfocus = function() {
            this.blur()
        };
        (event || window.event).cancelBubble = true
    };
    h.onmouseover=function () {
        if(this.getAttribute("state")!=='love'){
            h.className='sf-icon-heart';
        }
    };
    h.onmouseout=function () {
        if(this.getAttribute("state")==="nolove"){
            h.className='sf-icon-heart-o';
        }
    };
    h.onmousedown=function () {
        CloudMusic.LikeMusic(this.getAttribute("state"),this,a);
    };
    l.onmousedown = function() {
        CloudMusic.ShareMusic(a);
    };
    k.onmousedown=function () {
        CloudMusic.DeleteMusic  (a,i);
    };
    a.onclick=function () {
        if(!CloudMusic.PlayerControl.pending) {
            CloudMusic.PlayerControl.Start(a);
        }else {
            CloudMusic.Toast('正在请求上次的操作');
        }
    }
};
/*CloudMusic专用Toast*/
CloudMusic.Toast=function (msg) {
    var b =$(".CloudMusicToast")[0];
    b.style.display='block';
    b.innerHTML=msg;
    setTimeout(function () {
        b.className += ' animated fadeOut';
        setTimeout(function () {
            b.style.display='none';
           b.className='CloudMusicToast animated fadeIn';
        }, 300);
    }, 2000);
};
/*音乐记录操作*/
CloudMusic.DeleteMusic = function(this_music,int) /*删除音乐*/ {
    int=int-1;
    music_name = this_music.data.music_name;
    music_id = this_music.data.music_id;
    music_src = this_music.data.music_src;
    if($.String.exist(this_music.className,'CloudMusicPlay')){
        CloudMusic.Toast('正在播放该歌曲，无法删除');
        return false;
    }
    CloudMusic.DoDeleteMusic = function(a) {
        $.Window.Close(a);
        CloudMain.Ajax({
            url:"/service/music/DeleteMusic",
            data: {
                type:this_music.data.music_url,
                music_id: music_id
            },
            success: function(rs) {
                if (rs[0].state) {
                    var MusicListContainer=this_music.parentNode.childNodes;
                    var Container=this_music.parentNode;
					this_music.remove();
                    CloudMusic.SongArr.splice(int,1);
                    for(var i=0;i<CloudMusic.PlayerControl.PlayMusic.length;i++){
                        if(CloudMusic.PlayerControl.PlayMusic[i].data.music_id===music_id){
							CloudMusic.PlayerControl.PlayMusic[i].remove();
                        }
                    }
                    if (MusicListContainer.length=== 0) {
                        Container.innerHTML=CloudMusic.NoTips;
                    }
                    CloudMusic.Toast('已删除');
                }else {
                    CloudMusic.Toast('删除失败,出错了');
                }
            }
        });
    };
    $.Confirm({
        id: 'CloudMusicMusicConfirm',
        node: CloudMusic.Main,
        title: '删除确认',
        notic: "确认删除 " + music_name + " 这首音乐吗",
        submit_func: CloudMusic.DoDeleteMusic
    });
};
CloudMusic.ShareMusic=function (a) {
    CloudMusic.Toast('分享功能暂未实现');
};
CloudMusic.GetMusicMv = function(a) /*播放MV*/ {
    var mv_id = a.data.mv_id;
    var music_name = a.data.music_name;
    CloudMusic.GetMusicMv.Get=function (a) {
        CloudMain.Ajax({
            url:"/service/music/PlayMusic",
            data: {
                type:2,
                data: mv_id
            },
            success: function (rs) {
                a.innerHTML='';
                var aa=$.CreateElement({
                    tag:'ul',
                    node:a
                });
                if (rs[0].data.brs[240]) {
                    var bb0=$.CreateElement({
                        tag:'li',
                        html:'240P',
                        node:aa
                    });
                    bb0.onclick = function () {
                        $.VideoPlayer(music_name, rs[0].data.brs[240]);
                        $.Window.Close(a.parentNode.parentNode);
                    }
                }
                if (rs[0].data.brs[480]) {
                    var bb=$.CreateElement({
                        tag:'li',
                        html:'480P',
                        node:aa
                    });
                    bb.onclick = function () {
                        $.VideoPlayer(music_name, rs[0].data.brs[480]);
                        $.Window.Close(a.parentNode.parentNode);
                    }
                }
                if (rs[0].data.brs[720]) {
                    var bb1=$.CreateElement({
                        tag:'li',
                        html:'720P',
                        node:aa
                    });
                    bb1.onclick = function () {
                        $.VideoPlayer(music_name, rs[0].data.brs[720]);
                        $.Window.Close(a.parentNode.parentNode);
                    }
                }
                if (rs[0].data.brs[1080]) {
                    var bb2=$.CreateElement({
                        tag:'li',
                        html:'1080P',
                        node:aa
                    });
                    bb2.onclick = function () {
                        $.VideoPlayer(music_name, rs[0].data.brs[1080]);
                        $.Window.Close(a.parentNode.parentNode);
                    }
                }
                return aa;
            },
            
        });
    };
    $.Confirm({
        id: 'CloudMusicMusicConfirm',
        node: CloudMusic.Main,
        title: '选择画质',
        notic: '正在加载',
        callback:CloudMusic.GetMusicMv.Get
    });
};
CloudMusic.DownloadMusic=function (this_music) {
    if(this_music.data.music_src){
        $.Request.download(this_music.data.music_src,this_music.data.music_name);
        $.Toast('开始下载');
        return false;
    }
    CloudMain.Ajax({
        url:"/service/music/PlayMusic",
        data: {
            type: 1,
            data: this_music.data.song_id
        },
        success: function (rs) {
            if (rs[0].data[0].url||this_music.data.music_url) {
                var url=this_music.data.music_url?this_music.data.music_url:rs[0].data[0].url;
                this_music.data.music_src=url;
                $.Toast('开始下载');
                $.Request.download(url,this_music.data.music_name)
            } else {
                $.Toast('无法下载');
            }
        }
    });
};
CloudMusic.LikeMusic=function (state,btn,this_music) {
    var count=0,rs=[],like=0;
    var music_id=this_music.data.music_id;
    for(var i=0;i<CloudMusic.SongArr.length;i++){
        if(CloudMusic.SongArr[i].music_id===music_id){
            count=i;
            rs=CloudMusic.SongArr[i];
        }
    }
    if(state!=='love'){
        btn.setAttribute("state","love");
        btn.className='sf-icon-heart';
        rs.music_like='1';
        like='1';
    }else{
        btn.setAttribute("state","nolove");
        btn.className='sf-icon-heart-o';
        rs.music_like='0';
        like='0';
    }
    var a=document.getElementsByClassName("CloudMusicLi");
    CloudMain.Ajax({
        url:"/service/music/CollectMusic",
        data: {
            music_id: music_id,
            like: like
        },
        success: function(r) {
            if(like==='1'&&r[0].state){
                CloudMusic.Toast('已收藏');
                CloudMusic.SongArr.splice(count,1);
                CloudMusic.SongArr.splice(count,0,rs);
                CloudMusic.PrintMusic(CloudMusic.CustomList[0].childNodes.length, rs.music_id, rs.music_name, rs.music_cover, rs.music_like, rs.music_list, rs.music_time, rs.music_album, rs.song_id, rs.mv_id, CloudMusic.CustomList[0]);
                for(var k=0;k<a.length;k++){
                    if(a[k].data.music_id===music_id) {
                        a[k].data.like.setAttribute("state","love");
                        a[k].data.like.className = 'sf-icon-heart';
                    }
                }
            }
            else if(like==='0'&&r[0].state){
                CloudMusic.Toast('取消收藏');
                CloudMusic.SongArr.splice(count,1);
                CloudMusic.SongArr.splice(count,0,rs);
                for(var j=0;j<CloudMusic.CustomList[0].childNodes.length;j++){
                    if(CloudMusic.CustomList[0].childNodes[j].data.music_id===music_id){
						CloudMusic.CustomList[0].childNodes[j].remove();
                    }
                }
                for(var m=0;m<a.length;m++){
                    if(a[m].data.music_id===music_id) {
                        a[m].data.like.setAttribute("state","nolove");
                        a[m].data.like.className = 'sf-icon-heart-o';
                    }
                }
            }
            else{
                CloudMusic.Toast('操作失败');
            }
        }
    });
};
CloudMusic.AddMusic=function (this_music) {
    CloudMusic.AddMusic.Select=function (this_list,this_music,like) {
        var list_id=0;
        if(this_list===0){
            list_id=0;
        }
        else {
            list_id = this_list.getAttribute('music_list_id');
        }
        var songid = this_music.data.song_id;
        var music_name = this_music.data.music_name;
        var music_cover = this_music.data.music_cover;
        var mv_id = this_music.data.mv_id;
        var music_album=this_music.data.music_album;
        var songtime=this_music.data.songTime;
        CloudMain.Ajax({
            url:"/service/music/SaveMusic",
            data: {
                song_id: songid,
                music_cover: music_cover,
                music_name: music_name.replace(/'/g, '"'),
                mv_id: mv_id,
                music_album:music_album,
                songtime:songtime,
                list_id:list_id,
                like:like
            },
            success: function(rs) {
                if (parseInt(rs[0].state) === 1) {
                    CloudMusic.Toast('添加成功');
                    CloudMusic.SongArr.push(rs[0]);
                    if(CloudMusic.NormalList[2].innerHTML===CloudMusic.NoTips){
                        CloudMusic.NormalList[2].innerHTML='';
                    }
                    CloudMusic.PrintMusic(CloudMusic.NormalList[2].childNodes.length+1,rs[0].music_id, music_name, music_cover,like,list_id,songtime,music_album,songid, mv_id,CloudMusic.NormalList[2]);
                    if(list_id!==0) {
                        if($("#CloudMusicCl_"+list_id)[0].innerHTML===CloudMusic.NoTips){
                            $("#CloudMusicCl_"+list_id)[0].innerHTML='';
                        }
                        CloudMusic.PrintMusic($("#CloudMusicCl_"+list_id)[0].childNodes.length+1, rs[0].music_id, music_name, music_cover, like, list_id, songtime, music_album, songid, mv_id,$("#CloudMusicCl_"+list_id)[0]);
                    }
                    if(like>0){
                        if(CloudMusic.CustomList[0].innerHTML===CloudMusic.NoTips){
                            CloudMusic.CustomList[0].innerHTML='';
                        }
                        CloudMusic.PrintMusic(CloudMusic.CustomList[0].childNodes.length+1, rs[0].music_id, music_name, music_cover, like, list_id, songtime, music_album, songid, mv_id,CloudMusic.CustomList[0]);
                    }
                }
                else if(parseInt(rs[0].state) === 2){
                    CloudMusic.Toast('歌曲已在库中');
                }
                else {
                    CloudMusic.Toast('添加失败');
                }
            }
        });
        $.Window.Close($("#CloudMusicMusicConfirm")[0]);
    };
    CloudMusic.AddMusic.GetListInfo=function (node) {
        CloudMain.Ajax({
            url:"/service/music/GetMusicList",
            success: function (rs) {
                node.innerHTML='';
                var aa=$.CreateElement({
                    tag:'ul',
                    node:node
                });
                var a11=$.CreateElement({
                    tag:"li",
                    html: '默认列表',
                    node:aa
                });
                var a1=$.CreateElement({
                    tag:"li",
                    html: '我喜欢的音乐',
                    node:aa
                });
                a1.onclick=function () {
                    CloudMusic.AddMusic.Select(0,this_music,1);
                };
                a11.onclick=function () {
                    CloudMusic.AddMusic.Select(0,this_music,0);
                };
                for (var i = 0; i < rs.length; i++) {
                    var a=$.CreateElement({
                        tag:"li",
                        html: rs[i].music_list_name,
                        attr:{"music_list_id":rs[i].music_list_id},
                        node:aa
                    });
                    a.onclick=function () {
                        CloudMusic.AddMusic.Select(this,this_music,0);
                    }
                }
                a11.click();
            },
            
        });
    };
    $.Confirm({
        id: 'CloudMusicMusicConfirm',
        node: CloudMusic.Main,
        title: '选择歌单',
        notic: '正在加载',
        callback:CloudMusic.AddMusic.GetListInfo
    });
};
CloudMusic.UploadMusic=function () {
    CloudMusic.UploadMusic.Success=function (rs) {
        if(CloudMusic.NormalList[1].innerHTML===CloudMusic.NoTips){
            CloudMusic.NormalList[1].innerHTML='';
        }
        var music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id;
        for(var i=0;i<rs.length;i++){
            music_id = rs[i].music_id;
            music_name = rs[i].music_name;
            music_cover = rs[i].music_cover;
            music_like=rs[i].music_like;
            music_list=rs[i].music_list;
            music_time=rs[i].music_time;
            music_album=rs[i].music_album;
            music_url = rs[i].music_url;
            song_id = rs[i].song_id;
            mv_id = rs[i].mv_id;
            CloudMusic.SongArr.push(rs[i]);
            CloudMusic.PrintMusic(CloudMusic.NormalList[1].children.length+1,music_id, music_name, music_cover,music_like,music_list,music_time,music_album,song_id, mv_id,CloudMusic.NormalList[1],music_url);
        }
    };
    CloudMusic.Toast('上传文件格式为 歌手-歌曲名');
    $.Request.upload('music','','service/music/UploadMusic',CloudMusic.UploadMusic.Success);
};
CloudMusic.NewMusicList=function () {
    CloudMusic.subAddMusicList=function (a) {
        var listName=$("#CloudMusicListName")[0].value;
        if(listName===''||listName===null){
            CloudMusic.Toast('请输入歌单名称');
            return false
        }
        CloudMain.Ajax({
            url:"/service/music/NewMlist",
            data: {
                musicListName:listName
            },
            success: function (rs) {
                if(rs[0].state>0){
                    CloudMusic.Toast('添加成功');
                    CloudMusic.PrintCustomList(rs[0].id,listName,rs[0].time);
                    CloudMusic.CustomListBind();
                }
            }
        });
        $.Window.Close(a);
    };
    $.Confirm({
        id: 'CloudMusicMusicConfirm',
        node: CloudMusic.Main,
        title: '添加歌单',
        notic: '输入歌单名称',
        confirm_input: 'CloudMusicListName',
        submit_func:CloudMusic.subAddMusicList,
        confirm_input_val: ''
    });
};
/*音乐搜索*/
CloudMusic.Search=function () {
    CloudMusic.Search.flag=false;
    CloudMusic.Search.Count=0;
    CloudMusic.Search.AllCount=0;
    CloudMusic.Search.Page=1;
    CloudMusic.Search.key=$(".CloudMusicSearchHead input")[0];
    CloudMusic.Search.Tag=$(".CloudMusicSearchFkey")[0];
    CloudMusic.Search.Tip=$(".CloudMusicSearchHead p")[0];
    CloudMusic.Search.Container=$(".CloudMusicSearchContainer ul")[0];
    CloudMusic.Search.Container.parentNode.onkeydown=function (e) {
        if(e.keyCode===13){
            if(CloudMusic.Search.key.value&&CloudMusic.Search.key.value!=='在此输入歌曲、歌手') {
                CloudMusic.Search.Page=1;
                CloudMusic.Search.Count=0;
                CloudMusic.Search.AllCount=0;
                CloudMusic.Search.Start(CloudMusic.Search.key.value,1);
            }else{
                CloudMusic.Toast('请输入关键词')
            }
            CloudMusic.Search.key.blur();
        }
    };
    CloudMusic.Search.Container.parentNode.onkeyup=function () {
        if(CloudMusic.Search.key.value&&CloudMusic.Search.key.value!=='在此输入歌曲、歌手') {
            CloudMusic.Search.Tag.innerHTML = CloudMusic.Search.key.value.charAt(CloudMusic.Search.key.value.length - 1);
        }else{
            CloudMusic.Search.Tag.innerHTML ='搜';
        }
    };
    CloudMusic.Search.Container.onmousewheel=function () {
        CloudMusic.Search.key.blur();
        if (this.scrollTop + this.offsetHeight >= this.scrollHeight-32 && CloudMusic.Search.Count <CloudMusic.Search.AllCount) {
            if(CloudMusic.Search.flag) {
                CloudMusic.Search.Page++;
				$("#CloudMusicLoadMore")[0].remove();
                CloudMusic.Search.Start(CloudMusic.Search.key.value, CloudMusic.Search.Page);
            }
        }
    };
    CloudMusic.Search.key.tabIndex=-1;
    CloudMusic.Search.Start=function (searchKey,pageNum) {
        if(pageNum===1) {
            CloudMusic.Search.Container.innerHTML = CloudMusic.Loading;
        }
        CloudMain.Ajax({
            url:"/service/music/SearchMusic",
            data: {
                data: searchKey,
                searchtype:1,
                pagenum:pageNum
            },
            success: function(rs) {
                if(rs.result.songs=== void 0){
                    CloudMusic.Toast('无结果');
                    CloudMusic.Search.Container.innerHTML =CloudMusic.NoTips;
                }
                CloudMusic.Search.AllCount=rs.result.songCount;
                rs = rs.result.songs;
                if(rs=== void 0){
                    return false;
                }
                else {
                    var songname, singername, songpic, songid, mvid,songTime,songAlbum;
                    if(CloudMusic.Search.Page===1) {
                        CloudMusic.Search.Container.innerHTML = '';
                        CloudMusic.Search.Container.scrollTop=0
                    }
                    for (var i = 0; i < rs.length; i++) {
                        songname = rs[i].name;
                        singername = rs[i].ar[0].name;
                        songpic = rs[i].al.picUrl;
                        songid = rs[i].id;
                        mvid = rs[i].mv;
                        songTime=rs[i].dt;
                        songAlbum=rs[i].al.name;
                        CloudMusic.Search.Count++;
                        CloudMusic.Search.PrintResult(CloudMusic.Search.Count,songname, singername, songpic, songid, mvid,songTime,songAlbum);
                    }
                    CloudMusic.Search.flag=true;
                    if(CloudMusic.Search.Count!==CloudMusic.Search.AllCount) {
                        $.CreateElement({
                            tag: "li",
                            id: "CloudMusicLoadMore",
                            html: '下拉加载更多...',
                            node: CloudMusic.Search.Container
                        });
                    }
                    CloudMusic.Search.Tip.innerHTML='搜索<span>“'+searchKey+'”</span>, 共找到'+CloudMusic.Search.AllCount+'条记录，当前显示了'+CloudMusic.Search.Count+'条';
                }
            }
        });
        CloudMusic.Search.flag=false;
    };
    CloudMusic.Search.PrintResult=function (i, songname, singername, songpic, songid, mvid,songTime,songAlbum,where) {
        if(songAlbum===''||songAlbum===null){
            songAlbum='暂无专辑'
        }
        if(songTime===''||songTime===null){
            songTime='00:00'
        }
        var a=$.CreateElement({
            tag:'li',
            className:'CloudMusicLi',
            attr:{"ripple":""},
            node:where?where:CloudMusic.Search.Container
        });
        a.data={
            "music_id":0,"music_name":singername+'-'+songname,"music_cover":songpic,"mv_id":mvid,"song_id":songid,"music_album":songAlbum,"songTime":songTime
        };
        $.CreateElement({
            tag:'span',
            html:$.String.zeroize(i),
            node:a
        });
        $.CreateElement({
            tag:'span',
            className:'CloudMusicLiTitle',
            html:songname,
            node:a
        });
        $.CreateElement({
            tag:'span',
            className:'CloudMusicLiSinger',
            html:singername,
            node:a
        });
        $.CreateElement({
            tag:'span',
            className:'CloudMusicLiSinger',
            html:songAlbum,
            node:a
        });
        $.CreateElement({
            tag:'span',
            className:'CloudMusicLiTime',
            html:$.Time.msDeal(songTime),
            node:a
        });
        var g=$.CreateElement({
            tag:'span',
            node:a
        });
        var h=$.CreateElement({
            className:"sf-icon-plus",
            attr:{"tooltip":"添加到我的音乐"},
            node:g
        });
        h.onmousedown=function () {
            CloudMusic.AddMusic(a);
        };
        var j=$.CreateElement({
            className:"sf-icon-download",
            attr:{"tooltip":"下载到本地"},
            node:g
        });
        j.onmousedown=function () {
            CloudMusic.DownloadMusic(a);
        };
        if(mvid !== '' && mvid !== 0){
            var m=$.CreateElement({
                className:'sf-icon-youtube-play',
                attr:{"tooltip":"播放MV"},
                node:g
            });
            m.onmousedown = function() {
                CloudMusic.GetMusicMv(a);
            };
            m.onclick=function (event) {
                this.onfocus = function() {
                    this.blur()
                };
                (event || window.event).cancelBubble = true
            }
        }
        j.onclick = h.onclick=function(event) {
            this.onfocus = function() {
                this.blur()
            };
            (event || window.event).cancelBubble = true
        };
        a.onclick=function () {
            if(!CloudMusic.PlayerControl.pending) {
                CloudMusic.PlayerControl.Start(this);
            }else {
                CloudMusic.Toast('正在请求上次的操作');
            }
        }
    }
};
/*音乐播放控制*/
CloudMusic.PlayerControl=function () {
    CloudMusic.PlayerControl.PlayMusic=CloudMusic.Main.getElementsByClassName('CloudMusicLi');
    CloudMusic.PlayerControl.Main=$(".CloudMusicPlayer")[0];
    CloudMusic.PlayerControl.Background=$(".CloudMusicPlayerFliter")[0];
    CloudMusic.PlayerControl.Needle=$(".CloudMusicNeedle")[0];
    CloudMusic.PlayerControl.Cover=$(".CloudMusicPlayerCoverContainer img")[0];
    CloudMusic.PlayerControl.Block=$(".CloudMusicLeftPlayer *");
    CloudMusic.PlayerControl.Info=$(".CloudMusicPlayerRightInfo *");
    CloudMusic.PlayerControl.Lyr=$("#CloudMusicPlayerLyrList")[0];
    CloudMusic.PlayerControl.Close=$(".CloudMusicPlayer button")[0];
    CloudMusic.PlayerControl.Slider=$(".CloudMusicSlider")[0];
    CloudMusic.PlayerControl.TmpSlider=$(".CloudMusicTempSlider")[0];
    CloudMusic.PlayerControl.Volumn=$(".CloudMusicVolumnContainer")[0];
    CloudMusic.PlayerControl.Time=$(".CloudMusicTime")[0];
    CloudMusic.PlayerControl.AllTime=$(".CloudMusicTime")[1];
    CloudMusic.PlayerControlpreload_lrc=$("#CloudMusicPlayerpreload_lrc")[0];
    CloudMusic.PlayerControl.Player=$(".CloudMusicBottom audio")[0];
    CloudMusic.PlayerControl.PlayerBtn=$(".CloudMusicControl *");
    CloudMusic.PlayerControl.PlayState=$(".CloudMusicPlayMode")[0];
    CloudMusic.PlayerControl.NowPlayList=null;
    CloudMusic.PlayerControl.NowPlaying=null;
    CloudMusic.PlayerControl.NowPlayCount=null;
    CloudMusic.PlayerControl.PlayList=null;
    CloudMusic.PlayerControl.Block[0].parentNode.onclick=CloudMusic.PlayerControl.Close.onclick=function () {
        if(CloudMusic.PlayerControl.Main.offsetWidth){
            CloudMusic.PlayerControl.Main.style.width=CloudMusic.PlayerControl.Main.style.height='0px';
        }else{
            CloudMusic.PlayerControl.Main.style.width='100%';
            CloudMusic.PlayerControl.Main.style.height='calc(100% - 110px)';
        }
    };
    CloudMusic.PlayerControl.Player.addEventListener("ended",function(){CloudMusic.PlayerControl.Next()});
    CloudMusic.PlayerControl.Player.addEventListener("loadedmetadata", function() {
        setInterval(function() {
            var widthline = Math.round(CloudMusic.PlayerControl.Player.currentTime) / Math.round(CloudMusic.PlayerControl.Player.duration) * 100;
            CloudMusic.PlayerControl.Slider.style.width = widthline + "%";
        }, 500);
    });
    CloudMusic.PlayerControl.Player.addEventListener("progress", function() {
        try {
            var timeBuffered = CloudMusic.PlayerControl.Player.buffered.end(CloudMusic.PlayerControl.Player.buffered.length - 1);
            CloudMusic.PlayerControl.TmpSlider.style.width = (timeBuffered / CloudMusic.PlayerControl.Player.duration).toFixed(2) * 100 + '%';
        }
        catch (e){}
    });
    CloudMusic.PlayerControl.Player.addEventListener("timeupdate", function() {
        if((Math.round(CloudMusic.PlayerControl.Player.currentTime) / Math.round(CloudMusic.PlayerControl.Player.duration) * 100)>0){
            CloudMusic.PlayerControl.Time.innerHTML =$.Time.sDeal(CloudMusic.PlayerControl.Player.currentTime);
            CloudMusic.PlayerControl.AllTime.innerHTML= $.Time.sDeal(CloudMusic.PlayerControl.Player.duration);
        }else{
            CloudMusic.PlayerControl.Time.innerHTML = "00:00";
            CloudMusic.PlayerControl.AllTime.innerHTML= "00:00";
        }
    });
    CloudMusic.PlayerControl.Player.addEventListener("durationchange",function () {
        CloudMusic.PlayerControl.PlayerBtn[1].className='sf-icon-play';
    });
    CloudMusic.PlayerControl.Player.addEventListener("seeking",function () {
        CloudMusic.PlayerControl.PlayerBtn[1].className='sf-icon-circle-notch sf-spin';
    });
    CloudMusic.PlayerControl.Player.addEventListener("canplay",function () {
        if(CloudMusic.PlayerControl.Player.paused){
            CloudMusic.PlayerControl.PlayerBtn[1].className='sf-icon-play';
        }else{
            CloudMusic.PlayerControl.PlayerBtn[1].className='sf-icon-pause';
        }
    });
    CloudMusic.PlayerControl.Slider.parentNode.onmousedown=function (e) {
        $.MediaControl(CloudMusic.PlayerControl.Player,'play','x',this,e);
    };
    CloudMusic.PlayerControl.Volumn.onmousedown=function (e) {
        $.MediaControl(CloudMusic.PlayerControl.Player, 'volunmn', 'x', this, e);
    };
    CloudMusic.PlayerControl.Start=function (this_music) {
        for(var i=0;i<CloudMusic.PlayerControl.PlayMusic.length;i++){
            CloudMusic.PlayerControl.PlayMusic[i].className='CloudMusicLi';
        }
        this_music.className+=' CloudMusicPlay';
        CloudMusic.PlayerControl.NowPlayList=this_music.parentNode;
        CloudMusic.PlayerControl.PlayList=this_music.parentNode.childNodes;
        CloudMusic.PlayerControl.NowPlaying=this_music;
        for(var j=0;j<CloudMusic.PlayerControl.PlayList.length;j++){
            if(this_music===CloudMusic.PlayerControl.PlayList[j]){
                CloudMusic.PlayerControl.NowPlayCount=j;
            }
        }
        CloudMusic.PlayerControl.Cover.src=this_music.data.music_cover;
        CloudMusic.PlayerControl.Background.style.background="url("+this_music.data.music_cover+")";
        CloudMusic.PlayerControl.Info[0].innerHTML=this_music.data.music_name.split('-')[1];
        CloudMusic.PlayerControl.Info[1].innerHTML='歌手：'+this_music.data.music_name.split('-')[0];
        CloudMusic.PlayerControl.Info[2].innerHTML='专辑：'+this_music.data.music_album;
        CloudMusic.PlayerControl.Block[0].src=this_music.data.music_cover;
        CloudMusic.PlayerControl.Block[1].innerHTML=this_music.data.music_name.split('-')[1];
        CloudMusic.PlayerControl.Block[2].innerHTML=this_music.data.music_name.split('-')[0];
        CloudMusic.PlayerControl.pending=true;
        CloudMain.Ajax({
            url:"/service/music/PlayMusic",
            data: {
                type: 1,
                data: this_music.data.song_id
            },
            success: function (rs) {
                CloudMusic.PlayerControl.pending=false;
                if (rs[0].data[0].url||this_music.data.music_url) {
                    CloudMusic.PlayerControl.Player.setAttribute("src", this_music.data.music_url?this_music.data.music_url:rs[0].data[0].url);
                    CloudMusic.PlayerControl.Play();
                    CloudMusic.PlayerControl.PlayerBtn[1].className = 'sf-icon-pause';
                } else {
                    CloudMusic.Toast('资源丢失');
                    CloudMusic.PlayerControl.Next();
                }
                try {
                    if (rs[1].lrc.lyric !== '' || rs[1].lrc.lyric !== null) {
                        CloudMusic.PlayerControl.CreateLrc.start(rs[1].lrc.lyric, function () {
                            return CloudMusic.PlayerControl.Player.currentTime;
                        });
                    } else {
                        rs[1].lrc.lyric = '[00:02.00]暂无歌词';
                    }
                }
                catch (e) {
                }
            },
            
        });
    };
    CloudMusic.PlayerControl.PlayerBtn[0].onclick=function () {
        CloudMusic.PlayerControl.Prev();
    };
    CloudMusic.PlayerControl.PlayerBtn[1].onclick=function () {
        if(CloudMusic.PlayerControl.Player.paused&&CloudMusic.PlayerControl.Player.src!==location.href&&CloudMusic.PlayerControl.Player.src!==''){
            CloudMusic.PlayerControl.Play();
            this.className='sf-icon-pause';
        }else {
            CloudMusic.PlayerControl.Pause();
            this.className='sf-icon-play';
        }
    };
    CloudMusic.PlayerControl.PlayerBtn[2].onclick=function () {
        CloudMusic.PlayerControl.Next();
    };
    CloudMusic.PlayerControl.PlayState.State=false;
    CloudMusic.PlayerControl.PlayState.onclick=function () {
        if(CloudMusic.PlayerControl.PlayState.State){
            CloudMusic.PlayerControl.PlayState.className='CloudMusicPlayMode sf-icon-bars';
            CloudMusic.PlayerControl.PlayState.State=false;
            CloudMusic.Toast('顺序播放');
        }else{
            CloudMusic.PlayerControl.PlayState.className='CloudMusicPlayMode sf-icon-repeat';
            CloudMusic.PlayerControl.PlayState.State=true;
            CloudMusic.Toast('随机播放');
        }
    };
    CloudMusic.PlayerControl.Play=function () {
        if(CloudMusic.PlayerControl.Player.src){
            CloudMusic.PlayerControl.Cover.parentNode.className='CloudMusicPlayerCoverContainer CloudMusicCoverPlay';
            CloudMusic.PlayerControl.Needle.className='CloudMusicNeedle';
            CloudMusic.PlayerControl.Player.play();
        }
    };
    CloudMusic.PlayerControl.Pause=function () {
        CloudMusic.PlayerControl.Player.pause();
        CloudMusic.PlayerControl.Cover.parentNode.className='CloudMusicPlayerCoverContainer CloudMusicCoverPlay CloudMusicCoverPause';
        CloudMusic.PlayerControl.Needle.className='CloudMusicNeedle CloudMusicNeedleLock';
    };
    CloudMusic.PlayerControl.Prev=function () {
        if (CloudMusic.PlayerControl.NowPlayCount === 0&&CloudMusic.PlayerControl.Player.src!== null) {
            CloudMusic.PlayerControl.Stop();
            return false;
        }
        var prev_play = CloudMusic.PlayerControl.NowPlayCount - 1;
        CloudMusic.PlayerControl.PlayList[prev_play].click();
    };
    CloudMusic.PlayerControl.Next=function () {
        if (CloudMusic.PlayerControl.NowPlayCount === CloudMusic.PlayerControl.PlayList.length-1&&CloudMusic.PlayerControl.Player.src!== null&&!CloudMusic.PlayerControl.PlayState.State) {
            CloudMusic.PlayerControl.Stop();
            CloudMusic.PlayerControl.init();
            return false;
        }
        var next_play =CloudMusic.PlayerControl.PlayState.State?CloudMusic.PlayerControl.Random(0,CloudMusic.PlayerControl.PlayList.length-1):CloudMusic.PlayerControl.NowPlayCount + 1;
        CloudMusic.PlayerControl.PlayList[next_play].click();
    };
    CloudMusic.PlayerControl.Random=function(Min,Max){
        var Range = Max - Min;
        var Rand = Math.random();
        return Min + Math.round(Rand * Range); //四舍五入
    };
    CloudMusic.PlayerControl.Stop=function () {
        CloudMusic.PlayerControl.Pause();
        for(var i=0;i<CloudMusic.PlayerControl.PlayMusic.length;i++){
            CloudMusic.PlayerControl.PlayMusic[i].className='CloudMusicLi';
        }
    };
    CloudMusic.PlayerControl.CreateLrc = {
        handle: null,
        /* 定时执行句柄 */
        list: [],
        /* lrc歌词及时间轴数组 */
        regex: /^[^\[]*((?:\s*\[\d+\:\d+(?:\.\d+)?\])+)([\s\S]*)$/,
        /* 提取歌词内容行 */
        regex_time: /\[(\d+)\:((?:\d+)(?:\.\d+)?)\]/g,
        /* 提取歌词时间轴 */
        regex_trim: /^\s+|\s+$/,
        /* 过滤两边空格 */
        callback: null,
        /* 定时获取歌曲执行时间回调函数 */
        interval: 0.3,
        /* 定时刷新时间，单位：秒 */
        format: '<li>{html}</li>',
        /* 模板 */
        prefixid: 'CloudMusicPlayerLyrList',
        /* 容器ID */
        hoverClass: 'this_lrc',
        /* 选中节点的className */
        hoverTop: 100,
        /* 当前歌词距离父节点的高度 */
        duration: 0,
        /* 歌曲回调函数设置的进度时间 */
        __duration: -1,
        /* 当前歌曲进度时间 */
        /* 歌词开始自动匹配 */
        start: function(txt, callback) {
            if (typeof(txt) !== 'string' || txt.length < 1 || typeof(callback) !== 'function') return; /* 停止前面执行的歌曲 */
            this.stop();
            this.callback = callback;
            var item = null,
                item_time = null,
                html = ''; /* 分析歌词的时间轴和内容 */
            txt = txt.split("\n");
            for (var i = 0; i < txt.length; i++) {
                item = txt[i].replace(this.regex_trim, '');
                if (item.length < 1 || !(item = this.regex.exec(item))) continue;
                while (item_time = this.regex_time.exec(item[1])) {
                    this.list.push([parseFloat(item_time[1]) * 60 + parseFloat(item_time[2]), item[2]]);
                }
                this.regex_time.lastIndex = 0;
            } /* 有效歌词 */
            if (this.list.length > 0) { /* 对时间轴排序 */
                this.list.sort(function(a, b) {
                    return a[0] - b[0];
                });
                if (this.list[0][0] >= 0.1) this.list.unshift([this.list[0][0] - 0.1, '']);
                this.list.push([this.list[this.list.length - 1][0] + 1, '']);
                for (var i = 0; i < this.list.length; i++)
                    html += this.format.replace(/\{html\}/gi, this.list[i][1]); /* 赋值到指定容器 */
                document.getElementById(this.prefixid).innerHTML = html;
                /* 定时调用回调函数，监听歌曲进度 */
                if(typeof (CloudMusic.PlayerControl.CreateLrc.callback())==='number') {
                    this.handle = setInterval('CloudMusic.PlayerControl.CreateLrc.jump(CloudMusic.PlayerControl.CreateLrc.callback());', this.interval * 1000);
                }
            } else { /* 没有歌词 */
            }
        },
        /* 跳到指定时间的歌词 */
        jump: function(duration) {
            if (typeof(this.handle) !== 'number' || typeof(duration) !== 'number' || !$.Array.is(this.list)|| this.list.length < 1) return false;
            if (duration < 0) duration = 0;
            if (this.__duration === duration) return;
            duration += 0.2;
            this.__duration = duration;
            duration += this.interval;

            var left = 0,
                right = this.list.length - 1,
                last = right
            pivot = Math.floor(right / 2),
                tmpobj = null,
                tmp = 0,
                thisobj = this;

            /* 二分查找 */
            while (left <= pivot && pivot <= right) {
                if (this.list[pivot][0] <= duration && (pivot === right || duration < this.list[pivot + 1][0])) {
                    //if(pivot === right) this.stop();
                    break;
                } else if (this.list[pivot][0] > duration) { /* left */
                    right = pivot;
                } else { /* right */
                    left = pivot;
                }
                tmp = left + Math.floor((right - left) / 2);
                if (tmp === pivot) break;
                pivot = tmp;
            }
            if (pivot === this.pivot) return;
            this.pivot = pivot;
            tmpobj = $('#' + this.prefixid)[0].childNodes;
            for(var i=0;i<tmpobj.length;i++){
                tmpobj[i].className=this.prefixid;
            }
            if(tmpobj[pivot]) {
                tmpobj[pivot].className += ' ' + thisobj.hoverClass;
                tmp = tmpobj[pivot + 1].offsetTop - tmpobj[pivot].parentNode.offsetTop - this.hoverTop;
                tmp = tmp > 0 ? tmp * 1 : 0;//如果不设置滚动条使用margin设置为-1
                tmpobj[pivot].parentNode.scrollTop = tmp;//这里可以用margintop
            }
        },
        /* 停止执行歌曲 */
        stop: function() {
            if (typeof(this.handle) === 'number') clearInterval(this.handle);
            this.handle = this.callback = null;
            this.__duration = -1;
            this.regex_time.lastIndex = 0;
            this.list = [];
        }
    };
    CloudMusic.PlayerControl.init=function () {
        CloudMusic.PlayerControl.Player.src='';
        CloudMusic.PlayerControl.Player.currentTime=0;
        CloudMusic.PlayerControl.PlayerBtn[1].className='sf-icon-play';
        CloudMusic.PlayerControl.TmpSlider.style.width=CloudMusic.PlayerControl.Slider.style.width='0px';
        CloudMusic.PlayerControl.Background.style.background='#fff';
        CloudMusic.PlayerControl.AllTime.innerHTML=CloudMusic.PlayerControl.Time.innerHTML='00:00';
        $("#CloudMusicPlayerLyrList")[0].innerHTML=CloudMusic.PlayerControl.Info[0].innerHTML=CloudMusic.PlayerControl.Info[1].innerHTML= CloudMusic.PlayerControl.Info[2].innerHTML=CloudMusic.PlayerControl.Block[1].innerHTML=CloudMusic.PlayerControl.Block[2].innerHTML='';
        CloudMusic.PlayerControl.Cover.src=CloudMusic.PlayerControl.Block[0].src="./public/img/music/cover.png";
        CloudMusic.PlayerControl.Cover.parentNode.className='CloudMusicPlayerCoverContainer';
        CloudMusic.PlayerControl.Needle.className='CloudMusicNeedle CloudMusicNeedleLock';
        CloudMusic.PlayerControl.Main.style.width=CloudMusic.PlayerControl.Main.style.height='0px';
    };
};
/*右键菜单函数*/
CloudMusic.CustomListRightMenu=function (this_list) {
    var list_name=this_list.data.music_list_name;
    var list_id=this_list.data.music_list_id;
    CloudMusic.CustomListRightMenu.Open=function () {
        this_list.click();
    };
    CloudMusic.CustomListRightMenu.Rename=function () {
        CloudMusic.doRenameMusicList=function (aa) {
            var musiclistname=$("#musiclistname")[0].value;
            if(musiclistname===null||musiclistname===''){
                CloudMusic.Toast('请输入新的命名');
                return false;
            }
            CloudMain.Ajax({
                url:"/service/music/RenameMList",
                data: {
                    musiclistid: list_id,
                    musiclistname:musiclistname
                },
                success: function (rs) {
                    if(rs[0].state) {
                        this_list.setAttribute("music_list_name",musiclistname);
                        this_list.innerHTML=musiclistname;
                        this_list.data.music_list_name=musiclistname;
                        CloudMusic.Toast('已更改')
                    }
                    else{
                        CloudMusic.Toast('重命名失败');
                    }
                }
            });
            $.Window.Close(aa);
        };
        $.Confirm({
            id: 'CustomListRightMenuConfrim',
            node: CloudMusic.Main,
            title: '歌单重命名',
            notic: "新的命名",
            submit_func: CloudMusic.doRenameMusicList,
            confirm_input: 'musiclistname',
            confirm_input_val:list_name
        });
    };
    CloudMusic.CustomListRightMenu.Delete=function () {
        CloudMusic.doDeleteMusicList = function (aa) {
            $.Window.Close(aa);
            CloudMain.Ajax({
                url:"/service/music/DeleteMList",
                data: {
                    musiclistid:list_id
                },
                success: function (rs) {
                    if (rs[0].state) {
						this_list.remove();
						$("#CloudMusicCl_"+list_id)[0].remove();
                        CloudMusic.CustomListBind();
                        CloudMusic.Toast('已删除')
                    }
                    else {
                        CloudMusic.Toast('删除失败');
                    }
                }
            });
        };
        $.Confirm({
            id: 'CustomListRightMenuConfrim',
            node: CloudMusic.Main,
            title: '删除歌单',
            notic: '确认删除 ' + list_name + ' 这张歌单吗（将删除歌单下所有歌曲）',
            submit_func: CloudMusic.doDeleteMusicList,
            confirm_input: null,
            confirm_input_val:null
        });
    }
};
CloudMusic.Init=function () {
    /*获取*/
    CloudMusic.Main=$(".CloudMusicMain")[0];
    $(".CloudMusicHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/music.png';
    CloudMusic.MusicListMenu=$("#CloudMusicListMenu")[0];
    CloudMusic.NoTips='<li class="CloudMusicNoTips">没有歌曲</li>';
    CloudMusic.Loading='<div class="CloudMusicLoading"> <div class="rect1"></div> <div class="rect2"></div> <div class="rect3"></div> <div class="rect4"></div> <div class="rect5"></div></div>';
    CloudMusic.SearchContainer=$(".CloudMusicSearchContainer")[0];
    CloudMusic.UploadBtn=$(".CloudMusicUploadBtn")[0];
    /*搜索首页切换*/
    CloudMusic.MainSwitch=$(".CloudMusicHead li");
    for(var i=0;i<CloudMusic.MainSwitch.length;i++){
        (function (i) {
            CloudMusic.MainSwitch[i].onclick=function () {

                for(var j=0;j<CloudMusic.MainSwitch.length;j++){
                    CloudMusic.MainSwitch[j].getElementsByTagName("div")[0].style.width='0';
                }
                CloudMusic.MainSwitch[i].getElementsByTagName("div")[0].style.width='100%';
                if(i===0){
                    $(".CloudMusicLeftActive")[0]&&$(".CloudMusicLeftActive")[0].click();
                }else {
                    CloudMusic.NormalListContainer.style.display='none';
                    CloudMusic.CustomListContainer.style.display='none';
                    CloudMusic.SearchContainer.style.display='block';
                    CloudMusic.Search.key.focus();
                }
                CloudMusic.PlayerControl.Main.style.width='0%';
                CloudMusic.PlayerControl.Main.style.height='0%';
            }
        })(i)
    }
    /*默认歌曲列表处理*/
    CloudMusic.CustomListContainer=$(".CloudMusicCustomList")[0];
    CloudMusic.NormalListContainer=$(".CloudMusicNormaList")[0];
    CloudMusic.NormalSwitch=$(".CloudMusicNormalLeft li");
    CloudMusic.NormalList=$(".CloudMusicNormaList ul");
    CloudMusic.NormalInfo=$(".CloudMusicNormaListHead *");
    CloudMusic.NormalInfo[0].innerHTML=new Date().getDate();
    for(i=0;i<CloudMusic.NormalSwitch.length;i++){
        (function (i) {
            CloudMusic.NormalSwitch[i].onclick=function () {
                CloudMusic.MainSwitch[0].click();
                CloudMusic.CustomListContainer.style.display='none';
                CloudMusic.NormalListContainer.style.display='block';
                for(var j=0;j<CloudMusic.NormalSwitch.length;j++){
                    CloudMusic.NormalSwitch[j].className='';
                    CloudMusic.NormalList[j].style.display='none';
                }
                if(CloudMusic.CustomSwitch) {
                    for (var j = 0; j < CloudMusic.CustomSwitch.length; j++) {
                        CloudMusic.CustomSwitch[j].className = '';
                        CloudMusic.CustomList[j].style.display = 'none';
                    }
                }
                CloudMusic.NormalSwitch[i].className='CloudMusicLeftActive';
                CloudMusic.NormalList[i].style.display='block';
                switch (i){
                    case 0:
                        CloudMusic.NormalInfo[0].innerHTML=new Date().getDate();
                        CloudMusic.NormalInfo[1].innerHTML='根据最近所听的歌曲自动生成';
                        CloudMusic.UploadBtn.style.display='none';
                        break;
                    case 1:
                        CloudMusic.NormalInfo[0].innerHTML='本';
                        CloudMusic.NormalInfo[1].innerHTML='本地音乐';
                        CloudMusic.UploadBtn.style.display='block';
                        break;
                    case 2:
                        CloudMusic.NormalInfo[0].innerHTML='所';
                        CloudMusic.NormalInfo[1].innerHTML='所有音乐';
                        CloudMusic.UploadBtn.style.display='none';
                        break;
                }
            }
        })(i)
    }
    /*生成今日推荐*/
    CloudMusic.Recommend();
    /*个人列表处理*/
    CloudMusic.LoadCustomList();
    /*搜索初始化*/
    CloudMusic.Search();
    /*播放器初始化*/
    CloudMusic.PlayerControl();
    clearInterval(CloudMusic.PlayerControl.CreateLrc.handle);
}();