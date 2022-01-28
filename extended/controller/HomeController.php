<?php

class HomeController extends CoreController {
  
  function index() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'general-ui');
    $this->ui->useScript("extend.js");
    $this->ui->useStyle("extend.css");
    
    $this->ui->view('head.php', null, CoreView::CORE);
    $this->ui->view("extend.php");
    $this->ui->pluginView("general-ui", null, 0);
    $this->ui->view('foot.php', null, CoreView::CORE);
  }

}