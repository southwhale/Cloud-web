<?php
/*网盘应用控制器*/
include "ServerController.php";

class DiskController
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
        $this->upload=$this->root."/upload/". $this->userid . "/user_disk/";
        $this->uploadSql="upload/". $this->userid . "/user_disk/";
    }
    public function TrashMange($type, $id)
    {
        $sql = "select * from user_disk where userid='$this->userid' and parent_id='$id' AND disk_type!='trash'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row['parent_id'] == $id) {
                    $a = $row['disk_id'];
                    if ($type == 'delete') {
                        $sql3 = "delete from user_disk  where userid='$this->userid' and disk_id='$a'";
                        if (!empty($row['disk_main'])) {
                            unlink($this->upload . $row['disk_realname']);
                        }
                        if (!empty($row['disk_share'])) {
                            $sql = "delete from user_share where userid='$this->userid' and resource_id='$a'";
                            $this->db->query($sql);
                        }
                    } else if ($type == 'trash') {
                        $sql3 = "update user_disk set disk_type='' where userid='$this->userid' and disk_id='$a'";
                    } else if ($type == 'restore') {
                        if (!empty($row['disk_main'])) {
                            $sql3 = "update user_disk set disk_type='file' where userid='$this->userid' and disk_id='$a'";
                        } else {
                            $sql3 = "update user_disk set disk_type='folder' where userid='$this->userid' and disk_id='$a'";
                        }
                    }
                    $this->db->query($sql3);
                    $this->TrashMange($type, $row['disk_id']);
                }
            }
        }
    }
    public function GetTreeFile()
    {
        $array = [];
        $id = $_POST['disk_id'];
        $sql = "select * from user_disk where userid='$this->userid' and disk_type='folder' and parent_id='$id'";
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
    public function GetMainFile()
    {
        $array = [];
        $maxSize = 0;
        $disk_size = 0;
        $sql = "SELECT `user`.diskMaxSize,user_disk.disk_size from user,user_disk WHERE `user`.userid='$this->userid' and user_disk.userid='$this->userid'";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $disk_size = $disk_size + $row['disk_size'];
            $maxSize = $row['diskMaxSize'];
        }
        $size = 50;
        $id = $_POST["id"];
        $loadtype = $_POST["loadtype"];
        $page = ($_POST["page"] - 1) * $size;
        $allow = '';
        switch ($loadtype) {
            case 'normal':
                $sql1 = "select * from user_disk where userid = '$this->userid' AND disk_type!='trash' and parent_id ='$id';";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select * from user_disk where userid = '$this->userid' AND disk_type!='trash' and parent_id ='$id' limit $page,$size;";
                $result = $this->db->query($sql);
                while ($row = mysqli_fetch_assoc($result)) {
                    $array[] = [
                        "disk_id" => $row['disk_id'],
                        "parent_id" => $row['parent_id'],
                        "disk_name" => $row['disk_name'],
                        "disk_main" => $row['disk_main'],
                        "disk_realname" => $row['disk_realname'],
                        "disk_type" => $row['disk_type'],
                        "share" => $row['disk_share'],
                        "create_time" => $row['create_time'],
                        "modify_time" => $row['modify_time'],
                        "disk_size" => $row['disk_size'],
                        "all_count" => $count,
                        "use_size" => $disk_size,
                        "max_size" => $maxSize
                    ];
                }
                echo json_encode($array);
                exit();
                break;
            case 'picture':
                $allow = 'apng$|png$|jpg$|jpeg$|bmp$|gif$|APNG$|PNG$|JPG$|JPEG$|BMP$|GIF$';
                break;
            case 'video':
                $allow = 'mp4$|rmvb$|mkv$|MP4$|RMVB$|MKV$';
                break;
            case 'document':
                $allow = 'md$|doc$|docx$|ppt$|ppts$|xls$|xlsx$|pdf$|txt$|MD$|DOC$|DOCX$|PPT$|PPTS$|XLS$|XLSX$|PDF$|TXT$';
                break;
            case 'music':
                $allow = 'm4a$|mp3$|ogg$|flac$|f4a$|wav$|ape$|M4A$|MP3$|OGG$|FLAC$|F4A$|WAV$|APE$';
                break;
            case 'torrent':
                $allow = 'torrent$|TORRENT$';
                break;
            case 'other':
                $allow = 'png$|jpg$|jpeg$|bmp$|gif$|PNG$|JPG$|JPEG$|BMP$|GIF$|mp4$|rmvb$|mkv$|MP4$|RMVB$|MKV$|doc$|docx$|ppt$|ppts$|xls$|xlsx$|pdf$|txt$|DOC$|DOCX$|PPT$|PPTS$|XLS$|XLSX$|PDF$|TXT$|torrent$|TORRENT$|mp3$|ogg$|flac$|f4a$|wav$|ape$|MP3$|OGG$|FLAC$|F4A$|WAV$|APE$';
                $sql1 = "select * from user_disk where userid = '$this->userid' AND disk_type='file' and disk_realname not regexp '$allow';";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select * from user_disk where userid = '$this->userid' AND disk_type='file' and disk_realname not regexp '$allow' order by create_time limit $page,$size;";
                $result = $this->db->query($sql);
                if ($result) {
                    while ($row = mysqli_fetch_assoc($result)) {
                        $array[] = [
                            "disk_id" => $row['disk_id'],
                            "parent_id" => $row['parent_id'],
                            "disk_name" => $row['disk_name'],
                            "disk_main" => $row['disk_main'],
                            "disk_realname" => $row['disk_realname'],
                            "disk_type" => $row['disk_type'],
                            "share" => $row['disk_share'],
                            "create_time" => $row['create_time'],
                            "disk_size" => $row['disk_size'],
                            "modify_time" => $row['modify_time'],
                            "all_count" => $count,
                            "use_size" => $disk_size,
                            "max_size" => $maxSize
                        ];
                    }
                }
                echo json_encode($array);
                exit();
                break;
            case 'trash':
                $sql1 = "select * from user_disk where userid = '$this->userid' AND disk_type='trash'";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select * from user_disk where userid = '$this->userid' AND disk_type='trash' order by create_time limit $page,$size;";
                $result = $this->db->query($sql);
                while ($row = mysqli_fetch_assoc($result)) {
                    $array[] = [
                        "disk_id" => $row['disk_id'],
                        "parent_id" => $row['parent_id'],
                        "disk_name" => $row['disk_name'],
                        "disk_main" => $row['disk_main'],
                        "disk_realname" => $row['disk_realname'],
                        "disk_type" => $row['disk_type'],
                        "share" => $row['disk_share'],
                        "create_time" => $row['create_time'],
                        "modify_time" => $row['modify_time'],
                        "disk_size" => $row['disk_size'],
                        "all_count" => $count,
                        "use_size" => $disk_size,
                        "max_size" => $maxSize
                    ];
                }
                echo json_encode($array);
                exit();
                break;
            case 'search':
                $sql1 = "select * from user_disk where userid='$this->userid'and disk_type!='trash' and  disk_name LIKE '%$id%'";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select * from user_disk where userid='$this->userid' and disk_type!='trash' and disk_name LIKE '%$id%' limit $page,$size;";
                $result = $this->db->query($sql);
                if ($result) {
                    while ($row = mysqli_fetch_assoc($result)) {
                        $array[] = [
                            "disk_id" => $row['disk_id'],
                            "disk_name" => $row['disk_name'],
                            "disk_main" => $row['disk_main'],
                            "disk_realname" => $row['disk_realname'],
                            "disk_type" => $row['disk_type'],
                            "share" => $row['disk_share'],
                            "create_time" => $row['create_time'],
                            "modify_time" => $row['modify_time'],
                            "disk_size" => $row['disk_size'],
                            "all_count" => $count,
                            "use_size" => $disk_size,
                            "max_size" => $maxSize
                        ];
                    }
                }
                break;
            case 'share':
                $sql1 = "select A.*,B.* from user_share as A,user_disk as B where EXISTS (select A.* from user_share where B.disk_id=A.resource_id AND  A.userid='$this->userid'  AND B.userid='$this->userid' and A.share_id=B.disk_share) GROUP BY B.disk_id";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select A.*,B.* from user_share as A,user_disk as B where EXISTS (select A.* from user_share where B.disk_id=A.resource_id AND  A.userid='$this->userid'  AND B.userid='$this->userid' and A.share_id=B.disk_share) GROUP BY B.disk_id limit $page,$size;";
                $result = $this->db->query($sql);
                if ($result) {
                    while ($row = mysqli_fetch_assoc($result)) {
                        $array[] = [
                            "disk_id" => $row['disk_id'],
                            "disk_name" => $row['disk_name'],
                            "disk_type" => $row['disk_type'],
                            "disk_size" => $row['disk_size'],
                            "disk_realname" => $row['disk_realname'],
                            "disk_main" => $row['disk_main'],
                            "share" => $row['disk_share'],
                            "share_time" => $row['share_time'],
                            "create_time" => $row['create_time'],
                            "modify_time" => $row['modify_time'],
                            "all_count" => $count,
                            "use_size" => $disk_size,
                            "max_size" => $maxSize
                        ];
                    }
                }
                echo json_encode($array);
                mysqli_close($this->db);
                exit();
                break;
            case 'disshare':
                $sql1 = "select A.*,B.* from user_share as A,user_disk as B where EXISTS (select A.* from user_share where B.disk_id=A.resource_id AND  A.userid='$this->userid'  AND B.userid='$this->userid' and A.share_id=B.disk_share and B.share_type=0) GROUP BY B.disk_id";
                $count = mysqli_num_rows($this->db->query($sql1));
                $sql = "select A.*,B.* from user_share as A,user_disk as B where EXISTS (select A.* from user_share where B.disk_id=A.resource_id AND  A.userid='$this->userid'  AND B.userid='$this->userid' and A.share_id=B.disk_share and B.share_type=0) GROUP BY B.disk_id limit $page,$size;";
                $result = $this->db->query($sql);
                if ($result) {
                    while ($row = mysqli_fetch_assoc($result)) {
                        $array[] = [
                            "disk_id" => $row['disk_id'],
                            "disk_name" => $row['disk_name'],
                            "disk_type" => $row['disk_type'],
                            "disk_size" => $row['disk_size'],
                            "disk_realname" => $row['disk_realname'],
                            "disk_main" => $row['disk_main'],
                            "share" => $row['disk_share'],
                            "share_time" => $row['share_time'],
                            "create_time" => $row['create_time'],
                            "modify_time" => $row['modify_time'],
                            "all_count" => $count,
                            "use_size" => $disk_size,
                            "max_size" => $maxSize
                        ];
                    }
                }
                echo json_encode($array);
                mysqli_close($this->db);
                exit();
                break;
            default:
                $array = [
                    "DiskState" => 'error'
                ];
                echo json_encode($array);
                exit();
        }
        //获取分类文件
        if ($loadtype != 'other' || $loadtype != 'trash' || $loadtype != 'normal' || $loadtype != 'search' || $loadtype != 'share' || $loadtype != 'disshare') {
            $sql1 = "select * from user_disk where userid = '$this->userid' AND disk_type='file' and disk_realname regexp '$allow'";
            $count = mysqli_num_rows($this->db->query($sql1));
            $sql = "select * from user_disk where userid = '$this->userid' AND disk_type='file' and disk_realname regexp '$allow' order by create_time limit $page,$size";
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $array[] = [
                        "disk_id" => $row['disk_id'],
                        "parent_id" => $row['parent_id'],
                        "disk_name" => $row['disk_name'],
                        "disk_main" => $row['disk_main'],
                        "disk_realname" => $row['disk_realname'],
                        "disk_type" => $row['disk_type'],
                        "share" => $row['disk_share'],
                        "disk_size" => $row['disk_size'],
                        "modify_time" => $row['modify_time'],
                        "all_count" => $count,
                        "use_size" => $disk_size,
                        "max_size" => $maxSize
                    ];
                }
            }
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
    }
    public function UnZipFile()
    {
        $array = [];
        $normalUrl = $this->root . '/upload/' . $this->userid . '/user_disk';
        $url = $this->root . '/' . $_POST['url'];
        $parent_id = $_POST['parent_id'];
        $zip = new ZipArchive();
        $res = $zip->open($url);
        $paths = [];
        if ($res === TRUE) {
            $zip->extractTo($normalUrl);
            $address = $normalUrl . '/' . $zip->getNameIndex(0);
            for ($index = 1; $index < $zip->numFiles; $index++) {
                $url = $normalUrl . '/' . $zip->getNameIndex($index);
                if (!is_file($url)) {
                    $file = preg_replace('/.*\//', '', $url);
                    copy($normalUrl . '/' . $file, $address . '/' . $file);
                    unlink($normalUrl . '/' . $file);
                }
                array_push($paths, $zip->getNameIndex($index));
            }
            $data = [];
            $id = createGuid();
            foreach ($paths as $path) {
                $tmps = explode('/', $path);
                $parent = '';
                foreach ($tmps as $v) {
                    $parentID = $parent == '' ? $parent_id : $data[$parent]['id'];
                    $parent .= $parent == '' ? $v : '/' . $v;
                    if (!isset($data[$parent])) {
                        if (!empty($v)) {
                            if (strpos($v, '.') !== false) {
                                $file_type = substr(strrchr($v, '.'), 1);
                                $file_name = $id . '.' . $file_type;
                                copy($normalUrl . '/' . $parent, $normalUrl . '/' . $file_name);
                                $filesize = filesize($normalUrl . '/' . $file_name);
                                $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share) values('$this->userid','$id','$parentID','$v','$this->uploadSql$file_name','$file_name',$filesize,'file','')";
                            } else {
                                $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share) values('$this->userid','$id','$parentID','$v','','$v','0','folder','')";
                            }
                            $this->db->query($sql_insert);
                            $tmp = array(
                                'id' => $id,
                                'parent_id' => $parentID,
                                'v' => $v,
                                'path' => $parent,
                            );
                            $id = createGuid();
                            $data[$parent] = $tmp;
                        }
                    }
                }
            }
            removeDir($address);
            $zip->close();
            $array = ['state' => '1'];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function NewFolder()
    {
        $array = [];
        $file_name = $_POST["name"];
        $parent_file_id = $_POST["parent_id"];
        $folder_id = createGuid();
        $sql = "select disk_name from user_disk where userid='$this->userid' AND parent_id='$parent_file_id' AND disk_type!='trash' ";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row['disk_name'] == $file_name) {
                    $array[] = ['state' => '1'];
                    echo json_encode($array);
                    mysqli_close($this->db);
                    exit();
                }
            }
            $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share) values('$this->userid','$folder_id','$parent_file_id','$file_name','','$file_name',0,'folder','')";
            $result2 = $this->db->query($sql_insert);
            if ($result2) {
                $sql2 = "select * from user_disk where userid = '$this->userid' and disk_id ='$folder_id'";
                $result3 = $this->db->query($sql2);
                if ($result3) {
                    while ($row = mysqli_fetch_assoc($result3)) {
                        $array[] = [
                            "disk_id" => $row['disk_id'],
                            "parent_id" => $row['parent_id'],
                            "disk_name" => $row['disk_name'],
                            "disk_main" => $row['disk_main'],
                            "disk_realname" => $row['disk_realname'],
                            "disk_type" => $row['disk_type'],
                            "share" => $row['disk_share'],
                            "create_time" => $row['create_time'],
                            "disk_size" => $row['disk_size'],
                        ];
                    }
                }
            }
        } else {
            $array[] = ['state' => '0'];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DiskUpload()
    {
        $return = [];
        for ($i = 0; $i < count($_FILES["files"]["name"]); $i++) {
            $id = createGuid();
            $name = $_FILES["files"]["name"][$i];
            $size = $_FILES["files"]["size"][$i];
            $file_type = substr(strrchr($name, '.'), 1);
            $file_name = $id . '.' . $file_type;
            $p_id = $_POST["udata"][$i];
            $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share) values('$this->userid','$id','$p_id','$name','$this->uploadSql$file_name','$file_name','$size','file','')";
            $result = $this->db->query($sql_insert);
            if ($result) {
                move_uploaded_file($_FILES["files"]["tmp_name"][$i],  $this->upload. iconv("utf-8", "gb2312", $file_name));
                $result = ["upload_state" => "yes", "return_id" => $id];
                array_push($return, $result);
            } else {
                $result = ["upload_state" => "no"];
                array_push($return, $result);
            }
        }
        echo json_encode($return);
        mysqli_close($this->db);
    }
    public function MoveFile()
    {
        $array = [];
        $ids = $_POST['id'];
        $parent_id = $_POST['parent_id'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            $sql = "update user_disk set parent_id='$parent_id',modify_time=now() where userid='$this->userid' and disk_id='$id[$index]'";
            $result = $this->db->query($sql);
            if ($result) {
                $array = ['state' => '1'];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function CopyFile()
    {
        function DeepCopy($_this,$checkid,$new_parent){
            $check_sql="select * from user_disk where parent_id='$checkid' and disk_type!='trash'";
            $result = $_this->db->query($check_sql);
            while ($count = mysqli_fetch_assoc($result)) {
                $disk_type=$count['disk_type'];
                if($disk_type=='folder'){
                    $new_disk_id=createGuid();
                    $old_disk_id=$count['disk_id'];
                    $now_disk_name=$count['disk_name'];
                    $old_disk_time=$count['create_time'];
                    $sql_copy_folder = "insert into user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share,create_time,modify_time) values('$_this->userid','$new_disk_id','$new_parent','$now_disk_name','','$now_disk_name','0','folder','','$old_disk_time',now())";//复制子文件夹
                    $result2 = $_this->db->query($sql_copy_folder);
                    DeepCopy($_this,$old_disk_id,$new_disk_id);
                }else{
                    //复制文件
                    $new_disk_id=createGuid();
                    $now_disk_name=$count['disk_name'];
                    $disk_realname=$count['disk_realname'];
                    $file_type = substr(strrchr($disk_realname, '.'), 1);
                    $file_name = $new_disk_id . '.' . $file_type;
                    $size = $count['disk_size'];
                    $time=$count['create_time'];
                    $sql_copy_file = "insert into user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share,create_time,modify_time) values('$_this->userid','$new_disk_id','$new_parent','$now_disk_name','$_this->uploadSql$file_name','$file_name','$size','file','','$time',now())";
                    $result1 = $_this->db->query($sql_copy_file);
                    if ($result1) {
                        copy( $_this->upload . iconv("UTF-8", "gb2312", $disk_realname),  $_this->upload. iconv("UTF-8", "gb2312", $file_name));
                    }
                }
            }
        }
        $array = [];
        $ids = $_POST['id'];
        $parent_id = $_POST['parent_id'];
        $id = explode(',', $ids);
        $length=count($id);
        for($index=0;$index<$length;$index++){
            $sql = "select * from user_disk where userid='$this->userid' and disk_id='$id[$index]' and disk_type!='trash'";
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $new_id = createGuid();
                    $disk_name = $row['disk_name'].'-复制';
                    $time= $row['create_time'];
                    $type=$row['disk_type'];
                    if($type==='file'){
                        DeepCopy($this,$id[$index],$new_id);
                        $array[]=["state"=>"success","msg"=>"复制成功"];
                    }else{//如果是复制文件夹
                        $new_id = createGuid();
                        $sql_copy = "insert into user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share,create_time,modify_time) values('$this->userid','$new_id','$parent_id','$disk_name','','$disk_name','0','folder','','$time',now())";//在这复制本身；
                        $this->db->query($sql_copy);
                        DeepCopy($this,$id[$index],$new_id);
                        $array[]=["state"=>"success","msg"=>"复制成功"];
                    }
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function RenameFile()
    {
        $array = [];
        $newName = $_POST['name'];
        $id = $_POST['id'];
        $sql = "update user_disk set disk_name='$newName',modify_time=now() where userid='$this->userid' and disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            $array[] = ['newname' => $newName];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
    }
    public function TrashFile()
    {
        $array = [];
        $ids = $_POST['id'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            $sql = "update user_disk set disk_type='trash' where userid='$this->userid' and disk_id='$id[$index]'";
            $result = $this->db->query($sql);
            if ($result) {
                $this->TrashMange('trash', $id[$index]);
                $array = ['state' => '1'];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function ShareFile()
    {
        $array = [];
        $id = $_POST['id'];
        $sql = "select * from user_share where userid='$this->userid' and resource_id='$id'";
        $result = $this->db->query($sql);
        $num = mysqli_num_rows($result);
        if ($num) {
            while ($row = mysqli_fetch_assoc($result)) {
                $content = $row['disk_name'];
                $array[] = [
                    "share" => 'shared',
                    "addres" => $row['share_id'],
                    "password" => $row['share_pass'],
                ];
            }
        } else {
            $share_type = $_POST['shareType'];
            $sql1 = "select * from user_disk where userid='$this->userid' and disk_id='$id'";
            $result = $this->db->query($sql1);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $content = $row['disk_name'];
                }
            }
            $share_id = createRandomStr(10);
            if ($share_type == 1) {//公开
                $sql2 = "insert into user_share (userid,share_id,resource_id,content,browers_count,save_count,share_time,share_type,share_state) VALUES ('$this->userid','$share_id','$id','$content',0,0,now(),'disk','$share_type')";
                $result = $this->db->query($sql2);
                if ($result) {
                    $array[] = [
                        "addres" => $share_id
                    ];
                }
            } else {//加密
                $pass = createRandomStr(5);
                $sql = "insert into user_share (userid,share_id,resource_id,content,browers_count,save_count,share_time,share_type,share_pass,share_state) VALUES ('$this->userid','$share_id','$id','$content',0,0,now(),'disk','$pass','$share_type')";
                $result = $this->db->query($sql);
                if ($result) {
                    $array[] = [
                        "addres" => $share_id,
                        "password" => $pass
                    ];
                }
            }
            $sql = "update user_disk set disk_share='$share_id' where userid='$this->userid' and disk_id='$id'";
            $this->db->query($sql);
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function InfoFile()
    {
        $array = [];
        $id = $_POST['id'];
        $sql = "select * from user_disk where userid='$this->userid' and disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $array[] = [
                    "disk_id" => $row['disk_id'],
                    "disk_name" => $row['disk_name'],
                    "disk_type" => $row['disk_type'],
                    "disk_size" => $row['disk_size'],
                    "disk_share" => $row['disk_share'],
                    "create_time" => $row['create_time'],
                    "modify_time"=>$row['modify_time']
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function AddresFile($id)
    {
        $sql = "select * from user_disk where userid='$this->userid' and disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row['disk_id'] == $id) {
                    $this->AddresFile($row['parent_id']);
                }
                echo '/' . $row['disk_name'];
            }
        }
    }
    public function RestoreFile()
    {
        $array = [];
        $ids = $_POST['id'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            $sql = "select * from  user_disk  where userid='$this->userid' and disk_id='$id[$index]'";
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    if (!empty($row['disk_main'])) {
                        $sql3 = "update user_disk set disk_type='file' where userid='$this->userid' and disk_id='$id[$index]'";
                    } else {
                        $sql3 = "update user_disk set disk_type='folder' where userid='$this->userid' and disk_id='$id[$index]'";
                    }
                    $this->db->query($sql3);
                }
                $this->TrashMange('restore', $id[$index]);
                $array = ['state' => '1'];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteFile()
    {
        $array = [];
        $ids = $_POST['id'];
        $id = explode(',', $ids);
        for ($index = 0; $index < count($id); $index++) {
            if ($ids) {
                $sql = "select * from  user_disk  where userid='$this->userid' and disk_id='$id[$index]'";
                $sql2 = "delete from user_disk  where userid='$this->userid' and disk_id='$id[$index]'";
            } else {
                $sql = "select * from user_disk where userid='$this->userid' and disk_type='trash' or disk_type=' '";
                $sql2 = "delete from user_disk  where userid='$this->userid' and disk_type='trash' or disk_type=' '";
            }
            $result = $this->db->query($sql);
            if ($result) {
                while ($row = mysqli_fetch_assoc($result)) {
                    $a = $row['disk_id'];
                    if (!empty($row['disk_main'])) {
                        unlink( $this->upload. iconv("UTF-8", "gb2312", $row['disk_realname']));
                    }
                    if (!empty($row['disk_share'])) {
                        $sql = "delete from user_share where userid='$this->userid' and resource_id='$a'";
                        $this->db->query($sql);
                    }
                }
                if ($ids) {
                    $this->TrashMange('delete', $id[$index]);
                }
                $result2 = $this->db->query($sql2);
                if ($result2) {
                    $array = ['state' => '1'];
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function CancelShareFile()
    {
        $array = [];
        $id = $_POST['id'];
        $share_id = $_POST['share_id'];
        $sql = "update user_disk set disk_share='' where userid='$this->userid' and disk_share='$share_id' and disk_id='$id'";
        $this->db->query($sql);
        $sql2 = "delete from user_share where userid='$this->userid' and resource_id='$id' and share_id='$share_id'";
        $result = $this->db->query($sql2);
        if ($result) {
            $array[] = [
                "state" => '1'
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function OpenFile()
    {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $sql = "select * from user_disk where userid='$this->userid' and disk_id='$id'";
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
    public function SaveShareFile()
    {
        $array = [];
        $id = $_POST['id'];//资源id
        $parent_id = $_POST['parent_id'];
        $sql = "select * from user_disk where disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $new_id = createGuid();
                $names = $row['disk_name'];
                $name = $row['disk_realname'];
                $size = $row['disk_size'];
                $file_type = substr(strrchr($name, '.'), 1);
                $file_name = $new_id . '.' . $file_type;
                $sql_insert = "insert user_disk (userid,disk_id,parent_id,disk_name,disk_main,disk_realname,disk_size,disk_type,disk_share,create_time) values('$this->userid','$new_id','$parent_id','$names','$this->uploadSql$file_name','$file_name','$size','file','',now())";
                $result1 = $this->db->query($sql_insert);
                if ($result1) {
                    copy($this->root . "/upload/" . $row['userid'] . "/user_disk/" .$name,  $this->upload.$file_name);
                    $array = ['state' => '1'];
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    /*api*/
    public function ApiGetDoment(){
        $array=[];
        $allow = 'doc$|docx$|DOC$|DOCX$';
        $sql = "select * from user_disk where userid = '$this->userid' AND disk_type='file' and disk_realname regexp '$allow' order by create_time";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $array[] = [
                    "doment_id" => $row['disk_id'],
                    "parent_id" => $row['parent_id'],
                    "doment_name" => $row['disk_name'],
                    "doment_main" => $row['disk_main'],
                    "doment_secret"=>0,
                    "create_time"=>$row['create_time'],
                    "share" => $row['disk_share'],
                    "doment_type"=>$row['disk_type'],
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function ApiOpenDoment(){
        $array=[];
        $id = $_POST['id'];
        $sql = "select * from user_disk where userid='$this->userid' and disk_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $content = $this->root . '/' . $row['disk_main'];
                $word = new COM("word.application") or die("Can't start Word!");
                $word->Documents->OPen($content);
                //读取文档内容
                $test = $word->ActiveDocument->content->Text;
                $array=[
                    "doment_content"=>characet($test),
                    "doment_id"=>$id,
                    "doment_name"=>$row['disk_name']
                ];
                $word->Quit();
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
}