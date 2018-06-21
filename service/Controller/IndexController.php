<?php
class IndexController
{
    public function index()
    {
        $text='<style>body{margin:0;}</style><div style="padding:15px;font-size:20px;background: #4CAF50;color: #fff;">The Server is  work now!<br>You can use your defined route to request them.<br>'.date('y-m-d H:i:s',time()).'<span style="float: right;">ZJINH</span></div>';
        exit($text);
    }
};