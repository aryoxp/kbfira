<?php $this->view('head.php', $data, CoreView::CORE); ?>

<!-- <button class="btn btn-primary bt-toast">Toast</button> -->

<div class="d-flex flex-column flex-fill" style="height: 100%;">
  <header class="border-bottom">
    <div class="d-flex flex-nowrap align-items-stretch">
      
      <div class="sidebar-panel overflow-hidden <?php echo $sidebarcollapse ?? ''; ?>">
        <a href="<?php echo $this->location('../home'); ?>" class="text-dark text-decoration-none mx-3 my-2 d-flex align-items-center" style="white-space: nowrap;">
          <i class="bi bi-slash-square-fill me-2 text-danger fs-4" role="img" aria-label="Bootstrap"></i>
          <span class="text-dark">Kit-Build</span>
        </a>
      </div>
      

      <div class="d-flex nav col me-lg-auto shadow align-items-stretch flex-nowrap">

        <div class="d-flex align-items-center">
          <a class="d-flex px-3 admin-toggle-sidebar" role="button">
            <i class="bi bi-list fs-3"></i>
          </a>
        </div>

        <?php if (isset($title)) : ?>
        <span id="page-title" class="fs-5 d-flex align-items-center">
          <span class="text-dark text-nowrap"><?php echo ($title); ?></span>
          <!-- <span class="fs-4 mx-3 text-muted">&middot;</span> -->
        </span>
        <?php endif; ?>

        <div class="flex-fill flex-nowrap text-nowrap overflow-hidden d-flex align-items-stretch" style="position:relative; width: 100px">
        </div>

        <div class="d-flex align-items-center ms-3">
          <?php 
            $controller = MController::instance() ? 
              (MController::instance())->get(MController::CONTROLLERID) : 
              Core::instance()->lib(Core::URI)->get(CoreUri::CONTROLLERID);
          ?>
          <form action="<?php echo $this->location($controller . '/search'); ?>" method="get">
            <input type="search" name="q" class="form-control form-control-sm" placeholder="Search..." aria-label="Search">
          </form>
          <div class="dropdown ms-3" id="lang-selection">
            <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="current-lang" data-bs-toggle="dropdown" aria-expanded="false">
              <small id="lang-label" data-lang="" class="text-primary"></small>
            </a>
            <ul id="dd-lang" class="dropdown-menu text-small" aria-labelledby="current-lang">
              <li><a class="dropdown-item item-lang" role="button" data-code="en">English</a></li>
              <li><a class="dropdown-item item-lang" role="button" data-code="jp">日本語</a></li>
              <li><a class="dropdown-item item-lang" role="button" data-code="id">Bahasa Indonesia</a></li>
            </ul>
          </div>
          <div class="dropdown text-end mx-3">
            <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="h4 text-secondary bi bi-person-circle"></i>
              <!-- <img src="https://github.com/mdo.png" alt="mdo" width="28" height="28" class="rounded-circle"> -->
            </a>
            <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser1">
              <!-- <li><a class="dropdown-item" href="#">Settings</a></li> -->
              <li><a class="dropdown-item" href="<?php echo $this->location('home/profile'); ?>">
                <?php echo (isset($_SESSION['user'])) ? $_SESSION['user']['name'] : "Profile"; ?>
                <?php if (isset($_SESSION['user'])) {
                  $user = $_SESSION['user'];
                  if (isset($user['roles'])) {
                    echo '<span class="mb-1 d-block">';
                    $roles = explode(",", $user['roles']);
                    foreach($roles as $r) {
                      echo '<span class="badge rounded-pill bg-primary me-1">' . $r . '</span>';
                    }
                    echo '</span>';
                  }
                  if (isset($user['groups'])) {
                    echo '<span class="mb-1 d-block">';
                    $groups = explode(",", $user['groups']);
                    foreach($groups as $g) {
                      echo '<span class="badge rounded-pill bg-warning text-dark me-1">' . $g . '</span>';
                    }
                    echo '</span>';
                  }
                } ?>
              </a>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <?php if(isset($_SESSION['user'])) : ?>
              <li><a class="dropdown-item bt-app-sign-out" href="#">
                <span class="btn btn-sm btn-danger">Sign out <i class="bi bi-box-arrow-right"></i></span>
              </a>
              </li>
              <?php else: ?>
              <li><a class="dropdown-item bt-app-sign-in" href="#">
                <span class="btn btn-sm btn-primary"><i class="bi bi-box-arrow-in-right"></i> Sign in</a></span>
              </li>
              <?php endif; ?>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </header>
  <div id="admin-app-container" class="d-flex flex-fill">
    <div id="admin-sidebar-panel" class="sidebar-panel border-end scroll-y <?php echo $sidebarcollapse ? 'collapsed' : ''; ?>">

      <div class="admin-sidebar-inner px-3">
        <ul>
          <!-- <li class="admin-sidebar-heading">Dashboard</li> -->
          <li>
            <a href="<?php echo $this->location(); ?>" class="text-primary">
              <i class="bi bi-house"></i> Dashboard
            </a>
          </li>
        <?php
          
          function walk($ms, $lv = 1, $app = '', $pm = null) {
            if (is_array($ms)) {
              if ($pm) $pm->shouldShow = false;
              foreach($ms as $m) {
                $show = walk($m, $lv, $app);
                if ($show) $pm->shouldShow = true;
              }
            } else {
              if (isset($ms->menu)) {
                $ms->shouldShow = false;
                $ms->sub = true;
                walk($ms->menu, $lv + 1, $app, $ms);
              } else {
                $ms->sub = false;
                $ms->lv = $lv;
                if (isset($ms->auth) && !CoreAuth::isMenuAuthorized($app, $ms->id)) {
                  $ms->ok = false;
                } else $ms->ok = true;
                return $ms->ok;
              }
            }
          }
          walk($menus);
          // var_dump($menus);

          $this->dwalk = function($ms, $lv = 1, $app = '', $pm = null) {
            if (is_array($ms)) {
              foreach($ms as $m) ($this->dwalk)($m, $lv, $app);
            } else {
              if (isset($ms->menu)) { // it has sub-menus
                if (!$ms->shouldShow) return; // childs of this menu were not authorized, hide it.
                if (isset($ms->heading)) { // this is app heading
                  echo '<li class="admin-sidebar-heading">'.$ms->heading.'</li>';
                  ($this->dwalk)($ms->menu, $lv, $app, $ms);
                } else {
                  echo "<li>";
                  echo '<a class="has-submenu collapsed">';
                  if ($lv == 1 && @$ms->icon) echo '<i class="bi bi-'.$ms->icon.'"></i>';
                  echo '<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'.$ms->label."</span>";
                  echo '</a>';
                  echo "<ul>";
                  ($this->dwalk)($ms->menu, $lv + 1, $app, $ms);
                  echo "</ul>";
                  echo "</li>";
                }
              } else {
                echo "<li>";
                echo '<a '. (@$ms->url ? 'href="' . $this->location($ms->url, 'm/x/') . '" ' : '').'>';
                if ($lv == 1 && @$ms->icon) echo '<i class="bi bi-'.$ms->icon.'"></i>';
                echo '<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'.$ms->label."</span>";
                echo '</a>';
                echo "</li>";
              }
            }
          };

          if (isset($_SESSION['user'])) ($this->dwalk)($menus);

          // var_dump($menus);
          // $this->buildMenu = function($menu, $lv = 1, $app = '') {
          //   foreach($menu as $m) {
              
          //     if (isset($m->id) && !CoreAuth::isMenuAuthorized($app, $m->id)) continue;

          //     $hasMenu = @$m->menu && count($m->menu);
          //     $hasMenuClass = $hasMenu ? ' has-submenu collapsed' : '';
          //     echo '<li '. (property_exists($m, 'id') ? 'data-id="' . $app . "-" . $m->id . '"' : '') . ' class="mb-1">';
          //     echo '<a '. (!$hasMenu && @$m->url ? 'href="' . $this->location($m->url, 'm/x/') . '" ' : '').' class="'.$hasMenuClass.'">';
          //     if ($lv == 1 && @$m->icon) echo '<i class="bi bi-'.$m->icon.'"></i>';
          //     echo '<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'.$m->label."</span>";
          //     echo '</a>';
          //     if ($hasMenu) {
          //       echo "<ul>";
          //       ($this->buildMenu)($m->menu, $lv + 1, $app);
          //       echo "</ul>";
          //     }
          //     echo '</li>';

          //   }
          // };
          // foreach($menus as $app => $menu) {
          //   // if (!CoreAuth::isAppAuthorized($app)) continue;
          //   if (is_array($menu)) {
          //     foreach($menu as $m) {
          //       if (@$m->heading)
          //         echo '<li class="admin-sidebar-heading">'.$m->heading.'</li>';
          //       ($this->buildMenu)($m->menu, 1, $app);
          //     }
          //     continue;
          //   }
          //   if (@$menu->heading)
          //     echo '<li class="admin-sidebar-heading">'.$menu->heading.'</li>';
          //   ($this->buildMenu)($menu->menu, 1, $app);
          // }
        ?>
        </ul>
      </div>


    </div>
    <div id="admin-content-panel" class="d-flex flex-column flex-fill scroll-y">
