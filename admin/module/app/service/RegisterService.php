<?php

class RegisterService extends CoreService {

  function registerAuthMenu($app, $menus) {
    $db = self::instance('kbv2');
    array_map(function($m) use ($app) { $m->app = $app; }, $menus);
    $qb = QB::instance('menu')
      ->insert($menus)
      ->ignore();
    $result = $db->query($qb->get());
    return $result;
  }

  function registerAuthFunction($app, $fns) {
    $db = self::instance('kbv2');
    array_map(function($f) use ($app) { $f->app = $app; }, $fns);
    $qb = QB::instance('function')
      ->insert($fns)
      ->ignore();
    $result = $db->query($qb->get());
    return $result;
  }

  function deregisterAuthMenu($app) {
    $db = self::instance('kbv2');
    $qb = QB::instance('menu')
      ->delete('app', $app);
    $result = $db->query($qb->get());
    return $result;
  }

  function deregisterAuthFunction($app) {
    $db = self::instance('kbv2');
    $qb = QB::instance('function')
      ->delete('app', $app);
    $result = $db->query($qb->get());
    return $result;
  }

}