<?php

class RBACApiController extends CoreApi {

  function createRole() {
    try {
      $rid  = $this->postv('rid');
      $name = $this->postv('name');
      $roleService = new RoleService();
      $result = $roleService->insertRole($rid, $name);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateRole() {
    try {
      $rid  = $this->postv('rid');
      $nrid = $this->postv('nrid');
      $name = $this->postv('name');
      $roleService = new RoleService();
      $result = $roleService->updateRole($rid, $nrid, $name);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRole($rid = '') {
    try {
      $rid = urldecode($rid);
      $roleService = new RoleService();
      $role = $roleService->selectRole($rid);
      CoreResult::instance($role)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRoleDetail($rid = '') {
    try {
      $rid = urldecode($rid);
      $roleService = new RoleService();
      $role = $roleService->selectRole($rid);
      CoreResult::instance($role)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRoles($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $roleService = new RoleService();
      $roles = $roleService->getRoles($keyword, $page, $perpage);
      CoreResult::instance($roles)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRolesCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $roleService = new RoleService();
      $count = $roleService->getRolesCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteRole() {
    try {
      $rid = $this->postv('rid', '');
      $roleService = new RoleService();
      $result = $roleService->deleteRole($rid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }















  function createGroup() {
    try {
      $gid         = $this->postv('gid');
      $name        = $this->postv('name');
      $description = $this->postv('description');
      $groupService = new GroupService();
      $result = $groupService->insertGroup($gid, $name, $description);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateGroup() {
    try {
      $gid  = $this->postv('gid');
      $ngid = $this->postv('ngid');
      $name = $this->postv('name');
      $description = $this->postv('description');
      $groupService = new GroupService();
      $result = $groupService->updateGroup($gid, $ngid, $name, $description);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getGroup($gid = '') {
    try {
      $gid = urldecode($gid);
      $groupService = new GroupService();
      $group = $groupService->selectGroup($gid);
      CoreResult::instance($group)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getGroupDetail($gid = '') {
    try {
      $gid = urldecode($gid);
      $groupService = new GroupService();
      $group = $groupService->selectGroup($gid);
      CoreResult::instance($group)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getGroups($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $groupService = new GroupService();
      $groups = $groupService->getGroups($keyword, $page, $perpage);
      CoreResult::instance($groups)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getGroupsCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $groupService = new GroupService();
      $count = $groupService->getGroupsCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteGroup() {
    try {
      $gid = $this->postv('gid', '');
      $groupService = new GroupService();
      $result = $groupService->deleteGroup($gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }















  function createUser() {
    try {
      $username = $this->postv('username');
      $name     = $this->postv('name');
      $password = $this->postv('password');
      $rid      = $this->postv('rid');
      $gid      = $this->postv('gid');
      $userService = new UserService();
      $result = $userService->insertUser($username, $name, $password);
      $rbac = new RBACService();
      if ($rid) {
        $roleAssign = $rbac->assignRoleToUser($username, $rid);
        if (!$roleAssign) throw new Exception('Unable to assign role.');
      }
      if ($gid) {
        $groupAssign = $rbac->assignUserToGroup($username, $gid);
        if (!$groupAssign) throw new Exception('Unable to assign group.');
      }
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateUser() {
    try {
      $username  = $this->postv('username');
      $nusername = $this->postv('nusername');
      $name      = $this->postv('name');
      $password  = $this->postv('password');
      $userService = new UserService();
      $result = $userService->updateUser($username, $nusername, $name, $password);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getUser($username = '') {
    try {
      $username = urldecode($username);
      $userService = new UserService();
      $user = $userService->selectUser($username);
      CoreResult::instance($user)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getUserDetail($username = '') {
    try {
      $username = urldecode($username);
      $userService = new UserService();
      $roleService = new RoleService();
      $groupService = new GroupService();
      $user = $userService->selectUser($username);
      $user->roles = $roleService->getRolesOfUser($user->username);
      $user->groups = $groupService->getGroupsOfUser($user->username);
      CoreResult::instance($user)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getUsers($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $created = $this->postv('created');
      $userService = new UserService();
      $users = $userService->getRBACUsers($keyword, $page, $perpage, $created);
      CoreResult::instance($users)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getUsersCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $userService = new UserService();
      $count = $userService->getUsersCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteUser() {
    try {
      $username = $this->postv('username', '');
      $userService = new UserService();
      $result = $userService->deleteUser($username);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteUsers() {
    try {
      $usernames = $this->postv('usernames', '');
      $userService = new UserService();
      $result = $userService->deleteUsers($usernames);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }














  function applyRoleToUsers() {
    try {
      $rid = $this->postv('rid');
      $usernames = $this->postv('usernames');
      $rbacService = new RBACService();
      $result = $rbacService->assignRoleToUsers($usernames, $rid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function revokeRoleFromUsers() {
    try {
      $rid = $this->postv('rid');
      $usernames = $this->postv('usernames');
      $rbacService = new RBACService();
      $result = $rbacService->unassignRoleFromUsers($usernames, $rid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function applyGroupToUsers() {
    try {
      $gid = $this->postv('gid');
      $usernames = $this->postv('usernames');
      $rbacService = new RBACService();
      $result = $rbacService->assignUsersToGroup($usernames, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function revokeGroupFromUsers() {
    try {
      $gid = $this->postv('gid');
      $usernames = $this->postv('usernames');
      $rbacService = new RBACService();
      $result = $rbacService->unassignUsersFromGroup($usernames, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

















  function getModuleSettings($module) {
    try {
      $sidebarMenuDefinition = CORE_APP_PATH . "module" . DS . urldecode($module) . DS . "sidebar.menu.json";
      $functionDefinition    = CORE_APP_PATH . "module" . DS . urldecode($module) . DS . "function.ini"; 
      $settings = new stdClass;
      $settings->app      = $module;
      $settings->menu     = file_exists($sidebarMenuDefinition) ? json_decode(file_get_contents($sidebarMenuDefinition)) : [];
      $settings->function = file_exists($functionDefinition) ? parse_ini_file($functionDefinition) : [];
      if (!is_array($settings->menu)) $settings->menu = array($settings->menu);
      CoreResult::instance($settings)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }










  function signIn() {
    try {
      $userService = new UserService();
      $username = $this->postv('username');
      $password = $this->postv('password');
      $result = $userService->getRBACUser($username, $password);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}