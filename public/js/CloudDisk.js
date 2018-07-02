CloudDisk=$.NameSpace.register('CloudDisk');
CloudDisk.Pendind=false;
CloudDisk.Start = function () {
    $(".CloudDiskFuncMenu img")[0].src='public/img/bar/'+($.Cookie.get('themes')||CloudMain.User.theme)+'/disk.png';
    CloudDisk.FileList = [];
    CloudDisk.Loading="<div class='CloudDiskLoading'><div class='sf-icon-hdd'><div class='CloudDiskLoading-beat'><div></div> <div></div> <div></div> </div></div><p>正在加载</p></div>";
    CloudDisk.NullTips="<div class='CloudDiskEmptyTips'><span class='sf-icon-hdd'></span>这里什么都没有</div>";
    CloudDisk.ViewModes = 'CloudDiskMFile';
    CloudDisk.All = $(".CloudDiskMain")[0];
    CloudDisk.CloudDiskMain = $("#CloudDiskMainContainer")[0];
    CloudDisk.CloudDiskNavBar = $("#CloudDiskNavBar")[0];
    CloudDisk.CloudDiskMainFunc = $("#CloudDiskMainFunc")[0];
    CloudDisk.AddresButton = $(".CloudDiskNav button");
    CloudDisk.MouseMenuContainer = $("#CloudDiskMouseMenu")[0];
    CloudDisk.FileMouseMenuContainer = $("#CloudDiskFileMouseMenu")[0];
    CloudDisk.CloudDiskTrashMouseMenu = $("#CloudDiskTrashMouseMenu")[0];
    CloudDisk.CloudDiskShareMouseMenu = $("#CloudDiskShareMouseMenu")[0];
    CloudDisk.CloudDiskFuncBlock = $(".CloudDiskFuncBlock");
    CloudDisk.TrashFunc = $("#CloudDiskTrashFunc")[0];
    CloudDisk.SelectTips = $("#CloudDiskSelectTips")[0];
    CloudDisk.TrashBtn = $("#TrashBtn")[0];
    CloudDisk.SearchBtn = $("#CloudDiskSearchBtn")[0];
    CloudDisk.SearchInput = $("#CDsearchInput")[0];
    CloudDisk.info = {
        "max": 10737418240,
        "use": 0
    };
    CloudDisk.File = CloudDiskMain = CloudDisk.CloudDiskMain.children;
    CloudDisk.LoadFlag = false;
    CloudDisk.NowPage = 1;
    CloudDisk.AllCount = CloudDisk.NowCount = 0;
    CloudDisk.KeyFlag = null;
    CloudDisk.NowType = 'normal';
    CloudDisk.NowID = '';
    CloudDisk.TreesData = null;
    CloudDisk.ClipboardType = 0;
    CloudDisk.Clipboard = [];
    CloudDisk.SelectFiles = [];
    CloudDisk.CopyButton = $("#CloudDiskCopyButton")[0];
    CloudDisk.DownLoadButton=$("#CloudDiskDownLoadButton")[0];
    CloudDisk.PasteButton = $("#CloudDiskPasteButton")[0];
    CloudDisk.ShareButton=$("#CloudDiskShareButton")[0];
    CloudDisk.ShareType = 0;
    CloudDisk.AddresButton[0].onclick = function () {
        if (CloudDisk.AddresButton[0].className === 'sf-icon-arrow-left CloudDiskDisable') {
            return false
        }
        var a = document.getElementsByClassName('CloudDiskNavBlock');
        if (a.length > 1) {
            a[a.length - 2].click();
        } else {
            CloudDisk.AddresButton[1].click();
        }
    };//返回上一级函数
    CloudDisk.AddresButton[1].onclick = function () {
        CloudDisk.NowPage = 1;
        if (this.innerHTML === '全部文件' || this.innerHTML === '搜索结果') {
            this.innerHTML = '全部文件';
            CloudDisk.Classify[0].className = 'CloudDiskClassifyActive';
            CloudDisk.CloudDiskMainInfo(null, 'normal');
        } else if (this.innerHTML === '图片') {
            CloudDisk.CloudDiskMainInfo(null, 'picture');
        } else if (this.innerHTML === '视频') {
            CloudDisk.CloudDiskMainInfo(null, 'video');
        } else if (this.innerHTML === '文档') {
            CloudDisk.CloudDiskMainInfo(null, 'document');
        } else if (this.innerHTML === '音乐') {
            CloudDisk.CloudDiskMainInfo(null, 'music');
        } else if (this.innerHTML === '种子') {
            CloudDisk.CloudDiskMainInfo(null, 'torrent');
        } else if (this.innerHTML === '其他') {
            CloudDisk.CloudDiskMainInfo(null, 'other');
        } else if (this.innerHTML === '回收站') {
            CloudDisk.CloudDiskMainInfo(null, 'trash');
        } else if (this.innerHTML === '我的分享') {
            CloudDisk.CloudDiskMainInfo(null, 'share');
        }
        CloudDisk.CloudDiskNavBar.innerHTML = '';
        CloudDisk.AddresButton[0].className = 'sf-icon-arrow-left CloudDiskDisable';
    };//网盘主页函数
    CloudDisk.CloudDiskMain.onmousewheel = function () {
        if (this.scrollTop+ this.offsetHeight >= this.scrollHeight-32 && CloudDisk.NowCount < CloudDisk.AllCount) {
            if (CloudDisk.LoadFlag) {
                CloudDisk.NowPage++;
                CloudDisk.CloudDiskMainInfo(CloudDisk.NowID, CloudDisk.NowType);
            }
        }
    };//滚动加载
    $("#CloudDiskNormalSort")[0].onclick = function () {
        CloudDisk.CloudDiskFuncBlock[0].click();
        this.className = 'sf-icon-sort-amount-' + CloudDisk.CloudDiskFuncBlock[0].getAttribute('state');
    };//排序
    CloudDisk.SearchInput.onblur = function () {
        CloudDisk.SearchInput.style.width = '0px';
    };
    CloudDisk.SearchBtn.onclick = function () {
        if (this.className !== 'sf-icon-search CloudDiskDisable') {
            if (CloudDisk.SearchInput.offsetWidth === 0) {
                CloudDisk.SearchInput.style.width = '185px';
                CloudDisk.SearchInput.focus();
            } else if (CloudDisk.SearchInput.value !== '') {
                CloudDisk.Search();
            } else {
            }
        }
    };//搜索按钮
    CloudDisk.All.onkeydown = function (e) {
        e.stopPropagation();
        if (e.ctrlKey) {
            CloudDisk.KeyFlag = 'Ctrl';
        } else if (e.shiftKey) {
            CloudDisk.KeyFlag = 'Shift';
        }
        CloudDisk.All.onkeyup = function () {
            CloudDisk.KeyFlag = null;
        }
    };//处理全局键盘事件
    //以上是移入的
    CloudDisk.FuncButton = $(".CloudDiskFuncMenu li");
    CloudDisk.FuncContainer = $(".CloudDiskClassify");
    CloudDisk.Classify = $("#CloudDiskClassify li");
    CloudDisk.ShareClass = $("#CloudDiskShareClass li");
    for (var i = 0; i < CloudDisk.FuncButton.length; i++) {
        (function (i) {
            CloudDisk.FuncButton[i].onclick = function () {
                for (var j = 0; j < CloudDisk.FuncButton.length; j++) {
                    CloudDisk.FuncContainer[j].style.display = 'none';
                    CloudDisk.FuncButton[j].getElementsByTagName('div')[0].style.width = '0';
                }
                CloudDisk.FuncContainer[i].style.display = 'block';
                CloudDisk.FuncButton[i].getElementsByTagName('div')[0].style.width = '100%';
                if (i === 1) {
                    CloudDisk.CloudDiskNavBar.innerHTML = '';
                    CloudDisk.ShareClass[0].click();
                    CloudDisk.SearchBtn.className = 'sf-icon-search CloudDiskDisable';
                } else {
                    CloudDisk.SearchBtn.className = 'sf-icon-search';
                    CloudDisk.Classify[0].click();
                }
            }
        })(i)
    }
    for (var j = 0; j < CloudDisk.Classify.length; j++) {
        (function (j) {
            CloudDisk.Classify[j].onclick = function () {
                for (var i = 0; i < CloudDisk.Classify.length; i++) {
                    CloudDisk.Classify[i].className = '';
                }
                CloudDisk.Classify[j].className = 'CloudDiskClassifyActive';
                if (j === CloudDisk.Classify.length - 1) {
                    CloudDisk.TrashFunc.style.display = 'block';
                } else {
                    CloudDisk.TrashFunc.style.display = 'none';
                }
                CloudDisk.AddresButton[1].innerHTML = CloudDisk.Classify[j].innerText;
                CloudDisk.AddresButton[1].click();
                CloudDisk.SelectTips.innerHTML = '';
            }
        })(j)
    }
    for (var k = 0; k < CloudDisk.ShareClass.length; k++) {
        (function (k) {
            CloudDisk.ShareClass[k].onclick = function () {
                for (var i = 0; i < CloudDisk.ShareClass.length; i++) {
                    CloudDisk.ShareClass[i].className = '';
                }
                CloudDisk.ShareClass[k].className = 'CloudDiskClassifyActive';
                if (k === 0) {
                    CloudDisk.CloudDiskMainInfo(null, 'share');
                    CloudDisk.AddresButton[1].innerHTML = '我的分享';
                } else {
                    CloudDisk.CloudDiskMainInfo(null, 'disshare');
                }
            }
        })(k)
    }
    CloudDisk.CloudDiskMainInfo(null, 'normal');
    CloudDisk.All.tabIndex = -1;
    CloudDisk.All.focus();
};//网盘加载入口
CloudDisk.GetDiskTreeInfo = function (id, thisFolder) {
    var createnode;
    if (!thisFolder) {
        createnode = document.getElementsByClassName('CloudDiskTreesContainer')[0].getElementsByClassName('CloudDFoContainer')[0];
    } else {
        createnode = thisFolder;
    }
    CloudMain.Ajax({
        url: "/service/disk/GetTreeFile",
        data: {
            disk_id: id
        },
        success: function (rs) {
            var file_name, disk_id;
            for (var i = 0; i < rs.length; i++) {
                file_name = rs[i].disk_name;
                disk_id = rs[i].disk_id;
                CloudDisk.PrintDiskTrees(file_name, disk_id, createnode);
            }
        }
    });
};//网盘树目录获取
CloudDisk.CloudDiskMainInfo = function (id, type) {
    if (CloudDisk.NowPage === 1) {
        CloudDisk.SelectTips.innerHTML = '';
        CloudDisk.FileList = [];
        CloudDisk.CloudDiskMain.innerHTML=CloudDisk.Loading;
    }
    if (!id) {
        id = 'null';
    }
    if (CloudDisk.NowType !== type) {
        CloudDisk.NowCount = 0;
        CloudDisk.NowPage = 1;
        CloudDisk.CloudDiskMain.innerHTML=CloudDisk.Loading;
    }
    CloudDisk.NowID = id;
    CloudDisk.NowType = type;
    CloudMain.Ajax({
        url: "/service/disk/GetMainFile",
        data: {
            id: id,
            page: CloudDisk.NowPage,
            loadtype: type
        },
        success: function (rs) {
            if (CloudDisk.NowPage === 1) {
                CloudDisk.NowCount = CloudDisk.AllCount = 0;
                CloudDisk.CloudDiskMain.innerHTML = '';
            }
            if (type === 'normal') {
                CloudDisk.CloudDiskMain.onmousedown = function (e) {
                    $.MouseMenu(CloudDisk.MouseMenuContainer, id, CloudDisk.MouseMenu, e);
                    $.MouseSelect(CloudDisk.ViewModes, 'CloudDiskChecked', CloudDisk.GetSelect,this, e);
                };
            } else {
                CloudDisk.CloudDiskMain.onmousedown = function (e) {
                    $.MouseSelect(CloudDisk.ViewModes, 'CloudDiskChecked', CloudDisk.GetSelect,this,e);
                }
            }
            if (rs.length === 0) {
                CloudDisk.TrashBtn.className = 'CloudDiskDisable';
            } else {
                CloudDisk.TrashBtn.className = '';
            }
            if (rs.length === 0) {
                CloudDisk.CloudDiskMain.innerHTML = CloudDisk.NullTips;
                if (type === 'normal' && CloudDisk.info.use === 0) {
                    CloudDisk.InfoShowFunc();
                }
                return false;
            }
            var file_name, disk_id, disk_type, real_name, file_main, creatTime,modify_time,share, disk_size;
            CloudDisk.LoadFlag = true;
            for (var i = 0; i < rs.length; i++) {
                file_name = rs[i].disk_name;
                disk_id = rs[i].disk_id;
                disk_type = rs[i].disk_type;
                real_name = rs[i].disk_realname;
                file_main = rs[i].disk_main;
                creatTime = rs[i].create_time;
                modify_time= rs[i].modify_time;
                share= rs[i].share;
                disk_size = rs[i].disk_size;
                CloudDisk.FileList.push(rs[i]);
                CloudDisk.NowCount++;
                CloudDisk.PrintDiskMain(file_name, disk_id, disk_type, real_name, file_main, creatTime,modify_time,share, disk_size, CloudDisk.ViewModes, type);
            }
            CloudDisk.info.max = parseInt(rs[0].max_size);
            CloudDisk.info.use = parseInt(rs[0].use_size);
            CloudDisk.AllCount = rs[0].all_count;
            CloudDisk.InfoShowFunc();
            if (CloudDisk.CloudDiskMain.scrollHeight === CloudDisk.CloudDiskMain.offsetHeight && CloudDisk.NowCount !== CloudDisk.AllCount) {
                CloudDisk.NowPage++;
                CloudDisk.CloudDiskMainInfo(CloudDisk.NowID, CloudDisk.NowType);
            }
        }
    });
    CloudDisk.LoadFlag = false;
};//网盘主页加载
CloudDisk.PrintDiskMain = function (file_name, disk_id, disk_type, real_name, file_main, creatTime,modify_time,share,file_size, viewMode, type) {
	$(".CloudDiskEmptyTips")[0]?$(".CloudDiskEmptyTips")[0].remove():"";
    if (CloudDisk.ViewModes === 'CloudDiskMFile') {
        show = '/middle/';
    } else {
        show = '/small/'
    }
    var a = $.CreateElement({
        tag: "div",
        attr:{"ripple":""},
        className: viewMode,
        node: CloudDisk.CloudDiskMain
    });
    if (type !== 'trash') {
        a.onmousedown = function (e) {
            CloudDisk.ClickSelect(this, e);
            $.MouseMenu(CloudDisk.FileMouseMenuContainer, this, CloudDisk.MouseMenuFile, e);
        };
    } else {
        a.onmousedown = function (e) {
            CloudDisk.ClickSelect(this, e);
            $.MouseMenu(CloudDisk.CloudDiskTrashMouseMenu, this, CloudDisk.TrashMouseMenu, e);
        };
    }
    if (type === 'share') {
        a.onmousedown = function (e) {
            CloudDisk.ClickSelect(this, e);
            $.MouseMenu(CloudDisk.CloudDiskShareMouseMenu, this, CloudDisk.MouseMenuFile, e);
        };
    }
    a.data = {
        "disk_id": disk_id,
        "disk_type": disk_type,
        "disk_name": file_name,
        "disk_real_name": real_name,
        "disk_size":file_size,
        "disk_main": file_main?(CloudMain.ServerUrl+'/'+file_main):null,
        "create_time": creatTime,
        "modify_time":modify_time,
        "share":share
    };
    a.span = $.CreateElement({
        tag: "span",
        html: '<img src="./public/img/disk' + show + 'FolderType.png">',
        node: a
    });
    a.p = $.CreateElement({
        tag: "p",
        html: file_name,
        node: a
    });
    $.CreateElement({
        tag: "div",
        className: 'CloudDiskTime',
        html: creatTime,
        node: a
    });
    $.CreateElement({
        tag: "div",
        className: 'CloudDiskTime',
        html: $.Math.FileSize (file_size),
        node: a
    });
    if (file_main) {
        CloudDisk.judgeFile(real_name, a)
    }
    else {
        a.ondblclick = function () {
            CloudDisk.NowCount = 0;
            CloudDisk.NowPage = 1;
            CloudDisk.DiskNav(this);
            CloudDisk.CloudDiskMainInfo(this.data.disk_id, 'normal')
        };
    }
};//打印网盘主页
CloudDisk.PrintDiskTrees = function (file_name, disk_id, createnode) {
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
        CloudDisk.OpenTrees(this);
    };
    b.onmousedown = function () {
        CloudDisk.SelectTrees(this)
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
CloudDisk.judgeFile = function (filename, this_file) {
    var type = $.String.before(filename, "."), show;
    if (CloudDisk.ViewModes === 'CloudDiskMFile') {
        show = '/middle/';
    } else {
        show = '/small/'
    }
    if ($.String.exist(type, '7z,zip,rar,tar.gz')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'RarType.png">';
        this_file.ondblclick = function () {
            CloudDisk.Unzip = function (a) {
                $.Toast('开始解压');
                CloudMain.Ajax({
                    url:"/service/disk/UnZipFile",
                    data: {
                        url: this_file.data.disk_main.split(CloudMain.ServerUrl+'/')[1],
                        parent_id: CloudDisk.TreesData
                    },
                    success: function (rs) {
                        if (rs) {
                            $.Toast('解压完成');
                        }
                    }
                });
                $.Window.Close(a);
            };
            if (type === 'zip') {
                $.Confirm({
                    id: 'CloudDiskConfrim',
                    node: CloudDisk.All,
                    title: '在线解压',
                    notic: '请选择解压地址<br>',
                    submit_func: CloudDisk.Unzip
                });
                CloudDisk.MouseTrees($("#CloudDiskConfrim .SlimfConfirmNote")[0])
            } else {
                $.Toast('暂不支持打开' + type + '文件')
            }
        };
    }
    else if ($.String.exist(type, 'apng,png,jpg,jpeg,bmp,gif,APNG,PNG,JPG,JPEG,BMP,GIF')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'ImageType.png">';
        this_file.photo_url = this_file.data.disk_main;
        this_file.ondblclick = function () {
            $.ImageShow(this_file)
        };
    }
    else if ($.String.exist(type, 'mp4,rmvb,mkv,MP4,RMVB,MKV')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'VideoType.png">';
        this_file.ondblclick = function () {
            $.VideoPlayer(this_file.data.disk_name, this_file.data.disk_main);
        };
    }
    else if ($.String.exist(type, 'm4a,mp3,ogg,flac,f4a,wav,ape,M4A,MP3,OGG,FLAC,F4A,WAV,APE')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'MusicType.png">';
        this_file.audio_name = this_file.data.disk_name;
        this_file.audio_url = this_file.data.disk_main;
        this_file.ondblclick = function () {
            $.AudioPlayer(this_file)
        };
        //播放音频
    }
    else if ($.String.exist(type, 'doc,docx,DOC,DOCX')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'DocType.png">';
        this_file.ondblclick = function () {
            CloudDisk.loadFileContent(this_file);
        };
    }
    else if ($.String.exist(type, 'ppt,pptx,PPT,PPTX')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'PptType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不支持打开幻灯片文件')
        };
    }
    else if ($.String.exist(type, 'xls,xlsx,XLS,XLSX')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'ExcelType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不支持打开表格文件')
        };
    }
    else if ($.String.exist(type, 'pdf,PDF')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'PdfType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不支持打开pdf文件')
        };
    }
    else if ($.String.exist(type, 'ini,txt,md,INI,TXT,MD')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'TxtType.png">';
        this_file.ondblclick = function () {
            CloudDisk.loadFileContent(this_file);
        };
    }
    else if ($.String.exist(type, 'xml,aspx,php,phtml,.htaccesscss,js,c,XML,ASPX,PHP,PHTML,.HTACCESSCSS,JS,C')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'CodeType.png">';
        this_file.ondblclick = function () {
            CloudDisk.loadFileContent(this_file);
        };
    }
    else if ($.String.exist(type, 'htm,html,HTM,HTML')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'WebType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不允许打开该文件')
        };
    }
    else if ($.String.exist(type, 'log,LOG')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'OtherType.png">';
        this_file.ondblclick = function () {
            CloudDisk.loadFileContent(this_file);
        };
    }
    else if ($.String.exist(type, 'exe,msi,EXE,MSI')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'ExeType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不支持打开window安装文件')
        };
    }
    else if ($.String.exist(type, 'torrent,TORRENT')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'BtType.png">';
        this_file.ondblclick = function () {
            $.Toast('暂不支持种子文件')
        };
    }
    else if ($.String.exist(type, 'vcf,VCF')) {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'VcfType.png">';
    }
    else {
        this_file.span.innerHTML = '<img src="./public/img/disk' + show + 'OtherType.png">';
    }
};//区分文件，添加图标和打开方法
CloudDisk.ClickSelect = function (thisFile, e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.button === 0) {
        if (CloudDisk.KeyFlag === 'Ctrl') {
            if(thisFile.className===CloudDisk.ViewModes + ' CloudDiskChecked'){
                thisFile.className=CloudDisk.ViewModes
            }else {
                thisFile.className = CloudDisk.ViewModes + ' CloudDiskChecked';
            }
        } else if (CloudDisk.KeyFlag === 'Shift') {
            var Start = 1,End;
            for (var i = 0; i < CloudDisk.File.length; i++) {
                CloudDisk.File[i].className = CloudDisk.ViewModes;
            }
            thisFile.className = CloudDisk.ViewModes + ' CloudDiskChecked';
            if(CloudDisk.NowSelect){
                for (var i = 0; i < CloudDisk.File.length; i++) {
                    if (CloudDisk.File[i] === CloudDisk.NowSelect) {
                        Start = i;
                    }
                    if (CloudDisk.File[i] === thisFile) {
                        End = i;
                    }
                }
            }
            for (var j =  Math.min(End,Start); j < Math.max(End,Start) +1 ; j++) {
                CloudDisk.File[j].className = CloudDisk.ViewModes + ' CloudDiskChecked';
            }
        }
        else if (CloudDisk.KeyFlag === null) {
            for (var i = 0; i < CloudDisk.File.length; i++) {
                CloudDisk.File[i].className = CloudDisk.ViewModes;
            }
            CloudDisk.NowSelect=thisFile;
            thisFile.className = CloudDisk.ViewModes + ' CloudDiskChecked';
        }
    }
    CloudDisk.GetSelect();
};//鼠标点击选择
CloudDisk.GetSelect = function () {
    var select = document.getElementsByClassName('CloudDiskChecked'), count = 0;
    for (var i = 0; i < select.length; i++) {
        count++;
    }
    if (count > 0) {
        CloudDisk.SelectTips.innerHTML = '已选择' + count + '个文件/文件夹';
    } else {
        CloudDisk.SelectTips.innerHTML = '';
    }
};//多选文件函数
CloudDisk.InfoShowFunc = function () {
    CloudDisk.InfoShow = $("#CloudDiskInfoShow")[0];
    CloudDisk.SliderShow = $("#CloudDiskInfoSlider")[0];
    var int = (CloudDisk.info.use / CloudDisk.info.max) * 100;
    CloudDisk.SliderShow.style.width = int + '%';
    if (75 < int && int < 85) {
        CloudDisk.SliderShow.style.background = '#f7ab21';
    } else if (int > 85) {
        CloudDisk.SliderShow.style.background = '#e83c3c';
    } else {
        CloudDisk.SliderShow.style.background = '';
    }
    CloudDisk.InfoShow.innerHTML = '已用:' + $.Math.FileSize (CloudDisk.info.use) + '/' + $.Math.FileSize (CloudDisk.info.max);
};//网盘信息处理函数
CloudDisk.OpenFolder = function (thisFolder) {
    CloudDisk.SelectTips.innerHTML = '';
    CloudDisk.CloudDiskMainInfo(thisFolder.data.disk_id, 'normal');
    if (thisFolder.data.load === false) {
        CloudDisk.GetDiskTreeInfo('folder', thisFolder.data.disk_id, thisFolder.parentNode);
        thisFolder.data.load = true;
        thisFolder.data.state = 'block';
        thisFolder.span.className = 'sf-icon-folder-open';
    } else {
        if (thisFolder.data.state === 'none') {
            thisFolder.data.state = 'block';
            thisFolder.span.className = 'sf-icon-folder-open';
        } else {
            thisFolder.data.state = 'none';
            thisFolder.span.className = 'sf-icon-folder';
        }
        var aaa = thisFolder.parentNode.getElementsByClassName('childFolder');
        for (var i = 0; i < aaa.length; i++) {
            aaa[i].style.display = thisFolder.data.state;
        }
    }
};//文件夹深层加载喊
CloudDisk.DiskNav = function (folder) {
    var a = document.getElementsByClassName('CloudDiskNavBlock');
    if (!folder) {
        folder = thisFolder;
    }
    for (var i = 0; i < a.length; i++) {
        if (a[i].data.disk_id === folder.data.disk_id) {
            return;
        }
    }
    var b = $.CreateElement({
        tag: "div",
        className: 'CloudDiskNavBlock',
        html: folder.data.disk_name,
        node: CloudDisk.CloudDiskNavBar
    });
    b.data = {
        "disk_id": folder.data.disk_id
    };
    b.onclick = function () {
        CloudDisk.DiskNav.close(this)
    };
    CloudDisk.DiskNav.close = function (thisBlock) {
        CloudDisk.CloudDiskMainInfo(thisBlock.data.disk_id, 'normal');
        var DiskNav = thisBlock.parentElement.getElementsByClassName("CloudDiskNavBlock");
        for (var i = DiskNav.length - 1; i > 0; i--) {
            if (thisBlock === DiskNav[i]) {
                break;
            }
			DiskNav[i].remove();
        }
        if (DiskNav.length === 0) {
            CloudDisk.AddresButton[0].className = 'sf-icon-arrow-left CloudDiskDisable';
        } else {
            CloudDisk.AddresButton[0].className = 'sf-icon-arrow-left';
        }
    };
    CloudDisk.AddresButton[0].className = 'sf-icon-arrow-left';
};//导航生成函数
CloudDisk.Search = function () {
    CloudDisk.AddresButton[1].innerHTML = '搜索结果';
    CloudDisk.CloudDiskNavBar.innerHTML = '';
    CloudDisk.AddresButton[0].className = 'sf-icon-arrow-left CloudDiskDisable';
    for (var i = 0; i < CloudDisk.Classify.length; i++) {
        CloudDisk.Classify[i].className = '';
    }
    CloudDisk.CloudDiskMainInfo(CloudDisk.SearchInput.value, 'search');
};//网盘搜索入口
CloudDisk.ViewMode = function (a) {
    if (CloudDisk.FileList.length === 0) {
        return false
    }
    CloudDisk.CloudDiskMain.innerHTML = '';
    if (a.className === 'sf-icon-th-large') {
        CloudDisk.ViewModes = 'CloudDiskMList';
        CloudDisk.CloudDiskMainFunc.style.display = 'block';
        CloudDisk.CloudDiskMain.style.height = 'calc(100% - 30px)';
        a.className = 'sf-icon-list-ul';
    } else {
        CloudDisk.ViewModes = 'CloudDiskMFile';
        CloudDisk.CloudDiskMainFunc.style = '';
        CloudDisk.CloudDiskMain.style = '';
        a.className = 'sf-icon-th-large';
    }
    var file_name, disk_id, disk_type, real_name, file_main, rs = CloudDisk.FileList, creatTime,modify_time,share, disk_size;
    for (var i = 0; i < rs.length; i++) {
        file_name = rs[i].disk_name;
        disk_id = rs[i].disk_id;
        disk_type = rs[i].disk_type;
        real_name = rs[i].disk_realname;
        file_main = rs[i].disk_main;
        creatTime = rs[i].create_time;
        modify_time= rs[i].modify_time;
        share= rs[i].share;
        disk_size = rs[i].disk_size;
        CloudDisk.PrintDiskMain(file_name, disk_id, disk_type, real_name, file_main, creatTime,modify_time,share, disk_size, CloudDisk.ViewModes, CloudDisk.NowType);
    }
};//网盘显示模式切换
CloudDisk.OpenTrees = function (thisFolder) {
    CloudDisk.TreesData = thisFolder.data.disk_id;
    if (thisFolder.data.load === 'false') {
        CloudDisk.GetDiskTreeInfo(thisFolder.data.disk_id, thisFolder.parentNode);
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
};//网盘展开树目录函数，避免重复加载
CloudDisk.SelectTrees = function (b) {
    var a = document.getElementsByClassName('CloudDiskTreesContainer')[0].getElementsByTagName('li');
    for (var i = 0; i < a.length; i++) {
        a[i].className = '';
    }
    b.className = 'CloudDiskTreeActive';
    CloudDisk.TreesData = b.data.disk_id;
};//选择树目录
CloudDisk.MouseTrees = function (node) {
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
        CloudDisk.OpenTrees(this);
    };
    b.onmousedown = function () {
        CloudDisk.SelectTrees(this)
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
    CloudDisk.GetDiskTreeInfo(null);
};//创建树目录
CloudDisk.MakeSelectFiles = function (thisFolder) {
    CloudDisk.SelectFiles = [];
    CloudDisk.SelectFiles.push(thisFolder);
    var b = document.getElementsByClassName("CloudDiskChecked");
    if (b.length > 1) {
        CloudDisk.SelectFiles = [];
        for (var a = 0; a < b.length; a++) {
            CloudDisk.SelectFiles.push(b[a]);
        }
    }
    return CloudDisk.SelectFiles;
};//处理被选中的文件效果
CloudDisk.MakeSelectData = function () {
    var data = '';
    for (var j = 0; j < CloudDisk.SelectFiles.length; j++) {
        data = data + CloudDisk.SelectFiles[j].data.disk_id + ',';
    }
    return data.substring(0, data.length - 1);
};//处理被选中文件的数据收集
CloudDisk.MakeRemoveFiles = function () {
    for (var i = 0; i < CloudDisk.FileList.length; i++) {
        for (var j = 0; j < CloudDisk.SelectFiles.length; j++) {
            if (CloudDisk.SelectFiles[j].data.disk_id === CloudDisk.FileList[i].disk_id) {
                var int = i;
				CloudDisk.SelectFiles[j].remove();
                CloudDisk.FileList.splice(int, 1);
            }
        }
    }
    if (CloudDisk.File.length === 0) {
        CloudDisk.TrashBtn.className = 'CloudDiskDisable';
        CloudDisk.CloudDiskMain.innerHTML = CloudDisk.NullTips;
    }
};//处理批量操作的函数
CloudDisk.MouseMenu = function (id) {
    if (CloudDisk.Clipboard.length) {
        CloudDisk.PasteButton.className = '';
    } else {
        CloudDisk.PasteButton.className = 'CloudDiskDisable';
    }
    CloudDisk.MouseMenu.upload = function () {
        if (CloudDisk.info.use < CloudDisk.info.max) {
            $.Request.upload('disk', id, CloudMain.ServerUrl+'/service/disk/DiskUpload',function () {
                CloudDisk.NowPage = 1;
                CloudDisk.AllCount = CloudDisk.NowCount = 0;
                CloudDisk.CloudDiskMainInfo(id, 'normal');
            });
        } else {
            $.Toast('空间不足');
        }
    };
    CloudDisk.MouseMenu.CreateFolder = function () {
        CloudDisk.MouseMenu.CreateFolder.Sub = function (a) {
            var CloudDiskNewFolderName = $("#CloudDiskNewFolderName")[0].value;
            var reg = new RegExp('^[^\/:*?"<>|]+$');
            if (CloudDiskNewFolderName === '') {
                $.Toast('文件夹名称不能为空');
                return
            } else if (!reg.test(CloudDiskNewFolderName)) {
                $.Toast('文件夹名不能包含 | / \\ : * " ');
                return
            }
            CloudMain.Ajax({
                url: "/service/disk/NewFolder",
                data: {
                    parent_id: id,
                    name: CloudDiskNewFolderName
                },
                success: function (rs) {
                    if (rs[0].state) {
                        $.Toast('文件夹名称已被使用');
                        $("#CloudDiskNewFolderName")[0].value = '';
                        return false
                    } else if (rs[0].disk_id) {
                        if (CloudDisk.FileList.length === 0) {
                            CloudDisk.CloudDiskMain.innerHTML = '';
                        }
                        CloudDisk.PrintDiskMain(rs[0].disk_name, rs[0].disk_id, rs[0].disk_type, rs[0].disk_realname, rs[0].disk_main, rs[0].create_time,rs[0].modify_time,rs[0].share,rs[0].disk_size, CloudDisk.ViewModes, CloudDisk.NowType);
                        CloudDisk.FileList.push(rs[0]);
                    } else {
                        $.Toast('文件夹创建失败');
                    }
                    $.Window.Close(a)
                }
            });
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '新建文件夹',
            notic: '输入文件夹名称',
            confirm_input: 'CloudDiskNewFolderName',
            submit_func: CloudDisk.MouseMenu.CreateFolder.Sub,
            confirm_input_val: ''
        });
    };
    CloudDisk.MouseMenu.paste = function (a) {
        if (a.className === 'CloudDiskDisable') {
            return
        }
        var url='';
        if(CloudDisk.ClipboardType===1){//剪切
            url=CloudMain.ServerUrl+'/service/disk/MoveFile'
        }else if(CloudDisk.ClipboardType===2){
            url=CloudMain.ServerUrl+'/service/disk/CopyFile'
        }
        $.Request.post(url, {
            "parent_id": id,
            "id": CloudDisk.MakeSelectData()
        },function (res) {
            if(CloudDisk.ClipboardType===2){
                CloudDisk.CloudDiskMainInfo(CloudDisk.NowID,CloudDisk.NowType)
            }else{
                for (var i = 0; i < CloudDisk.Clipboard.length; i++) {
                    var rs = CloudDisk.Clipboard[i].data;
                    CloudDisk.PrintDiskMain(rs.disk_name, rs.disk_id, rs.disk_type, rs.disk_real_name, rs.disk_main, rs.create_time,rs.modify_time,rs.share,rs.disk_size, CloudDisk.ViewModes, CloudDisk.NowType);
                    CloudDisk.FileList.push(rs);
                }
            }
            CloudDisk.Clipboard = [];
            CloudDisk.ClipboardType = 0;
        });
    };
    CloudDisk.MouseMenu.refues = function () {
        CloudDisk.NowPage = 1;
        CloudDisk.AllCount = CloudDisk.NowCount = 0;
        CloudDisk.CloudDiskMainInfo(id, 'normal');
    };
};//右键菜单函数
CloudDisk.MouseMenuFile = function (thisFolder) {
    var fileData = CloudDisk.MakeSelectFiles(thisFolder);
    if(fileData.length>1){
        CloudDisk.ShareButton.className= 'CloudDiskDisable';
    }
    if(fileData.length>=1) {
        CloudDisk.CopyButton.className = CloudDisk.DownLoadButton.className = '';
    }
    for (var i = 0; i < fileData.length; i++) {
        if (fileData[i].data.disk_type === 'folder') {
            CloudDisk.DownLoadButton.className = 'CloudDiskDisable';
        }
    }
    CloudDisk.MouseMenuFile.open = function () {
        thisFolder.ondblclick();
    };
    CloudDisk.MouseMenuFile.Download = function () {
        if (thisFolder.data.disk_type === 'folder') {
            return false;
        }
        if(fileData.length>3){
            $.Toast('所选下载文件过多');
            return
        }
        for(var i=0;i<fileData.length;i++){
            $.Request.download(fileData[i].data.disk_main, fileData[i].data.disk_name)
        }
    };
    CloudDisk.MouseMenuFile.moveto = function () {
        CloudDisk.MouseMenuFile.moveto.sub = function (a) {
            for (var j = 0; j < CloudDisk.SelectFiles.length; j++) {
                if (CloudDisk.SelectFiles[j].data.disk_id === CloudDisk.TreesData || CloudDisk.TreesData === CloudDisk.NowID) {
                    $.Window.Close(a);
                    return;
                }
            }
            CloudMain.Ajax({
                url:"/service/disk/MoveFile",
                data: {
                    parent_id: CloudDisk.TreesData,
                    id: CloudDisk.MakeSelectData()
                },
                success: function (rs) {
                    if (rs) {
                        CloudDisk.MakeRemoveFiles();
                    }
                }
            });
            $.Window.Close(a);
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '选择一个文件夹',
            notic: '正在加载',
            submit_func: CloudDisk.MouseMenuFile.moveto.sub,
            callback:function (a) {
                a.innerHTML='';
                CloudDisk.MouseTrees(a)
            }
        });
    };
    CloudDisk.MouseMenuFile.Copy = function () {
        CloudDisk.Clipboard = fileData;
        CloudDisk.ClipboardType = 2;
    };
    CloudDisk.MouseMenuFile.Cut = function () {
        CloudDisk.Clipboard = fileData;
        CloudDisk.ClipboardType = 1;
        for (var j = 0; j < CloudDisk.SelectFiles.length; j++) {
			CloudDisk.SelectFiles[j].remove();
            if (CloudDisk.File.length === 0) {
                CloudDisk.CloudDiskMain.innerHTML = CloudDisk.NullTips;
            }
        }
    };
    CloudDisk.MouseMenuFile.Rename = function () {
        CloudDisk.MouseMenuFile.Rename.sub = function (a) {
            var newName = $("#CloudDiskNewFName")[0].value;
            var reg = new RegExp('^[^\/:*?"<>|]+$');
            if (newName === '') {
                $.Toast('文件名称不能为空');
                return
            } else if (!reg.test(newName)) {
                $.Toast('文件名不能包含 | / \\ : * " ');
                return
            } else if (newName === thisFolder.data.disk_name) {
                $.Window.Close(a);
                return
            }
            CloudMain.Ajax({
                url: "/service/disk/RenameFile",
                data: {
                    name: newName,
                    id: thisFolder.data.disk_id
                },
                success: function (rs) {
                    if (rs[0].newname) {
                        thisFolder.p.innerHTML = rs[0].newname;
                        thisFolder.data.disk_name = rs[0].newname;
                        thisFolder.data.disk_real_name = rs[0].newname;
                        for (var i = 0; i < CloudDisk.FileList.length; i++) {
                            if (thisFolder.data.disk_id === CloudDisk.FileList[i].disk_id) {
                                CloudDisk.FileList[i].disk_name = rs[0].newname;
                            }
                        }
                    }
                    $.Window.Close(a)
                }
            });
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '重命名',
            notic: '为 ' + thisFolder.data.disk_name + ' 重命名',
            submit_func: CloudDisk.MouseMenuFile.Rename.sub,
            confirm_input: 'CloudDiskNewFName',
            confirm_input_val: thisFolder.data.disk_name
        });
    };
    CloudDisk.MouseMenuFile.Delete = function () {
        var tips = thisFolder.data.disk_name;
        if (CloudDisk.SelectFiles.length > 1) {
            tips = thisFolder.data.disk_name + ' 共' + CloudDisk.SelectFiles.length + '个文件/文件夹';
        }
        CloudDisk.MouseMenuFile.Delete.sub = function (a) {
            CloudMain.Ajax({
                url:"/service/disk/TrashFile",
                data: {
                    id: CloudDisk.MakeSelectData()
                },
                success: function (rs) {
                    if (rs) {
                        CloudDisk.MakeRemoveFiles();
                    }
                }
            });
            $.Window.Close(a);
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '删除',
            notic: '确认将 ' + tips + " 移至回收站?",
            submit_func: CloudDisk.MouseMenuFile.Delete.sub
        });
    };
    CloudDisk.MouseMenuFile.share = function () {
        if (CloudDisk.SelectFiles.length>1) {
            return false;
        }
        CloudDisk.ShareChangeType = function () {
            CloudDisk.ShareType=0;
            var node = $("#CloudDiskConfrim .SlimfConfirmNote")[0];
            node.innerHTML = '';
            var c = [];
            var a = $.CreateElement({
                tag: "div",
                className: 'CloudDiskShareWindow',
                node: node
            });
            var b = $.CreateElement({
                tag: "ul",
                html: '<li class="CloudDiskShareActive">公开分享</li><li>加密分享</li>',
                node: a
            });
            for (var i = 0; i < b.childNodes.length; i++) {
                c[i] = $.CreateElement({
                    tag: "div",
                    className: 'CloudDiskShareWContent',
                    node: a
                });
                c[0].style.display = 'block';
                (function (i) {
                    b.childNodes[i].onclick = function () {
                        for (var j = 0; j < b.childNodes.length; j++) {
                            c[j].style.display = 'none';
                            b.childNodes[j].className = '';
                        }
                        CloudDisk.ShareType = i;
                        c[i].style.display = 'block';
                        b.childNodes[i].className = 'CloudDiskShareActive';
                    }
                }(i));
            }
            $.CreateElement({
                tag: "p",
                html: '任何人查看链接即可查看、保存',
                node: c[0]
            });
            $.CreateElement({
                tag: "p",
                html: '输入密码才能查看、更安全',
                node: c[1]
            })
        };
        CloudDisk.CopyAddres = function () {
            var input = $("#CloudDiskConfrim input");
            var content=null;
            if (input[1]) {
                content = '链接:' + input[0].value + '密码:' + input[1].value;
            } else {
                content = '链接:' + input[0].value;
            }
            var a = $.CreateElement({
                tag: "input",
                style: {"position": "absolute", "bottom": "-100px"},
                attr: {"type": "text", "value": content},
                node: $("#CloudDiskConfrim .SlimfConfirmNote")[0]
            });
            a.select();
            document.execCommand('copy');
			a.remove();
        };
        CloudDisk.CreatShare = function () {
            CloudMain.Ajax({
                url: "/service/disk/ShareFile",
                data: {
                    shareType: CloudDisk.ShareType + 1,
                    id: thisFolder.data.disk_id
                },
                success: function (rs) {
                    if (rs[0].share) {
                        $.Toast('该资源已经分享,请不要重复分享');
                    }
                    var pass = '', copy = '<button onclick="CloudDisk.CopyAddres()">复制链接</button>';
                    if (rs[0].password) {
                        pass = '密码：<input spellcheck="false" type="text" style="width: 70px" value=' + rs[0].password + '>';
                        copy = '<button onclick="CloudDisk.CopyAddres()">复制链接及密码</button>';
                    }
                    thisFolder.data.share=rs[0].addres;
                    var content = '分享链接已生成，复制给好友吧<br>链接：<input spellcheck="false"  type="text" style="width: 273px" value=http://' + window.location.host + '/s/' + rs[0].addres + '><br>' + pass + copy;
                    $.Confirm({
                        id: 'CloudDiskConfrim',
                        node: CloudDisk.All,
                        title: '分享链接',
                        notic: content
                    });
                }
            });
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '分享方式',
            notic: '正在加载',
            submit_func: CloudDisk.CreatShare,
            callback: CloudDisk.ShareChangeType
        });
    };
    CloudDisk.MouseMenuFile.Info = function () {
        CloudDisk.MouseMenuFile.LoadInfo = function (node) {
            var rs=thisFolder.data;
            var type = $.String.before(thisFolder.span.innerHTML, '/');
            type = './public/img/disk/middle/' + type.substr(0, type.length - 2);
            var share = '分享：该文件/文件夹未分享';
            if (rs.share) {
                share = '<p>分享：<input type="text" spellcheck="false" value="'+CloudMain.ServerUrl + '/s/' + rs.share+'"><button>取消</button><button>复制</button></p>'
            }
            var a = $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoContainer',
                node: node
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoHead',
                html: '<img src=' + type + '><span>' + rs.disk_name + '</span>',
                node: a
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '<span>文件名:</span><div>' + rs.disk_name + '</div>',
                node: a
            });
            var b = $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '<span>位置:网盘</span><div style="width: 250px;">' + '正在获取' + '</div>',
                style: {"border-bottom": "1px solid #eee"},
                node: a
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '大小:' + $.Math.FileSize (rs.disk_size||0) + '(' + (rs.disk_size||0) + '字节)',
                node: a
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '创建时间：' + rs.create_time,
                node: a
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '修改时间：' + rs.modify_time,
                style: {"border-bottom": "1px solid #eee"},
                node: a
            });
            $.CreateElement({
                tag: "div",
                className: 'CloudDiskInfoList',
                html: '<span>GUID:</span><div style="width: 275px;">' + rs.disk_id + '</div>',
                node: a
            });
            $.CreateElement({
                id: "CloudDiskShare",
                className: 'CloudDiskInfoList',
                html:share,
                node: a
            });
            if(rs.share) {
                var area = $("#CloudDiskShare *");
                area[1].onfocus = function () {
                    this.select();
                };
                area[2].onclick = function () {
                    CloudDisk.CancelShare(thisFolder)
                };
                area[3].onclick = function () {
                    area[1].select();
                    document.execCommand('copy');
                };
            }
            node.parentNode.parentNode.style.top = (window.innerHeight - node.parentNode.parentNode.offsetHeight) / 2 + 'px';
            $.Request.load(b.getElementsByTagName("div")[0], '../service/disk/AddresFile/' + rs.disk_id);
        };
        $.Confirm({
            id: 'CloudDiskInfoConfrim',
            title: thisFolder.data.disk_name + '属性',
            height:"450px",
            callback: CloudDisk.MouseMenuFile.LoadInfo,
            node: CloudDisk.All
        });
    };
};//文件、文件夹右键菜单函数
CloudDisk.TrashMouseMenu = function (thisFolder) {
    CloudDisk.MakeSelectFiles(thisFolder);
    CloudDisk.TrashMouseMenu.Restore = function () {
        CloudMain.Ajax({
            url: "/service/disk/RestoreFile",
            data: {
                id: CloudDisk.MakeSelectData()
            },
            success: function (rs) {
                if (rs) {
                    CloudDisk.MakeRemoveFiles();
                }
            }
        });
    };
    CloudDisk.TrashMouseMenu.Delete = function () {
        var tips = thisFolder.data.disk_name;
        if (CloudDisk.SelectFiles.length > 1) {
            tips = thisFolder.data.disk_name + '共' + CloudDisk.SelectFiles.length + '个文件';
        }
        CloudDisk.TrashMouseMenu.Delete.sub = function (a) {
            CloudMain.Ajax({
                url: "/service/disk/DeleteFile",
                data: {
                    id: CloudDisk.MakeSelectData()
                },
                success: function (rs) {
                    if (rs) {
                        CloudDisk.MakeRemoveFiles();
                    }
                }
            });
            $.Window.Close(a);
        };
        $.Confirm({
            id: 'CloudDiskConfrim',
            node: CloudDisk.All,
            title: '删除',
            notic: '确认将 ' + tips + " 彻底删除?<br><span style='color:#e83c3c'>文件夹下所有文件将会删除</span>",
            submit_func: CloudDisk.TrashMouseMenu.Delete.sub
        });
    }
};//回收站右键菜单
CloudDisk.TrashClean = function (button) {
    if (button.className === 'CloudDiskDisable') {
        return false;
    }
    CloudDisk.TrashClean.sub = function (a) {
        CloudMain.Ajax({
            url:"/service/disk/DeleteFile",
            data: {
                id: ''
            },
            success: function (rs) {
                button.className = 'CloudDiskDisable';
                CloudDisk.FileList = [];
                CloudDisk.CloudDiskMain.innerHTML = CloudDisk.NullTips;
            }
        });
        $.Window.Close(a);
    };
    $.Confirm({
        id: 'CloudDiskConfrim',
        node: CloudDisk.All,
        title: '清空回收站',
        notic: '确认清空回收站？',
        submit_func: CloudDisk.TrashClean.sub
    });
};//清空回收站方法
CloudDisk.FileSort = function (w, key) {
    if (CloudDisk.FileList.length <= 1) {
        return false
    }
    CloudDisk.CloudDiskMain.innerHTML = '';
    CloudDisk.SelectTips.innerHTML = '';
    var thisSort = CloudDisk.CloudDiskFuncBlock[w];
    var state = thisSort.getAttribute('state');
    if (state === 'up') {
        $.Array.sort(CloudDisk.FileList, key, '<');
        thisSort.setAttribute("state", 'down');
    } else {
        $.Array.sort(CloudDisk.FileList, key, '>');
        thisSort.setAttribute("state", 'up');
    }
    if (w === 0) {
        thisSort.className = 'CloudDiskFuncBlock sf-icon-sort-amount-' + thisSort.getAttribute('state');
    } else {
        thisSort.className = 'CloudDiskFuncBlock sf-icon-sort-numeric-' + thisSort.getAttribute('state');
    }
    var a = setTimeout(function () {
        thisSort.className = 'CloudDiskFuncBlock';
        clearTimeout(a);
    }, 1000);
    var file_name, disk_id, disk_type, real_name, file_main, rs = CloudDisk.FileList, creatTime,modify_time,share, disk_size;
    for (var i = 0; i < rs.length; i++) {
        file_name = rs[i].disk_name;
        disk_id = rs[i].disk_id;
        disk_type = rs[i].disk_type;
        real_name = rs[i].disk_realname;
        file_main = rs[i].disk_main;
        creatTime = rs[i].create_time;
        modify_time= rs[i].modify_time;
        share= rs[i].share;
        disk_size = rs[i].disk_size;
        CloudDisk.PrintDiskMain(file_name, disk_id, disk_type, real_name, file_main, creatTime,modify_time,share, disk_size, CloudDisk.ViewModes, CloudDisk.NowType);
    }
};//文件排序方法
CloudDisk.CancelShare = function (thisFolder) {
    CloudDisk.CancelShare.sub = function (a) {
        CloudMain.Ajax({
            url:"/service/disk/CancelShareFile",
            data: {
                id: thisFolder.data.disk_id,
                share_id: thisFolder.data.share
            },
            success: function (rs) {
                if (rs[0].state) {
                    $.Toast('分享已取消');
                    $("#CloudDiskShare").html('未分享');
                    thisFolder.data.share='';
                } else {
                    $.Toast('操作失败');
                }
            }
        });
        $.Window.Close(a);
    };
    $.Confirm({
        id: 'CloudDiskConfrim',
        title: '取消分享',
        notic: "取消分享后，分享链接将被删除，好友将无法再访问此分享链接。\n" +
        "你确认要取消分享吗？",
        submit_func: CloudDisk.CancelShare.sub,
        node: CloudDisk.All
    });
};//取消文件分享
CloudDisk.loadFileContent = function (this_file) {
   $.Window.NewWindow({
        id: 'CustomFunc' + this_file.data.disk_id,
        className: 'SlimfWindow',
        mini: false,
        width: "800px",
        height: "500px",
        title: this_file.data.disk_name + ' 文件查看',
        bg: '#fff',
        color: '#333',
        callback:function (a) {
            a.id='CloudDiskEditor';
            CloudDiskEditor = new SlimfEditor('#CloudDiskEditor');
            CloudDiskEditor.customConfig={
                SaveFunc:function (a) {
                    $.Toast('暂不提供文件修改功能')
                },
                DownLoad:function (a) {
                    alert(1)
                }
            };
            CloudDiskEditor.create();
            var contaier= $("#"+CloudDiskEditor.textElemId)[0];
            CloudMain.Ajax({
                url: "/service/disk/OpenFile",
                dataType:"text",
                data: {
                    name: $.String.before(this_file.data.disk_real_name, '.'),
                    id: this_file.data.disk_id
                },
                success: function (rs) {
                    contaier.innerHTML='<pre>'+rs+'</pre>';
                }
            });
        }
    });
};//加载文件内容
CloudDisk.Start();