<?php
//便签应用控制器
include "ServerController.php";

class NoteController
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
    public function GetNoteList()
    {
        $notetype = $_POST['NoteType'];
        if ($notetype=='null') {
            $sql = "select * from user_note where userid='$this->userid'";
            $result = $this->db->query($sql);
        } else if($notetype!=='pined') {
            $sql = "select * from user_note where userid='$this->userid' and note_type='$notetype'";
            $result = $this->db->query($sql);
        }else{
            $sql = "select * from user_note where userid='$this->userid' and note_pined='yes'";
            $result = $this->db->query($sql);
        }
        $return = [];
        while ($row = mysqli_fetch_assoc($result)) {
            if($notetype=='null'||$notetype!=='pined') {
                $array = [
                    "note_id" => $row['note_id'],
                    "note_type" => $row['note_type'],
                    "note_content" => $row['note_content'],
                    "create_time" => $row['create_time'],
                    "note_pined" => $row['note_pined'],
                    "note_left" => $row['note_left'],
                    "note_top" => $row['note_top']
                ];
                $return[substr($row['create_time'], 0, 10)][] = $array;
            }else{
                $return[] = [
                    "note_id" => $row['note_id'],
                    "note_type" => $row['note_type'],
                    "note_content" => $row['note_content'],
                    "create_time" => $row['create_time'],
                    "note_pined" => $row['note_pined'],
                    "note_left" => $row['note_left'],
                    "note_top" => $row['note_top']
                ];
            }
        }
        echo json_encode($return);
        mysqli_close($this->db);
        exit();
    }
    public function GetNoteInfo()
    {
        $array = [];
        $id = $_REQUEST["id"];
        $sql = "select * from user_note where userid='$this->userid' and note_id='$id'";
        $result = $this->db->query($sql);
        while ($num = mysqli_fetch_assoc($result)) {
            $array[] = [
                "note_id" => $num['note_id'],
                "note_title" => $num['note_title'],
                "note_content" => $num['note_content'],
                "note_time" => $num['create_time'],
                "note_pined" => $num['note_pined'],
                "note_left" => $num['note_left'],
                "note_top" => $num['note_top']
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function NewNote()
    {
        $array = [];
        $note_type = $_POST["noteType"];
        $note_content = $_POST["noteContent"];
        $id = createGuid();
        $sql_insert = "insert into user_note (userid,note_id,note_type,note_content,note_pined,note_left,note_top) values('$this->userid','$id','$note_type','$note_content','no','0','0')";
        $result = $this->db->query($sql_insert);
        if ($result) {
            $array[] = [
                "state"=>1,
                "note_id" => $id,
                "note_type" => $note_type,
                "note_content" => $note_type,
                "create_time" => '',
                "note_pined" => 'no',
                "note_left" => 0,
                "note_top" => 0
            ];
        } else {
            $array[] = ["state" => -1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
    public function RemoveNote()
    {
        $array = [];

        $note_id = $_REQUEST ["note_id"];
        $sql_del = "delete from user_note where note_id='$note_id' and userid='$this->userid'";
        $result = $this->db->query($sql_del);
        if ($result) {
            $array[] = ["del" => "true"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UpdateNote()
    {
        $array = [];
        $thing_more = $_POST["thing_more"];
        $thing_id = $_POST["thing_id"];
        $sql = "update user_note set note_content='$thing_more' where userid='$this->userid' and note_id ='$thing_id'";
        $result = $this->db->query($sql);
        if ($result) {
            $array[] = ["edit_thing" => "ok"];
        } else {
            $array[] = ["edit_thing" => "error"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function FixedNote()
    {
        $array = [];
        $thing_id = $_POST["thing_id"];
        $top = $_POST["top"];
        $left = $_POST["left"];
        $sql = "select note_pined from user_note where note_id='$thing_id' and userid='$this->userid'";
        $result = $this->db->query($sql);
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $r = $row["note_pined"];
            }
            if ($r == "no") {
                $sql = "update user_note set note_pined='yes', note_top='$top', note_left='$left' where userid='$this->userid' and note_id ='$thing_id';";
                $result3 = $this->db->query($sql);
                $array = array();
                if ($result3) {
                    $array[] = ["pin_thing" => "ok"];

                }
            } else {
                $sql = "update user_note set note_pined='no' where userid='$this->userid' and note_id ='$thing_id'";
                $result = $this->db->query($sql);
                $array = array();
                if ($result) {
                    $array[] = ["pin_thing" => "cancel"];
                }
            }
        } else {
            $array[] = ["pin_thing" => "error"];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function ChangeType(){
        $id=$_POST['id'];
        $state=$_POST['state'];
        $sql = "update user_note set note_type='$state' where userid='$this->userid' and note_id ='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            $array[] = ["state" => 1];
        } else {
            $array[] = ["state" => -1];
        }
        echo json_encode($array);
        mysqli_close($this->db);
        exit();
    }
}