const fs = require('fs');
const ini = require('ini')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8')); // console.log(config)


const { createServer } = (config.server.useSSL) ? require("https") : require("http");
const { App } = require("uWebSockets.js");
const { Server } = require("socket.io");
const { resolve } = require("path");
const { rejects } = require("assert");
const { channel } = require("diagnostics_channel");


class ServerApp {
  constructor() {
    console.log(`Collaboration server listening on port: ${config.server.port} ${config.server.useSSL ? "with" : "without"} SSL.`);
    const options = (config.server.useSSL) ? {
      key: fs.readFileSync(config.server.privkey),
      cert: fs.readFileSync(config.server.cert)
    } : {};
    this.httpServer = createServer(options);
    this.io = new Server(this.httpServer, {
      port: config.server.port,
      cors: {
        origin: config.server.corsOrigin,
        methods: ["GET", "POST"]
      }
    });

    this.rooms    = new Map(); // key is room name, value is room data
    this.users    = new Map(); // key is socket ID, value is user data
    this.groups   = new Map(); // key is group room name, value is Map of private room created
    this.chats    = new Map(); // key is room name, value is chat item list
    this.channels = new Map(); // key is room name, value is channel Map, key is node id, value is array of chat item list

    this.cmapio = this.io.of('/cmap')
    this.cmapio.on('connection', socket => ServerApp.handleCmapSocketEvent(this.cmapio, socket))

    this.kbio = this.io.of('/kitbuild')
    this.kbio.on('connection', socket => ServerApp.handleKitBuildSocketEvent(this.kbio, socket))

    // server-side
    this.io.on("connection", (socket) => { // not working, because clients connect to namespaced socket.
      console.log("CONNECT", socket.id);
      socket.on('disconnecting', (socket) => {
        console.log('IO DISCONNECTING', socket.id)
      })
    });

    this.httpServer.listen(config.server.port);
  }

  static instance(config) {
    ServerApp.inst = new ServerApp(config)
    return ServerApp.inst
  }
  static handleCmapSocketEvent(io, socket) {
    console.log('CMAP CONNECT', socket.id, socket.rooms)
    socket.on('disconnecting', (reason) => {
      console.log('CMAP DISCONNECTING', socket.id, reason)
      let user = ServerApp.inst.users.get(socket.id)
      socket.rooms.forEach(room => {
        let roomData = ServerApp.inst.rooms.get(room)
        if (user && roomData && roomData.type == "personal") {
          socket.in(room).emit('user-leave-room', socket.id, user, roomData);
        }
      })
    })
    socket.on('disconnect', (reason) => {
      console.log('CMAP DISCONNECT', socket.id, reason)

      // Cleanups users and rooms cache.
      let user = ServerApp.inst.users.get(socket.id)

      if (!user) // if no user, then it is just other passing by
        return

      // broadcast groups left by this user
      if (user.groups) {
        user.groups.forEach(group => {
          console.log("DISCONNECT GROUPS:", `GC/${group}`);
          io.in(`GC/${group}`).emit('user-leave-room', user, `GC/${group}`)
        })
      }

      ServerApp.inst.users.delete(socket.id)
      ServerApp.inst.rooms.forEach((roomData, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.rooms.delete(room)
      })
      ServerApp.inst.groups.forEach((rooms, group) => {
        if (!io.adapter.rooms.has(group)) {
          ServerApp.inst.groups.delete(group)
          return
        }
        rooms.forEach((room, key) => {
          if (!io.adapter.rooms.has(key)) rooms.delete(key)
        })
      })
      ServerApp.inst.chats.forEach((chats, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.chats.delete(room)
      })
      ServerApp.inst.channels.forEach((channel, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.channels.delete(room)
      })

      
      // console.log(io.adapter.rooms, io.adapter.sids, ServerApp.inst.rooms)
    })
    socket.on('register-user', (socketId, user, callback) => {
      if ((!socketId || !user || !user.groups || !user.gids)) {
        if (typeof callback == 'function') 
          callback("Invalid user data.");
        return
      }
      user.groups = user.groups ? user.groups.split(",") : []
      user.gids   = user.gids ? user.gids.split(",") : []
      if (user.gids.length != user.groups.length) {
        if (typeof callback == 'function') 
          callback("User is not assigned to any groups.");
        return
      }
      ServerApp.inst.users.set(socketId, user)
      for(let i = 0; i < user.groups.length; i++) {
        let groupRoom = user.groups[i];
        let gid       = user.gids[i];
        let room      = `GC/${groupRoom}`
        ServerApp.inst.rooms.set(room, {
          name: room,
          type: 'group',
          gid: gid,
        })
        user = ServerApp.inst.users.get(socket.id)
        socket.join(room)
        socket.in(room).emit('user-join-room', user, ServerApp.inst.rooms.get(room));
      }
      // console.log(io.adapter.rooms, io.adapter.sids)
      if (typeof callback == 'function') callback(true)
    })
    socket.on('get-rooms-of-socket', (callback) => {
      console.log("GET SOCKET JOINED ROOMS", socket.id)
      let rooms = ServerApp.getRoomsOfSocket(io, socket)
      if (typeof callback == 'function') callback(rooms)
    })
    socket.on('get-rooms-of-groups', (groups, callback) => {
      console.log("GET ROOMS OF GROUPS", groups)
      if (!Array.isArray(groups)) {
        if (typeof callback == 'function') callback(null);
        return
      }
      let rooms = new Map()
      groups.forEach(group => {
        let groupRooms = ServerApp.inst.groups.get(`GC/${group}`)
        // console.log("GCGRRMS", `GC/${group}`, groupRooms);
        if (groupRooms) groupRooms.forEach(groupRoom => {
          let currentRoom = rooms.get(groupRoom.name)
          if (currentRoom) { // previous group also has this toom
            currentRoom.groups.push(group)
            return
          } else {
            let sids = io.adapter.rooms.get(groupRoom.name)
            groupRoom.users = Array.from(sids.values()).map(sid => ServerApp.inst.users.get(sid));
            groupRoom.groups = [group]
            rooms.set(groupRoom.name, groupRoom)
          }
        })
      })
      if (typeof callback == 'function') callback(Array.from(rooms.values()))
      // console.log('GROUPS ROOMS', ServerApp.inst.rooms, rooms);
    })
    socket.on('create-room', (room, callback) => {
      console.log("CREATE (JOIN) ROOM", room)
      if (!room) {
        if (typeof callback == 'function') callback("Invalid room name.");
        return
      }
      room = `PC/${room}`
      // TODO: Check room already exist, created by another group
      console.log("IO has ROOM?", room, io.adapter.rooms.has(room))
      if (io.adapter.rooms.has(room)) {
        if (typeof callback == 'function') 
          callback("The room name is currently being used. Please use another name.")
        return
      }
      ServerApp.joinRoom(io, socket, room).then(callback);
    })
    socket.on('join-room', (room, callback) => {
      if ((!room)) { // || !io.adapter.rooms.has(room)
        if (typeof callback == 'function')
          callback("Invalid room to join.")
        return
      }
      ServerApp.joinRoom(io, socket, room).then(callback);
    })
    socket.on('leave-room', (room, callback) => {
      // currentRoom = socketRoom
      socket.leave(room)

      // if no other users in the room, remove it from rooms cache
      if (!io.adapter.rooms.has(room)) 
        ServerApp.inst.rooms.delete(room)
      
      ServerApp.inst.groups.forEach((groupRoomMap, groupRoom) => {
        groupRoomMap.forEach((room, roomName) => {
          if (!io.adapter.rooms.has(roomName)) 
            groupRoomMap.delete(roomName)
        })
        if (groupRoomMap.size == 0)
          ServerApp.inst.groups.delete(groupRoom)
        // broadcast event to everybody in the group room
        // so they refresh all published rooms in their group
        io.in(groupRoom).emit('user-leave-room', ServerApp.inst.users.get(socket.id), room);
      })
      if (typeof callback == 'function') callback(true)
    })


    socket.on('message', (message, room, callback) => {
      ServerApp.sendMessage(message, socket, room)
        .then(callback).catch(callback)
    })
    socket.on('get-room-messages', (room, callback) => {
      if (typeof callback == 'function')
        callback(ServerApp.inst.chats.get(room))
    })
    socket.on('broadcast', (message, room, callback) => {
      ServerApp.broadcastMessage(message, io, room, callback)
    })

    socket.on('channel-message', (message, room, nodeId, callback) => {
      ServerApp.sendChannelMessage(message, socket, room, nodeId)
        .then(callback).catch(callback)
    })
    socket.on('get-channels-of-room', (room, callback) => {
      console.log("GET CHANNELS ROOM", room)
      ServerApp.getChannelsOfRoom(room)
        .then(channels => callback(channels)).catch(error => callback(error))
    })
    socket.on('get-channel-messages', (room, nodeId, callback) => {
      console.log("GET CHANNEL MESSAGE", room, nodeId)
      if (typeof callback == 'function') {
        let channels = ServerApp.inst.channels.get(room);
        console.log(channels)
        if (channels) {
          let chats = channels.get(nodeId);
          console.log(chats)
          callback(chats ? chats : []);
        }
        callback([]);
      }
      console.log(ServerApp.inst.channels);
    })

    socket.on("command", (room, command, data, callback) => {
      console.log("COMMAND", room, command, data);
      socket.in(room).emit('command', command, data)
    });
    socket.on("get-map-state", (room, callback) => {
      console.log("GET MAP STATE", room);
      if (!room) {
        if (typeof callback == 'function') callback("Invalid room.") 
        return
      }
      let sockets = io.adapter.rooms.get(room)
      if (!sockets) {
        if (typeof callback == 'function') callback("Unable to get socket list from room.") 
        return
      } 
      for(let sockId of Array.from(sockets)) {
        if (sockId != socket.id) {
          socket.to(sockId).emit("get-map-state", socket.id)
          callback(true) 
          return
        }
      }
      callback("Unable to get map state from peer. No peer found.") 
    });
    socket.on("send-map-state", (requesterSocketId, mapState, callback) => {
      console.log("SEND MAP STATE", requesterSocketId);
      socket.to(requesterSocketId).emit("set-map-state", mapState)
    });

  }
  static handleKitBuildSocketEvent(io, socket) {
    console.log('KB CONNECT', socket.id, socket.rooms)
    socket.on('disconnecting', (reason) => {
      console.log('KB DISCONNECTING', socket.id, reason)
      let user = ServerApp.inst.users.get(socket.id)
      socket.rooms.forEach(room => {
        let roomData = ServerApp.inst.rooms.get(room)
        if (user && roomData && roomData.type == "personal") {
          socket.in(room).emit('user-leave-room', socket.id, user, roomData);
        }
      })
    })
    socket.on('disconnect', (reason) => {
      console.log('KB DISCONNECT', socket.id, reason)

      // Cleanups users and rooms cache.
      let user = ServerApp.inst.users.get(socket.id)

      if (!user) // if no user, then it is just other passing by
        return

      // broadcast groups left by this user
      user.groups.forEach(group => {
        console.log("DISCONNECT GROUPS:", `GK/${group}`);
        io.in(`GK/${group}`).emit('user-leave-room', user, `GK/${group}`)
      })

      ServerApp.inst.users.delete(socket.id)
      ServerApp.inst.rooms.forEach((roomData, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.rooms.delete(room)
      })
      ServerApp.inst.groups.forEach((rooms, group) => {
        if (!io.adapter.rooms.has(group)) {
          ServerApp.inst.groups.delete(group)
          return
        }
        rooms.forEach((room, key) => {
          if (!io.adapter.rooms.has(key)) rooms.delete(key)
        })
      })
      ServerApp.inst.chats.forEach((chats, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.chats.delete(room)
      })
      ServerApp.inst.channels.forEach((channel, room) => {
        if (!io.adapter.rooms.has(room))
          ServerApp.inst.channels.delete(room)
      })

      
      // console.log(io.adapter.rooms, io.adapter.sids, ServerApp.inst.rooms)
    })
    socket.on('register-user', (socketId, user, callback) => {
      if ((!socketId || !user || !user.groups || !user.gids)) {
        if (typeof callback == 'function') 
          callback("Invalid user data.");
        return
      }
      user.groups = user.groups ? user.groups.split(",") : []
      user.gids   = user.gids ? user.gids.split(",") : []
      if (user.gids.length != user.groups.length) {
        if (typeof callback == 'function') 
          callback("User is not assigned to any groups.");
        return
      }
      ServerApp.inst.users.set(socketId, user)
      for(let i = 0; i < user.groups.length; i++) {
        let groupRoom = user.groups[i];
        let gid       = user.gids[i];
        let room      = `GK/${groupRoom}`
        ServerApp.inst.rooms.set(room, {
          name: room,
          type: 'group',
          gid: gid,
        })
        user = ServerApp.inst.users.get(socket.id)
        socket.join(room)
        socket.in(room).emit('user-join-room', user, ServerApp.inst.rooms.get(room));
      }
      // console.log(io.adapter.rooms, io.adapter.sids)
      if (typeof callback == 'function') callback(true)
    })
    socket.on('get-rooms-of-socket', (callback) => {
      console.log("GET SOCKET JOINED ROOMS", socket.id)
      let rooms = ServerApp.getRoomsOfSocket(io, socket)
      if (typeof callback == 'function') callback(rooms)
    })
    socket.on('get-rooms-of-groups', (groups, callback) => {
      console.log("GET ROOMS OF GROUPS", groups)
      if (!Array.isArray(groups)) {
        if (typeof callback == 'function') callback(null);
        return
      }
      let rooms = new Map()
      groups.forEach(group => {
        let groupRooms = ServerApp.inst.groups.get(`GK/${group}`)
        // console.log("GKGRRMS", `GK/${group}`, groupRooms);
        if (groupRooms) groupRooms.forEach(groupRoom => {
          let currentRoom = rooms.get(groupRoom.name)
          if (currentRoom) { // previous group also has this toom
            currentRoom.groups.push(group)
            return
          } else {
            let sids = io.adapter.rooms.get(groupRoom.name)
            groupRoom.users = Array.from(sids.values()).map(sid => ServerApp.inst.users.get(sid));
            groupRoom.groups = [group]
            rooms.set(groupRoom.name, groupRoom)
          }
        })
      })
      if (typeof callback == 'function') callback(Array.from(rooms.values()))
      // console.log('GROUPS ROOMS', ServerApp.inst.rooms, rooms);
    })
    socket.on('create-room', (room, callback) => {
      console.log("CREATE (JOIN) ROOM", room)
      if (!room) {
        if (typeof callback == 'function') callback("Invalid room name.");
        return
      }
      room = `PK/${room}`
      // TODO: Check room already exist, created by another group
      console.log("IO has ROOM?", room, io.adapter.rooms.has(room))
      if (io.adapter.rooms.has(room)) {
        if (typeof callback == 'function') 
          callback("The room name is currently being used. Please use another name.")
        return
      }
      ServerApp.joinRoom(io, socket, room).then(callback);
    })
    socket.on('join-room', (room, callback) => {
      if ((!room)) { // || !io.adapter.rooms.has(room)
        if (typeof callback == 'function')
          callback("Invalid room to join.")
        return
      }
      ServerApp.joinRoom(io, socket, room).then(callback);
    })
    socket.on('leave-room', (room, callback) => {
      // currentRoom = socketRoom
      socket.leave(room)

      // if no other users in the room, remove it from rooms cache
      if (!io.adapter.rooms.has(room)) 
        ServerApp.inst.rooms.delete(room)
      
      ServerApp.inst.groups.forEach((groupRoomMap, groupRoom) => {
        groupRoomMap.forEach((room, roomName) => {
          if (!io.adapter.rooms.has(roomName)) 
            groupRoomMap.delete(roomName)
        })
        if (groupRoomMap.size == 0)
          ServerApp.inst.groups.delete(groupRoom)
        // broadcast event to everybody in the group room
        // so they refresh all published rooms in their group
        io.in(groupRoom).emit('user-leave-room', ServerApp.inst.users.get(socket.id), room);
      })
      if (typeof callback == 'function') callback(true)
    })


    socket.on('message', (message, room, callback) => {
      ServerApp.sendMessage(message, socket, room)
        .then(callback).catch(callback)
    })
    socket.on('get-room-messages', (room, callback) => {
      if (typeof callback == 'function')
        callback(ServerApp.inst.chats.get(room))
    })
    socket.on('broadcast', (message, room, callback) => {
      ServerApp.broadcastMessage(message, io, room, callback)
    })

    socket.on('channel-message', (message, room, nodeId, callback) => {
      ServerApp.sendChannelMessage(message, socket, room, nodeId)
        .then(callback).catch(callback)
    })
    socket.on('get-channels-of-room', (room, callback) => {
      console.log("GET CHANNELS ROOM", room)
      ServerApp.getChannelsOfRoom(room)
        .then(channels => callback(channels)).catch(error => callback(error))
    })
    socket.on('get-channel-messages', (room, nodeId, callback) => {
      console.log("GET CHANNEL MESSAGE", room, nodeId)
      if (typeof callback == 'function') {
        let channels = ServerApp.inst.channels.get(room);
        console.log(channels)
        if (channels) {
          let chats = channels.get(nodeId);
          console.log(chats)
          callback(chats ? chats : []);
        }
        callback([]);
      }
      console.log(ServerApp.inst.channels);
    })

    socket.on("command", (room, command, data, callback) => {
      console.log("COMMAND", room, command, data);
      socket.in(room).emit('command', command, data)
    });
    socket.on("get-map-state", (room, callback) => {
      console.log("GET MAP STATE", room);
      if (!room) {
        if (typeof callback == 'function') callback("Invalid room.") 
        return
      }
      let sockets = io.adapter.rooms.get(room)
      if (!sockets) {
        if (typeof callback == 'function') callback("Unable to get socket list from room.") 
        return
      } 
      for(let sockId of Array.from(sockets)) {
        if (sockId != socket.id) {
          socket.to(sockId).emit("get-map-state", socket.id)
          callback(true) 
          return
        }
      }
      callback("Unable to get map state from peer. No peer found.") 
    });
    socket.on("send-map-state", (requesterSocketId, mapState, callback) => {
      console.log("SEND MAP STATE", requesterSocketId);
      socket.to(requesterSocketId).emit("set-map-state", mapState)
    });
  }
  static getRoomsOfSocket(io, socket) {
    let rooms = [];
    let roomNames = io.adapter.sids.get(socket.id);
    roomNames.forEach(room => {
      let groupRoom = ServerApp.inst.rooms.get(room);
      if (groupRoom) {
        let sids = io.adapter.rooms.get(room)
        groupRoom.users = Array.from(sids.values()).map(sid => ServerApp.inst.users.get(sid));
        rooms.push(groupRoom);
      }
    })
    return rooms;
  }
  static getUsersOfRoom(io, roomName) {
    let users = [];
    let socketIds = io.adapter.rooms.get(roomName);
    socketIds.forEach(socketId => {
      let user = ServerApp.inst.users.get(socketId);
      if (user) users.push(user);
    })
    return users;
  }
  static joinRoom(io, socket, room) {
    return new Promise((resolve, reject) => {
      // Leave previously joined personal room
      let deletedRoom = null;
      for(let socketRoom of ServerApp.getRoomsOfSocket(io, socket)) {
        if (socketRoom.type == 'personal' && socketRoom.name != room) {
          // currentRoom = socketRoom
          socket.leave(socketRoom.name)
          // if no other users in the room, remove it from cache
          if (!io.adapter.rooms.has(socketRoom.name)) {
            ServerApp.inst.rooms.delete(socketRoom.name)
            deletedRoom = socketRoom.name
          }
          // broadcast event to everybody in the room
          // that this user is leaving the room
          io.in(socketRoom.name).emit('user-leave-room', ServerApp.inst.users.get(socket.id), socketRoom);
          console.log('user-leave-room', ServerApp.inst.users.get(socket.id), socketRoom);
          break;
        }
      }
  
      // now, join the room, either create or just join
      socket.join(room)
  
      // cache the room data
      let roomData = { name: room, type: 'personal' }
      ServerApp.inst.rooms.set(room, roomData)
  
      // broadcast this new room to all users of the same groups
      // a new room has been created or user has join a room
      let user = ServerApp.inst.users.get(socket.id)
      if (user.groups) {
        user.groups.forEach(groupRoom => {
  
          let namespace = socket.nsp;
          let prefix = namespace.name == '/cmap' ? 'GC' : 'GK'
          groupRoom = `${prefix}/${groupRoom}`
          
          // if the group room has not been created in the group ... 
          if (!ServerApp.inst.groups.has(groupRoom))
            ServerApp.inst.groups.set(groupRoom, new Map())
    
          let group = ServerApp.inst.groups.get(groupRoom)
          group.set(room, roomData)
    
          // clean deleted room from group room cache
          if (deletedRoom) group.delete(deletedRoom)
    
          // io.in: to all sockets in room, including sender
          // socket.in: to all sockets in room, excluding sender
          io.in(groupRoom).emit('user-join-room', user, ServerApp.inst.rooms.get(room))
        });
      }
  
      // console.log(callback)
      // returns rooms (and group rooms) joined by this user.
      let rooms = ServerApp.getRoomsOfSocket(io, socket);
      resolve(rooms);
    })
  }
  
  static sendMessage(message, socket, room) {
    return new Promise((resolve, reject) => {
      if (!socket || !room) { // validate parameters
        reject('Invalid socket or room.')
        return 
      }
      socket.in(room).emit('message', message)
      switch(message.type) {
        case 'text': { // cache the message
          let roomChat = ServerApp.inst.chats.get(room)
          if (roomChat) roomChat.push(message)
          else ServerApp.inst.chats.set(room, [message])
          } break;
        default: break;
      }
      resolve(true)
    })
  }
  static broadcastMessage(message, io, room, callback) {
    if (!socket || !room) { // validate parameters
      if (typeof callback == 'function') 
        callback('Invalid socket or room.')
      return 
    }
    io.in(room).emit('broadcast', message)
    if (typeof callback == 'function') callback(true)
  }
  static getChannelsOfRoom(room) {
    return new Promise((resolve, reject) => {
      let channels = ServerApp.inst.channels.get(room);
      channels = channels && channels.size ? Array.from(channels.keys()) : []
      resolve(channels)
    })
  }
  static sendChannelMessage(message, socket, room, nodeId) {
    console.log("CHANNEL MESSAGE:", message, room, nodeId)
    return new Promise((resolve, reject) => {
      if (!socket || !room) { // validate parameters
        reject('Invalid socket or room.')
        return 
      }
      socket.in(room).emit('channel-message', message, nodeId)
      switch(message.type) {
        case 'text': { // cache the message
          let channelChats = ServerApp.inst.channels.get(room);
          if (channelChats) {
            let channel = channelChats.get(nodeId);
            if (!channel) channelChats.set(nodeId, [message]);
            else channel.push(message);
            break;
          }
          let channelMap = new Map([[nodeId, [message]]]);
          ServerApp.inst.channels.set(room, channelMap);
        } break;
        default: break;
      }
      resolve(true)
    })
  }
}

let server = ServerApp.instance(config);

class Utility {
  static decompress(b64string) {
    const zlib = require('zlib');
    var buf = Buffer.from(b64string, 'base64');
    var data = zlib.unzipSync(buf)
    return data
  }

  static compress(data) {
    const zlib = require('zlib');
    var deflated = zlib.gzipSync(data).toString('utf8')
    var base64string = Buffer.from(deflated).toString('base64')
    return base64string
  }
}
