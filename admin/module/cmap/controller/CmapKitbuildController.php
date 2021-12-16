<?php

class CmapKitbuildController extends ModuleController {
  
  function index() {
    $this->redirect('m/x/cmap/kitbuild/recompose');
  }

  function recompose() {
    Core::lib(Core::CONFIG)->set('menu', 'recompose', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab');
    $this->useScript("recompose.js");
    $this->useStyle("recompose.css");
    $this->render($this->view("recompose.php"));
  }

  function review() {
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer');
    $this->useScript("review.js");
    $this->render($this->view("review.php"));
  }

}