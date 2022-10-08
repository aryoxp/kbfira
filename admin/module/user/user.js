class UserApp {
  constructor(options) {
    this.settings = Object.assign({}, options)
    this.ajax = Core.instance().ajax();
    this.handleEvent();
  }
  static instance(options) {
    return new UserApp(options)
  }
  handleEvent() { // console.log('handle')

    this.pagination = {
      page: 1,
      maxpage: 1,
      perpage: 1,
      count: 0,
      keyword: null
    }

    let userDialog = UI.modal('#user-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      onShow: () => {
        if (!userDialog.user) {
          $(`#input-rid`).prop('disabled', false);
          $(`#input-gid`).prop('disabled', false);
          $('#user-dialog .update-role-group-info').addClass('d-none')
        } else $('#user-dialog .update-role-group-info').removeClass('d-none')
      }
    })
    userDialog.setUser = (user) => {
      userDialog.user = user;
      $('#user-dialog .dialog-title').html('Edit User');
      $('#input-user-name').val(user.name);
      $('#input-user-username').val(user.username);
      $('#input-user-password').val('');
      $(`#input-rid`).prop('disabled', true);
      $(`#input-gid`).prop('disabled', true);
      return userDialog
    }

    let userDetailDialog = UI.modal('#user-detail-dialog', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      width: '450px',
      minHeight: 100,
      minWidth: 300,
      height: 500,
      onShow: () => {}
    })
    userDetailDialog.setUser = (user) => {
      userDetailDialog.user = user;
      return userDetailDialog;
    }

    let batchHelpDialog = UI.modal('#batch-create-help', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      width: '550px',
      minHeight: 100,
      minWidth: 300,
      height: 500,
      onShow: () => {}
    })


    $('.bt-list-user').on('click', () => {
      
    })
    $('.bt-new').on('click', (e) => {
      userDialog.user = null;
      $('#user-dialog .dialog-title').html('New User');
      $('#input-user-name').val('');
      $('#input-user-username').val('');
      $('#input-user-password').val('');
      $('#input-rid option[default]').prop('selected', true);
      $('#input-gid option[default]').prop('selected', true);
      userDialog.show()
    })


    $('#form-search-user').on('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      let perpage = parseInt($('#form-search-user .input-perpage').val())
      let keyword = $('#form-search-user .input-keyword').val()
      let page = (!UserApp.assignTopicPagination || 
        keyword != UserApp.assignTopicPagination.keyword) ?
        1 : UserApp.assignTopicPagination.page

      Promise.all([
        this.ajax.post(`RBACApi/getUsers/${page}/${perpage}`, {
          keyword: keyword
        }), 
        this.ajax.post(`RBACApi/getUsersCount`, {
          keyword: keyword
        })])
      .then(results => {
        let users = results[0];
        let count = parseInt(results[1]);
        UserApp.populateUsers(users)
        if (UserApp.assignTopicPagination) {
          UserApp.assignTopicPagination.keyword = keyword;
          UserApp.assignTopicPagination.update(count, perpage);  
        } else UserApp.assignTopicPagination = 
          Pagination.instance('#pagination-user', count, perpage).listen('#form-search-user').update(count, perpage);
      });

    });
    $('#form-search-user').trigger('submit');

    $('#user-dialog form.form-user').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#user-dialog form.form-user').addClass('was-validated')
      let name = $('#input-user-name').val().trim();
      let username = $('#input-user-username').val().trim();
      let password = $('#input-user-password').val().trim();
      let rid = $('#input-rid').val().trim();
      let gid = $('#input-gid').val().trim();
      let data = {
        name: name,
        username: username,
        nusername: null,
        password: password,
        rid: rid,
        gid: gid
      }
      if (!rid) delete data.rid;
      if (!gid) delete data.gid;

      if (!username.length) return

      if (!userDialog.user) {
        delete data.nusername;
        console.log(data)
        this.ajax.post('RBACApi/createUser', data).then(user => { // console.warn(user)
          userDialog.hide();
          UI.success('User created successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      } else {
        data.username = userDialog.user.username;
        data.nusername = username;
        delete data.rid
        delete data.gid
        if (!password) delete data.password
        console.log(data)
        this.ajax.post('RBACApi/updateUser', data).then(user => { // console.warn(user)
          userDialog.hide();
          UI.success('User updated successfully.').show()
          $('.bt-search').trigger('click')
        }).catch(error => UI.error(error).show())
      }
    })
    $('#user-dialog .bt-generate-password').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      $('#input-password').val(Math.random().toString(36).slice(2).substr(0, 4))
    })
    $('#user-dialog').on('click', '.bt-ok', (e) => {
      $('#user-dialog form.form-user').trigger('submit')
    })







    $('#list-user').on('click', '.bt-edit', (e) => {
      let username = $(e.currentTarget).parents('.user-item').attr('data-username')
      this.ajax.get(`RBACApi/getUser/${username}`).then(user => {
        userDialog.setUser(user).show()
      })
    })

    $('#list-user').on('click', '.bt-delete', (e) => {
      let username = $(e.currentTarget).parents('.user-item').attr('data-username')
      let name = $(e.currentTarget).parents('.user-item').attr('data-name')
      let confirm = UI.confirm(`Do you want to <span class="user-danger">DELETE</span> this user?<br><span class="user-primary">"${name}"</span>`).positive(() => {
        this.ajax.post(`RBACApi/deleteUser/`, { username: username }).then(result => {
          UI.success('Selected user has been deleted successfully.').show()
          confirm.hide()
          $(e.currentTarget).parents('.user-item').slideUp('fast', () => {
            $(e.currentTarget).parents('.user-item').remove()
          })
        })
      }).show()
    })

    $('#list-user').on('click', '.bt-detail', (e) => {
      let username = $(e.currentTarget).parents('.user-item').attr('data-username')
      this.ajax.get(`RBACApi/getUserDetail/${username}`).then(user => {
        UserApp.populateUserDetail(user)
        userDetailDialog.setUser(user).show();
      })
    })

    $('#selection-user').on('click', '.bt-select-all', (e) => {
      $('#list-user input.cb-user').prop('checked', true)
    })
    $('#selection-user').on('click', '.bt-unselect-all', (e) => {
      $('#list-user input.cb-user').prop('checked', false)
    })
    $('#multi-action-user').on('click', '.bt-delete', (e) => {
      let selectedUsernames = []
      $('#list-user input.cb-user:checked').each((index, item) => {
        selectedUsernames.push($(item).attr('data-username'))
      })
      this.selectedUsernames = selectedUsernames;
      if (selectedUsernames.length > 0) {
        let confirm = UI.confirm(`Delete selected ${selectedUsernames.length} users?<br>This action is <span class="text-danger">NOT UNDOABLE</span>.`, {
          icon: 'exclamation-triangle-fill',
          iconStyle: 'danger'
        }).positive(() => {
          console.log(selectedUsernames);
          this.ajax.post('RBACApi/deleteUsers', {
            usernames: selectedUsernames
          }).then(result => { // console.log(result)
            $('#list-user input.cb-user:checked').parent('.user-item').slideUp({
              duration: 'fast',
              complete: function() { 
                $(this).remove(); 
              }
            })
            UI.success('User(s) deleted successfully.').show();
            confirm.hide()
          }).catch(error => UI.error(error).show());
        }).show()
      } else UI.dialog('Nothing to delete. Please select user(s) to delete from search list.').show();
    })
    $('#multi-action-user').on('click', '.bt-apply-role', (e) => {
      let selectedUsernames = []
      $('#list-user input.cb-user:checked').each((index, item) => {
        selectedUsernames.push($(item).attr('data-username'))
      })
      this.selectedUsernames = selectedUsernames;
      let role = $('#apply-rid option:selected').attr('data-name');
      let rid = $('#apply-rid').val()
      let data = {
        usernames: selectedUsernames,
        rid: rid
      } // console.log(data)
      if (!rid) {
        UI.dialog('Please select a role to apply.').show()
        return
      }
      if (selectedUsernames.length > 0) {
        let confirm = UI.confirm(`Apply role <span class="text-primary">${role}</span> to the selected <span class="text-danger">${selectedUsernames.length} user(s)</span>?`).positive(() => {
          // console.log(selectedUsernames);
          this.ajax.post('RBACApi/applyRoleToUsers', data).then(result => { // console.log(result)
            UI.success('Role applied successfully.').show();
            $('.bt-search').trigger('click')
            confirm.hide()
          }).catch(error => UI.error(error).show());
        }).show()
      } else UI.dialog('No users to apply to. Please select user(s) to apply role from search list.').show();
    })
    $('#multi-action-user').on('click', '.bt-revoke-role', (e) => {
      let selectedUsernames = []
      $('#list-user input.cb-user:checked').each((index, item) => {
        selectedUsernames.push($(item).attr('data-username'))
      });
      this.selectedUsernames = selectedUsernames;
      let role = $('#apply-rid option:selected').attr('data-name');
      let rid = $('#apply-rid').val()
      let data = {
        usernames: selectedUsernames,
        rid: rid
      } // console.log(data)
      if (!rid) {
        UI.dialog('Please select a role to revoke.').show()
        return
      }
      if (selectedUsernames.length > 0) {
        let confirm = UI.confirm(`Revoke role <span class="text-primary">${role}</span> from selected <span class="text-danger">${selectedUsernames.length} user(s)</span>?`, {
          icon: 'exclamation-triangle-fill',
          iconStyle: 'danger'
        }).positive(() => {
          // console.log(selectedUsernames);
          this.ajax.post('RBACApi/revokeRoleFromUsers', data).then(result => { // console.log(result)
            UI.success('Role applied successfully.').show();
            $('.bt-search').trigger('click')
            confirm.hide()
          }).catch(error => UI.error(error).show());
        }).show()
      } else UI.dialog('No users to revoke role from. Please select user(s) to revoke role from search list.').show();
    })
    $('#multi-action-user').on('click', '.bt-apply-group', (e) => {
      let selectedUsernames = []
      $('#list-user input.cb-user:checked').each((index, item) => {
        selectedUsernames.push($(item).attr('data-username'))
      });
      this.selectedUsernames = selectedUsernames;
      let group = $('#apply-gid option:selected').attr('data-name');
      let gid = $('#apply-gid').val()
      let data = {
        usernames: selectedUsernames,
        gid: gid
      } // console.log(data)
      if (!gid) {
        UI.dialog('Please select a group to apply.').show()
        return
      }
      if (selectedUsernames.length > 0) {
        let confirm = UI.confirm(`Apply group <span class="text-primary">${group}</span> to the selected <span class="text-danger">${selectedUsernames.length} user(s)</span>?`).positive(() => {
          // console.log(selectedUsernames);
          this.ajax.post('RBACApi/applyGroupToUsers', data).then(result => { // console.log(result)
            UI.success('Group applied successfully.').show();
            $('.bt-search').trigger('click')
            confirm.hide()
          }).catch(error => UI.error(error).show());
        }).show()
      } else UI.dialog('No users to apply to. Please select user(s) to apply group from search list.').show();
    })
    $('#multi-action-user').on('click', '.bt-revoke-group', (e) => {
      let selectedUsernames = [];
      $('#list-user input.cb-user:checked').each((index, item) => {
        selectedUsernames.push($(item).attr('data-username'))
      });
      this.selectedUsernames = selectedUsernames;
      let group = $('#apply-gid option:selected').attr('data-name');
      let gid = $('#apply-gid').val()
      let data = {
        usernames: selectedUsernames,
        gid: gid
      } // console.log(data)
      if (!gid) {
        UI.dialog('Please select a group to revoke.').show()
        return
      }
      if (selectedUsernames.length > 0) {
        let confirm = UI.confirm(`Revoke group <span class="text-primary">${group}</span> from selected <span class="text-danger">${selectedUsernames.length} user(s)</span>?`, {
          icon: 'exclamation-triangle-fill',
          iconStyle: 'danger'
        }).positive(() => {
          // console.log(selectedUsernames);
          this.ajax.post('RBACApi/revokeGroupFromUsers', data).then(result => { // console.log(result)
            UI.success('Group applied successfully.').show();
            $('.bt-search').trigger('click')
            confirm.hide()
          }).catch(error => UI.error(error).show());
        }).show()
      } else UI.dialog('No users to revoke group from. Please select user(s) to revoke group from search list.').show();
    })











    $('form[name="form-upload-csv"]').on('submit', e => {
      e.preventDefault();
      var filename = $('input[type=file]#csv-file').val().replace(/C:\\fakepath\\/i, '')
      if (filename.trim().length == 0) {
        UI.dialog('Please select a CSV file containing list of user to create.').show();
        return;
      }
      let confirm = UI.confirm('Upload file and insert user data?').positive(() => {
        confirm.hide();
        var form = $('form[name="form-upload-csv"]')[0];
        var data = new FormData(form);
        var btUpload = $('form[name="form-upload-csv"] .bt-upload-file');
        var uploadLabel = btUpload.html();
        btUpload.prop("disabled", true).html(`Processing... ${UI.spinner()}`);
        var baseurl = Core.inst.config().get('baseurl');
        $.ajax({
          type: "POST",
          enctype: 'multipart/form-data',
          url: `${baseurl}m/x/user/api/uploadUserCSV`,
          data: data,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function (data) {
            btUpload.html(uploadLabel).prop("disabled", false);
            console.log(data);
            if (typeof data == 'object') {
              if (data.error) UI.error(data.error).show();
              else {
                let results = data.coreResult;
                UserApp.populateBatchResult(results);
              }
            } else UI.info(data).show();
          },
          error: function (e) {
            btUpload.html(uploadLabel).prop("disabled", false);
            let error = e.responseText ? e.responseText : "Error occured.";
            UI.error(error).show();
            if (e.statusText == "error") 
              UI.dialog("CSV file has been modified. Please reselect the CSV file and try to upload again.").show();
            $("#result").text();
          }
        });
      }).show();
    });

    $('#upload-csv .bt-help-csv').on('click', e => {
      batchHelpDialog.show();
    });
    










    this.ajax.get('RBACApi/getRoles').then(roles => UserApp.populateRoles(roles))
    this.ajax.get('RBACApi/getGroups').then(groups => UserApp.populateGroups(groups))

    let dp = $('#input-search-date').datepicker({
      todayBtn: "linked",
      todayHighlight: true,
      format: 'yyyy-mm-dd',
      immediateUpdates: true,
      autoclose: true
    }).datepicker("setDate", "now").on('changeDate', function(e) {
      $('#input-use-date').prop("checked", true)
    });


    $('.bt-search').trigger('click')

  }

  static populateBatchResult(results) {
    let resHtml = "";
    for (let res of results) {
      // console.log(res);
      if (res.status == "OK")
        resHtml += `<div class="my-2">${res.data.name} (<code>${res.username}</code>) <i class="bi bi-check-square-fill text-success"></i></div>`;
      else {
        resHtml += `<div class="my-2">${res.data.name} (<code>${res.username}</code>) <i class="bi bi-exclamation-triangle-fill text-warning"></i>`
        resHtml += `<div class="errors my-2 alert alert-danger">`;
        for (let e of res.errors) {
          resHtml += `<div class="error pb-2">${e}</div>`
        }
        resHtml += `</div>`;
        resHtml += `</div>`;
      }
    }
    if (!results.length) resHtml = "No users to create in the uploaded CSV file.";
    $('#upload-csv .batch-result').html(resHtml);
  }
}

UserApp.populateUsers = users => {
  let usersHtml = '';
  let selected = UserApp.inst.selectedUsernames;
  users.forEach(user => { 
    let checked = selected && selected.includes(user.username) ? 'checked' : '';
    usersHtml += `<div class="user-item d-flex align-items-center py-1 border-bottom" role="button"`
    usersHtml += `  data-username="${user.username}" data-name="${user.name}">`
    usersHtml += `  <input type="checkbox" class="cb-user ms-1" data-username="${user.username}" ${checked}>`
    usersHtml += `  <span class="flex-fill ps-2 user-truncate user-nowrap">`
    usersHtml += `  <span>${user.name}</span>`
    usersHtml += `  <span class="px-2 ms-2 badge rounded-pill bg-warning text-dark">${user.username}</span>`
    // usersHtml += `  <span class="badge rounded-pill bg-secondary px-2">${user.created}</span>`

    if (user.roles) user.roles.split(',').forEach(role => {
        usersHtml += `  <span class="badge rounded-pill bg-primary px-2">${role}</span>`
      }) 

    if (user.groups) user.groups.split(',').forEach(group => {
        usersHtml += `  <span class="badge rounded-pill bg-success px-2">${group}</span>`
      })

    usersHtml += `  </span>`
    usersHtml += `  <span class="text-end text-nowrap ms-3">`
    usersHtml += `    <button class="btn btn-sm btn-secondary bt-detail"><i class="bi bi-journal-text"></i></button>`
    usersHtml += `    <button class="btn btn-sm btn-warning bt-edit"><i class="bi bi-pencil"></i></button>`
    usersHtml += `    <button class="btn btn-sm btn-danger bt-delete"><i class="bi bi-trash"></i></button>`
    usersHtml += `  </span>`
    usersHtml += `</div>`
  });
  if (usersHtml.length == 0) usersHtml = '<em class="d-block m-3 user-muted">No users found in current search.</em>';
  $('#list-user').html(usersHtml)
}

UserApp.populatePagination = (count, page, perpage) => {
  let paginationHtml = ''
  let maxpage = Math.ceil(count/perpage); // console.log(count, page, maxpage)
  if (count) {
    paginationHtml += `<li class="page-item${page == 1 ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-prev" href="#" tabindex="-1" aria-disabled="true">Previous</a>`
    paginationHtml += `</li>`

    let min = page - 2 < 1 ? 1 : page - 2
    let max = page + 2 > maxpage ? maxpage : page + 2

    for(let p = min; p <= max; p++) {
      paginationHtml += `<li class="page-item${page == p ? ' disabled': ''}"><a class="page-link pagination-page" data-page="${p}" href="#">${p}</a></li>`
    }

    paginationHtml += `<li class="page-item${page == maxpage ? ' disabled': ''}">`
    paginationHtml += `  <a class="page-link pagination-next" href="#">Next</a>`
    paginationHtml += `</li>`
  }
  $('#pagination-user').html(paginationHtml)
}

UserApp.populateUserDetail = user => { console.log(user)
  let userDetailHtml = '';

  let content = user.content 
    ? new showdown.Converter({}).makeHtml(user.content) 
    : '<em class="user-muted">This user has no content.</em>'

  userDetailHtml += `<span class="user-name h4 user-primary">${user.name}</span>`
  userDetailHtml += `<div class="align-middle"><span class="badge rounded-pill bg-warning user-dark px-3">${user.username}</span>`
  userDetailHtml += ` <span class="badge rounded-pill bg-secondary mx-1 px-3">Created on: ${user.created}</span>`
  userDetailHtml += ` <code class="mx-1">${user.password}</code>`
  userDetailHtml += `</div>`
  userDetailHtml += `<hr>`
  userDetailHtml += `<div>Assigned Groups:`
  userDetailHtml += user.groups.length ? `<br>`:`<span class="badge rounded-pill bg-danger ms-2">No group assigned</span>`
  user.groups.forEach(group => {
    userDetailHtml += `<span class="badge rounded-pill bg-success me-1">${group.name}</span>`
  })
  userDetailHtml += `</div>`
  userDetailHtml += `<hr>`
  userDetailHtml += `<div>Assigned Roles:`
  userDetailHtml += user.roles.length ? `<br>`:`<span class="badge rounded-pill bg-danger ms-2">No role assigned</span>`
  user.roles.forEach(role => {
    userDetailHtml += `<span class="badge rounded-pill bg-primary me-1">${role.name}</span>`
  })
  userDetailHtml += `</div>`

  $('#user-detail-dialog .detail-content').html(userDetailHtml);

}

UserApp.populateRoles = roles => {
  $('#input-rid').find('option').not("[default]").remove()
  $('#apply-rid').find('option').not("[default]").remove()
  let rolesHtml = ''
  roles.forEach(role => {
    rolesHtml += `<option value="${role.rid}" data-name="${role.name}">`
    rolesHtml += `${role.name}`
    rolesHtml += `</option>`
  })
  $('#input-rid').append(rolesHtml)
  $('#apply-rid').append(rolesHtml)
}

UserApp.populateGroups = groups => {
  $('#input-gid').find('option').not("[default]").remove()
  $('#apply-gid').find('option').not("[default]").remove()
  let groupsHtml = ''
  groups.forEach(group => {
    groupsHtml += `<option value="${group.gid}" data-name="${group.name}">`
    groupsHtml += `${group.name}`
    groupsHtml += `</option>`
  })
  $('#input-gid').append(groupsHtml)
  $('#apply-gid').append(groupsHtml)
}

$(() => {
  UserApp.inst = UserApp.instance()
})