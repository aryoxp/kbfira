<?php

class UserService extends CoreService {

  function getUserList() {
    $db = self::instance('kbv2');
    $qb = QB::instance('user')->select();
    return $db->query($qb->get());
  }

  function insertUser($username, $name, $password) {
    $db = self::instance('kbv2');
    $insert['username'] = trim(QB::esc($username));
    $insert['password'] = md5(trim(QB::esc($password)));
    $insert['name']     = trim(QB::esc($name));
    $qb = QB::instance('user')->insert($insert);
    $db->query($qb->get());
    return $this->selectUser($username);
  }

  function updateUser($username, $nusername, $name, $password = null) {
    $db = self::instance('kbv2');  
    $update['username'] = trim(QB::esc($nusername));
    if ($password) $update['password'] = md5(trim(QB::esc($password)));
    $update['name']     = trim(QB::esc($name));
    $qb = QB::instance('user')->update($update)->where('username', trim(QB::esc($username)));
    $db->query($qb->get());
    return $this->selectUser($nusername);
  }

  function selectUser($username) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user')->select()
      ->where('username', QB::esc($username));
    return $db->getRow($qb->get());
  }

  function getUsers($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user')->select()
      ->where('name', 'LIKE', "%$keyword%")
      ->where('username', 'LIKE', "%$keyword%", QB::OR)
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getRBACUsers($keyword = '', $page = 1, $perpage = 10, $created = null) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user u')->select()
      ->select(QB::raw('(SELECT GROUP_CONCAT(r.name) FROM role r RIGHT JOIN user_role ur ON ur.rid = r.rid RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `roles`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(ur.rid) FROM user_role ur RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `rids`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(g.name) FROM grup g RIGHT JOIN grup_user gu ON gu.gid = g.gid RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `groups`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(gu.gid) FROM grup_user gu RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `gids`'))
      ->where(QB::OG)
      ->where('name', 'LIKE', "%$keyword%")
      ->where('username', 'LIKE', "%$keyword%", QB::OR)
      ->where(QB::EG)
      ->orderBy('created', QB::DESC)
      ->limit(($page-1)*$perpage, $perpage);
    // echo $created;
    if ($created) $qb = $qb->where(QB::raw('DATE(created)'), QB::esc($created));
    // echo $qb->get();
    return $db->query($qb->get());
  }

  function getRBACUser($username, $password, $role = null) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user u')->select()
      ->select(QB::raw('(SELECT GROUP_CONCAT(r.name) FROM role r RIGHT JOIN user_role ur ON ur.rid = r.rid RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `roles`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(ur.rid) FROM user_role ur RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `rids`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(g.name) FROM grup g RIGHT JOIN grup_user gu ON gu.gid = g.gid RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `groups`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(gu.gid) FROM grup_user gu RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `gids`'))
      ->where('username', $username)
      ->where('password', md5($password))
      ->limit(1);
    if ($role) $qb = $qb->where(QB::raw("'$role'"), QB::IN, QB::raw('(SELECT r.name FROM role r RIGHT JOIN user_role ur ON ur.rid = r.rid RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username)'));
    // echo $qb->get();
    return $db->getRow($qb->get());
  }

  function getUsersCount($keyword = '') {
    $db = self::instance('kbv2');
    $qb = QB::instance('user')->select(QB::raw('COUNT(*) AS count'))
      ->where('name', 'LIKE', "%$keyword%")
      ->where('username', 'LIKE', "%$keyword%", QB::OR);
    return $db->getVar($qb->get());
  }

  function deleteUser($username) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user')->delete()
      ->where('username', QB::esc($username));
    return $db->query($qb->get());
  }

  function deleteUsers($usernames = []) {
    $db = self::instance('kbv2');
    $wrap = function($username) { return "'" . QB::esc($username) . "'"; };
    $users = array_map($wrap, $usernames);
    $qb = QB::instance('user')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users) . ")"));
    return $db->query($qb->get());
  }

  // function assignTextToUser($text, $username) {
  //   $db = self::instance('kbv2');
  //   $qb = QB::instance('user')->update(['text' => $text])
  //     ->where('username', QB::esc($username));
  //   return $db->query($qb->get());
  // }

  // function unassignTextFromUser($username) {
  //   $db = self::instance('kbv2');
  //   $qb = QB::instance('user')->update(['text' => null])
  //     ->where('username', QB::esc($username));
  //   return $db->query($qb->get());
  // }

}