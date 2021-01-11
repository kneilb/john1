import { GRID_SIZE } from './definitions.js'

class Player {
    constructor(colour, socket, x, y) {
        this.colour = colour;
        this.socket = socket;
        this.x = x;
        this.y = y;
    }

    draw(canvasContext) {
        canvasContext.fillStyle = this.colour;

        canvasContext.fillRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            GRID_SIZE, GRID_SIZE
        );
    }

    static parse(data, socket, chooseSpawnCoordinates) {
        if (!Number.isInteger(data.x) || !Number.isInteger(data.y)) {
            const spawnCoordinates = chooseSpawnCoordinates();
            data.x = spawnCoordinates.x;
            data.y = spawnCoordinates.y;
        }
        return new Player(data.colour, socket, data.x, data.y);
    }
}

class Machine {
    // take the ruby to your machine to win!
    constructor(colour, x, y, ruby) {
        this.colour = colour;
        this.x = x;
        this.y = y;
        this.ruby = ruby;
    }

    tryWin(player) {
        if (player.x === this.x && player.y === this.y) {
            if (this.colour === player.colour) {
                if (this.ruby.player === player) {
                    return true;
                }
                else {
                    let message = `Sorry mate, you don't have the ruby!`;
                    console.log(`${player.colour}: ${message}`);
                    player.socket.emit('message', message);
                }
            }
            else {
                let message = `Sorry mate, this isn't your machine!`;
                console.log(`${player.colour}: ${message}`);
                player.socket.emit('message', message);
            }
        }
        return false;
    }

    draw(canvasContext) {
        canvasContext.fillStyle = 'grey';

        canvasContext.fillRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            GRID_SIZE, GRID_SIZE
        );

        canvasContext.strokeStyle = this.colour;

        canvasContext.strokeRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            GRID_SIZE, GRID_SIZE
        );
    }

    static parse(data, ruby, chooseSpawnCoordinates) {
        if (!Number.isInteger(data.x) || !Number.isInteger(data.y)) {
            const spawnCoordinates = chooseSpawnCoordinates();
            data.x = spawnCoordinates.x;
            data.y = spawnCoordinates.y;
        }
        return new Player(data.colour, ruby, data.x, data.y);
    }

    toString() {
        return `{ Machine [${this.x},${this.y}] ${this.colour} }`
    }
}

export { Player, Machine };
