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

    $('#list-role').on('click', '.bt-detail', (e) => {
      let rid = $(e.currentTarget).parents('.role-item').attr('data-rid')
      let promises = [];
      promises.push(this.ajax.get(`RBACApi/getRoleDetail/${rid}`));
      promises.push(this.ajax.get(`RBACApi/getRoleAuthApp/${rid}`));
      promises.push(this.ajax.get(`RBACApi/getModules`));
      promises.push(this.ajax.get(`RBACApi/getRegisteredApps`));
      Promise.all(promises).then(result => { // console.log(result);
        let role = result[0];
        let authApps = result[1];
        let modules = result[2];
        let registeredApps = result[3]
        RoleApp.populateRoleDetail(role, authApps, modules, registeredApps);
      }).catch(error => {
        UI.error(error).show();
      });
    })

    $('#detail-role').on('click', '.switch-role-app', e => {
      // console.log($(e.currentTarget).prop('checked'));
      let shouldEnable = $(e.currentTarget).prop('checked');
      let rid = $(e.currentTarget).parents('.item-module').attr('data-rid');
      let app = $(e.currentTarget).parents('.item-module').attr('data-app');
      if (!app) app = $(e.currentTarget).parents('.item-module').attr('data-module');

      
      if (shouldEnable) {
        this.ajax.post('RBACApi/grantRoleApp', {
          rid: rid,
          app: app
        }).then(result => { // console.log(result);
          if (result == 0) throw('0 affected rows.');
          UI.success(`Application: <code>${app}</code> granted to role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Grant error for app: <code>${app}</code> to role: <code>${rid}</code>. Invalid app/module or app/module is not registered in database.`).show();
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      } else {
        this.ajax.post('RBACApi/revokeRoleApp', {
          rid: rid,
          app: app
        }).then(result => {
          UI.success(`Application: <code>${app}</code> revoked from role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Revoke error for app: <code>${app}</code> from role: <code>${rid}</code>`).show();
          console.error(error);
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      }
    });

    $('#detail-role').on('click', '.bt-grant-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to grant all the application modules to this role: ${rid}?`).positive(() => {
        $('#detail-role .switch-role-app').each((i,f) => {
          // console.log($(f).prop('checked'));
          if (!$(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    })

    $('#detail-role').on('click', '.bt-revoke-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to revoke all the application modules from this role: ${rid}?`).positive(() => {
        $('#detail-role .switch-role-app').each((i,f) => {
          // console.log($(f).prop('checked'));
          if ($(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    });

    $('#detail-role').on('click', '.bt-apply-runtime', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to apply the authorization of the application of this role: ${rid} to application runtime?`).positive(() => {
        $('#detail-role .switch-role-app').each((i,f) => {
          if ($(f).prop('checked')) {
            let app = $(f).parents('.item-module').attr('data-app');
            let rid = $(f).parents('.item-module').attr('data-rid');
            console.log(app, rid);
            // TODO: write to runtime settings file
          }
        })
        confirm.hide();
      }).show();
    });

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
    rolesHtml += `    <button class="btn btn-sm btn-warning bt-detail"><i class="bi bi-journal-check"></i></button>`
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

RoleApp.populateRoleDetail = (role, auths = [], app = [], regApps = []) => {
  
  let activeModules = app['active-modules'];
  let modules = new Map(Object.entries(app['modules']));
  let roleDetailHtml = '';
  let rid = role.rid;
  
  roleDetailHtml += `<span class="role-name h4 text-primary">${role.name}</span>`
  roleDetailHtml += `<div class="align-middle">`
  roleDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${role.rid}</span>`
  roleDetailHtml += `</div>`
  roleDetailHtml += `<hr>`

  roleDetailHtml += `<span class="d-block mt-3">This role is currently associated with: <span class="text-primary">${auths.length} modules.</span></span>`;
  authApps = []
  auths.forEach(auth => {
    authApps.push(auth.app);
    roleDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">${auth.app}</span>`;
  })
  roleDetailHtml += `<hr>`;
  
  roleDetailHtml += `<div id="list-module">`;
  modules.forEach(module => {
    let enabled = activeModules.includes(module) ? 'Enabled' : 'Disabled';
    let bg = activeModules.includes(module) ? 'success' : 'danger';
    let checked = authApps.includes(module) ? 'checked' : '';

    roleDetailHtml += `<div class="d-flex align-items-center item-module justify-content-between py-1 border-bottom" data-app="${module}" data-rid="${rid}">`;
    roleDetailHtml += `<span class="me-1 px-3">${module}`
    roleDetailHtml += `  <span class="badge rounded-pill bg-${bg} me-1 ms-3 px-3">${enabled}</span>`;
    roleDetailHtml += `</span>`;
    roleDetailHtml += `<div class="form-check form-switch">`
    roleDetailHtml += `  <input class="form-check-input switch-role-app" type="checkbox" role="switch" id="switch-${module}" ${checked}>`
    roleDetailHtml += `</div>`
    roleDetailHtml += `</div>`;
  });

  regApps.forEach(app => {

    if (Array.from(modules.values()).includes(app.app)) return;

    let enabled = activeModules.includes(app.app) ? 'Enabled' : 'Disabled';
    let bg = activeModules.includes(app.app) ? 'success' : 'danger';
    let checked = authApps.includes(app.app) ? 'checked' : '';

    roleDetailHtml += `<div class="d-flex align-items-center item-module justify-content-between py-1 border-bottom" data-app="${app.app}" data-rid="${rid}">`;
    roleDetailHtml += `<span class="me-1 px-3">${app.name}`
    roleDetailHtml += `  <span class="badge rounded-pill bg-warning text-dark ms-3 px-3">${app.app}</span>`;
    roleDetailHtml += `  <span class="badge rounded-pill bg-${bg} mx-1 px-3">${enabled}</span>`;
    roleDetailHtml += `</span>`;
    roleDetailHtml += `<div class="form-check form-switch">`
    roleDetailHtml += `  <input class="form-check-input switch-role-app" type="checkbox" role="switch" id="switch-${app.app}" ${checked}>`
    roleDetailHtml += `</div>`
    roleDetailHtml += `</div>`;
  });

  roleDetailHtml += `</div>`;

  roleDetailHtml += `<div class="d-flex justify-content-between">`
  roleDetailHtml += `<div class="p-2 text-end">`
  roleDetailHtml += `<span class="item-app badge rounded-pill bg-primary me-1 px-3 bt-apply-runtime" role="button" data-rid="${rid}">Apply to runtime</span>`;
  roleDetailHtml += `</div>`
  roleDetailHtml += `<div class="p-2 text-end">`
  roleDetailHtml += `<span class="item-app badge rounded-pill bg-danger me-1 px-3 bt-revoke-all" role="button" data-rid="${rid}">Revoke all</span>`;
  roleDetailHtml += `<span class="item-app badge rounded-pill bg-success me-1 px-3 bt-grant-all" role="button" data-rid="${rid}">Grant all</span>`;
  roleDetailHtml += `</div>`
  roleDetailHtml += `</div>`

  $('#detail-role').html(roleDetailHtml)

}

$(() => {
  let app = RoleApp.instance()
});