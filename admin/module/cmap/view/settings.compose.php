<div class="card mx-5 my-3">
  <div class="card-body">
    <h3 class="card-title mb-5">Concept Mapping Configuration<br><small class="h5"><code>admin/module/cmap/runtime/config.ini</code></small></h3>
    <div class="row">
      <div class="col-md-6 col-sm-12">
        <label for="input-cmap-app-runtime-path" class="form-label">App runtime path:</label>
        <div class="input-group">
          <input type="text" class="form-control" id="input-cmap-app-runtime-path" value="cmap/runtime/config.ini">
          <button class="btn btn-sm btn-primary bt-save-runtime"><i class="bi bi-download me-1"></i> Save</button>
        </div>
        <small class="d-block text-secondary mb-3 mt-1"><span class="text-danger">Warning!</span> Changing this value may affect other application's runtime configuration.</small>
        <button type="button" class="bt-reload-runtime btn btn-sm btn-primary mb-3"><i class="bi bi-upload me-1"></i> Reload Runtime Configuration</button>

        <hr>

        <div class="alert alert-warning" role="alert">
          <span><i class="bi bi-exclamation-triangle text-danger"></i> Configurations below will apply to application's runtime</span>
        </div>

        <label for="input-sign-in-group" class="form-label">Sign-in group IDs:</label>
        <div class="input-group">
          <input type="text" class="form-control" id="input-sign-in-group">
          <button class="btn btn-sm btn-primary bt-save-app-runtime"><i class="bi bi-download me-1"></i> Save</button>
        </div>
        <small class="d-block mb-3 text-secondary mt-1">Separate group IDs with comma <code class="bg-light">,</code> to allow multiple groups sign-in to the Concept Mapping app. If this configuration is set blank, users of all groups will be allowed to sign-in and use the application.</small>

        <label for="input-default-lang" class="form-label">Default Language:</label>
        <div class="input-group">
          <input type="text" class="form-control" id="input-default-lang">
          <button class="btn btn-sm btn-primary bt-save-app-runtime"><i class="bi bi-download me-1"></i> Save</button>
        </div>
        <small class="d-block mb-3 text-secondary mt-1">Valid values: <code class="bg-light">en</code>, <code class="bg-light">jp</code>, <code class="bg-light">id</code>.</small>

      </div>
    </div>
  </div>
</div>