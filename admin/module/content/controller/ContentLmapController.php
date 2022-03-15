<?php

class ContentLmapController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'learnermaps', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->usePlugin('kitbuild-ui', 'kitbuild');
    $this->useScript("lmap.js");
    $this->render($this->view('lmap.php'), [ "title" => "Learner Maps" ]);
  }

}