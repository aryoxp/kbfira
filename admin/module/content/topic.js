class TopicApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    TopicApp.handleEvent(this)
  }
  static instance(options) {
    return new TopicApp(options)
  }
  static handleEvent(app) {

    this.ajax = Core.instance().ajax();
    this.pagination = {
      page: 1,
      maxpage: 1,
      perpage: 1,
      count: 0,
      keyword: null
    }

    let topicDialog = UI.modal('#topic-dialog', {
      hideElement: '.bt-close'
    })
    topicDialog.setTopic = (topic) => {
      topicDialog.topic = topic;
      $('#topic-dialog .dialog-title').html('Edit Topic');
      $('#input-title').val(topic.title);
      $('#input-tid').val(topic.tid);
      return topicDialog
    }

    let textDialog = UI.modal('#text-dialog', {
      hideElement: '.bt-close',
      onShow: () => { // console.log(textDialog.topic)
        if (!textDialog.topic.text) $("#assigned-text").html('<em class="text-danger px-3">This topic has no text assigned.</em>')
        else {
          this.ajax.get(`contentApi/getText/${textDialog.topic.text}`).then(text => {
            let assignedTextHtml = `<span class="text-danger">Text:</span> ${text.title} <span class="badge rounded-pill bg-danger bt-unassign px-3 ms-3" role="button" data-text="${text.tid}" data-tid="${textDialog.topic.tid}">Unassign</span>`
            $("#assigned-text").html(assignedTextHtml)
          })
        }
        $('form.form-search-text').trigger('submit')
        $("#topic-title").html(textDialog.topic.title)
      }
    })
    textDialog.setTopic = (topic) => {
      textDialog.topic = topic;
      return textDialog
    }


    $('.bt-list-topic').on('click', () => {
      
    })
    $('.bt-new').on('click', (e) => {
      topicDialog.topic = null;
      $('#topic-dialog .dialog-title').html('New Topic');
      $('#input-title').val('');
      $('#input-tid').val('');
      topicDialog.show()
    })


    $('#form-search-topic').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = $('#form-search-topic .input-perpage').val()
      let keyword = $('#form-search-topic .input-keyword').val()
      if (keyword != this.pagination.keyword) this.pagination.page = 1
      // perpage = 1
      this.ajax.post(`contentApi/getTopics/${this.pagination.page}/${perpage}`, {
        keyword: keyword
      }).then(topics => {
        this.ajax.post(`contentApi/getTopicsCount`, {
          keyword: keyword
        }).then(count => {
        this.pagination.perpage = perpage
        this.pagination.count = count
        this.pagination.maxpage = Math.ceil(count/perpage)
        this.pagination.keyword = keyword
        TopicApp.populateTopics(topics)
        TopicApp.populatePagination(count, this.pagination.page, perpage)
        });
      });
    })
    $('.bt-search').on('click', () => $('#form-search-topic').trigger('submit'))


    $('#pagination-topic').on('click', '.pagination-next', (e) => {
      if (this.pagination.page < this.pagination.maxpage) {
        this.pagination.page++
        $('#form-search-topic').trigger('submit')
      }
    })

    $('#pagination-topic').on('click', '.pagination-prev', (e) => {
      if (this.pagination.page > 1) {
        this.pagination.page--
        $('#form-search-topic').trigger('submit')
      }
    })

    $('#pagination-topic').on('click', '.pagination-page', (e) => {
      this.pagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-topic').trigger('submit')
    })


    $('#topic-dialog form.form-topic').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#topic-dialog form.form-topic').addClass('was-validated')
      let title = $('#input-title').val().trim();
      let tid = $('#input-tid').val().trim();
      if (!title.length) return
      if (!tid.length) return
      if (!topicDialog.topic) {
        this.ajax.post('contentApi/createTopic', {
          tid: tid,
          title: title
        }).then(topic => { // console.warn(topic)
          topicDialog.hide();
          UI.success('Topic created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        this.ajax.post('contentApi/updateTopic', {
          tid: topicDialog.topic.tid,
          ntid: tid,
          title: title
        }).then(topic => { // console.warn(topic)
          topicDialog.hide();
          UI.success('Topic updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#topic-dialog .bt-generate-tid').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-tid').val($('#input-title').val().replace(/\s/g, '').substring(0, 20).trim().toUpperCase())
    })
    $('#topic-dialog').on('click', '.bt-ok', (e) => {
      $('#topic-dialog form.form-topic').trigger('submit')
    })







    $('#list-topic').on('click', '.bt-edit', (e) => {
      let tid = $(e.currentTarget).parents('.topic-item').attr('data-tid')
      this.ajax.get(`contentApi/getTopic/${tid}`).then(topic => {
        topicDialog.setTopic(topic).show()
      })
    })

    $('#list-topic').on('click', '.bt-delete', (e) => {
      let tid = $(e.currentTarget).parents('.topic-item').attr('data-tid')
      let title = $(e.currentTarget).parents('.topic-item').attr('data-title')
      let confirm = UI.confirm(`Do you want to delete this topic?<br>"${title}"`).positive(() => {
        this.ajax.post(`contentApi/deleteTopic`, { tid: tid }).then(result => {
          UI.success('Selected topic has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.topic-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.topic-item').remove()
          })
        })
      }).show()
    })

    $('#list-topic').on('click', '.bt-detail', (e) => {
      let tid = $(e.currentTarget).parents('.topic-item').attr('data-tid')
      this.ajax.get(`contentApi/getTopicDetail/${tid}`).then(topic => {
        TopicApp.populateTopicDetail(topic)
      })
    })







    $('#list-topic').on('click', '.bt-text', (e) => {
      let tid = $(e.currentTarget).parents('.topic-item').attr('data-tid')
      this.ajax.get(`contentApi/getTopicDetail/${tid}`).then(topic => {
        textDialog.setTopic(topic).show()
      })
    })

    $('form.form-search-text').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.ajax.post(`contentApi/getTexts/1/5`, {
        keyword: $('#input-keyword').val().trim()
      }).then(texts => {
        let textsHtml = ''
        texts.forEach(text => {
          textsHtml += `<div class="text-item d-flex align-items-center py-1 border-bottom" role="button"`
          textsHtml += `  data-tid="${text.tid}" data-title="${text.title}">`
          textsHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">${text.title}</span>`
          textsHtml += `  <span class="text-end text-nowrap ms-3">`
          textsHtml += `    <button class="btn btn-sm btn-primary bt-assign"><i class="bi bi-tag-fill"></i> Assign</button>`
          textsHtml += `  </span>`
          textsHtml += `</div>`
        });
        $('#list-text').html(textsHtml)
      })
    })

    $('#list-text').on('click', '.bt-assign', e => {
      e.preventDefault()
      let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
      this.ajax.post(`contentApi/assignTextToTopic`, {
        tid: tid,
        tpid: textDialog.topic.tid
      }).then(topic => {
        this.ajax.get(`contentApi/getText/${topic.text}`).then(text => {
          let assignedTextHtml = `<span class="text-danger">Text:</span> ${text.title} <span class="badge rounded-pill bg-danger bt-unassign px-3 ms-3" role="button" data-text="${text.tid}" data-tid="${textDialog.topic.tid}">Unassign</span>`
          $("#assigned-text").html(assignedTextHtml)
        })
      }).catch(error => console.error(error))
    })

    $('#assigned-text').on('click', '.bt-unassign', e => {
      e.preventDefault()
      let tid = $(e.currentTarget).attr('data-tid')
      this.ajax.post(`contentApi/unassignTextFromTopic`, {
        tid: tid,
      }).then(topic => {
        $("#assigned-text").html('<em class="text-danger px-3">This topic has no text assigned.</em>')
      }).catch(error => console.error(error))
    })


    $('.bt-search').trigger('click')

  }
}

TopicApp.populateTopics = topics => {
  let topicsHtml = '';
  topics.forEach(topic => {
    topicsHtml += `<div class="topic-item d-flex align-items-center py-1 border-bottom" role="button"`
    topicsHtml += `  data-tid="${topic.tid}" data-title="${topic.title}">`
    topicsHtml += `  <span class="flex-fill ps-2">`
    topicsHtml += `  <span class="text-truncate text-nowrap">${topic.title}</span>`
    if (topic.text) topicsHtml += `    <span class="badge rounded-pill bg-success">Text</span>`
    topicsHtml += `  </span>`
    topicsHtml += `  <span class="text-end text-nowrap ms-3">`
    topicsHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    topicsHtml += `    <button class="btn btn-sm btn-primary bt-text"><i class="bi bi-file-text-fill"></i></button>`
    topicsHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    topicsHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    topicsHtml += `  </span>`
    topicsHtml += `</div>`
  });
  if (topicsHtml.length == 0) topicsHtml = '<em class="d-block m-3 text-muted">No topics found in current search.</em>';
  $('#list-topic').html(topicsHtml)
}

TopicApp.populatePagination = (count, page, perpage) => {
  let paginationHtml = ''
  let maxpage = Math.ceil(count/perpage); // console.log(count, page, maxpage)
  if (count) {
    paginationHtml += `<li class="page-item${page == 1 ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-prev" href="#" tabindex="-1" aria-disabled="true">Previous</a>`
    paginationHtml += `</li>`

    let min = page - 2 < 1 ? 1 : page - 2
    let max = page + 2 > maxpage ? maxpage : page + 2

    for(let p = min; p <= max; p++) {
      paginationHtml += `<li class="page-item${page == p ? ' disabled': ''}"><a class="page-link pagination-page" data-page="${p}" href="#">${p}</a></li>`
    }

    // paginationHtml += `<li class="page-item"><a class="page-link" href="#">2</a></li>`
    // paginationHtml += `<li class="page-item"><a class="page-link" href="#">3</a></li>`
    paginationHtml += `<li class="page-item${page == maxpage ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-next" href="#">Next</a>`
    paginationHtml += `</li>`
  }
  $('#pagination-topic').html(paginationHtml)
}

TopicApp.populateTopicDetail = topic => {
  let topicDetailHtml = '';


  topicDetailHtml += `<span class="topic-title h4 text-primary">${topic.title}</span>`
  topicDetailHtml += `<div class="align-middle"><span class="badge rounded-pill bg-warning text-dark px-3">${topic.tid}</span>`
  topicDetailHtml += ` <span class="badge rounded-pill bg-secondary mx-1 px-3">${topic.created}</span></div>`
  topicDetailHtml += `<hr>`
  topicDetailHtml += `<span class="d-block"><span class="text-primary">3 concept maps</span> were associated to this topic.</span>`
  topicDetailHtml += `<span class="d-block">This topic has text: <span class="text-primary">This is the title of the text.</span></span>`
  topicDetailHtml += `<div class="mt-4">Attached data: <span class="badge rounded-pill bg-primary mx-2" role="button">Attach</span></div>`
  topicDetailHtml += `<div class="border rounded p-2 my-2 bg-light">`
  topicDetailHtml += `  <code>${topic.data ? topic.data : 'This topic has no attached data.'}</code>`
  topicDetailHtml += `</div>`


  $('#detail-topic').html(topicDetailHtml)
}

$(() => {
  let app = TopicApp.instance()
})