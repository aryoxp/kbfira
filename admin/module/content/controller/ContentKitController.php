<?php

class ContentKitController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'kits', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->usePlugin('kitbuild-ui', 'kitbuild');
    $this->useScript("kit.js");
    $this->render($this->view('kit.php'), [ "title" => "Concept Map Kit" ]);
  }

}