<?php
/*微聊应用控制器*/
include "ServerController.php";

class ChatController
{
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
    public function GetfriendList()
    {
        $array = [];
        $sql = "select * from user_friend_list where userid='$this->userid'";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $id = $row['friend_list_id'];
            $sql2 = "select * from user_friend where friend_list_id='$id' and userid='$this->userid' and friend_type='friend'";
            $count = mysqli_num_rows($this->db->query($sql2));
            $array[] = [
                "list_id" => $row['friend_list_id'],
                "list_name" => $row['list_name'],
                "count" => $count
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function Getfriends()
    {
        $return = [];
        $sql = "select A.*,B.* from user_friend as A,user as B where EXISTS (select A.* from user_friend where A.f_userid=B.userid ) AND A.userid='$this->userid' AND A.friend_type='friend' AND friend_state!='0' GROUP BY A.f_userid";
        $result1 = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result1)) {
            $array = [
                "friend_id" => $row['friend_id'],
                "type" => 'friend',
                "info" => $row['underwrite'],
                "userid" => $row['f_userid'],
                "list_id" => $row['friend_list_id'],
                "username" => $row['username'],
                "nickname" => $row['nick_name'],
                "userhead" => $row['userhead']
            ];
            array_push($return, $array);
        }
        $sql = "select A.*,B.* from user_friend as A,user_group as B where EXISTS (select A.* from user_friend where A.f_userid=B.group_id ) AND (A.userid='$this->userid' AND A.friend_type='group' AND friend_state='1') GROUP BY A.f_userid";
        $result2 = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result2)) {
            $array = [
                "friend_id" => $row['friend_id'],
                "type" => 'group',
                "info" => $row['group_depict'],
                "userid" => $row['group_id'],
                "list_id" => 'group',
                "username" => $row['group_name'],
                "nickname" => $row['nick_name'],
                "userhead" => $row['group_head']
            ];
            array_push($return, $array);
        }
        $sql = "select A.*,B.* from user_friend as A,user_discuss as B where EXISTS (select A.* from user_friend where A.f_userid=B.discuss_id ) AND A.userid='$this->userid' AND A.friend_type='discuss' GROUP BY A.f_userid";
        $result3 = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result3)) {
            $id = $row['discuss_id'];
            $array = [
                "friend_id" => $row['friend_id'],
                "type" => 'discuss',
                "info" => $row['discuss_name'],
                "userid" => $row['discuss_id'],
                "list_id" => 'discuss',
                "username" => $row['discuss_name'],
                "nickname" => "",
                "userhead" => []
            ];
            $sql1 = "select A.*,B.* from user_friend as A , user as B where  EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$id' GROUP BY B.userid limit 0,4";
            $result4 = $this->db->query($sql1);
            while ($row1 = mysqli_fetch_assoc($result4)) {
                $array1 = [
                    "image" => $row1['userhead']
                ];
                array_push($array['userhead'], $array1);
            }
            array_push($return, $array);
        }
        echo json_encode($return);
        mysqli_close($this->db);
    }
    public function ContactInfo()
    {
        $array = [];
        $id = $_POST['id'];
        $ContactType = $_POST['ContactType'];
        if ($ContactType == 'friend') {//好友
            $sql = "select A.*,B.*,C.list_name from user_friend as A,user as B ,user_friend_list as C where EXISTS (select A.* from user_friend where A.f_userid=B.userid AND (A.friend_list_id=C.friend_list_id or A.friend_list_id=1 or A.friend_list_id=0) AND A.f_userid=B.userid) AND B.userid='$id' GROUP BY b.userid";
            $result = $this->db->query($sql);
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row['friend_list_id'] == 1) {
                    $name = '未分组';
                } else if ($row['friend_list_id'] == 0) {
                    $name = '黑名单';
                } else {
                    $name = $row['list_name'];
                }
                $array = [
                    "username" => $row['username'],
                    "usernum" => $row['CloudID'],
                    "userhead" => $row['userhead'],
                    "usersort" => $name,
                    "nickname" => $row['nick_name'],
                    "birthday" => $row['birthday'],
                    "info" => $row['birthday'] . '/' . $row['sex'],
                    "underwrite" => $row['underwrite']
                ];
            }
        } else if ($ContactType == 'group') {//群
            $sql = "select * from user_group where group_id='$id'";//群信息
            $sql1 = "select A.*,B.* from user_friend AS A,user AS B where EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$id' AND A.friend_type='group' GROUP BY B.userid ";//群成员信息
            $result = $this->db->query($sql);
            $result1 = $this->db->query($sql1);
            $count = mysqli_num_rows($result1);
            while ($row = mysqli_fetch_assoc($result)) {
                $array = [
                    "groupname" => $row['group_name'],
                    "groupnum" => $row['group_id'],
                    "group_head" => $row['group_head'],
                    "group_time" => $row['group_time'],
                    "group_depict" => $row['group_depict'],
                    "people" => $count,
                    "member" => [],
                ];
            }
            while ($row = mysqli_fetch_assoc($result1)) {
                $array1 = [
                    "username" => $row['username'],
                    "usernum" => $row['CloudID'],
                    "userhead" => $row['userhead'],
                    "birthday" => $row['birthday'],
                    "info" => $row['birthday'] . '/' . $row['sex'],
                    "underwrite" => $row['underwrite']
                ];
                array_push($array['member'], $array1);
            }
        } else if ($ContactType == 'discuss') {
            $sql = "select * from user_discuss where discuss_id='$id'";//讨论组信息
            $sql1 = "select A.*,B.* from user_friend AS A,user AS B where EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$id' GROUP BY B.userid";//讨论组成员
            $result = $this->db->query($sql);
            $result1 = $this->db->query($sql1);
            $count = mysqli_num_rows($result1);
            while ($row = mysqli_fetch_assoc($result)) {
                $id = $row['discuss_id'];
                $array = [
                    "discussname" => $row['discuss_name'],
                    "createtime" => $row['create_time'],
                    "people" => $count,
                    "userhead" => [],
                    "member" => []
                ];
                $sql2 = "select A.*,B.* from user_friend as A , user as B where  EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid ) AND A.f_userid='$id'GROUP BY B.userid limit 0,4";//讨论组头像
                $result2 = $this->db->query($sql2);
                while ($row2 = mysqli_fetch_assoc($result2)) {
                    $array2 = [
                        "image" => $row2['userhead']
                    ];
                    array_push($array['userhead'], $array2);
                }
            }
            while ($row = mysqli_fetch_assoc($result1)) {
                $array3 = [
                    "username" => $row['username'],
                    "usernum" => $row['CloudID'],
                    "userhead" => $row['userhead'],
                    "birthday" => $row['birthday'],
                    "info" => $row['birthday'] . '/' . $row['sex'],
                    "underwrite" => $row['underwrite']
                ];
                array_push($array['member'], $array3);
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetListSubFriend()
    {
        $array = [];
        $id = $_POST['id'];
        if ($id == -1) {
            $sql = "select A.*,B.*,C.list_name from user_friend AS A,user AS B,user_friend_list as C where EXISTS(SELECT A.* from user_friend where A.f_userid=B.userid and (A.friend_list_id=C.friend_list_id or A.friend_list_id=1 or A.friend_list_id=0)) and A.userid='$this->userid' and A.friend_type='friend' AND friend_state!='0' GROUP by A.f_userid";
        } else {
            $sql = "select A.*,B.*,C.list_name from user_friend AS A,user AS B,user_friend_list as C where EXISTS(SELECT A.* from user_friend where A.f_userid=B.userid and (A.friend_list_id=C.friend_list_id or A.friend_list_id=1 or A.friend_list_id=0)) and A.userid='$this->userid' and A.friend_type='friend' AND A.friend_list_id='$id' AND friend_state!='0' GROUP by A.f_userid";
        }
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['friend_list_id'] == 1) {
                $name = '未分组';
            } else if ($row['friend_list_id'] == 0) {
                $name = '黑名单';
            } else {
                $name = $row['list_name'];
            }
            $array[] = [
                "username" => $row['username'],
                "Cloudid" => $row['CloudID'],
                "userhead" => $row['userhead'],
                "nickname" => $row['nick_name'],
                "loginTime" => $row['login_time'],
                "friend_id" => $row['friend_id'],
                "friend_list_name" => $name,
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetHistoryMessages()
    {
        $array = [];
        $sql = "select A.*,B.* from user_friend AS A,user_message AS B where EXISTS(SELECT * from user_message where sender=A.f_userid or geter=A.f_userid ) AND A.userid='$this->userid' AND A.friend_state='1' GROUP By A.friend_id";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $id = $row['f_userid'];
            $sql1 = "select A.*,B.* from user_message AS A,user AS B where EXISTS (SELECT * FROM user where A.sender=B.userid ) AND A.geter='$id' AND A.msg_type!='friend' AND msg_time > DATE_SUB(now(),INTERVAL 3 DAY) ORDER by msg_time";//获取非好友消息
            $result1 = $this->db->query($sql1);
            $sql2 = "select A.*,B.* from user_message AS A,user AS B where EXISTS (SELECT * FROM user where A.sender=B.userid) AND A.msg_type='friend' AND ((sender='$id' AND geter='$this->userid') OR (sender='$this->userid' AND geter='$id')) AND msg_time > DATE_SUB(now(),INTERVAL 3 DAY) ORDER by msg_time";
            $result2 = $this->db->query($sql2);
            while ($row1 = mysqli_fetch_assoc($result1)) {
                $array[$row1['msg_id']] = [
                    "geter" => $row1['geter'],
                    "sender" => $row1['sender'],
                    "username" => $row1['username'],
                    "userhead" => $row1['userhead'],
                    "content" => $row1['content'],
                    "mtype" => $row1['msg_type'],
                    "state" => $row1['msg_state']
                ];
            }
            while ($row2 = mysqli_fetch_assoc($result2)) {
                $array[$row2['msg_id']] = [
                    "geter" => $row2['geter'],
                    "sender" => $row2['sender'],
                    "username" => $row2['username'],
                    "userhead" => $row2['userhead'],
                    "content" => $row2['content'],
                    "mtype" => $row2['msg_type'],
                    "state" => $row2['msg_state']
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function GetContactRequest()
    {
        $array = [];
        $sql = "select * from user_friend where (userid='$this->userid' or f_userid='$this->userid') AND (friend_state='0' OR friend_state='11')";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $uid = $row['userid'];
            $sql1 = "select * from user WHERE userid='$uid'";
            $result1 = $this->db->query($sql1);
            while ($row1 = mysqli_fetch_assoc($result1)) {
                $array[] = [
                    "infoid" => $row['friend_id'],
                    "to" => '',
                    "type" => $row['friend_type'],
                    "userid" => $row1['userid'],
                    "username" => $row1['username'],
                    "userhead" => $row1['userhead'],
                    "description" => $row['description']
                ];
            }
        }
        $sql = "select * from user_group where userid='$this->userid'";
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $gid = $row['group_id'];
            $sql1 = "select * from user_friend where f_userid='$gid' AND friend_state='0'";
            $result1 = $this->db->query($sql1);
            while ($row1 = mysqli_fetch_assoc($result1)) {
                $uid = $row1['userid'];
                $sql2 = "select * from user WHERE userid='$uid'";
                $result2 = $this->db->query($sql2);
                while ($row2 = mysqli_fetch_assoc($result2)) {
                    $array1 = [
                        "infoid" => $row1['friend_id'],
                        "to" => $row['group_name'],
                        "type" => "group",
                        "userid" => $row2['userid'],
                        "username" => $row2['username'],
                        "userhead" => $row2['userhead'],
                        "description" => $row1['description']
                    ];
                    array_push($array, $array1);
                }
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function ReplyContactRequest()
    {
        $array = [];
        $id = $_POST['uid'];
        $infoid = $_POST['infoid'];
        $ftype = $_POST['ftype'];
        $agree = $_POST['agree'];
        if ($agree == 1) {
            $sql = "update user_friend set friend_state=1 WHERE  friend_id='$infoid' and userid='$id'";
            $result = $this->db->query($sql);
            if ($result&&$ftype=='friend'){
                $uuid = createGuid();
                $sql = "insert into user_friend (userid,f_userid,friend_id,friend_list_id,friend_type,friend_state,description) VALUES ('$this->userid','$id','$uuid','1','$ftype','1','')";
                $this->db->query($sql);
            }
            $array[] = [
                "state" => 1
            ];
        } else {
            $sql = "delete from user_friend where friend_id='$infoid' and userid='$id'";
            $this->db->query($sql);
            $array[] = [
                "state" => 2
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function AddContactList()
    {
        $array = [];
        $name = $_POST['name'];
        $sql = "select * from user_friend_list where userid='$this->userid' and list_name='$name'";
        $result1 = $this->db->query($sql);
        $count = mysqli_num_rows($result1);
        if ($count) {
            $array = [
                "state" => "have"
            ];
        } else {
            $id = createGuid();
            $sql = "insert into user_friend_list (userid,friend_list_id,list_name) VALUES ('$this->userid','$id','$name')";
            $result = $this->db->query($sql);
            if ($result) {
                $array = [
                    "list_id" => $id,
                    "list_name" => $name
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function RenameContactList()
    {
        $id = $_POST['id'];
        $name = $_POST['name'];
        if ($id == '1' || $id == '0') {
            exit();
        } else {
            $sql = "update user_friend_list set list_name='$name' where userid='$this->userid' and friend_list_id='$id'";
            $result = $this->db->query($sql);
            if ($result) {
                $array = [
                    "state" => 1
                ];
            } else {
                $array = [
                    "state" => -1
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteContactList()
    {
        $id = $_POST['id'];
        if ($id == '1' || $id == '0') {
            exit();
        } else {
            $sql = "delete from user_friend_list where userid='$this->userid' and friend_list_id='$id'";
            $sqls = "update user_friend set friend_list_id='1' where userid='$this->userid' and friend_list_id='$id'";
            $this->db->query($sqls);
            $result = $this->db->query($sql);
            if ($result) {
                $array = [
                    "state" => 1
                ];
            } else {
                $array = [
                    "state" => -1
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UpdateContactNickName()
    {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $sql = "update user_friend set nick_name='$name' where userid='$this->userid' and friend_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            $array = ['state' => 1];
        } else {
            $array = ['state' => 0];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UpdateContactList()
    {
        $id = $_POST['id'];
        $fid = $_POST['fid'];
        $sql = "update user_friend set friend_list_id='$id' where userid='$this->userid' and friend_id='$fid'";
        $result = $this->db->query($sql);
        if ($result) {
            $array = ['state' => 1];
        } else {
            $array = ['state' => 0];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function DeleteContact()
    {
        $fid = $_POST['fid'];
        $uid = $_POST['uid'];
        $ftype = $_POST['ftype'];
        if($ftype=='group'){
            $sql="select userid from user_group WHERE userid='$this->userid' and group_id='$uid'";
            $result=$this->db->query($sql);
            while ($row=mysqli_fetch_assoc($result)){
                if($this->userid==$row['userid']){
                    $sql = "DELETE from user_friend where f_userid='$uid' and friend_type='$ftype'";
                    $this->db->query($sql);
                    $sql="DELETE from user_group WHERE userid='$this->userid' and group_id='$uid'";
                    $this->db->query($sql);
                    $sql="DELETE from user_message WHERE geter='$uid' and msg_type='group'";
                    $this->db->query($sql);
                }
            }
        }
        $sql = "DELETE from user_friend where userid='$this->userid' and friend_id='$fid' AND f_userid='$uid' and friend_type='$ftype'";
        $this->db->query($sql);
        $sql = "DELETE from user_friend where userid='$uid' AND f_userid='$this->userid' and friend_type='$ftype'";
        $result = $this->db->query($sql);
        if($ftype=='discuss'){
            $sql="select * from user_friend where f_userid='$uid'";
            if(!mysqli_num_rows($this->db->query($sql))){
                $sql="DELETE from user_discuss WHERE  discuss_id='$uid'";
                $this->db->query($sql);
            };
        }
        if ($result) {
            $array = ['state' => 1];
        } else {
            $array = ['state' => 0];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function UpdateDiscussTopic()
    {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $sql = "update user_discuss set discuss_name='$name' where discuss_id='$id'";
        $result = $this->db->query($sql);
        if ($result) {
            $array = ['state' => 1];
        } else {
            $array = ['state' => 0];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function SendFriendRequest()
    {
        $array = [];
        $id = $_POST['id'];
        $ftype = $_POST['ftype'];
        $info = $_POST['info'];
        if ($id == $this->userid) {
            $array[] = [
                "state" => -2
            ];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
        $sql = "select * from user_friend where userid='$this->userid' and f_userid='$id' and friend_type='$ftype'";
        $count = mysqli_num_rows($this->db->query($sql));
        if ($count) {
            $array[] = [
                "state" => -1
            ];
            echo json_encode($array);
            mysqli_close($this->db);
            exit();
        }
        if ($ftype == 'group') {
            $sql = "select * from user_group where userid='$this->userid' and group_id='$id'";
            $count = mysqli_num_rows($this->db->query($sql));
            if ($count) {
                $array[] = [
                    "state" => -1
                ];
                echo json_encode($array);
                mysqli_close($this->db);
                exit();
            }
        }
        $sql = "insert into user_friend (userid,f_userid,friend_id,friend_list_id,friend_type,friend_state,description) VALUES ('$this->userid','$id',uuid(),'1','$ftype','0','$info')";
        $result = $this->db->query($sql);
        if ($result) {
            $array[] = [
                "state" => 1
            ];
        } else {
            $array[] = [
                "state" => 0
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function SearchContact()
    {
        $array = [];
        $key = $_POST['key'];
        $search = $_POST['search'];
        $size = 50;
        $page = ($_POST["pageNum"] - 1) * $size;
        if ($search == 'friend') {
            $sql = "select * from user where username LIKE '%$key%' OR CloudID ='$key' limit $page,$size";
            $sql1 = "select * from user where username LIKE '%$key%' OR CloudID = '$key'";
        } else {
            $sql = "select * from user_group where group_name LIKE '%$key%' or group_id ='$key' limit $page,$size";
            $sql1 = "select * from user_group where group_name LIKE '%$key%' or group_id ='$key'";
        }
        $count = mysqli_num_rows($this->db->query($sql1));
        $result = $this->db->query($sql);
        while ($row = mysqli_fetch_assoc($result)) {
            if ($search == 'friend') {
                $array[] = [
                    "name" => $row['username'],
                    "info" => $row['sex'] . '$' . $row['birthday'] . '$' . $row['CloudID'] . '$' . $row['underwrite'],
                    "userid" => $row['userid'],
                    "userhead" => $row['userhead'],
                    "count" => $count
                ];
            } else {
                $id = $row['group_id'];
                $sql = "select * from user_friend where f_userid='$id' and friend_type='group' AND friend_state!='0'";
                $people = mysqli_num_rows($this->db->query($sql));
                $array[] = [
                    "name" => $row['group_name'],
                    "info" => $row['group_depict'] . '$' . $row['group_tag'] . '$' . $row['group_id'] . '$' . $people,
                    "userid" => $row['group_id'],
                    "userhead" => $row['group_head'],
                    "count" => $count
                ];
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function SendMessages()
    {
        $send = $_POST['send'];
        $get = $_POST['get'];
        $content = $_POST['content'];
        $mtype = $_POST['mtype'];
        $sql = "insert into user_message (msg_id,sender,geter,content,msg_state,msg_type,msg_time) VALUES(uuid(),'$send','$get','$content','0','$mtype',now())";
        $result = $this->db->query($sql);
        if ($result) {
            echo 1;
        }
        mysqli_close($this->db);
    }
    public function CreateGroup(){
        $name=$_POST['name'];
        $tag=$_POST['tag'];
        $friend_id=createGuid();
        $group_id=createRandomnum(10);
        $sql="insert into user_group (userid,group_id,group_name,group_depict,group_tag,group_head) VALUES ('$this->userid','$group_id','$name','$tag','$tag','upload/group_head/normal_head.png')";
        $result=$this->db->query($sql);
        $sql = "insert into user_friend (userid,f_userid,friend_id,friend_list_id,friend_type,friend_state,description) VALUES ('$this->userid','$group_id','$friend_id','1','group','1','')";
        $result1=$this->db->query($sql);
        if($result&&$result1){
            $array[] = [
                "friend_id" =>$friend_id,
                "type" => 'group',
                "info" => $tag,
                "userid" => $group_id,
                "list_id" => 'group',
                "username" =>$name,
                "nickname" => '',
                "userhead" =>'upload/group_head/normal_head.png'
            ];
        }else{
            $array[]=["state"=>'-1'];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function CreatDiscuss(){
        $discuss_id=createGuid();
        $userList=$_POST['userlist'].','.$this->userid;
        $name=$this->username."创建的多人聊天";
        $sql="insert into user_discuss (userid,discuss_id,discuss_name) VALUES ('$this->userid','$discuss_id','$name')";
        $this->db->query($sql);
        $userList = explode(',', $userList);
        for ($index = 0; $index < count($userList); $index++) {
            $id=createGuid();
            $sql = "insert into user_friend (userid,f_userid,friend_id,friend_list_id,friend_type,friend_state,description) VALUES ('$userList[$index]','$discuss_id','$id','1','discuss','1','')";
            $this->db->query($sql);
            if($userList[$index]==$this->userid){
                $friend_id=$id;
            }
        }
        $array = [
            "friend_id" => $friend_id,
            "type" => 'discuss',
            "info" => $name,
            "userid" => $discuss_id,
            "list_id" => 'discuss',
            "username" => $name,
            "nickname" => "",
            "userhead" => []
        ];
        $sql1 = "select A.*,B.* from user_friend as A , user as B where  EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$discuss_id' GROUP BY B.userid limit 0,4";
        $result4 = $this->db->query($sql1);
        while ($row1 = mysqli_fetch_assoc($result4)) {
            $array1 = [
                "image" => $row1['userhead']
            ];
            array_push($array['userhead'], $array1);
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function InviteFriend(){
        $array=[];
        $userList=$_POST['userlist'];
        $ftype=$_POST['ftype'];
        $to=$_POST['to'];
        $tag=$_POST['tag'];
        $username=$_POST['username'];
        $name=$_POST['name'];
        $info=$username.'邀请你进入'.$tag.'('.$name.')';
        $userList = explode(',', $userList);
        for ($index = 0; $index < count($userList); $index++) {
            $sql = "insert into user_friend (userid,f_userid,friend_id,friend_list_id,friend_type,friend_state,description) VALUES ('$userList[$index]','$to',uuid(),'1','$ftype','11','$info')";
            $r=$this->db->query($sql);
            if($r){
                array_push($array,["state"=>"1"]);
            }
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
    public function HistoryMessages(){
        $array=[];
        $uid=$_POST['uid'];
        $ftype=$_POST['utype'];
        $size=50;
        $page = ($_POST["page"] - 1) * $size;
        if($ftype=='friend'){
            $sql="select * from user_message WHERE (sender='$this->userid' AND  geter='$uid') or (sender='$uid' AND  geter='$this->userid')";
            $sql1="select A.*,B.username from user_message AS A ,user AS B WHERE EXISTS (SELECT username FROM USER WHERE userid=A.sender OR userid=A.geter) AND  (sender='$this->userid' AND  geter='$uid') or (sender='$uid' AND  geter='$this->userid')GROUP BY A.msg_id limit $page,$size;";
        }else{
            $sql="select * from user_message WHERE geter='$uid'";
            $sql1="select A.*,B.username from user_message AS A ,user AS B WHERE EXISTS (SELECT username FROM USER WHERE userid=A.sender) AND geter='$uid' limit $page,$size;";
        }
        $AllCount=mysqli_num_rows($this->db->query($sql));
        $result=$this->db->query($sql1);
        while ($row=mysqli_fetch_assoc($result)){
            $array[]=[
                "username"=>$row['username'],
                "content"=>$row['content'],
                "time"=>$row['msg_time'],
                "count"=>$AllCount
            ];
        }
        echo json_encode($array);
        mysqli_close($this->db);
    }
}