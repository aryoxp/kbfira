<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreApi {
  protected $core;

  public function __construct() {
    $this->core = Core::instance();
    $config = Core::lib(Core::CONFIG);
    $config->set("rbac", "data", CoreConfig::CONFIG_TYPE_CLIENT);
  }

  // get request variables and sanitizes them
  public static function postv($var, $defaultValue = null) {
    return isset($_POST[$var]) ? $_POST[$var] : $defaultValue;
  }
  public static function requestv($var, $defaultValue = null) {
    return isset($_REQUEST[$var]) ? $_REQUEST[$var] : $defaultValue;
  }
  public static function getv($var, $defaultValue = null) {
    return isset($_GET[$var]) ? $_GET[$var] : $defaultValue;
  }

  // decompress
  public static function decompress($data) {
    return gzdecode(base64_decode($data));
  }

  // compress
  public static function compress($data) {
    return base64_encode(gzencode($data));
  }
}
