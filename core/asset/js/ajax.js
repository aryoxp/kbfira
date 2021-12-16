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