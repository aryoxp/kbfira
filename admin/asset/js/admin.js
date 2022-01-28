class AdminApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    this.ajax = Core.instance().ajax();
    this.session = Core.instance().session();
    this.handleEvent(this);
  }
  static instance(options) {
    return new AdminApp(options)
  }
  static signIn(username, password = '') {
    if (!username) return Promise.reject("Invalid username.");
    this.ajax = Core.instance().ajax()
    return this.ajax.post(`RBACApi/signIn`, {
      username: username,
      password: password
    })
  }
  handleEvent() {
    $(".admin-toggle-sidebar").on("click", (e) => {
      $(".sidebar-panel")
        .one('transitionend', (e) => {
          $(".sidebar-panel").off('transitionend')
          UI.broadcast('sidebar-toggle');
          console.warn('transition end')
      }).toggleClass("collapsed");
    });
    $(".admin-toggle-sidepanel").on("click", (e) => {
      $(".side-panel").toggleClass("collapsed");
    });
    $("a.has-submenu").on("click", (e) => {
      $(e.currentTarget)
        .next("ul")
        .slideToggle("fast", () => {
          $(e.currentTarget).toggleClass("collapsed");
        });
    });

    $('form.form-sign-in').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      let username = $('#input-username').val()
      let password = $('#input-password').val()
      let data = {
        username: username,
        password: password
      }
      this.ajax.post('RBACApi/signIn', data).then(result => {
        if (result === null) {
          UI.error("Invalid username/password").show();
          return;
        }
        this.session.set('user', result).then(() => {
          $('#card-sign-in').addClass('d-none')
          UI.success('Sign in successful.').show()
        });
      }).catch(error => UI.error(error).show())
    });

    $('.bt-app-sign-in').on('click', e => {
      AdminApp.modalSignIn = UI.modal('#modal-sign-in', {width: 350}).show();
    });
    $('#modal-sign-in').on('click', '.bt-sign-in', (e) => {
      e.preventDefault();
      let username = $('#input-username').val();
      let password = $('#input-password').val();
      AdminApp.signIn(username, password).then(user => { 
        // console.log(user)
        if (typeof user == 'object' && user) {
          Core.instance().session().set('user', user).then(() => {
            location.reload();
          })
          AdminApp.modalSignIn.hide()
        } else throw "Invalid username and/or password.";
      }).catch(error => UI.error(error).show());
    })

    $('.bt-app-sign-out').on('click', e => {
      let confirm = UI.confirm('Do you want to sign out?').positive(() => {
        // console.log(Core.instance().config())
        this.session.get('lang').then(lang => {
          this.session.destroy().then(() => {
            Promise.all(lang ? [this.session.set('lang', lang)] : []).then(() => {
              window.location.href = Core.instance().config('baseurl');
            });
          })
        })
        confirm.hide();
      }).show();
    })
  
    // auto-scroll and unfold menu
    let config = Core.instance().config()
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').show()
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').siblings('a.has-submenu').removeClass('collapsed')
    let menu = $(`li[data-id="${config.get('module')}-${config.get('menu')}"] > a`).addClass('active')[0]
    if (menu) menu.scrollIntoView({behavior: "smooth", block: "center"});
  }
}

$(() => {
  AdminApp.instance()
});
