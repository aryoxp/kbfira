<?php

class CmapComposeController extends ModuleController {
  
  function index() {
    $this->redirect('m/x/cmap/compose/cmap');
  }

  function cmap() {
    $host = Core::lib(Core::CONFIG)->get('default_collab_host');
    $port = Core::lib(Core::CONFIG)->get('default_collab_port');
    Core::lib(Core::CONFIG)->set('collabhost', $host, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('collabport', $port, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('menu', 'compose-cmap', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-logger', 'kitbuild-ui', 'kitbuild', 'kitbuild-collab');
    $this->ui->language('module/cmap/lang/cmap', CoreLanguage::LOCATION_APP_ROOT);
    $this->useScript("cmap.js");
    $this->useStyle("cmap.css");
    $this->render($this->view("cmap.php"));
  }

  function kit() {
    Core::lib(Core::CONFIG)->set('menu', 'compose-kit', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'sortable');
    $this->ui->language('module/cmap/lang/kitbuild', CoreLanguage::LOCATION_APP_ROOT);
    $this->useScript("makekit.js");
    $this->useStyle("cmap.css");
    $this->render($this->view("makekit.php"));
  }

  function settings() {
    $this->ui->usePlugin('core-runtime');
    $this->useScript("settings.compose.js");
    $this->render($this->view("settings.compose.php"));
  }

  

}