<!doctype html>
<?php  ini_set("error_reporting","E_ALL & ~E_NOTICE");?>
<html>
<head>
    <meta charset="utf-8">
    <title>Cloud-Beta</title>
    <link href="public/css/Slimf.css" rel="stylesheet" type="text/css">
    <link href="public/css/SlimfEditor.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudChat.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudDict.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudDisk.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudGallery.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudIndex.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudMain.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudMusic.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudNote.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudPassBook.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudSetting.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudShare.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudWeather.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudMainWindow.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudDoment.css" rel="stylesheet" type="text/css">
    <link href="public/css/CloudVideo.css" rel="stylesheet" type="text/css">
    <link href="public/test/test.css" rel="stylesheet" type="text/css">
    <link href="public/img/Cloud.ico" rel="shortcut icon" >
</head>
<body oncontextmenu=return(false)>
    <div class="CloudFliter" id="Cloud"></div>
    <ul class="CloudTestModelContainer">
    </ul>
    <div class="CloudTestPanel">
        <p>服务器：<?php echo gethostbyname($_SERVER['SERVER_NAME'])?></p>
        <p>已登录：</p>
        <p>Slimf:</p>
        <p>SlimfEditor:</p>
        <button>邮件模板</button>
    </div>
    <div class="CloudTestRight">
        <div class="CloudTestCode">
            <textarea spellcheck="false"></textarea>
            <button>运行</button>
        </div>
        <div class="CloudTestConsole">
            <button>清空</button>
            <div>
            </div>
        </div>
    </div>
    <p class="version" id="CloudVersion">Beta</p>
    <input type="file" webkitdirectory hidden>
</body>
<script src="public/js/Slimf.js" type="text/javascript"></script>
<script src="public/js/SlimfEditor.js" type="text/javascript"></script>
<script src="public/js/CloudClient.js" type="text/javascript"></script>
<script src="public/test/test.js" type="text/javascript"></script>
<script>
    CloudMain.username="<?php echo $_SESSION['user']?>";
    CloudMain.socketUrl="<?php echo  'ws://'.gethostbyname(exec($_SERVER['SERVER_NAME'])).':9090'?>";
</script>
<script test>

</script>
</html>