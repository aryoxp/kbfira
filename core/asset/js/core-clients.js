class Ajax {
  constructor(options = {}) {
    this.def = {
      method: "get",
      delay: 10000,
      useDefaultRejection: true,
      holdError: false,
      timeout: 30000,
      compressed: false,
      baseUrl: "",
    };
    this.settings = Object.assign(this.def, options);
    this.response = null;
    
    this._rejectHandled = false;
  }

  static instance(options) {
    return new Ajax(options);
  }

  defaultReject(error) {
    if (!this._rejectHandled) console.error(`Ajax Error: ${error}`);
  }

  get(url, data, options) {
    this.send("get", url, data, options);
    return this;
  }

  post(url, data, options) {
    this.send("post", url, data, options);
    return this;
  }

  send(method, url, data, options) {    
    let requestSettings = Object.assign({}, this.settings, options);
    this._rejectHandled = false;
    if (requestSettings.baseUrl.trim().substr(-1) != "/")
      requestSettings.baseUrl += "/";
    let requestUrl = url.toLowerCase().startsWith("http") ?
      url :
      requestSettings.baseUrl + url;
    this.requestPromise = new Promise((resolve, reject) => {
      $.ajax({
          url: requestUrl,
          method: method,
          data: data,
          timeout: requestSettings.timeout,
        })
        .done((response) => {
          this.response = response;
          if (response === null) {
            resolve(null);
            return;
          }
          if (!response.coreStatus) {
            if (response.coreError) reject(response.coreError);
            else resolve(response);
          } else {
            if (requestSettings.compressed) {
              const charData = atob(response.coreResult)
                .split("")
                .map((x) => {
                  return x.charCodeAt(0);
                });
              const inflated = JSON.parse(
                pako.inflate(new Uint8Array(charData), {
                  to: "string",
                })
              );
              resolve(inflated);
            } else resolve(response.coreResult);
          }
          return;
        })
        .fail((response) => {
          this.response = response;
          if (!response.coreStatus && response.coreError) reject(response.coreError);
          else reject(response.responseText);
        });
    });

    this.requestPromise.catch(this.defaultReject.bind(this));
    return this;
  }

  then(onResolve, onReject) {
    this.requestPromise.then(onResolve, onReject ? onReject : () => {});
    return this;
  }

  catch (onReject) {
    this._rejectHandled = (typeof onReject == 'function')
    this.requestPromise.catch(onReject)
    return this;
  } finally(onFinally) {
    this.requestPromise.finally(onFinally);
    return this;
  }

}


class Session {
  constructor(options) {
    let def = { baseUrl: "/" };
    this.settings = Object.assign(def, options);
    this.baseUrl = this.settings.baseUrl;
    this.sessionData = null;
  }

  static instance(options) {
    if (!Session.inst) Session.inst = new Session(options);
    else if (options)
      Session.inst.settings = Object.assign(Session.inst.settings, options);
    return Session.inst;
  }

  cookie() {
    return document.cookie;
  }

  set(sessionKeyOrObject, sessionData = null) {
    let sessData =
      typeof sessionKeyOrObject === "object" &&
      !Array.isArray(sessionKeyOrObject) &&
      sessionKeyOrObject !== null
        ? sessionKeyOrObject
        : {
            key: sessionKeyOrObject,
            data: sessionData,
          };
    return new Promise((resolve, reject) => {
      Core.instance()
        .ajax()
        .post("coreSession/set", sessData)
        .then(resolve)
        .catch(reject);
    });
  }

  unset(sessionKey = null) {
    return new Promise((resolve, reject) => {
      if (sessionKey === null) reject("Session key is null");
      Core.instance()
        .ajax()
        .post("coreSession/unset", {
          key: sessionKey,
        })
        .then(resolve)
        .catch(reject);
    });
  }

  get(sessionKey = null) {
    return new Promise((resolve, reject) => {
      Core.instance()
        .ajax()
        .post("coreSession/get", 
          sessionKey ? { key: sessionKey } : null)
        .then(resolve)
        .catch(reject);
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.get()
        .then(sessData => {
          this.sessionData = sessData;
          resolve(sessData);
        })
        .catch(reject);
    });
  }

  destroy() {
    return new Promise((resolve, reject) => {
      Core.instance()
        .ajax()
        .post("coreSession/destroy")
        .then(resolve)
        .catch(reject);
    });
  }
}

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

  config(key) {
    if (key) return Core.configuration.get(key);
    return Core.configuration;
  }

  /** 
   * Shorthand methods and utilities
  */

  /**
   * Getting a language entry by key
   */
  static l(key, ...args) {
    return Core.instance().language().get(key, ...args)
  }

  static compress(data) { // encoded to base64 encoding
    return btoa(String.fromCharCode.apply(null, pako.gzip(JSON.stringify(data), {to: 'string'})))
  }

  static decompress(data) { // decoded from base64 encoding
    return JSON.parse(pako.ungzip(new Uint8Array(atob(data).split('').map(c => { 
      return c.charCodeAt(0); 
    })), {to: 'string'}))
  }


}