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
const KEY_CIRCLE_HOLE_RADIUS = KEY_CIRCLE_RADIUS / 2;
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

    toString() {
        return `{ Machine [${this.x},${this.y}] ${this.colour} }`
    }
}

// Superclass for things that the player can pick up (or steal!) and carry around with them.
class CanBeCarried {
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

class Key extends CanBeCarried {
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

        canvasContext.arc(
            KEY_CIRCLE_RADIUS, KEY_CIRCLE_RADIUS,
            KEY_CIRCLE_HOLE_RADIUS, 0, Math.PI * 2, false
        );

        canvasContext.fillStyle = 'black';
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

    static parse(data, chooseSpawnCoordinates) {
        if (!Number.isInteger(data.x) || !Number.isInteger(data.y)) {
            const spawnCoordinates = chooseSpawnCoordinates();
            data.x = spawnCoordinates.x;
            data.y = spawnCoordinates.y;
        }
        return new Key(data.x, data.y);
    }
}

class Gate {
    // Needs 3 keys to open
    // Leads to the island with the ruby
    constructor(x, y, keys) {
        this.x = x;
        this.y = y;
        this.keys = keys;
    }

    on(x, y) {
        return x === this.x && y === this.y;
    }

    canPass(player) {
        return this.keys.every((key) => key.player == player);
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

    static parse(data, keys) {
        // TODO: colour handling (multi-gate); choose matching keys!
        return new Gate(data.x, data.y, keys);
    }

    toString() {
        return `{Gate [${this.x},${this.y}] keys=${this.keys}}`;
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

class Ruby extends CanBeCarried {
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

    static parse(data) {
        return new Ruby(data.x, data.y);
    }

    toString() {
        return `{Ruby [${this.x},${this.y}]}`;
    }
}

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
}

const DEFAULT_MAP_DATA = [
    {
        type: 'island', x: 9, y: 0, width: 6, height: 5, canSpawn: true
    }, {
        type: 'platform', x: 3, y: 3, width: 6, height: 1
    }, {
        type: 'platform', x: 3, y: 4, width: 1, height: 3
    }, {
        type: 'platform', x: 15, y: 3, width: 6, height: 1
    }, {
        type: 'platform', x: 20, y: 4, width: 1, height: 3
    }, {
        type: 'island', x: 0, y: 7, width: 6, height: 5, canSpawn: true
    }, {
        type: 'platform', x: 6, y: 9, width: 12, height: 1
    }, {
        type: 'island', x: 18, y: 7, width: 6, height: 5, canSpawn: true
    }, {
        type: 'platform', x: 12, y: 10, width: 1, height: 2
    }, {
        type: 'island', x: 8, y: 12, width: 8, height: 7, canSpawn: false
    }, {
        type: 'ruby', x: 12, y: 15
    }, {
        type: 'gate', x: 12, y: 11, colour: 'yellow'
    }, {
        type: 'key', colour: 'yellow'
    }, {
        type: 'key', colour: 'yellow'
    }, {
        type: 'key', colour: 'yellow'
    }
]

// TODO: multiple gates
// TODO: gates that require subset of keys (via colours)
// TODO: multiple rubies?
// TODO: forced spawn points of machines
// TODO: forced spawn points of players
// TODO: forced spawn points of keys
class GameMap {
    constructor() {
        this.gate = null;
        this.keys = [];
        this.land = [];
        this.machines = new Map();
        this.players = new Map();
        this.ruby = null;
        this.spawnCoordinates = [];
    }

    parseJson(jsonData) {
        this.parse(JSON.parse(jsonData));
    }

    parse(mapData) {
        console.log(mapData);
        for (const item of mapData) {
            console.log(item);
            switch (item.type) {
                case 'island':
                    this.land.push(Island.parse(item));
                    break;
                case 'platform':
                    this.land.push(Platform.parse(item));
                    break;
                case 'ruby':
                    this.ruby = Ruby.parse(item);
                    break;
            }
        }

        for (let l of this.land) {
            this.spawnCoordinates.push(...l.getSpawnCoordinates());
        }

        // 2nd phase; dependencies (spawn coordinates!)
        for (const item of mapData) {
            switch (item.type) {
                case 'key':
                    this.keys.push(Key.parse(item, () => this.chooseSpawnCoordinates()));
                    break;
                case 'machine':
                    const machine = Machine.parse(item, () => this.chooseSpawnCoordinates());
                    this.machines.set(machine.id, machine);
                    break;
                case 'player':
                    const player = Player.parse(item, () => this.chooseSpawnCoordinates());
                    this.players.set(player.id, player);
                    break;
            }
        }

        // 3rd phase; dependencies (keys!)
        for (const item of mapData) {
            switch (item.type) {
                case 'gate':
                    this.gate = Gate.parse(item, this.keys);
                    break;
            }
        }
    }

    // Pick coordinates to spawn "something"
    // Removes items from the list to ensure more than one thing cannot spawn on the same spot
    chooseSpawnCoordinates() {
        const index = Math.floor(Math.random() * this.spawnCoordinates.length);
        const coords = this.spawnCoordinates[index];
        this.spawnCoordinates.splice(index, 1);
        return coords;
    }
}

class Game {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.canvas = require('canvas').createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.canvasContext = this.canvas.getContext('2d');

        this.map = new GameMap();
        this.map.parse(DEFAULT_MAP_DATA);
        Object.assign(this, this.map);
    }

    redrawPlayingField() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let l of this.land) {
            l.draw(this.canvasContext);
        }

        this.gate.draw(this.canvasContext);

        for (let [_, m] of this.machines) {
            m.draw(this.canvasContext);
        }

        for (let [_, p] of this.players) {
            p.draw(this.canvasContext);
        }

        this.ruby.draw(this.canvasContext);

        for (let k of this.keys) {
            k.draw(this.canvasContext);
        }

        io.to(this.id).emit('refresh', this.canvas.toDataURL());
    }

    hasPlayer(playerId) {
        return this.players.has(playerId);
    }

    newPlayer(playerId, socket) {
        const playerSpawnCoordinates = this.map.chooseSpawnCoordinates();
        const player = new Player(playerId, socket, playerSpawnCoordinates.x, playerSpawnCoordinates.y);
        this.players.set(playerId, player);

        const machineSpawnCoordinates = this.map.chooseSpawnCoordinates();
        const machine = new Machine(playerId, machineSpawnCoordinates.x, machineSpawnCoordinates.y, this.ruby);
        this.machines.set(playerId, machine);

        player.socket.join(this.id);
        this.redrawPlayingField();

        return player;
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        player.socket.leave(this.id);

        this.machines.delete(playerId);
        this.players.delete(playerId);

        this.redrawPlayingField();
    }

    action(playerId, action) {
        if (!this.players.has(playerId)) {
            console.warn(`Requested to control player ${playerId}, which doesn't exist!`);
            return;
        }

        const player = this.players.get(playerId);
        let newX = player.x;
        let newY = player.y;

        switch (action) {
            case 'up':
                newY -= 1;
                break;
            case 'down':
                newY += 1;
                break;
            case 'left':
                newX -= 1;
                break;
            case 'right':
                newX += 1;
                break;
            default:
                console.warn(`${playerId}: Unknown action ${action}!?`);
                return;
        }

        if (this.tryMove(player, newX, newY)) {
            this.redrawPlayingField();
        }
    }

    tryMove(player, x, y) {
        if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) {
            console.log(`${player.colour}: WANTED TO LEAVE THIS REALITY BEHIND!`);
            return false;
        }

        if (!this.land.some((l) => l.on(x, y))) {
            console.log(`${player.colour}: TRIED TO FALL OFF THE WORLD!`);
            return false;
        }

        if (this.gate.on(x, y) && !this.gate.canPass(player)) {
            let message = `NONE SHALL PASS!!!1`;
            console.log(`${player.colour}: ${message}`);
            player.socket.emit('message', message);
            return false;
        }

        player.x = x;
        player.y = y;

        this.ruby.tryPickup(player);
        this.ruby.tryMove(player);

        for (let k of this.keys) {
            k.tryPickup(player);
            k.tryMove(player);
        }

        for (let [_, m] of this.machines) {
            if (m.tryWin(player)) {
                let message = `The cunning player ${player.colour} WON THE GAME!!!1`;
                console.log(message);
                io.to(this.id).emit('message', message);
            }
        }

        return true;
    }
}

const { v4: uuid } = require('uuid');
const io = require('socket.io')(HTTP_LISTEN_PORT);

let games = new Map();
games.set('game1', new Game('game1', 'The First Game'));

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected!!`);

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected!!`);
        // TODO: use disconnect to remove players!?
        // Or use cookies??
    });

    socket.on('join', (playerId, gameId, callback) => {
        console.log(`join: ${playerId} to ${gameId}`);

        if (!games.has(gameId)) {
            const text = `Requested to join game ${gameId}, which does not exist!`;
            console.log(`join: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const game = games.get(gameId);

        if (game.hasPlayer(playerId)) {
            const text = `Requested to join as player ${playerId}, which is already in use!`;
            console.log(`join: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        console.log(`Creating new player: ${playerId}!!`);

        game.newPlayer(playerId, socket);

        socket.gameId = gameId;
        socket.playerId = playerId;

        callback({ okay: true });
    });

    socket.on('leave', (callback) => {
        const gameId = socket.gameId || null;
        const playerId = socket.playerId || null;

        console.log(`leave: ${playerId} from ${gameId}`);

        if (!games.has(gameId)) {
            const text = `Requested to leave game ${gameId}, which does not exist!`;
            console.log(`leave: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const game = games.get(gameId);

        if (!game.hasPlayer(playerId)) {
            const text = `Requested to remove player ${playerId}, which does not exist!`;
            console.log(`leave: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        game.removePlayer(playerId);
        callback({ okay: true });

        // Delete game if everyone has left
        // if (!game.players) {
        //     console.log(`leave: deleting empty game ${gameId}`);
        //     games.delete(gameId);
        // }
    });

    socket.on('refresh', () => {
        const gameId = socket.gameId || null;

        if (!games.has(gameId)) {
            return;
        }

        const game = games.get(gameId);

        console.log(`${socket.id} requested refresh`);
        socket.emit('refresh', game.canvas.toDataURL());
    });

    socket.on('action', (action) => {
        const gameId = socket.gameId || null;
        const playerId = socket.playerId || null;

        console.log(`action: ${gameId} ${playerId} -> ${action}`);

        if (!games.has(gameId)) {
            return;
        }

        const game = games.get(gameId);

        game.action(playerId, action);
    });

    socket.on('getGames', (callback) => {
        let games_list = [];

        for (let [gameId, gameData] of games) {
            games_list.push({ id: gameId, name: gameData.name });
        }

        callback(games_list);
    });

    socket.on('createGame', (gameData, callback) => {
        console.log(`createGame: ${gameData}`);

        if (!gameData.id) {
            gameData.id = uuid();
        }

        const gameId = gameData.id;

        if (!gameData.name) {
            const text = `Invalid gameData (no name): ${gameData}`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        const gameName = gameData.name;

        if (games.has(gameId)) {
            const text = `Requested to create game ${gameId}, which already exists!`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        if ([...games.values()].some((g) => g.name == gameName)) {
            const text = `Requested to create game called ${gameName}, which already exists!`;
            console.log(`createGame: ${text}`);
            callback({ okay: false, text: text });
            return;
        }

        // TODO: allow JSON to define "map"?
        games.set(gameId, new Game(gameId, gameName));

        callback({ okay: true });
    });

    socket.on('deleteGame', (gameId, callback) => {
        console.log(`deleteGame: ${gameId}`);

        if (!game.players) {
            console.log(`deleteGame: deleting empty game ${gameId}`);
            games.delete(gameId);
        }

        callback({ okay: true });
    });
});
