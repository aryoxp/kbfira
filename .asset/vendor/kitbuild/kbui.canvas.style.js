KitBuildCanvas.style = [{
  selector: 'node[type="concept"]',
  style: {
    'content': 'data(label)',
    'shape': 'roundrectangle',
    'background-color': '#FFBF40',
    'width': 'data(width)', // node.pstyle('font-size')
    'height': 'data(height)',
    'padding': 20,
    'text-valign': 'center',
    'text-halign': 'center',
    'text-wrap': 'wrap',
    'text-max-width': 120,
    'overlay-color': '#e8c672',
    'overlay-padding': 4,
    'line-height': 1.4,
    'font-family': "Fira Sans, Arial, Helvetica, sans-serif"
  }
}, {
  selector: 'node[type="link"]',
  style: {
    'content': 'data(label)',
    'width': 'data(width)',
    'height': 'data(height)',
    'shape': 'roundrectangle',
    'background-color': '#dedede',
    'background-opacity': 1.0,
    'padding': 10,
    'line-height': 1.4,
    'text-valign': 'center',
    'text-halign': 'center',
    'text-wrap': 'wrap',
    'text-max-width': 120,
    'overlay-color': '#cccccc',
    'overlay-padding': 1,
    'font-family': "Fira Sans, Arial, Helvetica, sans-serif"
  }
}, {
  selector: 'node[type="link"].leave',
  style: {
    'border-color': '#FF8C00',
    'border-width': 4,
    'border-opacity': 1,
    'border-style': 'solid'
  }
}, {
  selector: 'node:selected',
  style: {
    'border-color': '#ff0000',
    'border-width': 4,
    'border-opacity': 0.5,
    'border-style': 'solid'
  }
}, {
  selector: 'node.select',
  style: {
    'underlay-color': '#D04E42',
    'underlay-padding': 6,
    'underlay-opacity': .4,
    'underlay-shape': 'round-rectangle'
  } //: 
}, {
  selector: 'node.peer-select',
  style: {
    'underlay-color': '#668CFF',
    'underlay-padding': 10,
    'underlay-opacity': .4,
    'underlay-shape': 'round-rectangle'
  } //: 
}, {
  selector: 'node.notify',
  style: {
    'underlay-color': '#22BA73',
    'underlay-padding': 10,
    'underlay-opacity': .4,
    'underlay-shape': 'round-rectangle'
  } //: 
}, {
  selector: 'edge',
  style: {
    'curve-style': 'bezier',
    'target-distance-from-node': 3,
    'color': '#777777',
  }
}, {
  selector: 'edge[type="virtual"]',
  style: {
    'line-style': 'dashed',
    'line-color': '#C52233',
    'target-arrow-color': '#C52233',
    'opacity': 0.5,
  }
}, {
  selector: 'edge[type="left"]',
  style: {
    'opacity': 1,
    'target-arrow-shape': 'circle',
  }
}, {
  selector: 'edge[type="left"]:selected',
  style: {
    'line-color': '#CC0000',
    'target-arrow-color': '#CC0000',
  }
}, {
  selector: 'edge[type="right"]',
  style: {
    'target-arrow-shape': 'triangle',
    'arrow-scale': 1.7,
    'opacity': 1,
  }
}, {
  selector: 'edge.bi',
  style: {
    'target-arrow-shape': 'circle',
    'target-arrow-color': '#777777',
    'arrow-scale': 1,
    'opacity': 1,
    'color': '#777777',
  }
}, {
  selector: 'edge[state="candidate"]',
  style: {
    'line-style': 'dashed',
    'opacity': 1,
  }
}, {
  selector: 'edge.select',
  style: {
    'line-color': '#EB4034',
    'target-arrow-color': '#EB4034',
  }
}, {
  selector: 'edge.match',
  style: {
    'line-color': '#3AB795',
    'target-arrow-color': '#3AB795',
  }
}, {
  selector: 'edge.excess',
  style: {
    'line-color': '#5BC0EB',
    'target-arrow-color': '#5BC0EB',
  }
}, {
  selector: 'edge.miss',
  style: {
    'line-color': '#EB4034',
    'target-arrow-color': '#EB4034',
    'line-style': 'dashed',
  }
}, {
  selector: 'edge.expect',
  style: {
    'line-color': '#f0ad4e',
    'line-style': 'dashed',
    'font-family': "Fira Sans, Arial, Helvetica, sans-serif",
    'label': 'data(label)',
    'text-background-padding': 7,
    'text-background-shape': 'rectangle',
    'text-background-color': '#ffffff',
    'text-background-opacity': 1.0,
    'text-border-color': '#f0ad4e',
    'text-border-width': 1,
    'text-border-opacity': 1
  }
}, {
  selector: 'edge.count',
  style: {
    'font-family': "Fira Sans, Arial, Helvetica, sans-serif",
    'label': function(edge) {
      return ' ' + edge.data('count') + ' '
    },
    'text-background-padding': 7,
    'text-background-shape': 'rectangle',
    'text-background-color': '#ffffff',
    'text-background-opacity': 1.0,
    'text-border-color': function(edge) {
      return edge.style('line-color') 
        ? edge.style('line-color') 
        : '#777777'
    },
    'text-border-width': 1,
    'text-border-opacity': 1
  }
}, {
  selector: '.hide',
  style: {
    'opacity': 0
  }
}]