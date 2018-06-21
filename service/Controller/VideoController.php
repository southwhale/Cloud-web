<?php
//视频应用控制器
include "ServerController.php";

class VideoController{
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
    public function Recommend(){
        $data=$_POST['data']==0?$_POST['data']:'deviceModel=DUK-AL20';
        echo UrlRequest('http://baobab.kaiyanapp.com/api/v4/tabs/selected?'.$data);
    }
    public function Classify(){
        $data=$_POST['data'];
        $page=$_POST['page'];
        if($page){
            $url='http://baobab.kaiyanapp.com/api/v5/index/tab/category/'.$data.'?'.$page;
        }else{
            $url='http://baobab.kaiyanapp.com/api/v5/index/tab/category/'.$data;
        }
        echo UrlRequest($url);
    }
    public function Comment(){
        $data=$_POST['data'];
        $page=$_POST['page'];
        if($page){
            $url='http://baobab.kaiyanapp.com/api/v2/replies/video?'.$page;
        }else{
            $url='http://baobab.kaiyanapp.com/api/v2/replies/video?videoId='.$data;
        }
        echo UrlRequest($url);
    }
    public function Queries(){
        echo UrlRequest('http://baobab.kaiyanapp.com/api/v3/queries/hot');
    }
    public function Search(){
        $data=$_POST['data'];
        $page=$_POST['page'];
        if($page!=0||$page!='0'){
            $url='http://baobab.kaiyanapp.com/api/v1/search?'.$page;
        }else{
            $url='http://baobab.kaiyanapp.com/api/v1/search?query='.$data;
        }
        echo UrlRequest($url);
    }
    public function SubByTag(){
        $data=$_POST['data'];
        $url='http://baobab.kaiyanapp.com/api/v1/tag/index?id='.$data;
        echo UrlRequest($url);
    }
    public function TagVideo(){
        $data=$_POST['data'];
        $page=$_POST['page'];
        if($page!=0||$page!='0'){
            $url='http://baobab.kaiyanapp.com/api/v1/tag/videos?'.$page;
        }else{
            $url='http://baobab.kaiyanapp.com/api/v1/tag/videos?id='.$data;
        }
        echo UrlRequest($url);
    }
    public function TagDynamics(){
        $data=$_POST['data'];
        $page=$_POST['page'];
        if($page!=0||$page!='0'){
            $url='http://baobab.kaiyanapp.com/api/v1/tag/dynamics?'.$page;
        }else{
            $url='http://baobab.kaiyanapp.com/api/v1/tag/dynamics?id='.$data;
        }
        echo UrlRequest($url);
    }
}