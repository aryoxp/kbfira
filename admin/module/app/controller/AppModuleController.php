<?php

class AppModuleController extends ModuleApiController {

  function enable() {
    $key = $this->postv('key');
    $order = $this->postv('order');
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    try {
      $activeModules = parse_ini_file($runtimeModules);
      if (!@$activeModules['modules']) $activeModules['modules'] = [];
      if (in_array($key, $activeModules)) {
        CoreResult::instance('Module has been enabled.')->show();
        return;
      }
      $orderedModules = [];
      foreach ($order as $o) {
        if (in_array($o, $activeModules['modules']) || $o == $key) 
          $orderedModules[] = 'modules[] = ' . $o;
      }
      if (@file_put_contents($runtimeModules, implode("\n", $orderedModules), LOCK_EX) === false)
        throw new Exception('Unable to write to module\'s runtime definition. Permission denied?');
      CoreResult::instance(true)->show();
    } catch (Exception $ex) {
      CoreError::instance('Error: ' . $ex->getMessage())->show();
    }
  }

  function disable() {
    $key = $this->postv('key');
    try {
      $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
      $activeModules = parse_ini_file($runtimeModules);
      if (!@$activeModules['modules']) {
        CoreResult::instance(true)->show();
        return;
      }
      $modules = [];
      foreach ($activeModules['modules'] as $m) {
        if ($m == $key) continue;
        $modules[] = 'modules[] = ' . $m;
      }
      if (@file_put_contents($runtimeModules, implode("\n", $modules), LOCK_EX) === false)
        throw new Exception('Unable to write to module\'s runtime definition. Permission denied?');
      CoreResult::instance(true)->show();
    } catch(Exception $ex) {
      CoreError::instance('Error: ' . $ex->getMessage())->show();
    }
  }

  function order() {
    $moduleOrder = $this->postv('order');
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $modules = [];
    foreach ($moduleOrder as $m) $modules[] = 'modules[] = ' . $m;
    try {
      if (@file_put_contents($runtimeModules, implode("\n", $modules), LOCK_EX) === false)
        throw new Exception('Unable to write to module\'s runtime definition. Permission denied?');
    } catch (Exception $ex) {
      CoreError::instance('Error: ' . $ex->getMessage())->show();
    }
  }

  function register() {
    $module = $this->postv('module'); // print_r(get_defined_constants(true)['user']);
    if (!$module && !file_exists(CORE_APP_PATH . 'module' . DS . $module)) {
      CoreError::instance('Invalid or unspecified module.')->show();
      exit;
    }
    $authJsonFile = CORE_APP_PATH . 'module' . DS . $module . DS . "auth.json";
    if (file_exists($authJsonFile)) {
      $authJson = file_get_contents($authJsonFile);
      try {
        $auth = json_decode($authJson);
        $menus = $auth->menu;
        $functions = $auth->function;
        $rs = new RegisterService();
        $ms = $rs->registerAuthMenu($module, $menus);
        $fs = $rs->registerAuthFunction($module, $functions);
        // var_dump($ms, $fs);
        CoreResult::instance("Authorization registration of module [$module] has succeeded.")->show();
      } catch(Exception $ex) {
        CoreError::instance($ex->getMessage())->show();
      }
    } else CoreError::instance("The specified module [<strong>$module<strong>] has no authorization data.")->show();

  }

  function deregister() {
    $module = $this->postv('module'); // print_r(get_defined_constants(true)['user']);
    if (!$module) {
      CoreError::instance('Invalid or unspecified module.')->show();
      exit;
    }
    try {
      $rs = new RegisterService();
      $ms = $rs->deregisterAuthMenu($module);
      $fs = $rs->deregisterAuthFunction($module);
      CoreResult::instance("Deregistration of module [$module] authorization has succeeded.")->show();
    } catch(Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}; 