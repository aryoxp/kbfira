<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreController extends CoreApi {

  protected $ui;
  protected $core;

  public function __construct() {
    parent::__construct();
    $this->ui = CoreView::instance($this);
    $this->core = Core::instance();
  }

  public function redirect($destination = null) {
    $destination = (empty($destination)) ? $this->location() : $destination;
    if (!preg_match("/^http(s)\:\/\//i", $destination))
      $destination = $this->location() . $destination;
    header('location: ' . trim($destination));
    exit;
  }

  // UI URL Wrappers

  public function location($path = null) {
    return $this->ui->location($path);
  }
  public function file($path) {
    return $this->ui->file($path);
  }
  public function asset($path) {
    return $this->ui->asset($path);
  }
}
