<?php

use Workerman\Worker;

class workerSingle
{
    public static $ws_worker;

    public static function get()
    {
        if (self::$ws_worker) {
            return self::$ws_worker;
        } else {
            self::$ws_worker = new Worker("websocket://0.0.0.0:9090");
//            Worker::$pidFile = '/var/run/workerman.pid';
            self::$ws_worker->count = 1;
            return self::$ws_worker;
        }
    }
}