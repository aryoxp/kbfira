<?php

class AppModuleApiController extends ModuleApiController {
  function getAppSettings($app) {
    try {
      $registerService = new RegisterService();
      $settings = new stdClass;
      $settings->app      = $app;
      $settings->menu     = $registerService->getRegisteredAuthMenu($app);
      $settings->function = $registerService->getRegisteredAuthFunction($app);
      if (!is_array($settings->menu)) $settings->menu = array($settings->menu);
      CoreResult::instance($settings)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }
}

?>