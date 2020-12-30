import { io } from 'socket.io-client';

const socket = io();

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

function subscribeToRefresh(onRefresh) {
    socket.on('refresh', (response) => {
        onRefresh(response);
    });
}

function subscribeToMessages(onMessage) {
    socket.on('message', (message) => {
        onMessage(message);
    });
}

function action(playerId, command) {
    socket.emit('action', playerId, command);
}

export { join, leave, subscribeToRefresh, subscribeToMessages, action };
