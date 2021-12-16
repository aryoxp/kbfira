var CanvasStyle = {};

CanvasStyle.directedStyle = [{
    selector: '.c1',
    style: {
      'background-color': '#FFE0E0'
    }
  },
  {
    selector: '.c2',
    style: {
      'background-color': '#FFD97D'
    }
  },
  {
    selector: '.c3',
    style: {
      'background-color': '#D0EFB1'
    }
  },
  {
    selector: '.c4',
    style: {
      'background-color': '#B5E3E5'
    }
  },
  {
    selector: '.c5',
    style: {
      'background-color': '#E5E2FF'
    }
  },
  {
    selector: '.hidden',
    style: {
      'display': 'none'
    }
  },
  {
    selector: '.invisible',
    style: {
      'visibility': 'hidden'
    }
  },
  {
    selector: 'node[type="concept"]',
    style: {
      'content': 'data(name)',
      'shape': 'roundrectangle',
      'background-color': '#FFD97D',
      'width': 'label',
      'height': 'label',
      'padding': 10,
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': 120,
      'overlay-color': '#e8c672',
      'overlay-padding': 4,
      'font-family': 'Arial, sans-serif'
    }
  },
  {
    selector: 'node[type="concept"][color]',
    style: {
      'background-color': 'data(color)',
    }
  },
  {
    selector: 'node[type="concept"][textColor]',
    style: {
      'color': 'data(textColor)',
    }
  },
  {
    selector: 'node[state="new"][type="concept"]',
    style: {
      'border-color': '#BA9E5B',
      'border-width': 2,
      'border-opacity': 0.5,
      'border-style': 'dashed'
    }
  },
  {
    selector: 'node[type="concept"][concept="miss"]',
    style: {
      'border-style': 'solid',
      'border-color': '#f9844a',
      'border-width': 8,
      'border-opacity': .7,
    }
  },
  {
    selector: 'node[type="concept"][match]',
    style: {
      'border-width': 0,
      'border-opacity': 0,
      'border-style': 'solid'
    }
  },
  {
    selector: 'node[type="link"]',
    style: {
      'content': 'data(name)',
      'shape': 'roundrectangle',
      'background-color': '#f4f4f4',
      'background-opacity': 1.0,
      'width': 'label',
      'height': 'label',
      'padding': 4,
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': 120,
      'overlay-color': '#cccccc',
      'overlay-padding': 1,
      'font-family': 'Arial, sans-serif'
    }
  },
  {
    selector: 'node[state="new"][type="link"]',
    style: {
      'border-color': '#777777',
      'border-width': 2,
      'border-opacity': 0.5,
      'border-style': 'dashed',
      'padding': 10
    }
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#ff0000',
      'border-width': 4,
      'border-opacity': 0.5,
      'border-style': 'solid'
    }
  },
  {
    selector: 'node[type="link"]:selected',
    style: {
      'background-color': '#eeeeee',
      'background-opacity': 1.0,
      'padding': 6
    }
  },
  {
    selector: 'edge',
    style: {
      'text-background-color': '#ffffff',
      'text-background-opacity': 1.0,
      'color': '#777777',
      'padding': 2
    }
  },
  {
    selector: 'edge[type="right"]',
    style: {
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-distance-from-node': 2,
      // 'line-color': '#5BC0EB',
      'line-color': '#3AB795',
      // 'target-arrow-color': '#5BC0EB',
      'target-arrow-color': '#3AB795',
      'arrow-scale': 1.5
    }
  },
  {
    selector: 'edge[type="left"]',
    style: {
      'curve-style': 'bezier',
      'source-arrow-shape': 'triangle',
      'source-distance-from-node': 2,
      // 'line-color': '#C52233',
      'line-color': '#3AB795',
      // 'source-arrow-color': '#C52233',
      'source-arrow-color': '#3AB795',
      'arrow-scale': 1.5
    }
  },
  {
    selector: 'edge[type="virtual-left"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#C52233',
      'target-arrow-color': '#C52233',
      'opacity': 0.5,
      'target-distance-from-node': 5
    }
  },
  {
    selector: 'edge[type="virtual-right"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#5BC0EB',
      'target-arrow-color': '#5BC0EB',
      'opacity': 0.5,
      'target-distance-from-node': 5
    }
  },
  {
    selector: 'edge[link="match"][match]',
    style: {
      'width': 'mapData(match, 0, 30, 2, 12)'
    }
  },
  {
    selector: 'edge[link="miss"][match]',
    style: {
      'width': 'mapData(match, 0, 30, 2, 12)',
      'line-color': '#eb4034',
      'target-arrow-color': '#eb4034',
      'source-arrow-color': '#eb4034',
      'line-style': 'dashed'
    }
  },
  {
    selector: 'edge[link="ex"]',
    style: {
      'line-color': '#5BC0EB',
      'target-arrow-color': '#5BC0EB',
      'source-arrow-color': '#5BC0EB',
      'line-style': 'solid'
    }
  },
  {
    selector: 'edge[link="ex"][match]',
    style: {
      'width': 'mapData(match, 0, 30, 2, 12)',
      'line-color': '#5BC0EB',
      'target-arrow-color': '#5BC0EB',
      'source-arrow-color': '#5BC0EB',
      'line-style': 'solid'
    }
  },
  {
    selector: 'edge[link="exdash"][match]',
    style: {
      'width': 'mapData(match, 0, 30, 2, 12)',
      'line-color': '#5BC0EB',
      'target-arrow-color': '#5BC0EB',
      'source-arrow-color': '#5BC0EB',
      'line-style': 'dashed'
    }
  },
  {
    selector: 'edge[link="hint"]',
    style: {
      'line-color': '#f48c06',
      'target-arrow-color': '#f48c06',
      'source-arrow-color': '#f48c06',
      'line-style': 'dashed'
    }
  },
  {
    selector: 'edge[label]',
    style: {
      'label': 'data(label)'
    }
  }
];
CanvasStyle.directedOptions = {
  'link-color': '#777777',
  'link-in-color': '#C52233',
  'link-out-color': '#5BC0EB',
  'handle-size': 20
}
CanvasStyle.undirectedOptions = {
  'link-color': '#777777',
  'link-in-color': '#777777',
  'link-out-color': '#777777',
  'handle-size': 20
}