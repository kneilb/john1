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

class Island {
    // belongs to a player
    // has their machine
    // a key spawns here
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    onIsland(x, y) {
        return (x >= this.x && x < (this.x + this.width) &&
                y >= this.y && y < (this.y + this.height));
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

class Platform {
    // connects islands
}

class Machine {
}

class Key {
    // Dropped on death of player
    // 1 spawns on each player's island
    // Must be taken to the gate to unlock it
    constructor(id) {
        this.id = id;
        this.x = id;
        this.y = id;
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
    constructor() {
        this.x = 10;
        this.y = 15;
    }

    checkLocation(x, y) {
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

    constructor() {
        this.x = 4;
        this.y = 4;
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
    constructor(colour) {
        this.x = 0;
        this.y = 0;
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

        if (gate.checkLocation(x, y) && !gate.canPass(this)) {
            console.log(`${this.colour}: NONE SHALL PASS!!!1`);
            return;
        }

        if (!islands.some((island) => island.onIsland(x, y))) {
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

let islands = [
    new Island(0, 0, 6, 5),
    new Island(7, 6, 6, 5),
    new Island(0, 6, 6, 5),
    new Island(7, 0, 6, 5)
]
let keys = [new Key(1), new Key(2), new Key(3)];
let gate = new Gate();
let ruby = new Ruby();

// TODO: tidy up players that have disconnected...!
let players = new Map();

function redrawPlayingField() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let island of islands) {
        island.draw(roughCanvas);
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

        const player = new Player(playerId);
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
