<?php

class RbacRoleController extends ModuleController {
  function index() {
    $this->app();
  }
  function app() {

    $modulesDir = CORE_APP_PATH . "module" . DS;
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $activeModules = parse_ini_file($runtimeModules);

    $data['active-modules'] = isset($activeModules['modules']) ? $activeModules['modules'] : [];
    $data['modules'] = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);

    Core::lib(Core::CONFIG)->set('menu', 'role-app', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('role-app.js');
    $this->render($this->view('role-app.php', $data), ['title' => 'Role&mdash;App Authorization']);
  }
  function menu() {

    $modulesDir = CORE_APP_PATH . "module" . DS;
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $activeModules = parse_ini_file($runtimeModules);

    $data['active-modules'] = isset($activeModules['modules']) ? $activeModules['modules'] : [];
    $data['modules'] = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);

    Core::lib(Core::CONFIG)->set('menu', 'role-menu', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('role-menu.js');
    $this->render($this->view('role-menu.php', $data), ['title' => 'Role&mdash;Application Menu Authorization']);
  }
  function funct() {

    $modulesDir = CORE_APP_PATH . "module" . DS;
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $activeModules = parse_ini_file($runtimeModules);

    $data['active-modules'] = isset($activeModules['modules']) ? $activeModules['modules'] : [];
    $data['modules'] = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);

    Core::lib(Core::CONFIG)->set('menu', 'role-function', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('role-function.js');
    $this->render($this->view('role-function.php', $data), ['title' => 'Role&mdash;Application Function Authorization']);
  }
}