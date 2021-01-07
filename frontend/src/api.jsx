import { io } from 'socket.io-client';

const socket = io();

function join(playerId, gameId, onAccept, onReject) {
    socket.emit('join', playerId, gameId, (response) => {
        if (response.okay) {
            onAccept();
        }
        else {
            onReject(response.text);
        }
    });
}

function leave() {
    socket.emit('leave', (response) => {
        console.log(`leave: ${response}`)
    });
}

function requestRefresh() {
    socket.emit('refresh');
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

function action(action) {
    socket.emit('action', action);
}

async function getGames() {
    return new Promise((resolve, reject) => {
        socket.emit('getGames', (games) => {
            resolve(games);
        });
    });
}

function createGame(gameData, onAccept, onReject) {
    socket.emit('createGame', gameData, (response) => {
        if (response.okay) {
            onAccept();
        }
        else {
            onReject(response.text);
        }
    });
}

function deleteGame(gameId, onAccept, onReject) {
    socket.emit('deleteGame', gameId, (response) => {
        if (response.okay) {
            onAccept();
        }
        else {
            onReject(response.text);
        }
    });
}

export { action, createGame, getGames, deleteGame, join, leave, requestRefresh, subscribeToMessages, subscribeToRefresh };
