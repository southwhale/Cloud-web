<?php
//用户信息控制器
include "ServerController.php";

class UserInfoController
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
    public function ChangePass()
    {
        $array = [];
        $oldpass = $_POST["oldpass"];
        $newpass = $_POST["newpass"];
        $oldpass = hash("sha1", $oldpass);
        $newpass = hash("sha1", $newpass);
        $sql_update = "select userpassword from user where userid='$this->userid';";
        $result = $this->db->query($sql_update);
        while ($num = mysqli_fetch_assoc($result)) {
            $nowpass = $num["userpassword"];
        }
        if ($nowpass == $oldpass) //判断密码是否正确
        {
            $sql_update = "update user set userpassword='$newpass' where userid='$this->userid';";
            $result = $this->db->query($sql_update);
            if ($result) {
                $array[] = ["state" => "success"];//修改失败
            } else {
                $array[] = ["state" => "error1"];//修改失败
            }
        } else {
            $array[] = ["state" => "error2"];//原始密码错误
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function ChangeSafePhone()
    {
        $array = [];
    }
    public function ChangeSafeEmail()
    {
        $array = [];
        $ctype = $_POST['ctype'];
        if ($ctype == 1) {
            $pss = $_POST['pass'];
            $email = $_POST['email'];
            $pss = hash("sha1", $pss);
            $sql = "select * from user where userid='$this->userid';";
            $result = $this->db->query($sql);
            while ($num = mysqli_fetch_assoc($result)) {
                $nowpass = $num["userpassword"];
                $user = $num['username'];
            }
            if ($nowpass == $pss) {
                $array[] = ["state" => 1];
                $newcode = createRandomStr(8);
                setcookie("newCode", $newcode, time() + 600);
                setcookie("email", $email, time() + 600);
                $content = '<table cellpadding="0" align="center" width="600px" style="margin:0 auto;text-align:left;position:relative;font-size:14px;font-family:微软雅黑;line-height:1.5;box-shadow:0 0 4px 0 #8e8e8e;border-collapse:collapse;background:#fff"><tbody><tr bgcolor="#2682fc" style="color:#fff"><td height="250px" style="padding:0 25px;font-size:16px"><b style="font-size:20px">尊敬的用户:' . $user . '</b><p>这是您修改安全邮箱时发出的认证邮件<br>请将以下代码填写到申请页面（10内分钟有效）<br>如非本人操作，请忽略此邮件</p><span style="font-size:20px;color:#d0d0d0"><span>授权码：</span>' . $newcode . '</span></td></tr><tr><th><img draggable="false" src=' . getadder() . '/public/img/logo/logo.png><span style="float:right;line-height:63px;padding-right:10px;color:#949494">' . today() . '</span></th></tr></tbody></table>';
                sendEmail($email, 'Cloud 安全邮箱授权邮件', $content);
            } else {
                $array[] = ["state" => -1];
            }
        } else {
            $code = $_POST['code'];
            $email = $_COOKIE['email'];
            if ($code == $_COOKIE['newCode']) {
                $sql = "update user set email ='$email' where userid='$this->userid'";
                $result = $this->db->query($sql);
                if ($result) {
                    $array[] = ["state" => 1, "email" => $email];
                } else {
                    $array[] = ["state" => -1];
                }
            } else {
                $array[] = ["state" => -1];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetUserInfo()
    {
        $array = [];
        $sql = "select * from user where userid='$this->userid'";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $array[] = ["CloudID" => $row['CloudID'], "userid" => $row['userid'], "username" => $row['username'], "email" => $row['email'], "time" => $row['time'], "userhead" => $row['userhead'], "birthday" => $row['birthday'], "phone" => $row['phone'], "sex" => $row['sex'], "underwrite" => $row['underwrite'], "user_bg" => $row['user_bg'], "login_time" => $row['login_time']];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UpdateUserInfo()
    {
        $array = [];
        $birth = $_POST["birth"];
        $sex = $_POST["sex"];
        $underwrite = $_POST["underwrite"];
        $imgfile = $_FILES["userhead"];
        $phone = $_POST['phone'];
        $name = $imgfile['name'];
        $file_type = substr(strrchr($name, '.'), 1);
        $file_name = $this->userid . '.' . $file_type;
        $tmpfile = $imgfile['tmp_name'];
        if (empty($name)) {
            $sql_update = "update user set birthday='$birth', phone='$phone',sex='$sex', underwrite='$underwrite' where userid='$this->userid';";
        } else {
            $sql = "select * from user where userid='$this->userid'";
            $result1 = $this->db->query($sql);
            if ($result1) {
                while ($row1 = mysqli_fetch_assoc($result1)) {
                    $a = $row1['userhead'];
                    if ($a != "upload/user_head/normal_head.jpg") {
                        unlink($this->root . '/' . $a);
                    }
                }
            }
            move_uploaded_file($tmpfile, $this->root . "../upload/user_head/" . $file_name);
            $file = 'upload/user_head/' . $file_name;
            $sql_update = "update user set birthday='$birth', phone='$phone', sex='$sex', underwrite='$underwrite' ,userhead='$file' where userid='$this->userid';";
        }
        $result = $this->db->query($sql_update);
        if ($result) {
            $array[] = ["state" => 1];
        } else {
            $array[] = ["state" => 0];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function ChageUserBg(){
        $imgfile = $_FILES["userpicture"]['name'];
        $img_file = $_FILES["userpicture"]["tmp_name"];
        if (!empty($imgfile)) {
            $sql = "select * from user where userid='$this->userid'";
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $a = $row['user_bg'];
                    if ($a != "./upload/user_bg/bg1.jpg" || $a != "./upload/user_bg/bg2.jpg" || $a != "./upload/user_bg/bg3.jpg") {
                        unlink($this->root . '/upload/user_bg/' . $a);
                    }
                }
            }
            $file_type = substr(strrchr($imgfile, '.'), 1);
            $file_name = $this->userid . '.' . $file_type;
            $sql_update = "update user set user_bg='upload/user_bg/$file_name' where userid='$this->userid';";
            $this->db->query($sql_update);
            move_uploaded_file($img_file, $this->root . "../upload/user_bg/" . $file_name);
        } else {
            $data = $_POST["data"];
            $sql_update = "update user set user_bg='$data' where userid='$this->userid';";
            $this->db->query($sql_update);
        }
        mysqli_close($this->db);
    }
    public function SendCouple()
    {
        $array = [];
        $report_content = $_POST["report_content"];
        $report_title = $_POST["report_title"];
        $sql = "insert into user_couple (userid,couple_title,couple_content,couple_time) values('$this->userid','$report_title','$report_content',now())";
        $result = $this->db->query($sql);
        if ($result) {
            $array[] = ["report_state" => "ok"];
        } else {
            $array[] = ["report_state" => "error"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
}