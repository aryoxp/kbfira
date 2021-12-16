<!doctype html>
<html lang="<?php echo isset($lang) ? $lang : "en"; ?>">
  <head>
    <meta charset="<?php echo isset($charset) ? $charset : "utf-8"; ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="<?php echo isset($description) ? $description : ""; ?>">
    <meta name="author" content="<?php echo isset($author) ? $author : ""; ?>">
<?php $this->metaConfig(); ?>
<?php foreach($this->styles as $s) echo '    <link rel="stylesheet" href="'.$s.'">' . "\n"; ?>
<?php if ($this->heads && count($this->heads)) echo "\n    " . implode("\n    " , $this->heads) . "\n\n"; ?>
    <link rel="icon" href="favicon.ico">
    <title><?php echo isset($title) ? $title : str_replace("Controller", "", Core::lib(Core::URI)->get(CoreUri::CONTROLLER)) . " &rsaquo; " . ucfirst(Core::lib(Core::URI)->get(CoreUri::METHOD)); ?></title>
  </head>
  <body>
