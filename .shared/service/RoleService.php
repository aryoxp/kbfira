<?php

class RoleService extends CoreService {

  function getRoleList() {
    $db = self::instance();
    $qb = QB::instance('role')->select();
    return $db->query($qb->get());
  }

  function insertRole($rid, $name) {
    $db = self::instance();
    $insert['rid']  = QB::esc($rid);
    $insert['name'] = QB::esc($name);
    $qb = QB::instance('role')->insert($insert);
    $db->query($qb->get());
    return $this->selectRole($rid);
  }

  function updateRole($rid, $nrid, $name, $enabled = 1, $text = null, $data = null) {
    $db = self::instance();
    $update['rid']  = QB::esc($nrid);
    $update['name'] = QB::esc($name);
    $qb = QB::instance('role')->update($update)->where('rid', $rid);
    $db->query($qb->get());
    return $this->selectRole($nrid);
  }

  function selectRole($rid) {
    $db = self::instance();
    $qb = QB::instance('role')->select()
      ->where('rid', QB::esc($rid));
    return $db->getRow($qb->get());
  }

  function getRoles($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance();
    $qb = QB::instance('role')->select()
      ->where('name', 'LIKE', "%$keyword%")
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getRolesCount($keyword = '') {
    $db = self::instance();
    $qb = QB::instance('role')->select(QB::raw('COUNT(*) AS count'))
      ->where('name', 'LIKE', "%$keyword%");
    return $db->getVar($qb->get());
  }

  function deleteRole($rid) {
    $db = self::instance();
    $qb = QB::instance('role')->delete()
      ->where('rid', QB::esc($rid));
    return $db->query($qb->get());
  }

  function getRolesOfUser($username) {
    $db = self::instance();
    $qb = QB::instance('role r')->select()
      ->leftJoin('user_role ur', 'ur.rid', 'r.rid')
      ->where('ur.username', QB::esc($username));
    return $db->query($qb->get());
  }

}