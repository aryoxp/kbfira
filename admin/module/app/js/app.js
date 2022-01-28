class ModuleApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    ModuleApp.handleEvent(this)
  }
  static instance(options) {
    return new ModuleApp(options)
  }
  static handleEvent(app) {
    this.ajax = Core.instance().ajax();

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
  
    // $('.module .bt-register').on('click', (e) => {
    //   let appKey = ($(e.target).parents('.module').data('key'))
    //   let dialog = UI.confirm(`Register the authority information of this application [<strong class="text-primary">${appKey}</strong>] to database?`).positive(() => {
    //     dialog.hide()
    //     let url = 'm/x/app/module/register';
    //     Core.instance().ajax().post(url, {module: appKey}).then(result => {
    //       UI.success(result).toast();
    //     }).catch((err) => {
    //       UI.error(err).toast();
    //     });  
    //   }).show()
    // });
  
    // $('.module .bt-deregister').on('click', (e) => {
    //   let appKey = ($(e.target).parents('.module').data('key'))
    //   let dialog = UI.confirm(`Revoke registration of the authority of this application [<strong class="text-primary">${appKey}</strong>] from database?`).positive(() => {
    //     dialog.hide()
    //     let url = 'm/x/app/module/deregister';
    //     Core.instance().ajax().post(url, {module: appKey}).then(result => {
    //       UI.success(result).toast();
    //     }).catch((err) => {
    //       UI.error(err).toast();
    //     });  
    //   }).show()
    // });
  }
}

$(() => {
  ModuleApp.instance();
})