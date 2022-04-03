<div class="row mt-5">
  <div class="col-sm-10 col-md-8 col-lg-6 mx-auto py-3 px-4 card shadow-sm">

    <?php if (isset($_SESSION['user'])) { // var_dump($data, $_SESSION['user']); ?>
    <div class="card-body d-flex justify-content-between mb-3">
      <span>
        <span class="fs-2"><?php echo $this->l('hello'); ?>, <span class="text-primary"><?php echo $_SESSION['user']['name']; ?></span></span>.
      <?php 
        $roles = ($_SESSION['user']['roles']) ? explode(",", $_SESSION['user']['roles']) : [];
        $rids = ($_SESSION['user']['rids']) ? explode(",", $_SESSION['user']['rids']) : [];
        if (count($roles)) {
          echo '<br><span>';
          foreach($roles as $r) {
            echo '<span class="badge rounded-pill bg-primary px-3 me-1">'.$r.'</span>';
          }
          echo '</span>';
        }
        $groups = ($_SESSION['user']['groups']) ? explode(",", $_SESSION['user']['groups']) : [];
        $gids = ($_SESSION['user']['gids']) ? explode(",", $_SESSION['user']['gids']) : [];
        if (count($groups)) {
          echo '<span>';
          foreach($groups as $g) {
            echo '<span class="badge rounded-pill bg-warning text-dark px-3 me-1">'.$g.'</span>';
          }
          echo '</span>';
        }
        // echo $_SESSION['user']['roles'];
      ?>
      </span>
      <span class="fs-2 ms-4">
        <a class="btn btn-danger text-nowrap bt-app-sign-out">Sign Out</a>
      </span>
    </div>
    <!-- <hr> -->
    <?php } else { ?>

      <div class="d-flex justify-content-between">
        <span class="fs-2">Welcome!</span>
        <span class="fs-2 ms-4">
          <a class="btn btn-primary text-nowrap bt-app-sign-in">Sign In</a>
        </span>
      </div>
      <hr>
      <p>This is system administration and management page.<br>Please <a class="bt-app-sign-in" role="button">sign-in</a> to use this feature.</p>

    <?php } ?>
    
    <!-- <div class="card shadow" id="card-sign-in">
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
    </div> -->

  </div>
</div>