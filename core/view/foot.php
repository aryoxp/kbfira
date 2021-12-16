  </body>
  <!-- Scripts placed at the end of the document so the pages load faster -->
<?php foreach($this->scripts as $s) echo '  <script type="text/javascript" src="'.$s.'"></script>' . "\n"; ?>
<?php if ($this->foots && count($this->foots)) echo "\n  " . implode("\n  " , $this->foots) . "\n\n"; ?>
</html>
