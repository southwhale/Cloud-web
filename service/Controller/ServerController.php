<?php
mb_internal_encoding("UTF-8");
$conf=[
    "HOST"=>"127.0.0.1",
    "PORT"=>"3306",
    "DATABASE"=>"cloud",
    "USERNAME"=>"root",
    "PASSWORD"=>"7758258",
    "ADDRESS"=>"D:\laragon\www\Cloud"
];
class ServerController
{
    public function __construct($conf)
    {
        global $allow;
        $GLOBALS['db'] = new mysqli($conf['HOST'], $conf['USERNAME'], $conf['PASSWORD'], $conf['DATABASE']);
        $GLOBALS['root'] =$conf['ADDRESS'];
        $GLOBALS['db']->query("set names 'utf8'");
        $GLOBALS['userid']=$_SESSION["userid"];
        $GLOBALS['username']= $_SESSION['user'];
        $userid = $_SESSION["userid"];
        if ($allow!=1) {
            $sql = "select login_id from user where userid='$userid'";
            $result = $GLOBALS['db']->query($sql);
            $num1 = mysqli_num_rows($result);
            if ($num1) {
                while ($num1 = mysqli_fetch_assoc($result)) {
                    $login_id = $num1['login_id'];
                }
                if ($login_id != $_SESSION["ss_id"]) {
                    Header("http/1.0 401 Forbidden");
                    exit();
                }
            } else {
                Header("http/1.0 401 Forbidden");
                exit();
            }
        }
    }
}
new ServerController($conf);
function createRandomStr($length){
    $str = array_merge(range(0,9),range('a','z'));
    shuffle($str);
    $str = implode('',array_slice($str,0,$length));
    return $str;
}
function createRandomnum($length) {
    return rand(pow(10,($length-1)), pow(10,$length)-1);
}
function createGuid(){
    mt_srand((double)microtime()*10000);
    $charid = strtoupper(md5(uniqid(rand(), true)));
    $hyphen = chr(45);
    $uuid =substr($charid, 0, 8).$hyphen
        .substr($charid, 8, 4).$hyphen
        .substr($charid,12, 4).$hyphen
        .substr($charid,16, 4).$hyphen
        .substr($charid,20,12);
    return $uuid;
}
function today(){
    date_default_timezone_set ("Asia/Chongqing");
    $a=date("Y");
    $b=date("m");
    $c=date("d");
    $d=date("G");
    $e=date("i");
    $f=date("s");
    return $a.'-'.$b.'-'.$c.' '.$d.':'.$e.':'.$f;
}
function createThumb($src,$sx,$sy,$save){
    $imgage = getimagesize($src); //得到原始大图片
    switch ($imgage[2]) { // 图像类型判断
        case 1:
            $im = imagecreatefromgif($src);
            break;
        case 2:
            $im = imagecreatefromjpeg($src);
            break;
        case 3:
            $im = imagecreatefrompng($src);
            break;
    }
    $fx = imagesx($im); // 获取宽度
    $fy = imagesy($im); // 获取高度
    $small = imagecreatetruecolor($sx,$sy);
    imagecopyresampled($small,$im,0,0,0,0,$sx,$sy,$fx,$fy);
    imagejpeg($small,$save);
    imagedestroy($im);
    imagedestroy($small);
}
function getadder(){
    return 'http://'.$_SERVER['SERVER_NAME'].':'.$_SERVER["SERVER_PORT"];
}
function removeDir($dirName){
    if(! is_dir($dirName))
    {
        return false;
    }
    $handle = @opendir($dirName);
    while(($file = @readdir($handle)) !== false)
    {
        if($file != '.' && $file != '..')
        {
            $dir = $dirName . '/' . $file;
            is_dir($dir) ? removeDir($dir) : @unlink($dir);
        }
    }
    closedir($handle);
    return rmdir($dirName) ;
}
function characet($data){
    if( !empty($data) ){
        $fileType = mb_detect_encoding($data , array('UTF-8','GBK','LATIN1','BIG5')) ;
        if( $fileType != 'UTF-8'){
            $data = mb_convert_encoding($data ,'utf-8' , $fileType);
        }
    }
    return $data;
}
function download($path_name, $save_name){
    ob_end_clean();
    $hfile = fopen($path_name, "rb") or die("Can not find file: $path_name\n");
    Header("Content-type: application/octet-stream");
    Header("Content-Transfer-Encoding: binary");
    Header("Accept-Ranges: bytes");
    Header("Content-Length: ".filesize($path_name));
    Header("Content-Disposition: attachment; filename=\"$save_name\"");
    while (!feof($hfile)) {
        echo fread($hfile, 32768);
    }
    fclose($hfile);
}
function UrlRequest($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}
function request_post($url = '', $post_data = array()) {
    if (empty($url) || empty($post_data)) {
        return false;
    }
    $o = "";
    foreach ( $post_data as $k => $v )
    {
        $o.= "$k=" . urlencode( $v ). "&" ;
    }
    $post_data = substr($o,0,-1);
    $postUrl = $url;
    $curlPost = $post_data;
    $ch = curl_init();//初始化curl
    curl_setopt($ch, CURLOPT_URL,$postUrl);//抓取指定网页
    curl_setopt($ch, CURLOPT_HEADER, 0);//设置header
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
    curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
    curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);
    $data = curl_exec($ch);//运行curl
    curl_close($ch);
    return $data;
}
function sendEmail($address,$subject,$content){
    include $GLOBALS['root'].'/service/mailer/class.phpmailer.php';
    include $GLOBALS['root'].'/service/mailer/class.smtp.php';
    date_default_timezone_set('PRC');
    $mail = new PHPMailer();
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->SMTPAuth=true;
    $mail->Host = 'smtp.126.com';
    $mail->Port = 25;
    $mail->Hostname = 'localhost';
    $mail->CharSet = 'UTF-8';
    $mail->FromName = 'CloudWeb';
    $mail->Username ='cloud_web@126.com';
    $mail->Password = 'zjh1998zjh';
    $mail->From = 'cloud_web@126.com';
    $mail->isHTML(true);
    $mail->addAddress($address,$address);
    $mail->Subject = $subject;
    $mail->Body = $content;
    $status = $mail->send();
    if($status) {
        return 1;
    }
};
?>