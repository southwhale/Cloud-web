<?php
ini_set("error_reporting","E_ALL & ~E_NOTICE");
// 指定允许其他域名访问
header('Access-Control-Allow-Origin:*');
// 响应类型
header('Access-Control-Allow-Methods:POST,GET');
// 响应头设置
header('Access-Control-Allow-Headers:x-requested-with,content-type');
$route=include "web.php";
class Router
{
    private $route;
    public function __construct(array $route)
    {
        $this->route = $route;
    }
    public function parse($url)
    {
        if(empty($url)) {
            list($controller, $action) = explode('@', $this->route['_DEFAULT_']);
            return array(
                'controller' => $controller,
                'action'     => $action,
                'params'     => array(),
            );
        }
        $trans = array(
            ':any' => '[^/]+',
            ':num' => '[0-9]+'
        );
        foreach($this->route as $u => $d) {
            $pattern = '#^' . strtr($u, $trans) . '$#';
            if(preg_match($pattern, $url, $params)) {
                list($controller, $action) = explode('@', $d);
                array_shift($params);
                return array(
                    'controller' => $controller,
                    'action'     => $action,
                    'params'     => $params,
                );
            }
        }
        header("HTTP/1.0 404 Not Found");
        exit('<style>body{margin:0}</style><div style="padding:15px;font-size:20px;background: #B0413E;color: #fff;">Sorry, the page you are looking for could not be found.<br>This URL could not be found in the route.<br>Please check your request address or your defined route param.</div>');
    }
}
$r = new Router($route);
$arr = $r->parse($_GET['_url']);
require('Controller/'.$arr['controller'] . '.php');
//执行控制器的功能
$dispatcher = new $arr['controller'];
call_user_func_array(array($dispatcher, $arr['action']), $arr['params']);
?>
