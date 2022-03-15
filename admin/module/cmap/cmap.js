$(() => { // jQuery onReady callback
  let app = CmapApp.instance()
})

class CmapApp {
  constructor() {
    this.kbui = KitBuildUI.instance(CmapApp.canvasId)
    let canvas = this.kbui.canvases.get(CmapApp.canvasId)
    canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addToolbarTool(KitBuildToolbar.NODE_CREATE, { priority: 2 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5 })
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.SHARE, { priority: 6 })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { priority: 7 })
    canvas.toolbar.render()

    canvas.addCanvasTool(KitBuildCanvasTool.DELETE)
    canvas.addCanvasTool(KitBuildCanvasTool.DUPLICATE)
    canvas.addCanvasTool(KitBuildCanvasTool.EDIT)
    canvas.addCanvasTool(KitBuildCanvasTool.SWITCH)
    canvas.addCanvasTool(KitBuildCanvasTool.DISCONNECT)
    canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)
    canvas.addCanvasTool(KitBuildCanvasTool.CREATE_CONCEPT)
    canvas.addCanvasTool(KitBuildCanvasTool.CREATE_LINK)
    canvas.addCanvasTool(KitBuildCanvasTool.LOCK) // also UNLOCK toggle

    canvas.addCanvasMultiTool(KitBuildCanvasTool.DELETE)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.DUPLICATE)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.UNLOCK)
    
    this.canvas = canvas

    this.session = Core.instance().session()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${canvas.canvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip() 

    // Browser lifecycle event
    KitBuildUI.addLifeCycleListener(CmapApp.onBrowserStateChange)

    // console.log(typeof Logger)
    if (typeof CmapLogger != 'undefined') {
      this.logger = CmapLogger.instance(null, 0, null, canvas)
        .enable();
      CmapApp.loggerListener = 
        this.logger.onCanvasEvent.bind(this.logger)
      canvas.on("event", CmapApp.loggerListener)
    }

    this.handleEvent()
    this.handleRefresh()
  }

  static instance() {
    CmapApp.inst = new CmapApp()
  }

  setConceptMap(conceptMap) { console.warn("CONCEPT MAP SET:", conceptMap)
    this.conceptMap = conceptMap;
    if (conceptMap) {
      this.canvas.direction = conceptMap.map.direction;
      this.session.set('cmid', conceptMap.map.cmid)
      let status = `<span class="mx-2 d-flex align-items-center">`
        + `<span class="badge rounded-pill bg-secondary">ID: ${conceptMap.map.cmid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${conceptMap.map.title}</small></span>`
        + `</span>`
      StatusBar.instance().content(status);
    } else {
      StatusBar.instance().content('');
      this.session.unset('cmid')
    }
  }

  handleEvent() {

    this.canvas = this.kbui.canvases.get(CmapApp.canvasId)
    this.ajax = Core.instance().ajax()
    this.session = Core.instance().session()
  
    let saveAsDialog = UI.modal('#concept-map-save-as-dialog', {
      onShow: () => { 
        $('#concept-map-save-as-dialog .input-title').focus();
        console.log(this.session)
        let sessions = this.session ? this.session.sessionData : null;
        if (sessions.user) {
          KitBuild.getTopicListOfGroups(sessions.user.gids.split(",")).then(topics => {
            console.log(topics,sessions.user.gids)
            let list = '<option value="">No topic associated</option>'
            topics.forEach(topic => {
              let selected = (this.conceptMap.map.topic == topic.tid) ? ' selected' : '';
              if(selected == '' && CmapApp.topic && CmapApp.topic.tid == topic.tid)
                selected = ' selected';
              list += `<option value="${topic.tid}"${selected}>${topic.title}</option>`;
            })
            $('#select-topic').html(list);
          });
        }
      },
      hideElement: '.bt-cancel'
    })
    saveAsDialog.setConceptMap = (conceptMap) => {
      if (conceptMap) {
        saveAsDialog.cmid = conceptMap.map.cmid
        $('#input-fid').val(conceptMap.map.cmfid)
        $('#input-title').val(conceptMap.map.title)
        $('#select-topic').val(conceptMap.map.topic)
        $('#select-text').val(conceptMap.map.text)
        saveAsDialog.create_time = conceptMap.map.create_time
      } else {
        saveAsDialog.cmid = null
        $('#input-fid').val('')
        $('#input-title').val('')
        $('#select-topic').val(null)
        $('#select-text').val(null)
      }
      return saveAsDialog;
    }
    saveAsDialog.setTitle = (title) => {
      $('#concept-map-save-as-dialog .dialog-title').html(title)
      return saveAsDialog
    }
    saveAsDialog.setIcon = (icon) => {
      $('#concept-map-save-as-dialog .dialog-icon').removeClass()
        .addClass(`dialog-icon bi bi-${icon} me-2`)
      return saveAsDialog
    }
  
    let openDialog = UI.modal('#concept-map-open-dialog', {
      hideElement: '.bt-cancel'
    })
  
    let exportDialog = UI.modal('#concept-map-export-dialog', {
      hideElement: '.bt-cancel'
    })

    let topicDialog = UI.modal("#assign-topic-dialog", {
      hideElement: ".bt-close",
      onShow: () => {
        console.warn(topicDialog.cmapTitle)
        $("#assign-topic-dialog .cmap-title").html(topicDialog.cmapTitle);
      }
    });
    topicDialog.setTopic = (topic = null) => {
      $("#assign-topic-dialog .cmap-topic").html(topic ? topic.title + `<span class="badge rounded-pill bt-deassign-topic-from-cmap ms-2 bg-danger" role="button" data-cmid="${topicDialog.cmid}">Remove</span>` : `<em class="text-muted">Not specified.</em>`);
    }

    let textDialog = UI.modal('#assign-text-dialog', {
      hideElement: '.bt-close',
      onShow: () => { // console.log(textDialog.topic)
        if (!textDialog.cmap) {
          UI.error("Invalid concept map.").show();
          return;
        }
        let tid = textDialog.cmap.map.text;
        let title = textDialog.cmap.map.title;
        if (textDialog.cmap.map.text) 
          this.ajax.get(`contentApi/getText/${tid}`).then(text => textDialog.setText(text));
        $('#assign-text-dialog form.form-search-text').trigger('submit')
        $("#assign-text-dialog .cmap-title").html(title)
      }
    })
    textDialog.setCmap = (cmap) => {
      textDialog.cmap = cmap;
      return textDialog;
    }
    textDialog.setText = (text = null) => {
      $("#assign-text-dialog .assigned-text").html(text ? `<span class="text-primary">${text.title}</span> <span class="badge rounded-pill bt-deassign-text-from-cmap ms-2 bg-danger" role="button" data-cmid="${textDialog.cmap.map.cmid}">Remove</span>` : `<em class="text-muted">Not specified.</em>`);
    }
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * 
     * New Map
    */
  
    $('.app-navbar .bt-new').on('click', () => {
      let proceed = () => {
        this.canvas.reset()
        this.setConceptMap(null)
        UI.info("Canvas has been reset").show()
      }
      if (this.canvas.cy.elements().length > 0 || this.conceptMap) {
        let confirm = UI.confirm("Discard this map and create a new concept map from scratch?")
          .positive(() => {
            proceed()
            confirm.hide()
            return
          })
          .show()
        return
      }
      proceed()
    })
    
    $('.app-navbar .bt-save').on('click', () => { // console.log(CmapApp.inst)
      if (!this.conceptMap) $('.app-navbar .bt-save-as').trigger('click')
      else saveAsDialog.setConceptMap(this.conceptMap)
        .setTitle("Save Concept Map (Update)")
        .setIcon("file-earmark-check")
        .show()
    })
    
    $('.app-navbar .bt-save-as').on('click', () => {
      if (this.canvas.cy.elements().length == 0) {
        UI.warning("Nothing to save. Canvas is empty.").show()
        return
      }
      saveAsDialog.setConceptMap()
        .setTitle("Save Concept Map As...")
        .setIcon("file-earmark-plus")
        .show()
    })
  
    $('#concept-map-save-as-dialog').on('click', '.bt-generate-fid', (e) => { // console.log(e)
      $('#input-fid').val($('#input-title').val().replace(/\s/g, '').substring(0, 15).trim().toUpperCase()),
      e.preventDefault()
    })
  
    $('#concept-map-save-as-dialog').on('click', '.bt-new-topic-form', (e) => { // console.log(e)
      $('#concept-map-save-as-dialog .form-new-topic').slideDown('fast')
      e.preventDefault()
    })
  
    $('#concept-map-save-as-dialog').on('submit', (e) => {
      e.preventDefault()
      let data = Object.assign({
        cmid: saveAsDialog.cmid ? saveAsDialog.cmid : null,
        cmfid: $('#input-fid').val().match(/^ *$/) ? null : $('#input-fid').val().trim().toUpperCase(),
        title: $('#input-title').val(),
        direction: this.canvas.direction,
        topic: $('#select-topic').val().match(/^ *$/) ? null : $('#select-topic').val().trim(),
        text: undefined,
        author: this.user ? this.user.username : null,
        create_time: null
      }, KitBuildUI.buildConceptMapData(this.canvas)); // console.log(data); return
      if (data.cmid === null) delete data.cmid;
      this.ajax.post("kitBuildApi/saveConceptMap", { data: Core.compress(data) })
        .then(conceptMap => { 
          this.setConceptMap(conceptMap);
          UI.success("Concept map has been saved successfully.").show(); 
          saveAsDialog.hide(); 
        })
        .catch(error => { UI.error("Error saving concept map: " + error).show(); })
    })
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * 
     * Open
    */
  
    $('.app-navbar .bt-open').on('click', () => {
      openDialog.show()
      let tid = openDialog.tid;
      if (!tid) $('#concept-map-open-dialog .list-topic .list-item.default').trigger('click');
      else $(`#concept-map-open-dialog .list-topic .list-item[data-tid="${tid}"]`).trigger('click');
      $('#concept-map-open-dialog .bt-refresh-topic-list').trigger('click');
    })
  
    $('#concept-map-open-dialog .list-topic').on('click', '.list-item', (e) => {
      if (openDialog.tid != $(e.currentTarget).attr('data-tid')) // different concept map?
        openDialog.cmid = null; // reset selected concept map id.
      openDialog.tid = $(e.currentTarget).attr('data-tid');
      $('#concept-map-open-dialog .list-topic .bi-check-lg').addClass('d-none');
      $('#concept-map-open-dialog .list-topic .list-item').removeClass('active');
      $(e.currentTarget).find('.bi-check-lg').removeClass('d-none');
      $(e.currentTarget).addClass('active');
  
      this.ajax.get(`kitBuildApi/getConceptMapListByTopic/${openDialog.tid}`).then(cmaps => { // console.log(cmaps)
        let cmapsHtml = '';
        cmaps.forEach(cm => {
          cmapsHtml += `<span class="concept-map list-item" data-cmid="${cm.cmid}" data-cmfid="${cm.cmfid}">`
            + `<span class="text-truncate">${cm.title}</span>`
            + `<bi class="bi bi-check-lg text-primary d-none"></bi></span>`
        })
        $('#concept-map-open-dialog .list-concept-map').slideUp({
          duration: 100,
          complete: () => {
            $('#concept-map-open-dialog .list-concept-map')
              .html(cmapsHtml).slideDown({
                duration: 100,
                complete: () => {
                  if(openDialog.cmid) {
                    $(`#concept-map-open-dialog .list-concept-map .list-item[data-cmid="${openDialog.cmid}"]`)
                      .trigger('click')[0]
                      .scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                      });
                  } else $('#concept-map-open-dialog .list-concept-map').scrollTop(0)
                }
              })
          }
        })
      })
    })
  
    $('#concept-map-open-dialog .list-concept-map').on('click', '.list-item', (e) => {
      openDialog.cmid = $(e.currentTarget).attr('data-cmid');
      $('#concept-map-open-dialog .list-concept-map .bi-check-lg').addClass('d-none');
      $('#concept-map-open-dialog .list-concept-map .list-item').removeClass('active');
      $(e.currentTarget).find('.bi-check-lg').removeClass('d-none');
      $(e.currentTarget).addClass('active');
    })
    
    $('#concept-map-open-dialog .bt-refresh-topic-list').on('click', () => {
      this.ajax.get('kitBuildApi/getTopicList').then(topics => { // console.log(topics)
        let topicsHtml = '';
        topics.forEach(t => { // console.log(t);
          topicsHtml += `<span class="topic list-item" data-tid="${t.tid}">`
           + `<span>${t.title}</span>`
           + `<bi class="bi bi-check-lg text-primary d-none"></bi></span>`
        });
        $('#concept-map-open-dialog .list-topic').slideUp({
          duration: 100,
          complete: () => {
            $('#concept-map-open-dialog .list-topic .list-item').not('.default').remove()
            $('#concept-map-open-dialog .list-topic').append(topicsHtml).slideDown(100)
            $(`#concept-map-open-dialog .list-topic .list-item[data-tid="${openDialog.tid}"]`).trigger('click')
          }
        })
      })
    })
  
    $('#concept-map-open-dialog').on('click', '.bt-open', (e) => {
      e.preventDefault()
  
      let target = $('#open-concept-map-tab').find('.nav-link.active').attr('data-bs-target');
      // console.log(target)
  
      let openPromise = []
      if (target == '#database') {
        if (!openDialog.cmid) {
          UI.dialog('Please select a concept map.').show();
          return
        }
        openPromise.push(new Promise((resolve, reject) => {
          KitBuild.openConceptMap(openDialog.cmid).then(conceptMap => {
            resolve(Object.assign(conceptMap, {
              cyData: KitBuildUI.composeConceptMap(conceptMap)
            }))
          }).catch((error) => { reject(error) })
        }))
      } else { // #decode
        openPromise.push(new Promise((resolve, reject) => {
          try {
            let data = $('#decode-textarea').val().trim();
            let conceptMap = Core.decompress(data)
            resolve(Object.assign(conceptMap, {
              cyData: KitBuildUI.composeConceptMap(conceptMap)
            }))
          } catch (error) { reject(error) }
        }))
      }
      if (openPromise.length) 
        Promise.any(openPromise).then(conceptMap => { console.log(conceptMap)
          let proceed = () => {
            this.setConceptMap(conceptMap)
            this.canvas.cy.elements().remove()
            this.canvas.cy.add(conceptMap.cyData)
            this.canvas.applyElementStyle()
            this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0});
            this.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(conceptMap.map.direction)
            this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
            UI.success('Concept map loaded.').show()
            openDialog.hide()
            CmapApp.collab("command", "set-concept-map", conceptMap, conceptMap.cyData)
          }
          if (this.canvas.cy.elements().length) {
            let confirm = UI.confirm('Do you want to open and replace current concept map on canvas?').positive(() => {            
              confirm.hide()
              proceed()
            }).show()
          } else proceed()
  
        }).catch(error => {
          console.error(error.errors); 
          UI.dialog("The concept map data is invalid.", {
            icon: 'exclamation-triangle',
            iconStyle: 'danger'
          }).show()
        })
    });
  
  
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * 
     * Export
    */
  
    $('.app-navbar .bt-export').on('click', (e) => { // console.log(e)
      let canvasData = KitBuildUI.buildConceptMapData(this.canvas);
      canvasData.direction = this.canvas.direction;
      if (this.conceptMap && this.conceptMap.map) canvasData.map = this.conceptMap.map
      else canvasData.map = {
          cmid: null,
          cmfid: null,
          title: "Untitled",
          direction: this.canvas.direction,
          topic: null,
          text: null,
          author: this.user ? this.user.username : null,
          create_time: null
        }
      $('#concept-map-export-dialog .encoded-data').val(Core.compress(canvasData))
      exportDialog.show()
    })
  
    $('#concept-map-export-dialog').on('click', '.bt-clipboard', (e) => {
      navigator.clipboard.writeText($('#concept-map-export-dialog .encoded-data').val().trim());
      $(e.currentTarget).html('<i class="bi bi-clipboard"></i> Data has been copied to Clipboard!')
      setTimeout(() => {
        $(e.currentTarget).html('<i class="bi bi-clipboard"></i> Copy to Clipboard')
      }, 3000)
    })








    /** 
     * Assign topic
     * 
     * 
    */
  
     $('.app-navbar').on('click', '.bt-assign-topic', (e) => {
      // let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      if (!this.conceptMap) {
        UI.info("Please save or open a concept map.").show();
        return;
      }
      let cmid = this.conceptMap.map.cmid;
      KitBuild.openConceptMap(cmid).then(cmap => {
        console.log(cmap)
        topicDialog.cmapTitle = cmap.map.title;
        topicDialog.cmid = cmap.map.cmid;
        topicDialog.show();
        if (cmap.map.topic) {
          this.ajax.get(`contentApi/getTopic/${cmap.map.topic}`).then(topic => {
            console.log(topic)
            topicDialog.setTopic(topic)
          })
        } else topicDialog.setTopic()
      })
    })

    $('form.form-assign-search-topic').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('form.form-assign-search-topic .input-perpage').val())
      let keyword = $('form.form-assign-search-topic .input-keyword').val()
      let page = (!CmapApp.assignTopicPagination || 
        keyword != CmapApp.assignTopicPagination.keyword) ?
        1 : CmapApp.assignTopicPagination.page

      Promise.all([
        this.ajax.post(`contentApi/getTopics/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`contentApi/getTopicsCount`, {
          keyword: keyword
        })])
      .then(results => {
        let topics = results[0];
        let count = parseInt(results[1]);
        CmapApp.populateAssignTopics(topics, topicDialog.cmid)
        if (CmapApp.assignTopicPagination) {
          CmapApp.assignTopicPagination.keyword = keyword;
          CmapApp.assignTopicPagination.update(count, perpage);  
        } else CmapApp.assignTopicPagination = 
          Pagination.instance('form.form-assign-search-topic .list-topic-pagination', count, perpage).listen('form.form-assign-search-topic').update(count, perpage);
        $('.dropdown-menu-teacher-map-list').addClass('show');
      });

    })

    $('#assign-topic-dialog .list-topic').on('click', '.bt-assign-topic-to-cmap', (e) => {
      let cmid = $(e.currentTarget).parents('.item-topic').attr('data-cmid');
      let tid = $(e.currentTarget).parents('.item-topic').attr('data-tid');
      console.warn(cmid, tid);
      this.ajax.post('contentApi/assignTopicToConceptMap', {
        cmid: cmid,
        tid: tid
      }).then(result => {
        this.ajax.get(`contentApi/getTopic/${tid}`).then(topic => {
          topicDialog.setTopic(topic);
        });
        UI.success('Topic assigned succefully.').show();
      }).catch(error => UI.error(error).show());
    })

    $('#assign-topic-dialog').on('click', '.bt-deassign-topic-from-cmap', (e) => {
      let cmid = $(e.currentTarget).attr('data-cmid');
      this.ajax.post('contentApi/deassignTopicFromConceptMap', {
        cmid: cmid
      }).then(result => { console.log(result);
        topicDialog.setTopic();
        UI.success('Topic deassigned succefully.').show();
      }).catch(error => UI.error(error).show());
    });
  
  






    /** 
     * Assign Text
     * 
    */

     $('.app-navbar').on('click', '.bt-assign-text', (e) => {
      e.preventDefault();
      // let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      if (!this.conceptMap) {
        UI.info("Please save or open a concept map.").show();
        return;
      }
      let cmid = this.conceptMap.map.cmid;
      KitBuild.openConceptMap(cmid).then(cmap => {
        textDialog.setCmap(cmap).show();
      });
    })

    $('form.form-assign-search-text').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('form.form-assign-search-text .input-perpage').val())
      let keyword = $('form.form-assign-search-text .input-keyword').val()
      let page = (!CmapApp.assignTextPagination || 
        keyword != CmapApp.assignTextPagination.keyword) ?
        1 : CmapApp.assignTextPagination.page
      Promise.all([
        this.ajax.post(`contentApi/getTexts/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`contentApi/getTextsCount`, {
          keyword: keyword
        })])
      .then(results => {
        let texts = results[0];
        let count = parseInt(results[1]);
        CmapApp.populateAssignTexts(texts, textDialog.cmap.map.cmid)
        if (CmapApp.assignTextPagination) {
          CmapApp.assignTextPagination.keyword = keyword;
          CmapApp.assignTextPagination.update(count, perpage);  
        } else CmapApp.assignTextPagination = 
          Pagination.instance('form.form-assign-search-text .list-text-pagination', count, perpage).listen('form.form-assign-search-text').update(count, perpage);
        $('.dropdown-menu-teacher-map-list').addClass('show');
      });

    });

    $('#assign-text-dialog .list-text').on('click', '.bt-assign-text-to-cmap', (e) => {
      let cmid = $(e.currentTarget).parents('.item-text').attr('data-cmid');
      let tid = $(e.currentTarget).parents('.item-text').attr('data-tid');
      console.warn(cmid, tid);
      this.ajax.post('contentApi/assignTextToConceptMap', {
        cmid: cmid,
        tid: tid
      }).then(result => {
        this.ajax.get(`contentApi/getText/${tid}`).then(text => {
          textDialog.setText(text);
        });
        UI.success('Text assigned succefully.').show();
      }).catch(error => UI.error(error).show());
    })

    $('#assign-text-dialog').on('click', '.bt-deassign-text-from-cmap', (e) => {
      let cmid = $(e.currentTarget).attr('data-cmid');
      this.ajax.post('contentApi/deassignTextFromConceptMap', {
        cmid: cmid
      }).then(result => { console.log(result);
        textDialog.setText();
        UI.success('Text deassigned succefully.').show();
      }).catch(error => UI.error(error).show());
    })

  }
  
  handleRefresh() {
    // let session = Core.instance().session()
    // let canvas  = this.kbui.canvases.get(CmapApp.canvasId)
    let stateData = JSON.parse(localStorage.getItem(CmapApp.name))
    // console.log("STATE DATA: ", stateData)
    this.session.getAll().then(sessions => {
      let cmid = sessions.cmid
      if (cmid) KitBuild.openConceptMap(cmid).then(conceptmap => {
        this.setConceptMap(conceptmap)
        if (stateData && stateData.map) { // console.log(stateData.direction)
          this.canvas.cy.elements().remove()
          this.canvas.cy.add(Core.decompress(stateData.map))
          this.canvas.applyElementStyle()
          this.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(stateData.direction)
        } else {
          this.canvas.cy.add(KitBuildUI.composeConceptMap(conceptmap))
          this.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(conceptmap.map.direction)
        }
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        this.canvas.cy.elements(':selected').unselect()
        
      })
      try { 
        if (stateData.logger) {
          this.logger = CmapLogger.instance(stateData.logger.username, stateData.logger.seq, stateData.logger.sessid, this.canvas).enable();
          if (CmapApp.loggerListener)
            this.canvas.off("event", CmapApp.loggerListener)
          CmapApp.loggerListener = this.logger.onCanvasEvent.bind(CmapApp.inst.logger)
          this.canvas.on("event", CmapApp.loggerListener)
        }
      } catch (error) { console.warn(error) }
  
      // init collaboration feature
      if (sessions.user) {
        CmapApp.collabInst = KitBuildCollab.instance('cmap', sessions.user, this.canvas)
        CmapApp.collabInst.on('event', CmapApp.onCollabEvent)
        KitBuildCollab.enableControl()
      }
  
      // listen to events for broadcast to collaboration room as commands
      this.canvas.on('event', CmapApp.onCanvasEvent)
  
    })
  }
}

CmapApp.canvasId = "goalmap-canvas"



CmapApp.onBrowserStateChange = event => { // console.warn(event)
  if (event.newState == "terminated") {
    let stateData = {}
    // console.log(CmapApp.inst.logger)
    if (CmapApp.inst && CmapApp.inst.logger) 
      stateData.logger = {
        username: CmapApp.inst.logger.username,
        seq: CmapApp.inst.logger.seq,
        sessid: CmapApp.inst.logger.sessid,
        enabled: CmapApp.inst.logger.enabled,
      }
    stateData.map = Core.compress(CmapApp.inst.canvas.cy.elements().jsons())
    stateData.direction = $('#dd-direction .icon-active').data('direction')
    // console.warn(
    //   JSON.stringify(CmapApp.inst.canvas.cy.elements().jsons()), 
    //   JSON.stringify(CmapApp.inst.canvas.cy.nodes().jsons()))
    let cmapAppStateData = JSON.stringify(Object.assign({}, stateData)) 
    // console.warn("STATE STORE:", cmapAppStateData)
    localStorage.setItem(CmapApp.name, cmapAppStateData)
  }
}


// convert concept mapping event to collaboration command
// App --> Server
CmapApp.collab = (action, ...data) => {
  // not connected? skip.
  if (!CmapApp.collabInst || !CmapApp.collabInst.connected()) return
  
  switch(action) {
    case "command": {
      let command = data.shift()
      // console.warn(command, data);
      CmapApp.collabInst.command(command, ...data).then(result => {
        console.error(command, result);
      }).catch(error => console.error(command, error))
    } break;
    case "get-map-state": {
      CmapApp.collabInst.getMapState().then(result => {})
        .catch(error => UI.error("Unable to get map state: " + error).show())
    } break;
    case "send-map-state": {
      CmapApp.collabInst.sendMapState(...data).then(result => {})
        .catch(error => UI.error("Unable to send map state: " + error).show())
    } break;
    case "get-channels": { 
      CmapApp.collabInst.tools.get('channel').getChannels()
        .then(channels => {})
        .catch(error => UI.error("Unable to get channels: " + error)
        .show())
    } break;
  }
}
CmapApp.onCanvasEvent = (canvasId, event, data) => {
  CmapApp.collab("command", event, canvasId, data);
}

// handles incoming collaboration event
// Server --> App
CmapApp.onCollabEvent = (event, ...data) => {
  // console.warn(event, data)
  switch(event) {
    case 'connect':
    case 'reconnect':
      break;
    case 'join-room': {
      CmapApp.collab("get-map-state")
    } break;
    case 'socket-command': {
      let command = data.shift()
      CmapApp.processCollabCommand(command, data)
    } break;
    case 'socket-get-map-state': {
      let requesterSocketId = data.shift()
      CmapApp.generateMapState()
        .then(mapState => {
          CmapApp.collab("send-map-state", requesterSocketId, mapState)
        })
    }  break;
    case 'socket-set-map-state': {
      let mapState = data.shift()
      CmapApp.applyMapState(mapState).then(() => {
        CmapApp.collab("get-channels")
      });
    }  break;
  }
}
CmapApp.processCollabCommand = (command, data) => {
  console.log(command, data)
  switch(command) {
    case "set-concept-map": {
      let conceptMap = data.shift()
      let cyData = data.shift()
      console.log(conceptMap, cyData)
      CmapApp.inst.setConceptMap(conceptMap)
      CmapApp.inst.canvas.cy.elements().remove()
      CmapApp.inst.canvas.cy.add(cyData)
      CmapApp.inst.canvas.applyElementStyle()
      CmapApp.inst.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(conceptMap.map.direction)
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO).clearStacks().updateStacksStateButton()
    } break;
    case "move-nodes": {
      let canvasId = data.shift()
      let moves = data.shift()
      let nodes = moves.later;
      if (Array.isArray(nodes)) nodes.forEach(node => 
      CmapApp.inst.canvas.moveNode(node.id, node.x, node.y, 200))
    } break;
    case "redo-move-nodes":
    case "undo-move-nodes": {
      let canvasId = data.shift()
      let moves = data.shift()
      let nodes = moves;
      if (Array.isArray(nodes)) nodes.forEach(node => 
      CmapApp.inst.canvas.moveNode(node.id, node.x, node.y, 200))
    } break;
    case "undo-centroid":
    case "undo-move-link":
    case "undo-move-concept": {
      let canvasId = data.shift()
      let move = data.shift()
      CmapApp.inst.canvas.moveNode(move.from.id, move.from.x, move.from.y, 200)
    } break;
    case "centroid":
    case "redo-centroid":
    case "redo-move-link":
    case "redo-move-concept":
    case "move-link":
    case "move-concept": {
      let canvasId = data.shift()
      let move = data.shift()
      CmapApp.inst.canvas.moveNode(move.to.id, move.to.x, move.to.y, 200)
    } break;
    case "layout-elements": {
      let canvasId = data.shift()
      let layoutMoves = data.shift()
      let nodes = layoutMoves.later;
      if (Array.isArray(nodes)) nodes.forEach(node => 
      CmapApp.inst.canvas.moveNode(node.id, node.position.x, node.position.y, 200))
    } break;
    case "redo-layout-elements":
    case "undo-layout-elements":
    case "undo-layout": {
      let canvasId = data.shift()
      let nodes = data.shift()
      if (Array.isArray(nodes)) nodes.forEach(node => 
      CmapApp.inst.canvas.moveNode(node.id, node.position.x, node.position.y, 200))
    } break;
    case "undo-disconnect-right":
    case "undo-disconnect-left":
    case "redo-connect-right":
    case "redo-connect-left":
    case "connect-right":
    case "connect-left": {
      let canvasId = data.shift()
      let edge = data.shift()
      CmapApp.inst.canvas.createEdge(edge.data)
    } break;
    case "undo-connect-right":
    case "undo-connect-left":
    case "redo-disconnect-right":
    case "redo-disconnect-left":
    case "disconnect-left":
    case "disconnect-right": { 
      let canvasId = data.shift()
      let edge = data.shift()
      CmapApp.inst.canvas.removeEdge(edge.data.source, edge.data.target)
    } break;
    case "undo-move-connect-left":
    case "undo-move-connect-right": { 
      let canvasId = data.shift()
      let moveData = data.shift()
      CmapApp.inst.canvas.moveEdge(moveData.later, moveData.prior)
    } break;
    case "redo-move-connect-left":
    case "redo-move-connect-right":
    case "move-connect-left":
    case "move-connect-right": { 
      let canvasId = data.shift()
      let moveData = data.shift()
      CmapApp.inst.canvas.moveEdge(moveData.prior, moveData.later)
    } break;
    case "switch-direction": { 
      let canvasId = data.shift()
      let switchData = data.shift()
      CmapApp.inst.canvas.switchDirection(switchData.prior, switchData.later)
    } break;
    case "undo-disconnect-links": { 
      let canvasId = data.shift()
      let edges = data.shift()
      if (!Array.isArray(edges)) break;
      edges.forEach(edge => {
        CmapApp.inst.canvas.createEdge(edge.data)
      })
    } break;
    case "redo-disconnect-links":
    case "disconnect-links": { 
      let canvasId = data.shift()
      let edges = data.shift()
      if (!Array.isArray(edges)) break;
      console.log(edges)
      edges.forEach(edge => {
        CmapApp.inst.canvas.removeEdge(edge.data.source, edge.data.target)
      })
    } break;
    case "create-link":
    case "create-concept":
    case "redo-duplicate-link":
    case "redo-duplicate-concept":
    case "duplicate-link":
    case "duplicate-concept": { 
      let canvasId = data.shift()
      let node = data.shift()
      console.log(node)
      CmapApp.inst.canvas.addNode(node.data, node.position)
    } break;
    case "undo-duplicate-link":
    case "undo-duplicate-concept": { 
      let canvasId = data.shift()
      let node = data.shift()
      console.log(node)
      CmapApp.inst.canvas.removeElements([node.data])
    } break;
    case "duplicate-nodes": { 
      let canvasId = data.shift()
      let nodes = data.shift()
      if (!Array.isArray(nodes)) break;
      nodes.forEach(node =>
        CmapApp.inst.canvas.addNode(node.data, node.position))
    } break;
    case "undo-delete-node":
    case "undo-clear-canvas":
    case "undo-delete-multi-nodes": { 
      let canvasId = data.shift()
      let elements = data.shift()
      CmapApp.inst.canvas.addElements(elements)
    } break;
    case "delete-link":
    case "delete-concept": 
    case "redo-delete-multi-nodes":
    case "delete-multi-nodes": {
      let canvasId = data.shift()
      let elements = data.shift()
      CmapApp.inst.canvas.removeElements(elements.map(element => element.data))
    } break;
    case "undo-update-link":
    case "undo-update-concept": {
      let canvasId = data.shift()
      let node = data.shift()
      CmapApp.inst.canvas.updateNodeData(node.id, node.prior.data)
    } break;
    case "redo-update-link":
    case "redo-update-concept":
    case "update-link":
    case "update-concept": {
      let canvasId = data.shift()
      let node = data.shift()
      CmapApp.inst.canvas.updateNodeData(node.id, node.later.data)
    } break;
    case "redo-concept-color-change":
    case "undo-concept-color-change": {
      let canvasId = data.shift()
      let changes = data.shift()
      CmapApp.inst.canvas.changeNodesColor(changes)
    } break;
    case "concept-color-change": {
      let canvasId = data.shift()
      let changes = data.shift()
      let nodesData = changes.later
      CmapApp.inst.canvas.changeNodesColor(nodesData)
    } break;
    case "undo-lock":
    case "undo-unlock":
    case "redo-lock":
    case "redo-unlock":
    case "lock-edge":
    case "unlock-edge": {
      let canvasId = data.shift()
      let edge = data.shift()
      CmapApp.inst.canvas.updateEdgeData(edge.id, edge)
    } break;
    case "undo-lock-edges":
    case "undo-unlock-edges":
    case "redo-lock-edges":
    case "redo-unlock-edges": {
      let canvasId = data.shift()
      let lock = data.shift()
      if (!lock) break;
      if (!Array.isArray(lock.edges)) break;
      lock.edges.forEach(edge =>
        CmapApp.inst.canvas.updateEdgeData(edge.substring(1), { lock: lock.lock }))
    } break;
    case "lock-edges":
    case "unlock-edges": {
      let canvasId = data.shift()
      let edges = data.shift()
      if (!Array.isArray(edges)) return;
      edges.forEach(edge =>
        CmapApp.inst.canvas.updateEdgeData(edge.data.id, edge.data))
    } break;
    case "redo-clear-canvas":
    case "clear-canvas": {
      CmapApp.inst.canvas.reset()
    } break;
    case "convert-type": {
      let canvasId = data.shift()
      let map = data.shift()
      let elements = map.later
      let direction = map.to
      CmapApp.inst.canvas.convertType(direction, elements)
    } break;
    case "select-nodes": {
      let canvasId = data.shift()
      let ids = data.shift()
      ids = ids.map(id => `#${id}`)
      CmapApp.inst.canvas.cy.nodes(ids.join(", ")).addClass('peer-select')
    } break;
    case "unselect-nodes": {
      let canvasId = data.shift()
      let ids = data.shift()
      ids = ids.map(id => `#${id}`)
      CmapApp.inst.canvas.cy.nodes(ids.join(", ")).removeClass('peer-select')
    } break;

  }
}

// generate/apply map state
CmapApp.generateMapState = () => {
  return new Promise((resolve, reject) => {
    let mapState = {
      conceptMap: null,
      cyData: []
    }  
    if (CmapApp.inst.conceptMap) {
      CmapApp.inst.conceptMap.map.direction = CmapApp.inst.canvas.direction
      mapState = {
        conceptMap: CmapApp.inst.conceptMap,
        cyData: CmapApp.inst.canvas.cy.elements().jsons()
      }
    }
    resolve(mapState)
  })
}
CmapApp.applyMapState = (mapState) => {
  return new Promise((resolve, reject) => {
    let conceptMap = mapState.conceptMap
    let cyData = mapState.cyData
    CmapApp.inst.setConceptMap(conceptMap)
    CmapApp.inst.canvas.cy.elements().remove()
    if (!conceptMap || !cyData) {
      // console.log(mapState)
    } else {
      CmapApp.inst.canvas.cy.add(cyData ? cyData : {}).unselect()
      CmapApp.inst.canvas.applyElementStyle()
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(conceptMap.map.direction)
      CmapApp.inst.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO).clearStacks().updateStacksStateButton()
    }
    CmapApp.inst.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    resolve(mapState)
  })

}

CmapApp.populateTopics = topics => {
  let topicsHtml = '';
  topics.forEach(topic => {
    topicsHtml += `<div class="item-topic d-flex align-items-center py-1 border-bottom" role="button"`
    topicsHtml += `  data-tid="${topic.tid}" data-title="${topic.title}">`
    topicsHtml += `  <span class="flex-fill d-flex align-items-center ps-2">`
    topicsHtml += `  <span class="text-truncate text-nowrap">${topic.title}</span>`
    if (topic.text) topicsHtml += `    <span class="badge rounded-pill bg-success ms-2">${topic.text} <i class="bi bi-file-text"></i></span>`
    topicsHtml += `  </span>`
    topicsHtml += `  <span class="text-end text-nowrap ms-3">`
    topicsHtml += `    <div class="dropstart">`
    topicsHtml += `    <button class="btn btn-sm btn-primary bt-list-cmap" data-bs-toggle="dropdown" data-bs-auto-close="outside"><i class="bi bi-journal-text"></i></button>`
    topicsHtml += `    <div class="dropdown-menu px-2" data-tid="${topic.tid}"><small><em>Loading...</em></small>`
    topicsHtml += `    </div>`
    topicsHtml += `    </div>`
    topicsHtml += `  </span>`
    topicsHtml += `</div>`
  });
  if (topicsHtml.length == 0) topicsHtml = '<em class="d-block m-3 text-muted">No topics found in current search.</em>';
  $('#list-topic').html(topicsHtml)
}

CmapApp.populateAssignTopics = (topics, cmid) => {
  let topicsHtml = '';
  topics.forEach(topic => {
    topicsHtml += `<div class="item-topic d-flex align-items-center py-1 border-bottom" role="button"`
    topicsHtml += `  data-tid="${topic.tid}" data-cmid="${cmid}" data-title="${topic.title}">`
    topicsHtml += `  <span class="flex-fill ps-2 d-flex align-items-center">`
    topicsHtml += `  <span class="text-truncate text-nowrap">${topic.title}</span>`
    if (topic.text) topicsHtml += `    <span class="badge rounded-pill bg-success ms-2">${topic.text} <i class="bi bi-file-text"></i></span>`
    topicsHtml += `  </span>`
    topicsHtml += `  <span class="text-end text-nowrap ms-3">`
    topicsHtml += `    <span class="btn btn-sm btn-primary bt-assign-topic-to-cmap"><i class="bi bi-check-lg"></i></span>`
    topicsHtml += `  </span>`
    topicsHtml += `</div>`
  });
  if (topicsHtml.length == 0) topicsHtml = '<em class="d-block m-3 text-muted">No topics found in current search.</em>';
  $('form.form-assign-search-topic .list-topic').html(topicsHtml)
}

CmapApp.populateAssignTexts = (texts, cmid) => {
  let textsHtml = '';
  texts.forEach(text => {
    textsHtml += `<div class="item-text d-flex align-items-center py-1 border-bottom" role="button"`
    textsHtml += `  data-tid="${text.tid}" data-cmid="${cmid}" data-title="${text.title}">`
    textsHtml += `  <span class="flex-fill ps-2 d-flex align-items-center">`
    textsHtml += `  <span class="text-truncate text-nowrap">${text.title}</span>`
    textsHtml += `  </span>`
    textsHtml += `  <span class="text-end text-nowrap ms-3">`
    textsHtml += `    <span class="btn btn-sm btn-primary bt-assign-text-to-cmap"><i class="bi bi-check-lg"></i></span>`
    textsHtml += `  </span>`
    textsHtml += `</div>`
  });
  if (textsHtml.length == 0) textsHtml = '<em class="d-block m-3 text-muted">No texts found in current search.</em>';
  $('form.form-assign-search-text .list-text').html(textsHtml)
}