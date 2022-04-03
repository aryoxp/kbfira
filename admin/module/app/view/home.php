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
  <button class="btn btn-primary bt-add-app"><i class="bi bi-plus"></i> Register App</button>
  <div class="row mt-3">
    <?php 
    $appkeys = [];
    foreach($data['apps'] as $app) :
      $appkeys[] = $app->app;
      if (in_array($app->app, $data['modules'])) continue;
    ?>
    <div class="col-md-3 app mb-3" data-key="<?php echo $app->app; ?>">
      <div class="card">
        <div class="card-header d-flex">
          <span class="flex-fill">
            <code class="fw-bold text-uppercase text-primary"><?php echo $app->app; ?></code>
          </span>
          <div class="form-check form-switch">
            <input class="form-check-input app-on-off" data-key="<?php echo $app->app; ?>" type="checkbox" id="flexSwitchCheckDefault"
              <?php echo in_array($app->app, $data['active-modules']) ? 'checked' : ''; ?>>
          </div>
        </div>
        <div class="card-body">
          <span><?php echo $app->name; ?></span>
          <?php if ($app->shortdesc) echo '<br><small class="text-muted">' . $app->shortdesc . '</small>'; ?>
          <span class="d-block mb-1 text-uppercase text-primary" style="font-size:.8rem"><small>Authority Configuration</small></span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-warning text-dark bt-info" data-section="menu"><i class="bi bi-menu-button"></i> Menus</button>
            <button class="btn btn-warning text-dark bt-info" data-section="function"><i class="bi bi-gear-wide"></i> Functions</button>
            <!-- <button class="btn btn-warning bt-register"><i class="bi bi-key-fill"></i> Register</button>
            <button class="btn btn-danger bt-deregister"><i class="bi bi-slash-circle-fill"></i> Deregister</button> -->
          </div>
        </div>
      </div>
    </div>
    <?php endforeach; ?>
  </div>
  <hr>
  <div class="col-md-12">
    <div class="mb-3">
      <span class="text-secondary p-2"><small><small><em>Drag the module cards to order the priority on how they appear in the sidebar/menu.</em></small></small></span>
    </div>
    <div class="row">
      <?php foreach($data['module-keys'] as $k) : if (!in_array($k, $modules)) continue; ?>
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
            <?php if (!in_array($k, $data['app-keys'])): ?>
              <button class="btn btn-sm btn-warning bt-register-module"><i class="bi bi-key-fill"></i> Register</button>
            <?php endif; ?>
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

<form id="app-dialog" class="card d-none app-form">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-grid me-2"></i> <span class="dialog-title">Add App</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="row g-3 needs-validation" novalidate>
      <div class="col-md-4">
        <label for="input-app" class="form-label">App ID <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="input-app" value="" required>
        <div class="invalid-feedback">
          Alphanumeric value without white space character ONLY.
        </div>
      </div>
      <div class="col-md-8">
        <label for="input-name" class="form-label">App name <span class="text-danger">*</span></label>
        <input type="text" class="form-control" id="input-name" value="" required>
        <div class="invalid-feedback">
          Required
        </div>
      </div>
      <div class="col-md-12">
        <label for="input-shortdesc" class="form-label">Short Description</label>
        <input type="text" class="form-control" id="input-shortdesc" value="">
      </div>
      <div class="col-md-12">
        <label for="input-description" class="form-label">Description</label>
        <textarea class="form-control" id="input-description" rows="3"></textarea>
      </div>
    </div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-primary bt-add px-5">Add</button>
    <button class="btn btn-sm btn-secondary bt-close px-5"><?php echo Lang::l('cancel'); ?></button>
  </div>
</form>

<div id="app-detail-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-grid me-2"></i> <span class="dialog-title">Application Properties</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div id="section-menu" class="d-none">
      <div class="text-primary mb-2"><i class="bi bi-menu-button me-2"></i> Menus 
        <span class="badge rounded-pill bg-warning text-dark ms-3 bt-def-menu" role="button">Definition</span>
      </div>
      <div class="def-menu d-none">
        <small>Paste menu definition in JSON format here:</small>
        <textarea class="form-control" id="input-json-menu"></textarea>
        <button class="btn btn-sm btn-warning my-2 bt-parse-menu"><i class="bi bi-gear-fill"></i> Parse</button>
      </div>
      <div class="list-menu scroll-y" style="max-height: 100px;"></div>
      <div class="text-end mt-2"><button class="btn btn-sm btn-primary bt-register-menu"><i class="bi bi-pencil"></i> Register Menus</button></div>
    </div>
    <div id="section-function" class="d-none">
      <div class="text-primary mb-2"><i class="bi bi-gear-wide me-2"></i> Functions and Features
        <span class="badge rounded-pill bg-warning text-dark ms-3 bt-def-function" role="button">Definition</span>
      </div>
      <div class="def-function d-none">
        <small>Paste function definition in JSON format here:</small>
        <textarea class="form-control" id="input-json-function"></textarea>
        <button class="btn btn-sm btn-warning my-2 bt-parse-function"><i class="bi bi-gear-fill"></i> Parse</button>
      </div>
      <div class="list-function scroll-y" style="max-height: 100px;"></div>
      <div class="text-end mt-2"><button class="btn btn-sm btn-primary bt-register-function"><i class="bi bi-pencil"></i> Register Functions</button></div>
    </div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-5"><?php echo Lang::l('ok'); ?></button>
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
    <button class="btn btn-sm btn-secondary bt-close px-5"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>