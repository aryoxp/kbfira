<?php

class AppSetupApiController extends ModuleApiController {
  function checkDb($db) {
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

  function doSetupInitData() {
    try {
      $db = $this->postv('db');
      $setupService = new SetupService();
      $result = $setupService->doSetupInitData($db);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
}