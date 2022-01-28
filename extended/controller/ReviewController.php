<?php

class ReviewController extends CoreController {
  
  function index() {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'general-ui');
    $this->ui->useScript("review.js");
    
    $this->ui->view('head.php', null, CoreView::CORE);
    $this->ui->view("review.php");
    $this->ui->pluginView("general-ui", null, 0);
    $this->ui->view('foot.php', null, CoreView::CORE);
  }

}