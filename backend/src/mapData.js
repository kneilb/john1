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
    }
]

let LEVEL_2 = [...LEVEL_1];
LEVEL_2.push({ type: 'key', colour: 'red', x: 0, y: 7 });
LEVEL_2.push({ type: 'key', colour: 'red', x: 23, y: 7 });
LEVEL_2.push({ type: 'gate', x: 12, y: 10, colour: 'red', count: 1 });

let LEVEL_3 = [...LEVEL_1];
LEVEL_3.push({ type: 'player', colour: 'red' });
LEVEL_3.push({ type: 'player', colour: 'purple' });
LEVEL_3.push({ type: 'player', colour: 'orange' });

export { LEVEL_1, LEVEL_2, LEVEL_3 };
