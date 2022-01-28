<div class="container mt-3">
  <div class="col-md-12">
    <div class="card mb-4">
      <div class="card-header">
        <i class="bi bi-app me-2"></i> Modules
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-sm-6">
            <div class="row">
              <div class="col-6">
                <div class="border-start border-4 border-info px-3 mb-3"><small class="text-medium-emphasis">Installed</small>
                  <div class="fs-5 fw-semibold"><?php echo count($data['module-keys']); ?></div>
                </div>
              </div>

              <div class="col-6">
                <div class="border-start border-4 border-success px-3 mb-3"><small class="text-medium-emphasis">Active</small>
                  <div class="fs-5 fw-semibold"><?php echo count($data['active-modules']); ?></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="row">
              <div class="col-6">
                <div class="border-start border-4 border-warning px-3 mb-3"><small class="text-medium-emphasis">Inactive</small>
                  <div class="fs-5 fw-semibold"><?php echo count($data['module-keys']) - count($data['active-modules']); ?></div>
                </div>
              </div>
              <div class="col-6">
                <div class="border-start border-4 border-danger px-3 mb-3"><small class="text-medium-emphasis">Invalid</small>
                  <div class="fs-5 fw-semibold">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="app-modules" class="container">
  <div class="col-md-12">
    <div class="mb-3">
      <span class="text-secondary p-2"><small><small><em>Drag the module cards to order the priority on how they appear in the sidebar/menu.</em></small></small></span>
    </div>
    <div class="row">
      <?php foreach($data['module-keys'] as $k) : ?>
      <div class="col-md-3 module mb-3" data-key="<?php echo $k; ?>">
        <div class="card">
          <div class="card-header d-flex">
            <span class="flex-fill">
              <code class="fw-bold text-uppercase text-primary"><?php echo $k; ?></code>
            </span>
            <div class="form-check form-switch">
              <input class="form-check-input module-on-off" data-key="<?php echo $k; ?>" type="checkbox" id="flexSwitchCheckDefault" 
                <?php echo in_array($k, $data['active-modules']) ? 'checked' : ''; ?>>
            </div>
          </div>
          <div class="card-body">
            <span class="d-block mb-1 text-uppercase text-primary" style="font-size:.8rem"><small>Authority Configuration</small></span>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-secondary bt-info"><i class="bi bi-info-circle"></i> Properties</button>
              <!-- <button class="btn btn-warning bt-register"><i class="bi bi-key-fill"></i> Register</button>
              <button class="btn btn-danger bt-deregister"><i class="bi bi-slash-circle-fill"></i> Deregister</button> -->
            </div>
          </div>
        </div>
      </div>
      <?php endforeach; ?>
    </div>

  </div>
</div>



<div id="detail-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-grid me-2"></i> <span class="dialog-title">Module Properties</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="text-primary mb-2"><i class="bi bi-menu-button me-2"></i> Menus</div>
    <div class="list-menu scroll-y" style="max-height: 100px;"></div>
    <div class="text-end mt-2"><button class="btn btn-sm btn-primary bt-register-menu"><i class="bi bi-pencil"></i> Register Menus</button></div>
    <hr>
    <div class="text-primary mb-2"><i class="bi bi-gear-wide me-2"></i> Functions and Features</div>
    <div class="list-function scroll-y" style="max-height: 100px;"></div>
    <div class="text-end mt-2"><button class="btn btn-sm btn-primary bt-register-function"><i class="bi bi-pencil"></i> Register Functions</button></div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-5">OK</button>
  </div>
</div>