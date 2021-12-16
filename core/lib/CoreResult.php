<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreResult {
  public $result;
  public $status;
  public $error;

  public function __construct($result, $status = true, $error = null) {
    $this->result = $result;
    $this->status = $status;
    $this->error = $error;
  }

  public static function instance($result, $status = true, $error = null) {
    return new CoreResult($result, $status, $error);
  }

  public static function compress($data) {
    return base64_encode(gzcompress(json_encode($data), 9));
  }

  public function show() {
    $result = new stdClass;
    $result->coreStatus = $this->status;
    $result->coreError = $this->error;
    $result->coreResult = $this->result;
    @header('content-type:application/json');
    echo json_encode($result);
  }

  public function json() {
    @header('content-type:application/json');
    echo json_encode($this->result);
  }
}
