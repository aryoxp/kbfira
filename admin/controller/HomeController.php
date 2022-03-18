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
      'modules' => $this->modules,
      'title' => 'Dashboard'
    ));
    $auth = new CoreAuth();
    $this->ui->view('dashboard.php');
    $this->ui->view('foot.php');
  }

  function profile() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 'bootstrap', 'bootstrap-icons', 'sortable', 'general-ui');
    $this->ui->useScript('js/admin.js');
    $this->ui->useScript('js/profile.js');
    $this->ui->useStyle('css/admin.css');
    $this->getModules();
    $this->loadModuleMenus();
    $this->ui->view('head.php', array(
      'menus' => $this->menus,
      'modules' => $this->modules,
      'title' => 'User Profile'
    ));
    $this->ui->view('profile.php');
    $this->ui->view('foot.php');
  }

}