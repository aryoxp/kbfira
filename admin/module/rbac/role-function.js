class RoleFunction {
  constructor(options) {
    this.settings = Object.assign({}, options)
    RoleFunction.handleEvent(this)
  }
  static instance(options) {
    return new RoleFunction(options)
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
        RoleFunction.populateRoles(roles)
        RoleFunction.populatePagination(count, this.pagination.page, perpage)
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
    });

    $('#pagination-role').on('click', '.pagination-page', (e) => {
      this.pagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-role').trigger('submit')
    });

    $('#list-role').on('click', '.bt-detail', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      let promises = [];
      promises.push(this.ajax.get(`RBACApi/getRoleDetail/${rid}`));
      promises.push(this.ajax.get(`RBACApi/getRoleAuthApp/${rid}`));
      promises.push(this.ajax.get(`RBACApi/getModules`));
      Promise.all(promises).then(result => { // console.log(result);
        let role = result[0];
        let authApps = result[1];
        let modules = result[2];
        RoleFunction.populateRoleDetail(role, authApps, modules);
      }).catch(error => {
        UI.error(error).show();
      });
    });







    $('#detail-role').on('click', '.item-app', e => {
      let app = $(e.currentTarget).attr('data-app');
      let rid = $(e.currentTarget).attr('data-rid');
      Promise.all([
        this.ajax.get(`RBACApi/getRoleAuthAppFunction/${rid}/${app}`),
        this.ajax.get(`RBACApi/getAppFunction/${app}`)]).then(result => {
          let authFunction = result[0];
          let functions = result[1];
          // console.log(functions, authFunction);
          RoleFunction.populateFunctions(app, rid, functions, authFunction);
        }).catch(error => {
          UI.error(error).show();
        })
    });

    $('#list-function').on('click', '.switch-role-function', e => {
      // console.log($(e.currentTarget).prop('checked'));
      let shouldEnable = $(e.currentTarget).prop('checked');
      let rid = $(e.currentTarget).parents('.item-function').attr('data-rid');
      let app = $(e.currentTarget).parents('.item-function').attr('data-app');
      let fid = $(e.currentTarget).parents('.item-function').attr('data-fid');
      if (shouldEnable) {
        this.ajax.post('RBACApi/grantRoleFunction', {
          rid: rid,
          app: app,
          fid: fid
        }).then(result => {
          UI.success(`Function: <code>${fid}</code> granted to role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Grant error for function: <code>${fid}</code> to role: <code>${rid}</code>`).show();
          console.error(error);
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      } else {
        this.ajax.post('RBACApi/revokeRoleFunction', {
          rid: rid,
          app: app,
          fid: fid
        }).then(result => {
          UI.success(`Function: <code>${fid}</code> revoked from role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Revoke error for function: <code>${fid}</code> from role: <code>${rid}</code>`).show();
          console.error(error);
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      }
    });

    $('#list-function').on('click', '.bt-grant-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to grant all the functions to this role: ${rid}?`).positive(() => {
        $('#list-function .switch-role-function').each((i,f) => {
          // console.log($(f).prop('checked'));
          if (!$(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    })

    $('#list-function').on('click', '.bt-revoke-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to revoke all the functions from this role: ${rid}?`).positive(() => {
        $('#list-function .switch-role-function').each((i,f) => {
          // console.log($(f).prop('checked'));
          if ($(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    });

    $('#list-function').on('click', '.bt-apply-runtime', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to apply the authorization of the application functions from this role: ${rid} to application runtime?`).positive(() => {
        $('#list-function .switch-role-function').each((i,f) => {
          if ($(f).prop('checked')) {
            let app = $(f).parents('.item-function').attr('data-app');
            let rid = $(f).parents('.item-function').attr('data-rid');
            let fid = $(f).parents('.item-function').attr('data-fid');
            console.log(app, rid, fid);
            // TODO: write to runtime settings file
          }
        })
        confirm.hide();
      }).show();
    });

    $('.bt-search').trigger('click')

  }
}

RoleFunction.populateRoles = roles => {
  let rolesHtml = '';
  roles.forEach(role => {
    rolesHtml += `<div class="role-item d-flex align-items-center py-1 border-bottom" role="button"`
    rolesHtml += `  data-rid="${role.rid}" data-name="${role.name}">`
    rolesHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">`
    rolesHtml += `    <span>${role.name}</span>`
    rolesHtml += `    <span class="ms-2 badge rounded-pill bg-primary">${role.rid}</span>`
    rolesHtml += `  </span>`
    rolesHtml += `  <span class="text-end text-nowrap ms-3">`
    rolesHtml += `    <button class="btn btn-sm btn-warning bt-detail"><i class="bi bi-journal-check"></i></button>`
    rolesHtml += `  </span>`
    rolesHtml += `</div>`
  });
  if (rolesHtml.length == 0) rolesHtml = '<em class="d-block m-3 text-muted">No roles found in current search.</em>';
  $('#list-role').html(rolesHtml)
}

RoleFunction.populatePagination = (count, page, perpage) => {
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

RoleFunction.populateRoleDetail = (role, auths = [], app = []) => {
  // console.log(app)
  let activeModules = app['active-modules'];
  let modules = new Map(Object.entries(app['modules']));
  let roleDetailHtml = '';
  
  roleDetailHtml += `<span class="role-name h4 text-primary">${role.name}</span>`
  roleDetailHtml += `<div class="align-fiddle">`
  roleDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${role.rid}</span>`
  roleDetailHtml += `</div>`
  roleDetailHtml += `<hr>`

  roleDetailHtml += `<span class="d-block mt-3">This role is currently associated with: <span class="text-primary">${auths.length} modules.</span></span>`;
  roleDetailHtml += `<div class="mt-1 mb-2"><em>Please select an application module to list its applicable functions.</em></div>`;
  authApps = [];
  roleDetailHtml += `<div>`
  auths.forEach(auth => {
    authApps.push(auth.app);
    roleDetailHtml += `<span class="item-app badge rounded-pill bg-primary me-1 px-3" data-app="${auth.app}" data-rid="${role.rid}" role="button">${auth.app}</span>`;
  });
  roleDetailHtml += `</div>`

  $('#detail-role').html(roleDetailHtml);
  $('#list-function').html('');
  $('.module-name').parent().html('<span class="module-name text-primary"></span>');
  // console.log($('#list-function').before());
  // $('#list-function').before('').html('');
}

RoleFunction.populateFunctions = (module, rid, functions = [], activeFunctions = []) => {
  let aFunctions = activeFunctions.map((m, i) => { return m.fid; });
  listFunctionHtml = ``;
  functions.forEach(funct => {
    let checked = aFunctions.includes(funct.id) ? 'checked' : '';
    listFunctionHtml += `<div class="d-flex align-items-center item-function justify-content-between py-1 border-bottom" data-app="${module}" data-fid="${funct.id}" data-rid="${rid}">`;
    listFunctionHtml += `<span class="me-1 px-3">${funct.description} <span class="badge rounded-pill bg-warning text-dark me-1 ms-3 px-2">${funct.id}</span>`
    listFunctionHtml += `</span>`;
    listFunctionHtml += `<div class="form-check form-switch">`
    listFunctionHtml += `  <input class="form-check-input switch-role-function" type="checkbox" role="switch" id="switch-${funct.id}" ${checked}>`
    listFunctionHtml += `</div>`
    listFunctionHtml += `</div>`;
  });
  if (functions.length == 0) listFunctionHtml = `This application module <code>${module}</code> does not have function authorization defined.`;
  else {
    listFunctionHtml += `<div class="d-flex justify-content-between">`
    listFunctionHtml += `<div class="p-2 text-end">`
    listFunctionHtml += `<span class="item-app badge rounded-pill bg-primary me-1 px-3 bt-apply-runtime" role="button" data-rid="${rid}">Apply to runtime</span>`;
    listFunctionHtml += `</div>`  
    listFunctionHtml += `<div class="p-2 text-end">`
    listFunctionHtml += `<span class="item-app badge rounded-pill bg-danger me-1 px-3 bt-revoke-all" role="button" data-rid="${rid}">Revoke all</span>`;
    listFunctionHtml += `<span class="item-app badge rounded-pill bg-success me-1 px-3 bt-grant-all" role="button" data-rid="${rid}">Grant all</span>`;
    listFunctionHtml += `</div>`
    listFunctionHtml += `</div>`
  }
  $('#list-function').html('<hr>' + listFunctionHtml);
  $('.module-name').parent().html('<span class="module-name text-primary"></span>');
  $('.module-name').html(module).before('Function list of app: ');
}

$(() => {
  let app = RoleFunction.instance()
});