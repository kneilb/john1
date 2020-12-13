import React, {useState, useEffect} from 'react';

function Action(props) {
    return (
        <button
            id={props.id}
            type=''
            onClick={() => { props.onClick(props.id); }}>
            {props.name}
        </button>
    );
}

export default function Game(props) {

    const [canvasSource, setCanvasSource] = useState();

    useEffect(() => {
        async function fetchData() {
            const image = await getGameCanvas();

            setCanvasSource(image);
        }
        fetchData();
    }, [setCanvasSource]);

    useEffect(() => {
        const addKeyHandler = () => {
            window.addEventListener('keyup', handleKey);
        }
        addKeyHandler();
    }, []);

    // TODO: factor out
    async function getGameCanvas() {
        try {
            const response = await fetch('/api/game');

            return await response.text();
        }
        catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    // TODO: factor out
    async function sendCommand(command) {
        try {
            const response = await fetch(`/api/game/${props.playerId}/${command}`, {
                method: 'put'
            });

            if (response.status !== 200) {
                return;
            }

            const newSource = await response.text();
            setCanvasSource(newSource);
        }
        catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async function deletePlayer(playerId) {
        try {
            const response = await fetch(`/api/game/${playerId}`, {
                method: 'delete'
            });

            return response.status;
        }
        catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async function handleClick(id) {
        console.log(`click? ${id}`);

        await sendCommand(id);
    }

    async function handleExit(id) {
        console.log('EXIT');

        const status = await deletePlayer(props.playerId);
        if (status !== 200) {
            console.log(status);
            return;
        }

        props.onExit();
    }

    async function handleKey(event) {
        event.preventDefault();

        console.log(event.key);
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                await sendCommand('up');
                break;
            case 's':
            case 'ArrowDown':
                await sendCommand('down');
                break;
            case 'a':
            case 'ArrowLeft':
                await sendCommand('left');
                break;
            case 'd':
            case 'ArrowRight':
                await sendCommand('right');
                break;
            default:
                break;
        }
    }

    return (
        <div>
            <img id='canvas' alt='game goes here!' src={canvasSource} />
            <Action id='up' name='Up' onClick={handleClick} />
            <Action id='down' name='Down' onClick={handleClick} />
            <Action id='left' name='Left' onClick={handleClick} />
            <Action id='right' name='Right' onClick={handleClick} />
            <Action id='exit' name='Exit' onClick={handleExit} />
        </div>
    );
}
