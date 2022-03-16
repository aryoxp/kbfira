<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class LogApiController extends CoreApi {

  function log() {

    $username = $this->postv('username');
    $seq      = $this->postv('seq');
    $tstampc  = date("Y-m-d H:i:s", $this->postv('tstampc'));
    $canvasid = $this->postv('canvasid');
    $action   = $this->postv('action');
    $data     = $this->postv('data');
    $sessid   = $this->postv('sessid');
    $ua       = $_SERVER['HTTP_USER_AGENT'];

    $flag     = $this->postv('flag');
    $cmid     = $this->postv('cmid');
    $lmid     = $this->postv('lmid');
    
    $logService = new LogService();
    $lid = $logService->log($username, $seq, $tstampc, $canvasid, $action, $data, $sessid, $ua);

    if ($cmid) {
      $lcmap = $logService->logCmap($lid, $cmid);
      // var_dump($action, $lcmap, $flag == 'cmap', $flag); exit;
      if ($flag == 'cmap' && $lcmap) {
        $concept     = $this->postv('concept');
        $link        = $this->postv('link');
        $edge        = $this->postv('edge');
        $map         = $this->postv('map');
        $proposition = $this->postv('proposition');
        $nc          = $this->postv('nc');
        $nl          = $this->postv('nl');
        $ne          = $this->postv('ne');
        $np          = $this->postv('np');
        $result = $logService->logCmapState($lid, $concept, $link, $edge, $map, $proposition, $nc, $nl, $ne, $np);
      }
    }

    if ($lmid = $this->postv('lmid')) {
      $lkb = $logService->logKitBuild($lid, $lmid);
      if ($flag == 'kitbuild' && $lkb) {
        $edge        = $this->postv('edge');
        $map         = $this->postv('map');
        $proposition = $this->postv('proposition');
        $compare     = $this->postv('compare');
        $ne          = $this->postv('ne');
        $np          = $this->postv('np');  
        $result = $logService->logKitBuildState($lid, $edge, $map, $proposition, $compare, $ne, $np);
      }
    }

    return CoreResult::instance($lid)->show();   
  }

}