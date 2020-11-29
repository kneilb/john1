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
        this.y -= 10;
    }

    moveDown() {
        this.y += 10;
    }

    moveLeft() {
        this.x -= 10;
    }

    moveRight() {
        this.x += 10;
    }
}

(async () => {

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const roughCanvas = rough.canvas(canvas);

    const clientCode = await fs.promises.readFile('./src/client.js', 'utf8');

    const p1 = new Player('blue');

    p1.draw(roughCanvas);

    http.createServer((request, response) => {
        if (request.method == 'GET') {
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(
                //'<meta http-equiv="refresh" content="1;" />' +
                '<img src="' + canvas.toDataURL() + '" />' +
                '<button id="btn-up" type="">Up</button>' +
                '<button id="btn-down" type="">Down</button>' +
                '<button id="btn-left" type="">Left</button>' +
                '<button id="btn-right" type="">Right</button>' +
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
                        console.log('SPACESHIPS!!!1')
                        break;
                }

                //roughCanvas.clear();
                p1.draw(roughCanvas);
            });
            // console.log(request)
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end();
        }
    }).listen(LISTEN_PORT, LISTEN_ADDR);

    console.log(`Server running at http://${LISTEN_ADDR}:${LISTEN_PORT}/`);
})();
