<?php $this->view('head.php', null, CoreView::CORE); ?>

<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <symbol id="check" viewBox="0 0 16 16">
    <title>Check</title>
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </symbol>
</svg>

<div class="container py-3">
  <header>
    <div class="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">
      <a href="/" class="d-flex align-items-center text-dark text-decoration-none">
        <!-- <svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" class="me-2" viewBox="0 0 118 94" role="img"><title>Bootstrap</title><path fill-rule="evenodd" clip-rule="evenodd" d="M24.509 0c-6.733 0-11.715 5.893-11.492 12.284.214 6.14-.064 14.092-2.066 20.577C8.943 39.365 5.547 43.485 0 44.014v5.972c5.547.529 8.943 4.649 10.951 11.153 2.002 6.485 2.28 14.437 2.066 20.577C12.794 88.106 17.776 94 24.51 94H93.5c6.733 0 11.714-5.893 11.491-12.284-.214-6.14.064-14.092 2.066-20.577 2.009-6.504 5.396-10.624 10.943-11.153v-5.972c-5.547-.529-8.934-4.649-10.943-11.153-2.002-6.484-2.28-14.437-2.066-20.577C105.214 5.894 100.233 0 93.5 0H24.508zM80 57.863C80 66.663 73.436 72 62.543 72H44a2 2 0 01-2-2V24a2 2 0 012-2h18.437c9.083 0 15.044 4.92 15.044 12.474 0 5.302-4.01 10.049-9.119 10.88v.277C75.317 46.394 80 51.21 80 57.863zM60.521 28.34H49.948v14.934h8.905c6.884 0 10.68-2.772 10.68-7.727 0-4.643-3.264-7.207-9.012-7.207zM49.948 49.2v16.458H60.91c7.167 0 10.964-2.876 10.964-8.281 0-5.406-3.903-8.178-11.425-8.178H49.948z" fill="currentColor"></path></svg> -->
        <span class="fs-4">Kit-Build</span>
      </a>

      <nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">
        <a class="me-3 py-2 text-dark text-decoration-none" href="<?php echo $this->location('publication'); ?>">Publications</a>
        <a class="me-3 py-2 text-dark text-decoration-none" href="<?php echo $this->location('award'); ?>">Awards</a>
        <a class="me-3 py-2 text-dark text-decoration-none" href="<?php echo $this->location('docs'); ?>">Documentation</a>
        <a class="me-3 py-2 text-dark text-decoration-none" href="https://github.com/aryoxp/kbfira">GitHub</a>
        <a class="py-2 text-dark text-decoration-none" href="<?php echo $this->location('../admin'); ?>">Administration</a>
        <!-- <a class="py-2 text-dark text-decoration-none" href="#">Development</a> -->
      </nav>
    </div>

    <div class="pricing-header p-3 pb-md-4 mx-auto text-center mb-5">
      <h1 class="display-4 fw-normal">Kit-Build Concept Map</h1>
      <p class="mx-auto col-6 col-md-8 mt-5 mb-5"><span class="fst-italic fw-bold">The idea:</span> Learning with concept map is fun. <strong>Solve the puzzle:</strong> Learn by recomposing a kit while sharing one's knowledge and understanding. And <strong>what's great?</strong> Kit-Build made analysis to the recomposition easy. <strong>Real-time collaboration</strong> in concept mapping? No worries, Kit-Build system supports it!</p>
      <div class="mx-auto">
        <a type="button" href="<?php echo $this->location('../demo'); ?>" class="btn btn-lg btn-primary mx-2"><i class="bi bi-check-circle"></i> Try the demo</a>
        <a type="button" class="btn btn-lg btn-danger mx-2" href="https://www.youtube.com/watch?v=q-zgODOKFN4"><i class="bi bi-youtube"></i> Watch Intro</a>
        <a type="button" class="btn btn-lg btn-warning mx-2" href="<?php echo $this->location('publication'); ?>"><i class="bi bi-book"></i> Publications</a>
      </div>
    </div>
  </header>

  <main>
    <div class="row row-cols-1 row-cols-md-4 mb-3 text-center">

      <!-- <div class="col d-flex flex-column">
        <div class="card mb-4 rounded-3 shadow-sm flex-fill border-primary">
          <div class="card-header py-3 flex-fill bg-primary text-white">
            
          </div>
          <div class="card-body flex-fill">
            
          </div>
          <div class="px-3 pb-3">
            <button type="button" class="w-100 btn btn-lg btn-primary">Get started</button>
          </div>
        </div>
      </div> -->
      <div class="col d-flex flex-column">
        <div class="card mb-4 rounded-3 shadow-sm flex-fill border-secondary">
          <div class="card-header py-3 bg-secondary text-white">
            <h4 class="my-0 fw-normal text-nowrap text-truncate">Concept Map</h4>
          </div>
          <div class="card-body flex-fill">
            <div class="my-3">
              <p>Standard concept mapping activity. Compose concept maps from scratch. Make a kit from a concept map.</p>
            </div>
          </div>
          <div class="px-3 pb-3">
            <div class="btn-group">
              <a type="button" href="<?php echo $this->location('../cmap'); ?>" class="btn btn-lg btn-danger">Get started</a>
              <a type="button" class="btn btn-lg btn-outline-danger"><i class="bi bi-book"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div class="col d-flex flex-column">
        <div class="card mb-4 rounded-3 shadow-sm flex-fill border-secondary">
          <div class="card-header py-3 bg-secondary text-white">
            <h4 class="my-0 fw-normal text-nowrap text-truncate">Kit-Build</h4>
          </div>
          <div class="card-body flex-fill">
            <div class="my-3">
              <p>Recomposing concept maps from predesigned kits of a complete concept map.</p>
            </div>
          </div>
          <div class="px-3 pb-3">
            <div class="btn-group">
              <a type="button" href="<?php echo $this->location('../kitbuild'); ?>" class="btn btn-lg btn-primary">Get started</a>
              <a type="button" class="btn btn-lg btn-outline-primary"><i class="bi bi-book"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div class="col d-flex flex-column">
        <div class="card mb-4 rounded-3 shadow-sm flex-fill border-secondary">
          <div class="card-header py-3 bg-secondary text-white">
            <h4 class="my-0 fw-normal text-nowrap text-truncate">Mixed</h4>
          </div>
          <div class="card-body flex-fill">
            <div class="my-3">
              <p>Recomposing concept maps from predesigned kits is not enough? Extend the concept maps more.</p>
            </div>
          </div>
          <div class="px-3 pb-3">
            <div class="btn-group">
              <a type="button" href="<?php echo $this->location('../mixed'); ?>" class="btn btn-lg btn-warning">Get started</a>
              <a type="button" class="btn btn-lg btn-outline-warning text-dark"><i class="bi bi-book"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div class="col d-flex flex-column">
        <div class="card mb-4 rounded-3 shadow-sm flex-fill border-secondary">
          <div class="card-header py-3 bg-secondary text-white">
            <h4 class="my-0 fw-normal text-nowrap text-truncate">Extended</h4>
          </div>
          <div class="card-body flex-fill">
            <div class="my-3">
              <p>Guide the students on how to recompose large concept maps with this extended Kit-Build.</p>
            </div>
          </div>
          <div class="px-3 pb-3">
            <div class="btn-group">
              <a type="button" href="<?php echo $this->location('../extended'); ?>" class="btn btn-lg btn-success">Get started</a>
              <a type="button" class="btn btn-lg btn-outline-success text-success"><i class="bi bi-book"></i></a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-5">

    <div class="text-center">
      <h4 class="mx-auto h4">Interested in deploying or developing the Kit-Build system?</h4>
      <div>Go to the repository, read the documentation, and start developing now.</div>
      <div class="mt-3">
        <a type="button" class="btn btn-lg btn-primary" href="https://github.com/aryoxp/kbfira"><i class="bi bi-github"></i> Fork on GitHub</a>
      </div>
    </div>

    <hr class="my-5">

    <div class="text-center">
      <h4 class="mx-auto h6 mb-4">This system is made available with the following awesome open source projects:</h5>
      <div class="text-center d-flex justify-content-center">
        <span><a href="https://js.cytoscape.org/" class="text-decoration-none"><img src="<?php echo $this->asset('images/cytoscape.png'); ?>" width="72" class="p-2 mx-2"><br>CytoscapeJS</a></span>
        <a href="https://jquery.com" class="text-decoration-none"><img src="<?php echo $this->asset('images/jquery.png'); ?>" width="72" class="p-2 mx-2"><br>jQuery</a>
        <a href="https://getbootstrap.com/" class="text-decoration-none"><img src="<?php echo $this->asset('images/bs.png'); ?>" width="87" class="mx-2">
        <br>Bootstrap</a>
        <a href="https://socket.io/" class="text-decoration-none"><img src="<?php echo $this->asset('images/socket-io.png'); ?>" width="72" class="p-2 mx-2"><br>Socket.IO</a>
      </div>
    </div>

    
  </main>

  <footer class="pt-4 my-md-5 pt-md-5 border-top">
    <div class="row">
      <div class="col-12 col-md">
        <small class="d-block mb-3 text-muted">&copy; 2018-<?php echo date('Y'); ?><br>Learning Engineering Laboratory, Hiroshima University, Japan<br>Faculty of Computer Science, Brawijaya University, Indonesia</small>
      </div>
      <!-- <div class="col-6 col-md">
        <h5>Features</h5>
        <ul class="list-unstyled text-small">
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Cool stuff</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Random feature</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Team feature</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Stuff for developers</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Another one</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Last time</a></li>
        </ul>
      </div>
      <div class="col-6 col-md">
        <h5>Resources</h5>
        <ul class="list-unstyled text-small">
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Resource</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Resource name</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Another resource</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Final resource</a></li>
        </ul>
      </div>
      <div class="col-6 col-md">
        <h5>About</h5>
        <ul class="list-unstyled text-small">
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Team</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Locations</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Privacy</a></li>
          <li class="mb-1"><a class="link-secondary text-decoration-none" href="#">Terms</a></li>
        </ul>
      </div> -->
    </div>
  </footer>
</div>

<?php $this->pluginView('general-ui'); ?>
<?php $this->view('foot.php', null, CoreView::CORE); ?>