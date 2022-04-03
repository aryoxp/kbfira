<?php

defined('CORE') or (header($_SERVER["SERVER_PROTOCOL"] . " 403 Forbidden") and die('403.14 - Access denied.'));
defined('CORE') or die();

class CoreView {

  private static $instance;
  private const PLUGIN_DEF_FILE = 'plugins.ini';

  private $styles  = array();
  private $scripts = array();
  private $heads   = array();
  private $foots   = array();

  public const RETURN = 1;
  public const RELATIVE = 2;
  public const CORE = 4;
  public const ASSET = 8;
  public const APP = 16;
  public const SHARED = 32;

  public const ALL_VIEW = -1;

  private $pluginDefs = array();

  public static function instance() {
    if (self::$instance == null) self::$instance = new CoreView();
    return self::$instance;
  }

  /**
   * Get an instance of language library 
   * and load the specified language definition file.
   * $path: path to the language definition file, relative to /app/asset/lang/ directory
   * $location: path to the language definition file, relative to /app/ or global .shared/ directory
   */
  public function language($path, $countryCode = CoreLanguage::DEFAULT_LANG_CODE, $location = CoreLanguage::LOCATION_APP) {
    CoreLanguage::instance()->load($path, $countryCode, $location);
  }

  /**
   * Get the language definition of a specified key.
   * $params: parameters passed to the language string template.
   */
  public function l($key = '', ...$params) {
    if ($key == '' || trim($key) == '') return "-";
    return CoreLanguage::instance()->get($key, ...$params);
  }

  /**
   * Output the specified data into JSON format. 
   */
  public function json($data) {
    CoreResult::instance($data)->json();
  }

  /**
   * Insert custom contents inside <head> tag.
   */
  public function head($content) {
    $this->heads[] = $content;
    return $this;
  }

  /**
   * Insert custom contents below </body> tag.
   */
  public function foot($content) {
    $this->foots[] = $content;
    return $this;
  }

  public function view($view, $data = array(), $options = null) {

    $return   = $options & self::RETURN;
    $relative = $options & self::RELATIVE;
    $core     = $options & self::CORE;
    $asset    = $options & self::ASSET;
    $app      = $options & self::APP;
    $shared   = $options & self::SHARED;

    $viewDir  = Core::lib(Core::CONFIG)->get('core_app_view_directory', CoreConfig::CONFIG_TYPE_CORE);
    $viewPath = CORE_APP_PATH . $viewDir . DS . $view;
    if ($relative) {
      $backtrace = debug_backtrace();
      if($trace = $backtrace[0]) $viewPath = dirname($trace['file']) . DS . $view;
    }
    $viewPath = $asset ? CORE_APP_PATH . CORE_APP_ASSET . $view : $viewPath;
    $viewPath = $shared ? $view : $viewPath;
    $viewPath = $app ? CORE_APP_PATH . $view : $viewPath;
    $viewPath = $core ? CORE_VIEW_PATH . $view : $viewPath;

    // var_dump($return, $relative, $core, $shared, $asset, $app, $options);
    // var_dump($viewPath);

    if (is_array($data)) {
      extract($data, EXTR_PREFIX_SAME, "arg");
      extract($data, EXTR_PREFIX_INVALID, "arg");
    }
    if ($return) ob_start();
    if (file_exists($viewPath) and is_readable($viewPath)) include $viewPath;
    else {
      echo 'View: ' . $view . ' not found at ' . $viewPath . "\n";
    }
    if ($return) return ob_get_clean();
  }

  public function pluginView($key, $data = null, $index = CoreView::ALL_VIEW, $options = CoreView::SHARED) {
    if (isset($this->pluginDefs[$key]) && $p = $this->pluginDefs[$key]) {
      $views = $p['views'];
      $path = $p['path'] ? $p['path'] : null;
      if (substr("testers", -1) != DS) $path .= DS;
      if ($index == CoreView::ALL_VIEW) {
        foreach($views as $v) $this->view($path . $v, $data, $options);
      } else $this->view($path . $views[$index], $data, $options);
    }
  }

  public function location($path = '', $basePath = null) {
    if (preg_match("/http(s?)\:\/\//i", $path)) return $path;
    $location = Core::lib(Core::URI)->get(CoreUri::BASELINKURL) . ($basePath ? rtrim($basePath, "/") . DS : null) . $path;
    return @$location;
  }

  public function file($path = '', $basePath = null) {
    if (preg_match("/http(s?)\:\/\//i", $path)) return $path;
    $location = Core::lib(Core::URI)->get(CoreUri::BASEFILEURL) . ($basePath ? rtrim($basePath, "/") . DS : null) . $path;
    return @$location;
  }

  public function asset($path = '', $basePath = null) {
    if (preg_match("/http(s?)\:\/\//i", $path)) return $path;
    $location = Core::lib(Core::URI)->get(CoreUri::BASEURL)
      . ($basePath ? $basePath : Core::lib(Core::URI)->get(CoreUri::APP) . DS . CORE_APP_ASSET) . $path;
    return @$location;
  }

  public function useScript($path, $pad = null, $assetPath = null) {

    /**
     * Is the path starts with http?
     * Then include the script as it is...
     */
    if (preg_match("/^http(s?)\:\/\//i", $path)) {
      $script = $path . ($pad ? $pad : '');
      if (in_array($script, $this->scripts)) return;
      $this->scripts[] = $script;
      return;
    }

    $scriptPath = ($assetPath ? CORE_ROOT_PATH . $assetPath : CORE_APP_PATH . CORE_APP_ASSET) . $path;
    if (file_exists($scriptPath)) {
      $script = $this->asset($path, $assetPath) . ($pad ? $pad : '');
      if (!in_array($script, $this->scripts))
        $this->scripts[] = $script;
    } else {
      echo '<!-- Invalid: ' . $scriptPath . '-->';
    }
  }

  public function useStyle($path, $pad = null, $assetPath = null) {

    /**
     * Is the path starts with http?
     * Then include the style as it is...
     */
    if (preg_match("/^http(s?)\:\/\//i", $path)) {
      $style = $path . ($pad ? $pad : '');
      if (in_array($style, $this->styles)) return;
      $this->styles[] = $style;
      return;
    }

    $stylePath = ($assetPath ? CORE_ROOT_PATH . $assetPath : CORE_APP_PATH . CORE_APP_ASSET) . $path;
    if (file_exists($stylePath)) {
      $style = $this->asset($path, $assetPath) . ($pad ? $pad : '');
      if (!in_array($style, $this->styles))
        $this->styles[] = $style;
    } else {
      echo '<!-- Invalid: ' . $stylePath . '-->';
    }
  }

  public function usePlugin(...$key) {

    if (!count($this->pluginDefs)) {
      $pluginDefsFile = CORE_CONFIG_PATH . CoreView::PLUGIN_DEF_FILE;
      $appPluginDefsFile = CORE_APP_PATH . CORE_APP_CONFIG . CoreView::PLUGIN_DEF_FILE;
      $sharedPluginDefsFile = CORE_SHARED_PATH . CORE_SHARED_CONFIG . CoreView::PLUGIN_DEF_FILE;

      // var_dump($pluginDefsFile, $appPluginDefsFile, $sharedPluginDefsFile);

      if (file_exists($pluginDefsFile) and is_readable($pluginDefsFile))
        $this->pluginDefs = parse_ini_file($pluginDefsFile, true);
      if (file_exists($appPluginDefsFile) and is_readable($appPluginDefsFile))
        $this->pluginDefs = array_merge($this->pluginDefs, parse_ini_file($appPluginDefsFile, true));
      if (file_exists($sharedPluginDefsFile) and is_readable($sharedPluginDefsFile))
        $this->pluginDefs = array_merge($this->pluginDefs, parse_ini_file($sharedPluginDefsFile, true));
    }

    foreach ($key as $k) {
      if (isset($this->pluginDefs[$k]) && $p = $this->pluginDefs[$k]) {
        if (isset($p['dependencies'])) {
          foreach ($p['dependencies'] as $dep) {
            $this->usePlugin($dep);
          }
        }
        if (isset($p['scripts'])) {
          foreach ($p['scripts'] as $s) {
            $this->useScript($s, null, $p['path'] ? $p['path'] . DS : null);
          }
        }
        if (isset($p['styles'])) {
          foreach ($p['styles'] as $s) {
            $this->useStyle($s, null, $p['path'] ? $p['path'] . DS : null);
          }
        }
        if (isset($p['corescripts'])) {
          foreach ($p['corescripts'] as $s) {
            $this->useScript($s, null, "core/asset/");
          }
        }
        if (isset($p['corestyles'])) {
          foreach ($p['corescripts)'] as $s) {
            $this->useStyle($s, null, "core/asset/");
          }
        }
      } else echo "<!-- Cannot find plugin definition of key: $k. -->";
    }
  }

  public function useCoreClients(...$plugins) {
    $this->usePlugin('core-client'); // core-client-min

    foreach ($plugins as $plugin) $this->usePlugin($plugin);

    $clientBaseConfig                  = new stdClass;
    $clientBaseConfig->{'baseurl'}     = $this->location();
    $clientBaseConfig->{'basefileurl'} = $this->file();
    $clientBaseConfig->{'asseturl'}    = $this->asset();
    $clientBaseConfig->{'sessid'}      = session_id();

    Core::lib(Core::CONFIG)->set('core', base64_encode(json_encode($clientBaseConfig)), CoreConfig::CONFIG_TYPE_CLIENT);
  }
  public function useClientLibs(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function loadClientLibs(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function useCoreLibs(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function loadCoreLibs(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function useClientLib(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function loadClientLib(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function useCoreLib(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }
  public function loadCoreLib(...$plugins) {
    return $this->useCoreClients(...$plugins);
  }

  protected function metaConfig() {
    if (!$cfgs = Core::lib(Core::CONFIG)->dump(CoreConfig::CONFIG_TYPE_CLIENT)) return;
    echo '    <meta id="core-lang" data-lang="' . "\n      ";
    echo implode("\n      ", 
      str_split(CoreApi::compress(json_encode(CoreLanguage::instance()->dump())), 80)
      ) . "\">\n";
    echo '    <meta id="core-client-config" ';
    $i = 0;
    foreach ($cfgs as $key => $value) {
      if ($key == 'core') {
        echo ($i > 0 ? "\n" : "") . "data-{$key}=\"" . "\n      ";
        echo implode("\n      ", str_split($value, 80)) . "\"";
      } else echo ($i > 0 ? "\n      " : "") . "data-{$key}=\"{$value}\"";
      $i++;
    }
    echo ">\n";
  }
}
