class Toolbar {

  constructor(canvas, options) {
    // console.error(canvas);
    this.canvas = canvas;
    this.settings = Object.assign({
      defaultColor: '#FFD480'
    }, options);
    this.action = new Action(this.canvas).updateUI();
    this.container = $('#' + canvas.settings.canvasId).parent('.kb-container');
    this.huebee = new Huebee( this.container.find(' .bt-huebee')[0], {
      setText: false,
      setBGColor: '.color-preview',
      hues: 18,
      shades: 7,
      customColors: [ '#C25', '#E62', '#EA0', '#ED0', '#6C6', '#19F', '#258', '#333' ],
      notation: 'hex',
      hostContainer: this.container
    });
    this.setColor(this.settings.defaultColor);
    this.color = this.settings.defaultColor;
    this.textColor = '#000000';
    this.eventListeners = [];
    this.changeDirectionIcon(this.canvas.settings.isDirected);
    this.handleEvent();
    return this;
  }

  attachEventListener(eventListener) {
    this.eventListeners.push(eventListener);
    this.action.attachEventListener(eventListener);
  }

  getAction() { // Action: Undo-Redo object
    return this.action;
  }

  handleEvent() {

    let toolbar = this;
    let eventListeners = this.eventListeners;
    
    this.huebee.on('select', function( color, hue, sat, lum ) {
      
      this.color = color;
      this.textColor = (this.huebee.isLight ? '#000000' : '#FFFFFF');
      this.eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-color-select", this.huebee);
        }
      });
    }.bind(this));

    this.huebee.on('change', function( color, hue, sat, lum ) {
      
      this.color = color;
      this.textColor = (this.huebee.isLight ? '#000000' : '#FFFFFF');
      this.eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-color-change", this.huebee);
        }
      });
    }.bind(this));

    this.container.find('.bt-new-concept').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-new-concept");
        }
      });
    });

    this.container.find('.bt-new-link').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-new-link");
        }
      });
    });

    this.container.find('.bt-undo').on('click', function () {
      if ($(this).hasClass('disabled')) return;
      toolbar.action.undo();
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-undo");
        }
      });
    });

    this.container.find('.bt-redo').on('click', function () {
      if ($(this).hasClass('disabled')) return;
      toolbar.action.redo();
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-redo");
        }
      });
    });

    this.container.find('.bt-zoom-in').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-zoom-in");
        }
      });
    });

    this.container.find('.bt-zoom-out').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-zoom-out");
        }
      });
    });

    this.container.find('.bt-fit').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-fit-screen");
        }
      });
    });

    this.container.find('.bt-center').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-center-camera");
        }
      });
    });

    this.container.find('.bt-search').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-search");
        }
      });
    });

    this.container.find('.bt-select-tool').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-select-tool");
        }
      });
    });

    this.container.find('.bt-direction').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-change-direction");
        }
      });
    });

    this.container.find('.bt-relayout').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-layout");
        }
      });
    });

    this.container.find('.bt-save-image').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-save-image");
        }
      });
    });

    this.container.find('.bt-clear-canvas').on('click', function () {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-clear");
        }
      });
    });

  }

  /* Disable-enable toolbar buttons */

  enableColor(enabled = true) {
    this.container.find('.bt-huebee').prop('disabled', !enabled);
    return this;
  }

  enableNodeCreation(enabled = true) {
    this.container.find('.bt-new-concept').prop('disabled', !enabled);
    this.container.find('.bt-new-link').prop('disabled', !enabled);
    this.enableColor(enabled);
    return this;
  }

  enableConceptCreation(enabled = true) {
    this.container.find('.bt-new-concept').prop('disabled', !enabled);
    this.enableColor(enabled);
    return this;
  }

  enableLinkCreation(enabled = true) {
    this.container.find('.bt-new-link').prop('disabled', !enabled);
    return this;
  }

  enableUndoRedo(enabled = true) {
    this.container.find('.bt-undo').prop('disabled', !enabled);
    this.container.find('.bt-redo').prop('disabled', !enabled);
    return this;
  }

  enableZoom(enabled = true) {
    this.container.find('.bt-zoom-in').prop('disabled', !enabled);
    this.container.find('.bt-zoom-out').prop('disabled', !enabled);
    this.container.find('.bt-fit').prop('disabled', !enabled);
    return this;
  }

  enableSearch(enabled = true) {
    this.container.find('.bt-search').prop('disabled', !enabled);
    return this;
  }

  enableSelectAll(enabled = true) {
    this.container.find('.bt-select-tool').prop('disabled', !enabled);
    return this;
  }

  enableDirection(enabled = true) {
    this.container.find('.bt-direction').prop('disabled', !enabled);
    return this;
  }

  enableAutoLayout(enabled = true) {
    this.container.find('.bt-relayout').prop('disabled', !enabled);
    return this;
  }

  enableSaveImage(enabled = true) {
    this.container.find('.bt-save-image').prop('disabled', !enabled);
    return this;
  }

  enableClearCanvas(enabled = true) {
    this.container.find('.bt-clear-canvas').prop('disabled', !enabled);
    return this;
  }

  enableToolbar(enabled = true) {
    this.container.find('.bt-new-concept').prop('disabled', !enabled);
    this.container.find('.bt-new-link').prop('disabled', !enabled);
    this.container.find('.bt-undo').prop('disabled', !enabled);
    this.container.find('.bt-redo').prop('disabled', !enabled);
    this.container.find('.bt-zoom-in').prop('disabled', !enabled);
    this.container.find('.bt-zoom-out').prop('disabled', !enabled);
    this.container.find('.bt-fit').prop('disabled', !enabled);
    this.container.find('.bt-center').prop('disabled', !enabled);
    this.container.find('.bt-search').prop('disabled', !enabled);
    this.container.find('.bt-direction').prop('disabled', !enabled);
    this.container.find('.bt-relayout').prop('disabled', !enabled);
    this.container.find('.bt-save-image').prop('disabled', !enabled);
    this.container.find('.bt-clear-canvas').prop('disabled', !enabled);
    return this;
  }

  /* Show/hide Toolbar button */

  showColor(shown = true) {
    let show = shown ? {'cssText': 'background-color: #fff;'} : {'cssText': 'display: none !important;'}
    this.container.find('.bt-huebee').css(show);
    return this;
  }

  showNodeCreation(shown = true) {
    // this.container.find('.group-node-creation').css('display', shown ? 'block' : 'none');
    this.container.find('.bt-plus').css('display', shown ? 'block' : 'none');
    this.container.find('.bt-new-concept').css('display', shown ? 'block' : 'none');
    this.container.find('.bt-new-link').css('display', shown ? 'block' : 'none');
    this.showColor(shown);
    return this;
  }

  showConceptCreation(shown = true) {
    this.container.find('.bt-new-concept').css('display', shown ? 'block' : 'none');
    this.showColor(shown);
    return this;
  }

  showLinkCreation(shown = true) {
    this.container.find('.bt-new-link').css('display', shown ? 'block' : 'none');
    return this;
  }

  reset(show = true, enable = true) {
    this.showColor(true)
    this.showNodeCreation(true)
    this.showConceptCreation(true)
    this.showLinkCreation(true)
    this.enableToolbar(enable)
    return this;
  }

  /* Miscellaneous Toolbar alteration */

  changeDirectionIcon(isDirected = true) {
    if(!isDirected) this.container.find('.bt-direction .fa-slash').removeClass('d-none');
    else this.container.find('.bt-direction .fa-slash').addClass('d-none');
    return this;
  }

  setColor(color) {
    if(!color) return;
    this.huebee.setColor(color);
    this.color = color;
    this.textColor = this.huebee.isLight ? '#000000' : '#FFFFFF';
    return this;
  }

  /* Buttons trigger interface */

  triggerClick(what) {
    switch(what) {
      case 'center':
        this.container.find('.bt-center').click();
        break;
      case 'fit':
        this.container.find('.bt-fit').click();
        break;
      case 'layout':
        this.container.find('.bt-relayout').click();
        break;
      case 'clear':
        this.container.find('.bt-clear-canvas').click();
        break;
      default:
        break;
    }
    return this;
  }

}