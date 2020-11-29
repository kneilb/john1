async function sendKeyToServer(key) {
    try {
        const response = await fetch('/', {
            method: 'post',
            body: key
        });
        console.log('Completed!', response);
    }
    catch (error) {
        console.error(`Error: ${error}`);
    }
}

for (key of ["up", "down", "left", "right"]) {
    elementId = `btn-${key}`;
    const element = document.getElementById(elementId);

    element.addEventListener('click', async _ => {
        await(sendKeyToServer(key));
    });
}
