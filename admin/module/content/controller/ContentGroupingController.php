<?php

class ContentGroupingController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'grouping', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->usePlugin('kitbuild-ui', 'kitbuild');
    $this->useScript("grouping.js");
    $this->render($this->view('grouping.php'), [ "title" => "Content Grouping Management" ]);
  }

}