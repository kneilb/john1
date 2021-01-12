import { GRID_SIZE } from './definitions.js'

const GATE_RADIUS = GRID_SIZE / 2;

class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `[${this.x},${this.y}]`;
    }
}

// Superclass for rectangular areas that the player can move about on.
class Land {
    constructor(x, y, width, height, canSpawn) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canSpawn = canSpawn;
    }

    getSpawnCoordinates() {
        let coords = [];

        if (this.canSpawn) {
            for (let y = this.y; y < this.y + this.height; ++y) {
                for (let x = this.x; x < this.x + this.width; ++x) {
                    coords.push(new Coordinates(x, y));
                }
            }
        }

        return coords;
    }

    on(x, y) {
        return x >= this.x && x < this.x + this.width &&
            y >= this.y && y < this.y + this.height;
    }

    toString() {
        return `{Land [${this.x},${this.y}] [${this.width}x${this.height}]}`
    }
};

class Island extends Land {
    // belongs to a player
    // has their machine
    // a key spawns here
    draw(canvasContext) {
        canvasContext.fillStyle = 'green';

        canvasContext.fillRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            this.width * GRID_SIZE, this.height * GRID_SIZE
        );
    }

    static parse(data) {
        return new Island(data.x, data.y, data.width, data.height, data.canSpawn);
    }
}

class Platform extends Land {
    // connects islands
    // things cannot auto-spawn here (players, keys, machines)
    constructor(x, y, width, height) {
        super(x, y, width, height, false);
    }

    draw(canvasContext) {
        canvasContext.fillStyle = 'grey';

        canvasContext.fillRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            this.width * GRID_SIZE, this.height * GRID_SIZE
        );
    }

    static parse(data) {
        return new Platform(data.x, data.y, data.width, data.height);
    }
}

class Gate {
    // Needs N keys to open
    // Leads to the island with the ruby
    constructor(x, y, colour, count, keys) {
        this.x = x;
        this.y = y;
        this.colour = colour
        this.count = count;
        this.keys = keys;
    }

    on(x, y) {
        return x === this.x && y === this.y;
    }

    canPass(player) {
        const count = this.keys.reduce((total, key) => total + (key.colour === this.colour && key.player === player), 0);
        console.log(`gate: ${player} has ${count} of the required ${this.count} ${this.colour} keys`);
        return count >= this.count;
    }

    draw(canvasContext) {
        canvasContext.save();
        canvasContext.translate(this.x * GRID_SIZE, this.y * GRID_SIZE);

        canvasContext.beginPath();

        canvasContext.arc(
            GRID_SIZE / 2, GRID_SIZE / 2,
            GATE_RADIUS, Math.PI, 2 * Math.PI, false
        );

        canvasContext.lineTo(GRID_SIZE, GRID_SIZE);
        canvasContext.lineTo(0, GRID_SIZE);

        canvasContext.fillStyle = 'brown';
        canvasContext.fill();
        canvasContext.strokeStyle = this.colour;
        canvasContext.stroke();

        canvasContext.restore();
    }

    static parse(data, keys) {
        return new Gate(data.x, data.y, data.colour, data.count, keys);
    }

    toString() {
        return `{Gate [${this.x},${this.y}] keys=${this.keys}}`;
    }
}

export { Gate, Island, Platform };
