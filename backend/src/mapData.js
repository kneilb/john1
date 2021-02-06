const LEVEL_1 = [
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
        type: 'gate', x: 12, y: 11, colour: 'yellow', count: 3
    }, {
        type: 'key', colour: 'yellow'
    }, {
        type: 'key', colour: 'yellow'
    }, {
        type: 'key', colour: 'yellow'
    }, {
        type: 'player', colour: 'orange', x: 0, y: 8
    }, {
        type: 'machine', colour: 'orange', x: 0, y: 9
    }, {
        type: 'player', colour: 'blue', x: 23, y: 8
    }, {
        type: 'machine', colour: 'blue', x: 23, y: 9
    }, {
        type: 'player', colour: 'red', x: 12, y: 1
    }, {
        type: 'machine', colour: 'red', x: 13, y: 1
    }
]

let LEVEL_2 = [...LEVEL_1];
LEVEL_2.push({ type: 'key', colour: 'red', x: 0, y: 7 });
LEVEL_2.push({ type: 'key', colour: 'red', x: 23, y: 7 });
LEVEL_2.push({ type: 'gate', x: 12, y: 10, colour: 'red', count: 1 });

export { LEVEL_1, LEVEL_2 };
