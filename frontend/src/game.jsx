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
    async function sendCommand(playerId, control) {
        try {
            const response = await fetch(`/api/game/${playerId}/${control}`, {
                method: 'put'
            });

            if (response.status !== 200) {
                return;
            }

            return await response.text();
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

        const newSource = await sendCommand(props.playerId, id);
        if (newSource) {
            setCanvasSource(newSource);
        }
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
