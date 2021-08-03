const { updateStation } = require('../api/station/station-controller');
const asyncLocalStorage = require('./als-service');
const logger = require('./logger-service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http);
    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('chat newMsg', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('chat newMsg', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('station watch', stationId => {
            if (socket.stationId === stationId) return;
            if (socket.stationId) {
                socket.leave(socket.stationId);
            }
            // socket.join('watching:' + stationId)
            socket.join(stationId)
            socket.stationId = stationId;
        })
        socket.on('set-station-socket', stationId => {
            logger.debug(`Setting socket.stationId = ${stationId}`)
            socket.stationId = stationId
        })
        socket.on('unset-station-socket', () => {
            delete socket.stationId
        })
        socket.on('station updated', (updatedStation) => {
            socket.to(updatedStation._id).emit("station updated", updatedStation);
        })

    })
}
//label===stationId
function emitTo({ type, data, label }) {
    console.log(gIo.to(label).clients((err, clients) => {
        if (err) throw err;
        console.log(clients.sockets);
    }))
    if (label) gIo.to(label).emit(type, data)
    else gIo.emit(type, data)
}

function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
function broadcast({ type, data, room = null, stationId }) {
    const excludedSocket = _getStationSocket(stationId)
    if (!excludedSocket) {
        logger.debug('Shouldnt happen, socket not found')
        _printSockets();
        return;
    }
    logger.debug('broadcast to all but user: ', stationId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

function _getStationSocket(stationId) {
    const sockets = _getAllSockets();
    const socket = sockets.find(s => s.stationId == stationId)
    return socket;
}

function _getAllSockets() {
    const socketIds = Object.keys(gIo.sockets.sockets)
    const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
    return sockets;
}

function _printSockets() {
    const sockets = _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}

function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}