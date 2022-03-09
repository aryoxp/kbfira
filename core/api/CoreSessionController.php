<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreSessionController extends CoreApi {

  /** 
   * Set single session variable or a collection of variables 
   * @param key if POST data is set then set a single variable
   * otherwise all sent variables and their values 
   * will be treated as key-value pairs.
   * @return String Success or error message.
   */
  function set() {
    $key = self::postv('key');
    $data = self::postv('data');
    // var_dump($_POST);
    try {
      if ($key) $_SESSION[$key] = $data;
      else foreach ($_POST as $k => $v) $_SESSION[$k] = $v;
      CoreResult::instance(true)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function get() {
    $key = self::postv('key');
    $data = $key !== null ? (isset($_SESSION[$key]) ? $_SESSION[$key] : null) : $_SESSION;
    CoreResult::instance($data)->json();
  }

  function unset() {
    $key = self::postv('key');
    if ($key !== null) unset($_SESSION[$key]);
    CoreResult::instance(true)->show();
  }

  function destroy() {
    session_destroy();
    CoreResult::instance(true)->show();
  }

  function dump() {
    header('Content-Type:text/plain');
    print_r($_SESSION);
  }
}
