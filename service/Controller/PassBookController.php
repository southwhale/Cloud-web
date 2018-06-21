<?php
//密保柜应用控制器
include "ServerController.php";

class PassBookController
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
    public function GetPass(){
        $array=[];
        $sql="select * from user_pass where userid='$this->userid'";
        $result=$this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $array[] = [
                "pb_id" => $row['pb_id'],
                "pb_describe" => $row['pb_describe'],
                "pb_user" => $row['pb_user']
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function CheckUser(){
        $password=hash("sha1", $_POST['password']);
        $sql="select * from user WHERE  userid='$this->userid' and userpassword='$password'";
        $result=$this->db->query($sql);
        $result = mysqli_num_rows($result);
        if($result){
            $array=["state"=>1];
        }else{
            $array=["state"=>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function ShowPass(){
        $id=$_POST['id'];
        $password=hash("sha1", $_POST['password']);
        $sql="select * from user WHERE  userid='$this->userid' and userpassword='$password'";
        $result=$this->db->query($sql);
        $result = mysqli_num_rows($result);
        if($result){
            $sql1="select * from user_pass WHERE  userid='$this->userid' and pb_id='$id'";
            $result1=$this->db->query($sql1);
            while ($row = mysqli_fetch_assoc($result1)) {
                $array = [
                    "state"=>1,
                    "pb_pass" => base64_decode($row['pb_pass'])
                ];
            }
        }else{
            $array=["state"=>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function UpdatePass(){
        $id=$_POST['id'];
        $desp=$_POST['desp'];
        $user=$_POST['user'];
        $pass=$_POST['pass'];
        $password=base64_encode($pass);
        $sql="update user_pass set pb_describe='$desp' , pb_user='$user' , pb_pass='$password' where pb_id='$id' and userid='$this->userid'";
        $result=$this->db->query($sql);
        if($result){
            $array = [
                "state"=>1,
                "desp"=>$desp,
                "user"=>$user,
                "pass"=>$pass
            ];
        }else{
            $array=["state"=>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function DeletePass(){
        $id=$_POST['id'];
        $sql="delete from user_pass where pb_id='$id' and userid='$this->userid'";
        $result=$this->db->query($sql);
        if($result){
            $array = [
                "state"=>1
            ];
        }else{
            $array=["state"=>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function NewPass(){
        $pb_id=createGuid();
        $desp=$_POST['desp'];
        $user=$_POST['user'];
        $pass=$_POST['pass'];
        $pass=base64_encode($pass);
        $sql="insert into user_pass VALUES ('$this->userid','$pb_id','$desp','$user','$pass')";
        $result=$this->db->query($sql);
        if($result){
            $array = [
                "state"=>1,
                "id"=>$pb_id,
                "desp"=>$desp,
                "user"=>$user,
            ];
        }else{
            $array=["state"=>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
}