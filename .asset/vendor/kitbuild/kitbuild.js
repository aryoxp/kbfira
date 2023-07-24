class KitBuild {
  static openConceptMap(cmid) {
    if (!cmid) throw new Error(`Invalid Concept Map ID: ${cmid}`);
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openConceptMap/${cmid}`)
  }
  static openKitMap(kid) {
    if (!kid) throw new Error(`Invalid Kit Map ID: ${kid}`);
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openKitMap/${kid}`)
  }
  static openKitSet(kid) {
    if (!kid) throw new Error(`Invalid Kit Map ID: ${kid}`);
    this.ajax = Core.instance().ajax()
    let promise = new Promise((resolve, reject) => {
      this.ajax.post(`kitBuildApi/getKitSets`, {
        kid: kid
      }).then(sets => {
        // console.warn(sets);
        resolve(sets);
        return sets;
      }).catch(error => {
        reject(null)
      })
    })
    return promise;
  }
  static updateKitOption(kid, option) {
    if (!kid) throw new Error(`Invalid Kit Map ID: ${kid}`);
    this.ajax = Core.instance().ajax()
    return this.ajax.post(`kitBuildApi/updateKitOption`, {
      kid: kid,
      option: option
    })
  }
  static openLearnerMap(lmid) {
    if (!lmid) throw new Error(`Invalid Learner Map ID: ${lmid}`);
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openLearnerMap/${lmid}`)
  }
  static openExtendedLearnerMap(lmid) {
    if (!lmid) throw new Error(`Invalid Extended Learner Map ID: ${lmid}`);
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/openExtendedLearnerMap/${lmid}`)
  }

  static getTopicListOfGroups(groups = []) {
    if (!groups || groups.length == 0) throw new Error('Invalid groups');
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/getTopicListOfGroups/${groups.join(",")}`);
  }

  static getKitListOfGroups(groups = []) {
    if (!groups || groups.length == 0) throw new Error('Invalid groups');
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/getKitListOfGroups/${groups.join(",")}`);
  }

  static getUserListOfGroups(groups = []) {
    if (!groups || groups.length == 0) throw new Error('Invalid groups');
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`RBACApi/getUserListOfGroups/${groups.join(",")}`);
  }

  static getTextOfKit(kid = '') {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/getTextOfKit/${kid}`);
  }

  static getText(tid = '') {
    this.ajax = Core.instance().ajax()
    return this.ajax.get(`kitBuildApi/getTextOfTopic/${tid}`);
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