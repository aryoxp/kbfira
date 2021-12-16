<?php

class UserRoleController extends ModuleController {
  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'role', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('role.js');
    $this->render($this->view('role.php'), ['title' => 'Role Manager']);
  }
}