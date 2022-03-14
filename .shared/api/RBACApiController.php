<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

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

  function getRoleAuthApp($rid = '') {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getRoleAuthApp($rid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRoleAuthAppMenu($rid = '', $app = '') {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getRoleAuthAppMenu($rid, $app);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getRoleAuthAppFunction($rid = '', $app = '') {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getRoleAuthAppFunction($rid, $app);
      CoreResult::instance($result)->show();
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

  function grantRoleApp() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $rbacService = new RBACService();
      $result = $rbacService->grantRoleApp($rid, $app);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function revokeRoleApp() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $rbacService = new RBACService();
      $result = $rbacService->revokeRoleApp($rid, $app);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function grantRoleMenu() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $mid = $this->postv('mid');
      $rbacService = new RBACService();
      $result = $rbacService->grantRoleMenu($rid, $app, $mid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function revokeRoleMenu() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $mid = $this->postv('mid');
      $rbacService = new RBACService();
      $result = $rbacService->revokeRoleMenu($rid, $app, $mid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function grantRoleFunction() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $fid = $this->postv('fid');
      $rbacService = new RBACService();
      $result = $rbacService->grantRoleFunction($rid, $app, $fid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function revokeRoleFunction() {
    try {
      $rid = $this->postv('rid');
      $app = $this->postv('app');
      $fid = $this->postv('fid');
      $rbacService = new RBACService();
      $result = $rbacService->revokeRoleFunction($rid, $app, $fid);
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

  function updateUserProfile() {
    try {
      $username = $this->postv('username');
      $name     = $this->postv('name');
      $userService = new UserService();
      $user = $userService->updateUserProfile($username, $name);
      $result = $userService->getRBACUser($user->username);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function changeUserPassword() {
    try {
      $username        = $this->postv('username');
      $password        = $this->postv('password');
      $currentPassword = $this->postv('currentPassword');
      $userService = new UserService();
      $result = $userService->changeUserPassword($username, $password, $currentPassword);
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

  function getUserListOfGroups($groupIds = null) {
    try {
      $gids = $this->postv('gids', []);
      $gids = array_merge($gids, $groupIds ? explode(',', $groupIds) : []);
      $userService = new UserService();
      $result = $userService->getUserListOfGroups($gids);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignUserToGroup() {
    try {
      $gid = $this->postv('gid');
      $username = $this->postv('username');
      $rbac = new RBACService();
      $result = $rbac->assignUserToGroup($username, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deassignUserFromGroup() {
    try {
      $gid = $this->postv('gid');
      $username = $this->postv('username');
      $kitService = new RBACService();
      $result = $kitService->unassignUserFromGroup($username, $gid);
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

















  function getModules() {
    try {
      $modulesDir = CORE_APP_PATH . "module" . DS;
      $runtimeModules = CORE_APP_PATH . "runtime" . DS . "modules.ini";
      $activeModules = parse_ini_file($runtimeModules);
  
      $data['active-modules'] = isset($activeModules['modules']) ? $activeModules['modules'] : [];
      $data['modules'] = array_diff(scandir($modulesDir), array('.', '..')); // var_dump($dirs);
      $data['modules'] = preg_grep('/^\./i', $data['modules'], PREG_GREP_INVERT);
      CoreResult::instance($data)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getModuleSettings($module) {
    try {
      $sidebarMenuDefinition = CORE_APP_PATH . "module" . DS . urldecode($module) . DS . "sidebar.menu.json";
      $functionDefinition    = CORE_APP_PATH . "module" . DS . urldecode($module) . DS . "fun.json"; 
      $settings = new stdClass;
      $settings->app      = $module;
      $settings->menu     = file_exists($sidebarMenuDefinition) ? json_decode(file_get_contents($sidebarMenuDefinition)) : [];
      $settings->function = file_exists($functionDefinition) ? json_decode(file_get_contents($functionDefinition)) : [];
      if (!is_array($settings->menu)) $settings->menu = array($settings->menu);
      CoreResult::instance($settings)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getRegisteredApps() {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getRegisteredApps();
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getAppMenu($app = null) {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getAppMenu($app);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getAppFunction($app = null) {
    try {
      $rbacService = new RBACService();
      $result = $rbacService->getAppFunction($app);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getModuleMenu($module = null) {
    try {
      $sidebarMenuDefinition = CORE_APP_PATH . "module" . DS . $module . DS . "sidebar.menu.json";
      $result = json_decode(file_get_contents($sidebarMenuDefinition));
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function getModuleFunction($module = null) {
    try {
      $functionDefinition = CORE_APP_PATH . "module" . DS . $module . DS . "fun.json";
      $result = file_exists($functionDefinition) ? 
        json_decode(file_get_contents($functionDefinition)) :
        [];
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function registerMenu() {
    try {
      $app = $this->postv('app');
      $menu = $this->postv('menu');
      $rbac = new RBACService();
      $result = $rbac->registerMenu($app, $menu);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
  function deregisterMenu() {
  }
  function registerFunction() {
    try {
      $app = $this->postv('app');
      $function = $this->postv('function');
      $rbac = new RBACService();
      $result = $rbac->registerFunction($app, $function);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }










  function signIn() {
    try {
      $userService = new UserService();
      $username = $this->postv('username');
      $password = $this->postv('password');
      $rids     = $this->postv('rids');
      $gids     = $this->postv('gids');
      $apps     = $this->postv('apps');
      $user = $userService->getRBACUser($username, $password);
      if ($user) {
        $rbacService = new RBACService();
        $user->auth = $rbacService->getUserAuth(explode(",", $user->rids));
        if ($gids) {
          $gids = explode(",", strtoupper($gids));
          $ugids = explode(",", $user->gids);
          if(!count(array_intersect($gids, $ugids))) throw CoreError::instance("Group authentication failed. Invalid group.");
        }
        if ($rids) {
          $rids = explode(",", strtoupper($rids));
          $urids = explode(",", $user->rids);
          if(!count(array_intersect($rids, $urids))) throw CoreError::instance("Role authentication failed. Invalid role.");
        }
        if ($apps) {
          $apps = explode(",", strtoupper($apps));
          $uapps = $user->auth->app;
          if(!count(array_intersect($apps, $uapps))) throw CoreError::instance("Application access is not authorized.");
        }
        CoreResult::instance($user)->show();
      } else throw CoreError::instance("Invalid username and/or password.");
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function register() {
    try {
      $userService = new UserService();
      $name     = $this->postv('name');
      $username = $this->postv('username');
      $password = $this->postv('password');
      $rid      = $this->postv('rid');
      $gid      = $this->postv('gid');
      $result = $userService->registerUser($name, $username, $password, $rid, $gid);
      $user = $userService->getRBACUser($username, $password);
      if ($user) {
        $rbacService = new RBACService();
        $user->auth = $rbacService->getUserAuth(explode(",", $user->rids));
      }
      CoreResult::instance($user)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}