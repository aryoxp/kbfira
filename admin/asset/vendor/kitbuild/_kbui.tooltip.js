class CreateTool {
  constructor(canvasId, callback) {
    this.type = null;
    this.callback = callback;
    this.canvasElement = $('#' + canvasId);
    this.createToolElement = $('<div class="canvas-create-tool" style="">' +
      '  <div class="canvas-create-node-label" contenteditable="true"></>' +
      '</div>');
    this.canvasElement.parent().append(this.createToolElement);
    this.createToolElement.hide();
    let createToolElement = this.createToolElement;
    let createTool = this;

    let create = function(label) {
      if(label != '') {
        $('.canvas-create-node-label').text('');
        if(typeof createTool.callback == 'function') createTool.callback({
          type: createTool.type,
          label: label,
          position: createTool.tapHoldPosition
        })
      } 
      createToolElement.hide();
    }

    $('.canvas-create-node-label').on('blur', function(){
      let label = $(this).html().replace(/<\/?(br|div)>/gi, "\n").trim();
      if(label != '') create(label)
      else createToolElement.hide();
    })
    $('.canvas-create-node-label').on('keyup', function(e){
      if(e.keyCode == 13 && !e.shiftKey) {
        let label = $(this).html().replace(/<\/?(br|div)>/gi, "\n").trim();
        if(label != '') create(label)
        else createToolElement.hide();
      }
    })
  }
  setCallback(callback) {
    this.callback = callback;
  }
  show(tool) {
    this.tapHoldPosition = tool.tapHoldPosition;
    let offset = this.canvasElement.offset();
    let element = this.createToolElement.fadeIn(10);
    this.type = tool.type;
    this.createToolElement.offset({
      top: tool.tapHoldPosition.y + offset.top - element.outerHeight(),
      left: tool.tapHoldPosition.x + offset.left - element.outerWidth() / 2
    });
    this.createToolElement.css('background-color', tool.color);
    this.createToolElement.css('color', tool.textColor);
    $('.canvas-create-node-label').focus();
  }
  hide(){
    this.createToolElement.hide();
  }
}

class Tooltip {

  constructor(canvasId) {
    this.canvasElement = $('#' + canvasId);
    this.tooltipElement = $('<div class="canvas-tooltip">' +
      '  <div class="canvas-tooltip-text">-</div>' +
      '</div>');
    this.canvasElement.parent().append(this.tooltipElement);
    this.tooltipElement.hide();
  }

  show(hoveredTool, label) {
    $('.canvas-tooltip-text').html(label);
    let offset = this.canvasElement.offset();
    let tooltip = this.tooltipElement.fadeIn(100);
    this.tooltipElement.offset({
      top: hoveredTool.y + offset.top - tooltip.outerHeight() - 30,
      left: hoveredTool.x + offset.left - tooltip.outerWidth() / 2
    });
    this.tooltipElement.css('border-color', hoveredTool.color + "77");
  }

  hide() {
    this.tooltipElement.hide();
  }

  fadeOut(speed) {
    this.tooltipElement.fadeOut(speed);
  }

}