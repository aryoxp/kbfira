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

    this.session = Core.instance().session()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    // let observer = new MutationObserver((mutations) => $(`#${ReviewApp.canvasId} > div`).css('width', 0))
    // observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true })
  }

  static instance() {
    ReviewApp.inst = new ReviewApp()
    ReviewApp.handleEvent(ReviewApp.inst.kbui)
    ReviewApp.handleRefresh(ReviewApp.inst.kbui)
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
}

ReviewApp.canvasId = "review-canvas"

ReviewApp.handleEvent = (kbui) => {

  this.canvas = kbui.canvases.get(ReviewApp.canvasId);
  this.ajax = Core.instance().ajax();
  this.session = Core.instance().session();

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
   * Back to Kit-Building
   * */

  $('.app-navbar').on('click', '.bt-modify', () => { // console.log(ReviewApp.inst)
    let confirm = UI.confirm('Go back and modify the map?').positive(() => {
      Core.instance().session().unset('flmid').then(() => {
        let url = Core.instance().config().get('baseurl')
        window.location.href = url;
        confirm.hide()
      })
    }).show()
    // console.log(Core.instance().config().get('baseurl'))
  })














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
        Promise.all([
          this.session.unset("cmid"),
          this.session.unset("kid"),
          this.session.unset("lmid"),
          this.session.unset("flmid"),
          this.session.unset("user")
        ]).then(() => {
          KitBuildCollab.enableControl(false);
          StatusBar.instance().remove('.status-user');
          this.canvas.cy.elements().remove();
          this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
          confirm.hide()
          UI.success("You have been signed out and will be automatically redirected to Extended KB page in 3 seconds.").show();
          setTimeout(() => {
            let baseurl = Core.instance().config().get('baseurl');
            window.location.href = baseurl + "";
          }, 3000)
        });
        confirm.hide()
      }).show()
  })

}









/**
 * 
 * Handle refresh web browser
 */

ReviewApp.handleRefresh = (kbui) => {
  let session = Core.instance().session()
  let canvas  = kbui.canvases.get(ReviewApp.canvasId)
  session.getAll().then(sessions => { // console.log(sessions)
    let kid  = sessions.kid
    let lmid = sessions.flmid // fixed
    if (!lmid) {
      UI.dialog('Invalid concept map.', {icon: 'exclamation-triangle-fill', iconStyle: 'danger'}).show();
      return;
    }
    let promises = []
    if (kid) promises.push(KitBuild.openKitMap(kid))

    // should open only learnermap which has fixed state
    if (lmid) promises.push(KitBuild.openLearnerMap(lmid))
    Promise.all(promises).then(maps => { // console.log(maps)
      let kitMap = maps[0]
      let learnerMap = maps[1]
      ReviewApp.parseKitMapOptions(kitMap)
      if (kitMap && !learnerMap) {
        ReviewApp.resetMapToKit(kitMap, canvas)
        return
      } 
      if (learnerMap) {
        learnerMap.kitMap = kitMap
        learnerMap.conceptMap = kitMap.conceptMap
        canvas.cy.elements().remove()
        canvas.cy.add(KitBuildUI.composeLearnerMap(learnerMap))
        canvas.applyElementStyle()
        canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        ReviewApp.inst.setKitMap(kitMap)
        ReviewApp.inst.setLearnerMap(learnerMap)
      }
      else UI.warning('Unable to display kit.').show()
    })
  })
}

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