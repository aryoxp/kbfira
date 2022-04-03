class Language {

  constructor(options) {
    this.text = null; // for formatting purposes
    this.settings = options;
    this.lang = {}; // entries holder
  }

  static instance(options) { 
    if (!Language.inst) {
      Language.inst = new Language(options);
      Language.inst.lang = $('#core-lang').data('lang') ? 
        Core.decompress($('#core-lang').data('lang')) : null;
    } 
    if (options) Language.inst.settings = Object.assign(Language.inst.settings, options);
    return Language.inst;
  }

  // Deprecated: JS language file is loaded from Controller's PHP file.
  load(file, code, basepath = null) {
    return new Promise((resolve, reject) => {
      let data = {
        file: file,
        cid: code,
        basepath: basepath
      };
      if (!basepath) delete data.basepath;
      Core.instance().ajax().post(`coreLanguage/load`, data).then(language => { // console.log(language);
        this.lang = Object.assign(this.lang, language);
        resolve(this.lang);
      }); //.catch(error => reject(error))
    });
  }

  get(key) {
    console.log(this.lang, key);
    if (!this.lang || typeof this.lang[key] == 'undefined') {
      return key;
    }
    this.text = this.lang[key];
    let args = (Array.from(arguments));
    args.shift();
    return this.f(...args);
  }

  f() {
    var i = arguments.length;
    while (i--)
      this.text = this.text.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    return this.text;
  }
}

class Lang extends Language {
  static l(key) { return Language.instance().get(key); }
}