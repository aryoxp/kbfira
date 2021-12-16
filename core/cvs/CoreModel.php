<?php 

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

abstract class CoreModel {
  public abstract function getKey();
}