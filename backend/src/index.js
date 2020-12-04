// TODO: import!?
const { createCanvas } = require('canvas');
const rough = require('roughjs');

const express = require('express');
var bodyParser = require('body-parser');

const LISTEN_PORT = 1337;

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
app.use(bodyParser.text());

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasContext = canvas.getContext('2d');
const roughCanvas = rough.canvas(canvas);

// TODO: tidy up players that have disconnected...!
let players = new Map();

app.get('/api/game', (request, response) => {
    console.log(`${request.method}: ${request.url}`);
    response.send(canvas.toDataURL());
});

app.post('/api/player', (request, response) => {
    console.log(`${request.method}: ${request.url} ${request.body}`);

    const newPlayerId = request.body;
    console.log(`newPlayerId: ${newPlayerId}`);

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

app.post('/api/game/:playerId/:control', (request, response) => {
    console.log(`${request.method}: ${request.url}`);

    const playerId = request.params.playerId;

    if (!players.has(playerId)) {
        console.log(`Requested to control player ${playerId}, which doesn't exist!`);
        response.sendStatus(409);
        return;
    }

    const key = request.body;
    const player = players.get(playerId);

    console.log(`${playerId} -> ${key}`);

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
        case 'exit':
            // TODO: should be a DELETE of /player/X
            players.delete(playerId);
            response.sendStatus(200);
            return;
        default:
            console.log('SPACESHIPS?!?!');
            response.sendStatus(404);
            return;
    }

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let [_, player] of players) {
        player.draw(roughCanvas);
    }

    response.type('image/png').send(canvas.toDataURL());
});

app.listen(LISTEN_PORT, () => {
    console.log(`Server running at http://localhost:${LISTEN_PORT}/`);
});
