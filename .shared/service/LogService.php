<?php

class LogService extends CoreService {
  function log($username, $seq, $tstampc, $canvasid, $action, $data, $sessid, $ua) {
    try {
      $log             = [];
      $log['username'] = QB::esc($username);
      $log['seq']      = QB::esc($seq);
      $log['tstampc']  = QB::esc($tstampc);
      $log['canvasid'] = QB::esc($canvasid);
      $log['action']   = QB::esc($action);
      $log['data']     = QB::esc($data);
      $log['sessid']   = QB::esc($sessid);
      $log['ua']       = QB::esc($ua);
      $db = self::instance();
      $qb = QB::instance('log')->insert($log);
      $result = $db->query($qb->get());
      $lid = $db->getInsertId();
      return $lid;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    } 
  }

  function logCmap($lid, $cmid) {
    try {
      $log = [];
      $log['lid'] = QB::esc($lid);
      $log['cmid'] = QB::esc($cmid);
      $db = self::instance();
      $qb = QB::instance('log_cmap')->insert($log);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    } 
  }

  function logCmapState($lid, $concept, $link, $edge, $map, $proposition, $nc, $nl, $ne, $np) {
    try {

      $logState                = [];
      $logState['lid']         = QB::esc($lid);
      $logState['concept']     = QB::esc($concept);
      $logState['link']        = QB::esc($link);
      $logState['edge']        = QB::esc($edge);
      $logState['map']         = QB::esc($map);
      $logState['proposition'] = QB::esc($proposition);
      $logState['nc']          = QB::esc($nc);
      $logState['nl']          = QB::esc($nl);
      $logState['ne']          = QB::esc($ne);
      $logState['np']          = QB::esc($np);

      $db = self::instance();
      $qb = QB::instance('log_cmap_state')->insert($logState);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    } 
  }

  function logKitBuild($lid, $lmid) {
    try {
      $log = [];
      $log['lid'] = QB::esc($lid);
      $log['lmid'] = QB::esc($lmid);
      $db = self::instance();
      $qb = QB::instance('log_kitbuild')->insert($log);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    } 
  }

  function logKitBuildState($lid, $edge, $map, $proposition, $compare, $ne, $np) {
    try {

      $logState                = [];
      $logState['lid']         = QB::esc($lid);
      $logState['edge']        = QB::esc($edge);
      $logState['map']         = QB::esc($map);
      $logState['proposition'] = QB::esc($proposition);
      $logState['compare']     = QB::esc($compare);
      $logState['ne']          = QB::esc($ne);
      $logState['np']          = QB::esc($np);

      $db = self::instance();
      $qb = QB::instance('log_kitbuild_state')->insert($logState);
      $result = $db->query($qb->get());
      return $result;
    } catch (Exception $ex) {
      throw CoreError::instance($ex->getMessage());
    } 
  }
}