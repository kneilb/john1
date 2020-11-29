// TODO: import!?
const { createCanvas } = require('canvas')
const fs = require('fs');
const http = require('http');
const rough = require('roughjs')

const LISTEN_PORT = 1337;
const LISTEN_ADDR = '0.0.0.0';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const PLAYER_HEIGHT = 80;
const PLAYER_WIDTH = 80;
const PLAYER_MOVEMENT = 40;

class Player {
    constructor(colour) {
        this.x = 0;
        this.y = 0;
        this.colour = colour
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

(async () => {

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const canvasContext = canvas.getContext('2d');
    const roughCanvas = rough.canvas(canvas);

    const clientCode = await fs.promises.readFile('./src/client.js', 'utf8');

    const p1 = new Player('blue');

    p1.draw(roughCanvas);

    http.createServer((request, response) => {
        if (request.method == 'GET') {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(
                '<img id="canvas" src="' + canvas.toDataURL() + '" />' +
                '<button id="up" type="">Up</button>' +
                '<button id="down" type="">Down</button>' +
                '<button id="left" type="">Left</button>' +
                '<button id="right" type="">Right</button>' +
                '<script>' +
                clientCode +
                '</script>'
            )
        }
        else if (request.method == 'POST') {
            let body = [];
            request.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();

                switch (body) {
                    case "up":
                        console.log('UP');
                        p1.moveUp();
                        break;
                    case "down":
                        console.log('DOWN');
                        p1.moveDown();
                        break;
                    case "left":
                        console.log('LEFT');
                        p1.moveLeft();
                        break;
                    case "right":
                        console.log('RIGHT');
                        p1.moveRight();
                        break;
                    default:
                        console.log('SPACESHIPS!!!1');
                        break;
                }

                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                p1.draw(roughCanvas);

                response.writeHead(200, { 'Content-Type': 'image/png' });
                response.end(canvas.toDataURL());
            });
        }
    }).listen(LISTEN_PORT, LISTEN_ADDR);

    console.log(`Server running at http://${LISTEN_ADDR}:${LISTEN_PORT}/`);
})();
