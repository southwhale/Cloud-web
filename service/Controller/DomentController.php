<?php
/*文档应用控制器*/
include "ServerController.php";

class DomentController
{
    public $userid;
    public $root;
    public $db;
    public $upload;
    public $uploadSql;
    public function __construct()
    {
        $this->userid = $GLOBALS['userid'];
        $this->root = $GLOBALS['root'];
        $this->db = $GLOBALS['db'];
        $this->upload=$this->root."/upload/". $this->userid . "/user_doment/";
        $this->uploadSql="upload/". $this->userid . "/user_doment/";
    }
    public function GetDomentByTime(){
        $array=[];
        $sql="select * from user_doment WHERE userid='$this->userid' and modify_time > DATE_SUB(now(),INTERVAL 3 DAY) and doment_type='doment'";
        $result=$this->db->query($sql);
        if($result){
            while ($row=mysqli_fetch_assoc($result)){
                $array[]=[
                    "doment_id"=>$row['doment_id'],
                    "doment_name"=>$row['doment_name'],
                    "doment_secret"=>$row['doment_secret']?1:0,
                    "create_time"=>$row['create_time'],
                    "modify_time"=>$row['modify_time'],
                    "doment_type"=>$row['doment_type'],
                    "share"=>$row['share']
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetDomentByTrash(){
        $array=[];
        $sql="select * from user_doment WHERE userid='$this->userid' and doment_type='trash'";
        $result=$this->db->query($sql);
        if($result){
            while ($row=mysqli_fetch_assoc($result)){
                $array[]=[
                    "doment_id"=>$row['doment_id'],
                    "doment_name"=>$row['doment_name'],
                    "doment_secret"=>$row['doment_secret']?1:0,
                    "create_time"=>$row['create_time'],
                    "modify_time"=>$row['modify_time'],
                    "doment_type"=>$row['doment_type'],
                    "share"=>$row['share']
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetDoment(){
        $array=[];
        $sql="select * from user_doment WHERE userid='$this->userid' and doment_type='doment'";
        $result=$this->db->query($sql);
        if($result){
            while ($row=mysqli_fetch_assoc($result)){
                $array[]=[
                    "doment_id"=>$row['doment_id'],
                    "doment_name"=>$row['doment_name'],
                    "doment_secret"=>$row['doment_secret']?1:0,
                    "create_time"=>$row['create_time'],
                    "modify_time"=>$row['modify_time'],
                    "share"=>$row['share']
               ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function LoadDoment(){
        $id=$_POST['id'];
        $sql="select * from user_doment where userid='$this->userid' AND doment_id='$id'";
        $sql1="update user_doment set modify_time=now() where userid='$this->userid' AND doment_id='$id' and doment_secret!=NULL ";
        $result=$this->db->query($sql);
        if($result){
            $this->db->query($sql1);
            while ($row=mysqli_fetch_assoc($result)){
                $doment_secret=$row['doment_secret']?1:0;
                if($doment_secret){
                    $array=[
                        "secret"=>1,
                        "doment_id"=>$row['doment_id'],
                        "doment_name"=>$row['doment_name']
                    ];
                }else{
                    $array=[
                        "secret"=>-1,
                        "doment_id"=>$row['doment_id'],
                        "doment_name"=>$row['doment_name'],
                        "doment_content"=>stripslashes($row['doment_content'])
                    ];
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UnlockDoment(){
        $array=[
            "state"=>"error"
        ];
        $id=$_POST['id'];
        $pass=$_POST['pass'];
        $sql="select * from user_doment where userid='$this->userid' AND doment_id='$id' AND doment_secret='$pass'";
        $result=$this->db->query($sql);
        if($result){
            while ($row=mysqli_fetch_assoc($result)){
                $array=[
                    "state"=>"unlock",
                    "doment_name"=>$row['doment_name'],
                    "doment_content"=>stripslashes($row['doment_content'])
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function NewDoment(){
        $name=$_POST['name'];
        $pass=$_POST['pass'];
        $id=createGuid();
        if(!empty($pass)){
            $sql="insert into user_doment (userid,doment_id,doment_name,doment_secret) VALUES ('$this->userid','$id','$name','$pass')";
        }else{
            $sql="insert into user_doment (userid,doment_id,doment_name) VALUES ('$this->userid','$id','$name')";
        }
        $result=$this->db->query($sql);
        if($result){
            $array=[
                "state"=>1,
                "doment_id"=>$id
            ];
        }else{
            $array=[
                "state"=>-1
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function RenameDoment(){
        $id=$_POST['id'];
        $name=$_POST['name'];
        $sql="update user_doment set modify_time=now(),doment_name='$name' where userid='$this->userid' AND doment_id='$id' ";
        $result=$this->db->query($sql);
        if($result){
            $array=[
                "state"=>1
            ];
        }else{
            $array=[
                "state"=>-1
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function TrashDoment(){
        $id=$_POST['id'];
        $sql="update user_doment set doment_type='trash' where userid='$this->userid' AND doment_id='$id'";
        $result=$this->db->query($sql);
        if($result){
            $array=[
                "state"=>1
            ];
        }else{
            $array=[
                "state"=>-1
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteDoment(){
        $array = [];
        $ids = $_POST['id'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            if ($ids) {
                $sql="delete from user_doment where userid='$this->userid' AND doment_id='$id[$index]'";
                $fid=$id[$index];
            } else {
                $sql="delete from user_doment where userid='$this->userid' AND doment_id='$id'";
                $fid=$id;
            }
            $result=$this->db->query($sql);
            if($result){
                removeDir($this->upload.'/'.$fid);
                $array=[
                    "state"=>1
                ];
            }else{
                $array=[
                    "state"=>-1
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function RestoreDoment(){
        $id=$_POST['id'];
        $sql="update user_doment set doment_type='doment' where userid='$this->userid' AND doment_id='$id'";
        $result=$this->db->query($sql);
        if($result){
            $array=[
                "state"=>1
            ];
        }else{
            $array=[
                "state"=>-1
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function SaveDoment (){
        $id=$_POST['id'];
        $content=addslashes($_POST['content']);
        $sql="update user_doment set doment_content='$content',modify_time=now() WHERE userid='$this->userid' AND  doment_id='$id'";
        $result=$this->db->query($sql);
        if($result){
            $array=[
                "state"=>1
            ];
        }else{
            $array=[
                "sql"=>$sql,
                "state"=>-1
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UploadImage(){
        $doment_id=$_REQUEST['doment_id'];
        $return = [];
        if (is_dir($this->upload . $doment_id)) {}else {
            mkdir($this->upload . '/' . $doment_id);
        }
        for($i=0;$i<count($_FILES["files"]['name']);$i++) {
            $photofile = $_FILES["files"]["name"][$i];
            $file_type=substr(strrchr($photofile, '.'), 1);
            $id=createRandomnum(10);
            $photofile=$id.'.'.$file_type;
            $result=move_uploaded_file($_FILES["files"]["tmp_name"][$i], $this->upload.'/'.$doment_id.'/'.$photofile);
            if ($result){
                $result = ["state"=>"success","url"=>$this->uploadSql.'/'.$doment_id.'/'.$photofile];
                array_push($return,$result);
            }
            else{
                $result =["state"=>"fail"];
                array_push($return,$result);
            }
        }
        echo json_encode($return);
    }
 }