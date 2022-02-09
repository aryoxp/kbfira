class Canvas {

  constructor(cvsId, options) {
    this.settings = Object.assign({}, {
      canvasId: cvsId,
      tooltipClass: '.canvas-tooltip',
      isDirected: true,
      useDummy: false,
      monitorNodeMovement: true,
      dragDelay: 200,
      enableToolbar: true,
      enableUndoRedo: true,
      enableNodeCreation: true,
      enableConceptCreation: true,
      enableLinkCreation: true,
      enableZoom: true,
      enableAutoLayout: true,
      enableSaveImage: true,
      enableClearCanvas: true
    }, options);

    this.colors = ['#4A6D7C', '#F44708', '#688E26', '#A10702', '#00CECB', '#FF5E5B', '#FFED66', '#A657AE', '#A18276', '#5B618A', '#6096BA', '#FE64A3', '#4DCCBD', '#636B61'];
    this.defaultColor = '#FFD480';

    this.l = Language.instance();
    this.modal = new Modal(this);
    this.toolbar = new Toolbar(this, {
      defaultColor: this.defaultColor
    });
    this.tooltips = null; // auto tippy-tooltip elements holder
    this.canvasTool = null; // elements overlay tool holder
    this.selectionTool = null; // floating selection tool holder
    this.canvasToolTooltip = new Tooltip(this.settings.canvasId, this.settings.tooltipClass);
    this.floatingCreateTool = new CreateTool(this.settings.canvasId);

    this._tools = []; // additional overlay tool holder

    this._edges = [];
    this._nodes = [];
    this._lastConceptId = 0;
    this._lastLinkId = 0;

    this._screenshot = null;
    this._snapshot = null;

    this.cy = null;
    this.eventListeners = [];

  }

  reset() {
    this._edges = [];
    this._nodes = [];
    this._lastConceptId = 0;
    this._lastLinkId = 0;
    this._screenshot = null;
    this._snapshot = null;
  }

  get() {
    return this.cy;
  };

  getModal() {
    return this.modal;
  }

  getToolbar() {
    return this.toolbar;
  }

  getContainer(options) {
    let settings = Object.assign({
      selector: false
    }, options)
    return settings.selector ? 
      '#' + this.settings.canvasId : 
      $('#' + this.settings.canvasId).parent('.kb-container');
  }

  // init(elementId, options) {
  init(options) {

    // Override settings on init.
    this.settings = Object.assign({}, this.settings, options);

    // Default settings for Cose-Bilkent auto-layout
    this.layoutDefaults = {
      name: 'cose-bilkent',
      nodeDimensionsIncludeLabels: true,
      padding: 50,
      nestingFactor: 0.2,
      gravity: 2, // 0.25,
      idealEdgeLength: 70,
      fit: true
    }

    // remove arrow for undirected edge

    if (!this.settings.isDirected) {
      for (let i in CanvasStyle.directedStyle) {
        let style = CanvasStyle.directedStyle[i];
        let selector = style.selector;
        if (selector == 'edge[type="left"]') style.style["source-arrow-shape"] = 'none';
        else if (selector == 'edge[type="right"]') style.style["target-arrow-shape"] = 'none';
      }
    }

    // start CytoscapeJS canvas
    this.cy = cytoscape({
      container: document.getElementById(this.settings.canvasId),
      style: CanvasStyle.directedStyle,
      elements: (this.settings.useDummy ? this._dummyElements : []),
      minZoom: 0.1,
      maxZoom: 5,
      layout: 'cose-bilkent'
    });

    this.canvasOptions = this.settings.isDirected ? CanvasStyle.directedOptions : CanvasStyle.undirectedOptions;
    this.canvasOptions.host = this;
    this.canvasOptions.edgeSettings = Object.assign({
      enableNodeCreationTools: this.settings.enableNodeCreation,
      enableNodeTools: true,
      enableNodeModificationTools: this.settings.enableNodeCreation,
      enableConnectionTools: true,
      isDirected: this.settings.isDirected
    }, this.settings, options);

    // !!IMPORTANT
    // start Edge plugins for Kit-Build with options
    // connecting canvas callback with in-node modification tools
    // cy.edge(this.canvasOptions);
    this.canvasTool = new CanvasTool(this.cy, this.canvasOptions).start();
    this.floatingCreateTool.setCallback(function (data) {
      let nodeData = {
        type: data.type.replace('create-', ""),
        label: data.label,
        position: this.canvasTool.toCanvasPosition(data.position)
      };
      this.createNode(nodeData);
      // Broadcast event adding node
      let eventListeners = this.eventListeners;
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("floating-toolbar-add-concept-node", nodeData);
        }
      });
    }.bind(this))

    // Floating selection and nodes arrangement tool
    this.selectionTool = new SelectionTool(this, this.canvasOptions);
    // Search tool
    this.searchTool = new SearchTool(this, this.canvasOptions);

    if (!this.settings.enableNodeCreation) this.toolbar.enableNodeCreation(false)
    if (!this.settings.enableConceptCreation) this.toolbar.enableConceptCreation(false);
    if (!this.settings.enableLinkCreation) this.toolbar.enableLinkCreation(false);
    if (!this.settings.enableUndoRedo) this.toolbar.enableUndoRedo(false);
    if (!this.settings.enableZoom) this.toolbar.enableZoom(false);
    if (!this.settings.enableAutoLayout) this.toolbar.enableAutoLayout(false);
    if (!this.settings.enableSaveImage) this.toolbar.enableSaveImage(false);
    if (!this.settings.enableClearCanvas) this.toolbar.enableClearCanvas(false);
    if (!this.settings.enableToolbar) this.toolbar.enableToolbar(false);

    // Initialize Tippy tooltip
    this.tooltips = tippy('[data-tippy-content]', {
      arrow: true,
      arrowType: 'round', // or 'sharp' (default)
      animation: 'fade',
    });

    // Set canvas as listener to execute toolbar action from canvas object (here).
    // onToolbarEvent()
    // onActionEvent()
    this.toolbar.attachEventListener(this);

    return this;
  }

  getCy() {
    return this.cy;
  }

  getToolbar() {
    return this.toolbar;
  }

  getCanvasTool() {
    return this.canvasTool;
  }

  getConceptId() {
    let concepts = this.cy.nodes('[type="concept"]');
    for (let i = 0; i < concepts.length; i++) {
      let id = concepts[i].id();
      let num = parseInt(id.substring(2));
      if (num > this._lastConceptId) this._lastConceptId = num;
    }
    return ++this._lastConceptId;
  }

  getLinkId() {
    let links = this.cy.nodes('[type="link"]');
    for (let i = 0; i < links.length; i++) {
      let id = links[i].id();
      let num = parseInt(id.substring(2));
      if (num > this._lastLinkId) this._lastLinkId = num;
    }
    return ++this._lastLinkId;
  }

  clearOverlayCanvas() {
    let container = $(this.cy.container());
    let canvas = $('#kb-canvas' + "-" + this.settings.canvasId);
    let ctx = canvas.get(0).getContext('2d');
    var w = container.width();
    var h = container.height();
    ctx.clearRect(0, 0, w, h);
  }

  clearCanvas() {
    this.cy.elements().remove();
  }

  setDirected(isDirected = true) {
    this.settings.isDirected = isDirected;
    let style = this.cy.style();
    if (!this.settings.isDirected) {
      style.selector('edge[type="left"]')
        .style({
          'source-arrow-shape': 'none'
        });
      style.selector('edge[type="right"]')
        .style({
          'target-arrow-shape': 'none'
        });
    } else {
      style.selector('edge[type="left"]')
        .style({
          'source-arrow-shape': 'triangle'
        });
      style.selector('edge[type="right"]')
        .style({
          'target-arrow-shape': 'triangle'
        });
    }
    style.update();
    this.canvasTool.updateSettings(Object.assign({
      isDirected: this.settings.isDirected
    }, (this.settings.isDirected) ? CanvasStyle.directedOptions : CanvasStyle.undirectedOptions));
    this.toolbar.changeDirectionIcon(this.settings.isDirected);
  }






  /* Showing new link dialog window */
  createNewConcept() {

    let canvas = this;
    let modal = this.modal;
    let toolbar = this.toolbar;
    let eventListeners = this.eventListeners;

    modal.newNode('concept', {}, function (value) {

      try { // throw "something wrong";
        let concept = canvas.createNode({
          type: 'concept',
          label: value
        });

        /* Preparing Undo and Log */
        let nodeData = concept.json();
        delete nodeData.classes;
        delete nodeData.grabbable;
        delete nodeData.locked;
        delete nodeData.removed;
        delete nodeData.selectable;
        delete nodeData.selected;
        delete nodeData.pannable;
        nodeData.position.x = parseInt(nodeData.position.x);
        nodeData.position.y = parseInt(nodeData.position.y);

        toolbar.getAction().push(new Create(nodeData));

        // Broadcast event adding node
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onToolbarEvent == 'function') {
            listener.onToolbarEvent("toolbar-add-concept-node", nodeData);
          }
        });

        // Pan camera to the newly created node
        canvas.panToNode(concept);
        return concept;
      } catch (error) {
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function') {
            listener.onCanvasEvent("error-add-concept", error);
          }
        });
        throw error;
      }
    });
  }

  /* Showing new link dialog window */
  createNewLink() {

    let canvas = this;
    let modal = this.modal;
    let toolbar = this.toolbar;
    let eventListeners = this.eventListeners;

    modal.newNode('link', {}, function (value) {

      try { // throw "Something wrong tooo...";
        let link = canvas.createNode({
          type: 'link',
          label: value
        });

        /* Preparing Undo and Log */
        let nodeData = link.json();
        delete nodeData.classes;
        delete nodeData.grabbable;
        delete nodeData.locked;
        delete nodeData.removed;
        delete nodeData.selectable;
        delete nodeData.selected;
        delete nodeData.pannable;
        nodeData.position.x = parseInt(nodeData.position.x);
        nodeData.position.y = parseInt(nodeData.position.y);

        toolbar.getAction().push(new Create(nodeData));

        // Log event
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onToolbarEvent == 'function') {
            listener.onToolbarEvent("toolbar-add-link-node", nodeData);
          }
        });

        // Pan to newly created node
        canvas.panToNode(link);
        return link;
      } catch (error) {
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function') {
            listener.onCanvasEvent("error-add-link", error);
          }
        });
        throw error;
      }
    });
  }

  /* Data */

  createNode(kit, extras = null, options = null) {

    /* kit format:
    {
      type: 'concept'|'link',
      label: 'Node label',
      state: 'new'|'',
      position: {
        x: x,
        y: y,
      }
    }
    */

    let canvas = this;
    let toolbar = canvas.toolbar;
    let cy = canvas.getCy();
    let pan = cy.pan();
    let w = cy.width() / cy.zoom();
    let h = cy.height() / cy.zoom();
    let canvasCenterCoordinate = {
      x: parseInt(-pan.x / cy.zoom() + w / 2),
      y: parseInt(-pan.y / cy.zoom() + h / 2)
    }

    function create(kit, position, callback) {
      // console.warn(toolbar.huebee, kit.type);
      let nodeDef = {
        group: "nodes",
        data: {
          id: (kit.type == 'concept' ?
            "c-" + canvas.getConceptId() :
            "l-" + canvas.getLinkId()),
          name: kit.label.toString().trim(),
          type: kit.type,
          color: toolbar.huebee.color ? toolbar.huebee.color : canvas.defaultColor,
          textColor: kit.type == 'link' ? undefined : (toolbar.huebee.isLight ? undefined : '#ffffff'),
          state: kit.state ? kit.state : null,
          extra: extras
        },
        position: kit.position ? kit.position : position
      }; // console.error(nodeDef);
      let node = canvas.getCy().add(nodeDef); // console.warn(node.data());
      if (!toolbar.huebee.isLight && kit.type == 'concept')
        node.css('color', '#ffffff');
      if (typeof callback == 'function') callback(node);
      return node;
    }

    function checkOverlap(xPoint) {
      let overlap = false;
      let nodes = canvas.getCy().nodes();
      for (let n of nodes) {
        if (n.id() == xPoint.id) continue;
        let w = n.outerWidth();
        let h = n.outerHeight();
        let x = n.position().x;
        let y = n.position().y;
        let nPoint = {
          x1: parseInt(x - w / 2),
          x2: parseInt(x + w / 2),
          y1: parseInt(y - h / 2),
          y2: parseInt(y + h / 2)
        }
        if (xPoint.x1 < nPoint.x2 && xPoint.x2 > nPoint.x1 &&
          xPoint.y1 < nPoint.y2 && xPoint.y2 > nPoint.y1) {
          overlap = true;
          return overlap;
        }
      }
      return overlap;
    }

    function moveSpiral(node, level, pos) {
      let dim = node.layoutDimensions();
      let rPos = {
        x: x + (pos.x * (dim.w + margin)),
        y: y + (pos.y * (dim.h + margin))
      }
      node.position(rPos);
      let xPoint = {
        x1: parseInt(rPos.x - dim.w / 2),
        x2: parseInt(rPos.x + dim.w / 2),
        y1: parseInt(rPos.y - dim.h / 2),
        y2: parseInt(rPos.y + dim.h / 2),
        id: node.id()
      }
      let overlap = checkOverlap(xPoint);
      // overlap = false;
      if (!overlap) {
        let eventListeners = canvas.eventListeners;
        let nodeJson = node.json();
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function')
            listener.onCanvasEvent('create-' + node.data('type'), {
              data: nodeJson.data,
              position: nodeJson.position,
              group: nodeJson.group
            });
        });
        return;
      }
      switch (pos.state) {
        case 'd':
          if (pos.x == level && pos.y < level) pos.y++;
          else {
            pos.state = 'l';
            pos.x--;
          }
          break;
        case 'l':
          if (pos.y == level && pos.x > -level) pos.x--;
          else {
            pos.state = 'u';
            pos.y--;
          }
          break;
        case 'u':
          if (pos.x == -level && pos.y > -level) pos.y--;
          else {
            pos.state = 'r';
            pos.x++;
          }
          break;
        case 'r':
          if (pos.y == -level && pos.x < level) pos.x++;
          else {
            pos.state = 'd';
            pos.y++;
          }
          break;
      }

      if (pos.x != level || pos.y != 0) {
        setTimeout(function () {
          moveSpiral(node, level, pos)
        });
        // moveSpiral(node, level, pos)
      } else {
        level++;
        if (level < 6)
          moveSpiral(node, level, {
            x: level,
            y: 0,
            state: 'd'
          })
      }
    }

    let node = create(kit, canvasCenterCoordinate);
    var level = 0;
    var margin = 10;
    var pos = { // spiral position 
      x: level,
      y: 0,
      state: 'r' // downward
    }
    var x = kit.position ? kit.position.x : canvasCenterCoordinate.x;
    var y = kit.position ? kit.position.y : canvasCenterCoordinate.y;
    moveSpiral(node, level, pos);

    this._nodes.push(node);

    return node;
  }

  updateNode(nodeId, newName) {
    let nodes = this.cy.$(`#${nodeId}`); // console.warn(nodes, nodeId, newName)
    if (nodes.length != 1) return;
    let node = nodes[0];
    let previousName = node.data('name');
    this.cy.$('#' + node.data().id).data('name', newName);
    this.toolbar.action.push(new Rename(node.id(), previousName, newName));
    let data = Object.assign({
      fName: previousName
    }, node.data());
    let eventListeners = this.eventListeners;
    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasEvent == 'function')
        listener.onCanvasEvent('rename-' + node.data('type'), data);
    });
    return node;
  }

  findNode(keyword, options) {
    let nodes = this.findNodes(keyword, options);
    // console.log(settings, nodes);
    if (nodes != null && nodes.length > 0) return nodes[0];
    return null;
  }

  findNodes(keyword, options) {
    let settings = {
      field: 'name',
      method: 'exact',
      type: 'concept'
    }
    settings = Object.assign(settings, options);
    let filter = '[' + settings.field + '="' + keyword + '"][type="' + settings.type + '"]';
    // console.log(filter);
    let nodes = this.cy.nodes(filter);
    // console.log(nodes);
    if (nodes.length) return nodes.toArray();
    else return null;
  }

  // findNode(label, subjectNode = null, objectNode = null) {
  //   if (subjectNode == null && objectNode == null) {
  //     // TODO: finding name should be done by cosine similarity
  //     let nodes = this.cy.nodes('[name = "' + label + '"][type="concept"]');
  //     if (nodes.length > 0) return nodes[0];
  //     else return null;
  //   } else if (subjectNode && objectNode) {
  //     let nodes = this.cy.nodes('[name = "' + label + '"][type="link"]');
  //     for (let i = 0; i < nodes.length; i++) {
  //       let link = nodes[i];
  //       let edges = link.connectedEdges();
  //       let leftEdge = null,
  //         rightEdge = null;
  //       for (let j = 0; j < edges.length; j++) {
  //         switch (edges[j].data('type')) {
  //           case 'left':
  //             leftEdge = edges[j];
  //             break;
  //           case 'right':
  //             rightEdge = edges[j];
  //             break;
  //         }
  //       }
  //       if (leftEdge && rightEdge &&
  //         leftEdge.target().data('id') == subjectNode.data('id') && rightEdge.target().data('id') == objectNode.data('id'))
  //         return link;
  //     }
  //   }
  //   return null;
  // }

  addNode(node) {
    let nd = this.cy.add(node);
    this._nodes.push(nd);
    return nd;
  }

  addEdge(edge) {
    let ed = this.cy.add(edge);
    this._edges.push(ed);
    return ed;
  }

  addProposition(sConcept, link, tConcept, callback) {
    var canvas = this;
    var margin = 55;
    var exSourceConcept = this.findNode(sConcept)
    var exTargetConcept = this.findNode(tConcept)
    // console.log(exSourceConcept, exTargetConcept)
    var s = exSourceConcept == null ? this.createNode({
      label: sConcept,
      type: 'concept'
    }) : exSourceConcept;
    var t = exTargetConcept == null ? this.createNode({
      label: tConcept,
      type: 'concept'
    }) : exTargetConcept;

    function propositionExists() {
      if (exSourceConcept != null && exTargetConcept != null) {
        let exLinks = canvas.findNodes(link, {
          type: 'link'
        });
        if (exLinks == null) return false;
        for (let exLink of exLinks) {
          // console.log(exLink);
          let concepts = exLink.neighborhood('[type="concept"]')
          // console.log(concepts);
          let sExists = concepts.contains(s);
          let tExists = concepts.contains(t);
          // console.log(sExists, tExists);
          return (sExists && tExists);
        }
      }
      return false;
    }
    var l = null;
    if (!propositionExists()) {
      l = this.createNode({
        label: link,
        type: 'link'
      })
      if (l == null) return null;
    } else return null;

    this.addEdge({
      group: 'edges',
      data: {
        source: l.id(),
        target: s.id(),
        type: 'left'
      }
    });
    this.addEdge({
      group: 'edges',
      data: {
        source: l.id(),
        target: t.id(),
        type: 'right'
      }
    });

    // console.log(s,l,t);
    let ws = s.outerWidth()
    let wl = l.outerWidth()
    let wt = t.outerWidth()

    setTimeout(function () {
      l.position({
        x: parseInt(s.position().x + ws / 2 + margin + wl / 2),
        y: s.position().y
      })
      if (exTargetConcept == null)
        t.position({
          x: parseInt(l.position().x + wl / 2 + margin + wt / 2),
          y: s.position().y
        })
      // console.log(s.position(), l.position(), t.position())
      if (typeof callback == 'function') callback({
        source: s,
        link: l,
        target: t
      });
    }, 200);

    return {
      source: s,
      link: l,
      target: t
    }
  }

  getNodes(selector, json = true) {
    if (this.cy) {
      if (json) return this.cy.nodes(selector).jsons();
      else return this.cy.nodes(selector);
    } else return [];
  }

  getEdges(selector, json = true) {
    if (this.cy) {
      if (json) return this.cy.edges(selector).jsons();
      else return this.cy.edges(selector);
    } else return [];
  }

  screenshot() {
    if (this.cy) this._screenshot = this.cy.png();
    else this._screenshot = null;
    return this._screenshot;
  }

  snapshot() {
    if (this.cy) this._snapshot = this.cy.json();
    else this._snapshot = null;
    return this._snapshot;
  }

  showMap(...args) { // overloaded
    let mapJson = args.shift();
    let callback = args.pop();
    this.cy.add(mapJson);
    if (typeof callback == 'function') callback();
    return this;
  }

  createNodeFromJSON(nodeJSON) {
    this.cy.add(nodeJSON);
  }

  connect(edgeData) {
    // let edgeData = {
    //   source: link-id,
    //   target: concept-id
    //   type: 'left' | 'right'
    // };
    this.cy.add({
      data: edgeData
    });
  }

  disconnect(edgeData) {
    let selector = 'edge'
    selector += (edgeData.source) ? '[source="' + edgeData.source + '"]' : ''
    selector += (edgeData.target) ? '[target="' + edgeData.target + '"]' : ''
    selector += (edgeData.type) ? '[type="' + edgeData.type + '"]' : ''
    this.cy.remove(selector);
  }

  deleteNode(node) {
    this.cy.remove('node[id="' + node.data.id + '"]');
  }

  deleteNodes(nodes) {
    nodes.forEach(node => {
      this.cy.remove('#' + node.id);
    })
  }

  switchDirection(linkId) {
    let nodes = this.cy.nodes('[id="' + linkId + '"]');
    if (nodes.length != 1) return;
    let link = nodes[0];
    let edges = link.connectedEdges();
    if (edges.length != 2) return;
    let e0 = edges[0].json();
    let e1 = edges[1].json();
    let e0type = e0.data.type;
    let e1type = e1.data.type;
    let ne0 = {
      group: "edges",
      data: e0.data
    };
    delete ne0.data.id;
    ne0.data.type = e1type;
    let ne1 = {
      group: "edges",
      data: e1.data
    }
    delete ne1.data.id;
    ne1.data.type = e0type;
    this.cy.add(ne0);
    this.cy.add(ne1);
    edges[0].remove();
    edges[1].remove();
    this.canvasTool.clear();
  }

  /* Elements Layout and Positioning */

  moveNode(nodeId, x, y, options, callback) {
    let setting = Object.assign({
      animate: true
    }, options)
    let node = this.cy.$('#' + nodeId);
    if (!node.length) return;
    if (setting.animate) {
      if (node.selected()) this.canvasTool.clear();
      node.animate({
        position: { x: x, y: y },
        complete: () => {
          if (typeof callback == "function") callback(node);
        }
      }, {
        duration: Math.max(0, this.settings.dragDelay - 20)
      });
    } else {
      if (node.selected()) {
        this.canvasTool.clear();
      } 
      node.position({
        x: x,
        y: y
      });
      if (typeof callback == "function") callback(node);
    }
  }

  centerLinkPosition(relation) {
    let edges = relation.connectedEdges();
    if (edges.length == 2) {
      let source = edges[0].target();
      let target = edges[1].target();

      let a = source.position();
      let b = target.position();

      let aId = source.data().id;
      let bId = target.data().id;

      if (aId != bId)
        relation.position({
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2
        });
    }
  }

  reposition(options) {
    let defaults = {
      name: 'cose-bilkent',
      nodeDimensionsIncludeLabels: true,
      padding: 20,
      nestingFactor: 0.2,
      gravity: 2, // 0.25,
      idealEdgeLength: 70,
      fit: false,
      animationDuration: 300,
      tile: false,
      layoutStopCallback: null
    }
    let settings = Object.assign({}, defaults, options);
    this.cy.layout(settings).on('layoutstop', function () {
      if (settings.layoutStopCallback != null)
        settings.layoutStopCallback();
    }).run();
  }

  layout(options, callback) {
    let appCanvas = this;
    let eventListeners = this.eventListeners;
    let action = this.toolbar.action;
    let canvasTool = this.canvasTool;
    let nodes = (this.cy.nodes(':selected').length <= 1) ? this.cy.nodes() : this.cy.nodes(':selected');


    if (typeof options != 'undefined' && typeof options.keepSettings != 'undefined' && options.keepSettings) {
      this.layoutKeepSettings = Object.assign({}, this.layoutDefaults, options);
    }

    let settings = Object.assign({}, this.layoutDefaults, options);
    if (typeof this.layoutKeepSettings != 'undefined')
      settings = Object.assign({}, this.layoutDefaults, this.layoutKeepSettings);

    const width = this.cy.width();
    const height = this.cy.height();
    const rbb = this.cy.elements().renderedBoundingbox();

    settings.fit = (rbb.x1 < 0 || rbb.y1 < 0 || rbb.x2 > width || rbb.y2 > height) ? true : false;

    let fNodes = [];
    for (let n = 0; n < nodes.length; n++) {
      let node = nodes[n];
      fNodes.push({
        id: node.id(),
        x: parseInt(node.position('x')),
        y: parseInt(node.position('y'))
      });
    }

    let selectedNodes = this.cy.nodes(':selected');

    if (selectedNodes.length > 1) {
      var withEdges = this.cy.collection();
      for (let node of selectedNodes) {
        if (node.connectedEdges().length) withEdges = withEdges.union(node)
      }
      try {
        // is there any selected nodes that are not supposed to be selected?
        if (!withEdges.allAreNeighbors(withEdges)) {
          // yes, find it.
          for (let e of withEdges) {
            // find its neighborhoods
            let eNe = e.neighborhood('[type="concept"]').union(e.neighborhood('[type="link"]'));
            // if its neighbor is not one of selected nodes,
            if (eNe.not(selectedNodes).length > 0) {
              e.unselect(); // remove it from selection
              fNodes = fNodes.filter(n => n.id !== e.id());
            }
          }
        }
        selectedNodes = this.cy.nodes(':selected')
        let bb = JSON.parse(JSON.stringify(selectedNodes.boundingBox()));
        selectedNodes = selectedNodes.union(selectedNodes.connectedEdges());
        selectedNodes.layout({
          name: 'fcose',
          fit: false,
          animate: false,
          start: () => {
            canvasTool.clear();
          },
          stop: function () {
            let bba = selectedNodes.boundingBox();
            let x = ((bb.x2 + bb.x1) / 2) - ((bba.x2 + bba.x1) / 2);
            let y = ((bb.y2 + bb.y1) / 2) - ((bba.y2 + bba.y1) / 2);
            selectedNodes.shift({
              x: x,
              y: y
            })
            let tNodes = [];
            for (let n = 0; n < selectedNodes.length; n++) {
              let node = selectedNodes[n];
              tNodes.push({
                id: node.id(),
                x: parseInt(node.position('x')),
                y: parseInt(node.position('y'))
              });
            }
            action.push(new ReLayout(fNodes, tNodes));
            let logData = {
              fPos: fNodes,
              tPos: tNodes
            };
            eventListeners.forEach(listener => {
              if (listener != null && typeof listener.onCanvasEvent == 'function')
                listener.onCanvasEvent('canvas-layout', logData);
            });
            if (typeof callback == "function") callback();
          }
        }).run();
      } catch (e) {
        console.warn('Error', e);
        this.modal.dialog(appCanvas.l.get('unable-to-layout'));
      }
      // it is partial layout
      // don't do the cose-bilkent layout
      return;
    }



    // console.log(settings);

    this.cy.layout(settings)
      .on('layoutstart', function (e) {
        canvasTool.clear();
        if (typeof settings.startCallback === 'function') {
          settings.startCallback(e);
        }
      })
      .on('layoutstop', function (e) {
        this.cy.nodes().unlock();
        if (typeof settings.stopCallback === 'function') {
          settings.stopCallback(e);
        }
        let tNodes = [];
        for (let n = 0; n < nodes.length; n++) {
          let node = nodes[n];
          tNodes.push({
            id: node.id(),
            x: parseInt(node.position('x')),
            y: parseInt(node.position('y'))
          });
        }
        action.push(new ReLayout(fNodes, tNodes));

        let logData = {
          fPos: fNodes,
          tPos: tNodes
        };
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function')
            listener.onCanvasEvent('canvas-layout', logData);
        });
        if (typeof callback == "function") callback();
      }).run();
  }

  /* Viewport Camera Manipulation */

  panToNode(node, options) {
    return new Promise((resolve, reject) => {
      let settings = Object.assign({
        duration: 0
      }, options)
      this.cy.animate({
        center: {
          eles: node
        },
        duration: settings.duration,
        complete: () => resolve()
      });
    })
  }

  focusTo(nodeId) {
    this.panToNode(`#${nodeId}`, { duration: 200 }).then(() => {
      this.cy.nodes().unselect();
      this.cy.nodes(`#${nodeId}`).select();
      this.canvasTool.clear();
    });
  }

  zoom(options) {
    let defaults = {
      step: 0.3,
      zoomIn: true
    }
    let opts = Object.assign({}, defaults, options);
    let zoom = this.cy.zoom();
    if ((zoom >= 4 && opts['zoomIn']) || (zoom <= 0.3 && !opts['zoomIn'])) return;
    let bb = this.cy.nodes().boundingBox();
    opts['step'] = zoom < 1 ? opts['step'] / 2 : opts['step'];
    let level = opts['zoomIn'] ?
      zoom + opts['step'] :
      zoom - opts['step'];
    level = ((level * 10) | 0) / 10;
    if (level >= 4) level = 4;
    this.cy.animate({
      zoom: {
        level: level,
        position: {
          x: (bb.x1 + bb.x2) / 2,
          y: (bb.y1 + bb.y2) / 2
        }
      },
      duration: 150
    });
  };

  zoomToFit(eles, options) {
    if (!eles) eles = this.cy;
    let defaults = {
      padding: 50
    }
    let settings = Object.assign({}, defaults, options);
    this.cy.animate({
      center: {
        eles: eles
      },
      fit: {
        eles: eles,
        padding: 50
      },
    });
  }

  centerCamera(eles) {
    if (typeof eles == 'undefined')
      eles = this.cy.elements();
    this.cy.center(eles);
  }

  repositionCamera(options) {
    options = options || {};
    let rbb = this.cy.elements().renderedBoundingBox();
    let padding = options.padding || 30;
    if (rbb.w + 2 * padding > this.cy.width() || rbb.h + 2 * padding > this.cy.height()) {

      this.cy.animate({
        fit: {
          eles: this.cy.nodes(),
          padding: padding
        },
        duration: options.duration || 300
      })
    } else {

      this.cy.animate({
        center: {
          eles: this.cy.nodes()
        },
        zoom: options.zoom || 1.0,
        duration: options.duration || 300
      });
    }
  }

  centerOneToOne(groups, options) {
    let settings = Object.assign({
      zoom: 1.0,
      duration: 300,
      padding: 50
    }, options);
    
    let elements = groups ? groups : this.getCy().nodes()
    this.cy.animate({
      center: {
        eles: elements
      },
      zoom: settings.zoom,
      duration: settings.duration,
      padding: settings.padding
    });
  }

  /* Event listeners */

  attachEventListener(listener) {

    // this listener is general listener
    // listener for activity logging
    this.eventListeners.push(listener);

  }

  detachEventListener() {}

  attachTool(tool) {
    this._tools.push(tool);
    this.canvasTool.addTool(tool);
  }

  /* Toolbar event listener callback  */

  onToolbarEvent(event, data = null) { // console.warn(event, data);
    let canvas = this;
    let eventListeners = this.eventListeners;

    switch (event) {
      case 'toolbar-color-select':
      case 'toolbar-color-change':
        this.cy.nodes('[type="concept"]:selected').data('color', data.color);
        this.cy.nodes('[type="concept"]:selected').css('background-color', data.color);
        if (!data.isLight) {
          this.cy.nodes('[type="concept"]:selected').css('color', '#ffffff');
          this.cy.nodes('[type="concept"]:selected').data('textColor', '#ffffff')
        } else {
          this.cy.nodes('[type="concept"]:selected').css('color', '#000000');
          this.cy.nodes('[type="concept"]:selected').data('textColor', '#000000')
        }
        if (event == 'toolbar-color-select') {
          eventListeners.forEach(listener => {
            if (listener != null && typeof listener.onCanvasEvent == 'function')
              listener.onCanvasEvent('color-select', {
                color: data.color,
                isLight: data.isLight
              });
          });
        }
        break;
      case 'toolbar-new-concept':
        canvas.createNewConcept();
        break;
      case 'toolbar-new-link':
        canvas.createNewLink();
        break;
      case 'toolbar-zoom-in':
        if (this.cy.nodes().length > 0)
          this.zoom({
            zoomIn: true
          });
        break;
      case 'toolbar-zoom-out':
        if (this.cy.nodes().length > 0)
          this.zoom({
            zoomIn: false
          });
        break;
      case 'toolbar-fit-screen':
        if (this.cy.nodes().length > 0)
          this.cy.animate({
            fit: {
              eles: this.cy,
              padding: 50
            }
          });
        break;
      case 'toolbar-center-camera':
        if (this.cy.nodes().length > 0)
          this.cy.animate({
            center: {
              eles: this.cy
            },
            duration: 200,
            complete: function () {
              canvas.getCanvasTool().redrawToolAndHandle();
            }
          });
        break;
      case 'toolbar-search':
        this.searchTool.toggle();
        break;
      case 'toolbar-select-tool':
        $('.kb-node-selection-toolbar').toggle(0, function () {
          if ($(this).is(":visible")) {
            var top = $("#" + canvas.settings.canvasId).offset().top;
            $(this).css({
              top: top + 60 + "px",
              right: 20 + "px"
            });
          }
        });
        break;
      case 'toolbar-change-direction':
        this.settings.isDirected = !this.settings.isDirected;
        this.setDirected(this.settings.isDirected);
        eventListeners.forEach(listener => {
          if (typeof listener.onCanvasEvent == 'function') {
            listener.onCanvasEvent('change-map-directional', {
              isDirected: this.settings.isDirected
            });
          }
        });
        break;
      case 'toolbar-layout':
        if (this.cy.nodes().length > 0) this.layout();
        break;
      case 'toolbar-save-image':
        if (this.cy.nodes().length > 0) {
          let png64 = this.cy.png({
            full: true,
            scale: 2
          });
          this.modal.showSnapshot(png64);
        } else {
          this.modal.dialog(canvas.l.get('unable-to-save-empty-map'));
        }
        break;
      case 'toolbar-clear':
        if (this.cy.nodes().length > 0) {
          let dialog = this.modal.dialog(canvas.l.get('confirm-clear-canvas-impact'), {
            'positive-callback': function () {
              canvas.clearCanvas();
              canvas.reset();
              canvas.modal.hide(dialog);
              canvas.toolbar.action.clearStack();
            },
            'negative-callback': function () {
              canvas.modal.hide(dialog);
            }
          })
        } else this.modal.dialog(canvas.l.get('canvas-empty'));
        break;
    }

  }

  /* Undo-Redo action event listener callback */

  onActionEvent(action, data = null) {
    // Every time undo-redo button clicked, 
    // clear garbages from the overlaid drawn tools. 
    this.clearOverlayCanvas();
    // forward action event
    let eventListeners = this.eventListeners;
    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onActionEvent == 'function')
        listener.onCanvasEvent(action, data);
    });
  }


  /* OVERLAID Canvas Callbacks */
  onCanvasNodeDrag(node, data) {
    let eventListeners = this.eventListeners;
    if (!this.startDrag) this.startDrag = new Date().getTime();
    if (new Date().getTime() > this.startDrag + this.settings.dragDelay) {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onCanvasEvent == 'function')
          listener.onCanvasEvent("drag-" + node.data('type'), data);
      });
      this.startDrag = new Date().getTime();
    }
  }

  onCanvasNodeDragGroup(node, draggedNodes) {
    let eventListeners = this.eventListeners;
    if (!this.startDrag) this.startDrag = new Date().getTime();
    if (new Date().getTime() > this.startDrag + this.settings.dragDelay) {
      eventListeners.forEach(listener => {
        if (listener != null && typeof listener.onCanvasEvent == 'function')
          listener.onCanvasEvent("drag-node-group", draggedNodes);
      });
      this.startDrag = new Date().getTime();
    }
  }

  onCanvasNodeMove(node, from, data) {
    let eventListeners = this.eventListeners;
    let action = this.toolbar.getAction();
    action.push(new Move(node.id(),
        from.x, from.y, // from
        data.x, data.y) // to
    );
    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasEvent == 'function')
        listener.onCanvasEvent("move-" + node.data('type'), data);
    });
  }

  onCanvasNodeMoveGroup(node, nodes) {
    let eventListeners = this.eventListeners;
    let action = this.toolbar.getAction();
    action.push(new MoveGroup(nodes));
    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasEvent == 'function')
        listener.onCanvasEvent("move-node-group", nodes);
    });
  }

  onCanvasNodeConnect(fEdge, tEdge) {

    this.toolbar.action.push(new Connect(fEdge, tEdge));
    let eventListeners = this.eventListeners;
    eventListeners.forEach(listener => { 
      if (listener != null && typeof listener.onCanvasEvent == 'function') {
        if (fEdge != null) {
          if (fEdge.target == tEdge.target)
            listener.onCanvasEvent("reconnect-" + tEdge.type, tEdge);
          else listener.onCanvasEvent("change-connect-" + tEdge.type, {
            from: fEdge,
            to: tEdge
          });
        } else
          listener.onCanvasEvent("connect-" + tEdge.type, tEdge);
      }
    });
  }

  onCanvasNodeDisconnect(fEdge) {

    if (fEdge == null) return;
    this.toolbar.action.push(new Disconnect(fEdge, null));
    let eventListeners = this.eventListeners;
    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasEvent == 'function')
        listener.onCanvasEvent("disconnect-" + fEdge.type, fEdge);
    });
  }

  onCanvasToolEvent(event, data) {

    switch (event) {
      case 'hover-in':
        let tool = data;
        this.canvasToolTooltip.show(tool, tool.label);
        break;
      case 'hover-out':
        this.canvasToolTooltip.hide();
        break;
    }
  }

  onCanvasToolClicked(tool, node) {
    let appCanvas = this;
    this.canvasToolTooltip.fadeOut(20);
    let canvasTool = this.canvasTool;
    let toolbar = this.toolbar;
    let eventListeners = this.eventListeners;
    let eventHandledByListener = false;

    eventListeners.forEach(listener => {
      if (listener != null && typeof listener.onCanvasToolClicked == 'function')
        eventHandledByListener = listener.onCanvasToolClicked(tool, node)
    });

    if (typeof tool.onToolClicked == 'function') tool.onToolClicked(this, node)

    if (eventHandledByListener) return;
    switch (tool.type) { 
      case 'create-link':
      case 'create-concept':
        appCanvas.floatingCreateTool.show(tool);
        appCanvas.canvasTool.clear();
        break;
      case 'switch-direction':
        this.switchDirection(node.id());
        toolbar.action.push(new SwitchDirection(node.id()));

        let es = node.connectedEdges();
        let snode = null;
        let tnode = null;

        es.toArray().forEach(e => {
          switch (e.data('type')) {
            case 'left':
              snode = this.cy.nodes('[id="' + e.data('target') + '"]').json();
              break;
            case 'right':
              tnode = this.cy.nodes('[id="' + e.data('target') + '"]').json();
          }
        })

        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function')
            listener.onCanvasEvent("switch-direction", {
              id: node.id(),
              name: node.data('name'),
              from: {
                snode: {
                  id: tnode.data.id,
                  name: tnode.data.name
                },
                tnode: {
                  id: snode.data.id,
                  name: snode.data.name
                }
              },
              to: {
                snode: {
                  id: snode.data.id,
                  name: snode.data.name
                },
                tnode: {
                  id: tnode.data.id,
                  name: tnode.data.name
                }
              }
            });
        });
        break;
      case 'center-link':
        let edges = node.connectedEdges();
        if (edges.length != 2) break;
        let a = edges[0].target().position();
        let b = edges[1].target().position();
        let aId = (edges[0].target().data().id);
        let bId = (edges[1].target().data().id);
        if (aId != bId) {
          let from = {
            x: node.position().x,
            y: node.position().y
          };
          let to = {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
          };
          node.position(to);
          toolbar.action.push(new Move(node.id(),
              from.x, from.y, // from
              to.x, to.y) // to
          );
          canvasTool.clear();
          canvasTool.drawTool(node);
          canvasTool.drawHandle(node);
          eventListeners.forEach(listener => {
            if (listener != null && typeof listener.onCanvasEvent == 'function')
              listener.onCanvasEvent("center-link", {
                id: node.id(),
                name: node.data('name'),
                x: to.x,
                y: to.y
              });
          });
        }
        break;
      case 'edit-node':
        let canvas = this;
        this.modal.editNode(node, {
          action: 'Edit'
        }, function (value) {
          canvas.updateNode(node.id(), value);
          eventListeners.forEach(listener => {
            if (listener != null && typeof listener.onCanvasEvent == 'function')
              listener.onCanvasEvent("update-" + node.data('type') + "-name", {
                id: node.id(),
                value: value
              });
          });
        });
        break;
      case 'delete-node':
        let modalDialog = this.modal.dialog(appCanvas.l.get('delete-selected-node:') + node.data('name') + '"?', {
          width: 'narrow',
          'positive-callback': function () {
            /* Prepare Undo and Log */
            let nodeData = node.json();
            delete nodeData.classes;
            delete nodeData.grabbable;
            delete nodeData.locked;
            delete nodeData.removed;
            delete nodeData.selectable;
            delete nodeData.selected;
            delete nodeData.pannable;
            nodeData.position.x = parseInt(nodeData.position.x);
            nodeData.position.y = parseInt(nodeData.position.y);
            let cEdges = node.connectedEdges();
            let edgesData = [];
            for (let c = 0; c < cEdges.length; c++) {
              let cEdge = cEdges[c];
              let edgeData = {
                source: cEdge.data('source'),
                target: cEdge.data('target'),
                type: cEdge.data('type')
              }
              edgesData.push(edgeData);
            }

            toolbar.action.push(new Delete(nodeData, edgesData));

            node.remove();
            canvasTool.selectedLink = null;
            canvasTool.selectedConcept = null;
            canvasTool.selectedNode = null;
            canvasTool.clear();
            // broadcast event
            eventListeners.forEach(listener => {
              if (listener != null && typeof listener.onCanvasEvent == 'function')
                listener.onCanvasEvent("delete-" + nodeData.data.type, nodeData);
            });
            modalDialog.modal('hide');
          }
        });
        break;
      case 'delete-selected-nodes':
        let sNodes = this.cy.nodes(':selected');
        let names = '';
        let selectedNodeData = [];
        sNodes.forEach(sNode => {
          names += '&bull;&nbsp;' + sNode.data('type') + ': ' + sNode.data('name') + '<br>';
          selectedNodeData.push(sNode.data());
        });
        let deleteAllDialog =
          this.modal.dialog(appCanvas.l.get('delete-selected-nodes:') + '<br>' + names + '?', {
            width: 'narrow',
            'positive-callback': function () {
              // TODO: /* Prepare Undo and Log */
              let dEdges = [];
              let dNodes = [];
              sNodes.forEach(s => {
                let n = s.data();
                n.position = {
                  x: parseInt(s.position().x),
                  y: parseInt(s.position().y)
                }
                dNodes.push(n);
                let cEdges = s.connectedEdges();
                cEdges.forEach(cEdge => {
                  let edgeData = {
                    source: cEdge.data('source'),
                    target: cEdge.data('target'),
                    type: cEdge.data('type')
                  }
                  let exists = false;
                  for (let dEdge of dEdges) {
                    if (dEdge.source == edgeData.source &&
                      dEdge.target == edgeData.target &&
                      dEdge.type == edgeData.type) {
                      exists = true;
                      break;
                    }
                  };
                  if (!exists) dEdges.push(edgeData);
                })
              })
              toolbar.action.push(new DeleteGroup(dNodes, dEdges));
              sNodes.remove();
              canvasTool.selectedLink = null;
              canvasTool.selectedConcept = null;
              canvasTool.selectedNode = null;
              canvasTool.clear();
              // broadcast event
              eventListeners.forEach(listener => {
                if (listener != null && typeof listener.onCanvasEvent == 'function')
                  listener.onCanvasEvent("delete-node-group", selectedNodeData);
              });
              deleteAllDialog.modal('hide');
            }
          });
        break;
      case 'duplicate-node':
        let n = {
          group: "nodes",
          data: Object.assign(JSON.parse(JSON.stringify(node.data())), {
            id: (node.data('type') == 'concept' ?
              "c-" + this.getConceptId() :
              "l-" + this.getLinkId())
          }),
          position: {
            x: parseInt(node.position('x')) + node.outerWidth() + 15,
            y: parseInt(node.position('y')) // + node.outerHeight() / 2) + 10
          }
        };
        let nnode = this.cy.add(n);

        // Prepare Log Data and Undo Command
        let fromNode = node.json();
        let nodeData = nnode.json(); // console.log(nodeData);
        toolbar.action.push(new Duplicate(n)); // Set Undo Command
        eventListeners.forEach(listener => {
          if (listener != null && typeof listener.onCanvasEvent == 'function')
            listener.onCanvasEvent("duplicate-" + node.data('type'), {
              from: {
                data: fromNode.data,
                position: fromNode.position,
                group: fromNode.group
              },
              node: {
                data: nodeData.data,
                position: nodeData.position,
                group: nodeData.group
              },
            });
        });

        break;
      default:
        break;
    }
    // let eventListeners = this.eventListeners;

  }


  // UI Alteration

  enableNodeCreation(enabled) {
    this.toolbar.enableNodeCreation(enabled);
    this.canvasTool.enableNodeCreationTools(enabled);
  }

}