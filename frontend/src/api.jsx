import openSocket from 'socket.io-client';

const socket = openSocket();

function join(playerId, onAccept, onReject) {
    socket.emit('join', playerId, (response) => {
        if (response.okay) {
            onAccept(response.text);
        }
        else {
            onReject(response.text);
        }
    });
}

function leave(playerId) {
    socket.emit('leave', playerId);
}

function refresh(callback) {
    socket.emit('refresh', response => callback(response));
}

function action(playerId, command, callback) {
    socket.emit('action', playerId, command, response => callback(response));
}

//export { join, leave, refresh, action };
const api = { join, leave, refresh, action };
export default api;
