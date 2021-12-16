<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class HomeController extends CoreController {

  public function index() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 'bootstrap', 'bootstrap-icons');
    $this->ui->view('home.php');
  }

}
