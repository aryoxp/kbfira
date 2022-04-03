$(() => { AdminApp.instance(); });

class AdminApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    this.ajax = Core.instance().ajax();
    this.session = Core.instance().session();
    this.handleEvent();
    this.handleRefresh();
  }
  static instance(options) {
    return new AdminApp(options);
  }
  static signIn(username, password = '') {
    if (!username) return Promise.reject("Invalid username.");
    this.ajax = Core.instance().ajax();
    return this.ajax.post(`RBACApi/signIn`, {
      username: username,
      password: password
    });
  }
  handleEvent() {
    $(".admin-toggle-sidebar").on("click", (e) => {
      $(".sidebar-panel")
        .one('transitionend', (e) => {
          $(".sidebar-panel").off('transitionend');
          UI.broadcast('sidebar-toggle');
          // console.warn('transition end');
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
      // Lang.l('ask-sign-out');
      let confirm = UI.confirm(Lang.l('ask-sign-out')).positive(() => {
        // console.log(Core.instance().config()) 'Do you want to sign out?'
        this.session.get('lang').then(lang => {
          this.session.destroy().then(() => {
            Promise.all(lang ? [this.session.set('lang', lang)] : []).then(() => {
              window.location.href = Core.instance().config('baseurl');
            });
          });
        });
        confirm.hide();
      }).show();
    });

    $('#dd-lang .item-lang').on('click', e => {
      let langCode = $(e.target).data('code');
      let lang = $(e.target).text();
      let currentLangCode = $('#lang-label').attr('data-lang');
      console.log(langCode, currentLangCode);
      if (langCode == currentLangCode) {
        UI.info(`Current language is ${$('#lang-label').text()}.`).show();
      } else {
        let confirm = UI.confirm(`Change the language setting to ${lang}?`)
          .positive(() => {
            this.session.set('core-lang', langCode).then(() => {
              confirm.hide();
              confirm = UI.confirm(`Language setting has been set to ${lang}. Do you want to reload the page to apply the new settings?<br><span class="text-danger">You might lose unsaved work if you reload now.</span>`)
                .positive(() => {
                  location.reload();
                })
                .show();
            });
        }).show();
      }
    });
  
    // auto-scroll and unfold menu
    let config = Core.instance().config();
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').show();
    $(`li[data-id="${config.get('module')}-${config.get('menu')}"]`).parents('ul').siblings('a.has-submenu').removeClass('collapsed');
    let menu = $(`li[data-id="${config.get('module')}-${config.get('menu')}"] > a`).addClass('active')[0];
    if (menu) menu.scrollIntoView({behavior: "smooth", block: "center"});
  }

  handleRefresh() {
    this.session.getAll().then(sessions => {
      let lang = (sessions['core-lang']) ? (sessions['core-lang']) : Core.instance().config('default_lang');
      $(`#dd-lang .item-lang`).removeClass('text-primary');
      let name = $(`#dd-lang .item-lang[data-code="${lang}"]`).addClass('text-primary').text();
      $('#lang-label').attr('data-lang', lang).html(name);
      console.log(sessions, name);
    });
  }
}
