class Runtime {

  constructor(path, options) {
    this.path = path;
    this.settings = Object.assign({}, options);
    this.ajax = Core.instance().ajax();
  }

  static instance(path, options) {
    return new Runtime(path, options);
  }

  load(file, options) {
    return new Promise((resolve, reject) => {
      let data = {
        location: Runtime.PATH_APP
      };
      if (file) Object.assign(data, {file: file});
      if (options) Object.assign(data, options);
      // console.log(data);
      this.ajax.post('coreRuntime/load', data).then(runtimes => {
        resolve(runtimes);
      }, (err) => reject(err));
    })
  }

  read(key) {
    if (key === undefined) return null;
  }

  save(key, value, file, options) {
    return new Promise((resolve, reject) => {
      let data = {
        location: Runtime.PATH_APP,
        key: key,
        value: value
      };
      if (file) Object.assign(data, {file: file});
      if (options) Object.assign(data, options);
      // console.log(data);
      this.ajax.post('coreRuntime/set', data).then(runtimes => {
        resolve(runtimes);
      }, (err) => reject(err));
    })
  }

}

Runtime.PATH_ROOT   = 'root';
Runtime.PATH_SHARED = 'shared';
Runtime.PATH_APP    = 'app';
Runtime.PATH_MODULE = 'module';