<?php
$allow=1;
/*词典应用控制器*/
include "ServerController.php";

class DirtController
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
    public function query(){
        $query=$_POST['query'];
        $result=UrlRequest("http://dict.youdao.com/jsonapi?xmlVersion=5.1&client=&q=".$query."&dicts=&keyfrom=&model=&mid=&imei=".createRandomnum(15)."&vendor=&screen=&ssid=&network=5g&abtest=&jsonversion=2");
        echo $result;
    }
    public function Transate(){
        $type=$_POST['type'];
        $to=$_POST['to'];
        $from=$_POST['from'];
        $query=$_POST['query'];
        $data = request_post("http://fanyi.youdao.com/translate?doctype=json&jsonversion=&type=".$type."&keyfrom=&model=&mid=&imei=&vendor=&screen=&ssid=&network=&abtest=", array(
            "i"=>$query,
            "from"=>$from,
            "to"=>$to,
            "client"=>"fanyideskweb",
            "salt"=>"1523947670591",
            "sign"=>"d28da8c6c51a6e12f037e66005ca1d6d",
            "doctype"=>"json",
            "version"=>"2.1",
            "keyfrom"=>"fanyi.web",
            "action"=>"lan-select",
            "typoResult"=>"false"
        ));
        echo trim($data);
    }
}