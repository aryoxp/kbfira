<?php

class HomeController extends CoreController {
  
  function index() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'general-ui', 'highlight', 'showdown');
    $this->ui->useScript("recompose.js");
    $this->ui->useStyle("recompose.css");
    
    $this->ui->view('head.php', null, CoreView::CORE);
    $this->ui->view("recompose.php");
    $this->ui->pluginView("general-ui", null, 0);
    $this->ui->view('foot.php', null, CoreView::CORE);
  }

}