(function ($) {

  class Toast {
    constructor(content, opts) {
      this.content = content
      this.settings = Object.assign({}, Toast.default, opts)
    }

    static instance(content, opts) {
      return new Toast(content, opts)
    }

    toast(opts) {
      this.settings = Object.assign({}, this.settings, opts)
      let autohide =
        this.settings.autohide == false || this.settings.delay == 0
          ? ' data-bs-autohide="false"'
          : "";
      let delay =
        this.settings.delay != Toast.default.delay
          ? ` data-bs-delay="${this.settings.delay}"`
          : "";
      if (!$(".toast-container").length) $('body').append('<div class="toast-container position-absolute top-0 end-0"></div>')
      let idx = $(".toast-container .toast").length
        ? Math.max.apply(
            null,
            $(".toast-container .toast")
              .map((i, t) => {
                return parseInt($(t).attr("data-id"));
              })
              .get()
          ) + 1
        : 1;
      let id = ` data-id="${idx}" id="toast-${idx}"`;
      let t = `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true"${autohide}${delay}${id}>`

      if (this.settings.title) {
        t += `<div class="toast-header">`
        t += `<div class="rounded me-2 bg-${this.settings.type} px-2" alt="..." style="--bs-bg-opacity: .7">&nbsp;</div>`
        t += `<strong class="me-auto">${this.settings.title ? this.settings.title : ''}</strong>`
        t += `<small class="text-muted">${this.settings.subtitle ? this.settings.subtitle : ''}</small>`
        t += `<button type="button" class="btn-close me-0" data-bs-dismiss="toast" aria-label="Close"></button>`
        t += `</div>`
      }

      t += `<div class="toast-body d-flex justify-content-between border rounded border-${this.settings.type} bg-${this.settings.type} text-${this.settings.type}" style="${this.settings.style}"><span class="toast-content" style="${this.settings.textstyle}">${this.content}</span>`
      t += this.settings.title ? '' : `<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>`
      t += `</div>`
      t += `</div>`
      $('.toast-container').append(t);
      return new bootstrap.Toast($('.toast-container').find('.toast:last')).show()
    }
    show(options) {
      return this.toast(options)
    }
  }
  
  Toast.default = {
    delay: 5000,
    title: null,
    subtitle: null,
    autohide: true,
    type: 'secondary',
    style: '--bs-bg-opacity: .3;',
    textstyle: 'filter: brightness(0.65);'
  }

  // remove from DOM when a toast is hidden
  $('body').on('hidden.bs.toast', '.toast', (e) => $(e.currentTarget).remove())

  // embed toast function in jQuery
  $.toast = (content, opts) => Toast.instance(content, opts).toast()
  $.toastInstance = (content, opts) => { return Toast.instance(content, opts) }

  $(window).resize((e) => {
    UI.broadcast('window-resize', e) 
  })

}(jQuery))

class Dialog {
  constructor(content, opts) {
    this.settings = Object.assign({}, Dialog.default, opts)
    this.content = content
    this.negCallback = null
    this.posCallback = null
    this.positiveLabel = this.settings.positiveLabel
    this.negativeLabel = this.settings.negativeLabel
    this.emphasized = false
    this.titleText = null
  }
  static instance(content, opts) {
    return new Dialog(content, opts);
  }
  title (titleText) {
    this.titleText = titleText
    return this;
  }
  positive(callback, label) {
    this.posCallback = callback
    if (label) this.positiveLabel = label
    return this;
  }
  negative(callback, label) {
    this.negCallback = callback
    if (label) this.negativeLabel = label
    return this;
  }
  emphasize() {
    this.emphasized = true
    return this;
  }
  show(opts) {
    this.settings = Object.assign({}, this.settings, opts)
    if (this.settings.width) $('#modal-dialog .modal-dialog').css('max-width', this.settings.width)
    $('#modal-dialog .modal-dialog').css('width', 'fit-content')
    $('#modal-dialog .dialog-icon').removeClass(function (index, className) {
      return (className.match (/\b(bi-|text-)\S+/g) || []).join(' ');
     }).addClass(`bi bi-${this.settings.icon} text-${this.settings.iconStyle}`)
    $('#modal-dialog .bt-positive').html(this.positiveLabel)
    $('#modal-dialog .bt-negative').html(this.negativeLabel)
    if (this.negCallback) {
      $('#modal-dialog .bt-negative').show()
      $('#modal-dialog .bt-negative').off('click').on('click', this.negCallback)
      if (!this instanceof Confirm)
        $('#modal-dialog .dialog-foot').removeClass('text-center').addClass('text-end')
      else $('#modal-dialog .dialog-foot').removeClass('text-end').addClass('text-center')
    } else {
      $('#modal-dialog .bt-negative').hide()
      $('#modal-dialog .bt-negative').off('click').on('click', this.hide)
      $('#modal-dialog .dialog-foot').removeClass('text-end').addClass('text-center')
    }
    if (this.emphasized) {
      $("#modal-dialog .bt-positive")
        .removeClass("btn-primary")
        .addClass("btn-danger")
      $('#modal-dialog').addClass("animate__animated animate__fast animate__headShake")
    } else
      $("#modal-dialog .bt-positive")
        .removeClass("btn-danger")
        .addClass("btn-primary")

    if (this.posCallback) {
      $('#modal-dialog .bt-positive').show()
      $('#modal-dialog .bt-positive').off('click').on('click', this.posCallback)
    } else {
      $('#modal-dialog .bt-positive').off('click').on('click', this.hide)
    }
    if (this.titleText) {
      $('#modal-dialog .dialog-title').html(this.titleText)
      $('#modal-dialog .dialog-head').show()
    } else {
      $('#modal-dialog .dialog-head').hide()
    }
    $('#modal-dialog .dialog-content').html(this.content)
    Dialog.modal = new bootstrap.Modal($('#modal-dialog'), this.settings);
    if (this.settings.toggle) Dialog.modal.toggle()
    else Dialog.modal.show()
    return Dialog.modal;
  }
  toggle(opts) {
    this.show(Object.assign({toggle: true, opts}))
  }
  hide() {
    if (Dialog.modal) Dialog.modal.hide()
  }
}

Dialog.default = {
  backdrop: true,
  keyboard: true,
  focus: true,
  width: '400px',
  negativeLabel: 'Cancel',
  positiveLabel: 'OK',
  icon: 'info-circle',
  iconStyle: 'primary'
}

class Confirm extends Dialog {
  constructor(content, opts) {
    super(content, Object.assign({}, Confirm.default, opts))
    this.negCallback = this.hide
  }
  static instance(content, opts) {
    return new Confirm(content, Object.assign({}, Confirm.default, opts))
  }
}

Confirm.default = {
  negativeLabel: 'No',
  positiveLabel: 'Yes',
  icon: 'question-diamond-fill',
  iconStyle: 'warning'
}

class Loading {
  constructor(content, opts) {
    this.settings = Object.assign({}, Loading.default, opts)
    this.content = content;
  }
  static instance(content, opts) {
    return new Loading(content, opts)
  }
  show(opts) {
    let content = this.content
    this.settings = Object.assign(this.settings, opts)
    if (content) $('#modal-loading .loading-text').html(content)
    if (this.settings.width) $('#modal-loading .modal-dialog').css('max-width', this.settings.width)
    if (!$('#modal-loading .animation').html()) {
      let dotSvgs = '', dots = ['primary', 'danger', 'warning', 'success', 'secondary']
      for(let d of dots) {
        dotSvgs += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-fill text-${d}" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>`
      }
      $('#modal-loading .animation').html(dotSvgs)
    }
    Loading.modal = new bootstrap.Modal($('#modal-loading'), this.settings)
    Loading.modal.show()
    function rand() {
      if (!Loading.modal._isShown && !Loading.modal._isTransitioning) return
      let pos = []
      return anime({
        targets: '#modal-loading svg',
        translateY: content ? 0 : 3,
        scale: 1.5,
        translateX: function() {
          let p
          do {
            p = ((anime.random(-2, 2)) * 16) - 6
          } while (pos.includes(p))
          pos.push(p)
          return p;
        },
        delay: 100,
        rotate: anime.stagger(anime.random(-3, 3) * 15),
        easing: 'easeInOutQuad',
        duration: 400,
        complete: rand
      })
    }
    rand()
    return Loading.modal
  }
  hide() {
    if (Loading.modal) Loading.modal.hide()
  }
}

Loading.default = {
  keyboard: false,
  backdrop: 'static',
  width: '250px'
}

class Modal {
  constructor(element, options) {
    this.element = $(element)
    this.settings = Object.assign({
      width: '500px',
      height: null,
      backdrop: true,
      backdropOpacity: 0.3,
      onShow: null,
      onHide: null,
      hideElement: null,
      closeElement: null,
      offset: null,
      dim: {w: 500, h: 300}
    }, options)
    this.element.addClass('shadow').appendTo('body')
    let hideElement = this.settings.hideElement 
      ? this.settings.hideElement 
      : this.settings.closeElement
    if (hideElement) this.addHideElement(hideElement)
  }
  static instance(element, options) {
    return new Modal(element, options)
  }
  show(options) {
    this.settings = Object.assign(this.settings, options)
    if (this.settings.backdrop) this.addBackdrop()
    if (this.settings.height) this.element.css('height', this.settings.height)
    this.element.removeClass('d-none').css('width', this.settings.width).show(0, () => UI.centerDialog(this.element))
    
    this.drag = null, this.resize = null
    if (this.settings.draggable) {
      if (this.settings.offset) this.element.offset(this.settings.offset) 
      this.drag = UI.makeDraggable(this.element, {
        handle: this.settings.dragHandle,
        onMouseUp: (offset) => { this.settings.offset = offset }
      });
    }
    if (this.settings.resizable) {
      this.element.outerWidth(this.settings.width)
      this.element.outerHeight(this.settings.height)
      this.resize = UI.makeResizable(this.element, {
        handle: this.settings.resizeHandle,
        minWidth: this.settings.minWidth,
        minHeight: this.settings.minHeight,
        onMouseUp: (dim) => { 
          this.settings.width = dim.w 
          this.settings.height = dim.h 
        }
      });
    }
    
    if (typeof this.settings.onShow == "function") this.settings.onShow()
    return this;
  }
  hide(options) {
    this.settings = Object.assign(this.settings, options)
    $('.ui-backdrop').fadeOut({duration:100, complete: () => $('.ui-backdrop').remove()})
    this.element.hide()
    if (typeof this.settings.onHide == "function") this.settings.onHide()
  }
  close(options) {
    this.hide(options)
  }
  addBackdrop() {
    let backdrop = $(`<div class="ui-backdrop"></div>`)
      .attr('for', this.element.attr('id'))
      .css('opacity', this.settings.backdropOpacity)
    this.element.before(backdrop)
    if (this.settings.backdrop != 'static')
      $(`.ui-backdrop[for="${this.element.attr('id')}"]`).on('click', (e) => {
        $(e.target).fadeOut({duration:100, complete: () => $(e.target).remove()})
        this.element.hide()
      })
    return this;
  }
  addHideElement(hideElement) {
    $(this.element).find(hideElement).off('click').on('click', (e) => {  // console.log(hideElement, this)
      e.stopPropagation()
      e.preventDefault()
      this.hide()
    })
    return this;
  }
}

class StatusBar {
  constructor(options) {
    this.settings = Object.assign({}, options);
  }
  static instance(options) {
    if (!StatusBar.inst) StatusBar.inst = new StatusBar(options)
    return StatusBar.inst;
  }
  content(content = null) {
    if (content) $(".status-panel").html(content)
    else return $(".status-panel").html()
  }
  append(content) {
    $(".status-panel").append(content)
    return this;
  }
  prepend(content) {
    $(".status-panel").append(content)
    return this;
  }
  remove(selector) {
    $(".status-panel").find(selector).remove()
    return this;
  }
}

class SignIn {
  constructor(options) {
    this.settings = Object.assign({
      redirect: null,
      apps: null,
      gids: null,
      rids: null,
      remember: false,
      successCallback: undefined,
      failCallback: undefined
    }, options);
    this.ajax = Core.instance().ajax();
    this.handleEvent();
    this.render();
    console.log(document.cookie);
  }
  static instance(options) {
    SignIn.inst = new SignIn(options);
    return SignIn.inst;
  }
  render() {
    $('#input-remember-me').prop('checked', (this.settings.remember === true));
    let filterInput = "";
    if (this.settings.apps) {
      this.settings.apps.split(',').forEach(app => {
        filterInput += `<span class="badge rounded-pill text-white bg-danger ms-1">${app}</span>`;
      });
    }
    if (this.settings.gids) {
      this.settings.gids.split(',').forEach(gid => {
        filterInput += `<span class="badge rounded-pill text-white bg-success ms-1">${gid}</span>`;
      });
    }
    if (this.settings.rids) {
      this.settings.rids.split(',').forEach(rid => {
        filterInput += `<span class="badge rounded-pill text-white bg-primary ms-1">${rid}</span>`;
      });
    }
    $('#sign-in-filter').html(filterInput);
  }
  show() {
    this.signInModal = UI.modal('#modal-sign-in', {width: 350}).show();
    return this;
  }
  get modal() {
    return this.signInModal;
  }
  set remember(r = true) {
    if (typeof r === "boolean") this.settings.remember = r;
    else this.settings.remember = false;
    this.render();
  }
  success(successCallback) {
    this.settings.success = successCallback;
    return this;
  }
  fail(failCallback) {
    this.settings.fail = failCallback;
    return this;
  }
  handleEvent() {
    $('form[name="form-sign-in"]').off('submit').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let username = $('#input-username').val()
      let password = $('#input-password').val()
      let data = {
        username: username,
        password: password,
      }
      if (this.settings.apps) data.apps = this.settings.apps;
      if (this.settings.rids) data.rids = this.settings.rids;
      if (this.settings.gids) data.gids = this.settings.gids;

      this.ajax.post('RBACApi/signIn', data).then(user => { // console.error(result)
        if (typeof user != 'object' || !user) {
          if (typeof this.settings.fail == 'function') this.settings.fail(error);
          else UI.error(error).show()
          return;
        }
        $('#card-sign-in').addClass('d-none')
        if (typeof this.settings.success == 'function') this.settings.success(user);
        if (this.settings.redirect) {
          let redir = this.settings.redirect;
          console.log(Core.location(redir));
          window.location.replace(redir.startsWith('http') ? redir : Core.location(redir));
          return;
        }
      }).catch(error => { // console.log(error);
        if (typeof this.settings.fail == 'function') this.settings.fail(error);
        else UI.error(error).show()
      })
    });
  }
}

class Pagination {
  constructor (containerElement, count = 1, perpage = 5) {
    this.containerElement = containerElement
    this.pagination = {
      page: 1,
      maxpage: Math.ceil(count/perpage),
      perpage: perpage,
      count: count,
    }
  }
  static instance(containerElement, count, perpage) {
    return new Pagination(containerElement, count, perpage);
  }
  set page(p) {
    this.pagination.page = parseInt(p);
  }
  set perpage(p) {
    this.pagination.perpage = parseInt(p);
  }
  set count(c) {
    this.pagination.count = parseInt(c);
  }
  get page() {
    return this.pagination.page;
  }
  get perpage() {
    return this.pagination.perpage
  }
  get count() {
    return this.pagination.count;
  }
  listen(formElement) {
    this.formElement = formElement;
    $(this.containerElement).off('click', '.pagination-next').on('click', '.pagination-next', (e) => {
      console.log(this.pagination.page, this.pagination.maxpage)
      if (this.pagination.page < this.pagination.maxpage) {
        this.pagination.page++
        $(formElement).trigger('submit')
        console.log(this.pagination.page, this.pagination.maxpage)
        this.update()
      }
      e.preventDefault();
    })

    $(this.containerElement).off('click', '.pagination-prev').on('click', '.pagination-prev', (e) => {
      e.preventDefault();
      if (this.pagination.page > 1) {
        this.pagination.page--
        $(formElement).trigger('submit')
        this.update()
      }
    })

    $(this.containerElement).off('click', '.pagination-page').on('click', '.pagination-page', (e) => {
      e.preventDefault();
      this.pagination.page = parseInt($(e.currentTarget).attr('data-page'))
      $(formElement).trigger('submit')
      this.update()
    })
    return this;
  }
  update(count = null, perpage = null) { // console.warn(this.pagination)
    if (count !== null) this.pagination.count = parseInt(count);
    if (perpage !== null) this.pagination.perpage = parseInt(perpage);

    count   = parseInt(count);
    perpage = parseInt(perpage);

    let paginationHtml = '';
    let page = this.pagination.page;
    let maxpage = count == 0 ? 1 : Math.ceil(this.pagination.count/this.pagination.perpage);
    if (page > maxpage) {
      page = maxpage;
      return this;
    }
    this.pagination.page = page;
    this.pagination.maxpage = maxpage;    
    
    if (this.pagination.count) {
      paginationHtml += `<li class="page-item${page == 1 ? ' disabled': ''}">`
      paginationHtml += `  <a class="page-link pagination-prev" href="#" tabindex="-1" aria-disabled="true"> <i class="bi bi-chevron-left"></i> Prev</a>`
      paginationHtml += `</li>`
      let min = page - 2 < 1 ? 1 : page - 2
      let max = page + 2 > maxpage ? maxpage : page + 2
      for(let p = min; p <= max; p++) {
        paginationHtml += `<li class="page-item${page == p ? ' disabled': ''}"><a class="page-link pagination-page" data-page="${p}" href="#">${p}</a></li>`
      }
      paginationHtml += `<li class="page-item${page == maxpage ? ' disabled': ''}">`
      paginationHtml += `  <a class="page-link pagination-next" href="#">Next <i class="bi bi-chevron-right"></i></a>`
      paginationHtml += `</li>`
      $(this.containerElement).html(paginationHtml)
    } else this.renderEmpty();
    return this;
  }

  renderEmpty(paginationHtml) {
    let html = '';
    html += `<li class="page-item disabled">`
    html += `  <a class="page-link pagination-prev" href="#">Previous</a>`
    html += `</li>`
    html += `<li class="page-item disabled">`
    html += `  <a class="page-link" href="#">--</a>`
    html += `</li>`
    html += `<li class="page-item disabled">`
    html += `  <a class="page-link pagination-next" href="#">Next</a>`
    html += `</li>`
    $(this.containerElement).html(html)
  }
}

class UI {
  static error(content) {
    return $.toastInstance(content, {type: 'danger'})
  }
  static info(content) {
    return $.toastInstance(content, {type: 'info'})
  }
  static success(content) {
    return $.toastInstance(content, {type: 'success'})
  }
  static warning(content) {
    return $.toastInstance(content, {type: 'warning'})
  }
  static toast(content, opts) {
    $.toastInstance(content).toast(opts)
  }
  static dialog(content, opts) {
    return Dialog.instance(content, opts)
  }
  static confirm(confirmText, opts) {
    return Confirm.instance(confirmText, opts)
  }
  static loading(loadingText, opts) {
    return Loading.instance(loadingText, opts)
  }
  static modal(dialog, opts) {
    return Modal.instance(dialog, opts)
  }
  static centerDialog(dialog) {
    let w = $(dialog).width()
    let h = $(dialog).outerHeight()
    let parent = $(window)
    let pw = parent.width()
    let ph = parent.innerHeight()
    // console.log(w, h, parent, pw, ph)
    $(dialog).css("position", "absolute")
    $(dialog).css("top", (ph-h)/2)
    $(dialog).css("left", (pw-w)/2)
    $(dialog).css("z-index", 11)
  }
  static status(content) {
    StatusBar.instance().content(`<span class="mx-2"><small>${content}</small></span>`)
  }
  static makeDraggable(el, opt) {
    opt = Object.assign({ handle: null, cursor: "move" }, opt);
    var handle = $(el).find(opt.handle);
    if (!opt.handle || handle.length == 0) {
      console.warn("Invalid drag handle")
      return
    }
    handle.css("cursor", opt.cursor)
      .off("mousedown").on("mousedown", function (e) {
        var z_idx = $(el).css("z-index"),
          drg_h = $(el).outerHeight(),
          drg_w = $(el).outerWidth(),
          pos_y = $(el).offset().top + drg_h - e.pageY,
          pos_x = $(el).offset().left + drg_w - e.pageX,
          offset = (mouseEvent) => {
            return {
              top: mouseEvent.pageY + pos_y - drg_h,
              left: mouseEvent.pageX + pos_x - drg_w,
            }
          }
        $(el).addClass("draggable")
          .css("z-index", 1000)
          .parents()
          .on("mousemove", function (e) {
            $(".draggable").offset(offset(e))
            .off("mouseup").on("mouseup", () => {
              if (opt.onMouseUp) opt.onMouseUp(offset(e))
              $(el).removeClass("draggable").css("z-index", z_idx);
              $(el).off("mouseup")
            });
          })
        e.preventDefault(); // disable selection
      })
      .on("mouseup", () => $(el).removeClass("draggable"));
      
  }
  static makeResizable(el, opt) {
    opt = Object.assign({ 
      handle: null, 
      cursor: "nwse-resize",
      minWidth: 100,
      minHeight: 100,
      listener: () => {}
    }, opt); // console.log(opt)
    var handle = $(el).find(opt.handle);
    if (!opt.handle || handle.length == 0) {
      console.warn("Invalid resize handle.")
      return
    }
    var tw, th, w, h, offset, y, x
    var onMouseMove = e => {
      // console.log(opt)
      tw = e.pageX - offset.left + (offset.left + w - x)
      th = e.pageY - offset.top + (offset.top + h - y)
      tw = tw < opt.minWidth ? opt.minWidth : tw
      th = th < opt.minHeight ? opt.minHeight : th
      $(el).outerWidth(tw).outerHeight(th)
      if (opt.listener) opt.listener(x, y, e)
    }
    var onMouseUp = e => {
      if (opt.onMouseUp) opt.onMouseUp({ w: tw, h: th })
      $('body').off('mousemove', onMouseMove)
      .off('mouseup', onMouseUp)
    }
    handle
      .css("cursor", opt.cursor)
      .off("mousedown").on("mousedown", function (e) {
        $(el).addClass("resizable")
        w = $(el).outerWidth() 
        h = $(el).outerHeight()
        offset = $(el).offset()
        y = e.pageY
        x = e.pageX
        tw = w
        th = h
        $('body')
          .off('mousemove', this, onMouseMove)
          .on('mousemove', this, onMouseMove)
        $('body')
          .off('mouseup', this, onMouseUp)
          .on('mouseup', this, onMouseUp);
        e.preventDefault(); // disable selection
      }).off("mouseup", this, onMouseUp)
      .on("mouseup", this, onMouseUp);
    return opt
  }
  static spinner(size = "sm", color = null) {
    return `<span class="spinner-border spinner-border${size ? `-${size}` : ""} ${color ? `text-${color}` : ""}" role="status" aria-hidden="true"></span>`
  }
  
}

UI.eventListeners = new Map()
UI.addListener = (listener) => {
  UI.eventListeners.set(listener, listener)
}
UI.removeListener = (listener) => {
  UI.eventListeners.delete(listener)
}
UI.broadcast = (evt, data) => {
  UI.eventListeners.forEach(listener => {
    listener(evt, data)
  })
}