CloudGallery=$.NameSpace.register('CloudGallery');
CloudGallery.Main=$(".GalleryMain")[0];
CloudGallery.AlbumArr=[];
CloudGallery.logo=$(".GalleryHead img")[0];
CloudGallery.LoadPhoto=function () {
    CloudMain.Ajax({
        url:"/service/gallery/GetAllPhotos",
        success: function (rs) {
            if(rs.length===0){
                CloudGallery.Container[0].innerHTML=CloudGallery.NoPhotoTips;
            }
            else {
                CloudGallery.Container[0].innerHTML = '';
                var retun_data = [];
                retun_data = rs;
                for (var tmp in retun_data) {
                    var aaa=$.CreateElement({
                        tag:"div",
                        node:CloudGallery.Container[0]
                    });
                    var bb=$.CreateElement({
                        tag:"p",
                        className:"TimePhotoTitle",
                        html:tmp,
                        node:aaa
                    });
                    $.CreateElement({
                        tag:"span",
                        className:"Galleryago",
                        attr:{"timeago":tmp},
                        html:tmp,
                        node:bb
                    });
                    $.Time.friendly($(".Galleryago"));
                    var b =$.CreateElement({
                        className:"TimePhotoContainer",
                        node:aaa
                    });
                    for (var j = 0; j < retun_data[tmp].length; j++) {
                        var c=$.CreateElement({
                            className:'TimePhoto',
                            style:{"background":"url("+CloudMain.ServerUrl+'/'+retun_data[tmp][j].photo_tmp+")"},
                            node:b
                        });
                        c.data={
                            "photo_id":retun_data[tmp][j].photo_id,
                            "photo_name":retun_data[tmp][j].photo_name,
                            "album_id":retun_data[tmp][j].album_id
                        };
                        c.photo_url=CloudMain.ServerUrl+'/'+retun_data[tmp][j].photo_url;
                        c.onclick=function () {
                            $.ImageShow(this)
                        };
                        c.onmousedown=function (e) {
                            $.MouseMenu($("#GalleryMouseMenuTime")[0],this,CloudGallery.MouseMenuFunc,e);
                        };
                    }
                }
            }
        }
    });
};
CloudGallery.LoadPhotoAlbum=function () {
    CloudMain.Ajax({
        url:"/service/gallery/GetAlbum",
        success: function (rs) {
            CloudGallery.AlbumArr=[];
            var album_id,album_name,album_poster;
            if(rs.length<0||rs.length===0){
                CloudGallery.Container[1].innerHTML=CloudGallery.NoPhotoTips;
            }
            else {
                CloudGallery.Container[1].innerHTML='';
                for (var i = 0; i < rs.length; i++) {
                    album_id = rs[i].album_id;
                    album_name = rs[i].album_name;
                    album_poster = CloudMain.ServerUrl+'/'+rs[i].album_poster;
                    CloudGallery.PrintPhotoAlbum(album_id, album_name, album_poster);
                    CloudGallery.AlbumArr.push(rs[i]);
                }
            }
        }
    });
};
CloudGallery.LoadPhotoSubAlbum=function (id,name,flag) {
    CloudGallery.logo.style.display='none';
    id=typeof id ==='string'?id:CloudGallery.AlbumContent.album_id;
    name=name?name:CloudGallery.AlbumContent.album_name;
    if(!id){
        return false;
    }
    CloudGallery.AlbumContent.album_id=id;
    CloudGallery.AlbumContent.album_name=name;
    if(flag) {
        CloudGallery.AlbumShow.style.display = 'block';
        CloudGallery.AlbumShow.className += ' animated slideInRight';
        var a = setTimeout(function () {
            CloudGallery.AlbumShow.className = 'GalleryAlbumShow';
            clearTimeout(a);
        }, 300);
    }
    CloudGallery.AlbumName.innerHTML=name;
    CloudMain.Ajax({
        url:"/service/gallery/GetAllbumPhoto",
        data: {
            id:id
        },
        success: function (rs) {
            CloudGallery.AlbumContent.innerHTML = '';
            if(!rs.length){
                CloudGallery.AlbumContent.innerHTML=CloudGallery.NoPhotoTips;
            }
            if(flag) {
                var a = $.CreateElement({
                    tag: "button",
                    className: 'sf-icon-upload',
                    node: CloudGallery.AlbumContent
                });
                a.onclick = function () {
                    $.Request.upload('picture', id, CloudMain.ServerUrl+'/service/gallery/PhotoUpload',CloudGallery.LoadPhotoSubAlbum);
                };
            }
            if(rs.length) {
                for (var i = 0; i < rs.length; i++) {
                    CloudGallery.PrintPhotoSubAlbum(rs[i]);
                }
            }
        }
    });
};
CloudGallery.PrintPhotoSubAlbum=function (rs) {
    var c=$.CreateElement({
        className:'TimePhoto',
        style:{"background":"url("+CloudMain.ServerUrl+'/'+rs.photo_tmp+")"},
        node:CloudGallery.AlbumContent
    });
    c.data={
        "photo_id":rs.photo_id,
        "photo_name":rs.photo_name
    };
    c.photo_url=CloudMain.ServerUrl+'/'+rs.photo_url;
    c.onclick=function () {
        $.ImageShow(this)
    };
    c.onmousedown=function (e) {
        $.MouseMenu($("#GalleryMouseMenuTime")[0],this,CloudGallery.MouseMenuFunc,e);
    };
};
CloudGallery.PrintPhotoAlbum=function(album_id,album_name,poster) {
    var a1=$.CreateElement({
        tag:"div",
        className:'GalleryAlbum',
        node:CloudGallery.Container[1]
    });
    a1.data={
        "album_id":album_id,
        "album_name":album_name
    };
    a1.onmousedown=function (e) {
        $.MouseMenu($("#GalleryMouseMenuAlbum")[0],this,CloudGallery.MouseAlbumFunc,e);
    };
    a1.onclick=function () {
        CloudGallery.LoadPhotoSubAlbum(album_id,album_name,true)
    };
    $.CreateElement({
        className:'GalleryAlbumM',
        node:a1
    });
    $.CreateElement({
        className:'GalleryAlbumB',
        node:a1
    });
    $.CreateElement({
        className:"GalleryAlbumPoster",
        style:{"background":"url("+poster+")"},
        node:a1
    });
    $.CreateElement({
        tag:"p",
        html:album_name,
        node:a1
    });
};
CloudGallery.NewPhotoAlbum=function () {
    CloudGallery.DoCreatePhotoTab=function (aa) {
        var NewPhotoAlbumName=$("#NewPhotoAlbumName")[0].value;
        if(NewPhotoAlbumName===null||NewPhotoAlbumName===''){
            $.Toast('请输入相册名称');
        }
        else{
            CloudMain.Ajax({
                url:"/service/gallery/NewAlbum",
                data: {
                    name:NewPhotoAlbumName
                },
                success: function (rs) {
                    if(rs[0].Album) {
                        if(CloudGallery.Container[1].innerHTML===CloudGallery.NoPhotoTips){
                            CloudGallery.Container[1].innerHTML='';
                        }
                        CloudGallery.PrintPhotoAlbum(rs[0].Album,NewPhotoAlbumName,'./public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/gallery.png');
                        var data={"album_id":rs[0].Album,"album_name":NewPhotoAlbumName};
                        CloudGallery.AlbumArr.push(data);
                    }
                    else{
                        $.Toast('添加失败');
                    }
                }
            });
            $.Window.Close(aa);
        }
    };
    $.Confirm({
        id: 'NewPhotoAlbum',
        node: CloudGallery.Main,
        title: '新增相册',
        notic: "输入相册名称 "+'<span style="color:#e75252">'+"(添加成功后请上传至少一张图片)</span>",
        submit_func: CloudGallery.DoCreatePhotoTab,
        confirm_input: 'NewPhotoAlbumName',
        confirm_input_val:''
    });
};
CloudGallery.MouseMenuFunc=function (thisPhoto) {
    var p_id=thisPhoto.data.photo_id;
    var p_name=thisPhoto.data.photo_name;
    var p_url=thisPhoto.photo_url;
    CloudGallery.MouseMenuFunc.Show=function () {
        thisPhoto.click();
    };
    CloudGallery.MouseMenuFunc.Download=function () {
        $.Request.download(p_url,p_name);
    };
    CloudGallery.MouseMenuFunc.MoveTo=function () {
        CloudGallery.MouseMenuFunc.MoveTo.album_id=null;
        CloudGallery.Load=function (aa) {
            var a=$.CreateElement({
                tag:"ul",
                node:aa
            });
            for(var i=0;i<CloudGallery.AlbumArr.length;i++){
                (function (i) {
                    var b=$.CreateElement({
                        tag:"li",
                        html:CloudGallery.AlbumArr[i].album_id===thisPhoto.data.album_id?CloudGallery.AlbumArr[i].album_name+' （当前相册）':CloudGallery.AlbumArr[i].album_name,
                        node:a
                    });
                    b.album_id=CloudGallery.AlbumArr[i].album_id;
                    b.onmousedown=function () {
                        for(var j=0;j<a.childNodes.length;j++){
                            a.childNodes[j].removeAttribute('style')
                        }
                        a.childNodes[i].style.background='#38f';
                        a.childNodes[i].style.color='#fff';
                        CloudGallery.MouseMenuFunc.MoveTo.album_id=a.childNodes[i].album_id;
                    }
                })(i);
            }
        };
        CloudGallery.MoveTo=function (aa) {
            if(CloudGallery.MouseMenuFunc.MoveTo.album_id===thisPhoto.data.album_id){
                $.Toast('不能移动到当前相册');
                return false;
            }
            CloudMain.Ajax({
                url:"/service/gallery/MoveAlbum",
                data: {
                    photo_id: p_id,
                    album_id:CloudGallery.MouseMenuFunc.MoveTo.album_id
                },
                success: function (rs) {
                    if (rs[0].state) {
                        $.Toast('操作完成');
                    }
                    else {
                        $.Toast('操作失败');
                    }
                }
            });
            $.Window.Close(aa)
        };
        $.Confirm({
            id: 'GalleryPhotoConfrim',
            node: CloudGallery.Main,
            title: '移动相册',
            notic:'请选择一个相册',
            submit_func: CloudGallery.MoveTo,
            callback:CloudGallery.Load
        });
    };
    CloudGallery.MouseMenuFunc.Delete=function () {
        CloudGallery.DeletePhoto = function (aa) {
            $.Window.Close(aa);
            CloudMain.Ajax({
                url:"/service/gallery/DeletePhoto",
                data: {
                    id: p_id,
                    name:$.String.before(p_url,'/')
                },
                success: function (rs) {
                    if (rs[0].state) {
                        if(thisPhoto.parentNode.getElementsByTagName("div").length===1&&thisPhoto.parentNode.parentNode.parentNode===CloudGallery.Container[0]){
							thisPhoto.parentNode.parentNode.remove();
                        }
                        else {
							thisPhoto.remove();
                        }
                        if(CloudGallery.Container[0].getElementsByClassName(thisPhoto.className).length===0){
                            CloudGallery.Container[0].innerHTML=CloudGallery.NoPhotoTips;
                        }
                        if(CloudGallery.AlbumContent.getElementsByClassName(thisPhoto.className).length===0){
                            CloudGallery.AlbumContent.innerHTML=CloudGallery.NoPhotoTips;
                        }
                    }
                    else {
                        $.Toast('删除失败');
                    }
                }
            });
        };
        $.Confirm({
            id: 'GalleryPhotoConfrim',
            node: CloudGallery.Main,
            title: '删除图片',
            notic: '确认删除 ' + p_name + ' 这张图片吗',
            submit_func: CloudGallery.DeletePhoto
        });
    };
    CloudGallery.MouseMenuFunc.Info=function () {
        CloudGallery.InfoLoad=function (a) {
            a=$.CreateElement({
                className:'GallertInfoLineContainer',
                node:a
            });
            CloudMain.Ajax({
                url:"/service/gallery/GalleryInfo",
                data: {
                    id: p_id,
                    type:'photo'
                },
                success: function (rs) {
                    var count=0;
                    for(var i in rs){
                        if(i==='文件大小'){
                            rs[i]=$.Math.FileSize (rs[i]);
                        }
                        if(rs[i]===null){
                            rs[i]=' ';
                        }
                       $.CreateElement({
                           tag:"p",
                           html:i+':'+rs[i],
                           node:a
                       });
                        count++;
                        if(count%2===0){
                            $.CreateElement({
                                className:'GallertInfoLine',
                                node:a
                            })
                        }
                    }
                }
            });
        };
        $.Confirm({
            id: 'GalleryPhotoConfrim',
            node: CloudGallery.Main,
            title: p_name+'属性',
            callback:CloudGallery.InfoLoad
        });
    }
};
CloudGallery.MouseAlbumFunc=function (thisAlbum) {
    CloudGallery.MouseAlbumFunc.Show=function () {
        CloudGallery.LoadPhotoSubAlbum(thisAlbum.data.album_id,thisAlbum.data.album_name,true)
    };
    CloudGallery.MouseAlbumFunc.Upload=function () {
        $.Request.upload('picture', thisAlbum.data.album_id,CloudMain.ServerUrl+'/service/gallery/PhotoUpload');
    };
    CloudGallery.MouseAlbumFunc.Rename=function () {
        CloudGallery.RenameAlbum=function (aa) {
            var NewAlbumRename=$("#NewAlbumRename")[0].value;
            if(NewAlbumRename===null||NewAlbumRename===''){
                $.Toast('请输入新的命名');
                return false;
            }
            CloudMain.Ajax({
                url:"/service/gallery/RenameAlbum",
                data: {
                    id: thisAlbum.data.album_id,
                    name:NewAlbumRename
                },
                success: function (rs) {
                    if(rs[0].state) {
                        thisAlbum.data.album_name=NewAlbumRename;
                        thisAlbum.getElementsByTagName("p")[0].innerHTML=NewAlbumRename;
                    }else{
                        $.Toast('重命名失败');
                    }
                }
            });
            $.Window.Close(aa);
        };
        $.Confirm({
            id: 'GalleryAlbumConfrim',
            node: CloudGallery.Main,
            title: '相册重命名',
            notic: "新的命名",
            submit_func: CloudGallery.RenameAlbum,
            confirm_input: 'NewAlbumRename',
            confirm_input_val:thisAlbum.data.album_name
        });
    };
    CloudGallery.MouseAlbumFunc.Delete=function () {
        CloudGallery.DeleteAlbum=function (aa) {
            $.Window.Close(aa);
            CloudMain.Ajax({
                url:"/service/gallery/DeleteAlbum",
                data: {
                    id:thisAlbum.data.album_id
                },
                success: function (rs) {
                    if(rs[0].state){
						thisAlbum.remove();
                        if($("."+thisAlbum.className).length===0){
                            CloudGallery.Container[1].innerHTML=CloudGallery.NoPhotoTips;
                        }
                        for(var i=0;i<CloudGallery.AlbumArr.length;i++){
                            if(CloudGallery.AlbumArr[i].album_id===thisAlbum.data.album_id){
                                var int = i;
                                CloudGallery.AlbumArr.splice(int, 1);
                            }
                        }
                    }else{
                        $.Toast('删除失败');
                    }
                }
            });
        };
        $.Confirm({
            id: 'GalleryAlbumConfrim',
            node: CloudGallery.Main,
            title: '删除相册',
            notic: "确认删除 " + thisAlbum.data.album_name + " 这个相册吗,该操作将"+'<span style="color:#e75252">'+" 删除相册内所有文件</span>",
            submit_func: CloudGallery.DeleteAlbum
        });
    };
    CloudGallery.MouseAlbumFunc.Info=function () {
        CloudGallery.InfoAlbumLoad=function (a) {
            a=$.CreateElement({
                className:'GallertInfoLineContainer',
                node:a
            });
            CloudMain.Ajax({
                url:"/service/gallery/GalleryInfo",
                data: {
                    id: thisAlbum.data.album_id,
                    type:'album'
                },
                success: function (rs) {
                    var count=0;
                    for(var i in rs){
                        $.CreateElement({
                            tag:"p",
                            html:i+':'+rs[i],
                            node:a
                        });
                        count++;
                        if(count%2===0){
                            $.CreateElement({
                                className:'GallertInfoLine',
                                node:a
                            })
                        }
                    }
                }
            });
        };
        $.Confirm({
            id: 'GalleryPhotoConfrim',
            node: CloudGallery.Main,
            title: thisAlbum.data.album_name+'属性',
            callback:CloudGallery.InfoAlbumLoad
        });
    }
};
CloudGallery.Init=function () {
    $(".GalleryHead img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/gallery.png';
    CloudGallery.Switch=$(".GalleryHead li");
    CloudGallery.Container=$(".GalleryContainer");
    CloudGallery.NewAlbumBtn=$(".GalleryNew")[0];
    CloudGallery.NewAlbumBtn.onclick=function(){CloudGallery.NewPhotoAlbum()};
    CloudGallery.AlbumShow=$(".GalleryAlbumShow")[0];
    CloudGallery.BackBtn=$(".GalleryAlbumShowHead *")[0];
    CloudGallery.AlbumName=$(".GalleryAlbumShowHead *")[2];
    CloudGallery.AlbumContent=$(".GalleryAlbumShowContent")[0];
    CloudGallery.BackBtn.onclick=function () {
        CloudGallery.logo.style.display='block';
        CloudGallery.AlbumShow.className+=' animated slideOutLeft';
        var a=setTimeout(function () {
            CloudGallery.AlbumShow.className='GalleryAlbumShow';
            CloudGallery.AlbumShow.style.display='none';
            clearTimeout(a);
        },300)
    };
    for(var i=0;i<CloudGallery.Switch.length;i++){
        (function (i) {
            CloudGallery.Switch[i].onclick=function () {
                for(var j=0;j<CloudGallery.Container.length;j++){
                    CloudGallery.Container[j].style.display='none';
                    CloudGallery.Switch[j].getElementsByTagName('div')[0].style.width='0px';
                }
                CloudGallery.Switch[i].getElementsByTagName('div')[0].style.width='100%';
                CloudGallery.Container[i].style.display='block';
                if(i){
                    CloudGallery.LoadPhotoAlbum();
                    CloudGallery.NewAlbumBtn.style.display='block';
                }else {
                    CloudGallery.LoadPhoto();
                    CloudGallery.NewAlbumBtn.style.display='none';
                }
            }
        })(i);
    }
    CloudGallery.NoPhotoTips='<div class="GalleryNoTips"><img src="public/img/gallery/nophoto.png"><p>没有可显示的照片</p></div>';
    CloudGallery.LoadPhoto();
    CloudGallery.LoadPhotoAlbum();
}();