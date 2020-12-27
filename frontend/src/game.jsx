import React, { useState, useEffect } from 'react';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:1338');

function subscribeToTimer(cb) {
    socket.on('timer', timestamp => cb(null, timestamp));
    socket.emit('subscribeToTimer', 1000);
}

async function getGameCanvas() {
    try {
        const response = await fetch('/api/game');

        return await response.text();
    }
    catch (error) {
        console.error(`ERROR!!!1 ${error}`);
    }
}

async function sendCommand(playerId, command) {
    try {
        const response = await fetch(`/api/game/${playerId}/${command}`, {
            method: 'put'
        });

        if (response.status !== 200) {
            return;
        }

        return await response.text();
    }
    catch (error) {
        console.error(`ERROR!!!1 ${error}`);
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
        console.error(`ERROR!!!1 ${error}`);
    }
}

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
        async function handleKey(event) {
            let command = null;
    
            console.log(event.key);
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    command = 'up';
                    break;
                case 's':
                case 'ArrowDown':
                    command = 'down';
                    break;
                case 'a':
                case 'ArrowLeft':
                    command = 'left';
                    break;
                case 'd':
                case 'ArrowRight':
                    command = 'right';
                    break;
                default:
                    break;
            }
    
            if (command !== null) {
                const newCanvasSource = await sendCommand(props.playerId, command);
                setCanvasSource(newCanvasSource);
            }
        }

        document.addEventListener('keyup', handleKey);
    }, [props.playerId]);

    async function handleClick(id) {
        console.log(`click? ${id}`);

        const newCanvasSource = await sendCommand(props.playerId, id);
        setCanvasSource(newCanvasSource);
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
