<header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New User
  </button>
</header>
<div class="row gx-0">
  <div class="col-6">
    <div class="border rounded bg-white m-2">
      <form class="m-2" id="form-search-user">
        <div class="input-group mb-3">
          <input type="text" name="keyword" class="form-control w-50 input-keyword" placeholder="Search keyword" aria-label="Keyword">
          <select name="perpage" class="form-select flex-shrink-1 input-perpage">
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
          <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
        </div>
        <div class="d-flex align-items-center"><input type="checkbox" class="mx-2" id="input-use-date"> <label class="text-nowrap me-2" for="input-use-date">Filter to creation date:</label> <input class="form-control" name="date" id="input-search-date"></div>
      </form>
      <div class="px-2">
        <div class="m-2">
          <div class="border-bottom py-2">
            <span class="ms-2 text-primary">User Name</span>
            <span>&nbsp;</span>
          </div>
          <div id="list-user"></div>
          <div id="selection-user" class="mt-1 px-2">
            <span class="badge rounded-pill bg-primary bt-select-all" role="button">Select All</span>
            <span class="badge rounded-pill bg-danger bt-unselect-all" role="button">Unselect All</span>
          </div>
          <nav aria-label="" class="mt-3">
            <ul id="pagination-user" class="pagination justify-content-center"></ul>
          </nav>
          <div id="multi-action-user" class="card my-3">
            <div class="card-body bg-light">
              <div style="font-size: .875rem;">
                <span>With selected:</span>
                <button class="btn btn-danger btn-sm bt-delete ms-2"><i class="bi bi-exclamation-triangle-fill"></i> Delete</button>
              </div>
              <div class="row">
                <div class="col">
                  <label class="col-form-label-sm ps-2 badge rounded-pill bg-primary mb-1">Role:</label>
                  <select id="apply-rid" class="form-select form-select-sm mb-2">
                    <option default value="">No Role</option>
                  </select>
                  <div class="text-end">
                    <button class="btn btn-warning text-dark btn-sm bt-revoke-role">Revoke</button>
                    <button class="btn btn-success btn-sm bt-apply-role">Apply</button>
                  </div>
                </div>
                <div class="col">
                  <label class="col-form-label-sm ps-2 badge rounded-pill bg-success mb-1">Group:</label>
                  <select id="apply-gid" class="form-select form-select-sm mb-2">
                    <option default value="">No Group</option>
                  </select>
                  <div class="text-end">
                    <button class="btn btn-warning text-dark btn-sm bt-revoke-group">Revoke</button>
                    <button class="btn btn-success btn-sm bt-apply-group">Apply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>    
  </div>
  <div class="col-6">
    <div class="m-2">
      <div id="upload-csv" class="card">
        <div class="card-body bg-white">
          <div style="font-size: .875rem;">
            <h4>Batch Create</h4>
            <div class="btn-group btn-group-sm">
              <a class="btn btn-sm btn-secondary bt-download-file" href="<?php echo $this->file('module/user/file/user-pass.csv'); ?>"><i class="bi bi-download"></i> Download CSV Template File</a>
              <button class="btn btn-sm btn-outline-secondary bt-help-csv"><i class="bi bi-question-lg"></i> Help</button>
            </div>
            <hr>
            <form name="form-upload-csv">
              <div class="input-group input-group-sm">
                <input class="form-control form-control-sm" name="csv" id="csv-file" type="file">
                <button class="btn btn-primary btn-sm bt-upload-file"><i class="bi bi-upload"></i> Begin Upload </button>
              </div>
            </form>
            <div class="batch-result card-body"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<footer></footer>


<div id="user-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">New User</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <form class="form-user needs-validation flex-fill mt-1" novalidate>
      <div class="row gx-2 mb-2">
        <div class="col mt-2 d-flex flex-column">
          <input type="text"class="form-control" id="input-user-name" placeholder="Full Name" required>
          <div class="invalid-feedback">
            Please provide a name.
          </div>
        </div>
      </div>
      <div class="row gx-2">
        <div class="col">
          <input type="text" class="form-control" id="input-user-username" placeholder="Username" required>
          <div class="invalid-feedback">
            Please provide a username.
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <input type="text" class="form-control" id="input-user-password" placeholder="Password">
            <button class="btn btn-outline-primary bt-generate-password" type="button"><i class="bi bi-magic"></i></button>
            <div class="text-primary update-role-group-info d-non px-3 mt-2" style="line-height: 1rem;"><small class="fst-italic">Left password field empty to keep the password intact.</small></div>
          </div>
        </div>
      </div>
      <div class="row my-2"><span class="col text-primary">Assign user to:</span></div>
      <div class="row gx-2">
        <div class="col d-flex align-items-center">
          <select class="form-select" id="input-rid">
            <option default value="">No Role</option>
          </select>
        </div>
        <div class="col">
          <select class="form-select" id="input-gid">
            <option default value="">No Group</option>
          </select>
        </div>
      </div>
      <div class="row my-2 update-role-group-info d-none"><span class="col text-danger">You can change role and group assigned to this user in <a href="<?php echo $this->location('user/auth', 'm/x'); ?>">authorization page</a>.</span></div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('cancel'); ?></button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1"><?php echo Lang::l('ok'); ?></button>
  </div>
</div>


<div id="user-detail-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-person-check-fill me-2"></i> <span class="dialog-title">User Detail</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <div class="detail-content"></div>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4 ms-1"><?php echo Lang::l('close'); ?></button>
    <button class="btn btn-sm resize-handle"><i class="bi bi-arrows-angle-expand"></i></button>
  </div>
</div>

<div id="batch-create-help" class="card d-none">
  <div class="card-header">
    <h4>Batch Create User Help.</h4>
  </div>
  <div class="card-body overflow-scroll">
    <p>The first line is column headers, it will be ignored if it is left unchanged. Below is an example on how to compose a CSV file to create several users in batch.</p>

    <pre class="text-primary">
username,name,password,roleids,groupids,"<-- this line will be ignored."
demo,Demo,demopass,"TEACHER,STUDENT","GROUPA,GROUPB"
user,"User",demopass,TEACHER,LEL
nobody,"Nobody Name",demopass,"TEACHER,STUDENT","GROUPA,LEL"
    </pre>

    <ul>
      <li>The first column is <code>username</code> field.</li>
      <li>The second column is <code>name</code> field.</li>
      <li>The third column is <code>password</code> field.</li>
      <li>The fourth column is <code>role IDs</code> field. Wrap multiple role ID values in double quote mark and separate each role ID with a single comma.</li>
      <li>The fifth column is <code>group IDs</code> field. Wrap multiple group ID values in double quote mark and separate each group ID with a single comma.</li>
    </ul>
  
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4 ms-1"><?php echo Lang::l('close'); ?></button>
    <button class="btn btn-sm resize-handle"><i class="bi bi-arrows-angle-expand"></i></button>
  </div>
</div>