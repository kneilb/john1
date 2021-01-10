import canvas from 'canvas';
const { createCanvas } = canvas;

import { CANVAS_WIDTH, CANVAS_HEIGHT, X_MIN, X_MAX, Y_MIN, Y_MAX } from './definitions.js';
import { Player, Machine } from './player.js';
import { GameMap, DEFAULT_MAP_DATA } from './map.js';

class Game {
    constructor(id, name, server, mapData = null) {
        this.id = id;
        this.name = name;
        this.server = server;

        this.canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.canvasContext = this.canvas.getContext('2d');

        this.map = new GameMap();
        this.map.parse(mapData ? mapData : DEFAULT_MAP_DATA);

        Object.assign(this, this.map);
        this.players.clear();
        this.machines.clear();
    }

    redrawPlayingField() {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let l of this.land) {
            l.draw(this.canvasContext);
        }

        for (let g of this.gates) {
            g.draw(this.canvasContext);
        }

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

        this.server.to(this.id).emit('refresh', this.canvas.toDataURL());
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
        if (!this.land.some((l) => l.on(x, y))) {
            console.log(`${player.colour}: TRIED TO FALL OFF THE WORLD!`);
            return false;
        }

        for (let gate of this.gates) {
            if (gate.on(x, y) && !gate.canPass(player)) {
                let message = `NONE SHALL PASS YE OLDE ${gate.colour} GATE!!!1`;
                console.log(`${player.colour}: ${message}`);
                player.socket.emit('message', message);
                return false;
            }
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
                this.server.to(this.id).emit('message', message);
            }
        }

        return true;
    }
}

export { Game };
