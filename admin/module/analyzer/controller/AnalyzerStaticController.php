<?php

class AnalyzerStaticController extends ModuleController {

  public function index() {
    Core::lib(Core::CONFIG)->set('menu', 'analyzer-static', CoreConfig::CONFIG_TYPE_CLIENT);
    $this->ui->usePlugin('kitbuild-ui', 'kitbuild', 'kitbuild-analyzer');
    $this->useStyle("analyzer.css");
    $this->useScript("analyzer.static.js");
    $this->render($this->view("analyzer.static.php"), array(
      "sidebarcollapse" => true,
      "title" => "Static Analyzer"
    ));
  }

}