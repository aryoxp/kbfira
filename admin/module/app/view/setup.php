<div class="px-4 py-5 text-center bg-white">
  <h1 class="display-5 fw-bold mb-5">System Setup</h1>
  <div class="col-lg-9 col-md-9 col-sm-12 mx-auto">
    <p class="lead mb-4 alert alert-danger">This will install the database structure and necessary initial data.
      <br><span class="text-danger">Please proceed with EXTREME caution.</span></p>
    <p class="lead mb-4 alert alert-warning" role="alert">If you make changes to the database configuration file,<br><span class="text-danger">REFRESH</span> this page to load the new configuration setting.</p>
    <hr>
    <table class="table">
      <tr>
        <td>Database configuration file</td>
        <td><?php echo $db_config_file; ?></td>
          <td><?php echo $db_config_file_exists ? '<i class="bi bi-check-lg text-success"></i>' : '<i class="bi bi-x-lg text-danger"></i>'; ?></td>
      </tr>
      <tr>
        <td colspan="3">
          <span class="d-block text-start mb-2 text-primary">Select database configuration:</span>
          <select name="config-key" id="select-config-key" class="form-select mb-2">
          <?php
            foreach($db_config as $key => $val)
              echo '<option value="'.$key.'">'.$key.'</option>';
          ?>
          </select>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <div id="server-info" class="alert alert-secondary"></div>
        </td>
      </tr>
      <tr>
        <td valign="middle">Database configuration</td>
        <td colspan="2">
          <div id="config-content"></div>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <div id="config-status" class="alert"></div>
        </td>
      </tr>
    </table>
    <div class="d-grid gap-2">
      <div><button type="button" class="btn btn-primary btn-lg px-4 gap-3 bt-setup">Begin Database Setup</button></div>
      <p>Clicking this button will begin the database structure creation process.</p>
    </div>
    <hr>
    <div class="d-grid gap-2">
      <div id="config-status-init-data" class="alert alert-info">Perform initial data setup after database structure has been created.</div>
      <div><button type="button" class="btn btn-danger btn-lg px-4 gap-3 bt-setup-init-data">Set Initial Data</button></div>
      <p>Clicking this button will try to create an Administrator account <code>admin</code> without password to the selected database. If <code>admin</code> user exists, it will remove the password.</p><p class="h2"><span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> PROCEED WITH CAUTION!</span></p><p class="text-danger">Improper use might cause serious security issues.</p>
    </div>
  </div>
</div>