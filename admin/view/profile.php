<div class="row mt-5 mb-5">
  <div class="col-sm-10 col-md-8 col-lg-6 mx-auto py-3 px-4 card shadow-sm">

    <?php if (isset($_SESSION['user'])) { // var_dump($data, $_SESSION['user']); 
      $user = $_SESSION['user'];
    ?>
    <div class="d-flex justify-content-between">
      <span>
        <span class="fs-2">Hi, <span class="text-primary"><?php echo $_SESSION['user']['name']; ?></span></span>.
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

    <hr>

    <h4 class="text-primary mb-3">Profile</h4>

    <form class="form-user-profile needs-validation flex-fill mt-1 mb-3" novalidate>
      <input type="hidden" id="input-user-username-current" value="<?php echo $user['username']; ?>">
      <div class="row gx-2 mb-2">
        <div class="col mt-2 d-flex flex-column">
          <label for="input-user-password">Full Name</label>
          <input type="text"class="form-control" id="input-user-name" placeholder="Full Name" value="<?php echo $user['name']; ?>" required>
          <div class="invalid-feedback">
            Please provide a name.
          </div>
        </div>
      </div>
      <div class="row gx-2">
        <div class="col">
          <label for="input-user-username">Username (for sign-in)</label>
          <input type="text" class="form-control" id="input-user-username" placeholder="Username" value="<?php echo $user['username']; ?>" disabled>
          <div class="invalid-feedback">
            Please provide a username.
          </div>
          <small class="text-muted ms-2 mt-1 d-block">If you would like to change your username, please contact your teacher or administrator.</small>
        </div>
      </div>
      <div class="row gx-2">
        <div class="col text-end mt-3">
          <button class="btn btn-primary bt-save-profile">Save Profile</button> 
        </div>
      </div>     
    </form>

    <hr>

    <h4 class="text-primary mb-3">Password</h4>

    <form class="form-change-password mb-3" novalidate>
      <div class="row gx-2 mb-2">
        <div class="col">
          <label for="input-user-password-current">Current Password</label>
          <input type="text" class="form-control" id="input-user-password-current" placeholder="Current Password">
          <div id="validation-password-current" class="invalid-feedback">
            Wrong current password.
          </div>
        </div>
      </div>
      <div class="row gx-2 mb-2">
        <div class="col">
          <label for="input-user-password">New Password</label>
          <input type="text" class="form-control" id="input-user-password" placeholder="Password">
          <div id="validation-password" class="invalid-feedback">
            Both New Password and Password (Repeat) must be the same.
          </div>
        </div>
      </div>
      <div class="row gx-2 mb-2">
        <div class="col">
          <label for="input-user-password-repeat">New Password (Repeat)</label>
          <input type="text" class="form-control" id="input-user-password-repeat" placeholder="Password (Repeat)">
          <div id="validation-password-repeat" class="invalid-feedback">
            Both New Password and Password (Repeat) must be the same.
          </div>
        </div>
      </div>
      <div class="row gx-2">
        <div class="col mt-3 d-flex align-items-center">
          <!-- <span class="password-entry-status text-danger">Invalid</span> -->
        </div>
        <div class="col text-end mt-3">
          <button class="btn btn-primary btn-save-profile">Change Password</button> 
        </div>
      </div>
    </form>


    <?php } else { ?>

      <div class="d-flex justify-content-between">
        <span class="fs-2">Welcome!</span>
        <span class="fs-2 ms-4">
          <a class="btn btn-primary text-nowrap bt-app-sign-in">Sign In</a>
        </span>
      </div>
      <hr>
      <p>Please sign-in to utilize this system.</p>

    <?php } ?>

  </div>
</div>