const HTTP_LISTEN_PORT = 1337;

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const GRID_SIZE = 40;

// Minus 1 because when in cell (0, 0), extents are (GRID_SIZE, GRID_SIZE).
const X_MIN = 0;
const X_MAX = Math.floor(CANVAS_WIDTH / GRID_SIZE) - 1;
const Y_MIN = 0;
const Y_MAX = Math.floor(CANVAS_HEIGHT / GRID_SIZE) - 1;

const RUBY_RADIUS = GRID_SIZE / 4;
const KEY_CIRCLE_RADIUS = GRID_SIZE / 8;
const GATE_RADIUS = GRID_SIZE / 2;

class Coords {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
                    coords.push(new Coords(x, y));
                }
            }
        }

        return coords;
    }

    on(x, y) {
        return (x >= this.x && x < (this.x + this.width) &&
            y >= this.y && y < (this.y + this.height));
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
}

class Platform extends Land {
    // connects islands
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
}

class Machine {
    // take the ruby to your machine to win!
    constructor(colour, x, y) {
        this.colour = colour;
        this.x = x;
        this.y = y;
    }

    tryWin(player) {
        if (player.x === this.x && player.y === this.y) {
            if (this.colour === player.colour) {
                if (ruby.player === player) {
                    console.log(`The cunning player ${player.colour} WON THE GAME!!!1`);
                }
                else {
                    console.log(`Sorry mate, you don't have the ruby!`);
                }
            }
            else {
                console.log(`Sorry mate, this isn't your machine!`);
            }
        }
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
}

// Superclass for things that the player can pick up (or steal!) and carry around with them.
class Carryable {
    constructor(type) {
        this.player = null;
        this.type = type;
    }

    tryPickup(player) {
        if ((this.x === player.x) && (this.y === player.y)) {
            if (this.player === null) {
                console.log(`${player.colour}: picked up a ${this.type}!`);
            }
            else if (this.player !== player) {
                console.log(`${player.colour}: stole a ${this.type} from ${this.player.colour}!`);
            }

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

class Key extends Carryable {
    // Dropped on death of player
    // 1 spawns on each player's island
    // Must be taken to the gate to unlock it
    constructor(x, y) {
        super('key');
        this.x = x;
        this.y = y;
    }

    draw(canvasContext) {
        canvasContext.save();
        canvasContext.translate(this.x * GRID_SIZE, this.y * GRID_SIZE);

        canvasContext.beginPath();

        canvasContext.arc(
            KEY_CIRCLE_RADIUS, KEY_CIRCLE_RADIUS,
            KEY_CIRCLE_RADIUS, 0, Math.PI * 2, false
        );

        canvasContext.fillStyle = 'yellow';
        canvasContext.fill();

        canvasContext.beginPath();

        canvasContext.moveTo(KEY_CIRCLE_RADIUS, KEY_CIRCLE_RADIUS);
        canvasContext.lineTo(KEY_CIRCLE_RADIUS * 4, KEY_CIRCLE_RADIUS);
        canvasContext.lineTo(KEY_CIRCLE_RADIUS * 4, KEY_CIRCLE_RADIUS * 2);
        canvasContext.moveTo(KEY_CIRCLE_RADIUS * 3, KEY_CIRCLE_RADIUS);
        canvasContext.lineTo(KEY_CIRCLE_RADIUS * 3, KEY_CIRCLE_RADIUS * 2);
        canvasContext.moveTo(KEY_CIRCLE_RADIUS * 7 / 2, KEY_CIRCLE_RADIUS);
        canvasContext.lineTo(KEY_CIRCLE_RADIUS * 7 / 2, KEY_CIRCLE_RADIUS * 2);

        canvasContext.strokeStyle = 'yellow';
        canvasContext.stroke();

        canvasContext.restore();
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
        return keys.every(key => key.player == player);
    }

    draw(canvasContext) {
        canvasContext.beginPath();

        canvasContext.arc(
            (this.x * GRID_SIZE) + (GRID_SIZE / 2),
            (this.y * GRID_SIZE) + (GRID_SIZE / 2),
            GATE_RADIUS, 0, Math.PI * 2, false
        );

        canvasContext.fillStyle = 'brown';
        canvasContext.fill();
    }
}

// draw a heart! <3
// ctx.beginPath();
// ctx.moveTo(75, 40);
// ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
// ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
// ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
// ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
// ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
// ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
// ctx.fill();

class Ruby extends Carryable {
    // Dropped on death of player
    // Must be taken back to the player's machine in order to win
    constructor(x, y) {
        super('ruby');
        this.x = x;
        this.y = y;
    }

    draw(canvasContext) {
        canvasContext.beginPath();

        canvasContext.arc(
            (this.x * GRID_SIZE) + (GRID_SIZE / 2),
            (this.y * GRID_SIZE) + (GRID_SIZE / 2),
            RUBY_RADIUS, 0, Math.PI * 2, false
        );

        canvasContext.fillStyle = 'red';
        canvasContext.fill();
        canvasContext.strokeStyle = 'black';
        canvasContext.stroke();
    }
}

class Player {
    constructor(colour, x, y) {
        this.x = x;
        this.y = y;
        this.colour = colour;
    }

    draw(canvasContext) {
        canvasContext.fillStyle = this.colour;

        canvasContext.fillRect(
            this.x * GRID_SIZE, this.y * GRID_SIZE,
            GRID_SIZE, GRID_SIZE
        );
    }

    tryMove(x, y) {
        if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) {
            console.log(`${this.colour}: WANTED TO LEAVE THIS REALITY BEHIND!`);
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

        for (let [_, m] of machines) {
            m.tryWin(this);
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

const io = require('socket.io')(HTTP_LISTEN_PORT);

const canvas = require('canvas').createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const canvasContext = canvas.getContext('2d');

let land = [
    new Island(9, 0, 6, 5, true),
    new Platform(3, 3, 6, 1),
    new Platform(3, 4, 1, 3),
    new Platform(15, 3, 6, 1),
    new Platform(20, 4, 1, 3),
    new Island(0, 7, 6, 5, true),
    new Platform(6, 9, 12, 1),
    new Island(18, 7, 6, 5, true),
    new Platform(12, 10, 1, 2),
    new Island(8, 12, 8, 7, false)
];
let gate = new Gate(12, 11);
let ruby = new Ruby(12, 15);

let spawnCoordinates = [];
for (l of land) {
    spawnCoordinates.push(...l.getSpawnCoordinates());
}

let keys = [];
for (i = 0; i < 3; ++i) {
    const spawnCoordinates = chooseSpawnCoordinates();
    keys.push(new Key(spawnCoordinates.x, spawnCoordinates.y));
}

// TODO: tidy up players that have disconnected (& their machines)...!
let players = new Map();
let machines = new Map();

function chooseSpawnCoordinates() {
    return spawnCoordinates[Math.floor(Math.random() * spawnCoordinates.length)];
}

function redrawPlayingField() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let l of land) {
        l.draw(canvasContext);
    }

    gate.draw(canvasContext);

    for (let [_, m] of machines) {
        m.draw(canvasContext);
    }

    for (let [_, p] of players) {
        p.draw(canvasContext);
    }

    ruby.draw(canvasContext);

    for (let k of keys) {
        k.draw(canvasContext);
    }
}

io.on('connection', (socket) => {
    // TODO: use disconnect to remove players!
    console.log('A user connected!!');

    socket.on('disconnect', () => {
        console.log('A user disconnected!!');
    });

    socket.on('join', (playerId, callback) => {
        console.log(`join: ${playerId}`);

        if (players.has(playerId)) {
            const text = `Requested player ${playerId}, which is already in use!`
            console.log(text);
            callback({ okay: false, text: text });
            return;
        }

        console.log(`Creating new player: ${playerId}!!`);

        const playerSpawnCoordinates = chooseSpawnCoordinates();

        const player = new Player(playerId, playerSpawnCoordinates.x, playerSpawnCoordinates.y);
        players.set(playerId, player);

        const machineSpawnCoordinates = chooseSpawnCoordinates();
        const machine = new Machine(playerId, machineSpawnCoordinates.x, machineSpawnCoordinates.y);
        machines.set(playerId, machine);

        redrawPlayingField();
        callback({ okay: true, text: 'okay' });
        io.emit('refresh', canvas.toDataURL());
    });

    socket.on('leave', (playerId) => {
        console.log(`leave: ${playerId}`)

        if (!players.has(playerId)) {
            console.log(`Requested to delete player ${playerId}, which does not exist!`);
            return;
        }

        machines.delete(playerId);
        players.delete(playerId);
        redrawPlayingField();
        io.emit('refresh', canvas.toDataURL());
    });

    socket.on('refresh', () => {
        console.log('client requested refresh');
        socket.emit('refresh', canvas.toDataURL());
    });

    socket.on('action', (playerId, action) => {
        console.log(`${playerId}: ${action}`);

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
            default:
                console.warn(`${playerId}: Unknown action ${action}!?`)
                return;
        }

        redrawPlayingField();
        io.emit('refresh', canvas.toDataURL());
    });
});
