<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreService {

  private static $connections      = [];
  private static $dbConfigFilename = 'db.ini';

  protected static function instance($configKey, $queryBuilder = null) {

    $appDbConfigFile = CORE_APP_PATH . CORE_APP_CONFIG . CoreService::$dbConfigFilename;
    $sharedDbConfigFile = CORE_SHARED_PATH . CORE_SHARED_CONFIG . CoreService::$dbConfigFilename;

    if (!file_exists($appDbConfigFile) && !file_exists($sharedDbConfigFile))
      throw CoreError::instance('Database config file: ' . $appDbConfigFile . ' does not exists.');

    // build DB configuration data, app-defined config have higher precedence
    $dbConfig = [];
    if (file_exists($sharedDbConfigFile)) $dbConfig = array_merge(parse_ini_file($sharedDbConfigFile, true));
    if (file_exists($appDbConfigFile)) $dbConfig = array_merge(parse_ini_file($appDbConfigFile, true));

    if (!@$dbConfig[$configKey])
      throw CoreError::instance('Database configuration for key: \'' . $configKey . '\' does not exists.');
    $driverId = $dbConfig[$configKey]['driver'];

    if (!isset(CoreService::$connections[$driverId])) {
      $dbDriverName = "CoreDB" . ucfirst($driverId);
      if (!class_exists($dbDriverName))
        throw CoreError::instance('DB driver implementation for ' . $dbDriverName . ' does not exists.');
      CoreService::$connections[$driverId] = new $dbDriverName($dbConfig[$configKey]);
    }
    return CoreService::$connections[$driverId];
    
  }

}
