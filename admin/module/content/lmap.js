class LearnermapApp {

  static canvasId = "teachermap-canvas";
  static kitCanvasId = "kitmap-canvas";
  static lmapCanvasId = "learnermap-canvas";

  constructor(options) {
    this.settings = Object.assign({}, options);
    this.session = Core.instance().session();
    this.ajax = Core.instance().ajax();
    this.canvas = this.initTeacherMapCanvas();
    this.kitCanvas = this.initKitCanvas();
    this.lmapCanvas = this.initLmapCanvas();
    this.handleEvent();
    this.handleRefresh();
  }
  initTeacherMapCanvas() {
    this.kbui = KitBuildUI.instance(LearnermapApp.canvasId)
    let canvas = this.kbui.canvases.get(LearnermapApp.canvasId)
    canvas.addCanvasTool(KitBuildCanvasTool.FOCUS, { gridPos: { x: 0, y: -1}})
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { priority: 6 })
    canvas.canvasTool.enableConnector(false).enableIndicator(false)
    canvas.toolbar.render()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${LearnermapApp.canvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 
    return canvas;
  }
  initKitCanvas() {
    this.kitkbui = KitBuildUI.instance(LearnermapApp.kitCanvasId)
    let canvas = this.kitkbui.canvases.get(LearnermapApp.kitCanvasId)
    canvas.addCanvasTool(KitBuildCanvasTool.FOCUS, { gridPos: { x: 0, y: -1}})
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { priority: 6 })
    canvas.canvasTool.enableConnector(false).enableIndicator(false)
    canvas.toolbar.render()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${LearnermapApp.kitCanvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 
    return canvas;
  }
  initLmapCanvas() {
    console.log(LearnermapApp.lmapCanvasId)
    this.lmapkbui = KitBuildUI.instance(LearnermapApp.lmapCanvasId)
    let canvas = this.lmapkbui.canvases.get(LearnermapApp.lmapCanvasId)
    canvas.addCanvasTool(KitBuildCanvasTool.FOCUS, { gridPos: { x: 0, y: -1}})
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { priority: 6 })
    canvas.canvasTool.enableConnector(false).enableIndicator(false)
    canvas.toolbar.render()
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${LearnermapApp.kitCanvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 
    return canvas;
  }
  static instance(options) {
    return new LearnermapApp(options)
  }
  handleEvent() {

    this.pagination = {
      page: 1,
      maxpage: 1,
      perpage: 1,
      count: 0,
      keyword: null
    }

    this.cmapPagination = Object.assign({}, this.pagination);
    this.assignTopicPagination = Object.assign({}, this.pagination);

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

    $('#form-search-cmap').on('submit', (e) => { // console.log(e);
      e.preventDefault();
      e.stopPropagation();
      let perpage = $('#form-search-cmap .input-perpage').val()
      let keyword = $('#form-search-cmap .input-keyword').val()
      // console.log(">" + keyword + "<", LearnermapApp.cmapPagination ? LearnermapApp.cmapPagination.keyword : undefined)
      let page = (!LearnermapApp.cmapPagination) ? 1 : LearnermapApp.cmapPagination.page;
      if (LearnermapApp.cmapPagination && keyword != LearnermapApp.cmapPagination.keyword) {
        page = 1;
      }
      if (LearnermapApp.cmapPagination)
        console.log(LearnermapApp.cmapPagination.keyword)
      this.ajax.post(`contentApi/searchConceptMap/${page}/${perpage}`, {
        keyword: keyword
      }).then(result => {
        let cmaps = result.cmaps;
        LearnermapApp.populateCmaps(cmaps);
        if (LearnermapApp.cmapPagination) {
          LearnermapApp.cmapPagination.keyword = keyword;
          LearnermapApp.cmapPagination.page = page;
          LearnermapApp.cmapPagination.update(result.count, perpage);  
        } else {
          LearnermapApp.cmapPagination = 
          Pagination.instance('#pagination-cmap', result.count, perpage).listen('#form-search-cmap').update();
          LearnermapApp.cmapPagination.keyword = keyword;
        }
        $('.dropdown-menu-teacher-map-list').addClass('show');
      });
    });

    $('#pagination-cmap').on('click', '.pagination-next', (e) => {
      if (this.cmapPagination.page < this.cmapPagination.maxpage) {
        this.cmapPagination.page++
        $('#form-search-cmap').trigger('submit')
      }
    })

    $('#pagination-cmap').on('click', '.pagination-prev', (e) => {
      if (this.cmapPagination.page > 1) {
        this.cmapPagination.page--
        $('#form-search-cmap').trigger('submit')
      }
    })

    $('#pagination-cmap').on('click', '.pagination-page', (e) => {
      this.cmapPagination.page = $(e.currentTarget).attr('data-page')
      $('#form-search-cmap').trigger('submit')
    })

    $('#list-cmap').on('click', '.bt-show-cmap', (e) => {
      let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      this.loadTeacherMap(cmid);
      $('form#form-search-cmap .bt-close').trigger('click');
    });

    $('#tabs-concept-map').on('click', '.item-kit', (e) => {
      let kid = $(e.currentTarget).attr('data-kid');
      this.loadKitMap(kid);
    });

    $('#tabs-concept-map').on('click', '.bt-delete-kit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let kid = $(e.currentTarget).parents('.item-kit').attr('data-kid');
      let name = $(e.currentTarget).siblings('.kit-name').html();
      let confirm = UI.confirm(`Delete kit: <span class="text-primary">${name}</span>?`).positive(() => {
        this.ajax.post('contentApi/deleteKit', {
          kid: kid
        }).then(result => {
          UI.success('Kit succesfully deleted.').show();
          this.session.get('cmid').then(cmid => {
            this.loadTeacherMap(cmid)
          })
          confirm.hide();
        }).catch(error => {
          UI.error(`Unable to delete kit: ${error}`).show();
          confirm.hide();
        })
      }).show();
      // this.loadKitMap(kid);
    });

    $('#tabs-concept-map').on('click', '.bt-tab-delete-kit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let kid = $(e.currentTarget).attr('data-kid');
      let name = $(e.currentTarget).attr('data-name');
      let confirm = UI.confirm(`Delete kit: <span class="text-primary">${name}</span>?`).positive(() => {
        this.ajax.post('contentApi/deleteKit', {
          kid: kid
        }).then(result => {
          UI.success('Kit succesfully deleted.').show();
          this.session.get('cmid').then(cmid => {
            this.loadTeacherMap(cmid)
          })
          confirm.hide();
        }).catch(error => {
          UI.error(`Unable to delete kit: ${error}`).show();
          confirm.hide();
        })
      }).show();
      // this.loadKitMap(kid);
    })


    $('#tabs-concept-map').on('click', '.bt-tab-delete-lmap', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let lmid = $(e.currentTarget).attr('data-lmid');
      let name = $(e.currentTarget).attr('data-lmid');
      let confirm = UI.confirm(`Delete learner map ID: <span class="text-primary">${name}</span>?`).positive(() => {
        this.ajax.post('contentApi/deleteLearnerMap', {
          lmid: lmid
        }).then(result => {
          this.lmapCanvas.cy.elements().remove()
          let tabLabel = `<span class="text-primary">Learner Map</span>`
          $('#nav-lmap-tab').html(tabLabel);
          $('#nav-kit-tab').trigger('click');
          UI.success('Learner map is succesfully deleted.').show();
          this.loadKitMap(this.kitMap.map.kid, false);
        }).catch(error => {
          UI.error(`Unable to delete learner map: ${error}`).show();
        }).finally(() => {
          confirm.hide();
        })
      }).show();
      // this.loadKitMap(lmid);
    })








    $('#list-cmap').on('click', '.bt-assign-topic', (e) => {
      let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      KitBuild.openConceptMap(cmid).then(cmap => { // console.log(cmap)
        topicDialog.cmapTitle = cmap.map.title;
        topicDialog.cmid = cmap.map.cmid;
        topicDialog.show();
        if (cmap.map.topic) {
          this.ajax.get(`contentApi/getTopic/${cmap.map.topic}`).then(topic => {
            // console.log(topic)
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
      let page = (!LearnermapApp.assignTopicPagination || 
        keyword != LearnermapApp.assignTopicPagination.keyword) ?
        1 : LearnermapApp.assignTopicPagination.page

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
        LearnermapApp.populateAssignTopics(topics, topicDialog.cmid)
        if (LearnermapApp.assignTopicPagination) {
          LearnermapApp.assignTopicPagination.keyword = keyword;
          LearnermapApp.assignTopicPagination.update(count, perpage);  
        } else LearnermapApp.assignTopicPagination = 
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
    })








    $('#list-cmap').on('click', '.bt-assign-text', (e) => {
      e.preventDefault();
      let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      KitBuild.openConceptMap(cmid).then(cmap => {
        textDialog.setCmap(cmap).show();
      });
    })

    $('form.form-assign-search-text').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('form.form-assign-search-text .input-perpage').val())
      let keyword = $('form.form-assign-search-text .input-keyword').val()
      let page = (!LearnermapApp.assignTextPagination || 
        keyword != LearnermapApp.assignTextPagination.keyword) ?
        1 : LearnermapApp.assignTextPagination.page
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
        LearnermapApp.populateAssignTexts(texts, textDialog.cmap.map.cmid)
        if (LearnermapApp.assignTextPagination) {
          LearnermapApp.assignTextPagination.keyword = keyword;
          LearnermapApp.assignTextPagination.update(count, perpage);  
        } else LearnermapApp.assignTextPagination = 
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



















    $('form#form-search-topic').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('#form-search-topic .input-perpage').val())
      let keyword = $('#form-search-topic .input-keyword').val()
      let page = (!LearnermapApp.topicPagination || keyword != LearnermapApp.topicPagination.keyword) ? 
        1 : LearnermapApp.topicPagination.page;
      Promise.all([
        this.ajax.post(`contentApi/getTopics/${page}/${perpage}`, {
          keyword: keyword
        }),
        this.ajax.post(`contentApi/getTopicsCount`, {
          keyword: keyword
        })
      ]).then(results => {
        let topics = results[0];
        let count = parseInt(results[1]);
        if (LearnermapApp.topicPagination) {
          LearnermapApp.topicPagination.perpage = perpage
          LearnermapApp.topicPagination.count = count
          LearnermapApp.topicPagination.keyword = keyword
          LearnermapApp.topicPagination.update();
        } else {
          LearnermapApp.topicPagination = Pagination.instance('#pagination-topic', count, perpage).listen('#form-search-topic').update()
        }
        LearnermapApp.populateTopics(topics)
        $('.dropdown-menu-topic-list').addClass('show');
      });
    });

    $('#search-panel .bt-close').on('click', (e) => {
      $(e.currentTarget).parents('.dropdown-menu').removeClass('show');
    })

    $('#list-topic').on('click', '.bt-list-cmap', (e) => {
      let tid = $(e.currentTarget).parents('.item-topic').attr('data-tid');
      this.ajax.post('contentApi/getConceptMapsByTopicId', {
        tid: tid
      }).then(cmaps => { // console.warn(cmaps.length);
        let containerId = `.dropdown-menu[data-tid="${tid}"]`;
        if (!cmaps.length) {
          $(containerId).html('<small><em>No concept maps.</em></small>')
        } else LearnermapApp.populateCmapListDropdown(cmaps, containerId);
      });
    })

    $('#list-topic').on('click', '.bt-show-cmap', (e) => {
      let cmid = $(e.currentTarget).parents('.item-cmap').attr('data-cmid');
      KitBuild.openConceptMap(cmid).then(conceptMap => { // console.log(conceptMap)
        this.conceptMap = conceptMap;
        let cyData = KitBuildUI.composeConceptMap(conceptMap)
        this.canvas.cy.elements().remove()
        this.canvas.cy.add(cyData)
        this.canvas.applyElementStyle()
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0});
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
        UI.success('Concept map loaded.').show();
        $('#search-panel .bt-close').trigger('click');
      }).catch(error => {
        console.error(error); 
        UI.dialog("The concept map data is invalid.", {
          icon: 'exclamation-triangle',
          iconStyle: 'danger'
        }).show()
      })
    })







    $('#tabs-concept-map .list-lmap').on('click', '.item-lmap', (e) => {
      let lmid = $(e.currentTarget).attr('data-lmid');
      KitBuild.openLearnerMap(lmid).then(learnerMap => { // console.log(learnerMap)
        this.loadLearnerMap(learnerMap);
      }).catch(error => {
        console.error(error); 
        UI.dialog("The concept map data is invalid.", {
          icon: 'exclamation-triangle',
          iconStyle: 'danger'
        }).show()
      });
    })




  }

  handleRefresh() {
    this.session.getAll().then(sess => {
      if(sess.cmid) this.loadTeacherMap(sess.cmid)
    })
  }
  loadTeacherMap(cmid) {
    if (!cmid) {
      UI.warning('Invalid concept map ID.').show();
      return
    }
    Promise.all([
      KitBuild.openConceptMap(cmid),
      this.ajax.get(`kitBuildApi/getKitListByConceptMap/${cmid}`)
    ]).then(result => { 

      let [conceptMap, kits] = result;
      let cyData = KitBuildUI.composeConceptMap(conceptMap);
      
      this.canvas.cy.elements().remove();
      this.canvas.cy.add(cyData);
      this.canvas.applyElementStyle();
      this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0});
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
      UI.success('Concept map loaded.').show();

      LearnermapApp.populateKits(kits);

      // clear learnermap
      LearnermapApp.populateLearnermaps(null);
      this.kitCanvas.cy.elements().remove();
      this.loadLearnerMap(); 
      
      $('#nav-kit-tab').html(`Kit Map`);
      $('#tab-kit').html(`Kit <span class="badge rounded-pill bg-success ms-2">${kits.length}</span>`);
      $('#tab-lmap').html(`Learner Map`);
      $('#nav-cmap-tab').trigger('click');

      this.session.set('cmid', cmid);

    }).catch(error => { console.error(error); 
      UI.dialog("The concept map data is invalid.", {
        icon: 'exclamation-triangle',
        iconStyle: 'danger'
      }).show()
    })
  }
  loadKitMap(kid, loadKit = true) {
    if (!kid) {
      UI.warning('Invalid kit map ID.').show();
      return
    }
    Promise.all([
      (loadKit ? KitBuild.openKitMap(kid) : this.kitMap),
      this.ajax.get(`contentApi/getLearnermapsOfKit/${kid}`)
    ]).then(result => {
      let [kitMap, learnermaps] = result;
      let cyData = KitBuildUI.composeKitMap(kitMap)
      this.kitMap = kitMap;
      this.kitCanvas.cy.elements().remove()
      this.kitCanvas.cy.add(cyData)
      this.kitCanvas.applyElementStyle()
      this.kitCanvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0});
      this.kitCanvas.canvasTool.clearCanvas().clearIndicatorCanvas();
      this.session.set('kid', kid);
      let kitTabLabel = `<span class="text-primary text-truncate" style="max-width:100px;">${kitMap.map.name}</span>`
      + `<span class="badge rounded-pill bg-primary bt-tab-detail-kit ms-2" data-name="${kitMap.map.name}" data-kid="${kid}">Detail</span>`
      + `<span class="badge rounded-pill bg-danger bt-tab-delete-kit ms-1" data-name="${kitMap.map.name}" data-kid="${kid}">Delete</span>`;
      $('#nav-kit-tab').html(kitTabLabel).trigger('click');
      $('#tab-lmap').html(`Learner Map <span class="badge rounded-pill bg-success ms-2">${learnermaps.length}</span>`)
      UI.success('Kit map loaded.').show();
      LearnermapApp.populateLearnermaps(learnermaps);
    })
  }
  loadLearnerMap(learnerMap = null) {
    this.lmapCanvas.cy.elements().remove();
    if (learnerMap === null) {
      let tabLabel = `<span class="text-primary">Learner Map</span>`;
      $('#nav-lmap-tab').html(tabLabel);
      return;
    }
    learnerMap.kitMap = this.kitMap;
    learnerMap.conceptMap = this.kitMap.conceptMap;
    this.lmapCanvas.cy.add(KitBuildUI.composeLearnerMap(learnerMap));
    this.lmapCanvas.applyElementStyle();
    this.lmapCanvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, { duration: 0 }).then(() => { });

    let tabLabel = `<span class="text-primary">Map: ${learnerMap.map.authorname}</span>`;
    tabLabel += `<span class="badge rounded-pill bg-success ms-2" data-lmid="${learnerMap.map.lmid}">ID ${learnerMap.map.lmid}</span>`;
    tabLabel += `<span class="badge rounded-pill bg-primary bt-tab-detail-lmap ms-1" data-lmid="${learnerMap.map.lmid}">Detail</span>`;
    tabLabel += `<span class="badge rounded-pill bg-danger bt-tab-delete-lmap ms-1" data-lmid="${learnerMap.map.lmid}">Delete</span>`;

    $('#nav-lmap-tab').html(tabLabel).trigger('click');
  }
}

LearnermapApp.populateCmaps = cmaps => {
  let cmapsHtml = '';
  cmaps.forEach(cmap => {
    cmapsHtml += `<div class="item-cmap d-flex align-items-center py-1 border-bottom" role="button"`
    cmapsHtml += `  data-cmid="${cmap.cmid}" data-title="${cmap.title}">`
    cmapsHtml += `  <span class="d-flex flex-fill ps-2 align-items-center" style="min-width:0">`
    cmapsHtml += `    <span class="text-truncate d-inline-block">${cmap.title}</span>`
    cmapsHtml += `    <span class="badge rounded-pill bg-warning text-dark ms-2">${cmap.nkit} Kits</span>`
    // cmapsHtml += `    <span class="badge rounded-pill bg-success ms-2 bt-detail"><i class="bi bi-search"></i> Detail</span>`
    cmapsHtml += `  </span>`
    cmapsHtml += `  <span class="text-end text-nowrap ms-3 d-flex align-items-center">`
    if (cmap.text) cmapsHtml += `    <span class="badge rounded-pill bg-success ms-1"><i class="bi bi-file-text"></i></span>`
    if (cmap.topictitle) cmapsHtml += `    <span class="badge rounded-pill bg-success ms-1 text-truncate" title="${cmap.topictitle}"><i class="bi bi-lightbulb-fill"></i></span>`
    cmapsHtml += `    <span class="badge rounded-pill bg-warning text-dark ms-1" title="${cmap.create_time}"><i class="bi bi-clock-fill"></i></span>`
    cmapsHtml += `    <span class="btn btn-sm btn-primary bt-show-cmap ms-2"><i class="bi bi-eye-fill"></i> Open</span>`
    // cmapsHtml += `    <span class="btn btn-sm btn-primary bt-assign-topic ms-1"><i class="bi bi-lightbulb-fill"></i></span>`
    // cmapsHtml += `    <span class="btn btn-sm btn-primary bt-assign-text ms-1"><i class="bi bi-file-text"></i></span>`
    // cmapsHtml += `    <span class="btn btn-sm btn-danger bt-delete ms-1"><i class="bi bi-x-lg"></i></span>`
    cmapsHtml += `  </span>`
    cmapsHtml += `</div>`
  });
  if (cmapsHtml.length == 0) cmapsHtml = '<em class="d-block m-3 text-muted">No concept maps found in current search.</em>';
  $('#list-cmap').html(cmapsHtml)
}

LearnermapApp.populateCmapListDropdown = (cmaps, containerId) => {
  let cmapsHtml = '';
  cmaps.forEach(cmap => {
    cmapsHtml += `<div class="item-cmap d-flex align-items-center py-1 border-bottom" role="button"`
    cmapsHtml += `  data-cmid="${cmap.cmid}" data-title="${cmap.title}">`
    cmapsHtml += `  <span class="d-flex flex-fill ps-2 align-items-center" style="min-width:0">`
    cmapsHtml += `  <span class="text-truncate d-inline-block">${cmap.title}</span>`
    if (cmap.text) cmapsHtml += `    <span class="badge rounded-pill bg-success ms-2">Text</span>`
    if (cmap.topictitle) cmapsHtml += `    <span class="badge rounded-pill bg-primary ms-2">${cmap.topictitle}</span>`
    cmapsHtml += `    <span class="badge rounded-pill bg-warning text-dark ms-2">${cmap.create_time}</span>`
    cmapsHtml += `  </span>`
    cmapsHtml += `  <span class="badge rounded-pull bg-primary bt-show-cmap ms-2" data-bs-auto-close="outside"><i class="bi bi-eye-fill"></i></span>`
    cmapsHtml += `</div>`
  });
  $(containerId).html(cmapsHtml)
}

LearnermapApp.populateTopics = topics => {
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

LearnermapApp.populateAssignTopics = (topics, cmid) => {
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

LearnermapApp.populateAssignTexts = (texts, cmid) => {
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

LearnermapApp.populateKits = (kits) => {
  if (!kits) {
    UI.error("Invalid kit").show();
    return;
  }
  let kitListHtml = '';
  for(let kit of kits) {
    kitListHtml += `<div class="">`
    kitListHtml += `<span class="dropdown-item text-truncate text-nowrap item-kit d-flex justify-content-between align-items-center" role="button" `
    kitListHtml += `data-kid="${kit.kid}"/>`
    kitListHtml += `  <span class="kit-name flex-fill">${kit.name}</span>`
    // kitListHtml += `  <span class="badge rounded-pill bg-danger ms-2 bt-delete-kit" role="button">Delete</span>`
    kitListHtml += `</span></div>`
  }
  if (kits.length == 0)
    kitListHtml += `<small class="mx-3"><em class="text-muted">No kit data</em></small>`
  $('#nav-tab-maps .list-kit').html(kitListHtml);
}

LearnermapApp.populateLearnermaps = (lmaps) => {
  if (!lmaps) {
    // UI.error("Invalid lmap").show();
    $('#nav-tab-maps .list-lmap').html('<small class="mx-3"><em class="text-muted">No learner map data</em></small>');
    return;
  }
  let lmapListHtml = '';
  for(let lmap of lmaps) { // console.log(lmap);
    lmapListHtml += `<div data-lmid="${lmap.lmid}" class="item-lmap d-flex align-items-center justify-content-between py-1 border-bottom" role="button">`
    lmapListHtml += `  <span class="lmap-name flex-fill text-truncate">`
    lmapListHtml += `  ${lmap.creator}`
    lmapListHtml += `    <span class="badge rounded-pill bg-success ms-2" role="button">ID ${lmap.lmid}</span>`
    lmapListHtml += `  </span>`
    lmapListHtml += `  <span class="d-flex align-items-center">`
    lmapListHtml += `    <span class="badge rounded-pill bg-warning text-dark ms-2 bt-delete-lmap" role="button">${lmap.type}</span>`
    lmapListHtml += `    <span class="badge rounded-pill bg-primary ms-1 bt-detail-lmap" role="button">Detail</span>`
    lmapListHtml += `    <span class="badge rounded-pill bg-danger ms-1 bt-delete-lmap" role="button"><i class="bi bi-x-lg mx-1"></i></span>`
    lmapListHtml += `  </span>`
    lmapListHtml += `</div>`
  }
  if (lmaps.length == 0)
    lmapListHtml += `<small class="mx-3"><em class="text-muted">No learner map data</em></small>`
  $('#nav-tab-maps .list-lmap').html(lmapListHtml);
}

$(() => {
  let app = LearnermapApp.instance()
})