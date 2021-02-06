import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';

import { HTTP_LISTEN_PORT } from './definitions.js';
import { Game } from './game.js';
import * as maps from './mapData.js';

const io = new Server(HTTP_LISTEN_PORT);

let games = new Map();

function addGame(id, name, server, map) {
    games.set(id, new Game(id, name, server, map));
}

addGame('game1', 'The First Level', io, maps.LEVEL_1);
addGame('game2', 'The Second Level', io, maps.LEVEL_2);

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected!!`);

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected!!`);
        // TODO: use disconnect to remove players!?
        // Or use cookies??
    });

    socket.on('join', (playerId, gameId, callback) => {
        console.log(`join: ${playerId} to ${gameId}`);

        if (!games.has(gameId)) {
            const text = `Requested to join game ${gameId}, which does not exist!`;
            console.log(`join: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const game = games.get(gameId);

        if (game.hasPlayer(playerId)) {
            const text = `Requested to join as player ${playerId}, which is already in use!`;
            console.log(`join: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        if (!game.playerValid(playerId)) {
            const text = `Requested to join as player ${playerId}, which not valid for this game!`;
            console.log(`join: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        console.log(`Creating new player: ${playerId}!!`);

        game.newPlayer(playerId, socket);

        socket.gameId = gameId;
        socket.playerId = playerId;

        callback({ okay: true });
    });

    socket.on('leave', (callback) => {
        const gameId = socket.gameId || null;
        const playerId = socket.playerId || null;

        console.log(`leave: ${playerId} from ${gameId}`);

        if (!games.has(gameId)) {
            const text = `Requested to leave game ${gameId}, which does not exist!`;
            console.log(`leave: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const game = games.get(gameId);

        if (!game.hasPlayer(playerId)) {
            const text = `Requested to remove player ${playerId}, which does not exist!`;
            console.log(`leave: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        game.removePlayer(playerId);
        callback({ okay: true });

        // Delete game if everyone has left
        // if (!game.players) {
        //     console.log(`leave: deleting empty game ${gameId}`);
        //     games.delete(gameId);
        // }
    });

    socket.on('refresh', () => {
        const gameId = socket.gameId || null;

        if (!games.has(gameId)) {
            return;
        }

        const game = games.get(gameId);

        console.log(`${socket.id} requested refresh`);
        socket.emit('refresh', game.canvas.toDataURL());
    });

    socket.on('action', (action) => {
        const gameId = socket.gameId || null;
        const playerId = socket.playerId || null;

        console.log(`action: ${gameId} ${playerId} -> ${action}`);

        if (!games.has(gameId)) {
            return;
        }

        const game = games.get(gameId);

        game.action(playerId, action);
    });

    socket.on('getGames', (callback) => {
        const gamesList = [...games.values()].map((gameData) => { return { id: gameData.id, name: gameData.name, players: gameData.getAvailablePlayers() }; });

        callback(gamesList);
    });

    socket.on('createGame', (gameData, callback) => {
        console.log(`createGame: ${gameData}`);

        if (!gameData.id) {
            gameData.id = uuid();
        }

        const gameId = gameData.id;

        if (!gameData.name) {
            const text = `Invalid gameData (no name): ${gameData}`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const gameName = gameData.name;

        if (games.has(gameId)) {
            const text = `Requested to create game ${gameId}, which already exists!`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        if ([...games.values()].some((g) => g.name == gameName)) {
            const text = `Requested to create game called ${gameName}, which already exists!`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const mapData = gameData.mapData ? JSON.parse(gameData.mapData) : maps.LEVEL_1;

        games.set(gameId, new Game(gameId, gameName, io, mapData));

        callback({ okay: true });
    });

    socket.on('deleteGame', (gameId, callback) => {
        console.log(`deleteGame: ${gameId}`);

        if (!game.players) {
            console.log(`deleteGame: deleting empty game ${gameId}`);
            games.delete(gameId);
        }

        callback({ okay: true });
    });
});
