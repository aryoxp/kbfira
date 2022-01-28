class ProfileApp {
  constructor(options) {
    this.settings = Object.assign({}, options);
    this.ajax = Core.instance().ajax();
    this.session = Core.instance().session();
    this.handleEvent(this);
  }
  static instance(options) {
    return new ProfileApp(options)
  }
  handleEvent() {
    $('form.form-user-profile').on('submit', (e) => {
      e.preventDefault();
      let name = $('#input-user-name').val().trim();
      let username = $('#input-user-username-current').val().trim();
      
      if (name.length == 0) {
        $('#input-user-name').addClass('is-invalid');
        return;
      } else $('#input-user-name').removeClass('is-invalid');

      this.ajax.post('RBACApi/updateUserProfile', {
        username: username,
        name: name
      }).then(user => {
        console.log(user);
        this.session.set('user', user).then(() => {
          UI.success('User profile has been updated.').show();
        })
      }).catch(error => UI.error(error).show());
    });

    $('form.form-change-password').on('submit', (e) => {
      e.preventDefault();
      let password = $('#input-user-password').val().trim();
      let passwordCurrent = $('#input-user-password-current').val().trim();
      let passwordRepeat = $('#input-user-password-repeat').val().trim();
      let username = $('#input-user-username-current').val().trim();

      if (password.length == 0) {
        $('#input-user-password').addClass('is-invalid');
        $('#validation-password').html('Password cannot be empty.');
        return;
      } else $('#input-user-password').removeClass('is-invalid');

      if (password !== passwordRepeat) {
        $('#input-user-password').addClass('is-invalid');
        $('#input-user-password-repeat').addClass('is-invalid');
        $('#validation-password').html('Both New Password and Password (Repeat) must be the same.');
        $('#validation-password-repeat').html('Both New Password and Password (Repeat) must be the same.');
        return;
      } else {
        $('#input-user-password').removeClass('is-invalid');
        $('#input-user-password-repeat').removeClass('is-invalid');
      }

      this.ajax.post('RBACApi/changeUserPassword', {
        username: username,
        password: password,
        currentPassword: passwordCurrent
      }).then(user => {
        UI.success('Password has been changed successfully.').show();
      }).catch(error => UI.error(error).show());
    });
  }
}

$(() => {
  ProfileApp.instance()
});
