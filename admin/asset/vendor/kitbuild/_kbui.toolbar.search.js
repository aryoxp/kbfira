class SearchTool {

  constructor(canvas, canvasOptions) { // console.log(canvas, canvasOptions);
    this.canvas = canvas;
    this.canvasOptions = canvasOptions;
    this.listeners = [];
    this.foundNodes = new Map();
    this.currentKeyword = null;
    this.handleEvent();
  }

  attachEventListener(listener) {
    this.listeners.push(listener);
  }

  handleEvent() {

    $('#kbui-modal').find('.input-keyword').on('keyup', (e) => {

      $('#kbui-modal .kb-search-toolbar .bt-next').prop('disabled', true);
      $('#kbui-modal .kb-search-toolbar .bt-prev').prop('disabled', true);
      
      if (e.keyCode == 13) { // enter
        if(this.searchItemIndex == this.foundNodes.size - 1) 
          this.searchItemIndex = -1;
        $('#kbui-modal').find('.bt-next').trigger('click');
        return;
      }
      if (e.keyCode == 27) { // esc
        $(".kb-search-toolbar").hide();
        return;
      }
      let keyword = $(e.currentTarget).val();
      this.currentKeyword = keyword;
      this.search(keyword);
      
    });

    $('#kbui-modal').find('.bt-find').on('click', (e) => {

      $('#kbui-modal .kb-search-toolbar .bt-next').prop('disabled', true);
      $('#kbui-modal .kb-search-toolbar .bt-prev').prop('disabled', true);

      let keyword = $('#kbui-modal').find('.input-keyword').val();

      if (keyword == this.currentKeyword) {
        if(this.searchItemIndex == this.foundNodes.size - 1) 
          this.searchItemIndex = -1;
        $('#kbui-modal').find('.bt-next').trigger('click');
        return;
      }

      this.currentKeyword = keyword;
      this.search(keyword);
      
    });

    $('#kbui-modal').find('.bt-close').on('click', (e) => {
      $(".kb-search-toolbar").toggle();
    });

    $('#kbui-modal').find('.bt-next').on('click', (e) => {
      if (this.foundNodes.size > this.searchItemIndex + 1) {
        this.searchItemIndex++;
        let nextNode = this.foundNodes.get(this.searchItemIndex);
        nextNode.select();
        this.canvas.getCy().animate({
          center: {
            eles: nextNode
          },
          duration: 100
        });
        this.updateSearchToolbarUI();
      }
      this.listeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-next-search-item");
        }
      });
    });

    $('#kbui-modal').find('.bt-prev').on('click', (e) => {
      if (this.searchItemIndex > 0) {
        this.searchItemIndex--;
        let prevNode = this.foundNodes.get(this.searchItemIndex);
        prevNode.select();
        this.canvas.getCy().animate({
          center: {
            eles: prevNode
          },
          duration: 100
        });
        this.updateSearchToolbarUI()
      }
      this.listeners.forEach(listener => {
        if (listener != null && typeof listener.onToolbarEvent == 'function') {
          listener.onToolbarEvent("toolbar-prev-search-item");
        }
      });
    });
    
  }

  updateSearchToolbarUI() {
    // console.log(this.searchItemIndex, this.foundNodes.size)
    if (this.foundNodes.size > 1 && 
      this.searchItemIndex < this.foundNodes.size - 1)
      $('#kbui-modal .kb-search-toolbar .bt-next').prop('disabled', false);
    else $('#kbui-modal .kb-search-toolbar .bt-next').prop('disabled', true);
    if (this.searchItemIndex > 0)
      $('#kbui-modal .kb-search-toolbar .bt-prev').prop('disabled', false);
    else $('#kbui-modal .kb-search-toolbar .bt-prev').prop('disabled', true);

    if (this.foundNodes.size > 0) {
      let statusText = `${this.canvas.l.get('node')}: ${this.searchItemIndex + 1}/${this.foundNodes.size}`;
      this.updateSearchStatusText(statusText);
    } else this.updateSearchStatusText(this.canvas.l.get('no-results'));
  }

  toggle() {
    this.updateSearchStatusText()
    this.updateSearchToolbarUI()
    var top = $("#" + this.canvas.settings.canvasId).offset().top;
    var left = $("#" + this.canvas.settings.canvasId).offset().left;
    $(".kb-search-toolbar").css({
      top: top + 40 + "px",
      left: left
    });
    $(".kb-search-toolbar").slideToggle({
      duration: 50,
      complete: () => {
        if($(".kb-search-toolbar").is(':visible')) {
          $(".kb-search-toolbar .input-keyword").focus();
        }
      }
    });
  }

  search(keyword) {
    this.foundNodes.clear();
    if (keyword.trim().length == 0) {
      this.searchItemIndex = 0;
      this.updateSearchStatusText()
      this.updateSearchToolbarUI()
      return;
    }
    let nodes = this.canvas.getCy().nodes();
    nodes.unselect();
    let idx = 0;
    for (let n of nodes) {
      if( n.data("name").trim().toLowerCase().indexOf(keyword.toLowerCase().trim()) != -1 ) {
        this.foundNodes.set(idx, n);
        n.select()
        idx++;
      }
    }
    // console.log(this.foundNodes);
    this.updateSearchStatusText(`${this.foundNodes.size} nodes`)
    if (this.foundNodes.size > 0) {
      this.searchItemIndex = 0;
      let node = this.foundNodes.get(this.searchItemIndex);
      node.select();
      this.canvas.getCy().animate({
        center: {
          eles: node
        },
        duration: 100
      });
    }
    
    this.updateSearchToolbarUI();
    this.listeners.forEach(listener => {
      if (listener != null && typeof listener.onToolbarEvent == 'function') {
        listener.onToolbarEvent("toolbar-search", {
          keyword: $(e.currentTarget).val(),
          nodes: this.foundNodes
        });
      }
    });
  }

  updateSearchStatusText(text) {
    if (!text) $('.kb-search-toolbar .search-status').html('No results');
    $('.kb-search-toolbar .search-status').html(text);
  }

}