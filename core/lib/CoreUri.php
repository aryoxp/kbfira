<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreUri {

  private $scheme;
  private $host;
  private $port;
  private $uri;
  private $script;
  private $query;
  private $pathinfo;

  private $basepath;
  private $baseurl;
  private $basefileurl;
  private $baselinkurl;

  private $app;
  private $controller;
  private $method;
  private $args;

  const CONTROLLER   = 1;
  const METHOD       = 2;
  const ARGS         = 3;
  const APP          = 4;
  const CONTROLLERID = 5;
  const SCHEME       = 11;
  const HOST         = 12;
  const PORT         = 13;
  const URI          = 14;
  const SCRIPT       = 15;
  const PATHINFO     = 16;
  const BASEPATH     = 17;
  const BASEURL      = 18;
  const BASEFILEURL  = 19;
  const BASELINKURL  = 20;
  const QUERYSTRING  = 21;

  private static $instance;

  public static function instance($coreConfig = null) {
    if (!CoreUri::$instance) {
      CoreUri::$instance = new CoreUri($coreConfig);
    }

    return CoreUri::$instance;
  }

  private function __construct($coreConfig = null) {

    $xscript        = explode("/", $_SERVER['SCRIPT_NAME']);
    $this->scheme   = $_SERVER['REQUEST_SCHEME'];
    $this->host     = rtrim($_SERVER['HTTP_HOST'], ":" . $_SERVER['SERVER_PORT']);
    $this->port     = $_SERVER['SERVER_PORT'] == 80 ? "" : $_SERVER['SERVER_PORT'];
    $this->uri      = $_SERVER['REQUEST_URI'];
    $this->script   = end($xscript);
    $this->query    = $_SERVER['QUERY_STRING'];
    $this->pathinfo = isset($_SERVER['PATH_INFO']) ? (trim($_SERVER['PATH_INFO'], $_SERVER['QUERY_STRING'])) : "";

    /**
     * Base URL extraction.
     */

    // Remove trailing query string if any.
    list($this->basepath) = str_replace($this->pathinfo, "", explode("?", $_SERVER['REQUEST_URI']));

    // Remove script file from URI if any.
    if(strpos($this->basepath, $this->script) !== false)
      $this->basepath = str_replace($this->script, "", $this->basepath);

    // Remove all padded slash, and add trailing slash at end.
    // Hence, no double trailing slash at the end of the path.
    $this->basepath = trim($this->basepath, "/") . "/";

    // Composing global base URL, excluding app name.
    $this->baseurl = $this->scheme . "://" .
      $this->host . ($this->port ? ":" . $this->port : "") . "/" .
      str_replace(basename($_SERVER['SCRIPT_NAME']), "", $this->basepath);

    // Composing base URL for file, not including any script.
    $this->basefileurl = $this->scheme . "://" .
      $this->host . ($this->port ? ":" . $this->port : "") . "/" .
      $this->basepath;

    // Compose base URL for link, including the script if any.
    $this->baselinkurl = $this->scheme . "://" .
      $this->host . ($this->port ? ":" . $this->port : "") . "/" .
      $this->basepath .
      (strpos($this->uri, $this->script) === false ? "" : $this->script . "/");
      
    
    /**
     * Controller, method, args extraction.
     */

    list($paths) = explode("?", $this->pathinfo);
    $pathParts   = explode("/", trim($paths, "/"));
    if (CORE_MULTI_APPS) {
      $app                = strtolower(array_shift($pathParts));
      $this->app          = empty($app) ? $coreConfig['runtime']['default_app'] : $app;
      $this->basepath    .= $this->app ? $this->app . DS : '';
      $this->baselinkurl .= $this->app ? $this->app . DS : '';
      $this->basefileurl .= $this->app ? $this->app . DS : '';
    }
    $controller  = $pathParts ? array_shift($pathParts) : '';
    $method      = array_shift($pathParts);

    $this->controllerId = $controller ? $controller : $coreConfig['runtime']['default_controller'];
    $this->controller = (($controller == "") ?
      ucfirst($coreConfig['runtime']['default_controller']) :
      ucfirst($controller)) . 'Controller';
    $this->method = ($method == "") ?
      $coreConfig['runtime']['default_method'] :
      $method;
    $this->args = $pathParts;

    // var_dump($this);

  }

  public function get($part = CoreUri::URI) {
    switch ($part) {
      case CoreUri::SCHEME:
        return $this->scheme;
      case CoreUri::HOST:
        return $this->host;
      case CoreUri::PORT:
        return $this->port;
      case CoreUri::SCRIPT:
        return $this->script;
      case CoreUri::QUERYSTRING:
        return $this->query;
      case CoreUri::PATHINFO:
        return $this->pathinfo;
      case CoreUri::BASEPATH:
        return $this->basepath;
      case CoreUri::BASEURL:
        return $this->baseurl;
      case CoreUri::BASELINKURL:
        return $this->baselinkurl;        
      case CoreUri::BASEFILEURL:
        return $this->basefileurl;  
      case CoreUri::APP:
        return $this->app;
      case CoreUri::CONTROLLER:
        return $this->controller;
      case CoreUri::CONTROLLERID:
        return $this->controllerId;
      case CoreUri::METHOD:
        return $this->method;
      case CoreUri::ARGS:
        return $this->args;
      default:
        return $this->uri;
    }
  }
}
