const { createCanvas } = require('canvas');
const rough = require('roughjs');
const express = require('express');
const socketIo = require('socket.io');

const HTTP_LISTEN_PORT = 1337;
const SOCKET_IO_LISTEN_PORT = 1338;

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const PLAYER_HEIGHT = 40;
const PLAYER_WIDTH = 40;
const PLAYER_MOVEMENT = 40;

class Player {
    constructor(colour) {
        this.x = 0;
        this.y = 0;
        this.colour = colour;
    }

    draw(roughCanvas) {
        roughCanvas.rectangle(
            this.x, this.y,
            PLAYER_WIDTH, PLAYER_HEIGHT,
            { roughness: 2.8, fill: this.colour }
        );
    }

    moveUp() {
        this.y -= PLAYER_MOVEMENT;
    }

    moveDown() {
        this.y += PLAYER_MOVEMENT;
    }

    moveLeft() {
        this.x -= PLAYER_MOVEMENT;
    }

    moveRight() {
        this.x += PLAYER_MOVEMENT;
    }
}

const app = express();
const io = socketIo();

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasContext = canvas.getContext('2d');
const roughCanvas = rough.canvas(canvas);

// TODO: tidy up players that have disconnected...!
let players = new Map();

function redrawPlayingField() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let [_, player] of players) {
        player.draw(roughCanvas);
    }
}

app.get('/api/game', (request, response) => {
    console.log(`${request.method}: ${request.url}`);
    response.type('image/png').send(canvas.toDataURL());
});

app.post('/api/game/:playerId', (request, response) => {
    console.log(`${request.method}: ${request.url}`);

    const newPlayerId = request.params.playerId;

    if (players.has(newPlayerId)) {
        console.log(`Requested player ${newPlayerId}, which is already in use!`);
        response.sendStatus(409);
        return;
    }

    console.log(`Creating new player: ${newPlayerId}!!`);

    const player = new Player(newPlayerId);
    players.set(newPlayerId, player);
    player.draw(roughCanvas);

    response.sendStatus(200);
});

app.delete('/api/game/:playerId', (request, response) => {
    console.log(`${request.method}: ${request.url}`);

    const playerIdToDelete = request.params.playerId;

    if (!players.has(playerIdToDelete)) {
        console.log(`Requested to delete player ${playerIdToDelete}, which does not exist!`);
        response.sendStatus(404);
        return;
    }

    players.delete(playerIdToDelete);
    redrawPlayingField();

    response.sendStatus(200);
});

app.put('/api/game/:playerId/:control', (request, response) => {
    console.log(`${request.method}: ${request.url}`);

    const playerId = request.params.playerId;
    const key = request.params.control;

    if (!players.has(playerId)) {
        console.log(`Requested to control player ${playerId}, which doesn't exist!`);
        response.sendStatus(404);
        return;
    }

    const player = players.get(playerId);

    switch (key) {
        case 'up':
            player.moveUp();
            break;
        case 'down':
            player.moveDown();
            break;
        case 'left':
            player.moveLeft();
            break;
        case 'right':
            player.moveRight();
            break;
        case 'gobble':
            player.gobble();
            return;
        default:
            response.sendStatus(404);
            return;
    }

    redrawPlayingField();

    response.type('image/png').send(canvas.toDataURL());
});

app.listen(HTTP_LISTEN_PORT, () => {
    console.log(`Server running at http://localhost:${HTTP_LISTEN_PORT}/`);
});

io.on('connection', (client) => {
    client.on('subscribeToTimer', (interval) => {
        console.log('client is subscribing to timer with interval ', interval);
        setInterval(() => {
            client.emit('timer', new Date());
        }, interval);
    });
});

io.listen(SOCKET_IO_LISTEN_PORT);
