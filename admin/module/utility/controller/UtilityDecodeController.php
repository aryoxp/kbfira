<?php

class UtilityDecodeController extends ModuleController {
  function index() {
    Core::lib(Core::CONFIG)->set('menu', 'encode-decode', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->useScript('encode-decode.js');
    $this->render($this->view('encode-decode.php'), ['title' => 'Log Data Encoder-Decoder']);
  }
}