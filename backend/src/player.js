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

    static spawn(playerId, socket, map) {
        if (!map.players.has(playerId)) {
            console.error(`Attempted to spawn player ${playerId}, which is not present in the map!`);
            return null;
        }

        const player = map.players.get(playerId);
        return new Player(playerId, socket, player.x, player.y);
    }

    toString() {
        return this.colour;
    }
}

class Machine {
    // take the ruby to your machine to win!
    constructor(colour, ruby, x, y) {
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
        return new Machine(data.colour, ruby, data.x, data.y);
    }

    static spawn(playerId, ruby, map) {
        if (!map.machines.has(playerId)) {
            console.error(`Attempted to spawn machine ${playerId}, which is not present in the map!`);
            return null;
        }

        const machine = map.machines.get(playerId);
        return new Machine(playerId, ruby, machine.x, machine.y);
    }

    toString() {
        return `{ Machine [${this.x},${this.y}] ${this.colour} }`
    }
}

export { Player, Machine };
