<?php

class AppSetupController extends ModuleController {
  
  function index() {
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
  
}