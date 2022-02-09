const virtualNodeId = 'VIRTUAL_NODE_ID';
const DEBUG = false;

/*
  This file is the main code for canvas overlay tool.
  Managing proposition creation as well as concept map 
  node creation and modification tool
*/

class CanvasTool {

  // Default configuration

  onResize(e) {
    setTimeout(() => {
      this.canvas
        .attr('height', this.wrapper.height())
        .attr('width', this.wrapper.width())
        .css({
          'position': 'absolute',
          'z-index': '999',
          'height': this.wrapper.height(),
          'width': this.wrapper.width()
        });
      this.offset = this.wrapper.offset();
    }, 10);
  }

  onZoomPan(e) {
    if (DEBUG) console.log('on pan/zoom');
    if (this.selectedNode != null) {
      this.clear();
      this.drawTool(this.selectedNode);
      if (this.selectedLink != null) this.drawHandle(this.selectedLink);
    }
  }

  onMouseDown(e) {
    if (DEBUG) console.log('on mouse down');
    this.tapHoldState = false; // detection for tap/tap-hold
    let mousePosition = {
      'x': e.pageX,
      'y': e.pageY
    };
    if (e.pageX == undefined) {
      let touch = e.touches[0];
      mousePosition = {
        'x': touch.pageX,
        'y': touch.pageY
      };
    }

    this.handleClicked = this.handleHitTest(mousePosition);
    this.toolClicked = this.toolHitTest(mousePosition);
    // if(this.handleClicked != null) console.log(this.handleClicked);
    // if(this.toolClicked != null) console.log(this.toolClicked);
    if (this.handleClicked) {
      this.downState = 'handle';
      e.stopImmediatePropagation();
    } else if (this.toolClicked) {
      this.downState = 'tool';
      e.stopImmediatePropagation();
    } else {
      this.downState = null;
      this.clear();
    }

    // flag to identify they actually make a connection rather than move
    this.connectDragOver = false;

    if (this.downState != null && e.pageX == undefined) {
      this.cy.panningEnabled(false)
      e.preventDefault()
    }

  }

  onMouseMove(e) {
    if (DEBUG) console.log('on mouse move');

    // let mousePosition = {
    //   'x': e.pageX,
    //   'y': e.pageY
    // };
    // // let cy = e.data.cy;
    // let handle = this.handleHitTest(mousePosition);
    // let tool = this.toolHitTest(mousePosition);

    // if (this.handleState == null && handle != null) {
    //   this.handleState = handle;
    //   // handleState.mousePosition = mousePosition;
    //   if (this.host && this.host.onCanvasHandleEvent)
    //     this.host.onCanvasHandleEvent('hover-in', handle);
    // } else if (this.handleState != null && handle == null) {
    //   if (this.host && this.host.onCanvasHandleEvent)
    //     this.host.onCanvasHandleEvent('hover-out', handle);
    //   this.handleState = null;
    // }

    // if (this.toolState == null && tool != null) {
    //   this.toolState = tool;
    //   // toolState.mousePosition = mousePosition;
    //   if (this.host && this.host.onCanvasToolEvent)
    //     this.host.onCanvasToolEvent('hover-in', tool);
    // } else if (this.toolState != null && tool == null) {
    //   if (this.host && this.host.onCanvasToolEvent)
    //     this.host.onCanvasToolEvent('hover-out', tool);
    //   this.toolState = null;
    // }

    // if (handle || tool) {
    //   $('canvas').css('cursor', 'pointer');
    // } else $('canvas').css('cursor', 'inherit');

    switch (this.downState) {
      case 'link':
      case 'concept':
      case 'handle':
        this.moveState = 'drag';
        break;
      default:
        this.moveState = null;
        break;
    }

    switch (this.downState) {
      case 'link':
        // this.clear();
        // this.drawHandle(this.selectedLink);
        // this.drawTool(this.selectedLink);
        break;
      case 'concept':
        // this.clear();
        // if (this.selectedLink != null)
        //   this.drawHandle(this.selectedLink);
        // if (this.selectedConcept != null)
        //   this.drawTool(this.selectedConcept);
        break;
      case 'handle':
        this.clear();
        this.drawVirtualEdge(e);
        break;
      default:
        break;
    }

  }

  onMouseUp(e) {
    if (DEBUG) console.log('on mouse up', e);
    let host = this.host;
    switch (this.downState) {
      case 'tool':
        if (['create-concept', 'create-link'].includes(this.toolClicked.type)) {
          this.toolClicked.tapHoldPosition = this.tapHoldPosition;
        } else {
          this.clear();
          this.drawTool(this.selectedNode);
          if (this.selectedNode.data().type == 'link')
            this.drawHandle(this.selectedNode);
        }
        this.downState = null;
        this.moveState = null;
        if (this.host && this.host.onCanvasToolClicked)
          this.host.onCanvasToolClicked(this.toolClicked, this.selectedNode);
        break;
      case 'handle':
        if (this.moveState == 'drag') {
          // if clicked handle has edge, remove it, 
          // because it's no longer connected
          if (this.handleClicked.edge != null)
            this.handleClicked.edge.remove();

          // remove virtual (drag) edge
          if (this.dragEdge != undefined) {
            this.dragEdge.remove();
            this.dragEdge = undefined;
          }
          this.addOrRemoveEdge();
        }

        // gambar handle setelah handle dilepas
        this.clear();
        this.drawHandle(this.selectedLink);

        this.downState = null;
        this.moveState = null;

        break;

      case 'link':

        let draggedBB = this.selectedLink.boundingBox();
        let concepts = this.cy.nodes('[type="concept"]');
        let overlapConcept = null;
        for (let concept of concepts) {
          if (this.nodeOverlap(draggedBB, concept.boundingBox())) {
            // console.log('overlap')
            overlapConcept = concept;
            break;
          } // else console.log(draggedBB, bb, concept.data('name'), 'not overlap')
        }
        if (overlapConcept != null) {
          // console.log(overlapConcept, this.selectedLink);
          let pPosition = {
            x: this.selectedLink.data('px'),
            y: this.selectedLink.data('py')
          }
          this.selectedLink.position(pPosition);
          let data = this.selectedLink.data();
          data.x = parseInt(pPosition.x);
          data.y = parseInt(pPosition.y);
          if (host) host.onCanvasNodeMove(this.selectedLink, {
            x: data.px,
            y: data.py
          }, data);

          // create edge only when enabled
          if (!this.edgeSettings.enableConnectionTools) break;

          let edges = this.selectedLink.neighborhood('edge');
          let lEdge = null;
          if (edges.length == 1) {
            let edge = edges[0];
            let newEdgeType = (edge.data('type') == "left") ? "right" : "left";
            lEdge = {
              group: "edges",
              data: {
                source: this.selectedLink.id(),
                target: overlapConcept.id(),
                type: newEdgeType
              }
            }
            this.cy.add(lEdge);
          } else if (edges.length == 0) {
            lEdge = {
              group: "edges",
              data: {
                source: this.selectedLink.id(),
                target: overlapConcept.id(),
                type: "left"
              }
            }
            this.cy.add(lEdge);
          }

          // make an Undo connect on Canvas
          if (this.host && this.host.onCanvasNodeConnect && lEdge) {
            this.connectDragOver = true;
            this.host.onCanvasNodeConnect(null, {
              source: lEdge.data.source,
              target: lEdge.data.target,
              type: lEdge.data.type,
              name: this.selectedLink.data('name'),
              cname: overlapConcept.data('name')
            });
          }

        }

        this.downState = null;
        this.moveState = null;
        this.handleClicked = null;
        this.drawHandle(this.selectedNode);
        this.drawTool(this.selectedNode);

        break;

      case 'concept':

        let cDraggedBB = this.selectedConcept.boundingBox();
        let links = this.cy.nodes('[type="link"]');
        let overlapLink = null;
        for (let link of links) {
          if (this.nodeOverlap(cDraggedBB, link.boundingBox())) {
            // console.log('overlap')
            overlapLink = link;
            break;
          } // else console.log(draggedBB, bb, concept.data('name'), 'not overlap')
        }
        if (overlapLink != null) {
          // console.log(overlapConcept, this.selectedLink);
          let pPosition = {
            x: this.selectedConcept.data('px'),
            y: this.selectedConcept.data('py')
          }
          this.selectedConcept.position(pPosition);
          let data = this.selectedConcept.data();
          data.x = parseInt(pPosition.x);
          data.y = parseInt(pPosition.y);
          if (host) host.onCanvasNodeMove(this.selectedConcept, {
            x: data.px,
            y: data.py
          }, data);

          // create edge only when enabled
          if (!this.edgeSettings.enableConnectionTools) break;

          let edges = overlapLink.neighborhood('edge');
          let cEdge = null;
          if (edges.length == 1) {
            let edge = edges[0];
            let newEdgeType = (edge.data('type') == "left") ? "right" : "left";
            cEdge = {
              group: "edges",
              data: {
                source: overlapLink.id(),
                target: this.selectedConcept.id(),
                type: newEdgeType
              }
            };
            this.cy.add(cEdge);
          } else if (edges.length == 0) {
            cEdge = {
              group: "edges",
              data: {
                source: overlapLink.id(),
                target: this.selectedConcept.id(),
                type: "left"
              }
            }
            this.cy.add(cEdge);
          }

          // make an Undo connect on Canvas
          if (this.host && this.host.onCanvasNodeConnect && cEdge) {
            this.connectDragOver = true;
            this.host.onCanvasNodeConnect(null, {
              source: cEdge.data.source,
              target: cEdge.data.target,
              type: cEdge.data.type,
              name: overlapLink.data('name'),
              cname: this.selectedConcept.data('name')
            });
          }

        }

        this.downState = null;
        this.moveState = null;
        this.handleClicked = null;
        this.drawHandle(this.selectedNode);
        this.drawTool(this.selectedNode);

        break;
      default:


        if (this.selectedNode) {
          this.clear()
          this.drawHandle(this.selectedNode)
          this.drawTool(this.selectedNode)
        }
        if (!this.downState && !this.moveState) {
          this.clear();
          // nggak ngetap/click di elemen manapun
          this.selectedNode = null;
          this.selectedConcept = null;
          this.selectedLink = null;
          if (!this.tapHoldState) {
            this.cy.nodes('.parent-taphold').selectify().unselect();
            this.cy.nodes('.parent-taphold').removeClass('parent-taphold');
          }
        }

        this.downState = null;
        this.moveState = null;
        this.handleClicked = null;
        break;
    }
    this.cy.panningEnabled(true)

  }

  onNodeClick(e) {
    if (DEBUG) console.log('on node click', e);
    if (!this.tapHoldState) this.cy.nodes('.parent-taphold').selectify();
    if (!this.prevTimestamp) this.prevTimestamp = 0;
    if (e.timeStamp - this.prevTimestamp < 350) {
      e.target.trigger('doubleTap', e);
    }
    this.prevTimestamp = e.timeStamp;

    this.selectedConcept = null;
    this.selectedLink = null;
    this.selectedNode = e.target; // can be concept or link
    if (e.target.data().type == 'link') {
      this.selectedLink = e.target;

      // Needed for touch device to draw tool and handle
      this.clear();
      this.drawHandle(e.target);
      this.drawTool(e.target);
    }
    if (e.target.data().type == 'concept') {
      this.selectedConcept = e.target;

      // Needed for touch device to draw tool
      this.clear();
      this.drawTool(e.target);
    }
  }

  onNodeDoubleClick(e, originalEvent) {
    if (DEBUG) console.log('on node double click', e, originalEvent);
    switch (e.target.data().type) {
      case 'link':
        var neighbor = e.target.neighborhood().nodes();
        neighbor.selectify()
          .select()
          .unselectify()
        break;
      case 'concept':
        var neighbor = e.target.neighborhood().nodes();
        neighbor.selectify()
          .select()
          .unselectify()
        break;
    }
    setTimeout(function () {
      this.cy.nodes().selectify();
    }.bind(this), 50)
  }

  onNodeTapHold(e) {
    if (DEBUG) console.log('on node taphold', e);
    if (!e.target.selected()) {
      e.target.selectify().select().unselectify();
      e.target.addClass('parent-taphold');
    } else e.target.selectify().unselect().unselectify();
    this.tapHoldState = true;
  }

  onTapHold(e) {
    // console.warn(e);
    if (DEBUG) console.log('on tap hold', e);
    if (e.target.length) return;
    this.downState = 'taphold';
    this.selectedNode = null;
    this.selectedConcept = null;
    this.selectedLink = null;
    this.tapHoldPosition = {
      x: e.renderedPosition.x,
      y: e.renderedPosition.y
    }
    this.drawToolAt(this.tapHoldPosition)
  }

  onEdgeClick(e) {
    if (DEBUG) console.log('on edge click', e);
    let link = e.target.connectedNodes('[type="link"]').nodes();
    if (link.length) {
      link.selectify().select().unselectify();
    }
    if (!this.prevTimestamp) this.prevTimestamp = 0;
    if (e.timeStamp - this.prevTimestamp < 350) {
      e.target.trigger('doubleTap', {
        link: link
      });
    }
    this.prevTimestamp = e.timeStamp;
    setTimeout(function () {

      this.selectedNode = link;
      this.selectedLink = link;
      this.cy.nodes().selectify();
      this.clear();
      this.drawTool(this.selectedNode);
      this.drawHandle(this.selectedNode);
    }.bind(this), 50)
  }

  onEdgeDoubleClick(e, extraParams) {
    if (DEBUG) console.log('on edge double click', e);
    let link = extraParams.link;
    link.neighborhood().selectify().select().unselectify();
    setTimeout(function () {
      this.cy.nodes().selectify();
    }.bind(this), 50)
  }

  onNodeMouseOver(e) {
    if (DEBUG) console.log('on node mouse over');
    // no target node pointed? just return ... 
    if (e.target == undefined) return;

    switch (this.downState) {
      case 'handle': // if dragging handle, 
        // check if current pointed node is not the same as source node
        if (e.target.id() != this.selectedLink.id() &&
          e.target.data().id != virtualNodeId &&
          e.target.data().type != 'link') {
          // set currently pointed node as hover (target) node
          this.hoverNode = e.target;
        }
        break;
      default:
        if (e.target.data().type == 'concept')
          this.hoverNode = e.target;
        else this.hoverNode = null;
        break;
    }
  }

  onNodeMouseDown(e) {
    if (DEBUG) console.log('on node mouse down');
    this.selectedNode = e.target;
    e.target.data('px', parseInt(e.target.position().x))
    e.target.data('py', parseInt(e.target.position().y))
    if (e.target.data().type == 'link') {
      this.downState = 'link';
      this.selectedLink = e.target;
    } else if (e.target.data().type == 'concept') {
      this.downState = 'concept';
      this.selectedConcept = e.target;
    }
  }

  onNodeMouseOut(e) {
    if (DEBUG) console.log('on node mouse out');
    // if (this.hoverNode != null) {
    //   this.hoverNode.css({
    //     'background-color': this.hoverNode.data('color') ? this.hoverNode.data('color') : this.host.defaultColor,
    //     'opacity': 1.0
    //   })
    // }
    this.hoverNode = null;
    if (this.dragEdge) {
      this.dragEdge.remove();
      this.dragEdge = undefined;
    }
  }

  onNodeSelected(e) {
    if (DEBUG) console.log('on node selected', e);
    e.target.data('px', parseInt(e.target.position().x))
    e.target.data('py', parseInt(e.target.position().y))
  }

  // Called from onMouseUp
  addOrRemoveEdge() {
    let fEdge = null;
    if (this.handleClicked.edge != null) {
      let fNode = this.cy.nodes('[id="' + this.handleClicked.edge.data('target') + '"]').json();
      let lNode = this.cy.nodes('[id="' + this.handleClicked.edge.data('source') + '"]').json();
      fEdge = {
        source: this.handleClicked.edge.data('source'),
        target: this.handleClicked.edge.data('target'),
        type: this.handleClicked.edge.data('type'),
        name: lNode.data.name,
        cname: fNode.data.name
        // color: handleClicked.color
      };
      this.handleClicked.edge.remove();
      // if (this.host && this.host.onCanvasNodeDisconnect)
      //   this.host.onCanvasNodeDisconnect(fEdge);  
    }

    // if handle connected to another concept...
    if (this.hoverNode) {

      // create new edge
      let edgeData = {
        source: this.selectedLink.id(),
        target: this.hoverNode.id(),
        type: this.handleClicked.type
        // color: handleClicked.color
      };
      var edge = this.cy.add({
        data: edgeData
      });
      let lNode = this.cy.nodes('[id="' + this.selectedLink.id() + '"]').json();

      let tEdge = {
        source: edge.data('source'),
        target: edge.data('target'),
        type: edge.data('type'),
        name: lNode.data.name,
        cname: this.hoverNode.data('name')
        // color: handleClicked.color
      };

      if (this.host && this.host.onCanvasNodeConnect)
        this.host.onCanvasNodeConnect(fEdge, tEdge);

      // return hover (target) node style
      // to default style
      this.hoverNode.css({
        'background-color': null,
        'opacity': 1.0
      });

      //drawHandle(selectedLink);
      this.hoverNode = null; // handled

    } else { // then, it is not connected to anywhere
      if (this.host && this.host.onCanvasNodeDisconnect)
        this.host.onCanvasNodeDisconnect(fEdge);
    }
  }

  createDragNode() { // "this" is cy
    let dragNode = this.cy.add({
      group: "nodes",
      data: {
        'id': virtualNodeId
      },
    }).css({
      "opacity": 0,
      'width': 0.0002,
      'height': 0.0002,
      'border-width': 0
    }).position({
      x: 100,
      y: 100
    });
    return dragNode;
  }

  drawVirtualEdge(e) {

    // set virtual edge target to (virtual) dragged node
    let x = e.pageX
    let y = e.pageY

    // Handle touch coordinates instead of mouse
    if (x == undefined && e.touches) {
      let touch = e.touches[0]
      x = touch.pageX
      y = touch.pageY
    }

    //console.log(dragNode);
    if (this.dragNode == undefined)
      this.dragNode = this.createDragNode();

    let node = this.dragNode;

    // check if target node is (already) hovered
    if (this.hoverNode) {

      // snap target node to currently hovered node
      node = this.hoverNode;

      // throw virtual node and virtual edge
      this.dragNode.renderedPosition({
        'x': 100,
        'y': 100
      });
      this.dragNode.remove();
      this.dragNode = undefined;

      if (this.dragEdge) {
        this.dragEdge.remove();
        this.dragEdge = undefined;
      }

      // set color of target node to handle color temporarily
      this.hoverNode.style({
        'opacity': 0.5
      });

    } else {
      // if not move dragged virtual node to mouse pointer
      this.dragNode.renderedPosition({
        'x': x - 3 - this.offset.left,
        'y': y - this.offset.top
      });
    }

    // re-draw virtual edge
    if (this.dragEdge == undefined) {
      this.dragEdge = this.cy.add({
        group: "edges",
        data: {
          id: "edge",
          source: this.selectedLink.id(),
          target: node.id(),
          type: "virtual-" + this.handleClicked.type
        }
      });
    }

    let pos;
    if (this.hoverNode) {
      // kalau lagi ke-snap
      // ambil posisi snap-nya
      pos = {
        pos: {
          x: this.hoverNode.renderedPosition().x,
          y: this.hoverNode.renderedPosition().y
        }
      };
    } else {
      // selain itu, ambil posisi
      // dimana mouse berada
      pos = {
        pos: {
          x: x - this.offset.left,
          y: y - this.offset.top
        }
      };
    }
    this.drawHandle(this.selectedLink, pos);
  }

  toRenderedPosition(pos) {
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    return {
      x: pos.x * zoom + pan.x,
      y: pos.y * zoom + pan.y,
    };
  }

  toCanvasPosition(pos) {
    const pan = this.cy.pan();
    const zoom = this.cy.zoom();
    return {
      x: (pos.x - pan.x) / zoom,
      y: (pos.y - pan.y) / zoom,
    };
  }

  clear() {
    while (this.handles.length) this.handles.pop();
    while (this.tools.length) this.tools.pop();
    var w = this.wrapper.width();
    var h = this.wrapper.height();
    this.ctx.clearRect(0, 0, w, h);
  }

  drawHandle(node, opts) {
    if (!this.edgeSettings.enableConnectionTools) return;
    opts = Object.assign({}, opts);

    // not link or node not selected? return
    if (node.length == 0 || node.data().type != 'link') return;

    //console.log('drawing handle');
    let handle;
    let leftHandleEdge = this.getHandleEdges('left', node);
    let rightHandleEdge = this.getHandleEdges('right', node);

    if (this.handleClicked != null && this.handleClicked.type == 'left' && opts['pos']) {
      // kalau handle kiri lagi di drag
      let pos = opts['pos'];
      handle = this.drawHandleCircle({
        type: 'left',
        x: pos.x,
        y: pos.y
      });
      this.handles.push(handle);
    } else {
      if (!leftHandleEdge) {
        // kalau belum nyambung ke concept manapun
        handle = this.drawHandleCircle({
          type: 'left',
          node: node
        });
        this.handles.push(handle);
      } else {
        // kalau sudah nyambung ke concept tertentu
        let pos = this.toRenderedPosition(leftHandleEdge.targetEndpoint());
        handle = this.drawHandleCircle({
          type: 'left',
          x: pos.x,
          y: pos.y,
          edge: leftHandleEdge
        });
        this.handles.push(handle);
      }
    }

    if (this.handleClicked != null && this.handleClicked.type == 'right' && opts['pos']) {
      // kalau handle kanan lagi di drag
      let pos = opts['pos'];
      handle = this.drawHandleCircle({
        type: 'right',
        x: pos.x,
        y: pos.y
      });
      this.handles.push(handle);
    } else {
      if (!rightHandleEdge) {
        // kalau belum nyambung ke concept manapun
        handle = this.drawHandleCircle({
          type: 'right',
          node: node
        });
        this.handles.push(handle);
      } else {
        // kalau sudah nyambung ke concept tertentu
        let pos = this.toRenderedPosition(rightHandleEdge.targetEndpoint());
        handle = this.drawHandleCircle({
          type: 'right',
          x: pos.x,
          y: pos.y,
          edge: rightHandleEdge
        });
        this.handles.push(handle);
      }
    }
  }

  getHandleEdges(type, node) {

    // cek apa ada edge yang keluar untuk handle type tertentu
    let edges = node.connectedEdges().filter('[type = "' + type + '"]');
    if (edges.length > 0) { // && edges[0].data().handle.type == type) {
      for (let i = 0; i < edges.length; i++) {
        if (edges[i].source().data().id == node.data().id)
          return edges[i];
      }
    }

    // nggak ketemu
    return null;
  }

  // Method untuk menggambar handle secara teknis
  drawHandleCircle(opts) {

    // position, node, color
    var color = this.settings["link-color"];
    var type;
    var node;
    var x, y;
    var edge = null;

    if (opts['type']) {
      type = opts['type'];
      switch (type) {
        case 'left':
          color = this.settings["link-in-color"];
          break;
        case 'right':
          color = this.settings["link-out-color"];
          break;
      }
    }
    if (opts['color']) color = opts['color'];
    if (opts['node']) {
      node = opts['node'];
      let targetPosition = node.renderedPosition();
      let h = node.renderedOuterHeight();
      let w = node.renderedOuterWidth();
      switch (type) {
        case 'left':
          x = targetPosition.x - w / 2 - this.settings['handle-size'] - 2;
          y = targetPosition.y;
          break;
        case 'right':
          x = targetPosition.x + w / 2 + this.settings['handle-size'] + 2;
          y = targetPosition.y;
          break;
      }
    } else {
      x = opts['x'];
      y = opts['y'];
    }
    if (opts['edge']) edge = opts['edge'];

    this.ctx.beginPath();
    this.ctx.lineWidth = 4;
    this.ctx.arc(x, y, this.settings['handle-size'], 0, 2 * Math.PI);
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.globalAlpha = this.settings['handle-alpha'];
    this.ctx.fill();
    this.ctx.stroke();

    return {
      type: type,
      x: x,
      y: y,
      color: color,
      edge: edge
    };

  }

  redrawToolAndHandle(opts) {
    if (this.selectedNode) {
      this.clear();
      this.drawTool(this.selectedNode, opts);
      this.drawHandle(this.selectedNode);
    }
  }

  drawTool(node, opts) {
    if (node.length == 0 || !this.edgeSettings.enableNodeTools) return;
    let tool = null;
    let app = this.host;
    if (this.edgeSettings.enableNodeModificationTools) {
      tool = this.drawToolCircle(node, {
        type: 'delete-node',
        color: '#FF0000',
        label: app.l.get('delete'),
        positionIndex: {
          x: 1,
          y: -1
        },
        iconImage: this.iconDelete
      });
      this.tools.push(tool);
      tool = this.drawToolCircle(node, {
        type: 'delete-selected-nodes',
        color: '#000000',
        label: app.l.get('delete-all-selected'),
        positionIndex: {
          x: 2,
          y: -1
        },
        iconImage: this.iconDeleteAll
      });
      this.tools.push(tool);
      tool = this.drawToolCircle(node, {
        type: 'edit-node',
        color: '#E18335',
        label: app.l.get('edit'),
        positionIndex: {
          x: -1,
          y: -1
        },
        iconImage: this.iconEdit
      });
      this.tools.push(tool);
      tool = this.drawToolCircle(node, {
        type: 'duplicate-node',
        color: '#26547C',
        label: app.l.get('duplicate'),
        positionIndex: {
          x: 1,
          y: 1
        },
        iconImage: this.iconDuplicate
      });
      this.tools.push(tool);
    }

    switch (node.data().type) {
      case 'link':
        if (node.connectedEdges().length == 2) {
          tool = this.drawToolCircle(node, {
            type: 'center-link',
            label: app.l.get('center-link-pos'),
            positionIndex: {
              x: -1,
              y: 1
            },
            iconImage: this.iconCenter
          });
          this.tools.push(tool);
          if (this.edgeSettings.isDirected) {
            tool = this.drawToolCircle(node, {
              type: 'switch-direction',
              label: app.l.get('switch-arrow-direction'),
              positionIndex: {
                x: 0,
                y: 1
              },
              iconImage: this.iconSwitch
            });
            this.tools.push(tool);
          }
        }
        break;
      case 'concept':
        break;
    }

    // Draw "plugin" tools
    this.additionalTools.forEach(aTool => {
      if (node.data().type == aTool.nodeType || aTool.nodeType == 'both')
        tool = this.drawToolCircle(node, aTool)
      this.tools.push(tool)
    });

  }

  drawToolAt(position, options) {
    if (!this.edgeSettings.enableNodeTools) return;
    let tool = null;
    let app = this.host;
    // console.error(this.edgeSettings);
    if (this.edgeSettings.enableNodeCreationTools) {
      // console.error(app.toolbar);
      if (this.edgeSettings.enableConceptCreationTools) {
        tool = this.drawToolCircle({
          h: 1,
          targetPosition: position
        }, {
          type: 'create-concept',
          color: app.toolbar.color ? app.toolbar.color : app.defaultColor,
          textColor: app.toolbar.textColor,
          label: 'New Concept', // app.l.get('concept'),
          positionIndex: {
            x: -1,
            y: 0
          },
          iconImage: this.iconConcept
        });
        this.tools.push(tool);
      }
      if (this.edgeSettings.enableLinkCreationTools) {
        tool = this.drawToolCircle({
          h: 1,
          targetPosition: position
        }, {
          type: 'create-link',
          color: '#cccccc',
          textColor: '#000000',
          label: 'New Link', // app.l.get('concept'),
          positionIndex: {
            x: 1,
            y: 0
          },
          iconImage: this.iconLink
        });
        this.tools.push(tool);
      }
    }
  }

  // Method untuk menggambar tool button secara teknis
  drawToolCircle(node, tool) {
    var color = tool.color ? tool.color : this.settings["tool-color"];
    var x, y;

    let targetPosition, h;

    if (node.targetPosition && node.h) {
      targetPosition = node.targetPosition;
      h = node.h;
    } else {
      targetPosition = node.renderedPosition();
      h = node.renderedOuterHeight();
    }

    if (!this.edgeSettings.enableNodeModificationTools) {
      if (tool.positionIndex.x < -1) tool.positionIndex.x += 1;
      if (tool.positionIndex.x > 1) tool.positionIndex.x -= 1;
      if (tool.positionIndex.y < -2) tool.positionIndex.y += 1;
      if (tool.positionIndex.y > 1 && tool.positionIndex.x > 0) tool.positionIndex.y -= 1;
    }

    x = targetPosition.x +
      (tool.positionIndex.x * (2 * this.settings['handle-size'] + 5))
    y = (h / 2) +
      Math.abs(tool.positionIndex.y) *
      (2 * this.settings['handle-size'] + 5);
    y -= this.settings['handle-size'];
    y = targetPosition.y + (tool.positionIndex.y < 0 ? -y : y)

    this.ctx.beginPath();
    this.ctx.lineWidth = 4;
    this.ctx.arc(x, y, this.settings['handle-size'], 0, 2 * Math.PI);
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = '#FFFFFF'; //ctx.strokeStyle;
    this.ctx.globalAlpha = this.settings['handle-alpha'];
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.drawImage(tool.iconImage,
      x - 12,
      y - (24 * tool.iconImage.height / tool.iconImage.width / 2),
      24,
      24 * tool.iconImage.height / tool.iconImage.width);

    return Object.assign(tool, {
      type: tool.type,
      x: x,
      y: y,
      color: color,
      textColor: tool.textColor,
      label: tool.label
    });

  }

  distance(vector1, vector2) { // vector1 = mouse position; vector2 = handle
    return Math.sqrt(
      Math.pow(vector1.x - vector2.x - this.offset.left, 2) +
      Math.pow(vector1.y - vector2.y - this.offset.top, 2)
    );
  }

  handleHitTest(clickPosition) {
    if (DEBUG) console.log('Click position', clickPosition);
    var vector1 = {
      'x': clickPosition.x,
      'y': clickPosition.y
    };
    for (let i = 0; i < this.handles.length; i++) {
      var vector2 = {
        'x': this.handles[i].x,
        'y': this.handles[i].y
      };
      let distance = this.distance(vector1, vector2);
      if (distance < this.settings['handle-size']) {
        if (DEBUG) console.log('Handle clicked.');
        return this.handles[i];
      }

    }
    return null;
  }

  toolHitTest(clickPosition) {
    var vector1 = {
      'x': clickPosition.x,
      'y': clickPosition.y
    };
    for (let i = 0; i < this.tools.length; i++) {
      if (!this.tools[i]) continue
      var vector2 = {
        'x': this.tools[i].x,
        'y': this.tools[i].y
      };
      let distance = this.distance(vector1, vector2);
      if (distance < this.settings['handle-size']) {
        return this.tools[i];
      }

    }
    return null;
  }

  constructor(cy, options) {

    // Uncomment the following line for local app build only
    // let assetsUrl = './app/assets/'
    let assetsUrl = Core.instance().config('assets-url');

    let defaults = {
      "toolkit-canvas-id": "kb-canvas",
      "link-color": "#777777",
      "link-in-color": "#C52233",
      "link-out-color": "#5BC0EB",
      "tool-color": "#777777",
      "correct-color": "#8CB146",
      "wrong-color": "#C73E1D",
      "user-color": "#006E90",
      "goal-color": "#F67E7D",
      "handle-size": 10,
      "handle-alpha": 0.7,
      "icon-center": assetsUrl + "vendors/octicons/svg/git-commit.svg",
      "icon-switch": assetsUrl + "vendors/octicons/svg/git-compare.svg",
      "icon-delete": assetsUrl + "vendors/octicons/svg/x.svg",
      "icon-delete-all": assetsUrl + "vendors/octicons/svg/delete-all.svg",
      "icon-edit": assetsUrl + "vendors/octicons/svg/pencil.svg",
      "icon-duplicate": assetsUrl + "vendors/octicons/svg/link.svg",
      "icon-book": assetsUrl + "vendors/octicons/svg/book.svg",
      "icon-concept": assetsUrl + "vendors/octicons/svg/c-node.svg",
      "icon-link": assetsUrl + "vendors/octicons/svg/l-node.svg",
    };

    this.cy = cy;

    this.canvas;
    this.wrapper;
    this.ctx;

    this.offset;

    this.handleClicked = null;
    this.toolClicked = null;
    this.dragNode;
    this.dragEdge;
    this.hoverNode;

    this.selectedLink = null;
    this.selectedConcept = null;
    this.selectedNode = null;

    this.downState = null;
    this.moveState = null;
    this.handleState = null;
    this.toolState = null;
    this.tapHoldState = false;
    this.tapHoldPosition = null;

    this.handles = [];
    this.tools = [];
    this.additionalTools = []; // add-on tools holder

    let settings = {};
    this.host; // host reference holder, as event listener
    this.edgeSettings; // settings reference holder, modifiable from outside
    this.settings = settings = Object.assign({}, defaults, options);

    this.host = settings.host;

    // console.warn(this.host)

    this.edgeSettings = Object.assign({
      enableNodeCreationTools: true,
      enableNodeTools: true,
      enableNodeModificationTools: true,
      enableConnectionTools: true,
      enableConceptCreationTools: true,
      enableLinkCreationTools: true,
      isDirected: true
    }, settings.edgeSettings);

    this.iconCenter = new Image();
    this.iconSwitch = new Image();
    this.iconDelete = new Image();
    this.iconDeleteAll = new Image();
    this.iconEdit = new Image();
    this.iconDuplicate = new Image();
    this.iconBook = new Image();
    this.iconConcept = new Image();
    this.iconLink = new Image();

    this.iconCenter.src = defaults['icon-center'];
    this.iconSwitch.src = defaults['icon-switch'];
    this.iconDelete.src = defaults['icon-delete'];
    this.iconDeleteAll.src = defaults['icon-delete-all'];
    this.iconEdit.src = defaults['icon-edit'];
    this.iconDuplicate.src = defaults['icon-duplicate'];
    this.iconBook.src = defaults['icon-book'];
    this.iconConcept.src = defaults['icon-concept'];
    this.iconLink.src = defaults['icon-link'];

  }

  resetState() {
    this.handleClicked = null;
    this.toolClicked = null;
    this.selectedLink = null;
    this.selectedConcept = null;
    this.selectedNode = null;
    this.downState = null;
    this.moveState = null;
    this.handleState = null;
    this.toolState = null;
    this.tapHoldState = false;
  }

  start(opts) {
    if (typeof DEBUG == 'boolean' && DEBUG)
      console.log('Online Collaboration Kit-Build System starting...');
    this.settings['toolkit-canvas-id'] += '-' + this.host.settings.canvasId;
    this.canvas = $('<canvas id="' + this.settings['toolkit-canvas-id'] + '"></canvas>');
    this.wrapper = $(this.cy.container());
    this.wrapper.children("div").append(this.canvas);
    this.offset = this.wrapper.offset();

    this.ctx = this.canvas.get(0).getContext('2d');
    this.cy.on('resize', this.onResize.bind(this));
    this.cy.on('zoom', this.onZoomPan.bind(this));
    this.cy.on('tap', 'node', this.onNodeClick.bind(this));
    this.cy.on('doubleTap', 'node', this.onNodeDoubleClick.bind(this));
    this.cy.on('doubleTap', 'edge', this.onEdgeDoubleClick.bind(this));
    this.cy.on('tap', 'edge', this.onEdgeClick.bind(this));
    this.cy.on('mouseover', 'node', this.onNodeMouseOver.bind(this));
    this.cy.on('mouseout', 'node', this.onNodeMouseOut.bind(this));
    this.cy.on('tapstart', 'node', this.onNodeMouseDown.bind(this));
    this.cy.on('select', 'node', this.onNodeSelected.bind(this));
    this.cy.on('taphold', 'node', this.onNodeTapHold.bind(this));
    this.cy.on('taphold', this.onTapHold.bind(this));

    let host = this.host;
    let cy = this.cy;

    this.cy.on('grabon', 'node', function (e) {
      if (DEBUG) console.log('on node grabon', e);
      e.target.addClass('drag-parent');
      let nodes = cy.nodes(':selected');
      nodes.forEach(n => {
        n.data('px', parseInt(n.position().x));
        n.data('py', parseInt(n.position().y));
      })
    });
    this.cy.on('free', 'node.drag-parent', function (e) {
      if (DEBUG) console.log('on free drag-parent', e);
      e.target.removeClass('drag-parent');
    })
    this.cy.on('drag', 'node.drag-parent', function (e) {
      if (DEBUG) console.log('on drag drag-parent', e);
      let nodes = cy.nodes(':selected');
      let intersects = nodes.and(e.target);
      if (host && host.onCanvasNodeDragGroup &&
        (intersects.length == 1 && nodes.length > 1)) {
        let draggedNodes = [];
        nodes.forEach(node => {
          let n = cy.nodes('#' + node.id());
          let data = n.data();
          n.removeData('state');
          data.x = n.position().x;
          data.y = n.position().y;
          draggedNodes.push(data);
        });
        host.onCanvasNodeDragGroup(e.target, draggedNodes);
      } else {
        let data = e.target.data();
        data.x = e.target.position().x;
        data.y = e.target.position().y;
        if (host && host.onCanvasNodeDrag)
          host.onCanvasNodeDrag(e.target, data);
      }
    });
    this.cy.on('dragfreeon', 'node', function (e) {
      if (DEBUG) console.log('on node dragfreeon', e);
      if (!e.target) return;
      e.target.removeData('state');
      let data = e.target.data();
      let selectedNodes = cy.nodes(':selected');
      let intersects = selectedNodes.and(e.target);
      if (intersects.length == 0) {
        selectedNodes.unselect();
        let px = data.px;
        let py = data.py;
        e.target.select();
        e.target.data('px', px);
        e.target.data('py', py);
      }
      if (host && host.onCanvasNodeMoveGroup &&
        selectedNodes.length > 1 && intersects.length == 1) {
        let movedNodes = [];
        selectedNodes.forEach(node => {
          let n = cy.nodes('#' + node.id());
          let data = n.data();
          delete data.state;
          data.x = n.position().x;
          data.y = n.position().y;
          movedNodes.push(data);
        });
        host.onCanvasNodeMoveGroup(e.target, movedNodes);
      } else {

        // if it is not connection-making by drag over
        if (!this.connectDragOver) {

          // check if overlap with other nodes
          let others = this.cy.nodes().difference(this.selectedNode);
          let overlapNode = null;
          for (let other of others) {
            if (this.nodeOverlap(this.selectedNode.boundingBox(), other.boundingBox())) {
              overlapNode = other;
              break;
            }
          }

          // if overlap after dragging, return it to the original position
          if (overlapNode != null) {
            this.selectedNode.position({
              x: this.selectedNode.data('px'),
              y: this.selectedNode.data('py')
            })
            data.x = parseInt(e.target.position().x);
            data.y = parseInt(e.target.position().y);
            host.onCanvasNodeMove(e.target, {
              x: data.px,
              y: data.py
            }, data);
          }

          let pos = this.selectedNode.position();

          // if it has been moved, log it and create Undo Move action on Canvas
          if (pos.x != this.selectedNode.data('px') || pos.y != this.selectedNode.data('py')) {
            data.x = parseInt(e.target.position().x);
            data.y = parseInt(e.target.position().y);
            host.onCanvasNodeMove(e.target, {
              x: data.px,
              y: data.py
            }, data);
          }

          this.clear();
          this.drawHandle(this.selectedNode);
          this.drawTool(this.selectedNode);

        }

      }
    }.bind(this));

    this.canvas.on('mousedown touchstart', this.onMouseDown.bind(this));
    this.canvas.on('mousemove', this.onMouseMove.bind(this));
    this.canvas.on('mouseup touchend', this.onMouseUp.bind(this));
    this.canvas.on('touchmove', this.onCanvasTouchMove.bind(this)); // otherwise this.offset is undefined

    Object.assign(this.cy, this);
    this.onResize(); // force redraw canvas
    return this;
  }

  updateSettings(options) {
    this.settings = Object.assign(this.settings, options);
    if (this.selectedNode != null) {
      this.clear();
      this.drawTool(this.selectedNode);
      if (this.selectedNode.data('type') == 'link') this.drawHandle(this.selectedNode);
    }
  }

  onCanvasTouchMove(e) {
    if (DEBUG) console.log('on canvas touch move', e);
    let touch = e.touches[0];
    let x = touch.pageX | 0;
    let y = touch.pageY | 0;
    x -= this.offset.left;
    y -= this.offset.top;

    if (this.downState == 'handle') {
      // Flag to remove or keep the handle edge
      this.moveState = 'drag';
      let pHoverNode = this.hoverNode;
      // simulate nodeMouseOver
      this.hoverNode = this.hoveredConcept(x, y);
      // simulate nodeMouseOut
      if (pHoverNode != null && this.cy.hoverNode == null) {
        this.dragEdge.remove();
        this.dragEdge = undefined;
        pHoverNode.css({
          'background-color': pHoverNode.data('color'),
          'opacity': 1.0
        });
      }
      //console.log(this.cy.hoverNode)
      this.clear();
      this.drawVirtualEdge(e);
    } else if (this.cy.downState == null &&
      (this.tools.length || this.handles.length)) {
      // kalau yang di touch-drag bukan tool atau handle
      this.clear();
    }
  }

  hoveredConcept(x, y) {
    let eles = this.cy.nodes('[type="concept"]');
    for (let i = 0; i < eles.length; i++) {
      let ele = eles[i];
      let bb = ele.renderedBoundingBox();
      if (bb.x1 < x && bb.x2 > x && bb.y1 < y && bb.y2 > y) {
        return ele;
      }
    }
    return null;
  }

  nodeOverlap(A, B) {
    // // If one rectangle is on left side of other  
    // if(bb1.x1 >= bb2.x2 || bb2.x1 >= bb1.x2) return false;
    // // if (l1.x >= r2.x || l2.x >= r1.x) {
    // //   return false;
    // // }
    // // // If one rectangle is above other  
    // if(bb1.y1 <= bb2.y2 || bb2.y1 <= bb1.y2) return false;
    // // if (l1.y <= r2.y || l2.y <= r1.y) {
    // //   return false;
    // // }
    return A.x1 < B.x2 && A.x2 > B.x1 && A.y1 < B.y2 && A.y2 > B.y1;
  }

  // Add-ons

  addTool(tool) {
    let assetsUrl = Core.instance().config('assets-url');
    tool.iconImage = new Image();
    tool.iconImage.src = assetsUrl + "vendors/octicons/svg/" + tool.icon + ".svg"
    this.additionalTools.push(tool);
  }

  // Enable-Disable

  enableNodeTools(enable = true) {
    this.edgeSettings.enableNodeTools = enable;
  }

  enableNodeModificationTools(enable = true) {
    this.edgeSettings.enableNodeModificationTools = enable;
  }

  enableConnectionTools(enable = true) {
    this.edgeSettings.enableConnectionTools = enable;
  }

  enableNodeCreationTools(enable = true) {
    this.edgeSettings.enableNodeCreationTools = enable;
    this.enableConceptCreationTools(enable);
    this.enableLinkCreationTools(enable);
  }

  enableConceptCreationTools(enable = true) {
    this.edgeSettings.enableConceptCreationTools = enable;
  }

  enableLinkCreationTools(enable = true) {
    this.edgeSettings.enableLinkCreationTools = enable;
  }

}