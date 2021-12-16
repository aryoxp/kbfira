<?php

class AnalyzerDynamicController extends ModuleController {

  public function index() {
    Core::lib(Core::CONFIG)->set('menu', 'analyzer-dynamic', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer');
    $this->useStyle("analyzer.css");
    $this->useScript("analyzer.dynamic.js");
    $this->render($this->view("analyzer.dynamic.php"), array(
      "sidebarcollapse" => true,
      "title" => "Dynamic Analyzer"
    ));
  }

}