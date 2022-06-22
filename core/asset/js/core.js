class Core {

  constructor(options = {}) {
    let def = {}
    this.settings = Object.assign({}, def, options);
    Core.configuration = new Map();

    // read client configuration, set from the HTML meta header
    let configJson = atob($('#core-client-config').data('core'));
    let cfgs = JSON.parse(configJson);
    $.each(cfgs, (k, v) => Core.configuration.set(k, v));
    $.each($('#core-client-config').data(), 
    (k, v) => {
      if (k === "core") return
      Core.configuration.set(k.toLowerCase(), v)
    });
    // console.log(Core.configuration)
  }

  static instance(options) {
    if (!Core.inst) Core.inst = new Core(options);
    else if (options)
      Core.inst.settings = Object.assign(Core.inst.settings, options);
    return Core.inst;
  }

  ajax(options) {
    Core.ajax = Ajax.instance(
      Object.assign({ baseUrl: Core.instance().config("baseurl") }, options)
    );
    return Core.ajax;
  }

  session(options) {
    Core.session = Session.instance(
      Object.assign({ baseUrl: Core.instance().config("baseurl") }, options)
    );
    return Core.session;
  }

  language(options) {
    Core.language = Language.instance(options);
    return Core.language;
  }

  runtime(path, options) {
    Core.runtime = Runtime.instance(path, options);
    return Core.runtime;
  }

  config(key) {
    if (key) return Core.configuration.get(key);
    return Core.configuration;
  }

  /** 
   * Shorthand methods
  */

  /**
   * Getting a language entry by key
   */
  static l(key, ...args) {
    return Core.instance().language().get(key, ...args)
  }


}