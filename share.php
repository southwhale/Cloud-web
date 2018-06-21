<?php function server(){echo 'http://'.$_SERVER['SERVER_NAME'].':'.$_SERVER["SERVER_PORT"];}?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cloud-分享</title>
    <link href="<?php server()?>/public/css/CloudShare.css" rel="stylesheet" type="text/css">
    <link href="<?php server()?>/public/css/Slimf.css" rel="stylesheet" type="text/css">
    <link href="<?php server()?>/public/img/Cloud.ico" rel="shortcut icon" >
</head>
<body onresize="CloudIndex.Position()">
    <div class="CloudShareMain" id="<?php echo $_GET['id']?>">
        <div class="CloudShareHead">
            <img draggable="false" class="CloudShareLogo" src="<?php echo 'http://'.$_SERVER['SERVER_NAME'].':'.$_SERVER["SERVER_PORT"]?>/public/img/bar/themes2/disk.png">
            <span class="CloudShareHeadTitle">Cloud-网盘</span>
            <div class="CloudShareHeadUser">
                <a target="_blank" href="<?php server()?>">进入Cloud</a>
                <a target="_blank" href="#">Cloud客户端</a>
                <div class="CloudShareHeadLine"></div>
                <div style="display: none" id="CloudShareLogined">
                    <img draggable="false">
                    <span class="CloudShareHeadUserName"></span>
                    <button id="CloudShareExit">退出</button>
                </div>
                <div id="CloudShareNoLogin">
                    <p>注册</p>
                    <p>登陆</p>
                </div>
            </div>
        </div>
        <div class="CloudShareBody">
            <div class="CloudShareLeft">
                <div class="CloudShareBodyHeader">
                    <div class="CloudShareName">
                        <span class="sf-icon-file"></span><h2></h2>
                    </div>
                    <div class="CloudShareControl">
                        <button class="sf-icon-save"><span>保存</span></button>
                        <button class="sf-icon-download"><span>下载</span></button>
                        <div class="CloudShareQrCode sf-icon-qrcode" tooltip="扫描二维码在手机查看"></div>
                    </div>
                    <div class="CloudShareInfo sf-icon-clock">
                        <span></span>
                        <span style="float: right"></span>
                    </div>
                </div>
                <div class="CloudShareContainer">
                    <div class="CloudShareShowShare">
                        <img draggable="false" class="CloudShareFileIcon">
                        <p class="CloudShareFileSize"></p>
                        <button>在线预览</button>
                    </div>
                </div>
            </div>
            <div class="CloudShareRight">
                <div class="CloudShareUser">
                    <img draggable="false">
                    <span></span>
                </div>
                <p class="CloudShareOther">该用户的其他分享</p>
                <ul class="CloudShareOtherContainer">

                </ul>
            </div>
        </div>
        <div class="CloudShareInvalid">
            您查看的文件已经失效或取消分享了
        </div>
    </div>
    <div class="CloudIndex animated fadeIn" style="display: none">
        <div class="CloudIndexLeft">
            <div class="sf-icon-times" id="CloudIndexClose"></div>
            <div class="CloudIndexHead">
                <h1>欢迎</h1>
                <p>请登录后继续</p>
            </div>
            <div class="CloudIndexForm" style="display: block">
                <div class="CloudIndex-Input">
                    <span class="sf-icon-user"></span>
                    <input id="l-username" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="l-username">用户名/手机号/邮箱/CloudID</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-lock"></span>
                    <input id="l-userpass" type="password" autocomplete='off' spellcheck="false" index>
                    <label for="l-userpass">输入您的密码</label>
                </div>
                <div class="CloudIndex-LineContainer">
                    <label for="remberpass">&nbsp记住我</label>
                    <input type="checkbox" id="remberpass" hidden onclick="CloudIndex.Remember(this)">
                    <a switch>忘记密码？</a>
                </div>
                <div class="CloudIndex-postBut">
                    <button post>登录</button>
                </div>
                <div class="CloudIndex-OtherLogin">
                    <label>其他登录</label>
                    <ul>
                        <li class="sf-icon-wechat" ripple><span>&nbsp&nbsp微信</span></li>
                        <div></div>
                        <li class="sf-icon-qq" ripple><span>&nbsp&nbspQQ</span></li>
                    </ul>
                </div>
                <div class="CloudIndex-Tips">
                    <p>使用邮箱&nbsp<span switch>创建一个新用户</span></p>
                </div>
            </div>
            <div class="CloudIndexForm">
                <div class="CloudIndex-Input">
                    <span class="sf-icon-user"></span>
                    <input id="r-username" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="r-username">用户名</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-envelope"></span>
                    <input id="r-usermail" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="r-usermail">输入您的邮箱</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-lock"></span>
                    <input id="r-userpass" type="password" autocomplete='off' spellcheck="false" index>
                    <label for="r-userpass">设置登录密码</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-keyboard"></span>
                    <input id="r-usercode" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="r-usercode">验证码</label>
                    <img title="点击刷新"  draggable="false">
                </div>
                <div class="CloudIndex-postBut">
                    <button post>创建</button>
                </div>
                <div class="CloudIndex-Tips">
                    <p>已经有账号&nbsp<span switch>前往登录</span></p>
                </div>
            </div>
            <div class="CloudIndexForm">
                <div class="CloudIndex-Input">
                    <span class="sf-icon-user"></span>
                    <input id="f-username" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="f-username">用户名</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-envelope"></span>
                    <input id="f-usermail" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="f-usermail">您的注册邮箱</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-keyboard"></span>
                    <input id="f-usercode" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="f-usercode">验证码</label>
                    <img title="点击刷新"  draggable="false">
                </div>
                <div class="CloudIndex-LineContainer">
                    <p>填写以上信息开始吧</p>
                </div>
                <div class="CloudIndex-postBut">
                    <button post>开始</button>
                </div>
                <div class="CloudIndex-Tips">
                    <p>没有问题了&nbsp<span switch>前往登录</span></p>
                </div>
            </div>
            <div class="CloudIndexForm">
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-envelope"></span>
                    <input id="v-user" type="text" autocomplete='off' spellcheck="false" disabled index>
                    <label for="v-user">用户名</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-lock"></span>
                    <input id="v-usercode" type="password" autocomplete='off' spellcheck="false" index>
                    <label for="v-usercode">您的密码</label>
                </div>
                <div class="CloudIndex-Input" >
                    <span class="sf-icon-keyboard"></span>
                    <input id="v-verifycode" type="text" autocomplete='off' spellcheck="false" index>
                    <label for="v-verifycode">邮箱激活码</label>
                </div>
                <div class="CloudIndex-Tips">
                    <p style="text-align: left">没有收到邮件&nbsp<span id="resendBtn">重新发送</span></p>
                </div>
                <div class="CloudIndex-postBut">
                    <button post>激活</button>
                </div>
                <div class="CloudIndex-Tips">
                    <p>账号激活了&nbsp<span switch>前往登录</span></p>
                </div>
            </div>
        </div>
    </div>
</body>
    <script src="<?php server()?>/public/js/Slimf.js" type="text/javascript"></script>
    <script src="<?php server()?>/public/js/CloudIndex.js" type="text/javascript"></script>
    <script src="<?php server()?>/public/js/CloudClient.js" type="text/javascript"></script>
    <script src="<?php server()?>/public/js/CloudShare.js" type="text/javascript"></script>
</html>