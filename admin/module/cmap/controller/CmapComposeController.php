<?php

class CmapComposeController extends ModuleController {
  
  function index() {
    $this->redirect('m/x/cmap/compose/cmap');
  }

  function cmap() {
    Core::lib(Core::CONFIG)->set('menu', 'compose-cmap', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-logger', 'kitbuild-ui', 'kitbuild', 'kitbuild-collab');
    $this->useScript("cmap.js");
    $this->useStyle("cmap.css");
    $this->render($this->view("cmap.php"));
  }

  function kit() {
    Core::lib(Core::CONFIG)->set('menu', 'compose-kit', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild');
    $this->useScript("makekit.js");
    $this->useStyle("cmap.css");
    $this->render($this->view("makekit.php"));
  }

  

}