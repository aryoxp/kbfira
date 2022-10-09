<?php

class UserService extends CoreService {

  function getUserList() {
    $db = self::instance();
    $qb = QB::instance('user')->select();
    return $db->query($qb->get());
  }

  function insertUser($username, $name, $password) {
    $db = self::instance();
    $insert['username'] = trim(QB::esc($username));
    $insert['password'] = md5(trim(QB::esc($password)));
    $insert['name']     = trim(QB::esc($name));
    $qb = QB::instance('user')->insert($insert);
    $db->query($qb->get());
    return $this->selectUser($username);
  }

  function updateUser($username, $nusername, $name, $password = null) {
    $db = self::instance();  
    $update['username'] = trim(QB::esc($nusername));
    if ($password) $update['password'] = md5(trim(QB::esc($password)));
    $update['name']     = trim(QB::esc($name));
    $qb = QB::instance('user')->update($update)->where('username', trim(QB::esc($username)));
    $db->query($qb->get());
    return $this->selectUser($nusername);
  }

  function updateUserProfile($username, $name) {
    $db = self::instance();  
    $update['name'] = trim(QB::esc($name));
    $qb = QB::instance('user')->update($update)->where('username', trim(QB::esc($username)));
    $db->query($qb->get());
    return $this->selectUser($username);
  }

  function changeUserPassword($username, $password, $currentPassword = null) {
    $db = self::instance();  
    $update['password'] = md5(trim(QB::esc($password)));
    $qb = QB::instance('user')->update($update)->where('username', trim(QB::esc($username)));
    if ($currentPassword !== null)
      $qb->where('password', md5(trim(QB::esc($currentPassword))));
    $db->query($qb->get());
    if ($db->getAffectedRows() == 0) throw CoreError::instance('Invalid current password or new password is the same as current password.');
    return $this->selectUser($username);
  }

  function registerUser($name, $username, $password, $rid = null, $gid = null) {
    $db = self::instance();
    try {
      $db->begin();
      $insert['username'] = trim(QB::esc($username));
      $insert['password'] = md5(trim(QB::esc($password)));
      $insert['name']     = trim(QB::esc($name));
      $qb = QB::instance('user')->insert($insert);
      $result = $db->query($qb->get());
      if ($rid !== null) {
        $insertUserRole['username'] = trim(QB::esc($username));
        $insertUserRole['rid'] = trim(QB::esc($rid));
        $qb = QB::instance('user_role')->insert($insertUserRole);
        $result = $db->query($qb->get());
      }
      if ($gid !== null) {
        $insertGrupUser['gid'] = trim(QB::esc($gid));
        $insertGrupUser['username'] = trim(QB::esc($username));
        $qb = QB::instance('grup_user')->insert($insertGrupUser);
        $result = $db->query($qb->get());
      }
      $db->commit();
      return $result;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function selectUser($username) {
    $db = self::instance();
    $qb = QB::instance('user')->select()
      ->where('username', QB::esc($username));
    return $db->getRow($qb->get());
  }

  function getUsers($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance();
    $qb = QB::instance('user')->select()
      ->where('name', 'LIKE', "%$keyword%")
      ->where('username', 'LIKE', "%$keyword%", QB::OR)
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getRBACUsers($keyword = '', $page = 1, $perpage = 10, $created = null) {
    $db = self::instance();
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
      ->orderBy('username', QB::DESC)
      ->limit(($page-1)*$perpage, $perpage);
    if ($created) $qb = $qb->where(QB::raw('DATE(created)'), QB::esc($created));
    return $db->query($qb->get());
  }

  function getRBACUser($username, $password = null, $rid = null) {
    $db = self::instance();
    $qb = QB::instance('user u')->select()
      ->select(QB::raw('(SELECT GROUP_CONCAT(r.name) FROM role r RIGHT JOIN user_role ur ON ur.rid = r.rid RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `roles`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(ur.rid) FROM user_role ur RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username) AS `rids`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(g.name) FROM grup g RIGHT JOIN grup_user gu ON gu.gid = g.gid RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `groups`'))
      ->select(QB::raw('(SELECT GROUP_CONCAT(gu.gid) FROM grup_user gu RIGHT JOIN user u2 ON u2.username = gu.username WHERE u2.username = u.username) AS `gids`'))
      ->where('username', $username)
      ->limit(1);
    if ($password !== null) $qb->where('password', md5($password));
    if ($rid !== null) $qb = $qb->where(QB::raw("'$rid'"), QB::IN, QB::raw('(SELECT r.id FROM role r RIGHT JOIN user_role ur ON ur.rid = r.rid RIGHT JOIN user u2 ON u2.username = ur.username WHERE u2.username = u.username)'));
    return $db->getRow($qb->get());
  }

  function getUsersCount($keyword = '') {
    $db = self::instance();
    $qb = QB::instance('user')->select(QB::raw('COUNT(*) AS count'))
      ->where('name', 'LIKE', "%$keyword%")
      ->where('username', 'LIKE', "%$keyword%", QB::OR);
    return $db->getVar($qb->get());
  }

  function deleteUser($username) {
    $db = self::instance();
    $qb = QB::instance('user')->delete()
      ->where('username', QB::esc($username));
    return $db->query($qb->get());
  }

  function deleteUsers($usernames = []) {
    $db = self::instance();
    $wrap = function($username) { return "'" . QB::esc($username) . "'"; };
    $users = array_map($wrap, $usernames);
    $qb = QB::instance('user')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users) . ")"));
    return $db->query($qb->get());
  }

  function getUserListOfGroups($gids = []) {
    if (count($gids) == 0) return [];
    $quote = function($v) {
      return "'" . QB::esc($v) . "'";
    };
    $db = self::instance();
    $qb = QB::instance('user u')->select()
      ->leftJoin('grup_user gu', 'gu.username', 'u.username')
      ->where('gu.gid', QB::IN, QB::raw(QB::OG . implode(",", array_map($quote, $gids)) . QB::EG));
    return $db->query($qb->get());
  }

}