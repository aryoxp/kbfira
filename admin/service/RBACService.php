<?php

class RBACService extends CoreService {

  function assignRoleToUser($username, $rid) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user_role')
      ->insert(['username' => $username, 'rid' => $rid])
      ->ignore();
    return $db->query($qb->get());
  }

  function assignRoleToUsers($usernames, $rid) {
    $rows = [];
    foreach($usernames as $username)
      $rows[] = ['username' => $username, 'rid' => $rid];
    $db = self::instance('kbv2');
    $qb = QB::instance('user_role')
      ->inserts($rows)
      ->ignore();
    return $db->query($qb->get());
  }

  function assignUserToGroup($username, $gid) {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup_user')
      ->insert(['gid' => $gid, 'username' => $username])
      ->ignore();
    return $db->query($qb->get());
  }

  function assignUsersToGroup($usernames, $gid) {
    $rows = [];
    foreach($usernames as $username)
      $rows[] = ['username' => $username, 'gid' => $gid];
    $db = self::instance('kbv2');
    $qb = QB::instance('grup_user')
      ->inserts($rows)
      ->ignore();
    return $db->query($qb->get());
  }

  function unassignRoleFromUser($username, $rid = null) {
    $db = self::instance('kbv2');
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
    $db = self::instance('kbv2');
    $qb = QB::instance('user_role')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users). ")"));
    if ($rid) $qb->where('rid', QB::esc($rid));
    return $db->query($qb->get());
  }

  function unassignUserFromGroup($username, $gid = null) {
    $db = self::instance('kbv2');
    $qb = QB::instance('user_role')->delete()
      ->where('username', QB::esc($username));
    if ($gid) $qb->where('gid', QB::esc($gid));
    return $db->query($qb->get());
  }

  function unassignUsersFromGroup($usernames, $gid = null) {
    $users = [];
    $wrap = function($username) {
      return "'" . QB::esc($username) . "'";
    };
    $users = array_map($wrap, $usernames);
    $db = self::instance('kbv2');
    $qb = QB::instance('grup_user')->delete()
      ->where('username', QB::IN, QB::raw("(" . implode(", ", $users). ")"));
    if ($gid) $qb->where('gid', QB::esc($gid));
    return $db->query($qb->get());
  }

}