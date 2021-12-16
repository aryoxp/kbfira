$(() => {

  $('.bt-toast').on('click', (e) => {
    // $.toast('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.', {type: 'info', delay: 0})
    // $.toast('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.', {type: 'warning', delay: 0})
    // $.toast('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.', {type: 'danger', delay: 1000})
    // $.toast('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.', {type: 'success', delay: 0})
    // $.toast('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.', {type: 'primary', delay: 0})
    // KBUI.error('Sapiku lari gagah berani. Larinya kencang sekali. Supaya tidak kesandung lagi.').toast({delay: 1500})
    // KBUI.toast('Sapiku lari gagah berani, kalau lari kencang sekali, supaya tidak kesandung lagi.', {delay: 2000, type: 'plain'});
    // KBUI.toast('Sapiku lari gagah berani, kalau lari kencang sekali, supaya tidak kesandung lagi.', {delay: 2000});
    
    // Dialog.instance('Hello! Sapiku lari gagah berani, kalau lari kencang sekali, supaya tidak kesandung lagi.').positive(() => {
    //   console.warn('pos')
    // }).negative(() => {
    //   console.error('neg')
    // }).toggle()

  //  let confirm = UI.confirm(
  //    "Hello! Sapiku lari gagah berani, kalau lari kencang sekali, supaya tidak kesandung lagi?"
  //  )
  //    .positive((e) => {
  //      console.warn("pos", this, e, confirm);
  //      confirm.hide();
  //    })
  //    .negative((e) => {
  //      console.error("neg", this, e, confirm);
  //      confirm.hide();
  //    })
  //    .emphasize()
  //    .show({ toggle: true });
  
  // UI.dialog('Hello!').title('Title Sapi Lari').emphasize().show()
  let dialog = UI.dialog('Hello!').emphasize().show()
  UI.success("OK").toast({delay: 0})
  // let loading = UI.loading().show({backdrop: true})
  // loading.hide();
  setTimeout(() => {
    dialog.hide()
    // loading.hide()
  }, 3000)
  })

})