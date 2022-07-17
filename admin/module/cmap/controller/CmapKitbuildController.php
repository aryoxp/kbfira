<?php

class CmapKitbuildController extends ModuleController {
  
  function index() {
    $this->redirect('m/x/cmap/kitbuild/recompose');
  }

  function recompose() {
    $host = Core::lib(Core::CONFIG)->get('default_collab_host');
    $port = Core::lib(Core::CONFIG)->get('default_collab_port');
    Core::lib(Core::CONFIG)->set('collabhost', $host, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('collabport', $port, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('menu', 'recompose', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'highlight', 'showdown');
    $this->useScript("recompose.js");
    $this->useStyle("recompose.css");
    $this->render($this->view("recompose.php"));
  }

  function recomposeExt() {
    $host = Core::lib(Core::CONFIG)->get('default_collab_host');
    $port = Core::lib(Core::CONFIG)->get('default_collab_port');
    Core::lib(Core::CONFIG)->set('collabhost', $host, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('collabport', $port, CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('menu', 'recompose-ext', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer', 'kitbuild-logger', 'kitbuild-collab', 'highlight', 'showdown');
    $this->useScript("recompose.ext.js");
    $this->useStyle("recompose.css");
    $this->render($this->view("recompose.ext.php"), ["title" => "Extended Recomposition"]);
  }

  function review() {
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer');
    $this->useScript("review.js");
    $this->render($this->view("review.php"));
  }

  function settings() {
    $this->ui->usePlugin('core-runtime');
    $this->useScript("settings.kitbuild.js");
    $this->render($this->view("settings.kitbuild.php"));
  }

}