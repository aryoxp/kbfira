<?php

class RBACService extends CoreService {

  function getUserAuth($rids = []) {
    try {
      $ridList = array_map(function($v) {
        return QB::qt($v);
      }, $rids);
      $auth = new stdClass;
      $db = self::instance();

      $qb = QB::instance('auth_app')->select('app')->distinct()
        ->where('rid', QB::IN, QB::raw('(' . implode(",", $ridList) . ')'));
      $app = $db->query($qb->get());
      
      if ($app) $app = array_map(function($a) {
        return $a->app;
      }, $app);

      $qb = QB::instance('auth_menu')->select('app', 'mid')->distinct()
        ->where('rid', QB::IN, QB::raw('(' . implode(",", $ridList) . ')'));
      $menu = $db->query($qb->get());

      $qb = QB::instance('auth_function')->select('app', 'fid')->distinct()
        ->where('rid', QB::IN, QB::raw('(' . implode(",", $ridList) . ')'));
      $function = $db->query($qb->get());

      $auth->app      = $app ? $app : [];
      $auth->menu     = $menu ? $menu : [];
      $auth->function = $function ? $function : [];

      return $auth;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }


  function getRegisteredApps() {
    try {
      $db = self::instance();
      $qb = QB::instance('app')->select();
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }
  function getAppMenu($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('menu')->select()->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }
  function getAppFunction($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('function')->select()->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }




  function assignRoleToUser($username, $rid) {
    $db = self::instance();
    $qb = QB::instance('user_role')
      ->insert(['username' => $username, 'rid' => $rid]);
    return $db->query($qb->get());
  }

  function assignRoleToUsers($usernames, $rid) {
    $rows = [];
    foreach($usernames as $username)
      $rows[] = ['username' => $username, 'rid' => $rid];
    $db = self::instance();
    $qb = QB::instance('user_role')
      ->inserts($rows)
      ->ignore();
    return $db->query($qb->get());
  }

  function assignUserToGroup($username, $gid) {
    $db = self::instance();
    $qb = QB::instance('grup_user')
      ->insert(['gid' => $gid, 'username' => $username]);
    $result = $db->query($qb->get());
    return $db->getAffectedRows();
  }

  function assignUsersToGroup($usernames, $gid) {
    $rows = [];
    foreach($usernames as $username)
      $rows[] = ['username' => $username, 'gid' => $gid];
    $db = self::instance();
    $qb = QB::instance('grup_user')
      ->inserts($rows)
      ->ignore();
    return $db->query($qb->get());
  }

  function unassignRoleFromUser($username, $rid = null) {
    $db = self::instance();
    $qb = QB::instance('user_role')->delete()
      ->where('username', QB::esc($username));
    if ($rid) $qb->where('rid', QB::esc($rid));
    return $db->query($qb->get());
  }

  function unassignRoleFromUsers($usernames, $rid = null) {
    $users = [];
    $wrap = function($username) {
      return "'" . QB::esc($username) . "'";
    };
    $users = array_map($wrap, $usernames);
    $db = self::instance();
    $qb = QB::instance('user_role')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users). ")"));
    if ($rid) $qb->where('rid', QB::esc($rid));
    return $db->query($qb->get());
  }

  function unassignUserFromGroup($username, $gid = null) {
    $db = self::instance();
    $qb = QB::instance('grup_user')->delete()
      ->where('username', QB::esc($username));
    if ($gid) $qb->where('gid', QB::esc($gid));
    $result = $db->query($qb->get());
    return $db->getAffectedRows();
  }

  function unassignUsersFromGroup($usernames, $gid = null) {
    $users = [];
    $wrap = function($username) {
      return "'" . QB::esc($username) . "'";
    };
    $users = array_map($wrap, $usernames);
    $db = self::instance();
    $qb = QB::instance('grup_user')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users). ")"));
    if ($gid) $qb->where('gid', QB::esc($gid));
    return $db->query($qb->get());
  }







  function registerMenu($app, $menus = []) {
    try {
      $db = self::instance();
      $db->begin();
      $qb = QB::instance('app')->insert(['app' => $app])->ignore();
      $db->query($qb->get());

      $inserts = [];
      if (!is_array($menus) || count($menus) == 0) throw CoreError::instance("Invalid menu to register.");
      foreach($menus as $m) {
        $inserts[] = ['app' => $app, 
          'mid' => $m['id'],
          'label' => $m['label'] ? $m['label'] : null, 
          'url' => $m['url']  ? $m['url'] : null, 
          'icon' => $m['icon'] ? $m['icon'] : null];
      }
      $update = $inserts[0];
      unset($update['app']);
      unset($update['mid']);
      $qb = QB::instance('menu')
        ->inserts($inserts, array_keys($update));
      $result = $db->query($qb->get());
      $db->commit();
      return $result;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function registerFunction($app, $functions = []) {
    try {
      $db = self::instance();
      $db->begin();
      $qb = QB::instance('app')->insert(['app' => $app])->ignore();
      $db->query($qb->get());
      
      $inserts = [];
      if (!is_array($functions) || count($functions) == 0) 
        throw CoreError::instance("Invalid function to register.");
      foreach($functions as $f) {
        $inserts[] = ['app' => $app, 'fid' => $f['id'], 'description' => isset($f['description']) ? $f['description'] : null];
      }
      $update = $inserts[0];
      unset($update['app']);
      unset($update['mid']);
      $qb = QB::instance('function')
        ->inserts($inserts, array_keys($update))
        ->ignore();
      $result = $db->query($qb->get());
      $db->commit();
      return $result;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getRoleAuthApp($rid) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_app')->select()->where('rid', QB::esc($rid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function grantRoleApp($rid, $app) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_app')->insert(['rid' => QB::esc($rid), 'app' => QB::esc($app)])->ignore();
      $result = $db->query($qb->get());
      return $result ? $db->getAffectedRows() : false;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function revokeRoleApp($rid, $app) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_app')->delete()->where('rid', QB::esc($rid))->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getRoleAuthAppMenu($rid, $app) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_menu')
        ->select()
        ->where('rid', QB::esc($rid))
        ->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function grantRoleMenu($rid, $app, $mid) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_menu')
        ->insert(['rid' => QB::esc($rid), 'app' => QB::esc($app), 'mid' => QB::esc($mid)])
        ->ignore();
      $result = $db->query($qb->get());
      return $result ? $db->getAffectedRows() : false;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function revokeRoleMenu($rid, $app, $mid) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_menu')
      ->delete()
      ->where('rid', QB::esc($rid))
      ->where('app', QB::esc($app))
      ->where('mid', QB::esc($mid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getRoleAuthAppFunction($rid, $app) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_function')
        ->select()
        ->where('rid', QB::esc($rid))
        ->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function grantRoleFunction($rid, $app, $fid) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_function')
        ->insert(['rid' => QB::esc($rid), 'app' => QB::esc($app), 'fid' => QB::esc($fid)])
        ->ignore();
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function revokeRoleFunction($rid, $app, $fid) {
    try {
      $db = self::instance();
      $qb = QB::instance('auth_function')
      ->delete()
      ->where('rid', QB::esc($rid))
      ->where('app', QB::esc($app))
      ->where('fid', QB::esc($fid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

}