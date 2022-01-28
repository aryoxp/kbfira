<?php

/** 
 * Boot class for modules. 
 * */

class MController extends CoreController {

  private static $instance;

  private static $controller;
  private static $controllerId;
  private static $method;
  private static $args;

  const CONTROLLER   = 1;
  const CONTROLLERID = 2;
  const METHOD       = 3;
  const ARGS         = 4;

  public function __construct()
  {
    $config = (Core::lib(Core::CONFIG));
    MController::$controller = $config->get('default_controller', CoreConfig::CONFIG_TYPE_RUNTIME);
    MController::$method = $config->get('default_method', CoreConfig::CONFIG_TYPE_RUNTIME);
    MController::$instance = $this;
  }

  public static function instance() {
    return MController::$instance;
  }
  
  function x($module = null, $controller = null, $method = null, ...$args) {
    // var_dump($module, $controller, $method, $args);
    // var_dump(MController::$controller, MController::$method);

    $modulePath = CORE_APP_PATH . "module" . DS . $module; // var_dump($modulePath);
    if (empty($module) || !file_exists($modulePath)) 
      throw CoreError::instance('Invalid module: ' . $module);

    $controllerId = empty($controller) ? MController::$controller : $controller;
    $controller = ucfirst($module) . ucfirst($controllerId) . "Controller";
    $method = empty($method) ? MController::$method : $method;

    MController::$controller = $controller;
    MController::$controllerId = $controllerId;
    MController::$method = $method;
    MController::$args = $args;

    // var_dump($module, $controller, $method, $args);
    ModuleAutoloader::instance($module);
    if (!class_exists($controller)) throw CoreError::instance("Invalid controller: '$controller'");
    
    $controllerInstance = new $controller();
    $controllerInstance->init($module, $controller, $method);
    try {
      
      if (method_exists($controller, $method))
        $controllerInstance->$method(...$args);
      else throw CoreError::instance("Invalid method: '$method' on module: '$module' controller: '$controller'. ");
    } catch(Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function get($what = null) {
    switch($what) {
      case MController::CONTROLLER:
        return MController::$controller;
      case MController::CONTROLLERID:
        return MController::$controllerId;
      case MController::METHOD:
        return MController::$method;
      case MController::ARGS:
        return MController::$args;
    }
    return null;
  }

}