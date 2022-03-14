<?php

class UserManagerController extends ModuleController {
  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'user-manager', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->usePlugin('jquery', 'bootstrap-datepicker');
    $this->useScript('user.js');
    $this->render($this->view('user.php'), ['title' => 'User Manager']);
  }
}