class KitBuildToolbarTool {
  constructor(canvas, options) {
    this.canvas = canvas
    this.settings = Object.assign({
      icon: "app",
      priority: 1,
      stack: 'center' // or 'start' or 'end'
    }, options)
    this.eventListeners = new Map();
    this.evtListeners = new Set();
  }

  attachEventListener(id, listener) {
    return this.eventListeners.set(id, listener)
  }

  detachEventListener(id, listener) {
    return this.eventListeners.delete(id)
  }

  broadcastEvent(event, data, options) {
    this.eventListeners.forEach((listener, k, map) => {
      if (listener != null && typeof listener.onToolbarToolEvent == 'function')
        listener.onToolbarToolEvent(this.canvas.canvasId, event, data, options)
    })
    this.evtListeners.forEach(listener => listener(this.canvas.canvasId, event, data, options))
  }

  on(what, listener) {
    switch(what) {
      case 'event':
        if (typeof listener == 'function')
          this.evtListeners.add(listener)
        break;
    }
  }

  off(what, listener) {
    switch(what) {
      case 'event':
        this.evtListeners.delete(listener)
        break;
    }
  }

  control() {
    return `<a role="b" class="p-1 mx-2"><i class="bi bi-app"></i></a>`
  }

  postRender() {}

  toolbarElement(el) {
    let toolbar = $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar')
    return el ? toolbar.find(el) : toolbar
  }

  handleEvent(event, element, callback) {
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar')
      .off(event, element).on(event, element, callback)
  }

}

class NodeCreationTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {
      'wrap-width': 120,
      'min-width': 20,
      'line-height': 1.4,
      'font-size': 16,
      'font-style': 'normal',
      'font-weight': 'normal',
      'font-family': 'Fira Sans, Helvetica, Arial, sans-serif',
      defaultColor: "#000000",
      defaultConceptColor: "#FFBF40",
      defaultLinkColor: "#DEDEDE"
    }, options)
  }

  control() {
    let labelConcept = "Concept"
    let labelLink = "Link"
    let controlHtml = 
      `<div class="btn-group ms-2">
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dd-direction" data-bs-toggle="dropdown" aria-expanded="false">
            <svg class="icon-active" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi" viewBox="0 0 16 16" data-direction=""></svg>
          </button>
          <ul id="dd-direction-menu" class="dropdown-menu" aria-labelledby="dropdownMenuButton1" style="min-width:2rem">
            <li><a class="dropdown-item d-flex justify-content-between align-items-center" data-direction="bi" href="#"><svg class="icon-bi" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="m11 7.4v-0.77c-0.0014-1.4-1.1-2.5-2.5-2.5h-2.4c-1.4 0.0015-2.5 1.1-2.5 2.5v0.77h-2.6c-0.65-0.03-0.65 1 1e-6 1h2.6v0.77c0.0015 1.4 1.1 2.5 2.5 2.5h2.4c1.4-0.0014 2.5-1.1 2.5-2.5v-0.78c1.5 1e-5 3 1e-5 4.5 1e-5 0.65 0.03 0.65-1 0-1-1.5 0-3-1e-5 -4.5-1e-5zm-1 1.8c0.0015 0.83-0.67 1.5-1.5 1.5h-2.4c-0.83 0.0015-1.5-0.67-1.5-1.5v-2.5c-0.0015-0.83 0.67-1.5 1.5-1.5h2.4c0.83-0.0015 1.5 0.67 1.5 1.5 1e-5 0.85 1e-5 1.7 0 2.5z" fill-rule="evenodd"/></svg>
            <i class="bi bi-check-lg icon-check-bi text-primary ms-2" height="32" width="32"></i></a></li>
            <li><a class="dropdown-item d-flex justify-content-between align-items-center" data-direction="uni" href="#"><svg class="icon-uni" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="m14 8.4c-1.1 0-2.2 0-3.4-1e-5v0.78c-0.0014 1.4-1.1 2.5-2.5 2.5h-2.4c-1.4-0.0014-2.5-1.1-2.5-2.5v-0.77h-2.6c-0.65 0.03-0.65-1-1e-6 -1h2.6v-0.77c0.0015-1.4 1.1-2.5 2.5-2.5h2.4c1.4 0.0015 2.5 1.1 2.5 2.5v0.77c1.1 0 2.2 1e-5 3.3 1e-5 -0.24-0.26-0.47-0.52-0.71-0.78-0.46-0.46 0.33-1.2 0.74-0.67 0.49 0.54 0.98 1.1 1.5 1.6 0.17 0.19 0.17 0.49 0.0012 0.67-0.49 0.54-0.98 1.1-1.5 1.6-0.41 0.5-1.2-0.21-0.74-0.67 0.24-0.27 0.48-0.53 0.72-0.8zm-4.4 0.78c0.0015 0.83-0.67 1.5-1.5 1.5h-2.4c-0.83 0.0015-1.5-0.67-1.5-1.5v-2.5c-0.0015-0.83 0.67-1.5 1.5-1.5h2.4c0.83-0.0015 1.5 0.67 1.5 1.5 1e-5 0.85 1e-5 1.7 0 2.5z" fill-rule="evenodd"/></svg>
            <i class="bi bi-check-lg icon-check-uni text-primary ms-2" height="32" width="32"></i></a></li>
            <li><a class="dropdown-item d-flex justify-content-between align-items-center" data-direction="multi" href="#"><svg class="icon-multi" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="m14 8.4c-1.1 0-2.2 0-3.4-1e-5v0.78c-6e-4 0.58-0.19 1.1-0.52 1.5 0.88 0.88 1.8 1.8 2.6 2.6-0.0022-0.36-0.0043-0.72-0.0064-1.1-0.034-0.65 1-0.65 1-0.0059 0.0046 0.77 0.0091 1.5 0.014 2.3 0.0016 0.27-0.23 0.5-0.5 0.5-0.77-0.0017-1.5-0.0035-2.3-0.0053-0.65 0.029-0.64-1 0.0023-1 0.37 8e-4 0.73 0.0017 1.1 0.0025-0.9-0.9-1.8-1.8-2.7-2.7-0.36 0.2-0.78 0.32-1.2 0.32h-2.4c-1.4-0.0014-2.5-1.1-2.5-2.5v-0.77h-2.6c-0.65 0.03-0.65-1-1e-6 -1h2.6v-0.77c0.0015-1.4 1.1-2.5 2.5-2.5h2.4c0.53 5.7e-4 1 0.17 1.4 0.45 0.9-0.9 1.8-1.8 2.7-2.7l-1.1 0.0064c-0.65 0.034-0.65-1-6e-3 -1 0.77-0.0045 1.5-0.0091 2.3-0.014 0.27-0.0016 0.5 0.23 0.5 0.5-0.0018 0.77-0.0036 1.5-0.0054 2.3 0.029 0.65-1 0.64-1-0.0023 9e-4 -0.37 0.0017-0.73 0.0026-1.1l-2.7 2.7c0.24 0.38 0.38 0.84 0.38 1.3v0.77c1.1 0 2.2 1e-5 3.3 1e-5 -0.24-0.26-0.47-0.52-0.71-0.78-0.46-0.46 0.33-1.2 0.74-0.67 0.49 0.54 0.98 1.1 1.5 1.6 0.17 0.19 0.17 0.49 0.0012 0.67-0.49 0.54-0.98 1.1-1.5 1.6-0.41 0.5-1.2-0.21-0.74-0.67 0.24-0.27 0.48-0.53 0.72-0.8zm-4.4 0.78c0.0015 0.83-0.67 1.5-1.5 1.5h-2.4c-0.83 0.0015-1.5-0.67-1.5-1.5v-2.5c-0.0015-0.83 0.67-1.5 1.5-1.5h2.4c0.83-0.0015 1.5 0.67 1.5 1.5 1e-5 0.85 1e-5 1.7 0 2.5z" fill-rule="evenodd"/></svg>
            <i class="bi bi-check-lg icon-check-multi text-primary ms-2" height="32" width="32"></i></a></li>
          </ul>
        </div>
        <button class="bt-huebee btn btn-sm btn-outline-secondary d-flex" style="background-color: #fff"
          data-tippy-content="">
          <span class="color-preview d-inline-block"
            style="width:15px; height:15px; background-color:#dedede; margin-top:.2rem;"></span>
        </button>
        <button class="bt-new-concept btn btn-sm btn-outline-primary"
          data-tippy-content="New Concept"><i class="bi bi-plus-square-fill" style="color: rgb(255, 191, 64);"></i></button>
        <button class="bt-new-link btn btn-sm btn-outline-primary"
          data-tippy-content="New Link"><i class="bi bi-node-plus-fill"></i></button>
      </div>`
    return controlHtml
  }

  showCreateDialog(type, node) {
    /**
     * type: 'concept' | 'link'
     */

    let n = Object.assign({
      id: 0,
      label: '',
      type: type
    }, node)

    let title = ((n.id == 0) ? "New " : "Edit ") + (type == 'concept' ? 'Concept' : 'Link')
    let placeholder = 'Label'

    let dialogHtml = `<div class="card border-secondary kb-dialog kb-node-dialog shadow" style="width: 20rem; position: absolute; top: 0" data-id="${n.id}">
      <div class="card-header">${title}</div>
      <div class="card-body">
        <form class="form-edit-label">
        <input type="text" value="${n.label ? n.label : "OK"}" class="input-label form-control" placeholder="${placeholder}" aria-label="${placeholder}">
        </form>
      </div>
      <div class="card-footer d-flex justify-content-end">
        <a class="bt-ok btn btn-sm btn-primary" style="min-width: 5rem">OK</a>
        <a class="bt-cancel btn btn-sm btn-secondary ms-2" style="min-width: 5rem">Cancel</a>
      </div>
    </div>`

    $('.kb-dialog').hide().remove()
    $('body').append(dialogHtml)

    // move to the last element of body 
    // so it will be shown on top of other elements
    $('.kb-node-dialog').appendTo('body').show({
      duration: 0,
      complete: () => {
        $('.kb-node-dialog .input-label').focus()
        $('.kb-node-dialog .input-label').select()
        // handle click outside the dialog
        setTimeout(() => {
          $(document).off('click').on('click', (e) => {
            if ($('.kb-node-dialog').find(e.target).length) return
            $('.kb-node-dialog .bt-cancel').trigger('click')
          })
          $(document).off('keyup').on('keyup', function(e) {
            if (e.key == "Escape") $('.kb-node-dialog .bt-cancel').trigger('click');
          });
        }, 500)
      }
    })
    // console.log($(`#${this.canvas.canvasId}`).height(), $(`#${this.canvas.canvasId}`).width(), $(`#${this.canvas.canvasId}`).position(), $(`#${this.canvas.canvasId}`).offset())
    let parent = $(`#${this.canvas.canvasId}`)
    let offset = $(parent).offset()
    let child = $('.kb-node-dialog')
    $('.kb-node-dialog').css({
      top:  (parent.height()/2 - child.height()/2) + offset.top, 
      left: (parent.width()/2 - child.width()/2) + offset.left - (2/3*child.width()) 
    })

    $('.kb-node-dialog .bt-cancel').off('click').on('click', () => {
      $(document).off('click').off('keyup')
      $('.kb-dialog').hide().remove()
    })

    $('.kb-node-dialog .bt-ok').off('click').on('click', () => {
      n.label = $('.kb-node-dialog .input-label').val()
      if (n.label.trim().length != 0) {
        if (n.id == 0) this.canvas.createNode(n).then((node) => { // console.log(node.json())
          $('.kb-node-dialog .bt-cancel').trigger('click')
        })
        else this.canvas.updateNode(n).then((node) => {
          $('.kb-node-dialog .bt-cancel').trigger('click')
          node.select().trigger('select')
        })
      }
    })

    $('.kb-node-dialog .form-edit-label').off('submit').on('submit', (e) => {
      $('.kb-node-dialog .bt-ok').trigger('click');
      e.preventDefault()
    })

  }

  setActiveDirection(direction) {
    this.canvas.direction = direction
    $('#dd-direction .icon-active').html($(`#dd-direction-menu .icon-${direction}`).html()).data('direction', direction)
    $(`#dd-direction-menu .bi-check-lg`).hide().filter(`.icon-check-${direction}`).show()
  }

  handle() {
    this.setActiveDirection(this.canvas.direction)

    this.handleEvent('click', '.bt-new-concept', (e) => { // console.log('New concept')
      this.showCreateDialog('concept')
      e.stopPropagation()
    })
    this.handleEvent('click', '.bt-new-link', (e) => { // console.log('New link')
      this.showCreateDialog('link')
      e.stopPropagation()
    })

    this.color = this.settings.defaultConceptColor;
    this.huebee = new Huebee( $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find(' .bt-huebee')
    [0], {
      setText: false,
      setBGColor: '.color-preview',
      hues: 18,
      saturations: 1,
      shades: 7,
      customColors: [ '#CC2255', '#EE6622', '#EEAA00', '#EEDD00', '#66CC66', '#1199FF', '#225588', '#33333' ],
      notation: 'hex',
    });
    this.huebee.setColor(this.color); // console.log(this.color)
    this.huebee.on( 'change', ( color, hue, sat, lum ) => { // console.log(color)
      // let hex2rgb= c=> `rgb(${c.match(/\w\w/g).map(x=>+`0x${x}`)})`
      // let rgb2hex=c=>'#'+c.match(/\d+/g).map(x=>(+x).toString(16).padStart(2,0)).join``
      let rgb = color.match(/\w\w/g).map(x=>+`0x${x}`)
      let l = (rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114) / 256
      this.color = color
      let colorData = {
        color: color,
        hue: hue,
        sat: sat,
        lum: l,
        isLight: l >= 0.5
      }
      this.applyConceptColor(colorData)
    })
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find(' .color-preview').css('color', this.color)
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find(' .bt-huebee').on('click', (e) => {
      this.huebee.setColor(this.color);
    })
    $(`#dd-direction-menu a`).on('click', (e) => {
      if ($('#dd-direction .icon-active').data('direction') == $(e.currentTarget).data('direction')) return
      let confirm = KitBuildUI.confirm('Depending on the type of concept map,<br>this action will break or merge link nodes on canvas.<br>This action is also <span class="text-danger">NOT UNDOABLE</span>.<br>Do you want to change the type of concept map?', this.canvas.canvasId, {
        icon: "exclamation-triangle-fill",
        iconColor: "danger",
        backdrop: 'static'
      }).then(result => {
        this.convertType($('#dd-direction .icon-active').data('direction'), $(e.currentTarget).data('direction'))
          .then(() => {
          this.setActiveDirection($(e.currentTarget).data('direction'))
        })
      })
    })
  }

  applyConceptColor(data) {
    /* data = {
      color: color,
      hue: hue,
      sat: sat,
      lum: l,
      isLight: l >= 0.5
      } */

      // console.log(this.cy.nodes('[type="concept"]:selected'))

      // capture current color state of selected nodes
      let pnodes = []
      for(let c of this.canvas.cy.nodes('[type="concept"]:selected')) {
        pnodes.push({
          id: c.id(),
          color: c.data('color'),
          bgColor: c.data('background-color') ? c.data('background-color') : this.settings.defaultConceptColor,
        })
      }

      // change the color
      this.canvas.cy.nodes('[type="concept"]:selected').css('color', data.isLight ? '#000000' : '#ffffff')
      this.canvas.cy.nodes('[type="concept"]:selected').css('background-color', data.color)
      this.canvas.cy.nodes('[type="concept"]:selected').data('color', data.isLight ? '#000000' : '#ffffff')
      this.canvas.cy.nodes('[type="concept"]:selected').data('background-color', data.color)

      // capture color state of selected nodes
      let tnodes = []
      for(let c of this.canvas.cy.nodes('[type="concept"]:selected')) {
        tnodes.push({
          id: c.id(),
          color: c.data('color'),
          bgColor: c.data('background-color'),
        })
      }

      // console.log(pnodes, tnodes)

      // post an undo-redo command to stack
      this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO).post("concept-color-change", {
        undoData: pnodes,
        redoData: tnodes,
        undo: () => {
          for(let n of pnodes) {
            this.canvas.cy.nodes(`#${n.id}`).css('color', n.color)
            this.canvas.cy.nodes(`#${n.id}`).css('background-color', n.bgColor)
            this.canvas.cy.nodes(`#${n.id}`).data('color', n.color)
            this.canvas.cy.nodes(`#${n.id}`).data('background-color', n.bgColor)
          }
        },
        redo: () => {
          for(let n of tnodes) {
            this.canvas.cy.nodes(`#${n.id}`).css('color', n.color)
            this.canvas.cy.nodes(`#${n.id}`).css('background-color', n.bgColor)
            this.canvas.cy.nodes(`#${n.id}`).data('color', n.color)
            this.canvas.cy.nodes(`#${n.id}`).data('background-color', n.bgColor)
          }
        }
      })
      this.broadcastEvent("concept-color-change", {
        prior: pnodes,
        later: tnodes
      });
  }

  convertType(from, to) {
    return new Promise((resolve, reject) => {
      let prior = this.canvas.cy.elements().jsons()
      let links = this.canvas.cy.nodes('[type="link"]')
      try {
        if (['uni', 'bi'].includes(to)) {
          let newLinks = this.canvas.cy.collection()
          links.forEach(link => {
            let rightEdges = link.connectedEdges('[type="right"]')
            let leftEdge = link.connectedEdges('[type="left"]')
            if (rightEdges.length > 1) {
              for(let rightEdge of rightEdges) { 
                let linkJson = link.json()
                let rightEdgeJson = rightEdge.json()
                linkJson.data.id = "l" + this.canvas.getNextLinkId()
                let newLink = this.canvas.cy.add(linkJson)
                newLinks = newLinks.add(newLink)
                rightEdgeJson.data.source = newLink.id()
                delete rightEdgeJson.data.id
                this.canvas.cy.add(rightEdgeJson)
                if (leftEdge.length) {
                  let sourceEdgeJson = leftEdge.json()
                  delete sourceEdgeJson.data.id
                  sourceEdgeJson.data.source = newLink.id()
                  this.canvas.cy.add(sourceEdgeJson)
                }
              }
              link.remove()
            }
          })
          if (to == KitBuildCanvas.BIDIRECTIONAL) 
            this.canvas.cy.edges().addClass('bi')
          else this.canvas.cy.edges().removeClass('bi')
          let centroidize = []
          newLinks.filter((link) => { return link.connectedEdges().length > 1 })
            .forEach(link => { 
            centroidize.push(KitBuildCanvas.centroidizeLinkPosition(link))
          })
          this.canvas.layout({
            eles: newLinks.filter((link) => { return link.connectedEdges().length == 1 }),
            tile: true,
            animationDuration: 300
          })
          Promise.all(centroidize).then(() => { 
            this.canvas.cy.nodes('[type="link"]').data('limit', 1);
            this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
            let later = this.canvas.cy.elements().jsons()
            this.broadcastEvent('convert-type', {
              from: from,
              to: to,
              prior: prior,
              later: later
            })
            resolve(newLinks) 
          })
        }
        if (['multi'].includes(to)) {
          let concepts = this.canvas.cy.nodes('[type="concept"]')
          let mergedLinks = new Set(); 
          concepts.forEach(c => {
            let links = new Map();
            let leftEdges = c.connectedEdges('[type="left"]')
            for(let lEdge of leftEdges) {
              let link = lEdge.source()
              let linkLabel = link.data('label');
              if (!links.has(linkLabel.toLowerCase())) links.set(linkLabel.toLowerCase(), link)
              else {
                let previousLink = links.get(linkLabel.toLowerCase())
                mergedLinks.add(previousLink)
                if (link.connectedEdges('[type="right"]').length) {
                  let rEdge = link.connectedEdges('[type="right"]')
                  let rEdgeJson = rEdge.json()
                  delete rEdgeJson.data.id
                  rEdgeJson.data.source = previousLink.id()
                  this.canvas.cy.add(rEdgeJson)
                }
                link.remove()
              }
            }
          })
          this.canvas.cy.edges().removeClass('bi')
          let centroidize = []
          mergedLinks.forEach(link =>
            centroidize.push(KitBuildCanvas.centroidizeLinkPosition(link)))
          Promise.all(centroidize).then(() => { 
            this.canvas.cy.nodes('[type="link"]').data('limit', 9);
            this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()

            let later = this.canvas.cy.elements().jsons()
            this.broadcastEvent('convert-type', {
              from: from,
              to: to,
              prior: prior,
              later: later
            })
            resolve(Array.from(mergedLinks.values()))

          })
        }
      } catch(error) { console.error(error); reject(error); }
    })
  }

  composeNode(nodeData) {
    /* nodeData format:
    {
      type: 'concept'|'link',
      label: 'Node label',
      "background-color": // optional
      position: { // optional
        x: x,
        y: y,
      }
    }
    */
    // Get canvas dimension properties
    const cy = this.canvas.cy;
    let pan = cy.pan();
    let w = cy.width() / cy.zoom();
    let h = cy.height() / cy.zoom();
    let canvasCenterCoordinate = {
      x: parseInt(-pan.x / cy.zoom() + w / 2),
      y: parseInt(-pan.y / cy.zoom() + h / 2),
    };

    let dim = this.calculateDimension(nodeData)
    
    // console.log(suggestedWidth, suggestedHeight, lines, lines.length, this.settings['line-height'], this.settings['font-size'])

    // draw node on center of canvas
    let nodeDef = {
      group: "nodes",
      data: {
        id:
          nodeData.type == "concept"
            ? "c" + this.canvas.getNextConceptId()
            : "l" + this.canvas.getNextLinkId(),
        label: nodeData.label.toString().trim(),
        color: this.settings.defaultColor,
        "background-color": (this.huebee && this.huebee.color)
          ? this.huebee.color
          : this.settings.defaultConceptColor,
        width: dim.w | 0, //  | 0 -> cast to integer
        height: dim.h | 0
      },
      position: nodeData.position
        ? nodeData.position
        : canvasCenterCoordinate,
    };

    if (nodeData.type == "concept") {
      nodeDef.data.color = this.textColor(nodeDef.data['background-color']);
    }
    if (nodeData.type == "link") {
      nodeData.limit = canvas.direction == KitBuildCanvas.MULTIDIRECTIONAL ? 9 : 1;
      nodeData["background-color"] = this.settings.defaultLinkColor
    }

    // delete the following generated data
    delete nodeData.id;
    delete nodeData.label;
    delete nodeData.color;
    delete nodeData.position;

    // append the remaining attributes of node's data
    nodeDef.data = Object.assign(nodeDef.data, nodeData);

    return nodeDef
  }

  calculateDimension(nodeData) {
    // calculate node dimension. 'label' sizing deprecation of Cytoscape
    // const fStyle = node.pstyle('font-style').strValue;
    // const size = node.pstyle('font-size').pfValue + 'px';
    // const family = node.pstyle('font-family').strValue;
    // const weight = node.pstyle('font-weight').strValue;
    // ctx.font = fStyle + ' ' + weight + ' ' + size + ' ' + family;
    // 'normal normal 16px Fira Sans, Arial, Helvetica, sans-serif'
    const text = nodeData.label.toString().trim()
    const ctx = document.createElement('canvas').getContext("2d");
    ctx.font = this.settings['font-style'] 
      + " " + this.settings['font-weight'] 
      + " " + this.settings['font-size'] + "px" 
      + " " + this.settings['font-family']
    let maxWidth = this.settings['wrap-width'] // wrap-width
    var words = text.split(" "); // console.warn(words)
    var lines = []
    var currentLine = ""
    var suggestedWidth = this.settings['min-width'] // min-width

    for (var i = 0; i < words.length; i++) {
      let word = words[i]
      if (word.trim() == "") continue
      let width = ctx.measureText((currentLine + " " + word).trim()).width; // console.log(width)
      if (width < maxWidth - 3) { // 3 is small adjustment // console.log("A")
        currentLine = (currentLine + " " + word).trim()
      } else { // eh kepanjangan ternyata kalau ditambahin // console.log("B")
        if (currentLine.trim() != "") { // console.log("C") // kalau sebelumnya nggak kosong
          lines.push(currentLine) // yang sebelumnya jadiin satu line
          width = ctx.measureText(currentLine.trim()).width
          if (width > suggestedWidth) suggestedWidth = width
        }
        currentLine = word // yang sekarang jadiin baris baru
      }
      if (i != words.length - 1) continue // belum selesai? lanjut...
      if (currentLine.trim() != "") { // eh sudah last word ternyata ... // console.log("E")
        lines.push(currentLine)
        width = ctx.measureText(currentLine.trim()).width
        if (width > suggestedWidth) suggestedWidth = width
      }
    }

    let suggestedHeight = lines.length * this.settings['line-height'] * this.settings['font-size']
    return {
      w: suggestedWidth | 0,
      h: suggestedHeight | 0
    }
  }

  /**
   * This function is not intended to be called externally 
   * nPos   : node properties
   * xPoint : virtual grid point
   */
  isOverlap(nPos, xPoint) { 

    // compute position according to checkpoint (xPoint) position
    let pos = {
      x: nPos.x + (nPos.w + nPos.margin) * xPoint.x,
      y: nPos.y + (nPos.h + nPos.margin) * xPoint.y
    }

    // create node rectangle according to the position
    let rect = {
      id: nPos.id, // to prevent self comparison
      x1: parseInt(pos.x - nPos.w / 2),
      x2: parseInt(pos.x + nPos.w / 2),
      y1: parseInt(pos.y - nPos.h / 2),
      y2: parseInt(pos.y + nPos.h / 2)
    }

    // get all remaining nodes
    let nodes = this.canvas.cy.nodes()
    for (let n of nodes) {

      // skip comparison with the same ID
      if (n.id() == rect.id) continue

      // compose rectangle of another node
      let w = n.outerWidth()
      let h = n.outerHeight()
      let x = n.position().x
      let y = n.position().y
      let nPoint = {
        x1: parseInt(x - w / 2),
        x2: parseInt(x + w / 2),
        y1: parseInt(y - h / 2),
        y2: parseInt(y + h / 2)
      }

      // Check if the two node rectangles overlap
      if (rect.x1 < nPoint.x2 && rect.x2 > nPoint.x1 &&
        rect.y1 < nPoint.y2 && rect.y2 > nPoint.y1) return true
    }

    // nope, then it is not overlap
    return false
  }

  placement(node) {

    // deep copy node properties
    let nPos = {
      id: node.id(), 
      w: node.layoutDimensions().w, 
      h: node.layoutDimensions().h,
      x: node.position().x,
      y: node.position().y,
      margin: 10
    }
    
    // this is the pointer for check grid
    // initialize it at center grid
    let checkPos = {
      x: 0,
      y: 0,
      level: 0,
      direction: 'd'
    }

    // check initial overlap
    if (this.isOverlap(nPos, checkPos)) {

      // do the loop
      let loop = 0;
      do {

        // level up grid one level out 
        if (checkPos.x == checkPos.level && checkPos.y == 0) {
          checkPos.x++
          checkPos.level++
          if (!this.isOverlap(nPos, checkPos)) break
        }

        // continue next grid
        if (checkPos.direction == 'd') checkPos.y++
        if (checkPos.direction == 'l') checkPos.x--
        if (checkPos.direction == 'u') checkPos.y--
        if (checkPos.direction == 'r') checkPos.x++

        if (!this.isOverlap(nPos, checkPos)) break

        // should we change the direction next?
        if (checkPos.y == checkPos.level && checkPos.x == checkPos.level) checkPos.direction = 'l'
        if (checkPos.y == checkPos.level && checkPos.x == -checkPos.level) checkPos.direction = 'u'
        if (checkPos.y == -checkPos.level && checkPos.x == -checkPos.level) checkPos.direction = 'r'
        if (checkPos.y == -checkPos.level && checkPos.x == checkPos.level) checkPos.direction = 'd'
        loop++

      } while(loop < 100)

    }
    
    return { // the free space translated position
      x: nPos.x + (nPos.w + nPos.margin) * checkPos.x,
      y: nPos.y + (nPos.h + nPos.margin) * checkPos.y
    }
  }

  textColor(color) {
    let rgb = color.match(/\w\w/g).map(x=>+`0x${x}`)
    let l = (rgb[0]*0.299 + rgb[1]*0.587 + rgb[2]*0.114) / 256
    return (l > 0.5) ? '#000000' : '#ffffff'
  }
}

class UndoRedoTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {
      showLabel: false
    }, options)
    // stacks to store command
    /** 
     * command = {
     * undo: fn(canvas)
     * redo: fn(canvas)
    } */
    this.undoStack = []
    this.redoStack = []
    this.clearStacks()
  }

  control() {
    let labelUndo = "Undo"
    let labelRedo = "Redo"
    let hideLabel = this.settings.showLabel ? "" : " d-none"
    let controlHtml = 
      `<div class="btn-group ms-2">
        <button class="bt-undo btn btn-sm btn-outline-primary"
          data-tippy-content="<?php echo $this->l('kbui-undo-last-action'); ?>">
          <i class="bi bi-arrow-90deg-left"></i> <span class="bt-label${hideLabel}">${labelUndo}</span></button>
        <button class="bt-redo btn btn-sm btn-outline-primary"
          data-tippy-content="<?php echo $this->l('kbui-redo-last-action'); ?>">
          <i class="bi bi-arrow-90deg-right"></i> <span class="bt-label${hideLabel}">${labelRedo}</span></button>
      </div>`
    return controlHtml
  }

  handle() {
    this.updateStacksStateButton()
    this.handleEvent('click', '.bt-undo', (e) => { // console.log('Undo')
      let command = this.undoStack.length ? this.undoStack.pop() : null;
      if (command && command.undo) { console.warn(command)
        command.undo(this.canvas, command.undoData)
        this.redoStack.push(command)
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
      }
      this.updateStacksStateButton()
      this.broadcastEvent(`undo-${command.event}`, command.undoData)
    })
    this.handleEvent('click', '.bt-redo', (e) => { // console.log('Redo')
      let command = this.redoStack.length ? this.redoStack.pop() : null;
      if (command && command.redo) { console.warn(command)
        command.redo(this.canvas, command.redoData)
        this.undoStack.push(command)
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
      }
      this.updateStacksStateButton()
      this.broadcastEvent(`redo-${command.event}`, command.redoData)
    })
  }

  clearStacks() {
    this.undoStack = []
    this.redoStack = []
    return this
  }

  updateStacksStateButton() {
    this.toolbarElement('.bt-undo').prop('disabled', this.undoStack.length == 0)
    this.toolbarElement('.bt-redo').prop('disabled', this.redoStack.length == 0)
    return this
  }

  post(event, command) {
    /**
     * command: {
     *  event: String
     *  undoData: data
     *  redoData: data,
     *  undo: function
     *  redo: function
     * }
     */
    let cmd = Object.assign({
      event: event,
      undoData: null,
      redoData: null,
      undo: command.undo ? command.undo : () => {},
      redo: command.redo ? command.redo : () => {}
    }, command)
    if (typeof cmd.undo != 'function' || typeof cmd.redo != 'function' ) 
      return
    this.undoStack.push(cmd)
    this.redoStack = []
    this.updateStacksStateButton()
    return this
  }
}

class CameraTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {
      step: 0.3,
      padding: 50,
      duration: 200,
      maxZoom: 6
    }, options)
  }

  control() {
    let controlHtml = 
      `<div class="btn-group ms-2">
        <button class="btn btn-sm btn-outline-secondary" disabled>
          <i class="bi bi-camera-video"></i></button>
        <button class="bt-zoom-in btn btn-sm btn-outline-primary"
          data-tippy-content="">
          <i class="bi bi-zoom-in"></i></button>
        <button class="bt-zoom-out btn btn-sm btn-outline-primary"
          data-tippy-content="">
          <i class="bi bi-zoom-out"></i></button>
        <button class="bt-center-screen btn btn-sm btn-outline-primary"
          data-tippy-content="">
          <i class="bi bi-arrows-move"></i></button>
        <button class="bt-fit-screen btn btn-sm btn-outline-primary"
          data-tippy-content="">
          <i class="bi bi-arrows-fullscreen"></i></button>
        <button class="bt-reset btn btn-sm btn-outline-primary"
          data-tippy-content="">
          <i class="bi bi-arrow-counterclockwise"></i></button>
      </div>`
    return controlHtml
  }

  handle() {
    this.handleEvent('click', '.bt-zoom-in', (e) => this.zoom())
    this.handleEvent('click', '.bt-zoom-out', (e) => this.zoom(false))
    this.handleEvent('click', '.bt-fit-screen', (e) => this.fit())
    this.handleEvent('click', '.bt-center-screen', (e) => this.center())
    this.handleEvent('click', '.bt-reset', (e) => this.reset())
  }

  /* Viewport Camera Manipulation */

  zoom(zoomIn = true) {
    return new Promise((resolve) => {
      let zoom = this.canvas.cy.zoom();
      if ((zoom >= this.settings.maxZoom && zoomIn) || (zoom <= 0.3 && !zoomIn)) return;
      let bb = this.canvas.cy.nodes().boundingBox();
      let step = zoom <= 1 ? this.settings.step / 2 : this.settings.step * 2;
      let level = zoomIn ? zoom + step : zoom - step;
      level = ((level * 10) | 0) / 10; 
      if (level >= this.settings.maxZoom) level = this.settings.maxZoom;
      this.canvas.cy.animate({
        zoom: {
          level: level,
          position: {
            x: (bb.x1 + bb.x2) / 2,
            y: (bb.y1 + bb.y2) / 2
          }
        },
        duration: this.settings.duration,
        complete: () => resolve()
      });
      this.broadcastEvent(zoomIn ? 'camera-zoom-in' : 'camera-zoom-out', {level: level})
    })
  };

  fit(eles, options) {
    return new Promise((resolve) => {
      this.canvas.cy.animate(Object.assign({
        center: { eles: eles ? eles : this.canvas.cy.elements() },
        fit: {
          eles: eles ? eles : this.canvas.cy.elements(),
          padding: this.settings.padding
        },
        complete: () => resolve()
      }, options))
      this.broadcastEvent('camera-fit')
    })
  }

  center(eles, options) {
    return new Promise((resolve) => {
      this.canvas.cy.animate(Object.assign({ 
        center: eles ? eles : this.canvas.cy.elements(),
        duration: this.settings.duration,
        complete: () => resolve()
      }, options))
      this.broadcastEvent('camera-center')
    })
  }

  reset(eles, options) {
    return new Promise((resolve) => {
      this.canvas.cy.animate(Object.assign({ 
        center: eles ? eles : this.canvas.cy.elements(),
        zoom: 1.0,
        padding: this.settings.padding,
        duration: this.settings.duration,
        complete: () => resolve()
      }, options))
      this.broadcastEvent('camera-reset')
    });
  }

  panToNode(node, options) {
    return new Promise((resolve) => {
      this.cy.animate(Object.assign({
        center: { eles: node },
        duration: this.settings.duration,
        complete: () => resolve()
      }, options));
      this.broadcastEvent('camera-pan', node.json())
    })
  }

  async focusTo(nodeId) {
    // same: return this.panToNode(`#${nodeId}`, { duration: 200 }).then(() => {
    await this.panToNode(`#${nodeId}`, { duration: 200 });
    this.cy.nodes().unselect();
    this.cy.nodes(`#${nodeId}`).select();
    this.broadcastEvent('camera-focus', node.json());
  }

}

class UtilityTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.foundNodes = new Map();
    this.currentKeyword = null;
    this.settings = Object.assign(this.settings, {
      duration: 100,
      camera: true,
      trash: true,
      search: true
    }, options)
  }

  control() {
    let status = "No results"
    return `<div class="btn-group ms-2">
      <button class="btn btn-sm btn-outline-secondary" disabled>
        <i class="bi bi-tools"></i>
      </button>
      <button class="bt-search btn btn-sm btn-outline-primary" data-tippy-content="Search" data-bs-auto-close="outside" data-bs-toggle="dropdown">
        <i class="bi bi-search"></i>
      </button>
      <div class="dropdown-menu kb-search-toolbar p-2" tabindex="-1" role="dialog" aria-hidden="true" style="width: 450px">
        <div class="input-group input-group-sm d-flex align-items-center">
          <input type="text" class="form-control form-control-sm input-keyword" value="" placeholder="">
          <button class="bt-find btn btn-sm btn-primary"><i class="bi bi-search"></i></button>
          <btn class="search-status btn btn-sm btn-outline-secondary">${status}</btn>
          <button class="bt-next btn btn-sm btn-outline-secondary" disabled=""><i class="bi bi-chevron-down"></i></button>
          <button class="bt-prev btn btn-sm btn-outline-secondary" disabled=""><i class="bi bi-chevron-up"></i></button>
          <button class="bt-close btn btn-sm btn-outline-danger"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
      <button class="bt-screen-capture btn btn-sm btn-outline-primary" data-tippy-content="Save map as Image">
        <i class="bi bi-camera"></i>
      </button>
      <button class="bt-clear-canvas btn btn-sm btn-outline-primary" data-tippy-content="Clear Canvas">
        <i class="bi bi-trash"></i>
      </button>
    </div>`
  }

  postRender() {
    if (!this.settings.trash)  this.toolbarElement('.bt-clear-canvas').remove()
    if (!this.settings.camera) this.toolbarElement('.bt-screen-capture').remove()
    if (!this.settings.search) {
      this.toolbarElement('.bt-search').remove()
      this.toolbarElement('.kb-search-toolbar').remove()
    }
  }

  handle() {
    this.handleEvent('click', '.bt-search', () => {
      setTimeout(() => {
        this.toolbarElement('.input-keyword').focus().select()
        if(this.toolbarElement('.input-keyword').val().length) {
          this.toolbarElement('.input-keyword').trigger('keyup')
        } 
      }, 200)
    })

    this.handleEvent('keyup', '.input-keyword', (e) => {
      if (e.keyCode == 13) { // enter
        if(this.searchItemIndex == this.foundNodes.size - 1) {
          this.searchItemIndex = -1;
          this.toolbarElement('.kb-search-toolbar .bt-next').prop('disabled', false)
        }
        this.toolbarElement('.kb-search-toolbar .bt-next').trigger('click');
        return;
      }
      if (e.keyCode == 27) { // esc
        this.toolbarElement('.bt-close').trigger('click')
        return;
      }
      this.currentKeyword = $(e.target).val()
      this.search(this.currentKeyword)
    });

    this.handleEvent('click', '.bt-find', (e) => {
      let keyword = this.toolbarElement('.input-keyword').val();
      if (keyword == this.currentKeyword) {
        if(this.searchItemIndex == this.foundNodes.size - 1) {
          this.searchItemIndex = -1;
          this.toolbarElement('.kb-search-toolbar .bt-next').prop('disabled', false)
        }
        this.toolbarElement('.bt-next').trigger('click');
        return;
      }
      this.currentKeyword = keyword;
      this.search(keyword);
    });

    this.handleEvent('click', '.bt-close', (e) => {
      this.toolbarElement(".kb-search-toolbar").removeClass('show');
      this.toolbarElement(".bt-search").removeClass('show');
    });

    this.handleEvent('click', '.bt-next', (e) => {
      if (this.foundNodes.size > this.searchItemIndex + 1) {
        this.searchItemIndex++;
        let nextNode = this.foundNodes.get(this.searchItemIndex);
        nextNode.select();
        this.canvas.cy.animate({
          center: { eles: nextNode },
          duration: this.settings.duration
        });
        this.updateSearchToolbarUI();
        this.broadcastEvent("toolbar-next-search-item", {
          node: nextNode.json(), 
          index: this.searchItemIndex
        })
      }
    });

    this.handleEvent('click', '.bt-prev', (e) => {
      if (this.searchItemIndex > 0) {
        this.searchItemIndex--;
        let prevNode = this.foundNodes.get(this.searchItemIndex);
        prevNode.select();
        this.canvas.cy.animate({
          center: { eles: prevNode },
          duration: this.settings.duration
        });
        this.updateSearchToolbarUI()
        this.broadcastEvent("toolbar-prev-search-item", {
          node: prevNode.json(),
          index: this.searchItemIndex
        })
      }
    });

    this.handleEvent('click', '.bt-screen-capture', (e) => {
      let png64 = this.canvas.cy.png( { full: true, scale: 2 });
      this.showImageDialog(png64)
      this.broadcastEvent('screen-capture')
      e.stopPropagation()
    });

    this.handleEvent('click', '.bt-clear-canvas', (e) => {
      
      KitBuildUI.confirm('Do you want to clear the canvas?', this.canvas.canvasId, {
        icon: "exclamation-triangle-fill",
        iconColor: "danger",
        backdrop: 'static'
      }).then(result => {

        let elements = this.canvas.cy.elements().jsons() // for undo command
        this.canvas.cy.elements().remove()
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
        
        // broadcast for others
        this.broadcastEvent('clear-canvas', elements)
        
        // post undo-redo command
        this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO).post('clear-canvas', {
          redoData: elements,
          undoData: elements,
          undo: (canvas, data) => { 
            canvas.cy.add(data)
            canvas.applyElementStyle()
          },
          redo: (canvas, data) => { canvas.cy.elements().remove() }
        })

      })
      e.stopPropagation()
    });

  }

  updateSearchToolbarUI() {
    // console.log(this.searchItemIndex, this.foundNodes.size)
    this.toolbarElement('.kb-search-toolbar .bt-next').prop('disabled', !(this.foundNodes.size > 1 && this.searchItemIndex < this.foundNodes.size - 1));
    this.toolbarElement('.kb-search-toolbar .bt-prev').prop('disabled', this.searchItemIndex <= 0);
    if (this.foundNodes.size > 0) {
      let statusText = `Node: ${this.searchItemIndex + 1}/${this.foundNodes.size}`;
      this.updateSearchStatusText(statusText);
    } else this.updateSearchStatusText("No results");
  }

  search(keyword = "") {
    this.foundNodes.clear();
    if (keyword.trim().length == 0) {
      this.searchItemIndex = 0;
      this.updateSearchStatusText()
      this.updateSearchToolbarUI()
      return;
    }
    let nodes = this.canvas.cy.nodes();
    nodes.unselect();
    let idx = 0;
    for (let n of nodes) {
      if( n.data("label").trim().toLowerCase().indexOf(keyword.toLowerCase().trim()) != -1 ) {
        this.foundNodes.set(idx, n);
        n.select()
        idx++;
      }
    }
    this.updateSearchStatusText(`${this.foundNodes.size} nodes`)
    if (this.foundNodes.size > 0) {
      this.searchItemIndex = 0;
      let node = this.foundNodes.get(this.searchItemIndex);
      node.select();
      this.canvas.cy.animate({
        center: { eles: node },
        duration: this.settings.duration,
      });
    }
    this.updateSearchToolbarUI();
    let foundNodes = []
    Array.from(this.foundNodes.values()).forEach(n => foundNodes.push(n.json()))
    this.broadcastEvent("toolbar-search", {
      keyword: keyword,
      nodes: foundNodes
    })
  }

  updateSearchStatusText(text) {
    this.toolbarElement('.kb-search-toolbar .search-status').html(text ? text : 'No results')
  }


  /** 
   * Canvas Screenshot
   * */ 

  showImageDialog(png64) {
    
    let maxHeight = `calc(${$(`#${this.canvas.canvasId}`).height()}px - 4rem)` // console.log(maxHeight)
    let maxWidth = `calc(${$(`#${this.canvas.canvasId}`).width()}px - 16rem)` // console.log(maxHeight)
    let imageMaxWidth = `calc(${$(`#${this.canvas.canvasId}`).width()}px - 16rem - 6px)` // console.log(maxHeight)
    let dialogHtml = `<div class="card border-secondary kb-dialog kb-image-dialog shadow" style="max-width: ${maxWidth}; max-height: ${maxHeight}; position: absolute; top: 0; display: none">
      <div class="card-body text-center scroll-y">
        <span class="bg-checker d-flex align-items-center justify-content-center">
          <img class="canvas-export" style="max-width: ${imageMaxWidth};" src="${png64}">
        </span>
      </div>
      <div class="card-footer d-flex justify-content-end align-items-center">
        <span class="flex-fill text-secondary me-3 text-nowrap" style="overflow: hidden; text-overflow:ellipsis;">
          <input class="cb-transparent form-check-input" type="checkbox" checked> <small class="text-nowrap" style="">Transparent background</small>
        </span>
        <a class="bt-cancel btn btn-sm btn-secondary" style="min-width: 5rem">Cancel</a>
        <a class="bt-download btn btn-sm btn-primary text-nowrap ms-2" style="min-width: 5rem; text-overflow:ellipsis; overflow: hidden">
          <i class="bi bi-card-image"></i> Download Image
        </a>
      </div>
    </div>`

    $('.kb-dialog').hide().remove()
    $('body').append(dialogHtml)

    setTimeout(() => {
      // move to the last element of body 
      // so it will be shown on top of other elements
      $('.kb-image-dialog').appendTo('body').show({
        duration: 0,
        complete: () => {
          // handle click outside the dialog
          $(document).off('click').on('click', (e) => { 
            // console.log(e.target, $('.kb-image-dialog').find(e.target).length, $('.kb-image-dialog').is(':visible'))
            if ($('.kb-image-dialog').find(e.target).length) return
            if ($('.kb-image-dialog').is(':visible')) 
              $('.kb-image-dialog .bt-cancel').trigger('click')
          })
          $(document).off('keyup').on('keyup', function(e) {
            if (e.key == "Escape") $('.kb-image-dialog .bt-cancel').trigger('click');
          });
          $('.kb-image-dialog .bt-download').off('click').on('click', (e) => {
            console.log(e)
            var a = document.createElement("a");
            a.href = png64;
            a.download = 'concept-map.png';
            a.click();
            this.broadcastEvent('download-screen-capture')
          });
        }
      })
      let parent = $(`#${this.canvas.canvasId}`)
      let offset = $(parent).offset()
      let child = $('.kb-image-dialog')
      $('.kb-image-dialog').css({
        top:  (parent.height()/2 - child.height()/2) + offset.top, 
        left: (parent.width()/2 - child.width()/2) + offset.left
      })
    }, 100);

    $('.kb-image-dialog .cb-transparent').off('change').on('change', (e) => {
      let bg = $(e.target).prop('checked') ? 'transparent' : 'white'
      png64 = this.canvas.cy.png( { full: true, scale: 2, bg: bg });
      $('.kb-image-dialog img.canvas-export').attr('src', png64)
    })

    $('.kb-image-dialog .bt-cancel').off('click').on('click', (e) => { // console.log(e)
      $('.kb-image-dialog').hide()
      $(document).off('click').off('keyup')
    })

    $('.kb-image-dialog .bt-ok').off('click').on('click', () => {
      $('.kb-image-dialog .bt-cancel').trigger('click')
    })

  }


}

class CanvasStateTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {}, options)
  }

  control() {
    let controlHtml = 
      `<div class="btn-group ms-2">
        <button class="bt-save btn btn-sm btn-outline-primary"
          data-tippy-content="<?php echo $this->l('kbui-undo-last-action'); ?>">
          <i class="bi bi-download"></i></button>
        <button class="bt-load btn btn-sm btn-outline-primary"
          data-tippy-content="<?php echo $this->l('kbui-redo-last-action'); ?>">
          <i class="bi bi-upload"></i></button>
      </div>`
    return controlHtml
  }

  handle() {
    // this.updateStacksStateButton()
    this.handleEvent('click', '.bt-save', (e) => { // console.log('Undo')
      KitBuildUI.confirm('Save canvas data to local storage?').then(() => {
        let state = JSON.stringify({
          jsons: this.canvas.cy.elements().jsons(),
          direction: this.canvas.direction
        }) // console.log(state)
        localStorage.setItem("state", state)
      })
    })
    this.handleEvent('click', '.bt-load', (e) => { // console.log('Redo')
      let restore = () => {
        let state = localStorage.getItem("state") // console.log(state)
        this.canvas.cy.elements().remove()
        this.canvas.cy.add(JSON.parse(state).jsons)
        this.canvas.canvasTool.clearCanvas()
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit()
        this.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE)
        this.canvas.applyElementStyle()
          .setActiveDirection(JSON.parse(state).direction)
      }
      if(this.canvas.cy.elements().length)
        KitBuildUI.confirm('Restore data?').then(restore)
      else restore()
    })
  }

}

class ShareTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {}, options)
    this.shareDialogHtml = `<div class="card kb-share-dialog kb-dialog shadow" style="width: 500px; display:none">
      <h6 class="card-header"><i class="dialog-icon bi"></i> <span class="dialog-title">Copy</span></h6>
      <div class="card-body">
        <textarea class="form-control encoded-data" rows="5"></textarea>
      </div>
      <div class="card-footer text-end">
        <button class="btn btn-sm btn-secondary bt-cancel px-3">Cancel</button>
        <button class="btn btn-sm btn-secondary bt-paste px-3 ms-1"><i class="bi bi-clipboard"></i> Paste Clipboard</button>
        <button class="btn btn-sm btn-primary ms-1 bt-copy-paste px-3"><i class="dialog-icon bi"></i> <span class="dialog-action">Copy</span></button>
      </div>
    </div>`
  }

  control() {
    let copyText = "Copy"
    let pasteText = "Paste"
    let controlHtml = 
      `<div class="btn-group ms-2">
        <button class="bt-copy btn btn-sm btn-outline-primary" data-tippy-content="${copyText}">
          <i class="bi bi-files"></i></button>
        <button class="bt-paste btn btn-sm btn-outline-primary" data-tippy-content="${pasteText}">
          <i class="bi bi-clipboard"></i></button>
      </div>`
    return controlHtml
  }

  showDialog(type) { // console.log(type)
    $('.kb-dialog').hide().remove()
    setTimeout(() => { 
      // console.log(type)
      $(this.shareDialogHtml).appendTo('body').show({
        duration: 0,
        complete: () => {
          // handle click outside the dialog
          $(document).off('click').on('click', (e) => { 
            // console.log(e.target, $('.kb-share-dialog').find(e.target).length, $('.kb-share-dialog').is(':visible'))
            if ($('.kb-share-dialog').find(e.target).length) return
            if ($('.kb-share-dialog').is(':visible')) 
              $('.kb-share-dialog .bt-cancel').trigger('click')
          })
          $(document).off('keyup').on('keyup', function(e) {
            if (e.key == "Escape") $('.kb-share-dialog .bt-cancel').trigger('click');
          });

          let parent = $(`#${this.canvas.canvasId}`)
          let offset = $(parent).offset()
          let child = $('.kb-share-dialog')
          child.css({
            top:  (parent.height()/2 - child.height()/2) + offset.top, 
            left: (parent.width()/2 - child.width()/2) + offset.left
          })
          if (type == "copy") {
            let canvasData = KitBuildUI.buildConceptMapData(this.canvas);
            canvasData.direction = this.canvas.direction;
            $('.kb-share-dialog .encoded-data').val(Core.compress(canvasData)).select()
            $('.kb-share-dialog .bt-paste').addClass("d-none")
            $('.kb-share-dialog .bt-cancel').html("Close")
            $('.kb-share-dialog .dialog-title').html("Copy")
            $('.kb-share-dialog .dialog-action').html("Copy")
            $('.kb-share-dialog .dialog-icon').addClass("bi-files").removeClass("bi-clipboard")
          } else {
            $('.kb-share-dialog .encoded-data').val('').focus()
            $('.kb-share-dialog .bt-paste').removeClass("d-none")
            $('.kb-share-dialog .bt-cancel').html("Cancel")
            $('.kb-share-dialog .dialog-title').html("Paste")
            $('.kb-share-dialog .dialog-action').html("Apply")
            $('.kb-share-dialog .dialog-icon').addClass("bi-clipboard-check").removeClass("bi-files")
          }

          $('.kb-share-dialog .bt-paste').off('click').on('click', (e) => { // console.log(e)
            navigator.clipboard.readText().then(clipboard => { // console.log(clipboard)
              $('.kb-share-dialog .encoded-data').val(clipboard);
              this.broadcastEvent('paste-canvas-data', clipboard)
            })
          })

          $('.kb-share-dialog .bt-copy-paste').off('click').on('click', (e) => { // console.log(e)
            if (type == 'copy') {
              let encodedData = $('.kb-share-dialog .encoded-data').val().trim() // console.log(clipboard);
              navigator.clipboard.writeText(encodedData);
              $(e.currentTarget).html('<i class="bi bi-files"></i> Data has been copied to Clipboard!')
              setTimeout(() => {
                $(e.currentTarget).html('<i class="bi bi-files"></i> <span class="dialog-title">Copy</span>');
              }, 1500)
              this.broadcastEvent('copy-canvas-data', encodedData)
              e.preventDefault()
              e.stopPropagation()
            } else {
              try {
                let canvasData = Core.decompress($('.kb-share-dialog .encoded-data').val().trim())
                let cyData = KitBuildUI.composeConceptMap(canvasData)
                let proceed = () => { // console.log(cyData, canvasData)
                  this.canvas.reset().cy.add(cyData)
                  this.canvas.applyElementStyle()
                  this.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(canvasData.direction)
                  this.broadcastEvent('apply-canvas-data', cyData, { compress: true })
                  setTimeout(() => {
                    KitBuildUI.dialog("Concept map canvas data has been applied.", this.canvas.canvasId, {
                      icon: 'check-circle-fill',
                      iconColor: 'success'
                    })
                  }, 500)
                }
                if (this.canvas.cy.elements().length) {
                  KitBuildUI.confirm('Do you want to open and replace current concept map on canvas?').then(() => {            
                    proceed()
                  })
                } else proceed()
              } catch (error) { console.error(error)
                KitBuildUI.dialog("Concept map data is invalid.", this.canvas.canvasId, {
                  icon: 'exclamation-triangle-fill',
                  iconColor: 'danger'
                })
              }
            }
          })

          $('.kb-share-dialog .bt-cancel').off('click').on('click', (e) => { // console.log(e)
            $('.kb-share-dialog').hide()
            $(document).off('click').off('keyup')
          })
        }
      });
    }, 100)
  }

  handle() {
    this.handleEvent('click', '.bt-copy', (e) => { // console.log(e)
      this.showDialog('copy')
    })
    this.handleEvent('click', '.bt-paste', (e) => { // console.log(e)
      this.showDialog('paste')
    })
  }

}

class LayoutTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {}, options)
    this.shareDialogHtml = ``
  }

  control() {
    let copyText = "Copy"
    let pasteText = "Paste"
    let controlHtml = 
      `<div class="btn-group ms-2">
        <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
          <i class="bi bi-grid-1x2"></i>
        </button>
        <div class="dropdown-menu fs-small px-2">
          <div class="d-flex flex-column">
            <button class="btn btn-sm btn-primary bt-auto-layout">
              <i class="bi bi-magic"></i> Auto Layout
            </button>
            <hr class="my-2">
            <small class="text-center">Selection</small>
            <button class="btn btn-sm btn-secondary bt-layout-select-graph my-1">
              <i class="bi bi-bounding-box-circles"></i> Select Graph
            </button>
            <button class="btn btn-sm btn-secondary bt-layout-select-color my-1">
              <i class="bi bi-palette-fill"></i> Select Color
            </button>
            <button class="btn btn-sm btn-secondary bt-layout-select-free-nodes my-1">
              <i class="bi bi-grid"></i> Free Nodes
            </button>
            <button class="btn btn-sm btn-secondary bt-layout-select-free-concepts my-1">
              <i class="bi bi-grid"></i> Free Concepts
            </button>
            <button class="btn btn-sm btn-secondary bt-layout-select-free-links my-1">
              <i class="bi bi-grid"></i> Free Links
            </button>
            <hr class="my-2">
            <small class="text-center">with Selection</small>
            <button class="btn btn-sm btn-success bt-layout-selection mt-1">
              <i class="bi bi-grid-1x2-fill"></i> Layout
            </button>
          </div>
        </div>
      </div>`
    return controlHtml
  }

  handle() {
    this.handleEvent('click', '.bt-auto-layout', (e) => {
      this.layoutElements(this.canvas.cy.nodes())
    })
    this.handleEvent('click', '.bt-layout-select-graph', (e) => {
      var selectedNode = this.canvas.cy.nodes(':selected');
      if (selectedNode.length == 0) {
        KitBuildUI.dialog("Please select one node from the graph to select the entire graph.", this.canvas.canvasId)
        return
      }
      this.selectGraphOfNode(selectedNode)
    })
    this.handleEvent('click', '.bt-layout-select-color', (e) => {
      var selectedNode = this.canvas.cy.nodes(':selected');
      if (selectedNode.length == 0) {
        KitBuildUI.dialog("Please select one node from the graph to select the nodes of the same color.", this.canvas.canvasId)
        return
      }
      let color = selectedNode[0].data('background-color')
      this.canvas.cy.nodes(`[background-color="${color}"]`).select().trigger('select')
      console.log(color)
    })
    this.handleEvent('click', '.bt-layout-select-free-concepts', (e) => {
      this.canvas.cy.elements('[type="concept"][[degree=0]]').select().trigger('select')
    })
    this.handleEvent('click', '.bt-layout-select-free-links', (e) => {
      this.canvas.cy.elements('[type="link"][[degree=0]]').select().trigger('select')
    })
    this.handleEvent('click', '.bt-layout-select-free-nodes', (e) => {
      this.canvas.cy.nodes('[[degree=0]]').select().trigger('select')
    })
    this.handleEvent('click', '.bt-layout-selection', (e) => {
      if (this.canvas.cy.nodes(':selected').length == 0) {
        KitBuildUI.dialog("Please select one or more nodes to layout.", this.canvas.canvasId)
        return
      }
      try {
        this.layoutElements(this.canvas.cy.nodes(':selected'))
      } catch(error) {
        console.error(error);
        try {
          this.selectGraphOfNode(this.canvas.cy.nodes(':selected')[0])
          this.layoutElements(this.canvas.cy.nodes(':selected'))
        } catch(error) {
          console.error(error);
          KitBuildUI.dialog("Unable to layout: Graph or selection error.", this.canvas.canvasId)
        }
      }
    })
  }
  layoutElements(nodes) {

    let doLayout = (eles) => {
      let prebb = Object.assign({}, eles.boundingBox())
      let nodes = eles.filter('node')
      let prior = []
      nodes.forEach(n => {
        prior.push({ id: n.id(), position: Object.assign({}, n.position()) })
      })
      eles.layout({
        name: 'fcose',
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        fit: false,
        tile: true,
        packComponents: true,
        animationDuration: 0,
        ready: () => this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
        stop: () => {
          // shift to previous center position
          let bb = nodes.boundingBox()
          let centerGraph = {x: (bb.x2 + bb.x1)/2, y: (bb.y2 + bb.y1)/2 }
          let centerPre = { x: (prebb.x2 + prebb.x1)/2, y: (prebb.y2 + prebb.y1)/2 }
          let shift = { x: centerGraph.x - centerPre.x, y: centerGraph.y - centerPre.y }
          let later = []
          nodes.forEach(n => {
            let pos = { x: n.position().x - shift.x, y: n.position().y - shift.y }
            later.push({ id: n.id(), position: pos })
            n.position(pos)
          })
          let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO)
          if (undoRedo) undoRedo
            .post('layout-elements', {
              undoData: prior,
              redoData: later,
              undo: (canvas, data) => {
                data.forEach(n => canvas.cy.nodes(`#${n.id}`).position(n.position))
              },
              redo: (canvas, data) => {
                data.forEach(n => canvas.cy.nodes(`#${n.id}`).position(n.position))
              }
            })
          this.broadcastEvent('layout-elements', { prior: prior, later: later })
          this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
        },
      }).run()
    }

    if (nodes.length == 1) this.selectGraphOfNode(nodes[0]).then(eles => doLayout(eles))
    else doLayout(nodes.add(nodes.connectedEdges()))

    
  }
  selectGraphOfNode(root) {
    return new Promise((resolve, reject) => {
      var visitedArr = [];
      this.canvas.cy.elements().bfs({ // or dfs
        roots: root,
        visit: (v, e, u, i, depth) => { visitedArr.push(v) },
        directed: false // or your preference
      });
      let nodes = this.canvas.cy.collection( visitedArr )
      nodes.select().trigger('select')
      resolve(nodes.add(nodes.connectedEdges()))
    })
  }
}

class CompareSwitchTool extends KitBuildToolbarTool {
  constructor(canvas, options) {
    super(canvas, options)
    this.settings = Object.assign(this.settings, {
      showLabel: false,
      stack: 'left'
    }, options)
  }

  control() {
    let controlHtml = 
      `<div class="btn-group btn-group-sm">
        <button id="bt-dd-compare-switches" class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
          <i class="bi bi-toggles"></i>
        </button>
        <div id="dd-menu-compare-switches" class="dropdown-menu p-2" style="min-width:0">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="switch-match" checked>
            <label class="form-check-label" for="switch-match"><span class="badge rounded-pill bg-success text-truncate" style="width: 4rem">Match</span></label>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="switch-miss" checked>
            <label class="form-check-label" for="switch-miss"><span class="badge rounded-pill bg-danger text-truncate" style="width: 4rem">Miss</span></label>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="switch-excess" checked>
            <label class="form-check-label" for="switch-excess"><span class="badge rounded-pill bg-info text-dark text-truncate" style="width: 4rem">Excess</span></label>
          </div>
        </div>
      </div>`
    return controlHtml
  }

  handle() {
    $('#dd-menu-compare-switches input[type="checkbox"]').on('change', e => {
      this.apply()
    })
  }

  apply() {
    let match  = $('#switch-match').prop('checked')
    let miss   = $('#switch-miss').prop('checked')
    let excess = $('#switch-excess').prop('checked')
    if (match) this.canvas.cy.edges('.match').removeClass('hide')
    else this.canvas.cy.edges('.match').addClass('hide')
    if (miss) this.canvas.cy.edges('.miss').removeClass('hide')
    else this.canvas.cy.edges('.miss').addClass('hide')
    if (excess) this.canvas.cy.edges('.excess').removeClass('hide')
    else this.canvas.cy.edges('.excess').addClass('hide')
  }

  postRender() {
    $('#bt-dd-compare-switches').trigger('click')
  }

}
























class KitBuildToolbar {
  constructor(canvas, options) {

    KitBuildToolbar.NODE_CREATE = "node-create"
    KitBuildToolbar.UNDO_REDO   = "undo-redo"
    KitBuildToolbar.CAMERA      = "camera"
    KitBuildToolbar.UTILITY     = "utility"
    KitBuildToolbar.STATE       = "state"
    KitBuildToolbar.SHARE       = "share"
    KitBuildToolbar.LAYOUT      = "layout"
    KitBuildToolbar.COMPARE     = "compare"

    this.canvas = canvas
    this.settings = Object.assign({}, options)
    this.tools = new Map()
    this.eventListeners = new Map();
    this.evtListeners = new Set();
  }

  static instance(canvas, options) {
    return new KitBuildToolbar(canvas, options)
  }

  addTool(id, tool) {
    this.tools.set(id, tool)
    if (typeof tool.attachEventListener == 'function')
      tool.attachEventListener("toolbar", this)
    this.broadcastEvent('add-tool', id)  
  }

  removeTool(id) {
    this.tools.delete(id)
    if (typeof tool.detachEventListener == 'function') 
      tool.detachEventListener("toolbar")
    this.broadcastEvent('remove-tool', id)
  }

  hideTool(id) {
    $(`#${this.canvas.canvasId}-${id}`).hide()
    this.broadcastEvent('hide-tool', id)
  }

  showTool(id) {
    $(`#${this.canvas.canvasId}-${id}`).show()
    this.broadcastEvent('show-tool', id)
  }

  render() { // render tools' controls on toolbar
    let centerStack = ''
    let leftStack = ''
    let rightStack = ''
    // sort according to its priority value
    let tools = new Map([...this.tools.entries()].sort((a, b) => 
      a[1].settings.priority - b[1].settings.priority
    ))
    tools.forEach((t, k, map) => {
      let toolControls = ''
      toolControls += `<span id="${this.canvas.canvasId}-${k}">`
      toolControls += t.control()
      toolControls += `</span>`
      if (t.settings.stack == "center") centerStack += toolControls
      if (t.settings.stack == "left") leftStack     += toolControls
      if (t.settings.stack == "right") rightStack   += toolControls
    })
    // console.log(centerStack, leftStack, rightStack)
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find('.center-stack').html(centerStack);
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find('.left-stack').html(leftStack);
    $(`#${this.canvas.canvasId}`).siblings('.kb-toolbar').find('.right-stack').html(rightStack);
    UI.broadcast("toolbar-render", this)
    tools.forEach((v, k, map) => v.postRender())
    this.broadcastEvent('render', Array.from(this.tools.keys()))
    // register all tools' event handlers
    this.tools.forEach((v, k, map) => { if (v.handle) v.handle() })
    this.broadcastEvent('handle', Array.from(this.tools.keys()))
  }

  attachEventListener(id, listener) {
    // also forward-attach the listeners to tools
    this.tools.forEach((v, k, map) => {
      if (typeof v.attachEventListener == 'function')
        v.attachEventListener(id, listener)
    })
    return this.eventListeners.set(id, listener)
  }

  detachEventListener(id) {
    this.tools.forEach((v, k, map) => {
      if (typeof v.detachEventListener == 'function')
        v.detachEventListener(id)
    })
    return this.eventListeners.delete(id)
  }

  broadcastEvent(evt, data, options) { // console.warn(evt, data)
    this.eventListeners.forEach((l, k, map) => {
      if (typeof l.onToolbarEvent == 'function')
        l.onToolbarEvent(this.canvas.canvasId, evt, data, options)
    })
    this.evtListeners.forEach(listener => listener(this.canvas.canvasId, evt, data, options))
  }

  on(what, listener) {
    switch(what) {
      case 'event':
        if (typeof listener == 'function') {
          this.evtListeners.add(listener)
          this.tools.forEach(tool => tool.on('event', listener))
        }
        break;
    }
  }

  off(what, listener) {
    switch(what) {
      case 'event':
        this.evtListeners.delete(listener)
        this.tools.forEach(tool => tool.off('event', listener))
        break;
    }
  }

  /** 
   * Event listener handlers
   * */ 

  onToolbarToolEvent(canvasId, evt, data, options) {
    // currently do nothing related to this toolbar
    // when anything happens to toolbar tool
  }


}
