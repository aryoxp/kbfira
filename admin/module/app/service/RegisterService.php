<?php

class RegisterService extends CoreService {

  function registerApp($app, $name, $shortdesc, $description) {
    try {
      $db = self::instance();
      $insert['app'] = $app;
      $insert['name'] = $name;
      $insert['shortdesc'] = $shortdesc;
      $insert['description'] = $description;
      $qb = QB::instance('app')->insert($insert);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function deregisterApp($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('app')->delete()->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getRegisteredApp($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('app')->select()->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
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

  function registerModule($module, $name = null, $shortdesc = null, $description = null) {
    try {
      $db = self::instance();
      $insert['app']         = QB::esc($module);
      // $insert['name']        = QB::esc($name);
      // $insert['shortdesc']   = QB::esc($shortdesc);
      // $insert['description'] = QB::esc($description);
      $qb = QB::instance('app')->insert($insert)->ignore();
      $result = $db->query($qb->get());
      return $result ? $db->getAffectedRows() : false;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function registerAuthMenu($app, $menus) {
    $db = self::instance();
    array_map(function($m) use ($app) { $m->app = $app; }, $menus);
    $qb = QB::instance('menu')
      ->insert($menus)
      ->ignore();
    $result = $db->query($qb->get());
    return $result;
  }

  function registerAuthFunction($app, $fns) {
    $db = self::instance();
    array_map(function($f) use ($app) { $f->app = $app; }, $fns);
    $qb = QB::instance('function')
      ->insert($fns)
      ->ignore();
    $result = $db->query($qb->get());
    return $result;
  }

  function deregisterAuthMenu($app) {
    $db = self::instance();
    $qb = QB::instance('menu')
      ->delete('app', $app);
    $result = $db->query($qb->get());
    return $result;
  }

  function deregisterAuthFunction($app) {
    $db = self::instance();
    $qb = QB::instance('function')
      ->delete('app', $app);
    $result = $db->query($qb->get());
    return $result;
  }

  function getRegisteredAuthMenu($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('menu')->select()->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getRegisteredAuthFunction($app) {
    try {
      $db = self::instance();
      $qb = QB::instance('function')->select()
        ->select('fid AS id')
        ->where('app', QB::esc($app));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

}