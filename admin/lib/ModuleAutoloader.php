<?php

class ModuleAutoloader {

  private static $module;
  private static $autoloader;

  public static function instance($module)
  {
    self::$module = $module;
    self::$autoloader = new ModuleAutoloader();
    CoreAutoloader::register(array(ModuleAutoloader::$autoloader, 'module_controller'));
    CoreAutoloader::register(array(ModuleAutoloader::$autoloader, 'module_service'));
    CoreAutoloader::register(array(ModuleAutoloader::$autoloader, 'module_library'));
  }

  public function module_controller($className) {
    $classFile = CORE_APP_PATH . "module" . DS . self::$module . DS . "controller" . DS . $className . ".php";
    // var_dump($classFile, file_exists($classFile));
    if (file_exists($classFile)) @require_once($classFile);
  }

  public function module_service($className) {
    $classFile = CORE_APP_PATH . "module" . DS . self::$module . DS . "service" . DS . $className . ".php";
    if (file_exists($classFile)) @require_once($classFile);
  }

  public function module_library($className) {
    $classFile = CORE_APP_PATH . "module" . DS . self::$module . DS . "lib" . DS . $className . ".php";
    if (file_exists($classFile)) @require_once($classFile);
  }

}