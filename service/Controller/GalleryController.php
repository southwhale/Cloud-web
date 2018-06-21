<?php
//图库应用控制器
include "ServerController.php";

class GalleryController{
    public $userid;
    public $root;
    public $db;
    public $username;
    public $upload;
    public $uploadTmp;
    public $uploadSql;
    public function getExif($img,$name){
        $exif = exif_read_data($img);
        $time=explode(':',$exif['DateTimeDigitized']);
        $date=$time[0].'-'.$time[1].'-'.$time[2];
        return array (
            '文件名' =>$name,
            '文件大小' => $exif['FileSize'],
            '宽度'=>$exif['COMPUTED']['Width'].'px',
            '高度'=>$exif['COMPUTED']['Height'].'px',
            '拍摄时间'=>$date,
            '器材品牌' => $exif['Make'],
            '光圈值' => $exif['COMPUTED']['ApertureFNumber'],
            '曝光时间'=>$exif['ExposureTime'],
            'ISO速度' => $exif['ISOSpeedRatings'],
            '器材' => $exif['Model'],
            '快门' => $exif['ExposureTime'],
            '焦距' => $exif['FocalLengthIn35mmFilm'],
        );
    }
    public function __construct()
    {
        $this->userid = $GLOBALS['userid'];
        $this->username=$GLOBALS['username'];
        $this->root = $GLOBALS['root'];
        $this->db = $GLOBALS['db'];
        $this->upload=$this->root."/upload/". $this->userid . "/user_gallery/";
        $this->uploadTmp=$this->root."/upload/". $this->userid . "/user_gallery/tmp/";
        $this->uploadSql="upload/". $this->userid . "/user_gallery/";
    }
    public function GetAllPhotos(){
        $sql="select * from user_photo where userid ='$this->userid' order by photo_time desc";
        $result = $this->db->query($sql);
        $return = [];
        while ($num = mysqli_fetch_assoc($result)) {
            $thisArray = ["photo_id" => $num['photo_id'], "photo_name" => $num['photo_name'],"album_id" => $num['album_id'],"photo_url" => $num['photo_url'],"photo_time" => $num['photo_time'],"photo_tmp"=>$num['photo_tmp']];
            $date=$this->getExif($this->root.'/'.$num['photo_url'],'')['拍摄时间'];
            $date=strlen($date)>2?substr($date, 0, 10):substr($num['photo_time'], 0, 10);
            $return[$date][] = $thisArray;
        }
        echo json_encode($return);
        mysqli_close($this->db);
    }
    public function GetAlbum(){
        $array=[];
        $sql = "select A.*,B.* from user_photo_album as A,user_photo as B where EXISTS (select A.* from user_photo_album where B.album_id=A.album_id AND  A.userid='$this->userid'  AND B.userid='$this->userid') GROUP BY A.album_id";
        $result = $this->db->query($sql);
        $sql2 = "select album_id from user_photo_album where album_id not in(select album_id from user_photo where userid='$this->userid')and userid='$this->userid' ";
        $result2 = $this->db->query($sql2);
        while ($num = mysqli_fetch_assoc($result)) {
            $array[] = ["album_id" => $num['album_id'], "album_name" => $num['album_name'],"album_poster" => $num['photo_tmp']];
        }
        if($result2) {
            while ($num2 = mysqli_fetch_assoc($result2)) {
                $d_id = $num2['album_id'];
                $sql_del = "delete from user_photo_album where album_id='$d_id' and userid='$this->userid'";
                $this->db->query($sql_del);
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetAllbumPhoto(){
        $array=[];
        $t_id=$_REQUEST ["id"];
        $sql="select * from user_photo where album_id='$t_id' and userid='$this->userid' ORDER by photo_time desc";
        $result = $this->db->query($sql);
        if($result)
        {
            while ($num = mysqli_fetch_assoc($result)) {
                $array[] = ["album_id" => $num['album_id'], "photo_id" => $num['photo_id'],"photo_url" => $num['photo_url'],"photo_name" => $num['photo_name'],"photo_tmp"=>$num['photo_tmp']];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeletePhoto(){
        $array=[];
        $p_id=$_REQUEST ["id"];
        $p_name=$_REQUEST ["name"];
        $sql_del = "delete from user_photo where photo_id='$p_id' and userid='$this->userid'";
        $result = $this->db->query($sql_del);
        if($result)
        {
            unlink($this->upload.$p_name);
            unlink($this->uploadTmp.$p_name);
            $array[] =["state"=>1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteAlbum(){
        $t_id=$_REQUEST ["id"];
        $sql_del = "delete from user_photo_album where album_id='$t_id' and userid='$this->userid'";
        $result = $this->db->query($sql_del);
        $sql="select * from user_photo where album_id='$t_id' and userid='$this->userid' ORDER by photo_time desc";
        $result2 = $this->db->query($sql);
        if($result&&$result2) {
            while ($num = mysqli_fetch_assoc($result2)) {
                $del_id=$num['photo_id'];
                $sql2 = "delete from user_photo where photo_id='$del_id' and userid='$this->userid'";
                $GLOBALS['db']->query($sql2);
                unlink($this->root.'/'.$num['photo_url']);
                unlink($this->root."/".$num['photo_tmp']);
            }
            $array[] =["state"=>1];
            echo json_encode($array);
            mysqli_close($this->db);
        }
    }
    public function RenameAlbum(){
        $array=[];
        $t_name = $_POST["name"];
        $t_id = $_POST["id"];
        $sql_update = "update user_photo_album set album_name='$t_name' where userid='$this->userid' and album_id='$t_id';";
        $result = $this->db->query($sql_update);
        if($result)
        {
            $array[] =["state"=>1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function NewAlbum(){
        $array=[];
        $name=$_REQUEST ["name"];
        $id=createGuid();
        $sql = "insert into user_photo_album (userid,album_id,album_name) values('$this->userid','$id','$name')";
        $result = $this->db->query($sql);
        if($result)
        {
            $array[] =["Album"=>"$id"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function MoveAlbum(){
        $array=[];
        $album_id=$_POST['album_id'];
        $photo_id=$_POST['photo_id'];
        $sql_update = "update user_photo set album_id='$album_id' where userid='$this->userid' and photo_id='$photo_id';";
        $result = $this->db->query($sql_update);
        if($result)
        {
            $array[] =["state"=>1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GalleryInfo(){
        $array=[];
        $id=$_POST['id'];
        $type=$_POST['type'];
        if($type=='photo'){
            $sql="select * from user_photo where userid='$this->userid' and photo_id='$id'";
            $result=$this->db->query($sql);
            while ($row=mysqli_fetch_assoc($result)){
                $url=$this->root.'/'.$row['photo_url'];
                $name=$row['photo_name'];
            }
            $array =$this->getExif($url,$name);

        }else{
            $sql="select * from user_photo_album WHERE userid='$this->userid' AND album_id='$id'";
            $sql1="select * from user_photo WHERE album_id='$id' and userid='$this->userid'";
            $result=$this->db->query($sql);
            $count=mysqli_num_rows($this->db->query($sql1));
            while ($row=mysqli_fetch_assoc($result)){
                $array=[
                    "相册名"=>$row['album_name'],
                    "创建时间"=>$row['album_time'],
                    "相片数量"=>$count
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function PhotoUpload(){
        $return = [];
        for($i=0;$i<count($_FILES["files"]['name']);$i++) {
            $photofile = $_FILES["files"]["name"][$i];
            $photoname=$photofile;
            $size = $_FILES["files"]["size"][$i];
            $file_type=substr(strrchr($photofile, '.'), 1);
            $id=createGuid();
            $photofile=$id.'.'.$file_type;
            $t_id=$_POST["udata"][$i];
            $sql_insert = "insert user_photo (userid,photo_id,album_id,photo_url,photo_tmp,photo_name,photo_size,photo_time) values('$this->userid','$id','$t_id','$this->uploadSql$photofile','$this->uploadSql/tmp/$photofile','$photoname','$size',now())";
            $result = $this->db->query($sql_insert);
            if ($result){
                move_uploaded_file($_FILES["files"]["tmp_name"][$i], $this->upload.$photofile);
                createThumb($this->upload.$photofile,'180','170',$this->uploadTmp.$photofile);
                $result = ["upload_state"=>"yes","return_id"=>$id];
                array_push($return,$result);
            }
            else{
                $result =["upload_state"=>"no"];
                array_push($return,$result);
            }
        }
        echo json_encode($return);
    }
}