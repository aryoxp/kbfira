<header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New Role
  </button>
</header>
<div class="row gx-0">
  <div class="col-6">
    <div class="border rounded bg-white m-2">
      <form class="m-2" id="form-search-role">
        <div class="input-group mb-3">
          <input type="text"name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage">
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
            <span class="ms-2 text-primary">Role Name</span>
            <span>&nbsp;</span>
          </div>
          <div id="list-role"></div>
        </div>
      </div>
      <nav aria-label="" class="mt-3">
        <ul id="pagination-role" class="pagination justify-content-center"></ul>
      </nav>
    </div>    
  </div>
  <div class="col-6">
    <div class="m-2">
      <div id="detail-role" class="border rounded bg-white p-3"><em>Please select a role from the list to show its detail information.</em></div>
    </div>
  </div>
</div>
<footer></footer>


<div id="role-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-name">New Role</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <form class="form-role g-3 needs-validation flex-fill mt-1" novalidate>
      <div class="row gx-2">
        <div class="col">
          <div class="position-relative">
            <input type="text" class="form-control" id="input-name" placeholder="Role Name" required>
            <div class="invalid-tooltip">
              Please provide a name.
            </div>
          </div>
        </div>
        <div class="col">
          <div class="input-group position-relative">
            <input type="text" class="form-control" id="input-rid" placeholder="Role ID" required>
            <div class="invalid-tooltip">
              Please provide a unique ID.
            </div>
            <button class="btn btn-outline-primary bt-generate-rid" type="button"><i class="bi bi-magic"></i></button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4">Cancel</button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1">OK</button>
  </div>
</div>


<div id="nlp-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">NLP Data</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <form class="row form-nlp g-3 needs-validation flex-fill" novalidate>
      <textarea id="input-nlp" class="flex-fill border rounded mx-1 font-monospace"></textarea>
    </form>
  </div>
  <div class="card-footer role-end">
    <button class="btn btn-sm btn-secondary bt-close px-4">Cancel</button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1">OK</button>
    <button class="btn btn-sm resize-handle"><i class="bi bi-arrows-angle-expand"></i></button>
  </div>
</div>