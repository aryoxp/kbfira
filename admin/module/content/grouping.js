class GroupingApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    GroupingApp.handleEvent(this)
  }
  static instance(options) {
    return new GroupingApp(options)
  }
  static handleEvent(app) { // console.log('handle')

    this.ajax = Core.instance().ajax();
    // console.log($('select.input-perpage-group').val());
    this.pagination = Pagination.instance('#pagination-group', 1, $('select.input-perpage-group').val());
    this.pagination.listen('form#form-search-group');

    this.topicPagination = Pagination.instance('#topic-pagination', 1, $('select.input-perpage-topic').val());
    this.topicPagination.listen('form#form-search-topic');

    this.userPagination = Pagination.instance('#user-pagination', 1, $('select.input-perpage-user').val());
    this.userPagination.listen('form#form-search-user');

    let groupDialog = UI.modal('#group-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle'
    })
    groupDialog.setGroup = (group) => {
      groupDialog.group = group;
      $('#group-dialog .dialog-name').html('Edit Group');
      $('#input-name').val(group.name);
      $('#input-gid').val(group.gid);
      $('#input-description').val(group.description);
      return groupDialog
    }

    let topicDialog = UI.modal("#assign-topic-dialog", {
      hideElement: ".bt-close",
      width: '700px',
      onShow: () => {
        $("#assign-topic-dialog .group-title").html(topicDialog.group.name);
      }
    });
    topicDialog.setGroup = (group) => {
      topicDialog.group = group;
      return topicDialog;
    }
    topicDialog.setTopics = (topics = []) => {
      GroupingApp.populateAssignedTopics(topics, topicDialog.group.gid);
      return topicDialog;
    }

    let userDialog = UI.modal("#assign-user-dialog", {
      hideElement: ".bt-close",
      width: '700px',
      onShow: () => {
        $("#assign-user-dialog .group-title").html(userDialog.group.name);
      }
    });
    userDialog.setGroup = (group) => {
      userDialog.group = group;
      return userDialog;
    }
    userDialog.setUsers = (users = []) => {
      GroupingApp.populateAssignedUsers(users, userDialog.group.gid);
      return userDialog;
    }

    let kitDialog = UI.modal("#assign-kit-dialog", {
      hideElement: ".bt-close",
      width: '700px',
      onShow: () => {
        $("#assign-kit-dialog .group-title").html(kitDialog.group.name);
      }
    });
    kitDialog.setGroup = (group) => {
      kitDialog.group = group;
      return kitDialog;
    }
    kitDialog.setKits = (kits = []) => {
      GroupingApp.populateAssignedKits(kits, kitDialog.group.gid);
      return kitDialog;
    }



    $('.bt-new').on('click', (e) => {
      groupDialog.group = null;
      $('#group-dialog .dialog-name').html('New Group');
      $('#input-name').val('');
      $('#input-gid').val('');
      $('#input-description').val('');
      groupDialog.show()
    })


    $('#form-search-group').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.pagination.perpage = $('#form-search-group .input-perpage-group').val()
      if (typeof this.pagination.keyword == "undefined")
        this.pagination.keyword = $('#form-search-group .input-keyword').val();
      let keyword = $('#form-search-group .input-keyword').val()
      if (keyword != this.pagination.keyword) this.pagination.page = 1;
      Promise.all([
        this.ajax.post(`RBACApi/getGroups/${this.pagination.page}/${this.pagination.perpage}`, {
          keyword: keyword
        }),
        this.ajax.post(`RBACApi/getGroupsCount`, {
          keyword: keyword
        })
      ]).then(results => {
        let [groups, count] = results;
        this.pagination.keyword = keyword
        this.pagination.update(count, this.pagination.perpage);
        GroupingApp.populateGroups(groups);
      });
    })
    $('.bt-search').on('click', () => $('#form-search-group').trigger('submit'))


    $('#group-dialog form.form-group').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#group-dialog form.form-group').addClass('was-validated')
      let gid = $('#input-gid').val().toUpperCase().trim();
      let name = $('#input-name').val().trim();
      let description = $('#input-description').val().trim();
      if (!name.length) return
      if (!gid.length) return
      if (!groupDialog.group) {
        this.ajax.post('RBACApi/createGroup', {
          gid: gid,
          name: name,
          description: description
        }).then(group => { // console.warn(group)
          groupDialog.hide();
          UI.success('Group created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        this.ajax.post('RBACApi/updateGroup', {
          gid: groupDialog.group.gid,
          name: name,
          description: description,
          ngid: gid,
        }).then(group => { // console.warn(group)
          groupDialog.hide();
          UI.success('Group updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#group-dialog .bt-generate-gid').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-gid').val($('#input-name').val().replace(/\s/g, '').substring(0, 20).trim().toUpperCase())
    })
    $('#group-dialog').on('click', '.bt-ok', (e) => {
      $('#group-dialog form.form-group').trigger('submit')
    })







    $('#list-group').on('click', '.bt-edit', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      this.ajax.get(`RBACApi/getGroup/${gid}`).then(group => {
        groupDialog.setGroup(group).show()
      })
    })

    $('#list-group').on('click', '.bt-delete', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      let name = $(e.currentTarget).parents('.group-item').attr('data-name')
      let confirm = UI.confirm(`Do you want to <span class="text-danger">DELETE</span> this group?<br><span class="text-primary">"${name}"</span>`).positive(() => {
        this.ajax.post(`RBACApi/deleteGroup/`, { gid: gid }).then(result => {
          UI.success('Selected group has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.group-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.group-item').remove()
          })
        })
      }).show()
    })

    $('#list-group').on('click', '.bt-detail', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid')
      this.ajax.get(`RBACApi/getGroupDetail/${gid}`).then(group => {
        GroupingApp.populateGroupDetail(group)
      })
    })








    $('#list-group').on('click', '.bt-topic', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid');
      Promise.all([
        KitBuild.getTopicListOfGroups([gid]),
        this.ajax.get(`RBACApi/getGroup/${gid}`)
      ]).then(results => { console.log(results);
        let [topics, group] = results;
        $('#assign-topic-dialog .bt-search').trigger('click')
        topicDialog.setGroup(group).setTopics(topics).show();
      });
    });

    $('form.form-assign-search-topic').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('form.form-assign-search-topic .input-perpage').val())
      let keyword = $('form.form-assign-search-topic .input-keyword').val()
      let page = (!GroupingApp.assignTopicPagination || 
        keyword != GroupingApp.assignTopicPagination.keyword) ?
        1 : GroupingApp.assignTopicPagination.page

      Promise.all([
        this.ajax.post(`contentApi/getTopics/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`contentApi/getTopicsCount`, {
          keyword: keyword
        })])
      .then(results => {
        let topics = results[0];
        let count = parseInt(results[1]);
        GroupingApp.populateAssignTopics(topics, topicDialog.group.gid)
        UI.centerDialog('#assign-topic-dialog');
        if (GroupingApp.assignTopicPagination) {
          GroupingApp.assignTopicPagination.keyword = keyword;
          GroupingApp.assignTopicPagination.update(count, perpage);  
        } else GroupingApp.assignTopicPagination = 
          Pagination.instance('form.form-assign-search-topic .list-topic-pagination', count, perpage).listen('form.form-assign-search-topic').update(count, perpage);
        $('.dropdown-menu-teacher-map-list').addClass('show');
      });
    });

    $('#assign-topic-dialog .list-topic').on('click', '.bt-assign-topic-to-group', (e) => {
      let gid = $(e.currentTarget).parents('.item-topic').attr('data-gid');
      let tid = $(e.currentTarget).parents('.item-topic').attr('data-tid');
      this.ajax.post('contentApi/assignTopicToGroup', {
        gid: gid,
        tid: tid
      }).then(result => {
        if (parseInt(result) == 1) {
          this.ajax.get(`contentApi/getTopic/${tid}`).then(topic => {
            GroupingApp.appendTopicInAssignedList(topic, gid);
            UI.success('Topic assigned successfully.').show();
          });
        } else UI.error('Unable to assign topic or selected topic is already assigned.').show();
      }).catch(error => UI.error(error).show());
    });

    $('form.form-assign-search-topic .bt-toggle-select').on('click', e => {
      let checked = $('form.form-assign-search-topic .list-topic').find('input[type="checkbox"]').prop('checked');
      $('form.form-assign-search-topic .list-topic').find('input[type="checkbox"]').prop('checked', !checked);
    })

    $('form.form-assign-search-topic .bt-assign-selected').on('click', e => {
      let checkeds = $('form.form-assign-search-topic .list-topic').find('input[type="checkbox"]:checked');
      if (checkeds.length == 0) UI.info('Please check the checkbox of topic(s) to assign.').show();
      checkeds.each((i, cb) => {
        $(cb).siblings('.bt-assign-topic-to-group').trigger('click');
      })
    })

    $('#assign-topic-dialog').on('click', '.bt-deassign-topic-from-group', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      let tid = $(e.currentTarget).attr('data-tid');
      this.ajax.post('contentApi/deassignTopicFromGroup', {
        gid: gid,
        tid: tid
      }).then(result => { // console.log(result);
        if (parseInt(result) == 1) {
          $(e.currentTarget).parents('.item-topic').slideUp('fast', () => {
            $(e.currentTarget).parents('.item-topic').remove();
            if ($('#list-topic-assigned').html() == "")
              $('#assign-topic-dialog .bt-refresh-assigned-topic').trigger('click');
          });
          UI.success('Topic deassigned successfully.').show();
        } else UI.error('Unable to deassign topic from group.').show();
      }).catch(error => UI.error(error).show());
    });

    $('#assign-topic-dialog').on('click', '.bt-refresh-assigned-topic', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      // console.log(gid);
      KitBuild.getTopicListOfGroups([gid]).then(topics => {
        $('#list-topic-assigned').slideUp('fast', () => {
          topicDialog.setTopics(topics);
          $('#list-topic-assigned').slideDown('fast');
        });
      })
    });










    $('#list-group').on('click', '.bt-user', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid');
      Promise.all([
        KitBuild.getUserListOfGroups([gid]),
        this.ajax.get(`RBACApi/getGroup/${gid}`)
      ]).then(results => { // console.log(results);
        let [users, group] = results;
        $('#assign-user-dialog .bt-search').trigger('click')
        userDialog.setGroup(group).setUsers(users).show();
      });
    });

    $('form.form-assign-search-user').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();

      let perpage = parseInt($('form.form-assign-search-user .input-perpage').val());
      let keyword = $('form.form-assign-search-user .input-keyword').val();

      if (!GroupingApp.assignUserPagination) {
        GroupingApp.assignUserPagination = Pagination.instance('form.form-assign-search-user .list-user-pagination', 1, perpage);
        GroupingApp.assignUserPagination.update(1, perpage).keyword = keyword;
        GroupingApp.assignUserPagination.listen('form.form-assign-search-user')
      }

      let page = GroupingApp.assignUserPagination.page;
      if (keyword != GroupingApp.assignUserPagination.keyword) {
        page = 1;
        GroupingApp.assignUserPagination.page;
      }

      Promise.all([
        this.ajax.post(`RBACApi/getUsers/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`RBACApi/getUsersCount`, {
          keyword: keyword
        })])
      .then(results => {
        let [users, count] = results;
        GroupingApp.populateAssignUsers(users, userDialog.group.gid)
        GroupingApp.assignUserPagination.page = page;
        GroupingApp.assignUserPagination.update(count, perpage).keyword = keyword;  
      });

    });

    $('#assign-user-dialog .list-user').on('click', '.bt-assign-user-to-group', (e) => {
      let gid = $(e.currentTarget).parents('.item-user').attr('data-gid');
      let username = $(e.currentTarget).parents('.item-user').attr('data-username');
      this.ajax.post('RBACApi/assignUserToGroup', {
        gid: gid,
        username: username
      }).then(result => {
        if (parseInt(result) == 1) {
          this.ajax.get(`RBACApi/getUser/${username}`).then(user => {
            GroupingApp.appendUserInAssignedList(user, gid);
            UI.success('User assigned successfully.').show();
          });
        } else UI.error('Unable to assign user or selected user is already assigned.').show();
      }).catch(error => UI.error(error).show());
    });

    $('form.form-assign-search-user .bt-toggle-select').on('click', e => {
      let checked = $('form.form-assign-search-user .list-user').find('input[type="checkbox"]').prop('checked');
      $('form.form-assign-search-user .list-user').find('input[type="checkbox"]').prop('checked', !checked);
    })

    $('form.form-assign-search-user .bt-assign-selected').on('click', e => {
      let checkeds = $('form.form-assign-search-user .list-user').find('input[type="checkbox"]:checked');
      // console.log(checkeds)
      if (checkeds.length == 0) UI.info('Please check the checkbox of user(s) to assign.').show();
      checkeds.each((i, cb) => {
        // console.log($(cb).siblings('.bt-assign-user-to-group'))
        $(cb).siblings('.bt-assign-user-to-group').trigger('click');
      })
    })

    $('#assign-user-dialog').on('click', '.bt-deassign-user-from-group', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      let username = $(e.currentTarget).attr('data-username');
      this.ajax.post('RBACApi/deassignUserFromGroup', {
        gid: gid,
        username: username
      }).then(result => { // console.log(result);
        if (parseInt(result) == 1) {
          $(e.currentTarget).parents('.item-user').slideUp('fast', () => {
            $(e.currentTarget).parents('.item-user').remove();
            if ($('#list-user-assigned').html() == "")
              $('#assign-user-dialog .bt-refresh-assigned-user').trigger('click');
          });
          UI.success('User deassigned successfully.').show();
        } else UI.error('Unable to deassign user from group.').show();
      }).catch(error => UI.error(error).show());
    });

    $('#assign-user-dialog').on('click', '.bt-refresh-assigned-user', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      KitBuild.getUserListOfGroups([gid]).then(users => {
        $('#list-user-assigned').slideUp('fast', () => {
          userDialog.setUsers(users);
          $('#list-user-assigned').slideDown('fast');
        });
      })
    });
    








    $('#list-group').on('click', '.bt-kit', (e) => {
      let gid = $(e.currentTarget).parents('.group-item').attr('data-gid');
      Promise.all([
        KitBuild.getKitListOfGroups([gid]),
        this.ajax.get(`RBACApi/getGroup/${gid}`)
      ]).then(results => { // console.log(results);
        let [kits, group] = results;
        $('#assign-kit-dialog .bt-search').trigger('click')
        kitDialog.setGroup(group).setKits(kits).show();
      });
    });

    $('form.form-assign-search-kit').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();

      let perpage = parseInt($('form.form-assign-search-kit .input-perpage').val());
      let keyword = $('form.form-assign-search-kit .input-keyword').val();

      if (!GroupingApp.assignKitPagination) {
        GroupingApp.assignKitPagination = Pagination.instance('form.form-assign-search-kit .list-kit-pagination', 1, perpage);
        GroupingApp.assignKitPagination.update(1, perpage).keyword = keyword;
        GroupingApp.assignKitPagination.listen('form.form-assign-search-kit')
      }

      let page = GroupingApp.assignKitPagination.page;
      if (keyword != GroupingApp.assignKitPagination.keyword) {
        page = 1;
        GroupingApp.assignKitPagination.page;
      }

      Promise.all([
        this.ajax.post(`contentApi/getKits/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`contentApi/getKitsCount`, {
          keyword: keyword
        })])
      .then(results => {
        let [kits, count] = results;
        GroupingApp.populateAssignKits(kits, kitDialog.group.gid)
        GroupingApp.assignKitPagination.page = page;
        GroupingApp.assignKitPagination.update(count, perpage).keyword = keyword;  
      });

    });

    $('#assign-kit-dialog .list-kit').on('click', '.bt-assign-kit-to-group', (e) => {
      let gid = $(e.currentTarget).parents('.item-kit').attr('data-gid');
      let kid = $(e.currentTarget).parents('.item-kit').attr('data-kid');
      this.ajax.post('contentApi/assignKitToGroup', {
        gid: gid,
        kid: kid
      }).then(result => {
        if (parseInt(result) == 1) {
          this.ajax.get(`contentApi/getKit/${kid}`).then(kit => {
            GroupingApp.appendKitInAssignedList(kit, gid);
            UI.success('Kit assigned successfully.').show();
          });
        } else UI.error('Unable to assign kit or selected kit is already assigned.').show();
      }).catch(error => UI.error(error).show());
    });

    $('form.form-assign-search-kit .bt-toggle-select').on('click', e => {
      let checked = $('form.form-assign-search-kit .list-kit').find('input[type="checkbox"]').prop('checked');
      $('form.form-assign-search-kit .list-kit').find('input[type="checkbox"]').prop('checked', !checked);
    })

    $('form.form-assign-search-kit .bt-assign-selected').on('click', e => {
      let checkeds = $('form.form-assign-search-kit .list-kit').find('input[type="checkbox"]:checked');
      // console.log(checkeds)
      if (checkeds.length == 0) UI.info('Please check the checkbox of kit(s) to assign.').show();
      checkeds.each((i, cb) => {
        // console.log($(cb).siblings('.bt-assign-kit-to-group'))
        $(cb).siblings('.bt-assign-kit-to-group').trigger('click');
      })
    })

    $('#assign-kit-dialog').on('click', '.bt-deassign-kit-from-group', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      let kid = $(e.currentTarget).attr('data-kid');
      this.ajax.post('contentApi/deassignKitFromGroup', {
        gid: gid,
        kid: kid
      }).then(result => { // console.log(result);
        if (parseInt(result) == 1) {
          $(e.currentTarget).parents('.item-kit').slideUp('fast', () => {
            $(e.currentTarget).parents('.item-kit').remove();
            if ($('#list-kit-assigned').html() == "")
              $('#assign-kit-dialog .bt-refresh-assigned-kit').trigger('click');
          });
          UI.success('Kit deassigned successfully.').show();
        } else UI.error('Unable to deassign kit from group.').show();
      }).catch(error => UI.error(error).show());
    });

    $('#assign-kit-dialog').on('click', '.bt-refresh-assigned-kit', (e) => {
      let gid = $(e.currentTarget).attr('data-gid');
      // console.log(gid);
      KitBuild.getKitListOfGroups([gid]).then(kits => {
        $('#list-kit-assigned').slideUp('fast', () => {
          kitDialog.setKits(kits);
          $('#list-kit-assigned').slideDown('fast');
        });
      })
    });


    $('form#form-search-group .bt-search').trigger('click')

  }

  static populateAssignedTopics(topics, gid) {
    $('#assign-topic-dialog .bt-refresh-assigned-topic').attr('data-gid', gid)
    if (topics.length == 0) {
      $('#list-topic-assigned').html('<em>No topic assigned.</em>');
      return;
    } 
    $('#list-topic-assigned').html('');
    for (let topic of topics)
      GroupingApp.appendTopicInAssignedList(topic, gid);
  }

  static appendTopicInAssignedList(topic, gid) {
    if ($('#list-topic-assigned').html() == "<em>No topic assigned.</em>")
      $('#list-topic-assigned').html('');
    let topicsHtml = '';
    topicsHtml += `<div class="d-flex py-1 border-bottom item-topic">`;
    topicsHtml += `<span class="flex-fill text-truncate">${topic.title}</span>`;
    topicsHtml += `<span class="">`;
    topicsHtml += `<span data-tid="${topic.tid}" data-gid="${gid}" class="badge rounded-pill bg-danger bt-deassign-topic-from-group" role="button">Remove</span>`;
    topicsHtml += `</span>`;
    topicsHtml += `</div>`;
    $('#list-topic-assigned').append(topicsHtml);
    return topicsHtml;
  }

  static populateAssignedUsers(users, gid) {
    $('#assign-user-dialog .bt-refresh-assigned-user').attr('data-gid', gid)
    if (users.length == 0) {
      $('#list-user-assigned').html('<em>No user assigned.</em>');
      return;
    } 
    $('#list-user-assigned').html('');
    for (let user of users)
      GroupingApp.appendUserInAssignedList(user, gid);
  }

  static appendUserInAssignedList(user, gid) { // console.log(user);
    if ($('#list-user-assigned').html() == "<em>No user assigned.</em>")
      $('#list-user-assigned').html('');
    let usersHtml = '';
    usersHtml += `<div class="d-flex py-1 border-bottom item-user">`;
    usersHtml += `<span class="flex-fill text-truncate" style="width:0">${user.name}</span>`;
    usersHtml += `<span class="ms-2">`;
    usersHtml += `<span data-username="${user.username}" data-gid="${gid}" class="badge rounded-pill bg-danger bt-deassign-user-from-group" role="button">Remove</span>`;
    usersHtml += `</span>`;
    usersHtml += `</div>`;
    $('#list-user-assigned').append(usersHtml);
    return usersHtml;
  }

  static populateAssignedKits(kits, gid) {
    $('#assign-kit-dialog .bt-refresh-assigned-kit').attr('data-gid', gid)
    if (kits.length == 0) {
      $('#list-kit-assigned').html('<em>No kit assigned.</em>');
      return;
    } 
    $('#list-kit-assigned').html('');
    for (let kit of kits)
      GroupingApp.appendKitInAssignedList(kit, gid);
  }

  static appendKitInAssignedList(kit, gid) { // console.log(kit);
    if ($('#list-kit-assigned').html() == "<em>No kit assigned.</em>")
      $('#list-kit-assigned').html('');
    let kitsHtml = '';
    kitsHtml += `<div class="d-flex py-1 border-bottom item-kit">`;
    kitsHtml += `<span class="flex-fill text-truncate" style="width:0">${kit.name}</span>`;
    kitsHtml += `<span class="ms-2">`;
    kitsHtml += `<span data-kid="${kit.kid}" data-gid="${gid}" class="badge rounded-pill bg-danger bt-deassign-kit-from-group" role="button">Remove</span>`;
    kitsHtml += `</span>`;
    kitsHtml += `</div>`;
    $('#list-kit-assigned').append(kitsHtml);
    return kitsHtml;
  }
}

GroupingApp.populateGroups = groups => {
  let groupsHtml = '';
  groups.forEach(group => {
    groupsHtml += `<div class="group-item d-flex align-items-center py-1 border-bottom" group="button"`
    groupsHtml += `  data-gid="${group.gid}" data-name="${group.name}">`
    groupsHtml += `  <span class="flex-fill ps-2 text-truncate text-nowrap">`
    groupsHtml += `    <span>${group.name}</span>`
    groupsHtml += `    <span class="ms-2 badge rounded-pill bg-primary">${group.gid}</span>`
    groupsHtml += `  </span>`
    groupsHtml += `  <span class="text-end text-nowrap ms-3">`
    groupsHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    groupsHtml += `    <button class="btn btn-sm btn-primary bt-topic"><i class="bi bi-lightbulb-fill"></i></button>`
    groupsHtml += `    <button class="btn btn-sm btn-success bt-user"><i class="bi bi-people-fill"></i></button>`
    groupsHtml += `    <button class="btn btn-sm btn-warning bt-kit"><i class="bi bi-layout-wtf"></i></button>`
    // groupsHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    // groupsHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    groupsHtml += `  </span>`
    groupsHtml += `</div>`
  });
  if (groupsHtml.length == 0) groupsHtml = '<em class="d-block m-3 text-muted">No groups found in current search.</em>';
  $('#list-group').html(groupsHtml)
}

GroupingApp.populateGroupDetail = group => {
  let groupDetailHtml = '';

  let content = group.content 
    ? new showdown.Converter({}).makeHtml(group.content) 
    : '<em class="text-muted">This group has no content.</em>'

  groupDetailHtml += `<span class="group-name h4 text-primary">${group.name}</span>`
  groupDetailHtml += `<div class="align-middle">`
  groupDetailHtml += `<span class="badge rounded-pill bg-warning text-dark px-3">${group.gid}</span>`
  groupDetailHtml += `</div>`
  // groupDetailHtml += `<hr>`
  // groupDetailHtml += `<span class="d-block"><span class="text-primary">3 concept maps</span> were associated to this group.</span>`
  // groupDetailHtml += `<hr>`
  // groupDetailHtml += `<span class="d-block mt-3">This group has access to the following functions:</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:delete</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:create</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:list</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app:dump</span>`
  // groupDetailHtml += `<hr>`
  // groupDetailHtml += `<span class="d-block mt-3">This group is associated with: <span class="text-primary">4 modules.</span></span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">dashboard</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">kitbuild</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">cmap</span>`
  // groupDetailHtml += `<span class="badge rounded-pill bg-secondary me-1 px-3">app</span>`

  $('#detail-group').html(groupDetailHtml)

}

GroupingApp.populateAssignTopics = (topics, gid) => {
  let topicsHtml = '';
  topics.forEach(topic => {
    topicsHtml += `<div class="item-topic d-flex align-items-center py-1 border-bottom" role="button"`
    topicsHtml += `  data-tid="${topic.tid}" data-gid="${gid}" data-title="${topic.title}" style="min-width:0">`
    topicsHtml += `  <input type="checkbox" data-tid="${topic.tid}" data-gid="${gid}">`
    topicsHtml += `  <span class="flex-fill ps-2 d-flex align-items-center" style="width:0">`
    topicsHtml += `  <span class="text-truncate" style="min-width:0">${topic.title}</span>`
    if (topic.text) topicsHtml += `    <span class="badge rounded-pill bg-success ms-2">Text ID ${topic.text} <i class="bi bi-file-text"></i></span>`
    topicsHtml += `  </span>`
    topicsHtml += `  <span class="badge rounded-pill bg-primary bt-assign-topic-to-group ms-2"><i class="bi bi-plus-lg"></i></span>`
    topicsHtml += `</div>`
  });
  if (topicsHtml.length == 0) topicsHtml = '<em class="d-block m-3 text-muted">No topics found in current search.</em>';
  $('form.form-assign-search-topic .list-topic').html(topicsHtml)
}

GroupingApp.populateAssignUsers = (users, gid) => {
  let usersHtml = '';
  users.forEach(user => {
    usersHtml += `<div class="item-user d-flex align-items-center py-1 border-bottom" role="button"`
    usersHtml += `  data-username="${user.username}" data-gid="${gid}" data-name="${user.name}" style="min-width:0">`
    usersHtml += `  <input type="checkbox" data-username="${user.username}" data-gid="${gid}">`
    usersHtml += `  <span class="flex-fill ps-2 d-flex align-items-center">`
    usersHtml += `  <span class="user-truncate" style="min-width:0">${user.name}`
    usersHtml += `  <code>${user.username}</code>`
    usersHtml += `  </span>`
    usersHtml += `  </span>`
    usersHtml += `  <span class="badge rounded-pill bg-primary bt-assign-user-to-group"><i class="bi bi-plus-lg"></i></span>`
    usersHtml += `</div>`
  });
  if (usersHtml.length == 0) usersHtml = '<em class="d-block m-3 user-muted">No users found in current search.</em>';
  $('form.form-assign-search-user .list-user').html(usersHtml)
}

GroupingApp.populateAssignKits = (kits, gid) => {
  let kitsHtml = '';
  kits.forEach(kit => {
    kitsHtml += `<div class="item-kit d-flex align-items-center py-1 border-bottom" role="button"`
    kitsHtml += `  data-kid="${kit.kid}" data-gid="${gid}" data-name="${kit.name}" style="min-width:0">`
    kitsHtml += `  <input type="checkbox" data-kid="${kit.kid}" data-gid="${gid}">`
    kitsHtml += `  <span class="flex-fill ps-2 d-flex align-items-center">`
    kitsHtml += `  <span class="kit-truncate" style="min-width:0">${kit.name}</span>`
    kitsHtml += `  </span>`
    kitsHtml += `  <span class="badge rounded-pill bg-primary bt-assign-kit-to-group"><i class="bi bi-plus-lg"></i></span>`
    kitsHtml += `</div>`
  });
  if (kitsHtml.length == 0) kitsHtml = '<em class="d-block m-3 kit-muted">No kits found in current search.</em>';
  $('form.form-assign-search-kit .list-kit').html(kitsHtml)
}

$(() => {
  let app = GroupingApp.instance()
})