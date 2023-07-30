class KitBuildCanvasTool {
  constructor(canvas, options) {
    // console.warn(options)
    this.canvas = canvas;
    this.settings = Object.assign(
      {
        type: "button", // 'button' | 'handle'
        showOn: KitBuildCanvasTool.SH_LINK,
        bgColor: "#ffffff",
        bdColor: "#777777cc",
        color: "#777777",
        bdRadius: 12,
        size: 36,
        margin: 8,
        alpha: 0.7,
        thickness: 4,
        radius: {
          tl: 12,
          tr: 12,
          br: 12,
          bl: 12,
        },
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>',
        toolPos: null,
        enabled: true,
      },
      options
    );
    this.gridPos = Object.assign(
      { x: 0, y: 0 },
      options ? options.gridPos : null
    );
    // this.toolPos = options.toolPos ? options.toolPos : this.settings.toolPos
    this.toolPos = this.settings.toolPos;
    this.eventListeners = new Map();
    this.evtListeners = new Set();
  }

  attachEventListener(id, listener) {
    return this.eventListeners.set(id, listener);
  }

  detachEventListener(id, listener) {
    return this.eventListeners.delete(id);
  }

  broadcastEvent(event, data, options) {
    // console.warn(this);
    this.eventListeners.forEach((listener, k, map) => {
      if (listener != null && typeof listener.onCanvasToolEvent == "function")
        listener.onCanvasToolEvent(this.canvas.canvasId, event, data, options);
    });
    this.evtListeners.forEach((listener) =>
      listener(this.canvas.canvasId, event, data, options)
    );
  }

  on(what, listener) {
    switch (what) {
      case "event":
        if (typeof listener == "function") this.evtListeners.add(listener);
        break;
    }
  }

  off(what, listener) {
    switch (what) {
      case "event":
        this.evtListeners.delete(listener);
        break;
    }
  }


  // default showOn wrapper 
  // when tool/app overrides showOn()
  _showOn(what) { 
    return what & this.settings.showOn
  }

  showOn(what, node) {
    return this._showOn(what);
  }

  showOnMulti(concepts, edges) {
    return true;
  }

  // Check if a position is hit by this tool area
  hit(position) {
    // {x: int y: int}
    // console.log(this.toolPos, position)
    if (!this.toolPos || !position) return false;
    let hit =
      position.x >= this.toolPos.x - this.settings.size / 2 &&
      position.x <= this.toolPos.x + this.settings.size / 2 &&
      position.y >= this.toolPos.y - this.settings.size / 2 &&
      position.y <= this.toolPos.y + this.settings.size / 2;
    // console.log(hit, position, this.toolPos)
    return hit;
  }

  action(event, e, node) {
    console.warn("Tool action for single element is not implemented", e, node);
  }

  actionMulti(event, e, node) {
    console.warn(
      "Tool action for multiple elements is not implemented",
      e,
      node
    );
  }

  // tool canvas event listeners

  onMount(e) {}
  preRender(e) {}
}

KitBuildCanvasTool.LEFT_HANDLE    = "left-handle";
KitBuildCanvasTool.RIGHT_HANDLE   = "right-handle";
KitBuildCanvasTool.DELETE         = "delete";
KitBuildCanvasTool.DUPLICATE      = "duplicate";
KitBuildCanvasTool.EDIT           = "edit";
KitBuildCanvasTool.SWITCH         = "switch";
KitBuildCanvasTool.DISCONNECT     = "disconnect";
KitBuildCanvasTool.CENTROID       = "centroid";
KitBuildCanvasTool.CREATE_CONCEPT = "create-concept";
KitBuildCanvasTool.CREATE_LINK    = "create-link";
KitBuildCanvasTool.LOCK           = "lock";
KitBuildCanvasTool.UNLOCK         = "unlock";
KitBuildCanvasTool.FOCUS          = "focus";
KitBuildCanvasTool.PROPOSITION    = "proposition";
KitBuildCanvasTool.PROPAUTHOR     = "propauthor";

KitBuildCanvasTool.SH_NONE        = 0;
KitBuildCanvasTool.SH_CONCEPT     = 1;
KitBuildCanvasTool.SH_LINK        = 2;
KitBuildCanvasTool.SH_EDGE        = 4;
KitBuildCanvasTool.SH_MULTI       = 8;
KitBuildCanvasTool.SH_CONTEXT     = 16;

class KitBuildLeftHandleTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          type: "handle",
          which: "left",
          showOn: KitBuildCanvasTool.SH_LINK,
          bgColor: "#ffb5b8",
          bdColor: "#EE2222",
          color: "#000",
          iconUnidirectional:
            '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="currentColor" class="bi bi-arrow-right" viewBox="-3 -3 22 22"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>',
          iconBidirectional:
            '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="currentColor" class="bi bi-arrow-right" viewBox="-3 -3 22 22"><circle cx="8" cy="8" r="4"/></svg>',
          icon: null,
        },
        options
      )
    );
    this.settings.icon =
      canvas.direction == KitBuildCanvas.BIDIRECTIONAL
        ? this.settings.iconBidirectional
        : this.settings.iconUnidirectional;
    this.settings.color =
      canvas.direction == KitBuildCanvas.BIDIRECTIONAL
        ? this.settings.bdColor
        : "#000000";
    this.assignedTo = null;
  }
  action() {}
}

class KitBuildRightHandleTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          type: "handle",
          which: "right",
          showOn: KitBuildCanvasTool.SH_LINK,
          bgColor: "#a6efff",
          bdColor: "#5BC0EB",
          color: "#000",
          iconUnidirectional:
            '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="currentColor" class="bi bi-arrow-right" viewBox="-3 -3 22 22"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>',
          iconBidirectional:
            '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" fill="currentColor" class="bi bi-arrow-right" viewBox="-3 -3 22 22"><circle cx="8" cy="8" r="4"/></svg>',
          icon: null,
        },
        options
      )
    );
    this.settings.icon =
      canvas.direction == KitBuildCanvas.BIDIRECTIONAL
        ? this.settings.iconBidirectional
        : this.settings.iconUnidirectional;
    this.settings.color =
      canvas.direction == KitBuildCanvas.BIDIRECTIONAL
        ? this.settings.bdColor
        : "#000000";
    this.assignedTo = null;
  }
  action() {}
}

class KitBuildDeleteTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK | KitBuildCanvasTool.SH_CONCEPT,
          bgColor: "#FFFFFF",
          color: "#FF0000",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="-4 -4 24 24"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>',
        },
        options
      )
    );
  }

  showOn(what, node) {
    return super.showOn(what, node) && node.data("lock") != "locked";
  }

  action(event, e, node) {
    if (!node) return;
    // KitBuildUI.confirm("Delete node?").then(() => {
    let data = node.union(node.connectedEdges()).jsons();
    let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
    if (undoRedo)
      undoRedo.post("delete-node", {
        undoData: data,
        redoData: node.id(),
        undo: () => {
          this.canvas.cy.add(data);
          data.forEach((e) => {
            if (!e.selected) return;
            this.canvas.cy.elements(`#${e.data.id}`).trigger("select");
          });
        },
        redo: () => this.canvas.cy.elements(`#${node.id()}`).remove(),
      });
    node.remove();
    this.broadcastEvent(`delete-${node.data("type")}`, data);
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
    // })
  }

  actionMulti(event, e, nodes) {
    // console.log(arguments)
    nodes.unselectify();
    KitBuildUI.confirm(
      `Do you want to delete all ${nodes.length} selected<br>concepts and/or links?`
    )
      .then(() => {
        nodes.selectify();
        // console.error(nodes, nodes.not(`[lock="locked"]`), nodes.not(`[lock="locked"]`).union(nodes.not(`[lock="locked"]`).connectedEdges()));
        let unlockedNodes = nodes.not(`[lock="locked"]`);
        let nodesAndEdgesJson = unlockedNodes
          .union(unlockedNodes.connectedEdges())
          .jsons();
        let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
        if (undoRedo)
          undoRedo.post("delete-multi-nodes", {
            undoData: nodesAndEdgesJson,
            redoData: nodesAndEdgesJson,
            undo: (canvas, data) => {
              canvas.cy.add(data);
              canvas.applyElementStyle();
            },
            redo: (canvas, data) => {
              let ids = [];
              data.forEach((n) => ids.push(`#${n.data.id}`));
              canvas.cy.elements(ids.join()).remove();
            },
          });
        this.broadcastEvent(`delete-multi-nodes`, nodesAndEdgesJson);
        unlockedNodes.remove();
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
      })
      .catch(() => {
        nodes.selectify();
        this.canvas.canvasTool.clearCanvas();
        this.canvas.canvasTool.clearIndicatorCanvas();
        this.canvas.canvasTool.drawSelectedNodesBoundingBox(e);
      });
  }
}

class KitBuildDuplicateTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK | KitBuildCanvasTool.SH_CONCEPT,
          color: "#000",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-subtract" viewBox="-5 -5 26 26"><path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/></svg>',
        },
        options
      )
    );
  }

  action(event, e, node) {
    // console.error("ACTION DUPLICATE")
    if (!node) return;
    node.unselect();
    let duplicate = node.json();
    duplicate.data.id =
      node.data("type") == "concept"
        ? "c" + this.canvas.getNextConceptId()
        : "l" + this.canvas.getNextLinkId();
    // console.warn(duplicate)
    let duplicateNode = this.canvas.cy.add(duplicate).removeData("lock");
    this.canvas.applyElementStyle();
    let newPos = this.canvas.toolbar.tools
      .get(KitBuildToolbar.NODE_CREATE)
      .placement(duplicateNode);
    setTimeout(() => {
      this.activeNode = duplicateNode;
      duplicateNode.position(newPos).select().trigger("select");
      this.canvas.canvasTool.clearIndicatorCanvas();
      this.broadcastEvent(
        `duplicate-${node.data("type")}`,
        duplicateNode.json()
      );
      let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
      if (undoRedo)
        undoRedo.post(`duplicate-${node.data("type")}`, {
          undoData: duplicateNode.json(),
          redoData: duplicateNode.json(),
          undo: (canvas, data) =>
            this.canvas.cy.nodes(`#${data.data.id}`).remove(),
          redo: (canvas, data) => {
            this.canvas.cy.add(data);
            this.canvas.applyElementStyle();
          },
        });
    }, 50);
  }

  actionMulti(event, e, nodes) {
    // console.log(nodes.length);
    if (!nodes) return;
    let duplicates = nodes.unselect().jsons();
    let duplicateNodes = [];
    duplicates.forEach((duplicate) => {
      // only duplicate concepts and links
      if (!["concept", "link"].includes(duplicate.data.type)) return;
      duplicate.data.id =
        duplicate.data.type == "concept"
          ? "c" + this.canvas.getNextConceptId()
          : "l" + this.canvas.getNextLinkId();
      duplicateNodes.push(this.canvas.cy.add(duplicate));
    });
    this.canvas.applyElementStyle();
    let ids = [];
    duplicateNodes.forEach((duplicateNode) => {
      let newPos = this.canvas.toolbar.tools
        .get(KitBuildToolbar.NODE_CREATE)
        .placement(duplicateNode);
      duplicateNode.position(newPos);
      ids.push(`#${duplicateNode.id()}`);
      setTimeout(() => {
        duplicateNode.select().trigger("select");
        this.canvas.canvasTool.clearIndicatorCanvas();
      }, 10);
    });
    this.activeNode = null;
    let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
    if (undoRedo)
      undoRedo.post("duplicate-multi-nodes", {
        undoData: ids,
        redoData: this.canvas.cy.nodes(ids.join(", ")).jsons(),
        undo: (canvas, data) => canvas.cy.nodes(data.join(", ")).remove(),
        redo: (canvas, data) => canvas.cy.add(data),
      });
    this.broadcastEvent(
      `duplicate-nodes`,
      this.canvas.cy.nodes(ids.join(", ")).jsons()
    );
  }
}

class KitBuildEditTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK | KitBuildCanvasTool.SH_CONCEPT,
          color: "#000", // "#d97511",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-4 -4 24 24"><path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.52h4.082v-.52c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479L12.258 3z"/></svg>',
        },
        options
      )
    );
  }

  showOn(what, node) {
    return super.showOn(what, node) && node.data("lock") != "locked";
  }

  action(event, e, node) {
    let n = {
      id: node.id(),
      label: node.data("label"),
      type: node.data("type"),
    };
    this.canvas.toolbar.tools
      .get(KitBuildToolbar.NODE_CREATE)
      .showCreateDialog(node.data("type"), n);
  }
}

class KitBuildSwitchTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK,
          color: "#000", // "#d97511",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-6 -6 28 28">  <path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"/></svg>',
        },
        options
      )
    );
  }

  showOn(what, node) {
    // console.log(node)
    if (!node) return;
    let left =
      node.connectedEdges('[type="left"]').not('[lock="locked"]').length == 1;
    let right =
      node.connectedEdges('[type="right"]').not('[lock="locked"]').length == 1;
    return super.showOn(what, node) && left && right;
  }

  action(event, e, node) {
    node.lock().unselectify();
    let left = node.connectedEdges('[type="left"]')[0];
    let right = node.connectedEdges('[type="right"]')[0];
    let source = left.target().id();
    let target = right.target().id();
    let edges = this.canvas.cy.add([
      {
        group: "edges",
        data: {
          source: node.id(),
          target: target,
          type: "left",
        },
      },
      {
        group: "edges",
        data: {
          source: node.id(),
          target: source,
          type: "right",
        },
      },
    ]);

    let data = {
      prior: [left.json(), right.json()],
      later: edges.jsons(),
    };

    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post(
        "switch-direction",
        UndoRedoSwitch.instance({
          undoData: data,
          redoData: data,
        })
      );
    this.broadcastEvent(`switch-direction`, data);

    left.remove();
    right.remove();

    setTimeout(() => node.unlock().selectify().trigger("select"), 50);
  }
}

class KitBuildDisconnectTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK | KitBuildCanvasTool.SH_CONCEPT,
          color: "#cc0000",
          icon: '<svg width="16pt" height="16pt" viewBox="-4 -4 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path id="3" d="m2.7 3.4c4.1 4.1 5.7 5.7 9.8 9.8l0.71-0.71c-4.1-4.1-5.7-5.7-9.8-9.8l-0.71 0.71z"/><path id="5" d="m13 2.4c-1.1-7.1e-4 -2.2-0.0014-3.4-0.0021-0.65 0.03-0.65-1 6.3e-4 -1 1.5 9.5e-4 3 0.0019 4.6 0.0029 0.15-0.0071 0.27 0.048 0.35 0.13 0.095 0.081 0.16 0.2 0.15 0.36 0 1.6-0.014 3-0.014 4.6 0.03 0.65-1 0.65-1 0 0-1.2 0.014-2.2 0.014-3.4-1.4 1.4-2.8 2.8-4.3 4.3-0.24-0.24-0.47-0.47-0.71-0.71 1.4-1.4 2.8-2.8 4.2-4.2z"/><path id="7" d="m1.5 14c-0.48 0.44 0.27 1.2 0.71 0.71l2.3e-4 -3e-4c1.7-1.7 3.4-3.4 5.1-5.1-0.24-0.24-0.47-0.47-0.71-0.71"/></svg>',
          gridPos: { x: -1, y: 1 },
        },
        options
      )
    );
  }

  showOn(what, node) {
    // console.log(node)
    if (!node) return;
    return (
      super.showOn(what, node) && node.connectedEdges('[lock!="locked"]').length
    );
  }

  onMount(e) {
    // console.log(e)
    this.gridPos.x = -1;
    if (
      e.activeTools.some((t) => {
        return (
          t.gridPos.x == -1 &&
          t.gridPos.y == 1 &&
          !(t instanceof KitBuildDisconnectTool)
        );
      })
    )
      this.gridPos.x = -2;
  }

  action(event, e, node) {
    // console.warn(event, e, node)
    if (!node) return;
    let edges = node.connectedEdges('[lock!="locked"]');
    edges.remove();
    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post("disconnect-links", {
        undoData: edges.jsons(),
        redoData: edges.jsons(),
        undo: (canvas, data) => canvas.cy.add(data),
        redo: (canvas, data) => {
          let ids = [];
          data.forEach((e) => ids.push(`#${e.data.id}`));
          canvas.cy.edges(ids.join(", ")).remove();
        },
      });
    this.broadcastEvent(`disconnect-links`, edges.jsons());
  }
}

class KitBuildCentroidTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK,
          color: "#000", // "#d97511",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-6 -6 28 28"><path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/></svg>',
        },
        options
      )
    );
  }

  showOn(what, node) {
    return super.showOn(what, node) && node.connectedEdges().length > 1;
  }

  action(event, e, node) {
    // console.log("ACTION")
    node.unselectify();
    this.canvas.canvasTool.clearCanvas();
    let concepts = node.neighborhood('[type="concept"]');
    let from = Object.assign({}, node.position());
    from.x |= 0;
    from.y |= 0;
    from.id = node.id();
    let to = KitBuildCanvas.getCentroidPosition(concepts);
    to.x |= 0;
    to.y |= 0;
    to.id = node.id();
    let data = { from: from, to: to };
    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post(
        "centroid",
        UndoRedoCentroid.instance({
          id: node.id(),
          undoData: data,
          redoData: data,
        })
      );
    this.broadcastEvent(`centroid`, data);
    node.animate({
      position: data.to,
      duration: 300,
      complete: () => {
        setTimeout(() => {
          node.unlock().selectify().trigger("select");
          this.canvas.canvasTool.clearIndicatorCanvas();
        }, 50);
      },
    });
  }
}

class KitBuildCreateConceptTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_CONTEXT,
          color: "#d97511", // "#d97511",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-4 -4 24 24"><path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6zM5 1a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V5a4 4 0 0 0-4-4H5z"/></svg>',
          gridPos: { x: -1, y: 0 },
          toolPos: { x: 0, y: 0 },
        },
        options
      )
    );
    this.contextPosition = { x: 0, y: 0 };
    this.contextRenderedPosition = { x: 0, y: 0 };
  }

  action(event, e, node) {
    // console.log("ACTION")
    let nodeCreateTool = this.canvas.toolbar.tools.get("node-create");
    let content = "";
    let backgroundColor = nodeCreateTool ? nodeCreateTool.color : "transparent";
    let color = nodeCreateTool
      ? nodeCreateTool.textColor(backgroundColor)
      : "#000000";
    // console.log(backgroundColor, color);
    let floatingLabel = `<form class="kb-floating-label position-absolute border rounded d-flex align-items-center justify-content-center" style="width: 180px; height: 64px; background-color: ${backgroundColor}; color: ${color};"><input class="kb-node-label text-center border-0 flex-fill" value="${content}" style="background-color:transparent; height:100%;  color: ${color};"></form>`;
    $(".kb-floating-label").remove();
    $(floatingLabel)
      .appendTo("body")
      .css(
        "top",
        $(`#${this.canvas.canvasId}`).offset().top +
          this.contextRenderedPosition.y -
          $(floatingLabel).outerHeight() / 2
      )
      .css(
        "left",
        $(`#${this.canvas.canvasId}`).offset().left +
          this.contextRenderedPosition.x -
          $(floatingLabel).outerWidth() / 2
      )
      .on("submit", (e) => {
        e.preventDefault();
        if ($(".kb-node-label").val().trim().length != 0)
          this.createConcept(
            $(".kb-node-label").val(),
            backgroundColor,
            this.contextPosition
          );
        $(".kb-floating-label").remove();
      });
    $(".kb-node-label")
      .focus()
      .select()
      .off("focusout")
      .on("focusout", (e) => {
        e.preventDefault();
        if ($(e.target).val().trim().length != 0)
          this.createConcept(
            $(e.target).val(),
            backgroundColor,
            this.contextPosition
          );
        $(".kb-floating-label").remove();
      });
  }

  createConcept(label, backgroundColor, position) {
    let nodeCreateTool = this.canvas.toolbar.tools.get("node-create");
    let nodeDef = nodeCreateTool.composeNode({
      type: "concept",
      label: label,
      "background-color": backgroundColor,
      position: position,
    });
    // console.log(nodeDef)
    let node = this.canvas.cy.add(nodeDef);
    this.canvas.applyElementStyle();
    let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
    if (undoRedo)
      undoRedo.post(`create-${node.data("type")}`, {
        undoData: `#${node.id()}`,
        redoData: node.json(),
        undo: (canvas, data) => {
          canvas.cy.nodes(data).remove();
        },
        redo: (canvas, data) => {
          canvas.cy.add(data);
        },
      });
    this.broadcastEvent(`create-${node.data("type")}`, node.json());
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
    setTimeout(() => node.select().trigger("select"), 10);
  }
}

class KitBuildCreateLinkTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_CONTEXT,
          color: "#777", // "#d97511",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-1 -1 19 18"><path d="m12 7.5v-1.5c-0.0015-0.83-0.67-1.5-1.5-1.5h-4.1c-0.83 0.0015-1.5 0.67-1.5 1.5v1.5h-2.7v1h2.7v1.5c0.0015 0.83 0.67 1.5 1.5 1.5h4.1c0.83-0.0015 1.5-0.67 1.5-1.5v-1.5h2.7v-1h-2.7zm-1 2.5c0.0014 0.27-0.23 0.5-0.5 0.5h-4.1c-0.27 0.0014-0.5-0.23-0.5-0.5v-4.1c-0.0015-0.27 0.23-0.5 0.5-0.5h4.1c0.27-0.0015 0.5 0.23 0.5 0.5v4.1z"/></svg>',
          gridPos: { x: 1, y: 0 },
        },
        options
      )
    );
    this.contextPosition = { x: 0, y: 0 };
    this.contextRenderedPosition = { x: 0, y: 0 };
  }

  action(event, e, node) {
    // console.log("ACTION")
    let nodeCreateTool = this.canvas.toolbar.tools.get("node-create");
    let content = "";
    let backgroundColor = nodeCreateTool
      ? nodeCreateTool.settings.defaultLinkColor
      : "#dedede";
    let floatingLabel = `<form class="kb-floating-label position-absolute border rounded d-flex align-items-center justify-content-center" style="width: 180px; height: 64px; background-color: ${backgroundColor}"><input class="kb-node-label text-center border-0 flex-fill" value="${content}" style="background-color:transparent; height:100%"></form>`;
    $(".kb-floating-label").remove();
    $(floatingLabel)
      .appendTo("body")
      .css(
        "top",
        $(`#${this.canvas.canvasId}`).offset().top +
          this.contextRenderedPosition.y -
          $(floatingLabel).outerHeight() / 2
      )
      .css(
        "left",
        $(`#${this.canvas.canvasId}`).offset().left +
          this.contextRenderedPosition.x -
          $(floatingLabel).outerWidth() / 2
      )
      .on("submit", (e) => {
        e.preventDefault();
        if ($(".kb-node-label").val().trim().length != 0)
          this.createLink(
            $(".kb-node-label").val(),
            backgroundColor,
            this.contextPosition
          );
        $(".kb-floating-label").remove();
      });
    $(".kb-node-label")
      .focus()
      .select()
      .off("focusout")
      .on("focusout", (e) => {
        e.preventDefault();
        if ($(e.target).val().trim().length != 0)
          this.createLink(
            $(e.target).val(),
            backgroundColor,
            this.contextPosition
          );
        $(".kb-floating-label").remove();
      });
  }

  createLink(label, backgroundColor, position) {
    let nodeCreateTool = this.canvas.toolbar.tools.get("node-create");
    let nodeDef = nodeCreateTool.composeNode({
      type: "link",
      label: label,
      "background-color": backgroundColor,
      position: position,
    });
    // console.log(nodeDef)
    let node = this.canvas.cy.add(nodeDef);
    let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO);
    if (undoRedo)
      undoRedo.post(`create-${node.data("type")}`, {
        undoData: `#${node.id()}`,
        redoData: node.json(),
        undo: (canvas, data) => {
          canvas.cy.nodes(data).remove();
        },
        redo: (canvas, data) => {
          canvas.cy.add(data);
        },
      });
    this.broadcastEvent(`create-${node.data("type")}`, node.json());
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
    setTimeout(() => node.select().trigger("select"), 10);
  }
}

class KitBuildLockTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_EDGE,
          color: null, // "#d97511",
          colorLock: "#cc0000",
          colorUnlock: "#2e908c",
          iconLock:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-5 -5 26 26"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>',
          iconUnlock:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-5 -5 26 26"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/></svg>',
          gridPos: { x: 0, y: -1 },
        },
        options
      )
    );
    this.changeState("lock");
  }

  changeState(st = "lock") {
    this.settings.color =
      st == "lock" ? this.settings.colorLock : this.settings.colorUnlock;
    this.settings.icon =
      st == "lock" ? this.settings.iconLock : this.settings.iconUnlock;
    this.state = st;
  }

  onMount(e) {
    if (e.target.isEdge && e.target.isEdge()) {
      // console.log(this, e.target.data('lock'))
      if (e.target.data("lock") == "locked") this.changeState("unlock");
      else this.changeState("lock");
    }
  }

  showOnMulti(concepts, edges) {
    return edges.length;
  }

  actionMulti(event, e, elements) {
    // console.log("ACTION", nodes, this.state)
    elements.unselectify();
    let edges = elements.filter("edge").data("lock", "locked");
    this.canvas.canvasTool.clearIndicatorCanvas();
    let ids = [];
    edges.forEach((e) => ids.push(`#${e.id()}`));
    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post(`lock-edges`, {
        undoData: { edges: ids, lock: "unlocked" },
        redoData: { edges: ids, lock: "locked" },
        undo: (canvas, data) =>
          canvas.cy
            .edges(data.edges.join(", "))
            .data("lock", data.lock)
            .source()
            .trigger("select"),
        redo: (canvas, data) =>
          canvas.cy
            .edges(data.edges.join(", "))
            .data("lock", data.lock)
            .source()
            .trigger("select"),
      });
    this.broadcastEvent(`lock-edges`, edges.jsons());
  }

  action(event, e, nodes) {
    // console.log(event, e, nodes)
    this.canvas.cy.elements(":selected").unselectify();
    let edge = this.canvas.cy
      .edges(":selected")
      .data("lock", this.state == "lock" ? "locked" : "unlocked");
    let redoData = { id: edge.id(), lock: edge.data("lock") };
    let undoData = {
      id: edge.id(),
      lock: edge.data("lock") == "locked" ? "unlocked" : "locked",
    };
    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post(this.state, {
        undoData: undoData,
        redoData: redoData,
        undo: (canvas, data) =>
          canvas.cy
            .edges(`#${data.id}`)
            .data("lock", data.lock)
            .source()
            .trigger("select"),
        redo: (canvas, data) =>
          canvas.cy
            .edges(`#${data.id}`)
            .data("lock", data.lock)
            .source()
            .trigger("select"),
      });
    this.broadcastEvent(`${this.state}-edge`, redoData);
    setTimeout(() => {
      this.canvas.canvasTool.clearIndicatorCanvas();
      edge.selectify().source().unlock().selectify().trigger("select");
    }, 20);
  }
}

class KitBuildUnlockTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_MULTI,
          color: "#2e908c",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-5 -5 26 26"><path d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/></svg>',
          gridPos: { x: 1, y: 0 },
        },
        options
      )
    );
  }

  showOnMulti(concepts, edges) {
    return edges.length;
  }

  actionMulti(event, e, elements) {
    // console.log("ACTION", nodes)
    elements.unselectify();
    let edges = elements.filter("edge").data("lock", "unlocked");
    this.canvas.canvasTool.clearIndicatorCanvas();
    let ids = [];
    edges.forEach((e) => ids.push(`#${e.id()}`));
    let undoRedo = this.canvas.canvasTool.getToolbarTool(
      KitBuildToolbar.UNDO_REDO
    );
    if (undoRedo)
      undoRedo.post("unlock-edges", {
        undoData: { edges: ids, lock: "locked" },
        redoData: { edges: ids, lock: "unlocked" },
        undo: (canvas, data) =>
          canvas.cy
            .edges(data.edges.join(", "))
            .data("lock", data.lock)
            .source()
            .trigger("select"),
        redo: (canvas, data) =>
          canvas.cy
            .edges(data.edges.join(", "))
            .data("lock", data.lock)
            .source()
            .trigger("select"),
      });
    this.broadcastEvent(`unlock-edges`, edges.jsons());
  }
}

class KitBuildFocusTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_LINK,
          color: "#f0ad4e",
          colorHide: "#dc3545",
          colorShow: "#198754",
          iconHide:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="-4 -4 24 24"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/></svg>',
          iconShow:
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="-4 -4 24 24"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>',
          gridPos: { x: -1, y: -1 },
        },
        options
      )
    );
    this.changeState("show");
  }

  changeState(st = "show") {
    this.settings.icon =
      st == "show" ? this.settings.iconHide : this.settings.iconShow;
    this.settings.color =
      st == "show" ? this.settings.colorHide : this.settings.colorShow;
    this.state = st;
  }

  action(event, e, nodes) {
    // console.log(event, e, nodes)
    if (this.state == "show") {
      this.canvas.cy
        .elements()
        .not(nodes.neighborhood())
        .not(nodes)
        .lock()
        .unselectify()
        .panify()
        .addClass("hide");
      this.changeState("hide");
      return;
    }
    this.canvas.cy
      .elements()
      .not(nodes.neighborhood())
      .not(nodes)
      .unlock()
      .selectify()
      .removeClass("hide")
      .filter("node")
      .unpanify();
    this.changeState("show");
    return;
  }
}

class KitBuildPropositionTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_EDGE,
          color: "#5069c7",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bezier" viewBox="-4 -4 24 24"><path fill-rule="evenodd" d="M0 10.5A1.5 1.5 0 0 1 1.5 9h1A1.5 1.5 0 0 1 4 10.5v1A1.5 1.5 0 0 1 2.5 13h-1A1.5 1.5 0 0 1 0 11.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm10.5.5A1.5 1.5 0 0 1 13.5 9h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM6 4.5A1.5 1.5 0 0 1 7.5 3h1A1.5 1.5 0 0 1 10 4.5v1A1.5 1.5 0 0 1 8.5 7h-1A1.5 1.5 0 0 1 6 5.5v-1zM7.5 4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"/><path d="M6 4.5H1.866a1 1 0 1 0 0 1h2.668A6.517 6.517 0 0 0 1.814 9H2.5c.123 0 .244.015.358.043a5.517 5.517 0 0 1 3.185-3.185A1.503 1.503 0 0 1 6 5.5v-1zm3.957 1.358A1.5 1.5 0 0 0 10 5.5v-1h4.134a1 1 0 1 1 0 1h-2.668a6.517 6.517 0 0 1 2.72 3.5H13.5c-.123 0-.243.015-.358.043a5.517 5.517 0 0 0-3.185-3.185z"/></svg>',
          gridPos: { x: 0, y: -1 },
        },
        options
      )
    );
  }

  action(event, e, nodes) {
    // console.error(event, e, nodes);
    this.canvas.cy.elements(":selected").unselectify();
    let edge = this.canvas.cy.edges(":selected");
    this.broadcastEvent(`proposition-edge-tool-clicked`, edge.data());
    setTimeout(() => {
      this.canvas.canvasTool.clearIndicatorCanvas();
      edge.selectify().source().unlock().selectify().trigger("select");
    }, 20);
    return;
  }
}

class KitBuildPropositionAuthorTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_EDGE,
          color: "#24b381",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="-4 -4 24 24"><path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/><path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>',
          gridPos: { x: 1, y: -1 },
        },
        options
      )
    );
  }

  showOn(what, node) {
    let edge = this.canvas.cy.edges(":selected")[0];
    if (!edge) return false;
    let data = edge.data(); 
    let type = data.type;
    return (what & KitBuildCanvasTool.SH_EDGE) && type == 'right';
  }

  action(event, e, nodes) {
    // console.error(event, e, nodes);
    this.canvas.cy.elements(":selected").unselectify();
    let edge = this.canvas.cy.edges(":selected");
    this.broadcastEvent(`proposition-author-tool-clicked`, edge.data());
    setTimeout(() => {
      this.canvas.canvasTool.clearIndicatorCanvas();
      edge.selectify().source().unlock().selectify().trigger("select");
    }, 20);
    return;
  }
}

class KitBuildTextSelectionTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_CONCEPT | KitBuildCanvasTool.SH_LINK,
          color: "#24b381",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-input-cursor-text" viewBox="-4 -4 24 24"><path fill-rule="evenodd" d="M5 2a.5.5 0 0 1 .5-.5c.862 0 1.573.287 2.06.566.174.099.321.198.44.286.119-.088.266-.187.44-.286A4.165 4.165 0 0 1 10.5 1.5a.5.5 0 0 1 0 1c-.638 0-1.177.213-1.564.434a3.49 3.49 0 0 0-.436.294V7.5H9a.5.5 0 0 1 0 1h-.5v4.272c.1.08.248.187.436.294.387.221.926.434 1.564.434a.5.5 0 0 1 0 1 4.165 4.165 0 0 1-2.06-.566A4.561 4.561 0 0 1 8 13.65a4.561 4.561 0 0 1-.44.285 4.165 4.165 0 0 1-2.06.566.5.5 0 0 1 0-1c.638 0 1.177-.213 1.564-.434.188-.107.335-.214.436-.294V8.5H7a.5.5 0 0 1 0-1h.5V3.228a3.49 3.49 0 0 0-.436-.294A3.166 3.166 0 0 0 5.5 2.5.5.5 0 0 1 5 2z"/><path d="M10 5h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4v1h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4v1zM6 5V4H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v-1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4z"/></svg>',
          gridPos: { x: 0, y: -1 },
        },
        options
      )
    );
    if (!options.element) console.warning('KitBuildSelectTextTool: Required selection element container selector is not set, e.g., #content');
    else {
      let el = $(options.element).get(0);
      $(options.element).on('mouseup', (e) => {
        let sel = this.saveSelection(el);
        this.broadcastEvent('select', {selection: sel, node: this.node ? this.node.data() : undefined});
      });
    }
  }

  action(event, e, nodes) {
    // console.error(event, e, nodes, this);
    this.node = nodes[0];
    let ss = this.node.data('selectStart');
    let se = this.node.data('selectEnd');
    this.broadcastEvent(`action`, {event: event, node: this.node.data(), start: ss, end: se});
    return;
  }

  saveSelection(containerEl) {
    var range = window.getSelection().getRangeAt(0);
    var preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    var start = preSelectionRange.toString().length;
    return {
      start: start,
      end: start + range.toString().length,
    };
  };

  restoreSelection(containerEl, savedSel) {
    var charIndex = 0,
      range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    var nodeStack = [containerEl],
      node,
      foundStart = false,
      stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType == 3) {
        var nextCharIndex = charIndex + node.length;
        if (
          !foundStart &&
          savedSel.start >= charIndex &&
          savedSel.start <= nextCharIndex
        ) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (
          foundStart &&
          savedSel.end >= charIndex &&
          savedSel.end <= nextCharIndex
        ) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        var i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
}

class KitBuildDistanceColorTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_CONCEPT,
          color: "#b32448",
          nearColor: "#00db63",
          farColor: "#b32448",
          range: 500,
          distanceReference: 300,
          useDistanceReference: true,
          useMagnet: true,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-input-cursor-text" viewBox="-6 -6 28 28"><path d="M15 12h-4v3h4v-3ZM5 12H1v3h4v-3ZM0 8a8 8 0 1 1 16 0v8h-6V8a2 2 0 1 0-4 0v8H0V8Z"/></svg>',
          gridPos: { x: 1, y: -1 },
        },
        options
      )
    );
  }

  showOn(what, node) {
    return super.showOn(what, node) & this.settings.useMagnet;
  }

  action(event, e, nodes) {
    // console.error(event, e, nodes, this);
    this.node = nodes[0];
    this.broadcastEvent(`action`, {node: this.node.data()});
    return;
  }

  distance(posA, posB) {
    return parseInt(Math.sqrt(Math.pow((posA.x - posB.x), 2) + Math.pow((posA.y - posB.y), 2)));
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  getColor(distanceCurrent, distanceReference, colorRange) {

    // get near and far color
    let near = colorRange ? colorRange.nearColor : this.settings.nearColor;
    let far = colorRange ? colorRange.farColor : this.settings.farColor;
    near = this.hexToRgb(near);
    far = this.hexToRgb(far);

    // normalize range value to 0~255 
    let distance = parseInt(((distanceCurrent - distanceReference) / this.settings.range) * 255);

    // truncate invalid distance
    if (distance < 0) distance = 0;
    if (distance > 255) distance = 255;

    // console.log(distance, distanceCurrent, distanceReference);
    let r = near.r + (distance * (far.r - near.r))/255;
    let g = near.g + (distance * (far.g - near.g))/255;
    let b = near.b + (distance * (far.b - near.b))/255;
    return this.rgbToHex(r, g, b);

  }

  showColor(node, conceptMap, canvas) {
    // get associated link of this concept.
    let cid = node.id();
    let lid = null;
    for(let lt of conceptMap.linktargets) {
      if (lt.target_cid == cid) lid = lt.lid;
    }
    if (lid == null) {
      for(let l of conceptMap.links) {
        if (l.source_cid == cid) lid = l.lid;
      } 
    }

    let distanceReference = 0; 
    if (this.settings.useDistanceReference) 
      distanceReference = this.settings.distanceReference;
    else {
      //calculate distance reference from goalmap
      let refLink = null;
      for(let l of conceptMap.links) {
        // console.warn(l, lid);
        if (l.lid == lid) refLink = l;
      }
      let refConcept = null;
      for(let c of conceptMap.concepts) {
        if (c.cid == cid) refConcept = c;
      }
      // console.error(refLink, refConcept);
      distanceReference = this.distance({
        x: parseInt(refLink.x),
        y: parseInt(refLink.y)
      },{
        x: parseInt(refConcept.x),
        y: parseInt(refConcept.y)
      });
    }

    let link = canvas.cy.nodes(`#${lid}`);
    let concept = node;
    let distance = this.distance({
      x: link.position().x,
      y: link.position().y
    },{
      x: concept.position().x,
      y: concept.position().y
    });
    let color = this.getColor(distance, distanceReference);
    // console.warn(node, color, distance, distanceReference);
    node.style('border-color', color);
    node.style('border-opacity', 1.0);
  }

}

class KitBuildBugTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(
      canvas,
      Object.assign(
        {
          showOn: KitBuildCanvasTool.SH_CONCEPT | KitBuildCanvasTool.SH_LINK,
          dialogContainerSelector: 'body',
          color: "#dc3545",
          width: '300px',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-input-cursor-text" viewBox="-6 -6 28 28">  <path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A4.979 4.979 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A4.985 4.985 0 0 1 13 6h.5a.5.5 0 0 0 .5-.5V5a.5.5 0 0 1 1 0v.5A1.5 1.5 0 0 1 13.5 7H13v1h1.5a.5.5 0 0 1 0 1H13v1h.5a1.5 1.5 0 0 1 1.5 1.5v.5a.5.5 0 1 1-1 0v-.5a.5.5 0 0 0-.5-.5H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 0-.5.5v.5a.5.5 0 1 1-1 0v-.5A1.5 1.5 0 0 1 2.5 10H3V9H1.5a.5.5 0 0 1 0-1H3V7h-.5A1.5 1.5 0 0 1 1 5.5V5a.5.5 0 0 1 1 0v.5a.5.5 0 0 0 .5.5H3c0-1.364.547-2.601 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623zM4 7v4a4 4 0 0 0 3.5 3.97V7H4zm4.5 0v7.97A4 4 0 0 0 12 11V7H8.5zM12 6a3.989 3.989 0 0 0-1.334-2.982A3.983 3.983 0 0 0 8 2a3.983 3.983 0 0 0-2.667 1.018A3.989 3.989 0 0 0 4 6h8z"/></svg>',
          gridPos: { x: -1, y: -1 },
        },
        options
      )
    );
    this.handleEvent();
  }

  action(event, e, nodes) {
    // console.error(event, e, nodes, this);
    this.node = nodes[0];
    this.broadcastEvent(`action`, {node: this.node.data()});
    return;
  }

  handleEvent() {
    $('#bug-dialog').on('click', '.bt-set-bug', (e) => {
      let bugLabel = $('#bug-dialog .input-bug-label').val();
      let correctLabel = $('#bug-dialog .input-correct-label').val();
      this.node.data('correct-label', correctLabel);
      this.node.data('bug-label', bugLabel);
      UI.info('Bug information has been set.').show();
      if (this.dialog) this.dialog.hide();
      // console.log(this.node.data(), correctLabel, bugLabel, this, this.dialog);
    });

    $('#bug-dialog').on('click', '.bt-remove-bug', (e) => {
      let correctLabel = this.node.data('correct-label');
      if (correctLabel) {
        $('#bug-dialog .input-correct-label').val(correctLabel);
        this.node.data('label', correctLabel);
      }
      $('#bug-dialog .input-bug-label').val('');
      this.node.removeData('correct-label bug-label');
      // console.log(this.node.data(), correctLabel);
    });
  }
}

class KitBuildCanvasToolCanvas {
  constructor(canvas, options) {
    // cache the Cytoscape canvas
    this.canvas = canvas;
    this.cy = this.canvas.cy;

    this.settings = Object.assign(
      {
        toolCanvasId: `kb-${canvas.canvasId}-canvas-tool`,
        indicatorCanvasId: `kb-${canvas.canvasId}-canvas-indicator`,
        connectorEnabled: true,
        indicatorEnabled: true,
      },
      options
    );

    this.eventListeners = new Map();
    this.evtListeners = new Set();

    // append the canvas
    this.indicatorCanvas = $(
      `<canvas data-id="${this.settings.indicatorCanvasId}" id="${this.settings.indicatorCanvasId}"></canvas>`
    );
    this.toolCanvas = $(
      `<canvas data-id="${this.settings.toolCanvasId}" id="${this.settings.toolCanvasId}"></canvas>`
    );
    this.indicatorCanvas.css({
      position: "absolute",
      "z-index": "5",
    });
    this.toolCanvas.css({
      position: "absolute",
      "z-index": "6",
    });
    this.indicatorCanvas.appendTo($(this.canvas.cy.container()).find("div"));
    this.toolCanvas.appendTo($(this.canvas.cy.container()).find("div"));

    // force resize Cytoscape canvas on window resize
    $(window).on("resize", (e) => {
      $(this.canvas.cy.container()).find("div").css("width", 0);
    });

    // Observe size change in Cytoscape canvas
    // to also change the size accordingly
    this.observer = new MutationObserver((mutations) => this.resizeCanvas());
    this.observer.observe(
      document.querySelector(
        `#${$(this.canvas.cy.container()).attr("id")} > div`
      ),
      { attributes: true }
    );

    // set canvas size
    this.resizeCanvas();

    // get the drawing context
    this.ctx = this.toolCanvas.get(0).getContext("2d");
    this.ictx = this.indicatorCanvas.get(0).getContext("2d");

    // start the listeners
    this.listenCanvasEvent();

    this.tools = new Map(); // storage for node tools
    this.edgeTools = new Map(); // storage for edge tools
    this.multiNodeTools = new Map(); // storage for multinode-selection tools
    this.activeTools = []; // storage for currently active/visible tools
    this.activeMultiTools = []; // storage for currently active/visible multi-nodes tools
    this.activeNode = null; // storage for currently selected node
    this.tapStartTool = null; // storage for tool on tapstart on a tool
    this.tapStartOn = null; // storage for object tapstarted

    // Event flags
    this.isTapStart = false;
    this.isNodeDrag = false;
  }

  static instance(canvas, options) {
    return new KitBuildCanvasToolCanvas(canvas, options);
  }

  attachEventListener(id, listener) {
    // also forward-attach the listeners to tools
    this.tools.forEach((v, k, map) => {
      if (typeof v.attachEventListener == "function")
        v.attachEventListener(id, listener);
    });
    this.edgeTools.forEach((v, k, map) => {
      if (typeof v.attachEventListener == "function")
        v.attachEventListener(id, listener);
    });
    this.multiNodeTools.forEach((v, k, map) => {
      if (typeof v.attachEventListener == "function")
        v.attachEventListener(id, listener);
    });
    return this.eventListeners.set(id, listener);
  }

  detachEventListener(id) {
    this.tools.forEach((v, k, map) => {
      if (typeof v.detachEventListener == "function") v.detachEventListener(id);
    });
    this.edgeTools.forEach((v, k, map) => {
      if (typeof v.detachEventListener == "function") v.detachEventListener(id);
    });
    this.multiNodeTools.forEach((v, k, map) => {
      if (typeof v.detachEventListener == "function") v.detachEventListener(id);
    });
    return this.eventListeners.delete(id);
  }

  broadcastEvent(evt, data, options) {
    this.eventListeners.forEach((l, k, map) => {
      // console.error(l)
      if (l && typeof l.onCanvasToolEvent == "function")
        l.onCanvasToolEvent(this.canvas.canvasId, evt, data, options);
    });
    this.evtListeners.forEach((listener) =>
      listener(this.canvas.canvasId, evt, data, options)
    );
    return this;
  }

  on(what, listener) {
    switch (what) {
      case "event":
        if (typeof listener == "function") {
          this.evtListeners.add(listener);
          this.tools.forEach((tool) => tool.on("event", listener));
          this.edgeTools.forEach((tool) => tool.on("event", listener));
          this.multiNodeTools.forEach((tool) => tool.on("event", listener));
        }
        break;
    }
  }

  off(what, listener) {
    switch (what) {
      case "event":
        if (typeof listener == "function") {
          this.evtListeners.delete(listener);
          this.tools.forEach((tool) => tool.off("event", listener));
          this.edgeTools.forEach((tool) => tool.off("event", listener));
          this.multiNodeTools.forEach((tool) => tool.off("event", listener));
        }
        break;
    }
  }

  resizeCanvas() {
    // console.warn('resize!')
    let sibling = $($(this.canvas.cy.container()).find("div > canvas")[0]);
    this.dimension = {
      w: sibling.css("width").replace("px", ""),
      h: sibling.css("height").replace("px", ""),
    };
    $(`#${this.settings.indicatorCanvasId}`).css("width", sibling.css("width"));
    $(`#${this.settings.indicatorCanvasId}`).css(
      "height",
      sibling.css("height")
    );
    $(`#${this.settings.indicatorCanvasId}`).attr("width", this.dimension.w);
    $(`#${this.settings.indicatorCanvasId}`).attr("height", this.dimension.h);
    $(`#${this.settings.toolCanvasId}`).css("width", sibling.css("width"));
    $(`#${this.settings.toolCanvasId}`).css("height", sibling.css("height"));
    $(`#${this.settings.toolCanvasId}`).attr("width", this.dimension.w);
    $(`#${this.settings.toolCanvasId}`).attr("height", this.dimension.h);

    return this;
  }

  listenCanvasEvent() {
    // general events
    this.cy.on("tapstart", this.onTapStart.bind(this));
    this.cy.on("tapdrag", this.onTapDrag.bind(this));
    this.cy.on("tapend", this.onTapEnd.bind(this));
    this.cy.on("taphold", this.onTapHold.bind(this));
    this.cy.on("viewport", this.onViewport.bind(this));
    this.cy.on("render", this.onRender.bind(this));

    // element events
    this.cy.on("tapstart", "node", this.onNodeTapStart.bind(this));
    this.cy.on("tap", "node", this.onNodeTap.bind(this));
    this.cy.on("taphold", "node", this.onNodeTapHold.bind(this));
    this.cy.on("dbltap", "node", this.onNodeDblTap.bind(this));
    this.cy.on("drag", "node", this.onNodeDrag.bind(this));
    this.cy.on("dragfreeon", "node", this.onNodeDragFreeOn.bind(this));
    this.cy.on("select", "node", this.onNodeSelect.bind(this));
    this.cy.on("unselect", "node", this.onNodeUnselect.bind(this));
    this.cy.on("tap", "edge", this.onEdgeTap.bind(this));
    this.cy.on("taphold", "edge", this.onEdgeTapHold.bind(this));
    this.cy.on("select", "edge", this.onEdgeSelect.bind(this));
    this.cy.on("unselect", "edge", this.onEdgeUnselect.bind(this));

    return this;
  }

  addTool(id, tool, options) {
    tool.gridPos = Object.assign(
      tool.gridPos,
      options && options.gridPos ? options.gridPos : null
    );
    return this.tools.set(id, tool);
  }

  removeTool(id) {
    return this.tools.delete(id);
  }

  addMultiTool(id, tool, options) {
    return this.multiNodeTools.set(id, tool);
  }

  removeMultiTool(id) {
    return this.multiNodeTools.delete(id);
  }

  clearCanvas() {
    // console.error("CLEAR");
    this.ctx.clearRect(0, 0, this.dimension.w, this.dimension.h);
    this.boundingBoxDrawn = false;
    return this;
  }

  clearIndicatorCanvas() {
    // console.error("CLEAR INDICATOR");
    this.ictx.clearRect(0, 0, this.dimension.w, this.dimension.h);
    if (!this.settings.indicatorEnabled) return this;
    this.canvas.cy
      .nodes('[type="link"]')
      .forEach((l) => this.drawLinkRemaining(l));
    this.drawEdgeLockIndicators();
    return this;
  }

  drawTool(tool, position) {
    // preload icons and then draw at specified position
    this.preloadIconImagesOfTools([tool]).then(() =>
      this.drawToolAt(tool, position)
    );
    return this;
  }

  drawTools(node) {
    if (node.pannable && node.pannable()) return;
    // console.error('DRAW TOOLS', node.selectable(), node.pannable(), node)
    this.activeTools = []; // empty active tools list

    // calculate each generic tool position
    this.tools.forEach((t) => {
      if (
        t.showOn(
          node.data("type") == "link"
            ? KitBuildCanvasTool.SH_LINK
            : KitBuildCanvasTool.SH_CONCEPT,
          node
        )
      ) {
        t.onMount({
          target: node,
          activeTools: this.activeTools,
        });
        t.toolPos = this.getToolPositionOfNode(t, {
          position: node.renderedPosition(),
          w: node.renderedOuterWidth(),
          h: node.renderedOuterHeight(),
        });
        this.activeTools.push(t); // push tool as one of active tools
      } // else t.toolPos = null;

      // because edge tapping triggers connected link 'click' event
      // mount it here...
      if (
        t.showOn(KitBuildCanvasTool.SH_EDGE) &&
        this.canvas.cy.edges(":selected").length
      ) {
        // console.warn("DRAW ON EDGE", t)
        let edge = this.canvas.cy.edges(":selected")[0];
        t.onMount({
          target: edge,
          activeTools: this.activeTools,
        });
        t.toolPos = this.getToolPositionOfNode(t, {
          position: edge.renderedMidpoint(),
          w: 10,
          h: 10,
        });
        this.activeTools.push(t);
      }
    });

    if (node.data("type") == "link" && this.settings.connectorEnabled) {
      // console.log(this.activeTools)

      // draw handle at connected concepts position if the edge is not locked
      node.connectedEdges().forEach((edge) => {
        if (edge.data("lock") == "locked") return;
        let position = edge.renderedTargetEndpoint();
        let tool =
          edge.data("type") == "left"
            ? new KitBuildLeftHandleTool(this.canvas, {
                gridPos: { x: -1, y: 0 },
                toolPos: position,
              })
            : new KitBuildRightHandleTool(this.canvas, {
                gridPos: { x: 1, y: 0 },
                toolPos: position,
              });
        tool.onMount({
          target: node,
          activeTools: this.activeTools,
        });
        tool.assignedTo = edge.target().id();
        this.activeTools.push(tool); // push tool as one of active tools
      });

      // draw left handle
      if (node.connectedEdges('[type="left"]').length == 0) {
        // console.log("Draw")
        let lTool = new KitBuildLeftHandleTool(this.canvas, {
          gridPos: { x: -1, y: 0 },
        });
        lTool.onMount({
          target: node,
          activeTools: this.activeTools,
        });
        lTool.toolPos = this.getToolPositionOfNode(lTool, {
          position: node.renderedPosition(),
          w: node.renderedOuterWidth(),
          h: node.renderedOuterHeight(),
        });
        this.activeTools.push(lTool);
      }
      // draw right handle according to the limit
      if (
        node.data("limit") === null ||
        (Number.isInteger(node.data("limit")) &&
          node.connectedEdges('[type="right"]').length < node.data("limit"))
      ) {
        let rTool = new KitBuildRightHandleTool(this.canvas, {
          gridPos: { x: 1, y: 0 },
        });
        rTool.onMount({
          target: node,
          activeTools: this.activeTools,
        });
        rTool.toolPos = this.getToolPositionOfNode(rTool, {
          position: node.renderedPosition(),
          w: node.renderedOuterWidth(),
          h: node.renderedOuterHeight(),
        });
        this.activeTools.push(rTool);
      }
    }

    this.activeTools.forEach((t) =>
      t.preRender({
        target: node,
        activeTools: this.activeTools,
      })
    );

    // preload icons and then draw at specified position
    this.preloadIconImagesOfTools(this.activeTools).then(() => {
      for (let t of this.activeTools) this.drawToolAt(t);
    });
    return this;
  }

  drawToolAt(tool, pos) {
    // console.warn("DRAW TOOL AT", tool, pos)
    let position = pos ? pos : tool.toolPos;
    if (!position) return; // if no position defined, skip!
    let x = position.x - tool.settings.size / 2;
    let y = position.y - tool.settings.size / 2;
    let w = tool.settings.size;
    let h = tool.settings.size;
    let r = tool.settings.radius;

    this.ctx.save();
    this.ctx.fillStyle = tool.settings.bgColor;
    this.ctx.lineWidth = tool.settings.thickness;
    this.ctx.strokeStyle = tool.settings.bdColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r.tl, y);
    this.ctx.lineTo(x + w - r.tr, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr); // tr
    this.ctx.lineTo(x + w, y + h - r.br);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h); // br
    this.ctx.lineTo(x + r.bl, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl); // bl
    this.ctx.lineTo(x, y + r.tl);
    this.ctx.quadraticCurveTo(x, y, x + r.tl, y); // tl
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    if (tool.settings.type == "handle") {
      if (!this.activeNode) {
        this.ctx.restore();
        return;
      }
      let edge = this.activeNode.connectedEdges(
        `[type="${tool.settings.which}"][target="${tool.assignedTo}"]`
      );
      if (edge.length) {
        let ps = edge.sourceEndpoint();
        let pt = edge.targetEndpoint();
        let rad = Math.atan2(pt.y - ps.y, pt.x - ps.x);
        if (tool.settings.which == "left") rad += (Math.PI / 180) * 180;
        this.drawImageRot(tool.iconImage, x, y, w, h, rad);
        this.ctx.restore();
        return;
      }
    }
    this.ctx.drawImage(tool.iconImage, x, y, w, h);
    this.ctx.restore();
  }

  getToolbarTool(what) {
    return this.canvas.toolbar.tools.get(what);
  }

  /**
   * Camera events
   * */

  onTapStart(e) {
    // console.warn("tapStart", e, this.activeNode?.data('label'));
    this.isTapStart = true;
    this.clearCanvas();

    // cache concepts list for checking loop
    this.tapStartTool = this.hitActiveTools(e.renderedPosition);
    this.tapStartMultiTool = this.hitMultiNodeTools(e.renderedPosition);
    this.tapStartOn = this.hitNodes(e.position);
    this.hoveredConcept =
      this.tapStartOn && this.tapStartOn.type == "concept"
        ? this.tapStartOn
        : null;

    if (
      !this.tapStartOn &&
      (e.target.data("type") == "left" || e.target.data("type") == "right")
    )
      this.tapStartOn = e.target;

    // console.error("TAPSTART", this.tapStartMultiTool, this.tapStartTool, this.tapStartOn)

    // if tap on nothing but there are active tools, remove active tools
    if (!this.tapStartTool && this.activeTools.length) this.activeTools = [];

    if (this.tapStartTool || this.tapStartMultiTool) {
      // console.log(this.tapStartOn)
      // if tapstart on tool, anything behind it must be locked and unselectified
      if (this.tapStartOn) this.tapStartOn.lock().unselectify();
      this.tapStartOn = false;
    }

    if (this.tapStartTool && this.tapStartTool.settings.type == "handle") {
      // if the tool is a handle
      this.canvas.cy.style().selector("core").css({ "active-bg-size": 0 });
      this.canvas.cy.panningEnabled(false);
      this.canvas.cy.boxSelectionEnabled(false);

      // is the virtual dragNode not exists?
      if (!this.dragNode) this.createDragNodeAtPosition(e.position);
      // and draw virtual dragEdge between dragNode and link node
      this.drawDragEdge(this.dragNode, this.activeNode);
      if (this.tapStartOn.length && this.tapStartOn.isNode()) {
        this.drawCandidateEdgeOnConcept(this.tapStartOn);
        if (this.candidateEdge) {
          this.hoveredConcept = this.tapStartOn;
          this.canvas.cy
            .nodes(`#${this.hoveredConcept.id()}`)
            .lock()
            .unselectify();
        }
      }
    }

    if (this.tapStartMultiTool) this.drawSelectedNodesBoundingBox();
  }

  onTapDrag(e) {
    // console.warn('tapDrag')
    this.isTapStart = false;

    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    // if tapstart on handle, dragNode must be exists
    if (this.dragNode) {
      // candidate edge exists? snap!
      if (this.candidateEdge)
        this.dragNode.position(this.candidateEdge.targetEndpoint());
      else this.dragNode.position(e.position);
      // a concept is hovered?
      if (this.hoveredConcept) {
        // console.log('hovered')
        // check whether drag position is outside hovered concept
        if (
          !this.hitBoundingBox(e.position, this.hoveredConcept.boundingBox())
        ) {
          // remove candidate edge and hovered concept cache
          this.hoveredConcept = null;
          if (this.candidateEdge) {
            this.candidateEdge.remove();
            this.candidateEdge = null;
          }
          // show the drag edge again
          this.dragEdge.css({ opacity: 0.8 });
        }
      }
      this.hoveredConcept = this.hitNodes(e.position, "concept");
      if (this.hoveredConcept)
        this.drawCandidateEdgeOnConcept(this.hoveredConcept);
    }
  }

  onTapEnd(e) {
    // console.warn("tapEnd", this.tapStartTool, this.tapStartOn, e.target);

    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    if (this.isNodeTapHold) {
      this.isNodeTapHold = false;
      return;
    }
    if (this.isEdgeTapHold) {
      this.isEdgeTapHold = false;
      return;
    }

    this.isTapStart = false;

    this.canvas.cy.edges("#VIRTUAL-EDGE").remove();

    // not tapstart on tool, tapstart on a node, tapend target a node
    // then it is a click on a node
    if (
      !this.tapStartTool &&
      this.tapStartOn.length &&
      e.target.isNode &&
      e.target.isNode()
    )
      this.activeNode = e.target;

    // if there is a dragEdge and dragNode of an active node
    // then it is dragging a connection handle
    if (
      this.dragEdge &&
      this.dragNode &&
      this.activeNode &&
      this.tapStartTool
    ) {
      // get previously connected edges
      let edge = this.activeNode.connectedEdges(
        `[type="${this.tapStartTool.settings.which}"][target="${this.tapStartTool.assignedTo}"]`
      );
      let undoRedo = this.canvas.canvasTool.getToolbarTool(
        KitBuildToolbar.UNDO_REDO
      );

      // if a candidate edge exists on a hovered concept
      if (this.candidateEdge && this.hoveredConcept) {
        // remove candidate edge
        this.candidateEdge.remove();
        this.candidateEdge = null;

        // wait, is the edge to be created exists?
        let existingTargetEdge = this.activeNode.connectedEdges(
          `[type="${
            this.tapStartTool.settings.which
          }"][target="${this.hoveredConcept.id()}"]`
        );

        // if edge to be created does not exists, create it
        if (existingTargetEdge.length == 0) {
          let previousEdgeData = edge.length
            ? Object.assign({}, edge.data(), { id: undefined })
            : {};
          delete previousEdgeData.id;
          let newEdge = this.canvas.cy.add({
            group: "edges",
            data: Object.assign(edge.length ? previousEdgeData : {}, {
              source: this.activeNode.id(),
              target: this.hoveredConcept.id(),
              type: this.tapStartTool.settings.which,
            }),
          });
          if (this.canvas.direction == KitBuildCanvas.BIDIRECTIONAL)
            newEdge.addClass("bi");
          if (edge.length) {
            let moveData = {
              prior: edge.json(),
              later: newEdge.json(),
            };
            if (undoRedo)
              undoRedo.post(
                `move-connect-${newEdge.data("type")}`,
                UndoRedoMoveConnect.instance({
                  undoData: moveData,
                  redoData: moveData,
                })
              );
            edge.remove(); // remove prior edge
            this.broadcastEvent(
              `move-connect-${newEdge.data("type")}`,
              moveData
            );
          } else {
            // it is just simple connect
            if (undoRedo)
              undoRedo.post(
                `connect-${newEdge.data("type")}`,
                UndoRedoConnect.instance({
                  undoData: newEdge.json(),
                  redoData: newEdge.json(),
                })
              );
            this.broadcastEvent(
              `connect-${newEdge.data("type")}`,
              newEdge.json()
            );
          }
        }
      } else {
        // it was not connected, then just remove it.
        if (edge) {
          if (undoRedo)
            undoRedo.post(
              `disconnect-${edge.data("type")}`,
              UndoRedoDisconnect.instance({
                undoData: edge.json(),
                redoData: edge.json(),
              })
            );
          let edgeJson = edge.json();
          let type = edge.data("type");
          edge.remove();
          this.broadcastEvent(`disconnect-${type}`, edgeJson);
        } // if no edge, then it is just cancelling the connection process
      }

      this.clearIndicatorCanvas();

      // cache activeNode, it will be removed by node unselect event
      let activeLink = this.activeNode;

      // any locked nodes because of handle click? unlock it!
      setTimeout(() => {
        if (this.canvas.cy.nodes(":locked").length)
          this.canvas.cy.nodes(":locked").unlock().selectify();
        // reselect unselected link
        this.activeNode = activeLink.select().trigger("select");
      }, 50);
    }

    if (this.dragNode) this.dragNode.remove();
    if (this.dragEdge) this.dragEdge.remove();

    this.dragEdge = null;
    this.dragNode = null;
    this.workingNodes = null;

    this.canvas.cy.style().selector("core").css({ "active-bg-size": 30 });
    this.canvas.cy.panningEnabled(true);
    this.canvas.cy.boxSelectionEnabled(true);

    // console.warn(this.tapStartTool, this.activeNode)
    if (this.tapStartTool) {
      if (this.activeNode) {
        this.onToolClicked(this.tapStartTool, e, this.activeNode);
      } else {
        this.onToolClicked(this.tapStartTool, e);
      }
      // a tool is tapped, then reset its position
      this.activeTools.forEach((t) => (t.toolPos = null));
    }

    if (this.tapStartMultiTool) {
      // console.warn(this.tapStartMultiTool, this.activeNode)
      let selectedElements = this.canvas.cy
        .elements(":selected")
        .not("#VIRTUAL");
      this.onMultiNodeToolClicked(this.tapStartMultiTool, e, selectedElements);
      // a tool is tapped, then reset its position
      this.activeTools.forEach((t) => (t.toolPos = null));
      return false;
    }

    if (!this.tapStartTool && !this.tapStartMultiTool && !this.tapStartOn) {
      // remove the tool position of previously visible multi-tools
      for (let tool of this.activeMultiTools) tool.toolPos = null;
      // console.warn("NOTHING CLICKED", this.activeTools)
      // this.activeTools.forEach(t => t.toolPos = null) // kalo diaktifin, nggak kedetect pas klik berikutnya
    }
  }

  onTapHold(e) {
    // console.warn("tapHold", e, this.tapStartTool, this.tapStartMultiTool, this.tapStartOn)

    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    if (
      this.tapStartTool === false &&
      this.tapStartMultiTool === false &&
      this.tapStartOn === false
    ) {
      // tapHold on nothing
      this.activeTools = [];
      this.tools.forEach((t) => {
        if (t.showOn(KitBuildCanvasTool.SH_CONTEXT)) {
          t.toolPos = this.getToolPositionOfNode(t, {
            position: e.renderedPosition,
            w: 10,
            h: 10,
          }); // this attribute is needed for hit test
          t.contextPosition = e.position;
          t.contextRenderedPosition = e.renderedPosition;
          // console.log(t)
          this.drawTool(t, t.toolPos);
          this.activeTools.push(t);
        }
      });
    }
  }

  onViewport(e) {
    // console.warn("viewport");
    this.clearCanvas();
    this.clearIndicatorCanvas();
    // this.canvas.cy.nodes('[type="link"]').forEach(l => this.drawLinkRemaining(l))
    // this.canvas.cy.nodes('[type="link"]').forEach(link => this.drawLinkRemaining(link))
  }

  onRender(e) {
    if (this.dragNode) return;
    if (this.isNodeTapHold || this.isEdgeTapHold) return;
    if (this.activeTools.length) return;

    // console.warn("render");
    // this will reset elements selectability and unlocks them
    this.startRender = new Date().getTime();
    if (new Date().getTime() - this.startRender < 400)
      clearTimeout(this.renderTimeout);
    this.renderTimeout = setTimeout(() => {
      // console.warn("RENDER DRAW")
      if (!this.isNodeDrag && !this.isTapStart) {
        // only draw while not dragging or tapstart a node
        this.clearCanvas();
        if (this.canvas.cy.nodes(":selected").length == 1)
          this.drawTools(this.canvas.cy.nodes(":selected")[0]);
        else if (this.canvas.cy.nodes(":selected").length > 1)
          this.drawSelectedNodesBoundingBox(e);
      }
      this.canvas.cy.elements(":unselectable").selectify();
      this.canvas.cy.elements(":locked").unlock();
    }, 200);
  }

  /**
   * Element events
   * */

  onNodeTapStart(e) {
    // console.warn("NODE TAP START", e.target)
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    // add e.target because it might not have been selected on start drag
    this.canvas.cy
      .nodes(":selected")
      .add(e.target)
      .not(".hide")
      .forEach((node) => {
        node.initialPosition = Object.assign(
          { id: node.id() },
          node.position()
        );
        node.initialPosition.x |= 0;
        node.initialPosition.y |= 0;
      });
  }

  onNodeTap(e) {
    // console.warn("nodeTap", this.canvas.cy.nodes(":selected").length, e);
    // if the node is currently hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;
    if (this.isNodeTapHold) return;

    if (
      this.canvas.cy.nodes(":selected").length &&
      this.canvas.cy.nodes(":selected").length == 1
    ) {
      if (!e.originalEvent) return;
      if (
        this.canvas.cy.nodes(":selected")[0].id() == e.target.id() &&
        !(e.originalEvent.shiftKey || e.originalEvent.ctrlKey)
      )
        e.target.trigger("select");
    }
  }

  onNodeTapHold(e) {
    // console.warn("nodeTapHold", this.canvas.cy.nodes(":selected").length, e);
    // if the node is currently hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;
    this.isNodeTapHold = true;
    e.target.select();
    this.canvas.canvasTool.clearCanvas();
    this.canvas.cy.elements().not(e.target).lock().unselectify();
  }

  onNodeDblTap(e) {
    // console.log("nodeDblTap", e)
    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    e.target.unselectify().neighborhood().select().trigger("select");
    setTimeout(() => {
      e.target.selectify();
      if (this.canvas.cy.nodes(":selected").length > 1) {
        this.activeTools = [];
        this.clearCanvas();
        this.drawSelectedNodesBoundingBox();
      }
    }, 50);
  }

  onNodeDrag(e) {
    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    if (e.target.data("type") == "link") this.clearIndicatorCanvas();
    else this.clearIndicatorCanvas();
    this.isNodeDrag = true;
  }

  onNodeDragFreeOn(e) {
    // console.warn("nodeDragFreeOn", this.canvas.cy.nodes(":selected").length, e.target.selected());
    if (!e.target.selected()) {
      // dragging unselected node
      this.canvas.cy.nodes().not(e.target).unselect();
      e.target.select();
      this.activeNode = e.target;
    } else e.target.trigger("select"); // to draw tools
    this.isNodeDrag = false;

    // Undo-Redo for drag node movement.

    let selectedNodes = this.canvas.cy.nodes(":selected").not(".hide");

    if (selectedNodes.length > 1) {
      // move groups
      let priorMoves = [];
      let laterMoves = [];
      selectedNodes.forEach((node) => {
        node.moveToPosition = Object.assign({ id: node.id() }, node.position());
        node.moveToPosition.x |= 0;
        node.moveToPosition.y |= 0;

        priorMoves.push(Object.assign({}, node.initialPosition));
        laterMoves.push(Object.assign({}, node.moveToPosition));
      });

      let undoRedo = this.getToolbarTool(KitBuildToolbar.UNDO_REDO);
      let moveData = {
        prior: priorMoves,
        later: laterMoves,
      };
      if (undoRedo)
        undoRedo.post(
          `move-nodes`,
          UndoRedoMoves.instance({
            undoData: moveData.prior,
            redoData: moveData.later,
          })
        );
      this.broadcastEvent(`move-nodes`, moveData);
      return;
    }

    e.target.moveToPosition = Object.assign(
      { id: e.target.id() },
      e.target.position()
    );
    e.target.moveToPosition.x |= 0;
    e.target.moveToPosition.y |= 0;
    let moveData = {
      from: Object.assign({}, e.target.initialPosition),
      to: Object.assign({}, e.target.moveToPosition),
    };
    let undoRedo = this.getToolbarTool(KitBuildToolbar.UNDO_REDO);
    if (undoRedo)
      undoRedo.post(
        `move-${e.target.data("type")}`,
        UndoRedoMove.instance({
          id: e.target.id(),
          undoData: moveData,
          redoData: moveData,
        })
      );
    this.broadcastEvent(`move-${e.target.data("type")}`, moveData);
  }

  onNodeSelect(e) {
    // console.warn("nodeSelect", e.target.data('label'), this.canvas.cy.nodes(":selected").length);
    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;
    if (this.isNodeTapHold) return;

    if (this.canvas.cy.nodes(":selected").length > 1) {
      this.activeNode = null;
      if (this.boundingBoxDrawn) return;
      this.clearCanvas();
      this.drawSelectedNodesBoundingBox();
      this.boundingBoxDrawn = true;
      this.broadcastEvent(`select-nodes`, [e.target.id()]);
      return;
    }
    this.activeNode = e.target;
    this.clearCanvas();
    this.drawTools(e.target);
    this.broadcastEvent(`select-nodes`, [e.target.id()]);
  }

  onNodeUnselect(e) {
    // console.warn("nodeUnselect", e.target.data('label'), this.canvas.cy.nodes(":selected").length);
    if (this.canvas.cy.nodes(":selected").length > 1) {
      this.activeNode = null;
      if (this.boundingBoxDrawn) return;
      this.clearCanvas();
      this.drawSelectedNodesBoundingBox();
      this.boundingBoxDrawn = true;
      this.broadcastEvent(`unselect-nodes`, [e.target.id()]);
      return;
    }
    this.activeNode = this.canvas.cy.nodes(":selected")[0];
    if (this.activeNode) {
      this.clearCanvas();
      this.drawTools(this.activeNode);
    }
    this.broadcastEvent(`unselect-nodes`, [e.target.id()]);
  }

  onEdgeTap(e) {
    // console.warn("edgeTap", e.target.selected(), e.target, this.activeNode);
    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;

    if (!this.tapStartOn) {
      if (this.activeNode) this.activeNode.unselect();
      e.target.unselectify();
      return;
    }
    setTimeout(() => {
      // wait for link unselected because of this tap on edge
      if (e.target.selected()) {
        // if the edge becomes selected
        this.activeNode = e.target.source();
        this.activeNode.select().trigger("select");
      }
    }, 10);
    this.clearIndicatorCanvas();
  }

  onEdgeTapHold(e) {
    // console.warn("nodeTapHold", this.canvas.cy.nodes(":selected").length, e);
    // if the node is currently hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;
    this.isEdgeTapHold = true;
    e.target.select();
    this.canvas.cy.elements().lock().unselectify();
  }

  onEdgeSelect(e) {
    // console.warn("edgeSelect", e.target.selected());
    // if it is hidden, do nothing
    if (e.target.hasClass && e.target.hasClass("hide")) return;
    this.activeNode = e.target.source();
    this.activeNode.select().trigger("select");
    this.clearIndicatorCanvas();
  }

  onEdgeUnselect(e) {
    // console.warn("edgeUnselect", e.target.selected());
    let link = e.target.source();
    if (link.connectedEdges(":selected").length == 0) {
      link.selectify().unselect().trigger("unselect");
      if (this.canvas.cy.edges(":selected").length) {
        this.activeNode = this.canvas.cy.edges(":selected")[0].source();
        this.activeNode.select().trigger("select");
      }
    }
    this.clearIndicatorCanvas();
    // this.activeNode = null
  }

  /**
   * Kit-Build tool handlers
   */

  onToolClicked(tool, e, node) {
    if (typeof tool.action == "function") tool.action("click", e, node);
  }

  onMultiNodeToolClicked(tool, e, elements) {
    // console.warn('Multi-node Tool clicked', tool, e, elements)
    if (typeof tool.actionMulti == "function")
      tool.actionMulti("click", e, elements);
  }

  /**
   * Helpers
   */

  createDragNodeAtPosition(position) {
    this.dragNode = this.canvas.cy
      .add({
        group: "nodes",
        data: { id: "VIRTUAL" },
      })
      .css({
        opacity: 1,
        width: 10,
        height: 10,
        "border-width": 0,
      })
      .position({
        x: position.x,
        y: position.y,
      });
  }

  drawDragEdge(dragNode, activeNode) {
    //console.log(dragNode, activeNode, this.tapStartTool)
    if (!dragNode) return;
    if (!activeNode || activeNode.data("type") != "link") return;
    if (!this.tapStartTool) return;

    let lineColor = this.tapStartTool.settings.bdColor.substring(0, 7);
    let arrowShape =
      this.tapStartTool.settings.which == "right" ? "triangle" : "circle";
    if (this.canvas.direction == KitBuildCanvas.BIDIRECTIONAL)
      arrowShape = "circle";

    if (this.dragEdge) this.dragEdge.remove();
    this.dragEdge = this.canvas.cy
      .add({
        group: "edges",
        data: {
          id: "VIRTUAL-EDGE",
          source: activeNode.id(),
          target: "VIRTUAL",
          type: "virtual",
        },
      })
      .style({
        "line-color": lineColor,
        "target-arrow-shape": arrowShape,
        "target-arrow-color": lineColor,
      });

    return this.dragEdge;
  }

  getToolPositionOfNode(tool, rect) {
    // console.log(tool, node)
    /**
     * rect: {
     *  position: rendered-position: {x: int, y: int},
     *  w: rendered-width,
     *  h: rendered-height
     * }
     * */
    // if (!node.length) return
    // let position = node.renderedPosition();
    // let nodeWidth = node.renderedOuterWidth() + tool.settings.margin * 2;
    // let nodeHeight = node.renderedOuterHeight() + tool.settings.margin * 2;
    let position = rect.position;
    let offsetX = ((rect.w + tool.settings.margin * 2) / 2) | 0;
    let offsetY = ((rect.h + tool.settings.margin * 2) / 2) | 0;
    let toolPos = {
      x: position.x,
      y: position.y,
    };

    if (tool.gridPos.y > 0) {
      toolPos.y +=
        offsetY +
        (tool.gridPos.y - 1) * (tool.settings.size + tool.settings.margin) +
        tool.settings.size / 2; // turunkan ke bawah setengah tool size
      // - (tool.settings.size / 2) // geser ke atas setengah tool size
      toolPos.x += tool.gridPos.x * (tool.settings.size + tool.settings.margin);
      // - (tool.settings.size / 2) // geser ke kiri setengah tool size
    } else if (tool.gridPos.y < 0) {
      toolPos.y -=
        offsetY -
        (tool.gridPos.y + 1) * (tool.settings.size + tool.settings.margin) +
        tool.settings.size / 2; // naikkan ke atas setengah tool size
      // + (tool.settings.size / 2) // geser ke atas setengah tool size
      toolPos.x += tool.gridPos.x * (tool.settings.size + tool.settings.margin);
      // - (tool.settings.size / 2) // geser ke kiri setengah tool size
    } else {
      // y = 0
      toolPos.x += (tool.gridPos.x / Math.abs(tool.gridPos.x)) * offsetX;
      if (tool.gridPos.x > 0)
        toolPos.x +=
          (tool.gridPos.x - 1) * (tool.settings.size + tool.settings.margin) +
          tool.settings.size / 2;
      else
        toolPos.x +=
          (tool.gridPos.x + 1) * (tool.settings.size + tool.settings.margin) -
          tool.settings.size / 2;
      // toolPos.y -= (tool.settings.size / 2) // geser ke atas setengah tool size
    }
    return toolPos;
    //this.drawToolAt(tool, toolPos);
  }

  drawCandidateEdgeOnConcept(concept) {
    if (!this.tapStartTool) return;
    if (!this.activeNode && this.activeNode.type != "link") return;
    if (!concept) return;
    if (this.candidateEdge) this.candidateEdge.remove();
    this.candidateEdge = this.canvas.cy
      .add({
        group: "edges",
        data: {
          id: "CANDIDATE",
          source: this.activeNode.id(),
          target: concept.id(),
          state: "candidate",
        },
      })
      .css("line-color", this.tapStartTool.settings.bdColor.substring(0, 7));
    this.dragEdge.css({ opacity: 0 }); // hide dragEdge
  }

  drawImageRot(img, x, y, width, height, rad) {
    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    // this.ctx.rotate(deg * Math.PI / 180);
    this.ctx.rotate(rad);
    this.ctx.drawImage(img, (width / 2) * -1, (height / 2) * -1, width, height);
    this.ctx.restore();
  }

  drawSelectedNodesBoundingBox(e) {
    // avoid drawing on single selected nodes
    if (this.canvas.cy.nodes(":selected").length < 2) return;
    this.activeMultiTools = [];
    this.multiNodeTools.forEach((t) => {
      if (
        t.showOnMulti(
          this.canvas.cy.nodes(":selected"),
          this.canvas.cy.edges(":selected")
        )
      )
        this.activeMultiTools.push(t);
    });
    // console.error("DRAW BOUNDING BOX", this.canvas.cy.nodes(':selected').length)
    this.preloadIconImagesOfTools(this.activeMultiTools).then(() => {
      let bb = this.canvas.cy.nodes(":selected").renderedBoundingBox();
      let margin = 10;
      this.ctx.save();
      this.ctx.strokeStyle = "#0275d8";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([10, 5]);
      this.ctx.strokeRect(
        (bb.x1 - margin) | 0,
        (bb.y1 - margin) | 0,
        (bb.w + 2 * margin) | 0,
        (bb.h + 2 * margin) | 0
      );
      this.ctx.restore();
      let index = 0;
      for (let t of this.activeMultiTools) {
        t.toolPos = {
          x: bb.x1 + bb.w + 2 * margin + t.settings.size / 2,
          y: bb.y1 + (index * (margin + t.settings.size) + t.settings.margin),
        };
        this.drawToolAt(t);
        index++;
      }
    });
  }

  hitNodes(position, type) {
    // console.log(type)
    if (!this.workingNodes)
      this.workingNodes = this.canvas.cy.nodes().not("#VIRTUAL").toArray();
    for (let n of this.workingNodes) {
      // console.log(this.workingNodes, position, n.boundingBox(), this.hitBoundingBox(position, n.boundingBox()))
      if (
        this.hitBoundingBox(position, n.boundingBox()) &&
        !n.hasClass("hide")
      ) {
        if (type && n.data("type") == type) return n;
        if (!type) return n;
      }
    }
    return false;
  }

  hitActiveTools(renderedPosition) {
    for (let t of this.activeTools) {
      // console.log(t, renderedPosition, t.hit(renderedPosition))
      if (t.hit(renderedPosition)) return t;
    }
    return false;
  }

  hitMultiNodeTools(position) {
    // to avoid now invisible multi node tools.
    if (this.canvas.cy.nodes(":selected").length < 2) return false;

    for (let t of this.activeMultiTools) {
      if (t.hit(position)) {
        return t;
      }
    }
    return false;
  }

  hitBoundingBox(position, boundingBox) {
    return (
      position.x >= boundingBox.x1 &&
      position.x <= boundingBox.x2 &&
      position.y >= boundingBox.y1 &&
      position.y <= boundingBox.y2
    );
  }

  preloadIconImagesOfTools(tools) {
    let promises = [];
    for (let t of tools) {
      // preload all icon images // console.error("PRELOAD", t, t.gridPos.x)
      promises.push(
        new Promise((resolve) => {
          t.iconImage = new Image();
          t.iconImage.onload = () => resolve(true);
          let fillIcon = $(t.settings.icon).attr("fill", t.settings.color)[0];
          t.iconImage.src =
            "data:image/svg+xml;utf8," + encodeURIComponent(fillIcon.outerHTML);
        })
      );
    }
    return Promise.all(promises);
  }

  drawLinkRemaining(link) {
    // console.log(link.data())
    if (!link || link.data("type") != "link" || this.canvas.cy.zoom() < 0.65)
      return;
    let remaining =
      link.data("limit") - link.connectedEdges('[type="right"]').length;
    if (remaining == 0) return;
    let w = link.renderedOuterWidth();
    let h = link.renderedOuterHeight();
    let x = link.renderedPosition().x + w / 2;
    let y = link.renderedPosition().y - h / 2;
    let r = {
      tl: 5,
      tr: 5,
      br: 5,
      bl: 0,
    };
    let iw = 26;
    let ih = 26;
    let ix = x - iw / 2;
    let iy = y - ih / 2 - 1;
    this.ictx.save();
    this.ictx.fillStyle = "#FFFFFF";
    this.ictx.lineWidth = 3;
    this.ictx.strokeStyle = "#DEDEDE";
    this.ictx.beginPath();
    this.ictx.moveTo(ix + r.tl, iy);
    this.ictx.lineTo(ix + iw - r.tr, iy);
    this.ictx.quadraticCurveTo(ix + iw, iy, ix + iw, iy + r.tr); // tr
    this.ictx.lineTo(ix + iw, iy + ih - r.br);
    this.ictx.quadraticCurveTo(ix + iw, iy + ih, ix + iw - r.br, iy + ih); // br
    this.ictx.lineTo(ix + r.bl, iy + ih);
    this.ictx.quadraticCurveTo(ix, iy + ih, ix, iy + ih - r.bl); // bl
    this.ictx.lineTo(ix, iy + r.tl);
    this.ictx.quadraticCurveTo(ix, iy, ix + r.tl, iy); // tl
    this.ictx.closePath();
    this.ictx.fill();
    this.ictx.stroke();
    this.ictx.fillStyle = "#CC0000";
    this.ictx.font = "16px Fira Sans";
    this.ictx.textAlign = "center";
    this.ictx.textBaseline = "middle";
    this.ictx.fillText(remaining, x, y);
    this.ictx.restore();
  }

  drawEdgeLockIndicators() {
    if (this.canvas.cy.zoom() < 0.65) return;
    // console.warn('DRAW INDICATOR')
    for (let edge of this.canvas.cy.edges(":selected")) {
      let position = edge.renderedMidpoint();
      let lock = edge.data("lock");
      let x = position.x;
      let y = position.y;
      let iw = 12;
      this.ictx.save();
      this.ictx.fillStyle = "#FFFFFF";
      this.ictx.lineWidth = 4;
      this.ictx.strokeStyle = lock == "locked" ? "#cc0000" : "#2e908c";
      this.ictx.beginPath();
      this.ictx.arc(x, y, iw / 2, 0, 2 * Math.PI);
      this.ictx.closePath();
      this.ictx.fill();
      this.ictx.stroke();
      this.ictx.restore();
    }
  }

  enableTool(toolId, enable = true) {
    let tool = this.tools.get(toolId);
    if (tool) tool.settings.enabled = enable;
    return this;
  }

  enableConnector(enable = true) {
    this.settings.connectorEnabled = enable;
    return this;
  }

  enableIndicator(enable = true) {
    this.settings.indicatorEnabled = enable;
    return this;
  }
}

class UndoRedoMove {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoMove(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    canvas.cy.elements(`#${this.id}`).animate({
      position: data.from,
      duration: 100,
      complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
    });
  }
  redo(canvas, data) {
    // console.log(data, this)
    canvas.cy.elements(`#${this.id}`).animate({
      position: data.to,
      duration: 100,
      complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
    });
  }
}

class UndoRedoMoves {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoMoves(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    data.forEach((node) =>
      canvas.cy.elements(`#${node.id}`).animate({
        position: { x: node.x, y: node.y },
        duration: 100,
        complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
      })
    );
  }
  redo(canvas, data) {
    // console.log(data, this)
    data.forEach((node) =>
      canvas.cy.elements(`#${node.id}`).animate({
        position: { x: node.x, y: node.y },
        duration: 100,
        complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
      })
    );
  }
}

class UndoRedoConnect {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoConnect(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    canvas.cy.edges(`#${data.data.id}`).remove();
  }
  redo(canvas, data) {
    // console.log(data, this)
    canvas.cy.add(data);
  }
}

class UndoRedoDisconnect {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoDisconnect(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    canvas.cy.add(data);
  }
  redo(canvas, data) {
    // console.log(data, this)
    canvas.cy.edges(`#${data.data.id}`).remove();
  }
}

class UndoRedoMoveConnect {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoMoveConnect(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    canvas.cy.edges(`#${data.later.data.id}`).remove();
    canvas.cy.add(data.prior);
  }
  redo(canvas, data) {
    // console.log(data, this)
    canvas.cy.edges(`#${data.prior.data.id}`).remove();
    canvas.cy.add(data.later);
  }
}

class UndoRedoSwitch {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoSwitch(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    let laterIds = [];
    data.later.forEach((l) => {
      laterIds.push(`#${l.data.id}`);
    });
    canvas.cy.edges(laterIds.join(", ")).remove();
    canvas.cy.add(data.prior);
  }
  redo(canvas, data) {
    // console.log(data, this)
    let priorIds = [];
    data.prior.forEach((p) => {
      priorIds.push(`#${p.data.id}`);
    });
    canvas.cy.edges(priorIds.join(", ")).remove();
    canvas.cy.add(data.later);
  }
}

class UndoRedoCentroid {
  constructor(data) {
    Object.assign(this, data);
  }
  static instance(data) {
    return new UndoRedoCentroid(data);
  }
  undo(canvas, data) {
    // console.log(data, this)
    canvas.cy.elements(`#${this.id}`).animate({
      position: data.from,
      duration: 100,
      complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
    });
  }
  redo(canvas, data) {
    // console.log(data, this)
    canvas.cy.elements(`#${this.id}`).animate({
      position: data.to,
      duration: 100,
      complete: () => canvas.canvasTool.clearCanvas().clearIndicatorCanvas(),
    });
  }
}
