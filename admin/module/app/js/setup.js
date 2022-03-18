$(() => {

  class SetupApp {

    constructor() {
      this.ajax = Core.instance().ajax();
      this.handleEvent();
      let { dbConfig, config } = this.readConfig();
      this.config = config;
    }

    readConfig() {
      let compressedDbConfig = Core.inst.config().get('dbconfig');
      let dbConfig = JSON.parse(Core.decompress(compressedDbConfig));
      let key = $('#select-config-key').val();
      let config = dbConfig[key];
      this.readServerInfo(key);
      this.ajax.get(`m/x/app/setupApi/checkDB/${key}`).then(result => {
        if (parseInt(result) == 0) {
          $('#config-status').addClass('alert-success').removeClass('alert-danger').html('Selected database is empty and ready to setup.');
          $('button.bt-setup').attr('disabled', false)
          return;
        }
        $('#config-status').addClass('alert-danger').removeClass('alert-success').html(`Selected database is NOT EMPTY, it has ${result} tables. <span class="bt-check-again btn btn-sm btn-primary m-2">Check Again</span>`);
        $('button.bt-setup').attr('disabled', true);
        UI.error(`Selected database is NOT EMPTY, it has ${result} tables.`).show();
      }).catch(error => {
        console.error(error);
        let err = `The configuration <code>${key}</code> is invalid. <br>${error}`;
        UI.error(err).show();
        $('#config-status').addClass('alert-danger').removeClass('alert-success').html(err);
        $('button.bt-setup').attr('disabled', true)
      }).finally(() => {
        SetupApp.displayDbConfig(config);
      })

      return { dbConfig, config };
    }

    readServerInfo(key) {
      this.ajax.get(`m/x/app/setupApi/getServerInfo/${key}`)
        .then(result => {
          $('#server-info').html(`MySQL version: ${result}`);
        })
        .catch(error => {
          $('#server-info').html(error);
        })
        .finally(() => {

        });
    }

    handleEvent() {
      $('#select-config-key').on('change', (e) => {
        this.readConfig();
      })
      $('button.bt-setup').on('click', (e) => {
        let key = $('#select-config-key').val();
        let confirm = UI.confirm("Begin setup to the selected database?").positive(() => {
          $(e.currentTarget).html(`Setting up... ${UI.spinner()}`).attr('disabled', true);
          this.ajax.get(`m/x/app/setupApi/doSetup/${key}`).then(result => {
            if(result == true) {
              UI.success("Database has been successfully set up.").show();
              $('#config-status').html("Database has been successfully set up.")
            } else UI.warning(result).show();
          })
          .catch(error => UI.error(error).show())
          .finally(() => {
            $(e.currentTarget).html('Begin Database Setup');
          })
          confirm.hide();
        }).show();
      });
      $('#config-status').on('click', '.bt-check-again', () => {
        $('#select-config-key').trigger('change');
      });
      $('button.bt-setup-init-data').on('click', (e) => {
        let key = $('#select-config-key').val();
        let label = $(e.currentTarget).html();
        let confirm = UI.confirm("Begin setup inital authorization data to the selected database?").positive(() => {
          $(e.currentTarget).html(`Setting up... ${UI.spinner()}`).attr('disabled', true);
          this.ajax.post(`m/x/app/setupApi/doSetupInitData`, {
            db: key
          }).then(result => {
            if(result == true) {
              UI.success("Initial data has been setup successfully.").show();
              $('#config-status-init-data').html("Initial data has been setup successfully.")
            } else UI.warning(result).show();
          })
          .catch(error => UI.error(error).show())
          .finally(() => {
            $(e.currentTarget).html(label).attr('disabled', false);
          })
          confirm.hide();
        }).show();
      });
    }

    static instance() {
      return new SetupApp();
    }

    static displayDbConfig(config) {
      let configContent = '<table class="table table-sm">';
      for(let attr in config) {
        if (attr == "password") config[attr] = "***"
        configContent += `<tr><td>${attr}</td><td><code>${config[attr] === "1" ? "TRUE" : (config[attr] === "" ? "FALSE" : config[attr])}</code></td></tr>`
      }
      configContent += '</table>';
      $('#config-content').html(configContent);
    }
  }

  SetupApp.instance();



});