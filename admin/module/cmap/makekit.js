$(() => { // jQuery onReady callback
  let app = MakeKitApp.instance()
})

class PartitionTool extends KitBuildToolbarTool {
  constructor(canvas, kitMap, conceptMap, options) {
    super(canvas, options);
    this.kitMap = kitMap;
    this.conceptMap = conceptMap;
    this.settings = Object.assign(this.settings, {}, options);
    this.shareDialogHtml = ``;
    this.partIndex = 0;
    this.partsMap = new Map();
    this.parts = []; // volatile, put parts in order
  }

  control() {
    let copyText = "Copy"
    let pasteText = "Paste"
    let controlHtml = 
      `<div class="btn-group partition-tool">
        <button class="btn btn-outline-primary btn-sm dropdown-toggle dd-partition" type="button" data-bs-toggle="dropdown" data-bs-auto-close="false" aria-expanded="false">
          <i class="bi bi-123"></i> Kit Set
        </button>
        <div class="dropdown-menu fs-small px-2" style="min-width: 250px">
          <div class="d-flex flex-column">
            <!-- <small>Kit Order for Extended Kit-Build</small>
            <hr> -->
            <div class="part-list scroll-y" style="max-height: 250px;"></div>
            <hr>
            <button class="btn btn-sm btn-primary mb-2 bt-select-ungrouped"><i class="bi bi-ui-radios-grid"></i> Select Ungrouped</button>
            <button class="btn btn-sm btn-success bt-validate"><i class="bi bi-ui-checks-grid"></i> Validate and Save Sets</button>
            <hr>
            <button class="btn btn-sm btn-danger mb-3 bt-remove"><i class="bi bi-trash"></i> Remove and Save Sets</button>
            <!-- <span class="text-secondary fst-italic">
            <small>Select severzal nodes on the canvas and click the <span class="text-danger fst-bold">[Make Set]</span> button on the appearing bounding box buttons to create a set of kit from the currently selected nodes. </small>
            <br> -->
            <small class="text-secondary">Drag and drop a set to change its order of appearance in the extended version of Kit-Build.</small>
            <!-- </span> -->
          </div>
        </div>
      </div>`
    return controlHtml
  }

  handle() {
    $('.partition-tool .part-list').on('click', '.item-set', (e) => {
      let setid = $(e.currentTarget).data('setid');
      let set = this.partsMap.get(setid);
      this.canvas.cy.elements().removeClass('select');
      this.canvas.cy.elements().unselect();
      if (set.elements) {
        let ids = [];
        Array.from(set.elements.keys()).forEach(id => ids.push(`#${id}`))
        this.canvas.cy.elements(ids.join(",")).addClass('select').select().trigger('select');
      }
    })
    $('.partition-tool .part-list').on('click', '.bt-delete-set', (e) => {
      e.stopPropagation();
      let setid = $(e.currentTarget).parents('.item-set').data('setid');
      $(e.currentTarget).parents('.item-set').slideUp('fast').promise().done(() => {
        $(e.currentTarget).parents('.item-set').remove();
        this.renumberParts();
      });
      this.partsMap.delete(setid);
      // this.refreshPartList();
    })
    $('.partition-tool').on('click', '.bt-select-ungrouped', (e) => {
      let ids = [];
      Array.from(this.partsMap.values()).forEach(p => {
        Array.from(p.elements.values()).forEach(e => {
          ids.push(`#${e.id()}`);
        });
      });
      // console.log(this.canvas.cy.elements().not(ids.join(',')));
      if (this.canvas.cy.elements().not(ids.join(',')).length) {
        this.canvas.cy.elements().unselect().not(ids.join(',')).select().trigger('select');
      } else UI.info('All elements have been assigned to a kit set.').show();
      // ids.push(`${e.id()}`);
    });
    $('.partition-tool').on('click', '.bt-validate', (e) => {
      let ids = [];
      Array.from(this.partsMap.values()).forEach(p => {
        Array.from(p.elements.values()).forEach(e => {
          ids.push(`#${e.id()}`);
        });
      });
      // console.log(this.canvas.cy.elements().not(ids.join(',')));
      if (this.canvas.cy.elements().not(ids.join(',')).length) {
        let ungrouped = this.canvas.cy.elements().unselect().not(ids.join(','));
        ungrouped.select().trigger('select');
        let num = this.canvas.cy.elements().not(ids.join(',')).length;
        let nc = 0, nl = 0, nse = 0, nte = 0;
        ungrouped.forEach(e => {
          if (e.data('type') == 'concept') nc++;
          if (e.data('type') == 'link') nl++;
          if (e.data('type') == 'left') nse++;
          if (e.data('type') == 'right') nte++;
        });
        let dialogText = `Cannot save the kit sets. ${num} element(s) are not assigned to a set.`;
        if (nc) dialogText += `<br>${nc} concept(s)`;
        if (nl) dialogText += `<br>${nl} link(s)`;
        if (nse) dialogText += `<br>${nse} source-edge(s)`;
        if (nte) dialogText += `<br>${nte} target-edge(s)`;
        dialogText += `<br>Save the kit, remove all sets, and redefine the sets.`;
        let dialog = KitBuildUI.dialog(dialogText, this.canvas.canvasId, {icon: 'exclamation-triangle', iconStyle: 'danger', iconColor: 'warning'});
        // dialog.show();
        // console.warn(dialog, this.canvas);
      } else {
        let order = [];
        $('.partition-tool .part-list .item-set').each((i, e) => {
          // console.log($(e).data());
          order.push($(e).data('setid'));
        })
        this.broadcastEvent('save-sets', {
          order: order,
          parts: this.partsMap
        })
      }
    });
    $('.partition-tool').on('click', '.bt-remove', (e) => {
      if (this.partsMap.size == 0) {
        UI.warning("Nothing to remove, the kit has no partial set.").show();
        return;
      }
      let confirm = UI.confirm("Remove all sets from this kit?").positive(() => {
        this.clearParts();
        this.broadcastEvent('remove-sets');
        UI.info('All sets have been removed from this kit.').show();
        confirm.hide();
      }).show();

    });
  }

  addPart(elements) { 
    // console.log(elements)
    if (!elements || elements.length == 0) return;

    let part = {
      id: ++this.partIndex,
      elements: new Map(),
      concepts: new Map(),
      links: new Map(),
      edges: new Map()
    };

    elements.forEach(e => {
      if (e.data('type') == 'concept') {
        part.concepts.set(e.id(), e);
        part.elements.set(e.id(), e);
      } else if (e.data('type') == 'link') {
        part.links.set(e.id(), e);
        part.elements.set(e.id(), e);
      }
      // skip edges for now...
    })
    elements.connectedEdges().forEach(e => {
      if (e.data('type') == 'left' || e.data('type') == 'right') {
        let concepts = e.connectedNodes();
        let allIncluded = concepts.every(concept => {
          return part.elements.has(concept.id());
        })
        if (allIncluded) part.edges.set(e.id(), e);
        // console.log(part.elements, allIncluded);
      }
    })
    part.edges.forEach((e, k) => part.elements.set(k, e))

    // console.log(part);

    let overlappedParts = {
      concepts: new Set(),
      links: new Set(),
      edges: new Set()
    };
    Array.from(this.partsMap.values()).forEach(p => {
      Array.from(part.elements.keys()).forEach(ek => {
        if (p.concepts.has(ek)) overlappedParts.concepts.add(part.elements.get(ek))
        else if (p.links.has(ek)) overlappedParts.links.add(part.elements.get(ek))
        else if (p.edges.has(ek)) overlappedParts.edges.add(part.elements.get(ek))
      })
    })
    
    // console.log(overlappedParts);

    let doAddPart = () => {
      this.partsMap.set(part.id, part);
      this.refreshPartList();
    }

    if (overlappedParts.concepts.size || 
        overlappedParts.links.size || 
        overlappedParts.edges.size) {
          let confirmText = "The following elements have been included in previous set:<br>";
          if (overlappedParts.concepts.size) confirmText += `Concept(s): `; 
          overlappedParts.concepts.forEach(c => {
            confirmText += `<span class="mx-1">${c.data('label')}</span>`
          })
          if (overlappedParts.concepts.size && overlappedParts.links.size) confirmText += '<br>';
          if (overlappedParts.links.size) confirmText += `Link(s): `; 
          overlappedParts.links.forEach(l => {
            confirmText += `<span class="mx-1">${l.data('label')}</span>`
          })
          confirmText += `<br>The elements and all associated edges of selections will <span class="text-danger">be moved</span> to new set.<br>Empty set will also <span class="text-danger">be removed</span> from list. Continue?`;
          let confirm = UI.confirm(confirmText).positive(() => {
            Array.from(this.partsMap.values()).forEach(p => {
              overlappedParts.concepts.forEach(c => {
                p.concepts.delete(c.id());
                p.elements.delete(c.id());
              })
              overlappedParts.links.forEach(l => {
                p.links.delete(l.id());
                p.elements.delete(l.id());
              })
              overlappedParts.edges.forEach(e => {
                p.edges.delete(e.id());
                p.elements.delete(e.id());
              })
            })
            doAddPart();
            confirm.hide();
          }).negative(() => {
            elements.select().trigger('select');
            confirm.hide()
          }).show()
        } else doAddPart()
  }

  refreshPartList() {
    $('.partition-tool .part-list').html('');
    let order = 0;
    Array.from(this.partsMap.values()).forEach(p => {
      let nc = p.concepts.size;
      let nl = p.links.size;
      if (nc == 0 && nl == 0) {
        this.partsMap.delete(p.id);
        return;
      }
      let partCtt = `<div class="d-flex justify-content-between align-items-center my-1 mx-2 bg-light border rounded item-set" data-setid="${p.id}" role="button">`;
      partCtt += `<small class="ms-2"><span class="set-order fw-bold text-primary">#${++order}</span>: Set ${p.id}</small>`;
      partCtt += `<span>`;
      if (nc) partCtt += `  <span class="badge rounded-pill bg-warning text-dark">C: ${nc}</span>`;
      if (nl) partCtt += `  <span class="badge rounded-pill bg-secondary">L: ${nl}</span>`;
      partCtt += `  <span class="btn btn-sm btn-danger m-1 bt-delete-set"><i class="bi bi-trash"></i></span>
      </span>`;
      partCtt += `</div>`;
      $('.partition-tool .part-list').append(partCtt);
      if (!$('.dd-partition').hasClass('show'))
        $('.dd-partition').trigger('click');
    });
    $('.partition-tool .part-list').sortable({
      group: 'list',
      animation: 200,
      ghostClass: 'ghost',
      onSort: () => {
        // console.warn('sort!')
        this.renumberParts();
      },
    });
    if (order == 0) {
      $('.partition-tool .part-list').html('<div class="text-secondary pt-2 ms-2"><small><em>This kit has no set data.</em></small></div>');
    }
  }

  renumberParts() {
    let order = 0;
    $('.partition-tool .part-list .item-set').each((i, e) => {
      let setid = $(e).data('setid'); // console.log(setid);
      $(e).find('.set-order').html(`#${++order}`);
    });
  }

  clearParts() {
    this.partsMap.clear();
    $('.partition-tool .part-list .item-set').slideUp('fast').promise().done(() => {
      $('.partition-tool .item-set').remove();
    });
  }
}

class KitSetTool extends KitBuildCanvasTool {
  constructor(canvas, options) {
    super(canvas, Object.assign({
      showOn: KitBuildCanvasTool.SH_MULTI,
      color: "#000000",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-textarea-t" viewBox="-5 -5 26 26">  <path d="M2.5 0c-.166 0-.33.016-.487.048l.194.98A1.51 1.51 0 0 1 2.5 1h.458V0H2.5zm2.292 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zm1.833 0h-.916v1h.916V0zm1.834 0h-.917v1h.917V0zm1.833 0h-.917v1h.917V0zM13.5 0h-.458v1h.458c.1 0 .199.01.293.029l.194-.981A2.51 2.51 0 0 0 13.5 0zm2.079 1.11a2.511 2.511 0 0 0-.69-.689l-.556.831c.164.11.305.251.415.415l.83-.556zM1.11.421a2.511 2.511 0 0 0-.689.69l.831.556c.11-.164.251-.305.415-.415L1.11.422zM16 2.5c0-.166-.016-.33-.048-.487l-.98.194c.018.094.028.192.028.293v.458h1V2.5zM.048 2.013A2.51 2.51 0 0 0 0 2.5v.458h1V2.5c0-.1.01-.199.029-.293l-.981-.194zM0 3.875v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 5.708v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zM0 7.542v.916h1v-.916H0zm15 .916h1v-.916h-1v.916zM0 9.375v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .916v.917h1v-.917H0zm16 .917v-.917h-1v.917h1zm-16 .917v.458c0 .166.016.33.048.487l.98-.194A1.51 1.51 0 0 1 1 13.5v-.458H0zm16 .458v-.458h-1v.458c0 .1-.01.199-.029.293l.981.194c.032-.158.048-.32.048-.487zM.421 14.89c.183.272.417.506.69.689l.556-.831a1.51 1.51 0 0 1-.415-.415l-.83.556zm14.469.689c.272-.183.506-.417.689-.69l-.831-.556c-.11.164-.251.305-.415.415l.556.83zm-12.877.373c.158.032.32.048.487.048h.458v-1H2.5c-.1 0-.199-.01-.293-.029l-.194.981zM13.5 16c.166 0 .33-.016.487-.048l-.194-.98A1.51 1.51 0 0 1 13.5 15h-.458v1h.458zm-9.625 0h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zm1.834-1v1h.916v-1h-.916zm1.833 1h.917v-1h-.917v1zm1.833 0h.917v-1h-.917v1zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/></svg>',
      gridPos: { x: 1, y: 0 }
    }, options))
  }

  actionMulti(event, e, elements) {
    if (this.settings.partitionTool && this.settings.partitionTool.addPart) 
      this.settings.partitionTool.addPart(elements);
  }
  
}

class MakeKitApp {
  constructor() {
    this.kbui = KitBuildUI.instance(MakeKitApp.canvasId)
    this.kitMap = null;
    this.conceptMap = null;

    let canvas = this.kbui.canvases.get(MakeKitApp.canvasId)
    canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 })
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, { priority: 5, trash: false })
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { stack: 'right' })

    let partitionTool = new PartitionTool(canvas, this.kitMap, this.conceptMap, { stack: 'left'});
    partitionTool.on('event', this.onToolbarEvent.bind(this));
    this.partitionTool = partitionTool;

    canvas.toolbar.addTool("partition", partitionTool);
    canvas.toolbar.render()
    canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)
    canvas.addCanvasTool(KitBuildCanvasTool.DISCONNECT)
    canvas.addCanvasTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.LOCK)
    canvas.addCanvasMultiTool(KitBuildCanvasTool.UNLOCK)
    canvas.canvasTool.addMultiTool("kitset", new KitSetTool(canvas, {
      partitionTool: partitionTool
    }));

    let textSelectionTool = new KitBuildTextSelectionTool(canvas, {
      element: '#kit-content-dialog .content'
    });
    textSelectionTool.on('event', this.onTextSelectionToolEvent.bind(this));
    canvas.canvasTool.addTool("text-select", textSelectionTool);

    let distanceColorTool = new KitBuildDistanceColorTool(canvas, {});
    distanceColorTool.on('event', this.onDistanceColorToolEvent.bind(this));
    canvas.canvasTool.addTool("distance-color", distanceColorTool);
    canvas.cy.on('drag', 'node', (e) => {
      let node = e.target;
      if (node.data('type') != 'concept') return;
      if (this.conceptMap) {
        distanceColorTool.showColor(node, this.conceptMap, canvas);
      }
    })
    canvas.cy.on('dragfree', (e) => {
      let node = e.target;
      node.removeStyle('border-color border-opacity');
    })

    this.bugTool = new KitBuildBugTool(canvas, {
      dialogContainerSelector: '#admin-content-panel'
    });
    this.bugTool.on('event', this.onBugToolEvent.bind(this));
    canvas.canvasTool.addTool("bug", this.bugTool);

    this.canvas = canvas;
    this.session = Core.instance().session();
    this.ajax = Core.instance().ajax();
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) => $(`#${canvasId} > div`).css('width', 0))
    observer.observe(document.querySelector('#admin-sidebar-panel'), {attributes: true})
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true }) 

    this.handleEvent();
    this.handleRefresh();
  }

  static instance() {
    MakeKitApp.inst = new MakeKitApp();
    return MakeKitApp.inst;
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
      this.setConceptMap(kitMap.conceptMap);
      this.session.set('kid', kitMap.map.kid);
      if (kitMap && kitMap.map && kitMap.map.text) {
        this.ajax.get(`contentApi/getText/${kitMap.map.text}`).then(text => {
          this.contentDialog.setContent(text);
        });
      }
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

  onToolbarEvent(canvas, evt, data) {
    // console.log(canvas, evt, data);
    switch(evt) {
      case 'save-sets': {
        if (!this.kitMap) {
          UI.error('Invalid Kit.').show();
          return;
        }
        if (!this.conceptMap) {
          UI.error('Invalid Concept Map.').show();
          return;
        }
        let order = data.order;
        let partsMap = data.parts;
        let kid = this.kitMap.map.kid;
        let cmid = this.conceptMap.map.cmid;
        let index = 0;
        let sets = [];
        let concepts = [], links = [], sourceEdges = [], targetEdges = [];
        order.forEach(setid => {
          let part = partsMap.get(setid);
          let conceptNodes = Array.from(part.concepts.values());
          let linkNodes = Array.from(part.links.values());
          let edges = Array.from(part.edges.values())
          index++;
          sets.push({
            kid: kid,
            setid: setid,
            order: index
          })
          conceptNodes.forEach(c => {
            concepts.push({
              kid: kid,
              cmid: cmid,
              cid: c.id(),
              set_kid: kid,
              setid: setid
            });
          });
          linkNodes.forEach(l => {
            links.push({
              kid: kid,
              cmid: cmid,
              lid: l.id(),
              set_kid: kid,
              setid: setid
            });
          });
          edges.forEach(e => {
            // console.log(e.data())
            switch(e.data('type')) {
              case 'left':{
                sourceEdges.push({
                  kid: kid,
                  cmid: cmid,
                  lid: e.data('source'),
                  source_cid: e.data('target'),
                  set_kid: kid,
                  setid: setid
                })
              } break;
              case 'right':{
                targetEdges.push({
                  kid: kid,
                  cmid: cmid,
                  lid: e.data('source'),
                  target_cid: e.data('target'),
                  set_kid: kid,
                  setid: setid
                })
              } break;
            }
          });
          // console.warn(concepts, links, sourceEdges, targetEdges);
        });
        // console.log({
        //   kid: kid,
        //   sets: sets,
        //   concepts: concepts,
        //   links: links,
        //   sourceEdges: sourceEdges,
        //   targetEdges: targetEdges
        // });
        this.ajax.post(`kitBuildApi/saveSets`, {
          kid: kid,
          sets: sets,
          concepts: concepts,
          links: links,
          sourceEdges: sourceEdges,
          targetEdges: targetEdges
        }).then(result => {
          UI.success('Kit sets saved successfully.').show();
        }).catch(error => {
          console.error(error);
          UI.dialog('Inconsistent kit data detected. Please save the kit before defining the kit sets.').show();
        });
      } break;
      case 'remove-sets': {
        if (!this.kitMap) {
          UI.error('Invalid Kit.').show();
          return;
        }
        let kid = this.kitMap.map.kid;
        this.ajax.post(`kitBuildApi/removeSets`, {
          kid: kid
        }).then(result => {
          UI.success('Kit sets removed successfully.').show();
        }).catch(error => {
          console.error(error);
          UI.dialog('Error: Unable to remove sets.').show();
        });
      } break;
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
          $('#kit-save-as-dialog .input-title').val('Kit of ' + this.conceptMap.map.title)
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
      width: '750px',
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
        let countfb = $('#kit-option-dialog input[name="countfb"]')
        let countsubmit = $('#kit-option-dialog input[name="countsubmit"]')
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

        if (typeof kitMapOptions.countfb != 'undefined')
        countfb.prop('checked', parseInt(kitMapOptions.countfb) == 1 ? true : false)
        else countfb.prop('checked', true);

        if (typeof kitMapOptions.countsubmit != 'undefined')
        countsubmit.prop('checked', parseInt(kitMapOptions.countsubmit) == 1 ? true : false)
        else countsubmit.prop('checked', true);
  
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
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbackleveldefault.prop('selected', true)
      fullfeedback.prop('checked', true)
      modification.prop('checked', true)
      readcontent.prop('checked', true)
      saveload.prop('checked', true)
      reset.prop('checked', true)
      feedbacksave.prop('checked', true)
      countfb.prop('checked', true);
      countsubmit.prop('checked', true);
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
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbacklevel.val(3).change()
      fullfeedback.prop('checked', true)
      modification.prop('checked', true)
      readcontent.prop('checked', true)
      saveload.prop('checked', true)
      reset.prop('checked', true)
      feedbacksave.prop('checked', true)
      countfb.prop('checked', true);
      countsubmit.prop('checked', true);
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
      let countfb = $('#kit-option-dialog input[name="countfb"]');
      let countsubmit = $('#kit-option-dialog input[name="countsubmit"]');
      let log = $('#kit-option-dialog input[name="log"]')
  
      feedbacklevel.val(0).change()
      fullfeedback.prop('checked', false)
      modification.prop('checked', false)
      readcontent.prop('checked', false)
      saveload.prop('checked', false)
      reset.prop('checked', false)
      feedbacksave.prop('checked', false)
      countfb.prop('checked', false);
      countsubmit.prop('checked', false);
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

    this.contentDialog = UI.modal('#kit-content-dialog', {
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
      onShow: () => {
        let sdown = new showdown.Converter({
          strikethrough: true,
          tables: true,
          simplifiedAutoLink: true
        });
        sdown.setFlavor('github');
        let htmlText = this.contentDialog.text && this.contentDialog.text.content ? 
          sdown.makeHtml(this.contentDialog.text.content) : 
          "<em>Content text unavailable.</em>";
        $('#kit-content-dialog .content').html(htmlText);
        if (typeof hljs != "undefined") hljs.highlightAll();
      }
    });
    this.contentDialog.setContent = (text, type = 'md') => {
      this.contentDialog.text = text;
      return this.contentDialog;
    }

    this.bugDialog = UI.modal('#bug-dialog', {});
    this.bugTool.dialog = this.bugDialog;
  
  
  
  
  
  
  
  
    /** 
     * Open or Create New Kit
     * */
  
    $('.app-navbar .bt-open-kit').on('click', () => {
      openDialog.show()
      let tid = openDialog.tid;
      if (!tid) $('#concept-map-open-dialog .list-topic .list-item.default').trigger('click');
      else $(`#concept-map-open-dialog .list-topic .list-item[data-tid="${tid}"]`).trigger('click');
      $(`#concept-map-open-dialog .bt-refresh-topic-list`).trigger('click');
    })
  
    $('#concept-map-open-dialog .list-topic').on('click', '.list-item', (e) => {
      if (openDialog.tid != $(e.currentTarget).attr('data-tid')) {
        // different concept map?
        openDialog.cmid = null; // reset selected concept map id.
        openDialog.kid = null; // reset selected concept map id.
      }
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
                  $('#concept-map-open-dialog .list-kit').html('');
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
  
      this.ajax.get(`kitBuildApi/getKitListByConceptMap/${openDialog.cmid}`).then(kits => { 
        // console.log(kits)
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
          this.setKitMap(kitMap)
          let cyData = KitBuildUI.composeKitMap(kitMap)
          // console.log(cyData)
          let doOpenKit = () => {
            this.canvas.cy.elements().remove()
            this.canvas.cy.add(cyData)
            this.canvas.applyElementStyle()
            this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit();
            
            let partitionTool = this.canvas.toolbar.tools.get('partition');
            if (partitionTool) partitionTool.partsMap.clear();
            KitBuild.openKitSet(openDialog.kid).then(kitSets => {
              MakeKitApp.buildKitSets(kitSets, this.canvas);
              partitionTool.refreshPartList();
            })
  
  
            openDialog.hide()
          }
          if (this.canvas.cy.elements().length) {
            let confirm = UI.confirm("Open the kit replacing the current kit on Canvas?").positive(() => {
              doOpenKit()
              confirm.hide()
            }).show()
          } else doOpenKit()
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
          this.setKitMap(null)
          this.setConceptMap(conceptMap)
          let cyData = KitBuildUI.composeConceptMap(conceptMap)
          let proceed = () => {
            this.canvas.cy.elements().remove();
            this.canvas.cy.add(cyData);
            this.canvas.applyElementStyle();
            this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit();
            this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
            openDialog.hide();
          }
          if (this.canvas.cy.elements().length) {
            let confirm = UI.confirm("Create a new kit from the selected concept map replacing the current kit design on Canvas?").positive(() => {
              confirm.hide();
              proceed();
            }).show()
          } else proceed();
        } catch (error) { console.error(error)
          UI.error("Unable to open selected concept map as kit.").show(); 
        }
      }).catch((error) => { console.error(error)
        UI.error("Unable to open selected concept map as kit.").show(); 
      })
    });
  
  
  
  
  
  
  
  
  
  
    /**
     * Close Kit
     */
  
     $('.app-navbar .bt-close-kit').on('click', () => { // console.log(MakeKitApp.inst)
      if (!this.kitMap) {
        UI.info("No kit to close.").show()
        return
      }
      let confirm = UI.confirm('Close this kit?').positive(() => {
        this.canvas.cy.elements().remove();
        this.canvas.canvasTool.clearCanvas();
        this.canvas.canvasTool.clearIndicatorCanvas();
        this.partitionTool.clearParts();
        this.setKitMap();
        confirm.hide();
      }).show();
    });
  
  
  
  
  
  
  
    /** 
     * Set Options for Kit
     * */
    
    $('.app-navbar .bt-option').on('click', () => { // console.log(MakeKitApp.inst)
      if (!this.kitMap) {
        UI.info("Please open a kit to set its runtime options.").show()
        return
      } optionDialog.setKitMap(this.kitMap).show()
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
        countfb: $('#kit-option-dialog input[name="countfb"]').prop('checked') ? 1 : 0,
        countsubmit: $('#kit-option-dialog input[name="countsubmit"]').prop('checked') ? 1 : 0,
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
      if (option.countfb) delete option.countfb;
      if (option.countsubmit) delete option.countsubmit;
      if (!option.log) delete option.log
  
      KitBuild.updateKitOption(optionDialog.kitMap.map.kid, 
        $.isEmptyObject(option) ? null : JSON.stringify(option)).then((kitMap) => { // console.log(result);
        this.setKitMap(kitMap)
        UI.success("Kit options applied.").show()
        optionDialog.hide()
      }).catch(error => UI.error(error).show())
    })
  
  
  
  
  
  
  
  
  
  
  
  
    /** 
     * 
     * Content assignment
    */
  
    $('.app-navbar').on('click', '.bt-content', (e) => {
      if (!this.kitMap) {
        UI.error('Please save or open a kit.').show()
        return
      }
      textDialog.setKitMap(this.kitMap).show()
      // KitBuild.openKitMap(this.kitMap.map.kid).then(kitMap => {
      //   this.setKitMap(kitMap)
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
      }).then(kitMap => { // console.log(kitMap)
        this.ajax.get(`contentApi/getText/${kitMap.map.text}`).then(text => {
          let assignedTextHtml = `<span class="text-danger">Text:</span> ${text.title} <span class="badge rounded-pill bg-danger bt-unassign px-3 ms-3" role="button" data-text="${text.tid}" data-kid="${textDialog.kitMap.map.kid}">Unassign</span>`
          $("#assigned-text").html(assignedTextHtml)
          this.contentDialog.setContent(text);
        });
        this.setKitMap(kitMap);
      }).catch(error => console.error(error))
    })
  
    $('#assigned-text').on('click', '.bt-unassign', e => {
      e.preventDefault()
      let kid = $(e.currentTarget).attr('data-kid')
      this.ajax.post(`contentApi/unassignTextFromKitMap`, {
        kid: kid,
      }).then(kitMap => { // console.log(kitMap)
        $("#assigned-text").html('<em class="text-danger px-3">This kit has no text assigned.</em>')
        this.setKitMap(kitMap)
      }).catch(error => console.error(error))
    })








  
    /** 
     * Content
     * */
  
    $('.app-navbar').on('click', '.bt-text', () => { // console.log(RecomposeApp.inst)
      if (!MakeKitApp.inst.kitMap) {
        UI.dialog('Please open a kit to see its content.').show();
        return;
      }
      this.contentDialog.show();
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
     * Save/Save As Kit
     * */
  
    $('.app-navbar .bt-save').on('click', () => { // console.log(MakeKitApp.inst)
      if (!this.kitMap) $('.app-navbar .bt-save-as').trigger('click')
      else saveAsDialog.setKitMap(this.kitMap)
        .setTitle("Save Kit (Update)")
        .setIcon("file-earmark-check")
        .show()
    })
    
    $('.app-navbar .bt-save-as').on('click', () => {
      if (!this.conceptMap) {
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
      if (!this.conceptMap) {
        UI.info('Please open a goalmap.').show()
        return;
      }
      if ($('#input-title').val().trim().length == 0) {
        UI.info('Please provide a name for the kit.').show()
        return;
      }
      // remove visual styles and unselect before saving...
      this.canvas.cy.elements().removeClass('select').unselect();
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
        cmid: this.conceptMap.map.cmid ? this.conceptMap.map.cmid : null,
      }, KitBuildUI.buildConceptMapData(this.canvas)); // console.log(data); // return
      this.ajax.post("kitBuildApi/saveKitMap", { data: Core.compress(data) })
        .then(kitMap => { // console.log(kitMap);
          this.setKitMap(kitMap);
          UI.success("Kit has been saved successfully.").show(); 
          saveAsDialog.hide(); 
        })
        .catch(error => { UI.error(error).show(); })
    })
  
    
  
  
  
  
  
  
  
  
    /** 
     * Kit Edges Modification Tools
     * */ 
  
    $('.app-navbar .bt-toggle-right').on('click', () => {
      if (!this.conceptMap) return
      if (this.canvas.cy.edges('[type="right"]').length)
      this.canvas.cy.edges('[type="right"]').remove();
      else {
        this.conceptMap.linktargets.forEach(linktarget => {
          this.canvas.cy.add({
            group: "edges",
            data: JSON.parse(linktarget.target_data)
          })
        });
      }
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-toggle-left').on('click', () => {
      if (!this.conceptMap) return
      if (this.canvas.cy.edges('[type="left"]').length)
      this.canvas.cy.edges('[type="left"]').remove();
      else {
        this.conceptMap.links.forEach(link => {
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
      if (!this.conceptMap) return
      if (this.canvas.cy.edges().length) this.canvas.cy.edges().remove();
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-restore').on('click', () => {
      if (!this.conceptMap) return
      this.canvas.cy.edges().remove();
      this.conceptMap.links.forEach(link => {
        if (!link.source_cid) return
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(link.source_data)
        })
      });
      this.conceptMap.linktargets.forEach(linktarget => {
        this.canvas.cy.add({
          group: "edges",
          data: JSON.parse(linktarget.target_data)
        })
      });
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
    });
  
    $('.app-navbar .bt-reset').on('click', () => {
      if (!this.conceptMap) return
      let confirm = UI.confirm("Do you want to reset the map to goalmap settings?").positive(() => {
        this.canvas.cy.elements().remove()
        this.canvas.cy.add(KitBuildUI.composeConceptMap(this.conceptMap))
        this.canvas.applyElementStyle()
        this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas()
        confirm.hide()
        UI.info("Kit has been reset to goalmap settings.").show()
      }).show()
    })
  
  }

  onTextSelectionToolEvent(canvasId, event, data, options) {
    // console.log(this, canvasId, event, data, options);
    switch(event) {
      case 'action':
        this.contentDialog.show();
        let element = $('#kit-content-dialog .content').get(0);
        if (data.start && data.end) {
          let textSelectionTool = this.canvas.canvasTool.tools.get("text-select");
          textSelectionTool.restoreSelection(element, {
            start: data.start,
            end: data.end
          });
        }
        break;
      case 'select':
        if (data.node) {
          let node = this.canvas.cy.nodes(`#${data.node.id}`);
          let sel = data.selection;
          if (sel.start == sel.end) {
            node.removeData('selectStart selectEnd');
            UI.error('Text selection has been removed from the selected node.').show();
          } else {
            node.data('selectStart', sel.start);
            node.data('selectEnd', sel.end);
            UI.success('Text selection has been saved to the selected node.').show();
          }
        } 
        break;
    }
  }

  onDistanceColorToolEvent(canvasId, event, data, options) {
    // console.log(canvasId, event, data, options);
    switch(event) {
      case 'action':
        let cid = data.node.id;
        let lids = new Set();
        let cids = new Set();
        cids.add(cid);

        // find connected links
        for(let lt of this.conceptMap.linktargets) {
          if (lt.target_cid == cid) lids.add(lt.lid);
        }
        for(let l of this.conceptMap.links) {
          if (l.source_cid == cid) lids.add(l.lid);
        } 

        // find all concepts connected to the link
        for(let l of this.conceptMap.links) {
          if (lids.has(l.lid)) cids.add(l.source_cid);
        }
        for(let l of this.conceptMap.linktargets) {
          if (lids.has(l.lid)) cids.add(l.target_cid);
        }
        
        // build selection filter
        let filter = ''
        cids.forEach(x => filter += filter ? `,[id="${x}"]`: `[id="${x}"]`);
        let concepts = this.canvas.cy.nodes().filter(filter);

        // select all related concepts.
        setTimeout(() => {
          concepts.select().trigger("select");
          concepts.selectify();
          if (this.canvas.cy.nodes(":selected").length > 1) {
            this.canvas.canvasTool.activeTools = [];
            this.canvas.canvasTool.clearCanvas();
            this.canvas.canvasTool.drawSelectedNodesBoundingBox();
          }
        }, 50);
        break;
    }
  }
  
  onBugToolEvent(canvasId, event, data, options) {
    // console.log(canvasId, event, data, options);
    switch(event) {
      case 'action':
        let node = data.node;
        this.bugDialog.show({width: '300px'});
        $('#bug-dialog .input-correct-label').val(node['correct-label'] ? node['correct-label'] : node['label']);
        $('#bug-dialog .input-bug-label').val(node['bug-label']);
        break;
    }
  }
  
  
  
  
  
  
  
  
  /**
   * 
   * Handle refresh web browser
   */
  
  handleRefresh() {
    this.session.getAll().then(sessions => { // console.log(sessions)
      let cmid = sessions.cmid
      let kid  = sessions.kid
      let promises = []
      if (cmid) promises.push(KitBuild.openConceptMap(cmid));
      if (kid) promises.push(KitBuild.openKitMap(kid));
      if (kid) promises.push(KitBuild.openKitSet(kid));
      Promise.all(promises).then(maps => {
        let [conceptMap, kitMap, kitSet] = maps;
        if (kitMap) {
          this.setKitMap(kitMap) // will also set the concept map
          this.canvas.cy.add(KitBuildUI.composeKitMap(kitMap))
          this.canvas.applyElementStyle()
          this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
          if (kitSet) MakeKitApp.buildKitSets(kitSet, this.canvas);
          return
        }
        if (conceptMap) {
          this.setConceptMap(conceptMap)
          this.canvas.cy.add(KitBuildUI.composeConceptMap(conceptMap))
          this.canvas.applyElementStyle()
          this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA).fit(null, {duration: 0})
          return
        }
      }).catch(error => { console.error(error);
        UI.error("Unable to load kit from session data.<br>Please open a kit manually.").show();
      })
    })
  }

}

MakeKitApp.canvasId = "makekit-canvas"
MakeKitApp.buildKitSets = (kitSet, canvas) => {
  if (kitSet) {
    // console.warn(kitSet);
    let partsMap = new Map();
    kitSet.sets.forEach(set => {
      let setid = parseInt(set.setid);
      let part = {
        id: setid,
        elements: new Map(),
        concepts: new Map(),
        links: new Map(),
        edges: new Map()
      };
      kitSet.concepts.forEach(c => {
        if (parseInt(c.setid) == setid) {
          let el = canvas.cy.elements(`#${c.cid}`);
          part.elements.set(el.id(), el);
          part.concepts.set(el.id(), el);
        }
      });
      kitSet.links.forEach(l => {
        if (parseInt(l.setid) == setid) {
          let el = canvas.cy.elements(`#${l.lid}`);
          part.elements.set(el.id(), el);
          part.links.set(el.id(), el);
        }
      });
      kitSet.sourceEdges.forEach(e => {
        if (parseInt(e.setid) == setid) {
          let el = canvas.cy.elements(`[source="${e.lid}"][target="${e.source_cid}"]`);
          part.elements.set(el.id(), el);
          part.edges.set(el.id(), el);
        }
      });
      kitSet.targetEdges.forEach(e => {
        if (parseInt(e.setid) == setid) {
          let el = canvas.cy.elements(`[source="${e.lid}"][target="${e.target_cid}"]`);
          part.elements.set(el.id(), el);
          part.edges.set(el.id(), el);
        }
      });
      partsMap.set(setid, part);
    });
    // console.warn(partsMap);
    let partitionTool = MakeKitApp.inst.canvas.toolbar.tools.get('partition');
    partitionTool.partsMap = partsMap;
    partitionTool.refreshPartList();

  }
}
