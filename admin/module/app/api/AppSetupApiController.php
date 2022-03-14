<?php

class AppSetupApiController extends ModuleApiController {
  function checkDb($db) {
    // var_dump($db);exit;
    try {
      $setupService = new SetupService();
      $result = $setupService->checkDb($db);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getServerInfo($db) {
    try {
      $setupService = new SetupService();
      $result = $setupService->getServerInfo($db);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function doSetup($db) {
    try {
      $setupService = new SetupService();
      $result = $setupService->doSetup($db);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
}