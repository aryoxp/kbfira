<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreLanguageController extends CoreApi {

  private const EN = "en";
  private const SUFFIX = "lang";

  function load() {

    /**
     * Get the specified language file and parameters.
     */
    $countryId = strtolower(self::postv('cid', self::EN));
    $basePath  = trim(self::postv('basepath', ""), " /");
    $file      = trim(self::postv('file', ""));

    if($basePath) $basePath = preg_match("/\/$/i", $basePath) ? $basePath : $basePath . DS;

    // var_dump($countryId, $basePath, $file);

    /**
     * Load the English language entries from the specified path.
     */ 
    $filepath = CORE_APP_PATH . ($basePath ? $basePath : CORE_APP_LANG) 
      . $file
      . "." . self::SUFFIX . "." . self::EN . ".json";
    $enJson = file_exists($filepath) ? file_get_contents($filepath) : "{}";

    /**
     * Load the requested language entries from the specified file of the same path.
     */ 
    $filepath = CORE_APP_PATH . ($basePath ? $basePath : CORE_APP_LANG) 
      . $file
      . "." . self::SUFFIX . ".${countryId}.json";
    $langJson = file_exists($filepath) ? file_get_contents($filepath) : "{}";

    /**
     * Merge loaded language entries, so that localized language replaces English.
     * Hence, English entries as fallback.
     */ 
    $langEntries = array_merge(json_decode($enJson, true), json_decode($langJson, true));

    /**
     * Throw an error if the specified file is not found or empty.
     * The app should not load it.
     */
    if (count($langEntries) == 0) {
      CoreError::instance("Language file not found or empty at: " . $filepath)->show();
      return;
    }

    /**
     * Show the loaded language entries.
     */
    CoreResult::instance($langEntries)->json();
  }
}
