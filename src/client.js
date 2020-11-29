async function sendKeyToServer(key) {
    try {
        const response = await fetch('/', {
            method: 'post',
            body: key
        });

        const text = await response.text();

        const canvas = document.getElementById('canvas');
        canvas.src = text;
        console.log('Completed!', response);
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
}

window.addEventListener('keypress', (event) => {
    switch (event.key) {
        case 'w':
        case 'W':
            sendKeyToServer("up");
            break;
        case 's':
        case 'S':
            sendKeyToServer("down");
            break;
        case 'a':
        case 'A':
            sendKeyToServer("left");
            break;
        case 'd':
        case 'D':
            sendKeyToServer("right");
            break;

    }
}, false);

// const KEYS = ['up', 'down', 'left', 'right'];

// for (key of KEYS) {
//     elementId = `btn-${key}`;
//     var element = document.getElementById(elementId);

//     element.addEventListener('click', async _ => {
//         await(sendKeyToServer(key));
//     });
// }

const up = document.getElementById('btn-up');
up.addEventListener('click', async _ => {
    await sendKeyToServer("up");
});

const down = document.getElementById('btn-down');
down.addEventListener('click', async _ => {
    await sendKeyToServer("down");
});

const left = document.getElementById('btn-left');
left.addEventListener('click', async _ => {
    await sendKeyToServer("left");
});

const right = document.getElementById('btn-right');
right.addEventListener('click', async _ => {
    await sendKeyToServer("right");
});
