import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';

import { HTTP_LISTEN_PORT } from './definitions.js';
import { Game } from './game.js'

const io = new Server(HTTP_LISTEN_PORT);

let games = new Map();
games.set('game1', new Game('game1', 'The First Game', io));

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
        let games_list = [];

        for (let [gameId, gameData] of games) {
            games_list.push({ id: gameId, name: gameData.name });
        }

        callback(games_list);
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

        // TODO: allow JSON to define "map"?
        games.set(gameId, new Game(gameId, gameName));

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
