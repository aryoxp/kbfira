<?php

class AppHomeController extends ModuleController {

  function index() {

    Core::lib(Core::CONFIG)->set('menu', 'app', CoreConfig::CONFIG_TYPE_CLIENT);

    $this->ui->usePlugin('sortable');
    $this->useStyle('css/app.css');
    $this->useScript('js/app.js');

    $modulesDir = CORE_APP_PATH . "module" . DS;
    $dirs = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);
    $dirs = preg_grep('/^\./i', $dirs, PREG_GREP_INVERT);
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $activeModules = parse_ini_file($runtimeModules);
   

    $data['active-modules'] = @$activeModules['modules'] ? $activeModules['modules'] : [];
    
    $data['module-keys'] = [];
    foreach($data['active-modules'] as $m) {
      $data['module-keys'][] = $m;
      $i = array_search($m, $dirs);
      unset($dirs[$i]);
    }
    $data['module-keys'] = array_merge($data['module-keys'], $dirs);

    $content = $this->view('home.php', $data);
    $this->render($content);
  }

} ; 