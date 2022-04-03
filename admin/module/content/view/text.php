<header class="p-2 border-bottom">
  <button class="btn btn-success ms-1 bt-new">
    <i class="bi bi-plus-lg"></i> New Text
  </button>
</header>
<div class="row gx-0">
  <div class="col-6">
    <div class="border rounded bg-white m-2">
      <form class="m-2" id="form-search-text">
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
          <button class="btn btn-secondary bt-search"><i class="bi bi-search"></i></button>
        </div>
      </form>
      <div class="px-2">
        <div class="m-2">
          <div class="border-bottom py-2">
            <span class="ms-2 text-primary">Text Title</span>
            <span>&nbsp;</span>
          </div>
          <div id="list-text"></div>
        </div>
      </div>
      <ul aria-label="" class="mt-3" id="pagination-text"></ul>
    </div>    
  </div>
  <div class="col-6">
    <div class="m-2">
      <div id="detail-text" class="border rounded bg-white p-3"><em>Please select a text from the list to show its detail information.</em></div>
    </div>
  </div>
</div>
<footer></footer>


<div id="text-dialog" class="card d-none">
  <h6 class="card-header d-flex">
    <span class="drag-handle flex-fill"><i class="dialog-icon bi bi-eye-fill me-2"></i> <span class="dialog-title">New Text</span></span>
    <i class="bi bi-x-lg bt-close bt-x" role="button"></i>
  </h6>
  <div class="card-body d-flex flex-column">
    <form class="row form-text g-3 needs-validation flex-fill" novalidate>
      <div class="col mt-0 d-flex flex-column">
        <input type="text" class="form-control mb-2" id="input-title" placeholder="Text Title" required>
        <div class="invalid-feedback mb-2">
          Please provide a title for the text.
        </div>
        <textarea id="stacks-editor" class="flex-fill">

GitHub Flavored Markdown
========================

Everything from markdown plus GFM features:

## URL autolinking

Underscores_are_allowed_between_words.

## Strikethrough text

GFM adds syntax to strikethrough text, which is missing from standard Markdown.

~~Mistaken text.~~
~~**works with other formatting**~~

~~spans across
lines~~

## Fenced code blocks (and syntax highlighting)

```javascript
for (var i = 0; i < items.length; i++) {
    console.log(items[i], i); // log them
}
```

## Task Lists

- [ ] Incomplete task list item
- [x] **Completed** task list item

## A bit of GitHub spice

See http://github.github.com/github-flavored-markdown/.

(Set `gitHubSpice: false` in mode options to disable):

* SHA: be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* User@SHA ref: mojombo@be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* User/Project@SHA: mojombo/god@be6a8cc1c1ecfe9489fb51e4869af15a13fc2cd2
* \#Num: #1
* User/#Num: mojombo#1
* User/Project#Num: mojombo/god#1

(Set `emoji: false` in mode options to disable):

* emoji: :smile:

````javascript
class Hello {
	constructor() {
	  int x = 0;
		Makan.dame();
	}
}
````


        </textarea>
      </div>
    </form>
  </div>
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('cancel'); ?></button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1"><?php echo Lang::l('ok'); ?></button>
    <button class="btn btn-sm resize-handle"><i class="bi bi-arrows-angle-expand"></i></button>
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
  <div class="card-footer text-end">
    <button class="btn btn-sm btn-secondary bt-close px-4"><?php echo Lang::l('cancel'); ?></button>
    <button class="btn btn-sm btn-primary bt-ok px-4 ms-1"><?php echo Lang::l('ok'); ?></button>
    <button class="btn btn-sm resize-handle"><i class="bi bi-arrows-angle-expand"></i></button>
  </div>
</div>