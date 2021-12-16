// cy object is attached when the action undo/redo command is invoked
// access the cy object with: this.cy

var Move = function (nodeId, fx, fy, tx, ty) {
  this.nodeId = nodeId;
  this.fx = fx;
  this.fy = fy;
  this.tx = tx;
  this.ty = ty;
}
Move.prototype = {
  redo: function () {
    this.cy.$('#' + this.nodeId).position({
      x: this.tx,
      y: this.ty
    });
    return {
      action: 'redo-move',
      data: {
        id: this.nodeId,
        x: this.tx,
        y: this.ty
      }
    };
  },
  undo: function () {
    this.cy.$('#' + this.nodeId).position({
      x: this.fx,
      y: this.fy
    });
    return {
      action: 'undo-move',
      data: {
        id: this.nodeId,
        x: this.fx,
        y: this.fy
      }
    };
  }
}

var MoveGroup = function (nodes) {
  this.movements = [];
  nodes.forEach(n => {
    this.movements.push({
      id: n.id,
      x: n.x,
      y: n.y,
      px: n.px,
      py: n.py
    })
  });
}
MoveGroup.prototype = {
  redo: function () {
    this.movements.forEach(n => {
      this.cy.$('#' + n.id).position({
        x: n.x,
        y: n.y
      });
    });
    return {
      action: 'redo-move-group',
      data: {
        moves: this.movements
      }
    };
  },
  undo: function () {
    this.movements.forEach(n => {
      this.cy.$('#' + n.id).position({
        x: n.px,
        y: n.py
      });
    });
    return {
      action: 'undo-move-group',
      data: {
        moves: this.movements
      }
    };
  }
}

SwitchDirection = function (nodeId) {
  this.nodeId = nodeId;
}
SwitchDirection.prototype = {
  redo: function () {

    let link = this.cy.$('#' + this.nodeId);

    let edges = link.connectedEdges();
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
    return {
      action: 'undo-switch-direction',
      data: {
        id: this.nodeId
      }
    };
  },
  undo: function () {
    let link = this.cy.$('#' + this.nodeId);

    let edges = link.connectedEdges();
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
    return {
      action: 'redo-switch-direction',
      data: {
        id: this.nodeId
      }
    };
  }
}

var Rename = function (nodeId, fName, nName) {
  this.nodeId = nodeId;
  this.fName = fName;
  this.nName = nName;
}

Rename.prototype = {
  redo: function () {
    this.cy.$('#' + this.nodeId).data('name', this.nName);
    return {
      action: 'redo-rename',
      data: {
        id: this.nodeId,
        name: this.nName
      }
    };
  },
  undo: function () {
    this.cy.$('#' + this.nodeId).data('name', this.fName);
    return {
      action: 'undo-rename',
      data: {
        id: this.nodeId,
        name: this.fName
      }
    };
  }
}

var Duplicate = function (node) {
  this.node = node;
}
Duplicate.prototype = {
  redo: function () {
    let node = this.cy.add(this.node); 
    return {
      action: 'redo-duplicate',
      data: this.node
    };
  },
  undo: function () {
    this.cy.remove('#' + this.node.data.id);
    return {
      action: 'undo-duplicate',
      data: {
        id: this.node.data.id
      }
    };
  }
}

var Create = function (node) {
  this.node = node;
}
Create.prototype = {
  redo: function () {
    let n = this.cy.add(this.node);
    if (this.node.data.textColor) 
      n.css('color', this.node.data.textColor);
    return {
      action: 'redo-create',
      data: this.node
    };
  },
  undo: function () {
    this.cy.remove('#' + this.node.data.id);
    return {
      action: 'undo-create',
      data: this.node.data.id
    };
  }
}

var Delete = function (node, edges) {
  this.node = node;
  this.edges = edges;
}
Delete.prototype = {
  redo: function () {
    this.cy.remove('#' + this.node.data.id);
    return {
      action: 'redo-delete',
      data: this.node.data.id
    };
  },
  undo: function () {
    let n = this.cy.add(this.node);
    if (this.node.data.textColor) 
      n.css('color', this.node.data.textColor);
    for (let e in this.edges) {
      let edge = this.edges[e];
      let edgeData = {
        data: {
          source: edge.source,
          target: edge.target,
          type: edge.type
        }
      };
      this.cy.add(edgeData);
    }
    return {
      action: 'undo-delete',
      data: {
        node: this.node,
        edges: this.edges
      }
    };
  }
}

var DeleteGroup = function (nodes, edges) { 
  this.nodes = nodes;
  this.edges = edges;
}
DeleteGroup.prototype = {
  redo: function () {
    this.nodes.forEach(n => {
      this.cy.remove('#' + n.id);
    });
    return {
      action: 'redo-delete-group',
      data: {
        nodes: this.nodes,
        edges: this.edges
      }
    };
  },
  undo: function () {
    this.nodes.forEach(n => { 
      let node = this.cy.add({
        group: 'nodes',
        data: n,
        position: n.position
      });
      if(n.textColor) node.css('color', n.textColor)
    })
    for (let edge of this.edges) {
      // let edge = this.edges[e];
      let edgeData = {
        data: {
          source: edge.source,
          target: edge.target,
          type: edge.type
        }
      };
      this.cy.add(edgeData);
    }
    return {
      action: 'undo-delete-group',
      data: {
        nodes: this.nodes,
        edges: this.edges
      }
    };
  }
}

var Connect = function (fLink, tLink) {
  this.fLink = fLink;
  this.tLink = tLink;
}
Connect.prototype = {
  redo: function () {
    if (this.tLink != null) {
      let edge = this.cy.add({
        data: {
          source: this.tLink.source,
          target: this.tLink.target,
          type: this.tLink.type
        }
      });
    }
    if (this.fLink != null) {
      let edges = this.cy.edges('[source = "' + this.fLink.source + '"][target = "' + this.fLink.target + '"]');
      let fEdge = (edges.length > 0) ? edges[0] : null;
      if (fEdge) fEdge.remove();
    }
    return {
      action: this.fLink && this.tLink ? 'redo-change-connect' : 'redo-connect',
      data: {
        fLink: this.fLink,
        tLink: this.tLink
      }
    };
  },
  undo: function () {
    if (this.fLink != null) {
      let edge = this.cy.add({
        data: {
          source: this.fLink.source,
          target: this.fLink.target,
          type: this.fLink.type
        }
      });
    }
    if (this.tLink != null) {
      let edges = this.cy.edges('[source = "' + this.tLink.source + '"][target = "' + this.tLink.target + '"]');
      let tEdge = (edges.length > 0) ? edges[0] : null;
      if (tEdge) tEdge.remove();
    }
    return {
      action: this.fLink && this.tLink ? 'undo-change-connect' : 'undo-connect',
      data: {
        fLink: this.fLink,
        tLink: this.tLink
      }
    };
  }
}

var Disconnect = function (fLink, tLink) {
  this.fLink = fLink;
  this.tLink = tLink;
}
Disconnect.prototype = {
  redo: function () {
    if (this.tLink != null) {
      let edge = this.cy.add({
        data: {
          source: this.tLink.source,
          target: this.tLink.target,
          type: this.tLink.type
        }
      });
    }
    if (this.fLink != null) {
      let edges = this.cy.edges('[source = "' + this.fLink.source + '"][target = "' + this.fLink.target + '"]');
      let fEdge = (edges.length > 0) ? edges[0] : null;
      if (fEdge) fEdge.remove();
    }
    return {
      action: 'redo-disconnect',
      data: {
        fLink: this.fLink,
        tLink: this.tLink
      }
    };
  },
  undo: function () {
    if (this.fLink != null) {
      let edge = this.cy.add({
        data: {
          source: this.fLink.source,
          target: this.fLink.target,
          type: this.fLink.type
        }
      });
    }
    if (this.tLink != null) {
      let edges = this.cy.edges('[source = "' + this.tLink.source + '"][target = "' + this.tLink.target + '"]');
      let tEdge = (edges.length > 0) ? edges[0] : null;
      if (tEdge) tEdge.remove();
    }
    return {
      action: 'undo-disconnect',
      data: {
        fLink: this.fLink,
        tLink: this.tLink
      }
    };
  }
}

var ReLayout = function (fNodes, tNodes) {
  this.fNodes = fNodes;
  this.tNodes = tNodes;
}
ReLayout.prototype = {
  redo: function () {
    for (let i = 0; i < this.tNodes.length; i++)
      this.cy.$('#' + this.tNodes[i].id).position({
        x: this.tNodes[i].x,
        y: this.tNodes[i].y
      });
    return {
      action: 'redo-relayout',
      data: {
        fNodes: this.fNodes
      }
    };
  },
  undo: function () {
    for (let i = 0; i < this.fNodes.length; i++)
      this.cy.$('#' + this.fNodes[i].id).position({
        x: this.fNodes[i].x,
        y: this.fNodes[i].y
      });
    return {
      action: 'undo-relayout',
      data: {
        tNodes: this.tNodes
      }
    };
  }
}

var Straighten = function (fLinks, tLinks) {
  this.fLinks = fLinks;
  this.tLinks = tLinks;
}
Straighten.prototype = {
  redo: function () {
    for (let i = 0; i < this.tLinks.length; i++)
      this.cy.$('#' + this.tLinks[i].id).position({
        x: this.tLinks[i].x,
        y: this.tLinks[i].y
      });
    this.cy.animate({
      fit: {
        eles: cy,
        padding: 30
      }
    });
    return {
      action: 'redo-straighten',
      data: {
        tLinks: this.tLinks
      }
    };
  },
  undo: function () {
    for (let i = 0; i < this.fLinks.length; i++)
      this.cy.$('#' + this.fLinks[i].id).position({
        x: this.fLinks[i].x,
        y: this.fLinks[i].y
      });
    this.cy.animate({
      fit: {
        eles: cy,
        padding: 30
      }
    });
    return {
      action: 'undo-straighten',
      data: {
        fLinks: this.fLinks
      }
    };
  }
}

var Proposition = function (nodes, edges) {
  this.nodes = nodes;
  this.edges = edges;
}
Proposition.prototype = {
  redo: function () {
    for (let i = 0; i < this.nodes.length; i++) { 
      this.cy.add(this.nodes[i]);
    }
    for (let i = 0; i < this.edges.length; i++) { 
      this.cy.add(this.edges[i]);
    }
    return {
      action: 'redo-proposition',
      data: {
        nodes: this.nodes,
        edges: this.edges
      }
    };
  },
  undo: function () {
    for (let i = 0; i < this.edges.length; i++) { 
      this.cy.remove('#' + this.edges[i].data.id);
    }
    for (let i = 0; i < this.nodes.length; i++) { 
      this.cy.remove('#' + this.nodes[i].data.id);
    }
    return {
      action: 'undo-proposition',
      data: {
        nodes: this.nodes,
        edges: this.edges
      }
    };
  }
}