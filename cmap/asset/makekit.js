$(() => { // jQuery onReady callback
  let app = MakeKitApp.instance()
})

class MakeKitApp {
  constructor() {
    this.kbui = KitBuildUI.instance(MakeKitApp.canvasId)
    let canvas = this.kbui.canvases.get(MakeKitApp.canvasId)
    canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { stack: 'right' })
    canvas.toolbar.render()
    canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)
    canvas.addCanvasTool(KitBuildCanvasTool.DISCONNECT)
    canvas.addCanvasTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.UNLOCK)

    this.canvas = canvas;
    this.session = Core.instance().session()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${canvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 
  }

  static instance() {
    MakeKitApp.inst = new MakeKitApp()
    MakeKitApp.handleEvent(MakeKitApp.inst.kbui)
    MakeKitApp.handleRefresh(MakeKitApp.inst.kbui)
  }

  setConceptMap(conceptMap) { console.warn("CONCEPT MAP SET:", conceptMap, this)
    this.conceptMap = conceptMap
    if (conceptMap) {
      this.canvas.direction = conceptMap.map.direction;
      this.session.set('cmid', conceptMap.map.cmid)
      let status = `<span class="mx-2 d-flex align-items-center status-cmap">`
        + `<span class="badge rounded-pill bg-secondary">ID: ${conceptMap.map.cmid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${conceptMap.map.title}</small></span>`
        + `</span>`
      StatusBar.instance().remove('.status-cmap').prepend(status);
    } else {
      StatusBar.instance().remove('.status-cmap');
      this.session.unset('cmid')
    }
  }

  setKitMap(kitMap) { console.warn("KIT MAP SET:", kitMap)
    this.kitMap = kitMap
    if (kitMap) {
      this.setConceptMap(kitMap.conceptMap)
      this.session.set('kid', kitMap.map.kid)
      let status = `<span class="mx-2 d-flex align-items-center status-kit">`
        + `<span class="badge rounded-pill bg-primary">ID: ${kitMap.map.kid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${kitMap.map.name}</small></span>`
        + `</span>`
      StatusBar.instance().remove('.status-kit').append(status);
    } else {
      StatusBar.instance().remove('.status-kit');
      this.session.unset('kid')
    }
  }
}

MakeKitApp.canvasId = "makekit-canvas"

MakeKitApp.handleEvent = (kbui) => {

  let canvas = kbui.canvases.get(MakeKitApp.canvasId)
  let ajax = Core.instance().ajax()
  let session = Core.instance().session()

  this.canvas = canvas
  this.ajax = ajax
  this.session = session

  let saveAsDialog = UI.modal('#kit-save-as-dialog', {
    onShow: () => { 
      if (saveAsDialog.kitMap) { // means save existing kit...
        $('#kit-save-as-dialog .input-title').val(saveAsDialog.kitMap.map.name)
        $('#kit-save-as-dialog .input-title').focus().select()
        $('#input-fid').val(saveAsDialog.kitMap.map.kfid)
        $('#input-title').val(saveAsDialog.kitMap.map.name)
        $(`#input-layout-${saveAsDialog.kitMap.map.layout}`).prop('checked', true)
        $('#input-enabled').prop('checked', saveAsDialog.kitMap.map.enabled == "1" ? true : false)
      } else {
        $('#kit-save-as-dialog .input-title').val('Kit of ' + MakeKitApp.inst.conceptMap.map.title)
        $('#kit-save-as-dialog .input-title').focus().select()
        $('#kit-save-as-dialog .bt-generate-fid').trigger('click')
        $('#input-layout-preset').prop('checked', true)
        $('#input-enabled').prop('checked', true)
      }
    },
    hideElement: '.bt-cancel'
  })
  saveAsDialog.setKitMap = (kitMap) => { // console.log(kitMap)
    if (kitMap) saveAsDialog.kitMap = kitMap
    else saveAsDialog.kitMap = null
    return saveAsDialog;
  }
  saveAsDialog.setTitle = (title) => {
    $('#kit-save-as-dialog .dialog-title').html(title)
    return saveAsDialog
  }
  saveAsDialog.setIcon = (icon) => {
    $('#kit-save-as-dialog .dialog-icon').removeClass()
      .addClass(`dialog-icon bi bi-${icon} me-2`)
    return saveAsDialog
  }

  let openDialog = UI.modal('#concept-map-open-dialog', {
    hideElement: '.bt-cancel',
    width: '700px'
  })

  let optionDialog = UI.modal('#kit-option-dialog', {
    hideElement: '.bt-cancel',
    onShow: () => { 
      let kitMapOptions = optionDialog.kitMap.map.options ?
        JSON.parse(optionDialog.kitMap.map.options) : null
      if (!kitMapOptions) {
        optionDialog.setDefault()
        return
      }

      let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
      let feedbackleveldefault = $('#kit-option-dialog select[name="feedbacklevel"] option.default')
      let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
      let modification = $('#kit-option-dialog input[name="modification"]')
      let readcontent = $('#kit-option-dialog input[name="readcontent"]')
      let saveload = $('#kit-option-dialog input[name="saveload"]')
      let reset = $('#kit-option-dialog input[name="reset"]')
      let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
      let log = $('#kit-option-dialog input[name="log"]')

      if (kitMapOptions.feedbacklevel) feedbacklevel.val(kitMapOptions.feedbacklevel).change()
      else feedbackleveldefault.prop('selected', true)

      if (typeof kitMapOptions.fullfeedback != 'undefined')
        fullfeedback.prop('checked', parseInt(kitMapOptions.fullfeedback) == 1 ? true : false)
      else fullfeedback.prop('checked', true)

      if (typeof kitMapOptions.modification != 'undefined')
      modification.prop('checked', parseInt(kitMapOptions.modification) == 1 ? true : false)
      else modification.prop('checked', true)

      if (typeof kitMapOptions.readcontent != 'undefined')
      readcontent.prop('checked', parseInt(kitMapOptions.readcontent) == 1 ? true : false)
      else readcontent.prop('checked', true)

      if (typeof kitMapOptions.saveload != 'undefined')
      saveload.prop('checked', parseInt(kitMapOptions.saveload) == 1 ? true : false)
      else saveload.prop('checked', true)

      if (typeof kitMapOptions.reset != 'undefined')
      reset.prop('checked', parseInt(kitMapOptions.reset) == 1 ? true : false)
      else reset.prop('checked', true)
      
      if (typeof kitMapOptions.feedbacksave != 'undefined')
      feedbacksave.prop('checked', parseInt(kitMapOptions.feedbacksave) == 1 ? true : false)
      else feedbacksave.prop('checked', true)

      if (typeof kitMapOptions.log != 'undefined')
      log.prop('checked', parseInt(kitMapOptions.log) == 1 ? true : false)
      else log.prop('checked', false)
    }
  })
  optionDialog.setKitMap = (kitMap) => {
    optionDialog.kitMap = kitMap
    return optionDialog
  }
  optionDialog.setDefault = () => {
    let feedbackleveldefault = $('#kit-option-dialog select[name="feedbacklevel"] option.default')
    let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
    let modification = $('#kit-option-dialog input[name="modification"]')
    let readcontent = $('#kit-option-dialog input[name="readcontent"]')
    let saveload = $('#kit-option-dialog input[name="saveload"]')
    let reset = $('#kit-option-dialog input[name="reset"]')
    let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
    let log = $('#kit-option-dialog input[name="log"]')

    feedbackleveldefault.prop('selected', true)
    fullfeedback.prop('checked', true)
    modification.prop('checked', true)
    readcontent.prop('checked', true)
    saveload.prop('checked', true)
    reset.prop('checked', true)
    feedbacksave.prop('checked', true)
    log.prop('checked', false)
  }
  optionDialog.enableAll = () => {
    let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
    let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
    let modification = $('#kit-option-dialog input[name="modification"]')
    let readcontent = $('#kit-option-dialog input[name="readcontent"]')
    let saveload = $('#kit-option-dialog input[name="saveload"]')
    let reset = $('#kit-option-dialog input[name="reset"]')
    let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
    let log = $('#kit-option-dialog input[name="log"]')

    feedbacklevel.val(3).change()
    fullfeedback.prop('checked', true)
    modification.prop('checked', true)
    readcontent.prop('checked', true)
    saveload.prop('checked', true)
    reset.prop('checked', true)
    feedbacksave.prop('checked', true)
    log.prop('checked', true)
  }
  optionDialog.disableAll = () => {
    let feedbacklevel = $('#kit-option-dialog select[name="feedbacklevel"]')
    let fullfeedback = $('#kit-option-dialog input[name="fullfeedback"]')
    let modification = $('#kit-option-dialog input[name="modification"]')
    let readcontent = $('#kit-option-dialog input[name="readcontent"]')
    let saveload = $('#kit-option-dialog input[name="saveload"]')
    let reset = $('#kit-option-dialog input[name="reset"]')
    let feedbacksave = $('#kit-option-dialog input[name="feedbacksave"]')
    let log = $('#kit-option-dialog input[name="log"]')

    feedbacklevel.val(0).change()
    fullfeedback.prop('checked', false)
    modification.prop('checked', false)
    readcontent.prop('checked', false)
    saveload.prop('checked', false)
    reset.prop('checked', false)
    feedbacksave.prop('checked', false)
    log.prop('checked', false)
  }

  let textDialog = UI.modal('#text-dialog', {
    hideElement: '.bt-close',
    onShow: () => { // console.log(textDialog.kit)
      if (!textDialog.kitMap.map.text) {
        $("#assigned-text").html('<em class="text-danger px-3">This kit has no text assigned.</em>')
        $('form.form-search-text').trigger('submit')
      } else {
        this.ajax.get(`contentApi/getText/${textDialog.kitMap.map.text}`).then(text => {
          let assignedTextHtml = `<span class="text-danger">Text:</span> ${text.title} <span class="badge rounded-pill bg-danger bt-unassign px-3 ms-3" role="button" data-text="${text.tid}" data-kid="${textDialog.kitMap.map.kid}">Unassign</span>`
          $("#assigned-text").html(assignedTextHtml)
        })
      }
      $("#kit-name").html(textDialog.kitMap.map.name)
    }
  })
  textDialog.setKitMap = (kitMap) => {
    textDialog.kitMap = kitMap;
    return textDialog
  }











  /** 
   * Open or Create New Kit
   * */

  $('.app-navbar .bt-open-kit').on('click', () => {
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
    if (openDialog.cmid != $(e.currentTarget).attr('data-cmid')) // different concept map?
      openDialog.kid = null; // reset selected kit id.
    openDialog.cmid = $(e.currentTarget).attr('data-cmid');
    $('#concept-map-open-dialog .list-concept-map .bi-check-lg').addClass('d-none');
    $('#concept-map-open-dialog .list-concept-map .list-item').removeClass('active');
    $(e.currentTarget).find('.bi-check-lg').removeClass('d-none');
    $(e.currentTarget).addClass('active');

    this.ajax.get(`kitBuildApi/getKitListByConceptMap/${openDialog.cmid}`).then(kits => { console.log(kits)
      let kitsHtml = '';
      kits.forEach(k => {
        kitsHtml += `<span class="kit list-item" data-kid="${k.kid}" data-kfid="${k.kfid}">`
          + `<span class="text-truncate">${k.name}</span>`
          + `<bi class="bi bi-check-lg text-primary d-none"></bi></span>`
      })
      $('#concept-map-open-dialog .list-kit').slideUp({
        duration: 100,
        complete: () => {
          $('#concept-map-open-dialog .list-kit')
            .html(kitsHtml).slideDown({
              duration: 100,
              complete: () => {
                let item = $(`#concept-map-open-dialog .list-kit .list-item[data-kid="${openDialog.kid}"]`)
                if(openDialog.kid && item.length) {
                  item.trigger('click')[0]
                    .scrollIntoView({
                      behavior: "smooth",
                      block: "center"
                    });
                } else $('#concept-map-open-dialog .list-kit').scrollTop(0)
              }
            })
        }
      })
    })
  })

  $('#concept-map-open-dialog .list-kit').on('click', '.list-item', (e) => {
    openDialog.kid = $(e.currentTarget).attr('data-kid');
    $('#concept-map-open-dialog .list-kit .bi-check-lg').addClass('d-none');
    $('#concept-map-open-dialog .list-kit .list-item').removeClass('active');
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
    if (!openDialog.kid) {
      UI.dialog('Please select a concept map and a kit.').show();
      return
    }
    KitBuild.openKitMap(openDialog.kid).then(kitMap => {
      try {
        MakeKitApp.inst.setKitMap(kitMap)
        let cyData = KitBuildUI.composeKitMap(kitMap)
        console.log(cyData)
        if (this.canvas.cy.elements().length) {
          let confirm = UI.confirm("Open the kit replacing the current kit on Canvas?").positive(() => {
            this.canvas.cy.elements().remove()
            this.canvas.cy.add(cyData)
            this.canvas.applyElementStyle()
            this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit();
            confirm.hide()
            openDialog.hide()
          }).show()
        }
      } catch (error) { console.error(error)
        UI.error("Unable to open selected kit.").show(); 
      }
    }).catch((error) => { console.error(error)
      UI.error("Unable to open selected kit.").show(); 
    })
  });

  $('#concept-map-open-dialog').on('click', '.bt-new', (e) => {
    e.preventDefault()
    if (!openDialog.cmid) {
      UI.dialog('Please select a concept map.').show();
      return
    }
    KitBuild.openConceptMap(openDialog.cmid).then(conceptMap => {
      try {
        MakeKitApp.inst.setKitMap(null)
        MakeKitApp.inst.setConceptMap(conceptMap)
        let cyData = KitBuildUI.composeConceptMap(conceptMap)
        if (this.canvas.cy.elements().length) {
          let confirm = UI.confirm("Create a new kit from the selected concept map replacing the current kit design on Canvas?").positive(() => {
            this.canvas.cy.elements().remove()
            this.canvas.cy.add(cyData)
            this.canvas.applyElementStyle()
            this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit();
            confirm.hide()
            openDialog.hide()
          }).show()
        }
      } catch (error) { console.error(error)
        UI.error("Unable to open selected concept map as kit.").show(); 
      }
    }).catch((error) => { console.error(error)
      UI.error("Unable to open selected concept map as kit.").show(); 
    })
  });










  /** 
   * Set Options for Kit
   * */
  
  $('.app-navbar .bt-option').on('click', () => { // console.log(MakeKitApp.inst)
    if (!MakeKitApp.inst.kitMap) {
      UI.info("Please open a kit to set its runtime options.").show()
      return
    } optionDialog.setKitMap(MakeKitApp.inst.kitMap).show()
  });

  $('#kit-option-dialog').on('click', '.bt-enable-all', (e) => {
    optionDialog.enableAll()
  })

  $('#kit-option-dialog').on('click', '.bt-disable-all', (e) => {
    optionDialog.disableAll()
  })
  
  $('#kit-option-dialog').on('click', '.bt-default', (e) => {
    optionDialog.setDefault()
  })

  $('#kit-option-dialog').on('click', '.bt-apply', (e) => {
    let option = {
      feedbacklevel: $('#kit-option-dialog select[name="feedbacklevel"]').val(),
      fullfeedback: $('#kit-option-dialog input[name="fullfeedback"]').prop('checked') ? 1 : 0,
      modification: $('#kit-option-dialog input[name="modification"]').prop('checked') ? 1 : 0,
      readcontent: $('#kit-option-dialog input[name="readcontent"]').prop('checked') ? 1 : 0,
      saveload: $('#kit-option-dialog input[name="saveload"]').prop('checked') ? 1 : 0,
      reset: $('#kit-option-dialog input[name="reset"]').prop('checked') ? 1 : 0,
      feedbacksave: $('#kit-option-dialog input[name="feedbacksave"]').prop('checked') ? 1 : 0,
      log: $('#kit-option-dialog input[name="log"]').prop('checked') ? 1 : 0,
    }

    // only store information, when it is not default
    if (option.feedbacklevel == 2) delete option.feedbacklevel
    if (option.fullfeedback) delete option.fullfeedback
    if (option.modification) delete option.modification
    if (option.readcontent) delete option.readcontent
    if (option.saveload) delete option.saveload
    if (option.reset) delete option.reset
    if (option.feedbacksave) delete option.feedbacksave
    if (!option.log) delete option.log

    KitBuild.updateKitOption(optionDialog.kitMap.map.kid, 
      $.isEmptyObject(option) ? null : JSON.stringify(option)).then((kitMap) => { // console.log(result);
      MakeKitApp.inst.setKitMap(kitMap)
      UI.success("Kit options applied.").show()
      optionDialog.hide()
    }).catch(error => UI.error(error).show())
  })












  /** 
   * 
   * Content assignment
  */

  $('.app-navbar').on('click', '.bt-content', (e) => {
    if (!MakeKitApp.inst.kitMap) {
      UI.error('Please save or open a kit.').show()
      return
    }
    textDialog.setKitMap(MakeKitApp.inst.kitMap).show()
    // KitBuild.openKitMap(MakeKitApp.inst.kitMap.map.kid).then(kitMap => {
    //   MakeKitApp.inst.setKitMap(kitMap)
    // })
  })

  $('form.form-search-text').on('submit', (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.ajax.post(`contentApi/getTexts/1/5`, {
      keyword: $('#input-keyword').val().trim()
    }).then(texts => {
      let textsHtml = ''
      texts.forEach(text => {
        textsHtml += `<div class="text-item d-flex align-items-center py-1 border-bottom" role="button"`
        textsHtml += `  data-tid="${text.tid}" data-title="${text.title}">`
        textsHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">${text.title}</span>`
        textsHtml += `  <span class="text-end text-nowrap ms-3">`
        textsHtml += `    <button class="btn btn-sm btn-primary bt-assign"><i class="bi bi-tag-fill"></i> Assign</button>`
        textsHtml += `  </span>`
        textsHtml += `</div>`
      });
      $('#list-text').html(textsHtml)
    })
  })

  $('#list-text').on('click', '.bt-assign', e => {
    e.preventDefault()
    let tid = $(e.currentTarget).parents('.text-item').attr('data-tid')
    this.ajax.post(`contentApi/assignTextToKitMap`, {
      tid: tid,
      kid: textDialog.kitMap.map.kid
    }).then(kitMap => { console.log(kitMap)
      this.ajax.get(`contentApi/getText/${kitMap.map.text}`).then(text => {
        let assignedTextHtml = `<span class="text-danger">Text:</span> ${text.title} <span class="badge rounded-pill bg-danger bt-unassign px-3 ms-3" role="button" data-text="${text.tid}" data-kid="${textDialog.kitMap.map.kid}">Unassign</span>`
        $("#assigned-text").html(assignedTextHtml)
      })
      MakeKitApp.inst.setKitMap(kitMap)
    }).catch(error => console.error(error))
  })

  $('#assigned-text').on('click', '.bt-unassign', e => {
    e.preventDefault()
    let kid = $(e.currentTarget).attr('data-kid')
    this.ajax.post(`contentApi/unassignTextFromKitMap`, {
      kid: kid,
    }).then(kitMap => { console.log(kitMap)
      $("#assigned-text").html('<em class="text-danger px-3">This kit has no text assigned.</em>')
      MakeKitApp.inst.setKitMap(kitMap)
    }).catch(error => console.error(error))
  })









  /** 
   * Save/Save As Kit
   * */

  $('.app-navbar .bt-save').on('click', () => { // console.log(MakeKitApp.inst)
    if (!MakeKitApp.inst.kitMap) $('.app-navbar .bt-save-as').trigger('click')
    else saveAsDialog.setKitMap(MakeKitApp.inst.kitMap)
      .setTitle("Save Kit (Update)")
      .setIcon("file-earmark-check")
      .show()
  })
  
  $('.app-navbar .bt-save-as').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) {
      UI.warning("Nothing to save, please open a concept map.").show()
      return
    }
    saveAsDialog.setKitMap()
      .setTitle("Save Current Kit As (Another Kit)...")
      .setIcon("file-earmark-plus")
      .show()
  })

  $('#kit-save-as-dialog').on('click', '.bt-generate-fid', (e) => { // console.log(e)
    $('#input-fid').val($('#input-title').val().replace(/\s/g, '')
      .substring(0, 20).trim().toUpperCase()),
    e.preventDefault()
  })

  $('#kit-save-as-dialog').on('click', '.bt-new-topic-form', (e) => { // console.log(e)
    $('#kit-save-as-dialog .form-new-topic').slideDown('fast')
    e.preventDefault()
  })

  $('#kit-save-as-dialog').on('submit', (e) => {
    e.preventDefault()
    if (!MakeKitApp.inst.conceptMap) {
      UI.info('Please open a goalmap.').show()
      return;
    }
    if ($('#input-title').val().trim().length == 0) {
      UI.info('Please provide a name for the kit.').show()
      return;
    }
    // console.log(saveAsDialog.kitMap, MakeKitApp.inst)
    let data = Object.assign({
      kid: saveAsDialog.kitMap ? saveAsDialog.kitMap.map.kid : null,
      kfid: $('#input-fid').val().match(/^ *$/) ? null : $('#input-fid').val().trim().toUpperCase(),
      name: $('#input-title').val(),
      layout: $('input[name="input-layout"]:checked').val(),
      // options: not included, separate procedures
      create_time: null,
      enabled: $('#input-enabled').is(':checked'),
      author: this.user ? this.user.username : null,
      cmid: MakeKitApp.inst.conceptMap.map.cmid ? MakeKitApp.inst.conceptMap.map.cmid : null,
    }, KitBuildUI.buildConceptMapData(this.canvas)); // console.log(data); // return
    this.ajax.post("kitBuildApi/saveKitMap", { data: Core.compress(data) })
      .then(kitMap => { // console.log(kitMap);
        MakeKitApp.inst.setKitMap(kitMap);
        UI.success("Kit has been saved successfully.").show(); 
        saveAsDialog.hide(); 
      })
      .catch(error => { UI.error(error).show(); })
  })

  








  /** 
   * Kit Edges Modification Tools
   * */ 

  $('.app-navbar .bt-toggle-right').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) return
    if (this.canvas.cy.edges('[type="right"]').length)
    this.canvas.cy.edges('[type="right"]').remove();
    else {
      MakeKitApp.inst.conceptMap.linktargets.forEach(linktarget => {
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(linktarget.target_data)
        })
      });
    }
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
  });

  $('.app-navbar .bt-toggle-left').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) return
    if (this.canvas.cy.edges('[type="left"]').length)
    this.canvas.cy.edges('[type="left"]').remove();
    else {
      MakeKitApp.inst.conceptMap.links.forEach(link => {
        if (!link.source_cid) return
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(link.source_data)
        })
      });
    }
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
  });

  $('.app-navbar .bt-remove').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) return
    if (this.canvas.cy.edges().length) this.canvas.cy.edges().remove();
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
  });

  $('.app-navbar .bt-restore').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) return
    this.canvas.cy.edges().remove();
    MakeKitApp.inst.conceptMap.links.forEach(link => {
      if (!link.source_cid) return
      this.canvas.cy.add({
        group: "edges",
        data: JSON.parse(link.source_data)
      })
    });
    MakeKitApp.inst.conceptMap.linktargets.forEach(linktarget => {
      this.canvas.cy.add({
        group: "edges",
        data: JSON.parse(linktarget.target_data)
      })
    });
    this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
  });

  $('.app-navbar .bt-reset').on('click', () => {
    if (!MakeKitApp.inst.conceptMap) return
    let confirm = UI.confirm("Do you want to reset the map to goalmap settings?").positive(() => {
      this.canvas.cy.elements().remove()
      this.canvas.cy.add(KitBuildUI.composeConceptMap(MakeKitApp.inst.conceptMap))
      this.canvas.applyElementStyle()
      this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
      confirm.hide()
      UI.info("Kit has been reset to goalmap settings.").show()
    }).show()
  })

}









/**
 * 
 * Handle refresh web browser
 */

MakeKitApp.handleRefresh = (kbui) => {
  let session = Core.instance().session()
  let canvas  = kbui.canvases.get(MakeKitApp.canvasId)
  session.getAll().then(sessions => { // console.log(sessions)
    let cmid = sessions.cmid
    let kid  = sessions.kid
    let promises = []
    if (cmid) promises.push(KitBuild.openConceptMap(cmid))
    if (kid) promises.push(KitBuild.openKitMap(kid))
    Promise.all(promises).then(maps => {
      let kitMap = maps[1]
      if (kitMap) {
        MakeKitApp.inst.setKitMap(kitMap) // will also set the concept map
        canvas.cy.add(KitBuildUI.composeKitMap(kitMap))
        canvas.applyElementStyle()
        canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        return
      }
      let conceptMap = maps[0]
      if (conceptMap) {
        MakeKitApp.inst.setConceptMap(conceptMap)
        canvas.cy.add(KitBuildUI.composeConceptMap(conceptMap))
        canvas.applyElementStyle()
        canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        return
      }
    })
  })
}