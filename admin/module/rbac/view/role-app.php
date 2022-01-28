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
      <div id="detail-role" class="border rounded bg-white p-3"><em>Please select a role from the list to show its detailed information.</em></div>
    </div>
  </div>
</div>
<footer></footer>
