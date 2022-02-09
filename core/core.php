<?php
ini_set('realpath_cache_ttl', 1);
(getcwd() != __DIR__) or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
(getcwd() != __DIR__) or die(); ;

$GLOBALS['microtime_start'] = microtime(true);
$coreConfig = parse_ini_file('core.config.ini', true);

define('DS', $coreConfig['core']['directory_separator']);
define('CORE', true);

// defining multi-apps flag
if (!defined('CORE_MULTI_APPS')) 
  define('CORE_MULTI_APPS', (bool) $coreConfig['core']['core_multi_apps']);

// setting session name for different apps running on the same server
// avoiding session variables being mixed up among apps
if (!defined('CORE_APP')) define('CORE_APP', $coreConfig['runtime']['default_app']);
if (!defined('CORE_ENV')) define('CORE_ENV', $coreConfig['runtime']['default_app']);

if (version_compare(PHP_VERSION, '7.3.0') >= 0)
  session_set_cookie_params(['Secure' => false, 'SameSite' => 'Lax']);

// defining system and application structure paths
define('CORE_ROOT_PATH', getcwd() . DS);
define('CORE_CORE_PATH', dirname(__FILE__) . DS);
define('CORE_CVS_PATH', CORE_CORE_PATH . $coreConfig['core']['core_pattern_directory'] . DS);
define('CORE_LIB_PATH', CORE_CORE_PATH . $coreConfig['core']['core_library_directory'] . DS);
define('CORE_API_PATH', CORE_CORE_PATH . $coreConfig['core']['core_api_directory'] . DS);
define('CORE_CONFIG_PATH', CORE_CORE_PATH . $coreConfig['core']['core_config_directory'] . DS);
define('CORE_ASSET_PATH', CORE_CORE_PATH . $coreConfig['core']['core_asset_directory'] . DS);
define('CORE_VIEW_PATH', CORE_CORE_PATH . $coreConfig['core']['core_view_directory'] . DS);

// defining app directories
define('CORE_APP_CONFIG', $coreConfig['core']['core_app_config_directory'] . DS);
define('CORE_APP_CONTROLLER', $coreConfig['core']['core_app_controller_directory'] . DS);
define('CORE_APP_SERVICE', $coreConfig['core']['core_app_service_directory'] . DS);
define('CORE_APP_MODEL', $coreConfig['core']['core_app_model_directory'] . DS);
define('CORE_APP_VIEW', $coreConfig['core']['core_app_view_directory'] . DS);
define('CORE_APP_LIB', $coreConfig['core']['core_app_library_directory'] . DS);
define('CORE_APP_API', $coreConfig['core']['core_app_api_directory'] . DS);
define('CORE_APP_ASSET', $coreConfig['core']['core_app_asset_directory'] . DS);
define('CORE_APP_LANG', CORE_APP_ASSET . $coreConfig['core']['core_app_language_directory'] . DS);
define('CORE_APP_VENDOR', CORE_APP_ASSET . $coreConfig['core']['core_app_vendor_directory'] . DS);

// defining shared libraries across apps
define('CORE_SHARED_PATH', $coreConfig['core']['core_shared_path'] . DS);
define('CORE_SHARED_CONFIG', $coreConfig['core']['core_shared_config_directory'] . DS);
define('CORE_SHARED_CONTROLLER', $coreConfig['core']['core_shared_controller_directory'] . DS);
define('CORE_SHARED_SERVICE', $coreConfig['core']['core_shared_service_directory'] . DS);
define('CORE_SHARED_MODEL', $coreConfig['core']['core_shared_model_directory'] . DS);
define('CORE_SHARED_LIB', $coreConfig['core']['core_shared_library_directory'] . DS);
define('CORE_SHARED_API', $coreConfig['core']['core_shared_api_directory'] . DS);


// instantiate the Core object
require_once CORE_LIB_PATH . 'Core.php';
$core = Core::instance($coreConfig);

// try to instantiate the controller and execute it's selected method
try {

  $app        = Core::lib(Core::URI)->get(CoreUri::APP);
  $controller = Core::lib(Core::URI)->get(CoreUri::CONTROLLER);
  $method     = Core::lib(Core::URI)->get(CoreUri::METHOD);
  $args       = Core::lib(Core::URI)->get(CoreUri::ARGS);
  // var_dump($controller, $method, $args, $app);

  define('CORE_APP_PATH', CORE_ROOT_PATH . $app . DS);
  // var_dump(get_defined_constants(true)['user']);  
  // var_dump(file_exists(CORE_APP_PATH . CORE_APP_CONTROLLER . $controller . ".php"));

  if (!file_exists(CORE_APP_PATH)) 
  throw CoreError::instance("Invalid app: " . $app . ".");

  // Start the session!
  session_name("CORESID-" . CORE_ENV . DS . $app);
  session_start();

  // var_dump(CORE_SHARED_PATH . CORE_SHARED_API . $controller . ".php", getcwd(), file_exists(CORE_SHARED_PATH . CORE_SHARED_API . $controller . ".php"));
  // try to instantiate the controller and execute method with the provided args
  if (file_exists(CORE_APP_PATH . CORE_APP_CONTROLLER . $controller . ".php") 
    || file_exists(CORE_APP_PATH . CORE_APP_API . $controller . ".php")
    || file_exists(CORE_SHARED_PATH . CORE_SHARED_CONTROLLER . $controller . ".php")
    || file_exists(CORE_SHARED_PATH . CORE_SHARED_API . $controller . ".php") 
    || file_exists(CORE_API_PATH . $controller . ".php")) {
    $C = new $controller();
    if (method_exists($controller, $method)) {
      call_user_func_array(array($C, $method), $args);
    } else throw CoreError::instance("Method: $method not found in controller: "
      . $controller . ".");
  } else throw CoreError::instance("Invalid app controller or controller not found: "
    . $controller . ".");
} catch (CoreError $e) {
  if (is_a($e, 'CoreError')) $e->show();
  else echo $e->getMessage();
  exit;
}

// TODO: Do optional cleanup here.
exit;
