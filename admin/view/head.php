<?php $this->view('head.php', $data, CoreView::CORE); ?>

<!-- <button class="btn btn-primary bt-toast">Toast</button> -->

<div class="d-flex flex-column flex-fill" style="height: 100%;">
  <header class="border-bottom">
    <div class="d-flex flex-nowrap align-items-stretch">
      
      <div class="sidebar-panel overflow-hidden <?php echo $sidebarcollapse ? 'collapsed' : ''; ?>">
        <a href="/" class="text-dark text-decoration-none mx-3 my-2 d-flex align-items-center" style="white-space: nowrap;">
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
          <span class="text-secondary text-nowrap"><?php echo ($title); ?></span>
          <span class="fs-4 mx-3 text-muted">&middot;</span>
        </span>
        <?php endif; ?>

        <div class="flex-fill flex-nowrap text-nowrap overflow-hidden d-flex align-items-stretch" style="position:relative; width: 100px">
          <ul id="nav-bar" class="nav scroll-x d-flex align-items-center flex-nowrap">
            <li><a href="#" class="nav-link px-2 link-secondary flex-nowrap">Concept Mapping</a></li>
            <li><a href="#" class="nav-link px-2 link-secondary flex-nowrap">Analyzer</a></li>
            <li><a href="#" class="nav-link px-2 link-secondary flex-nowrap">Administration</a></li>
          </ul>
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
          <div class="dropdown text-end mx-3">
            <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="h4 text-secondary bi bi-person-circle"></i>
              <!-- <img src="https://github.com/mdo.png" alt="mdo" width="28" height="28" class="rounded-circle"> -->
            </a>
            <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser1">
              <!-- <li><a class="dropdown-item" href="#">Settings</a></li> -->
              <li><a class="dropdown-item" href="<?php echo $this->location('home/profile'); ?>">Profile</a></li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <?php if(isset($_SESSION['user'])) : ?>
              <li><a class="dropdown-item bt-app-sign-out text-danger" href="#"><i class="bi bi-box-arrow-right"></i> Sign out</a></li>
              <?php else: ?>
              <li><a class="dropdown-item bt-app-sign-in text-primary" href="#"><i class="bi bi-box-arrow-in-right"></i> Sign in</a></li>
              <?php endif; ?>
            </ul>
          </div>
          <!-- <a class="px-3" role="button">
            <i class="bi bi-fullscreen"></i>
          </a>
          <a class="px-3 admin-toggle-sidepanel" role="button">
            <i class="bi bi-layout-sidebar-reverse"></i>
          </a> -->
        </div>

      </div>
    </div>
  </header>
  <div id="admin-app-container" class="d-flex flex-fill">
    <div id="admin-sidebar-panel" class="sidebar-panel border-end scroll-y <?php echo $sidebarcollapse ? 'collapsed' : ''; ?>">

      <div class="admin-sidebar-inner px-3">
        <ul>
          <li class="admin-sidebar-heading">Dashboards</li>
          <li>
            <a href="<?php echo $this->location(); ?>">
              <i class="bi bi-house"></i> Dashboard
            </a>
          </li>
        <?php
          $this->buildMenu = function($menu, $lv = 1, $app = '') {
            foreach($menu as $m) {
              $hasMenu = @$m->menu && count($m->menu);
              $hasMenuClass = $hasMenu ? ' has-submenu collapsed' : '';
              echo '<li '. (property_exists($m, 'id') ? 'data-id="' . $app . "-" . $m->id . '"' : '') . ' class="mb-1">';
              echo '<a '. (!$hasMenu && @$m->url ? 'href="' . $this->location($m->url, 'm/x/') . '" ' : '').' class="'.$hasMenuClass.'">';
              if ($lv == 1 && @$m->icon) echo '<i class="bi bi-'.$m->icon.'"></i>';
              echo '<span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">'.$m->label."</span>";
              echo '</a>';
              if ($hasMenu) {
                echo "<ul>";
                ($this->buildMenu)($m->menu, $lv + 1, $app);
                echo "</ul>";
              }
              echo '</li>';

            }
          };
          foreach($menus as $app => $menu) {
            if (is_array($menu)) {
              foreach($menu as $m) {
                if (@$m->heading)
                  echo '<li class="admin-sidebar-heading">'.$m->heading.'</li>';
                ($this->buildMenu)($m->menu, 1, $app);
              }
              continue;
            }
            if (@$menu->heading)
              echo '<li class="admin-sidebar-heading">'.$menu->heading.'</li>';
            ($this->buildMenu)($menu->menu, 1, $app);
          }
        ?>
        </ul>
      </div>


    </div>
    <div id="admin-content-panel" class="d-flex flex-column flex-fill scroll-y">
