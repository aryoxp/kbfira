<?php

class HomeController extends ModuleController {

  function index() {
    // echo $this->location('sapi/lari/gagah/berani');
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 'bootstrap', 'bootstrap-icons', 'sortable', 'general-ui');
    $this->ui->useScript('js/admin.js');
    $this->ui->useStyle('css/admin.css');
    $this->getModules();
    $this->loadModuleMenus();
    $this->ui->view('head.php', array(
      'menus' => $this->menus,
      'modules' => $this->modules
    ));
    $this->ui->view('dashboard.php');
    $this->ui->view('foot.php');
  }

}