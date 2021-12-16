class RoleApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    RoleApp.handleEvent(this)
  }
  static instance(options) {
    return new RoleApp(options)
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

    let roleDialog = UI.modal('#role-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle'
    })
    roleDialog.setRole = (role) => {
      roleDialog.role = role;
      $('#role-dialog .dialog-name').html('Edit Role');
      $('#input-name').val(role.name);
      $('#input-rid').val(role.rid);
      return roleDialog
    }


    $('.bt-new').on('click', (e) => {
      roleDialog.role = null;
      $('#role-dialog .dialog-name').html('New Role');
      $('#input-name').val('');
      $('#input-rid').val('');
      roleDialog.show()
    })


    $('#form-search-role').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = $('#form-search-role .input-perpage').val()
      let keyword = $('#form-search-role .input-keyword').val()
      if (keyword != this.pagination.keyword) this.pagination.page = 1
      // perpage = 1
      this.ajax.post(`RBACApi/getRoles/${this.pagination.page}/${perpage}`, {
        keyword: keyword
      }).then(roles => {
        this.ajax.post(`RBACApi/getRolesCount`, {
          keyword: keyword
        }).then(count => {
        this.pagination.perpage = perpage
        this.pagination.count = count
        this.pagination.maxpage = Math.ceil(count/perpage)
        this.pagination.keyword = keyword
        RoleApp.populateRoles(roles)
        RoleApp.populatePagination(count, this.pagination.page, perpage)
        });
      });
    })
    $('.bt-search').on('click', () => $('#form-search-role').trigger('submit'))


    $('#pagination-role').on('click', '.pagination-next', (e) => {
      if (this.pagination.page < this.pagination.maxpage) {
        this.pagination.page++
        $('#form-search-role').trigger('submit')
      }
    })

    $('#pagination-role').on('click', '.pagination-prev', (e) => {
      if (this.pagination.page > 1) {
        this.pagination.page--
        $('#form-search-role').trigger('submit')
      }
    })

    $('#pagination-role').on('click', '.pagination-page', (e) => {
      this.pagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-role').trigger('submit')
    })


    $('#role-dialog form.form-role').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#role-dialog form.form-role').addClass('was-validated')
      let rid = $('#input-rid').val().toUpperCase().trim();
      let name = $('#input-name').val().trim();
      if (!name.length) return
      if (!rid.length) return
      if (!roleDialog.role) {
        this.ajax.post('RBACApi/createRole', {
          rid: rid,
          name: name,
        }).then(role => { // console.warn(role)
          roleDialog.hide();
          UI.success('Role created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        this.ajax.post('RBACApi/updateRole', {
          rid: roleDialog.role.rid,
          name: name,
          nrid: rid,
        }).then(role => { // console.warn(role)
          roleDialog.hide();
          UI.success('Role updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#role-dialog .bt-generate-rid').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-rid').val($('#input-name').val().replace(/\s/g, '').substring(0, 20).trim().toUpperCase())
    })
    $('#role-dialog').on('click', '.bt-ok', (e) => {
      $('#role-dialog form.form-role').trigger('submit')
    })







    $('#list-role').on('click', '.bt-edit', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      this.ajax.get(`RBACApi/getRole/${rid}`).then(role => {
        roleDialog.setRole(role).show()
      })
    })

    $('#list-role').on('click', '.bt-delete', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      let name = $(e.currentTarget).parents('.role-item').attr('data-name')
      let confirm = UI.confirm(`Do you want to <span class="text-danger">DELETE</span> this role?<br><span class="text-primary">"${name}"</span>`).positive(() => {
        this.ajax.post(`RBACApi/deleteRole/`, { rid: rid }).then(result => {
          UI.success('Selected role has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.role-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.role-item').remove()
          })
        })
      }).show()
    })

    $('#list-role').on('click', '.bt-detail', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      this.ajax.get(`RBACApi/getRoleDetail/${rid}`).then(role => {
        RoleApp.populateRoleDetail(role)
      })
    })











    $('#list-role').on('click', '.bt-nlp', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      this.ajax.get(`RBACApi/getRole/${rid}`).then(role => {
        nlpDialog.setRole(role).show()
      })
    })
    $('#nlp-dialog form.form-nlp').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#nlp-dialog form.form-nlp').addClass('was-validated')
      let nlp = $('#input-nlp').val().trim();
      if (!nlpDialog.role) return
      this.ajax.post('RBACApi/updateRoleNlp', {
        rid: nlpDialog.role.rid,
        nlp: nlp,
      }).then(nlp => { // console.warn(role)
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

RoleApp.populateRoles = roles => {
  let rolesHtml = '';
  roles.forEach(role => {
    rolesHtml += `<div class="role-item d-flex align-items-center py-1 border-bottom" role="button"`
    rolesHtml += `  data-rid="${role.rid}" data-name="${role.name}">`
    rolesHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">`
    rolesHtml += `    <span>${role.name}</span>`
    rolesHtml += `    <span class="ms-2 badge rounded-pill bg-primary">${role.rid}</span>`
    rolesHtml += `  </span>`
    rolesHtml += `  <span class="text-end text-nowrap ms-3">`
    rolesHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    rolesHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    rolesHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    rolesHtml += `  </span>`
    rolesHtml += `</div>`
  });
  if (rolesHtml.length == 0) rolesHtml = '<em class="d-block m-3 text-muted">No roles found in current search.</em>';
  $('#list-role').html(rolesHtml)
}

RoleApp.populatePagination = (count, page, perpage) => {
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
  $('#pagination-role').html(paginationHtml)
}

RoleApp.populateRoleDetail = role => {
  let roleDetailHtml = '';

  let content = role.content 
    ? new showdown.Converter({}).makeHtml(role.content) 
    : '<em class="text-muted">This role has no content.</em>'

  roleDetailHtml += `<span class="role-name h4 text-primary">${role.name}</span>`
  roleDetailHtml += `<div class="align-middle">`
  roleDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${role.rid}</span>`
  roleDetailHtml += `</div>`
  roleDetailHtml += `<hr>`
  roleDetailHtml += `<span class="d-block"><span class="text-primary">3 concept maps</span> were associated to this role.</span>`
  roleDetailHtml += `<hr>`
  roleDetailHtml += `<span class="d-block mt-3">This role has access to the following functions:</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:delete</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:create</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:list</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:dump</span>`
  roleDetailHtml += `<hr>`
  roleDetailHtml += `<span class="d-block mt-3">This role is associated with: <span class="text-primary">4 modules.</span></span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">dashboard</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">kitbuild</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">cmap</span>`
  roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app</span>`

  $('#detail-role').html(roleDetailHtml)
  hljs.highlightAll();

}

$(() => {
  let app = RoleApp.instance()
})