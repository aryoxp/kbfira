<!-- container of this layout template must have a display: flex style -->
<!-- or add d-flex Bootstrap class to this layout's container/parent   -->
<div class="kb-container d-flex flex-fill flex-column border bg-white rounded">
  <div class="kb-toolbar p-1 d-flex align-items-center justify-content-between bg-light border-bottom">
    <span class="left-stack"></span>
    <span class="center-stack"><span class="btn btn-sm">&nbsp;</span></span>
    <span class="right-stack"></span>
  </div>
  <div id="<?php echo isset($id) ? $id : 'cy'; ?>" class="kb-cy flex-fill"></div>
</div>