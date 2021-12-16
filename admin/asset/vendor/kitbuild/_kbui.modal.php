<div id="kbui-modal">

  <!-- New/Update Node Modal -->
  <div class="modal kb-modal-prompt" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><?php echo $this->l('kbui-new-concept'); ?></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="<?php echo $this->l('kbui-close'); ?>">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-inline">
            <div class="form-group mb-2">
              <span class="modal-input-label"><?php echo $this->l('kbui-concept-name'); ?></span>
            </div>
            <div class="form-group mx-sm-3 mb-2" style="position:relative">
              <input type="text" class="form-control" id="input-node-label" style="width:300px;">
              <div class="invalid-tooltip">
                <?php echo $this->l('kbui-please-provide-label'); ?>
              </div>
            </div>
          </div>
          <small class="modal-helper-text">
            <?php echo $this->l('kbui-concept-name-should-less'); ?></small>


        </div>
        <div class="modal-footer">
          <p class="text-error text-danger mr-5"><?php echo $this->l('kbui-error'); ?></p>
          <button type="button"
            class="btn btn-sm btn-primary bt-ok bt-dialog pl-4 pr-4"><?php echo $this->l('kbui-ok'); ?></button>
          <button type="button" class="btn btn-sm btn-secondary bt-close bt-dialog pl-4 pr-4"
            data-dismiss="modal"><?php echo $this->l('kbui-close'); ?></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Dialog Modal -->

  <div class="modal kb-modal-dialog" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="modal-dialog-content"></div>
          <hr>
          <div style="text-align:right">
            <button type="button"
              class="btn btn-sm btn-primary btn-positive bt-dialog pl-4 pr-4"><?php echo $this->l('kbui-yes'); ?></button>
            <button type="button"
              class="btn btn-sm btn-secondary btn-negative bt-dialog pl-4 pr-4"><?php echo $this->l('kbui-no'); ?></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Snapshot Modal -->

  <div class="modal kb-modal-snapshot" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-dialog modal-dialog-centered" style="max-width:800px" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div style="text-align:right">
            <button type="button" class="btn btn-sm btn-primary btn-download bt-dialog pl-4 pr-4">
              <i class="fas fa-save"></i>&nbsp; <?php echo $this->l('kbui-download'); ?> </button>
            <button type="button"
              class="btn btn-sm btn-secondary btn-close bt-dialog pl-4 pr-4"><?php echo $this->l('kbui-close'); ?></button>
          </div>
          <hr>
          <div class="kb-snapshot" style="padding:1em"></div>
          <hr>
          <div style="text-align:right">
            <button type="button" class="btn btn-sm btn-primary btn-download bt-dialog pl-4 pr-4">
              <i class="fas fa-save"></i>&nbsp; <?php echo $this->l('kbui-download'); ?></button>
            <button type="button"
              class="btn btn-sm btn-secondary btn-close bt-dialog pl-4 pr-4"><?php echo $this->l('kbui-close'); ?></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="kb-node-selection-toolbar" style="display: none;">
    <div>
      <!-- <span class="bt-close float-right pr-3 pl-3 font-weight-bold" style="cursor: pointer; line-height: 1">&times;</span> -->
      <button type="button" class="close pr-2" style="line-height: 0.7;" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <h6 class="m-2"><?php echo $this->l('kbui-selection-tools'); ?></h6>
    </div>
    <hr class="m-2">
    <div style="margin: 0px 10px">
      <div><small><?php echo $this->l('kbui-nodes-selection'); ?></small></div>
      <div class="btn-group-vertical">
        <button class="bt-select-all btn btn-sm btn-outline-secondary text-left"><i class="fas fa-object-group"></i> <?php echo $this->l('kbui-all-nodes'); ?></button>
        <button class="bt-select-concepts btn btn-sm btn-outline-secondary text-left"><i class="far fa-object-group"></i> <?php echo $this->l('kbui-all-concepts'); ?></button>
        <button class="bt-select-links btn btn-sm btn-outline-secondary text-left"><i class="far fa-object-group"></i> <?php echo $this->l('kbui-all-links'); ?></button>
        <button class="bt-select-disconcepts btn btn-sm btn-outline-secondary text-left"><i class="far fa-object-group"></i> <?php echo $this->l('kbui-disconnected-concepts'); ?></button>
        <button class="bt-select-dislinks btn btn-sm btn-outline-secondary text-left"><i class="far fa-object-group"></i> <?php echo $this->l('kbui-disconnected-links'); ?></button>
      </div>
      <hr style="margin: 10px 0 0;">
      <style>
        .btn svg {
          color: #6c757d;
        }
        .btn:hover svg {
          color: #ffffff;
        }
      </style>
      <div><small><?php echo $this->l('kbui-horizontal-align'); ?></small></div>
      <div class="btn-group">
        <button class="bt-align-start btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-start" />
          </svg></button>
        <button class="bt-align-center btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-center" />
          </svg></button>
        <button class="bt-align-end btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-end" />
          </svg></button>
      </div>
      <hr style="margin: 10px 0 0;">
      <div><small><?php echo $this->l('kbui-vertical-align'); ?></small></div>
      <div class="btn-group">
        <button class="bt-align-top btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-top" />
          </svg></button>
        <button class="bt-align-middle btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-middle" />
          </svg></button>
        <button class="bt-align-bottom btn btn-sm btn-outline-secondary"><svg class="bi bi-alert-triangle"
            width="14" height="14" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"
            style="margin-top: -4px;">
            <use xlink:href="<?php echo $this->assets('vendors/bootstrap-icons/bootstrap-icons.svg'); ?>#align-bottom" />
          </svg></button>
      </div>
    </div>
  </div>

  <div class="kb-search-toolbar p-2" tabindex="-1" role="dialog" aria-hidden="true" style="position: absolute; width: 450px; left: 0; right: 0; margin: auto; display: none;">
    <div class="input-group input-group-sm p-2 bg-light border border-top-0 rounded-bottom">
      <input type="text" class="form-control input-keyword" value="" placeholder="<?php echo $this->l('kbui-search-keyword'); ?>..." />
      <div class="input-group-append">
          <button class="bt-find btn btn-sm btn-outline-secondary"><i class="fas fa-search"></i></button>
          <span class="search-status input-group-text">No results</span>
          <button class="bt-next btn btn-sm btn-outline-secondary"><i class="fas fa-chevron-down"></i></button>
          <button class="bt-prev btn btn-sm btn-outline-secondary"><i class="fas fa-chevron-up"></i></button>
      </div>
      <button class="bt-close btn btn-sm btn-outline-danger ml-2"><i class="fas fa-times ml-1 mr-1"></i></button>
    </div>
  </div>

</div>