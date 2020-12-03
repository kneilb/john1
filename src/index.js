// TODO: import!?
const { createCanvas } = require('canvas')
const fs = require('fs');
const http = require('http');
const rough = require('roughjs')

const LISTEN_PORT = 1337;
const LISTEN_ADDR = '0.0.0.0';

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

function getPlayerCookie(request) {
    const rawCookie = request.headers.cookie;
    let playerCookie = null;

    rawCookie && rawCookie.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        if (parts[0] === 'player') {
            playerCookie = parts[1];
            return;
        }
    });
    return playerCookie;
}


(async () => {
    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const canvasContext = canvas.getContext('2d');
    const roughCanvas = rough.canvas(canvas);

    // TODO: tidy up players that have disconnected...!
    let players = new Map();

    http.createServer((request, response) => {
        const playerId = getPlayerCookie(request);

        console.log(`${request.method}: ${request.path} ${playerId}`);

        if (request.method == 'GET') {
            response.writeHead(200, { 'Content-Type': 'image/png' });
            response.end(canvas.toDataURL());
        }
        else if (request.method == 'POST') {
            if (playerId === null || !players.has(playerId)) {
                console.log(`POST without player matching player cookie - create new player!!`);

                let body = [];
                request.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    const newPlayerId = Buffer.concat(body).toString();
                    console.log(`newPlayerId: ${newPlayerId}`);

                    const player = new Player(newPlayerId);
                    players.set(newPlayerId, player);
                    player.draw(roughCanvas);

                    response.writeHead(200, {
                        'Content-Type': 'text/html',
                        'Set-Cookie': `player=${newPlayerId}`
                    });
                    response.end(canvas.toDataURL());
                });

                return;
            }

            if (!players.has(playerId)) {
                console.log(`POST with player ${playerId}, which doesn't exist!`);
                response.writeHead(409);
                response.end();
                return;
            }

            const player = players.get(playerId);

            let body = [];
            request.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                response.writeHead(200, { 'Content-Type': 'text/html' });

                const key = Buffer.concat(body).toString();
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
                        players.delete(playerId);

                        response.writeHead(200, {
                            'Content-Type': 'text/html',
                            'Set-Cookie': `player=${playerId}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
                        });

                        break;
                }

                canvasContext.clearRect(0, 0, canvas.width, canvas.height);

                for (let [_, player] of players) {
                    player.draw(roughCanvas);
                }

                response.end(canvas.toDataURL());
            });
        }
    }).listen(LISTEN_PORT, LISTEN_ADDR);

    console.log(`Server running at http://${LISTEN_ADDR}:${LISTEN_PORT}/`);
})();
