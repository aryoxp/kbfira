<!-- <header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New Topic
  </button>
</header> -->
<div class="d-flex flex-column flex-fill">
  <div class="row gx-0" id="search-panel">
    <div class="col-6">
      <div class="border rounded bg-white m-2 me-0">
        <h4 class="px-3 pt-2 pb-0">Search Teacher Maps</h4>
        <form class="m-2" id="form-search-cmap">
          <div class="input-group">
            <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword"
              aria-label="Keyword">            
            <select name="perpage" class="form-select flex-shrink-1 input-perpage">
              <option value="1">1</option>
              <option value="5" selected>5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
          </div>
          <div class="dropdown mt-1">
            <div class="px-2 dropdown-menu dropdown-menu-teacher-map-list shadow" style="width: 500px; z-index: 1">
              <div>
                <div class="border-bottom pb-2 d-flex justify-content-between align-items-center">
                  <span class="ms-2 text-primary">Concept Map Name</span>
                  <span class="badge rounded-pill bg-danger px-3 bt-close" role="button"><?php echo Lang::l('close'); ?></span>
                </div>
                <div id="list-cmap"></div>
              </div>
              <nav aria-label="" class="mt-3">
                <ul id="pagination-cmap" class="pagination justify-content-center"></ul>
              </nav>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="col-6">
      <div class="border rounded bg-white m-2">
        <h4 class="px-3 pt-2 pb-0">Search Teacher Maps of Topic</h4>
        <form class="m-2" id="form-search-topic">
          <div class="input-group">
            <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword"
              aria-label="Keyword">
            <select name="perpage" class="form-select flex-shrink-1 input-perpage">
              <option value="1">1</option>
              <option value="5" selected>5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
          </div>
          <div class="dropdown mt-1">
            <div class="dropdown-menu dropdown-menu-topic-list p-0 shadow" style="width: 500px; z-index: 1">  
              <div class="m-2">
                <div class="border-bottom pb-2 d-flex justify-content-between align-items-center">
                  <span class="ms-2 text-primary">Topic Title</span>
                  <span class="badge rounded-pill bg-danger px-3 bt-close" role="button"><?php echo Lang::l('close'); ?></span>
                </div>
                <div id="list-topic"></div>
              </div>
              <nav aria-label="" class="mt-3">
                <ul id="pagination-topic" class="pagination justify-content-center"></ul>
              </nav>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="row gx-0 flex-fill">
    <div class="col d-flex p-2 pt-0">
      <div class="d-flex flex-fill align-items-stretch">
        <?php $this->pluginView('kitbuild-ui', ["id" => "teachermap-canvas"], 0); ?>
      </div>
    </div>
  </div>
</div>

<footer></footer>


<div id="assign-topic-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">Assign Topic</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="border-bottom mb-2 pb-2">
      <span class="h6">Concept Map Name: <span class="text-primary cmap-title"></span></span>
      <br>
      <span class="h6">Current assigned topic: <span class="text-primary cmap-topic"></span></span>
    </div>
    <form class="row form-assign-search-topic g-3 needs-validation" novalidate>
      <div class="col">
        <div class="input-group input-group-sm mb-3">
          <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage">
            <option value="1">1</option>
            <option value="5" selected>5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
          <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
        </div>
        <div class="list-topic"></div>
        <div class="list-topic-pagination pagination text-center"></div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>


<div id="assign-text-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-file-text-fill me-2"></i> <span class="dialog-title">Assign Text</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="py-2">
        <span>Concept Map: <span class="cmap-title text-primary"></span></span>
        <br>
        <span>Assigned Text: <span class="assigned-text"></span></span>
    </div>
    <form class="row form-assign-search-text g-3 needs-validation" novalidate>
      <div class="col">
        <div class="input-group input-group-sm mb-3">
          <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage">
            <option value="1">1</option>
            <option value="5" selected>5</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
          <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
        </div>
        <div class="list-text"></div>
        <div class="list-text-pagination pagination text-center"></div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>

<div id="teacher-map-detail-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-diagram-3 me-2"></i> 
    <span class="dialog-title">Teacher Map Detail</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body"></div>
  <div class="card-footer text-center">
    <button class="btn btn-sm btn-primary bt-close px-4"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>