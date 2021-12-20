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
    // let observer = new MutationObserver((mutations) => $(`#${canvas.canvasId} > div`).css('width', 0))
    // observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip() 

    // Instantiate temporary collab
    if (typeof KitBuildCollab == 'function')
      CmapApp.collabInst = KitBuildCollab.instance('cmap', null, canvas)

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
  }

  static instance() {
    CmapApp.inst = new CmapApp()
    CmapApp.handleEvent(CmapApp.inst.kbui)
    CmapApp.handleRefresh(CmapApp.inst.kbui)
  }

  setConceptMap(conceptMap = null) { 
    console.warn("CONCEPT MAP SET:", conceptMap)
    this.conceptMap = conceptMap;
    if (conceptMap) {
      this.canvas.direction = conceptMap.map.direction;
      this.session.set('cmid', conceptMap.map.cmid)
      let status = `<span class="mx-2 d-flex align-items-center status-cmap">`
        + `<span class="badge rounded-pill bg-secondary">ID: ${conceptMap.map.cmid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${conceptMap.map.title}</small></span>`
        + `</span>`
      StatusBar.instance().remove('.status-cmap').append(status);
    } else {
      StatusBar.instance().remove('.status-cmap');
      this.session.unset('cmid')
    }
  }
}

CmapApp.canvasId = "goalmap-canvas"

CmapApp.handleEvent = (kbui) => {

  let canvas = kbui.canvases.get(CmapApp.canvasId)
  let ajax = Core.instance().ajax()
  let session = Core.instance().session()

  this.canvas = canvas
  this.ajax = ajax
  this.session = session

  let saveAsDialog = UI.modal('#concept-map-save-as-dialog', {
    onShow: () => { $('#concept-map-save-as-dialog .input-title').focus() },
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












  /** 
   * 
   * New Map
  */

  $('.app-navbar .bt-new').on('click', () => {
    let proceed = () => {
      canvas.reset()
      CmapApp.inst.setConceptMap(null)
      UI.info("Canvas has been reset").show()
    }
    if (canvas.cy.elements().length > 0 || CmapApp.inst.conceptMap) {
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
    if (!CmapApp.inst.conceptMap) $('.app-navbar .bt-save-as').trigger('click')
    else saveAsDialog.setConceptMap(CmapApp.inst.conceptMap)
      .setTitle("Save Concept Map (Update)")
      .setIcon("file-earmark-check")
      .show()
  })
  
  $('.app-navbar .bt-save-as').on('click', () => {
    if (canvas.cy.elements().length == 0) {
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
      text: $('#select-text').val().match(/^ *$/) ? null : $('#select-text').val().trim(),
      author: this.user ? this.user.username : null,
      create_time: null
    }, KitBuildUI.buildConceptMapData(this.canvas)); // console.log(data); return
    this.ajax.post("kitBuildApi/saveConceptMap", { data: Core.compress(data) })
      .then(conceptMap => { 
        CmapApp.inst.setConceptMap(conceptMap);
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
         + `<em>${t.title}</em>`
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
    console.log(target)

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
          CmapApp.inst.setConceptMap(conceptMap)
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
    if (CmapApp.inst.conceptMap && CmapApp.inst.conceptMap.map) canvasData.map = CmapApp.inst.conceptMap.map
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
   * 
   * Logout
  */
   $('.app-navbar .bt-logout').on('click', (e) => {
    let confirm = UI.confirm('Do you want to logout?<br>This will <strong class="text-danger">END</strong> your concept mapping session.').positive(() => {
      Core.instance().session().unset('user').then(() => {
        CmapApp.inst.setConceptMap(null);
        KitBuildCollab.enableControl(false);
        CmapApp.enableNavbarButton(false);
        CmapApp.updateSignInOutButton();
        StatusBar.instance().remove('.status-user');
        if (CmapApp.collabInst) CmapApp.collabInst.disconnect();
        this.canvas.cy.elements().remove();
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
        this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO).clearStacks().updateStacksStateButton();
        UI.success("You have signed out.").show();
        confirm.hide()
      });
      // TODO: redirect to home/login page
    }).show()
  })


















  /** 
   * 
   * Sign In
  */
  $('.app-navbar .bt-sign-in').on('click', (e) => {
    CmapApp.inst.modalSignIn = UI.modal('#modal-sign-in', {
      width: 350,
      onShow: () => {}
    })
    CmapApp.inst.modalSignIn.show()
  })

  $('#modal-sign-in').on('click', '.bt-sign-in', (e) => {
    e.preventDefault()
    let username = $('#input-username').val();
    let password = $('#input-password').val();
    KitBuildRBAC.signIn(username, password).then(user => { console.log(user)
      if (typeof user == 'object' && user) {
        Core.instance().session().set('user', user).then(() => {
          CmapApp.updateSignInOutButton();
          CmapApp.enableNavbarButton();
          CmapApp.initCollab(user);
        })
        CmapApp.inst.modalSignIn.hide()
        CmapApp.inst.user = user;

        let status = `<span class="mx-2 d-flex align-items-center status-user">`
        + `<small class="text-dark fw-bold">${user.name}</small>`
        + `</span>`
        StatusBar.instance().remove('.status-user').prepend(status);
      }
    }).catch(error => UI.error(error).show());
  })



}

CmapApp.handleRefresh = (kbui) => {
  let session = Core.instance().session()
  let canvas  = kbui.canvases.get(CmapApp.canvasId)
  let stateData = JSON.parse(localStorage.getItem(CmapApp.name))
  // console.log("STATE DATA: ", stateData)
  session.getAll().then(sessions => {
    let cmid = sessions.cmid
    if (cmid) KitBuild.openConceptMap(cmid).then(conceptmap => {
      CmapApp.inst.setConceptMap(conceptmap)
      if (stateData && stateData.map) { // console.log(stateData.direction)
        canvas.cy.elements().remove()
        canvas.cy.add(Core.decompress(stateData.map))
        canvas.applyElementStyle()
        canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(stateData.direction)
      } else {
        canvas.cy.add(KitBuildUI.composeConceptMap(conceptmap))
        canvas.toolbar.tools.get(KitBuildToolbar.NODE_CREATE).setActiveDirection(conceptmap.map.direction)
      }
      canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
      canvas.cy.elements(':selected').unselect()
      
    })
    try { 
      if (stateData.logger) {
        CmapApp.inst.logger = CmapLogger.instance(stateData.logger.username, stateData.logger.seq, stateData.logger.sessid, canvas).enable();
        if (CmapApp.loggerListener)
          canvas.off("event", CmapApp.loggerListener)
        CmapApp.loggerListener = CmapApp.inst.logger.onCanvasEvent.bind(CmapApp.inst.logger)
        canvas.on("event", CmapApp.loggerListener)
      }
    } catch (error) { console.warn(error) }

    // init collaboration feature
    CmapApp.enableNavbarButton(false);
    if (sessions.user) {
      CmapApp.initCollab(sessions.user);
      CmapApp.enableNavbarButton();
      KitBuildCollab.enableControl();

      let status = `<span class="mx-2 d-flex align-items-center status-user">`
      + `<small class="text-dark fw-bold">${sessions.user.name}</small>`
      + `</span>`
      StatusBar.instance().remove('.status-user').prepend(status);
    } else $('.bt-sign-in').trigger('click')

    // listen to events for broadcast to collaboration room as commands
    CmapApp.inst.canvas.on('event', CmapApp.onCanvasEvent)

  })
}

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

CmapApp.initCollab = (user) => {
  CmapApp.inst.user = user;
  CmapApp.collabInst = KitBuildCollab.instance('cmap', user, canvas)
  CmapApp.collabInst.off('event', CmapApp.onCollabEvent)
  CmapApp.collabInst.on('event', CmapApp.onCollabEvent)
  KitBuildCollab.enableControl()
}

CmapApp.updateSignInOutButton = () => {
  Core.instance().session().getAll().then(sessions => {
    if (sessions.user) {
      $('.bt-sign-in').addClass('d-none')
      $('.bt-logout').removeClass('d-none')
    } else {
      $('.bt-sign-in').removeClass('d-none')
      $('.bt-logout').addClass('d-none')
    }
  });
}

CmapApp.enableNavbarButton = (enabled = true) => {
  $('.app-navbar .app-buttons button').prop('disabled', !enabled);
  CmapApp.inst.canvas.toolbar.tools.forEach(tool => {
    tool.enable(enabled);
  })
}