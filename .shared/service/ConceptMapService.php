<?php

class ConceptMapService extends CoreService {

  function insert($cmfid, $title, $direction, $type = null, $concepts = [], $links = [], $linktargets = [], $topic = null, $text = null, $author = null, $create_time = null) {
    /**
     * $cmid: auto
     * $concept : {
     *  cid: auto, cmid: int, label: string, 
     *  x: int, y: int, data?: JSON string
     * }
     * $link : {
     *  lid: string, cmid: int, label: string,
     *  x: int, y: int, data?: JSON string,
     *  // Source Edge:
     *  source_cid?: string, source_cmid?: int,
     *  source_data?: JSON string
     * }
     * $linktarget : {
     *  // Link keys:
     *  lid: string, cmid: int,
     *  // Target Edge:
     *  target_cmid: int, target_data?: JSON string
     * }
     * 
     * CONSTRAINT
     * cmid, source_cmid, target_cmid MUST have equal value.
     */
    $insert['cmfid']       = QB::esc($cmfid);
    $insert['title']       = QB::esc($title);
    $insert['author']      = QB::esc($author);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['direction']   = QB::esc($direction);
    $insert['type']        = QB::esc($type);
    $insert['text']        = QB::esc($text);
    $insert['topic']       = QB::esc($topic);
    // var_dump(gettype(reset($inserts)) == "array");
    // var_dump(gettype(reset($insert)) == "array");
    $db = self::instance();
    // var_dump($qb, $db);
    try {
      $db->begin();

      $qb = QB::instance('conceptmap')->insert($insert);
      $db->query($qb->get());
      $cmid = $db->getInsertId();
      // var_dump($cmid);

      if ($concepts) {
        foreach($concepts as &$c) {
          $c = (array)$c;
          $c['cmid'] = $cmid;
          $c['label'] = QB::esc($c['label']);
          $c['data'] = QB::esc($c['data']);
        }
        $qb = QB::instance('concept')->insert($concepts);
        $db->query($qb->get());
      }

      // Preparing links and its source edge
      if ($links) {
        foreach($links as &$l) {
          $l = (array)$l;
          $l['cmid'] = $cmid;
          $l['label'] = QB::esc($l['label']);
          $l['data'] = QB::esc($l['data']);
          if ($l['source_cid']) {
            $l['source_cmid'] = $cmid;
            $l['source_data'] = QB::esc($l['source_data']);
          }
        }
        $qb = QB::instance('link')->insert($links);
        $db->query($qb->get());
      }

      // Preparing linktarget edges
      if ($linktargets) {
        foreach($linktargets as &$l) {
          $l = (array)$l;
          $l['cmid'] = $cmid;
          $l['target_cmid'] = $cmid;
          $l['target_data'] = QB::esc($l['target_data']);
        }
        $qb = QB::instance('linktarget')->insert($linktargets);
        $db->query($qb->get());
      }

      $conceptMap = $this->getConceptMap($cmid);
      
      $db->commit();
      return $conceptMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function update($cmid, $cmfid, $title, $direction, $type = null, $concepts = [], $links = [], $linktargets = [], $topic = null, $text = null, $author = null, $create_time = null) {
    /**
     * $cmid: auto
     * $concept : {
     *  cid: auto, cmid: int, label: string, 
     *  x: int, y: int, data?: JSON string
     * }
     * $link : {
     *  lid: string, cmid: int, label: string,
     *  x: int, y: int, data?: JSON string,
     *  // Source Edge:
     *  source_cid?: string, source_cmid?: int,
     *  source_data?: JSON string
     * }
     * $linktarget : {
     *  // Link keys:
     *  lid: string, cmid: int,
     *  // Target Edge:
     *  target_cmid: int, target_data?: JSON string
     * }
     * 
     * CONSTRAINT
     * cmid, source_cmid, target_cmid MUST have equal value.
     */
    $insert['cmid']        = QB::esc($cmid);
    $insert['cmfid']       = QB::esc($cmfid);
    $insert['title']       = QB::esc($title);
    $insert['author']      = QB::esc($author);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['direction']   = QB::esc($direction);
    
    if ($text !== null)  $insert['text']  = QB::esc($text);
    if ($topic !== null) $insert['topic'] = QB::esc($topic);
    if ($type !== null)  $insert['type']  = QB::esc($type);

    $update['cmfid']       = QB::esc($cmfid);
    $update['title']       = QB::esc($title);
    $update['author']      = QB::esc($author);
    $update['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $update['direction']   = QB::esc($direction);
    
    if ($text !== null)  $update['text']  = QB::esc($text);
    if ($topic !== null) $update['topic'] = QB::esc($topic);
    if ($type !== null)  $update['type']  = QB::esc($type);

    $db = self::instance();
    try {
      $db->begin();

      $qb = QB::instance('conceptmap')->insert($insert, $update);
      $db->query($qb->get());

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['cmid'] = $cmid;
        $c['label'] = QB::esc($c['label']);
        $c['data'] = QB::esc($c['data']);
      }
      if (count($concepts)) {
        $qb = QB::instance('concept')->insert($concepts, true);
        $db->query($qb->get());
      }

      // Removing now inexistent concepts
      $qb = QB::instance('concept')->delete();
      $qb->where('cmid', $cmid);
      if (count($concepts)) {
        $newConcepts = array_map(function($concept) {
          return QB::OG . QB::qt($concept['cmid']) . ", "
          . QB::qt($concept['cid']) . QB::EG;
        }, $concepts);
        $conceptKeys = ['cmid', 'cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $conceptKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newConcepts) . QB::EG));
      }
      $db->query($qb->get());

      // Preparing links and its source edge
      foreach($links as &$l) {
        $l = (array)$l;
        $l['cmid'] = $cmid;
        $l['label'] = QB::esc($l['label']);
        $l['data'] = QB::esc($l['data']);
        if ($l['source_cid']) {
          $l['source_cmid'] = $cmid;
          $l['source_data'] = QB::esc($l['source_data']);
        }
      }
      if (count($links)) {
        $qb = QB::instance('link')->insert($links, true);
        $db->query($qb->get());
      }

      // Removing now inexistent links
      $qb = QB::instance('link')->delete();
      $qb->where('cmid', $cmid);
      if (count($links)) {
        $newLinks = array_map(function($link) {
          return QB::OG . QB::qt($link['cmid']) . ", "
          . QB::qt($link['lid']) . QB::EG;
        }, $links);
        $linkKeys = ['cmid', 'lid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linkKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinks) . QB::EG));
      }
      $db->query($qb->get());


      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      if (count($linktargets)) {
        $qb = QB::instance('linktarget')->insert($linktargets, true);
        $db->query($qb->get());
      }

      // Removing now inexistent linktarget edges
      $qb = QB::instance('linktarget')->delete();
      $qb->where('cmid', $cmid);
      if (count($linktargets)) {
        $newLinktargets = array_map(function($linktarget) {
          return QB::OG . QB::qt($linktarget['cmid']) . ", "
          . QB::qt($linktarget['lid']) . ", "
          . QB::qt($linktarget['target_cmid']) . ", "
          . QB::qt($linktarget['target_cid']) . QB::EG;
        }, $linktargets);
        $linktargetKeys = ['cmid', 'lid', 'target_cmid', 'target_cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linktargetKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinktargets) . QB::EG));
      }
      $db->query($qb->get());
      
      $conceptMap = $this->getConceptMap($cmid);

      $db->commit();
      return $conceptMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function getConceptMapListByTopic($topicId = null) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap c')
        ->leftJoin('user u', 'u.username', 'c.author');
      $qb->select()->where('c.topic', QB::esc($topicId));

      // filter to show concept maps that were created by configured role(s)
      if ($rid = Core::lib("config")->get('filter_kit_author_role')) {
        $rids = explode(",", QB::esc($rid));
        $rids = array_map(function($r) { // wrap with single-quote
          return QB::qt($r);
        }, $rids);
        $sqb = QB::instance('user_role')
          ->select('username')
          ->where('rid', QB::IN, QB::raw(QB::OG . implode(", ", $rids) . QB::EG));
        $qb->where('c.author', QB::IN, QB::raw(QB::OG . $sqb->get() . QB::EG));
      }

      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getUserConceptMapListByTopic($username, $topicId = null) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap');
      $qb->select()
        ->where('topic', QB::esc($topicId))
        ->where('author', QB::esc($username));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getConceptMap($cmid) {
    try {
      $db = self::instance();
      
      $result = new stdClass;
      
      $qb = QB::instance('conceptmap');
      $qb->select()->where('cmid', QB::esc($cmid));
      $result->map = $db->getRow($qb->get());
      
      if (!$result->map) return null;
      
      $qb = QB::instance('concept');
      $qb->select()->where('cmid', QB::esc($cmid));
      $result->concepts = $db->query($qb->get());
      $qb = QB::instance('link');
      $qb->select()->where('cmid', QB::esc($cmid));
      $result->links = $db->query($qb->get());
      $qb = QB::instance('linktarget');
      $qb->select()->where('cmid', QB::esc($cmid));
      $result->linktargets = $db->query($qb->get());

      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function searchConceptMaps($keyword, $page = 1, $perpage = 10) {
    try {
      $keyword = "%" . QB::esc($keyword) . "%";
      $db = self::instance();
      $qb = QB::instance('conceptmap cm');
      $qb->select(QB::raw('cm.*'), 't.title AS topictitle')
        ->select(QB::raw('(SELECT COUNT(*) FROM kit k WHERE k.cmid = cm.cmid) AS nkit'))
        ->leftJoin('topic t', 'cm.topic', 't.tid')
        ->where('cmfid', 'LIKE', $keyword)
        ->where('cm.title', 'LIKE', $keyword, QB::OR)
        ->where('author', 'LIKE', $keyword, QB::OR)
        ->limit(($page - 1) * $perpage, $perpage);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function searchConceptMapsCount($keyword, $page = 1, $perpage = 10) {
    try {
      $keyword = "%" . QB::esc($keyword) . "%";
      $db = self::instance();
      $qb = QB::instance('conceptmap');
      $qb->select(QB::raw('COUNT(*) AS `count`'))
        ->where('cmfid', 'LIKE', $keyword)
        ->where('title', 'LIKE', $keyword, QB::OR)
        ->where('author', 'LIKE', $keyword, QB::OR);
      $result = $db->getVar($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function assignTopicToConceptMap($cmid, $tid) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap')
        ->update('topic', QB::esc($tid))
        ->where('cmid', QB::esc($cmid));
      $result = $db->query($qb->get());
      return $result && $db->getAffectedRows() ? true : false;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function deassignTopicFromConceptMap($cmid) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap')
        ->update('topic', null)
        ->where('cmid', QB::esc($cmid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function assignTextToConceptMap($cmid, $tid) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap')
        ->update('text', QB::esc($tid))
        ->where('cmid', QB::esc($cmid));
      $result = $db->query($qb->get());
      return $result && $db->getAffectedRows() ? true : false;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function deassignTextFromConceptMap($cmid) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap')
        ->update('text', null)
        ->where('cmid', QB::esc($cmid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function deleteConceptMap($cmid) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap')
        ->delete()
        ->where('cmid', QB::esc($cmid));
      $result = $db->query($qb->get());
      return $db->getAffectedRows();
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

}