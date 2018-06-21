<?php
//天气应用控制器
$allow=1;
include "ServerController.php";
class WeatherController{
    public function GetWeather(){
        ini_set("error_reporting","E_ALL & ~E_NOTICE");
        $positionJSON = file_get_contents('http://api.map.baidu.com/location/ip?ip=" "&ak=v4Wf3i6LQtNU0CvL3fScxzIx&coor=bd09ll');
        $positionData = json_decode($positionJSON);
        $city = $_REQUEST['city'];
        if ($city == '') {
            $city = $positionData->content->address_detail->city;
        }
        echo file_get_contents('http://api.map.baidu.com/telematics/v3/weather?location='.$city.'&output=json&ak=v4Wf3i6LQtNU0CvL3fScxzIx');
    }
    public function response(){
        header("Content-type:text/plain; charset='utf-8'");
        $city = str_replace('|', '', $_POST['city']);
        $local = '深圳';
        if ($city == '') {
            $city = $local;
        }
        if (file_exists(iconv("utf-8", "GBK", "json/".$city.".json"))) {
            $file_handle = fopen(iconv("utf-8", "GBK", "json/".$city.".json"), "r");
            while (!feof($file_handle)) {
                $data = fgets($file_handle);
            }
            sleep(3);
            echo $data;
        } else {
            echo '{"error":-3, "status":"No result  available"}';
        }
        fclose($file_handle);
    }
}