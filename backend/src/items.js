import { GRID_SIZE } from './definitions.js'

const RUBY_RADIUS = GRID_SIZE / 4;
const KEY_CIRCLE_RADIUS = GRID_SIZE / 8;
const KEY_CIRCLE_HOLE_RADIUS = KEY_CIRCLE_RADIUS / 2;

// Superclass for things that the player can pick up (or steal!) and carry around with them.
class Item {
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

class Key extends Item {
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

class Ruby extends Item {
    // Dropped on death of player
    // Must be taken back to the player's machine in order to win
    constructor(x, y) {
        super('ruby');
        this.x = x;
        this.y = y;
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

export { Key, Ruby };
