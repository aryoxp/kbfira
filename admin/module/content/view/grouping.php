<header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New Group
  </button>
</header>
<div class="row gx-0">
  <div class="col-6">
    <div class="border rounded bg-white m-2">
      <form class="m-2" id="form-search-group">
        <div class="input-group mb-3">
          <input type="text"name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage-group">
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
            <span class="ms-2 text-primary">Group Name</span>
            <span>&nbsp;</span>
          </div>
          <div id="list-group"></div>
        </div>
      </div>
      <nav aria-label="" class="mt-3">
        <ul id="pagination-group" class="pagination justify-content-center"></ul>
      </nav>
    </div>    
  </div>
  <div class="col-6">
    <div class="m-2">
      <div id="detail-group" class="border rounded bg-white p-3"><em>Please select a group from the list to show its detail information.</em></div>
    </div>
  </div>
</div>
<footer></footer>


<div id="group-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-name">New Group</span></span>
    <i class="bi bi-x-lg bt-close bt-x" group="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <form class="form-group g-3 needs-validation flex-fill mt-1" novalidate>
      <div class="row gx-2">
        <div class="col">
          <div class="position-relative">
            <input type="text" class="form-control" id="input-name" placeholder="Group Name" required>
            <div class="invalid-tooltip">
              Please provide a name.
            </div>
          </div>
        </div>
        <div class="col">
          <div class="input-group position-relative">
            <input type="text" class="form-control" id="input-gid" placeholder="Group ID" required>
            <div class="invalid-tooltip">
              Please provide a unique ID.
            </div>
            <button class="btn btn-outline-primary bt-generate-gid" type="button"><i class="bi bi-magic"></i></button>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col">
          <label>Description</label>
          <textarea class="form-control" id="input-description" rows="3"></textarea>
        </div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('cancel'); ?></button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>



<div id="assign-topic-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">Assign Topic</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="border-bottom mb-2 pb-2">
      <span class="h6">Group: <span class="text-primary group-title"></span></span>
    </div>
    <div class="d-flex">
      <div class="col pe-3" style="flex-basis: 50%">
        <span class="h6"><span class="text-primary">Assigned topics</span> <span class="badge rounded-pill bg-success bt-refresh-assigned-topic mx-3" role="button">Refresh</span></span>
        <div id="list-topic-assigned" class="my-2 scroll-y" style="max-height:200px"></div>
      </div>
      <div class="col" style="flex-basis: 50%">
        <form class="form-assign-search-topic g-3 needs-validation" novalidate>
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
          <div class="list-topic scroll-y" style="max-height:200px;"></div>
          <div class="my-2">
            <span class="badge rounded-pill bg-warning text-dark me-3 bt-toggle-select" role="button">Select/unselect all</span>
            <small>With selected:</small> <span class="badge rounded-pill bg-primary ms-1 bt-assign-selected" role="button">Assign</span>
          </div>
          <div class="list-topic-pagination pagination text-center mt-4"></div>
        </form>
      </div>
    </div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>


<div id="assign-kit-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-layout-wtf me-2"></i> <span class="dialog-title">Assign Kit</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="border-bottom mb-2 pb-2">
      <span class="h6">Group: <span class="text-primary group-title"></span></span>
    </div>
    <div class="d-flex">
      <div class="col pe-3" style="flex-basis: 50%">
        <span class="h6"><span class="text-primary">Assigned kits</span> <span class="badge rounded-pill bg-success bt-refresh-assigned-kit mx-3" role="button">Refresh</span></span>
        <div id="list-kit-assigned" class="my-2 scroll-y" style="max-height:200px"></div>
      </div>
      <div class="col" style="flex-basis: 50%">
        <form class="form-assign-search-kit g-3 needs-validation" novalidate>
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
          <div class="list-kit scroll-y" style="max-height:200px;"></div>
          <div class="my-2">
            <span class="badge rounded-pill bg-warning text-dark me-3 bt-toggle-select" role="button">Select/unselect all</span>
            <small>With selected:</small> <span class="badge rounded-pill bg-primary ms-1 bt-assign-selected" role="button">Assign</span>
          </div>
          <div class="list-kit-pagination pagination text-center mt-4"></div>
        </form>
      </div>
    </div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>

<div id="assign-user-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-layout-wtf me-2"></i> <span class="dialog-title">Assign User</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body">
    <div class="border-bottom mb-2 pb-2">
      <span class="h6">Group: <span class="text-primary group-title"></span></span>
    </div>
    <div class="d-flex">
      <div class="col pe-3" style="flex-basis: 50%">
        <span class="h6"><span class="text-primary">Assigned users</span> <span class="badge rounded-pill bg-success bt-refresh-assigned-user mx-3" role="button">Refresh</span></span>
        <div id="list-user-assigned" class="my-2 scroll-y" style="max-height:200px"></div>
      </div>
      <div class="col" style="flex-basis: 50%">
        <form class="form-assign-search-user g-3 needs-validation" novalidate>
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
          <div class="list-user scroll-y" style="max-height:200px;"></div>
          <div class="my-2">
            <span class="badge rounded-pill bg-warning text-dark me-3 bt-toggle-select" role="button">Select/unselect all</span>
            <small>With selected:</small> <span class="badge rounded-pill bg-primary ms-1 bt-assign-selected" role="button">Assign</span>
          </div>
          <div class="list-user-pagination pagination text-center mt-4"></div>
        </form>
      </div>
    </div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('close'); ?></button>
  </div>
</div>
