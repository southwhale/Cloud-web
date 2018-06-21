<?php
//用户控制器
$allow = 1;
include "ServerController.php";

class UserController
{
    public $userid;
    public $root;
    public $db;
    public function __construct()
    {
        $this->userid = $GLOBALS['userid'];
        $this->root = $GLOBALS['root'];
        $this->db = $GLOBALS['db'];
    }
    public function check($root, $userid)
    {
        if (is_dir($root . "/upload/" . $userid)) {
        } else {
            mkdir($root . "./upload/" . $userid);
            mkdir($root . "./upload/" . $userid . "/user_gallery");
            mkdir($root . "./upload/" . $userid . "/user_gallery/tmp");
            mkdir($root . "./upload/" . $userid . "/user_disk");
            mkdir($root . "./upload/" . $userid . "/user_music");
            mkdir($root . "./upload/" . $userid . "/user_doment");
        }
    }
    public function login()
    {
        $array = [];
        $user = $_POST["username"];
        $psw = $_POST["password"];
        $password = hash("sha1", $psw);
        date_default_timezone_set('Asia/Shanghai');
        $sql = "select * from user where (username='$user' or email='$user' or phone ='$user' or CloudID='$user')";
        $res = $this->db->query($sql);
        $num = mysqli_num_rows($res);
        if ($num) {
            $sql2 = "select * from user where (username='$user' or email='$user' or phone ='$user' or CloudID='$user') and state = 'unlock'";
            $result = $this->db->query($sql2);
            $num2 = mysqli_num_rows($result);
            if ($num2) {
                $sql3 = "select * from user where (username='$user' or email='$user' or phone ='$user' or CloudID='$user') and userpassword = '$password'";
                $result2 = $this->db->query($sql3);
                $num3 = mysqli_num_rows($result2);
                if ($num3) {
                    while ($num3 = mysqli_fetch_assoc($result2)) {
                        $_SESSION["userid"] = $num3['userid'];
                        $_SESSION["user"] = $num3['username'];
                        $head = $num3['userhead'];
                        $background=$num3['user_bg'];
                    }
                    $userid=$_SESSION["userid"];
                    $session_id = session_id();
                    $sql = "select login_id from user where userid='$userid'";
                    $result = $this->db->query($sql);
                    $num1 = mysqli_num_rows($result);
                    if ($num1) {
                        while ($num1 = mysqli_fetch_assoc($result)) {
                            if ($num1['login_id'] != $_SESSION["ss_id"]) {
                                $sql = "update user set login_id = '$session_id' , login_time=now() where userid='$userid'";
                                $this->db->query($sql);
                            }
                        }
                    }
                    $_SESSION["ss_id"] = $session_id;
                    $array[] = ["state" => "success","msg"=>"欢迎回来，".$user,"user" => $_SESSION["user"], "head" => $head,"userid"=>$userid,"background"=>$background];//登录成功
                    $this->check($this->root, $userid);
                } else {
                    $array[] = ["state" => "fail","msg"=>"密码错误"];
                }
            } else {
                $sql4 = "select email from user where (username='$user' or email='$user' or phone ='$user' or CloudID='$user')";
                $result3 = $this->db->query($sql4);
                while ($row = mysqli_fetch_assoc($result3)) {
                    $array[] = ["state" => "fail","msg"=>"未激活的用户","email" => $row['email']];
                }
            }
        } else {
            $array[] = ["state" => "fail","msg"=>"该用户不存在"];//没有该用户
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function logout()
    {
        $sata = $_GET['e'];
        session_unset();
        session_destroy();
        if (!empty($sata)) {
            header("Location: ../error");
            exit();
        } else {
            header("Location: ../");
            exit();
        }
    }
    public function register()
    {
        $array = [];
        $user = $_POST["username"];
        $psw = $_POST["password"];
        $email = $_POST["email"];
        $validate = $_POST["validate"];
        $validate = md5($validate);
        if ($validate != $_SESSION["verification"]) {
            $array[] = ["state" => "fail","msg"=>"验证码错误"];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
        $password = hash("sha1", $psw);
        $sql = "select username from user where username = '$user'";
        $result = $this->db->query($sql);
        $num = mysqli_num_rows($result);
        if ($num) {
            $array[] = ["state" => "fail","msg"=>"用户名已被使用"];
        } else {
            $sql = "select email from user where email = '$email'";
            $result = $this->db->query($sql);
            $num2 = mysqli_num_rows($result);
            if ($num2) {
                $array[] = ["state" => "fail","msg"=>"邮箱已被注册"];
            } else {
                $userid = createGuid();
                $passcode = createRandomStr(10);
                $CloudID = createRandomnum(10);
                $sql_insert = "insert into user (userid,CloudID,username,userpassword,email,time,userhead,birthday,sex,user_bg,state,diskMaxSize,pass_code) values('$userid','$CloudID','$user','$password','$email',now(),'upload/user_head/normal_head.jpg','0000-00-00','男','upload/user_bg/bg1.jpg','lock','10737418240','$passcode')";
                $res_insert = $this->db->query($sql_insert);
                if ($res_insert) {
                    $array[] = ["state" => "success","msg"=>"注册成功,激活码已发送至邮箱"];
                    $content = '<table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户</b><p>欢迎使用Cloud<br>这是您注册时发出的注册激活邮件<br>请复制下列代码前往激活页面激活(<a style="color:#fff" href="' . getadder() . '/verify?user=' . $user . '">激活页面</a>)<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>激活码：</span>' . $passcode . '</span></td></tr><tr><th valign="middle"><img draggable="false" src=' . getadder() . '/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">' . today() . '</span></th></tr></tbody></table>';
                    sendEmail($email, 'Cloud 邮箱激活验证邮件', $content);
                } else {
                    $array[] = ["state" => "fail","msg"=>"注册失败"];
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function forget()
    {
        $array = [];
        $user = $_POST['username'];
        $email = $_POST["email"];
        $validate = $_POST["validate"];
        $validate = md5($validate);
        if ($validate != $_SESSION["verification"]) {
            $array[] = ["state" => "fail",'msg'=>"验证码错误"];
        } else {
            $sql = "select username from user where username = '$user'";
            $result = $this->db->query($sql);
            $num2 = mysqli_num_rows($result);
            if ($num2) {
                $sql = "select email from user where username = '$user'";
                $result = $this->db->query($sql);
                while ($num = mysqli_fetch_assoc($result)) {
                    $sql_email = $num["email"];
                    if ($email != $sql_email) {
                        $array[] = ["state" => "fail","msg"=>"邮箱地址不正确"];
                    } else {
                        $newpass = createRandomnum(5);
                        $content = '<table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户:' . $user . '</b><p>系统已处理了您找回密码的请求，并为您设置了新的密码<br>请使用我们提供的新密码登录并及时修改此密码<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>密码：</span>' . $newpass . '</span></td></tr><tr><th><img draggable="false" src=' . getadder() . '/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">' . today() . '</span></th></tr></tbody></table>';
                        sendEmail($email, 'Cloud 邮件找回密码', $content);
                        $newpass = hash("sha1", $newpass);
                        $sql = "update user set userpassword='$newpass' where username='$user'";
                        $result = $this->db->query($sql);
                        $array[] = ["email" => $email,"state"=>"success","msg"=>"重置密码邮件已发至您的邮箱，邮件中包含新的密码，请及时修改密码"];
                    }
                }
            } else {
                $array[] = ["state" => "fail","msg"=>"用户不存在"];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function resend(){
        $user=$_POST['name'];
        $sql="select * from user where username='$user' and state='lock' and pass_code!=''";
        $result=$this->db->query($sql);
        $count=mysqli_num_rows($result);
        if($count){
            while ($num = mysqli_fetch_assoc($result)) {
                $passcode=$num['pass_code'];
                $email=$num['email'];
                $content = '<table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户</b><p>欢迎使用Cloud<br>这是您注册时发出的注册激活邮件<br>请复制下列代码前往激活页面激活(<a style="color:#fff" href="' . getadder() . '/verify?user=' . $user . '">激活页面</a>)<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>激活码：</span>' . $passcode . '</span></td></tr><tr><th valign="middle"><img draggable="false" src=' . getadder() . '/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">' . today() . '</span></th></tr></tbody></table>';
                sendEmail($email, 'Cloud 邮箱激活验证邮件(重发)', $content);
                $array[]=[
                  "state"=>"success",
                  "msg"=>"邮件已重发，请前往".$email.'查收'
                ];
            }
        }else{
            $array[]=[
              "state"=>"fail",
              "msg"=>"用户不存在或已激活"
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function verifyCheck()
    {
        $array = [];
        $pass = $_POST['pass'];
        $name = $_POST['name'];
        $code = $_POST['code'];
        $password = hash("sha1", $pass);
        $userid='';
        $sql3 = "select * from user where username='$name' and userpassword = '$password'";
        $result2 = $this->db->query($sql3);
        $count=mysqli_num_rows($result2);
        if ($count) {
            while ($num3 = mysqli_fetch_assoc($result2)) {
                $userid=$num3['userid'];
            }
        } else {
            $array[] = ["state" => "fail","msg"=>"密码错误"];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
        $sql = "select * from user where userid='$userid' and pass_code = '$code'";
        $result = $this->db->query($sql);
        $num = mysqli_num_rows($result);
        if ($num) {
            $sql1 = "update user set pass_code='',state='unlock' WHERE userid='$userid'";
            $this->db->query($sql1);
            $this->check($this->root, $userid);
            while ($num = mysqli_fetch_assoc($result)) {
                $_SESSION["user"] = $num['username'];
            }
            $_SESSION["userid"] = $userid;
            $session_id = session_id();
            $_SESSION["ss_id"] = $session_id;
            $sql = "update user set login_id = '$session_id', login_time= now() where userid='$userid'";
            $this->db->query($sql);
            $array[] = ["state" => 'sucess',"msg"=>$name.' 账号已激活'];
        } else {
            $array[] = ["state" => "fail","msg"=>"激活码不存在"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function verifyCode()
    {
        ob_clean();
        $str = createRandomStr(5);
        $width = 60;
        $height = 38;
        @ header("Content-Type:image/png");
        $im = imagecreate($width, $height);
        $back = imagecolorallocate($im, 255, 255, 255);
        $pix = imagecolorallocate($im, 255, 255, 255);
        $font = imagecolorallocate($im, 41, 163, 238);
        $red = imagecolorallocate($im,41,163,238);
        imageline($im,1,25,200,1,$red);
        mt_srand();
        for ($i = 0; $i < 1000; $i++) {
            imagesetpixel($im, mt_rand(0, $width), mt_rand(0, $height), $pix);
        }
        imagestring($im, 16, 8, 11, $str, $font);
        imagerectangle($im, -1, -1, $width - 0, $height - 0, $font);
        imagepng($im);
        imagedestroy($im);
        $str = md5($str);
        $_SESSION["verification"] = $str;
    }
}