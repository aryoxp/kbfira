<?php

class ModuleController extends CoreController {

  private $moduleRuntimeFile = CORE_APP_PATH . "runtime" . DS . "modules.ini";
  
  protected $menus   = [];
  protected $modules = [];
  protected $scripts = [];
  protected $styles  = [];
  protected $plugins = [];

  protected function isAppAuthorized($app = null) {
    $isAuthorized = CoreAuth::isAppAuthorized($app);
    if (!$isAuthorized) {
      $this->renderDenied();
      exit;
    }
    return $isAuthorized;
  }

  protected function getModules() {
    if (file_exists($this->moduleRuntimeFile))
      $moduleRuntime = (parse_ini_file($this->moduleRuntimeFile, true));
      $this->modules = @$moduleRuntime['modules'] ? $moduleRuntime['modules'] : [];
  }

  protected function loadModuleMenus() {
    foreach($this->modules as $m) {
      $sidebarMenuDefinition = CORE_APP_PATH . "module" . DS . $m . DS . "sidebar.menu.json";
      if (file_exists($sidebarMenuDefinition)) 
        $this->menus[$m] = json_decode(file_get_contents($sidebarMenuDefinition));
    }
  }

  private function loadModuleStyles() {
    $app = Core::lib(Core::URI)->get(CoreUri::APP);
    foreach($this->styles as $s) {
      $this->ui->useStyle($s->path, $s->pad, 
        $s->assetPath ? $s->assetPath : $app . DS . "module" . DS . $this->module . DS);  
    }
  }

  private function loadModuleScripts() {
    $app = Core::lib(Core::URI)->get(CoreUri::APP);
    foreach($this->scripts as $s) {
      $this->ui->useScript($s->path, $s->pad, 
        $s->assetPath ? $s->assetPath : $app . DS . "module" . DS . $this->module . DS);  
    }
  }

  private function head($options = []) {
    $controller = preg_replace("/^" . ucfirst($this->module) . "|Controller$/i", "", $this->controller);
    $this->ui->view('head.php', array_merge(array(
      'menus' => $this->menus,
      'modules' => $this->modules,
      'sidebarcollapse' => false,
      'title' => $controller . " &rsaquo; " . ucfirst($this->method)
    ), $options));
  }

  private function foot($options) {
    $this->ui->view('foot.php', $options);
  }

  public function init($module = null, $controller = null, $method = null, $args = null) {
    $this->module     = $module;
    $this->controller = $controller;
    $this->method     = $method;
    Core::lib(Core::CONFIG)->set('module', $module, CoreConfig::CONFIG_TYPE_CLIENT);
    // Core::lib(Core::CONFIG)->set('controller', $controller, CoreConfig::CONFIG_TYPE_CLIENT);
    // Core::lib(Core::CONFIG)->set('method', $method, CoreConfig::CONFIG_TYPE_CLIENT);
  }

  protected function render($content = "", $options = []) {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 
      'bootstrap', 
      'bootstrap-icons', 
      'general-ui');
    $this->ui->useScript('js/admin.js');
    $this->ui->useStyle('css/admin.css');
    $this->ui->usePlugin(...$this->plugins);
    $this->loadModuleScripts();
    $this->loadModuleStyles();
    $this->getModules();
    $this->loadModuleMenus();
    $this->head($options);
    echo $content;
    $this->foot($options);
  }

  protected function renderDenied($message = null, $options = []) {
    $this->ui->useCoreClients();
    $this->ui->usePlugin('core-language', 
      'bootstrap', 
      'bootstrap-icons', 
      'general-ui');
    $this->ui->useScript('js/admin.js');
    $this->ui->useStyle('css/admin.css');
    $this->ui->usePlugin(...$this->plugins);
    $this->loadModuleScripts();
    $this->loadModuleStyles();
    $this->getModules();
    $this->loadModuleMenus();
    $this->head($options);
    echo $message ? $message : '<div class="card m-5 p-4 fs-4"><span class="card-body"><span class="text-danger">Access denied:</span> Insufficient permission.</span></div>';
    $this->foot($options);
  }

  protected function view($view, $data = array(), $options = null) {
    return $this->ui->view("module" . DS . $this->module . DS . "view" . DS . $view , $data, $options | CoreView::RETURN | CoreView::APP);
  }

  // protected function pluginView($key, $data = null, $index = CoreView::ALL_VIEW, $options = CoreView::SHARED) {
  //   $this->ui->pluginView($key, $data, $index, $options);
  // }

  protected function useStyle($path, $pad = null, $assetPath = null) {
    $style = new stdClass;
    $style->path = $path;
    $style->pad = $pad;
    $style->assetPath = $assetPath;
    $this->styles[] = $style;
  }

  protected function useScript($path, $pad = null, $assetPath = null) {
    $script = new stdClass;
    $script->path = $path;
    $script->pad = $pad;
    $script->assetPath = $assetPath;
    $this->scripts[] = $script;
  }

  protected function usePlugin(...$plugins) {
    $this->plugins = array_merge($this->plugins, $plugins);
    $this->ui->usePlugin(...$plugins);
  }

  

}