<!-- Dialog Modal -->
<div class="modal" id="modal-dialog" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-body">
        <div class="dialog-head">
          <div class="dialog-title fw-bold"></div>
          <hr>
        </div>
        <div class="dialog-body d-flex align-items-center">
          <i class="dialog-icon fs-1 me-3 ms-2"></i>
          <div class="dialog-content" style="font-size:.9rem"></div>
        </div>
        <hr>
        <div class="dialog-foot">
          <button type="button" class="btn btn-sm btn-secondary bt-negative px-2 mx-2"><?php echo $this->l('no'); ?>No</button>
          <button type="button" class="btn btn-sm btn-primary bt-positive px-2"><?php echo $this->l('yes'); ?>Yes</button>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- /Dialog Modal -->
<!-- Loading Modal -->
<div class="modal" id="modal-loading" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-body">
        <div class="modal-loading text-center text-primary">
          <div class="animation"></div>
          <div class="mt-2"><span class="loading-text text-dark"></span></div>
        </div>
        <div id="modal-content"></div>
      </div>
    </div>
  </div>
</div>
<!-- /Loading Modal -->
<!-- SignIn Modal -->
<div class="card d-none" id="modal-sign-in" tabindex="-1" aria-hidden="true">
  <div class="card-body mx-3 text-center">
    <form name="form-sign-in" autocomplete="off">
      <h1 class="h3 mb-4 mt-4 fw-normal">Sign in</h1>
      <div class="form-floating">
        <input type="text" class="form-control rounded-0 rounded-top" id="input-username" placeholder="Username" autocomplete="new-password" style="margin-bottom: -1px;">
        <label for="input-username">Username</label>
      </div>
      <div class="form-floating">
        <input type="password" class="form-control rounded-0 rounded-bottom" id="input-password" placeholder="Password" autocomplete="new-password">
        <label for="input-password">Password</label>
      </div>

      <div class="checkbox mb-3 mt-2 mx-2">
        <label> <input type="checkbox" id="input-remember-me" value="remember-me"> Remember me </label>
      </div>
      <button class="w-100 btn btn-lg btn-primary bt-sign-in" type="submit">Sign in</button>
      <div id="sign-in-filter" class="text-center mt-3"></div>
      <p class="mt-5 mb-3 text-muted">&copy; 2017–2021</p>
    </form> 
  </div>
</div>
<!-- /SignIn Modal -->