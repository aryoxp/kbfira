<?php

class ContentTmapController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'teachermaps', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->usePlugin('kitbuild-ui', 'kitbuild');
    $this->useScript("tmap.js");
    $this->render($this->view('tmap.php'), [ "title" => "Teacher Maps" ]);
  }

}