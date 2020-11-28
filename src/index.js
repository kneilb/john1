// TOOD: import!?
const { createCanvas } = require('canvas')
const fs = require('fs');
const http = require('http');
const rough = require('roughjs')

const LISTEN_PORT = 1337;
const LISTEN_ADDR = '0.0.0.0';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

(async () => {

    const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
    const roughCanvas = rough.canvas(canvas);

    const clientCode = await fs.promises.readFile('./src/client.js', 'utf8');

    roughCanvas.rectangle(120, 15, 80, 160, { roughness: 2.8, fill: 'blue' });

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
                        break;
                    case "down":
                        console.log('DOWN');
                        break;
                    case "left":
                        console.log('LEFT');
                        break;
                    case "right":
                        console.log('RIGHT');
                        break;
                    default:
                        console.log('SPACESHIPS!!!1')
                        break;
                }
            });
            // console.log(request)
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.end();
        }
    }).listen(LISTEN_PORT, LISTEN_ADDR);

    console.log(`Server running at http://${LISTEN_ADDR}:${LISTEN_PORT}/`);
})();
