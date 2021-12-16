<?php

class UserGroupController extends ModuleController {
  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'group', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('group.js');
    $this->render($this->view('group.php'), ['title' => 'Group Manager']);
  }
}