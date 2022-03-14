<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class KitBuildApiController extends CoreApi {

  function saveConceptMap() {
    if (!$this->postv('data')) {
      CoreError::instance('Invalid data.')->show();
      return;
    }
    $data = json_decode(CoreApi::decompress($this->postv('data'))); // var_dump($data);
    $cmService = new ConceptMapService();
    try {
      if (!$data->cmid) {
        $conceptMap = $cmService->insert(
          $data->cmfid, 
          $data->title, 
          $data->direction, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->topic, 
          $data->text, 
          $data->author, 
          $data->create_time);
      } else {
        $conceptMap = $cmService->update(
          $data->cmid, 
          $data->cmfid, 
          $data->title, 
          $data->direction, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->topic, 
          $data->text, 
          $data->author, 
          $data->create_time);
      }
      CoreResult::instance($conceptMap)->show();
    } catch(Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTopicList() {
    try {
      $tService = new TopicService();
      $result = $tService->getTopicList();
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

   function getTopicListOfGroups($groupIds = null) {
    try {
      $gids = $this->postv('gids', []);
      $gids = array_merge($gids, $groupIds ? explode(',', $groupIds) : []);
      $tService = new TopicService();
      $result = $tService->getTopicListOfGroups($gids);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getConceptMapListByTopic($tid = null) {
    try {
      $cmService = new ConceptMapService();
      $result = $cmService->getConceptMapListByTopic($tid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function openConceptMap($cmid = null) {
    try {
      $cmService = new ConceptMapService();
      $result = $cmService->getConceptMap($cmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }




  /**
   * Kit
   */

  function saveKitMap() {
    if (!$this->postv('data')) {
      CoreError::instance('Invalid data.')->show();
      return;
    }
    $data = json_decode(CoreApi::decompress($this->postv('data'))); // var_dump($data);
    $kitService = new KitMapService();

    // var_dump($data);

    try {
      $kitMap = new stdClass;
      if (!$data->kid) {
        $kitMap = $kitService->insert(
          $data->kfid, 
          $data->name, 
          $data->layout, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->enabled, 
          $data->author, 
          $data->cmid, 
        );
      } else {
        $kitMap = $kitService->update(
          $data->kid, 
          $data->kfid, 
          $data->name, 
          $data->layout, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->enabled, 
          $data->author, 
          $data->cmid
        );
      }
      $cmService = new ConceptMapService();
      $kitMap->conceptMap = $cmService->getConceptMap($data->cmid);
      CoreResult::instance($kitMap)->show();
    } catch(Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function openKitMap($kid = null) {
    try {
      $kitService = new KitMapService();
      $cmService = new ConceptMapService();
      $kitMap = $kitService->getKitMap($kid);
      $kitMap->conceptMap = $cmService->getConceptMap($kitMap->map->cmid);
      CoreResult::instance($kitMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateKitOption() {
    try {
      $kitService = new KitMapService();
      $cmService  = new ConceptMapService();
      $kid    = $this->postv('kid');
      $option = $this->postv('option');
      if (!$option) $option = null;
      $kitService->updateKitMapOption($kid, $option);
      $kitMap = $kitService->getKitMap($kid);
      $kitMap->conceptMap = $cmService->getConceptMap($kitMap->map->cmid);
      CoreResult::instance($kitMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKitListByConceptMap($cmid) {
    try {
      $kitService = new KitMapService();
      $result     = $kitService->getKitListByConceptMap($cmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKitListOfGroups($groupIds = null) {
    try {
      $gids = $this->postv('gids', []);
      $gids = array_merge($gids, $groupIds ? explode(',', $groupIds) : []);
      $kitService = new KitMapService();
      $result = $kitService->getKitListOfGroups($gids);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKitSets() {
    try {
      $kitMapService = new KitMapService();
      $kid         = $this->postv('kid');
      $result = $kitMapService->getSets($kid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function saveSets() {
    try {
      $kitMapService = new KitMapService();
      $kid         = $this->postv('kid');
      $sets        = $this->postv('sets');
      $concepts    = $this->postv('concepts', []);
      $links       = $this->postv('links', []);
      $sourceEdges = $this->postv('sourceEdges', []);
      $targetEdges = $this->postv('targetEdges', []);
      $result = $kitMapService->saveSets($kid, $sets, $concepts, $links, $sourceEdges, $targetEdges);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function removeSets() {
    try {
      $kitMapService = new KitMapService();
      $kid           = $this->postv('kid');
      $result        = $kitMapService->removeSets($kid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }






  /**
   * Learnermap
   */

  function saveLearnerMap() {
    if (!$this->postv('data')) {
      CoreError::instance('Invalid data.')->show();
      return;
    }
    $data = json_decode(CoreApi::decompress($this->postv('data'))); // var_dump($data);
    $lmService = new LearnerMapService();

    try {
      $learnerMap = new stdClass;
      if (!$data->lmid) {
        $learnerMap = $lmService->insert(
          $data->kid, 
          $data->author, 
          $data->type, 
          $data->cmid, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->data
        );
      } else {
        $learnerMap = $lmService->update(
          $data->lmid, 
          $data->kid, 
          $data->author, 
          $data->type,
          $data->cmid,
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->data
        );
      }
      CoreResult::instance($learnerMap)->show();
    } catch(Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function saveLearnerMapExtended() {
    if (!$this->postv('data')) {
      CoreError::instance('Invalid data.')->show();
      return;
    }
    $data = json_decode(CoreApi::decompress($this->postv('data'))); // var_dump($data);
    $lmService = new LearnerMapService();

    try {
      $learnerMap = new stdClass;
      $learnerMapExtended = new stdClass;
      if (!$data->lmid) {
        $learnerMap = $lmService->insert(
          $data->kid, 
          $data->author, 
          $data->type, 
          $data->cmid, 
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->data
        );
        // var_dump($learnerMap->map);
        $learnerMapExtended = $lmService->insertExtensions(
          $learnerMap->map->lmid, 
          $data->concepts_ext, 
          $data->links_ext, 
          $data->linktargets_ext
        );
      } else {
        $learnerMap = $lmService->update(
          $data->lmid, 
          $data->kid, 
          $data->author, 
          $data->type,
          $data->cmid,
          $data->concepts, 
          $data->links, 
          $data->linktargets, 
          $data->create_time,
          $data->data
        );
        // var_dump($data); 
        $learnerMapExtended = $lmService->updateExtensions(
          $data->lmid, 
          $data->concepts_ext, 
          $data->links_ext, 
          $data->linktargets_ext
        );
      }
      // var_dump($learnerMapExtended);
      CoreResult::instance($learnerMapExtended)->show();
    } catch(Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function openLearnerMap($lmid = null) {
    try {
      $lmService = new LearnerMapService();
      $learnerMap = $lmService->getLearnerMap($lmid);
      CoreResult::instance($learnerMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function openExtendedLearnerMap($lmid = null) {
    try {
      $lmService = new LearnerMapService();
      $learnerMap = $lmService->getExtendedLearnerMap($lmid);
      CoreResult::instance($learnerMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLastDraftLearnerMapOfUser() {
    try {
      $username = $this->postv('username');
      $kid = $this->postv('kid');
      $lmService = new LearnerMapService();
      $learnerMap = $lmService->getLastDraftLearnerMapOfUser($username, $kid);
      CoreResult::instance($learnerMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLastDraftExtendedLearnerMapOfUser() {
    try {
      $username = $this->postv('username');
      $kid = $this->postv('kid');
      $lmService = new LearnerMapService();
      $learnerMap = $lmService->getLastDraftExtendedLearnerMapOfUser($username, $kid);
      CoreResult::instance($learnerMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}