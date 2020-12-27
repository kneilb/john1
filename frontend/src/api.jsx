import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:1337');

function join(playerId) {
    socket.emit('join', playerId);
}

function leave(playerId) {
    socket.emit('leave', playerId);
}

function refresh(cb) {
    socket.on('refresh', data => cb(data));
    socket.emit('refresh');
}

function action(playerId, command, cb) {
    socket.on('refresh', data => cb(data));
    socket.emit('action', playerId, command);
}

export { join, leave, refresh, action };
const api = { join, leave, refresh, action };
export default api;
