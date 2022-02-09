<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreAutoloader {

	private static $instance;

	public static function instance() {
		if (!CoreAutoloader::$instance) return new CoreAutoLoader();
		else return CoreAutoloader::$instance;
	}

	private function __construct() {
    spl_autoload_register(array($this, 'coreLibLoader'));
    spl_autoload_register(array($this, 'coreDriverLoader'));
		spl_autoload_register(array($this, 'coreApiLoader'));
    spl_autoload_register(array($this, 'coreCvsLoader'));
		spl_autoload_register(array($this, 'appLibraryLoader'));
		spl_autoload_register(array($this, 'appApiLoader'));
		spl_autoload_register(array($this, 'appControllerLoader'));
    spl_autoload_register(array($this, 'appServiceLoader'));
    spl_autoload_register(array($this, 'appModelLoader'));
		spl_autoload_register(array($this, 'sharedLoader'));
	}

	private function coreLibLoader( $className ) {
		@include_once CORE_LIB_PATH . $className . '.php';		
  }

  private function coreDriverLoader( $className ) {
		@include_once CORE_LIB_PATH . "drivers" . DS . $className . '.php';
  }
  
  private function coreCvsLoader( $className ) {
		@include_once CORE_CVS_PATH . $className . '.php';
	}

	private function coreApiLoader( $className ) {
		@include_once CORE_API_PATH . $className . '.php';		
	}
	
	private function appLibraryLoader( $className ) {
		@include_once CORE_APP_PATH . CORE_APP_LIB . $className . '.php';
	}

	private function appApiLoader( $className ) { 
		@include_once CORE_APP_PATH . CORE_APP_API . $className . '.php';
	}
	
	private function appControllerLoader( $className ) {
		@include_once CORE_APP_PATH . CORE_APP_CONTROLLER . $className .'.php';
	}

	private function appServiceLoader( $className ) {
		@include_once CORE_APP_PATH . CORE_APP_SERVICE . $className .'.php';
  }
  
  private function appModelLoader( $className ) {
		@include_once CORE_APP_PATH . CORE_APP_MODEL . $className .'.php';
	}

	private function sharedLoader( $className ) {
		@include_once CORE_SHARED_PATH . CORE_SHARED_CONTROLLER . $className .'.php';
		@include_once CORE_SHARED_PATH . CORE_SHARED_API . $className .'.php';
		@include_once CORE_SHARED_PATH . CORE_SHARED_SERVICE . $className .'.php';
		@include_once CORE_SHARED_PATH . CORE_SHARED_LIB . $className .'.php';
		@include_once CORE_SHARED_PATH . CORE_SHARED_MODEL . $className .'.php';			
	}
	
	public static function register($loader) {
		spl_autoload_register($loader);	
	}
}
