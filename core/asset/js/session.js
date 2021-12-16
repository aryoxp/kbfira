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
            key: sessionKey,
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

  get(sessionKey) {
    return new Promise((resolve, reject) => {
      Core.instance()
        .ajax()
        .post("coreSession/get", {
          key: sessionKey,
        })
        .then(resolve)
        .catch(reject);
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.get(null)
        .then(sessData => {
          this.sessionData = sessData;
          resolve(sessData);
        })
        .catch(reject);
    });
  }

  destroy(callback = null, errorCallback = null) {
    return new Promise((resolve, reject) => {
      Core.instance()
        .ajax()
        .post("coreSession/destroy")
        .then(resolve)
        .catch(reject);
    });
  }
}
