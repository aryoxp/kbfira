<div class="d-flex flex-column vh-100">
  <a class="position-absolute d-flex align-items-center text-white px-3 text-decoration-none" href="<?php echo $this->location('../home'); ?>">
    <i class="bi bi-house pe-2" style="font-size: 1.8rem;"></i> <span>Home</span>
  </a>
  <div class="app-navbar d-flex p-2 ps-4" style="border-left: 125px solid #ff4444;">
    <span class="app-buttons">
      <div class="btn-group btn-group-sm">
        <button class="bt-new btn btn-primary"><i class="bi bi-asterisk"></i> New</button>
        <button class="bt-open btn btn-sm btn-primary"><i class="bi bi-folder2-open"></i> Open</button>
      </div>
      <div class="btn-group btn-group-sm ms-2">
        <button class="bt-save btn btn-primary"><i class="bi bi-save"></i> Save</button>
        <button class="bt-save-as btn btn-primary"><i class="bi bi-front"></i> Save As...</button>
      </div>
      <button class="bt-export btn btn-primary d-none"><i class="bi bi-send"></i> Export</button>
      <div class="btn-group btn-group-sm ms-2">
        <button class="bt-content btn btn-secondary"><i class="bi bi-file-earmark-text"></i> Content</button>
      </div>
    </span>
    <div class="flex-fill">&nbsp;</div>
    <span>
      <button class="btn btn-danger btn-sm bt-logout <?php if (!isset($_SESSION['user'])) echo 'd-none'; ?>"><i class="bi bi-power"></i> Logout</button>
      <button class="btn btn-primary btn-sm bt-sign-in <?php if (isset($_SESSION['user'])) echo 'd-none'; ?>"><i class="bi bi-power"></i> Sign In</button>
    </span>
  </div>
  <div class="d-flex flex-fill align-items-stretch p-2">
    <?php $this->pluginView('kitbuild-ui', ["id" => "goalmap-canvas"], 0); ?>
  </div>
  <div class="d-flex">
    <div class="status-panel flex-fill m-2 mt-0 d-flex"></div>
    <div class="status-control text-end m-2 mt-0"></div>
  </div>
</div>




<form id="concept-map-save-as-dialog" class="card d-none">
  <h6 class="card-header"><i class="bi bi-file-earmark-plus dialog-icon"></i> <span class="dialog-title">Save Concept Map As...</span></h6>
  <div class="card-body">
      <div class="row mb-1 align-items-center">
        <label for="input-title" class="col-sm-3 col-form-label">Title</label>
        <div class="col-sm-9">
          <input type="text" name="title" class="form-control form-control-sm input-title" id="input-title">
        </div>
      </div>
      <div class="row mb-1 align-items-center">
        <label for="input-fid" class="col-sm-3 col-form-label">Custom ID (Optional)</label>
        <div class="col-sm-9">
          <div class="input-group">
            <input type="text" class="form-control input-fid form-control-sm" name="fid" id="input-fid" style="text-transform: uppercase;" disabled>
            <button class="bt-generate-fid btn btn-warning btn-sm" disabled><i class="bi bi-magic"></i></button>
          </div>
        </div>
      </div>
      <div class="row my-2"><small class="col-sm-12 text-center text-secondary fst-italic"><strong class="fs-bold text-primary">optionally</strong> associate with a topic:</small></div>
      <div class="row mb-1 align-items-center">
        <!-- <label for="select-topic" class="col-sm-3 col-form-label">Topic (Optional)</label> -->
        <div class="col-sm-12">
          <div class="input-group input-group-sm">
            <select class="form-select form-control-sm" id="select-topic" name="topic" aria-label="Default select example" disabled>
              <option value="" selected>No topic associated</option>
              <!-- <option value="1">One</option>
              <option value="2">Two</option>
              <option value="3">Three</option> -->
            </select>
            <button class="btn btn-secondary bt-new-topic-form bt-sm" disabled><i class="bi bi-plus-lg"></i></button>
          </div>
        </div>
      </div>
      <div class="row my-2"><small class="col-sm-12 text-center text-secondary fst-italic"><strong class="fs-bold text-primary">optionally</strong> associate with existing text:</small></div>
      <div class="row mb-1 align-items-center">
        <div class="col-sm-12">
          <select class="form-select form-select-sm" id="select-text" name="text" aria-label="Default select example" disabled>
            <option value="" selected>No text associated</option>
            <!-- <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option> -->
          </select>
        </div>
      </div>
      
      <!-- <div class="row mb-1 align-items-center form-new-topic" style="display: none;">
        <div class="col-sm-12">
          <div class="card">
            <div class="card-body">
              <input type="text" class="form-control mb-1" placeholder="New Topic Name" aria-label="New Topic Name" aria-describedby="button-create-new-topic">
              <select class="form-select mb-1" id="select-grup" aria-label="Default select example">
                  <option selected>No group assigned</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
              </select>
              <button class="bt-quick-create-topic btn btn-secondary" type="button" id="button-create-new-topic"><i class="bi bi-plus-lg"></i> Create Topic</button>
            </div>
          </div>
        </div>
      </div> -->
  </div>
  <div class="card-footer">
    <div class="row">
      <div class="col text-end">
        <button class="bt-cancel btn btn-sm btn-secondary" style="min-width: 6rem;">Cancel</button>
        <button class="bt-save btn btn-sm btn-primary ms-1" style="min-width: 6rem;">Save</button>
      </div>
    </div>
  </div>
</form>



<form id="concept-map-open-dialog" class="card d-none">
  <h6 class="card-header"><i class="bi bi-folder2-open"></i> Open Concept Map</h6>
  <div class="card-body">
    <ul class="nav nav-pills" id="open-concept-map-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link px-2 py-1 active" id="home-tab" data-bs-toggle="tab" data-bs-target="#database" type="button" role="tab" aria-controls="home" aria-selected="true"><small>Database</small></button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link px-2 py-1 text-muted" id="profile-tab" data-bs-toggle="tab" data-bs-target="#decode" type="button" role="tab" aria-controls="profile" aria-selected="false" disabled><small>Decode</small></button>
      </li>
    </ul>
    <hr class="my-2">
    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="database" role="tabpanel" aria-labelledby="database-tab">
        <div class="row gx-2 mb-1">
          <div class="col d-flex">
            <span class="border-bottom px-2 py-1 flex-fill position-relative">Topic</span></div>
          <div class="col d-flex">
            <span class="border-bottom px-2 py-1 flex-fill position-relative">Concept Map</span></div>
        </div>
        <div class="row gx-2 mb-3">
          <div class="col list list-topic">
            <span class="topic list-item default" data-tid="">
              <em class="text-muted">Unassigned</em><bi class="bi bi-check-lg text-primary"></bi>
            </span>
          </div>
          <div class="col list list-concept-map"></div>
        </div>
        <div class="badge rounded-pill bg-secondary bt-refresh-topic-list" role="button">Refresh Topic List</div>
      </div>
      <div class="tab-pane fade" id="decode" role="tabpanel" aria-labelledby="decode-tab">
        <div class="mb-3">
          <label for="decode-textarea" class="form-label">Concept Map Data</label>
          <textarea class="form-control" id="decode-textarea" rows="4"></textarea>
        </div>
      </div>
    </div>
  </div>
  <div class="card-footer">
    <div class="row">
      <div class="col text-start">
        <span class="bt-open-topic btn btn-sm btn-success ms-1" role="button" style="min-width: 6rem;">Open Topic</span>
      </div>
      <div class="col text-end">
        <button class="bt-cancel btn btn-sm btn-secondary" style="min-width: 6rem;">Cancel</button>
        <button class="bt-open btn btn-sm btn-primary ms-1" style="min-width: 6rem;">Open</button>
      </div>
    </div>
  </div>
</form>

<div id="content-dialog" class="card d-none">
    <h6 class="card-header d-flex">
      <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-file-text"></i> <span class="dialog-title">Content</span></span>
      <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
    </h6>
    <div class="card-body position-relative overflow-hidden overflow-scroll d-flex flex-fill mb-3">
      <div class="content text-secondary">
        <!-- <p>Est ex sunt exercitation exercitation voluptate veniam ad minim et magna ea sint. Sint Lorem consequat ex ullamco sint irure labore nisi nulla pariatur culpa quis excepteur officia. Exercitation qui consequat ipsum labore nostrud cillum incididunt eiusmod aliquip.</p>
  
        <p>
        Labore reprehenderit laborum excepteur eiusmod et. Culpa laborum excepteur irure mollit adipisicing ut anim sunt veniam. Quis laborum cupidatat id id ea do dolor velit. Aliqua aliquip exercitation proident consequat ullamco anim aute occaecat deserunt cillum deserunt. Esse magna labore dolor anim amet.</p>
  
        <p>
        Et enim irure excepteur enim est proident est tempor tempor velit. Laborum ex exercitation nulla anim incididunt nisi fugiat cillum officia fugiat dolor ad proident. Ad laborum eiusmod fugiat laboris sunt labore. Enim consectetur tempor minim nisi proident nulla ex pariatur et eu Lorem do sint non. Minim adipisicing do fugiat magna fugiat veniam do veniam.</p>
  
        <p>
        Dolore ipsum reprehenderit sint anim. Minim non reprehenderit quis amet est exercitation incididunt ad dolore do proident. Reprehenderit ullamco aute irure consequat sunt nulla sunt exercitation. In ullamco occaecat ipsum Lorem elit labore consectetur cillum sunt velit.</p>
  
        <p>
        Non nulla exercitation consequat minim anim qui eiusmod deserunt aliquip proident ea laborum consequat amet. Nisi aliqua sit commodo commodo aliquip sunt sint qui do laboris nisi cupidatat. Occaecat proident et reprehenderit esse dolor.</p> -->
      </div>
    </div>
    <div class="card-footer d-flex justify-content-between align-items-center">
      <span>
        <span class="bt-scroll-top btn btn-sm ms-1 btn-primary px-3"><i class="bi bi-chevron-bar-up"></i> Back to Top</span>
        <span class="bt-scroll-more btn btn-sm ms-1 btn-primary px-3"><i class="bi bi-chevron-down"></i> More</span>
      </span>
      <span>
        <button class="btn btn-sm btn-secondary bt-close px-3">Close</button>
        <button class="btn btn-sm resize-handle pe-0 ps-3"><i class="bi bi-textarea-resize"></i></button>
      </span>
    </div>
  </div>

<div id="concept-map-export-dialog" class="card d-none">
  <h6 class="card-header"><i class="bi bi-send"></i> Export</h6>
  <div class="card-body">
    <textarea class="form-control encoded-data" rows="5"></textarea>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-cancel px-3">Cancel</button>
    <button class="btn btn-sm btn-primary ms-1 bt-clipboard px-3"><i class="bi bi-clipboard"></i> Copy to Clipboard</button>
  </div>
</div>

<!-- <div id="concept-map-copy-paste-dialog" class="card d-none">
  <h6 class="card-header"><i class="dialog-icon bi"></i> <span class="dialog-title">Copy</span></h6>
  <div class="card-body">
    <textarea class="form-control encoded-data" rows="5"></textarea>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-cancel px-3">Cancel</button>
    <button class="btn btn-sm btn-secondary bt-paste px-3 ms-1"><i class="bi bi-clipboard"></i> Paste Clipboard</button>
    <button class="btn btn-sm btn-primary ms-1 bt-copy-paste px-3"><i class="dialog-icon bi"></i> <span class="dialog-action">Copy</span></button>
  </div>
</div> -->
