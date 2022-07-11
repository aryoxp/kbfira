<?php

class AnalyzerStaticController extends ModuleController {

  public function index() {
    $sidebarcollapse = true; // to initially collapse the sidebar.
    Core::lib(Core::CONFIG)->set('menu', 'analyzer-static', CoreConfig::CONFIG_TYPE_CLIENT);
    Core::lib(Core::CONFIG)->set('sidebarcollapse', $sidebarcollapse, CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer');
    $this->useStyle("analyzer.css");
    $this->useScript("analyzer.static.js");
    $this->render($this->view("analyzer.static.php"), array(
      "sidebarcollapse" => $sidebarcollapse,
      "title" => "Static Analyzer"
    ));
  }

}