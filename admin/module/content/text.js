class CoreEditor {
  constructor(elementId, options) {
    var editor = CodeMirror.fromTextArea(document.getElementById(elementId), {
      mode: {
        name: "gfm",
        tokenTypeOverrides: {
          emoji: "emoji"
        }
      },
      lineNumbers: false,
      // theme: "default"
    });
    let toolbar = `<div class="border rounded-top p-1 mt-2 bg-light">`
    toolbar += `<div class="btn-group btn-group-sm">`
    toolbar += `<button class="btn"><i class="bi bi-type-bold"></i></button>`
    toolbar += `<button class="btn"><i class="bi bi-type-italic"></i></button>`
    toolbar += `<button class="btn"><i class="bi bi-type-underline"></i></button>`
    toolbar += `<button class="btn"><i class="bi bi-code"></i></button>`
    toolbar += `<button class="btn"><i class="bi bi-blockquote"></i></button>`
    toolbar += `</div>`
    toolbar += `</div>`
    $('#CodeMirror-wrapper').remove()
    $('.CodeMirror').wrap('<div id="CodeMirror-wrapper" class="wrapper flex-fill d-flex flex-column"></div>')
      .addClass('flex-fill border rounded-bottom').css('height', 100)
    $('#CodeMirror-wrapper').prepend(toolbar)
    $('.CodeMirror-scroll').css('min-height', 100)
  }
  static instance(element, options) {
    return new CoreEditor(element, options)
  }
}

class TextApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    TextApp.handleEvent(this)
  }
  static instance(options) {
    return new TextApp(options)
  }
  static handleEvent(app) { console.log('handle')

    this.ajax = Core.instance().ajax();
    this.pagination = {
      page: 1,
      maxpage: 1,
      perpage: 1,
      count: 0,
      keyword: null
    }

    let textDialog = UI.modal('#text-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      width: '550px',
      minHeight: 100,
      minWidth: 300,
      height: 500,
      onShow: () => {
        if (!textDialog.simplemde) {
          textDialog.simplemde = new SimpleMDE({
            toolbar: ["bold", "italic", "heading", "|", "quote", "code", "unordered-list", "ordered-list", "|", "horizontal-rule", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
            renderingConfig: {
              singleLineBreaks: false,
              codeSyntaxHighlighting: true,
            },
          });
          $('.CodeMirror').addClass('flex-fill border rounded-bottom').css('height', 100).css('min-height', 100)
          $('.CodeMirror-scroll').css('min-height', 100)
          $('.editor-toolbar').addClass('bg-light')
          textDialog.resize.minHeight = $('#text-dialog').outerHeight() - 110
        }
        if (textDialog.text) textDialog.simplemde.value(textDialog.text.content);
        else textDialog.simplemde.value('')
      }
    })
    textDialog.setText = (text) => {
      textDialog.text = text;
      $('#text-dialog .dialog-title').html('Edit Text');
      $('#input-title').val(text.title);
      // textDialog.simplemde.value(text.content);
      return textDialog
    }

    let nlpDialog = UI.modal('#nlp-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      width: '550px',
      minHeight: 100,
      minWidth: 300,
      height: 500,
      onShow: () => {}
    })
    nlpDialog.setText = (text) => {
      nlpDialog.text = text;
      $('#nlp-dialog .dialog-title').html('NLP Data');
      $('#input-nlp').val(text.nlp);
      return nlpDialog
    }


    $('.bt-list-text').on('click', () => {
      
    })
    $('.bt-new').on('click', (e) => {
      textDialog.text = null;
      $('#text-dialog .dialog-title').html('New Text');
      $('#input-title').val('');
      textDialog.show()
    })


    $('#form-search-text').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = $('#form-search-text .input-perpage').val()
      let keyword = $('#form-search-text .input-keyword').val()
      if (keyword != this.pagination.keyword) this.pagination.page = 1
      // perpage = 1
      this.ajax.post(`contentApi/getTexts/${this.pagination.page}/${perpage}`, {
        keyword: keyword
      }).then(texts => {
        this.ajax.post(`contentApi/getTextsCount`, {
          keyword: keyword
        }).then(count => {
        this.pagination.perpage = perpage
        this.pagination.count = count
        this.pagination.maxpage = Math.ceil(count/perpage)
        this.pagination.keyword = keyword
        TextApp.populateTexts(texts)
        TextApp.populatePagination(count, this.pagination.page, perpage)
        });
      });
    })
    $('.bt-search').on('click', () => $('#form-search-text').trigger('submit'))


    $('#pagination-text').on('click', '.pagination-next', (e) => {
      if (this.pagination.page < this.pagination.maxpage) {
        this.pagination.page++
        $('#form-search-text').trigger('submit')
      }
    })

    $('#pagination-text').on('click', '.pagination-prev', (e) => {
      if (this.pagination.page > 1) {
        this.pagination.page--
        $('#form-search-text').trigger('submit')
      }
    })

    $('#pagination-text').on('click', '.pagination-page', (e) => {
      this.pagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-text').trigger('submit')
    })


    $('#text-dialog form.form-text').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#text-dialog form.form-text').addClass('was-validated')
      let title = $('#input-title').val().trim();
      let content = textDialog.simplemde.value()
      if (!title.length) return
      if (!textDialog.text) {
        this.ajax.post('contentApi/createText', {
          title: title,
          content: content,
        }).then(text => { // console.warn(text)
          textDialog.hide();
          UI.success('Text created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        this.ajax.post('contentApi/updateText', {
          tid: textDialog.text.tid,
          title: title,
          content: content,
        }).then(text => { // console.warn(text)
          textDialog.hide();
          UI.success('Text updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#text-dialog .bt-generate-tid').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-tid').val($('#input-title').val().replace(/\s/g, '').substring(0, 20).trim().toUpperCase())
    })
    $('#text-dialog').on('click', '.bt-ok', (e) => {
      $('#text-dialog form.form-text').trigger('submit')
    })







    $('#list-text').on('click', '.bt-edit', (e) => {
      let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
      this.ajax.get(`contentApi/getText/${tid}`).then(text => {
        textDialog.setText(text).show()
      })
    })

    $('#list-text').on('click', '.bt-delete', (e) => {
      let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
      let title = $(e.currentTarget).parents('.text-item').attr('data-title')
      let confirm = UI.confirm(`Do you want to <span class="text-danger">DELETE</span> this text?<br><span class="text-primary">"${title}"</span>`).positive(() => {
        this.ajax.post(`contentApi/deleteText/`, { tid: tid }).then(result => {
          UI.success('Selected text has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.text-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.text-item').remove()
          })
        })
      }).show()
    })

    $('#list-text').on('click', '.bt-detail', (e) => {
      let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
      this.ajax.get(`contentApi/getTextDetail/${tid}`).then(text => {
        TextApp.populateTextDetail(text)
      })
    })











    $('#list-text').on('click', '.bt-nlp', (e) => {
      let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
      this.ajax.get(`contentApi/getText/${tid}`).then(text => {
        nlpDialog.setText(text).show()
      })
    })
    $('#nlp-dialog form.form-nlp').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#nlp-dialog form.form-nlp').addClass('was-validated')
      let nlp = $('#input-nlp').val().trim();
      if (!nlpDialog.text) return
      this.ajax.post('contentApi/updateTextNlp', {
        tid: nlpDialog.text.tid,
        nlp: nlp,
      }).then(nlp => { // console.warn(text)
        nlpDialog.hide();
        UI.success('NLP data has been updated.').show()
      }).catch(error => UI.error(error).show())
    })
    $('#nlp-dialog').on('click', '.bt-ok', (e) => {
      $('#nlp-dialog form.form-nlp').trigger('submit')
    })

    $('.bt-search').trigger('click')

  }
}

TextApp.populateTexts = texts => {
  let textsHtml = '';
  texts.forEach(text => {
    textsHtml += `<div class="text-item d-flex align-items-center py-1 border-bottom" role="button"`
    textsHtml += `  data-tid="${text.tid}" data-title="${text.title}">`
    textsHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">${text.title}</span>`
    textsHtml += `  <span class="text-end text-nowrap ms-3">`
    textsHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    textsHtml += `    <button class="btn btn-sm btn-primary bt-nlp">AI</button>`
    textsHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    textsHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    textsHtml += `  </span>`
    textsHtml += `</div>`
  });
  if (textsHtml.length == 0) textsHtml = '<em class="d-block m-3 text-muted">No texts found in current search.</em>';
  $('#list-text').html(textsHtml)
}

TextApp.populatePagination = (count, page, perpage) => {
  let paginationHtml = ''
  let maxpage = Math.ceil(count/perpage);
  console.log(count, page, maxpage)
  if (count) {
    paginationHtml += `<li class="page-item${page == 1 ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-prev" href="#" tabindex="-1" aria-disabled="true">Previous</a>`
    paginationHtml += `</li>`

    let min = page - 2 < 1 ? 1 : page - 2
    let max = page + 2 > maxpage ? maxpage : page + 2

    for(let p = min; p <= max; p++) {
      paginationHtml += `<li class="page-item${page == p ? ' disabled': ''}"><a class="page-link pagination-page" data-page="${p}" href="#">${p}</a></li>`
    }

    paginationHtml += `<li class="page-item${page == maxpage ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-next" href="#">Next</a>`
    paginationHtml += `</li>`
  }
  $('#pagination-text').html(paginationHtml)
}

TextApp.populateTextDetail = text => {
  let textDetailHtml = '';

  let content = text.content 
    ? new showdown.Converter({}).makeHtml(text.content) 
    : '<em class="text-muted">This text has no content.</em>'

  console.log(hljs)

  textDetailHtml += `<span class="text-title h4 text-primary">${text.title}</span>`
  textDetailHtml += `<div class="align-middle"><span class="badge rounded-pill bg-warning text-dark px-3">${text.tid}</span>`
  textDetailHtml += ` <span class="badge rounded-pill bg-secondary mx-1 px-3">${text.created}</span></div>`
  textDetailHtml += `<hr>`
  textDetailHtml += `<span class="d-block"><span class="text-primary">3 concept maps</span> were associated to this text.</span>`
  textDetailHtml += `<span class="d-block">This text has text: <span class="text-primary">This is the title of the text.</span></span>`
  textDetailHtml += `<div class="mt-4">Attached data: <span class="badge rounded-pill bg-primary mx-2" role="button">Attach</span></div>`
  textDetailHtml += `<div class="border rounded p-2 my-2 bg-light scroll-y" style="max-height: 300px">`
  textDetailHtml += `  <div>${content}</div>`
  textDetailHtml += `</div>`
  textDetailHtml += `<div class="border rounded p-2 my-2 bg-light scroll-y" style="max-height: 300px">`
  textDetailHtml += `  <code>${text.nlp ? text.nlp : '<span class="text-muted">This text has no NLP data.</span>'}</code>`
  textDetailHtml += `</div>`
  textDetailHtml += `<div class="border rounded p-2 my-2 bg-light">`
  textDetailHtml += `  <code>${text.data ? text.data : 'This text has no attachment data.'}</code>`
  textDetailHtml += `</div>`


  $('#detail-text').html(textDetailHtml)
  hljs.highlightAll();

}

$(() => {
  let app = TextApp.instance()
})