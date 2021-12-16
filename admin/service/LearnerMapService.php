<?php

class LearnerMapService extends CoreService {

  function insert($kid, $author, $type, $cmid, $concepts = [], $links = [], $linktargets = [], $create_time = null, $data = null) {
    /**
     * $kid: auto
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
    $insert['kid']         = QB::esc($kid);
    $insert['author']      = QB::esc($author);
    $insert['type']        = QB::esc($type);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['data']        = QB::esc($data);
    
    $db = self::instance("kbv2");
    try {
      $db->begin();

      $qb = QB::instance('learnermap')->insert($insert);
      $db->query($qb->get());
      $lmid = $db->getInsertId();

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['lmid'] = $lmid;
        $c['cmid'] = $cmid;
        $c['data'] = QB::esc($c['data']);
        unset($c['label']);
      }

      // var_dump($concepts);
      if (count($concepts)) {
        $qb = QB::instance('learnermap_concept')->insert($concepts);
        $db->query($qb->get());
      }

      // Preparing links and its source edge
      foreach($links as &$l) {
        $l = (array)$l;
        $l['lmid'] = $lmid;
        $l['cmid'] = $cmid;
        $l['label'] = QB::esc($l['label']);
        $l['data'] = QB::esc($l['data']);
        if ($l['source_cid']) {
          $l['source_cmid'] = $cmid;
          $l['source_data'] = QB::esc($l['source_data']);
        }
        unset($l['label']);
      }
      
      // var_dump($links);
      if (count($links)) {
        $qb = QB::instance('learnermap_link')->insert($links);
        $db->query($qb->get());
      }

      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['lmid'] = $lmid;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      // var_dump($linktargets);
      if (count($linktargets)) {
        $qb = QB::instance('learnermap_linktarget')->insert($linktargets);
        $db->query($qb->get());
      }

      $learnerMap = $this->getLearnerMap($lmid);
      // var_dump($learnerMap);
      
      $db->commit();
      return $learnerMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function update($lmid, $kid, $author, $type, $cmid, $concepts = [], $links = [], $linktargets = [], $create_time = null, $data = null) {
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
    $insert['lmid']        = QB::esc($lmid);
    $insert['kid']         = QB::esc($kid);
    $insert['author']      = QB::esc($author);
    $insert['type']        = QB::esc($type);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['data']        = QB::esc($data);

    $update['kid']         = QB::esc($kid);
    $update['author']      = QB::esc($author);
    $update['type']        = QB::esc($type);
    $update['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $update['data']        = QB::esc($data);
    
    $db = self::instance("kbv2");
    try {
      $db->begin();

      $qb = QB::instance('learnermap')->insert($insert, $update);
      $db->query($qb->get());

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['lmid'] = $lmid;
        $c['cmid'] = $cmid;
        $c['data'] = QB::esc($c['data']);
        unset($c['label']);
      }
      if (count($concepts)) {
        $qb = QB::instance('learnermap_concept')->insert($concepts, true);
        $db->query($qb->get());
      }

      // Removing now inexistent concepts
      $qb = QB::instance('learnermap_concept')->delete();
      $qb->where('lmid', $lmid);
      if (count($concepts)) {
        $newConcepts = array_map(function($concept) {
          return QB::OG . QB::qt($concept['lmid']) . ", "
          . QB::qt($concept['cid']) . QB::EG;
        }, $concepts);
        $conceptKeys = ['lmid', 'cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $conceptKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newConcepts) . QB::EG));
      }
      $db->query($qb->get());

      // Preparing links and its source edge
      foreach($links as &$l) {
        $l = (array)$l;
        $l['lmid'] = $lmid;
        $l['cmid'] = $cmid;
        $l['data'] = QB::esc($l['data']);
        if ($l['source_cid']) {
          $l['source_cmid'] = $cmid;
          $l['source_data'] = QB::esc($l['source_data']);
        }
        unset($l['label']);
      }
      if (count($links)) {
        $qb = QB::instance('learnermap_link')->insert($links, true);
        $db->query($qb->get());
      }

      // Removing now inexistent links
      $qb = QB::instance('learnermap_link')->delete();
      $qb->where('lmid', $lmid);
      if (count($links)) {
        $newLinks = array_map(function($link) {
          return QB::OG . QB::qt($link['lmid']) . ", "
          . QB::qt($link['lid']) . QB::EG;
        }, $links);
        $linkKeys = ['lmid', 'lid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linkKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinks) . QB::EG));
      }
      $db->query($qb->get());


      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['lmid'] = $lmid;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      if (count($linktargets)) {
        $qb = QB::instance('learnermap_linktarget')->insert($linktargets, true);
        $db->query($qb->get());
      }

      // Removing now inexistent linktarget edges
      $qb = QB::instance('learnermap_linktarget')->delete();
      $qb->where('lmid', $lmid);
      if (count($linktargets)) {
        $newLinktargets = array_map(function($linktarget) {
          return QB::OG . QB::qt($linktarget['lmid']) . ", "
          . QB::qt($linktarget['lid']) . ", "
          . QB::qt($linktarget['target_cmid']) . ", "
          . QB::qt($linktarget['target_cid']) . QB::EG;
        }, $linktargets);
        $linktargetKeys = ['lmid', 'lid', 'target_cmid', 'target_cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linktargetKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinktargets) . QB::EG));
      }
      $db->query($qb->get());
      
      $learnerMap = $this->getLearnerMap($lmid);

      $db->commit();
      return $learnerMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function getLearnerMap($lmid) {
    try {
      $db = self::instance('kbv2');
      
      $result = new stdClass;
      
      $qb = QB::instance('learnermap');
      $qb->select()->where('lmid', QB::esc($lmid));
      $result->map = $db->getRow($qb->get());
      $qb = QB::instance('learnermap_concept');
      $qb->select()->where('lmid', QB::esc($lmid));
      $result->concepts = $db->query($qb->get());
      $qb = QB::instance('learnermap_link');
      $qb->select()->where('lmid', QB::esc($lmid));
      $result->links = $db->query($qb->get());
      $qb = QB::instance('learnermap_linktarget');
      $qb->select()->where('lmid', QB::esc($lmid));
      $result->linktargets = $db->query($qb->get());

      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getLearnerMapListByKit($kid) { // var_dump($cmid);
    try {
      $db = self::instance('kbv2');
      $qb = QB::instance('learnermap');
      $qb->select()->where('kid', QB::esc($kid));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getLastDraftLearnerMapOfUser($author, $kid) {
    try {
      $db = self::instance('kbv2');
      $qb = QB::instance('learnermap');
      $qb->select('lmid')
        ->where('author', QB::esc($author))
        ->where('kid', $kid === null ? QB::IS : QB::EQ, $kid)
        ->where('type', 'draft')
        ->orderBy('create_time', QB::DESC)->limit(1);
      $lmid = $db->getVar($qb->get());
      return $lmid ? $this->getLearnerMap($lmid) : null;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getLearnerMapsOfConceptMap($cmid) {
    try {
      $db = self::instance('kbv2');
      $qb = QB::instance('learnermap l');
      $qb->select('lmid')
        ->leftJoin('kit k', 'k.kid', 'l.kid')
        ->where('k.cmid', $cmid);
      $lmids = $db->query($qb->get());
      $learnerMaps = [];
      foreach($lmids as $lm) {
        $lmid = $lm->lmid;
        $learnerMaps[] = $this->getLearnerMap($lmid);
      }
      return $learnerMaps;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

}