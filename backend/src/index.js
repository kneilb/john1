const HTTP_LISTEN_PORT = 1337;
const CLIENT_PORT = 3000;

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const X_MIN = 0;
const X_MAX = 24;
const Y_MIN = 0;
const Y_MAX = 17;
const GRID_SIZE = 40;

const RUBY_DIAMETER = (GRID_SIZE / 2);
const KEY_CIRCLE_DIAMETER = (GRID_SIZE / 4);

class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Land {
    on(x, y) {
        return (x >= this.x && x < (this.x + this.width) &&
                y >= this.y && y < (this.y + this.height));
    }
};

class Island extends Land {
    // belongs to a player
    // has their machine
    // a key spawns here
    constructor(x, y, width, height, canSpawn) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canSpawn = canSpawn;
    }

    getSpawnCoordinates()
    {
        let coords = [];

        if (this.canSpawn) {
            for (let y = this.y; y < this.y + this.height; ++y) {
                for (let x = this.x; x < this.x + this.width; ++x) {
                    coords.push(new Coords(x, y));
                }
            }
        }

        return coords;
    }

    draw(roughCanvas) {
        roughCanvas.rectangle(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            this.width * GRID_SIZE, this.height * GRID_SIZE, {
            fill: 'green',
            fillStyle: 'dots'
        });
    }
}

class Platform extends Land {
    // connects islands
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    getSpawnCoordinates()
    {
        return [];
    }

    draw(roughCanvas) {
        roughCanvas.rectangle(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            this.width * GRID_SIZE, this.height * GRID_SIZE, {
            fill: 'grey',
            fillStyle: 'dots'
        });
    }
}

class Machine {
}

class Key {
    // Dropped on death of player
    // 1 spawns on each player's island
    // Must be taken to the gate to unlock it
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.player = null;
    }

    draw(roughCanvas) {
        roughCanvas.circle(
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2),
            KEY_CIRCLE_DIAMETER, {
            fill: 'yellow',
            fillStyle: 'cross-hatch'
        });
        roughCanvas.line(
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2),
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2)
        );
        roughCanvas.line(
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2),
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 1)
        );
        roughCanvas.line(
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 7/4), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2),
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 7/4), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 3/4)
        );
        roughCanvas.line(
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 3/2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER / 2),
            this.x * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 3/2), this.y * GRID_SIZE + (KEY_CIRCLE_DIAMETER * 1)
        );
    }

    tryPickup(player) {
        if ((this.x === player.x) && (this.y === player.y)) {
            this.player = player;
        }
    }

    tryMove(player) {
        if (player === this.player) {
            this.x = player.x;
            this.y = player.y;
        }
    }
}

class Gate {
    // Needs 3 keys to open
    // Leads to the island with the ruby
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    on(x, y) {
        return x === this.x && y === this.y;
    }

    canPass(player) {
        return keys.every((key) => key.player == player);
    }

    draw(roughCanvas) {
        roughCanvas.ellipse(
            (this.x * GRID_SIZE) + (GRID_SIZE / 2), (this.y * GRID_SIZE) + (GRID_SIZE / 2),
            GRID_SIZE, GRID_SIZE, {
            fill: 'brown',
            fillStyle: 'dots'
        });
    }
}

class Ruby {
    // Dropped on death of player
    // Must be taken back to the player's machine in order to win
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.player = null;
    }

    tryPickup(player) {
        if ((this.x === player.x) && (this.y === player.y)) {
            this.player = player;
        }
    }

    tryMove(player) {
        if (player === this.player) {
            this.x = player.x;
            this.y = player.y;
        }
    }

    draw(roughCanvas) {
        roughCanvas.circle(
            (this.x * GRID_SIZE) + (GRID_SIZE / 2), (this.y * GRID_SIZE) + (GRID_SIZE / 2),
            RUBY_DIAMETER, {
            fill: 'red',
            fillStyle: 'cross-hatch'
        });
    }
}

class Player {
    constructor(colour, x, y) {
        this.x = x;
        this.y = y;
        this.colour = colour;
    }

    draw(roughCanvas) {
        roughCanvas.rectangle(
            (this.x * GRID_SIZE), (this.y * GRID_SIZE),
            GRID_SIZE, GRID_SIZE,
            { roughness: 2.8, fill: this.colour }
        );

        roughCanvas.rectangle(
            (this.x * GRID_SIZE), (this.y * GRID_SIZE),
            GRID_SIZE, GRID_SIZE,
            { roughness: 2.8, fill: this.colour }
        );
    }

    moveRubyIfPresent() {
        if (ruby.player === this) {
            ruby.x = this.x + 20;
            ruby.y = this.y + 20;
        }
    }

    pickUpRubyIfPresent() {
        if (ruby && (ruby.x == this.x + 20) && (ruby.y == this.y + 20)) {
            ruby.player = this;
        }
    }

    tryMove(x, y) {
        if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) {
            return;
        }

        if (gate.on(x, y) && !gate.canPass(this)) {
            console.log(`${this.colour}: NONE SHALL PASS!!!1`);
            return;
        }

        if (!land.some((l) => l.on(x, y))) {
            console.log(`${this.colour}: TRIED TO FALL OFF THE WORLD!`);
            return;
        }

        this.x = x;
        this.y = y;

        ruby.tryPickup(this);
        ruby.tryMove(this);

        for (let key of keys) {
            key.tryPickup(this);
            key.tryMove(this);
        }
    }

    moveUp() {
        this.tryMove(this.x, this.y - 1);
    }

    moveDown() {
        this.tryMove(this.x, this.y + 1);
    }

    moveLeft() {
        this.tryMove(this.x - 1, this.y);
    }

    moveRight() {
        this.tryMove(this.x + 1, this.y);
    }
}

const io = require('socket.io')(HTTP_LISTEN_PORT, {
    cors: {
        origin: `http://localhost:${CLIENT_PORT}`,
        methods: ['GET', 'POST']
    }
});

const canvas = require('canvas').createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasContext = canvas.getContext('2d');
const roughCanvas = require('roughjs').canvas(canvas);

let land = [
    new Island(9, 0, 6, 5, true),
    new Island(0, 7, 6, 5, true),
    new Platform(6, 9, 12, 1),
    new Island(18, 7, 6, 5, true),
    new Platform(12, 10, 1, 2),
    new Island(8, 12, 8, 7, false)
];
let keys = [];
let gate = new Gate(12, 11);
let ruby = new Ruby(12, 15);

let spawnCoordinates = [];
for (l of land) {
    spawnCoordinates.push(...l.getSpawnCoordinates());
}
console.log(spawnCoordinates);

keys = [];
for (i = 0; i < 3; ++i) {
    const spawnCoordinates = chooseSpawnCoordinates();
    keys.push(new Key(spawnCoordinates.x, spawnCoordinates.y));
}

// TODO: tidy up players that have disconnected...!
let players = new Map();

function chooseSpawnCoordinates()
{
    return spawnCoordinates[Math.floor(Math.random() * spawnCoordinates.length)];
}

function redrawPlayingField() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let l of land) {
        l.draw(roughCanvas);
    }

    for (let [_, player] of players) {
        player.draw(roughCanvas);
    }

    ruby.draw(roughCanvas);

    gate.draw(roughCanvas);

    for (let key of keys) {
        key.draw(roughCanvas);
    }
}

io.on('connection', (client) => {
    // TODO: use disconnect to remove players!
    console.log('A user connected!!');

    client.on('disconnect', () => {
        console.log('A user disconnected!!');
    });

    client.on('join', (playerId, callback) => {
        console.log(`join: ${playerId}`);

        if (players.has(playerId)) {
            const text = `Requested player ${playerId}, which is already in use!`
            console.log(text);
            callback({ okay: false, text: text});
            return;
        }

        console.log(`Creating new player: ${playerId}!!`);

        const spawnCoordinates = chooseSpawnCoordinates();

        const player = new Player(playerId, spawnCoordinates.x, spawnCoordinates.y);
        players.set(playerId, player);
        redrawPlayingField();
        callback({ okay: true, text: 'okay'});
    });

    client.on('leave', (playerId) => {
        console.log(`leave: ${playerId}`)

        if (!players.has(playerId)) {
            console.log(`Requested to delete player ${playerId}, which does not exist!`);
            return;
        }

        players.delete(playerId);
        redrawPlayingField();
    });

    client.on('refresh', () => {
        console.log('client requested refresh');
        client.emit('refresh', canvas.toDataURL());
    });

    client.on('action', (playerId, action) => {
        console.log(`playerId: ${playerId} action: ${action}`);

        if (!players.has(playerId)) {
            console.warn(`Requested to control player ${playerId}, which doesn't exist!`);
            return;
        }

        const player = players.get(playerId);

        switch (action) {
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
                console.warn(`Unknown action ${action} for player ${playerId}`)
                return;
        }

        redrawPlayingField();
        client.emit('refresh', canvas.toDataURL());
    });
});
