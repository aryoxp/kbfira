<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreLanguage
{
  private static $instance;
  private static $CORE_LANG; // loaded language entries storage
  private const DEFAULT_LANG_CODE = "en";

  function __construct()
  {
    CoreLanguage::$CORE_LANG = array();
  }

  public static function instance($path = null, $countryCode = "en", $basePath = 'lang')
  {
    if (CoreLanguage::$instance == null) CoreLanguage::$instance = new CoreLanguage();
    if ($path) CoreLanguage::$instance->load($countryCode, $path, $basePath);
    return CoreLanguage::$instance;
  }

  /**
   * Load language files, merge language information,
   * and return loaded languages.
   * Fallback to English.
   * @param $path String path to language JSON file
   * @param $basePath String base path to language JSON file relative to /assets
   * @return JSONString loaded languages key-value pairs JSON String
   */
  public function load($path, $countryCode = "en", $basePath = 'lang/')
  {

    $langJson = null;

    // Force load English version
    $langPath = CORE_APP_PATH . CORE_APP_ASSET 
      . (preg_match("/\/$/i", $basePath) ? ltrim($basePath, DS) : ltrim($basePath, DS) . DS) 
      . trim($path, DS) . ".lang." . self::DEFAULT_LANG_CODE . ".json";

    if (file_exists($langPath)) {
      $langEntries = (array) json_decode(file_get_contents($langPath));
      CoreLanguage::$CORE_LANG = array_merge(CoreLanguage::$CORE_LANG, $langEntries);
    } else echo "<!-- Warning: default English language file on: $langPath does not exists. -->\n";

    // Load intended language file, replaces the English entries 
    $langPath = CORE_APP_PATH . CORE_APP_ASSET 
      . (preg_match("/\/$/i", $basePath) ? ltrim($basePath, DS) : ltrim($basePath, DS) . DS) 
      . trim($path, DS) . ".lang." . strtolower(trim($countryCode)) . ".json";

    if (file_exists($langPath)) {
      $langEntries = (array) json_decode(file_get_contents($langPath));
      CoreLanguage::$CORE_LANG = array_merge(CoreLanguage::$CORE_LANG, $langEntries);
    } else echo "<!-- Warning: requested language file on: $langPath does not exists. -->\n";

    return CoreLanguage::$CORE_LANG;
  }

  public function get($key = '')
  {
    $args = func_get_args();
    array_shift($args);
    return (isset(CoreLanguage::$CORE_LANG[$key]))
      ? $this->f(CoreLanguage::$CORE_LANG[$key], ...$args)
      : $key;
  }

  private function f()
  {
    $params = func_get_args();
    $text = array_shift($params);
    $i = count($params);
    // var_dump($params, $text, $i);
    while ($i--)
      $text = preg_replace('/\{' . $i . '\}/i', $params[$i], $text);
    return $text;
  }

  public function dump() {
    return CoreLanguage::$CORE_LANG;
  }
}
