class ModuleApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    this.ajax = Core.instance().ajax();
    this.handleEvent();
  }
  static instance(options) {
    return new ModuleApp(options)
  }
  handleEvent() {
    let detailDialog = UI.modal("#detail-dialog", {
      hideElement: '.bt-close',
      draggable: true,
      dragHandle: '.drag-handle'
    });
    detailDialog.flatten = menu => {
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
    detailDialog.setSettings = settings => {
      detailDialog.moduleSettings = settings
      let menus = settings.menu
      let functions = settings.function

      detailDialog.menus = detailDialog.flatten(menus);
      detailDialog.functions = functions;
      
      let listMenuHtml = ''
      let showMenu = (menus) => { // console.warn(menus)
        menus.forEach(menu => {
          if (Array.isArray(menu.menu) && menu.menu.length) showMenu(menu.menu);
          else {
            listMenuHtml += `<div class="d-flex justify-content-between">`
            listMenuHtml += `<span>${menu.label} <span class="badge rounded-pill bg-warning text-dark ms-2">${menu.id}</span></span>`
            listMenuHtml += `<span class="me-2"><code>${menu.url}</code></span>`
            listMenuHtml += `</div>`
          }
        })

      }
      menus.forEach(menu => { //console.log(menu)
        if (menu.heading) {
          listMenuHtml += `<div class="d-flex justify-content-between mt-2 mb-1 text-danger">`
          listMenuHtml += `<span class="text-capitalize">${menu.heading}</span>`
          listMenuHtml += `</div>`
        }
        if (Array.isArray(menu.menu) && menu.menu.length) showMenu(menu.menu);
      })
      $('#detail-dialog .list-menu').html(listMenuHtml)

      if (Array.isArray(functions)) {
        let listFunHtml = '';
        functions.forEach(fun => { // console.log(fun);
          listFunHtml += `<div class="d-flex justify-content-between">`;
          listFunHtml += `<span>${fun.description} <span class="badge rounded-pill bg-warning text-dark ms-2">${fun.id}</span></span>`;
          listFunHtml += `</div>`;
        })
        $('#detail-dialog .list-function').html(listFunHtml);
      }

      return detailDialog;
    }

    let appDetailDialog = UI.modal("#app-detail-dialog", {
      hideElement: '.bt-close',
      draggable: true,
      dragHandle: '.drag-handle',
      onShow: () => {
        if(appDetailDialog.section == 'menu') {
          $('#section-function').addClass('d-none');
          $('#section-menu').removeClass('d-none');
        } else {
          $('#section-menu').addClass('d-none');
          $('#section-function').removeClass('d-none');
        }
      }
    });
    appDetailDialog.flatten = menu => {
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
    appDetailDialog.setSettings = settings => {
      appDetailDialog.appSettings = settings
      let menus = settings.menu ? settings.menu : [];
      let functions = settings.function ? settings.function : [];

      appDetailDialog.menus = appDetailDialog.flatten(menus);
      appDetailDialog.functions = functions;
      
      let listMenuHtml = ''
      let showMenu = (menus) => { // console.warn(menus)
        menus.forEach(menu => {
          if (Array.isArray(menu.menu) && menu.menu.length) showMenu(menu.menu);
          else {
            listMenuHtml += `<div class="d-flex justify-content-between">`
            listMenuHtml += `<span>${menu.label} <span class="badge rounded-pill bg-warning text-dark ms-2">${menu.id}</span></span>`
            listMenuHtml += `<span class="me-2"><code>${menu.url}</code></span>`
            listMenuHtml += `</div>`
          }
        })

      }
      menus.forEach(menu => { // console.log(menu)
        if (menu.heading) {
          listMenuHtml += `<div class="d-flex justify-content-between mt-2 mb-1 text-danger">`
          listMenuHtml += `<span class="text-capitalize">${menu.heading}</span>`
          listMenuHtml += `</div>`
        }
        if (Array.isArray(menu.menu) && menu.menu.length) showMenu(menu.menu);
      })
      $('#app-detail-dialog .list-menu').html(listMenuHtml)

      if (Array.isArray(functions)) {
        let listFunHtml = '';
        functions.forEach(fun => { // console.log(fun);
          listFunHtml += `<div class="d-flex justify-content-between">`;
          listFunHtml += `<span>${fun.description} <span class="badge rounded-pill bg-warning text-dark ms-2">${fun.id}</span></span>`;
          listFunHtml += `</div>`;
        })
        if (listFunHtml == '') listFunHtml = '<small class="text-muted"><em>No function for this application is registered.</em></small>'
        $('#app-detail-dialog .list-function').html(listFunHtml);
      }

      return appDetailDialog;
    }
    appDetailDialog.setMenu = (menus) => {
      let listMenuHtml = '';
      menus.forEach(menu => {
        listMenuHtml += `<div class="d-flex justify-content-between">`
        listMenuHtml += `<span>${menu.label} <span class="badge rounded-pill bg-warning text-dark ms-2">${menu.mid}</span></span>`
        listMenuHtml += `<span class="me-2"><code>${menu.url}</code></span>`
        listMenuHtml += `</div>`
      });
      if (listMenuHtml == '') listMenuHtml = '<small class="text-muted"><em>No menu for this application is registered.</em></small>'
      $('#app-detail-dialog .list-menu').html(listMenuHtml);
    }

    let appDialog = UI.modal("#app-dialog", {
      hideElement: '.bt-close',
      draggable: true,
      dragHandle: '.drag-handle'
    })
    appDialog.setApp = (app = null) => {
      $('#app-dialog .dialog-title').html(app ? 'Edit App' : 'Register New App');
      $('#app-dialog .bt-add').html(app ? 'Update' : 'Register');
      appDialog.app = app;
      return appDialog;
    }

    $('.bt-add-app').on('click', (e) => {
      appDialog.setApp().show();
    });

    $('form.app-form').on('submit', (e) => {
      e.preventDefault();
      let app = $('#input-app').val().replace(/[^a-z0-9]+/gi, '');
      let name = $('#input-name').val().trim();
      let shortdesc = $('#input-shortdesc').val().trim();
      let description = $('#input-description').val().trim();
      if (app == "") {
        console.log($(e.currentTarget));
        $('#input-app').addClass('is-invalid')
        return;
      }
      $(e.currentTarget).addClass('was-validated');
      let data = {
        app: app,
        name: name,
        shortdesc: shortdesc,
        description: description
      };
      if (appDialog.papp) data.papp = appDialog.app;
      this.ajax.post('m/x/app/module/registerApp', data).then(result => {
        appDialog.hide();
        UI.success('Application has been registered successfully.').show();
      }).catch(error => {
        UI.error("Unable to register application or application has been registered." + error).show();
      })
      // console.log(data);
    })

    $('.app .bt-info').on('click', (e) => {
      let section = $(e.currentTarget).data('section');
      let appKey = ($(e.target).parents('.app').data('key'));
      console.log(appKey, section);
      appDetailDialog.appKey = appKey;
      appDetailDialog.section = section;
      // appDetailDialog.show();
      this.ajax.get(`m/x/app/moduleApi/getAppSettings/${appKey}`).then(result => {
        console.log(appKey, result);
        appDetailDialog.setSettings(result).show();
        appDetailDialog.setMenu(result.menu);
      })
    });

    $('.app-on-off').on('click', (e) => {
      // console.warn($(e.currentTarget).data('key'), $(e.currentTarget).is(':checked'));
      let url = 'm/x/app/module/' + ($(e.currentTarget).is(':checked') ? 'enable' : 'disable');
      let order = [];
      $('#app-modules .app').each((i, e) => {
        if ($(e).find('.app-on-off').is(':checked'))
          order.push($(e).data('key'));
      })
      $('#app-modules .module').each((i, e) => {
        if ($(e).find('.module-on-off').is(':checked'))
          order.push($(e).data('key'));
      })
      Core.instance().ajax().post(url, {
        key: $(e.currentTarget).data('key'),
        order: order
      }).then(result => { // console.log(result);
        let checked = $(e.currentTarget).is(':checked')
        $(e.currentTarget).prop('checked', checked)
        if (!result) $(e.currentTarget).prop('checked', !checked)
      }).catch(err => { console.error(err)
        let checked = $(e.currentTarget).is(':checked')
        $(e.currentTarget).prop('checked', checked)
        $(e.currentTarget).prop('checked', !checked)
      })
    });

    $('.bt-def-menu').on('click', (e) => {
      $('.def-menu').toggleClass('d-none');
    });

    $('.bt-def-function').on('click', (e) => {
      $('.def-function').toggleClass('d-none');
    });

    $('.bt-parse-menu').on('click', (e) => {
      try {
        let def = JSON.parse($('#input-json-menu').val().trim()); console.log(def);
        if (!Array.isArray(def)) def = [def];
        appDetailDialog.setSettings({
          app: appDetailDialog.appKey,
          menu: def
        });
      } catch(e) { console.error(e);
        UI.error('Invalid JSON data.').show();
      }
    });

    $('.bt-parse-function').on('click', (e) => {
      try {
        let def = JSON.parse($('#input-json-function').val().trim()); // console.log(def);
        appDetailDialog.setSettings({
          app: appDetailDialog.appKey,
          function: def
        });
      } catch(e) { console.error(e);
        UI.error('Invalid JSON data.').show();
      }
    });

    $('#app-detail-dialog').on('click', '.bt-register-menu', (e) => {
      let appKey = appDetailDialog.appKey;
      let menus = appDetailDialog.menus;
      if (!menus || menus.length == 0) {
        UI.warning('Invalid menu definition or menu data have not be parsed.').show();
        return;
      }
      let confirm = UI.confirm(`Register this app <code>${appDetailDialog.appKey}</code> menu data?`).positive(() => {
        this.ajax.post('RBACApi/registerMenu', {
          app: appKey,
          menu: menus
        }).then(result => { // console.log(result);
          UI.success(`App module: <code>${appKey}</code> menu has been registered successfully.`).show();
        });
        confirm.hide();
      }).show();
    });

    $('#app-detail-dialog').on('click', '.bt-register-function', (e) => {
      let appKey = appDetailDialog.appKey;
      let functions = appDetailDialog.functions;
      if (!functions || functions.length == 0) {
        UI.warning('Invalid function definition or function data have not be parsed.').show();
        return;
      }
      let confirm = UI.confirm(`Register this app <code>${appDetailDialog.appKey}</code> function data?`).positive(() => {
        this.ajax.post('RBACApi/registerFunction', {
          app: appKey,
          function: functions
        }).then(result => { // console.log(result);
          UI.success(`App module: <code>${appKey}</code> function has been registered successfully.`).show();
        }).catch(error => { console.error(error);
          UI.error(error).show();
        }).finally(() => {
          confirm.hide();
        });
      }).show();
    });



    $('#app-modules .row').sortable({
      group: 'list',
      animation: 200,
      ghostClass: 'ghost',
      onSort: () => {
        let order = [];
        $('#app-modules .module').each((i, e) => {
          if ($(e).find('.module-on-off').is(':checked'))
            order.push($(e).data('key'));
        })
        let url = 'm/x/app/module/order';
        Core.instance().ajax().post(url, {
          order: order
        }).then(result => {});  
      },
    });
  
    $('.module-on-off').on('click', (e) => {
      // console.warn($(e.currentTarget).data('key'), $(e.currentTarget).is(':checked'));
      let url = 'm/x/app/module/' + ($(e.currentTarget).is(':checked') ? 'enable' : 'disable');
      let order = [];
      $('#app-modules .module').each((i, e) => {
        if ($(e).find('.module-on-off').is(':checked'))
          order.push($(e).data('key'));
      })
      Core.instance().ajax().post(url, {
        key: $(e.currentTarget).data('key'),
        order: order
      }).then(result => { console.log(result);
        let checked = $(e.currentTarget).is(':checked')
        $(e.currentTarget).prop('checked', checked)
        if (!result) $(e.currentTarget).prop('checked', !checked)
      }).catch(err => { console.error(err)
        let checked = $(e.currentTarget).is(':checked')
        $(e.currentTarget).prop('checked', checked)
        $(e.currentTarget).prop('checked', !checked)
      })
    });
  
    $('.module .bt-info').on('click', (e) => {
      let appKey = ($(e.target).parents('.module').data('key'))
      this.ajax.get(`RBACApi/getModuleSettings/${appKey}`).then(result => {
        detailDialog.appKey = appKey;
        detailDialog.setSettings(result).show();
      })
    });
    $('.module .bt-register-module').on('click', (e) => {
      let appKey = ($(e.target).parents('.module').data('key'))
      let confirm = UI.confirm(`Do you want to register this module: <code>${appKey}</code>?`)
        .positive(() => {
          this.ajax.post(`m/x/app/module/registerModule`, {
            module: appKey
          }).then(result => {
            confirm.hide();
            UI.success('Module has been registered successfully').show();
            $(e.target).fadeOut();
          });
        }).show();
    });

    $('#detail-dialog').on('click', '.bt-register-menu', (e) => {
      let confirm = UI.confirm(`Register this app <code>${detailDialog.appKey}</code> menu data?`).positive(() => {
        let appKey = detailDialog.appKey;
        let menus = detailDialog.menus;
        this.ajax.post('RBACApi/registerMenu', {
          app: appKey,
          menu: menus
        }).then(result => { // console.log(result);
          UI.success(`App module: <code>${appKey}</code> menu has been registered successfully.`).show();
        });
        confirm.hide();
      }).show();
    });

    $('#detail-dialog').on('click', '.bt-register-function', (e) => {
      let confirm = UI.confirm(`Register this app <code>${detailDialog.appKey}</code> function data?`).positive(() => {
        let appKey = detailDialog.appKey;
        let functions = detailDialog.functions;
        this.ajax.post('RBACApi/registerFunction', {
          app: appKey,
          function: functions
        }).then(result => { // console.log(result);
          UI.success(`App module: <code>${appKey}</code> function has been registered successfully.`).show();
        }).catch(error => { console.error(error);
          UI.error(error).show();
        }).finally(() => {
          confirm.hide();
        });
      }).show();
    });
    
  }
}

$(() => {
  ModuleApp.instance();
})