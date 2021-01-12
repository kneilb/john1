import { DEFAULT_PLAYERS } from './definitions.js';
import { Key, Ruby } from './items.js';
import { Gate, Island, Platform } from './land.js';
import { Player, Machine } from './player.js';

// TODO: multiple rubies?
class GameMap {
    constructor() {
        this.gates = [];
        this.keys = [];
        this.land = [];
        this.machines = new Map();
        this.players = new Map();
        this.ruby = null;
        this.spawnCoordinates = [];
    }

    parse(mapData) {
        for (const item of mapData) {
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

        for (const l of this.land) {
            this.spawnCoordinates.push(...l.getSpawnCoordinates());
        }

        // 2nd pass; dependencies (spawn coordinates, ruby)
        for (const item of mapData) {
            switch (item.type) {
                case 'key':
                    this.keys.push(Key.parse(item, () => this.chooseSpawnCoordinates()));
                    break;
                case 'machine':
                    const machine = Machine.parse(item, this.ruby, () => this.chooseSpawnCoordinates());
                    this.machines.set(machine.colour, machine);
                    break;
                case 'player':
                    const socket = null; // Socket will be filled in when a player connects.
                    const player = Player.parse(item, socket, () => this.chooseSpawnCoordinates());
                    this.players.set(player.colour, player);
                    break;
            }
        }

        // 3rd pass; dependencies (keys!)
        for (const item of mapData) {
            switch (item.type) {
                case 'gate':
                    this.gates.push(Gate.parse(item, this.keys));
                    break;
            }
        }

        // Create default players & machines if none were specified
        if (this.machines.size === 0) {
            for (const c of DEFAULT_PLAYERS) {
                const item = { colour: c };
                const machine = Machine.parse(item, this.ruby, () => this.chooseSpawnCoordinates());
                this.machines.set(machine.colour, machine);
            }
        }
        if (this.players.size === 0) {
            for (const c of DEFAULT_PLAYERS) {
                const item = { colour: c };
                const player = Player.parse(item, null, () => this.chooseSpawnCoordinates());
                this.players.set(player.colour, player);
            }
        }
    }

    static assign(target, source) {
        target.gates = [...source.gates];
        target.keys = [...source.keys];
        target.land = [...source.land];
        target.ruby = new Ruby(source.ruby.x, source.ruby.y);

        target.machines = new Map();
        target.players = new Map();

        return target;
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

export { GameMap };
