class KitBuildCanvas {

  constructor(canvasId, options) {
    this.canvasId = canvasId
    this.settings = Object.assign({
      defaultColor: "#000000",
      defaultConceptColor: "#FFBF40",
      directed: true,
    }, options)

    this.direction = KitBuildCanvas.MULTIDIRECTIONAL

    // Cache for concept and link ID
    this._lastConceptId = 0;
    this._lastLinkId = 0;

    this.toolbar = KitBuildToolbar.instance(this, this.settings)
    
    // start CytoscapeJS canvas
    this.cy = cytoscape({
      container: document.getElementById(this.canvasId),
      style: KitBuildCanvas.style,
      elements: [], // (this.settings.useDummy ? this._dummyElements : []),
      minZoom: 0.1,
      maxZoom: 6,
      layout: 'fcose'
    });

    // start canvas overlay tool
    this.canvasTool = KitBuildCanvasToolCanvas.instance(this, this.settings)

    // listen to onToolbarToolEvent(evt, data)
    // listen to onToolbarEvent(evt, data)
    this.toolbar.attachEventListener("canvas", this)

    // listen to onCanvasToolEvent(evt, data)
    this.canvasTool.attachEventListener("canvas", this)

    // listeners for this canvas' events
    this.eventListeners = new Map()
    this.evtListeners = new Set()
    
  }

  // Singleton instantiator for each Canvas object
  static instance(canvasId, options) {
    return new KitBuildCanvas(canvasId, options)
  }

  attachEventListener(id, listener) {
    this.toolbar.attachEventListener(id, listener)
    this.canvasTool.attachEventListener(id, listener)
    this.eventListeners.set(id, listener)
  }

  detachEventListener(id) {
    this.toolbar.detachEventListener(id)
    this.canvasTool.detachEventListener(id)
    this.eventListeners.delete(id)
  }

  broadcastEvent(event, data) { // console.warn(event, data)
    this.eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasEvent == 'function')
        listener.onCanvasEvent(this.canvasId, event, data)
    })
    this.evtListeners.forEach(listener => listener(this.canvasId, event, data))
  }

  on(what, listener) {
    switch(what) {
      case 'event':
        if (typeof listener == 'function') {
          this.evtListeners.add(listener)
          this.toolbar.on(what, listener)
          this.canvasTool.on(what, listener)
        }
        break;
    }
    return this;
  }

  off(what, listener) {
    switch(what) {
      case 'event':
        this.evtListeners.delete(listener)
        this.toolbar.off(what, listener)
        this.canvasTool.off(what, listener)
        break;
    }
    return this;
  }

  addToolbarTool(what, options) {
    let settings = Object.assign({}, this.settings, options)
    switch(what) {
      case KitBuildToolbar.STATE:
        this.toolbar.addTool(what, new CanvasStateTool(this, settings))
        break;
      case KitBuildToolbar.NODE_CREATE:
        this.toolbar.addTool(what, new NodeCreationTool(this, settings))
        break;
      case KitBuildToolbar.UNDO_REDO:
        this.toolbar.addTool(what, new UndoRedoTool(this, settings))
        break;
      case KitBuildToolbar.CAMERA:
        this.toolbar.addTool(what, new CameraTool(this, settings))
        break;
      case KitBuildToolbar.UTILITY:
        this.toolbar.addTool(what, new UtilityTool(this, settings))
        break;
      case KitBuildToolbar.SHARE:
        this.toolbar.addTool(what, new ShareTool(this, settings))
        break;
      case KitBuildToolbar.LAYOUT:
        this.toolbar.addTool(what, new LayoutTool(this, settings))
        break;
      case KitBuildToolbar.COMPARE:
        this.toolbar.addTool(what, new CompareSwitchTool(this, settings))
        break;
    }
    return this;
  }

  addCanvasTool(what, options) {
    let settings = Object.assign({}, this.settings, options)
    switch(what) {
      case KitBuildCanvasTool.DELETE:
        this.canvasTool.addTool(what, new KitBuildDeleteTool(this), 
          Object.assign({ gridPos: {x: 1, y: -1} }, settings))
        break;
      case KitBuildCanvasTool.DUPLICATE:
        this.canvasTool.addTool(what, new KitBuildDuplicateTool(this), 
          Object.assign({ gridPos: {x: 1, y: 1} }, settings))
        break;
      case KitBuildCanvasTool.EDIT:
        this.canvasTool.addTool(what, new KitBuildEditTool(this), 
          Object.assign({ gridPos: {x: -1, y: -1} }, settings))
        break;
      case KitBuildCanvasTool.SWITCH:
        this.canvasTool.addTool(what, new KitBuildSwitchTool(this), 
          Object.assign({ gridPos: {x: -1, y: 1} }, settings))
        break;
      case KitBuildCanvasTool.DISCONNECT:
        this.canvasTool.addTool(what, new KitBuildDisconnectTool(this, settings))
        break;
      case KitBuildCanvasTool.CENTROID:
        this.canvasTool.addTool(what, new KitBuildCentroidTool(this), 
          Object.assign({ gridPos: {x: 0, y: 1} }, settings))
        break;
      case KitBuildCanvasTool.CREATE_CONCEPT:
        this.canvasTool.addTool(what, new KitBuildCreateConceptTool(this, settings))
        break;  
      case KitBuildCanvasTool.CREATE_LINK:
        this.canvasTool.addTool(what, new KitBuildCreateLinkTool(this, settings))
        break;
      case KitBuildCanvasTool.FOCUS:
        this.canvasTool.addTool(what, new KitBuildFocusTool(this, settings))
        break;
      case KitBuildCanvasTool.LOCK:
        this.canvasTool.addTool(what, new KitBuildLockTool(this, settings))
        break;
      case KitBuildCanvasTool.UNLOCK:
        this.canvasTool.addTool(what, new KitBuildUnlockTool(this, settings))
        break;        
    }
    return this;
  }

  addCanvasMultiTool(what, options) {
    let settings = Object.assign({}, this.settings, options)
    switch(what) {
      case KitBuildCanvasTool.DELETE:
        this.canvasTool.addMultiTool(what, new KitBuildDeleteTool(this, settings))
        break;
      case KitBuildCanvasTool.DUPLICATE:
        this.canvasTool.addMultiTool(what, new KitBuildDuplicateTool(this, settings))
        break;
      case KitBuildCanvasTool.LOCK:
        this.canvasTool.addMultiTool(what, new KitBuildLockTool(this, settings))
        break;
      case KitBuildCanvasTool.UNLOCK:
        this.canvasTool.addMultiTool(what, new KitBuildUnlockTool(this, settings))
        break;
    }
    return this;
  }

  start() {
    
  }

  setOptions(options) {
    this.settings = Object.assign(this.settings, options)
    return this
  }

  reset() {
    this.cy.elements().remove()
    this.canvasTool.clearCanvas().clearIndicatorCanvas()
    this._lastConceptId = 0;
    this._lastLinkId = 0;
    return this
  }

  // Get next available concept ID
  getNextConceptId() {
    let concepts = this.cy.nodes('[type="concept"]');
    let n = 0;
    for (let i = 0; i < concepts.length; i++) {
      let num = parseInt(concepts[i].id().substring(1));
      if (num > n) n = num;
    }
    this._lastConceptId = n;
    return ++this._lastConceptId;
  }

  // Get next available link ID
  getNextLinkId() {
    let links = this.cy.nodes('[type="link"]');
    let n = 0;
    for (let i = 0; i < links.length; i++) {
      let num = parseInt(links[i].id().substring(1));
      if (num > n) n = num;
    }
    this._lastLinkId = n;
    return ++this._lastLinkId;
  }

  createNode(nodeData, options) {
    
    return new Promise((resolve) => {
      /* nodeData format:
      {
        type: 'concept'|'link',
        label: 'Node label',
        color: '#hex' // optional
        position: { // optional
          x: x,
          y: y,
        }
      }
      */

      // compose the node JSON for Cytoscape canas
      let nodeDefinition = this.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).composeNode(nodeData)

      console.log(nodeDefinition)

      // add the node at the center of canvas
      let node = this.cy.add(nodeDefinition);
      this.applyElementStyle()

      // let the system place the position
      // so that it does not overlap and resolve it to the caller
      this.cy.elements(':selected').unselect()
      node.position(this.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).placement(node))
        .select().trigger('select')

      // post undo-redo command
      let nodeJson = node.json()
      let undoRedo = this.toolbar.tools.get(KitBuildToolbar.UNDO_REDO) 
      if (undoRedo) 
        undoRedo.post('create-node', {
          undoData: `#${nodeJson.data.id}`,
          redoData: nodeJson,
          undo: () => this.cy.remove(`#${nodeJson.data.id}`),
          redo: () => this.cy.add(nodeJson)
      })
      this.broadcastEvent(`create-${node.data('type')}`, nodeJson)
      this.canvasTool.clearCanvas().clearIndicatorCanvas()
      resolve(node);
    });
    
  }

  updateNode(nodeData, options) {
    
    return new Promise((resolve) => {
      /* nodeData format:
      {
        id: id
        label: 'Node label'
      }
      */

      let updateData = {
        id: nodeData.id,
        prior: this.cy.nodes(`#${nodeData.id}`).json(),
        later: {}
      }

      let dim = this.toolbar.tools.get(KitBuildToolbar.NODE_CREATE)
        .calculateDimension(nodeData) // console.log(nodeData)
      let node = this.cy.nodes(`#${nodeData.id}`).data({
        'label': nodeData.label,
        'width': dim.w | 0,
        'height': dim.h | 0
      })

      updateData.later = node.json()
      let undoRedo = this.toolbar.tools.get(KitBuildToolbar.UNDO_REDO) 
      if (undoRedo) 
        undoRedo.post(`update-${node.data('type')}`, {
        undoData: updateData,
        redoData: updateData,
        undo: (canvas, data) => 
          canvas.cy.nodes(`#${data.id}`).data({
            'label': data.prior.data.label,
            'width': data.prior.data.width | 0,
            'height': data.prior.data.height | 0
          }),
        redo: (canvas, data) =>
          canvas.cy.nodes(`#${data.id}`).data({ 
            'label': data.later.data.label,
            'width': data.later.data.width | 0,
            'height': data.later.data.height | 0
          }),
      })
      this.broadcastEvent(`update-${node.data('type')}`, updateData)
      this.canvasTool.clearCanvas().clearIndicatorCanvas()
      resolve(node)
    });
    
  }

  layout(options, lib = 'fcose') { console.log('layout')
    let settings = Object.assign({
      name: 'fcose',
      tile: false,
      eles: this.cy.nodes(),
      nodeDimensionsIncludeLabels: true,
      fit: false,
      stop: null
    }, options)
    this.cy.layout(settings).run()
  }

  applyElementStyle() {
    this.cy.nodes('[background-color]').forEach(n => n.css('background-color', n.data('background-color')))
    this.cy.nodes('[color]').forEach(n => n.css('color', n.data('color')))
    if (this.direction == KitBuildCanvas.BIDIRECTIONAL)
      this.cy.edges().addClass('bi')
    return this;
  }

  static getCentroidPosition(concepts) {
    let sX = 0, sY = 0
    concepts.toArray().map(c => {
      sX += c.position().x
      sY += c.position().y
    })
    return {
      x: sX/concepts.length,
      y: sY/concepts.length
    }
  }

  static centroidizeLinkPosition(link) {
    return new Promise((resolve, reject) => {
      let concepts = link.neighborhood('[type="concept"]')
      link.animate({
        position: KitBuildCanvas.getCentroidPosition(concepts),
        duration: 300,
        complete: () => { resolve(link) }
      })
    })
  }




  // Commands
  moveNode(id, x, y, duration) {
    this.cy.elements(`#${id}`).animate({
      position: { x: x, y: y },
      duration: duration,
      complete: () => {
        this.canvasTool.clearIndicatorCanvas()
        if (this.cy.elements(`#${id}`).selected())
          this.cy.elements(`#${id}`).trigger('select')
      }
    })
  }
  createEdge(data) { // data: {edgeData}
    this.cy.add({ group: "edges", data: data })

    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('id') == data.source) {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
  }
  removeEdge(source, target) { // source,target: id 
    this.cy.edges(`[source="${source}"][target="${target}"]`).remove()

    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('id') == source) {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
  }
  moveEdge(prior, later) { // prior,later: {data: {}}, 
    this.cy.edges(`[source="${prior.data.source}"][target="${prior.data.target}"]`).remove()
    this.cy.add({ group: "edges", data: later.data })

    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('id') == prior.data.source) {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
  }
  switchDirection(priors, laters) {
    if (!Array.isArray(priors)) return;
    if (!Array.isArray(laters)) return;
    priors.forEach(prior => 
      this.cy.edges(`[source="${prior.data.source}"][target="${prior.data.target}"]`).remove())
    laters.forEach(later => 
      this.cy.add({ group: "edges", data: later.data }))
    
    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('id') == prior.data.source) {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
  }
  addNode(data, position) { // data: { nodeData }, position: {x, y}
    this.cy.add({ group: "nodes", data: data, position: position }).unselect()
    this.canvasTool.clearIndicatorCanvas()
    this.applyElementStyle()
  }
  addElements(elements) { // [ elementsCyData ]
    if (!Array.isArray(elements)) return;
    elements.forEach(element => this.cy.add(element).unselect())
    
    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('type') == 'link') {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
    this.applyElementStyle()
  }
  removeElements(elements) { // [ elementData ]
    if (!Array.isArray(elements)) return;
    elements.forEach(element => {
      if (['left', 'right'].includes(element.type)) {
        this.cy.edges(`[source="${element.source}"][target="${element.target}"]`).remove()
      }
      if (['concept', 'link'].includes(element.type)) {
        this.cy.nodes(`[id="${element.id}"]`).remove()
      }
    })
    
    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('type') == 'link') {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
    this.applyElementStyle()
  }
  updateNodeData(id, data) {
    this.cy.nodes(`#${id}`).data(data);
    this.applyElementStyle()
  }
  updateEdgeData(id, data) {
    let edge = this.cy.edges(`#${id}`).data(data);
    // restore selection of related link
    if (this.canvasTool.activeNode && this.canvasTool.activeNode.data('id') == edge.data('source')) {
      let node = this.cy.nodes(`[id="${this.canvasTool.activeNode.data('id')}"]`)
      if (!node.length) this.canvasTool.clearCanvas()
      else node.trigger('select')
    }
    this.canvasTool.clearIndicatorCanvas()
  }
  changeNodesColor(nodesData) { // nodesData: [ id, color, bgColor ]
    if (!Array.isArray(nodesData)) return;
    nodesData.forEach(node => {
      this.cy.nodes(`#${node.id}`).data('color', node.color).css('color', node.color);
      this.cy.nodes(`#${node.id}`).data('background-color', node.bgColor).css('background-color', node.bgColor);
    })
  }
  convertType(type, elements) {
    if (!Array.isArray(elements)) return;
    this.cy.elements('[type="link"],[type="left"],[type="right"]').remove()
    elements.forEach(element => {
      if (['link'].includes(element.data.type)) this.cy.add(element)
    })
    elements.forEach(element => {
      if (['left', 'right'].includes(element.data.type)) {
        let edge = this.cy.add(element)
        if (type == KitBuildCanvas.BIDIRECTIONAL) edge.addClass('bi')
        else edge.removeClass('bi')
      }
    })
    this.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(type)
    this.canvasTool.clearIndicatorCanvas()
  }
  

}

KitBuildCanvas.BIDIRECTIONAL = 'bi'
KitBuildCanvas.UNIDIRECTIONAL = 'uni'
KitBuildCanvas.MULTIDIRECTIONAL = 'multi'

class KitBuildUIDialog {
  constructor(content, canvasId, options) {
    this.settings = Object.assign({
      okLabel: 'OK',
      cancelLabel: 'Cancel',
      canvas: canvasId ? canvasId : KitBuildUI.canvas().canvasId,
      backdrop: true,
      icon: 'info-circle-fill',
      iconColor: 'info'
    }, options)
    this.positive = null
    this.promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        let cardClass = this.positive
          ? `justify-content-end`
          : `justify-content-center`;
        let cancelButton = this.positive
          ? `<a class="bt-cancel btn btn-sm btn-secondary" style="min-width: 5rem">${this.settings.cancelLabel}</a>`
          : ``;
        let dialogIcon = `<span class="me-4"><i class="bi bi-${this.settings.icon} display-4 text-${this.settings.iconColor}"></i></span>`
        let backdrop = `<div class="kb-dialog-backdrop w-100 h-100 position-fixed top-0 start-0" style="background-color:#00000088"></div>`
        let dialogHtml = `<div class="card border-secondary kb-dialog shadow" style="min-width: 15rem; max-width: 52rem; position: absolute; top: 0; display: none">
          <div class="card-body text-center scroll-y px-5 py-4 d-flex align-items-center">${dialogIcon} <span class="text-start">${content}</span></div>
          <div class="card-footer d-flex ${cardClass} align-items-center">
            ${cancelButton}
            <a class="bt-ok btn btn-sm btn-primary mx-2" style="min-width: 5rem">${this.settings.okLabel}</a>
          </div>
        </div>`
        $('.kb-dialog').hide().remove()
        $('.kb-dialog-backdrop').hide().remove()
        if (this.settings.backdrop) {
          $('body').append(backdrop)
          $('.kb-dialog-backdrop').append(dialogHtml)
        } else $('body').append(dialogHtml)
        
        $('.kb-dialog-backdrop').on('click', (e) => {
          if ($.contains(e.currentTarget, e.target)) return
          if (this.settings.backdrop != 'static') {
            this.close()
            reject(e)
          } else {
            $('.kb-dialog').addClass('animate__animated animate__headShake animate__fast')
            $('.kb-dialog').one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", (e) => {
              $(e.target).removeClass('animate__animated animate__headShake')
            });
          }
        })
        $('.kb-dialog').show({
          duration: 0,
          complete: () => { // console.log(settings)
            let parent = $(`#${this.settings.canvas}`)
            let offset = $(parent).offset()
            let child = $('.kb-dialog')
            $('.kb-dialog').css({
              top:  (parent.height()/2 - child.height()/2) + offset.top, 
              left: (parent.width()/2 - child.width()/2) + offset.left
            })
            child.on('click', '.bt-ok', (e) => {
              if (this.positive) resolve(e)
              else this.negative()
              this.close()
            })
            child.on('click', '.bt-cancel', (e) => {
              e.stopImmediatePropagation() // prevent shake
              reject(e)
            })
          }
        })
      }, 50);
    })
  }

  negative() {
    this.close()
  }

  then(callback, reject = null) {
    this.positive = callback
    this.promise.then(callback, reject ? reject : this.negative.bind(this))
    return this
  }
  
  catch(callback) { 
    this.promise.catch(callback)
    return this
  }

  close() { //console.log(this.settings, this)
    $('.kb-dialog').fadeOut({
      duration: 100,
      complete: () => {
        $('.kb-dialog-backdrop').fadeOut({
          duration: 100,
          complete: () => $('.kb-dialog-backdrop').remove()
        })
      }
    })
  }
}

class KitBuildUI {
  constructor(canvasId, options) {
    this.canvases = new Map()
    if (canvasId)
      this.canvases.set(canvasId, KitBuildCanvas.instance(canvasId, options));
    UI.addListener((evt, data) => { // console.error("UI EVENT", evt, data)
      switch(evt) {
        case "window-resize":
        case "sidebar-toggle":
        case "toolbar-render":
          this.canvases.forEach(canvas => {
            // console.error(evt, canvas.cy)
            $(`#${canvasId} > div`).css('height', 0).css('width', 0)
            setTimeout(() => {
              $(`#${canvasId} > div`)
                .css('height', $(`#${canvasId}`).height() | 0)
                .css('width', $(`#${canvasId}`).width() | 0)
            }, 5) 
            // canvas.cy.resize()
            // canvas.cy.forceRender()
          })
          break;
      }
    })    
    // lifecycle.addEventListener('statechange', (event) => {
    //   console.log(event.oldState, event.newState, event.originalEvent, Date.now(), this.canvases);
    // });
  }
  static addLifeCycleListener(listener) {
    if (!lifecycle) {
      console.error("Lifecycle library is not defined.")
      return
    }
    lifecycle.addEventListener('statechange', listener)
  }
  static instance(canvasId, options) {
    if (KitBuildUI.inst) {
      if (!KitBuildUI.inst.canvases.has(canvasId)) 
        KitBuildUI.inst.canvases.set(canvasId, KitBuildCanvas.instance(canvasId, options))
      return KitBuildUI.inst
    } KitBuildUI.inst = new KitBuildUI(canvasId, options)
    return KitBuildUI.inst
  }
  static canvas(canvasId) {
    if (!canvasId && KitBuildUI.inst && KitBuildUI.inst.canvases.size)
      return KitBuildUI.inst.canvases.values().next().value
    return KitBuildUI.inst ? KitBuildUI.inst.canvases.get(canvasId) : null
  }
  static dialog(content = '', canvasId, options) {
    let kitBuildDialog = new KitBuildUIDialog(content, canvasId, options)
    return kitBuildDialog
  }
  static confirm(question, canvasId, options) {
    return KitBuildUI.dialog(question, canvasId, Object.assign({
      okLabel: 'Yes',
      cancelLabel: 'No',
      backdrop: true,
      icon: "question-diamond-fill",
      iconColor: "warning"
    }, options))
  }
  static buildConceptMapData(canvas) {

    if (!canvas) return null;

    let concepts = [], links = [], linktargets = [];
    canvas.cy.nodes('[type="concept"]').forEach(c => {
      let data = Object.assign({}, c.data()) // console.log(data)
      delete data.id
      delete data.label
      data.width = data.width | 0
      data.height = data.height | 0
      let concept = {
        cid: c.id(),
        cmid: null,
        label: c.data('label'),
        x: c.position().x | 0,
        y: c.position().y | 0,
        data: JSON.stringify(data)
      }
      concepts.push(concept) // console.log(concept)
    });
    canvas.cy.nodes('[type="link"]').forEach(l => {
      let data = Object.assign({}, l.data()) // console.log(data)
      delete data.id
      delete data.label
      data.width = data.width | 0
      data.height = data.height | 0
      let sdata = l.connectedEdges(`[type="left"][source="${l.id()}"]`).length ? 
        Object.assign({}, (l.connectedEdges(`[type="left"][source="${l.id()}"]`)[0]).data()) : null
      let scid = sdata ? sdata.target : null
      if (sdata) delete sdata.id
      let link = {
        lid: l.id(),
        cmid: null,
        label: l.data('label'),
        x: l.position().x | 0,
        y: l.position().y | 0,
        data: JSON.stringify(data),
        source_cid: scid,
        source_cmid: null,
        source_data: sdata ? JSON.stringify(sdata) : null,
      }
      links.push(link) // console.log(link)
    });

    canvas.cy.edges('[type="right"]').forEach(e => {
      let tdata = Object.assign({}, e.data()); // console.log(e, tdata)
      let lid = tdata ? tdata.source : null
      let tcid = tdata ? tdata.target : null
      if (tdata) delete tdata.id
      let linktarget = {
        lid: lid,
        cmid: null,
        target_cid: tcid,
        target_cmid: null,
        target_data: tdata ? JSON.stringify(tdata) : null
      }
      linktargets.push(linktarget)
    })

    let data = {
      concepts: concepts,
      links: links,
      linktargets: linktargets
    }
    return data;
  }
  static composeConceptMap(conceptMapData) {
    if(!conceptMapData.concepts || !conceptMapData.links || !conceptMapData.linktargets)
      throw "Invalid concept map data.";
    try {
      let conceptmap = []
      conceptMapData.concepts.forEach(c => {
        conceptmap.push({
          group: 'nodes',
          position: {x: parseInt(c.x), y: parseInt(c.y)},
          data: Object.assign(JSON.parse(c.data), { 
            id: c.cid,
            label: c.label,
          }),
        })
      })
      conceptMapData.links.forEach(l => {
        conceptmap.push({
          group: 'nodes',
          position: {x: parseInt(l.x), y: parseInt(l.y)},
          data: Object.assign(JSON.parse(l.data), { 
            id: l.lid,
            label: l.label,
          }),
        })
        if (l.source_cid) {
          conceptmap.push({
            group: 'edges',
            data: Object.assign(JSON.parse(l.source_data), { 
              source: l.lid,
              target: l.source_cid,
            }),
          })
        }
      })
      conceptMapData.linktargets.forEach(lt => {
        conceptmap.push({
          group: 'edges',
          data: Object.assign(JSON.parse(lt.target_data), { 
            source: lt.lid,
            target: lt.target_cid,
          }),
        })
      })
      return conceptmap;  
    } catch (error) { throw error }
  }
  static composeKitMap(kitMapData) {
    if(!kitMapData.conceptMap || !kitMapData.concepts 
      || !kitMapData.links || !kitMapData.linktargets)
      throw "Invalid kit data.";
    try {
      let kitMap = []
      let getConceptPosition = (cid) => {
        for(let c of kitMapData.concepts) {
          if (c.cid == cid) return {x: parseInt(c.x), y: parseInt(c.y)};
        }
        return false;
      }
      let getLinkPosition = (lid) => {
        for(let l of kitMapData.links) {
          if (l.lid == lid) return {x: parseInt(l.x), y: parseInt(l.y)};
        }
        return false;
      }
      let getLink = (lid) => {
        for(let l of kitMapData.links) {
          if (l.lid == lid) return l
        }
        return false;
      }
      let countLinkTargets = (lid) => {
        let count = 0
        for(let l of kitMapData.conceptMap.linktargets) {
          if (l.lid == lid) count++
        }
        return count;
      }
      kitMapData.conceptMap.concepts.forEach(c => {
        let position = getConceptPosition(c.cid)
        kitMap.push({
          group: 'nodes',
          position: position === false ? {x: parseInt(c.x), y: parseInt(c.y)} : position,
          data: Object.assign(JSON.parse(c.data), { 
            id: c.cid,
            label: c.label,
          }),
          invalid: position === false ? true : undefined
        })
      })
      kitMapData.conceptMap.links.forEach(l => {
        let position = getLinkPosition(l.lid)
        kitMap.push({
          group: 'nodes',
          position: position === false ? {x: parseInt(l.x), y: parseInt(l.y)} : position,
          data: Object.assign(JSON.parse(l.data), { 
            id: l.lid,
            label: l.label,
            limit: countLinkTargets(l.lid)
          }),
          invalid: position === false ? true : undefined
        })
        let link = getLink(l.lid)
        if (link && link.source_cid) {
          kitMap.push({
            group: 'edges',
            data: Object.assign(link.source_data ? JSON.parse(link.source_data) : {}, { 
              source: link.lid,
              target: link.source_cid,
            }),
          })
        }
      })
      kitMapData.linktargets.forEach(lt => {
        kitMap.push({
          group: 'edges',
          data: Object.assign(JSON.parse(lt.target_data), { 
            source: lt.lid,
            target: lt.target_cid,
          }),
        })
      })
      return kitMap;  
    } catch (error) { throw error }
  }
  static composeLearnerMap(learnerMapData) {
    if(!learnerMapData.conceptMap || !learnerMapData.concepts 
      || !learnerMapData.links || !learnerMapData.linktargets)
      throw "Invalid kit data.";
    try {
      let kitMap = []
      let getConceptPosition = (cid) => {
        for(let c of learnerMapData.concepts) {
          if (c.cid == cid) return {x: parseInt(c.x), y: parseInt(c.y)};
        }
        return false;
      }
      let getLinkPosition = (lid) => {
        for(let l of learnerMapData.links) {
          if (l.lid == lid) return {x: parseInt(l.x), y: parseInt(l.y)};
        }
        return false;
      }
      let getLink = (lid) => {
        for(let l of learnerMapData.links) {
          if (l.lid == lid) return l
        }
        return false;
      }
      let countLinkTargets = (lid) => {
        let count = 0
        for(let l of learnerMapData.conceptMap.linktargets) {
          if (l.lid == lid) count++
        }
        return count;
      }
      learnerMapData.conceptMap.concepts.forEach(c => {
        let position = getConceptPosition(c.cid)
        kitMap.push({
          group: 'nodes',
          position: position === false ? {x: parseInt(c.x), y: parseInt(c.y)} : position,
          data: Object.assign(JSON.parse(c.data), { 
            id: c.cid,
            label: c.label,
          }),
          invalid: position === false ? true : undefined
        })
      })
      learnerMapData.conceptMap.links.forEach(l => {
        let position = getLinkPosition(l.lid)
        kitMap.push({
          group: 'nodes',
          position: position === false ? {x: parseInt(l.x), y: parseInt(l.y)} : position,
          data: Object.assign(JSON.parse(l.data), { 
            id: l.lid,
            label: l.label,
            limit: countLinkTargets(l.lid)
          }),
          invalid: position === false ? true : undefined
        })
        let link = getLink(l.lid)
        if (link && link.source_cid) {
          kitMap.push({
            group: 'edges',
            data: Object.assign(link.source_data ? JSON.parse(link.source_data) : {}, { 
              source: link.lid,
              target: link.source_cid,
            }),
          })
        }
      })
      learnerMapData.linktargets.forEach(lt => {
        kitMap.push({
          group: 'edges',
          data: Object.assign(JSON.parse(lt.target_data), { 
            source: lt.lid,
            target: lt.target_cid,
          }),
        })
      })
      return kitMap;  
    } catch (error) { throw error }
  }

}



/*!
 Copyright 2018 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
/*! lifecycle.es5.js v0.1.1 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.lifecycle=t()}(this,function(){"use strict";var e=void 0;try{new EventTarget,e=!1}catch(t){e=!1}var t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)},a=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},s=function(){function e(){n(this,e),this._registry={}}return i(e,[{key:"addEventListener",value:function(e,t){this._getRegistry(e).push(t)}},{key:"removeEventListener",value:function(e,t){var n=this._getRegistry(e),i=n.indexOf(t);i>-1&&n.splice(i,1)}},{key:"dispatchEvent",value:function(e){return e.target=this,Object.freeze(e),this._getRegistry(e.type).forEach(function(t){return t(e)}),!0}},{key:"_getRegistry",value:function(e){return this._registry[e]=this._registry[e]||[]}}]),e}(),o=e?EventTarget:s,u=e?Event:function e(t){n(this,e),this.type=t},f=function(e){function t(e,i){n(this,t);var r=a(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return r.newState=i.newState,r.oldState=i.oldState,r.originalEvent=i.originalEvent,r}return r(t,u),t}(),c="active",h="passive",d="hidden",l="frozen",p="terminated",v="object"===("undefined"==typeof safari?"undefined":t(safari))&&safari.pushNotification,y=["focus","blur","visibilitychange","freeze","resume","pageshow","onpageshow"in self?"pagehide":"unload"],g=function(e){return e.preventDefault(),e.returnValue="Are you sure?"},_=[[c,h,d,p],[c,h,d,l],[d,h,c],[l,d],[l,c],[l,h]].map(function(e){return e.reduce(function(e,t,n){return e[t]=n,e},{})}),b=function(){return document.visibilityState===d?d:document.hasFocus()?c:h};return new(function(e){function t(){n(this,t);var e=a(this,(t.__proto__||Object.getPrototypeOf(t)).call(this)),i=b();return e._state=i,e._unsavedChanges=[],e._handleEvents=e._handleEvents.bind(e),y.forEach(function(t){return addEventListener(t,e._handleEvents,!0)}),v&&addEventListener("beforeunload",function(t){e._safariBeforeUnloadTimeout=setTimeout(function(){t.defaultPrevented||t.returnValue.length>0||e._dispatchChangesIfNeeded(t,d)},0)}),e}return r(t,o),i(t,[{key:"addUnsavedChanges",value:function(e){!this._unsavedChanges.indexOf(e)>-1&&(0===this._unsavedChanges.length&&addEventListener("beforeunload",g),this._unsavedChanges.push(e))}},{key:"removeUnsavedChanges",value:function(e){var t=this._unsavedChanges.indexOf(e);t>-1&&(this._unsavedChanges.splice(t,1),0===this._unsavedChanges.length&&removeEventListener("beforeunload",g))}},{key:"_dispatchChangesIfNeeded",value:function(e,t){if(t!==this._state)for(var n=function(e,t){for(var n,i=0;n=_[i];++i){var r=n[e],a=n[t];if(r>=0&&a>=0&&a>r)return Object.keys(n).slice(r,a+1)}return[]}(this._state,t),i=0;i<n.length-1;++i){var r=n[i],a=n[i+1];this._state=a,this.dispatchEvent(new f("statechange",{oldState:r,newState:a,originalEvent:e}))}}},{key:"_handleEvents",value:function(e){switch(v&&clearTimeout(this._safariBeforeUnloadTimeout),e.type){case"pageshow":case"resume":this._dispatchChangesIfNeeded(e,b());break;case"focus":this._dispatchChangesIfNeeded(e,c);break;case"blur":this._state===c&&this._dispatchChangesIfNeeded(e,b());break;case"pagehide":case"unload":this._dispatchChangesIfNeeded(e,e.persisted?l:p);break;case"visibilitychange":this._state!==l&&this._state!==p&&this._dispatchChangesIfNeeded(e,b());break;case"freeze":this._dispatchChangesIfNeeded(e,l)}}},{key:"state",get:function(){return this._state}},{key:"pageWasDiscarded",get:function(){return document.wasDiscarded||!1}}]),t}())});
//# sourceMappingURL=lifecycle.es5.js.map