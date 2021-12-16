class Modal {

  constructor(canvas, options) { // console.log(canvas, options)
    this.newNodeLabel = null;
    this.settings = Object.assign({}, options);
    this.canvas = canvas;
    this.container = $('#kbui-modal');
    $(this.container).find('.kb-modal-prompt').on('shown.bs.modal', function (e) {
      $('#input-node-label').focus();
    });
  }

  promptNode(type, value, settings, callback) {
    let canvas = this.canvas;
    let modal = this;
    $('#input-node-label').removeClass('is-invalid').val(value);
    $(modal.container).find('.kb-modal-prompt .text-error').html('');
    let title = '';
    let inputLabel = '';
    let helperText = '';
    switch (type) {
      case 'concept':
        inputLabel = canvas.l.get('concept-label')
        helperText = canvas.l.get('concept-should-less')
        switch (settings.action.toLowerCase()) {
          case 'new':
            title = canvas.l.get('new-concept');
            break;
          case 'edit':
            title = canvas.l.get('edit-concept');
            break;
        }
        break;
      case 'link':
        inputLabel = canvas.l.get('link-label')
        helperText = canvas.l.get('link-should-less')
        switch (settings.action.toLowerCase()) {
          case 'new':
            title = canvas.l.get('new-link');
            break;
          case 'edit':
            title = canvas.l.get('edit-link');
            break;
        }
        break;
    }
    $(modal.container).find('.kb-modal-prompt .modal-title').html(title);
    $(modal.container).find('.kb-modal-prompt .modal-input-label').html(inputLabel);
    $(modal.container).find('.kb-modal-prompt .modal-helper-text').html(helperText);

    if (typeof callback == 'function') {

      $(modal.container).find('.kb-modal-prompt .bt-ok').show();

      let submitLabel = function () {
        let val = $('#input-node-label').val().toString().trim();

        if (val != '') {

          try {
            callback(val);
            $('#input-node-label').val(value);
            $(modal.container).find('.kb-modal-prompt').modal('hide');
          } catch (error) {
            $(modal.container).find('.kb-modal-prompt .text-error').html(error);
          }
        } else {
          $('#input-node-label').addClass('is-invalid');

        }
      }
      $(modal.container).find('.kb-modal-prompt .bt-ok').off('click').on('click', submitLabel);
      $('#input-node-label').off('keypress').on('keypress', function (e) {
        if ($('#input-node-label').val().toString().trim().length)
          $('#input-node-label').removeClass('is-invalid');
        if (e.which == 13) submitLabel(); // Kalau ditekan ENTER
      });


    } else {
      $(modal.container).find('.kb-modal-prompt .bt-ok').hide();
    }

    if (settings.closeCallback) {
      $(modal.container).find('.kb-modal-prompt .bt-close').on('click', settings.closeCallback);
    }

    $(modal.container).find('.kb-modal-prompt').modal('show');
  }

  newNode(type, options, callback) {

    let defaults = {
      callback: null,
      closeCallback: null,
      action: 'New'
    };
    let settings = Object.assign({}, defaults, options);
    this.promptNode(type, '', settings, callback);
  }

  editNode(node, options, callback) {

    let defaults = {
      callback: null,
      closeCallback: null
    };
    let settings = Object.assign({}, defaults, options);
    let type = node.data('type');
    let name = node.data('name');

    this.promptNode(type, name.trim(), settings, callback);
  }

  dialog(text, options) {
    let app = this.canvas;
    let self = this;
    let dialog = $(self.container).find('.kb-modal-dialog');

    let defaults = {
      'text-positive': app.l.get('yes'),
      'text-negative': app.l.get('no'),
      'text': app.l.get('do-you-want-to-continue'),
      'positive-callback': undefined,
      'negative-callback': undefined,
      'shown-callback': undefined,
      'hidden-callback': undefined,
      'width': 'normal',
      'selector': '.modal-dialog-dialog'
    }

    if (options == undefined) {
      $('.btn-negative').hide();
      defaults["text-positive"] = app.l.get('ok');
      defaults['positive-callback'] = function () {
        dialog.modal('hide');
      }
    } else $('.btn-negative').show();


    let message = text || defaults['text'];

    let settings = Object.assign({}, defaults, options);

    // this.setModalWidth(settings);

    dialog.find('.btn-positive').html(settings['text-positive']);
    dialog.find('.btn-negative').html(settings['text-negative']);
    dialog.find('.modal-dialog-content').html(message);

    if (settings['negative-callback'] == undefined) {
      dialog.find('.btn-negative')
        .off('click')
        .on('click', function () {
          dialog.modal('hide');
        }); //.hide();
    } else dialog.find('.btn-negative')
      .off('click')
      .on('click', settings['negative-callback'])
      .show();
    if (settings['positive-callback'] != undefined) {
      dialog.find('.btn-positive')
        .off('click')
        .on('click', settings['positive-callback']);
    } else dialog.find('.btn-positive')
      .off('click');

    if (settings['shown-callback'] != undefined) {
      dialog.on('shown.bs.modal', settings['shown-callback']);
    }
    if (settings['hidden-callback'] != undefined) {
      dialog.on('hidden.bs.modal', settings['hidden-callback']);
    }

    return dialog.modal(settings);

  }

  hide(dialog) {
    dialog.modal('hide');
  }

  showSnapshot(base64uri) {
    let modal = this;
    $(modal.container).find('.kb-modal-snapshot .kb-snapshot').html('<img>');
    $(modal.container).find('.kb-modal-snapshot .kb-snapshot').css('text-align', 'center');
    $(modal.container).find('.kb-modal-snapshot .kb-snapshot img').css('max-width', '100%');
    $(modal.container).find('.kb-modal-snapshot .kb-snapshot img').css('max-height', '400px');
    $(modal.container).find('.kb-modal-snapshot .kb-snapshot img').attr('src', base64uri);

    $(modal.container).find('.kb-modal-snapshot .btn-download').off('click').on('click', function () {
      let download = function (content, fileName, contentType) {
        var a = document.createElement("a");
        a.href = content;
        a.download = fileName;
        a.click();
      }
      download(base64uri, 'concept-map.png', 'image/png');
    });

    $(modal.container).find('.kb-modal-snapshot .btn-close').off('click').on('click', function () {
      $(modal.container).find('.kb-modal-snapshot').modal('hide');
    });

    $(modal.container).find('.kb-modal-snapshot').modal('show');
  }

}