<?php

class ContentTextController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'text', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('simplemde', 'highlight', 'showdown');
    $this->useScript("text.js");
    $this->render($this->view('text.php'), [ "title" => "Text" ]);
  }

}