<div class="row mt-5">
  <div class="col-sm-10 col-md-8 col-lg-6 mx-auto">

    <?php if (isset($_SESSION['user'])) { ?>
    <span class="fs-1 mb-3">Hi, <?php echo $_SESSION['user']['name']; ?>!</span>
    <hr>
    <?php } ?>
    
    <div class="card shadow <?php if (isset($_SESSION['user'])) echo "d-none"; ?>" id="card-sign-in">
      <div class="card-body">
        <span class="text-primary">Sign In</span>
        <hr>
        <form class="form-sign-in">
          <div class="row d-flex align-items-center mb-2">
            <label class="col-sm-4">Username</label>
            <div class="col-sm-8">
              <input class="form-control" type="text" id="input-username">
            </div>
          </div>
          <div class="row d-flex align-items-center mb-2">
            <label class="col-sm-4">Password</label>
            <div class="col-sm-8">
              <input class="form-control" type="password" id="input-password">
            </div>
          </div>
          <hr>
          <div class="row">
            <div class="col text-end d-flex align-items-center justify-content-between">
              <span><a href="#">Forget password?</a></span>
              <button class="btn btn-primary bt-sign-in">Sign In</button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </div>
</div>