class SettingsApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    this.runtime = Core.instance().runtime();
    this.config = Core.instance().config();
    // console.log(this.config);
    this.handleEvent();
    this.handleRefresh();
  }

  handleEvent() {
    $('.bt-reload-runtime').on('click', (e) => {
      let file = $("#input-kitbuild-app-runtime-path").val();
      this.runtime.load(file, {
        location: Runtime.PATH_ROOT
      }).then(runtimes => {
        // console.log(runtimes);
        for (let [key, value] of Object.entries(runtimes)) {
          // console.log(`${key}: ${value}`);
          $(`#input-${key}`).val(value);
        }
      }, err => {
        UI.error(err).show();
      });
    });
    $(".bt-save-runtime").on("click", (e) => {
      let id = $(e.currentTarget).siblings().attr("id");
      let key = id.replace(/^input-/i, "");
      let value = $(e.currentTarget).siblings().val();
      // console.log(key, value);
      this.runtime
        .save(key, value, "config.ini", {
          location: Runtime.PATH_MODULE,
          module: this.config.get("module"),
        })
        .then(
          (runtimes) => {
            UI.success("Runtime config has been saved successfully.").show();
            // console.log(runtimes);
          },
          (err) => UI.error(err).show()
        );
    });
    $(".bt-save-app-runtime").on("click", (e) => {
      let file = $("#input-kitbuild-app-runtime-path").val();
      let id = $(e.currentTarget).siblings().attr("id");
      let key = id.replace(/^input-/i, "");
      let value = $(e.currentTarget).siblings().val();
      // console.log(key, value, file);
      this.runtime
        .save(key, value, file, {
          location: Runtime.PATH_ROOT
        })
        .then(
          (runtimes) => {
            UI.success("Runtime config has been saved successfully.").show();
            // console.log(runtimes);
          },
          (err) => UI.error(err).show()
        );
    });
  }

  handleRefresh() {
    $('.bt-reload-runtime').trigger('click');
  }
}

$(() => {
  new SettingsApp();
});
