<?php

class TopicService extends CoreService {

  function getTopicList() {
    $db = self::instance();
    $qb = QB::instance('topic')->select();
    return $db->query($qb->get());
  }

  function getTopicListOfGroups($gids = []) {
    if (count($gids) == 0) return [];
    $quote = function($v) {
      return "'" . QB::esc($v) . "'";
    };
    $db = self::instance();
    $qb = QB::instance('topic t')->select()
      ->leftJoin('grup_topic gt', 'gt.tid', 't.tid')
      ->where('gt.gid', QB::IN, QB::raw(QB::OG . implode(",", array_map($quote, $gids)) . QB::EG));
    return $db->query($qb->get());
  }

  function insertTopic($tid, $title, $enabled = 1, $text = null, $data = null) {
    $db = self::instance();
    $insert['tid']     = QB::esc($tid);
    $insert['title']   = QB::esc($title);
    $insert['enabled'] = QB::esc($enabled);
    $insert['text']    = QB::esc($text);
    $insert['data']    = QB::esc($data);
    $qb = QB::instance('topic')->insert($insert);
    $db->query($qb->get());
    return $this->selectTopic($tid);
  }

  function updateTopic($tid, $ntid, $title, $enabled = 1, $text = null, $data = null) {
    $db = self::instance();
    $update['tid']     = QB::esc($ntid);
    $update['title']   = QB::esc($title);
    $update['enabled'] = QB::esc($enabled);
    $update['text']    = QB::esc($text);
    $update['data']    = QB::esc($data);
    $qb = QB::instance('topic')->update($update)->where('tid', $tid);
    $db->query($qb->get());
    return $this->selectTopic($ntid);
  }

  function selectTopic($tid) {
    $db = self::instance();
    $qb = QB::instance('topic')->select()
      ->where('tid', QB::esc($tid));
    return $db->getRow($qb->get());
  }

  function getTopics($keyword = '', $page = 1, $perpage = 10) {
    $db = self::instance();
    $qb = QB::instance('topic t')->select(QB::raw('t.*'))
      ->select('x.title as texttitle')
      ->leftJoin('text x', 'x.tid', 't.text')
      ->where('t.title', 'LIKE', "%$keyword%")
      ->orderBy('t.created', QB::DESC)
      ->limit(($page-1)*$perpage, $perpage);
    return $db->query($qb->get());
  }

  function getTopicsCount($keyword = '') {
    $db = self::instance();
    $qb = QB::instance('topic t')->select(QB::raw('COUNT(*) AS count'))
      ->leftJoin('text x', 'x.tid', 't.text')
      ->where('t.title', 'LIKE', "%$keyword%")
      ->orderBy('t.created', QB::DESC);
    return $db->getVar($qb->get());
  }

  function deleteTopic($tid) {
    $db = self::instance();
    $qb = QB::instance('topic')->delete()
      ->where('tid', QB::esc($tid));
    return $db->query($qb->get());
  }

  function assignTextToTopic($text, $tid) {
    $db = self::instance();
    $qb = QB::instance('topic')->update(['text' => $text])
      ->where('tid', QB::esc($tid));
    return $db->query($qb->get());
  }

  function unassignTextFromTopic($tid) {
    $db = self::instance();
    $qb = QB::instance('topic')->update(['text' => null])
      ->where('tid', QB::esc($tid));
    return $db->query($qb->get());
  }

  function assignTopicToGroup($tid, $gid) {
    $db = self::instance();
    $qb = QB::instance('grup_topic')->insert(['gid' => $gid, 'tid' => $tid])->ignore();
    $db->query($qb->get());
    return $db->getAffectedRows();
  }

  function deassignTopicFromGroup($tid, $gid) {
    $db = self::instance();
    $qb = QB::instance('grup_topic')->delete()
      ->where('gid', $gid)
      ->where('tid', $tid);
    $db->query($qb->get());
    return $db->getAffectedRows();
  }

}