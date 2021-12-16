<?php

class ContentTopicController extends ModuleController {

  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'topic', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript("topic.js");
    $this->render($this->view('topic.php'), [ "title" => "Topic" ]);
  }

}