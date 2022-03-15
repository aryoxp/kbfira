<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class ContentApiController extends CoreApi {

  function createTopic() {
    try {
      $tid     = $this->postv('tid');
      $title   = $this->postv('title');
      $enabled = $this->postv('enabled', 1);
      $text    = $this->postv('text');
      $data    = $this->postv('data');
      $topicService = new TopicService();
      $result = $topicService->insertTopic($tid, $title, $enabled, $text, $data);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateTopic() {
    try {
      $tid     = $this->postv('tid');
      $ntid    = $this->postv('ntid');
      $title   = $this->postv('title');
      $enabled = $this->postv('enabled', 1);
      $text    = $this->postv('text');
      $data    = $this->postv('data');
      $topicService = new TopicService();
      $result = $topicService->updateTopic($tid, $ntid, $title, $enabled, $text, $data);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTopic($tid = '') {
    try {
      $tid = urldecode($tid);
      $topicService = new TopicService();
      $topic = $topicService->selectTopic($tid);
      CoreResult::instance($topic)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTopicDetail($tid = '') {
    try {
      $tid = urldecode($tid);
      $topicService = new TopicService();
      $topic = $topicService->selectTopic($tid);
      CoreResult::instance($topic)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTopics($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $topicService = new TopicService();
      $topics = $topicService->getTopics($keyword, $page, $perpage);
      CoreResult::instance($topics)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTopicsCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $topicService = new TopicService();
      $count = $topicService->getTopicsCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteTopic() {
    try {
      $tid = $this->postv('tid', '');
      $topicService = new TopicService();
      $result = $topicService->deleteTopic($tid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignTopicToConceptMap() {
    try {
      $cmid = $this->postv('cmid');
      $tid = $this->postv('tid');
      $cmService = new ConceptMapService();
      $result = $cmService->assignTopicToConceptMap($cmid, $tid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deassignTopicFromConceptMap() {
    try {
      $cmid = $this->postv('cmid');
      $cmService = new ConceptMapService();
      $result = $cmService->deassignTopicFromConceptMap($cmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignTopicToGroup() {
    try {
      $gid = $this->postv('gid');
      $tid = $this->postv('tid');
      $topicService = new TopicService();
      $result = $topicService->assignTopicToGroup($tid, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deassignTopicFromGroup() {
    try {
      $gid = $this->postv('gid');
      $tid = $this->postv('tid');
      $topicService = new TopicService();
      $result = $topicService->deassignTopicFromGroup($tid, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignTextToTopic() {
    try {
      $tid = $this->postv('tid');
      $tpid = $this->postv('tpid');
      $topicService = new TopicService();
      $result = $topicService->assignTextToTopic($tid, $tpid);
      $topic = $topicService->selectTopic($tpid);
      CoreResult::instance($topic)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignTextToKitMap() {
    try {
      $tid = $this->postv('tid');
      $kid = $this->postv('kid');
      $kitService = new KitMapService();
      $cmService = new ConceptMapService();
      $result = $kitService->assignTextToKitMap($tid, $kid);
      $kitMap = $kitService->getKitMap($kid);
      $kitMap->conceptMap = $cmService->getConceptMap($kitMap->map->cmid);
      CoreResult::instance($kitMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function unassignTextFromTopic() {
    try {
      $tid = $this->postv('tid');
      $topicService = new TopicService();
      $result = $topicService->unassignTextFromTopic($tid);
      $topic = $topicService->selectTopic($tid);
      CoreResult::instance($topic)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function unassignTextFromKitMap() {
    try {
      $kid = $this->postv('kid');
      $kitService = new KitMapService();
      $cmService = new ConceptMapService();
      $result = $kitService->unassignTextFromKitMap($kid);
      $kitMap = $kitService->getKitMap($kid);
      $kitMap->conceptMap = $cmService->getConceptMap($kitMap->map->cmid);
      CoreResult::instance($kitMap)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }









  function createText() {
    try {
      $title   = $this->postv('title');
      $type    = $this->postv('type', 'markdown');
      $content = $this->postv('content');
      $nlp     = $this->postv('nlp');
      $data    = $this->postv('data');
      $textService = new TextService();
      $result = $textService->insertText($title, $type, $content, $nlp, $data);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateText() {
    try {
      $tid     = $this->postv('tid');
      $type    = $this->postv('type', 'markdown');
      $title   = $this->postv('title');
      $content = $this->postv('content');
      $nlp     = $this->postv('nlp');
      $data    = $this->postv('data');
      $textService = new TextService();
      $result = $textService->updateText($tid, $title, $type, $content, $nlp, $data);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function updateTextNlp() {
    try {
      $tid     = $this->postv('tid');
      $nlp     = $this->postv('nlp');
      $textService = new TextService();
      $result = $textService->updateTextNlp($tid, $nlp);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getText($tid = '') {
    try {
      $tid = urldecode($tid);
      $textService = new TextService();
      $text = $textService->selectText($tid);
      CoreResult::instance($text)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTextDetail($tid = '') {
    try {
      $tid = urldecode($tid);
      $textService = new TextService();
      $text = $textService->selectText($tid);
      CoreResult::instance($text)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTexts($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $textService = new TextService();
      $texts = $textService->getTexts($keyword, $page, $perpage);
      CoreResult::instance($texts)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getTextsCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $textService = new TextService();
      $count = $textService->getTextsCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteText() {
    try {
      $tid = $this->postv('tid', '');
      $textService = new TextService();
      $result = $textService->deleteText($tid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignTextToConceptMap() {
    try {
      $cmid = $this->postv('cmid');
      $tid = $this->postv('tid');
      $cmService = new ConceptMapService();
      $result = $cmService->assignTextToConceptMap($cmid, $tid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deassignTextFromConceptMap() {
    try {
      $cmid = $this->postv('cmid');
      $cmService = new ConceptMapService();
      $result = $cmService->deassignTextFromConceptMap($cmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deleteConceptMap() {
    try {
      $cmid = $this->postv('cmid');
      $cmService = new ConceptMapService();
      $result = $cmService->deleteConceptMap($cmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }








  function searchConceptMap($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $cmService = new ConceptMapService();
      $cmaps = $cmService->searchConceptMaps($keyword, $page, $perpage);
      $count = $cmService->searchConceptMapsCount($keyword, $page, $perpage);
      $result = new stdClass;
      $result->cmaps = $cmaps;
      $result->count = $count;
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getConceptMapsByTopicId() {
    try {
      $tid = $this->postv('tid');
      $cmService = new ConceptMapService();
      $cmaps = $cmService->getConceptMapListByTopic($tid);
      CoreResult::instance($cmaps)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }




  /* Kit */

  function deleteKit() {
    try {
      $kid = $this->postv('kid');
      $kitService = new KitMapService();
      $result = $kitService->delete($kid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKit($kid = null) {
    try {
      $kitService = new KitMapService();
      $result = $kitService->getKit($kid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKits($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $kitService = new KitMapService();
      $kits = $kitService->getKits($keyword, $page, $perpage);
      CoreResult::instance($kits)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getKitsCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $kitService = new KitMapService();
      $count = $kitService->getKitsCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function assignKitToGroup() {
    try {
      $gid = $this->postv('gid');
      $kid = $this->postv('kid');
      $kitService = new KitMapService();
      $result = $kitService->assignKitToGroup($kid, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function deassignKitFromGroup() {
    try {
      $gid = $this->postv('gid');
      $kid = $this->postv('kid');
      $kitService = new KitMapService();
      $result = $kitService->deassignKitFromGroup($kid, $gid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }








  /* Learnermap */

  function deleteLearnermap() {
    try {
      $lmid = $this->postv('lmid');
      $learnermapService = new LearnermapService();
      $result = $learnermapService->delete($lmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLearnermap($lmid = null) {
    try {
      $learnermapService = new LearnermapService();
      $result = $learnermapService->getLearnermap($lmid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLearnermapsOfKit($kid) {
    try {
      $learnermapService = new LearnermapService();
      $result = $learnermapService->getLearnerMapListByKit($kid);
      CoreResult::instance($result)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLearnermaps($page = 1, $perpage = 10) {
    try {
      $keyword = $this->postv('keyword', '');
      $learnermapService = new LearnermapService();
      $learnermaps = $learnermapService->searchLearnermaps($keyword, $page, $perpage);
      CoreResult::instance($learnermaps)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

  function getLearnermapsCount() {
    try {
      $keyword = $this->postv('keyword', '');
      $learnermapService = new LearnermapService();
      $count = $learnermapService->searchLearnermapsCount($keyword);
      CoreResult::instance($count)->show();
    } catch (Exception $ex) {
      CoreError::instance($ex->getMessage())->show();
    }
  }

}