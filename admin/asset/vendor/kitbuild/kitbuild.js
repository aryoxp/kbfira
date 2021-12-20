class KitBuild {
  static openConceptMap(cmid) {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openConceptMap/${cmid}`)
  }
  static openKitMap(kid) {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openKitMap/${kid}`)
  }
  static updateKitOption(kid, option) {
    this.ajax = Core.instance().ajax()
    return this.ajax.post(`kitBuildApi/updateKitOption`, {
      kid: kid,
      option: option
    })
  }
  static openLearnerMap(lmid) {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openLearnerMap/${lmid}`)
  }
  static openExtendedLearnerMap(lmid) {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openExtendedLearnerMap/${lmid}`)
  }
}

class KitBuildRBAC {
  static signIn(username, password = '') {
    if (!username) console.error('Invalid username');
    this.ajax = Core.instance().ajax()
    return this.ajax.post(`RBACApi/signIn`, {
      username: username,
      password: password
    })
  }
  static register (name, username, password, rid = null, gid = null) {
    if (!username) console.error('Invalid username');
    console.log(name, username, password, rid, gid)
    this.ajax = Core.instance().ajax()
    return this.ajax.post(`RBACApi/register`, {
      username: username,
      password: password,
      name: name,
      rid: rid,
      gid: gid
    })
  }
}