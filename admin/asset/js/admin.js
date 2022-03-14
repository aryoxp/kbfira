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

    $('.bt-app-sign-in').on('click', e => {
      AdminApp.modalSignIn = SignIn.instance({
        remember: true,
        // apps: "kome,moke",
        // rids: "administrator",
        // gids: "lel",
        // redirect: 'some/path'
      }).success((user) => { // console.error(user);
        if (typeof user == "object") {
          this.session.set('user', user).then(() => {  
            UI.success('Sign in successful.').show();
            setTimeout(() => location.reload(), 1000);
          });
        } else UI.error(user).show();
      }).show();
    });

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
