class Logger {
  constructor(username, seq, sessid) {
    if (!navigator.sendBeacon) {
      console.error('Logging feature unavailable. Beacon function is not supported.');
      this.enabled = false
      return;
    }
    this.enabled  = false;
    this.username = username ? username : null;
    this.seq      = seq ? seq : null;
    this.sessid   = sessid ? sessid : null;
    this.ua       = navigator.userAgent;
  }
  static instance(username, seq, sessid) {
    let inst = new Logger(username, seq, sessid) 
    if (username || seq || sessid) console.log("LOGGER RESTORED", inst)
    return inst
  }
  enable(enabled = true) {
    this.enabled = !["false", "0", 0, null, "", false].includes(enabled)
    console.warn(`Log is ${this.enabled ? 'enabled' : 'disabled'}`)
    return this
  }
  composeBaseData() {
    
  }
  log(action, data, extra, options) { // console.log(arguments, this)
    // console.warn("logger is enabled: ", this.enabled)
    if (!this.enabled) return

    let settings = Object.assign({ compress: false }, options)
    
    let lData = new FormData()    
    lData.append('tstampc', Date.now() / 1000 | 0); // the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
    lData.append('ua', this.ua);
    lData.append('action', action);
    if (data != undefined) 
      lData.append('data', settings.compress ? Core.compress(JSON.stringify(data)) : JSON.stringify(data));
    lData.append('seq', ++this.seq);

    if (this.username !== null) lData.append('username', this.username);
    if (this.sessid !== null) lData.append('sessid', this.sessid);
    if (extra instanceof Map) extra.forEach((v, k) => lData.append(k, v))

    // if(this.mid) lData.append('mid', this.mid);
    // if(this.gmid) lData.append('gmid', this.gmid);
    // if(this.rid) lData.append('rid', this.rid);
    
    let url = Core.instance().config('baseurl') + "logApi/log";
    let status = navigator.sendBeacon(url, lData);
    console.warn(this.seq, action, Array.from(lData.entries()))
    // if(this.verbosity == KBLogger.MINIMAL || this.verbosity == KBLogger.VERBOSE)
    //   console.log(action, this.uid, this.seq, status);
    return status;

    
    if (this.verbosity == KBLogger.VERBOSE) {
      for(var pair of lData.entries()) {
        console.log(pair[0]+ ', '+ pair[1]); 
      }
    }

    return Logger.inst
  }
  post() {
    
  }
}

class CmapLogger extends Logger {  // TODO: SET cmid
  constructor(username, seq, sessid, canvas) {
    super(username, seq, sessid)
    this.canvas = canvas
  }
  static instance(username, seq, sessid, canvas) {
    return new CmapLogger(username, seq, sessid, canvas)
  }
  onCanvasEvent(canvasId, evt, data, options) { console.warn("LOGGER RECEIVE: ", evt, data)
    let settings = Object.assign({ includeMapData: false }, options)
    let extra = new Map()
    extra.set('canvasid', canvasId)
    switch(evt) {
      case 'undo-connect-right':
      case 'undo-connect-left':
      case 'undo-disconnect-right':
      case 'undo-disconnect-left':
      case 'undo-disconnect-links':
      case 'undo-move-connect-right':
      case 'undo-move-connect-left':
      case 'undo-delete-concept':
      case 'undo-delete-link':
      case 'undo-delete-multi-nodes':       
      case 'redo-connect-right':
      case 'redo-connect-left':
      case 'redo-disconnect-right':
      case 'redo-disconnect-left':
      case 'redo-disconnect-links':
      case 'redo-move-connect-right':
      case 'redo-move-connect-left':
      case 'redo-delete-concept':
      case 'redo-delete-link':
      case 'redo-delete-multi-nodes':
      case 'connect-right':
      case 'connect-left':
      case 'disconnect-right':
      case 'disconnect-left':
      case 'disconnect-links':
      case 'move-connect-right':
      case 'move-connect-left':
      case 'delete-concept':
      case 'delete-link':
      case 'delete-multi-nodes':
        settings.includeMapData = true
        break;
    }
    if (settings.includeMapData) this.includeMapData(extra)
    this.log(evt, data, extra, options)
  }
  includeMapData(extra) {
    if (typeof Analyzer === 'undefined' || typeof Core === 'undefined') {
      console.error('CmapLogger requires Core and Analyzer to be loaded.')
      return null
    }
    let propositions = Analyzer.composePropositions(KitBuildUI.buildConceptMapData(canvas));
    let concepts = this.canvas.cy.nodes('[type="concept"]');
    let links = this.canvas.cy.nodes('[type="link"]');
    let edges = this.canvas.cy.edges();
    extra.set('concept', Core.compress(concepts.jsons()));
    extra.set('link', Core.compress(links.jsons()));
    extra.set('edge', Core.compress(edges.jsons()));
    extra.set('map', Core.compress(this.canvas.cy.elements().jsons()));
    extra.set('proposition', Core.compress(propositions));
    extra.set('nc', concepts.length);
    extra.set('nl', links.length);
    extra.set('ne', edges.length);
    extra.set('np', propositions.length);
    extra.set('flag', 'cmap');
    return extra
  }
}

class KitBuildLogger extends Logger { // TODO: SET lmid
  constructor(username, seq, sessid, canvas, conceptMap) {
    super(username, seq, sessid)
    this.canvas = canvas
    this.conceptMap = conceptMap
  }
  static instance(username, seq, sessid, canvas, conceptMap) {
    return new KitBuildLogger(username, seq, sessid, canvas, conceptMap)
  }
  onCanvasEvent(canvasId, evt, data, options) { 
    console.warn("LOGGER RECEIVE: ", evt, data)
    let settings = Object.assign({ includeMapData: false }, options)
    let extra = new Map()
    extra.set('canvasid', canvasId)
    switch(evt) {
      case 'undo-connect-right':
      case 'undo-connect-left':
      case 'undo-disconnect-right':
      case 'undo-disconnect-left':
      case 'undo-disconnect-links':
      case 'undo-move-connect-right':
      case 'undo-move-connect-left':
      case 'redo-connect-right':
      case 'redo-connect-left':
      case 'redo-disconnect-right':
      case 'redo-disconnect-left':
      case 'redo-disconnect-links':
      case 'redo-move-connect-right':
      case 'redo-move-connect-left':
      case 'connect-right':
      case 'connect-left':
      case 'disconnect-right':
      case 'disconnect-left':
      case 'disconnect-links':
      case 'move-connect-right':
      case 'move-connect-left':
        settings.includeMapData = true
        break;
    }
    if (settings.includeMapData) this.includeMapData(extra)
    this.log(evt, data, extra, options)
  }
  includeMapData(extra) {
    if (typeof Analyzer === 'undefined' || typeof Core === 'undefined' || !this.conceptMap) {
      console.error('KitBuildLogger requires Core, Analyzer, and Concept Map to be loaded.')
      return null
    }
  
    let conceptsMap = new Map(this.conceptMap.concepts.map(concept => [concept.cid, concept]));
    let linksMap = new Map(this.conceptMap.links.map(link => [link.lid, link]));

    let currentLearnerMap = KitBuildUI.buildConceptMapData(this.canvas, conceptsMap, linksMap)
    currentLearnerMap.conceptMap = this.conceptMap
    let propositions = Analyzer.composePropositions(currentLearnerMap);
    let compare = Analyzer.compare(currentLearnerMap, this.conceptMap.map.direction)
    let edges = this.canvas.cy.edges();
    extra.set('edge', Core.compress(edges.jsons()));
    extra.set('map', Core.compress(this.canvas.cy.elements().jsons()));
    extra.set('proposition', Core.compress(propositions));
    extra.set('compare', Core.compress(compare));
    extra.set('ne', edges.length);
    extra.set('np', propositions.length);
    extra.set('flag', 'kitbuild');
    return extra
  }
}

if (!Date.now) Date.now = () => { return new Date().getTime(); }