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

// Subscribe to 'refresh' messages, and request one now
function refresh(onRefresh) {
    socket.on('refresh', (response) => {
        onRefresh(response);
    });

    socket.emit('refresh');
}

function action(playerId, command) {
    socket.emit('action', playerId, command);
}

//export { join, leave, refresh, action };
const api = { join, leave, refresh, action };
export default api;
