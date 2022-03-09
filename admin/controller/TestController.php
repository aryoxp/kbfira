<?php

class TestController extends CoreController {
  function index() {
    // echo $this->location('sapi/lari/gagah/berani');
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 'bootstrap', 'bootstrap-icons', 'general-ui', 'markdown-it');
    $this->ui->useScript('js/test.js');
    $this->ui->useStyle('css/test.css');
    $this->ui->view('head.php', null, CoreView::CORE);
    $this->ui->view('test.php');
    $this->ui->view('foot.php', null, CoreView::CORE);
  }
}