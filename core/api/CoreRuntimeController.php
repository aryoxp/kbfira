<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreRuntimeController extends CoreApi {

  function __construct($path = null) {
    $this->coreRuntime = CoreRuntime::instance($path);
    // $this->runtimeFile = CORE_APP_PATH . CORE_APP_RUNTIME . "runtime.ini";
    // $this->runtimeFile = $path ?: $this->runtimeFile;
    // if (!file_exists($this->runtimeFile)) {
    //   throw CoreError::instance("Invalid runtime file to load: <code>$this->runtimeFile</code>.");
    // }
  }

  function load() {
    $location = self::postv('location') ?: CoreRuntime::PATH_APP;
    $module = self::postv('module');
    $file = self::postv('file');
    $runtimes = $this->coreRuntime->load($file, $location, $module);
    CoreResult::instance($runtimes)->show();
  }

  /** 
   * Set single session variable or a collection of variables 
   * @param key if POST data is set then set a single variable
   * otherwise all sent variables and their values 
   * will be treated as key-value pairs.
   * @return String Success or error message.
   */
  function set() {
    $location = self::postv('location') ?: CoreRuntime::PATH_APP;
    $module   = self::postv('module');
    $file     = self::postv('file');
    $key      = self::postv('key');
    $value    = self::postv('value');
    try {
      $runtimes = $this->coreRuntime->load($file, $location, $module);
    } catch (Exception $ex) {
      
      // runtime file not exists or cannot be opened
      // try to create the directory and file
      
      $path = dirname($this->coreRuntime->path);

      // if not .ini file, cancel.
      if (!preg_match('/\.ini$/i', $this->coreRuntime->path)) {
        throw CoreError::instance('Invalid runtime file: ' . $this->coreRuntime->path);
      }

      if (!file_exists($path)) {
        mkdir($path, 0777, true);
        if (file_exists($path) && !file_exists($this->coreRuntime->path)) {
          $fp = fopen($this->coreRuntime->path, 'a+');
          fclose($fp);
        }
      } else if (!file_exists($this->coreRuntime->path)) {
        $fp = fopen($this->coreRuntime->path, 'a+');
        fclose($fp);
      }

      // if unable to create...
      if (!file_exists($this->coreRuntime->path)) {
        throw CoreError::instance('Unable to create runtime directory and file: ' . $this->coreRuntime->path);
      }
    }

    if ($this->coreRuntime->save($key, $value) === null) {
      CoreError::instance('Unable to write runtime configuration')->show();
      return;
    }

    CoreResult::instance($this->coreRuntime->get($key))->show();
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
