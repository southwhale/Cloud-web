<?php
mb_internal_encoding("UTF-8");
require 'socket/workerman/Autoloader.php';
use Workerman\Connection\AsyncTcpConnection;
use Workerman\Worker;
require 'socket/workerSingle.php';
$clients = []; //保存客户端信息
$conf=[
    "HOST"=>"127.0.0.1",
    "PORT"=>"3306",
    "DATABASE"=>"cloud",
    "USERNAME"=>"root",
    "PASSWORD"=>"7758258",
    "ADDRESS"=>"D:\laragon\www\Cloud"
];
function syncUsers()
{
    global $clients;
    $users = 'online:' . json_encode(array_column($clients, 'uuid')); //准备要广播的数据
    foreach ($clients as $uuid => $client) {
        $client['conn']->send(json_encode($users));
    }
}
$ws_worker = workerSingle::get();
$ws_worker->onMessage = function($connection, $data) use ($ws_worker)
{
    global $clients;
    global $conf;
    $db = new mysqli($conf['HOST'], $conf['USERNAME'], $conf['PASSWORD'], $conf['DATABASE']);
    $clientData = json_decode($data,true);
    switch ($clientData['type'])
    {
        case 'authroize'://用户登录
            $uuid=$clientData['uuid'];
            $connection->uuid = $clientData['uuid'];
            $clients[$uuid] = ['uuid'=>$uuid,'conn'=>$connection];
            echo $uuid.'==>>登陆'. PHP_EOL;
            syncUsers();
            break;
        case 'messages'://用户发送信息
            $result = [
                "type" => "newMessage",
                "form" => $clientData['uuid'],
                "to" => $clientData['touuid'],
                "mtype" => $clientData['mtype'],
                "content" => $clientData['content'],
                "senderHead"=>$clientData['senderHead'],
                "senderName"=>$clientData['senderName']
            ];
            $type=$clientData['mtype'];
            $id=$clientData['touuid'];
            if($type=='friend'){
                foreach ($ws_worker->connections as $connect) {
                    if ($connect->uuid == $clientData['touuid']) {
                        $connect->send(json_encode($result));
                    }
                }
            }
            else if($type=='group'){
                $sql="select A.*,B.* from user_friend AS A,user AS B where EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$id' AND A.friend_type='group' GROUP BY B.userid ";
                $results = $db->query($sql);
                while ($row = mysqli_fetch_assoc($results)) {
                    foreach ($ws_worker->connections as $connect) {
                        if ($connect->uuid == $row['userid']&&$row['userid']!=$clientData['uuid']) {
                            $result['form']=$id;
                            $connect->send(json_encode($result));
                        }
                    }
                }
            }
            else if($type='discuss'){
                $sql="select A.*,B.* from user_friend AS A,user AS B where EXISTS (SELECT A.*FROM user_friend where A.userid=B.userid) AND A.f_userid='$id' GROUP BY B.userid ";
                $results = $db->query($sql);
                while ($row = mysqli_fetch_assoc($results)) {
                    foreach ($ws_worker->connections as $connect) {
                        if ($connect->uuid == $row['userid']&&$row['userid']!=$clientData['uuid']) {
                            $result['form']=$id;
                            $connect->send(json_encode($result));
                        }
                    }
                }
            }
            break;
        case 'newRequest':
            $result=[
                "type"=>"newRequest",
                "to"=>$clientData['uuid']
            ];
            $type=$clientData['NewType'];
            $id=$clientData['uuid'];
            if($type=='friend') {
                foreach ($ws_worker->connections as $connect) {
                    if ($connect->uuid == $clientData['uuid']) {
                        $connect->send(json_encode($result));
                    }
                }
            }else{
                $sql="select * from user_group WHERE group_id='$id'";
                $results = $db->query($sql);
                while ($row = mysqli_fetch_assoc($results)) {
                    foreach ($ws_worker->connections as $connect) {
                        if ($connect->uuid == $row['userid']) {
                            $connect->send(json_encode($result));
                        }
                    }
                }
            }
            break;
        case 'requestSuccess':
            $result=[
                "type"=>"requestSuccess",
                "to"=>$clientData['uuid']
            ];
            foreach ($ws_worker->connections as $connect) {
                if ($connect->uuid == $clientData['uuid']) {
                    $connect->send(json_encode($result));
                }
            }
            break;
    }
};
$ws_worker->onClose = function($connection) //客户端主动关闭
{
    global $clients;
    unset($clients[$connection->uuid]);
    syncUsers();
    echo $connection->uuid.'==>>退出'. PHP_EOL;
};
Worker::runAll();