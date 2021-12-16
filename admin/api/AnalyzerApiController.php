<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class AnalyzerApiController extends CoreApi {

  function getLearnerMapsOfConceptMap($cmid) {
    try {
      $lmService = new LearnerMapService();
      $learnerMaps = $lmService->getLearnerMapsOfConceptMap($cmid);
      CoreResult::instance($learnerMaps)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}