CloudSetting=$.NameSpace.register('CloudSetting');
CloudSetting.Main=$(".CloudSettingMain")[0];
CloudSetting.State=$(".CloudSettingHead i")[0];
CloudSetting.Bind=function () {
    var l = parseInt(132 /35);
    CloudSetting.Themes_Icon=[
        {"src":"weather.png"},
        {"src":"video.png"},
        {"src":"music.png"},
        {"src":"gallery.png"},
        {"src":"setting.png"},
        {"src":"doment.png"},
        {"src":"disk.png"},
        {"src":"note.png"},
        {"src":"chat.png"},
        {"src":"pass.png"},
        {"src":"dict.png"}
    ];
    CloudSetting.nowThemes=$.Cookie.get('themes')||CloudMain.User.theme;
    CloudSetting.ChageBtn=$(".CloudSettingList li");
    CloudSetting.ChageArea=$(".CloudSettingCMain");
    CloudSetting.Head=$(".CloudSettingBodyH")[0];
    CloudSetting.About=$(".CloudSettingAbout *");
    CloudSetting.Bglist=$(".CloudSettingNormalBg li");
    CloudSetting.nowBg=CloudMain.Main.style.background.split('"')[1].split(CloudMain.ServerUrl+'/')[1];
    CloudSetting.UploadArea=$("#ClousSettingUpload")[0];
    CloudSetting.UploadInput=$("#ClousSettingSelectBg")[0];
    CloudSetting.UploadPreview=$(".CloudSettingPreview")[0];
    CloudSetting.UploadBtnArea=$(".CloudSBtnArea")[0];
    CloudSetting.Themes=$("#CloudSettingThemes li");
    CloudSetting.ThemesImg=[];
    $(".CloudSettingAbout p")[0].innerHTML='Cloud ver:'+CloudMain.version;
    CloudSetting.About[4].innerHTML='Slimf.js ver:'+Slimf.version;
    CloudSetting.About[6].innerHTML='SlimfEditor.js ver:'+SlimfEditor.version;
    for(var i=0;i<CloudSetting.ChageBtn.length;i++){
        (function (i) {
            CloudSetting.ChageBtn[i].onclick=function () {
                CloudSetting.Head.innerHTML=CloudSetting.ChageBtn[i].innerHTML;
                for(var j=0;j<CloudSetting.ChageArea.length;j++){
                    CloudSetting.ChageArea[j].style.display='none';
                    CloudSetting.ChageBtn[j].removeAttribute('style');
                }
                CloudSetting.ChageArea[i].style.display='block';
                CloudSetting.ChageBtn[i].style.background='#efefef';
                if(i===CloudSetting.ChageBtn.length-1){
                    CloudSetting.Head.innerHTML=CloudSetting.ChageBtn[i].innerHTML+'Cloud';
                }
            }
        }(i))
    }
    for(var j=0;j<CloudSetting.Bglist.length;j++){
        if(CloudSetting.nowBg===CloudSetting.Bglist[j].getAttribute('data')){
            CloudSetting.Bglist[j].style.border='2px solid #01abc3';
        }
        (function (j) {
            CloudSetting.Bglist[j].onclick=function () {
                for(var k=0;k<CloudSetting.Bglist.length;k++){
                    CloudSetting.Bglist[k].removeAttribute('style');
                }
                var src=CloudSetting.Bglist[j].getAttribute('data');
                CloudMain.Main.style.background = "url(" +src+ ")";
                CloudSetting.Bglist[j].style.border='2px solid #01abc3';
                $.Request.post(CloudMain.ServerUrl+"/service/user/ChageUserBg",{'userpicture':"","data":src});
            }
        }(j))
    }
    for(var k=0;k<CloudSetting.Themes.length;k++){
        if(CloudSetting.nowThemes===CloudSetting.Themes[k].getAttribute('data')){
            CloudSetting.Themes[k].style.border='2px solid #01abc3';
        }
        (function (k) {
            CloudSetting.Themes[k].onclick=function () {
                for(var i=0;i<CloudSetting.Themes.length;i++){
                    CloudSetting.Themes[i].removeAttribute('style');
                }
                CloudMain.User.theme=CloudSetting.Themes[k].getAttribute('data');
                $.Cookie.set('themes',CloudSetting.Themes[k].getAttribute('data'),315360000000);
                CloudSetting.Themes[k].style.border='2px solid #01abc3';

                CloudMain.Func.create();
                CloudMain.Func.position();
            }
        }(k));
        for(var a=0;a<CloudSetting.Themes_Icon.length;a++){
            CloudSetting.ThemesImg[a]=$.CreateElement({
                tag:"img",
                attr:{"draggable":"false","src":"./public/img/bar/themes"+(k+1)+"/"+CloudSetting.Themes_Icon[a].src},
                node:CloudSetting.Themes[k]
            })
        }
        for(j=0;j<CloudSetting.ThemesImg.length;j++){
            CloudSetting.ThemesImg[j].style.left = (Math.ceil((j+1)/l)-1) * (35)+5+'px';
            CloudSetting.ThemesImg[j].style.top= (j -  l * Math.floor(j / l))*40+5+'px';
        }
    }
    CloudSetting.UploadArea.onclick=function () {
        CloudSetting.UploadPreview.src='./public/img/chat/blank.gif';
        CloudSetting.UploadInput.value=CloudSetting.UploadInput.file='';
        CloudSetting.UploadBtnArea.style.display='none';
        CloudSetting.UploadInput.click();
    }
};
CloudSetting.CheckUserBG=function (file) {
    if(file.value!==''){
        var type=$.String.before(file.value,'.');
        if(!$.String.exist(type,'png,PNG,jpg,JPG,jpeg,JPEG,bmp,BMP')){
            $.Toast('所选文件不是图片');
            CloudSetting.UploadInput.value=CloudSetting.UploadInput.file='';
            CloudSetting.UploadPreview.src='../public/img/chat/blank.gif';
            CloudSetting.UploadBtnArea.style.display='none';
            return false
        }
        $.UploadPreview(CloudSetting.UploadInput,CloudSetting.UploadPreview);
        CloudSetting.UploadBtnArea.style.display='block';
    }
};
CloudSetting.UpdateBg=function (a) {
    if(a){
        CloudSetting.State.className='sf-icon-cog sf-spin';
        var formData = new FormData($("#CloudSettingBgForm")[0]);
        CloudMain.Ajax({
            url:'/service/user/ChageUserBg',
            data: formData,
            contentType: false,
            processData: false,
            success: function() {
                CloudSetting.State.className='sf-icon-cog';
                $.Toast('上传成功');
                CloudMain.Main.style.background = "url(" + CloudSetting.UploadPreview.src + ")";
                CloudSetting.UpdateBg();
            }
        });
    }else {
        CloudSetting.UploadPreview.src = '../public/img/chat/blank.gif';
        CloudSetting.UploadInput.value = CloudSetting.UploadInput.file = '';
        CloudSetting.UploadBtnArea.style.display = 'none';
    }
};
CloudSetting.Load=function () {
    CloudSetting.infoArea=$(".CloudSettingUser *");
    CloudSetting.SafeArea=$(".CloudSettingSafe *");
    CloudMain.Ajax({
        url:'/service/user/UserInfo',
        success: function(rs) {
            CloudSetting.State.className='sf-icon-cog';
            rs=rs[0];
            CloudSetting.infoArea[0].src=CloudMain.ServerUrl+'/'+rs.userhead;
            CloudSetting.infoArea[1].innerHTML=rs.username;
            CloudSetting.infoArea[2].innerHTML='CloudID:'+rs.CloudID;
            CloudSetting.infoArea[3].innerHTML='性别:'+rs.sex;
            CloudSetting.infoArea[4].innerHTML='邮箱:'+rs.email;
            CloudSetting.infoArea[5].innerHTML='手机:'+rs.phone;
            CloudSetting.infoArea[6].innerHTML='生日:'+rs.birthday;
            CloudSetting.infoArea[7].innerHTML='注册时间:'+rs.time;
            CloudSetting.SafeArea[1].innerHTML='最近登录时间：'+rs.login_time+'<span timeago="'+rs.login_time+'"></span>';
            $.Time.friendly(CloudSetting.SafeArea[1].getElementsByTagName('span')[0]);
            CloudSetting.SafeArea[3].innerHTML='当前安全邮箱:'+rs.email+'<button onclick="CloudSetting.ChangeSafe(1,this)">[修改]</button>';
            CloudSetting.SafeArea[4].innerHTML='当前密保手机号:'+rs.phone+'<button onclick="CloudSetting.ChangeSafe(2,this)">[修改]</button>';
            CloudSetting.email=rs.email;
        }
    });
};
CloudSetting.ChangeSafe=function (n,btn) {
    if(n===1){//修改安全邮箱
        CloudSetting.ChangeSafe.Sub=function (a) {
            var code=$("#CloudSettingCode")[0].value;
            if(!code){
                $.Toast('请输入授权码');
                return false;
            }
            CloudSetting.State.className='sf-icon-cog sf-spin';
            CloudMain.Ajax({
                url:'/service/user/ChangeSafeEmail',
                data: {
                    ctype:2,
                    code:code
                },
                success: function(rs) {
                    if(rs[0].state===1){
                        $.Toast('安全邮箱已修改');
                        CloudSetting.email=rs[0].email;
                        CloudSetting.SafeArea[3].innerHTML='当前安全邮箱:'+rs[0].email+'<button onclick="CloudSetting.ChangeSafe(1,this)">[修改]</button>';
                        $.Window.Close(a);
                    }else {
                        $.Toast('授权码错误或失效');
                    }
                    CloudSetting.State.className='sf-icon-cog';
                }
            });
        };
        CloudSetting.ChangeSafe.UpdateEmail=function (a) {
            if(!c.value.length){
                $.Toast('请输入密码');
                return false;
            }else if(!d.value.length){
                $.Toast('请输入新的安全邮箱');
                return false;
            }
            if(d.value===CloudSetting.email){
                $.Toast('新的安全邮箱不可以和当前的一样！');
                return false;
            }
            CloudSetting.State.className='sf-icon-cog sf-spin';
            var button=e.getElementsByTagName('button')[1];
            button.disabled=true;
            button.innerHTML='正在处理';
            CloudMain.Ajax({
                url:'/service/user/ChangeSafeEmail',
                data: {
                    ctype:1,
                    pass: c.value,
                    email: d.value
                },
                success: function(rs) {
                    if(rs[0].state===1){
                        $.Toast('认证邮件已发送，授权码10分钟有效');
                        $.Confirm({
                            id: 'CloudSettingConfirm',
                            node: CloudSetting.Main,
                            title: '修改安全邮箱',
                            notic: '输入授权码',
                            confirm_input: 'CloudSettingCode',
                            submit_func:CloudSetting.ChangeSafe.Sub
                        });
                    }else {
                        $.Toast('密码错误');
                        c.value='';
                    }
                    button.disabled=false;
                    button.innerHTML='确认';
                    CloudSetting.State.className='sf-icon-cog';
                }
            });
        };
        var a=$.Confirm({
            id: 'CloudSettingConfirm',
            node: CloudSetting.Main,
            title: '修改安全邮箱',
            notic: '我们需要以下信息',
            submit_func:CloudSetting.ChangeSafe.UpdateEmail
        });
        var e=a;
        a=a.getElementsByClassName('SlimfConfirmNote')[0];
        var b=$.CreateElement({
            tag:"p",
            html:'当前密码：',
            node:a
        });
        var c=$.CreateElement({
            tag:"input",
            attr:{"type":"password"},
            node:b
        });
        b=$.CreateElement({
            tag:"p",
            html:'新的邮箱：',
            node:a
        });
        var d=$.CreateElement({
            tag:"input",
            attr:{"type":"text"},
            node:b
        });
    }else if(n===2){//修改密保手机
        $.Toast('暂不支持')
    }
    else if(n===3){
        btn.disabled=true;
        var password=$(".CloudSettingSafe input");
        if (password[0].value === ''||password[0].value === '*****') {
            btn.disabled=false;
            $.Toast('请输入当前密码');
            return false;
        }
        else if (password[1].value === ''||password[1].value === '*****') {
            btn.disabled=false;
            $.Toast('请输入新密码');
            return false;
        }
        CloudSetting.State.className='sf-icon-cog sf-spin';
        CloudMain.Ajax({
            url:'/service/user/ChangePass',
            data: {
                oldpass: password[0].value,
                newpass: password[1].value
            },
            success: function(rs) {
                CloudSetting.State.className='sf-icon-cog';
                if(rs.indexOf("success") > 0){
                    $.Toast('修改成功');
                }else{
                    $.Toast('修改失败');
                }
                btn.disabled = false;
                password[0].value=password[1].value='*****';
            }
        });
    }
};
CloudSetting.Init=function () {
    CloudSetting.Bind();
    CloudSetting.Load();
}();