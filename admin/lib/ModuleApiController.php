<?php

class ModuleApiController extends CoreController {

  public function init($module = null, $controller = null, $method = null, $args = null) {
    $this->module     = $module;
    $this->controller = $controller;
    $this->method     = $method;
    $this->args       = $args;
  }
  
}