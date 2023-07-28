</div> <!-- /#admin-content-panel -->
<div id="admin-side-panel" class="d-flex flex-column flex-fill side-panel border-start collapsed scroll-y">
  <div class="side-panel-container d-flex flex-column px-3 py-2">
    <span class="text-dark">
      <p>Aliqua pariatur cupidatat dolor et velit dolor minim aliqua mollit minim fugiat dolor. Esse consectetur amet id incididunt occaecat duis nostrud ex proident. Id incididunt nulla laborum non proident minim dolore dolor nostrud. Labore Lorem commodo laborum qui occaecat sunt sit ex in consectetur sint pariatur ullamco.</p>

      <p>Non mollit excepteur pariatur qui ut excepteur et. Dolore aliqua nisi consequat consequat excepteur amet aute dolor ad. Velit ipsum proident ut id sint enim nostrud elit fugiat quis proident sit. Elit ullamco incididunt deserunt quis aute id nostrud.</p>
    </span>
  </div>
</div>
</div>
<div id="admin-bottom-panel" class="border-top d-flex" style="background-color: #fff;">
  <div class="sidebar-panel bg-light border-right d-flex align-items-center <?php echo isset($sidebarcollapse) && $sidebarcollapse ? 'collapsed' : ''; ?>">
    <span class="flex-fill text-secondary p-2">
      <small><small>&copy; <?php echo date('Y'); ?> &rsaquo; Core Framework</small></small>
    </span>
    <a role="button" class="me-1" title="Mini Sidebar">
      <i class="bi bi-arrow-left-square h4 m-2 text-secondary"></i>
    </a>
  </div>
  <div class="status-panel bg-white flex-fill d-flex align-items-center scroll-x me-2 ms-2" style="overflow-x: auto;"></div>
  <div class="status-control d-flex align-items-center me-2"></div>
</div>
</div>

<?php $this->pluginView('general-ui'); ?>
<?php $this->view('foot.php', null, CoreView::CORE); ?>