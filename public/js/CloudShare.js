CloudShare=$.NameSpace.register('CloudShare');
CloudShare.loginSucss=function (rs) {
    CloudShare.Logined.style.display='block';
    CloudShare.NoLogin.style.display='none';
    CloudShare.LoginMain.style.display='none';
    CloudShare.LoginedInfo[0].src=CloudMain.ServerUrl+'/'+rs[0].head;
    CloudShare.LoginedInfo[1].innerHTML=rs[0].user;
    CloudShare.Userid=rs[0].userid;
    $.Cookie.set('username',rs[0].user,(1440 * 60 * 1000));
    $.Cookie.set('userhead',CloudMain.ServerUrl+'/'+rs[0].head,(1440 * 60 * 1000));
    $.Cookie.set('userid',rs[0].userid,(1440 * 60 * 1000));
};
CloudShare.Check=function () {
    CloudShare.Body.style.display='none';
    if(CloudShare.id) {
        CloudMain.Ajax({
            url: "/service/share/GetShareInfo/" + CloudShare.id,
            success: function (rs) {
                if (rs === null) {
                    $.Toast('分享文件已失效');
                    CloudShare.Invalid.style.display = 'block';
                } else {
                    CloudShare.resourceType = rs[0].share_type;
                    CloudShare.resourceId = rs[0].resource_id;
                    CloudShare.ShareState = rs[0].share_state;
                    CloudShare.ShareUserId = rs[1].userid;
                    CloudShare.ShareUser[0].src = CloudMain.ServerUrl + '/' + rs[1].user_head;
                    CloudShare.ShareUser[1].innerHTML = rs[1].user_name;
                    CloudShare.ShareInfo.Title.innerHTML = rs[0].content;
                    CloudShare.ShareInfo.Time.innerHTML = '&nbsp&nbsp' + rs[0].share_time + ' 失效时间：永久有效';
                    CloudShare.ShareInfo.Info.innerHTML = '浏览次数:' + rs[0].browers_count + '&nbsp&nbsp保存次数:' + rs[0].save_count;
                    if (CloudShare.ShareState === '1') {
                        CloudShare.Body.style.display = 'block';
                        CloudShare.Check.Password('');
                    } else if (CloudShare.ShareState === '2' && !$.Cookie.get('share_pass')) {
                        $.Confirm({
                            id: "CloudSharePassword",
                            title: '请输入密码',
                            notic: '您正在查看加密分享文件，请输入密码',
                            submit_func: CloudShare.Check.Password,
                            confirm_input: 'SharePassword'
                        })
                    } else if ($.Cookie.get('share_pass')) {
                        CloudShare.Check.Password($.Cookie.get('share_pass'))
                    }
                    CloudShare.LoadOtherShare(rs[1].userid);
                }
            }
        });
    }else {
        $.Toast('分享文件已失效');
        CloudShare.Invalid.style.display = 'block';
    }
    CloudShare.Check.Password=function (a) {
        var password=$("#SharePassword")[0];
        var psd=password?password.value:a;
        if(typeof a!=='object'){
            psd=a;
        }else {
            if (!psd.length) {
                $.Toast('请输入密码');
                return false
            }
        }
        CloudMain.Ajax({
            url:"/service/share/GetShareResouce",
            data:{
                id:CloudShare.resourceId,
                shareID:CloudShare.id,
                resourceType:CloudShare.resourceType,
                resourcePass:psd
            },
            success: function(rs) {
                if(rs[0].state==="-1"){
                    $.Toast('密码错误');
                    $.Confirm({
                        id:"CloudSharePassword",
                        title: '请输入密码',
                        notic: '您正在查看加密分享文件，请输入密码',
                        submit_func: CloudShare.Check.Password,
                        confirm_input: 'SharePassword'
                    })
                }else{
                    $.Cookie.set('share_pass',psd,300000);
                    CloudShare.Body.style.display='block';
                    CloudShare.ShareInfo.FileSize.innerHTML='文件大小：'+$.Math.FileSize (rs[0].res_size);
                    CloudShare.ShareInfo.PreviewButton.data={
                        "file_name":rs[0].res_name,
                        "file_main":CloudMain.ServerUrl+'/'+rs[0].res_main
                    };
                    CloudShare.judgeFile(rs[0].res_main);
                    a&&$.Window.Close(a);
                }
            }
        });
    }
};
CloudShare.LoadOtherShare=function (id) {
    CloudMain.Ajax({
        url:"/service/share/OtherShare",
        data:{
            uid:id,
          share_id:CloudShare.id
        },
        success: function (rs) {
            if(rs.length){
                for(var i=0;i<rs.length;i++){
                    (function (i) {
                        var a=$.CreateElement({
                            tag:"li",
                            html:rs[i].content,
                            attr:{"tooltip":"在新标签中打开"},
                            node:CloudShare.OtherList
                        });
                        a.onclick=function () {
                            window.open(CloudMain.ServerUrl+'/s/'+rs[i].share_id);
                        }
                    })(i)
                }
            }else {
                CloudShare.OtherList.innerHTML='<li>没有其他分享</li>'
            }
        }
    });
};
CloudShare.ShareInfo=function () {
    CloudShare.ShareInfo.Title=$(".CloudShareName h2")[0];
    CloudShare.ShareInfo.Time=$(".CloudShareInfo *")[0];
    CloudShare.ShareInfo.Info=$(".CloudShareInfo *")[1];
    CloudShare.ShareInfo.Button=$(".CloudShareControl button");
    CloudShare.ShareInfo.FileIcon=$(".CloudShareFileIcon")[0];
    CloudShare.ShareInfo.FileSize=$(".CloudShareFileSize")[0];
    CloudShare.ShareInfo.PreviewButton=$(".CloudShareShowShare button")[0];
    CloudShare.ShareInfo.Save= CloudShare.ShareInfo.Button[0];
    CloudShare.ShareInfo.Download=CloudShare.ShareInfo.Button[1];
    CloudShare.ShareInfo.QrCode=$(".CloudShareQrCode")[0];
    CloudShare.ShareInfo.QrCode.onclick=function () {
        $.Confirm({
            id:"CloudShareQrCode",
            title: '扫描二维码',
            width:'233px',
            callback:function (a) {
                $.QRCode({
                    id:null,
                    modulesize: 7,
                    data:window.location.href,
                    node:a
                });
                a.parentNode.parentNode.style.top='140px';
                a.parentNode.parentNode.style.left=CloudShare.ShareInfo.QrCode.getBoundingClientRect().left+'px';
            }
        })
    };
    CloudShare.ShareInfo.Save.onclick=function () {
        if($.Cookie.get('username')&&$.Cookie.get('userhead')&&$.Cookie.get('userid')){
            CloudShare.SaveFile()
        }else {
            CloudShare.LoginMain.style.display='block';
            CloudIndex.Switch(0)
        }
    };
    CloudShare.ShareInfo.Download.onclick=function () {
        $.Toast('开始下载');
        $.Request.download(CloudShare.ShareInfo.PreviewButton.data.file_main,CloudShare.ShareInfo.PreviewButton.data.file_name);
    }
};
CloudShare.SaveFile=function () {
    CloudShare.MouseTrees = function (node) {
        var aa = $.CreateElement({
            tag: 'ul',
            className: 'CloudDiskTreesContainer',
            html: "<div class='CloudDFoContainer'></div>",
            node: node
        });
        var b = $.CreateElement({
            tag: "li",
            node: aa.getElementsByClassName('CloudDFoContainer')[0]
        });
        b.data = {
            "load": "true",
            "state": '-open',
            "file_name": '全部文件',
            "disk_id": 'null'
        };
        b.ondblclick = function () {
            CloudShare.OpenTrees(this);
        };
        b.onmousedown = function () {
            CloudShare.SelectTrees(this)
        };
        b.span = $.CreateElement({
            tag: "span",
            className: 'sf-icon-folder-open',
            node: b
        });
        $.CreateElement({
            tag: "div",
            html: '全部文件',
            node: b
        });
        CloudShare.GetDiskTreeInfo(null);
    };
    CloudShare.GetDiskTreeInfo = function (id, thisFolder) {
        var createnode;
        if (!thisFolder) {
            createnode = document.getElementsByClassName('CloudDiskTreesContainer')[0].getElementsByClassName('CloudDFoContainer')[0];
        } else {
            createnode = thisFolder;
        }
        CloudMain.Ajax({
            url:"/service/share/OpenDisk",
            data: {
                userid:CloudShare.Userid,
                disk_id: id
            },
            success: function (rs) {
                var file_name, disk_id;
                for (var i = 0; i < rs.length; i++) {
                    file_name = rs[i].disk_name;
                    disk_id = rs[i].disk_id;
                    CloudShare.SaveFile.PrintDiskTrees(file_name, disk_id, createnode);
                }
            }
        });
    };
    CloudShare.SaveFile.PrintDiskTrees = function (file_name, disk_id, createnode) {
        var a = $.CreateElement({
            tag: "div",
            className: 'CloudDFoContainer childFolder',
            node: createnode
        });
        var b = $.CreateElement({
            tag: "li",
            node: a
        });
        b.data = {
            "load": "false",
            "state": '',
            "file_name": file_name,
            "disk_id": disk_id
        };
        b.ondblclick = function () {
            CloudShare.OpenTrees(this);
        };
        b.onmousedown = function () {
            CloudShare.SelectTrees(this)
        };
        b.span = $.CreateElement({
            tag: "span",
            className: 'sf-icon-folder',
            node: b
        });
        $.CreateElement({
            tag: "div",
            html: file_name,
            node: b
        });
    };//打印树目录
    CloudShare.SelectTrees = function (b) {
        var a = document.getElementsByClassName('CloudDiskTreesContainer')[0].getElementsByTagName('li');
        for (var i = 0; i < a.length; i++) {
            a[i].className = '';
        }
        b.className = 'CloudDiskTreeActive';
        CloudShare.TreesData = b.data.disk_id;
    };//选择树目录
    CloudShare.OpenTrees = function (thisFolder) {
        CloudShare.TreesData = thisFolder.data.disk_id;
        if (thisFolder.data.load === 'false') {
            CloudShare.GetDiskTreeInfo(thisFolder.data.disk_id, thisFolder.parentNode);
            thisFolder.data.load = 'true';
            thisFolder.data.state = '-open';
            thisFolder.span.className = 'sf-icon-folder-open';
        } else {
            var aaa = thisFolder.parentNode.getElementsByClassName('childFolder');
            var state = '';
            if (thisFolder.data.state === '-open') {
                state = 'none';
                thisFolder.data.state = '';
            } else {
                state = 'block';
                thisFolder.data.state = '-open'
            }
            thisFolder.span.className = 'sf-icon-folder' + thisFolder.data.state;
            for (var i = 0; i < aaa.length; i++) {
                aaa[i].style.display = state;
            }
        }
    };
    CloudShare.SaveFile.sub = function (a) {
        if(CloudShare.Userid===CloudShare.ShareUserId){
            $.Toast('不能保存自己分享的文件');
            return false;
        }
        CloudMain.Ajax({
            url:"/service/share/SaveFile",
            data: {
                share_id:CloudShare.id,
                shareuser: CloudShare.ShareUserId,
                parent_id: CloudShare.TreesData,
                id:CloudShare.resourceId,
                userid:CloudShare.Userid
            },
            success: function (rs) {
                if(rs.state==='1'){
                    $.Toast('保存成功')
                }else {
                    $.Toast('保存失败')
                }
            }
        });
        $.Window.Close(a);
    };
    if((CloudShare.ShareState==='2'&&$.Cookie.get('share_pass'))||CloudShare.ShareState==='1'){
        $.Confirm({
            id: 'CloudDiskConfrim',
            title: '选择一个文件夹',
            notic: '正在加载',
            submit_func: CloudShare.SaveFile.sub,
            callback:function (a) {
                a.innerHTML='';
                CloudShare.MouseTrees(a)
            }
        });
    }else{
        $.Confirm({
            id:"CloudSharePassword",
            title: '请输入密码',
            notic: '您正在查看加密分享文件，请输入密码',
            submit_func: CloudShare.Check.Password,
            confirm_input: 'SharePassword'
        })
    }
};
CloudShare.loadFileContent = function (this_file) {
    $.Window.NewWindow({
        id: 'CustomFunc' +CloudShare.resourceId,
        className: 'SlimfWindow',
        mini: false,
        width: "800px",
        height: "500px",
        title: this_file.data.file_name + ' 文件查看',
        bg: '#fff',
        color: '#333',
        callback:function (a) {
            a.innerHTML='<span class="CloudShareLoading"></span>';
            CloudMain.Ajax({
                url:"/service/share/OpenFile",
                dataType: "text",
                data: {
                    name: $.String.before(this_file.data.file_main, '.'),
                    id: CloudShare.resourceId
                },
                success: function (rs) {
                    a.innerHTML = '';
                    var b = $.CreateElement({
                        className: 'CloudShareViewContent',
                        html: '<pre></pre>',
                        node: a
                    });
                    b.getElementsByTagName('pre')[0].innerText = rs;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                }
            });
        }
    });
};//加载文件内容
CloudShare.judgeFile = function (filename) {
    var type = $.String.before(filename, ".");
    if ($.String.exist(type, '7z,zip,rar,tar.gz')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/RarType.png';
        CloudShare.ShareInfo.PreviewButton.onclick=function () {
            $.Toast('暂不支持')
        }
    }
    else if ($.String.exist(type, 'png,jpg,jpeg,bmp,gif,PNG,JPG,JPEG,BMP,GIF')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/ImageType.png';
        CloudShare.ShareInfo.PreviewButton.photo_url = CloudShare.ShareInfo.PreviewButton.data.file_main;
        CloudShare.ShareInfo.PreviewButton.onclick=function () {
            $.ImageShow(this)
        };
    }
    else if ($.String.exist(type, 'mp4,rmvb,mkv,MP4,RMVB,MKV')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/VideoType.png';
        CloudShare.ShareInfo.PreviewButton.onclick=function () {
            $.VideoPlayer(CloudShare.ShareInfo.PreviewButton.data.file_name, CloudShare.ShareInfo.PreviewButton.data.file_main);
        }
    }
    else if ($.String.exist(type, 'm4a,mp3,ogg,flac,f4a,wav,ape,M4A,MP3,OGG,FLAC,F4A,WAV,APE')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/MusicType.png';
        CloudShare.ShareInfo.PreviewButton.audio_name = CloudShare.ShareInfo.PreviewButton.data.file_name;
        CloudShare.ShareInfo.PreviewButton.audio_url = CloudShare.ShareInfo.PreviewButton.data.file_main;
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.AudioPlayer(this)
        };
    }
    else if ($.String.exist(type, 'doc,docx,DOC,DOCX')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/DocType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            CloudShare.loadFileContent(this);
        };
    }
    else if ($.String.exist(type, 'ppt,pptx,PPT,PPTX')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/PptType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持打开幻灯片文件')
        };
    }
    else if ($.String.exist(type, 'xls,xlsx,XLS,XLSX')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/ExcelType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持打开表格文件')
        };
    }
    else if ($.String.exist(type, 'pdf,PDF')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/PdfType.png';
        CloudShare.ShareInfo.PreviewButton.onclick= function () {
            $.Toast('暂不支持打开pdf文件')
        };
    }
    else if ($.String.exist(type, 'ini,txt,INI,TXT')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/TxtType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            CloudShare.loadFileContent(this);
        };
    }
    else if ($.String.exist(type, 'xml,aspx,php,phtml,.htaccesscss,js,c,XML,ASPX,PHP,PHTML,.HTACCESSCSS,JS,C')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/CodeType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            CloudShare.loadFileContent(this);
        };
    }
    else if ($.String.exist(type, 'htm,html,HTM,HTML')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/WebType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            CloudShare.loadFileContent(this);
        };
    }
    else if ($.String.exist(type, 'log,LOG')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/OtherType.png';
        CloudShare.ShareInfo.PreviewButton.onclick= function () {
            CloudShare.loadFileContent(this);
        };
    }
    else if ($.String.exist(type, 'exe,msi,EXE,MSI')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/ExeType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持打开window安装文件')
        };
    }
    else if ($.String.exist(type, 'torrent,TORRENT')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/BtType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持种子文件')
        };
    }
    else if ($.String.exist(type, 'vcf,VCF')) {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/VcfType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持该类型文件')
        };
    }
    else {
        CloudShare.ShareInfo.FileIcon.src=CloudMain.ServerUrl+'/public/img/disk/middle/OtherType.png';
        CloudShare.ShareInfo.PreviewButton.onclick = function () {
            $.Toast('暂不支持该类型文件')
        };
    }
};
CloudShare.Init=function () {
    CloudShare.id=$(".CloudShareMain")[0].id;
    CloudShare.LoginedInfo=$("#CloudShareLogined *");
    CloudShare.Logined=$("#CloudShareLogined")[0];
    CloudShare.NoLogin=$("#CloudShareNoLogin")[0];
    CloudShare.LoginMain=$(".CloudIndex")[0];
    CloudShare.LoginButton=$("#CloudShareNoLogin p");
    CloudShare.LoginButton[0].onclick=function () {
        CloudShare.LoginMain.style.display='block';
    };
    CloudShare.LoginButton[1].onclick=function () {
        CloudShare.LoginMain.style.display='block';
    };
    CloudShare.ShareUser=$(".CloudShareUser *");
    CloudShare.OtherList=$(".CloudShareOtherContainer")[0];
    $("#CloudIndexClose")[0].onclick=function () {
        CloudShare.LoginMain.style.display='none';
    };
    $("#CloudShareExit")[0].onclick=function () {
        $.Cookie.remove('username');
        $.Cookie.remove('userhead');
        CloudShare.Logined.style.display='none';
        CloudShare.NoLogin.style.display='block';
    };
    if($.Cookie.get('username')&&$.Cookie.get('userhead')&&$.Cookie.get('userid')){
        CloudShare.LoginedInfo[0].src=$.String.exist($.Cookie.get('userhead'),'http:')?$.Cookie.get('userhead'):CloudMain.ServerUrl+'/'+$.Cookie.get('userhead');
        CloudShare.LoginedInfo[1].innerHTML=$.Cookie.get('username');
        CloudShare.Userid=$.Cookie.get('userid');
        CloudShare.Logined.style.display='block';
        CloudShare.NoLogin.style.display='none';
        CloudShare.LoginMain.style.display='none';
    }
    CloudShare.Body=$(".CloudShareBody")[0];
    CloudShare.Invalid=$(".CloudShareInvalid")[0];
    CloudShare.ShareInfo();
    CloudShare.Check();
}();