class AdminApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    AdminApp.handleEvent(this)
  }
  static instance(options) {
    return new AdminApp(options)
  }
  static handleEvent(app) {
    
    this.ajax = Core.instance().ajax()
    this.session = Core.instance().session()

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
    })
  
    // auto-scroll and unfold menu
    let config = Core.instance().config()
    // console.log()
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').show()
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').siblings('a.has-submenu').removeClass('collapsed')
    let menu = $(`li[data-id="${config.get('module')}-${config.get('menu')}"] > a`).addClass('active')[0]
    if (menu) menu.scrollIntoView({behavior: "smooth", block: "center"});
  }
}

$(() => {
  AdminApp.instance()
});
