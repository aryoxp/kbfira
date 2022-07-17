class KitBuildCollab {
  constructor(namespace, user, canvas, options) {
    console.log("COLLAB INSTANTIATED", options);
    this.namespace = namespace
    this.user = user
    this.canvas = canvas;
    this.settings = Object.assign({
      host: 'http://localhost',
      port: 3000
    }, options)

    this.eventListeners = new Set();

    KitBuildCollab.render();
    KitBuildCollab.enableControl(false)
    // cache for currently joined rooms: [{name, type},...]
    KitBuildCollab.rooms = new Map()
    KitBuildCollab.publishedRooms = new Map()
    KitBuildCollab.room = () => {
      for(let room of KitBuildCollab.rooms.values()) {
        if (room.type == 'personal') return room
      }; return null
    }
    KitBuildCollab.typingTimeout = new Map();
    KitBuildCollab.unreadChannelMessageCount  = 0;

    if (!this.user) {
      console.error('Collaboration control does not have user information set.')
      return;
    }

    this.tools = new Map();
    
    this.tools.set('chat', new CollabChatTool(this))
    this.tools.set('channel', new CollabChannelTool(this))



    // Append tools and render
    this.tools.forEach(tool => {
      let toolHtml = tool.render();
      $(toolHtml).insertAfter("#dd-connection-menu");
      tool.handleUIEvent()
    })

    this.handleUIEvent()
    this.on('event', this.onCollabEvent.bind(this))
    
    KitBuildCollab.isOnline(this.namespace, this.settings).then(result => {}, error => {});
    KitBuildCollab.handleRefresh(this)

  }
  static instance(namespace, user, canvas, options) {
    return new KitBuildCollab(namespace, user, canvas, options)
  }

  static isOnline(namespace = '', options) {
    let settings = Object.assign({
      host: 'http://localhost',
      port: 3000
    }, options)
    return new Promise((resolve, reject) => {
      const checkSocket = io(`${settings.host}:${settings.port}/${namespace}`, {
        reconnection: false
      });
      checkSocket.on("disconnect", () => 
        console.warn("Check socket has been disconnected"))
      checkSocket.on("connect", () => {
        console.warn("Server is ONLINE", checkSocket.id);
        checkSocket.disconnect();
        resolve(true);
      });
      checkSocket.io.on("error", (error) => { //console.warn("ERR", error);
        $('#connection-status-reason').html(error);
        if(error == "Error: xhr poll error") checkSocket.io.disconnect();
        reject(error);
      });
    })
  }

  connected() {
    return this.socket && this.socket.connected
  }

  connect() {
    if (!this.user || !this.user.username || !this.user.name) {
      console.error('Collaboration control does not have user information set.')
      return
    }
    const socket = io(`${this.settings.host}:${this.settings.port}/${this.namespace}`);
    if (!this.socket) {
      socket.io.on("error", (error) => { // console.warn(error);
        $('#connection-status-reason').html(error);
        if(error == "Error: xhr poll error") socket.io.disconnect();
      });
    }
    this.socket = socket; // console.warn(socket, this.namespace);
    localStorage.debug = '*';
    this.handleSocketEvent(socket);
    this.broadcastEvent('connect', socket)
  }

  disconnect() {
    if (this.socket && this.socket.connected) {

      this.socket.disconnect()
      this.broadcastEvent('disconnect')
    }
  }

  handleSocketEvent(socket) {

    socket.onAny((e, ...args) => { // console.log(e, args)
    })

    socket.on("connect", () => {
      console.warn("CONNECTED", socket.id);
      KitBuildCollab.updateSocketConnectionStatus(socket);

      // register user at server 
      // this.broadcastEvent(this.isReconnect ? 'reconnect' : 'connect', socket);
      socket.emit('register-user', socket.id, this.user, status => { // console.log('REGISTER', status);
        if (status === true) {
          KitBuildCollab.getRoomsOfSocket(socket)
          KitBuildCollab.getPublishedRoomsOfGroups(this.user.groups, socket)
          this.broadcastEvent(`socket-${this.isReconnect ? 'reconnect' : 'connect'}`, socket)
        } else UI.error(`Unable to register user: ${status}`).show()
      });

    });

    socket.io.on("reconnect", (attempt) => {
      console.warn("RECONNECTED", attempt, socket.id);
      this.isReconnect = true;
    });

    socket.on("disconnect", (reason) => {
      console.warn("DISCONNECTED Socket ID:", socket.id, "Reason:", reason); // undefined
      KitBuildCollab.updateSocketConnectionStatus(socket);
      this.isReconnect = false;
      switch(reason) {
        case 'io client disconnect': break; // manual disconnect
        case 'transport close': break; // server crash/stop
      }
      this.broadcastEvent('socket-disconnect', socket, reason)
    });

    socket.on("user-join-room", (user, room) => {
      KitBuildCollab.getPublishedRoomsOfGroups(this.user.groups, socket);
      KitBuildCollab.getRoomsOfSocket(socket)
      this.broadcastEvent('socket-user-join-room', user, room)
    })

    socket.on("user-leave-room", (user, room) => {
      KitBuildCollab.getPublishedRoomsOfGroups(this.user.groups, socket);
      KitBuildCollab.getRoomsOfSocket(socket)
      this.broadcastEvent('socket-user-leave-room', user, room)
    })

    socket.on("command", (command, compressedData) => {
      let data = Core.decompress(compressedData);
      this.broadcastEvent('socket-command', command, ...data)
      switch(command) {
        case 'update-concept':
        case 'update-link':
        case 'redo-update-link':
        case 'redo-update-concept':
        case 'undo-update-link':
        case 'undo-update-concept':
          // something happened to a particular node, then...
          KitBuildCollab.updateChannelList(this.canvas)
          break;
      }
    })

    socket.on("get-map-state", (requesterSocketId) => {
      this.broadcastEvent('socket-get-map-state', requesterSocketId)
    })

    socket.on("set-map-state", (mapState) => {
      this.broadcastEvent('socket-set-map-state', mapState)
    })
  }


  on(what, listener) {
    switch(what) {
      case 'event': this.eventListeners.add(listener); break;
    }
    return this;
  }

  off(what, listener = null) {
    switch(what) {
      case 'event': {
        if (listener === null) this.eventListeners.clear()
        else this.eventListeners.delete(listener);
      } break;
    }
    return this;
  }
  
  broadcastEvent(evt, ...data) {
    this.eventListeners.forEach(listener => {
      if (typeof listener == 'function')
        listener(evt, ...data)
    })
    return this;
  }

  command(command, ...data) {
    return new Promise((resolve, reject) => { // console.log(KitBuildCollab.rooms);
      if (!KitBuildCollab.room()) {
        reject("Not connected to room.");
        return
      }
      // console.warn(command, data);
      let compressedData = Core.compress(data);
      this.socket.emit("command", KitBuildCollab.room().name, command, compressedData, (result) => {})
    });
  }

  getMapState() {
    return new Promise((resolve, reject) => {
      if (!KitBuildCollab.room()) {
        reject("Not connected to room.");
        return
      }
      this.socket.emit("get-map-state", KitBuildCollab.room().name, (result) => {
        if (result !== true) {
          console.error(result, KitBuildCollab.room().name)
          return
        }
      })
    })
  }

  sendMapState(requesterSocketId, mapState) {
    return new Promise((resolve, reject) => {
      if (!KitBuildCollab.room()) {
        reject("Not connected to room.");
        return
      }
      this.socket.emit("send-map-state", requesterSocketId, mapState, (result) => {})
    })
  }

  onCollabEvent(evt, ...data) { 
    // store and restore collab state on refresh
    switch(evt) {
      case 'join-room':
      case 'create-room': {
        if (!data[0]) break;
        let room = data[0].split("/").pop()
        window.localStorage.setItem(`collab-${this.namespace}-room`, room)
      } break;
      case 'leave-room': {
        window.localStorage.removeItem(`collab-${this.namespace}-room`)
      } break;
      case 'connect': {
        window.localStorage.setItem(`collab-${this.namespace}-connected`, true)
      } break;
      case 'disconnect': {
        window.localStorage.removeItem(`collab-${this.namespace}-connected`)
        window.localStorage.removeItem(`collab-${this.namespace}-room`)
      } break;
      case 'socket-reconnect':
      case 'socket-connect': {
        let room = window.localStorage.getItem(`collab-${this.namespace}-room`)
        if (!room) break; // it was just connected, but not joined to any rooms
        let prefix = this.namespace == `cmap` ? `PC` : `PK`
        room = `${prefix}/${room}`;
        this.joinRoom(room, this.user).then(() => {
          this.broadcastEvent('join-room', room)
        }).catch(error => UI.error("Error: " + error).show())
      } break;
    }
  }

  addTool(id, tool) {
    this.tools.set(id, tool)
  }
  removeTool(id) {
    this.tools.delete(id)
  }
 
  static render() {
    let collabControlHtml = `<div id="collab-control" class="btn-group btn-group-sm dropup me-2">
      <button id="dd-connection" type="button" class="dd bt-connection-status btn btn-warning dropdown-toggle" data-bs-toggle="dropdown"  data-bs-auto-close="outside" data-bs-offset="0,10" aria-expanded="false">
        <i class="bi bi-plug-fill"></i>
      </button>
      <ul id="dd-connection-menu" class="dropdown-menu dropdown-menu-end scroll-y py-2" style="max-height: 300px;">
        <li><a class="dropdown-item d-flex align-items-center" href="#">
          <span id="notification-connection" class="p-2 badge rounded-pill bg-danger me-2">
            <span class="visually-hidden">New alerts</span>
          </span>
          <span id="connection-status-text">Server is online</span>
          </a>
          <div class="text-center text-danger"><em id="connection-status-reason"></em></div>
          </li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item d-flex align-items-center" href="#">
          <span id="notification-app-connection" class="p-2 badge rounded-pill bg-danger me-2">
            <span class="visually-hidden">New alerts</span>
          </span>
          <span id="app-connection-status-text">App is disconnected</span></a>
          <small class="mx-auto d-block text-center"><code id="notification-app-socket-id"></code></small>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="bt-connect dropdown-item" href="#"><i class="bi bi-plug-fill text-success"></i> Connect</a></li>
        <li><a class="bt-disconnect dropdown-item disabled" href="#"><i class="bi bi-plug-fill text-danger"></i> Disconnect</a></li>
      </ul>
      <button id="dd-room" type="button" class="dd btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="false" data-bs-offset="0,15" aria-expanded="false">
        <i class="bi bi-people-fill"></i>
        <span id="notification-room" class="position-absolute top-0 start-100 translate-middle p-2 badge rounded-pill bg-danger" style="display: none;">
          <span class="visually-hidden">New alerts</span>
        </span>
      </button>
      <ul id="dd-room-menu" class="dropdown-menu">
        <li class="px-3 mb-1 d-flex justify-content-between align-items-center flex-nowrap"><span class="me-3 text-nowrap text-dark">Connected Rooms</span><span class="badge rounded-pill bg-primary bt-refresh-rooms" role="button">Refresh</span></li>
        <li class="room-list bg-light"><em class="d-block text-muted text-center p-1">No Rooms</em></li>
        <li><hr class="dropdown-divider"></li>
        <li class="published-room-list"><em class="d-block text-muted text-center p-1">No Rooms</em></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item bt-create-room" href="#"><i class="bi bi-plus-lg me-2"></i> Create Room</a></li>
        <li class="px-2 pt-2 d-none bg-light">
          <form class="create-room input-group input-group-sm">
            <input type="text" class="form-control" id="input-room-name">
            <button type="text" class="bt-create btn btn-primary"><i class="bi bi-plus-lg"></i> Create</button>
          </form>
        </li>
      </ul>
    </div>`;
    $('#collab-control').remove();
    $('.status-control').append(collabControlHtml);
  }

  static enableControl(enabled = true) {
    $('#collab-control button').attr('disabled', !enabled)
  }

  handleUIEvent() {
    // Allow only single dropdown open
    $('.dd[data-bs-toggle="dropdown"]').on('show.bs.dropdown', (e) => { 
      $('.dd[data-bs-toggle="dropdown"]').not(e.currentTarget).dropdown('hide')

      switch($(e.currentTarget).attr('id')) {
        case 'dd-connection': {
          $('#notification-connection').addClass('bg-warning').removeClass('bg-danger bg-success')
          $('#connection-status-text').html('Checking...')
          KitBuildCollab.isOnline(this.namespace, this.settings).then(online => {
            $('#connection-status-text').html('Server is online')
            $('#notification-connection').addClass('bg-success').removeClass('bg-danger bg-warning')
          }).catch(error => {
            $('#connection-status-text').html('Server is offline')
            $('#notification-connection').addClass('bg-danger').removeClass('bg-success bg-warning')
          })
          this.broadcastEvent(`check-server`)
        } break;
      }
    })

    // Connection
    $('#dd-connection-menu .bt-connect').on('click', (e) => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect()
        this.broadcastEvent('connect', this.socket)
      }
      if (!this.socket) this.connect()
    })
    $('#dd-connection-menu .bt-disconnect').on('click', (e) => {
      if (this.socket && this.socket.connected) this.disconnect()
    })

    // Room
    $('#dd-room').on('click', (e) => {
      setTimeout(() => $('#notification-room').hide(), 200)
    })
    $('#dd-room-menu .bt-create-room').on('click', (e) => {
      $('form.create-room').parent('li').toggleClass('d-none')
    })
    $('#dd-room-menu .bt-refresh-rooms').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (!this.socket || !this.socket.connected) {
        UI.error("Socket is not connected.").show()
        return
      }
      KitBuildCollab.getRoomsOfSocket(this.socket)
      UI.info("Joined room list refreshed.").show()
      this.broadcastEvent('manual-refresh-rooms')
    })
    $('#dd-room-menu .room-list').on('click', '.bt-leave', (e) => {
      e.preventDefault()
      e.stopPropagation()
      let name = $(e.currentTarget).siblings('a.room').attr('data-name')
      let confirm = UI.confirm(`Do you want to leave this room: <span class="text-danger">${name}</span>?<br>Your concept mapping activity will no longer synchronized.`).positive(() => {
        if (this.socket && this.socket.connected)
          this.socket.emit('leave-room', name, () =>
            KitBuildCollab.getRoomsOfSocket(this.socket))
        confirm.hide()
        this.broadcastEvent('leave-room', name)
      }).show()
    })
    $('#dd-room-menu .published-room-list').on('click', '.bt-join', (e) => {
      let room = $(e.currentTarget).attr('data-name');
      if (KitBuildCollab.rooms.has(room)) {
        UI.warning(`You have already in room: ${room}`).show()
        return
      }
      let confirm = UI.confirm(`Join room: <span class="text-primary">"${room}"</span>?<br>Your active session working data will be synchronized.`).positive(() => {
        this.joinRoom(room, this.user).then(() => {
          confirm.hide();
          this.broadcastEvent('join-room', room)
        }).catch(error => UI.error("Error joining room: " + error).show())
      }).show();
    });
    $('#dd-room-menu form.create-room').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      let roomName = $('#input-room-name').val().trim() // console.log(roomName)
      if (!this.socket || !this.socket.connected) {
        UI.warning(`Cannot create room: <code>${roomName}</code>. You are not connected to the collaboration server.`).show()
        return
      }
      if (!roomName.length) {
        UI.warning(`Cannot create room with empty name.`).show()
        return
      }
      this.socket.emit('create-room', roomName, (rooms) => { // console.log(rooms)
        if (!rooms || typeof rooms == 'string') {
          UI.error(`Cannot create room: <code>${roomName}</code>. ${rooms}`).show()
          return
        }
        $('form.create-room').parent('li').addClass('d-none')
        KitBuildCollab.getRoomsOfSocket(this.socket)
        let prefix = this.namespace == `cmap` ? `PC` : `PK`
        this.broadcastEvent('create-room', `${prefix}/${roomName}`)
      })
    })


  }


  // Socket Connection
  static updateSocketConnectionStatus(socket) {
    if (!socket.connected) {
      $('#notification-app-connection').addClass('bg-danger').removeClass('bg-success').attr('title', '')
      $('#notification-app-socket-id').html('')
      $('#app-connection-status-text').html('App is not connected')
      $('#dd-connection-menu .bt-connect').removeClass('disabled')
      $('#dd-connection-menu .bt-disconnect').addClass('disabled')
      $('#dd-connection').removeClass('btn-outline-success').addClass('btn-warning')
    } else {
      $('#notification-app-connection').addClass('bg-success').removeClass('bg-danger').attr('title', socket.id)
      $('#notification-app-socket-id').html(socket.id)
      $('#app-connection-status-text').html('App is connected')
      $('#dd-connection-menu .bt-connect').addClass('disabled')
      $('#dd-connection-menu .bt-disconnect').removeClass('disabled')
      $('#dd-connection').addClass('btn-outline-success').removeClass('btn-warning')
    }
  }


  // Room
  static updateRoomNotificationBadge() {
    if (!$('#dd-room-menu').is(':visible')) {
      $('#notification-room').show()
    } else $('#notification-room').hide()
  }

  static getPublishedRoomsOfGroups(groups, socket) {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject("Invalid socket.")
        return
      } 
      if (!Array.isArray(groups)) groups = groups.split(",")
      socket.emit("get-rooms-of-groups", groups, (rooms) => {
        KitBuildCollab.publishedRooms.clear();
        if (rooms) rooms.forEach(room =>
          KitBuildCollab.publishedRooms.set(room.name, room));
        KitBuildCollab.populatePublishedRoomList();
        CollabChatTool.updateChatRoomName();
        resolve(rooms);
      });
    });

  }

  static getRoomsOfSocket(socket) {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject("Invalid socket.")
        return
      } 
      socket.emit('get-rooms-of-socket', rooms => {
        KitBuildCollab.rooms = new Map(rooms.map(i => [i.name, i]));
        KitBuildCollab.populateRoomList(rooms);
        KitBuildCollab.updateRoomNotificationBadge();
        CollabChatTool.updateChatRoomName();
        resolve(rooms);
      });
    })
  }

  static populateRoomList(rooms) {
    let roomsHtml = rooms.length ? '' : `<em class="d-block text-muted text-center">No Rooms</em>`;
    rooms.forEach(room => {
      let color = room.type == "group" ? `text-muted` : `text-primary`
      let bg = room.type == "group" ? `bg-warning text-dark` : `bg-primary`
      let dd = (room.type == "personal") ? `data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false"` : ``
      if (room.type == "personal")
        roomsHtml += `<span class="dropstart">`

      roomsHtml += `<span class="dropdown-item d-flex justify-content-between align-items-center me-3" ${dd}>`
      roomsHtml += `<a class="text-decoration-none room ${color}" href="#" data-name="${room.name}" data-type="${room.type}">`
      
      let usersCount = room.users ? room.users.length : 0

      if (room.type == "personal"){
        roomsHtml += `<span><i class="bi bi-chevron-left me-2"></i> ${room.name}</span>`;
        roomsHtml += `<span class="badge rounded-pill ms-2 ${bg}"><i class="bi bi-people-fill"></i> ${usersCount}</span>`;
      } else roomsHtml += `<span>${room.name}</span>`;
      
      
      roomsHtml += `</a>`;

      if (room.type == "personal")
        roomsHtml += `<span href="#" class="bt-leave badge rounded-pill bg-danger" role="button">Leave</span>`
      else roomsHtml += `<span class="badge rounded-pill ms-2 ${bg}"><i class="bi bi-people-fill"></i> ${usersCount}</span>`;
      
      roomsHtml += `</span>`
      if (room.type == "personal" && room.users && room.users.length) {
        roomsHtml += `<ul class="dropdown-menu">`
        room.users.forEach(user => {
          roomsHtml += `<li><a class="dropdown-item" href="#">${user.name}</a></li>`
        })
        roomsHtml += `</ul>`
      }
      if (room.type == "personal") roomsHtml += `</span>`
    });
    $('#dd-room-menu .room-list').html(roomsHtml);
  }

  static populatePublishedRoomList() {
    let roomsHtml = KitBuildCollab.publishedRooms.size ? '' : `<em class="d-block text-muted text-center">No Rooms</em>`;
    KitBuildCollab.publishedRooms.forEach(room => { // console.log(room)
      roomsHtml += `<a class="dropdown-item room bt-join" href="#" data-name="${room.name}" data-type="${room.type}">`
      roomsHtml += `<span>${room.name}</span>`;
      roomsHtml += `<span class="badge rounded-pill ms-2 bg-primary"><i class="bi bi-people-fill"></i> ${room.users?.length}</span>`;
      roomsHtml += `</a>`;
    });
    $('#dd-room-menu .published-room-list').html(roomsHtml);
  }

  joinRoom(room, user) {
    return new Promise((resolve, reject) => {
      this.socket.emit('join-room', room, rooms => {
        if (typeof rooms == 'string') {
          reject(rooms)
          return
        }
        let promises = []
        promises.push(KitBuildCollab.getRoomsOfSocket(this.socket))
        let chatTool = this.tools.get('chat');
        if (chatTool)
          promises.push(chatTool.getAndBuildRoomMessages(room, user))
        Promise.all(promises).then(result => resolve(result))
      })
    })
  }









  static handleRefresh(collab) {
    let connected = window.localStorage.getItem(`collab-${collab.namespace}-connected`)
    console.error("CONNECT BY PREVIOUS STATE")
    if (connected) collab.connect()
  }
}























class CollabTool extends KitBuildCanvasTool {
  constructor(collab, options) {
    super(collab.canvas, options);
  }
  render() { return '' }
  handleUIEvent() {}
}

class CollabChannelTool extends CollabTool {
  constructor(collab, options) {    
    super(collab, Object.assign({
      showOn: KitBuildCanvasTool.SH_LINK | KitBuildCanvasTool.SH_CONCEPT,
      bgColor: "#FFFFFF",
      color: "#22BA73",
      gridPos: { x: 0, y: -1 },
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-square-quote-fill" viewBox="-5 -5 26 28"><path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM7.194 6.766a1.688 1.688 0 0 0-.227-.272 1.467 1.467 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 5.734 6C4.776 6 4 6.746 4 7.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.461 2.461 0 0 0-.227-.4zM11 9.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.466 2.466 0 0 0-.228-.4 1.686 1.686 0 0 0-.227-.273 1.466 1.466 0 0 0-.469-.324l-.008-.004A1.785 1.785 0 0 0 10.07 6c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z"/></svg>'
    }, options))
    this.collab = collab;
    this.canvas = collab.canvas;
    this.socket = collab.socket; // WARNING! possibility null
    this.canvas.canvasTool.addTool("channel-tool", this)
    this.collab.on('event', this.onCollabEvent.bind(this));
    this.shouldBlink = false
    
    CollabChannelTool.channels = new Map();
  }

  action(event, e, node) { console.log(event, e, node)
    if (!node) return
    if (!this.socket || !this.socket.connected) {
      UI.error("Socket is not connected.").show()
      return
    }
    if (!KitBuildCollab.room()) {
      UI.warning("Please join a room.").show()
      return
    }
    this.setNode(node)
    this.showChannel(node.id());
    this.channelDialog.show()
    this.getAndBuildChannelMessages(KitBuildCollab.room().name, node.id())
      .catch(error => {
        UI.error("Unable to get channel messages.").show()
        console.error(error)
      })
    CollabChannelTool.updateChannelChatRoomNotificationBadge()
  }

  render() {
    this.renderDialog()
    return `<button id="dd-channel" type="button" class="dd btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"  data-bs-auto-close="outside" data-bs-offset="40,15" aria-expanded="false">
      <i class="bi bi-chat-square-quote-fill"></i>
      <span id="notification-channel" class="position-absolute translate-middle badge rounded-pill bg-danger" style="display: none;">
        <span class="count">99+</span>
        <span class="visually-hidden">New alerts</span>
      </span>
    </button>
    <ul id="dd-channel-menu" class="dropdown-menu scroll-y py-2" style="max-height: 300px;">
      <li class="d-flex justify-content-between align-items-center px-3 py-1"><span class="text-primary">Channel</span><span class="badge rounded-pill bg-primary bt-refresh-channel ms-5" role="button">Refresh</span></li>
      <li class="channel-list"></li>
    </ul>`;
  }

  renderDialog() {
    let channelDialogHtml = `<div id="collab-channel" class="card d-none">
        <div class="card-header d-flex align-items-center">
          <div class="text-muted drag-handle flex-fill">Channel: <span class="channel-name text-primary">Channel Name</span></div>
          <span><a class="bt-close" href="#"><i class="bi bi-x-lg text-dark"></i></a></span>
        </div>
        <div class="card-body p-2 d-flex flex-column position-relative" style="height: 100%;">
          <div class="border rounded mb-2 scroll-y pt-1 flex-fill" style="height: 10px;" id="channel-chat-list"></div>
          <form class="channel-chat" name="chat" autocomplete="off">
            <div class="input-group input-group-sm mb-2">
              <input type="text" class="form-control" id="input-channel-message" placeholder="Type Message..." aria-label="Type Message..." aria-describedby="button-send-message">
              <button class="btn btn-primary" id="bt-send-channel-message"><i class="bi bi-send"></i> Send</button>
              <button class="btn btn-sm resize-handle" type="button" style="cursor: nwse-resize;"><i class="bi bi-arrows-angle-expand"></i></button>
            </div>
          </form>
        </div>
      </div>`;
    $('#collab-channel').remove()
    $('body').append(channelDialogHtml);
  }

  blink() {
    if (this.shouldBlink) return;
    this.shouldBlink = setInterval(() => {
      // console.log("tick", CollabChannelTool.channels)
      CollabChannelTool.channels.forEach((channel, nodeId) => {
        if (channel.unread)
          this.canvas.cy.nodes(`#${nodeId}`).toggleClass(`notify`)
        else this.canvas.cy.nodes(`#${nodeId}`).removeClass(`notify`)
      })
      let unread = false
      for(let channel of CollabChannelTool.channels.values()){
        if (channel.unread) { unread = true; break; }
      }
      if (!unread) { // all channels have been read
        clearInterval(this.shouldBlink)
        this.shouldBlink = false;
      }
    }, 1000)
  }

  setNode(node) {
    this.node = node.json();
    $('#collab-channel .channel-name').html(this.node.data.label)
  }

  getChannels() {
    return new Promise((resolve, reject) => {
      if (!KitBuildCollab.room()) {
        reject("Not connected to room.");
        return
      }
      this.socket.emit("get-channels-of-room", 
        KitBuildCollab.room().name, 
        (channels) => {
          channels.forEach(channel => {
            if (!CollabChannelTool.channels.has(channel)) {
              let label = this.canvas.cy.nodes(`#${channel}`).data('label')
              CollabChannelTool.channels.set(channel, {
                cid: channel,
                label: label,
                unread: 0
              })
            }
          })
          resolve(channels)
        })
    })
  }

  showChannel(nodeId) {
    this.canvas.cy.nodes(`#${nodeId}`).removeClass('notify');
    this.channel = CollabChannelTool.channels.get(nodeId);
    if (this.channel)
      this.channel.unread = 0;
  }

  handleUIEvent() {
    let collab = this.collab;
    this.channelDialog = UI.modal('#collab-channel', {
      hideElement: '.bt-close',
      backdrop: false,
      draggable: true,
      dragHandle: '.drag-handle',
      resizable: true,
      resizeHandle: '.resize-handle',
      minWidth: 350,
      minHeight: 250,
      width: 350,
      height: 250,
      onShow: () => {
        $('#input-channel-message').focus()
      }
    })
    
    $('form.channel-chat').on('submit', (e) => {
      e.preventDefault()
      let message = $('#input-channel-message')
        .val().trim()
      if (message.length == 0) return
      if (!collab.socket || !collab.socket.connected) {
        UI.error("Cannot send message: Socket is not connected.").show()
        return;
      }
      if (KitBuildCollab.room()) {
        collab.socket.emit('channel-message', {
          when: Date.now() / 1000 | 0,
          type: 'text',
          text: message,
          sender: {
            username: collab.user.username,
            name: collab.user.name,
          }
        }, KitBuildCollab.room().name, this.node.data.id, () => {
          let align = 'text-end'
          let when = new Date((Date.now() / 1000 | 0) * 1e3).toISOString().slice(-13, -5);
          let chatHtml = `<span class="mt-1">`
          chatHtml += ` <span class="card mx-1 mb-1">`
          chatHtml += `   <span class="${align} bg-light border-bottom">`
          chatHtml += `   <small class="text-muted" style="font-size:.75rem">${when}</small>`
          chatHtml += `   <small class="px-1 text-primary" style="font-size:.75rem">${collab.user.name}</small>`
          chatHtml += `   </span>`
          chatHtml += `   <span class="card-body p-1 px-2 ${align}">`
          chatHtml += `   <small class="">${message}</small>`
          chatHtml += `   </span>`
          chatHtml += ` </span>`
          chatHtml += `</span>`
          $('#channel-chat-list').append(chatHtml)
          $("#channel-chat-list").animate({ scrollTop: $("#channel-chat-list")[0].scrollHeight }, 200);
          $('#input-channel-message').val('')
          CollabChannelTool.channels.set(this.node.data.id, {
            cid: this.node.data.id,
            label: this.node.data.label,
            unread: 0
          })
          collab.broadcastEvent('channel-message', message, KitBuildCollab.room().name, this.node.data.id)
        })
      } else UI.error('Unable to send message. No room joined.').show()
    })
    $('#input-channel-message').on('keydown', (e) => {
      if (!collab.socket || !collab.socket.connected) return;
      if (KitBuildCollab.room()) {
        collab.socket.emit('channel-message', {
          when: Date.now() / 1000 | 0,
          type: 'typing',
          sender: {
            username: collab.user.username,
            name: collab.user.name,
          }
        }, KitBuildCollab.room().name, this.node.data.id, () => {})
      }
    })
    $('#dd-channel').on('click', (e) => {
      CollabChannelTool.updateChannelList(this.canvas);
    })
    $('#dd-channel-menu .channel-list').on('click', 'a.channel', (e) => {
      let cid = $(e.currentTarget).attr('data-cid');
      this.setNode(this.canvas.cy.nodes(`#${cid}`));
      this.showChannel(cid);
      this.getAndBuildChannelMessages(KitBuildCollab.room().name, cid)
        .catch(error => {
          UI.error("Unable to get channel messages.").show()
          console.error(error)
        })
      this.channelDialog.show()
      CollabChannelTool.updateChannelList(this.canvas)
    })
  }

  // Channel Message Handler chain
  onCollabEvent(evt, ...data) {
    switch(evt) {
      case 'connect': 
        let socket = data.shift()
        this.socket = socket;
        if (!CollabChannelTool.listener)
          CollabChannelTool.listener = this.onChannelMessage.bind(this);
        socket.off("channel-message", CollabChannelTool.listener)
          .on("channel-message", CollabChannelTool.listener)
      break;
    }
  }
  onChannelMessage(message, nodeId) {
    // console.log(message, nodeId)
    switch(message.type) {
      case 'text': 
        let channel = CollabChannelTool.channels.get(nodeId);
        if (this.node && nodeId == this.node.data.id && $('#collab-channel').is(':visible')) {
          this.onMessageText(message);  
          $("#channel-chat-list").animate({ scrollTop: $("#channel-chat-list")[0].scrollHeight }, 200);
          $(`#channel-chat-list .typing[data-sender="${message.sender.username}"`).remove();
          CollabChannelTool.unreadChannelMessageCount = 0
          if (channel) channel.unread = 0;
        } else {
          CollabChannelTool.unreadChannelMessageCount++;
          if (!channel) {
            CollabChannelTool.channels.set(nodeId, {
              cid: nodeId,
              label: this.canvas.cy.nodes(`#${nodeId}`).data('label'),
              unread: 1
            });
          } else channel.unread++;
          this.canvas.cy.nodes(`#${nodeId}`).addClass('notify')
          this.blink()
        }
        CollabChannelTool.updateChannelChatRoomNotificationBadge()
        CollabChannelTool.updateChannelList(this.canvas)
        break;
      case 'typing': 
        this.onMessageTyping(message, nodeId); 
        break;
      default: console.log(message);
    }
  }
  onMessageText(message, align = 'text-start') {
    let when = new Date(message.when * 1e3).toISOString().slice(-13, -5);
    let chatHtml = `<span class="mt-1">`
    chatHtml += ` <span class="card mx-1 mb-1">`
    chatHtml += `   <span class="${align} bg-light border-bottom">`
    chatHtml += `   <small class="px-1 text-primary" style="font-size:.75rem">${message.sender.name}</small>`
    chatHtml += `   <small class="text-muted" style="font-size:.75rem">${when}</small>`
    chatHtml += `   </span>`
    chatHtml += `   <span class="card-body p-1 ${align}">`
    chatHtml += `   <small>${message.text}</small>`
    chatHtml += `   </span>`
    chatHtml += ` </span>`
    chatHtml += `</span>`
    $('#channel-chat-list').append(chatHtml)
  }
  onMessageTyping(message, nodeId) {
    let label = ''
    if (this.node && nodeId != this.node.data.id && $('#collab-channel').is(':visible')) {
      label = `on ${this.canvas.cy.nodes(`#${nodeId}`).data('label')}`
    }
    let chatHtml = `<span class="mt-1 mx-1 pb-2 typing" data-sender="${message.sender.username}" data-type="typing">`
    chatHtml += `   <em class="px-2 text-muted" style="font-size:.75rem">${message.sender.name} is typing... ${label}</em>`
    chatHtml += `</span>`
    let clearTyping = (username) => {
      $(`#channel-chat-list .typing[data-sender="${username}"`).remove();
      clearTimeout(KitBuildCollab.typingTimeout.get(message.sender.username))
      KitBuildCollab.typingTimeout.delete(message.sender.username)
    }

    if ($(`#channel-chat-list .typing[data-sender="${message.sender.username}"]`).length == 0) {
      $('#channel-chat-list').append(chatHtml)
      $("#channel-chat-list").animate({ scrollTop: $("#channel-chat-list")[0].scrollHeight }, 200);
      KitBuildCollab.typingTimeout.set(message.sender.username,
        setTimeout(() => clearTyping(message.sender.username), 3000));
    } else {
      clearTimeout(KitBuildCollab.typingTimeout.get(message.sender.username))
      KitBuildCollab.typingTimeout.set(message.sender.username, 
        setTimeout(() => clearTyping(message.sender.username), 3000));
    }
  }

  // Channel
  getAndBuildChannelMessages(room, nodeId) { 
    return new Promise((resolve, reject) => {
      let socket = this.socket;
      let user = this.collab.user;
      if (!socket || !socket.connected || !room || !nodeId || !user) {
        if (!socket) reject("Invalid socket.")
        if (!socket.connected) reject("Socket is not connected.")
        if (!room) reject("No room joined.")
        if (!nodeId) reject("Invalid node.")
        if (!user) reject("Invalid user.")
        return 
      } 
      socket.emit('get-channel-messages', room, nodeId, (messages) => { 
        // console.warn(messages);
        if (messages && Array.isArray(messages)) {
          $('#channel-chat-list').html('')
          messages.forEach(message => {
            if (message.sender.username == user.username) {
              this.onMessageText(message, 'text-end')
            } else this.onMessageText(message) // from others
          })
          $("#channel-chat-list").animate({ scrollTop: $("#channel-chat-list")[0].scrollHeight }, 200);
        }
        resolve(messages);
      })
    })
  }
  static updateChannelChatRoomNotificationBadge() {
    KitBuildCollab.unreadChannelMessageCount = 0;
    CollabChannelTool.channels.forEach(channel => KitBuildCollab.unreadChannelMessageCount += channel.unread)
    if (KitBuildCollab.unreadChannelMessageCount) {
      $('#notification-channel').show()
      $('#dd-channel .count').html(KitBuildCollab.unreadChannelMessageCount)
    } else $('#notification-channel').hide()
  }
  static updateChannelList(canvas) { // console.warn(CollabChannelTool.channels)
    let channelListHtml = ''
    CollabChannelTool.channels.forEach(channel => {
      let label = canvas.cy.nodes(`#${channel.cid}`).data('label')
      channelListHtml += `<a class="channel dropdown-item d-flex justify-content-between align-items-center"`
      channelListHtml += `  data-cid="${channel.cid}" href="#">`;
      channelListHtml += `<span>${label}</span>`;
      if (channel.unread)
        channelListHtml += `<span class="badge rounded-pill bg-danger ms-2">${channel.unread}</span>`;
      channelListHtml += `</a>`;
    })
    $('#dd-channel-menu .channel-list').html(channelListHtml)
    CollabChannelTool.updateChannelChatRoomNotificationBadge()
  }


}

class CollabChatTool extends CollabTool {
  constructor(collab, options) {
    super(collab.canvas, options)
    this.collab = collab;
    this.socket = collab.socket;
    console.error("CHAT INSTANTIATED and SUBSCRIBE event")
    this.collab.on('event', this.onCollabEvent.bind(this))
    CollabChatTool.unreadMessageCount = 0
  }
  render() {
    return `<button id="dd-message" type="button" class="dd btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="false" data-bs-offset="30,15" aria-expanded="false">
      <i class="bi bi-chat-dots-fill"></i>
      <span id="notification-message" class="position-absolute translate-middle badge rounded-pill bg-success" style="display: none;">
        <span class="count">99+</span>
        <span class="visually-hidden">New alerts</span>
      </span>
    </button>
    <ul id="dd-message-menu" class="dropdown-menu" style="width: 300px;">
      <li class="px-2">
        <div class="mb-2 text-muted">Room: <span class="room-name text-primary">Room 2</span></div>
        <div class="border rounded mb-2 scroll-y pt-1" style="min-height: 100px; max-height: 250px" id="chat-list"></div>
        <form class="chat" name="chat" autocomplete="off">
          <div class="input-group input-group-sm mb-2">
            <input type="text" class="form-control" id="input-message" placeholder="Type Message..." aria-label="Type Message..." aria-describedby="button-send-message">
            <button class="btn btn-primary" id="bt-send-message"><i class="bi bi-send"></i> Send</button>
          </div>
        </form>
      </li>
    </ul>`;
  }
  handleUIEvent() {
    let collab = this.collab
    // Message
    $('#dd-message').on('click', () => {
      CollabChatTool.updateChatRoomName();
      setTimeout(() => {
        CollabChatTool.unreadMessageCount = 0;
        CollabChatTool.updateChatRoomNotificationBadge()
        $("#chat-list").animate({ scrollTop: $("#chat-list")[0].scrollHeight }, 200);
      }, 200)
      if ($('#dd-message-menu').hasClass('show'))
        $('#input-message').focus();
    })
    $('#input-message').on('keydown', (e) => {
      if (!collab.socket || !collab.socket.connected) return;
      if (KitBuildCollab.room()) {
        collab.socket.emit('message', {
          when: Date.now() / 1000 | 0,
          type: 'typing',
          sender: {
            username: collab.user.username,
            name: collab.user.name,
          }
        }, KitBuildCollab.room().name, () => {})
      }
    })
    $('#dd-message-menu form.chat').on('submit', (e) => {
      e.preventDefault()
      e.stopPropagation()
      let message = $('#input-message').val().trim()
      if (message.length == 0) return 
      if (!collab.socket || !collab.socket.connected) {
        UI.error("Cannot send message: Socket is not connected.").show()
        return;
      }
      message = {
        when: Date.now() / 1000 | 0,
        type: 'text',
        text: message,
        sender: {
          username: collab.user.username,
          name: collab.user.name,
        }
      }
      if (KitBuildCollab.room()) {
        collab.socket.emit('message', message, KitBuildCollab.room().name, () => {
          this.onMessageText(message, 'text-end');
          $("#chat-list").animate({ scrollTop: $("#chat-list")[0].scrollHeight }, 200);
          $('#input-message').val('')
          collab.broadcastEvent('message', message, KitBuildCollab.room().name)
        })
      } else UI.error('Unable to send message. No room joined.').show()
    })
  }

  getAndBuildRoomMessages(room, user) { 
    // console.warn(room, user, this.socket);
    return new Promise((resolve, reject) => {
      if (!this.socket 
        || !this.socket.connected 
        || !room 
        || !user) {
        reject("Invalid parameters.")
        return 
      } 
      this.socket.emit('get-room-messages', room, (messages) => { 
        // console.warn(messages);
        $('#chat-list').html('')
        if (messages && Array.isArray(messages)) {
          messages.forEach(message => {
            if (message.sender.username == user.username) {
              this.onMessageText(message, 'text-end')
            } else { // from others
              this.onMessageText(message)
            }
          })
          $("#chat-list").animate({ scrollTop: $("#chat-list")[0].scrollHeight }, 200);
        }
        resolve(messages);
      })
    })
  }

  // Message handlers chain
  onCollabEvent(evt, ...data) {
    switch(evt) {
      case 'connect':
        let socket = data.shift()
        this.socket = socket;
        if (!CollabChatTool.listener)
          CollabChatTool.listener = this.onMessage.bind(this);
        socket.off("message", CollabChatTool.listener)
          .on("message", CollabChatTool.listener)
        break;
    }
  }
  onMessage(message) {
    switch(message.type) {
      case 'text': {
        this.onMessageText(message); 
        $(`#chat-list .typing[data-sender="${message.sender.username}"`).remove();
        $("#chat-list").animate({ scrollTop: $("#chat-list")[0].scrollHeight }, 200);
      } break;
      case 'typing': this.onMessageTyping(message); break;
      default: console.log(message)
      
      if ($('#dd-message-menu').hasClass('show')) 
        CollabChatTool.unreadMessageCount = 0
      else CollabChatTool.unreadMessageCount++

      CollabChatTool.updateChatRoomNotificationBadge()
    }
  }
  onMessageText(message, align = 'text-start') {
    let when = new Date(message.when * 1e3).toISOString().slice(-13, -5);
    let chatHtml = `<span class="mt-1">`
    chatHtml += ` <span class="card mx-1 mb-1">`
    chatHtml += `   <span class="${align} bg-light border-bottom">`
    chatHtml += `   <small class="px-1 text-primary" style="font-size:.75rem">${message.sender.name}</small>`
    chatHtml += `   <small class="text-muted" style="font-size:.75rem">${when}</small>`
    chatHtml += `   </span>`
    chatHtml += `   <span class="card-body p-1 ${align}">`
    chatHtml += `   <small>${message.text}</small>`
    chatHtml += `   </span>`
    chatHtml += ` </span>`
    chatHtml += `</span>`
    $('#chat-list').append(chatHtml)
  }
  onMessageTyping(message) {
    let chatHtml = `<span class="mt-1 mx-1 pb-2 typing" data-sender="${message.sender.username}" data-type="typing">`
    chatHtml += `   <em class="px-2 text-muted" style="font-size:.75rem">${message.sender.name} is typing...</em>`
    chatHtml += `</span>`

    let clearTyping = (username) => {
      $(`#chat-list .typing[data-sender="${username}"`).remove();
      clearTimeout(KitBuildCollab.typingTimeout.get(message.sender.username))
      KitBuildCollab.typingTimeout.delete(message.sender.username)
    }

    if ($(`#chat-list .typing[data-sender="${message.sender.username}"]`).length == 0) {
      $('#chat-list').append(chatHtml)
      $("#chat-list").animate({ scrollTop: $("#chat-list")[0].scrollHeight }, 200);
      KitBuildCollab.typingTimeout.set(message.sender.username,
        setTimeout(() => clearTyping(message.sender.username), 3000));
    } else {
      clearTimeout(KitBuildCollab.typingTimeout.get(message.sender.username))
      KitBuildCollab.typingTimeout.set(message.sender.username, 
        setTimeout(() => clearTyping(message.sender.username), 3000));
    }
  }

  // Chat
  static updateChatRoomName() {
    let room = KitBuildCollab.room();
    $('#dd-message-menu .room-name').html(room
      ? `<span>${room.name} <span class="badge rounded-pill bg-danger"><i class="bi bi-people-fill me-2"></i>${room.users.length}</span></span>`
      : '<span class="text-danger">&mdash;</span>');
  }
  static updateChatRoomNotificationBadge() {
    if (CollabChatTool.unreadMessageCount) {
      $('#notification-message').show()
      $('#dd-message .count').html(CollabChatTool.unreadMessageCount)
    } else $('#notification-message').hide()
  }

}

