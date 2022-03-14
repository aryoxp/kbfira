<?php

class UserApiController extends ModuleApiController {

  function uploadUserCSV() {
    $csv = $_FILES['csv'];
    if($csv['error'] != 0) {
      CoreError::instance('Upload Error.')->show();
      exit;
    }
    $handle = fopen($csv['tmp_name'],'r');
    $bom = "\xef\xbb\xbf";
    // Progress file pointer and get first 3 characters to compare to the BOM string.
    if (fgets($handle, 4) !== $bom) // BOM not found - rewind pointer to start of file.
      rewind($handle);

    $userService = new UserService();
    $rbacService = new RBACService();
    $i = 0;
    $results = [];
    while ( ($data = fgetcsv($handle) ) !== FALSE ) {
      if($i == 0 && $data[0] == "username") {
        $i++;
        continue;
      }
      $username = $data[0];
      $name = $data[1];
      $password = $data[2];
      $roles = explode(",", $data[3]);
      $groups = explode(",", $data[4]);
      $entry = new stdClass();
      $entry->index = $i;
      $entry->username = $username;
      $entry->data = [
        'username' => $username,
        'name' => $name,
        'password' => $password,
        'roles' => $roles,
        'groups' => $groups
      ];
      $entry->errors = [];
      try {
        $user = $userService->insertUser($username, $name, $password);
      } catch (Exception $ex) {
        $entry->errors[] = $ex->getMessage();
      }
      foreach ($roles as $role) {
        try {
          $rbacService->assignRoleToUser($username, $role);
        } catch (Exception $ex) {
          $entry->errors[] = "Role: $role, Error: " . $ex->getMessage();
        }
      }
      foreach ($groups as $group) {
        try {
          $rbacService->assignUserToGroup($username, $group);
        } catch (Exception $ex) {
          $entry->errors[] = "Group: $group, Error: " . $ex->getMessage();
        }
      }
      $entry->status = count($entry->errors) == 0 ? "OK" : "NOK";
      $results[] = $entry;
      $i++;
    }
    CoreResult::instance($results)->show();
  }

}