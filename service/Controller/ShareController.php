<?php
//分享控制器
$allow=1;
include "ServerController.php";

class ShareController{
    public $userid;
    public $root;
    public $db;
    public $username;
    public function __construct()
    {
        $this->userid = $GLOBALS['userid'];
        $this->username=$GLOBALS['username'];
        $this->root = $GLOBALS['root'];
        $this->db = $GLOBALS['db'];
    }
    public function getResource($re_type,$res){
        $array=[];
        if($re_type=='disk'){
            $array[]=[
                "state"=>'normal',
                "res_id"=>$res['disk_id'],
                "res_name"=>$res['disk_name'],
                "res_main"=>$res['disk_main'],
                "res_size"=>$res['disk_size'],
                "res_time"=>$res['create_time']
            ];
        }
        else if($re_type=='music') {
            $array[]=[
                "state"=>'normal',
                "res_id"=>$res['music_id'],
                "res_name"=>$res['music_name'],
                "res_main"=>$res['song_id'],
                "res_size"=>0,
                "res_time"=>$res['music_addtime']
            ];
        }
        echo json_encode($array);
        exit();
    }
    public function GetShareInfo($id){
        $array2=[];
        $sql="select * from user_share where share_id='$id'";
        $result = $this->db->query($sql);
        while ($num = mysqli_fetch_assoc($result)) {
            $array[]=[
                "share_id"=>$num['share_id'],
                "share_state"=>$num['share_state'],
                "resource_id"=>$num['resource_id'],
                "content"=>$num['content'],
                "browers_count"=>$num['browers_count'],
                "save_count"=>$num['save_count'],
                "share_type"=>$num['share_type'],
                "share_time"=>$num['share_time'],
            ];
            $uid=$num['userid'];
        }
        $sql="select * from user WHERE userid='$uid'";
        $result1 = $this->db->query($sql);
        while ($num = mysqli_fetch_assoc($result1)) {
            $array2=[
                "user_head"=>$num['userhead'],
                "user_name"=>$num['username'],
                "userid"=>$num['userid'],
            ];
        }
        if($result&&$result1){
            $sql="update user_share set browers_count=browers_count+1 WHERE share_id='$id'";
            $this->db->query($sql);
        }
        array_push($array,$array2);
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetShareResouce(){
        $id=$_POST['id'];
        $shareID=$_POST['shareID'];
        $resourceType=$_POST['resourceType'];
        $resourcePass=$_POST['resourcePass'];
        if($resourceType=='disk'){
            $re_sql="select * from user_disk where disk_id='$id'";
        }
        else if($resourceType=='music') {
            $re_sql="select * from user_music where music_id='$id'";
        }
        $sql1="select * from user_share where share_id='$shareID'";
        $result = $GLOBALS['db']->query($sql1);
        while ($num = mysqli_fetch_assoc($result)) {
            if($num['share_state']>1){
                $sql1="select * from user_share where share_id='$shareID' and share_pass='$resourcePass'";
                $count = mysqli_num_rows($this->db->query($sql1));
                if($count){
                    $re=$this->db->query($re_sql);
                    while ($num = mysqli_fetch_assoc($re)) {
                        $this->getResource($resourceType,$num);
                    }
                }else{
                    $array[]=[
                        "state"=>"-1"
                    ];
                    echo json_encode($array);
                    mysqli_close($this->db);
                    exit();
                }
            }else{
                $re=$this->db->query($re_sql);
                while ($num = mysqli_fetch_assoc($re)) {
                    $this->getResource($resourceType,$num);
                }
            }
        }
    }
    public function OpenFile()
    {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $sql = "select * from user_disk where disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $content = $this->root . '/' . $row['disk_main'];
                if ($name == 'doc' || $name == 'docx' || $name == 'DOC' || $name == 'DOCX') {
                    $word = new COM("word.application") or die("Can't start Word!");
                    $word->Documents->OPen($content);
                    //读取文档内容
                    $test = $word->ActiveDocument->content->Text;
                    echo characet($test);
                    $word->Quit();

                } else {
                    $myfile = fopen($content, "r") or die("Unable to open file!");
                    echo characet(fread($myfile, filesize($content)));
                }

            }
        }
        mysqli_close($this->db);
    }
    public function SaveFile(){
        $array = [];
        $share_id=$_POST['share_id'];
        $ids = $_POST['id'];
        $parent_id = $_POST['parent_id'];
        $user=$_POST['shareuser'];
        $uid=$_POST['userid'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            $sql = "select * from user_disk where disk_id='$id[$index]' and disk_type!='trash'";
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $new_id = createGuid();
                    $names = $row['disk_name'];
                    $name = $row['disk_realname'];
                    $size = $row['disk_size'];
                    $file_type = substr(strrchr($name, '.'), 1);
                    $file_name = $new_id . '.' . $file_type;
                    $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share,create_time) values('$uid','$new_id','$parent_id','$names','upload/" . $this->userid . "/user_disk/$file_name','$file_name','$size','file','',now())";
                    $result1 = $this->db->query($sql_insert);
                    if ($result1) {
                        $sql="update user_share set save_count=save_count+1 WHERE share_id='$share_id'";
                        $this->db->query($sql);
                        copy($this->root . "/upload/" . $user . "/user_disk/" .$name, $this->root . "/upload/" . $uid . "/user_disk/".$file_name);
                        $array = ['state' => '1'];
                    }
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function OpenDisk(){
        $array = [];
        $id = $_POST['disk_id'];
        $uid=$_POST['userid'];
        $sql = "select * from user_disk where userid='$uid' and disk_type='folder' and parent_id='$id'";
        $result = $this->db->query($sql);
        header('Content-type:text/json');
        while ($row = mysqli_fetch_assoc($result)) {
            $array[] =
                ["disk_id" => $row['disk_id'],
                    "parent_id" => $row['parent_id'],
                    "disk_name" => $row['disk_name'],
                    "disk_type" => $row['disk_type'],
                ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function OtherShare(){
        $array=[];
        $id=$_POST['uid'];
        $share_id=$_POST['share_id'];
        $sql="select * from user_share where userid='$id' and share_id!='$share_id'";
        $result = $this->db->query($sql);
        while ($num = mysqli_fetch_assoc($result)) {
            $array[] = [
                "share_id" => $num['share_id'],
                "content"=>$num['content'],
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
};