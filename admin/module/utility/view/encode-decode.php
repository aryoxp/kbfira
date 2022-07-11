<div class="row">
  <div class="col mt-4 ms-3">
    <p>This is a utility function to decode and/or encode Zip log data.<br>
    If you have multiple encoded data, paste it one line per encoded/decoded data in the input textarea on the left.</p>
  </div>
</div>
<div class="card container flex-fill mb-2">
  <div class="card-body row">
    <div class="col d-flex flex-column">
      <textarea class="form-control mb-2 flex-fill" id="input-in"></textarea>
      <div class="text-end mb-2">
        <button class="btn btn-danger btn-sm bt-clear-input">Clear <i class="bi bi-x"></i></button>
        <button class="btn btn-success btn-sm bt-paste">Paste <i class="bi bi-clipboard-check"></i></button>
        <button class="btn btn-primary btn-sm bt-encode">Encode (JSON/Raw to Zip) <i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="text-end mb-2">
        <button class="btn btn-primary btn-sm bt-decode">Decode (Zip to JSON/Raw) <i class="bi bi-chevron-right"></i></button>
      </div>
      <div class="">
        <div class="progress" style="height: 6px;">
          <div class="progress-bar pb-encode-decode" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <span class="progress-value">0/0 0%</span>
      </div>
    </div>
    <div class="col d-flex flex-column">
      <textarea class="form-control mb-2 flex-fill" id="input-out" readonly="readonly"></textarea>
      <div class="mb-2">
        <button class="btn btn-success btn-sm bt-copy">Copy Result <i class="bi bi-files"></i></button>
      </div>
      <div class="invisible">
        <button class="btn btn-primary btn-sm">Decode (Zip to JSON/Raw) <i class="bi bi-chevron-right"></i></button>
      </div>
    </div>
  </div>
</div>