$(() => {
  let app = StaticAnalyzerApp.instance();
});

class CanvasState {}

CanvasState.INIT = "init";
CanvasState.TEACHER = "teacher-map";
CanvasState.STUDENT = "student-map";
CanvasState.COMPARE = "compare-map";
CanvasState.GROUPCOMPARE = "group-compare-map";

class StaticAnalyzerApp {
  constructor() {
    this.kbui = KitBuildUI.instance(StaticAnalyzerApp.canvasId);
    let canvas = this.kbui.canvases.get(StaticAnalyzerApp.canvasId);
    // canvas.addToolbarTool(KitBuildToolbar.UNDO_REDO, { priority: 3 })
    canvas.addCanvasTool(KitBuildCanvasTool.FOCUS, {
      gridPos: { x: 0, y: -1 },
    });
    canvas.addCanvasTool(KitBuildCanvasTool.PROPOSITION);
    canvas.addCanvasTool(KitBuildCanvasTool.PROPAUTHOR);
    canvas.addToolbarTool(KitBuildToolbar.CAMERA, { priority: 4 });
    canvas.addToolbarTool(KitBuildToolbar.UTILITY, {
      priority: 5,
      trash: false,
    });
    canvas.addToolbarTool(KitBuildToolbar.LAYOUT, { priority: 6 });
    canvas.addToolbarTool(KitBuildToolbar.COMPARE, {
      priority: 1,
      stack: "left",
    });
    canvas.canvasTool.enableConnector(false).enableIndicator(false);
    canvas.toolbar.render();
    // canvas.addCanvasTool(KitBuildCanvasTool.CENTROID)
    this.canvas = canvas;
    this.session = Core.instance().session();
    this.ajax = Core.instance().ajax();
    // Hack for sidebar-panel show/hide
    // To auto-resize the canvas.
    let observer = new MutationObserver((mutations) =>
      $(`#${StaticAnalyzerApp.canvasId} > div`).css("width", 0)
    );
    observer.observe(document.querySelector("#admin-sidebar-panel"), {
      attributes: true,
    });
    // Enable tooltip
    $('[data-bs-toggle="tooltip"]').tooltip({ html: true });
    this.handleEvent();
    this.handleRefresh();

    // listen to events of canvas
    this.canvas.on("event", this.onCanvasEvent);
  }

  static instance() {
    StaticAnalyzerApp.inst = new StaticAnalyzerApp();
    // StaticAnalyzerApp.handleEvent(StaticAnalyzerApp.inst.kbui);
    // StaticAnalyzerApp.handleRefresh(StaticAnalyzerApp.inst.kbui);
  }

  setConceptMap(conceptMap) {
    console.warn("CONCEPT MAP SET:", conceptMap);
    this.conceptMap = conceptMap;
    // console.log(this)
    if (conceptMap) {
      this.canvas.direction = conceptMap.map.direction;
      this.session.set("cmid", conceptMap.map.cmid);
      let status =
        `<span class="mx-2 d-flex align-items-center">` +
        `<span class="badge rounded-pill bg-secondary">ID: ${conceptMap.map.cmid}</span>` +
        `<span class="text-secondary ms-2 text-truncate"><small>${conceptMap.map.title}</small></span>` +
        `</span>`;
      StatusBar.instance().content(status);
      StaticAnalyzerApp.canvasState = CanvasState.TEACHER;
    } else {
      StatusBar.instance().content("");
      this.session.unset("cmid");
    }
  }

  handleEvent() {
    let openDialog = UI.modal("#concept-map-open-dialog", {
      hideElement: ".bt-cancel",
    });

    this.propositionDialog = UI.modal("#proposition-dialog", {
      hideElement: ".bt-close",
      draggable: true,
      dragHandle: ".drag-handle",
    });
    this.propositionDialog.propositions = [];
    this.propositionDialog.listProposition = (edgeData, conceptMap) => {
      // console.log(
      //   edgeData,
      //   conceptMap,
      //   this.canvas.cy.edges(`#${edgeData.id}`),
      //   StaticAnalyzerApp.canvasState,
      //   CanvasState.STUDENT
      // );
      let lid = edgeData.source;
      let cid = edgeData.target;
      let edge = this.canvas.cy.edges(`#${edgeData.id}`);
      this.propositionDialog.propositions = [];
      switch (StaticAnalyzerApp.canvasState) {
        case CanvasState.TEACHER:
        case CanvasState.STUDENT: {
          let learnerMap = conceptMap;
          learnerMap.propositions.forEach((p) => { 
            if (p.link.lid == lid) {
              if (edgeData.type == "right" && p.target.cid == cid) {
                this.propositionDialog.propositions.push(p);
              }
              if (edgeData.type == "left" && p.source.cid == cid) {
                this.propositionDialog.propositions.push(p);
              }
            }
          });
          break;
        }
        case CanvasState.COMPARE: {
          let learnerMap = conceptMap;
          let compare = Analyzer.compare(
            learnerMap,
            learnerMap.conceptMap.map.direction
          );
          learnerMap.propositions.forEach((p) => {
            if (p.link.lid == lid) {
              if (
                (edgeData.type == "right" && p.target.cid == cid) ||
                (edgeData.type == "left" && p.source.cid == cid)
              ) {
                compare.match.forEach((m) => {
                  if (
                    m.sid == p.source.cid &&
                    m.lid == p.link.lid &&
                    m.tid == p.target.cid
                  ) {
                    p.type = "match";
                    this.propositionDialog.propositions.push(p);
                  }
                });
                compare.excess.forEach((e) => {
                  if (
                    e.sid == p.source.cid &&
                    e.lid == p.link.lid &&
                    e.tid == p.target.cid
                  ) {
                    p.type = "excess";
                    this.propositionDialog.propositions.push(p);
                  }
                });
              }
            }
          });
          compare.miss.forEach((e) => {
            if (edgeData.type == "right" && (lid != e.lid || !edge.hasClass('miss'))) {
              return;
            }
            this.propositionDialog.propositions.push({
              source: { label: e.source },
              link: { label: e.link },
              target: { label: e.target },
              type: "miss"
            });
          });
          break;
        }
        case CanvasState.GROUPCOMPARE: {
          let lmids = [];
          let learnerMaps = [];
          $('#list-learnermap input[type="checkbox"]:checked').each((i, e) => {
            lmids.push($(e).parents(".learnermap").attr("data-lmid"));
          });
          if (lmids.length == 0) {
            UI.info(
              "Please open a concept map and select at least two student maps from the list"
            ).show();
            return;
          }
          StaticAnalyzerApp.inst.learnerMaps.forEach((lm, k) => {
            if (lmids.includes(k)) learnerMaps.push(lm);
          });
          let edge = this.canvas.cy.edges(`#${edgeData.id}`);
          let link = edge.connectedNodes('[type="link"]');
          let edgeClasses = edge.classes();
          let groupCompare = Analyzer.groupCompare(learnerMaps);
          groupCompare.match.forEach((p) => {
            if (!edgeClasses.includes("match") && edge.data("type") == "right")
              return;
            if (
              p.lid == lid &&
              ((edgeData.type == "right" && p.tid == cid) ||
                (edgeData.type == "left" && p.sid == cid))
            )
              this.propositionDialog.propositions.push({
                source: { label: p.source },
                target: { label: p.target },
                link: { label: p.link },
                type: "match",
                count: p.count,
              });
          });
          groupCompare.miss.forEach((p) => {
            if (!edgeClasses.includes("miss") && edge.data("type") == "right")
              return;
            if ((p.lid == lid || p.link == link.data('label')) && // matching id or link's label 
              ((edgeData.type == "right" && p.tid == cid) ||
                (edgeData.type == "left" && p.sid == cid))
            )
              this.propositionDialog.propositions.push({
                source: { label: p.source },
                target: { label: p.target },
                link: { label: p.link },
                type: "miss",
                count: p.count,
              });
          });
          groupCompare.excess.forEach((p) => {
            if (!edgeClasses.includes("excess") && edge.data("type") == "right")
              return;
            if (
              p.lid == lid &&
              ((edgeData.type == "right" && p.tid == cid) ||
                (edgeData.type == "left" && p.sid == cid))
            )
              this.propositionDialog.propositions.push({
                source: { label: p.source },
                target: { label: p.target },
                link: { label: p.link },
                type: "excess",
                count: p.count,
              });
          });
          break;
        }
      }

      // console.log(lid, cid, this.propositionDialog.propositions);
      let html = "";
      this.propositionDialog.propositions.forEach((p) => {
        html += '<div class="proposition">';
        html += `<span class="source badge rounded-pill bg-warning text-dark mx-2">${p.source.label}</span>`;
        html += "&mdash;";
        html += `<span class="link badge bg-secondary mx-2">${p.link.label}</span>`;
        html += "&mdash;";
        html += `<span class="target badge rounded-pill bg-warning text-dark mx-2">${p.target.label}</span>`;
        if (p.type) {
          let bg = "bg-secondary";
          switch (p.type) {
            case "excess":
              bg = "bg-info text-dark";
              break;
            case "match":
              bg = "bg-success";
              break;
            case "miss":
              bg = "bg-danger";
              break;
          }
          html += `<span class="target badge rounded-pill ${bg} mx-1">${p.type}</span>`;
        }
        if (p.count) {
          html += `<span class="target badge rounded-pill bg-primary mx-1">${p.count}</span>`;
        }
        html += "</div>";
      });
      $("#proposition-dialog .proposition-list").html(html);
    };

    this.propositionAuthorDialog = UI.modal('#proposition-author-dialog', {
      hideElement: ".bt-close",
      draggable: true,
      dragHandle: ".drag-handle",
    })

    /**
     *
     * Open
     */

    $(".app-navbar .bt-open").on("click", (e) => {
      openDialog.show();
      let tid = openDialog.tid;
      if (!tid) {
        $("#concept-map-open-dialog .bt-refresh-topic-list").trigger("click");
        $("#concept-map-open-dialog .list-topic .list-item.default").trigger(
          "click"
        );
      } else
        $(
          `#concept-map-open-dialog .list-topic .list-item[data-tid="${tid}"]`
        ).trigger("click");
    });

    $("#concept-map-open-dialog .list-topic").on("click", ".list-item", (e) => {
      if (openDialog.tid != $(e.currentTarget).attr("data-tid"))
        // different concept map?
        openDialog.cmid = null; // reset selected concept map id.
      openDialog.tid = $(e.currentTarget).attr("data-tid");
      $("#concept-map-open-dialog .list-topic .bi-check-lg").addClass("d-none");
      $("#concept-map-open-dialog .list-topic .list-item").removeClass(
        "active"
      );
      $(e.currentTarget).find(".bi-check-lg").removeClass("d-none");
      $(e.currentTarget).addClass("active");

      this.ajax
        .get(`kitBuildApi/getConceptMapListByTopic/${openDialog.tid}`)
        .then((cmaps) => {
          // console.log(cmaps)
          let cmapsHtml = "";
          cmaps.forEach((cm) => {
            cmapsHtml +=
              `<span class="concept-map list-item" data-cmid="${cm.cmid}" data-cmfid="${cm.cmfid}">` +
              `<span class="text-truncate">${cm.title}</span>` +
              `<bi class="bi bi-check-lg text-primary d-none"></bi></span>`;
          });
          $("#concept-map-open-dialog .list-concept-map").slideUp({
            duration: 100,
            complete: () => {
              $("#concept-map-open-dialog .list-concept-map")
                .html(cmapsHtml)
                .slideDown({
                  duration: 100,
                  complete: () => {
                    if (openDialog.cmid) {
                      $(
                        `#concept-map-open-dialog .list-concept-map .list-item[data-cmid="${openDialog.cmid}"]`
                      )
                        .trigger("click")[0]
                        .scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    } else
                      $("#concept-map-open-dialog .list-concept-map").scrollTop(
                        0
                      );
                  },
                });
            },
          });
        });
    });

    $("#concept-map-open-dialog .list-concept-map").on(
      "click",
      ".list-item",
      (e) => {
        openDialog.cmid = $(e.currentTarget).attr("data-cmid");
        $("#concept-map-open-dialog .list-concept-map .bi-check-lg").addClass(
          "d-none"
        );
        $("#concept-map-open-dialog .list-concept-map .list-item").removeClass(
          "active"
        );
        $(e.currentTarget).find(".bi-check-lg").removeClass("d-none");
        $(e.currentTarget).addClass("active");
      }
    );

    $("#concept-map-open-dialog .bt-refresh-topic-list").on("click", () => {
      this.ajax.get("kitBuildApi/getTopicList").then((topics) => {
        // console.log(topics)
        let topicsHtml = "";
        topics.forEach((t) => {
          // console.log(t);
          topicsHtml +=
            `<span class="topic list-item" data-tid="${t.tid}">` +
            `<em>${t.title}</em>` +
            `<bi class="bi bi-check-lg text-primary d-none"></bi></span>`;
        });
        $("#concept-map-open-dialog .list-topic").slideUp({
          duration: 100,
          complete: () => {
            $("#concept-map-open-dialog .list-topic .list-item")
              .not(".default")
              .remove();
            $("#concept-map-open-dialog .list-topic")
              .append(topicsHtml)
              .slideDown(100);
            $(
              `#concept-map-open-dialog .list-topic .list-item[data-tid="${openDialog.tid}"]`
            ).trigger("click");
          },
        });
      });
    });

    $("#concept-map-open-dialog").on("click", ".bt-open", (e) => {
      e.preventDefault();
      if (!openDialog.cmid) {
        UI.dialog("Please select a concept map.").show();
        return;
      }
      KitBuild.openConceptMap(openDialog.cmid)
        .then((conceptMap) => {
          // console.log(conceptMap)
          let proceed = () => {
            this.setConceptMap(conceptMap);
            StaticAnalyzerApp.populateLearnerMaps(conceptMap.map.cmid);
            StaticAnalyzerApp.populateKits(conceptMap.map.cmid);
            let cyData = KitBuildUI.composeConceptMap(conceptMap);
            this.canvas.cy.elements().remove();
            this.canvas.cy.add(cyData);
            this.canvas.applyElementStyle();
            this.canvas.toolbar.tools
              .get(KitBuildToolbar.CAMERA)
              .fit(null, { duration: 0 });
            this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
            UI.success("Concept map loaded.").show();
            openDialog.hide();
          };
          if (this.canvas.cy.elements().length) {
            let confirm = UI.confirm(
              "Do you want to open and replace current concept map on canvas?"
            )
              .positive(() => {
                confirm.hide();
                proceed();
              })
              .show();
          } else proceed();
        })
        .catch((error) => {
          console.error(error);
          UI.dialog("The concept map data is invalid.", {
            icon: "exclamation-triangle",
            iconStyle: "danger",
          }).show();
        });
    });

    /**
     *
     * Teacher Map
     * */

    $(".app-navbar .bt-teacher-map").on("click", (e) => {
      // console.log(e)
      if (!StaticAnalyzerApp.inst.conceptMap) {
        UI.info("Please open a concept map.").show();
        return;
      }
      let cyData = KitBuildUI.composeConceptMap(
        StaticAnalyzerApp.inst.conceptMap
      );
      this.canvas.cy.elements().remove();
      this.canvas.cy.add(cyData);
      this.canvas.applyElementStyle();
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();

      let camera = this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA);
      if (camera) camera.center(null, { duration: 0 });

      StaticAnalyzerApp.canvasState = CanvasState.TEACHER;
    });

    /**
     *
     * Student Map
     * */

    $(".app-navbar .bt-student-map").on("click", (e) => {
      // console.log(e)
      if (!StaticAnalyzerApp.inst.conceptMap) {
        UI.info("Please open a concept map.").show();
        return;
      }
      let lmid = $("#list-learnermap").find(".active").data("lmid");
      if (!lmid) {
        UI.info(
          "Please select a student concept map from the student concept map list."
        ).show();
        return;
      }
      KitBuild.openLearnerMap(lmid).then((learnerMap) => {
        learnerMap.conceptMap = StaticAnalyzerApp.inst.conceptMap;
        let cyData = KitBuildUI.composeLearnerMap(learnerMap);
        this.canvas.cy.elements().remove();
        this.canvas.cy.add(cyData);
        this.canvas.applyElementStyle();
        this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();

        let camera = this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA);
        if (camera) camera.center(null, { duration: 0 });

        StaticAnalyzerApp.canvasState = CanvasState.STUDENT;
      });
    });

    /**
     *
     * Compare Map
     * */

    $(".app-navbar .bt-compare-map").on("click", (e) => {
      // console.log(e)
      if (!StaticAnalyzerApp.inst.conceptMap) {
        UI.info("Please open a concept map.").show();
        return;
      }
      let lmid = $("#list-learnermap").find(".active").data("lmid");
      if (!lmid) {
        UI.info(
          "Please select a student concept map from the student concept map list."
        ).show();
        return;
      }
      $("#list-learnermap").find(".active").trigger("click");
    });

    /**
     *
     * Learnermap List
     * */

    $("#list-learnermap").on("click", ".learnermap", (e) => {
      let lmid = $(e.currentTarget).data("lmid").toString();
      let learnerMap = StaticAnalyzerApp.inst.learnerMaps.get(lmid);
      $("#list-learnermap .learnermap")
        .removeClass("active")
        .filter(`[data-lmid="${learnerMap.map.lmid}"]`)
        .addClass("active");

      let cyData = KitBuildUI.composeLearnerMap(learnerMap);
      this.canvas.cy.elements().remove();
      this.canvas.cy.add(cyData);
      this.canvas.applyElementStyle();
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
      let camera = this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA);
      if (camera) camera.center(this.canvas.cy.elements(), { duration: 0 });

      Analyzer.composePropositions(learnerMap);
      let compare = Analyzer.compare(
        learnerMap,
        learnerMap.conceptMap.map.direction
      );
      // console.error(compare, this.canvas, learnerMap.conceptMap.map.direction)
      Analyzer.showCompareMap(
        compare,
        this.canvas.cy,
        learnerMap.conceptMap.map.direction,
        Analyzer.MATCH | Analyzer.MISS | Analyzer.EXCESS
      );
      StaticAnalyzerApp.updateStatus(learnerMap, compare);

      this.canvas.canvasTool.tools
        .get(KitBuildCanvasTool.FOCUS)
        .changeState("show");
      this.canvas.toolbar.tools.get(KitBuildToolbar.COMPARE).apply();
      this.session.set({ lmid: learnerMap.map.lmid });

      StaticAnalyzerApp.canvasState = CanvasState.COMPARE;
    });

    $("#cb-lm-score").on("change", (e) => {
      if ($("#cb-lm-score").prop("checked"))
        $("#list-learnermap .score").removeClass("d-none");
      else $("#list-learnermap .score").addClass("d-none");
    });

    $("#cb-lm-feedback").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-draft").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-fix").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-first").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-last").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-auto").on("change", StaticAnalyzerApp.onCheckBoxChanged);
    $("#cb-lm-all").on("change", StaticAnalyzerApp.onCheckBoxChanged);

    /**
     *
     * Kit List
     * */

    $('#select-kid').on('change', (e) => {
      let index = $(e.currentTarget).prop('selectedIndex');
      let kid = $(e.currentTarget).val();
      $('#list-learnermap .learnermap').each((i, e) => {
        $(e).find('.cb-learnermap').prop('checked', false);
        switch(index) {
          case 0: $(e).removeClass('d-none'); break;
          default: 
            if ($(e).data('kid') == kid) $(e).removeClass('d-none');
            else $(e).addClass('d-none');
        }
      });
      StaticAnalyzerApp.onCheckBoxChanged();
    });

    $("#group-map-tools").on("click", ".bt-group-map", (e) => {
      let lmids = [];
      $('#list-learnermap input[type="checkbox"]:checked').each((i, e) => {
        lmids.push($(e).parents(".learnermap").attr("data-lmid"));
      });
      if (
        !StaticAnalyzerApp.inst.learnerMaps ||
        StaticAnalyzerApp.inst.learnerMaps.size == 0 ||
        lmids.length == 0
      ) {
        UI.info(
          "Please open a concept map and select at least two student maps from the list"
        ).show();
        return;
      }

      let cyData = KitBuildUI.composeConceptMap(
        StaticAnalyzerApp.inst.conceptMap
      );
      this.canvas.cy.elements().remove();
      this.canvas.cy.add(cyData);
      this.canvas.applyElementStyle();
      this.canvas.canvasTool.clearCanvas().clearIndicatorCanvas();
      this.canvas.canvasTool.tools
        .get(KitBuildCanvasTool.FOCUS)
        .changeState("show");

      let learnerMaps = [];
      StaticAnalyzerApp.inst.learnerMaps.forEach((lm, k) => {
        if (lmids.includes(k)) learnerMaps.push(lm);
      });

      let groupCompare = Analyzer.groupCompare(learnerMaps);
      let mapData = Analyzer.showGroupCompareMap(groupCompare, this.canvas.cy);
      this.canvas.toolbar.tools.get("compare").apply();

      $("#group-min-val")
        .attr("max", mapData.max)
        .attr("min", mapData.min)
        .val(mapData.min);
      $("#group-max-val")
        .attr("max", mapData.max)
        .attr("min", mapData.min)
        .val(mapData.max);
      $("#group-min-val-label").html(mapData.min);
      $("#group-max-val-label").html(mapData.max);
      $("#min-max-range").html(
        `${$("#group-min-val").val()} ~ ${$("#group-max-val").val()}`
      );

      StaticAnalyzerApp.updateStatus(null, groupCompare);
      this.canvas.toolbar.tools
        .get(KitBuildToolbar.CAMERA)
        .center(null, { duration: 0 });
      StaticAnalyzerApp.canvasState = CanvasState.GROUPCOMPARE;
    });

    $("#group-min-val").on("change", (e) => {
      let val = $("#group-min-val").val();
      let maxVal = $("#group-max-val").val();
      if (val > maxVal) $("#group-min-val").val(maxVal);
      this.updateRangeInformation();
    });

    $("#group-max-val").on("change", (e) => {
      let val = $("#group-max-val").val();
      let minVal = $("#group-min-val").val();
      if (val < minVal) $("#group-max-val").val(minVal);
      this.updateRangeInformation();
    });

    this.canvas.cy.on("tap", "edge", (e) => {
      if (e.target.hasClass && e.target.hasClass("count")) {
        // console.error("COUNT", e.target.data("count"));
      }
    });
  }

  handleRefresh() {
    let session = Core.instance().session();
    let canvas = this.kbui.canvases.get(StaticAnalyzerApp.canvasId);
    session.getAll().then((sessions) => {
      // console.log(sessions)
      let cmid = sessions.cmid;
      let lmid = sessions.lmid;
      if (cmid) {
        KitBuild.openConceptMap(cmid).then((conceptMap) => {
          canvas.direction = conceptMap.map.direction;
          canvas.cy.elements().remove();
          canvas.cy.add(KitBuildUI.composeConceptMap(conceptMap));
          canvas.applyElementStyle();
          let camera = this.canvas.toolbar.tools.get(KitBuildToolbar.CAMERA);
          if (camera) camera.fit(null, { duration: 0 });
          this.setConceptMap(conceptMap);
          StaticAnalyzerApp.populateLearnerMaps(cmid).then(() => {
            if (lmid) {
              let row = $("#list-learnermap")
                .find(`.learnermap[data-lmid="${lmid}"]`)
                .trigger("click");
              if (row.length) row[0].scrollIntoView({ block: "center" });
            }
          });
          StaticAnalyzerApp.populateKits(cmid);
        });
      }
    });
  }

  updateRangeInformation() {
    $("#min-max-range").html(
      `${$("#group-min-val").val()} ~ ${$("#group-max-val").val()}`
    );
    let min = $("#group-min-val").val();
    let max = $("#group-max-val").val();
    this.canvas.cy
      .edges(`[count < ${min}],[count > ${max}]`)
      .not('[type="left"]')
      .addClass("hide");
    this.canvas.cy
      .edges(`[count >= ${min}][count <= ${max}]`)
      .removeClass("hide");
  }

  // callback of canvas event
  onCanvasEvent(canvasId, event, data) {
    // console.log("command", event, canvasId, data);
    switch (event) {
      case "proposition-edge-tool-clicked":
        // console.warn(StaticAnalyzerApp.canvasState);
        let conceptMap = StaticAnalyzerApp.inst.conceptMap;
        switch (StaticAnalyzerApp.canvasState) {
          case CanvasState.STUDENT:
          case CanvasState.COMPARE:
          case CanvasState.GROUPCOMPARE: {
            let lmid = $("#list-learnermap").find(".active").data("lmid");
            if (!lmid) break;
            conceptMap = StaticAnalyzerApp.inst.learnerMaps.get(
              lmid.toString()
            );
            break;
          }
        }
        StaticAnalyzerApp.inst.propositionDialog.listProposition(
          data,
          conceptMap
        );
        StaticAnalyzerApp.inst.propositionDialog.show();
        break;
      case "proposition-author-tool-clicked":
        if (!data) return;
        if (StaticAnalyzerApp.canvasState != CanvasState.GROUPCOMPARE) {
          UI.info("This feature only works with group maps.").show();
          return;
        }
        // console.log(data, StaticAnalyzerApp.inst);
        let edge = StaticAnalyzerApp.inst.canvas.cy.edges(`#${data.id}`);
        let learnerMaps = [];
        let lmids = [];
        $('#list-learnermap input[type="checkbox"]:checked').each((i, e) => {
          lmids.push($(e).parents(".learnermap").attr("data-lmid"));
        });
        StaticAnalyzerApp.inst.learnerMaps.forEach((lm, i) => {
          if (lmids.includes(i)) learnerMaps.push(lm);
        });
        let groupCompare = Analyzer.groupCompare(learnerMaps);
        let ctype = edge ? edge.data('ctype') : null;
        if (!ctype) return;

        let link = edge.connectedNodes('[type="link"]');
        // let concept = edge.connectedNodes('[type="concept"]');
                
        let gcType = groupCompare[ctype];
        let gclmids = [];
        
        gcType.forEach(gc => {
          // check matching id's
          if (gc.lid == edge.data('source') && gc.tid == edge.data('target')) {
            gclmids = gc.lmids;
            return;
          } else if (gc.link == link.data('label') && gc.tid == edge.data('target')) {
            // if student uses different link node (of same name) than expected
            gclmids = gc.lmids;
            return;
          }
        });

        let authorsMap = [];
        learnerMaps.forEach(lm => {
          if (gclmids.includes(lm.map.lmid)) authorsMap.push(lm.map);
        });
        let authorList = "";
        authorsMap.forEach(map => {
          authorList += `<div class="p-1">`;
          authorList += `<span class="pe-2">${map.authorname}</span>`;
          switch(map.type) {
            case 'feedback':
              authorList += `<span class="badge bg-warning text-dark ms-1" title="Feedback: ${map.create_time}">Fb</span>`;
              break;
            case 'draft':
              authorList += `<span class="badge bg-secondary ms-1" title="Draft: ${map.create_time}">D</span>`;
              break;
            case 'fix':
              authorList += `<span class="badge bg-primary ms-1" title="Submitted: ${map.create_time}">S</span>`;
              break;
            case 'auto':
              authorList += `<span class="badge bg-secondary ms-1" title="Autosaved: ${map.create_time}">A</span>`;
              break;
          }
          authorList += `<span class="badge bg-warning text-dark ms-1">Map ID: ${map.lmid}</span>`;
          authorList += `</div>`;
          });
        $('#proposition-author-dialog .author-list').html(authorsMap.length == 0 ? '<div><em>No author</em></div>' : authorList);
        StaticAnalyzerApp.inst.propositionAuthorDialog.show();
        break;
    }
  }
}

StaticAnalyzerApp.canvasId = "analyzer-canvas";
StaticAnalyzerApp.canvasState = CanvasState.INIT;

StaticAnalyzerApp.populateLearnerMaps = (cmid, kid = null, type = null) => {
  return new Promise((resolve, reject) => {
    $("#list-learnermap").html('<span class="p-2 mt-2 d-block text-center text-primary">Loading...</span>');
    Core.instance()
      .ajax()
      .get(`analyzerApi/getLearnerMapsOfConceptMap/${cmid}${kid ? "/" + kid : ""}`)
      .then((learnerMaps) => {
        learnerMaps = Core.decompress(learnerMaps);
        let list = "";
        StaticAnalyzerApp.inst.learnerMaps = new Map(
          learnerMaps.map((obj) => [obj.map.lmid, obj])
        );

        learnerMaps.map((learnerMap) => {
          learnerMap.conceptMap = StaticAnalyzerApp.inst.conceptMap;
          Analyzer.composePropositions(learnerMap);
          let direction = learnerMap.conceptMap.map.direction;
          learnerMap.compare = Analyzer.compare(learnerMap, direction);
        });

        let fbSet = new Set();
        let dSet  = new Set();
        let fxSet = new Set();
        let aSet  = new Set();

        let fbLastMap = new Map();
        let dLastMap = new Map();
        let fxLastMap = new Map();
        let aLastMap = new Map();

        learnerMaps.forEach((lm, i) => {
          let isFirst =
            i == 0 || (i > 0 && learnerMaps[i - 1].map.author != lm.map.author);
          let isLast =
            (learnerMaps[i + 1] &&
              learnerMaps[i + 1].map.author != lm.map.author) ||
            !learnerMaps[i + 1];
          let isTFirst = false;
          let isTLast = false;
          switch (lm.map.type) {
            case "feedback": 
              isTFirst = fbSet.has(lm.map.author) ? false : true; 
              if (!fbSet.has(lm.map.author)) fbSet.add(lm.map.author);
              fbLastMap.set(lm.map.author, lm.map.lmid);
              break;
            case "draft": 
              isTFirst = dSet.has(lm.map.author) ? false : true; 
              if (!dSet.has(lm.map.author)) dSet.add(lm.map.author);
              dLastMap.set(lm.map.author, lm.map.lmid);
              break;
            case "fix": 
              isTFirst = fxSet.has(lm.map.author) ? false : true; 
              if (!fxSet.has(lm.map.author)) fxSet.add(lm.map.author);
              fxLastMap.set(lm.map.author, lm.map.lmid);
              break;
            case "auto": 
              isTFirst = aSet.has(lm.map.author) ? false : true; 
              if (!aSet.has(lm.map.author)) aSet.add(lm.map.author);
              aLastMap.set(lm.map.author, lm.map.lmid);
              break;
          }

          let score = ((lm.compare.score * 1000) | 0) / 10 + "%";
          list += `<div data-lmid="${lm.map.lmid}" data-type="${lm.map.type}" data-kid="${lm.map.kid}" data-first="${isFirst}" data-last="${isLast}"`;
          list += ` data-tfirst="${isTFirst}" data-tlast="${isTLast}"`
          list += ` class="py-1 mx-1 d-flex justify-content-between border-bottom learnermap list-item fs-6" role="button">`;
          list += `<span class="d-flex align-items-center">`;
          list += `<input type="checkbox" class="cb-learnermap" id="cb-lm-${lm.map.lmid}">`;
          list += `<label class="text-truncate ms-1" title="Author: ${lm.map.author}; Map ID: ${lm.map.lmid}"><small>${lm.map.authorname}</small></label>`;
          list += `</span>`;
          list += `<span class="d-flex align-items-center">`;
          if (lm.map.type == "feedback")
            list += `<span class="badge bg-warning text-dark ms-1" title="Feedback: ${lm.map.create_time}">Fb</span>`;
          if (lm.map.type == "draft")
            list += `<span class="badge bg-secondary ms-1" title="Draft: ${lm.map.create_time}">D</span>`;
          if (lm.map.type == "fix")
            list += `<span class="badge bg-primary ms-1" title="Submitted: ${lm.map.create_time}">S</span>`;
          if (lm.map.type == "auto")
            list += `<span class="badge bg-secondary ms-1" title="Autosaved: ${lm.map.create_time}">A</span>`;
          if (isFirst)
            list += `<span class="badge bg-secondary ms-1" title="First map: ${lm.map.create_time}">1</span>`;
          if (isLast)
            list += `<span class="badge bg-info text-dark ms-1" title="Last map: ${lm.map.create_time}">L</span>`;
          list += `<span class="ms-2 score d-none"><small>${score}</small></span>`;
          list += `</span>`;
          list += `</div>`;
        });

        // display the list        
        $("#list-learnermap").html(
          list == ""
            ? '<em class="text-secondary p-2 d-block">No learnermaps.</em>'
            : list
        );

        fbLastMap.forEach((lmid) => $(`#list-learnermap .learnermap[data-lmid="${lmid}"]`).attr('data-tlast', true));
        fxLastMap.forEach((lmid) => $(`#list-learnermap .learnermap[data-lmid="${lmid}"]`).attr('data-tlast', true));
        dLastMap.forEach((lmid) => $(`#list-learnermap .learnermap[data-lmid="${lmid}"]`).attr('data-tlast', true));
        aLastMap.forEach((lmid) => $(`#list-learnermap .learnermap[data-lmid="${lmid}"]`).attr('data-tlast', true));

        StaticAnalyzerApp.onCheckBoxChanged();
        resolve();
      });
  }).catch((error) => reject(error));
};

StaticAnalyzerApp.populateKits = (cmid) => {
  Core.instance()
    .ajax()
    .get(`kitBuildApi/getKitListByConceptMap/${cmid}`)
    .then((kits) => {
      // console.log(kits)
      $("#select-kid option").not(".default").remove();
      kits.forEach((k, i) => {
        let kit = `<option value=${k.kid}>`;
        kit += `${k.name}`;
        kit += `</option>`;
        $("#select-kid").append(kit);
      });
    });
};

StaticAnalyzerApp.onCheckBoxChanged = (e) => {
  $("#list-learnermap .learnermap").each((i, lm) => {
    let lmid = $(lm).data("lmid");
    let type = $(lm).data("type");
    // let first = $(lm).data("first") == true;
    // let last = $(lm).data("last") == true;
    let first = $(lm).data("tfirst") == true;
    let last = $(lm).data("tlast") == true;
    let checked = $(`#cb-lm-${type}`).prop("checked");
    // if (!checked) checked = first == $(`#cb-lm-first`).prop("checked") && first;
    // if (!checked) checked = last == $(`#cb-lm-last`).prop("checked") && last;
    // if (!checked) checked = $(`#cb-lm-all`).prop("checked");
    if (checked) {
      let f = $(`#cb-lm-first`).prop("checked") && first;
      let l = $(`#cb-lm-last`).prop("checked") && last;
      let a = $(`#cb-lm-all`).prop("checked");
      checked = (f || l || a);
    }

    checked = $(lm).hasClass("d-none") ? false : checked;
    $(`#cb-lm-${lmid}`).prop("checked", checked);
  });
};

StaticAnalyzerApp.updateStatus = (learnerMap, compare) => {
  if (learnerMap) {
    let statusLearnerMap =
      `<span class="mx-2 d-flex align-items-center status-learnermap">` +
      `<span class="badge rounded-pill bg-warning text-dark ms-1">ID: ${learnerMap.map.lmid}</span> ` +
      `<small class="text-secondary text-truncate mx-2">${learnerMap.map.author}</small>` +
      `</span>`;
    StatusBar.instance().remove(".status-learnermap").append(statusLearnerMap);
  } else StatusBar.instance().remove(".status-learnermap");

  if (compare) {
    let statusCompare =
      `<span class="mx-2 d-flex align-items-center status-compare">` +
      `<span class="badge rounded-pill bg-success ms-1">Match: ${compare.match.length}</span>` +
      `<span class="badge rounded-pill bg-danger ms-1">Miss: ${compare.miss.length}</span>` +
      `<span class="badge rounded-pill bg-info text-dark ms-1">Excess: ${compare.excess.length}</span>` +
      `<span class="badge rounded-pill bg-secondary ms-1">Leave: ${compare.leave.length}</span>` +
      `<span class="badge rounded-pill bg-warning text-dark ms-1">Abandon: ${compare.abandon.length}</span>` +
      `</span>`;
    StatusBar.instance().remove(".status-compare").append(statusCompare);
  } else StatusBar.instance().remove(".status-compare");
};

// StaticAnalyzerApp.
