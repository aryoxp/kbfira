<div class="app-navbar d-flex p-2 border-bottom justify-content-between">
  <span class="left-stack">

    <div class="btn-group btn-group-sm" id="review-modify-map">
      <button class="bt-modify btn btn-sm btn-primary pe-4"><i class="bi bi-chevron-left mx-2"></i><i class="bi bi-pencil-square"></i> Modify My Map</button>
    </div>

  </span>
  <span class="center-stack">  
    <div class="btn-group btn-group-sm ms-2" id="review-mymap">
      <button class="bt-mymap btn btn-primary"><i class="bi bi-person"></i> My Map</button>
    </div>
    <div class="btn-group btn-group-sm ms-2" id="review-feedbacklevel">
      <button class="bt-feedback btn btn-warning"><i class="bi bi-shuffle"></i> Comparison Map</button>
    </div>
    <div class="btn-group btn-group-sm ms-2" id="review-readcontent">
      <button class="bt-content btn btn-sm btn-secondary"><i class="bi bi-file-text-fill"></i> Contents</button>
    </div>
  </span>
  <span class="right-stack">
    <div class="btn-group btn-group-sm ms-5" id="review-finish">
      <button class="bt-finish btn btn-danger ps-4"><i class="bi bi-flag-fill"></i> Finish <i class="bi bi-chevron-right mx-2"></i></button>
    </div>
  </span>

</div>
<div class="d-flex flex-fill align-items-stretch p-2">
  <?php $this->pluginView('kitbuild-ui', ["id" => "review-canvas"], 0); ?>
</div>

<div id="kit-content-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-file-text"></i> <span class="dialog-title">Content</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body position-relative overflow-hidden overflow-scroll d-flex flex-fill mb-3">
    <div class="content text-secondary">
      <p>Est ex sunt exercitation exercitation voluptate veniam ad minim et magna ea sint. Sint Lorem consequat ex ullamco sint irure labore nisi nulla pariatur culpa quis excepteur officia. Exercitation qui consequat ipsum labore nostrud cillum incididunt eiusmod aliquip.</p>

      <p>
      Labore reprehenderit laborum excepteur eiusmod et. Culpa laborum excepteur irure mollit adipisicing ut anim sunt veniam. Quis laborum cupidatat id id ea do dolor velit. Aliqua aliquip exercitation proident consequat ullamco anim aute occaecat deserunt cillum deserunt. Esse magna labore dolor anim amet.</p>

      <p>
      Et enim irure excepteur enim est proident est tempor tempor velit. Laborum ex exercitation nulla anim incididunt nisi fugiat cillum officia fugiat dolor ad proident. Ad laborum eiusmod fugiat laboris sunt labore. Enim consectetur tempor minim nisi proident nulla ex pariatur et eu Lorem do sint non. Minim adipisicing do fugiat magna fugiat veniam do veniam.</p>

      <p>
      Dolore ipsum reprehenderit sint anim. Minim non reprehenderit quis amet est exercitation incididunt ad dolore do proident. Reprehenderit ullamco aute irure consequat sunt nulla sunt exercitation. In ullamco occaecat ipsum Lorem elit labore consectetur cillum sunt velit.</p>

      <p>
      Non nulla exercitation consequat minim anim qui eiusmod deserunt aliquip proident ea laborum consequat amet. Nisi aliqua sit commodo commodo aliquip sunt sint qui do laboris nisi cupidatat. Occaecat proident et reprehenderit esse dolor.</p>
    </div>
  </div>
  <div class="card-footer d-flex justify-content-between align-items-center">
    <span>
      <span class="bt-scroll-top btn btn-sm ms-1 btn-primary px-3"><i class="bi bi-chevron-bar-up"></i> Back to Top</span>
      <span class="bt-scroll-more btn btn-sm ms-1 btn-primary px-3"><i class="bi bi-chevron-down"></i> More</span>
    </span>
    <span>
      <button class="btn btn-sm btn-secondary bt-close px-3"><?php echo Lang::l('close'); ?></button>
      <button class="btn btn-sm resize-handle pe-0 ps-3"><i class="bi bi-textarea-resize"></i></button>
    </span>
  </div>
</div>


<div id="feedback-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">Quick Feedback</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="feedback-content"></div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-cancel bt-close px-5"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>