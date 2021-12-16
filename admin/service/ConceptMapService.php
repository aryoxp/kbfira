<?php

class ConceptMapService extends CoreService {

  function insert($cmfid, $title, $direction, $concepts = [], $links = [], $linktargets = [], $topic = null, $text = null, $author = null, $create_time = null) {
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
    $insert['text']        = QB::esc($text);
    $insert['topic']       = QB::esc($topic);
    // var_dump(gettype(reset($inserts)) == "array");
    // var_dump(gettype(reset($insert)) == "array");
    $db = self::instance("kbv2");
    // var_dump($qb, $db);
    try {
      $db->begin();

      $qb = QB::instance('conceptmap')->insert($insert);
      $db->query($qb->get());
      $cmid = $db->getInsertId();
      // var_dump($cmid);

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['cmid'] = $cmid;
        $c['label'] = QB::esc($c['label']);
        $c['data'] = QB::esc($c['data']);
      }

      // var_dump($concepts);

      $qb = QB::instance('concept')->insert($concepts);
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
      $qb = QB::instance('link')->insert($links);
      $db->query($qb->get());

      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      $qb = QB::instance('linktarget')->insert($linktargets);
      $db->query($qb->get());

      $conceptMap = $this->getConceptMap($cmid);
      
      $db->commit();
      return $conceptMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function update($cmid, $cmfid, $title, $direction, $concepts = [], $links = [], $linktargets = [], $topic = null, $text = null, $author = null, $create_time = null) {
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
    $insert['text']        = QB::esc($text);
    $insert['topic']       = QB::esc($topic);

    $update['cmfid']       = QB::esc($cmfid);
    $update['title']       = QB::esc($title);
    $update['author']      = QB::esc($author);
    $update['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $update['direction']   = QB::esc($direction);
    $update['text']        = QB::esc($text);
    $update['topic']       = QB::esc($topic);
    
    $db = self::instance("kbv2");
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
      $db = self::instance('kbv2');
      $qb = QB::instance('conceptmap');
      $qb->select()->where('topic', $topicId);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getConceptMap($cmid) {
    try {
      $db = self::instance('kbv2');
      
      $result = new stdClass;
      
      $qb = QB::instance('conceptmap');
      $qb->select()->where('cmid', QB::esc($cmid));
      $result->map = $db->getRow($qb->get());
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

}