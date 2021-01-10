import { Gate, Island, Platform } from './land.js';
import { Key, Ruby } from './items.js';
import { Player, Machine } from './player.js';

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

        for (let l of this.land) {
            this.spawnCoordinates.push(...l.getSpawnCoordinates());
        }

        // 2nd pass; dependencies (spawn coordinates!)
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

        // 3rd pass; dependencies (keys!)
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

export { GameMap, DEFAULT_MAP_DATA };
