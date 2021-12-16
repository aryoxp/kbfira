<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreError extends Exception {

	public function show() {
    @header('content-type:application/json');

    $error = new stdClass;
    $error->coreStatus = false;
    $error->coreError = $this->message;

    echo json_encode($error);
  }

  public static function instance( $message ) {
    return new CoreError($message);
  }
	
}
