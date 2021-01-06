import React, { useState, useEffect } from 'react';
import * as api from './api';

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
    const [messages, setMessages] = useState();

    useEffect(() => {
        console.log('Subscribe to refresh & messages!');
        api.subscribeToRefresh(setCanvasSource);

        function onMessage(message) {
            console.log(message);
            setMessages(message);
        }
        api.subscribeToMessages(onMessage);

        api.requestRefresh();
    }, []);

    useEffect(() => {
        function handleKey(event) {
            let command = null;

            console.log(event.key);
            switch (event.key) {
                case 'w':
                case 'W':
                case 'ArrowUp':
                    command = 'up';
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    command = 'down';
                    break;
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    command = 'left';
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    command = 'right';
                    break;
                default:
                    break;
            }

            if (command !== null) {
                api.action(props.playerId, command);
            }
        }

        document.addEventListener('keyup', handleKey);

        return () => {
            document.removeEventListener('keyup', handleKey);
        };
    }, [props.playerId]);

    function handleClick(id) {
        console.log(`click? ${id}`);

        api.action(props.playerId, id);
    }

    function handleExit(id) {
        console.log('EXIT');

        api.leave(props.playerId);
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
            <p>{messages}</p>
        </div>
    );
}
