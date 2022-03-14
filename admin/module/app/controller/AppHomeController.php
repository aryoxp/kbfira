<?php

class AppHomeController extends ModuleController {

  const APPID = 'app';

  function index() {

    Core::lib(Core::CONFIG)->set('menu', 'app', CoreConfig::CONFIG_TYPE_CLIENT);

    $this->isAppAuthorized(AppHomeController::APPID);

    $this->ui->usePlugin('sortable');
    $this->useStyle('css/app.css');
    $this->useScript('js/app.js');

    $modulesDir = CORE_APP_PATH . "module" . DS;
    $dirs  = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);
    $mdirs = $dirs;
    $dirs  = preg_grep('/^\./i', $dirs, PREG_GREP_INVERT);
    $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
    $activeModules = parse_ini_file($runtimeModules);
   

    $data['active-modules'] = @$activeModules['modules'] ? $activeModules['modules'] : [];
    
    $data['module-keys'] = [];
    foreach($data['active-modules'] as $m) {
      $data['module-keys'][] = $m;
      $i = array_search($m, $dirs);
      unset($dirs[$i]);
    }
    
    $registerService = new RegisterService();
    $data['apps'] = $registerService->getRegisteredApps();
    $data['modules'] = $mdirs;
    $data['app-keys'] = array_map(function($o) { return $o->app;}, $data['apps']);
    $data['module-keys'] = array_merge($data['module-keys'], $dirs);
    
    $content = $this->view('home.php', $data);
    $this->render($content);
  }

  function setup() {
    $this->ui->useCoreClients();
    $this->useScript('js/setup.js');

    $data['db_config_file'] = CORE_ROOT_PATH . ".shared/config/db.ini";
    $data['db_config_file_exists'] = file_exists(CORE_ROOT_PATH . ".shared/config/db.ini");
    $data['db_config'] = parse_ini_file(CORE_ROOT_PATH . ".shared/config/db.ini", TRUE);

    $configLib = Core::lib(Core::CONFIG);
    // var_dump($configLib->dump());
    $dbConfigCompressed = CoreResult::compress(json_encode($data['db_config']));
    $dbConfigCompressed = "\n      " . implode("\n      ", str_split($dbConfigCompressed, 80));
    $configLib->set('dbconfig', $dbConfigCompressed, CoreConfig::CONFIG_TYPE_CLIENT);
    
    // var_dump($configLib->dump(CoreConfig::CONFIG_TYPE_CLIENT));

    $content = $this->view('setup.php', $data);
    $this->render($content);
  }

}; 