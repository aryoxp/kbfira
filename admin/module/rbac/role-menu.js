class RoleMenu {
  constructor(options) {
    this.settings = Object.assign({}, options)
    RoleMenu.handleEvent(this)
  }
  static instance(options) {
    return new RoleMenu(options)
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
        RoleMenu.populateRoles(roles)
        RoleMenu.populatePagination(count, this.pagination.page, perpage)
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
      promises.push(this.ajax.get(`RBACApi/getRegisteredApps`));
      Promise.all(promises).then(result => { // console.log(result);
        let role = result[0];
        let authApps = result[1];
        let modules = result[2];
        let registeredApps = result[3];
        RoleMenu.populateRoleDetail(role, authApps, modules, registeredApps);
      }).catch(error => {
        UI.error(error).show();
      });
    });







    $('#detail-role').on('click', '.item-app', e => {
      let app = $(e.currentTarget).attr('data-app');
      let module = $(e.currentTarget).attr('data-module');
      let rid = $(e.currentTarget).attr('data-rid');
      Promise.all([
        this.ajax.get(`RBACApi/getRoleAuthAppMenu/${rid}/${app ? app : module}`),
        module ? this.ajax.get(`RBACApi/getModuleMenu/${module}`) : 
        this.ajax.get(`RBACApi/getAppMenu/${app ? app : module}`)]).then(result => {
          let authMenu = result[0];
          let appMenu = result[1];
          let menus = [];
          if (module) {
            if(Array.isArray(appMenu))
              appMenu.forEach(aMenu => menus.push(...RoleMenu.flatten(aMenu.menu)));
            else menus.push(...RoleMenu.flatten(appMenu.menu));
          } else {
            console.log(appMenu);
            menus = appMenu;
          }
          // console.log(menus);
          RoleMenu.populateMenus(app ? app : module, rid, menus, authMenu);
        }).catch(error => {
          UI.error(error).show();
        })
    });

    $('#list-menu').on('click', '.switch-role-menu', e => {
      // console.log($(e.currentTarget).prop('checked'));
      let shouldEnable = $(e.currentTarget).prop('checked');
      let rid = $(e.currentTarget).parents('.item-menu').attr('data-rid');
      let app = $(e.currentTarget).parents('.item-menu').attr('data-app');
      let mid = $(e.currentTarget).parents('.item-menu').attr('data-mid');
      if (shouldEnable) {
        this.ajax.post('RBACApi/grantRoleMenu', {
          rid: rid,
          app: app,
          mid: mid
        }).then(result => {
          UI.success(`Menu: <code>${mid}</code> granted to role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Grant error for menu: <code>${mid}</code> to role: <code>${rid}</code>`).show();
          console.error(error);
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      } else {
        this.ajax.post('RBACApi/revokeRoleMenu', {
          rid: rid,
          app: app,
          mid: mid
        }).then(result => {
          UI.success(`Menu: <code>${mid}</code> revoked from role: <code>${rid}</code>`).show();
        }).catch(error => {
          UI.error(`Revoke error for menu: <code>${mid}</code> from role: <code>${rid}</code>`).show();
          console.error(error);
          $(e.currentTarget).prop('checked', !$(e.currentTarget).prop('checked'));
        })
      }
    });

    $('#list-menu').on('click', '.bt-grant-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to grant all the menus to this role: ${rid}?`).positive(() => {
        $('#list-menu .switch-role-menu').each((i,f) => {
          // console.log($(f).prop('checked'));
          if (!$(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    })

    $('#list-menu').on('click', '.bt-revoke-all', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to revoke all the menus from this role: ${rid}?`).positive(() => {
        $('#list-menu .switch-role-menu').each((i,f) => {
          // console.log($(f).prop('checked'));
          if ($(f).prop('checked')) $(f).trigger('click');
        })
        confirm.hide();
      }).show();
    });

    $('#list-menu').on('click', '.bt-apply-runtime', e => {
      let rid = $(e.currentTarget).attr('data-rid');
      let confirm = UI.confirm(`Do you want to apply the authorization of the application menus from this role: ${rid} to application runtime?`).positive(() => {
        $('#list-menu .switch-role-menu').each((i,f) => {
          if ($(f).prop('checked')) {
            let app = $(f).parents('.item-menu').attr('data-app');
            let rid = $(f).parents('.item-menu').attr('data-rid');
            let mid = $(f).parents('.item-menu').attr('data-mid');
            console.log(app, rid, mid);
            // TODO: write to runtime settings file
          }
        })
        confirm.hide();
      }).show();
    });

    $('.bt-search').trigger('click')

  }
}

RoleMenu.populateRoles = roles => {
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

RoleMenu.populatePagination = (count, page, perpage) => {
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

RoleMenu.populateRoleDetail = (role, auths = [], app = []) => {

  // let activeModules = app['active-modules'];
  let modules = new Map(Object.entries(app['modules']));
  let roleDetailHtml = '';
  
  roleDetailHtml += `<span class="role-name h4 text-primary">${role.name}</span>`
  roleDetailHtml += `<div class="align-middle">`
  roleDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${role.rid}</span>`
  roleDetailHtml += `</div>`
  roleDetailHtml += `<hr>`

  roleDetailHtml += `<span class="d-block mt-3">This role is currently associated with: <span class="text-primary">${auths.length} modules.</span></span>`;
  roleDetailHtml += `<div class="mt-1 mb-2"><em>Please select an application module to list its applicable menus.</em></div>`;

  auths.forEach(auth => {
    if (!Array.from(modules.values()).includes(auth.app)) {
      roleDetailHtml += `<span class="item-app badge rounded-pill bg-success me-1 px-3" data-app="${auth.app}" data-rid="${role.rid}" role="button">${auth.app}</span>`;
      return;
    }
    roleDetailHtml += `<span class="item-app badge rounded-pill bg-primary me-1 px-3" data-module="${auth.app}" data-rid="${role.rid}" role="button">${auth.app}</span>`;
  });

  $('#detail-role').html(roleDetailHtml)
  $('.module-name').parent().html('<span class="module-name text-primary"></span>');
  $('#list-menu').html('');

}

RoleMenu.populateMenus = (module, rid, menus = [], activeMenus = []) => {
  let aMenus = activeMenus.map((m, i) => { return m.mid; });
  listMenuHtml = ``;
  menus.forEach(menu => {
    let mid = menu.id ? menu.id : menu.mid;
    let checked = aMenus.includes(mid) ? 'checked' : '';
    listMenuHtml += `<div class="d-flex align-items-center item-menu justify-content-between py-1 border-bottom" data-app="${module}" data-mid="${mid}" data-rid="${rid}">`;
    listMenuHtml += `<span class="me-1 px-3">${menu.label} <span class="badge rounded-pill bg-warning text-dark me-1 ms-2 px-2">${mid}</span><br><code>${menu.url}</code>`
    listMenuHtml += `</span>`;
    listMenuHtml += `<div class="form-check form-switch">`
    listMenuHtml += `  <input class="form-check-input switch-role-menu" type="checkbox" role="switch" id="switch-${menu.id}" ${checked}>`
    listMenuHtml += `</div>`
    listMenuHtml += `</div>`;
  });
  if (menus.length == 0) listFunctionHtml = `This application module <code>${module}</code> does not have menu authorization defined.`;
  else {
    listMenuHtml += `<div class="d-flex justify-content-between">`
    listMenuHtml += `<div class="p-2 text-end">`
    listMenuHtml += `<span class="item-app badge rounded-pill bg-primary me-1 px-3 bt-apply-runtime" role="button" data-rid="${rid}">Apply to runtime</span>`;
    listMenuHtml += `</div>`  
    listMenuHtml += `<div class="p-2 text-end">`
    listMenuHtml += `<span class="item-app badge rounded-pill bg-danger me-1 px-3 bt-revoke-all" role="button" data-rid="${rid}">Revoke all</span>`;
    listMenuHtml += `<span class="item-app badge rounded-pill bg-success me-1 px-3 bt-grant-all" role="button" data-rid="${rid}">Grant all</span>`;
    listMenuHtml += `</div>`
    listMenuHtml += `</div>`
  }
  $('#list-menu').html('<hr>' + listMenuHtml);
  $('.module-name').parent().html('<span class="module-name text-primary"></span>');
  $('.module-name').html(module).before('Menu list of app: ');
}

RoleMenu.flatten = menu => { // console.log(menu);
  let menuArray = [];
  if (!Array.isArray(menu)) return menuArray;
  let walk = menu => {
    if (menu.menu && Array.isArray(menu.menu)) walk(menu.menu);
    if (Array.isArray(menu))
    menu.forEach(m => {
      if (m.id) menuArray.push(m);
      if (m.menu && Array.isArray(m.menu)) walk(m.menu);
    });
  }
  walk(menu);
  return menuArray;
}

$(() => {
  let app = RoleMenu.instance()
});