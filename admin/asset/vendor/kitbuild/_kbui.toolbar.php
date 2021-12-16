<div class="kb-toolbar">
  <div class="btn-group">
    <button class="bt-plus btn btn-sm btn-outline-secondary" disabled>
      <i class="fas fa-plus"></i></button>
    <button class="bt-huebee btn btn-sm btn-outline-secondary d-flex" style="background-color: #fff"
      data-tippy-content="<?php echo $this->l('kbui-concept-node-color'); ?>">
      <span class="color-preview d-inline-block"
        style="width:15px; height:15px; background-color:#dedede; margin-top:.2rem;"></span>
    </button>
    <button class="bt-new-concept btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-new-concept'); ?>"><?php echo $this->l('kbui-concept'); ?></button>
    <button class="bt-new-link btn btn-sm btn-outline-info"
      data-tippy-content="<?php echo $this->l('kbui-new-link'); ?>"><?php echo $this->l('kbui-link'); ?></button>
  </div>
  <div class="btn-group" style="margin-left: 1em;">
    <button class="bt-undo btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-undo-last-action'); ?>">
      <i class="fas fa-undo"></i> <span class="bt-label"><?php echo $this->l('kbui-undo'); ?></span></button>
    <button class="bt-redo btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-redo-last-action'); ?>">
      <i class="fas fa-redo"></i> <span class="bt-label"><?php echo $this->l('kbui-redo'); ?></span></button>
  </div>
  <div class="btn-group" style="margin-left: 1em;">
    <button class="btn btn-sm btn-outline-secondary" disabled><span class="bt-label"><?php echo $this->l('kbui-zoom'); ?></span></button>
    <button class="bt-zoom-in btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-zoom-in'); ?>">
      <i class="fas fa-plus"></i>
    </button>
    <button class="bt-zoom-out btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-zoom-out'); ?>">
      <i class="fas fa-minus"></i>
    </button>
    <button class="bt-fit btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-zoom-fit'); ?>">
      <i class="fas fa-expand"></i>
    </button>
  </div>
  <div class="btn-group" style="margin-left: 1em;">
    <button class="btn btn-sm btn-outline-secondary" disabled><span class="bt-label"><?php echo $this->l('kbui-map'); ?></span></button>
    <button class="bt-center btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-center-map'); ?>">
      <i class="fas fa-compress"></i>
    </button>
    <button class="bt-search btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-search'); ?>">
      <i class="fas fa-search"></i>
    </button>
    <button class="bt-select-tool btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-selection-tools'); ?>">
      <i class="fas fa-object-group"></i>
    </button>
    <button class="bt-direction btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-enable-disable-direction'); ?>">
      <span class="fa-stack" style="height: 1em; line-height: 1em; width: 1em;">
        <i class="fas fa-slash fa-stack-1x d-none text-danger"></i>
        <i class="fas fa-long-arrow-alt-right fa-stack-1x"></i>
      </span>
    </button>
    <button class="bt-relayout btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-auto-layout-map-elements'); ?>">
      <i class="fas fa-bezier-curve"></i>
    </button>
    <button class="bt-save-image btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-save-as-image'); ?>">
      <i class="fas fa-image"></i>
    </button>
    <button class="bt-clear-canvas btn btn-sm btn-outline-primary"
      data-tippy-content="<?php echo $this->l('kbui-clear-canvas'); ?>">
      <i class="fas fa-trash-alt"></i>
    </button>
  </div>
</div>