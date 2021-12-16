// Undo/Redo Action
// The stack no longer use global stack
// to support multi instance

class Action {

  constructor(canvas) { // console.log(canvas);
    this.canvas = canvas;
    this.undoButton = $('#' + canvas.settings.canvasId).parent('.kb-container').find('.bt-undo');
    this.redoButton = $('#' + canvas.settings.canvasId).parent('.kb-container').find('.bt-redo');
    this.enabled = true;
    this.eventListeners = [];
    this.undoStack = [];
    this.redoStack = [];
    return this;
  }

  enable(enabled) {
    this.enabled = enabled;
    return this;
  }

  attachEventListener(listener) { 
    this.eventListeners.push(listener);
  }

  push(command) { 

    if(!this.enabled) return;

    this.command = command;
    this.undoStack.push(this.command);
    this.redoStack = [];
    this.updateUI();
    return this;
  }

  undo() { // undo forwarder
    if (this.undoStack.length > 0) {
      let command = this.undoStack.pop(); command.cy = this.canvas.getCy();
      let undoCommand = command.undo();
      this.eventListeners.forEach(listener => { 
        if(listener != null && typeof listener.onActionEvent == 'function')
        listener.onActionEvent(undoCommand.action, undoCommand.data);
      });
      this.redoStack.push(command);
    }
    this.updateUI();
  }

  redo() { // redo forwarder
    if (this.redoStack.length > 0) {
      let command = this.redoStack.pop(); command.cy = this.canvas.getCy();
      let redoCommand = command.redo();
      this.eventListeners.forEach(listener => {
        if(listener != null && typeof listener.onActionEvent == 'function')
        listener.onActionEvent(redoCommand.action, redoCommand.data);
      });
      this.undoStack.push(command);
    }
    this.updateUI();
  }

  updateUI() { // console.log(this.undoStack, this.redoStack, $(this.undoButton), $(this.redoButton));
    if (this.undoStack.length) $(this.undoButton).removeClass('disabled');
    else $(this.undoButton).addClass('disabled');
    if (this.redoStack.length) $(this.redoButton).removeClass('disabled');
    else $(this.redoButton).addClass('disabled');
    return this;
  }

  clearStack() {
    this.undoStack = [];
    this.redoStack = [];
    this.updateUI();
    return this;
  }

}