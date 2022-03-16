$(() => { // jQuery onReady callback
  let app = ReviewApp.instance()
})

class ReviewApp {
  constructor() {
    this.kbui = KitBuildUI.instance(ReviewApp.canvasId)
    let canvas = this.kbui.canvases.get(ReviewApp.canvasId)
    // canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { stack: 'right' })
    canvas.addToolbarTool(KitBuildToolbar.COMPARE, { stack: 'left' })
    canvas.toolbar.render()
    canvas.canvasTool.enableConnector(false)
    canvas.canvasTool.enableIndicator(false)
    canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)

    this.session = Core.instance().session();
    this.ajax = Core.instance().ajax();
    this.canvas = canvas;
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${ReviewApp.canvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true })

    this.handleEvent();
    this.handleRefresh();
  }

  static instance() {
    ReviewApp.inst = new ReviewApp()
    return ReviewApp.inst;
  }

  setConceptMap(conceptMap) { console.warn("CONCEPT MAP SET:", conceptMap)
    this.conceptMap = conceptMap
    if (conceptMap) {
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
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true })
  }

  setKitMap(kitMap) { console.warn("KIT MAP SET:", kitMap)
    this.kitMap = kitMap
    if (kitMap) {
      this.setConceptMap(kitMap.conceptMap)
      this.session.set('kid', kitMap.map.kid)
      let tooltipText = ''
      tooltipText += "FBLV:" + kitMap.parsedOptions.feedbacklevel
      tooltipText += ",FBSV:" + kitMap.parsedOptions.feedbacksave
      tooltipText += ",FFB:" + kitMap.parsedOptions.fullfeedback
      tooltipText += ",LOG:" + kitMap.parsedOptions.log
      tooltipText += ",MOD:" + kitMap.parsedOptions.modification
      tooltipText += ",RD:" + kitMap.parsedOptions.readcontent
      tooltipText += ",RST:" + kitMap.parsedOptions.reset
      tooltipText += ",SVLD:" + kitMap.parsedOptions.saveload
      let status = `<span class="mx-2 d-flex align-items-center status-kit">`
        + `<span class="badge rounded-pill bg-primary" role="button" data-bs-toggle="tooltip" data-bs-placement="top" title="${tooltipText}">ID: ${kitMap.map.kid}</span>`
        + `<span class="text-secondary ms-2 text-truncate"><small>${kitMap.map.name}</small></span>`
        + `</span>`
      StatusBar.instance().remove('.status-kit').append(status);
    } else {
      StatusBar.instance().remove('.status-kit');
      this.session.unset('kid')
    }
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true })
  }

  setLearnerMap(learnerMap) { console.warn("LEARNER MAP SET:", learnerMap) 
    this.learnerMap = learnerMap
    if (learnerMap) {
      this.session.set('lmid', learnerMap.map.lmid)
      let status = `<span class="mx-2 d-flex align-items-center status-learnermap">`
        + `<span class="badge rounded-pill bg-warning text-dark">ID: ${learnerMap.map.lmid}</span>`
        + `</span>`
      StatusBar.instance().remove('.status-learnermap').append(status);
    } else {
      StatusBar.instance().remove('.status-learnermap');
      this.session.unset('lmid')
    }
  }

  handleEvent() {
  
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
          $('#kit-save-as-dialog .input-title').val('Kit of ' + ReviewApp.inst.conceptMap.map.title)
          $('#kit-save-as-dialog .input-title').focus().select()
          $('#kit-save-as-dialog .bt-generate-fid').trigger('click')
          $('#input-layout-preset').prop('checked', true)
          $('#input-enabled').prop('checked', true)
        }
      },
      hideElement: '.bt-cancel'
    })
    saveAsDialog.setKitMap = (kitMap) => { console.log(kitMap)
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
      width: '700px',
    })
  
    let contentDialog = UI.modal('#kit-content-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      get height() { return $('body').height() * .7 | 0 },
      get offset() { return { left: ($('body').width() * .1 | 0) } },
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      minWidth: 375,
      minHeight: 200,
      onShow: () => {}
    })
    contentDialog.setContent = (content, type = 'plain') => {
      contentDialog.content = content
      return contentDialog
    }
  
    let feedbackDialog = UI.modal('#feedback-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      width: 375,
      onShow: () => {
        $('#feedback-dialog').off('click').on('click', '.bt-modify', (e) => {
          $('.app-navbar .bt-mymap').trigger('click')
          feedbackDialog.hide()
        })
      }
    })
    feedbackDialog.setCompare = (compare, level = Analyzer.MATCH | Analyzer.EXCESS) => {
      feedbackDialog.compare = compare
      console.log(compare)
      let content = ''
      if (compare.match.length && (level & Analyzer.MATCH)) {
        content += `<div class="d-flex align-items-center"><i class="bi bi-check-circle-fill text-success fs-1 mx-3"></i> `
        content += `<span>You have <strong class="text-success fs-bold">${compare.match.length} matching</strong> propositions.</span></div>`
      }
      if (compare.excess.length && (level & Analyzer.EXCESS)) {
        content += `<div class="d-flex align-items-center"><i class="bi bi-exclamation-triangle-fill text-primary fs-1 mx-3"></i> `
        content += `<span>You have <strong class="text-primary fs-bold">${compare.excess.length} excessive</strong> propositions.</span></div>`
      }
      if (compare.miss.length && level != Analyzer.NONE) {
        content += `<div class="d-flex align-items-center"><i class="bi bi-exclamation-triangle-fill text-danger fs-1 mx-3"></i> `
        content += `<span>You have <strong class="text-danger fs-bold">${compare.miss.length} missing</strong> propositions.</span></div>`
      }
  
      if (compare.excess.length == 0 && compare.miss.length == 0) {
        content = `<div class="d-flex align-items-center"><i class="bi bi-check-circle-fill text-success fs-1 mx-3"></i> `
        content += `<span><span class="text-success">Great!</span><br>All the propositions are <strong class="text-success fs-bold">matching</strong>.</span></div>`
      }
  
      $('#feedback-dialog .feedback-content').html(content)
      return feedbackDialog
    }
  
  
  
  
  
  
  
  
  
    /** 
     * Open or Create New Kit
     * */
  
    $('.app-navbar').on('click', '.bt-open-kit', () => {
      if (feedbackDialog.learnerMapEdgesData) 
        $('.app-navbar .bt-mymap').trigger('click')
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
  
      this.ajax.get(`kitBuildApi/getKitListByConceptMap/${openDialog.cmid}`).then(kits => { // console.log(kits)
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
          let cyData = KitBuildUI.composeKitMap(kitMap)    
          ReviewApp.parseKitMapOptions(kitMap)
          if (this.canvas.cy.elements().length) {
            let confirm = UI.confirm("Open the kit replacing the current kit on Canvas?").positive(() => {
              ReviewApp.resetMapToKit(kitMap, this.canvas);
              ReviewApp.inst.setKitMap(kitMap);
              ReviewApp.inst.setLearnerMap();
              confirm.hide()
              openDialog.hide()
            }).show()
            return
          }
          ReviewApp.resetMapToKit(kitMap, this.canvas)
          ReviewApp.inst.setKitMap(kitMap)
          ReviewApp.inst.setLearnerMap()
        } catch (error) { console.error(error)
          UI.error("Unable to open selected kit.").show(); 
        }
      }).catch((error) => { console.error(error)
        UI.error("Unable to open selected kit.").show(); 
      })
    });
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * Content
     * */
  
    $('.app-navbar').on('click', '.bt-content', () => { // console.log(ReviewApp.inst)
      if (!ReviewApp.inst.kitMap) return
      else contentDialog.setContent().show()
    })
  
    $('#kit-content-dialog .bt-scroll-top').on('click', (e) => {
      $('#kit-content-dialog .content').parent().animate({scrollTop: 0}, 200)
    })
  
    $('#kit-content-dialog .bt-scroll-more').on('click', (e) => {
      let height = $('#kit-content-dialog .content').parent().height()
      let scrollTop = $('#kit-content-dialog .content').parent().scrollTop()
      $('#kit-content-dialog .content').parent().animate({scrollTop: scrollTop + height - 16}, 200)
    })
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * Save Load Learner Map
     * */
  
    $('.app-navbar').on('click', '.bt-save', () => { // console.log(ReviewApp.inst)
      let learnerMap = ReviewApp.inst.learnerMap
      let kitMap = ReviewApp.inst.kitMap
      if (!kitMap) {
        UI.warning('Please open a kit.').show()
        return
      }
      if (feedbackDialog.learnerMapEdgesData) 
        $('.app-navbar .bt-mymap').trigger('click')
      console.log(learnerMap)
      let data = Object.assign({
        lmid: learnerMap ? learnerMap.map.lmid : null,
        kid: kitMap.map.kid,
        author: this.user ? this.user.username : null,
        type: 'draft',
        cmid: kitMap.map.cmid,
        create_time: null,
        data: null,
      }, KitBuildUI.buildConceptMapData(this.canvas)); console.log(data); // return
      this.ajax.post("kitBuildApi/saveLearnerMap", { data: Core.compress(data) })
        .then(learnerMap => { // console.log(kitMap);
          ReviewApp.inst.setLearnerMap(learnerMap);
          UI.success("Concept map has been saved successfully.").show(); 
        })
        .catch(error => { UI.error(error).show(); })
    })
  
    $('.app-navbar').on('click', '.bt-load', () => {
      let kitMap = ReviewApp.inst.kitMap
      if (!kitMap) {
        UI.warning('Please open a kit.').show()
        return
      }
      if (feedbackDialog.learnerMapEdgesData) 
        $('.app-navbar .bt-mymap').trigger('click')
      
      let data = {
        kid: kitMap.map.kid,
        username: null
      }
      if (!data.username) delete data.username
      this.ajax.post('kitBuildApi/getLastDraftLearnerMapOfUser', data).then(learnerMap => { // console.log(learnerMap)
        if (!learnerMap) {
          UI.warning("No user saved map data for this kit.").show()
          return
        }
        if (this.canvas.cy.elements().length) {
          let confirm = UI.confirm("Load saved concept map?")
            .positive(() => {
              learnerMap.kitMap = kitMap;
              learnerMap.conceptMap = kitMap.conceptMap;
              this.canvas.cy.elements().remove()
              this.canvas.cy.add(KitBuildUI.composeLearnerMap(learnerMap))
              this.canvas.applyElementStyle()
              this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
              ReviewApp.inst.setLearnerMap(learnerMap);
              UI.info("Concept map loaded.").show()
              confirm.hide()
            }).show()
            return
        }
        ReviewApp.openLearnerMap(learnerMap.map.lmid, this.canvas);
      }).catch(error => {
        console.error(error)
        UI.error("Unable to load saved concept map.").show()
      })
    })
    
  
  
  
  
  
  
  
  
    /**
     * Reset concept map to kit 
     * */
  
    $('.app-navbar').on('click', '.bt-reset', e => {
      if (!ReviewApp.inst.kitMap) {
        UI.info('Please open a kit.')
        return
      }
      if (feedbackDialog.learnerMapEdgesData) 
        $('.app-navbar .bt-mymap').trigger('click')
  
      let confirm = UI.confirm('Do you want to reset this concept map as defined in the kit?').positive(() => {
        KitBuild.openKitMap(ReviewApp.inst.kitMap.map.kid)
          .then(kitMap => {
            ReviewApp.resetMapToKit(kitMap, this.canvas)
            let undoRedo = this.canvas.toolbar.tools.get(KitBuildToolbar.UNDO_REDO)
            if (undoRedo) undoRedo.clearStacks().updateStacksStateButton()
            confirm.hide()
            UI.info('Concept map has been reset.').show()
            return
        })
      }).show()
    })
  
  
  
  
  
  
  
  
  
  
  
    /**
     * 
     * Feedback
     */
    $('.app-navbar').on('click', '.bt-feedback', () => {
  
      if (!ReviewApp.inst.kitMap) return
      if (feedbackDialog.learnerMapEdgesData) 
        $('.app-navbar .bt-mymap').trigger('click')
  
      let learnerMapData = KitBuildUI.buildConceptMapData(this.canvas)
      feedbackDialog.learnerMapEdgesData = this.canvas.cy.edges().jsons()
  
      let feedbacksave = ReviewApp.inst.kitMap.parsedOptions.feedbacksave
      if (feedbacksave) {
        let kitMap = ReviewApp.inst.kitMap
        let data = Object.assign({
          lmid: null, // so it will insert new rather than update
          kid: kitMap.map.kid,
          author: this.user ? this.user.username : null,
          type: 'feedback',
          cmid: kitMap.map.cmid,
          create_time: null,
          data: null,
        }, learnerMapData); console.log(data); // return
        this.ajax.post("kitBuildApi/saveLearnerMap", { data: Core.compress(data) })
          .then(learnerMap => {
            console.warn("Concept map save-on-feedback has been saved successfully.");
          }).catch(error => { console.error(error); })
      }
  
      learnerMapData.conceptMap = ReviewApp.inst.conceptMap
      Analyzer.composePropositions(learnerMapData)
      let direction = learnerMapData.conceptMap.map.direction
      let compare = Analyzer.compare(learnerMapData, direction)
      let level = Analyzer.MATCH | Analyzer.EXCESS | Analyzer.MISS
      Analyzer.showCompareMap(compare, this.canvas.cy, direction, level)
      this.canvas.canvasTool.enableIndicator(false).enableConnector(false)
        .clearCanvas().clearIndicatorCanvas()
      // feedbackDialog.setCompare(compare, level).show()
      
      // Apply edge visibility settings
      let compareTool = this.canvas.toolbar.tools.get(KitBuildToolbar.COMPARE)
      if (compareTool) compareTool.apply()
  
      
    })
    $('.app-navbar').on('click', '.bt-mymap', () => {
      if (!feedbackDialog.learnerMapEdgesData) return
      this.canvas.cy.edges().remove()
      this.canvas.cy.add(feedbackDialog.learnerMapEdgesData)
      this.canvas.applyElementStyle()
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
      feedbackDialog.learnerMapEdgesData = null
    })
  
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * 
     * Submit
    */
    $('.app-navbar').on('click', '.bt-finish', () => {
      let confirm = UI.confirm("Finish reviwing your concept map?<br/>This will end all the concept mapping session.", {
          iconStyle: 'danger', icon: 'exclamation-triangle-fill'
        }).positive(() => {
          // TODO: Destroy concept map session data, go back to blank Kit-Building activity
          confirm.hide()
        }).show()
    })
  
  }
  
  /**
   * 
   * Handle refresh web browser
   */
  
  handleRefresh() {
    this.session.getAll().then(sessions => { // console.log(sessions)
      let kid  = sessions.kid
      let lmid = sessions.lmid
      let promises = []
      if (kid) promises.push(KitBuild.openKitMap(kid))
      if (lmid) promises.push(KitBuild.openLearnerMap(lmid))
      Promise.all(promises).then(maps => { // console.log(maps)
        let kitMap = maps[0]
        let learnerMap = maps[1]
        ReviewApp.parseKitMapOptions(kitMap)
        if (kitMap && !learnerMap) {
          ReviewApp.resetMapToKit(kitMap, this.canvas)
          return
        } 
        if (learnerMap) {
          learnerMap.kitMap = kitMap
          learnerMap.conceptMap = kitMap.conceptMap
          this.canvas.cy.elements().remove()
          this.canvas.cy.add(KitBuildUI.composeLearnerMap(learnerMap))
          this.canvas.applyElementStyle()
          this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
          ReviewApp.inst.setKitMap(kitMap)
          ReviewApp.inst.setLearnerMap(learnerMap)
        }
        else UI.warning('Unable to display kit.').show()
      })
    })
  }
}

ReviewApp.canvasId = "review-canvas"


/** 
 * 
 * Helpers
*/

ReviewApp.parseKitMapOptions = (kitMap) => {
  kitMap.parsedOptions = ReviewApp.parseOptions(kitMap.map.options, {
    feedbacklevel: 2,
    fullfeedback: 1,
    modification: 1,
    readcontent: 1,
    saveload: 1,
    reset: 1,
    feedbacksave: 1,
    log: 0
  })
}

ReviewApp.resetMapToKit = (kitMap, canvas) => {
  // will also set and cache the concept map
  ReviewApp.inst.setKitMap(kitMap)
  canvas.cy.elements().remove()
  canvas.cy.add(KitBuildUI.composeKitMap(kitMap))
  canvas.applyElementStyle()
  if (kitMap.map.layout == "random") {
    canvas.cy.elements().layout({name: 'fcose', animationDuration: 0, fit: false, stop: () => {
      canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).center(null, {duration: 0})
    }}).run()
  } else canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
  
  // TODO: apply kit options to UI
  // console.log(kitMap)

  let feedbacklevelFeature = '<button class="bt-feedback btn btn-warning"><i class="bi bi-eye-fill"></i> Feedback</button>'
  feedbacklevelFeature += '<button class="bt-mymap btn btn-warning"><i class="bi bi-eye-slash-fill"></i> Clear Feedback</button>'
  let saveloadFeature = '<button class="bt-save btn btn-secondary"><i class="bi bi-download"></i> Save</button>'
  saveloadFeature += '<button class="bt-load btn btn-secondary"><i class="bi bi-upload"></i> Load</button>'
  let readcontentFeature = '<button class="bt-content btn btn-sm btn-secondary"><i class="bi bi-file-text-fill"></i> Contents</button>'
  let resetFeature = '<button class="bt-reset btn btn-danger"><i class="bi bi-arrow-counterclockwise"></i> Reset</button>'

  if (kitMap.parsedOptions.feedbacklevel) $('#recompose-feedbacklevel').html(feedbacklevelFeature).removeClass('d-none')
  else $('#recompose-feedbacklevel').html('').addClass('d-none')
  if (kitMap.parsedOptions.saveload) $('#recompose-saveload').html(saveloadFeature).removeClass('d-none')
  else $('#recompose-saveload').html('').addClass('d-none')
  if (kitMap.parsedOptions.reset) $('#recompose-reset').html(resetFeature).removeClass('d-none')
  else $('#recompose-reset').html('').addClass('d-none')
  if (kitMap.parsedOptions.readcontent) $('#recompose-readcontent').html(readcontentFeature).removeClass('d-none')
  else $('#recompose-readcontent').html('').addClass('d-none')
  return
}

ReviewApp.parseOptions = (optionJsonString, defaultValueIfNull) => {
  if (optionJsonString === null) return defaultValueIfNull
  let option, defopt = defaultValueIfNull
  try {
    option = Object.assign({}, defopt, JSON.parse(optionJsonString))
    option.feedbacklevel = option.feedbacklevel ? parseInt(option.feedbacklevel) : defopt.feedbacklevel
  } catch (error) { UI.error(error).show() }
  return option
}