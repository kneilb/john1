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
            sendKeyToServer('up');
            break;
        case 's':
        case 'S':
            sendKeyToServer('down');
            break;
        case 'a':
        case 'A':
            sendKeyToServer('left');
            break;
        case 'd':
        case 'D':
            sendKeyToServer('right');
            break;

    }
}, false);

const BUTTON_IDS = ['up', 'down', 'left', 'right'];

for (buttonId of BUTTON_IDS) {
    const element = document.getElementById(buttonId);

    element.addEventListener('click', (event) => {
        sendKeyToServer(event.path[0].id);
    });
}
