class SelectionTool {

  constructor(canvas, canvasOptions) { // console.log(canvas, canvasOptions);
    this.canvas = canvas;
    this.canvasOptions = canvasOptions;
    this.listeners = [];
    this.handleEvent();
  }

  attachEventListener(listener) {
    this.listeners.push(listener);
  }

  handleEvent() {
    let canvas = this.canvas;

    $('.kb-node-selection-toolbar').on('click', '.close', function () {
      $('.kb-node-selection-toolbar').hide();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-select-all', function () {
      canvas.getCanvasTool().clear();
      if (canvas.getCy().nodes(':selected').length == canvas.getCy().nodes().length)
        canvas.getCy().nodes().unselect();
      else canvas.getCy().nodes().select();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-select-concepts', function () {
      canvas.getCy().nodes('[type="link"]:selected').unselect();
      canvas.getCanvasTool().clear();
      if (canvas.getCy().nodes('[type="concept"]:selected').length == canvas.getCy().nodes('[type="concept"]').length)
        canvas.getCy().nodes('[type="concept"]').unselect();
      else canvas.getCy().nodes('[type="concept"]').select();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-select-links', function () {
      canvas.getCy().nodes('[type="concept"]:selected').unselect();
      canvas.getCanvasTool().clear();
      if (canvas.getCy().nodes('[type="link"]:selected').length == canvas.getCy().nodes('[type="link"]').length)
        canvas.getCy().nodes('[type="link"]').unselect();
      else canvas.getCy().nodes('[type="link"]').select();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-select-disconcepts', function () {
      canvas.getCy().nodes('[type="link"]:selected').unselect();
      canvas.getCanvasTool().clear();
      if (canvas.getCy().nodes('[type="concept"]:selected').filter(function (ele) {
          return ele.connectedEdges().length == 0;
        }).length == canvas.getCy().nodes('[type="concept"]').filter(function (ele) {
          return ele.connectedEdges().length == 0;
        }).length)
        canvas.getCy().nodes('[type="concept"]').unselect();
      else
        canvas.getCy().nodes('[type="concept"]').filter(function (ele) {
          return ele.connectedEdges().length == 0;
        }).select();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-select-dislinks', function () {
      canvas.getCy().nodes('[type="concept"]:selected').unselect();
      canvas.getCanvasTool().clear();
      if (canvas.getCy().nodes('[type="link"]:selected').filter(function (ele) {
          return ele.connectedEdges().length < 2;
        }).length == canvas.getCy().nodes('[type="link"]').filter(function (ele) {
          return ele.connectedEdges().length < 2;
        }).length)
        canvas.getCy().nodes('[type="link"]').unselect();
      else
        canvas.getCy().nodes('[type="link"]').filter(function (ele) {
          return ele.connectedEdges().length < 2;
        }).select();
    })

    $('.kb-node-selection-toolbar').on('click', '.bt-align-start', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let min = Number.MAX_SAFE_INTEGER;
      if(nodes.length < 2) return;

      for (let node of nodes) {
        min = node.position().x < min ? node.position().x : min;
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: min,
          y: node.position().y
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });

    $('.kb-node-selection-toolbar').on('click', '.bt-align-center', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let avg = 0;
      if(nodes.length < 2) return;

      for (let node of nodes) {
        avg += parseInt(node.position().x);
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      avg = parseInt(avg/nodes.length);
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: avg,
          y: node.position().y
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });

    $('.kb-node-selection-toolbar').on('click', '.bt-align-end', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let max = Number.MIN_SAFE_INTEGER;
      if(nodes.length < 2) return;
      
      for (let node of nodes) {
        max = node.position().x > max ? node.position().x : max;
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: max,
          y: node.position().y
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });

    $('.kb-node-selection-toolbar').on('click', '.bt-align-top', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let min = Number.MAX_SAFE_INTEGER;
      if(nodes.length < 2) return;

      for (let node of nodes) {
        min = node.position().y < min ? node.position().y : min;
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: node.position().x,
          y: min
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });

    $('.kb-node-selection-toolbar').on('click', '.bt-align-middle', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let avg = 0;
      if(nodes.length < 2) return;

      for (let node of nodes) {
        avg += parseInt(node.position().y);
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      avg = parseInt(avg/nodes.length);
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: node.position().x,
          y: avg
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });

    $('.kb-node-selection-toolbar').on('click', '.bt-align-bottom', function (e) {
      let nodes = canvas.getCy().nodes(':selected');
      let max = Number.MIN_SAFE_INTEGER;
      if(nodes.length < 2) return;

      for (let node of nodes) {
        max = node.position().y > max ? node.position().y : max;
        node.data('px', parseInt(node.position().x));
        node.data('py', parseInt(node.position().y));
      }
      let movedNodes = [];
      for (let node of nodes) {
        // move the node
        node.position({
          x: node.position().x, 
          y: max
        });
        let data = node.data();
        delete data.state;
        data.x = node.position().x;
        data.y = node.position().y;
        movedNodes.push(data);
      }
      if(canvas.onCanvasNodeMoveGroup)
        canvas.onCanvasNodeMoveGroup(null, movedNodes);
    });
    
  }
}