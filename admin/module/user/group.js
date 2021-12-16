class GroupApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    GroupApp.handleEvent(this)
  }
  static instance(options) {
    return new GroupApp(options)
  }
  static handleEvent(app) { // console.log('handle')

    this.ajax = Core.instance().ajax();
    this.pagination = {
      page: 1,
      maxpage: 1,
      perpage: 1,
      count: 0,
      keyword: null
    }

    let groupDialog = UI.modal('#group-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle'
    })
    groupDialog.setGroup = (group) => {
      groupDialog.group = group;
      $('#group-dialog .dialog-name').html('Edit Group');
      $('#input-name').val(group.name);
      $('#input-gid').val(group.gid);
      $('#input-description').val(group.description);
      return groupDialog
    }


    $('.bt-new').on('click', (e) => {
      groupDialog.group = null;
      $('#group-dialog .dialog-name').html('New Group');
      $('#input-name').val('');
      $('#input-gid').val('');
      $('#input-description').val('');
      groupDialog.show()
    })


    $('#form-search-group').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = $('#form-search-group .input-perpage').val()
      let keyword = $('#form-search-group .input-keyword').val()
      if (keyword != this.pagination.keyword) this.pagination.page = 1
      // perpage = 1
      this.ajax.post(`RBACApi/getGroups/${this.pagination.page}/${perpage}`, {
        keyword: keyword
      }).then(groups => {
        this.ajax.post(`RBACApi/getGroupsCount`, {
          keyword: keyword
        }).then(count => {
        this.pagination.perpage = perpage
        this.pagination.count = count
        this.pagination.maxpage = Math.ceil(count/perpage)
        this.pagination.keyword = keyword
        GroupApp.populateGroups(groups)
        GroupApp.populatePagination(count, this.pagination.page, perpage)
        });
      });
    })
    $('.bt-search').on('click', () => $('#form-search-group').trigger('submit'))


    $('#pagination-group').on('click', '.pagination-next', (e) => {
      if (this.pagination.page < this.pagination.maxpage) {
        this.pagination.page++
        $('#form-search-group').trigger('submit')
      }
    })

    $('#pagination-group').on('click', '.pagination-prev', (e) => {
      if (this.pagination.page > 1) {
        this.pagination.page--
        $('#form-search-group').trigger('submit')
      }
    })

    $('#pagination-group').on('click', '.pagination-page', (e) => {
      this.pagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-group').trigger('submit')
    })


    $('#group-dialog form.form-group').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#group-dialog form.form-group').addClass('was-validated')
      let gid = $('#input-gid').val().toUpperCase().trim();
      let name = $('#input-name').val().trim();
      let description = $('#input-description').val().trim();
      if (!name.length) return
      if (!gid.length) return
      if (!groupDialog.group) {
        this.ajax.post('RBACApi/createGroup', {
          gid: gid,
          name: name,
          description: description
        }).then(group => { // console.warn(group)
          groupDialog.hide();
          UI.success('Group created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        this.ajax.post('RBACApi/updateGroup', {
          gid: groupDialog.group.gid,
          name: name,
          description: description,
          ngid: gid,
        }).then(group => { // console.warn(group)
          groupDialog.hide();
          UI.success('Group updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#group-dialog .bt-generate-gid').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-gid').val($('#input-name').val().replace(/\s/g, '').substring(0, 20).trim().toUpperCase())
    })
    $('#group-dialog').on('click', '.bt-ok', (e) => {
      $('#group-dialog form.form-group').trigger('submit')
    })







    $('#list-group').on('click', '.bt-edit', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      this.ajax.get(`RBACApi/getGroup/${gid}`).then(group => {
        groupDialog.setGroup(group).show()
      })
    })

    $('#list-group').on('click', '.bt-delete', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      let name = $(e.currentTarget).parents('.group-item').attr('data-name')
      let confirm = UI.confirm(`Do you want to <span class="text-danger">DELETE</span> this group?<br><span class="text-primary">"${name}"</span>`).positive(() => {
        this.ajax.post(`RBACApi/deleteGroup/`, { gid: gid }).then(result => {
          UI.success('Selected group has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.group-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.group-item').remove()
          })
        })
      }).show()
    })

    $('#list-group').on('click', '.bt-detail', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      this.ajax.get(`RBACApi/getGroupDetail/${gid}`).then(group => {
        GroupApp.populateGroupDetail(group)
      })
    })











    $('#list-group').on('click', '.bt-nlp', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      this.ajax.get(`RBACApi/getGroup/${gid}`).then(group => {
        nlpDialog.setGroup(group).show()
      })
    })
    $('#nlp-dialog form.form-nlp').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#nlp-dialog form.form-nlp').addClass('was-validated')
      let nlp = $('#input-nlp').val().trim();
      if (!nlpDialog.group) return
      this.ajax.post('RBACApi/updateGroupNlp', {
        gid: nlpDialog.group.gid,
        nlp: nlp,
      }).then(nlp => { // console.warn(group)
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

GroupApp.populateGroups = groups => {
  let groupsHtml = '';
  groups.forEach(group => {
    groupsHtml += `<div class="group-item d-flex align-items-center py-1 border-bottom" group="button"`
    groupsHtml += `  data-gid="${group.gid}" data-name="${group.name}">`
    groupsHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">`
    groupsHtml += `    <span>${group.name}</span>`
    groupsHtml += `    <span class="ms-2 badge rounded-pill bg-primary">${group.gid}</span>`
    groupsHtml += `  </span>`
    groupsHtml += `  <span class="text-end text-nowrap ms-3">`
    groupsHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    groupsHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    groupsHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    groupsHtml += `  </span>`
    groupsHtml += `</div>`
  });
  if (groupsHtml.length == 0) groupsHtml = '<em class="d-block m-3 text-muted">No groups found in current search.</em>';
  $('#list-group').html(groupsHtml)
}

GroupApp.populatePagination = (count, page, perpage) => {
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

    paginationHtml += `<li class="page-item${page == maxpage ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-next" href="#">Next</a>`
    paginationHtml += `</li>`
  }
  $('#pagination-group').html(paginationHtml)
}

GroupApp.populateGroupDetail = group => {
  let groupDetailHtml = '';

  let content = group.content 
    ? new showdown.Converter({}).makeHtml(group.content) 
    : '<em class="text-muted">This group has no content.</em>'

  groupDetailHtml += `<span class="group-name h4 text-primary">${group.name}</span>`
  groupDetailHtml += `<div class="align-middle">`
  groupDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${group.gid}</span>`
  groupDetailHtml += `</div>`
  groupDetailHtml += `<hr>`
  groupDetailHtml += `<span class="d-block"><span class="text-primary">3 concept maps</span> were associated to this group.</span>`
  groupDetailHtml += `<hr>`
  groupDetailHtml += `<span class="d-block mt-3">This group has access to the following functions:</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:delete</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:create</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:list</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:dump</span>`
  groupDetailHtml += `<hr>`
  groupDetailHtml += `<span class="d-block mt-3">This group is associated with: <span class="text-primary">4 modules.</span></span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">dashboard</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">kitbuild</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">cmap</span>`
  groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app</span>`

  $('#detail-group').html(groupDetailHtml)

}

$(() => {
  let app = GroupApp.instance()
})