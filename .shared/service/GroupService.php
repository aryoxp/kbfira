<?php

class GroupService extends CoreService {

  function getGroupList() {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup')->select();
    return $db->query($qb->get());
  }

  function insertGroup($gid, $name, $description = null) {
    $db = self::instance('kbv2');
    $insert['gid']         = QB::esc($gid);
    $insert['name']        = QB::esc($name);
    $insert['description'] = QB::esc($description);
    $qb = QB::instance('grup')->insert($insert);
    $db->query($qb->get());
    return $this->selectGroup($gid);
  }

  function updateGroup($gid, $ngid, $name, $description = null) {
    $db = self::instance('kbv2');
    $update['gid']         = QB::esc($ngid);
    $update['name']        = QB::esc($name);
    $update['description'] = QB::esc($description);
    $qb = QB::instance('grup')->update($update)->where('gid', $gid);
    $db->query($qb->get());
    return $this->selectGroup($ngid);
  }

  function selectGroup($gid) {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup')->select()
      ->where('gid', QB::esc($gid));
    return $db->getRow($qb->get());
  }

  function getGroups($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup')->select()
      ->where('name', 'LIKE', "%$keyword%")
      ->where('description', 'LIKE', "%$keyword%", QB::OR)
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getGroupsCount($keyword = '') {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup')->select(QB::raw('COUNT(*) AS count'))
      ->where('name', 'LIKE', "%$keyword%")
      ->where('description', 'LIKE', "%$keyword%", QB::OR);
    return $db->getVar($qb->get());
  }

  function deleteGroup($gid) {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup')->delete()
      ->where('gid', QB::esc($gid));
    return $db->query($qb->get());
  }

  function getGroupsOfUser($username) {
    $db = self::instance('kbv2');
    $qb = QB::instance('grup g')->select()
      ->leftJoin('grup_user gu', 'gu.gid', 'g.gid')
      ->where('gu.username', QB::esc($username));
    return $db->query($qb->get());
  }

}