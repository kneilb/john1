const HTTP_LISTEN_PORT = 1337;
const CLIENT_PORT = 3000;

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const PLAYER_HEIGHT = 40;
const PLAYER_WIDTH = 40;
const PLAYER_MOVEMENT = 40;

const RUBY_RADIUS = 20;

class Island {
    // belongs to a player
    // has their machine
    // a key spawns here
}

class Platform {
    // connects islands
}

class Machine {
}

class Key {
    // Dropped on death of player
    // 1 spawns on each player's island
}

class Gate {
    // Needs 3 keys to open
    // Leads to the island with the ruby
}

class Ruby {
    // Dropped on death of player
    // Must be taken back to the player's machine in order to win

    constructor() {
        this.x = 220;
        this.y = 220;
        this.player = null;
    }

    draw(roughCanvas) {
        roughCanvas.circle(this.x, this.y, 
            RUBY_RADIUS, {
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
            this.x, this.y,
            PLAYER_WIDTH, PLAYER_HEIGHT,
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

    moveUp() {
        this.y -= PLAYER_MOVEMENT;
        this.pickUpRubyIfPresent();
        this.moveRubyIfPresent();
    }

    moveDown() {
        this.y += PLAYER_MOVEMENT;
        this.pickUpRubyIfPresent();
        this.moveRubyIfPresent();
    }

    moveLeft() {
        this.x -= PLAYER_MOVEMENT;
        this.pickUpRubyIfPresent();
        this.moveRubyIfPresent();
    }

    moveRight() {
        this.x += PLAYER_MOVEMENT;
        this.pickUpRubyIfPresent();
        this.moveRubyIfPresent();
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

let ruby = new Ruby();

// TODO: tidy up players that have disconnected...!
let players = new Map();

function redrawPlayingField() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for (let [_, player] of players) {
        player.draw(roughCanvas);
    }

    ruby.draw(roughCanvas);
}
 
io.on('connection', (client) => {
    client.on('join', (playerId) => {
        console.log(`join: ${playerId}`);

        if (players.has(playerId)) {
            console.log(`Requested player ${playerId}, which is already in use!`);
            return;
        }
    
        console.log(`Creating new player: ${playerId}!!`);
    
        const player = new Player(playerId);
        players.set(playerId, player);
        redrawPlayingField();
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
