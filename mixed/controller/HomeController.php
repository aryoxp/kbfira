<?php

class HomeController extends CoreController {
  
  function index() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'general-ui');
    $this->ui->useScript("mixed.js");
    $this->ui->useStyle("mixed.css");
    
    $this->ui->view('head.php', ['title' => 'Mixed Kit-Build'], CoreView::CORE);
    $this->ui->view("mixed.php");
    $this->ui->pluginView("general-ui", null, 0);
    $this->ui->view('foot.php', null, CoreView::CORE);
  }

}