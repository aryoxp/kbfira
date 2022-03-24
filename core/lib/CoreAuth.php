<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreAuth extends CoreService {

	private static $instance;
  
  const AUTH_APP = 'app';
  const AUTH_MENU = 'menu';
  const AUTH_FUNCTION = 'fun';

  private $authorizedApps = [];
  private $authorizedMenus = [];
  private $authorizedFunctions = [];

  public function __construct($dbConfigKey = null, $app = null) {
    // $this->rids = $rids;
    $this->app = $app ? $app : Core::lib(Core::URI)->get(CoreUri::APP);
    $this->db = self::instance($dbConfigKey);
    if ($user = isset($_SESSION['user']) ? $_SESSION['user'] : false) {
      $rids = explode(",", $user['rids']);
      // var_dump($rids, $this->app);
      // $rids[] = 'ADMINISTRATOR';
      $qb = QB::instance('auth_app')->select()->whereIn('rid', $rids)->where('app', $this->app);
      $this->authorizedApps = $this->db->query($qb->get());
      $qb = QB::instance('auth_menu')->select()->whereIn('rid', $rids)->where('app', $this->app);
      $this->authorizedMenus = $this->db->query($qb->get());
      $qb = QB::instance('auth_function')->select()->whereIn('rid', $rids)->where('app', $this->app);
      $this->authorizedFunctions = $this->db->query($qb->get());
      // var_dump($this->authorizedApps, $this->authorizedMenus, $this->authorizedFunctions);
    }
  }

  public function isAuthorized($key, $app = null, $type = CoreAuth::AUTH_FUNCTION) {
    if (!$this->app) return false;
    if (count($this->rids) == 0) return false;
  }

  public static function isAppAuthorized($app = null) {
    $user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
    if ($user && isset($user['auth']) && isset($user['auth']['app'])) {
      $appAuth = $user['auth']['app'];
      return in_array($app, $appAuth);
    } 
    return false;
  }

  public static function isMenuAuthorized($app = null, $mid = null) {
    if (!self::isAppAuthorized($app)) return false;
    $user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
    if ($user && isset($user['auth']) && isset($user['auth']['menu'])) {
      // $count = count(array_filter($user['auth']['menu'], fn($m) => ($m['app'] == $app && $m['mid'] == $mid)));
      $count = count(array_filter($user['auth']['menu'], function($m) use($app, $mid) {
        return $m['app'] == $app && $m['mid'] == $mid;
      }));
      return $count ? true : false;
    } 
    return false;
  }

  public static function isFunctionAuthorized($app = null, $fid = null) {
    if (!self::isAppAuthorized($app)) return false;
    $user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
    if ($user && isset($user['auth']) && isset($user['auth']['function'])) {
      // $count = count(array_filter($user['auth']['function'], fn($f) => ($f['app'] == $app && $f['fid'] == $fid)));
      $count = count(array_filter($user['auth']['function'], function($f) use($app, $fid) {
        return $f['app'] == $app && $f['fid'] == $fid;
      }));
      return $count ? true : false;
    }
    return false;
  }

}
