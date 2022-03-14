<?php

class CoreBaseDatabase {

  protected $link;
  protected $dbConfig = null;

  function __construct($config) {
    $this->dbConfig = $config;
  }

  function getConfig() {
    return $this->dbConfig;
  }

  function getLink() {
    return $this->link;
  }

}