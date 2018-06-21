<?php
/*音乐应用控制器*/
include "ServerController.php";

class MusicController
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
        $this->upload=$this->root."/upload/". $this->userid . "/user_music/";
        $this->uploadSql="upload/". $this->userid . "/user_music/";
    }
    public function MatchMusic($name,$api){
        $return=[];
        $key=explode('-',$name);
        $result=$api->search($name,'10', 0, 1);
        $result=json_decode($result,true)['result']['songs'];
        for($i=0;$i<count($result);$i++) {
            if ($result[$i]['name'] == $key[1] && $result[$i]['ar'][0]['name'] == $key[0]) {
                array_push($return, $result[$i]);
            }
        }
        return $return;
    }
    public function SearchMusic()
    {
        require dirname(__FILE__) . '/MusicControllerAPI.php';
        $api = new MusicControllerAPI();
        $keyword = $_POST['data'];
        $Searchtype = $_POST['searchtype'];
        $page = $_POST['pagenum'];
        $length = 50;
        if (empty($page)) {
            $page = 1;
        }
        $page = $length * ($page - 1);
        if (empty($Searchtype)) {
            $Searchtype = 1;
        }
        echo $api->search($keyword, $length, $page, $Searchtype);
    }
    public function SaveMusic()
    {
        $array = [];
        $song_id = $_POST["song_id"];
        $music_cover = $_POST["music_cover"];
        $music_name = $_POST["music_name"];
        $mv_id = $_POST["mv_id"];
        $music_album = $_POST["music_album"];
        $songtime = $_POST["songtime"];
        $list_id = $_POST["list_id"];
        $like = $_POST["like"];
        $id = createGuid();
        $sql = "select * from user_music where userid='$this->userid' and song_id='$song_id'";
        $result1 = $this->db->query($sql);
        $num = mysqli_num_rows($result1);
        if ($num) {
            $array[] = ["state" => '2'];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
        $sql_insert = "insert user_music (userid,music_name,music_cover,music_album,music_like,music_time,music_list,music_id,mv_id,song_id) values('$this->userid','$music_name','$music_cover','$music_album','$like','$songtime','$list_id','$id','$mv_id','$song_id')";
        $result = $this->db->query($sql_insert);
        if ($result) {
            $array[] = ["state" => '1', "music_name" => $music_name, "music_cover" => $music_cover, "music_album" => $music_album, "music_like" => $like, "music_time" => $songtime, "music_list" => $list_id, "music_id" => $id, "mv_id" => $mv_id, "song_id" => $song_id];
        } else {
            $array[] = ["state" => '0'];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetMusic()
    {
        $array = [];
        $sql = "select * from user_music where userid='$this->userid' order by music_addtime";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $array[] = [
                "music_name" => $row['music_name'],
                "music_cover" => $row['music_cover'],
                "music_album" => $row['music_album'],
                "music_url" => $row['music_url'],
                "music_like" => $row['music_like'],
                "music_time" => $row['music_time'],
                "music_list" => $row['music_list'],
                "music_id" => $row['music_id'],
                "mv_id" => $row['mv_id'],
                "song_id" => $row['song_id']];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetMusicList()
    {
        $array = [];
        $sql = "select * from user_music_list where userid='$this->userid' order by music_list_time";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $id=$row['music_list_id'];
            $sql = "select music_cover from user_music where userid='$this->userid' AND music_list='$id' ORDER BY music_addtime desc limit 1";
            $result1 = $this->db->query($sql);
            while ($row1 = mysqli_fetch_assoc($result1)) {
                $music_cover=$row1['music_cover'];
            }
            $array[] = ["music_list_name" => $row['music_list_name'], "music_list_id" => $row['music_list_id'], "music_list_time" => $row['music_list_time'],"music_list_cover" => $music_cover];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteMusic()
    {
        $array = [];
        $a = $_REQUEST ["music_id"];
        $type=$_REQUEST['type'];
        $sql_del = "delete from user_music where music_id='$a' and userid='$this->userid'";
        $result = $this->db->query($sql_del);
        if($type){
            unlink($this->root.'/'  .iconv("UTF-8", "gb2312", $type));
        }
        if ($result) {
            $array[] = ["state" =>1];
        } else {
            $array[] = ["state" =>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function CollectMusic()
    {

        $id = $_POST["music_id"];
        $like = $_POST["like"];
        $sql_update = "update user_music set music_like='$like' where userid='$this->userid' and music_id='$id';";
        $result = $this->db->query($sql_update);
        if ($result) {
            $array[] = ["state" => "1"];
        } else {
            $array[] = ["state" => "0"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function RenameMList()
    {
        $array = [];
        $id = $_POST["musiclistid"];
        $name = $_POST["musiclistname"];
        $sql_update = "update user_music_list set music_list_name='$name' where userid='$this->userid' and music_list_id='$id';";
        $result = $this->db->query($sql_update);
        if ($result) {
            $array[] = ["state" =>1];
        } else {
            $array[] = ["state" =>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteMList()
    {
        $array = [];
        $a = $_REQUEST ["musiclistid"];
        $sql_del = "delete from user_music_list where music_list_id='$a' and userid='$this->userid'";
        $result = $this->db->query($sql_del);
        if ($result) {
            $sql_del = "delete from user_music where music_list='$a' and userid='$this->userid'";
            $this->db->query($sql_del);
            $array[] = ["state" =>1];
        } else {
            $array[] = ["state" =>-1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function NewMlist()
    {
        $array = [];
        $music_list_name = $_POST["musicListName"];
        $id = createGuid();
        $sql_insert = "insert user_music_list (userid,music_list_name,music_list_id,music_list_time) values('$this->userid','$music_list_name','$id',now())";
        $result = $this->db->query($sql_insert);
        if ($result) {
            $array[] = ["state" => '1', "id" => $id, "time" => today()];
        } else {
            $array[] = ["state" => '0'];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function PlayMusic()
    {
        require dirname(__FILE__) . '/MusicControllerAPI.php';
        $api = new MusicControllerAPI();
        $array = array();
        $type = $_POST['type'];
        $song_id = $_POST['data'];
        if ($type == 1) {
            $a = json_decode($api->mp3url($song_id));
            $b = json_decode($api->lyric($song_id));
            array_push($array, $a);
            array_push($array, $b);
        } else {
            $a = json_decode($api->mv($song_id));
            array_push($array, $a);
        }
        $sql="update user_music set play_count=play_count+1 WHERE userid='$this->userid' and song_id='$song_id'";
        $this->db->query($sql);
        echo json_encode($array);
    }
    public function UploadMusic(){
        require dirname(__FILE__) . '/MusicControllerAPI.php';
        $api = new MusicControllerAPI();
        $return = [];
        for ($i = 0; $i < count($_FILES["files"]['name']); $i++) {
            $id = createGuid();
            $ilename = $_FILES["files"]["name"][$i];
            $file_type = substr(strrchr($ilename, '.'), 1);
            $file_name = $id . '.' . $file_type;
            $key=substr(explode($file_type,$ilename)[0], 0, -1);
            $result=$this->MatchMusic($key,$api);
            $song_id=trim(json_encode($result[0]['id'],JSON_UNESCAPED_UNICODE),'"');
            $cover=trim(json_encode($result[0]['al']['picUrl'],JSON_UNESCAPED_UNICODE),'"');
            $album=trim(json_encode($result[0]['al']['name'],JSON_UNESCAPED_UNICODE),'"');
            $time=trim(json_encode($result[0]['dt'],JSON_UNESCAPED_UNICODE),'"');
            $mv=trim(json_encode($result[0]['mv'],JSON_UNESCAPED_UNICODE),'"');
            $sql_insert = "insert user_music (userid,music_name,music_cover,music_album,music_like,music_time,music_list,music_id,mv_id,song_id,music_url,music_type) values('$this->userid','$key','$cover','$album','0','$time','0','$id','$mv','$song_id','$this->uploadSql$file_name','locale')";
            $result = $this->db->query($sql_insert);
            if ($result) {
                move_uploaded_file($_FILES["files"]["tmp_name"][$i],  $this->upload .$file_name);
                $result = [
                    "upload_state" => "yes",
                    "music_name" => $key,
                    "music_cover" => $cover,
                    "music_album" => $album,
                    "music_url" => "upload/" . $this->userid . "/user_music/".$file_name,
                    "music_like" => 0,
                    "music_time" => $time,
                    "music_list" => 0,
                    "music_id" => $id,
                    "mv_id" => $mv,
                    "song_id" => $song_id
                ];
                array_push($return, $result);
            } else {
                $result = ["upload_state" => "no"];
                array_push($return, $result);
            }
        }
        echo json_encode($return);
        mysqli_close($this->db);
    }
    public function Recommend(){
        require dirname(__FILE__) . '/MusicControllerAPI.php';
        $api = new MusicControllerAPI();
        $key=[];
        $return=[];
        reset ($a);
        $sql="select music_name from user_music where userid='$this->userid' ORDER BY play_count desc limit 0,5";
        $result=$this->db->query($sql);
        while($row=mysqli_fetch_assoc($result)){
            $key[explode('-',$row['music_name'])[0]]=explode('-',$row['music_name'])[0];
        }
        foreach ($key as $a => $value){
            $array=json_decode(explode(',"songCount"',explode('"songs":',$api->search($key[$a], 6, 0, 1))[1])[0]);
            foreach ($array as $b=> $b){
                array_push($return,$array[$b]);
            }
        }
        echo json_encode($return);
        mysqli_close($this->db);
    }
}