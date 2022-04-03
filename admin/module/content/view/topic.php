<header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New Topic
  </button>
</header>
<div class="row gx-0">
  <div class="col-6">
    <div class="border rounded bg-white m-2">
      <form class="m-2" id="form-search-topic">
        <div class="input-group mb-3">
          <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage">
            <option value="1">1</option>
            <option value="5" selected>5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="btn btn-secondary bt-search"><i class="bi bi-search"></i></span>
        </div>
      </form>
      <div class="px-2">
        <div class="m-2">
          <div class="border-bottom py-2">
            <span class="ms-2 text-primary">Topic Title</span>
            <span>&nbsp;</span>
          </div>
          <div id="list-topic"></div>
        </div>
      </div>
      <nav aria-label="" class="mt-3">
        <ul id="pagination-topic" class="pagination justify-content-center"></ul>
      </nav>
    </div>    
  </div>
  <div class="col-6">
    <div class="m-2">
      <div id="detail-topic" class="border rounded bg-white p-3"><em>Please select a topic from the list to show its detail information.</em></div>
    </div>
  </div>
</div>
<footer></footer>


<div id="topic-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">New Topic</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <form class="row form-topic g-3 needs-validation" novalidate>
      <div class="col">
        <input type="text" class="form-control" id="input-title" placeholder="Topic Title" required>
        <div class="invalid-feedback">
          Please provide a title for the topic.
        </div>
        <div class="input-group has-validation mt-2">
          <input type="text" class="form-control text-uppercase" id="input-tid" placeholder="Topic ID" required>
          <button class="bt-generate-tid btn btn-warning"><i class="bi bi-magic"></i></button>
          <div class="invalid-feedback">
            Please provide a unique ID for the topic (50 chars max).
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('cancel'); ?></button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>


<div id="text-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-file-text-fill me-2"></i> <span class="dialog-title">Assign Text</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div id="topic-title" class="text-primary py-2"></div>
    <div id="assigned-text"></div>
    <hr class="my-3">
    <form class="row form-search-text g-3 needs-validation" novalidate>
      <div class="col">
        <div class="input-group input-group-sm">
          <input type="text" class="form-control" id="input-keyword" placeholder="Keyword">
          <button class="btn btn-primary"><i class="bi bi-search"></i></button>
        </div>
        <div id="list-text" class="mt-2"></div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>