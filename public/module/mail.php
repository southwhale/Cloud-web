<?php
$user='测试用户名';
$newcode='测试代码';
$newpass='测试新密码';
$passcode='测试激活码';
include "../../service/Controller/ServerController.php";
echo '
<div style="width: 100%;height: 100%;overflow:auto;padding: 50px">
<h1 style="text-align: center">密码找回邮件</h1>

    <table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户:'.$user.'</b><p>系统已处理了您找回密码的请求，并为您设置了新的密码<br>请使用我们提供的新密码登录并及时修改此密码<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>密码：</span>'.$newpass.'</span></td></tr><tr><th><img draggable="false" src='.getadder().'/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">'.today().'</span></th></tr></tbody></table>

<h1 style="text-align: center">注册邮件</h1>

    <table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户</b><p>欢迎使用Cloud<br>这是您注册时发出的注册激活邮件<br>请复制下列代码前往激活页面激活(<a style="color:#fff" href="'.getadder().'/verify?user='.$user.'">激活页面</a>)<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>激活码：</span>'.$passcode.'</span></td></tr><tr><th valign="middle"><img draggable="false" src='.getadder().'/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">'.today().'</span></th></tr></tbody></table>

<h1 style="text-align: center">修改安全邮箱邮件</h1>

    <table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户:'.$user.'</b><p>这是您修改安全邮箱时发出的认证邮件<br>请将以下代码填写到申请页面（10内分钟有效）<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>授权码：</span>'.$newcode.'</span></td></tr><tr><th><img draggable="false" src='.getadder().'/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">'.today().'</span></th></tr></tbody></table>
</div>';