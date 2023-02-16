<?php

class CoreRuntime {

  const PATH_ROOT   = 'root';
  const PATH_SHARED = 'shared';
  const PATH_APP    = 'app';
  const PATH_MODULE = 'module';

  private $runtimes = array();
  private $settings;
  private $config;

  private $location;
  private $module;

  public $path;
  public $file;

  function __construct($path, $options = null) {
    $this->file     = "runtime.ini";
    $this->path     = $path ?: CORE_APP_PATH . CORE_APP_RUNTIME . $this->file;
    $this->settings = $options;
    $this->config   = CoreConfig::instance();
  }

  static function instance($path = null, $options = null) {
    return new CoreRuntime($path, $options);
  }

  function load($file = null, $location = null, $module = null, $options = null) {
    if ($file) $this->file = $file;
    switch ($location) {
      case CoreRuntime::PATH_ROOT:
        $this->path = CORE_ROOT_PATH . $this->file;
        break;
      case CoreRuntime::PATH_SHARED:
        $this->path = CORE_ROOT_PATH . CORE_SHARED_PATH . CORE_SHARED_RUNTIME . $this->file;
        break;
      case CoreRuntime::PATH_MODULE:
        $this->path = CORE_APP_PATH . 'module/' . $module . DS . CORE_APP_RUNTIME . $this->file;
        break;
      default:
        $this->path = CORE_APP_PATH . CORE_APP_RUNTIME . $this->file;
    }
    $this->location = $location;
    $this->module = $module;
    // $this->path = $file ?: $this->file;
    try {
      if (!file_exists($this->path)) 
        throw CoreError::instance("Could not open runtime file: " . $this->path . " for reading.");
      $this->runtimes = parse_ini_file($this->path, true);
      return $this->runtimes ?: [];
    } catch (CoreError $e) {
      throw $e;
    }
  }

  function save($key, $value = null, $options = null) {
    $this->runtimes = $this->load($this->file, $this->location, $this->module, $options);
    $this->runtimes[$key] = $value;
    // var_dump($this->runtimes, $this->path);
    try {
      $this->write($this->runtimes, $this->path);
      return $this->runtimes[$key];
    } catch (Exception $ex) {
      return null;
    }
  }

  function get($key = null) {
    if (!$key) return $this->runtimes;
    else return $this->runtimes[$key];
  }

  private function write($array, $file) {
    $res = array();
    foreach ($array as $key => $val) {
      if (is_array($val)) {
        $res[] = "[$key]";
        foreach ($val as $skey => $sval) $res[] = "$skey = " . (is_numeric($sval) ? $sval : '"' . $sval . '"');
      } else $res[] = "$key = " . (is_numeric($val) ? $val : '"' . $val . '"');
    }
    $this->safefilerewrite($file, implode("\n", $res));
  }

  private function safefilerewrite($fileName, $dataToSave) {
    // var_dump($fileName, $dataToSave);
    if ($fp = fopen($fileName, 'w')) {
      $startTime = microtime(TRUE);
      do {
        $canWrite = flock($fp, LOCK_EX);
        // If lock not obtained sleep for 0 - 100 milliseconds, to avoid collision and CPU load
        if (!$canWrite) usleep(round(rand(0, 100) * 1000));
      } while ((!$canWrite) and ((microtime(TRUE) - $startTime) < 5));

      //file was locked so now we can store information
      if ($canWrite) {
        fwrite($fp, $dataToSave);
        flock($fp, LOCK_UN);
      }
      fclose($fp);
    }
  }
}
