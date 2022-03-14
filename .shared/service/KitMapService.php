<?php

class KitMapService extends CoreService {

  function insert($kfid, $name, $layout, $concepts = [], $links = [], $linktargets = [], $create_time = null, $enabled = null, $author = null, $cmid = null) {
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
    $insert['kfid']        = QB::esc($kfid);
    $insert['name']        = QB::esc($name);
    $insert['layout']      = QB::esc($layout);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['enabled']     = QB::esc($enabled);
    $insert['author']      = QB::esc($author);
    $insert['cmid']        = QB::esc($cmid);
    $db = self::instance("kbv2");
    try {
      $db->begin();

      $qb = QB::instance('kit')->insert($insert);
      $db->query($qb->get());
      $kid = $db->getInsertId();

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['kid'] = $kid;
        $c['cmid'] = $cmid;
        $c['data'] = QB::esc($c['data']);
        unset($c['label']);
      }

      // var_dump($concepts);
      if (count($concepts)) {
        $qb = QB::instance('kit_concept')->insert($concepts);
        $db->query($qb->get());
      }

      // Preparing links and its source edge
      foreach($links as &$l) {
        $l = (array)$l;
        $l['kid'] = $kid;
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
        $qb = QB::instance('kit_link')->insert($links);
        $db->query($qb->get());
      }

      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['kid'] = $kid;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      // var_dump($linktargets);
      if (count($linktargets)) {
        $qb = QB::instance('kit_linktarget')->insert($linktargets);
        $db->query($qb->get());
      }

      $kitMap = $this->getKitMap($kid);
      
      $db->commit();
      return $kitMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function update($kid, $kfid, $name, $layout, $concepts = [], $links = [], $linktargets = [], $create_time = null, $enabled = null, $author = null, $cmid = null) {
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
    $insert['kid']         = QB::esc($kid);
    $insert['kfid']        = QB::esc($kfid);
    $insert['name']        = QB::esc($name);
    $insert['layout']      = QB::esc($layout);
    $insert['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $insert['enabled']     = $enabled ? 1 : 0;
    $insert['author']      = QB::esc($author);
    $insert['cmid']        = QB::esc($cmid);

    $update['kfid']        = QB::esc($kfid);
    $update['name']        = QB::esc($name);
    $update['layout']      = QB::esc($layout);
    $update['create_time'] = QB::esc($create_time) ? QB::esc($create_time) : QB::default();
    $update['enabled']     = $enabled ? 1 : 0;
    $update['author']      = QB::esc($author);
    $update['cmid']        = QB::esc($cmid);
    
    $db = self::instance("kbv2");
    try {
      $db->begin();

      $qb = QB::instance('kit')->insert($insert, $update);
      $db->query($qb->get());

      foreach($concepts as &$c) {
        $c = (array)$c;
        $c['kid'] = $kid;
        $c['cmid'] = $cmid;
        $c['data'] = QB::esc($c['data']);
        unset($c['label']);
      }
      if (count($concepts)) {
        $qb = QB::instance('kit_concept')->insert($concepts, true);
        // echo $qb->get();
        $db->query($qb->get());
      }

      // Removing now inexistent concepts
      $qb = QB::instance('kit_concept')->delete();
      $qb->where('kid', $kid);
      if (count($concepts)) {
        $newConcepts = array_map(function($concept) {
          return QB::OG . QB::qt($concept['kid']) . ", "
          . QB::qt($concept['cid']) . QB::EG;
        }, $concepts);
        $conceptKeys = ['kid', 'cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $conceptKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newConcepts) . QB::EG));
      }
      $db->query($qb->get());

      // Preparing links and its source edge
      foreach($links as &$l) {
        $l = (array)$l;
        $l['kid'] = $kid;
        $l['cmid'] = $cmid;
        $l['data'] = QB::esc($l['data']);
        if ($l['source_cid']) {
          $l['source_cmid'] = $cmid;
          $l['source_data'] = QB::esc($l['source_data']);
        }
        unset($l['label']);
      }
      if (count($links)) {
        $qb = QB::instance('kit_link')->insert($links, true);
        $db->query($qb->get());
      }

      // Removing now inexistent links
      $qb = QB::instance('kit_link')->delete();
      $qb->where('kid', $kid);
      if (count($links)) {
        $newLinks = array_map(function($link) {
          return QB::OG . QB::qt($link['kid']) . ", "
          . QB::qt($link['lid']) . QB::EG;
        }, $links);
        $linkKeys = ['kid', 'lid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linkKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinks) . QB::EG));
      }
      $db->query($qb->get());


      // Preparing linktarget edges
      foreach($linktargets as &$l) {
        $l = (array)$l;
        $l['kid'] = $kid;
        $l['cmid'] = $cmid;
        $l['target_cmid'] = $cmid;
        $l['target_data'] = QB::esc($l['target_data']);
      }
      if (count($linktargets)) {
        $qb = QB::instance('kit_linktarget')->insert($linktargets, true);
        $db->query($qb->get());
      }

      // Removing now inexistent linktarget edges
      $qb = QB::instance('kit_linktarget')->delete();
      $qb->where('kid', $kid);
      if (count($linktargets)) {
        $newLinktargets = array_map(function($linktarget) {
          return QB::OG . QB::qt($linktarget['kid']) . ", "
          . QB::qt($linktarget['lid']) . ", "
          . QB::qt($linktarget['target_cmid']) . ", "
          . QB::qt($linktarget['target_cid']) . QB::EG;
        }, $linktargets);
        $linktargetKeys = ['kid', 'lid', 'target_cmid', 'target_cid'];
        $qb->where(QB::raw(QB::OG . implode(", ", $linktargetKeys) . QB::EG), 
          QB::NOTIN, QB::raw(QB::OG . implode(", ", $newLinktargets) . QB::EG));
      }
      $db->query($qb->get());
      
      $kitMap = $this->getKitMap($kid);

      $db->commit();
      return $kitMap;

    } catch(Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }

  }

  function delete($kid) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit')->delete()->where('kid', QB::esc($kid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getConceptMapListByTopic($topicId = null) {
    try {
      $db = self::instance();
      $qb = QB::instance('conceptmap');
      $qb->select()->where('topic', $topicId);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getKit($kid) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit');
      $qb->select()->where('kid', QB::esc($kid));
      $result = $db->getRow($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getKitMap($kid) {
    try {
      $db = self::instance();
      
      $result = new stdClass;
      
      $qb = QB::instance('kit');
      $qb->select()->where('kid', QB::esc($kid));
      $result->map = $db->getRow($qb->get());
      $qb = QB::instance('kit_concept');
      $qb->select()->where('kid', QB::esc($kid));
      $result->concepts = $db->query($qb->get());
      $qb = QB::instance('kit_link');
      $qb->select()->where('kid', QB::esc($kid));
      $result->links = $db->query($qb->get());
      $qb = QB::instance('kit_linktarget');
      $qb->select()->where('kid', QB::esc($kid));
      $result->linktargets = $db->query($qb->get());

      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function updateKitMapOption($kid, $option) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit');
      $qb->update('options', QB::esc($option))
        ->where('kid', QB::esc($kid));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getKits($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance();
    $qb = QB::instance('kit k')->select()
      ->leftJoin('conceptmap c', 'c.cmid', 'k.cmid')
      ->where('k.name', 'LIKE', "%$keyword%")
      ->where('c.title', 'LIKE', "%$keyword%", QB::OR)
      ->orderBy('k.create_time', QB::DESC)
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getKitsCount($keyword = '') {
    $db = self::instance();
    $qb = QB::instance('kit k')->select(QB::raw('COUNT(*) AS count'))
      ->leftJoin('conceptmap c', 'c.cmid', 'k.cmid')
      ->where('k.name', 'LIKE', "%$keyword%")
      ->where('c.title', 'LIKE', "%$keyword%", QB::OR)
      ->orderBy('k.create_time', QB::DESC);
    return $db->getVar($qb->get());
  }

  function getKitListByConceptMap($cmid) { // var_dump($cmid);
    try {
      $db = self::instance();
      $qb = QB::instance('kit k');
      $qb->select()
        ->select(QB::raw('(SELECT count(*) FROM kit_set ks WHERE ks.kid = k.kid) AS sets'))
        ->where('cmid', QB::esc($cmid));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getKitListOfGroups($gids = []) { // var_dump($cmid);
    try {
      if (count($gids) == 0) return [];
      $quote = function($v) {
        return "'" . QB::esc($v) . "'";
      };
      $db = self::instance();
      $qb = QB::instance('kit k')->select()
        ->leftJoin('grup_kit gk', 'gk.kid', 'k.kid')
        ->where('gk.gid', QB::IN, QB::raw(QB::OG . implode(",", array_map($quote, $gids)) . QB::EG));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function assignKitToGroup($kid, $gid) {
    $db = self::instance();
    $qb = QB::instance('grup_kit')->insert(['gid' => $gid, 'kid' => $kid])->ignore();
    $db->query($qb->get());
    return $db->getAffectedRows();
  }

  function deassignKitFromGroup($kid, $gid) {
    $db = self::instance();
    $qb = QB::instance('grup_kit')->delete()
      ->where('gid', $gid)
      ->where('kid', $kid);
    $db->query($qb->get());
    return $db->getAffectedRows();
  }

  function assignTextToKitMap($tid, $kid) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit');
      $qb->update(['text' => $tid])->where('kid', QB::esc($kid));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function unassignTextFromKitMap($kid) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit');
      $qb->update(['text' => null])->where('kid', QB::esc($kid));
      return $db->query($qb->get());
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

  function getSets($kid) {
    $db = self::instance();
    try {
      $kitSets = new stdClass;

      $qb = QB::instance('kit_set');
      $qb->select('kid', 'setid', 'order')
        ->where('kid', QB::esc($kid))
        ->orderBy('order');
      $kitSets->sets = $db->query($qb->get());
      
      $qb = QB::instance('kit_concept_ext');
      $qb->select('kid', 'cmid', 'cid', 'set_kid', 'setid')
        ->where('set_kid', QB::esc($kid));
      $kitSets->concepts = $db->query($qb->get());

      $qb = QB::instance('kit_link_ext');
      $qb->select('kid', 'cmid', 'lid', 'set_kid', 'setid')
        ->where('set_kid', QB::esc($kid));
      $kitSets->links = $db->query($qb->get());

      $qb = QB::instance('kit_source_edge_ext');
      $qb->select('kid', 'cmid', 'lid', 'source_cid', 'set_kid', 'setid')
        ->where('set_kid', QB::esc($kid));
      $kitSets->sourceEdges = $db->query($qb->get());

      $qb = QB::instance('kit_target_edge_ext');
      $qb->select('kid', 'cmid', 'lid', 'target_cid', 'set_kid', 'setid')
        ->where('set_kid', QB::esc($kid));
      $kitSets->targetEdges = $db->query($qb->get());

      return $kitSets;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function saveSets($kid, $sets, $concepts, $links, $sourceEdges, $targetEdges) {
    $db = self::instance();
    try {
      $db->begin();

      $qb = QB::instance('kit_set');
      $qb->delete()->where('kid', QB::esc($kid));
      $db->query($qb->get());

      foreach($sets as &$s) $s = (array)$s;
      if (count($sets)) {
        $qb = QB::instance('kit_set');
        $db->query($qb->insert($sets)->get());
      }

      foreach($concepts as &$c) $c = (array)$c;
      if (count($concepts)) {
        $qb = QB::instance('kit_concept_ext');
        $db->query($qb->insert($concepts)->get());
      }

      foreach($links as &$l) $l = (array)$l;
      if (count($links)) {
        $qb = QB::instance('kit_link_ext');
        $db->query($qb->insert($links)->get());
      }

      foreach($sourceEdges as &$e) $e = (array)$e;
      if (count($sourceEdges)) {
        $qb = QB::instance('kit_source_edge_ext');
        $db->query($qb->insert($sourceEdges)->get());
      }

      foreach($targetEdges as &$e) $e = (array)$e;
      if (count($targetEdges)) {
        $qb = QB::instance('kit_target_edge_ext');
        $db->query($qb->insert($targetEdges)->get());
      }
      
      $db->commit();
      return true;
    } catch (Exception $ex) {
      $db->rollback();
      throw CoreError::instance($ex->getMessage());
    }
  }

  function removeSets($kid) {
    try {
      $db = self::instance();
      $qb = QB::instance('kit_set');
      $qb->delete()->where('kid', QB::esc($kid));
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    }
  }

}